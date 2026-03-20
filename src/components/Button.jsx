import { motion } from "framer-motion";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  onClick,
  href,
  className = "",
  ...props
}) {
  const theme = "light";

  const base =
    "relative inline-flex items-center justify-center font-semibold rounded-full transition-all duration-300 focus:outline-none";

  const variants = {
    primary:
      theme === "dark"
        ? "bg-white text-black hover:bg-white/90 hover:scale-[1.03] active:scale-[0.98]"
        : "bg-black text-white hover:bg-black/90 hover:scale-[1.03] active:scale-[0.98]",
    secondary:
      theme === "dark"
        ? "border border-white/20 text-white hover:bg-white/5 hover:border-white/40 hover:scale-[1.03] active:scale-[0.98]"
        : "border border-black/20 text-black hover:bg-black/5 hover:border-black/40 hover:scale-[1.03] active:scale-[0.98]",
    accent:
      "bg-accent text-black hover:bg-accent-dim hover:scale-[1.03] active:scale-[0.98]",
    ghost:
      theme === "dark"
        ? "text-text-secondary hover:text-white hover:bg-white/5 active:scale-[0.98]"
        : "text-light-text-secondary hover:text-black hover:bg-black/5 active:scale-[0.98]",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm gap-1.5",
    md: "px-6 py-2.5 text-sm gap-2",
    lg: "px-8 py-3.5 text-base gap-2.5",
  };

  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;
  const Comp = href ? "a" : "button";

  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="inline-block">
      <Comp
        href={href}
        onClick={onClick}
        className={classes}
        {...(href ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...props}
      >
        {children}
      </Comp>
    </motion.div>
  );
}
