import { REGISTRY } from '@/lib/ui-builder/registry';

export type RegistryKind = (typeof REGISTRY)[number]['kind'];

export type BuilderTemplate = {
    id: string;
    label: string;
    children: RegistryKind[];
};

function tpl(id: string, label: string, children: RegistryKind[]): BuilderTemplate {
    return { id, label, children };
}

export const TEMPLATES: readonly BuilderTemplate[] = [
    tpl('tpl-topbar', 'Topbar', [
        'TopbarAnnouncement',
        'TopbarCentered',
        'TopbarClassic',
        'TopbarCompact',
        'TopbarDashboard',
        'TopbarMinimal',
        'TopbarRegion',
        'TopbarSplit',
        'TopbarTicker',
        'TopbarUtility',
    ]),

    tpl('tpl-header', 'Header', [
        'HeaderAnnouncement',
        'HeaderService01',
        'HeaderService02',
        'HeaderService03',
        'HeaderService04',
        'HeaderService05',
        'HeaderService06',
        'HeaderService07',
        'HeaderService08',
        'HeaderService09',
    ]),
    tpl('tpl-hero', 'Hero', ['HeroService01']),
    tpl('tpl-footer', 'Footer', [
        'FooterService01',
        'FooterService02',
        'FooterService03',
        'FooterService04',
        'FooterService05',
        'FooterService06',
        'FooterService07',
        'FooterService08',
        'FooterService09',
    ]),
    tpl('tpl-sidebar', 'Sidebar', [
        'SidebarAnnouncement',
        'HeroCentered',
        'HeroClassic',
        'HeroCompact',
        'Brand1',
        'Makeup1',
        'Skincare1',
        'BodyCare1',
        'KidsCare1',
        'MenCare1',
        'Accessories1',
    ]),
    tpl('tpl-showcase', 'Showcase', ['ShowcaseService01']),
    tpl('tpl-benefit', 'Benefit', ['BenefitService01']),
    tpl('tpl-pricing', 'Pricing', ['PricingService01']),
    tpl('tpl-portfolio', 'Portfolio', ['PortfolioService01']),
    tpl('tpl-testimonial', 'Testimonial', ['TestimonialService01']),
    tpl('tpl-contact', 'Contact', ['ContactService01']),
    tpl('tpl-service', 'Service', ['Service01']),
    tpl('tpl-pricing-page', 'Pricing Page', ['Pricing01']),
    tpl('tpl-project-page', 'Project Page', ['Project01']),
    tpl('tpl-about-page', 'About Page', ['About01']),
    tpl('tpl-blog-page', 'Blog Page', ['Blog01']),
    tpl('tpl-sign-in', 'Sign In', ['SignIn01']),
    tpl('tpl-profile', 'Profile', ['Profile01']),
    tpl('tpl-change-password', 'Change Password', ['ChangePassword01']),
] as const;
