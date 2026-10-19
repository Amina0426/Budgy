// {let expenseCache = [];
// let incomeCache = [];

// export function initData() {
//   expenseCache = JSON.parse(localStorage.getItem("expenses")) || [];
//   incomeCache = JSON.parse(localStorage.getItem("incomes")) || [];
// }

// export function getExpenses() {
//   return expenseCache;
// }

// export function getIncomes() {
//   return incomeCache;
// }

// function saveExpenses() {
//   localStorage.setItem("expenses", JSON.stringify(expenseCache));
// }

// function saveIncomes() {
//   localStorage.setItem("incomes", JSON.stringify(incomeCache));
// }

// export function addExpense(expense) {
//   expenseCache.unshift(expense);
//   saveExpenses();
// }
// export function deleteExpenseAt(index) {
//   if (index >= 0 && index < expenseCache.length) {
//     expenseCache.splice(index, 1);
//     saveExpenses();
//   }
// }
// export function updateExpenseAt(index, newData) {
//   if (index >= 0 && index < expenseCache.length) {
//     expenseCache[index] = { ...expenseCache[index], ...newData };
//     saveExpenses();
//   }
// }

// export function addIncomeEntry(income) {
//   incomeCache.unshift(income);
//   saveIncomes();
// }
// export function deleteIncomeAt(index) {
//   if (index >= 0 && index < incomeCache.length) {
//     incomeCache.splice(index, 1);
//     saveIncomes();
//   }
// }
// export function updateIncomeAt(index, newData) {
//   if (index >= 0 && index < incomeCache.length) {
//     incomeCache[index] = { ...incomeCache[index], ...newData };
//     saveIncomes();
//   }
// }
// }

import { auth, db } from "../firebase/config.js";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  writeBatch,
  getDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { deleteImage } from "./imageStorage.js";

let expenseCache = [];
let incomeCache = [];

function getUserId() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("You must be logged in to access your data.");
  }

  return user.uid;
}

function expensesRef() {
  return collection(db, "users", getUserId(), "expenses");
}

function incomesRef() {
  return collection(db, "users", getUserId(), "incomes");
}

// Load the signed-in user's records into the local caches.
export async function initData() {
  const uid = getUserId();

  const [expenseSnapshot, incomeSnapshot] = await Promise.all([
    getDocs(collection(db, "users", uid, "expenses")),
    getDocs(collection(db, "users", uid, "incomes")),
  ]);

  expenseCache = expenseSnapshot.docs.map((snapshot) => ({
    id: snapshot.id,
    ...snapshot.data(),
  }));

  incomeCache = incomeSnapshot.docs.map((snapshot) => ({
    id: snapshot.id,
    ...snapshot.data(),
  }));
}

export function getExpenses() {
  return expenseCache;
}

export function getIncomes() {
  return incomeCache;
}

export async function addExpense(expense) {
  const data = {
    amount: Number(expense.amount),
    tag: expense.tag,
    date: expense.date,
  };

  const result = await addDoc(expensesRef(), data);

  expenseCache.unshift({ id: result.id, ...data });
}

export async function deleteExpenseAt(index) {
  if (index < 0 || index >= expenseCache.length) return;

  const expense = expenseCache[index];

  // Save the image IDs before removing the expense from the cache.
  const imageIds = Array.isArray(expense.images) ? [...expense.images] : [];

  // First delete the expense from Firestore.
  await deleteDoc(doc(db, "users", getUserId(), "expenses", expense.id));

  // Update the local cache after Firestore deletion succeeds.
  expenseCache.splice(index, 1);

  // Then delete the associated image files from IndexedDB.
  await Promise.all(
    imageIds.map((id) =>
      deleteImage(id).catch((error) => {
        console.error("Could not delete receipt image:", id, error);
      }),
    ),
  );
}
export async function updateExpenseAt(index, newData) {
  if (index < 0 || index >= expenseCache.length) return;

  const expense = expenseCache[index];

  const updates = {};

  if (newData.amount !== undefined) {
    updates.amount = Number(newData.amount);
  }
  if (newData.tag !== undefined) {
    updates.tag = newData.tag;
  }
  if (newData.date !== undefined) {
    updates.date = newData.date;
  }
  if (newData.images !== undefined) {
    if (
      !Array.isArray(newData.images) ||
      newData.images.length > 10 ||
      !newData.images.every((id) => typeof id === "string")
    ) {
      throw new Error("Invalid expense image IDs.");
    }

    updates.images = newData.images;
  }

  await updateDoc(
    doc(db, "users", getUserId(), "expenses", expense.id),
    updates,
  );

  expenseCache[index] = { ...expense, ...updates };
}

export async function addIncomeEntry(income) {
  const data = {
    amount: Number(income.amount),
    date: income.date,
  };

  const result = await addDoc(incomesRef(), data);

  incomeCache.unshift({ id: result.id, ...data });
}

export async function deleteIncomeAt(index) {
  if (index < 0 || index >= incomeCache.length) return;

  const income = incomeCache[index];

  await deleteDoc(doc(db, "users", getUserId(), "incomes", income.id));

  incomeCache.splice(index, 1);
}

export async function updateIncomeAt(index, newData) {
  if (index < 0 || index >= incomeCache.length) return;

  const income = incomeCache[index];

  const updates = {};

  if (newData.amount !== undefined) {
    updates.amount = Number(newData.amount);
  }
  if (newData.date !== undefined) {
    updates.date = newData.date;
  }

  await updateDoc(doc(db, "users", getUserId(), "incomes", income.id), updates);

  incomeCache[index] = { ...income, ...updates };
}
export async function replaceAllData(expenses, incomes) {
  const uid = getUserId();

  const [oldExpenses, oldIncomes] = await Promise.all([
    getDocs(collection(db, "users", uid, "expenses")),
    getDocs(collection(db, "users", uid, "incomes")),
  ]);

  const operationsCount =
    oldExpenses.size + oldIncomes.size + expenses.length + incomes.length;

  // Firestore batches support at most 500 write operations.
  if (operationsCount > 500) {
    throw new Error("This backup is too large to replace in one batch.");
  }

  const batch = writeBatch(db);

  // Delete the existing records belonging to this user.
  oldExpenses.docs.forEach((snapshot) => batch.delete(snapshot.ref));
  oldIncomes.docs.forEach((snapshot) => batch.delete(snapshot.ref));

  // Create the replacement expense documents.
  for (const expense of expenses) {
    const ref = doc(collection(db, "users", uid, "expenses"));

    batch.set(ref, {
      amount: Number(expense.amount),
      tag: expense.tag,
      date: expense.date,
    });
  }

  // Create the replacement income documents.
  for (const income of incomes) {
    const ref = doc(collection(db, "users", uid, "incomes"));

    batch.set(ref, {
      amount: Number(income.amount),
      date: income.date,
    });
  }

  // Commit all changes together.
  await batch.commit();

  // Reload the caches only after the database update succeeds.
  await initData();
}
export async function getMonthlyBudget() {
  const snapshot = await getDoc(doc(db, "users", getUserId()));

  if (!snapshot.exists()) return null;

  const budget = snapshot.data().monthlyBudget;

  return typeof budget === "number" && budget > 0 ? budget : null;
}

export async function saveMonthlyBudget(value) {
  const budget = value === "" || value === null ? null : Number(value);

  if (budget !== null && (!Number.isFinite(budget) || budget <= 0)) {
    throw new Error("Budget must be greater than zero.");
  }

  await setDoc(
    doc(db, "users", getUserId()),
    { monthlyBudget: budget },
    { merge: true },
  );

  // Temporary compatibility mirror for existing calculations.
  if (budget === null) {
    localStorage.removeItem("monthlyBudget");
  } else {
    localStorage.setItem("monthlyBudget", String(budget));
  }

  return budget;
}
