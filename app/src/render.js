// render.js — draws a cover onto a canvas: the photo panels, the colour grade,
// the vignette, and the big outlined caption. The same function draws the live
// preview and the exported PNG, so what you see is what you share.

import { LAYOUTS, GRADES } from './layouts.js';

const CAPTION_FONT = 'Anton, "Arial Black", sans-serif';
const SUB_FONT = '"Helvetica Neue", Arial, sans-serif';

// Draw one photo into a panel rectangle, cover-fit, with the panel's zoom and
// pan. ox and oy are -1..1: -1 pins the photo to the left/top edge, 1 to the
// right/bottom edge, 0 centres it.
function drawPanelPhoto(ctx, img, rect, photo, grade) {
  const rw = rect.w;
  const rh = rect.h;
  const ia = img.width / img.height;
  const ra = rw / rh;
  let scale = ia > ra ? rh / img.height : rw / img.width;
  scale *= photo.zoom;
  const dw = img.width * scale;
  const dh = img.height * scale;
  const dx = rect.x - (dw - rw) * (1 + photo.ox) / 2;
  const dy = rect.y - (dh - rh) * (1 + photo.oy) / 2;

  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rw, rh);
  ctx.clip();
  ctx.filter = grade.grayscale
    ? 'grayscale(1) contrast(1.25) brightness(1.05)'
    : `saturate(${grade.saturate})`;
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.filter = 'none';
  const wash = ctx.createLinearGradient(0, rect.y, 0, rect.y + rh);
  wash.addColorStop(0, grade.top);
  wash.addColorStop(1, grade.bottom);
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = wash;
  ctx.fillRect(rect.x, rect.y, rw, rh);
  ctx.globalCompositeOperation = 'source-over';
  ctx.restore();
}

// Split a title into at most two lines that each fit maxWidth at the given size.
function wrapTitle(ctx, title, maxWidth, size) {
  ctx.font = `${size}px ${CAPTION_FONT}`;
  const words = title.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth || !line) {
      line = next;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 2);
}

function drawCaption(ctx, state, W, H, grade) {
  const title = (state.title || '').trim() || 'UNTITLED';
  const subtitle = (state.subtitle || '').trim();
  const maxW = W * 0.92;
  const atTop = state.captionPos === 'top';

  // Legibility band behind the text.
  const bandH = H * 0.30;
  const band = atTop
    ? ctx.createLinearGradient(0, 0, 0, bandH)
    : ctx.createLinearGradient(0, H - bandH, 0, H);
  if (atTop) {
    band.addColorStop(0, 'rgba(0, 0, 0, 0.62)');
    band.addColorStop(1, 'rgba(0, 0, 0, 0)');
  } else {
    band.addColorStop(0, 'rgba(0, 0, 0, 0)');
    band.addColorStop(1, 'rgba(0, 0, 0, 0.62)');
  }
  ctx.fillStyle = band;
  ctx.fillRect(0, atTop ? 0 : H - bandH, W, bandH);

  // Fit the title: shrink until it wraps to at most two lines. The size is
  // based on the smaller side so a wide cover does not get a giant title.
  const base = Math.min(W, H);
  let size = base * 0.115 * state.titleSize;
  let lines = wrapTitle(ctx, title, maxW, size);
  while (lines.length > 2 && size > base * 0.03) {
    size *= 0.92;
    lines = wrapTitle(ctx, title, maxW, size);
  }
  if (lines.length > 2) lines = lines.slice(0, 2);
  const lineH = size * 1.02;
  const titleH = lines.length * lineH;
  const subSize = Math.max(base * 0.026, size * 0.24);
  const subH = subtitle ? subSize * 1.9 : 0;
  const blockH = titleH + subH;
  const topY = atTop ? H * 0.055 : H - H * 0.055 - blockH;
  const centerX = W / 2;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round';

  // Title: soft drop shadow, thick black outline, coloured fill.
  lines.forEach((line, i) => {
    const y = topY + (i + 1) * lineH - lineH * 0.18;
    ctx.font = `${size}px ${CAPTION_FONT}`;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillText(line, centerX, y + size * 0.06);
    ctx.lineWidth = Math.max(4, size * 0.17);
    ctx.strokeStyle = '#000000';
    ctx.strokeText(line, centerX, y);
    ctx.fillStyle = state.textColor;
    ctx.fillText(line, centerX, y);
  });

  if (subtitle) {
    const subY = topY + titleH + subSize * 1.15;
    // Thin accent rule above the subtitle.
    const ruleW = Math.min(maxW * 0.5, ctx.measureText(subtitle).width + subSize * 4);
    ctx.fillStyle = grade.accent;
    ctx.fillRect(centerX - ruleW / 2, subY - subSize * 1.5, ruleW, Math.max(3, W * 0.004));
    ctx.font = `700 ${subSize}px ${SUB_FONT}`;
    try { ctx.letterSpacing = `${Math.max(3, subSize * 0.28)}px`; } catch (e) { /* older canvas: no letter spacing */ }
    ctx.fillStyle = grade.accent;
    ctx.fillText(subtitle.toUpperCase(), centerX, subY);
    try { ctx.letterSpacing = '0px'; } catch (e) { /* ignore */ }
  }
}

export function drawCover(ctx, state, W, H) {
  const layout = LAYOUTS[state.layout] || LAYOUTS.poster;
  const grade = GRADES[state.grade] || GRADES.sunset;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#0d0d12';
  ctx.fillRect(0, 0, W, H);

  for (const panel of layout.panels) {
    const rect = { x: panel.x * W, y: panel.y * H, w: panel.w * W, h: panel.h * H };
    const photo = state.photos[panel.slot];
    if (photo && photo.img) {
      drawPanelPhoto(ctx, photo.img, rect, photo, grade);
    } else {
      ctx.fillStyle = '#1c1c24';
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    }
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.lineWidth = Math.max(2, W * 0.002);
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
  }

  // Soft vignette so the panels read as one poster.
  const vig = ctx.createRadialGradient(
    W / 2, H / 2, Math.min(W, H) * 0.42,
    W / 2, H / 2, Math.max(W, H) * 0.75,
  );
  vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vig.addColorStop(1, 'rgba(0, 0, 0, 0.22)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);

  drawCaption(ctx, state, W, H, grade);

  // Thin poster frame.
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.lineWidth = Math.max(4, W * 0.006);
  ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, W - ctx.lineWidth, H - ctx.lineWidth);

  return { width: W, height: H, layout: state.layout, grade: state.grade, size: state.size };
}
