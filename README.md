# taskflow

Gestor de tareas minimalista con Next.js + Google Sheets como base de datos.

## Stack

- **Next.js 14** (App Router)
- **Tailwind CSS** — diseño oscuro, sin librerías de UI
- **dnd-kit** — drag & drop para reordenar prioridades
- **Google Sheets API** — base de datos

---

## Setup en 5 pasos

### 1. Instalá dependencias

```bash
npm install
```

### 2. Creá un proyecto en Google Cloud

1. Andá a [console.cloud.google.com](https://console.cloud.google.com)
2. Creá un proyecto nuevo (o usá uno existente)
3. Habilitá la **Google Sheets API**:
   - Buscá "Google Sheets API" en la barra de búsqueda
   - Click en "Habilitar"

### 3. Creá un Service Account

1. En Google Cloud → IAM y administración → **Cuentas de servicio**
2. Click en **Crear cuenta de servicio**
3. Nombre: `taskflow` (o el que quieras)
4. Click en **Crear y continuar** → **Listo**
5. Click en la cuenta de servicio creada → pestaña **Claves**
6. **Agregar clave** → **Crear clave nueva** → **JSON**
7. Se descarga un archivo `.json` — guardalo, lo necesitás en el paso 5

### 4. Creá el Google Sheet

1. Andá a [sheets.google.com](https://sheets.google.com) y creá un spreadsheet nuevo
2. Renombrá la hoja a **`Tasks`** (exactamente así, con mayúscula)
3. Copiá el **ID** de la URL:
   ```
   https://docs.google.com/spreadsheets/d/[ESTE_ES_EL_ID]/edit
   ```
4. Compartí el spreadsheet con el **email del service account** (está en el JSON, campo `client_email`):
   - Click en **Compartir** → pegá el email → permiso **Editor** → **Enviar**

### 5. Configurá las variables de entorno

Copiá el archivo de ejemplo:

```bash
cp .env.local.example .env.local
```

Editá `.env.local`:

```env
SPREADSHEET_ID=tu_spreadsheet_id_aqui
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
```

Para el JSON del service account, abrí el archivo descargado, copiá **todo el contenido** y pegalo como una sola línea (sin saltos de línea) en el valor de `GOOGLE_SERVICE_ACCOUNT_JSON`.

> **Tip**: en macOS/Linux podés hacer `cat credentials.json | tr -d '\n'` para obtenerlo en una línea.

### 6. Corré la app

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000)

---

## Uso

| Acción | Cómo |
|---|---|
| Agregar tarea | Escribí en el input y presioná **Enter** |
| Cambiar estado | Click en el badge de estado (cicla: pendiente → finalizado → suspendido → pendiente) |
| Reordenar | Arrastrá desde el ícono de puntos de la izquierda |
| Eliminar | Hover sobre la tarea → click en la **×** de la derecha |
| Filtrar | Usá los botones de arriba de la lista |

---

## Estructura del proyecto

```
src/
├── app/
│   ├── api/
│   │   └── tasks/
│   │       ├── route.ts          # GET, POST
│   │       ├── [id]/route.ts     # PATCH, DELETE
│   │       └── reorder/route.ts  # POST reorder
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                  # UI principal
├── components/
│   ├── FilterBar.tsx
│   ├── StatusBadge.tsx
│   ├── TaskInput.tsx
│   ├── TaskItem.tsx
│   └── TaskList.tsx
├── lib/
│   └── sheets.ts                 # Toda la lógica de Google Sheets
└── types/
    └── index.ts
```

## Estructura del Google Sheet

La app espera una hoja llamada `Tasks` con estas columnas (se inicializan solas):

| A | B | C | D | E |
|---|---|---|---|---|
| id | title | status | priority | createdAt |
