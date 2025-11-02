// DTO for innlogging som sendes TIL backend
export interface LoginCredentials {
    email: string;
    password: string;
}

// Typen for responsen som kommer FRA backend ved vellykket innlogging
export interface AuthResponse {
    token: string;
}