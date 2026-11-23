"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

/** Public site key (not a secret). Unset means the bot check is off. */
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

/**
 * Cloudflare Turnstile bot check, placed inside a form. It adds a hidden
 * "cf-turnstile-response" field that the Server Action passes to Supabase.
 * Usually invisible; it only shows when Cloudflare wants a click.
 * Pass the form's state as `resetKey`: a token works once, so a failed
 * attempt needs a fresh one. `onVerified` tells the form when it may submit,
 * so nobody can click before the check has finished. Pass a stable function
 * (a useState setter), or the widget would be rebuilt on every render.
 */
export function Turnstile({
  resetKey,
  onVerified,
}: {
  resetKey?: unknown;
  onVerified: (verified: boolean) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [ready, setReady] = useState(false);

  // No site key: the check is off, so the form can submit straight away.
  useEffect(() => {
    if (!SITE_KEY) onVerified(true);
  }, [onVerified]);

  useEffect(() => {
    if (!ready || !SITE_KEY || !container.current || !window.turnstile) return;
    const id = window.turnstile.render(container.current, {
      sitekey: SITE_KEY,
      appearance: "interaction-only",
      theme: "auto",
      size: "flexible",
      callback: () => onVerified(true),
      "expired-callback": () => onVerified(false),
      "error-callback": () => onVerified(false),
      "timeout-callback": () => onVerified(false),
    });
    widgetId.current = id;
    return () => {
      window.turnstile?.remove(id);
      widgetId.current = null;
    };
  }, [ready, onVerified]);

  useEffect(() => {
    if (!widgetId.current) return;
    onVerified(false);
    window.turnstile?.reset(widgetId.current);
  }, [resetKey, onVerified]);

  if (!SITE_KEY) return null;
  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        onReady={() => setReady(true)}
      />
      <div ref={container} />
    </>
  );
}
