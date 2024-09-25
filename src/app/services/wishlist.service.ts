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

    // Ensure authors is always an array
    books.forEach(book => {
      console.log( "book", book)
      if (typeof book.authors === 'string') {
        book.authors = [book.authors];
      }
    });
  
    return books;  }

    addToWishlist(book: Book): void {
      // Assuming you have a service to fetch detailed book data
      this.bookService.getBookDetails(book.id).then(detailedBook => {
        const wishlist = this.getWishlist();
        wishlist.push(detailedBook);
        localStorage.setItem(this.wishlistKey, JSON.stringify(wishlist));
      });
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



// import { Injectable } from '@angular/core';
// import { Book } from '../models/book.model';
// import { BookService } from './book.service';

// @Injectable({
//   providedIn: 'root',
// })
// export class WishlistService {
//   private wishlistKey = 'wishlist';

//   constructor(private bookService: BookService) {}

//   // Fetch wishlist from localStorage
//    getWishlist(): Book[] {
//     const wishlist = localStorage.getItem(this.wishlistKey);
//     const books: Book[] = wishlist ? JSON.parse(wishlist) : [];

//     // Ensure authors is always an array
//     books.forEach(book => {
//       console.log( "book", book)
//       if (typeof book.authors === 'string') {
//         book.authors = [book.authors];
//       }
//     });
  
//     return books;  }

//   // Add a book to the wishlist, fetching full details using BookService
//   async addToWishlist(bookId: string): Promise<void> {
//     try {
//       // Fetch detailed book data
//       const detailedBook = await this.bookService.getBookDetails(bookId);
//       const wishlist = this.getWishlist();

//       // Check if the book is already in the wishlist
//       const existingBook = wishlist.find(book => book.id === detailedBook.id);
//       if (!existingBook) {
//         wishlist.push(detailedBook); // Add book to wishlist
//         localStorage.setItem(this.wishlistKey, JSON.stringify(wishlist)); // Update local storage
//       }
//     } catch (error) {
//       console.error('Error adding book to wishlist:', error);
//     }
//   }

//   // Remove a book from the wishlist by ID
//   removeFromWishlist(bookId: string): void {
//     let wishlist = this.getWishlist();
//     wishlist = wishlist.filter((book: Book) => book.id !== bookId);
//     localStorage.setItem(this.wishlistKey, JSON.stringify(wishlist));
//   }

//   // Check if a book is in the wishlist
//   isInWishlist(bookId: string): boolean {
//     const wishlist = this.getWishlist();
//     return wishlist.some((book: Book) => book.id === bookId);
//   }

//   // Clear the wishlist (optional)
//   clearWishlist(): void {
//     localStorage.removeItem(this.wishlistKey);
//   }
// }
