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