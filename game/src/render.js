import { INGREDIENTS, ingredientById, recipeById } from './data.js';
import { dayTarget, plateMatches, selectedOrder, selectedRecipe } from './state.js';

let lastOrderSignature = '';

function el(id) {
  return document.getElementById(id);
}

function orderSignature(state) {
  return state.orders.map((order) => order.id).join(',') + ':' + state.selectedOrderId;
}

export function buildIngredients() {
  el('ingredients').innerHTML = INGREDIENTS.map((item) => `
    <button class="ingredientBtn" type="button" data-ingredient="${item.id}">
      ${item.name}<small>key ${item.key.toUpperCase()}</small>
    </button>`).join('');
}

export function renderOrders(state) {
  lastOrderSignature = orderSignature(state);
  el('orders').innerHTML = state.orders.map((order) => {
    const recipe = recipeById(order.recipeId);
    const width = Math.max(0, Math.min(100, (order.patience / order.patienceMax) * 100));
    const selected = order.id === state.selectedOrderId ? ' selected' : '';
    return `
      <article class="orderCard${selected}" data-order-id="${order.id}">
        <h3>${order.customer}: ${recipe.name}</h3>
        <p>${recipe.ingredients.map((id) => ingredientById(id).name).join(' + ')}</p>
        <p>Reward ${recipe.reward} • patience <span data-patience-text="${order.id}">${Math.ceil(order.patience)}s</span></p>
        <div class="patienceTrack"><div class="patienceBar" data-patience-for="${order.id}" style="width:${width}%"></div></div>
      </article>`;
  }).join('');
}

function renderPlate(state) {
  const plate = el('plateVisual');
  plate.className = state.readyDish ? 'plateVisual ready' : 'plateVisual';
  if (state.plate.length === 0) {
    plate.innerHTML = '<span class="plateEmpty">Empty plate</span>';
  } else {
    plate.innerHTML = state.plate.map((id) => `<span class="plateChip">${ingredientById(id).name}</span>`).join('')
      + (state.readyDish ? '<span class="plateChip">READY</span>' : '');
  }
  el('plateList').innerHTML = state.plate.length === 0
    ? '<span class="plateEmpty">Nothing yet</span>'
    : state.plate.map((id) => `<span class="plateChip">${ingredientById(id).name}</span>`).join('');
}

function renderChecklist(state) {
  const order = selectedOrder(state);
  const recipe = selectedRecipe(state);
  if (!order || !recipe) {
    el('selectedRecipe').textContent = 'No order selected';
    el('checklist').innerHTML = '';
    return;
  }
  el('selectedRecipe').textContent = `${order.customer} wants ${recipe.name} • reward ${recipe.reward}`;
  const needed = recipe.ingredients.map((id) => {
    const done = state.plate.includes(id) ? ' done' : '';
    return `<div class="checkItem${done}">${done ? 'Done' : 'Need'}: ${ingredientById(id).name}</div>`;
  });
  const extras = state.plate
    .filter((id) => !recipe.ingredients.includes(id))
    .map((id) => `<div class="checkItem extra">Extra: ${ingredientById(id).name}</div>`);
  el('checklist').innerHTML = [...needed, ...extras].join('');
}

function renderOverlay(state) {
  const overlay = el('overlay');
  if (state.screen === 'play') {
    overlay.className = 'overlay';
    return;
  }
  overlay.className = 'overlay show';
  if (state.screen === 'over') {
    el('overlayTitle').textContent = 'Shift over';
    el('overlayText').textContent = `Final score ${state.score}. Served ${state.served}, missed ${state.missed}.`;
    el('startBtn').textContent = 'Play again';
  } else {
    el('overlayTitle').textContent = 'Ember Counter';
    el('overlayText').textContent = 'Read orders, assemble plates, cook fast, and serve before patience runs out.';
    el('startBtn').textContent = 'Start shift';
  }
}

export function renderDynamic(state) {
  if (orderSignature(state) !== lastOrderSignature) renderOrders(state);
  el('dayStat').textContent = `Day ${state.day}`;
  el('timerStat').textContent = `Shift ${Math.max(0, Math.ceil(state.shiftLeft))}s`;
  el('scoreStat').textContent = `Score ${state.score}`;
  el('servedStat').textContent = `Served ${state.servedThisDay}/${dayTarget(state)}`;
  for (const order of state.orders) {
    const bar = document.querySelector(`[data-patience-for="${order.id}"]`);
    const text = document.querySelector(`[data-patience-text="${order.id}"]`);
    if (bar) bar.style.width = `${Math.max(0, Math.min(100, (order.patience / order.patienceMax) * 100))}%`;
    if (text) text.textContent = `${Math.ceil(Math.max(0, order.patience))}s`;
  }
  renderPlate(state);
  renderChecklist(state);
  el('message').textContent = state.message;
  const cookWidth = state.readyDish ? 100 : state.cooking ? (state.cooking.elapsed / state.cooking.total) * 100 : 0;
  el('cookBar').style.width = `${cookWidth}%`;
  el('cookBtn').disabled = state.screen !== 'play' || Boolean(state.cooking) || Boolean(state.readyDish) || !plateMatches(state);
  el('serveBtn').disabled = state.screen !== 'play' || !state.readyDish;
  el('undoBtn').disabled = state.screen !== 'play' || Boolean(state.cooking) || Boolean(state.readyDish) || state.plate.length === 0;
  el('trashBtn').disabled = state.screen !== 'play' || (state.plate.length === 0 && !state.cooking && !state.readyDish);
  renderOverlay(state);
}

export function renderAll(state) {
  renderOrders(state);
  renderDynamic(state);
}
