"use client";

import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import type { AnimationPlaybackControls, MotionValue } from "framer-motion";
import {
  Children,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

const CARD_GAP = 28;
const INTRO_PROGRESS = 0.92;
const WHEEL_FACTOR = 760;

type CarouselProps = {
  children: ReactNode;
  ariaLabel: string;
  hint: string;
};

type CarouselRulerProps = {
  count: number;
  currentIndex: number;
  progress: MotionValue<number>;
  maxProgress: number;
  onSelect: (index: number) => void;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function indexToProgress(index: number) {
  return index === 0 ? 0 : INTRO_PROGRESS + index;
}

function progressToVirtualIndex(progress: number) {
  return progress <= INTRO_PROGRESS ? 0 : progress - INTRO_PROGRESS;
}

function nearestIndexFromProgress(progress: number, count: number) {
  return clamp(Math.round(progressToVirtualIndex(progress)), 0, count - 1);
}

function CarouselRuler({
  count,
  currentIndex,
  progress,
  maxProgress,
  onSelect,
}: CarouselRulerProps) {
  const sliderX = useTransform(progress, (value) => {
    if (maxProgress <= 0) {
      return "0%";
    }

    return `${clamp(value / maxProgress, 0, 1) * 100}%`;
  });

  return (
    <div className="carousel-ruler" aria-hidden={count <= 1}>
      <motion.span className="carousel-ruler-slider" style={{ left: sliderX }} />
      {Array.from({ length: count }).map((_, index) => (
        <button
          key={index}
          type="button"
          className="carousel-ruler-tick"
          data-active={index === currentIndex}
          aria-label={`Go to card ${index + 1}`}
          aria-current={index === currentIndex ? "step" : undefined}
          onClick={() => onSelect(index)}
        />
      ))}
    </div>
  );
}

function CarouselItem({
  children,
  index,
  progress,
  currentIndex,
}: {
  children: ReactNode;
  index: number;
  progress: MotionValue<number>;
  currentIndex: number;
}) {
  const scale = useTransform(progress, (value) => {
    const virtualIndex = progressToVirtualIndex(value);
    const sideScale = clamp(1 - Math.abs(index - virtualIndex) * 0.12, 0.78, 1);

    if (index === 0 && value < INTRO_PROGRESS) {
      const opening = value / INTRO_PROGRESS;
      return sideScale * (1.48 - opening * 0.48);
    }

    return sideScale;
  });
  const opacity = useTransform(progress, (value) => {
    const virtualIndex = progressToVirtualIndex(value);
    return clamp(1 - Math.abs(index - virtualIndex) * 0.32, 0.38, 1);
  });
  const blur = useTransform(progress, (value) => {
    const virtualIndex = progressToVirtualIndex(value);
    return `blur(${Math.min(Math.abs(index - virtualIndex) * 1.2, 2)}px)`;
  });

  return (
    <motion.div
      className="carousel-card-shell"
      data-active={index === currentIndex}
      style={{ scale, opacity, filter: blur }}
    >
      {children}
    </motion.div>
  );
}

export function Carousel({ children, ariaLabel, hint }: CarouselProps) {
  const items = useMemo(() => Children.toArray(children), [children]);
  const reduceMotion = useReducedMotion();
  const viewportRef = useRef<HTMLElement>(null);
  const progress = useMotionValue(0);
  const smoothProgress = useSpring(progress, {
    stiffness: 120,
    damping: 28,
    mass: 0.9,
  });
  const animationRef = useRef<AnimationPlaybackControls | null>(null);
  const dragStartProgressRef = useRef(0);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [cardWidth, setCardWidth] = useState(560);
  const [currentIndex, setCurrentIndex] = useState(0);
  const count = items.length;
  const maxProgress = Math.max(0, INTRO_PROGRESS + count - 1);
  const stride = cardWidth + CARD_GAP;
  const trackX = useTransform(smoothProgress, (value) => {
    const standardX =
      viewportWidth / 2 - cardWidth / 2 - progressToVirtualIndex(value) * stride;

    if (value < INTRO_PROGRESS) {
      const opening = value / INTRO_PROGRESS;
      return standardX + (1 - opening) * 22;
    }

    return standardX;
  });

  const stopAnimation = useCallback(() => {
    animationRef.current?.stop();
    animationRef.current = null;
  }, []);

  const setProgress = useCallback(
    (value: number) => {
      progress.set(clamp(value, 0, maxProgress));
    },
    [maxProgress, progress],
  );

  const animateToProgress = useCallback(
    (value: number) => {
      stopAnimation();
      animationRef.current = animate(progress, clamp(value, 0, maxProgress), {
        type: "spring",
        stiffness: 150,
        damping: 30,
        mass: 0.9,
      });
    },
    [maxProgress, progress, stopAnimation],
  );

  const goToIndex = useCallback(
    (index: number) => {
      animateToProgress(indexToProgress(clamp(index, 0, count - 1)));
    },
    [animateToProgress, count],
  );

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return undefined;
    }

    const viewportElement = viewport;

    function updateSize() {
      const width = viewportElement.clientWidth;
      setViewportWidth(width);
      setCardWidth(clamp(width * 0.72, 300, 660));
    }

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(viewportElement);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport || reduceMotion || count <= 1) {
      return undefined;
    }

    function onWheel(event: WheelEvent) {
      const delta =
        Math.abs(event.deltaY) > Math.abs(event.deltaX)
          ? event.deltaY
          : event.deltaX;
      const current = progress.get();
      const atStart = current <= 0 && delta < 0;
      const atEnd = current >= maxProgress && delta > 0;

      if (atStart || atEnd) {
        return;
      }

      event.preventDefault();
      stopAnimation();
      setProgress(current + delta / WHEEL_FACTOR);
    }

    viewport.addEventListener("wheel", onWheel, { passive: false });

    return () => viewport.removeEventListener("wheel", onWheel);
  }, [count, maxProgress, progress, reduceMotion, setProgress, stopAnimation]);

  useMotionValueEvent(smoothProgress, "change", (latest) => {
    setCurrentIndex(nearestIndexFromProgress(latest, count));
  });

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goToIndex(currentIndex + 1);
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToIndex(currentIndex - 1);
    }

    if (event.key === "Home") {
      event.preventDefault();
      animateToProgress(0);
    }

    if (event.key === "End") {
      event.preventDefault();
      animateToProgress(maxProgress);
    }
  }

  if (reduceMotion) {
    function scrollToNativeCard(index: number) {
      const viewport = viewportRef.current;
      const card = viewport?.querySelector<HTMLElement>(
        `[data-carousel-index="${index}"]`,
      );

      card?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
      setCurrentIndex(index);
    }

    return (
      <section
        className="carousel-root"
        aria-label={ariaLabel}
        data-accent="electric-blue"
      >
        <p className="sr-only">{hint}</p>
        <CarouselRuler
          count={count}
          currentIndex={currentIndex}
          progress={smoothProgress}
          maxProgress={maxProgress}
          onSelect={scrollToNativeCard}
        />
        <div
          ref={(node) => {
            viewportRef.current = node;
          }}
          className="carousel-native"
          tabIndex={0}
        >
          {items.map((item, index) => (
            <div
              key={index}
              className="carousel-card-shell"
              data-carousel-index={index}
              data-active={index === currentIndex}
            >
              {item}
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      ref={viewportRef}
      className="carousel-root"
      aria-label={ariaLabel}
      data-accent="electric-blue"
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <p className="sr-only">{hint}</p>
      <CarouselRuler
        count={count}
        currentIndex={currentIndex}
        progress={smoothProgress}
        maxProgress={maxProgress}
        onSelect={goToIndex}
      />
      <motion.div
        className="carousel-track"
        style={{ x: trackX, gap: CARD_GAP }}
        drag="x"
        dragMomentum={false}
        dragElastic={0.06}
        onDragStart={() => {
          stopAnimation();
          dragStartProgressRef.current = progress.get();
        }}
        onDrag={(_, info) => {
          setProgress(dragStartProgressRef.current - info.offset.x / stride);
        }}
        onDragEnd={(_, info) => {
          const projected =
            progress.get() - (info.velocity.x / Math.max(stride, 1)) * 0.18;
          animateToProgress(projected);
        }}
      >
        {items.map((item, index) => (
          <CarouselItem
            key={index}
            index={index}
            progress={smoothProgress}
            currentIndex={currentIndex}
          >
            {item}
          </CarouselItem>
        ))}
      </motion.div>
    </section>
  );
}
