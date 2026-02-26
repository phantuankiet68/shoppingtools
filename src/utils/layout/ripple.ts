// utils/admin/ripple.ts
import { useEffect } from "react";
import type { RefObject } from "react";

export function useRipple(containerRef: RefObject<HTMLElement | null>, attrName = "data-ripple", duration = 520) {
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const onClick = (ev: MouseEvent) => {
      let host = ev.target as HTMLElement | null;
      while (host && host !== root && !host.hasAttribute(attrName)) host = host.parentElement;
      if (!host || host === root) return;

      const rect = host.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const span = document.createElement("span");

      span.style.position = "absolute";
      span.style.borderRadius = "999px";
      span.style.pointerEvents = "none";
      span.style.width = `${size}px`;
      span.style.height = `${size}px`;
      span.style.left = `${ev.clientX - rect.left - size / 2}px`;
      span.style.top = `${ev.clientY - rect.top - size / 2}px`;
      span.style.background = "rgba(255,255,255,.18)";
      span.style.transform = "scale(0)";
      span.style.opacity = "1";
      span.style.transition = `transform ${duration}ms ease, opacity ${duration}ms ease`;

      const cs = window.getComputedStyle(host);
      if (cs.position === "static") host.style.position = "relative";
      host.style.overflow = "hidden";

      host.appendChild(span);
      requestAnimationFrame(() => {
        span.style.transform = "scale(1)";
        span.style.opacity = "0";
      });

      const remove = () => span.isConnected && span.remove();
      const to = window.setTimeout(remove, duration + 80);
      span.addEventListener(
        "transitionend",
        () => {
          clearTimeout(to);
          remove();
        },
        { once: true },
      );
    };

    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }, [containerRef, attrName, duration]);
}
