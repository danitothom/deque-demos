describe('Deque Developer Hub - Accessibility Integration', () => {

    before(() => {
        cy.log('🚀 Iniciando integración Cypress + Deque Developer Hub')
        cy.checkDequeConnection().then(connection => {
            cy.log(`🔗 Modo: ${connection.mode} - Conectado: ${connection.connected}`)
            if (connection.mode === 'real') {
                cy.log(`📁 Proyecto: ${connection.project.name}`)
            }
        })
    })

    describe('Demo Pages Accessibility Scans', () => {

        it('should scan Demo 1 - HTML Basic Issues and upload to Deque Hub', () => {
            cy.visit('/demo1-basic-html.html')
            cy.injectAxe()

            cy.checkA11y(null, null, terminalLog)
            cy.captureA11yResults('demo1-basic-html')
        })

        it('should scan Demo 2 - React Components and upload to Deque Hub', () => {
            cy.visit('/demo2-react.html')
            cy.injectAxe()

            // Test específico del modal
            cy.get('button').contains('Mostrar/Ocultar Modal').click()
            cy.checkA11y('.modal-overlay.active', null, terminalLog)

            cy.checkA11y(null, null, terminalLog)
            cy.captureA11yResults('demo2-react-components')
        })

        it('should scan Demo 3 - Accessible Components and upload to Deque Hub', () => {
            cy.visit('/demo3-accessible-components.html')
            cy.injectAxe()

            // Test del modal accesible
            cy.get('button').contains('Abrir Modal Accesible').click()
            cy.checkA11y('.accessible-modal[aria-hidden="false"]', null, terminalLog)

            cy.checkA11y(null, null, terminalLog)
            cy.captureA11yResults('demo3-accessible-components')
        })
    })

    describe('Batch Scanning Demo', () => {

        it('should perform batch scan of all demo pages', () => {
            const pages = [
                'demo1-basic-html.html',
                'demo2-react.html',
                'demo3-accessible-components.html',
                'demo4-axe-linter.html',
                'demo5-devtools-web.html',
                'demo7-developer-hub.html'
            ]

            pages.forEach(page => {
                cy.visit(`/${page}`)
                cy.injectAxe()
                cy.checkA11y(null, null, terminalLog)
                cy.captureA11yResults(page)

                // Pequeña pausa entre scans
                cy.wait(500)
            })
        })
    })

    describe('Developer Hub Dashboard Test', () => {

        it('should verify Developer Hub dashboard is accessible', () => {
            cy.visit('/demo7-developer-hub.html')
            cy.injectAxe()

            // Verificar que el dashboard carga
            cy.contains('Axe Developer Hub').should('be.visible')
            cy.contains('Dashboard de Accesibilidad').should('be.visible')

            // Test de accesibilidad del dashboard
            cy.checkA11y(null, null, terminalLog)
            cy.captureA11yResults('demo7-developer-hub-dashboard')

            // Interactuar con elementos del dashboard
            cy.get('.metric-card').should('have.length.at.least', 3)
            cy.get('.project-card').should('have.length.at.least', 2)
            cy.get('.cypress-demo').first().should('be.visible')
        })
    })

    after(() => {
        cy.log('✅ Todos los tests completados')
        cy.task('getDequeScans').then(scans => {
            cy.log(`📊 Total de scans realizados: ${scans.length}`)
            scans.forEach(scan => {
                cy.log(`   - ${scan.pageName}: ${scan.violations} violaciones`)
            })
        })
    })
})

// Función mejorada para logging
function terminalLog(violations) {
    cy.task(
        'log',
        `\n🔍 Encontradas ${violations.length} violaciones de accesibilidad`
    )

    violations.forEach((violation, index) => {
        cy.task('log', `\n${index + 1}. ${violation.id}`)
        cy.task('log', `   Impacto: ${violation.impact}`)
        cy.task('log', `   Descripción: ${violation.description}`)

        violation.nodes.forEach((node, nodeIndex) => {
            cy.task('log', `   Elemento ${nodeIndex + 1}: ${node.target}`)
        })
    })

    // "Subir" violaciones a Deque Hub
    if (violations.length > 0) {
        cy.task('log', `\n📤 Estas violaciones se subirán a Deque Hub`)
    } else {
        cy.task('log', `\n✅ No se encontraron violaciones - ¡Excelente!`)
    }
}