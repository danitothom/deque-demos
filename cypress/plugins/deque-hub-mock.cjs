// Mock para cuando no hay conexión a Deque Hub - Actualizado con Axe Watcher
class DequeHubMock {
    constructor() {
        this.scans = []
        this.projects = [
            {
                id: 'proj_demo_7demos',
                name: '7 Demos Deque - Axe Watcher',
                baseUrl: 'http://localhost:3000',
                team: { name: 'Demo Team - Accessibility' },
                compliance: 82,
                status: 'active'
            }
        ]
        this.demoStats = {
            totalDemos: 7,
            completedDemos: 0,
            totalViolations: 0
        }
        console.log('🎭 Inicializando Deque Hub Mock - Axe Watcher Integration')
    }

    async uploadScanResults(scanData) {
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 300))

        const scanId = `mock_scan_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`

        // Procesar datos específicos de demo
        const isDemo = scanData.demoNumber || scanData.demoName
        if (isDemo) {
            this.demoStats.completedDemos++
            this.demoStats.totalViolations += scanData.violations?.length || 0
        }

        const scan = {
            scanId,
            timestamp: scanData.timestamp || new Date().toISOString(),
            pageName: scanData.pageName,
            demoNumber: scanData.demoNumber,
            demoName: scanData.demoName,
            violations: scanData.violations?.length || 0,
            violationDetails: scanData.violations || [],
            url: scanData.url,
            viewport: scanData.viewport || { width: 1280, height: 720 },
            status: 'uploaded_mock',
            environment: scanData.environment || 'development',
            message: 'Modo demo - Los datos no se enviaron a Deque Hub real',
            dashboardUrl: `https://axe.deque.com/mock/projects/${this.projects[0].id}/scans/${scanId}`
        }

        this.scans.push(scan)

        console.log('🎭 [MOCK] Simulando upload a Deque Hub:')
        console.log(`   📄 Página: ${scanData.pageName}`)
        if (scanData.demoNumber) {
            console.log(`   🔢 Demo: ${scanData.demoNumber}`)
        }
        console.log(`   ⚠️  Violaciones: ${scanData.violations?.length || 0}`)
        console.log(`   🔗 Scan ID: ${scanId}`)

        return {
            success: true,
            scanId,
            dashboardUrl: scan.dashboardUrl,
            timestamp: scan.timestamp,
            demoStats: isDemo ? this.getDemoStats() : null
        }
    }

    async getProjectReport() {
        return {
            project: this.projects[0],
            compliance: this.calculateCompliance(),
            totalScans: this.scans.length,
            demoStats: this.getDemoStats(),
            lastScan: this.scans[this.scans.length - 1],
            scans: this.scans,
            summary: {
                totalViolations: this.scans.reduce((sum, scan) => sum + scan.violations, 0),
                criticalIssues: this.scans.filter(s => s.violations > 5).length,
                seriousIssues: this.scans.filter(s => s.violations > 2 && s.violations <= 5).length,
                moderateIssues: this.scans.filter(s => s.violations <= 2).length
            }
        }
    }

    calculateCompliance() {
        if (this.scans.length === 0) return 100

        const totalViolations = this.scans.reduce((sum, scan) => sum + scan.violations, 0)
        const maxPossibleViolations = this.scans.length * 10 // Asumiendo 10 violaciones máx por scan

        const compliance = Math.max(0, 100 - (totalViolations / maxPossibleViolations * 100))
        return Math.round(compliance)
    }

    getDemoStats() {
        const demoScans = this.scans.filter(scan => scan.demoNumber)
        const demoViolations = demoScans.reduce((sum, scan) => sum + scan.violations, 0)

        return {
            totalDemos: this.demoStats.totalDemos,
            completedDemos: this.demoStats.completedDemos,
            remainingDemos: this.demoStats.totalDemos - this.demoStats.completedDemos,
            demoViolations: demoViolations,
            completionPercentage: Math.round((this.demoStats.completedDemos / this.demoStats.totalDemos) * 100)
        }
    }

    getScans() {
        return this.scans
    }

    getScanSummary() {
        const demoScans = this.scans.filter(scan => scan.demoNumber)
        const totalViolations = this.scans.reduce((sum, scan) => sum + scan.violations, 0)

        return {
            totalScans: this.scans.length,
            demoScans: demoScans.length,
            totalViolations: totalViolations,
            averageViolations: this.scans.length > 0 ? (totalViolations / this.scans.length).toFixed(2) : 0,
            lastScan: this.scans[this.scans.length - 1],
            demoStats: this.getDemoStats()
        }
    }

    // Nuevo método para procesar resultados específicos de axe
    processAxeResults(axeResults, metadata = {}) {
        const violations = axeResults.violations || []
        const passes = axeResults.passes || []

        return {
            violations: violations,
            passes: passes,
            incomplete: axeResults.incomplete || [],
            inapplicable: axeResults.inapplicable || [],
            timestamp: axeResults.timestamp || new Date().toISOString(),
            ...metadata
        }
    }
}

module.exports = (on, config) => {
    const mockClient = new DequeHubMock()

    console.log('🎭 ===== MODO DEMO ACTIVADO - AXE WATCHER =====')
    console.log('🔧 Funcionalidades incluidas:')
    console.log('   ✅ Axe Watcher Integration')
    console.log('   ✅ 7 Demos Tracking')
    console.log('   ✅ Violations Analytics')
    console.log('   ✅ Demo Progress Tracking')
    console.log('💡 Para usar la API real, configura DEQUE_API_KEY y DEQUE_PROJECT_ID en .env')

    // Tasks para Cypress - Actualizados con Axe Watcher
    on('task', {
        // Task principal para subir resultados (compatible con axe watcher)
        uploadToDequeHub: async (uploadData) => {
            try {
                const scanData = {
                    pageName: uploadData.pageName,
                    url: uploadData.url,
                    timestamp: uploadData.timestamp,
                    viewport: uploadData.viewport,
                    violations: uploadData.results?.violations || [],
                    passes: uploadData.results?.passes || [],
                    incomplete: uploadData.results?.incomplete || [],
                    inapplicable: uploadData.results?.inapplicable || [],
                    demoNumber: uploadData.results?.demoNumber,
                    demoName: uploadData.results?.demo,
                    environment: 'development',
                    metadata: {
                        tool: 'cypress-axe-watcher',
                        mode: 'mock',
                        axeWatcher: true,
                        ...uploadData.metadata
                    }
                }

                const uploadResult = await mockClient.uploadScanResults(scanData)
                return {
                    status: 'success_mock',
                    ...uploadResult
                }

            } catch (error) {
                return {
                    status: 'error',
                    success: false,
                    error: error.message
                }
            }
        },

        // Task para verificar conexión
        checkDequeConnection: async () => {
            const report = await mockClient.getProjectReport()
            return {
                connected: true,
                success: true,
                mode: 'mock',
                project: report.project,
                summary: mockClient.getScanSummary(),
                totalScans: report.totalScans,
                compliance: report.compliance,
                message: 'Modo demo - Conexión simulada con Deque Hub'
            }
        },

        // Task para obtener scans
        getDequeScans: () => {
            return mockClient.getScans()
        },

        // Task para obtener resultados de axe (axe watcher)
        getAxeResults: () => {
            return new Promise((resolve) => {
                const mockAxeResults = global.axeResults || {
                    violations: [],
                    passes: [
                        {
                            id: 'mock-pass-1',
                            impact: null,
                            tags: ['wcag2a', 'best-practice'],
                            description: 'Mock passing check',
                            help: 'This is a mock passing accessibility check',
                            helpUrl: 'https://dequeuniversity.com'
                        }
                    ],
                    incomplete: [],
                    inapplicable: [
                        {
                            id: 'mock-inapplicable-1',
                            impact: null,
                            tags: ['wcag2aa'],
                            description: 'Mock inapplicable check',
                            help: 'This check is not applicable to this page',
                            helpUrl: 'https://dequeuniversity.com'
                        }
                    ],
                    timestamp: new Date().toISOString()
                }
                resolve(mockAxeResults)
            })
        },

        // Task para almacenar resultados de axe (axe watcher)
        storeAxeResults: (results) => {
            global.axeResults = results
            return null
        },

        // Task para obtener resumen
        getDequeSummary: () => {
            return mockClient.getScanSummary()
        },

        // Task para procesar resultados específicos de demos
        processDemoResults: async (demoData) => {
            try {
                const processedResults = mockClient.processAxeResults(demoData, {
                    demoNumber: demoData.demoNumber,
                    demoName: demoData.demoName
                })

                const scanData = {
                    pageName: `Demo ${demoData.demoNumber} - ${demoData.demoName}`,
                    url: demoData.url,
                    timestamp: demoData.timestamp,
                    viewport: demoData.viewport || { width: 1280, height: 720 },
                    violations: processedResults.violations,
                    demoNumber: demoData.demoNumber,
                    demoName: demoData.demoName,
                    metadata: {
                        testType: 'demo_validation',
                        demo: true,
                        axeWatcher: true,
                        source: 'mock-processor'
                    }
                }

                const result = await mockClient.uploadScanResults(scanData)
                return { success: true, ...result }
            } catch (error) {
                return { success: false, error: error.message }
            }
        },

        // Nuevo task para simular análisis de axe en tiempo real
        simulateAxeAnalysis: (pageContext) => {
            // Simular análisis de axe con datos realistas
            const mockViolations = [
                {
                    id: 'color-contrast',
                    impact: 'serious',
                    tags: ['wcag2aa', 'wcag143'],
                    description: 'Ensures the contrast between foreground and background colors meets WCAG 2 AA contrast ratio thresholds',
                    help: 'Elements must have sufficient color contrast',
                    helpUrl: 'https://dequeuniversity.com/rules/axe/4.7/color-contrast',
                    nodes: [
                        {
                            html: '<div class="low-contrast-text">Example text</div>',
                            impact: 'serious',
                            any: [
                                {
                                    id: 'color-contrast',
                                    data: { contrastRatio: '3.2:1' },
                                    message: 'Element has insufficient color contrast'
                                }
                            ]
                        }
                    ]
                },
                {
                    id: 'image-alt',
                    impact: 'critical',
                    tags: ['wcag2a', 'wcag111', 'section508', 'section508.22.a'],
                    description: 'Ensures <img> elements have alternate text or a role of none or presentation',
                    help: 'Images must have alternate text',
                    helpUrl: 'https://dequeuniversity.com/rules/axe/4.7/image-alt',
                    nodes: [
                        {
                            html: '<img src="example.jpg">',
                            impact: 'critical',
                            any: [
                                {
                                    id: 'has-alt',
                                    data: null,
                                    message: 'Element does not have an alt attribute'
                                }
                            ]
                        }
                    ]
                }
            ]

            const mockResults = {
                violations: mockViolations,
                passes: [],
                incomplete: [],
                inapplicable: [],
                timestamp: new Date().toISOString(),
                url: pageContext.url,
                pageTitle: pageContext.pageName
            }

            global.axeResults = mockResults
            return mockResults
        }
    })

    // After run hook - Reporte final mejorado
    on('after:run', async (results) => {
        console.log('\n📊 ===== RESUMEN FINAL MOCK DEQUE HUB =====')
        const summary = mockClient.getScanSummary()
        const demoStats = mockClient.getDemoStats()
        const scans = mockClient.getScans()

        console.log(`   📈 Estadísticas Generales:`)
        console.log(`      Total scans simulados: ${summary.totalScans}`)
        console.log(`      Scans de demos: ${summary.demoScans}`)
        console.log(`      Total violaciones encontradas: ${summary.totalViolations}`)
        console.log(`      Compliance score: ${mockClient.calculateCompliance()}%`)

        console.log(`\n   🎯 Progreso de Demos:`)
        console.log(`      Demos completados: ${demoStats.completedDemos}/${demoStats.totalDemos}`)
        console.log(`      Progreso: ${demoStats.completionPercentage}%`)
        console.log(`      Violaciones en demos: ${demoStats.demoViolations}`)

        if (scans.length > 0) {
            console.log(`\n   📋 Detalle de Scans:`)
            scans.forEach((scan, index) => {
                const demoInfo = scan.demoNumber ? `[Demo ${scan.demoNumber}]` : ''
                console.log(`      ${index + 1}. ${scan.pageName} ${demoInfo}`)
                console.log(`          Violaciones: ${scan.violations} - Status: ${scan.status}`)
                console.log(`          Scan ID: ${scan.scanId}`)
            })
        }

        console.log('\n💡 ===== PRÓXIMOS PASOS =====')
        console.log('   1. Para usar la API real de Deque Hub:')
        console.log('      - Obtén tu API Key de https://axe.deque.com')
        console.log('      - Configura DEQUE_API_KEY y DEQUE_PROJECT_ID en .env')
        console.log('      - Asegúrate de que DEQUE_HUB_URL sea correcta')
        console.log('   2. Reinicia los tests: npm run test:a11y')
        console.log('   3. Ve a tu dashboard real en Deque Hub')
        console.log('\n🎭 Los datos mostrados son de demostración y no se enviaron a Deque Hub real')
    })

    // Before run hook - Inicialización
    on('before:run', async (details) => {
        console.log('🚀 Iniciando pruebas de accesibilidad con Axe Watcher...')
        console.log('📍 URL base:', config.e2e.baseUrl)
        console.log('🎯 Demos a probar: 7')
        console.log('🔧 Herramienta: Cypress + Axe Core')
    })

    return {
        ...config,
        mockClient // Exponer el cliente mock para debugging
    }
}