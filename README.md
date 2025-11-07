# 🎯 Deque Demos - Ecosistema Completo de Accesibilidad

Proyecto de demostración que muestra la integración completa del ecosistema Deque para testing de accesibilidad.

## 🚀 Demos Incluidas

| Demo | Descripción | URL Local |
|------|-------------|-----------|
| 1. HTML Básico | Problemas comunes de accesibilidad | `/demo1-basic-html.html` |
| 2. Componentes React | Issues en componentes modernos | `/demo2-react.html` |
| 3. Componentes Accesibles | Soluciones implementadas | `/demo3-accessible-components.html` |
| 4. Axe Linter | Integración VS Code | `/demo4-axe-linter.html` |
| 5. DevTools Web | Testing en navegadores | `/demo5-devtools-web.html` |
| 6. DevTools Mobile | Testing en apps móviles | `/demo6-devtools-mobile.html` |
| 7. Developer Hub | Plataforma Enterprise + Cypress | `/demo7-developer-hub.html` |
| 8. Flujo Completo | Integración end-to-end | `/demo8-complete-workflow.html` |

## 🛠️ Instalación y Uso

```bash
# Clonar repositorio
git clone https://github.com/TU_USUARIO/deque-demos.git
cd deque-demos

# Instalar dependencias
npm install

# Ejecutar servidor de demos
npm run server

# Abrir en navegador
open http://localhost:3000

# Testing con Cypress
# Ejecutar tests de accesibilidad
npm run test:a11y

# Ejecutar con integración Deque Hub real
npm run test:a11y:real

# Estructura del proyecto
demos-deque/
├── public/                 # Demos HTML
├── server/                # Servidor Express
├── scripts/               # Scripts de utilidad
├── cypress/               # Tests de integración
├── .env                   # Configuración (no commit)
└── package.json           # Dependencias y scripts

# Integraciones
Axe Linter - VS Code extension

Axe DevTools - Browser testing

Axe Developer Hub - Enterprise platform

Cypress - Automated testing

GitHub Actions - CI/CD pipeline

# Contribuciones
Fork el proyecto

Crea una rama: git checkout -b feature/nueva-funcionalidad

Commit cambios: git commit -am 'Agrega nueva funcionalidad'

Push la rama: git push origin feature/nueva-funcionalidad

Abre un Pull Request

# Licencia
MIT License. Ver `LICENSE` para más detalles.


### **Paso 7: Hacer Commit y Push del README**

En VS Code Source Control:
1. **Stage** el archivo README.md
2. **Commit:** "Add project documentation"
3. **Push:** Click en "Sync Changes" o `git push`

### **Paso 8: Configurar GitHub Actions (CI/CD)**

#### **8.1 Crear workflow de CI**
Crea el directorio y archivo:
```bash
mkdir -p .github/workflows