// src/app/pages/book-details-page/book-details-page.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BookService } from '../../services/book.service';  // Import the BookService
import { WishlistService } from 'src/app/services/wishlist.service';
import { ToastrService, ToastrConfig } from 'ngx-toastr';

@Component({
  selector: 'app-book-details-page',
  templateUrl: './book-details-page.component.html',
  styleUrls: ['./book-details-page.component.scss']
})
export class BookDetailsPageComponent implements OnInit {
  book: any = null;  
  isLoading = true;
  error = '';  
  isInWishlist = false;
  showToast: boolean = false;

  constructor(
    private route: ActivatedRoute, 
    private bookService: BookService,
    private wishlistService: WishlistService,
    private toastr: ToastrService
  ) {}

 
  async ngOnInit(): Promise<void> {
    try {
      const bookId = this.route.snapshot.paramMap.get('id');
      
      if (bookId) {
        this.book = await this.bookService.getBookDetails(bookId);
        
        if (this.book) {
          this.isInWishlist = this.wishlistService.isInWishlist(this.book.id);
        }else{
          this.error = 'Book not found or failed to fetch details.';
        }

      } else {
        this.error = 'Invalid Book ID';
      }
    } catch (err) {
      this.error = 'An error occurred while fetching book details.';
    } 
      this.isLoading = false;
  
  }


  addToWishlist(): void {
    if (this.book) {
      this.wishlistService.addToWishlist(this.book);
      this.isInWishlist = true;
      this.showToast = true;
      setTimeout(() => this.hideToast(), 3000); 
    }
  }

  removeFromWishlist(): void {
    if (this.book) {
      this.wishlistService.removeFromWishlist(this.book.id);
      this.isInWishlist = false;
      this.showToast = true;
      setTimeout(() => this.hideToast(), 3000); 

    }
  }

  hideToast() {
    this.showToast = false;
  }
}
