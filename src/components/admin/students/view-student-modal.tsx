"use client";

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
import type { StudentWithDetails } from "@/hooks/useStudentsData";

interface ViewStudentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: StudentWithDetails;
}

export function ViewStudentModal({
  open,
  onOpenChange,
  student,
}: ViewStudentModalProps) {
  const handleDownloadPDF = () => {
    const element = document.getElementById(
      "qr-code-view"
    ) as SVGElement | null;
    if (!element) return;

    // Convert SVG to data URL
    const svgData = new XMLSerializer().serializeToString(element);
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${student.student_id}-qrcode.svg`;
    link.click();
    URL.revokeObjectURL(url);
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

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleDownloadPDF}>
            Download QR
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            Print
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
