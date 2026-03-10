npm run prisma:reset

npm run prisma:migrate -- --name friends_block

Chạy xem dữ liệu
npm run prisma:studio

CSS
import styles from "@/styles/admin/login/login.module.css";
import styles from "@/styles/admin/profile/messages.module.css";

npm run prisma:migrate -- --name add_profile

npm run prisma:merge
npm run prisma:validate
npm run prisma:migrate -- --name add_profile
DATABASE_URL="mysql://root:@localhost:3306/shoppingtool"
ABLY_API_KEY=xxxx:yyyy
src/
│
├── app/ # App Router (Next 16)
│ ├── (public)/
│ ├── (admin)/
│ │ ├── builder/
│ │ ├── editor/
│ │ └── layout.tsx
│ │
│ ├── api/
│ │ └── v1/
│ │
│ ├── layout.tsx
│ └── page.tsx
│
├── core/ # 🧠 Lowcode engine core
│ ├── renderer/
│ ├── registry/
│ ├── schema/
│ ├── runtime/
│ └── hooks/
│
├── modules/ # Feature modules (business)
│ ├── user/
│ ├── product/
│ └── dashboard/
│
├── components/ # Reusable UI components
│ ├── ui/ # atomic (button, input, card)
│ ├── blocks/ # composed blocks
│ └── layout/
│
├── services/ # API client / server actions
│ ├── api-client.ts
│ └── server-actions/
│
├── store/ # Zustand / Redux / Jotai
│
├── lib/ # utils, helpers
│
├── config/ # system config
│
├── types/
│
└── styles/

1. Bộ lọc thời gian

Nên có 1 bộ lọc ở đầu trang:

Tháng

Năm

Ví dụ:

March 2026

February 2026

Như vậy toàn bộ widget bên dưới sẽ đồng bộ theo cùng một khoảng thời gian.

2. 4 card đầu tiên
   Revenue

Hiển thị:

Tổng doanh thu trong tháng

So với tháng trước tăng/giảm bao nhiêu %

Ví dụ:

Revenue: 45,200,000đ

+12.5% vs last month

Orders

Hiển thị:

Tổng số đơn trong tháng

Có thể thêm Paid Orders

Ví dụ:

Orders: 186

+8.2% vs last month

Visitors

Hiển thị:

Tổng lượt truy cập trong tháng

Ví dụ:

Visitors: 12,450

+5.1% vs last month

Conversion

Hiển thị:

Tỷ lệ chuyển đổi tháng

Công thức:

Conversion = Orders / Visitors \* 100

Ví dụ:

Conversion: 1.49%

3. Revenue Chart

Khối này rất quan trọng.

Nên vẽ:

trục X: từng ngày trong tháng

trục Y: doanh thu mỗi ngày

Ví dụ tháng 3:

01/03

02/03

03/03

...

Bạn có thể thêm toggle:

Daily Revenue

Cumulative Revenue

Nếu muốn đơn giản thì chỉ cần Daily Revenue là đủ.

4. Top Products

Nên hiển thị top 5 hoặc top 10 sản phẩm bán tốt nhất trong tháng.

Cột nên có:

Tên sản phẩm

Số lượng bán

Doanh thu

Tỷ trọng doanh thu

Ví dụ:

Product Sold Revenue
Áo thun basic 42 8,400,000đ
Quần jeans 25 7,500,000đ
Túi đeo chéo 18 5,400,000đ 5) Traffic Sources

Hiển thị nguồn truy cập trong tháng.

Ví dụ:

Direct

Google

Facebook

TikTok

Email

Other

Có thể dùng:

pie chart

hoặc bảng phần trăm

Ví dụ:

Source Visitors %
Google 5,200 41.8%
Facebook 3,100 24.9%
Direct 2,400 19.3% 6) Customer Analytics

Khối này nên đơn giản, dễ đọc.

Nên có:

New Customers

Returning Customers

Total Customers Purchased

Ví dụ:

Metric Value
New Customers 84
Returning Customers 39
Total Purchasing Customers 123

Nếu muốn thêm sau này:

repeat purchase rate

7. Email Analytics

Nếu web bạn có gửi mail thì khối này rất đáng giữ.

Nên có:

Emails Sent

Delivered

Opened

Failed

Open Rate

Ví dụ:

Metric Value
Emails Sent 2,400
Delivered 2,320
Opened 1,180
Failed 80
Open Rate 50.9% 8) Refund / Failed Orders

Khối này giúp bạn nhìn rủi ro vận hành.

Nên có:

Refunded Orders

Failed Orders

Cancelled Orders nếu có

Ví dụ:

Metric Value
Refunded 6
Failed 4 9) Database tối thiểu cần có

Để làm đúng dashboard này theo tháng, thường bạn cần ít nhất:

orders

order_items

products

visitors hoặc page_views

email_logs

users

Bước 1:
tôi đang sử dụng next 16 .Bạn hãy kiểm tra giúp tôi các bug ẩn dư thừa khiến tiêu tốn tài nguyên không cần thiết nhé. với lại hãy kiểm tra kỹ giúp tôi về cách sử dụng useEffect có hợp lệ chưa nhé và hãy chỉnh sửa các model cho phù hợp với phong cách chuyên nghiệp nhé. hiện tại đang lỗi any bạn hãy sửa giúp tôi nhé Unexpected any. Specify a different type.eslint@typescript-eslint/no-explicit-any

Bước 2.
Hiện tại phần design này chưa được đẹp bạn có thể dộ và thêm một số tính năng search giúp tôi được không nếu có thể hãy thêm phần panigation phần trang nửa nhé để tiện lợi chuyên sâu hơn cho người sử dụng nếu có thể. Hãy tách next js 16 và css module những chỗ dã thêm cho phù hợp và chuyên nghiệp hơn nhé

Bước 3:
import { usePageFunctionKeys } from "@/components/admin/shared/hooks/usePageFunctionKeys";
const functionKeyActions = useMemo(
() => ({
F3: handleDelete,
F5: ,
F6: ,
F10: ,
}),
[handleDelete, handleEnterEditMode, onF10, onF11],
);

Hiện tại tôi muốn thêm F3 sẽ là delete,F5 là Create customer, F6 là Edit, F10 là save. Bạn hãy giúp tôi thêm vào có được không

Bước 4.
Vậy bạn hãy sửa và thêm và ghi lại toàn bộ file nhé hiện tại tôi đã có
import { useModal } from "@/components/admin/shared/common/modal";
modal.success("Success", `Deleted “${current.name}” successfully.`);
modal.error("Missing site", "Please select a site first.");
onClick={() =>
modal.confirmDelete(
"Delete category?",
`Delete “${active.name}”? This action cannot be undone.`,
() => removeCategory(active.id),
)
}
Bước 5:
src/features/commerce/categories/messages.ts
Vậy page này sẽ sửa lại như nào với lại bạn kiểm tra giúp tôi ở đây có validation.ts hay messages.ts gì không nhé Đây là file page.tsx của categories tôi muốn bạn lấy những message đang có trong page hãy thêm vào \_MESSAGES và Bạn hãy sửa và ghi lại page.tsx theo phong cách chuyên nghiệp được không

Hãy chỉnh sửa và thêm giúp tôi. và ghi lại toàn bộ file giúp tôi nhé

Bước 6
Hiện tại tôi đã tạo constants/api.ts
export const API_ROUTES = {
ADMIN_BRAND: {
\_API: "/api/admin/commerce/brands",
}
} as const;

Bước 7:
tôi đang sử dụng next 16 Hiện tại mục folder store với mục service trong next js sẽ thực hiện những gì
vậy bạn hãy tách store và service trông file code này giúp tôi nhé
