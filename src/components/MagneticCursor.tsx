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
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canUseCursor()) {
      return undefined;
    }

    const cursor = cursorRef.current;

    if (!cursor) {
      return undefined;
    }

    const cursorElement = cursor;
    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;
    let currentX = pointerX;
    let currentY = pointerY;
    let isInteractive = false;
    let frame = 0;
    let activeMagnetic: HTMLElement | null = null;

    document.documentElement.classList.add("cursor-enhanced");

    function setCursor() {
      currentX += (pointerX - currentX) * 0.22;
      currentY += (pointerY - currentY) * 0.22;
      cursorElement.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%) scale(${
        isInteractive ? 1.85 : 1
      })`;
      frame = window.requestAnimationFrame(setCursor);
    }

    function releaseMagnetic() {
      if (activeMagnetic) {
        activeMagnetic.style.transform = "";
        activeMagnetic = null;
      }
    }

    function moveMagnetic(target: HTMLElement) {
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
      ) {
        releaseMagnetic();
        return;
      }

      const rect = target.getBoundingClientRect();
      const x = (pointerX - (rect.left + rect.width / 2)) * 0.08;
      const y = (pointerY - (rect.top + rect.height / 2)) * 0.08;

      activeMagnetic = target;
      target.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(
        2,
      )}px, 0)`;
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
      cursorElement.dataset.active = isInteractive ? "true" : "false";

      if (interactive instanceof HTMLElement && !isTextControl) {
        moveMagnetic(interactive);
      } else {
        releaseMagnetic();
      }
    }

    function onPointerLeave() {
      isInteractive = false;
      cursorElement.dataset.active = "false";
      releaseMagnetic();
    }

    frame = window.requestAnimationFrame(setCursor);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("blur", onPointerLeave);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("blur", onPointerLeave);
      document.documentElement.classList.remove("cursor-enhanced");
      releaseMagnetic();
    };
  }, []);

  return <div ref={cursorRef} className="magnetic-cursor" aria-hidden="true" />;
}
