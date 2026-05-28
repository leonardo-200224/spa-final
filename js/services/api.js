/**
 * api.js
 * Capa de acceso a la API pública de Rick and Morty.
 * https://rickandmortyapi.com/documentation
 *
 * Todas las funciones son asíncronas y lanzan Error con mensaje descriptivo
 * si la petición falla, para que las páginas puedan mostrar feedback al usuario.
 */

const BASE_URL = 'https://rickandmortyapi.com/api';

/**
 * Recorre todas las páginas de un endpoint y devuelve todos los resultados.
 * Útil para episodios y ubicaciones que tienen pocas páginas.
 * @param {string} endpoint - Nombre del recurso (ej: 'episode', 'location')
 * @returns {Promise<Array>}
 */
async function fetchAll(endpoint) {
  let results = [];
  let url = `${BASE_URL}/${endpoint}`;

  while (url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Error ${res.status} al obtener ${endpoint}`);
    const data = await res.json();
    results = results.concat(data.results);
    url = data.info?.next || null;
  }

  return results;
}

/**
 * Obtiene solo la primera página de un endpoint.
 * Útil para cargar rápido la vista inicial de personajes.
 * @param {string} endpoint
 * @returns {Promise<Array>}
 */
async function fetchPage(endpoint) {
  const res = await fetch(`${BASE_URL}/${endpoint}`);
  if (!res.ok) throw new Error(`Error ${res.status} al obtener ${endpoint}`);
  const data = await res.json();
  return data.results;
}

/**
 * Carga rápida: solo la primera página de personajes (20 items).
 * Se usa para mostrar contenido inmediato mientras carga el resto.
 * @returns {Promise<Array>}
 */
export async function getCharacters() {
  return fetchPage('character');
}

/**
 * Carga completa: todos los personajes de la API (800+).
 * Se ejecuta en segundo plano tras la carga inicial.
 * @returns {Promise<Array>}
 */
export async function getAllCharacters() {
  return fetchAll('character');
}

/**
 * Todos los episodios de la serie.
 * @returns {Promise<Array>}
 */
export async function getEpisodes() {
  return fetchAll('episode');
}

/**
 * Todas las ubicaciones del universo.
 * @returns {Promise<Array>}
 */
export async function getLocations() {
  return fetchAll('location');
}
