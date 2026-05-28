import { db } from "@/lib/db";
import { authOtp, authSesion, cliente } from "@/lib/db/schema";
import { eq, and, gt, desc } from "drizzle-orm";
import { firmarTokenCliente, generarCookieSesionCliente } from "@/lib/auth/jwtCliente";
import {
  crearEndpoint,
  parsearJsonBody,
  validarCamposRequeridos,
  normalizarCelularMX,
  respuestaExitosa,
  ErrorNoEncontrado,
  ErrorAutenticacion,
  ErrorLimitePeticiones,
  
} from "@/lib";

import type { VerificarOtpRequest, ClienteSesionData, VerificarOtpClienteResponse} from "@/lib/api/tiposApi/sesiones";


const MAX_INTENTOS_FALLIDOS = 5;
const BLOQUEO_MINUTOS = 15;
const SESION_DURACION_DIAS = 7;

async function buscarOtpActivo(celularE164: string) {
  const ahora = new Date();
  const resultado = await db.select().from(authOtp)
    .where(and(eq(authOtp.numeroCelular, celularE164), eq(authOtp.consumido, false), gt(authOtp.expiracion, ahora)))
    .orderBy(desc(authOtp.fechaCreacion)).limit(1);
  if (resultado.length === 0) throw new ErrorNoEncontrado("No hay un código de verificación activo. Solicita uno nuevo");
  return resultado[0];
}

function verificarBloqueo(otp: { bloqueadoHasta: Date | null }): void {
  const ahora = new Date();
  if (otp.bloqueadoHasta && otp.bloqueadoHasta > ahora) {
    const mins = Math.ceil((otp.bloqueadoHasta.getTime() - ahora.getTime()) / 60000);
    throw new ErrorLimitePeticiones(`Demasiados intentos fallidos. Intenta en ${mins} minuto(s).`);
  }
}

async function registrarIntentoFallido(idOtp: string, intentosActuales: number): Promise<number> {
  const nuevos = intentosActuales + 1;
  const update: Record<string, unknown> = { intentosFallidos: nuevos };
  if (nuevos >= MAX_INTENTOS_FALLIDOS) {
    update.bloqueadoHasta = new Date(Date.now() + BLOQUEO_MINUTOS * 60 * 1000);
  }
  await db.update(authOtp).set(update).where(eq(authOtp.idOtp, idOtp));
  return MAX_INTENTOS_FALLIDOS - nuevos;
}

async function consumirOtpYCrearSesion(otp: typeof authOtp.$inferSelect, celularE164: string): Promise<{ token: string; clienteData: ClienteSesionData }> {
  await db.update(authOtp).set({ consumido: true }).where(eq(authOtp.idOtp, otp.idOtp));

  const clienteData = await db.select().from(cliente).where(eq(cliente.idCliente, otp.idCliente)).limit(1);
  if (clienteData.length === 0) throw new ErrorNoEncontrado("Cliente");

  const token = firmarTokenCliente({ idCliente: otp.idCliente, numeroCelular: celularE164 });
  const fechaExpiracion = new Date(Date.now() + SESION_DURACION_DIAS * 24 * 60 * 60 * 1000);
  await db.insert(authSesion).values({ idCliente: otp.idCliente, claveInicioSesionUnico: token.slice(-32), fechaExpiracion });

  return {
    token,
    clienteData: { idCliente: clienteData[0].idCliente, numeroCelular: clienteData[0].numeroCelularCliente, codigoReferido: clienteData[0].codigoReferidoCliente },
  };
}

export const POST = crearEndpoint(async ({ request, requestId }) => {
  const body = await parsearJsonBody<VerificarOtpRequest>(request);
  validarCamposRequeridos(body, ["numeroCelular", "codigoOtp"]);

  const celularE164 = normalizarCelularMX(body.numeroCelular);
  const otp = await buscarOtpActivo(celularE164);
  verificarBloqueo(otp);

  if (otp.claveInicioSesionUnico !== body.codigoOtp) {
    const restantes = await registrarIntentoFallido(otp.idOtp, otp.intentosFallidos);
    throw new ErrorAutenticacion(`Código de verificación incorrecto. Intentos restantes: ${restantes}.`);
  }

  const { token, clienteData } = await consumirOtpYCrearSesion(otp, celularE164);
  const cookieSesion = generarCookieSesionCliente(token);

  const data: VerificarOtpClienteResponse = { cliente: clienteData };
  return respuestaExitosa(
    data,
    requestId,
    "Sesión iniciada exitosamente.",
    200,
    { "Set-Cookie": cookieSesion }
  );
});
