const DB_NAME = "budgy-images";
const STORE_NAME = "expenseImages";
const DB_VERSION = 1;

// Reuse object URLs instead of creating a new one for every thumbnail.
const imageURLCache = new Map();

function openImageDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveImage(file) {
  const db = await openImageDB();

  const image = {
    id: crypto.randomUUID(),
    blob: file,
    type: file.type,
    name: file.name,
  };

  try {
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).add(image);

      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });

    return image.id;
  } finally {
    db.close();
  }
}

export async function getImage(imageId) {
  // Return the existing URL if we already loaded this image.
  if (imageURLCache.has(imageId)) {
    return imageURLCache.get(imageId);
  }

  const db = await openImageDB();

  try {
    const image = await new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const request = transaction.objectStore(STORE_NAME).get(imageId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    if (!image) return null;

    const url = URL.createObjectURL(image.blob);
    imageURLCache.set(imageId, url);
    return url;
  } finally {
    db.close();
  }
}

export async function deleteImage(imageId) {
  const db = await openImageDB();

  try {
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).delete(imageId);

      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });

    const url = imageURLCache.get(imageId);

    if (url) {
      URL.revokeObjectURL(url);
      imageURLCache.delete(imageId);
    }
  } finally {
    db.close();
  }
}
