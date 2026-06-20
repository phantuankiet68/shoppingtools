import { ToastProvider } from '@/components/ui/ToastCenter';
import 'bootstrap-icons/font/bootstrap-icons.css';
import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const poppins = {
    variable: '',
};

export const metadata: Metadata = {
    title: 'Admin',
    description: 'Admin dashboard',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={poppins.variable}>
            <body className="antialiased">
                <ToastProvider>
                    {children}

                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 4000,
                        }}
                    />
                </ToastProvider>
            </body>
        </html>
    );
}
