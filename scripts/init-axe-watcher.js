// scripts/init-axe-watcher.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Inicializando estructura Axe Watcher...');

// Directorios a crear
const directories = [
    'reports/axe-watcher',
    'backups/axe-watcher',
    'cypress/screenshots/accessibility',
    'cypress/videos/accessibility'
];

directories.forEach(dir => {
    const fullPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`✅ Directorio creado: ${dir}`);
    }
});

// Archivo .env de ejemplo si no existe
const envExample = `# ===== CONFIGURACIÓN DEQUE HUB =====
DEQUE_API_KEY=tu_api_key_aqui
DEQUE_PROJECT_ID=tu_project_id_aqui
DEQUE_HUB_URL=https://axe.deque.com

# ===== CONFIGURACIÓN CYPRESS =====
CYPRESS_BASE_URL=http://localhost:3000

# ===== CONFIGURACIÓN AXE WATCHER =====
AXE_WATCHER_INTERVAL=3600000
AXE_WATCHER_MAX_VIOLATIONS=10

# ===== NOTIFICACIONES (opcional) =====
SLACK_WEBHOOK_URL=tu_webhook_slack
EMAIL_RECIPIENTS=tu@email.com
`;

const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, envExample);
    console.log('✅ Archivo .env.example creado');
}

console.log('\n🎉 Estructura Axe Watcher inicializada correctamente!');
console.log('\n📝 Próximos pasos:');
console.log('   1. Configura tus variables en .env');
console.log('   2. Ejecuta: npm run axe-watcher:init');
console.log('   3. Prueba con: npm run test:a11y:full:demo');
console.log('   4. Para producción: npm run test:a11y:full:deque');