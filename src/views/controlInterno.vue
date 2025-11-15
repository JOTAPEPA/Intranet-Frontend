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
                    <q-btn flat icon="home" label="Inicio" align="left" class="menu-item active" no-caps @click="goHome" />
                    
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
                    <q-btn 
                        unelevated 
                        color="primary" 
                        label="Subir Documento"
                        @click="openDialog" 
                        icon="cloud_upload" 
                        class="upload-btn"
                    >
                        <q-tooltip>Subir documento</q-tooltip>
                    </q-btn>
                    
                    <q-btn 
                        color="secondary"
                        label="Nueva Carpeta" 
                        icon="create_new_folder"
                        @click="showCreateFolderDialog = true"
                        outline
                        no-caps
                        class="upload-btn"
                        style="margin-left: 10px;"
                    >
                        <q-tooltip>Crear nueva carpeta</q-tooltip>
                    </q-btn>
                </div>

                <!-- Navegación breadcrumb -->
                <div class="breadcrumb-navigation">
                    <div class="breadcrumb-content">
                        <q-icon name="folder" color="blue-7" size="sm" class="breadcrumb-icon" />
                        <div class="breadcrumb-path">
                            <template v-for="(crumb, index) in getBreadcrumbTrail()" :key="crumb.path">
                                <q-btn
                                    flat
                                    dense
                                    :label="crumb.name"
                                    @click="navigateToBreadcrumb(crumb.index)"
                                    :class="{ 'current-crumb': index === getBreadcrumbTrail().length - 1 }"
                                    class="breadcrumb-item"
                                />
                                <q-icon 
                                    v-if="index < getBreadcrumbTrail().length - 1" 
                                    name="keyboard_arrow_right" 
                                    color="grey-5" 
                                    size="sm"
                                    class="breadcrumb-separator"
                                />
                            </template>
                        </div>
                        <q-space />
                        <div class="breadcrumb-actions">
                            <q-btn
                                v-if="currentFolderPath.length > 0"
                                flat
                                round
                                dense
                                icon="arrow_back"
                                color="blue-7"
                                @click="navigateUp"
                                size="sm"
                            >
                                <q-tooltip>Volver atrás</q-tooltip>
                            </q-btn>
                        </div>
                    </div>
                </div>

                <!-- Data Table -->
                <div class="table-container">
                    <q-table
                        :rows="getCurrentFolderItems()"
                        :columns="folderColumns"
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
                                    <h5 class="table-title">Documentos de Control Interno</h5>
                                </div>
                                 <DepartmentChip 
                                        department-key="control-interno" 
                                        variant="table"
                                        size="sm"
                                        dense
                                    />
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
                            <q-tr 
                                :props="props" 
                                class="table-row"
                                :draggable="props.row.itemType === 'document'"
                                @dragstart="onDragStart($event, props.row)"
                                @dragover="props.row.itemType === 'folder' ? onDragOver($event, props.row.path) : null"
                                @dragleave="props.row.itemType === 'folder' ? onDragLeave(props.row.path) : null"
                                @drop="props.row.itemType === 'folder' ? onDrop($event, props.row.path) : null"
                                :class="{ 
                                    'drag-over': dragOverFolder === props.row.path,
                                    'draggable-document': props.row.itemType === 'document'
                                }"
                            >
                                <q-td
                                    v-for="col in props.cols"
                                    :key="col.name"
                                    :props="props"
                                    class="table-cell"
                                >
                                    <!-- Acciones -->
                                    <div v-if="col.name === 'acciones'" class="action-buttons-cell">
                                        <!-- Acciones para carpetas -->
                                        <template v-if="props.row.itemType === 'folder'">
                                            <q-btn
                                                flat
                                                round
                                                color="blue-7"
                                                icon="folder_open"
                                                size="sm"
                                                @click="navigateToFolder(props.row.path)"
                                                class="action-btn-small"
                                            >
                                                <q-tooltip>Abrir carpeta</q-tooltip>
                                            </q-btn>
                                            
                                            <q-btn
                                                flat
                                                round
                                                color="red-7"
                                                icon="delete"
                                                size="sm"
                                                @click="deleteFolder(props.row.path)"
                                                :disabled="props.row.path === '/'"
                                                class="action-btn-small"
                                            >
                                                <q-tooltip>Eliminar carpeta</q-tooltip>
                                            </q-btn>
                                        </template>
                                        
                                        <!-- Acciones para documentos -->
                                        <template v-else>
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
                                                color="orange-7"
                                                icon="drive_file_move"
                                                size="sm"
                                                @click="startMoveDocument(props.row)"
                                                class="action-btn-small"
                                            >
                                                <q-tooltip>Mover a otra carpeta</q-tooltip>
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
                                        </template>
                                    </div>
                                    
                                    <!-- Celda de nombre -->
                                    <div v-else-if="col.name === 'nombre'" class="item-name-cell">
                                        <div class="item-info">
                                            <q-icon 
                                                :name="props.row.itemType === 'folder' ? 'folder' : (props.row.tieneArchivos ? 'description' : 'description')"
                                                :color="props.row.itemType === 'folder' ? 'blue-7' : (props.row.tieneArchivos ? 'green-7' : 'grey-5')"
                                                size="sm"
                                                class="item-icon"
                                            />
                                            <div class="item-details">
                                                <span 
                                                    class="item-name clickable-item"
                                                    @click="props.row.itemType === 'folder' ? navigateToFolder(props.row.path) : viewDocument(props.row)"
                                                >
                                                    {{ props.row.itemType === 'folder' ? props.row.name : props.row.documento }}
                                                </span>
                                                <span v-if="props.row.itemType === 'document' && props.row.tieneArchivos" class="item-files-count">
                                                    {{ props.row.cantidadArchivos }} archivo(s)
                                                </span>
                                                <span v-else-if="props.row.itemType === 'document'" class="no-files-text">Sin archivos</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- Chip de tipo -->
                                    <div v-else-if="col.name === 'tipo'" class="item-type-cell">
                                        <!-- Chip para carpetas -->
                                        <q-chip 
                                            v-if="props.row.itemType === 'folder'"
                                            color="blue-1" 
                                            text-color="blue-8"
                                            icon="folder"
                                            size="sm"
                                        >
                                            Carpeta
                                        </q-chip>
                                        
                                        <!-- Chips para tipos de archivos del documento -->
                                        <div v-else class="file-types-container">
                                            <template v-if="props.row.tieneArchivos && props.row.documentos">
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
                                            </template>
                                            <q-chip 
                                                v-else 
                                                color="grey-3" 
                                                text-color="grey-6" 
                                                icon="remove" 
                                                size="sm"
                                            >
                                                Sin archivos
                                            </q-chip>
                                        </div>
                                    </div>
                                    
                                    <!-- Contenido genérico para otras celdas -->
                                    <span v-else class="cell-content">
                                        {{ col.value }}
                                    </span>
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
                        <q-card class="dialog-card upload-modal">
                            <q-card-section class="dialog-header">
                                <div class="dialog-title">
                                    <q-icon name="cloud_upload" size="1.5rem" />
                                    <h6>Subir Documento de Control Interno</h6>
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

                            </q-card-actions>
                        </q-card>
                    </q-dialog>

                    <!-- Modal para crear nueva carpeta -->
                    <q-dialog v-model="showCreateFolderDialog" class="create-folder-dialog">
                        <q-card class="dialog-card" style="min-width: 400px;">
                            <q-card-section class="dialog-header">
                                <div class="dialog-title">
                                    <q-icon name="create_new_folder" size="1.5rem" />
                                    <h6>Crear Nueva Carpeta</h6>
                                </div>
                                <q-btn flat round dense icon="close" color="white" v-close-popup />
                            </q-card-section>

                            <q-card-section class="dialog-content">
                                <div class="folder-creation-form">
                                    <div class="current-location">
                                        <q-icon name="folder" color="blue-7" size="sm" />
                                        <span class="location-text">Ubicación actual:</span>
                                        <span class="location-path">{{ getCurrentPathString() === '/' ? 'Documentos (Raíz)' : getCurrentPathString() }}</span>
                                    </div>
                                    
                                    <q-input 
                                        v-model="newFolderName"
                                        label="Nombre de la carpeta"
                                        outlined
                                        dense
                                        autofocus
                                        :rules="folderNameRules"
                                        @keyup.enter="confirmCreateFolder"
                                    >
                                        <template v-slot:prepend>
                                            <q-icon name="folder" color="blue-7" />
                                        </template>
                                    </q-input>
                                    
                                    <div class="creation-hint">
                                        <q-icon name="info" color="blue-7" size="sm" />
                                        <span>La carpeta se creará en la ubicación actual</span>
                                    </div>
                                </div>
                            </q-card-section>

                            <q-card-actions class="dialog-actions">
                                <q-btn 
                                    flat 
                                    label="Cancelar" 
                                    color="grey-7" 
                                    v-close-popup
                                    @click="newFolderName = ''"
                                />
                                <q-btn 
                                    unelevated 
                                    label="Crear Carpeta" 
                                    color="primary" 
                                    @click="confirmCreateFolder"
                                    :disabled="!newFolderName || newFolderName.trim() === ''"
                                    icon="create_new_folder"
                                />
                            </q-card-actions>
                        </q-card>
                    </q-dialog>

                    <!-- Modal para mover documentos -->
                    <q-dialog v-model="showMoveItemsDialog" class="move-items-dialog">
                        <q-card class="dialog-card" style="min-width: 500px;">
                            <q-card-section class="dialog-header">
                                <div class="dialog-title">
                                    <q-icon name="drive_file_move" size="1.5rem" />
                                    <h6>Mover Documento</h6>
                                </div>
                                <q-btn flat round dense icon="close" color="white" v-close-popup />
                            </q-card-section>

                            <q-card-section class="dialog-content" v-if="selectedDocumentToMove">
                                <div class="move-document-form">
                                    <div class="document-info">
                                        <q-icon name="description" color="green-7" size="sm" />
                                        <span class="document-name">{{ selectedDocumentToMove.documento }}</span>
                                    </div>
                                    
                                    <div class="destination-selection">
                                        <q-select
                                            v-model="selectedDestinationFolder"
                                            :options="getAvailableFolders()"
                                            label="Seleccionar carpeta destino"
                                            outlined
                                            dense
                                            option-label="label"
                                            option-value="value"
                                            emit-value
                                            map-options
                                        >
                                            <template v-slot:prepend>
                                                <q-icon name="folder" color="blue-7" />
                                            </template>
                                        </q-select>
                                    </div>
                                    
                                    <div class="move-hint">
                                        <q-icon name="info" color="blue-7" size="sm" />
                                        <span>El documento se moverá a la carpeta seleccionada</span>
                                    </div>
                                </div>
                            </q-card-section>

                            <q-card-actions class="dialog-actions">
                                <q-btn 
                                    flat 
                                    label="Cancelar" 
                                    color="grey-7" 
                                    v-close-popup
                                />
                                <q-btn 
                                    unelevated 
                                    label="Mover Documento" 
                                    color="primary" 
                                    @click="confirmMoveDocument"
                                    :disabled="!selectedDestinationFolder"
                                    icon="drive_file_move"
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
const loading = ref(false)

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

// Estados para búsqueda
const searchTerm = ref('')

// ===== ESTADOS DEL ADMINISTRADOR DE CARPETAS =====
// Estructura de carpetas para el sistema
const folderStructure = ref({})
// Ruta actual de navegación (array de nombres de carpeta)
const currentFolderPath = ref([])
// Modal para crear nueva carpeta
const showCreateFolderDialog = ref(false)
const newFolderName = ref('')
// Modal para mover documentos
const showMoveItemsDialog = ref(false)
const selectedDocument = ref(null)
const selectedDocumentToMove = ref(null)
const selectedDestinationFolder = ref(null)
const targetFolderPath = ref('')
// Estados para drag & drop
const dragOverFolder = ref('')
// Selector de carpeta para upload
const selectedUploadFolder = ref('/')

// Columnas para vista de carpetas
const folderColumns = ref([
    {
        name: "nombre",
        align: "left",
        label: "Nombre",
        field: row => row.itemType === 'folder' ? row.name : row.documento,
        sortable: true,
    },
    {
        name: "tipo",
        align: "center",
        label: "Tipo",
        field: row => row.itemType === 'folder' ? 'Carpeta' : 'Documento',
        sortable: true,
    },
    {
        name: "fechaCreacion",
        align: "center",
        label: "Fecha",
        field: row => row.itemType === 'folder' ? '-' : row.createdAt,
        sortable: true,
        format: (val) => {
            if (!val || val === '-') return '-';
            return new Date(val).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        }
    },
    {
        name: "acciones",
        align: "center",
        label: "Acciones",
        field: "",
        sortable: false,
    }
])

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

async function goHome () {
    await router.push("/home")
 
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
 * Activa la selección de archivos programáticamente
 */
function triggerFileSelection() {
    if (fileInput.value) {
        isAddingMoreFiles.value = true
        fileInput.value.click()
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
        handleFilesSelection(files, false)
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
        documentTitle.value = `${selectedFiles.value.length} documentos seleccionados`
    }
}

/**
 * Permite añadir más archivos a la selección actual
 */
function addMoreFiles() {
    if (fileInput.value) {
        fileInput.value.click()
    }
}

/**
 * Añade archivos a la selección existente
 */
function addFilesToSelection(files) {
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
    
    const validFiles = []
    const maxSize = 10 * 1024 * 1024 // 10MB
    
    for (const file of files) {
        // Verificar si ya está seleccionado
        const alreadySelected = selectedFiles.value.some(existingFile => 
            existingFile.name === file.name && existingFile.size === file.size
        )
        
        if (alreadySelected) {
            showNotification('warning', `Archivo duplicado: ${file.name}`, 'Este archivo ya está seleccionado')
            continue
        }
        
        // Verificar límite total
        if (selectedFiles.value.length + validFiles.length >= 10) {
            showNotification('negative', 'Límite alcanzado', 'Solo se permiten 10 archivos máximo')
            break
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
        
        validFiles.push(file)
    }
    
    if (validFiles.length > 0) {
        selectedFiles.value.push(...validFiles)
        
        // Actualizar título
        if (selectedFiles.value.length === 1) {
            documentTitle.value = selectedFiles.value[0].name.replace(/\.[^/.]+$/, "")
        } else {
            documentTitle.value = `Lote de ${selectedFiles.value.length} archivos`
        }
        
        showNotification('positive', 'Archivos añadidos', `Se añadieron ${validFiles.length} archivo(s) a la selección`)
    }
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
        
        const totalFiles = selectedFiles.value.length
        let uploadedFiles = 0
        let successfulUploads = 0
        let failedUploads = []
        
        console.log('📤 Subiendo archivos individuales a control interno:', {
            cantidad: totalFiles,
            archivos: selectedFiles.value.map(file => ({
                nombre: file.name,
                tipo: file.type,
                tamaño: file.size
            }))
        })
        
        // Subir cada archivo individualmente
        for (const [index, file] of selectedFiles.value.entries()) {
            try {
                const formData = new FormData()
                
                // Generar título individual para cada archivo - solo el nombre del archivo sin extensión
                const individualTitle = file.name.replace(/\.[^/.]+$/, "")
                
                formData.append('documento', individualTitle)
                formData.append('documentos', file)
                
                console.log(`📄 Subiendo archivo ${index + 1}/${totalFiles}:`, file.name)
                
                // Subir el archivo individual
                const response = await axios.post(
                    '/control-interno',
                    formData,
                    {
                        baseURL: 'http://localhost:5000/api',
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        }
                    }
                )
                
                console.log(`✅ Archivo ${index + 1} subido exitosamente:`, response.data)
                successfulUploads++
                
            } catch (error) {
                console.error(`❌ Error al subir archivo ${index + 1}:`, error)
                failedUploads.push({
                    fileName: file.name,
                    error: error.response?.data?.message || error.message || 'Error desconocido'
                })
            }
            
            uploadedFiles++
            // Actualizar progreso
            uploadProgress.value = Math.round((uploadedFiles / totalFiles) * 100)
            
            // Pequeña pausa entre archivos para evitar sobrecargar el servidor
            if (index < selectedFiles.value.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 500))
            }
        }
        
        // Mostrar resultados
        if (failedUploads.length === 0) {
            // Todos los archivos se subieron exitosamente
            uploadResult.value = {
                success: true,
                data: { uploadedFiles: successfulUploads },
                filesUploaded: successfulUploads
            }
            

        } else if (successfulUploads > 0) {
            // Algunos archivos fallaron
            uploadResult.value = {
                success: true,
                data: { uploadedFiles: successfulUploads, failedFiles: failedUploads.length },
                filesUploaded: successfulUploads,
                partialSuccess: true
            }
            
            const failedFileNames = failedUploads.map(f => f.fileName).join(', ')
            showNotification('negative', 
                `${successfulUploads} archivos subidos, ${failedUploads.length} fallaron`, 
                `Archivos fallidos: ${failedFileNames}`)
                
        } else {
            // Todos los archivos fallaron
            uploadResult.value = {
                success: false,
                error: `No se pudo subir ningún archivo. Errores: ${failedUploads.map(f => `${f.fileName}: ${f.error}`).join('; ')}`
            }
            
            showNotification('negative', 'Error al subir archivos', 'No se pudo subir ningún archivo')
        }
        
        // Recargar la lista de documentos
        await loadDocuments()
        
    } catch (error) {
        console.error('❌ Error general al subir archivos:', error)
        
        uploadResult.value = {
            success: false,
            error: error.message || 'Error desconocido'
        }
        
        showNotification('negative', 'Error al subir archivos', error.message || 'Error desconocido')
    } finally {
        isUploading.value = false
        await getDocuments()
    }
}

/**
 * Obtiene la extensión del archivo
 */
function getFileExtension(fileName) {
    return fileName.split('.').pop().toLowerCase()
}

/**
 * Obtiene el color para el tipo de archivo
 */
function getFileTypeColor(fileName) {
    const extension = getFileExtension(fileName)
    
    switch (extension) {
        case 'pdf':
            return 'red-5'
        case 'doc':
        case 'docx':
            return 'blue-5'
        case 'xls':
        case 'xlsx':
        case 'csv':
            return 'green-5'
        case 'ppt':
        case 'pptx':
            return 'orange-5'
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'svg':
        case 'webp':
            return 'purple-5'
        case 'txt':
            return 'grey-6'
        case 'zip':
        case 'rar':
        case '7z':
            return 'brown-5'
        case 'mp4':
        case 'avi':
        case 'mov':
            return 'red-6'
        case 'mp3':
        case 'wav':
            return 'pink-5'
        default:
            return 'grey-5'
    }
}

/**
 * Obtiene el color del texto para el tipo de archivo
 */
function getFileTypeTextColor(fileName) {
    return 'white'
}

/**
 * Obtiene el icono según el tipo de archivo (función legacy)
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
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

/**
 * Obtiene el icono de un tipo de archivo basado en su nombre
 */
function getFileTypeIcon(fileName) {
    const extension = getFileExtension(fileName);
    const iconMap = {
        'pdf': 'picture_as_pdf',
        'doc': 'description',
        'docx': 'description',
        'xls': 'table_chart',
        'xlsx': 'table_chart',
        'ppt': 'slideshow',
        'pptx': 'slideshow',
        'jpg': 'image',
        'jpeg': 'image',
        'png': 'image',
        'gif': 'image',
        'svg': 'image',
        'webp': 'image',
        'txt': 'description',
        'csv': 'table_chart',
        'zip': 'archive',
        'rar': 'archive',
        '7z': 'archive',
        'mp4': 'movie',
        'avi': 'movie',
        'mov': 'movie',
        'mp3': 'music_note',
        'wav': 'music_note'
    };
    return iconMap[extension] || 'description';
}

/**
 * Descarga documentos como archivo ZIP
 */
async function downloadDocumentsSimple(documents) {
    try {
        if (!documents || documents.length === 0) {
            showNotification('negative', 'Sin documentos', 'No hay documentos para descargar')
            return
        }

        const documentData = documents[0] // Por ahora solo manejamos un documento
        
        if (!documentData.archivos || documentData.archivos.length === 0) {
            showNotification('negative', 'Sin archivos', 'Este documento no tiene archivos para descargar')
            return
        }

        // Descargar cada archivo individualmente
        for (let i = 0; i < documentData.archivos.length; i++) {
            const archivo = documentData.archivos[i]
            
            try {
                let downloadUrl = ''
                let fileName = archivo.nombre || archivo.originalName || `archivo_${i + 1}`
                
                // Opción 1: Si ya tenemos la URL directa de Firebase, usarla
                if (archivo.url) {
                    downloadUrl = archivo.url
                } else {
                    // Opción 2: Obtener la URL del endpoint del backend
                    const endpointUrl = `http://localhost:5000/api/control-interno/${documentData._id}/file/${i}/download`
                    
                    try {
                        const response = await fetch(endpointUrl)
                        if (response.ok) {
                            const data = await response.json()
                            if (data.downloadURL) {
                                downloadUrl = data.downloadURL
                                if (data.fileName) {
                                    fileName = data.fileName
                                }
                            } else {
                                throw new Error('No se obtuvo la URL de descarga')
                            }
                        } else {
                            throw new Error(`Error ${response.status}: ${response.statusText}`)
                        }
                    } catch (fetchError) {
                        console.error(`Error obteniendo URL de descarga:`, fetchError)
                        throw fetchError
                    }
                }
                
                if (downloadUrl) {
                    // Crear enlace temporal para descarga usando la URL directa de Firebase
                    const link = document.createElement('a')
                    link.href = downloadUrl
                    link.download = fileName
                    link.target = '_blank'
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                    
                    console.log(`✅ Descargando: ${fileName} desde ${downloadUrl}`)
                } else {
                    throw new Error('No se pudo obtener la URL de descarga')
                }
                
                // Pequeña pausa entre descargas
                if (i < documentData.archivos.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000))
                }
                
            } catch (error) {
                console.error(`Error descargando archivo ${i}:`, error)
                showNotification('negative', `Error descargando ${archivo.nombre || `archivo_${i + 1}`}`, error.message || 'Verificar conexión con el servidor')
            }
        }
        

    } catch (error) {
        console.error('Error al descargar documentos:', error)
        showNotification('negative', 'Error de descarga', 'No se pudieron descargar los documentos')
    }
}

/**
 * Elimina un documento
 */
async function deleteDocument(doc) {
    // Mostrar confirmación con información del documento
    const confirmMessage = `¿Estás seguro de que quieres eliminar el documento "${doc.documento}"?

📄 Documento: ${doc.documento}
📁 Archivos: ${doc.cantidadArchivos || 0} archivo(s)
📅 Creado: ${new Date(doc.createdAt).toLocaleDateString('es-ES')}

⚠️ Esta acción no se puede deshacer y eliminará todos los archivos asociados.`

    if (!confirm(confirmMessage)) {
        return
    }

    try {
        loading.value = true
        
        // Usar el endpoint correcto: DELETE /api/control-interno/:id
        const response = await deleteData(`/control-interno/${doc._id}`)
        
        if (response && (response.success !== false)) {
            showNotification('positive', 'Documento eliminado', 'El documento y todos sus archivos han sido eliminados correctamente')
            await getDocuments() // Recargar la lista
        } else {
            showNotification('negative', 'Error al eliminar', response.message || 'No se pudo eliminar el documento')
        }
    } catch (error) {
        console.error('Error al eliminar documento:', error)
        
        let errorMessage = 'No se pudo eliminar el documento'
        if (error.response?.data?.message) {
            errorMessage = error.response.data.message
        } else if (error.message) {
            errorMessage = error.message
        }
        
        showNotification('negative', 'Error al eliminar', errorMessage)
    } finally {
        loading.value = false
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
        const searchTermLower = searchTerm.value.toLowerCase()
        const allDocuments = await getData('/control-interno')
        
        if (allDocuments && Array.isArray(allDocuments)) {
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
            
            // Procesar los datos filtrados con la misma lógica que getDocuments
            rows.value = filteredDocuments.map(doc => ({
                ...doc,
                tieneArchivos: doc.documentos && doc.documentos.length > 0,
                cantidadArchivos: doc.documentos ? doc.documentos.length : 0,
                tiposArchivos: doc.documentos ? doc.documentos.map(archivo => archivo.originalName) : [],
                archivos: doc.documentos ? doc.documentos.map((archivo, index) => ({
                    id: archivo._id,
                    nombre: archivo.originalName,
                    url: archivo.downloadURL || archivo.url,
                    tamaño: formatFileSize(archivo.size || 0),
                    formato: getFileExtension(archivo.originalName),
                    fechaSubida: new Date(archivo.uploadDate || archivo.createdAt || doc.createdAt).toLocaleDateString('es-ES'),
                    public_id: archivo.firebaseRef || archivo.public_id,
                    fileIndex: index
                })) : []
            }))
        }
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
    searchTerm.value = '';
    await loadDocuments();
}

/**
 * Descarga un archivo individual
 */
async function downloadSingleFile(file) {
    try {
        let downloadUrl = ''
        let fileName = file.nombre || file.originalName || 'archivo'
        
        // Si el archivo tiene URL directa de Firebase, usarla
        if (file.url) {
            downloadUrl = file.url
        } else if (file.downloadURL) {
            downloadUrl = file.downloadURL
        } else {
            showNotification('negative', 'Error de descarga', 'URL de descarga no disponible')
            return
        }
        
        // Crear enlace temporal para descarga
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = fileName
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        showNotification('positive', 'Descarga iniciada', `Descargando: ${fileName}`)
        
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
 * Obtiene el color del icono según la extensión del archivo
 */
function getFileColorByExtension(extension) {
    const colorMap = {
        'pdf': 'red-6',
        'doc': 'blue-6',
        'docx': 'blue-6',
        'xls': 'green-6',
        'xlsx': 'green-6',
        'jpg': 'purple-6',
        'jpeg': 'purple-6',
        'png': 'purple-6',
        'txt': 'grey-6'
    };
    return colorMap[extension?.toLowerCase()] || 'orange-6';
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
function viewDocument(documentData) {
    if (!documentData.tieneArchivos) {
        showNotification('negative', 'Sin archivos', 'Este documento no tiene archivos adjuntos');
        return;
    }
    selectedDocumentForView.value = {
        ...documentData,
        titulo: documentData.documento,
        fechaCreacion: new Date(documentData.createdAt).toLocaleDateString('es-ES', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        })
    };
    viewDocumentDialog.value = true;
}

// ===== FUNCIONES DEL ADMINISTRADOR DE CARPETAS =====

/**
 * Inicializar estructura de carpetas
 */
function initializeFolderStructure() {
    const saved = localStorage.getItem('control-interno-folder-structure')
    if (saved) {
        try {
            folderStructure.value = JSON.parse(saved)
        } catch (error) {
            console.error('Error parsing folder structure:', error)
            folderStructure.value = {}
        }
    } else {
        folderStructure.value = {}
    }
}

/**
 * Guardar estructura de carpetas en localStorage
 */
function saveFolderStructure() {
    try {
        localStorage.setItem('control-interno-folder-structure', JSON.stringify(folderStructure.value))
    } catch (error) {
        console.error('Error saving folder structure:', error)
    }
}

/**
 * Obtener carpeta actual
 */
function getCurrentFolder() {
    if (currentFolderPath.value.length === 0) {
        return folderStructure.value['/'] || null
    }
    
    let current = folderStructure.value['/']
    if (!current) return null
    
    for (const folderName of currentFolderPath.value) {
        if (current.children && current.children[folderName]) {
            current = current.children[folderName]
        } else {
            return null
        }
    }
    
    return current
}

/**
 * Obtener elementos de la carpeta actual (carpetas + documentos)
 */
function getCurrentFolderItems() {
    const items = []
    
    // Obtener carpetas de la carpeta actual
    const currentFolder = getCurrentFolder()
    if (currentFolder && currentFolder.children) {
        Object.entries(currentFolder.children).forEach(([name, folder]) => {
            items.push({
                itemType: 'folder',
                name: name,
                path: getCurrentPath() + name + '/',
                icon: 'folder',
                index: `folder-${name}`
            })
        })
    }
    
    // Obtener documentos asignados a la carpeta actual
    const currentPath = getCurrentPath()
    const documentsInFolder = rows.value.filter(doc => {
        const docPath = doc.folderPath || '/'
        return docPath === currentPath
    })
    
    documentsInFolder.forEach((doc, index) => {
        items.push({
            ...doc,
            itemType: 'document',
            index: `doc-${doc._id || index}`
        })
    })
    
    return items
}

/**
 * Obtener ruta actual como string
 */
function getCurrentPath() {
    if (currentFolderPath.value.length === 0) return '/'
    return '/' + currentFolderPath.value.join('/') + '/'
}

/**
 * Obtener ruta actual como string para mostrar
 */
function getCurrentPathString() {
    if (currentFolderPath.value.length === 0) return '/'
    return '/' + currentFolderPath.value.join('/')
}

/**
 * Navegar a una carpeta
 */
function navigateToFolder(folderPath) {
    if (folderPath === '/') {
        currentFolderPath.value = []
    } else {
        // Remover las barras y dividir el path
        const pathParts = folderPath.replace(/^\/+|\/+$/g, '').split('/')
        currentFolderPath.value = pathParts.filter(part => part !== '')
    }
}

/**
 * Navegar hacia arriba un nivel
 */
function navigateUp() {
    if (currentFolderPath.value.length > 0) {
        currentFolderPath.value = currentFolderPath.value.slice(0, -1)
    }
}

/**
 * Navegar a una ruta específica desde breadcrumb
 */
function navigateToBreadcrumb(index) {
    currentFolderPath.value = currentFolderPath.value.slice(0, index + 1)
}

/**
 * Obtener breadcrumb trail para navegación
 */
function getBreadcrumbTrail() {
    const trail = [{ name: 'Documentos', path: '/', index: -1 }]
    
    currentFolderPath.value.forEach((folder, index) => {
        const path = '/' + currentFolderPath.value.slice(0, index + 1).join('/') + '/'
        trail.push({
            name: folder,
            path: path,
            index: index
        })
    })
    
    return trail
}

/**
 * Crear nueva carpeta
 */
function createFolder(name, parentPath = null) {
    if (!name || name.trim() === '') {
        showNotification('negative', 'Error', 'El nombre de la carpeta es requerido')
        return false
    }
    
    const folderName = name.trim()
    const targetPath = parentPath || getCurrentPath()
    
    // Asegurar que la estructura de carpetas existe
    if (!folderStructure.value['/']) {
        folderStructure.value['/'] = { children: {} }
    }
    
    // Navegar a la carpeta padre
    let targetFolder = folderStructure.value['/']
    
    if (targetPath !== '/') {
        const pathParts = targetPath.replace(/^\/+|\/+$/g, '').split('/')
        for (const part of pathParts) {
            if (part && targetFolder.children && targetFolder.children[part]) {
                targetFolder = targetFolder.children[part]
            } else {
                showNotification('negative', 'Error', 'La carpeta padre no existe')
                return false
            }
        }
    }
    
    // Verificar si la carpeta ya existe
    if (!targetFolder.children) {
        targetFolder.children = {}
    }
    
    if (targetFolder.children[folderName]) {
        showNotification('negative', 'Error', 'Ya existe una carpeta con ese nombre')
        return false
    }
    
    // Crear la carpeta
    targetFolder.children[folderName] = {
        children: {}
    }
    
    saveFolderStructure()
    showNotification('positive', 'Carpeta creada', `La carpeta "${folderName}" ha sido creada exitosamente`)
    return true
}

/**
 * Confirmar creación de carpeta desde modal
 */
function confirmCreateFolder() {
    if (!newFolderName.value || newFolderName.value.trim() === '') {
        showNotification('negative', 'Error', 'Por favor ingresa un nombre para la carpeta')
        return
    }
    
    if (createFolder(newFolderName.value)) {
        showCreateFolderDialog.value = false
        newFolderName.value = ''
    }
}

/**
 * Eliminar carpeta
 */
function deleteFolder(folderPath) {
    if (folderPath === '/') {
        showNotification('negative', 'Error', 'No se puede eliminar la carpeta raíz')
        return
    }
    
    if (!confirm('¿Estás seguro de que deseas eliminar esta carpeta? Esta acción no se puede deshacer.')) {
        return
    }
    
    const pathParts = folderPath.replace(/^\/+|\/+$/g, '').split('/')
    const folderName = pathParts.pop()
    
    let parentFolder = folderStructure.value['/']
    
    // Navegar a la carpeta padre
    for (const part of pathParts) {
        if (parentFolder.children && parentFolder.children[part]) {
            parentFolder = parentFolder.children[part]
        } else {
            showNotification('negative', 'Error', 'No se encontró la carpeta a eliminar')
            return
        }
    }
    
    if (parentFolder.children && parentFolder.children[folderName]) {
        delete parentFolder.children[folderName]
        saveFolderStructure()
        showNotification('positive', 'Carpeta eliminada', `La carpeta "${folderName}" ha sido eliminada`)
        
        // Si estamos dentro de la carpeta eliminada, navegar al padre
        if (getCurrentPath().includes(folderPath)) {
            navigateToFolder('/' + pathParts.join('/'))
        }
    } else {
        showNotification('negative', 'Error', 'No se encontró la carpeta a eliminar')
    }
}

/**
 * Obtener todas las carpetas para el selector
 */
function getAllFolders() {
    const folders = []
    
    function addFoldersRecursively(folderObj, currentPath) {
        if (folderObj.children) {
            Object.keys(folderObj.children).forEach(folderName => {
                const folderPath = currentPath === '/' ? `/${folderName}` : `${currentPath}/${folderName}`
                folders.push({
                    name: folderName,
                    path: folderPath + '/',
                    fullName: folderPath === '/Documentos' ? 'Documentos (Raíz)' : folderPath
                })
                addFoldersRecursively(folderObj.children[folderName], folderPath)
            })
        }
    }
    
    // Agregar carpeta raíz
    folders.push({
        name: 'Documentos',
        path: '/',
        fullName: 'Documentos (Raíz)'
    })
    
    if (folderStructure.value['/']) {
        addFoldersRecursively(folderStructure.value['/'], '')
    }
    
    return folders
}

/**
 * Iniciar proceso de mover documento
 */
function startMoveDocument(document) {
    selectedDocumentToMove.value = document
    selectedDestinationFolder.value = null
    showMoveItemsDialog.value = true
}

/**
 * Cancelar movimiento de documento
 */
function cancelMoveDocument() {
    selectedDocumentToMove.value = null
    selectedDestinationFolder.value = null
}

/**
 * Confirmar movimiento de documento
 */
async function confirmMoveDocument() {
    if (selectedDocumentToMove.value && selectedDestinationFolder.value) {
        moveDocumentToFolder(selectedDocumentToMove.value._id, selectedDestinationFolder.value)
        showMoveItemsDialog.value = false
        selectedDocumentToMove.value = null
        selectedDestinationFolder.value = null
    }
}

/**
 * Obtener carpetas disponibles para el desplegable
 */
function getAvailableFolders() {
    const folders = []
    
    // Agregar carpeta raíz
    folders.push({
        label: 'Documentos (Raíz)',
        value: '/',
        path: '/'
    })
    
    // Función recursiva para obtener todas las carpetas
    function addFoldersRecursively(folderObj, currentPath) {
        if (folderObj.children) {
            Object.keys(folderObj.children).forEach(folderName => {
                const folderPath = currentPath === '/' ? `/${folderName}` : `${currentPath}/${folderName}`
                folders.push({
                    label: folderPath.substring(1) || folderName, // Remover la primera barra
                    value: folderPath + '/',
                    path: folderPath + '/'
                })
                addFoldersRecursively(folderObj.children[folderName], folderPath)
            })
        }
    }
    
    if (folderStructure.value['/']) {
        addFoldersRecursively(folderStructure.value['/'], '')
    }
    
    return folders.sort((a, b) => a.path.localeCompare(b.path))
}

/**
 * Mover documento a carpeta específica
 */
function moveDocumentToFolder(documentId, targetFolderPath) {
    try {
        // Encontrar y actualizar el documento
        const docIndex = rows.value.findIndex(doc => doc._id === documentId)
        if (docIndex !== -1) {
            rows.value[docIndex].folderPath = targetFolderPath
            showNotification('positive', 'Documento movido', `Documento movido exitosamente`)
        } else {
            showNotification('negative', 'Error', 'No se encontró el documento')
        }
    } catch (error) {
        console.error('Error moving document:', error)
        showNotification('negative', 'Error', 'No se pudo mover el documento')
    }
}

/**
 * Mover documento a carpeta (función legacy - mantenida por compatibilidad)
 */
async function moveDocument() {
    if (!selectedDocument.value || !targetFolderPath.value) {
        showNotification('negative', 'Error', 'Faltan datos para mover el documento')
        return
    }
    
    try {
        // Aquí podrías hacer una llamada al backend para actualizar la carpeta del documento
        // Por ahora, lo actualizamos localmente
        const docIndex = rows.value.findIndex(doc => doc._id === selectedDocument.value._id)
        if (docIndex !== -1) {
            rows.value[docIndex].folderPath = targetFolderPath.value
        }
        
        showNotification('positive', 'Documento movido', 'El documento ha sido movido exitosamente')
        showMoveItemsDialog.value = false
        selectedDocument.value = null
        targetFolderPath.value = ''
    } catch (error) {
        console.error('Error moving document:', error)
        showNotification('negative', 'Error', 'No se pudo mover el documento')
    }
}

/**
 * Drag and drop handlers
 */
function onDragStart(event, document) {
    if (document.itemType !== 'document') return
    event.dataTransfer.setData('text/plain', JSON.stringify(document))
}

function onDragOver(event, folderPath) {
    event.preventDefault()
    dragOverFolder.value = folderPath
}

function onDragLeave(folderPath) {
    if (dragOverFolder.value === folderPath) {
        dragOverFolder.value = ''
    }
}

function onDrop(event, folderPath) {
    event.preventDefault()
    dragOverFolder.value = ''
    
    try {
        const documentData = JSON.parse(event.dataTransfer.getData('text/plain'))
        if (documentData.itemType === 'document') {
            // Mover documento a la carpeta
            const docIndex = rows.value.findIndex(doc => doc._id === documentData._id)
            if (docIndex !== -1) {
                rows.value[docIndex].folderPath = folderPath
                showNotification('positive', 'Documento movido', `Documento movido a ${folderPath}`)
            }
        }
    } catch (error) {
        console.error('Error in drop:', error)
        showNotification('negative', 'Error', 'No se pudo mover el documento')
    }
}

/**
 * Reglas de validación para nombres de carpetas
 */
const folderNameRules = [
    v => !!v || 'El nombre es requerido',
    v => (v && v.length >= 2) || 'Mínimo 2 caracteres',
    v => (v && v.length <= 50) || 'Máximo 50 caracteres',
    v => (v && !/[<>:"/\\|?*]/.test(v)) || 'Contiene caracteres no válidos'
]

/**
 * Obtener tipos únicos de archivos de documentos
 */
function getUniqueFileTypes(documentos) {
    if (!documentos || documentos.length === 0) return []
    const tipos = documentos.map(doc => getFileExtension(doc.originalName))
    return [...new Set(tipos)].filter(tipo => tipo !== 'desconocido')
}

// Inicializar estructura de carpetas al montar el componente

/**
 * Descargar documentos de un registro
 */
async function downloadDocuments(documentData) {
    if (!documentData.tieneArchivos) {
        showNotification('negative', 'Sin archivos', 'Este documento no tiene archivos para descargar');
        return;
    }
    await downloadDocumentsSimple([documentData]);
}

// deleteDocument ya está implementado más arriba

async function getDocuments() {
    try {
        loading.value = true
        const response = await getData('/control-interno')
        
        if (response && Array.isArray(response)) {
            // Procesar los datos para añadir propiedades calculadas
            rows.value = response.map(doc => ({
                ...doc,
                tieneArchivos: doc.documentos && doc.documentos.length > 0,
                cantidadArchivos: doc.documentos ? doc.documentos.length : 0,
                tiposArchivos: doc.documentos ? doc.documentos.map(archivo => archivo.originalName) : [],
                archivos: doc.documentos ? doc.documentos.map((archivo, index) => ({
                    id: archivo._id,
                    nombre: archivo.originalName,
                    url: archivo.downloadURL || archivo.url, // Usar downloadURL de Firebase
                    tamaño: formatFileSize(archivo.size || 0),
                    formato: getFileExtension(archivo.originalName),
                    fechaSubida: new Date(archivo.uploadDate || archivo.createdAt || doc.createdAt).toLocaleDateString('es-ES'),
                    public_id: archivo.firebaseRef || archivo.public_id,
                    fileIndex: index // Índice para el endpoint de descarga del backend
                })) : []
            }))

            console.log('✅ Documentos cargados:', rows.value.length)
            console.log('📄 Datos procesados:', rows.value)
        } else {
            console.log('⚠️ La respuesta no contiene los datos esperados')
            rows.value = []
        }
    } catch (err) {
        console.error('❌ Error al obtener los documentos:', err)
        showNotification('negative', 'Error al cargar documentos', 'No se pudieron obtener los documentos')
        rows.value = []
    } finally {
        loading.value = false
    }
}

function handleLogout() {
    const authStore = useAuth()
    authStore.logOut()
    router.push('/')
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
    ];
    return allowedTypes.includes(file.type);
}

/**
 * Valida el tamaño del archivo
 */
function validateFileSize(file, maxSizeMB) {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
}

/**
 * Sube el archivo al backend
 */
async function uploadToBackend(file, metadata, progressCallback) {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('metadata', JSON.stringify(metadata));

        // Simular progreso para mejor UX
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * 30;
            if (progress > 90) progress = 90;
            progressCallback(progress);
        }, 200);

        const response = await fetch('http://localhost:5000/api/control-interno/upload', {
            method: 'POST',
            body: formData,
        });

        clearInterval(progressInterval);
        progressCallback(100);

        if (response.ok) {
            const result = await response.json();
            return {
                success: true,
                data: result
            };
        } else {
            throw new Error('Error en la subida del archivo');
        }
    } catch (error) {
        return {
            success: false,
            error: error.message || 'Error de conexión'
        };
    }
}

onMounted(() => {
    loadDocuments();
    initializeFolderStructure();
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
    margin-left: -20px
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
    margin-left: -30px
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

/* Estilos para múltiples archivos */
.files-preview {
    padding: 1rem;
    border: 2px solid var(--border-color);
    border-radius: 12px;
    background: var(--background-color);
}

.files-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--border-color);
}

.files-header h6 {
    margin: 0;
    color: var(--text-primary);
    font-weight: 600;
}

.files-list {
    max-height: 200px;
    overflow-y: auto;
    margin-bottom: 1rem;
}

.file-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    margin-bottom: 0.5rem;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: white;
    transition: all 0.2s ease;
}

.file-item:hover {
    background: var(--light-gray);
    border-color: var(--primary-color);
}

.file-item .file-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
}

.file-item .file-details {
    flex: 1;
}

.file-item .file-name {
    margin: 0;
    font-weight: 500;
    color: var(--text-primary);
    font-size: 0.9rem;
}

.file-item .file-size {
    margin: 0;
    color: var(--text-secondary);
    font-size: 0.8rem;
}

.upload-hint {
    font-size: 0.8rem;
    color: var(--text-secondary);
    margin-top: 0.5rem;
}

.file-type-cell {
    padding: 0.5rem;
}

.file-types-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    align-items: center;
}

.file-type-chip {
    margin: 0.125rem;
    font-size: 0.75rem;
    font-weight: 600;
}

.no-files-text {
    color: var(--text-secondary);
    font-size: 0.8rem;
    font-style: italic;
}

/* Estilos mejorados para el modal de subida */
.upload-modal {
    max-height: 85vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.upload-modal .dialog-content {
    padding: 1rem;
    overflow-y: auto;
    flex: 1;
    min-height: 0;
    max-height: calc(85vh - 140px);
}

.upload-modal .dialog-actions {
    padding: 0.75rem 1rem;
    gap: 0.5rem;
    flex-shrink: 0;
    border-top: 1px solid var(--border-color);
}

/* File Preview Styles mejorados */
.file-preview {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.files-list-container {
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 1rem;
    background: var(--white);
}

.files-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--border-color);
}

.files-header h6 {
    margin: 0;
    color: var(--text-primary);
    font-size: 1rem;
    font-weight: 600;
}

.header-buttons {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}

.files-grid {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-height: 140px;
    overflow-y: auto;
}

.file-item-preview {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: var(--light-gray);
    border-radius: 8px;
    border: 1px solid var(--border-color);
    transition: all 0.3s ease;
    min-width: 0;
}

.file-item-preview:hover {
    border-color: var(--primary-blue);
    box-shadow: 0 2px 8px rgba(25, 118, 210, 0.1);
}

.file-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
    min-width: 0;
    overflow: hidden;
}

.file-details {
    flex: 1;
    min-width: 0;
    overflow: hidden;
}

.file-name {
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
    margin-bottom: 0.25rem;
    font-size: 0.95rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
    line-height: 1.3;
}

.file-size {
    color: var(--text-secondary);
    font-size: 0.8rem;
    margin: 0;
    white-space: nowrap;
}

.remove-file-btn {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    min-width: 32px;
}

.upload-modal .files-grid {
    max-height: 120px;
}

.upload-modal .upload-area {
    padding: 1.5rem;
}

.progress-detail {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin: 0.5rem 0 0 0;
    text-align: center;
    font-style: italic;
}

/* Media queries específicas para el modal */
@media (max-height: 600px) {
    .upload-modal {
        max-height: 95vh;
    }
    
    .upload-modal .dialog-content {
        max-height: calc(95vh - 120px);
        padding: 0.75rem;
    }
    
    .upload-modal .files-grid {
        max-height: 100px;
        gap: 0.5rem;
    }
    
    .upload-modal .upload-area {
        padding: 1rem;
    }
    
    .file-item-preview {
        padding: 0.5rem !important;
    }
}

@media (max-width: 768px) {
    .upload-modal {
        min-width: 320px;
        max-width: 95vw;
        max-height: 90vh;
    }
    
    .upload-modal .dialog-content {
        padding: 0.75rem;
        max-height: calc(90vh - 120px);
    }
    
    .upload-modal .files-display-grid {
        max-height: calc((140px + 0.5rem) * 2);
        gap: 0.5rem;
    }
    
    .file-card {
        min-height: 140px;
        padding: 0.5rem;
    }
    
    .files-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }
    
    .header-buttons {
        align-self: stretch;
        justify-content: space-between;
        width: 100%;
    }
    
    .file-item-preview {
        padding: 0.5rem;
        gap: 0.5rem;
    }
    
    .file-info {
        gap: 0.5rem;
    }
    
    .file-name {
        font-size: 0.85rem;
    }
    
    .file-size {
        font-size: 0.75rem;
    }
    
    .remove-file-btn {
        width: 28px;
        height: 28px;
        min-width: 28px;
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

/* ===== CSS específico para upload-modal inspirado en gerencia.vue ===== */
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

.files-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
    max-height: 400px;
    overflow-y: auto;
    padding-right: 0.5rem;
    height: 400px
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
}

/* === FOLDER MANAGEMENT STYLES === */
/* Navegación breadcrumb */
.breadcrumb-navigation {
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    border-bottom: 2px solid #e2e8f0;
    padding: 1rem 1.5rem;
    margin-bottom: 0;
}

.breadcrumb-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.breadcrumb-icon {
    flex-shrink: 0;
}

.breadcrumb-path {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    flex-wrap: wrap;
}

.breadcrumb-item {
    font-size: 0.9rem;
    font-weight: 500;
    color: #64748b;
    text-transform: none;
    padding: 0.25rem 0.75rem;
    border-radius: 6px;
    transition: all 0.2s ease;
}

.breadcrumb-item:hover {
    background: rgba(59, 130, 246, 0.1);
    color: #3b82f6;
}

.breadcrumb-item.current-crumb {
    color: #1976d2;
    font-weight: 600;
    background: rgba(25, 118, 210, 0.1);
}

.breadcrumb-separator {
    margin: 0 0.25rem;
}

.breadcrumb-actions {
    display: flex;
    gap: 0.5rem;
}

/* === DRAG & DROP STYLES === */
.draggable-document {
    cursor: move;
}

.draggable-document:hover {
    background-color: #f8f9fa;
}

.drag-over {
    background-color: #e3f2fd !important;
    border: 2px dashed #1976d2;
}

.drag-over td {
    background-color: transparent !important;
}

/* === ITEM STYLES === */
.item-name-cell {
    min-width: 200px;
}

.item-info {
    display: flex;
    align-items: center;
    gap: 12px;
}

.item-icon {
    flex-shrink: 0;
}

.item-details {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
}

.item-name {
    font-weight: 500;
    color: #333;
    line-height: 1.3;
    word-break: break-word;
}

.clickable-item {
    cursor: pointer;
    transition: color 0.2s ease;
}

.clickable-item:hover {
    color: #1976d2;
    text-decoration: underline;
}

.item-files-count {
    font-size: 12px;
    color: #666;
    font-weight: 400;
}

.no-files-text {
    font-size: 12px;
    color: #999;
    font-style: italic;
}

.item-type-cell {
    min-width: 120px;
}

.file-types-container {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
}

.file-type-chip {
    font-size: 11px;
    font-weight: 600;
}

/* === FOLDER MODAL STYLES === */
/* Estilos para modales de carpetas */
.create-folder-dialog .dialog-card,
.move-items-dialog .dialog-card {
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Estilos para modal de crear carpeta */
.folder-creation-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.current-location {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    background: #f8fafc;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
}

.location-text {
    font-weight: 500;
    color: #475569;
}

.location-path {
    font-weight: 600;
    color: #1976d2;
    background: rgba(25, 118, 210, 0.1);
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.9rem;
}

.creation-hint,
.move-hint {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: #64748b;
    background: rgba(59, 130, 246, 0.05);
    padding: 0.75rem;
    border-radius: 6px;
    border-left: 4px solid #3b82f6;
}

.move-document-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.document-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    background: #f0fdf4;
    border-radius: 8px;
    border: 1px solid #bbf7d0;
}

.document-name {
    font-weight: 600;
    color: #166534;
}

.destination-selection {
    margin: 0.5rem 0;
}

.folder-picker-list {
    max-height: 300px;
    overflow-y: auto;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
}

.folder-option {
    padding: 12px 16px;
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.folder-option:last-child {
    border-bottom: none;
}

.folder-option:hover {
    background-color: #f5f5f5;
}

.folder-option.selected {
    background-color: #e3f2fd;
    color: #1976d2;
}

.folder-path {
    font-size: 14px;
    color: #666;
    margin-top: 4px;
}
</style>