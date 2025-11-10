// Comandos personalizados para accesibilidad
Cypress.Commands.add('injectAxe', () => {
    cy.injectAxe();
});

Cypress.Commands.add('checkA11yWithContext', (context, options) => {
    cy.checkA11y(context, options);
});