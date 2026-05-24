---
title: Cuadratura Gaussiana y Método de Romberg
sidebar_label: "Cap. 22: Gauss y Romberg"
sidebar_position: 1
---

# Capítulo 22: Cuadratura Gaussiana y Método de Romberg

## Extrapolación de Richardson

La **extrapolación de Richardson** combina dos estimaciones con pasos $h$ y $h/2$ para cancelar el término de error dominante:

$$
I \approx \frac{4I(h/2) - I(h)}{3} + O(h^4)
$$

Para el trapecio (error $O(h^2)$), esto produce una estimación de error $O(h^4)$, igual que Simpson.

---

## Método de Romberg

Aplica extrapolación de Richardson **repetidamente** para producir una tabla de estimaciones cada vez más precisas:

$$
R_{k,j} = \frac{4^{j-1} R_{k,j-1} - R_{k-1,j-1}}{4^{j-1} - 1}
$$

donde $R_{k,1}$ es la regla del trapecio con $2^{k-1}$ subintervalos.

### Tabla de Romberg para $\int_0^\pi \sin x\,dx = 2$

| $k$ | $R_{k,1}$ (Trapecio) | $R_{k,2}$ (Orden 4) | $R_{k,3}$ (Orden 6) | $R_{k,4}$ (Orden 8) |
|:---:|:---:|:---:|:---:|:---:|
| 1 | 0.0000 | | | |
| 2 | 1.5708 | 2.0944 | | |
| 3 | 1.8961 | 2.0046 | 1.9986 | |
| 4 | 1.9742 | 2.0003 | 2.0000 | 2.0000 |

Romberg converge muy rápido sin necesidad de calcular derivadas.

---

## Cuadratura Gaussiana

En lugar de usar puntos igualmente espaciados, la cuadratura gaussiana **optimiza** la posición de los puntos de evaluación para maximizar el orden de exactitud.

Con $n$ puntos, la cuadratura gaussiana es **exacta para polinomios de grado hasta $2n-1$**.

### Cuadratura de Gauss-Legendre en $[-1, 1]$

$$
\int_{-1}^1 f(t)\,dt \approx \sum_{i=1}^n w_i f(t_i)
$$

| $n$ | Puntos $t_i$ | Pesos $w_i$ |
|:---:|---|---|
| 2 | $\pm 0.57735$ | $1.00000$ |
| 3 | $0$; $\pm 0.77460$ | $0.88889$; $0.55556$ |
| 4 | $\pm 0.33998$; $\pm 0.86114$ | $0.65215$; $0.34785$ |

### Cambio de variable para $[a, b]$

$$
x = \frac{(b-a)t + (b+a)}{2}, \quad dx = \frac{b-a}{2}\,dt
$$

$$
\int_a^b f(x)\,dx = \frac{b-a}{2}\int_{-1}^1 f\!\left(\frac{(b-a)t+(b+a)}{2}\right)dt
$$

### Ejemplo

$$
\int_0^1 e^{-x^2}\,dx \approx \frac{1}{2}\sum_{i=1}^n w_i f\!\left(\frac{t_i + 1}{2}\right)
$$

Con $n=3$: resultado $\approx 0.746824$ (exacto: $0.746824...$) ✓ con solo **3 evaluaciones**.

---

## Cuadratura de Gauss-Laguerre (semi-infinito)

Para integrales de la forma $\int_0^\infty e^{-x}f(x)\,dx$:

$$
\int_0^\infty e^{-x}f(x)\,dx \approx \sum_{i=1}^n w_i f(x_i)
$$

Los puntos y pesos son raíces y valores derivados de los **polinomios de Laguerre**.

---

## ¿Cuándo usar cada método?

| Situación | Método recomendado |
|---|---|
| Función suave, muchos puntos ya calculados | Romberg |
| Pocos puntos de evaluación permitidos | Gauss-Legendre |
| Intervalo semi-infinito con $e^{-x}$ | Gauss-Laguerre |
| Intervalo $(-\infty, \infty)$ con $e^{-x^2}$ | Gauss-Hermite |
| Función con singularidades | Gauss-Chebyshev |
