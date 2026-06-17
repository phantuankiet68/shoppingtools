export type WebsiteType = 'landing' | 'blog' | 'ecommerce' | 'booking' | 'lms';

export type MenuTemplateItem = {
    title: string;
    path: string;
    icon: string;
};

export const MENU_TEMPLATES: Record<WebsiteType, Record<string, MenuTemplateItem[]>> = {
    landing: {
        'Company Profile': [
            { title: 'sites.menu.home', path: 'sites.menuPath.home', icon: 'bi-house' },
            { title: 'sites.menu.aboutUs', path: 'sites.menuPath.aboutUs', icon: 'bi-building' },
            { title: 'sites.menu.services', path: 'sites.menuPath.services', icon: 'bi-briefcase' },
            { title: 'sites.menu.projects', path: 'sites.menuPath.projects', icon: 'bi-kanban' },
            { title: 'sites.menu.team', path: 'sites.menuPath.team', icon: 'bi-people' },
            {
                title: 'sites.menu.careers',
                path: 'sites.menuPath.careers',
                icon: 'bi-person-workspace',
            },
            { title: 'sites.menu.news', path: 'sites.menuPath.news', icon: 'bi-newspaper' },
            { title: 'sites.menu.contact', path: 'sites.menuPath.contact', icon: 'bi-envelope' },
        ],

        'Personal Profile': [
            { title: 'sites.menu.home', path: 'sites.menuPath.home', icon: 'bi-house' },
            { title: 'sites.menu.aboutMe', path: 'sites.menuPath.aboutMe', icon: 'bi-person' },
            { title: 'sites.menu.experience', path: 'sites.menuPath.experience', icon: 'bi-award' },
            { title: 'sites.menu.skills', path: 'sites.menuPath.skills', icon: 'bi-lightning' },
            { title: 'sites.menu.portfolio', path: 'sites.menuPath.portfolio', icon: 'bi-images' },
            { title: 'sites.menu.blog', path: 'sites.menuPath.blog', icon: 'bi-journal' },
            { title: 'sites.menu.contact', path: 'sites.menuPath.contact', icon: 'bi-envelope' },
        ],

        Portfolio: [
            { title: 'sites.menu.home', path: 'sites.menuPath.home', icon: 'bi-house' },
            { title: 'sites.menu.portfolio', path: 'sites.menuPath.portfolio', icon: 'bi-images' },
            { title: 'sites.menu.projects', path: 'sites.menuPath.projects', icon: 'bi-kanban' },
            { title: 'sites.menu.services', path: 'sites.menuPath.services', icon: 'bi-briefcase' },
            {
                title: 'sites.menu.testimonials',
                path: 'sites.menuPath.testimonials',
                icon: 'bi-chat-quote',
            },
            { title: 'sites.menu.blog', path: 'sites.menuPath.blog', icon: 'bi-journal' },
            { title: 'sites.menu.contact', path: 'sites.menuPath.contact', icon: 'bi-envelope' },
        ],

        Agency: [
            { title: 'sites.menu.home', path: 'sites.menuPath.home', icon: 'bi-house' },
            { title: 'sites.menu.about', path: 'sites.menuPath.about', icon: 'bi-building' },
            { title: 'sites.menu.services', path: 'sites.menuPath.services', icon: 'bi-briefcase' },
            {
                title: 'sites.menu.caseStudies',
                path: 'sites.menuPath.caseStudies',
                icon: 'bi-bar-chart',
            },
            { title: 'sites.menu.clients', path: 'sites.menuPath.clients', icon: 'bi-people' },
            { title: 'sites.menu.team', path: 'sites.menuPath.team', icon: 'bi-person-workspace' },
            { title: 'sites.menu.pricing', path: 'sites.menuPath.pricing', icon: 'bi-cash-stack' },
            { title: 'sites.menu.blog', path: 'sites.menuPath.blog', icon: 'bi-journal' },
            { title: 'sites.menu.contact', path: 'sites.menuPath.contact', icon: 'bi-envelope' },
        ],

        Product: [
            { title: 'sites.menu.home', path: 'sites.menuPath.home', icon: 'bi-house' },
            { title: 'sites.menu.features', path: 'sites.menuPath.features', icon: 'bi-stars' },
            {
                title: 'sites.menu.benefits',
                path: 'sites.menuPath.benefits',
                icon: 'bi-check-circle',
            },
            { title: 'sites.menu.pricing', path: 'sites.menuPath.pricing', icon: 'bi-cash-stack' },
            {
                title: 'sites.menu.reviews',
                path: 'sites.menuPath.reviews',
                icon: 'bi-chat-square-text',
            },
            { title: 'sites.menu.faq', path: 'sites.menuPath.faq', icon: 'bi-question-circle' },
            { title: 'sites.menu.contact', path: 'sites.menuPath.contact', icon: 'bi-envelope' },
        ],

        Service: [
            { title: 'sites.menu.home', path: 'sites.menuPath.home', icon: 'bi-house' },
            { title: 'sites.menu.services', path: 'sites.menuPath.services', icon: 'bi-briefcase' },
            { title: 'sites.menu.pricing', path: 'sites.menuPath.pricing', icon: 'bi-cash-stack' },
            { title: 'sites.menu.portfolio', path: 'sites.menuPath.portfolio', icon: 'bi-images' },
            {
                title: 'sites.menu.testimonials',
                path: 'sites.menuPath.testimonials',
                icon: 'bi-chat-quote',
            },
            { title: 'sites.menu.faq', path: 'sites.menuPath.faq', icon: 'bi-question-circle' },
            { title: 'sites.menu.contact', path: 'sites.menuPath.contact', icon: 'bi-envelope' },
        ],

        Restaurant: [
            { title: 'sites.menu.home', path: 'sites.menuPath.home', icon: 'bi-house' },
            { title: 'sites.menu.about', path: 'sites.menuPath.about', icon: 'bi-shop' },
            { title: 'sites.menu.menu', path: 'sites.menuPath.menu', icon: 'bi-card-list' },
            { title: 'sites.menu.gallery', path: 'sites.menuPath.gallery', icon: 'bi-images' },
            {
                title: 'sites.menu.reservation',
                path: 'sites.menuPath.reservation',
                icon: 'bi-calendar-check',
            },
            {
                title: 'sites.menu.events',
                path: 'sites.menuPath.events',
                icon: 'bi-calendar-event',
            },
            { title: 'sites.menu.contact', path: 'sites.menuPath.contact', icon: 'bi-envelope' },
        ],

        Spa: [
            { title: 'sites.menu.home', path: 'sites.menuPath.home', icon: 'bi-house' },
            { title: 'sites.menu.about', path: 'sites.menuPath.about', icon: 'bi-heart' },
            { title: 'sites.menu.services', path: 'sites.menuPath.services', icon: 'bi-scissors' },
            { title: 'sites.menu.packages', path: 'sites.menuPath.packages', icon: 'bi-gift' },
            { title: 'sites.menu.gallery', path: 'sites.menuPath.gallery', icon: 'bi-images' },
            {
                title: 'sites.menu.booking',
                path: 'sites.menuPath.booking',
                icon: 'bi-calendar-check',
            },
            {
                title: 'sites.menu.testimonials',
                path: 'sites.menuPath.testimonials',
                icon: 'bi-chat-quote',
            },
            { title: 'sites.menu.contact', path: 'sites.menuPath.contact', icon: 'bi-envelope' },
        ],

        'Real Estate': [
            { title: 'sites.menu.home', path: 'sites.menuPath.home', icon: 'bi-house' },
            {
                title: 'sites.menu.properties',
                path: 'sites.menuPath.properties',
                icon: 'bi-building',
            },
            { title: 'sites.menu.propertyMap', path: 'sites.menuPath.propertyMap', icon: 'bi-map' },
            { title: 'sites.menu.agents', path: 'sites.menuPath.agents', icon: 'bi-people' },
            { title: 'sites.menu.services', path: 'sites.menuPath.services', icon: 'bi-briefcase' },
            { title: 'sites.menu.blog', path: 'sites.menuPath.blog', icon: 'bi-journal' },
            { title: 'sites.menu.contact', path: 'sites.menuPath.contact', icon: 'bi-envelope' },
        ],

        Event: [
            { title: 'sites.menu.home', path: 'sites.menuPath.home', icon: 'bi-house' },
            {
                title: 'sites.menu.aboutEvent',
                path: 'sites.menuPath.aboutEvent',
                icon: 'bi-info-circle',
            },
            { title: 'sites.menu.schedule', path: 'sites.menuPath.schedule', icon: 'bi-calendar3' },
            { title: 'sites.menu.speakers', path: 'sites.menuPath.speakers', icon: 'bi-mic' },
            { title: 'sites.menu.sponsors', path: 'sites.menuPath.sponsors', icon: 'bi-building' },
            { title: 'sites.menu.tickets', path: 'sites.menuPath.tickets', icon: 'bi-ticket' },
            { title: 'sites.menu.gallery', path: 'sites.menuPath.gallery', icon: 'bi-images' },
            { title: 'sites.menu.contact', path: 'sites.menuPath.contact', icon: 'bi-envelope' },
        ],
    },

    blog: {
        'Tech Blog': [
            { title: 'sites.menu.home', path: 'sites.menuPath.home', icon: 'bi-house' },
            {
                title: 'sites.menu.articles',
                path: 'sites.menuPath.articles',
                icon: 'bi-journal-code',
            },
            { title: 'sites.menu.categories', path: 'sites.menuPath.categories', icon: 'bi-tags' },
            {
                title: 'sites.menu.tutorials',
                path: 'sites.menuPath.tutorials',
                icon: 'bi-code-slash',
            },
            { title: 'sites.menu.reviews', path: 'sites.menuPath.reviews', icon: 'bi-star' },
            {
                title: 'sites.menu.resources',
                path: 'sites.menuPath.resources',
                icon: 'bi-folder2-open',
            },
            { title: 'sites.menu.about', path: 'sites.menuPath.about', icon: 'bi-person' },
            { title: 'sites.menu.contact', path: 'sites.menuPath.contact', icon: 'bi-envelope' },
        ],

        'Travel Blog': [
            { title: 'sites.menu.home', path: 'sites.menuPath.home', icon: 'bi-house' },
            {
                title: 'sites.menu.destinations',
                path: 'sites.menuPath.destinations',
                icon: 'bi-geo-alt',
            },
            {
                title: 'sites.menu.travelGuides',
                path: 'sites.menuPath.travelGuides',
                icon: 'bi-map',
            },
            {
                title: 'sites.menu.experiences',
                path: 'sites.menuPath.experiences',
                icon: 'bi-camera',
            },
            { title: 'sites.menu.gallery', path: 'sites.menuPath.gallery', icon: 'bi-images' },
            { title: 'sites.menu.tips', path: 'sites.menuPath.tips', icon: 'bi-lightbulb' },
            { title: 'sites.menu.about', path: 'sites.menuPath.about', icon: 'bi-person' },
            { title: 'sites.menu.contact', path: 'sites.menuPath.contact', icon: 'bi-envelope' },
        ],

        'Food Blog': [
            { title: 'sites.menu.home', path: 'sites.menuPath.home', icon: 'bi-house' },
            { title: 'sites.menu.recipes', path: 'sites.menuPath.recipes', icon: 'bi-book' },
            { title: 'sites.menu.categories', path: 'sites.menuPath.categories', icon: 'bi-tags' },
            {
                title: 'sites.menu.restaurants',
                path: 'sites.menuPath.restaurants',
                icon: 'bi-shop',
            },
            { title: 'sites.menu.reviews', path: 'sites.menuPath.reviews', icon: 'bi-star' },
            { title: 'sites.menu.gallery', path: 'sites.menuPath.gallery', icon: 'bi-images' },
            { title: 'sites.menu.about', path: 'sites.menuPath.about', icon: 'bi-person' },
            { title: 'sites.menu.contact', path: 'sites.menuPath.contact', icon: 'bi-envelope' },
        ],

        'News Blog': [
            { title: 'sites.menu.home', path: 'sites.menuPath.home', icon: 'bi-house' },
            {
                title: 'sites.menu.latestNews',
                path: 'sites.menuPath.latestNews',
                icon: 'bi-newspaper',
            },
            { title: 'sites.menu.politics', path: 'sites.menuPath.politics', icon: 'bi-bank' },
            { title: 'sites.menu.business', path: 'sites.menuPath.business', icon: 'bi-briefcase' },
            { title: 'sites.menu.technology', path: 'sites.menuPath.technology', icon: 'bi-cpu' },
            { title: 'sites.menu.sports', path: 'sites.menuPath.sports', icon: 'bi-trophy' },
            { title: 'sites.menu.world', path: 'sites.menuPath.world', icon: 'bi-globe' },
            { title: 'sites.menu.contact', path: 'sites.menuPath.contact', icon: 'bi-envelope' },
        ],

        'Personal Blog': [
            { title: 'sites.menu.home', path: 'sites.menuPath.home', icon: 'bi-house' },
            {
                title: 'sites.menu.blogPosts',
                path: 'sites.menuPath.blogPosts',
                icon: 'bi-journal-text',
            },
            {
                title: 'sites.menu.lifeStories',
                path: 'sites.menuPath.lifeStories',
                icon: 'bi-book-half',
            },
            { title: 'sites.menu.gallery', path: 'sites.menuPath.gallery', icon: 'bi-images' },
            { title: 'sites.menu.projects', path: 'sites.menuPath.projects', icon: 'bi-kanban' },
            { title: 'sites.menu.aboutMe', path: 'sites.menuPath.aboutMe', icon: 'bi-person' },
            { title: 'sites.menu.contact', path: 'sites.menuPath.contact', icon: 'bi-envelope' },
        ],
    },

    ecommerce: {
        Fashion: [
            { title: 'sites.menu.home', path: 'sites.menuPath.home', icon: 'bi-house' },
            {
                title: 'sites.menu.newArrivals',
                path: 'sites.menuPath.newArrivals',
                icon: 'bi-stars',
            },
            { title: 'sites.menu.men', path: 'sites.menuPath.men', icon: 'bi-person' },
            { title: 'sites.menu.women', path: 'sites.menuPath.women', icon: 'bi-person-heart' },
            {
                title: 'sites.menu.collections',
                path: 'sites.menuPath.collections',
                icon: 'bi-grid',
            },
            { title: 'sites.menu.sale', path: 'sites.menuPath.sale', icon: 'bi-percent' },
            { title: 'sites.menu.cart', path: 'sites.menuPath.cart', icon: 'bi-cart' },
            { title: 'sites.menu.contact', path: 'sites.menuPath.contact', icon: 'bi-envelope' },
        ],

        Electronics: [
            { title: 'sites.menu.home', path: 'sites.menuPath.home', icon: 'bi-house' },
            { title: 'sites.menu.products', path: 'sites.menuPath.products', icon: 'bi-cpu' },
            { title: 'sites.menu.categories', path: 'sites.menuPath.categories', icon: 'bi-grid' },
            { title: 'sites.menu.brands', path: 'sites.menuPath.brands', icon: 'bi-award' },
            { title: 'sites.menu.deals', path: 'sites.menuPath.deals', icon: 'bi-lightning' },
            { title: 'sites.menu.support', path: 'sites.menuPath.support', icon: 'bi-headset' },
            { title: 'sites.menu.cart', path: 'sites.menuPath.cart', icon: 'bi-cart' },
            { title: 'sites.menu.contact', path: 'sites.menuPath.contact', icon: 'bi-envelope' },
        ],

        Books: [
            { title: 'sites.menu.home', path: 'sites.menuPath.home', icon: 'bi-house' },
            { title: 'sites.menu.books', path: 'sites.menuPath.books', icon: 'bi-book' },
            { title: 'sites.menu.categories', path: 'sites.menuPath.categories', icon: 'bi-tags' },
            { title: 'sites.menu.authors', path: 'sites.menuPath.authors', icon: 'bi-pen' },
            {
                title: 'sites.menu.bestSellers',
                path: 'sites.menuPath.bestSellers',
                icon: 'bi-trophy',
            },
            {
                title: 'sites.menu.newReleases',
                path: 'sites.menuPath.newReleases',
                icon: 'bi-stars',
            },
            { title: 'sites.menu.cart', path: 'sites.menuPath.cart', icon: 'bi-cart' },
            { title: 'sites.menu.contact', path: 'sites.menuPath.contact', icon: 'bi-envelope' },
        ],

        'Digital Products': [
            { title: 'sites.menu.home', path: 'sites.menuPath.home', icon: 'bi-house' },
            { title: 'sites.menu.products', path: 'sites.menuPath.products', icon: 'bi-download' },
            { title: 'sites.menu.software', path: 'sites.menuPath.software', icon: 'bi-window' },
            {
                title: 'sites.menu.templates',
                path: 'sites.menuPath.templates',
                icon: 'bi-layout-text-window',
            },
            { title: 'sites.menu.resources', path: 'sites.menuPath.resources', icon: 'bi-folder' },
            { title: 'sites.menu.pricing', path: 'sites.menuPath.pricing', icon: 'bi-cash-stack' },
            {
                title: 'sites.menu.downloads',
                path: 'sites.menuPath.downloads',
                icon: 'bi-cloud-download',
            },
            { title: 'sites.menu.contact', path: 'sites.menuPath.contact', icon: 'bi-envelope' },
        ],

        Food: [
            { title: 'sites.menu.home', path: 'sites.menuPath.home', icon: 'bi-house' },
            { title: 'sites.menu.menu', path: 'sites.menuPath.menu', icon: 'bi-card-list' },
            { title: 'sites.menu.categories', path: 'sites.menuPath.categories', icon: 'bi-tags' },
            {
                title: 'sites.menu.popularItems',
                path: 'sites.menuPath.popularItems',
                icon: 'bi-fire',
            },
            { title: 'sites.menu.offers', path: 'sites.menuPath.offers', icon: 'bi-percent' },
            { title: 'sites.menu.delivery', path: 'sites.menuPath.delivery', icon: 'bi-truck' },
            { title: 'sites.menu.cart', path: 'sites.menuPath.cart', icon: 'bi-cart' },
            { title: 'sites.menu.contact', path: 'sites.menuPath.contact', icon: 'bi-envelope' },
        ],

        Beauty: [
            { title: 'sites.menu.home', path: 'sites.menuPath.home', icon: 'bi-house' },
            { title: 'sites.menu.products', path: 'sites.menuPath.products', icon: 'bi-bag' },
            { title: 'sites.menu.skincare', path: 'sites.menuPath.skincare', icon: 'bi-droplet' },
            { title: 'sites.menu.makeup', path: 'sites.menuPath.makeup', icon: 'bi-brush' },
            { title: 'sites.menu.brands', path: 'sites.menuPath.brands', icon: 'bi-award' },
            { title: 'sites.menu.offers', path: 'sites.menuPath.offers', icon: 'bi-percent' },
            { title: 'sites.menu.cart', path: 'sites.menuPath.cart', icon: 'bi-cart' },
            { title: 'sites.menu.contact', path: 'sites.menuPath.contact', icon: 'bi-envelope' },
        ],
    },

    booking: {
        Hotel: [
            { title: 'sites.menu.home', path: 'sites.menuPath.home', icon: 'bi-house' },
            { title: 'sites.menu.rooms', path: 'sites.menuPath.rooms', icon: 'bi-door-open' },
            { title: 'sites.menu.suites', path: 'sites.menuPath.suites', icon: 'bi-building' },
            { title: 'sites.menu.facilities', path: 'sites.menuPath.facilities', icon: 'bi-stars' },
            { title: 'sites.menu.gallery', path: 'sites.menuPath.gallery', icon: 'bi-images' },
            {
                title: 'sites.menu.booking',
                path: 'sites.menuPath.booking',
                icon: 'bi-calendar-check',
            },
            { title: 'sites.menu.offers', path: 'sites.menuPath.offers', icon: 'bi-percent' },
            { title: 'sites.menu.contact', path: 'sites.menuPath.contact', icon: 'bi-envelope' },
        ],

        Homestay: [
            { title: 'sites.menu.home', path: 'sites.menuPath.home', icon: 'bi-house' },
            { title: 'sites.menu.rooms', path: 'sites.menuPath.rooms', icon: 'bi-door-open' },
            {
                title: 'sites.menu.experiences',
                path: 'sites.menuPath.experiences',
                icon: 'bi-camera',
            },
            { title: 'sites.menu.gallery', path: 'sites.menuPath.gallery', icon: 'bi-images' },
            { title: 'sites.menu.reviews', path: 'sites.menuPath.reviews', icon: 'bi-chat-quote' },
            {
                title: 'sites.menu.booking',
                path: 'sites.menuPath.booking',
                icon: 'bi-calendar-check',
            },
            { title: 'sites.menu.about', path: 'sites.menuPath.about', icon: 'bi-info-circle' },
            { title: 'sites.menu.contact', path: 'sites.menuPath.contact', icon: 'bi-envelope' },
        ],

        Spa: [
            { title: 'sites.menu.home', path: 'sites.menuPath.home', icon: 'bi-house' },
            { title: 'sites.menu.services', path: 'sites.menuPath.services', icon: 'bi-heart' },
            { title: 'sites.menu.packages', path: 'sites.menuPath.packages', icon: 'bi-gift' },
            {
                title: 'sites.menu.therapists',
                path: 'sites.menuPath.therapists',
                icon: 'bi-person',
            },
            { title: 'sites.menu.gallery', path: 'sites.menuPath.gallery', icon: 'bi-images' },
            {
                title: 'sites.menu.booking',
                path: 'sites.menuPath.booking',
                icon: 'bi-calendar-check',
            },
            {
                title: 'sites.menu.testimonials',
                path: 'sites.menuPath.testimonials',
                icon: 'bi-chat-quote',
            },
            { title: 'sites.menu.contact', path: 'sites.menuPath.contact', icon: 'bi-envelope' },
        ],

        Clinic: [
            { title: 'sites.menu.home', path: 'sites.menuPath.home', icon: 'bi-house' },
            {
                title: 'sites.menu.doctors',
                path: 'sites.menuPath.doctors',
                icon: 'bi-person-badge',
            },
            {
                title: 'sites.menu.departments',
                path: 'sites.menuPath.departments',
                icon: 'bi-hospital',
            },
            {
                title: 'sites.menu.services',
                path: 'sites.menuPath.services',
                icon: 'bi-heart-pulse',
            },
            { title: 'sites.menu.schedule', path: 'sites.menuPath.schedule', icon: 'bi-calendar3' },
            {
                title: 'sites.menu.appointment',
                path: 'sites.menuPath.appointment',
                icon: 'bi-calendar-check',
            },
            { title: 'sites.menu.faq', path: 'sites.menuPath.faq', icon: 'bi-question-circle' },
            { title: 'sites.menu.contact', path: 'sites.menuPath.contact', icon: 'bi-envelope' },
        ],

        Restaurant: [
            { title: 'sites.menu.home', path: 'sites.menuPath.home', icon: 'bi-house' },
            { title: 'sites.menu.menu', path: 'sites.menuPath.menu', icon: 'bi-card-list' },
            {
                title: 'sites.menu.specialDishes',
                path: 'sites.menuPath.specialDishes',
                icon: 'bi-fire',
            },
            { title: 'sites.menu.gallery', path: 'sites.menuPath.gallery', icon: 'bi-images' },
            {
                title: 'sites.menu.events',
                path: 'sites.menuPath.events',
                icon: 'bi-calendar-event',
            },
            {
                title: 'sites.menu.reservation',
                path: 'sites.menuPath.reservation',
                icon: 'bi-calendar-check',
            },
            { title: 'sites.menu.about', path: 'sites.menuPath.about', icon: 'bi-shop' },
            { title: 'sites.menu.contact', path: 'sites.menuPath.contact', icon: 'bi-envelope' },
        ],

        Gym: [
            { title: 'sites.menu.home', path: 'sites.menuPath.home', icon: 'bi-house' },
            { title: 'sites.menu.programs', path: 'sites.menuPath.programs', icon: 'bi-trophy' },
            { title: 'sites.menu.classes', path: 'sites.menuPath.classes', icon: 'bi-activity' },
            {
                title: 'sites.menu.trainers',
                path: 'sites.menuPath.trainers',
                icon: 'bi-person-workspace',
            },
            {
                title: 'sites.menu.membership',
                path: 'sites.menuPath.membership',
                icon: 'bi-credit-card',
            },
            { title: 'sites.menu.schedule', path: 'sites.menuPath.schedule', icon: 'bi-calendar3' },
            {
                title: 'sites.menu.booking',
                path: 'sites.menuPath.booking',
                icon: 'bi-calendar-check',
            },
            { title: 'sites.menu.contact', path: 'sites.menuPath.contact', icon: 'bi-envelope' },
        ],

        'Car Rental': [
            { title: 'sites.menu.home', path: 'sites.menuPath.home', icon: 'bi-house' },
            { title: 'sites.menu.vehicles', path: 'sites.menuPath.vehicles', icon: 'bi-car-front' },
            { title: 'sites.menu.pricing', path: 'sites.menuPath.pricing', icon: 'bi-cash-stack' },
            { title: 'sites.menu.locations', path: 'sites.menuPath.locations', icon: 'bi-geo-alt' },
            {
                title: 'sites.menu.booking',
                path: 'sites.menuPath.booking',
                icon: 'bi-calendar-check',
            },
            {
                title: 'sites.menu.insurance',
                path: 'sites.menuPath.insurance',
                icon: 'bi-shield-check',
            },
            { title: 'sites.menu.faq', path: 'sites.menuPath.faq', icon: 'bi-question-circle' },
            { title: 'sites.menu.contact', path: 'sites.menuPath.contact', icon: 'bi-envelope' },
        ],
    },

    lms: {
        'Online Course': [
            { title: 'sites.menu.home', path: 'sites.menuPath.home', icon: 'bi-house' },
            { title: 'sites.menu.courses', path: 'sites.menuPath.courses', icon: 'bi-book' },
            { title: 'sites.menu.categories', path: 'sites.menuPath.categories', icon: 'bi-grid' },
            {
                title: 'sites.menu.instructors',
                path: 'sites.menuPath.instructors',
                icon: 'bi-person-video3',
            },
            {
                title: 'sites.menu.learningPath',
                path: 'sites.menuPath.learningPath',
                icon: 'bi-signpost',
            },
            {
                title: 'sites.menu.certificates',
                path: 'sites.menuPath.certificates',
                icon: 'bi-award',
            },
            { title: 'sites.menu.blog', path: 'sites.menuPath.blog', icon: 'bi-journal' },
            { title: 'sites.menu.contact', path: 'sites.menuPath.contact', icon: 'bi-envelope' },
        ],

        'Japanese Learning': [
            { title: 'sites.menu.home', path: 'sites.menuPath.home', icon: 'bi-house' },
            {
                title: 'sites.menu.jlptCourses',
                path: 'sites.menuPath.jlptCourses',
                icon: 'bi-book',
            },
            {
                title: 'sites.menu.vocabulary',
                path: 'sites.menuPath.vocabulary',
                icon: 'bi-card-text',
            },
            { title: 'sites.menu.kanji', path: 'sites.menuPath.kanji', icon: 'bi-pencil-square' },
            {
                title: 'sites.menu.grammar',
                path: 'sites.menuPath.grammar',
                icon: 'bi-journal-text',
            },
            {
                title: 'sites.menu.mockTests',
                path: 'sites.menuPath.mockTests',
                icon: 'bi-clipboard-check',
            },
            {
                title: 'sites.menu.teachers',
                path: 'sites.menuPath.teachers',
                icon: 'bi-person-workspace',
            },
            { title: 'sites.menu.contact', path: 'sites.menuPath.contact', icon: 'bi-envelope' },
        ],

        'English Learning': [
            { title: 'sites.menu.home', path: 'sites.menuPath.home', icon: 'bi-house' },
            { title: 'sites.menu.courses', path: 'sites.menuPath.courses', icon: 'bi-book' },
            {
                title: 'sites.menu.vocabulary',
                path: 'sites.menuPath.vocabulary',
                icon: 'bi-card-text',
            },
            {
                title: 'sites.menu.grammar',
                path: 'sites.menuPath.grammar',
                icon: 'bi-journal-text',
            },
            { title: 'sites.menu.speaking', path: 'sites.menuPath.speaking', icon: 'bi-mic' },
            {
                title: 'sites.menu.practiceTests',
                path: 'sites.menuPath.practiceTests',
                icon: 'bi-clipboard-check',
            },
            {
                title: 'sites.menu.teachers',
                path: 'sites.menuPath.teachers',
                icon: 'bi-person-workspace',
            },
            { title: 'sites.menu.contact', path: 'sites.menuPath.contact', icon: 'bi-envelope' },
        ],

        School: [
            { title: 'sites.menu.home', path: 'sites.menuPath.home', icon: 'bi-house' },
            {
                title: 'sites.menu.aboutSchool',
                path: 'sites.menuPath.aboutSchool',
                icon: 'bi-building',
            },
            { title: 'sites.menu.programs', path: 'sites.menuPath.programs', icon: 'bi-book' },
            {
                title: 'sites.menu.teachers',
                path: 'sites.menuPath.teachers',
                icon: 'bi-person-workspace',
            },
            {
                title: 'sites.menu.admissions',
                path: 'sites.menuPath.admissions',
                icon: 'bi-door-open',
            },
            {
                title: 'sites.menu.events',
                path: 'sites.menuPath.events',
                icon: 'bi-calendar-event',
            },
            { title: 'sites.menu.news', path: 'sites.menuPath.news', icon: 'bi-newspaper' },
            { title: 'sites.menu.contact', path: 'sites.menuPath.contact', icon: 'bi-envelope' },
        ],

        'Training Center': [
            { title: 'sites.menu.home', path: 'sites.menuPath.home', icon: 'bi-house' },
            { title: 'sites.menu.courses', path: 'sites.menuPath.courses', icon: 'bi-book' },
            {
                title: 'sites.menu.schedules',
                path: 'sites.menuPath.schedules',
                icon: 'bi-calendar3',
            },
            {
                title: 'sites.menu.trainers',
                path: 'sites.menuPath.trainers',
                icon: 'bi-person-workspace',
            },
            {
                title: 'sites.menu.certifications',
                path: 'sites.menuPath.certifications',
                icon: 'bi-award',
            },
            {
                title: 'sites.menu.corporateTraining',
                path: 'sites.menuPath.corporateTraining',
                icon: 'bi-briefcase',
            },
            { title: 'sites.menu.blog', path: 'sites.menuPath.blog', icon: 'bi-journal' },
            { title: 'sites.menu.contact', path: 'sites.menuPath.contact', icon: 'bi-envelope' },
        ],

        'Exam Platform': [
            { title: 'sites.menu.home', path: 'sites.menuPath.home', icon: 'bi-house' },
            { title: 'sites.menu.exams', path: 'sites.menuPath.exams', icon: 'bi-clipboard-check' },
            {
                title: 'sites.menu.practiceTests',
                path: 'sites.menuPath.practiceTests',
                icon: 'bi-pencil-square',
            },
            { title: 'sites.menu.rankings', path: 'sites.menuPath.rankings', icon: 'bi-trophy' },
            {
                title: 'sites.menu.certificates',
                path: 'sites.menuPath.certificates',
                icon: 'bi-award',
            },
            { title: 'sites.menu.results', path: 'sites.menuPath.results', icon: 'bi-bar-chart' },
            { title: 'sites.menu.faq', path: 'sites.menuPath.faq', icon: 'bi-question-circle' },
            { title: 'sites.menu.contact', path: 'sites.menuPath.contact', icon: 'bi-envelope' },
        ],
    },
};
