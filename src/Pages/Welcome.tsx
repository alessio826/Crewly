import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

function FloatingOrb({ x, y, size, delay, color }: { x: string; y: string; size: number; delay: number; color: string }) {
  return (
    <motion.div
      className="absolute rounded-full blur-3xl pointer-events-none"
      style={{ left: x, top: y, width: size, height: size, background: color }}
      animate={{
        y: [0, -30, 0],
        x: [0, 15, 0],
        scale: [1, 1.1, 1],
        opacity: [0.35, 0.6, 0.35],
      }}
      transition={{
        duration: 6 + delay,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    />
  );
}

function Particle({ x, y, delay }: { x: number; y: number; delay: number }) {
  return (
    <motion.div
      className="absolute w-1 h-1 rounded-full pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%`, background: "rgba(160,210,255,0.7)" }}
      animate={{
        y: [0, -80, 0],
        opacity: [0, 1, 0],
        scale: [0, 1.5, 0],
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    />
  );
}

export default function Welcome() {
  const [, setLocation] = useLocation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  const particles = Array.from({ length: 20 }, (_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: i * 0.15,
  }));

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-between py-16 px-6"
      style={{
        background: "linear-gradient(135deg, #080c1a 0%, #0b1230 30%, #0d1540 60%, #080c1a 100%)",
      }}
    >
      {/* Background orbs */}
      <FloatingOrb x="10%" y="15%" size={350} delay={0} color="radial-gradient(circle, rgba(80,130,255,0.4) 0%, transparent 70%)" />
      <FloatingOrb x="60%" y="5%" size={280} delay={1.5} color="radial-gradient(circle, rgba(90,50,255,0.35) 0%, transparent 70%)" />
      <FloatingOrb x="75%" y="50%" size={320} delay={0.8} color="radial-gradient(circle, rgba(60,180,255,0.3) 0%, transparent 70%)" />
      <FloatingOrb x="5%" y="60%" size={250} delay={2} color="radial-gradient(circle, rgba(100,140,255,0.3) 0%, transparent 70%)" />
      <FloatingOrb x="40%" y="70%" size={200} delay={1.2} color="radial-gradient(circle, rgba(70,60,255,0.25) 0%, transparent 70%)" />

      {/* Particles */}
      {particles.map((p, i) => (
        <Particle key={i} {...p} />
      ))}

      {/* Animated grid lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-8"
        style={{
          backgroundImage: `linear-gradient(rgba(100,150,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(100,150,255,0.08) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Top spacer */}
      <div />

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center gap-10 w-full max-w-md">
        {/* Logo */}
        <AnimatePresence>
          {mounted && (
            <motion.div
              className="flex flex-col items-center gap-4"
              initial={{ opacity: 0, y: 40, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Logo icon */}
              <motion.div
                className="relative"
                animate={{ rotate: [0, 2, -2, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div
                  className="w-20 h-20 rounded-3xl flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #5cb8ff 0%, #5040ef 100%)",
                    boxShadow: "0 0 60px rgba(80,130,255,0.6), 0 0 120px rgba(80,64,239,0.3)",
                  }}
                >
                  <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                    <circle cx="22" cy="16" r="7" fill="white" />
                    <circle cx="10" cy="30" r="5" fill="white" opacity="0.85" />
                    <circle cx="34" cy="30" r="5" fill="white" opacity="0.85" />
                    <path d="M14 28C16 24 28 24 30 28" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                  </svg>
                </div>
              </motion.div>

              {/* Wordmark */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <h1
                  className="text-6xl font-black tracking-tight"
                  style={{
                    background: "linear-gradient(135deg, #ffffff 0%, #a8d8ff 40%, #8080ff 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    filter: "drop-shadow(0 0 30px rgba(80,130,255,0.5))",
                  }}
                >
                  Crewly
                </h1>
              </motion.div>

              {/* Tagline */}
              <motion.p
                className="text-center text-lg font-light tracking-wide max-w-xs"
                style={{ color: "rgba(160,210,255,0.7)" }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                Il tuo spazio. La tua crew.
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Buttons */}
        <AnimatePresence>
          {mounted && (
            <motion.div
              className="flex flex-col gap-4 w-full"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  data-testid="button-login"
                  className="w-full h-14 text-lg font-bold rounded-2xl border-0 text-white"
                  style={{
                    background: "linear-gradient(135deg, #5cb8ff 0%, #5040ef 100%)",
                    boxShadow: "0 8px 32px rgba(80,130,255,0.45)",
                  }}
                  onClick={() => setLocation("/login")}
                >
                  Accedi
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  data-testid="button-register"
                  variant="outline"
                  className="w-full h-14 text-lg font-bold rounded-2xl border-2"
                  style={{
                    borderColor: "rgba(92,184,255,0.45)",
                    background: "rgba(255,255,255,0.06)",
                    color: "white",
                    backdropFilter: "blur(10px)",
                  }}
                  onClick={() => setLocation("/register")}
                >
                  Registrati
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom credit */}
      <motion.div
        className="relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        <p
          className="text-center text-sm tracking-widest uppercase"
          data-testid="text-creator"
          style={{ color: "rgba(160,210,255,0.35)" }}
        >
          Created By Alessio Sarracino
        </p>
      </motion.div>
    </div>
  );
}
