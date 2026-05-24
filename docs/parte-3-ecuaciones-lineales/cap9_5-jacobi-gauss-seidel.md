---
title: Métodos Iterativos — Jacobi y Gauss-Seidel
sidebar_label: "Cap. 9.5: Jacobi y Gauss-Seidel"
sidebar_position: 1
---

# Capítulo 9.5: Métodos Iterativos

A diferencia de los métodos directos como la **Eliminación de Gauss** o la **Descomposición LU** —que buscan obtener la solución exacta en un número finito de pasos—, los **métodos iterativos** obtienen aproximaciones sucesivamente más precisas partiendo de una estimación inicial.

Estos métodos son de vital importancia en la computación científica e ingeniería para resolver sistemas de ecuaciones lineales muy grandes y dispersos (donde la mayoría de los coeficientes son cero), ya que requieren significativamente menos memoria y operaciones de cómputo ($O(n^2)$ por iteración en lugar de $O(n^3)$).

---

## 📐 Criterio de convergencia: Diagonal Dominante

Un método iterativo converge a la solución única del sistema $A\mathbf{x} = \mathbf{b}$ independientemente de la aproximación inicial $\mathbf{x}^{(0)}$ si la matriz de coeficientes $A$ es **estrictamente diagonal dominante**.

Una matriz $A$ de tamaño $n \times n$ es estrictamente diagonal dominante por filas si para cada fila $i$, el valor absoluto del elemento en la diagonal es estrictamente mayor que la suma de los valores absolutos de todos los demás elementos de esa fila:

$$
|a_{ii}| > \sum_{j \neq i} |a_{ij}|, \quad \forall\, i = 1, 2, \ldots, n
$$

:::tip Reordenamiento de Ecuaciones
Si un sistema no es diagonal dominante, en muchas ocasiones es posible **intercambiar el orden de las filas** (ecuaciones) para lograr que cumpla con esta condición y así garantizar la convergencia de los algoritmos iterativos.
:::

---

## 🔄 Método de Jacobi

El **método de Jacobi** despeja la variable $x_i$ de la ecuación $i$-ésima. En cada iteración $k+1$, los nuevos valores se calculan utilizando **únicamente** los valores obtenidos en la iteración anterior $k$.

### Formulación matemática

Para cada componente $i = 1, 2, \ldots, n$:

$$
x_i^{(k+1)} = \frac{b_i - \displaystyle\sum_{j \neq i} a_{ij} x_j^{(k)}}{a_{ii}}
$$

O de forma expandida para cada variable:

$$
\begin{aligned}
x_1^{(k+1)} &= \frac{1}{a_{11}} \left( b_1 - a_{12}x_2^{(k)} - a_{13}x_3^{(k)} - \cdots - a_{1n}x_n^{(k)} \right) \\
x_2^{(k+1)} &= \frac{1}{a_{22}} \left( b_2 - a_{21}x_1^{(k)} - a_{23}x_3^{(k)} - \cdots - a_{2n}x_n^{(k)} \right) \\
&\;\;\vdots \\
x_n^{(k+1)} &= \frac{1}{a_{nn}} \left( b_n - a_{n1}x_1^{(k)} - a_{n2}x_2^{(k)} - \cdots - a_{n,n-1}x_{n-1}^{(k)} \right)
\end{aligned}
$$

---

## ⚡ Método de Gauss-Seidel

El **método de Gauss-Seidel** es una optimización directa del método de Jacobi. Su principal diferencia radica en que **utiliza inmediatamente los nuevos valores calculados** de las variables dentro de la misma iteración en curso.

### Formulación matemática

Para cada componente $i = 1, 2, \ldots, n$:

$$
x_i^{(k+1)} = \frac{1}{a_{ii}}\left(b_i - \sum_{j=1}^{i-1} a_{ij} x_j^{(k+1)} - \sum_{j=i+1}^{n} a_{ij} x_j^{(k)}\right)
$$

Al utilizar la información más fresca de inmediato, Gauss-Seidel suele converger aproximadamente al **doble de velocidad** que el método de Jacobi.

---

## 📋 Ejemplo práctico paso a paso

Resolver el siguiente sistema de ecuaciones partiendo de la aproximación inicial $\mathbf{x}^{(0)} = (0, 0, 0)^T$ hasta lograr un error menor a $\varepsilon_s = 5\%$.

$$
\begin{cases}
8x_1 + 2x_2 - x_3 = -2 \\
-2x_1 + 7x_2 + x_3 = 4 \\
x_1 - 3x_2 + 10x_3 = 8
\end{cases}
$$

### Paso 1: Verificar diagonal dominancia

1. Fila 1: $|8| > |2| + |-1| \implies 8 > 3$ ✓
2. Fila 2: $|7| > |-2| + |1| \implies 7 > 3$ ✓
3. Fila 3: $|10| > |1| + |-3| \implies 10 > 4$ ✓

*El sistema es estrictamente diagonal dominante, por lo que la convergencia está garantizada.*

### Paso 2: Despejar las ecuaciones de recurrencia

$$
x_1 = \frac{-2 - 2x_2 + x_3}{8}
$$

$$
x_2 = \frac{4 + 2x_1 - x_3}{7}
$$

$$
x_3 = \frac{8 - x_1 + 3x_2}{10}
$$

---

### Iteración 1

#### Método de Jacobi (usa solo valores de la iteración anterior)

*   $x_1^{(1)} = \frac{-2 - 2(0) + (0)}{8} = -0.25$
*   $x_2^{(1)} = \frac{4 + 2(0) - (0)}{7} \approx 0.5714$
*   $x_3^{(1)} = \frac{8 - (0) + 3(0)}{10} = 0.8$

#### Método de Gauss-Seidel (usa los nuevos valores de inmediato)

*   $x_1^{(1)} = \frac{-2 - 2(0) + (0)}{8} = -0.25$
*   $x_2^{(1)} = \frac{4 + 2(-0.25) - (0)}{7} = 0.5000$ (usa $x_1^{(1)} = -0.25$)
*   $x_3^{(1)} = \frac{8 - (-0.25) + 3(0.5)}{10} = 0.9750$ (usa $x_1^{(1)} = -0.25$ y $x_2^{(1)} = 0.5$)

---

### Comparativa de Convergencia

| Iteración ($k$) | Jacobi: $x_1$ | Jacobi: $x_2$ | Jacobi: $x_3$ | GS: $x_1$ | GS: $x_2$ | GS: $x_3$ | GS $\varepsilon_a$ (%) |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **0** | 0.0000 | 0.0000 | 0.0000 | 0.0000 | 0.0000 | 0.0000 | — |
| **1** | -0.2500 | 0.5714 | 0.8000 | -0.2500 | 0.5000 | 0.9750 | 100.0% |
| **2** | -0.2929 | 0.3857 | 0.9964 | -0.2531 | 0.3602 | 0.9334 | 38.8% |
| **3** | -0.2152 | 0.3459 | 0.9450 | -0.2234 | 0.3600 | 0.9303 | 3.5% ✓ |
| **4** | -0.2183 | 0.3750 | 0.9253 | -0.2237 | 0.3603 | 0.9305 | 0.1% ✓ |

**Solución exacta:** $\mathbf{x} \approx (-0.2237, \, 0.3604, \, 0.9305)^T$. Como se aprecia en la tabla, **Gauss-Seidel** alcanza la tolerancia requerida en la tercera iteración, mientras que Jacobi requiere más pasos.

---

## 💻 Implementación en Python

A continuación se muestra el código ejecutable para comparar ambos algoritmos:

```python
import numpy as np

def resolver_iterativo(A, b, x0, tol=1e-5, max_iter=100):
    n = len(b)
    
    # ── Método de Jacobi ──
    x_jac = np.copy(x0).astype(float)
    x_new = np.zeros(n)
    iter_jac = 0
    
    for k in range(max_iter):
        for i in range(n):
            suma = b[i] - sum(A[i, j] * x_jac[j] for j in range(n) if j != i)
            x_new[i] = suma / A[i, i]
            
        error = np.linalg.norm(x_new - x_jac) / np.linalg.norm(x_new)
        x_jac = np.copy(x_new)
        iter_jac += 1
        if error < tol:
            break
            
    # ── Método de Gauss-Seidel ──
    x_gs = np.copy(x0).astype(float)
    iter_gs = 0
    
    for k in range(max_iter):
        x_old = np.copy(x_gs)
        for i in range(n):
            suma = b[i] - sum(A[i, j] * x_gs[j] for j in range(n) if j != i)
            x_gs[i] = suma / A[i, i]
            
        error = np.linalg.norm(x_gs - x_old) / np.linalg.norm(x_gs)
        iter_gs += 1
        if error < tol:
            break
            
    return x_jac, iter_jac, x_gs, iter_gs

# --- Caso de prueba ---
A = np.array([
    [8,  2, -1],
    [-2, 7,  1],
    [1, -3, 10]
])
b = np.array([-2, 4, 8])
x0 = np.array([0, 0, 0])

x_j, it_j, x_g, it_g = resolver_iterativo(A, b, x0)

print("┌────────────────────────────────────────────────────────┐")
print("│              RESULTADOS DE LA SIMULACIÓN               │")
print("└────────────────────────────────────────────────────────┘")
print(f"Método de Jacobi:       x = {x_j} (Iteraciones: {it_j})")
print(f"Método de Gauss-Seidel: x = {x_g} (Iteraciones: {it_g})")
```
