"use client";
import React, {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";

import { api } from "@/lib/api";
import { WebSocketService } from "@/lib/websocket";
import { CheckCircle, XCircle, Info } from "lucide-react";
import {useRouter} from "next/navigation";
import ToastContainer from "@/components/Toast";

class EventBus {
  constructor() {
    this.events = {};
  }
  on(event, cb) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(cb);
    return () => {
      this.events[event] = (this.events[event] || []).filter((f) => f !== cb);
    };
  }
  emit(event, data) {
    (this.events[event] || []).forEach((cb) => cb(data));
  }
}

const ToastCtx = createContext(null);

function Toasts({ toasts, onAction }) {
    return (
        <div
            id="toastContainer"
            aria-live="polite"
            aria-atomic="true"
            className="fixed top-24 right-4 sm:right-8 z-[3000] flex flex-col gap-3 pointer-events-none"
        >
            {toasts.map((t) => (
                <div
                    key={t.id}
                    className={`
            pointer-events-auto flex items-center gap-3 p-4 min-w-[300px] max-w-sm
            bg-[#16181D]/90 backdrop-blur-md border rounded-xl shadow-2xl
            animate-in slide-in-from-right duration-300
          `}
                    style={{
                        borderColor:
                            t.type === "success"
                                ? "rgba(223, 255, 0, 0.3)"
                                : t.type === "error"
                                    ? "rgba(239, 68, 68, 0.3)"
                                    : "rgba(255, 255, 255, 0.1)",
                    }}
                >
                    <div
                        className={`
              shrink-0 w-8 h-8 rounded-full flex items-center justify-center
              ${
                            t.type === "success"
                                ? "bg-[#DFFF00]/10 text-[#DFFF00]"
                                : t.type === "error"
                                    ? "bg-red-500/10 text-red-500"
                                    : "bg-white/10 text-white"
                        }
            `}
                    >
                        {t.type === "success" && <CheckCircle size={16} />}
                        {t.type === "error" && <XCircle size={16} />}
                        {t.type === "info" && <Info size={16} />}
                    </div>

                    <div className="flex-1 min-w-0">
                        <p
                            className={`text-sm font-bold ${
                                t.type === "success"
                                    ? "text-[#DFFF00]"
                                    : t.type === "error"
                                        ? "text-red-400"
                                        : "text-white"
                            }`}
                        >
                            {t.type === "success" ? "Success" : t.type === "error" ? "Error" : "Info"}
                        </p>

                        <p className="text-sm text-gray-400 mt-0.5 break-words">{t.message}</p>

                        {/* ✅ Action Button */}
                        {t.action?.label && (
                            <div className="mt-2">
                                <button
                                    onClick={() => onAction?.(t)}
                                    className={`
                    inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-bold
                    border transition
                    ${
                                        t.type === "error"
                                            ? "border-red-500/30 bg-red-500/10 text-red-200 hover:bg-red-500/20"
                                            : "border-white/10 bg-white/5 text-white hover:bg-white/10"
                                    }
                  `}
                                >
                                    {t.action.label}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent w-full opacity-50" />
                </div>
            ))}
        </div>
    );
}


const AppCtx = createContext(null);
export function useApp() {
  return useContext(AppCtx);
}

export default function InstantShareProvider({ children }) {
    const [currentSession, setCurrentSession] = useState(null);
    const [myParticipantId, setMyParticipantId] = useState(null);
    const myParticipantIdRef = useRef(null);
    const pendingFilesRef = useRef([]);
    const router = useRouter();

    // Keep ref in sync
    useEffect(() => {
        myParticipantIdRef.current = myParticipantId;
    }, [myParticipantId]);
    const [myRole, setMyRole] = useState(null); // "OWNER" | "PARTICIPANT"

    // Data State
    const [isGuest, setIsGuest] = useState(false); // Driven by 403 response
    const [files, setFiles] = useState([]);
    const [notes, setNotes] = useState([]);
    const [timeLeft, setTimeLeft] = useState(600);
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(false);

    // Refs
    const wsRef = useRef(null);
    const busRef = useRef(new EventBus());
    const unsubscribersRef = useRef([]);
    const countdownRef = useRef(null);
    const isLeavingRef = useRef(false);

    const [participants, setParticipants] = useState([]);
    const hasPeer = useMemo(
        () => participants.some((p) => p.role === "PEER"),
        [participants]
    );


    const [autoDownload, setAutoDownload] = useState(false);

    // ---------- helpers ----------
    const normalizeCode = (c) => (c || "").replace(/[^A-Za-z0-9]/g, "").toUpperCase();

    const withHyphen = (c) => {
        const n = normalizeCode(c);
        return n.length === 8 ? `${n.slice(0, 4)}-${n.slice(4)}` : n;
    };

  // ---------- toast ----------
    // ---------- toast ----------
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const showToast = useCallback((messageOrObj, type = "success", duration = 3500, action) => {
        const id = globalThis?.crypto?.randomUUID?.() || Math.random().toString(36).slice(2);

        const normalized =
            typeof messageOrObj === "string"
                ? { message: messageOrObj, type, duration, action }
                : {
                    message: messageOrObj?.message || "",
                    type: messageOrObj?.type || type,
                    duration: messageOrObj?.duration ?? duration,
                    action: messageOrObj?.action ?? action,
                };

        const toast = {
            id,
            message: normalized.message,
            type: normalized.type,
            duration: normalized.duration,
            action: normalized.action, // { label, href?, onClick? }
        };

        setToasts((prev) => [...prev, toast]);

        window.setTimeout(() => removeToast(id), toast.duration);
    }, [removeToast]);

    const handleToastAction = useCallback(
        (toast) => {
            const action = toast?.action;
            if (!action) return;

            removeToast(toast.id);

            if (typeof action.onClick === "function") return action.onClick();
            if (action.href) router.push(action.href);
        },
        [router, removeToast]
    );



    const handleApiError = useCallback(
        (err, fallback = "Something went wrong") => {
            const status = err?.status;
            const msg = err?.message || fallback;

            const isLimit =
                status === 429 ||
                /max(imum)?|limit|quota|too many|active sessions|plan/i.test(msg);

            if (isLimit) {
                const isGuestLimit =
                    isGuest || /guest|anonymous/i.test(msg);

                showToast(msg, "error", 8000, {
                    label: isGuestLimit ? "Sign up" : "Upgrade",
                    href: isGuestLimit ? "/signup?redirect=/pricing" : "/pricing",
                });
                return;
            }

            if (status === 401) {
                showToast("Please log in to continue.", "error", 6500, {
                    label: "Log in",
                    href: "/login",
                });
                return;
            }

            if (status === 403) {
                showToast("This is locked for guests. Sign up to unlock it.", "info", 8000, {
                    label: "Sign up",
                    href: "/signup",
                });
                return;
            }

            showToast(msg, "error", 6500);
        },
        [showToast, isGuest]
    );



    // ---------- formatters ----------
  const formatTime = useCallback((seconds) => {
    const m = Math.floor(seconds / 60);
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, []);

  const formatFileSize = useCallback((bytes) => {
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let i = 0;
    while (size >= 1024 && i < units.length - 1) {
      size /= 1024;
      i++;
    }
    return `${size.toFixed(1)} ${units[i]}`;
  }, []);

  // ---------- global ws error listener ----------
  useEffect(() => {
    const handleWebSocketError = (event) => {
      showToast(event?.detail?.message || "WebSocket error", "error", 5000);
    };
    window.addEventListener("websocket-error", handleWebSocketError);
    return () => window.removeEventListener("websocket-error", handleWebSocketError);
  }, [showToast]);

  // ---------- countdown ----------
  const startCountdown = useCallback((initialSeconds) => {
    const start = typeof initialSeconds === "number" ? Math.max(0, initialSeconds) : 600;

    setTimeLeft(start);
    if (countdownRef.current) clearInterval(countdownRef.current);

    countdownRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(countdownRef.current);
          busRef.current.emit("sessionExpired");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }, []);

    const rehydrateSession = useCallback(async (code) => {
        try {
            setLoading(true);
            cleanupWebSocketSubscriptions();

            // A. Resolve Code -> Session UUID
            // Assuming api.getSessionByCode returns { id, code, ownerId, ... }
            const sessionData = await api.getSessionByCode(code);

            // B. Join (Idempotent - refreshes participation)
            await api.joinSessionById(sessionData.id);

            // C. Determine Ownership (Check against current user or response flag)
            // For MVP, if we successfully fetched private session data, we are in.
            //Ideally backend returns "role": "OWNER" in participant list

            // D. Setup State
            setCurrentSession({
                id: sessionData.id,
                code: sessionData.code,
                codeDisplay: withHyphen(sessionData.code),
                ownerId: sessionData.ownerId,
                qrCodeData: null, // Can regenerate or fetch
                createdAt: Date.now(), // approximation
            });

            setIsConnected(true);

            // E. Connect WebSocket
            connectWebSocket(sessionData.id);

            // F. Fetch existing notes/files
            const existingFiles = await api.getFiles(sessionData.id); // You need this endpoint
            const existingNotes = await api.getNotes(sessionData.id); // You need this endpoint

            setFiles(existingFiles.map(f => ({...f, status: 'uploaded', progress: 100})));
            setNotes(existingNotes);

        } catch (err) {
            console.error("Rehydration failed:", err);
            showToast("Session not found or expired", "error");
            // Don't redirect immediately, let UI show error state
        } finally {
            setLoading(false);
        }
    }, []);


    const sendSessionNote = useCallback(async (content) => {
        if (!currentSession?.id) return;

        const clientNoteId = `c_${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}`;

        setNotes(prev => [...prev, {
            id: clientNoteId,
            senderId: myParticipantId,
            content,
            createdAt: new Date().toISOString(),
            isOptimistic: true
        }]);

        try {
            const real = await api.createNote(currentSession.id, content, clientNoteId); // returns { id, senderId, content, createdAt }

            setNotes(prev => prev.map(n =>
                n.id === clientNoteId ? { ...real, isOptimistic: false } : n
            ));
        } catch (error) {
            setNotes(prev => prev.filter(n => n.id !== clientNoteId));
            if (error?.status === 403) setIsGuest(true);
            handleApiError(error, "Failed to send session note");
        }
    }, [currentSession, myParticipantId, showToast]);

    const endSessionForEveryone = useCallback(async () => {
        if (!currentSession?.id) return;

        try {
            // tell backend "close this session"
            await api.endSession(currentSession.id);
            // backend will broadcast DROP_SESSION_CLOSED; your WS handler hardReset() will run
        } catch (err) {
            console.error("endSession failed:", err);
            handleApiError(err, "Failed to end session");
            // still allow local cleanup if you want:
            // await endSession();
        }
    }, [currentSession, showToast]);


    const hardReset = useCallback(() => {
        setCurrentSession(null);
        setFiles([]);
        setNotes([]);
        setParticipants([]);
        setIsConnected(false);

        // 2. Emit event so the Overlay shows up
        busRef.current.emit("sessionClosed");
        // ... cleanup logic ...
        // if (typeof window !== 'undefined') window.location.href = '/';
    }, []);

  // ---------- ws subscriptions cleanup ----------
  const cleanupWebSocketSubscriptions = useCallback(() => {
    unsubscribersRef.current.forEach((unsub) => {
      try {
        unsub?.();
      } catch (e) {
        console.error("Error unsubscribing:", e);
      }
    });
    unsubscribersRef.current = [];
  }, []);

  // ---------- leave room ----------
  const endSession = useCallback(async () => {
      if (countdownRef.current) clearInterval(countdownRef.current);

      cleanupWebSocketSubscriptions();

      if (wsRef.current) {
          try {
              wsRef.current.disconnect();
          } catch (e) {
              console.error("Failed to disconnect:", e);
          }
          wsRef.current = null;
      }

      setCurrentSession(null);
      setMyParticipantId(null);
      setAutoDownload(false);
      setTimeLeft(600);
      setFiles([]);
      setNotes([]);
      setParticipants([]);
      setIsConnected(false);
  }, [cleanupWebSocketSubscriptions]);

    const leaveRoom = useCallback(async () => {
        if (!currentSession?.id) return;

        isLeavingRef.current = true;
        const sessionId = currentSession.id;

        try {

            await api.leaveSession(sessionId);
        } catch (err) {
            console.warn("Backend leave failed:", err);
        } finally {
            cleanupWebSocketSubscriptions();
            if (countdownRef.current) clearInterval(countdownRef.current);
            if (wsRef.current) {
                wsRef.current.disconnect();
                wsRef.current = null;
            }

            if (typeof window !== 'undefined') {
                window.location.href = '/';
            }

            setCurrentSession(null);
            setFiles([]);
            setNotes([]);
            setIsConnected(false);

            // Keep the guard active for a bit to prevent any late-firing effects
            setTimeout(() => { isLeavingRef.current = false; }, 2000);
        }
    }, [currentSession, endSession, showToast]);

  const resetSession = endSession;

    const upsertParticipant = useCallback((p) => {
        if (!p?.participantId) return;
        setParticipants((prev) => {
            const exists = prev.some((x) => x.participantId === p.participantId);
            if (exists) return prev.map((x) => (x.participantId === p.participantId ? p : x));
            return [...prev, p];
        });
    }, []);

    const removeParticipant = useCallback((participantId) => {
        if (!participantId) return;
        setParticipants((prev) => prev.filter((p) => p.participantId !== participantId));
    }, []);


    // ---------- WS wiring helper ----------
  const connectWebSocket = useCallback(
      (sessionId) => {
          if (wsRef.current?.sessionId === sessionId) return;

        wsRef.current = new WebSocketService();
        wsRef.current.connect(sessionId);



        const unsubPeerJoined = wsRef.current.subscribe("PEER_JOINED", (payload) => {
            upsertParticipant({
                participantId: payload.participantId,
                userId: payload.userId,
                role: payload.role, // "OWNER" or "PEER"
                displayName: payload.displayName,
                guest: payload.guest,
            });

            if (payload.role === "PEER") {
                showToast("Peer connected!");
            }
        });
        unsubscribersRef.current.push(unsubPeerJoined);

        const unsubPeerLeft = wsRef.current.subscribe("PEER_LEFT", (payload) => {
            removeParticipant(payload.participantId);
            showToast("Peer left", "info");
        });
        unsubscribersRef.current.push(unsubPeerLeft);

        const unsubFileUploaded = wsRef.current.subscribe("FILE_UPLOADED", (payload) => {
            const serverId = payload.fileId;
            const isMine = payload.uploaderParticipantId === myParticipantIdRef.current;

            setFiles(prev => {
                if (prev.some(f => f.serverFileId === serverId || f.id === serverId)) return prev;


                const matchingLocalFile = prev.find(f =>
                    f.status === 'uploading' &&
                    f.name === payload.originalName &&
                    f.size === payload.sizeBytes
                );

                if (matchingLocalFile) {
                    return prev.map(f => f.id === matchingLocalFile.id ? {
                        id: serverId,
                        serverFileId: serverId,
                        name: payload.originalName,
                        size: payload.sizeBytes,
                        createdAt: payload.createdAt,
                        status: "uploaded",
                        progress: 100,
                        downloadedByMe: false,
                    } : f);
                }

                return [...prev, {
                    id: serverId,
                    serverFileId: serverId,
                    name: payload.originalName,
                    size: payload.sizeBytes,
                    createdAt: payload.createdAt,
                    status: "uploaded",
                    progress: 100,
                    downloadedByMe: false,
                }];
            });

            if (!isMine) {
                showToast(`Received ${payload.originalName}`);
            }
        });
        unsubscribersRef.current.push(unsubFileUploaded);

        const unsubFileDownloaded = wsRef.current.subscribe("FILE_DOWNLOADED", (payload) => {
          const id = payload.fileId || payload.id;

            setFiles(prev => prev.map(f => f.id === id ? { ...f, downloadedByMe: true } : f));

        });
        unsubscribersRef.current.push(unsubFileDownloaded);

        const unsubExpired = wsRef.current.subscribe("DROP_SESSION_EXPIRED", () => {
          showToast("Session expired", "error");
          hardReset();
        });
        unsubscribersRef.current.push(unsubExpired);

          const unsubNotes = wsRef.current.subscribe("SESSION_NOTE_CREATED", (payload) => {
              const newNote = {
                  id: payload.noteId,          // ✅ map noteId -> id
                  senderId: payload.senderId,  // participantId
                  content: payload.content,
                  createdAt: payload.createdAt,
              };

              setNotes(prev => {
                  const hasOptimistic = prev.some(n => n.id === payload.clientNoteId);

                  if (hasOptimistic) {
                      return prev.map(n => n.id === payload.clientNoteId ? newNote : n);
                  }

                  if (prev.some(n => n.id === newNote.id)) return prev;

                  return [...prev, newNote];
              });
          });
          unsubscribersRef.current.push(unsubNotes);

        const unsubClosed = wsRef.current.subscribe("DROP_SESSION_CLOSED", () => {
          showToast("Session closed", "info");
          hardReset();
        });
        unsubscribersRef.current.push(unsubClosed);



        const unsubFilesCleaned = wsRef.current.subscribe("DROP_SESSION_FILES_CLEANED", () => {
          // server deleted them after session end
          setFiles([]);
        });
        unsubscribersRef.current.push(unsubFilesCleaned);
      },
      [hardReset, showToast, upsertParticipant, removeParticipant]
  );

    const joinSessionSequence = useCallback(async (codeOrId) => {
        if (isLeavingRef.current) return false;

        try {
            const remainingSecondsFromExpiresAt = (expiresAt) => {
                if (!expiresAt) return 600;
                const ms = new Date(expiresAt).getTime() - Date.now();
                return Math.max(0, Math.floor(ms / 1000));
            };

            setLoading(true);
            setIsGuest(false);

            // A. Resolve
            const sessionData = await api.getSessionByCode(codeOrId);
            if (!sessionData?.id) throw new Error("Session not found");

            // B. Join
            const participant = await api.joinSessionById(sessionData.id);
            setMyParticipantId(participant.id);
            setMyRole(participant.role);

            const roster = await api.getParticipants(sessionData.id);
            setParticipants(roster);

            // Set AutoDownload pref if saved on participant (optional)
            if (participant.autoDownload) setAutoDownload(true);

            // C. Setup
            setCurrentSession({
                id: sessionData.id,
                code: sessionData.code,
                codeDisplay: `${sessionData.code.slice(0,4)}-${sessionData.code.slice(4)}`,
                expiresAt: sessionData.expiresAt,
                ownerId: sessionData.ownerId
            });

            startCountdown(remainingSecondsFromExpiresAt(sessionData.expiresAt));

            // D. Fetch Data
            const [fetchedFiles, fetchedNotes] = await Promise.all([
                api.getFiles(sessionData.id),
                api.getNotes(sessionData.id).catch(e => e?.status === 403 ? [] : Promise.reject(e))
            ]);

            // STRICT MAPPING
            setFiles(fetchedFiles.map(f => ({
                id: f.id,
                name: f.originalName,
                size: f.sizeBytes,
                createdAt: f.createdAt,
                status: 'uploaded',       // Always uploaded if fetched from list
                downloadedByMe: f.downloadedByMe, // Boolean from backend
                progress: 100
            })));

            setNotes(fetchedNotes.map(n => ({
                id: n.id,
                senderId: n.senderId,
                content: n.content,
                createdAt: n.createdAt
            })));

            if (fetchedNotes.length === 0 && !isGuest) {
                // If try-catch didn't catch 403 but list is empty, we might check permissions separately
                // but usually the catch block handles the isGuest toggle.
            }

            // E. Connect
            connectWebSocket(sessionData.id);
            // ... timer logic ...

            return true;
        } catch (err) {
            console.error(err);
            setLoading(false);
            setCurrentSession(null);

            if (err?.status === 403) {
                setIsGuest(true);
                return true;
            } else {
                handleApiError(err, "Session invalid");
                return false;
            }
        } finally {
            setLoading(false);
        }
    }, [connectWebSocket, isGuest, showToast]);

  // ---------- create pairing ----------
  const createPairing = useCallback(async () => {
    try {
      setLoading(true);
      cleanupWebSocketSubscriptions();

      const session = await api.createSession();

      const normalized = normalizeCode(session.code);
      const display = withHyphen(normalized);

      const joinUrl = `${window.location.origin}/join?code=${normalized}`;

      setCurrentSession({
        id: session.id,
        code: normalized,
        codeDisplay: display,
        qrCodeData: joinUrl,
        createdAt: Date.now(),
      });

        setParticipants([]);
        setIsConnected(false);

        const me = await api.joinSessionById(session.id); // Idempotent join to get details
        setMyParticipantId(me.id);
        setMyRole(me.role);

      // server-driven countdown
        const remaining = session.expiresAt
            ? Math.max(0, Math.floor((new Date(session.expiresAt).getTime() - Date.now()) / 1000))
            : (session.remainingSeconds ?? 600);
      startCountdown(remaining);

      // connect WS
      connectWebSocket(session.id);

      // load current files (owner auto-participant)
      const existingFiles = await api.getFiles(session.id);
      setFiles(
          (existingFiles || []).map((f) => ({
            id: f.id,
            name: f.originalName,
            size: f.sizeBytes,
            status: f.downloadedByMe ? "downloaded" : "uploaded",
            progress: 100,
            serverFileId: f.id,
          }))
      );

      // settings
      try {
        const s = await api.getMySettings(session.id);
        setAutoDownload(!!s?.autoDownload);
      } catch {
        // ignore
      }

      showToast("Pairing session created");
      return session;
    } catch (error) {
      console.error("Failed to create session:", error);
      handleApiError(error, "Failed to create session");
    } finally {
      setLoading(false);
    }
  }, [
    cleanupWebSocketSubscriptions,
    connectWebSocket,
    normalizeCode,
    showToast,
    startCountdown,
    withHyphen,
  ]);
    // ---------- upload ----------
  const processFiles = useCallback(
      async (selectedFiles) => {
        if (!currentSession?.id) {
          showToast("Please join a session first", "error");
          return;
        }

        const MAX_SIZE = 100 * 1024 * 1024;
        const oversizedFiles = selectedFiles.filter((f) => f.size > MAX_SIZE);

        if (oversizedFiles.length > 0) {
          showToast(
              `Some files exceed 100MB: ${oversizedFiles.map((f) => f.name).join(", ")}`,
              "error"
          );
          selectedFiles = selectedFiles.filter((f) => f.size <= MAX_SIZE);
        }

        if (selectedFiles.length === 0) return;

        for (const file of selectedFiles) {
          const tempId = Math.random().toString(36).slice(2);

          const localFileObj = {
            id: tempId,
            name: file.name,
            size: file.size,
            status: "uploading",
            progress: 0,
            serverFileId: null,
          };

          setFiles((prev) => [...prev, localFileObj]);

          try {
            // ✅ backend: POST /sessions/{id}/files/upload-url
            const { signedUrl, objectPath } = await api.requestUpload(currentSession.id, {
              fileName: file.name,
              contentType: file.type || "application/octet-stream",
              fileSize: file.size,
            });

            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener("progress", (e) => {
              if (e.lengthComputable) {
                const progress = (e.loaded / e.total) * 100;
                setFiles((prev) =>
                    prev.map((f) => (f.id === tempId ? { ...f, progress } : f))
                );
              }
            });

            xhr.addEventListener("load", async () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                try {
                  const meta = await api.confirmUpload(currentSession.id, {
                    objectPath,
                    originalName: file.name,
                    sizeBytes: file.size,
                  });

                  setFiles((prev) =>
                      prev.map((f) =>
                          f.id === tempId
                              ? {
                                ...f,
                              id: meta.id,
                                status: "uploaded",
                                progress: 100,
                                serverFileId: meta.id,
                              }
                              : f
                      )
                  );

                  busRef.current.emit("fileUploaded", {
                    id: meta.id,
                    name: file.name,
                    size: file.size,
                  });

                  showToast(`${file.name} sent successfully`);
                } catch (confirmError) {
                  console.error("Failed to confirm upload:", confirmError);
                  setFiles((prev) =>
                      prev.map((f) => (f.id === tempId ? { ...f, status: "error" } : f))
                  );
                  showToast(`Failed to confirm ${file.name}`, "error");
                }
              } else {
                setFiles((prev) =>
                    prev.map((f) => (f.id === tempId ? { ...f, status: "error" } : f))
                );
                  handleApiError({ status: xhr.status, message: `Failed to upload ${file.name}` }, `Failed to upload ${file.name}`);
              }
            });

            xhr.addEventListener("error", () => {
              setFiles((prev) =>
                  prev.map((f) => (f.id === tempId ? { ...f, status: "error" } : f))
              );
                handleApiError({ status: xhr.status || 0, message: `Failed to upload ${file.name}` }, `Failed to upload ${file.name}`);
            });

            xhr.open("PUT", signedUrl);
            xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
            xhr.send(file);
          } catch (error) {
            console.error("Upload failed:", error);
            setFiles((prev) =>
                prev.map((f) => (f.id === tempId ? { ...f, status: "error" } : f))
            );
            showToast(`Failed to upload ${file.name}`, "error");
          }
        }
      },
      [currentSession, showToast]
  );

    const downloadFile = useCallback(async (fileId) => {
        if (!currentSession?.id) return;

        try {
            // Find file
            const file = files.find(f => f.id === fileId);
            if (!file) return;

            // A. Get URL
            const response = await api.getDownloadUrl(currentSession.id, fileId);

            // B. Trigger Browser Download
            const link = document.createElement("a");
            link.href = response.downloadUrl;
            link.download = file.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // C. Call API to Mark
            await api.markFileDownloaded(currentSession.id, fileId);

            // D. Update Local State
            setFiles(prev => prev.map(f =>
                f.id === fileId ? { ...f, downloadedByMe: true } : f
            ));

            showToast(`Downloaded ${file.name}`);

        } catch (error) {
            console.error("Download failed:", error);
            handleApiError(error, "Failed to download file");
            setFiles(prev => prev.map(f =>
                f.id === fileId ? { ...f, isDownloading: false } : f
            ));

        }
        setFiles(prev => prev.map(f =>
            f.id === fileId ? { ...f, downloadedByMe: true, isDownloading: false } : f
        ));

    }, [currentSession, files, showToast]);

    useEffect(() => {
        if (!autoDownload || !currentSession) return;

        const pendingFiles = files.filter(f =>
            f.status === 'uploaded' &&
            f.downloadedByMe === false &&
            !f.isDownloading // Prevent loops if you add a transient flag
        );

        if (pendingFiles.length === 0) return;

        // Process sequentially or parallel
        pendingFiles.forEach(async (file) => {
            // Mark as processing to prevent double-trigger
            setFiles(prev => prev.map(f => f.id === file.id ? { ...f, isDownloading: true } : f));
            await downloadFile(file.id);
            // downloadFile will update downloadedByMe: true, clearing it from this list
        });

    }, [files, autoDownload, currentSession, downloadFile]);

  const downloadAllFiles = useCallback(async () => {
    if (!currentSession || files.length === 0) {
      showToast("No files to download", "error");
      return;
    }

    const uploadedFiles = files.filter((f) => f.status === "uploaded");
    if (uploadedFiles.length === 0) {
      showToast("No files available to download", "error");
      return;
    }

    showToast(`Downloading ${uploadedFiles.length} file(s)...`);

    for (const file of uploadedFiles) {
      await downloadFile(file.id);
      await new Promise((resolve) => setTimeout(resolve, 400));
    }

    showToast("All files downloaded!");
  }, [currentSession, files, downloadFile, showToast]);

    const queueFiles = useCallback((fileList) => {
        pendingFilesRef.current = Array.isArray(fileList) ? fileList : [];
    }, []);

    const flushQueuedFiles = useCallback(async () => {
        if (!currentSession?.id) return;
        const queued = pendingFilesRef.current;
        if (!queued || queued.length === 0) return;

        pendingFilesRef.current = [];

        // now upload using your existing flow
        await processFiles(queued);
    }, [currentSession?.id, processFiles]);

    const toggleAutoDownload = useCallback(() => {
        setAutoDownload(prev => {
            const next = !prev;
            showToast(next ? "Auto-download Enabled" : "Auto-download Disabled");
            return next;
        });
    }, [showToast]);

  // ---------- auto download behavior ----------
  useEffect(() => {
    if (!autoDownload) return;

    const off = busRef.current.on("fileUploaded", (file) => {
      if (!file?.id) return;

      setTimeout(() => {
        // try to auto-download by finding file in state
        const f = files.find((x) => x.serverFileId === file.id || x.id === file.id);
        if (f) downloadFile(f.id);
      }, 600);
    });

    return off;
  }, [autoDownload, files, downloadFile]);

  // ---------- countdown warnings ----------
  useEffect(() => {
    if (!currentSession) return;

    if (timeLeft === 60) {
      showToast("Session expires in 1 minute", "error");
    } else if (timeLeft === 300) {
      showToast("5 minutes remaining", "error");
    }
  }, [timeLeft, currentSession, showToast]);

  // ---------- unmount cleanup ----------
  useEffect(() => {
    return () => {
      cleanupWebSocketSubscriptions();
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (wsRef.current) wsRef.current.disconnect();
    };
  }, [cleanupWebSocketSubscriptions]);



  const value = useMemo(
      () => ({
        currentSession,
          myParticipantId,
        autoDownload,
        timeLeft,
        files,
        isConnected,
          isGuest,
          isOwner: myRole === "OWNER",
        loading,
        formatTime,
        formatFileSize,
        createPairing,
          sendSessionNote,
          joinSessionSequence,
          participants,
          hasPeer,
          notes,
        processFiles,
        downloadFile,
        downloadAllFiles,
          queueFiles,
          flushQueuedFiles,
        toggleAutoDownload,
        leaveRoom,
          endSessionForEveryone,
        resetSession,
        bus: busRef.current,
        showToast,
      }),
      [currentSession, myParticipantId, autoDownload, timeLeft, files, isConnected, isGuest, myRole, loading, formatTime, formatFileSize, createPairing, sendSessionNote, joinSessionSequence, participants, hasPeer, notes, processFiles, downloadFile, downloadAllFiles, queueFiles, flushQueuedFiles, toggleAutoDownload, leaveRoom, endSessionForEveryone, resetSession, showToast]
  );

  return (
        <AppCtx.Provider value={value}>
            <ToastContainer
                toasts={toasts}
                removeToast={removeToast}
                onAction={handleToastAction}
            />
          {children}
        </AppCtx.Provider>
  );
}
