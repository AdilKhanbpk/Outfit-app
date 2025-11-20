import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PreviewArea({
  originalImage,
  generatedImage,
  onDownload,
}) {
  const hasImages = originalImage || generatedImage;

  if (!hasImages) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-6xl">👕</div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold font-heading text-foreground">
              Ready to Try On Outfits?
            </h3>
            <p className="text-sm text-muted-foreground">
              Upload your photo and select clothing items to see yourself in different outfits using AI-powered virtual try-on.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {originalImage && (
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold font-heading">
              Original
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center p-4">
            <img
              src={originalImage}
              alt="Original uploaded"
              className="max-w-full max-h-[600px] object-contain rounded-lg"
              data-testid="img-original-preview"
            />
          </CardContent>
        </Card>
      )}

      {generatedImage && (
        <Card className="flex flex-col">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-semibold font-heading">
              Try-On Result
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDownload}
              data-testid="button-download-result"
              className="h-8 w-8"
            >
              <Download className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center p-4">
            <img
              src={generatedImage}
              alt="AI generated try-on"
              className="max-w-full max-h-[600px] object-contain rounded-lg"
              data-testid="img-generated-preview"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
