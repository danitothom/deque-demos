import { defineConfig } from 'cypress'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Cargar variables de entorno
dotenv.config({ path: resolve(__dirname, '.env') })

export default defineConfig({
    e2e: {
        baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:3000',
        setupNodeEvents(on, config) {
            // Determinar si usar conexión real o mock
            const useRealConnection =
                process.env.DEQUE_HUB_URL &&
                process.env.DEQUE_API_KEY &&
                process.env.DEQUE_PROJECT_ID &&
                process.env.DEQUE_API_KEY !== 'demo_mode';

            if (useRealConnection) {
                console.log('🔗 Configurando conexión REAL con Deque Hub...')
                console.log(`   URL: ${process.env.DEQUE_HUB_URL}`)
                console.log(`   Project: ${process.env.DEQUE_PROJECT_ID}`)
                try {
                    // Importar la integración real de Deque Hub
                    const realIntegration = require('./cypress/plugins/deque-hub-integration.cjs')(on, config)

                    // Añadir tasks adicionales para axe watcher
                    on('task', {
                        // Task para verificar conexión con Deque Hub
                        checkDequeConnection: async () => {
                            try {
                                // Esta función debería estar implementada en deque-hub-integration.cjs
                                return await realIntegration.checkDequeConnection()
                            } catch (error) {
                                return {
                                    success: false,
                                    error: error.message
                                }
                            }
                        },

                        // Task para obtener resultados de axe
                        getAxeResults: () => {
                            return new Promise((resolve) => {
                                // Esta función se completará cuando axe termine el análisis
                                resolve(global.axeResults || {})
                            })
                        },

                        // Task para subir resultados a Deque Hub
                        uploadToDequeHub: async (uploadData) => {
                            try {
                                return await realIntegration.uploadTestResults(uploadData)
                            } catch (error) {
                                return {
                                    success: false,
                                    error: error.message
                                }
                            }
                        },

                        // Task para capturar resultados de axe después del análisis
                        storeAxeResults: (results) => {
                            global.axeResults = results
                            return null
                        }
                    })

                    return realIntegration
                } catch (error) {
                    console.log('❌ Error con conexión real:', error.message)
                    console.log('🔄 Cambiando a modo mock...')
                }
            }

            // Usar mock si no hay configuración real
            console.log('🎭 Usando MOCK Deque Hub (modo demo)')
            const mockIntegration = require('./cypress/plugins/deque-hub-mock.cjs')(on, config)

            // Añadir tasks mock para axe watcher
            on('task', {
                checkDequeConnection: () => {
                    return {
                        success: true,
                        message: 'Modo demo - Conexión simulada con Deque Hub',
                        project: {
                            name: 'Demo Project',
                            id: 'demo-project-id'
                        }
                    }
                },

                getAxeResults: () => {
                    return Promise.resolve({
                        violations: [],
                        passes: [],
                        timestamp: new Date().toISOString()
                    })
                },

                uploadToDequeHub: (uploadData) => {
                    console.log('📤 [MOCK] Subiendo resultados a Deque Hub:', uploadData.pageName)
                    return {
                        success: true,
                        scanId: `mock-scan-${Date.now()}`,
                        dashboardUrl: 'https://developer.deque.com/demo/dashboard',
                        timestamp: new Date().toISOString()
                    }
                },

                storeAxeResults: (results) => {
                    global.axeResults = results
                    return null
                }
            })

            return mockIntegration
        },
        supportFile: 'cypress/support/e2e.js',
        specPattern: 'cypress/e2e/**/*.cy.js',
        viewportWidth: 1280,
        viewportHeight: 720
    },
    env: {
        // Exponer variables a los tests
        DEQUE_API_KEY: process.env.DEQUE_API_KEY,
        DEQUE_PROJECT_ID: process.env.DEQUE_PROJECT_ID,
        DEQUE_HUB_URL: process.env.DEQUE_HUB_URL,
        // Flag para saber si estamos en modo real
        DEQUE_REAL_MODE: process.env.DEQUE_API_KEY && process.env.DEQUE_API_KEY !== 'demo_mode',

        // Configuración global de axe
        axe: {
            include: [['.main-content']],
            exclude: [['.external-widget']],
            // Niveles de impacto a incluir
            includedImpacts: ['critical', 'serious', 'moderate'],
            // Reglas globales
            rules: [
                {
                    id: 'color-contrast',
                    enabled: true
                },
                {
                    id: 'image-alt',
                    enabled: true
                },
                {
                    id: 'button-name',
                    enabled: true
                },
                {
                    id: 'label',
                    enabled: true
                },
                {
                    id: 'link-name',
                    enabled: true
                },
                {
                    id: 'heading-order',
                    enabled: true
                }
            ]
        },

        // Configuración específica para los demos
        demoConfigs: {
            demo1: {
                name: 'Formularios Accesibles',
                rules: {
                    'label': { enabled: true },
                    'button-name': { enabled: true },
                    'form-field-multiple-labels': { enabled: true },
                    'aria-required-attr': { enabled: true }
                }
            },
            demo2: {
                name: 'Navegación por Teclado',
                rules: {
                    'keyboard-access': { enabled: true },
                    'focus-order': { enabled: true },
                    'focus-visible': { enabled: true },
                    'skip-link': { enabled: true }
                }
            },
            demo3: {
                name: 'Contenido Multimedia',
                rules: {
                    'image-alt': { enabled: true },
                    'audio-caption': { enabled: true },
                    'video-description': { enabled: true }
                }
            },
            demo4: {
                name: 'Estructura Semántica',
                rules: {
                    'heading-order': { enabled: true },
                    'landmark-roles': { enabled: true },
                    'aria-roles': { enabled: true }
                }
            },
            demo5: {
                name: 'Contraste de Colores',
                rules: {
                    'color-contrast': { enabled: true },
                    'link-in-text-block': { enabled: true }
                }
            },
            demo6: {
                name: 'Atributos ARIA',
                rules: {
                    'aria-valid-attr': { enabled: true },
                    'aria-required-attr': { enabled: true },
                    'aria-prohibited-attr': { enabled: true }
                }
            },
            demo7: {
                name: 'Responsive Design',
                rules: {
                    'viewport': { enabled: true },
                    'meta-viewport': { enabled: true }
                }
            }
        }
    },
    video: false,
    screenshotOnRunFailure: true,

    // Configuración de reporter para resultados de accesibilidad
    reporter: 'cypress-multi-reporters',
    reporterOptions: {
        reporterEnabled: 'mochawesome',
        mochawesomeReporterOptions: {
            reportDir: 'cypress/reports',
            quiet: true,
            overwrite: false,
            html: false,
            json: true
        }
    }
})