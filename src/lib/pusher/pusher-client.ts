"use client";

import Pusher from "pusher-js";

declare global {
  var __PUSHER__: Pusher | undefined;
}

Pusher.logToConsole = true;

const createPusherClient = () =>
  new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    forceTLS: true,
    enabledTransports: ["ws", "wss"],
  });

export const pusherClient = globalThis.__PUSHER__ ?? createPusherClient();

if (!globalThis.__PUSHER__) {
  globalThis.__PUSHER__ = pusherClient;
}
