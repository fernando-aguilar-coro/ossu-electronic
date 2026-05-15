---
id: introduccion
title: Estudio de Casos — Ecuaciones Algebraicas Lineales
sidebar_label: Introducción
sidebar_position: 1
---

# Capítulo 12: Estudio de Casos — Ecuaciones Algebraicas Lineales

## Caso 1: Análisis de circuitos (Ley de Kirchhoff)

Aplicando KVL (Ley de Voltaje de Kirchhoff) a un circuito con $n$ mallas se obtiene un sistema $n \times n$:

$$
\begin{pmatrix} R_{11} & -R_{12} & 0 \\ -R_{21} & R_{22} & -R_{23} \\ 0 & -R_{32} & R_{33} \end{pmatrix} \begin{pmatrix} I_1 \\ I_2 \\ I_3 \end{pmatrix} = \begin{pmatrix} V_1 \\ 0 \\ -V_3 \end{pmatrix}
$$

La matriz de resistencias es **simétrica y diagonal dominante** → Cholesky o Gauss-Seidel convergen.

---

## Caso 2: Análisis de estructuras (Método de rigideces)

Para una armadura plana de $n$ barras, el equilibrio nodal da:

$$
[K]\{u\} = \{F\}
$$

donde $[K]$ es la **matriz de rigidez global** (simétrica, dispersa, semidefinida positiva), $\{u\}$ los desplazamientos y $\{F\}$ las fuerzas aplicadas.

Tras imponer condiciones de frontera → sistema simétrico definido positivo → Cholesky.

---

## Caso 3: Balance de masa en reactores en serie

$n$ reactores en serie con caudales $Q$ y concentraciones $c_i$:

$$
Q_0 c_0 - Q_1 c_1 + k_1 V_1 c_1 = 0
$$

Generalizando para $n$ reactores → sistema tridiagonal → **algoritmo de Thomas** ($O(n)$).

---

## Caso 4: Análisis de redes de tuberías

El flujo en una red de $m$ tuberías con $n$ nodos satisface:

$$
A^T Q = D \quad \text{(continuidad en nodos)}
$$

$$
A H = hf(Q) \quad \text{(pérdidas de carga)}
$$

El sistema resultante es **no lineal** → linearización iterativa (Newton-Raphson multivariable).

---

## Caso 5: Interpolación con splines (sistema tridiagonal)

Para calcular los coeficientes de un spline cúbico (Cap. 18), se resuelve:

$$
\begin{pmatrix} 2 & \mu_1 & & \\ \lambda_2 & 2 & \mu_2 & \\ & \ddots & \ddots & \mu_{n-2} \\ & & \lambda_{n-1} & 2 \end{pmatrix} M = d
$$

Sistema **tridiagonal** con $|2| > |\lambda| + |\mu|$ (diagonal dominante) → Thomas o Gauss-Seidel.

---

## Lecciones sobre selección de método

| Estructura de $A$ | Método recomendado | Complejidad |
|---|---|---|
| Densa, pequeña ($n < 500$) | Eliminación de Gauss con pivoteo | $O(n^3)$ |
| Densa, s.d.p. | Cholesky | $O(n^3/3)$ |
| Tridiagonal | Algoritmo de Thomas | $O(n)$ |
| Dispersa, grande | Gauss-Seidel / SOR / CG | $O(n\cdot nnz)$ |
| Múltiples lados derechos | Factorización LU + sustitución | $O(n^3) + O(kn^2)$ |

:::note
Para sistemas muy grandes ($n > 10^4$), los **métodos de Krylov** (Gradiente Conjugado, GMRES) son preferibles. Son el estándar en simulación de elementos finitos modernos.
:::
