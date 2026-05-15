---
id: introduccion
title: Matrices Especiales y Gauss-Seidel
sidebar_label: Introducción
sidebar_position: 1
---

# Capítulo 11: Matrices Especiales y Gauss-Seidel

## Matrices especiales

### Matriz diagonal

$$
A = \text{diag}(d_1, d_2, \ldots, d_n) \implies x_i = \frac{b_i}{d_i}
$$

Solución trivial en $O(n)$.

### Matriz tridiagonal

Solo la diagonal principal y las dos adyacentes son no cero:

$$
A = \begin{pmatrix} b_1 & c_1 & & \\ a_2 & b_2 & c_2 & \\ & \ddots & \ddots & \ddots \\ & & a_n & b_n \end{pmatrix}
$$

Resoluble con el **algoritmo de Thomas** en $O(n)$.

### Matriz de banda

No ceros solo dentro de un ancho de banda $p$. Se almacena de forma compacta.

### Matriz dispersa (sparse)

La mayoría de elementos son cero (ej: mallados en elementos finitos). Se usan almacenamientos CSR/CSC y métodos iterativos.

---

## Métodos iterativos: Jacobi y Gauss-Seidel

Para sistemas grandes donde los métodos directos (Gauss, LU) son muy costosos.

### Método de Jacobi

Descomponer $A = D + L + U$ (diagonal, triangular inferior, superior) e iterar:

$$
\mathbf{x}^{(k+1)} = D^{-1}\left(\mathbf{b} - (L+U)\mathbf{x}^{(k)}\right)
$$

Componente a componente:

$$
x_i^{(k+1)} = \frac{1}{a_{ii}}\left(b_i - \sum_{j \neq i} a_{ij} x_j^{(k)}\right)
$$

Usa **solo** los valores de la iteración anterior.

### Método de Gauss-Seidel

Usa los valores **más recientes** tan pronto como están disponibles:

$$
x_i^{(k+1)} = \frac{1}{a_{ii}}\left(b_i - \sum_{j=1}^{i-1} a_{ij} x_j^{(k+1)} - \sum_{j=i+1}^{n} a_{ij} x_j^{(k)}\right)
$$

Gauss-Seidel converge **el doble de rápido** que Jacobi en la mayoría de casos.

---

## Criterio de convergencia: diagonal dominante

Los métodos iterativos **garantizan convergencia** si la matriz es **estrictamente diagonal dominante**:

$$
|a_{ii}| > \sum_{j \neq i} |a_{ij}|, \quad \forall\, i
$$

Si no se cumple, puede ser necesario **reordenar las ecuaciones** para lograrlo.

---

## Ejemplo de Gauss-Seidel

Sistema:

$$
\begin{cases}
4x_1 + 3x_2 - x_3 = 11 \\
-2x_1 + 5x_2 + 3x_3 = 7 \\
x_1 - 2x_2 + 4x_3 = 5
\end{cases}
$$

Verificar diagonal dominante: $|4| > |3|+|-1|$, $|5| > |-2|+|3|$, $|4| > |1|+|-2|$ ✓

Partiendo de $\mathbf{x}^{(0)} = (0, 0, 0)^T$:

| Iter | $x_1$ | $x_2$ | $x_3$ | $\varepsilon_a$ (%) |
|:---:|:---:|:---:|:---:|:---:|
| 1 | 2.750 | 2.500 | 2.313 | — |
| 2 | 2.972 | 2.994 | 2.995 | 14.3 |
| 3 | 2.999 | 3.000 | 3.000 | 0.9 |
| 4 | 3.000 | 3.000 | 3.000 | 0.03 |

Solución exacta: $(3, 3, 3)^T$ ✓

---

## Sobre-relajación sucesiva (SOR)

Acelera la convergencia de Gauss-Seidel introduciendo un parámetro $\omega$:

$$
x_i^{(k+1)} = \omega\, x_i^{GS} + (1-\omega)\, x_i^{(k)}
$$

- $\omega = 1$: Gauss-Seidel estándar
- $1 < \omega < 2$: **sobre-relajación** (más rápido si $\omega$ es óptimo)
- $0 < \omega < 1$: sub-relajación (puede estabilizar sistemas difíciles)

El $\omega$ óptimo para matrices tridiagonales es:

$$
\omega_{opt} = \frac{2}{1 + \sqrt{1 - \rho(B_J)^2}}
$$

donde $\rho(B_J)$ es el radio espectral de la matriz de iteración de Jacobi.
