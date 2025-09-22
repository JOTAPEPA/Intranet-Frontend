import { defineStore } from 'pinia';
import { ref } from 'vue';
import { isTokenExpired, getValidToken, cleanupInvalidTokens } from '../utils/auth.js';

export const useAuth = defineStore(
  "Auth",
  () => {
    const token = ref("");
    const refreshToken = ref("");
    const userName = ref("")
    const userProfile = ref("")

    function set_token_refreshToken(accesToken, RefreshToken) {
      if (accesToken && RefreshToken) {
        token.value = accesToken;
        refreshToken.value = RefreshToken

        localStorage.setItem("Auth",
          JSON.stringify({
            token: accesToken,
            refreshToken: RefreshToken,
            userProfile: userProfile.value
          })
        )
      } else {
        console.log("Error no se recibio el token");
      }
    }

    function setUsername(email) {
      userName.value = email
    }

    function setUserProfile(profile) {
      userProfile.value = profile
      // Actualizar localStorage cuando se cambie el perfil
      const storedAuth = JSON.parse(localStorage.getItem("Auth") || "{}");
      const storedAuthSimple = JSON.parse(localStorage.getItem("auth") || "{}");
      
      if (storedAuth.token) {
        storedAuth.userProfile = profile;
        localStorage.setItem("Auth", JSON.stringify(storedAuth));
      }
      
      if (storedAuthSimple.token) {
        storedAuthSimple.userProfile = profile;
        localStorage.setItem("auth", JSON.stringify(storedAuthSimple));
      }
    }

    function isAuthenticated() {
      // Verificar si hay token en el store y si es válido
      if (token.value && !isTokenExpired(token.value)) {
        return true;
      }
      
      // Si no hay token válido en el store, verificar localStorage
      const validToken = getValidToken();
      
      if (validToken) {
        // Recargar el token válido en el store
        loadStoredAuth();
        return true;
      }
      
      // Limpiar tokens inválidos
      cleanupInvalidTokens();
      
      return false;
    }

    function isAdmin() {
      console.log('Verificando isAdmin():', { userProfile: userProfile.value, isAdmin: userProfile.value === 'administrador' });
      return userProfile.value === 'administrador';
    }

    function isSistemas() {
      return userProfile.value === 'sistemas';
    }

    function isRecursosHumanos() {
      return userProfile.value === 'recursosHumanos';
    }

    function isGerente() {
      return userProfile.value === 'Gerente';
    }

    function hasAdminAccess() {
      console.log('Verificando hasAdminAccess():', { 
        userProfile: userProfile.value, 
        hasAccess: ['administrador', 'sistemas', 'Gerente'].includes(userProfile.value),
        validRoles: ['administrador', 'sistemas', 'Gerente']
      });
      // Roles que pueden acceder al panel de administración
      return ['administrador', 'sistemas', 'Gerente'].includes(userProfile.value);
    }

    function getUserRole() {
      return userProfile.value || 'sistemas'; // Default role
    }

    function logOut() {
      token.value = "";
      refreshToken.value = "";
      userName.value = "";
      userProfile.value = "";

      // Limpiar localStorage
      localStorage.removeItem("Auth");
      localStorage.removeItem("auth");
      
      console.log("Sesión cerrada correctamente");
    }

    function loadStoredAuth() {
      try {
        // Limpiar tokens inválidos primero
        cleanupInvalidTokens();
        
        const storedAuth = JSON.parse(localStorage.getItem("Auth") || "{}");
        const storedAuthSimple = JSON.parse(localStorage.getItem("auth") || "{}");
        
        // Priorizar 'auth' sobre 'Auth' y verificar validez del token
        if (storedAuthSimple && storedAuthSimple.token && !isTokenExpired(storedAuthSimple.token)) {
          token.value = storedAuthSimple.token;
          userProfile.value = storedAuthSimple.userProfile || "";
          console.log("Auth cargada desde localStorage (auth):", { userProfile: userProfile.value });
        } else if (storedAuth && storedAuth.token && !isTokenExpired(storedAuth.token)) {
          token.value = storedAuth.token;
          refreshToken.value = storedAuth.refreshToken || "";
          userProfile.value = storedAuth.userProfile || "";
          console.log("Auth cargada desde localStorage (Auth):", { userProfile: userProfile.value });
        } else {
          // No hay tokens válidos, limpiar todo
          console.log("No se encontraron tokens válidos");
          logOut();
        }
      } catch (error) {
        console.error("Error loading stored auth:", error);
        // Limpiar localStorage corrupto
        localStorage.removeItem("Auth");
        localStorage.removeItem("auth");
        logOut();
      }
    }

    // Función para establecer token y guardar en localStorage
    function setToken(newToken, profile = null) {
      token.value = newToken;
      
      if (profile) {
        userProfile.value = profile;
        console.log('Perfil establecido en el store:', profile, 'tipo:', typeof profile);
      }
      
      const authData = {
        token: newToken,
        userProfile: userProfile.value
      };
      
      localStorage.setItem('auth', JSON.stringify(authData));
      console.log("Token guardado:", { hasToken: !!newToken, userProfile: userProfile.value });
    }

    loadStoredAuth()

    return {
      token,
      refreshToken,
      userName,
      userProfile,
      set_token_refreshToken,
      setUsername,
      setUserProfile,
      isAuthenticated,
      isAdmin,
      isSistemas,
      isRecursosHumanos,
      isGerente,
      hasAdminAccess,
      getUserRole,
      logOut,
      loadStoredAuth,
      setToken
    }
  },
  {
    persist: true
  }
)