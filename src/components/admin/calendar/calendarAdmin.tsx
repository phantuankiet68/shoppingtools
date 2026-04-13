'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { useAdminAuth } from '@/components/admin/providers/AdminAuthProvider';
import { useAdminI18n } from '@/components/admin/providers/AdminI18nProvider';
import styles from '@/styles/admin/calendar/calendarAdmin.module.css';

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

type Booking = {
  id: string;
  customerName: string;
  customerPhone: string;
  serviceName: string;
  start: string;
  end: string;
  status: BookingStatus;
  source: BookingSource;
  note?: string | null;
  siteId: string;
  createdAt: string;
  updatedAt: string;
};

type BookingListResponse = {
  success: boolean;
  data: Booking[];
  total: number;
  message?: string;
};

type BookingDetailResponse = {
  success: boolean;
  data: Booking;
  message?: string;
};

type CreateBookingForm = {
  customerName: string;
  customerPhone: string;
  serviceName: string;
  source: BookingSource;
  note: string;
  start: string;
  end: string;
};


function normalizeLocale(locale?: string) {
  if (!locale) return 'vi-VN';

  switch (locale) {
    case 'vi':
      return 'vi-VN';
    case 'en':
      return 'en-US';
    case 'ja':
      return 'ja-JP';
    default:
      return locale;
  }
}

function formatCalendarTitle(date: Date, view: CalendarView, locale: string) {
  if (view === 'timeGridDay') {
    return date.toLocaleDateString(locale, {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  return date.toLocaleDateString(locale, {
    month: 'long',
    year: 'numeric',
  });
}

function formatTime(dateStr: string, locale: string) {
  return new Date(dateStr).toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function formatDateTime(dateStr: string, locale: string) {
  return new Date(dateStr).toLocaleString(locale);
}

function formatSidebarBookingDate(dateStr: string, locale: string) {
  return new Date(dateStr).toLocaleString(locale, {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
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

function isSameDate(dateA: Date, dateB: Date) {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

function toDateTimeLocalValue(dateStr: string) {
  if (!dateStr) return '';

  const date = new Date(dateStr);
  const timezoneOffset = date.getTimezoneOffset() * 60 * 1000;
  const localDate = new Date(date.getTime() - timezoneOffset);

  return localDate.toISOString().slice(0, 16);
}

function fromDateTimeLocalValue(value: string) {
  if (!value) return '';
  return new Date(value).toISOString();
}

function addMinutesToIsoString(dateStr: string, minutes: number) {
  const date = new Date(dateStr);
  date.setMinutes(date.getMinutes() + minutes);
  return date.toISOString();
}

export default function CalendarAdmin() {
  const { user, site } = useAdminAuth();
  const { t, locale } = useAdminI18n();

  const currentLocale = normalizeLocale(locale);
  const tc = useCallback(
    (key: string, values?: Record<string, string | number>) => {
      let text = t(`calendarAdmin.${key}`);

      if (values) {
        Object.entries(values).forEach(([k, v]) => {
          text = text.replace(new RegExp(`{${k}}`, 'g'), String(v));
        });
      }

      return text;
    },
    [t]
  );

  const userId = user?.id ?? '';
  const siteId = site?.id ?? '';

  const calendarRef = useRef<FullCalendar | null>(null);
  const initialDateRef = useRef(new Date());

  const [currentView, setCurrentView] = useState<CalendarView>('dayGridWeek');
  const [calendarTitle, setCalendarTitle] = useState(
    formatCalendarTitle(initialDateRef.current, 'dayGridWeek', currentLocale)
  );
  const [search, setSearch] = useState('');
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [miniCalendarDate, setMiniCalendarDate] = useState<Date>(
    initialDateRef.current
  );
  const [selectedMiniDay, setSelectedMiniDay] = useState<number>(
    initialDateRef.current.getDate()
  );

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [createLoading, setCreateLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateBookingForm>({
    customerName: '',
    customerPhone: '',
    serviceName: '',
    source: 'website',
    note: '',
    start: '',
    end: '',
  });

  useEffect(() => {
    setCalendarTitle((prev) => {
      if (prev) {
        const api = calendarRef.current?.getApi();
        const date = api?.getDate() ?? initialDateRef.current;
        const view = (api?.view.type as CalendarView | undefined) ?? currentView;
        return formatCalendarTitle(date, view, currentLocale);
      }

      return formatCalendarTitle(initialDateRef.current, currentView, currentLocale);
    });
  }, [currentLocale, currentView]);
  const miniCalendar = useMemo(
    () =>
      getMonthMatrix(
        miniCalendarDate.getFullYear(),
        miniCalendarDate.getMonth()
      ),
    [miniCalendarDate]
  );

  const getStatusLabel = useCallback(
    (status: BookingStatus) => {
      switch (status) {
        case 'pending':
          return tc('status.pending');
        case 'confirmed':
          return tc('status.confirmed');
        case 'checked_in':
          return tc('status.checkedIn');
        case 'in_service':
          return tc('status.inService');
        case 'completed':
          return tc('status.completed');
        case 'cancelled':
          return tc('status.cancelled');
        case 'no_show':
          return tc('status.noShow');
        default:
          return status;
      }
    },
    [tc]
  );

  const getSourceLabel = useCallback(
    (source: BookingSource) => {
      switch (source) {
        case 'website':
          return tc('source.website');
        case 'facebook':
          return tc('source.facebook');
        case 'zalo':
          return tc('source.zalo');
        case 'phone':
          return tc('source.phone');
        case 'walk_in':
          return tc('source.walkIn');
        default:
          return source;
      }
    },
    [tc]
  );

  const loadBookings = useCallback(async () => {
    if (!siteId) {
      setError(tc('errors.siteNotFound'));
      setBookings([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams({
        siteId,
      });

      const response = await fetch(`/api/admin/bookings?${params.toString()}`, {
        method: 'GET',
        cache: 'no-store',
      });

      const result: BookingListResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || tc('errors.loadBookingsFailed'));
      }

      const nextBookings = Array.isArray(result.data) ? result.data : [];
      setBookings(nextBookings);

      setSelectedBookingId((prev) => {
        if (prev && nextBookings.some((booking) => booking.id === prev)) {
          return prev;
        }

        return nextBookings[0]?.id ?? null;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : tc('errors.loadBookingsFailed'));
      setBookings([]);
      setSelectedBookingId(null);
    } finally {
      setLoading(false);
    }
  }, [siteId, tc]);

  useEffect(() => {
    if (!siteId) return;
    void loadBookings();
  }, [siteId, loadBookings]);

  const filteredBookings = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return bookings;

    return bookings.filter((booking) => {
      return (
        booking.customerName.toLowerCase().includes(keyword) ||
        booking.customerPhone.toLowerCase().includes(keyword) ||
        booking.serviceName.toLowerCase().includes(keyword) ||
        (booking.note ?? '').toLowerCase().includes(keyword)
      );
    });
  }, [bookings, search]);

  const selectedBooking = useMemo(() => {
    if (!selectedBookingId) return null;

    return (
      filteredBookings.find((booking) => booking.id === selectedBookingId) ||
      bookings.find((booking) => booking.id === selectedBookingId) ||
      null
    );
  }, [filteredBookings, bookings, selectedBookingId]);

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
        note: booking.note,
      },
    }));
  }, [filteredBookings]);

  const todayBookings = useMemo(() => {
    const today = new Date();

    return bookings.filter((booking) =>
      isSameDate(new Date(booking.start), today)
    );
  }, [bookings]);

  const todayCounts = useMemo(() => {
    return todayBookings.reduce(
      (acc, booking) => {
        acc.total += 1;
        acc[booking.status] += 1;
        return acc;
      },
      {
        total: 0,
        pending: 0,
        confirmed: 0,
        checked_in: 0,
        in_service: 0,
        completed: 0,
        cancelled: 0,
        no_show: 0,
      } as Record<BookingStatus | 'total', number>
    );
  }, [todayBookings]);

  const nearestBookings = useMemo(() => {
    const now = Date.now();

    const sorted = [...bookings].sort((a, b) => {
      const aStart = new Date(a.start).getTime();
      const bStart = new Date(b.start).getTime();

      const aDiff = aStart - now;
      const bDiff = bStart - now;

      const aIsUpcoming = aDiff >= 0;
      const bIsUpcoming = bDiff >= 0;

      if (aIsUpcoming && !bIsUpcoming) return -1;
      if (!aIsUpcoming && bIsUpcoming) return 1;

      if (aIsUpcoming && bIsUpcoming) {
        return aDiff - bDiff;
      }

      return Math.abs(aDiff) - Math.abs(bDiff);
    });

    return sorted.slice(0, 5);
  }, [bookings]);

  const syncCalendarStateFromApi = useCallback(() => {
    const api = calendarRef.current?.getApi();
    if (!api) return;

    const currentDate = api.getDate();
    const currentType = api.view.type as CalendarView;

    setCalendarTitle(formatCalendarTitle(currentDate, currentType, currentLocale));
    setCurrentView(currentType);
    setMiniCalendarDate(currentDate);
    setSelectedMiniDay(currentDate.getDate());
  }, [currentLocale]);

  const handlePrev = () => {
    const api = calendarRef.current?.getApi();
    api?.prev();
    syncCalendarStateFromApi();
  };

  const handleNext = () => {
    const api = calendarRef.current?.getApi();
    api?.next();
    syncCalendarStateFromApi();
  };

  const handleToday = () => {
    const api = calendarRef.current?.getApi();
    api?.today();
    syncCalendarStateFromApi();
  };

  const handleChangeView = (view: CalendarView) => {
    const api = calendarRef.current?.getApi();
    api?.changeView(view);
    setCurrentView(view);
    syncCalendarStateFromApi();
  };

  const handleMiniPrevMonth = () => {
    setMiniCalendarDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };

  const handleMiniNextMonth = () => {
    setMiniCalendarDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

  const handleMiniDayClick = (day: number | null) => {
    if (!day) return;

    const api = calendarRef.current?.getApi();
    if (!api) return;

    const year = miniCalendarDate.getFullYear();
    const month = miniCalendarDate.getMonth();
    const clickedDate = new Date(year, month, day);

    api.gotoDate(clickedDate);

    if (currentView === 'dayGridMonth') {
      api.changeView('timeGridDay', clickedDate);
      setCurrentView('timeGridDay');
    }

    setSelectedMiniDay(day);
    setMiniCalendarDate(clickedDate);
    syncCalendarStateFromApi();
  };

  const handleOpenCreateModal = (startIso: string, endIso: string) => {
    setCreateForm({
      customerName: '',
      customerPhone: '',
      serviceName: '',
      source: 'website',
      note: '',
      start: startIso,
      end: endIso,
    });

    setIsCreateModalOpen(true);
  };

  const handleSelectSlot = (arg: DateSelectArg) => {
    const startIso = arg.start.toISOString();
    const endIso = arg.end
      ? arg.end.toISOString()
      : addMinutesToIsoString(startIso, 60);

    handleOpenCreateModal(startIso, endIso);
    setSelectedBookingId(null);
  };

  const handleEventClick = (arg: EventClickArg) => {
    setSelectedBookingId(arg.event.id);
  };

  const handleCreateFormChange = (
    field: keyof CreateBookingForm,
    value: string
  ) => {
    setCreateForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCloseCreateModal = () => {
    if (createLoading) return;

    setIsCreateModalOpen(false);
    setCreateForm({
      customerName: '',
      customerPhone: '',
      serviceName: '',
      source: 'website',
      note: '',
      start: '',
      end: '',
    });
  };

  const handleCreateBooking = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!siteId) {
      setError(tc('errors.siteNotFound'));
      return;
    }

    try {
      setCreateLoading(true);
      setError('');

      const response = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: createForm.customerName.trim(),
          customerPhone: createForm.customerPhone.trim(),
          serviceName: createForm.serviceName.trim(),
          source: createForm.source,
          note: createForm.note.trim() || null,
          start: createForm.start,
          end: createForm.end,
          siteId,
          createdBy: userId || null,
        }),
      });

      const result: BookingDetailResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || tc('errors.createBookingFailed'));
      }

      setBookings((prev) => {
        const next = [...prev, result.data];
        next.sort(
          (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
        );
        return next;
      });

      setSelectedBookingId(result.data.id);
      handleCloseCreateModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : tc('errors.createBookingFailed'));
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUpdateStatus = async (status: BookingStatus) => {
    if (!selectedBooking) return;

    try {
      setActionLoading(true);
      setError('');

      const response = await fetch(`/api/admin/bookings/${selectedBooking.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      const result: BookingDetailResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || tc('errors.updateBookingFailed'));
      }

      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === selectedBooking.id ? result.data : booking
        )
      );
      setSelectedBookingId(result.data.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : tc('errors.updateBookingFailed'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBooking = async () => {
    if (!selectedBooking) return;

    const confirmed = window.confirm(
      tc('confirm.deleteBooking', { name: selectedBooking.customerName })
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError('');

      const response = await fetch(`/api/admin/bookings/${selectedBooking.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || tc('errors.deleteBookingFailed'));
      }

      setBookings((prev) =>
        prev.filter((booking) => booking.id !== selectedBooking.id)
      );
      setSelectedBookingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : tc('errors.deleteBookingFailed'));
    } finally {
      setActionLoading(false);
    }
  };

  const bookingNeedSuggestions = useMemo(
    () => [
      tc('bookingNeedSuggestions.askWholesalePrice'),
      tc('bookingNeedSuggestions.askRetailPrice'),
      tc('bookingNeedSuggestions.placeOrder'),
      tc('bookingNeedSuggestions.requestQuotation'),
      tc('bookingNeedSuggestions.productConsultation'),
      tc('bookingNeedSuggestions.wantToSeeSamples'),
      tc('bookingNeedSuggestions.needCatalogue'),
      tc('bookingNeedSuggestions.bulkImport'),
    ],
    [tc]
  );

  const bookingNoteSuggestions = useMemo(
    () => [
      tc('bookingNoteSuggestions.callBackBusinessHours'),
      tc('bookingNoteSuggestions.preferZalo'),
      tc('bookingNoteSuggestions.wantQuotationFirst'),
      tc('bookingNoteSuggestions.consideringWholesale'),
      tc('bookingNoteSuggestions.wantProductImages'),
      tc('bookingNoteSuggestions.needInvoice'),
      tc('bookingNoteSuggestions.followUpLater'),
    ],
    [tc]
  );

  const renderEventContent = (arg: EventContentArg) => {
    const status = arg.event.extendedProps.status as BookingStatus;
    const serviceName = arg.event.extendedProps.serviceName as string;

    return (
      <div className={`${styles.eventCard} ${styles[`event_${status}`]}`}>
        <div className={styles.eventContent}>
          <div className={styles.eventTitle}>{serviceName}</div>
          <div className={styles.eventSub}>{arg.timeText}</div>
        </div>
      </div>
    );
  };

  const handleApplySuggestion = (
    field: 'serviceName' | 'note',
    value: string
  ) => {
    setCreateForm((prev) => {
      const currentValue = prev[field].trim();

      if (!currentValue) {
        return {
          ...prev,
          [field]: value,
        };
      }

      if (field === 'note') {
        const hasValue = currentValue
          .toLowerCase()
          .includes(value.toLowerCase());

        return {
          ...prev,
          [field]: hasValue ? prev[field] : `${prev[field].trim()}\n${value}`,
        };
      }

      return {
        ...prev,
        [field]: value,
      };
    });
  };

  return (
    <div className={styles.pageShell}>
      <div className={styles.appFrame}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarBlock}>
            <div className={styles.sidebarMonthHeader}>
              <span className={styles.monthTitle}>
                {miniCalendarDate.toLocaleDateString(currentLocale, {
                  month: 'long',
                  year: 'numeric',
                })}
              </span>

              <div className={styles.inlineActions}>
                <button type="button" onClick={handleMiniPrevMonth}>
                  <i className="bi bi-chevron-left" />
                </button>
                <button type="button" onClick={handleMiniNextMonth}>
                  <i className="bi bi-chevron-right" />
                </button>
              </div>
            </div>

            <div className={styles.miniCalendar}>
              <div className={styles.miniWeekdays}>
                {[
                  tc('weekdays.sun'),
                  tc('weekdays.mon'),
                  tc('weekdays.tue'),
                  tc('weekdays.wed'),
                  tc('weekdays.thu'),
                  tc('weekdays.fri'),
                  tc('weekdays.sat'),
                ].map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>

              <div className={styles.miniGrid}>
                {miniCalendar.flat().map((day, index) => (
                  <button
                    key={`${day}-${index}`}
                    type="button"
                    onClick={() => handleMiniDayClick(day)}
                    disabled={day === null}
                    className={`${styles.miniDay} ${
                      day === selectedMiniDay ? styles.miniDayActive : ''
                    }`}
                  >
                    {day ?? ''}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.sidebarBlock}>
            <div className={styles.sidebarTitle}>{tc('sidebar.nearestBookings')}</div>

            <div className={styles.bookingQuickList}>
              {nearestBookings.length > 0 ? (
                nearestBookings.map((booking) => {
                  const isUpcoming =
                    new Date(booking.start).getTime() >= Date.now();
                  const isActive = selectedBookingId === booking.id;

                  return (
                    <button
                      key={booking.id}
                      type="button"
                      className={`${styles.bookingQuickItem} ${
                        isActive ? styles.bookingQuickItemActive : ''
                      }`}
                      onClick={() => setSelectedBookingId(booking.id)}
                    >
                      <div className={styles.bookingQuickTop}>
                        <div className={styles.bookingQuickName}>
                          {booking.customerName}
                        </div>

                        <span
                          className={`${styles.bookingQuickStatus} ${
                            isUpcoming
                              ? styles.bookingQuickStatusUpcoming
                              : styles.bookingQuickStatusRecent
                          }`}
                        >
                          {isUpcoming ? tc('labels.upcoming') : tc('labels.recent')}
                        </span>
                      </div>

                      <div className={styles.bookingQuickService}>
                        {booking.serviceName}
                      </div>

                      <div className={styles.bookingQuickMeta}>
                        <span>{formatSidebarBookingDate(booking.start, currentLocale)}</span>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className={styles.emptyItem}>{tc('empty.noBookingsYet')}</div>
              )}
            </div>
          </div>

          <div className={styles.sidebarBlock}>
            <div className={styles.sidebarTitle}>{tc('sidebar.todayOverview')}</div>

            <div className={styles.summaryGrid}>
              <div className={`${styles.summaryCard} ${styles.summaryCardHighlight}`}>
                <div className={styles.summaryLabel}>{tc('summary.totalBookings')}</div>
                <div className={styles.summaryValue}>{todayCounts.total}</div>
              </div>

              <div className={`${styles.summaryCard} ${styles.summaryCardPending}`}>
                <div className={styles.summaryLabel}>{tc('status.pending')}</div>
                <div className={styles.summaryValue}>{todayCounts.pending}</div>
              </div>

              <div className={styles.summaryCard}>
                <div className={styles.summaryLabel}>{tc('status.confirmed')}</div>
                <div className={styles.summaryValue}>{todayCounts.confirmed}</div>
              </div>

              <div className={styles.summaryCard}>
                <div className={styles.summaryLabel}>{tc('status.inService')}</div>
                <div className={styles.summaryValue}>{todayCounts.in_service}</div>
              </div>

              <div className={`${styles.summaryCard} ${styles.summaryCardDone}`}>
                <div className={styles.summaryLabel}>{tc('status.completed')}</div>
                <div className={styles.summaryValue}>{todayCounts.completed}</div>
              </div>

              <div className={`${styles.summaryCard} ${styles.summaryCardCancel}`}>
                <div className={styles.summaryLabel}>{tc('status.cancelled')}</div>
                <div className={styles.summaryValue}>{todayCounts.cancelled}</div>
              </div>
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
              <button type="button" className={styles.todayBtn} onClick={handleToday}>
                {tc('actions.today')}
              </button>

              <div className={styles.viewTabs}>
                <button
                  type="button"
                  className={`${styles.viewTab} ${
                    currentView === 'timeGridDay' ? styles.viewTabActive : ''
                  }`}
                  onClick={() => handleChangeView('timeGridDay')}
                >
                  {tc('views.day')}
                </button>

                <button
                  type="button"
                  className={`${styles.viewTab} ${
                    currentView === 'dayGridWeek' ? styles.viewTabActive : ''
                  }`}
                  onClick={() => handleChangeView('dayGridWeek')}
                >
                  {tc('views.week')}
                </button>

                <button
                  type="button"
                  className={`${styles.viewTab} ${
                    currentView === 'dayGridMonth' ? styles.viewTabActive : ''
                  }`}
                  onClick={() => handleChangeView('dayGridMonth')}
                >
                  {tc('views.month')}
                </button>
              </div>
            </div>

            <div className={styles.topbarRight}>
              <label className={styles.searchBox}>
                <i className="bi bi-search" />
                <input
                  type="text"
                  placeholder={tc('search.placeholder')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>

              <button
                type="button"
                className={styles.todayBtn}
                onClick={() => void loadBookings()}
              >
                {tc('actions.reload')}
              </button>
            </div>
          </header>

          <div className={styles.contentGrid}>
            <div className={styles.calendarSurface}>
              <div className={styles.calendarToolbarInfo}>
                <div>
                  <span className={styles.timezone}>{tc('labels.localTime')}</span>
                </div>

                <div>
                  <button
                    type="button"
                    className={styles.dayOffChip}
                    onClick={() => void loadBookings()}
                  >
                    {tc('actions.refreshData')}
                  </button>
                </div>
              </div>

              <div className={styles.calendarWrap}>
                <FullCalendar
                  ref={calendarRef}
                  plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
                  initialView="dayGridWeek"
                  initialDate={initialDateRef.current}
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
                    setCalendarTitle(
                      formatCalendarTitle(arg.start, nextView, currentLocale)
                    );
                    setMiniCalendarDate(arg.start);
                    setSelectedMiniDay(arg.start.getDate());
                  }}
                  eventContent={renderEventContent}
                />
              </div>
            </div>

            <aside className={styles.rightPanel}>
              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <div>
                    <div className={styles.cardTitle}>{tc('details.title')}</div>
                    <div className={styles.cardSub}>
                      {loading ? tc('loading.loadingData') : tc('details.subtitle')}
                    </div>
                  </div>

                  {selectedBooking ? (
                    <span
                      className={`${styles.statusPill} ${
                        styles[`pill_${selectedBooking.status}`]
                      }`}
                    >
                      {getStatusLabel(selectedBooking.status)}
                    </span>
                  ) : null}
                </div>

                {error ? <div className={styles.emptyState}>{error}</div> : null}

                {!error && loading ? (
                  <div className={styles.emptyState}>{tc('loading.loadingBookings')}</div>
                ) : null}

                {!error && !loading && !selectedBooking ? (
                  <div className={styles.emptyState}>{tc('empty.noBookingSelected')}</div>
                ) : null}

                {!error && !loading && selectedBooking ? (
                  <div className={styles.detailList}>
                    <div className={styles.detailRow}>
                      <span>{tc('details.customer')}</span>
                      <strong>{selectedBooking.customerName}</strong>
                    </div>

                    <div className={styles.detailRow}>
                      <span>{tc('details.phone')}</span>
                      <strong>{selectedBooking.customerPhone}</strong>
                    </div>

                    <div className={styles.detailRow}>
                      <span>{tc('details.service')}</span>
                      <strong>{selectedBooking.serviceName}</strong>
                    </div>

                    <div className={styles.detailRow}>
                      <span>{tc('details.time')}</span>
                      <strong>
                        {formatTime(selectedBooking.start, currentLocale)} -{' '}
                        {formatTime(selectedBooking.end, currentLocale)}
                      </strong>
                    </div>

                    <div className={styles.detailRow}>
                      <span>{tc('details.source')}</span>
                      <strong>{getSourceLabel(selectedBooking.source)}</strong>
                    </div>

                    <div className={styles.detailRow}>
                      <span>{tc('details.createdAt')}</span>
                      <strong>{formatDateTime(selectedBooking.createdAt, currentLocale)}</strong>
                    </div>

                    <div className={styles.detailRow}>
                      <span>{tc('details.updatedAt')}</span>
                      <strong>{formatDateTime(selectedBooking.updatedAt, currentLocale)}</strong>
                    </div>

                    <div className={styles.detailNote}>
                      <span>{tc('details.note')}</span>
                      <p>{selectedBooking.note || tc('empty.noNotes')}</p>
                    </div>

                    <div className={styles.actionRow}>
                      <button
                        type="button"
                        className={styles.primaryBtn}
                        onClick={() => void handleUpdateStatus('confirmed')}
                        disabled={actionLoading}
                      >
                        {actionLoading ? tc('loading.updating') : tc('actions.confirm')}
                      </button>

                      <button
                        type="button"
                        className={styles.secondaryBtn}
                        onClick={() => void handleUpdateStatus('completed')}
                        disabled={actionLoading}
                      >
                        {tc('actions.complete')}
                      </button>

                      <button
                        type="button"
                        className={styles.secondaryBtn}
                        onClick={() => void handleDeleteBooking()}
                        disabled={actionLoading}
                      >
                        {tc('actions.delete')}
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </aside>
          </div>
        </section>
      </div>

      {isCreateModalOpen ? (
        <div className={styles.bookingModalOverlay} onClick={handleCloseCreateModal}>
          <div
            className={styles.bookingModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.bookingModalHeader}>
              <div>
                <h3 className={styles.bookingModalTitle}>{tc('modal.createTitle')}</h3>
                <p className={styles.bookingModalSubtitle}>
                  {tc('modal.createSubtitle')}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseCreateModal}
                className={styles.bookingModalClose}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className={styles.bookingForm}>
              <div className={styles.bookingFormGrid}>
                <div className={styles.bookingField}>
                  <label className={styles.bookingLabel}>{tc('form.customerName')}</label>
                  <input
                    type="text"
                    value={createForm.customerName}
                    onChange={(e) =>
                      handleCreateFormChange('customerName', e.target.value)
                    }
                    placeholder={tc('form.placeholders.customerName')}
                    required
                    className={styles.bookingInput}
                  />
                </div>

                <div className={styles.bookingField}>
                  <label className={styles.bookingLabel}>{tc('form.customerPhone')}</label>
                  <input
                    type="text"
                    value={createForm.customerPhone}
                    onChange={(e) =>
                      handleCreateFormChange('customerPhone', e.target.value)
                    }
                    placeholder={tc('form.placeholders.customerPhone')}
                    required
                    className={styles.bookingInput}
                  />
                </div>

                <div className={`${styles.bookingField} ${styles.bookingFieldFull}`}>
                  <label className={styles.bookingLabel}>{tc('form.serviceName')}</label>
                  <input
                    type="text"
                    value={createForm.serviceName}
                    onChange={(e) =>
                      handleCreateFormChange('serviceName', e.target.value)
                    }
                    placeholder={tc('form.placeholders.serviceName')}
                    required
                    className={styles.bookingInput}
                  />

                  <div className={styles.suggestionWrap}>
                    {bookingNeedSuggestions.map((item) => (
                      <button
                        key={item}
                        type="button"
                        className={styles.suggestionChip}
                        onClick={() => handleApplySuggestion('serviceName', item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.bookingField}>
                  <label className={styles.bookingLabel}>{tc('form.start')}</label>
                  <input
                    type="datetime-local"
                    value={toDateTimeLocalValue(createForm.start)}
                    onChange={(e) =>
                      handleCreateFormChange(
                        'start',
                        fromDateTimeLocalValue(e.target.value)
                      )
                    }
                    required
                    className={styles.bookingInput}
                  />
                </div>

                <div className={styles.bookingField}>
                  <label className={styles.bookingLabel}>{tc('form.end')}</label>
                  <input
                    type="datetime-local"
                    value={toDateTimeLocalValue(createForm.end)}
                    onChange={(e) =>
                      handleCreateFormChange(
                        'end',
                        fromDateTimeLocalValue(e.target.value)
                      )
                    }
                    required
                    className={styles.bookingInput}
                  />
                </div>

                <div className={styles.bookingField}>
                  <label className={styles.bookingLabel}>{tc('form.source')}</label>
                  <select
                    value={createForm.source}
                    onChange={(e) =>
                      handleCreateFormChange(
                        'source',
                        e.target.value as BookingSource
                      )
                    }
                    className={styles.bookingInput}
                  >
                    <option value="website">{tc('source.website')}</option>
                    <option value="facebook">{tc('source.facebook')}</option>
                    <option value="zalo">{tc('source.zalo')}</option>
                    <option value="phone">{tc('source.phone')}</option>
                    <option value="walk_in">{tc('source.walkIn')}</option>
                  </select>
                </div>

                <div className={`${styles.bookingField} ${styles.bookingFieldFull}`}>
                  <label className={styles.bookingLabel}>{tc('form.note')}</label>
                  <textarea
                    value={createForm.note}
                    onChange={(e) =>
                      handleCreateFormChange('note', e.target.value)
                    }
                    placeholder={tc('form.placeholders.note')}
                    rows={4}
                    className={`${styles.bookingInput} ${styles.bookingTextarea}`}
                  />

                  <div className={styles.suggestionWrap}>
                    {bookingNoteSuggestions.map((item) => (
                      <button
                        key={item}
                        type="button"
                        className={styles.suggestionChipSecondary}
                        onClick={() => handleApplySuggestion('note', item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className={styles.bookingFormActions}>
                <button
                  type="button"
                  onClick={handleCloseCreateModal}
                  className={styles.bookingCancelBtn}
                >
                  {tc('actions.cancel')}
                </button>

                <button
                  type="submit"
                  disabled={createLoading}
                  className={styles.bookingSubmitBtn}
                >
                  {createLoading ? tc('loading.creating') : tc('actions.createBooking')}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
