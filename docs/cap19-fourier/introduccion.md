---
id: introduccion
title: Aproximación de Fourier
sidebar_label: Introducción
sidebar_position: 1
---

# Capítulo 19: Aproximación de Fourier

## Series de Fourier

Una función periódica $f(t)$ con período $T$ puede representarse como suma de sinusoides:

$$
f(t) = \frac{a_0}{2} + \sum_{n=1}^{\infty}\left[a_n\cos\!\left(\frac{2\pi n t}{T}\right) + b_n\sin\!\left(\frac{2\pi n t}{T}\right)\right]
$$

### Coeficientes de Fourier

$$
a_n = \frac{2}{T}\int_0^T f(t)\cos\!\left(\frac{2\pi n t}{T}\right)dt, \quad n = 0, 1, 2, \ldots
$$

$$
b_n = \frac{2}{T}\int_0^T f(t)\sin\!\left(\frac{2\pi n t}{T}\right)dt, \quad n = 1, 2, 3, \ldots
$$

---

## Espectro de amplitudes y fases

Cada armónico $n$ tiene amplitud $C_n$ y fase $\phi_n$:

$$
C_n = \sqrt{a_n^2 + b_n^2}, \quad \phi_n = -\arctan\!\left(\frac{b_n}{a_n}\right)
$$

El **espectro de amplitudes** ($C_n$ vs $n$) muestra qué frecuencias dominan la señal.

---

## DFT: Transformada Discreta de Fourier

Para $N$ datos igualmente espaciados $f_j = f(j\Delta t)$, $j = 0,\ldots,N-1$:

$$
F_k = \sum_{j=0}^{N-1} f_j\, e^{-i2\pi jk/N}, \quad k = 0, 1, \ldots, N-1
$$

Los coeficientes de Fourier se recuperan como:

$$
a_k = \frac{2\,\text{Re}(F_k)}{N}, \quad b_k = \frac{-2\,\text{Im}(F_k)}{N}
$$

---

## FFT: Transformada Rápida de Fourier

La DFT directa requiere $O(N^2)$ operaciones. El **algoritmo de Cooley-Tukey** (FFT) reduce esto a:

$$
O(N \log_2 N)
$$

Funciona cuando $N$ es potencia de 2 (decimation-in-time).

| $N$ | DFT: $N^2$ ops | FFT: $N\log_2 N$ ops | Factor de aceleración |
|:---:|:---:|:---:|:---:|
| 1024 | 1,048,576 | 10,240 | **102×** |
| 65536 | $4.3\times10^9$ | 1,048,576 | **4096×** |

---

## Fenómeno de Gibbs

Al aproximar una función con **discontinuidades** (ej: onda cuadrada) con un número finito de armónicos, aparecen oscilaciones cerca de las discontinuidades. La sobreoscilación máxima converge a $\approx 9\%$ del salto, sin importar cuántos términos se usen.

```
Señal real:    _______________
               |             |
               |             |___________

Serie Fourier: /‾‾‾‾‾‾‾‾‾‾‾\
              /              \     ← oscilaciones de Gibbs
_____________/                \___________
```

---

## Aplicaciones en ingeniería

| Aplicación | Uso de Fourier |
|---|---|
| Análisis de vibraciones | Identificar frecuencias naturales |
| Procesamiento de señales | Filtrado en dominio de frecuencia |
| Análisis de circuitos | Respuesta en frecuencia |
| Procesamiento de imágenes | Compresión (JPEG usa DCT) |
| Mecánica de fluidos | Análisis espectral de turbulencia |

:::tip Frecuencia de Nyquist
Para representar correctamente una señal con componente de frecuencia máxima $f_{max}$, la frecuencia de muestreo debe ser al menos $2f_{max}$ (Teorema de Shannon-Nyquist). Si no, ocurre **aliasing** (las altas frecuencias se "disfrazan" de bajas).
:::
