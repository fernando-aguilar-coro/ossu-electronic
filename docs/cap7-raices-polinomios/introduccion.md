---
id: introduccion
title: Raíces de Polinomios
sidebar_label: Introducción
sidebar_position: 1
---

# Capítulo 7: Raíces de Polinomios

## Propiedades de los polinomios

Un polinomio de grado $n$:

$$
P_n(x) = a_n x^n + a_{n-1}x^{n-1} + \cdots + a_1 x + a_0
$$

tiene exactamente $n$ raíces en $\mathbb{C}$ (Teorema Fundamental del Álgebra).

### Tipos de raíces

| Tipo | Descripción |
|---|---|
| **Real simple** | Cruza el eje $x$ una vez |
| **Real múltiple** | Toca el eje sin cruzar (raíz de multiplicidad $m$) |
| **Compleja conjugada** | $\alpha \pm \beta i$, aparecen en pares si $a_i \in \mathbb{R}$ |

---

## Deflación: extracción de raíces conocidas

Cuando se encuentra una raíz $r_k$, se puede reducir el grado del polinomio por **división sintética**:

$$
P_n(x) = (x - r_k) \cdot P_{n-1}(x)
$$

El cociente $P_{n-1}(x)$ se obtiene por el algoritmo de **división sintética** (Horner):

```
# División sintética de P(x) ÷ (x - r)
b[n] ← a[n]
para i desde n-1 hasta 0:
    b[i] ← a[i] + r × b[i+1]
# b[0..n-1] son los coeficientes del cociente
# b[0] es el residuo (= P(r))
```

:::warning Error acumulado
Al deflacionar, los errores de redondeo se acumulan. Las raíces obtenidas de polinomios de grado reducido pueden ser menos precisas. Siempre **refinar** cada raíz usando el polinomio original.
:::

---

## Método de Müller

Generalización de la Secante que usa **tres puntos** y ajusta una **parábola**:

$$
x_{i+1} = x_i - \frac{2f(x_i)}{w \pm \sqrt{w^2 - 4f(x_i)\delta}}
$$

donde $w$, $\delta$ se calculan de los tres puntos. Las **raíces complejas** se obtienen directamente cuando el discriminante es negativo.

**Orden de convergencia**: $\approx 1.839$

---

## Método de Bairstow

Extrae **factores cuadráticos** $x^2 - rx - s$ del polinomio, obteniendo directamente **pares de raíces complejas conjugadas** sin aritmética compleja explícita.

El método resuelve iterativamente el sistema:

$$
\begin{pmatrix} \partial b_{n-1}/\partial r & \partial b_{n-1}/\partial s \\ \partial b_{n-2}/\partial r & \partial b_{n-2}/\partial s \end{pmatrix} \begin{pmatrix} \Delta r \\ \Delta s \end{pmatrix} = -\begin{pmatrix} b_{n-1} \\ b_{n-2} \end{pmatrix}
$$

**Ventaja**: trabaja con aritmética real para encontrar raíces complejas.

---

## Estrategia general para polinomios

```
1. Graficar P(x) para identificar raíces reales aproximadas
2. Aplicar Newton-Raphson (con deflación de Horner) para raíces reales
3. Para raíces complejas, usar Müller o Bairstow
4. Refinar todas las raíces con el polinomio original
5. Verificar: P(raíz) ≈ 0 y que el producto de todas las raíces = a0/an
```

---

## Ejemplo: $P(x) = x^4 - 2x^3 - 11x^2 + 12x + 36$

Las raíces son: $x = -2,\; x = 3$ (doble),\; x = -2$ (doble).

Verificación: $(-2)^2 \cdot 3^2 = 36 = a_0/a_4$ ✓

| Raíz | Multiplicidad | Tipo |
|---|:---:|---|
| $-2$ | 2 | Real múltiple |
| $3$ | 2 | Real múltiple |

---

## Localización de raíces: límites de Cauchy

Para $P_n(x) = a_n x^n + \cdots + a_0$, todas las raíces complejas satisfacen:

$$
|x| \leq 1 + \frac{\max(|a_0|, |a_1|, \ldots, |a_{n-1}|)}{|a_n|}
$$

Esto da un **círculo de búsqueda** en el plano complejo.
