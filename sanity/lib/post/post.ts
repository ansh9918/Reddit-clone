import { sanityFetch } from "../live";
import { defineQuery } from "groq";

export async function getPostById(postId: string) {
    const getPostByIdQuery = defineQuery(`*[_type == "post" && _id == $postId] {
    _id,
    title,
    "slug": slug.current,
    body,
    publishedAt,
    "author": author->,
    "subreddit": subreddit->,
    image,
    isDeleted
  }[0]`);

    const post = await sanityFetch({
        query: getPostByIdQuery,
        params: { postId },
    });
    return post.data;
}

export async function getPosts() {
    const getAllPostsQuery =
        defineQuery(`*[_type == "post" && isDeleted != true] {
      _id,
      title,
      "slug": slug.current,
      body,
      publishedAt,
      "author": author->
      ,
      "subreddit": subreddit->,
      image,
      isDeleted
    } | order(publishedAt desc)`);

    const posts = await sanityFetch({ query: getAllPostsQuery });
    return posts.data;
}
