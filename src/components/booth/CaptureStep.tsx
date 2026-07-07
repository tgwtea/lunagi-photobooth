import React, { useState, useEffect, useRef } from 'react';
import { CapturedPhoto } from '../../types/booth';
import { Button } from '../ui/Button';

type CaptureStepProps = {
  onCaptureComplete: (photos: CapturedPhoto[]) => void;
  onExit: () => void;
};

export const CaptureStep: React.FC<CaptureStepProps> = ({
  onCaptureComplete,
  onExit,
}) => {
  const [photoIndex, setPhotoIndex] = useState(0); // 0 to 7
  const [isFlashActive, setIsFlashActive] = useState(false);
  const [capturedBuffer, setCapturedBuffer] = useState<CapturedPhoto[]>([]);
  const [permissionStatus, setPermissionStatus] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);
  const [phase, setPhase] = useState<'countdown' | 'review'>('countdown');
  const [reviewPhoto, setReviewPhoto] = useState<CapturedPhoto | null>(null);
  const [reviewCountdown, setReviewCountdown] = useState(3);

  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const totalPhotos = 8;

  // Initialize webcam access
  const initWebcam = async () => {
    try {
      setPermissionStatus('pending');
      setErrorMsg(null);
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          aspectRatio: 4/3,
          width: { ideal: 1280 },
          height: { ideal: 960 }
        },
        audio: false
      });
      
      streamRef.current = mediaStream;
      setPermissionStatus('granted');
    } catch (err) {
      console.error('Webcam access error:', err);
      setPermissionStatus('denied');
      setErrorMsg(err instanceof Error ? err.message : 'Unknown camera error');
    }
  };

  useEffect(() => {
    initWebcam();
    
    return () => {
      // Cleanup tracks on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Bind stream to video element when ready
  useEffect(() => {
    if (permissionStatus === 'granted' && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [permissionStatus]);

  // Web Audio retro synth shutter sound generator
  const playShutterSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.15);
      
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      console.warn('AudioContext not allowed or not supported', e);
    }
  };

  const playCountdownBeep = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1040, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    } catch (e) {
      console.warn('AudioContext not allowed or not supported', e);
    }
  };

  // Capture frame helper
  const captureFrame = () => {
    const video = videoRef.current;
    if (!video) return;

    // 1. Play feedback
    playShutterSound();
    setIsFlashActive(true);
    setTimeout(() => setIsFlashActive(false), 150);

    // 2. Render to offscreen canvas
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 960;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Horizontally mirror the image context to match live preview
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    const newPhoto: CapturedPhoto = {
      id: `captured-photo-${photoIndex}-${Date.now()}`,
      src: dataUrl,
      capturedAt: Date.now(),
      crop: {
        x: 0,
        y: 0,
        width: canvas.width,
        height: canvas.height,
        aspectRatio: '3:4', // satisfies strict type
      },
    };

    setCapturedBuffer((prev) => [...prev, newPhoto]);
    setReviewPhoto(newPhoto);
    setReviewCountdown(3);
    setPhase('review');
  };

  // Countdown timer logic
  useEffect(() => {
    if (permissionStatus !== 'granted') return;
    if (photoIndex >= totalPhotos) return;
    if (phase !== 'countdown') return;

    const initialDuration = 5;
    setCountdown(initialDuration);

    let timer: any;
    
    // Give user a 1s ready warm-up only on the very first photo
    const warmUpDelay = photoIndex === 0 ? 1000 : 0;
    
    const startTimer = () => {
      let currentVal = initialDuration;
      timer = setInterval(() => {
        currentVal -= 1;
        if (currentVal <= 0) {
          clearInterval(timer);
          setCountdown(0);
          captureFrame();
        } else {
          if (currentVal <= 3) {
            playCountdownBeep();
          }
          setCountdown(currentVal);
        }
      }, 1000);
    };

    const warmUpTimeout = setTimeout(startTimer, warmUpDelay);

    return () => {
      clearTimeout(warmUpTimeout);
      if (timer) clearInterval(timer);
    };
  }, [permissionStatus, photoIndex, phase]);

  const continueAfterReview = () => {
    if (phase !== 'review') return;
    if (capturedBuffer.length >= totalPhotos) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      onCaptureComplete(capturedBuffer);
      return;
    }
    setPhotoIndex((prevIdx) => prevIdx + 1);
    setReviewPhoto(null);
    setPhase('countdown');
  };

  useEffect(() => {
    if (phase !== 'review') return;
    setReviewCountdown(3);
    let currentVal = 3;
    const timer = setInterval(() => {
      currentVal -= 1;
      setReviewCountdown(currentVal);
      if (currentVal <= 0) {
        clearInterval(timer);
        continueAfterReview();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, capturedBuffer]);

  // Render requesting permission state
  if (permissionStatus === 'pending') {
    return (
      <div className="w-full max-w-xl mx-auto p-8 bg-neutral-950 text-white rounded-2xl border border-white/5 shadow-2xl flex flex-col items-center justify-center text-center space-y-6 min-h-[450px]">
        <div className="w-12 h-12 rounded-full border-2 border-white/10 border-t-white animate-spin"></div>
        <div className="space-y-1">
          <p className="font-sans text-sm tracking-wide text-neutral-300">Requesting camera access...</p>
          <p className="font-sans text-xs text-neutral-500">Please click allow in your browser prompt.</p>
        </div>
      </div>
    );
  }

  // Render camera permission denied/error state
  if (permissionStatus === 'denied') {
    return (
      <div className="w-full max-w-xl mx-auto p-8 bg-neutral-950 text-white rounded-2xl border border-white/5 shadow-2xl flex flex-col items-center justify-center text-center space-y-6 min-h-[450px]">
        <div className="w-16 h-16 rounded-full bg-[#ffdad6] flex items-center justify-center text-[#93000a]">
          <span className="material-symbols-outlined text-[32px]">videocam_off</span>
        </div>
        <div className="space-y-2">
          <h2 className="font-sans text-2xl font-semibold tracking-tight">Camera Access Required</h2>
          <p className="font-sans text-sm text-neutral-400 max-w-sm mx-auto leading-relaxed">
            Lunagi Studios needs permission to use your webcam. Please allow access in your browser settings and try again.
          </p>
          {errorMsg && (
            <p className="font-mono text-[10px] text-red-400 bg-red-950/40 border border-red-900/20 px-3 py-1.5 rounded mt-2 max-w-xs mx-auto overflow-x-auto">
              Error: {errorMsg}
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto pt-2">
          <Button
            onClick={initWebcam}
            variant="primary"
            className="bg-white text-black hover:bg-neutral-100 text-xs px-8 py-3.5 tracking-wider uppercase font-semibold w-full sm:w-auto"
          >
            Try Again
            <span className="material-symbols-outlined text-sm">refresh</span>
          </Button>
          <Button
            onClick={onExit}
            variant="secondary"
            className="border border-white/20 text-white hover:bg-white/5 text-xs px-8 py-3.5 tracking-wider uppercase font-semibold w-full sm:w-auto"
          >
            Exit Booth
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[500px] relative flex flex-col justify-between bg-neutral-950 text-white rounded-2xl overflow-hidden shadow-2xl border border-white/5">
      
      {/* Absolute Header Overlay */}
      <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20 bg-gradient-to-b from-black/85 to-transparent pointer-events-auto">
        <div className="font-sans font-medium text-sm tracking-[0.15em] text-white/90">
          LUNAGI STUDIOS
        </div>
        <button
          onClick={onExit}
          className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full border border-white/10 hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-lg leading-none">close</span>
        </button>
      </header>

      {/* Camera Feed Area */}
      <div className="flex-grow w-full relative bg-neutral-900 overflow-hidden flex items-center justify-center">
        {/* Live Camera Video element (mirrored) */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover select-none pointer-events-none transition-opacity duration-300 transform scale-x-[-1]"
        />

        {/* Framing Hairlines Crop Guides */}
        <div className="absolute inset-4 md:inset-8 border border-white/15 rounded-xl pointer-events-none flex flex-col justify-between p-6">
          <div className="flex justify-between w-full">
            <div className="w-8 h-8 border-t-2 border-l-2 border-white/45 rounded-tl-lg"></div>
            <div className="w-8 h-8 border-t-2 border-r-2 border-white/45 rounded-tr-lg"></div>
          </div>
          <div className="flex justify-between w-full mt-auto">
            <div className="w-8 h-8 border-b-2 border-l-2 border-white/45 rounded-bl-lg"></div>
            <div className="w-8 h-8 border-b-2 border-r-2 border-white/45 rounded-br-lg"></div>
          </div>
        </div>

        {phase === 'countdown' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/25 backdrop-blur-[0.5px] pointer-events-none">
            <div className="font-sans text-[96px] md:text-[120px] leading-none font-bold tracking-tighter text-white/95 drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)] animate-pulse">
              {countdown}
            </div>

            <div className="mt-8 bg-black/45 backdrop-blur-md px-6 py-2.5 rounded-full border border-white/15 shadow-sm">
              <span className="font-sans text-xs font-semibold text-white uppercase tracking-widest">
                Photo {photoIndex + 1} of {totalPhotos}
              </span>
            </div>
          </div>
        )}

        {phase === 'review' && reviewPhoto && (
          <button
            type="button"
            onClick={continueAfterReview}
            aria-label={`Photo captured. Tap anywhere to continue. Continuing automatically in ${reviewCountdown} ${
              reviewCountdown === 1 ? 'second' : 'seconds'
            }.`}
            className="absolute inset-0 z-30 bg-black/45 flex items-center justify-center p-4 sm:p-6 focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-white/80"
          >
            <img
              src={reviewPhoto.src}
              alt="Captured review"
              className="max-h-[76%] max-w-[86%] rounded-xl border border-white/25 shadow-2xl object-contain"
            />
            <div className="absolute bottom-8 md:bottom-10 left-1/2 -translate-x-1/2 flex w-[calc(100%-2rem)] max-w-lg items-center justify-center gap-3 bg-white/95 text-neutral-950 backdrop-blur-md px-6 py-3.5 md:px-8 md:py-4 rounded-full border border-white/70 shadow-[0_18px_45px_rgba(0,0,0,0.45)] font-sans text-sm md:text-base font-bold uppercase tracking-[0.08em] text-center leading-tight">
              <span className="min-w-0">Tap anywhere to continue</span>
              <span
                aria-hidden="true"
                className="flex h-8 w-8 md:h-9 md:w-9 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-white text-sm md:text-base font-bold leading-none"
              >
                {reviewCountdown}
              </span>
            </div>
          </button>
        )}

        {/* Camera Flash Screen Overlay */}
        <div
          className={`absolute inset-0 bg-white z-40 transition-opacity duration-75 pointer-events-none ${
            isFlashActive ? 'opacity-100' : 'opacity-0'
          }`}
        ></div>

        {/* Thumbnail Preview Strip */}
        {capturedBuffer.length > 0 && phase === 'countdown' && (
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2.5 px-6 z-30 overflow-x-auto pointer-events-none select-none">
            {capturedBuffer.map((photo, index) => (
              <div
                key={photo.id}
                className="w-10 h-14 rounded border border-white/45 shadow-lg overflow-hidden shrink-0 rotate-1 transition-transform animate-fade-in"
              >
                <img
                  src={photo.src}
                  alt={`Captured ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
