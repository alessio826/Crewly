interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: number;
  className?: string;
  ring?: boolean;
  onClick?: () => void;
}

export default function Avatar({ src, name, size = 40, className = "", ring = false, onClick }: AvatarProps) {
  const initials = name?.slice(0, 2).toUpperCase() ?? "??";
  const style: React.CSSProperties = {
    width: size,
    height: size,
    minWidth: size,
    minHeight: size,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: size * 0.38,
    fontWeight: 700,
    color: "white",
    cursor: onClick ? "pointer" : "default",
    background: src
      ? `url(${src}) center/cover no-repeat`
      : "linear-gradient(135deg, #5cb8ff, #5040ef)",
    ...(ring ? {
      outline: "2.5px solid #5cb8ff",
      outlineOffset: 2,
    } : {}),
  };

  return (
    <div style={style} className={className} onClick={onClick}>
      {!src && initials}
    </div>
  );
}
