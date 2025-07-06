import { defineQuery } from "groq";
import { adminClient } from "../adminClient";
import { sanityFetch } from "../live";

interface AddCommentParams {
    content: string;
    postId: string;
    userId: string; // This should be the Sanity user document ID
    parentCommentId?: string;
}

export async function addComment({
    content,
    postId,
    parentCommentId,
    userId,
}: AddCommentParams) {
    try {
        const commentData = {
            _type: "comment",
            content,
            author: {
                _type: "reference",
                _ref: userId,
            },
            post: {
                _type: "reference",
                _ref: postId,
            },
            parentComment: parentCommentId
                ? {
                      _type: "reference",
                      _ref: parentCommentId,
                  }
                : undefined,
            createdAt: new Date().toISOString(),
        };

        const comment = await adminClient.create(commentData);

        return { comment };
    } catch (error) {
        console.error("Error adding comment:", error);
        return { error: "Failed to add comment" };
    }
}

export async function getCommentById(commentId: string) {
    const getCommentByIdQuery =
        defineQuery(`*[_type == "comment" && _id == $commentId][0] {
    _id,
    content,
    createdAt,
    "author": author->,
    isDeleted
  }`);

    const comment = await sanityFetch({
        query: getCommentByIdQuery,
        params: { commentId },
    });

    return comment.data;
}

export async function getCommentReplies(
    commentId: string,
    userId: string | null,
) {
    const getCommentRepliesQuery = defineQuery(`
        *[_type == "comment" && parentComment._ref == $commentId] {
          ...,
          _id,
          content,
          createdAt,
          "author": author->,
          "replies": *[_type == "comment" && parentComment._ref == ^._id],
          "votes": {
              "upvotes": count(*[_type == "vote" && comment._ref == ^._id && voteType == "upvote"]),
              "downvotes": count(*[_type == "vote" && comment._ref == ^._id && voteType == "downvote"]),
              "netScore": count(*[_type == "vote" && comment._ref == ^._id && voteType == "upvote"]) - count(*[_type == "vote" && comment._ref == ^._id && voteType == "downvote"]),
              "voteStatus": *[_type == "vote" && comment._ref == ^._id && user._ref == $userId][0].voteType,
          },
        } | order(votes.netScore desc) //votes.netScore desc -> if you want to sort by net score
      `);

    const result = await sanityFetch({
        query: getCommentRepliesQuery,
        params: { commentId, userId: userId || "" },
    });

    return result.data || [];
}

export async function getPostComments(postId: string, userId: string | null) {
    const getPostCommentsQuery = defineQuery(`
      *[_type == "comment" && post._ref == $postId && !defined(parentComment)] {
          ...,
        _id,
        content,
        createdAt,
        "author": author->,
        "replies": *[_type == "comment" && parentComment._ref == ^._id],
        "votes": {
          "upvotes": count(*[_type == "vote" && comment._ref == ^._id && voteType == "upvote"]),
          "downvotes": count(*[_type == "vote" && comment._ref == ^._id && voteType == "downvote"]),
          "netScore": count(*[_type == "vote" && comment._ref == ^._id && voteType == "upvote"]) - count(*[_type == "vote" && comment._ref == ^._id && voteType == "downvote"]),
          "voteStatus": *[_type == "vote" && comment._ref == ^._id && user._ref == $userId][0].voteType,
        },
      } | order(votes.netScore desc, createdAt desc) // votes.netScore desc -> if you want to sort by net score
    `);

    const result = await sanityFetch({
        query: getPostCommentsQuery,
        params: { postId, userId: userId || "" },
    });

    return result.data || [];
}
