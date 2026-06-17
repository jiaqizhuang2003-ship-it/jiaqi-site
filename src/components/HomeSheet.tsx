"use client";

import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import type { AnimationPlaybackControls, MotionValue } from "framer-motion";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type ReactNode,
} from "react";

const SHEET_WIDTH = 1200;
const SHEET_HEIGHT = 720;
const FIRST_FRAME_STRIDE = 1900;
const FRAME_STRIDE = 1400;
const FRAME_COUNT = 6;

function getFrameLeft(index: number) {
  return index === 0 ? 0 : FIRST_FRAME_STRIDE + (index - 1) * FRAME_STRIDE;
}

type SlideFrame = {
  kind: "slide";
  title: string;
  label: string;
  href: string;
  icon: FrameIconName;
};

type ContactFrame = {
  kind: "contact";
  title: string;
  label: string;
  email: string;
  copied: string;
  copyAnnouncement: string;
  links: {
    twitter: string;
    linkedin: string;
    github: string;
  };
};

type FrameIconName = "intro" | "work" | "projects" | "writing" | "about" | "contact";

export type HomeSheetContent = {
  srTitle: string;
  introSubtitle: string;
  introLines: {
    text: string;
    offset?: boolean;
  }[];
  frames: [SlideFrame, SlideFrame, SlideFrame, SlideFrame, ContactFrame];
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getBaseScale() {
  if (typeof window === "undefined") {
    return 0.6;
  }

  return clamp(Math.min(window.innerWidth / 1300, window.innerHeight / 1020), 0.2, 0.6);
}

function useViewportScale() {
  const rawScale = useMotionValue(0.6);
  const scale = useSpring(rawScale, { stiffness: 500, damping: 50 });

  useEffect(() => {
    function update() {
      rawScale.set(getBaseScale());
    }

    update();
    window.addEventListener("resize", update);

    return () => window.removeEventListener("resize", update);
  }, [rawScale]);

  return scale;
}

function FloatingLabel({
  children,
  inverseScale,
  active,
  icon,
}: {
  children: ReactNode;
  inverseScale: MotionValue<number>;
  active?: boolean;
  icon: FrameIconName;
}) {
  return (
    <motion.span
      className="home-frame-label"
      data-active={active}
      style={{ scale: inverseScale }}
    >
      <FrameIcon name={icon} />
      {children}
    </motion.span>
  );
}

function FrameIcon({ name }: { name: FrameIconName }) {
  if (name === "intro") {
    return (
      <span className="home-frame-icon home-frame-icon-status" data-icon={name} aria-hidden="true">
        <span />
        <svg viewBox="0 0 24 24">
          <path d="M12 3v5" />
          <path d="M12 16v5" />
          <path d="M3 12h5" />
          <path d="M16 12h5" />
        </svg>
      </span>
    );
  }

  const paths: Record<Exclude<FrameIconName, "intro">, ReactNode> = {
    work: (
      <>
        <path d="M8 8V6.8A2.8 2.8 0 0 1 10.8 4h2.4A2.8 2.8 0 0 1 16 6.8V8" />
        <path d="M5 8h14v10H5z" />
        <path d="M9 12h6" />
      </>
    ),
    projects: (
      <>
        <path d="M5 5h6v6H5z" />
        <path d="M13 5h6v6h-6z" />
        <path d="M5 13h6v6H5z" />
        <path d="M13 13h6v6h-6z" />
      </>
    ),
    writing: (
      <>
        <path d="M6 19h12" />
        <path d="M8 15 17.5 5.5a2 2 0 0 1 3 3L11 18l-4 1z" />
      </>
    ),
    about: (
      <>
        <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
        <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
      </>
    ),
    contact: (
      <>
        <path d="M4 6h16v12H4z" />
        <path d="m4 7 8 6 8-6" />
      </>
    ),
  };

  return (
    <span className="home-frame-icon" data-icon={name} aria-hidden="true">
      <svg viewBox="0 0 24 24">{paths[name]}</svg>
    </span>
  );
}

function IntroFrame({
  lines,
  subtitle,
  inverseScale,
  reduceMotion,
}: {
  lines: HomeSheetContent["introLines"];
  subtitle: string;
  inverseScale: MotionValue<number>;
  reduceMotion: boolean;
}) {
  return (
    <section className="home-frame home-frame-main" data-frame="intro" style={{ left: 0 }}>
      <FloatingLabel inverseScale={inverseScale} active icon="intro">
        Intro
      </FloatingLabel>
      <h1 className="vh">{lines.map((line) => line.text).join(" ")}</h1>
      <Image
        src="/portrait.png"
        alt=""
        width={1024}
        height={1024}
        className="home-portrait"
        priority
        draggable={false}
        aria-hidden="true"
      />
      <div className="home-intro-copy">
        <div aria-hidden="true" className="home-intro-lines">
          {lines.map((line, index) => (
            <span
              key={`${line.text}-${index}`}
              className="home-intro-line"
              data-variant={line.offset ? "offset" : undefined}
            >
              <motion.span
                initial={reduceMotion ? { opacity: 0 } : { y: 118, opacity: 0 }}
                animate={reduceMotion ? { opacity: 1 } : { y: 0, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 240,
                  damping: 32,
                  mass: 0.1,
                  delay: 0.18 + index * 0.09,
                }}
              >
                {line.text}
              </motion.span>
            </span>
          ))}
        </div>
        <motion.p
          className="home-intro-subtitle"
          initial={reduceMotion ? { opacity: 0 } : { y: 18, opacity: 0 }}
          animate={reduceMotion ? { opacity: 1 } : { y: 0, opacity: 1 }}
          transition={{ duration: 0.35, ease: "easeOut", delay: 0.72 }}
        >
          {subtitle}
        </motion.p>
      </div>
    </section>
  );
}

function SlideFrameView({
  frame,
  index,
  scroll,
  inverseScale,
}: {
  frame: SlideFrame;
  index: number;
  scroll: MotionValue<number>;
  inverseScale: MotionValue<number>;
}) {
  const frameLeft = getFrameLeft(index);
  const parallax = useTransform(scroll, (value) => (value - frameLeft) * -0.035);

  return (
    <section
      className="home-frame home-frame-slide"
      data-frame={frame.icon}
      style={{ left: frameLeft }}
    >
      <FloatingLabel inverseScale={inverseScale} icon={frame.icon}>
        {frame.label}
      </FloatingLabel>
      <motion.div className="home-frame-contents" style={{ x: parallax }}>
        <Link href={frame.href} className="home-giant-link" data-cursor>
          <span>{frame.title}</span>
        </Link>
        <p>{frame.label}</p>
      </motion.div>
    </section>
  );
}

function ContactFrameView({
  frame,
  inverseScale,
}: {
  frame: ContactFrame;
  inverseScale: MotionValue<number>;
}) {
  return (
    <section
      className="home-frame home-frame-contact"
      data-frame="contact"
      style={{ left: getFrameLeft(5) }}
    >
      <FloatingLabel inverseScale={inverseScale} icon="contact">
        {frame.label}
      </FloatingLabel>
      <div className="home-frame-contents home-contact-contents">
        <Link href="/contact" className="home-giant-link" data-cursor>
          <span>{frame.title}</span>
        </Link>
        <div className="home-contact-meta" aria-label={frame.label}>
          <span>{frame.links.twitter}</span>
          <span>{frame.links.linkedin}</span>
          <span>{frame.links.github}</span>
          <span>{frame.email}</span>
        </div>
      </div>
    </section>
  );
}

function HomeRuler({
  scroll,
  maxScroll,
  onSeek,
}: {
  scroll: MotionValue<number>;
  maxScroll: number;
  onSeek: (value: number) => void;
}) {
  const [rangeValue, setRangeValue] = useState(0);
  const left = useTransform(scroll, (value) => `${(clamp(value / maxScroll, 0, 1) * 100).toFixed(2)}%`);

  useEffect(() => {
    return scroll.on("change", (value) => {
      setRangeValue(clamp(value, 0, maxScroll));
    });
  }, [maxScroll, scroll]);

  function onRangeChange(event: ChangeEvent<HTMLInputElement>) {
    const next = Number(event.currentTarget.value);
    setRangeValue(next);
    onSeek(next);
  }

  return (
    <div
      className="home-minimap"
      aria-label="Scroll sections"
    >
      <input
        className="home-minimap-range"
        type="range"
        min={0}
        max={maxScroll}
        step={1}
        value={rangeValue}
        aria-label="Scroll sections"
        onChange={onRangeChange}
      />
      <motion.span className="home-minimap-slider" style={{ left }} />
      {Array.from({ length: 20 }).map((_, index) => (
        <motion.span
          key={index}
          className="home-minimap-tick"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15, delay: index * 0.025 }}
        />
      ))}
    </div>
  );
}

export function HomeSheet({ content }: { content: HomeSheetContent }) {
  const reduceMotion = useReducedMotion();
  const maxScroll = getFrameLeft(FRAME_COUNT - 1);
  const scroll = useMotionValue(0);
  const smoothScroll = useSpring(scroll, { stiffness: 500, damping: 58, mass: 0.9 });
  const baseScale = useViewportScale();
  const scale = useTransform([baseScale, smoothScroll], ([base, value]) => {
    const depth = reduceMotion ? 0 : clamp(Number(value) / 1800, 0, 0.2);
    return Number(base) * (1 - depth);
  });
  const inverseScale = useTransform(scale, (value) => 1 / Math.max(value, 0.001));
  const stripX = useTransform(smoothScroll, (value) => -value);
  const stageStyle = useMemo(
    () => ({ "--home-max-scroll": `${maxScroll}px` }) as CSSProperties,
    [maxScroll],
  );
  const axisLockRef = useRef<"x" | "y" | null>(null);
  const springControlsRef = useRef<AnimationPlaybackControls | null>(null);
  const [crosshairActive, setCrosshairActive] = useState(false);
  const seekTo = (value: number) => {
    const next = clamp(value, 0, maxScroll);

    axisLockRef.current = "y";
    springControlsRef.current?.stop();
    scroll.set(next);
    window.scrollTo(0, next);
  };

  useEffect(() => {
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    const originalOverflowX = document.documentElement.style.overflowX;
    const originalOverflowY = document.documentElement.style.overflowY;

    function updateScroll() {
      const axis = axisLockRef.current;
      const value = axis === "x" ? window.scrollX : window.scrollY;
      scroll.set(clamp(value, 0, maxScroll));
    }

    function onWheel(event: WheelEvent) {
      if (!axisLockRef.current) {
        axisLockRef.current =
          Math.abs(event.deltaX) > Math.abs(event.deltaY) ? "x" : "y";
        document.documentElement.style.overflowX =
          axisLockRef.current === "y" ? "hidden" : "auto";
        document.documentElement.style.overflowY =
          axisLockRef.current === "x" ? "hidden" : "auto";
      }

      springControlsRef.current?.stop();
    }

    function onKeyDown(event: globalThis.KeyboardEvent) {
      const step =
        window.matchMedia("(pointer: coarse)").matches ? FRAME_STRIDE / 5 : FRAME_STRIDE / 3;
      const current = scroll.get();

      if (event.key === "ArrowRight") {
        event.preventDefault();
        springControlsRef.current = animate(current, clamp(current + step, 0, maxScroll), {
          type: "spring",
          stiffness: 600,
          damping: 80,
          onUpdate: (value) => window.scrollTo(0, value),
        });
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        springControlsRef.current = animate(current, clamp(current - step, 0, maxScroll), {
          type: "spring",
          stiffness: 600,
          damping: 80,
          onUpdate: (value) => window.scrollTo(0, value),
        });
      }
    }

    window.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    updateScroll();

    return () => {
      window.removeEventListener("scroll", updateScroll);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      document.documentElement.style.overflowX = originalOverflowX;
      document.documentElement.style.overflowY = originalOverflowY;
      history.scrollRestoration = "auto";
    };
  }, [maxScroll, scroll]);

  return (
    <section
      className="home-stage"
      style={stageStyle}
      onMouseDown={(event) => {
        if (!(event.target as Element).closest(".home-minimap")) {
          event.preventDefault();
        }
      }}
    >
      <p className="vh">{content.srTitle}</p>
      <HomeRuler scroll={smoothScroll} maxScroll={maxScroll} onSeek={seekTo} />
      <button
        type="button"
        className="home-crosshair"
        data-active={crosshairActive}
        aria-label="Toggle registration mark"
        onClick={() => setCrosshairActive((value) => !value)}
      >
        +
      </button>
      <motion.div
        className="home-sheet-shell"
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0 }}
        animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
        style={{ x: "-50%", y: "-50%" }}
        transition={{ type: "spring", stiffness: 220, damping: 28 }}
      >
        <motion.div
          className="home-sheet"
          style={{
            width: SHEET_WIDTH,
            height: SHEET_HEIGHT,
            scale,
          }}
        >
          <motion.div className="home-strip" style={{ x: stripX }}>
            <IntroFrame
              lines={content.introLines}
              subtitle={content.introSubtitle}
              inverseScale={inverseScale}
              reduceMotion={Boolean(reduceMotion)}
            />
            {content.frames.map((frame, index) =>
              frame.kind === "slide" ? (
                <motion.div
                  key={frame.title}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.35, ease: "easeInOut", delay: 0.8 }}
                >
                  <SlideFrameView
                    frame={frame}
                    index={index + 1}
                    scroll={smoothScroll}
                    inverseScale={inverseScale}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key={frame.label}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.35, ease: "easeInOut", delay: 0.8 }}
                >
                  <ContactFrameView frame={frame} inverseScale={inverseScale} />
                </motion.div>
              ),
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
