import { db } from "@/lib/db/index";
import {
  negocio,
  producto,
  cupon,
  cliente,
  productosCategoria,
  categorias,
  cuponEfectivo,
} from "@/lib/db/schema";
import { eq, and, gt, sql } from "drizzle-orm";
import type { Item, User } from "gorsejs";
import { servicioGorse } from "../../servicioGorse";
import { construirItemId } from "./gorseUtilidades";
import { CATALOGO_CATEGORIAS } from "@/lib/api/tiposApi/categoriasProductos.ts";

// ─── Implementación Gorse — Sincronización BD ↔ Gorse ───────────────────────

/**
 * Estrategia de sincronización basada en Gorse.
 *
 * Sin contrato (interfaz) — implementación interna pura.
 * Para exponerla, crear ISincronizacionStrategy con los métodos necesarios
 * y agregarla al Contexto.
 *
 * Orquesta la sincronización entre la base de datos de Baliza (Drizzle + PostgreSQL)
 * y el motor de recomendación Gorse para usuarios, negocios, productos y cupones.
 */
export class GorseSincronizacion {
  /**
   * Sincroniza un cliente de la BD como usuario de Gorse.
   * Se envía con labels que contienen su estado y fecha de ingreso para
   * que el modelo colaborativo pueda aprovecharlos.
   */
  async sincronizarUsuario(idCliente: string): Promise<void> {
    const [clienteDb] = await db
      .select()
      .from(cliente)
      .where(eq(cliente.idCliente, idCliente))
      .limit(1);

    if (!clienteDb) {
      throw new Error(
        `Cliente con ID ${idCliente} no encontrado en la base de datos`
      );
    }

    const usuarioGorse: User = {
      UserId: idCliente,
      Labels: [clienteDb.estadoCliente],
      Comment: `Cliente Baliza — ${clienteDb.numeroCelularCliente}`,
    };

    await servicioGorse.insertarUsuario(usuarioGorse);
  }

  /**
   * Sincroniza todos los clientes activos de la BD hacia Gorse.
   */
  async sincronizarTodosLosUsuarios(): Promise<number> {
    const clientes = await db
      .select()
      .from(cliente)
      .where(eq(cliente.estadoCliente, "ACTIVO"));

    const usuariosGorse: User[] = clientes.map((c) => ({
      UserId: c.idCliente,
      Labels: [c.estadoCliente],
      Comment: `Cliente Baliza — ${c.numeroCelularCliente}`,
    }));

    if (usuariosGorse.length > 0) {
      await servicioGorse.insertarUsuarios(usuariosGorse);
    }

    return usuariosGorse.length;
  }

  /**
   * Sincroniza un negocio activo como ítem de Gorse.
   * Las categorías del negocio se derivan de las categorías de sus productos.
   */
  async sincronizarNegocio(idNegocio: string): Promise<void> {
    const [negocioDb] = await db
      .select()
      .from(negocio)
      .where(eq(negocio.idNegocio, idNegocio))
      .limit(1);

    if (!negocioDb) {
      throw new Error(
        `Negocio con ID ${idNegocio} no encontrado en la base de datos`
      );
    }

    // Obtener categorías únicas de los productos del negocio
    const categoriasDelNegocio = await db
      .selectDistinct({ nombre: categorias.nombreCategoria })
      .from(productosCategoria)
      .innerJoin(producto, eq(productosCategoria.idProducto, producto.idProducto))
      .innerJoin(categorias, eq(productosCategoria.idCategoria, categorias.idCategoria))
      .where(eq(producto.idNegocio, idNegocio));

    const labelsNegocio = categoriasDelNegocio.map((c) => c.nombre).filter((n): n is string => n !== null);

    const parentCategoriesNegocio = new Set<string>();
    labelsNegocio.forEach(tag => {
      const matchingCats = CATALOGO_CATEGORIAS.filter(c => c.categoriasDisponibles.includes(tag));
      matchingCats.forEach(cat => {
        parentCategoriesNegocio.add(cat.nombreEtiqueta);
      });
    });

    const itemGorse: Item = {
      ItemId: construirItemId("negocio", idNegocio),
      IsHidden: negocioDb.estadoNegocio !== "ACTIVO",
      Categories: ["negocio", ...Array.from(parentCategoriesNegocio)],
      Labels: [...labelsNegocio],
      Timestamp: negocioDb.fechaRegistro,
      Comment: negocioDb.descripcionNegocio || negocioDb.nombreNegocio,
    };

    await servicioGorse.insertarOActualizarElemento(itemGorse);
  }

  /**
   * Sincroniza un producto como ítem de Gorse.
   */
  async sincronizarProducto(idProducto: string): Promise<void> {
    const [productoDb] = await db
      .select()
      .from(producto)
      .where(eq(producto.idProducto, idProducto))
      .limit(1);

    if (!productoDb) {
      throw new Error(
        `Producto con ID ${idProducto} no encontrado en la base de datos`
      );
    }

    // Obtener categorías del producto
    const categoriasDelProducto = await db
      .select({ nombre: categorias.nombreCategoria })
      .from(productosCategoria)
      .innerJoin(categorias, eq(productosCategoria.idCategoria, categorias.idCategoria))
      .where(eq(productosCategoria.idProducto, idProducto));

    const labelsProducto = categoriasDelProducto.map((c) => c.nombre).filter((n): n is string => n !== null);

    const parentCategoriesProducto = new Set<string>();
    labelsProducto.forEach(tag => {
      const matchingCats = CATALOGO_CATEGORIAS.filter(c => c.categoriasDisponibles.includes(tag));
      matchingCats.forEach(cat => {
        parentCategoriesProducto.add(cat.nombreEtiqueta);
      });
    });

    const itemGorse: Item = {
      ItemId: construirItemId("producto", idProducto),
      IsHidden: false,
      Categories: ["producto", ...Array.from(parentCategoriesProducto)],
      Labels: [...labelsProducto],
      Timestamp: new Date().toISOString(),
      Comment: `${productoDb.nombreProducto} — ${productoDb.descripcionProducto}`,
    };

    await servicioGorse.insertarOActualizarElemento(itemGorse);
  }

  /**
   * Sincroniza un cupón como ítem de Gorse.
   * Los cupones expirados se marcan como ocultos (IsHidden).
   */
  async sincronizarCupon(idCupon: string): Promise<void> {
    const [cuponDb] = await db
      .select()
      .from(cupon)
      .where(eq(cupon.idCupon, idCupon))
      .limit(1);

    if (!cuponDb) {
      throw new Error(
        `Cupón con ID ${idCupon} no encontrado en la base de datos`
      );
    }

    const estaExpirado = new Date(cuponDb.fechaValidezCupon) < new Date();

    // Contar cupones disponibles (no asignados o no utilizados)
    const [disponibles] = await db
      .select({ count: sql<number>`count(*)` })
      .from(cuponEfectivo)
      .where(
        and(
          eq(cuponEfectivo.idCupon, idCupon),
          eq(cuponEfectivo.cuponUtilizado, false)
        )
      );

    const itemGorse: Item = {
      ItemId: construirItemId("cupon", idCupon),
      IsHidden: estaExpirado || (disponibles?.count ?? 0) === 0,
      Categories: ["cupon", cuponDb.rarezaCupon],
      Labels: [
        cuponDb.tituloCupon,
        cuponDb.descripcionCupon,
        cuponDb.rarezaCupon,
        `negocio:${cuponDb.idNegocio}`,
        `cantidad:${cuponDb.cantidadCupones}`,
      ],
      Timestamp: cuponDb.fechaValidezCupon.toISOString(),
      Comment: `${cuponDb.tituloCupon} [${cuponDb.rarezaCupon}]`,
    };

    await servicioGorse.insertarOActualizarElemento(itemGorse);
  }

  /**
   * Sincroniza masivamente todos los ítems activos (negocios, productos, cupones)
   * hacia Gorse. Ideal para una carga inicial o resincronización completa.
   */
  async sincronizarTodosLosItems(): Promise<{
    negocios: number;
    productos: number;
    cupones: number;
  }> {
    // — Negocios activos —
    const negociosDb = await db
      .select()
      .from(negocio)
      .where(eq(negocio.estadoNegocio, "ACTIVO"));

    for (const n of negociosDb) {
      await this.sincronizarNegocio(n.idNegocio);
    }

    // — Todos los productos —
    const productosDb = await db.select().from(producto);

    for (const p of productosDb) {
      await this.sincronizarProducto(p.idProducto);
    }

    // — Cupones vigentes —
    const cuponesDb = await db
      .select()
      .from(cupon)
      .where(gt(cupon.fechaValidezCupon, new Date()));

    for (const c of cuponesDb) {
      await this.sincronizarCupon(c.idCupon);
    }

    return {
      negocios: negociosDb.length,
      productos: productosDb.length,
      cupones: cuponesDb.length,
    };
  }
}
