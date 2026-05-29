/**
 * characters.js
 * Página de Personajes — carga progresiva con paginación "Ver más".
 *
 * Flujo de carga:
 *  1. getCharacters()    → primera página (20) se muestra de inmediato
 *  2. getAllCharacters()  → resto en background; activa el botón "Ver más"
 *
 * Paginación:
 *  - Se muestran PAGE_SIZE personajes por bloque
 *  - El botón "Ver más" añade el siguiente bloque sin recargar
 *
 * CRUD:
 *  - Crear  → modal (modal.js) + saveCustomCharacter
 *  - Editar → modal en modo edición + saveEdit / updateCustomCharacter
 *  - Eliminar → confirmación nativa + addDeletedId / deleteCustomCharacter
 *
 * Estado local:
 *  - Personajes ficticios y ediciones persisten en localStorage (storage.js)
 *  - Los datos originales de la API nunca se modifican
 */

import { getCharacters, getAllCharacters } from '../services/api.js';
import { mergeCharacters, addDeletedId, deleteCustomCharacter } from '../services/storage.js';
import { handleImgError, showToast, confirmAction } from '../utils/helpers.js';
import { openEditModal } from '../components/modal.js';

const PAGE_SIZE = 20;

let _apiCache   = null;   // todos los personajes de la API (cache)
let _allMerged  = [];     // lista definitiva tras merge con estado local
let _shownCount = 0;      // cuántos están ya en el DOM
let _gridEl     = null;   // referencia al grid actual

/** Invalida el cache para forzar re-fetch en la próxima visita */
export function invalidateCharacterCache() {
  _apiCache = null;
}

/**
 * Punto de entrada del módulo.
 * Renderiza la página de personajes dentro del contenedor dado.
 * @param {HTMLElement} container
 */
export async function renderCharactersPage(container) {
  _shownCount = 0;
  _allMerged  = [];

  container.innerHTML = `
    <div class="page-header">
      <div class="page-header__text">
        <h1>Personajes</h1>
        <p>Universo Rick &amp; Morty</p>
      </div>
      <div class="page-header__badge" id="char-counter">Cargando...</div>
    </div>
    <div id="char-state" class="state-loading">
      <div class="spinner"></div>
      <p>Cargando personajes...</p>
    </div>
    <div id="characters-grid" class="grid-characters"></div>
    <div id="load-more-wrap" class="load-more-wrap hidden">
      <button class="btn btn--outline btn--lg" id="btn-load-more">Ver más personajes</button>
      <p id="remaining-label"></p>
    </div>
  `;

  const stateEl    = container.querySelector('#char-state');
  const counterEl  = container.querySelector('#char-counter');
  const moreWrap   = container.querySelector('#load-more-wrap');
  const remainLabel= container.querySelector('#remaining-label');
  _gridEl          = container.querySelector('#characters-grid');

  try {
    //  Fase 1: primera página (rápida) 
    const firstBatch = _apiCache ?? await getCharacters();
    stateEl.remove();

    _allMerged = mergeCharacters(_apiCache ?? firstBatch);
    renderNextPage();
    updateCounter(counterEl, _shownCount, _apiCache ? _apiCache.length : '826+');

    // Fase 2: resto en background 
    if (!_apiCache) {
      getAllCharacters()
        .then(all => {
          _apiCache  = all;
          _allMerged = mergeCharacters(all);

          updateCounter(counterEl, _shownCount, _allMerged.length);

          const remaining = _allMerged.length - _shownCount;
          if (remaining > 0) {
            moreWrap.classList.remove('hidden');
            remainLabel.textContent = `${remaining} personajes sin mostrar`;
          }
        })
        .catch(() => { /* silencioso: primera página ya está visible */ });
    } else {
      const remaining = _allMerged.length - _shownCount;
      if (remaining > 0) {
        moreWrap.classList.remove('hidden');
        remainLabel.textContent = `${remaining} personajes sin mostrar`;
      }
    }

    //  Botón "Ver más" 
    container.querySelector('#btn-load-more').addEventListener('click', () => {
      renderNextPage();
      const remaining = _allMerged.length - _shownCount;
      updateCounter(counterEl, _shownCount, _allMerged.length);
      if (remaining <= 0) {
        moreWrap.classList.add('hidden');
      } else {
        remainLabel.textContent = `${remaining} personajes sin mostrar`;
      }
    });

  } catch (err) {
    stateEl.className = 'state-error';
    stateEl.innerHTML = `
      <p>Error al cargar personajes</p>
      <p style="font-size:0.82rem;margin-top:0.25rem">${err.message}</p>
      <button class="btn btn--secondary" id="btn-retry" style="margin-top:1rem">Reintentar</button>
    `;
    document.getElementById('btn-retry')?.addEventListener('click', () => {
      _apiCache = null;
      renderCharactersPage(container);
    });
  }
}

/** Agrega el siguiente bloque PAGE_SIZE al grid */
function renderNextPage() {
  const slice = _allMerged.slice(_shownCount, _shownCount + PAGE_SIZE);
  const frag  = document.createDocumentFragment();
  slice.forEach(c => frag.appendChild(buildCard(c)));
  _gridEl.appendChild(frag);
  _shownCount += slice.length;
}

function updateCounter(el, shown, total) {
  if (el) el.textContent = `${shown} / ${total}`;
}

//  Construcción de tarjeta 

function buildCard(character) {
  const isCustom  = !!character.isCustom;
  const statusRaw = (character.status || 'unknown').toLowerCase();
  const statusCls = statusRaw === 'alive' ? 'is-alive'
                  : statusRaw === 'dead'  ? 'is-dead'
                  : 'is-unknown';

  const article = document.createElement('article');
  article.className  = 'card-character';
  article.dataset.id = String(character.id);

  article.innerHTML = `
    <div class="card-character__img-wrap">
      ${character.image
        ? `<img src="${character.image}" alt="${character.name}" loading="lazy" />`
        : buildImgPlaceholder(character.name)}
      ${isCustom ? '<span class="card-character__badge">Ficticio</span>' : ''}
      <div class="card-character__status-overlay ${statusCls}">
        <span class="status-dot status-dot--${statusRaw}"></span>
        ${character.status}
      </div>
    </div>
    <div class="card-character__body">
      <div class="card-character__name" title="${character.name}">${character.name}</div>
      <div class="card-character__meta">${character.species} &middot; ${character.gender}</div>
    </div>
    <div class="card-character__actions">
      <button class="btn btn--edit    btn--sm" data-action="edit">Editar</button>
      <button class="btn btn--danger  btn--sm" data-action="delete">Eliminar</button>
    </div>
  `;

  // Imagen rota: intenta .png antes de mostrar placeholder 
  const img = article.querySelector('img');
  if (img) {
    img.addEventListener('error', () => {
      const src = img.src;
      if (src.includes('.jpeg')) {
        img.onerror = () => handleImgError(img);
        img.src = src.replace('.jpeg', '.png');
      } else {
        handleImgError(img);
      }
    }, { once: true });
  }

  //  Editar 
  article.querySelector('[data-action="edit"]').addEventListener('click', () => {
    openEditModal(character, updated => refreshCard(article, { ...character, ...updated }));
  });

  // Eliminar 
  article.querySelector('[data-action="delete"]').addEventListener('click', () => {
    if (!confirmAction(`¿Eliminar a "${character.name}"?`)) return;

    isCustom ? deleteCustomCharacter(character.id) : addDeletedId(character.id);

    article.style.transition = 'opacity 0.28s ease, transform 0.28s ease';
    article.style.opacity    = '0';
    article.style.transform  = 'scale(0.92)';
    setTimeout(() => article.remove(), 280);

    showToast(`"${character.name}" eliminado correctamente`, 'success');
  });

  return article;
}

function buildImgPlaceholder(name) {
  const initials = name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('');
  const hue      = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return `
    <div class="img-placeholder" style="--hue:${hue}">
      <span class="img-placeholder__initials">${initials}</span>
      <span class="img-placeholder__label">Sin imagen</span>
    </div>
  `;
}

/** Actualiza en-lugar una tarjeta sin recargar la vista */
function refreshCard(article, updated) {
  const statusRaw = (updated.status || 'unknown').toLowerCase();
  const statusCls = statusRaw === 'alive' ? 'is-alive'
                  : statusRaw === 'dead'  ? 'is-dead'
                  : 'is-unknown';

  const nameEl    = article.querySelector('.card-character__name');
  const metaEl    = article.querySelector('.card-character__meta');
  const overlayEl = article.querySelector('.card-character__status-overlay');

  if (nameEl) { nameEl.textContent = updated.name; nameEl.title = updated.name; }
  if (metaEl) metaEl.textContent   = `${updated.species} · ${updated.gender}`;
  if (overlayEl) {
    overlayEl.className = `card-character__status-overlay ${statusCls}`;
    overlayEl.innerHTML = `
      <span class="status-dot status-dot--${statusRaw}"></span>
      ${updated.status}
    `;
  }
}
