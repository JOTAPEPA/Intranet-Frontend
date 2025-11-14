<template>
    <div class="admin-container">
        <!-- Sidebar Navigation -->
        <div class="sidebar">
            <div class="sidebar-header">
                <div class="user-profile">
                    <q-avatar size="50px" class="profile-avatar">
                        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8iGDQ6VWECRIntbY5F6ZBYz-wCHgqzXM_FA&s">
                    </q-avatar>
                    <div class="user-info">
                        <h6 class="user-name">Copvillanueva</h6>
                        <span class="user-role">Administrador</span>
                    </div>
                </div>
            </div>
            
            <div class="sidebar-menu">
                <q-btn 
                    flat 
                    icon="dashboard" 
                    label="Dashboard" 
                    align="left"
                    class="menu-item active"
                    no-caps 
                />
                <q-btn 
                    flat 
                    icon="settings" 
                    label="Configuración" 
                    align="left"
                    class="menu-item"
                    no-caps 
                />
            </div>
        </div>

        <!-- Main Content -->
        <div class="main-content">

            <!-- Header -->
            <div class="content-header">
                <div class="header-left">
                    <h4 class="page-title">Panel de Administración</h4>
                    <p class="page-subtitle">Gestiona usuarios y configuraciones del sistema</p>
                </div>
                <div class="header-actions">
                    <q-btn 
                        flat 
                        round 
                        icon="notifications" 
                        class="action-btn"
                        size="md"
                    >
                        <q-tooltip>Notificaciones</q-tooltip>
                        <q-badge color="red" floating>3</q-badge>
                    </q-btn>
                    <q-btn 
                        flat 
                        round 
                        color="blue-7" 
                        icon="person" 
                        @click="viewProfile" 
                        class="action-btn"
                        size="md"
                    >
                        <q-tooltip>Ver Perfil</q-tooltip>
                    </q-btn>
                    <q-btn 
                        flat 
                        round 
                        color="red-6" 
                        icon="logout" 
                        @click="handleLogout" 
                        class="action-btn"
                        size="md"
                    >
                        <q-tooltip>Cerrar Sesión</q-tooltip>
                    </q-btn>
                </div>
            </div>

            <!-- Stats Cards -->
            <div class="stats-grid">
                <q-card class="stat-card blue-gradient">
                    <q-card-section>
                        <div class="stat-content">
                            <div class="stat-icon">
                                <q-icon name="people" size="2rem" color="white" />
                            </div>
                            <div class="stat-info">
                                <h3 class="stat-number">{{rows.length}}</h3>
                                <p class="stat-label">Usuarios Activos</p>
                            </div>
                        </div>
                    </q-card-section>
                </q-card>

                <q-card class="stat-card light-blue-gradient">
                    <q-card-section>
                        <div class="stat-content">
                            <div class="stat-icon">
                                <q-icon name="description" size="2rem" color="white" />
                            </div>
                            <div class="stat-info">
                                <h3 class="stat-number">24</h3>
                                <p class="stat-label">Documentos</p>
                            </div>
                        </div>
                    </q-card-section>
                </q-card>

                <q-card class="stat-card white-card">
                    <q-card-section>
                        <div class="stat-content">
                            <div class="stat-icon blue-icon">
                                <q-icon name="trending_up" size="2rem" color="blue-7" />
                            </div>
                            <div class="stat-info text-blue-7">
                                <h3 class="stat-number">85%</h3>
                                <p class="stat-label">Actividad</p>
                            </div>
                        </div>
                    </q-card-section>
                </q-card>
            </div>

            <!-- Action Section -->
            <div class="action-section">
                <q-btn 
                    color="blue-7" 
                    icon="person_add" 
                    label="Agregar Usuario" 
                    no-caps 
                    class="add-user-btn"
                    @click="openAddUserDialog"
                    size="md"
                />
            </div>

            <!-- Users Table -->
            <div class="table-container">
                <q-table 
                    :rows="rows" 
                    :columns="columns" 
                    row-key="name"
                    class="modern-table"
                    flat
                    :rows-per-page-options="[10, 25, 50]"
                >
                    <template v-slot:top>
                        <div class="table-header">
                            <h5 class="table-title">Gestión de Usuarios</h5>
                            <q-space />
                            <q-input
                                dense
                                outlined
                                placeholder="Buscar usuarios..."
                                class="search-input"
                            >
                                <template v-slot:prepend>
                                    <q-icon name="search" color="blue-7" />
                                </template>
                            </q-input>
                        </div>
                    </template>

                    <template v-slot:body-cell-estado="props">
                        <q-td :props="props">
                            <q-badge 
                                :color="props.row.estado ? 'green' : 'red'"
                                :label="props.row.estado ? 'Activo' : 'Inactivo'"
                                class="status-badge"
                            />
                        </q-td>
                    </template>

                    <template v-slot:body-cell-acciones="props">
                        <q-td :props="props">
                            <div class="action-buttons">
                                <q-btn
                                    flat
                                    round
                                    icon="edit"
                                    color="blue-7"
                                    size="sm"
                                    @click="openEditDialog(props.row)"
                                    class="action-btn-small"
                                >
                                    <q-tooltip>Editar Usuario</q-tooltip>
                                </q-btn>
                                
                                <q-btn
                                    flat
                                    round
                                    :icon="props.row.estado ? 'block' : 'check_circle'"
                                    :color="props.row.estado ? 'red-6' : 'green-6'"
                                    size="sm"
                                    @click="toggleUserStatus(props.row)"
                                    class="action-btn-small"
                                >
                                    <q-tooltip>
                                        {{ props.row.estado ? 'Desactivar Usuario' : 'Activar Usuario' }}
                                    </q-tooltip>
                                </q-btn>
                            </div>
                        </q-td>
                    </template>
                </q-table>
            </div>

            <!-- Add User Dialog -->
            <q-dialog v-model="dialog" class="user-dialog">
                <q-card class="dialog-card">
                    <q-card-section class="dialog-header">
                        <div class="dialog-title">
                            <q-icon name="person_add" color="white" size="1.5rem" />
                            <h6>Agregar Nuevo Usuario</h6>
                        </div>
                        <q-btn flat round icon="close" v-close-popup color="white" />
                    </q-card-section>

                    <q-separator />

                    <q-card-section class="dialog-content">
                        <div class="form-grid">
                            <q-input
                                outlined
                                type="text"
                                label="Nombres"
                                v-model="newUser.nombres"
                                class="form-input"
                                color="blue-7"
                            >
                                <template v-slot:prepend>
                                    <q-icon name="person" color="blue-7" />
                                </template>
                            </q-input>

                            <q-input
                                outlined
                                type="text"
                                label="Apellidos"
                                v-model="newUser.apellidos"
                                class="form-input"
                                color="blue-7"
                            >
                                <template v-slot:prepend>
                                    <q-icon name="person" color="blue-7" />
                                </template>
                            </q-input>

                            <q-input
                                outlined
                                type="email"
                                label="Correo Electrónico"
                                v-model="newUser.email"
                                class="form-input"
                                color="blue-7"
                            >
                                <template v-slot:prepend>
                                    <q-icon name="email" color="blue-7" />
                                </template>
                            </q-input>

                            <q-input
                                outlined
                                type="password"
                                label="Contraseña"
                                v-model="newUser.password"
                                class="form-input"
                                color="blue-7"
                            >
                                <template v-slot:prepend>
                                    <q-icon name="lock" color="blue-7" />
                                </template>
                            </q-input>

                            <q-select
                                outlined
                                label="Rol"
                                v-model="newUser.role"
                                :options="roles"
                                option-label="label"
                                option-value="value"
                                emit-value
                                map-options
                                class="form-input"
                                color="blue-7"
                            >
                                <template v-slot:prepend>
                                    <q-icon name="admin_panel_settings" color="blue-7" />
                                </template>
                            </q-select>
                        </div>
                    </q-card-section>

                    <q-separator />

                    <q-card-actions class="dialog-actions">
                        <q-btn 
                            flat 
                            label="Cancelar" 
                            color="grey-6" 
                            v-close-popup 
                            no-caps
                        />
                        <q-btn 
                            color="blue-7" 
                            label="Guardar Usuario" 
                            no-caps
                            icon="save"
                            @click="createUser"
                        />
                    </q-card-actions>
                </q-card>
            </q-dialog>

            <!-- Edit User Dialog -->
            <q-dialog v-model="editDialog" class="user-dialog">
                <q-card class="dialog-card">
                    <q-card-section class="dialog-header">
                        <div class="dialog-title">
                            <q-icon name="edit" color="white" size="1.5rem" />
                            <h6>Editar Usuario</h6>
                        </div>
                        <q-btn flat round icon="close" v-close-popup color="white" />
                    </q-card-section>

                    <q-separator />

                    <q-card-section class="dialog-content">
                        <div class="form-grid">
                            <q-input
                                outlined
                                type="text"
                                label="Nombres"
                                v-model="editUser.nombres"
                                class="form-input"
                                color="blue-7"
                            >
                                <template v-slot:prepend>
                                    <q-icon name="person" color="blue-7" />
                                </template>
                            </q-input>

                            <q-input
                                outlined
                                type="text"
                                label="Apellidos"
                                v-model="editUser.apellidos"
                                class="form-input"
                                color="blue-7"
                            >
                                <template v-slot:prepend>
                                    <q-icon name="person" color="blue-7" />
                                </template>
                            </q-input>

                            <q-input
                                outlined
                                type="email"
                                label="Correo Electrónico"
                                v-model="editUser.email"
                                class="form-input"
                                color="blue-7"
                            >
                                <template v-slot:prepend>
                                    <q-icon name="email" color="blue-7" />
                                </template>
                            </q-input>

                            <q-select
                                outlined
                                label="Rol"
                                v-model="editUser.role"
                                :options="roles"
                                option-label="label"
                                option-value="value"
                                emit-value
                                map-options
                                class="form-input"
                                color="blue-7"
                            >
                                <template v-slot:prepend>
                                    <q-icon name="admin_panel_settings" color="blue-7" />
                                </template>
                            </q-select>

                            <div class="status-section">
                                <q-toggle
                                    v-model="editUser.estado"
                                    color="green"
                                    :label="editUser.estado ? 'Usuario Activo' : 'Usuario Inactivo'"
                                    left-label
                                    class="status-toggle"
                                />
                            </div>
                        </div>
                    </q-card-section>

                    <q-separator />

                    <q-card-actions class="dialog-actions">
                        <q-btn 
                            flat 
                            label="Cancelar" 
                            color="grey-6" 
                            v-close-popup 
                            no-caps
                        />
                        <q-btn 
                            color="blue-7" 
                            label="Actualizar Usuario" 
                            no-caps
                            icon="save"
                            @click="updateUser"
                        />
                    </q-card-actions>
                </q-card>
            </q-dialog>

        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { onMounted } from 'vue'
import { getData, postData, putData } from '../services/apiClient.js'
import { useAuth } from '../stores/store.js'
import { useAuthGuard } from '../composables/useAuthGuard.js'

const router = useRouter()

// Proteger la ruta con autenticación y acceso administrativo
useAuthGuard({ requiresAuth: true, requiresAdminAccess: true })

const columns = ref ([
    {
        name: "nombres",
        align: "center",
        label: "Nombres",
        field: "nombres",
        sortable: "true",
    },
    {
        name: "apellidos",
        align: "center",
        label: "Apellidos",
        field: "apellidos",
        sortable: "true",
    },
    {
        name: "email",
        align: "center",
        label: "Email",
        field: "email",
        sortable: "true",
    },
    {
        name: "rol",
        align: "center",
        label: "Rol",
        field: "role",
        sortable: "true",
    },
    {
        name: "estado",
        align: "center",
        label: "Estado",
        field: "estado",
        sortable: "true",
    },
    {
        name: "acciones",
        align: "center",
        label: "Acciones",
        field: "acciones",
        sortable: false,
    }
])
const rows = ref([])
const roles = ref([])

// Variables del formulario
const newUser = ref({
    nombres: '',
    apellidos: '',
    email: '',
    password: '',
    role: ''
})

// Variables para editar usuario
const editUser = ref({
    id: '',
    nombres: '',
    apellidos: '',
    email: '',
    role: '',
    estado: true
})

const dialog = ref(false)
const editDialog = ref(false)
const isEditing = ref(false)
const backdropFilter = ref(null)
const authStore = useAuth()

// Lista de filtros disponibles
const list = [
  'blur(4px) saturate(150%)',
]

// Generamos lista de acciones
const backdropFilterList = list.map(filter => ({
  label: filter,
  onClick: () => {
    backdropFilter.value = filter
    dialog.value = true
  }
}))

backdropFilterList[0].label = 'Agregar usuario'

function openAddUserDialog() {
    dialog.value = true
}

function viewProfile() {
    // Aquí puedes agregar lógica para mostrar el perfil del usuario
    // Por ejemplo, abrir un modal, navegar a una página de perfil, etc.
    console.log('Ver perfil del usuario')
    // router.push('/profile') // Si tienes una ruta de perfil
}

function handleLogout() {
    // Usar el store para cerrar sesión correctamente
    const authStore = useAuth()
    authStore.logOut()
    
    // Redirigir al login
    router.push('/')
}

async function getUsers() {

    try{
        const response = await getData('/user')
        if ( response && Array.isArray(response)){
            rows.value = response
        } else {
            console.log('La respuesta no contiene los datos esperados');
            
        }
    } catch ( err ){
        console.error('Error al obtener los usuarios:', err);
    }
}

async function getRoles() {
    try {
        // Los roles están definidos en el esquema del backend
        // Basado en el modelo: ["sistemas", "administrador", "recursosHumanos", "Gerente"]
        roles.value = [
            { label: 'Sistemas', value: 'sistemas' },
            { label: 'Administrador', value: 'administrador' },
            { label: 'Talento Humanos', value: 'talentoHumano' },
            { label: 'Gerente', value: 'gerencia' },
            { label: 'Compras', value: 'compras' },
            { label: 'Contabilidad', value: 'contabilidad' },
            { label: 'Control Interno', value: 'controlInterno' },
            { label: 'Credito', value: 'credito' },
            { label: 'Tesoreria', value: 'tesoreria' },
            { label: 'Riesgos', value: 'riesgos' },


        ]
    } catch (err) {
        console.error('Error al obtener los roles:', err);
        // En caso de error, usar valores por defecto
        roles.value = [
            { label: 'Sistemas', value: 'sistemas' },
            { label: 'Administrador', value: 'administrador' },
            { label: 'Recursos Humanos', value: 'recursosHumanos' },
            { label: 'Gerente', value: 'Gerente' }
        ]
    }
}

async function createUser() {
    try {
        // Validar que todos los campos estén llenos
        if (!newUser.value.nombres || !newUser.value.apellidos || !newUser.value.email || !newUser.value.password || !newUser.value.role) {
            console.error('Todos los campos son obligatorios');
            return;
        }

        // Crear el objeto del usuario con el campo username
        const userData = {
            username: newUser.value.email, // Usar email como username
            nombres: newUser.value.nombres,
            apellidos: newUser.value.apellidos,
            email: newUser.value.email,
            password: newUser.value.password,
            role: newUser.value.role
        }

        const response = await postData('/user', userData);
        
        if (response) {
            console.log('Usuario creado exitosamente:', response);
            
            // Limpiar el formulario
            newUser.value = {
                nombres: '',
                apellidos: '',
                email: '',
                password: '',
                role: ''
            }
            
            // Cerrar el diálogo
            dialog.value = false;
            
            // Actualizar la lista de usuarios
            await getUsers();
        }
    } catch (err) {
        console.error('Error al crear el usuario:', err);
    }
}

function openEditDialog(user) {
    editUser.value = {
        id: user._id || user.id,
        nombres: user.nombres,
        apellidos: user.apellidos,
        email: user.email,
        role: user.role,
        estado: user.estado !== undefined ? user.estado : true
    }
    editDialog.value = true
}

async function updateUser() {
    try {
        // Validar que todos los campos estén llenos
        if (!editUser.value.nombres || !editUser.value.apellidos || !editUser.value.email || !editUser.value.role) {
            console.error('Todos los campos son obligatorios');
            return;
        }

        const userData = {
            nombres: editUser.value.nombres,
            apellidos: editUser.value.apellidos,
            email: editUser.value.email,
            role: editUser.value.role,
            estado: editUser.value.estado
        }

        const response = await putData(`/user/${editUser.value.id}`, userData);

        if (response) {
            console.log('Usuario actualizado exitosamente');
            
            // Cerrar el diálogo
            editDialog.value = false;
            
            // Actualizar la lista de usuarios
            await getUsers();
        }
    } catch (err) {
        console.error('Error al actualizar el usuario:', err);
    }
}

async function toggleUserStatus(user) {
    try {
        const newStatus = !user.estado;
        
        const userData = {
            estado: newStatus
        }

        const response = await putData(`/user/${user._id || user.id}`, userData);

        if (response) {
            console.log(`Usuario ${newStatus ? 'activado' : 'desactivado'} exitosamente`);
            
            // Actualizar la lista de usuarios
            await getUsers();
        }
    } catch (err) {
        console.error('Error al cambiar el estado del usuario:', err);
    }
}

onMounted(()=>{
    getUsers()
    getRoles()
})



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

.admin-container {
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

/* Stats Grid */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.stat-card {
    border-radius: 16px;
    border: none;
    box-shadow: var(--shadow);
    transition: all 0.3s ease;
    overflow: hidden;
}

.stat-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
}

.blue-gradient {
    background: linear-gradient(135deg, var(--blue-gradient-start), var(--blue-gradient-end));
    color: black;
}

.light-blue-gradient {
    background: linear-gradient(135deg, var(--light-blue-gradient-start), var(--light-blue-gradient-end));
    color: black;
}

.white-card {
    background: var(--white);
    border: 1px solid var(--border-color);
}

.stat-content {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.5rem 0;
}

.stat-icon {
    padding: 0.75rem;
    border-radius: 12px;
    background: rgba(25, 118, 210, 0.1);
}

.blue-icon {
    background: rgba(25, 118, 210, 0.1);
}

.stat-info {
    flex: 1;
}

.stat-number {
    font-size: 2rem;
    font-weight: 700;
    margin: 0;
    margin-bottom: 0.25rem;
    line-height: 1;
}

.stat-label {
    font-size: 0.875rem;
    margin: 0;
    opacity: 0.9;
    font-weight: 500;
}

/* Action Section */
.action-section {
    margin-bottom: 2rem;
}

.add-user-btn {
    padding: 0.75rem 2rem;
    border-radius: 10px;
    font-weight: 600;
    box-shadow: var(--shadow);
    transition: all 0.2s ease;
}

.add-user-btn:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
}

/* Table Styles */
.table-container {
    background: var(--white);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: var(--shadow);
    border: 1px solid var(--border-color);
}

.modern-table {
    border: none;
}

.table-header {
    display: flex;
    align-items: center;
    padding: 1.5rem 2rem;
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

/* Dialog Styles */
.user-dialog .dialog-card {
    min-width: 500px;
    max-width: 600px;
    border-radius: 16px;
    overflow: hidden;
}

.dialog-header {
    padding: 1.5rem 2rem;
    background: linear-gradient(135deg, var(--blue-gradient-start), var(--blue-gradient-end));
    color: white;
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
    font-size: 1.125rem;
    font-weight: 600;
}

.dialog-content {
    padding: 2rem;
}

.form-grid {
    display: grid;
    gap: 1.5rem;
    grid-template-columns: 1fr;
}

.form-input {
    width: 100%;
}

.dialog-actions {
    padding: 1rem 2rem;
    background: var(--light-gray);
    justify-content: flex-end;
    gap: 1rem;
}

/* Action Buttons Styles */
.action-buttons {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
    align-items: center;
}

.action-btn-small {
    transition: all 0.2s ease;
}

.action-btn-small:hover {
    transform: scale(1.1);
}

/* Status Badge Styles */
.status-badge {
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-weight: 600;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

/* Status Toggle Section */
.status-section {
    padding: 1rem;
    background: var(--light-gray);
    border-radius: 8px;
    border: 1px solid var(--border-color);
}

.status-toggle {
    font-weight: 600;
    font-size: 1rem;
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
    
    .stats-grid {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
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
    
    .stats-grid {
        grid-template-columns: 1fr;
    }
    
    .table-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
        padding: 1rem;
    }
    
    .search-input {
        max-width: 100%;
        min-width: auto;
        width: 100%;
    }
    
    .dialog-card {
        min-width: auto !important;
        max-width: 95vw !important;
        margin: 1rem;
    }
    
    .dialog-content {
        padding: 1rem;
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

.stat-card,
.table-container,
.content-header {
    animation: fadeIn 0.6s ease-out;
}

/* Mejoras para accesibilidad */
.menu-item:focus,
.action-btn:focus,
.add-user-btn:focus {
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