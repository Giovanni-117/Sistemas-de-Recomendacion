import type {
  CategoriaItem,
  TipoFeedback,
  InteraccionFeedback,
} from "../tipos";

/**
 * Contrato mínimo para el registro de feedback (interacciones usuario ↔ ítem).
 *
 * Solo expone los métodos que la aplicación consume actualmente.
 * Las implementaciones concretas pueden tener métodos adicionales
 * (e.g. eliminarFeedback) que permanecen ocultos hasta que se necesiten.
 */
export interface IFeedbackStrategy {
  /** Identificador del paquete/proveedor de esta estrategia (e.g. "gorse") */
  readonly proveedor: string;

  registrarFeedback(
    idCliente: string,
    idItem: string,
    categoriaItem: CategoriaItem,
    tipo: TipoFeedback,
    valor?: number
  ): Promise<void>;

  registrarFeedbackMasivo(
    interacciones: InteraccionFeedback[]
  ): Promise<void>;
}
