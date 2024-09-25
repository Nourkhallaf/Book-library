
import { Component, OnInit } from '@angular/core';
import { BookService } from '../../services/book.service';
import { Book } from 'src/app/models/book.model';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {
  books: any[] = [];
  isLoading = true;
  error = '';

  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    this.bookService.getBooks().subscribe((books: Book[]) => {
      this.books = books;
      this.isLoading = false;

      if (books.length === 0) {
        this.error = 'No books available in this category.';
      }
    });
  }
}
