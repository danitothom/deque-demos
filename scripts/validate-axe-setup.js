// scripts/validate-axe-setup.js
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function validateAxeSetup() {
    console.log('🔍 Validando configuración de Axe Watcher...');
    console.log('='.repeat(60));

    const checks = {
        directories: validateDirectories(),
        configFiles: validateConfigFiles(),
        envVars: validateEnvVars(),
        demos: validateDemos(),
        cypress: validateCypress()
    };

    displayValidationResults(checks);
}

function validateDirectories() {
    const requiredDirs = [
        'scripts',
        'reports/axe-watcher',
        'backups/axe-watcher',
        'cypress/e2e/accessibility',
        'cypress/screenshots/accessibility',
        'cypress/videos/accessibility'
    ];

    const results = [];

    requiredDirs.forEach(dir => {
        const fullPath = path.join(__dirname, '..', dir);
        const exists = require('fs').existsSync(fullPath);
        results.push({
            name: dir,
            status: exists ? '✅' : '❌',
            message: exists ? 'Existe' : 'No existe'
        });
    });

    return results;
}

function validateConfigFiles() {
    const requiredFiles = [
        'scripts/axe-watcher.js',
        'scripts/axe-watcher.config.js',
        'cypress.config.js',
        'cypress/plugins/deque-hub-integration.cjs',
        'cypress/plugins/deque-hub-mock.cjs',
        'cypress/support/e2e.js'
    ];

    const results = [];

    requiredFiles.forEach(file => {
        const fullPath = path.join(__dirname, '..', file);
        const exists = require('fs').existsSync(fullPath);
        results.push({
            name: file,
            status: exists ? '✅' : '❌',
            message: exists ? 'Existe' : 'No existe'
        });
    });

    return results;
}

function validateEnvVars() {
    const env = require('dotenv').config({ path: resolve(__dirname, '../.env') }).parsed || {};

    const requiredVars = [
        'DEQUE_API_KEY',
        'DEQUE_PROJECT_ID',
        'DEQUE_HUB_URL',
        'CYPRESS_BASE_URL'
    ];

    const results = [];

    requiredVars.forEach(varName => {
        const value = env[varName];
        const isSet = value && value !== 'tu_api_key_aqui';

        results.push({
            name: varName,
            status: isSet ? '✅' : '⚠️',
            message: isSet ? 'Configurada' : 'No configurada o valor por defecto'
        });
    });

    return results;
}

function validateDemos() {
    const demosDir = path.join(__dirname, '../public');
    const demoFiles = [
        'demo1-basic-html.html',
        'demo2-react.html',
        'demo3-accessible-components.html',
        'demo5-devtools-web.html',
        'demo6-devtools-mobile.html',
        'demo7-developer-hub.html',
        'demo8-complete-workflow.html'
    ];

    const results = [];

    demoFiles.forEach(file => {
        const fullPath = path.join(demosDir, file);
        const exists = require('fs').existsSync(fullPath);
        results.push({
            name: file,
            status: exists ? '✅' : '❌',
            message: exists ? 'Existe' : 'No existe'
        });
    });

    return results;
}

function validateCypress() {
    try {
        const packageJson = JSON.parse(readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

        const requiredPackages = [
            'cypress',
            'axe-core',
            'cypress-axe',
            'axios'
        ];

        const results = [];

        requiredPackages.forEach(pkg => {
            const installed = !!deps[pkg];
            results.push({
                name: pkg,
                status: installed ? '✅' : '❌',
                message: installed ? 'Instalado' : 'No instalado'
            });
        });

        return results;
    } catch (error) {
        return [{
            name: 'package.json',
            status: '❌',
            message: 'Error leyendo package.json'
        }];
    }
}

function displayValidationResults(checks) {
    let allPassed = true;

    Object.entries(checks).forEach(([category, results]) => {
        console.log(`\n📋 ${category.toUpperCase()}:`);
        console.log('-'.repeat(40));

        results.forEach(result => {
            console.log(`   ${result.status} ${result.name}: ${result.message}`);
            if (result.status !== '✅') {
                allPassed = false;
            }
        });
    });

    console.log('\n' + '='.repeat(60));

    if (allPassed) {
        console.log('🎉 ¡Todas las validaciones pasaron!');
        console.log('   El sistema Axe Watcher está listo para usar.');
        console.log('\n🚀 Comandos disponibles:');
        console.log('   npm run axe-watcher:run     - Ejecutar watcher una vez');
        console.log('   npm run test:a11y:full:demo - Ejecutar pruebas completas en modo demo');
        console.log('   npm run monitor:a11y        - Monitoreo continuo');
    } else {
        console.log('⚠️  Algunas validaciones fallaron');
        console.log('\n🔧 Acciones requeridas:');
        console.log('   1. Ejecuta: npm run axe-watcher:init');
        console.log('   2. Configura las variables en .env');
        console.log('   3. Instala las dependencias faltantes');
        console.log('   4. Verifica que los archivos de demo existan');
        process.exit(1);
    }
}

validateAxeSetup();