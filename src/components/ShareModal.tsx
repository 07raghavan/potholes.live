import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Share2 } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  potholeCount: number;
  locationName: string;
  onShare: () => void;
  shareMessage: string;
}

export default function ShareModal({
  isOpen,
  onClose,
  imageUrl,
  potholeCount,
  locationName,
  onShare,
  shareMessage
}: ShareModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Share Your Map</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="rounded-lg overflow-hidden border-2 border-border bg-secondary/30 flex items-center justify-center min-h-[200px]">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt="Pothole detection session results" 
                className="w-full h-auto"
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 py-10">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground font-medium">Preparing your share image...</p>
              </div>
            )}
          </div>
          
          <div className="space-y-3 text-center">
            <p className="text-lg font-semibold">
              Mapped <span className="text-destructive font-bold">{potholeCount}</span> pothole{potholeCount === 1 ? '' : 's'} around {locationName} with <span className="font-bold">potholes.live</span>.
            </p>

            <div className="space-y-2">
              <p className="text-sm font-semibold">Share message preview</p>
              <div className="rounded-md border border-border/70 bg-muted/40 px-3 py-2 text-left text-sm font-mono whitespace-pre-wrap">
                {shareMessage}
              </div>
              <p className="text-xs text-muted-foreground">Includes https://potholes.live and campaign hashtags.</p>
            </div>
          </div>
          
          <Button 
            onClick={onShare}
            className="w-full text-lg font-bold"
            size="lg"
          >
            <Share2 className="w-5 h-5 mr-2" />
            Share Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
