import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-surface-container-low w-full border-t border-outline-variant mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-12 max-w-container-max mx-auto gap-8 md:gap-0">
        {/* Copyright */}
        <div className="font-sans text-sm text-secondary">
          © {new Date().getFullYear()} Lunagi Studios. All rights reserved.
        </div>
        
        {/* Brand */}
        <div className="font-sans font-medium text-lg text-primary tracking-[0.15em] uppercase">
          LUNAGI STUDIOS
        </div>
        
        {/* Links */}
        <div className="flex gap-6 font-sans text-xs font-semibold tracking-wider">
          <a className="text-secondary hover:text-primary transition-colors" href="#privacy">
            Privacy Policy
          </a>
          <a className="text-secondary hover:text-primary transition-colors" href="#terms">
            Terms of Service
          </a>
          <a className="text-secondary hover:text-primary transition-colors" href="#contact">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
};
