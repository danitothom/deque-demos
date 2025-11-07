// scripts/scan-file.js
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import axe from 'axe-core';
import { JSDOM } from 'jsdom';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function scanFile(filePath) {
    try {
        console.log(`🔍 Scanning: ${filePath}`);

        const content = readFileSync(filePath, 'utf8');

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
        global.Element = dom.window.Element;

        // Inyectar axe-core en el contexto del documento
        dom.window.eval(axe.source);

        // CONFIGURACIÓN CORREGIDA - usar runOnly en lugar de rules
        const config = {
            runOnly: {
                type: 'tag',
                values: ['wcag2a', 'wcag2aa', 'best-practice']
            }
            // O usar runOnly con IDs específicos:
            // runOnly: ['color-contrast', 'image-alt', 'button-name', 'label']
        };

        // Ejecutar análisis en el documento completo
        const results = await dom.window.axe.run(dom.window.document, config);
        generateReport(results, filePath);

    } catch (error) {
        console.error('❌ Error scanning file:', error.message);
        console.error('Stack:', error.stack);
    }
}

function generateReport(results, filePath) {
    console.log('\n📊 AXE ACCESSIBILITY REPORT');
    console.log('='.repeat(50));
    console.log(`File: ${filePath}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log(`Total Violations: ${results.violations.length}`);
    console.log('='.repeat(50));

    if (results.violations.length === 0) {
        console.log('✅ No accessibility violations found!');
        return;
    }

    results.violations.forEach((violation, index) => {
        console.log(`\n${index + 1}. ${violation.id} (${violation.impact.toUpperCase()})`);
        console.log(`   📝 ${violation.description}`);
        console.log(`   🔗 ${violation.helpUrl}`);
        console.log(`   📍 ${violation.nodes.length} element(s) affected:`);

        violation.nodes.forEach((node, nodeIndex) => {
            console.log(`      ${nodeIndex + 1}. ${node.target}`);
            if (node.failureSummary) {
                console.log(`         💡 ${node.failureSummary.split('\n')[0]}`);
            }
        });
    });

    console.log('\n💡 RECOMMENDATIONS:');
    results.violations.forEach(violation => {
        console.log(`   • ${violation.help}`);
    });
}

// Ejecutar si se pasa un archivo como argumento
const filePath = process.argv[2];
if (filePath) {
    scanFile(resolve(process.cwd(), filePath));
} else {
    console.error('❌ Please provide a file path');
    console.log('Usage: node scripts/scan-file.js <file-path>');
    process.exit(1);
}