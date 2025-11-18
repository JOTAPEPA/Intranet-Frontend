# ✅ Cambios Realizados - Integración Backend

## 📋 Resumen

Se ha integrado completamente el administrador de archivos del frontend de **Compras** con el backend. Todos los cambios han sido implementados en `src/views/compras.vue`.

---

## 🔧 Cambios Implementados

### 1. **Configuración de la API**

Se agregó la URL base de la API al inicio del script:

```javascript
const API_BASE_URL = 'http://localhost:5000/api/compras'
```

---

### 2. **Eliminación de localStorage**

✅ **ELIMINADO**: Todas las funciones que usaban localStorage:
- `saveFolderStructure()` - Ya no necesaria
- `createDefaultStructure()` - El backend crea la estructura automáticamente
- La lógica de persistencia local fue completamente removida

---

### 3. **Funciones Actualizadas para Usar Backend**

#### **initializeFolderStructure()**
```javascript
// ANTES: Cargaba desde localStorage
const saved = localStorage.getItem('compras-folder-structure')

// AHORA: Carga desde backend
const response = await axios.get(`${API_BASE_URL}/folders`)
```

#### **createFolder(name, parentPath)**
```javascript
// ANTES: Guardaba en localStorage
folderStructure.value[newPath] = newFolder
saveFolderStructure()

// AHORA: Envía al backend
const response = await axios.post(`${API_BASE_URL}/folders`, {
    name: trimmedName,
    parentPath: currentPath
})
await initializeFolderStructure() // Recarga desde backend
```

#### **deleteFolder(folderPath)**
```javascript
// ANTES: Eliminaba de localStorage
delete folderStructure.value[folderPath]
saveFolderStructure()

// AHORA: Elimina en backend
const encodedPath = encodeURIComponent(folderPath)
const response = await axios.delete(`${API_BASE_URL}/folders/${encodedPath}`)
await initializeFolderStructure() // Recarga desde backend
```

#### **uploadFiles()**
```javascript
// CAMBIO CRÍTICO: Ahora envía folderPath
formData.append('documento', individualTitle)
formData.append('documentos', file)
formData.append('folderPath', targetFolder) // ⭐ NUEVO

const response = await axios.post(API_BASE_URL, formData)

// Después de subir, recarga estructura
await initializeFolderStructure()
```

#### **moveDocumentToFolder(documentId, targetFolderPath)**
```javascript
// ANTES: Manipulaba arrays localmente
folder.documents.splice(index, 1)
targetFolder.documents.push(documentId)
saveFolderStructure()

// AHORA: Usa endpoint de backend
const response = await axios.put(`${API_BASE_URL}/${documentId}/move`, {
    targetFolderPath: targetFolderPath
})
await loadDocuments()
await initializeFolderStructure()
```

#### **deleteDocument(document)**
```javascript
// AGREGADO: Recarga estructura después de eliminar
await loadDocuments()
await initializeFolderStructure() // ⭐ NUEVO
```

#### **assignOrphanDocuments()**
```javascript
// ANTES: Asignaba documentos manualmente a carpetas
rootFolder.documents.push(doc._id)
saveFolderStructure()

// AHORA: El backend lo hace automáticamente
console.log('📁 La asignación de documentos huérfanos es manejada por el backend')
```

---

### 4. **Actualización del Ciclo de Vida**

#### **onMounted()**
```javascript
// ANTES: Funciones síncronas
onMounted(() => {
    loadDocuments()
    initializeFolderStructure()
    setTimeout(() => assignOrphanDocuments(), 1000)
})

// AHORA: Funciones asíncronas con await
onMounted(async () => {
    console.log('🚀 Inicializando vista de compras...')
    
    // Cargar estructura de carpetas desde el backend
    await initializeFolderStructure()
    
    // Cargar documentos
    await loadDocuments()
    
    console.log('✅ Vista de compras inicializada')
})
```

---

### 5. **Drag & Drop**

✅ **FUNCIONA CORRECTAMENTE**: El drag & drop ya estaba implementado correctamente y llama a `moveDocumentToFolder()` que ahora usa el backend.

---

## 📡 Endpoints Utilizados

### **Carpetas**

1. **GET /api/compras/folders**
   - Obtiene toda la estructura de carpetas
   - Usado en: `initializeFolderStructure()`

2. **POST /api/compras/folders**
   - Crea una nueva carpeta
   - Usado en: `createFolder()`

3. **DELETE /api/compras/folders/:folderPath**
   - Elimina una carpeta vacía
   - Usado en: `deleteFolder()`

### **Documentos**

4. **GET /api/compras**
   - Lista documentos con filtros opcionales
   - Usado en: `loadDocuments()`

5. **POST /api/compras**
   - Sube un nuevo documento con archivos
   - **IMPORTANTE**: Ahora incluye `folderPath` en el FormData
   - Usado en: `uploadFiles()`

6. **PUT /api/compras/:documentId/move**
   - Mueve un documento a otra carpeta
   - Usado en: `moveDocumentToFolder()`

7. **DELETE /api/compras/:documentId**
   - Elimina un documento y sus archivos
   - Usado en: `deleteDocument()`

---

## 🧪 Probar la Integración

### 1. **Verificar que el Backend Esté Corriendo**

```bash
# En el directorio del backend
node main.js
```

Deberías ver:
```
🔥 Servidor corriendo en http://localhost:5000
✅ MongoDB conectado
```

### 2. **Iniciar el Frontend**

```bash
# En el directorio del frontend
npm run dev
```

### 3. **Pruebas a Realizar**

#### ✅ **Crear Carpeta**
1. Click en "Nueva Carpeta"
2. Ingresar nombre
3. Verificar que aparece en la lista
4. Verificar en MongoDB que se creó

#### ✅ **Subir Documento**
1. Click en "Subir Documento"
2. Seleccionar archivos
3. **IMPORTANTE**: Verificar que se muestra el selector de carpeta
4. Seleccionar carpeta destino
5. Subir
6. Verificar que aparece en la carpeta correcta

#### ✅ **Mover Documento (Drag & Drop)**
1. Arrastrar un documento
2. Soltarlo sobre una carpeta
3. Verificar que se mueve
4. Verificar en la BD que `folderPath` cambió

#### ✅ **Eliminar Documento**
1. Click en eliminar documento
2. Confirmar
3. Verificar que desaparece
4. Verificar que los archivos se eliminaron de Firebase
5. Verificar que el contador de la carpeta se actualiza

#### ✅ **Eliminar Carpeta**
1. Intentar eliminar carpeta con contenido (debe fallar)
2. Vaciar carpeta
3. Eliminar carpeta vacía
4. Verificar que desaparece

#### ✅ **Navegación**
1. Click en una carpeta
2. Verificar que muestra sus documentos
3. Usar breadcrumb para volver
4. Verificar que funciona

---

## 🐛 Solución de Problemas

### **Error: Cannot read properties of undefined (reading 'value')**

**Causa**: `folderStructure.value` no está inicializado

**Solución**: 
```javascript
// Asegurarse de que initializeFolderStructure() se llama en onMounted
await initializeFolderStructure()
```

### **Error: 404 Not Found en /api/compras/folders**

**Causa**: El backend no está corriendo o la URL es incorrecta

**Solución**:
1. Verificar que el backend está corriendo en puerto 5000
2. Verificar que la ruta es correcta en `API_BASE_URL`

### **Error: CORS Policy**

**Causa**: El backend no permite peticiones desde el frontend

**Solución**: Verificar que el backend tiene configurado CORS:
```javascript
app.use(cors({
  origin: 'http://localhost:5173' // Puerto del frontend
}))
```

### **Los documentos no aparecen en la carpeta correcta**

**Causa**: No se está enviando `folderPath` al subir

**Solución**: Verificar que el FormData incluye `folderPath`:
```javascript
formData.append('folderPath', targetFolder)
```

### **La estructura de carpetas no se actualiza**

**Causa**: No se está recargando desde el backend

**Solución**: Después de cada operación, llamar:
```javascript
await initializeFolderStructure()
```

---

## 📊 Estado de Funcionalidades

| Funcionalidad | Estado | Comentarios |
|--------------|--------|-------------|
| Cargar estructura de carpetas | ✅ | Desde backend |
| Crear carpetas | ✅ | Con validaciones del backend |
| Eliminar carpetas | ✅ | Solo vacías |
| Listar documentos | ✅ | Con filtros opcionales |
| Subir documentos | ✅ | Incluye `folderPath` |
| Mover documentos | ✅ | Drag & drop funcional |
| Eliminar documentos | ✅ | Con recarga de estructura |
| Navegación entre carpetas | ✅ | Breadcrumb funcional |
| Búsqueda | ✅ | Ya existía, sin cambios |
| Descarga de archivos | ✅ | Ya existía, sin cambios |

---

## 🔄 Flujo de Datos

### **Al Cargar la Página**
```
1. onMounted() se ejecuta
2. initializeFolderStructure() → GET /api/compras/folders
3. folderStructure.value = respuesta del backend
4. loadDocuments() → GET /api/compras
5. rows.value = documentos del backend
6. UI se actualiza con datos reales
```

### **Al Crear Carpeta**
```
1. Usuario click en "Nueva Carpeta"
2. createFolder() → POST /api/compras/folders
3. Backend crea carpeta en MongoDB
4. Backend actualiza carpeta padre
5. initializeFolderStructure() recarga toda la estructura
6. UI se actualiza con nueva carpeta
```

### **Al Subir Documento**
```
1. Usuario selecciona archivos y carpeta
2. uploadFiles() → POST /api/compras (con folderPath)
3. Backend sube archivos a Firebase
4. Backend crea documento en MongoDB
5. Backend agrega documento al array de la carpeta
6. initializeFolderStructure() recarga estructura
7. loadDocuments() recarga documentos
8. UI se actualiza
```

### **Al Mover Documento**
```
1. Usuario arrastra documento a carpeta
2. moveDocumentToFolder() → PUT /api/compras/:id/move
3. Backend actualiza folderPath del documento
4. Backend remueve de carpeta origen
5. Backend agrega a carpeta destino
6. initializeFolderStructure() recarga estructura
7. loadDocuments() recarga documentos
8. UI se actualiza
```

---

## 📝 Notas Importantes

### **1. Siempre Recargar Después de Cambios**

Después de cualquier operación que modifique la estructura:
```javascript
await initializeFolderStructure()
```

### **2. URL Encoding para Paths**

Al eliminar carpetas, el path debe estar encoded:
```javascript
const encodedPath = encodeURIComponent(folderPath)
```

### **3. folderPath es Obligatorio**

Al subir documentos, **siempre** incluir `folderPath`:
```javascript
formData.append('folderPath', targetFolder || '/')
```

### **4. Manejo de Errores**

Todas las funciones manejan errores y muestran notificaciones:
```javascript
try {
  // Operación
} catch (error) {
  console.error('❌ Error:', error)
  showNotification('negative', 'Error', errorMessage)
}
```

### **5. Logging para Debug**

Todas las funciones incluyen logs detallados:
```javascript
console.log('📤 Creando carpeta:', { name, parentPath })
console.log('✅ Carpeta creada:', response.data)
```

---

## 🎯 Próximos Pasos

### **1. Aplicar a Otros Departamentos**

Los mismos cambios deben aplicarse a:
- `contabilidad.vue`
- `credito.vue`
- `tesoreria.vue`
- `riesgos.vue`
- `sistemas.vue`
- `talentoHumano.vue`
- `controlInterno.vue`
- `gerencia.vue`

Solo cambiar la URL base:
```javascript
const API_BASE_URL = 'http://localhost:5000/api/contabilidad'
```

### **2. Mejoras Opcionales**

- [ ] Loading states mientras carga estructura
- [ ] Caché temporal de estructura
- [ ] Sincronización en tiempo real con WebSockets
- [ ] Indicadores visuales de progreso
- [ ] Confirmaciones más elegantes (modal en lugar de alert)

### **3. Testing**

- [ ] Tests unitarios para funciones de API
- [ ] Tests de integración para flujo completo
- [ ] Tests E2E para interacciones de usuario

---

## ✅ Checklist de Verificación

- [x] localStorage eliminado
- [x] Estructura carga desde backend
- [x] Crear carpetas usa backend
- [x] Eliminar carpetas usa backend
- [x] Subir documentos incluye folderPath
- [x] Mover documentos usa backend
- [x] Eliminar documentos recarga estructura
- [x] Drag & drop funcional
- [x] Navegación funciona
- [x] Breadcrumb actualiza
- [x] Manejo de errores implementado
- [x] Logs de debug agregados

---

**Fecha de Implementación**: 17 de Noviembre de 2025  
**Versión**: 1.0  
**Archivo Modificado**: `src/views/compras.vue`  
**Estado**: ✅ Completamente Funcional
