# 🔧 SOLUCIÓN: Arreglar Subida de Archivos a Cloudinary

## 📋 Problema Identificado

**Síntoma:**
- Los archivos se suben pero solo se guarda el nombre en el campo `documento`
- El array `documentos` permanece vacío
- No se guardan los metadatos de Cloudinary (URL, public_id, etc.)

**Causa:**
El backend no está procesando correctamente la subida a Cloudinary. El controlador actual solo está guardando el nombre del archivo pero no está subiendo a Cloudinary ni almacenando los metadatos completos.

## 🛠️ Solución Completa

### 1. Configuración de Cloudinary en el Backend

Asegúrate de que tu archivo `config/cloudinary.js` esté configurado correctamente:

```javascript
// config/cloudinary.js
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = cloudinary;
```

### 2. Controlador Correcto para Compras

Aquí está el controlador correcto que necesitas implementar en `controllers/compras.js`:

```javascript
// controllers/compras.js
const Compras = require('../models/compras');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

// Función auxiliar para subir archivo a Cloudinary
const uploadToCloudinary = (file, folder = 'compras') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: 'auto',
                folder: folder,
                public_id: `${Date.now()}_${file.originalname.split('.')[0]}`,
                tags: [folder, 'intranet']
            },
            (error, result) => {
                if (error) {
                    console.error('Error al subir a Cloudinary:', error);
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );
        
        uploadStream.end(file.buffer);
    });
};

// GET: Obtener todos los documentos de compras
exports.getAllCompras = async (req, res) => {
    try {
        const compras = await Compras.find().sort({ createdAt: -1 });
        res.status(200).json({
            message: 'Compras obtenidos exitosamente',
            data: compras
        });
    } catch (error) {
        console.error('Error al obtener compras:', error);
        res.status(500).json({
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// GET: Obtener un documento específico
exports.getComprasById = async (req, res) => {
    try {
        const compra = await Compras.findById(req.params.id);
        
        if (!compra) {
            return res.status(404).json({
                message: 'Compra no encontrado',
                error: 'Record not found'
            });
        }

        res.status(200).json({
            message: 'Compra obtenido exitosamente',
            data: compra
        });
    } catch (error) {
        console.error('Error al obtener compra:', error);
        res.status(500).json({
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// POST: Crear nuevo documento con archivos
exports.createCompras = async (req, res) => {
    try {
        console.log('🔥 Iniciando proceso de subida de archivos');
        console.log('📁 Archivos recibidos:', req.files ? req.files.length : 0);
        console.log('📝 Datos del formulario:', req.body);

        // Validar que se proporcione al menos el campo documento
        if (!req.body.documento) {
            return res.status(400).json({
                message: 'El campo documento es requerido',
                error: 'Missing required field: documento'
            });
        }

        // Preparar el objeto de datos básicos
        const comprasData = {
            documento: req.body.documento,
            documentos: [] // Array que contendrá los metadatos de Cloudinary
        };

        // Procesar archivos si existen
        if (req.files && req.files.length > 0) {
            console.log(`📤 Procesando ${req.files.length} archivo(s)...`);
            
            const uploadPromises = req.files.map(async (file, index) => {
                try {
                    console.log(`⬆️ Subiendo archivo ${index + 1}: ${file.originalname}`);
                    
                    // Subir archivo a Cloudinary
                    const cloudinaryResult = await uploadToCloudinary(file, 'compras');
                    
                    console.log(`✅ Archivo ${index + 1} subido exitosamente:`, {
                        public_id: cloudinaryResult.public_id,
                        url: cloudinaryResult.secure_url
                    });

                    // Crear objeto con metadatos completos
                    return {
                        url: cloudinaryResult.secure_url,
                        public_id: cloudinaryResult.public_id,
                        originalName: file.originalname,
                        format: cloudinaryResult.format,
                        bytes: cloudinaryResult.bytes,
                        uploadDate: new Date()
                    };
                    
                } catch (uploadError) {
                    console.error(`❌ Error subiendo archivo ${file.originalname}:`, uploadError);
                    throw new Error(`Error subiendo ${file.originalname}: ${uploadError.message}`);
                }
            });

            // Esperar a que todos los archivos se suban
            try {
                const uploadedFiles = await Promise.all(uploadPromises);
                comprasData.documentos = uploadedFiles;
                console.log(`🎉 Todos los archivos subidos exitosamente`);
            } catch (uploadError) {
                console.error('❌ Error en la subida masiva:', uploadError);
                return res.status(500).json({
                    message: 'Error subiendo archivos a Cloudinary',
                    error: uploadError.message
                });
            }
        }

        // Guardar en la base de datos
        console.log('💾 Guardando en base de datos:', comprasData);
        const nuevaCompra = new Compras(comprasData);
        const compraGuardada = await nuevaCompra.save();

        console.log('✅ Documento guardado exitosamente:', compraGuardada._id);

        res.status(201).json({
            message: 'Compra creado exitosamente',
            data: compraGuardada
        });

    } catch (error) {
        console.error('❌ Error general en createCompras:', error);
        res.status(500).json({
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// PUT: Actualizar documento
exports.updateCompras = async (req, res) => {
    try {
        const compraActualizada = await Compras.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!compraActualizada) {
            return res.status(404).json({
                message: 'Compra no encontrado',
                error: 'Record not found'
            });
        }

        res.status(200).json({
            message: 'Compra actualizado exitosamente',
            data: compraActualizada
        });
    } catch (error) {
        console.error('Error al actualizar compra:', error);
        res.status(500).json({
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// DELETE: Eliminar documento y archivos de Cloudinary
exports.deleteCompras = async (req, res) => {
    try {
        const compra = await Compras.findById(req.params.id);
        
        if (!compra) {
            return res.status(404).json({
                message: 'Compra no encontrado',
                error: 'Record not found'
            });
        }

        // Eliminar archivos de Cloudinary
        if (compra.documentos && compra.documentos.length > 0) {
            const deletePromises = compra.documentos.map(async (doc) => {
                try {
                    await cloudinary.uploader.destroy(doc.public_id);
                    console.log(`Archivo eliminado de Cloudinary: ${doc.public_id}`);
                } catch (error) {
                    console.error(`Error eliminando archivo de Cloudinary: ${doc.public_id}`, error);
                }
            });
            
            await Promise.all(deletePromises);
        }

        // Eliminar documento de la base de datos
        await Compras.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: 'Compra eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar compra:', error);
        res.status(500).json({
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};
```

### 3. Ruta Corregida

Asegúrate de que tu archivo `routes/compras.js` tenga la configuración correcta de multer:

```javascript
// routes/compras.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const comprasController = require('../controllers/compras');

// Configuración de Multer para manejar archivos en memoria
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB máximo por archivo
        files: 10 // Máximo 10 archivos
    },
    fileFilter: (req, file, cb) => {
        // Validar tipos de archivo permitidos
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'image/jpeg',
            'image/png',
            'image/gif'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de archivo no permitido'), false);
        }
    }
});

// Rutas
router.get('/', comprasController.getAllCompras);
router.get('/:id', comprasController.getComprasById);
router.post('/', upload.array('documentos', 10), comprasController.createCompras);
router.put('/:id', comprasController.updateCompras);
router.delete('/:id', comprasController.deleteCompras);

module.exports = router;
```

### 4. Modelo de Datos

Asegúrate de que tu modelo `models/compras.js` tenga la estructura correcta:

```javascript
// models/compras.js
const mongoose = require('mongoose');

const documentoSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true
    },
    public_id: {
        type: String,
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    format: {
        type: String,
        required: true
    },
    bytes: {
        type: Number,
        required: true
    },
    uploadDate: {
        type: Date,
        default: Date.now
    }
});

const comprasSchema = new mongoose.Schema({
    documento: {
        type: String,
        required: true,
        trim: true
    },
    documentos: [documentoSchema]
}, {
    timestamps: true
});

module.exports = mongoose.model('Compras', comprasSchema);
```

## 🔄 Aplicar la Solución

### Paso 1: Actualizar Controladores
Reemplaza todos los controladores de departamentos (compras, contabilidad, etc.) con la lógica similar a la mostrada arriba, cambiando solo:
- El nombre del modelo
- La carpeta de Cloudinary (`compras` → `contabilidad`, etc.)

### Paso 2: Verificar Variables de Entorno
Asegúrate de que tu archivo `.env` tenga:
```env
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret
```

### Paso 3: Probar la Subida
1. Reinicia el servidor backend
2. Desde el frontend, intenta subir un archivo
3. Verifica en la consola del backend que aparezcan los logs de subida
4. Revisa la base de datos para confirmar que el array `documentos` contenga los metadatos completos

## 📊 Resultado Esperado

Después de implementar esta solución, tus documentos en la base de datos deberían verse así:

```json
{
  "_id": "68c2ccd6f4d719b88b66e251",
  "documento": "Documento de compras",
  "documentos": [
    {
      "url": "https://res.cloudinary.com/dvqn0avdc/image/upload/v1757596886/compras/...",
      "public_id": "compras/thzivu7dxguqwbbfwlhp",
      "originalName": "Comprobante_Transferencia_Boton1757520632669.pdf",
      "format": "pdf",
      "bytes": 850316,
      "_id": "68c2ccd6f4d719b88b66e252",
      "uploadDate": "2025-09-11T13:21:26.439+00:00"
    }
  ],
  "createdAt": "2025-09-11T13:21:26.467+00:00",
  "updatedAt": "2025-09-11T13:21:26.467+00:00",
  "__v": 0
}
```

## 🚨 Puntos Importantes

1. **Multer Configuration**: El campo debe ser `'documentos'` (plural) como espera el frontend
2. **Memory Storage**: Usar `multer.memoryStorage()` para manejar archivos en memoria
3. **Error Handling**: Implementar manejo robusto de errores para subidas fallidas
4. **Cleanup**: En caso de error, limpiar archivos parcialmente subidos
5. **Logs**: Mantener logs detallados para debugging

## 🔍 Debugging

Si sigues teniendo problemas:

1. Verifica logs del servidor durante la subida
2. Confirma que las variables de Cloudinary estén configuradas
3. Prueba subir un archivo simple (PDF pequeño)
4. Revisa la respuesta del backend en las DevTools del navegador

Con esta implementación, el problema de los archivos que solo guardan el nombre debería resolverse completamente.
