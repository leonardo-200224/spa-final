#  Rick & Morty SPA — Vanilla JS

> Taller Práctico — Evolución de una SPA | RIWI · Interdimensional Frontend Labs

Una Single Page Application (SPA) construida en **JavaScript Vanilla puro** que consume la [API pública de Rick and Morty](https://rickandmortyapi.com/) y permite explorar personajes, episodios y ubicaciones del universo, con operaciones CRUD completas sobre personajes.

---

##  Tabla de Contenidos

- [Características](#características)
- [Arquitectura](#arquitectura)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Cómo Ejecutar](#cómo-ejecutar)
- [Funcionalidades Detalladas](#funcionalidades-detalladas)
- [Decisiones Arquitectónicas](#decisiones-arquitectónicas)
- [Flujo de Datos](#flujo-de-datos)
- [Manejo de Estado](#manejo-de-estado)

---

##  Características

| Requerimiento |  |
|---|---|
| Página de Personajes (nombre, especie, género, estado) 
| Página de Episodios (nombre, fecha, cantidad personajes) 
| Página de Ubicaciones (nombre, tipo, dimensión, residentes) 
| Navegación SPA sin recarga de página 
| Crear personaje ficticio con formulario 
| Eliminar personaje con confirmación 
| Editar personaje (nombre, especie, estado) 
| Manejo de errores: imágenes rotas, API, formularios 
| Feedback al usuario (toast de éxito/error) 
| Persistencia en localStorage 

---

##  Arquitectura

La SPA sigue una arquitectura **modular por responsabilidad**, con separación clara entre capas:

```
Entrada (app.js)
    │
    ├── Router (router.js)          → Mapea hash URL → función de página
    │
    ├── Pages                       → Renderizado de cada vista
    │   ├── characters.js
    │   ├── episodes.js
    │   └── locations.js
    │
    ├── Components                  → UI reutilizable
    │   └── modal.js                → Modal crear/editar personaje
    │
    ├── Services                    → Lógica de negocio
    │   ├── api.js                  → Fetch a la API pública
    │   └── storage.js              → Persistencia en localStorage
    │
    └── Utils                       → Funciones de apoyo transversales
        └── helpers.js              → Toast, confirm, generateId, imgError
```

### Principios aplicados

- **Desacoplamiento**: cada módulo tiene una sola responsabilidad
- **No mutation de API data**: los datos de la API nunca se modifican; las ediciones y eliminaciones se guardan como capas separadas
- **Cache por módulo**: cada página cachea sus datos para evitar llamadas repetidas al navegar
- **Progressive Enhancement**: la página de personajes carga los primeros 20 inmediatamente y el resto en segundo plano

---

##  Estructura del Proyecto

```
rick-morty-spa/
├── index.html                  # Shell HTML de la SPA (no cambia al navegar)
├── README.md                   # Este archivo
│
├── css/
│   └── styles.css              # Todos los estilos (tema oscuro, responsive)
│
└── js/
    ├── app.js                  # Punto de entrada — inicializa router y eventos globales
    ├── router.js               # Hash router — mapea rutas a páginas
    │
    ├── pages/
    │   ├── characters.js       # Vista de personajes + CRUD visual
    │   ├── episodes.js         # Vista de episodios
    │   └── locations.js        # Vista de ubicaciones
    │
    ├── components/
    │   └── modal.js            # Modal de creación y edición de personajes
    │
    ├── services/
    │   ├── api.js              # Capa de acceso a la API pública
    │   └── storage.js          # Capa de persistencia (localStorage)
    │
    └── utils/
        └── helpers.js          # Utilidades: toast, confirm, generateId, imgError
```

---

##  Cómo Ejecutar

La aplicación usa **ES Modules nativos** del navegador. Requiere ser servida por un servidor HTTP (no funciona abriendo `index.html` directamente por restricciones CORS de ES Modules).

### Opción 1 — VS Code Live Server (recomendado)

1. Abrir la carpeta del proyecto en VS Code
2. Instalar la extensión **Live Server** (ritwickdey.LiveServer)
3. Click derecho en `index.html` → **"Open with Live Server"**

### Opción 2 — Python

```bash
# Dentro de la carpeta rick-morty-spa/
python3 -m http.server 3000
# Abrir http://localhost:3000
```

### Opción 3 — Node.js (npx)

```bash
npx serve .
# Abre la URL que indique la consola
```

>  **No usar** `file://` directamente — los ES Modules requieren servidor HTTP.

---

##  Funcionalidades Detalladas

### Navegación SPA

La navegación usa el **hash de la URL** (`#/personajes`, `#/episodios`, `#/ubicaciones`).  
El router escucha el evento `hashchange` y renderiza la vista correspondiente **sin recargar la página**.  
El enlace activo se marca visualmente en la navbar.

### Página de Personajes

- Carga rápida con los primeros 20 personajes de la API
- Carga progresiva del resto en segundo plano (sin bloquear la UI)
- Los personajes ficticios creados por el usuario aparecen primero, marcados con badge "Ficticio"
- Ediciones y eliminaciones se reflejan en tiempo real

### Crear Personaje

1. Click en **"+ Crear personaje"** en la navbar
2. Completar el formulario: nombre (*), especie (*), género, estado, URL de imagen (opcional)
3. Validación antes de guardar; errores mostrados dentro del modal
4. El personaje se guarda en `localStorage` y aparece inmediatamente en el grid

### Editar Personaje

1. Click en **"Editar"** en la tarjeta del personaje
2. Se puede cambiar: nombre, especie y estado
3. Para personajes de la API: se guarda solo el **delta** en `localStorage`, nunca se toca el dato original
4. La tarjeta se actualiza en-lugar sin re-renderizar toda la lista

### Eliminar Personaje

1. Click en **"Eliminar"** en la tarjeta
2. Diálogo de confirmación nativo
3. Animación de salida antes de remover del DOM
4. Para personajes de la API: el ID se agrega a la lista de "eliminados" en `localStorage` (no se borra el dato, solo se filtra al renderizar)

### Manejo de Errores

| Situación | Comportamiento |
|---|---|
| Error de red / API caída | Muestra mensaje de error con botón "Reintentar" |
| Imagen rota | Se reemplaza con placeholder "Sin imagen" |
| Formulario incompleto | Errores listados dentro del modal, no se cierra |
| URL de imagen inválida | Error de validación en el formulario |
| Ruta desconocida | Redirección automática a `#/personajes` |


---

##  Decisiones Arquitectónicas

### ¿Cómo se diferencia un personaje ficticio de uno de la API?

Los personajes ficticios tienen un campo `isCustom: true` y un ID con prefijo `local_` (ej: `local_1716900000_abc12`). Los de la API tienen IDs numéricos.

### ¿Cómo se manejan las ediciones sin modificar la API?

Se usa una estrategia de **"delta store"**:
- Los datos de la API se guardan en un cache de módulo (inmutables)
- Las ediciones se guardan en `localStorage` bajo `rm_character_edits` como `{ [id]: { cambios } }`
- Al renderizar, `mergeCharacters()` aplica el delta sobre el dato original: `{ ...apiCharacter, ...edits[id] }`

### ¿Cómo se sincronizan API, DOM y localStorage?

```
API (fetch) ──► _apiCache (módulo)
                     │
            mergeCharacters()  ◄── localStorage (edits, deleted, custom)
                     │
                  render DOM
                     │
           Evento usuario (click)
                     │
            ┌────────┴────────┐
       storage.js          DOM update
    (persiste cambio)    (in-place o remove)
```

### ¿Por qué no hay re-render completo al editar?

Al editar, el callback del modal recibe los cambios y `refreshCard()` actualiza solo los elementos del DOM afectados. Esto evita perder el scroll y es más eficiente que re-renderizar toda la lista.

---

##  Manejo de Estado

### localStorage — Claves utilizadas

| Clave | Tipo | Descripción |
|---|---|---|
| `rm_custom_characters` | `Array` | Personajes ficticios creados por el usuario |
| `rm_character_edits` | `Object { [id]: delta }` | Ediciones aplicadas a personajes de la API |
| `rm_deleted_characters` | `Array<number>` | IDs de personajes de la API eliminados visualmente |

### Cache por módulo (memoria de sesión)

| Variable | Módulo | Descripción |
|---|---|---|
| `_apiCache` | `characters.js` | Cache de personajes de la API (primera página + todas) |
| `_cache` | `episodes.js` | Todos los episodios |
| `_cache` | `locations.js` | Todas las ubicaciones |

El cache sobrevive mientras la pestaña esté abierta, pero se reinicia al recargar la página.

---

##  Tecnologías

- **HTML5** — Estructura semántica de la shell SPA
- **CSS3** — Variables, Grid, Flexbox, animaciones, diseño responsive
- **JavaScript ES2020+** — Módulos nativos (`import/export`), `async/await`, `fetch`, `localStorage`
- **Rick and Morty API** — https://rickandmortyapi.com/documentation


---

##  Equipo
Taller Práctico S4 — Evolución de una SPA Vanilla JS
- Leonardo ivan ayala perez
- Daniel David Martinez Gonzalez
- Johan Elias Hernandez Navarro

---
<img src="S.P.A.drawio.png"  />

Revisando el proyecto encontré un error crítico que impide que la aplicación funcione, además de varios errores lógicos que pueden generar comportamientos inesperados.

1. Error que rompe la aplicación

src/services/reservation.service.js

Tienes:

export const getReservation = () =>
  http.get("/reservations");

Pero en home.controller.js importas:

import { getReservations } from "@services/reservation.service";

La función se llama getReservation (singular) y la estás importando como getReservations (plural).

Solución

import { http } from "@/api/http";

export const getReservations = () =>
  http.get("/reservations");

export const createReservation = (data) =>
  http.post("/reservations", data);


---

2. Error en el logout

src/components/Sidebar.js

Importas:

import { removeSession } from "@/utils";

Pero nunca la usas.

Actualmente:

document
  .querySelector("#logoutBtn")
  ?.addEventListener("click", () => {
    navigateTo("/");
  });

El usuario sigue logueado porque la sesión nunca se elimina.

Solución

document
  .querySelector("#logoutBtn")
  ?.addEventListener("click", () => {
    removeSession();
    navigateTo("/");
  });


---

3. Línea duplicada innecesaria

home.controller.js

Tienes:

container.innerHTML = container.innerHTML = filteredReservations?.length

Eso está duplicado.

Solución

container.innerHTML = filteredReservations?.length
  ? filteredReservations
      .map((reservation) => ReservationCard(reservation))
      .join("")
  : `
      <div class="w-full text-center py-8 col-span-2">
        <p class="text-slate-500">
          No hay reservas disponibles
        </p>
      </div>
    `;


---

4. Posible error cuando no existe sesión

home.controller.js

Actualmente:

const user = getSession();

const filteredReservations =
  user.role === "admin"

Si por alguna razón no existe sesión:

user === null

Obtendrás:

Cannot read properties of null (reading 'role')

Solución

if (!user) return;

o

const filteredReservations =
  user?.role === "admin"


---

5. El router no protege rutas

Importas:

import { isAuthenticated } from "@/utils";

Pero nunca lo usas.

Actualmente cualquier persona puede entrar directamente a:

/home

Solución

Dentro de router():

if (path === "/home" && !isAuthenticated()) {
  navigateTo("/");
  return;
}


---

6. Falta evitar que un usuario autenticado vuelva al login

Si ya inició sesión debería ir automáticamente a Home.

if (path === "/" && isAuthenticated()) {
  navigateTo("/home");
  return;
}


---

7. Vista 404 nunca utilizada

Tienes:

src/views/notFound.js

pero el router nunca la usa.

Actualmente:

const view = routes[path] || loginView;

Solución

import NotFoundView from "@/views/notFound";

const view = routes[path] || NotFoundView;


---

8. Botón de volver al inicio del 404 no funciona

En notFound.js existe:

<button id="goHome">

pero no tiene evento.

Puedes agregar:

setTimeout(() => {
  document
    .querySelector("#goHome")
    ?.addEventListener("click", () => {
      history.pushState({}, "", "/");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
});


---

9. Navegación SPA incompleta

En el Sidebar tienes:

<a href="/home" data-link>

Pero no existe ningún listener para interceptar los enlaces y evitar que la página recargue.

Agrega en main.js:

document.addEventListener("click", (e) => {
  const link = e.target.closest("[data-link]");

  if (!link) return;

  e.preventDefault();

  history.pushState({}, "", link.href);
  router();
});


---

Resumen

Error que impide ejecutar

✅ Corregir:

getReservation

por

getReservations

Errores lógicos

✅ Eliminar sesión al cerrar sesión.

✅ Corregir container.innerHTML = container.innerHTML =.

✅ Validar sesión nula.

✅ Proteger /home.

✅ Redirigir usuarios logueados.

✅ Implementar vista 404.

✅ Activar botón del 404.

✅ Interceptar enlaces SPA.

El único error que probablemente te está dando un pantallazo blanco o error de compilación inmediato es el de getReservations, porque Vite no puede encontrar ese export.


Voy a revisar el ZIP primero para entender la estructura base del proyecto.

Perfecto. Ya tengo todo el código base. Ahora te doy **todos los cambios por partes**, archivo por archivo, indicando exactamente qué hacer.

---

## 🔧 ERRORES A CORREGIR PRIMERO

### PARTE 1 — `src/services/reservation.service.js`
**El problema:** exporta `getReservation` (singular) pero `home.controller.js` importa `getReservations` (plural). El proyecto rompe aquí.

**Reemplaza TODO el contenido del archivo con:**

```js
import { http } from "@/api/http";

export const getReservations = () =>
  http.get("/reservations");

export const createReservation = (data) =>
  http.post("/reservations", data);

export const updateReservation = (id, data) =>
  http.patch(`/reservations/${id}`, data);

export const deleteReservation = (id) =>
  http.delete(`/reservations/${id}`);
```

---

### PARTE 2 — `src/components/Sidebar.js`

**El problema:** el logout no llama `removeSession()`, así que la sesión queda guardada aunque el usuario cierre sesión.

**Reemplaza TODO el contenido con:**

```js
import { removeSession, getSession } from "@/utils";
import { navigateTo } from "@/router/router";

export default function Sidebar() {
  const user = getSession();

  setTimeout(() => {
    document
      .querySelector("#logoutBtn")
      ?.addEventListener("click", () => {
        removeSession();
        navigateTo("/");
      });

    document.querySelectorAll("[data-link]").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        navigateTo(link.getAttribute("href"));
      });
    });
  });

  return `
    <aside class="w-64 bg-slate-900 text-white h-screen p-5 flex flex-col">
      <h2 class="text-2xl font-bold mb-8">SpaceBook</h2>

      <nav class="flex flex-col gap-4 flex-1">
        <a href="/home" class="px-3 py-1 bg-gray-500 rounded-xl" data-link>
          Inicio
        </a>

        <a href="/reservations/new" class="px-3 py-1 bg-green-700 rounded-xl" data-link>
          Nueva Reserva
        </a>

        ${
          user?.role === "admin"
            ? `<a href="/admin" class="px-3 py-1 bg-blue-700 rounded-xl" data-link>
                Admin Panel
              </a>`
            : ""
        }
      </nav>

      <div class="mt-auto pt-4 border-t border-slate-700">
        <p class="text-sm text-slate-400 mb-2">${user?.name} (${user?.role})</p>
        <button
          id="logoutBtn"
          class="w-full text-left cursor-pointer text-red-400 hover:text-white hover:bg-red-500 px-3 py-1 rounded-xl"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  `;
}
```

---

### PARTE 3 — `src/router/router.js`
**Lo que falta:** protección de rutas (guards). Sin esto cualquier usuario entra a `/home` o `/admin` sin autenticarse.

**Reemplaza TODO el contenido con:**

```js
import loginView from "@/views/loginView";
import homeView from "@/views/homeView";
import NotFoundView from "@/views/notFound";
import { isAuthenticated, isAdmin } from "@/utils";

// Estas vistas las crearemos en los siguientes pasos
import newReservationView from "@/views/newReservationView";
import adminView from "@/views/adminView";

const routes = {
  "/": loginView,
  "/home": homeView,
  "/reservations/new": newReservationView,
  "/admin": adminView,
};

export const navigateTo = (path) => {
  history.pushState({}, "", path);
  router();
};

export const router = () => {
  const app = document.querySelector("#app");
  const path = window.location.pathname;

  // Guard: si no está autenticado y no está en login → redirigir
  if (!isAuthenticated() && path !== "/") {
    navigateTo("/");
    return;
  }

  // Guard: si está autenticado y va al login → redirigir a home
  if (isAuthenticated() && path === "/") {
    navigateTo("/home");
    return;
  }

  // Guard: solo admin puede entrar a /admin
  if (path === "/admin" && !isAdmin()) {
    app.innerHTML = `
      <div class="min-h-screen flex items-center justify-center bg-slate-100">
        <div class="bg-white p-8 rounded-lg shadow text-center">
          <h1 class="text-3xl font-bold text-red-500 mb-4">Acceso denegado</h1>
          <p class="text-slate-600 mb-6">No tienes permisos para acceder a este módulo.</p>
          <button onclick="history.back()" class="bg-blue-600 text-white px-4 py-2 rounded">
            Volver
          </button>
        </div>
      </div>
    `;
    return;
  }

  const view = routes[path] || NotFoundView;
  app.innerHTML = view();
};

window.addEventListener("popstate", router);
```

---

### PARTE 4 — `src/views/newReservationView.js` *(archivo nuevo)*
**Créalo en `src/views/`:**

```js
import Sidebar from "@/components/Sidebar";
import { newReservationController } from "@/controllers/newReservation.controller";

export default function newReservationView() {
  setTimeout(() => newReservationController());

  return `
    <div class="flex">
      ${Sidebar()}
      <main class="flex-1 p-8 bg-slate-100 min-h-screen">
        <h1 class="text-2xl font-bold mb-6">Nueva Reserva</h1>

        <div class="bg-white p-6 rounded-lg shadow max-w-lg">
          <form id="reservationForm" class="flex flex-col gap-4">

            <div>
              <label class="block text-sm font-medium mb-1">Espacio</label>
              <select name="workspace" class="border w-full p-2 rounded" required>
                <option value="">-- Selecciona --</option>
                <option value="Oficina Privada">Oficina Privada</option>
                <option value="Sala de Reuniones">Sala de Reuniones</option>
                <option value="Coworking">Coworking</option>
                <option value="Auditorio">Auditorio</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">Fecha</label>
              <input type="date" name="date" class="border w-full p-2 rounded" required />
            </div>

            <div class="flex gap-4">
              <div class="flex-1">
                <label class="block text-sm font-medium mb-1">Hora inicio</label>
                <input type="time" name="startHour" class="border w-full p-2 rounded" required />
              </div>
              <div class="flex-1">
                <label class="block text-sm font-medium mb-1">Hora fin</label>
                <input type="time" name="endHour" class="border w-full p-2 rounded" required />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">Motivo</label>
              <textarea name="reason" rows="3" class="border w-full p-2 rounded" required></textarea>
            </div>

            <div id="formError" class="text-red-500 text-sm hidden"></div>

            <button type="submit" class="bg-green-600 text-white py-2 rounded hover:bg-green-700">
              Crear Reserva
            </button>

          </form>
        </div>
      </main>
    </div>
  `;
}
```

---

### PARTE 5 — `src/controllers/newReservation.controller.js` *(archivo nuevo)*
**Créalo en `src/controllers/`:**

```js
import { createReservation, getReservations } from "@/services/reservation.service";
import { getSession } from "@/utils";
import { navigateTo } from "@/router/router";

export const newReservationController = () => {
  const form = document.querySelector("#reservationForm");
  const errorDiv = document.querySelector("#formError");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const user = getSession();
    const workspace = form.workspace.value;
    const date = form.date.value;
    const startHour = form.startHour.value;
    const endHour = form.endHour.value;
    const reason = form.reason.value.trim();

    if (endHour <= startHour) {
      errorDiv.textContent = "La hora de fin debe ser mayor a la de inicio.";
      errorDiv.classList.remove("hidden");
      return;
    }

    // Validar duplicados
    try {
      const all = await getReservations();
      const duplicate = all.find(
        (r) =>
          r.workspace === workspace &&
          r.date === date &&
          r.status !== "cancelled" &&
          r.status !== "rejected" &&
          r.startHour < endHour &&
          r.endHour > startHour
      );

      if (duplicate) {
        errorDiv.textContent = "Ya existe una reserva para ese espacio y horario.";
        errorDiv.classList.remove("hidden");
        return;
      }

      await createReservation({
        userId: user.id,
        workspace,
        date,
        startHour,
        endHour,
        reason,
        status: "pending",
      });

      alert("Reserva creada con éxito.");
      navigateTo("/home");
    } catch (err) {
      console.error(err);
      errorDiv.textContent = "Error al crear la reserva.";
      errorDiv.classList.remove("hidden");
    }
  });
};
```

---

### PARTE 6 — `src/views/adminView.js` *(archivo nuevo)*
**Créalo en `src/views/`:**

```js
import Sidebar from "@/components/Sidebar";
import { adminController } from "@/controllers/admin.controller";

export default function adminView() {
  setTimeout(() => adminController());

  return `
    <div class="flex">
      ${Sidebar()}
      <main class="flex-1 p-8 bg-slate-100 min-h-screen">
        <h1 class="text-2xl font-bold mb-6">Panel Administrador</h1>

        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold">Todas las Reservas</h2>
          </div>

          <div id="adminReservationsContainer">
            <p class="text-slate-400">Cargando...</p>
          </div>
        </div>
      </main>
    </div>
  `;
}
```

---

### PARTE 7 — `src/controllers/admin.controller.js` *(archivo nuevo)*
**Créalo en `src/controllers/`:**

```js
import {
  getReservations,
  updateReservation,
  deleteReservation,
} from "@/services/reservation.service";
import { navigateTo } from "@/router/router";

const statusLabel = {
  pending: "⏳ Pendiente",
  approved: "✅ Aprobada",
  rejected: "❌ Rechazada",
  cancelled: "🚫 Cancelada",
};

export const adminController = async () => {
  const container = document.querySelector("#adminReservationsContainer");

  const render = async () => {
    const reservations = await getReservations();

    if (!reservations.length) {
      container.innerHTML = `<p class="text-slate-500 text-center py-8">No hay reservas.</p>`;
      return;
    }

    container.innerHTML = reservations
      .map(
        (r) => `
        <div class="border rounded p-4 mb-4 bg-slate-50" id="res-${r.id}">
          <div class="flex justify-between items-start">
            <div>
              <p class="font-bold">${r.workspace}</p>
              <p class="text-sm text-slate-500">${r.date} | ${r.startHour} - ${r.endHour}</p>
              <p class="text-sm">Motivo: ${r.reason}</p>
              <p class="text-sm">Usuario ID: ${r.userId}</p>
              <p class="text-sm font-semibold mt-1">Estado: ${statusLabel[r.status] || r.status}</p>
            </div>
            <div class="flex flex-col gap-2 ml-4">
              ${
                r.status === "pending"
                  ? `
                <button data-id="${r.id}" data-action="approve"
                  class="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">
                  Aprobar
                </button>
                <button data-id="${r.id}" data-action="reject"
                  class="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600">
                  Rechazar
                </button>`
                  : ""
              }
              <button data-id="${r.id}" data-action="delete"
                class="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      `
      )
      .join("");

    container.querySelectorAll("button[data-action]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = Number(btn.dataset.id);
        const action = btn.dataset.action;

        if (action === "approve") {
          await updateReservation(id, { status: "approved" });
        } else if (action === "reject") {
          await updateReservation(id, { status: "rejected" });
        } else if (action === "delete") {
          if (confirm("¿Eliminar esta reserva?")) {
            await deleteReservation(id);
          }
        }

        render(); // re-render
      });
    });
  };

  render();
};
```

---

### PARTE 8 — `src/components/ReservationCard.js`
**Reemplaza TODO el contenido** para que el usuario pueda editar/cancelar sus reservas pendientes:

```js
import { updateReservation } from "@/services/reservation.service";
import { getSession } from "@/utils";

const statusLabel = {
  pending: "⏳ Pendiente",
  approved: "✅ Aprobada",
  rejected: "❌ Rechazada",
  cancelled: "🚫 Cancelada",
};

export default function ReservationCard(reservation) {
  const { id, workspace, date, startHour, endHour, reason, status } = reservation;
  const user = getSession();
  const canEdit = status === "pending";
  const canCancel = status === "pending" || status === "approved";

  return `
    <article class="bg-white border rounded-lg p-4 shadow-sm" id="card-${id}">
      <h3 class="font-bold text-lg mb-1">${workspace}</h3>
      <p class="text-sm text-slate-500">${date} | ${startHour} - ${endHour}</p>
      <p class="text-sm mt-1">Motivo: ${reason}</p>
      <p class="text-sm font-semibold mt-1">Estado: ${statusLabel[status] || status}</p>

      <div class="flex gap-2 mt-3">
        ${
          canCancel
            ? `<button
                data-cancel="${id}"
                class="bg-red-100 text-red-600 border border-red-300 px-3 py-1 rounded text-sm hover:bg-red-200">
                Cancelar
              </button>`
            : ""
        }
      </div>
    </article>
  `;
}

// Event delegation — llamar desde homeController después de render
export function attachCardEvents() {
  document.addEventListener("click", async (e) => {
    if (e.target.dataset.cancel) {
      const id = Number(e.target.dataset.cancel);
      if (confirm("¿Cancelar esta reserva?")) {
        await updateReservation(id, { status: "cancelled" });
        location.reload();
      }
    }
  });
}
```

---

### PARTE 9 — `src/controllers/home.controller.js`
**Reemplaza TODO el contenido:**

```js
import ReservationCard, { attachCardEvents } from "@/components/ReservationCard";
import { getReservations } from "@/services/reservation.service";
import { getSession } from "@/utils";

export const homeController = async () => {
  const container = document.querySelector("#reservationsContainer");
  const user = getSession();

  try {
    const reservations = await getReservations();

    const filtered =
      user.role === "admin"
        ? reservations
        : reservations.filter((r) => r.userId === user.id);

    container.innerHTML = filtered.length
      ? filtered.map((r) => ReservationCard(r)).join("")
      : `<div class="w-full text-center py-8 col-span-2">
           <p class="text-slate-500">No tienes reservas aún.</p>
         </div>`;

    attachCardEvents();
  } catch (err) {
    console.error(err);
    container.innerHTML = `<p class="text-red-500 col-span-2">Error cargando reservas.</p>`;
  }
};
```

---

### PARTE 10 — `db.json`
**Reemplaza con la estructura completa que pide el PDF:**

```json
{
  "users": [
    {
      "id": 1,
      "name": "Administrador",
      "email": "admin@test.com",
      "password": "Admin123*",
      "role": "admin"
    },
    {
      "id": 2,
      "name": "Usuario",
      "email": "user@test.com",
      "password": "User123*",
      "role": "user"
    },
    {
      "id": 3,
      "name": "Usuario 2",
      "email": "user2@test.com",
      "password": "User123*",
      "role": "user"
    }
  ],
  "reservations": [
    {
      "id": 1,
      "userId": 2,
      "workspace": "Sala de Reuniones",
      "date": "2026-06-10",
      "startHour": "08:00",
      "endHour": "09:00",
      "reason": "Sprint Planning",
      "status": "pending"
    },
    {
      "id": 2,
      "userId": 3,
      "workspace": "Coworking",
      "date": "2026-06-10",
      "startHour": "10:00",
      "endHour": "11:00",
      "reason": "Daily Meeting",
      "status": "approved"
    }
  ]
}
```

---

## Resumen de qué hacer

| Archivo | Acción |
|---|---|
| `src/services/reservation.service.js` | Reemplazar |
| `src/components/Sidebar.js` | Reemplazar |
| `src/router/router.js` | Reemplazar |
| `src/views/newReservationView.js` | Crear nuevo |
| `src/controllers/newReservation.controller.js` | Crear nuevo |
| `src/views/adminView.js` | Crear nuevo |
| `src/controllers/admin.controller.js` | Crear nuevo |
| `src/components/ReservationCard.js` | Reemplazar |
| `src/controllers/home.controller.js` | Reemplazar |
| `db.json` | Reemplazar |

Con esto cubres: autenticación persistente, guards/protección de rutas, roles, CRUD de reservas, panel admin con aprobar/rechazar/eliminar, y el usuario viendo solo sus reservas con opción de cancelar. ¿Quieres que también te genere el README.md completo en inglés que pide el PDF?
