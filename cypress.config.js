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
                    return require('./cypress/plugins/deque-hub-integration.cjs')(on, config)
                } catch (error) {
                    console.log('❌ Error con conexión real:', error.message)
                    console.log('🔄 Cambiando a modo mock...')
                }
            }

            // Usar mock si no hay configuración real
            console.log('🎭 Usando MOCK Deque Hub (modo demo)')
            return require('./cypress/plugins/deque-hub-mock.cjs')(on, config)
        },
        supportFile: 'cypress/support/e2e.js',
        specPattern: 'cypress/e2e/**/*.cy.js'
    },
    env: {
        // Exponer variables a los tests
        DEQUE_API_KEY: process.env.DEQUE_API_KEY,
        DEQUE_PROJECT_ID: process.env.DEQUE_PROJECT_ID,
        DEQUE_HUB_URL: process.env.DEQUE_HUB_URL,
        // Flag para saber si estamos en modo real
        DEQUE_REAL_MODE: process.env.DEQUE_API_KEY && process.env.DEQUE_API_KEY !== 'demo_mode'
    },
    video: false,
    screenshotOnRunFailure: true
})