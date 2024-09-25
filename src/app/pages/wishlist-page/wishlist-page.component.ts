import { Component, OnInit } from '@angular/core';
import { Book } from 'src/app/models/book.model';
import { WishlistService } from 'src/app/services/wishlist.service';

@Component({
  selector: 'app-wishlist-page',
  templateUrl: './wishlist-page.component.html',
  styleUrls: ['./wishlist-page.component.scss']
})
export class WishlistPageComponent implements OnInit {

  wishlistBooks: Book[] = [];
  showToast: boolean = false;
  toastMessage: string = '';

  constructor(private wishlistService: WishlistService) {}

  ngOnInit(): void {
    this.loadWishlist(); // Load wishlist when the page initializes
  }

  // Function to load wishlist from localStorage
  loadWishlist(): void {
    this.wishlistBooks = this.wishlistService.getWishlist();
    console.log("wishlistBooks", this.wishlistBooks);
  }

  handleBookRemoved(): void {
    this.loadWishlist(); // Reload the wishlist after a book is removed
    this.showRemovalNotification(); // Show the removal notification
  }

  // Function to show a custom notification when a book is removed
  showRemovalNotification(): void {
    this.toastMessage = 'Book removed from your wishlist!';
    this.showToast = true;
    setTimeout(() => this.hideToast(), 3000); // Auto-hide after 3 seconds
  }

  hideToast(): void {
    this.showToast = false;
  }
}
