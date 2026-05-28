import { db } from "@/lib/db";
import {
  negocio,
  producto,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  crearEndpoint,
  respuestaExitosa,
  ErrorNoEncontrado,
} from "@/lib";
import type { NegocioAleatorioResponse } from "@/lib/api/tiposApi/explorar";

export const GET = crearEndpoint(async ({ requestId }) => {
  // 1. Obtener IDs de todos los negocios activos
  const negociosDb = await db
    .select({ idNegocio: negocio.idNegocio })
    .from(negocio)
    .where(eq(negocio.estadoNegocio, "ACTIVO"));

  const idsNegocios = negociosDb.map((n) => n.idNegocio);

  if (idsNegocios.length === 0) {
    throw new ErrorNoEncontrado("Negocios Activos");
  }

  // 2. Elegir un ID al azar
  const idNegocioAleatorio = idsNegocios[Math.floor(Math.random() * idsNegocios.length)];

  // 3. Obtener el detalle de ese negocio
  const negocioDb = await db.query.negocio.findFirst({
    where: eq(negocio.idNegocio, idNegocioAleatorio),
    with: {
      redesSociales: true,
      duenio: true,
    },
  });

  if (!negocioDb) {
    throw new ErrorNoEncontrado("Negocio");
  }

  // Obtener algunos productos de este negocio
  const productosDb = await db.query.producto.findMany({
    where: eq(producto.idNegocio, negocioDb.idNegocio),
    limit: 5,
    with: {
      imagenes: {
        columns: { urlImagenProducto: true, idImagenProducto: true },
        orderBy: (imagenesProducto, { asc }) => [asc(imagenesProducto.ordenVisualizacionImagenProducto)],
      },
    },
  });

  const resultado: NegocioAleatorioResponse = {
    idNegocio: negocioDb.idNegocio,
    nombreNegocio: negocioDb.nombreNegocio,
    descripcionNegocio: negocioDb.descripcionNegocio,
    urlFotoDePerfil: negocioDb.urlFotoDePerfil,
    celularNegocio: negocioDb.duenio?.numeroCelularDuenioNegocio || "",
    redesSociales: {
      instagram: negocioDb.redesSociales?.urlInstagram || null,
      facebook: negocioDb.redesSociales?.urlFacebook || null,
      whatsapp: negocioDb.redesSociales?.urlWhatsapp || null,
    },
    productos: productosDb.map((p) => ({
      idProducto: p.idProducto,
      nombreProducto: p.nombreProducto,
      precioProducto: p.precioProducto ? parseFloat(p.precioProducto) : 0,
      imagen: p.imagenes[0]?.urlImagenProducto || null,
    })),
  };

  return respuestaExitosa(resultado, requestId);
});
