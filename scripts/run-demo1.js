// scripts/run-demo1.js
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import axe from 'axe-core';
import { JSDOM } from 'jsdom';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runDemo1() {
    console.log('🚀 Ejecutando Demo 1: Análisis Básico HTML');
    console.log('='.repeat(60));

    const demoFile = resolve(__dirname, '../public/demo1-basic-html.html');

    try {
        const content = readFileSync(demoFile, 'utf8');

        // Configurar JSDOM correctamente
        const dom = new JSDOM(content, {
            url: 'http://localhost:3000',
            resources: 'usable'
        });

        // Configurar globales para axe-core
        global.window = dom.window;
        global.document = dom.window.document;
        global.Node = dom.window.Node;
        global.HTMLElement = dom.window.HTMLElement;

        // Inyectar axe-core en el contexto del documento
        dom.window.eval(axe.source);

        // CONFIGURACIÓN CORREGIDA
        const config = {
            runOnly: {
                type: 'tag',
                values: ['wcag2a', 'wcag2aa', 'best-practice']
            }
        };

        const results = await dom.window.axe.run(dom.window.document, config);
        displayResults(results);

    } catch (error) {
        console.error('❌ Error en Demo 1:', error.message);
        console.error('Stack:', error.stack);
    }
}

function displayResults(results) {
    console.log('\n📊 RESULTADOS DEL ANÁLISIS - DEMO 1');
    console.log('='.repeat(60));
    console.log(`Total de violaciones: ${results.violations.length}`);

    const impactCount = {
        critical: 0,
        serious: 0,
        moderate: 0,
        minor: 0
    };

    results.violations.forEach(violation => {
        impactCount[violation.impact]++;
    });

    console.log(`• Críticas: ${impactCount.critical}`);
    console.log(`• Graves: ${impactCount.serious}`);
    console.log(`• Moderadas: ${impactCount.moderate}`);
    console.log(`• Menores: ${impactCount.minor}`);

    // Mostrar detalles de violaciones
    if (results.violations.length > 0) {
        console.log('\n🔍 DETALLES DE VIOLACIONES:');
        results.violations.forEach((violation, index) => {
            console.log(`\n${index + 1}. ${violation.id} (${violation.impact})`);
            console.log(`   📝 ${violation.description}`);
            console.log(`   🔗 ${violation.helpUrl}`);
            console.log(`   📍 ${violation.nodes.length} elemento(s) afectado(s)`);

            violation.nodes.slice(0, 2).forEach((node, nodeIndex) => {
                console.log(`      ${nodeIndex + 1}. ${node.target}`);
                if (node.failureSummary) {
                    console.log(`         💡 ${node.failureSummary.split('\n')[0]}`);
                }
            });

            if (violation.nodes.length > 2) {
                console.log(`      ... y ${violation.nodes.length - 2} más`);
            }
        });
    }

    console.log('\n💡 RECOMENDACIONES PARA EL WORKSHOP:');
    console.log('• Mostrar cómo axe-linter detecta estos problemas en VS Code');
    console.log('• Explicar el impacto de cada tipo de violación');
    console.log('• Demostrar las correcciones implementadas en la sección verde');
}

// Ejecutar la demo
runDemo1();