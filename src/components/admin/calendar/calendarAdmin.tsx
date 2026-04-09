'use client';

import { useMemo, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import type {
  DateSelectArg,
  DatesSetArg,
  EventClickArg,
  EventContentArg,
} from '@fullcalendar/core';
import styles from '@/styles/admin/calendar/calendarAdmin.module.css';
import Image from 'next/image';
type CalendarView = 'timeGridDay' | 'dayGridWeek' | 'dayGridMonth';

type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'in_service'
  | 'completed'
  | 'cancelled'
  | 'no_show';

type BookingSource = 'website' | 'facebook' | 'zalo' | 'phone' | 'walk_in';

type StaffStatus = 'available' | 'busy' | 'break' | 'off';

type Staff = {
  id: string;
  name: string;
  role: string;
  avatar: string;
  bookingCount: number;
  status: StaffStatus;
};

type Booking = {
  id: string;
  customerName: string;
  customerPhone: string;
  serviceName: string;
  staffId: string;
  start: string;
  end: string;
  status: BookingStatus;
  source: BookingSource;
  note?: string;
};

const staffList: Staff[] = [
  { id: 's1', name: 'Anna Tran', role: 'Hair Stylist', avatar: 'A', bookingCount: 5, status: 'busy' },
  { id: 's2', name: 'Lina Pham', role: 'Nail Technician', avatar: 'L', bookingCount: 3, status: 'available' },
  { id: 's3', name: 'Mia Nguyen', role: 'Spa Therapist', avatar: 'M', bookingCount: 4, status: 'break' },
  { id: 's4', name: 'Khanh Le', role: 'Hair Stylist', avatar: 'K', bookingCount: 2, status: 'available' },
  { id: 's5', name: 'Tracy Do', role: 'Reception / Support', avatar: 'T', bookingCount: 1, status: 'off' },
];

const bookingList: Booking[] = [
  {
    id: 'b1',
    customerName: 'Emma Watson',
    customerPhone: '0901 234 567',
    serviceName: 'Hair Cut + Wash',
    staffId: 's1',
    start: '2026-04-09T09:30:00',
    end: '2026-04-09T10:30:00',
    status: 'confirmed',
    source: 'website',
    note: 'Prefers quiet seat',
  },
  {
    id: 'b2',
    customerName: 'Olivia Smith',
    customerPhone: '0902 222 999',
    serviceName: 'Gel Nail',
    staffId: 's2',
    start: '2026-04-09T10:00:00',
    end: '2026-04-09T11:30:00',
    status: 'pending',
    source: 'facebook',
    note: 'Needs color consultation',
  },
  {
    id: 'b3',
    customerName: 'Sophia Lee',
    customerPhone: '0903 888 777',
    serviceName: 'Facial Treatment',
    staffId: 's3',
    start: '2026-04-09T11:00:00',
    end: '2026-04-09T12:00:00',
    status: 'checked_in',
    source: 'phone',
  },
  {
    id: 'b4',
    customerName: 'Lily Brown',
    customerPhone: '0911 111 111',
    serviceName: 'Hair Coloring',
    staffId: 's1',
    start: '2026-04-09T13:00:00',
    end: '2026-04-09T15:00:00',
    status: 'in_service',
    source: 'website',
    note: 'Sensitive scalp',
  },
  {
    id: 'b5',
    customerName: 'Ava Johnson',
    customerPhone: '0912 345 999',
    serviceName: 'Basic Pedicure',
    staffId: 's2',
    start: '2026-04-09T14:00:00',
    end: '2026-04-09T15:00:00',
    status: 'confirmed',
    source: 'zalo',
  },
  {
    id: 'b6',
    customerName: 'Chloe Kim',
    customerPhone: '0918 567 123',
    serviceName: 'Head Spa',
    staffId: 's4',
    start: '2026-04-09T15:00:00',
    end: '2026-04-09T16:00:00',
    status: 'completed',
    source: 'walk_in',
  },
  {
    id: 'b7',
    customerName: 'Noah Martin',
    customerPhone: '0909 888 222',
    serviceName: 'Hair Wash',
    staffId: 's3',
    start: '2026-04-10T09:30:00',
    end: '2026-04-10T10:15:00',
    status: 'confirmed',
    source: 'website',
  },
  {
    id: 'b8',
    customerName: 'Ella Davis',
    customerPhone: '0907 666 555',
    serviceName: 'Nail Art',
    staffId: 's2',
    start: '2026-04-11T13:00:00',
    end: '2026-04-11T14:30:00',
    status: 'pending',
    source: 'facebook',
  },
];

function formatCalendarTitle(date: Date, view: CalendarView) {
  if (view === 'dayGridMonth') {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  }

  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function getStatusLabel(status: BookingStatus) {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'confirmed':
      return 'Confirmed';
    case 'checked_in':
      return 'Checked-in';
    case 'in_service':
      return 'In service';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    case 'no_show':
      return 'No-show';
    default:
      return status;
  }
}

function getSourceLabel(source: BookingSource) {
  switch (source) {
    case 'walk_in':
      return 'Walk-in';
    default:
      return source.charAt(0).toUpperCase() + source.slice(1);
  }
}

function getStaffStatusLabel(status: StaffStatus) {
  switch (status) {
    case 'available':
      return 'Available';
    case 'busy':
      return 'Busy';
    case 'break':
      return 'On break';
    case 'off':
      return 'Off';
    default:
      return status;
  }
}

function getMonthMatrix(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const matrix: (number | null)[][] = [];
  let currentDay = 1;

  for (let row = 0; row < 6; row += 1) {
    const week: (number | null)[] = [];
    for (let col = 0; col < 7; col += 1) {
      const cellIndex = row * 7 + col;
      if (cellIndex < firstDay || currentDay > daysInMonth) {
        week.push(null);
      } else {
        week.push(currentDay);
        currentDay += 1;
      }
    }
    matrix.push(week);
  }

  return matrix;
}

export default function CalendarAdmin() {
  const calendarRef = useRef<FullCalendar | null>(null);

  const [currentView, setCurrentView] = useState<CalendarView>('dayGridWeek');
  const [calendarTitle, setCalendarTitle] = useState('April 2026');
  const [search, setSearch] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('all');
  const [selectedBookingId, setSelectedBookingId] = useState<string>('b2');

  const today = new Date('2026-04-09T09:00:00');
  const miniCalendar = useMemo(() => getMonthMatrix(today.getFullYear(), today.getMonth()), [today]);

  const filteredBookings = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return bookingList.filter((booking) => {
      const matchSearch =
        !keyword ||
        booking.customerName.toLowerCase().includes(keyword) ||
        booking.customerPhone.toLowerCase().includes(keyword) ||
        booking.serviceName.toLowerCase().includes(keyword);

      const matchStaff = selectedStaffId === 'all' || booking.staffId === selectedStaffId;
      return matchSearch && matchStaff;
    });
  }, [search, selectedStaffId]);

  const selectedBooking = useMemo(() => {
    return bookingList.find((booking) => booking.id === selectedBookingId) ?? bookingList[0];
  }, [selectedBookingId]);

  const selectedStaff = useMemo(() => {
    if (!selectedBooking) return null;
    return staffList.find((staff) => staff.id === selectedBooking.staffId) ?? null;
  }, [selectedBooking]);

  const calendarEvents = useMemo(() => {
    return filteredBookings.map((booking) => ({
      id: booking.id,
      title: booking.customerName,
      start: booking.start,
      end: booking.end,
      allDay: false,
      extendedProps: {
        serviceName: booking.serviceName,
        customerPhone: booking.customerPhone,
        status: booking.status,
        source: booking.source,
        staffId: booking.staffId,
        note: booking.note,
      },
    }));
  }, [filteredBookings]);

  const updateTitleFromApi = () => {
    const api = calendarRef.current?.getApi();
    if (!api) return;
    setCalendarTitle(formatCalendarTitle(api.getDate(), api.view.type as CalendarView));
  };

  const handlePrev = () => {
    const api = calendarRef.current?.getApi();
    api?.prev();
    updateTitleFromApi();
  };

  const handleNext = () => {
    const api = calendarRef.current?.getApi();
    api?.next();
    updateTitleFromApi();
  };

  const handleToday = () => {
    const api = calendarRef.current?.getApi();
    api?.today();
    updateTitleFromApi();
  };

  const handleChangeView = (view: CalendarView) => {
    const api = calendarRef.current?.getApi();
    api?.changeView(view);
    setCurrentView(view);
    updateTitleFromApi();
  };

  const handleSelectSlot = (arg: DateSelectArg) => {
    console.log('Create booking at:', arg.startStr, arg.endStr);
  };

  const handleEventClick = (arg: EventClickArg) => {
    setSelectedBookingId(arg.event.id);
  };

  const renderEventContent = (arg: EventContentArg) => {
    const status = arg.event.extendedProps.status as BookingStatus;
    const serviceName = arg.event.extendedProps.serviceName as string;

    return (
      <div className={`${styles.eventCard} ${styles[`event_${status}`]}`}>
        <div className={styles.eventIconWrap}>
          <i className="bi bi-google" />
        </div>
        <div className={styles.eventContent}>
          <div className={styles.eventTitle}>{serviceName}</div>
          <div className={styles.eventSub}>{arg.timeText}</div>
        </div>
      </div>
    );
  };

  const attendeeList = [
  {
    id: 'u1',
    name: 'Anna Tran',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
  },
  {
    id: 'u2',
    name: 'David Lee',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
  },
  {
    id: 'u3',
    name: 'Mia Nguyen',
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80',
  },
  {
    id: 'u4',
    name: 'Khanh Le',
    avatar:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80',
  },
  {
    id: 'u5',
    name: 'Lina Pham',
    avatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
  },
  {
    id: 'u6',
    name: 'Tracy Do',
    avatar:
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=120&q=80',
  },
];

  return (
    <div className={styles.pageShell}>
      <div className={styles.appFrame}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarBlock}>
            <div className={styles.sidebarMonthHeader}>
              <span className={styles.monthTitle}>January 2024</span>
              <div className={styles.inlineActions}>
                <button type="button"><i className="bi bi-chevron-left" /></button>
                <button type="button"><i className="bi bi-chevron-right" /></button>
              </div>
            </div>

            <div className={styles.miniCalendar}>
              <div className={styles.miniWeekdays}>
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>

              <div className={styles.miniGrid}>
                {miniCalendar.flat().map((day, index) => (
                  <button
                    key={`${day}-${index}`}
                    type="button"
                    className={`${styles.miniDay} ${day === 15 ? styles.miniDayActive : ''}`}
                  >
                    {day ?? ''}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.sidebarBlock}>
            <div className={styles.sidebarTitle}>My calendars</div>
            <div className={styles.menuList}>
              <label className={styles.menuItem}><input type="checkbox" defaultChecked /> <span className={`${styles.dot} ${styles.dotWork}`} /> Work</label>
              <label className={styles.menuItem}><input type="checkbox" defaultChecked /> <span className={`${styles.dot} ${styles.dotEdu}`} /> Education</label>
              <label className={styles.menuItem}><input type="checkbox" defaultChecked /> <span className={`${styles.dot} ${styles.dotPersonal}`} /> Personal</label>
            </div>
          </div>

          <div className={styles.sidebarBlock}>
            <div className={styles.sidebarTitle}>Platforms</div>
            <div className={styles.menuList}>
              <label className={styles.menuItem}><input type="checkbox" defaultChecked /> <i className="bi bi-camera-video-fill" /> Google Meet</label>
              <label className={styles.menuItem}><input type="checkbox" defaultChecked /> <i className="bi bi-slack" /> Slack</label>
              <label className={styles.menuItem}><input type="checkbox" defaultChecked /> <i className="bi bi-camera-video-fill" /> Zoom</label>
              <label className={styles.menuItem}><input type="checkbox" defaultChecked /> <i className="bi bi-discord" /> Discord</label>
              <label className={styles.menuItem}><input type="checkbox" defaultChecked /> <i className="bi bi-skype" /> Skype</label>
            </div>
          </div>
        </aside>

        <section className={styles.mainPanel}>
          <header className={styles.topbar}>
            <div className={styles.topbarLeft}>
              <button type="button" className={styles.navBtn} onClick={handlePrev}>
                <i className="bi bi-chevron-left" />
              </button>
              <h1 className={styles.calendarTitle}>{calendarTitle}</h1>
              <button type="button" className={styles.navBtn} onClick={handleNext}>
                <i className="bi bi-chevron-right" />
              </button>
            </div>

            <div className={styles.topbarCenter}>
              <button type="button" className={styles.todayBtn} onClick={handleToday}>Today</button>
              <div className={styles.viewTabs}>
                <button
                  type="button"
                  className={`${styles.viewTab} ${currentView === 'timeGridDay' ? styles.viewTabActive : ''}`}
                  onClick={() => handleChangeView('timeGridDay')}
                >
                  Day
                </button>
                <button
                  type="button"
                  className={`${styles.viewTab} ${currentView === 'dayGridWeek' ? styles.viewTabActive : ''}`}
                  onClick={() => handleChangeView('dayGridWeek')}
                >
                  Week
                </button>
                <button
                  type="button"
                  className={`${styles.viewTab} ${currentView === 'dayGridMonth' ? styles.viewTabActive : ''}`}
                  onClick={() => handleChangeView('dayGridMonth')}
                >
                  Month
                </button>
              </div>
            </div>

            <div className={styles.topbarRight}>
              <label className={styles.searchBox}>
                <i className="bi bi-search" />
                <input
                  type="text"
                  placeholder="Search customer, phone, service"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>
            </div>
            <div className={styles.userStackWrap}>
                <div className={styles.userStack}>
                    {attendeeList.slice(0, 5).map((user) => (
                    <div
                        key={user.id}
                        className={styles.userAvatar}
                        title={user.name}
                    >
                       <Image src={user.avatar} alt={user.name} fill sizes="36px" unoptimized />
                    </div>
                    ))}

                    {attendeeList.length > 5 ? (
                    <div className={styles.userMore}>+{attendeeList.length - 5}</div>
                    ) : null}
                </div>
            </div>
          </header>

          <div className={styles.contentGrid}>
            <div className={styles.calendarSurface}>
              <div className={styles.calendarToolbarInfo}>
                <div>
                  <span className={styles.timezone}>UTC+2</span>
                  <button type="button" className={styles.dayOffChip}>Day off</button>
                </div>
                <div>
                  <button type="button" className={styles.dayOffChip}>Day off</button>
                </div>
              </div>

              <div className={styles.calendarWrap}>
                <FullCalendar
                  ref={calendarRef}
                  plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
                  initialView="dayGridWeek"
                  initialDate="2026-04-09"
                  headerToolbar={false}
                  allDaySlot={false}
                  selectable
                  editable={false}
                  nowIndicator={currentView === 'timeGridDay'}
                  weekends
                  dayHeaders={currentView !== 'timeGridDay'}
                  slotMinTime="08:00:00"
                  slotMaxTime="20:00:00"
                  scrollTime="08:00:00"
                  height="100%"
                  events={calendarEvents}
                  select={handleSelectSlot}
                  eventClick={handleEventClick}
                  datesSet={(arg: DatesSetArg) => {
                    const nextView = arg.view.type as CalendarView;
                    setCurrentView(nextView);
                    setCalendarTitle(formatCalendarTitle(arg.start, nextView));
                  }}
                  eventContent={renderEventContent}
                />
              </div>
            </div>

            <aside className={styles.rightPanel}>
              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <div>
                    <div className={styles.cardTitle}>Booking detail</div>
                    <div className={styles.cardSub}>Focused information</div>
                  </div>
                  {selectedBooking ? (
                    <span className={`${styles.statusPill} ${styles[`pill_${selectedBooking.status}`]}`}>
                      {getStatusLabel(selectedBooking.status)}
                    </span>
                  ) : null}
                </div>

                {selectedBooking ? (
                  <div className={styles.detailList}>
                    <div className={styles.detailRow}><span>Customer</span><strong>{selectedBooking.customerName}</strong></div>
                    <div className={styles.detailRow}><span>Phone</span><strong>{selectedBooking.customerPhone}</strong></div>
                    <div className={styles.detailRow}><span>Service</span><strong>{selectedBooking.serviceName}</strong></div>
                    <div className={styles.detailRow}><span>Time</span><strong>{formatTime(selectedBooking.start)} - {formatTime(selectedBooking.end)}</strong></div>
                    <div className={styles.detailRow}><span>Staff</span><strong>{selectedStaff?.name ?? 'Unassigned'}</strong></div>
                    <div className={styles.detailRow}><span>Source</span><strong>{getSourceLabel(selectedBooking.source)}</strong></div>
                    <div className={styles.detailNote}>
                      <span>Note</span>
                      <p>{selectedBooking.note || 'No note from customer.'}</p>
                    </div>
                    <div className={styles.actionRow}>
                      <button type="button" className={styles.primaryBtn}>Confirm</button>
                      <button type="button" className={styles.secondaryBtn}>Reschedule</button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.emptyState}>No booking selected.</div>
                )}
              </div>
            </aside>
          </div>
        </section>
      </div>
    </div>
  );
}