import type { ReactNode } from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from './index.module.css';

// ── Chapters data ──────────────────────────────────────────────────────────────
const chapters = [
  {
    num: '01', title: 'Modelos Matemáticos',
    desc: 'Modelado matemático de problemas de ingeniería y ciclo de solución numérica.',
    link: '/cap1-modelos-matematicos/introduccion', icon: '⚙️', ready: true,
  },
  {
    num: '02', title: 'Programación y Software',
    desc: 'Herramientas computacionales, entornos de trabajo y estructura de programas numéricos.',
    link: '/cap2-programacion/introduccion', icon: '💾', ready: true,
  },
  {
    num: '03', title: 'Aproximaciones y Errores',
    desc: 'Errores de redondeo, truncamiento, precisión significativa y aritmética de punto flotante.',
    link: '/cap3-errores/introduccion', icon: '±', ready: true,
  },
  {
    num: '04', title: 'Serie de Taylor',
    desc: 'Expansión en serie de Taylor y análisis del error de truncamiento.',
    link: '/cap4-taylor/introduccion', icon: '∑', ready: true,
  },
  {
    num: '05', title: 'Métodos Cerrados',
    desc: 'Bisección y Falsa Posición. Garantía de convergencia mediante el Teorema de Bolzano.',
    link: '/cap5-metodos-cerrados/introduccion', icon: '⟨⟩', ready: true,
  },
  {
    num: '06', title: 'Métodos Abiertos',
    desc: 'Newton-Raphson, Secante y Punto Fijo. Convergencia cuadrática sin intervalo inicial.',
    link: '/cap6-metodos-abiertos/introduccion', icon: '∞', ready: true,
  },
  {
    num: '07', title: 'Raíces de Polinomios',
    desc: 'Métodos de Müller, Bairstow y deflación para encontrar raíces de polinomios.',
    link: '/cap7-raices-polinomios/introduccion', icon: 'ƒ', ready: true,
  },
  {
    num: '08', title: 'Casos: Raíces',
    desc: 'Estudio de casos de ingeniería resueltos con métodos de búsqueda de raíces.',
    link: '/cap8-casos-raices/introduccion', icon: '📋', ready: true,
  },
  {
    num: '09', title: 'Eliminación de Gauss',
    desc: 'Solución de sistemas lineales mediante eliminación hacia adelante y sustitución regresiva.',
    link: '/cap9-gauss/introduccion', icon: '⊞', ready: true,
  },
  {
    num: '10', title: 'Descomposición LU',
    desc: 'Factorización LU e inversión de matrices. Aplicaciones en sistemas múltiples.',
    link: '/cap10-lu/introduccion', icon: '▦', ready: true,
  },
  {
    num: '11', title: 'Matrices Especiales',
    desc: 'Matrices especiales, iteración de Gauss-Seidel y criterio de convergencia.',
    link: '/cap11-gauss-seidel/introduccion', icon: '🔄', ready: true,
  },
  {
    num: '12', title: 'Casos: Álgebra Lineal',
    desc: 'Estudio de casos de ingeniería resueltos con sistemas de ecuaciones lineales.',
    link: '/cap12-casos-lineales/introduccion', icon: '📐', ready: true,
  },
  {
    num: '13', title: 'Optimización 1D',
    desc: 'Búsqueda de oro (Golden Section) y método parabólico para optimización unimodal.',
    link: '/cap13-optimizacion-1d/introduccion', icon: '⌃', ready: true,
  },
  {
    num: '15', title: 'Programación Lineal',
    desc: 'Optimización restringida. Método simplex y problemas de programación lineal.',
    link: '/cap15-prog-lineal/introduccion', icon: '◇', ready: true,
  },
  {
    num: '17', title: 'Regresión por Mínimos Cuadrados',
    desc: 'Ajuste lineal, polinomial y múltiple. Coeficiente de determinación $r^2$.',
    link: '/cap17-regresion/introduccion', icon: '∿', ready: true,
  },
  {
    num: '18', title: 'Interpolación',
    desc: 'Polinomios de Newton y Lagrange. Interpolación de Spline cúbica.',
    link: '/cap18-interpolacion/introduccion', icon: '⋯', ready: true,
  },
  {
    num: '19', title: 'Aproximación de Fourier',
    desc: 'Series de Fourier y Transformada Rápida de Fourier (FFT) para análisis de señales.',
    link: '/cap19-fourier/introduccion', icon: '〜', ready: true,
  },
  {
    num: '21', title: 'Integración Newton-Cotes',
    desc: 'Reglas del trapecio, Simpson 1/3 y 3/8, con análisis de error.',
    link: '/cap21-newton-cotes/introduccion', icon: '∫', ready: true,
  },
  {
    num: '22', title: 'Gauss y Romberg',
    desc: 'Cuadratura gaussiana y extrapolación de Romberg para mayor precisión.',
    link: '/cap22-gauss-romberg/introduccion', icon: '∬', ready: true,
  },
  {
    num: '23', title: 'Diferenciación Numérica',
    desc: 'Fórmulas de diferencias finitas hacia adelante, atrás y centradas.',
    link: '/cap23-diferenciacion/introduccion', icon: "∂", ready: true,
  },
  {
    num: '25', title: 'Runge-Kutta',
    desc: 'Métodos de Euler, Heun y Runge-Kutta de orden 4 para EDOs.',
    link: '/cap25-runge-kutta/introduccion', icon: '→', ready: true,
  },
  {
    num: '27', title: 'Valores en la Frontera',
    desc: 'Problemas de valores en la frontera y valores propios. Método de disparo.',
    link: '/cap27-bvp/introduccion', icon: '⊣⊢', ready: true,
  },
  {
    num: '30', title: 'Diferencias Finitas: EDP',
    desc: 'Ecuaciones parabólicas y método de Crank-Nicholson para difusión.',
    link: '/cap30-edp-parabolicas/introduccion', icon: '∇', ready: true,
  },
  {
    num: '31', title: 'Elementos Finitos',
    desc: 'Método del elemento finito para problemas de valor en la frontera en 1D y 2D.',
    link: '#', icon: '⬡', ready: false,
  },
];

const features = [
  {
    icon: '📐',
    title: 'Fundamentos matemáticos',
    desc: 'Cada método presentado con su derivación completa, análisis de error y cota de convergencia.',
  },
  {
    icon: '💻',
    title: 'Implementación Práctica',
    desc: 'Algoritmos listos para usar con ejemplos ejecutables y salida paso a paso.',
  },
  {
    icon: '📊',
    title: 'Ejemplos resueltos',
    desc: 'Tablas de iteraciones, gráficas conceptuales y comparativas entre métodos.',
  },
];

// ── Components ─────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroGlow} />
      <div className={styles.heroContent}>
        <div className={styles.heroBadge}>Documentación de Métodos Numéricos</div>
        <h1 className={styles.heroTitle}>
          Dominando la <span className={styles.heroGradient}>precisión numérica</span>
        </h1>
        <p className={styles.heroSubtitle}>
          Guía interactiva de métodos numéricos para ingeniería.
          Desde raíces de ecuaciones hasta EDOs, con fundamentos matemáticos
          y ejemplos prácticos detallados.
        </p>
        <div className={styles.heroCtas}>
          <Link className={styles.ctaPrimary} to="/cap5-metodos-cerrados/introduccion">
            Comenzar con Cap. 5 →
          </Link>
          <Link className={styles.ctaSecondary} to="/intro">
            Ver contenido completo
          </Link>
        </div>
      </div>
      <div className={styles.heroFormula} aria-hidden="true">
        <span className={styles.formulaLine}>x<sub>r</sub> = (x<sub>l</sub> + x<sub>u</sub>) / 2</span>
        <span className={styles.formulaLine}>f(a) · f(b) &lt; 0</span>
        <span className={styles.formulaLine}>ε<sub>a</sub> &lt; ε<sub>s</sub></span>
      </div>
    </section>
  );
}

function ChapterCard({ num, title, desc, link, icon, ready }: typeof chapters[0]) {
  return (
    <Link
      to={link}
      className={`${styles.card} ${!ready ? styles.cardSoon : ''}`}
      aria-disabled={!ready}
    >
      <div className={styles.cardHeader}>
        <span className={styles.cardIcon}>{icon}</span>
        <span className={styles.cardNum}>Cap. {num}</span>
        {ready ? (
          <span className={styles.badgeReady}>Disponible</span>
        ) : (
          <span className={styles.badgeSoon}>Próximamente</span>
        )}
      </div>
      <h3 className={styles.cardTitle}>{title}</h3>
      <p className={styles.cardDesc}>{desc}</p>
      {ready && <span className={styles.cardArrow}>Leer documentación →</span>}
    </Link>
  );
}

function Features() {
  return (
    <section className={styles.features}>
      <h2 className={styles.sectionTitle}>¿Qué encontrarás aquí?</h2>
      <div className={styles.featuresGrid}>
        {features.map((f) => (
          <div key={f.title} className={styles.featureItem}>
            <span className={styles.featureIcon}>{f.icon}</span>
            <h3 className={styles.featureTitle}>{f.title}</h3>
            <p className={styles.featureDesc}>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title="Inicio"
      description="Documentación interactiva de métodos numéricos para ingeniería."
    >
      <main className={styles.main}>
        <Hero />

        <section className={styles.chapters}>
          <h2 className={styles.sectionTitle}>Capítulos</h2>
          <div className={styles.chaptersGrid}>
            {chapters.map((ch) => (
              <ChapterCard key={ch.num} {...ch} />
            ))}
          </div>
        </section>

        <Features />

        <section className={styles.cta}>
          <h2 className={styles.ctaTitle}>Empieza por el Capítulo 5</h2>
          <p className={styles.ctaText}>
            Los métodos cerrados son la base de la búsqueda de raíces.
            Aprende bisección y falsa posición con fundamentos matemáticos completos.
          </p>
          <Link className={styles.ctaPrimary} to="/cap5-metodos-cerrados/introduccion">
            Ir al Capítulo 5 →
          </Link>
        </section>
      </main>
    </Layout>
  );
}
