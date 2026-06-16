"use client";

import { useEffect, useRef } from "react";

const interactiveSelector =
  'a, button, [role="button"], [data-cursor], input, textarea, select';

function canUseCursor() {
  return (
    window.matchMedia("(pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function MagneticCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const trailARef = useRef<HTMLDivElement>(null);
  const trailBRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canUseCursor()) {
      return undefined;
    }

    const dot = dotRef.current;
    const ring = ringRef.current;
    const trailA = trailARef.current;
    const trailB = trailBRef.current;

    if (!dot || !ring || !trailA || !trailB) {
      return undefined;
    }

    const dotElement = dot;
    const ringElement = ring;
    const trailAElement = trailA;
    const trailBElement = trailB;
    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;
    let ringX = pointerX;
    let ringY = pointerY;
    let trailAX = pointerX;
    let trailAY = pointerY;
    let trailBX = pointerX;
    let trailBY = pointerY;
    let isInteractive = false;
    let frame = 0;

    document.documentElement.classList.add("cursor-enhanced");

    function setTransform(element: HTMLElement, x: number, y: number, scale = 1) {
      element.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${scale})`;
    }

    function render() {
      ringX += (pointerX - ringX) * 0.18;
      ringY += (pointerY - ringY) * 0.18;
      trailAX += (ringX - trailAX) * 0.14;
      trailAY += (ringY - trailAY) * 0.14;
      trailBX += (trailAX - trailBX) * 0.1;
      trailBY += (trailAY - trailBY) * 0.1;

      setTransform(dotElement, pointerX, pointerY, isInteractive ? 0.76 : 1);
      setTransform(ringElement, ringX, ringY, isInteractive ? 1.55 : 1);
      setTransform(trailAElement, trailAX, trailAY, isInteractive ? 1.15 : 1);
      setTransform(trailBElement, trailBX, trailBY, isInteractive ? 0.9 : 0.72);

      frame = window.requestAnimationFrame(render);
    }

    function onPointerMove(event: PointerEvent) {
      pointerX = event.clientX;
      pointerY = event.clientY;

      const target = event.target instanceof Element ? event.target : null;
      const interactive = target?.closest(interactiveSelector);
      const isTextControl =
        interactive instanceof HTMLInputElement ||
        interactive instanceof HTMLTextAreaElement ||
        interactive instanceof HTMLSelectElement;

      isInteractive = interactive !== null && !isTextControl;
      document.documentElement.dataset.cursorActive = isInteractive
        ? "true"
        : "false";
    }

    function onPointerLeave() {
      isInteractive = false;
      document.documentElement.dataset.cursorActive = "false";
    }

    frame = window.requestAnimationFrame(render);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("blur", onPointerLeave);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("blur", onPointerLeave);
      document.documentElement.classList.remove("cursor-enhanced");
      document.documentElement.removeAttribute("data-cursor-active");
    };
  }, []);

  return (
    <div className="cursor-system" aria-hidden="true">
      <div ref={trailBRef} className="cursor-trail cursor-trail-b" />
      <div ref={trailARef} className="cursor-trail cursor-trail-a" />
      <div ref={ringRef} className="cursor-ring" />
      <div ref={dotRef} className="cursor-dot" />
    </div>
  );
}
