---
id: falsa-posicion
title: Método de Falsa Posición (Regula Falsi)
sidebar_label: Falsa Posición
sidebar_position: 3
---

# Método de Falsa Posición (Regula Falsi)

## Idea fundamental

El método de **falsa posición** mejora la bisección al usar la **interpolación lineal** entre los puntos extremos del intervalo para estimar la ubicación de la raíz, en lugar de simplemente tomar el punto medio.

La idea es que si $f$ es lineal (o casi lineal) en $[x_l, x_u]$, la recta que une $(x_l, f(x_l))$ con $(x_u, f(x_u))$ cruzará el eje $x$ cerca de la raíz real.

---

## Derivación de la fórmula

Trazar una línea recta entre los puntos $(x_l,\, f(x_l))$ y $(x_u,\, f(x_u))$. La intersección de esta recta con el eje $x$ da la nueva estimación $x_r$.

Por semejanza de triángulos (o interpolación lineal):

$$
\frac{0 - f(x_l)}{x_r - x_l} = \frac{f(x_u) - f(x_l)}{x_u - x_l}
$$

Despejando $x_r$:

$$
\boxed{x_r = x_u - \frac{f(x_u)\,(x_u - x_l)}{f(x_u) - f(x_l)}}
$$

Esta es la **fórmula de falsa posición** (también llamada *Regula Falsi*).

---

## Algoritmo

Dado $[x_l, x_u]$ con $f(x_l) \cdot f(x_u) < 0$:

### Paso 1 — Calcular nueva estimación

$$
x_r = x_u - \frac{f(x_u)\,(x_u - x_l)}{f(x_u) - f(x_l)}
$$

### Paso 2 — Evaluar y actualizar intervalo

$$
\text{Si } f(x_l) \cdot f(x_r) < 0 \implies x_u = x_r
$$

$$
\text{Si } f(x_l) \cdot f(x_r) > 0 \implies x_l = x_r
$$

$$
\text{Si } f(x_l) \cdot f(x_r) = 0 \implies x_r \text{ es raíz exacta}
$$

### Paso 3 — Calcular error y repetir

$$
\varepsilon_a = \left| \frac{x_r^{(nuevo)} - x_r^{(anterior)}}{x_r^{(nuevo)}} \right| \times 100\%
$$

Continuar hasta $\varepsilon_a < \varepsilon_s$.

---

## Comparación con Bisección

| Característica | Bisección | Falsa Posición |
|---|:---:|:---:|
| Punto de prueba | Punto medio $\frac{x_l+x_u}{2}$ | Interpolación lineal |
| Convergencia garantizada | ✅ | ✅ |
| Velocidad (típica) | Más lenta | Más rápida |
| Convergencia siempre uniforme | ✅ | ❌ (puede estancarse) |

:::warning Problema de convergencia lenta
En funciones muy curvas, **uno de los extremos puede no moverse nunca**, causando que la falsa posición converja lentamente. Esto se corrige con la **falsa posición modificada**.
:::

---

## Falsa Posición Modificada

Para evitar el estancamiento, se puede escalar el valor del extremo "fijo" por un factor:

$$
f(x_l)^* = \frac{f(x_l)}{2} \quad \text{si } x_l \text{ no se movió en la iteración anterior}
$$

O usar la variante de **Illinois** (división por 2 del extremo estancado).

---

## Pseudocódigo

```
función falsaPosicion(f, xl, xu, es, imax):
    xr_anterior = xl
    iteracion = 0

    repetir:
        xr = xu - f(xu)*(xu - xl) / (f(xu) - f(xl))
        iteracion = iteracion + 1

        si xr ≠ 0:
            ea = |(xr - xr_anterior) / xr| × 100

        producto = f(xl) × f(xr)

        si producto < 0:
            xu = xr
        si producto > 0:
            xl = xr
        si producto = 0:
            ea = 0

        xr_anterior = xr

    mientras ea > es  Y  iteracion < imax

    retornar xr
```

---

## Implementación del Algoritmo

```python
def falsa_posicion(f, xl, xu, es=0.0001, imax=100):
    """
    Método de falsa posición (Regula Falsi).

    Parámetros
    ----------
    f    : función continua
    xl   : límite inferior del intervalo
    xu   : límite superior del intervalo
    es   : tolerancia de error aproximado (%)
    imax : número máximo de iteraciones
    
    Retorna
    -------
    xr   : aproximación de la raíz
    """
    if f(xl) * f(xu) > 0:
        raise ValueError("No hay cambio de signo en el intervalo dado.")

    xr_ant = xl
    ea = 100.0

    for i in range(1, imax + 1):
        xr = xu - f(xu) * (xu - xl) / (f(xu) - f(xl))

        if xr != 0:
            ea = abs((xr - xr_ant) / xr) * 100

        producto = f(xl) * f(xr)

        if producto < 0:
            xu = xr
        elif producto > 0:
            xl = xr
        else:
            ea = 0

        xr_ant = xr
        print(f"  Iter {i:3d}: xl={xl:.6f}, xu={xu:.6f}, xr={xr:.6f}, ea={ea:.4f}%")

        if ea < es:
            break

    return xr


# --- Ejemplo de uso ---
import math

f = lambda x: math.exp(-x) - x   # raíz ≈ 0.5671

raiz = falsa_posicion(f, xl=0, xu=1, es=0.5)
print(f"\nRaíz aproximada: {raiz:.6f}")
```

---

## Ejemplo resuelto

**Encontrar la raíz de $f(x) = e^{-x} - x$ en $[0, 1]$ con $\varepsilon_s = 1\%$.**

Verificar: $f(0) = 1 > 0$, $\quad f(1) \approx -0.6321 < 0$ ✓

**Iter 1:**

$$
x_r = 1 - \frac{(-0.6321)(1 - 0)}{-0.6321 - 1} = 1 - \frac{-0.6321}{-1.6321} = 1 - 0.3873 = 0.6127
$$

$f(0.6127) = e^{-0.6127} - 0.6127 \approx 0.5421 - 0.6127 = -0.0706 < 0$

Como $f(0) \cdot f(0.6127) < 0 \implies x_u = 0.6127$

**Iter 2:**

$$
x_r = 0.6127 - \frac{(-0.0706)(0.6127 - 0)}{-0.0706 - 1} = 0.6127 - \frac{-0.04326}{-1.0706} = 0.6127 - 0.04041 = 0.5723
$$

$\varepsilon_a = \left|\frac{0.5723 - 0.6127}{0.5723}\right| \times 100 = 7.06\%$

| Iter | $x_l$ | $x_u$ | $x_r$ | $f(x_r)$ | $\varepsilon_a$ (%) |
|:----:|:------:|:------:|:------:|:---------:|:-------------------:|
| 1 | 0.0000 | 1.0000 | 0.6127 | −0.0706 | — |
| 2 | 0.0000 | 0.6127 | 0.5723 | +0.0347 | 7.06 |
| 3 | 0.5723 | 0.6127 | 0.5878 | −0.0184 | 2.64 |
| 4 | 0.5723 | 0.5878 | 0.5799 | +0.0083 | **1.36** |
| 5 | 0.5799 | 0.5878 | 0.5840 | −0.0043 | **0.70** ✓ |

Converge en **5 iteraciones** vs 8 de bisección para la misma tolerancia.

---

## Geometría del método

La clave visual es que el método usa la **secante** entre los extremos del intervalo, no el punto medio:

$$
\text{Pendiente de la secante: } m = \frac{f(x_u) - f(x_l)}{x_u - x_l}
$$

La intersección con el eje $x$ desde el punto $(x_u, f(x_u))$:

$$
0 - f(x_u) = m\,(x_r - x_u) \implies x_r = x_u - \frac{f(x_u)}{m} = x_u - \frac{f(x_u)(x_u - x_l)}{f(x_u) - f(x_l)}
$$

---

## Consideraciones prácticas

:::tip Cuándo usar falsa posición
Úsalo cuando la función sea relativamente suave y quieras convergencia más rápida que bisección, pero aún necesitas la garantía de convergencia de los métodos cerrados.
:::

:::warning Funciones muy curvas
En funciones con alta curvatura (como $f(x) = x^{10} - 1$ en $[0, 1.5]$), la falsa posición puede converger **más lento que la bisección** porque un extremo se vuelve "fijo". En estos casos, usar la variante de **Illinois** o cambiar a métodos abiertos.
:::

:::note Diferencia con la Secante
El método de la Secante (capítulo siguiente) usa la misma fórmula pero **no mantiene el cambio de signo**, por lo que no garantiza convergencia. La falsa posición es más segura pero puede ser más lenta.
:::
