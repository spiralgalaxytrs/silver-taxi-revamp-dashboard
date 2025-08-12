import axios, { AxiosError } from 'axios';
const APP_MODE = process.env.NEXT_PUBLIC_APP_MODE;

const base_url =
    String(APP_MODE).toLowerCase() === 'development'
        ? process.env.NEXT_PUBLIC_DEV_API_URL
        : process.env.NEXT_PUBLIC_API_URL;

if (!base_url) {
    throw new Error("Base URL is not defined. Check your environment variables.");
}

const instance = axios.create({
    baseURL: base_url,
});

instance.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('token');
        if (token && !config.headers.Authorization) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

instance.interceptors.response.use(
    (response) => {
        // Optional: Log only in development mode
        if (process.env.NEXT_PUBLIC_APP_MODE === 'development') {
            console.log('Response Interceptor Triggered', response.status);
        }
        return response;
    },
    (error) => {
        console.log('Response Interceptor Triggered', error, error?.response, error?.response?.status);
        if (error?.response) {
            if (error.response.status === 401) {
                localStorage.clear();
                window.location.href = '/login';
                console.error('Unauthorized: Redirect to login page');
            } else if (error.response.status === 403) { // Use 403 for forbidden access
                alert("Access denied.");
                console.error('Access Denied: Redirect to login page');
            }
        }
        return Promise.reject(error);
    }
);

export default instance;
export { AxiosError };