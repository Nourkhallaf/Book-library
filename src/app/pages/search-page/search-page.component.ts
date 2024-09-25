import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Book } from 'src/app/models/book.model';
import { BookService } from 'src/app/services/book.service';

@Component({
  selector: 'app-search-page',
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.scss']
})
export class SearchPageComponent implements OnInit {
  searchForm!: FormGroup;
  books: Book[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(private fb: FormBuilder, private bookService: BookService) {}

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      searchKey: ['title', Validators.required],
      searchTerm: ['', Validators.required]
    });
  }

  get searchKey() {
    return this.searchForm.get('searchKey')?.value;
  }

  get searchTerm() {
    return this.searchForm.get('searchTerm')?.value;
  }

  performSearch(): void {
    if (this.searchForm.valid) {
      const searchKey = this.searchKey;
      const searchTerm = this.searchTerm;

      if (!searchTerm.trim()) {
        this.errorMessage = 'Please enter a valid search term.';
        return;
      }

      this.isLoading = true;
      this.errorMessage = '';

      this.bookService.searchBook(searchKey, searchTerm).subscribe({
        next: (books: Book[]) => {
          this.isLoading = false;
          this.books = books.slice(0, 9);
          if (this.books.length === 0) {
            this.errorMessage = 'No results found for your search.';
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'Failed to load search results. Please try again later.';
          console.error('Error fetching search results:', error);
        }

      });
    }
  }

}


