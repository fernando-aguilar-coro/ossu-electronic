---
id: introduccion
title: Diferenciación Numérica
sidebar_label: Introducción
sidebar_position: 1
---

# Capítulo 23: Diferenciación Numérica

## Fórmulas de diferencias finitas

Derivadas de la **serie de Taylor**. Para paso $h$:

### Primera derivada

**Hacia adelante** (orden 1):

$$
f'(x_i) = \frac{f(x_{i+1}) - f(x_i)}{h} + O(h)
$$

**Hacia atrás** (orden 1):

$$
f'(x_i) = \frac{f(x_i) - f(x_{i-1})}{h} + O(h)
$$

**Centrada** (orden 2):

$$
f'(x_i) = \frac{f(x_{i+1}) - f(x_{i-1})}{2h} + O(h^2)
$$

### Segunda derivada (centrada, orden 2)

$$
f''(x_i) = \frac{f(x_{i+1}) - 2f(x_i) + f(x_{i-1})}{h^2} + O(h^2)
$$

---

## Fórmulas de mayor orden

Usando más puntos para mejorar la precisión:

### Primera derivada centrada de orden 4

$$
f'(x_i) = \frac{-f(x_{i+2}) + 8f(x_{i+1}) - 8f(x_{i-1}) + f(x_{i-2})}{12h} + O(h^4)
$$

### Segunda derivada centrada de orden 4

$$
f''(x_i) = \frac{-f(x_{i+2}) + 16f(x_{i+1}) - 30f(x_i) + 16f(x_{i-1}) - f(x_{i-2})}{12h^2} + O(h^4)
$$

---

## Tabla de coeficientes estándar

| Derivada | Precisión | Puntos | Coeficientes |
|---|:---:|---|---|
| $f'$ centrada | $O(h^2)$ | $f_{i-1}, f_{i+1}$ | $-1/2,\; 1/2$ |
| $f'$ centrada | $O(h^4)$ | $f_{i-2},\ldots,f_{i+2}$ | $1/12,\;-2/3,\;0,\;2/3,\;-1/12$ |
| $f''$ centrada | $O(h^2)$ | $f_{i-1}, f_i, f_{i+1}$ | $1,\;-2,\;1$ |
| $f''$ centrada | $O(h^4)$ | $f_{i-2},\ldots,f_{i+2}$ | $-1/12,\;4/3,\;-5/2,\;4/3,\;-1/12$ |

---

## Error total: compromiso redondeo-truncamiento

El error total al diferencias numéricamente es:

$$
E_{total}(h) = \underbrace{\frac{f''(\xi)}{2}h}_{E_{truncamiento} \to 0} + \underbrace{\frac{2\varepsilon_M}{h}}_{E_{redondeo} \to \infty}
$$

donde $\varepsilon_M$ es el épsilon de máquina. El paso óptimo es:

$$
h^* = \sqrt{2\varepsilon_M \left|\frac{f(x)}{f''(x)}\right|}
$$

Para doble precisión ($\varepsilon_M \approx 2.2\times10^{-16}$): $h^* \approx 10^{-8}$.

:::warning
Usar $h$ demasiado pequeño **aumenta** el error por cancelación catastrófica. La diferenciación numérica es inherentemente menos precisa que la integración numérica.
:::

---

## Diferenciación por Richardson

Similar a Romberg, extrapolar dos estimaciones con $h$ y $h/2$:

$$
D(h) = f'(x) + c_2 h^2 + c_4 h^4 + \cdots
$$

$$
D_{mejorado} = \frac{4D(h/2) - D(h)}{3} + O(h^4)
$$

---

## Aplicación: Derivadas de datos experimentales

Cuando $f(x)$ solo se conoce por mediciones discretas $(x_i, y_i)$:

1. Si los datos son ruidosos, **suavizar primero** (regresión polinomial local) antes de diferenciar.
2. Usar diferencias centradas en el interior, hacia adelante/atrás en los extremos.
3. Considerar el **suavizado de Savitzky-Golay**: ajusta un polinomio local en una ventana móvil y evalúa su derivada.
