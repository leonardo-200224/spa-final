/**
 * episodes.js
 * Página de Episodios — muestra nombre, código, fecha y cantidad de personajes.
 * Cache por sesión para evitar llamadas repetidas a la API.
 */
import { getEpisodes } from '../services/api.js';

let _cache = null;

export async function renderEpisodesPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <div class="page-header__text">
        <h1>Episodios</h1>
        <p>Temporadas y episodios de Rick and Morty</p>
      </div>
      <div class="page-header__badge" id="ep-counter">Cargando...</div>
    </div>
    <div id="ep-state" class="state-loading">
      <div class="spinner"></div>
      <p>Cargando episodios...</p>
    </div>
    <div id="ep-grid" class="grid-list"></div>
  `;

  const stateEl  = container.querySelector('#ep-state');
  const gridEl   = container.querySelector('#ep-grid');
  const counterEl= container.querySelector('#ep-counter');

  try {
    if (!_cache) _cache = await getEpisodes();

    stateEl.remove();
    counterEl.textContent = `${_cache.length} episodios`;

    if (!_cache.length) {
      gridEl.innerHTML = '<p class="state-empty">No hay episodios para mostrar.</p>';
      return;
    }

    const frag = document.createDocumentFragment();
    _cache.forEach(ep => {
      const card = document.createElement('div');
      card.className = 'card-item';
      card.innerHTML = `
        <div class="card-item__title">${ep.name}</div>
        <div class="card-item__meta">
          <div class="card-item__row">
            <span class="label">Código</span>
            <span class="value">${ep.episode}</span>
          </div>
          <div class="card-item__row">
            <span class="label">Emisión</span>
            <span class="value">${ep.air_date}</span>
          </div>
          <div class="card-item__row">
            <span class="label">Personajes</span>
            <span class="value">${ep.characters.length}</span>
          </div>
        </div>
      `;
      frag.appendChild(card);
    });
    gridEl.appendChild(frag);

  } catch (err) {
    stateEl.className = 'state-error';
    stateEl.innerHTML = `
      <p>Error al cargar episodios</p>
      <p style="font-size:0.82rem;margin-top:0.25rem">${err.message}</p>
      <button class="btn btn--secondary" id="btn-retry-ep" style="margin-top:1rem">Reintentar</button>
    `;
    document.getElementById('btn-retry-ep')?.addEventListener('click', () => {
      _cache = null;
      renderEpisodesPage(container);
    });
  }
}
