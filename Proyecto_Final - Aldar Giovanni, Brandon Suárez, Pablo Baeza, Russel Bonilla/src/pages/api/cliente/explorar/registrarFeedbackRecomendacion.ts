import {
  crearEndpoint,
  respuestaExitosa,
  parsearJsonBody,
  validarCamposRequeridos,
  validarEnum,
} from "@/lib";
import { sistemaRecomendacion } from "@/lib/sistemaRecomendacion";
import type {
  TipoFeedback,
  CategoriaItem,
} from "@/lib/sistemaRecomendacion";
import { verificarAutenticacionCliente } from "@/lib/auth/jwtCliente";
import { db } from "@/lib/db";
import { cuponEfectivo } from "@/lib/db/schema";
import { eq, or } from "drizzle-orm";

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface RegistrarFeedbackBody {
  idItem: string;
  categoriaItem: string;
  tipo: string;
}

const TIPOS_FEEDBACK_VALIDOS = [
  "like",
  "purchase",
  "star",
  "view",
  "read",
  "dislike",
] as const;

const CATEGORIAS_ITEM_VALIDAS = ["negocio", "producto", "cupon"] as const;

// ─── Endpoint ────────────────────────────────────────────────────────────────

/**
 * POST /api/cliente/explorar/registrarFeedbackRecomendacion
 *
 * Registra una interacción (feedback) del usuario con un ítem para alimentar
 * el sistema de recomendación Gorse.
 *
 * Body:
 *   - idItem: UUID del ítem en la BD
 *   - categoriaItem: "negocio" | "producto" | "cupon"
 *   - tipo: "like" | "purchase" | "star" | "view" | "read" | "dislike"
 *
 * Si el usuario no está autenticado, el feedback se descarta silenciosamente
 * (se retorna éxito igualmente para no interrumpir la UX).
 */
export const POST = crearEndpoint(async ({ request, requestId }) => {
  const body = await parsearJsonBody<RegistrarFeedbackBody>(request);
  validarCamposRequeridos(body, ["idItem", "categoriaItem", "tipo"]);

  const tipo = validarEnum(body.tipo, TIPOS_FEEDBACK_VALIDOS, "tipo");
  const categoriaItem = validarEnum(
    body.categoriaItem,
    CATEGORIAS_ITEM_VALIDAS,
    "categoriaItem"
  );

  // Intentar obtener sesión del cliente (opcional)
  const payload = verificarAutenticacionCliente(request);

  if (payload?.idCliente) {
    try {
      let resolvedIdItem = body.idItem;

      // Si es un cupón, el cliente podría estar enviando el idCuponEfectivo o la clave
      // Gorse necesita el idCupon (el molde), no la instancia.
      if (categoriaItem === "cupon") {
        // En caso de que se haya enviado un UUID, checar ambos campos
        const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.idItem);
        const [efectivo] = await db
          .select({ idCupon: cuponEfectivo.idCupon })
          .from(cuponEfectivo)
          .where(
            or(
              isValidUuid ? eq(cuponEfectivo.idCuponEfectivo, body.idItem) : undefined,
              eq(cuponEfectivo.claveUnicaCupon, body.idItem)
            )
          )
          .limit(1);

        if (efectivo) {
          resolvedIdItem = efectivo.idCupon;
        }
      }

      console.log(`[Feedback] Registrando feedback para cliente ${payload.idCliente}: ${tipo} en ${categoriaItem} (${resolvedIdItem})`
      );
      await sistemaRecomendacion.registrarFeedback(
        payload.idCliente,
        resolvedIdItem,
        categoriaItem as CategoriaItem,
        tipo as TipoFeedback
      );
    } catch (error) {
      // Gorse no disponible — no interrumpir la experiencia
      console.warn(
        "[Feedback] Error al registrar feedback en Gorse:",
        error instanceof Error ? error.message : error
      );
    }
  }

  return respuestaExitosa({ registrado: true }, requestId);
});
