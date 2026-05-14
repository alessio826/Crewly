import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImageIcon, X, RotateCcw, Camera } from "lucide-react";

const FILTERS = [
  { id: "normal",  label: "Originale", css: "none" },
  { id: "vivid",   label: "Vivido",    css: "saturate(1.7) contrast(1.15) brightness(1.05)" },
  { id: "cool",    label: "Freddo",    css: "hue-rotate(200deg) saturate(1.2) brightness(1.05)" },
  { id: "warm",    label: "Caldo",     css: "sepia(0.4) saturate(1.3) brightness(1.05)" },
  { id: "bw",      label: "B&N",       css: "grayscale(1) contrast(1.15)" },
  { id: "fade",    label: "Sbiadito",  css: "saturate(0.45) brightness(1.25) contrast(0.82)" },
  { id: "dream",   label: "Dream",     css: "hue-rotate(25deg) saturate(1.5) brightness(1.1)" },
  { id: "noir",    label: "Noir",      css: "grayscale(1) contrast(1.4) brightness(0.85)" },
];

const STICKERS = [
  "❤️","🔥","✨","⭐","😍","🎉","💫","🌟",
  "😎","👑","💎","🚀","🌈","🦋","🎵","🌺",
  "💪","🎯","🍀","🌙",
];

interface StickerItem {
  id: string;
  emoji: string;
  x: number; // percent of image width
  y: number; // percent of image height
}

interface Props {
  onImageReady: (dataUrl: string | null) => void;
}

export default function ImageUploadEditor({ onImageReady }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const [srcDataUrl, setSrcDataUrl] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState("normal");
  const [stickers, setStickers] = useState<StickerItem[]>([]);
  const [activeSticker, setActiveSticker] = useState<string | null>(null);
  const [tab, setTab] = useState<"filters" | "stickers">("filters");

  const getFilterCss = (id: string) =>
    FILTERS.find((f) => f.id === id)?.css ?? "none";

  // Compose final image onto hidden canvas whenever src / filter / stickers change
  const compose = useCallback(() => {
    if (!srcDataUrl || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Cap at 800px — keeps file size well under 500KB after JPEG compression
      const MAX = 800;
      const scale = Math.min(1, MAX / Math.max(img.width, img.height));
      canvas.width  = Math.round(img.width  * scale);
      canvas.height = Math.round(img.height * scale);

      // Draw image with filter
      const filterCss = getFilterCss(selectedFilter);
      ctx.filter = filterCss === "none" ? "none" : filterCss;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.filter = "none";

      // Draw stickers
      const stickerSize = Math.max(28, canvas.width * 0.08);
      ctx.font = `${stickerSize}px serif`;
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      stickers.forEach(({ emoji, x, y }) => {
        const px = (x / 100) * canvas.width;
        const py = (y / 100) * canvas.height;
        ctx.fillText(emoji, px, py);
      });

      // Quality 0.72 keeps filesize around 100-300KB for 800px images
      const dataUrl = canvas.toDataURL("image/jpeg", 0.72);
      onImageReady(dataUrl);
    };
    img.src = srcDataUrl;
  }, [srcDataUrl, selectedFilter, stickers, onImageReady]);

  useEffect(() => {
    if (srcDataUrl) {
      compose();
    } else {
      onImageReady(null);
    }
  }, [srcDataUrl, selectedFilter, stickers, compose, onImageReady]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setSrcDataUrl(ev.target?.result as string);
      setStickers([]);
      setSelectedFilter("normal");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!activeSticker || !previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setStickers((prev) => [
      ...prev,
      { id: `${Date.now()}`, emoji: activeSticker, x, y },
    ]);
    setActiveSticker(null);
  };

  const removeSticker = (id: string) => {
    setStickers((prev) => prev.filter((s) => s.id !== id));
  };

  const reset = () => {
    setSrcDataUrl(null);
    setStickers([]);
    setSelectedFilter("normal");
    setActiveSticker(null);
    onImageReady(null);
  };

  // ── No image selected ──────────────────────────────────────────
  if (!srcDataUrl) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl overflow-hidden"
        style={{ border: "1.5px dashed rgba(92,184,255,0.2)", background: "rgba(92,184,255,0.03)" }}
      >
        <button
          type="button"
          className="w-full py-10 flex flex-col items-center gap-3 transition-all hover:opacity-80"
          onClick={() => fileInputRef.current?.click()}
          data-testid="button-pick-image"
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(92,184,255,0.1)" }}
          >
            <Camera size={26} style={{ color: "#5cb8ff" }} />
          </div>
          <div className="text-center">
            <p className="font-semibold text-white text-sm">Aggiungi foto dalla galleria</p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(160,210,255,0.45)" }}>
              JPG, PNG, WebP, GIF, video
            </p>
          </div>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />
      </motion.div>
    );
  }

  // ── Image selected — editor ────────────────────────────────────
  const currentFilterCss = getFilterCss(selectedFilter);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden"
      style={{ border: "1px solid rgba(92,184,255,0.1)" }}
    >
      {/* Hidden canvas for compositing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Image preview */}
      <div
        ref={previewRef}
        className="relative w-full overflow-hidden select-none"
        style={{ cursor: activeSticker ? "crosshair" : "default", aspectRatio: "1 / 1" }}
        onClick={handleImageClick}
      >
        <img
          src={srcDataUrl}
          alt="Preview"
          className="w-full h-full object-cover"
          style={{ filter: currentFilterCss === "none" ? undefined : currentFilterCss }}
          draggable={false}
        />

        {/* Placed stickers */}
        {stickers.map((s) => (
          <div
            key={s.id}
            className="absolute"
            style={{
              left: `${s.x}%`,
              top:  `${s.y}%`,
              transform: "translate(-50%, -50%)",
              fontSize: "clamp(24px, 7vw, 48px)",
              lineHeight: 1,
              userSelect: "none",
              filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.6))",
            }}
            onClick={(e) => { e.stopPropagation(); removeSticker(s.id); }}
            title="Tocca per rimuovere"
          >
            {s.emoji}
          </div>
        ))}

        {/* Active sticker cursor hint */}
        <AnimatePresence>
          {activeSticker && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ background: "rgba(0,0,0,0.25)" }}
            >
              <div className="text-center">
                <div style={{ fontSize: 48 }}>{activeSticker}</div>
                <p className="text-white text-xs mt-1 font-medium">Tocca dove vuoi posizionarlo</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top controls */}
        <div className="absolute top-2 left-2 right-2 flex justify-between pointer-events-none">
          <motion.button
            className="w-8 h-8 rounded-full flex items-center justify-center pointer-events-auto"
            style={{ background: "rgba(0,0,0,0.5)" }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); reset(); }}
            type="button"
            title="Rimuovi immagine"
          >
            <X size={14} color="white" />
          </motion.button>
          <motion.button
            className="w-8 h-8 rounded-full flex items-center justify-center pointer-events-auto"
            style={{ background: "rgba(0,0,0,0.5)" }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
            type="button"
            title="Cambia foto"
          >
            <ImageIcon size={14} color="white" />
          </motion.button>
        </div>
      </div>

      {/* Tabs: Filtri / Sticker */}
      <div
        className="flex"
        style={{ borderTop: "1px solid rgba(92,184,255,0.08)", background: "rgba(8,12,26,0.95)" }}
      >
        {(["filters", "stickers"] as const).map((t) => (
          <button
            key={t}
            type="button"
            className="flex-1 py-2.5 text-xs font-semibold transition-colors"
            style={{
              color: tab === t ? "#5cb8ff" : "rgba(160,210,255,0.4)",
              borderBottom: tab === t ? "2px solid #5cb8ff" : "2px solid transparent",
            }}
            onClick={() => setTab(t)}
          >
            {t === "filters" ? "Filtri" : "Sticker"}
          </button>
        ))}
      </div>

      {/* Filters strip */}
      {tab === "filters" && (
        <div
          className="flex gap-3 px-3 py-3 overflow-x-auto scrollbar-hide"
          style={{ background: "rgba(8,12,26,0.95)" }}
        >
          {FILTERS.map((f) => {
            const active = selectedFilter === f.id;
            return (
              <motion.button
                key={f.id}
                type="button"
                className="flex flex-col items-center gap-1.5 flex-shrink-0"
                onClick={() => setSelectedFilter(f.id)}
                whileTap={{ scale: 0.92 }}
                data-testid={`filter-${f.id}`}
              >
                <div
                  className="w-14 h-14 rounded-xl overflow-hidden"
                  style={{
                    outline: active ? "2.5px solid #5cb8ff" : "2px solid rgba(255,255,255,0.06)",
                    boxShadow: active ? "0 0 10px rgba(92,184,255,0.4)" : "none",
                  }}
                >
                  <img
                    src={srcDataUrl}
                    alt={f.label}
                    className="w-full h-full object-cover"
                    style={{ filter: f.css === "none" ? undefined : f.css }}
                    draggable={false}
                  />
                </div>
                <span
                  className="text-xs font-medium"
                  style={{ color: active ? "#5cb8ff" : "rgba(160,210,255,0.5)" }}
                >
                  {f.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Stickers grid */}
      {tab === "stickers" && (
        <div
          className="px-3 py-3"
          style={{ background: "rgba(8,12,26,0.95)" }}
        >
          {stickers.length > 0 && (
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs" style={{ color: "rgba(160,210,255,0.5)" }}>
                {stickers.length} sticker — tocca sull'immagine per rimuoverli
              </p>
              <button
                type="button"
                className="flex items-center gap-1 text-xs transition-colors"
                style={{ color: "rgba(160,210,255,0.4)" }}
                onClick={() => setStickers([])}
              >
                <RotateCcw size={10} /> Reset
              </button>
            </div>
          )}
          <div className="grid grid-cols-10 gap-1.5">
            {STICKERS.map((emoji) => {
              const isActive = activeSticker === emoji;
              return (
                <motion.button
                  key={emoji}
                  type="button"
                  className="aspect-square rounded-xl flex items-center justify-center text-xl"
                  style={{
                    background: isActive
                      ? "rgba(92,184,255,0.2)"
                      : "rgba(255,255,255,0.04)",
                    outline: isActive ? "2px solid #5cb8ff" : "none",
                  }}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setActiveSticker(isActive ? null : emoji)}
                  data-testid={`sticker-${emoji}`}
                  title={emoji}
                >
                  {emoji}
                </motion.button>
              );
            })}
          </div>
          {!activeSticker && (
            <p className="text-xs text-center mt-3" style={{ color: "rgba(160,210,255,0.35)" }}>
              Seleziona uno sticker, poi tocca sull'immagine
            </p>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </motion.div>
  );
}
