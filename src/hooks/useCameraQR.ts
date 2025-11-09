/**
 * useCameraQR Hook
 *
 * Production-ready camera initialization with:
 * - Comprehensive error handling and diagnostics
 * - Browser compatibility checks
 * - Permission management
 * - Lifecycle management
 * - Debug mode for development
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "sonner";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Html5Qrcode = any;

interface CameraState {
  isActive: boolean;
  isInitializing: boolean;
  isProcessing: boolean;
  error: string | null;
  hasPermission: boolean | null;
}

interface CameraCapabilities {
  hasMediaDevices: boolean;
  hasGetUserMedia: boolean;
  isSecureContext: boolean;
  availableCameras: number;
}

interface UseCameraQROptions {
  elementId: string;
  onScan: (decodedText: string) => void | Promise<void>;
  fps?: number;
  qrboxSize?: { width: number; height: number };
  debugMode?: boolean;
}

export function useCameraQR({
  elementId,
  onScan,
  fps = 10,
  qrboxSize = { width: 250, height: 250 },
  debugMode = false,
}: UseCameraQROptions) {
  const [state, setState] = useState<CameraState>({
    isActive: false,
    isInitializing: false,
    isProcessing: false,
    error: null,
    hasPermission: null,
  });

  const [capabilities, setCapabilities] = useState<CameraCapabilities>({
    hasMediaDevices: false,
    hasGetUserMedia: false,
    isSecureContext: false,
    availableCameras: 0,
  });

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanCallbackRef = useRef(onScan);

  // Update callback ref when onScan changes
  useEffect(() => {
    scanCallbackRef.current = onScan;
  }, [onScan]);

  const log = useCallback(
    (message: string, data?: unknown) => {
      if (debugMode) {
        console.log(`[useCameraQR] ${message}`, data || "");
      }
    },
    [debugMode]
  );

  const logError = useCallback((message: string, error?: unknown) => {
    console.error(`[useCameraQR] ${message}`, error || "");
  }, []);

  /**
   * Check browser capabilities and environment
   */
  const checkCapabilities =
    useCallback(async (): Promise<CameraCapabilities> => {
      log("Checking browser capabilities...");

      const caps: CameraCapabilities = {
        hasMediaDevices:
          typeof navigator !== "undefined" && !!navigator.mediaDevices,
        hasGetUserMedia:
          typeof navigator !== "undefined" &&
          !!navigator.mediaDevices?.getUserMedia,
        isSecureContext:
          typeof window !== "undefined" &&
          (window.isSecureContext || window.location.hostname === "localhost"),
        availableCameras: 0,
      };

      // Enumerate devices if possible
      if (caps.hasMediaDevices && navigator.mediaDevices.enumerateDevices) {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          caps.availableCameras = devices.filter(
            (d) => d.kind === "videoinput"
          ).length;
          log(`Found ${caps.availableCameras} camera(s)`);
        } catch (err) {
          logError("Failed to enumerate devices", err);
        }
      }

      setCapabilities(caps);
      return caps;
    }, [log, logError]);

  /**
   * Request camera permissions explicitly
   */
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    log("Requesting camera permissions...");

    if (!navigator.mediaDevices?.getUserMedia) {
      logError("getUserMedia is not supported");
      setState((prev) => ({
        ...prev,
        error: "Camera API not supported in this browser",
        hasPermission: false,
      }));
      return false;
    }

    try {
      // Request permission and get stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      log("Camera permission granted");
      streamRef.current = stream;

      setState((prev) => ({
        ...prev,
        hasPermission: true,
        error: null,
      }));

      return true;
    } catch (err) {
      const error = err as Error & { name?: string };
      logError("Permission request failed", error);

      let errorMessage = "Failed to access camera";
      let userMessage = "Unable to access camera";

      if (
        error.name === "NotAllowedError" ||
        error.name === "PermissionDeniedError"
      ) {
        errorMessage = "Camera permission denied";
        userMessage = "Please allow camera access in your browser settings";
      } else if (
        error.name === "NotFoundError" ||
        error.name === "DevicesNotFoundError"
      ) {
        errorMessage = "No camera found";
        userMessage = "No camera device detected on this device";
      } else if (
        error.name === "NotReadableError" ||
        error.name === "TrackStartError"
      ) {
        errorMessage = "Camera already in use";
        userMessage = "Camera is being used by another application";
      } else if (error.name === "OverconstrainedError") {
        errorMessage = "Camera constraints not supported";
        userMessage = "Camera does not meet required specifications";
      } else if (error.name === "SecurityError") {
        errorMessage = "Security error";
        userMessage = "Camera access blocked due to security settings";
      }

      setState((prev) => ({
        ...prev,
        error: errorMessage,
        hasPermission: false,
      }));

      toast.error("Camera Access Failed", {
        description: userMessage,
      });

      return false;
    }
  }, [log, logError]);

  /**
   * Initialize html5-qrcode scanner
   */
  const initializeScanner = useCallback(async (): Promise<boolean> => {
    log("Initializing QR scanner...");

    try {
      // Wait for DOM to be ready
      await new Promise((resolve) => setTimeout(resolve, 150));

      const element = document.getElementById(elementId);
      if (!element) {
        logError(`Element with id "${elementId}" not found in DOM`);
        setState((prev) => ({
          ...prev,
          error: "Scanner element not found",
        }));
        toast.error("Initialization Error", {
          description: "Scanner UI component not ready. Please try again.",
        });
        return false;
      }

      log("DOM element found, loading html5-qrcode library...");

      // Dynamically import html5-qrcode
      const { Html5Qrcode } = await import("html5-qrcode");

      if (html5QrCodeRef.current) {
        log("Scanner already exists, stopping previous instance...");
        try {
          await html5QrCodeRef.current.stop();
        } catch (stopErr) {
          log(
            "Error stopping previous scanner (expected if not running)",
            stopErr
          );
        }
      }

      html5QrCodeRef.current = new Html5Qrcode(elementId);
      log("Html5Qrcode instance created");

      return true;
    } catch (err) {
      logError("Failed to initialize scanner", err);
      setState((prev) => ({
        ...prev,
        error: "Failed to load QR scanner library",
      }));
      toast.error("Initialization Error", {
        description: "Failed to load scanner. Please refresh and try again.",
      });
      return false;
    }
  }, [elementId, log, logError]);

  /**
   * Start the camera and QR scanning
   */
  const startCamera = useCallback(async () => {
    if (state.isActive || state.isInitializing) {
      log("Camera already active or initializing");
      return;
    }

    setState((prev) => ({
      ...prev,
      isInitializing: true,
      error: null,
    }));

    try {
      // Step 1: Check capabilities
      const caps = await checkCapabilities();

      if (!caps.hasMediaDevices || !caps.hasGetUserMedia) {
        throw new Error("Camera API not supported in this browser");
      }

      if (!caps.isSecureContext) {
        logError(
          "Not running in secure context (HTTPS required except localhost)"
        );
        toast.error("Security Error", {
          description: "Camera access requires HTTPS connection",
        });
        setState((prev) => ({
          ...prev,
          isInitializing: false,
          error: "Insecure context",
        }));
        return;
      }

      if (caps.availableCameras === 0) {
        log(
          "No cameras detected, but will attempt to request permission anyway"
        );
      }

      // Step 2: Request permissions
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        setState((prev) => ({ ...prev, isInitializing: false }));
        return;
      }

      // Step 3: Initialize scanner
      const scannerReady = await initializeScanner();
      if (!scannerReady || !html5QrCodeRef.current) {
        setState((prev) => ({ ...prev, isInitializing: false }));
        return;
      }

      // Step 4: Start scanning
      log("Starting QR scanner...");

      const config = {
        fps,
        qrbox: qrboxSize,
        aspectRatio: 1.0,
      };

      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        config,
        async (decodedText: string) => {
          if (state.isProcessing) {
            log("Already processing a scan, skipping...");
            return;
          }

          setState((prev) => ({ ...prev, isProcessing: true }));

          try {
            log("QR code scanned", decodedText);
            await scanCallbackRef.current(decodedText);
          } catch (err) {
            logError("Error in scan callback", err);
          } finally {
            setState((prev) => ({ ...prev, isProcessing: false }));
          }
        },
        (errorMessage: string) => {
          // Suppress verbose scanning errors (expected when no QR in frame)
          if (debugMode && !errorMessage.includes("No MultiFormat Readers")) {
            log("Scan error (non-critical)", errorMessage);
          }
        }
      );

      log("Camera started successfully");

      setState((prev) => ({
        ...prev,
        isActive: true,
        isInitializing: false,
        error: null,
      }));

      toast.success("Camera Started", {
        description: "Point camera at QR code to scan",
      });
    } catch (err) {
      const error = err as Error;
      logError("Failed to start camera", error);

      let userMessage = "Unable to start camera. Please try again.";

      if (error.message.includes("not supported")) {
        userMessage = "Your browser doesn't support camera access";
      } else if (error.message.includes("OverconstrainedError")) {
        userMessage =
          "Camera doesn't meet requirements. Try a different device.";
      }

      setState((prev) => ({
        ...prev,
        isActive: false,
        isInitializing: false,
        error: error.message,
      }));

      toast.error("Camera Start Failed", {
        description: userMessage,
      });
    }
  }, [
    state.isActive,
    state.isInitializing,
    state.isProcessing,
    checkCapabilities,
    requestPermissions,
    initializeScanner,
    fps,
    qrboxSize,
    log,
    logError,
    debugMode,
  ]);

  /**
   * Stop the camera and cleanup
   */
  const stopCamera = useCallback(async () => {
    log("Stopping camera...");

    try {
      if (html5QrCodeRef.current && state.isActive) {
        await html5QrCodeRef.current.stop();
        log("Html5Qrcode stopped");
      }

      // Stop media stream tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
          log(`Stopped track: ${track.kind}`);
        });
        streamRef.current = null;
      }

      setState((prev) => ({
        ...prev,
        isActive: false,
        error: null,
      }));

      toast.success("Camera Stopped");
    } catch (err) {
      logError("Error stopping camera", err);
      // Force state update even on error
      setState((prev) => ({
        ...prev,
        isActive: false,
      }));
    }
  }, [state.isActive, log, logError]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current && state.isActive) {
        html5QrCodeRef.current
          .stop()
          .catch((err: Error) => console.error("Cleanup error:", err));
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [state.isActive]);

  /**
   * Check capabilities on mount
   */
  useEffect(() => {
    checkCapabilities();
  }, [checkCapabilities]);

  return {
    ...state,
    capabilities,
    startCamera,
    stopCamera,
  };
}
