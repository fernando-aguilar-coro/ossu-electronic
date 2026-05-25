# Simulador de Métodos Numéricos 🚀

Una plataforma de documentación interactiva y educativa de alto rendimiento diseñada para visualizar, estudiar y resolver algoritmos de métodos numéricos con una experiencia de usuario premium. El proyecto combina la teoría rigurosa de los métodos numéricos con la interactividad de simuladores gráficos en tiempo real.

---

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

## 🛠️ Guía de Desarrollo y Ejecución

### 1. Requisitos Previos
*   **Node.js**: Versión `20.0` o superior.
*   **npm**: Gestor de paquetes incluido con Node.js.

### 2. Instalación y Ejecución en Local

Clona el repositorio e instala las dependencias necesarias:

```bash
# Instalar las dependencias del proyecto
npm install

# Iniciar el servidor local de desarrollo
npm run start
```

El simulador interactivo se abrirá automáticamente en tu navegador web predeterminado en `http://localhost:3000`.

### 3. Cómo Agregar Nuevos Capítulos a la Documentación
Toda la teoría se gestiona dentro de la carpeta `/docs`.
1.  **Ubicación**: Ve a la subcarpeta correspondiente (ej. `/docs/parte-2-raices-ecuaciones`).
2.  **Archivos**: Modifica o crea un archivo `.md` (Markdown estándar) o `.mdx` (si deseas usar elementos de React interactivos).
3.  **Configuración**: Utiliza el bloque inicial (frontmatter) para definir la identidad del documento:
    ```markdown
    ---
    id: mi-metodo
    title: Método de Newton
    sidebar_label: Newton
    sidebar_position: 2
    ---
    ```

### 4. Cómo Integrar Simuladores en un Archivo MDX
Puedes embeber un simulador directamente en cualquier página teórica importando el componente correspondiente de React:

```mdx
import ClosedMethodsSim from '@site/src/components/simulations/ClosedMethodsSim';

# Análisis de Bisección

Teoría detallada del método aquí...

## Simulador

<ClosedMethodsSim defaultMethod="biseccion" defaultExpr="x^2 - 3" />
```

---

## 🎨 Filosofía de Diseño y UX Premium

1.  **Visualización Activa**: En lugar de solo arrojar resultados numéricos, el simulador dibuja el proceso geométrico iteración por iteración. Esto ayuda a comprender por qué un método converge o diverge.
2.  **Rendimiento Óptimo**: Los cálculos se realizan de forma síncrona en el cliente mediante motores nativos en TypeScript, garantizando una respuesta instantánea al modificar cualquier parámetro o función.
3.  **Estilo UI Armónico**: Uso de colores suaves, gradientes sutiles y tarjetas adaptativas con soporte completo para modo oscuro y claro de Docusaurus.
