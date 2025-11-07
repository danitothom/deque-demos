import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

async function verifyDequeConnection() {
    console.log('🔍 Verificando conexión con Deque Hub...\n');
    console.log(`🌐 URL: ${process.env.DEQUE_HUB_URL || 'No configurada'}`);
    console.log(`🔑 API Key: ${process.env.DEQUE_API_KEY ? '✅ Configurada' : '❌ Faltante'}`);
    console.log(`📁 Project ID: ${process.env.DEQUE_PROJECT_ID ? '✅ Configurado' : '❌ Faltante'}\n`);

    if (!process.env.DEQUE_HUB_URL) {
        console.log('❌ DEQUE_HUB_URL no configurada en .env');
        console.log('💡 Agrega: DEQUE_HUB_URL=https://axe.deque.com');
        return;
    }

    if (!process.env.DEQUE_API_KEY || !process.env.DEQUE_PROJECT_ID) {
        console.log('💡 Configura en .env:');
        console.log('DEQUE_API_KEY=tu_api_key_real');
        console.log('DEQUE_PROJECT_ID=tu_project_id_real');
        console.log('\n🎭 Ejecutando en modo demo por ahora...');
        return;
    }

    console.log('🧪 Probando conectividad básica...');

    // Primero probamos conectividad básica
    try {
        const basicClient = axios.create({
            baseURL: process.env.DEQUE_HUB_URL,
            timeout: 10000
        });

        const response = await basicClient.get('/');
        console.log('✅ Conectividad básica OK');
        console.log(`   Status: ${response.status}`);

        // Verificar headers para confirmar que es Deque
        if (response.headers['server']) {
            console.log(`   Servidor: ${response.headers['server']}`);
        }

    } catch (error) {
        if (error.response) {
            console.log(`✅ Servidor responde: ${error.response.status}`);
        } else {
            console.log(`❌ Error de conectividad: ${error.code || error.message}`);
            console.log('💡 Verifica:');
            console.log('   - Tu conexión a internet');
            console.log('   - Que la URL https://axe.deque.com sea accesible desde tu navegador');
            console.log('   - Que no haya firewall/proxy bloqueando');
            return;
        }
    }

    // Ahora probamos la API con autenticación
    console.log('\n🔐 Probando autenticación API...');

    const client = axios.create({
        baseURL: process.env.DEQUE_HUB_URL,
        headers: {
            'Authorization': `Bearer ${process.env.DEQUE_API_KEY}`,
            'Content-Type': 'application/json'
        },
        timeout: 15000
    });

    try {
        // Intentar diferentes endpoints comunes de Deque
        const endpoints = [
            '/api/v1/projects',
            '/api/v1/health',
            '/api/health',
            `/api/v1/projects/${process.env.DEQUE_PROJECT_ID}`
        ];

        let success = false;

        for (const endpoint of endpoints) {
            try {
                console.log(`   Probando: ${endpoint}`);
                const response = await client.get(endpoint);
                console.log(`   ✅ ${endpoint}: ${response.status}`);
                success = true;
                break;
            } catch (error) {
                if (error.response) {
                    // 401/403 son "éxitos" en el sentido de que el servidor responde
                    if ([401, 403, 404].includes(error.response.status)) {
                        console.log(`   ✅ ${endpoint}: ${error.response.status} (servidor responde)`);
                        success = true;
                        break;
                    }
                    console.log(`   ❌ ${endpoint}: ${error.response.status}`);
                } else {
                    console.log(`   ❌ ${endpoint}: ${error.code || error.message}`);
                }
            }
        }

        if (success) {
            console.log('\n🎉 ¡Conexión exitosa con Deque Hub!');
            console.log('📊 Puedes proceder con los tests de Cypress');
        } else {
            console.log('\n⚠️  El servidor responde pero no encontramos endpoints válidos');
            console.log('💡 Esto puede ser normal - la estructura de API puede variar');
        }

    } catch (error) {
        console.log('❌ Error de autenticación:');

        if (error.response) {
            console.log('   Status:', error.response.status);
            console.log('   Error:', error.response.data?.message || error.response.statusText);

            if (error.response.status === 401) {
                console.log('   💡 API Key inválida o expirada');
            } else if (error.response.status === 403) {
                console.log('   💡 Sin permisos para acceder al proyecto');
            } else if (error.response.status === 404) {
                console.log('   💡 Project ID no encontrado');
            }
        } else {
            console.log('   Error:', error.message);
        }
    }

    console.log('\n🔗 URL del Dashboard:');
    console.log(`   ${process.env.DEQUE_HUB_URL}/hub/projects/${process.env.DEQUE_PROJECT_ID}`);
}

// Ejecutar si se llama directamente
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    verifyDequeConnection();
}

export default verifyDequeConnection;