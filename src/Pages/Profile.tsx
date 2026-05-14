import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGetUser, useGetUserPosts, useGetUserStories,
  useFollowUser, useUnfollowUser,
  useDeletePost,
  getGetUserQueryKey, getGetUserPostsQueryKey, getGetUserStoriesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import Avatar from "@/components/Avatar";
import StoryViewer from "@/components/StoryViewer";
import EditProfile from "@/pages/EditProfile";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { Grid3X3, Link as LinkIcon, LogOut } from "lucide-react";

export default function Profile() {
  const params = useParams<{ userId: string }>();
  const userId = parseInt(params.userId, 10);
  const { currentUser, logout } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [localFollowing, setLocalFollowing] = useState<boolean | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [storyViewOpen, setStoryViewOpen] = useState(false);

  const { data: user, isLoading: userLoading, refetch: refetchUser } = useGetUser(userId, {
    query: { enabled: !!userId, queryKey: getGetUserQueryKey(userId) },
  });
  const { data: posts, isLoading: postsLoading } = useGetUserPosts(userId, {
    query: { enabled: !!userId, queryKey: getGetUserPostsQueryKey(userId) },
  });
  const { data: userStories } = useGetUserStories(userId, {
    query: { enabled: !!userId, queryKey: getGetUserStoriesQueryKey(userId) },
  });

  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();
  const deletePostMutation = useDeletePost();

  const isOwnProfile = currentUser?.id === userId;
  const isFollowing = localFollowing !== null ? localFollowing : user?.isFollowing ?? false;

  const handleFollow = () => {
    setLocalFollowing(!isFollowing);
    if (isFollowing) {
      unfollowMutation.mutate({ userId }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetUserQueryKey(userId) }),
        onError: () => setLocalFollowing(isFollowing),
      });
    } else {
      followMutation.mutate({ userId }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetUserQueryKey(userId) }),
        onError: () => setLocalFollowing(isFollowing),
      });
    }
  };

  const hasStories = (userStories?.length ?? 0) > 0;
  const imagePosts = posts?.filter(p => p.imageUrl) ?? [];
  const textPosts = posts?.filter(p => !p.imageUrl) ?? [];

  return (
    <Layout>
      <div className="min-h-full" style={{ background: "#080c1a" }}>

        {/* ── Profile header ── */}
        <div className="px-4 pt-4 pb-2">
          {userLoading ? (
            <div className="space-y-4">
              <div className="flex items-center gap-5">
                <Skeleton className="w-20 h-20 rounded-full" style={{ background: "rgba(92,184,255,0.07)" }} />
                <div className="flex gap-5 flex-1">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="text-center flex-1">
                      <Skeleton className="h-5 w-10 rounded mb-1 mx-auto" style={{ background: "rgba(92,184,255,0.07)" }} />
                      <Skeleton className="h-3 w-14 rounded mx-auto" style={{ background: "rgba(92,184,255,0.04)" }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : user ? (
            <>
              {/* Avatar + stats row */}
              <div className="flex items-center gap-5 mb-3">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => hasStories && setStoryViewOpen(true)}
                  className="flex-shrink-0"
                  style={{ cursor: hasStories ? "pointer" : "default" }}
                >
                  <div
                    className="rounded-full"
                    style={{
                      padding: hasStories ? 2 : 0,
                      background: hasStories ? "linear-gradient(135deg, #5cb8ff, #5040ef)" : "transparent",
                    }}
                  >
                    <div className="rounded-full" style={{ padding: hasStories ? 2 : 0, background: "#080c1a" }}>
                      <Avatar src={user.avatarUrl} name={user.displayName} size={80} />
                    </div>
                  </div>
                </motion.button>

                <div className="flex gap-4 flex-1">
                  {[
                    { label: "Post",     value: user.postsCount },
                    { label: "Follower", value: user.followersCount },
                    { label: "Seguiti",  value: user.followingCount },
                  ].map(({ label, value }) => (
                    <div key={label} className="text-center flex-1">
                      <p className="text-white font-bold text-lg leading-tight">{value}</p>
                      <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Name block — displayName + @username */}
              <div className="mb-3">
                <p className="text-white font-bold text-base leading-tight">{user.displayName}</p>
                <p className="text-sm font-medium leading-tight" style={{ color: "#5cb8ff" }}>
                  @{user.username}
                </p>
                {user.bio && (
                  <p className="text-sm mt-1.5 whitespace-pre-line leading-snug" style={{ color: "rgba(255,255,255,0.7)" }}>
                    {user.bio}
                  </p>
                )}
                {(user as any).website && (
                  <a
                    href={(user as any).website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-sm mt-1"
                    style={{ color: "#5cb8ff" }}
                  >
                    <LinkIcon size={12} />
                    {(user as any).website.replace(/^https?:\/\//, "")}
                  </a>
                )}
              </div>

              {/* Buttons */}
              {isOwnProfile ? (
                <div className="flex gap-2">
                  <Button
                    onClick={() => setEditOpen(true)}
                    className="flex-1 h-9 text-sm font-semibold rounded-xl border-0"
                    style={{ background: "rgba(255,255,255,0.08)", color: "white" }}
                  >
                    Modifica profilo
                  </Button>
                  <Button
                    onClick={logout}
                    className="h-9 w-9 rounded-xl border-0 flex items-center justify-center p-0"
                    style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.55)" }}
                  >
                    <LogOut size={16} />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <motion.div className="flex-1" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                    <Button
                      onClick={handleFollow}
                      disabled={followMutation.isPending || unfollowMutation.isPending}
                      className="w-full h-9 text-sm font-bold rounded-xl border-0"
                      data-testid="button-follow"
                      style={isFollowing ? {
                        background: "rgba(255,255,255,0.08)", color: "white",
                        border: "1px solid rgba(92,184,255,0.2)",
                      } : {
                        background: "linear-gradient(135deg, #5cb8ff, #5040ef)", color: "white",
                      }}
                    >
                      {isFollowing ? "Segui già" : "Segui"}
                    </Button>
                  </motion.div>
                  <Button
                    className="h-9 px-4 text-sm font-semibold rounded-xl border-0"
                    style={{ background: "rgba(255,255,255,0.07)", color: "white" }}
                  >
                    Messaggio
                  </Button>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* ── Story highlights ── */}
        {hasStories && (
          <div className="px-4 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide">
              {userStories?.map((story, i) => (
                <motion.button
                  key={story.id}
                  className="flex flex-col items-center gap-1 flex-shrink-0"
                  onClick={() => setStoryViewOpen(true)}
                  whileTap={{ scale: 0.9 }}
                >
                  <div className="w-14 h-14 rounded-full overflow-hidden"
                    style={{ border: "2px solid rgba(92,184,255,0.35)" }}>
                    <img src={story.imageUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {i === 0 ? "Oggi" : `+${i}`}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* ── Grid tab indicator ── */}
        <div className="flex items-center justify-center py-2"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <Grid3X3 size={20} style={{ color: "rgba(255,255,255,0.65)" }} />
        </div>

        {/* ── Posts grid ── */}
        {postsLoading ? (
          <div className="grid grid-cols-3 gap-0.5">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="aspect-square" style={{ background: "rgba(92,184,255,0.05)" }} />
            ))}
          </div>
        ) : (
          <>
            {imagePosts.length > 0 && (
              <div className="grid grid-cols-3 gap-0.5">
                {imagePosts.map((post, i) => (
                  <motion.button
                    key={post.id}
                    className="aspect-square overflow-hidden relative group"
                    onClick={() => setLocation(`/post/${post.id}`)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <img src={post.imageUrl!} alt="" className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" />
                  </motion.button>
                ))}
              </div>
            )}

            {textPosts.length > 0 && (
              <div className="px-4 pt-3 space-y-3 pb-6">
                {imagePosts.length > 0 && (
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(160,210,255,0.35)" }}>
                    Post di testo
                  </p>
                )}
                {textPosts.map(post => (
                  <motion.button
                    key={post.id}
                    className="w-full text-left p-4 rounded-2xl"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(92,184,255,0.07)" }}
                    onClick={() => setLocation(`/post/${post.id}`)}
                  >
                    <p className="text-white text-sm line-clamp-3">{post.content}</p>
                    <p className="text-xs mt-2" style={{ color: "rgba(160,210,255,0.35)" }}>
                      ♥ {post.likesCount} · {post.commentsCount} commenti
                    </p>
                  </motion.button>
                ))}
              </div>
            )}

            {!postsLoading && (posts?.length ?? 0) === 0 && (
              <div className="text-center py-16">
                <p className="text-white/25 text-sm">Nessun post ancora</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Story viewer */}
      {storyViewOpen && userStories && userStories.length > 0 && (
        <StoryViewer
          groups={[{ author: user!, stories: userStories }]}
          initialGroupIndex={0}
          onClose={() => setStoryViewOpen(false)}
        />
      )}

      {/* Edit profile modal */}
      <AnimatePresence>
        {editOpen && (
          <EditProfile
            onClose={() => setEditOpen(false)}
            onSaved={() => { setEditOpen(false); refetchUser(); }}
          />
        )}
      </AnimatePresence>
    </Layout>
  );
}
