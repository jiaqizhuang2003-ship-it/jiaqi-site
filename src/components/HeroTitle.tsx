"use client";

import { motion, useReducedMotion } from "framer-motion";

export function HeroTitle({ text }: { text: string }) {
  const reduceMotion = useReducedMotion();
  const characters = Array.from(text);

  return (
    <h1 className="max-w-xl text-[18px] font-medium leading-8 tracking-[-0.015em] text-primary">
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {characters.map((character, index) => (
          <motion.span
            key={`${character}-${index}`}
            className="inline-block will-change-[opacity,filter,transform]"
            initial={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, filter: "blur(5px)", y: 4 }
            }
            animate={
              reduceMotion
                ? { opacity: 1 }
                : { opacity: 1, filter: "blur(0px)", y: 0 }
            }
            transition={{
              duration: reduceMotion ? 0.2 : 0.38,
              delay: reduceMotion ? 0 : Math.min(index * 0.012, 0.24),
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {character === " " ? "\u00a0" : character}
          </motion.span>
        ))}
      </span>
    </h1>
  );
}
