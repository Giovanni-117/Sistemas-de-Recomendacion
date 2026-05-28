import { generarCookieCerrarSesionCliente } from "@/lib/auth/jwtCliente";
import { crearEndpoint, respuestaExitosa } from "@/lib";

export const POST = crearEndpoint(async ({ requestId }) => {
  const cookie = generarCookieCerrarSesionCliente();

  return respuestaExitosa(
    null,
    requestId,
    "Sesión cerrada exitosamente.",
    200,
    { "Set-Cookie": cookie }
  );
});
