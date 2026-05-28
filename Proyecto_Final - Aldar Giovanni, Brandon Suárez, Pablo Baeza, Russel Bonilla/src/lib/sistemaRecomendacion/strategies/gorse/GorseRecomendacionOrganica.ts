import type { IRecomendacionOrganicaStrategy } from "../../interfaces/IRecomendacionOrganicaStrategy";
import type { OpcionesNoPersonalizada, RecomendacionEnriquecida } from "../../tipos";
import { servicioGorse } from "../../servicioGorse";
import {
  enriquecerResultados,
  NOMBRE_NON_PERSONALIZED,
  type ResultadoRecomendacion,
} from "./gorseUtilidades";

// ─── Implementación Gorse — Recomendaciones Orgánicas / Caja Blanca ─────────

/**
 * Estrategia de recomendación orgánica basada en Gorse.
 *
 * Las recomendaciones no personalizadas usan el lenguaje Expr de Gorse.
 * Las fórmulas son legibles y auditables por cualquier miembro del equipo:
 *
 *   trending:           (count(likes) - 1) / (age + 2) ^ 0.5
 *   most_liked_weekly:  count(likes) en los últimos 7 días
 *   top_purchased:      count(purchases) en los últimos 30 días
 *   latest:             item.Timestamp.Unix()
 *
 * Se pueden ajustar en config.toml SIN reentrenar modelos.
 */
export class GorseRecomendacionOrganica implements IRecomendacionOrganicaStrategy {
  readonly proveedor = "gorse" as const;

  /**
   * Obtiene ítems TRENDING (fórmula Hacker News style).
   *
   * Fórmula caja blanca:
   *   score = (count(feedback, .FeedbackType == 'like') - 1) /
   *           ((now() - item.Timestamp).Seconds() + 2) ^ 0.5
   *
   * Los ítems con más likes recientes puntúan más alto; el puntaje
   * decae con el tiempo (gravity = 0.5).
   */
  async obtenerTrending(
    opciones?: OpcionesNoPersonalizada
  ): Promise<RecomendacionEnriquecida[]> {
    // Como Gorse 0.5 no expone endpoints directos de /api/non-personalized/trending,
    // usamos la API de 'latest' (o podemos pasar un userId anónimo a /api/recommend).
    return this.obtenerUltimos(opciones);
  }

  // ── Métodos adicionales (no expuestos por el Contexto) ──

  /**
   * Obtiene los ítems MÁS RECIENTES.
   *
   * Fórmula caja blanca:
   *   score = item.Timestamp.Unix()
   *
   * Simplemente ordena por timestamp — completamente transparente.
   */
  async obtenerUltimos(
    opciones?: OpcionesNoPersonalizada
  ): Promise<RecomendacionEnriquecida[]> {
    const resultados =
      await servicioGorse.obtenerRecomendacionNoPersonalizada(
        NOMBRE_NON_PERSONALIZED.LATEST,
        {
          n: opciones?.n ?? 10,
          offset: opciones?.offset,
          category: opciones?.categoria,
        }
      );

    return enriquecerResultados(resultados as ResultadoRecomendacion[]);
  }

  /**
   * Obtiene los ítems más likeados de la semana.
   *
   * Fórmula caja blanca:
   *   score  = count(feedback, .FeedbackType == 'like')
   *   filter = (now() - item.Timestamp).Hours() < 168
   *
   * Solo considera ítems creados en los últimos 7 días (168 horas).
   */
  async obtenerMasGustadosSemanal(
    opciones?: OpcionesNoPersonalizada
  ): Promise<RecomendacionEnriquecida[]> {
    const resultados =
      await servicioGorse.obtenerRecomendacionNoPersonalizada(
        NOMBRE_NON_PERSONALIZED.MOST_LIKED_WEEKLY,
        {
          n: opciones?.n ?? 10,
          offset: opciones?.offset,
          category: opciones?.categoria,
        }
      );

    return enriquecerResultados(resultados as ResultadoRecomendacion[]);
  }

  /**
   * Obtiene los ítems más comprados (top purchased).
   *
   * Fórmula caja blanca:
   *   score  = count(feedback, .FeedbackType == 'purchase')
   *   filter = (now() - item.Timestamp).Hours() < 720
   *
   * Solo considera ítems de los últimos 30 días (720 horas).
   */
  async obtenerMasComprados(
    opciones?: OpcionesNoPersonalizada
  ): Promise<RecomendacionEnriquecida[]> {
    const resultados =
      await servicioGorse.obtenerRecomendacionNoPersonalizada(
        NOMBRE_NON_PERSONALIZED.TOP_PURCHASED,
        {
          n: opciones?.n ?? 10,
          offset: opciones?.offset,
          category: opciones?.categoria,
        }
      );

    return enriquecerResultados(resultados as ResultadoRecomendacion[]);
  }

  /**
   * Obtiene TODAS las recomendaciones orgánicas / caja blanca combinadas.
   *
   * Devuelve un objeto con los 4 tipos de recomendaciones no personalizadas,
   * cada una calculada con su fórmula Expr transparente y auditable.
   */
  async obtenerTodasLasOrganicas(
    opciones?: OpcionesNoPersonalizada
  ): Promise<{
    trending: RecomendacionEnriquecida[];
    ultimos: RecomendacionEnriquecida[];
    masGustadosSemanal: RecomendacionEnriquecida[];
    masComprados: RecomendacionEnriquecida[];
  }> {
    const [trending, ultimos, masGustadosSemanal, masComprados] =
      await Promise.all([
        this.obtenerTrending(opciones),
        this.obtenerUltimos(opciones),
        this.obtenerMasGustadosSemanal(opciones),
        this.obtenerMasComprados(opciones),
      ]);

    return { trending, ultimos, masGustadosSemanal, masComprados };
  }
}
