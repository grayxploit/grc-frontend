import { CreatedBy, QueryFilter } from "../api/api-response.model";
import { FrameworkCategory } from './framework-category/framework-category.model'
import { Industry } from '../industry/industry.model';
export interface Framework {
    id: string;
    name: string;
    description: string;
    status: string;
    acronym: string;
    category: number | FrameworkCategory | undefined;
    official_url: string;
    published_date: string;
    version: string;
    created_by?: CreatedBy;
    created_at: string;
    updated_at: string;
    industries?: Industry[];
}

export interface FrameworkCreateRequest {
    name: string;
    description: string;
    status: string;
    category: string;
    official_url: string;
    published_date: string;
    version: string;
    industries: { industry_id: string }[];
}

export interface FrameworkQueryParam {
    page: number;
    limit: number;
    filter?: QueryFilter
}

export interface FrameworkUpdateRequest {
    name: string;
    description: string;
    status: string;
    category: string;
    official_url: string;
    published_date: string;
    version: string;
    industries: { industry_id: string }[];
}