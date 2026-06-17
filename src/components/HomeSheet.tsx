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
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

const SHEET_WIDTH = 1200;
const SHEET_HEIGHT = 720;
const STRIDE = 1240;
const FRAME_COUNT = 6;

type SlideFrame = {
  kind: "slide";
  title: string;
  label: string;
  href: string;
};

type ContactFrame = {
  kind: "contact";
  label: string;
  email: string;
  copied: string;
  copyAnnouncement: string;
  links: {
    twitter: string;
    yearCurrent: string;
    yearPrevious: string;
    github: string;
  };
};

export type HomeSheetContent = {
  srTitle: string;
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
}: {
  children: ReactNode;
  inverseScale: MotionValue<number>;
  active?: boolean;
}) {
  return (
    <motion.span
      className="home-frame-label"
      data-active={active}
      style={{ scale: inverseScale }}
    >
      {children}
    </motion.span>
  );
}

function IntroFrame({
  lines,
  inverseScale,
  reduceMotion,
}: {
  lines: HomeSheetContent["introLines"];
  inverseScale: MotionValue<number>;
  reduceMotion: boolean;
}) {
  return (
    <section className="home-frame home-frame-main" style={{ left: 0 }}>
      <FloatingLabel inverseScale={inverseScale} active>
        Intro
      </FloatingLabel>
      <h1 className="vh">{lines.map((line) => line.text).join(" ")}</h1>
      <div aria-hidden="true" className="home-intro-lines">
        {lines.map((line, index) => (
          <span
            key={`${line.text}-${index}`}
            className="home-intro-line"
            data-variant={line.offset ? "offset" : undefined}
          >
            <motion.span
              initial={reduceMotion ? { opacity: 0 } : { y: 100, opacity: 0 }}
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
  const parallax = useTransform(scroll, (value) => (value - index * STRIDE) * -0.035);

  return (
    <section
      className="home-frame home-frame-slide"
      style={{ left: STRIDE * index }}
    >
      <FloatingLabel inverseScale={inverseScale}>{frame.label}</FloatingLabel>
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
  const [copied, setCopied] = useState(false);

  async function copyEmail() {
    await navigator.clipboard.writeText("hi@jiaqi.dev");
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1000);
  }

  return (
    <section
      className="home-frame home-frame-contact"
      style={{ left: STRIDE * 5 }}
    >
      <FloatingLabel inverseScale={inverseScale}>{frame.label}</FloatingLabel>
      <a className="home-corner-link" data-position="top-left" href="https://x.com/jiaqizhuang">
        {frame.links.twitter}
      </a>
      <Link className="home-corner-link" data-position="top-right" href="/writing">
        {frame.links.yearCurrent}
      </Link>
      <Link className="home-corner-link" data-position="bottom-left" href="/projects">
        {frame.links.yearPrevious}
      </Link>
      <a className="home-corner-link" data-position="bottom-right" href="https://github.com/jiaqizhuang">
        {frame.links.github}
      </a>
      <button className="home-copy-email" type="button" onClick={copyEmail}>
        <span className="home-copy-stack">
          <motion.span
            animate={{ y: copied ? -90 : 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 32 }}
          >
            {frame.email}
          </motion.span>
          <motion.span
            animate={{ y: copied ? 0 : 90 }}
            transition={{ type: "spring", stiffness: 280, damping: 32 }}
            data-copied={copied}
          >
            {frame.copied}
          </motion.span>
        </span>
      </button>
      <span className="vh" aria-live="polite">
        {copied ? frame.copyAnnouncement : ""}
      </span>
    </section>
  );
}

function HomeRuler({
  scroll,
  maxScroll,
}: {
  scroll: MotionValue<number>;
  maxScroll: number;
}) {
  const left = useTransform(scroll, (value) => `${(clamp(value / maxScroll, 0, 1) * 100).toFixed(2)}%`);

  return (
    <div className="home-minimap" aria-hidden="true">
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
  const maxScroll = STRIDE * (FRAME_COUNT - 1);
  const scroll = useMotionValue(0);
  const smoothScroll = useSpring(scroll, { stiffness: 500, damping: 58, mass: 0.9 });
  const baseScale = useViewportScale();
  const scale = useTransform([baseScale, smoothScroll], ([base, value]) => {
    const depth = reduceMotion ? 0 : clamp(Number(value) / 2600, 0, 0.08);
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
        window.matchMedia("(pointer: coarse)").matches ? STRIDE / 5 : STRIDE / 3;
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
      onMouseDown={(event) => event.preventDefault()}
    >
      <p className="vh">{content.srTitle}</p>
      <HomeRuler scroll={smoothScroll} maxScroll={maxScroll} />
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
