// scripts/list-deque-projects.js
import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: resolve(__dirname, '../.env') });

async function listDequeProjects() {
    console.log('📋 Listando proyectos de Deque Hub...');
    console.log('='.repeat(60));

    const { DEQUE_API_KEY, DEQUE_HUB_URL, DEQUE_PROJECT_ID } = process.env;

    if (!DEQUE_API_KEY || DEQUE_API_KEY === 'demo_mode') {
        console.log('🎭 Modo demo - Mostrando proyectos de ejemplo');
        displayMockProjects();
        return;
    }

    if (!DEQUE_HUB_URL) {
        console.error('❌ DEQUE_HUB_URL no configurada');
        process.exit(1);
    }

    try {
        const response = await axios.get(`${DEQUE_HUB_URL}/api/v2/projects`, {
            headers: {
                'Authorization': `Bearer ${DEQUE_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });

        displayProjects(response.data.projects || []);

    } catch (error) {
        console.error('❌ Error obteniendo proyectos:', error.message);

        if (error.response) {
            console.error(`   Status: ${error.response.status}`);
            console.error(`   Error: ${error.response.data?.message || 'Error desconocido'}`);
        }

        console.log('\n🔍 Mostrando proyectos mock para desarrollo...');
        displayMockProjects();
    }
}

function displayProjects(projects) {
    if (projects.length === 0) {
        console.log('📭 No se encontraron proyectos');
        return;
    }

    console.log(`\n📊 Proyectos encontrados: ${projects.length}`);
    console.log('='.repeat(60));

    projects.forEach((project, index) => {
        console.log(`\n${index + 1}. ${project.name}`);
        console.log(`   ID: ${project.id}`);
        console.log(`   URL Base: ${project.baseUrl || 'No especificada'}`);
        console.log(`   Estado: ${project.status || 'Activo'}`);
        console.log(`   Escaneos: ${project.scanCount || 0}`);
        console.log(`   Compliance: ${project.complianceScore || 'N/A'}%`);

        if (project.lastScan) {
            console.log(`   Último scan: ${new Date(project.lastScan).toLocaleDateString()}`);
        }
    });

    // Proyecto actual configurado
    const currentProjectId = process.env.DEQUE_PROJECT_ID;
    if (currentProjectId) {
        const currentProject = projects.find(p => p.id === currentProjectId);
        console.log('\n🎯 PROYECTO ACTUAL CONFIGURADO:');
        console.log(`   ${currentProject ? currentProject.name : 'No encontrado'} (${currentProjectId})`);
    }
}

function displayMockProjects() {
    const mockProjects = [
        {
            id: 'proj_demo_7demos',
            name: '7 Demos Deque - Axe Watcher',
            baseUrl: 'http://localhost:3000',
            status: 'active',
            scanCount: 42,
            complianceScore: 85,
            lastScan: new Date().toISOString()
        },
        {
            id: 'proj_demo_portal',
            name: 'Portal Cliente - Producción',
            baseUrl: 'https://portal-cliente.com',
            status: 'active',
            scanCount: 156,
            complianceScore: 92,
            lastScan: new Date(Date.now() - 86400000).toISOString()
        },
        {
            id: 'proj_demo_mobile',
            name: 'App Móvil - React Native',
            baseUrl: 'https://app.cliente.com',
            status: 'active',
            scanCount: 78,
            complianceScore: 88,
            lastScan: new Date(Date.now() - 172800000).toISOString()
        }
    ];

    displayProjects(mockProjects);

    console.log('\n💡 INFORMACIÓN PARA PRODUCCIÓN:');
    console.log('   Para ver tus proyectos reales:');
    console.log('   1. Configura DEQUE_API_KEY en .env');
    console.log('   2. Asegúrate de que DEQUE_HUB_URL sea correcta');
    console.log('   3. Ejecuta: npm run deque:projects');
}

listDequeProjects().catch(error => {
    console.error('💥 Error fatal:', error.message);
    process.exit(1);
});