---
id: introduccion
title: Valores en la Frontera y Valores Propios
sidebar_label: Introducción
sidebar_position: 1
---

# Capítulo 27: Problemas de Valores en la Frontera y Valores Propios

## Problemas de Valor en la Frontera (BVP)

A diferencia de los PVI, en un **BVP** las condiciones se especifican en **ambos extremos** del intervalo de integración:

$$
y'' = f(x, y, y'), \quad y(a) = \alpha, \quad y(b) = \beta
$$

---

## 1. Método de Disparo (Shooting Method)

Convierte el BVP en un Problema de Valor Inicial (PVI) ajustando iterativamente la pendiente inicial "desconocida" hasta que la solución pase por el punto final deseado.

**Procedimiento:**
1. Asumir una pendiente inicial $y'(a) = z_k$
2. Resolver el PVI usando RK4 para obtener $y(b, z_k)$
3. Evaluar la discrepancia: $g(z_k) = y(b, z_k) - \beta$
4. Usar un método de búsqueda de raíces (como la Secante) para encontrar el siguiente $z_{k+1}$ tal que $g(z) = 0$

$$
z_{k+1} = z_k - \frac{g(z_k)(z_k - z_{k-1})}{g(z_k) - g(z_{k-1})}
$$

---

## 2. Método de Diferencias Finitas

Discretiza el dominio en $n$ segmentos de ancho $h = (b-a)/n$ y reemplaza las derivadas por aproximaciones de diferencias finitas centradas.

Para una EDO lineal de la forma $y'' + p(x)y' + q(x)y = r(x)$:

$$
\frac{y_{i-1} - 2y_i + y_{i+1}}{h^2} + p_i \frac{y_{i+1} - y_{i-1}}{2h} + q_i y_i = r_i
$$

Agrupando términos para cada nodo interno $i = 1, \ldots, n-1$:

$$
\underbrace{\left(1 - \frac{h}{2}p_i\right)}_{a_i} y_{i-1} + \underbrace{\left(-2 + h^2 q_i\right)}_{b_i} y_i + \underbrace{\left(1 + \frac{h}{2}p_i\right)}_{c_i} y_{i+1} = \underbrace{h^2 r_i}_{d_i}
$$

Esto genera un **sistema tridiagonal** que se resuelve eficientemente con el algoritmo de Thomas.

---

## 3. Problemas de Valores Propios (Eigenvalues)

Problemas donde la solución solo existe para ciertos valores especiales de un parámetro $\lambda$. En forma matricial:

$$
[A]\{x\} = \lambda \{x\} \implies ([A] - \lambda[I])\{x\} = \{0\}
$$

### Método de la Potencia

Se utiliza para encontrar el valor propio dominante (el de mayor magnitud).

1. Elegir un vector inicial $\{x\}_0$
2. Iterar: $\{y\}_{k+1} = [A]\{x\}_k$
3. Extraer el valor máximo de $\{y\}_{k+1}$ como estimación de $\lambda$
4. Normalizar: $\{x\}_{k+1} = \{y\}_{k+1} / \lambda_{k+1}$

Converge a $\lambda_{max}$ y al vector propio asociado.

### Método de la Potencia Inversa

Aplica el método de la potencia a $[A]^{-1}$ para encontrar el valor propio de **menor** magnitud:

$$
[A]\{x\} = \lambda \{x\} \implies [A]^{-1}\{x\} = \frac{1}{\lambda} \{x\}
$$

---

## Aplicaciones en ingeniería

| Problema | Tipo | Significado físico |
|---|---|---|
| Deflexión de vigas | BVP | Perfil de deformación bajo carga |
| Transferencia de calor | BVP | Perfil de temperatura en estado estable |
| Vibraciones libres | Valores Propios | Frecuencias naturales y modos |
| Pandeo de columnas | Valores Propios | Carga crítica de fallo estructural |

:::tip
El método de diferencias finitas es generalmente más estable que el de disparo para sistemas grandes o problemas "rígidos" (stiff).
:::
