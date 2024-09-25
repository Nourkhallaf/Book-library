import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthorService } from '../../services/author.service';
import { Author } from '../../models/author.model';  // Import Author model

@Component({
  selector: 'app-author-detail-page',
  templateUrl: './author-details-page.component.html',
  styleUrls: ['./author-details-page.component.scss']
})
export class AuthorDetailsPageComponent implements OnInit {
  author: Author | null = null;
  isLoading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,  // To get the author ID from the URL
    private authorService: AuthorService  // Service to fetch author details
  ) {}

  async ngOnInit(): Promise<void> {
      const authorId = this.route.snapshot.paramMap.get('id');
      
      if (authorId) {
        this.authorService.getAuthorDetails(authorId).subscribe({
          next: (data) => {
            this.author = data;
            this.isLoading = false;
            console.log("author", this.author)
          },
          error: (err) => {
            this.error = 'Failed to load author details.';
            this.isLoading = false;
          }
        });
      } else {
        this.error = 'Invalid author ID.';
        this.isLoading = false;
      }
    }
    
  
}
