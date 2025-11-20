import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function ImageUploadZone({
  onImageSelect,
  selectedImage,
  onRemove,
  previewUrl,
}) {
  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        
        // Validate file size (8MB max)
        if (file.size > 8 * 1024 * 1024) {
          alert("File size must be less than 8MB");
          return;
        }
        
        // Validate file type
        if (!file.type.startsWith("image/")) {
          alert("Please upload a valid image file");
          return;
        }
        
        onImageSelect(file);
      }
    },
    [onImageSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    multiple: false,
    maxSize: 8 * 1024 * 1024,
  });

  if (selectedImage && previewUrl) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">Uploaded Image</p>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            data-testid="button-remove-image"
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Card className="overflow-hidden">
          <img
            src={previewUrl}
            alt="Uploaded preview"
            className="w-full h-auto max-h-[400px] object-contain"
            data-testid="img-uploaded-preview"
          />
        </Card>
        <p className="text-xs text-muted-foreground text-center">
          {selectedImage.name} ({(selectedImage.size / 1024).toFixed(1)} KB)
        </p>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-8 transition-all cursor-pointer
        hover-elevate active-elevate-2
        ${
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-border bg-card/50"
        }
      `}
      data-testid="dropzone-upload"
    >
      <input {...getInputProps()} data-testid="input-file-upload" />
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="p-4 rounded-full bg-primary/10">
          <Upload className="h-12 w-12 text-primary" />
        </div>
        <div className="space-y-2">
          <p className="text-base font-semibold text-foreground">
            {isDragActive ? "Drop your image here" : "Upload Your Photo"}
          </p>
          <p className="text-sm text-muted-foreground">
            Drag & drop or click to browse
          </p>
          <p className="text-xs text-muted-foreground">
            PNG, JPG, WEBP up to 8MB
          </p>
        </div>
      </div>
    </div>
  );
}
