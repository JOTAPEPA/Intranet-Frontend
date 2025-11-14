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

export async function deleteData (url) {
    try {
        const response = await apiClient.delete(url);
        return response.data;
    } catch (error) {
        console.log("Error en la petición DELETE:", error.response ? error.response.data : error.message);
        throw error;
    }
}