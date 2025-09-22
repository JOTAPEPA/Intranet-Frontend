# 📄 Configuración de Rutas Departamentales

## 🎯 Objetivo
Modificar el sistema de subida de archivos para que cada departamento envíe sus documentos a su propia ruta de backend específica, permitiendo que cada área tenga su propio modelo de datos.

## 🔧 Cambios Implementados

### 1. **CloudinaryService Actualizado**

#### **Nuevo Método: `getDepartmentRoute(category)`**
```javascript
getDepartmentRoute(category) {
    const routeMap = {
        'compras': '/compras',
        'contabilidad': '/contabilidad',
        'control-interno': '/control-interno',
        'credito': '/credito',
        'gerencia': '/gerencia',
        'riesgos': '/riesgos',
        'talento-humano': '/talento-humano',
        'tesoreria': '/tesoreria'
    };
    
    return routeMap[category] || '/compras'; // fallback a compras por defecto
}
```

#### **Método `uploadToBackend` Mejorado**
- ✅ **Detección automática de ruta**: Basada en `metadata.category`
- ✅ **Metadatos extendidos**: Incluye categoría, uploadedBy, uploadDate
- ✅ **Logging mejorado**: Muestra la ruta de destino y categoría
- ✅ **Mensajes específicos**: "Archivo subido exitosamente a {categoria}"

#### **Otros Métodos Actualizados**
- `uploadFile()`: Acepta parámetro `options.category`
- `uploadMultipleFiles()`: Maneja categorías para subidas múltiples
- `deleteFile()`: Incluye parámetro de categoría para eliminaciones

## 📊 Mapeo Completo de Rutas

| Departamento | Categoría | Ruta Backend | Modelo Destino |
|-------------|-----------|--------------|----------------|
| **Compras** | `compras` | `/compras` | Modelo Compras |
| **Contabilidad** | `contabilidad` | `/contabilidad` | Modelo Contabilidad |
| **Control Interno** | `control-interno` | `/control-interno` | Modelo Control Interno |
| **Crédito** | `credito` | `/credito` | Modelo Crédito |
| **Gerencia** | `gerencia` | `/gerencia` | Modelo Gerencia |
| **Riesgos** | `riesgos` | `/riesgos` | Modelo Riesgos |
| **Talento Humano** | `talento-humano` | `/talento-humano` | Modelo Talento Humano |
| **Tesorería** | `tesoreria` | `/tesoreria` | Modelo Tesorería |

## 🏗️ Estructura de Metadatos

Cada archivo enviado incluye los siguientes metadatos:

```javascript
const metadata = {
    title: documentTitle.value,           // Título del documento
    description: documentDescription.value, // Descripción opcional
    category: 'departamento-especifico',   // Categoría para determinar ruta
    uploadedBy: 'current-user',           // Usuario que sube el archivo
    uploadDate: new Date().toISOString()  // Fecha de subida
}
```

## 🔄 Flujo de Subida por Departamento

### **Ejemplo: Subida en Contabilidad**
1. Usuario selecciona archivo en `contabilidad.vue`
2. Metadatos configurados con `category: 'contabilidad'`
3. `CloudinaryService.uploadToBackend()` llamado
4. Método `getDepartmentRoute('contabilidad')` retorna `/contabilidad`
5. FormData preparado con archivo en campo `documentos`
6. Petición enviada a `/api/contabilidad`
7. Backend guarda en modelo específico de Contabilidad

### **Ejemplo: Subida en Riesgos**
1. Usuario selecciona archivo en `riesgos.vue`
2. Metadatos configurados con `category: 'riesgos'`
3. `CloudinaryService.uploadToBackend()` llamado
4. Método `getDepartmentRoute('riesgos')` retorna `/riesgos`
5. FormData preparado con archivo en campo `documentos`
6. Petición enviada a `/api/riesgos`
7. Backend guarda en modelo específico de Riesgos

## 📋 Campos FormData Enviados

Para cada subida, se envían los siguientes campos:

```javascript
formData.append('documentos', file);              // Archivo (campo esperado por backend)
formData.append('documento', documentoValue);     // Título/nombre del documento
formData.append('descripcion', description);      // Descripción opcional
formData.append('categoria', category);           // Categoría del departamento
formData.append('uploadedBy', uploadedBy);        // Usuario que sube
formData.append('uploadDate', uploadDate);        // Fecha de subida
```

## 🔍 Configuración de Módulos

Cada módulo departamental está configurado con su categoría específica:

### **Compras**
```javascript
category: 'compras'  // → /api/compras
```

### **Contabilidad**
```javascript
category: 'contabilidad'  // → /api/contabilidad
```

### **Control Interno**
```javascript
category: 'control-interno'  // → /api/control-interno
```

### **Crédito**
```javascript
category: 'credito'  // → /api/credito
```

### **Gerencia**
```javascript
category: 'gerencia'  // → /api/gerencia
```

### **Riesgos**
```javascript
category: 'riesgos'  // → /api/riesgos
```

### **Talento Humano**
```javascript
category: 'talento-humano'  // → /api/talento-humano
```

### **Tesorería**
```javascript
category: 'tesoreria'  // → /api/tesoreria
```

## 🧪 Testing y Validación

### **Para probar cada departamento:**

1. **Navegar al módulo departamental** (ej: `/contabilidad`)
2. **Hacer clic en "Subir Documento"**
3. **Seleccionar un archivo** (PDF, DOC, etc.)
4. **Llenar título** y descripción opcional
5. **Hacer clic en "Subir Archivo"**
6. **Verificar en Network Tab** que la petición va a la ruta correcta
7. **Confirmar en backend** que se guarda en el modelo correspondiente

### **Verificación de Logs:**
Los logs en consola mostrarán:
```
Archivo a subir: { name: "documento.pdf", size: 2048576, type: "application/pdf", category: "contabilidad" }
FormData preparado:
- Archivo en campo "documentos": documento.pdf (2MB)
- Campo documento: Mi Documento
- Ruta de destino: /contabilidad
- Categoría: contabilidad
- Tipo MIME: application/pdf
```

## ✅ Beneficios de esta Implementación

1. **Separación de Datos**: Cada departamento maneja sus propios documentos
2. **Escalabilidad**: Fácil agregar nuevos departamentos
3. **Mantenimiento**: Lógica centralizada en CloudinaryService
4. **Flexibilidad**: Cada ruta puede tener su propia lógica de backend
5. **Trazabilidad**: Metadatos específicos por departamento
6. **Consistencia**: Misma interfaz para todos los departamentos

## 🚀 Próximos Pasos

### **Requerimientos de Backend:**
Para que el sistema funcione completamente, el backend necesita implementar:

1. **Rutas específicas**:
   - `POST /api/contabilidad`
   - `POST /api/control-interno`
   - `POST /api/credito`
   - `POST /api/gerencia`
   - `POST /api/riesgos`
   - `POST /api/talento-humano`
   - `POST /api/tesoreria`

2. **Modelos específicos** para cada departamento
3. **Middleware Multer** configurado con `upload.array('documentos', 10)`
4. **Controladores** para manejar la lógica específica de cada área

### **Estructura Backend Sugerida:**
```
routes/
├── compras.js          ✅ (ya existe)
├── contabilidad.js     📝 (crear)
├── controlInterno.js   📝 (crear)
├── credito.js          📝 (crear)
├── gerencia.js         📝 (crear)
├── riesgos.js          📝 (crear)
├── talentoHumano.js    📝 (crear)
└── tesoreria.js        📝 (crear)

models/
├── Compras.js          ✅ (ya existe)
├── Contabilidad.js     📝 (crear)
├── ControlInterno.js   📝 (crear)
├── Credito.js          📝 (crear)
├── Gerencia.js         📝 (crear)
├── Riesgos.js          📝 (crear)
├── TalentoHumano.js    📝 (crear)
└── Tesoreria.js        📝 (crear)
```

## 📝 Notas Importantes

- **Fallback de Seguridad**: Si no se especifica categoría, el sistema usa `/compras` por defecto
- **Validación Frontend**: Todos los archivos se validan antes de enviar (tipo y tamaño)
- **Compatibilidad**: Mantiene la misma estructura FormData que espera el backend
- **Logging**: Extenso logging para debugging y monitoreo
- **Error Handling**: Manejo robusto de errores con mensajes específicos

¡El sistema ahora está completamente preparado para manejar documentos por departamentos! 🎉
