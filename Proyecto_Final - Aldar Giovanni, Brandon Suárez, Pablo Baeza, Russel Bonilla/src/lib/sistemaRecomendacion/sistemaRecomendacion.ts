import type { IFeedbackStrategy } from "./interfaces/IFeedbackStrategy";
import type { IRecomendacionHibridaStrategy } from "./interfaces/IRecomendacionHibridaStrategy";
import type { IRecomendacionOrganicaStrategy } from "./interfaces/IRecomendacionOrganicaStrategy";
import { GorseFeedback } from "./strategies/gorse/GorseFeedback";
import { GorseRecomendacionHibrida } from "./strategies/gorse/GorseRecomendacionHibrida";
import { GorseRecomendacionOrganica } from "./strategies/gorse/GorseRecomendacionOrganica";
import type {
  CategoriaItem,
  TipoFeedback,
  InteraccionFeedback,
  OpcionesNoPersonalizada,
  RecomendacionEnriquecida,
} from "./tipos";

// ─── Opciones de Configuración ───────────────────────────────────────────────

/**
 * Permite inyectar estrategias concretas al construir el sistema.
 * Cada sub-estrategia es independiente e intercambiable.
 */
export interface OpcionesSistemaRecomendacion {
  feedback?: IFeedbackStrategy;
  recomendacionHibrida?: IRecomendacionHibridaStrategy;
  recomendacionOrganica?: IRecomendacionOrganicaStrategy;
}

// ─── Contexto ────────────────────────────────────────────────────────────────

/**
 * SistemaRecomendacion — Contexto del patrón Strategy.
 *
 * Compone 3 sub-estrategias inyectables independientemente:
 *   - Feedback (registro de interacciones)
 *   - Recomendación Híbrida (personalizada)
 *   - Recomendación Orgánica (caja blanca, no personalizada)
 *
 * Cada sub-estrategia puede ser reemplazada sin afectar a las demás.
 * Por defecto usa las implementaciones de Gorse.
 */
export class SistemaRecomendacion {
  private feedback: IFeedbackStrategy;
  private recomendacionHibrida: IRecomendacionHibridaStrategy;
  private recomendacionOrganica: IRecomendacionOrganicaStrategy;

  constructor(opciones?: OpcionesSistemaRecomendacion) {
    this.feedback = opciones?.feedback ?? new GorseFeedback();
    this.recomendacionHibrida =
      opciones?.recomendacionHibrida ?? new GorseRecomendacionHibrida();
    this.recomendacionOrganica =
      opciones?.recomendacionOrganica ?? new GorseRecomendacionOrganica();

    this.validarConsistenciaDeProveedor();
  }

  // ── Validación de consistencia de proveedor ────────────────────────────────

  /**
   * Verifica que todas las sub-estrategias pertenezcan al mismo proveedor.
   * Lanza un error inmediato si se detecta una mezcla (e.g. Gorse + Alibaba),
   * ya que combinar motores diferentes causaría inconsistencias graves en
   * el feedback y las recomendaciones.
   */
  private validarConsistenciaDeProveedor(): void {
    const proveedores = {
      feedback: this.feedback.proveedor,
      recomendacionHibrida: this.recomendacionHibrida.proveedor,
      recomendacionOrganica: this.recomendacionOrganica.proveedor,
    };

    const unicos = new Set(Object.values(proveedores));

    if (unicos.size > 1) {
      const detalle = Object.entries(proveedores)
        .map(([estrategia, proveedor]) => `  - ${estrategia}: "${proveedor}"`)
        .join("\n");

      throw new Error(
        `[SistemaRecomendacion] Todas las estrategias deben pertenecer al mismo proveedor.\n` +
          `Se detectó una mezcla de proveedores:\n${detalle}\n` +
          `Esto causaría inconsistencias entre el feedback registrado y las recomendaciones generadas.`
      );
    }
  }

  // ── Delegación: Feedback ───────────────────────────────────────────────────

  /**
   * Registra una interacción (feedback) de un usuario con un ítem.
   */
  async registrarFeedback(
    idCliente: string,
    idItem: string,
    categoriaItem: CategoriaItem,
    tipo: TipoFeedback,
    valor?: number
  ): Promise<void> {
    return this.feedback.registrarFeedback(
      idCliente,
      idItem,
      categoriaItem,
      tipo,
      valor
    );
  }

  /**
   * Registra múltiples interacciones de una sola vez.
   */
  async registrarFeedbackMasivo(
    interacciones: InteraccionFeedback[]
  ): Promise<void> {
    return this.feedback.registrarFeedbackMasivo(interacciones);
  }

  // ── Delegación: Recomendación Híbrida ──────────────────────────────────────

  /**
   * Obtiene recomendaciones híbridas filtradas por tipo de ítem.
   */
  async obtenerRecomendacionesHibridasPorTipo(
    idCliente: string,
    categoriaItem: CategoriaItem,
    n?: number
  ): Promise<RecomendacionEnriquecida[]> {
    return this.recomendacionHibrida.obtenerRecomendacionesHibridasPorTipo(
      idCliente,
      categoriaItem,
      n
    );
  }

  // ── Delegación: Recomendación Orgánica ─────────────────────────────────────

  /**
   * Obtiene ítems trending (fórmula caja blanca).
   */
  async obtenerTrending(
    opciones?: OpcionesNoPersonalizada
  ): Promise<RecomendacionEnriquecida[]> {
    return this.recomendacionOrganica.obtenerTrending(opciones);
  }
}

// ─── Instancia singleton ─────────────────────────────────────────────────────

export const sistemaRecomendacion = new SistemaRecomendacion();
