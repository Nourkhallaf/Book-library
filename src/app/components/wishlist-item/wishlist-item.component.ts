import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import * as bootstrap from 'bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Book } from 'src/app/models/book.model';
import { WishlistService } from 'src/app/services/wishlist.service';

@Component({
  selector: 'app-wishlist-item',
  templateUrl: './wishlist-item.component.html',
  styleUrls: ['./wishlist-item.component.scss']
})
export class WishlistItemComponent {

  @Input() book!: Book;
  @Output() bookRemoved: EventEmitter<void> = new EventEmitter<void>();
  @ViewChild('confirmModal') confirmModal!: ElementRef;

  constructor(  private wishlistService: WishlistService
  ) {}

  openConfirmModal(): void {
    const modal = new bootstrap.Modal(this.confirmModal.nativeElement);
    modal.show();
  }

  confirmRemove(): void {
    this.wishlistService.removeFromWishlist(this.book.id);
    this.bookRemoved.emit();
    const modal = bootstrap.Modal.getInstance(this.confirmModal.nativeElement);
    if (modal) {
      modal.hide();
    }
  }
}
