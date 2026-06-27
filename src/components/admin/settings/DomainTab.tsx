'use client';

import styles from '@/styles/admin/settings/domain.module.css';
import { Globe, Server, Copy } from 'lucide-react';
import type { SettingTabProps } from '@/features/settings/types';

export default function DomainTab({ className }: SettingTabProps) {
    return (
        <div className={`${styles.wrapper} ${className ?? ''}`}>
            <div className={styles.header}>
                <div className={styles.icon}>
                    <Globe size={22} />
                </div>

                <div>
                    <h2 className={styles.title}>Domain Settings</h2>

                    <p className={styles.description}>
                        Connect your own domain and configure DNS records to point to your server.
                    </p>
                </div>
            </div>
            <div className={styles.card}>
                <div className={styles.guideHeader}>
                    <div className={styles.guideIcon}>
                        <i className="bi bi-compass"></i>
                    </div>

                    <div className={styles.guideInfo}>
                        <h3>Configuration Guide</h3>

                        <p>Follow these steps to connect your custom domain to this server.</p>
                    </div>
                </div>

                {/* STEP 1 */}

                <div className={styles.guideItem}>
                    <div className={styles.stepIcon}>
                        <i className="bi bi-person-circle"></i>
                    </div>

                    <div className={styles.stepContent}>
                        <h4>Login to your DNS Provider</h4>

                        <p>Login to the control panel where your domain DNS is managed.</p>
                    </div>
                </div>

                {/* STEP 2 */}

                <div className={styles.guideItem}>
                    <div className={styles.stepIcon}>
                        <i className="bi bi-hdd-network"></i>
                    </div>

                    <div className={styles.stepContent}>
                        <h4>Create Root A Record</h4>

                        <p>Add the following A record to your DNS provider.</p>

                        <div className={styles.recordTable}>
                            <div>Host</div>
                            <div>Type</div>
                            <div>Value</div>
                            <div>TTL</div>

                            <strong>@</strong>
                            <span>A</span>
                            <code>123.123.123.123</code>
                            <span>Auto</span>
                        </div>
                    </div>
                </div>

                {/* STEP 3 */}

                <div className={styles.guideItem}>
                    <div className={styles.stepIcon}>
                        <i className="bi bi-globe2"></i>
                    </div>

                    <div className={styles.stepContent}>
                        <h4>Create WWW Record</h4>

                        <p>Add the following CNAME record.</p>

                        <div className={styles.recordTable}>
                            <div>Host</div>
                            <div>Type</div>
                            <div>Target</div>
                            <div>TTL</div>

                            <strong>www</strong>
                            <span>CNAME</span>
                            <code>example.com</code>
                            <span>Auto</span>
                        </div>
                    </div>
                </div>

                {/* STEP 4 */}

                <div className={styles.guideItem}>
                    <div className={styles.stepIcon}>
                        <i className="bi bi-clock-history"></i>
                    </div>

                    <div className={styles.stepContent}>
                        <h4>Wait for DNS Propagation</h4>

                        <p>DNS changes normally propagate within 5–30 minutes.</p>
                    </div>

                    <div className={styles.timeCard}>
                        <div>
                            <small>Estimated</small>

                            <strong>5–30 mins</strong>
                        </div>

                        <div>
                            <small>Maximum</small>

                            <strong>24 Hours</strong>
                        </div>
                    </div>
                </div>

                {/* STEP 5 */}

                <div className={styles.guideItem}>
                    <div className={styles.stepIcon}>
                        <i className="bi bi-patch-check"></i>
                    </div>

                    <div className={styles.stepContent}>
                        <h4>Verify Domain</h4>

                        <p>
                            After DNS propagation is complete, verify your domain to start automatic
                            deployment.
                        </p>
                    </div>

                    <button className={styles.verifyButton}>
                        <i className="bi bi-shield-check"></i>
                        Verify Domain
                    </button>
                </div>

                {/* STEP 6 */}

                <div className={styles.guideItem}>
                    <div className={styles.stepIcon}>
                        <i className="bi bi-rocket-takeoff"></i>
                    </div>

                    <div className={styles.stepContent}>
                        <h4>Automatic Deployment</h4>

                        <p>
                            The platform will automatically configure your server after successful
                            verification.
                        </p>
                    </div>

                    <div className={styles.deployStatus}>
                        <div>
                            <i className="bi bi-check-circle-fill"></i>
                            Nginx Config
                        </div>

                        <div>
                            <i className="bi bi-check-circle-fill"></i>
                            SSL Certificate
                        </div>

                        <div>
                            <i className="bi bi-check-circle-fill"></i>
                            HTTPS Enabled
                        </div>
                    </div>
                </div>

                <div className={styles.tipBox}>
                    <i className="bi bi-lightbulb"></i>

                    <div>
                        <strong>Helpful Tips</strong>

                        <p>
                            Remove old DNS records before adding new ones. SSL certificates will be
                            generated automatically after successful verification.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
