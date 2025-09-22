<template>
    <div class="documentos-container">
        <h2>Documentos</h2>
        <p>Esta vista requiere autenticación para acceder.</p>
    </div>
</template>

<script setup>
import { useAuthGuard } from '../composables/useAuthGuard.js'

// Proteger la ruta con autenticación
useAuthGuard({ requiresAuth: true })
</script>

<style scoped>
.documentos-container {
    padding: 2rem;
}
</style>