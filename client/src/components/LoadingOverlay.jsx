import { ClipLoader } from "react-spinners";

export function LoadingOverlay({ isVisible, message }) {
  if (!isVisible) return null;

  return (
    <div
      className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg"
      data-testid="overlay-loading"
    >
      <div className="flex flex-col items-center space-y-4">
        <ClipLoader size={48} color="hsl(var(--primary))" />
        <div className="text-center space-y-2">
          <p className="text-base font-semibold text-foreground" data-testid="text-loading-message">
            {message || "Processing..."}
          </p>
          <p className="text-sm text-muted-foreground max-w-xs">
            AI is generating your outfit preview. This may take 10-30 seconds.
          </p>
        </div>
      </div>
    </div>
  );
}
