// cypress/e2e/accessibility/demo7-responsive.cy.js
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