import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ImageUploadZone } from "@/components/ImageUploadZone";
import { ClothingSelector } from "@/components/ClothingSelector";
import { PreviewArea } from "@/components/PreviewArea";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, RotateCw, Trash2 } from "lucide-react";

export default function TryOnPage() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [clothing, setClothing] = useState({
    shirt: undefined,
    pants: undefined,
    shoes: undefined,
    coat: undefined,
    watch: undefined,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [originalImageResult, setOriginalImageResult] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedImage) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result);
      };
      reader.readAsDataURL(selectedImage);
    } else {
      setImagePreviewUrl(null);
    }
  }, [selectedImage]);

  const handleImageSelect = (file) => {
    setSelectedImage(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreviewUrl(null);
    setOriginalImageResult(null);
    setGeneratedImage(null);
  };

  const handleClothingChange = (category, value) => {
    setClothing((prev) => ({
      ...prev,
      [category]: value,
    }));
  };

  const hasSelectedClothing = () => {
    return Object.values(clothing).some((item) => item !== undefined);
  };

  const handleGenerate = async () => {
    if (!selectedImage) {
      toast({
        title: "No image selected",
        description: "Please upload a photo before generating.",
        variant: "destructive",
      });
      return;
    }

    if (!hasSelectedClothing()) {
      toast({
        title: "No clothing selected",
        description: "Please select at least one clothing item.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const formData = new FormData();
      formData.append("image", selectedImage);
      
      // Only include selected clothing items
      const selectedClothing = {};
      Object.entries(clothing).forEach(([key, value]) => {
        if (value) {
          selectedClothing[key] = value;
        }
      });
      
      formData.append("clothing", JSON.stringify(selectedClothing));

      // Use fetch directly for FormData uploads (apiRequest doesn't support multipart/form-data)
      const fetchResponse = await fetch("/api/tryon", {
        method: "POST",
        body: formData,
        // Don't set Content-Type header - browser will set it with boundary for multipart/form-data
      });

      if (!fetchResponse.ok) {
        const errorData = await fetchResponse.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(errorData.error || `Request failed with status ${fetchResponse.status}`);
      }

      const response = await fetchResponse.json();

      if (response.success) {
        setOriginalImageResult(response.originalImage);
        setGeneratedImage(response.generatedImage);
        toast({
          title: "Success!",
          description: "Your outfit preview has been generated.",
        });
      } else {
        throw new Error(response.error || "Failed to generate outfit");
      }
    } catch (error) {
      console.error("Generation error:", error);
      toast({
        title: "Generation failed",
        description: error.message || "An error occurred while generating your outfit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  const handleClear = () => {
    setClothing({
      shirt: undefined,
      pants: undefined,
      shoes: undefined,
      coat: undefined,
      watch: undefined,
    });
    setOriginalImageResult(null);
    setGeneratedImage(null);
  };

  const handleDownload = () => {
    if (!generatedImage) return;

    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = `virtual-tryon-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Downloaded!",
      description: "Your generated outfit image has been saved.",
    });
  };

  const canGenerate = selectedImage && hasSelectedClothing() && !isGenerating;

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-background">
      {/* Left Panel - Upload & Controls */}
      <div className="w-full lg:w-80 border-r border-border p-6 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold font-heading text-foreground mb-2">
              Virtual Try-On
            </h1>
            <p className="text-sm text-muted-foreground">
              Upload your photo and select clothing to preview
            </p>
          </div>

          <ImageUploadZone
            onImageSelect={handleImageSelect}
            selectedImage={selectedImage}
            onRemove={handleRemoveImage}
            previewUrl={imagePreviewUrl}
          />

          <div>
            <Button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="w-full h-12"
              data-testid="button-generate"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Outfit Preview
            </Button>
          </div>

          {generatedImage && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleRegenerate}
                disabled={isGenerating}
                className="flex-1"
                data-testid="button-regenerate"
              >
                <RotateCw className="mr-2 h-4 w-4" />
                Re-generate
              </Button>
              <Button
                variant="outline"
                onClick={handleClear}
                disabled={isGenerating}
                data-testid="button-clear"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Center Panel - Preview */}
      <div className="flex-1 p-8 overflow-y-auto relative">
        <LoadingOverlay
          isVisible={isGenerating}
          message="AI is generating your outfit..."
        />
        <PreviewArea
          originalImage={originalImageResult || imagePreviewUrl}
          generatedImage={generatedImage}
          onDownload={handleDownload}
        />
      </div>

      {/* Right Panel - Clothing Selection */}
      <div className="w-full lg:w-72 border-l border-border p-6 overflow-y-auto">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold font-heading text-foreground mb-1">
              Select Outfit
            </h2>
            <p className="text-sm text-muted-foreground">
              Choose items and colors
            </p>
          </div>

          <ClothingSelector
            category="shirt"
            value={clothing.shirt}
            onChange={(value) => handleClothingChange("shirt", value)}
            disabled={isGenerating}
          />

          <ClothingSelector
            category="pants"
            value={clothing.pants}
            onChange={(value) => handleClothingChange("pants", value)}
            disabled={isGenerating}
          />

          <ClothingSelector
            category="shoes"
            value={clothing.shoes}
            onChange={(value) => handleClothingChange("shoes", value)}
            disabled={isGenerating}
          />

          <ClothingSelector
            category="coat"
            value={clothing.coat}
            onChange={(value) => handleClothingChange("coat", value)}
            disabled={isGenerating}
          />

          <ClothingSelector
            category="watch"
            value={clothing.watch}
            onChange={(value) => handleClothingChange("watch", value)}
            disabled={isGenerating}
          />
        </div>
      </div>
    </div>
  );
}
