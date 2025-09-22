# Configuración de Cloudinary para Subida de Archivos

## 📋 Resumen
Este documento explica cómo configurar y utilizar la funcionalidad de subida de archivos con Cloudinary en el módulo de compras.

## 🚀 Funcionalidades Implementadas

### Frontend (Vue 3 + Quasar)
- **Componente de subida**: Diálogo interactivo con drag & drop
- **Validación de archivos**: Tipos y tamaños permitidos
- **Progreso en tiempo real**: Barra de progreso durante la subida
- **Gestión de errores**: Mensajes claros para el usuario
- **Metadatos**: Título y descripción del documento

### Tipos de archivo soportados
- **Documentos**: PDF, DOC, DOCX, XLS, XLSX
- **Imágenes**: JPG, JPEG, PNG
- **Tamaño máximo**: 10MB por archivo

## ⚙️ Configuración Backend Requerida

### 1. Endpoint del Backend
El frontend envía los archivos a: `POST /api/compras`

**Estructura esperada del FormData:**
```javascript
{
  file: File, // El archivo a subir
  metadata: JSON.stringify({
    originalName: "documento.pdf",
    size: 1024000,
    type: "application/pdf",
    uploadDate: "2025-09-09T15:40:44.000Z",
    title: "Título del documento",
    description: "Descripción opcional",
    category: "compras",
    uploadedBy: "usuario-actual"
  })
}
```

### 2. Configuración de Cloudinary en el Backend
El backend debe tener configuradas las siguientes variables de entorno:

```env
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret
```

### 3. Ejemplo de implementación del endpoint (Node.js/Express)

```javascript
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configurar Multer para manejar archivos
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  }
});

// Endpoint para subir archivos
app.post('/api/compras', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const metadata = JSON.parse(req.body.metadata);

    // Subir a Cloudinary
    const result = await cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        folder: 'compras',
        public_id: `${Date.now()}_${metadata.originalName}`,
        tags: ['compras', metadata.category],
      },
      (error, result) => {
        if (error) {
          throw new Error(error.message);
        }
        return result;
      }
    );

    // Aquí puedes guardar la información en tu base de datos
    const documentData = {
      cloudinaryUrl: result.secure_url,
      publicId: result.public_id,
      originalName: metadata.originalName,
      title: metadata.title,
      description: metadata.description,
      size: metadata.size,
      type: metadata.type,
      uploadDate: new Date(),
      uploadedBy: metadata.uploadedBy,
      category: metadata.category,
    };

    // Guardar en base de datos (ejemplo con Mongoose)
    // const document = new Document(documentData);
    // await document.save();

    res.json({
      success: true,
      message: 'Archivo subido exitosamente',
      data: {
        id: documentData.id, // ID de la base de datos
        url: result.secure_url,
        publicId: result.public_id,
        originalName: metadata.originalName,
        title: metadata.title,
      }
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir el archivo',
      error: error.message
    });
  }
});
```

## 🔧 Configuración del Frontend

### 1. Instalar dependencias
```bash
npm install cloudinary
```

### 2. Actualizar configuración de Cloudinary (opcional)
Si quieres subida directa desde el frontend, actualiza el archivo:
`src/services/cloudinaryService.js`

```javascript
// Líneas 8-10
this.cloudName = 'tu-cloud-name-real';
this.uploadPreset = 'tu-upload-preset-real';
```

## 📱 Uso del Componente

### En cualquier vista
```vue
<template>
  <q-btn @click="openUploadDialog" color="primary">
    Subir Documento
  </q-btn>
</template>

<script setup>
import CloudinaryService from '@/services/cloudinaryService.js'

function openUploadDialog() {
  // El diálogo ya está implementado en compras.vue
  // Puedes reutilizar la lógica o crear tu propio componente
}
</script>
```

## 🔒 Seguridad

### Validaciones implementadas:
- **Tipo de archivo**: Solo permite extensiones seguras
- **Tamaño**: Máximo 10MB por archivo
- **Sanitización**: Nombres de archivo seguros
- **Metadatos**: Información adicional para auditoría

### Recomendaciones adicionales:
- Implementar autenticación en el backend
- Validar permisos del usuario
- Escanear archivos con antivirus
- Implementar rate limiting

## 🐛 Troubleshooting

### Error: "No se pudo conectar con el servidor"
- Verificar que el backend esté ejecutándose
- Comprobar la URL del endpoint `/api/compras`
- Revisar los logs del servidor

### Error: "Tipo de archivo no permitido"
- Verificar extensiones permitidas en `validateFileType()`
- Actualizar lista de tipos permitidos si es necesario

### Error: "Archivo demasiado grande"
- Verificar límite de 10MB
- Ajustar límite en `validateFileSize()` si es necesario
- Confirmar límites del backend

## 📝 Notas Importantes

1. **Configuración de Cloudinary**: Debes configurar tu cuenta de Cloudinary y obtener las credenciales
2. **Upload Preset**: Si usas subida directa, necesitas crear un upload preset en Cloudinary
3. **CORS**: Configurar CORS en el backend para permitir subidas desde el frontend
4. **Base de datos**: Implementar modelo para guardar información de los documentos

## 🔗 Enlaces Útiles

- [Documentación de Cloudinary](https://cloudinary.com/documentation)
- [Upload Presets](https://cloudinary.com/documentation/upload_presets)
- [Quasar File Uploader](https://quasar.dev/vue-components/uploader)
