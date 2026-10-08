background: #f6f8fc;

Bạn hãy ở vị trí serior front end với 10 năm kinh nghiệm hãy kiểm tra giúp tôi xem có bug ẩn không có thiếu field nào trong model TemplateCategory không nhé nếu thiếu hãy thêm vào giúp tôi. đặt biệt hãy tối ưu code lại ngắn gon hơn nhé

TỪ BenefitService01 Bạn có thể tạo giúp tôi TestimonialService01 tương tự giống ảnh. Tôi đang sử dụng next 16 và css module. tôi muốn bạn là front-end developer với 15 năm kinh nghiệm. Bạn hãy tạo testimonial-service-01.tsx theo phong cách mới mẽ và chuyên nghiệp mang tính thẩm mĩ dựa trên cấu trúc mẫu testimonial-service-01 export const BENEFIT_SERVICE_01: RegItem với phần kind, label , defaults, inspector Nhầm mục đích thao tạc chỉnh sửa nội dung. Lưu ý không sử dụng icon từ lucide-react mà sử dụng icon bootstrapt nhé. Hẫy tạo design giống với hình ảnh nhé

Email Password
superadmin@example.com
phantuankiet@123
admin1@example.com
admin@123
admin2@example.com
123456

Chạy xem dữ liệu
npm run prisma:studio

CSS
import styles from "@/styles/admin/login/login.module.css";
import styles from "@/styles/admin/profile/messages.module.css";

npm run prisma:migrate -- --name add_profile

từ design bên trên bạn có thể độ lại Ui design qtheo phong cách mới mẽ và chuyên nghiệp. có thêm phần thú vị và màu sắc sáng để người dùng có được sự thu hút không . Hãy tạo hình ảnh nhé

Hiện tại đây là template tôi vừa mới tạo bạn hãy cải tạo giống với template chuẩn giúp tôi. Hãy ở cương vị serior front-end developer làm việc này giúp tôi. lưu ý hiện tại còn rất nhiều text chưa được lưu thuộc tính vào drop và nếu thấy bug ẩn hay dư thưa hãy hướng dẫn tôi chỉnh sửa nhé

sửa tiếp nội dung SignIn01Props nhé lưu ý nếu có text hãy thêm thuộc tính drop vào SignIn01Props và ghi lại toàn bộ giúp tôi nhé

thường thì được setup pathName: {

        sourceLocale: 'en',

        default: 'Service',

        translations: {

            vi: 'Dịch vụ',

            ja: 'サービス',

        },

    },

Bạn hãy chỉnh giúp tôi nhé nếu nhiều quá thì hãy lưu ý đừng một dòng xuống một dòng nhé tốn nhiều với lại nếu nhiều quá hãy chia làm 3 phần nhé. hãy dịch chuẩn giúp tôi

tạo DEFAULT_PROPS giúp tôi nhé

Hiện tại tôi muốn tạo list site mannager để quản lý toàn bộ site đã được đăng ký. tôi đang sử dụng công nghệ next 16, prisma 7.8.0, và css module. Bạn hãy ở cương vị là serior front-end developer hãy tạo bố cục giống với ảnh nhưng khác về nội dụng. và hãy độ lại có thêm icon mắt để link đến domain site để kiểm tra và thêm nút khóa nửa nhé

Bạn ở vị trí serior back end developer với 8 năm kinh nghiệm hãy review lại giúp tôi xem có bug ẩn hay không chỉnh, và kiểm tra xem có thể tạo help rồi rút gon code sách hơn nhé. Lưu ý hãy check giúp tôi xem đã có check auth chưa nhé import { getCurrentSession } from '@/lib/auth/session'; và ghi lại toàn bộ file hoàn chỉnh sau khi đã chỉnh sửa nhé
Vui long chỉnh sửa và ghi lại toàn bộ testimonial-list.tsx. ngoài ra tôi đã có import { useModal } from "@/components/admin/shared/common/modal"; const modal = useModal();   cách sử dụng modal.error(t("brands.modal.loadFailed"), error instanceof Error ? error.message : t("brands.modal.loadFailed"));  modal.confirmDelete(

        t("brands.modal.deleteBrand"),

        t("brands.modal.deleteBrandConfirm").replace("{name}", brand.name),

        async () => {

          try {

            setSelectedBrandId(brand.id);

            await deleteBrand();

            modal.success(t("brands.modal.success"), t("brands.modal.deletedSuccess").replace("{name}", brand.name));

          } catch (error: unknown) {

            modal.error(

              t("brands.modal.deleteFailed"),

              error instanceof Error ? error.message : t("brands.modal.deleteFailed"),

            );

          }

        },

      ); vui long hãy chỉnh sửa và thêm giúp tôi nhé. Thêm phần về translate ngôn ngữ tôi đã có import { useAdminI18n } from "@/components/admin/providers/AdminI18nProvider";  const { t } = useAdminI18n(); cách sửa dung {t("brands.form.brandName")}

Tiếp theo bạn hãy chỉnh sửa lại blog-01.tsx loại bỏ những thứ không cần thiết và thay vào đó là app/api/v1/blog/[id]/route.ts và app/api/v1/blog/route.ts . lưu ý nếu như những bug ẩn không được sử dụng hãy xóa ra. Và siteId được lấy ra giống ở file portfolio-service-01.tsx nhé. Vui lòng ghi gọn code và không xuống dòng tùy tiện để code sạch hơn và chuyên nghiệp hơn. Sau khi chỉnh sửa hãy ghi lại toàn bộ file blog-01.tsx hoàn chỉnh .Hiện tại bạn hãy giữ Ui cũ nhé các class Name không được thay đổi các thẻ được sử dụng cứ giữ nguyên á. NGoài ra nếu như Không có data thì hãy thêm 1 data mẫu nhé
