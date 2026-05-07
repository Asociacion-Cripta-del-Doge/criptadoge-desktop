import React, { useState, useMemo } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { DateClickArg } from '@fullcalendar/interaction'
import type { EventClickArg, EventInput, EventMountArg } from '@fullcalendar/core'
import { useNavigate } from 'react-router-dom'
import styles from './EventCalendar.module.scss'
import { EventMaker } from '../EventMaker/EventMaker'
import { useEvents } from '../../hooks/useEvents'
import { AppEvent } from '../../data/events'
import { useEventLabels } from '../../hooks/useEventLabels'

function toCalendarEvent(evt: AppEvent, labelColor: string): EventInput {
  return {
    id: evt.id,
    title: evt.title,
    start: evt.time ? `${evt.date}T${evt.time}` : evt.date,
    backgroundColor: labelColor,
    borderColor: labelColor,
    extendedProps: {
      description: evt.description,
      label: evt.label,
      time: evt.time
    }
  }
}

export const EventCalendar: React.FC = () => {
  const { events, isLoading, addEvent } = useEvents()
  const { labels, isLoadingLabels, getLabelColor } = useEventLabels()
  const navigate = useNavigate()

  const [activeFilter, setActiveFilter] = useState('Todos')
  const [makerOpen, setMakerOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>('')

  const calendarEvents = useMemo(() => {
    const filtered =
      activeFilter === 'Todos' ? events : events.filter((e) => e.label === activeFilter)
    return filtered.map((event) => toCalendarEvent(event, getLabelColor(event.label)))
  }, [events, activeFilter, getLabelColor])

  const handleDateClick = (arg: DateClickArg): void => {
    setSelectedDate(arg.dateStr)
    setMakerOpen(true)
  }

  const handleEventClick = (arg: EventClickArg): void => {
    navigate(`/eventos/${arg.event.id}`)
  }

  const handleEventDidMount = (arg: EventMountArg): void => {
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
        {['Todos', ...labels.map((label) => label.name)].map((label) => (
          <button
            key={label}
            className={`${styles.filterBtn} ${activeFilter === label ? styles.filterActive : ''}`}
            style={
              activeFilter === label && label !== 'Todos'
                ? { borderColor: getLabelColor(label), color: getLabelColor(label) }
                : undefined
            }
            onClick={() => setActiveFilter(label)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className={styles.calendarWrapper}>
        {isLoading || isLoadingLabels ? (
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
