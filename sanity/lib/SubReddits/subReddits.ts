import { defineQuery } from "groq";
import { sanityFetch } from "../live";
import { adminClient } from "../adminClient";
import { Subreddit } from "@/sanity.types";
import { ImageData } from "@/action/createCommunity";

export async function getSubReddits() {
    const getSubRedditsQuery = defineQuery(`*[_type == "subreddit"] {
        ...,
        "slug": slug.current,
        "moderator": moderator->,
      } | order(createdAt desc)`);

    try {
        const subReddits = await sanityFetch({ query: getSubRedditsQuery });

        return subReddits.data;
    } catch (error) {
        console.error(error);
    }
}

export async function createSubreddit(
    name: string,
    moderatorId: string,
    imageData: ImageData | null,
    customSlug?: string,
    customDescription?: string,
) {
    console.log(`Creating subreddit: ${name} with moderator: ${moderatorId}`);

    try {
        const checkExistingQuery = defineQuery(`
            *[_type == "subreddit" && title == $name][0] {
              _id
            }
          `);

        const existingSubreddit = await sanityFetch({
            query: checkExistingQuery,
            params: { name },
        });

        if (existingSubreddit.data) {
            console.log(`subreddit "${name}" already exists`);
            return { error: "A subreedit with this name already exists" };
        }

        if (customSlug) {
            const checkSlugQuery = defineQuery(`
                *[_type == "subreddit" && slug.current == $slug][0] {
                  _id
                }
              `);

            const existingSlug = await sanityFetch({
                query: checkSlugQuery,
                params: { slug: customSlug },
            });

            if (existingSlug.data) {
                console.log(
                    `Subreddit with slug "${customSlug}" already exists`,
                );
                return { error: "A subreddit with this URL already exists" };
            }
        }

        const slug = customSlug || name.toLowerCase().replace(/\s+/g, "-");

        let ImageAsset;
        if (imageData) {
            try {
                const base64Data = imageData.base64.split(",")[1];

                const buffer = Buffer.from(base64Data, "base64");

                ImageAsset = await adminClient.assets.upload("image", buffer, {
                    filename: imageData.filename,
                    contentType: imageData.contentType,
                });

                console.log("Image asset", ImageAsset);
            } catch (error) {
                console.error("Error uploading image:", error);
            }
        }

        const subredditDoc: Partial<Subreddit> = {
            _type: "subreddit",
            title: name,
            description: customDescription || `Welcome to r/${name}`,
            slug: {
                current: slug,
                _type: "slug",
            },
            moderator: {
                _type: "reference",
                _ref: moderatorId,
            },
            createdAt: new Date().toISOString(),
        };

        if (ImageAsset) {
            subredditDoc.image = {
                _type: "image",
                asset: {
                    _type: "reference",
                    _ref: ImageAsset._id,
                },
            };
        }

        const subreddit = await adminClient.create(subredditDoc as Subreddit);

        console.log(`Subreddit created successfully with ID: ${subreddit._id}`);

        return { subreddit };
    } catch (error) {
        console.error("Error creating subreddit:", error);
        return { error: "Failed to create subreddit" };
    }
}

export async function getPostsForSubreddit(id: string) {
    const getPostsForSubredditQuery = defineQuery(`
        *[_type == "post" && subreddit._ref == $id] {
          ...,
          "slug": slug.current,
          "author": author->,
          "subreddit": subreddit->,
          "category": category->,
          "upvotes": count(*[_type == "vote" && post._ref == ^._id && voteType == "upvote"]),
          "downvotes": count(*[_type == "vote" && post._ref == ^._id && voteType == "downvote"]),
          "netScore": count(*[_type == "vote" && post._ref == ^._id && voteType == "upvote"]) - count(*[_type == "vote" && post._ref == ^._id && voteType == "downvote"]),
          "commentCount": count(*[_type == "comment" && post._ref == ^._id])
        } | order(publishedAt desc) 
      `);

    const result = await sanityFetch({
        query: getPostsForSubredditQuery,
        params: { id },
    });

    return result.data;
}

export async function getSubredditbySlug(slug: string) {
    const lowerCaseSlug = slug.toLowerCase();
    const getSubredditBySlugQuery =
        defineQuery(`*[_type == "subreddit" && slug.current == $slug][0] {
      ...,
      "slug": slug.current,
      "moderator": moderator->,
    }`);

    const subreddit = await sanityFetch({
        query: getSubredditBySlugQuery,
        params: { slug: lowerCaseSlug },
    });

    return subreddit.data;
}

export async function searchSubreddits(searchTerm: string) {
    if (!searchTerm || searchTerm.trim() === "") {
        return [];
    }

    const searchSubredditsQuery =
        defineQuery(`*[_type == "subreddit" && title match $searchTerm + "*"] {
        _id,
        title,
        "slug": slug.current,
        description,
        image,
        "moderator": moderator->,
        createdAt
        } | order(createdAt desc)`);

    const results = await sanityFetch({
        query: searchSubredditsQuery,
        params: { searchTerm: searchTerm.toLowerCase() },
    });

    return results.data;
}
