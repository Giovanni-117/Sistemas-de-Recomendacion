import { verificarAutenticacionCliente } from "@/lib/auth/jwtCliente";
import { crearEndpoint, respuestaExitosa, respuestaError, ErrorAutenticacion  } from "@/lib";
import type {  VerificarSesionClienteResponse} from "@/lib/api/tiposApi/sesiones";

export const GET = crearEndpoint(async ({ request, requestId }) => {
  const payload = verificarAutenticacionCliente(request);

  if (!payload) {
    return respuestaError(new ErrorAutenticacion(), requestId);
  }

  const data: VerificarSesionClienteResponse = { autenticado: true, cliente: { idCliente: payload.idCliente, numeroCelular: payload.numeroCelular } };
  return respuestaExitosa(data, requestId);
});

export const POST = GET;
