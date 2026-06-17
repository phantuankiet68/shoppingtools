import { useCallback, useEffect, useState } from 'react';

import { FormErrors, SiteFormMode, SiteFormState, SiteLike } from '@/features/sites/types';

import { useAdminI18n } from '@/components/admin/providers/AdminI18nProvider';
import { WEBSITE_CATEGORIES } from '@/constants/sites/siteConstants';
import { buildSiteForm, normalizeDomain } from '@/utils/sites/siteHelpers';

import {
    validateDomain,
    validateEmail,
    validatePhone,
    validateSeoDescription,
    validateSeoTitle,
    validateSiteName,
    validateWebsiteType,
} from '@/utils/sites/siteValidation';

type UseSiteFormProps = {
    active?: SiteLike | null;

    mode: SiteFormMode;

    t: (key: string) => string;

    onCreate: (payload: SiteFormState) => Promise<void>;

    onSave: (payload: SiteFormState) => Promise<void>;
};

export function useSiteForm({ active, mode, t, onCreate, onSave }: UseSiteFormProps) {
    const [form, setForm] = useState<SiteFormState>(() => buildSiteForm(active));

    const [errors, setErrors] = useState<FormErrors>({});

    const { tf } = useAdminI18n();

    useEffect(() => {
        setForm(buildSiteForm(active));

        setErrors({});
    }, [active, mode]);

    const updateField = useCallback(
        <K extends keyof SiteFormState>(key: K, value: SiteFormState[K]) => {
            setForm((prev) => {
                if (key === 'type') {
                    const type = value as SiteFormState['type'];

                    const categories = WEBSITE_CATEGORIES[type] || [];
                    const category = categories[0] ?? '';

                    return {
                        ...prev,
                        type,
                        category,

                        seoTitle: tf(`sites.seo.${type}.title`, {
                            name: prev.name,
                            category,
                        }),

                        seoDescription: tf(`sites.seo.${type}.description`, {
                            name: prev.name,
                            category,
                        }),
                    };
                }
                if (key === 'category') {
                    const category = value as string;

                    return {
                        ...prev,
                        category,

                        seoTitle: tf(`sites.seo.${prev.type}.title`, {
                            name: prev.name,
                            category,
                        }),

                        seoDescription: tf(`sites.seo.${prev.type}.description`, {
                            name: prev.name,
                            category,
                        }),
                    };
                }
                if (key === 'name') {
                    const name = value as string;

                    return {
                        ...prev,
                        name,

                        seoTitle: tf(`sites.seo.${prev.type}.title`, {
                            name,
                            category: prev.category,
                        }),

                        seoDescription: tf(`sites.seo.${prev.type}.description`, {
                            name,
                            category: prev.category,
                        }),
                    };
                }

                return {
                    ...prev,
                    [key]: value,
                };
            });

            setErrors((prev) => ({
                ...prev,
                [key]: '',
            }));
        },
        [],
    );

    const resetForm = useCallback(() => {
        setForm(buildSiteForm(null));

        setErrors({});
    }, []);

    const submit = useCallback(async () => {
        console.log('SUBMIT CLICKED');
        const normalizedName = form.name.trim();

        const normalizedDomain = normalizeDomain(form.domain);

        const validationErrors: FormErrors = {
            name: validateSiteName(normalizedName, t),

            domain: validateDomain(normalizedDomain, t),

            type: validateWebsiteType(form.type, t),

            contactEmail: validateEmail(form.contactEmail),

            contactPhone: validatePhone(form.contactPhone),

            seoTitle: validateSeoTitle(form.seoTitle),

            seoDescription: validateSeoDescription(form.seoDescription),
        };

        setErrors(validationErrors);

        console.log('VALIDATION ERRORS', validationErrors);

        const hasError = Object.values(validationErrors).some(Boolean);

        console.log('HAS ERROR', hasError);

        if (hasError) {
            console.log('BEFORE ONCREATE 1');
            return;
        }
        console.log('BEFORE ONCREATE');

        const payload: SiteFormState = {
            ...form,
            name: normalizedName,
            domain: normalizedDomain,
        };

        if (mode === 'create') {
            await onCreate(payload);

            return;
        }

        await onSave(payload);
    }, [form, mode, onCreate, onSave, t]);

    return {
        form,
        errors,

        updateField,

        resetForm,

        submit,
    };
}
