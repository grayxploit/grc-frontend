import { QueryFilter } from "../api/api-response.model";
import { Framework } from "../framework/framework.model";
import { ControlType } from "./control-type/control-type.model";

export type ControlSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ControlQueryParam {
    page: number;
    limit: number;
    filter?: QueryFilter
}


export interface Control {
    id: number,
    title: string,
    description: string,
    status?: string,
    frameworks?: Array<FrameworkControl>,
    primary_control_area: string,
    control_type: ControlType,
    created_by: number,
    created_at: string,
    updated_at: string,

}

export interface FrameworkControl {
    id: number,
    severity: ControlSeverity,
    framework_id?: number,
    framework:Framework
}
export interface CreateControl {
    title: string
    description: string

    frameworks: CreateControlFramework[]
    primary_control_area: string
    type: number
}

export interface CreateControlFramework {
    frameworkId?: number
    severity: ControlSeverity
}
