import React, { useState, useEffect } from "react";
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from "framer-motion";

const MorphingText = ({ texts, className = "" }) => {
  const { isDark } = useTheme();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % texts.length);
    }, 2800); // Wait 2.8s before morphing
    return () => clearInterval(id);
  }, [texts]);

  const textColorClass = isDark ? "text-white" : "text-[#0f172a]";

  return (
    <div className={`relative w-full h-16 md:h-24 overflow-visible flex items-center justify-start ${className}`}>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={index}
          initial={{ opacity: 0, filter: "blur(8px)", y: 15, scale: 0.95 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0, scale: 1 }}
          exit={{ opacity: 0, filter: "blur(8px)", y: -15, scale: 1.05 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className={`absolute text-[2.5rem] md:text-[3.5rem] lg:text-[4.5rem] font-extrabold ${textColorClass}`}
        >
          {texts[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

export default MorphingText;
