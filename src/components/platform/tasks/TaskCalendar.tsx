'use client';

import FullCalendar from '@fullcalendar/react';

import dayGridPlugin from '@fullcalendar/daygrid';

import timeGridPlugin from '@fullcalendar/timegrid';

import interactionPlugin from '@fullcalendar/interaction';

import { useTaskCalendar } from '@/hooks/tasks/useTaskCalendar';

import styles from '@/styles/platform/tasks/TaskCalendar.module.css';

export default function TaskCalendar() {
    const { events, loading } = useTaskCalendar();

    if (loading) {
        return <div>Loading Calendar...</div>;
    }

    return (
        <div className={styles.wrapper}>
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                height="80vh"
                events={events}
                editable={false}
                selectable
                eventTimeFormat={{
                    hour: '2-digit',
                    minute: '2-digit',
                    meridiem: false,
                }}
            />
        </div>
    );
}
