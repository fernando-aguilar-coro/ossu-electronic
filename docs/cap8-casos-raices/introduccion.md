---
id: introduccion
title: Estudio de Casos — Raíces de Ecuaciones
sidebar_label: Introducción
sidebar_position: 1
---

# Capítulo 8: Estudio de Casos — Raíces de Ecuaciones

## Caso 1: Diseño de un bungee jump

**Problema**: Un bungee jumper de masa $m = 68.1\,\text{kg}$ cae. La velocidad en función del tiempo con arrastre cuadrático es:

$$
v(t) = \sqrt{\frac{gm}{c_d}}\,\tanh\!\left(\sqrt{\frac{g\,c_d}{m}}\,t\right)
$$

**Objetivo**: Encontrar el coeficiente de arrastre $c_d$ tal que $v(10) = 40\,\text{m/s}$.

Definir $f(c_d) = v(10, c_d) - 40 = 0$ y aplicar Newton-Raphson.

**Resultado**: $c_d \approx 14.75\,\text{kg/m}$

---

## Caso 2: Carga de un tanque esférico

**Problema**: Un tanque esférico de radio $R = 3\,\text{m}$ contiene un volumen $V = 30\,\text{m}^3$ de agua. Encontrar la profundidad $h$:

$$
f(h) = \pi h^2\!\left(R - \frac{h}{3}\right) - V = 0
$$

Se aplica bisección en $[0, 2R]$. La función es continua y monotónica en el dominio físico válido.

**Resultado**: $h \approx 2.0027\,\text{m}$

---

## Caso 3: Diseño de un cable de puente colgante

La forma de un cable colgante sigue una **catenaria**:

$$
y(x) = a\cosh\!\left(\frac{x}{a}\right) - a + y_0
$$

El parámetro $a$ se determina imponiendo que el cable pase por los puntos de anclaje. Esto genera una ecuación trascendente en $a$:

$$
f(a) = a\cosh\!\left(\frac{L}{2a}\right) - a - D = 0
$$

donde $L$ es la longitud horizontal y $D$ la flecha. Se resuelve con Newton-Raphson.

---

## Caso 4: Circuito eléctrico no lineal (diodo)

La corriente a través de un diodo ideal satisface:

$$
I = I_s\!\left(e^{V/(n V_T)} - 1\right)
$$

Aplicando la ley de Kirchhoff:

$$
f(V) = I_s\!\left(e^{V/(n V_T)} - 1\right) + \frac{V - V_{cc}}{R} = 0
$$

Se resuelve con el método de la Secante (sin necesidad de calcular la derivada analítica).

---

## Caso 5: Raíces de la ecuación característica de una viga

Para una viga biempotrada, las frecuencias naturales de vibración satisfacen:

$$
\cosh(\lambda L)\cos(\lambda L) = 1
$$

Las soluciones $\lambda_n$ dan las frecuencias naturales $\omega_n = \lambda_n^2\sqrt{EI/\rho A}$.

Se resuelve con bisección o Newton-Raphson, buscando raíces en cada período de la función.

---

## Lecciones generales

| Situación | Método recomendado |
|---|---|
| Función bien comportada, necesita seguridad | Bisección o Falsa posición |
| Función suave, derivada disponible | Newton-Raphson |
| Función costosa de derivar | Secante |
| Raíces complejas o múltiples | Müller o Bairstow |
| Sin idea de la ubicación | Búsqueda incremental + método cerrado |

### Flujo de trabajo estándar

```
1. Graficar f(x) en el dominio de interés físico
2. Identificar cambios de signo (raíces reales)
3. Elegir método según disponibilidad de derivadas
4. Aplicar con criterio de parada: ea < es
5. Verificar: f(raíz) ≈ 0 y sensatez física del resultado
```

:::tip Siempre verificar
Sustituir la raíz encontrada en la ecuación original es el paso de validación más importante. Un error en la programación puede dar un resultado "convergente" pero incorrecto.
:::
