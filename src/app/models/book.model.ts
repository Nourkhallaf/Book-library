import { Author } from "./author.model";

export interface Book {
    id: string;
    title: string;
    cover_url?: string;  // URL for the cover image, optional
    authors: Author[];   // Array of authors
    first_publish_year: number;
    edition_count?: number;
    number_of_pages?: number;
  }

  