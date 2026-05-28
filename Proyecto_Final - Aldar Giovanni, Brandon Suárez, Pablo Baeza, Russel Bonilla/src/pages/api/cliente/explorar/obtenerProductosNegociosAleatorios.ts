
// NO UTILIZADO: Este endpoint se creó para probar la lógica de paginación con orden aleatorio basado en una semilla diaria. No se utiliza en producción, pero puede servir como referencia para futuras implementaciones similares.
import { db } from "@/lib/db";
import { producto } from "@/lib/db/schema";
import { asc, sql } from "drizzle-orm";
import {
  crearEndpoint,
  respuestaExitosa,
  
} from "@/lib";

import type { ProductosPaginadosResponse} from "@/lib/api/tiposApi/explorar";

// lib/randomSeed.ts
export function obtenerSeedDelDia(): string {
  // Retornamos la fecha actual como string para usarlo como semilla
  // de esta forma, aunque el servidor (o lambda) se reinicie, 
  // la semilla se mantiene igual durante todo el día para evitar que se repitan.
  return new Date().toISOString().slice(0, 10);
}

// ─── Acceso a datos ──────────────────────────────────────────────────────────

async function obtenerProductosPaginados(cursor: string | null, limit: number) {
  const currentOffset = cursor ? parseInt(cursor, 10) : 0;
  const offsetValue = isNaN(currentOffset) ? 0 : currentOffset;
  const seed = obtenerSeedDelDia();

  return db.query.producto.findMany({
    orderBy: [asc(sql`md5(CAST(${producto.idProducto} AS text) || ${seed})`)],
    limit: limit + 1,
    offset: offsetValue,
    with: {
      negocio: {
        columns: {
          idNegocio: true,
          nombreNegocio: true,
          urlFotoDePerfil: true,
        },
        with: {
          redesSociales: true,
        },
      },
      imagenes: {
        columns: { urlImagenProducto: true, idImagenProducto: true },
        orderBy: (imagenesProducto, { asc }) => [asc(imagenesProducto.ordenVisualizacionImagenProducto)],
      },
      
    },
  });
}

function formatearRespuestaPaginada(
  productos: Awaited<ReturnType<typeof obtenerProductosPaginados>>,
  limit: number,
  cursor: string | null
): ProductosPaginadosResponse {
  const hasNext = productos.length > limit;
  const slice = hasNext ? productos.slice(0, -1) : productos;
  
  const currentOffset = cursor ? parseInt(cursor, 10) : 0;
  const offsetValue = isNaN(currentOffset) ? 0 : currentOffset;
  const nextCursor = hasNext ? (offsetValue + limit).toString() : null;

  const data = slice.map((p) => ({
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
  }));

  return { data, nextCursor };
}

// ─── Endpoint ────────────────────────────────────────────────────────────────

export const GET = crearEndpoint(async ({ url, requestId }) => {
  const cursor = url.searchParams.get("cursor");
  let limit = parseInt(url.searchParams.get("limit") || "2", 10);
  if (isNaN(limit) || limit <= 0) limit = 2;
  

  const productos = await obtenerProductosPaginados(cursor, limit);
  const resultado = formatearRespuestaPaginada(productos, limit, cursor);

  return respuestaExitosa(resultado, requestId);
});
