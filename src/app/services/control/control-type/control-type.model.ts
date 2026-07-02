import { QueryFilter } from "../../api/api-response.model";

export interface ControlType {
    id: number;
    name: string;
    created_by: number;
    created_at: string;
    updated_at: string;
}

export interface ControlTypeCreateRequest {
    name: string;
}

export interface ControlTypeQueryParam {
    page: number;
    limit: number;
    filter?: QueryFilter
}
