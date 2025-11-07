// scripts/run-demo2.js
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import axe from 'axe-core';
import { JSDOM } from 'jsdom';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runDemo2() {
    console.log('🚀 Ejecutando Demo 2: Análisis de Componentes React');
    console.log('='.repeat(60));

    const demoFile = resolve(__dirname, '../public/demo2-react.html');

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
        console.error('❌ Error en Demo 2:', error.message);
    }
}

function displayResults(results) {
    console.log('\n📊 RESULTADOS DEL ANÁLISIS - DEMO 2 (React)');
    console.log('='.repeat(60));
    console.log(`Total de violaciones: ${results.violations.length}`);

    results.violations.forEach((violation, index) => {
        console.log(`\n${index + 1}. ${violation.id} (${violation.impact})`);
        console.log(`   📝 ${violation.description}`);
        console.log(`   🔗 ${violation.helpUrl}`);
        console.log(`   📍 ${violation.nodes.length} elemento(s) afectado(s)`);
    });

    console.log('\n💡 ENSEÑANZAS PARA REACT:');
    console.log('• Usar elementos semánticos (button en lugar de div)');
    console.log('• Siempre agregar labels a los formularios');
    console.log('• Implementar roles ARIA en componentes personalizados');
}

runDemo2();