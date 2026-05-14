import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Avatar from "./Avatar";

interface Story {
  id: number;
  authorId: number;
  imageUrl: string;
  caption?: string | null;
  createdAt: string;
  expiresAt: string;
  author: {
    id: number;
    username: string;
    displayName: string;
    avatarUrl?: string | null;
  };
}

interface StoryGroup {
  author: Story["author"];
  stories: Story[];
}

interface Props {
  groups: StoryGroup[];
  initialGroupIndex: number;
  onClose: () => void;
}

const STORY_DURATION = 5000;

export default function StoryViewer({ groups, initialGroupIndex, onClose }: Props) {
  const [groupIdx, setGroupIdx] = useState(initialGroupIndex);
  const [storyIdx, setStoryIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const group = groups[groupIdx];
  const story = group?.stories[storyIdx];

  const next = () => {
    if (storyIdx < group.stories.length - 1) {
      setStoryIdx(i => i + 1);
      setProgress(0);
    } else if (groupIdx < groups.length - 1) {
      setGroupIdx(i => i + 1);
      setStoryIdx(0);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const prev = () => {
    if (storyIdx > 0) {
      setStoryIdx(i => i - 1);
      setProgress(0);
    } else if (groupIdx > 0) {
      setGroupIdx(i => i - 1);
      setStoryIdx(0);
      setProgress(0);
    }
  };

  useEffect(() => {
    setProgress(0);
    if (timerRef.current) clearInterval(timerRef.current);
    const tick = 50;
    timerRef.current = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          next();
          return 0;
        }
        return p + (tick / STORY_DURATION) * 100;
      });
    }, tick);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [groupIdx, storyIdx]);

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const h = Math.floor(diff / 3600000);
    return h < 1 ? "adesso" : `${h}h fa`;
  };

  const expiresIn = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - Date.now();
    const h = Math.floor(diff / 3600000);
    return `${h}h rimaste`;
  };

  if (!story) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="absolute inset-0 z-[100] flex items-center justify-center"
        style={{ background: "#000" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="relative w-full max-w-sm h-full mx-auto" style={{ maxHeight: "100dvh" }}>
          {/* Story image */}
          <motion.img
            key={story.id}
            src={story.imageUrl}
            alt="Story"
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          />

          {/* Dark gradient overlays */}
          <div className="absolute inset-0" style={{
            background: "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 30%, transparent 65%, rgba(0,0,0,0.65) 100%)"
          }} />

          {/* Progress bars */}
          <div className="absolute top-3 left-3 right-3 flex gap-1 z-10">
            {group.stories.map((s, i) => (
              <div key={s.id} className="flex-1 h-0.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.3)" }}>
                <div
                  className="h-full rounded-full transition-none"
                  style={{
                    background: "white",
                    width: i < storyIdx ? "100%" : i === storyIdx ? `${progress}%` : "0%",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Top bar */}
          <div className="absolute top-7 left-3 right-3 flex items-center gap-2 z-10">
            <Avatar src={group.author.avatarUrl} name={group.author.displayName} size={36} />
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm truncate">{group.author.displayName}</p>
              <p className="text-white/60 text-xs">{timeAgo(story.createdAt)} · {expiresIn(story.expiresAt)}</p>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white p-1">
              <X size={22} />
            </button>
          </div>

          {/* Caption */}
          {story.caption && (
            <div className="absolute bottom-8 left-4 right-4 z-10">
              <p className="text-white text-base font-medium text-center" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.8)" }}>
                {story.caption}
              </p>
            </div>
          )}

          {/* Tap zones */}
          <button
            className="absolute left-0 top-0 w-1/3 h-full z-20"
            onClick={prev}
            aria-label="Precedente"
          />
          <button
            className="absolute right-0 top-0 w-2/3 h-full z-20"
            onClick={next}
            aria-label="Successiva"
          />

          {/* Side navigation arrows */}
          {groupIdx > 0 && (
            <button
              className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.2)" }}
              onClick={prev}
            >
              <ChevronLeft size={18} color="white" />
            </button>
          )}
          {groupIdx < groups.length - 1 && (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.2)" }}
              onClick={next}
            >
              <ChevronRight size={18} color="white" />
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
