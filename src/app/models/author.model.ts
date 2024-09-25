export interface Author {
  id: string;  
  name: string;
  birth_date?: string;  
  photo_url?: string;  
  work_count: number;
  top_subjects?: string[];  
}
