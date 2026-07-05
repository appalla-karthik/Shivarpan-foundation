import { motion } from "framer-motion";
import { ReactNode } from "react";
import {
  createRevealTransition,
  revealVariants,
  type RevealDirection,
} from "@/lib/motion";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: RevealDirection;
  id?: string;
  once?: boolean;
  amount?: number;
}

const AnimatedSection = ({
  children,
  className = "",
  delay = 0,
  direction = "up",
  id,
  once = true,
  amount = 0.2,
}: AnimatedSectionProps) => (
  <motion.div
    id={id}
    initial="hidden"
    whileInView="visible"
    viewport={{ once, amount, margin: "-60px" }}
    transition={createRevealTransition(delay)}
    variants={revealVariants[direction]}
    className={`relative ${className}`.trim()}
  >
    {children}
  </motion.div>
);

export default AnimatedSection;
