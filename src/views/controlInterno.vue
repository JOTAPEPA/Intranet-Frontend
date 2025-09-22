<template>
    <div>
        <div class="admin-container">
            <!-- Sidebar Navigation -->
            <div class="sidebar">
                <div class="sidebar-header">
                    <div class="user-profile">
                        <q-avatar size="50px" class="profile-avatar">
                            <img
                                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8iGDQ6VWECRIntbY5F6ZBYz-wCHgqzXM_FA&s">
                        </q-avatar>
                        <div class="user-info">
                            <h6 class="user-name">Copvillanueva</h6>
                            <span class="user-role">Administrador</span>
                        </div>
                    </div>
                </div>

                <div class="sidebar-menu">
                    <q-btn flat icon="dashboard" label="Inicio" align="left" class="menu-item active" no-caps @click="goHome" />
                    
                <q-btn 
                    flat 
                    icon="help" 
                    label="Ayuda" 
                    align="left"
                    class="menu-item"
                    no-caps 
                />
                </div>
            </div>

            <!-- Main Content -->
            <div class="main-content">

                <!-- Header -->
                <div class="content-header">
                    <div class="header-left">
                        <h4 class="page-title">Control Interno</h4>
                        <p class="page-subtitle">Gestiona Documentos de Control Interno</p>
                    </div>
                    <div class="header-actions">
                        <q-btn flat round icon="notifications" class="action-btn" size="md">
                            <q-tooltip>Notificaciones</q-tooltip>
                            <q-badge color="red" floating>3</q-badge>
                        </q-btn>
                        <q-btn flat round color="blue-7" icon="person" class="action-btn" size="md">
                            <q-tooltip>Ver Perfil</q-tooltip>
                        </q-btn>
                        <q-btn flat round color="red-6" icon="logout" @click="handleLogout" class="action-btn"
                            size="md">
                            <q-tooltip>Cerrar Sesión</q-tooltip>
                        </q-btn>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="action-buttons">
                    <q-btn-dropdown v-for="item in backdropFilterList" :key="item.label" unelevated color="primary"
                        :label="item.label" @click="item.onClick" icon="cloud_upload" class="upload-btn">
                        <q-tooltip>Subir documentos de control interno</q-tooltip>
                    </q-btn-dropdown>
                </div>

                <!-- Data Table -->
                <div class="table-container">
                    <q-table
                        :rows="rows"
                        :columns="columns"
                        row-key="index"
                        flat
                        class="data-table"
                        :rows-per-page-options="[5, 10, 20]"
                        separator="horizontal"
                        :loading="loading"
                    >
                        <template v-slot:top>
                            <div class="table-header-section">
                                <h5 class="table-title">Documentos de Control Interno</h5>
                                <q-space />
                                <div class="search-container">
                                    <q-input 
                                        v-model="searchTerm"
                                        dense 
                                        outlined 
                                        placeholder="Buscar documentos o archivos..." 
                                        class="search-input"
                                        @update:model-value="searchDocuments"
                                        debounce="300"
                                    >
                                        <template v-slot:prepend>
                                            <q-icon name="search" color="blue-7" />
                                        </template>
                                        <template v-slot:append>
                                            <q-btn 
                                                v-if="searchTerm"
                                                flat 
                                                round 
                                                dense 
                                                icon="clear"
                                                @click="clearSearch"
                                            />
                                        </template>
                                    </q-input>
                                </div>
                            </div>
                        </template>

                        <template v-slot:header="props">
                            <q-tr :props="props" class="table-header">
                                <q-th
                                    v-for="col in props.cols"
                                    :key="col.name"
                                    :props="props"
                                    class="table-header-cell"
                                >
                                    {{ col.label }}
                                </q-th>
                            </q-tr>
                        </template>

                        <template v-slot:body="props">
                            <q-tr :props="props" class="table-row">
                                <q-td
                                    v-for="col in props.cols"
                                    :key="col.name"
                                    :props="props"
                                    class="table-cell"
                                >
                                    <div v-if="col.name === 'acciones'" class="action-buttons-cell">
                                        <q-btn
                                            flat
                                            round
                                            color="blue-7"
                                            icon="visibility"
                                            size="sm"
                                            @click="viewDocument(props.row)"
                                            :disabled="!props.row.tieneArchivos"
                                            class="action-btn-small"
                                        >
                                            <q-tooltip>Ver documentos</q-tooltip>
                                        </q-btn>
                                        
                                        <q-btn
                                            flat
                                            round
                                            color="green-7"
                                            icon="download"
                                            size="sm"
                                            @click="downloadDocuments(props.row)"
                                            :disabled="!props.row.tieneArchivos"
                                            class="action-btn-small"
                                        >
                                            <q-tooltip>Descargar documentos</q-tooltip>
                                        </q-btn>
                                        
                                        <q-btn
                                            flat
                                            round
                                            color="red-7"
                                            icon="delete"
                                            size="sm"
                                            @click="deleteDocument(props.row)"
                                            class="action-btn-small"
                                        >
                                            <q-tooltip>Eliminar documento</q-tooltip>
                                        </q-btn>
                                    </div>
                                    <div v-else-if="col.name === 'titulo'" class="document-title-cell">
                                        <div class="document-info">
                                            <q-icon 
                                                :name="props.row.tieneArchivos ? 'folder' : 'folder_open'" 
                                                :color="props.row.tieneArchivos ? 'blue-7' : 'grey-5'"
                                                size="sm"
                                                class="document-icon"
                                            />
                                            <div class="document-details">
                                                <span class="document-name">{{ col.value }}</span>
                                                <span v-if="props.row.tieneArchivos" class="document-files-count">
                                                    {{ props.row.cantidadArchivos }} archivo(s)
                                                </span>
                                                <span v-else class="no-files-text">Sin archivos</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-else-if="col.name === 'cantidadArchivos'" class="files-count-cell">
                                        <q-chip 
                                            :color="props.row.tieneArchivos ? 'blue-1' : 'grey-3'" 
                                            :text-color="props.row.tieneArchivos ? 'blue-8' : 'grey-6'"
                                            :icon="props.row.tieneArchivos ? 'attach_file' : 'remove'"
                                            size="sm"
                                        >
                                            {{ col.value }}
                                        </q-chip>
                                    </div>
                                    <div v-else class="cell-content">
                                        {{ col.value }}
                                    </div>
                                </q-td>
                            </q-tr>
                        </template>

                        <template v-slot:no-data>
                            <div class="no-data-content">
                                <q-icon name="folder_open" size="3rem" color="grey-4" />
                                <h6>No hay documentos disponibles</h6>
                                <p>Sube tu primer documento para comenzar</p>
                            </div>
                        </template>
                    </q-table>
                </div>

                <!-- Document Viewer Dialog -->
                <q-dialog v-model="viewDocumentDialog" :backdrop-filter="backdropFilter">
                    <q-card class="document-viewer" style="min-width: 600px; max-width: 800px;">
                        <q-card-section class="dialog-header">
                            <div class="dialog-title">
                                <q-icon name="folder_open" size="1.5rem" />
                                <h6>Detalles del Documento</h6>
                            </div>
                            <q-btn flat round dense icon="close" color="white" v-close-popup />
                        </q-card-section>

                        <q-card-section class="dialog-content">
                            <div v-if="selectedDocumentForView">
                                <!-- Información del documento -->
                                <div class="document-info-header">
                                    <div class="info-item">
                                        <q-icon name="description" size="1rem" />
                                        <span class="info-label">Documento:</span>
                                        <span class="info-value">{{ selectedDocumentForView.titulo || selectedDocumentForView.documento }}</span>
                                    </div>
                                    <div class="info-item">
                                        <q-icon name="calendar_today" size="1rem" />
                                        <span class="info-label">Fecha:</span>
                                        <span class="info-value">{{ selectedDocumentForView.fechaCreacion || 'N/A' }}</span>
                                    </div>
                                    <div class="info-item">
                                        <q-icon name="folder" size="1rem" />
                                        <span class="info-label">Total archivos:</span>
                                        <span class="info-value">{{ selectedDocumentForView.cantidadArchivos || 0 }}</span>
                                    </div>
                                </div>

                                <!-- Lista de archivos -->
                                <div class="files-list">
                                    <h6 class="files-title">Archivos adjuntos</h6>
                                    <div v-if="selectedDocumentForView.archivos && selectedDocumentForView.archivos.length > 0" class="file-items">
                                        <div 
                                            v-for="(file, index) in selectedDocumentForView.archivos" 
                                            :key="index"
                                            class="file-item"
                                        >
                                            <div class="file-item-info">
                                                <q-icon 
                                                    :name="getFileIconByName(file.nombre)" 
                                                    size="2rem" 
                                                    :color="getFileColor(file.formato)"
                                                    class="file-icon"
                                                />
                                                
                                                <div class="file-details-expanded">
                                                    <p class="file-name-expanded">{{ file.nombre }}</p>
                                                    <div class="file-metadata">
                                                        <span class="file-size-tag">{{ file.tamaño }}</span>
                                                        <span class="file-date-tag">{{ file.fechaSubida }}</span>
                                                        <span class="file-format-tag">{{ file.formato?.toUpperCase() }}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div class="file-actions">
                                                <q-btn 
                                                    flat 
                                                    round 
                                                    icon="visibility" 
                                                    color="blue" 
                                                    size="sm"
                                                    @click="openFileInNewTab(file)"
                                                    class="action-btn-small"
                                                >
                                                    <q-tooltip>Ver archivo</q-tooltip>
                                                </q-btn>
                                                <q-btn 
                                                    flat 
                                                    round 
                                                    icon="download" 
                                                    color="green" 
                                                    size="sm"
                                                    @click="downloadSingleFile(file)"
                                                    class="action-btn-small"
                                                >
                                                    <q-tooltip>Descargar archivo</q-tooltip>
                                                </q-btn>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-else class="no-data-content">
                                        <q-icon name="attachment" size="2rem" color="grey-5" />
                                        <h6>No hay archivos adjuntos</h6>
                                        <p>Este documento no tiene archivos asociados</p>
                                    </div>
                                </div>
                            </div>
                        </q-card-section>

                        <q-card-actions class="dialog-actions">
                            <q-btn 
                                flat 
                                label="Cerrar" 
                                color="grey-7" 
                                v-close-popup
                            />
                            <q-btn 
                                v-if="selectedDocumentForView?.archivos?.length > 0"
                                unelevated 
                                label="Descargar Todos" 
                                color="primary" 
                                icon="download"
                                @click="downloadDocuments(selectedDocumentForView)"
                            />
                        </q-card-actions>
                    </q-card>
                </q-dialog>

                <!-- Upload Dialog -->
                <div class="q-pa-md q-gutter-sm">
                    <q-dialog v-model="dialog" :backdrop-filter="backdropFilter">
                        <q-card class="dialog-card" style="min-width: 500px;">
                            <q-card-section class="dialog-header">
                                <div class="dialog-title">
                                    <q-icon name="cloud_upload" size="1.5rem" />
                                    <h6>Subir Documento de Control Interno</h6>
                                </div>
                                <q-btn flat round dense icon="close" color="white" v-close-popup />
                            </q-card-section>

                            <q-card-section class="dialog-content">
                                <!-- Área de subida de archivos -->
                                <div class="upload-area" :class="{ 'drag-over': isDragOver }" @drop="onFileDrop"
                                    @dragover.prevent="isDragOver = true" @dragleave="isDragOver = false">

                                    <div v-if="!selectedFile" class="upload-placeholder">
                                        <q-icon name="cloud_upload" size="3rem" color="blue-7" />
                                        <p class="upload-text">
                                            Arrastra y suelta tu archivo aquí o
                                            <label for="file-input" class="upload-link">haz clic para
                                                seleccionar</label>
                                        </p>
                                        <p class="upload-hint">
                                            Formatos soportados: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (máx. 10MB)
                                        </p>
                                        <input id="file-input" type="file" ref="fileInput" @change="onFileSelect"
                                            style="display: none" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" />
                                    </div>

                                    <!-- Información del archivo seleccionado -->
                                    <div v-if="selectedFile && !isUploading" class="file-preview">
                                        <div class="file-info">
                                            <q-icon :name="getFileIcon(selectedFile.type)" size="2rem" color="blue-7" />
                                            <div class="file-details">
                                                <p class="file-name">{{ selectedFile.name }}</p>
                                                <p class="file-size">{{ formatFileSize(selectedFile.size) }}</p>
                                            </div>
                                            <q-btn flat round icon="close" @click="clearFile" />
                                        </div>

                                        <!-- Metadatos adicionales -->
                                        <div class="metadata-form">
                                            <q-input v-model="documentTitle" label="Título del documento" outlined
                                                class="q-mb-md" />
                                            <q-textarea v-model="documentDescription" label="Descripción (opcional)"
                                                outlined rows="3" />
                                        </div>
                                    </div>

                                    <!-- Progreso de subida -->
                                    <div v-if="isUploading" class="upload-progress">
                                        <div class="progress-content">
                                            <q-icon name="cloud_upload" size="2rem" color="blue-7" />
                                            <p class="progress-text">Subiendo archivo...</p>
                                            <q-linear-progress :value="uploadProgress / 100" color="blue-7" size="8px"
                                                class="q-mt-md" />
                                            <p class="progress-percentage">{{ uploadProgress }}%</p>
                                        </div>
                                    </div>

                                    <!-- Resultado de subida -->
                                    <div v-if="uploadResult" class="upload-result">
                                        <div v-if="uploadResult.success" class="success-result">
                                            <q-icon name="check_circle" size="2rem" color="green" />
                                            <p class="result-text">¡Archivo subido exitosamente!</p>
                                            <p class="result-details">El documento se ha guardado en el sistema.</p>
                                        </div>
                                        <div v-else class="error-result">
                                            <q-icon name="error" size="2rem" color="red" />
                                            <p class="result-text">Error al subir el archivo</p>
                                            <p class="result-details">{{ uploadResult.error }}</p>
                                        </div>
                                    </div>
                                </div>
                            </q-card-section>

                            <q-card-actions class="dialog-actions">
                                <q-btn flat label="Cancelar" color="grey-7" @click="closeDialog" />
                                <q-btn v-if="selectedFile && !isUploading && !uploadResult" unelevated
                                    label="Subir Archivo" color="primary" @click="uploadFile"
                                    :disabled="!documentTitle" />
                                <q-btn v-if="uploadResult" unelevated label="Subir Otro" color="primary"
                                    @click="resetUpload" />
                            </q-card-actions>
                        </q-card>
                    </q-dialog>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { computed, onMounted } from 'vue'
import { getData } from '../services/apiClient.js'
import { useAuth } from '../stores/store.js'
import { useRouter } from 'vue-router'
import CloudinaryService from '../services/cloudinaryService.js'

const router = useRouter()

// Función para mostrar notificaciones (temporal)
function showNotification(type, message, caption = '') {
    const fullMessage = caption ? `${message}\n${caption}` : message
    if (type === 'positive') {
        alert(`✅ ${fullMessage}`)
    } else if (type === 'negative') {
        alert(`❌ ${fullMessage}`)
    } else {
        alert(fullMessage)
    }
}

// Estados reactivos para el diálogo
const dialog = ref(false)
const backdropFilter = ref('blur(4px) saturate(150%)')

// Estados para la subida de archivos
const selectedFile = ref(null)
const isUploading = ref(false)
const uploadProgress = ref(0)
const uploadResult = ref(null)
const isDragOver = ref(false)
const loading = ref(false)

// Estados para metadatos del documento
const documentTitle = ref('')
const documentDescription = ref('')

// Estados para búsqueda
const searchTerm = ref('')

// Estados para el modal de vista de documentos
const viewDocumentDialog = ref(false)
const selectedDocumentForView = ref(null)

// Referencia al input de archivo
const fileInput = ref(null)

const columns = ref([
    {
        name: "titulo",
        align: "left",
        label: "Título del Documento",
        field: "documento",
        sortable: true,
    },
    {
        name: "fechaCreacion",
        align: "center",
        label: "Fecha de Creación",
        field: "createdAt",
        sortable: true,
        format: (val) => {
            if (!val) return 'N/A';
            return new Date(val).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        }
    },
    {
        name: "cantidadArchivos",
        align: "center",
        label: "Archivos",
        field: row => row.documentos ? row.documentos.length : 0,
        sortable: true,
    },
    {
        name: "acciones",
        align: "center",
        label: "Acciones",
        field: "",
        sortable: false,
    }
])
const rows = ref([])

/**
 * Lista de botones para subir documentos
 */
const list = [
    'Subir Documento de Control Interno',
]

const backdropFilterList = list.map(filter => ({
    label: filter,
    onClick: () => {
        openDialog()
    }
}))

/**
 * Abre el diálogo y resetea el estado
 */
function openDialog() {
    resetUpload()
    dialog.value = true
}

/**
 * Cierra el diálogo
 */
function closeDialog() {
    dialog.value = false
    resetUpload()
}

async function goHome () {
    await router.push("/home")
 
}

/**
 * Resetea el estado de subida
 */
function resetUpload() {
    selectedFile.value = null
    isUploading.value = false
    uploadProgress.value = 0
    uploadResult.value = null
    isDragOver.value = false
    documentTitle.value = ''
    documentDescription.value = ''
}

/**
 * Maneja la selección de archivo
 */
function onFileSelect(event) {
    const file = event.target.files[0]
    if (file) {
        handleFileSelection(file)
    }
}

/**
 * Maneja el drop de archivos
 */
function onFileDrop(event) {
    event.preventDefault()
    isDragOver.value = false

    const files = event.dataTransfer.files
    if (files.length > 0) {
        handleFileSelection(files[0])
    }
}

/**
 * Procesa el archivo seleccionado
 */
function handleFileSelection(file) {
    // Validar tipo de archivo
    if (!CloudinaryService.validateFileType(file)) {
        showNotification('negative', 'Tipo de archivo no permitido', 'Solo se permiten archivos PDF, DOC, DOCX, XLS, XLSX, JPG, PNG')
        return
    }

    // Validar tamaño de archivo
    if (!CloudinaryService.validateFileSize(file, 10)) {
        showNotification('negative', 'Archivo demasiado grande', 'El tamaño máximo permitido es 10MB')
        return
    }

    selectedFile.value = file
    documentTitle.value = file.name.split('.')[0] // Usar nombre del archivo sin extensión como título por defecto
}

/**
 * Limpia el archivo seleccionado
 */
function clearFile() {
    selectedFile.value = null
    documentTitle.value = ''
    documentDescription.value = ''
    if (fileInput.value) {
        fileInput.value.value = ''
    }
}

/**
 * Sube el archivo a través del servicio
 */
async function uploadFile() {
    if (!selectedFile.value || !documentTitle.value) {
        return
    }

    isUploading.value = true
    uploadProgress.value = 0
    uploadResult.value = null

    try {
        const metadata = {
            title: documentTitle.value,
            description: documentDescription.value,
            category: 'control-interno',
            uploadedBy: 'current-user', // Aquí deberías obtener el usuario actual
            uploadDate: new Date().toISOString()
        }

        const result = await CloudinaryService.uploadToBackend(
            selectedFile.value,
            metadata,
            (progress) => {
                uploadProgress.value = progress
            }
        )

        uploadResult.value = result

        if (result.success) {
            showNotification('positive', 'Archivo subido exitosamente', 'El documento se ha guardado en el sistema')

            // Aquí podrías actualizar la tabla con el nuevo documento
            // refreshDocuments()
        } else {
            showNotification('negative', 'Error al subir archivo', result.error || 'Ocurrió un error inesperado')
        }

    } catch (error) {
        console.error('Error uploading file:', error)
        uploadResult.value = {
            success: false,
            error: 'Error de conexión. Inténtalo de nuevo.'
        }

        showNotification('negative', 'Error de conexión', 'No se pudo conectar con el servidor')
    } finally {
        isUploading.value = false
    }
}

/**
 * Obtiene el icono según el tipo de archivo
 */
function getFileIcon(fileType) {
    if (fileType.includes('pdf')) return 'picture_as_pdf'
    if (fileType.includes('word') || fileType.includes('document')) return 'description'
    if (fileType.includes('sheet') || fileType.includes('excel')) return 'table_chart'
    if (fileType.includes('image')) return 'image'
    return 'insert_drive_file'
}

/**
 * Formatea el tamaño del archivo
 */
function formatFileSize(bytes) {
    return CloudinaryService.formatFileSize(bytes)
}

/**
 * Busca documentos según el término ingresado
 */
async function searchDocuments() {
    if (!searchTerm.value) {
        await loadDocuments();
        return;
    }
    
    try {
        loading.value = true;
        const searchTermLower = searchTerm.value.toLowerCase();
        const allDocuments = await getData('/control-interno');
        
        if (allDocuments && Array.isArray(allDocuments)) {
            const filteredDocuments = allDocuments.filter(doc => {
                // Buscar en el título del documento
                if (doc.documento && doc.documento.toLowerCase().includes(searchTermLower)) {
                    return true;
                }
                
                // Buscar en los nombres de archivos
                if (doc.documentos && doc.documentos.length > 0) {
                    return doc.documentos.some(archivo => 
                        archivo.originalName && archivo.originalName.toLowerCase().includes(searchTermLower)
                    );
                }
                
                return false;
            });
            
            // Procesar los datos filtrados
            rows.value = filteredDocuments.map(doc => ({
                ...doc,
                tieneArchivos: doc.documentos && doc.documentos.length > 0,
                cantidadArchivos: doc.documentos ? doc.documentos.length : 0,
                archivos: doc.documentos ? doc.documentos.map(archivo => ({
                    id: archivo._id,
                    nombre: archivo.originalName,
                    url: archivo.url,
                    tamaño: formatFileSize(archivo.bytes),
                    formato: archivo.format,
                    fechaSubida: new Date(archivo.uploadDate).toLocaleDateString('es-ES'),
                    public_id: archivo.public_id
                })) : []
            }));
        }
    } catch (error) {
        console.error('❌ Error en búsqueda:', error);
        showNotification('negative', 'Error en la búsqueda', 'No se pudo realizar la búsqueda');
    } finally {
        loading.value = false;
    }
}

/**
 * Limpia la búsqueda y recarga todos los documentos
 */
async function clearSearch() {
    searchTerm.value = '';
    await loadDocuments();
}

/**
 * Descarga un archivo individual
 */
function downloadSingleFile(file) {
    try {
        const link = document.createElement('a');
        link.href = file.url;
        link.download = file.nombre;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showNotification('positive', 'Descarga iniciada', `Descargando: ${file.nombre}`);
    } catch (error) {
        console.error('❌ Error descargando archivo:', error);
        showNotification('negative', 'Error en descarga', 'No se pudo descargar el archivo');
    }
}

/**
 * Abre un archivo en una nueva pestaña
 */
function openFileInNewTab(file) {
    try {
        window.open(file.url, '_blank');
    } catch (error) {
        console.error('❌ Error abriendo archivo:', error);
        showNotification('negative', 'Error', 'No se pudo abrir el archivo');
    }
}

/**
 * Obtiene el icono del archivo según su nombre/extensión
 */
function getFileIconByName(fileName) {
    if (!fileName) return 'insert_drive_file';
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    const iconMap = {
        'pdf': 'picture_as_pdf', 'doc': 'description', 'docx': 'description',
        'xls': 'table_chart', 'xlsx': 'table_chart', 'jpg': 'image',
        'jpeg': 'image', 'png': 'image', 'gif': 'image', 'txt': 'text_snippet',
        'zip': 'archive', 'rar': 'archive'
    };
    return iconMap[extension] || 'insert_drive_file';
}

/**
 * Obtiene el color del icono según el formato del archivo
 */
function getFileColor(format) {
    if (!format) return 'grey-6';
    const colorMap = {
        'pdf': 'red-6', 'doc': 'blue-6', 'docx': 'blue-6',
        'xls': 'green-6', 'xlsx': 'green-6', 'jpg': 'purple-6',
        'jpeg': 'purple-6', 'png': 'purple-6', 'gif': 'purple-6', 'txt': 'orange-6'
    };
    return colorMap[format.toLowerCase()] || 'grey-6';
}

/**
 * Recarga la lista de documentos
 */
async function loadDocuments() {
    await getDocuments();
}

/**
 * Ver documentos de un registro
 */
function viewDocument(document) {
    if (!document.tieneArchivos) {
        showNotification('negative', 'Sin archivos', 'Este documento no tiene archivos adjuntos');
        return;
    }
    selectedDocumentForView.value = {
        ...document,
        titulo: document.documento,
        fechaCreacion: new Date(document.createdAt).toLocaleDateString('es-ES', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        })
    };
    viewDocumentDialog.value = true;
}

/**
 * Descargar documentos de un registro
 */
async function downloadDocuments(document) {
    if (!document.tieneArchivos) {
        showNotification('negative', 'Sin archivos', 'Este documento no tiene archivos para descargar');
        return;
    }
    try {
        for (const file of document.archivos) {
            downloadSingleFile(file);
            // Pequeña pausa entre descargas para evitar problemas del navegador
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        showNotification('positive', 'Descarga iniciada', `Se están descargando ${document.archivos.length} archivo(s)`);
    } catch (error) {
        console.error('❌ Error descargando archivos:', error);
        showNotification('negative', 'Error en descarga', 'No se pudieron descargar los archivos');
    }
}

/**
 * Eliminar documento
 */
async function deleteDocument(document) {
    const confirmMessage = `¿Estás seguro de que quieres eliminar el documento "${document.documento}"?\n\nEste documento contiene ${document.cantidadArchivos} archivo(s).\nEsta acción no se puede deshacer.`;
    if (!confirm(confirmMessage)) return;
    
    try {
        loading.value = true;
        const response = await fetch(`http://localhost:3001/api/control-interno/${document._id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
            showNotification('positive', 'Documento eliminado', 'El documento ha sido eliminado exitosamente');
            await loadDocuments();
        } else {
            throw new Error('Error en la respuesta del servidor');
        }
    } catch (error) {
        console.error('❌ Error eliminando documento:', error);
        showNotification('negative', 'Error al eliminar', 'No se pudo eliminar el documento');
    } finally {
        loading.value = false;
    }
}

async function getDocuments() {
    try {
        loading.value = true;
        const response = await getData('/control-interno');
        
        if (response && Array.isArray(response)) {
            // Procesar los datos para añadir propiedades calculadas
            rows.value = response.map(doc => ({
                ...doc,
                tieneArchivos: doc.documentos && doc.documentos.length > 0,
                cantidadArchivos: doc.documentos ? doc.documentos.length : 0,
                archivos: doc.documentos ? doc.documentos.map(archivo => ({
                    id: archivo._id,
                    nombre: archivo.originalName,
                    url: archivo.url,
                    tamaño: formatFileSize(archivo.bytes),
                    formato: archivo.format,
                    fechaSubida: new Date(archivo.uploadDate).toLocaleDateString('es-ES'),
                    public_id: archivo.public_id
                })) : []
            }));

            console.log('✅ Documentos cargados:', rows.value.length);
        } else {
            console.log('⚠️ La respuesta no contiene los datos esperados');
            rows.value = [];
        }
    } catch (err) {
        console.error('❌ Error al obtener los documentos:', err);
        showNotification('negative', 'Error al cargar documentos', 'No se pudieron obtener los documentos');
        rows.value = [];
    } finally {
        loading.value = false;
    }
}

function handleLogout() {
    const authStore = useAuth()
    authStore.logOut()
    router.push('/')
}

onMounted(() => {
    loadDocuments();
});
</script>

<style scoped>
/* [Los mismos estilos que los otros módulos] */
/* Base Layout Styles */
.admin-container {
    display: flex;
    min-height: 100vh;
    background: var(--light-gray);
}

/* Sidebar Styles */
.sidebar {
    width: 280px;
    background: var(--sidebar-bg);
    box-shadow: var(--shadow-lg);
    display: flex;
    flex-direction: column;
    position: fixed;
    height: 100vh;
    z-index: 1000;
}

.sidebar-header {
    padding: 2rem 1.5rem;
    border-bottom: 1px solid var(--border-color);
    background: var(--primary-gradient);
}

.user-profile {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.profile-avatar {
    border: 3px solid var(--white);
    box-shadow: var(--shadow);
}

.user-info {
    color: var(--white);
}

.user-name {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
}

.user-role {
    font-size: 0.875rem;
    opacity: 0.9;
}

.sidebar-menu {
    padding: 1.5rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.menu-item {
    width: 100%;
    justify-content: flex-start;
    padding: 0.875rem 1rem;
    border-radius: 12px;
    color: var(--text-secondary);
    transition: all 0.3s ease;
    font-weight: 500;
}

.menu-item:hover {
    background: var(--primary-light);
    color: var(--primary-blue);
}

.menu-item.active {
    background: var(--primary-blue);
    color: var(--white);
}

/* Main Content Styles */
.main-content {
    flex: 1;
    margin-left: 280px;
    padding: 2rem;
    min-height: 100vh;
}

.content-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    background: var(--white);
    padding: 1.5rem 2rem;
    border-radius: 16px;
    box-shadow: var(--shadow);
}

.header-left {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.page-title {
    margin: 0;
    color: var(--text-primary);
    font-weight: 700;
    font-size: 1.75rem;
}

.page-subtitle {
    margin: 0;
    color: var(--text-secondary);
    font-size: 1rem;
}

.header-actions {
    display: flex;
    gap: 0.75rem;
    align-items: center;
}

.action-btn {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    transition: all 0.3s ease;
}

.action-btn:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
}

/* Stats Grid */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.stat-card {
    background: var(--white);
    padding: 1.5rem;
    border-radius: 16px;
    box-shadow: var(--shadow);
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: all 0.3s ease;
}

.stat-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
}

.stat-icon-wrapper {
    padding: 1rem;
    border-radius: 12px;
    background: var(--light-gray);
}

.stat-content {
    flex: 1;
}

.stat-value {
    margin: 0;
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text-primary);
}

.stat-label {
    margin: 0;
    color: var(--text-secondary);
    font-size: 0.875rem;
}

/* Action Buttons */
.action-buttons {
    margin-bottom: 2rem;
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
}

.upload-btn {
    border-radius: 12px;
    padding: 0.75rem 1.5rem;
    font-weight: 600;
    transition: all 0.3s ease;
}

.upload-btn:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
}

/* Table Styles */
.table-container {
    background: var(--white);
    border-radius: 16px;
    box-shadow: var(--shadow);
    overflow: hidden;
    margin-bottom: 2rem;
}

.data-table {
    border-radius: 16px;
    overflow: hidden;
}

.table-header {
    background: var(--primary-gradient);
}

.table-header-cell {
    color: var(--white);
    font-weight: 600;
    padding: 1.2rem 1rem;
    border: none;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.table-row:hover {
    background: var(--light-gray);
}

.table-cell {
    padding: 1.2rem 1rem;
    border-bottom: 1px solid var(--border-color);
    vertical-align: middle;
}

.table-header-section {
    display: flex;
    align-items: center;
    padding: 1.5rem 2rem;
    border-bottom: 1px solid var(--border-color);
    gap: 1rem;
}

.table-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
}

.search-container {
    display: flex;
    align-items: center;
}

.search-input {
    max-width: 300px;
    min-width: 250px;
}

.table-row {
    transition: all 0.2s ease;
}

.table-row:hover {
    background: var(--light-gray);
    transform: translateY(-1px);
}

/* Estilos para celdas específicas */
.action-buttons-cell {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
    align-items: center;
}

.action-btn-small {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    transition: all 0.3s ease;
}

.action-btn-small:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-btn-small:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.document-title-cell {
    max-width: 300px;
}

.document-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.document-icon {
    flex-shrink: 0;
}

.document-details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
}

.document-name {
    font-weight: 600;
    color: var(--text-primary);
    font-size: 0.95rem;
    line-height: 1.3;
    word-break: break-word;
}

.document-files-count {
    font-size: 0.8rem;
    color: var(--text-secondary);
    font-style: italic;
}

.no-files-text {
    font-size: 0.8rem;
    color: #f56565;
    font-style: italic;
}

.files-count-cell {
    text-align: center;
}

.cell-content {
    color: var(--text-primary);
    font-size: 0.9rem;
}

/* Estilos para estado sin datos */
.no-data-content {
    padding: 2rem;
    text-align: center;
}

.no-data-content h6 {
    color: var(--text-primary);
    margin: 0;
}

.no-data-content p {
    margin: 0;
    font-size: 0.875rem;
}

/* Estilos del diálogo de documentos */
.document-viewer {
    border-radius: 16px;
    overflow: hidden;
    box-shadow: var(--shadow-lg);
}

.document-info-header {
    display: flex;
    gap: 2rem;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: var(--light-gray);
    border-radius: 12px;
    flex-wrap: wrap;
}

.info-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
    min-width: 200px;
}

.info-label {
    font-weight: 500;
    color: var(--text-secondary);
    font-size: 0.9rem;
}

.info-value {
    font-weight: 600;
    color: var(--text-primary);
    font-size: 0.9rem;
}

.files-list {
    margin-top: 1rem;
}

.files-title {
    margin: 0 0 1rem 0;
    color: var(--text-primary);
    font-weight: 600;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.files-title::before {
    content: '';
    width: 4px;
    height: 20px;
    background: var(--primary-blue);
    border-radius: 2px;
}

.file-items {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.file-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: var(--white);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.file-item:hover {
    border-color: var(--primary-blue);
    box-shadow: 0 4px 12px rgba(25, 118, 210, 0.1);
    transform: translateY(-1px);
}

.file-item-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex: 1;
    min-width: 0;
}

.file-icon {
    flex-shrink: 0;
}

.file-details-expanded {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 0;
    flex: 1;
}

.file-name-expanded {
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
    font-size: 0.95rem;
    line-height: 1.3;
    word-break: break-word;
}

.file-metadata {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    align-items: center;
}

.file-size-tag,
.file-date-tag,
.file-format-tag {
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 500;
    white-space: nowrap;
}

.file-size-tag {
    background: #e3f2fd;
    color: #1565c0;
}

.file-date-tag {
    background: #f3e5f5;
    color: #7b1fa2;
}

.file-format-tag {
    background: #e8f5e8;
    color: #2e7d32;
}

.file-actions {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    flex-shrink: 0;
}

/* Dialog Styles */
.dialog-card {
    min-width: 450px;
    max-width: 500px;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: var(--shadow-lg);
}

.dialog-header {
    background: var(--primary-gradient);
    color: var(--white);
    padding: 1.5rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.dialog-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.dialog-title h6 {
    margin: 0;
    font-weight: 600;
    font-size: 1.1rem;
}

.dialog-content {
    padding: 2rem;
}

.dialog-actions {
    padding: 1rem 2rem;
    background: var(--light-gray);
    justify-content: flex-end;
    gap: 1rem;
}

/* Upload Area Styles */
.upload-area {
    border: 2px dashed var(--border-color);
    border-radius: 12px;
    padding: 2rem;
    text-align: center;
    transition: all 0.3s ease;
    background: var(--light-gray);
}

.upload-area.drag-over {
    border-color: var(--primary-blue);
    background: rgba(25, 118, 210, 0.05);
}

.upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

.upload-text {
    font-size: 1rem;
    color: var(--text-primary);
    margin: 0;
}

.upload-link {
    color: var(--primary-blue);
    cursor: pointer;
    text-decoration: underline;
    font-weight: 500;
}

.upload-link:hover {
    color: var(--blue-gradient-end);
}

.upload-hint {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin: 0;
}

/* File Preview Styles */
.file-preview {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.file-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: var(--white);
    border-radius: 8px;
    border: 1px solid var(--border-color);
    box-shadow: var(--shadow);
}

.file-details {
    flex: 1;
}

.file-name {
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
    margin-bottom: 0.25rem;
    font-size: 0.95rem;
}

.file-size {
    color: var(--text-secondary);
    font-size: 0.8rem;
    margin: 0;
}

.metadata-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

/* Upload Progress Styles */
.upload-progress {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 2rem;
}

.progress-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
}

.progress-text {
    font-weight: 500;
    color: var(--text-primary);
    margin: 0;
}

.progress-percentage {
    font-weight: 600;
    color: var(--primary-blue);
    font-size: 1.1rem;
    margin: 0;
}

/* Upload Result Styles */
.upload-result {
    display: flex;
    justify-content: center;
    padding: 2rem;
}

.success-result,
.error-result {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    text-align: center;
}

.result-text {
    font-weight: 600;
    font-size: 1.1rem;
    margin: 0;
}

.success-result .result-text {
    color: #2e7d32;
}

.error-result .result-text {
    color: #c62828;
}

.result-details {
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin: 0;
}

/* CSS Variables */
:root {
    --primary-blue: #1976d2;
    --blue-gradient-end: #1565c0;
    --primary-gradient: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
    --primary-light: rgba(25, 118, 210, 0.1);
    --sidebar-bg: #ffffff;
    --white: #ffffff;
    --light-gray: #f8fafc;
    --text-primary: #2d3748;
    --text-secondary: #718096;
    --border-color: #e2e8f0;
    --shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.15);
}

/* Mejoras adicionales para la tabla */
.q-table__container {
    border-radius: 16px;
}

.q-table thead tr:first-child th {
    background: var(--primary-gradient);
}

.q-table tbody td {
    border-bottom: 1px solid #e2e8f0;
}

.q-table tbody tr:last-child td {
    border-bottom: none;
}

/* Efectos hover para botones de acción */
.action-btn-small[aria-label*="Ver"] {
    color: #1976d2;
}

.action-btn-small[aria-label*="Ver"]:hover {
    background: rgba(25, 118, 210, 0.1);
}

.action-btn-small[aria-label*="Descargar"] {
    color: #388e3c;
}

.action-btn-small[aria-label*="Descargar"]:hover {
    background: rgba(56, 142, 60, 0.1);
}

.action-btn-small[aria-label*="Eliminar"] {
    color: #d32f2f;
}

.action-btn-small[aria-label*="Eliminar"]:hover {
    background: rgba(211, 47, 47, 0.1);
}

/* Estados de la tabla */
.table-row:nth-child(even) {
    background: rgba(248, 250, 252, 0.5);
}

.table-row:nth-child(even):hover {
    background: var(--light-gray);
}

/* Indicadores visuales para documentos sin archivos */
.table-row .no-files-text {
    position: relative;
}

.table-row .no-files-text::before {
    content: '⚠️';
    margin-right: 0.25rem;
    font-size: 0.7rem;
}

/* Animaciones suaves */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.file-item {
    animation: fadeIn 0.3s ease-out;
}

.table-row {
    animation: fadeIn 0.2s ease-out;
}

/* Mejoras para chips de conteo de archivos */
.q-chip {
    font-weight: 600;
    border-radius: 8px;
    height: 28px;
}

/* Tooltips personalizados */
.q-tooltip {
    background: var(--text-primary);
    color: var(--white);
    border-radius: 6px;
    font-size: 0.8rem;
    padding: 0.5rem 0.75rem;
    box-shadow: var(--shadow-lg);
}

/* Estilos para loading states */
.q-table--loading .q-table__bottom {
    background: rgba(255, 255, 255, 0.8);
}

/* Estilos para paginación */
.q-table__bottom {
    border-top: 1px solid var(--border-color);
    background: var(--white);
}

.q-table__control {
    font-size: 0.875rem;
    color: var(--text-secondary);
}

/* Responsive Styles */
@media (max-width: 768px) {
    .sidebar {
        transform: translateX(-100%);
        transition: transform 0.3s ease;
    }

    .main-content {
        margin-left: 0;
        padding: 1rem;
    }

    .stats-grid {
        grid-template-columns: 1fr;
    }

    .content-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }

    .header-actions {
        align-self: flex-end;
    }
}
</style>