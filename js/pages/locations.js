/**
 * locations.js
 * Página de Ubicaciones — muestra nombre, tipo, dimensión y cantidad de residentes.
 * Cache por sesión para evitar llamadas repetidas a la API.
 */
import { getLocations } from '../services/api.js';

let _cache = null;

export async function renderLocationsPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div class="page-header__text">
        <h1>Ubicaciones</h1>
        <p>Planetas, dimensiones y lugares del universo</p>
      </div>
      <div class="page-header__badge" id="loc-counter">Cargando...</div>
    </div>
    <div id="loc-state" class="state-loading">
      <div class="spinner"></div>
      <p>Cargando ubicaciones...</p>
    </div>
    <div id="loc-grid" class="grid-list"></div>
  `;

  const stateEl  = container.querySelector('#loc-state');
  const gridEl   = container.querySelector('#loc-grid');
  const counterEl= container.querySelector('#loc-counter');

  try {
    if (!_cache) _cache = await getLocations();

    stateEl.remove();
    counterEl.textContent = `${_cache.length} ubicaciones`;

    if (!_cache.length) {
      gridEl.innerHTML = '<p class="state-empty">No hay ubicaciones para mostrar.</p>';
      return;
    }

    const frag = document.createDocumentFragment();
    _cache.forEach(loc => {
      const card = document.createElement('div');
      card.className = 'card-item';
      card.innerHTML = `
        <div class="card-item__title">${loc.name}</div>
        <div class="card-item__meta">
          <div class="card-item__row">
            <span class="label">Tipo</span>
            <span class="value">${loc.type || 'Desconocido'}</span>
          </div>
          <div class="card-item__row">
            <span class="label">Dimensión</span>
            <span class="value">${loc.dimension || 'Desconocida'}</span>
          </div>
          <div class="card-item__row">
            <span class="label">Residentes</span>
            <span class="value">${loc.residents.length}</span>
          </div>
        </div>
      `;
      frag.appendChild(card);
    });
    gridEl.appendChild(frag);

  } catch (err) {
    stateEl.className = 'state-error';
    stateEl.innerHTML = `
      <p>Error al cargar ubicaciones</p>
      <p style="font-size:0.82rem;margin-top:0.25rem">${err.message}</p>
      <button class="btn btn--secondary" id="btn-retry-loc" style="margin-top:1rem">Reintentar</button>
    `;
    document.getElementById('btn-retry-loc')?.addEventListener('click', () => {
      _cache = null;
      renderLocationsPage(container);
    });
  }
}
