# QR Code Download Features

## Overview

The QR code download functionality has been completely overhauled with improved naming conventions and bulk download capabilities.

## Features Implemented

### 1. **Fixed Individual QR Download**

#### Issue Fixed:

- QR codes were not downloading because the code was trying to access a canvas element when `QRCodeSVG` renders an SVG
- Fixed by converting SVG to PNG using proper canvas rendering

#### New Filename Format:

```
EVSU_QR_{StudentID}_{FirstName}_{LastName}_{Date}.png

Examples:
- EVSU_QR_2025-001_Juan_Dela_Cruz_2025-11-04.png
- EVSU_QR_2025-002_Maria_Santos_2025-11-04.png
```

#### Where Available:

- **QR Code Modal**: Quick view and download modal
- **View Student Modal**: Full student details with QR code

---

### 2. **Bulk QR Code Download by Program**

Download multiple student QR codes at once, filtered by program.

#### How It Works:

1. Navigate to Students page
2. Select a program from dropdown (or "All Programs")
3. Click "Bulk QR" button in toolbar
4. System generates all QR codes and packages them into a ZIP file
5. ZIP file downloads automatically

#### ZIP File Structure:

```
EVSU_QR_Codes_{ProgramName}_{Date}.zip
├── EVSU_QR_2025-001_Juan_Dela_Cruz.png
├── EVSU_QR_2025-002_Maria_Santos.png
├── EVSU_QR_2025-003_Pedro_Reyes.png
└── ...
```

#### Filename Examples:

- **All Programs**: `EVSU_QR_Codes_All_Programs_2025-11-04.zip`
- **BSIT Program**: `EVSU_QR_Codes_BSIT_2025-11-04.zip`
- **BSCS Program**: `EVSU_QR_Codes_BSCS_2025-11-04.zip`

---

## Technical Implementation

### Individual Download (SVG to PNG Conversion)

```typescript
const handleDownload = () => {
  const svgElement = document.getElementById("qr-code-download") as SVGElement;

  // Create canvas for conversion
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // Serialize SVG
  const svgData = new XMLSerializer().serializeToString(svgElement);
  const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  // Load SVG as image
  const img = new Image();
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;

    // Draw white background
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw QR code
    ctx.drawImage(img, 0, 0);

    // Convert to PNG blob
    canvas.toBlob((blob) => {
      const pngUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = "EVSU_QR_{StudentID}_{Name}_{Date}.png";
      link.href = pngUrl;
      link.click();

      // Cleanup
      URL.revokeObjectURL(pngUrl);
      URL.revokeObjectURL(url);
    });
  };

  img.src = url;
};
```

### Bulk Download (ZIP Generation)

```typescript
const handleBulkQRDownload = async () => {
  // Filter students by selected program
  const studentsToDownload =
    selectedProgram === "all"
      ? allStudents
      : allStudents.filter((s) => s.program_id === selectedProgram);

  // Generate QR codes as data URLs
  const qrPromises = studentsToDownload.map(async (student) => {
    return new Promise((resolve) => {
      QRCode.toDataURL(
        student.qr_code,
        {
          errorCorrectionLevel: "H",
          margin: 2,
          width: 250,
        },
        (err, url) => {
          resolve({ student, dataUrl: url });
        }
      );
    });
  });

  const qrData = await Promise.all(qrPromises);

  // Create ZIP using JSZip
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  const folder = zip.folder(`EVSU_QR_Codes_{Program}_{Date}`);

  // Add each QR code to ZIP
  qrData.forEach(({ student, dataUrl }) => {
    const filename = `EVSU_QR_{StudentID}_{Name}.png`;
    const base64Data = dataUrl.split(",")[1];
    folder.file(filename, base64Data, { base64: true });
  });

  // Generate and download ZIP
  const content = await zip.generateAsync({ type: "blob" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(content);
  link.download = `EVSU_QR_Codes_{Program}_{Date}.zip`;
  link.click();
};
```

---

## File Naming Convention

### Individual QR Codes:

```
Format: EVSU_QR_{StudentID}_{FirstName}_{LastName}_{Date}.png

Components:
- EVSU: Institution identifier
- QR: File type identifier
- StudentID: Student's unique ID (e.g., 2025-001)
- FirstName_LastName: Student's name (sanitized, underscores)
- Date: ISO format date (YYYY-MM-DD)

Examples:
- EVSU_QR_2025-001_Juan_Dela_Cruz_2025-11-04.png
- EVSU_QR_2025-002_Maria_Santos_2025-11-04.png
```

### Bulk ZIP Files:

```
Format: EVSU_QR_Codes_{Program}_{Date}.zip

Components:
- EVSU_QR_Codes: File type identifier
- Program: Program abbreviation or "All_Programs"
- Date: ISO format date (YYYY-MM-DD)

Examples:
- EVSU_QR_Codes_BSIT_2025-11-04.zip
- EVSU_QR_Codes_BSCS_2025-11-04.zip
- EVSU_QR_Codes_All_Programs_2025-11-04.zip
```

---

## User Guide

### Downloading Individual QR Codes

**Method 1: QR Code Modal**

1. Go to Students page
2. Click QR icon on any student row
3. Click "Download QR Code" button
4. PNG file downloads automatically

**Method 2: View Student Modal**

1. Go to Students page
2. Click eye icon on any student row
3. Click "Download QR" button
4. PNG file downloads automatically

**Method 3: Print**

1. In View Student Modal
2. Click "Print" button
3. Print dialog opens with formatted QR code and student info

### Downloading Bulk QR Codes

**By Specific Program:**

1. Go to Students page
2. Select a program from the dropdown filter (e.g., "BSIT")
3. Click "Bulk QR" button in the toolbar
4. Wait for processing (toast notification appears)
5. ZIP file downloads automatically with all QR codes for that program

**All Programs:**

1. Go to Students page
2. Select "All Programs" from dropdown
3. Click "Bulk QR" button
4. Wait for processing
5. ZIP file downloads with all student QR codes

---

## Benefits

### Structured Naming

- **Searchable**: Easy to find specific student's QR code
- **Organized**: Clear identification of institution, student, and date
- **Professional**: Consistent naming across all downloads

### Bulk Download

- **Time-Saving**: Download all QR codes at once instead of individually
- **Program-Specific**: Filter by academic program for targeted downloads
- **Organized**: All QR codes packaged in a single ZIP file
- **Scalable**: Works efficiently with any number of students

### Use Cases

- **ID Card Printing**: Bulk download for entire program
- **Orientation**: Generate QR codes for all new students
- **Backup**: Archive QR codes by semester/program
- **Distribution**: Easy to share multiple QR codes with stakeholders

---

## Technical Requirements

### Dependencies Installed:

```json
{
  "jszip": "^3.10.1", // ZIP file generation
  "qrcode": "^1.5.3", // QR code generation
  "@types/qrcode": "^1.5.5" // TypeScript types
}
```

### Browser Compatibility:

- Modern browsers with Canvas API support
- Blob API for file downloads
- Works on Chrome, Firefox, Edge, Safari

---

## Troubleshooting

### Individual Download Not Working

**Issue**: QR code doesn't download
**Solution**:

1. Check browser console for errors
2. Ensure QR code element has loaded
3. Verify browser allows downloads

### Bulk Download Fails

**Issue**: ZIP doesn't generate or download
**Possible Causes**:

1. No students match selected filter
2. QR code generation failed for some students
3. Browser blocked download

**Solutions**:

1. Check that students exist for selected program
2. Review console logs for errors
3. Allow downloads in browser settings
4. Try with smaller number of students first

### Large Downloads

**Note**: Bulk downloads with many students (500+) may take 30-60 seconds

**Tips**:

- Be patient, toast notification shows progress
- Download by program instead of "All Programs" for faster processing
- Check browser's download folder for the ZIP file

---

## File Modifications

### Files Modified:

1. `src/components/admin/students/qr-code-modal.tsx`

   - Fixed SVG to PNG conversion
   - Added structured filename

2. `src/components/admin/students/view-student-modal.tsx`

   - Fixed SVG to PNG conversion
   - Added structured filename

3. `src/components/admin/students/students-toolbar.tsx`

   - Added "Bulk QR" button
   - Added program filter integration
   - Added student count display

4. `src/app/(dashboard)/admin/students/page.tsx`
   - Added `handleBulkQRDownload` function
   - Integrated bulk download with toolbar
   - Added toast notifications for user feedback

### Dependencies Added:

- `jszip` - ZIP file creation
- `qrcode` - QR code generation
- `@types/qrcode` - TypeScript support

---

## Future Enhancements

Potential improvements for future versions:

- [ ] Progress bar for bulk downloads
- [ ] Customize QR code size/quality
- [ ] Add student info text to QR code images
- [ ] PDF format option for printing
- [ ] Email QR codes directly to students
- [ ] Schedule automated QR code generation
- [ ] QR code template customization (colors, logos)
