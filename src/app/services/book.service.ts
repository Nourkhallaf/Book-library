import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable, of } from 'rxjs';
import { map, catchError, tap, filter } from 'rxjs/operators';
import { Book } from '../models/book.model';  // Import the Book interface
import { AuthorService } from './author.service';


@Injectable({
  providedIn: 'root'
})
export class BookService {
  private baseUrl = 'https://openlibrary.org';
  private subjectPath = 'subjects/finance.json';
  private subjectApiUrl = `${this.baseUrl}/${this.subjectPath}`;


  constructor(private http: HttpClient, private authorService: AuthorService) {}

  // Fetch the first 9 books from the Finance subject
  getBooks(limit: number = 9): Observable<Book[]> {
    return this.http.get<any>(`${this.subjectApiUrl}?limit=${limit}`).pipe(
      tap((response: any) => console.log('Response:', response)),  // Log the response
      map((response: any) => response.works.map((book: any): Book => {
        console.log('Book:', book);  // Log each book
        return {
          id: book.key.split('/').pop(),          
          title: book.title,
          cover_url: book.cover_id
            ? `https://covers.openlibrary.org/b/id/${book.cover_id}-L.jpg`
            : 'assets/default-cover.png', // Placeholder image if cover is missing
          // authors: book.authors ? book.authors.map((author: any) => author.name).join(', ') : 'Unknown',
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

      // Step 2: Fetch the authors (if they exist) or default to 'Unknown'
      const authorNames = await this.fetchAuthors(work.authors);

      // Step 3: Fetch the editions
      const editionsUrl = `${this.baseUrl}/works/${workId}/editions.json`;
      const editions = await this.fetchEditions(editionsUrl);


      const coverUrl = work.covers?.length > 0
      ? `https://covers.openlibrary.org/b/id/${work.covers[0]}-L.jpg`
      : 'assets/default-cover.png';  // Default cover if no cover is available

      // Step 4: Aggregate the data and return
      return this.buildBookDetails(work, authorNames, editions, coverUrl);
    } catch (error) {
      console.error('Error fetching book details:', error);
      return null; 
    }
  }

  private async fetchAuthors(authors: any[]): Promise<string[]> {
    if (!authors || authors.length === 0) {
      return ['Unknown'];  // Return 'Unknown' if no authors are present
    }

    const authorPromises = authors.map(authorRef =>
      this.authorService.getAuthorName(authorRef.author.key).toPromise()
    );

    // Await all author fetches
    const authorResults = await Promise.all(authorPromises);
    return authorResults.filter((author): author is string => author !== undefined);
  }

  private async fetchEditions(editionsUrl: string): Promise<any> {
    try {
      const editions = await this.http.get<any>(editionsUrl).toPromise();
      return editions;
    } catch (error) {
      console.error('Error fetching editions:', error);
      return { entries: [], size: 0 };  
    }
  }

  private buildBookDetails(work: any, authors: string[], editions: any, coverUrl: string): any {
    const editionCount = editions.size || 0;
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
      first_publish_year: work.first_publish_year,
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
      tap(response => console.log('API Response:', response)), // Log the response for debugging
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
              id: '', // Author IDs are not available here, so we leave it blank
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
  
  

    // searchBook(category: string, searchTerm: string): Observable<Book[]> {
    //   let searchUrl = '';
    
    //   if (category === 'title') {
    //     searchUrl = `${this.baseUrl}/search.json?title=${encodeURIComponent(searchTerm)}&limit=9`;
    //   } else if (category === 'author') {
    //     searchUrl = `${this.baseUrl}/search.json?author=${encodeURIComponent(searchTerm)}&limit=9`;
    //   } else if (category === 'subject') {
    //     searchUrl = `${this.baseUrl}/subjects/${encodeURIComponent(searchTerm)}.json?limit=9`;
    //   }
    //   return this.http.get<any>(searchUrl).pipe(
    //     tap(response => console.log('API Response:', response)), // Log the response for debugging
    //     map((response) => {
    //       if (response.works) {
    //         return response.works.map((work: any) => ({
    //           id: work.key.split('/').pop(),
    //           title: work.title,
    //           cover_url: work.cover_id
    //             ? `https://covers.openlibrary.org/b/id/${work.cover_id}-L.jpg`
    //             : 'assets/default-cover.png',
    //           // Log the authors before processing
    //           authors: Array.isArray(work.authors) ? work.authors : 'Unknown',
    //           first_publish_year: work.first_publish_year || 'Unknown',
    //         }));
    //       } else if (response.docs) {
    //         return response.docs.map((doc: any) => ({
    //           id: doc.key.split('/').pop(),
    //           title: doc.title,
    //           cover_url: doc.cover_i
    //             ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
    //             : 'assets/default-cover.png',
    //           authors: Array.isArray(doc.author_name) ? doc.author_name : 'Unknown',
    //           first_publish_year: doc.first_publish_year || 'Unknown',
    //         }));
    //       } else {
    //         return [];
    //       }
    //     }),
    //     catchError((error) => {
    //       console.error('Error fetching search results:', error);
    //       return of([]); 
    //     })
    //   );
    // }
    

    // searchBook(category: string, searchTerm: string): Observable<Book[]> {
    //   let searchUrl = '';
    
    //   if (category === 'title') {
    //     console.log("searchTerm1", searchTerm);
    //     searchUrl = `${this.baseUrl}/search.json?title=${encodeURIComponent(searchTerm)}`;
    //   } else if (category === 'author') {
    //     console.log("searchTerm2", searchTerm);

    //     searchUrl = `${this.baseUrl}/search.json?author=${encodeURIComponent(searchTerm)}`;
    //   } else if (category === 'subject') {
    //     console.log("searchTerm3", searchTerm);

    //     searchUrl = `${this.baseUrl}/subjects/${encodeURIComponent(searchTerm)}.json`;
    //   }
    
    //   return this.http.get<any>(searchUrl).pipe(
    //     tap(response => console.log('API Response:', response)), // Log the response for debugging
    //     map((response) => {
    //       // Check for works or docs in the response
    //       if (response.works) {
    //         console.log("response.works", response.works);
    //         // If works exist (likely from subject search)
    //         return response.works.map((work: any) => ({
    //           id: work.key.split('/').pop(),
    //           title: work.title,
    //           cover_url: work.cover_id
    //             ? `https://covers.openlibrary.org/b/id/${work.cover_id}-L.jpg`
    //             : 'assets/default-cover.png',
    //           // Ensure authors is always an array of objects
    //           authors: work.authors?.map((author: any) => ({
    //             id: author.key.split('/').pop(),
    //             name: author.name
    //           })) || [{ id: '', name: 'Unknown' }],
    //           first_publish_year: work.first_publish_year || 'Unknown',
    //         }));
    //       } else if (response.docs) {
    //         // If docs exist (likely from title/author search)
    //         console.log("response.docs", response.docs);

    //         return response.docs.map((doc: any) => ({
    //           id: doc.key.split('/').pop(),
    //           title: doc.title,
    //           cover_url: doc.cover_i
    //             ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
    //             : 'assets/default-cover.png',
    //           // Ensure authors is always an array of objects
    //           authors: doc.author_name?.map((author: string) => ({
    //             id: '', // Author IDs are not available here, so we leave it blank
    //             name: author
    //           })) || [{ id: '', name: 'Unknown' }],
    //           first_publish_year: doc.first_publish_year || 'Unknown',
    //         }));
    //       } else {
    //         return [];
    //       }
    //     }),
    //     catchError((error) => {
    //       console.error('Error fetching search results:', error);
    //       return of([]); 
    //     })
    //   );
    // }
    
  
}


// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable, of } from 'rxjs';
// import { map, catchError, tap } from 'rxjs/operators';
// import { Book } from '../models/book.model';  // Import the Book interface
// import { AuthorService } from './author.service';

// @Injectable({
//   providedIn: 'root',
// })
// export class BookService {
//   private baseUrl = 'https://openlibrary.org';
//   private subjectPath = 'subjects/finance.json';
//   private subjectApiUrl = `${this.baseUrl}/${this.subjectPath}`;

//   constructor(private http: HttpClient, private authorService: AuthorService) {}

//   // Fetch the first 9 books from the Finance subject
//   getBooks(limit: number = 9): Observable<Book[]> {
//     const url = `${this.subjectApiUrl}?limit=${limit}`;
//     return this.fetchBooks(url, 'works');
//   }

//   // Fetch book details
//   async getBookDetails(workId: string): Promise<any> {
//     const workUrl = `${this.baseUrl}/works/${workId}.json`;
//     const editionsUrl = `${this.baseUrl}/works/${workId}/editions.json`;

//     try {
//       const [work, editions] = await Promise.all([
//         this.http.get<any>(workUrl).toPromise(),
//         this.fetchEditions(editionsUrl),
//       ]);

//       const authorNames = await this.fetchAuthors(work.authors);
//       const coverUrl = this.getCoverUrl(work.covers);

//       return this.buildBookDetails(work, authorNames, editions, coverUrl);
//     } catch (error) {
//       console.error('Error fetching book details:', error);
//       return null;
//     }
//   }

//   // Search for books based on category and search term
//   searchBook(category: string, searchTerm: string): Observable<Book[]> {
//     const searchUrl = this.buildSearchUrl(category, searchTerm);
//     return this.fetchBooks(searchUrl, category === 'subject' ? 'works' : 'docs');
//   }

//   // Utility method to build the search URL based on category
//   private buildSearchUrl(category: string, searchTerm: string): string {
//     const encodedTerm = encodeURIComponent(searchTerm);
//     if (category === 'title') {
//       return `${this.baseUrl}/search.json?title=${encodedTerm}`;
//     } else if (category === 'author') {
//       return `${this.baseUrl}/search.json?author=${encodedTerm}`;
//     } else {
//       return `${this.baseUrl}/subjects/${encodedTerm}.json`;
//     }
//   }

//   // Fetch books with error handling
//   private fetchBooks(url: string, key: string): Observable<Book[]> {
//     return this.http.get<any>(url).pipe(
//       tap((response) => console.log('API Response:', response)), // Log the response for debugging
//       map((response) => this.mapToBooks(response[key] || [])), // Map the data to books
//       catchError((error) => {
//         console.error('Error fetching books:', error);
//         return of([]); // Return an empty array if there is an error
//       })
//     );
//   }

//   // Map the response data to Book objects
//   private mapToBooks(data: any[]): Book[] {
//     return data.map((item) => ({
//       id: item.key.split('/').pop(),
//       title: item.title,
//       cover_url: item.cover_id
//         ? `https://covers.openlibrary.org/b/id/${item.cover_id}-L.jpg`
//         : 'assets/default-cover.png',
//       authors: this.mapAuthors(item.authors || item.author_name),
//       first_publish_year: item.first_publish_year || 'Unknown',
//     }));
//   }

//   // Map authors (handle both array of objects and array of strings)
//   private mapAuthors(authors: any): { id: string; name: string }[] {
//     if (Array.isArray(authors)) {
//       if (typeof authors[0] === 'string') {
//         return authors.map((name: string) => ({ id: '', name }));
//       } else {
//         return authors.map((author: any) => ({
//           id: author.key ? author.key.split('/').pop() : '',
//           name: author.name,
//         }));
//       }
//     }
//     return [{ id: '', name: 'Unknown' }];
//   }

//   // Fetch editions with error handling
//   private async fetchEditions(editionsUrl: string): Promise<any> {
//     try {
//       const editions = await this.http.get<any>(editionsUrl).toPromise();
//       return editions || { entries: [], size: 0 };
//     } catch (error) {
//       console.error('Error fetching editions:', error);
//       return { entries: [], size: 0 };
//     }
//   }

//   // Fetch authors using the AuthorService
//   private async fetchAuthors(authors: any[]): Promise<string[]> {
//     if (!authors || authors.length === 0) return ['Unknown'];

//     const authorPromises = authors.map((author) =>
//       this.authorService.getAuthorName(author.author.key).toPromise()
//     );

//     const authorNames = await Promise.all(authorPromises);
//     return authorNames.filter((name) => name);
//   }

//   // Utility to get the cover URL
//   private getCoverUrl(covers: any[]): string {
//     return covers?.length
//       ? `https://covers.openlibrary.org/b/id/${covers[0]}-L.jpg`
//       : 'assets/default-cover.png';
//   }

//   // Build book details from the work, authors, and editions
//   private buildBookDetails(
//     work: any,
//     authors: string[],
//     editions: any,
//     coverUrl: string
//   ): any {
//     const editionCount = editions.size || 0;
//     const totalNumberOfPages = editions.entries?.reduce(
//       (sum: number, edition: any) => sum + (edition.number_of_pages || 0),
//       0
//     );

//     return {
//       id: work.key.split('/').pop(),
//       title: work.title,
//       authors: authors.join(', '),
//       first_publish_year: work.first_publish_year,
//       edition_count: editionCount,
//       number_of_pages: totalNumberOfPages || 0,
//       cover_url: coverUrl,
//     };
//   }
// }
