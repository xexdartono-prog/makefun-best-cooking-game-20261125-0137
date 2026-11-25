import { attachInput } from './input.js';
import { buildIngredients, renderAll, renderDynamic } from './render.js';
import { applyShot, createGame, tickGame } from './state.js';

const params = new URLSearchParams(window.location.search);
const seed = Number(params.get('seed') || 7);
const state = createGame(Number.isFinite(seed) ? seed : 7);

applyShot(state, params.get('shot'));
buildIngredients();
renderAll(state);
attachInput(state, renderAll);

window.setInterval(() => {
  tickGame(state, 0.1);
  renderDynamic(state);
}, 100);
