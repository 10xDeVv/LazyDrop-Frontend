// src/lib/ws.js
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const API_URL =
    (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080").replace(/\/+$/, "");

const isDev = process.env.NODE_ENV !== "production";

export class WebSocketService {
    constructor() {
        this.client = null;
        this.sub = null;
        this.listeners = new Map();
        this.sessionId = null;
    }

    connect(sessionId) {
        if (!sessionId) throw new Error("sessionId is required for WS connect");

        if (this.client?.active && this.sessionId === sessionId) return;

        this.disconnect();

        this.sessionId = sessionId;

        this.client = new Client({
            webSocketFactory: () => {
                return new SockJS(`${API_URL}/ws`);
            },

            reconnectDelay: 2000,
            heartbeatIncoming: 25000,
            heartbeatOutgoing: 25000,
            connectionTimeout: 15000,

            debug: (msg) => {
                if (isDev) console.log("[stomp]", msg);
            },

            onConnect: () => {
                if (isDev) console.log("✅ WS connected");

                const destination = `/topic/session/${sessionId}`;

                try {
                    this.sub = this.client.subscribe(destination, (frame) => {
                        try {
                            const msg = JSON.parse(frame.body);
                            this.handleMessage(msg);
                        } catch (e) {
                            if (isDev) console.warn("Bad WS message:", frame.body);
                        }
                    });
                } catch (e) {
                    this.notifyError("Failed to subscribe. Refresh and try again.");
                }
            },

            onStompError: () => {
                this.notifyError("WebSocket error. Refresh and try again.");
            },

            onWebSocketClose: (evt) => {
                if (isDev) console.log("🔌 WS closed", evt?.code);
            },

            onWebSocketError: () => {
                this.notifyError("Network issue. WebSocket connection failed.");
            },
        });

        this.client.activate();
    }

    handleMessage(message) {
        const { type, payload } = message || {};
        if (!type) return;
        const handlers = this.listeners.get(type) || [];
        handlers.forEach((h) => {
            try {
                h(payload);
            } catch (e) {
                if (isDev) console.error("WS handler error:", e);
            }
        });
    }

    subscribe(type, handler) {
        if (!this.listeners.has(type)) this.listeners.set(type, []);
        this.listeners.get(type).push(handler);

        return () => {
            const arr = this.listeners.get(type) || [];
            this.listeners.set(type, arr.filter((h) => h !== handler));
        };
    }

    disconnect() {
        try {
            if (this.sub) this.sub.unsubscribe();
        } catch {}

        try {
            if (this.client) this.client.deactivate();
        } catch {}

        this.client = null;
        this.sub = null;
        this.listeners.clear();
        this.sessionId = null;
    }

    notifyError(message) {
        if (typeof window !== "undefined") {
            window.dispatchEvent(
                new CustomEvent("websocket-error", { detail: { message } })
            );
        }
    }
}

export const ws = new WebSocketService();
