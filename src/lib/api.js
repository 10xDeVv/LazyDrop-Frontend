import { getSupabaseAccessToken } from "@/lib/auth-token";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1");

export class ApiError extends Error {
    constructor(message, { status, code, details, url } = {}) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.code = code;
        this.details = details;
        this.url = url;
    }
}

function buildUrl(baseUrl, endpoint, query) {
    const url = new URL(baseUrl + endpoint);
    if (query && typeof query === "object") {
        Object.entries(query).forEach(([k, v]) => {
            if (v === undefined || v === null) return;
            url.searchParams.set(k, String(v));
        });
    }
    return url.toString();
}

async function safeReadJson(res) {
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) return null;
    try {
        return await res.json();
    } catch {
        return null;
    }
}

export class ApiService {
    constructor({ baseUrl = API_BASE_URL, getAccessToken } = {}) {
        this.baseUrl = baseUrl;
        this.getAccessToken = getAccessToken; // async () => string | null
    }

    async request(endpoint, options = {}) {
        const {
            method = "GET",
            headers,
            body,
            query,
            timeoutMs = 15000,
            auth = "auto", // "auto" | "none" | "required"
            signal,
            ...rest
        } = options;

        const url = buildUrl(this.baseUrl, endpoint, query);

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs);

        const finalSignal = signal
            ? (() => {
                const any = new AbortController();
                const onAbort = () => any.abort();
                signal.addEventListener("abort", onAbort, { once: true });
                controller.signal.addEventListener("abort", onAbort, { once: true });
                return any.signal;
            })()
            : controller.signal;

        let accessToken = null;
        if (auth !== "none" && typeof this.getAccessToken === "function") {
            accessToken = await this.getAccessToken();
            if (auth === "required" && !accessToken) {
                clearTimeout(timeout);
                throw new ApiError("Authentication required.", { status: 401, url });
            }
        }

        const config = {
            method,
            credentials: "include", // ✅ guest cookie
            headers: {
                ...(body && !(body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
                ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                ...headers,
            },
            body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
            signal: finalSignal,
            ...rest,
        };

        try {
            const res = await fetch(url, config);
            clearTimeout(timeout);

            if (res.status === 204) return null;

            const data = await safeReadJson(res);

            if (!res.ok) {
                const msg = data?.message || data?.error || `Request failed (${res.status})`;
                throw new ApiError(msg, {
                    status: res.status,
                    code: data?.code,
                    details: data,
                    url,
                });
            }

            if (!data) return await res.text();
            return data;
        } catch (err) {
            clearTimeout(timeout);
            if (err?.name === "AbortError") throw new ApiError("Request timed out.", { status: 408, url });
            throw err;
        }
    }

    // ---------------------------
    // Sessions
    // ---------------------------

    createSession() {
        return this.request("/sessions", { method: "POST", auth: "auto" });
    }

    getSessionByCode(code) {
        const normalized = (code || "").replace(/[^A-Za-z0-9]/g, "").toUpperCase();
        return this.request(`/sessions/code/${normalized}`, { auth: "auto" });
    }

    getSessionById(sessionId) {
        return this.request(`/sessions/${sessionId}`, { auth: "auto" });
    }

    endSession(sessionId) {
        return this.request(`/sessions/${sessionId}`, {
            method: "DELETE",
            auth: "auto",
        });
    }

    getActiveSessions() {
        return this.request(`/sessions/active`, { auth: "auto" });
    }

    // ---------------------------
    // Participants
    // ---------------------------

    joinSessionById(sessionId) {
        return this.request(`/sessions/${sessionId}/participants`, {
            method: "POST",
            auth: "auto",
        });
    }

    leaveSession(sessionId) {
        return this.request(`/sessions/${sessionId}/participants`, {
            method: "DELETE",
            auth: "auto",
        });
    }

    getParticipants(sessionId) {
        return this.request(`/sessions/${sessionId}/participants`, { auth: "auto" });
    }

    getMySettings(sessionId) {
        return this.request(`/sessions/${sessionId}/participants/me/settings`, { auth: "auto" });
    }

    updateMySettings(sessionId, body) {
        return this.request(`/sessions/${sessionId}/participants/me/settings`, {
            method: "PATCH",
            body,
            auth: "auto",
        });
    }

    // ---------------------------
    // Files
    // ---------------------------

    requestUpload(sessionId, body) {
        return this.request(`/sessions/${sessionId}/files/upload-url`, {
            method: "POST",
            auth: "auto",
            body,
        });
    }

    confirmUpload(sessionId, body) {
        return this.request(`/sessions/${sessionId}/files/confirm`, {
            method: "POST",
            auth: "auto",
            body,
        });
    }

    getFiles(sessionId) {
        return this.request(`/sessions/${sessionId}/files`, { auth: "auto" });
    }

    getDownloadUrl(sessionId, fileId) {
        return this.request(`/sessions/${sessionId}/files/${fileId}/download`, { auth: "auto" });
    }

    markFileDownloaded(sessionId, fileId) {
        return this.request(`/sessions/${sessionId}/files/${fileId}/mark-downloaded`, {
            method: "POST",
            auth: "auto",
        });
    }


// Notes
    async getNotes(sessionId, limit = 50) {
        return this.request(`/sessions/${sessionId}/notes`, {
            query: { limit },
            auth: "auto"
        });
    }

    async createNote(sessionId, content, clientNoteId) {
        return this.request(`/sessions/${sessionId}/notes`, {
            method: "POST",
            body: { content, clientNoteId},
            auth: "auto"
        });
    }

    //Sbuscription
    async getMySubscription() {
        return this.request("/subscriptions", { auth: "required" });
    }

    async getCheckoutStatus(sessionId) {
        return this.request("/subscriptions/checkout/status", {
            query: { sessionId },
            auth: "required",
        });
    }


// POST /subscriptions/checkout
// Returns CheckoutResponse { sessionId, url }
    async createCheckoutSession(plan = "plus") {
        const res = await this.request("/subscriptions/checkout", {
            method: "POST",
            body: { plan },
            auth: "required",
        });

        return {
            sessionId: res.sessionId,
            url: res.sessionUrl,
            status: res.status,
        };
    }

// POST /subscriptions/portal
// Returns BillingPortalResponse { url }
    async createPortalSession() {
        return this.request("/subscriptions/portal", {
            method: "POST",
            auth: "required"
        });
    }

// POST /subscriptions/cancel
// Returns CancellationResponse { status, cancelAt }
    async cancelSubscription() {
        return this.request("/subscriptions/cancel", {
            method: "POST",
            auth: "required"
        });
    }

// POST /subscriptions/reactivate
// Returns 204 No Content
    async reactivateSubscription() {
        return this.request("/subscriptions/reactivate", {
            method: "POST",
            auth: "required"
        });
    }
}

export const api = new ApiService({
    getAccessToken: getSupabaseAccessToken,
});
