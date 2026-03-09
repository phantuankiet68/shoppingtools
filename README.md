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
