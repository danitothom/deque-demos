// scripts/switch-mode.js
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const modes = {
    demo: {
        DEQUE_API_KEY: 'demo_mode',
        DEQUE_PROJECT_ID: 'demo_project_7demos',
        DEQUE_HUB_URL: 'https://axe.deque.com',
        NODE_ENV: 'development'
    },
    real: {
        DEQUE_API_KEY: 'dhp_7ffbc1b0-3c9b-44d8-9182-3d9983711eb9',
        DEQUE_PROJECT_ID: '86d6e7a1-29d5-43ae-9dfc-7d9c25e0f50a',
        DEQUE_HUB_URL: 'https://axe.deque.com',
        NODE_ENV: 'production'
    }
};

function switchMode(targetMode) {
    const envPath = resolve(__dirname, '../.env');

    if (!fs.existsSync(envPath)) {
        console.error('❌ Archivo .env no encontrado');
        return;
    }

    let envContent = fs.readFileSync(envPath, 'utf8');
    const modeConfig = modes[targetMode];

    if (!modeConfig) {
        console.error('❌ Modo no válido. Usa: demo o real');
        return;
    }

    // Actualizar variables
    Object.entries(modeConfig).forEach(([key, value]) => {
        const regex = new RegExp(`${key}=.*`, 'g');
        if (envContent.match(regex)) {
            envContent = envContent.replace(regex, `${key}=${value}`);
        } else {
            envContent += `\n${key}=${value}`;
        }
    });

    fs.writeFileSync(envPath, envContent);
    console.log(`✅ Modo cambiado a: ${targetMode.toUpperCase()}`);
    console.log(`🔧 Variables configuradas para modo ${targetMode}`);
}

// Ejecutar según argumento
const targetMode = process.argv[2] || 'demo';
switchMode(targetMode);