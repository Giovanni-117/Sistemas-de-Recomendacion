import type { CategoriaItem, RecomendacionEnriquecida } from "../tipos";

/**
 * Contrato mínimo para recomendaciones híbridas personalizadas.
 *
 * Solo expone el método que la aplicación consume actualmente.
 * Las implementaciones concretas pueden tener métodos adicionales
 * (e.g. obtenerRecomendacionesPorSesion, obtenerRecomendacionesColaborativas)
 * que permanecen ocultos hasta que se necesiten.
 */
export interface IRecomendacionHibridaStrategy {
  /** Identificador del paquete/proveedor de esta estrategia (e.g. "gorse") */
  readonly proveedor: string;

  obtenerRecomendacionesHibridasPorTipo(
    idCliente: string,
    categoriaItem: CategoriaItem,
    n?: number
  ): Promise<RecomendacionEnriquecida[]>;
}
