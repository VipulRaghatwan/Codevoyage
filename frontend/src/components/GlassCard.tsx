import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  glow?: 'cyan' | 'purple' | 'amber' | 'emerald' | 'none';
  interactive?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  glow = 'none',
  interactive = false,
  ...props
}) => {
  const glowStyles = {
    none: '',
    cyan: 'hover:border-cyber-cyan/50 hover:shadow-glow-cyan/20',
    purple: 'hover:border-cyber-purple/50 hover:shadow-glow-purple/20',
    amber: 'hover:border-cyber-amber/50 hover:shadow-glow-amber/20',
    emerald: 'hover:border-cyber-emerald/50 hover:shadow-emerald/20',
  }[glow];

  return (
    <motion.div
      whileHover={interactive ? { y: -3, transition: { duration: 0.2 } } : undefined}
      whileTap={interactive ? { scale: 0.99 } : undefined}
      className={`relative rounded-2xl bg-space-850/75 backdrop-blur-md border border-white/10 overflow-hidden ${glowStyles} ${
        interactive ? 'cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {/* Subtle corner tech accent */}
      <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none opacity-40">
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyber-cyan"></div>
      </div>
      {children}
    </motion.div>
  );
};
