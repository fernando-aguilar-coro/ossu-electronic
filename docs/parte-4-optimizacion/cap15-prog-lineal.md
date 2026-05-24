---
title: Programación Lineal (Optimización Restringida)
sidebar_label: "Cap. 15: Programación Lineal"
sidebar_position: 1
---

# Capítulo 15: Optimización Restringida — Programación Lineal

## Forma estándar

Un problema de **programación lineal** (PL) tiene:
- **Función objetivo lineal**: $\max\, c^T x$ (o $\min$)
- **Restricciones lineales**: $Ax \leq b$, con $x \geq 0$

$$
\max\quad \mathbf{c}^T \mathbf{x}
$$
$$
\text{s.t.}\quad A\mathbf{x} \leq \mathbf{b},\quad \mathbf{x} \geq \mathbf{0}
$$

---

## Geometría: la región factible

Las restricciones definen un **poliedro convexo** (región factible). El óptimo siempre está en un **vértice** (punto extremo) de este poliedro.

```
     x2
      |    ← restricciones
      |  /
      | / ← región factible
      |/_________ x1
      
  El óptimo está en un vértice
```

---

## Método Simplex

El **método simplex** recorre los vértices del poliedro de forma eficiente hasta encontrar el óptimo.

### Forma estándar con variables de holgura

Convertir $\leq$ a igualdades añadiendo **variables de holgura** $s_i \geq 0$:

$$
a_{i1}x_1 + a_{i2}x_2 + \cdots + s_i = b_i
$$

### Algoritmo básico

```
1. Encontrar una solución básica factible inicial (BFS)
2. Calcular los costos reducidos z_j - c_j para todas las variables no básicas
3. Si todos z_j - c_j ≥ 0 → solución óptima, parar
4. Seleccionar la variable de entrada (más negativo z_j - c_j)
5. Seleccionar la variable de salida (regla de la razón mínima)
6. Pivotar: actualizar la tabla simplex
7. Volver al paso 2
```

---

## Ejemplo: Problema de producción

Una fábrica produce dos productos A y B.
- Ganancia: $\$5$/unidad de A, $\$4$/unidad de B
- Recurso 1: $6x_A + 4x_B \leq 24$
- Recurso 2: $x_A + 2x_B \leq 6$
- $x_A, x_B \geq 0$

**Modelo:**

$$
\max\; 5x_A + 4x_B
$$

$$
\text{s.t.}\quad 6x_A + 4x_B \leq 24, \quad x_A + 2x_B \leq 6
$$

**Vértices factibles:**

| Vértice | $x_A$ | $x_B$ | $z = 5x_A+4x_B$ |
|:---:|:---:|:---:|:---:|
| O | 0 | 0 | 0 |
| A | 4 | 0 | **20** |
| B | 3 | 1.5 | 21 |
| C | 0 | 3 | 12 |

**Óptimo**: $x_A = 3,\; x_B = 1.5,\; z = 21$ ✓

---

## Análisis de sensibilidad

Después de encontrar la solución óptima, el análisis de sensibilidad responde:
- **¿Cuánto puede variar $c_j$** sin cambiar la base óptima?
- **¿Cuánto puede variar $b_i$** (recursos) sin perder la factibilidad?

Estos rangos son la **información más valiosa** del PL para toma de decisiones.

---

## Casos especiales

| Caso | Descripción |
|---|---|
| **Solución única** | El óptimo está en un solo vértice |
| **Soluciones múltiples** | El óptimo está en una arista (infinitas soluciones óptimas) |
| **No acotado** | La función objetivo crece sin límite |
| **Infactible** | La región factible es vacía |

:::note Programación entera
Si las variables deben ser enteras, el problema se convierte en **PL entera** (más difícil). Los métodos de Branch & Bound o cortes de Gomory son los enfoques estándar.
:::
