import { ServicioRedis } from "@/lib/cache/servicioRedis";

// Clase para el caché de peticiones API
// Utiliza agregación en lugar de herencia al componerse de una instancia de ServicioRedis
export class ApiCacheCrud {
  private baseCrud: ServicioRedis;
  private prefix: string;
  private expiracionSegundos: number;

  constructor(prefix: string, expiracionSegundos: number) {
    this.baseCrud = ServicioRedis.obtenerInstancia();
    this.prefix = prefix;
    this.expiracionSegundos = expiracionSegundos;
  }

  /**
   * CREATE: Guarda la respuesta de una API en caché
   * @param discriminante Identificador de la petición (ej: 'api:negocios:lista')
   * @param valor Datos a cachear (serán transformados a JSON)
   */
  async crearEnCache<T>(discriminante: string, valor: T): Promise<void> {
    var clavePrefijada = `${this.prefix}${discriminante}`;
    await this.baseCrud.crearEnCache(clavePrefijada, valor, this.expiracionSegundos);
  }

  /**
   * UPDATE: Actualiza la respuesta de una API en caché
   * @param clavePrefijadaX Identificador de la petición (ej: 'api:negocios:lista')
   * @param valor Datos a cachear (serán transformados a JSON)
   */
  async actualizarEnCache<T>(discriminante: string, valor: T): Promise<void> {
    var clavePrefijadaX = `${this.prefix}${discriminante}`;
    const valorExistente = await this.obtenerDeCache<unknown>(clavePrefijadaX);

    if (valorExistente !== null) {
      const tipoExistente = Array.isArray(valorExistente) ? "array" : typeof valorExistente;
      const tipoNuevo = Array.isArray(valor) ? "array" : typeof valor;

      if (tipoExistente !== tipoNuevo) {
        throw new Error(
          `Error de tipo: No se puede actualizar la clave '${clavePrefijadaX}' con un valor de tipo '${tipoNuevo}' porque el valor existente es de tipo '${tipoExistente}'.`
        );
      }
    }


    await this.baseCrud.actualizarEnCache(clavePrefijadaX, valor, this.expiracionSegundos);
  }

  /**
   * READ: Recupera datos de la caché
   * @param clave Identificador de la petición
   * @returns Los datos en su formato original, o null si no se encontró / expiró
   */
  async obtenerDeCache<T>(discriminante: string): Promise<T | null> {
    const clavePrefijada = `${this.prefix}${discriminante}`;
    return this.baseCrud.obtenerDeCache<T>(clavePrefijada);
  }

  /**
   * DELETE: Elimina un registro de la caché
   * (Muy útil para invalidar caché cuando creas/actualizas/borras en la base de datos principal)
   * @param clave Identificador de la petición
   */
  async eliminarDeCache(discriminante: string): Promise<void> {
    const clavePrefijada = `${this.prefix}${discriminante}`;
    await this.baseCrud.eliminarDeCache(clavePrefijada);
  }

  /**
   * DELETE ALL: Limpia completamente la base de datos actual en Redis
   * Úsalo con precaución, ideal para emergencias o despliegues grandes
   */
  async limpiarTodaLaCache(): Promise<void> {
    await this.baseCrud.limpiarTodaLaCache();
  }
}

