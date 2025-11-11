// cypress/e2e/accessibility/demo1-formularios.cy.js
describe('Demo 1 - Formularios Accesibles', () => {
    beforeEach(() => {
        cy.visit('/demo1-basic-html.html')
        cy.injectAxe()
    })

    it('debe pasar las pruebas de accesibilidad de formularios', () => {
        cy.runFullA11yTest('Formularios Accesibles', 1, 'form, .form-container')

        // Verificaciones específicas para formularios
        cy.get('input[required]').each($input => {
            cy.wrap($input).should('have.attr', 'aria-required', 'true')
        })

        cy.get('label').should('exist')
        cy.get('button').should('have.attr', 'type')
    })
})