import { db } from "../../firebase";

const BOOKS_COLLECTION = "books";

/**
 * Adds a new book to the Firestore 'books' collection
 * @param {Object} book - The book object with properties like title, author, etc.
 * @returns {Promise<string>} The document ID of the newly created book
 */
export async function addBook(book) {
  try {
    const docRef = await db.collection(BOOKS_COLLECTION).add(book);
    return docRef.id;
  } catch (error) {
    console.log("Error adding book:", error);
    throw error;
  }
}

/**
 * Fetches all books from the Firestore 'books' collection
 * Sorts them by title and returns an array of book objects with their IDs
 * @returns {Promise<Array>} Array of book objects, each with an 'id' property
 */
export async function getBooks() {
  try {
    const snapshot = await db
      .collection(BOOKS_COLLECTION)
      .orderBy("title")
      .get();

    const books = [];
    snapshot.forEach((doc) => {
      books.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return books;
  } catch (error) {
    console.log("Error fetching books:", error);
    throw error;
  }
}

/**
 * Updates a book in the Firestore 'books' collection
 * @param {string} id - The document ID of the book to update
 * @param {Object} updatedBook - The updated book object with new values
 * @returns {Promise<void>}
 */
export async function updateBook(id, updatedBook) {
  try {
    await db.collection(BOOKS_COLLECTION).doc(id).update(updatedBook);
  } catch (error) {
    console.log("Error updating book:", error);
    throw error;
  }
}

/**
 * Deletes a book from the Firestore 'books' collection
 * @param {string} id - The document ID of the book to delete
 * @returns {Promise<void>}
 */
export async function deleteBook(id) {
  try {
    await db.collection(BOOKS_COLLECTION).doc(id).delete();
  } catch (error) {
    console.log("Error deleting book:", error);
    throw error;
  }
}

