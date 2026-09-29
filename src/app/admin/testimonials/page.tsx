'use client';
import AdminPageTitle from '@/components/admin/layouts/AdminPageTitle';
import dynamic from 'next/dynamic';
const TestimonialBuilder = dynamic(
    () => import('@/components/admin/testimonials/testimonial-list'),
    {
        ssr: false,
    },
);

export default function Page() {
    return (
        <main>
            <AdminPageTitle title="testimonials Builder" />
            <TestimonialBuilder />
        </main>
    );
}
