import { getData, postData, putData } from './apiClient.js';

/**
 * Servicio para manejar operaciones con documentos
 */
class DocumentService {
    
    /**
     * Obtiene todos los documentos de un departamento específico
     * @param {string} department - Nombre del departamento
     * @returns {Promise<Array>} Lista de documentos
     */
    async getDocuments(department = 'compras') {
        try {
            const route = this.getDepartmentRoute(department);
            const response = await getData(route);
            return response.data || [];
        } catch (error) {
            console.error(`Error obteniendo documentos de ${department}:`, error);
            throw error;
        }
    }

    /**
     * Obtiene un documento específico por ID
     * @param {string} id - ID del documento
     * @param {string} department - Departamento del documento
     * @returns {Promise<Object>} Documento encontrado
     */
    async getDocumentById(id, department = 'compras') {
        try {
            const route = this.getDepartmentRoute(department);
            const response = await getData(`${route}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error obteniendo documento ${id}:`, error);
            throw error;
        }
    }

    /**
     * Crea un nuevo documento (sin archivos)
     * @param {Object} documentData - Datos del documento
     * @param {string} department - Departamento del documento
     * @returns {Promise<Object>} Documento creado
     */
    async createDocument(documentData, department = 'compras') {
        try {
            const route = this.getDepartmentRoute(department);
            const response = await postData(route, documentData);
            return response;
        } catch (error) {
            console.error(`Error creando documento en ${department}:`, error);
            throw error;
        }
    }

    /**
     * Actualiza un documento existente
     * @param {string} id - ID del documento
     * @param {Object} documentData - Nuevos datos del documento
     * @param {string} department - Departamento del documento
     * @returns {Promise<Object>} Documento actualizado
     */
    async updateDocument(id, documentData, department = 'compras') {
        try {
            const route = this.getDepartmentRoute(department);
            const response = await putData(`${route}/${id}`, documentData);
            return response;
        } catch (error) {
            console.error(`Error actualizando documento ${id}:`, error);
            throw error;
        }
    }

    /**
     * Elimina un documento
     * @param {string} id - ID del documento
     * @param {string} department - Departamento del documento
     * @returns {Promise<Object>} Resultado de la eliminación
     */
    async deleteDocument(id, department = 'compras') {
        try {
            const route = this.getDepartmentRoute(department);
            
            // Usar el cliente HTTP configurado en lugar de fetch directo
            const response = await fetch(`http://localhost:5000/api${route}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    // Agregar token de autorización si existe
                    ...(localStorage.getItem('auth') && {
                        'Authorization': `Bearer ${JSON.parse(localStorage.getItem('auth')).token}`
                    })
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            console.log('✅ Documento eliminado exitosamente:', result);
            
            return result;
            
        } catch (error) {
            console.error(`❌ Error eliminando documento ${id}:`, error);
            throw error;
        }
    }

    /**
     * Mapeo de departamentos a rutas de API
     */
    getDepartmentRoute(department) {
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
        
        return routeMap[department] || '/compras';
    }

    /**
     * Formatea los datos de un documento para mostrar en la UI
     * @param {Object} document - Documento de la base de datos
     * @returns {Object} Documento formateado
     */
    formatDocumentForDisplay(document) {
        return {
            id: document._id,
            titulo: document.documento,
            fechaCreacion: this.formatDate(document.createdAt),
            fechaActualizacion: this.formatDate(document.updatedAt),
            cantidadArchivos: document.documentos ? document.documentos.length : 0,
            archivos: document.documentos ? document.documentos.map(file => ({
                id: file._id,
                nombre: file.originalName,
                url: file.url,
                formato: file.format,
                tamaño: this.formatFileSize(file.bytes),
                fechaSubida: this.formatDate(file.uploadDate)
            })) : [],
            tieneArchivos: document.documentos && document.documentos.length > 0
        };
    }

    /**
     * Obtiene documentos formateados para mostrar en tabla
     * @param {string} department - Departamento
     * @returns {Promise<Array>} Documentos formateados
     */
    async getDocumentsForTable(department = 'compras') {
        try {
            const documents = await this.getDocuments(department);
            return documents.map(doc => this.formatDocumentForDisplay(doc));
        } catch (error) {
            console.error('Error obteniendo documentos para tabla:', error);
            throw error;
        }
    }

    /**
     * Busca documentos por término
     * @param {string} searchTerm - Término de búsqueda
     * @param {string} department - Departamento
     * @returns {Promise<Array>} Documentos que coinciden con la búsqueda
     */
    async searchDocuments(searchTerm, department = 'compras') {
        try {
            const documents = await this.getDocumentsForTable(department);
            
            if (!searchTerm) return documents;
            
            const term = searchTerm.toLowerCase();
            return documents.filter(doc => 
                doc.titulo.toLowerCase().includes(term) ||
                doc.archivos.some(file => file.nombre.toLowerCase().includes(term))
            );
        } catch (error) {
            console.error('Error buscando documentos:', error);
            throw error;
        }
    }

    /**
     * Obtiene estadísticas de documentos
     * @param {string} department - Departamento
     * @returns {Promise<Object>} Estadísticas
     */
    async getDocumentStats(department = 'compras') {
        try {
            const documents = await this.getDocuments(department);
            
            const stats = {
                totalDocumentos: documents.length,
                totalArchivos: documents.reduce((sum, doc) => sum + (doc.documentos ? doc.documentos.length : 0), 0),
                documentosConArchivos: documents.filter(doc => doc.documentos && doc.documentos.length > 0).length,
                documentosSinArchivos: documents.filter(doc => !doc.documentos || doc.documentos.length === 0).length,
                tamaño: documents.reduce((sum, doc) => {
                    if (!doc.documentos) return sum;
                    return sum + doc.documentos.reduce((fileSum, file) => fileSum + (file.bytes || 0), 0);
                }, 0)
            };

            stats.tamaño = this.formatFileSize(stats.tamaño);
            
            return stats;
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            return {
                totalDocumentos: 0,
                totalArchivos: 0,
                documentosConArchivos: 0,
                documentosSinArchivos: 0,
                tamaño: '0 Bytes'
            };
        }
    }

    /**
     * Formatea fecha para mostrar
     * @param {string} dateString - Fecha en formato ISO
     * @returns {string} Fecha formateada
     */
    formatDate(dateString) {
        if (!dateString) return '-';
        
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Formatea tamaño de archivo
     * @param {number} bytes - Tamaño en bytes
     * @returns {string} Tamaño formateado
     */
    formatFileSize(bytes) {
        if (!bytes || bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Obtiene el icono según el formato del archivo
     * @param {string} format - Formato del archivo
     * @returns {string} Nombre del icono
     */
    getFileIcon(format) {
        if (!format) return 'insert_drive_file';
        
        const iconMap = {
            'pdf': 'picture_as_pdf',
            'doc': 'description',
            'docx': 'description',
            'xls': 'table_chart',
            'xlsx': 'table_chart',
            'jpg': 'image',
            'jpeg': 'image',
            'png': 'image',
            'gif': 'image',
            'txt': 'text_snippet'
        };
        
        return iconMap[format.toLowerCase()] || 'insert_drive_file';
    }

    /**
     * Valida si un archivo puede ser previsualizado
     * @param {string} format - Formato del archivo
     * @returns {boolean} True si puede ser previsualizado
     */
    canPreview(format) {
        const previewableFormats = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'txt'];
        return previewableFormats.includes(format.toLowerCase());
    }

    /**
     * Genera URL de descarga para un archivo
     * @param {Object} file - Objeto del archivo
     * @returns {string} URL de descarga
     */
    getDownloadUrl(file) {
        if (file.url) {
            // Agregar parámetros para forzar descarga
            return file.url.replace('/upload/', '/upload/fl_attachment/');
        }
        return '#';
    }
}

// Exportar instancia única del servicio
export default new DocumentService();
