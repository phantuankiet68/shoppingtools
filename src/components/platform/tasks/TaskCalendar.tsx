'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';

import styles from '@/styles/platform/tasks/TaskCalendar.module.css';

import { useTaskCalendar } from '@/hooks/tasks/useTaskCalendar';

interface TaskCalendarProps {
    onViewTask: (task: any) => void;
}

export default function TaskCalendar({ onViewTask }: TaskCalendarProps) {
    const { events, loading } = useTaskCalendar();

    const calendarRef = useRef<FullCalendar>(null);

    const [searchKeyword, setSearchKeyword] = useState('');

    const [currentTitle, setCurrentTitle] = useState('');

    const [viewMode, setViewMode] = useState('dayGridMonth');

    const updateTitle = () => {
        const api = calendarRef.current?.getApi();

        if (!api) return;

        setCurrentTitle(api.view.title);
    };
    const filteredEvents = useMemo(() => {
        if (!searchKeyword.trim()) {
            return events;
        }

        return events.filter((event: any) =>
            event.title?.toLowerCase().includes(searchKeyword.toLowerCase()),
        );
    }, [events, searchKeyword]);

    const stats = useMemo(() => {
        return {
            todo: events.filter((e: any) => e.extendedProps?.status === 'TODO').length,

            inProgress: events.filter((e: any) => e.extendedProps?.status === 'IN_PROGRESS').length,

            done: events.filter((e: any) => e.extendedProps?.status === 'DONE').length,

            overdue: events.filter((e: any) => e.extendedProps?.status === 'OVERDUE').length,
        };
    }, [events]);

    const changeView = (view: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay') => {
        const calendarApi = calendarRef.current?.getApi();
        setViewMode(view);
        calendarApi?.changeView(view);
    };
    useEffect(() => {
        setTimeout(() => {
            updateTitle();
        }, 100);
    }, []);

    const goToday = () => {
        const api = calendarRef.current?.getApi();

        api?.today();

        updateTitle();
    };

    const goPrev = () => {
        const api = calendarRef.current?.getApi();

        api?.prev();

        updateTitle();
    };

    const goNext = () => {
        const api = calendarRef.current?.getApi();

        api?.next();

        updateTitle();
    };

    if (loading) {
        return <div className={styles.loading}>Loading Calendar...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.calendarHeader}>
                <div className={styles.searchBox}>
                    <input
                        type="text"
                        placeholder="Search task..."
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
                <div className={styles.headerLeft}>
                    <button className={styles.iconButton} onClick={goPrev} title="Previous Month">
                        <i className="bi bi-chevron-left"></i>
                    </button>

                    <button className={styles.iconButton} onClick={goNext} title="Next Month">
                        <i className="bi bi-chevron-right"></i>
                    </button>

                    <button className={styles.todayButton} onClick={goToday}>
                        <i className="bi bi-calendar-event"></i>

                        <span>Today</span>
                    </button>
                </div>

                <div className={styles.headerCenter}>{currentTitle}</div>

                <div className={styles.headerRight}>
                    <button
                        className={viewMode === 'dayGridMonth' ? styles.activeView : ''}
                        onClick={() => changeView('dayGridMonth')}
                    >
                        <i className="bi bi-calendar3"></i>
                        <span>Month</span>
                    </button>

                    <button
                        className={viewMode === 'timeGridWeek' ? styles.activeView : ''}
                        onClick={() => changeView('timeGridWeek')}
                    >
                        <i className="bi bi-calendar-week"></i>
                        <span>Week</span>
                    </button>

                    <button
                        className={viewMode === 'timeGridDay' ? styles.activeView : ''}
                        onClick={() => changeView('timeGridDay')}
                    >
                        <i className="bi bi-calendar-day"></i>
                        <span>Day</span>
                    </button>
                </div>
                <div className={styles.legend}>
                    <div>
                        <span className={styles.todoDot} />
                        Todo
                    </div>

                    <div>
                        <span className={styles.progressDot} />
                        In Progress
                    </div>

                    <div>
                        <span className={styles.doneDot} />
                        Done
                    </div>

                    <div>
                        <span className={styles.overdueDot} />
                        Overdue
                    </div>
                </div>
            </div>
            {/* Calendar */}
            <div className={styles.calendarCard}>
                <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    height="75vh"
                    events={filteredEvents}
                    editable={false}
                    selectable
                    dayMaxEvents={4}
                    moreLinkClick="popover"
                    eventClick={(info) => {
                        const task = info.event.extendedProps?.task;

                        if (task) {
                            onViewTask(task);
                        }
                    }}
                    headerToolbar={false}
                    eventContent={(eventInfo) => {
                        const status = eventInfo.event.extendedProps.status;

                        return (
                            <div className={`${styles.event} ${styles[status.toLowerCase()]}`}>
                                <span className={styles.eventText}>{eventInfo.event.title}</span>
                            </div>
                        );
                    }}
                    dayCellClassNames={(arg) => (arg.isToday ? styles.today : '')}
                />
            </div>
        </div>
    );
}
