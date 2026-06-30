import { QueryFilter } from "../../api/api-response.model";

export interface FrameworkCategoryQueryParam {
    page: number;
    limit: number;
    filter?: QueryFilter
}

export interface FrameworkCategory {
    id: number;
    name: string;
    description: string;
    status: string;
    slug: string;
    created_by: number;
    created_at: string;
    updated_at: string;
}

export interface FrameworkCategoryCreateRequest {
    name: string;
    description: string;
    status: string;
}

export interface ImportJobResponse {
    job_id: string;
    status: string;
}

export interface ImportProgressEvent {
    job_id?: string;
    status: string;
    progress?: number;
    message?: string;
    total?: number;
    processed?: number;
    total_rows?: number;
    processed_rows?: number;
    inserted_rows?: number;
    skipped_rows?: number;
    errors?: string[];
    error_message?: string | null;
}
