/**
 * modal.js
 * Componente Modal reutilizable para Crear y Editar personajes.
 *
 * Modos de operación:
 *  - 'create': muestra todos los campos incluyendo imagen; guarda como personaje ficticio
 *  - 'edit':   oculta imagen; permite editar nombre, especie y estado
 *              - Personaje ficticio → updateCustomCharacter
 *              - Personaje de API  → saveEdit (solo guarda delta, no modifica datos originales)
 *
 * Validaciones:
 *  - Nombre y Especie son obligatorios
 *  - URL de imagen debe ser una URL válida si se proporciona
 *
 * Feedback:
 *  - Errores de validación se muestran dentro del modal
 *  - Toast de éxito al guardar
 */

import { saveCustomCharacter, updateCustomCharacter, saveEdit } from '../services/storage.js';
import { generateId, showToast } from '../utils/helpers.js';

// ── Referencias al DOM ────────────────────────────────────────────────────────
const modal        = document.getElementById('modal');
const modalTitle   = document.getElementById('modal-title');
const modalClose   = document.getElementById('modal-close');
const modalOverlay = document.getElementById('modal-overlay');
const btnSave      = document.getElementById('btn-save');
const btnCancel    = document.getElementById('btn-cancel');
const formErrors   = document.getElementById('form-errors');
const groupImage   = document.getElementById('group-image');

/** Mapa de accesores a los campos del formulario */
const fields = {
  name:    () => document.getElementById('input-name'),
  species: () => document.getElementById('input-species'),
  gender:  () => document.getElementById('input-gender'),
  status:  () => document.getElementById('input-status'),
  image:   () => document.getElementById('input-image'),
};

// ── Estado interno del modal ──────────────────────────────────────────────────
let _mode     = 'create'; // 'create' | 'edit'
let _editId   = null;     // ID del personaje que se está editando
let _isCustom = false;    // true si el personaje editado es ficticio (local_...)
let _onSaved  = null;     // Callback a ejecutar tras guardar con éxito

// ── Funciones internas ────────────────────────────────────────────────────────

function openModal()  { modal.classList.remove('hidden'); }

function closeModal() {
  modal.classList.add('hidden');
  clearErrors();
  clearFields();
}

function clearFields() {
  fields.name().value    = '';
  fields.species().value = '';
  fields.gender().value  = 'Male';
  fields.status().value  = 'Alive';
  fields.image().value   = '';
}

function clearErrors() {
  formErrors.classList.add('hidden');
  formErrors.innerHTML = '';
}

/**
 * Valida los campos del formulario según el modo activo.
 * @returns {string[]} Array de mensajes de error (vacío = sin errores)
 */
function validate() {
  const errors = [];
  if (!fields.name().value.trim())    errors.push('El nombre es obligatorio.');
  if (!fields.species().value.trim()) errors.push('La especie es obligatoria.');
  if (_mode === 'create' && fields.image().value.trim()) {
    try { new URL(fields.image().value.trim()); }
    catch { errors.push('La URL de imagen no es válida.'); }
  }
  return errors;
}

/**
 * Muestra los errores de validación dentro del modal.
 * @param {string[]} errors
 */
function showErrors(errors) {
  formErrors.classList.remove('hidden');
  formErrors.innerHTML = `<ul>${errors.map(e => `<li>${e}</li>`).join('')}</ul>`;
}

// ── API pública del componente ────────────────────────────────────────────────

/**
 * Abre el modal en modo "Crear personaje".
 * @param {Function} onSaved - Callback ejecutado tras guardar (recibe el nuevo personaje)
 */
export function openCreateModal(onSaved) {
  _mode    = 'create';
  _editId  = null;
  _onSaved = onSaved;
  modalTitle.textContent   = 'Crear personaje';
  groupImage.style.display = 'block';
  clearFields();
  clearErrors();
  openModal();
}

/**
 * Abre el modal en modo "Editar personaje".
 * Solo permite editar nombre, especie y estado (no imagen).
 * @param {Object}   character - Datos actuales del personaje
 * @param {Function} onSaved   - Callback ejecutado tras guardar (recibe los cambios)
 */
export function openEditModal(character, onSaved) {
  _mode     = 'edit';
  _editId   = character.id;
  _isCustom = typeof character.id === 'string' && character.id.startsWith('local_');
  _onSaved  = onSaved;

  modalTitle.textContent   = 'Editar personaje';
  groupImage.style.display = 'none'; // Imagen no editable

  clearErrors();
  fields.name().value    = character.name;
  fields.species().value = character.species;
  fields.gender().value  = character.gender  || 'Male';
  fields.status().value  = character.status  || 'Alive';
  openModal();
}

// ── Handlers de eventos ───────────────────────────────────────────────────────

btnSave.addEventListener('click', () => {
  const errors = validate();
  if (errors.length) { showErrors(errors); return; }

  if (_mode === 'create') {
    const character = {
      id:       generateId(),
      name:     fields.name().value.trim(),
      species:  fields.species().value.trim(),
      gender:   fields.gender().value,
      status:   fields.status().value,
      image:    fields.image().value.trim() || '',
      isCustom: true,
    };
    saveCustomCharacter(character);
    showToast('Personaje creado exitosamente ✓', 'success');
    closeModal();
    if (_onSaved) _onSaved(character);

  } else {
    const changes = {
      name:    fields.name().value.trim(),
      species: fields.species().value.trim(),
      status:  fields.status().value,
    };

    if (_isCustom) {
      updateCustomCharacter(_editId, changes);
    } else {
      // Personaje de API: guardamos solo el delta, jamás el original
      saveEdit(_editId, changes);
    }

    showToast('Personaje editado exitosamente ✓', 'success');
    closeModal();
    if (_onSaved) _onSaved(changes);
  }
});

modalClose.addEventListener('click',   closeModal);
modalOverlay.addEventListener('click', closeModal);
btnCancel.addEventListener('click',    closeModal);
