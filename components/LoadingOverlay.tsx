'use client';

import { Loader2 } from 'lucide-react';

type LoadingOverlayProps = {
  open: boolean;
  title?: string;
};

const LoadingOverlay = ({
  open,
  title = 'Working on your book…',
}: LoadingOverlayProps) => {
  if (!open) {
    return null;
  }

  return (
    <div
      className="loading-wrapper"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="loading-shadow-wrapper bg-white shadow-soft">
        <div className="loading-shadow">
          <Loader2
            className="loading-animation size-10 text-[#663820]"
            aria-hidden
          />
          <p className="loading-title text-center">{title}</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
