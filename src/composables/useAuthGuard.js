import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../stores/store.js'

export function useAuthGuard(options = {}) {
  const router = useRouter()
  const authStore = useAuth()
  
  const {
    requiresAuth = true,
    requiresAdminAccess = false,
    allowedRoles = null,
    redirectTo = null
  } = options

  const checkAuth = () => {
    if (requiresAuth && !authStore.isAuthenticated()) {
      console.log('AuthGuard: Usuario no autenticado, redirigiendo al login')
      router.push({ name: 'login' })
      return false
    }
    
    if (requiresAdminAccess && !authStore.hasAdminAccess()) {
      console.log('AuthGuard: Usuario sin acceso administrativo, redirigiendo')
      router.push(getDefaultRouteForRole(authStore.getUserRole()))
      return false
    }
    
    if (allowedRoles && !allowedRoles.includes(authStore.getUserRole())) {
      console.log('AuthGuard: Rol no permitido, redirigiendo')
      router.push(getDefaultRouteForRole(authStore.getUserRole()))
      return false
    }
    
    if (redirectTo && !requiresAuth && authStore.isAuthenticated()) {
      console.log('AuthGuard: Usuario ya autenticado, redirigiendo')
      router.push(redirectTo)
      return false
    }
    
    return true
  }

  // Función para obtener la ruta por defecto según el rol
  const getDefaultRouteForRole = (role) => {
    switch (role) {
      case 'administrador':
      case 'sistemas':
        return { name: 'admin' }
      default:
        return { name: 'home' }
    }
  }

  const handleStorageChange = (event) => {
    if (event.key === 'auth' || event.key === 'Auth') {
      console.log('AuthGuard: Cambio detectado en localStorage, verificando autenticación')
      authStore.loadStoredAuth()
      setTimeout(checkAuth, 100) // Pequeño delay para asegurar que el store se actualice
    }
  }

  onMounted(() => {
    // Verificar autenticación al montar el componente
    checkAuth()
    
    // Escuchar cambios en localStorage (útil para múltiples pestañas)
    window.addEventListener('storage', handleStorageChange)
  })

  onUnmounted(() => {
    window.removeEventListener('storage', handleStorageChange)
  })

  return {
    checkAuth,
    isAuthenticated: () => authStore.isAuthenticated(),
    hasAdminAccess: () => authStore.hasAdminAccess(),
    userRole: () => authStore.getUserRole(),
    isAdmin: () => authStore.isAdmin(),
    isSistemas: () => authStore.isSistemas(),
    isGerente: () => authStore.isGerente(),
    isRecursosHumanos: () => authStore.isRecursosHumanos()
  }
}
