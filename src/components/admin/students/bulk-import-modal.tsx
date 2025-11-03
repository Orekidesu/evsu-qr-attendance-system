"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileText,
} from "lucide-react";
import type { Program } from "@/lib/types/program";

interface BulkImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programs: Program[];
  onImport: (file: File, programId: string) => Promise<void>;
  isImporting?: boolean;
}

interface CSVPreview {
  headers: string[];
  rows: string[][];
  valid: boolean;
  errors: string[];
}

export function BulkImportModal({
  open,
  onOpenChange,
  programs,
  onImport,
  isImporting = false,
}: BulkImportModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [programId, setProgramId] = useState("");
  const [preview, setPreview] = useState<CSVPreview | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const validateCSV = (content: string): CSVPreview => {
    const lines = content.trim().split("\n");
    const errors: string[] = [];

    if (lines.length < 2) {
      return {
        headers: [],
        rows: [],
        valid: false,
        errors: [
          "CSV file must contain at least a header row and one data row",
        ],
      };
    }

    const headers = lines[0].split(",").map((h) => h.trim());
    const requiredHeaders = ["student_id", "first_name", "last_name"];
    const optionalHeaders = ["email"];

    // Check for required headers
    const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));
    if (missingHeaders.length > 0) {
      errors.push(`Missing required columns: ${missingHeaders.join(", ")}`);
    }

    // Check for unknown headers
    const validHeaders = [...requiredHeaders, ...optionalHeaders];
    const unknownHeaders = headers.filter(
      (h) => h && !validHeaders.includes(h)
    );
    if (unknownHeaders.length > 0) {
      errors.push(
        `Unknown columns will be ignored: ${unknownHeaders.join(", ")}`
      );
    }

    // Parse rows
    const rows = lines.slice(1).map((line, index) => {
      const row = line.split(",").map((cell) => cell.trim());

      // Validate row has correct number of columns
      if (row.length !== headers.length) {
        errors.push(
          `Row ${index + 2}: Expected ${headers.length} columns, got ${row.length}`
        );
      }

      // Validate required fields are not empty
      requiredHeaders.forEach((header) => {
        const colIndex = headers.indexOf(header);
        if (colIndex !== -1 && !row[colIndex]) {
          errors.push(`Row ${index + 2}: Missing ${header}`);
        }
      });

      return row;
    });

    return {
      headers,
      rows,
      valid: errors.length === 0 && rows.length > 0,
      errors,
    };
  };

  const handleFileSelect = (file: File) => {
    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      setPreview({
        headers: [],
        rows: [],
        valid: false,
        errors: ["Please select a CSV file"],
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const validation = validateCSV(content);
      setPreview(validation);
    };
    reader.readAsText(file);
    setSelectedFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!selectedFile || !programId || !preview?.valid) return;

    await onImport(selectedFile, programId);

    // Reset form on success
    setSelectedFile(null);
    setPreview(null);
    setProgramId("");
  };

  const handleClose = () => {
    if (!isImporting) {
      setSelectedFile(null);
      setPreview(null);
      setProgramId("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Import Students</DialogTitle>
          <DialogDescription>
            Upload a CSV file to import multiple students at once. Download the
            template to see the required format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Program Selection */}
          <div>
            <Label htmlFor="bulk-program">
              Program * (All students will be assigned to this program)
            </Label>
            <Select
              value={programId}
              onValueChange={setProgramId}
              disabled={isImporting}
            >
              <SelectTrigger id="bulk-program">
                <SelectValue placeholder="Select a program" />
              </SelectTrigger>
              <SelectContent>
                {programs.map((program) => (
                  <SelectItem key={program.id} value={program.id}>
                    {program.abbreviation} - {program.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* File Upload */}
          <div>
            <Label>CSV File *</Label>
            <div
              className={`mt-2 border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="csv-upload"
                accept=".csv"
                onChange={handleFileInput}
                className="hidden"
                disabled={isImporting}
              />
              <label
                htmlFor="csv-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                {selectedFile ? (
                  <>
                    <FileText className="w-12 h-12 text-primary" />
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-muted-foreground" />
                    <p className="font-medium">
                      Drop CSV file here or click to browse
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Accepts .csv files only
                    </p>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Preview/Validation */}
          {preview && (
            <div className="space-y-2">
              {preview.valid ? (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    File is valid! Found {preview.rows.length} student(s) to
                    import.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-semibold mb-2">Validation Errors:</div>
                    <ul className="list-disc list-inside space-y-1">
                      {preview.errors.map((error, index) => (
                        <li key={index} className="text-sm">
                          {error}
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Preview first few rows */}
              {preview.rows.length > 0 && (
                <div className="border rounded-lg p-4 bg-muted/50">
                  <p className="text-sm font-semibold mb-2">
                    Preview (first 3 rows):
                  </p>
                  <div className="overflow-x-auto">
                    <table className="text-sm w-full">
                      <thead>
                        <tr className="border-b">
                          {preview.headers.map((header, index) => (
                            <th
                              key={index}
                              className="text-left p-2 font-semibold"
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {preview.rows.slice(0, 3).map((row, rowIndex) => (
                          <tr key={rowIndex} className="border-b last:border-0">
                            {row.map((cell, cellIndex) => (
                              <td key={cellIndex} className="p-2">
                                {cell || (
                                  <span className="text-muted-foreground italic">
                                    empty
                                  </span>
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {preview.rows.length > 3 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      ... and {preview.rows.length - 3} more row(s)
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Info Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Important:</strong> QR codes will be automatically
              generated for all imported students. Duplicate student IDs or
              emails will be skipped with an error report after import.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isImporting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={
              !selectedFile || !programId || !preview?.valid || isImporting
            }
          >
            {isImporting ? (
              <>
                <span className="inline-block animate-spin mr-2">⏳</span>
                Importing...
              </>
            ) : (
              `Import ${preview?.rows.length || 0} Student(s)`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
