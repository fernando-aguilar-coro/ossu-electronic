---
title: Eliminación de Gauss
sidebar_label: "Cap. 9: Eliminación de Gauss"
sidebar_position: 1
---

# Capítulo 9: Eliminación de Gauss

## Sistemas de ecuaciones lineales

Un sistema $n \times n$:

$$
A\mathbf{x} = \mathbf{b}
$$

$$
\begin{pmatrix} a_{11} & a_{12} & \cdots & a_{1n} \\ a_{21} & a_{22} & \cdots & a_{2n} \\ \vdots & & \ddots & \vdots \\ a_{n1} & a_{n2} & \cdots & a_{nn} \end{pmatrix} \begin{pmatrix} x_1 \\ x_2 \\ \vdots \\ x_n \end{pmatrix} = \begin{pmatrix} b_1 \\ b_2 \\ \vdots \\ b_n \end{pmatrix}
$$

---

## El método de Gauss

Transforma el sistema en **forma triangular superior** mediante operaciones elementales por filas, y luego resuelve por **sustitución regresiva**.

### Fase 1: Eliminación hacia adelante

Para cada columna pivote $k = 1, 2, \ldots, n-1$:

$$
\text{Factor: } f_{ik} = \frac{a_{ik}}{a_{kk}}
$$

$$
a_{ij}^{(nuevo)} = a_{ij} - f_{ik} \cdot a_{kj}, \quad b_i^{(nuevo)} = b_i - f_{ik} \cdot b_k
$$

para $i = k+1, \ldots, n$ y $j = k, \ldots, n$.

Resultado: sistema triangular superior $Ux = c$.

### Fase 2: Sustitución regresiva

$$
x_n = \frac{c_n}{u_{nn}}
$$

$$
x_i = \frac{c_i - \displaystyle\sum_{j=i+1}^{n} u_{ij}\,x_j}{u_{ii}}, \quad i = n-1, \ldots, 1
$$

---

## Ejemplo $3 \times 3$

Sistema original:

$$
\begin{cases}
2x_1 - x_2 + x_3 = 8 \\
-3x_1 + 3x_2 + 9x_3 = -9 \\
-x_1 + 2x_2 - 6x_3 = -6
\end{cases}
$$

**Matriz aumentada:**

$$
\left[\begin{array}{ccc|c} 2 & -1 & 1 & 8 \\ -3 & 3 & 9 & -9 \\ -1 & 2 & -6 & -6 \end{array}\right]
$$

Después de la eliminación → $\mathbf{x} = (2, 3, -1)^T$

---

## Pivoteo

### Problema: divisor cero o casi cero

Si el pivote $a_{kk} \approx 0$, la división genera errores masivos.

### Pivoteo parcial (por filas)

Antes de eliminar la columna $k$, intercambiar la fila $k$ con la fila $p$ que tiene el **mayor $|a_{pk}|$**:

$$
p = \arg\max_{i \geq k} |a_{ik}|
$$

Esto reduce el error de redondeo y evita la división por cero.

### Pivoteo completo (por filas y columnas)

Busca el mayor elemento en toda la submatriz restante. Es más seguro pero costoso. Se usa en problemas muy mal condicionados.

---

## Análisis de complejidad

| Fase | Operaciones |
|---|---|
| Eliminación | $\approx \dfrac{n^3}{3}$ multiplicaciones/divisiones |
| Sustitución regresiva | $\approx \dfrac{n^2}{2}$ operaciones |

Para $n = 1000$: $\approx 3.3 \times 10^8$ operaciones. La eliminación domina.

---

## Determinante y rango

El determinante puede calcularse como **producto de los pivotes** tras la eliminación:

$$
\det(A) = \prod_{i=1}^n u_{ii} \times (-1)^{\text{núm. intercambios}}
$$

Si algún $u_{ii} = 0$, el sistema es **singular** (no tiene solución única).

:::warning Sistemas mal condicionados
Un determinante pequeño **no indica** mal condicionamiento. El número de condición $\kappa(A) = \|A\|\|A^{-1}\|$ es el indicador correcto. Un sistema puede tener $\det(A) = 10^{-10}$ y estar bien condicionado si la escala es apropiada.
:::
