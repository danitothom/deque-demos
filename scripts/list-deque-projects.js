import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

async function listDequeProjects() {
    console.log('📋 Obteniendo lista de proyectos de Deque Hub...\n');

    if (!process.env.DEQUE_API_KEY) {
        console.log('❌ Necesitas configurar DEQUE_API_KEY en .env');
        return;
    }

    const client = axios.create({
        baseURL: process.env.DEQUE_HUB_URL || 'https://api.deque.com',
        headers: {
            'Authorization': `Bearer ${process.env.DEQUE_API_KEY}`,
            'Content-Type': 'application/json'
        }
    });

    try {
        // Intentar obtener la lista de proyectos
        const response = await client.get('/api/v1/projects');

        console.log('✅ Proyectos encontrados:');
        if (response.data.projects && response.data.projects.length > 0) {
            response.data.projects.forEach((project, index) => {
                console.log(`\n${index + 1}. ${project.name}`);
                console.log(`   ID: ${project.id}`);
                console.log(`   URL: ${project.baseUrl || 'N/A'}`);
                console.log(`   Equipo: ${project.team?.name || 'N/A'}`);
            });
        } else {
            console.log('   No se encontraron proyectos');
            console.log('\n💡 Puedes crear un proyecto via API:');
            console.log(`
// scripts/create-deque-project.js
const newProject = await client.post('/api/v1/projects', {
  name: 'Mi Proyecto Demo',
  description: 'Proyecto de demostración',
  baseUrl: 'http://localhost:3000'
});
      `);
        }

    } catch (error) {
        console.log('❌ Error obteniendo proyectos:');

        if (error.response) {
            console.log('   - Status:', error.response.status);
            console.log('   - Error:', error.response.data?.message || error.response.statusText);

            if (error.response.status === 401) {
                console.log('   💡 API Key inválida o expirada');
            } else if (error.response.status === 404) {
                console.log('   💡 Endpoint no encontrado - verifica la URL de la API');
            }
        } else {
            console.log('   - Error:', error.message);
        }
    }
}

// Ejecutar si se llama directamente
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    listDequeProjects();
}

export default listDequeProjects;