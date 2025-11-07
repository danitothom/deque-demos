import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config();

async function verifyCustomUrl() {
    console.log('🔍 Verificando URL personalizada de Deque...\n');

    const baseUrl = process.env.DEQUE_HUB_URL;
    const apiKey = process.env.DEQUE_API_KEY;
    const projectId = process.env.DEQUE_PROJECT_ID;

    if (!baseUrl) {
        console.log('❌ DEQUE_HUB_URL no configurada en .env');
        console.log('\n💡 Agrega en tu .env:');
        console.log('DEQUE_HUB_URL=https://tu-subdominio.deque.com');
        return;
    }

    console.log(`🌐 URL configurada: ${baseUrl}`);
    console.log(`🔑 API Key: ${apiKey ? '✅ Configurada' : '❌ Faltante'}`);
    console.log(`📁 Project ID: ${projectId ? '✅ Configurado' : '❌ Faltante'}\n`);

    if (!apiKey || !projectId) {
        console.log('💡 Necesitas configurar API Key y Project ID para pruebas reales');
    }

    // Probar conectividad básica
    console.log('🧪 Probando conectividad básica...');

    try {
        const client = axios.create({
            baseURL: baseUrl,
            timeout: 15000,
            headers: {
                'User-Agent': 'Deque-Verification/1.0.0'
            }
        });

        // Probamos endpoints comunes
        const endpoints = [
            '/api/v1/health',
            '/api/health',
            '/health',
            '/',
            '/hub',
            '/dashboard'
        ];

        for (const endpoint of endpoints) {
            try {
                const response = await client.get(endpoint, { timeout: 5000 });
                console.log(`✅ ${endpoint}: ${response.status}`);

                // Pistas sobre el tipo de servicio
                if (response.headers['server']) {
                    console.log(`   Servidor: ${response.headers['server']}`);
                }
                if (response.headers['x-powered-by']) {
                    console.log(`   Powered by: ${response.headers['x-powered-by']}`);
                }

            } catch (error) {
                if (error.response) {
                    console.log(`✅ ${endpoint}: ${error.response.status} (respuesta del servidor)`);
                } else {
                    console.log(`❌ ${endpoint}: ${error.code || error.message}`);
                }
            }
        }

        // Si tenemos API Key, probar autenticación
        if (apiKey && projectId) {
            console.log('\n🔐 Probando autenticación API...');

            const authClient = axios.create({
                baseURL: baseUrl,
                timeout: 15000,
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            try {
                const projectResponse = await authClient.get(`/api/v1/projects/${projectId}`);
                console.log(`✅ Autenticación exitosa!`);
                console.log(`📊 Proyecto: ${projectResponse.data.name}`);
                console.log(`🆔 ID: ${projectResponse.data.id}`);

            } catch (error) {
                if (error.response) {
                    console.log(`❌ Error de autenticación: ${error.response.status}`);
                    console.log(`   Mensaje: ${error.response.data?.message || 'Sin mensaje'}`);

                    if (error.response.status === 401) {
                        console.log('💡 API Key podría ser inválida');
                    } else if (error.response.status === 404) {
                        console.log('💡 Project ID no encontrado o URL incorrecta');
                    }
                } else {
                    console.log(`❌ Error de conexión: ${error.message}`);
                }
            }
        }

    } catch (error) {
        console.log(`❌ Error general: ${error.message}`);
        console.log('\n💡 Posibles soluciones:');
        console.log('   1. Verifica que la URL sea correcta');
        console.log('   2. Verifica tu conexión a internet');
        console.log('   3. Verifica si hay firewall/proxy bloqueando');
    }
}

verifyCustomUrl();