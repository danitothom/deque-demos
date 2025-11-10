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
        // Obtener resultados de axe si no se proporcionan customResults
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
                    cy.log(`📤 Resultados subidos a Deque Hub: ${uploadResult.scanId}`)
                    cy.log(`🔗 Dashboard: ${uploadResult.dashboardUrl}`)
                } else {
                    cy.log(`❌ Error subiendo a Deque Hub: ${uploadResult.error}`)
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