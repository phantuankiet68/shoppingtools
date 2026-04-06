'use client';

import { useState } from 'react';
import styles from '@/styles/admin/settings/page.module.css';
import SectionHeader from '@/components/admin/settings/SectionHeader';
import { billingHistory } from '@/features/settings/billing';
import { BillingItem } from '@/features/settings/type';

function StatusBadge({ status }: { status: BillingItem['status'] }) {
  const cls =
    status === 'Pending'
      ? styles.badgePending
      : status === 'Cancelled'
        ? styles.badgeCancelled
        : styles.badgeRefund;

  return <span className={`${styles.badge} ${cls}`}>{status}</span>;
}

export default function BillingsTab() {
  const [contactMode, setContactMode] = useState<'existing' | 'new'>('existing');

  return (
    <div className={styles.panelBody}>
      <section className={styles.sectionBlock}>
        <SectionHeader
          title="Payment Method"
          description="Update your billing details and address."
        />
      </section>

      <section className={styles.sectionBlock}>
        <div className={styles.sectionSplit}>
          <div>
            <SectionHeader
              title="Card Details"
              description="Update your billing details and address."
            />
            <button className={styles.secondaryBtn} type="button">
              <i className="bi bi-plus-lg" />
              Add another card
            </button>
          </div>

          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span>Name on your Card</span>
              <input defaultValue="Mayad Ahmed" />
            </label>

            <label className={styles.field}>
              <span>Expiry</span>
              <input defaultValue="02 / 2028" />
            </label>

            <label className={`${styles.field} ${styles.fieldWide}`}>
              <span>Card Number</span>
              <div className={styles.inputWithIcon}>
                <i className="bi bi-credit-card-2-front" />
                <input defaultValue="8269 9620 9292 2538" />
              </div>
            </label>

            <label className={styles.field}>
              <span>CVV</span>
              <input defaultValue="••••" />
            </label>
          </div>
        </div>
      </section>

      <section className={styles.sectionBlock}>
        <div className={styles.sectionSplit}>
          <SectionHeader
            title="Contact email"
            description="Where should invoices be sent?"
          />

          <div className={styles.radioGroup}>
            <label className={styles.radioCard}>
              <input
                type="radio"
                checked={contactMode === 'existing'}
                onChange={() => setContactMode('existing')}
              />
              <div>
                <strong>Send to the existing email</strong>
                <span>mayadahmed@ofspace.co</span>
              </div>
            </label>

            <label className={styles.radioCard}>
              <input
                type="radio"
                checked={contactMode === 'new'}
                onChange={() => setContactMode('new')}
              />
              <div>
                <strong>Add another email address</strong>
              </div>
            </label>

            {contactMode === 'new' ? (
              <div className={styles.inlineForm}>
                <label className={styles.field}>
                  <span>Billing email</span>
                  <input placeholder="billing@company.com" />
                </label>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className={styles.sectionBlock}>
        <SectionHeader
          title="Billing History"
          description="See the transaction you made"
        />

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>
                  <input type="checkbox" />
                </th>
                <th>Invoice</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Tracking & Address</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {billingHistory.map((item) => (
                <tr key={item.id}>
                  <td>
                    <input type="checkbox" />
                  </td>
                  <td>{item.invoice}</td>
                  <td>{item.date}</td>
                  <td>{item.amount}</td>
                  <td>
                    <StatusBadge status={item.status} />
                  </td>
                  <td>
                    <div className={styles.trackingCell}>
                      <a href="#">{item.tracking}</a>
                      <span>{item.address}</span>
                    </div>
                  </td>
                  <td>
                    <button className={styles.iconBtn} type="button" aria-label="More">
                      <i className="bi bi-three-dots-vertical" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}