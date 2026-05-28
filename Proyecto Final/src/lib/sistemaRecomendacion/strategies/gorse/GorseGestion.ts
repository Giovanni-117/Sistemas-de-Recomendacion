import type { CategoriaItem, TipoFeedback } from "../../tipos";
import { servicioGorse } from "../../servicioGorse";
import { construirItemId } from "./gorseUtilidades";

// ─── Implementación Gorse — Gestión del Servicio ─────────────────────────────

/**
 * Estrategia de gestión basada en Gorse.
 *
 * Sin contrato (interfaz) — implementación interna pura.
 * Para exponerla, crear IGestionServicioStrategy con los métodos necesarios
 * y agregarla al Contexto.
 *
 * Agrupa eliminación de entidades en Gorse, verificación de salud
 * y consulta de historial de interacciones.
 */
export class GorseGestion {
  /**
   * Elimina un usuario de Gorse (no de la BD).
   */
  async eliminarUsuarioDeGorse(idCliente: string): Promise<void> {
    await servicioGorse.eliminarUsuario(idCliente);
  }

  /**
   * Elimina un ítem de Gorse (no de la BD).
   */
  async eliminarItemDeGorse(
    idItem: string,
    categoriaItem: CategoriaItem
  ): Promise<void> {
    await servicioGorse.eliminarElemento(
      construirItemId(categoriaItem, idItem)
    );
  }

  /**
   * Verifica que el servicio Gorse esté activo y respondiendo.
   */
  async verificarSaludDelServicio(): Promise<{
    live: boolean;
    ready: boolean;
  }> {
    try {
      const [live, ready] = await Promise.all([
        servicioGorse.comprobarSalud(),
        servicioGorse.comprobarLista(),
      ]);
      return { live: !!live, ready: !!ready };
    } catch {
      return { live: false, ready: false };
    }
  }

  /**
   * Obtiene todo el historial de interacciones de un usuario.
   */
  async obtenerHistorialUsuario(idCliente: string) {
    return servicioGorse.obtenerInteraccionesDeUsuario(idCliente);
  }

  /**
   * Obtiene las interacciones de un usuario filtradas por tipo.
   */
  async obtenerHistorialUsuarioPorTipo(
    idCliente: string,
    tipo: TipoFeedback
  ) {
    return servicioGorse.obtenerInteraccionesDeUsuarioPorTipo(idCliente, tipo);
  }

  /**
   * Obtiene todas las interacciones registradas sobre un ítem.
   */
  async obtenerInteraccionesDeItem(
    idItem: string,
    categoriaItem: CategoriaItem
  ) {
    return servicioGorse.obtenerInteraccionesDeElemento(
      construirItemId(categoriaItem, idItem)
    );
  }
}
