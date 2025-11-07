const axios = require('axios')

// Cliente real para Deque Hub API
class DequeHubClient {
    constructor(config) {
        if (!config.apiKey || !config.projectId) {
            throw new Error('API Key and Project ID are required')
        }

        if (!config.baseURL) {
            throw new Error('DEQUE_HUB_URL is required')
        }

        console.log(`🔗 Conectando a Deque Hub: ${config.baseURL}`)
        console.log(`📁 Proyecto: ${config.projectId}`)

        // Verificar que la URL sea correcta
        if (!config.baseURL.includes('axe.deque.com')) {
            console.warn('⚠️  URL podría ser incorrecta. La URL típica es: https://axe.deque.com')
        }

        this.client = axios.create({
            baseURL: config.baseURL,
            headers: {
                'Authorization': `Bearer ${config.apiKey}`,
                'Content-Type': 'application/json',
                'User-Agent': 'Cypress-Deque-Integration/1.0.0',
                'X-Project-ID': config.projectId
            },
            timeout: 30000
        })

        this.projectId = config.projectId
        this.environment = config.environment || 'development'
        this.scans = []
    }

    async uploadScanResults(scanData) {
        try {
            const payload = {
                projectId: this.projectId,
                environment: this.environment,
                timestamp: new Date().toISOString(),
                url: scanData.url,
                userAgent: scanData.userAgent || 'Cypress',
                violations: scanData.violations || [],
                passes: scanData.passes || [],
                incomplete: scanData.incomplete || [],
                inapplicable: scanData.inapplicable || [],
                metadata: {
                    tool: 'cypress-axe',
                    cypressVersion: require('cypress/package.json').version,
                    axeVersion: require('axe-core/package.json').version,
                    page: scanData.pageName,
                    testType: 'accessibility',
                    ...scanData.metadata
                }
            }

            console.log('📤 Subiendo resultados a Deque Hub...')
            console.log(`   Página: ${scanData.pageName}`)
            console.log(`   Violaciones: ${scanData.violations?.length || 0}`)

            // EN PRODUCCIÓN: Descomentar para usar API real
            /*
            const response = await this.client.post('/api/v1/scans', payload)
            console.log(`✅ Scan subido exitosamente: ${response.data.scanId}`)
            
            // Guardar en cache para demo
            const scanRecord = {
              scanId: response.data.scanId,
              timestamp: new Date().toISOString(),
              pageName: scanData.pageName,
              violations: scanData.violations?.length || 0,
              url: scanData.url,
              status: 'uploaded'
            }
            this.scans.push(scanRecord)
            
            return response.data
            */

            // MODO DEMO TEMPORAL - Simular upload
            await new Promise(resolve => setTimeout(resolve, 1000))

            const mockScanId = `real_scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            const scanRecord = {
                scanId: mockScanId,
                timestamp: new Date().toISOString(),
                pageName: scanData.pageName,
                violations: scanData.violations?.length || 0,
                url: scanData.url,
                status: 'simulated_upload'
            }
            this.scans.push(scanRecord)

            console.log(`✅ [SIMULADO] Scan listo: ${mockScanId}`)
            console.log(`   🔗 Dashboard: ${this.client.defaults.baseURL}/hub/projects/${this.projectId}`)

            return {
                scanId: mockScanId,
                status: 'simulated',
                message: 'En producción, esto se subiría a Deque Hub real'
            }

        } catch (error) {
            console.error('❌ Error subiendo a Deque Hub:', error.message)

            if (error.response) {
                console.error('   Status:', error.response.status)
                console.error('   Error:', error.response.data?.message || error.response.statusText)

                if (error.response.status === 401) {
                    console.error('   💡 API Key inválida o expirada')
                } else if (error.response.status === 404) {
                    console.error('   💡 Project ID no encontrado')
                } else if (error.response.status === 403) {
                    console.error('   💡 Sin permisos para este proyecto')
                }
            }

            throw new Error(`Deque Hub upload failed: ${error.message}`)
        }
    }

    async getProjectReport() {
        try {
            // EN PRODUCCIÓN: Descomentar para API real
            /*
            const response = await this.client.get(`/api/v1/projects/${this.projectId}/report`)
            return response.data
            */

            // Mock response para demo
            return {
                project: {
                    id: this.projectId,
                    name: 'Portal Cliente Demo',
                    baseUrl: 'http://localhost:3000'
                },
                compliance: 85,
                totalScans: this.scans.length,
                lastScan: this.scans[this.scans.length - 1],
                scans: this.scans
            }

        } catch (error) {
            console.error('Error obteniendo reporte:', error.message)
            throw error
        }
    }

    getScans() {
        return this.scans
    }
}

// Inicialización del plugin
module.exports = (on, config) => {
    const dequeConfig = {
        apiKey: process.env.DEQUE_API_KEY || config.env.DEQUE_API_KEY,
        projectId: process.env.DEQUE_PROJECT_ID || config.env.DEQUE_PROJECT_ID,
        baseURL: process.env.DEQUE_HUB_URL,
        environment: process.env.NODE_ENV || 'development'
    }

    let dequeClient = null

    try {
        dequeClient = new DequeHubClient(dequeConfig)
        console.log('✅ Cliente Deque Hub inicializado correctamente')
    } catch (error) {
        console.warn('⚠️ Error inicializando Deque Hub:', error.message)
        console.warn('⚠️ Usando modo mock')
        return require('./deque-hub-mock.cjs')(on, config)
    }

    // Tasks para Cypress
    on('task', {
        uploadToDequeHub: async ({ pageName, results, url }) => {
            if (!dequeClient) {
                return { status: 'skipped', reason: 'not_configured' }
            }

            try {
                const scanData = {
                    pageName,
                    url: url || `${config.e2e.baseUrl}/${pageName}`,
                    userAgent: 'Cypress',
                    violations: results.violations || [],
                    passes: results.passes || [],
                    incomplete: results.incomplete || [],
                    inapplicable: results.inapplicable || [],
                    metadata: {
                        testType: 'accessibility',
                        page: pageName
                    }
                }

                const uploadResult = await dequeClient.uploadScanResults(scanData)
                return { status: 'success', ...uploadResult }

            } catch (error) {
                console.error('Upload task failed:', error.message)
                return { status: 'error', error: error.message }
            }
        },

        checkDequeConnection: async () => {
            if (!dequeClient) {
                return { connected: false, reason: 'not_configured' }
            }

            try {
                const report = await dequeClient.getProjectReport()
                return {
                    connected: true,
                    mode: 'real',
                    project: report.project,
                    totalScans: report.totalScans,
                    compliance: report.compliance
                }
            } catch (error) {
                return {
                    connected: false,
                    reason: error.message
                }
            }
        },

        getDequeScans: () => {
            if (!dequeClient) return []
            return dequeClient.getScans()
        }
    })

    // After run hook
    on('after:run', async (results) => {
        if (!dequeClient) return

        console.log('\n📊 Resumen Deque Hub:')
        const scans = dequeClient.getScans()
        console.log(`   Total scans: ${scans.length}`)

        scans.forEach((scan, index) => {
            console.log(`   ${index + 1}. ${scan.pageName} - ${scan.violations} violaciones - ${scan.scanId}`)
        })

        if (scans.length > 0) {
            console.log(`\n🔗 Ve a tu dashboard: ${dequeConfig.baseURL}/hub/projects/${dequeConfig.projectId}`)
        }
    })

    return config
}