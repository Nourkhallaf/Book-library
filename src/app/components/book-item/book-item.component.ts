import { Component, Input, OnInit } from '@angular/core';
import { Book } from '../../models/book.model'; 
import { Router } from '@angular/router';
@Component({
  selector: 'app-book-item',
  templateUrl: './book-item.component.html',
  styleUrls: ['./book-item.component.scss']
})
export class BookItemComponent implements OnInit {
  @Input() book!: Book;

  constructor(
    private router: Router,
  ) {}

  ngOnInit(): void {
  }

  goToDetails(): void {
    if (this.book && this.book.id) {
      this.router.navigate(['/book', this.book.id]);
    }
  }

  goToAuthorDetails(authorId: string): void {
    this.router.navigate(['/author', authorId]);
  }

}
