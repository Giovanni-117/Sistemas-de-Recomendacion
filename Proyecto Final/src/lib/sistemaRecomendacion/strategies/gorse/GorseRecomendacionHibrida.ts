import type { IRecomendacionHibridaStrategy } from "../../interfaces/IRecomendacionHibridaStrategy";
import type { CategoriaItem, RecomendacionEnriquecida, TipoFeedback } from "../../tipos";
import { servicioGorse, type OpcionesRecomendacionAdicional } from "../../servicioGorse";
import {
  construirItemId,
  enriquecerResultados,
  type ResultadoRecomendacion,
  type OpcionesRecomendacionHibrida,
} from "./gorseUtilidades";
import type { Feedback } from "gorsejs";

// ─── Implementación Gorse — Recomendaciones Híbridas ─────────────────────────

/**
 * Estrategia de recomendación híbrida basada en Gorse.
 *
 * Combina los 4 tipos de recommenders configurados en Gorse:
 *   - Collaborative Filtering (MF) → patrones latentes de comportamiento
 *   - Item-to-Item (neighbors + covisit) → similitud por tags y co-visita
 *   - User-to-User (similar_users) → usuarios con historial similar
 *   - Non-personalized → trending, latest, most_liked_weekly, top_purchased
 *
 * El endpoint /api/recommend/{userId} de Gorse integra TODOS los
 * recommenders configurados y los pasa por el Ranker FM antes de devolver
 * la lista final re-ordenada.
 */
export class GorseRecomendacionHibrida implements IRecomendacionHibridaStrategy {
  readonly proveedor = "gorse" as const;

  /**
   * Obtiene recomendaciones híbridas filtradas por tipo de ítem.
   * Útil para mostrar secciones como "Productos recomendados", "Cupones para ti", etc.
   */
  async obtenerRecomendacionesHibridasPorTipo(
    idCliente: string,
    categoriaItem: CategoriaItem,
    n: number = 10
  ): Promise<RecomendacionEnriquecida[]> {
    const todas = await this.obtenerRecomendacionesHibridas(idCliente, {
      n: n * 3, // Pedir más para luego filtrar
      categoria: categoriaItem,
    });

    return todas
      .filter((r) => r.categoriaItem === categoriaItem)
      .slice(0, n);
  }

  // ── Métodos adicionales (no expuestos por el Contexto) ──

  /**
   * Obtiene recomendaciones personalizadas híbridas para un usuario.
   *
   * Gorse combina internamente todos los recommenders (collaborative MF,
   * item-to-item, user-to-user, non-personalized) y luego aplica el
   * Ranker FM para re-ordenar los candidatos.
   *
   * @returns Lista re-ordenada por el Ranker FM con los mejores candidatos
   */
  async obtenerRecomendacionesHibridas(
    idCliente: string,
    opciones?: OpcionesRecomendacionHibrida
  ): Promise<RecomendacionEnriquecida[]> {
    const itemIds = await servicioGorse.obtenerRecomendaciones({
      userId: idCliente,
      cursorOptions: {
        n: opciones?.n ?? 20,
        offset: opciones?.offset,
      },
      category: opciones?.categoria,
    });

    // getRecommend retorna string[] (solo IDs), convertimos a ResultadoRecomendacion
    const resultados: ResultadoRecomendacion[] = (itemIds as string[]).map(
      (id, index) => ({ Id: id, Score: itemIds.length - index })
    );

    return enriquecerResultados(resultados);
  }

  /**
   * Recomendaciones híbridas por sesión (para usuarios no autenticados).
   *
   * Usa las interacciones de la sesión actual (sin requerir un userId registrado)
   * para generar recomendaciones en tiempo real.
   */
  async obtenerRecomendacionesPorSesion(
    interaccionesSesion: Array<{
      idItem: string;
      categoriaItem: CategoriaItem;
      tipo: TipoFeedback;
    }>,
    n: number = 10
  ): Promise<RecomendacionEnriquecida[]> {
    const feedbacks: Feedback<string>[] = interaccionesSesion.map((i) => ({
      FeedbackType: i.tipo,
      UserId: "",
      ItemId: construirItemId(i.categoriaItem, i.idItem),
      Timestamp: new Date().toISOString(),
      Value: 1,
    }));

    const resultados = await servicioGorse.obtenerRecomendacionesPorSesion(
      feedbacks,
      { cursorOptions: { n } }
    );

    // getSessionRecommend retorna any, normalizamos a ResultadoRecomendacion
    const normalizados: ResultadoRecomendacion[] = Array.isArray(resultados)
      ? resultados.map((r: any) =>
          typeof r === "string"
            ? { Id: r, Score: 0 }
            : { Id: r.Id ?? r, Score: r.Score ?? 0 }
        )
      : [];

    return enriquecerResultados(normalizados);
  }

  /**
   * Obtiene sólo las recomendaciones del filtrado colaborativo (Matrix Factorization).
   * Útil para debugging o mostrar una sección separada de "basado en tu comportamiento".
   */
  async obtenerRecomendacionesColaborativas(
    idCliente: string,
    opciones?: OpcionesRecomendacionAdicional
  ): Promise<RecomendacionEnriquecida[]> {
    const resultados =
      await servicioGorse.obtenerRecomendacionFiltradoColaborativo(
        idCliente,
        opciones
      );

    return enriquecerResultados(resultados as ResultadoRecomendacion[]);
  }
}
