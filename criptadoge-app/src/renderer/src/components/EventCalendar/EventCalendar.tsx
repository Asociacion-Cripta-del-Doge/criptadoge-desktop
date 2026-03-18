import React, { useState, useMemo } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { DateClickArg } from '@fullcalendar/interaction'
import type { EventClickArg, EventMountArg } from '@fullcalendar/core'
import { useNavigate } from 'react-router-dom'
import styles from './EventCalendar.module.scss'
import { EventMaker } from '../EventMaker/EventMaker'
import { useEvents } from '../../hooks/useEvents'
import { AppEvent, LABEL_COLORS } from '../../data/events'

const FILTER_LABELS = ['Todos', 'Magic: The Gathering', 'Yu-Gi-Oh!', 'Pokémon TCG', 'Juegos de Mesa', 'Rol / D&D']

function toCalendarEvent(evt: AppEvent) {
  return {
    id: evt.id,
    title: evt.title,
    start: evt.time ? `${evt.date}T${evt.time}` : evt.date,
    backgroundColor: LABEL_COLORS[evt.label] ?? LABEL_COLORS['Otro'],
    borderColor: LABEL_COLORS[evt.label] ?? LABEL_COLORS['Otro'],
    extendedProps: {
      description: evt.description,
      label: evt.label,
      time: evt.time
    }
  }
}

export const EventCalendar: React.FC = () => {
  const { events, isLoading, addEvent } = useEvents()
  const navigate = useNavigate()

  const [activeFilter, setActiveFilter] = useState('Todos')
  const [makerOpen, setMakerOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>('')

  const calendarEvents = useMemo(() => {
    const filtered = activeFilter === 'Todos'
      ? events
      : events.filter((e) => e.label === activeFilter)
    return filtered.map(toCalendarEvent)
  }, [events, activeFilter])

  const handleDateClick = (arg: DateClickArg) => {
    setSelectedDate(arg.dateStr)
    setMakerOpen(true)
  }

  const handleEventClick = (arg: EventClickArg) => {
    navigate(`/eventos/${arg.event.id}`)
  }

  const handleEventDidMount = (arg: EventMountArg) => {
    const { title, extendedProps } = arg.event
    const time = extendedProps.time ? ` · ${extendedProps.time}` : ''
    const desc = extendedProps.description ? `\n${extendedProps.description}` : ''
    arg.el.title = `${title}${time}${desc}`
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>CALENDARIO</h1>
      </header>

      <div className={styles.filters}>
        {FILTER_LABELS.map((label) => (
          <button
            key={label}
            className={`${styles.filterBtn} ${activeFilter === label ? styles.filterActive : ''}`}
            style={activeFilter === label && label !== 'Todos'
              ? { borderColor: LABEL_COLORS[label], color: LABEL_COLORS[label] }
              : undefined}
            onClick={() => setActiveFilter(label)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className={styles.calendarWrapper}>
        {isLoading ? (
          <div className={styles.loading}>Cargando eventos...</div>
        ) : (
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            locale="es"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek'
            }}
            buttonText={{ today: 'Hoy', month: 'Mes', week: 'Semana' }}
            events={calendarEvents}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            eventDidMount={handleEventDidMount}
            height="auto"
          />
        )}
      </div>

      <EventMaker
        isOpen={makerOpen}
        onClose={() => setMakerOpen(false)}
        onSuccess={addEvent}
        initialData={selectedDate ? { date: selectedDate } : undefined}
      />
    </div>
  )
}
