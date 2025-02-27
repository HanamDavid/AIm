import axios from "axios";
import { ACCESS_TOKEN } from "./constants";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Call Mistral via your Django backend
export const askMistral = async (message) => {
    try {
        const response = await api.post("/api/chat_with_mistral/", { message });
        console.log(response);
        return response.data.response;
    } catch (error) {
        console.error("Backend API Error:", error);
        return "Sorry, I couldn't process your request.";
    }
};

export default api;

