import { User } from "../user/user.service";

export interface LoginRequest {
    email: string;
    password: string;
}


export interface RegisterRequest {
    email: string;
    password: string;
    confirmPassword: string;
    full_name: string;
    phone?: string;
    is_subscriber: boolean;
    is_terms_accept: boolean;
}


export interface RegisterResponseData {
    email: string;
    full_name: string;
    phone: string;
    status: string;
    role: string;
    created_at: string;
    updated_at: string;
    id: number;
}


export interface LoginResponseData {
  token: {
    access_token: string;
    token_type: string;
  },

  user: User;
}

export interface RefreshTokenResponseData {
  token: {
    access_token: string;
    token_type: string;
  },
}