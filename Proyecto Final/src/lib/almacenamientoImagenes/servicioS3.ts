import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";


export class ServicioAlmacenamientoMinio {
  private static instancia: ServicioAlmacenamientoMinio;
  private client: S3Client;
  private bucketName: string;

  private constructor() {
    this.bucketName = import.meta.env.MINIO_BUCKET;

    this.client = new S3Client({
      endpoint: import.meta.env.MINIO_ENDPOINT,
      region: import.meta.env.MINIO_REGION,
      forcePathStyle: true,
      credentials: {
        accessKeyId: import.meta.env.MINIO_ACCESS_KEY,
        secretAccessKey: import.meta.env.MINIO_SECRET_KEY,
      },
    });
  }

  public static obtenerInstancia(): ServicioAlmacenamientoMinio {
    if (!ServicioAlmacenamientoMinio.instancia) {
      ServicioAlmacenamientoMinio.instancia = new ServicioAlmacenamientoMinio();
    }
    return ServicioAlmacenamientoMinio.instancia;
  }

  /**
   * Verifica si existe el bucket y en caso de que no lo crea
   */


  /**
   * CREATE: Sube una nueva imagen a MinIO
   * @param archivo El contenido de la imagen
   * @param nombreArchivo Nombre único en el bucket
   * @param tipoContenido Tipo MIME (ej. "image/png")
   * @returns La URL pública de la imagen
   */
  async guardarImagen(archivo: Buffer | Uint8Array | Blob, nombreArchivo: string, tipoContenido: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: nombreArchivo,
      Body: archivo,
      ContentType: tipoContenido,
    });

    await this.client.send(command);

    return this.obtenerUrlImagen(nombreArchivo);
  }

  /**
   * READ: Recupera la URL pública de la imagen guardada
   * @param nombreArchivo Nombre del archivo en el bucket
   * @returns URL completa para acceder a la imagen
   */
  obtenerUrlImagen(nombreArchivo: string): string {
    // Si usas Docker, el endpoint interno (ej. http://minio:9000) puede diferir de la URL pública.
    // MINIO_PUBLIC_URL te permite definir cómo se accede desde el exterior (ej. https://s3.midominio.com).
    const endpointPublico = import.meta.env.MINIO_PUBLIC_URL || import.meta.env.MINIO_ENDPOINT;
    const baseUrl = endpointPublico.endsWith("/") ? endpointPublico.slice(0, -1) : endpointPublico;

    return `${baseUrl}/${this.bucketName}/${nombreArchivo}`;
  }

  /**
   * UPDATE: Actualiza una imagen existente
   * En sistemas S3/MinIO, actualizar es simplemente sobreescribir usando la misma llave (Key).
   */
  async actualizarImagen(archivo: Buffer | Uint8Array | Blob, nombreArchivo: string, tipoContenido: string): Promise<string> {
    return await this.guardarImagen(archivo, nombreArchivo, tipoContenido);
  }

  /**
   * DELETE: Elimina una imagen de MinIO
   * @param nombreArchivo Nombre del archivo en el bucket
   */
  async eliminarImagen(nombreArchivo: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: nombreArchivo,
    });

    await this.client.send(command);
  }
}


