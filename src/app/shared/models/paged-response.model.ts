export interface SortDto {
  field: string;
  direction: string;
}

export interface PagedResponseDto<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  sort: SortDto[];
}
