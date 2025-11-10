// scripts/verify-deque-connection.js
import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: resolve(__dirname, '../.env') });

async function verifyDequeConnection() {
    console.log('🔗 Verificando conexión con Deque Hub...');
    console.log('='.repeat(60));

    const { DEQUE_API_KEY, DEQUE_HUB_URL, DEQUE_PROJECT_ID } = process.env;

    // Verificar configuración básica
    console.log('\n📋 CONFIGURACIÓN:');
    console.log(`   DEQUE_HUB_URL: ${DEQUE_HUB_URL || '❌ No configurada'}`);
    console.log(`   DEQUE_API_KEY: ${DEQUE_API_KEY ? '✅ Configurada' : '❌ No configurada'}`);
    console.log(`   DEQUE_PROJECT_ID: ${DEQUE_PROJECT_ID || '❌ No configurado'}`);

    if (!DEQUE_API_KEY || DEQUE_API_KEY === 'demo_mode') {
        console.log('\n🎭 MODO DEMO ACTIVADO');
        console.log('   Los datos se simularán localmente');
        console.log('   Para conexión real, configura DEQUE_API_KEY en .env');
        return { mode: 'demo', connected: true };
    }

    if (!DEQUE_HUB_URL) {
        console.error('\n❌ CONFIGURACIÓN INCOMPLETA');
        console.error('   DEQUE_HUB_URL es requerida para conexión real');
        return { mode: 'error', connected: false, error: 'DEQUE_HUB_URL no configurada' };
    }

    try {
        // Verificar conexión con la API
        console.log('\n🔄 Verificando conexión API...');
        const response = await axios.get(`${DEQUE_HUB_URL}/api/v2/projects/${DEQUE_PROJECT_ID}`, {
            headers: {
                'Authorization': `Bearer ${DEQUE_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 15000
        });

        console.log('✅ CONEXIÓN EXITOSA');
        console.log(`   Proyecto: ${response.data.name}`);
        console.log(`   ID: ${response.data.id}`);
        console.log(`   Status: ${response.data.status}`);
        console.log(`   URL: ${response.data.baseUrl}`);

        return {
            mode: 'real',
            connected: true,
            project: response.data,
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        console.error('\n❌ ERROR DE CONEXIÓN');

        if (error.response) {
            console.error(`   Status: ${error.response.status}`);
            console.error(`   Error: ${error.response.data?.message || 'Error desconocido'}`);

            if (error.response.status === 401) {
                console.error('   💡 API Key inválida o expirada');
            } else if (error.response.status === 404) {
                console.error('   💡 Project ID no encontrado');
            } else if (error.response.status === 403) {
                console.error('   💡 Sin permisos para acceder al proyecto');
            }
        } else if (error.request) {
            console.error('   💡 No se pudo conectar al servidor');
            console.error('   Verifica DEQUE_HUB_URL y tu conexión a internet');
        } else {
            console.error('   💡 Error de configuración:', error.message);
        }

        return {
            mode: 'error',
            connected: false,
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
}

// Ejecutar verificación
verifyDequeConnection()
    .then(result => {
        console.log('\n📊 RESUMEN DE CONEXIÓN:');
        console.log(`   Modo: ${result.mode}`);
        console.log(`   Conectado: ${result.connected ? '✅' : '❌'}`);

        if (!result.connected) {
            console.log('\n🚨 CONFIGURACIÓN REQUERIDA:');
            console.log('   1. Obtén tu API Key de https://axe.deque.com');
            console.log('   2. Configura DEQUE_API_KEY en .env');
            console.log('   3. Configura DEQUE_PROJECT_ID con tu ID de proyecto');
            console.log('   4. Verifica que DEQUE_HUB_URL sea correcta');
            console.log('   5. Ejecuta: npm run deque:setup');
            process.exit(1);
        } else {
            console.log('\n🎉 ¡Configuración correcta!');
            console.log('   Puedes ejecutar: npm run test:a11y:real');
        }
    })
    .catch(error => {
        console.error('💥 Error inesperado:', error.message);
        process.exit(1);
    });