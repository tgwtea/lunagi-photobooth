import React, { useEffect, useRef, useState } from 'react';
import { CapturedPhoto, CustomizationState } from '../../types/booth';
import { FramePreview } from './FramePreview';
import { Button } from '../ui/Button';
import {
  compileFrameCanvas,
  drawBrandWatermark,
  drawPhotoWithLook,
  loadImage,
  normalizePhotos,
} from '../../utils/canvasCompiler';

type ResultStepProps = {
  selectedPhotos: CapturedPhoto[];
  customization: CustomizationState;
  onRestart: () => void;
};

export const ResultStep: React.FC<ResultStepProps> = ({
  selectedPhotos,
  customization,
  onRestart,
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isEncoding, setIsEncoding] = useState(false);
  const [encodingStatus, setEncodingStatus] = useState('');
  const activeRecordRef = useRef<{
    animationFrameId?: number;
    mediaRecorder?: MediaRecorder;
    canvas?: HTMLCanvasElement;
  }>({});

  useEffect(() => {
    return () => {
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

  const triggerToast = (message: string) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(null), 3000);
  };

  const downloadCanvas = async (layoutOverride: 'strip-4' | 'grid-2x2', label: string) => {
    let canvas: HTMLCanvasElement | null = null;
    try {
      setIsEncoding(true);
      setEncodingStatus(`Compiling high-resolution ${label}...`);
      canvas = await compileFrameCanvas(selectedPhotos, customization, { layoutOverride });
      const link = document.createElement('a');
      link.download = `lunagi-studios-${label}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      triggerToast(`${label[0].toUpperCase()}${label.slice(1)} downloaded!`);
    } catch (err) {
      console.error(err);
      triggerToast(`Error compiling ${label}`);
    } finally {
      setIsEncoding(false);
      if (canvas) {
        canvas.width = 0;
        canvas.height = 0;
      }
    }
  };

  const drawAnimationFrame = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    photo: CapturedPhoto,
    width: number,
    height: number
  ) => {
    ctx.clearRect(0, 0, width, height);
    const transform = customization.photoTransforms[photo.id] || { zoom: 1, offsetX: 0, offsetY: 0 };
    drawPhotoWithLook(
      ctx,
      img,
      { x: 0, y: 0, width, height },
      transform,
      customization.filterId,
      customization.effectId,
      0
    );
    drawBrandWatermark(ctx, width, height);
  };

  const handleDownloadGIF = async () => {
    let canvas: HTMLCanvasElement | null = null;
    let url: string | null = null;
    try {
      setIsEncoding(true);
      setEncodingStatus('Encoding animated looping GIF...');
      const { GIFEncoder, quantize, applyPalette } = await import('gifenc');
      const displayPhotos = normalizePhotos(selectedPhotos);
      const loadedImages = await Promise.all(displayPhotos.map((photo) => loadImage(photo.src)));
      const gifWidth = 640;
      const gifHeight = 480;
      canvas = document.createElement('canvas');
      canvas.width = gifWidth;
      canvas.height = gifHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get 2D context');
      const encoder = GIFEncoder();

      loadedImages.forEach((img, index) => {
        drawAnimationFrame(ctx, img, displayPhotos[index], gifWidth, gifHeight);
        const imgData = ctx.getImageData(0, 0, gifWidth, gifHeight).data;
        const palette = quantize(imgData, 256);
        const indexVal = applyPalette(imgData, palette);
        encoder.writeFrame(indexVal, gifWidth, gifHeight, {
          palette,
          delay: 600,
        });
      });

      encoder.finish();
      const bytes = encoder.bytes();
      const gifBuffer = new ArrayBuffer(bytes.byteLength);
      new Uint8Array(gifBuffer).set(bytes);
      const blob = new Blob([gifBuffer], { type: 'image/gif' });
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
        window.setTimeout(() => URL.revokeObjectURL(url as string), 1000);
      }
    }
  };

  const handleDownloadVideo = async () => {
    let canvas: HTMLCanvasElement | null = null;
    let url: string | null = null;
    try {
      setIsEncoding(true);
      setEncodingStatus('Recording timelapse video...');
      const displayPhotos = normalizePhotos(selectedPhotos);
      const loadedImages = await Promise.all(displayPhotos.map((photo) => loadImage(photo.src)));
      const videoWidth = 640;
      const videoHeight = 480;
      canvas = document.createElement('canvas');
      canvas.width = videoWidth;
      canvas.height = videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get 2D context');

      const stream = canvas.captureStream(30);
      let mimeType = 'video/webm';
      if (MediaRecorder.isTypeSupported('video/mp4')) {
        mimeType = 'video/mp4';
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
        mimeType = 'video/webm;codecs=vp9';
      }
      const chunks: Blob[] = [];
      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 2500000,
      });
      activeRecordRef.current = { mediaRecorder: recorder, canvas };
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
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
        recorder.onerror = (event) => reject(event);
      });

      recorder.start();
      const durationPerPhoto = 650;
      const totalLoops = 3;
      const totalDuration = displayPhotos.length * totalLoops * durationPerPhoto;
      const startTime = Date.now();

      const runRecordingFrame = () => {
        const elapsed = Date.now() - startTime;
        if (elapsed >= totalDuration) {
          recorder.stop();
          return;
        }
        const photoIdx = Math.floor(elapsed / durationPerPhoto) % displayPhotos.length;
        drawAnimationFrame(ctx, loadedImages[photoIdx], displayPhotos[photoIdx], videoWidth, videoHeight);
        const animationFrameId = requestAnimationFrame(runRecordingFrame);
        activeRecordRef.current.animationFrameId = animationFrameId;
      };

      runRecordingFrame();
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
        window.setTimeout(() => URL.revokeObjectURL(url as string), 1000);
      }
      activeRecordRef.current = {};
    }
  };

  const handleShare = async () => {
    let canvas: HTMLCanvasElement | null = null;
    let url: string | null = null;
    try {
      setIsEncoding(true);
      setEncodingStatus('Compiling layout for sharing...');
      canvas = await compileFrameCanvas(selectedPhotos, customization);
      const blob = await new Promise<Blob | null>((resolve) => canvas?.toBlob(resolve, 'image/png'));
      setIsEncoding(false);
      if (!blob) {
        triggerToast('Failed to compile image.');
        return;
      }
      const filename = `lunagi-studios-${customization.layout}-${Date.now()}.png`;
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
            triggerToast(`Error sharing: ${shareErr.message}`);
          }
        }
      } else {
        const link = document.createElement('a');
        link.download = filename;
        url = URL.createObjectURL(blob);
        link.href = url;
        link.click();
        triggerToast('Web Share not supported. Downloaded instead.');
      }
    } catch (err) {
      setIsEncoding(false);
      console.error(err);
      triggerToast(`Error preparing share: ${err instanceof Error ? err.message : 'unknown'}`);
    } finally {
      if (canvas) {
        canvas.width = 0;
        canvas.height = 0;
      }
      if (url) {
        window.setTimeout(() => URL.revokeObjectURL(url as string), 1000);
      }
    }
  };

  const handlePrint = async () => {
    let canvas: HTMLCanvasElement | null = null;
    try {
      setIsEncoding(true);
      setEncodingStatus('Compiling layout for printing...');
      canvas = await compileFrameCanvas(selectedPhotos, customization);
      const dataUrl = canvas.toDataURL('image/png');
      let printSection = document.getElementById('print-section');
      if (!printSection) {
        printSection = document.createElement('div');
        printSection.id = 'print-section';
        document.body.appendChild(printSection);
      }
      Array.from(document.body.children).forEach((child) => {
        if (child.id !== 'print-section') child.classList.add('no-print');
      });
      printSection.innerHTML = '';
      const img = document.createElement('img');
      img.src = dataUrl;
      printSection.appendChild(img);
      const cleanupPrint = () => {
        document.getElementById('print-section')?.remove();
        Array.from(document.body.children).forEach((child) => child.classList.remove('no-print'));
        window.removeEventListener('afterprint', cleanupPrint);
      };
      window.addEventListener('afterprint', cleanupPrint);
      window.setTimeout(() => {
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
      <div
        className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#1A1A1A] text-white px-6 py-3.5 rounded-full font-sans text-xs font-semibold tracking-wide border border-white/10 shadow-xl transition-all duration-300 flex items-center gap-2 pointer-events-none ${
          toastMessage ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95'
        }`}
      >
        <span className="material-symbols-outlined text-[16px] text-neutral-300">info</span>
        <span>{toastMessage}</span>
      </div>

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

      <div className="text-center mb-12 space-y-2">
        <h1 className="font-sans text-3xl font-semibold tracking-tight text-primary">
          Your photos are ready.
        </h1>
        <p className="font-sans text-base text-secondary">
          Download, print, or share your final layout.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter w-full items-stretch">
        <div className="lg:col-span-7 flex justify-center items-center bg-surface rounded-2xl p-8 border border-outline-variant shadow-sm relative overflow-hidden min-h-[500px]">
          <div className="rotate-[-2deg] transition-transform hover:rotate-0 duration-500">
            <FramePreview selectedPhotos={selectedPhotos} customization={customization} />
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col justify-center gap-8 lg:pl-8 bg-surface-container-lowest p-6 border border-outline-variant rounded-2xl">
          <div className="space-y-6">
            <div>
              <h2 className="font-sans text-xl font-semibold text-primary mb-1">
                Downloads
              </h2>
              <p className="font-sans text-sm text-secondary">
                GIF and video are branded single-photo animations.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Strip', icon: 'view_carousel', action: () => downloadCanvas('strip-4', 'strip') },
                { label: 'Square', icon: 'crop_square', action: () => downloadCanvas('grid-2x2', 'grid') },
                { label: 'Video', icon: 'movie', action: handleDownloadVideo },
                { label: 'GIF', icon: 'animation', action: handleDownloadGIF },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="flex flex-col items-center justify-center aspect-square p-4 bg-surface-container-lowest border border-outline-variant rounded-xl hover:bg-surface hover:border-primary transition-all group focus:outline-none"
                >
                  <span className="material-symbols-outlined text-[32px] text-primary mb-2 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </span>
                  <span className="font-sans text-xs font-semibold tracking-wide text-primary">{item.label}</span>
                </button>
              ))}

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

          <div className="space-y-4">
            <Button
              onClick={handleShare}
              variant="primary"
              className="w-full py-4 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">share</span>
              Share directly
            </Button>
            <Button onClick={onRestart} variant="secondary" className="w-full py-4">
              Start Again
            </Button>
          </div>

          <div className="flex items-start gap-3 p-4 bg-surface rounded-xl border border-outline-variant">
            <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">
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
