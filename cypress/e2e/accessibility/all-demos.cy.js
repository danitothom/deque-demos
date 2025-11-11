// cypress/e2e/accessibility/all-demos.cy.js
describe('Pruebas de Accesibilidad - Todos los Demos', () => {
    before(() => {
        // Verificar conexión con Deque Hub antes de ejecutar las pruebas
        cy.checkDequeConnection().then(connection => {
            expect(connection.success).to.be.true
        })
    })

    const demos = [
        { number: 1, name: 'Formularios', file: 'demo1-basic-html.html' },
        { number: 2, name: 'Navegación', file: 'demo2-react.html' },
        { number: 3, name: 'Multimedia', file: 'demo3-accessible-components.html' },
        { number: 5, name: 'Contraste', file: 'demo5-devtools-web.html' },
        { number: 6, name: 'ARIA', file: 'demo6-devtools-mobile.html' },
        { number: 7, name: 'Responsive', file: 'demo7-developer-hub.html' }
    ]

    demos.forEach(demo => {
        it(`Demo ${demo.number} - ${demo.name}`, () => {
            cy.visit(`/${demo.file}`)
            cy.injectAxe()
            cy.runFullA11yTest(`Demo ${demo.number} - ${demo.name}`, demo.number)
        })
    })

    afterEach(function () {
        // Capturar screenshot en caso de fallo
        if (this.currentTest.state === 'failed') {
            cy.screenshot(this.currentTest.title)
        }
    })
})