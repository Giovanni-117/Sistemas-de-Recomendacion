import { GorseSincronizacion } from "./strategies/gorse/GorseSincronizacion";

async function main() {
  console.log("Iniciando sincronización de todos los ítems hacia Gorse...");
  try {
    const sincronizador = new GorseSincronizacion();
    const resultados = await sincronizador.sincronizarTodosLosItems();
    
    console.log("✅ Sincronización completada con éxito.");
    console.log(`🏢 Negocios sincronizados: ${resultados.negocios}`);
    console.log(`📦 Productos sincronizados: ${resultados.productos}`);
    console.log(`🎫 Cupones sincronizados: ${resultados.cupones}`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error durante la sincronización:", error);
    process.exit(1);
  }
}

main();
