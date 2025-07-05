import { currentUser } from "@clerk/nextjs/server";
import { adminClient } from "../adminClient";
import { defineQuery } from "groq";
import { sanityFetch } from "../live";

interface UserResult {
    _id: string;
    username: string;
    imageUrl: string;
    email: string;
}

const parseUsername = (username: string) => {
    // Remove whitespace and convert to camelCase with random number to avoid conflicts
    const randomNum = Math.floor(1000 + Math.random() * 9000);

    // Convert whitespace to camelCase and add random number to avoid conflicts
    return (
        username
            .replace(/\s+(.)/g, (_, char) => char.toUpperCase()) // Convert whitespace to camelCase
            .replace(/\s+/g, "") + randomNum // Remove all whitespace and add random number
    );
};

export async function addUser({
    id,
    username,
    email,
    imageUrl,
}: {
    id: string;
    username: string;
    email: string;
    imageUrl: string;
}) {
    const user = await adminClient.createIfNotExists({
        _id: id,
        _type: "user",
        username,
        email,
        imageUrl,
        joinedAt: new Date().toISOString(),
    });

    return user;
}

export async function getUser(): Promise<UserResult | { error: string }> {
    try {
        const loggedInUser = await currentUser();

        if (!loggedInUser) {
            console.log("No user logged in");
            return { error: "User not found" };
        }
        console.log(`Found Clerk user: ${loggedInUser.id}`);

        const getExistingUserQuery = defineQuery(
            `*[_type == "user" && _id == $id][0]`,
        );

        console.log("Checking if user exists in Sanity database");

        const existingUser = await sanityFetch({
            query: getExistingUserQuery,
            params: { id: loggedInUser.id },
        });

        if (existingUser.data?._id) {
            console.log(
                `User found in database with ID: ${existingUser.data._id}`,
            );
            const user = {
                _id: existingUser.data._id,
                username: existingUser.data.username!,
                imageUrl: existingUser.data.imageUrl!,
                email: existingUser.data.email!,
            };

            return user;
        }
        console.log("User not found in database, creating new user");

        const newUser = await addUser({
            id: loggedInUser.id,
            username: parseUsername(loggedInUser.fullName!),
            email:
                loggedInUser.primaryEmailAddress?.emailAddress ||
                loggedInUser.emailAddresses[0].emailAddress,
            imageUrl: loggedInUser.imageUrl,
        });

        console.log(`New user created with ID: ${newUser._id}`);
        const user = {
            _id: newUser._id,
            username: newUser.username!,
            imageUrl: newUser.imageUrl,
            email: newUser.email,
        };

        return user;
    } catch (error) {
        console.error("Error getting user:", error);
        return { error: "Failed to get user" };
    }
}
