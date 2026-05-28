import { ServicioRedis } from "@/lib/cache/servicioRedis";

// Clase para manejar el estado de las recompensas diarias de los usuarios en Redis
// Utiliza agregación al componerse de una instancia de ServicioRedis
export class RecompensasDiariasCacheCrud {
  private baseCrud: ServicioRedis;
  private prefix = "reward:"; // Prefijo para distinguir los registros de recompensas

  constructor() {
    this.baseCrud = ServicioRedis.obtenerInstancia();
  }

  /**
   * Registra que el usuario ha reclamado su recompensa diaria.
   * Automáticamente establece un TTL (tiempo de vida) de 24 horas.
   * Guarda únicamente una bandera lógica indicando que ya se reclamó.
   * 
   * @param userId Identificador único del usuario
   */
  async reclamarRecompensa(userId: string): Promise<void> {
    const clave = `${this.prefix}${userId}`;
    const EXPIRACION_24_HORAS = 86400; // 24 horas en segundos

    await this.baseCrud.crearEnCache(clave, true, EXPIRACION_24_HORAS);
  }

  /**
   * Verifica si el usuario ya ha reclamado su recompensa diaria (si aún existe el registro antes de expirar).
   * 
   * @param userId Identificador único del usuario
   * @returns `true` si el usuario ya reclamó su recompensa en las últimas 24 horas, `false` en caso contrario.
   */
  async yaReclamoRecompensa(userId: string): Promise<boolean> {
    const clave = `${this.prefix}${userId}`;
    const data = await this.baseCrud.obtenerDeCache<boolean>(clave);

    return data !== null;
  }

  /**
   * Resetea/elimina manualmente el registro de recompensa de un usuario.
   * (Útil para herramientas de administración o testing).
   * 
   * @param userId Identificador único del usuario
   */
  async resetearRecompensa(userId: string): Promise<void> {
    const clave = `${this.prefix}${userId}`;
    await this.baseCrud.eliminarDeCache(clave);
  }
}
