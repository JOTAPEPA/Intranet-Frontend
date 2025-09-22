<template>
    <div class="cloudinary-uploader">
        <div class="upload-container">
            <!-- Área de arrastrar y soltar -->
            <div 
                class="drop-zone"
                :class="{ 'drag-over': isDragOver, 'uploading': isUploading }"
                @drop="handleDrop"
                @dragover.prevent
                @dragenter.prevent="isDragOver = true"
                @dragleave.prevent="isDragOver = false"
                @click="openFileDialog"
            >
                <div class="drop-zone-content">
                    <q-icon 
                        :name="isUploading ? 'cloud_upload' : 'cloud_upload'" 
                        size="3rem" 
                        :class="{ 'uploading-icon': isUploading }"
                    />
                    <h6 class="drop-zone-title">
                        {{ isUploading ? 'Subiendo archivos...' : 'Arrastra archivos aquí o haz clic para seleccionar' }}
                    </h6>
                    <p class="drop-zone-subtitle" v-if="!isUploading">
                        Tipos permitidos: {{ allowedTypesText }}
                    </p>
                    <p class="drop-zone-subtitle" v-if="!isUploading">
                        Tamaño máximo: {{ formatFileSize(maxFileSize) }}
                    </p>
                </div>

                <!-- Barra de progreso -->
                <div v-if="isUploading && uploadProgress > 0" class="progress-container">
                    <q-linear-progress 
                        :value="uploadProgress / 100" 
                        color="primary" 
                        size="8px"
                        class="upload-progress"
                    />
                    <span class="progress-text">{{ uploadProgress }}%</span>
                </div>
            </div>

            <!-- Input de archivo oculto -->
            <input
                ref="fileInput"
                type="file"
                :multiple="multiple"
                :accept="acceptedFiles"
                @change="handleFileSelect"
                style="display: none"
            />
        </div>

        <!-- Lista de archivos seleccionados -->
        <div v-if="selectedFiles.length > 0" class="selected-files">
            <h6 class="files-title">Archivos seleccionados:</h6>
            <div class="files-list">
                <div 
                    v-for="(file, index) in selectedFiles" 
                    :key="index" 
                    class="file-item"
                >
                    <div class="file-info">
                        <q-icon 
                            :name="getFileIcon(file.type)" 
                            size="1.5rem" 
                            class="file-icon"
                        />
                        <div class="file-details">
                            <span class="file-name">{{ file.name }}</span>
                            <span class="file-size">{{ formatFileSize(file.size) }}</span>
                        </div>
                    </div>
                    
                    <div class="file-actions">
                        <q-btn 
                            flat 
                            round 
                            icon="delete" 
                            color="red" 
                            size="sm"
                            @click="removeFile(index)"
                            :disable="isUploading"
                        >
                            <q-tooltip>Eliminar archivo</q-tooltip>
                        </q-btn>
                    </div>
                </div>
            </div>
        </div>

        <!-- Resultados de subida -->
        <div v-if="uploadResults.length > 0" class="upload-results">
            <h6 class="results-title">Resultados de subida:</h6>
            <div class="results-list">
                <div 
                    v-for="(result, index) in uploadResults" 
                    :key="index"
                    class="result-item"
                    :class="{ 'success': result.success, 'error': !result.success }"
                >
                    <q-icon 
                        :name="result.success ? 'check_circle' : 'error'" 
                        :color="result.success ? 'green' : 'red'"
                        size="1.2rem"
                    />
                    <div class="result-details">
                        <span class="result-file">{{ result.file }}</span>
                        <span class="result-message">
                            {{ result.success ? result.message : result.error }}
                        </span>
                        <span v-if="result.success && result.data" class="result-url">
                            URL: {{ result.data.secure_url || result.data.url }}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Botones de acción -->
        <div class="upload-actions" v-if="selectedFiles.length > 0">
            <q-btn 
                color="primary" 
                icon="cloud_upload" 
                label="Subir archivos"
                @click="uploadFiles"
                :loading="isUploading"
                :disable="isUploading"
            />
            
            <q-btn 
                flat 
                color="grey" 
                icon="clear" 
                label="Limpiar"
                @click="clearFiles"
                :disable="isUploading"
            />
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import cloudinaryService from '../services/cloudinaryService.js';
import { useQuasar } from 'quasar';

// Props
const props = defineProps({
    multiple: {
        type: Boolean,
        default: true
    },
    maxFileSize: {
        type: Number,
        default: 10 * 1024 * 1024 // 10MB
    },
    allowedTypes: {
        type: Array,
        default: () => ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain']
    },
    folder: {
        type: String,
        default: 'compras'
    },
    autoUpload: {
        type: Boolean,
        default: false
    }
});

// Emits
const emit = defineEmits(['upload-success', 'upload-error', 'upload-progress', 'files-selected']);

// Composables
const $q = useQuasar();

// Refs
const fileInput = ref(null);
const selectedFiles = ref([]);
const uploadResults = ref([]);
const isDragOver = ref(false);
const isUploading = ref(false);
const uploadProgress = ref(0);

// Computed
const acceptedFiles = computed(() => props.allowedTypes.join(','));

const allowedTypesText = computed(() => {
    const extensions = props.allowedTypes.map(type => {
        switch (type) {
            case 'image/jpeg': return 'JPG';
            case 'image/png': return 'PNG';
            case 'image/gif': return 'GIF';
            case 'application/pdf': return 'PDF';
            case 'text/plain': return 'TXT';
            default: return type.split('/')[1]?.toUpperCase() || 'Desconocido';
        }
    });
    return extensions.join(', ');
});

// Métodos
const openFileDialog = () => {
    if (!isUploading.value) {
        fileInput.value?.click();
    }
};

const handleFileSelect = (event) => {
    const files = Array.from(event.target.files || []);
    processFiles(files);
    
    // Limpiar el input
    event.target.value = '';
};

const handleDrop = (event) => {
    event.preventDefault();
    isDragOver.value = false;
    
    if (isUploading.value) return;
    
    const files = Array.from(event.dataTransfer?.files || []);
    processFiles(files);
};

const processFiles = (files) => {
    const validFiles = [];
    const errors = [];
    
    files.forEach(file => {
        // Validar tipo de archivo
        if (!props.allowedTypes.includes(file.type)) {
            errors.push(`${file.name}: Tipo de archivo no permitido`);
            return;
        }
        
        // Validar tamaño
        if (file.size > props.maxFileSize) {
            errors.push(`${file.name}: Archivo demasiado grande (max: ${formatFileSize(props.maxFileSize)})`);
            return;
        }
        
        validFiles.push(file);
    });
    
    // Mostrar errores si los hay
    if (errors.length > 0) {
        $q.notify({
            type: 'negative',
            message: 'Algunos archivos no son válidos:',
            caption: errors.join(', '),
            timeout: 5000
        });
    }
    
    // Agregar archivos válidos
    if (props.multiple) {
        selectedFiles.value = [...selectedFiles.value, ...validFiles];
    } else {
        selectedFiles.value = validFiles.slice(0, 1);
    }
    
    emit('files-selected', selectedFiles.value);
    
    // Subir automáticamente si está habilitado
    if (props.autoUpload && validFiles.length > 0) {
        uploadFiles();
    }
};

const removeFile = (index) => {
    selectedFiles.value.splice(index, 1);
    emit('files-selected', selectedFiles.value);
};

const clearFiles = () => {
    selectedFiles.value = [];
    uploadResults.value = [];
    uploadProgress.value = 0;
    emit('files-selected', []);
};

const uploadFiles = async () => {
    if (selectedFiles.value.length === 0) return;
    
    isUploading.value = true;
    uploadProgress.value = 0;
    uploadResults.value = [];
    
    try {
        const results = await cloudinaryService.uploadMultipleFiles(
            selectedFiles.value,
            {
                folder: props.folder,
                maxSize: props.maxFileSize,
                onProgress: (current, total) => {
                    uploadProgress.value = Math.round((current / total) * 100);
                    emit('upload-progress', uploadProgress.value);
                },
                onFileProgress: (current, total, fileName) => {
                    $q.notify({
                        type: 'info',
                        message: `Subiendo ${fileName} (${current}/${total})`,
                        timeout: 1000
                    });
                }
            }
        );
        
        uploadResults.value = results;
        
        // Separar éxitos y errores
        const successes = results.filter(r => r.success);
        const errors = results.filter(r => !r.success);
        
        if (successes.length > 0) {
            emit('upload-success', successes);
            $q.notify({
                type: 'positive',
                message: `${successes.length} archivo(s) subido(s) exitosamente`,
                timeout: 3000
            });
        }
        
        if (errors.length > 0) {
            emit('upload-error', errors);
            $q.notify({
                type: 'negative',
                message: `Error en ${errors.length} archivo(s)`,
                timeout: 3000
            });
        }
        
    } catch (error) {
        console.error('Error durante la subida:', error);
        $q.notify({
            type: 'negative',
            message: 'Error durante la subida de archivos',
            caption: error.message,
            timeout: 5000
        });
        emit('upload-error', [{ error: error.message }]);
    } finally {
        isUploading.value = false;
    }
};

const getFileIcon = (mimeType) => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType === 'application/pdf') return 'picture_as_pdf';
    if (mimeType.startsWith('text/')) return 'description';
    if (mimeType.startsWith('video/')) return 'videocam';
    if (mimeType.startsWith('audio/')) return 'audiotrack';
    return 'insert_drive_file';
};

const formatFileSize = (bytes) => {
    return cloudinaryService.formatFileSize(bytes);
};
</script>

<style scoped>
.cloudinary-uploader {
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
}

.upload-container {
    margin-bottom: 1rem;
}

.drop-zone {
    border: 2px dashed #ccc;
    border-radius: 8px;
    padding: 2rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    background-color: #fafafa;
    position: relative;
}

.drop-zone:hover {
    border-color: #1976d2;
    background-color: #f3f8ff;
}

.drop-zone.drag-over {
    border-color: #1976d2;
    background-color: #e3f2fd;
    transform: scale(1.02);
}

.drop-zone.uploading {
    border-color: #4caf50;
    background-color: #f1f8e9;
    cursor: not-allowed;
}

.drop-zone-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
}

.uploading-icon {
    animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

.drop-zone-title {
    margin: 0;
    font-size: 1.1rem;
    color: #333;
}

.drop-zone-subtitle {
    margin: 0;
    font-size: 0.9rem;
    color: #666;
}

.progress-container {
    position: absolute;
    bottom: 1rem;
    left: 1rem;
    right: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.upload-progress {
    flex: 1;
}

.progress-text {
    font-size: 0.8rem;
    color: #666;
    min-width: 40px;
}

.selected-files,
.upload-results {
    margin: 1rem 0;
}

.files-title,
.results-title {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
    color: #333;
}

.files-list,
.results-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.file-item,
.result-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    background-color: #fff;
}

.result-item.success {
    border-color: #4caf50;
    background-color: #f1f8e9;
}

.result-item.error {
    border-color: #f44336;
    background-color: #fdf2f2;
}

.file-info,
.result-details {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
}

.result-details {
    flex-direction: column;
    align-items: flex-start;
}

.file-details {
    display: flex;
    flex-direction: column;
}

.file-name,
.result-file {
    font-weight: 500;
    color: #333;
}

.file-size,
.result-message {
    font-size: 0.8rem;
    color: #666;
}

.result-url {
    font-size: 0.7rem;
    color: #1976d2;
    word-break: break-all;
}

.upload-actions {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
    margin-top: 1rem;
}

@media (max-width: 600px) {
    .drop-zone {
        padding: 1rem;
    }
    
    .drop-zone-title {
        font-size: 1rem;
    }
    
    .file-item,
    .result-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }
    
    .file-actions {
        align-self: flex-end;
    }
}
</style>
