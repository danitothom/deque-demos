// scripts/run-demo8.js
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import axe from 'axe-core';
import { JSDOM } from 'jsdom';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runDemo8() {
    console.log('🚀 Ejecutando Demo 8: Flujo de Trabajo Completo');
    console.log('='.repeat(60));

    const demoFile = resolve(__dirname, '../public/demo8-complete-workflow.html');

    try {
        const content = readFileSync(demoFile, 'utf8');

        const dom = new JSDOM(content, {
            url: 'http://localhost:3000',
            resources: 'usable'
        });

        global.window = dom.window;
        global.document = dom.window.document;
        global.Node = dom.window.Node;
        global.HTMLElement = dom.window.HTMLElement;

        dom.window.eval(axe.source);

        const config = {
            runOnly: {
                type: 'tag',
                values: ['wcag2a', 'wcag2aa', 'best-practice']
            }
        };

        const results = await dom.window.axe.run(dom.window.document, config);
        displayResults(results);

    } catch (error) {
        console.error('❌ Error en Demo 8:', error.message);
    }
}

function displayResults(results) {
    console.log('\n📊 RESULTADOS DEL ANÁLISIS - DEMO 8 (Workflow Completo)');
    console.log('='.repeat(60));
    console.log(`Total de violaciones: ${results.violations.length}`);

    if (results.violations.length === 0) {
        console.log('\n🎉 ¡Demo accesible! Cero violaciones encontradas');
    } else {
        console.log('\n⚠️  Violaciones encontradas:');
        results.violations.forEach((violation, index) => {
            console.log(`\n${index + 1}. ${violation.id} (${violation.impact})`);
            console.log(`   📝 ${violation.description}`);
        });
    }

    console.log('\n💡 FLUJO END-TO-END:');
    console.log('• Desarrollo: Axe Linter en VS Code');
    console.log('• Testing: DevTools Web y Mobile');
    console.log('• CI/CD: Integración en pipelines');
    console.log('• Monitoreo: Developer Hub enterprise');
    console.log('• Mejora: Métricas y optimización continua');
}

runDemo8();