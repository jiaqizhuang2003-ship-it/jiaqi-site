"use client";

import { useEffect, useRef, useState } from "react";

type WidgetKind = "intro" | "work" | "projects" | "writing" | "about" | "contact";

type HomeCardWidgetProps = {
  kind: WidgetKind;
  labels: {
    available: string;
    localTime: string;
    agents: string;
    workflows: string;
    latestNote: string;
    reveal: string;
    skills: string[];
    copied: string;
    copyEmail: string;
    email: string;
    github: string;
    twitter: string;
    linkedin: string;
  };
};

function useLocalTime() {
  const [time, setTime] = useState("--:--");

  useEffect(() => {
    function update() {
      setTime(
        new Intl.DateTimeFormat("en", {
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date()),
      );
    }

    update();
    const interval = window.setInterval(update, 30_000);

    return () => window.clearInterval(interval);
  }, []);

  return time;
}

export function HomeCardWidget({ kind, labels }: HomeCardWidgetProps) {
  const time = useLocalTime();
  const [copied, setCopied] = useState(false);
  const parallaxRef = useRef<HTMLDivElement>(null);

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const element = parallaxRef.current;

    if (!element) {
      return;
    }

    const rect = element.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 10;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 10;
    element.style.setProperty("--px", `${x.toFixed(2)}px`);
    element.style.setProperty("--py", `${y.toFixed(2)}px`);
  }

  async function copyEmail() {
    await navigator.clipboard.writeText("jiaqi@example.com");
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1100);
  }

  if (kind === "intro") {
    return (
      <div
        ref={parallaxRef}
        className="home-widget intro-widget"
        onPointerMove={onPointerMove}
        onPointerLeave={() => {
          parallaxRef.current?.style.setProperty("--px", "0px");
          parallaxRef.current?.style.setProperty("--py", "0px");
        }}
      >
        <span className="intro-orbit intro-orbit-a" />
        <span className="intro-orbit intro-orbit-b" />
        <span className="intro-orbit intro-orbit-c" />
        <span className="status-pill">
          <span className="status-dot" />
          {labels.available} / {labels.localTime} {time}
        </span>
      </div>
    );
  }

  if (kind === "work") {
    return (
      <div className="home-widget counter-widget">
        <span>
          <strong>12</strong>
          {labels.agents}
        </span>
        <span>
          <strong>34</strong>
          {labels.workflows}
        </span>
      </div>
    );
  }

  if (kind === "projects") {
    return (
      <div className="home-widget stack-widget">
        <span />
        <span />
        <span />
      </div>
    );
  }

  if (kind === "writing") {
    return (
      <div className="home-widget note-widget" tabIndex={0}>
        <span>{labels.latestNote}</span>
        <p>{labels.reveal}</p>
      </div>
    );
  }

  if (kind === "about") {
    return (
      <div className="home-widget tags-widget">
        {labels.skills.map((skill) => (
          <span key={skill}>{skill}</span>
        ))}
      </div>
    );
  }

  return (
    <div className="home-widget channels-widget">
      <button type="button" onClick={copyEmail}>
        {copied ? labels.copied : labels.copyEmail}
      </button>
      <span>{labels.github}</span>
      <span>{labels.twitter}</span>
      <span>{labels.linkedin}</span>
    </div>
  );
}
