"use client";

import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
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
const SNAP_DELAY = 150;

type CarouselProps = {
  children: ReactNode;
  ariaLabel: string;
  hint: string;
};

type CarouselRulerProps = {
  count: number;
  currentIndex: number;
  onSelect: (index: number) => void;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function nearestIndex(position: number, count: number, viewport: number, card: number) {
  if (count <= 1) {
    return 0;
  }

  const stride = card + CARD_GAP;
  const index = Math.round((viewport / 2 - card / 2 - position) / stride);

  return clamp(index, 0, count - 1);
}

function positionForIndex(index: number, viewport: number, card: number) {
  return viewport / 2 - card / 2 - index * (card + CARD_GAP);
}

function CarouselRuler({ count, currentIndex, onSelect }: CarouselRulerProps) {
  return (
    <div className="carousel-ruler" aria-hidden={count <= 1}>
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
  x,
  viewportWidth,
  cardWidth,
  reduceMotion,
}: {
  children: ReactNode;
  index: number;
  x: MotionValue<number>;
  viewportWidth: number;
  cardWidth: number;
  reduceMotion: boolean;
}) {
  const center = viewportWidth / 2 - cardWidth / 2 - index * (cardWidth + CARD_GAP);
  const distance = useTransform(x, (value) => Math.abs(value - center));
  const scale = useTransform(distance, [0, cardWidth * 1.35], [1, 0.86]);
  const opacity = useTransform(distance, [0, cardWidth * 1.25], [1, 0.42]);
  const blur = useTransform(distance, [0, cardWidth * 1.35], ["blur(0px)", "blur(1.4px)"]);

  if (reduceMotion) {
    return <div className="carousel-card-shell">{children}</div>;
  }

  return (
    <motion.div
      className="carousel-card-shell"
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
  const snapTimerRef = useRef<number | null>(null);
  const animationRef = useRef<AnimationPlaybackControls | null>(null);
  const targetRef = useRef(0);
  const currentIndexRef = useRef(0);
  const x = useMotionValue(0);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [cardWidth, setCardWidth] = useState(560);
  const [currentIndex, setCurrentIndex] = useState(0);
  const count = items.length;
  const maxX = viewportWidth > 0 ? positionForIndex(0, viewportWidth, cardWidth) : 0;
  const minX =
    viewportWidth > 0 ? positionForIndex(Math.max(count - 1, 0), viewportWidth, cardWidth) : 0;

  const stopAnimation = useCallback(() => {
    animationRef.current?.stop();
    animationRef.current = null;
  }, []);

  const goTo = useCallback((index: number) => {
    if (viewportWidth === 0) {
      return;
    }

    const next = clamp(index, 0, count - 1);
    const target = positionForIndex(next, viewportWidth, cardWidth);
    currentIndexRef.current = next;
    targetRef.current = target;
    stopAnimation();
    animationRef.current = animate(x, target, {
      type: "spring",
      stiffness: 220,
      damping: 34,
      mass: 0.9,
    });
  }, [cardWidth, count, stopAnimation, viewportWidth, x]);

  const scheduleSnap = useCallback(() => {
    if (snapTimerRef.current) {
      window.clearTimeout(snapTimerRef.current);
    }

    snapTimerRef.current = window.setTimeout(() => {
      goTo(nearestIndex(x.get(), count, viewportWidth, cardWidth));
    }, SNAP_DELAY);
  }, [cardWidth, count, goTo, viewportWidth, x]);

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return undefined;
    }

    const viewportElement = viewport;

    function updateSize() {
      const width = viewportElement.clientWidth;
      const nextCardWidth = clamp(width * 0.72, 280, 640);
      setViewportWidth(width);
      setCardWidth(nextCardWidth);
      const target = positionForIndex(
        currentIndexRef.current,
        width,
        nextCardWidth,
      );
      targetRef.current = target;
      x.set(target);
    }

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(viewportElement);

    return () => observer.disconnect();
  }, [x]);

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport || reduceMotion || count <= 1) {
      return undefined;
    }

    function onWheel(event: WheelEvent) {
      const delta = Math.abs(event.deltaY) > Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      const current = x.get();
      const atStart = current >= maxX - 1 && delta < 0;
      const atEnd = current <= minX + 1 && delta > 0;

      if (atStart || atEnd) {
        return;
      }

      event.preventDefault();
      stopAnimation();
      const next = clamp(targetRef.current - delta, minX, maxX);
      targetRef.current = next;
      x.set(next);
      scheduleSnap();
    }

    viewport.addEventListener("wheel", onWheel, { passive: false });

    return () => viewport.removeEventListener("wheel", onWheel);
  }, [
    cardWidth,
    count,
    maxX,
    minX,
    reduceMotion,
    scheduleSnap,
    stopAnimation,
    viewportWidth,
    x,
  ]);

  useMotionValueEvent(x, "change", (latest) => {
    const next = nearestIndex(latest, count, viewportWidth, cardWidth);
    currentIndexRef.current = next;
    setCurrentIndex(next);
  });

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(currentIndex + 1);
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(currentIndex - 1);
    }

    if (event.key === "Home") {
      event.preventDefault();
      goTo(0);
    }

    if (event.key === "End") {
      event.preventDefault();
      goTo(count - 1);
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
      <section className="carousel-root" aria-label={ariaLabel}>
        <p className="sr-only">{hint}</p>
        <CarouselRuler
          count={count}
          currentIndex={currentIndex}
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
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <p className="sr-only">{hint}</p>
      <CarouselRuler count={count} currentIndex={currentIndex} onSelect={goTo} />
      <motion.div
        className="carousel-track"
        style={{ x, gap: CARD_GAP }}
        drag="x"
        dragMomentum={false}
        dragElastic={0.08}
        onDragStart={stopAnimation}
        onDragEnd={(_, info) => {
          const projected = x.get() + info.velocity.x * 0.16;
          goTo(nearestIndex(projected, count, viewportWidth, cardWidth));
        }}
      >
        {items.map((item, index) => (
          <CarouselItem
            key={index}
            index={index}
            x={x}
            viewportWidth={viewportWidth}
            cardWidth={cardWidth}
            reduceMotion={false}
          >
            {item}
          </CarouselItem>
        ))}
      </motion.div>
    </section>
  );
}
