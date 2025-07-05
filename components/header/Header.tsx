"use client";

import { SignedOut, SignInButton, UserButton, SignedIn } from "@clerk/nextjs";
import { Button } from "../ui/button";
import { useSidebar } from "../ui/sidebar";
import { ChevronLeftIcon, MenuIcon } from "lucide-react";
import Image from "next/image";
import ReddishLogo from "@/images/Reddish Full.png";
import ReddishLogoOnly from "@/images/Reddish Logo Only.png";

const Header = () => {
    const { toggleSidebar, isMobile, open } = useSidebar();

    return (
        <header className="flex items-center justify-between border-b border-gray-200 p-4 h-[70px]">
            <div className="flex items-center">
                {open && !isMobile ? (
                    <ChevronLeftIcon
                        className="h-6 w-6"
                        onClick={toggleSidebar}
                    />
                ) : (
                    <div className="flex items-center gap-2">
                        <MenuIcon className="h-6 w-6" onClick={toggleSidebar} />
                        <Image
                            src={ReddishLogo}
                            alt="logo"
                            width={150}
                            height={150}
                            className="hidden md:block"
                        />
                        <Image
                            src={ReddishLogoOnly}
                            alt="logo"
                            width={40}
                            height={40}
                            className="block md:hidden"
                        />
                    </div>
                )}
            </div>
            <div>
                <SignedIn>
                    <UserButton />
                </SignedIn>
                <SignedOut>
                    <Button asChild variant="outline">
                        <SignInButton mode="modal" />
                    </Button>
                </SignedOut>
            </div>
        </header>
    );
};

export default Header;
