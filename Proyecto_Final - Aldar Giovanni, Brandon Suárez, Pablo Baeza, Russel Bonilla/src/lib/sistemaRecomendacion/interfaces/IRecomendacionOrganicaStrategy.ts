import type { OpcionesNoPersonalizada, RecomendacionEnriquecida } from "../tipos";

/**
 * Contrato mínimo para recomendaciones orgánicas / caja blanca.
 *
 * Solo expone el método que la aplicación consume actualmente.
 * Las implementaciones concretas pueden tener métodos adicionales
 * (e.g. obtenerUltimos, obtenerMasGustadosSemanal, obtenerMasComprados)
 * que permanecen ocultos hasta que se necesiten.
 */
export interface IRecomendacionOrganicaStrategy {
  /** Identificador del paquete/proveedor de esta estrategia (e.g. "gorse") */
  readonly proveedor: string;

  obtenerTrending(
    opciones?: OpcionesNoPersonalizada
  ): Promise<RecomendacionEnriquecida[]>;
}
