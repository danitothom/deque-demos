// scripts/axe-watcher.config.js
const path = require('path');

module.exports = {
    // Configuración de Cypress
    cypress: {
        baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:3000',
        specPattern: 'cypress/e2e/accessibility/**/*.cy.js',
        configFile: 'cypress.config.js'
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
            'page-has-heading-one': { enabled: true }
        },
        includedImpacts: ['critical', 'serious', 'moderate']
    },

    // Configuración de Deque Hub
    deque: {
        enabled: process.env.DEQUE_API_KEY && process.env.DEQUE_API_KEY !== 'demo_mode',
        apiKey: process.env.DEQUE_API_KEY,
        projectId: process.env.DEQUE_PROJECT_ID,
        baseURL: process.env.DEQUE_HUB_URL || 'https://axe.deque.com'
    },

    // Configuración de monitoreo
    monitoring: {
        interval: 3600000, // 1 hora en milisegundos
        maxViolations: 10,
        alertOnRegression: true,
        checkDemos: [1, 2, 3, 4, 5, 6, 7] // Todos los demos
    },

    // Configuración de reportes
    reporting: {
        outputDir: path.join(__dirname, '../reports/axe-watcher'),
        backupDir: path.join(__dirname, '../backups/axe-watcher'),
        formats: ['json', 'html'],
        generateDashboard: true,
        keepLast: 10 // Mantener últimos 10 reportes
    },

    // Configuración de notificaciones (opcional)
    notifications: {
        slack: {
            enabled: false,
            webhook: process.env.SLACK_WEBHOOK_URL
        },
        email: {
            enabled: false,
            recipients: process.env.EMAIL_RECIPIENTS?.split(',') || []
        }
    }
};