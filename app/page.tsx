"use client"
import React, { useState, useRef, useEffect } from 'react';
import { Loader2, Lock, Check, Sparkles, Zap, Eye, Share2, AlertCircle, Heart, Brain, Target, Users, Upload, X, Download } from 'lucide-react';
import { analyzeVibe } from './lib/gemini';

export default function FirstImpressionApp() {
  const [step, setStep] = useState<'input' | 'photo-upload' | 'result'>('input');
  const [inputText, setInputText] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    harsh1: string;
    harsh2: string;
    harsh3: string;
    harsh4: string;
    positive: string;
    psychologicalInsight: string;
    viralHook: string;
  } | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [showLoadingAnimation, setShowLoadingAnimation] = useState(false);
  const [shareCount, setShareCount] = useState(Math.floor(Math.random() * 20000) + 15000);
  const [displayShareCount, setDisplayShareCount] = useState(Math.floor(Math.random() * 20000) + 15000);
  const [visibleTruths, setVisibleTruths] = useState([false, false, false, false]);
  const DOMAIN =
  process.env.NEXT_PUBLIC_DOMAIN || "truthpulse.vercel.app";

  const VIRAL_HOOKS = [
    "Your friends are talking about you behind your back. Here's what they're saying...",
    "The secret thoughts people have when they see your profile...",
    "What your ex would say about your new bio...",
    "The brutal truth your best friend won't tell you...",
    "Strangers judge you in 3 seconds. Here's their verdict...",
  ];

  // Convert Gemini AI format to your original format
  const convertAIToOriginalFormat = (aiResult: any, hasPhoto: boolean) => {
    // Map AI results to your original harsh1-harsh4 format
    const harshLines = [
      aiResult.firstImpression,
      aiResult.assumption,
      aiResult.silentJudgment,
      aiResult.hurtingImage
    ];
    
    // Use first 4 lines (or generate if less)
    const harsh1 = harshLines[0] || "You sound like you're trying to prove something.";
    const harsh2 = harshLines[1] || "People think you're privileged and out of touch.";
    const harsh3 = harshLines[2] || (hasPhoto ? "Your photos confirm the stereotype." : "Generic vibe. Been there, seen that.");
    const harsh4 = harshLines[3] || "Your words are forgettable. You blend into the noise.";
    
    return {
      harsh1,
      harsh2,
      harsh3,
      harsh4,
      positive: aiResult.whatPeopleLike,
      psychologicalInsight: "AI analysis reveals deeper patterns in your digital presence.",
      viralHook: VIRAL_HOOKS[Math.floor(Math.random() * VIRAL_HOOKS.length)]
    };
  };

  const handleInitialSubmit = async () => {
    if (!inputText.trim()) return;
    
    setIsAnalyzing(true);
    setShowLoadingAnimation(true);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    setShowLoadingAnimation(false);
    
    setStep('photo-upload');
    setIsAnalyzing(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Remove previous photo if exists
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const removePhoto = () => {
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handleFinalSubmit = async () => {
    if (!inputText.trim()) return;
    
    setIsAnalyzing(true);
    setShowLoadingAnimation(true);
    
    try {
      // Prepare photos array for Gemini
      const photos = photoFile ? [photoFile] : [];
      
      // Call Gemini AI
      const aiResult = await analyzeVibe(inputText, photos);
      
      // Convert AI result to original format
      const convertedResult = convertAIToOriginalFormat(aiResult, photos.length > 0);
      
      setResult(convertedResult);
      setStep('result');
      setIsRevealed(false);
      setVisibleTruths([false, false, false, false]);
      
      // Animate share count
      const newCount = shareCount + Math.floor(Math.random() * 100) + 50;
      setShareCount(newCount);
      
      // Stagger truth reveals
      setTimeout(() => setVisibleTruths([true, false, false, false]), 100);
      setTimeout(() => setVisibleTruths([true, true, false, false]), 300);
      setTimeout(() => setVisibleTruths([true, true, true, false]), 500);
      setTimeout(() => setVisibleTruths([true, true, true, true]), 700);
      
    } catch (error) {
      console.error("AI Analysis failed:", error);
      // Fallback to original mock data
      const lower = inputText.toLowerCase();
      const viralHook = VIRAL_HOOKS[Math.floor(Math.random() * VIRAL_HOOKS.length)];
      
      if (lower.includes('founder') || lower.includes('ceo') || lower.includes('startup')) {
        setResult({
          harsh1: "You sound like you're trying to prove something.",
          harsh2: "People think you're privileged and out of touch.",
          harsh3: photoFile ? "Your photos scream 'corporate retreat' not 'real founder'." : "Generic 'hustle' vibe. Been there, seen that.",
          harsh4: "Your passion comes off as performative.",
          positive: "You seem genuinely energetic and ambitious.",
          psychologicalInsight: "Your ambition reads as anxiety. People sense your desperation to be taken seriously.",
          viralHook
        });
      } else if (lower.includes('engineer') || lower.includes('developer') || lower.includes('code')) {
        setResult({
          harsh1: "You come across as competent but emotionally sterile.",
          harsh2: "People assume you'd rather talk to computers than humans.",
          harsh3: photoFile ? "Your photos confirm the 'basement coder' stereotype." : "Your personality feels like it's in beta mode.",
          harsh4: "You sound like every other tech bro trying to sound smart.",
          positive: "You seem reliable, logical, and genuinely skilled.",
          psychologicalInsight: "Your competence intimidates people. They mistake your focus for coldness.",
          viralHook
        });
      } else if (lower.includes('designer') || lower.includes('creative') || lower.includes('artist')) {
        setResult({
          harsh1: "You sound like you're trying too hard to be different.",
          harsh2: "People think you're all aesthetic, no substance.",
          harsh3: photoFile ? "Your photos are curated, not authentic." : "Your uniqueness feels calculated, not authentic.",
          harsh4: "Another creative soul lost in the algorithm.",
          positive: "You come across as sensitive, observant, and thoughtful.",
          psychologicalInsight: "Your creativity reads as instability. People envy your freedom but doubt your reliability.",
          viralHook
        });
      } else {
        setResult({
          harsh1: "You sound busy but completely directionless.",
          harsh2: "People think you're trying to figure it out in public.",
          harsh3: photoFile ? "Your photos say 'basic' louder than your bio." : "Generic 'figuring it out' vibes. Easy to scroll past.",
          harsh4: "Your words are forgettable. You blend into the noise.",
          positive: "You come across as genuine, honest, and self-aware.",
          psychologicalInsight: "Your authenticity is buried under clichés. People sense realness but can't find it.",
          viralHook
        });
      }
      
      setStep('result');
      setIsRevealed(false);
      setVisibleTruths([false, false, false, false]);
      
      // Animate share count
      const newCount = shareCount + Math.floor(Math.random() * 100) + 50;
      setShareCount(newCount);
      
      // Stagger truth reveals
      setTimeout(() => setVisibleTruths([true, false, false, false]), 100);
      setTimeout(() => setVisibleTruths([true, true, false, false]), 300);
      setTimeout(() => setVisibleTruths([true, true, true, false]), 500);
      setTimeout(() => setVisibleTruths([true, true, true, true]), 700);
    } finally {
      setIsAnalyzing(false);
      setShowLoadingAnimation(false);
    }
  };

  const handleReveal = () => {
    setIsRevealed(true);
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  // Generate share card
  const generateShareCard = async (): Promise<Blob | null> => {
    if (!result) return null;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    canvas.width = 1080;
    canvas.height = 1920;

    // Background
    const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    bgGradient.addColorStop(0, '#000000');
    bgGradient.addColorStop(0.5, '#1a0a2e');
    bgGradient.addColorStop(1, '#000000');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 52px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🧠 PSYCHOLOGICAL VIBE CHECK', canvas.width / 2, 120);

    // Viral hook
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 40px -apple-system, sans-serif';
    const wrapText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
      const words = text.split(' ');
      let line = '';
      let currentY = y;

      for (let word of words) {
        const testLine = line + word + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && line !== '') {
          ctx.fillText(line, x, currentY);
          line = word + ' ';
          currentY += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, x, currentY);
      return currentY + lineHeight;
    };

    let yPos = wrapText(result.viralHook, canvas.width / 2, 200, 900, 55);

    // Content box
    const boxY = yPos + 40;
    const boxHeight = 950;

    ctx.shadowColor = '#8b5cf6';
    ctx.shadowBlur = 60;
    ctx.fillStyle = 'rgba(15, 15, 20, 0.95)';
    ctx.fillRect(60, boxY, canvas.width - 120, boxHeight);
    ctx.shadowBlur = 0;

    const borderGradient = ctx.createLinearGradient(60, boxY, canvas.width - 60, boxY);
    borderGradient.addColorStop(0, '#ef4444');
    borderGradient.addColorStop(0.5, '#8b5cf6');
    borderGradient.addColorStop(1, '#06b6d4');
    ctx.strokeStyle = borderGradient;
    ctx.lineWidth = 6;
    ctx.strokeRect(60, boxY, canvas.width - 120, boxHeight);

    // Harsh truths
    yPos = boxY + 100;
    ctx.textAlign = 'center';
    
    const harshLines = [result.harsh1, result.harsh2, result.harsh3, result.harsh4];
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 42px -apple-system, sans-serif';
    
    harshLines.forEach((line, index) => {
      if (index > 0) {
        yPos += 25;
        ctx.fillStyle = 'rgba(139, 92, 246, 0.3)';
        ctx.fillRect(canvas.width / 2 - 100, yPos, 200, 2);
        yPos += 35;
      }
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 42px -apple-system, sans-serif';
      yPos = wrapText(line, canvas.width / 2, yPos, 880, 58);
    });

    // Positive reveal
    if (isRevealed) {
      yPos += 50;
      ctx.fillStyle = '#10b981';
      ctx.fillRect(200, yPos, canvas.width - 400, 4);
      yPos += 60;

      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 44px -apple-system, sans-serif';
      ctx.fillText('✓ HIDDEN TRUTH:', canvas.width / 2, yPos);
      
      yPos += 70;
      ctx.fillStyle = '#a7f3d0';
      ctx.font = 'bold 46px -apple-system, sans-serif';
      wrapText(result.positive.toUpperCase(), canvas.width / 2, yPos, 880, 60);
    }

    // CTA section
    const ctaY = canvas.height - 420;
    
    const ctaGradient = ctx.createLinearGradient(0, ctaY, 0, canvas.height);
    ctaGradient.addColorStop(0, 'rgba(139, 92, 246, 0.15)');
    ctaGradient.addColorStop(1, 'rgba(6, 182, 212, 0.15)');
    ctx.fillStyle = ctaGradient;
    ctx.fillRect(0, ctaY, canvas.width, 420);

    const accentGradient = ctx.createLinearGradient(0, ctaY, canvas.width, ctaY);
    accentGradient.addColorStop(0, '#ef4444');
    accentGradient.addColorStop(0.5, '#8b5cf6');
    accentGradient.addColorStop(1, '#06b6d4');
    ctx.fillStyle = accentGradient;
    ctx.fillRect(0, ctaY, canvas.width, 6);

    yPos = ctaY + 90;
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 58px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🤔 WHAT DO PEOPLE', canvas.width / 2, yPos);
    yPos += 70;
    ctx.fillText('REALLY THINK OF YOU?', canvas.width / 2, yPos);

    yPos += 100;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 46px -apple-system, sans-serif';
    ctx.fillText('Find out in 8 seconds:', canvas.width / 2, yPos);

    yPos += 80;
    
    // URL box
    const urlBox = { x: canvas.width / 2 - 220, y: yPos - 60, width: 440, height: 85 };
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 40;
    ctx.fillStyle = 'rgba(6, 182, 212, 0.2)';
    ctx.fillRect(urlBox.x, urlBox.y, urlBox.width, urlBox.height);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 4;
    ctx.strokeRect(urlBox.x, urlBox.y, urlBox.width, urlBox.height);
    ctx.fillStyle = '#22d3ee';
    ctx.font = 'bold 60px -apple-system, sans-serif';
    ctx.fillText(DOMAIN, canvas.width / 2, yPos + 5);

    // Convert to JPEG blob
    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.95);
    });
  };

  // Download function
  const handleDownload = async () => {
    const blob = await generateShareCard();
    if (!blob) return;
    downloadImage(blob);
  };

  // Share function - just image, no text
  const handleShare = async () => {
    const blob = await generateShareCard();
    if (!blob) return;

    const file = new File([blob], 'vibe-check.jpg', { type: 'image/jpeg' });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
        });
        setShareCount(prev => prev + 1);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          downloadImage(blob);
        }
      }
    } else {
      downloadImage(blob);
    }
  };

  const downloadImage = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vibe-check-${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShareCount(prev => prev + 1);
  };

  const resetApp = () => {
    setStep('input');
    setInputText('');
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoFile(null);
    setPhotoPreview(null);
    setResult(null);
    setIsRevealed(false);
    setVisibleTruths([false, false, false, false]);
  };

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  // Animate share count smoothly
  useEffect(() => {
    const difference = shareCount - displayShareCount;
    if (difference !== 0) {
      const increment = difference > 0 ? Math.ceil(difference / 20) : Math.floor(difference / 20);
      const timer = setTimeout(() => {
        setDisplayShareCount(prev => {
          const newVal = prev + increment;
          if ((increment > 0 && newVal >= shareCount) || (increment < 0 && newVal <= shareCount)) {
            return shareCount;
          }
          return newVal;
        });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [shareCount, displayShareCount]);

  useEffect(() => {
    const interval = setInterval(() => {
      setShareCount(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (step === 'input') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black text-white p-4">
        <div className="max-w-2xl mx-auto pt-8 md:pt-20">
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <div className="bg-gradient-to-r from-cyan-500/15 to-purple-500/15 border border-cyan-500/30 rounded-full px-4 py-2">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-cyan-400" />
                <span className="text-cyan-300 font-medium text-sm">
                  {shareCount.toLocaleString()}+ shares today
                </span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-500/15 to-pink-500/15 border border-purple-500/30 rounded-full px-4 py-2">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-purple-400" />
                <span className="text-purple-300 font-medium text-sm">Trending on Instagram</span>
              </div>
            </div>
          </div>

          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-black mb-4 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent leading-tight">
              What are people REALLY thinking?
            </h1>
            <p className="text-gray-400 text-xl mb-8 max-w-xl mx-auto">
              AI-powered brutal truth about how strangers perceive you
            </p>
            
            <div className="inline-flex items-center gap-4 mb-8">
              <div className="flex items-center gap-2">
                <Brain size={18} className="text-cyan-500" />
                <span className="text-gray-300">Gemini AI Analysis</span>
              </div>
              <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
              <div className="flex items-center gap-2">
                <Target size={18} className="text-purple-500" />
                <span className="text-gray-300">100% Anonymous</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition duration-500"></div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste your bio or describe yourself...
                
Example: 'Tech founder who posts about hiking and trying to figure life out'"
                className="relative w-full h-48 bg-zinc-900/80 backdrop-blur-xl border-2 border-zinc-800 rounded-2xl p-6 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none resize-none text-lg font-medium transition-all duration-300"
                maxLength={300}
              />
            </div>

            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 transition-all duration-500"
                style={{ width: `${Math.min(100, (inputText.length / 300) * 100)}%` }}
              ></div>
            </div>

            <button
              onClick={handleInitialSubmit}
              disabled={!inputText.trim() || isAnalyzing}
              className="w-full group relative overflow-hidden bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600 hover:from-cyan-600 hover:via-purple-700 hover:to-pink-700 disabled:from-gray-800 disabled:to-gray-900 disabled:cursor-not-allowed text-white font-black py-6 px-8 rounded-2xl text-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-2xl shadow-purple-500/20 hover:shadow-purple-500/30 cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <div className="relative">
                    <Loader2 className="animate-spin" size={28} />
                    {showLoadingAnimation && (
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 blur-xl animate-pulse"></div>
                    )}
                  </div>
                  <span className="animate-pulse">Preparing AI analysis...</span>
                </>
              ) : (
                <>
                  <Brain size={28} />
                  <span>Reveal my brutal truth</span>
                </>
              )}
            </button>

            <p className="text-center text-gray-500 text-sm">
              Powered by Gemini AI · No signup · Your secrets are safe
            </p>
          </div>

          <div className="mt-16 pt-8 border-t border-zinc-800">
            <p className="text-center text-gray-400 mb-4">People are sharing their results:</p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { emoji: '😳', text: '"Hit way too close"' },
                { emoji: '🤯', text: '"AI read my soul"' },
                { emoji: '👀', text: '"I feel exposed"' },
                { emoji: '🔥', text: '"This is viral"' },
              ].map((item, i) => (
                <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{item.emoji}</span>
                    <span className="text-sm text-gray-300">{item.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'photo-upload') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black text-white p-4">
        <div className="max-w-2xl mx-auto pt-8 md:pt-20">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Want more accuracy?
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 mb-6">
              Add a photo for AI visual analysis
            </p>
            <p className="text-lg text-gray-400 mb-2">Optional but highly recommended</p>
            <p className="text-sm text-gray-500">Gemini AI will analyze your visual vibe</p>
          </div>

          <div className="space-y-6">
            <label className="block cursor-pointer group">
              <div className="relative bg-zinc-900/50 backdrop-blur border-2 border-dashed border-zinc-700 hover:border-cyan-500 rounded-2xl p-6 md:p-8 transition-all group-hover:bg-zinc-800/30">
                {photoPreview ? (
                  <div>
                    <div className="relative aspect-square max-w-md mx-auto mb-6">
                      <img
                        src={photoPreview}
                        alt="Profile preview"
                        className="w-full h-full object-cover rounded-xl border-2 border-cyan-500/50"
                      />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          removePhoto();
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 shadow-lg transition-all"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className="text-center pt-4 border-t border-dashed border-zinc-700">
                      <p className="text-gray-400">
                        Photo ready for AI analysis
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <Upload className="mx-auto text-gray-500 group-hover:text-cyan-400 mb-4 transition-colors" size={48} />
                    <p className="text-xl font-semibold text-gray-300 mb-2">
                      Click to upload a photo
                    </p>
                    <p className="text-gray-500">
                      One photo is enough for AI analysis
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
            </label>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleFinalSubmit}
                disabled={isAnalyzing}
                className="flex-1 bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600 hover:from-cyan-600 hover:via-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-2xl text-lg transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>AI analyzing...</span>
                  </>
                ) : (
                  'Get my complete analysis →'
                )}
              </button>
              <button
                onClick={handleFinalSubmit}
                className="px-8 py-4 border-2 border-zinc-700 rounded-2xl text-gray-400 hover:text-white hover:border-zinc-500 transition-colors cursor-pointer"
              >
                Skip photo
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'result' && result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black text-white p-4">
        <div className="max-w-2xl mx-auto pt-8">
          <div className="relative bg-gradient-to-br from-zinc-900/90 via-zinc-800/50 to-zinc-900/90 backdrop-blur-xl rounded-3xl p-6 md:p-10 shadow-2xl border border-zinc-700/50 mb-8 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-purple-500 to-cyan-500"></div>
            
            <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 rounded-full px-4 py-1.5">
                  <div className="flex items-center gap-2">
                    <Brain size={16} className="text-cyan-400" />
                    <span className="text-cyan-300 font-semibold text-sm">PSYCHOLOGICAL ANALYSIS</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-full px-4 py-1.5">
                  <Heart size={18} className="text-pink-400 animate-pulse" />
                  <span className="text-pink-300 font-bold text-base tabular-nums">
                    {displayShareCount.toLocaleString()}
                  </span>
                  {shareCount > 20000 && (
                    <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse flex items-center gap-1">
                      <Zap size={10} className="fill-white" />
                      TRENDING
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 mb-10 bg-gradient-to-r from-red-500/10 via-red-500/15 to-red-500/10 border border-red-500/30 rounded-2xl p-4 animate-pulse">
              <AlertCircle size={24} className="text-red-400 flex-shrink-0 animate-pulse" />
              <p className="text-red-300 font-bold text-lg text-center tracking-wide">
                BRUTAL HONESTY MODE
              </p>
            </div>

            <div className="space-y-4 mb-10">
              <div 
                className={`relative rounded-xl p-6 transition-all duration-700 ease-out hover:scale-[1.02] hover:border-opacity-40 ${
                  visibleTruths[0] 
                    ? 'opacity-100 translate-y-0 bg-gradient-to-r from-red-500/5 via-transparent to-red-500/5 border border-red-500/20 animate-fade-in-up' 
                    : 'opacity-0 translate-y-4'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 rounded-xl opacity-50"></div>
                <p className="relative text-white text-2xl md:text-3xl leading-relaxed text-center font-medium">
                  {result.harsh1}
                </p>
              </div>

              <div 
                className={`relative rounded-xl p-6 transition-all duration-700 ease-out hover:scale-[1.02] hover:border-opacity-40 ${
                  visibleTruths[1] 
                    ? 'opacity-100 translate-y-0 bg-gradient-to-r from-orange-500/5 via-transparent to-orange-500/5 border border-orange-500/20 animate-fade-in-up delay-100' 
                    : 'opacity-0 translate-y-4'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/10 to-orange-500/0 rounded-xl opacity-50"></div>
                <p className="relative text-white text-2xl md:text-3xl leading-relaxed text-center font-medium">
                  {result.harsh2}
                </p>
              </div>

              <div 
                className={`relative rounded-xl p-6 transition-all duration-700 ease-out hover:scale-[1.02] hover:border-opacity-40 ${
                  visibleTruths[2] 
                    ? 'opacity-100 translate-y-0 bg-gradient-to-r from-purple-500/5 via-transparent to-purple-500/5 border border-purple-500/20 animate-fade-in-up delay-200' 
                    : 'opacity-0 translate-y-4'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 rounded-xl opacity-50"></div>
                <p className="relative text-white text-2xl md:text-3xl leading-relaxed text-center font-medium">
                  {result.harsh3}
                </p>
              </div>

              <div 
                className={`relative rounded-xl p-6 transition-all duration-700 ease-out hover:scale-[1.02] hover:border-opacity-40 ${
                  visibleTruths[3] 
                    ? 'opacity-100 translate-y-0 bg-gradient-to-r from-pink-500/5 via-transparent to-pink-500/5 border border-pink-500/20 animate-fade-in-up delay-300' 
                    : 'opacity-0 translate-y-4'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/0 via-pink-500/10 to-pink-500/0 rounded-xl opacity-50"></div>
                <p className="relative text-white text-2xl md:text-3xl leading-relaxed text-center font-medium">
                  {result.harsh4}
                </p>
              </div>
            </div>

            <div className="mb-8">
              {!isRevealed ? (
                <button
                  onClick={handleReveal}
                  className="w-full group relative overflow-hidden border-2 border-dashed border-zinc-600 hover:border-cyan-500 rounded-2xl p-6 transition-all duration-300 cursor-pointer bg-gradient-to-br from-zinc-800/30 to-zinc-900/30 hover:from-zinc-700/40 hover:to-zinc-800/40"
                  type="button"
                >
                  <div className="flex items-center justify-center gap-4">
                    <div className="relative">
                      <Lock size={28} className="text-gray-400 group-hover:text-cyan-400 transition-colors" />
                      <div className="absolute inset-0 bg-cyan-400 blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-300 group-hover:text-cyan-300 font-semibold text-xl transition-colors">
                        TAP TO REVEAL THE HIDDEN TRUTH
                      </p>
                      <p className="text-gray-500 text-sm mt-1">
                        What people secretly admire about you
                      </p>
                    </div>
                  </div>
                </button>
              ) : (
                <div className="relative overflow-hidden border-2 border-green-500/80 rounded-2xl p-8 bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-green-500/10 animate-fade-in-up">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/10 to-green-500/0 animate-pulse"></div>
                  <div className="relative text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-lg shadow-green-500/30 animate-zoom-in">
                      <Check size={32} className="text-white" />
                    </div>
                    <div className="animate-fade-in-up delay-200">
                      <p className="text-green-400 font-semibold text-sm uppercase tracking-wider mb-2">
                        ⚡️ THE HIDDEN TRUTH
                      </p>
                      <p className="text-green-300 font-bold text-3xl md:text-4xl leading-tight">
                        {result.positive}
                      </p>
                    </div>
                    <p className="text-green-500/80 text-base max-w-md mx-auto animate-fade-in-up delay-300">
                      {result.psychologicalInsight}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mb-6 space-y-4">
            <button
              onClick={handleShare}
              className="w-full group relative overflow-hidden bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600 hover:from-cyan-600 hover:via-purple-700 hover:to-pink-700 text-white font-black py-6 px-8 rounded-2xl text-lg transition-all duration-500 flex items-center justify-center gap-3 shadow-2xl shadow-purple-500/40 hover:shadow-purple-500/60 cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 -z-10"></div>
              <div className="relative z-10">
                <Share2 size={24} className="drop-shadow-lg group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className="relative z-10 drop-shadow-md tracking-wide">Share My Results</span>
              <div className="absolute top-2 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Sparkles size={16} className="text-white animate-pulse" />
              </div>
            </button>

            <button
              onClick={handleDownload}
              className="w-full group relative overflow-hidden bg-gradient-to-r from-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 text-white font-bold py-4 px-6 rounded-2xl text-base transition-all duration-300 flex items-center justify-center gap-2 border border-zinc-700 hover:border-zinc-600 cursor-pointer"
            >
              <Download size={20} />
              <span>Download Image</span>
            </button>
          </div>

          <div className="text-center">
            <button
              onClick={resetApp}
              className="border-2 border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/30 text-white font-semibold py-3 px-10 rounded-2xl transition-all duration-300 cursor-pointer"
            >
              Try another one
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}