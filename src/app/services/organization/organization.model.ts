import { CreatedBy, UpdatedBy } from "../api/api-response.model";



export interface OrganizationRequest {
    name: string;
    description: string;
    industry: string;
    phone: string;
    email: string;
    city: string;
    state: string;
    country: string;
    zip_code: string;
    website: string;
    address: string;
}

export interface CreateOrganizationRequest extends OrganizationRequest {
	
	product_name: string;
	product_description: string;
	product_type: string;
}

export interface UpdateOrganizationRequest extends OrganizationRequest {
	
}

interface Industry {
    id: string;
    name: string;
}

export interface Organization{
    id: string;
    name: string;
    description: string;
    industry: Industry;
    phone: string;
    email: string;
	city: string;
	state: string;
	country: string;
	zip_code: string;
    website: string;
    address: string;
    created_by: CreatedBy
	created_at: string;
	updated_at: string;
}

export interface GetOrganizationResponse extends  Organization{
	updated_by: UpdatedBy;
}