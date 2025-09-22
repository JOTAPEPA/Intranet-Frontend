<template>
    <div class="home-container">
        <!-- Sidebar Navigation -->
        <div class="sidebar">
            <div class="sidebar-header">
                <div class="user-profile">
                    <q-avatar size="50px" class="profile-avatar">
                        <img
                            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8iGDQ6VWECRIntbY5F6ZBYz-wCHgqzXM_FA&s">
                    </q-avatar>
                    <div class="user-info">
                        <h6 class="user-name">Copvillanueva</h6>
                        <span class="user-role">Usuario</span>
                    </div>
                </div>
            </div>

            <div class="sidebar-menu">
                <q-btn flat icon="home" label="Inicio" align="left" class="menu-item active" no-caps />
                <q-btn flat icon="description" label="Documentos" align="left" class="menu-item" no-caps
                    @click="goToDocuments" />

                <q-btn flat icon="help" label="Ayuda" align="left" class="menu-item" no-caps />
            </div>
        </div>

        <!-- Main Content -->
        <div class="main-content">
            <!-- Header -->
            <div class="content-header">
                <div class="header-left">
                    <h4 class="page-title">¡Bienvenido! 👋</h4>
                    <p class="page-subtitle">Accede a todos tus recursos y documentos desde aquí</p>
                </div>
                <div class="header-actions">
                    <q-btn flat round color="blue-7" icon="notifications" class="action-btn" size="md">
                        <q-tooltip>Notificaciones</q-tooltip>
                        <q-badge color="red" floating>2</q-badge>
                    </q-btn>
                    <q-btn flat round color="blue-7" icon="person" @click="viewProfile" class="action-btn" size="md">
                        <q-tooltip>Ver Perfil</q-tooltip>
                    </q-btn>
                    <q-btn flat round color="red-6" icon="logout" @click="handleLogout" class="action-btn" size="md">
                        <q-tooltip>Cerrar Sesión</q-tooltip>
                    </q-btn>
                </div>
            </div>

            <!-- Welcome Banner -->
            <div class="welcome-banner">
                <div class="banner-content">
                    <div class="banner-text">
                        <h2>Sistema de Gestión Empresarial</h2>
                        <p>Tu plataforma integral para gestionar documentos, procesos y comunicaciones de manera
                            eficiente</p>
                    </div>
                    <div class="banner-illustration">
                        <q-icon name="business" size="8rem" color="rgba(255, 255, 255, 0.3)" />
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="quick-actions">
                <h5 class="section-title">Acciones Rápidas</h5>
                <div class="actions-grid">
                    <q-card class="action-card">
                        <q-card-section>
                            <div class="action-content">
                                <div class="action-icon blue-icon">
                                    <q-icon name="description" size="2rem" color="blue-7" />
                                </div>
                                <div class="action-info" @click="goToDocuments">
                                    <h6>Ver Documentos</h6>
                                    <p>Accede a todos tus documentos</p>
                                </div>
                            </div>
                        </q-card-section>
                    </q-card>

                    <q-card class="action-card">
                        <q-card-section>
                            <div class="action-content">
                                <div class="action-icon light-blue-icon">
                                    <q-icon name="cloud_upload" size="2rem" color="light-blue-7" />
                                </div>
                                <div class="action-info">
                                    <h6>Subir Archivo</h6>
                                    <p>Sube nuevos documentos</p>
                                </div>
                            </div>
                        </q-card-section>
                    </q-card>

                    <q-card class="action-card">
                        <q-card-section>
                            <div class="action-content">
                                <div class="action-icon blue-icon">
                                    <q-icon name="search" size="2rem" color="blue-7" />
                                </div>
                                <div class="action-info">
                                    <h6>Buscar</h6>
                                    <p>Encuentra lo que necesitas</p>
                                </div>
                            </div>
                        </q-card-section>
                    </q-card>

                    <q-card class="action-card">
                        <q-card-section>
                            <div class="action-content">
                                <div class="action-icon light-blue-icon">
                                    <q-icon name="settings" size="2rem" color="light-blue-7" />
                                </div>
                                <div class="action-info">
                                    <h6>Configuración</h6>
                                    <p>Personaliza tu experiencia</p>
                                </div>
                            </div>
                        </q-card-section>
                    </q-card>
                </div>
            </div>
            <!-- Calendar Section -->
            <div class="calendarContainer">
                <div class="calendar-section">
                    <h5 class="section-title">Calendario</h5>
                    <div class="calendar-wrapper">
                        <InteractiveCalendar />
                    </div>
                </div>
                <div>
                    <q-btn flat color="blue-7" label="Agregar Evento" @click="showAddEventDialog = true" />
                </div>
            </div>

            <!-- Recent Activity -->
            <div class="recent-activity">
                <div class="activity-header">
                    <h5 class="section-title">Actividad Reciente</h5>
                    <q-btn flat color="blue-7" label="Ver todo" no-caps />
                </div>
                <q-card class="activity-card">
                    <q-card-section>
                        <div class="activity-list">
                            <div class="activity-item">
                                <div class="activity-icon">
                                    <q-icon name="description" color="blue-7" />
                                </div>
                                <div class="activity-details">
                                    <p class="activity-action">Documento "Informe Q1" subido</p>
                                    <span class="activity-time">Hace 2 horas</span>
                                </div>
                            </div>
                            <div class="activity-item">
                                <div class="activity-icon">
                                    <q-icon name="person_add" color="green-6" />
                                </div>
                                <div class="activity-details">
                                    <p class="activity-action">Nuevo usuario registrado</p>
                                    <span class="activity-time">Hace 4 horas</span>
                                </div>
                            </div>
                            <div class="activity-item">
                                <div class="activity-icon">
                                    <q-icon name="edit" color="orange-6" />
                                </div>
                                <div class="activity-details">
                                    <p class="activity-action">Perfil actualizado</p>
                                    <span class="activity-time">Ayer</span>
                                </div>
                            </div>
                        </div>
                    </q-card-section>
                </q-card>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuth } from '../stores/store.js'
import { useAuthGuard } from '../composables/useAuthGuard.js'
import InteractiveCalendar from '../components/InteractiveCalendar.vue'

const router = useRouter()
const authStore = useAuth()


useAuthGuard({ requiresAuth: true })

function viewProfile() {
    router.push('/profile')
}

function goToDocuments() {
    const userRole = authStore.getUserRole()

    // Redirigir según el rol del usuario
    switch (userRole) {
        case 'administrador':
        case 'sistemas':
            router.push('/admin')
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

function handleLogout() {
    // Usar el store para cerrar sesión correctamente
    const authStore = useAuth()
    authStore.logOut()

    // Redirigir al login
    router.push('/')
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
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

.home-container {
    display: flex;
    min-height: 100vh;
    background: linear-gradient(135deg, #f8fafc 0%, #e1f5fe 100%);
    font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Sidebar Styles */
.sidebar {
    width: 280px;
    background: var(--white);
    box-shadow: var(--shadow-lg);
    border-right: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    position: fixed;
    height: 100vh;
    z-index: 100;
}

.sidebar-header {
    padding: 2rem 1.5rem;
    border-bottom: 1px solid var(--border-color);
    background: linear-gradient(135deg, var(--blue-gradient-start), var(--blue-gradient-end));
}

.user-profile {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.profile-avatar {
    border: 3px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.user-info {
    color: white;
}

.user-name {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0;
    margin-bottom: 0.25rem;
}

.user-role {
    font-size: 0.875rem;
    opacity: 0.9;
    font-weight: 400;
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
    color: var(--text-secondary);
    border-radius: 8px;
    transition: all 0.2s ease;
    font-weight: 500;
}

.menu-item:hover {
    background-color: rgba(25, 118, 210, 0.08);
    color: var(--primary-blue);
}

.menu-item.active {
    background-color: rgba(25, 118, 210, 0.12);
    color: var(--primary-blue);
    font-weight: 600;
}

/* Main Content Styles */
.main-content {
    flex: 1;
    margin-left: 280px;
    padding: 2rem;
    overflow-y: auto;
}

/* Header Styles */
.content-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding: 1.5rem 2rem;
    background: var(--white);
    border-radius: 16px;
    box-shadow: var(--shadow);
    border: 1px solid var(--border-color);
}

.header-left {
    flex: 1;
}

.page-title {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
    margin-bottom: 0.5rem;
}

.page-subtitle {
    color: var(--text-secondary);
    font-size: 1rem;
    margin: 0;
}

.header-actions {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}

.action-btn {
    transition: all 0.2s ease;
}

.action-btn:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow);
}

/* Welcome Banner */
.welcome-banner {
    background: linear-gradient(135deg, var(--blue-gradient-start), var(--blue-gradient-end));
    border-radius: 20px;
    padding: 3rem 2rem;
    margin-bottom: 2rem;
    color: black;
    position: relative;
    overflow: hidden;
}

.welcome-banner::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 70%);
    animation: pulse 15s infinite alternate;
}

@keyframes pulse {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.banner-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    z-index: 2;
}

.banner-text h2 {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 1rem;
    line-height: 1.2;
}

.banner-text p {
    font-size: 1.125rem;
    opacity: 0.9;
    margin-bottom: 2rem;
    max-width: 80%;
    line-height: 1.5;
}

.banner-btn {
    font-weight: 600;
    padding: 0.75rem 2rem;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.2s ease;
}

.banner-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.banner-illustration {
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Quick Actions */
.quick-actions {
    margin-bottom: 2rem;
}

.section-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
    margin-bottom: 1.5rem;
}

.actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
}

.action-card {
    border-radius: 16px;
    border: 1px solid var(--border-color);
    box-shadow: var(--shadow);
    transition: all 0.3s ease;
    cursor: pointer;
}

.action-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
}

.action-content {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.5rem 0;
}

.action-icon {
    padding: 0.75rem;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.blue-icon {
    background: rgba(25, 118, 210, 0.1);
}

.light-blue-icon {
    background: rgba(66, 165, 245, 0.1);
}

.action-info h6 {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
    margin-bottom: 0.25rem;
}

.action-info p {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin: 0;
}

/* Calendar Section */
.calendar-section {
    margin-bottom: 2rem;
}

.calendar-wrapper {
    display: flex;
    justify-content: center;
    width: 100%;
}

@media (max-width: 768px) {
    .calendar-wrapper {
        justify-content: stretch;
    }

    .calendar-wrapper>* {
        width: 100%;
        max-width: none;
    }
}

.calendarContainer {
    display: flex;
    justify-content: space-between;
    gap: 1.5rem;
    margin-bottom: 2rem;
}

/* Recent Activity */
.recent-activity {
    margin-bottom: 2rem;
}

.activity-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.activity-card {
    border-radius: 16px;
    border: 1px solid var(--border-color);
    box-shadow: var(--shadow);
}

.activity-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.activity-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.5rem 0;
}

.activity-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--light-gray);
    display: flex;
    align-items: center;
    justify-content: center;
}

.activity-details {
    flex: 1;
}

.activity-action {
    font-size: 0.9375rem;
    font-weight: 500;
    color: var(--text-primary);
    margin: 0;
    margin-bottom: 0.25rem;
}

.activity-time {
    font-size: 0.8125rem;
    color: var(--text-secondary);
}

/* Responsive Design */
@media (max-width: 1024px) {
    .sidebar {
        width: 250px;
    }

    .main-content {
        margin-left: 250px;
        padding: 1rem;
    }

    .banner-content {
        flex-direction: column;
        text-align: center;
        gap: 2rem;
    }

    .banner-text {
        max-width: 100%;
    }

    .banner-text p {
        max-width: 100%;
    }
}

@media (max-width: 768px) {
    .sidebar {
        transform: translateX(-100%);
        transition: transform 0.3s ease;
    }

    .main-content {
        margin-left: 0;
        padding: 1rem;
    }

    .content-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
        padding: 1rem;
    }

    .header-actions {
        width: 100%;
        justify-content: flex-end;
    }

    .welcome-banner {
        padding: 2rem 1rem;
    }

    .banner-text h2 {
        font-size: 1.5rem;
    }

    .banner-text p {
        font-size: 1rem;
    }

    .actions-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
    }

    .activity-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
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

.action-card,
.activity-card,
.content-header,
.welcome-banner {
    animation: fadeIn 0.6s ease-out;
}

/* Mejoras para accesibilidad */
.menu-item:focus,
.action-btn:focus,
.banner-btn:focus {
    outline: 2px solid var(--primary-blue);
    outline-offset: 2px;
}

/* Scrollbar personalizado */
.main-content::-webkit-scrollbar {
    width: 6px;
}

.main-content::-webkit-scrollbar-track {
    background: var(--light-gray);
}

.main-content::-webkit-scrollbar-thumb {
    background: var(--primary-blue);
    border-radius: 3px;
}

.main-content::-webkit-scrollbar-thumb:hover {
    background: var(--blue-gradient-end);
}
</style>