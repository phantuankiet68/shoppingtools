'use client';

import { useState } from 'react';
import styles from './date-strip.module.css';

type DateItem = {
    day: string;
    date: number;
};

const dates: DateItem[] = [
    { day: 'Th 2', date: 8 },
    { day: 'Th 3', date: 9 },
    { day: 'Th 4', date: 10 },
    { day: 'Th 5', date: 11 },
    { day: 'Th 6', date: 12 },
    { day: 'Th 7', date: 13 },
    { day: 'CN', date: 14 },
];

export default function DateStrip() {
    const [selectedDate, setSelectedDate] = useState(9);

    return (
        <div className={styles.dateStrip}>
            {dates.map((item) => {
                const isActive = selectedDate === item.date;

                return (
                    <button
                        key={`${item.day}-${item.date}`}
                        type="button"
                        className={`${styles.dateItem} ${isActive ? styles.active : ''}`}
                        onClick={() => setSelectedDate(item.date)}
                        aria-label={`${item.day}, ngày ${item.date}`}
                        aria-pressed={isActive}
                    >
                        <span className={styles.day}>{item.day}</span>
                        <strong className={styles.date}>{item.date}</strong>
                    </button>
                );
            })}

            <button type="button" className={styles.nextButton} aria-label="Ngày tiếp theo">
                <i className="bi bi-chevron-right" aria-hidden="true" />
            </button>
        </div>
    );
}
