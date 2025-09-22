<template>
  <div class="login-container">
    <!-- Left Panel - Branding -->
    <div class="branding-panel">
      <div class="branding-overlay">
        <div class="branding-content">
          <div class="logo-section">
            <div class="logo-container">
              <q-icon name="business" size="3rem" color="white" />
            </div>
            <h1 class="brand-name">Copvillanueva</h1>
            <p class="brand-tagline">Sistema de Gestión Empresarial</p>
          </div>
          
          <div class="features-list">
            <div class="feature-item">
              <q-icon name="check_circle" color="white" size="1.2rem" />
              <span>Gestión de documentos centralizada</span>
            </div>
            <div class="feature-item">
              <q-icon name="check_circle" color="white" size="1.2rem" />
              <span>Acceso seguro y encriptado</span>
            </div>
            <div class="feature-item">
              <q-icon name="check_circle" color="white" size="1.2rem" />
              <span>Colaboración en tiempo real</span>
            </div>
            <div class="feature-item">
              <q-icon name="check_circle" color="white" size="1.2rem" />
              <span>Reportes y análisis avanzados</span>
            </div>
          </div>
          
          <div class="brand-footer">
            <p>&copy; 2025 Copvillanueva. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Panel - Login Form -->
    <div class="login-panel">
      <div class="login-wrapper">
        <!-- Login Header -->
        <div class="login-header">
          <div class="login-logo">
            <q-icon name="account_circle" color="blue-7" size="3rem" />
          </div>
          <h2 class="login-title">Iniciar Sesión</h2>
          <p class="login-subtitle">Accede a tu panel de control empresarial</p>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="login" class="login-form">
          <!-- Email Input -->
          <div class="form-group">
            <label class="form-label">Correo Electrónico</label>
            <div class="input-container">
              <q-icon name="email" class="input-icon" color="blue-7" />
              <input 
                type="email" 
                placeholder="usuario@copvillanueva.com" 
                required 
                class="form-input"
                v-model="email"
                :disabled="loading"
              />
            </div>
          </div>

          <!-- Password Input -->
          <div class="form-group">
            <label class="form-label">Contraseña</label>
            <div class="input-container">
              <q-icon name="lock" class="input-icon" color="blue-7" />
              <input 
                :type="showPassword ? 'text' : 'password'"
                placeholder="Ingresa tu contraseña" 
                required 
                class="form-input"
                v-model="password"
                :disabled="loading"
              />
              <q-btn 
                flat 
                round 
                :icon="showPassword ? 'visibility_off' : 'visibility'"
                class="password-toggle"
                @click="showPassword = !showPassword"
                color="blue-7"
                size="sm"
              />
            </div>
          </div>

          <!-- Form Options -->
          <div class="form-options">
            <label class="checkbox-wrapper">
              <input type="checkbox" v-model="rememberMe">
              <span class="checkbox-custom"></span>
              <span class="checkbox-label">Recordar sesión</span>
            </label>
            <a href="#" class="forgot-link">¿Olvidaste tu contraseña?</a>
          </div>

          <!-- Error Message -->
          <div v-if="passwordError" class="error-message">
            <q-icon name="error" color="red-6" />
            <span>{{ passwordError }}</span>
          </div>

          <!-- Submit Button -->
          <q-btn 
            type="submit"
            color="blue-7"
            :loading="loading"
            :disable="loading"
            class="submit-button"
            no-caps
            size="lg"
          >
            <template v-if="!loading">
              <q-icon name="login" class="btn-icon" />
              <span>Iniciar Sesión</span>
            </template>
            <template v-else>
              <span>Iniciando sesión...</span>
            </template>
          </q-btn>
        </form>

        <!-- Additional Options -->
        <div class="additional-options">
          <div class="divider">
            <span>o continúa con</span>
          </div>
          
          <div class="social-login">
            <q-btn 
              flat 
              class="social-btn google-btn"
              no-caps
            >
              <q-icon name="mail" color="red-6" />
              <span>Google</span>
            </q-btn>
            <q-btn 
              flat 
              class="social-btn microsoft-btn"
              no-caps
            >
              <q-icon name="business" color="blue-8" />
              <span>Microsoft</span>
            </q-btn>
          </div>
        </div>

        <!-- Footer -->
        <div class="login-footer">
          <p>¿Necesitas ayuda? <a href="#" class="help-link">Contacta soporte</a></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { postData } from '../services/apiClient.js';
import { useRouter } from 'vue-router';
import { useAuth } from '../stores/store.js';
import { useAuthGuard } from '../composables/useAuthGuard.js';

const email = ref('');
const password = ref('');
const loading = ref(false);
const passwordError = ref('');
const showPassword = ref(false);
const rememberMe = ref(false);
const authStore = useAuth();
const router = useRouter();

// Proteger la ruta para que usuarios autenticados no accedan al login
useAuthGuard({ 
  requiresAuth: false, 
  redirectTo: { name: 'home' } 
});

const login = async () => {
  // Limpiar errores previos
  passwordError.value = '';
  loading.value = true;

  try {
    console.log("Iniciando login con:", { email: email.value });

    const response = await postData('/user/login', { 
      email: email.value, 
      password: password.value 
    });
    
    console.log('Respuesta del servidor:', response);

    if (response && response.token) {
      const token = response.token;
      
      // Diferentes formas de extraer el rol dependiendo de la estructura del backend
      let userProfile = 'user'; // valor por defecto
      
      if (response.user && response.user.role) {
        userProfile = response.user.role;
      } else if (response.role) {
        userProfile = response.role;
      } else if (response.profile) {
        userProfile = response.profile;
      } else if (response.type) {
        userProfile = response.type;
      }
      
      console.log('Login exitoso:', { 
        hasToken: !!token, 
        userProfile: userProfile,
        fullResponse: response,
        userObject: response.user
      });

      // Guardar en el store
      authStore.setToken(token, userProfile);
      
      // Opcional: recordar sesión
      if (rememberMe.value) {
        // El token ya se guarda en localStorage por defecto
        console.log("Sesión será recordada");
      }
      
      // Redirigir según el perfil del usuario
      console.log('Redirigiendo usuario con rol:', userProfile);
      
      switch (userProfile) {
        case 'administrador':
        case 'sistemas':
          console.log("Redirigiendo a admin");
          await router.push("/admin");
          break;
        default:
          console.log("Redirigiendo a home");
          await router.push("/home");
          break;
      }

    } else {
      console.error('Respuesta sin token:', response);
      passwordError.value = 'Error en la respuesta del servidor';
    }

  } catch (error) {
    console.error('Error durante el login:', error);
    
    // Manejar diferentes tipos de errores
    if (error.response) {
      const statusCode = error.response.status;
      const errorData = error.response.data;
      
      if (statusCode === 401) {
        passwordError.value = 'Credenciales incorrectas';
      } else if (statusCode === 400) {
        passwordError.value = errorData.message || 'Datos inválidos';
      } else if (statusCode === 500) {
        passwordError.value = 'Error del servidor. Intenta más tarde';
      } else {
        passwordError.value = errorData.message || `Error ${statusCode}`;
      }
    } else if (error.request) {
      passwordError.value = 'No se pudo conectar con el servidor';
    } else {
      passwordError.value = 'Error inesperado durante el login';
    }
  } finally {
    loading.value = false;
  }
}



</script>

<style scoped>
/* Variables CSS para consistencia de colores */
:root {
  --primary-blue: #1976d2;
  --light-blue: #42a5f5;
  --blue-gradient-start: #1976d2;
  --blue-gradient-end: #1565c0;
  --light-blue-gradient-start: #42a5f5;
  --light-blue-gradient-end: #2196f3;
  --white: #ffffff;
  --light-gray: #f8fafc;
  --border-color: #e1f5fe;
  --text-primary: #1a202c;
  --text-secondary: #64748b;
  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --transition: all 0.3s ease;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: var(--text-primary);
}

.login-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* Branding Panel */
.branding-panel {
  flex: 1;
  background: linear-gradient(135deg, var(--blue-gradient-start) 0%, var(--blue-gradient-end) 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.branding-panel::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 70%);
  animation: pulse 20s infinite alternate;
}

@keyframes pulse {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.branding-overlay {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: var(--white);
}

.branding-content {
  max-width: 500px;
  text-align: center;
}

.logo-section {
  margin-bottom: 3rem;
}

.logo-container {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem auto;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.brand-name {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  letter-spacing: -0.02em;
}

.brand-tagline {
  font-size: 1.25rem;
  opacity: 0.9;
  font-weight: 400;
}

.features-list {
  margin-bottom: 3rem;
  text-align: left;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 1.125rem;
  opacity: 0.95;
}

.brand-footer {
  font-size: 0.875rem;
  opacity: 0.8;
}

/* Login Panel */
.login-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--white);
  padding: 2rem;
}

.login-wrapper {
  width: 100%;
  max-width: 420px;
}

/* Login Header */
.login-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.login-logo {
  margin-bottom: 1.5rem;
}

.login-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  letter-spacing: -0.02em;
}

.login-subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
  line-height: 1.5;
}

/* Form Styles */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  z-index: 2;
}

.form-input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  font-size: 1rem;
  transition: var(--transition);
  background-color: var(--white);
  color: var(--text-primary);
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.15);
}

.form-input::placeholder {
  color: var(--text-secondary);
}

.password-toggle {
  position: absolute;
  right: 0.5rem;
  z-index: 2;
}

/* Form Options */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: var(--text-secondary);
}

.checkbox-wrapper input[type="checkbox"] {
  display: none;
}

.checkbox-custom {
  width: 18px;
  height: 18px;
  border: 2px solid var(--border-color);
  border-radius: 4px;
  margin-right: 0.5rem;
  position: relative;
  transition: var(--transition);
}

.checkbox-wrapper input[type="checkbox"]:checked + .checkbox-custom {
  background-color: var(--primary-blue);
  border-color: var(--primary-blue);
}

.checkbox-wrapper input[type="checkbox"]:checked + .checkbox-custom::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.checkbox-label {
  font-weight: 500;
}

.forgot-link {
  color: var(--primary-blue);
  text-decoration: none;
  font-weight: 500;
  transition: var(--transition);
}

.forgot-link:hover {
  text-decoration: underline;
}

/* Error Message */
.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background-color: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.3);
  border-radius: 8px;
  color: #d32f2f;
  font-size: 0.875rem;
}

/* Submit Button */
.submit-button {
  width: 100%;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 12px;
  box-shadow: var(--shadow);
  transition: var(--transition);
  letter-spacing: 0.02em;
}

.submit-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn-icon {
  margin-right: 0.5rem;
}

/* Additional Options */
.additional-options {
  margin-top: 2rem;
}

.divider {
  position: relative;
  text-align: center;
  margin: 1.5rem 0;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--border-color);
}

.divider span {
  background: var(--white);
  padding: 0 1rem;
  position: relative;
  z-index: 1;
}

.social-login {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.social-btn {
  padding: 0.875rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 10px;
  color: var(--text-secondary);
  transition: var(--transition);
  font-weight: 500;
}

.social-btn:hover {
  border-color: var(--primary-blue);
  color: var(--primary-blue);
  transform: translateY(-1px);
}

.google-btn:hover {
  border-color: #db4437;
  color: #db4437;
}

.microsoft-btn:hover {
  border-color: #0078d4;
  color: #0078d4;
}

/* Footer */
.login-footer {
  text-align: center;
  margin-top: 2rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.help-link {
  color: var(--primary-blue);
  text-decoration: none;
  font-weight: 500;
  transition: var(--transition);
}

.help-link:hover {
  text-decoration: underline;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .branding-content {
    max-width: 400px;
  }
  
  .brand-name {
    font-size: 2rem;
  }
  
  .features-list {
    margin-bottom: 2rem;
  }
}

@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
  }
  
  .branding-panel {
    display: none;
  }
  
  .login-panel {
    padding: 1rem;
  }
  
  .login-wrapper {
    max-width: 100%;
  }
  
  .login-title {
    font-size: 1.75rem;
  }
  
  .social-login {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .login-header {
    margin-bottom: 2rem;
  }
  
  .login-title {
    font-size: 1.5rem;
  }
  
  .form-input {
    padding: 0.875rem 0.875rem 0.875rem 2.75rem;
  }
  
  .submit-button {
    padding: 0.875rem 1.5rem;
  }
}

/* Animaciones y transiciones suaves */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-wrapper {
  animation: fadeIn 0.6s ease-out;
}

.branding-content {
  animation: fadeIn 0.8s ease-out;
}

/* Mejoras para accesibilidad */
.form-input:focus,
.submit-button:focus,
.social-btn:focus {
  outline: 2px solid var(--primary-blue);
  outline-offset: 2px;
}

/* Estados de loading */
.submit-button[loading] {
  opacity: 0.8;
  cursor: not-allowed;
}

/* Mejoras visuales adicionales */
.form-input:not(:placeholder-shown) {
  background-color: rgba(25, 118, 210, 0.02);
}

.input-container:hover .form-input {
  border-color: rgba(25, 118, 210, 0.5);
}
</style>