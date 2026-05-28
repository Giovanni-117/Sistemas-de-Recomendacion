import sharp from "sharp";
import { ServicioAlmacenamientoMinio } from "@/lib/almacenamientoImagenes/servicioS3";

export class ManipulacionImagenesCrud {
    private storageService: ServicioAlmacenamientoMinio;

    constructor() {
        this.storageService = ServicioAlmacenamientoMinio.obtenerInstancia();
    }

    /**
     * Helper interno para homogeneizar el formato a Buffer
     */
    private async obtenerBuffer(archivo: Buffer | Uint8Array | Blob): Promise<Buffer> {
        if (Buffer.isBuffer(archivo)) {
            return archivo;
        } else if (archivo instanceof Uint8Array) {
            return Buffer.from(archivo);
        } else if (typeof archivo.arrayBuffer === "function") {
            return Buffer.from(await archivo.arrayBuffer());
        } else {
            throw new Error("Formato de archivo no soportado.");
        }
    }

    /**
     * Asegura que el nombre termine siempre en .webp
     */
    private generarNombreWebp(nombreOriginal: string): string {
        return `${nombreOriginal.replace(/\.[^/.]+$/, "")}.webp`;
    }

    /**
     * CREATE: Optimiza la imagen convirtiéndola a WebP y la guarda en MinIO
     * @param archivo Contenido de la imagen
     * @param nombreArchivo Nombre del archivo, su extensión será reemplazada a .webp
     * @returns URL pública de la imagen
     */
    async guardarImagen(archivo: Buffer | Uint8Array | Blob, nombreArchivo: string): Promise<string> {
        const bufferOriginal = await this.obtenerBuffer(archivo);

        // Optimización extrema con sharp
        const bufferOptimizado = await sharp(bufferOriginal)
            .resize({
                width: 1280, // Ancho máximo recomendado para imágenes en web
                withoutEnlargement: true, // No estira imágenes pequeñas
                fit: "inside" // Mantiene las proporciones originales
            })
            // Sharp por defecto elimina todos los metadatos (EXIF, perfiles de color pesados, etc.)
            // al no llamar a .withMetadata() o .keepMetadata(), asegurando privacidad y menor peso.
            .webp({
                quality: 75, // Ajuste óptimo entre calidad y peso (por defecto es 80)
                alphaQuality: 80, // Reduce también el peso de la transparencia (canal alfa)
                effort: 6, // Máximo nivel de compresión de CPU (escala 0-6). Tarda unos ms extra pero reduce el tamaño.
                smartSubsample: true, // Algoritmo inteligente de submuestreo de color para evitar artefactos en bordes
                force: true // Fuerza la salida a formato WebP sin importar la entrada
            })
            .toBuffer();

        const nombreWebp = this.generarNombreWebp(nombreArchivo);

        return await this.storageService.guardarImagen(bufferOptimizado, nombreWebp, "image/webp");
    }

    /**
     * READ: Recupera la URL de la imagen en formato .webp
     * @param nombreArchivo Nombre original o de la imagen
     */
    obtenerUrlImagen(nombreArchivo: string): string {
        const nombreWebp = this.generarNombreWebp(nombreArchivo);
        return this.storageService.obtenerUrlImagen(nombreWebp);
    }

    /**
     * UPDATE: Optimiza y actualiza la imagen existente
     * @param archivo Nuevo contenido
     * @param nombreArchivo Nombre del archivo a sobrescribir
     */
    async actualizarImagen(archivo: Buffer | Uint8Array | Blob, nombreArchivo: string): Promise<string> {
        return await this.guardarImagen(archivo, nombreArchivo);
    }

    /**
     * DELETE: Elimina la imagen de la cubeta de S3
     * @param nombreArchivo Nombre del archivo a eliminar
     */
    async eliminarImagen(nombreArchivo: string): Promise<void> {
        const nombreWebp = this.generarNombreWebp(nombreArchivo);
        await this.storageService.eliminarImagen(nombreWebp);
    }
}

// Exportamos un singleton para no tener que instanciarlo en cada lugar
export const manipulacionImagenes = new ManipulacionImagenesCrud();
