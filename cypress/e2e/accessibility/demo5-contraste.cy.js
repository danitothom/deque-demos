// cypress/e2e/accessibility/demo5-contraste.cy.js
describe('Demo 5 - Contraste de Colores', () => {
    beforeEach(() => {
        cy.visit('/demo5-devtools-web.html')
        cy.injectAxe()
    })

    it('debe pasar las pruebas de contraste de colores', () => {
        cy.runFullA11yTest('Contraste de Colores', 5, '.color-content, .main-content')
    })
})