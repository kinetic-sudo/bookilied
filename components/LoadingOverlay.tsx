'use client';

import { Loader2 } from 'lucide-react';

type LoadingOverlayProps = {
  open: boolean;
  title?: string;
  description?: string
};

const LoadingOverlay = ({
  open,
  title = 'Synthesizing Your Book',
  description='Please wait we process your PDF and prepare your interactive liteary experience'
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
          <h2 className="loading-title text-center">{title}</h2>
          <p className='text-sm'>{description}</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
