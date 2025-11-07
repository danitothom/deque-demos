import 'cypress-axe'

// Comando personalizado para checkA11y con configuración
Cypress.Commands.overwrite('checkA11y', (originalFn, context, options) => {
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

    return originalFn(context, { ...axeOptions, ...options })
})

// Comando para capturar resultados y subir a Deque Hub
Cypress.Commands.add('captureA11yResults', (pageName) => {
    cy.window().then((win) => {
        cy.task('getAxeResults').then((results) => {
            cy.task('uploadToDequeHub', {
                pageName,
                results,
                url: win.location.href
            }).then(uploadResult => {
                cy.log(`📤 Resultados subidos a Deque Hub: ${uploadResult.scanId}`)
            })
        })
    })
})

// Comando para verificar conexión con Deque Hub
Cypress.Commands.add('checkDequeConnection', () => {
    return cy.task('checkDequeConnection')
})