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

sang kiểu core (schema + renderer + runtime + action registry) theo mức MVP đủ chạy (không over-engineer), và vẫn dùng API route Prisma bạn đã có (không đổi).

tôi muốn chuyển service và store bạn có thể tách giúp tôi được không

Folder Vai trò
lib hạ tầng (db, auth helpers, fetch wrapper)
services business/service layer
features domain module
constants enum/static
utils pure helpers

tôi muốn tách services/builder/menus/index.ts và store/builder/menus/index.ts và features/builder/menus/errors.ts, features/builder/menus/messages.ts, features/builder/menus/types.ts, features/builder/menus/validation.ts

tôi đang sử dụng next 16 Hiện tại mục folder store với mục service trong next js sẽ thực hiện những gì
vậy bạn hãy tách store và service trông file code này giúp tôi nhé
Vậy page này sẽ sửa lại như nào với lại bạn kiểm tra giúp tôi ở đây có validation.ts hay messages.ts gì không nhé

Đây là file AllowedBlocks.tsx tôi muốn bạn lấy những message đang có trong page hãy thêm vào MENU_MESSAGES và Bạn hãy sửa và ghi lại AllowedBlocks.tsx theo phong cách chuyên nghiệp được không
