---
title: Regresión por Mínimos Cuadrados
sidebar_label: "Cap. 17: Regresión"
sidebar_position: 1
---

# Capítulo 17: Regresión por Mínimos Cuadrados

## Objetivo

Dado un conjunto de $n$ pares de datos $(x_i, y_i)$, encontrar la curva $\hat{y}(x)$ que **mejor los represente** minimizando la suma de cuadrados de los residuos:

$$
S_r = \sum_{i=1}^n [y_i - \hat{y}(x_i)]^2 = \min
$$

---

## 1. Regresión lineal simple

Modelo: $\hat{y} = a_0 + a_1 x$

Minimizando $S_r$ respecto a $a_0$ y $a_1$:

$$
a_1 = \frac{n\sum x_i y_i - \sum x_i \sum y_i}{n\sum x_i^2 - \left(\sum x_i\right)^2}
$$

$$
a_0 = \bar{y} - a_1 \bar{x}
$$

donde $\bar{x} = \frac{1}{n}\sum x_i$ y $\bar{y} = \frac{1}{n}\sum y_i$.

### Calidad del ajuste: Coeficiente de determinación $r^2$

$$
r^2 = 1 - \frac{S_r}{S_t}, \quad S_t = \sum_{i=1}^n (y_i - \bar{y})^2
$$

- $r^2 = 1$: ajuste perfecto
- $r^2 = 0$: el modelo no explica la variabilidad
- $0 < r^2 < 1$: ajuste parcial

---

## 2. Regresión linealizable (modelos no lineales)

Algunos modelos no lineales pueden transformarse en lineales:

| Modelo | Transformación | Forma lineal |
|---|---|---|
| $y = ae^{bx}$ | $\ln y = \ln a + bx$ | $Y = A + bx$ |
| $y = ax^b$ | $\ln y = \ln a + b\ln x$ | $Y = A + bX$ |
| $y = \frac{a}{1+bx}$ | $1/y = 1/a + (b/a)x$ | $Y = A + Bx$ |

:::warning
Las transformaciones mínimo-cuadradas minimizan $\sum(\ln y_i - \ln\hat{y}_i)^2$, **no** $\sum(y_i - \hat{y}_i)^2$. Para minimizar en la escala original, usar regresión no lineal directa.
:::

---

## 3. Regresión polinomial

Modelo: $\hat{y} = a_0 + a_1 x + a_2 x^2 + \cdots + a_m x^m$

Condición: $\partial S_r / \partial a_k = 0$ para $k = 0, 1, \ldots, m$

Genera el sistema de **ecuaciones normales**:

$$
\begin{pmatrix} n & \sum x_i & \cdots & \sum x_i^m \\ \sum x_i & \sum x_i^2 & \cdots & \sum x_i^{m+1} \\ \vdots & & \ddots & \vdots \\ \sum x_i^m & \cdots & & \sum x_i^{2m} \end{pmatrix} \begin{pmatrix} a_0 \\ a_1 \\ \vdots \\ a_m \end{pmatrix} = \begin{pmatrix} \sum y_i \\ \sum x_i y_i \\ \vdots \\ \sum x_i^m y_i \end{pmatrix}
$$

:::warning Sobreajuste
Un polinomio de grado $n-1$ pasa exactamente por $n$ puntos pero puede oscilar salvajemente entre ellos. Preferir grados bajos y validar con datos no usados en el ajuste.
:::

---

## 4. Regresión lineal múltiple

Modelo: $\hat{y} = a_0 + a_1 x_1 + a_2 x_2 + \cdots + a_k x_k$

En forma matricial: $\hat{\mathbf{y}} = X\mathbf{a}$, con $X$ la **matriz de diseño**.

La solución mínimo-cuadrados es:

$$
\mathbf{a} = (X^T X)^{-1} X^T \mathbf{y}
$$

La matriz $X^TX$ puede estar mal condicionada si las variables explicativas están correlacionadas (**multicolinealidad**).

---

## Ejemplo resuelto

Datos: tensión vs deformación de un material.

| $x_i$ (deformación) | $y_i$ (tensión, MPa) |
|:---:|:---:|
| 0.0 | 0.0 |
| 0.5 | 1.2 |
| 1.0 | 2.4 |
| 1.5 | 3.5 |
| 2.0 | 5.1 |

Usando las fórmulas: $a_1 = 2.52$, $a_0 = -0.10$

$r^2 = 0.999$ → excelente ajuste lineal (ley de Hooke verificada).
