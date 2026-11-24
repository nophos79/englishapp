# Quickstart & Validation Guide: EnglishApp (`001-primary-english-practice`)

Esta guía describe cómo levantar, configurar y validar de extremo a extremo la aplicación una vez implementada.

## 1. Prerrequisitos

- **Node.js 20+** y **npm** (instalados en el entorno).
- Un proyecto en **Supabase** (plan gratuito; 2º proyecto permitido en tu cuenta).

## 2. Configuración inicial de Supabase

1. En el panel de Supabase (**SQL Editor**), ejecuta el script [contracts/supabase-schema.sql](./contracts/supabase-schema.sql) para crear las tablas, políticas RLS *append-only* y funciones RPC de PIN parental.
2. En **Authentication → Providers**, verifica que **Email** esté habilitado.
3. Crea un archivo `.env.local` en la raíz del repositorio con tus credenciales públicas:
   ```env
   VITE_SUPABASE_URL=https://<tu-proyecto>.supabase.co
   VITE_SUPABASE_ANON_KEY=<tu-anon-key>
   ```
   *(Nunca subas `.env.local` a Git).*

## 3. Arranque y tests locales

```bash
npm install
npm run test          # Ejecuta Vitest (dominio, anti-trampas, generador de exámenes y validación Zod del currículo)
npm run dev           # Levanta la PWA en local
npm run build         # Compila bundle de producción + Service Worker PWA
npm run test:e2e      # Ejecuta escenarios end-to-end con Playwright
```

## 4. Escenarios de validación end-to-end

1. **Setup Padre + PIN + múltiples Alumnos (US1)**:
   - Inicia sesión con el email/contraseña del Padre, crea un PIN de 4 dígitos y da de alta dos alumnos (ej. 3º y 5º de Primaria).
   - Activa únicamente `Starter`, `SA 1` y `SA 2` del 1er Trimestre para el alumno de 5º.
   - Verifica que en el Perfil Alumno las SA aparecen en orden escolar exacto y las SA 3–6 muestran candado y no se pueden abrir.
   - Intenta entrar en la Zona Padres con PIN incorrecto y comprueba que se bloquea el acceso.
2. **Práctica anti-trampas (US2)**:
   - Abre `SA 1` como Alumno. Verifica que no existe opción de ver la solución antes de contestar.
   - Envía una respuesta incorrecta: verifica que queda bloqueada (no editable), muestra la respuesta correcta + explicación en español y se añade a la cola de errores.
   - Repite la SA y comprueba que el orden de preguntas/opciones cambia y ambos intentos aparecen en el historial del Padre.
3. **Generación, realización y abandono de examen (US3)**:
   - Desde la Zona Padres (incluso en otro navegador/dispositivo con la misma cuenta familiar), genera un examen de 10 preguntas combinando `SA 1` + `SA 2`.
   - En el Perfil Alumno, inicia el examen: comprueba que los bancos de consulta están bloqueados y que no se muestran soluciones durante la prueba.
   - Recarga la página a mitad del examen y verifica que se reanuda en el mismo punto sin borrar respuestas previas.
   - Entrega el examen: el Alumno ve su nota y revisión de fallos con el intento cerrado; el Padre ve el desglose completo pregunta a pregunta en su panel.
   - Crea un segundo examen y abandónalo a mitad: verifica que aparece como `Abandonado` con fecha/hora en el panel del Padre.
4. **Inmutabilidad y modo offline (US6)**:
   - Desconecta la red en las herramientas de desarrollador del navegador, completa una sesión de práctica y verifica que se encola localmente sin errores.
   - Reconecta la red y confirma que el intento aparece sincronizado en Supabase y en el panel del Padre sin duplicados.
   - Limpia el almacenamiento del navegador en la tablet, vuelve a iniciar sesión con la cuenta familiar y confirma que todo el historial de intentos permanece intacto.
