"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { QRCodeSVG } from "qrcode.react";
import { RefreshCw } from "lucide-react";
import type { StudentWithDetails } from "@/hooks/useStudentsData";

interface ViewStudentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: StudentWithDetails;
  onRegenerateQR?: (studentId: string, firebaseDocId: string) => Promise<void>;
}

export function ViewStudentModal({
  open,
  onOpenChange,
  student,
  onRegenerateQR,
}: ViewStudentModalProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleDownloadPDF = () => {
    const svgElement = document.getElementById(
      "qr-code-view"
    ) as SVGElement | null;
    if (!svgElement) return;

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

  const handlePrint = () => {
    const element = document.getElementById(
      "qr-code-view"
    ) as SVGElement | null;
    if (!element) return;
    const printWindow = window.open("", "", "width=400,height=500");
    if (!printWindow) return;

    const svgData = new XMLSerializer().serializeToString(element);
    printWindow.document.write(`
      <html>
        <head>
          <title>QR Code - ${student.student_id}</title>
          <style>
            body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: Arial; }
            svg { margin: 20px; }
            h2 { margin: 10px 0; }
            p { margin: 5px 0; color: #666; }
          </style>
        </head>
        <body>
          <h2>${student.first_name} ${student.last_name}</h2>
          <p>${student.student_id}</p>
          ${svgData}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Student Details</DialogTitle>
          <DialogDescription>
            Full profile and QR code information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">
              {student.first_name} {student.last_name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {student.student_id}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium">{student.email || "Not provided"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Program</p>
              <Badge variant="outline">{student.programName}</Badge>
            </div>
          </div>

          <div>
            <p className="text-muted-foreground text-sm mb-2">QR Code</p>
            <div className="flex justify-center p-4 bg-muted rounded-lg">
              <QRCodeSVG
                id="qr-code-view"
                value={student.qr_code}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>
          </div>

          {student.enrolledSubjects.length > 0 && (
            <div>
              <p className="text-muted-foreground text-sm mb-2">
                Enrolled Subjects
              </p>
              <div className="space-y-1">
                {student.enrolledSubjects.map((subject) => (
                  <div
                    key={subject.id}
                    className="text-sm p-2 bg-muted rounded"
                  >
                    <span className="font-medium">{subject.courseCode}</span> -{" "}
                    {subject.title}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
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
          <Button
            variant="outline"
            onClick={handleDownloadPDF}
            disabled={isRegenerating}
          >
            Download QR
          </Button>
          <Button
            variant="outline"
            onClick={handlePrint}
            disabled={isRegenerating}
          >
            Print
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
