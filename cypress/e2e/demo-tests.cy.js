describe('Pruebas de Accesibilidad - Demos Deque', () => {
    beforeEach(() => {
        cy.visit('/');
        cy.injectAxe();
    });

    // Test para Demo 1: Formularios accesibles
    it('Demo 1 - Formularios deben ser accesibles', () => {
        cy.visit('/demo1');
        cy.checkA11y(null, {
            includedImpacts: ['critical', 'serious'],
            rules: {
                'label': { enabled: true },
                'button-name': { enabled: true },
                'form-field-multiple-labels': { enabled: true }
            }
        });
    });

    // Test para Demo 2: Navegación por teclado
    it('Demo 2 - Navegación por teclado', () => {
        cy.visit('/demo2');
        cy.checkA11y('.navigation-container', {
            rules: {
                'keyboard-access': { enabled: true },
                'focus-order': { enabled: true },
                'focus-visible': { enabled: true }
            }
        });
    });

    // Test para Demo 3: Contenido multimedia
    it('Demo 3 - Contenido multimedia accesible', () => {
        cy.visit('/demo3');
        cy.checkA11y('.media-container', {
            rules: {
                'audio-caption': { enabled: true },
                'video-description': { enabled: true },
                'media-alternative': { enabled: true }
            }
        });
    });

    // Test para Demo 4: Estructura semántica
    it('Demo 4 - Estructura semántica correcta', () => {
        cy.visit('/demo4');
        cy.checkA11y(null, {
            rules: {
                'heading-order': { enabled: true },
                'landmark-roles': { enabled: true },
                'aria-roles': { enabled: true }
            }
        });
    });

    // Test para Demo 5: Contraste de colores
    it('Demo 5 - Contraste de colores adecuado', () => {
        cy.visit('/demo5');
        cy.checkA11y('.color-content', {
            rules: {
                'color-contrast': { enabled: true },
                'link-in-text-block': { enabled: true }
            }
        });
    });

    // Test para Demo 6: ARIA attributes
    it('Demo 6 - Uso correcto de ARIA', () => {
        cy.visit('/demo6');
        cy.checkA11y('.aria-demo', {
            rules: {
                'aria-valid-attr': { enabled: true },
                'aria-required-attr': { enabled: true },
                'aria-prohibited-attr': { enabled: true }
            }
        });
    });

    // Test para Demo 7: Responsive y zoom
    it('Demo 7 - Compatibilidad con zoom y responsive', () => {
        cy.visit('/demo7');

        // Probar diferentes viewports
        cy.viewport(320, 480);
        cy.checkA11y(null, {
            rules: {
                'viewport': { enabled: true },
                'meta-viewport': { enabled: true }
            }
        });

        cy.viewport(1280, 720);
        cy.checkA11y();
    });
});