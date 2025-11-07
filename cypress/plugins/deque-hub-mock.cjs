// Mock para cuando no hay conexión a Deque
class DequeHubMock {
    constructor() {
        this.scans = []
        this.projects = [
            {
                id: 'proj_demo_123',
                name: 'Portal Cliente Demo',
                baseUrl: 'http://localhost:3000',
                team: { name: 'Demo Team' },
                compliance: 78
            }
        ]
        console.log('🎭 Inicializando Deque Hub Mock')
    }

    async uploadScanResults(scanData) {
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 500))

        const scanId = `mock_scan_${Date.now()}`
        const scan = {
            scanId,
            timestamp: new Date().toISOString(),
            pageName: scanData.pageName,
            violations: scanData.violations?.length || 0,
            url: scanData.url,
            status: 'uploaded_mock',
            message: 'Modo demo - Los datos no se enviaron a Deque Hub real'
        }

        this.scans.push(scan)

        console.log('🎭 [MOCK] Simulando upload a Deque Hub:', scanId)
        console.log('📊 Violaciones encontradas:', scanData.violations?.length || 0)

        return scan
    }

    async getProjectReport() {
        return {
            project: this.projects[0],
            compliance: 78,
            totalScans: this.scans.length,
            lastScan: this.scans[this.scans.length - 1],
            scans: this.scans
        }
    }

    getScans() {
        return this.scans
    }
}

module.exports = (on, config) => {
    const mockClient = new DequeHubMock()

    console.log('🎭 Modo Demo Activado - Deque Hub Mock')
    console.log('💡 Para usar la API real, configura DEQUE_API_KEY y DEQUE_PROJECT_ID en .env')

    on('task', {
        uploadToDequeHub: async ({ pageName, results, url }) => {
            try {
                const scanData = {
                    pageName,
                    url: url || `${config.e2e.baseUrl}/${pageName}`,
                    violations: results.violations || [],
                    passes: results.passes || [],
                    incomplete: results.incomplete || [],
                    inapplicable: results.inapplicable || []
                }

                const uploadResult = await mockClient.uploadScanResults(scanData)
                return { status: 'success_mock', ...uploadResult }

            } catch (error) {
                return { status: 'error', error: error.message }
            }
        },

        checkDequeConnection: async () => {
            return {
                connected: true,
                mode: 'mock',
                project: mockClient.projects[0],
                totalScans: mockClient.scans.length
            }
        },

        getDequeScans: () => {
            return mockClient.getScans()
        }
    })

    on('after:run', async (results) => {
        console.log('\n📊 Resumen Mock Deque Hub:')
        console.log(`   Total scans simulados: ${mockClient.scans.length}`)
        mockClient.scans.forEach((scan, index) => {
            console.log(`   ${index + 1}. ${scan.pageName} - ${scan.violations} violaciones`);
        })

        console.log('\n💡 Para usar la API real:')
        console.log('   1. Obtén tu API Key de Deque Hub')
        console.log('   2. Configura DEQUE_API_KEY y DEQUE_PROJECT_ID en .env')
        console.log('   3. Reinicia los tests')
    })

    return config
}