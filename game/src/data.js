export const INGREDIENTS = [
  { id: 'bread', name: 'Bread', key: '1' },
  { id: 'egg', name: 'Egg', key: '2' },
  { id: 'cheese', name: 'Cheese', key: '3' },
  { id: 'lettuce', name: 'Lettuce', key: '4' },
  { id: 'tomato', name: 'Tomato', key: '5' },
  { id: 'batter', name: 'Batter', key: '6' },
  { id: 'berry', name: 'Berry', key: '7' },
  { id: 'syrup', name: 'Syrup', key: '8' },
  { id: 'pasta', name: 'Pasta', key: '9' },
  { id: 'bun', name: 'Bun', key: '0' },
  { id: 'patty', name: 'Patty', key: 'q' },
  { id: 'mushroom', name: 'Mushroom', key: 'w' },
];

export const RECIPES = [
  { id: 'sunrise-toast', name: 'Sunrise Toast', ingredients: ['bread', 'egg', 'cheese'], cookSeconds: 3, reward: 18 },
  { id: 'garden-salad', name: 'Garden Salad', ingredients: ['lettuce', 'tomato', 'cheese'], cookSeconds: 1, reward: 16 },
  { id: 'berry-pancakes', name: 'Berry Pancakes', ingredients: ['batter', 'berry', 'syrup'], cookSeconds: 4, reward: 24 },
  { id: 'tomato-pasta', name: 'Tomato Pasta', ingredients: ['pasta', 'tomato', 'cheese'], cookSeconds: 5, reward: 28 },
  { id: 'veggie-burger', name: 'Veggie Burger', ingredients: ['bun', 'patty', 'lettuce', 'tomato'], cookSeconds: 4, reward: 30 },
  { id: 'mushroom-omelette', name: 'Mushroom Omelette', ingredients: ['egg', 'mushroom', 'cheese'], cookSeconds: 3, reward: 22 },
];

export const CUSTOMERS = ['Mina', 'Rafi', 'Tara', 'Bimo', 'Sinta', 'Dimas', 'Lala', 'Arga'];

export function ingredientById(id) {
  return INGREDIENTS.find((item) => item.id === id);
}

export function recipeById(id) {
  return RECIPES.find((recipe) => recipe.id === id);
}
