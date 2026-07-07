import { CreatedBy } from "../api/api-response.model";

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



export interface Organization{
    id: string;
    name: string;
    description: string;
    industry: string;
    phone: string;
    email: string;
    website: string;
    address: string;
    created_by: CreatedBy
}