---
title: Fórmulas de Integración de Newton-Cotes
sidebar_label: "Cap. 21: Newton-Cotes"
sidebar_position: 1
---

# Capítulo 21: Fórmulas de Integración de Newton-Cotes

## Idea general

Las fórmulas de Newton-Cotes aproximan $\int_a^b f(x)\,dx$ reemplazando $f(x)$ por un **polinomio interpolante** de grado $n$ en $n+1$ puntos igualmente espaciados.

---

## 1. Regla del Trapecio (grado 1)

Aproxima $f$ por una línea recta entre $a$ y $b$:

$$
\int_a^b f(x)\,dx \approx \frac{b-a}{2}\left[f(a) + f(b)\right]
$$

**Error de truncamiento:**

$$
E_t = -\frac{(b-a)^3}{12}f''(\xi), \quad \xi \in (a,b)
$$

El error es $O(h^3)$ por segmento, o $O(h^2)$ por unidad de longitud.

### Regla del Trapecio Compuesta

Dividir $[a,b]$ en $n$ subintervalos de ancho $h = (b-a)/n$:

$$
\int_a^b f(x)\,dx \approx \frac{h}{2}\left[f(x_0) + 2\sum_{i=1}^{n-1}f(x_i) + f(x_n)\right]
$$

**Error compuesto:** $E_t = -\frac{(b-a)h^2}{12}f''(\xi) = O(h^2)$

---

## 2. Regla de Simpson 1/3 (grado 2)

Aproxima $f$ por una parábola en tres puntos igualmente espaciados:

$$
\int_a^b f(x)\,dx \approx \frac{b-a}{6}\left[f(a) + 4f\!\left(\frac{a+b}{2}\right) + f(b)\right]
$$

**Error de truncamiento:** $E_t = -\frac{(b-a)^5}{90}\cdot\frac{f^{(4)}(\xi)}{16}$

El error es $O(h^5)$ por segmento → **más preciso que el trapecio**.

### Simpson compuesto (n par)

$$
\int_a^b f\,dx \approx \frac{h}{3}\left[f_0 + 4f_1 + 2f_2 + 4f_3 + \cdots + 4f_{n-1} + f_n\right]
$$

**Error compuesto:** $O(h^4)$ — ¡mucho mejor que trapecio compuesto!

:::warning
Simpson 1/3 requiere un número **par** de subintervalos.
:::

---

## 3. Regla de Simpson 3/8 (grado 3)

Usa cuatro puntos (tres subintervalos):

$$
\int_a^b f\,dx \approx \frac{3h}{8}\left[f_0 + 3f_1 + 3f_2 + f_3\right]
$$

**Error:** $O(h^5)$, similar a Simpson 1/3 pero para número de segmentos múltiplo de 3.

---

## Comparativa

| Método | Grado | Error por segmento | Error compuesto |
|---|:---:|:---:|:---:|
| Trapecio | 1 | $O(h^3)$ | $O(h^2)$ |
| Simpson 1/3 | 2 | $O(h^5)$ | $O(h^4)$ |
| Simpson 3/8 | 3 | $O(h^5)$ | $O(h^4)$ |
| Boole | 4 | $O(h^7)$ | $O(h^6)$ |

---

## Ejemplo resuelto

**Calcular $\int_0^{\pi} \sin(x)\,dx$ (valor exacto = 2).**

Con $n = 4$ subintervalos, $h = \pi/4$:

| Método | Resultado | Error |
|---|:---:|:---:|
| Trapecio compuesto | 1.8961 | 5.2% |
| Simpson 1/3 compuesto | 2.0046 | 0.23% |

Simpson da un error ~23× menor con los mismos puntos.

---

## Error y refinamiento adaptativo

La integral se puede estimar con dos pasos:

$$
I = I_h + \frac{I_h - I_{2h}}{2^p - 1} + O(h^{p+2})
$$

donde $p$ es el orden del método. Esto es la base de la **extrapolación de Richardson** (Cap. 22).

:::tip Integración adaptativa
Usar subdivisiones más finas solo donde $f$ varía rápidamente. Esto reduce el número de evaluaciones de $f$ para una precisión dada.
:::
