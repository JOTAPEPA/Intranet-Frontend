import apiClient from "../plugins/axios.js";

export async function getData (url) {
    try{
        const response = await apiClient.get(url)
        return response.data;
    } catch ( error){
        console.log('Error en la peticion GET:', error.response ? error.response.data : error.message);
        throw error;
    }
}


export async function postData (url, data) {
    try {
        console.log("Datos backend:", data);
        const response = await apiClient.post(url, data);
        return response.data;
    
    } catch (error) {
        console.log("Error en la petición POST:", error.response ? error.response.data : error.message);
        throw error;
    }
}

export async function putData (url, data) {
    try {
        const response = await apiClient.put(url, data);
        return response.data;
    } catch (error) {
        console.log("Error en la petición PUT:", error.response ? error.response.data : error.message);
        throw error;
    }
}

export async function uploadFile (url, formData, onUploadProgress = null) {
    try {
        // Verificar que se recibió FormData
        if (!(formData instanceof FormData)) {
            throw new Error('Se esperaba FormData pero se recibió: ' + typeof formData);
        }

        const config = {
            headers: {
                // NO establecer Content-Type manualmente para FormData
                // El navegador lo establece automáticamente con el boundary correcto
            }
        };

        // Agregar callback de progreso si se proporciona
        if (onUploadProgress) {
            config.onUploadProgress = (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onUploadProgress(percentCompleted);
            };
        }

        // Debug logs
        console.log('🚀 Enviando archivo al backend:');
        console.log('  📍 URL:', url);
        console.log('  📦 FormData entries:');
        for (let [key, value] of formData.entries()) {
            if (value instanceof File) {
                console.log(`    ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
            } else {
                console.log(`    ${key}: "${value}"`);
            }
        }

        const response = await apiClient.post(url, formData, config);
        
        console.log('✅ Respuesta exitosa del backend:', {
            status: response.status,
            data: response.data
        });
        
        return response.data;
    } catch (error) {
        console.error("❌ Error en la subida de archivo:");
        console.error("  📍 URL:", url);
        console.error("  📝 Error completo:", error);
        
        if (error.response) {
            console.error("  🔴 Respuesta del servidor:", {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
                headers: error.response.headers
            });
        } else if (error.request) {
            console.error("  🔴 No se recibió respuesta del servidor:", error.request);
        } else {
            console.error("  🔴 Error de configuración:", error.message);
        }
        
        throw error;
    }
}