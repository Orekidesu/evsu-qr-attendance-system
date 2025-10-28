import { CheckCircle2 } from "lucide-react";

export function LoginHero() {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary to-primary/80 flex-col justify-between p-12 text-primary-foreground">
      {/* Logo/Brand */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-primary-foreground rounded-lg flex items-center justify-center">
            <span className="text-primary font-bold text-lg">QR</span>
          </div>
          <span className="text-xl font-semibold">EVSU Attendance</span>
        </div>
      </div>

      {/* Main content */}
      <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold leading-tight text-balance">
            Quick and Easy Attendance Tracking
          </h1>
          <p className="text-lg text-primary-foreground/80 leading-relaxed">
            Streamline your attendance management with our QR-based system.
            Fast, secure, and reliable attendance tracking for EVSU.
          </p>
        </div>

        {/* Features */}
        <div className="space-y-4 pt-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="font-medium">Instant QR Scanning</p>
              <p className="text-sm text-primary-foreground/70">
                Mark attendance in seconds
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="font-medium">Secure Access</p>
              <p className="text-sm text-primary-foreground/70">
                Protected with enterprise security
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="font-medium">Real-time Reports</p>
              <p className="text-sm text-primary-foreground/70">
                Track attendance data instantly
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-sm text-primary-foreground/60">
        <p>© 2025 EVSU QR Attendance System. All rights reserved.</p>
      </div>
    </div>
  );
}
