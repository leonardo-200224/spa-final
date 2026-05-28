/**
 * router.js
 * Router hash-based de la SPA.
 *
 * Maneja la navegación sin recarga de página usando el hash de la URL (#/).
 * Cada ruta mapea a una función de renderizado que recibe el contenedor #app.
 *
 * Rutas disponibles:
 *  #/personajes  → Página de Personajes (default)
 *  #/episodios   → Página de Episodios
 *  #/ubicaciones → Página de Ubicaciones
 *  (cualquier otra) → Redirección a #/personajes
 */

import { renderCharactersPage } from './pages/characters.js';
import { renderEpisodesPage }   from './pages/episodes.js';
import { renderLocationsPage }  from './pages/locations.js';
import { setActiveLink }        from './utils/helpers.js';

/** Mapa de rutas: hash → función de renderizado */
const routes = {
  '#/personajes':  renderCharactersPage,
  '#/episodios':   renderEpisodesPage,
  '#/ubicaciones': renderLocationsPage,
};

/**
 * Inicializa el router: escucha cambios de hash y carga la ruta actual.
 * Debe llamarse una sola vez al inicio de la app.
 */
export function initRouter() {
  window.addEventListener('hashchange', navigate);
  navigate(); // Carga la ruta inicial al arrancar
}

/**
 * Lee el hash actual, resuelve el handler y renderiza la vista.
 * Si el hash no existe en las rutas, redirige a #/personajes.
 */
function navigate() {
  const hash      = window.location.hash || '#/personajes';
  const container = document.getElementById('app');
  const handler   = routes[hash];

  if (!handler) {
    // Ruta desconocida → redirigir al home
    window.location.hash = '#/personajes';
    return;
  }

  setActiveLink(hash);
  handler(container);
}
