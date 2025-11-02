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
    const element = document.getElementById(
      "qr-code-download"
    ) as HTMLCanvasElement;
    const link = document.createElement("a");
    link.href = element.toDataURL("image/png");
    link.download = `${student.student_id}-qrcode.png`;
    link.click();
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
