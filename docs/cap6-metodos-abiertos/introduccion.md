---
id: introduccion
title: Métodos Abiertos (Newton-Raphson, Secante, Punto Fijo)
sidebar_label: Introducción
sidebar_position: 1
---

# Capítulo 6: Métodos Abiertos

## ¿Qué son los métodos abiertos?

Los **métodos abiertos** no requieren un intervalo con cambio de signo. Parten de una **estimación inicial** y convergen (o divergen) hacia la raíz. Son más rápidos que los métodos cerrados pero sin garantía de convergencia.

| Característica | Métodos Cerrados | Métodos Abiertos |
|---|:---:|:---:|
| Necesita intervalo con cambio de signo | ✅ | ❌ |
| Convergencia garantizada | ✅ | ❌ |
| Velocidad | Lineal | Cuadrática o superlineal |
| Requiere derivada | ❌ | Solo Newton-Raphson |

---

## 1. Método de Punto Fijo

Reformular $f(x) = 0$ como $x = g(x)$ y iterar:

$$
x_{i+1} = g(x_i)
$$

### Convergencia

El método converge si $|g'(x^*)| < 1$ cerca de la raíz $x^*$.

Si $|g'(x^*)| > 1$, **diverge**. La velocidad depende de $|g'(x^*)|$.

---

## 2. Método de Newton-Raphson

Partiendo de una estimación $x_i$, trazar la tangente a $f(x_i)$ y encontrar su intersección con el eje $x$:

$$
\boxed{x_{i+1} = x_i - \frac{f(x_i)}{f'(x_i)}}
$$

### Derivación geométrica

La pendiente de la tangente en $x_i$ es $f'(x_i)$:

$$
f'(x_i) = \frac{0 - f(x_i)}{x_{i+1} - x_i} \implies x_{i+1} = x_i - \frac{f(x_i)}{f'(x_i)}
$$

### Convergencia cuadrática

Newton-Raphson tiene convergencia **cuadrática** (el número de decimales correctos se duplica en cada iteración):

$$
E_{i+1} \approx -\frac{f''(x^*)}{2f'(x^*)} E_i^2
$$

### Algoritmo

```
entrada: f, f', x0, es, imax

x ← x0
para i = 1 hasta imax:
    x_nuevo ← x - f(x)/f'(x)
    ea = |( x_nuevo - x) / x_nuevo| × 100
    x ← x_nuevo
    si ea < es: detener

retornar x
```

### Ejemplo: $f(x) = e^{-x} - x$

$f'(x) = -e^{-x} - 1$

Desde $x_0 = 0$:

| Iter | $x_i$ | $f(x_i)$ | $f'(x_i)$ | $x_{i+1}$ | $\varepsilon_a$ (%) |
|:---:|:---:|:---:|:---:|:---:|:---:|
| 0 | 0.0000 | 1.0000 | −2.0000 | 0.5000 | — |
| 1 | 0.5000 | 0.1065 | −1.6065 | 0.5663 | 11.71 |
| 2 | 0.5663 | 0.0012 | −1.5684 | 0.5671 | 0.14 |
| 3 | 0.5671 | 0.0000 | −1.5671 | 0.5671 | 0.00 |

Converge en **3 iteraciones** (vs 8 de bisección y 5 de falsa posición).

### Limitaciones

:::warning Problemas comunes de Newton-Raphson
- **Derivada cero**: si $f'(x_i) \approx 0$, el método diverge o da pasos enormes.
- **Raíces múltiples**: la convergencia se reduce a lineal.
- **Estimación inicial**: alejada de la raíz puede causar divergencia u oscilar entre raíces.
:::

---

## 3. Método de la Secante

Aproxima la derivada con una diferencia finita usando **dos puntos anteriores**:

$$
f'(x_i) \approx \frac{f(x_i) - f(x_{i-1})}{x_i - x_{i-1}}
$$

Sustituyendo en Newton-Raphson:

$$
\boxed{x_{i+1} = x_i - \frac{f(x_i)(x_i - x_{i-1})}{f(x_i) - f(x_{i-1})}}
$$

**No requiere la derivada analítica** y converge superlinealmente (orden $\approx 1.618$, la razón áurea).

---

## Comparativa de velocidades

Para $f(x) = e^{-x} - x$ desde $x_0 = 0$, con $\varepsilon_s = 0.0001\%$:

| Método | Iteraciones |
|---|:---:|
| Bisección | ~17 |
| Falsa posición | ~8 |
| Secante | 5 |
| Newton-Raphson | 4 |

:::tip Recomendación práctica
Usa **Newton-Raphson** cuando la derivada analítica es fácil de calcular. Usa la **Secante** cuando la función es costosa de derivar. Usa **métodos cerrados** como punto de partida cuando no tienes certeza de la zona de la raíz.
:::
