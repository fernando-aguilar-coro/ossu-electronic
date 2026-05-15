---
id: introduccion
title: La Serie de Taylor y Errores de Truncamiento
sidebar_label: Introducción
sidebar_position: 1
---

# Capítulo 4: La Serie de Taylor y Errores de Truncamiento

## La Serie de Taylor

La **serie de Taylor** expresa una función suave $f(x)$ alrededor de un punto $x = a$ como una suma infinita de términos polinomiales:

$$
f(x) = f(a) + f'(a)(x-a) + \frac{f''(a)}{2!}(x-a)^2 + \frac{f'''(a)}{3!}(x-a)^3 + \cdots
$$

En notación compacta:

$$
\boxed{f(x) = \sum_{n=0}^{\infty} \frac{f^{(n)}(a)}{n!}(x-a)^n}
$$

Cuando $a = 0$, se llama **serie de Maclaurin**.

---

## Forma con paso $h$

Definiendo $h = x - a$ (el "paso" adelante desde $a$):

$$
f(a+h) = f(a) + f'(a)\,h + \frac{f''(a)}{2!}h^2 + \frac{f'''(a)}{3!}h^3 + \cdots + R_n
$$

donde el **término residual** (error de truncamiento) es:

$$
R_n = \frac{f^{(n+1)}(\xi)}{(n+1)!}\,h^{n+1}, \quad \xi \in (a,\, a+h)
$$

---

## Series de Taylor importantes

| Función | Expansión de Maclaurin |
|---|---|
| $e^x$ | $1 + x + \dfrac{x^2}{2!} + \dfrac{x^3}{3!} + \cdots$ |
| $\sin x$ | $x - \dfrac{x^3}{3!} + \dfrac{x^5}{5!} - \cdots$ |
| $\cos x$ | $1 - \dfrac{x^2}{2!} + \dfrac{x^4}{4!} - \cdots$ |
| $\ln(1+x)$ | $x - \dfrac{x^2}{2} + \dfrac{x^3}{3} - \cdots \quad (\vert x \vert < 1)$ |
| $\dfrac{1}{1-x}$ | $1 + x + x^2 + x^3 + \cdots \quad (\vert x \vert < 1)$ |

---

## Error de truncamiento

Al usar solo los primeros $n+1$ términos, el **error de truncamiento** es del orden $O(h^{n+1})$:

$$
E_t = O(h^{n+1}) = \frac{f^{(n+1)}(\xi)}{(n+1)!}\,h^{n+1}
$$

### Ejemplo: Aproximar $e^{0.5}$ con la serie de Maclaurin

Valor exacto: $e^{0.5} = 1.64872...$

| Términos usados | Aproximación | $\varepsilon_t$ |
|:---:|:---:|:---:|
| 1 (solo $1$) | 1.0000 | 39.3% |
| 2 ($1 + x$) | 1.5000 | 9.0% |
| 3 ($+ x^2/2$) | 1.6250 | 1.4% |
| 4 ($+ x^3/6$) | 1.6458 | 0.17% |
| 5 ($+ x^4/24$) | 1.6484 | 0.017% |

Cada término extra reduce el error ~10×: convergencia **superlineal**.

---

## Conexión con las diferencias finitas

La serie de Taylor es la base para derivar las **fórmulas de diferencias finitas** (Cap. 23).

### Diferencia hacia adelante (orden 1)

De la expansión:

$$
f(x+h) = f(x) + f'(x)h + \frac{f''(\xi)}{2}h^2
$$

Despejando $f'(x)$:

$$
f'(x) = \frac{f(x+h) - f(x)}{h} - \underbrace{\frac{f''(\xi)}{2}h}_{O(h)}
$$

El error es $O(h)$: la precisión mejora linealmente al reducir $h$.

### Diferencia centrada (orden 2)

Combinando la expansión hacia adelante y hacia atrás:

$$
f'(x) = \frac{f(x+h) - f(x-h)}{2h} - \underbrace{\frac{f'''(\xi)}{6}h^2}_{O(h^2)}
$$

El error es $O(h^2)$: mucho más preciso al reducir $h$.

---

## El teorema del valor medio

El **Teorema del Valor Medio** es un caso especial de la serie de Taylor (solo el primer término con residuo):

$$
f(b) = f(a) + f'(\xi)(b-a), \quad \xi \in (a, b)
$$

Esto garantiza que la derivada toma todos los valores entre $f'(a)$ y $f'(b)$.

---

## Orden de un método numérico

El **orden** de un método numérico indica cómo varía el error con el tamaño del paso $h$:

$$
\text{Método de orden } p \implies E = O(h^p)
$$

| Método | Orden |
|---|:---:|
| Euler | $O(h)$ |
| Runge-Kutta 2 | $O(h^2)$ |
| Runge-Kutta 4 | $O(h^4)$ |
| Trapecio (integración) | $O(h^2)$ |
| Simpson 1/3 | $O(h^4)$ |

:::tip
Duplicar el orden del método es equivalente a usar pasos mucho más pequeños. Un método $O(h^4)$ con $h=0.1$ da un error comparable a un método $O(h^2)$ con $h \approx 0.01$.
:::
