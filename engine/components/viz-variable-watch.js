export function mount(container, player) {
  const render = (frame) => {
    container.innerHTML = '';
    const panel = document.createElement('div');
    panel.className = 'variable-watch';
    Object.entries(frame.locals ?? {}).forEach(([name, value]) => {
      const row = document.createElement('div');
      row.className = 'variable-row';
      const label = document.createElement('span');
      label.className = 'variable-name';
      label.textContent = name;
      row.append(label);
      if (Array.isArray(value)) {
        const cells = document.createElement('div');
        cells.className = 'variable-array';
        value.forEach((item) => {
          const cell = document.createElement('span');
          cell.className = 'variable-array-cell array-cell';
          cell.textContent = item === null ? '' : String(item);
          cells.append(cell);
        });
        row.append(cells);
      } else {
        const chip = document.createElement('span');
        chip.className = 'variable-value';
        chip.textContent = JSON.stringify(value);
        row.append(chip);
      }
      panel.append(row);
    });
    container.append(panel);
  };

  render(player.frame);
  const listener = (event) => render(event.detail.frame);
  player.addEventListener('step-change', listener);
  return () => player.removeEventListener('step-change', listener);
}
