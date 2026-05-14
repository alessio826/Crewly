import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Home, Search, PlusSquare, Clapperboard, User } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { currentUser } = useAuth();

  const navItems = [
    { icon: Home,         label: "Home",   path: "/feed",                                              test: "/feed" },
    { icon: Search,       label: "Cerca",  path: "/search",                                            test: "/search" },
    { icon: PlusSquare,   label: "Crea",   path: "/create",                                            test: "/create" },
    { icon: Clapperboard, label: "Storia", path: "/story/new",                                         test: "/story" },
    { icon: User,         label: "Profilo",path: currentUser ? `/profile/${currentUser.id}` : "/feed", test: "/profile" },
  ];

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: "#080c1a",
        position: "relative",
      }}
    >
      {/* ── Top header ── */}
      <header
        style={{
          flexShrink: 0,
          height: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingLeft: 16,
          paddingRight: 16,
          background: "rgba(8,12,26,0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(92,184,255,0.07)",
          zIndex: 40,
        }}
      >
        <h1
          style={{
            fontSize: 20,
            fontWeight: 900,
            letterSpacing: "-0.02em",
            background: "linear-gradient(135deg, #ffffff 0%, #a8d8ff 50%, #8080ff 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            margin: 0,
          }}
        >
          Crewly
        </h1>
      </header>

      {/* ── Scrollable content ── */}
      <main
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          overscrollBehavior: "contain",
          WebkitOverflowScrolling: "touch",
        }}
        className="scrollbar-hide"
      >
        {children}
      </main>

      {/* ── Bottom nav ── */}
      <nav
        style={{
          flexShrink: 0,
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          background: "rgba(8,12,26,0.97)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(92,184,255,0.07)",
          zIndex: 40,
        }}
      >
        {navItems.map(({ icon: Icon, label, path, test }) => {
          const isActive =
            test === "/profile"
              ? location.startsWith("/profile")
              : test === "/story"
              ? location.startsWith("/story")
              : location === test;

          return (
            <button
              key={label}
              onClick={() => setLocation(path)}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "8px 12px" }}
              data-testid={`nav-${label.toLowerCase()}`}
            >
              <motion.div whileTap={{ scale: 0.72 }} transition={{ type: "spring", stiffness: 600, damping: 30 }}>
                <Icon
                  size={24}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  style={{ color: isActive ? "#ffffff" : "rgba(255,255,255,0.38)" }}
                />
              </motion.div>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
