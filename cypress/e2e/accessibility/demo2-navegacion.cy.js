// cypress/e2e/accessibility/demo2-navegacion.cy.js
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