// ─── Tipos Públicos del Sistema de Recomendación ─────────────────────────────
// Solo los tipos que los consumidores externos necesitan.
// Los tipos internos de cada implementación permanecen ocultos.

/** Tipos de feedback registrados en el motor de recomendación */
export type TipoFeedback =
  | "like"
  | "purchase"
  | "star"
  | "view"
  | "read"
  | "dislike";

/** Categoría lógica de un ítem */
export type CategoriaItem = "negocio" | "producto" | "cupon";

/** Resultado enriquecido de una recomendación */
export interface RecomendacionEnriquecida {
  Id: string;
  Score: number;
  categoriaItem: CategoriaItem;
  idOriginal: string;
}

/** Opciones para recomendaciones no personalizadas */
export interface OpcionesNoPersonalizada {
  n?: number;
  offset?: number;
  categoria?: string;
}

/** Datos de una interacción para registro masivo */
export interface InteraccionFeedback {
  idCliente: string;
  idItem: string;
  categoriaItem: CategoriaItem;
  tipo: TipoFeedback;
  timestamp?: string;
  valor?: number;
}
