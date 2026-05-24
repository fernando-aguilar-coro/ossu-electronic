---
title: La Serie de Taylor y Errores de Truncamiento
sidebar_label: "Cap. 4: Serie de Taylor"
sidebar_position: 4
---

# Capítulo 4: La Serie de Taylor y Errores de Truncamiento

## La Serie de Taylor

La **serie de Taylor** es una de las herramientas matemáticas más potentes en el cálculo científico. Permite aproximar cualquier función matemática continua y infinitamente diferenciable ($f \in C^{\infty}$) en el entorno de un punto $x = a$ mediante un polinomio infinito de potencias:

$$
f(x) = f(a) + f'(a)(x-a) + \frac{f''(a)}{2!}(x-a)^2 + \frac{f'''(a)}{3!}(x-a)^3 + \cdots + \frac{f^{(n)}(a)}{n!}(x-a)^n + R_n(x)
$$

En notación sumatoria compacta:

$$
\boxed{f(x) = \sum_{n=0}^{\infty} \frac{f^{(n)}(a)}{n!}(x-a)^n}
$$

donde $f^{(n)}(a)$ denota la $n$-ésima derivada de la función evaluada en el punto de expansión $a$, y $0! \equiv 1$. 

:::note Serie de Maclaurin
Cuando el punto de aproximación se localiza en el origen de coordenadas ($a = 0$), la serie de Taylor recibe el nombre especial de **serie de Maclaurin**.
:::

---

## Formulación en función del tamaño de paso $h$

En los métodos de discretización de diferencias finitas, es común definir la distancia física o espacial entre el punto de aproximación $a$ y el punto de evaluación $x$ como el **tamaño de paso** $h = x - a$. 

Reescribiendo la serie de Taylor en términos de $h$, la aproximación para evaluar la función en el paso adelante $f(a+h)$ es:

$$
f(a+h) = f(a) + f'(a)h + \frac{f''(a)}{2!}h^2 + \frac{f'''(a)}{3!}h^3 + \cdots + \frac{f^{(n)}(a)}{n!}h^n + R_n
$$

### El término residual de Lagrange ($R_n$)
Al truncar la serie en el grado $n$, el error de truncamiento cometido se modela mediante el residuo de Lagrange, el cual captura toda la información de los infinitos términos descartados:

$$
\boxed{ R_n = \frac{f^{(n+1)}(\xi)}{(n+1)!} h^{n+1} } \quad \text{con } \xi \in [a, a+h]
$$

donde $\xi$ es un valor real (generalmente desconocido) que reside estrictamente en el intervalo cerrado entre el punto de expansión $a$ y el de evaluación $a+h$.

---

## Series de Maclaurin de Funciones Trascendentales

A continuación, se listan los desarrollos polinomiales de las funciones más representativas en la física teórica y computacional:

| Función $f(x)$ | Expansión en Serie de Maclaurin | Sumatoria Compacta | Dominio de Convergencia |
| :--- | :--- | :---: | :---: |
| **Exponencial** ($e^x$) | $1 + x + \dfrac{x^2}{2!} + \dfrac{x^3}{3!} + \cdots$ | $\sum_{n=0}^{\infty} \dfrac{x^n}{n!}$ | $x \in \mathbb{R}$ |
| **Seno** ($\sin x$) | $x - \dfrac{x^3}{3!} + \dfrac{x^5}{5!} - \cdots$ | $\sum_{n=0}^{\infty} (-1)^n \dfrac{x^{2n+1}}{(2n+1)!}$ | $x \in \mathbb{R}$ |
| **Coseno** ($\cos x$) | $1 - \dfrac{x^2}{2!} + \dfrac{x^4}{4!} - \cdots$ | $\sum_{n=0}^{\infty} (-1)^n \dfrac{x^{2n}}{(2n)!}$ | $x \in \mathbb{R}$ |
| **Logaritmo** ($\ln(1+x)$) | $x - \dfrac{x^2}{2} + \dfrac{x^3}{3} - \cdots$ | $\sum_{n=1}^{\infty} (-1)^{n-1} \dfrac{x^n}{n}$ | $x \in (-1, 1]$ |
| **Fracción** ($\dfrac{1}{1-x}$) | $1 + x + x^2 + x^3 + \cdots$ | $\sum_{n=0}^{\infty} x^n$ | $x \in (-1, 1)$ |

---

## Análisis del Error de Truncamiento

Cuando truncamos la serie de Taylor para conservar únicamente un polinomio de grado $n$, el error de truncamiento absoluto $E_t$ es proporcional a la potencia del paso siguiente, denotado algebraicamente mediante la notación de Landau (O-grande):

$$
E_t = \mathcal{O}(h^{n+1})
$$

### Caso práctico: Aproximar $e^{0.5}$ mediante serie de Maclaurin ($a=0$)
El valor exacto analítico del término exponencial es $e^{0.5} \approx 1.6487212707$. La siguiente tabla ilustra el comportamiento de convergencia asintótica al incorporar términos sucesivos de la serie:

| Términos ($N$) | Grado del Polinomial | Aproximación Calculada | Error Absoluto ($E_t$) | Error Relativo ($\varepsilon_t$) |
| :---: | :---: | :---: | :---: | :---: |
| 1 | 0 | $1.0000000$ | $0.6487213$ | $39.35\%$ |
| 2 | 1 | $1.5000000$ | $0.1487213$ | $9.02\%$ |
| 3 | 2 | $1.6250000$ | $0.0237213$ | $1.44\%$ |
| 4 | 3 | $1.6458333$ | $0.0028879$ | $0.17\%$ |
| 5 | 4 | $1.6484375$ | $0.0002838$ | $0.017\%$ |
| 6 | 5 | $1.6486979$ | $0.0000234$ | $0.0014\%$ |
| 7 | 6 | $1.6487196$ | $0.0000017$ | $0.00010\%$ |

**Conclusión:** Cada término adicional en la serie de potencias incrementa la precisión en aproximadamente un orden de magnitud, exhibiendo un comportamiento de **convergencia exponencial** para puntos cercanos al origen.

---

## Deducción de Fórmulas de Diferencias Finitas

La serie de Taylor constituye la piedra angular matemática para derivar los esquemas numéricos de diferenciación que emplean los solucionadores de EDOs y EDPs.

### 1. Diferencia Dividida hacia Adelante (Primer Orden, $\mathcal{O}(h)$)
Si expandimos la función un paso temporal $h$ adelante:
$$
f(x+h) = f(x) + f'(x)h + \frac{f''(\xi)}{2!}h^2
$$

Despejando la primera derivada $f'(x)$:
$$
f'(x) = \frac{f(x+h) - f(x)}{h} - \frac{f''(\xi)}{2!}h
$$

Asumiendo que la segunda derivada $f''$ está acotada en el entorno analizado, agrupamos el residuo:
$$
\boxed{ f'(x) = \frac{f(x+h) - f(x)}{h} + \mathcal{O}(h) }
$$

Este esquema estima la pendiente física basándose únicamente en el punto actual y el paso siguiente. Su error decae linealmente con el tamaño del paso $h$.

### 2. Diferencia Dividida Centrada (Segundo Orden, $\mathcal{O}(h^2)$)
Para obtener un esquema más exacto y simétrico, combinamos la serie de Taylor un paso hacia adelante y un paso hacia atrás:
$$
\begin{aligned}
(1) \quad f(x+h) &= f(x) + f'(x)h + \frac{f''(x)}{2!}h^2 + \frac{f'''(\xi_1)}{3!}h^3 \\
(2) \quad f(x-h) &= f(x) - f'(x)h + \frac{f''(x)}{2!}h^2 - \frac{f'''(\xi_2)}{3!}h^3
\end{aligned}
$$

Restando algebraicamente la ecuación (2) de la ecuación (1) se cancelan simétricamente los términos de segundo orden ($h^2$):
$$
f(x+h) - f(x-h) = 2f'(x)h + \frac{f'''(\xi_1) + f'''(\xi_2)}{6}h^3
$$

Despejando $f'(x)$:
$$
f'(x) = \frac{f(x+h) - f(x-h)}{2h} - \left[ \frac{f'''(\xi_1) + f'''(\xi_2)}{12} \right]h^2
$$

Agrupando el residuo cúbico:
$$
\boxed{ f'(x) = \frac{f(x+h) - f(x-h)}{2h} + \mathcal{O}(h^2) }
$$

Debido a la cancelación de términos pares, el esquema centrado posee una precisión superior de **segundo orden** $\mathcal{O}(h^2)$. Si reducimos el paso $h$ a la mitad, el error de truncamiento se reduce a la cuarta parte ($1/4$).

---

## El Teorema del Valor Medio para Derivadas

El **Teorema del Valor Medio** (TVM) es un caso fundamental de la serie de Taylor de primer orden (con $n=0$ y residuo). Formalmente establece que si una función $f$ es continua en el intervalo cerrado $[a, b]$ y diferenciable en el abierto $(a, b)$, entonces existe al menos un punto $\xi \in (a, b)$ tal que:

$$
f(b) = f(a) + f'(\xi)(b-a)
$$

O equivalentemente, expresado en términos de la pendiente:

$$
\boxed{ f'(\xi) = \frac{f(b) - f(a)}{b - a} }
$$

Esto garantiza de forma exacta que la derivada instantánea de la curva en el punto $\xi$ es numéricamente igual a la pendiente promedio de la línea secante que conecta los extremos de la función en el intervalo.

---

## Impacto Teórico del Orden de un Método Numérico

El **orden matemático de convergencia** ($p$) define de qué manera el error total decae conforme disminuye de forma sistemática el paso temporal o espacial $h$:

$$
E(h) \approx C \cdot h^p \implies E = \mathcal{O}(h^p)
$$

A continuación, se detalla el comportamiento teórico de los algoritmos numéricos estructurados en los capítulos avanzados:

| Método Numérico | Familia de Aplicación | Orden Teórico ($p$) | Magnitud del Error con $h = 0.1$ |
| :--- | :---: | :---: | :---: |
| **Euler Adelante** | Ecuaciones Diferenciales (EDO) | $\mathcal{O}(h)$ | $\sim 10^{-1}$ |
| **Heun / Runge-Kutta 2** | Ecuaciones Diferenciales (EDO) | $\mathcal{O}(h^2)$ | $\sim 10^{-2}$ |
| **Diferencias Centradas** | Diferenciación Numérica | $\mathcal{O}(h^2)$ | $\sim 10^{-2}$ |
| **Regla del Trapecio** | Integración Numérica | $\mathcal{O}(h^2)$ | $\sim 10^{-2}$ |
| **Runge-Kutta Clásico (RK4)**| Ecuaciones Diferenciales (EDO) | $\mathcal{O}(h^4)$ | $\sim 10^{-4}$ |
| **Regla de Simpson 1/3** | Integración Numérica | $\mathcal{O}(h^4)$ | $\sim 10^{-4}$ |
| **Extrapolación de Richardson** | Aceleración de Convergencia | $\mathcal{O}(h^4)$ | $\sim 10^{-4}$ |

:::tip Pensamiento Algorítmico
Elegir un método de alto orden (como RK4) permite utilizar pasos de discretización mucho más grandes ($h$) para alcanzar la misma tolerancia que un método rudimentario (como Euler). Esto se traduce en menos pasos de cálculo y una menor acumulación global de errores de redondeo en el CPU.
:::
