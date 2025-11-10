// scripts/start-demo-server.js
import { execSync, spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 INICIANDO SERVIDOR DE DEMOS DEQUE...\n');

try {
    // Verificar si existe el servidor principal
    try {
        console.log('1. 🔍 Buscando servidor principal...');
        execSync('npm run server', { stdio: 'inherit' });
    } catch (error) {
        console.log('2. ⚠️  Servidor principal no disponible, iniciando servidor simple...');

        // Iniciar servidor simple
        const serverPath = resolve(__dirname, '../server/simple-server.js');
        const server = spawn('node', [serverPath], { stdio: 'inherit' });

        console.log('✅ Servidor simple iniciado en http://localhost:3000');
        console.log('\n📋 DEMOS DISPONIBLES:');
        console.log('   • http://localhost:3000/demo1-basic-html.html');
        console.log('   • http://localhost:3000/demo2-react.html');
        console.log('   • http://localhost:3000/demo3-accessible-components.html');
        console.log('   • http://localhost:3000/demo5-devtools-web.html');
        console.log('   • http://localhost:3000/demo6-devtools-mobile.html');
        console.log('   • http://localhost:3000/demo7-developer-hub.html');
        console.log('   • http://localhost:3000/demo8-complete-workflow.html');
        console.log('   • http://localhost:3000/ (Dashboard completo)');

        // Manejar cierre graceful
        process.on('SIGINT', () => {
            console.log('\n🛑 Cerrando servidor...');
            server.kill();
            process.exit();
        });

    }
} catch (error) {
    console.error('💥 Error iniciando servidor:', error.message);

    // Crear servidor de emergencia
    console.log('\n🆕 Creando servidor de emergencia...');
    const http = await import('http');
    const fs = await import('fs');
    const path = await import('path');

    const server = http.createServer((req, res) => {
        let filePath = req.url === '/' ? '/index.html' : req.url;
        filePath = path.join(process.cwd(), 'public', filePath);

        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end('Demo no encontrado');
                return;
            }

            res.writeHead(200);
            res.end(data);
        });
    });

    server.listen(3000, () => {
        console.log('✅ Servidor de emergencia en: http://localhost:3000');
    });
}