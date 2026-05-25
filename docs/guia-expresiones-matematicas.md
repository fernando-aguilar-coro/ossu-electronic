---
title: Guía de Expresiones Matemáticas
sidebar_label: "Guía: Expresiones Matemáticas"
sidebar_position: 100
---

# Guía de Expresiones Matemáticas (math.js)

Todos los simuladores interactivos de esta plataforma (Buscadores de raíces, Optimización, Interpolación e Integración Numérica) utilizan la potente biblioteca matemática **math.js** bajo el capó para interpretar y evaluar tus funciones de forma rápida y segura.

A continuación, se detalla qué operadores, constantes y funciones científicas puedes utilizar al escribir tus expresiones matemáticas.

---

## 1. Operadores Básicos

Puedes combinar tus variables y números con los operadores aritméticos estándar:

| Operador | Significado | Ejemplo | Notas |
| :---: | :--- | :--- | :--- |
| `+` | Suma | `x + 5` | |
| `-` | Resta / Negación | `x - 3` o `-x` | |
| `*` | Multiplicación | `2 * x` | **Se recomienda multiplicación explícita** con `*` para evitar errores. |
| `/` | División | `x / 2` | |
| `^` | Potenciación | `x^2` o `e^x` | Eleva a una potencia. |
| `%` | Módulo (Resto) | `x % 2` | Devuelve el resto de la división. |

---

## 2. Constantes Incorporadas

Puedes utilizar constantes científicas directamente en tus expresiones sin necesidad de escribir su aproximación numérica:

| Constante | Descripción | Ejemplo | Valor Aproximado |
| :---: | :--- | :--- | :--- |
| `pi` | Número Pi ($\pi$) | `sin(pi / 2)` | `3.141592653589793` |
| `e` | Número de Euler ($e$) | `e^(-x)` | `2.718281828459045` |
| `i` | Unidad Imaginaria ($i$) | `3 + 2*i` | $\sqrt{-1}$ (usado en análisis complejo) |
| `phi` | Razón Áurea ($\phi$) | `1 + phi` | `1.618033988749895` |

---

## 3. Funciones Matemáticas Comunes

### 📐 Trigonometría
**Importante**: Las funciones trigonométricas operan en **radianes**.

- `sin(x)`: Seno de $x$.
- `cos(x)`: Coseno de $x$.
- `tan(x)`: Tangente de $x$.
- `sec(x)`: Secante de $x$ ($1/\cos(x)$).
- `csc(x)`: Cosecante de $x$ ($1/\sin(x)$).
- `cot(x)`: Cotangente de $x$ ($1/\tan(x)$).

### 🔄 Funciones Trigonométricas Inversas
- `asin(x)`: Arco seno de $x$.
- `acos(x)`: Arco coseno de $x$.
- `atan(x)`: Arco tangente de $x$.

### 📈 Funciones Hiperbólicas
- `sinh(x)`: Seno hiperbólico.
- `cosh(x)`: Coseno hiperbólico.
- `tanh(x)`: Tangente hiperbólica.

### 🪵 Logaritmos y Exponenciales
- `exp(x)`: Exponencial natural ($e^x$). Equivale a escribir `e^x`.
- `ln(x)` o `log(x)`: Logaritmo natural en base $e$ ($\ln(x)$).
- `log10(x)`: Logaritmo común en base 10 ($\log_{10}(x)$).
- `log2(x)`: Logaritmo en base 2 ($\log_2(x)$).

### 🧮 Otras Funciones de Utilidad
- `sqrt(x)`: Raíz cuadrada de $x$ ($\sqrt{x}$). Equivale a `x^0.5`.
- `cbrt(x)`: Raíz cúbica de $x$ ($\sqrt[3]{x}$). Equivale a `x^(1/3)`.
- `abs(x)`: Valor absoluto de $x$ ($|x|$).
- `sign(x)`: Signo de $x$ (devuelve `-1` si es negativo, `0` si es cero, `1` si es positivo).

---

## 💡 Consejos Prácticos para el Ingreso de Expresiones

1. **Usa multiplicación explícita (`*`)**:
   - En lugar de `2x`, escribe **`2 * x`**.
   - En lugar de `x sin(x)`, escribe **`x * sin(x)`**.
   
2. **Paréntesis para Fracciones y Potencias**:
   - En potencias complejas, agrupa con paréntesis. Por ejemplo, para escribir la raíz cúbica de $x$ como potencia de exponente fraccionario, escribe **`x^(1/3)`**. Si escribes `x^1/3`, `math.js` lo interpretará como $\frac{x^1}{3}$.
   - Para expresiones en el denominador, escribe **`1 / (x + 2)`** en lugar de `1 / x + 2` (lo cual equivale a $\frac{1}{x} + 2$).

3. **Uso de Minúsculas**:
   - Todas las funciones y constantes deben escribirse en **minúsculas** (`sin(x)`, `pi`, `e`, `sqrt(x)`). Escribir `SIN(x)` o `Pi` causará un error de evaluación.

---