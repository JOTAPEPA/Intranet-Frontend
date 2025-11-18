# 🎯 GUÍA RÁPIDA - Probar Integración Backend

## ✅ Lo que se ha hecho

Se ha conectado completamente el frontend de **compras.vue** con el backend del administrador de archivos. Todos los cambios están implementados y listos para probar.

---

## 🚀 Pasos para Probar

### **1. Iniciar el Backend**

```bash
# En el directorio del backend
cd path/to/backend
node main.js
```

**Deberías ver:**
```
🔥 Servidor corriendo en http://localhost:5000
✅ MongoDB conectado exitosamente
```

### **2. Iniciar el Frontend**

```bash
# En el directorio del frontend
cd C:\Users\Jampi\OneDrive\Documentos\Intranet\Intranet-Frontend
npm run dev
```

**Deberías ver:**
```
VITE ready in XXX ms
➜ Local: http://localhost:5173
```

### **3. Probar con la Página de Test**

Abre en tu navegador:
```
file:///C:/Users/Jampi/OneDrive/Documentos/Intranet/Intranet-Frontend/test-integracion-compras.html
```

Esta página te permite:
- ✅ Verificar conexión con el backend
- ✅ Ver estructura de carpetas
- ✅ Crear carpetas de prueba
- ✅ Eliminar carpetas
- ✅ Listar documentos
- ✅ Buscar documentos

**IMPORTANTE**: Si ves "Backend: Offline", verifica que el backend esté corriendo.

### **4. Probar en la Aplicación**

1. **Ir a Compras**
   ```
   http://localhost:5173
   → Login
   → Home
   → Compras
   ```

2. **Verificar Carga de Estructura**
   - Deberías ver la consola del navegador (F12):
   ```
   🚀 Inicializando vista de compras...
   📡 Cargando estructura de carpetas desde backend...
   ✅ Estructura de carpetas cargada: {…}
   ✅ Vista de compras inicializada
   ```

---

## 🧪 Pruebas Específicas

### **Prueba 1: Crear Carpeta**

1. Click en "Nueva Carpeta"
2. Ingresar nombre: `Test Carpeta 1`
3. Click en "Crear Carpeta"

**Verificar:**
- ✅ Aparece notificación de éxito
- ✅ La carpeta aparece en la lista
- ✅ En la consola:
  ```
  📤 Creando carpeta: {name: "Test Carpeta 1", parentPath: "/"}
  ✅ Carpeta creada: {…}
  ```

### **Prueba 2: Subir Documento**

1. Click en "Subir Documento"
2. Seleccionar 1-3 archivos
3. **IMPORTANTE**: Verificar que aparece el selector de carpeta
4. Seleccionar carpeta destino (por ejemplo, "Test Carpeta 1")
5. Click en "Subir"

**Verificar:**
- ✅ Progreso de subida se muestra
- ✅ Aparece notificación de éxito
- ✅ Documentos aparecen en la carpeta seleccionada
- ✅ En la consola:
  ```
  📄 Subiendo archivo 1/3: archivo.pdf a carpeta: /Test Carpeta 1/
  ✅ 3 documento(s) subido(s) exitosamente
  ```

### **Prueba 3: Navegar entre Carpetas**

1. Click en una carpeta para abrirla
2. Verificar que el breadcrumb se actualiza
3. Click en "Documentos" en el breadcrumb para volver

**Verificar:**
- ✅ Solo se muestran documentos de esa carpeta
- ✅ Breadcrumb muestra: `Documentos > Test Carpeta 1`
- ✅ Botón "Volver atrás" funciona

### **Prueba 4: Mover Documento (Drag & Drop)**

1. Crear otra carpeta: `Test Carpeta 2`
2. Arrastrar un documento desde una carpeta
3. Soltarlo sobre otra carpeta

**Verificar:**
- ✅ Visual feedback durante drag (carpeta se resalta)
- ✅ Notificación de éxito
- ✅ Documento desaparece de carpeta origen
- ✅ Documento aparece en carpeta destino
- ✅ En la consola:
  ```
  📤 Moviendo documento: {documentId: "...", targetFolderPath: "/Test Carpeta 2/"}
  ✅ Documento movido: {…}
  ```

### **Prueba 5: Eliminar Documento**

1. Click en el botón eliminar de un documento
2. Confirmar eliminación

**Verificar:**
- ✅ Aparece confirmación
- ✅ Notificación de éxito
- ✅ Documento desaparece de la lista
- ✅ Contador de la carpeta se actualiza
- ✅ En la consola:
  ```
  🗑️ Eliminando documento: ...
  ✅ Documento eliminado: {…}
  ```

### **Prueba 6: Eliminar Carpeta**

**Caso 1: Carpeta con contenido**
1. Intentar eliminar "Test Carpeta 1" (que tiene documentos)
2. Debe mostrar error: "Solo se pueden eliminar carpetas vacías"

**Caso 2: Carpeta vacía**
1. Crear carpeta nueva: `Test Carpeta 3`
2. Eliminar esa carpeta (sin agregar documentos)
3. Debe eliminarse exitosamente

**Verificar:**
- ✅ No permite eliminar carpetas con contenido
- ✅ Permite eliminar carpetas vacías
- ✅ Aparece confirmación antes de eliminar
- ✅ Notificación de éxito/error correspondiente

### **Prueba 7: Búsqueda**

1. Escribir término en el campo de búsqueda
2. Esperar 300ms (debounce)

**Verificar:**
- ✅ Busca en títulos de documentos
- ✅ Busca en nombres de archivos
- ✅ Muestra resultados en tiempo real
- ✅ Al borrar búsqueda, vuelve a mostrar todos

---

## 🐛 Errores Comunes y Soluciones

### **Error: "Cannot read properties of undefined"**

**Causa**: La estructura no se cargó correctamente

**Solución**:
1. Verificar que el backend esté corriendo
2. Abrir consola del navegador (F12)
3. Buscar errores de red
4. Verificar que la URL sea correcta: `http://localhost:5000/api/compras`

### **Error: "Failed to fetch"**

**Causa**: El backend no está accesible

**Solución**:
1. Verificar que el backend esté corriendo: `node main.js`
2. Verificar el puerto (debe ser 5000)
3. Verificar CORS en el backend

### **Los documentos no aparecen en la carpeta correcta**

**Causa**: No se envió `folderPath` al subir

**Verificación**:
1. Abrir DevTools > Network
2. Buscar la petición POST a `/api/compras`
3. Ir a "Payload" o "Form Data"
4. Verificar que incluya `folderPath: /nombre-carpeta/`

**Solución**: Ya está implementado, debería funcionar correctamente

### **La estructura no se actualiza después de crear/mover**

**Causa**: No se está recargando desde el backend

**Verificación**:
1. Abrir consola del navegador
2. Buscar: `✅ Estructura de carpetas cargada`
3. Debe aparecer después de cada operación

**Solución**: Ya está implementado en todas las funciones

---

## 📊 Verificar en la Base de Datos

### **MongoDB Compass o Mongo Shell**

```javascript
// Ver carpetas
use intranet
db.folders.find({ department: 'compras' }).pretty()

// Ver documentos
db.compras.find().pretty()

// Ver documento específico con su folderPath
db.compras.findOne({ _id: ObjectId("...") })
```

**Verificar que:**
- ✅ Las carpetas tienen el campo `documents` (array de IDs)
- ✅ Los documentos tienen el campo `folderPath`
- ✅ Los `folderPath` coinciden con las rutas de las carpetas

---

## 📝 Checklist Final

### **Backend**
- [ ] Backend corriendo en puerto 5000
- [ ] MongoDB conectado
- [ ] Carpeta raíz creada automáticamente
- [ ] Endpoints respondiendo correctamente

### **Frontend**
- [ ] Aplicación corriendo en puerto 5173
- [ ] Vista de compras carga sin errores
- [ ] Estructura de carpetas se muestra
- [ ] No hay errores en la consola

### **Funcionalidades**
- [ ] ✅ Cargar estructura de carpetas
- [ ] ✅ Crear carpetas
- [ ] ✅ Eliminar carpetas vacías
- [ ] ✅ Subir documentos con folderPath
- [ ] ✅ Listar documentos
- [ ] ✅ Mover documentos (drag & drop)
- [ ] ✅ Eliminar documentos
- [ ] ✅ Navegar entre carpetas
- [ ] ✅ Breadcrumb funcional
- [ ] ✅ Búsqueda funciona
- [ ] ✅ Descarga de archivos

---

## 🎯 Próximos Pasos

Una vez que todo funcione en **Compras**, aplicar los mismos cambios a:

1. **contabilidad.vue** → `API_BASE_URL = 'http://localhost:5000/api/contabilidad'`
2. **credito.vue** → `API_BASE_URL = 'http://localhost:5000/api/credito'`
3. **tesoreria.vue** → `API_BASE_URL = 'http://localhost:5000/api/tesoreria'`
4. **riesgos.vue** → `API_BASE_URL = 'http://localhost:5000/api/riesgos'`
5. **sistemas.vue** → `API_BASE_URL = 'http://localhost:5000/api/sistemas'`
6. **talentoHumano.vue** → `API_BASE_URL = 'http://localhost:5000/api/talento-humano'`
7. **controlInterno.vue** → `API_BASE_URL = 'http://localhost:5000/api/control-interno'`
8. **gerencia.vue** → `API_BASE_URL = 'http://localhost:5000/api/gerencia'`

---

## 📞 Soporte

Si encuentras algún problema:

1. **Revisar consola del navegador** (F12)
2. **Revisar logs del backend** (terminal donde corre node)
3. **Usar test-integracion-compras.html** para diagnosticar
4. **Verificar estructura en MongoDB**

---

## ✅ Estado

| Componente | Estado | Notas |
|-----------|--------|-------|
| Backend | ✅ Listo | Funcionando correctamente |
| Frontend compras.vue | ✅ Modificado | Integración completa |
| localStorage | ✅ Eliminado | Ya no se usa |
| API Calls | ✅ Implementado | Todos los endpoints conectados |
| Drag & Drop | ✅ Funcional | Usa backend |
| Tests | ✅ Disponible | test-integracion-compras.html |

---

**Fecha**: 17 de Noviembre de 2025  
**Versión**: 1.0  
**Estado**: ✅ Listo para Probar
