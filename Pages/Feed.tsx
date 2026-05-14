import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useGetFeed, useGetStories, useDeletePost, getGetFeedQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import PostCard from "@/components/PostCard";
import StoryViewer from "@/components/StoryViewer";
import Avatar from "@/components/Avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { Plus } from "lucide-react";

interface StoryGroup {
  author: any;
  stories: any[];
}

function groupStories(stories: any[]): StoryGroup[] {
  const map = new Map<number, StoryGroup>();
  for (const s of stories) {
    if (!map.has(s.author.id)) {
      map.set(s.author.id, { author: s.author, stories: [] });
    }
    map.get(s.author.id)!.stories.push(s);
  }
  return Array.from(map.values());
}

export default function Feed() {
  const { data: feedPosts, isLoading } = useGetFeed();
  const { data: stories } = useGetStories();
  const deletePost = useDeletePost();
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();
  const [, setLocation] = useLocation();
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerGroupIdx, setViewerGroupIdx] = useState(0);

  const groups = groupStories(stories ?? []);
  const myGroup = groups.find(g => g.author.id === currentUser?.id);
  const otherGroups = groups.filter(g => g.author.id !== currentUser?.id);
  const orderedGroups = myGroup ? [myGroup, ...otherGroups] : otherGroups;

  const openStory = (idx: number) => {
    setViewerGroupIdx(idx);
    setViewerOpen(true);
  };

  const handleDelete = (postId: number) => {
    deletePost.mutate({ postId }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetFeedQueryKey() }),
    });
  };

  return (
    <Layout>
      <div className="min-h-full" style={{ background: "#080c1a" }}>

        {/* ── Stories bar ── */}
        <div
          className="overflow-x-auto scrollbar-hide"
          style={{ borderBottom: "1px solid rgba(92,184,255,0.06)" }}
        >
          <div className="flex gap-4 px-4 py-3 min-w-max">
            {/* My story / add story */}
            <motion.button
              className="flex flex-col items-center gap-1.5 flex-shrink-0"
              onClick={() => setLocation("/story/new")}
              whileTap={{ scale: 0.92 }}
            >
              <div className="relative">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ border: "2px solid rgba(92,184,255,0.2)" }}
                >
                  <Avatar src={currentUser?.avatarUrl} name={currentUser?.displayName} size={56} />
                </div>
                <div
                  className="absolute bottom-0 right-0 w-5 h-5 rounded-full flex items-center justify-center border-2"
                  style={{ background: "linear-gradient(135deg, #5cb8ff, #5040ef)", borderColor: "#080c1a" }}
                >
                  <Plus size={11} color="white" strokeWidth={2.5} />
                </div>
              </div>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>La tua storia</span>
            </motion.button>

            {/* Other users' stories */}
            {orderedGroups.filter(g => g.author.id !== currentUser?.id).map((group, i) => (
              <motion.button
                key={group.author.id}
                className="flex flex-col items-center gap-1.5 flex-shrink-0"
                onClick={() => openStory(myGroup ? i + 1 : i)}
                whileTap={{ scale: 0.92 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <div
                  className="w-16 h-16 rounded-full p-0.5"
                  style={{ background: "linear-gradient(135deg, #5cb8ff 0%, #5040ef 100%)" }}
                >
                  <div
                    className="w-full h-full rounded-full overflow-hidden border-2"
                    style={{ borderColor: "#080c1a" }}
                  >
                    <Avatar src={group.author.avatarUrl} name={group.author.displayName} size={56} />
                  </div>
                </div>
                <span className="text-xs truncate max-w-16" style={{ color: "rgba(255,255,255,0.55)" }}>
                  {group.author.username}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* ── Posts ── */}
        <div className="max-w-xl mx-auto">
          {isLoading && (
            <div className="space-y-0">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="pt-4">
                  <div className="flex items-center gap-3 px-4 mb-3">
                    <Skeleton className="w-9 h-9 rounded-full" style={{ background: "rgba(92,184,255,0.06)" }} />
                    <Skeleton className="h-3 w-32 rounded" style={{ background: "rgba(92,184,255,0.06)" }} />
                  </div>
                  <Skeleton className="w-full h-72" style={{ background: "rgba(92,184,255,0.04)" }} />
                </div>
              ))}
            </div>
          )}

          {!isLoading && feedPosts?.length === 0 && (
            <motion.div className="text-center py-24" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="text-lg font-semibold text-white/30">Nessun post nel feed</p>
              <p className="text-sm mt-1" style={{ color: "rgba(160,210,255,0.25)" }}>
                Segui qualcuno per vedere i loro post
              </p>
            </motion.div>
          )}

          <AnimatePresence>
            {feedPosts?.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onDelete={currentUser?.id === post.authorId ? () => handleDelete(post.id) : undefined}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Story viewer */}
      {viewerOpen && orderedGroups.length > 0 && (
        <StoryViewer
          groups={orderedGroups}
          initialGroupIndex={viewerGroupIdx}
          onClose={() => setViewerOpen(false)}
        />
      )}
    </Layout>
  );
                  }
