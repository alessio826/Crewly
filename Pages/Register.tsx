import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AtSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useRegister } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";

const registerSchema = z.object({
  displayName: z.string().min(1, "Il nome è obbligatorio"),
  username: z
    .string()
    .min(3, "Almeno 3 caratteri")
    .max(30, "Massimo 30 caratteri")
    .regex(/^[a-zA-Z0-9._]+$/, "Solo lettere, numeri, punti e underscore")
    .regex(/^[^.]/, "Non può iniziare con un punto")
    .regex(/[^.]$/, "Non può finire con un punto"),
  email: z.string().email("Email non valida"),
  password: z.string().min(6, "Almeno 6 caratteri"),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const registerMutation = useRegister();

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", displayName: "", email: "", password: "" },
  });

  const onSubmit = (data: RegisterForm) => {
    registerMutation.mutate(
      { data: { ...data, username: data.username.toLowerCase() } },
      {
        onSuccess: (response) => {
          login(response.token, response.user);
          setLocation("/feed");
        },
        onError: (err: any) => {
          const message = err?.data?.error ?? "Errore nella registrazione";
          toast({ title: message, variant: "destructive" });
        },
      }
    );
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-10 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #080c1a 0%, #0b1230 50%, #0d1540 100%)" }}
    >
      <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(90,50,255,0.25) 0%, transparent 70%)" }} />
      <div className="absolute bottom-1/3 left-1/4 w-80 h-80 rounded-full blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(80,130,255,0.2) 0%, transparent 70%)" }} />

      <motion.div
        className="relative z-10 w-full max-w-sm"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.button
          className="text-sm mb-6 flex items-center gap-2"
          style={{ color: "rgba(160,210,255,0.55)" }}
          onClick={() => setLocation("/")}
          whileHover={{ x: -3 }}
        >
          <span>←</span> Torna indietro
        </motion.button>

        <div className="mb-6">
          <h2 className="text-4xl font-black mb-1.5"
            style={{ background: "linear-gradient(135deg, #ffffff, #a8d8ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Unisciti
          </h2>
          <p style={{ color: "rgba(160,210,255,0.55)" }}>Crea il tuo profilo Crewly</p>
        </div>

        <div className="rounded-3xl p-6"
          style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", border: "1px solid rgba(92,184,255,0.12)" }}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

              {/* Nome completo */}
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium" style={{ color: "rgba(160,210,255,0.75)" }}>
                      Nome completo
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Alessio Sarracino"
                        data-testid="input-displayName"
                        autoComplete="name"
                        className="h-12 rounded-xl text-white placeholder:text-white/25"
                        style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(92,184,255,0.15)" }}
                      />
                    </FormControl>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(160,210,255,0.35)" }}>
                      Il tuo nome e cognome reale, visibile sul profilo
                    </p>
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
                    <FormLabel className="text-sm font-medium" style={{ color: "rgba(160,210,255,0.75)" }}>
                      Username
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <AtSign
                          size={15}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                          style={{ color: "rgba(92,184,255,0.6)" }}
                        />
                        <Input
                          {...field}
                          onChange={e => field.onChange(e.target.value.toLowerCase().replace(/\s/g, ""))}
                          placeholder="dark_wolf2719"
                          data-testid="input-username"
                          autoComplete="username"
                          autoCapitalize="none"
                          spellCheck={false}
                          className="h-12 rounded-xl text-white placeholder:text-white/25 pl-9"
                          style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(92,184,255,0.15)" }}
                        />
                      </div>
                    </FormControl>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(160,210,255,0.35)" }}>
                      Il tuo nickname unico — con esso gli altri ti trovano
                    </p>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium" style={{ color: "rgba(160,210,255,0.75)" }}>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="mario@email.com"
                        data-testid="input-email"
                        autoComplete="email"
                        className="h-12 rounded-xl text-white placeholder:text-white/25"
                        style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(92,184,255,0.15)" }}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium" style={{ color: "rgba(160,210,255,0.75)" }}>Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="••••••••"
                        data-testid="input-password"
                        autoComplete="new-password"
                        className="h-12 rounded-xl text-white placeholder:text-white/25"
                        style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(92,184,255,0.15)" }}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )}
              />

              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Button
                  type="submit"
                  data-testid="button-submit-register"
                  disabled={registerMutation.isPending}
                  className="w-full h-12 font-bold rounded-xl border-0 mt-2 text-white"
                  style={{ background: "linear-gradient(135deg, #5040ef 0%, #5cb8ff 100%)", boxShadow: "0 4px 20px rgba(80,64,239,0.35)" }}
                >
                  {registerMutation.isPending ? "Registrazione..." : "Crea account"}
                </Button>
              </motion.div>
            </form>
          </Form>
        </div>

        <p className="text-center text-sm mt-5" style={{ color: "rgba(160,210,255,0.4)" }}>
          Hai già un account?{" "}
          <button className="font-semibold" style={{ color: "#5cb8ff" }} onClick={() => setLocation("/login")} data-testid="link-login">
            Accedi
          </button>
        </p>
      </motion.div>
    </div>
  );
}
