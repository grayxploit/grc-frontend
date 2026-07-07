import { CreatedBy, QueryFilter } from "../../api/api-response.model";

export interface ControlType {
    id: number;
    name: string;
    created_by?: CreatedBy;
    created_at: string;
    updated_at: string;
}

export interface ControlTypeCreateRequest {
    name: string;
}

export interface ControlTypeUpdateRequest {
    name: string;
}
export interface ControlTypeQueryParam {
    page: number;
    size: number;
    name?: string;
    filter?: QueryFilter
}
