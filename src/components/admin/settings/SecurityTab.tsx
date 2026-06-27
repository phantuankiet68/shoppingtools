'use client';

import { useState } from 'react';
import styles from '@/styles/admin/settings/security.module.css';
import { ShieldCheck } from 'lucide-react';
import type { SettingTabProps } from '@/features/settings/types';

export default function SecurityTab({ className }: SettingTabProps) {
    const [sessionTimeout, setSessionTimeout] = useState('30');
    return (
        <div className={`${styles.wrapper} ${className ?? ''}`}>
            <div className={styles.header}>
                <div className={styles.icon}>
                    <ShieldCheck size={22} />
                </div>

                <div>
                    <h2 className={styles.title}>Security Settings</h2>

                    <p className={styles.description}>
                        Manage security options to help protect your account.
                    </p>
                </div>
            </div>

            <div className={styles.sectionHeader}>
                <div>
                    <div className={styles.sectionHeading}>
                        <i className="bi bi-shield-exclamation"></i>
                        <h3 className={styles.sectionTitle}>Security Settings</h3>
                    </div>

                    <p className={styles.sectionDescription}>
                        Manage security options to help protect your account.
                    </p>
                </div>

                <span className={styles.badgeRed}>High Protection</span>
            </div>
            <div className={styles.card}>
                <div className={styles.setting}>
                    <div className={styles.settingLeft}>
                        <div className={`${styles.settingIcon} ${styles.blue}`}>
                            <i className="bi bi-shield-lock"></i>
                        </div>

                        <div className={styles.settingContent}>
                            <div className={styles.settingHeader}>
                                <h4 className={styles.settingTitle}>Two-Factor Authentication</h4>

                                <span className={styles.badgeGreen}>Recommended</span>
                            </div>

                            <p className={styles.settingDescription}>
                                Require an additional verification code before access is granted.
                            </p>

                            <span className={styles.settingInfo}>
                                Status :<strong> Disabled</strong>
                            </span>
                        </div>
                    </div>

                    <label className={styles.switch}>
                        <input type="checkbox" />
                        <span className={styles.slider}></span>
                    </label>
                </div>

                <div className={styles.setting}>
                    <div className={styles.settingLeft}>
                        <div className={`${styles.settingIcon} ${styles.orange}`}>
                            <i className="bi bi-laptop"></i>
                        </div>

                        <div className={styles.settingContent}>
                            <div className={styles.settingHeader}>
                                <h4 className={styles.settingTitle}>Trusted Devices</h4>

                                <span className={styles.badgeOrange}>Convenience</span>
                            </div>

                            <p className={styles.settingDescription}>
                                Skip additional verification on devices you have already trusted.
                            </p>

                            <span className={styles.settingInfo}>
                                Trusted Devices :<strong> 3</strong>
                            </span>
                        </div>
                    </div>

                    <label className={styles.switch}>
                        <input type="checkbox" defaultChecked />
                        <span className={styles.slider}></span>
                    </label>
                </div>

                <div className={styles.setting}>
                    <div className={styles.settingLeft}>
                        <div className={`${styles.settingIcon} ${styles.red}`}>
                            <i className="bi bi-person-lock"></i>
                        </div>

                        <div className={styles.settingContent}>
                            <div className={styles.settingHeader}>
                                <h4 className={styles.settingTitle}>Single Active Session</h4>

                                <span className={styles.badgeRed}>High Security</span>
                            </div>

                            <p className={styles.settingDescription}>
                                Automatically terminate previous sessions when signing in on another
                                device.
                            </p>

                            <span className={styles.settingInfo}>
                                Active Sessions :<strong> 2</strong>
                            </span>
                        </div>
                    </div>

                    <label className={styles.switch}>
                        <input type="checkbox" defaultChecked />
                        <span className={styles.slider}></span>
                    </label>
                </div>
            </div>
            <div className={styles.sectionHeader}>
                <div>
                    <div className={styles.sectionHeading}>
                        <i className="bi bi-key-fill"></i>
                        <h3 className={styles.sectionTitle}>Session & Token Security</h3>
                    </div>

                    <p className={styles.sectionDescription}>
                        Configure how authentication sessions, cookies and tokens are protected.
                    </p>
                </div>

                <span className={styles.badgeBlue}>Critical</span>
            </div>
            <div className={styles.card}>
                <div className={styles.setting}>
                    <div className={styles.settingLeft}>
                        <div className={`${styles.settingIcon} ${styles.blue}`}>
                            <i className="bi bi-cookie"></i>
                        </div>

                        <div>
                            <div className={styles.settingHeader}>
                                <h4 className={styles.settingTitle}>Strict Cookie Security</h4>

                                <span className={styles.badgeGreen}>Enabled</span>
                            </div>

                            <p className={styles.settingDescription}>
                                Force HttpOnly, Secure and SameSite cookies to reduce session
                                hijacking.
                            </p>

                            <span className={styles.settingInfo}>
                                HttpOnly • Secure • SameSite=Strict
                            </span>
                        </div>
                    </div>

                    <label className={styles.switch}>
                        <input type="checkbox" defaultChecked />
                        <span className={styles.slider}></span>
                    </label>
                </div>

                <div className={styles.setting}>
                    <div className={styles.settingLeft}>
                        <div className={`${styles.settingIcon} ${styles.purple}`}>
                            <i className="bi bi-arrow-repeat"></i>
                        </div>

                        <div>
                            <div className={styles.settingHeader}>
                                <h4 className={styles.settingTitle}>Rotate Refresh Tokens</h4>

                                <span className={styles.badgeBlueSmall}>Recommended</span>
                            </div>

                            <p className={styles.settingDescription}>
                                Automatically replace refresh tokens after every successful refresh.
                            </p>

                            <span className={styles.settingInfo}>Rotation: Every Request</span>
                        </div>
                    </div>

                    <label className={styles.switch}>
                        <input type="checkbox" defaultChecked />
                        <span className={styles.slider}></span>
                    </label>
                </div>

                <div className={styles.setting}>
                    <div className={styles.settingLeft}>
                        <div className={`${styles.settingIcon} ${styles.orange}`}>
                            <i className="bi bi-clock-history"></i>
                        </div>

                        <div>
                            <div className={styles.settingHeader}>
                                <h4 className={styles.settingTitle}>Session Timeout</h4>
                            </div>

                            <p className={styles.settingDescription}>
                                Automatically sign out inactive administrators.
                            </p>

                            <span className={styles.settingInfo}>Current Timeout : 30 Minutes</span>
                        </div>
                    </div>

                    <select
                        className={styles.select}
                        value={sessionTimeout}
                        onChange={(e) => setSessionTimeout(e.target.value)}
                    >
                        <option value="15">15 Minutes</option>
                        <option value="30">30 Minutes</option>
                        <option value="60">1 Hour</option>
                        <option value="120">2 Hours</option>
                        <option value="never">Never</option>
                    </select>
                </div>
            </div>
            <div className={styles.sectionHeader}>
                <div>
                    <div className={styles.sectionHeading}>
                        <i className="bi bi-shield-exclamation"></i>
                        <h3 className={styles.sectionTitle}>Threat Protection</h3>
                    </div>

                    <p className={styles.sectionDescription}>
                        Reduce common attacks and unauthorized inspection attempts.
                    </p>
                </div>

                <span className={styles.badgeRed}>High Protection</span>
            </div>
            <div className={styles.card}>
                <div className={styles.sectionHeader}>
                    <div>
                        <div className={styles.sectionHeading}>
                            <i className="bi bi-shield-exclamation"></i>
                            <h3 className={styles.sectionTitle}>Threat Protection</h3>
                        </div>

                        <p className={styles.sectionDescription}>
                            Reduce browser inspection, unauthorized interactions and common
                            client-side attacks.
                        </p>
                    </div>

                    <span className={styles.badgeRed}>HIGH PROTECTION</span>
                </div>

                <div className={styles.setting}>
                    <div className={styles.settingLeft}>
                        <div className={`${styles.settingIcon} ${styles.red}`}>
                            <i className="bi bi-code-slash"></i>
                        </div>

                        <div className={styles.settingContent}>
                            <div className={styles.settingHeader}>
                                <h4 className={styles.settingTitle}>Developer Tools Detection</h4>

                                <span className={styles.badgeBlueSmall}>Recommended</span>
                            </div>

                            <p className={styles.settingDescription}>
                                Detect when browser developer tools are opened and display a
                                security warning or temporarily restrict sensitive actions.
                            </p>

                            <span className={styles.settingInfo}>
                                Status :<strong> Monitoring Disabled</strong>
                            </span>
                        </div>
                    </div>

                    <label className={styles.switch}>
                        <input type="checkbox" />
                        <span className={styles.slider}></span>
                    </label>
                </div>

                <div className={styles.setting}>
                    <div className={styles.settingLeft}>
                        <div className={`${styles.settingIcon} ${styles.orange}`}>
                            <i className="bi bi-mouse"></i>
                        </div>

                        <div className={styles.settingContent}>
                            <div className={styles.settingHeader}>
                                <h4 className={styles.settingTitle}>Disable Right Click</h4>

                                <span className={styles.badgeOrange}>Optional</span>
                            </div>

                            <p className={styles.settingDescription}>
                                Prevent the browser context menu from opening to discourage copying
                                and inspection.
                            </p>

                            <span className={styles.settingInfo}>
                                Protection :<strong> Context Menu Blocked</strong>
                            </span>
                        </div>
                    </div>

                    <label className={styles.switch}>
                        <input type="checkbox" />
                        <span className={styles.slider}></span>
                    </label>
                </div>

                <div className={styles.setting}>
                    <div className={styles.settingLeft}>
                        <div className={`${styles.settingIcon} ${styles.purple}`}>
                            <i className="bi bi-type"></i>
                        </div>

                        <div className={styles.settingContent}>
                            <div className={styles.settingHeader}>
                                <h4 className={styles.settingTitle}>Disable Text Selection</h4>

                                <span className={styles.badgeBlueSmall}>Content Protection</span>
                            </div>

                            <p className={styles.settingDescription}>
                                Prevent visitors from selecting text on protected pages to reduce
                                casual copying.
                            </p>

                            <span className={styles.settingInfo}>
                                Coverage :<strong> Protected Pages Only</strong>
                            </span>
                        </div>
                    </div>

                    <label className={styles.switch}>
                        <input type="checkbox" />
                        <span className={styles.slider}></span>
                    </label>
                </div>
            </div>
        </div>
    );
}
