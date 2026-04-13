import { motion as Motion } from "motion/react";

const pageVariants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};

export default function AnimatedPage({ children, className = "" }) {
  return (
    <div className={`animate-page-enter ${className}`}>
      {children}
    </div>
  );
}
