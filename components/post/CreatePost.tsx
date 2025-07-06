"use client";

import { useUser } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";

const CreatePost = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { user } = useUser();

    const handleCreatePost = () => {
        const communityName = pathname.includes("/community/")
            ? pathname.split("/community/")[1]
            : null;

        if (communityName) {
            router.push(`/create-post?subreddit=${communityName}`);
        } else {
            // Otherwise just go to the create post page
            router.push("/create-post");
        }
    };

    return (
        <Button onClick={handleCreatePost} disabled={!user}>
            <Plus className="w-4 h-4 mr-2" />
            {user ? "Create Post" : "Sign in to create post"}
        </Button>
    );
};

export default CreatePost;
