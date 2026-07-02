export interface Framework {
    id: number;
    name: string;
    description: string;
    status: string;
    category: number;
    official_url: string;
    published_date: string;
    version: string;
    created_by: number;
    created_at: string;
    updated_at: string;
}

export interface FrameworkCreateRequest {
    name: string;
    description: string;
    status: string;
    category: number;
    official_url: string;
    published_date: string;
    version: string;
}