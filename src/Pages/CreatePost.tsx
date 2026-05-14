import { useLocation } from "wouter";
import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useCreatePost, getGetFeedQueryKey, getGetExploreQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { useAuth } from "@/lib/auth";
import ImageUploadEditor from "@/components/ImageUploadEditor";

const postSchema = z.object({
  content: z.string(),
});

type PostForm = z.infer<typeof postSchema>;

export default function CreatePost() {
  const [, setLocation] = useLocation();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createPostMutation = useCreatePost();
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);

  const form = useForm<PostForm>({
    resolver: zodResolver(postSchema),
    defaultValues: { content: "" },
  });

  const handleImageReady = useCallback((dataUrl: string | null) => {
    setImageDataUrl(dataUrl);
  }, []);

  const onSubmit = (data: PostForm) => {
    createPostMutation.mutate(
      {
        data: {
          content: data.content,
          ...(imageDataUrl ? { imageUrl: imageDataUrl } : {}),
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetFeedQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetExploreQueryKey() });
          toast({ title: "Post pubblicato!" });
          setLocation("/feed");
        },
        onError: (err: any) => {
          const msg = err?.data?.error ?? err?.message ?? "Errore sconosciuto";
          toast({ title: "Impossibile pubblicare", description: msg, variant: "destructive" });
        },
      }
    );
  };

  const initials = currentUser?.displayName?.slice(0, 2).toUpperCase() ?? "??";

  return (
    <Layout>
      <div
        className="min-h-full px-4 pt-5 pb-8"
        style={{ background: "linear-gradient(180deg, #080c1a 0%, #0b1230 100%)" }}
      >
        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-2xl font-black text-white mb-5">Nuovo post</h2>

          {/* Author preview */}
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
              style={{
                background: currentUser?.avatarUrl
                  ? `url(${currentUser.avatarUrl}) center/cover`
                  : "linear-gradient(135deg, #5cb8ff, #5040ef)",
              }}
            >
              {!currentUser?.avatarUrl && initials}
            </div>
            <div>
              <p className="font-semibold text-white text-sm">{currentUser?.displayName}</p>
              <p className="text-xs" style={{ color: "rgba(160,210,255,0.45)" }}>
                @{currentUser?.username}
              </p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Text content */}
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Cosa sta succedendo nella tua crew?"
                        rows={3}
                        data-testid="input-content"
                        className="resize-none rounded-2xl text-white text-base placeholder:text-white/20 border-0"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          outline: "1px solid rgba(92,184,255,0.1)",
                        }}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )}
              />

              {/* Image editor */}
              <ImageUploadEditor onImageReady={handleImageReady} />

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-12 rounded-xl text-white/50 hover:text-white/70 border-0"
                  style={{ background: "rgba(255,255,255,0.04)", outline: "1px solid rgba(92,184,255,0.1)" }}
                  onClick={() => setLocation("/feed")}
                  data-testid="button-cancel"
                >
                  Annulla
                </Button>
                <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    disabled={createPostMutation.isPending}
                    className="w-full h-12 font-bold rounded-xl border-0 text-white"
                    style={{
                      background: "linear-gradient(135deg, #5cb8ff 0%, #5040ef 100%)",
                      boxShadow: "0 4px 20px rgba(80,130,255,0.3)",
                    }}
                    data-testid="button-submit-post"
                  >
                    {createPostMutation.isPending ? "Pubblicazione..." : "Pubblica"}
                  </Button>
                </motion.div>
              </div>
            </form>
          </Form>
        </motion.div>
      </div>
    </Layout>
  );
}
