export function getItem(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}

export function saveItem(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function addItem(key, item) {
  let items = getItem(key);
  items.push(item);
  saveItem(key, items);
}

export function deleteItem(key, index) {
  let items = getItem(key);
  if (index >= 0 && index < items.length) {
    items.splice(index, 1);
    saveItem(key, items);
  }
}

export function updateItem(key, index, newItem) {
  let items = getItem(key);
  if (index >= 0 && index < items.length) {
    items[index] = { ...items[index], ...newItem };
    saveItem(key, items);
  }
}
