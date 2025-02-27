import axios from "axios";
import { ACCESS_TOKEN } from "./constants";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL
});

console.log(import.meta.env.VITE_API_URL)
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

export const askMistral = async (message, sessionId) => {
  const token = localStorage.getItem("access_token");
  console.log("Session ID in API call:", sessionId); // Debugging

  try {
    const response = await api.post(
      "/api/chat_with_mistral/",
      { message, session_id: sessionId },  // Send session_id here
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      }
    );
    console.log("Backend response:", response);
    return response.data.response;
  } catch (error) {
    console.error("Backend API Error:", error.response?.data || error.message);
    return "Sorry, I couldn't process your request.";
  }
};



export default api;

