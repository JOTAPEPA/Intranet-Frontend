import { uploadFile } from './apiClient.js';

/**
 * Servicio para manejar la subida de archivos a Cloudinary a través del backend
 */
class CloudinaryService {
    
    /**
     * Sube un archivo a Cloudinary a través del endpoint específico del departamento
     * @param {File} file - El archivo a subir
     * @param {Object} options - Opciones adicionales para la subida
     * @param {string} options.category - Categoría/departamento para determinar la ruta
     * @param {string} options.folder - Carpeta en Cloudinary donde guardar el archivo
     * @param {string} options.resourceType - Tipo de recurso (image, video, raw, auto)
     * @param {Function} options.onProgress - Callback para mostrar progreso de subida
     * @returns {Promise<Object>} Respuesta con la información del archivo subido
     */
    async uploadFile(file, options = {}) {
        try {
            // Validar que se haya proporcionado un archivo
            if (!file) {
                throw new Error('No se ha proporcionado un archivo para subir');
            }

            // Validar tamaño del archivo (máximo 10MB por defecto)
            const maxSize = options.maxSize || 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                throw new Error(`El archivo es demasiado grande. Tamaño máximo: ${maxSize / (1024 * 1024)}MB`);
            }

            // Determinar la ruta según la categoría
            const category = options.category || 'compras';
            const route = this.getDepartmentRoute(category);

            // Crear FormData para enviar el archivo
            const formData = new FormData();
            formData.append('documentos', file); // Tu backend espera 'documentos'
            
            // Agregar opciones adicionales
            if (options.folder) {
                formData.append('folder', options.folder);
            }
            
            if (options.resourceType) {
                formData.append('resource_type', options.resourceType);
            }

            // Agregar metadatos adicionales
            if (options.metadata) {
                Object.keys(options.metadata).forEach(key => {
                    formData.append(`metadata[${key}]`, options.metadata[key]);
                });
            }

            // Realizar la petición al backend usando uploadFile para progreso
            const response = await uploadFile(route, formData, options.onProgress);
            
            return {
                success: true,
                data: response,
                message: 'Archivo subido exitosamente'
            };

        } catch (error) {
            console.error('Error al subir archivo a Cloudinary:', error);
            
            return {
                success: false,
                error: error.message || 'Error desconocido al subir el archivo',
                data: null
            };
        }
    }

    /**
     * Sube múltiples archivos a Cloudinary
     * @param {FileList|Array} files - Lista de archivos a subir
     * @param {Object} options - Opciones para la subida
     * @param {string} options.category - Categoría/departamento para determinar la ruta
     * @param {Function} options.onProgress - Callback para mostrar progreso total
     * @param {Function} options.onFileProgress - Callback para mostrar progreso por archivo
     * @returns {Promise<Array>} Array con los resultados de cada subida
     */
    async uploadMultipleFiles(files, options = {}) {
        try {
            const fileArray = Array.from(files);
            const results = [];
            const total = fileArray.length;
            const category = options.category || 'compras';

            for (let i = 0; i < fileArray.length; i++) {
                const file = fileArray[i];
                
                // Callback de progreso por archivo
                if (options.onFileProgress) {
                    options.onFileProgress(i + 1, total, file.name);
                }

                const result = await this.uploadFile(file, {
                    ...options,
                    category: category,
                    folder: options.folder || category
                });

                results.push({
                    file: file.name,
                    ...result
                });

                // Callback de progreso general
                if (options.onProgress) {
                    options.onProgress(i + 1, total);
                }
            }

            return results;

        } catch (error) {
            console.error('Error al subir múltiples archivos:', error);
            throw error;
        }
    }

    /**
     * Elimina un archivo de Cloudinary a través del backend
     * @param {string} publicId - ID público del archivo en Cloudinary
     * @param {string} resourceType - Tipo de recurso (image, video, raw)
     * @param {string} category - Categoría/departamento para determinar la ruta
     * @returns {Promise<Object>} Respuesta de la eliminación
     */
    async deleteFile(publicId, resourceType = 'image', category = 'compras') {
        try {
            const route = this.getDepartmentRoute(category);
            
            const response = await postData(`${route}/delete`, {
                public_id: publicId,
                resource_type: resourceType
            });

            return {
                success: true,
                data: response,
                message: 'Archivo eliminado exitosamente'
            };

        } catch (error) {
            console.error('Error al eliminar archivo de Cloudinary:', error);
            
            return {
                success: false,
                error: error.message || 'Error al eliminar el archivo',
                data: null
            };
        }
    }

    /**
     * Genera URL de transformación de imagen
     * @param {string} publicId - ID público de la imagen
     * @param {Object} transformations - Transformaciones a aplicar
     * @returns {string} URL transformada de la imagen
     */
    getTransformedImageUrl(publicId, transformations = {}) {
        const baseUrl = 'https://res.cloudinary.com/';
        const cloudName = 'dvqn0avdc'; // Cambiar por tu cloud name
        
        let transformString = '';
        
        if (transformations.width) transformString += `w_${transformations.width},`;
        if (transformations.height) transformString += `h_${transformations.height},`;
        if (transformations.crop) transformString += `c_${transformations.crop},`;
        if (transformations.quality) transformString += `q_${transformations.quality},`;
        if (transformations.format) transformString += `f_${transformations.format},`;
        
        // Remover la última coma
        transformString = transformString.replace(/,$/, '');
        
        return `${baseUrl}${cloudName}/image/upload/${transformString ? transformString + '/' : ''}${publicId}`;
    }

    /**
     * Mapeo de categorías a rutas de backend
     */
    getDepartmentRoute(category) {
        const routeMap = {
            'compras': '/compras',
            'contabilidad': '/contabilidad',
            'control-interno': '/control-interno',
            'credito': '/credito',
            'gerencia': '/gerencia',
            'riesgos': '/riesgos',
            'talento-humano': '/talento-humano',
            'tesoreria': '/tesoreria'
        };
        
        return routeMap[category] || '/compras'; // fallback a compras por defecto
    }

    /**
     * Sube un archivo a través del backend (método principal para el componente)
     * @param {File} file - El archivo a subir
     * @param {Object} metadata - Metadatos adicionales del documento
     * @param {Function} onProgress - Callback para progreso
     * @returns {Promise<Object>} Respuesta del backend
     */
    async uploadToBackend(file, metadata = {}, onProgress = null) {
        try {
            // Validar que se haya proporcionado un archivo
            if (!file) {
                throw new Error('No se ha proporcionado un archivo para subir');
            }

            // Validar tipo de archivo
            if (!this.validateFileType(file)) {
                throw new Error('Tipo de archivo no permitido. Solo se permiten: PDF, DOC, DOCX, XLS, XLSX, JPG, JPEG, PNG');
            }

            // Validar tamaño de archivo
            if (!this.validateFileSize(file, 10)) {
                throw new Error('El archivo es demasiado grande. Tamaño máximo: 10MB');
            }

            console.log('📋 Archivo a subir:', {
                name: file.name,
                size: this.formatFileSize(file.size),
                type: file.type,
                category: metadata.category
            });

            // Determinar la ruta según la categoría del departamento
            const category = metadata.category || 'compras';
            const route = this.getDepartmentRoute(category);

            // Crear FormData para enviar tanto el archivo como los datos
            const formData = new FormData();
            
            // CRÍTICO: El backend espera exactamente estos campos en este orden:
            // 1. Campo "documento" (string requerido) - el título/descripción del documento
            const documentoValue = metadata.title || `Documento de ${category}`;
            formData.append('documento', documentoValue);
            
            // 2. Campo "documentos" (archivo) - el backend usa upload.array('documentos', 10)
            formData.append('documentos', file);

            // Debug: Log para verificar FormData
            console.log('📦 FormData preparado:');
            console.log('  - documento:', documentoValue);
            console.log('  - archivo:', file.name, `(${this.formatFileSize(file.size)})`);
            console.log('  - ruta:', route);
            console.log('  - URL completa:', `http://localhost:5000/api${route}`);

            // Log adicional para debug
            for (let [key, value] of formData.entries()) {
                console.log(`📋 FormData[${key}]:`, value instanceof File ? `File: ${value.name}` : value);
            }

            // Realizar la petición al backend con la ruta específica del departamento
            const response = await uploadFile(route, formData, onProgress);
            
            console.log('✅ Respuesta exitosa del backend:', response);
            
            return {
                success: true,
                data: response,
                message: `Archivo subido exitosamente a ${category}`
            };

        } catch (error) {
            console.error('❌ Error al subir archivo a través del backend:', error);
            
            // Proporcionar mensajes de error más específicos
            let errorMessage = 'Error desconocido al subir el archivo';
            
            if (error.response) {
                // Error de respuesta del servidor
                errorMessage = error.response.data?.message || error.response.data?.error || `Error del servidor: ${error.response.status}`;
            } else if (error.request) {
                // Error de red
                errorMessage = 'Error de conexión. Verifica que el servidor esté ejecutándose.';
            } else {
                // Error de validación o configuración
                errorMessage = error.message;
            }
            
            return {
                success: false,
                error: errorMessage,
                data: null
            };
        }
    }

    /**
     * Valida el tipo de archivo
     * @param {File} file - Archivo a validar
     * @param {Array} allowedExtensions - Extensiones permitidas
     * @returns {boolean} True si el archivo es válido
     */
    validateFileType(file, allowedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png']) {
        const fileExtension = file.name.split('.').pop().toLowerCase();
        return allowedExtensions.includes(fileExtension);
    }

    /**
     * Valida el tamaño del archivo
     * @param {File} file - El archivo a validar
     * @param {number} maxSizeMB - Tamaño máximo en MB
     * @returns {boolean} True si el archivo es válido
     */
    validateFileSize(file, maxSizeMB = 10) {
        const fileSizeMB = file.size / (1024 * 1024);
        return fileSizeMB <= maxSizeMB;
    }

    /**
     * Convierte bytes a formato legible
     * @param {number} bytes - Cantidad de bytes
     * @returns {string} Tamaño formateado
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Exportar instancia única del servicio
export default new CloudinaryService();
