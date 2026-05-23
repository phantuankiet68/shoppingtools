"use client";

import styles from "@/styles/admin/orders/invoice.module.css";

import PrintButton from "@/components/admin/orders/PrintButton";

import { useAdminI18n } from "@/components/admin/providers/AdminI18nProvider";

import Image from "next/image";
import Link from "next/link";

type OrderItem = {
  id: string;
  imageSnapshot: string | null;
  productNameSnapshot: string;
  qty: number;
  totalCents: number;
};

type Order = {
  orderNumber: string;
  paymentStatus: string;
  createdAt: Date;
  totalCents: number;
  customerNameSnapshot: string | null;
  customerPhoneSnapshot: string | null;
  items: OrderItem[];
};

type Props = {
  order: Order;
};

export default function InvoiceClient({ order }: Props) {
  const { t } = useAdminI18n();

  return (
    <div className={styles.wrapper}>
      <div className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <div className={styles.invoiceTitleRow}>
            <div className={styles.headerBadge}>
              <i className="bi bi-bag-check-fill" />
              Invoice #{order.orderNumber}
            </div>

            <span
              className={`${styles.statusBadge} ${
                order.paymentStatus === "PAID" ? styles.successBadge : styles.warningBadge
              }`}
            >
              {order.paymentStatus}
            </span>

            <p className={styles.invoiceDate}>
              {t("invoice.paidOn")} {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className={styles.topbarRight}>
          <Link href="/admin/orders" className={styles.backBtn}>
            <i className="bi bi-arrow-left" />
            {t("invoice.back")}
          </Link>

          <PrintButton />
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.left}>
          <div className={styles.invoiceCard}>
            <div className={styles.shopHero}>
              {/* LEFT CARD */}

              <div className={styles.companyCard}>
                <div className={styles.companyTop}>
                  <div className={styles.logo}>
                    <i className="bi bi-shop" />
                  </div>

                  <div className={styles.companyInfo}>
                    <div className={styles.companyHeader}>
                      <h2>SHOP NAME</h2>

                      <span className={styles.activeBadge}>{t("invoice.active")}</span>
                    </div>

                    <div className={styles.companyList}>
                      <div>
                        <i className="bi bi-geo-alt-fill" />

                        <span>123 Shopping Street, Ha Noi, Viet Nam</span>
                      </div>

                      <div>
                        <i className="bi bi-telephone-fill" />

                        <span>0123456789</span>
                      </div>

                      <div>
                        <i className="bi bi-envelope-fill" />

                        <span>shop@email.com</span>
                      </div>

                      <div>
                        <i className="bi bi-receipt-cutoff" />

                        <span>TAX: 123-456-789</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT CARD */}

              <div className={styles.amountCard}>
                <div className={styles.invoiceCode}>
                  <i className="bi bi-hash" />

                  {order.orderNumber}
                </div>

                <div className={styles.amountContent}>
                  <span>{t("invoice.totalAmount")}</span>

                  <h1>${(order.totalCents / 100).toLocaleString()}</h1>
                </div>

                <div className={styles.amountFooter}>
                  <div>
                    <small>{t("invoice.status")}</small>

                    <strong>{order.paymentStatus}</strong>
                  </div>

                  <div>
                    <small>{t("invoice.date")}</small>

                    <strong>{new Date(order.createdAt).toLocaleDateString()}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.infoCards}>
              {/* LEFT CARD */}

              <div className={styles.invoiceInfoCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardIcon}>
                    <i className="bi bi-receipt" />
                  </div>

                  <div>
                    <h3>{t("invoice.invoiceDetails")}</h3>

                    <p>{t("invoice.paymentBillingInfo")}</p>
                  </div>
                </div>

                <div className={styles.invoiceMeta}>
                  <div className={styles.metaItem}>
                    <span>{t("invoice.invoiceDate")}</span>

                    <strong>{new Date(order.createdAt).toLocaleDateString()}</strong>
                  </div>

                  <div className={styles.metaItem}>
                    <span>{t("invoice.paymentMethod")}</span>

                    <strong>
                      <i className="bi bi-bank" />
                      {t("invoice.bankTransfer")}
                    </strong>
                  </div>

                  <div className={styles.metaItem}>
                    <span>{t("invoice.paymentStatus")}</span>

                    <div
                      className={`${styles.statusPill} ${order.paymentStatus === "PAID" ? styles.paid : styles.unpaid}`}
                    >
                      <i className="bi bi-check-circle-fill" />

                      {order.paymentStatus}
                    </div>
                  </div>
                </div>
              </div>

              {/* CUSTOMER */}

              <div className={styles.customerCard}>
                <div className={styles.customerProfile}>
                  <div className={styles.customerAvatar}>{order.customerNameSnapshot?.charAt(0)}</div>

                  <div>
                    <h4>{order.customerNameSnapshot}</h4>

                    <span>
                      <i className="bi bi-geo-alt-fill" />
                      123 Le Loi Street, Ho Chi Minh City, Viet Nam
                    </span>
                  </div>
                </div>

                <div className={styles.customerList}>
                  <div>
                    <i className="bi bi-telephone-fill" />

                    <span>{order.customerPhoneSnapshot}</span>
                  </div>

                  <div>
                    <i className="bi bi-envelope-fill" />

                    <span>customer@email.com</span>
                  </div>
                </div>
              </div>
            </div>

            {/* TABLE */}

            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{t("invoice.article")}</th>
                    <th>{t("invoice.quantity")}</th>
                    <th>{t("invoice.unitPrice")}</th>
                    <th>{t("invoice.finalAmount")}</th>
                  </tr>
                </thead>

                <tbody>
                  {order.items.map((item, index) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td>

                      <td>
                        <div className={styles.productCell}>
                          <Image
                            className={styles.productImage}
                            src={item.imageSnapshot || "/no-image.png"}
                            alt={item.productNameSnapshot}
                            width={36}
                            height={36}
                          />

                          <div>
                            <strong>{item.productNameSnapshot}</strong>

                            <p>{t("invoice.productDescription")}</p>
                          </div>
                        </div>
                      </td>

                      <td>{item.qty}</td>

                      <td>${(item.totalCents / item.qty / 100).toLocaleString()}</td>

                      <td>${(item.totalCents / 100).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* TOTAL */}

            <div className={styles.totalSection}>
              <div className={styles.totalRow}>
                <span>{t("invoice.totalHT")}</span>

                <strong>${(order.totalCents / 100).toLocaleString()}</strong>
              </div>

              <div className={styles.totalRow}>
                <span>{t("invoice.shippingFee")}</span>

                <strong>$0</strong>
              </div>

              <div className={styles.totalRow}>
                <span>{t("invoice.vat")}</span>

                <strong>$0</strong>
              </div>

              <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                <span>{t("invoice.totalPrice")}</span>

                <strong>${(order.totalCents / 100).toLocaleString()}</strong>
              </div>
            </div>

            {/* FOOTER */}

            <div className={styles.invoiceFooter}>
              <div className={styles.termsCard}>
                <div className={styles.footerHeader}>
                  <div className={styles.footerIcon}>
                    <i className="bi bi-shield-check" />
                  </div>

                  <div>
                    <h4>{t("invoice.termsConditions")}</h4>

                    <p>{t("invoice.paymentInvoicePolicy")}</p>
                  </div>
                </div>

                <div className={styles.termsContent}>
                  <p>{t("invoice.thankYou")}</p>

                  <p>{t("invoice.invoiceQuestion")}</p>
                </div>
              </div>

              <div className={styles.supportCard}>
                <div className={styles.supportTop}>
                  <div className={styles.supportAvatar}>
                    <i className="bi bi-headset" />
                  </div>

                  <div>
                    <h4>{t("invoice.needHelp")}</h4>

                    <p>{t("invoice.contactSupportCenter")}</p>
                  </div>
                </div>

                <div className={styles.supportList}>
                  <div>
                    <i className="bi bi-envelope-fill" />

                    <span>support@shop.com</span>
                  </div>

                  <div>
                    <i className="bi bi-telephone-fill" />

                    <span>+84 123 456 789</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}

        <div className={styles.right}>
          <div className={styles.warningCard}>
            <div className={styles.warningTop}>
              <span className={styles.warningDot} />

              {t("invoice.late")}
            </div>

            <p>{t("invoice.overdueInvoice")}</p>
          </div>

          <div className={styles.actionsCard}>
            <div className={styles.actionsHeader}>
              <div className={styles.actionsIcon}>
                <i className="bi bi-lightning-charge-fill" />
              </div>

              <div>
                <h3>{t("invoice.invoiceActions")}</h3>

                <p>{t("invoice.manageInvoiceActions")}</p>
              </div>
            </div>

            <div className={styles.actionsList}>
              <button className={`${styles.actionButton} ${styles.primaryAction}`}>
                <div className={styles.actionLeft}>
                  <div className={styles.actionCircle}>
                    <i className="bi bi-send-fill" />
                  </div>

                  <div>
                    <strong>{t("invoice.sendInvoice")}</strong>
                  </div>
                </div>

                <i className="bi bi-arrow-right" />
              </button>

              <button className={`${styles.actionButton} ${styles.secondaryAction}`}>
                <div className={styles.actionLeft}>
                  <div className={styles.actionCircle}>
                    <i className="bi bi-download" />
                  </div>

                  <div>
                    <strong>{t("invoice.downloadPDF")}</strong>
                  </div>
                </div>

                <i className="bi bi-arrow-right" />
              </button>

              <button className={`${styles.actionButton} ${styles.secondaryAction}`}>
                <div className={styles.actionLeft}>
                  <div className={styles.actionCircle}>
                    <i className="bi bi-printer-fill" />
                  </div>

                  <div>
                    <strong>{t("invoice.printInvoice")}</strong>
                  </div>
                </div>

                <i className="bi bi-arrow-right" />
              </button>
            </div>
          </div>

          <div className={styles.summaryCard}>
            <div className={styles.summaryHeader}>
              <div className={styles.summaryIcon}>
                <i className="bi bi-wallet2" />
              </div>

              <div>
                <h3>{t("invoice.paymentSummary")}</h3>

                <p>{t("invoice.invoiceFinancialOverview")}</p>
              </div>
            </div>

            <div className={styles.summaryBody}>
              <div className={styles.summaryItem}>
                <div className={styles.summaryLeft}>
                  <div className={styles.summaryCircle}>
                    <i className="bi bi-cart-check" />
                  </div>

                  <span>{t("invoice.subtotal")}</span>
                </div>

                <strong>${(order.totalCents / 100).toLocaleString()}</strong>
              </div>

              <div className={styles.summaryItem}>
                <div className={styles.summaryLeft}>
                  <div className={styles.summaryCircle}>
                    <i className="bi bi-truck" />
                  </div>

                  <span>{t("invoice.shippingFee")}</span>
                </div>

                <strong>$0</strong>
              </div>

              <div className={styles.summaryItem}>
                <div className={styles.summaryLeft}>
                  <div className={styles.summaryCircle}>
                    <i className="bi bi-percent" />
                  </div>

                  <span>{t("invoice.tax")}</span>
                </div>

                <strong>$0</strong>
              </div>

              <div className={styles.summaryTotalBox}>
                <div>
                  <span>{t("invoice.totalAmount")}</span>

                  <h2>${(order.totalCents / 100).toLocaleString()}</h2>
                </div>

                <div className={styles.totalBadge}>
                  <i className="bi bi-check-circle-fill" />

                  {t("invoice.completed")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
