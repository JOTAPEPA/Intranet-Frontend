<template>
    <div class="profile-container">
        <!-- Sidebar Navigation -->
        <div class="sidebar">
            <div class="sidebar-header">
                <div class="user-profile">
                    <q-avatar size="50px" class="profile-avatar">
                        <img :src="userInfo.avatar" alt="Avatar del usuario">
                    </q-avatar>
                    <div class="user-info">
                        <h6 class="user-name">{{ userInfo.name }}</h6>
                        <span class="user-role">{{ userInfo.role }}</span>
                    </div>
                </div>
            </div>

            <div class="sidebar-menu">
                <q-btn flat icon="home" label="Inicio" align="left" class="menu-item" no-caps @click="goHome" />
                <q-btn flat icon="description" label="Documentos" align="left" class="menu-item" no-caps @click="goToDocuments" />
                <q-btn flat icon="help" label="Ayuda" align="left" class="menu-item" no-caps />
            </div>
        </div>

        <!-- Main Content -->
        <div class="main-content">
            <!-- Header -->
            <div class="content-header">
                <div class="header-left">
                    <h4 class="page-title">Mi Perfil</h4>
                    <p class="page-subtitle">Gestiona tu información personal y configuración</p>
                </div>
                <div class="header-actions">
                    <q-btn flat round icon="notifications" class="action-btn" size="md">
                        <q-tooltip>Notificaciones</q-tooltip>
                        <q-badge color="red" floating>3</q-badge>
                    </q-btn>
                    <q-btn flat round color="blue-7" icon="person" class="action-btn active" size="md">
                        <q-tooltip>Ver Perfil</q-tooltip>
                    </q-btn>
                    <q-btn flat round color="red-6" icon="logout" @click="handleLogout" class="action-btn" size="md">
                        <q-tooltip>Cerrar Sesión</q-tooltip>
                    </q-btn>
                </div>
            </div>

            <!-- Profile Content -->
            <div class="profile-content">
                <!-- User Profile Card -->
                <div class="profile-card-section">
                    <q-card class="profile-card">
                        <div class="profile-banner">
                            <div class="profile-banner-content">
                                <q-avatar size="120px" class="profile-main-avatar">
                                    <img :src="userInfo.avatar" alt="Avatar del usuario">
                                </q-avatar>
                                <div class="profile-main-info">
                                    <h3 class="profile-main-name">{{ userInfo.name }}</h3>
                                    <p class="profile-main-role">{{ userInfo.role }}</p>
                                    <p class="profile-main-department">{{ userInfo.department }}</p>
                                    <div class="profile-status">
                                        <q-chip color="green" text-color="white" icon="circle" size="sm">
                                            Activo
                                        </q-chip>
                                    </div>
                                </div>
                                <div class="profile-actions-top">
                                    <q-btn icon="edit" label="Editar Perfil" color="primary" @click="editProfile" />
                                    <q-btn icon="photo_camera" flat round color="primary" @click="changeAvatar">
                                        <q-tooltip>Cambiar Avatar</q-tooltip>
                                    </q-btn>
                                </div>
                            </div>
                        </div>
                    </q-card>
                </div>

                <!-- Stats and Quick Info -->
                <div class="stats-section">
                    <div class="stats-grid">
                        <q-card class="stat-card blue-gradient">
                            <q-card-section>
                                <div class="stat-content">
                                    <div class="stat-icon">
                                        <q-icon name="description" size="2rem" color="white" />
                                    </div>
                                    <div class="stat-info">
                                        <h3 class="stat-number">{{ userStats.documentsCreated }}</h3>
                                        <p class="stat-label">Documentos Creados</p>
                                    </div>
                                </div>
                            </q-card-section>
                        </q-card>

                        <q-card class="stat-card light-blue-gradient">
                            <q-card-section>
                                <div class="stat-content">
                                    <div class="stat-icon">
                                        <q-icon name="schedule" size="2rem" color="white" />
                                    </div>
                                    <div class="stat-info">
                                        <h3 class="stat-number">{{ userStats.daysActive }}</h3>
                                        <p class="stat-label">Días Activo</p>
                                    </div>
                                </div>
                            </q-card-section>
                        </q-card>

                        <q-card class="stat-card white-card">
                            <q-card-section>
                                <div class="stat-content">
                                    <div class="stat-icon blue-icon">
                                        <q-icon name="access_time" size="2rem" color="blue-7" />
                                    </div>
                                    <div class="stat-info">
                                        <h3 class="stat-number">{{ userStats.lastLogin }}</h3>
                                        <p class="stat-label">Último Acceso</p>
                                    </div>
                                </div>
                            </q-card-section>
                        </q-card>
                    </div>
                </div>

                <!-- Profile Information Tabs -->
                <div class="profile-tabs-section">
                    <q-card class="profile-tabs-card">
                        <q-tabs
                            v-model="activeTab"
                            class="profile-tabs"
                            indicator-color="primary"
                            align="justify"
                            narrow-indicator
                        >
                            <q-tab name="personal" icon="person" label="Información Personal" />
                            <q-tab name="security" icon="security" label="Seguridad" />
                            <q-tab name="preferences" icon="settings" label="Preferencias" />
                            <q-tab name="activity" icon="history" label="Actividad" />
                        </q-tabs>

                        <q-separator />

                        <q-tab-panels v-model="activeTab" animated>
                            <!-- Personal Information Tab -->
                            <q-tab-panel name="personal">
                                <div class="personal-info-content">
                                    <div class="info-section">
                                        <h5 class="section-title">Información Básica</h5>
                                        <div class="info-grid">
                                            <div class="info-item">
                                                <q-icon name="person" class="info-icon" />
                                                <div class="info-details">
                                                    <span class="info-label">Nombre Completo</span>
                                                    <span class="info-value">{{ personalInfo.fullName }}</span>
                                                </div>
                                            </div>
                                            <div class="info-item">
                                                <q-icon name="email" class="info-icon" />
                                                <div class="info-details">
                                                    <span class="info-label">Correo Electrónico</span>
                                                    <span class="info-value">{{ personalInfo.email }}</span>
                                                </div>
                                            </div>
                                            <div class="info-item">
                                                <q-icon name="phone" class="info-icon" />
                                                <div class="info-details">
                                                    <span class="info-label">Teléfono</span>
                                                    <span class="info-value">{{ personalInfo.phone }}</span>
                                                </div>
                                            </div>
                                            <div class="info-item">
                                                <q-icon name="badge" class="info-icon" />
                                                <div class="info-details">
                                                    <span class="info-label">Identificación</span>
                                                    <span class="info-value">{{ personalInfo.identification }}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="info-section">
                                        <h5 class="section-title">Información Laboral</h5>
                                        <div class="info-grid">
                                            <div class="info-item">
                                                <q-icon name="work" class="info-icon" />
                                                <div class="info-details">
                                                    <span class="info-label">Cargo</span>
                                                    <span class="info-value">{{ personalInfo.position }}</span>
                                                </div>
                                            </div>
                                            <div class="info-item">
                                                <q-icon name="business" class="info-icon" />
                                                <div class="info-details">
                                                    <span class="info-label">Departamento</span>
                                                    <span class="info-value">{{ personalInfo.department }}</span>
                                                </div>
                                            </div>
                                            <div class="info-item">
                                                <q-icon name="calendar_today" class="info-icon" />
                                                <div class="info-details">
                                                    <span class="info-label">Fecha de Ingreso</span>
                                                    <span class="info-value">{{ personalInfo.startDate }}</span>
                                                </div>
                                            </div>
                                            <div class="info-item">
                                                <q-icon name="supervisor_account" class="info-icon" />
                                                <div class="info-details">
                                                    <span class="info-label">Supervisor</span>
                                                    <span class="info-value">{{ personalInfo.supervisor }}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </q-tab-panel>

                            <!-- Security Tab -->
                            <q-tab-panel name="security">
                                <div class="security-content">
                                    <div class="security-section">
                                        <h5 class="section-title">Configuración de Seguridad</h5>
                                        <div class="security-options">
                                            <q-card class="security-card">
                                                <q-card-section>
                                                    <div class="security-item">
                                                        <div class="security-info">
                                                            <q-icon name="lock" class="security-icon" />
                                                            <div>
                                                                <h6>Cambiar Contraseña</h6>
                                                                <p>Actualiza tu contraseña regularmente para mantener tu cuenta segura</p>
                                                            </div>
                                                        </div>
                                                        <q-btn color="primary" @click="changePassword">Cambiar</q-btn>
                                                    </div>
                                                </q-card-section>
                                            </q-card>

                                            <q-card class="security-card">
                                                <q-card-section>
                                                    <div class="security-item">
                                                        <div class="security-info">
                                                            <q-icon name="security" class="security-icon" />
                                                            <div>
                                                                <h6>Autenticación de Dos Factores</h6>
                                                                <p>Añade una capa extra de seguridad a tu cuenta</p>
                                                            </div>
                                                        </div>
                                                        <q-toggle v-model="twoFactorEnabled" color="primary" @update:model-value="toggleTwoFactor" />
                                                    </div>
                                                </q-card-section>
                                            </q-card>

                                            <q-card class="security-card">
                                                <q-card-section>
                                                    <div class="security-item">
                                                        <div class="security-info">
                                                            <q-icon name="history" class="security-icon" />
                                                            <div>
                                                                <h6>Historial de Sesiones</h6>
                                                                <p>Revisa las sesiones recientes en tu cuenta</p>
                                                            </div>
                                                        </div>
                                                        <q-btn color="primary" flat @click="viewSessions">Ver Historial</q-btn>
                                                    </div>
                                                </q-card-section>
                                            </q-card>
                                        </div>
                                    </div>
                                </div>
                            </q-tab-panel>

                            <!-- Preferences Tab -->
                            <q-tab-panel name="preferences">
                                <div class="preferences-content">
                                    <div class="preferences-section">
                                        <h5 class="section-title">Preferencias de Usuario</h5>
                                        <div class="preferences-options">
                                            <q-card class="preference-card">
                                                <q-card-section>
                                                    <div class="preference-item">
                                                        <div class="preference-info">
                                                            <q-icon name="notifications" class="preference-icon" />
                                                            <div>
                                                                <h6>Notificaciones por Email</h6>
                                                                <p>Recibe notificaciones importantes en tu correo</p>
                                                            </div>
                                                        </div>
                                                        <q-toggle v-model="emailNotifications" color="primary" />
                                                    </div>
                                                </q-card-section>
                                            </q-card>

                                            <q-card class="preference-card">
                                                <q-card-section>
                                                    <div class="preference-item">
                                                        <div class="preference-info">
                                                            <q-icon name="palette" class="preference-icon" />
                                                            <div>
                                                                <h6>Tema de la Aplicación</h6>
                                                                <p>Personaliza la apariencia de la interfaz</p>
                                                            </div>
                                                        </div>
                                                        <q-select
                                                            v-model="selectedTheme"
                                                            :options="themeOptions"
                                                            style="min-width: 150px"
                                                        />
                                                    </div>
                                                </q-card-section>
                                            </q-card>

                                            <q-card class="preference-card">
                                                <q-card-section>
                                                    <div class="preference-item">
                                                        <div class="preference-info">
                                                            <q-icon name="language" class="preference-icon" />
                                                            <div>
                                                                <h6>Idioma</h6>
                                                                <p>Selecciona el idioma de la interfaz</p>
                                                            </div>
                                                        </div>
                                                        <q-select
                                                            v-model="selectedLanguage"
                                                            :options="languageOptions"
                                                            style="min-width: 150px"
                                                        />
                                                    </div>
                                                </q-card-section>
                                            </q-card>
                                        </div>
                                    </div>
                                </div>
                            </q-tab-panel>

                            <!-- Activity Tab -->
                            <q-tab-panel name="activity">
                                <div class="activity-content">
                                    <div class="activity-section">
                                        <h5 class="section-title">Actividad Reciente</h5>
                                        <div class="activity-list">
                                            <div class="activity-item" v-for="activity in recentActivity" :key="activity.id">
                                                <div class="activity-icon">
                                                    <q-icon :name="activity.icon" :color="activity.color" />
                                                </div>
                                                <div class="activity-details">
                                                    <h6 class="activity-title">{{ activity.title }}</h6>
                                                    <p class="activity-description">{{ activity.description }}</p>
                                                    <span class="activity-time">{{ activity.time }}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </q-tab-panel>
                        </q-tab-panels>
                    </q-card>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuth } from '../stores/store.js'

const router = useRouter()
const $q = useQuasar()
const authStore = useAuth()

// Reactive data
const activeTab = ref('personal')
const twoFactorEnabled = ref(false)
const emailNotifications = ref(true)
const selectedTheme = ref('Claro')
const selectedLanguage = ref('Español')

// User information
const userInfo = ref({
    name: 'Copvillanueva',
    role: 'Administrador',
    department: 'Sistemas',
    avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8iGDQ6VWECRIntbY5F6ZBYz-wCHgqzXM_FA&s'
})

// User statistics
const userStats = ref({
    documentsCreated: 45,
    daysActive: 120,
    lastLogin: 'Hoy'
})

// Personal information
const personalInfo = ref({
    fullName: 'Cooperativa Villanueva',
    email: 'admin@copvillanueva.com',
    phone: '+57 300 123 4567',
    identification: '12.345.678-9',
    position: 'Administrador del Sistema',
    department: 'Tecnología e Información',
    startDate: '15 de enero, 2023',
    supervisor: 'Gerente General'
})

// Theme and language options
const themeOptions = ['Claro', 'Oscuro', 'Auto']
const languageOptions = ['Español', 'English', 'Português']

// Recent activity data
const recentActivity = ref([
    {
        id: 1,
        icon: 'description',
        color: 'blue',
        title: 'Documento creado',
        description: 'Has creado un nuevo documento en el módulo de Contabilidad',
        time: 'Hace 2 horas'
    },
    {
        id: 2,
        icon: 'login',
        color: 'green',
        title: 'Inicio de sesión',
        description: 'Iniciaste sesión en el sistema',
        time: 'Hace 4 horas'
    },
    {
        id: 3,
        icon: 'edit',
        color: 'orange',
        title: 'Perfil actualizado',
        description: 'Has actualizado tu información de contacto',
        time: 'Ayer'
    },
    {
        id: 4,
        icon: 'download',
        color: 'purple',
        title: 'Documento descargado',
        description: 'Descargaste un archivo del módulo de Tesorería',
        time: 'Hace 2 días'
    },
    {
        id: 5,
        icon: 'security',
        color: 'red',
        title: 'Configuración de seguridad',
        description: 'Cambiaste tu contraseña por seguridad',
        time: 'Hace 1 semana'
    }
])

// Navigation functions
async function goHome() {
    await router.push('/home')
}

async function goToDocuments() {
    const userRole = authStore.getUserRole()

    // Redirigir según el rol del usuario
    switch (userRole) {
        case 'administrador':
            router.push('/admin')
            break
        case 'sistemas':
            router.push('/home')
            break
        case 'gerencia':
            router.push('/gerencia')
            break
        case 'talentoHumano':
            router.push('/talento-humano')
            break
        case 'contabilidad':
            router.push('/contabilidad')
            break
        case 'tesoreria':
            router.push('/tesoreria')
            break
        case 'credito':
            router.push('/credito')
            break
        case 'controlInterno':
            router.push('/control-interno')
            break
        case 'riesgos':
            router.push('/riesgos')
            break
        case 'compras':
            router.push('/compras')
            break
        default:
            // Si no tiene un rol específico, va a documentos general
            router.push('/documentos')
            break
    }
}

// Profile actions
function editProfile() {
    $q.dialog({
        title: 'Editar Perfil',
        message: 'Función de edición de perfil en desarrollo.',
        ok: 'Entendido'
    })
}

function changeAvatar() {
    $q.dialog({
        title: 'Cambiar Avatar',
        message: 'Función para cambiar avatar en desarrollo.',
        ok: 'Entendido'
    })
}

function changePassword() {
    $q.dialog({
        title: 'Cambiar Contraseña',
        message: 'Función para cambiar contraseña en desarrollo.',
        ok: 'Entendido'
    })
}

function toggleTwoFactor(value) {
    const message = value 
        ? 'Autenticación de dos factores activada'
        : 'Autenticación de dos factores desactivada'
    
    $q.notify({
        message,
        color: value ? 'positive' : 'warning',
        position: 'top',
        timeout: 3000
    })
}

function viewSessions() {
    $q.dialog({
        title: 'Historial de Sesiones',
        message: 'Función de historial de sesiones en desarrollo.',
        ok: 'Entendido'
    })
}

function handleLogout() {
    $q.dialog({
        title: 'Cerrar Sesión',
        message: '¿Estás seguro de que deseas cerrar sesión?',
        cancel: true,
        persistent: true
    }).onOk(() => {
        $q.notify({
            message: 'Sesión cerrada correctamente',
            color: 'positive',
            position: 'top',
            timeout: 2000
        })
        router.push('/login')
    })
}

// Watch for preference changes
import { watch } from 'vue'

watch([selectedTheme, selectedLanguage, emailNotifications], () => {
    $q.notify({
        message: 'Preferencias guardadas',
        color: 'positive',
        position: 'top',
        timeout: 2000
    })
})

onMounted(() => {
    // Initialize component if needed
    console.log('Profile component mounted')
})
</script>

<style scoped>
* {
    margin: 0;
    padding: 0;
}

/* Profile specific styles */
.profile-container {
    display: flex;
    min-height: 100vh;
    background: var(--light-gray);
}

/* Profile Content Styles */
.profile-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

/* Profile Card Section */
.profile-card-section {
    margin-bottom: 1rem;
}

.profile-card {
    border-radius: 16px;
    overflow: hidden;
    box-shadow: var(--shadow-lg);
}

.profile-banner {
    background: var(--primary-gradient);
    padding: 2rem;
    color: var(--white);
}

.profile-banner-content {
    display: flex;
    align-items: center;
    gap: 2rem;
    flex-wrap: wrap;
}

.profile-main-avatar {
    border: 4px solid var(--white);
    box-shadow: var(--shadow-lg);
}

.profile-main-info {
    flex: 1;
    min-width: 250px;
}

.profile-main-name {
    margin: 0 0 0.5rem 0;
    font-size: 2rem;
    font-weight: 700;
    color: var(--white);
}

.profile-main-role {
    margin: 0 0 0.5rem 0;
    font-size: 1.2rem;
    font-weight: 500;
    opacity: 0.9;
}

.profile-main-department {
    margin: 0 0 1rem 0;
    font-size: 1rem;
    opacity: 0.8;
}

.profile-status {
    margin-top: 0.5rem;
}

.profile-actions-top {
    display: flex;
    gap: 1rem;
    align-items: center;
}

/* Stats Section */
.stats-section {
    margin-bottom: 1rem;
}

/* Profile Tabs */
.profile-tabs-section {
    flex: 1;
}

.profile-tabs-card {
    border-radius: 16px;
    box-shadow: var(--shadow);
}

.profile-tabs {
    background: var(--white);
}

/* Tab Content Styles */
.personal-info-content,
.security-content,
.preferences-content,
.activity-content {
    padding: 1rem 0;
}

.info-section,
.security-section,
.preferences-section,
.activity-section {
    margin-bottom: 2rem;
}

.section-title {
    margin: 0 0 1.5rem 0;
    color: var(--text-primary);
    font-weight: 600;
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.section-title::before {
    content: '';
    width: 4px;
    height: 20px;
    background: var(--primary-blue);
    border-radius: 2px;
}

/* Info Grid */
.info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
}

.info-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    background: var(--white);
    border-radius: 12px;
    box-shadow: var(--shadow);
    transition: all 0.3s ease;
}

.info-item:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
}

.info-icon {
    color: var(--primary-blue);
    font-size: 1.5rem;
    flex-shrink: 0;
}

.info-details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.info-label {
    font-size: 0.875rem;
    color: var(--text-secondary);
    font-weight: 500;
}

.info-value {
    font-size: 1rem;
    color: var(--text-primary);
    font-weight: 600;
}

/* Security Options */
.security-options,
.preferences-options {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.security-card,
.preference-card {
    border-radius: 12px;
    box-shadow: var(--shadow);
    transition: all 0.3s ease;
}

.security-card:hover,
.preference-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
}

.security-item,
.preference-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
}

.security-info,
.preference-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex: 1;
}

.security-icon,
.preference-icon {
    color: var(--primary-blue);
    font-size: 1.5rem;
    flex-shrink: 0;
}

.security-info h6,
.preference-info h6 {
    margin: 0 0 0.25rem 0;
    color: var(--text-primary);
    font-weight: 600;
}

.security-info p,
.preference-info p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 0.875rem;
}

/* Activity List */
.activity-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.activity-item {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.5rem;
    background: var(--white);
    border-radius: 12px;
    box-shadow: var(--shadow);
    transition: all 0.3s ease;
}

.activity-item:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
}

.activity-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--light-gray);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.activity-details {
    flex: 1;
}

.activity-title {
    margin: 0 0 0.5rem 0;
    color: var(--text-primary);
    font-weight: 600;
    font-size: 1rem;
}

.activity-description {
    margin: 0 0 0.5rem 0;
    color: var(--text-secondary);
    font-size: 0.875rem;
}

.activity-time {
    font-size: 0.75rem;
    color: var(--text-secondary);
    font-style: italic;
}

/* Responsive Design */
@media (max-width: 768px) {
    .profile-banner-content {
        flex-direction: column;
        text-align: center;
        gap: 1.5rem;
    }

    .profile-actions-top {
        justify-content: center;
        flex-wrap: wrap;
    }

    .info-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
    }

    .security-item,
    .preference-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }

    .security-info,
    .preference-info {
        width: 100%;
    }

    .activity-item {
        flex-direction: column;
        text-align: center;
    }
}

@media (max-width: 480px) {
    .profile-main-name {
        font-size: 1.5rem;
    }

    .profile-main-role {
        font-size: 1rem;
    }

    .info-item {
        padding: 1rem;
    }

    .activity-item {
        padding: 1rem;
    }
}

.sidebar {
    width: 280px;
    background: var(--sidebar-bg);
    box-shadow: var(--shadow-lg);
    display: flex;
    flex-direction: column;
    position: fixed;
    height: 100vh;
    z-index: 1000;
}

.sidebar-header {
    padding: 2rem 1.5rem;
    border-bottom: 1px solid var(--border-color);
    background: var(--primary-gradient);
}

.user-profile {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.profile-avatar {
    border: 3px solid var(--white);
    box-shadow: var(--shadow);
}

.user-info {
    color: var(--white);
}

.user-name {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
}

.user-role {
    font-size: 0.875rem;
    opacity: 0.9;
}

.sidebar-menu {
    padding: 1.5rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.menu-item {
    width: 100%;
    justify-content: flex-start;
    padding: 0.875rem 1rem;
    border-radius: 12px;
    color: var(--text-secondary);
    transition: all 0.3s ease;
    font-weight: 500;
}

.menu-item:hover {
    background: var(--primary-light);
    color: var(--primary-blue);
}

.menu-item.active {
    background: var(--primary-blue);
    color: var(--white);
}

.main-content {
    flex: 1;
    margin-left: 280px;
    padding: 2rem;
    min-height: 100vh;
}

.content-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    background: var(--white);
    padding: 1.5rem 1rem;
    border-radius: 16px;
    box-shadow: var(--shadow);
}

.header-left {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.page-title {
    margin: 0;
    color: var(--text-primary);
    font-weight: 700;
    font-size: 1.75rem;
}

.page-subtitle {
    margin: 0;
    color: var(--text-secondary);
    font-size: 1rem;
}

.header-actions {
    display: flex;
    gap: 0.75rem;
    align-items: center;
}

.action-btn {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    transition: all 0.3s ease;
}

.action-btn:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.stat-card {
    background: var(--white);
    border-radius: 12px;
    box-shadow: var(--shadow);
    transition: all 0.3s ease;
}

.stat-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
}

.stat-card .q-card-section {
    padding: 1rem !important;
}

.stat-icon {
    padding: 0.5rem;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.2);
    flex-shrink: 0;
}

.blue-icon {
    background: rgba(25, 118, 210, 0.1);
}

.stat-info {
    flex: 1;
    min-width: 0;
}

.stat-number {
    margin: 0;
    font-size: 1.4rem;
    font-weight: 700;
    line-height: 1.2;
}

.stat-value {
    margin: 0;
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--text-primary);
}

    

.stat-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.stat-value {
    margin: 0;
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text-primary);
}

.stat-label {
    margin: 0;
    margin-top: 0.25rem;
    color: var(--text-secondary);
    font-size: 0.75rem;
    font-weight: 500;
}

/* Estilos específicos para las cards con gradientes */
.blue-gradient {
    background: var(--primary-gradient);
}

.light-blue-gradient {
    background: linear-gradient(135deg, #42a5f5 0%, #1e88e5 100%);
}

.blue-gradient .stat-number,
.light-blue-gradient .stat-number {
    color: white;
}

.blue-gradient .stat-label,
.light-blue-gradient .stat-label {
    color: rgba(255, 255, 255, 0.9);
}

.white-card .stat-number {
    color: var(--primary-blue);
}

.white-card .stat-label {
    color: var(--text-secondary);
}

.action-buttons {
    margin-bottom: 2rem;
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
}

.upload-btn {
    border-radius: 12px;
    padding: 0.75rem 1.5rem;
    font-weight: 600;
    transition: all 0.3s ease;
}

.upload-btn:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
}

.table-container {
    background: var(--white);
    border-radius: 16px;
    box-shadow: var(--shadow);
    overflow: hidden;
    margin-bottom: 2rem;
    margin-top: 50px;
}

.data-table {
    border-radius: 16px;
    overflow: hidden;
}

.table-header {
    background: var(--primary-gradient);
}

.table-header-cell {
    color: var(--white);
    font-weight: 600;
    padding: 1.2rem 1rem;
    border: none;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.table-header-section {
    display: flex;
    align-items: center;

    border-bottom: 1px solid var(--border-color);
    gap: 1rem;

}

.table-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;

}

.search-input {
    max-width: 300px;
    min-width: 250px;
}

.table-row {
    transition: all 0.2s ease;
}

.table-row:hover {
    background: var(--light-gray);
    transform: translateY(-1px);
}

.table-cell {
    padding: 1.2rem 1rem;
    border-bottom: 1px solid var(--border-color);
    vertical-align: middle;
}

/* Estilos para celdas específicas */
.action-buttons-cell {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
    align-items: center;
}

.action-btn-small {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    transition: all 0.3s ease;
}

.action-btn-small:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-btn-small:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.document-title-cell {
    max-width: 300px;
}

.document-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.document-icon {
    flex-shrink: 0;
}

.document-details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
}

.document-name {
    font-weight: 600;
    color: var(--text-primary);
    font-size: 0.95rem;
    line-height: 1.3;
    word-break: break-word;
}

.document-files-count {
    font-size: 0.8rem;
    color: var(--text-secondary);
    font-style: italic;
}

.no-files-text {
    font-size: 0.8rem;
    color: #f56565;
    font-style: italic;
}

.files-count-cell {
    text-align: center;
}

.cell-content {
    color: var(--text-primary);
    font-size: 0.9rem;
}

/* Estilos del diálogo de documentos */
.document-viewer {
    border-radius: 16px;
    overflow: hidden;
    box-shadow: var(--shadow-lg);
}

.document-info-header {
    display: flex;
    gap: 2rem;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: var(--light-gray);
    border-radius: 12px;
    flex-wrap: wrap;
}

.info-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
    min-width: 200px;
}

.info-label {
    font-weight: 500;
    color: var(--text-secondary);
    font-size: 0.9rem;
}

.info-value {
    font-weight: 600;
    color: var(--text-primary);
    font-size: 0.9rem;
}

.files-list {
    margin-top: 1rem;
}

.files-title {
    margin: 0 0 1rem 0;
    color: var(--text-primary);
    font-weight: 600;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.files-title::before {
    content: '';
    width: 4px;
    height: 20px;
    background: var(--primary-blue);
    border-radius: 2px;
}

.file-items {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.file-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: var(--white);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.file-item:hover {
    border-color: var(--primary-blue);
    box-shadow: 0 4px 12px rgba(25, 118, 210, 0.1);
    transform: translateY(-1px);
}

.file-item-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex: 1;
    min-width: 0;
}

.file-icon {
    flex-shrink: 0;
}

.file-details-expanded {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 0;
    flex: 1;
}

.file-name-expanded {
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
    font-size: 0.95rem;
    line-height: 1.3;
    word-break: break-word;
}

.file-metadata {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    align-items: center;
}

.file-size-tag,
.file-date-tag,
.file-format-tag {
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 500;
    white-space: nowrap;
}

.file-size-tag {
    background: #e3f2fd;
    color: #1565c0;
}

.file-date-tag {
    background: #f3e5f5;
    color: #7b1fa2;
}

.file-format-tag {
    background: #e8f5e8;
    color: #2e7d32;
}

.file-actions {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    flex-shrink: 0;
}

/* Mejoras responsivas para la tabla */
@media (max-width: 768px) {
    .table-container {
        margin: 0 -1rem;
        border-radius: 0;
    }

    .data-table {
        border-radius: 0;
    }

    .table-header-cell,
    .table-cell {
        padding: 0.8rem 0.5rem;
        font-size: 0.8rem;
    }

    .action-buttons-cell {
        flex-direction: column;
        gap: 0.25rem;
    }

    .action-btn-small {
        width: 32px;
        height: 32px;
    }

    .document-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }

    .document-info-header {
        flex-direction: column;
        gap: 1rem;
    }

    .info-item {
        min-width: auto;
    }

    .file-item {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
    }

    .file-actions {
        justify-content: center;
    }
}

.dialog-card {
    min-width: 450px;
    max-width: 500px;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: var(--shadow-lg);
}

.dialog-header {
    background: var(--primary-gradient);
    color: var(--white);
    padding: 1.5rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.dialog-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.dialog-title h6 {
    margin: 0;
    font-weight: 600;
    font-size: 1.1rem;
}

.dialog-content {
    padding: 2rem;
}

.dialog-actions {
    padding: 1rem 2rem;
    background: var(--light-gray);
    justify-content: flex-end;
    gap: 1rem;
}

.upload-area {
    border: 2px dashed var(--border-color);
    border-radius: 12px;
    padding: 2rem;
    text-align: center;
    transition: all 0.3s ease;
    background: var(--light-gray);
}

.upload-area.drag-over {
    border-color: var(--primary-blue);
    background: rgba(25, 118, 210, 0.05);
}

.upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

.upload-text {
    font-size: 1rem;
    color: var(--text-primary);
    margin: 0;
}

.upload-link {
    color: var(--primary-blue);
    cursor: pointer;
    text-decoration: underline;
    font-weight: 500;
}

.upload-link:hover {
    color: var(--blue-gradient-end);
}

.upload-hint {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin: 0;
}

.file-preview {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.file-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: var(--white);
    border-radius: 8px;
    border: 1px solid var(--border-color);
    box-shadow: var(--shadow);
}

.file-details {
    flex: 1;
}

.file-name {
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
    margin-bottom: 0.25rem;
    font-size: 0.95rem;
}

.file-size {
    color: var(--text-secondary);
    font-size: 0.8rem;
    margin: 0;
}

.metadata-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.upload-progress {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 2rem;
}

.progress-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
}

.progress-text {
    font-weight: 500;
    color: var(--text-primary);
    margin: 0;
}

.progress-percentage {
    font-weight: 600;
    color: var(--primary-blue);
    font-size: 1.1rem;
    margin: 0;
}

.upload-result {
    display: flex;
    justify-content: center;
    padding: 2rem;
}

.success-result,
.error-result {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    text-align: center;
}

.result-text {
    font-weight: 600;
    font-size: 1.1rem;
    margin: 0;
}

.success-result .result-text {
    color: #2e7d32;
}

.error-result .result-text {
    color: #c62828;
}

.result-details {
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin: 0;
}

:root {
    --primary-blue: #1976d2;
    --blue-gradient-end: #1565c0;
    --primary-gradient: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
    --primary-light: rgba(25, 118, 210, 0.1);
    --sidebar-bg: #ffffff;
    --white: #ffffff;
    --light-gray: #f8fafc;
    --text-primary: #2d3748;
    --text-secondary: #718096;
    --border-color: #e2e8f0;
    --shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.15);
}

/* Mejoras adicionales para la tabla */
.q-table__container {
    border-radius: 16px;
}

.q-table thead tr:first-child th {
    background: var(--primary-gradient);
}

.q-table tbody td {
    border-bottom: 1px solid #e2e8f0;
}

.q-table tbody tr:last-child td {
    border-bottom: none;
}

/* Efectos hover para botones de acción */
.action-btn-small[aria-label*="Ver"] {
    color: #1976d2;
}

.action-btn-small[aria-label*="Ver"]:hover {
    background: rgba(25, 118, 210, 0.1);
}

.action-btn-small[aria-label*="Descargar"] {
    color: #388e3c;
}

.action-btn-small[aria-label*="Descargar"]:hover {
    background: rgba(56, 142, 60, 0.1);
}

.action-btn-small[aria-label*="Eliminar"] {
    color: #d32f2f;
}

.action-btn-small[aria-label*="Eliminar"]:hover {
    background: rgba(211, 47, 47, 0.1);
}

/* Estados de la tabla */
.table-row:nth-child(even) {
    background: rgba(248, 250, 252, 0.5);
}

.table-row:nth-child(even):hover {
    background: var(--light-gray);
}

/* Indicadores visuales para documentos sin archivos */
.table-row .no-files-text {
    position: relative;
}

.table-row .no-files-text::before {
    content: '⚠️';
    margin-right: 0.25rem;
    font-size: 0.7rem;
}

/* Animaciones suaves */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.file-item {
    animation: fadeIn 0.3s ease-out;
}

.table-row {
    animation: fadeIn 0.2s ease-out;
}

/* Mejoras para chips de conteo de archivos */
.q-chip {
    font-weight: 600;
    border-radius: 8px;
    height: 28px;
}

/* Tooltips personalizados */
.q-tooltip {
    background: var(--text-primary);
    color: var(--white);
    border-radius: 6px;
    font-size: 0.8rem;
    padding: 0.5rem 0.75rem;
    box-shadow: var(--shadow-lg);
}

/* Estilos para loading states */
.q-table--loading .q-table__bottom {
    background: rgba(255, 255, 255, 0.8);
}

/* Estilos para paginación */
.q-table__bottom {
    border-top: 1px solid var(--border-color);
    background: var(--white);
}

.q-table__control {
    font-size: 0.875rem;
    color: var(--text-secondary);
}

@media (max-width: 1024px) {
    .document-info-header {
        gap: 1rem;
    }

    .file-metadata {
        gap: 0.5rem;
    }
}

@media (max-width: 480px) {
    .dialog-card {
        margin: 1rem;
        min-width: auto !important;
        max-width: calc(100vw - 2rem) !important;
    }

    .document-name {
        font-size: 0.85rem;
    }

    .file-name-expanded {
        font-size: 0.85rem;
    }

    .action-buttons-cell {
        min-width: 120px;
    }
}

/* Media queries para sidebar y layout general */
@media (max-width: 768px) {
    .sidebar {
        transform: translateX(-100%);
        transition: transform 0.3s ease;
    }

    .main-content {
        margin-left: 0;
        padding: 1rem;
    }

    .stats-grid {
        grid-template-columns: 1fr;
        gap: 0.75rem;
    }

    .content-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }

    .header-actions {
        align-self: flex-end;
    }
}
</style>