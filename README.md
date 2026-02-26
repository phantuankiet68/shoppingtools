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
