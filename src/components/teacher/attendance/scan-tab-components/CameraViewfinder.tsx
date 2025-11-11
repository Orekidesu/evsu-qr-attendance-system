"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Video, Type, Loader2, AlertCircle } from "lucide-react";

interface CameraViewfinderProps {
  camera: {
    isActive: boolean;
    isInitializing: boolean;
    isProcessing: boolean;
    error: string | null;
    capabilities: {
      isSecureContext: boolean;
      availableCameras: number;
    };
    startCamera: () => Promise<void>;
    stopCamera: () => Promise<void>;
  };
  manualEntry: string;
  onManualEntryChange: (value: string) => void;
  onManualEntrySubmit: () => void;
}

export function CameraViewfinder({
  camera,
  manualEntry,
  onManualEntryChange,
  onManualEntrySubmit,
}: CameraViewfinderProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>QR Camera Viewfinder</CardTitle>
        <CardDescription>
          {camera.isActive
            ? "Camera is active - point at QR code to scan"
            : "Start camera to begin scanning"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Camera View Container - Always rendered for DOM access */}
        <div className="relative">
          {/* Camera Status Display */}
          {!camera.isActive && !camera.isInitializing && (
            <div className="bg-muted rounded-lg aspect-video flex items-center justify-center border-2 border-dashed">
              <div className="text-center">
                <Video className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Point camera at QR code
                </p>
                {camera.error && (
                  <p className="text-xs text-destructive mt-2">
                    {camera.error}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Initializing State */}
          {camera.isInitializing && (
            <div className="bg-muted rounded-lg aspect-video flex items-center justify-center border-2 border-dashed">
              <div className="text-center">
                <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin mb-2" />
                <p className="text-sm text-muted-foreground">
                  Initializing camera...
                </p>
              </div>
            </div>
          )}

          {/* QR Reader Element - Always in DOM, visibility controlled by CSS */}
          <div
            id="qr-reader"
            className={`... ${
              camera.isActive
                ? "relative z-10 border-primary opacity-100"
                : "absolute inset-0 opacity-0 pointer-events-none"
            }`}
          />

          {/* Processing Indicator */}
          {camera.isProcessing && (
            <div className="text-center text-sm text-muted-foreground mt-2 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing scan...
            </div>
          )}
        </div>

        {/* Control Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <Button
            variant={camera.isActive ? "destructive" : "default"}
            onClick={camera.isActive ? camera.stopCamera : camera.startCamera}
            disabled={camera.isInitializing || camera.isProcessing}
          >
            <Video className="w-4 h-4 mr-2" />
            {camera.isInitializing
              ? "Initializing..."
              : camera.isActive
                ? "Stop Camera"
                : "Start Camera"}
          </Button>
          <Button variant="outline" disabled>
            <Type className="w-4 h-4 mr-2" />
            Manual Entry
          </Button>
        </div>

        {/* Capability Warnings */}
        {!camera.capabilities.isSecureContext && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Security Warning</AlertTitle>
            <AlertDescription>
              Camera access requires HTTPS connection. Please use HTTPS or
              localhost.
            </AlertDescription>
          </Alert>
        )}

        {camera.capabilities.availableCameras === 0 &&
          !camera.isInitializing && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Camera Detected</AlertTitle>
              <AlertDescription>
                No camera devices found. Please connect a camera or check your
                device settings.
              </AlertDescription>
            </Alert>
          )}

        {/* Manual Entry Input */}
        <div className="mt-4 space-y-2">
          <label className="text-sm font-medium">
            Or enter Student ID manually
          </label>
          <div className="flex gap-2">
            <Input
              placeholder="Enter Student ID"
              value={manualEntry}
              onChange={(e) => onManualEntryChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onManualEntrySubmit()}
            />
            <Button onClick={onManualEntrySubmit}>Add</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
