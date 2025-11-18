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
                       
                        <h4 class="page-title">Documentos</h4>
                        <p class="page-subtitle">Gestiona Documentos de Sistemas</p>    
                    </div>
                    <div class="header-actions">
                        <q-btn flat round icon="notifications" class="action-btn" size="md">
                            <q-tooltip>Notificaciones</q-tooltip>
                            <q-badge color="red" floating>3</q-badge>
                        </q-btn>
                        <q-btn flat round color="blue-7" icon="person" class="action-btn" size="md" @click="viewProfile">
                            <q-tooltip>Ver Perfil</q-tooltip>
                        </q-btn>
                        <q-btn flat round color="red-6" icon="logout" @click="handleLogout" class="action-btn"
                            size="md">
                            <q-tooltip>Cerrar Sesión</q-tooltip>
                        </q-btn>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="action-buttons-section">
                    <div class="primary-actions">
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
                            <q-tooltip>Subir documentos de sistemas</q-tooltip>
                        </q-btn-dropdown>
                    </div>

                    <div class="secondary-actions">
                        <q-btn
                            unelevated
                            color="secondary"
                            label="Nueva Carpeta"
                            icon="create_new_folder"
                            class="new-folder-btn"
                            @click="showCreateFolderDialog = true"
                        >
                            <q-tooltip>Crear nueva carpeta</q-tooltip>
                        </q-btn>
                    </div>
                </div>

                    <q-dialog v-model="dialog" :backdrop-filter="backdropFilter">
                        <q-card class="dialog-card upload-modal">
                            <q-card-section class="dialog-header"> 
                                <div class="dialog-title">
                                    <q-icon name="cloud_upload" size="1.5rem" />
                                    <h6>Subir Documento de Sistemas</h6>
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
                                        <q-select
                                            v-model="selectedUploadFolder"
                                            :options="getAvailableFolders()"
                                            label="Carpeta de destino"
                                            outlined
                                            dense
                                            class="q-mb-md"
                                            clearable
                                            options-dense
                                        >
                                            <template v-slot:prepend>
                                                <q-icon name="folder" color="amber-8" />
                                            </template>
                                            <template v-slot:no-option>
                                                <q-item>
                                                    <q-item-section class="text-grey">
                                                        No hay carpetas disponibles
                                                    </q-item-section>
                                                </q-item>
                                            </template>
                                        </q-select>
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
                                        <q-icon name="schedule" color="blue-7" size="sm" />
                                        <span class="info-label">Fecha:</span>
                                        <span class="info-value">{{ selectedDocumentForView.fechaCreacion }}</span>
                                    </div>
                                    <div class="info-item">
                                        <q-icon name="attachment" color="green-7" size="sm" />
                                        <span class="info-label">Archivos:</span>
                                        <span class="info-value">{{ selectedDocumentForView.cantidadArchivos }}</span>
                                    </div>
                                </div>

                                <div class="files-list" v-if="selectedDocumentForView?.archivos?.length > 0">
                                    <h6 class="files-title">
                                        <q-icon name="folder" />
                                        Archivos adjuntos
                                    </h6>
                                    <div class="file-items">
                                        <div 
                                            v-for="file in selectedDocumentForView.archivos" 
                                            :key="file.id" 
                                            class="file-item"
                                        >
                                            <div class="file-item-info">
                                                <q-icon 
                                                    :name="getFileIcon(file.nombre)" 
                                                    :color="getFileColor(file.formato)"
                                                    size="2rem" 
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
                                                    dense 
                                                    icon="visibility" 
                                                    color="blue-7"
                                                    size="sm"
                                                    @click="openFileInNewTab(file)"
                                                >
                                                    <q-tooltip>Ver archivo</q-tooltip>
                                                </q-btn>
                                                <q-btn 
                                                    flat 
                                                    round 
                                                    dense 
                                                    icon="download" 
                                                    color="green-7"
                                                    size="sm"
                                                    @click="downloadSingleFile(file)"
                                                >
                                                    <q-tooltip>Descargar archivo</q-tooltip>
                                                </q-btn>
                                            </div>
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

                <!-- Breadcrumb Navigation -->
                <div v-if="currentFolderPath.length > 0" class="breadcrumb-navigation">
                    <q-breadcrumbs class="folder-breadcrumbs" separator="›">
                        <q-breadcrumbs-el 
                            label="Raíz" 
                            icon="home"
                            @click="navigateToRoot"
                            class="breadcrumb-clickable"
                        />
                        <q-breadcrumbs-el
                            v-for="(folder, index) in currentFolderPath"
                            :key="index"
                            :label="folder"
                            icon="folder"
                            @click="navigateToFolder(folder, index)"
                            :class="{ 'breadcrumb-clickable': index < currentFolderPath.length - 1 }"
                        />
                    </q-breadcrumbs>
                </div>

                <!-- Data Table -->
                <div class="table-container">
                    <q-table
                        :rows="getCurrentFolderItems()"
                        :columns="folderColumns"
                        row-key="nombre"
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
                                    <DepartmentChip 
                                        department-key="sistemas" 
                                        variant="table"
                                        size="sm"
                                        dense
                                    />
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
                                :draggable="props.row.tipo === 'documento'"
                                @dragstart="onDragStart($event, props.row)"
                                @dragover.prevent="props.row.tipo === 'carpeta' ? onDragOver($event, props.row) : null"
                                @dragleave="onDragLeave"
                                @drop="props.row.tipo === 'carpeta' ? onDropFolder($event, props.row) : null"
                                :class="{ 
                                    'drag-over-row': dragOverFolder === props.row.nombre,
                                    'draggable-row': props.row.tipo === 'documento'
                                }"
                            >
                                <q-td
                                    v-for="col in props.cols"
                                    :key="col.name"
                                    :props="props"
                                    class="table-cell"
                                >
                                    <!-- Columna de Nombre (con navegación para carpetas) -->
                                    <div v-if="col.name === 'nombre'" class="item-name-cell">
                                        <div 
                                            class="item-info"
                                            :class="{ 'clickable': props.row.tipo === 'carpeta' }"
                                            @click="props.row.tipo === 'carpeta' ? navigateIntoFolder(props.row.nombre) : null"
                                        >
                                            <q-icon 
                                                :name="props.row.tipo === 'carpeta' ? 'folder' : 'description'" 
                                                :color="props.row.tipo === 'carpeta' ? 'amber-8' : 'blue-7'"
                                                size="sm"
                                                class="item-icon"
                                            />
                                            <div class="item-details">
                                                <span class="item-name">{{ col.value }}</span>
                                                <span v-if="props.row.tipo === 'documento' && props.row.descripcion" class="item-description">
                                                    {{ props.row.descripcion }}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Columna de Tipo -->
                                    <div v-else-if="col.name === 'tipo'" class="item-type-cell">
                                        <q-chip 
                                            :color="props.row.tipo === 'carpeta' ? 'amber-1' : 'blue-1'" 
                                            :text-color="props.row.tipo === 'carpeta' ? 'amber-9' : 'blue-9'"
                                            :icon="props.row.tipo === 'carpeta' ? 'folder' : 'description'"
                                            size="sm"
                                        >
                                            {{ props.row.tipo === 'carpeta' ? 'Carpeta' : 'Documento' }}
                                        </q-chip>
                                    </div>

                                    <!-- Columna de Fecha -->
                                    <div v-else-if="col.name === 'fechaCreacion'" class="date-cell">
                                        {{ col.value }}
                                    </div>

                                    <!-- Columna de Información (archivos/subcarpetas) -->
                                    <div v-else-if="col.name === 'informacion'" class="info-cell">
                                        <span v-if="props.row.tipo === 'carpeta'">
                                            {{ props.row.informacion || '0 elementos' }}
                                        </span>
                                        <div v-else class="file-types-container">
                                            <q-chip 
                                                v-for="tipo in getUniqueFileTypes(props.row.documentos || [])"
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
                                    </div>

                                    <!-- Columna de Acciones -->
                                    <div v-else-if="col.name === 'acciones'" class="action-buttons-cell">
                                        <!-- Acciones para carpetas -->
                                        <template v-if="props.row.tipo === 'carpeta'">
                                            <q-btn
                                                flat
                                                round
                                                color="amber-8"
                                                icon="folder_open"
                                                size="sm"
                                                @click="navigateIntoFolder(props.row.nombre)"
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
                                                @click="deleteFolder(props.row.nombre)"
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
                                                color="blue-7"
                                                icon="visibility"
                                                size="sm"
                                                @click="viewDocument(props.row)"
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
                                                color="purple-7"
                                                icon="drive_file_move"
                                                size="sm"
                                                @click="openMoveDialog(props.row)"
                                                class="action-btn-small"
                                            >
                                                <q-tooltip>Mover documento</q-tooltip>
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

                                    <!-- Otras columnas -->
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
                                        <p class="text-h6 q-mb-sm">No hay documentos disponibles</p>
                                        <p class="text-body2 text-grey-6">Comienza subiendo tu primer documento</p>
                                        <q-btn color="primary" @click="openDialog" class="q-mt-md">
                                            Subir Documento
                                        </q-btn>
                                    </div>
                                </div>
                            </div>
                        </template>

                        <template v-slot:loading>
                            <q-inner-loading showing color="blue-7" />
                        </template>
                    </q-table>
                </div>

                <!-- Dialog: Crear Nueva Carpeta -->
                <q-dialog v-model="showCreateFolderDialog" persistent>
                    <q-card class="dialog-card folder-dialog">
                        <q-card-section class="dialog-header">
                            <div class="dialog-title">
                                <q-icon name="create_new_folder" size="1.5rem" />
                                <h6>Crear Nueva Carpeta</h6>
                            </div>
                            <q-btn flat round dense icon="close" color="white" v-close-popup />
                        </q-card-section>

                        <q-card-section class="dialog-content">
                            <q-input
                                v-model="newFolderName"
                                label="Nombre de la carpeta"
                                outlined
                                dense
                                autofocus
                                :rules="folderNameRules"
                                @keyup.enter="createFolder"
                            >
                                <template v-slot:prepend>
                                    <q-icon name="folder" color="amber-8" />
                                </template>
                            </q-input>
                            <p class="text-caption text-grey-6 q-mt-sm">
                                La carpeta se creará en: {{ currentFolderPath.length > 0 ? currentFolderPath.join(' / ') : 'Raíz' }}
                            </p>
                        </q-card-section>

                        <q-card-actions class="dialog-actions">
                            <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
                            <q-btn 
                                unelevated 
                                label="Crear Carpeta" 
                                color="primary" 
                                @click="createFolder"
                                :disable="!newFolderName || newFolderName.trim() === ''"
                            />
                        </q-card-actions>
                    </q-card>
                </q-dialog>

                <!-- Dialog: Mover Documento -->
                <q-dialog v-model="showMoveItemsDialog" persistent>
                    <q-card class="dialog-card move-dialog">
                        <q-card-section class="dialog-header">
                            <div class="dialog-title">
                                <q-icon name="drive_file_move" size="1.5rem" />
                                <h6>Mover Documento</h6>
                            </div>
                            <q-btn flat round dense icon="close" color="white" v-close-popup />
                        </q-card-section>

                        <q-card-section class="dialog-content">
                            <div v-if="selectedDocumentToMove" class="move-info">
                                <div class="document-to-move">
                                    <q-icon name="description" color="blue-7" size="sm" />
                                    <span class="document-name">{{ selectedDocumentToMove.documento }}</span>
                                </div>
                                <q-icon name="arrow_downward" color="grey-6" size="sm" class="q-my-md" />
                                <q-select
                                    v-model="selectedDestinationFolder"
                                    :options="getAvailableFolders()"
                                    label="Carpeta de destino"
                                    outlined
                                    dense
                                    options-dense
                                    clearable
                                >
                                    <template v-slot:prepend>
                                        <q-icon name="folder" color="amber-8" />
                                    </template>
                                    <template v-slot:no-option>
                                        <q-item>
                                            <q-item-section class="text-grey">
                                                No hay carpetas disponibles
                                            </q-item-section>
                                        </q-item>
                                    </template>
                                </q-select>
                            </div>
                        </q-card-section>

                        <q-card-actions class="dialog-actions">
                            <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
                            <q-btn 
                                unelevated 
                                label="Mover" 
                                color="primary" 
                                @click="moveDocument"
                            />
                        </q-card-actions>
                    </q-card>
                </q-dialog>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { getData, deleteData } from '../services/apiClient.js'
import { useAuth } from '../stores/store.js'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import DepartmentChip from '../components/DepartmentChip.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuth()

// ⭐ URL base del API para sistemas
const API_BASE_URL = 'http://localhost:5000/api/sistemas'

// Función para mostrar notificaciones (temporal)
function showNotification(type, message, caption = '') {
    const fullMessage = caption ? `${message}\n${caption}` : message
    if (type === 'positive') {
        alert(`✅ ${fullMessage}`)
    } else if (type === 'negative') {
        alert(`❌ ${fullMessage}`)
    } else {
        alert(`ℹ️ ${fullMessage}`)
    }
}

// Estados reactivos
const dialog = ref(false)
const backdropFilter = ref('blur(4px) saturate(150%)')
const documentTitle = ref('')
const documentDescription = ref('')
const selectedFiles = ref([])
const isUploading = ref(false)
const uploadProgress = ref(0)
const uploadResult = ref(null)
const isDragOver = ref(false)
const fileInput = ref(null)
const isAddingMoreFiles = ref(false)

// Estados para búsqueda
const searchTerm = ref('')
const loading = ref(false)

// Estados para el modal de vista de documentos
const viewDocumentDialog = ref(false)
const selectedDocumentForView = ref(null)

// ⭐ Estados para el sistema de carpetas
const currentView = ref('folders')
const currentFolderPath = ref([])
const folderStructure = ref({})
const selectedItems = ref([])
const showCreateFolderDialog = ref(false)
const newFolderName = ref('')
const dragOverFolder = ref(null)
const selectedUploadFolder = ref(null)

// Diálogos específicos del gestor de carpetas
const showFolderOptionsDialog = ref(false)
const selectedFolder = ref(null)
const showMoveItemsDialog = ref(false)
const availableFolders = ref([])
const selectedDocumentToMove = ref(null)
const selectedDestinationFolder = ref(null)
const draggedDocument = ref(null)

// Reglas de validación para nombres de carpetas
const folderNameRules = [
    val => !!val || 'El nombre es requerido',
    val => val.length <= 50 || 'Máximo 50 caracteres',
    val => !/[<>:"/\\|?*]/.test(val) || 'Caracteres no permitidos'
]

// Definición de columnas para la tabla
const columns = ref([
    {
        name: "titulo",
        align: "left",
        label: "Documento",
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
        name: "tipoArchivo",
        align: "center",
        label: "Tipos",
        field: "",
        sortable: false,
    },
    {
        name: "acciones",
        align: "center",
        label: "Acciones",
        field: "",
        sortable: false,
    }
])

// ⭐ Columnas específicas para la vista de carpetas
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
        field: row => {
            if (row.itemType === 'folder') return 'Carpeta';
            if (row.documentos && row.documentos.length > 0) {
                const tipos = [...new Set(row.documentos.map(doc => getFileExtension(doc.originalName)))];
                return tipos.filter(tipo => tipo !== 'desconocido').join(', ') || 'Desconocido';
            }
            return 'Sin archivos';
        },
        sortable: true,
    },
    {
        name: "fechaCreacion",
        align: "center", 
        label: "Fecha de Creación",
        field: row => row.itemType === 'folder' ? row.createdAt : row.createdAt,
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
        name: "informacion",
        align: "center",
        label: "Información",
        field: row => {
            if (row.itemType === 'folder') {
                const folder = folderStructure.value[row.path]
                const childCount = Object.keys(folder?.children || {}).length
                const docCount = (folder?.documents || []).length
                return `${childCount} carpeta(s), ${docCount} documento(s)`
            } else {
                const fileCount = row.documentos?.length || 0
                if (fileCount === 0) return 'Sin archivos'
                if (fileCount === 1) return '1 archivo'
                
                const tipos = [...new Set((row.documentos || []).map(doc => getFileExtension(doc.originalName)))]
                    .filter(tipo => tipo !== 'desconocido')
                
                if (tipos.length === 1) {
                    return `${fileCount} archivo(s) ${tipos[0].toUpperCase()}`
                } else {
                    return `${fileCount} archivos (${tipos.length} tipos)`
                }
            }
        },
        sortable: false,
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
  'Subir Documento de Sistemas',
]

const backdropFilterList = list.map(filter => ({
  label: filter,
  onClick: () => {
    openDialog()
  }
}))

async function goHome() {
    await router.push("/home")
}

function viewProfile() {
    router.push("/profile")
}

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
    documentTitle.value = ''
    documentDescription.value = ''
    isUploading.value = false
    uploadProgress.value = 0
    uploadResult.value = null
    isDragOver.value = false
    selectedUploadFolder.value = getCurrentPathString()
    resetFileInput()
}

// ========== FUNCIONES DE GESTIÓN DE CARPETAS ==========

/**
 * Inicializar la estructura de carpetas desde el backend
 */
async function initializeFolderStructure() {
    try {
        console.log('📡 Cargando estructura de carpetas desde backend...')
        const response = await axios.get(`${API_BASE_URL}/folders`)
        
        if (response.data.success) {
            folderStructure.value = response.data.data
            console.log('✅ Estructura de carpetas cargada:', folderStructure.value)
        } else {
            console.warn('⚠️ Error al cargar estructura:', response.data.message)
            folderStructure.value = {}
        }
    } catch (error) {
        console.error('❌ Error al cargar estructura de carpetas:', error)
        showNotification('negative', 'Error al cargar carpetas', 'No se pudo conectar con el servidor')
        folderStructure.value = {}
    }
}

/**
 * Obtiene la ruta completa actual como string
 */
function getCurrentPathString() {
    return currentFolderPath.value.length === 0 ? '/' : '/' + currentFolderPath.value.join('/') + '/'
}

/**
 * Obtiene la carpeta actual
 */
function getCurrentFolder() {
    if (!folderStructure.value || Object.keys(folderStructure.value).length === 0) {
        console.warn('⚠️ Estructura de carpetas no cargada, retornando carpeta raíz por defecto')
        return {
            id: 'root',
            name: 'Documentos',
            type: 'folder',
            path: '/',
            parent: null,
            children: {},
            documents: [],
            createdAt: new Date().toISOString()
        }
    }
    
    const path = getCurrentPathString()
    return folderStructure.value[path] || folderStructure.value['/'] || {
        id: 'root',
        name: 'Documentos',
        type: 'folder',
        path: '/',
        parent: null,
        children: {},
        documents: [],
        createdAt: new Date().toISOString()
    }
}

/**
 * Obtiene todos los items (carpetas y documentos) de la carpeta actual
 */
function getCurrentFolderItems() {
    const currentFolder = getCurrentFolder()
    const items = []
    
    if (!currentFolder) {
        console.warn('⚠️ No se pudo obtener la carpeta actual')
        return []
    }
    
    const children = currentFolder.children || {}
    Object.values(children).forEach(childPath => {
        const childFolder = folderStructure.value[childPath]
        if (childFolder) {
            items.push({
                ...childFolder,
                itemType: 'folder'
            })
        }
    })
    
    const folderDocuments = currentFolder.documents || []
    if (Array.isArray(rows.value)) {
        rows.value.forEach(doc => {
            if (folderDocuments.includes(doc._id)) {
                items.push({
                    ...doc,
                    itemType: 'document'
                })
            }
        })
    }
    
    return items
}

/**
 * Crear una nueva carpeta usando el backend
 */
async function createFolder() {
    const name = newFolderName.value
    
    if (!name || name.trim() === '') {
        showNotification('negative', 'Nombre inválido', 'El nombre de la carpeta no puede estar vacío')
        return false
    }
    
    const trimmedName = name.trim()
    const currentPath = getCurrentPathString()
    
    try {
        console.log('📤 Creando carpeta:', { name: trimmedName, parentPath: currentPath })
        
        const response = await axios.post(`${API_BASE_URL}/folders`, {
            name: trimmedName,
            parentPath: currentPath
        })
        
        if (response.data.success) {
            showNotification('positive', 'Carpeta creada', `Carpeta "${trimmedName}" creada exitosamente`)
            console.log('✅ Carpeta creada:', response.data.data)
            
            await initializeFolderStructure()
            
            // Cerrar diálogo y limpiar
            showCreateFolderDialog.value = false
            newFolderName.value = ''
            
            return true
        } else {
            showNotification('negative', 'Error', response.data.message)
            return false
        }
    } catch (error) {
        console.error('❌ Error al crear carpeta:', error)
        const errorMessage = error.response?.data?.message || 'No se pudo conectar con el servidor'
        showNotification('negative', 'Error al crear carpeta', errorMessage)
        return false
    }
}

/**
 * Eliminar una carpeta usando el backend (solo si está vacía)
 */
async function deleteFolder(folderPath) {
    const folder = folderStructure.value[folderPath]
    
    if (!folder) {
        showNotification('negative', 'Error', 'Carpeta no encontrada')
        return false
    }
    
    if (folderPath === '/') {
        showNotification('negative', 'Error', 'No se puede eliminar la carpeta raíz')
        return false
    }
    
    const hasChildren = Object.keys(folder.children || {}).length > 0
    const hasDocuments = (folder.documents || []).length > 0
    
    if (hasChildren || hasDocuments) {
        showNotification('negative', 'Carpeta no vacía', 'Solo se pueden eliminar carpetas vacías')
        return false
    }
    
    const confirmDelete = confirm(`¿Estás seguro de que quieres eliminar la carpeta "${folder.name}"?`)
    if (!confirmDelete) return false
    
    try {
        console.log('📤 Eliminando carpeta:', folderPath)
        
        const encodedPath = encodeURIComponent(folderPath)
        const response = await axios.delete(`${API_BASE_URL}/folders/${encodedPath}`)
        
        if (response.data.success) {
            showNotification('positive', 'Carpeta eliminada', `Carpeta "${folder.name}" eliminada exitosamente`)
            console.log('✅ Carpeta eliminada')
            
            if (getCurrentPathString() === folderPath) {
                navigateToFolder(folder.parent || '/')
            }
            
            await initializeFolderStructure()
            
            return true
        } else {
            showNotification('negative', 'Error', response.data.message)
            return false
        }
    } catch (error) {
        console.error('❌ Error al eliminar carpeta:', error)
        const errorMessage = error.response?.data?.message || 'No se pudo conectar con el servidor'
        showNotification('negative', 'Error al eliminar carpeta', errorMessage)
        return false
    }
}

/**
 * Navegar a una carpeta específica
 */
function navigateToFolder(folderPath) {
    if (folderPath === '/') {
        currentFolderPath.value = []
    } else {
        const cleanPath = folderPath.replace(/^\/|\/$/g, '')
        currentFolderPath.value = cleanPath ? cleanPath.split('/') : []
    }
    
    console.log('📂 Navegando a carpeta:', folderPath, 'Path array:', currentFolderPath.value)
}

/**
 * Navegar hacia atrás en la jerarquía
 */
function navigateUp() {
    if (currentFolderPath.value.length > 0) {
        currentFolderPath.value.pop()
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
 * Mover un documento a una carpeta específica usando el backend
 */
async function moveDocumentToFolder(documentId, targetFolderPath) {
    try {
        console.log('📤 Moviendo documento:', { documentId, targetFolderPath })
        
        const response = await axios.put(`${API_BASE_URL}/${documentId}/move`, {
            targetFolderPath: targetFolderPath
        })
        
        if (response.data.success) {
            showNotification('positive', 'Documento movido', 'Documento movido exitosamente')
            console.log('✅ Documento movido:', response.data.data)
            
            await loadDocuments()
            await initializeFolderStructure()
            
            return true
        } else {
            showNotification('negative', 'Error', response.data.message)
            return false
        }
    } catch (error) {
        console.error('❌ Error al mover documento:', error)
        const errorMessage = error.response?.data?.message || 'No se pudo conectar con el servidor'
        showNotification('negative', 'Error al mover documento', errorMessage)
        return false
    }
}

/**
 * Obtener lista de carpetas disponibles para mover documentos
 */
function getAvailableFolders() {
    return Object.values(folderStructure.value)
        .filter(folder => folder.type === 'folder')
        .map(folder => ({
            label: folder.path === '/' ? 'Documentos (Raíz)' : folder.name,
            value: folder.path,
            path: folder.path
        }))
        .sort((a, b) => a.path.localeCompare(b.path))
}

/**
 * Confirmar la creación de carpeta
 */
async function confirmCreateFolder() {
    const success = await createFolder(newFolderName.value)
    if (success) {
        newFolderName.value = ''
        showCreateFolderDialog.value = false
    }
}

/**
 * Iniciar el proceso de mover un documento
 */
function startMoveDocument(document) {
    selectedDocumentToMove.value = document
    selectedDestinationFolder.value = null
    showMoveItemsDialog.value = true
}

/**
 * Cancelar el movimiento de documento
 */
function cancelMoveDocument() {
    selectedDocumentToMove.value = null
    selectedDestinationFolder.value = null
    showMoveItemsDialog.value = false
}

/**
 * Confirmar el movimiento de documento
 */
async function confirmMoveDocument() {
    if (selectedDocumentToMove.value && selectedDestinationFolder.value) {
        const success = await moveDocumentToFolder(selectedDocumentToMove.value._id, selectedDestinationFolder.value)
        if (success) {
            cancelMoveDocument()
        }
    }
}

// ========== FUNCIONES DRAG & DROP ==========

/**
 * Iniciar el drag de un documento
 */
function onDragStart(event, item) {
    if (item.itemType === 'document') {
        event.dataTransfer.setData('application/json', JSON.stringify({
            type: 'document',
            id: item._id,
            name: item.documento
        }))
        event.dataTransfer.effectAllowed = 'move'
    }
}

/**
 * Permitir drop en carpetas
 */
function onDragOver(event, folderPath) {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    dragOverFolder.value = folderPath
}

/**
 * Limpiar estado de drag over
 */
function onDragLeave(folderPath) {
    if (dragOverFolder.value === folderPath) {
        dragOverFolder.value = null
    }
}

/**
 * Manejar el drop de documentos en carpetas
 */
function onDropFolder(event, folderPath) {
    event.preventDefault()
    dragOverFolder.value = null
    
    try {
        const data = JSON.parse(event.dataTransfer.getData('application/json'))
        if (data.type === 'document') {
            moveDocumentToFolder(data.id, folderPath)
            showNotification('positive', 'Documento movido', `"${data.name}" movido a la carpeta`)
        }
    } catch (error) {
        console.error('Error al procesar drop:', error)
        showNotification('negative', 'Error', 'No se pudo mover el documento')
    }
}

/**
 * Maneja la selección de archivos
 */
function onFileSelect(event) {
    const files = Array.from(event.target.files)
    if (files.length > 0) {
        handleFilesSelection(files)
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
function handleFilesSelection(files) {
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
    
    // Validar cantidad máxima (10 archivos)
    if (files.length > 10) {
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
    
    selectedFiles.value = validFiles
    
    // Generar título automático basado en el primer archivo
    if (validFiles.length === 1) {
        documentTitle.value = validFiles[0].name.replace(/\.[^/.]+$/, "")
    } else {
        documentTitle.value = `Lote de ${validFiles.length} archivos`
    }
}

/**
 * Abre el diálogo de selección de archivos
 */
function triggerFileSelection(addMore = false) {
    console.log('triggerFileSelection called, addMore:', addMore)
    isAddingMoreFiles.value = addMore
    if (fileInput.value) {
        fileInput.value.click()
    } else {
        console.error('File input ref not found')
    }
}

/**
 * Limpia todos los archivos seleccionados
 */
function clearFiles() {
    selectedFiles.value = []
    uploadResult.value = null
    resetFileInput()
}

/**
 * Resetea el input de archivos
 */
function resetFileInput() {
    if (fileInput.value) {
        fileInput.value.value = ''
    }
}

/**
 * Recarga la lista de documentos
 */
async function loadDocuments() {
    await getDocuments();
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
        const allDocuments = await getData('/sistemas');
        
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
                    url: archivo.downloadURL,
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

async function clearSearch() {
    searchTerm.value = '';
    await getDocuments();
}

/**
 * Descarga un archivo individual
 */
async function downloadSingleFile(file) {
    try {
        console.log('📥 Descargando archivo:', file);
        
        // Buscar el archivo original en el documento actual
        const currentDoc = selectedDocumentForView.value;
        if (currentDoc && currentDoc.documentos) {
            const fileIndex = currentDoc.archivos ? currentDoc.archivos.findIndex(arch => arch.id === file.id) : -1;
            const originalFile = fileIndex !== -1 ? currentDoc.documentos[fileIndex] : null;
            
            if (originalFile && originalFile.downloadURL) {
                const link = document.createElement('a');
                link.href = originalFile.downloadURL;
                link.download = originalFile.originalName || file.nombre;
                link.target = '_blank';
                link.click();
                
                showNotification('positive', 'Descarga iniciada', `Descargando ${file.nombre}`);
                return;
            }
        }
        
        // Fallback: usar la URL procesada
        if (file.url) {
            const link = document.createElement('a');
            link.href = file.url;
            link.download = file.nombre;
            link.target = '_blank';
            link.click();
            
            showNotification('positive', 'Descarga iniciada', `Descargando ${file.nombre}`);
        } else {
            showNotification('negative', 'Error', 'URL del archivo no disponible');
        }
        
    } catch (error) {
        console.error('❌ Error descargando archivo:', error);
        showNotification('negative', 'Error en la descarga', error.message);
    }
}

/**
 * Descarga todos los archivos de un documento
 */
async function downloadAllFiles() {
    if (!selectedDocumentForView.value || !selectedDocumentForView.value.archivos) {
        return;
    }

    try {
        for (const file of selectedDocumentForView.value.archivos) {
            await downloadSingleFile(file);
            // Pequeña pausa entre descargas para evitar problemas
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        showNotification('positive', 'Descarga completa', 'Todos los archivos se han descargado');
        
    } catch (error) {
        console.error('❌ Error descargando archivos:', error);
        showNotification('negative', 'Error en la descarga', error.message);
    }
}

/**
 * Remueve un archivo de la lista de seleccionados
 */
function removeFile(index) {
    if (selectedFiles.value && Array.isArray(selectedFiles.value)) {
        selectedFiles.value.splice(index, 1);
        if (selectedFiles.value.length === 0) {
            selectedFiles.value = [];
        }
    }
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
 * Ver documentos de un registro
 */
function viewDocument(documentRecord) {
    if (!documentRecord.tieneArchivos) {
        showNotification('negative', 'Sin archivos', 'Este documento no tiene archivos adjuntos');
        return;
    }
    
    console.log('👁️ Ver documento:', documentRecord);
    
    // Preparar los datos para el modal de vista
    selectedDocumentForView.value = {
        ...documentRecord,
        titulo: documentRecord.documento,
        fechaCreacion: new Date(documentRecord.createdAt).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    };
    
    viewDocumentDialog.value = true;
}

/**
 * Formatea el tamaño del archivo
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
        
        console.log('� Subiendo archivos a sistemas:', {
            cantidad: selectedFiles.value.length,
            archivos: selectedFiles.value.map(file => ({
                nombre: file.name,
                tipo: file.type,
                tamaño: file.size
            })),
            titulo: documentTitle.value
        })
        
        // ⭐ Agregar folderPath de la carpeta actual o seleccionada
        const targetFolder = selectedUploadFolder.value || getCurrentPathString()
        formData.append('folderPath', targetFolder)
        
        // Usar axios directamente para tener control del progreso
        const response = await axios.post(
            API_BASE_URL,
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
        
        // ⭐ Recargar estructura de carpetas y documentos
        await initializeFolderStructure()
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

/**
 * Descarga todos los documentos de un registro
 */
async function downloadDocuments(documentRecord) {
    if (!documentRecord.tieneArchivos) {
        showNotification('negative', 'Sin archivos', 'Este documento no tiene archivos para descargar');
        return;
    }

    try {
        console.log('📥 Descargando documentos:', documentRecord);
        
        // Si hay archivos, descargar todos
        if (documentRecord.documentos && documentRecord.documentos.length > 0) {
            documentRecord.documentos.forEach((doc, index) => {
                if (doc.downloadURL) {
                    setTimeout(() => {
                        const link = document.createElement('a');
                        link.href = doc.downloadURL;
                        link.download = doc.originalName || `archivo_${index + 1}`;
                        link.target = '_blank';
                        link.click();
                    }, index * 300);
                }
            });
            
            showNotification('positive', 'Descarga iniciada', 
                `Descargando ${documentRecord.documentos.length} archivo(s)`);
        }

    } catch (error) {
        console.error('❌ Error descargando documentos:', error);
        showNotification('negative', 'Error en la descarga', error.message);
    }
}

/**
 * Eliminar documento
 */
async function deleteDocument(documentRecord) {
    // Confirmación del usuario
    const confirmMessage = `¿Estás seguro de que quieres eliminar el documento "${documentRecord.documento}"?\n\n` +
        `Este documento contiene ${documentRecord.cantidadArchivos} archivo(s).\n` +
        `Esta acción no se puede deshacer.`;
    
    if (!confirm(confirmMessage)) {
        return;
    }
    
    try {
        console.log('🗑️ Eliminando documento:', documentRecord._id);
        
        loading.value = true;
        
        // Usar axios para hacer petición DELETE
        const response = await axios.delete(`${API_BASE_URL}/${documentRecord._id}`);
        
        showNotification('positive', 'Documento eliminado', 'El documento y sus archivos han sido eliminados exitosamente');
        
        // ⭐ Recargar estructura de carpetas y documentos
        await initializeFolderStructure();
        await loadDocuments();
        
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
        console.log('📥 Cargando documentos de sistemas...');
        
        const response = await axios.get(API_BASE_URL);
        
        // Manejar ambos formatos de respuesta: { success: true, data: [...] } o directamente [...]
        const documents = response.data?.data || response.data;
        
        if (documents && Array.isArray(documents)) {
            // Procesar los datos para añadir propiedades calculadas
            rows.value = documents.map(doc => ({
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
    // Usar el store para cerrar sesión correctamente
    authStore.logOut()
    
    // Redirigir al login
    router.push('/')
}

/**
 * Obtiene los tipos de archivo únicos de una lista de documentos
 */
function getUniqueFileTypes(documentos) {
    if (!documentos || documentos.length === 0) return [];
    const tipos = [...new Set(documentos.map(doc => getFileExtension(doc.originalName)))];
    return tipos.filter(tipo => tipo !== 'desconocido');
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
 * Obtiene el color de texto para el chip del tipo de archivo
 */
function getFileTypeTextColor(extension) {
    switch (extension.toLowerCase()) {
        case 'pdf':
            return 'white'
        case 'doc':
        case 'docx':
            return 'white'
        case 'xls':
        case 'xlsx':
        case 'csv':
            return 'white'
        case 'ppt':
        case 'pptx':
            return 'white'
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'svg':
        case 'webp':
            return 'white'
        case 'txt':
            return 'white'
        case 'zip':
        case 'rar':
        case '7z':
            return 'white'
        case 'mp4':
        case 'avi':
        case 'mov':
            return 'white'
        case 'mp3':
        case 'wav':
            return 'white'
        default:
            return 'white'
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

// Cargar documentos al montar el componente
onMounted(async () => {
    console.log('🚀 Inicializando vista de sistemas...')
    
    // Inicializar estructura de carpetas
    await initializeFolderStructure()
    
    // Cargar documentos
    await getDocuments();
    
    // Manejar query parameter para abrir diálogo de subida
    if (route?.query?.upload === '1' || route?.query?.upload === 'true') {
        openDialog()
    }
    
    console.log('✅ Vista inicializada')
});

watch(() => route.query?.upload, (val) => {
    if (val === '1' || val === 'true') openDialog()
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

/* Estados sin datos */
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

/* Mejoras en la tabla */
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

.q-table tbody tr:nth-child(even) {
    background: rgba(248, 250, 252, 0.5);
}

.q-table tbody tr:nth-child(even):hover {
    background: var(--light-gray);
}

/* Upload Modal Styles */
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

/* === Estilos para la sección de archivos seleccionados basado en controlInterno.vue === */
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

/* Grid de archivos con diseño específico según las imágenes de controlInterno.vue */
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

/* Cards de archivos con diseño exacto a las imágenes de controlInterno.vue */
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

    .header-actions {
        justify-content: center;
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

/* Multiple Files Upload Styles */
.files-list-container {
    background: var(--white);
    border: 2px dashed var(--primary-blue);
    border-radius: 12px;
    padding: 1.5rem;
}

.files-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid var(--border-color);
}

.files-header h6 {
    margin: 0;
    color: var(--text-primary);
    font-weight: 600;
}

.files-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
}

.file-item-preview {
    background: #fafafa;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    overflow: hidden;
    transition: all 0.3s ease;
}

.file-item-preview:hover {
    border-color: var(--primary-blue);
    box-shadow: 0 2px 8px rgba(25, 118, 210, 0.15);
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

    .content-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }

    .header-actions {
        align-self: flex-end;
    }

    .files-grid {
        grid-template-columns: 1fr;
    }

    .files-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }

    .dialog-card {
        min-width: 300px;
        max-width: 95vw;
    }
}

/* Estilos específicos para sistemas que complementan DepartmentChip */
.department-indicator .department-chip {
    background: linear-gradient(135deg, #7b1fa2 0%, #6a1b9a 100%) !important;
}

.table-title-container .department-chip {
    background: linear-gradient(135deg, #7b1fa2 0%, #6a1b9a 100%) !important;
}

/* ============================================
   ESTILOS DEL SISTEMA DE CARPETAS
   ============================================ */

/* Breadcrumb Navigation */
.breadcrumb-navigation {
    background: white;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    margin-bottom: 1.5rem;
}

.folder-breadcrumbs {
    font-size: 0.95rem;
}

.breadcrumb-clickable {
    cursor: pointer;
    transition: all 0.2s ease;
}

.breadcrumb-clickable:hover {
    color: var(--q-primary) !important;
    transform: translateY(-1px);
}

/* Action Buttons Section */
.action-buttons-section {
    display: flex;
    gap: 1rem;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
}

.primary-actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
}

.secondary-actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
}

.new-folder-btn {
    min-width: 160px;
}

/* Folder Dialogs */
.folder-dialog,
.move-dialog {
    min-width: 400px;
}

.folder-dialog .dialog-content,
.move-dialog .dialog-content {
    padding: 1.5rem;
}

.move-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

.document-to-move {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: #f5f5f5;
    border-radius: 8px;
    width: 100%;
}

.document-to-move .document-name {
    font-weight: 500;
    color: #1976d2;
}

/* Table Row Styles for Folders */
.item-name-cell {
    padding: 0.5rem 0;
}

.item-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem;
    border-radius: 8px;
    transition: all 0.2s ease;
}

.item-info.clickable {
    cursor: pointer;
}

.item-info.clickable:hover {
    background: #f5f5f5;
    transform: translateX(4px);
}

.item-icon {
    flex-shrink: 0;
}

.item-details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
}

.item-name {
    font-weight: 500;
    color: #212121;
    word-break: break-word;
}

.item-description {
    font-size: 0.85rem;
    color: #757575;
    word-break: break-word;
}

.item-type-cell {
    text-align: center;
}

.date-cell {
    color: #616161;
    font-size: 0.9rem;
}

.info-cell {
    text-align: center;
}

/* Drag and Drop Styles */
.draggable-row {
    cursor: move;
}

.draggable-row:hover {
    background: rgba(25, 118, 210, 0.05);
}

.drag-over-row {
    background: rgba(255, 193, 7, 0.15) !important;
    border: 2px dashed #ffc107 !important;
}

.drag-over-row td {
    background: transparent !important;
}

/* File Types Container */
.file-types-container {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: center;
}

.file-type-chip {
    font-weight: 500;
}

/* Action Buttons in Table */
.action-buttons-cell {
    display: flex;
    gap: 0.25rem;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
}

.action-btn-small {
    transition: all 0.2s ease;
}

.action-btn-small:hover {
    transform: scale(1.1);
}

/* Responsive Design */
@media (max-width: 768px) {
    .breadcrumb-navigation {
        padding: 0.75rem 1rem;
        margin-bottom: 1rem;
    }

    .folder-breadcrumbs {
        font-size: 0.85rem;
    }

    .action-buttons-section {
        flex-direction: column;
        align-items: stretch;
    }

    .primary-actions,
    .secondary-actions {
        width: 100%;
    }

    .new-folder-btn {
        width: 100%;
    }

    .folder-dialog,
    .move-dialog {
        min-width: 90vw;
    }

    .item-info {
        padding: 0.25rem;
    }

    .item-name {
        font-size: 0.9rem;
    }

    .item-description {
        font-size: 0.8rem;
    }

    .file-types-container {
        justify-content: flex-start;
    }

    .action-buttons-cell {
        gap: 0.5rem;
    }
}

@media (max-width: 480px) {
    .breadcrumb-navigation {
        padding: 0.5rem;
    }

    .folder-breadcrumbs {
        font-size: 0.75rem;
    }

    .action-btn-small {
        width: 32px;
        height: 32px;
    }
}
</style>
