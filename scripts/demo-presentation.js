// scripts/demo-presentation.js
import { execSync } from 'child_process';

console.log('🎭 ===== MODO DEMO - PRESENTACIÓN COMPLETA =====\n');

// Configurar modo demo automáticamente
try {
    execSync('node scripts/switch-mode.js demo', { stdio: 'inherit' });
    console.log('✅ Modo demo configurado\n');
} catch (error) {
    console.log('⚠️  Usando configuración actual\n');
}

// Ejecutar presentación completa
const steps = [
    { cmd: 'npm run deque:verify', desc: 'Verificando configuración demo' },
    { cmd: 'npm run demo:html', desc: 'Demo 1 - HTML Básico' },
    { cmd: 'npm run demo:react', desc: 'Demo 2 - Componentes React' },
    { cmd: 'npm run demo:accessible', desc: 'Demo 3 - Componentes Accesibles' },
    { cmd: 'npm run demo:devtools', desc: 'Demo 5 - DevTools Web' },
    { cmd: 'npm run demo:mobile', desc: 'Demo 6 - DevTools Mobile' },
    { cmd: 'npm run demo:hub', desc: 'Demo 7 - Developer Hub' },
    { cmd: 'npm run demo:workflow', desc: 'Demo 8 - Flujo Completo' },
    { cmd: 'npm run test:a11y:full:demo', desc: 'Pruebas Automatizadas' },
    { cmd: 'npm run report:deque', desc: 'Generando Reporte Final' }
];

steps.forEach((step, index) => {
    console.log(`\n${index + 1}. ${step.desc}`);
    console.log('-'.repeat(40));
    try {
        execSync(step.cmd, { stdio: 'inherit' });
    } catch (error) {
        console.log(`⚠️  Paso opcional, continuando...`);
    }
});

console.log('\n🎉 ¡PRESENTACIÓN DEMO COMPLETADA!');
console.log('\n💡 Para modo real necesitas:');
console.log('   1. API Key válida de https://axe.deque.com');
console.log('   2. Project ID de tu proyecto');
console.log('   3. Ejecutar: node scripts/switch-mode.js real');
console.log('\n🚀 Comando rápido para próxima presentación:');
console.log('   node scripts/demo-presentation.js');