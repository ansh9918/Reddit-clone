import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/header/Header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SanityLive } from "@/sanity/lib/live";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Reddish",
    description: "A reddit clone",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ClerkProvider
            publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
            <html lang="en">
                <body
                    className={`${geistSans.variable} ${geistMono.variable} antialiased scroll-smooth`}>
                    <SidebarProvider>
                        <AppSidebar />
                        <SidebarInset>
                            <Header />
                            {children}
                        </SidebarInset>
                    </SidebarProvider>
                    <SanityLive />
                </body>
            </html>
        </ClerkProvider>
    );
}
