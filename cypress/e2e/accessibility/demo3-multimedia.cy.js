// cypress/e2e/accessibility/demo3-multimedia.cy.js
describe('Demo 3 - Contenido Multimedia', () => {
    beforeEach(() => {
        cy.visit('/demo3-accessible-components.html')
        cy.injectAxe()
    })

    it('debe pasar las pruebas de accesibilidad multimedia', () => {
        cy.runFullA11yTest('Contenido Multimedia', 3, '.media-container, img, audio, video')

        // Verificar textos alternativos
        cy.get('img').each($img => {
            cy.wrap($img).should('have.attr', 'alt')
        })
    })
})