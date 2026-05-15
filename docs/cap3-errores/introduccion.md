---
id: introduccion
title: Aproximaciones y Errores de Redondeo
sidebar_label: Introducción
sidebar_position: 1
---

# Capítulo 3: Aproximaciones y Errores de Redondeo

## Tipos de errores numéricos

En métodos numéricos, los errores se clasifican en:

| Tipo | Causa | Controlable |
|---|---|:---:|
| **Error de truncamiento** | Usar aproximación en lugar de proceso exacto | Sí (más términos, paso menor) |
| **Error de redondeo** | Precisión finita de la computadora | Parcialmente |
| **Error de modelo** | Simplificaciones del modelo matemático | Depende |
| **Error de datos** | Imprecisión en mediciones | No |

---

## Definiciones de error

### Error verdadero

$$
E_t = \text{valor verdadero} - \text{valor aproximado}
$$

### Error relativo porcentual

$$
\varepsilon_t = \frac{E_t}{\text{valor verdadero}} \times 100\%
$$

### Error aproximado (criterio de parada)

Cuando el valor verdadero es desconocido, se usa la diferencia entre iteraciones:

$$
\varepsilon_a = \left|\frac{x_r^{(nuevo)} - x_r^{(anterior)}}{x_r^{(nuevo)}}\right| \times 100\%
$$

---

## Criterio de Scarborough

Para garantizar que el resultado es correcto a $n$ cifras significativas:

$$
\varepsilon_s = (0.5 \times 10^{2-n})\%
$$

Si $\varepsilon_a < \varepsilon_s$, el resultado es confiable a $n$ cifras significativas.

| Cifras significativas $n$ | Tolerancia $\varepsilon_s$ |
|:---:|:---:|
| 1 | 5 % |
| 2 | 0.5 % |
| 3 | 0.05 % |
| 4 | 0.005 % |

---

## Representación de punto flotante

Un número real se almacena como:

$$
x = \pm 0.d_1 d_2 d_3 \ldots d_t \times b^e
$$

donde $b$ es la base, $t$ el número de dígitos de la mantisa y $e$ el exponente.

### Desbordamiento y subdesbordamiento

- **Overflow**: el exponente supera el máximo → resultado $\pm\infty$
- **Underflow**: el exponente cae por debajo del mínimo → el número se redondea a 0

---

## Errores de redondeo en operaciones básicas

### Suma de series

La serie armónica $\sum_{k=1}^n \frac{1}{k}$ se suma mejor de **mayor a menor** índice:

$$
\text{Sumar de } k=n \text{ a } k=1 \text{ es más preciso que de } k=1 \text{ a } k=n
$$

### Resta de casi-iguales (Cancelación catastrófica)

Ejemplo: $f(x) = 1 - \cos x$ cerca de $x = 0$.

La forma directa pierde precisión. La identidad trigonométrica ayuda:

$$
1 - \cos x = 2\sin^2\!\left(\frac{x}{2}\right)
$$

Esta forma es numéricamente estable para $x$ pequeño.

---

## Error total: truncamiento + redondeo

El error total en un método numérico es la **suma** de ambos:

$$
E_{total} = E_{truncamiento} + E_{redondeo}
$$

Existe un **paso óptimo** $h^*$ que minimiza el error total:

$$
h^* = \left(\frac{c_2 \varepsilon_{mach}}{c_1}\right)^{1/(p+1)}
$$

donde $p$ es el orden del método. Para pasos demasiado pequeños, el error de redondeo domina; para pasos grandes, domina el truncamiento.

```
Error total
    |
    |  \                   /
    |   \                 /   ← redondeo (aumenta al reducir h)
    |    \               /
    |     \   mínimo    /
    |      \_____/______
    |           ↑
    |          h*
    +---------------------------→ h (tamaño del paso)
```

:::note Implicación práctica
Reducir el paso de integración o diferenciación más allá de $h^*$ **empeora** el resultado. Siempre existe un compromiso entre truncamiento y redondeo.
:::

---

## Errores en sistemas de ecuaciones

En álgebra lineal, el **número de condición** de una matriz $A$ mide cuánto se amplifican los errores:

$$
\kappa(A) = \|A\| \cdot \|A^{-1}\|
$$

- $\kappa(A) \approx 1$: sistema bien condicionado
- $\kappa(A) \gg 1$: sistema mal condicionado (los errores se amplifican)

:::warning
Un sistema mal condicionado puede dar resultados completamente erróneos incluso con aritmética de doble precisión. Siempre reportar $\kappa(A)$ junto con la solución.
:::
