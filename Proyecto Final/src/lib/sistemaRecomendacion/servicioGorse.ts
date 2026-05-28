import {
  Gorse,
  type User,
  type Item,
  type Feedback,
  type RecommendOptions,
  type ItemPatch,
  type ItemNeighborsOptions,
  type UserNeighborsOptions,
  type CursorOptions,
  type FeedbackFilter,
  type LatestOptions,
  type SessionRecommendOptions
} from "gorsejs";

export interface OpcionesRecomendacionAdicional {
  n?: number;
  offset?: number;
  category?: string;
  "user-id"?: string;
}

export interface OpcionesUsuariosAdicional {
  n?: number;
  offset?: number;
}

export class ServicioGorse {
  private cliente: Gorse<string>;

  constructor() {
    this.cliente = new Gorse({
      endpoint: (import.meta.env.GORSE_ENDPOINT ) as string,  
      secret: (import.meta.env.GORSE_SECRET ) as string,
    });
  }

  // Permite acceso al cliente Axios interno para endpoints no implementados en gorsejs
  private get axiosClient() {
    return (this.cliente as any).axiosClient;
  }

  // ==========================================
  // USUARIOS (Users)
  // ==========================================

  async insertarUsuario(datosUsuario: User) {
    return this.cliente.insertUser(datosUsuario);
  }

  async obtenerUsuario(idUsuario: string) {
    return this.cliente.getUser(idUsuario);
  }

  async eliminarUsuario(idUsuario: string) {
    return this.cliente.deleteUser(idUsuario);
  }

  async actualizarUsuario(idUsuario: string, datosUsuario: User) {
    return this.cliente.updateUser(idUsuario, datosUsuario);
  }

  async obtenerUsuarios(opciones?: CursorOptions) {
    return this.cliente.getUsers(opciones);
  }

  async insertarUsuarios(usuarios: User[]) {
    return this.cliente.insertUsers(usuarios);
  }

  async obtenerVecinosDeUsuario(opciones: UserNeighborsOptions) {
    return this.cliente.getUserNeighbors(opciones);
  }

  // ==========================================
  // ELEMENTOS (Items)
  // ==========================================

  async insertarOActualizarElemento(datos: Item) {
    return this.cliente.upsertItem(datos);
  }

  async obtenerElemento(id: string) {
    return this.cliente.getItem(id);
  }

  async eliminarElemento(id: string) {
    return this.cliente.deleteItem(id);
  }

  async actualizarElemento(id: string, datos: ItemPatch) {
    return this.cliente.updateItem(id, datos);
  }

  async insertarCategoriaDeElemento(id: string, categoria: string) {
    return this.cliente.insertItemCategory(id, categoria);
  }

  async eliminarCategoriaDeElemento(id: string, categoria: string) {
    return this.cliente.deleteItemCategory(id, categoria);
  }

  async obtenerElementos(opciones?: CursorOptions) {
    return this.cliente.getItems(opciones);
  }

  async insertarOActualizarElementos(elementos: Item[]) {
    return this.cliente.upsertItems(elementos);
  }

  async obtenerVecinosDeElemento(opciones: ItemNeighborsOptions) {
    return this.cliente.getItemNeighbors(opciones);
  }

  // ==========================================
  // INTERACCIONES (Feedback)
  // ==========================================

  async insertarInteracciones(listaInteracciones: Feedback<string>[]) {
    return this.cliente.insertFeedbacks(listaInteracciones);
  }

  async insertarOActualizarInteracciones(listaInteracciones: Feedback<string>[]) {
    return this.cliente.upsertFeedbacks(listaInteracciones);
  }

  async obtenerInteraccion(filtro: FeedbackFilter<string>, opciones?: CursorOptions) {
    return this.cliente.getFeedback(filtro, opciones);
  }

  async eliminarInteraccion(filtro: FeedbackFilter<string>) {
    return this.cliente.deleteFeedback(filtro);
  }

  async obtenerInteracciones(tipo?: string, opciones?: CursorOptions) {
    return this.cliente.getFeedbacks(tipo, opciones);
  }

  async obtenerInteraccionesDeElemento(idElemento: string) {
    return this.cliente.getItemFeedback(idElemento);
  }

  async obtenerInteraccionesDeElementoPorTipo(idElemento: string, tipoInteraccion: string) {
    return this.cliente.getItemFeedbackByType(idElemento, tipoInteraccion);
  }

  async obtenerInteraccionesDeUsuario(idUsuario: string) {
    return this.cliente.getUserFeedback(idUsuario);
  }

  async obtenerInteraccionesDeUsuarioPorTipo(idUsuario: string, tipoInteraccion: string) {
    return this.cliente.getUserFeedbackByType(idUsuario, tipoInteraccion);
  }

  // ==========================================
  // RECOMENDACIONES (Recommendations)
  // ==========================================

  async obtenerRecomendaciones(opciones: RecommendOptions) {
    return this.cliente.getRecommend(opciones);
  }

  async obtenerRecomendacionesPorSesion(listaInteracciones: Feedback<string>[], opciones?: SessionRecommendOptions) {
    return this.cliente.getSessionRecommend(listaInteracciones, opciones);
  }

  async obtenerUltimos(opciones: LatestOptions) {
    return this.cliente.getLatest(opciones);
  }

  // ==========================================
  // MÉTODOS ADICIONALES (REST API Faltantes)
  // ==========================================

  async obtenerRecomendacionFiltradoColaborativo(idUsuario: string, opciones?: OpcionesRecomendacionAdicional) {
    const res = await this.axiosClient.get(`/collaborative-filtering/${idUsuario}`, { params: opciones });
    return res.data;
  }

  async obtenerInteraccionUsuarioElementoPorTipo(tipoInteraccion: string, idUsuario: string, idElemento: string) {
    const res = await this.axiosClient.get(`/feedback/${tipoInteraccion}/${idUsuario}/${idElemento}`);
    return res.data;
  }

  async eliminarInteraccionUsuarioElementoPorTipo(tipoInteraccion: string, idUsuario: string, idElemento: string) {
    const res = await this.axiosClient.delete(`/feedback/${tipoInteraccion}/${idUsuario}/${idElemento}`);
    return res.data;
  }

  async obtenerInteraccionesUsuarioElemento(idUsuario: string, idElemento: string) {
    const res = await this.axiosClient.get(`/feedback/${idUsuario}/${idElemento}`);
    return res.data;
  }

  async eliminarInteraccionesUsuarioElemento(idUsuario: string, idElemento: string) {
    const res = await this.axiosClient.delete(`/feedback/${idUsuario}/${idElemento}`);
    return res.data;
  }

  async comprobarSalud() {
    const res = await this.axiosClient.get("/health/live");
    return res.data;
  }

  async comprobarLista() {
    const res = await this.axiosClient.get("/health/ready");
    return res.data;
  }

  async obtenerRecomendacionElementoAElemento(nombre: string, idElemento: string, opciones?: OpcionesRecomendacionAdicional) {
    const res = await this.axiosClient.get(`/item-to-item/${nombre}/${idElemento}`, { params: opciones });
    return res.data;
  }

  async obtenerRecomendacionNoPersonalizada(nombre: string, opciones?: OpcionesRecomendacionAdicional) {
    const res = await this.axiosClient.get(`/non-personalized/${nombre}`, { params: opciones });
    return res.data;
  }

  async obtenerRecomendacionUsuarioAUsuario(nombre: string, idUsuario: string, opciones?: OpcionesUsuariosAdicional) {
    const res = await this.axiosClient.get(`/user-to-user/${nombre}/${idUsuario}`, { params: opciones });
    return res.data;
  }
}

// Exportamos una instancia lista para usar, similar a redisService
export const servicioGorse = new ServicioGorse();
