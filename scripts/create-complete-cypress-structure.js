// scripts/create-complete-cypress-structure.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 CREANDO ESTRUCTURA CYPRESS COMPLETA...');
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
        console.log('✅ Directorio creado: ' + dir);
    }
});

// Archivos individuales para cada demo
const demoFiles = {
    'demo1-formularios.cy.js': `// cypress/e2e/accessibility/demo1-formularios.cy.js
describe('Demo 1 - Formularios Accesibles', () => {
  beforeEach(() => {
    cy.visit('/demo1-basic-html.html')
    cy.injectAxe()
  })

  it('debe pasar las pruebas de accesibilidad de formularios', () => {
    cy.runFullA11yTest('Formularios Accesibles', 1, 'form, .form-container')
    
    // Verificaciones específicas para formularios
    cy.get('input[required]').each(($input) => {
      cy.wrap($input).should('have.attr', 'aria-required', 'true')
    })
    
    cy.get('label').should('exist')
    cy.get('button').should('have.attr', 'type')
  })
})
`,

    'demo2-navegacion.cy.js': `// cypress/e2e/accessibility/demo2-navegacion.cy.js
describe('Demo 2 - Navegación por Teclado', () => {
  beforeEach(() => {
    cy.visit('/demo2-react.html')
    cy.injectAxe()
  })

  it('debe pasar las pruebas de accesibilidad de navegación', () => {
    cy.runFullA11yTest('Navegación por Teclado', 2, 'nav, .navigation-container')
    
    // Test de navegación con teclado
    cy.get('a, button').first().focus()
    cy.focused().should('exist')
  })
})
`,

    'demo3-multimedia.cy.js': `// cypress/e2e/accessibility/demo3-multimedia.cy.js
describe('Demo 3 - Contenido Multimedia', () => {
  beforeEach(() => {
    cy.visit('/demo3-accessible-components.html')
    cy.injectAxe()
  })

  it('debe pasar las pruebas de accesibilidad multimedia', () => {
    cy.runFullA11yTest('Contenido Multimedia', 3, '.media-container, img, audio, video')
    
    // Verificar textos alternativos
    cy.get('img').each(($img) => {
      cy.wrap($img).should('have.attr', 'alt')
    })
  })
})
`,

    'demo5-contraste.cy.js': `// cypress/e2e/accessibility/demo5-contraste.cy.js
describe('Demo 5 - Contraste de Colores', () => {
  beforeEach(() => {
    cy.visit('/demo5-devtools-web.html')
    cy.injectAxe()
  })

  it('debe pasar las pruebas de contraste de colores', () => {
    cy.runFullA11yTest('Contraste de Colores', 5, '.color-content, .main-content')
  })
})
`,

    'demo6-aria.cy.js': `// cypress/e2e/accessibility/demo6-aria.cy.js
describe('Demo 6 - Atributos ARIA', () => {
  beforeEach(() => {
    cy.visit('/demo6-devtools-mobile.html')
    cy.injectAxe()
  })

  it('debe pasar las pruebas de atributos ARIA', () => {
    cy.runFullA11yTest('Atributos ARIA', 6, '.aria-demo, [aria-*]')
    
    // Verificar ARIA attributes válidos
    cy.get('[aria-label]').should('have.attr', 'aria-label')
  })
})
`,

    'demo7-responsive.cy.js': `// cypress/e2e/accessibility/demo7-responsive.cy.js
describe('Demo 7 - Responsive Design', () => {
  beforeEach(() => {
    cy.visit('/demo7-developer-hub.html')
    cy.injectAxe()
  })

  it('debe pasar las pruebas de responsive design', () => {
    // Probar en viewport móvil
    cy.viewport(320, 480)
    cy.runFullA11yTest('Responsive - Móvil', 7)
    
    // Probar en viewport desktop
    cy.viewport(1280, 720)
    cy.runFullA11yTest('Responsive - Desktop', 7)
  })
})
`
};

// Crear archivos de demos individuales
Object.entries(demoFiles).forEach(([filename, content]) => {
    const filePath = path.join(__dirname, '..', 'cypress/e2e/accessibility', filename);
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, content);
        console.log('✅ Demo creado: ' + filename);
    } else {
        console.log('⚠️  Demo ya existe: ' + filename);
    }
});

// Archivo de soporte (si no existe)
const supportFilePath = path.join(__dirname, '..', 'cypress/support/e2e.js');
if (!fs.existsSync(supportFilePath)) {
    const supportContent = `// cypress/support/e2e.js
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

// Comando para capturar resultados
Cypress.Commands.add('captureA11yResults', (pageName, customResults = null) => {
    cy.window().then((win) => {
        const uploadData = {
            pageName,
            results: customResults || {},
            url: win.location.href,
            timestamp: new Date().toISOString()
        }
        
        cy.task('uploadToDequeHub', uploadData).then(uploadResult => {
            if (uploadResult.success) {
                cy.log('📤 Resultados procesados: ' + uploadResult.scanId)
            }
        })
    })
})

// Comando para verificar conexión
Cypress.Commands.add('checkDequeConnection', () => {
    return cy.task('checkDequeConnection')
})

// Comando simplificado para pruebas
Cypress.Commands.add('runFullA11yTest', (demoName, demoNumber, context = null) => {
    cy.checkA11y(context, null, (violations) => {
        const results = {
            violations: violations,
            timestamp: new Date().toISOString(),
            demo: demoName,
            demoNumber: demoNumber
        }
        cy.captureA11yResults(demoName, results)
    })
})
`;
    fs.writeFileSync(supportFilePath, supportContent);
    console.log('✅ Archivo de soporte creado: cypress/support/e2e.js');
}

console.log('\\n🎉 ¡Estructura Cypress completa creada!');
console.log('\\n🚀 Próximos pasos:');
console.log('   1. Asegúrate de que el servidor esté ejecutándose: npm run server');
console.log('   2. Ejecuta las pruebas: npm run cy:accessibility:demo');
console.log('\\n📊 Archivos creados:');
console.log('   • 6 archivos de demo individuales');
console.log('   • Archivo de soporte Cypress');
console.log('   • Estructura de directorios completa');