---
id: introduccion
title: Descomposición LU e Inversión de Matrices
sidebar_label: Introducción
sidebar_position: 1
---

# Capítulo 10: Descomposición LU e Inversión de Matrices

## Motivación

Si se necesita resolver $A\mathbf{x} = \mathbf{b}$ para **múltiples vectores** $\mathbf{b}$, hacer eliminación de Gauss cada vez es ineficiente. La **factorización LU** permite separar la parte costosa (factorizar $A$) de la parte barata (resolver con $L$ y $U$).

---

## Factorización LU

Cualquier matriz $A$ (sin necesitar pivoteo) puede escribirse como:

$$
A = LU
$$

donde:
- $L$: matriz **triangular inferior** con unos en la diagonal
- $U$: matriz **triangular superior**

### Relación con la eliminación de Gauss

Los **factores de eliminación** $f_{ik}$ de Gauss forman la matriz $L$:

$$
L = \begin{pmatrix} 1 & 0 & \cdots & 0 \\ f_{21} & 1 & \cdots & 0 \\ \vdots & \ddots & \ddots & \vdots \\ f_{n1} & \cdots & f_{n,n-1} & 1 \end{pmatrix}
$$

y $U$ es la matriz triangular resultante de la eliminación.

---

## Solución con LU

Para resolver $A\mathbf{x} = \mathbf{b}$, se descompone en dos pasos:

**Paso 1:** Resolver $L\mathbf{d} = \mathbf{b}$ por **sustitución progresiva**:

$$
d_i = b_i - \sum_{j=1}^{i-1} l_{ij}\,d_j, \quad i = 1, \ldots, n
$$

**Paso 2:** Resolver $U\mathbf{x} = \mathbf{d}$ por **sustitución regresiva**.

**Ventaja**: Una vez calculada $LU$, resolver para cada nuevo $\mathbf{b}$ cuesta solo $O(n^2)$ (vs $O(n^3)$ de Gauss completo).

---

## Variante de Crout

En la variante de Crout, $U$ tiene unos en la diagonal y $L$ contiene los valores de la factorización:

$$
l_{ij} = a_{ij} - \sum_{k=1}^{j-1} l_{ik}\,u_{kj}, \quad u_{ij} = \frac{a_{ij} - \sum_{k=1}^{i-1} l_{ik}\,u_{kj}}{l_{ii}}
$$

---

## Inversión de matrices

La inversa $A^{-1}$ cumple $A A^{-1} = I$. Se puede calcular resolviendo $n$ sistemas:

$$
A\, \mathbf{x}_j = \mathbf{e}_j, \quad j = 1, \ldots, n
$$

donde $\mathbf{e}_j$ es el $j$-ésimo vector canónico. Con LU, esto cuesta solo $n \times O(n^2) = O(n^3)$.

:::warning ¿Cuándo invertir?
La inversión de matrices es costosa y numéricamente menos estable que la factorización LU directa. Solo invertir cuando se necesita $A^{-1}$ explícitamente (ej: análisis de sensibilidad). Para resolver $A\mathbf{x} = \mathbf{b}$, siempre usar LU o Gauss directamente.
:::

---

## Determinante via LU

$$
\det(A) = \det(L)\cdot\det(U) = \left(\prod_{i=1}^n l_{ii}\right)\left(\prod_{i=1}^n u_{ii}\right)
$$

Como $L$ tiene unos en la diagonal: $\det(L) = 1$, entonces:

$$
\det(A) = \prod_{i=1}^n u_{ii}
$$

---

## Ejemplo: sistema $3\times 3$

$$
A = \begin{pmatrix} 2 & 1 & -1 \\ -3 & -1 & 2 \\ -2 & 1 & 2 \end{pmatrix}, \quad \mathbf{b} = \begin{pmatrix} 8 \\ -11 \\ -3 \end{pmatrix}
$$

Factorización: $A = LU$ donde

$$
L = \begin{pmatrix} 1 & 0 & 0 \\ -3/2 & 1 & 0 \\ -1 & 4 & 1 \end{pmatrix}, \quad U = \begin{pmatrix} 2 & 1 & -1 \\ 0 & 1/2 & 1/2 \\ 0 & 0 & -2 \end{pmatrix}
$$

Solución: $\mathbf{x} = (2, 3, -1)^T$ ✓

---

## Descomposición de Cholesky

Para matrices **simétricas definidas positivas** ($A = A^T$, $\mathbf{x}^T A \mathbf{x} > 0$), existe la descomposición:

$$
A = LL^T
$$

donde $L$ es triangular inferior. Esta factorización:
- Es dos veces más eficiente que LU
- Siempre existe (sin pivoteo) para matrices s.d.p.
- Es la preferida en optimización y estadística
