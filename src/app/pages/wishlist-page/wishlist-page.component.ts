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
    this.loadWishlist();
  }

  loadWishlist(): void {
    this.wishlistBooks = this.wishlistService.getWishlist();
  }

  handleBookRemoved(): void {
    this.loadWishlist();
    this.showRemovalNotification();
  }

  showRemovalNotification(): void {
    this.toastMessage = 'Book removed from your wishlist!';
    this.showToast = true;
    setTimeout(() => this.hideToast(), 3000); 
  }

  hideToast(): void {
    this.showToast = false;
  }
}
