// lib/ui-builder/registry.ts
import type { RegItem } from '@/lib/ui-builder/types';

import { HEADER_SERVICE_01 } from '@/components/admin/shared/templates/services/headers/header-service-01';
import { HEADER_SERVICE_02 } from '@/components/admin/shared/templates/services/headers/header-service-02';
import { HEADER_SERVICE_03 } from '@/components/admin/shared/templates/services/headers/header-service-03';
import { HEADER_SERVICE_04 } from '@/components/admin/shared/templates/services/headers/header-service-04';
import { HEADER_SERVICE_05 } from '@/components/admin/shared/templates/services/headers/header-service-05';
import { HEADER_SERVICE_06 } from '@/components/admin/shared/templates/services/headers/header-service-06';
import { HEADER_SERVICE_07 } from '@/components/admin/shared/templates/services/headers/header-service-07';
import { HEADER_SERVICE_08 } from '@/components/admin/shared/templates/services/headers/header-service-08';
import { HEADER_SERVICE_09 } from '@/components/admin/shared/templates/services/headers/header-service-09';

import { FOOTER_SERVICE_01 } from '@/components/admin/shared/templates/services/footers/footer-service-01';
import { FOOTER_SERVICE_02 } from '@/components/admin/shared/templates/services/footers/footer-service-02';
import { FOOTER_SERVICE_03 } from '@/components/admin/shared/templates/services/footers/footer-service-03';
import { FOOTER_SERVICE_04 } from '@/components/admin/shared/templates/services/footers/footer-service-04';
import { FOOTER_SERVICE_05 } from '@/components/admin/shared/templates/services/footers/footer-service-05';
import { FOOTER_SERVICE_06 } from '@/components/admin/shared/templates/services/footers/footer-service-06';
import { FOOTER_SERVICE_07 } from '@/components/admin/shared/templates/services/footers/footer-service-07';
import { FOOTER_SERVICE_08 } from '@/components/admin/shared/templates/services/footers/footer-service-08';
import { FOOTER_SERVICE_09 } from '@/components/admin/shared/templates/services/footers/footer-service-09';

import { HERO_SERVICE_01 } from '@/components/admin/shared/templates/services/heros/hero-service-01';

import { SHOWCASE_SERVICE_01 } from '@/components/admin/shared/templates/services/showcase/showcase-service-01';

import { BENEFIT_SERVICE_01 } from '@/components/admin/shared/templates/services/benefits/benefit-service-01';

import { PRICING_SERVICE_01 } from '@/components/admin/shared/templates/services/pricing/pricing-service-01';

import { PORTFOLIO_SERVICE_01 } from '@/components/admin/shared/templates/services/portfolios/portfolio-service-01';

import { TESTIMONIAL_SERVICE_01 } from '@/components/admin/shared/templates/services/testimonials/testimonial-service-01';

import { CONTACT_SERVICE_01 } from '@/components/admin/shared/templates/services/contacts/contact-service-01';

import { SERVICE_01 } from '@/components/admin/shared/templates/services/service/service-01';

import { PRICING_PAGE_01 } from '@/components/admin/shared/templates/services/pricing-page/pricing-page-01';

import { PROJECT_PAGE_01 } from '@/components/admin/shared/templates/services/project/project-01';

import { ABOUT_PAGE_01 } from '@/components/admin/shared/templates/services/about/about-01';

import { BLOG_PAGE_01 } from '@/components/admin/shared/templates/services/blog/blog-01';

import { SIGN_IN_01 } from '@/components/admin/shared/templates/services/sign-in/sign-in-01';

import { PROFILE_01 } from '@/components/admin/shared/templates/services/profile/profile-01';

import { CHANGE_PASSWORD_01 } from '@/components/admin/shared/templates/components/ChangePassword/ChangePassword';

export const BASIC: RegItem[] = [];

export const REGISTRY_HOME: RegItem[] = [
    HEADER_SERVICE_01,
    HEADER_SERVICE_02,
    HEADER_SERVICE_03,
    HEADER_SERVICE_04,
    HEADER_SERVICE_05,
    HEADER_SERVICE_06,
    HEADER_SERVICE_07,
    HEADER_SERVICE_08,
    HEADER_SERVICE_09,
    FOOTER_SERVICE_01,
    FOOTER_SERVICE_02,
    FOOTER_SERVICE_03,
    FOOTER_SERVICE_04,
    FOOTER_SERVICE_05,
    FOOTER_SERVICE_06,
    FOOTER_SERVICE_07,
    FOOTER_SERVICE_08,
    FOOTER_SERVICE_09,
    HERO_SERVICE_01,
    SHOWCASE_SERVICE_01,
    BENEFIT_SERVICE_01,
    PRICING_SERVICE_01,
    PORTFOLIO_SERVICE_01,
    TESTIMONIAL_SERVICE_01,
    CONTACT_SERVICE_01,
    SERVICE_01,
    PRICING_PAGE_01,
    PROJECT_PAGE_01,
    ABOUT_PAGE_01,
    BLOG_PAGE_01,
    SIGN_IN_01,
    PROFILE_01,
    CHANGE_PASSWORD_01,
];

export const REGISTRY: RegItem[] = [...BASIC, ...REGISTRY_HOME];

export default REGISTRY;
