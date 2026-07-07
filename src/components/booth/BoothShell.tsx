import React, { useState, useEffect } from 'react';
import { BoothStep, CapturedPhoto, PhotoTransform, FooterCustomization } from '../../types/booth';
import { FrameLayout } from '../../types/frames';
import { PreviewStep } from './PreviewStep';
import { CaptureStep } from './CaptureStep';
import { SelectStep } from './SelectStep';
import { EditorStep } from './EditorStep';
import { ResultStep } from './ResultStep';
import { SiteHeader } from '../layout/SiteHeader';
import { useKiosk } from '../../context/KioskContext';
import { IdleWarningModal } from './IdleWarningModal';

type BoothShellProps = {
  onExitBooth: () => void;
};

export const BoothShell: React.FC<BoothShellProps> = ({ onExitBooth }) => {
  const [step, setStep] = useState<BoothStep>('preview');
  
  const { kioskActive, timeoutDuration } = useKiosk();
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [warningCountdown, setWarningCountdown] = useState(5);

  // State buffers
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);
  
  // Customization styling state
  const [layout, setLayout] = useState<FrameLayout>('strip-4');
  const [frameId, setFrameId] = useState<string>('white');
  const [filterId, setFilterId] = useState<string>('original');
  const [photoTransforms, setPhotoTransforms] = useState<Record<string, PhotoTransform>>({});
  const [footer, setFooter] = useState<FooterCustomization>({
    text: 'LUNAGI STUDIOS',
    fontFamily: 'Inter',
    color: '',
    alignment: 'center',
    showDate: false,
  });

  // Capture callback
  const handleCaptureComplete = (photos: CapturedPhoto[]) => {
    setCapturedPhotos(photos);
    setStep('select');
  };

  // Selection handlers
  const handleSelectPhoto = (photoId: string) => {
    setSelectedPhotoIds((prev) => [...prev, photoId]);
  };

  const handleDeselectPhoto = (photoId: string) => {
    setSelectedPhotoIds((prev) => prev.filter((id) => id !== photoId));
  };

  // Single reset-session helper/function used by Retake Session and Start Again
  const resetSession = () => {
    setCapturedPhotos([]);
    setSelectedPhotoIds([]);
    setLayout('strip-4');
    setFrameId('white');
    setFilterId('original');
    setPhotoTransforms({});
    setFooter({
      text: 'LUNAGI STUDIOS',
      fontFamily: 'Inter',
      color: '',
      alignment: 'center',
      showDate: false,
    });
    setStep('preview');
  };

  useEffect(() => {
    if (!kioskActive || timeoutDuration <= 0 || (step !== 'select' && step !== 'result')) {
      setIsWarningOpen(false);
      return;
    }

    let timeoutTimer: any;
    let countdownInterval: any;
    
    const warningThresholdMs = Math.max((timeoutDuration - 5) * 1000, 0);

    const resetIdleTimer = () => {
      setIsWarningOpen(false);
      clearTimeout(timeoutTimer);
      clearInterval(countdownInterval);

      timeoutTimer = setTimeout(() => {
        setIsWarningOpen(true);
        setWarningCountdown(5);

        let count = 5;
        countdownInterval = setInterval(() => {
          count -= 1;
          setWarningCountdown(count);
          if (count <= 0) {
            clearInterval(countdownInterval);
            setIsWarningOpen(false);
            resetSession();
          }
        }, 1000);

      }, warningThresholdMs);
    };

    const handleResetEvent = () => {
      resetIdleTimer();
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach((event) => {
      window.addEventListener(event, resetIdleTimer);
    });
    window.addEventListener('reset-idle-timeout', handleResetEvent);

    resetIdleTimer();

    return () => {
      clearTimeout(timeoutTimer);
      clearInterval(countdownInterval);
      events.forEach((event) => {
        window.removeEventListener(event, resetIdleTimer);
      });
      window.removeEventListener('reset-idle-timeout', handleResetEvent);
    };
  }, [kioskActive, timeoutDuration, step]);

  const handleKeepPlaying = () => {
    window.dispatchEvent(new Event('reset-idle-timeout'));
  };

  // Back button controls based on active step
  const handleHeaderBack = () => {
    if (step === 'preview') {
      onExitBooth();
    } else if (step === 'select') {
      resetSession();
    } else if (step === 'editor') {
      setStep('select');
    } else if (step === 'result') {
      setStep('editor');
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 'preview':
        return (
          <PreviewStep
            onStartSession={() => setStep('capture')}
          />
        );
      case 'capture':
        return (
          <CaptureStep
            onCaptureComplete={handleCaptureComplete}
            onExit={onExitBooth}
          />
        );
      case 'select':
        return (
          <SelectStep
            photos={capturedPhotos}
            selectedPhotoIds={selectedPhotoIds}
            onSelectPhoto={handleSelectPhoto}
            onDeselectPhoto={handleDeselectPhoto}
            onContinue={() => setStep('editor')}
            onRetake={resetSession}
          />
        );
      case 'editor':
        // Retrieve selected photos in exact selected order
        const orderedSelectedPhotos = selectedPhotoIds
          .map((id) => capturedPhotos.find((p) => p.id === id))
          .filter((p): p is CapturedPhoto => !!p);

        return (
          <EditorStep
            selectedPhotos={orderedSelectedPhotos}
            layout={layout}
            frameId={frameId}
            filterId={filterId}
            photoTransforms={photoTransforms}
            footer={footer}
            onChangeLayout={setLayout}
            onChangeFrame={setFrameId}
            onChangeFilter={setFilterId}
            onChangeTransform={(photoId, transform) => {
              setPhotoTransforms((prev) => ({ ...prev, [photoId]: transform }));
            }}
            onChangeFooter={setFooter}
            onDone={() => setStep('result')}
          />
        );
      case 'result':
        const finalSelectedPhotos = selectedPhotoIds
          .map((id) => capturedPhotos.find((p) => p.id === id))
          .filter((p): p is CapturedPhoto => !!p);

        return (
          <ResultStep
            selectedPhotos={finalSelectedPhotos}
            layout={layout}
            frameId={frameId}
            filterId={filterId}
            photoTransforms={photoTransforms}
            footer={footer}
            onRestart={resetSession}
          />
        );
      default:
        return null;
    }
  };

  // Capture step suppresses the standard SiteHeader layout to ensure fullscreen camera feed immersion
  const showHeader = step !== 'capture';

  // Customize header title / actions
  const getHeaderBackText = () => {
    if (step === 'preview') return 'Back to Home';
    if (step === 'select') return 'Retake';
    if (step === 'editor') return 'Selection';
    if (step === 'result') return 'Editor';
    return 'Back';
  };

  return (
    <div className="flex-grow flex flex-col w-full bg-surface">
      {showHeader && (
        <SiteHeader
          onBack={handleHeaderBack}
          backText={getHeaderBackText()}
          showNav={false}
          actionText={step !== 'result' ? 'Exit Booth' : 'Exit'}
          onAction={onExitBooth}
        />
      )}
      
      <main className="flex-grow flex flex-col items-center justify-center p-margin-mobile md:p-margin-desktop w-full max-w-container-max mx-auto pb-12">
        {renderStepContent()}
      </main>

      <IdleWarningModal
        isOpen={isWarningOpen}
        secondsRemaining={warningCountdown}
        onKeepPlaying={handleKeepPlaying}
      />
    </div>
  );
};
