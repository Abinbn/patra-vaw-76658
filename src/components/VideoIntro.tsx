import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Play } from 'lucide-react';

interface VideoIntroProps {
  onClose: () => void;
}

export const VideoIntro: React.FC<VideoIntroProps> = ({ onClose }) => {
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    setOpen(false);
    localStorage.setItem('patra_video_intro_seen', 'true');
    // Delay before calling onClose to allow tour to start after 2000ms
    setTimeout(() => onClose(), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="w-5 h-5 text-primary" />
            Welcome to Patra Editor!
          </DialogTitle>
          <DialogDescription>
            Watch this quick tutorial to get started with creating your digital card
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
            {/* Placeholder for actual video */}
            <div className="text-center p-6">
              <Play className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Getting Started with Patra</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Learn how to create your professional digital card in minutes
              </p>
              <ul className="text-left text-sm text-muted-foreground space-y-2 max-w-md mx-auto">
                <li className="flex items-start gap-2">
                  <span className="text-primary">1.</span>
                  <span>Upload your profile picture and set your unique URL</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">2.</span>
                  <span>Add your professional information and social links</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">3.</span>
                  <span>Customize your card design and preview in real-time</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">4.</span>
                  <span>Save and share your digital card with the world!</span>
                </li>
              </ul>
            </div>
            {/* You can replace this with an actual video embed */}
            {/* <iframe 
              width="100%" 
              height="100%" 
              src="https://www.youtube.com/embed/YOUR_VIDEO_ID" 
              title="Patra Introduction"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            /> */}
          </div>
          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={handleClose}>
              Skip Tutorial
            </Button>
            <Button onClick={handleClose}>
              Start Creating
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};