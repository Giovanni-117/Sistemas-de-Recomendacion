// lib/cache/cacheRegistry.ts

/**
 * Fuente única de verdad para TODOS los namespaces de caché.
 * Formato: "dominio:entidad:detalle"
 */
export const CacheNS = {
    // ── Cliente ──────────────────────────────────────
    cliente: {
        cupones: {
            lista: "cliente:cupones:lista",
            detalles: "cliente:cupones:detalles",
        },
        productos: {
            busqueda: "cliente:productos:busqueda",

        },
        promocionalPrincipal: "cliente:promocionalPrincipal",
        explorar: {
            negociosActivosIds: "cliente:explorar:negociosActivosIds",
            negocioAleatorio: "cliente:explorar:negocioAleatorio",
            feedProductos: "cliente:explorar:feedProductos",
        },
    },

} as const;

/** TTLs centralizados en segundos */
export const CacheTTL = {
    veinticuatroHoras: 60 * 60 * 24,  // 24h
    dosHoras: 60 * 60 * 2,   // 2h
    unaHora: 60 * 60,       // 1h
    quinceMinutos: 60 * 15,       // 15min
    cincoMinutos: 60 * 5,
    tresMinutos: 60 * 3,
    unMinuto: 60,
} as const;