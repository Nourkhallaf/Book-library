// src/app/components/book-item/book-item.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { Book } from '../../models/book.model';  // Import the Book interface
import { Router } from '@angular/router';
import { WishlistService } from 'src/app/services/wishlist.service';

@Component({
  selector: 'app-book-item',
  templateUrl: './book-item.component.html',
  styleUrls: ['./book-item.component.scss']
})
export class BookItemComponent implements OnInit {
  @Input() book!: Book;  // Declare the 'book' input property with the 'Book' type

  constructor(
    private router: Router,
  ) {}

  ngOnInit(): void {

  }

  // Navigate to the book details page when clicked
  goToDetails(): void {
    console.log(this.book)
    this.router.navigate(['/book', this.book.id]);  
  }

  goToAuthorDetails(authorId: string): void {
    console.log("author id", authorId)
    this.router.navigate(['/author', authorId]);  
  }

}
