import { defineQuery } from "groq";
import { sanityFetch } from "../live";
import { adminClient } from "../adminClient";

export async function downvoteComment(commentId: string, userId: string) {
    const existingVoteDownvoteCommentQuery = defineQuery(
        `*[_type == "vote" && comment._ref == $commentId && user._ref == $userId][0]`,
    );

    const existingVote = await sanityFetch({
        query: existingVoteDownvoteCommentQuery,
        params: { commentId, userId },
    });

    if (existingVote.data) {
        const vote = existingVote.data;

        if (vote.voteType === "downvote") {
            return await adminClient.delete(vote._id);
        }

        if (vote.voteType === "upvote") {
            return await adminClient
                .patch(vote._id)
                .set({ voteType: "downvote" })
                .commit();
        }
    }

    return await adminClient.create({
        _type: "vote",
        comment: {
            _type: "reference",
            _ref: commentId,
        },
        user: {
            _type: "reference",
            _ref: userId,
        },
        voteType: "downvote",
        createdAt: new Date().toISOString(),
    });
}

export async function downvotePost(postId: string, userId: string) {
    const existingVoteDownvoteQuery = defineQuery(
        `*[_type == "vote" && post._ref == $postId && user._ref == $userId][0]`,
    );
    const existingVote = await sanityFetch({
        query: existingVoteDownvoteQuery,
        params: { postId, userId },
    });

    if (existingVote.data) {
        const vote = existingVote.data;

        // If there's already a downvote, remove it (toggle off)
        if (vote.voteType === "downvote") {
            return await adminClient.delete(vote._id);
        }

        // If there's an upvote, change it to a downvote
        if (vote.voteType === "upvote") {
            return await adminClient
                .patch(vote._id)
                .set({ voteType: "downvote" })
                .commit();
        }
    }

    // Create a new downvote
    return await adminClient.create({
        _type: "vote",
        post: {
            _type: "reference",
            _ref: postId,
        },
        user: {
            _type: "reference",
            _ref: userId,
        },
        voteType: "downvote",
        createdAt: new Date().toISOString(),
    });
}

export async function getPostVotes(postId: string) {
    const getPostVotesQuery = defineQuery(`
        {
          "upvotes": count(*[_type == "vote" && post._ref == $postId && voteType == "upvote"]),
  
          "downvotes": count(*[_type == "vote" && post._ref == $postId && voteType == "downvote"]),
          
          "netScore": count(*[_type == "vote" && post._ref == $postId && voteType == "upvote"]) - count(*[_type == "vote" && post._ref == $postId && voteType == "downvote"])
        }
      `);

    const result = await sanityFetch({
        query: getPostVotesQuery,
        params: { postId },
    });

    return result.data;
}

export async function getUserPostVoteStatus(
    postId: string,
    userId: string | null,
) {
    const getUserPostVoteStatusQuery = defineQuery(
        `*[_type == "vote" && post._ref == $postId && user._ref == $userId][0].voteType`,
    );

    const result = await sanityFetch({
        query: getUserPostVoteStatusQuery,
        params: { postId, userId: userId || "" },
    });

    // Returns "upvote", "downvote", or null if no vote
    return result.data;
}

export async function upvoteComment(commentId: string, userId: string) {
    // Check if user has already voted on this comment
    const existingVoteUpvoteCommentQuery = defineQuery(
        `*[_type == "vote" && comment._ref == $commentId && user._ref == $userId][0]`,
    );
    const existingVote = await sanityFetch({
        query: existingVoteUpvoteCommentQuery,
        params: { commentId, userId },
    });

    if (existingVote.data) {
        const vote = existingVote.data;

        // If there's already an upvote, remove it (toggle off)
        if (vote.voteType === "upvote") {
            return await adminClient.delete(vote._id);
        }

        // If there's a downvote, change it to an upvote
        if (vote.voteType === "downvote") {
            return await adminClient
                .patch(vote._id)
                .set({ voteType: "upvote" })
                .commit();
        }
    }

    // Create a new upvote
    return await adminClient.create({
        _type: "vote",
        comment: {
            _type: "reference",
            _ref: commentId,
        },
        user: {
            _type: "reference",
            _ref: userId,
        },
        voteType: "upvote",
        createdAt: new Date().toISOString(),
    });
}

export async function upvotePost(postId: string, userId: string) {
    // Check if user has already voted on this post
    const existingVoteUpvoteQuery = defineQuery(
        `*[_type == "vote" && post._ref == $postId && user._ref == $userId][0]`,
    );
    const existingVote = await sanityFetch({
        query: existingVoteUpvoteQuery,
        params: { postId, userId },
    });

    if (existingVote.data) {
        const vote = existingVote.data;

        // If there's already an upvote, remove it (toggle off)
        if (vote.voteType === "upvote") {
            return await adminClient.delete(vote._id);
        }

        // If there's a downvote, change it to an upvote
        if (vote.voteType === "downvote") {
            return await adminClient
                .patch(vote._id)
                .set({ voteType: "upvote" })
                .commit();
        }
    }

    // Create a new upvote
    return await adminClient.create({
        _type: "vote",
        post: {
            _type: "reference",
            _ref: postId,
        },
        user: {
            _type: "reference",
            _ref: userId,
        },
        voteType: "upvote",
        createdAt: new Date().toISOString(),
    });
}
