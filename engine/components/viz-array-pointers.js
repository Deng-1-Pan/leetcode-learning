/** Mount a generic array + named-pointer visualization. */
export function mount(container, player) {
  const render = (frame) => {
    const array = Array.isArray(frame.array) ? frame.array : [];
    const pointersByIndex = new Map();
    for (const [name, index] of Object.entries(frame.pointers ?? {})) {
      if (!Number.isInteger(index)) continue;
      pointersByIndex.set(index, [...(pointersByIndex.get(index) ?? []), name]);
    }
    const highlights = new Set(frame.highlightIndices ?? []);
    const windowRange = frame.window ?? null;
    container.innerHTML = '';
    const root = document.createElement('div');
    root.className = 'array-viz';
    if (windowRange && Number.isInteger(windowRange.start) && Number.isInteger(windowRange.end)) {
      const band = document.createElement('div');
      band.className = 'window-band';
      band.style.marginInlineStart = `calc(${windowRange.start} * (3.25rem + var(--space-2)))`;
      band.style.width = `calc(${Math.max(1, windowRange.end - windowRange.start + 1)} * (3.25rem + var(--space-2)) - var(--space-2))`;
      root.append(band);
    }
    const row = document.createElement('div');
    row.className = 'array-row';
    array.forEach((value, index) => {
      const cell = document.createElement('div');
      cell.className = 'array-cell';
      if (highlights.has(index)) cell.classList.add('is-highlighted');
      const labels = pointersByIndex.get(index);
      if (labels) {
        cell.classList.add('is-pointer');
        const label = document.createElement('span');
        label.className = 'pointer-label';
        label.textContent = labels.join(' · ');
        cell.append(label);
      }
      cell.append(document.createTextNode(String(value)));
      row.append(cell);
    });
    root.append(row);
    container.append(root);
  };
  render(player.frame);
  const listener = (event) => render(event.detail.frame);
  player.addEventListener('step-change', listener);
  return () => player.removeEventListener('step-change', listener);
}
