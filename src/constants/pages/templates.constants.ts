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
    tpl('tpl-section', 'Showcase', [
        'ShowcaseService01',
        'SectionSales',
        'SectionSalesOne',
        'SectionSalesTwo',
        'SectionSalesThree',
        'SectionSalesFour',
        'SectionSalesFive',
        'SectionSalesSix',
        'SectionSalesSeven',
        'SectionSalesEight',
        'SectionSalesNine',
        'SectionSalesTen',
    ]),
] as const;
