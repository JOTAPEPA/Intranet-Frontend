<template>
  <div class="calendar-container">
    <q-card class="calendar-card" flat bordered>
      <q-card-section class="calendar-header">
        <div class="header-controls">
          <q-btn 
            flat 
            round 
            icon="chevron_left" 
            color="blue-7"
            @click="previousMonth"
            size="sm"
          />
          <h6 class="month-year">{{ currentMonthYear }}</h6>
          <q-btn 
            flat 
            round 
            icon="chevron_right" 
            color="blue-7"
            @click="nextMonth"
            size="sm"
          />
        </div>
        <q-btn 
          flat 
          color="blue-7" 
          label="Hoy" 
          @click="goToToday"
          size="sm"
          no-caps
        />
      </q-card-section>
      
      <q-separator />
      
      <q-card-section class="calendar-body">
        <!-- Días de la semana -->
        <div class="weekdays">
          <div 
            v-for="day in weekdays" 
            :key="day" 
            class="weekday"
          >
            {{ day }}
          </div>
        </div>
        
        <!-- Días del calendario -->
        <div class="calendar-grid">
          <div
            v-for="date in calendarDays"
            :key="date.key"
            :class="[
              'calendar-day',
              {
                'other-month': !date.isCurrentMonth,
                'today': date.isToday,
                'selected': date.isSelected,
                'has-event': date.hasEvent
              }
            ]"
            @click="selectDate(date)"
          >
            <span class="day-number">{{ date.day }}</span>
            <div v-if="date.hasEvent" class="event-indicator"></div>
          </div>
        </div>
      </q-card-section>
      
      <!-- Panel de eventos del día seleccionado -->
      <q-separator v-if="selectedDate" />
      <q-card-section v-if="selectedDate" class="events-section">
        <div class="events-header">
          <h6>{{ formatSelectedDate }}</h6>
          <q-btn 
            flat 
            dense 
            icon="add" 
            color="blue-7" 
            @click="showAddEventDialog = true"
            size="sm"
          >
            <q-tooltip>Agregar evento</q-tooltip>
          </q-btn>
        </div>
        <div v-if="selectedDateEvents.length > 0" class="events-list">
          <div 
            v-for="event in selectedDateEvents" 
            :key="event.id"
            :class="['event-item', `event-${event.type}`]"
          >
            <div class="event-time">{{ event.time }}</div>
            <div class="event-title">{{ event.title }}</div>
            <q-btn 
              flat 
              dense 
              round 
              icon="close" 
              color="red-6" 
              @click="removeEvent(event.id)"
              size="xs"
              class="event-remove"
            />
          </div>
        </div>
        <div v-else class="no-events">
          <q-icon name="event_note" size="2rem" color="grey-5" />
          <p>No hay eventos para este día</p>
          <q-btn 
            flat 
            color="blue-7" 
            label="Agregar evento" 
            @click="showAddEventDialog = true"
            size="sm"
            no-caps
          />
        </div>
      </q-card-section>
    </q-card>
    
    <!-- Dialog para agregar eventos -->
    <q-dialog v-model="showAddEventDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Agregar Evento</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            dense
            v-model="newEvent.title"
            label="Título del evento"
            autofocus
            @keyup.enter="addEvent"
            :rules="[val => !!val?.trim() || 'El título es requerido']"
            lazy-rules
          />
          <q-input
            dense
            v-model="newEvent.time"
            label="Hora (HH:MM)"
            mask="##:##"
            placeholder="09:00"
            class="q-mt-md"
            :rules="[
              val => !val || /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(val) || 'Formato de hora inválido (HH:MM)'
            ]"
            lazy-rules
          />
          <q-select
            dense
            v-model="newEvent.type"
            :options="eventTypes"
            label="Tipo de evento"
            class="q-mt-md"
            emit-value
            map-options
          />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancelar" @click="cancelAddEvent" />
          <q-btn 
            flat 
            label="Agregar" 
            @click="addEvent"
            :disable="!newEvent.title?.trim()"
            color="primary"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

// Variables reactivas
const currentDate = ref(new Date())
const selectedDate = ref(null)
const showAddEventDialog = ref(false)
const newEvent = ref({
  title: '',
  time: '',
  type: 'meeting'
})

// Tipos de eventos
const eventTypes = [
  { label: 'Reunión', value: 'meeting' },
  { label: 'Presentación', value: 'presentation' },
  { label: 'Revisión', value: 'review' },
  { label: 'Llamada', value: 'call' },
  { label: 'Tarea', value: 'task' },
  { label: 'Recordatorio', value: 'reminder' }
]

// Clave para localStorage
const STORAGE_KEY = 'calendar_events'

// Función para cargar eventos desde localStorage
function loadEventsFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Error loading events from localStorage:', error)
  }
  
  // Datos de ejemplo si no hay eventos guardados
  return [
    {
      id: 1,
      date: '2024-09-25',
      time: '09:00',
      title: 'Reunión de equipo',
      type: 'meeting'
    },
    {
      id: 2,
      date: '2024-09-27',
      time: '14:30',
      title: 'Presentación proyecto',
      type: 'presentation'
    },
    {
      id: 3,
      date: '2024-09-30',
      time: '11:00',
      title: 'Revisión documentos',
      type: 'review'
    },
    {
      id: 4,
      date: new Date().toISOString().split('T')[0], // Evento de hoy
      time: '10:00',
      title: 'Llamada importante',
      type: 'call'
    }
  ]
}

// Función para guardar eventos en localStorage
function saveEventsToStorage(eventsToSave) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(eventsToSave))
  } catch (error) {
    console.error('Error saving events to localStorage:', error)
  }
}

// Inicializar eventos desde localStorage
const events = ref(loadEventsFromStorage())

// Watcher para guardar automáticamente cuando cambien los eventos
watch(events, (newEvents) => {
  saveEventsToStorage(newEvents)
}, { deep: true })

// Días de la semana
const weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

// Mes y año actual
const currentMonthYear = computed(() => {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]
  return `${months[currentDate.value.getMonth()]} ${currentDate.value.getFullYear()}`
})

// Días del calendario
const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  // Primer día del mes
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  
  // Día de la semana del primer día (0 = domingo)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  const days = []
  const today = new Date()
  
  // Generar 42 días (6 semanas × 7 días)
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    
    const isCurrentMonth = date.getMonth() === month
    const isToday = date.toDateString() === today.toDateString()
    const dateString = date.toISOString().split('T')[0]
    const hasEvent = events.value.some(event => event.date === dateString)
    const isSelected = selectedDate.value && date.toDateString() === selectedDate.value.toDateString()
    
    days.push({
      key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
      day: date.getDate(),
      date: new Date(date),
      isCurrentMonth,
      isToday,
      hasEvent,
      isSelected
    })
  }
  
  return days
})

// Eventos del día seleccionado
const selectedDateEvents = computed(() => {
  if (!selectedDate.value) return []
  
  const dateString = selectedDate.value.toISOString().split('T')[0]
  return events.value.filter(event => event.date === dateString)
})

// Fecha seleccionada formateada
const formatSelectedDate = computed(() => {
  if (!selectedDate.value) return ''
  
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }
  return selectedDate.value.toLocaleDateString('es-ES', options)
})

// Métodos
function previousMonth() {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() - 1)
  currentDate.value = newDate
}

function nextMonth() {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() + 1)
  currentDate.value = newDate
}

function goToToday() {
  currentDate.value = new Date()
  selectedDate.value = new Date()
}

function selectDate(dateObj) {
  selectedDate.value = new Date(dateObj.date)
}

function addEvent() {
  if (!newEvent.value.title.trim() || !selectedDate.value) return
  
  const dateString = selectedDate.value.toISOString().split('T')[0]
  const eventToAdd = {
    id: Date.now(), // ID único basado en timestamp
    date: dateString,
    time: newEvent.value.time || '09:00',
    title: newEvent.value.title.trim(),
    type: newEvent.value.type
  }
  
  events.value.push(eventToAdd)
  
  // Mostrar notificación de éxito
  try {
    window.$q?.notify({
      type: 'positive',
      message: 'Evento agregado exitosamente',
      position: 'top-right',
      timeout: 2000
    })
  } catch (error) {
    console.log('Evento agregado:', eventToAdd.title)
  }
  
  cancelAddEvent()
}

function cancelAddEvent() {
  showAddEventDialog.value = false
  newEvent.value = {
    title: '',
    time: '',
    type: 'meeting'
  }
}

function removeEvent(eventId) {
  const eventIndex = events.value.findIndex(event => event.id === eventId)
  if (eventIndex !== -1) {
    const removedEvent = events.value[eventIndex]
    events.value.splice(eventIndex, 1)
    
    // Mostrar notificación de éxito
    try {
      window.$q?.notify({
        type: 'warning',
        message: 'Evento eliminado',
        position: 'top-right',
        timeout: 2000
      })
    } catch (error) {
      console.log('Evento eliminado:', removedEvent.title)
    }
  }
}

// Función para limpiar eventos antiguos (opcional)
function cleanOldEvents() {
  const currentDate = new Date()
  const thirtyDaysAgo = new Date(currentDate.getTime() - (30 * 24 * 60 * 60 * 1000))
  
  const initialCount = events.value.length
  events.value = events.value.filter(event => {
    const eventDate = new Date(event.date)
    return eventDate >= thirtyDaysAgo
  })
  
  const removedCount = initialCount - events.value.length
  if (removedCount > 0) {
    console.log(`Eventos antiguos eliminados: ${removedCount}`)
  }
}

// Inicializar componente
onMounted(() => {
  selectedDate.value = new Date()
  
  // Opcional: limpiar eventos antiguos al cargar
  // cleanOldEvents()
  
  // Configurar guardado automático en caso de cierre inesperado
  window.addEventListener('beforeunload', () => {
    saveEventsToStorage(events.value)
  })
})
</script>

<style scoped>
.calendar-container {
  width: 100%;
  max-width: 400px;
}

.calendar-card {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.calendar-header {
  background: linear-gradient(135deg, #1976d2, #1565c0);
  color: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.month-year {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  min-width: 150px;
  text-align: center;
}

.calendar-body {
  padding: 0;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #f8fafc;
  border-bottom: 1px solid #e1f5fe;
}

.weekday {
  padding: 0.75rem 0.5rem;
  text-align: center;
  font-weight: 600;
  font-size: 0.875rem;
  color: #64748b;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.calendar-day {
  position: relative;
  padding: 0.75rem 0.5rem;
  text-align: center;
  cursor: pointer;
  border-right: 1px solid #f1f5f9;
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.2s ease;
  min-height: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.calendar-day:hover {
  background-color: rgba(25, 118, 210, 0.08);
}

.calendar-day.other-month {
  color: #cbd5e1;
  background-color: #fafafa;
}

.calendar-day.today {
  background-color: rgba(25, 118, 210, 0.1);
  color: #1976d2;
  font-weight: 600;
}

.calendar-day.selected {
  background-color: #1976d2;
  color: white;
}

.calendar-day.has-event .day-number {
  font-weight: 600;
}

.day-number {
  font-size: 0.9rem;
}

.event-indicator {
  width: 6px;
  height: 6px;
  background-color: #ff5722;
  border-radius: 50%;
  margin-top: 2px;
}

.calendar-day.selected .event-indicator {
  background-color: white;
}

.events-section {
  background: #f8fafc;
  border-top: 1px solid #e1f5fe;
}

.events-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.events-header h6 {
  margin: 0;
  color: #1a202c;
  font-weight: 600;
  font-size: 1rem;
  text-transform: capitalize;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.event-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: white;
  border-radius: 8px;
  border-left: 4px solid #1976d2;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: relative;
  transition: all 0.2s ease;
}

.event-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.event-item.event-meeting {
  border-left-color: #1976d2;
}

.event-item.event-presentation {
  border-left-color: #ff9800;
}

.event-item.event-review {
  border-left-color: #4caf50;
}

.event-item.event-call {
  border-left-color: #9c27b0;
}

.event-item.event-task {
  border-left-color: #f44336;
}

.event-item.event-reminder {
  border-left-color: #607d8b;
}

.event-time {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 600;
  min-width: 50px;
}

.event-title {
  font-size: 0.9rem;
  color: #1a202c;
  font-weight: 500;
  flex: 1;
}

.event-remove {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.event-item:hover .event-remove {
  opacity: 1;
}

.no-events {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2rem 1rem;
  color: #64748b;
}

.no-events p {
  margin: 0;
  font-size: 0.875rem;
}

/* Responsive */
@media (max-width: 768px) {
  .calendar-container {
    max-width: 100%;
  }
  
  .calendar-day {
    min-height: 45px;
    padding: 0.5rem 0.25rem;
  }
  
  .day-number {
    font-size: 0.8rem;
  }
  
  .weekday {
    padding: 0.5rem 0.25rem;
    font-size: 0.8rem;
  }
  
  .month-year {
    font-size: 1rem;
    min-width: 120px;
  }
  
  .calendar-header {
    padding: 0.75rem;
  }
  
  .header-controls {
    gap: 0.5rem;
  }
  
  .events-section {
    padding: 1rem;
  }
  
  .event-item {
    padding: 0.5rem;
    gap: 0.75rem;
  }
  
  .event-time {
    font-size: 0.8rem;
    min-width: 45px;
  }
  
  .event-title {
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .calendar-header {
    flex-direction: column;
    gap: 0.75rem;
    align-items: stretch;
  }
  
  .header-controls {
    justify-content: center;
  }
  
  .calendar-day {
    min-height: 40px;
    padding: 0.25rem;
  }
  
  .day-number {
    font-size: 0.75rem;
  }
  
  .weekday {
    padding: 0.5rem 0.125rem;
    font-size: 0.75rem;
  }
  
  .event-indicator {
    width: 4px;
    height: 4px;
  }
}
</style>