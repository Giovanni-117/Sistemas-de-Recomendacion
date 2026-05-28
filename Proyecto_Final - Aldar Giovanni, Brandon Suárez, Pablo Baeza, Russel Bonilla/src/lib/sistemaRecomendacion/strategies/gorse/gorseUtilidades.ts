// ─── Utilidades Internas de Gorse ────────────────────────────────────────────
// Tipos, constantes y funciones de conversión de IDs exclusivos de la
// implementación Gorse. Estos detalles permanecen ocultos para los consumidores.

import type { CategoriaItem, RecomendacionEnriquecida } from "../../tipos";

// ─── Tipos internos ──────────────────────────────────────────────────────────

/** Resultado genérico de una recomendación de Gorse (uso interno) */
export interface ResultadoRecomendacion {
  Id: string;
  Score: number;
}

/** Opciones para la recomendación híbrida principal */
export interface OpcionesRecomendacionHibrida {
  n?: number;
  offset?: number;
  categoria?: string;
}

/** Opciones para recomendaciones item-to-item */
export interface OpcionesItemAItem {
  n?: number;
  offset?: number;
  categoria?: string;
}

/** Opciones para recomendaciones user-to-user */
export interface OpcionesUsuarioAUsuario {
  n?: number;
  offset?: number;
}

// ─── Prefijos de ítems para distinguir entidades en Gorse ────────────────────

export const PREFIJO_NEGOCIO = "neg_";
export const PREFIJO_PRODUCTO = "prod_";
export const PREFIJO_CUPON = "cup_";

const PREFIJOS: Record<CategoriaItem, string> = {
  negocio: PREFIJO_NEGOCIO,
  producto: PREFIJO_PRODUCTO,
  cupon: PREFIJO_CUPON,
};

// ─── Nombres de los recommenders configurados en config.toml ─────────────────

export const NOMBRE_NON_PERSONALIZED = {
  TRENDING: "trending",
  LATEST: "latest",
  MOST_LIKED_WEEKLY: "most_liked_weekly",
  TOP_PURCHASED: "top_purchased",
} as const;

export const NOMBRE_ITEM_TO_ITEM = {
  NEIGHBORS: "neighbors",
  COVISIT: "covisit",
} as const;

export const NOMBRE_USER_TO_USER = {
  SIMILAR_USERS: "similar_users",
} as const;

// ─── Funciones de conversión de IDs ──────────────────────────────────────────

/**
 * Convierte un ID de la base de datos a un ItemId de Gorse con prefijo.
 */
export function construirItemId(categoria: CategoriaItem, id: string): string {
  return `${PREFIJOS[categoria]}${id}`;
}

/**
 * Parsea un ItemId de Gorse y extrae la categoría y el ID original.
 */
export function parsearItemId(gorseItemId: string): {
  categoriaItem: CategoriaItem;
  idOriginal: string;
} {
  if (gorseItemId.startsWith(PREFIJO_NEGOCIO)) {
    return {
      categoriaItem: "negocio",
      idOriginal: gorseItemId.slice(PREFIJO_NEGOCIO.length),
    };
  }
  if (gorseItemId.startsWith(PREFIJO_PRODUCTO)) {
    return {
      categoriaItem: "producto",
      idOriginal: gorseItemId.slice(PREFIJO_PRODUCTO.length),
    };
  }
  if (gorseItemId.startsWith(PREFIJO_CUPON)) {
    return {
      categoriaItem: "cupon",
      idOriginal: gorseItemId.slice(PREFIJO_CUPON.length),
    };
  }
  // Fallback: asumir que es un producto sin prefijo
  return { categoriaItem: "producto", idOriginal: gorseItemId };
}

/**
 * Enriquece un arreglo de resultados de Gorse con la categoría e ID original.
 */
export function enriquecerResultados(
  resultados: ResultadoRecomendacion[]
): RecomendacionEnriquecida[] {
  return resultados.map((r) => {
    const { categoriaItem, idOriginal } = parsearItemId(r.Id);
    return { ...r, categoriaItem, idOriginal };
  });
}
