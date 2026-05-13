export type EcommercePresetKey =
  | "cosmetics"
  | "electronics"
  | "accessories"
  | "fashion"
  | "shoes"
  | "home"
  | "stationery"
  | "mother-baby"
  | "food"
  | "sports";

export type LandingPagePresetKey = "business" | "portfolio" | "saas" | "course" | "restaurant" | "agency";

export type PresetCategory = {
  name: string;
  children?: string[];
};

export type EcommercePreset = {
  key: EcommercePresetKey;
  label: string;
  categories: PresetCategory[];
};

export type LandingPagePreset = {
  key: LandingPagePresetKey;
  label: string;
  categories: PresetCategory[];
};

export const WEBSITE_TYPES = [
  {
    value: "ecommerce",
    label: "categoriesAutomation.websiteTypes.ecommerce",
  },

  {
    value: "landing-page",
    label: "categoriesAutomation.websiteTypes.landingPage",
  },

  {
    value: "other",
    label: "categoriesAutomation.websiteTypes.other",
  },
] as const;

export const ECOMMERCE_CATEGORY_PRESETS: EcommercePreset[] = [
  {
    key: "cosmetics",
    label: "categories.cosmetics",

    categories: [
      {
        name: "categories.skincare",

        children: [
          "categories.faceWash",
          "categories.toner",
          "categories.serum",
          "categories.moisturizer",
          "categories.sunscreen",
        ],
      },

      {
        name: "categories.makeup",

        children: [
          "categories.lipstick",
          "categories.powder",
          "categories.foundation",
          "categories.mascara",
          "categories.eyeliner",
        ],
      },

      {
        name: "categories.haircare",

        children: ["categories.shampoo", "categories.conditioner", "categories.hairMask", "categories.hairOil"],
      },

      {
        name: "categories.perfume",

        children: ["categories.menPerfume", "categories.womenPerfume", "categories.bodyMist"],
      },
    ],
  },

  {
    key: "electronics",
    label: "categories.electronics",

    categories: [
      {
        name: "categories.phones",

        children: ["categories.android", "categories.iphone", "categories.phoneAccessories"],
      },

      {
        name: "categories.laptops",

        children: ["categories.officeLaptop", "categories.gamingLaptop", "categories.laptopAccessories"],
      },

      {
        name: "categories.audio",

        children: ["categories.headphones", "categories.speakers", "categories.microphone"],
      },

      {
        name: "categories.smartDevices",

        children: ["categories.smartWatch", "categories.camera", "categories.smartHome"],
      },
    ],
  },

  {
    key: "accessories",
    label: "categories.accessories",

    categories: [
      {
        name: "categories.fashionAccessories",

        children: ["categories.bag", "categories.wallet", "categories.belt", "categories.glasses"],
      },

      {
        name: "categories.techAccessories",

        children: ["categories.charger", "categories.cable", "categories.powerBank", "categories.phoneHolder"],
      },

      {
        name: "categories.jewelry",

        children: ["categories.ring", "categories.bracelet", "categories.necklace", "categories.earrings"],
      },
    ],
  },

  {
    key: "fashion",
    label: "categories.fashion",

    categories: [
      {
        name: "categories.menFashion",

        children: ["categories.tshirt", "categories.shirt", "categories.jeans", "categories.shorts"],
      },

      {
        name: "categories.womenFashion",

        children: ["categories.dress", "categories.blouse", "categories.skirt", "categories.pants"],
      },

      {
        name: "categories.kidsFashion",

        children: ["categories.boyClothes", "categories.girlClothes"],
      },
    ],
  },

  {
    key: "shoes",
    label: "categories.shoes",

    categories: [
      {
        name: "categories.menShoes",

        children: ["categories.sneaker", "categories.leatherShoes", "categories.sandal"],
      },

      {
        name: "categories.womenShoes",

        children: ["categories.highHeels", "categories.womenSneaker", "categories.womenSandal", "categories.flats"],
      },

      {
        name: "categories.slippers",

        children: ["categories.indoorSlippers", "categories.fashionSlippers"],
      },
    ],
  },

  {
    key: "home",
    label: "categories.home",

    categories: [
      {
        name: "categories.kitchen",

        children: ["categories.pot", "categories.knife", "categories.foodContainer"],
      },

      {
        name: "categories.homeAppliances",

        children: ["categories.riceCooker", "categories.blender", "categories.kettle", "categories.fan"],
      },

      {
        name: "categories.homeDecor",

        children: ["categories.lamp", "categories.painting", "categories.curtain"],
      },

      {
        name: "categories.cleaning",

        children: ["categories.mop", "categories.floorCleaner", "categories.vacuum"],
      },
    ],
  },

  {
    key: "stationery",
    label: "categories.stationery",

    categories: [
      {
        name: "categories.writingTools",

        children: ["categories.pen", "categories.pencil", "categories.highlighter"],
      },

      {
        name: "categories.paperNotebook",

        children: ["categories.notebook", "categories.notePaper", "categories.printPaper"],
      },

      {
        name: "categories.officeSupplies",

        children: ["categories.stapler", "categories.paperClip", "categories.fileFolder"],
      },
    ],
  },

  {
    key: "mother-baby",
    label: "categories.motherBaby",

    categories: [
      {
        name: "categories.babyProducts",

        children: ["categories.diaper", "categories.milk", "categories.bottle", "categories.toys"],
      },

      {
        name: "categories.babyFashion",

        children: ["categories.boyFashion", "categories.girlFashion"],
      },

      {
        name: "categories.motherProducts",

        children: ["categories.breastPump", "categories.milkStorageBag", "categories.postpartumCare"],
      },
    ],
  },

  {
    key: "food",
    label: "categories.food",

    categories: [
      {
        name: "categories.snacks",

        children: ["categories.snack", "categories.cake", "categories.candy"],
      },

      {
        name: "categories.drinks",

        children: ["categories.coffee", "categories.tea", "categories.juice"],
      },

      {
        name: "categories.dryFood",

        children: ["categories.noodle", "categories.rice", "categories.nuts", "categories.spices"],
      },
    ],
  },

  {
    key: "sports",
    label: "categories.sports",

    categories: [
      {
        name: "categories.sportswear",

        children: ["categories.sportShirt", "categories.sportPants", "categories.trainingSet"],
      },

      {
        name: "categories.trainingEquipment",

        children: ["categories.dumbbell", "categories.yogaMat", "categories.resistanceBand"],
      },

      {
        name: "categories.sportsAccessories",

        children: ["categories.waterBottle", "categories.gymBag", "categories.gloves"],
      },
    ],
  },
];

export const LANDING_PAGE_PRESETS: LandingPagePreset[] = [
  {
    key: "business",
    label: "categories.business",

    categories: [
      {
        name: "categories.businessSections",

        children: [
          "categories.about",
          "categories.services",
          "categories.pricing",
          "categories.testimonials",
          "categories.contact",
        ],
      },
    ],
  },

  {
    key: "portfolio",
    label: "categories.portfolio",

    categories: [
      {
        name: "categories.portfolioSections",

        children: ["categories.projects", "categories.skills", "categories.experience", "categories.contact"],
      },
    ],
  },

  {
    key: "saas",
    label: "categories.saas",

    categories: [
      {
        name: "categories.saasSections",

        children: ["categories.features", "categories.pricing", "categories.faq", "categories.cta"],
      },
    ],
  },

  {
    key: "course",
    label: "categories.course",

    categories: [
      {
        name: "categories.courseSections",

        children: ["categories.curriculum", "categories.mentor", "categories.reviews", "categories.pricing"],
      },
    ],
  },

  {
    key: "restaurant",
    label: "categories.restaurant",

    categories: [
      {
        name: "categories.restaurantSections",

        children: ["categories.menu", "categories.chef", "categories.booking", "categories.gallery"],
      },
    ],
  },

  {
    key: "agency",
    label: "categories.agency",

    categories: [
      {
        name: "categories.agencySections",

        children: ["categories.services", "categories.projects", "categories.clients", "categories.team"],
      },
    ],
  },
];
