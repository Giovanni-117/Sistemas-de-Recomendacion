import type { CategoriaItem, RecomendacionEnriquecida } from "../../tipos";
import { servicioGorse } from "../../servicioGorse";
import {
  construirItemId,
  enriquecerResultados,
  NOMBRE_ITEM_TO_ITEM,
  NOMBRE_USER_TO_USER,
  type ResultadoRecomendacion,
  type OpcionesItemAItem,
  type OpcionesUsuarioAUsuario,
} from "./gorseUtilidades";

// ─── Implementación Gorse — Vecinos (Item-to-Item, User-to-User) ─────────────

/**
 * Estrategia de vecinos basada en Gorse.
 *
 * Sin contrato (interfaz) — implementación interna pura.
 * Para exponerla, crear IVecinosStrategy con los métodos necesarios
 * y agregarla al Contexto.
 *
 * Ranking y Boosting:
 *   El Ranking lo realiza el Ranker FM (Factorization Machines) configurado
 *   en config.toml → [recommend.ranker].
 *
 *   El Boosting es IMPLÍCITO: los non-personalized recommenders inyectan
 *   ítems trending como candidatos adicionales al pool de candidatos;
 *   el FM decide si subirlos o bajarlos según el perfil del usuario.
 */
export class GorseVecinos {
  /**
   * Obtiene ítems similares a un ítem dado (Item-to-Item neighbors).
   *
   * Usa el recommender `neighbors` (basado en tags/labels del ítem).
   * Es uno de los componentes que el Ranker FM usa para generar candidatos.
   */
  async obtenerItemsSimilaresPorTags(
    idItem: string,
    categoriaItem: CategoriaItem,
    opciones?: OpcionesItemAItem
  ): Promise<RecomendacionEnriquecida[]> {
    const resultados =
      await servicioGorse.obtenerRecomendacionElementoAElemento(
        NOMBRE_ITEM_TO_ITEM.NEIGHBORS,
        construirItemId(categoriaItem, idItem),
        {
          n: opciones?.n ?? 10,
          offset: opciones?.offset,
          category: opciones?.categoria,
        }
      );

    return enriquecerResultados(resultados as ResultadoRecomendacion[]);
  }

  /**
   * Obtiene ítems con co-visita (Item-to-Item covisit).
   *
   * Usa el recommender `covisit` (basado en usuarios que interactuaron con
   * los mismos ítems). Es otro componente del pool de candidatos del Ranker FM.
   */
  async obtenerItemsSimilaresPorCovisita(
    idItem: string,
    categoriaItem: CategoriaItem,
    opciones?: OpcionesItemAItem
  ): Promise<RecomendacionEnriquecida[]> {
    const resultados =
      await servicioGorse.obtenerRecomendacionElementoAElemento(
        NOMBRE_ITEM_TO_ITEM.COVISIT,
        construirItemId(categoriaItem, idItem),
        {
          n: opciones?.n ?? 10,
          offset: opciones?.offset,
          category: opciones?.categoria,
        }
      );

    return enriquecerResultados(resultados as ResultadoRecomendacion[]);
  }

  /**
   * Obtiene usuarios similares a un usuario dado (User-to-User).
   *
   * Usa el recommender `similar_users` (basado en ítems favoritos en común).
   * Útil para implementar funcionalidades sociales o "usuarios como tú también…".
   */
  async obtenerUsuariosSimilares(
    idCliente: string,
    opciones?: OpcionesUsuarioAUsuario
  ): Promise<ResultadoRecomendacion[]> {
    const resultados =
      await servicioGorse.obtenerRecomendacionUsuarioAUsuario(
        NOMBRE_USER_TO_USER.SIMILAR_USERS,
        idCliente,
        {
          n: opciones?.n ?? 10,
          offset: opciones?.offset,
        }
      );

    return resultados as ResultadoRecomendacion[];
  }

  /**
   * Obtiene los vecinos más cercanos de un usuario según el modelo embebido.
   * Utiliza la API nativa de Gorse para vecinos de usuario.
   */
  async obtenerVecinosDeUsuario(
    idCliente: string,
    n: number = 10
  ): Promise<ResultadoRecomendacion[]> {
    // getUserNeighbors retorna string[] (solo IDs de usuarios)
    const userIds = await servicioGorse.obtenerVecinosDeUsuario({
      userId: idCliente,
      cursorOptions: { n },
    });

    return (userIds as string[]).map((id, index) => ({
      Id: id,
      Score: userIds.length - index,
    }));
  }

  /**
   * Obtiene los vecinos más cercanos de un ítem según el modelo embebido.
   * Utiliza la API nativa de Gorse para vecinos de ítem.
   */
  async obtenerVecinosDeItem(
    idItem: string,
    categoriaItem: CategoriaItem,
    n: number = 10
  ): Promise<RecomendacionEnriquecida[]> {
    // getItemNeighbors retorna Score[] (con Id y Score)
    const resultados = await servicioGorse.obtenerVecinosDeElemento({
      itemId: construirItemId(categoriaItem, idItem),
      cursorOptions: { n },
    });

    return enriquecerResultados(resultados as ResultadoRecomendacion[]);
  }
}
