import { Injectable } from '@angular/core';
import { Book } from '../models/book.model';
import { BookService } from './book.service';

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  private wishlistKey = 'wishlist';

  constructor(private bookService: BookService) {}

  getWishlist(): Book[] {
    const wishlist = localStorage.getItem(this.wishlistKey);
    const books: Book[] = wishlist ? JSON.parse(wishlist) : [];

    books.forEach(book => {
      if (typeof book.authors === 'string') {
        book.authors = [book.authors];
      }
    });
    return books;  }

  addToWishlist(book: Book): void {
    const wishlist = this.getWishlist();

    if (!book.authors || book.authors.length === 0) {
      console.warn('Book has no authors');
    }

    if (typeof book.authors === 'string') {
      book.authors = [book.authors];
    }

    const existingBook = wishlist.find(b => b.id === book.id);
    if (!existingBook) {
      wishlist.push(book);
      localStorage.setItem(this.wishlistKey, JSON.stringify(wishlist)); 
    }
  }

  removeFromWishlist(bookId: string): void {
    let wishlist = this.getWishlist();
    wishlist = wishlist.filter((book: Book) => book.id !== bookId);
    localStorage.setItem(this.wishlistKey, JSON.stringify(wishlist));
  }

  isInWishlist(bookId: string): boolean {
    const wishlist = this.getWishlist();
    return wishlist.some((book: Book) => book.id === bookId);
  }
}

