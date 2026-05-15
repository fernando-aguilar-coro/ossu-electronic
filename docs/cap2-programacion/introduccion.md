---
id: introduccion
title: Programación y Software para Métodos Numéricos
sidebar_label: Introducción
sidebar_position: 1
---

# Capítulo 2: Programación y Software

## Herramientas computacionales

Los métodos numéricos requieren implementación en un lenguaje o entorno de cálculo. Las opciones más comunes en ingeniería son:

| Herramienta | Fortaleza |
|---|---|
| MATLAB / Octave | Álgebra matricial, visualización integrada |
| Python (NumPy/SciPy) | General, ecosistema científico amplio |
| Julia | Velocidad de C con sintaxis de alto nivel |
| C / C++ | Máxima eficiencia computacional |

---

## Estructura de un programa numérico

Todo programa numérico bien diseñado sigue esta estructura:

```
1. Entrada de datos (parámetros, condiciones iniciales)
2. Inicialización de variables
3. Bucle iterativo principal
   a. Calcular nueva estimación
   b. Evaluar criterio de parada
   c. Actualizar variables
4. Presentación de resultados
```

---

## Pseudocódigo y diagramas de flujo

El **pseudocódigo** es un lenguaje informal para describir algoritmos sin depender de una sintaxis específica:

```
# Pseudocódigo genérico de un método iterativo
entrada: función f, parámetros iniciales, tolerancia ε, maxIter

i ← 0
x ← estimación_inicial
error ← ∞

mientras error > ε  Y  i < maxIter:
    x_nuevo ← paso_del_método(x)
    error ← |x_nuevo - x| / |x_nuevo| × 100
    x ← x_nuevo
    i ← i + 1

retornar x
```

---

## Aritmética de punto flotante

Las computadoras representan números reales en **punto flotante** (estándar IEEE 754):

$$
x = \pm\, m \times b^e
$$

donde $m$ es la **mantisa** (fracción), $b$ la base (2 para binario) y $e$ el exponente.

### Precisión de máquina

El **épsilon de máquina** $\varepsilon_{mach}$ es el número más pequeño tal que:

$$
1 + \varepsilon_{mach} > 1
$$

| Precisión | Bits | $\varepsilon_{mach}$ |
|---|:---:|:---:|
| Simple (float32) | 32 | $\approx 1.19 \times 10^{-7}$ |
| Doble (float64) | 64 | $\approx 2.22 \times 10^{-16}$ |

:::warning Cancelación catastrófica
Al restar dos números casi iguales, la precisión efectiva se reduce drásticamente. Ejemplo: si $a = 1.0000001$ y $b = 1.0000000$, entonces $a - b = 1\times10^{-7}$ solo tiene 1 cifra significativa aunque $a$ y $b$ tienen 8.
:::

---

## Cifras significativas y redondeo

El número de **cifras significativas** indica la cantidad de dígitos confiables en un resultado.

**Regla de redondeo**: si el dígito siguiente al último significativo es ≥ 5, se redondea hacia arriba.

### Error de redondeo acumulado

Al encadenar operaciones, el error de redondeo puede acumularse. Las sumas de muchos términos pequeños deben hacerse de **menor a mayor magnitud** para minimizar la pérdida de precisión.

---

## Evaluación eficiente de polinomios: Método de Horner

Para evaluar $P(x) = a_n x^n + a_{n-1}x^{n-1} + \cdots + a_1 x + a_0$:

**Forma ingenua:** $n$ multiplicaciones y $n-1$ sumas por término → $O(n^2)$

**Horner (factorización anidada):**

$$
P(x) = a_0 + x(a_1 + x(a_2 + \cdots + x(a_{n-1} + x\,a_n)\cdots))
$$

→ Solo $n$ multiplicaciones y $n$ sumas: $O(n)$

```
# Algoritmo de Horner
resultado ← a[n]
para i desde n-1 hasta 0:
    resultado ← resultado × x + a[i]
retornar resultado
```

:::tip Buenas prácticas
- Verificar siempre la condición de entrada (ej: cambio de signo para bisección).
- Establecer un máximo de iteraciones para evitar bucles infinitos.
- Reportar tanto el resultado como el error estimado y el número de iteraciones.
:::
