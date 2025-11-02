"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import type { StudentWithDetails } from "@/hooks/useStudentsData";

interface QrCodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: StudentWithDetails;
}

export function QrCodeModal({ open, onOpenChange, student }: QrCodeModalProps) {
  const handleDownload = () => {
    const element = document.getElementById(
      "qr-code-download"
    ) as HTMLCanvasElement;
    const link = document.createElement("a");
    link.href = element.toDataURL("image/png");
    link.download = `${student.student_id}-qrcode.png`;
    link.click();
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

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleDownload}>Download QR Code</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
