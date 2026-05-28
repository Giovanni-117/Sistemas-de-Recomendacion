import { db } from "@/lib/db";
import {
  producto,
  negocio,
  imagenesProducto,
  productosCategoria,
  categorias,
  redesSociales,
} from "@/lib/db/schema";
import { eq, ilike, or, and, sql } from "drizzle-orm";
import { ApiCacheCrud } from "@/lib/cache/apiCacheCrud";
import {
  CacheNS,
  CacheTTL,
  crearEndpoint,
  respuestaExitosa,
  sanitizarTexto,
  logCache,
} from "@/lib";

import type { ProductoPaginado } from "@/lib/api/tiposApi/explorar";


const redisService = new ApiCacheCrud(CacheNS.cliente.productos.busqueda, CacheTTL.tresMinutos);

// ─── Tipos internos ─────────────────────────────────────────────────────────

interface ProductoAcumulado {
  idProducto: string;
  nombreProducto: string;
  precioProducto: string;
  descripcionProducto: string;
  idNegocio: string;
  nombreNegocio: string;
  fotoNegocio: string | null;
  urlInstagram: string | null;
  urlFacebook: string | null;
  urlWhatsapp: string | null;
  imagenesRaw: { url: string; orden: number }[];
  categorias: Set<string>;
  _imgSet: Set<string>;
}

// ─── Acceso a datos ──────────────────────────────────────────────────────────

/** Consulta la DB con JOINs para buscar por nombre de producto o negocio. */
async function buscarEnDB(termino: string) {
  const exactSearchTerm = termino;
  const searchTerm = `%${termino}%`;

  return db
    .select({
      idProducto: producto.idProducto,
      nombreProducto: producto.nombreProducto,
      precioProducto: producto.precioProducto,
      descripcionProducto: producto.descripcionProducto,
      idNegocio: negocio.idNegocio,
      nombreNegocio: negocio.nombreNegocio,
      fotoNegocio: negocio.urlFotoDePerfil,
      urlImagenProducto: imagenesProducto.urlImagenProducto,
      ordenImagen: imagenesProducto.ordenVisualizacionImagenProducto,
      urlInstagram: redesSociales.urlInstagram,
      urlFacebook: redesSociales.urlFacebook,
      urlWhatsapp: redesSociales.urlWhatsapp,
      nombreCategoria: categorias.nombreCategoria,
    })
    .from(producto)
    .innerJoin(negocio, eq(producto.idNegocio, negocio.idNegocio))
    .leftJoin(imagenesProducto, eq(producto.idProducto, imagenesProducto.idProducto))
    .leftJoin(redesSociales, eq(negocio.idNegocio, redesSociales.idNegocio))
    .leftJoin(productosCategoria, eq(producto.idProducto, productosCategoria.idProducto))
    .leftJoin(categorias, eq(productosCategoria.idCategoria, categorias.idCategoria))
    .where(
      and(
        eq(negocio.estadoNegocio, "ACTIVO"),
        or(
          ilike(producto.nombreProducto, searchTerm),
          ilike(negocio.nombreNegocio, searchTerm),
          sql`similarity(${producto.nombreProducto}, ${exactSearchTerm}) > 0.3`,
          sql`similarity(${negocio.nombreNegocio}, ${exactSearchTerm}) > 0.3`
        )
      )
    )
    .orderBy(
      sql`GREATEST(similarity(${producto.nombreProducto}, ${exactSearchTerm}), similarity(${negocio.nombreNegocio}, ${exactSearchTerm})) DESC`
    );
}

/** Agrupa filas duplicadas por JOINs en una estructura limpia por producto. */
function agruparResultados(filas: Awaited<ReturnType<typeof buscarEnDB>>): Map<string, ProductoAcumulado> {
  const mapa = new Map<string, ProductoAcumulado>();

  for (const row of filas) {
    if (!mapa.has(row.idProducto)) {
      mapa.set(row.idProducto, {
        idProducto: row.idProducto,
        nombreProducto: row.nombreProducto,
        precioProducto: row.precioProducto,
        descripcionProducto: row.descripcionProducto,
        idNegocio: row.idNegocio,
        nombreNegocio: row.nombreNegocio,
        fotoNegocio: row.fotoNegocio,
        urlInstagram: row.urlInstagram,
        urlFacebook: row.urlFacebook,
        urlWhatsapp: row.urlWhatsapp,
        imagenesRaw: [],
        categorias: new Set<string>(),
        _imgSet: new Set(),
      });
    }

    const p = mapa.get(row.idProducto)!;

    if (row.urlImagenProducto && !p._imgSet.has(row.urlImagenProducto)) {
      p._imgSet.add(row.urlImagenProducto);
      p.imagenesRaw.push({ url: row.urlImagenProducto, orden: row.ordenImagen ?? 0 });
    }

    if (row.nombreCategoria) {
      p.categorias.add(row.nombreCategoria);
    }
  }

  return mapa;
}

/** Formatea el mapa agrupado en la estructura final de respuesta. */
function formatearResultados(mapa: Map<string, ProductoAcumulado>): ProductoPaginado[] {
  return Array.from(mapa.values()).map((p) => {
    p.imagenesRaw.sort((a, b) => a.orden - b.orden);

    return {
      id: p.idProducto,
      idNegocio: p.idNegocio,
      nombreProducto: p.nombreProducto,
      descripcion: p.descripcionProducto,
      precio: p.precioProducto ? parseFloat(p.precioProducto) : 0,
      nombreNegocio: p.nombreNegocio,
      imagenNegocio: p.fotoNegocio ?? "",
      imagenesProducto: p.imagenesRaw.map((img) => img.url),
      categorias: Array.from(p.categorias),
      socials: {
        instagram: p.urlInstagram || undefined,
        facebook: p.urlFacebook || undefined,
        whatsapp: p.urlWhatsapp || undefined,
      },
    };
  });
}

// ─── Capa de caché ───────────────────────────────────────────────────────────

/** Busca productos con cache-aside: caché → DB → set caché. */
async function buscarConCache(q: string): Promise<ProductoPaginado[]> {
  const discriminante = q.toLowerCase().trim();

  try {
    const cached = await redisService.obtenerDeCache<ProductoPaginado[]>(discriminante);
    if (cached) {
      logCache("HIT", discriminante);
      return cached;
    }
    logCache("MISS", discriminante);
  } catch (e) {
    console.warn(`Error al leer caché ${discriminante}:`, e);
  }

  const filas = await buscarEnDB(q);
  const agrupados = agruparResultados(filas);
  const resultado = formatearResultados(agrupados);

  try {
    await redisService.crearEnCache(discriminante, resultado); // 3 min TTL
    logCache("SET", discriminante);
  } catch (e) {
    console.warn(`Error al escribir caché ${discriminante}:`, e);
  }

  return resultado;
}

// ─── Endpoint ────────────────────────────────────────────────────────────────

export const GET = crearEndpoint(async ({ url, requestId }) => {
  const q = sanitizarTexto(url.searchParams.get("q") ?? "");

  if (!q) {
    return respuestaExitosa<ProductoPaginado[]>([], requestId);
  }

  const resultado = await buscarConCache(q);
  return respuestaExitosa(resultado, requestId);
});
