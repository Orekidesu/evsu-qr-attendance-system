"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { RefreshCw } from "lucide-react";
import type { StudentWithDetails } from "@/hooks/useStudentsData";

interface QrCodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: StudentWithDetails;
  onRegenerateQR?: (studentId: string, firebaseDocId: string) => Promise<void>;
}

export function QrCodeModal({
  open,
  onOpenChange,
  student,
  onRegenerateQR,
}: QrCodeModalProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleDownload = () => {
    const svgElement = document.getElementById(
      "qr-code-download"
    ) as SVGElement | null;

    if (!svgElement) {
      console.error("QR code element not found");
      return;
    }

    // Convert SVG to PNG using canvas
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const img = new Image();
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const pngUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");

        // Structured filename: EVSU_QR_StudentID_Name_Date.png
        const date = new Date().toISOString().split("T")[0];
        const sanitizedName =
          `${student.first_name}_${student.last_name}`.replace(
            /[^a-zA-Z0-9_]/g,
            "_"
          );
        link.download = `EVSU_QR_${student.student_id}_${sanitizedName}_${date}.png`;

        link.href = pngUrl;
        link.click();

        URL.revokeObjectURL(pngUrl);
        URL.revokeObjectURL(url);
      });
    };

    img.src = url;
  };

  const handleRegenerate = async () => {
    if (!onRegenerateQR) return;

    setIsRegenerating(true);
    try {
      await onRegenerateQR(student.student_id, student.id);
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>QR Code</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              {student.first_name} {student.last_name}
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              {student.student_id}
            </p>
          </div>

          <div className="flex justify-center p-8 bg-muted rounded-lg">
            <QRCodeSVG
              id="qr-code-download"
              value={student.qr_code}
              size={250}
              level="H"
              includeMargin={true}
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isRegenerating}
          >
            Close
          </Button>
          {onRegenerateQR && (
            <Button
              variant="outline"
              onClick={handleRegenerate}
              disabled={isRegenerating}
            >
              {isRegenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerate QR
                </>
              )}
            </Button>
          )}
          <Button onClick={handleDownload} disabled={isRegenerating}>
            Download QR Code
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
