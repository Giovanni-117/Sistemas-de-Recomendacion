import { db } from "@/lib/db";
import { producto } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  crearEndpoint,
  respuestaExitosa,
  ErrorValidacion,
} from "@/lib";
import type { ProductoPublicoItem} from "@/lib/api/tiposApi/productos";

async function consultarProductosDB(idNegocio: string): Promise<ProductoPublicoItem[]> {
  const productosDb = await db.query.producto.findMany({
    where: eq(producto.idNegocio, idNegocio),
    with: {
      imagenes: {
        columns: { urlImagenProducto: true },
        orderBy: (imagenesProducto, { asc }) => [
          asc(imagenesProducto.ordenVisualizacionImagenProducto),
        ],
      },
      categorias: {
        with: {
          categoria: {
            columns: { nombreCategoria: true },
          },
        },
      },
    },
  });

  return productosDb.map((p) => ({
    idProducto: p.idProducto,
    nombreProducto: p.nombreProducto,
    descripcionProducto: p.descripcionProducto,
    precioProducto: p.precioProducto ? parseFloat(p.precioProducto) : 0,
    imagenesProducto: p.imagenes.map((img) => img.urlImagenProducto),
    categorias: p.categorias
      .map((pc) => pc.categoria?.nombreCategoria)
      .filter(Boolean) as string[],
  }));
}

export const GET = crearEndpoint(async ({ url, requestId }) => {
  const idNegocio = url.searchParams.get("idNegocio");
  if (!idNegocio) throw new ErrorValidacion("idNegocio es requerido");

  const productos = await consultarProductosDB(idNegocio);

  return respuestaExitosa({ productos }, requestId);
});
