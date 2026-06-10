import { useCallback, useEffect, useState } from 'react';

import { FormErrors, SiteFormMode, SiteFormState, SiteLike } from '@/features/sites/types';

import { SEO_BY_TYPE, WEBSITE_CATEGORIES } from '@/constants/sites/siteConstants';
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

    useEffect(() => {
        setForm(buildSiteForm(active));

        setErrors({});
    }, [active, mode]);

    const updateField = useCallback(
        <K extends keyof SiteFormState>(key: K, value: SiteFormState[K]) => {
            setForm((prev) => {
                // Khi đổi Website Type
                if (key === 'type') {
                    const type = value as SiteFormState['type'];

                    const categories = WEBSITE_CATEGORIES[type] || [];
                    const category = categories[0] ?? '';

                    const seoTemplate = SEO_BY_TYPE[type];

                    return {
                        ...prev,
                        type,
                        category,
                        seoTitle: seoTemplate?.title(prev.name, category) ?? '',
                        seoDescription: seoTemplate?.description(prev.name, category) ?? '',
                    };
                }
                if (key === 'category') {
                    const category = value as string;

                    const seoTemplate = SEO_BY_TYPE[prev.type];

                    return {
                        ...prev,
                        category,
                        seoTitle: seoTemplate?.title(prev.name, category) ?? '',
                        seoDescription: seoTemplate?.description(prev.name, category) ?? '',
                    };
                }
                if (key === 'name') {
                    const name = value as string;

                    const seoTemplate = SEO_BY_TYPE[prev.type];

                    return {
                        ...prev,
                        name,
                        seoTitle: seoTemplate?.title(name, prev.category) ?? '',
                        seoDescription: seoTemplate?.description(name, prev.category) ?? '',
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
