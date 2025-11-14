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
                    <q-btn flat icon="dashboard" label="Inicio" align="left" class="menu-item active" no-caps />

                    <q-btn flat icon="help" label="Ayuda" align="left" class="menu-item" no-caps />
                </div>
            </div>

            <!-- Main Content -->
            <div class="main-content">

                <!-- Header -->
                <div class="content-header">
                    <div class="header-left">
                       
                        <h4 class="page-title">Riesgos</h4>
                        <p class="page-subtitle">Gestiona Documentos de Riesgos</p>
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

                <!-- Action Section -->
                <div class="q-pa-md q-gutter-sm">
                    <q-btn v-for="filter in backdropFilterList" :key="filter.label" color="primary"
                        :label="filter.label" no-caps @click="filter.onClick" />

                    <q-dialog v-model="dialog" :backdrop-filter="backdropFilter">
                        <q-card class="dialog-card upload-modal">
                            <q-card-section class="dialog-header">
                                <div class="dialog-title">
                                    <q-icon name="cloud_upload" size="1.5rem" />
                                    <h6>Subir Documento de Riesgos</h6>
                                </div>
                                <q-btn flat round dense icon="close" color="white" v-close-popup />
                            </q-card-section>

                            <q-card-section class="dialog-content">
                                <!-- Área de subida de archivos -->
                                <div class="upload-area" 
                                     :class="{ 'drag-over': isDragOver }"
                                     @drop="onFileDrop" 
                                     @dragover.prevent="isDragOver = true" 
                                     @dragleave="isDragOver = false">
                                    
                                    <!-- Interfaz inicial o agregar más archivos -->
                                    <div v-if="selectedFiles.length === 0 || (!isUploading && !uploadResult)" class="file-selection-area">
                                        <!-- Solo mostrar botón "Subir archivos" si no hay archivos seleccionados -->
                                        <div v-if="selectedFiles.length === 0" class="upload-placeholder">
                                            <q-icon name="cloud_upload" size="3rem" color="blue-7" />
                                            <p class="upload-text">Selecciona archivos para subir</p>
                                            <p class="upload-hint">PDF, DOC, XLS, imágenes (máximo 10 archivos, 10MB cada uno)</p>
                                            
                                            <q-btn 
                                                unelevated
                                                color="primary"
                                                icon="attach_file"
                                                label="Seleccionar archivos"
                                                @click="triggerFileSelection"
                                                class="upload-btn q-mt-md"
                                            />
                                        </div>

                                        <!-- Área para mostrar archivos seleccionados -->
                                        <div v-if="selectedFiles.length > 0" class="selected-files-section">
                                            <div class="section-header">
                                                <div class="files-counter">
                                                    <q-icon name="visibility" class="counter-icon" />
                                                    <span class="counter-text">{{ selectedFiles.length }} archivo{{ selectedFiles.length !== 1 ? 's' : '' }} seleccionado{{ selectedFiles.length !== 1 ? 's' : '' }}</span>
                                                </div>
                                                <div class="header-actions">
                                                    <q-btn 
                                                        flat
                                                        dense
                                                        icon="add"
                                                        label="Agregar más"
                                                        @click="triggerFileSelection(true)"
                                                        color="blue"
                                                        size="sm"
                                                        class="add-more-btn"
                                                    />
                                                    <q-btn 
                                                        flat
                                                        dense
                                                        icon="clear"
                                                        label="Limpiar"
                                                        @click="clearFiles"
                                                        color="red"
                                                        size="sm"
                                                        class="clear-btn"
                                                    />
                                                </div>
                                            </div>

                                            <!-- Grid de archivos con diseño exacto a las imágenes -->
                                            <div class="files-display-grid">
                                                <div 
                                                    v-for="(file, index) in selectedFiles" 
                                                    :key="index"
                                                    class="file-card"
                                                >
                                                    <div class="file-card-content">
                                                        <!-- Botón eliminar en la esquina superior derecha -->
                                                        <q-btn 
                                                            flat
                                                            round
                                                            dense
                                                            icon="close"
                                                            color="red"
                                                            size="xs"
                                                            class="file-remove-btn"
                                                            @click="removeFile(index)"
                                                        />
                                                        
                                                        <!-- Icono del archivo centrado -->
                                                        <div class="file-icon-section">
                                                            <q-icon 
                                                                :name="getFileTypeIcon(file.name)"
                                                                :color="getFileTypeColor(file.name)"
                                                                size="3rem"
                                                                class="file-main-icon"
                                                            />
                                                        </div>
                                                        
                                                        <!-- Información del archivo -->
                                                        <div class="file-details-section">
                                                            <div class="file-name-row">
                                                                <span class="file-name-display">{{ file.name }}</span>
                                                            </div>
                                                            <div class="file-metadata-row">
                                                                <span class="file-size-badge">{{ formatFileSize(file.size) }}</span>
                                                                <q-chip 
                                                                    :color="getFileTypeColor(getFileExtension(file.name))"
                                                                    :text-color="getFileTypeTextColor(getFileExtension(file.name))"
                                                                    size="sm"
                                                                    dense
                                                                    class="file-type-chip"
                                                                >
                                                                    {{ getFileExtension(file.name).toUpperCase() }}
                                                                </q-chip>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Input oculto para selección de archivos -->
                                        <input 
                                            ref="fileInput"
                                            type="file" 
                                            @change="onFileSelect" 
                                            style="display: none"
                                            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp,.txt,.csv"
                                            multiple
                                        />
                                    </div>

                                    <!-- Metadatos del documento -->
                                    <div v-if="selectedFiles.length > 0 && !isUploading && !uploadResult" class="metadata-form">
                                        <q-input 
                                            v-model="documentTitle" 
                                            label="Título del documento"
                                            outlined
                                            dense
                                            class="q-mb-md"
                                            :rules="[val => !!val || 'El título es requerido']"
                                        >
                                            <template v-slot:prepend>
                                                <q-icon name="title" color="blue-7" />
                                            </template>
                                        </q-input>
                                        <q-textarea 
                                            v-model="documentDescription" 
                                            label="Descripción (opcional)"
                                            outlined
                                            dense
                                            rows="2"
                                        >
                                            <template v-slot:prepend>
                                                <q-icon name="description" color="grey-6" />
                                            </template>
                                        </q-textarea>
                                    </div>

                                    <!-- Progreso de subida -->
                                    <div v-if="isUploading" class="upload-progress">
                                        <div class="progress-content">
                                            <q-icon name="cloud_upload" size="2.5rem" color="blue-7" class="upload-icon" />
                                            <h6 class="progress-title">Subiendo documento...</h6>
                                            <p class="progress-text">
                                                {{ selectedFiles.length === 1 ? selectedFiles[0].name : `${selectedFiles.length} archivos` }}
                                            </p>
                                            <q-linear-progress 
                                                :value="uploadProgress / 100" 
                                                color="blue-7" 
                                                size="12px"
                                                rounded
                                                class="progress-bar"
                                            />
                                            <p class="progress-percentage">{{ uploadProgress.toFixed(0) }}%</p>
                                        </div>
                                    </div>

                                    <!-- Resultado de subida -->
                                    <div v-if="uploadResult" class="upload-result">
                                        <div v-if="uploadResult.success" class="success-result">
                                            <q-icon name="check_circle" size="3rem" color="green" class="result-icon" />
                                            <h6 class="result-title">¡Documento subido exitosamente!</h6>
                                            <p class="result-text">
                                                {{ uploadResult.filesUploaded === 1 ? 
                                                    'El archivo se ha guardado correctamente' : 
                                                    `Los ${uploadResult.filesUploaded} archivos se han guardado correctamente`
                                                }}
                                            </p>
                                        </div>
                                        <div v-else class="error-result">
                                            <q-icon name="error" size="3rem" color="red" class="result-icon" />
                                            <h6 class="result-title">Error al subir documento</h6>
                                            <p class="result-text">{{ uploadResult.error }}</p>
                                        </div>
                                    </div>
                                </div>
                            </q-card-section>

                            <q-card-actions class="dialog-actions">
                                <q-btn 
                                    flat 
                                    label="Cancelar" 
                                    color="grey-7" 
                                    @click="closeDialog"
                                    :disable="isUploading"
                                />
                                <q-btn 
                                    v-if="selectedFiles.length > 0 && !isUploading && !uploadResult"
                                    unelevated 
                                    :label="`Subir ${selectedFiles.length} archivo${selectedFiles.length > 1 ? 's' : ''}`" 
                                    color="primary" 
                                    @click="uploadFiles"
                                    :disabled="!documentTitle || isUploading"
                                    icon="cloud_upload"
                                    class="upload-action-btn"
                                />
                                <q-btn 
                                    v-if="uploadResult && !uploadResult.success"
                                    unelevated 
                                    label="Reintentar" 
                                    color="primary" 
                                    @click="resetUpload"
                                    icon="refresh"
                                />
                                <q-btn 
                                    v-if="uploadResult && uploadResult.success"
                                    unelevated 
                                    label="Subir otro documento" 
                                    color="primary" 
                                    @click="resetUpload"
                                    icon="add"
                                />
                            </q-card-actions>
                        </q-card>
                    </q-dialog>

                    <!-- Modal para ver detalles del documento -->
                    <q-dialog v-model="viewDocumentDialog" class="document-view-dialog">
                        <q-card class="dialog-card" style="min-width: 600px; max-width: 800px;">
                            <q-card-section class="dialog-header">
                                <div class="dialog-title">
                                    <q-icon name="visibility" size="1.5rem" />
                                    <h6>Detalles del Documento</h6>
                                </div>
                                <q-btn flat round dense icon="close" color="white" v-close-popup />
                            </q-card-section>

                            <q-card-section class="dialog-content" v-if="selectedDocumentForView">
                                <!-- Información del documento -->
                                <div class="document-info q-mb-lg">
                                    <h6 class="document-info-title">{{ selectedDocumentForView.titulo }}</h6>
                                    <div class="document-meta">
                                        <q-chip color="blue" text-color="white" icon="schedule" size="sm">
                                            {{ selectedDocumentForView.fechaCreacion }}
                                        </q-chip>
                                        <q-chip color="green" text-color="white" icon="attachment" size="sm">
                                            {{ selectedDocumentForView.cantidadArchivos }} archivo(s)
                                        </q-chip>
                                    </div>
                                </div>

                                <!-- Lista de archivos -->
                                <div class="files-list">
                                    <h6 class="files-title">Archivos adjuntos</h6>
                                    <div
                                        v-if="selectedDocumentForView.archivos && selectedDocumentForView.archivos.length > 0">
                                        <q-list bordered separator>
                                            <q-item v-for="file in selectedDocumentForView.archivos" :key="file.id"
                                                class="file-list-item">
                                                <q-item-section avatar>
                                                    <q-icon :name="getFileIconByName(file.nombre)"
                                                        :color="getFileColor(file.formato)" size="md" />
                                                </q-item-section>

                                                <q-item-section>
                                                    <q-item-label class="file-name">{{ file.nombre }}</q-item-label>
                                                    <q-item-label caption class="file-metadata">
                                                        <span class="file-size">{{ file.tamaño }}</span>
                                                        <span class="file-separator">•</span>
                                                        <span class="file-date">{{ file.fechaSubida }}</span>
                                                        <span class="file-separator">•</span>
                                                        <span class="file-format">{{ file.formato?.toUpperCase()
                                                            }}</span>
                                                    </q-item-label>
                                                </q-item-section>

                                                <q-item-section side>
                                                    <div class="file-actions">
                                                        <q-btn flat round dense icon="visibility" color="blue-7"
                                                            @click="openFileInNewTab(file)" size="sm">
                                                            <q-tooltip>Ver archivo</q-tooltip>
                                                        </q-btn>
                                                        <q-btn flat round dense icon="download" color="green-7"
                                                            @click="downloadSingleFile(file)" size="sm">
                                                            <q-tooltip>Descargar</q-tooltip>
                                                        </q-btn>
                                                    </div>
                                                </q-item-section>
                                            </q-item>
                                        </q-list>
                                    </div>
                                    <div v-else class="no-files">
                                        <q-icon name="attachment" size="2rem" color="grey-5" />
                                        <p>No hay archivos adjuntos</p>
                                    </div>
                                </div>
                            </q-card-section>

                            <q-card-actions class="dialog-actions">
                                <q-btn flat label="Cerrar" color="grey-7" v-close-popup />
                                <q-btn v-if="selectedDocumentForView && selectedDocumentForView.tieneArchivos"
                                    unelevated label="Descargar Todos" color="primary" icon="download"
                                    @click="downloadDocuments(selectedDocumentForView)" />
                            </q-card-actions>
                        </q-card>
                    </q-dialog>
                </div>
                <!-- Data Table -->
                <div class="table-container">
                    <q-table :rows="rows" :columns="columns" row-key="index" flat class="data-table"
                        :rows-per-page-options="[5, 10, 20]" separator="horizontal" :loading="loading">
                        <template v-slot:top>
                            <div class="table-header-section">
                                <div class="table-title-container">
                                    <h5 class="table-title">Documentos</h5>
                                    <DepartmentChip 
                                        department-key="riesgos" 
                                        variant="table"
                                        size="sm"
                                        dense
                                    />
                                </div>
                                <q-space />
                                <div class="search-container">
                                    <q-input v-model="searchTerm" dense outlined
                                        placeholder="Buscar documentos o archivos..." class="search-input"
                                        @update:model-value="searchDocuments" debounce="300">
                                        <template v-slot:prepend>
                                            <q-icon name="search" />
                                        </template>
                                        <template v-slot:append>
                                            <q-btn v-if="searchTerm" flat round dense icon="clear"
                                                @click="clearSearch" />
                                        </template>
                                    </q-input>
                                </div>
                            </div>
                        </template>

                        <template v-slot:header="props">
                            <q-tr :props="props" class="table-header">
                                <q-th v-for="col in props.cols" :key="col.name" :props="props"
                                    class="table-header-cell">
                                    {{ col.label }}
                                </q-th>
                            </q-tr>
                        </template>

                        <template v-slot:body="props">
                            <q-tr :props="props" class="table-row">
                                <q-td v-for="col in props.cols" :key="col.name" :props="props" class="table-cell">
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

                                        <q-btn flat round dense icon="download" color="green-7"
                                            @click="downloadDocuments(props.row)" :disabled="!props.row.tieneArchivos"
                                            class="action-btn-small">
                                            <q-tooltip>Descargar documentos</q-tooltip>
                                        </q-btn>

                                        <q-btn flat round dense icon="delete" color="red-6"
                                            @click="deleteDocument(props.row)" class="action-btn-small">
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
                                            {{ props.row.tieneArchivos ? props.row.cantidadArchivos : 'Sin archivos' }}
                                        </q-chip>
                                    </div>
                                    <div v-else-if="col.name === 'tipoArchivo'" class="file-type-cell">
                                        <div v-if="props.row.tieneArchivos && props.row.documentos && props.row.documentos.length > 0" class="file-types-container">
                                            <q-chip 
                                                v-for="tipo in getUniqueFileTypes(props.row.documentos)" 
                                                :key="tipo"
                                                :color="getFileTypeColor(tipo)"
                                                :text-color="getFileTypeTextColor(tipo)"
                                                :icon="getFileTypeIcon(tipo)"
                                                size="sm"
                                                class="file-type-chip"
                                            >
                                                {{ tipo.toUpperCase() }}
                                            </q-chip>
                                        </div>
                                        <span v-else class="no-files-text">Sin archivos</span>
                                    </div>
                                    <span v-else class="cell-content">
                                        {{ col.value }}
                                    </span>
                                </q-td>
                            </q-tr>
                        </template>

                        <template v-slot:no-data>
                            <div class="full-width row flex-center q-gutter-sm text-center">
                                <div class="no-data-content">
                                    <q-icon size="3em" name="description" color="grey-5" />
                                    <div>
                                        <h6 class="q-mt-sm q-mb-xs">No hay documentos disponibles</h6>
                                        <p class="text-grey-6">
                                            Sube tu primer documento de riesgos para comenzar
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </template>

                        <template v-slot:loading>
                            <q-inner-loading showing color="blue-7" />
                        </template>
                    </q-table>
                </div>

                <!-- Dialog para ver documentos -->
                <q-dialog v-model="viewDocumentDialog" :backdrop-filter="backdropFilter">
                    <q-card class="dialog-card document-viewer" style="min-width: 700px; max-width: 900px;">
                        <q-card-section class="dialog-header">
                            <div class="dialog-title">
                                <q-icon name="folder_open" size="1.5rem" />
                                <h6>Documentos: {{ selectedDocumentForView?.titulo }}</h6>
                            </div>
                            <q-btn flat round dense icon="close" color="white" v-close-popup />
                        </q-card-section>

                        <q-card-section class="dialog-content" v-if="selectedDocumentForView">
                            <div class="document-info-header">
                                <div class="info-item">
                                    <q-icon name="event" color="blue-7" />
                                    <span class="info-label">Fecha de creación:</span>
                                    <span class="info-value">{{ selectedDocumentForView.fechaCreacion }}</span>
                                </div>
                                <div class="info-item">
                                    <q-icon name="attach_file" color="green-7" />
                                    <span class="info-label">Total de archivos:</span>
                                    <span class="info-value">{{ selectedDocumentForView.cantidadArchivos }}</span>
                                </div>
                            </div>

                            <div class="files-list" v-if="selectedDocumentForView?.archivos?.length > 0">
                                <h6 class="files-title">Archivos adjuntos:</h6>
                                <div class="file-items">
                                    <div v-for="file in selectedDocumentForView.archivos" :key="file.id"
                                        class="file-item">
                                        <div class="file-item-info">
                                            <q-icon :name="getFileIconByName(file.nombre)"
                                                :color="getFileColor(file.formato)" size="lg" class="file-icon" />
                                            <div class="file-details-expanded">
                                                <h6 class="file-name-expanded">{{ file.nombre }}</h6>
                                                <div class="file-metadata">
                                                    <span class="file-size-tag">{{ file.tamaño }}</span>
                                                    <span class="file-date-tag">{{ file.fechaSubida }}</span>
                                                    <span class="file-format-tag">{{ file.formato?.toUpperCase()
                                                        }}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="file-actions">
                                            <q-btn flat round icon="visibility" color="blue-7"
                                                @click="openFileInNewTab(file)" size="sm">
                                                <q-tooltip>Ver archivo</q-tooltip>
                                            </q-btn>
                                            <q-btn flat round icon="download" color="green-7"
                                                @click="downloadSingleFile(file)" size="sm">
                                                <q-tooltip>Descargar</q-tooltip>
                                            </q-btn>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </q-card-section>

                        <q-card-actions class="dialog-actions">
                            <q-btn flat label="Cerrar" color="grey-7" v-close-popup />
                            <q-btn v-if="selectedDocumentForView?.archivos?.length > 0" unelevated
                                label="Descargar Todos" color="primary" icon="download"
                                @click="downloadDocuments(selectedDocumentForView)" />
                        </q-card-actions>
                    </q-card>
                </q-dialog>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '../stores/store.js'
import { useRouter } from 'vue-router'
import { getData, postData, deleteData } from '../services/apiClient.js'
import axios from 'axios'
import DepartmentChip from '../components/DepartmentChip.vue'

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
const selectedFiles = ref([])
const isUploading = ref(false)
const uploadProgress = ref(0)
const uploadResult = ref(null)
const isDragOver = ref(false)

// Estados para metadatos del documento
const documentTitle = ref('')
const documentDescription = ref('')

// Referencia al input de archivo
const fileInput = ref(null)

// Estado para saber si se están agregando más archivos
const isAddingMoreFiles = ref(false)

// Estados para visualización de documentos
const viewDocumentDialog = ref(false)
const selectedDocumentForView = ref(null)

/**
 * Recarga la lista de documentos
 */
async function loadDocuments() {
    await getDocuments();
}

function viewProfile() {
    router.push('/profile') 
}

async function goHome () {
    await router.push('/home')
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
        console.log('🔍 Buscando documentos:', searchTerm.value);
        
        // Filtrar documentos localmente
        const searchTermLower = searchTerm.value.toLowerCase();
        const allDocuments = await getData('/riesgos');
        
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
                    url: archivo.downloadURL, // Firebase Storage usa downloadURL
                    tamaño: formatFileSize(archivo.size || 0),
                    formato: getFileExtension(archivo.originalName),
                    fechaSubida: new Date(archivo.uploadDate).toLocaleDateString('es-ES'),
                    firebaseRef: archivo.firebaseRef,
                    mimetype: archivo.mimetype
                })) : []
            }));
        }
        
        console.log('✅ Búsqueda completada:', rows.value.length, 'resultados');
        
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
 * Obtiene los tipos únicos de archivos de un array de documentos
 */
function getUniqueFileTypes(documentos) {
    if (!documentos || documentos.length === 0) return [];
    const tipos = [...new Set(documentos.map(doc => getFileExtension(doc.originalName)))];
    return tipos.filter(tipo => tipo !== 'desconocido');
}

/**
 * Obtiene el color de fondo para un tipo de archivo
 */
function getFileTypeColor(tipo) {
    const colorMap = {
        'pdf': 'red-1',
        'doc': 'blue-1',
        'docx': 'blue-1',
        'xls': 'green-1',
        'xlsx': 'green-1',
        'jpg': 'purple-1',
        'jpeg': 'purple-1',
        'png': 'purple-1',
        'txt': 'grey-1'
    };
    return colorMap[tipo.toLowerCase()] || 'orange-1';
}

/**
 * Obtiene el color del texto para un tipo de archivo
 */
function getFileTypeTextColor(tipo) {
    const colorMap = {
        'pdf': 'red-8',
        'doc': 'blue-8',
        'docx': 'blue-8',
        'xls': 'green-8',
        'xlsx': 'green-8',
        'jpg': 'purple-8',
        'jpeg': 'purple-8',
        'png': 'purple-8',
        'txt': 'grey-8'
    };
    return colorMap[tipo.toLowerCase()] || 'orange-8';
}

/**
 * Obtiene el icono para un tipo de archivo
 */
function getFileTypeIcon(tipo) {
    const iconMap = {
        'pdf': 'picture_as_pdf',
        'doc': 'description',
        'docx': 'description',
        'xls': 'table_chart',
        'xlsx': 'table_chart',
        'jpg': 'image',
        'jpeg': 'image',
        'png': 'image',
        'txt': 'text_snippet'
    };
    return iconMap[tipo.toLowerCase()] || 'insert_drive_file';
}

/**
 * Obtiene el icono del archivo según su nombre/extensión
 */
function getFileIconByName(fileName) {
    if (!fileName) return 'insert_drive_file';
    
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
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
        'txt': 'text_snippet',
        'zip': 'archive',
        'rar': 'archive'
    };
    
    return iconMap[extension] || 'insert_drive_file';
}

/**
 * Obtiene el color del icono según el formato del archivo
 */
function getFileColor(format) {
    if (!format) return 'grey-6';
    
    const colorMap = {
        'pdf': 'red-6',
        'doc': 'blue-6',
        'docx': 'blue-6',
        'xls': 'green-6',
        'xlsx': 'green-6',
        'jpg': 'purple-6',
        'jpeg': 'purple-6',
        'png': 'purple-6',
        'gif': 'purple-6',
        'txt': 'orange-6'
    };
    
    return colorMap[format.toLowerCase()] || 'grey-6';
}

/**
 * Obtiene el icono del archivo según su tipo MIME
 */
function getFileIcon(mimeType) {
    const iconMap = {
        'application/pdf': 'picture_as_pdf',
        'application/msword': 'description',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'description',
        'application/vnd.ms-excel': 'table_chart',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'table_chart',
        'text/plain': 'text_snippet',
        'text/csv': 'table_chart',
        'image/jpeg': 'image',
        'image/jpg': 'image',
        'image/png': 'image',
        'image/gif': 'image',
        'image/webp': 'image'
    }
    return iconMap[mimeType] || 'insert_drive_file'
}

/**
 * Formatea el tamaño de archivo en bytes a una representación legible
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Obtiene la extensión de un archivo
 */
function getFileExtension(fileName) {
    if (!fileName) return 'desconocido'
    const extension = fileName.split('.').pop()?.toLowerCase() || 'desconocido'
    return extension
}

/**
 * Sube los archivos seleccionados al servidor
 */
async function uploadFiles() {
    if (selectedFiles.value.length === 0 || !documentTitle.value) {
        showNotification('negative', 'Datos incompletos', 'Selecciona al menos un archivo y proporciona un título')
        return
    }
    
    try {
        isUploading.value = true
        uploadProgress.value = 0
        
        const formData = new FormData()
        formData.append('documento', documentTitle.value)
        
        // Agregar todos los archivos seleccionados
        selectedFiles.value.forEach(file => {
            formData.append('documentos', file)
        })
        
        console.log('📤 Subiendo archivos:', {
            cantidad: selectedFiles.value.length,
            archivos: selectedFiles.value.map(file => ({
                nombre: file.name,
                tipo: file.type,
                tamaño: file.size
            })),
            titulo: documentTitle.value
        })
        
        // Usar axios directamente para tener control del progreso
        const response = await axios.post(
            'http://localhost:5000/api/riesgos',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    )
                    uploadProgress.value = percentCompleted
                },
            }
        )
        
        console.log('✅ Archivos subidos exitosamente:', response.data)
        
        uploadResult.value = {
            success: true,
            data: response.data,
            filesUploaded: selectedFiles.value.length
        }
        
        const message = selectedFiles.value.length === 1 
            ? 'Archivo subido exitosamente' 
            : `${selectedFiles.value.length} archivos subidos exitosamente`
        
        showNotification('positive', message, 'Los documentos han sido guardados en el sistema')
        
        // Recargar la lista de documentos
        await loadDocuments()
        
    } catch (error) {
        console.error('❌ Error al subir archivos:', error)
        
        let errorMessage = 'Error desconocido'
        if (error.response?.data?.message) {
            errorMessage = error.response.data.message
        } else if (error.message) {
            errorMessage = error.message
        }
        
        uploadResult.value = {
            success: false,
            error: errorMessage
        }
        
        showNotification('negative', 'Error al subir archivos', errorMessage)
    } finally {
        isUploading.value = false
    }
}

const columns = ref([
    {
        name: "titulo",
        align: "left",
        label: "Título del Documento",
        field: "documento",
        sortable: true,
    },
    {
        name: "tipoArchivo",
        align: "center",
        label: "Tipo de Archivo",
        field: row => {
            if (!row.documentos || row.documentos.length === 0) return 'Sin archivos';
            // Obtener los tipos únicos de archivos
            const tipos = [...new Set(row.documentos.map(doc => getFileExtension(doc.originalName)))];
            return tipos.filter(tipo => tipo !== 'desconocido').join(', ') || 'Desconocido';
        },
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

// Estados para búsqueda
const searchTerm = ref('')
const loading = ref(false)

/**
 * Lista de botones para subir documentos
 */
const list = [
  'Subir Documento',
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

/**
 * Resetea el estado de subida
 */
function resetUpload() {
    selectedFiles.value = []
    isUploading.value = false
    uploadProgress.value = 0
    uploadResult.value = null
    isDragOver.value = false
    documentTitle.value = ''
    documentDescription.value = ''
}

/**
 * Activa la selección de archivos programáticamente
 */
function triggerFileSelection(addToExisting = false) {
    if (fileInput.value) {
        isAddingMoreFiles.value = addToExisting
        fileInput.value.click()
    }
}

/**
 * Maneja la selección de archivos
 */
function onFileSelect(event) {
    const files = Array.from(event.target.files)
    if (files.length > 0) {
        handleFilesSelection(files, isAddingMoreFiles.value)
        isAddingMoreFiles.value = false // Reset el estado
    }
}

/**
 * Maneja el drop de archivos
 */
function onFileDrop(event) {
    event.preventDefault()
    isDragOver.value = false
    
    const files = Array.from(event.dataTransfer.files)
    if (files.length > 0) {
        handleFilesSelection(files)
    }
}

/**
 * Maneja la selección de múltiples archivos
 */
function handleFilesSelection(files, addToExisting = false) {
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/csv',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp'
    ]
    
    // Validar cantidad máxima considerando archivos existentes si se están agregando
    const currentFileCount = addToExisting ? selectedFiles.value.length : 0
    const totalFiles = currentFileCount + files.length
    
    if (totalFiles > 10) {
        showNotification('negative', 'Demasiados archivos', `Se permite un máximo de 10 archivos. Actualmente tienes ${currentFileCount} archivos.`)
        return
    }
    
    // Validar que no haya más de 10 archivos en la selección inicial
    if (!addToExisting && files.length > 10) {
        showNotification('negative', 'Demasiados archivos', 'Se permite un máximo de 10 archivos por subida')
        return
    }
    
    const validFiles = []
    const maxSize = 10 * 1024 * 1024 // 10MB
    
    for (const file of files) {
        // Validar tipo de archivo
        if (!allowedTypes.includes(file.type)) {
            showNotification('negative', `Tipo no permitido: ${file.name}`, 'Solo se permiten archivos PDF, Word, Excel, imágenes y texto')
            continue
        }
        
        // Validar tamaño
        if (file.size > maxSize) {
            showNotification('negative', `Archivo muy grande: ${file.name}`, 'Los archivos no pueden superar los 10MB')
            continue
        }
        
        validFiles.push(file)
    }
    
    if (validFiles.length === 0) {
        showNotification('negative', 'Sin archivos válidos', 'No se seleccionaron archivos válidos')
        return
    }
    
    // Agregar archivos o reemplazar según el modo
    if (addToExisting) {
        // Filtrar archivos duplicados por nombre
        const existingFileNames = selectedFiles.value.map(file => file.name)
        const newFiles = validFiles.filter(file => !existingFileNames.includes(file.name))
        
        if (newFiles.length === 0) {
            showNotification('negative', 'Archivos duplicados', 'Todos los archivos seleccionados ya están en la lista')
            return
        }
        
        selectedFiles.value = [...selectedFiles.value, ...newFiles]
        showNotification('positive', `${newFiles.length} archivo(s) agregado(s)`, `Total: ${selectedFiles.value.length} archivos`)
    } else {
        selectedFiles.value = validFiles
    }
    
    // Generar título automático solo si no hay título o si es la primera selección
    if (!documentTitle.value || !addToExisting) {
        const totalFiles = selectedFiles.value.length
        if (totalFiles === 1) {
            documentTitle.value = selectedFiles.value[0].name.replace(/\.[^/.]+$/, "")
        } else {
            documentTitle.value = `${totalFiles} documentos seleccionados`
        }
    }
    
    // Limpiar el input para permitir seleccionar los mismos archivos de nuevo
    if (fileInput.value) {
        fileInput.value.value = ''
    }
}

/**
 * Limpia los archivos seleccionados
 */
function clearFiles() {
    selectedFiles.value = []
    documentTitle.value = ''
    documentDescription.value = ''
    if (fileInput.value) {
        fileInput.value.value = ''
    }
}

/**
 * Elimina un archivo específico de la selección
 */
function removeFile(index) {
    selectedFiles.value.splice(index, 1)
    
    // Actualizar título si no quedan archivos
    if (selectedFiles.value.length === 0) {
        documentTitle.value = ''
    } else if (selectedFiles.value.length === 1) {
        documentTitle.value = selectedFiles.value[0].name.replace(/\.[^/.]+$/, "")
    } else {
        documentTitle.value = `Lote de ${selectedFiles.value.length} archivos`
    }
}

function handleLogout() {
    // Usar el store para cerrar sesión correctamente
    const authStore = useAuth()
    authStore.logOut()

    // Redirigir al login
    router.push('/')
}

async function getDocuments() {
    try {
        loading.value = true;
        console.log('📥 Cargando documentos de riesgos...');
        
        const response = await getData('/riesgos');
        
        if (response && Array.isArray(response)) {
            // Procesar los datos para añadir propiedades calculadas
            rows.value = response.map(doc => ({
                ...doc,
                tieneArchivos: doc.documentos && doc.documentos.length > 0,
                cantidadArchivos: doc.documentos ? doc.documentos.length : 0,
                archivos: doc.documentos ? doc.documentos.map(archivo => ({
                    id: archivo._id,
                    nombre: archivo.originalName,
                    url: archivo.downloadURL, // Firebase Storage usa downloadURL
                    tamaño: formatFileSize(archivo.size || 0),
                    formato: getFileExtension(archivo.originalName),
                    fechaSubida: new Date(archivo.uploadDate).toLocaleDateString('es-ES'),
                    firebaseRef: archivo.firebaseRef,
                    mimetype: archivo.mimetype
                })) : []
            }));
            
            // Calcular estadísticas
            calculateStats();
            
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

/**
 * Calcula las estadísticas de los documentos
 */
function calculateStats() {
    const totalDocumentos = rows.value.length;
    const documentosConArchivos = rows.value.filter(doc => doc.tieneArchivos).length;
    const totalArchivos = rows.value.reduce((total, doc) => total + doc.cantidadArchivos, 0);
    
    // Calcular tamaño total en bytes
    const totalBytes = rows.value.reduce((total, doc) => {
        return total + (doc.documentos ? doc.documentos.reduce((docTotal, archivo) => docTotal + (archivo.size || 0), 0) : 0);
    }, 0);
}

/**
 * Muestra los detalles de un documento
 */
function viewDocument(document) {
    console.log('👁️ Visualizando documento:', document);
    console.log('📁 Documentos originales:', document.documentos);
    console.log('📋 Archivos procesados:', document.archivos);
    
    selectedDocumentForView.value = {
        ...document,
        titulo: document.documento,
        fechaCreacion: new Date(document.createdAt).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }
    viewDocumentDialog.value = true
}

/**
 * Descarga todos los archivos de un documento
 */
async function downloadDocuments(document) {
    if (!document.tieneArchivos || !document.documentos || document.documentos.length === 0) {
        showNotification('negative', 'Sin archivos', 'Este documento no tiene archivos para descargar')
        return
    }
    
    try {
        console.log('📥 Descargando documentos:', document.documento);
        console.log('📋 Archivos a descargar:', document.documentos);
        
        // Si solo hay un archivo, descargarlo directamente
        if (document.documentos.length === 1) {
            const archivo = document.documentos[0];
            await downloadFileDirectly(archivo, document._id, 0);
            return;
        }
        
        // Si hay múltiples archivos, descargar cada uno
        for (let index = 0; index < document.documentos.length; index++) {
            const archivo = document.documentos[index];
            await downloadFileDirectly(archivo, document._id, index);
            // Pequeña pausa entre descargas para evitar problemas
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        showNotification('positive', 'Descarga iniciada', `Se están descargando ${document.documentos.length} archivo(s)`);
        
    } catch (error) {
        console.error('❌ Error al descargar documentos:', error);
        showNotification('negative', 'Error en descarga', 'No se pudieron descargar todos los archivos');
    }
}

/**
 * Descarga un archivo usando múltiples métodos de respaldo
 */
async function downloadFileDirectly(archivo, documentId, fileIndex) {
    console.log('📥 Intentando descargar archivo:', archivo);
    
    // Método 1: Usar downloadURL de Firebase directamente si está disponible
    if (archivo.downloadURL) {
        console.log('🔗 Usando downloadURL de Firebase:', archivo.downloadURL);
        try {
            const link = document.createElement('a');
            link.href = archivo.downloadURL;
            link.download = archivo.originalName;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return;
        } catch (error) {
            console.warn('⚠️ Error con downloadURL, intentando endpoint del backend:', error);
        }
    }
    
    // Método 2: Usar endpoint del backend como respaldo
    try {
        await downloadSingleFileFromBackend(documentId, fileIndex, archivo.originalName);
    } catch (error) {
        console.error('❌ Error con ambos métodos de descarga:', error);
        showNotification('negative', 'Error en descarga', `No se pudo descargar: ${archivo.originalName}`);
    }
}

/**
 * Descarga un archivo usando el endpoint del backend
 */
async function downloadSingleFileFromBackend(documentId, fileIndex, fileName) {
    try {
        console.log('📥 Descargando archivo desde backend:', { documentId, fileIndex, fileName });
        
        // Construir la URL del endpoint de descarga
        const downloadUrl = `http://localhost:5000/api/riesgos/${documentId}/file/${fileIndex}/download`;
        
        // Abrir directamente en nueva pestaña para que redirija a Firebase
        window.open(downloadUrl, '_blank');
        
    } catch (error) {
        console.error('❌ Error al descargar archivo desde backend:', error);
        showNotification('negative', 'Error en descarga', `No se pudo descargar: ${fileName}`);
    }
}

/**
 * Descarga un archivo individual desde el diálogo de visualización
 */
async function downloadSingleFile(file) {
    try {
        console.log('📥 Descargando archivo individual:', file);
        
        // Buscar el documento actual y el índice del archivo
        const currentDoc = selectedDocumentForView.value;
        if (!currentDoc || !currentDoc.archivos) {
            showNotification('negative', 'Error', 'No se pudo encontrar la información del documento');
            return;
        }
        
        const fileIndex = currentDoc.archivos.findIndex(arch => arch.id === file.id);
        if (fileIndex === -1) {
            showNotification('negative', 'Error', 'No se pudo encontrar el archivo');
            return;
        }
        
        // Buscar el archivo original en los documentos del backend
        const originalFile = currentDoc.documentos ? currentDoc.documentos[fileIndex] : null;
        
        if (originalFile) {
            await downloadFileDirectly(originalFile, currentDoc._id, fileIndex);
        } else {
            // Fallback: usar la información que tenemos
            console.log('🔄 Usando información del archivo procesado como fallback');
            if (file.url) {
                const link = document.createElement('a');
                link.href = file.url;
                link.download = file.nombre;
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                await downloadSingleFileFromBackend(currentDoc._id, fileIndex, file.nombre);
            }
        }
        
    } catch (error) {
        console.error('❌ Error al descargar archivo:', error);
        showNotification('negative', 'Error en descarga', `No se pudo descargar: ${file.nombre}`);
    }
}

/**
 * Abre un archivo en una nueva pestaña
 */
function openFileInNewTab(file) {
    console.log('🔗 Abriendo archivo en nueva pestaña:', file);
    
    // Buscar el documento actual y el archivo original
    const currentDoc = selectedDocumentForView.value;
    if (currentDoc && currentDoc.documentos) {
        const fileIndex = currentDoc.archivos ? currentDoc.archivos.findIndex(arch => arch.id === file.id) : -1;
        const originalFile = fileIndex !== -1 ? currentDoc.documentos[fileIndex] : null;
        
        // Usar downloadURL del archivo original si está disponible
        if (originalFile && originalFile.downloadURL) {
            console.log('🔗 Usando downloadURL original:', originalFile.downloadURL);
            window.open(originalFile.downloadURL, '_blank');
            return;
        }
    }
    
    // Fallback: usar la URL procesada
    if (file.url) {
        console.log('🔗 Usando URL procesada:', file.url);
        window.open(file.url, '_blank');
    } else {
        console.warn('⚠️ No hay URL disponible para el archivo:', file);
        showNotification('negative', 'Error', 'URL del archivo no disponible');
    }
}

/**
 * Función simplificada para descargar documentos
 */
function downloadDocumentsSimple(document) {
    console.log('📥 Descarga simple iniciada:', document);
    
    if (!document.tieneArchivos || !document.documentos || document.documentos.length === 0) {
        showNotification('negative', 'Sin archivos', 'Este documento no tiene archivos para descargar')
        return
    }
    
    // Descargar cada archivo usando su downloadURL directamente
    document.documentos.forEach((archivo, index) => {
        setTimeout(() => {
            console.log(`📄 Descargando archivo ${index + 1}:`, archivo);
            
            if (archivo.downloadURL) {
                // Método 1: URL directa de Firebase
                console.log('🔗 Usando downloadURL:', archivo.downloadURL);
                window.open(archivo.downloadURL, '_blank');
            } else {
                // Método 2: Endpoint del backend
                const backendUrl = `http://localhost:5000/api/riesgos/${document._id}/file/${index}/download`;
                console.log('🔗 Usando backend URL:', backendUrl);
                window.open(backendUrl, '_blank');
            }
        }, index * 1000); // Esperar 1 segundo entre cada descarga
    });
    
    const message = document.documentos.length === 1 
        ? 'Descarga iniciada' 
        : `Descargando ${document.documentos.length} archivos`;
    
    showNotification('positive', message, 'Se abrirán las descargas en nuevas pestañas');
}

/**
 * Función simplificada para descargar archivo individual
 */
function downloadSingleFileSimple(file) {
    console.log('📄 Descarga simple de archivo individual:', file);
    
    const currentDoc = selectedDocumentForView.value;
    if (!currentDoc || !currentDoc.documentos) {
        showNotification('negative', 'Error', 'No se pudo encontrar la información del documento');
        return;
    }
    
    // Buscar el archivo original en la lista de documentos
    const fileIndex = currentDoc.archivos ? currentDoc.archivos.findIndex(arch => arch.id === file.id) : -1;
    const originalFile = fileIndex !== -1 ? currentDoc.documentos[fileIndex] : null;
    
    if (originalFile && originalFile.downloadURL) {
        console.log('🔗 Usando downloadURL original:', originalFile.downloadURL);
        window.open(originalFile.downloadURL, '_blank');
    } else if (file.url) {
        console.log('🔗 Usando URL procesada:', file.url);
        window.open(file.url, '_blank');
    } else {
        // Último recurso: endpoint del backend
        const backendUrl = `http://localhost:5000/api/riesgos/${currentDoc._id}/file/${fileIndex}/download`;
        console.log('🔗 Usando backend URL:', backendUrl);
        window.open(backendUrl, '_blank');
    }
}

/**
 * Elimina un documento y todos sus archivos
 */
async function deleteDocument(document) {
    const confirmDelete = confirm(`¿Estás seguro de que quieres eliminar el documento "${document.documento}"?\n\nEsta acción eliminará el documento y todos sus archivos de forma permanente.`);
    
    if (!confirmDelete) {
        return;
    }
    
    try {
        console.log('🗑️ Eliminando documento:', document._id);
        
        const response = await deleteData(`/riesgos/${document._id}`);
        
        console.log('✅ Documento eliminado:', response.data);
        
        showNotification('positive', 'Documento eliminado', 'El documento y sus archivos han sido eliminados correctamente');
        
        // Recargar la lista de documentos
        await loadDocuments();
        
        // Cerrar el diálogo de visualización si está abierto
        if (viewDocumentDialog.value && selectedDocumentForView.value?._id === document._id) {
            viewDocumentDialog.value = false;
            selectedDocumentForView.value = null;
        }
        
    } catch (error) {
        console.error('❌ Error al eliminar documento:', error);
        
        let errorMessage = 'Error desconocido';
        if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        showNotification('negative', 'Error al eliminar', errorMessage);
    }
}

onMounted(() => {
    loadDocuments();
});
</script>

<style scoped>
/* [Estilos compartidos - mismo CSS que los otros módulos] */
.admin-container {
    display: flex;
    min-height: 100vh;
    background: var(--light-gray);
}

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

.table-container {
    background: var(--white);
    border-radius: 16px;
    box-shadow: var(--shadow);
    overflow: hidden;
}

.data-table {
    border-radius: 16px;
}

.table-header {
    background: var(--primary-gradient);
}

.table-header-cell {
    color: var(--white);
    font-weight: 600;
    padding: 1rem;
    border: none;
}

.table-row:hover {
    background: var(--light-gray);
}

.table-cell {
    padding: 1rem;
    border-bottom: 1px solid var(--border-color);
}

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

/* Estilos específicos para la tabla modernizada */
.table-header-section {
    display: flex;
    align-items: center;
    padding: 1.5rem;
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
    margin-left: auto;
}

.search-input {
    max-width: 300px;
    min-width: 250px;
}

.table-header-cell {
    color: var(--white) !important;
    font-weight: 600 !important;
    padding: 1.2rem 1rem !important;
    border: none !important;
    font-size: 0.9rem !important;
    text-transform: uppercase !important;
    letter-spacing: 0.5px !important;
}

.table-row {
    transition: all 0.2s ease;
}

.table-row:hover {
    background: var(--light-gray) !important;
    transform: translateY(-1px);
}

.table-cell {
    padding: 1.2rem 1rem !important;
    border-bottom: 1px solid var(--border-color) !important;
    vertical-align: middle !important;
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

.file-type-cell {
    text-align: center;
}

.file-types-container {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    justify-content: center;
    align-items: center;
}

.file-type-chip {
    font-weight: 500;
    font-size: 0.75rem;
    min-width: 50px;
}

.cell-content {
    color: var(--text-primary);
    font-size: 0.9rem;
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

.no-data-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 2rem;
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
    background: var(--light-gray) !important;
}

/* Mejoras para chips de conteo de archivos */
.q-chip {
    font-weight: 600;
    border-radius: 8px;
    height: 28px;
}

/* Mejoras responsivas para la tabla */
@media (max-width: 768px) {
    .table-container {
        margin: 0 -1rem;
        border-radius: 0;
    }

    .data-table {
        border-radius: 0;
    }

    .table-header-cell,
    .table-cell {
        padding: 0.8rem 0.5rem !important;
        font-size: 0.8rem !important;
    }

    .action-buttons-cell {
        flex-direction: column;
        gap: 0.25rem;
    }

    .action-btn-small {
        width: 32px;
        height: 32px;
    }

    .document-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }

    .document-info-header {
        flex-direction: column;
        gap: 1rem;
    }

    .info-item {
        min-width: auto;
    }

    .file-item {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
    }

    .file-actions {
        justify-content: center;
    }

    .search-input {
        max-width: 100%;
        min-width: auto;
    }

    .table-header-section {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
    }

    .search-container {
        margin-left: 0;
    }
}

@media (max-width: 1024px) {
    .document-info-header {
        gap: 1rem;
    }

    .file-metadata {
        gap: 0.5rem;
    }
}

@media (max-width: 480px) {
    .dialog-card {
        margin: 1rem;
        min-width: auto !important;
        max-width: calc(100vw - 2rem) !important;
    }

    .document-name {
        font-size: 0.85rem;
    }

    .file-name-expanded {
        font-size: 0.85rem;
    }

    .action-buttons-cell {
        min-width: 120px;
    }
}

/* ===== CSS específico para upload-modal inspirado en controlInterno.vue ===== */
.upload-modal {
    min-width: 600px;
    max-width: 800px;
    width: 90vw;
    max-height: 90vh;
    border-radius: 16px;
    overflow: hidden;
}

.upload-modal .dialog-content {
    padding: 2rem;
    max-height: 70vh;
    overflow-y: auto;
}

.upload-modal .dialog-actions {
    padding: 1.5rem 2rem;
    background: #f8fafc;
    border-top: 1px solid #e2e8f0;
    position: sticky;
    bottom: 0;
    z-index: 10;
}

.file-selection-area {
    width: 100%;
}

.upload-placeholder {
    text-align: center;
    padding: 2rem;
    border: 2px dashed #e2e8f0;
    border-radius: 12px;
    background: #f8fafc;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

.upload-placeholder:hover {
    border-color: #1976d2;
    background: rgba(25, 118, 210, 0.02);
}

.upload-text {
    font-size: 1rem;
    color: var(--text-primary);
    margin: 0;
}

.upload-hint {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin: 0;
}

/* === Estilos para la sección de archivos seleccionados basado en imágenes === */
.selected-files-section {
    width: 100%;
    margin-top: 1rem;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding: 0.75rem 0;
}

.files-counter {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.counter-icon {
    color: #666;
    font-size: 1.1rem;
}

.counter-text {
    font-weight: 600;
    color: #333;
    font-size: 0.95rem;
}

.header-actions {
    display: flex;
    gap: 0.5rem;
}

.add-more-btn, .clear-btn {
    font-size: 0.8rem;
    padding: 0.4rem 0.8rem;
    border-radius: 6px;
    font-weight: 500;
}

.add-more-btn {
    color: #1976d2;
}

.clear-btn {
    color: #d32f2f;
}

/* Grid de archivos con diseño específico según las imágenes */
.files-display-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    max-height: calc((180px + 1rem) * 2);
    overflow-y: auto;
    padding-right: 0.5rem;
}

/* Responsive: 1 archivo centrado */
@media (min-width: 1px) {
    .files-display-grid:has(.file-card:only-child) {
        grid-template-columns: 1fr;
        place-items: center;
    }
    
    .files-display-grid:has(.file-card:only-child) .file-card {
        max-width: 280px;
    }
    
    /* Para 3 archivos: 2 arriba, 1 centrado abajo */
    .files-display-grid:has(.file-card:nth-child(3):last-child) .file-card:nth-child(3) {
        grid-column: 1 / -1;
        justify-self: center;
        max-width: 280px;
    }
}

/* Cards de archivos con diseño exacto a las imágenes */
.file-card {
    background: white;
    border: 2px solid #e3f2fd;
    border-radius: 12px;
    padding: 1rem;
    position: relative;
    transition: all 0.3s ease;
    min-height: 180px;
    display: flex;
    flex-direction: column;
}

.file-card:hover {
    border-color: #1976d2;
    box-shadow: 0 4px 12px rgba(25, 118, 210, 0.15);
    transform: translateY(-2px);
}

.file-card-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    text-align: center;
    position: relative;
}

.file-remove-btn {
    position: absolute;
    top: -8px;
    right: -8px;
    background: white;
    border: 1px solid #ffcdd2;
    width: 20px;
    height: 20px;
    min-width: 20px;
    border-radius: 50%;
    z-index: 2;
}

.file-remove-btn:hover {
    background: #ffebee;
    border-color: #f44336;
}

.file-icon-section {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 1rem 0;
}

.file-main-icon {
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.file-details-section {
    margin-top: auto;
    padding-top: 0.5rem;
    border-top: 1px solid #f5f5f5;
}

.file-name-row {
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    margin-bottom: 0.5rem;
}

.file-name-display {
    font-weight: 600;
    color: #333;
    font-size: 0.9rem;
    line-height: 1.2;
    word-break: break-word;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    flex: 1;
    min-width: 0;
}

.file-metadata-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
}

.file-size-badge {
    font-size: 0.75rem;
    color: #666;
    background: #f5f5f5;
    padding: 0.15rem 0.4rem;
    border-radius: 4px;
    font-weight: 500;
    white-space: nowrap;
    flex-shrink: 0;
}

.file-type-chip {
    font-weight: 600;
    font-size: 0.75rem;
    flex-shrink: 0;
}

.metadata-form {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid #e2e8f0;
}

.upload-progress {
    text-align: center;
    padding: 3rem 2rem;
}

.progress-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    max-width: 300px;
    margin: 0 auto;
}

.upload-icon {
    animation: bounce 2s infinite;
}

@keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
        transform: translateY(0);
    }
    40% {
        transform: translateY(-10px);
    }
    60% {
        transform: translateY(-5px);
    }
}

.progress-title {
    margin: 0;
    color: var(--text-primary);
    font-weight: 600;
    font-size: 1.2rem;
}

.progress-text {
    color: var(--text-secondary);
    margin: 0;
    font-size: 0.9rem;
}

.progress-bar {
    width: 100%;
    border-radius: 8px;
    background: rgba(25, 118, 210, 0.1);
}

.progress-percentage {
    font-weight: 600;
    color: var(--primary-blue);
    font-size: 1.5rem;
    margin: 0;
}

.upload-result {
    text-align: center;
    padding: 3rem 2rem;
}

.success-result,
.error-result {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    max-width: 400px;
    margin: 0 auto;
}

.result-icon {
    animation: scaleIn 0.5s ease-out;
}

@keyframes scaleIn {
    0% {
        transform: scale(0);
        opacity: 0;
    }
    100% {
        transform: scale(1);
        opacity: 1;
    }
}

.result-title {
    margin: 0;
    font-weight: 600;
    font-size: 1.3rem;
}

.success-result .result-title {
    color: #2e7d32;
}

.error-result .result-title {
    color: #c62828;
}

.result-text {
    color: var(--text-secondary);
    margin: 0;
    font-size: 1rem;
    line-height: 1.5;
}

.upload-action-btn {
    font-weight: 600;
    border-radius: 8px;
    padding: 0.75rem 1.5rem;
}

.upload-btn {
    font-weight: 600;
    border-radius: 8px;
    padding: 0.75rem 1.5rem;
}

/* Scroll personalizado para contenido del modal */
.upload-modal .dialog-content::-webkit-scrollbar {
    width: 6px;
}

.upload-modal .dialog-content::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
}

.upload-modal .dialog-content::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
}

.upload-modal .dialog-content::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
}

/* Scroll personalizado para el grid de archivos */
.files-display-grid::-webkit-scrollbar {
    width: 6px;
}

.files-display-grid::-webkit-scrollbar-track {
    background: #f8fafc;
    border-radius: 3px;
}

.files-display-grid::-webkit-scrollbar-thumb {
    background: #cbd5e0;
    border-radius: 3px;
}

.files-display-grid::-webkit-scrollbar-thumb:hover {
    background: #a0aec0;
}

/* Mejoras responsivas para el modal */
@media (max-width: 768px) {
    .upload-modal {
        min-width: auto;
        width: 95vw;
        margin: 1rem;
        max-height: 95vh;
    }

    .upload-modal .dialog-content {
        padding: 1.5rem;
        max-height: 60vh;
    }

    .upload-modal .dialog-actions {
        padding: 1rem 1.5rem;
        flex-direction: column;
        gap: 0.75rem;
        align-items: stretch;
    }

    .upload-modal .dialog-actions .q-btn {
        width: 100%;
        justify-content: center;
    }

    .upload-modal .files-display-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 0.75rem;
        max-height: calc((160px + 0.75rem) * 2);
    }
    
    .file-card {
        min-height: 160px;
        padding: 0.75rem;
    }

    .section-header {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
    }

    .header-buttons {
        justify-content: center;
    }

    .files-title {
        justify-content: center;
        text-align: center;
    }

    .upload-placeholder {
        padding: 1.5rem;
    }

    .progress-content,
    .success-result,
    .error-result {
        padding: 1rem;
    }

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