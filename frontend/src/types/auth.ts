// DTO for login that is sent TO the backend
export interface LoginCredentials {
    email: string;
    password: string;
}

// The type for the response coming FROM the backend upon successful login
export interface AuthResponse {
    token: string;
}