import React from 'react';
import { SiteHeader } from '../components/layout/SiteHeader';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';

type LandingPageProps = {
  onStartBooth: () => void;
};

export const LandingPage: React.FC<LandingPageProps> = ({ onStartBooth }) => {
  // We can render SVG-based beautiful mockups representing physical photobooth prints
  const mockImage1 = `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
      <rect width="400" height="300" fill="#FAF9F6"/>
      <circle cx="200" cy="130" r="50" fill="none" stroke="#1A1A1A" stroke-width="1.5" opacity="0.3"/>
      <path d="M 120,230 Q 200,180 280,230" fill="none" stroke="#1A1A1A" stroke-width="1.5" opacity="0.3"/>
      <text x="200" y="270" font-family="Inter, sans-serif" font-size="14" font-weight="500" fill="#1A1A1A" opacity="0.4" text-anchor="middle" letter-spacing="0.05em">POSE 01</text>
    </svg>
  `)}`;

  const mockImage2 = `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
      <rect width="400" height="300" fill="#FDF8F8"/>
      <circle cx="200" cy="130" r="50" fill="none" stroke="#313030" stroke-width="1.5" opacity="0.3"/>
      <path d="M 150,140 Q 200,110 250,140" fill="none" stroke="#313030" stroke-width="1.5" opacity="0.3"/>
      <text x="200" y="270" font-family="Inter, sans-serif" font-size="14" font-weight="500" fill="#313030" opacity="0.4" text-anchor="middle" letter-spacing="0.05em">POSE 02</text>
    </svg>
  `)}`;

  return (
    <div className="min-h-screen flex flex-col bg-surface-container-lowest text-on-surface">
      {/* Landing page top nav */}
      <SiteHeader
        showNav={true}
        actionText="Start Booth"
        onAction={onStartBooth}
      />

      <main className="flex-grow flex flex-col items-center w-full">
        
        {/* Hero Section */}
        <section className="w-full px-margin-mobile md:px-margin-desktop py-20 md:py-28 max-w-container-max mx-auto flex flex-col items-center text-center">
          <h1 className="font-sans text-4xl md:text-5xl lg:text-6xl font-semibold text-primary max-w-4xl tracking-tight leading-[1.15] mb-6">
            A Korean-style photobooth in your browser.
          </h1>
          <p className="font-sans text-base md:text-lg text-secondary max-w-2xl leading-relaxed mb-12">
            Take 8 timed photos. Choose your favourite 4. Customize with preset frame designs and download your vertical strip or square grid. Free, private, and zero account setup required.
          </p>
          
          <Button
            onClick={onStartBooth}
            variant="primary"
            className="px-8 py-4 text-base font-semibold"
          >
            Start Booth
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </Button>

          {/* Hero Visual Mockup */}
          <div className="mt-20 w-full max-w-4xl flex flex-col sm:flex-row gap-12 justify-center items-center">
            
            {/* 4-cut vertical strip mockup */}
            <div className="bg-white p-4 rounded-xl border border-outline-variant shadow-[0_15px_35px_rgba(0,0,0,0.03)] w-48 shrink-0 rotate-[-2deg] transition-all hover:rotate-0 hover:scale-105 duration-500">
              <div className="flex flex-col gap-2.5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-full aspect-[4/3] rounded-sm bg-surface-container-high overflow-hidden border border-black/5">
                    <img src={mockImage1} alt="Mock strip frame" className="w-full h-full object-cover filter brightness-[1.02]" />
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <p className="font-sans text-[10px] font-semibold text-primary tracking-[0.25em] uppercase opacity-75">LUNAGI</p>
              </div>
            </div>

            {/* 2x2 square grid mockup */}
            <div className="bg-white p-4 rounded-xl border border-outline-variant shadow-[0_15px_35px_rgba(0,0,0,0.03)] w-64 shrink-0 rotate-[3deg] sm:mt-12 transition-all hover:rotate-0 hover:scale-105 duration-500">
              <div className="grid grid-cols-2 gap-2.5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-full aspect-[4/3] rounded-sm bg-surface-container-high overflow-hidden border border-black/5">
                    <img src={mockImage2} alt="Mock grid frame" className="w-full h-full object-cover filter brightness-[1.02]" />
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <p className="font-sans text-[10px] font-semibold text-primary tracking-[0.25em] uppercase opacity-75">LUNAGI</p>
              </div>
            </div>

          </div>
        </section>

        {/* How it Works Section */}
        <section className="w-full px-margin-mobile md:px-margin-desktop py-24 bg-surface border-y border-outline-variant/30" id="how-it-works">
          <div className="max-w-container-max mx-auto">
            <h2 className="font-sans text-3xl font-semibold text-primary text-center mb-16 tracking-tight">
              How it works
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-surface-container-lowest border border-outline-variant flex items-center justify-center text-primary shadow-sm">
                  <span className="material-symbols-outlined text-[28px]">photo_camera</span>
                </div>
                <h3 className="font-sans text-lg font-semibold text-primary">Shoot</h3>
                <p className="font-sans text-sm text-secondary leading-relaxed max-w-[240px]">
                  Strike your poses! The app automatically takes 8 timed shots with visual countdown overlays.
                </p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-surface-container-lowest border border-outline-variant flex items-center justify-center text-primary shadow-sm">
                  <span className="material-symbols-outlined text-[28px]">check_circle</span>
                </div>
                <h3 className="font-sans text-lg font-semibold text-primary">Select</h3>
                <p className="font-sans text-sm text-secondary leading-relaxed max-w-[240px]">
                  Review your capture buffer. Tap in order to select your absolute favorite 4 photos.
                </p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-surface-container-lowest border border-outline-variant flex items-center justify-center text-primary shadow-sm">
                  <span className="material-symbols-outlined text-[28px]">palette</span>
                </div>
                <h3 className="font-sans text-lg font-semibold text-primary">Style</h3>
                <p className="font-sans text-sm text-secondary leading-relaxed max-w-[240px]">
                  Swap frame templates and apply custom monochrome or warming filters to fit your aesthetic.
                </p>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-surface-container-lowest border border-outline-variant flex items-center justify-center text-primary shadow-sm">
                  <span className="material-symbols-outlined text-[28px]">download</span>
                </div>
                <h3 className="font-sans text-lg font-semibold text-primary">Save</h3>
                <p className="font-sans text-sm text-secondary leading-relaxed max-w-[240px]">
                  Download vertical 4-cut sheets or square 2x2 grids directly to your camera roll or desktop.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Privacy Highlight Section */}
        <section className="w-full px-margin-mobile md:px-margin-desktop py-24 max-w-container-max mx-auto" id="privacy">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="inline-flex w-12 h-12 rounded-full bg-neutral-100 border border-outline-variant items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[22px]">lock</span>
            </div>
            <h2 className="font-sans text-2xl md:text-3xl font-semibold text-primary tracking-tight">
              Your photos stay yours.
            </h2>
            <p className="font-sans text-sm md:text-base text-secondary leading-relaxed">
              Lunagi Studios is designed to be serverless and client-only. We do not require account logins, nor do we upload your raw photos or finished collages to external cloud servers. Everything is processed directly in your local browser sandbox and cleared immediately when you exit the tab.
            </p>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};
