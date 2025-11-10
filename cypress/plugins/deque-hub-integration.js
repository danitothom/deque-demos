const axios = require('axios')
const fs = require('fs')
const path = require('path')

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
        if (!config.baseURL.includes('axe.deque.com') && !config.baseURL.includes('developer.deque.com')) {
            console.warn('⚠️  URL podría ser incorrecta. Las URLs típicas son: https://axe.deque.com o https://developer.deque.com')
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
                timestamp: scanData.timestamp || new Date().toISOString(),
                url: scanData.url,
                userAgent: scanData.userAgent || 'Cypress',
                violations: scanData.violations || [],
                passes: scanData.passes || [],
                incomplete: scanData.incomplete || [],
                inapplicable: scanData.inapplicable || [],
                viewport: scanData.viewport || { width: 1280, height: 720 },
                pageName: scanData.pageName,
                demoNumber: scanData.demoNumber,
                demoName: scanData.demoName,
                metadata: {
                    tool: 'cypress-axe',
                    cypressVersion: require('cypress/package.json').version,
                    axeVersion: require('axe-core/package.json').version,
                    testType: 'accessibility',
                    axeWatcher: true,
                    ...scanData.metadata
                }
            }

            console.log('📤 Subiendo resultados a Deque Hub...')
            console.log(`   Página: ${scanData.pageName}`)
            console.log(`   Demo: ${scanData.demoNumber || 'N/A'}`)
            console.log(`   Violaciones: ${scanData.violations?.length || 0}`)
            console.log(`   URL: ${scanData.url}`)

            // EN PRODUCCIÓN: Usar API real - DESCOMENTAR PARA PRODUCCIÓN
            const response = await this.client.post('/api/v2/scans', payload)
            console.log(`✅ Scan subido exitosamente: ${response.data.scanId}`)

            // Guardar en cache local
            const scanRecord = {
                scanId: response.data.scanId,
                timestamp: new Date().toISOString(),
                pageName: scanData.pageName,
                demoNumber: scanData.demoNumber,
                violations: scanData.violations?.length || 0,
                url: scanData.url,
                status: 'uploaded',
                dashboardUrl: `${this.client.defaults.baseURL}/projects/${this.projectId}/scans/${response.data.scanId}`
            }
            this.scans.push(scanRecord)

            return {
                success: true,
                scanId: response.data.scanId,
                dashboardUrl: scanRecord.dashboardUrl,
                timestamp: response.data.timestamp
            }

            /*
            // MODO DEMO TEMPORAL - Simular upload (COMENTAR EN PRODUCCIÓN)
            await new Promise(resolve => setTimeout(resolve, 1000))

            const mockScanId = `real_scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            const scanRecord = {
                scanId: mockScanId,
                timestamp: new Date().toISOString(),
                pageName: scanData.pageName,
                demoNumber: scanData.demoNumber,
                violations: scanData.violations?.length || 0,
                url: scanData.url,
                status: 'simulated_upload',
                dashboardUrl: `${this.client.defaults.baseURL}/projects/${this.projectId}/scans/${mockScanId}`
            }
            this.scans.push(scanRecord)

            console.log(`✅ [SIMULADO] Scan listo: ${mockScanId}`)
            console.log(`   🔗 Dashboard: ${scanRecord.dashboardUrl}`)

            return {
                success: true,
                scanId: mockScanId,
                dashboardUrl: scanRecord.dashboardUrl,
                timestamp: scanRecord.timestamp,
                message: 'En producción, esto se subiría a Deque Hub real'
            }
            */

        } catch (error) {
            console.error('❌ Error subiendo a Deque Hub:', error.message)

            if (error.response) {
                console.error('   Status:', error.response.status)
                console.error('   Error:', error.response.data?.message || error.response.statusText)

                if (error.response.status === 401) {
                    console.error('   💡 API Key inválida o expirada')
                } else if (error.response.status === 404) {
                    console.error('   💡 Project ID no encontrado o endpoint incorrecto')
                } else if (error.response.status === 403) {
                    console.error('   💡 Sin permisos para este proyecto')
                } else if (error.response.status === 400) {
                    console.error('   💡 Datos de payload incorrectos')
                }
            }

            // Guardar backup local en caso de error
            this.saveLocalBackup(scanData, error.message)

            throw new Error(`Deque Hub upload failed: ${error.message}`)
        }
    }

    async getProjectReport() {
        try {
            // EN PRODUCCIÓN: Usar API real - DESCOMENTAR PARA PRODUCCIÓN
            const response = await this.client.get(`/api/v2/projects/${this.projectId}`)
            return {
                ...response.data,
                totalScans: this.scans.length,
                lastScan: this.scans[this.scans.length - 1],
                scans: this.scans
            }

            /*
            // Mock response para demo (COMENTAR EN PRODUCCIÓN)
            return {
                project: {
                    id: this.projectId,
                    name: 'Portal Cliente Demo - 7 Demos Deque',
                    baseUrl: 'http://localhost:3000',
                    status: 'active'
                },
                compliance: 85,
                totalScans: this.scans.length,
                lastScan: this.scans[this.scans.length - 1],
                scans: this.scans,
                summary: {
                    totalViolations: this.scans.reduce((sum, scan) => sum + scan.violations, 0),
                    criticalIssues: 2,
                    seriousIssues: 5,
                    moderateIssues: 8
                }
            }
            */

        } catch (error) {
            console.error('Error obteniendo reporte:', error.message)

            // Retornar datos locales si la API falla
            return {
                project: {
                    id: this.projectId,
                    name: 'Portal Cliente Demo - 7 Demos Deque',
                    status: 'active (cached)'
                },
                totalScans: this.scans.length,
                lastScan: this.scans[this.scans.length - 1],
                scans: this.scans,
                error: error.message
            }
        }
    }

    saveLocalBackup(scanData, error) {
        try {
            const backupDir = path.join(__dirname, '../../backups')
            if (!fs.existsSync(backupDir)) {
                fs.mkdirSync(backupDir, { recursive: true })
            }

            const backupData = {
                ...scanData,
                uploadError: error,
                backupTimestamp: new Date().toISOString()
            }

            const filename = `deque-backup-${Date.now()}.json`
            const filepath = path.join(backupDir, filename)

            fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2))
            console.log(`📂 Backup guardado localmente: ${filepath}`)

            return filepath
        } catch (backupError) {
            console.error('Error guardando backup:', backupError.message)
        }
    }

    getScans() {
        return this.scans
    }

    getScanSummary() {
        const totalViolations = this.scans.reduce((sum, scan) => sum + scan.violations, 0)
        const demoScans = this.scans.filter(scan => scan.demoNumber).length

        return {
            totalScans: this.scans.length,
            demoScans: demoScans,
            totalViolations: totalViolations,
            averageViolations: this.scans.length > 0 ? (totalViolations / this.scans.length).toFixed(2) : 0,
            lastScan: this.scans[this.scans.length - 1]
        }
    }
}

// Inicialización del plugin
module.exports = (on, config) => {
    const dequeConfig = {
        apiKey: process.env.DEQUE_API_KEY || config.env.DEQUE_API_KEY,
        projectId: process.env.DEQUE_PROJECT_ID || config.env.DEQUE_PROJECT_ID,
        baseURL: process.env.DEQUE_HUB_URL || config.env.DEQUE_HUB_URL,
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

    // Tasks para Cypress - Integración completa con Axe Watcher
    on('task', {
        // Task para subir resultados a Deque Hub (compatible con axe watcher)
        uploadToDequeHub: async (uploadData) => {
            if (!dequeClient) {
                return {
                    success: false,
                    error: 'Deque client not configured',
                    status: 'skipped'
                }
            }

            try {
                const scanData = {
                    pageName: uploadData.pageName,
                    url: uploadData.url,
                    timestamp: uploadData.timestamp,
                    viewport: uploadData.viewport,
                    userAgent: 'Cypress Axe Watcher',
                    violations: uploadData.results?.violations || [],
                    passes: uploadData.results?.passes || [],
                    incomplete: uploadData.results?.incomplete || [],
                    inapplicable: uploadData.results?.inapplicable || [],
                    demoNumber: uploadData.results?.demoNumber,
                    demoName: uploadData.results?.demo,
                    metadata: {
                        testType: 'accessibility',
                        page: uploadData.pageName,
                        axeWatcher: true,
                        source: 'cypress-axe-watcher'
                    }
                }

                const uploadResult = await dequeClient.uploadScanResults(scanData)
                return {
                    status: 'success',
                    ...uploadResult
                }

            } catch (error) {
                console.error('Upload task failed:', error.message)
                return {
                    status: 'error',
                    success: false,
                    error: error.message
                }
            }
        },

        // Task para verificar conexión con Deque Hub
        checkDequeConnection: async () => {
            if (!dequeClient) {
                return {
                    connected: false,
                    success: false,
                    reason: 'not_configured'
                }
            }

            try {
                const report = await dequeClient.getProjectReport()
                const summary = dequeClient.getScanSummary()

                return {
                    connected: true,
                    success: true,
                    mode: 'real',
                    project: report.project,
                    summary: summary,
                    totalScans: report.totalScans,
                    compliance: report.compliance,
                    message: 'Conexión establecida con Deque Hub'
                }
            } catch (error) {
                return {
                    connected: false,
                    success: false,
                    reason: error.message
                }
            }
        },

        // Task para obtener scans realizados
        getDequeScans: () => {
            if (!dequeClient) return []
            return dequeClient.getScans()
        },

        // Task para obtener resultados de axe (axe watcher)
        getAxeResults: () => {
            return new Promise((resolve) => {
                resolve(global.axeResults || {
                    violations: [],
                    passes: [],
                    incomplete: [],
                    inapplicable: [],
                    timestamp: new Date().toISOString()
                })
            })
        },

        // Task para almacenar resultados de axe (axe watcher)
        storeAxeResults: (results) => {
            global.axeResults = results
            return null
        },

        // Task para obtener resumen de scans
        getDequeSummary: () => {
            if (!dequeClient) {
                return { totalScans: 0, totalViolations: 0 }
            }
            return dequeClient.getScanSummary()
        },

        // Task para procesar resultados específicos de demos
        processDemoResults: async (demoData) => {
            if (!dequeClient) {
                return { success: false, error: 'Client not configured' }
            }

            try {
                const scanData = {
                    pageName: `Demo ${demoData.demoNumber} - ${demoData.demoName}`,
                    url: demoData.url,
                    timestamp: demoData.timestamp,
                    viewport: demoData.viewport || { width: 1280, height: 720 },
                    violations: demoData.violations || [],
                    demoNumber: demoData.demoNumber,
                    demoName: demoData.demoName,
                    metadata: {
                        testType: 'demo_validation',
                        demo: true,
                        axeWatcher: true
                    }
                }

                const result = await dequeClient.uploadScanResults(scanData)
                return { success: true, ...result }
            } catch (error) {
                return { success: false, error: error.message }
            }
        }
    })

    // After run hook - Generar reporte final
    on('after:run', async (results) => {
        if (!dequeClient) return

        console.log('\n📊 ===== RESUMEN FINAL DEQUE HUB =====')
        const summary = dequeClient.getScanSummary()
        const scans = dequeClient.getScans()

        console.log(`   Total scans realizados: ${summary.totalScans}`)
        console.log(`   Scans de demos: ${summary.demoScans}`)
        console.log(`   Total violaciones encontradas: ${summary.totalViolations}`)
        console.log(`   Promedio de violaciones por scan: ${summary.averageViolations}`)

        if (scans.length > 0) {
            console.log('\n   📋 Detalle de scans:')
            scans.forEach((scan, index) => {
                const demoInfo = scan.demoNumber ? `(Demo ${scan.demoNumber})` : ''
                console.log(`   ${index + 1}. ${scan.pageName} ${demoInfo}`)
                console.log(`      Violaciones: ${scan.violations} - Status: ${scan.status}`)
                console.log(`      Scan ID: ${scan.scanId}`)
                if (scan.dashboardUrl) {
                    console.log(`      Dashboard: ${scan.dashboardUrl}`)
                }
            })
        }

        if (summary.totalScans > 0) {
            console.log(`\n🔗 Ve a tu dashboard principal: ${dequeConfig.baseURL}/projects/${dequeConfig.projectId}`)
        }

        // Generar reporte local
        generateLocalReport(summary, scans)
    })

    // Función para generar reporte local
    function generateLocalReport(summary, scans) {
        try {
            const reportsDir = path.join(__dirname, '../../reports')
            if (!fs.existsSync(reportsDir)) {
                fs.mkdirSync(reportsDir, { recursive: true })
            }

            const report = {
                summary: summary,
                scans: scans,
                generatedAt: new Date().toISOString(),
                project: {
                    id: dequeConfig.projectId,
                    name: '7 Demos Deque - Axe Watcher'
                },
                environment: dequeConfig.environment
            }

            const reportFile = path.join(reportsDir, `deque-hub-report-${Date.now()}.json`)
            fs.writeFileSync(reportFile, JSON.stringify(report, null, 2))

            console.log(`\n📄 Reporte local generado: ${reportFile}`)
        } catch (error) {
            console.error('Error generando reporte local:', error.message)
        }
    }

    return {
        ...config,
        dequeClient // Exponer el cliente para uso interno
    }
}