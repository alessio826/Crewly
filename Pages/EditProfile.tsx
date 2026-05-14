import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Camera, AtSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useUpdateProfile } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import Avatar from "@/components/Avatar";

const schema = z.object({
  displayName: z.string().min(1, "Il nome è obbligatorio"),
  username: z
    .string()
    .min(3, "Almeno 3 caratteri")
    .max(30, "Massimo 30 caratteri")
    .regex(/^[a-zA-Z0-9._]+$/, "Solo lettere, numeri, punti e underscore"),
  bio: z.string().max(150, "Max 150 caratteri").optional(),
  website: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  onClose: () => void;
  onSaved: () => void;
}

export default function EditProfile({ onClose, onSaved }: Props) {
  const { currentUser, login } = useAuth();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(currentUser?.avatarUrl ?? null);
  const updateProfile = useUpdateProfile();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      displayName: currentUser?.displayName ?? "",
      username: currentUser?.username ?? "",
      bio: currentUser?.bio ?? "",
      website: (currentUser as any)?.website ?? "",
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const size = 300;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d")!;
        const min = Math.min(img.width, img.height);
        const sx = (img.width - min) / 2;
        const sy = (img.height - min) / 2;
        ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.72);
        setAvatarPreview(dataUrl);
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const onSubmit = (data: FormData) => {
    updateProfile.mutate(
      {
        data: {
          displayName: data.displayName,
          username: data.username.toLowerCase(),
          bio: data.bio ?? "",
          website: data.website ?? "",
          ...(avatarPreview !== currentUser?.avatarUrl ? { avatarUrl: avatarPreview ?? "" } : {}),
        },
      },
      {
        onSuccess: updatedUser => {
          const token = localStorage.getItem("crewly_token")!;
          login(token, { ...currentUser!, ...updatedUser } as any);
          toast({ title: "Profilo aggiornato!" });
          onSaved();
        },
        onError: (err: any) => {
          const msg = err?.data?.error ?? "Errore nel salvataggio";
          toast({ title: msg, variant: "destructive" });
        },
      }
    );
  };

  return (
    <motion.div
      className="absolute inset-0 z-50 flex items-end justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} onClick={onClose} />

      <motion.div
        className="relative w-full rounded-t-3xl overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #0d1540 0%, #080c1a 100%)",
          border: "1px solid rgba(92,184,255,0.1)",
          maxHeight: "88%",
          overflowY: "auto",
        }}
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4"
          style={{ background: "rgba(13,21,64,0.95)", borderBottom: "1px solid rgba(92,184,255,0.07)" }}>
          <button onClick={onClose}><X size={20} color="rgba(160,210,255,0.6)" /></button>
          <h3 className="text-white font-bold text-base">Modifica profilo</h3>
          <div className="w-6" />
        </div>

        <div className="px-5 py-5 space-y-4">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <Avatar src={avatarPreview} name={currentUser?.displayName} size={88} />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center border-2"
                style={{ background: "linear-gradient(135deg, #5cb8ff, #5040ef)", borderColor: "#080c1a" }}
              >
                <Camera size={14} color="white" />
              </button>
            </div>
            <button type="button" onClick={() => fileRef.current?.click()} className="text-sm font-semibold" style={{ color: "#5cb8ff" }}>
              Cambia foto profilo
            </button>
          </div>

          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

              {/* Nome completo */}
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium" style={{ color: "rgba(160,210,255,0.7)" }}>Nome completo</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Alessio Sarracino" className="h-12 rounded-xl text-white border-0"
                        style={{ background: "rgba(255,255,255,0.05)", outline: "1px solid rgba(92,184,255,0.12)" }} />
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )}
              />

              {/* Username */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium" style={{ color: "rgba(160,210,255,0.7)" }}>Username</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <AtSign size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                          style={{ color: "rgba(92,184,255,0.6)" }} />
                        <Input
                          {...field}
                          onChange={e => field.onChange(e.target.value.toLowerCase().replace(/\s/g, ""))}
                          placeholder="dark_wolf2719"
                          autoCapitalize="none"
                          spellCheck={false}
                          className="h-12 rounded-xl text-white border-0 pl-9"
                          style={{ background: "rgba(255,255,255,0.05)", outline: "1px solid rgba(92,184,255,0.12)" }}
                        />
                      </div>
                    </FormControl>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(160,210,255,0.35)" }}>
                      Il tuo nickname unico — con esso gli altri ti cercano
                    </p>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )}
              />

              {/* Bio */}
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium" style={{ color: "rgba(160,210,255,0.7)" }}>Biografia</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={3}
                        placeholder="Raccontati in 150 caratteri..."
                        maxLength={150}
                        className="resize-none rounded-xl text-white border-0 placeholder:text-white/20"
                        style={{ background: "rgba(255,255,255,0.05)", outline: "1px solid rgba(92,184,255,0.12)" }}
                      />
                    </FormControl>
                    <p className="text-xs text-right" style={{ color: "rgba(160,210,255,0.35)" }}>
                      {(field.value ?? "").length}/150
                    </p>
                  </FormItem>
                )}
              />

              {/* Website */}
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium" style={{ color: "rgba(160,210,255,0.7)" }}>Sito web</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://..." className="h-12 rounded-xl text-white border-0 placeholder:text-white/20"
                        style={{ background: "rgba(255,255,255,0.05)", outline: "1px solid rgba(92,184,255,0.12)" }} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="pt-2 pb-4">
                <Button
                  type="submit"
                  disabled={updateProfile.isPending}
                  className="w-full h-12 font-bold rounded-xl border-0 text-white"
                  style={{ background: "linear-gradient(135deg, #5cb8ff 0%, #5040ef 100%)", boxShadow: "0 4px 20px rgba(80,130,255,0.3)" }}
                >
                  {updateProfile.isPending ? "Salvataggio..." : "Salva modifiche"}
                </Button>
              </motion.div>
            </form>
          </Form>
        </div>
      </motion.div>
    </motion.div>
  );
}
