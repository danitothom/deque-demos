// scripts/run-demo3.js
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import axe from 'axe-core';
import { JSDOM } from 'jsdom';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runDemo3() {
    console.log('🚀 Ejecutando Demo 3: Componentes Accesibles Corregidos');
    console.log('='.repeat(60));

    const demoFile = resolve(__dirname, '../public/demo3-accessible-components.html');

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
        console.error('❌ Error en Demo 3:', error.message);
    }
}

function displayResults(results) {
    console.log('\n📊 RESULTADOS DEL ANÁLISIS - DEMO 3 (Componentes Accesibles)');
    console.log('='.repeat(60));
    console.log(`Total de violaciones: ${results.violations.length}`);

    if (results.violations.length === 0) {
        console.log('\n🎉 ¡EXCELENTE! Cero violaciones encontradas');
        console.log('✅ Esta demo pasa todas las verificaciones de accesibilidad');
    } else {
        console.log('\n⚠️  Se encontraron algunas violaciones:');
        results.violations.forEach((violation, index) => {
            console.log(`\n${index + 1}. ${violation.id} (${violation.impact})`);
            console.log(`   📝 ${violation.description}`);
        });
    }

    console.log('\n💡 CARACTERÍSTICAS IMPLEMENTADAS:');
    console.log('• Modal con gestión completa de foco');
    console.log('• Formularios con etiquetas y validación accesible');
    console.log('• Navegación con roles ARIA y indicadores de posición');
    console.log('• Listas con semántica apropiada');
    console.log('• Regiones ARIA live para contenido dinámico');
    console.log('• Navegación completa por teclado');
    console.log('• Contraste de color adecuado en todos los elementos');
}

runDemo3();