import axios from "axios";
import { useAuth } from "../stores/store.js";
import { router } from "../router/index.js";

const apiClient = axios.create({
    baseURL: "http://localhost:5000/api",
    timeout: 10000 // 10 segundos de timeout
})

// Interceptor de peticiones - Agregar token automáticamente
apiClient.interceptors.request.use(
    (config) => {
        // Obtener token del store o localStorage
        const authStore = useAuth();
        let token = authStore.token;
        
        // Si no hay token en el store, intentar obtenerlo del localStorage
        if (!token) {
            try {
                const dataStore = JSON.parse(localStorage.getItem("Auth") || "{}");
                const dataStoreSimple = JSON.parse(localStorage.getItem("auth") || "{}");
                token = dataStore?.token || dataStoreSimple?.token || "";
            } catch (error) {
                console.warn("Error al leer token del localStorage:", error);
                token = "";
            }
        }
        
        // Agregar headers
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // CRÍTICO: NO establecer Content-Type para FormData
        // El navegador debe establecerlo automáticamente con el boundary correcto
        if (!(config.data instanceof FormData)) {
            config.headers["Content-Type"] = "application/json";
        }
        
        config.headers["Accept"] = "application/json";

        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
            hasToken: !!token,
            contentType: config.headers["Content-Type"] || 'auto-detected',
            isFormData: config.data instanceof FormData,
            headers: config.headers
        });

        return config;
    },
    (error) => {
        console.error("[API Request Error]", error);
        return Promise.reject(error);
    }
)

// Interceptor de respuestas - Manejar errores de autenticación
apiClient.interceptors.response.use(
    (response) => {
        console.log(`[API Response] ${response.status} ${response.config.url}`);
        return response;
    },
    (error) => {
        console.error("[API Response Error]", {
            status: error.response?.status,
            message: error.response?.data?.message || error.message,
            url: error.config?.url
        });

        // Manejar errores de autenticación
        if (error.response?.status === 401) {
            console.warn("Token inválido o expirado. Cerrando sesión...");
            
            // Limpiar autenticación
            const authStore = useAuth();
            authStore.logOut();
            
            // Redirigir al login si no estamos ya allí
            if (router.currentRoute.value.name !== 'login') {
                router.push({ name: 'login' });
            }
        }
        
        // Manejar errores de permisos
        if (error.response?.status === 403) {
            console.warn("Acceso denegado - Permisos insuficientes");
            // Opcional: mostrar notificación o redirigir
        }

        return Promise.reject(error);
    }
)

export default apiClient;