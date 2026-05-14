import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Search as SearchIcon, X, AtSign } from "lucide-react";
import {
  useSearchUsers,
  useFollowUser,
  useUnfollowUser,
  useGetExplore,
  getGetUserQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import Avatar from "@/components/Avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";

function UserRow({ user, currentUserId }: { user: any; currentUserId?: number }) {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [localFollowing, setLocalFollowing] = useState<boolean | null>(null);
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();
  const isFollowing = localFollowing !== null ? localFollowing : user.isFollowing;
  const isOwn = currentUserId === user.id;

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalFollowing(!isFollowing);
    if (isFollowing) {
      unfollowMutation.mutate({ userId: user.id }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetUserQueryKey(user.id) }),
        onError: () => setLocalFollowing(isFollowing),
      });
    } else {
      followMutation.mutate({ userId: user.id }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetUserQueryKey(user.id) }),
        onError: () => setLocalFollowing(isFollowing),
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 py-3 cursor-pointer"
      style={{ borderBottom: "1px solid rgba(92,184,255,0.05)" }}
      onClick={() => setLocation(`/profile/${user.id}`)}
    >
      <Avatar src={user.avatarUrl} name={user.displayName} size={50} />

      <div className="flex-1 min-w-0">
        {/* @username — primary, in blue */}
        <p className="font-bold text-sm leading-tight truncate" style={{ color: "#5cb8ff" }}>
          @{user.username}
        </p>
        {/* displayName — secondary */}
        <p className="text-xs leading-tight truncate" style={{ color: "rgba(255,255,255,0.6)" }}>
          {user.displayName}
        </p>
        <p className="text-xs mt-0.5" style={{ color: "rgba(160,210,255,0.35)" }}>
          {user.followersCount} follower
        </p>
      </div>

      {!isOwn && (
        <button
          onClick={toggle}
          disabled={followMutation.isPending || unfollowMutation.isPending}
          className="text-xs font-bold px-4 py-1.5 rounded-xl transition-all flex-shrink-0"
          style={isFollowing ? {
            background: "rgba(92,184,255,0.08)",
            color: "rgba(160,210,255,0.7)",
            border: "1px solid rgba(92,184,255,0.2)",
          } : {
            background: "linear-gradient(135deg, #5cb8ff, #5040ef)",
            color: "white",
          }}
        >
          {isFollowing ? "Segui già" : "Segui"}
        </button>
      )}
    </motion.div>
  );
}

export default function Search() {
  const [query, setQuery] = useState("");
  const [, setLocation] = useLocation();
  const { currentUser } = useAuth();

  const { data: users, isLoading: usersLoading } = useSearchUsers(
    { q: query },
    { query: { enabled: query.trim().length > 0, queryKey: ["searchUsers", query] } }
  );

  const { data: explorePosts } = useGetExplore();
  const imagePosts = explorePosts?.filter(p => p.imageUrl) ?? [];

  return (
    <Layout>
      <div className="min-h-full" style={{ background: "#080c1a" }}>

        {/* ── Search bar ── */}
        <div
          className="sticky top-0 z-40 px-4 py-3"
          style={{ background: "rgba(8,12,26,0.97)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(92,184,255,0.06)" }}
        >
          <div className="relative">
            <AtSign
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2"
              style={{ color: "rgba(92,184,255,0.55)" }}
            />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Cerca per @username o nome..."
              data-testid="input-search"
              autoCapitalize="none"
              spellCheck={false}
              className="w-full h-10 pl-9 pr-9 rounded-2xl text-sm text-white placeholder:text-white/30 outline-none"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(92,184,255,0.1)" }}
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X size={14} style={{ color: "rgba(160,210,255,0.5)" }} />
              </button>
            )}
          </div>
          {!query && (
            <p className="text-xs text-center mt-2" style={{ color: "rgba(160,210,255,0.3)" }}>
              Cerca gli utenti per @username oppure per nome e cognome
            </p>
          )}
        </div>

        {/* ── User results ── */}
        <AnimatePresence>
          {query.trim().length > 0 && (
            <motion.div
              className="px-4 pt-1 pb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {usersLoading && (
                <div className="space-y-3 pt-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 py-2">
                      <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" style={{ background: "rgba(92,184,255,0.06)" }} />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3 w-28 rounded" style={{ background: "rgba(92,184,255,0.06)" }} />
                        <Skeleton className="h-3 w-20 rounded" style={{ background: "rgba(92,184,255,0.04)" }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!usersLoading && users?.length === 0 && (
                <motion.div
                  className="text-center py-14"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <p className="text-3xl mb-2">🔍</p>
                  <p className="text-sm font-semibold text-white/40">Nessun utente trovato</p>
                  <p className="text-xs mt-1" style={{ color: "rgba(160,210,255,0.28)" }}>
                    Prova con un @username o con nome e cognome
                  </p>
                </motion.div>
              )}

              {users?.map((user, i) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <UserRow user={user} currentUserId={currentUser?.id} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Explore grid when no search ── */}
        {!query.trim() && (
          <div className="px-0.5 pt-0.5">
            {imagePosts.length > 0 ? (
              <div className="grid grid-cols-3 gap-0.5">
                {imagePosts.map((post, i) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="aspect-square overflow-hidden cursor-pointer relative group"
                    onClick={() => setLocation(`/post/${post.id}`)}
                  >
                    <img
                      src={post.imageUrl!}
                      alt="Post"
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-3xl mb-2">🌐</p>
                <p className="text-sm" style={{ color: "rgba(160,210,255,0.3)" }}>
                  I post con foto appariranno qui
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
