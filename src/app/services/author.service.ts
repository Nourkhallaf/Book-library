import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';
import { Author } from '../models/author.model';

@Injectable({
  providedIn: 'root'
})
export class AuthorService {

  private baseUrl = 'https://openlibrary.org';
  private authorCache: { [key: string]: string } = {};  // Cache for author names
  private wikidataUrl = 'https://www.wikidata.org/wiki/Special:EntityData';


  constructor(private http: HttpClient) {}

  // Get author name by author key, use cache if available
  getAuthorName(authorKey: string): Observable<string> {
    if (this.authorCache[authorKey]) {
      // Return cached value if available
      return of(this.authorCache[authorKey]);
    } else {
      // Otherwise, fetch the author name from the API
      const authorUrl = `${this.baseUrl}${authorKey}.json`;
      return this.http.get<any>(authorUrl).pipe(

        map((author:Author) => {
          const authorName = author.name;
          // Cache the result
          this.authorCache[authorKey] = authorName;
          return authorName;
        }),
        catchError((error) => {
          console.error(`Error fetching author ${authorKey}:`, error);
          return of('Unknown');  // Return 'Unknown' if there's an error
        })
      );
    }
  }

  // Fetch author details by author ID

getAuthorDetails(authorId: string): Observable<any> {
  const authorUrl = `${this.baseUrl}/authors/${authorId}.json`;
  const worksUrl = `${this.baseUrl}/authors/${authorId}/works.json`;

  // Fetch author details and works in parallel
  return forkJoin({
    author: this.http.get<any>(authorUrl),
    works: this.http.get<any>(worksUrl)
  }).pipe(
    // Use switchMap to fetch the photoUrl asynchronously
    switchMap(({ author, works }) => {
      // Extract top 5 subjects from the works
      const allSubjects = works.entries
        .filter((work: any) => work.subjects && work.subjects.length > 0)
        .flatMap((work: any) => work.subjects)
        .slice(0, 5);

      const wikidataId = author.remote_ids?.wikidata;

      // Fetch photo URL or fallback to default if Wikidata ID is unavailable
      return this.getAuthorPhoto(wikidataId).pipe(
        map(photoUrl => ({
          id: authorId,
          name: author.name,
          birth_date: author.birth_date || 'Unknown',
          work_count: works.size || 0,
          top_subjects: Array.from(new Set(allSubjects)), 
          photo_url: photoUrl  
        }))
      );
    })
    );
  }

// Fetch the author photo from Wikidata using Wikidata ID
getAuthorPhoto(wikidataId: string | undefined): Observable<string> {
  if (!wikidataId) {
    // Return default photo if no Wikidata ID is available
    return of('assets/default-cover.png');
  }

  const url = `${this.wikidataUrl}/${wikidataId}.json`;

  return this.http.get<any>(url).pipe(
    map(response => {
      const claims = response.entities[wikidataId]?.claims;
      const imageClaim = claims?.P18;  // P18 is the property for the image
      if (imageClaim && imageClaim.length > 0) {
        const fileName = imageClaim[0].mainsnak.datavalue.value;
        return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}`;
      }
      return 'assets/default-cover.png';
    }),
   
  );
}

}
