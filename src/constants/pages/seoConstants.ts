export type SEOCategoryConfig = {
    schemaType: string;
    keywordsKey: string;
    descriptionKey: string;
    ogDescriptionKey: string;
};

export const SEO_CATEGORY_CONFIG: Record<string, SEOCategoryConfig> = {
    'Company Profile': {
        schemaType: 'Organization',
        keywordsKey: 'seo.categories.companyProfile.keywords',
        descriptionKey: 'seo.categories.companyProfile.description',
        ogDescriptionKey: 'seo.categories.companyProfile.ogDescription',
    },

    'Personal Profile': {
        schemaType: 'Person',
        keywordsKey: 'seo.categories.personalProfile.keywords',
        descriptionKey: 'seo.categories.personalProfile.description',
        ogDescriptionKey: 'seo.categories.personalProfile.ogDescription',
    },

    Portfolio: {
        schemaType: 'CreativeWork',
        keywordsKey: 'seo.categories.portfolio.keywords',
        descriptionKey: 'seo.categories.portfolio.description',
        ogDescriptionKey: 'seo.categories.portfolio.ogDescription',
    },

    Agency: {
        schemaType: 'Organization',
        keywordsKey: 'seo.categories.agency.keywords',
        descriptionKey: 'seo.categories.agency.description',
        ogDescriptionKey: 'seo.categories.agency.ogDescription',
    },

    Product: {
        schemaType: 'Product',
        keywordsKey: 'seo.categories.product.keywords',
        descriptionKey: 'seo.categories.product.description',
        ogDescriptionKey: 'seo.categories.product.ogDescription',
    },

    Service: {
        schemaType: 'Organization',
        keywordsKey: 'seo.categories.service.keywords',
        descriptionKey: 'seo.categories.service.description',
        ogDescriptionKey: 'seo.categories.service.ogDescription',
    },

    Restaurant: {
        schemaType: 'Restaurant',
        keywordsKey: 'seo.categories.restaurant.keywords',
        descriptionKey: 'seo.categories.restaurant.description',
        ogDescriptionKey: 'seo.categories.restaurant.ogDescription',
    },

    Spa: {
        schemaType: 'BeautySalon',
        keywordsKey: 'seo.categories.spa.keywords',
        descriptionKey: 'seo.categories.spa.description',
        ogDescriptionKey: 'seo.categories.spa.ogDescription',
    },

    'Real Estate': {
        schemaType: 'RealEstateAgent',
        keywordsKey: 'seo.categories.realEstate.keywords',
        descriptionKey: 'seo.categories.realEstate.description',
        ogDescriptionKey: 'seo.categories.realEstate.ogDescription',
    },

    Event: {
        schemaType: 'Event',
        keywordsKey: 'seo.categories.event.keywords',
        descriptionKey: 'seo.categories.event.description',
        ogDescriptionKey: 'seo.categories.event.ogDescription',
    },

    'Tech Blog': {
        schemaType: 'Blog',
        keywordsKey: 'seo.categories.techBlog.keywords',
        descriptionKey: 'seo.categories.techBlog.description',
        ogDescriptionKey: 'seo.categories.techBlog.ogDescription',
    },

    'Travel Blog': {
        schemaType: 'Blog',
        keywordsKey: 'seo.categories.travelBlog.keywords',
        descriptionKey: 'seo.categories.travelBlog.description',
        ogDescriptionKey: 'seo.categories.travelBlog.ogDescription',
    },

    'Food Blog': {
        schemaType: 'Blog',
        keywordsKey: 'seo.categories.foodBlog.keywords',
        descriptionKey: 'seo.categories.foodBlog.description',
        ogDescriptionKey: 'seo.categories.foodBlog.ogDescription',
    },

    'News Blog': {
        schemaType: 'NewsArticle',
        keywordsKey: 'seo.categories.newsBlog.keywords',
        descriptionKey: 'seo.categories.newsBlog.description',
        ogDescriptionKey: 'seo.categories.newsBlog.ogDescription',
    },

    'Personal Blog': {
        schemaType: 'Blog',
        keywordsKey: 'seo.categories.personalBlog.keywords',
        descriptionKey: 'seo.categories.personalBlog.description',
        ogDescriptionKey: 'seo.categories.personalBlog.ogDescription',
    },

    Fashion: {
        schemaType: 'Store',
        keywordsKey: 'seo.categories.fashion.keywords',
        descriptionKey: 'seo.categories.fashion.description',
        ogDescriptionKey: 'seo.categories.fashion.ogDescription',
    },

    Electronics: {
        schemaType: 'Store',
        keywordsKey: 'seo.categories.electronics.keywords',
        descriptionKey: 'seo.categories.electronics.description',
        ogDescriptionKey: 'seo.categories.electronics.ogDescription',
    },

    Books: {
        schemaType: 'Store',
        keywordsKey: 'seo.categories.books.keywords',
        descriptionKey: 'seo.categories.books.description',
        ogDescriptionKey: 'seo.categories.books.ogDescription',
    },

    'Digital Products': {
        schemaType: 'Store',
        keywordsKey: 'seo.categories.digitalProducts.keywords',
        descriptionKey: 'seo.categories.digitalProducts.description',
        ogDescriptionKey: 'seo.categories.digitalProducts.ogDescription',
    },

    Food: {
        schemaType: 'Store',
        keywordsKey: 'seo.categories.food.keywords',
        descriptionKey: 'seo.categories.food.description',
        ogDescriptionKey: 'seo.categories.food.ogDescription',
    },

    Beauty: {
        schemaType: 'Store',
        keywordsKey: 'seo.categories.beauty.keywords',
        descriptionKey: 'seo.categories.beauty.description',
        ogDescriptionKey: 'seo.categories.beauty.ogDescription',
    },

    Hotel: {
        schemaType: 'Hotel',
        keywordsKey: 'seo.categories.hotel.keywords',
        descriptionKey: 'seo.categories.hotel.description',
        ogDescriptionKey: 'seo.categories.hotel.ogDescription',
    },

    Homestay: {
        schemaType: 'LodgingBusiness',
        keywordsKey: 'seo.categories.homestay.keywords',
        descriptionKey: 'seo.categories.homestay.description',
        ogDescriptionKey: 'seo.categories.homestay.ogDescription',
    },

    Clinic: {
        schemaType: 'MedicalClinic',
        keywordsKey: 'seo.categories.clinic.keywords',
        descriptionKey: 'seo.categories.clinic.description',
        ogDescriptionKey: 'seo.categories.clinic.ogDescription',
    },

    Gym: {
        schemaType: 'SportsActivityLocation',
        keywordsKey: 'seo.categories.gym.keywords',
        descriptionKey: 'seo.categories.gym.description',
        ogDescriptionKey: 'seo.categories.gym.ogDescription',
    },

    'Car Rental': {
        schemaType: 'AutoRental',
        keywordsKey: 'seo.categories.carRental.keywords',
        descriptionKey: 'seo.categories.carRental.description',
        ogDescriptionKey: 'seo.categories.carRental.ogDescription',
    },

    'Online Course': {
        schemaType: 'EducationalOrganization',
        keywordsKey: 'seo.categories.onlineCourse.keywords',
        descriptionKey: 'seo.categories.onlineCourse.description',
        ogDescriptionKey: 'seo.categories.onlineCourse.ogDescription',
    },

    'Japanese Learning': {
        schemaType: 'EducationalOrganization',
        keywordsKey: 'seo.categories.japaneseLearning.keywords',
        descriptionKey: 'seo.categories.japaneseLearning.description',
        ogDescriptionKey: 'seo.categories.japaneseLearning.ogDescription',
    },

    'English Learning': {
        schemaType: 'EducationalOrganization',
        keywordsKey: 'seo.categories.englishLearning.keywords',
        descriptionKey: 'seo.categories.englishLearning.description',
        ogDescriptionKey: 'seo.categories.englishLearning.ogDescription',
    },

    School: {
        schemaType: 'EducationalOrganization',
        keywordsKey: 'seo.categories.school.keywords',
        descriptionKey: 'seo.categories.school.description',
        ogDescriptionKey: 'seo.categories.school.ogDescription',
    },

    'Training Center': {
        schemaType: 'EducationalOrganization',
        keywordsKey: 'seo.categories.trainingCenter.keywords',
        descriptionKey: 'seo.categories.trainingCenter.description',
        ogDescriptionKey: 'seo.categories.trainingCenter.ogDescription',
    },

    'Exam Platform': {
        schemaType: 'EducationalOrganization',
        keywordsKey: 'seo.categories.examPlatform.keywords',
        descriptionKey: 'seo.categories.examPlatform.description',
        ogDescriptionKey: 'seo.categories.examPlatform.ogDescription',
    },
};
