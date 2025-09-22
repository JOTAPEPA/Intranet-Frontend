import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '../stores/store.js'
import login from '../views/login.vue'
import home from '../views/home.vue'
import documentos from '../views/documentos.vue'
import admin from '../views/admin.vue'
import talentoHumano from '../views/talentoHumano.vue'
import gerencia from '../views/gerencia.vue'
import contabilidad from '../views/contabilidad.vue'
import tesoreria from '../views/tesoreria.vue'
import credito from '../views/credito.vue'
import controlInterno from '../views/controlInterno.vue'
import riesgos from '../views/riesgos.vue'
import compras from '../views/compras.vue'
import profile from '../views/profile.vue'

const routes = [
  {
    path: '/',
    name: 'login',
    component: login,
    meta: { requiresGuest: true } // Solo accesible si NO está autenticado
   },

   {
    path: '/home',
    name: 'home',
    component: home,
    meta: { requiresAuth: true } // Requiere autenticación
   },
   {
    path: '/documentos',
    name: 'documentos',
    component: documentos,
    meta: { requiresAuth: true } // Requiere autenticación
   },

   {
    path: '/admin',
    name: 'admin',
    component: admin,
    meta: { requiresAuth: true, requiresAdminAccess: true } // Requiere autenticación y acceso administrativo
   },

   // Ruta específica para Recursos Humanos
   {
    path: '/talento-humano',
    name: 'talento-humano',
    component: talentoHumano,
    meta: { requiresAuth: true, allowedRoles: ['talentoHumano', 'administrador', 'sistemas'] }
   },

   // Ruta específica para Gerencia
   {
    path: '/gerencia',
    name: 'gerencia', 
    component: gerencia,
    meta: { requiresAuth: true, allowedRoles: ['gerencia', 'administrador', 'sistemas'] }
   },

   // Ruta específica para Contabilidad
   {
    path: '/contabilidad',
    name: 'contabilidad',
    component: contabilidad,
    meta: { requiresAuth: true, allowedRoles: ['contabilidad', 'administrador', 'sistemas'] }
   },

   // Ruta específica para Tesorería
   {
    path: '/tesoreria',
    name: 'tesoreria',
    component: tesoreria,
    meta: { requiresAuth: true, allowedRoles: ['tesoreria', 'administrador', 'sistemas'] }
   },

   // Ruta específica para Crédito
   {
    path: '/credito',
    name: 'credito',
    component: credito,
    meta: { requiresAuth: true, allowedRoles: ['credito', 'administrador', 'sistemas'] }
   },

   // Ruta específica para Control Interno
   {
    path: '/control-interno',
    name: 'control-interno',
    component: controlInterno,
    meta: { requiresAuth: true, allowedRoles: ['controlInterno', 'administrador', 'sistemas'] }
   },

   // Ruta específica para Riesgos
   {
    path: '/riesgos',
    name: 'riesgos',
    component: riesgos,
    meta: { requiresAuth: true, allowedRoles: ['riesgos', 'administrador', 'sistemas'] }
   },

   // Ruta específica para Compras
   {
    path: '/compras',
    name: 'compras',
    component: compras,
    meta: { requiresAuth: true, allowedRoles: ['compras', 'administrador', 'sistemas'] }
   },

   // Ruta de fallback para rutas no encontradas
   {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: { name: 'login' }
   },

   {
    path: '/profile',
    name: 'perfil',
    component: profile
   }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guard de navegación global
router.beforeEach((to, from, next) => {
  const authStore = useAuth()
  
  // Verificar si la ruta requiere autenticación
  if (to.meta.requiresAuth) {
    const isAuth = authStore.isAuthenticated();
    console.log('Verificando autenticación:', { 
      isAuthenticated: isAuth, 
      userRole: authStore.getUserRole(),
      targetRoute: to.name 
    });
    
    if (!isAuth) {
      // No está autenticado, redirigir al login
      console.log('Acceso denegado: No autenticado')
      next({ name: 'login' })
      return
    }
    
    // Verificar si requiere acceso administrativo (admin, sistemas, gerente)
    if (to.meta.requiresAdminAccess) {
      const hasAdminAccess = authStore.hasAdminAccess();
      console.log('Verificando acceso administrativo:', { 
        hasAdminAccess: hasAdminAccess,
        userRole: authStore.getUserRole(),
        targetRoute: to.name
      });
      
      if (!hasAdminAccess) {
        // No tiene acceso administrativo, redirigir según rol
        console.log('Acceso denegado: Sin permisos administrativos')
        next(getDefaultRouteForRole(authStore.getUserRole()))
        return
      }
    }
    
    // Verificar roles específicos permitidos
    if (to.meta.allowedRoles && !to.meta.allowedRoles.includes(authStore.getUserRole())) {
      console.log('Acceso denegado: Rol no permitido para esta ruta')
      next(getDefaultRouteForRole(authStore.getUserRole()))
      return
    }
  }
  
  // Verificar si la ruta requiere ser invitado (no autenticado)
  if (to.meta.requiresGuest && authStore.isAuthenticated()) {
    // Ya está autenticado, redirigir según el rol
    next(getDefaultRouteForRole(authStore.getUserRole()))
    return
  }
  
  // Permitir la navegación
  next()
})


function getDefaultRouteForRole(role) {
  console.log('Obteniendo ruta por defecto para rol:', role);
  
  switch (role) {
    case 'administrador':
    case 'sistemas':
      console.log('Redirigiendo a admin para rol:', role);
      return { name: 'admin' }
    case 'gerencia':
      console.log('Redirigiendo a gerencia para rol:', role);
      return { name: 'gerencia' }
    case 'talentoHumano':
      console.log('Redirigiendo a talento-humano para rol:', role);
      return { name: 'talento-humano' }
    case 'contabilidad':
      console.log('Redirigiendo a contabilidad para rol:', role);
      return { name: 'contabilidad' }
    case 'tesoreria':
      console.log('Redirigiendo a tesoreria para rol:', role);
      return { name: 'tesoreria' }
    case 'credito':
      console.log('Redirigiendo a credito para rol:', role);
      return { name: 'credito' }
    case 'controlInterno':
      console.log('Redirigiendo a control-interno para rol:', role);
      return { name: 'control-interno' }
    case 'riesgos':
      console.log('Redirigiendo a riesgos para rol:', role);
      return { name: 'riesgos' }
    case 'compras':
      console.log('Redirigiendo a compras para rol:', role);
      return { name: 'compras' }
    default:
      console.log('Redirigiendo a home para rol:', role);
      return { name: 'home' }
  }
}