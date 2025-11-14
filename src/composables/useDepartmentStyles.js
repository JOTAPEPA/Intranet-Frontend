/**
 * Composable para manejar estilos y configuraciones de departamentos
 * Proporciona funciones reutilizables para colores, iconos y datos de departamentos
 */
import { ref } from 'vue'

export function useDepartmentStyles() {
    // Configuración de departamentos
    const departments = ref([
        { key: 'gerencia', label: 'Gerencia', icon: 'business' },
        { key: 'sistemas', label: 'Sistemas', icon: 'computer' },
        { key: 'contabilidad', label: 'Contabilidad', icon: 'calculate' },
        { key: 'tesoreria', label: 'Tesorería', icon: 'account_balance' },
        { key: 'talento-humano', label: 'Talento Humano', icon: 'people' },
        { key: 'credito', label: 'Crédito', icon: 'credit_card' },
        { key: 'control-interno', label: 'Control Interno', icon: 'security' },
        { key: 'riesgos', label: 'Riesgos', icon: 'warning' },
        { key: 'compras', label: 'Compras', icon: 'shopping_cart' }
    ])

    /**
     * Obtiene el color del departamento para chips e indicadores
     */
    function getDepartmentColor(departmentKey) {
        const colorMap = {
            'gerencia': 'blue-7',
            'sistemas': 'purple-7',
            'contabilidad': 'green-7',
            'tesoreria': 'orange-7',
            'talento-humano': 'pink-7',
            'credito': 'indigo-7',
            'control-interno': 'red-7',
            'riesgos': 'amber-8',
            'compras': 'teal-7'
        }
        return colorMap[departmentKey] || 'blue-7'
    }

    /**
     * Obtiene el icono del departamento
     */
    function getDepartmentIcon(departmentKey) {
        const iconMap = {
            'gerencia': 'business',
            'sistemas': 'computer',
            'contabilidad': 'calculate',
            'tesoreria': 'account_balance',
            'talento-humano': 'people',
            'credito': 'credit_card',
            'control-interno': 'security',
            'riesgos': 'warning',
            'compras': 'shopping_cart'
        }
        return iconMap[departmentKey] || 'business'
    }

    /**
     * Obtiene el nombre completo del departamento
     */
    function getDepartmentLabel(departmentKey) {
        const department = departments.value.find(dept => dept.key === departmentKey)
        return department ? department.label : 'Departamento'
    }

    /**
     * Obtiene el título del departamento para headers
     */
    function getDepartmentTitle(departmentKey) {
        return getDepartmentLabel(departmentKey)
    }

    /**
     * Obtiene el subtítulo del departamento
     */
    function getDepartmentSubtitle(departmentKey) {
        const label = getDepartmentLabel(departmentKey)
        return `Gestiona Documentos de ${label}`
    }

    /**
     * Determina la clave del departamento basada en la ruta actual
     */
    function getCurrentDepartmentFromRoute(routeName) {
        // Mapeo de nombres de rutas a claves de departamento
        const routeMap = {
            'gerencia': 'gerencia',
            'sistemas': 'sistemas',
            'contabilidad': 'contabilidad',
            'tesoreria': 'tesoreria',
            'talentoHumano': 'talento-humano',
            'credito': 'credito',
            'controlInterno': 'control-interno',
            'riesgos': 'riesgos',
            'compras': 'compras'
        }
        return routeMap[routeName] || 'gerencia'
    }

    /**
     * Obtiene colores de gradiente para backgrounds
     */
    function getDepartmentGradient(departmentKey) {
        const gradientMap = {
            'gerencia': 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            'sistemas': 'linear-gradient(135deg, #7b1fa2 0%, #6a1b9a 100%)',
            'contabilidad': 'linear-gradient(135deg, #388e3c 0%, #2e7d32 100%)',
            'tesoreria': 'linear-gradient(135deg, #f57c00 0%, #ef6c00 100%)',
            'talento-humano': 'linear-gradient(135deg, #c2185b 0%, #ad1457 100%)',
            'credito': 'linear-gradient(135deg, #303f9f 0%, #283593 100%)',
            'control-interno': 'linear-gradient(135deg, #d32f2f 0%, #c62828 100%)',
            'riesgos': 'linear-gradient(135deg, #ff8f00 0%, #ff6f00 100%)',
            'compras': 'linear-gradient(135deg, #00796b 0%, #00695c 100%)'
        }
        return gradientMap[departmentKey] || gradientMap['gerencia']
    }

    /**
     * Obtiene el color de fondo claro para elementos secundarios
     */
    function getDepartmentLightColor(departmentKey) {
        const lightColorMap = {
            'gerencia': 'rgba(25, 118, 210, 0.1)',
            'sistemas': 'rgba(123, 31, 162, 0.1)',
            'contabilidad': 'rgba(56, 142, 60, 0.1)',
            'tesoreria': 'rgba(245, 124, 0, 0.1)',
            'talento-humano': 'rgba(194, 24, 91, 0.1)',
            'credito': 'rgba(48, 63, 159, 0.1)',
            'control-interno': 'rgba(211, 47, 47, 0.1)',
            'riesgos': 'rgba(255, 143, 0, 0.1)',
            'compras': 'rgba(0, 121, 107, 0.1)'
        }
        return lightColorMap[departmentKey] || lightColorMap['gerencia']
    }

    return {
        departments,
        getDepartmentColor,
        getDepartmentIcon,
        getDepartmentLabel,
        getDepartmentTitle,
        getDepartmentSubtitle,
        getCurrentDepartmentFromRoute,
        getDepartmentGradient,
        getDepartmentLightColor
    }
}