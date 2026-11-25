import { CUSTOMERS, RECIPES, recipeById } from './data.js';

function nextRandom(state) {
  state.seed = (state.seed * 1664525 + 1013904223) >>> 0;
  return state.seed / 4294967296;
}

function makeOrder(state, fixed) {
  if (fixed) return { ...fixed };
  const recipe = RECIPES[Math.floor(nextRandom(state) * RECIPES.length)];
  const customer = CUSTOMERS[Math.floor(nextRandom(state) * CUSTOMERS.length)];
  const patience = Math.max(18, 36 - state.day * 2);
  state.nextOrderId += 1;
  return {
    id: state.nextOrderId,
    customer,
    recipeId: recipe.id,
    patience,
    patienceMax: patience,
  };
}

export function createGame(seed = 7) {
  const state = {
    screen: 'start',
    seed,
    day: 1,
    score: 0,
    served: 0,
    servedThisDay: 0,
    missed: 0,
    combo: 0,
    shiftLeft: 80,
    orders: [],
    selectedOrderId: null,
    plate: [],
    cooking: null,
    readyDish: null,
    message: 'Pick an order, then build the plate.',
    nextOrderId: 0,
    shotMode: false,
  };
  while (state.orders.length < 3) state.orders.push(makeOrder(state));
  state.selectedOrderId = state.orders[0].id;
  return state;
}

export function dayTarget(state) {
  return 5 + state.day;
}

export function selectedOrder(state) {
  return state.orders.find((order) => order.id === state.selectedOrderId) || state.orders[0] || null;
}

export function selectedRecipe(state) {
  const order = selectedOrder(state);
  return order ? recipeById(order.recipeId) : null;
}

export function plateMatches(state) {
  const recipe = selectedRecipe(state);
  if (!recipe || state.plate.length !== recipe.ingredients.length) return false;
  const wanted = [...recipe.ingredients].sort();
  const have = [...state.plate].sort();
  return wanted.every((id, index) => id === have[index]);
}

export function startShift(state) {
  state.screen = 'play';
  state.message = 'Lunch rush started. Build the selected order.';
}

export function restartGame(state) {
  const fresh = createGame(state.seed + 11);
  Object.assign(state, fresh);
  state.screen = 'play';
  state.message = 'New shift. Keep the counter moving.';
}

export function selectOrder(state, orderId) {
  if (state.screen !== 'play') return;
  state.selectedOrderId = orderId;
  const recipe = selectedRecipe(state);
  state.message = recipe ? `Now building ${recipe.name}.` : 'Pick an order.';
}

export function addIngredient(state, ingredientId) {
  if (state.screen !== 'play' || state.cooking || state.readyDish) return;
  if (state.plate.length >= 6) {
    state.message = 'Plate is full. Undo or trash it.';
    return;
  }
  state.plate.push(ingredientId);
  state.message = plateMatches(state) ? 'Recipe complete. Cook it.' : 'Added. Keep assembling.';
}

export function undoIngredient(state) {
  if (state.screen !== 'play' || state.cooking || state.readyDish) return;
  state.plate.pop();
  state.message = 'Last ingredient removed.';
}

export function trashPlate(state) {
  if (state.screen !== 'play') return;
  state.plate = [];
  state.cooking = null;
  state.readyDish = null;
  state.combo = 0;
  state.message = 'Plate cleared. Start the dish again.';
}

export function startCooking(state) {
  if (state.screen !== 'play' || state.cooking || state.readyDish) return;
  if (!plateMatches(state)) {
    state.message = 'The plate does not match the order yet.';
    return;
  }
  const recipe = selectedRecipe(state);
  state.cooking = { recipeId: recipe.id, elapsed: 0, total: recipe.cookSeconds };
  state.message = `${recipe.name} is cooking.`;
}

export function servePlate(state) {
  if (state.screen !== 'play') return;
  const order = selectedOrder(state);
  if (!order || !state.readyDish) {
    state.message = 'No finished plate is ready yet.';
    return;
  }
  if (state.readyDish !== order.recipeId) {
    state.message = 'That plate belongs to a different order.';
    return;
  }
  const recipe = recipeById(order.recipeId);
  const bonus = Math.ceil(order.patience) * 2 + state.combo * 5;
  state.score += recipe.reward + bonus;
  state.served += 1;
  state.servedThisDay += 1;
  state.combo += 1;
  state.orders = state.orders.filter((item) => item.id !== order.id);
  state.plate = [];
  state.readyDish = null;
  state.orders.push(makeOrder(state));
  state.selectedOrderId = state.orders[0].id;
  state.message = `Served ${recipe.name}. Nice and hot.`;
}

function finishDay(state) {
  if (state.servedThisDay >= dayTarget(state)) {
    state.day += 1;
    state.servedThisDay = 0;
    state.shiftLeft = 80;
    state.plate = [];
    state.cooking = null;
    state.readyDish = null;
    state.orders = [];
    while (state.orders.length < 3) state.orders.push(makeOrder(state));
    state.selectedOrderId = state.orders[0].id;
    state.message = `Day ${state.day}. The rush is faster now.`;
    return;
  }
  state.screen = 'over';
  state.message = 'Shift over.';
}

export function tickGame(state, seconds) {
  if (state.screen !== 'play' || state.shotMode) return;
  state.shiftLeft -= seconds;
  for (const order of state.orders) order.patience -= seconds;
  const expired = state.orders.filter((order) => order.patience <= 0);
  if (expired.length > 0) {
    state.missed += expired.length;
    state.combo = 0;
    state.orders = state.orders.filter((order) => order.patience > 0);
    while (state.orders.length < 3) state.orders.push(makeOrder(state));
    if (!state.orders.some((order) => order.id === state.selectedOrderId)) {
      state.selectedOrderId = state.orders[0].id;
    }
    state.message = 'A customer left. Keep the next plate moving.';
  }
  if (state.cooking) {
    state.cooking.elapsed += seconds;
    if (state.cooking.elapsed >= state.cooking.total) {
      state.readyDish = state.cooking.recipeId;
      state.cooking = null;
      state.message = 'Plate ready to serve.';
    }
  }
  if (state.shiftLeft <= 0) finishDay(state);
}

function shotOrder(id, customer, recipeId, patience) {
  return { id, customer, recipeId, patience, patienceMax: 36 };
}

export function applyShot(state, shot) {
  if (!shot) return;
  state.shotMode = true;
  state.screen = 'play';
  state.day = 2;
  state.shiftLeft = 64;
  state.score = 180;
  state.served = 4;
  state.servedThisDay = 4;
  state.orders = [
    shotOrder(101, 'Mina', 'berry-pancakes', 24),
    shotOrder(102, 'Rafi', 'tomato-pasta', 18),
    shotOrder(103, 'Tara', 'sunrise-toast', 29),
  ];
  state.selectedOrderId = 101;
  state.plate = ['batter', 'berry'];
  state.message = 'Berry Pancakes need syrup before cooking.';
  if (shot === 'ingredients') {
    state.orders = [
      shotOrder(111, 'Bimo', 'veggie-burger', 27),
      shotOrder(112, 'Sinta', 'garden-salad', 21),
      shotOrder(113, 'Dimas', 'mushroom-omelette', 31),
    ];
    state.selectedOrderId = 111;
    state.plate = ['bun', 'patty'];
    state.message = 'Add lettuce and tomato from the counter.';
  }
  if (shot === 'assembly') {
    state.orders = [
      shotOrder(121, 'Rafi', 'tomato-pasta', 19),
      shotOrder(122, 'Lala', 'berry-pancakes', 25),
      shotOrder(123, 'Arga', 'garden-salad', 30),
    ];
    state.selectedOrderId = 121;
    state.plate = ['pasta', 'tomato', 'cheese'];
    state.cooking = { recipeId: 'tomato-pasta', elapsed: 2.6, total: 5 };
    state.message = 'Tomato Pasta is simmering on the stove.';
  }
  if (shot === 'serve') {
    state.orders = [
      shotOrder(131, 'Tara', 'mushroom-omelette', 22),
      shotOrder(132, 'Mina', 'sunrise-toast', 28),
      shotOrder(133, 'Rafi', 'veggie-burger', 16),
    ];
    state.selectedOrderId = 131;
    state.plate = ['egg', 'mushroom', 'cheese'];
    state.readyDish = 'mushroom-omelette';
    state.score = 260;
    state.shiftLeft = 41;
    state.message = 'Mushroom Omelette is ready to serve.';
  }
}
