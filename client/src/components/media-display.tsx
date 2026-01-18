import { useState } from "react";
import { Play } from "lucide-react";

interface MediaDisplayProps {
  src: string;
  alt: string;
  className?: string;
  showPlayButton?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  controls?: boolean;
  fallbackSrc?: string;
  hoverToPlay?: boolean;
}

// Utility function to determine if a URL is a video
const isVideoUrl = (url: string): boolean => {
  // Check for common video file extensions
  const videoExtensions = ['.mp4', '.mov', '.avi', '.webm', '.ogg', '.m4v'];
  const lowerUrl = url.toLowerCase();
  
  // Check file extension
  if (videoExtensions.some(ext => lowerUrl.includes(ext))) {
    return true;
  }
  
  // Check if it's a Cloudinary video URL
  if (url.includes('cloudinary.com') && url.includes('/video/')) {
    return true;
  }
  
  return false;
};

export default function MediaDisplay({ 
  src, 
  alt, 
  className = "", 
  showPlayButton = false,
  autoPlay = false,
  muted = true,
  controls = true,
  fallbackSrc,
  hoverToPlay = false
}: MediaDisplayProps) {
  const [imageError, setImageError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const isVideo = isVideoUrl(src);
  const finalSrc = imageError && fallbackSrc ? fallbackSrc : src;

  const handleVideoPlay = () => {
    setIsPlaying(true);
  };

  const handleVideoPause = () => {
    setIsPlaying(false);
  };

  if (isVideo) {
    const shouldAutoPlay = autoPlay || (hoverToPlay && isHovered);
    
    return (
      <div 
        className={`relative ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <video
          src={finalSrc}
          className="w-full h-full object-cover"
          autoPlay={shouldAutoPlay}
          muted={muted}
          controls={controls && !hoverToPlay}
          loop
          playsInline
          onPlay={handleVideoPlay}
          onPause={handleVideoPause}
          onError={() => setImageError(true)}
        >
          Your browser does not support the video tag.
        </video>
        
        {showPlayButton && !isPlaying && !shouldAutoPlay && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="bg-white/90 rounded-full p-4 shadow-lg">
              <Play className="h-8 w-8 text-gray-800 ml-1" fill="currentColor" />
            </div>
          </div>
        )}

        {hoverToPlay && !isHovered && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
            <div className="bg-white/80 rounded-full p-3 shadow-lg">
              <Play className="h-6 w-6 text-gray-800 ml-1" fill="currentColor" />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <img
      src={finalSrc}
      alt={alt}
      className={className}
      onError={() => setImageError(true)}
    />
  );
}