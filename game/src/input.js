import { INGREDIENTS } from './data.js';
import {
  addIngredient,
  restartGame,
  selectOrder,
  servePlate,
  startCooking,
  startShift,
  trashPlate,
  undoIngredient,
} from './state.js';

export function attachInput(state, renderAll) {
  document.addEventListener('click', (event) => {
    const orderCard = event.target.closest('[data-order-id]');
    if (orderCard) {
      selectOrder(state, Number(orderCard.dataset.orderId));
      renderAll(state);
      return;
    }
    const ingredientButton = event.target.closest('[data-ingredient]');
    if (ingredientButton) {
      addIngredient(state, ingredientButton.dataset.ingredient);
      renderAll(state);
      return;
    }
    if (event.target.id === 'startBtn') {
      if (state.screen === 'over') restartGame(state);
      else startShift(state);
      renderAll(state);
    }
    if (event.target.id === 'cookBtn') {
      startCooking(state);
      renderAll(state);
    }
    if (event.target.id === 'serveBtn') {
      servePlate(state);
      renderAll(state);
    }
    if (event.target.id === 'undoBtn') {
      undoIngredient(state);
      renderAll(state);
    }
    if (event.target.id === 'trashBtn') {
      trashPlate(state);
      renderAll(state);
    }
  });

  document.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (state.screen === 'start' && (key === 'enter' || key === ' ')) {
      event.preventDefault();
      startShift(state);
      renderAll(state);
      return;
    }
    if (state.screen === 'over' && (key === 'enter' || key === 'r')) {
      restartGame(state);
      renderAll(state);
      return;
    }
    if (state.screen !== 'play') return;
    const ingredient = INGREDIENTS.find((item) => item.key === key);
    if (ingredient) {
      addIngredient(state, ingredient.id);
      renderAll(state);
      return;
    }
    if (key === 'c') startCooking(state);
    if (key === ' ' || key === 'enter') {
      event.preventDefault();
      servePlate(state);
    }
    if (key === 'backspace') {
      event.preventDefault();
      undoIngredient(state);
    }
    if (key === 't') trashPlate(state);
    renderAll(state);
  });
}
