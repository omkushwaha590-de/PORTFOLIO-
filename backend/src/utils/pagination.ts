export interface PaginationInput {
  page: number;
  limit: number;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function toSkip({ page, limit }: PaginationInput): number {
  return (page - 1) * limit;
}

export function paginated<T>(items: T[], total: number, { page, limit }: PaginationInput): Paginated<T> {
  return { items, page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}
