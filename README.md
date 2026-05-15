# Simulador de Métodos Numéricos 🚀

Una plataforma de documentación interactiva y educativa diseñada para visualizar y estudiar algoritmos de métodos numéricos con una experiencia de usuario premium.

## 🏗️ Arquitectura del Sistema

El proyecto está construido sobre **Docusaurus 3**, aprovechando su potente sistema de documentación estática con soporte completo para MDX (Markdown + React).

### Stack Tecnológico

| Herramienta | Función |
| :--- | :--- |
| **Docusaurus 3** | Framework principal de documentación. |
| **React 19** | Biblioteca para componentes interactivos. |
| **KaTeX** | Renderizado de ecuaciones matemáticas ($LaTeX$). |
| **TypeScript** | Tipado estático para mayor robustez en los algoritmos. |
| **Vanilla CSS** | Sistema de diseño personalizado en `src/css/custom.css`. |

---

## 📂 Estructura de Directorios

```text
numerical-methods-documentation/
├── docs/               # Todo el contenido de la documentación (Markdown/MDX)
│   ├── cap1-.../       # Carpetas por capítulos
│   │   └── _category_.json # Configuración del capítulo en el sidebar
│   └── intro.md        # Página de inicio de la documentación
├── src/
│   ├── components/     # Componentes React personalizados para simulaciones
│   └── css/
│       └── custom.css  # Estilos globales y tokens de diseño
├── docusaurus.config.ts# Configuración principal (Navbar, Footer, Plugins)
├── sidebars.ts         # Configuración de la estructura de la barra lateral
└── package.json        # Dependencias y scripts del proyecto
```

---

## 🛠️ Guía para Desarrolladores

### 1. Requisitos Previos
- Node.js (v20 o superior)
- npm o yarn

### 2. Instalación y Ejecución Local
```bash
# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm run start
```
El sitio estará disponible en `http://localhost:3000`.

### 3. Cómo editar la documentación
Toda la documentación reside en la carpeta `/docs`.
- **Editar contenido**: Busca el archivo `.md` o `.mdx` correspondiente y realiza los cambios. Docusaurus recargará la página automáticamente.
- **Agregar un capítulo**:
    1. Crea una nueva carpeta en `/docs` con el formato `capX-nombre`.
    2. Crea un archivo `_category_.json` dentro para definir el nombre y orden.
    3. Agrega tus archivos de contenido dentro de la carpeta.

### 4. Cómo agregar simuladores interactivos
Para crear un simulador (ej. un buscador de raíces interactivo):
1. Crea el componente React en `src/components/Simuladores/`.
2. Importa el componente dentro de tu archivo `.mdx`:
   ```mdx
   import MiSimulador from '@site/src/components/Simuladores/MiSimulador';

   <MiSimulador />
   ```

### 5. Estilos y Diseño
Los estilos globales se gestionan en `src/css/custom.css`. Utilizamos variables de CSS para mantener la consistencia en el modo claro y oscuro.

---

## 🎨 Filosofía de Diseño
1. **Interactividad**: Los conceptos teóricos deben complementarse con ejemplos prácticos.
2. **Estética Premium**: Uso de tipografía moderna (Inter), espaciado generoso y modo oscuro optimizado.
3. **Rigurosidad**: Todas las fórmulas matemáticas deben usar KaTeX para una visualización clara.

---

## 🚀 Despliegue
Para generar la versión de producción:
```bash
npm run build
```
El resultado se encontrará en la carpeta `/build`.
