// Generic API response types for paginated Django REST Framework responses

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
