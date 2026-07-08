import { CreatedBy, UpdatedBy } from "../api/api-response.model";

export interface CreateOrganizationRequest {
	name: string;
	email: string;
	phone: string;
	address: string;
	city: string;
	state: string;
	country: string;
	zipcode: string;
	industry: string;
	website: string;
	product_name: string;
	product_description: string;
	product_type: string;
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