---
id: introduccion
title: Modelos Matemáticos y Solución de Problemas
sidebar_label: Introducción
sidebar_position: 1
---

# Capítulo 1: Modelos Matemáticos y Solución de Problemas en Ingeniería

## ¿Qué es un modelo matemático?

Un **modelo matemático** es una representación funcional de un sistema físico que relaciona variables de estado con parámetros del sistema:

$$
\frac{d\mathbf{x}}{dt} = f(\mathbf{x}, \mathbf{p}, t)
$$

donde $\mathbf{x}$ son las variables de estado, $\mathbf{p}$ los parámetros y $t$ el tiempo.

## Ciclo de solución de problemas de ingeniería

```
Problema físico
      ↓
Modelo matemático  (EDO, sistema lineal, integral, etc.)
      ↓
Método numérico  (selección del algoritmo)
      ↓
Implementación computacional
      ↓
Análisis de resultados y validación
```

## Ejemplo motivador: caída libre con resistencia del aire

La segunda ley de Newton aplicada a un paracaidista:

$$
m\frac{dv}{dt} = mg - cv
$$

donde $m$ es la masa (kg), $g = 9.81\,\text{m/s}^2$ la gravedad, $c$ el coeficiente de arrastre (kg/s) y $v$ la velocidad (m/s).

### Solución analítica

$$
v(t) = \frac{mg}{c}\left(1 - e^{-\frac{c}{m}t}\right)
$$

La **velocidad terminal** ocurre cuando $dv/dt = 0$:

$$
v_t = \frac{mg}{c}
$$

### Solución numérica (método de Euler)

Aproximando la derivada por diferencias finitas:

$$
\frac{dv}{dt} \approx \frac{v(t_{i+1}) - v(t_i)}{\Delta t}
$$

Sustituyendo en la EDO:

$$
v(t_{i+1}) = v(t_i) + \underbrace{\left(g - \frac{c}{m}v(t_i)\right)}_{\text{pendiente}} \cdot \Delta t
$$

### Comparación

| $t$ (s) | $v$ analítica (m/s) | $v$ Euler, $\Delta t=2$ (m/s) | Error (%) |
|:---:|:---:|:---:|:---:|
| 0 | 0.000 | 0.000 | — |
| 2 | 16.405 | 19.620 | 19.6 |
| 4 | 27.768 | 32.464 | 16.9 |
| 10 | 44.872 | 47.174 | 5.1 |
| ∞ | 53.393 | — | — |

El error de Euler disminuye al reducir $\Delta t$.

---

## Clasificación de modelos y métodos

| Tipo de problema | Método numérico correspondiente |
|---|---|
| $f(x) = 0$ | Búsqueda de raíces (Caps. 5–7) |
| $A\mathbf{x} = \mathbf{b}$ | Álgebra lineal numérica (Caps. 9–11) |
| $\min f(x)$ | Optimización (Caps. 13, 15) |
| Ajuste de curvas | Regresión e interpolación (Caps. 17–18) |
| $\int_a^b f\,dx$ | Integración numérica (Caps. 21–22) |
| $dy/dx = f$ | EDOs (Caps. 25, 27) |
| EDP | Diferencias/elementos finitos (Caps. 30–31) |

---

## Conservación como principio unificador

Muchos modelos en ingeniería se derivan del **principio de conservación**:

$$
\frac{\text{Tasa de cambio}}{\text{en el sistema}} = \text{Entradas} - \text{Salidas} + \text{Generación}
$$

Ejemplos:
- **Energía**: balance de calor → ecuaciones parabólicas
- **Masa**: continuidad → ecuaciones de flujo
- **Cantidad de movimiento**: mecánica → EDOs y sistemas lineales

:::tip Para recordar
El modelo matemático determina qué método numérico es apropiado. Identificar el tipo de ecuación es el primer paso de cualquier solución numérica.
:::
