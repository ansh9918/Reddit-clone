import { getPosts } from "@/sanity/lib/post/post";
import { currentUser } from "@clerk/nextjs/server";
import Post from "./Post";

const PostList = async () => {
    const posts = await getPosts();
    const user = await currentUser();
    // console.log(posts);
    return (
        <div className="space-y-4">
            {posts.map((post) => (
                <Post key={post._id} post={post} userId={user?.id || null} />
            ))}
        </div>
    );
};

export default PostList;
