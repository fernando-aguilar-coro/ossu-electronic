# Guía de Colaboración (AI-Assisted)

Esta guía explica cómo colaborar en la documentación usando la Inteligencia Artificial y las herramientas visuales para guardar tus cambios.

## 1. Instalación Rápida
1.  **Git**: [Descargar aquí](https://git-scm.com/)
2.  **Antigravity IDE**: Tu herramienta de trabajo.
3.  **Node.js**: [Descargar aquí](https://nodejs.org/)

## 2. Iniciar el Proyecto
Abre la terminal en Antigravity (`Ctrl + ñ`) y escribe:
```bash
git clone https://github.com/fernando-aguilar-coro/ossu-electronic.git
npm install
npm run start
```

## 3. Cómo Colaborar con la IA
Usa el chat de **Antigravity** para pedir cambios. No necesitas escribir código, solo explica lo que quieres en lenguaje natural.

**Ejemplo:** *"Antigravity, agrega el capítulo 5 sobre Bisección con este texto [pegar texto]"*.

---

## 4. Guardar y Enviar Cambios (Interfaz Visual)

En lugar de usar comandos difíciles, usa los botones de la interfaz:

### Paso 1: Crear una Rama (Tu espacio)
En la esquina inferior izquierda del IDE, haz clic donde dice `main` y selecciona **"Create new branch..."**. Ponle un nombre (ej: `nuevo-capitulo`).

### Paso 2: Guardar (Commit)
1.  Haz clic en el icono de **Source Control** (parece un diagrama con puntos) en la barra lateral izquierda.
2.  Escribe qué hiciste en el cuadro de texto (ej: "Agregué el método de bisección").
3.  Haz clic en el botón azul **"Commit"**.

### Paso 3: Subir (Push)
Haz clic en el botón **"Publish Branch"** o en las flechas de sincronización que aparecerán. Esto subirá tus cambios a internet.

### Paso 4: Solicitar Revisión (Pull Request)
1.  Entra a [GitHub: ossu-electronic](https://github.com/fernando-aguilar-coro/ossu-electronic).
2.  Verás un aviso amarillo que dice **"Compare & pull request"**. Haz clic ahí.
3.  Dale al botón verde **"Create pull request"** y ¡listo! El administrador revisará tu aporte.

---

## ✅ Beneficios de este método
*   **Sin errores**: Tus cambios no afectan el sitio principal hasta que sean revisados.
*   **Fácil**: Todo se hace con botones y lenguaje natural.
*   **Colaborativo**: Recibirás ayuda y comentarios del equipo.

---

## ⚡ Anexo: Resumen de Comandos (Terminal)

Si prefieres usar la terminal en lugar de botones, estos son los pasos equivalentes:

```bash
# 1. Asegurarte de estar al día
git pull origin main

# 2. Crear tu rama de trabajo
git checkout -b nombre-de-tu-rama

# 3. Guardar tus cambios (después de usar la IA)
git add .
git commit -m "Descripción de lo que hiciste"

# 4. Subir tus cambios
git push origin nombre-de-tu-rama
```
*Luego entra a GitHub para crear el Pull Request manualmente.*

