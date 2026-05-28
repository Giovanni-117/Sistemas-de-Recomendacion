import { db } from "@/lib/db";
import { promocionalPrincipal } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import { ApiCacheCrud } from "@/lib/cache/apiCacheCrud";
import {
  CacheNS,
  CacheTTL,
  crearEndpoint,
  respuestaExitosa,
  logCache,
} from "@/lib";
import type { PromocionalPrincipalItem} from "@/lib/api/tiposApi/promocionalesInicio";

const redisService = new ApiCacheCrud(CacheNS.cliente.promocionalPrincipal, CacheTTL.veinticuatroHoras);



async function consultarPromocionalesDB(): Promise<PromocionalPrincipalItem[]> {
  return db
    .select({
      imagen: promocionalPrincipal.urlImagenPromocionalPrincipal,
      etiqueta: promocionalPrincipal.etiquetaPromocionalPrincipal,
      titulo: promocionalPrincipal.tituloPromocionalPrincipal,
      descripcion: promocionalPrincipal.descripcionPromocionalPrincipal,
      urlVerMas: promocionalPrincipal.urlVerMasPromocionalPrincipal,
    })
    .from(promocionalPrincipal)
    .orderBy(asc(promocionalPrincipal.ordenVisualizacion));
}

async function obtenerPromocionales(): Promise<PromocionalPrincipalItem[]> {
  try {
    const cached = await redisService.obtenerDeCache<PromocionalPrincipalItem[]>(CacheNS.cliente.promocionalPrincipal);
    if (cached) { logCache("HIT", CacheNS.cliente.promocionalPrincipal); return cached; }
    logCache("MISS", CacheNS.cliente.promocionalPrincipal);
  } catch (e) { console.warn("Error al leer caché promocionales:", e); }

  const datos = await consultarPromocionalesDB();

  try {
    await redisService.crearEnCache(CacheNS.cliente.promocionalPrincipal, datos);
    logCache("SET", CacheNS.cliente.promocionalPrincipal);
  } catch (e) { console.warn("Error al escribir caché promocionales:", e); }

  return datos;
}

export const GET = crearEndpoint(async ({ requestId }) => {
  const promocionales = await obtenerPromocionales();
  return respuestaExitosa(promocionales, requestId);
});
