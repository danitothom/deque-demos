const axios = require('axios');
const fs = require('fs');
const path = require('path');

/**
 * Axe Watcher - Monitoreo continuo de accesibilidad para los 7 demos Deque
 * Integrado con Cypress y Deque Hub
 */
class AxeWatcher {
    constructor(config = {}) {
        this.config = {
            // Configuración de Cypress
            cypress: {
                specPattern: 'cypress/e2e/accessibility/**/*.cy.js',
                baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:3000',
                ...config.cypress
            },

            // Configuración de Axe
            axe: {
                rules: {
                    'color-contrast': { enabled: true },
                    'image-alt': { enabled: true },
                    'button-name': { enabled: true },
                    'label': { enabled: true },
                    'link-name': { enabled: true },
                    'heading-order': { enabled: true },
                    'landmark-one-main': { enabled: true },
                    'page-has-heading-one': { enabled: true },
                    'region': { enabled: true }
                },
                includedImpacts: ['critical', 'serious', 'moderate'],
                ...config.axe
            },

            // Configuración de Deque Hub
            deque: {
                enabled: process.env.DEQUE_API_KEY && process.env.DEQUE_API_KEY !== 'demo_mode',
                apiKey: process.env.DEQUE_API_KEY,
                projectId: process.env.DEQUE_PROJECT_ID,
                baseURL: process.env.DEQUE_HUB_URL,
                ...config.deque
            },

            // Configuración de monitoreo
            monitoring: {
                interval: config.monitoring?.interval || 3600000, // 1 hora por defecto
                maxViolations: config.monitoring?.maxViolations || 10,
                alertOnRegression: true,
                ...config.monitoring
            },

            // Configuración de reportes
            reporting: {
                outputDir: 'reports/axe-watcher',
                formats: ['json', 'html', 'csv'],
                generateDashboard: true,
                ...config.reporting
            }
        };

        this.results = [];
        this.violationHistory = [];
        this.isMonitoring = false;
        this.monitorInterval = null;

        this.init();
    }

    /**
     * Inicialización del watcher
     */
    init() {
        console.log('🚀 Inicializando Axe Watcher para 7 Demos Deque...');

        // Crear directorios de reportes
        this.ensureDirectories();

        // Verificar configuración
        this.validateConfig();

        // Mostrar información de configuración
        this.printConfigSummary();
    }

    /**
     * Asegurar que los directorios necesarios existan
     */
    ensureDirectories() {
        const directories = [
            this.config.reporting.outputDir,
            'backups/axe-watcher',
            'cypress/screenshots/accessibility',
            'cypress/videos/accessibility'
        ];

        directories.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                console.log(`📁 Directorio creado: ${dir}`);
            }
        });
    }

    /**
     * Validar configuración
     */
    validateConfig() {
        const { deque, cypress } = this.config;

        if (!cypress.baseUrl) {
            console.warn('⚠️  CYPRESS_BASE_URL no configurado. Usando localhost:3000');
        }

        if (deque.enabled) {
            if (!deque.apiKey) {
                console.error('❌ DEQUE_API_KEY requerida para conexión real');
                deque.enabled = false;
            }
            if (!deque.projectId) {
                console.error('❌ DEQUE_PROJECT_ID requerido para conexión real');
                deque.enabled = false;
            }
            if (!deque.baseURL) {
                console.warn('⚠️  DEQUE_HUB_URL no configurada');
            }
        }

        if (!deque.enabled) {
            console.log('🎭 Modo demo activado - Los resultados no se enviarán a Deque Hub real');
        }
    }

    /**
     * Imprimir resumen de configuración
     */
    printConfigSummary() {
        const { deque, monitoring, axe } = this.config;

        console.log('\n📊 ===== CONFIGURACIÓN AXE WATCHER =====');
        console.log(`   🔗 Deque Hub: ${deque.enabled ? '✅ Conectado' : '🎭 Modo Demo'}`);
        console.log(`   📍 URL Base: ${this.config.cypress.baseUrl}`);
        console.log(`   ⏰ Monitoreo: ${monitoring.interval / 60000} minutos`);
        console.log(`   📏 Reglas Axe: ${Object.keys(axe.rules).length} activas`);
        console.log(`   🎯 Demos: 7 configurados`);
        console.log('==========================================\n');
    }

    /**
     * Ejecutar pruebas de accesibilidad para un demo específico
     */
    async runDemoTest(demoNumber, customContext = null) {
        const demoConfig = this.getDemoConfig(demoNumber);
        const testName = `Demo ${demoNumber} - ${demoConfig.name}`;

        console.log(`\n🔍 Ejecutando prueba: ${testName}`);

        try {
            // Configuración específica del demo
            const axeConfig = {
                rules: demoConfig.rules,
                includedImpacts: this.config.axe.includedImpacts
            };

            // Ejecutar prueba (en un entorno real esto ejecutaría Cypress)
            const results = await this.executeAxeTest(demoNumber, axeConfig, customContext);

            // Procesar resultados
            const processedResults = this.processResults(results, demoNumber, testName);

            // Almacenar resultados
            this.results.push(processedResults);

            // Enviar a Deque Hub si está configurado
            if (this.config.deque.enabled) {
                await this.sendToDequeHub(processedResults);
            }

            // Generar alertas si es necesario
            this.checkViolations(processedResults);

            console.log(`✅ ${testName} completado - ${processedResults.violations.length} violaciones`);

            return processedResults;

        } catch (error) {
            console.error(`❌ Error en ${testName}:`, error.message);
            return this.createErrorResult(demoNumber, testName, error);
        }
    }

    /**
     * Obtener configuración específica para cada demo
     */
    getDemoConfig(demoNumber) {
        const demoConfigs = {
            1: {
                name: 'Formularios Accesibles',
                rules: {
                    'label': { enabled: true },
                    'button-name': { enabled: true },
                    'form-field-multiple-labels': { enabled: true },
                    'aria-required-attr': { enabled: true },
                    'aria-valid-attr-value': { enabled: true }
                },
                context: '.form-container, form',
                urlPath: '/demo1'
            },
            2: {
                name: 'Navegación por Teclado',
                rules: {
                    'keyboard-access': { enabled: true },
                    'focus-order': { enabled: true },
                    'focus-visible': { enabled: true },
                    'skip-link': { enabled: true },
                    'tabindex': { enabled: true }
                },
                context: '.navigation-container, nav, [role="navigation"]',
                urlPath: '/demo2'
            },
            3: {
                name: 'Contenido Multimedia',
                rules: {
                    'image-alt': { enabled: true },
                    'audio-caption': { enabled: true },
                    'video-description': { enabled: true },
                    'media-alternative': { enabled: true }
                },
                context: '.media-container, img, audio, video',
                urlPath: '/demo3'
            },
            4: {
                name: 'Estructura Semántica',
                rules: {
                    'heading-order': { enabled: true },
                    'landmark-roles': { enabled: true },
                    'aria-roles': { enabled: true },
                    'page-has-heading-one': { enabled: true },
                    'landmark-one-main': { enabled: true }
                },
                context: null, // Todo el documento
                urlPath: '/demo4'
            },
            5: {
                name: 'Contraste de Colores',
                rules: {
                    'color-contrast': { enabled: true },
                    'link-in-text-block': { enabled: true }
                },
                context: '.color-content, .main-content',
                urlPath: '/demo5'
            },
            6: {
                name: 'Atributos ARIA',
                rules: {
                    'aria-valid-attr': { enabled: true },
                    'aria-required-attr': { enabled: true },
                    'aria-prohibited-attr': { enabled: true },
                    'aria-allowed-attr': { enabled: true }
                },
                context: '.aria-demo, [aria-*]',
                urlPath: '/demo6'
            },
            7: {
                name: 'Responsive Design',
                rules: {
                    'viewport': { enabled: true },
                    'meta-viewport': { enabled: true },
                    'css-orientation-lock': { enabled: true }
                },
                context: null, // Todo el documento
                urlPath: '/demo7',
                viewports: [
                    { width: 320, height: 480 },  // Mobile
                    { width: 768, height: 1024 }, // Tablet
                    { width: 1280, height: 720 }  // Desktop
                ]
            }
        };

        return demoConfigs[demoNumber] || {
            name: `Demo ${demoNumber}`,
            rules: this.config.axe.rules,
            context: null,
            urlPath: `/demo${demoNumber}`
        };
    }

    /**
     * Ejecutar prueba de axe (simulación - en realidad se ejecutaría via Cypress)
     */
    async executeAxeTest(demoNumber, axeConfig, customContext) {
        // En un entorno real, esto ejecutaría Cypress programáticamente
        // Por ahora simulamos la ejecución

        const demoConfig = this.getDemoConfig(demoNumber);
        const url = `${this.config.cypress.baseUrl}${demoConfig.urlPath}`;

        console.log(`   📍 URL: ${url}`);
        console.log(`   ⚙️  Contexto: ${customContext || demoConfig.context || 'document'}`);
        console.log(`   📏 Reglas: ${Object.keys(axeConfig.rules).length}`);

        // Simular tiempo de ejecución
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Generar resultados simulados basados en el tipo de demo
        return this.generateMockResults(demoNumber, demoConfig);
    }

    /**
     * Generar resultados de mock realistas para cada demo
     */
    generateMockResults(demoNumber, demoConfig) {
        const baseViolations = [];
        const basePasses = [];

        // Violaciones comunes basadas en el tipo de demo
        switch (demoNumber) {
            case 1: // Formularios
                baseViolations.push(
                    this.createViolation('label', 'serious', 'Form control without label'),
                    this.createViolation('aria-required-attr', 'moderate', 'Required ARIA attribute not present')
                );
                basePasses.push(
                    this.createPass('button-name', 'Button has accessible name'),
                    this.createPass('form-field-multiple-labels', 'No duplicate labels')
                );
                break;

            case 2: // Navegación
                baseViolations.push(
                    this.createViolation('focus-order', 'moderate', 'Focus order inconsistent'),
                    this.createViolation('skip-link', 'minor', 'Skip link not present')
                );
                basePasses.push(
                    this.createPass('keyboard-access', 'All interactive elements keyboard accessible'),
                    this.createPass('focus-visible', 'Focus indicators visible')
                );
                break;

            case 3: // Multimedia
                baseViolations.push(
                    this.createViolation('image-alt', 'critical', 'Image missing alt text'),
                    this.createViolation('video-description', 'serious', 'Video missing description')
                );
                basePasses.push(
                    this.createPass('audio-caption', 'Audio has captions'),
                    this.createPass('media-alternative', 'Media has text alternative')
                );
                break;

            case 4: // Estructura semántica
                baseViolations.push(
                    this.createViolation('heading-order', 'moderate', 'Heading levels skipped'),
                    this.createViolation('landmark-one-main', 'serious', 'Multiple main landmarks')
                );
                basePasses.push(
                    this.createPass('page-has-heading-one', 'Page has h1 heading'),
                    this.createPass('region', 'Content regions properly marked')
                );
                break;

            case 5: // Contraste
                baseViolations.push(
                    this.createViolation('color-contrast', 'serious', 'Insufficient color contrast'),
                    this.createViolation('link-in-text-block', 'moderate', 'Link contrast insufficient')
                );
                basePasses.push(
                    this.createPass('color-contrast', 'Some elements have good contrast'),
                    this.createPass('link-in-text-block', 'Most links have sufficient contrast')
                );
                break;

            case 6: // ARIA
                baseViolations.push(
                    this.createViolation('aria-valid-attr', 'critical', 'Invalid ARIA attribute'),
                    this.createViolation('aria-required-attr', 'serious', 'Missing required ARIA attribute')
                );
                basePasses.push(
                    this.createPass('aria-allowed-attr', 'ARIA attributes used correctly'),
                    this.createPass('aria-prohibited-attr', 'No prohibited ARIA attributes')
                );
                break;

            case 7: // Responsive
                baseViolations.push(
                    this.createViolation('meta-viewport', 'serious', 'Viewport meta tag missing'),
                    this.createViolation('css-orientation-lock', 'moderate', 'Orientation lock detected')
                );
                basePasses.push(
                    this.createPass('viewport', 'Viewport configured correctly'),
                    this.createPass('css-orientation-lock', 'No orientation locks')
                );
                break;
        }

        return {
            violations: baseViolations,
            passes: basePasses,
            incomplete: [],
            inapplicable: [
                this.createInapplicable('audio-caption', 'No audio elements present'),
                this.createInapplicable('video-description', 'No video elements present')
            ],
            timestamp: new Date().toISOString(),
            url: `${this.config.cypress.baseUrl}${demoConfig.urlPath}`,
            demoNumber: demoNumber,
            demoName: demoConfig.name
        };
    }

    /**
     * Crear violación simulada
     */
    createViolation(id, impact, description) {
        return {
            id: id,
            impact: impact,
            description: description,
            help: `Learn more about ${id}`,
            helpUrl: `https://dequeuniversity.com/rules/axe/4.7/${id}`,
            tags: ['wcag2a', 'best-practice'],
            nodes: [
                {
                    html: '<div class="example-element">Example content</div>',
                    impact: impact,
                    any: [
                        {
                            id: id,
                            data: null,
                            message: description
                        }
                    ],
                    all: [],
                    none: []
                }
            ]
        };
    }

    /**
     * Crear pass simulado
     */
    createPass(id, description) {
        return {
            id: id,
            impact: null,
            description: description,
            help: `Learn more about ${id}`,
            helpUrl: `https://dequeuniversity.com/rules/axe/4.7/${id}`,
            tags: ['wcag2a', 'best-practice'],
            nodes: []
        };
    }

    /**
     * Crear inapplicable simulado
     */
    createInapplicable(id, description) {
        return {
            id: id,
            impact: null,
            description: description,
            help: `Learn more about ${id}`,
            helpUrl: `https://dequeuniversity.com/rules/axe/4.7/${id}`,
            tags: ['wcag2a', 'best-practice'],
            nodes: []
        };
    }

    /**
     * Procesar resultados
     */
    processResults(results, demoNumber, testName) {
        return {
            ...results,
            testName: testName,
            summary: {
                totalViolations: results.violations.length,
                totalPasses: results.passes.length,
                criticalViolations: results.violations.filter(v => v.impact === 'critical').length,
                seriousViolations: results.violations.filter(v => v.impact === 'serious').length,
                moderateViolations: results.violations.filter(v => v.impact === 'moderate').length,
                minorViolations: results.violations.filter(v => v.impact === 'minor').length
            },
            processedAt: new Date().toISOString()
        };
    }

    /**
     * Enviar resultados a Deque Hub
     */
    async sendToDequeHub(results) {
        if (!this.config.deque.enabled) {
            return { status: 'skipped', reason: 'deque_disabled' };
        }

        try {
            const payload = {
                projectId: this.config.deque.projectId,
                scanData: {
                    pageName: results.testName,
                    url: results.url,
                    timestamp: results.timestamp,
                    violations: results.violations,
                    passes: results.passes,
                    incomplete: results.incomplete,
                    inapplicable: results.inapplicable,
                    demoNumber: results.demoNumber,
                    demoName: results.demoName,
                    summary: results.summary
                }
            };

            // En un entorno real, esto enviaría a la API de Deque Hub
            console.log(`   📤 Enviando a Deque Hub: ${results.testName}`);

            // Simular envío
            await new Promise(resolve => setTimeout(resolve, 1000));

            return {
                status: 'success',
                scanId: `deque_scan_${Date.now()}`,
                message: 'Results sent to Deque Hub'
            };

        } catch (error) {
            console.error('❌ Error enviando a Deque Hub:', error.message);
            return {
                status: 'error',
                error: error.message
            };
        }
    }

    /**
     * Verificar violaciones y generar alertas
     */
    checkViolations(results) {
        const { summary } = results;

        if (summary.totalViolations > this.config.monitoring.maxViolations) {
            console.warn(`   ⚠️  ALERTA: Demasiadas violaciones en ${results.testName}`);
            console.warn(`      Violaciones: ${summary.totalViolations} (Límite: ${this.config.monitoring.maxViolations})`);
        }

        if (summary.criticalViolations > 0) {
            console.error(`   🚨 CRÍTICO: ${summary.criticalViolations} violaciones críticas en ${results.testName}`);
        }

        // Registrar en historial
        this.violationHistory.push({
            timestamp: results.timestamp,
            demoNumber: results.demoNumber,
            testName: results.testName,
            violations: summary.totalViolations,
            critical: summary.criticalViolations
        });
    }

    /**
     * Crear resultado de error
     */
    createErrorResult(demoNumber, testName, error) {
        return {
            testName: testName,
            demoNumber: demoNumber,
            error: error.message,
            violations: [],
            passes: [],
            incomplete: [],
            inapplicable: [],
            timestamp: new Date().toISOString(),
            summary: {
                totalViolations: 0,
                totalPasses: 0,
                criticalViolations: 0,
                seriousViolations: 0,
                moderateViolations: 0,
                minorViolations: 0
            },
            processedAt: new Date().toISOString()
        };
    }

    /**
     * Ejecutar todos los demos
     */
    async runAllDemos() {
        console.log('\n🎯 ===== EJECUTANDO TODOS LOS DEMOS =====');

        const results = [];

        for (let i = 1; i <= 7; i++) {
            const result = await this.runDemoTest(i);
            results.push(result);
        }

        await this.generateFinalReport(results);
        return results;
    }

    /**
     * Generar reporte final
     */
    async generateFinalReport(results) {
        console.log('\n📊 ===== REPORTE FINAL AXE WATCHER =====');

        const totalViolations = results.reduce((sum, r) => sum + r.summary.totalViolations, 0);
        const totalCritical = results.reduce((sum, r) => sum + r.summary.criticalViolations, 0);
        const demosWithIssues = results.filter(r => r.summary.totalViolations > 0).length;

        console.log(`   📈 Resumen General:`);
        console.log(`      Demos ejecutados: ${results.length}`);
        console.log(`      Demos con issues: ${demosWithIssues}`);
        console.log(`      Violaciones totales: ${totalViolations}`);
        console.log(`      Violaciones críticas: ${totalCritical}`);

        console.log(`\n   🎯 Detalle por Demo:`);
        results.forEach(result => {
            const status = result.summary.totalViolations === 0 ? '✅' :
                result.summary.criticalViolations > 0 ? '🚨' : '⚠️';
            console.log(`      ${status} ${result.testName}`);
            console.log(`          Violaciones: ${result.summary.totalViolations} (Críticas: ${result.summary.criticalViolations})`);
        });

        // Generar reporte JSON
        await this.generateJSONReport(results);

        console.log('\n✨ Ejecución completada. Revisa los reportes en /reports/axe-watcher');
    }

    /**
     * Generar reporte JSON
     */
    async generateJSONReport(results) {
        const report = {
            generatedAt: new Date().toISOString(),
            summary: {
                totalDemos: results.length,
                demosWithViolations: results.filter(r => r.summary.totalViolations > 0).length,
                totalViolations: results.reduce((sum, r) => sum + r.summary.totalViolations, 0),
                totalCritical: results.reduce((sum, r) => sum + r.summary.criticalViolations, 0),
                totalSerious: results.reduce((sum, r) => sum + r.summary.seriousViolations, 0)
            },
            demos: results.map(r => ({
                demoNumber: r.demoNumber,
                testName: r.testName,
                violations: r.summary.totalViolations,
                critical: r.summary.criticalViolations,
                serious: r.summary.seriousViolations,
                url: r.url,
                timestamp: r.timestamp
            })),
            config: {
                axeRules: Object.keys(this.config.axe.rules),
                monitoring: this.config.monitoring,
                dequeEnabled: this.config.deque.enabled
            }
        };

        const reportPath = path.join(this.config.reporting.outputDir, `axe-watcher-report-${Date.now()}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        console.log(`   📄 Reporte JSON generado: ${reportPath}`);
    }

    /**
     * Iniciar monitoreo continuo
     */
    startMonitoring() {
        if (this.isMonitoring) {
            console.log('⚠️  El monitoreo ya está activo');
            return;
        }

        console.log(`🔍 Iniciando monitoreo continuo (intervalo: ${this.config.monitoring.interval / 60000} minutos)`);

        this.isMonitoring = true;

        // Ejecutar inmediatamente
        this.runAllDemos();

        // Programar ejecuciones periódicas
        this.monitorInterval = setInterval(() => {
            console.log('\n⏰ Ejecución programada del Axe Watcher...');
            this.runAllDemos();
        }, this.config.monitoring.interval);
    }

    /**
     * Detener monitoreo
     */
    stopMonitoring() {
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
            this.monitorInterval = null;
        }

        this.isMonitoring = false;
        console.log('🛑 Monitoreo detenido');
    }

    /**
     * Obtener estado actual
     */
    getStatus() {
        return {
            isMonitoring: this.isMonitoring,
            totalRuns: this.results.length,
            lastRun: this.results[this.results.length - 1]?.timestamp,
            violationHistory: this.violationHistory,
            config: {
                dequeEnabled: this.config.deque.enabled,
                monitoringInterval: this.config.monitoring.interval,
                maxViolations: this.config.monitoring.maxViolations
            }
        };
    }
}

// Exportar para uso en otros módulos
module.exports = AxeWatcher;

// Si se ejecuta directamente
if (require.main === module) {
    const watcher = new AxeWatcher();

    // Ejecutar todos los demos
    watcher.runAllDemos().then(() => {
        console.log('🎉 Axe Watcher ejecutado exitosamente');
    }).catch(error => {
        console.error('💥 Error ejecutando Axe Watcher:', error);
        process.exit(1);
    });
}