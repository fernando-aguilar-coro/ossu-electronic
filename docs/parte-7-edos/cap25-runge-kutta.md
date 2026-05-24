---
title: Métodos de Runge-Kutta para EDOs
sidebar_label: "Cap. 25: Runge-Kutta"
sidebar_position: 1
---

# Capítulo 25: Métodos de Runge-Kutta

## Problema de valor inicial (PVI)

Resolver una EDO de primer orden:

$$
\frac{dy}{dx} = f(x, y), \quad y(x_0) = y_0
$$

Los métodos de Runge-Kutta aproximan la solución en pasos discretos $h$:

$$
y_{i+1} = y_i + \phi \cdot h
$$

donde $\phi$ es una **función incremento** (pendiente representativa en $[x_i, x_{i+1}]$).

---

## 1. Método de Euler (RK1)

$$
y_{i+1} = y_i + f(x_i, y_i)\,h
$$

- **Orden**: 1 → error global $O(h)$
- Solo usa la pendiente al inicio del intervalo
- Sencillo pero impreciso para $h$ grande

---

## 2. Método de Heun (RK2 — Predictor-Corrector)

**Predictor** (Euler):

$$
y_{i+1}^* = y_i + f(x_i, y_i)\,h
$$

**Corrector** (promedio de pendientes):

$$
y_{i+1} = y_i + \frac{h}{2}\left[f(x_i, y_i) + f(x_{i+1}, y_{i+1}^*)\right]
$$

- **Orden**: 2 → error global $O(h^2)$
- Requiere 2 evaluaciones de $f$ por paso

---

## 3. Método del Punto Medio (RK2 alternativo)

$$
k_1 = f(x_i, y_i)
$$

$$
k_2 = f\!\left(x_i + \frac{h}{2},\; y_i + \frac{h}{2}k_1\right)
$$

$$
y_{i+1} = y_i + k_2\,h
$$

---

## 4. Runge-Kutta de Orden 4 (RK4)

El **estándar industrial** para EDOs. Promedio ponderado de 4 pendientes:

$$
k_1 = f(x_i,\, y_i)
$$

$$
k_2 = f\!\left(x_i + \tfrac{h}{2},\; y_i + \tfrac{h}{2}k_1\right)
$$

$$
k_3 = f\!\left(x_i + \tfrac{h}{2},\; y_i + \tfrac{h}{2}k_2\right)
$$

$$
k_4 = f(x_i + h,\; y_i + hk_3)
$$

$$
\boxed{y_{i+1} = y_i + \frac{h}{6}(k_1 + 2k_2 + 2k_3 + k_4)}
$$

- **Orden**: 4 → error global $O(h^4)$
- Requiere 4 evaluaciones de $f$ por paso
- Excelente balance precisión/costo

---

## Ejemplo: caída libre con resistencia

$$
\frac{dv}{dt} = g - \frac{c}{m}v = 9.81 - \frac{0.25}{68.1}v, \quad v(0) = 0
$$

Con $h = 2\,\text{s}$, RK4 hasta $t = 10\,\text{s}$:

| $t$ (s) | $v$ exacto (m/s) | RK4 (m/s) | Error |
|:---:|:---:|:---:|:---:|
| 0 | 0.000 | 0.000 | 0 |
| 2 | 18.735 | 18.735 | $< 10^{-4}$ |
| 4 | 33.533 | 33.533 | $< 10^{-4}$ |
| 10 | 50.175 | 50.175 | $< 10^{-4}$ |

RK4 con $h = 2$ es más preciso que Euler con $h = 0.01$.

---

## Sistemas de EDOs

RK4 se extiende directamente a sistemas $\mathbf{y}' = \mathbf{f}(x, \mathbf{y})$:

$$
\mathbf{y}_{i+1} = \mathbf{y}_i + \frac{h}{6}(\mathbf{k}_1 + 2\mathbf{k}_2 + 2\mathbf{k}_3 + \mathbf{k}_4)
$$

Las EDOs de orden superior se reducen a sistemas de primer orden:

$$
y'' = f(x, y, y') \implies \begin{cases} y_1 = y \\ y_2 = y' \end{cases}, \quad \begin{cases} y_1' = y_2 \\ y_2' = f(x, y_1, y_2) \end{cases}
$$

---

## Control adaptativo del paso

Métodos como **RK45 (Dormand-Prince)** estiman el error comparando soluciones de orden 4 y 5, y ajustan $h$ automáticamente:

$$
h_{nuevo} = h \cdot \left(\frac{\varepsilon_{tol}}{E_{estimado}}\right)^{1/5}
$$

Este es el método `ode45` de MATLAB / `solve_ivp` de SciPy por defecto.

:::tip Comparativa de órdenes
| Método | Orden | Evaluaciones/paso | Uso típico |
|---|:---:|:---:|---|
| Euler | 1 | 1 | Solo para aprender |
| Heun / Punto medio | 2 | 2 | Problemas simples |
| RK4 | 4 | 4 | Estándar general |
| RK45 adaptativo | 4/5 | 6 | Aplicaciones reales |
:::
