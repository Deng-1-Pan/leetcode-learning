const renderers = {
  'array-pointers': () => import('./components/viz-array-pointers.js'),
  'dp-grid': () => import('./components/viz-dp-grid.js'),
};

export async function loadVisualizer(vizType) {
  const loader = renderers[vizType];
  if (!loader) throw new Error(`Unsupported visualization type: ${vizType}`);
  const module = await loader();
  return module.mount;
}

export const supportedVizTypes = Object.freeze(Object.keys(renderers));
