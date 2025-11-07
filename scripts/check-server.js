// scripts/check-server.js
import { readdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';

console.log('🔍 Verificando estructura del proyecto - ECOSISTEMA COMPLETO\n');
console.log('='.repeat(70));

const pathsToCheck = [
    { path: 'public/', description: 'Directorio public', type: 'directory' },
    { path: 'public/demo1-basic-html.html', description: 'Demo 1 - HTML Básico', type: 'file' },
    { path: 'public/demo2-react.html', description: 'Demo 2 - Componentes React', type: 'file' },
    { path: 'public/demo3-accessible-components.html', description: 'Demo 3 - Componentes Accesibles', type: 'file' },
    { path: 'public/demo4-axe-linter.html', description: 'Demo 4 - Axe Linter', type: 'file' },
    { path: 'public/demo5-devtools-web.html', description: 'Demo 5 - DevTools Web', type: 'file' },
    { path: 'public/demo6-devtools-mobile.html', description: 'Demo 6 - DevTools Mobile', type: 'file' },
    { path: 'public/demo7-developer-hub.html', description: 'Demo 7 - Developer Hub', type: 'file' },
    { path: 'public/demo8-complete-workflow.html', description: 'Demo 8 - Flujo Completo', type: 'file' },
    { path: 'server/index.js', description: 'Servidor Express', type: 'file' },
    { path: 'package.json', description: 'Package.json', type: 'file' }
];

let allOk = true;
const demoFiles = [];

pathsToCheck.forEach(({ path, description, type }) => {
    const exists = existsSync(path);
    const icon = exists ? '✅' : '❌';
    let status = exists ? 'EXISTE' : 'NO EXISTE';

    if (exists && type === 'file') {
        const stats = readFileSync(path, 'utf8');
        status += ` (${stats.length} bytes)`;
        if (path.includes('demo')) {
            demoFiles.push(path);
        }
    }

    console.log(`${icon} ${description}: ${status}`);
    if (!exists) allOk = false;
});

// Verificar dependencias en package.json
try {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    console.log('\n📦 DEPENDENCIAS INSTALADAS:');
    console.log(`   • express: ${pkg.dependencies?.express ? '✅' : '❌'}`);
    console.log(`   • axe-core: ${pkg.dependencies?.['axe-core'] ? '✅' : '❌'}`);
    console.log(`   • react: ${pkg.dependencies?.react ? '✅' : '❌'}`);

    // Verificar scripts
    console.log('\n🎯 SCRIPTS DISPONIBLES:');
    const scripts = pkg.scripts || {};
    const demoScripts = [
        'demo:html', 'demo:react', 'demo:accessible', 'demo:linter',
        'demo:devtools', 'demo:mobile', 'demo:hub', 'demo:workflow', 'demo:all'
    ];

    demoScripts.forEach(script => {
        console.log(`   • ${script}: ${scripts[script] ? '✅' : '❌'}`);
    });
} catch (error) {
    console.log('\n❌ Error leyendo package.json');
    allOk = false;
}

if (allOk) {
    console.log('\n🎉 ¡ECOSISTEMA COMPLETO! Estructura correcta para presentación al cliente');
    console.log('='.repeat(70));

    console.log('\n📋 PLAN DE PRESENTACIÓN - PASO A PASO:');
    console.log('   1. 📊 Iniciar servidor: npm run server');
    console.log('   2. 🌐 Abrir: http://localhost:3000');
    console.log('   3. 🎯 Seguir el flujo de demos organizado');
    console.log('   4. 🔍 Ejecutar verificaciones en vivo');

    console.log('\n🔍 COMANDOS DE VERIFICACIÓN EN VIVO:');
    console.log('   • npm run demo:html      (Problemas HTML básicos)');
    console.log('   • npm run demo:react     (Problemas componentes React)');
    console.log('   • npm run demo:accessible (Soluciones implementadas)');
    console.log('   • npm run demo:linter    (VS Code integration)');
    console.log('   • npm run demo:devtools  (Browser testing)');
    console.log('   • npm run demo:mobile    (Mobile testing)');
    console.log('   • npm run demo:hub       (Enterprise platform)');
    console.log('   • npm run demo:workflow  (End-to-end workflow)');
    console.log('   • npm run demo:all       (Todas las verificaciones)');

} else {
    console.log('\n⚠️  PROBLEMAS ENCONTRADOS:');
    console.log('   • Revisa los archivos marcados con ❌');
    console.log('   • Ejecuta: npm install');
    console.log('   • Verifica la estructura de carpetas');
}

// Listar contenido de public
console.log('\n📁 CONTENIDO DE public/:');
try {
    const files = readdirSync('public/');
    if (files.length === 0) {
        console.log('   📂 Directorio vacío');
    } else {
        const demoIcons = ['📄', '⚛️', '✅', '🔍', '🌐', '📱', '🚀', '🔄'];
        files.forEach((file, index) => {
            const filePath = join('public', file);
            const stats = existsSync(filePath) ? `(${readFileSync(filePath, 'utf8').length} bytes)` : '';
            const icon = demoIcons[index] || '📄';
            console.log(`   ${icon} ${file} ${stats}`);
        });
        console.log(`\n   📊 Total: ${files.length} demos listas`);
    }
} catch (error) {
    console.log('   ❌ No se pudo leer el directorio public/');
}

console.log('\n' + '='.repeat(70));