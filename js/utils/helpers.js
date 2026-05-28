/**
 * helpers.js
 * Utilidades reutilizables para toda la SPA.
 * Proporciona: toast de feedback, confirmaciones, generación de IDs únicos,
 * manejo de imágenes rotas y marcado de enlace activo en la navbar.
 */

// ── Toast de feedback ─────────────────────────────────────────────────────────

let toastTimer = null;

/**
 * Muestra un mensaje de feedback al usuario en la esquina inferior derecha.
 * @param {string} message - Texto a mostrar
 * @param {'success'|'error'|'info'} type - Tipo visual del toast
 */
export function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  // Remover hidden ANTES de asignar la clase para que sea visible
  toast.classList.remove('hidden');
  toast.className = `toast toast--${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.add('hidden');
  }, 3200);
}

// ── Confirm personalizado (usa window.confirm nativo, sin reload) ─────────────

/**
 * Muestra un diálogo de confirmación nativo.
 * @param {string} message - Pregunta a mostrar
 * @returns {boolean}
 */
export function confirmAction(message) {
  return window.confirm(message);
}

// ── ID único para personajes ficticios ────────────────────────────────────────

/**
 * Genera un ID único con prefijo 'local_' para identificar personajes ficticios.
 * @returns {string}
 */
export function generateId() {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ── Placeholder imagen rota ───────────────────────────────────────────────────

/**
 * Reemplaza una imagen rota con un placeholder de texto "Sin imagen".
 * @param {HTMLImageElement} img
 */
export function handleImgError(img) {
  img.onerror = null;
  img.style.display = 'none';
  const wrap = img.parentElement;
  if (wrap && !wrap.querySelector('.img-error')) {
    const div = document.createElement('div');
    div.className = 'img-error';
    div.textContent = 'Sin imagen';
    wrap.appendChild(div);
  }
}

// ── Marcar enlace activo en la navbar ─────────────────────────────────────────

/**
 * Marca como activo el enlace de la navbar que coincide con el hash actual.
 * @param {string} hash - Hash actual de la URL (ej: '#/personajes')
 */
export function setActiveLink(hash) {
  document.querySelectorAll('[data-link]').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === hash);
  });
}
