import { QueryFilter } from "../api/api-response.model";

export interface SocialMedia {
    name: string;
    link: string;
    owner_id: number;
    owner_type: string;
}

export interface OrganizationCreator {
    id: string;
    name: string;
}

export interface UserOrganization {
    id: string;
    name: string;
    description: string | null;
    phone: string;
    email: string;
    website: string;
    address: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    zip_code: string | null;
    created_by: OrganizationCreator;
}

export interface Address {
    address_1?: string;
    address_2?: string;
    city?: string;
    state?: string;
    country?: string;
    zip_code?: string;
}

export interface User {
    id: string;
    email: string;
    full_name: string;
    phone: string;
    status: string;
    role: string;
    organization: string | null;
    profile_image_url?: string;
    addresses?: Address[];
    social_media?: SocialMedia[];
    user_organizations?: UserOrganization;
    created_at?: string;
    updated_at?: string;
}

export interface UserResponse {
    data: User;
    message?: string;
    status?: string;
}

export interface UpdateSocialLinksRequest {
    facebook: string;
    x: string;
    linkedin: string;
    instagram: string;
}

export interface UpdateSocialLinkRequest {
    name: string;
    url: string;
}

export interface UpdateAddressRequest {
    address_1: string;
    city: string;
    state: string;
    country: string;
    zip_code: string;
    address_2: string;
}

export interface UpdateProfileRequest {
    email: string;
    full_name: string;
    phone: string;
    social_links?: UpdateSocialLinkRequest[];
    address?: UpdateAddressRequest;
}

export interface LoginLogQueryParam {
    page: number;
    size: number;
    filter?: QueryFilter
}


export interface LoginLog {
    ip_address: string;
    city: string;
    country: string;
    device_info: {
        os: string;
        device: string;
        is_bot: boolean;
        browser: string;
        is_mobile: boolean;
        is_tablet: boolean;
    }
    user_agent: string;
}