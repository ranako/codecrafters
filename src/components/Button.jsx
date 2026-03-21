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
    "relative inline-flex items-center justify-center font-bold tracking-widest uppercase text-sm transition-all duration-300 focus:outline-none border-2 border-black";

  const variants = {
    primary:
      theme === "dark"
        ? "bg-white text-black hover:translate-x-[2px] hover:translate-y-[2px] shadow-[4px_4px_0px_#2b2a27] hover:shadow-[0px_0px_0px_#2b2a27]"
        : "bg-black text-white hover:bg-white hover:text-black hover:translate-x-[2px] hover:translate-y-[2px] shadow-[4px_4px_0px_#2b2a27] hover:shadow-[0px_0px_0px_#2b2a27]",
    secondary:
      theme === "dark"
        ? "bg-black text-white hover:bg-white hover:text-black hover:translate-x-[2px] hover:translate-y-[2px] shadow-[4px_4px_0px_#f5f3eb] hover:shadow-[0px_0px_0px_#f5f3eb]"
        : "bg-white text-black hover:bg-black hover:text-white hover:translate-x-[2px] hover:translate-y-[2px] shadow-[4px_4px_0px_#2b2a27] hover:shadow-[0px_0px_0px_#2b2a27]",
    accent:
      "bg-black text-white hover:translate-x-[2px] hover:translate-y-[2px] shadow-[4px_4px_0px_#2b2a27] hover:shadow-[0px_0px_0px_#2b2a27]",
    ghost:
      theme === "dark"
        ? "text-text-secondary hover:text-white hover:bg-black hover:translate-x-[2px] hover:translate-y-[2px]"
        : "text-black hover:bg-black hover:text-white hover:translate-x-[2px] hover:translate-y-[2px]",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm gap-1.5",
    md: "px-6 py-2.5 text-sm gap-2",
    lg: "px-8 py-3.5 text-base gap-2.5",
  };

  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;
  const Comp = href ? "a" : "button";

  return (
    <motion.div className="inline-block">
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
