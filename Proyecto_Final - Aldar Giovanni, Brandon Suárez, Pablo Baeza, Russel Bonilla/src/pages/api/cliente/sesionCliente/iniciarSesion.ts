import { db } from "@/lib/db";
import { cliente, authOtp } from "@/lib/db/schema";
import { eq, and, gt, sql } from "drizzle-orm";

import crypto from "crypto";
import {
  crearEndpoint,
  parsearJsonBody,
  validarCamposRequeridos,
  normalizarCelularMX,
  respuestaExitosa,
  ErrorLimitePeticiones,
} from "@/lib";
import { ManejadorMensajes} from "@/lib/manejadorEnvioMensajes/manejadorMensajes";
import type { IniciarSesionClienteRequest, IniciarSesionClienteResponse} from "@/lib/api/tiposApi/sesiones";


// ─── Configuración ───────────────────────────────────────────────────────────

const OTP_LONGITUD = 6;
const OTP_EXPIRACION_MINUTOS = 5;
const MAX_OTP_POR_HORA = 5;

// ─── Funciones auxiliares ────────────────────────────────────────────────────

function generarCodigoOtp(longitud: number): string {
  const bytes = crypto.randomBytes(longitud);
  let codigo = "";
  for (let i = 0; i < longitud; i++) codigo += (bytes[i] % 10).toString();
  return codigo;
}

function generarCodigoReferido(): string {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}

async function buscarOCrearCliente(celularE164: string): Promise<string> {
  const existente = await db
    .select().from(cliente)
    .where(eq(cliente.numeroCelularCliente, celularE164))
    .limit(1);

  if (existente.length > 0) return existente[0].idCliente;

  const nuevo = await db
    .insert(cliente)
    .values({ numeroCelularCliente: celularE164, codigoReferidoCliente: generarCodigoReferido() })
    .returning({ idCliente: cliente.idCliente });

  return nuevo[0].idCliente;
}

async function verificarRateLimit(idCliente: string): Promise<void> {
  const hace1Hora = new Date(Date.now() - 60 * 60 * 1000);
  const otps = await db
    .select({ total: sql<number>`count(*)` })
    .from(authOtp)
    .where(and(eq(authOtp.idCliente, idCliente), gt(authOtp.fechaCreacion, hace1Hora)));

  if (Number(otps[0].total) >= MAX_OTP_POR_HORA) {
    throw new ErrorLimitePeticiones("Has solicitado demasiados códigos. Intenta de nuevo en una hora.");
  }
}

async function generarYAlmacenarOtp(idCliente: string, celularE164: string): Promise<string> {
  const codigo = generarCodigoOtp(OTP_LONGITUD);
  const expiracion = new Date(Date.now() + OTP_EXPIRACION_MINUTOS * 60 * 1000);
  await db.insert(authOtp).values({ idCliente, numeroCelular: celularE164, claveInicioSesionUnico: codigo, expiracion });
  return codigo;
}

async function enviarOtpWhatsApp(celular: string, codigo: string): Promise<void> {
  const manejadorMensajes = new ManejadorMensajes();
  await manejadorMensajes.enviarOTPWhatsApp(celular, codigo);
}

// ─── Endpoint ────────────────────────────────────────────────────────────────

export const POST = crearEndpoint(async ({ request, requestId }) => {
  const body = await parsearJsonBody<IniciarSesionClienteRequest>(request);
  validarCamposRequeridos(body, ["numeroCelular"]);

  const celularE164 = normalizarCelularMX(body.numeroCelular);
  const idCliente = await buscarOCrearCliente(celularE164);

  await verificarRateLimit(idCliente);

  const codigo = await generarYAlmacenarOtp(idCliente, celularE164);
  await enviarOtpWhatsApp(celularE164, codigo);

  const data: IniciarSesionClienteResponse = { expiracionMinutos: OTP_EXPIRACION_MINUTOS };
  return respuestaExitosa(
    data,
    requestId,
    "Código de verificación enviado por WhatsApp."
  );
});
