// scripts/debug-deque-connection.js
import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: resolve(__dirname, '../.env') });

async function debugDequeConnection() {
    console.log('🐛 DEBUG: Diagnóstico completo Deque Hub');
    console.log('='.repeat(60));

    const { DEQUE_API_KEY, DEQUE_HUB_URL, DEQUE_PROJECT_ID } = process.env;

    console.log('\n🔍 ANALIZANDO CONFIGURACIÓN:');
    console.log(`   DEQUE_HUB_URL: ${DEQUE_HUB_URL}`);
    console.log(`   DEQUE_API_KEY: ${DEQUE_API_KEY ? '✅ Configurada' : '❌ No configurada'}`);
    console.log(`   DEQUE_PROJECT_ID: ${DEQUE_PROJECT_ID}`);

    if (DEQUE_API_KEY) {
        console.log(`   Longitud API Key: ${DEQUE_API_KEY.length} caracteres`);
        console.log(`   Empieza con: ${DEQUE_API_KEY.substring(0, 10)}...`);
    }

    if (!DEQUE_API_KEY || !DEQUE_HUB_URL || !DEQUE_PROJECT_ID) {
        console.log('\n❌ CONFIGURACIÓN INCOMPLETA');
        return;
    }

    // Probar diferentes endpoints
    const endpoints = [
        '/api/v2/projects',
        `/api/v2/projects/${DEQUE_PROJECT_ID}`,
        '/api/v2/user'
    ];

    for (const endpoint of endpoints) {
        await testEndpoint(endpoint);
    }

    console.log('\n💡 SOLUCIÓN RECOMENDADA:');
    console.log('   1. Ve a https://axe.deque.com/app/profile/api-keys');
    console.log('   2. Genera una NUEVA API Key con permisos read/write');
    console.log('   3. Copia COMPLETA la nueva key (incluye dhp_)');
    console.log('   4. Actualiza .env y prueba de nuevo');
}

async function testEndpoint(endpoint) {
    const { DEQUE_API_KEY, DEQUE_HUB_URL } = process.env;

    console.log(`\n🔌 Probando: ${endpoint}`);

    try {
        const response = await axios.get(`${DEQUE_HUB_URL}${endpoint}`, {
            headers: {
                'Authorization': `Bearer ${DEQUE_API_KEY}`,
                'Content-Type': 'application/json',
                'User-Agent': 'Deque-Demos-Debug/1.0'
            },
            timeout: 10000,
            validateStatus: null // No lanzar error por códigos HTTP
        });

        console.log(`   Status: ${response.status}`);
        console.log(`   Headers: ${JSON.stringify(response.headers, null, 2).substring(0, 100)}...`);

        if (response.status === 200) {
            console.log('   ✅ CONEXIÓN EXITOSA');
            if (response.data) {
                console.log(`   Data: ${JSON.stringify(response.data).substring(0, 200)}...`);
            }
        } else if (response.status === 401) {
            console.log('   ❌ 401 UNAUTHORIZED - API Key inválida');
            if (response.data) {
                console.log(`   Error: ${JSON.stringify(response.data)}`);
            }
        } else if (response.status === 404) {
            console.log('   ❌ 404 NOT FOUND - Endpoint no existe');
        } else {
            console.log(`   ⚠️  ${response.status} - Respuesta inesperada`);
        }

    } catch (error) {
        console.log(`   💥 ERROR: ${error.message}`);

        if (error.code === 'ENOTFOUND') {
            console.log('   🔍 No se puede resolver el host - Verifica DEQUE_HUB_URL');
        } else if (error.code === 'ECONNREFUSED') {
            console.log('   🔍 Conexión rechazada - Verifica firewall/proxy');
        } else if (error.code === 'ETIMEDOUT') {
            console.log('   🔍 Timeout - Verifica conexión a internet');
        }
    }
}

debugDequeConnection().catch(error => {
    console.error('💥 Error en diagnóstico:', error);
});