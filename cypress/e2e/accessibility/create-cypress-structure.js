// scripts/create-cypress-structure.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 CREANDO ESTRUCTURA CYPRESS...');
console.log('='.repeat(50));

// Estructura de directorios
const directories = [
    'cypress/e2e/accessibility',
    'cypress/support',
    'cypress/fixtures',
    'cypress/screenshots',
    'cypress/videos'
];

// Crear directorios
directories.forEach(dir => {
    const fullPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`✅ Directorio creado: ${dir}`);
    }
});

// Contenido de los archivos
const supportFileContent = `// cypress/support/e2e.js
import 'cypress-axe'

// Comando personalizado para checkA11y con configuración
Cypress.Commands.overwrite('checkA11y', (originalFn, context, options, callback) => {
    const axeOptions = {
        rules: {
            'color-contrast': { enabled: true },
            'image-alt': { enabled: true },
            'button-name': { enabled: true },
            'label': { enabled: true },
            'link-name': { enabled: true },
            'heading-order': { enabled: true }
        }
    }

    const mergedOptions = { ...axeOptions, ...options }
    
    return originalFn(context, mergedOptions, callback)
})

// Comando para capturar resultados y subir a Deque Hub
Cypress.Commands.add('captureA11yResults', (pageName, customResults = null) => {
    cy.window().then((win) => {
        const resultsPromise = customResults ? 
            Promise.resolve(customResults) : 
            cy.task('getAxeResults')
        
        resultsPromise.then((results) => {
            const uploadData = {
                pageName,
                results,
                url: win.location.href,
                timestamp: new Date().toISOString(),
                viewport: {
                    width: win.innerWidth,
                    height: win.innerHeight
                }
            }
            
            cy.task('uploadToDequeHub', uploadData).then(uploadResult => {
                if (uploadResult.success) {
                    cy.log('📤 Resultados subidos a Deque Hub: ' + uploadResult.scanId)
                } else {
                    cy.log('❌ Error subiendo a Deque Hub: ' + uploadResult.error)
                }
            })
        })
    })
})

// Comando para verificar conexión con Deque Hub
Cypress.Commands.add('checkDequeConnection', () => {
    return cy.task('checkDequeConnection')
})

// Comando para configuración específica de cada demo
Cypress.Commands.add('configureAxeForDemo', (demoNumber) => {
    const demoConfigs = {
        1: { // Demo 1 - Formularios
            rules: {
                'label': { enabled: true },
                'button-name': { enabled: true },
                'form-field-multiple-labels': { enabled: true },
                'aria-required-attr': { enabled: true }
            }
        },
        2: { // Demo 2 - Navegación
            rules: {
                'keyboard-access': { enabled: true },
                'focus-order': { enabled: true },
                'focus-visible': { enabled: true },
                'skip-link': { enabled: true }
            }
        },
        3: { // Demo 3 - Multimedia
            rules: {
                'image-alt': { enabled: true },
                'audio-caption': { enabled: true },
                'video-description': { enabled: true }
            }
        },
        4: { // Demo 4 - Estructura semántica
            rules: {
                'heading-order': { enabled: true },
                'landmark-roles': { enabled: true },
                'aria-roles': { enabled: true }
            }
        },
        5: { // Demo 5 - Contraste
            rules: {
                'color-contrast': { enabled: true },
                'link-in-text-block': { enabled: true }
            }
        },
        6: { // Demo 6 - ARIA
            rules: {
                'aria-valid-attr': { enabled: true },
                'aria-required-attr': { enabled: true },
                'aria-prohibited-attr': { enabled: true }
            }
        },
        7: { // Demo 7 - Responsive
            rules: {
                'viewport': { enabled: true },
                'meta-viewport': { enabled: true }
            }
        }
    }
    
    const config = demoConfigs[demoNumber] || {}
    return cy.injectAxe().then(() => {
        cy.configureAxe(config)
    })
})

// Comando para ejecutar prueba completa con reporte
Cypress.Commands.add('runFullA11yTest', (demoName, demoNumber, context = null) => {
    cy.configureAxeForDemo(demoNumber)
    
    // Ejecutar checkA11y con contexto específico
    cy.checkA11y(context, null, (violations) => {
        // Capturar resultados después del análisis
        const results = {
            violations: violations,
            timestamp: new Date().toISOString(),
            demo: demoName,
            demoNumber: demoNumber
        }
        
        // Subir resultados a Deque Hub
        cy.captureA11yResults(demoName, results)
    })
})
`;

const allDemosFileContent = `// cypress/e2e/accessibility/all-demos.cy.js
describe('Pruebas de Accesibilidad - Todos los Demos', () => {
  before(() => {
    // Verificar conexión con Deque Hub antes de ejecutar las pruebas
    cy.checkDequeConnection().then(connection => {
      expect(connection.success).to.be.true
    })
  })

  const demos = [
    { number: 1, name: 'Formularios', file: 'demo1-basic-html.html' },
    { number: 2, name: 'Navegación', file: 'demo2-react.html' },
    { number: 3, name: 'Multimedia', file: 'demo3-accessible-components.html' },
    { number: 5, name: 'Contraste', file: 'demo5-devtools-web.html' },
    { number: 6, name: 'ARIA', file: 'demo6-devtools-mobile.html' },
    { number: 7, name: 'Responsive', file: 'demo7-developer-hub.html' }
  ]

  demos.forEach(demo => {
    it('Demo ' + demo.number + ' - ' + demo.name, () => {
      cy.visit('/' + demo.file)
      cy.injectAxe()
      cy.runFullA11yTest('Demo ' + demo.number + ' - ' + demo.name, demo.number)
    })
  })

  afterEach(function() {
    // Capturar screenshot en caso de fallo
    if (this.currentTest.state === 'failed') {
      cy.screenshot(this.currentTest.title)
    }
  })
})
`;

const configFileContent = `import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      // Implementar event listeners aquí si es necesario
    },
  },
})
`;

// Archivos a crear
const files = {
    'cypress/support/e2e.js': supportFileContent,
    'cypress/e2e/accessibility/all-demos.cy.js': allDemosFileContent,
    'cypress.config.js': configFileContent
};

// Crear archivos
Object.entries(files).forEach(([filePath, content]) => {
    const fullPath = path.join(__dirname, '..', filePath);

    // Solo crear si no existe
    if (!fs.existsSync(fullPath)) {
        fs.writeFileSync(fullPath, content);
        console.log('✅ Archivo creado: ' + filePath);
    } else {
        console.log('⚠️  Archivo ya existe: ' + filePath);
    }
});

console.log('\\n🎉 ¡Estructura Cypress creada!');
console.log('\\n🚀 Para ejecutar las pruebas:');
console.log('   npm run cy:accessibility:demo');
console.log('\\n📁 Archivos creados:');
console.log('   • cypress/support/e2e.js');
console.log('   • cypress/e2e/accessibility/all-demos.cy.js');
console.log('   • cypress.config.js (si no existía)');
