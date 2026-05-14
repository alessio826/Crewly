import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email("Email non valida"),
  password: z.string().min(1, "La password è obbligatoria"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const loginMutation = useLogin();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate(
      { data },
      {
        onSuccess: (response) => {
          login(response.token, response.user);
          setLocation("/feed");
        },
        onError: () => {
          toast({ title: "Credenziali non valide", variant: "destructive" });
        },
      }
    );
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #080c1a 0%, #0b1230 50%, #0d1540 100%)" }}
    >
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(80,130,255,0.25) 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(90,50,255,0.2) 0%, transparent 70%)" }}
      />

      <motion.div
        className="relative z-10 w-full max-w-sm"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.button
          className="text-sm mb-8 flex items-center gap-2 transition-colors"
          style={{ color: "rgba(160,210,255,0.55)" }}
          onClick={() => setLocation("/")}
          whileHover={{ x: -3 }}
        >
          <span>←</span> Torna indietro
        </motion.button>

        <div className="mb-8">
          <h2
            className="text-4xl font-black mb-2"
            style={{
              background: "linear-gradient(135deg, #ffffff, #a8d8ff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Bentornato
          </h2>
          <p style={{ color: "rgba(160,210,255,0.55)" }}>Accedi alla tua crew</p>
        </div>

        <div
          className="rounded-3xl p-7"
          style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(92,184,255,0.12)",
          }}
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
                        placeholder="la-tua@email.com"
                        data-testid="input-email"
                        className="h-12 rounded-xl text-white placeholder:text-white/25"
                        style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(92,184,255,0.15)" }}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )}
              />

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
                  data-testid="button-submit-login"
                  disabled={loginMutation.isPending}
                  className="w-full h-12 font-bold rounded-xl border-0 mt-2 text-white"
                  style={{
                    background: "linear-gradient(135deg, #5cb8ff 0%, #5040ef 100%)",
                    boxShadow: "0 4px 20px rgba(80,130,255,0.35)",
                  }}
                >
                  {loginMutation.isPending ? "Accesso..." : "Accedi"}
                </Button>
              </motion.div>
            </form>
          </Form>
        </div>

        <p className="text-center text-sm mt-6" style={{ color: "rgba(160,210,255,0.4)" }}>
          Non hai un account?{" "}
          <button
            className="font-semibold transition-colors"
            style={{ color: "#5cb8ff" }}
            onClick={() => setLocation("/register")}
            data-testid="link-register"
          >
            Registrati
          </button>
        </p>
      </motion.div>
    </div>
  );
}
