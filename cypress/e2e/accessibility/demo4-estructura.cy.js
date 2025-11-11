// cypress/e2e/accessibility/demo4-estructura.cy.js
describe('Demo 4 - Estructura Semántica', () => {
    beforeEach(() => {
        cy.visit('/demo4-estructura.html') // Ajusta según tu archivo
        cy.injectAxe()
    })

    it('debe pasar las pruebas de estructura semántica', () => {
        cy.runFullA11yTest('Estructura Semántica', 4)

        // Verificar estructura de headings
        cy.get('h1').should('exist')
        cy.get('h2').should('have.length.at.least', 1)
    })
})