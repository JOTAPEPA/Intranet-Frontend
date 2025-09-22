/**
 * Utilidades para manejo de autenticación y tokens
 */

/**
 * Verifica si un token JWT está expirado
 * @param {string} token - El token JWT a verificar
 * @returns {boolean} - true si el token está expirado, false si es válido
 */
export function isTokenExpired(token) {
  if (!token) return true;
  
  try {
    // Decodificar el token JWT sin verificar la firma (solo para leer el payload)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Verificar si el token tiene campo 'exp' y si está expirado
    if (payload.exp && payload.exp < currentTime) {
      console.log('Token expirado:', {
        exp: new Date(payload.exp * 1000),
        current: new Date()
      });
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error al verificar expiración del token:', error);
    return true; // Considerar inválido si no se puede procesar
  }
}

/**
 * Obtiene información del payload de un token JWT
 * @param {string} token - El token JWT
 * @returns {object|null} - El payload del token o null si es inválido
 */
export function getTokenPayload(token) {
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    console.error('Error al decodificar token:', error);
    return null;
  }
}

/**
 * Valida el formato de un token JWT
 * @param {string} token - El token a validar
 * @returns {boolean} - true si el formato es válido
 */
export function isValidTokenFormat(token) {
  if (!token || typeof token !== 'string') return false;
  
  const parts = token.split('.');
  return parts.length === 3;
}

/**
 * Limpia tokens inválidos o expirados del localStorage
 */
export function cleanupInvalidTokens() {
  try {
    const authData = JSON.parse(localStorage.getItem('auth') || '{}');
    const authDataOld = JSON.parse(localStorage.getItem('Auth') || '{}');
    
    const tokens = [
      { key: 'auth', data: authData },
      { key: 'Auth', data: authDataOld }
    ];
    
    tokens.forEach(({ key, data }) => {
      if (data.token && (isTokenExpired(data.token) || !isValidTokenFormat(data.token))) {
        console.log(`Limpiando token inválido de ${key}`);
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error al limpiar tokens:', error);
    // Limpiar todo si hay errores de parsing
    localStorage.removeItem('auth');
    localStorage.removeItem('Auth');
  }
}

/**
 * Obtiene el token válido más reciente del localStorage
 * @returns {string|null} - El token válido o null
 */
export function getValidToken() {
  try {
    const authData = JSON.parse(localStorage.getItem('auth') || '{}');
    const authDataOld = JSON.parse(localStorage.getItem('Auth') || '{}');
    
    // Priorizar 'auth' sobre 'Auth'
    const tokens = [authData.token, authDataOld.token].filter(Boolean);
    
    for (const token of tokens) {
      if (isValidTokenFormat(token) && !isTokenExpired(token)) {
        return token;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error al obtener token válido:', error);
    return null;
  }
}
