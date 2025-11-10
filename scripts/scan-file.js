// scripts/scan-file.js
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import axe from 'axe-core';
import { JSDOM } from 'jsdom';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function scanFile(filePath) {
    console.log(`🔍 Escaneando archivo: ${filePath}`);
    console.log('='.repeat(60));

    try {
        const content = readFileSync(filePath, 'utf8');

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
        displayResults(results, filePath);

        return results;

    } catch (error) {
        console.error('❌ Error escaneando archivo:', error.message);
        throw error;
    }
}

function displayResults(results, filePath) {
    console.log('\n📊 RESULTADOS DEL ESCANEO');
    console.log('='.repeat(60));
    console.log(`Archivo: ${filePath}`);
    console.log(`Violaciones: ${results.violations.length}`);
    console.log(`Passes: ${results.passes.length}`);
    console.log(`Incompletos: ${results.incomplete.length}`);
    console.log(`No aplicables: ${results.inapplicable.length}`);

    if (results.violations.length > 0) {
        console.log('\n⚠️  VIOLACIONES ENCONTRADAS:');
        results.violations.forEach((violation, index) => {
            console.log(`\n${index + 1}. ${violation.id} (${violation.impact})`);
            console.log(`   📝 ${violation.description}`);
            console.log(`   🔗 ${violation.helpUrl}`);
            console.log(`   📍 ${violation.nodes.length} elemento(s) afectado(s)`);
        });
    } else {
        console.log('\n🎉 ¡No se encontraron violaciones!');
    }

    // Resumen de métricas
    const impactSummary = results.violations.reduce((acc, violation) => {
        acc[violation.impact] = (acc[violation.impact] || 0) + 1;
        return acc;
    }, {});

    console.log('\n📈 RESUMEN DE IMPACTO:');
    Object.entries(impactSummary).forEach(([impact, count]) => {
        console.log(`   ${impact}: ${count}`);
    });
}

// Manejo de argumentos de línea de comandos
const filePath = process.argv[2];
if (!filePath) {
    console.error('❌ Uso: npm run scan -- <ruta-del-archivo>');
    console.error('Ejemplo: npm run scan -- public/demo1-basic-html.html');
    process.exit(1);
}

const fullPath = resolve(process.cwd(), filePath);
scanFile(fullPath).catch(error => {
    console.error('💥 Error fatal:', error.message);
    process.exit(1);
});