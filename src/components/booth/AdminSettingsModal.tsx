import React, { useState, useEffect } from 'react';
import { useKiosk } from '../../context/KioskContext';
import { Button } from '../ui/Button';

export const AdminSettingsModal: React.FC = () => {
  const {
    kioskActive,
    setKioskActive,
    passcode,
    setPasscode,
    timeoutDuration,
    setTimeoutDuration,
    showAdminModal,
    setShowAdminModal,
  } = useKiosk();

  const [step, setStep] = useState<'passcode' | 'settings'>('passcode');
  const [enteredPasscode, setEnteredPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [passcodeSuccessMsg, setPasscodeSuccessMsg] = useState('');

  // Reset state when modal is opened/closed
  useEffect(() => {
    if (showAdminModal) {
      setStep('passcode');
      setEnteredPasscode('');
      setErrorMsg('');
      setNewPasscode('');
      setPasscodeSuccessMsg('');
    }
  }, [showAdminModal]);

  if (!showAdminModal) return null;

  const handleKeyPress = (num: string) => {
    setErrorMsg('');
    if (enteredPasscode.length < 8) {
      setEnteredPasscode((prev) => prev + num);
    }
  };

  const handleBackspace = () => {
    setErrorMsg('');
    setEnteredPasscode((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setErrorMsg('');
    setEnteredPasscode('');
  };

  const handleVerify = () => {
    if (enteredPasscode === passcode) {
      setStep('settings');
      setErrorMsg('');
    } else {
      setErrorMsg('Incorrect passcode. Please try again.');
      setEnteredPasscode('');
    }
  };

  const handleSavePasscode = () => {
    if (newPasscode.trim().length < 4) {
      setErrorMsg('Passcode must be at least 4 digits');
      setPasscodeSuccessMsg('');
      return;
    }
    setPasscode(newPasscode.trim());
    setPasscodeSuccessMsg('Passcode updated successfully!');
    setNewPasscode('');
    setErrorMsg('');
    setTimeout(() => setPasscodeSuccessMsg(''), 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-[#FAF9F9] border border-[#e9e8e7] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl transition-all duration-300 transform scale-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#e9e8e7] flex justify-between items-center bg-[#f5f3f3]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#1b1c1c] text-xl">admin_panel_settings</span>
            <h2 className="font-sans font-semibold text-[#1b1c1c] text-sm tracking-widest uppercase">Admin Settings</h2>
          </div>
          <button
            onClick={() => setShowAdminModal(false)}
            className="text-[#5e5e5e] hover:text-[#000000] transition-colors focus:outline-none"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-grow">
          {step === 'passcode' ? (
            <div className="flex flex-col items-center space-y-6">
              <p className="font-sans text-xs text-[#5e5e5e] text-center tracking-wide">
                Enter passcode to access administrative settings.
              </p>

              {/* Passcode dots display */}
              <div className="flex justify-center gap-3 py-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full border border-[#747878] transition-all duration-200 ${
                      enteredPasscode.length > i ? 'bg-primary scale-110 shadow-sm' : 'bg-transparent'
                    }`}
                  />
                ))}
                {enteredPasscode.length > 4 &&
                  [...Array(enteredPasscode.length - 4)].map((_, i) => (
                    <div
                      key={i + 4}
                      className="w-3 h-3 rounded-full border border-[#747878] bg-primary scale-110 shadow-sm transition-all duration-200"
                    />
                  ))}
              </div>

              {errorMsg && (
                <p className="font-sans text-xs font-semibold text-error text-center">{errorMsg}</p>
              )}

              {/* Numeric Keypad */}
              <div className="grid grid-cols-3 gap-3 w-full max-w-[260px]">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleKeyPress(num)}
                    className="w-full aspect-square rounded-full border border-[#c4c7c7] hover:border-primary hover:bg-[#efeded] active:scale-95 text-base font-sans font-medium text-primary transition-all duration-150 flex items-center justify-center focus:outline-none"
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={handleClear}
                  className="w-full aspect-square rounded-full border border-[#c4c7c7] hover:border-error hover:bg-error-container hover:text-on-error-container active:scale-95 text-2xs font-sans font-semibold tracking-wider text-[#5e5e5e] transition-all duration-150 flex items-center justify-center focus:outline-none uppercase"
                >
                  Clear
                </button>
                <button
                  onClick={() => handleKeyPress('0')}
                  className="w-full aspect-square rounded-full border border-[#c4c7c7] hover:border-primary hover:bg-[#efeded] active:scale-95 text-base font-sans font-medium text-primary transition-all duration-150 flex items-center justify-center focus:outline-none"
                >
                  0
                </button>
                <button
                  onClick={handleBackspace}
                  className="w-full aspect-square rounded-full border border-[#c4c7c7] hover:border-primary hover:bg-[#efeded] active:scale-95 text-[#5e5e5e] transition-all duration-150 flex items-center justify-center focus:outline-none"
                >
                  <span className="material-symbols-outlined text-[18px]">backspace</span>
                </button>
              </div>

              <div className="flex gap-4 w-full pt-4">
                <Button variant="secondary" className="flex-1" onClick={() => setShowAdminModal(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  disabled={enteredPasscode.length === 0}
                  onClick={handleVerify}
                >
                  Verify
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Kiosk Mode Toggle */}
              <div className="space-y-2">
                <label className="font-sans text-[11px] font-bold uppercase tracking-widest text-[#5e5e5e] block">
                  Kiosk Mode Lockdown
                </label>
                <div className="flex p-1 bg-[#efeded] rounded-full border border-[#c4c7c7]">
                  <button
                    onClick={() => setKioskActive(true)}
                    className={`flex-1 py-2 text-xs font-sans font-semibold rounded-full transition-all duration-200 ${
                      kioskActive
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-[#5e5e5e] hover:text-primary bg-transparent'
                    }`}
                  >
                    Active (Locked)
                  </button>
                  <button
                    onClick={() => setKioskActive(false)}
                    className={`flex-1 py-2 text-xs font-sans font-semibold rounded-full transition-all duration-200 ${
                      !kioskActive
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-[#5e5e5e] hover:text-primary bg-transparent'
                    }`}
                  >
                    Inactive
                  </button>
                </div>
                <p className="font-sans text-[10px] text-[#5e5e5e] leading-relaxed pt-1">
                  Active mode hides all exit and back buttons to lock down the photobooth session flow.
                </p>
              </div>

              <hr className="border-[#e9e8e7]" />

              {/* Inactivity Timeout */}
              <div className="space-y-2">
                <label className="font-sans text-[11px] font-bold uppercase tracking-widest text-[#5e5e5e] block">
                  Inactivity Auto-Reset
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: '30s', value: 30 },
                    { label: '60s', value: 60 },
                    { label: '120s', value: 120 },
                    { label: 'Off', value: 0 },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setTimeoutDuration(opt.value)}
                      className={`py-2.5 text-xs font-sans font-semibold rounded-xl border transition-all duration-200 ${
                        timeoutDuration === opt.value
                          ? 'border-primary bg-primary text-white'
                          : 'border-[#c4c7c7] text-[#5e5e5e] hover:text-primary hover:border-primary'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <p className="font-sans text-[10px] text-[#5e5e5e] leading-relaxed pt-1">
                  Resets and purges buffer if the user walks away from Selection or Result screens.
                </p>
              </div>

              <hr className="border-[#e9e8e7]" />

              {/* Change Passcode */}
              <div className="space-y-2">
                <label className="font-sans text-[11px] font-bold uppercase tracking-widest text-[#5e5e5e] block">
                  Update Passcode
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    placeholder="New numeric passcode"
                    value={newPasscode}
                    onChange={(e) => setNewPasscode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                    className="flex-grow bg-transparent border border-[#c4c7c7] rounded-xl px-4 py-2.5 text-sm text-primary font-sans placeholder:text-[#5e5e5e]/50 focus:outline-none focus:border-primary"
                  />
                  <Button variant="secondary" onClick={handleSavePasscode} className="shrink-0 h-10 py-0">
                    Update
                  </Button>
                </div>
                {passcodeSuccessMsg && (
                  <p className="font-sans text-xs font-semibold text-green-600">{passcodeSuccessMsg}</p>
                )}
                {errorMsg && <p className="font-sans text-xs font-semibold text-error">{errorMsg}</p>}
              </div>

              <hr className="border-[#e9e8e7]" />

              {/* Footer controls */}
              <div className="pt-2">
                <Button variant="primary" className="w-full py-3.5" onClick={() => setShowAdminModal(false)}>
                  Close & Apply
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
