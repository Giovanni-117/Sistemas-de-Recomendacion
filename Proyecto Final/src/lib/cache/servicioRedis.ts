import { createClient, type RedisClientType } from "redis";

export class ServicioRedis {
  private static instancia: ServicioRedis;
  private client: RedisClientType;
  private connectionPromise: Promise<void> | null = null;

  private constructor() {
    // Configuración usando la variable de entorno REDIS_URL
    // Formato típico: redis://[password@]host:port[/db-number]
    this.client = createClient({
      url: import.meta.env.REDIS_URL || "redis://localhost:6379",
    });

    // Manejo básico de eventos
    this.client.on("error", (err) => console.error("Error en cliente Redis:", err));
    this.client.on("connect", () => console.log("Conectado a Redis exitosamente"));
    this.client.on("ready", () => console.log("Redis cliente listo"));
    this.client.on("end", () => {
      this.connectionPromise = null;
    });
  }

  public static obtenerInstancia(): ServicioRedis {
    if (!ServicioRedis.instancia) {
      ServicioRedis.instancia = new ServicioRedis();
    }
    return ServicioRedis.instancia;
  }

  /**
   * Garantiza que haya conexión activa antes de ejecutar comandos
   */
  async obtenerCliente(): Promise<RedisClientType> {
    if (this.client.isOpen) {
      return this.client;
    }

    if (!this.connectionPromise) {
      this.connectionPromise = this.client.connect().then(() => {
        // Conexión establecida con éxito
      }).catch((err) => {
        this.connectionPromise = null;
        throw err;
      });
    }

    await this.connectionPromise;
    return this.client;
  }

  async crearEnCache<T>(clave: string, valor: T, expiracionSegundos?: number): Promise<void> {
    const cliente = await this.obtenerCliente();
    const datosString = JSON.stringify(valor);

    if (expiracionSegundos) {
      await cliente.set(clave, datosString, { EX: expiracionSegundos, NX: true });
    } else {
      await cliente.set(clave, datosString, { NX: true });
    }
  }

  async actualizarEnCache<T>(clave: string, valor: T, expiracionSegundos?: number): Promise<void> {
    const cliente = await this.obtenerCliente();
    const datosString = JSON.stringify(valor);

    if (expiracionSegundos) {
      await cliente.set(clave, datosString, { EX: expiracionSegundos, XX: true });
    } else {
      await cliente.set(clave, datosString, { XX: true });
    }
  }

  async obtenerDeCache<T>(clave: string): Promise<T | null> {
    const cliente = await this.obtenerCliente();
    const datosString = await cliente.get(clave);

    if (!datosString) return null;

    try {
      return JSON.parse(datosString) as T;
    } catch (error) {
      console.error(`Error al parsear el JSON de Redis para la clave: ${clave}`, error);
      return null;
    }
  }

  async eliminarDeCache(clave: string): Promise<void> {
    const cliente = await this.obtenerCliente();
    await cliente.del(clave);
  }

  async limpiarTodaLaCache(): Promise<void> {
    const cliente = await this.obtenerCliente();
    await cliente.flushDb();
  }
}


