export interface ApiResponse<T> {
  data: T;
  status: number;
  headers: any;
}


export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

export interface ErrorResponse {
  message?: string;
  code?: string;
  error?: string;
  validationErrors?: { [key: string]: string };
}

export interface ParsedCookie {
  name: string;
  value: string;
  options: string[];
}


export interface AuthToken {
  userId: string;
  exp?: number;
  [key: string]: any;
}

export interface PaginationMeta {
  total: number;
  page: number;
  size: number;
}

export interface PaginatedResponse<T> {
  status: string;
  message: string;
  meta: PaginationMeta;
  data: T[];
}

export interface QueryFilter {
  [key: string]: any
}