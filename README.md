# Simulador de Métodos Numéricos 🚀

Una plataforma de documentación interactiva y educativa de alto rendimiento diseñada para visualizar, estudiar y resolver algoritmos de métodos numéricos con una experiencia de usuario premium. El proyecto combina la teoría rigurosa de los métodos numéricos con la interactividad de simuladores gráficos en tiempo real.

---

# 🤝 Guía de Colaboración (AI-Assisted)

Esta guía explica cómo colaborar en la documentación usando la Inteligencia Artificial y las herramientas visuales para guardar tus cambios de manera sencilla.

## 1. Instalación Rápida
1.  **Git**: [Descargar aquí](https://git-scm.com/)
2.  **Antigravity IDE**: Tu herramienta de trabajo.
3.  **Node.js**: [Descargar aquí](https://nodejs.org/) (Versión 20 o superior).

## 2. Iniciar el Proyecto
Abre la terminal en Antigravity (`Ctrl + ñ` o a través del menú de Terminal) y escribe:
```bash
git clone https://github.com/fernando-aguilar-coro/ossu-electronic.git
npm install
npm run start
```

## 3. Cómo Colaborar con la IA
Usa el chat de **Antigravity** para pedir cambios. No necesitas escribir código complejo, solo explica lo que quieres en tu idioma natural.

**Ejemplo:** *"Antigravity, agrega el capítulo 5 sobre Bisección con este texto [pegar texto]"*.

---

## 4. Guardar y Enviar Cambios (Interfaz Visual)

En lugar de usar comandos de terminal difíciles, aprovecha los botones de la interfaz de usuario:

### Paso 1: Crear una Rama (Tu espacio)
En la esquina inferior izquierda del IDE, haz clic donde dice `main` y selecciona **"Create new branch..."**. Dale un nombre descriptivo a tu rama (ej: `nuevo-capitulo-biseccion`).

### Paso 2: Guardar (Commit)
1.  Haz clic en el icono de **Source Control** (control de código fuente) en la barra lateral izquierda (el icono que parece un diagrama de ramas con nodos).
2.  Escribe un mensaje breve sobre lo que hiciste en el cuadro de texto (ej: "Agregué la teoría del método de bisección").
3.  Haz clic en el botón azul **"Commit"**.

### Paso 3: Subir (Push)
Haz clic en el botón **"Publish Branch"** o en las flechas de sincronización circulares que aparecerán abajo. Esto subirá tus cambios a tu repositorio remoto de forma segura.

### Paso 4: Solicitar Revisión (Pull Request)
1.  Entra a [GitHub: ossu-electronic](https://github.com/fernando-aguilar-coro/ossu-electronic).
2.  Verás un aviso amarillo llamativo que dice **"Compare & pull request"**. Haz clic ahí.
3.  Haz clic en el botón verde **"Create pull request"** y ¡listo! El administrador revisará e integrará tus aportes.

---

## ✅ Beneficios de este método
*   **Seguridad**: Tus cambios no afectan el sitio web principal hasta que el equipo los revise y apruebe.
*   **Fácil**: Todo el proceso se completa con botones de la interfaz gráfica y lenguaje natural con la IA.
*   **Colaborativo**: Recibirás ayuda, retroalimentación y correcciones de estilo del equipo directamente en GitHub.

---

## ⚡ Anexo: Resumen de Comandos (Terminal)

Si prefieres trabajar directamente con la consola de comandos en lugar de usar la interfaz visual del IDE, estos son los pasos equivalentes:

```bash
# 1. Asegurarte de estar al día con la rama principal
git pull origin main

# 2. Crear y cambiarte a tu rama de trabajo
git checkout -b nombre-de-tu-rama

# 3. Registrar y guardar tus cambios locales
git add .
git commit -m "Descripción clara de lo que hiciste"

# 4. Subir tus cambios al repositorio remoto
git push origin nombre-de-tu-rama
```
*Una vez finalizado, ingresa a la página web de GitHub para crear el Pull Request manualmente.*

---

# 📖 Especificaciones Técnicas del Proyecto

## 🌟 Características Clave

*   **Consola de Simulación Interactiva (Playground)**: Un panel interactivo directamente en la página de inicio que permite alternar y probar diferentes familias de algoritmos en tiempo real.
*   **Visualización en Canvas**: Representación geométrica animada de las iteraciones de cada método (gráficas de funciones, aproximaciones de intervalos, secantes, tangentes, polinomios interpolantes e integrales bajo la curva).
*   **Separación Estricta de Responsabilidades**: Desacoplamiento de la lógica matemática pura (motores en TypeScript) y los componentes visuales (React).
*   **Teoría MDX & LaTeX**: Documentación matemática enriquecida que integra ecuaciones científicas (vía KaTeX) con los simuladores reactivos interactivos.
*   **Modo Oscuro Integrado**: Temas claros y oscuros optimizados visualmente para una lectura agradable.

---

## 🏗️ Arquitectura del Sistema

El proyecto está construido sobre **Docusaurus 3**, aprovechando su sistema de documentación estática optimizada con soporte completo para MDX (Markdown + React 19) y compilaciones ultrarrápidas con `@docusaurus/faster`.

### Stack Tecnológico

| Herramienta | Función |
| :--- | :--- |
| **Docusaurus 3** | Framework principal de documentación y enrutado estático. |
| **React 19** | Biblioteca para la interfaz interactiva y reactividad en simulaciones. |
| **Math.js** | Motor matemático para evaluar de manera segura expresiones algebraicas escritas por el usuario. |
| **KaTeX** | Renderizado de ecuaciones matemáticas ($LaTeX$) de alta fidelidad. |
| **TypeScript** | Desarrollo robusto de algoritmos numéricos con tipado estático estricto. |
| **Vanilla CSS** | Sistema de diseño modular premium en `src/css/custom.css` y módulos locales de CSS. |

---

## 📂 Estructura de Directorios

El código está estructurado bajo principios de modularidad y limpieza:

```text
numerical-methods-documentation/
├── docs/                      # Contenido de la documentación teórica (Markdown/MDX)
│   ├── parte-1-introduccion/  # Introducción, tipos de errores y Serie de Taylor
│   ├── parte-2-raices/        # Búsqueda de raíces (Métodos Cerrados y Abiertos)
│   ├── parte-3-lineales/      # Álgebra lineal numérica (Gauss, LU, Jacobi, Gauss-Seidel)
│   ├── parte-5-ajuste-curvas/ # Regresión e Interpolación
│   ├── parte-6-integracion/   # Integración y diferenciación numérica
│   └── intro.md               # Página de inicio del curso
├── src/
│   ├── components/            # Componentes React de la interfaz de usuario
│   │   ├── HomepageFeatures/  # Características de la página de inicio
│   │   └── simulations/       # Componentes de visualización y control de simuladores
│   │       ├── BisectionSim.tsx      # Simulador de Bisección
│   │       ├── FalsePositionSim.tsx  # Simulador de Falsa Posición
│   │       ├── FixedPointSim.tsx     # Simulador de Punto Fijo
│   │       ├── NewtonRaphsonSim.tsx  # Simulador de Newton-Raphson
│   │       ├── SecantSim.tsx         # Simulador de la Secante
│   │       ├── IntegrationSim.tsx    # Simulador de Integración Numérica
│   │       ├── InterpolationSim.tsx  # Simulador de Interpolación y Splines
│   │       ├── SimulationCanvas.tsx  # Lienzo gráfico animado para el renderizado
│   │       └── ...                   # Tablas, controles e interfaces comunes
│   ├── data/                  # Datos estáticos del sitio (capítulos, configuraciones)
│   ├── hooks/                 # Custom hooks (ej. useAnimationPlayer para las animaciones paso a paso)
│   ├── pages/                 # Páginas de Docusaurus (ej. página de inicio con la consola global)
│   ├── services/              # 🧠 Motores matemáticos puros (libres de dependencias visuales de React)
│   │   ├── closedMethods.ts   # Algoritmos de Bisección y Falsa Posición
│   │   ├── openMethods.ts     # Algoritmos de Newton-Raphson, Secante y Punto Fijo
│   │   ├── interpolation.ts   # Algoritmos de Lagrange, Newton y Splines Cúbicos
│   │   ├── integration.ts     # Algoritmos de Trapecio y Simpson (1/3 y 3/8)
│   │   └── mathUtils.ts       # Utilidades para el parseo de funciones matemáticas
│   └── css/
│       └── custom.css         # Tokens de diseño globales, fuentes y paletas de colores
├── docusaurus.config.ts       # Configuración global del sitio (Plugins, Navbar, KaTeX)
├── sidebars.ts                # Configuración de los menús laterales de documentación
└── package.json               # Dependencias del proyecto y scripts npm
```

---

## 🎮 Simuladores Disponibles

El proyecto cuenta con cuatro suites interactivas principales de simulación:

1.  **Métodos Cerrados**:
    *   **Bisección**: División binaria sistemática del intervalo bajo el teorema de Bolzano.
    *   **Falsa Posición (Regula Falsi)**: Interpolación lineal entre extremos para acelerar la convergencia.
2.  **Métodos Abiertos**:
    *   **Punto Fijo**: Iteración funcional $x_{i+1} = g(x_i)$.
    *   **Newton-Raphson**: Uso de la derivada local para proyectar tangentes hacia el eje $x$.
    *   **Secante**: Aproximación de la derivada mediante diferencias finitas a partir de dos puntos.
3.  **Ajuste de Curvas e Interpolación**:
    *   **Interpolación de Newton**: Construcción del polinomio mediante diferencias divididas.
    *   **Interpolación de Lagrange**: Combinaciones lineales de polinomios base.
    *   **Splines**: Interpolación polinomial a trozos (Lineal, Cuadrática y Cúbica) asegurando suavidad en los nodos.
4.  **Integración Numérica**:
    *   **Regla del Trapecio**: Aproximación del área bajo la curva mediante trapecios simples o múltiples.
    *   **Regla de Simpson 1/3**: Ajuste parabólico para aproximar áreas de segmentos.
    *   **Regla de Simpson 3/8**: Ajuste cúbico para una mayor precisión.

---

## 🎨 Filosofía de Diseño y UX Premium

1.  **Visualización Activa**: En lugar de solo arrojar resultados numéricos, el simulador dibuja el proceso geométrico iteración por iteración. Esto ayuda a comprender por qué un método converge o diverge.
2.  **Rendimiento Óptimo**: Los cálculos se realizan de forma síncrona en el cliente mediante motores nativos en TypeScript, garantizando una respuesta instantánea al modificar cualquier parámetro o función.
3.  **Estilo UI Armónico**: Uso de colores suaves, gradientes sutiles y tarjetas adaptativas con soporte completo para modo oscuro y claro de Docusaurus.
