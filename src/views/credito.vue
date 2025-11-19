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
                        <h4 class="page-title">Crédito</h4>
                        <p class="page-subtitle">Gestiona Documentos de Crédito</p>
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

                <!-- Action Section --> 
                <div class="q-pa-md q-gutter-sm">
                    <div class="action-buttons-section">
                        <!-- Botones principales -->
                        <div class="primary-actions">
                            <q-btn 
                                v-for="filter in backdropFilterList" 
                                :key="filter.label" 
                                color="primary"
                                :label="filter.label" 
                                no-caps 
                                @click="filter.onClick" 
                                icon="cloud_upload" 
                                style="padding: 12px; border-radius: 15px;"
                            />
                            
                            <q-btn
                                color="secondary"
                                label="Nueva Carpeta"
                                icon="create_new_folder"
                                @click="showCreateFolderDialog = true"
                                outline
                                no-caps
                                style="padding: 12px; border-radius: 15px;"
                            >
                                <q-tooltip>Crear nueva carpeta</q-tooltip>
                            </q-btn>
                        </div>
                    </div>
                </div>

                <!-- Data Table -->
                <div class="table-container">
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
                                    <h5 class="table-title">Documentos de Crédito</h5>
                                </div>
                                 <DepartmentChip 
                                        department-key="credito" 
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
                                                @click="downloadDocumentsSimple(props.row)"
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
                            <div class="full-width row flex-center q-gutter-sm text-center">
                                <div class="no-data-content">
                                    <q-icon size="3em" name="description" color="grey-5" />
                                    <div>
                                        <h6 class="q-mt-sm q-mb-xs">No hay documentos disponibles</h6>
                                        <p class="text-grey-6">
                                            {{ searchTerm ? 'No se encontraron documentos que coincidan con tu búsqueda' : 'Comienza subiendo tu primer documento' }}
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
                                    <h6>Subir Documento de Crédito</h6>
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
                                        <!-- Selector de carpeta destino -->
                                        <div class="folder-destination-section">
                                            <q-select
                                                v-model="selectedUploadFolder"
                                                :options="getAvailableFolders()"
                                                label="Carpeta destino"
                                                outlined
                                                dense
                                                option-label="label"
                                                option-value="value"
                                                emit-value
                                                map-options
                                                class="folder-selector"
                                            >
                                                <template v-slot:prepend>
                                                    <q-icon name="folder" color="blue-7" />
                                                </template>
                                                <template v-slot:hint>
                                                    Selecciona dónde alojar el documento
                                                </template>
                                            </q-select>
                                        </div>
                                        
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
                                            <q-icon name="cloud_upload" size="2rem" color="blue-7" />
                                            <p class="progress-text">
                                                {{ selectedFiles.length === 1 
                                                    ? 'Subiendo archivo...' 
                                                    : `Subiendo archivos individuales...` 
                                                }}
                                            </p>
                                            <q-linear-progress 
                                                :value="uploadProgress / 100" 
                                                color="blue-7" 
                                                size="8px"
                                                class="q-mt-md"
                                            />
                                            <p class="progress-percentage">{{ uploadProgress }}%</p>
                                            <p v-if="selectedFiles.length > 1" class="progress-detail">
                                                Cada archivo se guarda como documento independiente
                                            </p>
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
                                <q-btn 
                                    flat 
                                    label="Cancelar" 
                                    color="grey-7" 
                                    @click="closeDialog"
                                />
                                <q-btn 
                                    v-if="selectedFiles.length > 0 && !isUploading && !uploadResult"
                                    unelevated 
                                    :label="`Subir ${selectedFiles.length} Archivo${selectedFiles.length > 1 ? 's' : ''}`" 
                                    color="primary" 
                                    @click="uploadFiles"
                                    :disabled="!documentTitle"
                                    icon="cloud_upload"
                                />
                               
                            </q-card-actions>
                        </q-card>
                    </q-dialog>
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
                                    <div 
                                        v-for="file in selectedDocumentForView.archivos" 
                                        :key="file.id"
                                        class="file-item"
                                    >
                                        <div class="file-item-info">
                                            <q-icon 
                                                :name="getFileIconByName(file.nombre)" 
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
                                                color="blue-7"
                                                icon="open_in_new"
                                                size="sm"
                                                @click="openFileInNewTab(file)"
                                            >
                                                <q-tooltip>Abrir en nueva pestaña</q-tooltip>
                                            </q-btn>
                                            <q-btn
                                                flat
                                                round
                                                color="green-7"
                                                icon="download"
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
                                v-if="selectedDocumentForView?.archivos?.length > 0"
                                unelevated 
                                label="Descargar Todos" 
                                color="primary" 
                                icon="download"
                                @click="downloadDocumentsSimple(selectedDocumentForView)"
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
                                @click="cancelMoveDocument"
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
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '../stores/store.js'
import { useRouter } from 'vue-router'
import { getData } from '../services/apiClient.js'
import axios from 'axios'
import DepartmentChip from '../components/DepartmentChip.vue'

const router = useRouter()

// ⭐ URL base del API para crédito
const API_BASE_URL = 'http://localhost:5000/api/credito'

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
const currentUploadIndex = ref(0)
const totalFiles = ref(0)
const isAddingMoreFiles = ref(false)

// Estados para metadatos del documento
const documentTitle = ref('')
const documentDescription = ref('')
const selectedUploadFolder = ref('/') // Carpeta seleccionada para subida

// Referencia al input de archivo
const fileInput = ref(null)

// Estados para el gestor de carpetas
const currentView = ref('folders') // Vista principal es siempre carpetas
const currentFolderPath = ref([]) // Array de carpetas para navegación
const folderStructure = ref({}) // Estructura jerárquica de carpetas
const selectedItems = ref([]) // Items seleccionados para operaciones
const showCreateFolderDialog = ref(false)
const newFolderName = ref('')
const dragOverFolder = ref(null)

// Diálogos específicos del gestor de carpetas
const showFolderOptionsDialog = ref(false)
const selectedFolder = ref(null)
const showMoveItemsDialog = ref(false)
const availableFolders = ref([])
const selectedDocumentToMove = ref(null)
const selectedDestinationFolder = ref(null)

// Reglas de validación para nombres de carpetas
const folderNameRules = [
    val => !!val || 'El nombre es requerido',
    val => val.length <= 50 || 'Máximo 50 caracteres',
    val => !/[<>:"/\\|?*]/.test(val) || 'Caracteres no permitidos'
]

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
            const tipos = [...new Set(row.documentos.map(doc => (doc.originalName || doc.fileName).split('.').pop()?.toLowerCase()))];
            return tipos.filter(tipo => tipo && tipo !== 'desconocido').join(', ') || 'Desconocido';
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

// Columnas específicas para la vista de carpetas
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
            // Para documentos, obtener tipos de archivos
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
                
                // Mostrar conteo por tipo si hay múltiples archivos
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
const documentStats = ref({
    totalDocumentos: 0,
    totalArchivos: 0,
    documentosConArchivos: 0,
    documentosSinArchivos: 0,
    tamaño: '0 Bytes'
})

// Estados para búsqueda
const searchTerm = ref('')
const loading = ref(false)

// Estados para el modal de vista de documentos
const viewDocumentDialog = ref(false)
const selectedDocumentForView = ref(null)

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

async function goHome () {
    await router.push("/home")
 
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
    totalFiles.value = 0
    currentUploadIndex.value = 0
    isUploading.value = false
    uploadProgress.value = 0
    uploadResult.value = null
    isDragOver.value = false
    documentTitle.value = ''
    documentDescription.value = ''
    // Mantener la carpeta actual como destino por defecto
    selectedUploadFolder.value = getCurrentPathString()
}

/**
 * Maneja la selección de archivos múltiples
 */
function onFileSelect(event) {
    const files = Array.from(event.target.files)
    if (files.length > 0) {
        handleFilesSelection(files, isAddingMoreFiles.value)
        isAddingMoreFiles.value = false // Reset el estado
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
 * Procesa múltiples archivos seleccionados con validación mejorada
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
            // Para múltiples archivos, usar un título genérico que se puede editar
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
    totalFiles.value = 0
    currentUploadIndex.value = 0
    documentTitle.value = ''
    documentDescription.value = ''
    if (fileInput.value) {
        fileInput.value.value = ''
    }
}

/**
 * Remueve un archivo individual de la selección
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
 * Activa la selección de archivos programáticamente
 */
function triggerFileSelection() {
    if (fileInput.value) {
        isAddingMoreFiles.value = true
        fileInput.value.click()
    }
}

/**
 * Sube múltiples archivos usando FormData - cada archivo como documento individual
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
        
        console.log('📤 Subiendo archivos individuales a crédito:', {
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
                
                // ⭐ IMPORTANTE: Agregar folderPath de la carpeta actual o seleccionada
                const targetFolder = selectedUploadFolder.value || getCurrentPathString()
                formData.append('folderPath', targetFolder)
                
                console.log(`📄 Subiendo archivo ${index + 1}/${totalFiles}:`, file.name, 'a carpeta:', targetFolder)
                
                // Subir el archivo individual
                const response = await axios.post(
                    API_BASE_URL,
                    formData,
                    {
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
            
            // ⭐ Recargar estructura de carpetas desde el backend
            // El backend ya asignó los documentos a la carpeta correcta
            await initializeFolderStructure()
            console.log(`✅ ${successfulUploads} documento(s) subido(s) exitosamente`)

        } else if (successfulUploads > 0) {
            // Algunos archivos fallaron
            uploadResult.value = {
                success: false,
                error: `${successfulUploads} archivo(s) subido(s), ${failedUploads.length} fallido(s)`,
                details: failedUploads
            }
            
            showNotification('negative', 'Subida parcialmente exitosa', 
                `${successfulUploads} archivo(s) subido(s), ${failedUploads.length} fallido(s)`)
        } else {
            // Todos fallaron
            uploadResult.value = {
                success: false,
                error: 'Todos los archivos fallaron al subirse',
                details: failedUploads
            }
            
            showNotification('negative', 'Error en la subida', 'Todos los archivos fallaron al subirse')
        }
        
        await getDocuments()
        
        setTimeout(() => {
            if (uploadResult.value.success) {
                closeDialog()
            }
        }, 1500)

    } catch (error) {
        console.error('❌ Error general en uploadFiles:', error)
        uploadResult.value = {
            success: false,
            error: error.response?.data?.message || 'Error de conexión'
        }
        showNotification('negative', 'Error al subir archivos', error.response?.data?.message || 'No se pudo conectar con el servidor')
    } finally {
        isUploading.value = false
    }
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
 * Obtiene el color del texto para el tipo de archivo
 */
function getFileTypeTextColor(fileName) {
    return 'white'
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
        const allDocuments = await getData('/credito');
        
        if (allDocuments && Array.isArray(allDocuments)) {
            const filteredDocuments = allDocuments.filter(doc => {
                if (doc.documento && doc.documento.toLowerCase().includes(searchTermLower)) {
                    return true;
                }
                if (doc.documentos && doc.documentos.length > 0) {
                    return doc.documentos.some(archivo => 
                        (archivo.originalName && archivo.originalName.toLowerCase().includes(searchTermLower)) ||
                        (archivo.fileName && archivo.fileName.toLowerCase().includes(searchTermLower))
                    );
                }
                return false;
            });
            
            rows.value = filteredDocuments.map(doc => ({
                ...doc,
                tieneArchivos: doc.documentos && doc.documentos.length > 0,
                cantidadArchivos: doc.documentos ? doc.documentos.length : 0,
                tiposArchivos: doc.documentos ? doc.documentos.map(archivo => archivo.originalName || archivo.fileName) : [],
                archivos: doc.documentos ? doc.documentos.map(archivo => ({
                    id: archivo._id,
                    nombre: archivo.originalName || archivo.fileName,
                    url: archivo.downloadURL,
                    tamaño: formatFileSize(archivo.size),
                    formato: archivo.originalName ? archivo.originalName.split('.').pop()?.toLowerCase() : '',
                    fechaSubida: new Date(archivo.uploadDate).toLocaleDateString('es-ES'),
                    firebaseRef: archivo.firebaseRef
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
async function downloadSingleFile(file) {
    try {
        // Usar la URL directa de Firebase si está disponible
        if (file.url) {
            const link = document.createElement('a')
            link.href = file.url
            link.download = file.nombre
            link.target = '_blank'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } else {
            showNotification('negative', 'Error en descarga', 'URL de descarga no disponible')
        }
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
 * Obtiene la extensión del archivo
 */
function getFileExtension(fileName) {
    if (!fileName) return ''
    const extension = fileName.split('.').pop()?.toLowerCase()
    return extension || ''
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
 * Descargar documentos usando Firebase URLs
 */
async function downloadDocumentsSimple(documentData) {
    if (!documentData.tieneArchivos) {
        showNotification('negative', 'Sin archivos', 'Este documento no tiene archivos para descargar')
        return
    }

    console.log('🔽 Iniciando descarga para documento:', documentData); // Debug

    try {
        // Método 1: Usar URLs directas de Firebase si están disponibles
        if (documentData.archivos && documentData.archivos.length > 0) {
            for (const [index, archivo] of documentData.archivos.entries()) {
                console.log(`📁 Descargando archivo ${index + 1}:`, archivo); // Debug
                
                if (archivo.url) {
                    // URL directa disponible
                    const link = document.createElement('a')
                    link.href = archivo.url
                    link.download = archivo.nombre
                    link.target = '_blank'
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                    
                    console.log(`✅ Descarga iniciada para: ${archivo.nombre}`); // Debug
                } else {
                    // Intentar con endpoint del backend
                    try {
                        const response = await fetch(`http://localhost:5000/api/credito/${documentData._id}/file/${index}/download`)
                        
                        if (response.ok) {
                            // Si el backend redirige, seguir la redirección
                            const finalUrl = response.url
                            const link = document.createElement('a')
                            link.href = finalUrl
                            link.download = archivo.nombre
                            link.target = '_blank'
                            document.body.appendChild(link)
                            link.click()
                            document.body.removeChild(link)
                            
                            console.log(`✅ Descarga vía backend para: ${archivo.nombre}`); // Debug
                        } else {
                            console.error(`❌ Error en descarga backend para archivo ${index}:`, response.status)
                        }
                    } catch (backendError) {
                        console.error(`❌ Error endpoint backend para archivo ${index}:`, backendError)
                    }
                }
                
                // Pausa entre descargas
                if (index < documentData.archivos.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 500))
                }
            }
            
 
        } else {
            showNotification('negative', 'Sin archivos', 'No se encontraron archivos para descargar')
        }
    } catch (error) {
        console.error('❌ Error general en descarga:', error)
        showNotification('negative', 'Error en descarga', 'No se pudieron descargar los archivos')
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
        const response = await axios.delete(`${API_BASE_URL}/${document._id}`);
        
        if (response.data && response.data.success !== false) {
            showNotification('positive', 'Documento eliminado', 'El documento y todos sus archivos han sido eliminados correctamente');
            await loadDocuments();
            
            // ⭐ Recargar estructura de carpetas desde el backend
            await initializeFolderStructure();
        } else {
            throw new Error(response.data?.message || 'Error en la respuesta del servidor');
        }
    } catch (error) {
        console.error('❌ Error eliminando documento:', error);
        showNotification('negative', 'Error al eliminar', error.response?.data?.message || error.message || 'No se pudo eliminar el documento');
    } finally {
        loading.value = false;
    }
}

async function getDocuments() {
    try {
        loading.value = true;
        const response = await axios.get(API_BASE_URL);
        
        console.log('📊 Respuesta del backend:', response.data); // Debug
        
        // Manejar ambos formatos de respuesta: { success: true, data: [...] } o directamente [...]
        const documents = response.data?.data || response.data;
        
        if (documents && Array.isArray(documents)) {
            rows.value = documents.map(doc => {
                console.log('📄 Documento:', doc); // Debug
                return {
                    ...doc,
                    tieneArchivos: doc.documentos && doc.documentos.length > 0,
                    cantidadArchivos: doc.documentos ? doc.documentos.length : 0,
                    tiposArchivos: doc.documentos ? doc.documentos.map(archivo => archivo.originalName || archivo.fileName) : [],
                    archivos: doc.documentos ? doc.documentos.map(archivo => {
                        console.log('📁 Archivo:', archivo); // Debug
                        return {
                            id: archivo._id,
                            nombre: archivo.originalName || archivo.fileName,
                            url: archivo.downloadURL,
                            tamaño: formatFileSize(archivo.size),
                            formato: archivo.originalName ? archivo.originalName.split('.').pop()?.toLowerCase() : '',
                            fechaSubida: new Date(archivo.uploadDate).toLocaleDateString('es-ES'),
                            firebaseRef: archivo.firebaseRef
                        };
                    }) : []
                };
            });
            calculateStats();
        } else {
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
    const totalBytes = rows.value.reduce((total, doc) => {
        return total + (doc.documentos ? doc.documentos.reduce((docTotal, archivo) => docTotal + (archivo.size || 0), 0) : 0);
    }, 0);
    
    documentStats.value = {
        totalDocumentos,
        totalArchivos,
        documentosConArchivos,
        documentosSinArchivos: totalDocumentos - documentosConArchivos,
        tamaño: formatFileSize(totalBytes)
    };
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



onMounted(async () => {
    console.log('🚀 Inicializando vista de crédito...')
    
    // Cargar estructura de carpetas desde el backend
    await initializeFolderStructure()
    
    // Cargar documentos
    await loadDocuments()
    
    console.log('✅ Vista de crédito inicializada')
});

// ========== FUNCIONES DEL GESTOR DE CARPETAS ==========

/**
 * Inicializa la estructura de carpetas desde el backend
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
    // ⭐ Si la estructura no está cargada, retornar carpeta raíz por defecto
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
    
    // Validar que currentFolder existe y tiene la estructura esperada
    if (!currentFolder) {
        console.warn('⚠️ No se pudo obtener la carpeta actual')
        return []
    }
    
    // Agregar subcarpetas
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
    
    // Agregar documentos asignados a esta carpeta
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
async function createFolder(name, parentPath = null) {
    if (!name || name.trim() === '') {
        showNotification('negative', 'Nombre inválido', 'El nombre de la carpeta no puede estar vacío')
        return false
    }
    
    const trimmedName = name.trim()
    const currentPath = parentPath || getCurrentPathString()
    
    try {
        console.log('📤 Creando carpeta:', { name: trimmedName, parentPath: currentPath })
        
        const response = await axios.post(`${API_BASE_URL}/folders`, {
            name: trimmedName,
            parentPath: currentPath
        })
        
        if (response.data.success) {
            showNotification('positive', 'Carpeta creada', `Carpeta "${trimmedName}" creada exitosamente`)
            console.log('✅ Carpeta creada:', response.data.data)
            
            // Recargar estructura desde el backend
            await initializeFolderStructure()
            
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
    
    // Verificar que la carpeta esté vacía
    const hasChildren = Object.keys(folder.children || {}).length > 0
    const hasDocuments = (folder.documents || []).length > 0
    
    if (hasChildren || hasDocuments) {
        showNotification('negative', 'Carpeta no vacía', 'Solo se pueden eliminar carpetas vacías')
        return false
    }
    
    // Confirmar eliminación
    const confirmDelete = confirm(`¿Estás seguro de que quieres eliminar la carpeta "${folder.name}"?`)
    if (!confirmDelete) return false
    
    try {
        console.log('📤 Eliminando carpeta:', folderPath)
        
        const encodedPath = encodeURIComponent(folderPath)
        const response = await axios.delete(`${API_BASE_URL}/folders/${encodedPath}`)
        
        if (response.data.success) {
            showNotification('positive', 'Carpeta eliminada', `Carpeta "${folder.name}" eliminada exitosamente`)
            console.log('✅ Carpeta eliminada')
            
            // Si estábamos en esa carpeta, navegar al padre
            if (getCurrentPathString() === folderPath) {
                navigateToFolder(folder.parent || '/')
            }
            
            // Recargar estructura desde el backend
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
        // Convertir path a array (eliminar / inicial y final, split por /)
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
            
            // Recargar documentos y estructura
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
    // Obtener la carpeta actual del documento seleccionado (solo aplica al mover documentos)
    const currentDocumentFolder = selectedDocumentToMove.value?.folderPath
    
    return Object.values(folderStructure.value)
        .filter(folder => {
            // Filtrar solo carpetas
            if (folder.type !== 'folder') return false
            
            // Si hay un documento siendo movido, excluir su carpeta actual
            if (currentDocumentFolder && folder.path === currentDocumentFolder) return false
            
            return true
        })
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
function onDrop(event, folderPath) {
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
    
    .table-header-section {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
        padding: 1rem;
    }
    
    .search-input {
        max-width: 100%;
        min-width: auto;
        width: 100%;
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

/* Estilos para preview de múltiples archivos */
.files-preview {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-height: 400px;
    overflow-y: auto;
}

.files-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--border-color);
}

.preview-title {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
}

.selected-files-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-height: 200px;
    overflow-y: auto;
    padding: 0.5rem;
    background: var(--light-gray);
    border-radius: 8px;
}

.selected-file-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: var(--white);
    border-radius: 8px;
    border: 1px solid var(--border-color);
    transition: all 0.2s ease;
}

.selected-file-item:hover {
    border-color: var(--primary-blue);
    box-shadow: 0 2px 8px rgba(25, 118, 210, 0.1);
}

.selected-file-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    flex: 1;
    min-width: 0;
}

.selected-file-name {
    font-weight: 500;
    color: var(--text-primary);
    font-size: 0.9rem;
    word-break: break-word;
}

.selected-file-size {
    font-size: 0.8rem;
    color: var(--text-secondary);
}

.upload-hint {
    font-size: 0.8rem;
    color: var(--text-secondary);
    margin: 0.5rem 0 0 0;
    text-align: center;
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

    .selected-files-list {
        max-height: 150px;
    }

    .selected-file-item {
        padding: 0.5rem;
        gap: 0.5rem;
    }

    .selected-file-name {
        font-size: 0.8rem;
    }

    .selected-file-size {
        font-size: 0.7rem;
    }
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
    max-height: calc(60vh - 200px);
    overflow-y: auto;
}

.files-list-container {
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 1rem;
    background: var(--white);
    flex-shrink: 0;
}

.files-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--border-color);
    flex-shrink: 0;
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
    max-height: 180px;
    overflow-y: auto;
    padding-right: 4px;
}

/* Estilos de scrollbar personalizados para mejor UX */
.files-grid::-webkit-scrollbar {
    width: 4px;
}

.files-grid::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
}

.files-grid::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
}

.files-grid::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
}

.upload-modal .dialog-content::-webkit-scrollbar {
    width: 4px;
}

.upload-modal .dialog-content::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
}

.upload-modal .dialog-content::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
}

.upload-modal .dialog-content::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
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

.progress-detail {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin: 0.5rem 0 0 0;
    text-align: center;
    font-style: italic;
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

/* Responsive Styles for Upload Modal */
@media (max-width: 768px) {
    .upload-modal {
        min-width: 320px;
        max-width: 95vw;
        max-height: 95vh;
    }
    
    .upload-modal .dialog-content {
        padding: 1rem;
        max-height: calc(95vh - 140px);
        overflow-y: auto;
    }
    
    .upload-modal .dialog-actions {
        padding: 1rem;
        flex-direction: column;
        gap: 0.75rem;
        flex-shrink: 0;
    }
    
    .upload-modal .dialog-actions .q-btn {
        width: 100%;
        margin: 0;
    }
    
    .upload-modal .files-grid {
        max-height: 120px;
    }
    
    .file-preview {
        max-height: calc(75vh - 180px);
    }
    
    .file-item-preview {
        padding: 0.75rem;
        gap: 0.75rem;
    }
    
    .file-info {
        gap: 0.75rem;
    }
    
    .file-name {
        font-size: 0.9rem;
    }
    
    .file-size {
        font-size: 0.8rem;
    }
    
    .remove-file-btn {
        width: 32px;
        height: 32px;
        min-width: 32px;
    }

    .files-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
    }
    
    .header-buttons {
        align-self: stretch;
        justify-content: space-between;
        width: 100%;
    }

    .metadata-form {
        padding: 0.5rem 0;
    }
}

@media (max-width: 480px) {
    .upload-modal {
        min-width: 300px;
        max-width: 98vw;
        max-height: 98vh;
        margin: 1vh;
    }
    
    .upload-modal .dialog-content {
        padding: 0.75rem;
        max-height: calc(98vh - 120px);
    }
    
    .upload-modal .dialog-actions {
        padding: 0.75rem;
        gap: 0.5rem;
    }
    
    .upload-modal .dialog-header {
        padding: 1rem 0.75rem;
    }
    
    .files-grid {
        max-height: 100px;
        gap: 0.5rem;
    }
    
    .file-preview {
        max-height: calc(85vh - 160px);
        gap: 0.75rem;
    }
    
    .file-item-preview {
        padding: 0.5rem;
        gap: 0.5rem;
    }
    
    .files-header {
        flex-direction: column;
        align-items: stretch;
        text-align: center;
        gap: 0.5rem;
    }
    
    .files-header h6 {
        font-size: 0.9rem;
        margin-bottom: 0;
        text-align: center;
    }
    
    .header-buttons {
        justify-content: center;
        flex-wrap: wrap;
        gap: 0.5rem;
    }
    
    .file-details {
        min-width: 0;
        overflow: hidden;
    }
    
    .file-name {
        font-size: 0.85rem;
        max-width: 200px;
    }
    
    .file-size {
        font-size: 0.75rem;
    }
    
    .remove-file-btn {
        width: 28px;
        height: 28px;
        min-width: 28px;
        flex-shrink: 0;
    }

    .metadata-form .q-input,
    .metadata-form .q-textarea {
        font-size: 0.9rem;
    }

    .upload-area {
        padding: 1rem;
    }

    .upload-text {
        font-size: 0.9rem;
    }

    .upload-hint {
        font-size: 0.8rem;
    }
}

/* Media query específica para asegurar que los botones siempre sean visibles */
@media (max-height: 700px) {
    .upload-modal {
        max-height: 98vh;
    }
    
    .upload-modal .dialog-content {
        max-height: calc(98vh - 130px);
        overflow-y: auto;
    }
    
    .file-preview {
        max-height: calc(60vh - 100px);
    }
    
    .files-grid {
        max-height: 100px;
    }
    
    .metadata-form {
        margin-top: 0.5rem;
    }
}

@media (max-height: 600px) {
    .upload-modal {
        max-height: 99vh;
        margin: 0.5vh;
    }
    
    .upload-modal .dialog-content {
        padding: 0.5rem;
        max-height: calc(99vh - 110px);
    }
    
    .upload-modal .dialog-actions {
        padding: 0.5rem;
        min-height: 50px;
    }
    
    .upload-modal .dialog-header {
        padding: 0.75rem;
        min-height: 60px;
    }
    
    .file-preview {
        max-height: calc(50vh - 80px);
    }
    
    .files-grid {
        max-height: 80px;
    }
    
    .upload-area {
        padding: 1rem;
    }
    
    .upload-progress {
        padding: 1rem;
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

/* ========== ESTILOS DEL GESTOR DE CARPETAS ========== */

/* Sección de botones de acción */
.action-buttons-section {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
}

.primary-actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    align-items: center;
}

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

/* Estilos para items en vista de carpetas */
.item-name-cell {
    max-width: 300px;
}

.item-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
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
    font-weight: 600;
    color: var(--text-primary);
    font-size: 0.95rem;
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
    font-size: 0.8rem;
    color: var(--text-secondary);
    font-style: italic;
}

.item-type-cell {
    text-align: center;
}

.item-type-cell .file-types-container {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    justify-content: center;
    align-items: center;
}

.item-type-cell .file-type-chip {
    font-weight: 500;
    font-size: 0.75rem;
    min-width: 50px;
}

/* Drag and Drop */
.draggable-document {
    cursor: move;
    transition: all 0.2s ease;
}

.draggable-document:hover {
    background: rgba(59, 130, 246, 0.05);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.table-row.drag-over {
    background: rgba(25, 118, 210, 0.1) !important;
    border: 2px dashed #1976d2 !important;
    transform: scale(1.02);
}

/* Estilos para modales de carpetas */
.create-folder-dialog .dialog-card,
.move-items-dialog .dialog-card {
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

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

/* Selector de carpeta destino */
.folder-destination-section {
    margin-bottom: 1rem;
}

.folder-selector {
    background: rgba(59, 130, 246, 0.05);
    border-radius: 8px;
}

.folder-selector .q-field__control {
    background: rgba(255, 255, 255, 0.8);
}

/* Efectos y animaciones */
@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.breadcrumb-navigation {
    animation: slideIn 0.3s ease-out;
}

.table-row {
    transition: all 0.2s ease;
}

.table-row:hover {
    background: var(--light-gray);
    transform: translateY(-1px);
}

/* Responsive para gestor de carpetas */
@media (max-width: 768px) {
    .action-buttons-section {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
    }
    
    .primary-actions {
        justify-content: center;
    }
    
    .breadcrumb-content {
        flex-wrap: wrap;
        gap: 0.5rem;
    }
    
    .breadcrumb-path {
        width: 100%;
        justify-content: center;
    }
    
    .current-location {
        flex-direction: column;
        text-align: center;
        gap: 0.75rem;
    }
    
    .item-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }
}

@media (max-width: 480px) {
    .breadcrumb-item {
        font-size: 0.8rem;
        padding: 0.2rem 0.5rem;
    }
    
    .item-name {
        font-size: 0.85rem;
    }
    
    .location-path {
        font-size: 0.8rem;
        padding: 0.2rem 0.4rem;
    }
    
    .action-buttons-cell {
        min-width: 150px;
    }
}

</style>