// Tiny canvas drawing helpers shared by the procedural art pipeline.

export function px(c, x, y, col) { c.fillStyle = col; c.fillRect(x, y, 1, 1); }
export function rc(c, x, y, w, h, col) { c.fillStyle = col; c.fillRect(x, y, w, h); }
export function circle(c, cx, cy, r, col) {
  c.fillStyle = col;
  for (let dy = -r; dy <= r; dy++)
    for (let dx = -r; dx <= r; dx++)
      if (dx * dx + dy * dy <= r * r) c.fillRect(cx + dx, cy + dy, 1, 1);
}

// Draw a string-array pixel map. Characters index into `palette`;
// unknown characters (e.g. '.') are transparent.
export function drawPixelMap(c, x, y, rows, palette) {
  for (let ry = 0; ry < rows.length; ry++) {
    const row = rows[ry];
    for (let rx = 0; rx < row.length; rx++) {
      const col = palette[row[rx]];
      if (col) px(c, x + rx, y + ry, col);
    }
  }
}

// Horizontal flip of a pixel map (for deriving RIGHT from LEFT).
export function mirrorRows(rows) {
  return rows.map((r) => [...r].reverse().join(''));
}

// Guard against hand-editing mistakes: every row must be exactly `width` chars.
export function validateRows(name, rows, width = 16) {
  rows.forEach((r, i) => {
    if (r.length !== width) {
      throw new Error(`pixel map ${name} row ${i} is ${r.length} chars (expected ${width}): "${r}"`);
    }
  });
  return rows;
}
