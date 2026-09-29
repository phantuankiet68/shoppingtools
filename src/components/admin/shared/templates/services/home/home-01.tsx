'use client';
import type { RegItem } from '@/lib/ui-builder/types';
import HeroService01, {
    type HeroService01Props,
} from '@/components/admin/shared/templates/services/heros/hero-service-01';
import ShowcaseService01, {
    type ShowcaseService01Props,
} from '@/components/admin/shared/templates/services/showcase/showcase-service-01';
import BenefitService01, {
    type BenefitService01Props,
} from '@/components/admin/shared/templates/services/benefits/benefit-service-01';
import PricingService01, {
    type PricingService01Props,
} from '@/components/admin/shared/templates/services/pricing/pricing-service-01';
import PortfolioService01, {
    type PortfolioService01Props,
} from '@/components/admin/shared/templates/services/portfolios/portfolio-service-01';
import TestimonialService01, {
    type TestimonialService01Props,
} from '@/components/admin/shared/templates/services/testimonials/testimonial-service-01';

import ContactService01, {
    type ContactService01Props,
} from '@/components/admin/shared/templates/services/contacts/contact-service-01';
import { HERO_SERVICE_01 } from '@/components/admin/shared/templates/services/heros/hero-service-01';
import { SHOWCASE_SERVICE_01 } from '@/components/admin/shared/templates/services/showcase/showcase-service-01';
import { BENEFIT_SERVICE_01 } from '@/components/admin/shared/templates/services/benefits/benefit-service-01';
import { PRICING_SERVICE_01 } from '@/components/admin/shared/templates/services/pricing/pricing-service-01';
import { PORTFOLIO_SERVICE_01 } from '@/components/admin/shared/templates/services/portfolios/portfolio-service-01';
import { TESTIMONIAL_SERVICE_01 } from '@/components/admin/shared/templates/services/testimonials/testimonial-service-01';
import { CONTACT_SERVICE_01 } from '@/components/admin/shared/templates/services/contacts/contact-service-01';
import styles from '@/components/admin/shared/templates/services/home/styles/home-service-01.module.css';

export interface Home01Props
    extends
        HeroService01Props,
        ShowcaseService01Props,
        BenefitService01Props,
        PricingService01Props,
        PortfolioService01Props,
        TestimonialService01Props,
        ContactService01Props {}

export const HOME_SERVICE_01: RegItem = {
    kind: 'home-service-01',
    label: 'Home Service 01',
    defaults: {
        ...HERO_SERVICE_01.defaults,
        ...SHOWCASE_SERVICE_01.defaults,
        ...BENEFIT_SERVICE_01.defaults,
        ...PRICING_SERVICE_01.defaults,
        ...PORTFOLIO_SERVICE_01.defaults,
        ...TESTIMONIAL_SERVICE_01.defaults,
        ...CONTACT_SERVICE_01.defaults,
    },
    inspector: [
        ...HERO_SERVICE_01.inspector,
        ...SHOWCASE_SERVICE_01.inspector,
        ...BENEFIT_SERVICE_01.inspector,
        ...PRICING_SERVICE_01.inspector,
        ...PORTFOLIO_SERVICE_01.inspector,
        ...TESTIMONIAL_SERVICE_01.inspector,
        ...CONTACT_SERVICE_01.inspector,
    ],
    render: (props) => (
        <div className={styles.homeWapper}>
            <HeroService01 {...(props as HeroService01Props)} />
            <ShowcaseService01 {...(props as ShowcaseService01Props)} />
            <BenefitService01 {...(props as BenefitService01Props)} />
            <PricingService01 {...(props as PricingService01Props)} />
            <PortfolioService01 {...(props as PortfolioService01Props)} />
            <TestimonialService01 {...(props as TestimonialService01Props)} />
            <ContactService01 {...(props as ContactService01Props)} />
        </div>
    ),
};

export function HomeService01(props: Home01Props) {
    return (
        <div className={styles.homeWapper}>
            <HeroService01 {...props} />
            <ShowcaseService01 {...props} />
            <BenefitService01 {...props} />
            <PricingService01 {...props} />
            <PortfolioService01 {...props} />
            <TestimonialService01 {...props} />
            <ContactService01 {...props} />
        </div>
    );
}

export default HomeService01;
