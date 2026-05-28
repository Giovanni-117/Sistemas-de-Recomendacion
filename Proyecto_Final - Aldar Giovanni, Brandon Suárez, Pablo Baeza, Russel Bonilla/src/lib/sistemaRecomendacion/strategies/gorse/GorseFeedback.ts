import type { IFeedbackStrategy } from "../../interfaces/IFeedbackStrategy";
import type {
  CategoriaItem,
  TipoFeedback,
  InteraccionFeedback,
} from "../../tipos";
import { servicioGorse } from "../../servicioGorse";
import { construirItemId } from "./gorseUtilidades";
import type { Feedback } from "gorsejs";

// ─── Implementación Gorse — Feedback ────────────────────────────────────────

/**
 * Estrategia de feedback basada en Gorse.
 *
 * Registra interacciones usuario ↔ ítem en el motor de recomendación Gorse.
 * Estas interacciones alimentan el modelo colaborativo (MF), los
 * item-to-item (covisit) y user-to-user (similar_users).
 */
export class GorseFeedback implements IFeedbackStrategy {
  readonly proveedor = "gorse" as const;

  /**
   * Registra una interacción (feedback) de un usuario con un ítem.
   *
   * @param idCliente     UUID del cliente en la BD
   * @param idItem        UUID del ítem en la BD (producto, negocio o cupón)
   * @param categoriaItem Tipo de ítem para construir el prefijo
   * @param tipo          Tipo de feedback (like, purchase, star, view, read, dislike)
   * @param valor         Valor numérico de la interacción (default: 1)
   */
  async registrarFeedback(
    idCliente: string,
    idItem: string,
    categoriaItem: CategoriaItem,
    tipo: TipoFeedback,
    valor: number = 1
  ): Promise<void> {
    const feedback: Feedback<string> = {
      FeedbackType: tipo,
      UserId: idCliente,
      ItemId: construirItemId(categoriaItem, idItem),
      Timestamp: new Date().toISOString(),
      Value: valor,
    };

    await servicioGorse.insertarOActualizarInteracciones([feedback]);
  }

  /**
   * Registra múltiples interacciones de una sola vez.
   */
  async registrarFeedbackMasivo(
    interacciones: InteraccionFeedback[]
  ): Promise<void> {
    const feedbacks: Feedback<string>[] = interacciones.map((i) => ({
      FeedbackType: i.tipo,
      UserId: i.idCliente,
      ItemId: construirItemId(i.categoriaItem, i.idItem),
      Timestamp: i.timestamp || new Date().toISOString(),
      Value: i.valor ?? 1,
    }));

    await servicioGorse.insertarOActualizarInteracciones(feedbacks);
  }

  // ── Método adicional (no expuesto por el Contexto) ──

  /**
   * Elimina una interacción específica entre un usuario y un ítem.
   */
  async eliminarFeedback(
    idCliente: string,
    idItem: string,
    categoriaItem: CategoriaItem,
    tipo: TipoFeedback
  ): Promise<void> {
    await servicioGorse.eliminarInteraccionUsuarioElementoPorTipo(
      tipo,
      idCliente,
      construirItemId(categoriaItem, idItem)
    );
  }
}
