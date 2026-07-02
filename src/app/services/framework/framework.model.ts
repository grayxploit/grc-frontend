import { QueryFilter } from "../api/api-response.model";
import { FrameworkCategory } from './framework-category/framework-category.model'
export interface Framework {
    id: number;
    name: string;
    description: string;
    status: string;
    acronym: string;
    category: number | FrameworkCategory | undefined;
    official_url: string;
    published_date: string;
    version: string;
    created_by: number;
    created_at: string;
    updated_at: string;
}

export interface FrameworkCreateRequest {
    name: string;
    description: string;
    status: string;
    category: number | FrameworkCategory | undefined;
    official_url: string;
    published_date: string;
    version: string;
}

export interface FrameworkQueryParam {
    page: number;
    limit: number;
    filter?: QueryFilter
}