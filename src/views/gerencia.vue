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
                    <q-btn flat icon="people" label="Usuarios" align="left" class="menu-item" no-caps />
                    <q-btn flat icon="settings" label="Configuración" align="left" class="menu-item" no-caps />
                </div>
            </div>

            <!-- Main Content -->
            <div class="main-content">

                <!-- Header -->
                <div class="content-header">
                    <div class="header-left">
                        <div class="department-indicator">
                            <q-chip 
                                :color="getDepartmentColor(selectedDepartment)" 
                                text-color="white" 
                                :icon="getDepartmentIcon(selectedDepartment)"
                                size="md"
                                class="department-chip"
                            >
                                {{ getDepartmentTitle() }}
                            </q-chip>
                        </div>
                        <h4 class="page-title">{{ getDepartmentTitle() }}</h4>
                        <p class="page-subtitle">{{ getDepartmentSubtitle() }}</p>
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
                    <q-btn-dropdown
                        v-for="item in backdropFilterList"
                        :key="item.label"
                        unelevated
                        color="primary"
                        :label="item.label"
                        @click="item.onClick"
                        icon="cloud_upload"
                        class="upload-btn"
                    >
                        <q-tooltip>Subir documentos de gerencia</q-tooltip>
                    </q-btn-dropdown>
                </div>

                <!-- Tabs para Departamentos -->
                <div class="departments-tabs-container">
                    <q-tabs
                        v-model="selectedDepartment"
                        class="text-blue-7"
                        indicator-color="blue-7"
                        align="left"
                        narrow-indicator
                        @update:model-value="onDepartmentChange"
                    >
                        <q-tab 
                            v-for="dept in visibleDepartments" 
                            :key="dept.key"
                            :name="dept.key" 
                            :label="dept.label"
                            :icon="dept.icon"
                            class="department-tab"
                        />
                    </q-tabs>
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
                                <div class="table-title-container">
                                    <h5 class="table-title">Documentos</h5>
                                    <q-chip 
                                        :color="getDepartmentColor(selectedDepartment)" 
                                        text-color="white" 
                                        :icon="getDepartmentIcon(selectedDepartment)"
                                        size="sm"
                                        dense
                                        class="table-department-indicator"
                                    >
                                        {{ getDepartmentTitle() }}
                                    </q-chip>
                                </div>
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
                                            <q-icon name="search" />
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
                                            Los documentos aparecerán aquí una vez que los subas.
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

                <!-- Upload Dialog -->
                <div class="q-pa-md q-gutter-sm">
                    <q-dialog v-model="dialog" :backdrop-filter="backdropFilter">
                        <q-card class="dialog-card upload-modal">
                            <q-card-section class="dialog-header">
                                <div class="dialog-title">
                                    <q-icon name="cloud_upload" size="1.5rem" />
                                    <h6>Subir Documento de Gerencia</h6>
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

                                        <!-- Área para mostrar archivos seleccionados y opción para agregar más -->
                                        <div v-if="selectedFiles.length > 0" class="selected-files-section">
                                            <div class="section-header">
                                                <h6 class="files-title">
                                                    <q-icon name="attachment" class="q-mr-sm" />
                                                    {{ selectedFiles.length }} archivo{{ selectedFiles.length !== 1 ? 's' : '' }} seleccionado{{ selectedFiles.length !== 1 ? 's' : '' }}
                                                </h6>
                                                <div class="header-buttons">
                                                    <q-btn 
                                                        flat
                                                        dense
                                                        icon="add"
                                                        label="Agregar más"
                                                        @click="triggerFileSelection(true)"
                                                        color="blue-7"
                                                        size="sm"
                                                        class="q-mr-sm"
                                                    />
                                                    <q-btn 
                                                        flat
                                                        dense
                                                        icon="clear_all"
                                                        label="Limpiar"
                                                        @click="clearFiles"
                                                        color="red-7"
                                                        size="sm"
                                                    />
                                                </div>
                                            </div>

                                            <!-- Grid de archivos seleccionados -->
                                            <div class="files-grid">
                                                <div 
                                                    v-for="(file, index) in selectedFiles" 
                                                    :key="index"
                                                    class="file-item-preview"
                                                >
                                                    <div class="file-preview-content">
                                                        <div class="file-icon-container">
                                                            <q-icon 
                                                                :name="getFileIcon(file.type)"
                                                                :color="getFileColorByExtension(file.name)"
                                                                size="2rem"
                                                            />
                                                            <q-btn 
                                                                flat
                                                                round
                                                                dense
                                                                icon="close"
                                                                color="red"
                                                                size="xs"
                                                                class="remove-file-btn"
                                                                @click="removeFile(index)"
                                                            >
                                                                <q-tooltip>Eliminar archivo</q-tooltip>
                                                            </q-btn>
                                                        </div>
                                                        <div class="file-info">
                                                            <p class="file-name">{{ file.name }}</p>
                                                            <p class="file-size">{{ formatFileSize(file.size) }}</p>
                                                            <q-chip 
                                                                :color="getFileTypeColor(getFileExtension(file.name))"
                                                                :text-color="getFileTypeTextColor(getFileExtension(file.name))"
                                                                size="sm"
                                                                dense
                                                            >
                                                                {{ getFileExtension(file.name).toUpperCase() }}
                                                            </q-chip>
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
                                    <div v-if="selectedDocumentForView.archivos && selectedDocumentForView.archivos.length > 0">
                                        <q-list bordered separator>
                                            <q-item
                                                v-for="file in selectedDocumentForView.archivos"
                                                :key="file.id"
                                                class="file-list-item"
                                            >
                                                <q-item-section avatar>
                                                    <q-icon 
                                                        :name="getFileIconByName(file.nombre)" 
                                                        :color="getFileColor(file.formato)" 
                                                        size="1.5rem"
                                                    />
                                                </q-item-section>
                                                
                                                <q-item-section>
                                                    <q-item-label class="file-name">{{ file.nombre }}</q-item-label>
                                                    <q-item-label caption class="file-details">
                                                        {{ file.tamaño }} • {{ file.fechaSubida }}
                                                    </q-item-label>
                                                </q-item-section>
                                                
                                                <q-item-section side>
                                                    <div class="file-actions">
                                                        <q-btn
                                                            flat
                                                            round
                                                            dense
                                                            icon="open_in_new"
                                                            color="blue-7"
                                                            @click="openFileInNewTab(file)"
                                                            size="sm"
                                                        >
                                                            <q-tooltip>Abrir en nueva pestaña</q-tooltip>
                                                        </q-btn>
                                                        <q-btn
                                                            flat
                                                            round
                                                            dense
                                                            icon="download"
                                                            color="green-7"
                                                            @click="downloadSingleFile(file)"
                                                            size="sm"
                                                        >
                                                            <q-tooltip>Descargar archivo</q-tooltip>
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
                                <q-btn 
                                    flat 
                                    label="Cerrar" 
                                    color="grey-7" 
                                    v-close-popup
                                />
                                <q-btn 
                                    v-if="selectedDocumentForView && selectedDocumentForView.tieneArchivos"
                                    unelevated 
                                    label="Descargar Todos" 
                                    color="primary" 
                                    icon="download"
                                    @click="downloadDocuments(selectedDocumentForView)"
                                />
                            </q-card-actions>
                        </q-card>
                    </q-dialog>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onMounted } from 'vue'
import { getData } from '../services/apiClient.js'
import { useAuth } from '../stores/store.js'
import { useRouter } from 'vue-router'
import axios from 'axios'


const router = useRouter()
const authStore = useAuth()

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
const loading = ref(false)
const isAddingMoreFiles = ref(false)

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

/**
 * Recarga la lista de documentos del departamento seleccionado
 */
async function loadDocuments(department = null) {
    const dept = department || selectedDepartment.value;
    await getDocuments(dept);
}

/**
 * Maneja el cambio de departamento en las pestañas
 */
async function onDepartmentChange(newDepartment) {
    console.log('🔄 Cambiando a departamento:', newDepartment);
    selectedDepartment.value = newDepartment;
    searchTerm.value = ''; // Limpiar búsqueda al cambiar departamento
    await loadDocuments(newDepartment);
}

/**
 * Obtiene el título dinámico según el departamento seleccionado
 */
function getDepartmentTitle() {
    const department = departments.value.find(dept => dept.key === selectedDepartment.value);
    return department ? department.label : 'Gerencia';
}

/**
 * Obtiene el subtítulo dinámico según el departamento seleccionado
 */
function getDepartmentSubtitle() {
    const department = departments.value.find(dept => dept.key === selectedDepartment.value);
    return department ? `Gestiona Documentos de ${department.label}` : 'Gestiona Documentos de Gerencia';
}

/**
 * Obtiene el color del departamento para el chip indicador
 */
function getDepartmentColor(departmentKey) {
    const colorMap = {
        'gerencia': 'blue-7',
        'sistemas': 'purple-7',
        'contabilidad': 'green-7',
        'tesoreria': 'orange-7',
        'talento-humano': 'pink-7',
        'credito': 'indigo-7',
        'control-interno': 'red-7',
        'riesgos': 'amber-8',
        'compras': 'teal-7'
    };
    return colorMap[departmentKey] || 'blue-7';
}

/**
 * Obtiene el icono del departamento para el chip indicador
 */
function getDepartmentIcon(departmentKey) {
    const iconMap = {
        'gerencia': 'business',
        'sistemas': 'computer',
        'contabilidad': 'calculate',
        'tesoreria': 'account_balance',
        'talento-humano': 'people',
        'credito': 'credit_card',
        'control-interno': 'security',
        'riesgos': 'warning',
        'compras': 'shopping_cart'
    };
    return iconMap[departmentKey] || 'business';
}

/**
 * Computed para verificar si el usuario puede ver todos los departamentos
 */
const canViewAllDepartments = computed(() => {
    const userRole = authStore.getUserRole();
    return ['gerencia', 'administrador', 'sistemas'].includes(userRole);
});

/**
 * Computed para obtener los departamentos visibles según el rol
 */
const visibleDepartments = computed(() => {
    if (canViewAllDepartments.value) {
        return departments.value;
    }
    // Si no es gerente, solo mostrar su propio departamento
    return departments.value.filter(dept => dept.key === 'gerencia');
});

/**
 * Busca documentos según el término ingresado en el departamento seleccionado
 */
async function searchDocuments() {
    if (!searchTerm.value) {
        await getDocuments(selectedDepartment.value);
        return;
    }
    
    try {
        loading.value = true;
        console.log('🔍 Buscando documentos en', selectedDepartment.value, ':', searchTerm.value);
        
        // Filtrar documentos localmente del departamento seleccionado
        const searchTermLower = searchTerm.value.toLowerCase();
        const allDocuments = await axios.get(`http://localhost:5000/api/${selectedDepartment.value}`);
        
        if (allDocuments.data && Array.isArray(allDocuments.data)) {
            const filteredDocuments = allDocuments.data.filter(doc => {
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
    await getDocuments(selectedDepartment.value);
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
        const backendUrl = `http://localhost:5000/api/gerencia/${currentDoc._id}/file/${fileIndex}/download`;
        console.log('🔗 Usando backend URL:', backendUrl);
        window.open(backendUrl, '_blank');
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
        const downloadUrl = `http://localhost:5000/api/gerencia/${documentId}/file/${fileIndex}/download`;
        
        // Abrir directamente en nueva pestaña para que redirija a Firebase
        window.open(downloadUrl, '_blank');
        
    } catch (error) {
        console.error('❌ Error al descargar archivo desde backend:', error);
        showNotification('negative', 'Error en descarga', `No se pudo descargar: ${fileName}`);
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
                const backendUrl = `http://localhost:5000/api/gerencia/${document._id}/file/${index}/download`;
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
 * Elimina un documento y todos sus archivos
 */
async function deleteDocument(document) {
    const confirmDelete = confirm(`¿Estás seguro de que quieres eliminar el documento "${document.documento}"?\n\nEsta acción eliminará el documento y todos sus archivos de forma permanente.`);
    
    if (!confirmDelete) {
        return;
    }
    
    try {
        console.log('🗑️ Eliminando documento:', document._id);
        
        const response = await axios.delete(`http://localhost:5000/api/gerencia/${document._id}`);
        
        console.log('✅ Documento eliminado:', response.data);
        
        showNotification('positive', 'Documento eliminado', 'El documento y sus archivos han sido eliminados correctamente');
        
        // Recargar la lista de documentos
        await getDocuments();
        
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

// Departamentos disponibles para gerencia
const selectedDepartment = ref('gerencia')
const departments = ref([
    { key: 'gerencia', label: 'Gerencia', icon: 'business' },
    { key: 'sistemas', label: 'Sistemas', icon: 'computer' },
    { key: 'contabilidad', label: 'Contabilidad', icon: 'calculate' },
    { key: 'tesoreria', label: 'Tesorería', icon: 'account_balance' },
    { key: 'talento-humano', label: 'Talento Humano', icon: 'people' },
    { key: 'credito', label: 'Crédito', icon: 'credit_card' },
    { key: 'control-interno', label: 'Control Interno', icon: 'security' },
    { key: 'riesgos', label: 'Riesgos', icon: 'warning' },
    { key: 'compras', label: 'Compras', icon: 'shopping_cart' }
])

/**
 * Lista de botones para subir documentos
 */
const list = [
  'Subir Documento de Gerencia',
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
 * Maneja la selección de archivos múltiples
 */
function onFileSelect(event) {
    const files = Array.from(event.target.files)
    if (files.length > 0) {
        handleFilesSelection(files, isAddingMoreFiles.value)
    }
    // Limpiar el input para permitir seleccionar los mismos archivos nuevamente
    if (fileInput.value) {
        fileInput.value.value = ''
    }
}

/**
 * Maneja el drop de múltiples archivos
 */
function onFileDrop(event) {
    event.preventDefault()
    isDragOver.value = false
    
    const files = Array.from(event.dataTransfer.files)
    if (files.length > 0) {
        handleFilesSelection(files, false)
    }
}

/**
 * Maneja la selección de archivos con validaciones
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
    
    const currentFiles = addToExisting ? [...selectedFiles.value] : []
    
    // Validar cantidad máxima (10 archivos total)
    if (currentFiles.length + files.length > 10) {
        showNotification('negative', 'Demasiados archivos', `Se permite un máximo de 10 archivos por subida (actualmente: ${currentFiles.length})`)
        return
    }
    
    const validFiles = []
    const maxSize = 10 * 1024 * 1024 // 10MB
    
    for (const file of files) {
        // Validar si el archivo ya existe
        if (currentFiles.some(existingFile => existingFile.name === file.name && existingFile.size === file.size)) {
            showNotification('negative', `Archivo duplicado: ${file.name}`, 'Este archivo ya está seleccionado')
            continue
        }
        
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
        
        // Validar que el archivo no esté vacío
        if (file.size === 0) {
            showNotification('negative', `Archivo vacío: ${file.name}`, 'No se pueden subir archivos vacíos')
            continue
        }
        
        validFiles.push(file)
    }
    
    if (validFiles.length === 0) {
        showNotification('negative', 'Sin archivos válidos', 'No se seleccionaron archivos válidos')
        return
    }
    
    selectedFiles.value = [...currentFiles, ...validFiles]
    
    // Generar título automático si no existe o si es la primera selección
    if (!addToExisting || !documentTitle.value) {
        if (selectedFiles.value.length === 1) {
            documentTitle.value = selectedFiles.value[0].name.replace(/\.[^/.]+$/, "")
        } else {
            documentTitle.value = `Lote de ${selectedFiles.value.length} archivos`
        }
    }
    
    isAddingMoreFiles.value = false
    
    console.log('✅ Archivos seleccionados:', validFiles.length, '| Total:', selectedFiles.value.length)
}

/**
 * Limpia los archivos seleccionados
 */
function clearFiles() {
    selectedFiles.value = []
    documentTitle.value = ''
    documentDescription.value = ''
    isAddingMoreFiles.value = false
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
        documentDescription.value = ''
    } else if (selectedFiles.value.length === 1) {
        // Si solo queda un archivo, usar su nombre como título
        if (documentTitle.value.startsWith('Lote de')) {
            documentTitle.value = selectedFiles.value[0].name.replace(/\.[^/.]+$/, "")
        }
    } else {
        // Si aún hay múltiples archivos, actualizar contador
        if (documentTitle.value.startsWith('Lote de')) {
            documentTitle.value = `Lote de ${selectedFiles.value.length} archivos`
        }
    }
}

/**
 * Abre el diálogo de selección de archivos
 */
function triggerFileSelection(addingMore = false) {
    isAddingMoreFiles.value = addingMore
    if (fileInput.value) {
        fileInput.value.click()
    }
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
 * Sube archivos individualmente al servidor
 */
async function uploadFiles() {
    if (selectedFiles.value.length === 0 || !documentTitle.value.trim()) {
        showNotification('negative', 'Datos incompletos', 'Selecciona al menos un archivo y proporciona un título')
        return
    }
    
    try {
        isUploading.value = true
        uploadProgress.value = 0
        uploadResult.value = null
        
        let uploadedCount = 0
        let hasErrors = false
        const errors = []
        
        console.log(`📤 Iniciando subida individual de ${selectedFiles.value.length} archivo(s)...`)
        
        // Subir cada archivo individualmente
        for (let i = 0; i < selectedFiles.value.length; i++) {
            const file = selectedFiles.value[i]
            
            try {
                console.log(`📄 Subiendo archivo ${i + 1}/${selectedFiles.value.length}:`, file.name)
                
                const formData = new FormData()
                formData.append('documento', `${documentTitle.value} - ${file.name.split('.')[0]}`)
                formData.append('documentos', file)
                
                // Subir archivo individual
                const response = await axios.post(
                    'http://localhost:5000/api/gerencia',
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                        onUploadProgress: (progressEvent) => {
                            const fileProgress = (progressEvent.loaded * 100) / progressEvent.total
                            const totalProgress = ((i + (fileProgress / 100)) / selectedFiles.value.length) * 100
                            uploadProgress.value = Math.round(totalProgress)
                        },
                    }
                )
                
                console.log(`✅ Archivo ${i + 1} subido:`, response.data)
                uploadedCount++
                
            } catch (error) {
                console.error(`❌ Error al subir archivo ${i + 1}:`, error)
                hasErrors = true
                errors.push(`${file.name}: ${error.response?.data?.message || error.message}`)
            }
        }
        
        // Configurar resultado
        if (uploadedCount === selectedFiles.value.length) {
            uploadResult.value = {
                success: true,
                filesUploaded: uploadedCount
            }
            
            const message = uploadedCount === 1 
                ? 'Archivo subido exitosamente' 
                : `${uploadedCount} archivos subidos exitosamente`
            
            showNotification('positive', message, 'Los documentos han sido guardados en el sistema')
        } else if (uploadedCount > 0) {
            uploadResult.value = {
                success: true,
                filesUploaded: uploadedCount,
                partialSuccess: true,
                errors: errors
            }
            
            showNotification('negative', `Subida parcial: ${uploadedCount}/${selectedFiles.value.length} archivos`, `Errores: ${errors.join(', ')}`)
        } else {
            uploadResult.value = {
                success: false,
                error: `No se pudo subir ningún archivo. Errores: ${errors.join(', ')}`
            }
            
            showNotification('negative', 'Error completo en la subida', 'No se pudo subir ningún archivo')
        }
        
        // Recargar la lista de documentos si al menos un archivo se subió
        if (uploadedCount > 0) {
            await getDocuments()
        }
        
    } catch (error) {
        console.error('❌ Error general en subida:', error)
        
        uploadResult.value = {
            success: false,
            error: error.response?.data?.message || error.message || 'Error desconocido'
        }
        
        showNotification('negative', 'Error al subir archivos', uploadResult.value.error)
    } finally {
        isUploading.value = false
        uploadProgress.value = 100
    }
}



function handleLogout() {
    // Usar el store para cerrar sesión correctamente
    const authStore = useAuth()
    authStore.logOut()

    // Redirigir al login
    router.push('/')
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

async function getDocuments(department = 'gerencia') {
    try {
        loading.value = true;
        console.log(`📥 Cargando documentos de ${department}...`);
        
        const response = await axios.get(`http://localhost:5000/api/${department}`);
        
        if (response.data && Array.isArray(response.data)) {
            // Procesar los datos para añadir propiedades calculadas
            rows.value = response.data.map(doc => ({
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
            
            console.log(`✅ Documentos de ${department} cargados:`, rows.value.length);
        } else {
            console.log('⚠️ La respuesta no contiene los datos esperados');
            rows.value = [];
        }
    } catch (error) {
        console.error('❌ Error al obtener los documentos:', error);
        showNotification('negative', 'Error al cargar documentos', 'No se pudieron obtener los documentos');
        rows.value = [];
    } finally {
        loading.value = false;
    }
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
 * Obtiene el color del archivo según su extensión
 */
function getFileColorByExtension(fileName) {
    if (!fileName) return 'grey-6'
    
    const extension = fileName.split('.').pop()?.toLowerCase() || ''
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
        'webp': 'purple-6',
        'txt': 'orange-6',
        'csv': 'teal-6'
    }
    
    return colorMap[extension] || 'grey-6'
}

onMounted(() => {
    getDocuments();
});
</script>

<style scoped>

*{
    margin: 0;
    padding: 0;
}
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
    padding: 1.5rem 1rem;
    border-radius: 16px;
    box-shadow: var(--shadow);
}

.header-left {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    position: relative;
}

.department-indicator {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
}

.department-chip {
    font-weight: 600;
    font-size: 0.85rem;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    position: relative;
    overflow: hidden;
}

.department-chip::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, 
        transparent 0%, 
        rgba(255, 255, 255, 0.3) 50%, 
        transparent 100%);
    animation: shimmer 2s infinite;
}

@keyframes shimmer {
    0% {
        left: -100%;
    }
    100% {
        left: 100%;
    }
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
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.stat-card {
    background: var(--white);
    border-radius: 12px;
    box-shadow: var(--shadow);
    transition: all 0.3s ease;
}

.stat-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
}

.stat-card .q-card-section {
    padding: 1rem !important;
}

.stat-icon {
    padding: 0.5rem;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.2);
    flex-shrink: 0;
}

.blue-icon {
    background: rgba(25, 118, 210, 0.1);
}

.stat-info {
    flex: 1;
    min-width: 0;
}

.stat-number {
    margin: 0;
    font-size: 1.4rem;
    font-weight: 700;
    line-height: 1.2;
}

.stat-value {
    margin: 0;
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--text-primary);
}

.stat-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.stat-value {
    margin: 0;
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text-primary);
}

.stat-label {
    margin: 0;
    margin-top: 0.25rem;
    color: var(--text-secondary);
    font-size: 0.75rem;
    font-weight: 500;
}

/* Estilos específicos para las cards con gradientes */
.blue-gradient .stat-number,
.light-blue-gradient .stat-number {
    color: white;
}

.blue-gradient .stat-label,
.light-blue-gradient .stat-label {
    color: rgba(255, 255, 255, 0.9);
}

.white-card .stat-number {
    color: var(--primary-blue);
}

.white-card .stat-label {
    color: var(--text-secondary);
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

/* Estilos para las pestañas de departamentos */
.departments-tabs-container {
    margin-bottom: 2rem;
    background: var(--white);
    border-radius: 16px;
    box-shadow: var(--shadow);
    overflow: hidden;
}

.department-tab {
    font-weight: 600;
    font-size: 0.9rem;
    text-transform: none;
    padding: 1rem 1.5rem;
    min-height: 60px;
    border-radius: 0;
    transition: all 0.3s ease;
    position: relative;
    color: var(--text-secondary);
    background: transparent;
}

.department-tab:hover {
    background: rgba(25, 118, 210, 0.1);
    color: var(--primary-blue);
    transform: translateY(-1px);
}

.department-tab.q-tab--active {
    background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%) !important;
    color: white !important;
    box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
    position: relative;
    z-index: 1;
    border: 2px solid rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
}

.department-tab.q-tab--active::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #fff 0%, rgba(255,255,255,0.8) 50%, #fff 100%);
    border-radius: 2px 2px 0 0;
}

.department-tab.q-tab--active::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at center, 
        rgba(255, 255, 255, 0.1) 0%, 
        transparent 70%);
    border-radius: inherit;
    pointer-events: none;
}

.department-tab.q-tab--active .q-icon {
    color: white !important;
    filter: drop-shadow(0 1px 2px rgba(0,0,0,0.1));
}

.department-tab .q-tab__content {
    gap: 8px;
    font-weight: 600;
}

.department-tab .q-icon {
    font-size: 1.2rem;
    transition: all 0.3s ease;
}

.table-container {
    background: var(--white);
    border-radius: 16px;
    box-shadow: var(--shadow);
    overflow: hidden;
    margin-bottom: 2rem;
    margin-top: 50px;
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

.table-header-section {
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--border-color);
    gap: 1rem;
    padding: 1.5rem;
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.table-title-container {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.table-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
}

.table-department-indicator {
    font-weight: 600;
    font-size: 0.75rem;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    animation: pulse 3s infinite;
}

@keyframes pulse {
    0%, 100% {
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    }
    50% {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        transform: scale(1.02);
    }
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

.table-cell {
    padding: 1.2rem 1rem;
    border-bottom: 1px solid var(--border-color);
    vertical-align: middle;
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
        padding: 0.8rem 0.5rem;
        font-size: 0.8rem;
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
    --tab-active-shadow: 0 4px 20px rgba(25, 118, 210, 0.4);
}

/* Mejoras adicionales para la visibilidad de tabs activos */
.q-tabs .q-tab--active {
    background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%) !important;
    color: white !important;
    box-shadow: var(--tab-active-shadow);
    border-radius: 8px 8px 0 0;
    margin: 0 2px;
    position: relative;
    overflow: hidden;
}

.q-tabs .q-tab--active::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, 
        rgba(255,255,255,0.1) 0%, 
        transparent 50%, 
        rgba(255,255,255,0.1) 100%);
    pointer-events: none;
}

.q-tabs__content {
    border-bottom: 2px solid var(--border-color);
}

.q-tabs .q-tab {
    margin: 0 1px;
    border-radius: 8px 8px 0 0;
}

/* Indicador específico para el departamento activo */
.departments-tabs-container .q-tabs__content--align-left {
    background: linear-gradient(90deg, 
        rgba(25, 118, 210, 0.05) 0%, 
        transparent 30%, 
        transparent 70%, 
        rgba(25, 118, 210, 0.05) 100%);
}

/* Animación para tabs activos */
@keyframes tabActivate {
    0% {
        transform: scale(0.95);
        opacity: 0.8;
    }
    100% {
        transform: scale(1);
        opacity: 1;
    }
}

.department-tab.q-tab--active {
    animation: tabActivate 0.3s ease-out;
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

/* ===== CSS específico para upload-modal ===== */
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
}

.upload-placeholder:hover {
    border-color: #1976d2;
    background: rgba(25, 118, 210, 0.02);
}

.selected-files-section {
    width: 100%;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e2e8f0;
}

.files-title {
    margin: 0;
    color: var(--text-primary);
    font-weight: 600;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
}

.header-buttons {
    display: flex;
    gap: 0.5rem;
    flex-shrink: 0;
}

.files-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
    max-height: 400px;
    overflow-y: auto;
    padding-right: 0.5rem;
}

.file-item-preview {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.3s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.file-item-preview:hover {
    border-color: #1976d2;
    box-shadow: 0 4px 12px rgba(25, 118, 210, 0.15);
    transform: translateY(-1px);
}

.file-preview-content {
    padding: 1rem;
}

.file-icon-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0.75rem;
}

.remove-file-btn {
    position: absolute;
    top: -8px;
    right: -8px;
    background: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.file-info {
    text-align: center;
}

.file-info .file-name {
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 0.5rem 0;
    font-size: 0.9rem;
    line-height: 1.3;
    word-break: break-word;
}

.file-info .file-size {
    color: var(--text-secondary);
    font-size: 0.8rem;
    margin: 0 0 0.5rem 0;
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

.files-grid::-webkit-scrollbar {
    width: 6px;
}

.files-grid::-webkit-scrollbar-track {
    background: #f8fafc;
    border-radius: 3px;
}

.files-grid::-webkit-scrollbar-thumb {
    background: #cbd5e0;
    border-radius: 3px;
}

.files-grid::-webkit-scrollbar-thumb:hover {
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

    .upload-modal .files-grid {
        grid-template-columns: 1fr;
        gap: 0.75rem;
        max-height: 300px;
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
}

@media (max-width: 480px) {
    .upload-modal {
        width: calc(100vw - 1rem);
        margin: 0.5rem;
        min-width: auto;
        max-height: 98vh;
    }

    .upload-modal .dialog-content {
        padding: 1rem;
        max-height: 50vh;
    }

    .upload-modal .dialog-actions {
        padding: 0.75rem 1rem;
    }

    .file-item-preview {
        border-radius: 8px;
    }

    .file-preview-content {
        padding: 0.75rem;
    }

    .metadata-form {
        margin-top: 1rem;
        padding-top: 1rem;
    }

    .upload-placeholder {
        padding: 1rem;
    }

    .upload-text,
    .upload-hint {
        font-size: 0.9rem;
    }

    .progress-title {
        font-size: 1.1rem;
    }

    .result-title {
        font-size: 1.2rem;
    }
}

/* Media queries para sidebar y layout general */
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
        gap: 0.75rem;
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