---
id: introduccion
title: Optimización Unidimensional No Restringida
sidebar_label: Introducción
sidebar_position: 1
---

# Capítulo 13: Optimización Unidimensional No Restringida

## Conceptos fundamentales

**Optimizar** significa encontrar el valor de $x$ que maximiza o minimiza una función $f(x)$.

$$
x^* = \arg\min_{x} f(x)
$$

Una función es **unimodal** en $[a,b]$ si tiene exactamente un mínimo (o máximo) en ese intervalo.

**Condición necesaria** de mínimo local: $f'(x^*) = 0$

**Condición suficiente**: $f'(x^*) = 0$ y $f''(x^*) > 0$

---

## Método de Búsqueda Dorada (Golden Section Search)

Análogo a la bisección pero para optimización. Reduce el intervalo en un factor de la **razón áurea** $\phi = (\sqrt{5}-1)/2 \approx 0.618$ en cada iteración.

### Razón áurea

$$
\phi = \frac{\sqrt{5}-1}{2} \approx 0.6180
$$

### Algoritmo

Dado intervalo $[x_l, x_u]$ con un mínimo en su interior:

$$
d = \phi(x_u - x_l)
$$

$$
x_1 = x_l + d, \quad x_2 = x_u - d
$$

**Si $f(x_1) < f(x_2)$:** el mínimo está en $[x_2, x_u]$, actualizar $x_l \leftarrow x_2$

**Si $f(x_1) > f(x_2)$:** el mínimo está en $[x_l, x_1]$, actualizar $x_u \leftarrow x_1$

Repetir hasta $|x_u - x_l| < \varepsilon$.

### Tasa de reducción

Cada iteración reduce el intervalo por un factor de $\phi \approx 0.618$:

$$
|I_n| = \phi^{n-1} |I_1|
$$

### Número de iteraciones para tolerancia $\varepsilon$

$$
n \geq 1 + \frac{\ln(\varepsilon / |b-a|)}{\ln \phi}
$$

---

## Método de Interpolación Parabólica

Ajusta una **parábola** a tres puntos $x_1 < x_2 < x_3$ con $f(x_2) < f(x_1)$ y $f(x_2) < f(x_3)$, y usa su vértice como estimación del mínimo:

$$
x^* \approx x_2 - \frac{1}{2}\frac{(x_2-x_1)^2[f(x_2)-f(x_3)] - (x_2-x_3)^2[f(x_2)-f(x_1)]}{(x_2-x_1)[f(x_2)-f(x_3)] - (x_2-x_3)[f(x_2)-f(x_1)]}
$$

**Convergencia superlineal** para funciones suaves (orden $\approx 1.324$).

---

## Método de Brent

Combina la seguridad de Golden Section con la velocidad de la interpolación parabólica:
- Usa interpolación parabólica cuando converge bien.
- Vuelve a Golden Section cuando la parabólica falla.

Es el **método estándar** de optimización 1D en bibliotecas numéricas.

---

## Ejemplo resuelto

**Minimizar $f(x) = (x-2)^2 + \ln(x^2+1)$ en $[0, 5]$.**

La derivada $f'(x) = 2(x-2) + \frac{2x}{x^2+1}$ no tiene solución analítica simple.

Con Golden Section ($\varepsilon_s = 0.01$):

| Iter | $x_l$ | $x_u$ | $x_1$ | $x_2$ | $\varepsilon_a$ |
|:---:|:---:|:---:|:---:|:---:|:---:|
| 1 | 0.000 | 5.000 | 1.910 | 3.090 | — |
| 2 | 0.000 | 3.090 | 1.180 | 1.910 | 61.8% |
| 3 | 1.180 | 3.090 | 2.361 | 1.910 | 23.6% |
| ... | ... | ... | ... | ... | ... |
| 12 | 1.762 | 1.812 | 1.793 | 1.781 | 0.63% |
| 13 | 1.781 | 1.812 | 1.800 | 1.793 | **0.39%** ✓ |

Mínimo: $x^* \approx 1.793$

:::tip
El Golden Section busca mínimos. Para maximizar $f(x)$, minimizar $-f(x)$.
:::
