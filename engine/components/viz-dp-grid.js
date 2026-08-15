export function formatCellValue(value) {
  return value == null ? '' : String(value);
}

/** Mount a generic 1D/2D dynamic-programming grid visualization. */
export function mount(container, player) {
  const render = (frame) => {
    const rows = Array.isArray(frame.grid?.[0]) ? frame.grid : [frame.grid ?? []];
    const active = frame.activeCell ?? [];
    const dependencies = new Set((frame.dependencies ?? []).map(([row, col]) => `${row}:${col}`));
    container.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'dp-grid';
    grid.style.gridTemplateColumns = `repeat(${Math.max(1, ...rows.map((row) => row.length))}, minmax(2.6rem, auto))`;
    rows.forEach((row, rowIndex) => row.forEach((value, columnIndex) => {
      const cell = document.createElement('div');
      cell.className = 'dp-cell';
      if (active[0] === rowIndex && active[1] === columnIndex) cell.classList.add('is-active');
      if (dependencies.has(`${rowIndex}:${columnIndex}`)) cell.classList.add('is-dependency');
      cell.textContent = formatCellValue(value);
      grid.append(cell);
    }));
    container.append(grid);
  };
  render(player.frame);
  const listener = (event) => render(event.detail.frame);
  player.addEventListener('step-change', listener);
  return () => player.removeEventListener('step-change', listener);
}
