import { Role } from '@/interfaces/enums';
import { User } from '@/interfaces/interfaces';

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    access_token: string;
    user: User;
    expires_in: number;
}

export interface AuthUser {
    userId: string;
    name: string;
    username: string;
    role: Role;
    storeId: string;
}