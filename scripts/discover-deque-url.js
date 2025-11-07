import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config();

async function discoverDequeUrl() {
    console.log('🔍 Descubriendo URL correcta de Deque API...\n');

    // URLs comunes de Deque
    const commonUrls = [
        'https://axe.deque.com',
        'https://deque.com',
        'https://api.deque.com',
        'https://cloud.deque.com',
        // Agrega aquí la URL específica de tu organización
        'https://TUSUBDOMINIO.deque.com', // ← Reemplaza con tu subdominio
        'https://deque.TUEMPRESA.com',    // ← O este formato
    ];

    console.log('📋 Probando URLs comunes...\n');

    for (const baseUrl of commonUrls) {
        if (baseUrl.includes('TUSUBDOMINIO') || baseUrl.includes('TUEMPRESA')) {
            console.log(`⏭️  Saltando URL placeholder: ${baseUrl}`);
            continue;
        }

        console.log(`🔗 Probando: ${baseUrl}`);

        try {
            const client = axios.create({
                baseURL: baseUrl,
                timeout: 10000,
                headers: {
                    'User-Agent': 'Deque-Discovery/1.0.0'
                }
            });

            // Endpoints comunes de Deque API
            const endpoints = [
                '/api/v1/health',
                '/api/health',
                '/health',
                '/api/v1/projects',
                '/'
            ];

            let foundValid = false;

            for (const endpoint of endpoints) {
                try {
                    const response = await client.get(endpoint, { timeout: 5000 });

                    if (response.status === 200) {
                        console.log(`   ✅ ${endpoint}: ${response.status} - POSIBLE VÁLIDA`);
                        foundValid = true;

                        // Verificar si es una API de Deque
                        if (response.data && (
                            response.data.service === 'deque' ||
                            response.headers['server']?.includes('Deque') ||
                            response.data.message?.includes('Deque')
                        )) {
                            console.log(`   🎯 ¡ENCONTRADA! URL de Deque: ${baseUrl}`);
                            return baseUrl;
                        }
                    }
                } catch (error) {
                    // Ignorar errores 404/401, son normales
                    if (error.response && [200, 401, 403].includes(error.response.status)) {
                        console.log(`   ✅ ${endpoint}: ${error.response.status} - Respuesta del servidor`);
                        foundValid = true;
                    }
                }
            }

            if (!foundValid) {
                console.log(`   ❌ No responde`);
            }

        } catch (error) {
            console.log(`   ❌ Error: ${error.code || error.message}`);
        }
    }

    console.log('\n💡 No se pudo auto-descubrir la URL.');
    console.log('📝 Por favor, mira en tu navegador cuando accedes a Deque Hub:');
    console.log('   1. Abre Deque Developer Hub');
    console.log('   2. Mira la URL en la barra de direcciones');
    console.log('   3. Usa esa URL base (sin /hub, /dashboard, etc.)');
    console.log('\n🎯 Ejemplo: Si ves "https://miempresa.deque.com/hub"');
    console.log('   → Usa: "https://miempresa.deque.com"');
}

discoverDequeUrl();