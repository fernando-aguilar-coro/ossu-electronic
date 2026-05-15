---
id: introduccion
title: Interpolación
sidebar_label: Introducción
sidebar_position: 1
---

# Capítulo 18: Interpolación

## Diferencia entre regresión e interpolación

| Aspecto | Regresión | Interpolación |
|---|---|---|
| La curva pasa por los datos | No necesariamente | Siempre (exactamente) |
| Adecuado para datos con ruido | ✅ | ❌ |
| Adecuado para datos exactos | ❌ | ✅ |

---

## 1. Interpolación de Newton con diferencias divididas

Construye el polinomio de interpolación de forma incremental, agregando puntos uno a uno.

### Diferencias divididas

$$
f[x_i] = f(x_i)
$$

$$
f[x_i, x_{i+1}] = \frac{f[x_{i+1}] - f[x_i]}{x_{i+1} - x_i}
$$

$$
f[x_i, x_{i+1}, x_{i+2}] = \frac{f[x_{i+1}, x_{i+2}] - f[x_i, x_{i+1}]}{x_{i+2} - x_i}
$$

### Fórmula de Newton

$$
P_n(x) = f[x_0] + f[x_0,x_1](x-x_0) + f[x_0,x_1,x_2](x-x_0)(x-x_1) + \cdots
$$

$$
P_n(x) = \sum_{k=0}^n f[x_0,\ldots,x_k] \prod_{j=0}^{k-1}(x - x_j)
$$

**Ventaja**: añadir un nuevo punto solo requiere una columna extra de diferencias divididas.

---

## 2. Fórmula de Lagrange

Para $n+1$ puntos, el polinomio interpolante es único y puede escribirse como:

$$
P_n(x) = \sum_{i=0}^n f(x_i) \cdot L_i(x)
$$

donde los **polinomios base de Lagrange** son:

$$
L_i(x) = \prod_{\substack{j=0 \\ j\neq i}}^n \frac{x - x_j}{x_i - x_j}
$$

Cada $L_i(x_k) = \delta_{ik}$ (1 si $i=k$, 0 en otro caso).

---

## 3. Error de interpolación

El error del polinomio de grado $n$ es:

$$
f(x) - P_n(x) = \frac{f^{(n+1)}(\xi)}{(n+1)!}\prod_{i=0}^n (x - x_i)
$$

para algún $\xi$ en el intervalo de interpolación.

El error depende de:
- La **suavidad** de $f$ (magnitud de las derivadas altas)
- La **distribución** de los nodos (nodos de Chebyshev minimizan el error)

### Nodos de Chebyshev

Minimizan $\max|P_n(x) - f(x)|$:

$$
x_i = \frac{a+b}{2} + \frac{b-a}{2}\cos\!\left(\frac{(2i+1)\pi}{2(n+1)}\right), \quad i = 0,\ldots,n
$$

---

## 4. Splines cúbicos

En lugar de un único polinomio de alto grado (que puede oscilar), se usan polinomios cúbicos por tramos con condiciones de suavidad en los nodos.

Para $n+1$ nodos, hay $n$ intervalos, cada uno con un cúbico $S_i(x) = a_i + b_i(x-x_i) + c_i(x-x_i)^2 + d_i(x-x_i)^3$.

**Condiciones de empalme**: $S_i(x_{i+1}) = S_{i+1}(x_{i+1})$, $S_i'(x_{i+1}) = S_{i+1}'(x_{i+1})$, $S_i''(x_{i+1}) = S_{i+1}''(x_{i+1})$

Esto genera un sistema **tridiagonal** para los momentos $M_i = S_i''(x_i)$:

$$
h_{i-1}M_{i-1} + 2(h_{i-1}+h_i)M_i + h_i M_{i+1} = 6\left[\frac{f_{i+1}-f_i}{h_i} - \frac{f_i-f_{i-1}}{h_{i-1}}\right]
$$

**Condiciones de frontera** más comunes:
- *Natural*: $M_0 = M_n = 0$ (segunda derivada cero en extremos)
- *Sujeta*: $S_0' = f'(x_0)$, $S_n' = f'(x_n)$

:::tip
Los splines cúbicos dan interpolaciones mucho más suaves y estables que los polinomios de alto grado, especialmente para más de ~7 puntos.
:::
