import { CreatedBy, QueryFilter } from "../api/api-response.model";

export interface Industry {
    id: string;
    name: string;
    created_by?: CreatedBy;
    created_at:number;
    updated_by:number;
}


export interface IndustryQueryParam {
    page: number;
    size?: number;
    name?: string;
    filter?: QueryFilter
}

export interface IndustryCreateRequest {
    name: string;
    
}

export interface IndustryDropdownResponse {
    id: string;
    name: string;
}

