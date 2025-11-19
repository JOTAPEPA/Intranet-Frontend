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
                    <div class="action-buttons-section">
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
                                                    class="folder-selector q-mb-md"
                                                >
                                                    <template v-slot:prepend>
                                                        <q-icon name="folder" color="blue-7" />
                                                    </template>
                                                    <template v-slot:hint>
                                                        Selecciona dónde alojar el documento
                                                    </template>
                                                </q-select>
                                            </div>
                                            
                                            <q-input 
                                                v-model="documentTitle" 
                                                label="Título del documento *" 
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
                                            <q-icon name="search" color="blue-7" />
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
                </q-dialog>                <!-- Upload Dialog -->
                <div class="q-pa-md q-gutter-sm">
                    <q-dialog v-model="dialog" :backdrop-filter="backdropFilter">
                        <q-card class="dialog-card upload-modal">
                            <q-card-section class="dialog-header">
                                <div class="dialog-title">
                                    <q-icon name="cloud_upload" size="1.5rem" />
                                    <h6>Subir Documento de Talento Humano</h6>
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
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { getData } from '../services/apiClient.js'
import { useAuth } from '../stores/store.js'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import DepartmentChip from '../components/DepartmentChip.vue'

const router = useRouter()
const route = useRoute()

// ⭐ Configuración de la API
const API_BASE_URL = 'http://localhost:5000/api/talento-humano'

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
const selectedUploadFolder = ref('/') // Carpeta seleccionada para subida

// Referencia al input de archivo
const fileInput = ref(null)

// Estado para saber si se están agregando más archivos
const isAddingMoreFiles = ref(false)

// Estados para búsqueda
const searchTerm = ref('')

// Estados para el modal de vista de documentos
const viewDocumentDialog = ref(false)
const selectedDocumentForView = ref(null)

// ⭐ Estados para el gestor de carpetas
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
    isAddingMoreFiles.value = false
    selectedUploadFolder.value = getCurrentPathString() // Mantener carpeta actual
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
function triggerFileSelection(addingMore = false) {
    if (fileInput.value) {
        isAddingMoreFiles.value = addingMore
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
    } else if (selectedFiles.value.length === 1) {
        documentTitle.value = selectedFiles.value[0].name.replace(/\.[^/.]+$/, "")
    } else {
        documentTitle.value = `${selectedFiles.value.length} documentos seleccionados`
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
        
        // ⭐ IMPORTANTE: Agregar folderPath de la carpeta actual o seleccionada
        const targetFolder = selectedUploadFolder.value || getCurrentPathString()
        formData.append('folderPath', targetFolder)
        
        console.log('📤 Subiendo archivos de talento humano:', {
            cantidad: selectedFiles.value.length,
            archivos: selectedFiles.value.map(file => ({
                nombre: file.name,
                tipo: file.type,
                tamaño: file.size
            })),
            titulo: documentTitle.value,
            carpeta: targetFolder
        })
        
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
 * Obtiene el color del archivo según su extensión (específica del nuevo modal)
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

/**
 * Maneja el logout del usuario
 */
function handleLogout() {
    const authStore = useAuth()
    authStore.logOut()
    router.push('/')
}

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
    if (!folderStructure.value || Object.keys(folderStructure.value).length === 0) {
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
    return folderStructure.value[path] || folderStructure.value['/']
}

/**
 * Obtiene todos los items (carpetas y documentos) de la carpeta actual
 */
function getCurrentFolderItems() {
    const currentFolder = getCurrentFolder()
    const items = []
    
    if (!currentFolder) return []
    
    // Agregar subcarpetas
    const children = currentFolder.children || {}
    Object.values(children).forEach(childPath => {
        const childFolder = folderStructure.value[childPath]
        if (childFolder) {
            items.push({ ...childFolder, itemType: 'folder' })
        }
    })
    
    // Agregar documentos
    const folderDocuments = currentFolder.documents || []
    if (Array.isArray(rows.value)) {
        rows.value.forEach(doc => {
            if (folderDocuments.includes(doc._id)) {
                items.push({ ...doc, itemType: 'document' })
            }
        })
    }
    
    return items
}

/**
 * Crear carpeta
 */
async function createFolder(name, parentPath = null) {
    if (!name || name.trim() === '') {
        showNotification('negative', 'Nombre inválido', 'El nombre de la carpeta no puede estar vacío')
        return false
    }
    
    try {
        const response = await axios.post(`${API_BASE_URL}/folders`, {
            name: name.trim(),
            parentPath: parentPath || getCurrentPathString()
        })
        
        if (response.data.success) {
            showNotification('positive', 'Carpeta creada', `Carpeta "${name.trim()}" creada exitosamente`)
            await initializeFolderStructure()
            return true
        } else {
            showNotification('negative', 'Error', response.data.message)
            return false
        }
    } catch (error) {
        showNotification('negative', 'Error al crear carpeta', error.response?.data?.message || 'No se pudo conectar')
        return false
    }
}

/**
 * Eliminar carpeta
 */
async function deleteFolder(folderPath) {
    const folder = folderStructure.value[folderPath]
    
    if (!folder || folderPath === '/') {
        showNotification('negative', 'Error', 'No se puede eliminar esta carpeta')
        return false
    }
    
    const hasChildren = Object.keys(folder.children || {}).length > 0
    const hasDocuments = (folder.documents || []).length > 0
    
    if (hasChildren || hasDocuments) {
        showNotification('negative', 'Carpeta no vacía', 'Solo se pueden eliminar carpetas vacías')
        return false
    }
    
    if (!confirm(`¿Eliminar la carpeta "${folder.name}"?`)) return false
    
    try {
        const response = await axios.delete(`${API_BASE_URL}/folders/${encodeURIComponent(folderPath)}`)
        
        if (response.data.success) {
            showNotification('positive', 'Carpeta eliminada', `Carpeta "${folder.name}" eliminada`)
            if (getCurrentPathString() === folderPath) {
                navigateToFolder(folder.parent || '/')
            }
            await initializeFolderStructure()
            return true
        }
    } catch (error) {
        showNotification('negative', 'Error', error.response?.data?.message || 'No se pudo eliminar')
    }
    return false
}

/**
 * Navegar a carpeta
 */
function navigateToFolder(folderPath) {
    if (folderPath === '/') {
        currentFolderPath.value = []
    } else {
        const cleanPath = folderPath.replace(/^\/|\/$/g, '')
        currentFolderPath.value = cleanPath ? cleanPath.split('/') : []
    }
}

/**
 * Navegar hacia atrás
 */
function navigateUp() {
    if (currentFolderPath.value.length > 0) {
        currentFolderPath.value.pop()
    }
}

/**
 * Navegar desde breadcrumb
 */
function navigateToBreadcrumb(index) {
    currentFolderPath.value = currentFolderPath.value.slice(0, index + 1)
}

/**
 * Obtener ruta de breadcrumb
 */
function getBreadcrumbTrail() {
    const trail = [{ name: 'Documentos', path: '/', index: -1 }]
    currentFolderPath.value.forEach((folder, index) => {
        const path = '/' + currentFolderPath.value.slice(0, index + 1).join('/') + '/'
        trail.push({ name: folder, path, index })
    })
    return trail
}

/**
 * Mover documento
 */
async function moveDocumentToFolder(documentId, targetFolderPath) {
    try {
        const response = await axios.put(`${API_BASE_URL}/${documentId}/move`, {
            targetFolderPath
        })
        
        if (response.data.success) {
            showNotification('positive', 'Documento movido', 'Documento movido exitosamente')
            await loadDocuments()
            await initializeFolderStructure()
            return true
        }
    } catch (error) {
        showNotification('negative', 'Error', error.response?.data?.message || 'No se pudo mover')
    }
    return false
}

/**
 * Carpetas disponibles
 */
function getAvailableFolders() {
    const currentDocumentFolder = selectedDocumentToMove.value?.folderPath
    
    return Object.values(folderStructure.value)
        .filter(folder => folder.type === 'folder' && folder.path !== currentDocumentFolder)
        .map(folder => ({
            label: folder.path === '/' ? 'Documentos (Raíz)' : folder.name,
            value: folder.path,
            path: folder.path
        }))
        .sort((a, b) => a.path.localeCompare(b.path))
}

/**
 * Confirmar crear carpeta
 */
async function confirmCreateFolder() {
    const success = await createFolder(newFolderName.value)
    if (success) {
        newFolderName.value = ''
        showCreateFolderDialog.value = false
    }
}

/**
 * Iniciar mover documento
 */
function startMoveDocument(document) {
    selectedDocumentToMove.value = document
    selectedDestinationFolder.value = null
    showMoveItemsDialog.value = true
}

/**
 * Cancelar mover
 */
function cancelMoveDocument() {
    selectedDocumentToMove.value = null
    selectedDestinationFolder.value = null
    showMoveItemsDialog.value = false
}

/**
 * Confirmar mover
 */
async function confirmMoveDocument() {
    if (selectedDocumentToMove.value && selectedDestinationFolder.value) {
        const success = await moveDocumentToFolder(selectedDocumentToMove.value._id, selectedDestinationFolder.value)
        if (success) cancelMoveDocument()
    }
}

// Drag & Drop
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

function onDragOver(event, folderPath) {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    dragOverFolder.value = folderPath
}

function onDragLeave(folderPath) {
    if (dragOverFolder.value === folderPath) {
        dragOverFolder.value = null
    }
}

async function onDrop(event, folderPath) {
    event.preventDefault()
    dragOverFolder.value = null
    
    try {
        const data = JSON.parse(event.dataTransfer.getData('application/json'))
        if (data.type === 'document') {
            await moveDocumentToFolder(data.id, folderPath)
        }
    } catch (error) {
        showNotification('negative', 'Error', 'No se pudo mover el documento')
    }
}

// Función para obtener datos cuando el componente se monta
onMounted(async () => {
    await initializeFolderStructure()
    await getDocuments()
    if (route?.query?.upload === '1' || route?.query?.upload === 'true') {
        openDialog()
    }
})

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
        align-self: flex-end;    }
}

/* ===== CSS específico para el nuevo modal upload ===== */
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

/* Estilos para la sección de archivos seleccionados basado en imágenes */
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
    max-height: 300px;
    overflow-y: auto;
    padding: 0.5rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background: #fff;
}

.file-card {
    position: relative;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 1rem;
    min-height: 120px;
    display: flex;
    flex-direction: column;
    transition: all 0.2s ease;
}

.file-card:hover {
    border-color: #1976d2;
    background: rgba(25, 118, 210, 0.02);
}

.file-card-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    position: relative;
}

.file-remove-btn {
    position: absolute;
    top: -0.5rem;
    right: -0.5rem;
    background: white;
    border: 1px solid #e2e8f0;
    z-index: 2;
}

.file-icon-section {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1;
    margin: 0.5rem 0;
}

.file-main-icon {
    opacity: 0.8;
}

.file-details-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: auto;
}

.file-name-row {
    text-align: center;
}

.file-name-display {
    font-size: 0.8rem;
    font-weight: 500;
    color: #333;
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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

/* Metadatos del documento */
.metadata-form {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid #e2e8f0;
}

/* Progreso y resultados con mejor diseño */
.upload-progress {
    text-align: center;
    padding: 2rem;
}

.progress-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

.progress-title {
    margin: 0;
    font-size: 1.2rem;
    color: #1976d2;
    font-weight: 600;
}

.progress-text {
    margin: 0;
    color: #666;
    font-size: 0.9rem;
}

.progress-bar {
    width: 100%;
    max-width: 300px;
}

.progress-percentage {
    margin: 0;
    font-weight: 600;
    color: #1976d2;
    font-size: 1.1rem;
}

.upload-result {
    text-align: center;
    padding: 2rem;
}

.success-result, .error-result {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

.result-icon {
    opacity: 0.9;
}

.result-title {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 600;
}

.success-result .result-title {
    color: #2e7d32;
}

.error-result .result-title {
    color: #c62828;
}

.result-text {
    margin: 0;
    color: #666;
    font-size: 0.95rem;
    line-height: 1.4;
}

/* Responsive para el modal */
@media (max-width: 768px) {
    .upload-modal {
        min-width: 320px;
        max-width: 95vw;
        max-height: 90vh;
    }
    
    .upload-modal .dialog-content {
        padding: 1.5rem;
        max-height: 60vh;
    }
    
    .files-display-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 0.75rem;
        max-height: calc((160px + 0.75rem) * 2);
    }
    
    .file-card {
        min-height: 140px;
        padding: 0.75rem;
    }
    
    .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }
    
    .header-actions {
        align-self: stretch;
        justify-content: space-between;
        width: 100%;
    }
}

@media (max-width: 480px) {
    .files-display-grid {
        grid-template-columns: 1fr;
        gap: 0.5rem;
    }
    
    .upload-modal .dialog-content {
        padding: 1rem;
    }
    
    .upload-placeholder {
        padding: 1.5rem;
        gap: 0.75rem;
    }
    
    .upload-text {
        font-size: 0.9rem;
    }
    
    .upload-hint {
        font-size: 0.8rem;
    }
    
    .progress-title {
        font-size: 1.1rem;
    }
    
    .result-title {
        font-size: 1.1rem;
    }
}

/* ========== ESTILOS DEL GESTOR DE CARPETAS ========== */

/* Navegación breadcrumb */
.breadcrumb-navigation {
    background: var(--white);
    padding: 1rem 1.5rem;
    border-radius: 12px;
    margin-bottom: 1rem;
    box-shadow: var(--shadow);
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
    text-transform: none;
    font-weight: 500;
    color: var(--text-secondary);
    transition: all 0.2s ease;
}

.breadcrumb-item:hover {
    color: var(--primary-blue);
    background: var(--primary-light);
}

.breadcrumb-item.current-crumb {
    color: var(--primary-blue);
    font-weight: 600;
}

.breadcrumb-separator {
    margin: 0 0.25rem;
}

.breadcrumb-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

/* Carpetas en la tabla */
.item-name-cell {
    padding: 0.5rem 0;
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
}

.item-name {
    font-weight: 500;
    color: var(--text-primary);
}

.clickable-item {
    cursor: pointer;
    transition: color 0.2s ease;
}

.clickable-item:hover {
    color: var(--primary-blue);
}

.item-files-count {
    font-size: 0.75rem;
    color: var(--text-secondary);
}

.no-files-text {
    font-size: 0.75rem;
    color: var(--text-tertiary);
}

/* Drag & Drop */
.table-row.drag-over {
    background-color: var(--primary-light) !important;
    border-left: 3px solid var(--primary-blue);
}

.draggable-document {
    cursor: move;
}

.draggable-document:active {
    opacity: 0.6;
}

/* Modal crear carpeta */
.folder-creation-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.current-location {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: var(--light-gray);
    border-radius: 8px;
}

.location-text {
    font-weight: 500;
    color: var(--text-secondary);
}

.location-path {
    font-weight: 600;
    color: var(--primary-blue);
}

.creation-hint {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: var(--text-secondary);
    padding: 0.5rem;
    background: var(--info-light);
    border-radius: 8px;
}

/* Modal mover documento */
.move-document-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.document-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    background: var(--light-gray);
    border-radius: 8px;
}

.document-name {
    font-weight: 600;
    color: var(--text-primary);
}

.destination-selection {
    width: 100%;
}

.move-hint {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: var(--text-secondary);
    padding: 0.5rem;
    background: var(--info-light);
    border-radius: 8px;
}

/* Selector de carpeta en upload */
.folder-destination-section {
    margin-bottom: 1rem;
}

.folder-selector {
    width: 100%;
}

/* Estilos action buttons section */
.action-buttons-section {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
}

.primary-actions {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
}
</style>