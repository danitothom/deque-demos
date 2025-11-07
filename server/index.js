// server/index.js (versión final)
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

// Obtener la ruta absoluta al directorio public
const publicPath = join(__dirname, '../public');
console.log('📁 Serviendo archivos desde:', publicPath);

// Servir archivos estáticos desde public
app.use(express.static(publicPath));

// Ruta principal con lista de TODAS las demos
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Demos Deque - Ecosistema Completo</title>
            <style>
                body { 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
                    max-width: 1200px; 
                    margin: 0 auto; 
                    padding: 40px 20px;
                    background: #f5f5f5;
                }
                header {
                    text-align: center;
                    margin-bottom: 40px;
                }
                h1 {
                    color: #2c3e50;
                    margin-bottom: 10px;
                }
                .subtitle {
                    color: #7f8c8d;
                    font-size: 1.2em;
                    margin-bottom: 30px;
                }
                .demos-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                    gap: 25px;
                    margin-bottom: 40px;
                }
                .demo-card {
                    background: white;
                    border-radius: 12px;
                    padding: 30px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                    border-left: 4px solid;
                }
                .demo-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                }
                .demo-card h2 {
                    color: #2c3e50;
                    margin-top: 0;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .demo-card p {
                    color: #5d6d7e;
                    line-height: 1.6;
                    margin-bottom: 20px;
                }
                .demo-link {
                    display: inline-block;
                    background: #007acc;
                    color: white;
                    padding: 12px 24px;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: 600;
                    margin-top: 10px;
                    transition: background 0.3s;
                }
                .demo-link:hover {
                    background: #005a9e;
                }
                .demo-badge {
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 0.8em;
                    font-weight: 600;
                    margin-left: 10px;
                }
                .badge-problem { background: #e74c3c; color: white; }
                .badge-solution { background: #27ae60; color: white; }
                .badge-tool { background: #3498db; color: white; }
                .badge-platform { background: #9b59b6; color: white; }
                .badge-workflow { background: #00BCD4; color: white; }
                
                .status {
                    background: #27ae60;
                    color: white;
                    padding: 12px 24px;
                    border-radius: 20px;
                    display: inline-block;
                    margin-bottom: 20px;
                    font-weight: 600;
                }
                .demo-icon {
                    font-size: 1.5em;
                }
                .features-list {
                    list-style: none;
                    margin: 15px 0;
                    padding: 0;
                }
                .features-list li {
                    padding: 8px 0;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    border-bottom: 1px solid #f0f0f0;
                }
                .features-list li:last-child {
                    border-bottom: none;
                }
                .features-list li::before {
                    content: "✅";
                }
                
                /* Colores específicos para cada demo */
                .card-1 { border-left-color: #e74c3c; }
                .card-2 { border-left-color: #f39c12; }
                .card-3 { border-left-color: #27ae60; }
                .card-4 { border-left-color: #3498db; }
                .card-5 { border-left-color: #9b59b6; }
                .card-6 { border-left-color: #FF6B35; }
                .card-7 { border-left-color: #9C27B0; }
                .card-8 { border-left-color: #00BCD4; }
            </style>
        </head>
        <body>
            <header>
                <div class="status">✅ Servidor funcionando - 8 Demos Disponibles</div>
                <h1>🎯 Ecosistema Completo Deque</h1>
                <p class="subtitle">Integración completa de herramientas de accesibilidad en el ciclo de desarrollo</p>
            </header>

            <div class="demos-grid">
                <!-- Demo 1 -->
                <div class="demo-card card-1">
                    <h2><span class="demo-icon">📄</span>Demo 1: HTML Básico<span class="demo-badge badge-problem">Problemas</span></h2>
                    <p>Problemas comunes en HTML estándar para aprender a identificarlos.</p>
                    <ul class="features-list">
                        <li>Imágenes sin texto alternativo</li>
                        <li>Contraste insuficiente</li>
                        <li>Formularios sin labels</li>
                    </ul>
                    <a href="/demo1-basic-html.html" class="demo-link">🔍 Abrir Demo 1</a>
                </div>

                <!-- Demo 2 -->
                <div class="demo-card card-2">
                    <h2><span class="demo-icon">⚛️</span>Demo 2: Componentes React<span class="demo-badge badge-problem">Problemas</span></h2>
                    <p>Issues comunes en aplicaciones modernas con componentes interactivos.</p>
                    <ul class="features-list">
                        <li>Modal sin gestión de foco</li>
                        <li>Listas sin roles ARIA</li>
                        <li>Botones personalizados</li>
                    </ul>
                    <a href="/demo2-react.html" class="demo-link">🔍 Abrir Demo 2</a>
                </div>

                <!-- Demo 3 -->
                <div class="demo-card card-3">
                    <h2><span class="demo-icon">✅</span>Demo 3: Componentes Accesibles<span class="demo-badge badge-solution">Soluciones</span></h2>
                    <p>Mejores prácticas implementadas con componentes completamente accesibles.</p>
                    <ul class="features-list">
                        <li>Modal con gestión de foco</li>
                        <li>Formularios con validación</li>
                        <li>0 violaciones en axe-core</li>
                    </ul>
                    <a href="/demo3-accessible-components.html" class="demo-link">🔍 Abrir Demo 3</a>
                </div>

                <!-- Demo 4 -->
                <div class="demo-card card-4">
                    <h2><span class="demo-icon">🔍</span>Demo 4: Axe Linter<span class="demo-badge badge-tool">VS Code</span></h2>
                    <p>Integración de análisis de accesibilidad en tu editor de código.</p>
                    <ul class="features-list">
                        <li>Análisis en tiempo real</li>
                        <li>Sugerencias automáticas</li>
                        <li>Integración con Git</li>
                    </ul>
                    <a href="/demo4-axe-linter.html" class="demo-link">🔍 Abrir Demo 4</a>
                </div>

                <!-- Demo 5 -->
                <div class="demo-card card-5">
                    <h2><span class="demo-icon">🌐</span>Demo 5: DevTools Web<span class="demo-badge badge-tool">Browser</span></h2>
                    <p>Análisis de accesibilidad en navegadores con extensiones dedicadas.</p>
                    <ul class="features-list">
                        <li>Panel en Chrome DevTools</li>
                        <li>Highlight de elementos</li>
                        <li>Exportación de reportes</li>
                    </ul>
                    <a href="/demo5-devtools-web.html" class="demo-link">🔍 Abrir Demo 5</a>
                </div>

                <!-- Demo 6 -->
                <div class="demo-card card-6">
                    <h2><span class="demo-icon">📱</span>Demo 6: DevTools Mobile<span class="demo-badge badge-platform">Mobile</span></h2>
                    <p>Testing de accesibilidad en aplicaciones móviles nativas.</p>
                    <ul class="features-list">
                        <li>iOS con XCTest</li>
                        <li>Android con Espresso</li>
                        <li>React Native testing</li>
                    </ul>
                    <a href="/demo6-devtools-mobile.html" class="demo-link">🔍 Abrir Demo 6</a>
                </div>

                <!-- Demo 7 -->
                <div class="demo-card card-7">
                    <h2><span class="demo-icon">🚀</span>Demo 7: Developer Hub<span class="demo-badge badge-platform">Enterprise</span></h2>
                    <p>Plataforma centralizada para gestión de accesibilidad en equipos.</p>
                    <ul class="features-list">
                        <li>Dashboard centralizado</li>
                        <li>API REST completa</li>
                        <li>Métricas y tendencias</li>
                    </ul>
                    <a href="/demo7-developer-hub.html" class="demo-link">🔍 Abrir Demo 7</a>
                </div>

                <!-- Demo 8 -->
                <div class="demo-card card-8">
                    <h2><span class="demo-icon">🔄</span>Demo 8: Flujo Completo<span class="demo-badge badge-workflow">Workflow</span></h2>
                    <p>Integración end-to-end en el ciclo completo de desarrollo.</p>
                    <ul class="features-list">
                        <li>Desarrollo a producción</li>
                        <li>CI/CD integration</li>
                        <li>Métricas de éxito</li>
                    </ul>
                    <a href="/demo8-complete-workflow.html" class="demo-link">🔍 Abrir Demo 8</a>
                </div>
            </div>

            <div style="background: #2c3e50; color: white; padding: 25px; border-radius: 12px; margin-top: 40px;">
                <h3 style="margin-top: 0; color: #ecf0f1;">🛠️ Comandos de Verificación</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px; font-family: 'Monaco', 'Consolas', monospace;">
                    <div style="background: #34495e; padding: 12px; border-radius: 6px;">npm run demo:html</div>
                    <div style="background: #34495e; padding: 12px; border-radius: 6px;">npm run demo:react</div>
                    <div style="background: #34495e; padding: 12px; border-radius: 6px;">npm run demo:accessible</div>
                    <div style="background: #34495e; padding: 12px; border-radius: 6px;">npm run demo:linter</div>
                    <div style="background: #34495e; padding: 12px; border-radius: 6px;">npm run demo:devtools</div>
                    <div style="background: #34495e; padding: 12px; border-radius: 6px;">npm run demo:mobile</div>
                    <div style="background: #34495e; padding: 12px; border-radius: 6px;">npm run demo:hub</div>
                    <div style="background: #34495e; padding: 12px; border-radius: 6px;">npm run demo:workflow</div>
                    <div style="background: #27ae60; padding: 12px; border-radius: 6px; grid-column: 1 / -1; text-align: center;">
                        npm run demo:all
                    </div>
                </div>
            </div>

            <footer style="text-align: center; margin-top: 40px; color: #7f8c8d; padding: 20px;">
                <p><strong>Partnership Deque</strong> - Ecosistema completo de herramientas de accesibilidad</p>
                <p>Workshop: Integración de accesibilidad en el ciclo de desarrollo completo</p>
            </footer>
        </body>
        </html>
    `);
});

// Health check y rutas para todas las demos
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        demos: [
            'demo1-basic-html.html',
            'demo2-react.html',
            'demo3-accessible-components.html',
            'demo4-axe-linter.html',
            'demo5-devtools-web.html',
            'demo6-devtools-mobile.html',
            'demo7-developer-hub.html',
            'demo8-complete-workflow.html'
        ]
    });
});

// Rutas específicas para todas las demos
const demos = [
    'demo1-basic-html.html',
    'demo2-react.html',
    'demo3-accessible-components.html',
    'demo4-axe-linter.html',
    'demo5-devtools-web.html',
    'demo6-devtools-mobile.html',
    'demo7-developer-hub.html',
    'demo8-complete-workflow.html'
];

demos.forEach(demo => {
    app.get(`/${demo}`, (req, res) => {
        res.sendFile(join(publicPath, demo));
    });
});

// Manejar rutas no encontradas
app.use((req, res) => {
    res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Página no encontrada</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    text-align: center; 
                    padding: 50px;
                    background: #f5f5f5;
                }
                .error-container {
                    background: white;
                    padding: 40px;
                    border-radius: 10px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    max-width: 500px;
                    margin: 0 auto;
                }
                h1 { 
                    color: #e74c3c;
                    margin-bottom: 20px;
                }
                .home-link {
                    display: inline-block;
                    background: #007acc;
                    color: white;
                    padding: 10px 20px;
                    text-decoration: none;
                    border-radius: 5px;
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <div class="error-container">
                <h1>❌ Página no encontrada</h1>
                <p>La página que buscas no existe en el servidor.</p>
                <p><strong>Ruta solicitada:</strong> ${req.originalUrl}</p>
                <a href="/" class="home-link">🏠 Volver al inicio</a>
            </div>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log('🚀 Servidor de demos ejecutándose correctamente');
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log('\n📁 Todas las demos disponibles:');
    demos.forEach((demo, index) => {
        console.log(`   ${index + 1}. http://localhost:${PORT}/${demo}`);
    });
    console.log('\n⚠️  Para detener el servidor: Ctrl + C');
});