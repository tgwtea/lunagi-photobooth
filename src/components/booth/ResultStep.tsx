import React, { useState, useRef, useEffect } from 'react';
import { CapturedPhoto, PhotoTransform, FooterCustomization } from '../../types/booth';
import { FrameLayout } from '../../types/frames';
import { LAYOUT_TEMPLATES, FRAME_VISUAL_PRESETS } from '../../data/frameTemplates';
import { FramePreview } from './FramePreview';
import { Button } from '../ui/Button';
import { compileFrameCanvas, getCanvasFilter, drawImageCoverWithTransform, loadImage } from '../../utils/canvasCompiler';

type ResultStepProps = {
  selectedPhotos: CapturedPhoto[];
  layout: FrameLayout;
  frameId: string;
  filterId: string;
  photoTransforms: Record<string, PhotoTransform>;
  footer: FooterCustomization;
  onRestart: () => void;
};

export const ResultStep: React.FC<ResultStepProps> = ({
  selectedPhotos,
  layout,
  frameId,
  filterId,
  photoTransforms,
  footer,
  onRestart,
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isEncoding, setIsEncoding] = useState(false);
  const [encodingStatus, setEncodingStatus] = useState('');

  // Keep track of active resources for cleanup on unmount
  const activeRecordRef = useRef<{
    animationFrameId?: number;
    mediaRecorder?: MediaRecorder;
    canvas?: HTMLCanvasElement;
  }>({});

  useEffect(() => {
    return () => {
      // Clean up any running recording loop or media recorder
      if (activeRecordRef.current.animationFrameId) {
        cancelAnimationFrame(activeRecordRef.current.animationFrameId);
      }
      if (activeRecordRef.current.mediaRecorder && activeRecordRef.current.mediaRecorder.state !== 'inactive') {
        activeRecordRef.current.mediaRecorder.stop();
      }
      if (activeRecordRef.current.canvas) {
        activeRecordRef.current.canvas.width = 0;
        activeRecordRef.current.canvas.height = 0;
      }
    };
  }, []);

  const currentPreset =
    FRAME_VISUAL_PRESETS.find((p) => p.id === frameId) || FRAME_VISUAL_PRESETS[0];
  const currentLayout =
    LAYOUT_TEMPLATES.find((t) => t.id === layout) || LAYOUT_TEMPLATES[0];

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Compile and download Vertical Photo Strip
  const handleDownloadStrip = async () => {
    let canvas: HTMLCanvasElement | null = null;
    try {
      setIsEncoding(true);
      setEncodingStatus('Compiling high-resolution photo strip...');
      
      canvas = await compileFrameCanvas('strip-4', selectedPhotos, frameId, filterId, photoTransforms, footer);
      
      const link = document.createElement('a');
      link.download = `lunagi-studios-strip-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      triggerToast('Vertical strip downloaded!');
    } catch (err) {
      console.error(err);
      triggerToast('Error compiling photo strip');
    } finally {
      setIsEncoding(false);
      if (canvas) {
        canvas.width = 0;
        canvas.height = 0;
      }
    }
  };

  // Compile and download 2x2 Square Grid
  const handleDownloadSquare = async () => {
    let canvas: HTMLCanvasElement | null = null;
    try {
      setIsEncoding(true);
      setEncodingStatus('Compiling high-resolution square grid...');
      
      canvas = await compileFrameCanvas('grid-2x2', selectedPhotos, frameId, filterId, photoTransforms, footer);
      
      const link = document.createElement('a');
      link.download = `lunagi-studios-grid-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      triggerToast('Square grid downloaded!');
    } catch (err) {
      console.error(err);
      triggerToast('Error compiling square grid');
    } finally {
      setIsEncoding(false);
      if (canvas) {
        canvas.width = 0;
        canvas.height = 0;
      }
    }
  };

  // Compile and download Looping GIF
  const handleDownloadGIF = async () => {
    let canvas: HTMLCanvasElement | null = null;
    let url: string | null = null;
    try {
      setIsEncoding(true);
      setEncodingStatus('Encoding animated looping GIF...');

      // Lazy-load gifenc dynamically
      const { GIFEncoder, quantize, applyPalette } = await import('gifenc');

      // Prepare images
      const displayPhotos = [...selectedPhotos];
      while (displayPhotos.length < 4) {
        displayPhotos.push({
          id: `placeholder-${displayPhotos.length}`,
          src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" fill="%23e9e8e7"></svg>',
          capturedAt: Date.now(),
          crop: { x: 0, y: 0, width: 600, height: 800, aspectRatio: '3:4' },
        });
      }

      const loadedImages = await Promise.all(
        displayPhotos.map((photo) => loadImage(photo.src))
      );

      // GIF dimensions
      const gifWidth = 640;
      const gifHeight = 480;

      canvas = document.createElement('canvas');
      canvas.width = gifWidth;
      canvas.height = gifHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get 2D context');

      const filterString = getCanvasFilter(filterId);
      const encoder = new GIFEncoder();
      encoder.writeHeader();

      // Encode each photo respecting individual zoom/pan transforms
      loadedImages.forEach((img, index) => {
        const photo = displayPhotos[index];
        const transform = photoTransforms[photo.id] || { zoom: 1.0, offsetX: 0, offsetY: 0 };

        ctx.clearRect(0, 0, gifWidth, gifHeight);
        ctx.save();
        ctx.filter = filterString;
        drawImageCoverWithTransform(ctx, img, 0, 0, gifWidth, gifHeight, transform);
        ctx.restore();

        const imgData = ctx.getImageData(0, 0, gifWidth, gifHeight).data;
        const palette = quantize(imgData, 256);
        const indexVal = applyPalette(imgData, palette);
        encoder.addFrame(indexVal, gifWidth, gifHeight, {
          palette,
          delay: 600, // 600ms per frame
        });
      });

      encoder.finish();
      const buffer = encoder.bytes();
      const blob = new Blob([buffer as any], { type: 'image/gif' });

      const link = document.createElement('a');
      link.download = `lunagi-studios-${Date.now()}.gif`;
      url = URL.createObjectURL(blob);
      link.href = url;
      link.click();

      triggerToast('Looping GIF downloaded!');
    } catch (err) {
      console.error(err);
      triggerToast('Error encoding looping GIF');
    } finally {
      setIsEncoding(false);
      if (canvas) {
        canvas.width = 0;
        canvas.height = 0;
      }
      if (url) {
        const tempUrl = url;
        setTimeout(() => URL.revokeObjectURL(tempUrl), 1000);
      }
    }
  };

  // Compile and download Timelapse Video
  const handleDownloadVideo = async () => {
    let canvas: HTMLCanvasElement | null = null;
    let url: string | null = null;
    try {
      setIsEncoding(true);
      setEncodingStatus('Recording timelapse video (takes a few seconds)...');

      // Prepare images
      const displayPhotos = [...selectedPhotos];
      while (displayPhotos.length < 4) {
        displayPhotos.push({
          id: `placeholder-${displayPhotos.length}`,
          src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" fill="%23e9e8e7"></svg>',
          capturedAt: Date.now(),
          crop: { x: 0, y: 0, width: 600, height: 800, aspectRatio: '3:4' },
        });
      }

      const loadedImages = await Promise.all(
        displayPhotos.map((photo) => loadImage(photo.src))
      );

      // Setup recorder canvas
      const videoWidth = 640;
      const videoHeight = 480;
      canvas = document.createElement('canvas');
      canvas.width = videoWidth;
      canvas.height = videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get 2D context');

      const filterString = getCanvasFilter(filterId);

      // Setup MediaStream and MediaRecorder
      const stream = canvas.captureStream(30); // 30 fps
      let mimeType = 'video/webm';
      
      if (MediaRecorder.isTypeSupported('video/mp4')) {
        mimeType = 'video/mp4';
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
        mimeType = 'video/webm;codecs=vp9';
      } else if (MediaRecorder.isTypeSupported('video/webm')) {
        mimeType = 'video/webm';
      }

      const chunks: Blob[] = [];
      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 2500000,
      });

      // Track resources in ref for unmount cleanup
      activeRecordRef.current = {
        animationFrameId: undefined,
        mediaRecorder: recorder,
        canvas: canvas,
      };

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      const downloadPromise = new Promise<void>((resolve, reject) => {
        recorder.onstop = () => {
          try {
            const blob = new Blob(chunks, { type: mimeType });
            const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
            const link = document.createElement('a');
            link.download = `lunagi-studios-timelapse-${Date.now()}.${ext}`;
            url = URL.createObjectURL(blob);
            link.href = url;
            link.click();
            resolve();
          } catch (err) {
            reject(err);
          }
        };
        recorder.onerror = (e) => reject(e);
      });

      // Start recording
      recorder.start();

      // Render loop animation to capture frames continuously (prevents encoder freeze)
      const durationPerPhoto = 650; // ms
      const totalLoops = 3;
      const totalPhotos = 4;
      const totalDuration = totalPhotos * totalLoops * durationPerPhoto;
      const startTime = Date.now();
      let animationFrameId: number;

      const runRecordingFrame = () => {
        const elapsed = Date.now() - startTime;
        if (elapsed >= totalDuration) {
          if (activeRecordRef.current.animationFrameId) {
            cancelAnimationFrame(activeRecordRef.current.animationFrameId);
          }
          recorder.stop();
          return;
        }

        const photoIdx = Math.floor(elapsed / durationPerPhoto) % totalPhotos;
        const img = loadedImages[photoIdx];
        const photo = displayPhotos[photoIdx];
        const transform = photoTransforms[photo.id] || { zoom: 1.0, offsetX: 0, offsetY: 0 };

        ctx.clearRect(0, 0, videoWidth, videoHeight);
        ctx.save();
        ctx.filter = filterString;
        drawImageCoverWithTransform(ctx, img, 0, 0, videoWidth, videoHeight, transform);
        ctx.restore();

        animationFrameId = requestAnimationFrame(runRecordingFrame);
        activeRecordRef.current.animationFrameId = animationFrameId;
      };

      // Start the frame loop
      runRecordingFrame();

      // Wait for recording to save
      await downloadPromise;
      triggerToast('Timelapse video downloaded!');
    } catch (err) {
      console.error(err);
      triggerToast('Error generating timelapse video');
    } finally {
      setIsEncoding(false);
      if (canvas) {
        canvas.width = 0;
        canvas.height = 0;
      }
      if (url) {
        const tempUrl = url;
        setTimeout(() => URL.revokeObjectURL(tempUrl), 1000);
      }
      activeRecordRef.current = {};
    }
  };

  // Share layout natively using Web Share API
  const handleShare = async () => {
    let canvas: HTMLCanvasElement | null = null;
    let url: string | null = null;
    try {
      setIsEncoding(true);
      setEncodingStatus('Compiling layout for sharing...');
      
      canvas = await compileFrameCanvas(layout, selectedPhotos, frameId, filterId, photoTransforms, footer);
      
      canvas.toBlob(async (blob) => {
        setIsEncoding(false);
        if (!blob) {
          triggerToast('Failed to compile image.');
          if (canvas) {
            canvas.width = 0;
            canvas.height = 0;
          }
          return;
        }
        
        const filename = `lunagi-studios-${layout}-${Date.now()}.png`;
        const file = new File([blob], filename, { type: 'image/png' });
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: 'Lunagi Studios Photobooth',
              text: 'Captured a moment at Lunagi Studios.',
            });
            triggerToast('Shared successfully!');
          } catch (shareErr) {
            if (shareErr instanceof Error && shareErr.name !== 'AbortError') {
              triggerToast('Error sharing: ' + shareErr.message);
            }
          }
        } else {
          // Fallback: download the file
          const link = document.createElement('a');
          link.download = filename;
          url = URL.createObjectURL(blob);
          link.href = url;
          link.click();
          triggerToast('Web Share not supported. Downloaded instead.');
        }

        // Clean up canvas & url references
        if (canvas) {
          canvas.width = 0;
          canvas.height = 0;
        }
        if (url) {
          const tempUrl = url;
          setTimeout(() => URL.revokeObjectURL(tempUrl), 1000);
        }
      }, 'image/png');
    } catch (err) {
      setIsEncoding(false);
      console.error(err);
      triggerToast('Error preparing share: ' + (err instanceof Error ? err.message : 'unknown'));
      if (canvas) {
        canvas.width = 0;
        canvas.height = 0;
      }
    }
  };

  const handlePrint = async () => {
    let canvas: HTMLCanvasElement | null = null;
    try {
      setIsEncoding(true);
      setEncodingStatus('Compiling layout for printing...');

      canvas = await compileFrameCanvas(layout, selectedPhotos, frameId, filterId, photoTransforms, footer);
      const dataUrl = canvas.toDataURL('image/png');

      let printSection = document.getElementById('print-section');
      if (!printSection) {
        printSection = document.createElement('div');
        printSection.id = 'print-section';
        document.body.appendChild(printSection);
      }

      // Add no-print class to all top-level children except the print section
      const bodyChildren = Array.from(document.body.children);
      bodyChildren.forEach((child) => {
        if (child.id !== 'print-section') {
          child.classList.add('no-print');
        }
      });

      printSection.innerHTML = '';
      const img = document.createElement('img');
      img.src = dataUrl;
      printSection.appendChild(img);

      const cleanupPrint = () => {
        const pSec = document.getElementById('print-section');
        if (pSec) {
          pSec.remove();
        }
        const bChildren = Array.from(document.body.children);
        bChildren.forEach((child) => {
          child.classList.remove('no-print');
        });
        window.removeEventListener('afterprint', cleanupPrint);
      };

      window.addEventListener('afterprint', cleanupPrint);

      // Small delay to ensure image loads/renders in DOM
      setTimeout(() => {
        window.print();
        setIsEncoding(false);
      }, 500);

    } catch (err) {
      console.error(err);
      triggerToast('Error preparing print layout');
      setIsEncoding(false);
      if (canvas) {
        canvas.width = 0;
        canvas.height = 0;
      }
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center py-6">
      
      {/* Toast Notification */}
      <div
        className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#1A1A1A] text-white px-6 py-3.5 rounded-full font-sans text-xs font-semibold tracking-wide border border-white/10 shadow-xl transition-all duration-300 flex items-center gap-2 pointer-events-none ${
          toastMessage ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95'
        }`}
      >
        <span className="material-symbols-outlined text-[16px] text-neutral-300">info</span>
        <span>{toastMessage}</span>
      </div>

      {/* Loading Overlay */}
      {isEncoding && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center">
          <div className="bg-surface p-8 rounded-2xl border border-outline-variant max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="space-y-1">
              <h3 className="font-sans font-semibold text-primary">Processing</h3>
              <p className="font-sans text-xs text-secondary">{encodingStatus}</p>
            </div>
          </div>
        </div>
      )}

      {/* Title Header */}
      <div className="text-center mb-12 space-y-2">
        <h1 className="font-sans text-3xl font-semibold tracking-tight text-primary">
          Your photos are ready.
        </h1>
        <p className="font-sans text-base text-secondary">
          A quiet moment, captured perfectly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter w-full items-stretch">
        
        {/* Left column: Physical Print Preview Card */}
        <div className="lg:col-span-7 flex justify-center items-center bg-surface rounded-2xl p-8 border border-outline-variant shadow-sm relative overflow-hidden min-h-[500px]">
          {/* Subtle noise texture background representing a tactile surface */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}></div>
          
          <div className="rotate-[-2deg] transition-transform hover:rotate-0 duration-500">
            <FramePreview
              selectedPhotos={selectedPhotos}
              layoutTemplate={currentLayout}
              visualPreset={currentPreset}
              filterId={filterId}
              photoTransforms={photoTransforms}
              footer={footer}
            />
          </div>
        </div>

        {/* Right column: Action Panel */}
        <div className="lg:col-span-5 flex flex-col justify-center gap-8 lg:pl-8 bg-surface-container-lowest p-6 border border-outline-variant rounded-2xl">
          <div className="space-y-6">
            <div>
              <h2 className="font-sans text-xl font-semibold text-primary mb-1">
                Downloads
              </h2>
              <p className="font-sans text-sm text-secondary">
                Select your preferred output format.
              </p>
            </div>

            {/* Grid layout of 2x2 downloads */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleDownloadStrip}
                className="flex flex-col items-center justify-center aspect-square p-4 bg-surface-container-lowest border border-outline-variant rounded-xl hover:bg-surface hover:border-primary transition-all group focus:outline-none"
              >
                <span className="material-symbols-outlined text-[32px] text-primary mb-2 group-hover:scale-110 transition-transform">
                  view_carousel
                </span>
                <span className="font-sans text-xs font-semibold tracking-wide text-primary">Strip</span>
              </button>

              <button
                onClick={handleDownloadSquare}
                className="flex flex-col items-center justify-center aspect-square p-4 bg-surface-container-lowest border border-outline-variant rounded-xl hover:bg-surface hover:border-primary transition-all group focus:outline-none"
              >
                <span className="material-symbols-outlined text-[32px] text-primary mb-2 group-hover:scale-110 transition-transform">
                  crop_square
                </span>
                <span className="font-sans text-xs font-semibold tracking-wide text-primary">Square</span>
              </button>

              <button
                onClick={handleDownloadVideo}
                className="flex flex-col items-center justify-center aspect-square p-4 bg-surface-container-lowest border border-outline-variant rounded-xl hover:bg-surface hover:border-primary transition-all group focus:outline-none"
              >
                <span className="material-symbols-outlined text-[32px] text-primary mb-2 group-hover:scale-110 transition-transform">
                  movie
                </span>
                <span className="font-sans text-xs font-semibold tracking-wide text-primary">Video</span>
              </button>

              <button
                onClick={handleDownloadGIF}
                className="flex flex-col items-center justify-center aspect-square p-4 bg-surface-container-lowest border border-outline-variant rounded-xl hover:bg-surface hover:border-primary transition-all group focus:outline-none"
              >
                <span className="material-symbols-outlined text-[32px] text-primary mb-2 group-hover:scale-110 transition-transform">
                  animation
                </span>
                <span className="font-sans text-xs font-semibold tracking-wide text-primary">GIF</span>
              </button>

              <button
                onClick={handlePrint}
                className="col-span-2 flex items-center justify-center gap-2.5 p-4 bg-surface-container-lowest border border-outline-variant rounded-xl hover:bg-surface hover:border-primary transition-all group focus:outline-none mt-2"
              >
                <span className="material-symbols-outlined text-[24px] text-primary group-hover:scale-110 transition-transform">
                  print
                </span>
                <span className="font-sans text-xs font-semibold tracking-wider uppercase text-primary">Print Physical Photo</span>
              </button>
            </div>
          </div>

          <hr className="border-outline-variant" />

          {/* Action trigger group */}
          <div className="space-y-4">
            <Button
              onClick={handleShare}
              variant="primary"
              className="w-full py-4 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">share</span>
              Share directly
            </Button>
            <Button
              onClick={onRestart}
              variant="secondary"
              className="w-full py-4"
            >
              Start Again
            </Button>
          </div>

          {/* Privacy Disclaimer Box */}
          <div className="flex items-start gap-3 p-4 bg-surface rounded-xl border border-outline-variant">
            <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5" style={{ fontVariationSettings: "'FILL' 0" }}>
              lock
            </span>
            <p className="font-sans text-xs text-secondary leading-relaxed">
              Nothing was uploaded. Created entirely on your device. Your photos are private until you choose to share them.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
