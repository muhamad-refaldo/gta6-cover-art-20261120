// editor.js — the cover studio itself: state, photo loading, panel editing,
// layout/size/grade controls, the live preview, and PNG export.
// The cover is drawn on one canvas; the preview and the export share drawCover,
// so what you see is exactly what you share.

import { SIZES, SIZE_ORDER, LAYOUTS, LAYOUT_ORDER, GRADES, GRADE_ORDER, TEXT_COLORS } from './layouts.js';
import { drawCover } from './render.js';

const $ = (id) => document.getElementById(id);
const SAMPLES = { pier: 'samples/pier.jpg', boulevard: 'samples/boulevard.jpg' };

function blankPhoto() {
  return { img: null, zoom: 1, ox: 0, oy: 0 };
}

const state = {
  layout: 'poster',
  grade: 'sunset',
  size: 'square',
  title: 'SUNSET HEIST',
  subtitle: 'ONE LAST JOB',
  titleSize: 1,
  captionPos: 'bottom',
  textColor: '#ffffff',
  selectedSlot: 0,
  photos: [blankPhoto(), blankPhoto(), blankPhoto()],
};

let preview = null;
let previewCtx = null;

function currentSize() {
  return SIZES[state.size];
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not load ${src}`));
    img.src = src;
  });
}

async function loadSampleInto(name, slot) {
  try {
    const img = await loadImage(SAMPLES[name]);
    state.photos[slot] = { img, zoom: 1, ox: 0, oy: 0 };
  } catch (e) {
    console.warn(e.message);
  }
}

async function loadSamples() {
  await Promise.all([
    loadSampleInto('pier', 0),
    loadSampleInto('boulevard', 1),
    loadSampleInto('pier', 2),
  ]);
  renderPreview();
}

function renderPreview() {
  if (!preview || !previewCtx) return;
  const { w, h } = currentSize();
  if (preview.width !== w || preview.height !== h) {
    preview.width = w;
    preview.height = h;
  }
  drawCover(previewCtx, state, w, h);
  drawSelection();
}

function drawSelection() {
  const layout = LAYOUTS[state.layout];
  const { w, h } = currentSize();
  const panel = layout.panels.find((p) => p.slot === state.selectedSlot);
  if (!panel) return;
  const grade = GRADES[state.grade];
  previewCtx.save();
  previewCtx.strokeStyle = grade.accent;
  previewCtx.lineWidth = Math.max(4, w * 0.008);
  previewCtx.setLineDash([Math.max(10, w * 0.02), Math.max(8, w * 0.012)]);
  previewCtx.strokeRect(panel.x * w + 3, panel.y * h + 3, panel.w * w - 6, panel.h * h - 6);
  previewCtx.restore();
  const label = $('panel-label');
  if (label) label.textContent = `Panel ${state.selectedSlot + 1} of ${layout.panels.length} selected — load a photo, zoom, or drag it`;
}

function syncPhotoControls() {
  const photo = state.photos[state.selectedSlot];
  $('zoom').value = String(photo.zoom);
  $('pan-x').value = String(photo.ox);
  $('pan-y').value = String(photo.oy);
  $('zoom-val').textContent = `${Math.round(photo.zoom * 100)}%`;
  $('pan-x-val').textContent = photo.ox.toFixed(2);
  $('pan-y-val').textContent = photo.oy.toFixed(2);
}

function selectSlot(slot) {
  state.selectedSlot = slot;
  syncPhotoControls();
  renderPreview();
}

function setLayout(name) {
  state.layout = name;
  document.querySelectorAll('#layout-buttons button').forEach((b) => {
    b.classList.toggle('active', b.dataset.value === name);
  });
  selectSlot(Math.min(state.selectedSlot, LAYOUTS[name].panels.length - 1));
}

function setSize(name) {
  state.size = name;
  document.querySelectorAll('#size-buttons button').forEach((b) => {
    b.classList.toggle('active', b.dataset.value === name);
  });
  renderPreview();
}

function setGrade(name) {
  state.grade = name;
  document.querySelectorAll('#grade-buttons button').forEach((b) => {
    b.classList.toggle('active', b.dataset.value === name);
  });
  renderPreview();
}

function setTextColor(value) {
  state.textColor = value;
  document.querySelectorAll('#color-buttons button').forEach((b) => {
    b.classList.toggle('active', b.dataset.value === value);
  });
  renderPreview();
}

function setCaptionPos(pos) {
  state.captionPos = pos;
  document.querySelectorAll('#caption-pos-buttons button').forEach((b) => {
    b.classList.toggle('active', b.dataset.value === pos);
  });
  renderPreview();
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

function slug(text) {
  return (text || 'cover').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'cover';
}

function exportPNG(sizeKey) {
  const size = SIZES[sizeKey];
  const canvas = document.createElement('canvas');
  canvas.width = size.w;
  canvas.height = size.h;
  const ctx = canvas.getContext('2d');
  const savedSize = state.size;
  state.size = sizeKey;
  drawCover(ctx, state, size.w, size.h);
  state.size = savedSize;
  canvas.toBlob((blob) => {
    if (!blob) return;
    downloadBlob(blob, `vice-cover-${slug(state.title)}-${size.w}x${size.h}.png`);
    showToast(`Exported ${size.w} × ${size.h} PNG`);
  }, 'image/png');
}

function exportAll() {
  for (const key of SIZE_ORDER) exportPNG(key);
}

function showToast(message) {
  const toast = $('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2500);
}

function buildButtonRow(containerId, items, onPick, activeValue) {
  const box = $(containerId);
  box.innerHTML = '';
  for (const item of items) {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.value = item.value;
    b.textContent = item.label;
    if (item.hint) b.title = item.hint;
    if (item.value === activeValue) b.classList.add('active');
    b.addEventListener('click', () => onPick(item.value));
    box.appendChild(b);
  }
}

function wirePhotoInputs() {
  $('photo-file').addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      loadImage(String(reader.result)).then((img) => {
        state.photos[state.selectedSlot] = { img, zoom: 1, ox: 0, oy: 0 };
        syncPhotoControls();
        renderPreview();
        showToast(`Photo loaded into panel ${state.selectedSlot + 1}`);
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  });

  $('fill-all').addEventListener('click', () => {
    const src = state.photos[state.selectedSlot];
    if (!src.img) return;
    for (let i = 0; i < state.photos.length; i++) {
      state.photos[i] = { img: src.img, zoom: src.zoom, ox: src.ox, oy: src.oy };
    }
    renderPreview();
    showToast('Same photo in every panel');
  });

  $('sample-pier').addEventListener('click', async () => {
    await loadSampleInto('pier', state.selectedSlot);
    syncPhotoControls();
    renderPreview();
  });
  $('sample-boulevard').addEventListener('click', async () => {
    await loadSampleInto('boulevard', state.selectedSlot);
    syncPhotoControls();
    renderPreview();
  });
}

function wireSliders() {
  $('zoom').addEventListener('input', (e) => {
    state.photos[state.selectedSlot].zoom = parseFloat(e.target.value);
    syncPhotoControls();
    renderPreview();
  });
  $('pan-x').addEventListener('input', (e) => {
    state.photos[state.selectedSlot].ox = parseFloat(e.target.value);
    syncPhotoControls();
    renderPreview();
  });
  $('pan-y').addEventListener('input', (e) => {
    state.photos[state.selectedSlot].oy = parseFloat(e.target.value);
    syncPhotoControls();
    renderPreview();
  });
  $('title-size').addEventListener('input', (e) => {
    state.titleSize = parseFloat(e.target.value);
    $('title-size-val').textContent = `${Math.round(state.titleSize * 100)}%`;
    renderPreview();
  });
}

function wireCaption() {
  $('title-input').addEventListener('input', (e) => {
    state.title = e.target.value;
    renderPreview();
  });
  $('subtitle-input').addEventListener('input', (e) => {
    state.subtitle = e.target.value;
    renderPreview();
  });
}

function wireDrag() {
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  preview.addEventListener('pointerdown', (e) => {
    const rect = preview.getBoundingClientRect();
    const fx = (e.clientX - rect.left) / rect.width;
    const fy = (e.clientY - rect.top) / rect.height;
    const layout = LAYOUTS[state.layout];
    const hit = layout.panels.find((p) => fx >= p.x && fx <= p.x + p.w && fy >= p.y && fy <= p.y + p.h);
    if (hit) selectSlot(hit.slot);
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    preview.setPointerCapture(e.pointerId);
  });
  preview.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const rect = preview.getBoundingClientRect();
    const dx = (e.clientX - lastX) / rect.width;
    const dy = (e.clientY - lastY) / rect.height;
    lastX = e.clientX;
    lastY = e.clientY;
    const photo = state.photos[state.selectedSlot];
    photo.ox = Math.max(-1, Math.min(1, photo.ox + dx * 2));
    photo.oy = Math.max(-1, Math.min(1, photo.oy + dy * 2));
    syncPhotoControls();
    renderPreview();
  });
  const stop = () => { dragging = false; };
  preview.addEventListener('pointerup', stop);
  preview.addEventListener('pointercancel', stop);
}

function wireExport() {
  $('export-png').addEventListener('click', () => exportPNG(state.size));
  $('export-all').addEventListener('click', exportAll);
}

function applyPresetFromQuery() {
  const q = new URLSearchParams(window.location.search);
  if (q.get('layout') && LAYOUTS[q.get('layout')]) state.layout = q.get('layout');
  if (q.get('grade') && GRADES[q.get('grade')]) state.grade = q.get('grade');
  if (q.get('size') && SIZES[q.get('size')]) state.size = q.get('size');
  if (q.get('title')) state.title = q.get('title');
  if (q.get('subtitle')) state.subtitle = q.get('subtitle');
  if (q.get('caption') === 'top' || q.get('caption') === 'bottom') state.captionPos = q.get('caption');
  if (q.get('color')) state.textColor = q.get('color');
  if (q.get('photo') && SAMPLES[q.get('photo')]) {
    const name = q.get('photo');
    loadImage(SAMPLES[name]).then((img) => {
      for (let i = 0; i < state.photos.length; i++) {
        state.photos[i] = { img, zoom: 1, ox: 0, oy: 0 };
      }
      renderPreview();
    });
  }
  // Reflect the preset in the inputs.
  $('title-input').value = state.title;
  $('subtitle-input').value = state.subtitle;
  $('title-size').value = String(state.titleSize);
  $('title-size-val').textContent = `${Math.round(state.titleSize * 100)}%`;
}

function init() {
  preview = $('preview');
  previewCtx = preview.getContext('2d');

  buildButtonRow('layout-buttons', LAYOUT_ORDER.map((k) => ({ value: k, label: LAYOUTS[k].label, hint: LAYOUTS[k].hint })), setLayout, state.layout);
  buildButtonRow('size-buttons', SIZE_ORDER.map((k) => ({ value: k, label: SIZES[k].label })), setSize, state.size);
  buildButtonRow('grade-buttons', GRADE_ORDER.map((k) => ({ value: k, label: GRADES[k].label })), setGrade, state.grade);
  buildButtonRow('color-buttons', TEXT_COLORS.map((c) => ({ value: c.value, label: c.name })), setTextColor, state.textColor);
  buildButtonRow('caption-pos-buttons', [{ value: 'bottom', label: 'Bottom' }, { value: 'top', label: 'Top' }], setCaptionPos, state.captionPos);

  wirePhotoInputs();
  wireSliders();
  wireCaption();
  wireDrag();
  wireExport();
  applyPresetFromQuery();
  syncPhotoControls();

  // Load the poster font, then draw. Re-draw once it arrives so the caption
  // uses Anton instead of the fallback.
  if (document.fonts && document.fonts.load) {
    document.fonts.load('80px Anton').then(renderPreview).catch(() => {});
    document.fonts.ready.then(renderPreview).catch(() => {});
  }
  loadSamples();
}

init();
