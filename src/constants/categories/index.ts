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

export type PresetCategory = {
  name: string;
  children?: string[];
};

export type EcommercePreset = {
  key: EcommercePresetKey;
  label: string;
  categories: PresetCategory[];
};

export const WEBSITE_TYPES = [
  { value: "ecommerce", label: "Ecommerce" },
  { value: "other", label: "Khác" },
] as const;

export const ECOMMERCE_CATEGORY_PRESETS: EcommercePreset[] = [
  {
    key: "cosmetics",
    label: "Mỹ phẩm",
    categories: [
      { name: "Chăm sóc da", children: ["Sữa rửa mặt", "Toner", "Serum", "Kem dưỡng", "Kem chống nắng"] },
      { name: "Trang điểm", children: ["Son", "Phấn nền", "Kem nền", "Mascara", "Kẻ mắt"] },
      { name: "Chăm sóc tóc", children: ["Dầu gội", "Dầu xả", "Kem ủ", "Tinh dầu tóc"] },
      { name: "Nước hoa", children: ["Nước hoa nam", "Nước hoa nữ", "Xịt thơm cơ thể"] },
    ],
  },
  {
    key: "electronics",
    label: "Đồ điện tử",
    categories: [
      { name: "Điện thoại", children: ["Android", "iPhone", "Phụ kiện điện thoại"] },
      { name: "Laptop", children: ["Laptop văn phòng", "Laptop gaming", "Phụ kiện laptop"] },
      { name: "Âm thanh", children: ["Tai nghe", "Loa", "Micro"] },
      { name: "Thiết bị thông minh", children: ["Đồng hồ thông minh", "Camera", "Thiết bị nhà thông minh"] },
    ],
  },
  {
    key: "accessories",
    label: "Phụ kiện",
    categories: [
      { name: "Phụ kiện thời trang", children: ["Túi xách", "Ví", "Thắt lưng", "Kính mắt"] },
      { name: "Phụ kiện công nghệ", children: ["Sạc", "Cáp", "Pin dự phòng", "Giá đỡ điện thoại"] },
      { name: "Trang sức", children: ["Nhẫn", "Vòng tay", "Dây chuyền", "Bông tai"] },
    ],
  },
  {
    key: "fashion",
    label: "Quần áo",
    categories: [
      { name: "Thời trang nam", children: ["Áo thun", "Áo sơ mi", "Quần jean", "Quần short"] },
      { name: "Thời trang nữ", children: ["Đầm váy", "Áo kiểu", "Quần", "Chân váy"] },
      { name: "Thời trang trẻ em", children: ["Bé trai", "Bé gái"] },
    ],
  },
  {
    key: "shoes",
    label: "Giày dép",
    categories: [
      { name: "Giày nam", children: ["Sneaker", "Giày tây", "Sandal"] },
      { name: "Giày nữ", children: ["Cao gót", "Sneaker", "Sandal", "Búp bê"] },
      { name: "Dép", children: ["Dép đi trong nhà", "Dép thời trang"] },
    ],
  },
  {
    key: "home",
    label: "Đồ gia dụng",
    categories: [
      { name: "Nhà bếp", children: ["Nồi chảo", "Dao kéo", "Hộp đựng thực phẩm"] },
      { name: "Điện gia dụng", children: ["Nồi cơm điện", "Máy xay", "Ấm siêu tốc", "Quạt"] },
      { name: "Trang trí nhà cửa", children: ["Đèn", "Tranh", "Rèm cửa"] },
      { name: "Dọn dẹp", children: ["Cây lau nhà", "Nước lau sàn", "Máy hút bụi"] },
    ],
  },
  {
    key: "stationery",
    label: "Văn phòng phẩm",
    categories: [
      { name: "Dụng cụ viết", children: ["Bút bi", "Bút chì", "Bút highlight"] },
      { name: "Sổ & giấy", children: ["Sổ tay", "Giấy note", "Giấy in"] },
      { name: "Dụng cụ văn phòng", children: ["Bấm kim", "Kẹp giấy", "File hồ sơ"] },
    ],
  },
  {
    key: "mother-baby",
    label: "Mẹ & bé",
    categories: [
      { name: "Đồ cho bé", children: ["Tã bỉm", "Sữa", "Bình sữa", "Đồ chơi"] },
      { name: "Thời trang bé", children: ["Quần áo bé trai", "Quần áo bé gái"] },
      { name: "Đồ cho mẹ", children: ["Máy hút sữa", "Túi trữ sữa", "Đồ dùng sau sinh"] },
    ],
  },
  {
    key: "food",
    label: "Thực phẩm",
    categories: [
      { name: "Đồ ăn vặt", children: ["Snack", "Bánh", "Kẹo"] },
      { name: "Đồ uống", children: ["Cà phê", "Trà", "Nước ép"] },
      { name: "Thực phẩm khô", children: ["Mì", "Gạo", "Hạt", "Gia vị"] },
    ],
  },
  {
    key: "sports",
    label: "Thể thao",
    categories: [
      { name: "Quần áo thể thao", children: ["Áo", "Quần", "Bộ tập"] },
      { name: "Dụng cụ tập luyện", children: ["Tạ", "Thảm yoga", "Dây kháng lực"] },
      { name: "Phụ kiện thể thao", children: ["Bình nước", "Túi thể thao", "Găng tay"] },
    ],
  },
];
