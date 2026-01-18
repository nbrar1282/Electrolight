import { cn } from "@/lib/utils";

interface ElectricalLoadingProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "spark" | "circuit" | "current" | "bolt";
  text?: string;
}

export function ElectricalLoading({ 
  className, 
  size = "md", 
  variant = "spark",
  text = "Loading..."
}: ElectricalLoadingProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16"
  };

  if (variant === "spark") {
    return (
      <div className={cn("flex flex-col items-center gap-3", className)}>
        <div className={cn("relative", sizeClasses[size])}>
          {/* Main spark effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 animate-pulse">
            <div className="absolute inset-1 bg-background rounded-full"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 animate-spin">
              {/* Spark lines */}
              <div className="absolute top-0 left-1/2 w-0.5 h-2 bg-yellow-400 transform -translate-x-1/2 rounded-full"></div>
              <div className="absolute bottom-0 left-1/2 w-0.5 h-2 bg-orange-500 transform -translate-x-1/2 rounded-full"></div>
              <div className="absolute left-0 top-1/2 w-2 h-0.5 bg-red-500 transform -translate-y-1/2 rounded-full"></div>
              <div className="absolute right-0 top-1/2 w-2 h-0.5 bg-yellow-400 transform -translate-y-1/2 rounded-full"></div>
            </div>
          </div>
          {/* Inner glow */}
          <div className="absolute inset-2 rounded-full bg-yellow-400/30 animate-pulse"></div>
        </div>
        {text && (
          <p className="text-sm text-muted-foreground animate-pulse font-medium">{text}</p>
        )}
      </div>
    );
  }

  if (variant === "circuit") {
    return (
      <div className={cn("flex flex-col items-center gap-3", className)}>
        <div className={cn("relative", sizeClasses[size])}>
          {/* Circuit board pattern */}
          <svg viewBox="0 0 50 50" className="w-full h-full animate-pulse">
            <defs>
              <linearGradient id="circuit-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
            {/* Circuit paths */}
            <path 
              d="M10,25 L20,25 L20,15 L30,15 L30,25 L40,25" 
              stroke="url(#circuit-gradient)" 
              strokeWidth="2" 
              fill="none"
              className="animate-pulse"
            />
            <path 
              d="M25,10 L25,20 L35,20 L35,30 L25,30 L25,40" 
              stroke="url(#circuit-gradient)" 
              strokeWidth="2" 
              fill="none"
              className="animate-pulse"
              style={{ animationDelay: "0.5s" }}
            />
            {/* Connection points */}
            <circle cx="20" cy="25" r="2" fill="#3b82f6" className="animate-pulse" />
            <circle cx="30" cy="15" r="2" fill="#06b6d4" className="animate-pulse" style={{ animationDelay: "0.3s" }} />
            <circle cx="25" cy="30" r="2" fill="#10b981" className="animate-pulse" style={{ animationDelay: "0.6s" }} />
          </svg>
        </div>
        {text && (
          <p className="text-sm text-muted-foreground animate-pulse font-medium">{text}</p>
        )}
      </div>
    );
  }

  if (variant === "current") {
    return (
      <div className={cn("flex flex-col items-center gap-3", className)}>
        <div className={cn("relative flex items-center", sizeClasses[size])}>
          {/* Current flow animation */}
          <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-bounce"></div>
            </div>
          </div>
          {/* Voltage indicators */}
          <div className="absolute -left-2 top-1/2 transform -translate-y-1/2">
            <div className="w-1 h-1 bg-green-500 rounded-full animate-ping"></div>
          </div>
          <div className="absolute -right-2 top-1/2 transform -translate-y-1/2">
            <div className="w-1 h-1 bg-red-500 rounded-full animate-ping" style={{ animationDelay: "0.5s" }}></div>
          </div>
        </div>
        {text && (
          <p className="text-sm text-muted-foreground animate-pulse font-medium">{text}</p>
        )}
      </div>
    );
  }

  if (variant === "bolt") {
    return (
      <div className={cn("flex flex-col items-center gap-3", className)}>
        <div className={cn("relative", sizeClasses[size])}>
          {/* Lightning bolt */}
          <svg viewBox="0 0 24 24" className="w-full h-full text-yellow-500 animate-bounce">
            <path 
              d="M13 1L6 12h5l-1 10 7-11h-5l1-10z" 
              fill="currentColor"
              className="drop-shadow-lg"
            />
            <path 
              d="M13 1L6 12h5l-1 10 7-11h-5l1-10z" 
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="animate-pulse"
            />
          </svg>
          {/* Electrical glow effect */}
          <div className="absolute inset-0 bg-yellow-400/20 rounded-lg animate-ping"></div>
        </div>
        {text && (
          <p className="text-sm text-muted-foreground animate-pulse font-medium">{text}</p>
        )}
      </div>
    );
  }

  return null;
}

// Skeleton component with electrical theming
export function ElectricalSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse", className)}>
      <div className="bg-gradient-to-r from-muted via-muted/50 to-muted rounded-md h-4 mb-2"></div>
      <div className="bg-gradient-to-r from-muted/80 via-muted/30 to-muted/80 rounded-md h-4 mb-2"></div>
      <div className="bg-gradient-to-r from-muted via-muted/50 to-muted rounded-md h-4 w-3/4"></div>
    </div>
  );
}

// Full page loading component
export function ElectricalPageLoading() {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card border rounded-lg p-8 shadow-lg">
        <ElectricalLoading 
          size="lg" 
          variant="spark" 
          text="Powering up ElectroLight..."
          className="mb-4"
        />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
          <span>Systems online</span>
        </div>
      </div>
    </div>
  );
}