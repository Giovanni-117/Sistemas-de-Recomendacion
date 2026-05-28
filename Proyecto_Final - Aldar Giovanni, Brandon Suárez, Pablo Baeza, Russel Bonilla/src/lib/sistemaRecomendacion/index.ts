// ─── Barrel Export — Sistema de Recomendación ────────────────────────────────

// Tipos públicos
export * from "./tipos";

// Interfaces (contratos)
export type { IFeedbackStrategy } from "./interfaces/IFeedbackStrategy";
export type { IRecomendacionHibridaStrategy } from "./interfaces/IRecomendacionHibridaStrategy";
export type { IRecomendacionOrganicaStrategy } from "./interfaces/IRecomendacionOrganicaStrategy";

// Contexto + singleton
export {
  SistemaRecomendacion,
  sistemaRecomendacion,
} from "./sistemaRecomendacion";
export type { OpcionesSistemaRecomendacion } from "./sistemaRecomendacion";

// Estrategias concretas (para inyección directa)
export { GorseFeedback } from "./strategies/gorse/GorseFeedback";
export { GorseRecomendacionHibrida } from "./strategies/gorse/GorseRecomendacionHibrida";
export { GorseRecomendacionOrganica } from "./strategies/gorse/GorseRecomendacionOrganica";
