import { useParams, useLocation } from "wouter";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGetPost,
  useGetComments,
  useCreateComment,
  useDeleteComment,
  useLikePost,
  useUnlikePost,
  getGetPostQueryKey,
  getGetCommentsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { Heart, Trash2, ChevronLeft } from "lucide-react";

export default function PostDetail() {
  const params = useParams<{ postId: string }>();
  const postId = parseInt(params.postId, 10);
  const [, setLocation] = useLocation();
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState("");
  const [isLiked, setIsLiked] = useState<boolean | null>(null);
  const [localLikes, setLocalLikes] = useState<number | null>(null);

  const { data: post, isLoading: postLoading } = useGetPost(postId, {
    query: { enabled: !!postId, queryKey: getGetPostQueryKey(postId) },
  });
  const { data: comments, isLoading: commentsLoading } = useGetComments(postId, {
    query: { enabled: !!postId, queryKey: getGetCommentsQueryKey(postId) },
  });

  const createCommentMutation = useCreateComment();
  const deleteCommentMutation = useDeleteComment();
  const likeMutation = useLikePost();
  const unlikeMutation = useUnlikePost();

  const currentLiked = isLiked !== null ? isLiked : post?.isLiked ?? false;
  const currentLikes = localLikes !== null ? localLikes : post?.likesCount ?? 0;

  const handleLike = () => {
    const wasLiked = currentLiked;
    setIsLiked(!wasLiked);
    setLocalLikes(wasLiked ? currentLikes - 1 : currentLikes + 1);
    if (wasLiked) {
      unlikeMutation.mutate({ postId }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetPostQueryKey(postId) }),
        onError: () => { setIsLiked(wasLiked); setLocalLikes(currentLikes); },
      });
    } else {
      likeMutation.mutate({ postId }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetPostQueryKey(postId) }),
        onError: () => { setIsLiked(wasLiked); setLocalLikes(currentLikes); },
      });
    }
  };

  const handleComment = () => {
    if (!commentText.trim()) return;
    createCommentMutation.mutate(
      { postId, data: { content: commentText.trim() } },
      {
        onSuccess: () => {
          setCommentText("");
          queryClient.invalidateQueries({ queryKey: getGetCommentsQueryKey(postId) });
          queryClient.invalidateQueries({ queryKey: getGetPostQueryKey(postId) });
        },
      }
    );
  };

  const handleDeleteComment = (commentId: number) => {
    deleteCommentMutation.mutate({ commentId }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCommentsQueryKey(postId) }),
    });
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "adesso";
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}g`;
  };

  return (
    <Layout>
      <div
        className="min-h-full"
        style={{ background: "linear-gradient(180deg, #080c1a 0%, #0b1230 100%)" }}
      >
        <div className="px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => setLocation("/feed")}
            className="transition-colors"
            style={{ color: "rgba(160,210,255,0.5)" }}
            data-testid="button-back"
          >
            <ChevronLeft size={22} />
          </button>
          <h2 className="text-white font-bold text-lg">Post</h2>
        </div>

        <div className="px-4 pb-6 max-w-2xl mx-auto space-y-4">
          {postLoading ? (
            <Skeleton className="h-52 rounded-2xl" style={{ background: "rgba(92,184,255,0.05)" }} />
          ) : post ? (
            <motion.div
              className="rounded-2xl p-4"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(92,184,255,0.08)",
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white cursor-pointer"
                  style={{
                    background: post.author?.avatarUrl
                      ? `url(${post.author.avatarUrl}) center/cover`
                      : "linear-gradient(135deg, #5cb8ff, #5040ef)",
                  }}
                  onClick={() => post.author && setLocation(`/profile/${post.author.id}`)}
                >
                  {!post.author?.avatarUrl && post.author?.displayName?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{post.author?.displayName}</p>
                  <p className="text-xs" style={{ color: "rgba(160,210,255,0.4)" }}>@{post.author?.username} · {timeAgo(post.createdAt)}</p>
                </div>
              </div>

              <p className="text-white/85 text-base leading-relaxed mb-4">{post.content}</p>

              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt="Post"
                  className="w-full rounded-xl object-cover max-h-96 mb-4"
                />
              )}

              <button
                onClick={handleLike}
                className="flex items-center gap-2 transition-colors"
                data-testid="button-like-post"
              >
                <Heart
                  size={20}
                  fill={currentLiked ? "#5cb8ff" : "none"}
                  strokeWidth={1.8}
                  style={{ color: currentLiked ? "#5cb8ff" : "rgba(160,210,255,0.4)" }}
                />
                <span className="text-sm font-medium" style={{ color: currentLiked ? "#5cb8ff" : "rgba(160,210,255,0.4)" }}>
                  {currentLikes} mi piace
                </span>
              </button>
            </motion.div>
          ) : null}

          <div>
            <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: "rgba(160,210,255,0.5)" }}>
              {comments?.length ?? 0} Commenti
            </h3>

            {currentUser && (
              <div className="flex gap-2 mb-5">
                <Input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Aggiungi un commento..."
                  data-testid="input-comment"
                  className="flex-1 h-11 rounded-xl text-white placeholder:text-white/20"
                  style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(92,184,255,0.12)" }}
                  onKeyDown={(e) => e.key === "Enter" && handleComment()}
                />
                <Button
                  onClick={handleComment}
                  disabled={createCommentMutation.isPending || !commentText.trim()}
                  data-testid="button-submit-comment"
                  className="h-11 px-4 rounded-xl font-semibold border-0 text-white"
                  style={{
                    background: "linear-gradient(135deg, #5cb8ff, #5040ef)",
                  }}
                >
                  {createCommentMutation.isPending ? "..." : "Invia"}
                </Button>
              </div>
            )}

            {commentsLoading && (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-xl" style={{ background: "rgba(92,184,255,0.04)" }} />
                ))}
              </div>
            )}

            <AnimatePresence>
              {comments?.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex gap-3 py-3"
                  style={{ borderBottom: "1px solid rgba(92,184,255,0.05)" }}
                  data-testid={`comment-${comment.id}`}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 cursor-pointer"
                    style={{
                      background: comment.author?.avatarUrl
                        ? `url(${comment.author.avatarUrl}) center/cover`
                        : "linear-gradient(135deg, #5cb8ff, #5040ef)",
                    }}
                    onClick={() => comment.author && setLocation(`/profile/${comment.author.id}`)}
                  >
                    {!comment.author?.avatarUrl && comment.author?.displayName?.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white text-sm font-semibold">{comment.author?.displayName}</span>
                      <span className="text-xs" style={{ color: "rgba(160,210,255,0.35)" }}>{timeAgo(comment.createdAt)}</span>
                    </div>
                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>{comment.content}</p>
                  </div>
                  {currentUser?.id === comment.authorId && (
                    <button
                      className="transition-colors text-red-400/30 hover:text-red-400"
                      onClick={() => handleDeleteComment(comment.id)}
                      data-testid={`button-delete-comment-${comment.id}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {!commentsLoading && comments?.length === 0 && (
              <p className="text-sm text-center py-8" style={{ color: "rgba(160,210,255,0.3)" }}>Nessun commento ancora</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
