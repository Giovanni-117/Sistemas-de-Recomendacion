import { postApi } from '@/components/manipularAPI';
import type { CategoriaItem, TipoFeedback } from '@/lib/sistemaRecomendacion';

export interface RegistrarFeedbackParams {
  idItem: string;
  categoriaItem: CategoriaItem;
  tipo: TipoFeedback;
}

/**
 * Función centralizada para registrar feedback en el sistema de recomendaciones.
 * Permite aislar y configurar las peticiones del lado del cliente para una mayor mantenibilidad.
 */
export const RegistrarFeedbackRecomendacion = async ({
  idItem,
  categoriaItem,
  tipo,
}: RegistrarFeedbackParams): Promise<void> => {
  try {
    await postApi("/cliente/explorar/registrarFeedbackRecomendacion", {
      method: "POST",
      body: {
        idItem,
        categoriaItem,
        tipo,
      },
    });
  } catch (error) {
    // Aquí se pueden añadir futuras configuraciones como retries,
    // envío a herramientas de tracking de errores, o mostrar notificaciones.
    console.error("[FeedbackRecomendacion] Error al registrar:", error);
  }
};
