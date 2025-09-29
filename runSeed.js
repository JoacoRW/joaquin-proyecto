const { handler } = require('./src/seedData');

async function runSeed() {
  try {
    console.log('🌱 Ejecutando seed data...');
    const result = await handler();
    console.log('✅ Resultado:', result);
    console.log('🎉 Datos iniciales cargados exitosamente');
  } catch (error) {
    console.error('❌ Error al cargar datos:', error);
  }
}

runSeed();