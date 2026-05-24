import type { ReactNode } from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from './index.module.css';
import chapters from '../data/chapters.json';

const features = [
  {
    icon: '📐',
    title: 'Análisis Teórico',
    desc: 'Derivaciones matemáticas claras, criterios de convergencia y análisis formal del error de truncamiento y redondeo.',
  },
  {
    icon: '💻',
    title: 'Simulación Interactiva',
    desc: 'Visualizaciones interactivas y ejecución paso a paso de los algoritmos para observar la convergencia en tiempo real.',
  },
  {
    icon: '📊',
    title: 'Casos de Estudio',
    desc: 'Problemas reales de ingeniería física y computacional resueltos mediante la aplicación práctica de cada método.',
  },
];

// ── Components ─────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroGlow} />
      <div className={styles.heroContent}>
        <div className={styles.heroBadge}>Proyecto de Métodos Numéricos</div>
        <h1 className={styles.heroTitle}>
          Simulador de <span className={styles.heroGradient}>Métodos Numéricos</span>
        </h1>
        <p className={styles.heroSubtitle}>
          Visualización, análisis y resolución paso a paso de algoritmos numéricos.
          Una herramienta interactiva para comprender el comportamiento de los métodos cerrados, abiertos, sistemas lineales y más.
        </p>
        <div className={styles.heroCtas}>
          <Link className={styles.ctaPrimary} to="/intro">
            Explorar Capítulos
          </Link>
          <Link className={styles.ctaSecondary} to="/cap5">
            Métodos Cerrados (Cap. 5)
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
      {ready && <span className={styles.cardArrow}>Ver mas →</span>}
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
          <Link className={styles.ctaPrimary} to="/cap5">
            Ir al Capítulo 5 →
          </Link>
        </section>
      </main>
    </Layout>
  );
}
