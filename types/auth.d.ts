export interface AuthState {
    message: string | null,
    statusCode: number | null,
    user: string | null,
    email: string | null,
    permissions: string[] | null,
    timestamp: number | null,
    setMessage: (message: string) => void
    setUser: (user: string) => void
    setEmail: (email: string) => void
    setTimestamp: (timestamp: number) => void
    setPermissions: (permissions: string[]) => void
    login: (email: string, password: string) => void
    logout: () => void
    checkExpiry: () => void

}

// Define the expected structure of the error response
export interface ErrorResponse {
  message: string;
}