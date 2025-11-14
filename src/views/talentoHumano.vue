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
                       
                        <h4 class="page-title">Talento Humano</h4>
                        <p class="page-subtitle">Gestiona Documentos de Recursos Humanos</p>
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
                        <q-card class="dialog-card" style="min-width: 500px;">
                            <q-card-section class="dialog-header">
                                <div class="dialog-title">
                                    <q-icon name="cloud_upload" size="1.5rem" />
                                    <h6>Subir Documento de Recursos Humanos</h6>
                                </div>
                                <q-btn flat round dense icon="close" color="white" v-close-popup />
                            </q-card-section>

                            <q-card-section class="dialog-content">
                                <!-- Área de subida de archivos -->
                                <div class="upload-area" :class="{ 'drag-over': isDragOver }" @drop="onFileDrop"
                                    @dragover.prevent="isDragOver = true" @dragleave="isDragOver = false">

                                    <!-- Estado inicial: sin archivos -->
                                    <div v-if="selectedFiles.length === 0" class="upload-placeholder">
                                        <q-icon name="cloud_upload" size="3rem" color="blue-7" />
                                        <p class="upload-text">
                                            Arrastra y suelta tus archivos aquí o
                                            <label for="file-input" class="upload-link">haz clic para
                                                seleccionar</label>
                                        </p>
                                        <p class="upload-hint">
                                            Formatos soportados: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (máx. 10MB, máx. 10 archivos)
                                        </p>
                                        <input id="file-input" type="file" ref="fileInput" @change="onFileSelect"
                                            style="display: none" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" multiple />
                                    </div>

                                    <!-- Archivos seleccionados -->
                                    <div v-if="selectedFiles.length > 0 && !isUploading" class="files-preview">
                                        <div class="files-header">
                                            <h6 class="files-count">{{ selectedFiles.length }} archivo(s) seleccionado(s)</h6>
                                            <q-btn flat round icon="close" @click="clearFiles" size="sm" />
                                        </div>
                                        
                                        <div class="files-list">
                                            <div v-for="(file, index) in selectedFiles" :key="index" class="file-item">
                                                <q-icon :name="getFileIcon(file.type)" size="md" color="blue-7" />
                                                <div class="file-info">
                                                    <div class="file-name">{{ file.name }}</div>
                                                    <div class="file-size">{{ formatFileSize(file.size) }}</div>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Metadatos adicionales -->
                                        <div class="metadata-form">
                                            <q-input 
                                                v-model="documentTitle" 
                                                label="Título del documento *" 
                                                outlined
                                                class="q-mb-md"
                                                :rules="[val => !!val || 'El título es requerido']"
                                            />
                                            <q-textarea 
                                                v-model="documentDescription" 
                                                label="Descripción (opcional)"
                                                outlined 
                                                rows="3" 
                                            />
                                        </div>
                                    </div>

                                    <!-- Progreso de subida -->
                                    <div v-if="isUploading" class="upload-progress">
                                        <div class="progress-content">
                                            <q-icon name="cloud_upload" size="2rem" color="blue-7" />
                                            <p class="progress-text">Subiendo {{ selectedFiles.length }} archivo(s)...</p>
                                            <q-linear-progress :value="uploadProgress / 100" color="blue-7" size="8px"
                                                class="q-mt-md" />
                                            <p class="progress-percentage">{{ uploadProgress }}%</p>
                                        </div>
                                    </div>

                                    <!-- Resultado de subida -->
                                    <div v-if="uploadResult" class="upload-result">
                                        <div v-if="uploadResult.success" class="success-result">
                                            <q-icon name="check_circle" size="2rem" color="green" />
                                            <p class="result-text">¡{{ uploadResult.filesUploaded }} archivo(s) subido(s) exitosamente!</p>
                                            <p class="result-details">Los documentos se han guardado en el sistema.</p>
                                        </div>
                                        <div v-else class="error-result">
                                            <q-icon name="error" size="2rem" color="red" />
                                            <p class="result-text">Error al subir archivos</p>
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
                                        department-key="talento-humano" 
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
                                            <q-tooltip>Ver detalles</q-tooltip>
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
                                            color="red-6"
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
                                                name="description"
                                                size="md"
                                                :color="props.row.tieneArchivos ? 'blue-7' : 'grey-5'"
                                                class="document-icon"
                                            />
                                            <div class="document-details">
                                                <div class="document-name">{{ col.value }}</div>
                                                <div v-if="props.row.tieneArchivos" class="document-files-count">
                                                    {{ props.row.cantidadArchivos }} archivo(s) adjunto(s)
                                                </div>
                                                <div v-else class="no-files-text">
                                                    Sin archivos adjuntos
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-else-if="col.name === 'tipoArchivo'" class="file-type-cell">
                                        <div v-if="props.row.tieneArchivos" class="file-type-chips">
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
                                        <q-chip v-else color="grey-3" text-color="grey-6" size="sm">
                                            Sin archivos
                                        </q-chip>
                                    </div>
                                    <div v-else-if="col.name === 'cantidadArchivos'" class="files-count-cell">
                                        <q-chip
                                            :color="props.row.tieneArchivos ? 'blue-1' : 'grey-3'"
                                            :text-color="props.row.tieneArchivos ? 'blue-8' : 'grey-6'"
                                            :icon="props.row.tieneArchivos ? 'attach_file' : 'attach_file'"
                                            size="sm"
                                        >
                                            {{ col.value }}
                                        </q-chip>
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
                                            Sube tu primer documento de recursos humanos para comenzar
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

                <!-- Upload Dialog -->
                <div class="upload-dialog-section">
                    <q-dialog v-model="dialog" :backdrop-filter="backdropFilter">
                        <q-card class="dialog-card" style="min-width: 500px;">
                            <q-card-section class="dialog-header">
                                <div class="dialog-title">
                                    <q-icon name="cloud_upload" size="1.5rem" />
                                    <h6>Subir Documento de Recursos Humanos</h6>
                                </div>
                                <q-btn flat round dense icon="close" color="white" v-close-popup />
                            </q-card-section>

                            <q-card-section class="dialog-content">
                                <!-- Área de subida de archivos -->
                                <div class="upload-area" :class="{ 'drag-over': isDragOver }" @drop="onFileDrop"
                                    @dragover.prevent="isDragOver = true" @dragleave="isDragOver = false">

                                    <!-- Estado inicial: sin archivos -->
                                    <div v-if="selectedFiles.length === 0" class="upload-placeholder">
                                        <q-icon name="cloud_upload" size="3rem" color="blue-7" />
                                        <p class="upload-text">
                                            Arrastra y suelta tus archivos aquí o
                                            <label for="file-input" class="upload-link">haz clic para
                                                seleccionar</label>
                                        </p>
                                        <p class="upload-hint">
                                            Formatos soportados: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (máx. 10MB, máx. 10 archivos)
                                        </p>
                                        <input id="file-input" type="file" ref="fileInput" @change="onFileSelect"
                                            style="display: none" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" multiple />
                                    </div>

                                    <!-- Archivos seleccionados -->
                                    <div v-if="selectedFiles.length > 0 && !isUploading" class="files-preview">
                                        <div class="files-header">
                                            <h6 class="files-count">{{ selectedFiles.length }} archivo(s) seleccionado(s)</h6>
                                            <q-btn flat round icon="close" @click="clearFiles" size="sm" />
                                        </div>
                                        
                                        <div class="files-list">
                                            <div v-for="(file, index) in selectedFiles" :key="index" class="file-item">
                                                <q-icon :name="getFileIcon(file.type)" size="md" color="blue-7" />
                                                <div class="file-info">
                                                    <div class="file-name">{{ file.name }}</div>
                                                    <div class="file-size">{{ formatFileSize(file.size) }}</div>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Metadatos adicionales -->
                                        <div class="metadata-form">
                                            <q-input 
                                                v-model="documentTitle" 
                                                label="Título del documento *" 
                                                outlined
                                                class="q-mb-md"
                                                :rules="[val => !!val || 'El título es requerido']"
                                            />
                                            <q-textarea 
                                                v-model="documentDescription" 
                                                label="Descripción (opcional)"
                                                outlined 
                                                rows="3" 
                                            />
                                        </div>
                                    </div>

                                    <!-- Progreso de subida -->
                                    <div v-if="isUploading" class="upload-progress">
                                        <div class="progress-content">
                                            <q-icon name="cloud_upload" size="2rem" color="blue-7" />
                                            <p class="progress-text">Subiendo {{ selectedFiles.length }} archivo(s)...</p>
                                            <q-linear-progress :value="uploadProgress / 100" color="blue-7" size="8px"
                                                class="q-mt-md" />
                                            <p class="progress-percentage">{{ uploadProgress }}%</p>
                                        </div>
                                    </div>

                                    <!-- Resultado de subida -->
                                    <div v-if="uploadResult" class="upload-result">
                                        <div v-if="uploadResult.success" class="success-result">
                                            <q-icon name="check_circle" size="2rem" color="green" />
                                            <p class="result-text">¡{{ uploadResult.filesUploaded }} archivo(s) subido(s) exitosamente!</p>
                                            <p class="result-details">Los documentos se han guardado en el sistema.</p>
                                        </div>
                                        <div v-else class="error-result">
                                            <q-icon name="error" size="2rem" color="red" />
                                            <p class="result-text">Error al subir archivos</p>
                                            <p class="result-details">{{ uploadResult.error }}</p>
                                        </div>
                                    </div>
                                </div>
                            </q-card-section>

                            <q-card-actions class="dialog-actions">
                                <q-btn flat label="Cancelar" color="grey-7" @click="closeDialog" />
                                <q-btn 
                                    v-if="selectedFiles.length > 0 && !isUploading && !uploadResult" 
                                    unelevated
                                    label="Subir Archivos" 
                                    color="primary" 
                                    @click="uploadFiles"
                                    :disabled="!documentTitle || selectedFiles.length === 0" 
                                />
                                <q-btn 
                                    v-if="uploadResult" 
                                    unelevated 
                                    label="Subir Otros" 
                                    color="primary"
                                    @click="resetUpload" 
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
import { ref, computed, onMounted } from 'vue'
import { getData } from '../services/apiClient.js'
import { useAuth } from '../stores/store.js'
import { useRouter } from 'vue-router'
import axios from 'axios'
import DepartmentChip from '../components/DepartmentChip.vue'

const router = useRouter()

// Función para mostrar notificaciones
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

// Estados reactivos principales
const dialog = ref(false)
const backdropFilter = ref('blur(4px) saturate(150%)')

// Estados para la subida de archivos
const selectedFiles = ref([])
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

// Configuración de columnas para la tabla
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

/**
 * Lista de botones para subir documentos
 */
const list = [
    'Subir Documento de Recursos Humanos',
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
    
    // Limpiar el input de archivo
    if (fileInput.value) {
        fileInput.value.value = ''
    }
}

/**
 * Obtiene todos los documentos de talento humano
 */
async function getDocuments() {
    try {
        loading.value = true
        console.log('📥 Obteniendo documentos de talento humano...')
        
        const response = await axios.get('http://localhost:5000/api/talento-humano')
        
        if (response.data && Array.isArray(response.data)) {
            rows.value = response.data.map(doc => ({
                ...doc,
                tieneArchivos: doc.documentos && doc.documentos.length > 0,
                cantidadArchivos: doc.documentos ? doc.documentos.length : 0,
                archivos: doc.documentos ? doc.documentos.map(archivo => ({
                    id: archivo._id,
                    nombre: archivo.originalName,
                    url: archivo.downloadURL,
                    tamaño: formatFileSize(archivo.size),
                    formato: getFileExtension(archivo.originalName),
                    fechaSubida: new Date(archivo.uploadDate).toLocaleDateString('es-ES'),
                    firebaseRef: archivo.firebaseRef,
                    mimetype: archivo.mimetype
                })) : []
            }))
            
            console.log('✅ Documentos cargados:', rows.value.length)
        } else {
            console.warn('⚠️ Estructura de respuesta inesperada')
            rows.value = []
        }
    } catch (error) {
        console.error('❌ Error al obtener documentos:', error)
        showNotification('negative', 'Error al cargar', 'No se pudieron cargar los documentos')
        rows.value = []
    } finally {
        loading.value = false
    }
}

/**
 * Recarga la lista de documentos
 */
async function loadDocuments() {
    await getDocuments()
}

/**
 * Maneja la selección de archivos
 */
function onFileSelect(event) {
    const files = Array.from(event.target.files)
    if (files.length > 0) {
        handleMultipleFileSelection(files)
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
        handleMultipleFileSelection(files)
    }
}

/**
 * Procesa múltiples archivos seleccionados
 */
function handleMultipleFileSelection(files) {
    const validFiles = []
    
    // Validar cada archivo
    for (const file of files) {
        if (!validateFileType(file)) {
            showNotification('negative', `Archivo ${file.name} no permitido`, 'Solo se permiten archivos PDF, DOC, DOCX, XLS, XLSX, JPG, PNG')
            continue
        }
        
        if (file.size > 10 * 1024 * 1024) { // 10MB
            showNotification('negative', `Archivo ${file.name} demasiado grande`, 'El tamaño máximo permitido es 10MB')
            continue
        }
        
        validFiles.push(file)
    }
    
    if (validFiles.length > 10) {
        showNotification('negative', 'Demasiados archivos', 'Solo se permiten máximo 10 archivos por subida')
        return
    }
    
    if (validFiles.length > 0) {
        selectedFiles.value = validFiles
        
        // Usar nombre del primer archivo como título por defecto
        if (!documentTitle.value && validFiles.length > 0) {
            documentTitle.value = validFiles[0].name.split('.')[0]
        }
    }
}

/**
 * Limpia los archivos seleccionados
 */
function clearFiles() {
    selectedFiles.value = []
    if (fileInput.value) {
        fileInput.value.value = ''
    }
}

/**
 * Valida el tipo de archivo
 */
function validateFileType(file) {
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/jpeg',
        'image/jpg', 
        'image/png'
    ]
    return allowedTypes.includes(file.type)
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
        
        console.log('📤 Subiendo archivos de talento humano:', {
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
            'http://localhost:5000/api/talento-humano',
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
        
        // Cerrar modal después de un breve delay
        setTimeout(() => {
            closeDialog()
        }, 1500)
        
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

/**
 * Busca documentos según el término ingresado
 */
async function searchDocuments() {
    if (!searchTerm.value) {
        await loadDocuments()
        return
    }
    
    try {
        loading.value = true
        console.log('🔍 Buscando documentos de talento humano:', searchTerm.value)
        
        // Obtener todos los documentos y filtrar localmente
        const allDocuments = await getData('/talento-humano')
        
        if (allDocuments && Array.isArray(allDocuments)) {
            const searchTermLower = searchTerm.value.toLowerCase()
            const filteredDocuments = allDocuments.filter(doc => {
                // Buscar en el título del documento
                if (doc.documento && doc.documento.toLowerCase().includes(searchTermLower)) {
                    return true
                }
                
                // Buscar en los nombres de archivos
                if (doc.documentos && doc.documentos.length > 0) {
                    return doc.documentos.some(archivo =>
                        archivo.originalName && archivo.originalName.toLowerCase().includes(searchTermLower)
                    )
                }
                
                return false
            })
            
            // Procesar los datos filtrados con el mismo formato que getDocuments
            rows.value = filteredDocuments.map(doc => ({
                ...doc,
                tieneArchivos: doc.documentos && doc.documentos.length > 0,
                cantidadArchivos: doc.documentos ? doc.documentos.length : 0,
                archivos: doc.documentos ? doc.documentos.map(archivo => ({
                    id: archivo._id,
                    nombre: archivo.originalName,
                    url: archivo.downloadURL,
                    tamaño: formatFileSize(archivo.size),
                    formato: getFileExtension(archivo.originalName),
                    fechaSubida: new Date(archivo.uploadDate).toLocaleDateString('es-ES'),
                    firebaseRef: archivo.firebaseRef,
                    mimetype: archivo.mimetype
                })) : []
            }))
        }
        
        console.log('✅ Búsqueda completada:', rows.value.length, 'resultados')
        
    } catch (error) {
        console.error('❌ Error en búsqueda:', error)
        showNotification('negative', 'Error en la búsqueda', 'No se pudo realizar la búsqueda')
    } finally {
        loading.value = false
    }
}

/**
 * Limpia la búsqueda y recarga todos los documentos
 */
async function clearSearch() {
    searchTerm.value = ''
    await loadDocuments()
}

/**
 * Ver documentos de un registro
 */
function viewDocument(document) {
    if (!document.tieneArchivos) {
        showNotification('negative', 'Sin archivos', 'Este documento no tiene archivos adjuntos')
        return
    }
    
    console.log('�️ Ver documento:', document)
    
    // Preparar los datos para el modal de vista
    selectedDocumentForView.value = {
        ...document,
        titulo: document.documento,
        fechaCreacion: new Date(document.createdAt).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }
    
    viewDocumentDialog.value = true
}

/**
 * Descarga documentos usando las URLs de Firebase Storage
 */
async function downloadDocuments(doc) {
    try {
        console.log('📥 Descargando documentos de talento humano para ID:', doc._id)
        
        if (!doc.archivos || doc.archivos.length === 0) {
            showNotification('warning', 'Sin archivos', 'No hay archivos para descargar')
            return
        }
        
        // Descargar cada archivo usando su URL directa
        doc.archivos.forEach(archivo => {
            const link = document.createElement('a')
            link.href = archivo.url
            link.download = archivo.nombre
            link.target = '_blank'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        })
        
        showNotification('positive', 'Descarga iniciada', `Se han descargado ${doc.archivos.length} archivo(s)`)
        
    } catch (error) {
        console.error('❌ Error downloading documents:', error)
        showNotification('negative', 'Error de descarga', 'No se pudieron descargar los documentos')
    }
}

/**
 * Descarga un archivo individual
 */
function downloadSingleFile(file) {
    try {
        console.log('📥 Descargando archivo individual:', file.nombre)
        
        const link = document.createElement('a')
        link.href = file.url
        link.download = file.nombre
        link.target = '_blank'
        
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        showNotification('positive', 'Descarga iniciada', `Descargando: ${file.nombre}`)
        
    } catch (error) {
        console.error('❌ Error descargando archivo:', error)
        showNotification('negative', 'Error en descarga', 'No se pudo descargar el archivo')
    }
}

/**
 * Abre un archivo en una nueva pestaña
 */
function openFileInNewTab(file) {
    try {
        console.log('🔗 Abriendo archivo en nueva pestaña:', file.nombre)
        window.open(file.url, '_blank')
    } catch (error) {
        console.error('❌ Error abriendo archivo:', error)
        showNotification('negative', 'Error', 'No se pudo abrir el archivo')
    }
}

/**
 * Eliminar documento
 */
async function deleteDocument(document) {
    const confirmMessage = `¿Estás seguro de que quieres eliminar el documento "${document.documento}"?\n\n` +
        `Este documento contiene ${document.cantidadArchivos} archivo(s).\n` +
        `Esta acción no se puede deshacer.`
    
    if (!confirm(confirmMessage)) {
        return
    }
    
    try {
        console.log('🗑️ Eliminando documento de talento humano:', document._id)
        
        loading.value = true
        
        // Hacer petición DELETE al backend
        const response = await axios.delete(`http://localhost:5000/api/talento-humano/${document._id}`)
        
        if (response.status === 200) {
            showNotification('positive', 'Documento eliminado', 'El documento y sus archivos han sido eliminados exitosamente')
            
            // Recargar la lista de documentos
            await loadDocuments()
        } else {
            throw new Error('Error en la respuesta del servidor')
        }
        
    } catch (error) {
        console.error('❌ Error eliminando documento:', error)
        const errorMessage = error.response?.data?.message || 'No se pudo eliminar el documento'
        showNotification('negative', 'Error al eliminar', errorMessage)
    } finally {
        loading.value = false
    }
}

/**
 * Obtiene los tipos únicos de archivos de un array de documentos
 */
function getUniqueFileTypes(documentos) {
    if (!documentos || documentos.length === 0) return []
    const tipos = [...new Set(documentos.map(doc => getFileExtension(doc.originalName)))]
    return tipos.filter(tipo => tipo !== 'desconocido')
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
    }
    return colorMap[tipo.toLowerCase()] || 'orange-1'
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
    }
    return colorMap[tipo.toLowerCase()] || 'orange-8'
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
    }
    return iconMap[tipo.toLowerCase()] || 'insert_drive_file'
}

/**
 * Obtiene el icono del archivo según su nombre/extensión
 */
function getFileIconByName(fileName) {
    if (!fileName) return 'insert_drive_file'
    
    const extension = fileName.split('.').pop()?.toLowerCase() || ''
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
    }
    
    return iconMap[extension] || 'insert_drive_file'
}

/**
 * Obtiene el color del icono según el formato del archivo
 */
function getFileColor(format) {
    if (!format) return 'grey-6'
    
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
    }
    
    return colorMap[format.toLowerCase()] || 'grey-6'
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
 * Maneja el logout del usuario
 */
function handleLogout() {
    const authStore = useAuth()
    authStore.logOut()
    router.push('/')
}

// Función para obtener datos cuando el componente se monta
onMounted(() => {
    getDocuments()
})
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

/* Estilos específicos para los chips de tipo de archivo */
.file-type-cell {
    text-align: center;
}

.file-type-chips {
    display: flex;
    gap: 0.25rem;
    justify-content: center;
    flex-wrap: wrap;
}

.file-type-chip {
    font-weight: 600;
    border-radius: 6px;
    height: 24px;
    font-size: 0.7rem;
}

/* Estilos para upload múltiple */
.files-preview {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.files-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background: var(--light-gray);
    border-radius: 8px;
    border: 1px solid var(--border-color);
}

.files-count {
    margin: 0;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-primary);
}

.files-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 0.5rem;
}

.file-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem;
    background: var(--white);
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.file-info {
    flex: 1;
    min-width: 0;
}

.file-name {
    font-weight: 500;
    color: var(--text-primary);
    font-size: 0.85rem;
    word-break: break-word;
    line-height: 1.3;
}

.file-size {
    color: var(--text-secondary);
    font-size: 0.75rem;
    margin-top: 0.125rem;
}

.metadata-form {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border-color);
}

/* Mejoras en los estilos existentes */
.upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 2rem;
}

.upload-text {
    font-size: 1rem;
    color: var(--text-primary);
    margin: 0;
    text-align: center;
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
    text-align: center;
    line-height: 1.4;
}

/* Estados mejorados para progress y results */
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
    text-align: center;
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