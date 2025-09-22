# Sistema de Autenticación con Token

## 📋 Funcionalidades Implementadas

### 🔐 **Autenticación Robusta**
- **Login seguro** con validación de credenciales
- **Tokens JWT** para autenticación
- **Validación de expiración** de tokens automática
- **Limpieza automática** de tokens inválidos

### 🛡️ **Protección de Rutas**
- **Guards de navegación** en todas las rutas protegidas
- **Verificación automática** de autenticación
- **Redirección inteligente** según el rol del usuario
- **Prevención de acceso** a rutas sin permisos

### 🏠 **Rutas y Permisos**

| Ruta | Requiere Auth | Roles Permitidos | Descripción |
|------|---------------|------------------|-------------|
| `/` (login) | ❌ | - | Página de inicio de sesión |
| `/home` | ✅ | Todos | Panel principal del usuario |
| `/documentos` | ✅ | Todos | Gestión de documentos |
| `/admin` | ✅ | `administrador`, `sistemas`, `Gerente` | Panel de administración |
| `/recursos-humanos` | ✅ | `recursosHumanos`, `administrador`, `Gerente` | Panel de RRHH |
| `/gerencia` | ✅ | `Gerente`, `administrador` | Dashboard ejecutivo |

### 👥 **Roles del Sistema**

#### **Roles Disponibles** (según modelo backend):
- `sistemas` - Rol por defecto, acceso básico
- `administrador` - Acceso completo al sistema
- `recursosHumanos` - Gestión de empleados y nóminas
- `Gerente` - Dashboard ejecutivo y reportes

#### **Jerarquía de Permisos**:
1. **`administrador`** - Acceso completo a todas las vistas
2. **`Gerente`** - Acceso a gerencia, RRHH y admin
3. **`sistemas`** - Acceso a admin y vistas básicas
4. **`recursosHumanos`** - Acceso a RRHH y vistas básicas

### 🔄 **Flujo de Autenticación Actualizado**

1. **Usuario accede al login** (`/`)
2. **Ingresa credenciales** (email + contraseña)
3. **Sistema valida** con el backend
4. **Recibe token JWT** y perfil de usuario
5. **Guarda en localStorage** y store de Pinia
6. **Redirige según rol**:
   - `administrador` o `sistemas` → `/admin`
   - `Gerente` → `/gerencia`
   - `recursosHumanos` → `/recursos-humanos`
   - Otros → `/home`

### 🚪 **Protección Automática**

- **Al acceder a ruta protegida**:
  - Verifica token válido
  - Redirige a login si no está autenticado
  - Redirige a home si no tiene permisos de admin

- **Al acceder al login estando autenticado**:
  - Redirige automáticamente según rol

### 💾 **Gestión de Estado**

#### Store de Pinia (`stores/store.js`)
```javascript
// Verificar autenticación
authStore.isAuthenticated() // true/false

// Verificar roles específicos
authStore.isAdmin() // true/false - administrador
authStore.isSistemas() // true/false - sistemas
authStore.isGerente() // true/false - Gerente
authStore.isRecursosHumanos() // true/false - recursosHumanos

// Verificar acceso administrativo (admin, sistemas, gerente)
authStore.hasAdminAccess() // true/false

// Obtener rol actual
authStore.getUserRole() // string del rol

// Cerrar sesión
authStore.logOut()

// Establecer token
authStore.setToken(token, userProfile)
```

#### Composable de Guards (`composables/useAuthGuard.js`)
```javascript
// Proteger componente con autenticación
useAuthGuard({ requiresAuth: true })

// Proteger con acceso administrativo
useAuthGuard({ requiresAuth: true, requiresAdminAccess: true })

// Proteger con roles específicos
useAuthGuard({ 
    requiresAuth: true, 
    allowedRoles: ['recursosHumanos', 'administrador', 'Gerente'] 
})

// Redirigir usuarios autenticados
useAuthGuard({ requiresAuth: false, redirectTo: '/home' })
```

### 🔧 **Configuración de Axios**

- **Headers automáticos**: Token incluido en todas las peticiones
- **Interceptores de respuesta**: Manejo automático de errores 401/403
- **Logout automático**: Si el token es inválido o expirado

### 🛠️ **Utilidades de Token** (`utils/auth.js`)

```javascript
import { isTokenExpired, getValidToken, cleanupInvalidTokens } from '../utils/auth.js'

// Verificar si token está expirado
isTokenExpired(token) // true/false

// Obtener token válido del localStorage
getValidToken() // token string o null

// Limpiar tokens inválidos
cleanupInvalidTokens()
```

## 🚀 **Uso en Componentes**

### Proteger una Vista
```vue
<script setup>
import { useAuthGuard } from '../composables/useAuthGuard.js'

// Para rutas que requieren autenticación básica
useAuthGuard({ requiresAuth: true })

// Para rutas que requieren acceso administrativo (admin, sistemas, gerente)
useAuthGuard({ requiresAuth: true, requiresAdminAccess: true })

// Para rutas con roles específicos
useAuthGuard({ 
    requiresAuth: true, 
    allowedRoles: ['recursosHumanos', 'administrador'] 
})
</script>
```

### Verificar Estado de Autenticación y Roles
```vue
<script setup>
import { useAuth } from '../stores/store.js'

const authStore = useAuth()

// Verificar si está autenticado
if (authStore.isAuthenticated()) {
  // Usuario autenticado
}

// Verificar roles específicos
if (authStore.isAdmin()) {
  // Es administrador
}

if (authStore.isGerente()) {
  // Es gerente
}

if (authStore.hasAdminAccess()) {
  // Tiene acceso administrativo (admin, sistemas, gerente)
}

// Obtener rol actual
const currentRole = authStore.getUserRole()
</script>
```

### Hacer Logout
```vue
<script setup>
import { useAuth } from '../stores/store.js'
import { useRouter } from 'vue-router'

const authStore = useAuth()
const router = useRouter()

function handleLogout() {
  authStore.logOut()
  router.push('/')
}
</script>
```

## 🔍 **Debugging**

El sistema incluye logs detallados en la consola para facilitar el debugging:

- **Login exitoso/fallido**
- **Verificación de tokens**
- **Redirecciones de rutas**
- **Limpieza de tokens inválidos**
- **Peticiones API con/sin token**

## 📱 **Características Adicionales**

- **Responsive**: Funciona en desktop y móvil
- **Multi-pestaña**: Sincronización entre pestañas del navegador
- **Persistencia**: Estado mantenido al refrescar la página
- **Validación**: Verificación continua de validez del token
- **UX mejorada**: Loading states y manejo de errores

## 🔒 **Seguridad**

- Tokens almacenados de forma segura
- Validación de expiración automática
- Limpieza de datos sensibles al logout
- Headers de autenticación automáticos
- Prevención de acceso no autorizado
