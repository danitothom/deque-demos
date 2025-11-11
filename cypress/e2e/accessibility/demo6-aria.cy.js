// cypress/e2e/accessibility/demo6-aria.cy.js
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