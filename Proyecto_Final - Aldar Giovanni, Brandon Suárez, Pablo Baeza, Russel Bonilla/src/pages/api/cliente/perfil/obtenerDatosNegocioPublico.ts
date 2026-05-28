import { db } from "@/lib/db";
import { negocio, redesSociales } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  crearEndpoint,
  respuestaExitosa,
  ErrorNoEncontrado,
  ErrorValidacion,
} from "@/lib";

import type { DatosNegocioPublicoResponse} from "@/lib/api/tiposApi/perfilNegocio";

async function consultarNegocioDB(idNegocio: string): Promise<DatosNegocioPublicoResponse> {
  const negocioResult = await db.select().from(negocio).where(eq(negocio.idNegocio, idNegocio)).limit(1);
  if (negocioResult.length === 0) throw new ErrorNoEncontrado("Negocio");

  const n = negocioResult[0];
  const redesResult = await db.select().from(redesSociales).where(eq(redesSociales.idNegocio, n.idNegocio)).limit(1);

  return {
    idNegocio: n.idNegocio,
    nombreNegocio: n.nombreNegocio,
    urlFotoDePerfil: n.urlFotoDePerfil,
    descripcionNegocio: n.descripcionNegocio,
    redesSociales: {
      urlInstagram: redesResult[0].urlInstagram ?? "",
      urlFacebook: redesResult[0].urlFacebook ?? "",
      urlWhatsapp: redesResult[0].urlWhatsapp ?? "",
    }
      
  };
}

export const GET = crearEndpoint(async ({ url, requestId }) => {
  const idNegocio = url.searchParams.get("idNegocio");
  if (!idNegocio) throw new ErrorValidacion("idNegocio es requerido");

  const datos = await consultarNegocioDB(idNegocio);
  return respuestaExitosa(datos, requestId);
});
