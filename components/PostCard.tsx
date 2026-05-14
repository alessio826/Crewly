import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Bookmark, MoreHorizontal, Trash2 } from "lucide-react";
import {
  useLikePost, useUnlikePost,
  getGetFeedQueryKey, getGetExploreQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import Avatar from "@/components/Avatar";

interface Author {
  id: number; username: string; displayName: string; avatarUrl?: string | null;
}
interface Post {
  id: number; content: string; imageUrl?: string | null; authorId: number;
  createdAt: string; likesCount: number; commentsCount: number; isLiked: boolean; author: Author;
}

export default function PostCard({ post, onDelete }: { post: Post; onDelete?: () => void }) {
  const [, setLocation] = useLocation();
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [heartBurst, setHeartBurst] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const likeMutation = useLikePost();
  const unlikeMutation = useUnlikePost();

  const toggleLike = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikesCount(wasLiked ? likesCount - 1 : likesCount + 1);
    if (!wasLiked) { setHeartBurst(true); setTimeout(() => setHeartBurst(false), 700); }

    const invalidate = () => {
      queryClient.invalidateQueries({ queryKey: getGetFeedQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetExploreQueryKey() });
    };
    if (wasLiked) {
      unlikeMutation.mutate({ postId: post.id }, {
        onError: () => { setIsLiked(true); setLikesCount(likesCount); },
        onSuccess: invalidate,
      });
    } else {
      likeMutation.mutate({ postId: post.id }, {
        onError: () => { setIsLiked(false); setLikesCount(likesCount); },
        onSuccess: invalidate,
      });
    }
  };

  // Double-tap to like
  let lastTap = 0;
  const handleImageDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap < 300 && !isLiked) toggleLike();
    lastTap = now;
  };

  const timeAgo = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "adesso";
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}g`;
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
    >
      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 py-3">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Avatar
            src={post.author.avatarUrl}
            name={post.author.displayName}
            size={34}
            onClick={() => setLocation(`/profile/${post.author.id}`)}
          />
        </motion.div>

        {/* Name + @username stacked */}
        <div className="flex-1 min-w-0" onClick={() => setLocation(`/profile/${post.author.id}`)} style={{ cursor: "pointer" }}>
          <p className="text-white font-semibold text-sm leading-tight truncate">{post.author.displayName}</p>
          <p className="text-xs leading-tight truncate" style={{ color: "#5cb8ff", opacity: 0.75 }}>
            @{post.author.username}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.22)" }}>{timeAgo(post.createdAt)}</span>
          {currentUser?.id === post.authorId && onDelete && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                <MoreHorizontal size={18} />
              </button>
              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -5 }}
                    className="absolute right-0 top-8 z-10 rounded-xl overflow-hidden min-w-36"
                    style={{ background: "#1a2040", border: "1px solid rgba(92,184,255,0.12)" }}
                  >
                    <button
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-400/10 transition-colors"
                      onClick={() => { setShowMenu(false); onDelete(); }}
                    >
                      <Trash2 size={14} /> Elimina post
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* ── Image ── */}
      {post.imageUrl ? (
        <div
          className="w-full relative overflow-hidden bg-black"
          onClick={handleImageDoubleTap}
          style={{ aspectRatio: "1/1" }}
        >
          <img src={post.imageUrl} alt="Post" className="w-full h-full object-cover" />
          <AnimatePresence>
            {heartBurst && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  initial={{ scale: 0.5, opacity: 1 }}
                  animate={{ scale: 1.2, opacity: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <Heart size={80} fill="white" strokeWidth={0} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : null}

      {/* ── Actions ── */}
      <div className="px-4 pt-2 pb-1 flex items-center gap-4">
        <motion.button onClick={toggleLike} whileTap={{ scale: 0.8 }} data-testid={`button-like-${post.id}`}>
          <motion.div animate={heartBurst ? { scale: [1, 1.4, 1] } : {}} transition={{ duration: 0.3 }}>
            <Heart
              size={24}
              fill={isLiked ? "#5cb8ff" : "none"}
              strokeWidth={1.8}
              style={{ color: isLiked ? "#5cb8ff" : "rgba(255,255,255,0.85)" }}
            />
          </motion.div>
        </motion.button>

        <motion.button whileTap={{ scale: 0.85 }} onClick={() => setLocation(`/post/${post.id}`)} data-testid={`button-comment-${post.id}`}>
          <MessageCircle size={24} strokeWidth={1.8} style={{ color: "rgba(255,255,255,0.85)" }} />
        </motion.button>

        <div className="flex-1" />

        <motion.button whileTap={{ scale: 0.85 }}>
          <Bookmark size={24} strokeWidth={1.8} style={{ color: "rgba(255,255,255,0.85)" }} />
        </motion.button>
      </div>

      {/* ── Likes count ── */}
      <div className="px-4 pb-1">
        <p className="text-white text-sm font-semibold">{likesCount.toLocaleString("it")} Mi piace</p>
      </div>

      {/* ── Caption ── */}
      {post.content && (
        <div className="px-4 pb-1">
          <p className="text-white text-sm">
            <button
              className="font-bold mr-1.5 hover:opacity-80 transition-opacity"
              style={{ color: "white" }}
              onClick={() => setLocation(`/profile/${post.author.id}`)}
            >
              {post.author.username}
            </button>
            {post.content}
          </p>
        </div>
      )}

      {/* ── Comments link ── */}
      {post.commentsCount > 0 && (
        <button
          className="px-4 pb-1 text-sm"
          style={{ color: "rgba(160,210,255,0.45)" }}
          onClick={() => setLocation(`/post/${post.id}`)}
        >
          Vedi tutti i {post.commentsCount} commenti
        </button>
      )}

      <div className="pb-3" />
    </motion.article>
  );
}
