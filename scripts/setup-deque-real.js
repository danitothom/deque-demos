// scripts/setup-deque-real.js
import fs from 'fs';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function setupDequeReal() {
    console.log('🚀 CONFIGURACIÓN DEQUE HUB - MODO REAL');
    console.log('='.repeat(60));

    console.log('\n📝 INSTRUCCIONES:');
    console.log('1. Ve a https://axe.deque.com/app/profile/api-keys');
    console.log('2. Crea una nueva API Key con permisos read/write');
    console.log('3. Copia la key COMPLETA (empieza con dhp_)');
    console.log('4. Ve a https://axe.deque.com/app/projects');
    console.log('5. Copia el ID de tu proyecto\n');

    const apiKey = await question('🔑 Ingresa tu API Key Deque Hub: ');
    const projectId = await question('📁 Ingresa tu Project ID: ');

    // Validar formato básico
    if (!apiKey.startsWith('dhp_')) {
        console.log('❌ API Key inválida - Debe empezar con "dhp_"');
        rl.close();
        return;
    }

    if (projectId.length < 10) {
        console.log('❌ Project ID parece inválido');
        rl.close();
        return;
    }

    // Actualizar .env
    const envPath = resolve(__dirname, '../.env');
    let envContent = '';

    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');

        // Reemplazar valores existentes
        envContent = envContent.replace(
            /DEQUE_API_KEY=.*/g,
            `DEQUE_API_KEY=${apiKey}`
        );
        envContent = envContent.replace(
            /DEQUE_PROJECT_ID=.*/g,
            `DEQUE_PROJECT_ID=${projectId}`
        );
        envContent = envContent.replace(
            /DEQUE_HUB_URL=.*/g,
            'DEQUE_HUB_URL=https://axe.deque.com'
        );
    } else {
        envContent = `# ===== CONFIGURACIÓN DEQUE HUB REAL =====
DEQUE_API_KEY=${apiKey}
DEQUE_PROJECT_ID=${projectId}
DEQUE_HUB_URL=https://axe.deque.com

# ===== CONFIGURACIÓN CYPRESS =====
CYPRESS_BASE_URL=http://localhost:3000

# ===== CONFIGURACIÓN SERVIDOR =====
PORT=3000
NODE_ENV=production`;
    }

    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ Archivo .env actualizado');

    // Verificar conexión
    console.log('\n🔗 Verificando conexión...');
    try {
        const { execSync } = await import('child_process');
        execSync('npm run deque:verify', { stdio: 'inherit' });
    } catch (error) {
        console.log('❌ La conexión falló. Revisa:');
        console.log('   - Formato de API Key');
        console.log('   - Permisos de la API Key');
        console.log('   - Project ID correcto');
    }

    rl.close();
}

setupDequeReal().catch(error => {
    console.error('💥 Error:', error);
    rl.close();
});