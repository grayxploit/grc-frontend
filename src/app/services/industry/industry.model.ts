import { QueryFilter } from "../api/api-response.model";

export interface Industry {
    id: number
    name: string;
    created_by:number;
    created_at:number;
    updated_by:number;
}


export interface IndustryQueryParam {
    page: number;
    limit: number;
    filter?: QueryFilter
}

export interface IndustryCreateRequest {
    name: string;
    
}

