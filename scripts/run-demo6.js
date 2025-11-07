// scripts/run-demo6.js
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import axe from 'axe-core';
import { JSDOM } from 'jsdom';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runDemo6() {
    console.log('🚀 Ejecutando Demo 6: Axe DevTools for Mobile');
    console.log('='.repeat(60));

    const demoFile = resolve(__dirname, '../public/demo6-devtools-mobile.html');

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
        console.error('❌ Error en Demo 6:', error.message);
    }
}

function displayResults(results) {
    console.log('\n📊 RESULTADOS DEL ANÁLISIS - DEMO 6 (Mobile)');
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

    console.log('\n💡 PLATAFORMAS MÓVILES:');
    console.log('• iOS con integración XCTest');
    console.log('• Android con integración Espresso');
    console.log('• React Native con testing framework');
    console.log('• Verificación de touch targets');
    console.log('• Contraste para condiciones móviles');
}

runDemo6();