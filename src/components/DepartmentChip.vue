<template>
    <q-chip 
        :color="color" 
        text-color="white" 
        :icon="icon"
        :size="size"
        :dense="dense"
        :class="chipClass"
    >
        {{ label }}
    </q-chip>
</template>

<script setup>
import { computed } from 'vue'
import { useDepartmentStyles } from '../composables/useDepartmentStyles.js'

const props = defineProps({
    departmentKey: {
        type: String,
        required: true
    },
    size: {
        type: String,
        default: 'md'
    },
    dense: {
        type: Boolean,
        default: false
    },
    variant: {
        type: String,
        default: 'header', // 'header', 'table', 'inline'
        validator: (value) => ['header', 'table', 'inline'].includes(value)
    }
})

const { getDepartmentColor, getDepartmentIcon, getDepartmentLabel } = useDepartmentStyles()

const color = computed(() => getDepartmentColor(props.departmentKey))
const icon = computed(() => getDepartmentIcon(props.departmentKey))
const label = computed(() => getDepartmentLabel(props.departmentKey))

const chipClass = computed(() => {
    const baseClass = 'department-chip'
    const variantClass = `department-chip--${props.variant}`
    return `${baseClass} ${variantClass}`
})
</script>

<style scoped>
.department-chip {
    font-weight: 600;
    border-radius: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
}

.department-chip::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, 
        transparent 0%, 
        rgba(255, 255, 255, 0.3) 50%, 
        transparent 100%);
    animation: shimmer 3s infinite;
}

.department-chip--header {
    font-size: 0.85rem;
    padding: 0.5rem 1rem;
    border-radius: 20px;
}

.department-chip--table {
    font-size: 0.75rem;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    animation: pulse 4s infinite;
}

.department-chip--inline {
    font-size: 0.7rem;
    padding: 0.2rem 0.6rem;
    border-radius: 10px;
}

.department-chip:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

@keyframes shimmer {
    0% {
        left: -100%;
    }
    100% {
        left: 100%;
    }
}

@keyframes pulse {
    0%, 100% {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
    50% {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
        transform: scale(1.02);
    }
}
</style>