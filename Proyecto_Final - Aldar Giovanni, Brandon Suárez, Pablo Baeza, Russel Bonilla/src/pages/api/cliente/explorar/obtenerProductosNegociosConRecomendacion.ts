import { db } from "@/lib/db";
import { producto, negocio } from "@/lib/db/schema";
import {  inArray, eq } from "drizzle-orm";
import {
  crearEndpoint,
  respuestaExitosa,
} from "@/lib";
import type { ProductosPaginadosResponse, ProductoPaginado} from "@/lib/api/tiposApi/explorar";

import {
  sistemaRecomendacion,
  type RecomendacionEnriquecida,
} from "@/lib/sistemaRecomendacion";
import { verificarAutenticacionCliente } from "@/lib/auth/jwtCliente";


// ─── Acceso a datos: Negocios ────────────────────────────────────────────────

async function obtenerIdsNegociosActivos(): Promise<string[]> {
  const negociosDb = await db
    .select({ idNegocio: negocio.idNegocio })
    .from(negocio)
    .where(eq(negocio.estadoNegocio, "ACTIVO"));

  return negociosDb.map((n) => n.idNegocio);
}

// ─── Acceso a datos: Productos ───────────────────────────────────────────────

async function obtenerProductosDeNegocio(idNegocio: string, limit: number) {
  return db.query.producto.findMany({
    where: eq(producto.idNegocio, idNegocio),
    limit: limit + 1,
    with: {
      negocio: {
        columns: {
          idNegocio: true,
          nombreNegocio: true,
          urlFotoDePerfil: true,
          estadoNegocio: true,
        },
        with: { redesSociales: true },
      },
      imagenes: {
        columns: { urlImagenProducto: true, idImagenProducto: true },
        orderBy: (imagenesProducto, { asc }) => [
          asc(imagenesProducto.ordenVisualizacionImagenProducto),
        ],
      },
    },
  });
}

async function obtenerProductosPorIds(ids: string[]) {
  if (ids.length === 0) return [];

  const resultados = await db.query.producto.findMany({
    where: inArray(producto.idProducto, ids),
    with: {
      negocio: {
        columns: {
          idNegocio: true,
          nombreNegocio: true,
          urlFotoDePerfil: true,
          estadoNegocio: true,
        },
        with: { redesSociales: true },
      },
      imagenes: {
        columns: { urlImagenProducto: true, idImagenProducto: true },
        orderBy: (imagenesProducto, { asc }) => [
          asc(imagenesProducto.ordenVisualizacionImagenProducto),
        ],
      },
    },
  });

  // Reordenar según el orden original de Gorse (ranking) y filtrar negocios inactivos
  const porId = new Map(
    resultados
      .filter((p) => p.negocio?.estadoNegocio === "ACTIVO")
      .map((p) => [p.idProducto, p])
  );
  return ids.map((id) => porId.get(id)).filter(Boolean) as typeof resultados;
}

// ─── Estrategia de Fallback (Sin Gorse) ──────────────────────────────────────

async function obtenerProductosPaginadosFallback(limit: number, offset: number) {
  const idsNegocios = await obtenerIdsNegociosActivos();
  
  if (idsNegocios.length === 0) {
    return [];
  }

  return db.query.producto.findMany({
    where: inArray(producto.idNegocio, idsNegocios),
    limit: limit + 1,
    offset: offset,
    orderBy: (p, { desc }) => [desc(p.idProducto)],
    with: {
      negocio: {
        columns: {
          idNegocio: true,
          nombreNegocio: true,
          urlFotoDePerfil: true,
          estadoNegocio: true,
        },
        with: { redesSociales: true },
      },
      imagenes: {
        columns: { urlImagenProducto: true, idImagenProducto: true },
        orderBy: (imagenesProducto, { asc }) => [
          asc(imagenesProducto.ordenVisualizacionImagenProducto),
        ],
      },
    },
  });
}

// ─── Formateo de Respuesta ───────────────────────────────────────────────────

type ProductoConRelaciones = Awaited<ReturnType<typeof obtenerProductosDeNegocio>>[number];

function formatearProducto(p: ProductoConRelaciones): ProductoPaginado {
  return {
    id: p.idProducto,
    idNegocio: p.idNegocio,
    nombreProducto: p.nombreProducto,
    descripcion: p.descripcionProducto,
    precio: p.precioProducto ? parseFloat(p.precioProducto) : undefined,
    nombreNegocio: p.negocio?.nombreNegocio || "",
    imagenNegocio: p.negocio?.urlFotoDePerfil || "",
    imagenesProducto: p.imagenes.map((img) => img.urlImagenProducto),
    socials: {
      whatsapp: p.negocio?.redesSociales?.urlWhatsapp || undefined,
    },
  };
}

function formatearRespuestaPaginada(
  productos: ProductoConRelaciones[],
  limit: number,
  cursor: string | null
): ProductosPaginadosResponse {
  const hasNext = productos.length > limit;
  const slice = hasNext ? productos.slice(0, -1) : productos;

  const currentOffset = cursor ? parseInt(cursor, 10) : 0;
  const offsetValue = isNaN(currentOffset) ? 0 : currentOffset;
  
  const nextCursor = hasNext ? (offsetValue + limit).toString() : null;

  return {
    data: slice.map(formatearProducto),
    nextCursor,
  };
}

// ─── Estrategia de recomendación (Gorse) ─────────────────────────────────────

async function obtenerProductosRecomendados(
  idCliente: string | null,
  limit: number,
  offset: number
): Promise<{ ids: string[]; hasMore: boolean } | null> {
  try {
    let recomendaciones: RecomendacionEnriquecida[];

    if (idCliente) {
      recomendaciones = await sistemaRecomendacion.obtenerRecomendacionesHibridasPorTipo(
        idCliente,
        "producto",
        limit + 1 + offset
      );
    } else {
      recomendaciones = await sistemaRecomendacion.obtenerTrending({
        n: limit + 1 + offset,
        categoria: "producto",
      });
    }

    const paginados = recomendaciones.slice(offset);
    const hasMore = paginados.length > limit;
    const pagina = hasMore ? paginados.slice(0, limit) : paginados;

    const ids = pagina
      .filter((r) => r.categoriaItem === "producto")
      .map((r) => r.idOriginal);

    return { ids, hasMore };
  } catch (error) {
    console.warn(
      "[Recomendación] Gorse no disponible, usando fallback de BD:",
      error instanceof Error ? error.message : error
    );
    return null;
  }
}

// ─── Registro de Vistas (Feedback) ───────────────────────────────────────────

function registrarVistasDeProductos(idCliente: string, productos: ProductoPaginado[]) {
  if (productos.length === 0) return;
  
  sistemaRecomendacion
    .registrarFeedbackMasivo(
      productos.map((p) => ({
        idCliente,
        idItem: p.id,
        categoriaItem: "producto",
        tipo: "view",
      }))
    )
    .catch(() => {
      /* Falla silenciosa permitida para evitar romper la petición principal */
    });
}

// ─── Endpoint ────────────────────────────────────────────────────────────────

export const GET = crearEndpoint(async ({ request, url, requestId }) => {
  const cursor = url.searchParams.get("cursor");
  let limit = parseInt(url.searchParams.get("limit") || "2", 10);
  if (isNaN(limit) || limit <= 0) limit = 2;

  const payload = verificarAutenticacionCliente(request);
  const idCliente = payload?.idCliente ?? null;

  const currentOffset = cursor ? parseInt(cursor, 10) : 0;
  const offsetValue = isNaN(currentOffset) ? 0 : currentOffset;

  // 1. Intentar con Gorse
  const gorseResult = await obtenerProductosRecomendados(idCliente, limit, offsetValue);

  if (gorseResult && gorseResult.ids.length > 0) {
    const productosDb = await obtenerProductosPorIds(gorseResult.ids);
    const data = productosDb.map(formatearProducto);
    const nextCursor = gorseResult.hasMore ? (offsetValue + limit).toString() : null;

    if (idCliente) {
      registrarVistasDeProductos(idCliente, data);
    }

    return respuestaExitosa({ data, nextCursor }, requestId);
  }

  // 2. Fallback sin Gorse
  const productos = await obtenerProductosPaginadosFallback(limit, offsetValue);
  const resultado = formatearRespuestaPaginada(productos, limit, cursor);

  return respuestaExitosa(resultado, requestId);
});
