import { QueryFilter } from "../api/api-response.model";

export interface ControlQueryParam {
    page: number;
    limit: number;
    filter?: QueryFilter
}


export interface Control {
    id: number,
    title: string,
    description: string,
    status: string
    created_by: number,
    created_at: string,
    updated_at: string,

}


export interface CreateControl {
    title: string
    description: string
}