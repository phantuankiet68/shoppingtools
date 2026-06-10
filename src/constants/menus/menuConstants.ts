export type WebsiteType = 'landing' | 'blog' | 'ecommerce' | 'booking' | 'lms';

export type MenuTemplateItem = {
    title: string;
    path: string;
    icon: string;
};

export const MENU_TEMPLATES: Record<WebsiteType, Record<string, MenuTemplateItem[]>> = {
    landing: {
        'Company Profile': [
            { title: 'Home', path: '/', icon: 'bi-house' },
            { title: 'About Us', path: '/about', icon: 'bi-building' },
            { title: 'Services', path: '/services', icon: 'bi-briefcase' },
            { title: 'Projects', path: '/projects', icon: 'bi-kanban' },
            { title: 'Team', path: '/team', icon: 'bi-people' },
            { title: 'Careers', path: '/careers', icon: 'bi-person-workspace' },
            { title: 'News', path: '/news', icon: 'bi-newspaper' },
            { title: 'Contact', path: '/contact', icon: 'bi-envelope' },
        ],

        'Personal Profile': [
            { title: 'Home', path: '/', icon: 'bi-house' },
            { title: 'About Me', path: '/about', icon: 'bi-person' },
            { title: 'Experience', path: '/experience', icon: 'bi-award' },
            { title: 'Skills', path: '/skills', icon: 'bi-lightning' },
            { title: 'Portfolio', path: '/portfolio', icon: 'bi-images' },
            { title: 'Blog', path: '/blog', icon: 'bi-journal' },
            { title: 'Contact', path: '/contact', icon: 'bi-envelope' },
        ],

        Portfolio: [
            { title: 'Home', path: '/', icon: 'bi-house' },
            { title: 'Portfolio', path: '/portfolio', icon: 'bi-images' },
            { title: 'Projects', path: '/projects', icon: 'bi-kanban' },
            { title: 'Services', path: '/services', icon: 'bi-briefcase' },
            { title: 'Testimonials', path: '/testimonials', icon: 'bi-chat-quote' },
            { title: 'Blog', path: '/blog', icon: 'bi-journal' },
            { title: 'Contact', path: '/contact', icon: 'bi-envelope' },
        ],

        Agency: [
            { title: 'Home', path: '/', icon: 'bi-house' },
            { title: 'About', path: '/about', icon: 'bi-building' },
            { title: 'Services', path: '/services', icon: 'bi-briefcase' },
            { title: 'Case Studies', path: '/case-studies', icon: 'bi-bar-chart' },
            { title: 'Clients', path: '/clients', icon: 'bi-people' },
            { title: 'Team', path: '/team', icon: 'bi-person-workspace' },
            { title: 'Pricing', path: '/pricing', icon: 'bi-cash-stack' },
            { title: 'Blog', path: '/blog', icon: 'bi-journal' },
            { title: 'Contact', path: '/contact', icon: 'bi-envelope' },
        ],

        Product: [
            { title: 'Home', path: '/', icon: 'bi-house' },
            { title: 'Features', path: '/features', icon: 'bi-stars' },
            { title: 'Benefits', path: '/benefits', icon: 'bi-check-circle' },
            { title: 'Pricing', path: '/pricing', icon: 'bi-cash-stack' },
            { title: 'Reviews', path: '/reviews', icon: 'bi-chat-square-text' },
            { title: 'FAQ', path: '/faq', icon: 'bi-question-circle' },
            { title: 'Contact', path: '/contact', icon: 'bi-envelope' },
        ],

        Service: [
            { title: 'Home', path: '/', icon: 'bi-house' },
            { title: 'Services', path: '/services', icon: 'bi-briefcase' },
            { title: 'Pricing', path: '/pricing', icon: 'bi-cash-stack' },
            { title: 'Portfolio', path: '/portfolio', icon: 'bi-images' },
            { title: 'Testimonials', path: '/testimonials', icon: 'bi-chat-quote' },
            { title: 'FAQ', path: '/faq', icon: 'bi-question-circle' },
            { title: 'Contact', path: '/contact', icon: 'bi-envelope' },
        ],

        Restaurant: [
            { title: 'Home', path: '/', icon: 'bi-house' },
            { title: 'About', path: '/about', icon: 'bi-shop' },
            { title: 'Menu', path: '/menu', icon: 'bi-card-list' },
            { title: 'Gallery', path: '/gallery', icon: 'bi-images' },
            { title: 'Reservation', path: '/reservation', icon: 'bi-calendar-check' },
            { title: 'Events', path: '/events', icon: 'bi-calendar-event' },
            { title: 'Contact', path: '/contact', icon: 'bi-envelope' },
        ],

        Spa: [
            { title: 'Home', path: '/', icon: 'bi-house' },
            { title: 'About', path: '/about', icon: 'bi-heart' },
            { title: 'Services', path: '/services', icon: 'bi-scissors' },
            { title: 'Packages', path: '/packages', icon: 'bi-gift' },
            { title: 'Gallery', path: '/gallery', icon: 'bi-images' },
            { title: 'Booking', path: '/booking', icon: 'bi-calendar-check' },
            { title: 'Testimonials', path: '/testimonials', icon: 'bi-chat-quote' },
            { title: 'Contact', path: '/contact', icon: 'bi-envelope' },
        ],

        'Real Estate': [
            { title: 'Home', path: '/', icon: 'bi-house' },
            { title: 'Properties', path: '/properties', icon: 'bi-building' },
            { title: 'Property Map', path: '/property-map', icon: 'bi-map' },
            { title: 'Agents', path: '/agents', icon: 'bi-people' },
            { title: 'Services', path: '/services', icon: 'bi-briefcase' },
            { title: 'Blog', path: '/blog', icon: 'bi-journal' },
            { title: 'Contact', path: '/contact', icon: 'bi-envelope' },
        ],

        Event: [
            { title: 'Home', path: '/', icon: 'bi-house' },
            { title: 'About Event', path: '/about-event', icon: 'bi-info-circle' },
            { title: 'Schedule', path: '/schedule', icon: 'bi-calendar3' },
            { title: 'Speakers', path: '/speakers', icon: 'bi-mic' },
            { title: 'Sponsors', path: '/sponsors', icon: 'bi-building' },
            { title: 'Tickets', path: '/tickets', icon: 'bi-ticket' },
            { title: 'Gallery', path: '/gallery', icon: 'bi-images' },
            { title: 'Contact', path: '/contact', icon: 'bi-envelope' },
        ],
    },

    blog: {
        'Tech Blog': [
            { title: 'Home', path: '/', icon: 'bi-house' },
            { title: 'Articles', path: '/articles', icon: 'bi-journal-code' },
            { title: 'Categories', path: '/categories', icon: 'bi-tags' },
            { title: 'Tutorials', path: '/tutorials', icon: 'bi-code-slash' },
            { title: 'Reviews', path: '/reviews', icon: 'bi-star' },
            { title: 'Resources', path: '/resources', icon: 'bi-folder2-open' },
            { title: 'About', path: '/about', icon: 'bi-person' },
            { title: 'Contact', path: '/contact', icon: 'bi-envelope' },
        ],

        'Travel Blog': [
            { title: 'Home', path: '/', icon: 'bi-house' },
            { title: 'Destinations', path: '/destinations', icon: 'bi-geo-alt' },
            { title: 'Travel Guides', path: '/guides', icon: 'bi-map' },
            { title: 'Experiences', path: '/experiences', icon: 'bi-camera' },
            { title: 'Gallery', path: '/gallery', icon: 'bi-images' },
            { title: 'Tips', path: '/tips', icon: 'bi-lightbulb' },
            { title: 'About', path: '/about', icon: 'bi-person' },
            { title: 'Contact', path: '/contact', icon: 'bi-envelope' },
        ],

        'Food Blog': [
            { title: 'Home', path: '/', icon: 'bi-house' },
            { title: 'Recipes', path: '/recipes', icon: 'bi-book' },
            { title: 'Categories', path: '/categories', icon: 'bi-tags' },
            { title: 'Restaurants', path: '/restaurants', icon: 'bi-shop' },
            { title: 'Reviews', path: '/reviews', icon: 'bi-star' },
            { title: 'Gallery', path: '/gallery', icon: 'bi-images' },
            { title: 'About', path: '/about', icon: 'bi-person' },
            { title: 'Contact', path: '/contact', icon: 'bi-envelope' },
        ],

        'News Blog': [
            { title: 'Home', path: '/', icon: 'bi-house' },
            { title: 'Latest News', path: '/latest-news', icon: 'bi-newspaper' },
            { title: 'Politics', path: '/politics', icon: 'bi-bank' },
            { title: 'Business', path: '/business', icon: 'bi-briefcase' },
            { title: 'Technology', path: '/technology', icon: 'bi-cpu' },
            { title: 'Sports', path: '/sports', icon: 'bi-trophy' },
            { title: 'World', path: '/world', icon: 'bi-globe' },
            { title: 'Contact', path: '/contact', icon: 'bi-envelope' },
        ],

        'Personal Blog': [
            { title: 'Home', path: '/', icon: 'bi-house' },
            { title: 'Blog Posts', path: '/posts', icon: 'bi-journal-text' },
            { title: 'Life Stories', path: '/stories', icon: 'bi-book-half' },
            { title: 'Gallery', path: '/gallery', icon: 'bi-images' },
            { title: 'Projects', path: '/projects', icon: 'bi-kanban' },
            { title: 'About Me', path: '/about', icon: 'bi-person' },
            { title: 'Contact', path: '/contact', icon: 'bi-envelope' },
        ],
    },
    ecommerce: {
        Fashion: [
            { title: 'Home', path: '/', icon: 'bi-house' },
            { title: 'New Arrivals', path: '/new-arrivals', icon: 'bi-stars' },
            { title: 'Men', path: '/men', icon: 'bi-person' },
            { title: 'Women', path: '/women', icon: 'bi-person-heart' },
            { title: 'Collections', path: '/collections', icon: 'bi-grid' },
            { title: 'Sale', path: '/sale', icon: 'bi-percent' },
            { title: 'Cart', path: '/cart', icon: 'bi-cart' },
            { title: 'Contact', path: '/contact', icon: 'bi-envelope' },
        ],

        Electronics: [
            { title: 'Home', path: '/', icon: 'bi-house' },
            { title: 'Products', path: '/products', icon: 'bi-cpu' },
            { title: 'Categories', path: '/categories', icon: 'bi-grid' },
            { title: 'Brands', path: '/brands', icon: 'bi-award' },
            { title: 'Deals', path: '/deals', icon: 'bi-lightning' },
            { title: 'Support', path: '/support', icon: 'bi-headset' },
            { title: 'Cart', path: '/cart', icon: 'bi-cart' },
            { title: 'Contact', path: '/contact', icon: 'bi-envelope' },
        ],

        Books: [
            { title: 'Home', path: '/', icon: 'bi-house' },
            { title: 'Books', path: '/books', icon: 'bi-book' },
            { title: 'Categories', path: '/categories', icon: 'bi-tags' },
            { title: 'Authors', path: '/authors', icon: 'bi-pen' },
            { title: 'Best Sellers', path: '/best-sellers', icon: 'bi-trophy' },
            { title: 'New Releases', path: '/new-releases', icon: 'bi-stars' },
            { title: 'Cart', path: '/cart', icon: 'bi-cart' },
            { title: 'Contact', path: '/contact', icon: 'bi-envelope' },
        ],

        'Digital Products': [
            { title: 'Home', path: '/', icon: 'bi-house' },
            { title: 'Products', path: '/products', icon: 'bi-download' },
            { title: 'Software', path: '/software', icon: 'bi-window' },
            { title: 'Templates', path: '/templates', icon: 'bi-layout-text-window' },
            { title: 'Resources', path: '/resources', icon: 'bi-folder' },
            { title: 'Pricing', path: '/pricing', icon: 'bi-cash-stack' },
            { title: 'Downloads', path: '/downloads', icon: 'bi-cloud-download' },
            { title: 'Contact', path: '/contact', icon: 'bi-envelope' },
        ],

        Food: [
            { title: 'Home', path: '/', icon: 'bi-house' },
            { title: 'Menu', path: '/menu', icon: 'bi-card-list' },
            { title: 'Categories', path: '/categories', icon: 'bi-tags' },
            { title: 'Popular Items', path: '/popular-items', icon: 'bi-fire' },
            { title: 'Offers', path: '/offers', icon: 'bi-percent' },
            { title: 'Delivery', path: '/delivery', icon: 'bi-truck' },
            { title: 'Cart', path: '/cart', icon: 'bi-cart' },
            { title: 'Contact', path: '/contact', icon: 'bi-envelope' },
        ],

        Beauty: [
            { title: 'Home', path: '/', icon: 'bi-house' },
            { title: 'Products', path: '/products', icon: 'bi-bag' },
            { title: 'Skincare', path: '/skincare', icon: 'bi-droplet' },
            { title: 'Makeup', path: '/makeup', icon: 'bi-brush' },
            { title: 'Brands', path: '/brands', icon: 'bi-award' },
            { title: 'Offers', path: '/offers', icon: 'bi-percent' },
            { title: 'Cart', path: '/cart', icon: 'bi-cart' },
            { title: 'Contact', path: '/contact', icon: 'bi-envelope' },
        ],
    },

    booking: {
        Hotel: [
            { title: 'Home', path: '/', icon: 'bi-house' },
            { title: 'Rooms', path: '/rooms', icon: 'bi-door-open' },
            { title: 'Suites', path: '/suites', icon: 'bi-building' },
            { title: 'Facilities', path: '/facilities', icon: 'bi-stars' },
            { title: 'Gallery', path: '/gallery', icon: 'bi-images' },
            { title: 'Booking', path: '/booking', icon: 'bi-calendar-check' },
            { title: 'Offers', path: '/offers', icon: 'bi-percent' },
            { title: 'Contact', path: '/contact', icon: 'bi-envelope' },
        ],

        Homestay: [
            { title: 'Home', path: '/', icon: 'bi-house' },
            { title: 'Rooms', path: '/rooms', icon: 'bi-door-open' },
            { title: 'Experiences', path: '/experiences', icon: 'bi-camera' },
            { title: 'Gallery', path: '/gallery', icon: 'bi-images' },
            { title: 'Reviews', path: '/reviews', icon: 'bi-chat-quote' },
            { title: 'Booking', path: '/booking', icon: 'bi-calendar-check' },
            { title: 'About', path: '/about', icon: 'bi-info-circle' },
            { title: 'Contact', path: '/contact', icon: 'bi-envelope' },
        ],

        Spa: [
            { title: 'Home', path: '/', icon: 'bi-house' },
            { title: 'Services', path: '/services', icon: 'bi-heart' },
            { title: 'Packages', path: '/packages', icon: 'bi-gift' },
            { title: 'Therapists', path: '/therapists', icon: 'bi-person' },
            { title: 'Gallery', path: '/gallery', icon: 'bi-images' },
            { title: 'Booking', path: '/booking', icon: 'bi-calendar-check' },
            { title: 'Testimonials', path: '/testimonials', icon: 'bi-chat-quote' },
            { title: 'Contact', path: '/contact', icon: 'bi-envelope' },
        ],

        Clinic: [
            { title: 'Home', path: '/', icon: 'bi-house' },
            { title: 'Doctors', path: '/doctors', icon: 'bi-person-badge' },
            { title: 'Departments', path: '/departments', icon: 'bi-hospital' },
            { title: 'Services', path: '/services', icon: 'bi-heart-pulse' },
            { title: 'Schedule', path: '/schedule', icon: 'bi-calendar3' },
            { title: 'Appointment', path: '/appointment', icon: 'bi-calendar-check' },
            { title: 'FAQ', path: '/faq', icon: 'bi-question-circle' },
            { title: 'Contact', path: '/contact', icon: 'bi-envelope' },
        ],

        Restaurant: [
            { title: 'Home', path: '/', icon: 'bi-house' },
            { title: 'Menu', path: '/menu', icon: 'bi-card-list' },
            { title: 'Special Dishes', path: '/special-dishes', icon: 'bi-fire' },
            { title: 'Gallery', path: '/gallery', icon: 'bi-images' },
            { title: 'Events', path: '/events', icon: 'bi-calendar-event' },
            { title: 'Reservation', path: '/reservation', icon: 'bi-calendar-check' },
            { title: 'About', path: '/about', icon: 'bi-shop' },
            { title: 'Contact', path: '/contact', icon: 'bi-envelope' },
        ],

        Gym: [
            { title: 'Home', path: '/', icon: 'bi-house' },
            { title: 'Programs', path: '/programs', icon: 'bi-trophy' },
            { title: 'Classes', path: '/classes', icon: 'bi-activity' },
            { title: 'Trainers', path: '/trainers', icon: 'bi-person-workspace' },
            { title: 'Membership', path: '/membership', icon: 'bi-credit-card' },
            { title: 'Schedule', path: '/schedule', icon: 'bi-calendar3' },
            { title: 'Booking', path: '/booking', icon: 'bi-calendar-check' },
            { title: 'Contact', path: '/contact', icon: 'bi-envelope' },
        ],

        'Car Rental': [
            { title: 'Home', path: '/', icon: 'bi-house' },
            { title: 'Vehicles', path: '/vehicles', icon: 'bi-car-front' },
            { title: 'Pricing', path: '/pricing', icon: 'bi-cash-stack' },
            { title: 'Locations', path: '/locations', icon: 'bi-geo-alt' },
            { title: 'Booking', path: '/booking', icon: 'bi-calendar-check' },
            { title: 'Insurance', path: '/insurance', icon: 'bi-shield-check' },
            { title: 'FAQ', path: '/faq', icon: 'bi-question-circle' },
            { title: 'Contact', path: '/contact', icon: 'bi-envelope' },
        ],
    },

    lms: {
        'Online Course': [
            { title: 'Home', path: '/', icon: 'bi-house' },
            { title: 'Courses', path: '/courses', icon: 'bi-book' },
            { title: 'Categories', path: '/categories', icon: 'bi-grid' },
            { title: 'Instructors', path: '/instructors', icon: 'bi-person-video3' },
            { title: 'Learning Path', path: '/learning-path', icon: 'bi-signpost' },
            { title: 'Certificates', path: '/certificates', icon: 'bi-award' },
            { title: 'Blog', path: '/blog', icon: 'bi-journal' },
            { title: 'Contact', path: '/contact', icon: 'bi-envelope' },
        ],

        'Japanese Learning': [
            { title: 'Home', path: '/', icon: 'bi-house' },
            { title: 'JLPT Courses', path: '/jlpt-courses', icon: 'bi-book' },
            { title: 'Vocabulary', path: '/vocabulary', icon: 'bi-card-text' },
            { title: 'Kanji', path: '/kanji', icon: 'bi-pencil-square' },
            { title: 'Grammar', path: '/grammar', icon: 'bi-journal-text' },
            { title: 'Mock Tests', path: '/mock-tests', icon: 'bi-clipboard-check' },
            { title: 'Teachers', path: '/teachers', icon: 'bi-person-workspace' },
            { title: 'Contact', path: '/contact', icon: 'bi-envelope' },
        ],

        'English Learning': [
            { title: 'Home', path: '/', icon: 'bi-house' },
            { title: 'Courses', path: '/courses', icon: 'bi-book' },
            { title: 'Vocabulary', path: '/vocabulary', icon: 'bi-card-text' },
            { title: 'Grammar', path: '/grammar', icon: 'bi-journal-text' },
            { title: 'Speaking', path: '/speaking', icon: 'bi-mic' },
            { title: 'Practice Tests', path: '/practice-tests', icon: 'bi-clipboard-check' },
            { title: 'Teachers', path: '/teachers', icon: 'bi-person-workspace' },
            { title: 'Contact', path: '/contact', icon: 'bi-envelope' },
        ],

        School: [
            { title: 'Home', path: '/', icon: 'bi-house' },
            { title: 'About School', path: '/about', icon: 'bi-building' },
            { title: 'Programs', path: '/programs', icon: 'bi-book' },
            { title: 'Teachers', path: '/teachers', icon: 'bi-person-workspace' },
            { title: 'Admissions', path: '/admissions', icon: 'bi-door-open' },
            { title: 'Events', path: '/events', icon: 'bi-calendar-event' },
            { title: 'News', path: '/news', icon: 'bi-newspaper' },
            { title: 'Contact', path: '/contact', icon: 'bi-envelope' },
        ],

        'Training Center': [
            { title: 'Home', path: '/', icon: 'bi-house' },
            { title: 'Courses', path: '/courses', icon: 'bi-book' },
            { title: 'Schedules', path: '/schedules', icon: 'bi-calendar3' },
            { title: 'Trainers', path: '/trainers', icon: 'bi-person-workspace' },
            { title: 'Certifications', path: '/certifications', icon: 'bi-award' },
            { title: 'Corporate Training', path: '/corporate-training', icon: 'bi-briefcase' },
            { title: 'Blog', path: '/blog', icon: 'bi-journal' },
            { title: 'Contact', path: '/contact', icon: 'bi-envelope' },
        ],

        'Exam Platform': [
            { title: 'Home', path: '/', icon: 'bi-house' },
            { title: 'Exams', path: '/exams', icon: 'bi-clipboard-check' },
            { title: 'Practice Tests', path: '/practice-tests', icon: 'bi-pencil-square' },
            { title: 'Rankings', path: '/rankings', icon: 'bi-trophy' },
            { title: 'Certificates', path: '/certificates', icon: 'bi-award' },
            { title: 'Results', path: '/results', icon: 'bi-bar-chart' },
            { title: 'FAQ', path: '/faq', icon: 'bi-question-circle' },
            { title: 'Contact', path: '/contact', icon: 'bi-envelope' },
        ],
    },
};
