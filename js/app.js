/**
 * app.js
 * Punto de entrada de la SPA Rick & Morty.
 *
 * Responsabilidades:
 *  1. Inicializar el router (carga la vista según el hash actual)
 *  2. Conectar el botón "Crear personaje" con el modal
 *  3. Re-renderizar la vista de personajes tras una creación exitosa
 *
 * Este archivo debe mantenerse lo más delgado posible.
 * Toda la lógica de negocio va en los módulos correspondientes.
 */

import { initRouter }      from './router.js';
import { openCreateModal } from './components/modal.js';

// Arranca el router al cargar la app
initRouter();

/**
 * Botón "+" de la navbar para crear un personaje ficticio.
 * Abre el modal y, al guardar, re-renderiza la vista de personajes
 * si el usuario sigue en esa sección.
 */
document.getElementById('btn-open-form').addEventListener('click', () => {
  openCreateModal(() => {
    // Si estamos en la página de personajes, refrescar para mostrar el nuevo
    const hash = window.location.hash || '#/personajes';
    if (hash === '#/personajes') {
      // Disparar navegación para re-renderizar con el nuevo personaje
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    }
  });
});
