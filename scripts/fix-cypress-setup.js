// scripts/fix-cypress-setup.js
import { execSync } from 'child_process';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔧 REPARANDO CONFIGURACIÓN CYPRESS...');
console.log('='.repeat(50));

try {
    // 1. Instalar dependencias faltantes
    console.log('\n📦 Instalando dependencias de reporting...');
    execSync('npm install --save-dev cypress-multi-reporters mochawesome mochawesome-merge mochawesome-report-generator', {
        stdio: 'inherit'
    });

    // 2. Verificar que Cypress está instalado
    console.log('\n🔍 Verificando Cypress...');
    execSync('npx cypress verify', { stdio: 'inherit' });

    // 3. Crear directorios necesarios
    console.log('\n📁 Creando directorios de reportes...');
    const directories = [
        'cypress/reports',
        'cypress/screenshots',
        'cypress/videos'
    ];

    directories.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`✅ ${dir}`);
        }
    });

    console.log('\n🎉 ¡Configuración reparada!');
    console.log('\n🚀 Prueba ejecutar: npm run cy:accessibility:demo');

} catch (error) {
    console.error('❌ Error durante la reparación:', error.message);
    console.log('\n💡 Solución manual:');
    console.log('   1. Ejecuta: npm install --save-dev cypress-multi-reporters');
    console.log('   2. Comenta la sección reporter en cypress.config.js');
    console.log('   3. Vuelve a ejecutar las pruebas');
}