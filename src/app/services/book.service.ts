import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Book } from '../models/book.model';
import { AuthorService } from './author.service';


@Injectable({
  providedIn: 'root'
})
export class BookService {
  private baseUrl = 'https://openlibrary.org';
  private subjectPath = 'subjects/finance.json';
  private subjectApiUrl = `${this.baseUrl}/${this.subjectPath}`;


  constructor(private http: HttpClient, private authorService: AuthorService) {}

  getBooks(limit: number = 9): Observable<Book[]> {
    return this.http.get<any>(`${this.subjectApiUrl}?limit=${limit}`).pipe(
      // tap((response: any) => console.log('Response:', response)),
      map((response: any) => response.works.map((book: any): Book => {
        return {
          id: book.key.split('/').pop(),
          title: book.title,
          cover_url: book.cover_id
            ? `https://covers.openlibrary.org/b/id/${book.cover_id}-L.jpg`
            : 'assets/default-cover.png',
          authors: book.authors?.map((author: any) => ({
            id: author.key.split('/').pop(),
            name: author.name
            })) || [{ id: '', name: 'Unknown' }],
          first_publish_year: book.first_publish_year || 'Unknown'
        };
      })),
      catchError(error => {
        console.error('Error fetching books:', error);
        return of([]);
      })
    );
  }



  async getBookDetails(workId: string): Promise<any> {
    try {
      // Step 1: Fetch the work details
      const workUrl = `${this.baseUrl}/works/${workId}.json`;
      const work = await this.http.get<any>(workUrl).toPromise();

      // Step 2: Fetch the authors
      const authorNames = await this.fetchAuthors(work.authors);

      // Step 3: Fetch the editions
      const editionsUrl = `${this.baseUrl}/works/${workId}/editions.json`;
      const editions = await this.fetchEditions(editionsUrl);


      const coverUrl = work.covers?.length > 0
      ? `https://covers.openlibrary.org/b/id/${work.covers[0]}-L.jpg`
      : 'assets/default-cover.png';

      // Step 4: Aggregate the data and return
      return this.buildBookDetails(work, authorNames, editions, coverUrl);
    } catch (error) {
      console.error('Error fetching book details:', error);
      return null;
    }
  }

  private async fetchAuthors(authors: any[]): Promise<string[]> {
    if (!authors || authors.length === 0) {
      return ['Unknown'];
     }

    const authorPromises = authors.map(authorRef =>
      this.authorService.getAuthorName(authorRef.author.key).toPromise()
    );

    const authorResults = await Promise.all(authorPromises);
    return authorResults.filter((author): author is string => author !== undefined);
  }

  private async fetchEditions(editionsUrl: string): Promise<any> {
    try {
      const editions = await this.http.get<any>(editionsUrl).toPromise();

      let publishYear = 'Unknown';
      if (editions.entries && editions.entries.length > 0) {
        const firstEdition = editions.entries[0];
        publishYear = firstEdition.publish_date || firstEdition.first_publish_year || 'Unknown';
      }
      return { ...editions, publishYear };
    } catch (error) {
      console.error('Error fetching editions:', error);
      return { entries: [], size: 0 };
    }
  }

  private buildBookDetails(work: any, authors: string[], editions: any, coverUrl: string): any {
    const editionCount = editions.size || 0;
    const publishYear = editions.publishYear || work.first_publish_year || 'Unknown';
    let totalNumberOfPages = 0;

    for (const edition of editions.entries || []) {
      if (edition.number_of_pages) {
        totalNumberOfPages += edition.number_of_pages;
      }
    }

    return {
      id: work.key.split('/').pop(),
      title: work.title,
      authors: authors.join(', '),
      first_publish_year: publishYear,
      edition_count: editionCount,
      number_of_pages: totalNumberOfPages,
      cover_url: coverUrl
    };
  }

  searchBook(category: string, searchTerm: string): Observable<Book[]> {
    let searchUrl = '';
    const limit = 9;

  if (category === 'title') {
    searchUrl = `${this.baseUrl}/search.json?title=${encodeURIComponent(searchTerm)}&limit=${limit}`;
  } else if (category === 'author') {
    searchUrl = `${this.baseUrl}/search.json?author=${encodeURIComponent(searchTerm)}&limit=${limit}`;
  } else if (category === 'subject') {
    searchUrl = `${this.baseUrl}/search.json?subject=${encodeURIComponent(searchTerm)}&limit=${limit}`;
  }
    return this.http.get<any>(searchUrl).pipe(
      // tap(response => console.log('API Response:', response)),
      map((response) => {
        if (response.works) {
          return response.works.map((work: any) => ({
            id: work.key.split('/').pop(),
            title: work.title,
            cover_url: work.cover_id
              ? `https://covers.openlibrary.org/b/id/${work.cover_id}-L.jpg`
              : 'assets/default-cover.png',
            authors: work.authors?.map((author: any) => ({
              id: author.key.split('/').pop(),
              name: author.name
            })) || [{ id: '', name: 'Unknown' }],
            first_publish_year: work.first_publish_year || 'Unknown',
          }));
        } else if (response.docs) {
          return response.docs.map((doc: any) => ({
            id: doc.key.split('/').pop(),
            title: doc.title,
            cover_url: doc.cover_i
              ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
              : 'assets/default-cover.png',
            authors: doc.author_name?.map((author: string) => ({
              id: '',
              name: author
            })) || [{ id: '', name: 'Unknown' }],
            first_publish_year: doc.first_publish_year || 'Unknown',
          }));
        } else {
          return [];
        }
      }),
      catchError((error) => {
        console.error('Error fetching search results:', error);
        return of([]);
      })
    );
  }
}

