/**
 * storage.js
 * Capa de persistencia local usando localStorage.
 *
 * Maneja tres colecciones independientes:
 *  - CUSTOM   → personajes ficticios creados por el usuario
 *  - EDITS    → cambios aplicados a personajes de la API (delta, sin modificar datos originales)
 *  - DELETED  → IDs de personajes de la API eliminados visualmente
 *
 * Estrategia de integridad:
 *  Los personajes de la API NUNCA se modifican en memoria; las ediciones y
 *  eliminaciones se guardan como capas separadas y se aplican al momento de renderizar.
 */

const KEYS = {
  CUSTOM:  'rm_custom_characters',
  EDITS:   'rm_character_edits',
  DELETED: 'rm_deleted_characters',
};

//  Personajes ficticios (creados por el usuario) 

/**
 * Retorna la lista de personajes ficticios guardados localmente.
 * @returns {Array}
 */
export function getCustomCharacters() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.CUSTOM) || '[]');
  } catch { return []; }
}

/**
 * Agrega un personaje ficticio al inicio de la lista local.
 * @param {Object} character
 */
export function saveCustomCharacter(character) {
  const list = getCustomCharacters();
  list.unshift(character);
  localStorage.setItem(KEYS.CUSTOM, JSON.stringify(list));
}

/**
 * Actualiza un personaje ficticio existente por su ID.
 * @param {string} id
 * @param {Object} changes - Campos a sobrescribir
 * @returns {boolean} true si se encontró y actualizó
 */
export function updateCustomCharacter(id, changes) {
  const list = getCustomCharacters();
  const idx  = list.findIndex(c => c.id === id);
  if (idx === -1) return false;
  list[idx] = { ...list[idx], ...changes };
  localStorage.setItem(KEYS.CUSTOM, JSON.stringify(list));
  return true;
}

/**
 * Elimina un personaje ficticio por su ID.
 * @param {string} id
 */
export function deleteCustomCharacter(id) {
  const list = getCustomCharacters().filter(c => c.id !== id);
  localStorage.setItem(KEYS.CUSTOM, JSON.stringify(list));
}

//  Ediciones sobre personajes de la API (guardamos delta, no el original) 

/**
 * Retorna el mapa de ediciones { [id]: { nombre, especie, estado } }.
 * @returns {Object}
 */
export function getEdits() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.EDITS) || '{}');
  } catch { return {}; }
}

/**
 * Guarda o actualiza los cambios de un personaje de la API.
 * Nunca toca los datos originales; solo guarda el delta.
 * @param {number|string} id
 * @param {Object} changes
 */
export function saveEdit(id, changes) {
  const edits  = getEdits();
  edits[id]    = { ...edits[id], ...changes };
  localStorage.setItem(KEYS.EDITS, JSON.stringify(edits));
}

// ── IDs de personajes de API eliminados visualmente ──────────────────────────

/**
 * Retorna el array de IDs de personajes de la API marcados como eliminados.
 * @returns {number[]}
 */
export function getDeletedIds() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.DELETED) || '[]');
  } catch { return []; }
}

/**
 * Agrega un ID a la lista de eliminados (si no existe ya).
 * @param {number} id
 */
export function addDeletedId(id) {
  const list = getDeletedIds();
  if (!list.includes(id)) {
    list.push(id);
    localStorage.setItem(KEYS.DELETED, JSON.stringify(list));
  }
}

// ── Merge: combina datos de API + estado local ────────────────────────────────

/**
 * Combina personajes de la API con el estado local:
 *  1. Filtra los eliminados visualmente
 *  2. Aplica ediciones guardadas (delta)
 *  3. Antepone los personajes ficticios del usuario
 *
 * @param {Array} apiCharacters - Personajes crudos de la API
 * @returns {Array} Lista definitiva a renderizar
 */
export function mergeCharacters(apiCharacters) {
  const deleted = getDeletedIds();
  const edits   = getEdits();
  const custom  = getCustomCharacters();

  const merged = apiCharacters
    .filter(c => !deleted.includes(c.id))
    .map(c => edits[c.id] ? { ...c, ...edits[c.id] } : c);

  return [...custom, ...merged];
}
