import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';
import { Author } from '../models/author.model';

@Injectable({
  providedIn: 'root'
})
export class AuthorService {

  private baseUrl = 'https://openlibrary.org';
  private authorCache: { [key: string]: string } = {};
  private wikidataUrl = 'https://www.wikidata.org/wiki/Special:EntityData';


  constructor(private http: HttpClient) {}

  getAuthorName(authorKey: string): Observable<string> {
    if (this.authorCache[authorKey]) {
      return of(this.authorCache[authorKey]);
    } else {
      const authorUrl = `${this.baseUrl}${authorKey}.json`;
      return this.http.get<any>(authorUrl).pipe(

        map((author:Author) => {
          const authorName = author.name;
          this.authorCache[authorKey] = authorName;
          return authorName;
        }),
        catchError((error) => {
          console.error(`Error fetching author ${authorKey}:`, error);
          return of('Unknown');
        })
      );
    }
  }


getAuthorDetails(authorId: string): Observable<any> {
  const authorUrl = `${this.baseUrl}/authors/${authorId}.json`;
  const worksUrl = `${this.baseUrl}/authors/${authorId}/works.json`;

  return forkJoin({
    author: this.http.get<any>(authorUrl),
    works: this.http.get<any>(worksUrl)
  }).pipe(
    switchMap(({ author, works }) => {
      const allSubjects = works.entries
        .filter((work: any) => work.subjects && work.subjects.length > 0)
        .flatMap((work: any) => work.subjects)
        .slice(0, 5);

      const wikidataId = author.remote_ids?.wikidata;

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

getAuthorPhoto(wikidataId: string | undefined): Observable<string> {
  if (!wikidataId) {
    return of('assets/default-cover.png');
  }

  const url = `${this.wikidataUrl}/${wikidataId}.json`;
  return this.http.get<any>(url).pipe(
    map(response => {
      const claims = response.entities[wikidataId]?.claims;
      const imageClaim = claims?.P18;  
      if (imageClaim && imageClaim.length > 0) {
        const fileName = imageClaim[0].mainsnak.datavalue.value;
        return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}`;
      }
      return 'assets/default-cover.png';
    }),
  );
}

}
