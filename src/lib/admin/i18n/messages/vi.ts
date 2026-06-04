const vi = {
  common: {
    error: "Lỗi",
    refresh: "Làm mới",
    sort: "Sắp xếp theo",
    clear: "Xóa",
    noDate: "(không có ngày)",
    success: "Thành công",
    cancel: "Hủy",
    save: "Lưu",
    delete: "Xóa",
    edit: "Chỉnh sửa",
  },
  months: {
    jan: "Th1",
    feb: "Th2",
    mar: "Th3",
    apr: "Th4",
    may: "Th5",
    jun: "Th6",
    jul: "Th7",
    aug: "Th8",
    sep: "Th9",
    oct: "Th10",
    nov: "Th11",
    dec: "Th12",
  },

  sites: {
    form: {
      title: "Biểu mẫu Website",
      sub: "Quản lý website của bạn",
      siteName: "Tên Website",
      domain: "Tên miền",
      websiteType: "Loại Website",
      status: "Trạng thái",
      publishedAt: "Ngày xuất bản",
      publicSite: "Website công khai",
      created: "Ngày tạo",
      updated: "Cập nhật",
      reset: "Đặt lại",
      createSite: "Tạo Website",
      saveChanges: "Lưu thay đổi",
      selectSite: "Chọn một website",
    },

    table: {
      title: "Quản lý Website",
      search: "Tìm kiếm website...",
      site: "Website",
      domain: "Tên miền",
      status: "Trạng thái",
      visibility: "Hiển thị",
      type: "Loại",
      updated: "Cập nhật",
      action: "Hành động",
      noSites: "Không tìm thấy website",
      edit: "Chỉnh sửa",
      delete: "Xóa",
      public: "Công khai",
      private: "Riêng tư",
      newSite: "Website mới",
    },

    types: {
      landing: "Landing Page",
      blog: "Blog",
      company: "Công ty",
      ecommerce: "Thương mại điện tử",
      booking: "Đặt lịch",
      news: "Tin tức",
      lms: "LMS",
      directory: "Danh mục",
    },

    validation: {
      siteNameRequired: "Tên website là bắt buộc",
      min3: "Tối thiểu 3 ký tự",
      max100: "Tối đa 100 ký tự",
      invalidCharacters: "Ký tự không hợp lệ",
      domainRequired: "Tên miền là bắt buộc",
      domainTooLong: "Tên miền quá dài",
      invalidDomain: "Tên miền không hợp lệ",
      invalidType: "Loại website không hợp lệ",
    },

    messages: {
      planLimitTitle: "Đã đạt giới hạn gói",
      planLimitDesc: "Gói hiện tại chỉ cho phép {count} website",
      createFailed: "Tạo thất bại",
      createFailedDesc: "Không thể tạo website",
      createSuccess: 'Đã tạo "{name}" thành công',
      updateSuccess: 'Đã cập nhật "{name}" thành công',
      updateFailed: "Cập nhật thất bại",
      updateFailedDesc: "Đã xảy ra lỗi khi cập nhật website",
      deleteTitle: "Xóa website?",
      deleteDesc: 'Xóa "{name}"? Hành động này không thể hoàn tác.',
      deleteSuccess: 'Đã xóa "{name}" thành công',
      deleteFailed: "Xóa thất bại",
      deleteFailedDesc: "Đã xảy ra lỗi khi xóa website",
      missingSite: "Thiếu website",
      selectSiteFirst: "Vui lòng chọn website trước",
      success: "Thành công",
    },
    status: { draft: "Bản nháp", active: "Hoạt động", suspended: "Tạm khóa" },
  },
  menus: {
    dashboard: "Bảng điều khiển",
    email: "Email",
    analytics: "Phân tích",
    calendar: "Lịch",
    catalog: "Danh mục",
    website: "Website",
    menus: "Menu",
    pages: "Trang",
    products: "Sản phẩm",
    categories: "Danh mục sản phẩm",
    brands: "Thương hiệu",
    settings: "Cài đặt",
    sites: "sites",
    manager: "Quản trị",
    dashboardPanel: "Bảng điều khiển",
    orders: "Đơn hàng",
    payments: "Thanh toán",
    templates: "Mẫu giao diện",
    permission: "Phân quyền",
    profile: "Hồ sơ",
    upload: "Tải lên",
    images: "Hình ảnh",
    files: "Tệp tin",
    seo: "SEO",
    facebook: "Facebook",
    tiktok: "TikTok",
    users: "Người dùng",
    chat: "Trò chuyện",
    template_email: "Mẫu Email",
    history: "Lịch sử",
    inventory: "Kho hàng",
    "low-stock": "Sắp hết hàng",
    list: "Danh sách tồn kho",
    aria: {
      chooseSite: "Chọn website",
      siteKind: "Loại website",
    },
    misc: {
      noSites: "Không có website",
    },
    search: {
      placeholder: "Tìm theo tiêu đề hoặc đường dẫn...",
      ariaLabel: "Tìm trong menu",
    },
    status: {
      saving: "Đang lưu dữ liệu...",
      loading: "Đang tải dữ liệu...",
      syncing: "Đang đồng bộ dữ liệu...",
    },
    actions: {
      autoGenerate: "Tạo tự động",
      autoGenerateTitle: "Tạo menu mặc định theo loại website",
      addNewItem: "Thêm mục mới",
      addNewItemTitle: "Thêm mục menu mới",
      saveChanges: "Lưu thay đổi",
      saveChangesTitle: "Lưu thay đổi",
      clearFilter: "Xóa lọc",
      clearFilterTitle: "Xóa bộ lọc tìm kiếm",
      importPrompt: "Vui lòng dán dữ liệu JSON menu vào bên dưới.",
      importSuccessTitle: "Import thành công",
      importSuccessMessage: "Cấu trúc menu đã được cập nhật.",
      autoCreateConfirm:
        'Hệ thống sẽ tạo lại menu mặc định cho "{siteKind}" và ghi đè dữ liệu hiện tại. Bạn có muốn tiếp tục không?',
      autoCreateSuccessTitle: "Tạo menu tự động thành công",
      autoCreateSuccessMessage: 'Đã tạo cấu trúc menu mặc định cho loại website "{siteKind}".',
      close: "Đóng",
      save: "Lưu",
    },
    errors: {
      cannotRefreshTitle: "Không thể làm mới dữ liệu",
      cannotLoadTitle: "Không thể tải dữ liệu",
      cannotImportTitle: "Không thể import dữ liệu",
      noWebsiteSelectedTitle: "Chưa chọn website",
      noWebsiteSelectedMessage: "Vui lòng chọn website trước khi lưu.",
    },
    link: {
      internal: "Trang nội bộ",
      external: "Liên kết ngoài",
      scheduled: "Liên kết theo lịch",
    },
    edit: {
      title: "Chỉnh sửa mục menu",
      titleLabel: "Tiêu đề",
      iconLabel: "Biểu tượng",
      basicInformation: "Thông tin cơ bản",
      linkSettings: "Thiết lập liên kết",
      pathPreview: "Đường dẫn và xem trước",
      linkType: "Loại liên kết",
      selectPage: "Chọn trang nội bộ",
      externalUrl: "URL bên ngoài",
      openInNewTab: "Mở ở tab mới",
      schedulePoints: "Mốc thời gian",
      addPoint: "Thêm mốc",
      noSchedulePoints: "Chưa có mốc thời gian",
      noSchedulePointsHelp: "Chọn “Thêm mốc” để cấu hình liên kết theo lịch.",
      schedulePointsHelp: "Thêm các mốc thời gian để tự động đổi URL theo thời điểm đã cấu hình.",
      pathSavedToDatabase: "Đường dẫn lưu vào cơ sở dữ liệu",
      pathPlaceholder: "/duong-dan hoặc https://...",
      scheduledPathPlaceholder: "(Liên kết theo lịch sẽ không lưu đường dẫn cố định.)",
      pathAutoHelp: "Để trống = hệ thống sẽ tự động tính toán.",
      previewUrl: "URL xem trước",
      childrenOf: "Mục con của",
      menuSet: "Bộ menu",
      copied: "Đã sao chép",
      copy: "Sao chép",
      saving: "Đang lưu...",
      saveChanges: "Lưu thay đổi",
      close: "Đóng",
      delete: "Xóa",
      bootstrapIcons: "Bootstrap Icons",
      iconPlaceholder: "Ví dụ: bi-house-door, bi-bag",
      cannotUpdate: "Không thể cập nhật dữ liệu.",
      unknownError: "Đã xảy ra lỗi không xác định.",
    },
    allowedBlocks: {
      addSuccessTitle: "Đã thêm block thành công",
      addSuccessMessage: 'Block "{name}" đã được thêm vào menu.',
      addErrorTitle: "Không thể thêm block",
      addErrorMessage: "Đã xảy ra lỗi khi thêm block.",
      baseBlockTooltip: "Bấm hoặc kéo để thêm block",
      suggestionsAria: "Các block gợi ý",
      noMoreSuggestions: "Không còn gợi ý nào.",
      suggestChipTooltip: "Bấm hoặc kéo để thêm block gợi ý",
      groups: {
        productExperience: "Trải nghiệm sản phẩm",
        trustConversion: "Niềm tin & Chuyển đổi",
        orderAfterSale: "Đơn hàng & Hậu mãi",
        contentGrowth: "Nội dung & Tăng trưởng",
        engagement: "Tương tác",
        utilities: "Tiện ích",
        hero: "Phần giới thiệu",
        marketing: "Marketing",
        trust: "Độ tin cậy",
        conversion: "Chuyển đổi",
        content: "Nội dung",
        company: "Công ty",
        support: "Hỗ trợ",
        legal: "Pháp lý",
      },
      items: {
        productDetail: "Chi tiết sản phẩm",
        productReviews: "Đánh giá sản phẩm",
        compareProducts: "So sánh sản phẩm",
        recentlyViewed: "Đã xem gần đây",
        relatedProducts: "Sản phẩm liên quan",
        customerReviews: "Đánh giá khách hàng",
        testimonials: "Phản hồi khách hàng",
        warrantyPolicy: "Chính sách bảo hành",
        returnProcess: "Quy trình đổi trả",
        paymentMethods: "Phương thức thanh toán",
        orderTracking: "Theo dõi đơn hàng",
        trackMyOrder: "Kiểm tra đơn hàng",
        orderHistory: "Lịch sử đơn hàng",
        reorder: "Đặt lại",
        news: "Tin tức",
        press: "Báo chí",
        promotionsDetail: "Chi tiết khuyến mãi",
        campaigns: "Chiến dịch",
        notifications: "Thông báo",
        subscriptions: "Đăng ký",
        newsletter: "Bản tin",
        loyaltyProgram: "Chương trình khách hàng thân thiết",
        rewardPoints: "Điểm thưởng",
        storeLocator: "Tìm cửa hàng",
        sizeGuide: "Hướng dẫn kích thước",
        helpCenter: "Trung tâm trợ giúp",
        liveChat: "Chat trực tuyến",
        heroBanner: "Banner chính",
        heroCTA: "Nút kêu gọi hành động",
        introSection: "Giới thiệu",

        features: "Tính năng",
        services: "Dịch vụ",
        pricing: "Bảng giá",
        comparison: "So sánh",

        customerLogos: "Logo khách hàng",
        caseStudies: "Case study",
        successStories: "Câu chuyện thành công",

        callToAction: "Kêu gọi hành động",
        signup: "Đăng ký",
        login: "Đăng nhập",
        getStarted: "Bắt đầu",

        blog: "Blog",
        blogDetail: "Chi tiết bài viết",

        about: "Về chúng tôi",
        team: "Đội ngũ",
        careers: "Tuyển dụng",
        portfolio: "Dự án",

        faq: "Câu hỏi thường gặp",
        contact: "Liên hệ",

        privacyPolicy: "Chính sách bảo mật",
        terms: "Điều khoản",
      },
      history: "Lịch sử",
      inventory: "Kho hàng",
      lowStock: "Sắp hết hàng",
      listInventory: "Danh sách kho",
    },
    menuStructure: {
      untitled: "(Chưa có tiêu đề)",
      main: "Chính",
      sub: "Phụ",
      childrenOf: "Mục con của",
      dragToCreateSubmenu: "Kéo thả mục vào đây để tạo menu con (Cấp 2)",
      dragToCreateLevel1: "Kéo thả block vào đây để tạo menu chính (Cấp 1)",
      noMatchingResults: "Không tìm thấy kết quả phù hợp",
      editItem: "Chỉnh sửa mục menu",
      deleteItem: "Xóa mục này",
      confirmDeleteTitle: "Xóa mục menu?",
      confirmDeleteMessage: 'Bạn có chắc chắn muốn xóa "{name}"? Hành động này không thể hoàn tác.',
      deleteSuccessTitle: "Đã xóa mục menu thành công",
      deleteSuccessMessage: 'Đã xóa "{name}" khỏi cấu trúc menu.',
      deleteErrorTitle: "Không thể xóa mục menu",
      deleteErrorMessage: "Đã xảy ra lỗi khi xóa mục menu.",
      invalidBlockData: "Dữ liệu block không hợp lệ hoặc bị hỏng.",
    },
    landing: {
      home: "Trang chủ",
      about: "Về chúng tôi",
      team: "Đội ngũ",
      careers: "Tuyển dụng",
      partners: "Đối tác",
      services: "Dịch vụ",
      features: "Tính năng",
      solutions: "Giải pháp",
      pricing: "Bảng giá",
      products: "Sản phẩm",
      productDetail: "Chi tiết sản phẩm",
      portfolio: "Dự án",
      courses: "Khóa học",
      courseDetail: "Chi tiết khóa học",
      testimonials: "Đánh giá",
      faq: "Câu hỏi thường gặp",
      newsletter: "Bản tin",
      blog: "Blog",
      blogDetail: "Chi tiết bài viết",
      login: "Đăng nhập",
      signup: "Đăng ký",
      forgotPassword: "Quên mật khẩu",
      getStarted: "Bắt đầu",
      bookDemo: "Đặt lịch demo",
      contact: "Liên hệ",
      helpCenter: "Trung tâm trợ giúp",
      liveChat: "Chat trực tuyến",
      privacyPolicy: "Chính sách bảo mật",
      terms: "Điều khoản sử dụng",
      notFound: "Không tìm thấy trang",
    },
    siteKinds: {
      ecommerce: "Thương mại điện tử",
      landing: "Landing Page",
      blog: "Blog",
      booking: "Đặt lịch",
      news: "Tin tức",
      lms: "Hệ thống học tập",
    },

    subtypes: {
      select: "Chọn loại website",

      landing: {
        product: "Landing bán sản phẩm",
        service: "Landing dịch vụ",
        course: "Landing khóa học",
        startup: "Landing startup",
        event: "Landing sự kiện",
      },

      ecommerce: {
        fashion: "Cửa hàng thời trang",
        electronics: "Cửa hàng điện tử",
        marketplace: "Sàn thương mại điện tử",
        dropshipping: "Cửa hàng Dropshipping",
      },

      blog: {
        personal: "Blog cá nhân",
        tech: "Blog công nghệ",
        travel: "Blog du lịch",
      },

      booking: {
        hotel: "Đặt phòng khách sạn",
        restaurant: "Đặt bàn nhà hàng",
        spa: "Đặt lịch spa",
      },

      news: {
        local: "Tin tức địa phương",
        tech: "Tin tức công nghệ",
        finance: "Tin tức tài chính",
      },

      lms: {
        school: "Hệ thống trường học",
        course: "Nền tảng khóa học",
        training: "Nền tảng đào tạo",
      },
    },

    states: {
      saving: "Đang lưu...",
      loading: "Đang tải...",
    },

    messages: {
      saved: "Đã lưu",
      savedDesc: "Menu đã được lưu thành công",
      error: "Lỗi",
    },
  },
  pages: {
    home: "Trang chủ",
    shop: "Cửa hàng",
    products: "Sản phẩm",
    categories: "Danh mục",
    collections: "Bộ sưu tập",
    brands: "Thương hiệu",
    featured: "Nổi bật",
    trending: "Xu hướng",
    newArrivals: "Hàng mới về",
    bestSellers: "Bán chạy",
    flashSale: "Flash Sale",
    deals: "Ưu đãi",
    offers: "Khuyến mãi",
    coupons: "Mã giảm giá",
    giftCards: "Thẻ quà tặng",
    wishlist: "Yêu thích",
    cart: "Giỏ hàng",
    checkout: "Thanh toán",
    account: "Tài khoản của tôi",
    orders: "Đơn hàng của tôi",
    orderTracking: "Theo dõi đơn hàng",
    addresses: "Địa chỉ",
    about: "Về chúng tôi",
    contact: "Liên hệ",
    faq: "Câu hỏi thường gặp",
    blog: "Blog",
    shippingInfo: "Thông tin giao hàng",
    returnPolicy: "Chính sách đổi trả",
    sizeGuide: "Hướng dẫn kích thước",
    privacyPolicy: "Chính sách bảo mật",
    terms: "Điều khoản & Điều kiện",
    newItem: "Mục mới",
    pageInspector: {
      noDate: "(không có ngày)",
      loadSeoFailed: "Không thể tải dữ liệu SEO.",
      newPage: "Trang mới",
      autoSeoCompleted: "Tạo SEO tự động thành công.",
      saveSeoFailed: "Không thể lưu dữ liệu SEO.",
      saveSeoSuccess: "Lưu SEO thành công.",
      saveSeoError: "Đã xảy ra lỗi khi lưu SEO.",
      missingSite: "Thiếu website",
      currentSiteNotFound: "Không tìm thấy website hiện tại.",
      missingTitle: "Thiếu tiêu đề",
      pleaseEnterTitle: "Vui lòng nhập tiêu đề.",
      missingSlug: "Thiếu slug",
      pleaseEnterSlug: "Vui lòng nhập slug.",
      syncPageFailed: "Không thể đồng bộ trang.",
      syncPageSuccess: "Đồng bộ trang thành công.",
      syncPageError: "Đã xảy ra lỗi khi đồng bộ trang.",
      deletePageTitle: "Xóa trang",
      deletePageConfirm: 'Bạn có chắc muốn xóa "{title}" không?',
      thisPage: "trang này",

      preview: "Xem trước",
      delete: "Xóa",
      sync: "Đồng bộ",
      edit: "Chỉnh sửa",
      autoSeo: "SEO tự động",
      saving: "Đang lưu...",
      saveSeo: "Lưu SEO",
      unpublish: "Gỡ xuất bản",
      publish: "Xuất bản",

      untitled: "Chưa có tiêu đề",
      path: "Đường dẫn",
      status: "Trạng thái",
      published: "Đã xuất bản",
      draft: "Bản nháp",
      updatedAt: "Cập nhật lúc",
      emptyState: "Hãy chọn một trang để xem chi tiết và chỉnh SEO.",

      metaTitle: "Meta title",
      metaTitleRange: "/ 60–70",
      titlePlaceholder: "Nhập tiêu đề trang",
      ogTitle: "OG title",
      twitterCard: "Twitter card",
      choices: "Tùy chọn",
      noindex: "noindex",
      nofollow: "nofollow",

      metaDescription: "Meta description",
      metaDescriptionRange: "/ 150–160",
      metaDescriptionPlaceholder: "Nhập mô tả meta",
      keywordsOptional: "Từ khóa (tùy chọn)",
      keywordsPlaceholder: "từ khóa 1, từ khóa 2, từ khóa 3",
      canonicalUrl: "Canonical URL",
      canonicalUrlPlaceholder: "https://example.com/your-page",

      ogDescription: "OG description",
      ogImageUrl: "URL ảnh OG",
      ogImageHelper: "Ảnh đề xuất khi chia sẻ mạng xã hội",
      ogImagePlaceholder: "https://...",

      sitemapChangefreq: "Tần suất cập nhật sitemap",
      sitemapPriority: "Độ ưu tiên sitemap",
      structuredData: "Structured data",
      structuredDataPlaceholder: '{"@context":"https://schema.org","@type":"WebPage","name":"..."}',

      syncModalTitle: "Tạo và đồng bộ trang",
      close: "Đóng",
      closeIcon: "✕",
      site: "Website",
      currentSite: "Website hiện tại",
      usingCurrentSite: 'Đang dùng website hiện tại: "{site}"',
      title: "Tiêu đề",
      enterTitle: "Nhập tiêu đề",
      slug: "Slug",
      slugPlaceholder: "profile",
      slugHelper: "Slug được dùng để tạo đường dẫn trang.",
      pathPlaceholder: "/account/profile",
      syncHintPrefix: "Thao tác này sẽ",
      createAndSync: "tạo và đồng bộ",
      syncHintSuffix: "trang vào website hiện tại với payload sau:",
      syncing: "Đang đồng bộ...",

      yourSiteId: "site-id-cua-ban",
      yourTitle: "Tiêu đề của bạn",
      slugExample: "profile",
      pathExample: "/account/profile",

      twitterCardOptions: {
        summaryLargeImage: "Ảnh lớn",
        summary: "Tóm tắt",
      },

      changefreq: {
        always: "Luôn luôn",
        hourly: "Hàng giờ",
        daily: "Hàng ngày",
        weekly: "Hàng tuần",
        monthly: "Hàng tháng",
        yearly: "Hàng năm",
        never: "Không bao giờ",
      },
    },
  },
  adminEmail: {
    templates: {
      welcome: {
        name: "Chào mừng",
        subject: "Chào mừng bạn đến với nền tảng của chúng tôi",
        description: "Dùng cho onboarding và chào đón người dùng mới.",
        content:
          "Xin chào {{name}},\n\nCảm ơn bạn đã tham gia nền tảng của chúng tôi.\nChúng tôi rất vui khi có bạn đồng hành.\n\nTrân trọng,",
      },
      promotion: {
        name: "Khuyến mãi",
        subject: "Đặt hàng ngay và nhận miễn phí giao hàng",
        description: "Dùng cho ưu đãi, giảm giá và các chiến dịch sản phẩm.",
        content: "Nhấn vào bên dưới để hoàn tất đơn hàng và nhập mã ưu đãi độc quyền để được miễn phí giao hàng.",
      },
      reminder: {
        name: "Nhắc nhở",
        subject: "Nhắc nhở quan trọng",
        description: "Dùng để nhắc người dùng về các thao tác chưa hoàn tất hoặc cập nhật quan trọng.",
        content:
          "Xin chào {{name}},\n\nĐây là lời nhắc liên quan đến hoạt động gần đây của bạn.\nVui lòng xem thông tin mới nhất.\n\nTrân trọng,",
      },
    },

    defaults: {
      previewText: "Xem nhanh nội dung email.",
      ctaUrl: "https://your-landing-page.com",
      unknownTemplate: "Mẫu không xác định",
      avatarFallback: "C",
      previewCampaignFallback: "Xem trước chiến dịch",
      previewNoSubject: "(Không có tiêu đề)",
      emptyValue: "--",
    },

    status: {
      draft: "Bản nháp",
      queued: "Đang chờ",
      scheduled: "Đã lên lịch",
      sent: "Đã gửi",
      partial: "Gửi một phần",
      failed: "Thất bại",
      cancelled: "Đã huỷ",
    },

    providerOptions: {
      SMTP: "SMTP",
      RESEND: "RESEND",
      SENDGRID: "SENDGRID",
    },

    emailTypeOptions: {
      SYSTEM: "SYSTEM",
      TEMPLATE: "TEMPLATE",
      BULK: "BULK",
      TEST: "TEST",
    },

    templateDefaults: {
      promotion: {
        ctaText: "Hoàn tất đơn hàng",
        promoCode: "AC41FD2P",
        productName: "Mounjaro Kwikpen",
        productImage: "/image.png",
        benefitsText:
          "Thuốc kê đơn đã được chứng minh lâm sàng\nGiảm cảm giác đói và thèm ăn\nKèm hỗ trợ lâm sàng để đánh giá tiến trình",
      },
      reminder: {
        ctaText: "Xem ngay",
        promoCode: "",
        productName: "Danh sách việc cần làm",
        productImage: "",
        benefitsText: "Hoàn tất bước còn thiếu\nXem lại hoạt động gần đây\nTiếp tục từ nơi bạn đã dừng",
      },
      welcome: {
        ctaText: "Bắt đầu",
        promoCode: "",
        productName: "Hướng dẫn bắt đầu",
        productImage: "",
        benefitsText: "Thiết lập nhanh\nOnboarding dễ dàng\nHỗ trợ hữu ích",
      },
    },

    messages: {
      waitingUserContext: "Đang chờ thông tin người dùng để tải lịch sử email.",
      failedLoadCampaigns: "Không thể tải danh sách chiến dịch email.",
      missingSiteContext: "Thiếu thông tin site.",
      failedLoadSystemCredential: "Không thể tải cấu hình email hệ thống.",
      noSystemCredentialFound: "Không tìm thấy cấu hình email hệ thống cho site này.",
      missingUserContext: "Thiếu thông tin người dùng.",
      enterCampaignName: "Vui lòng nhập tên chiến dịch.",
      selectTemplate: "Vui lòng chọn template.",
      enterEmailSubject: "Vui lòng nhập tiêu đề email.",
      enterPreviewText: "Vui lòng nhập preview text.",
      missingSenderName: "Thiếu tên người gửi hệ thống. Vui lòng cấu hình Email Settings trước.",
      invalidSenderEmail:
        "Email người gửi hệ thống bị thiếu hoặc không hợp lệ. Vui lòng cấu hình Email Settings trước.",
      invalidReplyToEmail: "Email reply-to của hệ thống không hợp lệ. Vui lòng cấu hình Email Settings trước.",
      invalidCtaUrl: "Vui lòng nhập CTA URL hợp lệ.",
      invalidScheduledAt: "Vui lòng nhập ngày giờ hợp lệ.",
      enterAtLeastOneEmail: "Vui lòng nhập ít nhất 1 địa chỉ email hợp lệ.",
      sendingError: "Đã xảy ra lỗi khi gửi email.",
      requestCompleted: "Yêu cầu đã hoàn tất.",
      status: "Trạng thái",
      success: "Thành công",
      failed: "Thất bại",
      loadingCampaigns: "Đang tải chiến dịch...",
      noCampaignsFound: "Không tìm thấy chiến dịch nào.",
      loadingEmailCredential: "Đang tải cấu hình email...",
      invalidEmailAddresses: "Địa chỉ email không hợp lệ",
    },

    sidebar: {
      searchPlaceholder: "Tìm kiếm chiến dịch",
      recipientsSuffix: "người nhận",
    },

    sections: {
      accountContext: "Thông tin tài khoản",
      messageMetadata: "Metadata email",
      messageMetadataDesc: "Các trường map trực tiếp tới Email model.",
      messageContent: "Nội dung email",
      messageContentDesc: "Các trường dùng để xây dựng nội dung email cuối cùng.",
      ctaAndDestination: "CTA & liên kết đích",
      ctaAndDestinationDesc: "Nội dung nút và URL chuyển đổi.",
      offerProductDetails: "Thông tin ưu đãi & sản phẩm",
      offerProductDetailsDesc: "Các trường riêng cho template khuyến mãi.",
      welcomeDetails: "Thông tin chào mừng",
      welcomeDetailsDesc: "Các trường riêng cho email onboarding.",
      reminderDetails: "Thông tin nhắc nhở",
      reminderDetailsDesc: "Các trường riêng cho email nhắc nhở.",
      recipients: "Người nhận",
      recipientsDesc: "Các trường này map tới EmailRecipient records.",
      reviewInformation: "Thông tin rà soát",
      reviewInformationDesc: "Kiểm tra payload trước khi gửi.",
      emailPreview: "Xem trước email",
    },

    fields: {
      userId: "User ID",
      siteId: "Site ID",
      workspace: "Workspace",
      siteName: "Tên site",
      campaignName: "Tên chiến dịch",
      templateKey: "Template key",
      batchSize: "Kích thước batch",
      templateDescription: "Mô tả template",
      provider: "Provider",
      emailType: "Loại email",
      fromName: "Tên người gửi",
      fromEmail: "Email người gửi",
      replyToEmail: "Email reply-to",
      scheduledAt: "Thời gian lên lịch",
      enableTestMode: "Bật test mode",
      subject: "Tiêu đề",
      previewText: "Preview text",
      content: "Nội dung chính",
      ctaText: "Nội dung CTA",
      ctaUrl: "CTA URL",
      promoCode: "Mã khuyến mãi",
      productName: "Tên sản phẩm",
      productImage: "URL ảnh sản phẩm",
      benefits: "Lợi ích",
      welcomeBenefits: "Lợi ích / điểm nổi bật",
      reminderBenefits: "Điểm nhắc nhở",
      recipientList: "Danh sách người nhận",
      validEmails: "Email hợp lệ",
      duplicateEmails: "Email trùng lặp",
      batchCount: "Số batch ước tính",
      siteDomain: "Domain site",
      campaign: "Chiến dịch",
      type: "Loại",
      recipients: "Người nhận",
      from: "Người gửi",
    },

    placeholders: {
      userId: "Tự động điền từ AdminAuthProvider",
      siteId: "Tự động điền từ AdminAuthProvider",
      workspace: "Tự động điền từ AdminAuthProvider",
      siteName: "Tự động điền từ AdminAuthProvider",
      campaignName: "Ví dụ: Welcome Campaign - April",
      subject: "Nhập tiêu đề email",
      previewText: "Nhập preview text",
      content: "Nhập nội dung email",
      ctaText: "Hoàn tất đơn hàng",
      ctaUrl: "https://your-landing-page.com",
      promoCode: "AC41FD2P",
      productName: "Mounjaro Kwikpen",
      productImage: "/image.png hoặc https://...",
      benefits: "Lợi ích 1\nLợi ích 2\nLợi ích 3",
      welcomeBenefits: "Thiết lập nhanh\nOnboarding dễ dàng\nHỗ trợ hữu ích",
      reminderBenefits: "Hoàn tất bước còn thiếu\nXem lại hoạt động gần đây\nTiếp tục từ nơi bạn đã dừng",
      recipientList:
        "Nhập danh sách email, mỗi dòng một email\njohn@example.com\nanna@example.com\nsupport@example.com",
      fromName: "Tải từ cấu hình email hệ thống",
      fromEmail: "Tải từ cấu hình email hệ thống",
      replyToEmail: "Tải từ cấu hình email hệ thống",
    },

    hints: {
      campaignName: "Tên nội bộ dùng để quản lý chiến dịch trong admin panel.",
      templateKey: "Trường này map trực tiếp tới EmailTemplate.key trong database.",
      batchSize: "Kích thước batch hiện tại là cố định.",
      templateDescription: "Mô tả tham chiếu của template đang chọn.",
      provider: "Tự động tải từ cấu hình email hệ thống.",
      testMode: "Khi bật, backend có thể đánh dấu Email.testMode = true.",
      subject: "Được lưu trong Email.subject và hiển thị cho người nhận.",
      previewText: "Được lưu trong Email.previewText cho inbox preview snippets.",
      content: "Nội dung chính dùng để render htmlContent hoặc textContent ở backend.",
      recipientList: "Bạn có thể phân tách bằng xuống dòng, dấu phẩy hoặc dấu chấm phẩy.",
      bottomInfo:
        "User ID và Site ID được tải từ AdminAuthProvider. Cấu hình người gửi được tải từ system email credentials.",
    },

    buttons: {
      submitting: "Đang gửi...",
      scheduleCampaign: "Lên lịch chiến dịch",
      sendCampaign: "Gửi chiến dịch",
    },

    misc: {
      batchSizeValue: "{{count}} email / batch",
    },
  },
  calendarAdmin: {
    weekdays: {
      sun: "CN",
      mon: "T2",
      tue: "T3",
      wed: "T4",
      thu: "T5",
      fri: "T6",
      sat: "T7",
    },
    actions: {
      today: "Hôm nay",
      reload: "Tải lại",
      refreshData: "Làm mới dữ liệu",
      confirm: "Xác nhận",
      complete: "Hoàn tất",
      delete: "Xóa",
      cancel: "Hủy",
      createBooking: "Tạo booking",
    },
    views: {
      day: "Ngày",
      week: "Tuần",
      month: "Tháng",
    },
    labels: {
      localTime: "Giờ địa phương",
      upcoming: "Sắp tới",
      recent: "Gần đây",
    },
    sidebar: {
      nearestBookings: "Booking gần nhất",
      todayOverview: "Tổng quan hôm nay",
    },
    summary: {
      totalBookings: "Tổng booking",
    },
    search: {
      placeholder: "Tìm khách hàng, SĐT, nội dung",
    },
    details: {
      title: "Chi tiết booking",
      subtitle: "Thông tin booking",
      customer: "Khách hàng",
      phone: "Số điện thoại",
      service: "Nội dung / nhu cầu",
      time: "Thời gian",
      source: "Nguồn booking",
      createdAt: "Tạo lúc",
      updatedAt: "Cập nhật",
      note: "Ghi chú",
    },
    modal: {
      createTitle: "Tạo booking mới",
      createSubtitle: "Ghi nhận nhu cầu của khách để tiện liên hệ và chốt đơn",
    },
    form: {
      customerName: "Tên khách hàng",
      customerPhone: "Số điện thoại",
      serviceName: "Nội dung / nhu cầu",
      start: "Bắt đầu",
      end: "Kết thúc",
      source: "Nguồn booking",
      note: "Ghi chú",
      placeholders: {
        customerName: "Nhập tên khách",
        customerPhone: "Nhập số điện thoại",
        serviceName: "Ví dụ: Muốn hỏi giá sỉ, đặt đơn, lấy báo giá...",
        note: "Nhập ghi chú nếu có",
      },
    },
    source: {
      website: "Website",
      facebook: "Facebook",
      zalo: "Zalo",
      phone: "Điện thoại",
      walkIn: "Khách ghé trực tiếp",
    },
    status: {
      pending: "Chờ xử lý",
      confirmed: "Đã xác nhận",
      checkedIn: "Đã liên hệ",
      inService: "Đang xử lý",
      completed: "Hoàn tất",
      cancelled: "Đã hủy",
      noShow: "Không phản hồi",
    },
    empty: {
      noBookingsYet: "Chưa có booking nào.",
      noBookingSelected: "Chưa chọn booking nào.",
      noNotes: "Không có ghi chú.",
    },
    loading: {
      loadingData: "Đang tải dữ liệu...",
      loadingBookings: "Đang tải danh sách booking...",
      updating: "Đang cập nhật...",
      creating: "Đang tạo...",
    },
    errors: {
      siteNotFound: "Không tìm thấy site hiện tại",
      loadBookingsFailed: "Không thể tải danh sách booking",
      createBookingFailed: "Không thể tạo booking",
      updateBookingFailed: "Không thể cập nhật booking",
      deleteBookingFailed: "Không thể xóa booking",
    },
    confirm: {
      deleteBooking: "Bạn có chắc muốn xóa booking của {name}?",
    },
    bookingNeedSuggestions: {
      askWholesalePrice: "Hỏi giá sỉ",
      askRetailPrice: "Hỏi giá lẻ",
      placeOrder: "Đặt đơn hàng",
      requestQuotation: "Xin báo giá",
      productConsultation: "Tư vấn sản phẩm",
      wantToSeeSamples: "Muốn xem mẫu thực tế",
      needCatalogue: "Cần gửi catalogue",
      bulkImport: "Muốn nhập hàng số lượng lớn",
    },
  },
  pageList: {
    title: "Danh sách trang",
    sites: {
      loading: "Đang tải danh sách site...",
      all: "Tất cả site",
    },

    status: {
      all: "Tất cả trạng thái",
      published: "Đã xuất bản",
      draft: "Bản nháp",
    },

    fields: {
      title: "Tiêu đề",
      updated: "Cập nhật",
    },

    searchPlaceholder: "Tìm kiếm trang...",
    searchAria: "Tìm kiếm trang",
    noResults: "Không có kết quả",
    untitled: "Chưa có tiêu đề",

    filters: {
      site: "Lọc theo site",
      status: "Lọc theo trạng thái",
    },

    errors: {
      loadPages: "Không thể tải danh sách trang",
    },

    pagination: {
      previous: "Trang trước",
      next: "Trang sau",
      page: "Trang",
      items: "mục",
    },
    actions: {
      newPage: "Trang mới",
    },
    usage: {
      pagesUsage: "Sử dụng trang",
    },
    createModal: {
      title: "Tạo trang",
      fields: { site: "Website", title: "Tiêu đề", slug: "Đường dẫn" },
      placeholders: { title: "Nhập tiêu đề", slug: "gioi-thieu" },
      buttons: { create: "Tạo", creating: "Đang tạo..." },
      validation: { titleRequired: "Vui lòng nhập tiêu đề", siteRequired: "Vui lòng chọn website" },
      messages: { createSuccess: "Tạo trang thành công", createFailed: "Tạo trang thất bại" },
    },
  },
  builderAdd: {
    siteFallback: "Site",
    untitled: "Chưa có tiêu đề",

    titles: {
      pageEditor: "Trình chỉnh sửa trang",
    },

    aria: {
      builderEditor: "Trình chỉnh sửa builder",
    },

    actions: {
      publish: "Xuất bản",
      preview: "Xem trước",
      save: "Lưu",
      cancel: "Hủy",
      close: "Đóng",
      closeModal: "Đóng cửa sổ",
      backToDesign: "Quay lại thiết kế",
    },

    status: {
      saving: "Đang lưu...",
      loadingSites: "Đang tải site.",
    },

    messages: {
      saveDraftOk: "Đã lưu bản nháp thành công",
    },

    errors: {
      noSiteSelected: "Chưa chọn site",
      needSaveBeforePublish: "Vui lòng lưu trước khi xuất bản",
      saveErrorFallback: "Lưu trang thất bại",
      publishErrorFallback: "Xuất bản trang thất bại",
    },

    initError: "Lỗi khởi tạo:",
  },
  pricing: {
    basic: "Basic",
    normal: "Normal",
    pro: "Pro",
    plus: "Plus",
    upgrade: "Nâng cấp",
    currentPlan: "Gói hiện tại",
    templates: "Giao diện",
    websites: "Website",
    products: "Sản phẩm",
    categories: "Danh mục",
    popular: "Phổ biến",
    month: "tháng",
    dragDrop: "Kéo & Thả",
    analytics: "Thống kê",
  },
  dashboard: {
    loading: "Đang tải dữ liệu...",
    sitesUsed: "Số website đã dùng",
    templatesUsed: "Template đã dùng",
    productsCreated: "Sản phẩm đã tạo",
    productsSold: "Sản phẩm đã bán",
    stockRemaining: "Tồn kho",
    usersMember: "Thành viên",
  },
  scarler: {
    home: "Nhà thông minh",
    loading: "Đang tải...",
    error: "Lỗi",
    goal: "Mục tiêu",
    livingRoom: "Phòng khách",
    on: "BẬT",
    off: "TẮT",
    devices: {
      refrigerator: "Tủ lạnh",
      temperature: "Nhiệt độ",
      conditioner: "Điều hòa",
      lights: "Đèn",
    },
  },
  seo: {
    defaultTitle: "Sản phẩm nổi bật",

    homeMetaTitle: "{siteName} - Mua sắm dễ dàng, sản phẩm đẹp và giá tốt",

    homeMetaDescription:
      "Khám phá {siteName} với nhiều sản phẩm đẹp, giá tốt, dễ chọn mua và tối ưu trải nghiệm trên mọi thiết bị.",

    pageMetaTitle: "{title} | {siteName}",

    pageMetaDescription:
      "Khám phá {title} tại {siteName}. Thông tin rõ ràng, hình ảnh đẹp, trải nghiệm mua sắm mượt mà và dễ chuyển đổi.",

    homeOgTitle: "{siteName} | Ưu đãi hấp dẫn mỗi ngày",

    pageOgTitle: "{title} - Xem ngay tại {siteName}",

    homeOgDescription: "Mua sắm nhanh hơn với giao diện đẹp, nội dung rõ ràng và nhiều ưu đãi hấp dẫn tại {siteName}.",

    pageOgDescription:
      "Xem ngay {title} tại {siteName} với thông tin nổi bật, nội dung hấp dẫn và trải nghiệm mua sắm tối ưu.",

    keywords: "mua online, giá tốt, ưu đãi, shopping online",
  },
  analytics: {
    monthlyRecapReport: "Báo cáo tổng kết tháng",
    targetIncome: "Mục tiêu doanh thu",
  },
  welcome: {
    badge: "Chào mừng trở lại Anna!",
    titleStart: "Bạn đã hoàn thành",
    titleEnd: "mục tiêu của tuần này!",
    description: "Tiếp tục cố gắng và cải thiện kết quả của bạn!",
  },
  support: {
    managerName: "Muhammad Waqas",
    message: "Nhắn tin",
    email: "Email",
    phone: "Điện thoại",
    chatGreeting: "Xin chào! Tôi có thể giúp gì cho bạn hôm nay?",
    chatRequest: "Tôi cần hỗ trợ cho dashboard website của mình.",
    chatReply: "Chắc chắn rồi 👋 Hãy gửi thêm chi tiết cho tôi.",
    typeMessage: "Nhập tin nhắn...",
  },
  categoriesAutomation: {
    title: "Khởi tạo danh mục",
    websiteType: "Loại website",
    businessType: "Ngành hàng muốn bán",
    searchPlaceholder: "Tìm ngành hàng, category con...",
    selectAll: "Chọn tất cả",
    clearAll: "Bỏ chọn",
    creating: "Đang tạo...",
    autoCreate: "Tạo categories tự động",
    selectedInfo: {
      before: "Đã chọn ",
      after: " nhóm ngành. Khi xác nhận, hệ thống sẽ tự tạo category cha và category con tương ứng.",
    },
    common: {
      cancel: "Hủy",
    },
    websiteTypes: {
      ecommerce: "Ecommerce",
      landingPage: "Landing Page",
      other: "Khác",
    },
  },
  categories: {
    cosmetics: "Mỹ phẩm",
    electronics: "Đồ điện tử",
    accessories: "Phụ kiện",
    fashion: "Quần áo",
    shoes: "Giày dép",
    home: "Đồ gia dụng",
    stationery: "Văn phòng phẩm",
    motherBaby: "Mẹ & bé",
    food: "Thực phẩm",
    sports: "Thể thao",

    business: "Business",
    portfolio: "Portfolio",
    saas: "SaaS",
    course: "Khóa học online",
    restaurant: "Nhà hàng",
    agency: "Agency",

    skincare: "Chăm sóc da",
    makeup: "Trang điểm",
    haircare: "Chăm sóc tóc",
    perfume: "Nước hoa",

    phones: "Điện thoại",
    laptops: "Laptop",
    audio: "Âm thanh",
    smartDevices: "Thiết bị thông minh",

    fashionAccessories: "Phụ kiện thời trang",
    techAccessories: "Phụ kiện công nghệ",
    jewelry: "Trang sức",

    menFashion: "Thời trang nam",
    womenFashion: "Thời trang nữ",
    kidsFashion: "Thời trang trẻ em",

    menShoes: "Giày nam",
    womenShoes: "Giày nữ",
    slippers: "Dép",

    kitchen: "Nhà bếp",
    homeAppliances: "Điện gia dụng",
    homeDecor: "Trang trí nhà cửa",
    cleaning: "Dọn dẹp",

    writingTools: "Dụng cụ viết",
    paperNotebook: "Sổ & giấy",
    officeSupplies: "Dụng cụ văn phòng",

    babyProducts: "Đồ cho bé",
    babyFashion: "Thời trang bé",
    motherProducts: "Đồ cho mẹ",

    snacks: "Đồ ăn vặt",
    drinks: "Đồ uống",
    dryFood: "Thực phẩm khô",

    sportswear: "Quần áo thể thao",
    trainingEquipment: "Dụng cụ tập luyện",
    sportsAccessories: "Phụ kiện thể thao",

    businessSections: "Business Sections",
    portfolioSections: "Portfolio Sections",
    saasSections: "SaaS Sections",
    courseSections: "Course Sections",
    restaurantSections: "Restaurant Sections",
    agencySections: "Agency Sections",

    faceWash: "Sữa rửa mặt",
    toner: "Toner",
    serum: "Serum",
    moisturizer: "Kem dưỡng",
    sunscreen: "Kem chống nắng",

    lipstick: "Son",
    powder: "Phấn nền",
    foundation: "Kem nền",
    mascara: "Mascara",
    eyeliner: "Kẻ mắt",

    shampoo: "Dầu gội",
    conditioner: "Dầu xả",
    hairMask: "Kem ủ",
    hairOil: "Tinh dầu tóc",

    menPerfume: "Nước hoa nam",
    womenPerfume: "Nước hoa nữ",
    bodyMist: "Xịt thơm cơ thể",

    android: "Android",
    iphone: "iPhone",
    phoneAccessories: "Phụ kiện điện thoại",

    officeLaptop: "Laptop văn phòng",
    gamingLaptop: "Laptop gaming",
    laptopAccessories: "Phụ kiện laptop",

    headphones: "Tai nghe",
    speakers: "Loa",
    microphone: "Micro",

    smartWatch: "Đồng hồ thông minh",
    camera: "Camera",
    smartHome: "Thiết bị nhà thông minh",

    bag: "Túi xách",
    wallet: "Ví",
    belt: "Thắt lưng",
    glasses: "Kính mắt",

    charger: "Sạc",
    cable: "Cáp",
    powerBank: "Pin dự phòng",
    phoneHolder: "Giá đỡ điện thoại",

    ring: "Nhẫn",
    bracelet: "Vòng tay",
    necklace: "Dây chuyền",
    earrings: "Bông tai",

    tshirt: "Áo thun",
    shirt: "Áo sơ mi",
    jeans: "Quần jean",
    shorts: "Quần short",

    dress: "Đầm váy",
    blouse: "Áo kiểu",
    skirt: "Chân váy",
    pants: "Quần",

    boyClothes: "Bé trai",
    girlClothes: "Bé gái",

    sneaker: "Sneaker",
    leatherShoes: "Giày tây",
    sandal: "Sandal",

    highHeels: "Cao gót",
    womenSneaker: "Sneaker",
    womenSandal: "Sandal",
    flats: "Búp bê",

    indoorSlippers: "Dép đi trong nhà",
    fashionSlippers: "Dép thời trang",

    pot: "Nồi chảo",
    knife: "Dao kéo",
    foodContainer: "Hộp đựng thực phẩm",

    riceCooker: "Nồi cơm điện",
    blender: "Máy xay",
    kettle: "Ấm siêu tốc",
    fan: "Quạt",

    lamp: "Đèn",
    painting: "Tranh",
    curtain: "Rèm cửa",

    mop: "Cây lau nhà",
    floorCleaner: "Nước lau sàn",
    vacuum: "Máy hút bụi",

    pen: "Bút bi",
    pencil: "Bút chì",
    highlighter: "Bút highlight",

    notebook: "Sổ tay",
    notePaper: "Giấy note",
    printPaper: "Giấy in",

    stapler: "Bấm kim",
    paperClip: "Kẹp giấy",
    fileFolder: "File hồ sơ",

    diaper: "Tã bỉm",
    milk: "Sữa",
    bottle: "Bình sữa",
    toys: "Đồ chơi",

    boyFashion: "Quần áo bé trai",
    girlFashion: "Quần áo bé gái",

    breastPump: "Máy hút sữa",
    milkStorageBag: "Túi trữ sữa",
    postpartumCare: "Đồ dùng sau sinh",

    snack: "Snack",
    cake: "Bánh",
    candy: "Kẹo",

    coffee: "Cà phê",
    tea: "Trà",
    juice: "Nước ép",

    noodle: "Mì",
    rice: "Gạo",
    nuts: "Hạt",
    spices: "Gia vị",

    sportShirt: "Áo",
    sportPants: "Quần",
    trainingSet: "Bộ tập",

    dumbbell: "Tạ",
    yogaMat: "Thảm yoga",
    resistanceBand: "Dây kháng lực",

    waterBottle: "Bình nước",
    gymBag: "Túi thể thao",
    gloves: "Găng tay",

    about: "Giới thiệu",
    services: "Dịch vụ",
    pricing: "Bảng giá",
    testimonials: "Đánh giá",
    contact: "Liên hệ",

    projects: "Dự án",
    skills: "Kỹ năng",
    experience: "Kinh nghiệm",

    features: "Tính năng",
    faq: "FAQ",
    cta: "CTA",

    curriculum: "Giáo trình",
    mentor: "Mentor",
    reviews: "Đánh giá",

    menu: "Menu",
    chef: "Đầu bếp",
    booking: "Đặt bàn",
    gallery: "Thư viện",

    clients: "Khách hàng",
    team: "Đội ngũ",
    loading: "Đang tải danh mục...",
    total: "danh mục",
    automation: "Tự động hóa",
    addCategory: "Thêm danh mục",
    createTitle: "Tạo danh mục",
    createCategory: "Tạo danh mục",
    childCategories: "Danh mục con",
    addChild: "Thêm con",
    autoSlug: "Tạo slug",
    root: "Danh mục gốc",
    newChild: "Danh mục mới",
    searchPlaceholder: "Tìm kiếm danh mục...",

    fields: {
      name: "Tên",
      slug: "Slug",
      parent: "Danh mục cha",
      sortOrder: "Thứ tự",
    },

    placeholders: {
      name: "Nhập tên danh mục...",
    },

    filters: {
      all: "Tất cả",
      root: "Chỉ gốc",
      children: "Có danh mục con",
      empty: "Không có sản phẩm",
    },

    sort: {
      az: "A-Z",
      newest: "Mới nhất",
      updated: "Cập nhật gần đây",
      products: "Nhiều sản phẩm",
    },

    table: {
      category: "Danh mục",
      slug: "Slug",
      parent: "Danh mục cha",
      products: "Sản phẩm",
      sort: "Sắp xếp",
      updated: "Cập nhật",
      actions: "Thao tác",
    },

    messages: {
      loadError: "Không thể tải danh mục.",
      selectSite: "Vui lòng chọn website.",
      enterName: "Vui lòng nhập tên danh mục.",
      createSuccess: "Tạo danh mục thành công.",
      createError: "Tạo danh mục thất bại.",
      updateSuccess: "Cập nhật danh mục thành công.",
      updateError: "Cập nhật danh mục thất bại.",
      deleteSuccess: "Xóa danh mục thành công.",
      deleteError: "Xóa danh mục thất bại.",
      automationSuccess: "Tạo preset danh mục thành công.",
      automationError: "Tạo preset danh mục thất bại.",
      childCreated: "Tạo danh mục con thành công.",
      childError: "Tạo danh mục con thất bại.",
      deleteTitle: "Xóa danh mục?",
      deleteDescription: "Bạn có chắc muốn xóa ",
      maxCategoriesReached: "Đã đạt giới hạn số lượng Categories",
      maxCategoriesExceeded: "Số lượng Categories vượt quá giới hạn tối đa ({max})",
    },
  },
  brands: {
    actions: {
      syncData: "Đồng bộ dữ liệu",
      createBrand: "Tạo thương hiệu",
      updateBrand: "Cập nhật thương hiệu",
      creatingBrand: "Đang tạo thương hiệu...",
      updatingBrand: "Đang cập nhật thương hiệu...",
      cancel: "Hủy",
      delete: "Xóa",
      chooseAnotherImage: "Chọn ảnh khác",
      removeImage: "Xóa ảnh",
      browse: "Chọn file",
    },

    form: {
      commerceBrand: "Thương hiệu thương mại",
      site: "Website",
      selectSite: "Chọn website",
      loadingSites: "Đang tải website...",
      brandName: "Tên thương hiệu",
      brandNamePlaceholder: "Ví dụ: Sakura",
      slug: "Slug",
      autoGenerated: "Tự động tạo",
      finalSlug: "Slug cuối cùng",
      description: "Mô tả",
      descriptionPlaceholder: "Mô tả ngắn về thương hiệu...",
      logo: "Logo",
      dropFileHere: "Thả file vào đây",
      or: "hoặc",
      uploadHint: "Hỗ trợ JPG, PNG, WEBP, GIF, SVG",
    },

    table: {
      brand: "Thương hiệu",
      site: "Website",
      created: "Ngày tạo",
      actions: "Thao tác",
      noDescription: "Không có mô tả",
      editing: "Đang chỉnh sửa",
      updated: "Cập nhật",
    },

    filters: {
      searchPlaceholder: "Tìm theo tên, slug, mô tả, domain...",
      clearSearch: "Xóa tìm kiếm",
      allLogos: "Tất cả logo",
      withLogo: "Có logo",
      noLogo: "Không có logo",
      newest: "Mới nhất",
      oldest: "Cũ nhất",
      nameAsc: "Tên A-Z",
      nameDesc: "Tên Z-A",
    },

    empty: {
      title: "Không tìm thấy thương hiệu phù hợp",
      description: "Hãy tạo thương hiệu đầu tiên ở khung bên trái hoặc thử thay đổi từ khóa tìm kiếm.",
    },

    pagination: {
      showing: "Hiển thị",
      page: "Trang",
    },

    modal: {
      success: "Thành công",
      loadFailed: "Tải dữ liệu thất bại",
      createFailed: "Tạo thương hiệu thất bại",
      updateFailed: "Cập nhật thương hiệu thất bại",
      publishFailed: "Xuất bản thất bại",
      deleteFailed: "Xóa thất bại",
      invalidFile: "File không hợp lệ",

      createdSuccess: 'Đã tạo "{name}" thành công.',
      updatedSuccess: 'Đã cập nhật "{name}" thành công.',
      deletedSuccess: 'Đã xóa "{name}" thành công.',
      publishedSuccess: 'Đã xuất bản "{name}" thành công.',

      deleteBrand: "Xóa thương hiệu",
      deleteBrandConfirm: 'Bạn có chắc muốn xóa "{name}"?',
      limitReached: "Đã vượt giới hạn",
      maxBrandsReached: "Bạn chỉ được tạo tối đa {max} thương hiệu.",
    },
    stats: {
      brands: "Thương hiệu",
    },
  },
  products: {
    noProductsSelected: "Chưa chọn sản phẩm",
    pleaseSelectAtLeastOneProduct: "Vui lòng chọn ít nhất một sản phẩm.",

    success: "Thành công",

    deactivateSuccessSingle: "Đã ngưng kích hoạt “{name}” thành công.",
    deactivateSuccessMultiple: "Đã ngưng kích hoạt {count} sản phẩm thành công.",

    deactivateFailed: "Ngưng kích hoạt thất bại",

    missingSite: "Thiếu website",
    pleaseSelectSiteFirst: "Vui lòng chọn website trước.",

    noProductSelected: "Chưa chọn sản phẩm",
    pleaseSelectOneProductToEdit: "Vui lòng chọn một sản phẩm để chỉnh sửa.",

    multipleProductsSelected: "Đã chọn nhiều sản phẩm",
    pleaseSelectOnlyOneProductToEdit: "Vui lòng chỉ chọn một sản phẩm để chỉnh sửa.",

    pleaseSelectAtLeastOneProductToDeactivate: "Vui lòng chọn ít nhất một sản phẩm để ngưng kích hoạt.",

    deactivateProduct: "Ngưng kích hoạt sản phẩm?",

    deactivateConfirmSingle: "Ngưng kích hoạt “{name}”? Hành động này không thể hoàn tác.",

    deactivateConfirmMultiple: "Ngưng kích hoạt {count} sản phẩm đã chọn? Hành động này không thể hoàn tác.",

    filters: "Bộ lọc",
    deactivate: "Ngưng kích hoạt",
    create: "Tạo mới",
    edit: "Chỉnh sửa",

    deleteProduct: "Xóa sản phẩm?",

    deleteConfirm: "Xóa “{name}”? Hành động này không thể hoàn tác.",

    deleteFailed: "Xóa thất bại",

    deleteSuccess: "Đã xóa “{name}” thành công.",

    active: "Đang hoạt động",
    inactive: "Ngưng hoạt động",
    draft: "Nháp",
    archived: "Lưu trữ",
    loadingSites: "Đang tải website...",
    selectSite: "Chọn website",

    searchPlaceholder: "Tìm kiếm tên, SKU, mã vạch...",

    searchSuggestions: "Gợi ý tìm kiếm",
    itemsCount: "{count} sản phẩm",

    noCategory: "Không có danh mục",

    newestFirst: "Mới nhất",
    oldestFirst: "Cũ nhất",
    statusAsc: "Trạng thái A → Z",
    statusDesc: "Trạng thái Z → A",

    allCategories: "Tất cả danh mục",
    allBrands: "Tất cả thương hiệu",

    productList: "Danh sách sản phẩm",
    editProduct: "Chỉnh sửa sản phẩm",
    createProduct: "Tạo sản phẩm",
    no: "STT",
    product: "Sản phẩm",
    sku: "SKU",
    qty: "Số lượng",
    brand: "Thương hiệu",
    category: "Danh mục",
    pricing: "Giá bán",
    marketPrice: "Giá thị trường",
    status: "Trạng thái",
    updated: "Cập nhật",
    actions: "Thao tác",

    hidden: "Ẩn",

    noBrand: "Không có thương hiệu",

    deleteProductAria: "Xóa {name}",

    prev: "Trước",
    next: "Tiếp",

    page: "Trang",
    loadProductDetailFailed: "Tải chi tiết sản phẩm thất bại",
    invalidProductDetailResponse: "Dữ liệu chi tiết sản phẩm không hợp lệ",

    buyOnlineMeta: "Mua {name} trực tuyến. Giao hàng nhanh, chất lượng cao.",

    premiumDescription: "{name} cao cấp cho nhu cầu sử dụng hằng ngày.",

    keyFeatures: "✅ Tính năng nổi bật",
    highQualityMaterials: "- Chất liệu cao cấp",
    easyToUse: "- Dễ sử dụng",
    greatValue: "- Giá trị tuyệt vời",

    inTheBox: "📦 Trong hộp",
    warranty: "🛡 Bảo hành",
    warrantyPolicy: "- Vui lòng kiểm tra chính sách bảo hành theo danh mục.",

    newProduct: "Sản phẩm mới",

    siteRequired: "Website là bắt buộc",
    nameRequired: "Tên sản phẩm là bắt buộc",
    slugRequired: "Slug là bắt buộc",
    categoryRequired: "Danh mục là bắt buộc",

    invalidForm: "Form không hợp lệ",

    uploadUnexpectedUrls: "Upload trả về số lượng URL không hợp lệ",

    updateProductFailed: "Cập nhật sản phẩm thất bại",
    createProductFailed: "Tạo sản phẩm thất bại",

    updateProductSuccess: "Cập nhật sản phẩm thành công!",

    createProductSuccess: "Tạo sản phẩm thành công!",

    updateFailed: "Cập nhật thất bại",
    createFailed: "Tạo thất bại",

    cancel: "Hủy",
    publishNow: "Đăng ngay",
    autoFill: "Tự động điền",
    save: "Lưu",
    loadingProductMedia: "Đang tải media sản phẩm...",
    noMediaYet: "Chưa có media. Hãy tải ảnh/video lên.",

    remove: "Xóa",
    upload: "Tải lên",

    dropYourFileHere: "Thả file vào đây",
    clickToUpload: "hoặc nhấn để tải lên",

    seoOptimization: "Tối ưu SEO",
    improveSearchEngines: "Cải thiện công cụ tìm kiếm",

    recommended: "Đề xuất",

    metaTitle: "Tiêu đề SEO",
    urlPreview: "Xem trước URL",

    yourSlug: "slug-cua-ban",

    metaDescription: "Mô tả SEO",

    recommendedChars: "Khuyến nghị 140–160 ký tự",

    unsavedChanges: "Chưa lưu thay đổi",
    saved: "Đã lưu",
    lastSaved: "Lưu lần cuối {time}",

    publish: "Đăng",
    saving: "Đang lưu...",

    site: "Website",
    name: "Tên",
    slug: "Slug",
    selectSiteFirst: "Chọn website trước...",
    selectCategory: "— Chọn danh mục —",

    tags: "Tags",
    typeTagAndPressAdd: "Nhập tag và nhấn Thêm",

    add: "Thêm",

    barcode: "Mã vạch",

    shortDescription: "Mô tả ngắn",

    shortDescriptionPlaceholder: "1–2 dòng hiển thị ngoài danh sách",

    price: "Giá",
    savingPrice: "Giá giảm",

    quantity: "Số lượng",

    description: "Mô tả",

    writeProductDescription: "Nhập mô tả sản phẩm...",
  },
  inventory: {
    inventoryDashboard: "Bảng điều khiển kho hàng",
    warehouseManagement: "Quản lý kho hàng",

    totalStock: "Tổng tồn kho",
    totalSold: "Đã bán",
    outOfStock: "Hết hàng",

    searchPlaceholder: "Tìm kiếm sản phẩm, SKU, mã vạch...",
    search: "Tìm kiếm",

    importStock: "Nhập kho",
    importing: "Đang nhập...",
    importStockSuccess: "Nhập kho thành công",

    product: "Sản phẩm",
    sku: "SKU",
    category: "Danh mục",
    brand: "Thương hiệu",
    stock: "Tồn kho",
    sold: "Đã bán",
    imported: "Đã nhập",
    reserved: "Đã giữ",
    status: "Trạng thái",
    updated: "Cập nhật",

    inStock: "Còn hàng",
    lowStockStatus: "Sắp hết hàng",
    outStock: "Hết hàng",

    loadingInventory: "Đang tải kho hàng...",
    noInventoryFound: "Không tìm thấy dữ liệu kho hàng",

    previous: "Trước",
    next: "Tiếp",
    page: "Trang",

    selectProduct: "Chọn sản phẩm",
    quantity: "Số lượng",
    note: "Ghi chú",
    lowStock: {
      httpError: "Lỗi HTTP:",
      fetchFailed: "Không thể tải danh sách tồn kho thấp:",

      status: {
        reorder: "CẦN NHẬP HÀNG",
        lowStock: "SẮP HẾT HÀNG",
        inStock: "CÒN HÀNG",
      },

      table: {
        sku: "SKU",
        name: "Tên",
        thumb: "Ảnh",
        quantity: "Số lượng",
        category: "Danh mục",
        status: "Trạng thái",
        action: "Thao tác",
      },

      logs: {
        filterClicked: "Đã click filter — cần implement filter panel",
        rowAction: "Thao tác dòng cho item:",
      },
      title: "Tồn kho thấp",
      description: "Theo dõi tồn kho và trạng thái sản phẩm theo thời gian thực",
      live: "Trực tiếp",

      searchPlaceholder: "Tìm kiếm tồn kho...",

      threshold: {
        lessThan: "≤",
      },

      actions: {
        filter: "Bộ lọc",
        exportCsv: "Xuất CSV",
        moreActions: "Thao tác khác",
      },
      loadingInventory: "Đang tải tồn kho...",
      noInventory: "Không tìm thấy tồn kho",

      showing: "Hiển thị",
      of: "trên",
      results: "kết quả",

      pagination: {
        prev: "Trước",
        next: "Tiếp",
      },

      stats: {
        totalSkus: "Tổng SKU",
        totalUnits: "Tổng sản phẩm",
        lowStockAlerts: "Cảnh báo tồn kho thấp",
        totalValue: "Tổng giá trị",
        unchanged: "Không thay đổi",
      },

      recentActivity: "Hoạt động gần đây",

      activities: {
        stockReceived: {
          title: "Nhập kho",
          description: "Lô hàng #9924 đã đến",
          time: "5 phút trước",
        },

        orderFulfilled: {
          title: "Hoàn tất đơn hàng",
          description: "Đơn hàng đã được giao",
          time: "28 phút trước",
        },

        adjustmentMade: {
          title: "Điều chỉnh",
          description: "Chỉnh sửa thủ công",
          time: "1 giờ trước",
        },

        lowStockTriggered: {
          title: "Cảnh báo tồn kho thấp",
          description: "Đã đạt ngưỡng cảnh báo",
          time: "3 giờ trước",
        },
      },
    },
  },
  inventoryHistory: {
    totalImports: "Tổng nhập kho",
    totalSales: "Tổng bán hàng",
    returns: "Hàng hoàn trả",
    adjustments: "Điều chỉnh",

    incomingWarehouseStock: "Hàng nhập vào kho",
    outgoingProductQuantity: "Số lượng sản phẩm xuất",
    customerReturnActivities: "Hoạt động trả hàng",
    manualStockUpdates: "Cập nhật kho thủ công",

    searchPlaceholder: "Tìm kiếm sản phẩm, SKU hoặc ghi chú...",

    all: "Tất cả",
    import: "Nhập kho",
    sale: "Bán hàng",
    return: "Hoàn trả",
    adjust: "Điều chỉnh",

    results: "Kết quả",

    export: "Xuất file",

    product: "Sản phẩm",
    sku: "SKU",
    note: "Ghi chú",
    transaction: "Giao dịch",
    quantity: "Số lượng",
    before: "Trước",
    after: "Sau",
    date: "Ngày",

    loadingHistory: "Đang tải lịch sử...",

    noInventoryHistory: "Không tìm thấy lịch sử kho",

    warehouseActivitiesWillAppearHere: "Các hoạt động kho sẽ hiển thị tại đây.",

    transactions: "Giao dịch",
  },
  orders: {
    dashboard: "Bảng điều khiển đơn hàng",
    liveData: "Dữ liệu trực tiếp",
    exportReport: "Xuất báo cáo",
    totalOrders: "Tổng đơn hàng",
    pendingOrders: "Đơn chờ xử lý",
    shippingOrders: "Đơn đang giao",
    totalRevenue: "Tổng doanh thu",
    needsAttention: "Cần chú ý",
    inDelivery: "Đang vận chuyển",
    thisMonth: "Tháng này",
    searchPlaceholder: "Tìm kiếm đơn hàng...",
    all: "Tất cả",
    pending: "Chờ xử lý",
    shipping: "Đang giao",
    delivered: "Đã giao",
    cancelled: "Đã huỷ",
    order: "Đơn hàng",
    customer: "Khách hàng",
    items: "Sản phẩm",
    total: "Tổng",
    payment: "Thanh toán",
    status: "Trạng thái",
    date: "Ngày",
    actions: "Thao tác",
    loadingOrders: "Đang tải đơn hàng...",
    noOrdersFound: "Không tìm thấy đơn hàng",
    showing: "Hiển thị",
    of: "trên",
    selectOrder: "Chọn đơn hàng",
    selectOrderDescription: "Nhấn vào đơn hàng để xem thông tin chi tiết",
    products: "Sản phẩm",
    timeline: "Dòng thời gian",
    orderCreated: "Đơn được tạo",
    currentStatus: "Trạng thái hiện tại",
    updateStatus: "Cập nhật trạng thái",
    confirm: "Xác nhận",
    cancel: "Huỷ",
    qty: "Số lượng",
    phone: "Số điện thoại",
    name: "Tên",
    prev: "Trước",
    next: "Tiếp",
    revenueGrowth: "Tăng trưởng doanh thu",
    confirmed: "Đã xác nhận",
    packing: "Đang đóng gói",
    paid: "Đã thanh toán",
    failed: "Thanh toán thất bại",
    refunded: "Đã hoàn tiền",
  },
  invoice: {
    paidOn: "Thanh toán vào",
    back: "Quay lại",
    active: "ĐANG HOẠT ĐỘNG",
    totalAmount: "Tổng tiền",
    status: "Trạng thái",
    date: "Ngày",
    invoiceDetails: "Chi tiết hóa đơn",
    paymentBillingInfo: "Thông tin thanh toán & hóa đơn",
    invoiceDate: "Ngày hóa đơn",
    paymentMethod: "Phương thức thanh toán",
    bankTransfer: "Chuyển khoản ngân hàng",
    paymentStatus: "Trạng thái thanh toán",
    article: "Sản phẩm",
    quantity: "Số lượng",
    unitPrice: "Đơn giá",
    finalAmount: "Thành tiền",
    productDescription: "Mô tả sản phẩm",
    totalHT: "Tổng HT",
    shippingFee: "Phí vận chuyển",
    vat: "VAT",
    totalPrice: "Tổng cộng",
    termsConditions: "Điều khoản & Điều kiện",
    paymentInvoicePolicy: "Chính sách thanh toán & hóa đơn",
    thankYou: "Cảm ơn bạn đã mua hàng. Vui lòng hoàn tất thanh toán trong thời gian đã thỏa thuận.",
    invoiceQuestion:
      "Nếu bạn có bất kỳ câu hỏi nào về hóa đơn này, vui lòng liên hệ đội ngũ hỗ trợ của chúng tôi bất cứ lúc nào.",
    needHelp: "Cần hỗ trợ?",
    contactSupportCenter: "Liên hệ trung tâm hỗ trợ",
    late: "Trễ hạn",
    overdueInvoice: "Hóa đơn này đã quá hạn.",
    invoiceActions: "Thao tác hóa đơn",
    manageInvoiceActions: "Quản lý và xử lý hóa đơn",
    sendInvoice: "Gửi hóa đơn",
    downloadPDF: "Tải PDF",
    printInvoice: "In hóa đơn",
    paymentSummary: "Tóm tắt thanh toán",
    invoiceFinancialOverview: "Tổng quan tài chính hóa đơn",
    subtotal: "Tạm tính",
    tax: "Thuế",
    completed: "Hoàn thành",
  },
  payments: {
    title: "Thanh toán",
    loading: "Đang tải bảng điều khiển thanh toán...",

    searchPlaceholder: "Tìm mã đơn hàng, giao dịch...",

    status: "Trạng thái",
    method: "Phương thức",

    allStatus: "Tất cả trạng thái",
    allMethods: "Tất cả phương thức",

    applyFilter: "Áp dụng bộ lọc",

    exportCsv: "Xuất CSV",
    refresh: "Làm mới",
    backOrders: "Quay lại đơn hàng",

    monthlyRevenue: "Doanh thu theo tháng",
    revenueAnalytics: "Phân tích doanh thu",
    liveData: "Dữ liệu trực tiếp",

    order: "Đơn hàng",
    amount: "Số tiền",
    actions: "Thao tác",

    confirm: "Xác nhận",
    refund: "Hoàn tiền",

    noPaymentHistory: "Không có lịch sử thanh toán",
    noPaymentDescription: "Hiện tại chưa có giao dịch thanh toán nào.",

    previous: "Trước",
    next: "Tiếp",
    page: "Trang",
    total: "Tổng",

    transactions: "Giao dịch",
    revenue: "Doanh thu",
    methods: "Phương thức",
    successRatio: "Tỷ lệ thành công",

    performance: "Hiệu suất",
    salesRatio: "Tỷ lệ bán hàng",
    completed: "Hoàn thành",

    paidOrders: "Đơn đã thanh toán",
    failedOrders: "Đơn thất bại",

    confirmRefund: "Bạn có chắc muốn hoàn tiền giao dịch này?",

    errors: {
      fetchPayments: "Không thể tải thanh toán",
      fetchStats: "Không thể tải thống kê",
      fetchAnalytics: "Không thể tải phân tích",
      confirmPayment: "Không thể xác nhận thanh toán",
      refundPayment: "Không thể hoàn tiền",
    },
  },
  images: {
    root: "Thư mục gốc",
    uploadImage: "Tải ảnh lên",
    uploading: "Đang tải lên...",
    dragDrop: "Kéo & thả hình ảnh",
    clickBrowse: "Nhấn để chọn ảnh",
    tag: "Nhãn",
    none: "Không có",
    available: "hình ảnh",
    loading: "Đang tải dữ liệu...",

    deleteTitle: "Xóa hình ảnh?",

    deleteDescription: "Bạn có chắc muốn xóa “{name}”? Hành động này không thể hoàn tác.",

    filters: {
      all: "Tất cả",
      recent: "Gần đây",
      tagged: "Đã gắn nhãn",
    },

    placeholders: {
      search: "Tìm kiếm hình ảnh...",
      folderName: "Tên thư mục...",
    },

    empty: {
      title: "Không tìm thấy hình ảnh",
      description: "Hãy tải ảnh đầu tiên hoặc thay đổi bộ lọc.",
    },

    messages: {
      loadFailed: "Không thể tải danh sách hình ảnh.",

      onlyImages: "Chỉ cho phép tải lên file hình ảnh.",

      noFile: "Vui lòng chọn hình ảnh.",

      uploadFailed: "Tải ảnh lên thất bại.",

      uploadSuccess: "Tải ảnh lên thành công.",

      deleteFailed: "Xóa hình ảnh thất bại.",

      deleteSuccess: "Đã xóa “{name}” thành công.",

      linkCopied: "Đã sao chép liên kết hình ảnh.",

      copyFailed: "Không thể sao chép liên kết.",

      folderRequired: "Vui lòng nhập tên thư mục.",

      createFolderFailed: "Tạo thư mục thất bại.",

      folderCreated: "Tạo thư mục thành công.",
    },
  },
  files: {
    empty: "Trống",

    labels: {
      name: "Tên",
    },

    placeholders: {
      newFolder: "Thư mục mới...",
    },

    columns: {
      fileName: "Tên file",
      size: "Kích thước",
      updatedBy: "Cập nhật bởi",
      updated: "Cập nhật lúc",
      actions: "Thao tác",
    },

    actions: {
      selectAll: "Chọn tất cả",
      addFolder: "Thêm thư mục",
      addFile: "Thêm file",
      creating: "Đang tạo...",
      rename: "Đổi tên",
      move: "Di chuyển",
      delete: "Xóa",
      download: "Tải xuống",
      copyLink: "Sao chép link",
    },

    messages: {
      successTitle: "Thành công",

      loadFailedTitle: "Lỗi tải dữ liệu",
      loadFailed: "Không thể tải danh sách file.",

      uploadFailedTitle: "Upload thất bại",
      uploadFailed: "Không thể upload file.",
      uploadSuccess: "Upload file thành công.",

      createFolderFailedTitle: "Tạo thư mục thất bại",
      createFolderFailed: "Không thể tạo thư mục.",
      createFolderSuccess: "Tạo thư mục thành công.",

      invalidSelectionTitle: "Lựa chọn không hợp lệ",
      selectOneFile: "Vui lòng chọn đúng 1 file.",
      selectOneItem: "Vui lòng chọn đúng 1 mục.",

      copySuccessTitle: "Đã sao chép",
      copySuccess: "Đã sao chép đường dẫn file.",

      copyFailedTitle: "Lỗi",
      copyFailed: "Không thể sao chép đường dẫn file.",

      deleteTitle: "Xóa dữ liệu?",
      deleteSuccessTitle: "Thành công",
      deleteSuccess: "Đã xóa thành công.",

      deleteMixedConfirm: "Xóa thư mục và file?",
      deleteFoldersConfirm: "Xóa thư mục?",
      deleteFilesConfirm: "Xóa file?",

      renamePrompt: "Tên mới",
      renameFailedTitle: "Đổi tên thất bại",
      renameFolderFailed: "Không thể đổi tên thư mục.",
      renameSuccess: "Đổi tên thành công.",

      movePrompt: "Nhập folderId đích",
      moveFailedTitle: "Di chuyển thất bại",
      moveFolderFailed: "Không thể di chuyển thư mục.",
      moveSuccess: "Di chuyển thành công.",
    },
  },
  facebook: {
    dashboard: {
      title: "Facebook Auto Post",

      live: "Đang hoạt động",

      meta: {
        scheduled: "24 bài viết đã lên lịch",
        published: "87 bài viết đã đăng",
        autoPosting: "Đã bật tự động đăng bài",
      },

      tabs: {
        posts: "Bài viết đã lên lịch",
        schedule: "Tạo lịch đăng",
        author: "Cấu hình tác giả",
      },
    },
    title: "Facebook Posts",

    description: "Schedule and publish professional Facebook content",

    fields: {
      title: "Post Title",
      description: "Description",
      hashtags: "Hashtags",
      status: "Status",
      publishDate: "Publish Date",
      publishTime: "Publish Time",
      href: "HREF URL",
      image: "Upload Image",
    },

    placeholders: {
      title: "Enter post title...",
      description: "Write your facebook content...",
      hashtags: "#sale #marketing",
      href: "https://yourwebsite.com",
    },

    actions: {
      generate: "Generate AI Content",
      saveDraft: "Save Draft",
      schedule: "Schedule Post",
      saving: "Saving...",
      scheduling: "Scheduling...",
    },

    messages: {
      success: "Success",
      error: "Error",
      draftSaved: "Draft saved successfully.",
      postScheduled: "Facebook post scheduled successfully.",
      saveError: "Failed to save facebook post.",
      unexpected: "Something went wrong.",
      loadError: "Không thể tải danh sách bài viết.",
      deleteError: "Không thể xóa bài viết.",
      deleteSuccess: "Xóa bài viết thành công.",
    },

    preview: {
      empty: "Your facebook content preview will appear here...",

      image: "Facebook Image Preview",
    },

    stats: {
      totalPosts: "Tổng bài viết",
    },

    header: {
      post: "Bài viết",
      url: "Liên kết",
      status: "Trạng thái",
      publishDate: "Ngày đăng",
      time: "Thời gian",
      hashtags: "Hashtags",
      actions: "Hành động",
    },

    filters: {
      allStatus: "Tất cả trạng thái",
      draft: "Bản nháp",
      scheduled: "Đã lên lịch",
      published: "Đã đăng",
    },

    posts: {
      search: "Tìm kiếm bài viết...",
      empty: "Không có bài viết nào",
      noPosts: "Không tìm thấy bài viết Facebook.",
      deleteTitle: "Xóa bài viết",
      deleteDescription: "Bạn có chắc muốn xóa bài viết này không?",
    },
    author: {
      connected: "Đã kết nối",
      notConnected: "Chưa kết nối",
      createdAt: "Ngày tạo",
      updatedAt: "Cập nhật lần cuối",

      status: {
        unknown: "Không xác định",
        expired: "Đã hết hạn",
        active: "Hoạt động",
      },

      messages: {
        loadFailed: "Tải cấu hình Facebook thất bại.",
        unableLoad: "Không thể tải cấu hình Facebook.",
        pageIdRequired: "Facebook Page ID là bắt buộc.",
        tokenRequired: "Page Access Token là bắt buộc.",
        saveFailed: "Lưu cấu hình thất bại.",
        updateSuccess: "Cập nhật cấu hình Facebook thành công.",
        createSuccess: "Tạo cấu hình Facebook thành công.",
        unexpected: "Đã xảy ra lỗi không mong muốn.",
      },

      guide: {
        title: "Thiết lập Facebook API",
        description: "Kết nối Facebook Page và cấu hình Meta Graph API để tự động đăng bài theo lịch.",
      },

      form: {
        defaultPage: "Trang Facebook",
        pageName: "Tên Facebook Page",
        pageNamePlaceholder: "Trang Facebook của tôi",
        pageId: "Facebook Page ID",
        pageIdPlaceholder: "Nhập Facebook Page ID",
        pageToken: "Page Access Token",
        pageTokenPlaceholder: "Nhập Facebook Page Access Token",
        autoPublish: "Tự động đăng bài",
        autoPublishDesc: "Tự động đăng các bài viết Facebook đã lên lịch.",
      },

      notes: {
        title: "Lưu ý quan trọng",
        note1: "Sử dụng Page Access Token thay vì User Token.",
        note2: "Khuyến khích sử dụng long-lived token.",
        note3: "Auto publish yêu cầu quyền Graph API hợp lệ.",
      },

      actions: {
        creating: "Đang tạo...",
        updating: "Đang cập nhật...",
        create: "Tạo cấu hình",
        update: "Cập nhật cấu hình",
      },

      steps: {
        metaAccount: {
          title: "Tạo tài khoản Meta Developer",

          description:
            "Trước tiên, bạn cần tạo tài khoản Meta Developer bằng tài khoản Facebook hiện tại. Meta có thể yêu cầu xác minh số điện thoại trước khi cho phép truy cập Graph API.",

          items: {
            login: "Đăng nhập bằng tài khoản Facebook",
            verify: "Xác minh số điện thoại hoặc email",
            policy: "Chấp nhận chính sách nền tảng Meta Developer",
            profile: "Hoàn tất đăng ký hồ sơ developer",
          },

          info: "Nếu không nhận được mã SMS xác minh, hãy thử dùng chế độ Ẩn danh hoặc trình duyệt khác.",

          action: "Mở Meta Developer",
        },

        createApp: {
          title: "Tạo Facebook App",

          description:
            "Tạo Facebook App để kết nối website hoặc CMS với Facebook Graph API. Ứng dụng này sẽ tạo các quyền cần thiết cho việc đăng bài tự động.",

          items: {
            create: 'Nhấn "Create App"',
            type: 'Chọn loại app "Other" hoặc "Business"',
            login: "Thêm sản phẩm Facebook Login",
            permission: "Bật quyền Graph API",
          },

          badges: {
            graph: "Graph API",
            pages: "Pages API",
            facebookLogin: "Facebook Login",
            business: "Business App",
          },

          info: "Bạn không cần App Review nếu chỉ sử dụng ứng dụng cho tài khoản Facebook cá nhân.",
        },

        generateToken: {
          title: "Tạo Page Access Token",

          description:
            "Tạo Facebook Page Access Token dài hạn bằng Graph API Explorer. Token này cần thiết cho việc đăng bài tự động theo lịch.",

          items: {
            select: "Chọn Facebook App trong API Explorer",
            generate: 'Nhấn "Generate Access Token"',
            permission: "Cấp quyền cho Facebook Page",
            convert: "Chuyển sang long-lived token",
          },

          badges: {
            manage: "pages_manage_posts",
            show: "pages_show_list",
            read: "pages_read_engagement",
            long: "Long-lived Token",
          },

          warning: "Hãy sử dụng Page Access Token thay vì User Access Token để đăng bài tự động.",

          action: "Mở API Explorer",
        },

        connectPage: {
          title: "Kết nối Facebook Page",

          description:
            "Sao chép Facebook Page ID và Page Access Token vào form cấu hình để kích hoạt đăng bài Facebook theo lịch.",

          items: {
            pageId: "Sao chép Facebook Page ID",
            token: "Dán Access Token dài hạn",
            auto: "Bật Auto Publish",
            save: "Lưu cấu hình",
          },

          badges: {
            pageId: "Page ID",
            token: "Access Token",
            auto: "Auto Publish",
            scheduler: "Scheduler",
          },

          info: "Hệ thống sẽ tự động đăng bài dựa trên thời gian publish đã lên lịch.",
        },
      },
    },
  },
  email: {
    dashboard: {
      title: "Email Marketing",
      live: "Đang hoạt động",

      meta: {
        provider: "Nhà cung cấp Email",
        subscribers: "Người đăng ký",
        campaigns: "Chiến dịch Email",
      },

      tabs: {
        provider: "Provider",
        subscribers: "Subscribers",
        campaign: "Campaign",
      },
    },
    campaign: {
      marketing: "EMAIL MARKETING",
      title: "Trung tâm Email Campaign",

      templates: "Mẫu Email",
      subscribers: "Người đăng ký",

      template: "Mẫu Email",
      loadingTemplates: "Đang tải mẫu email...",

      subject: "Tiêu đề",
      subjectPlaceholder: "Tiêu đề email",

      testEmail: "Email kiểm tra",
      testEmailPlaceholder: "example@gmail.com",

      sendTest: "Gửi thử",
      sending: "Đang gửi...",
      launch: "Gửi chiến dịch",

      missingSiteTitle: "Thiếu website",
      missingSiteMessage: "Vui lòng chọn website trước.",

      validationTitle: "Lỗi xác thực",
      validationTestEmail: "Vui lòng nhập địa chỉ email kiểm tra.",
      validationSubject: "Vui lòng nhập tiêu đề email.",
      validationContent: "Vui lòng nhập nội dung email.",

      emailSentTitle: "Đã gửi email",
      emailSentMessage: 'Email kiểm tra đã được gửi thành công tới "{email}".',

      sendFailedTitle: "Gửi thất bại",
      sendFailedMessage: "Không thể gửi email kiểm tra.",

      launchTitle: "Gửi chiến dịch?",
      launchMessage: 'Gửi "{subject}" tới {count} người đăng ký?',

      completedTitle: "Hoàn thành chiến dịch",
      failedTitle: "Chiến dịch thất bại",
      failedMessage: "Không thể gửi chiến dịch.",

      total: "Tổng",
      success: "Thành công",
      failed: "Thất bại",
    },
  },
  emailProvider: {
    loading: "Đang tải...",

    missingSiteTitle: "Thiếu website",
    missingSiteMessage: "Vui lòng chọn website trước.",

    configurationSavedTitle: "Đã lưu cấu hình",
    configurationSavedMessage: "Cấu hình Google OAuth đã được lưu thành công.",

    saveFailedTitle: "Lưu thất bại",
    saveFailedMessage: "Không thể lưu cấu hình Google OAuth.",

    disconnectedTitle: "Đã ngắt kết nối",
    disconnectedMessage: "Đã ngắt kết nối tài khoản Gmail thành công.",

    disconnectFailedTitle: "Ngắt kết nối thất bại",
    disconnectFailedMessage: "Không thể ngắt kết nối Gmail.",

    disconnectConfirmTitle: "Ngắt kết nối Gmail?",
    disconnectConfirmMessage: 'Ngắt kết nối tài khoản Gmail "{email}"? Hành động này sẽ xóa liên kết OAuth.',

    workspaceIntegration: "Tích hợp Google Workspace",
    connectGmailWith: "Kết nối Gmail với",
    googleOAuth: "Google OAuth 2.0",

    guideDescription:
      "Cấu hình Google Cloud, kích hoạt Gmail API và tạo thông tin OAuth để gửi email an toàn bằng tài khoản Google.",

    secureAuthentication: "Xác thực bảo mật",
    gmailApiReady: "Sẵn sàng Gmail API",
    setupInFiveMinutes: "Thiết lập trong 5 phút",

    googleProviderSettings: "Cài đặt Google Provider",
    googleProviderDescription: "Cấu hình OAuth và kết nối tài khoản Gmail.",

    googleClientId: "Google Client ID",
    googleClientSecret: "Google Client Secret",

    enterGoogleClientId: "Nhập Google Client ID",
    enterGoogleClientSecret: "Nhập Google Client Secret",

    saveConfiguration: "Lưu cấu hình",
    saving: "Đang lưu...",

    connectGmail: "Kết nối Gmail",

    connectedAccount: "Tài khoản đã kết nối",
    activeConnection: "Kết nối Gmail đang hoạt động",

    name: "Tên",
    email: "Email",

    disconnecting: "Đang ngắt kết nối...",
    disconnectGmail: "Ngắt kết nối Gmail",

    openGoogleCloudConsole: "Mở Google Cloud Console",
    createNewProject: "Tạo dự án mới",
    enableGmailApi: "Kích hoạt Gmail API",
    configureConsentScreen: "Cấu hình OAuth Consent Screen",
    createOAuthClientId: "Tạo OAuth Client ID",
    addRedirectUri: "Thêm Redirect URI",
    copyCredentials: "Sao chép thông tin xác thực",

    step1Title: "Mở Google Cloud Console",
    step1Description: "Truy cập Google Cloud Console và đăng nhập bằng tài khoản Google.",
    step1Link: "Mở Google Cloud Console",

    step2Title: "Tạo dự án mới",
    step2Description: "Chọn trình quản lý dự án và tạo dự án mới.",
    step2Item1: "Nhập tên dự án",
    step2Item2: "Chọn tổ chức (không bắt buộc)",
    step2Item3: "Nhấn Tạo",
    step2Link: "Tạo dự án",

    step3Title: "Kích hoạt Gmail API",
    step3Description: "Gmail API phải được bật trước khi gửi email.",
    step3Item1: "Mở APIs & Services",
    step3Item2: "Chọn Library",
    step3Item3: "Tìm Gmail API",
    step3Item4: "Nhấn Enable",
    step3Link: "Kích hoạt Gmail API",

    step4Title: "Cấu hình OAuth Consent Screen",
    step4Description: "Thiết lập thông tin hiển thị khi người dùng đăng nhập.",
    step4Item1: "Chọn External hoặc Internal",
    step4Item2: "Nhập tên ứng dụng",
    step4Item3: "Thêm email hỗ trợ",
    step4Item4: "Thêm email nhà phát triển",
    step4Item5: "Lưu và tiếp tục",
    step4Link: "Cấu hình Consent Screen",

    step5Title: "Tạo OAuth Client ID",
    step5Description: "Tạo thông tin OAuth cho ứng dụng.",
    step5Item1: "Mở Credentials",
    step5Item2: "Chọn Create Credentials",
    step5Item3: "Chọn OAuth Client ID",
    step5Item4: "Chọn Web Application",
    step5Link: "Mở Credentials",

    step6Title: "Thêm Redirect URI",
    step6Description: "Thêm URL bên dưới vào Authorized Redirect URIs.",
    step6Note: "Google sẽ chuyển hướng người dùng về ứng dụng qua URL này.",

    step7Title: "Sao chép thông tin xác thực",
    step7Description: "Sau khi tạo OAuth Client, sao chép các giá trị sau.",
    step7Item1: "Client ID",
    step7Item2: "Client Secret",
    step7Note: "Dán các giá trị này vào phần cấu hình Email Provider và lưu lại.",
  },
  emailSubscribers: {
    title: "Người đăng ký Email",
    badge: "EMAIL MARKETING",

    refresh: "Làm mới",
    refreshing: "Đang làm mới...",

    totalSubscribers: "Tổng người đăng ký",
    totalSubscribersDesc: "Tăng trưởng người nhận bản tin",

    activeUsers: "Người dùng hoạt động",
    activeUsersDesc: "Đang nhận email",

    inactiveUsers: "Người dùng không hoạt động",
    inactiveUsersDesc: "Liên hệ đã hủy đăng ký",

    filtered: "Đã lọc",

    searchResults: "Kết quả tìm kiếm",
    searchResultsDesc: "Số người đăng ký phù hợp",

    searchPlaceholder: "Tìm kiếm theo tên hoặc email...",

    subscriber: "Người đăng ký",
    status: "Trạng thái",
    subscribedDate: "Ngày đăng ký",

    loadingSubscribers: "Đang tải danh sách người đăng ký...",

    noSubscribersFound: "Không tìm thấy người đăng ký",
    noSubscribersFoundDesc: "Hiện không có người đăng ký nào phù hợp với điều kiện tìm kiếm.",

    unknownUser: "Người dùng không xác định",

    active: "Đang hoạt động",
    inactive: "Không hoạt động",
  },
  profile: {
    title: "Hồ sơ",
    loading: "Đang tải thông tin hồ sơ...",

    avatarModal: {
      title: "Tải ảnh đại diện",
      subtitle: "Chỉ chọn 1 ảnh • Có xem trước",

      dragDrop: "Kéo & thả ảnh vào đây",
      or: "hoặc",
      browse: "Bấm để chọn ảnh",

      preview: "Xem trước",
      noImage: "Chưa có ảnh",

      ready: "Sẵn sàng",
      noFileSelected: "Chưa chọn ảnh",

      remove: "Xóa",
      upload: "Tải lên",
      uploading: "Đang tải lên...",

      close: "Đóng",

      onlyImage: "Chỉ cho phép file ảnh (PNG/JPG/WEBP).",
      imageTooLarge: "Ảnh quá lớn. Tối đa 5MB.",
      selectImage: "Vui lòng chọn ảnh trước khi tải lên.",
      uploadFailed: "Tải ảnh thất bại.",

      previewAvatar: "Xem trước ảnh đại diện",
      currentAvatar: "Ảnh đại diện hiện tại",
      dialogLabel: "Tải ảnh đại diện",
    },
    hero: {
      title: "Hồ sơ quản trị",
      secureAccount: "Tài khoản bảo mật",
      profileManagement: "Quản lý hồ sơ",
      verifiedUser: "Người dùng đã xác thực",
      saveChanges: "Lưu thay đổi",
      saving: "Đang lưu...",
      avatar: "Ảnh đại diện",
      cover: "Ảnh bìa",
    },
    personal: {
      title: "Thông tin cá nhân",
      badge: "Hồ sơ",
      firstName: "Tên",
      lastName: "Họ",
      username: "Tên đăng nhập",
      email: "Email",
      phone: "Số điện thoại",
      gender: "Giới tính",
      selectGender: "Chọn giới tính",
      male: "Nam",
      female: "Nữ",
      other: "Khác",
      birthMonth: "Tháng sinh",
      birthDay: "Ngày sinh",
      birthYear: "Năm sinh",
    },
    store: {
      title: "Thông tin cửa hàng",
      badge: "Hồ sơ người bán",
      shopName: "Tên cửa hàng",
      shopSlug: "Đường dẫn cửa hàng",
      slogan: "Khẩu hiệu",
      website: "Website",
      websitePlaceholder: "https://yourshop.com",
      logo: "Logo cửa hàng",
      uploadLogo: "Tải logo",
      banner: "Banner cửa hàng",
      uploadBanner: "Tải banner",
      description: "Mô tả cửa hàng",
      bio: "Giới thiệu cửa hàng",
      cover: "Ảnh bìa",
      uploadCover: "Tải ảnh bìa",
    },
    address: {
      title: "Thông tin địa chỉ",
      badge: "Vị trí",

      streetAddress: "Địa chỉ",
      streetAddressPlaceholder: "Nhập địa chỉ của bạn...",

      ward: "Phường/Xã",
      district: "Quận/Huyện",
      city: "Thành phố",
      country: "Quốc gia",

      preview: "Xem trước địa chỉ",
      noAddress: "Chưa có thông tin địa chỉ",
    },
  },
  adminChat: {
    failedLoadConversations: "Không thể tải danh sách cuộc trò chuyện.",
    failedLoadFriends: "Không thể tải danh sách bạn bè.",
    failedLoadRequests: "Không thể tải lời mời kết bạn.",

    acceptFailed: "Chấp nhận lời mời thất bại.",
    requestSent: "Đã gửi lời mời kết bạn. Chờ đối phương chấp nhận.",
    requestAccepted: "Đã chấp nhận lời mời kết bạn.",

    sendRequestFailed: "Gửi lời mời kết bạn thất bại.",
    cannotStartChat: "Không thể bắt đầu cuộc trò chuyện.",
    missingConversationId: "Thiếu conversationId.",

    userNotFound: "Không tìm thấy người dùng với email này.",
    cannotAddSelf: "Bạn không thể tự kết bạn với chính mình.",
    requestAlreadySent: "Bạn đã gửi lời mời trước đó.",
    alreadyFriend: "Hai bạn đã là bạn bè rồi.",
    blocked: "Không thể gửi lời mời (đã bị chặn).",
    notFriend: "Bạn chưa kết bạn với người này (chỉ chat sau khi đã chấp nhận lời mời).",
    failedLoadMessages: "Không thể tải tin nhắn.",
    sendFailed: "Gửi tin nhắn thất bại.",

    me: "Tôi",
    user: "Người dùng",

    ablySubscribeInboxFailed: "Đăng ký kênh inbox thất bại.",
    ablySubscribeChatFailed: "Đăng ký kênh chat thất bại.",
    chats: "Chats",
    teamInbox: "Hộp thư nhóm",

    newChatFriends: "Chat mới / Bạn bè",
    refreshChats: "Làm mới cuộc trò chuyện",

    friends: "Bạn bè",
    requests: "Lời mời",
    add: "Thêm",
    close: "Đóng",

    loadingFriends: "Đang tải danh sách bạn bè...",
    noFriendsYet: "Chưa có bạn bè",
    noFriendsDesc: "Vào mục Thêm để gửi lời mời hoặc kiểm tra mục Lời mời để chấp nhận kết bạn.",

    chatWith: "Chat với",

    incomingRequests: "Lời mời kết bạn",
    incomingRequestsDesc: "Xem và phản hồi các lời mời kết bạn mới",

    refreshRequests: "Làm mới lời mời",
    loadingRequests: "Đang tải lời mời...",
    noRequests: "Không có lời mời kết bạn nào.",

    accept: "Chấp nhận",

    addFriendByEmail: "Thêm bạn bằng email",
    addFriendPlaceholder: "Nhập email để kết bạn (ví dụ: admin1@example.com)",

    sendFriendRequest: "Gửi lời mời kết bạn",
    sending: "Đang gửi...",

    tip: "Người nhận phải vào tab Requests để Accept thì bạn mới chat được.",

    searchChats: "Tìm kiếm cuộc trò chuyện...",
    clear: "Xóa",

    all: "Tất cả",
    unread: "Chưa đọc",
    pinned: "Đã ghim",

    loadingChats: "Đang tải cuộc trò chuyện...",
    noChats: "Chưa có cuộc trò chuyện",

    pinnedTitle: "Đã ghim",
    header: {
      searchThread: "Tìm kiếm trong cuộc trò chuyện...",
      noResults: "Không có kết quả",
      resultOf: "{current} / {total}",

      previous: "Trước",
      next: "Tiếp",
      closeSearch: "Đóng tìm kiếm",

      workspace: "Không gian làm việc",
      messages: "Tin nhắn",
      members: "thành viên",

      searchMessages: "Tìm kiếm tin nhắn",
      info: "Thông tin",
      addMember: "Thêm thành viên",
      more: "Thêm",
    },
    thread: {
      today: "Hôm nay",

      loadingMessages: "Đang tải tin nhắn...",
      noMessages: "Chưa có tin nhắn",

      all: "Tất cả",

      react: "Thả cảm xúc",
      reply: "Trả lời",
      more: "Thêm",
    },
    composer: {
      messagePlaceholder: "Nhắn tin cho {chat}",

      enter: "Enter",
      toSend: "để gửi",

      textColor: "Màu chữ",
      emoji: "Biểu tượng cảm xúc",
      mention: "Nhắc đến",
      attachLink: "Đính kèm liên kết",

      pasteLink: "Dán liên kết vào đây (https://...)",

      send: "Gửi",
      sending: "Đang gửi...",
    },
  },
};

export default vi;
