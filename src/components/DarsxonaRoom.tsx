'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  VideoOff,
  ScreenShare,
  Mic,
  MicOff,
  PenTool,
  Eraser,
  Download,
  Trash2,
  Crown,
  Star,
  Users,
  Radio,
  Sparkles,
  Hand,
  CheckCircle2,
} from 'lucide-react';
import { UserProfile, UserPlan } from '@/types';

interface DarsxonaRoomProps {
  user: UserProfile;
  onOpenAuth: () => void;
  onNavigateToGroups?: () => void;
}

interface ClassroomItem {
  id: string;
  title: string;
  subject: string;
  speaker: string;
  speakerPlan: UserPlan;
  participantsCount: number;
  isLive: boolean;
  topic: string;
}

export default function DarsxonaRoom({
  user,
  onOpenAuth,
  onNavigateToGroups,
}: DarsxonaRoomProps) {
  // Rejimlar: 'camera' | 'whiteboard' | 'screen'
  const [activeMode, setActiveMode] = useState<'camera' | 'whiteboard' | 'screen'>('whiteboard');

  // Tanlangan xona
  const [selectedRoomId, setSelectedRoomId] = useState<string>('room-304');

  // Video va media oqimlari
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasRaisedHand, setHasRaisedHand] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);

  // Doska (Whiteboard) holatlari
  const [brushColor, setBrushColor] = useState('#ffffff');
  const [brushSize, setBrushSize] = useState(4);
  const [isEraser, setIsEraser] = useState(false);

  // AI assistent holati
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // VIP modal
  const [showVipModal, setShowVipModal] = useState(false);
  const [vipMessage, setVipMessage] = useState('');

  // Element ref lari
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cameraVideoRef = useRef<HTMLVideoElement | null>(null);
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  // Mavjud xonalar ro'yxati
  const rooms: ClassroomItem[] = [
    {
      id: 'room-304',
      title: '304-guruh: Dasturiy Injiniring',
      subject: 'Algoritmlar va Ma‘lumotlar Tuzilmasi',
      speaker: 'Yo‘ldoshev Jasur',
      speakerPlan: 'ultra',
      participantsCount: 24,
      isLive: true,
      topic: 'Dinamik dasturlash va Graf algoritmlari tahlili',
    },
    {
      id: 'room-cyber',
      title: 'Kiberxavfsizlik Laboratoriyasi',
      subject: 'Tarmoq Xavfsizligi',
      speaker: 'Abdullayev Sardor',
      speakerPlan: 'ultra',
      participantsCount: 16,
      isLive: true,
      topic: 'SSL / TLS Shifrlash protokollari amaliyoti',
    },
    {
      id: 'room-econ',
      title: 'Iqtisodiyot va Moliya Seminari',
      subject: 'Makroiqtisodiyot',
      speaker: 'Karimov Bobur',
      speakerPlan: 'premium',
      participantsCount: 19,
      isLive: false,
      topic: 'Bozor muvozanati va inflyatsiya hisob-kitoblari',
    },
    {
      id: 'room-ielts',
      title: 'IELTS Speaking & Academic Writing',
      subject: 'Ingliz tili',
      speaker: 'Malika Rahimova',
      speakerPlan: 'ultra',
      participantsCount: 31,
      isLive: false,
      topic: 'Task 2 Essay strukturasini doskada tahlil qilish',
    },
  ];

  const currentRoom = rooms.find((r) => r.id === selectedRoomId) || rooms[0];

  // Webkamerani yoqish/o'chirish (Ultra VIP imtiyozi)
  const handleToggleCamera = async () => {
    if (!user.isLoggedIn) {
      onOpenAuth();
      return;
    }
    if (user.plan !== 'ultra') {
      setVipMessage('Kamera orqali yuzma-yuz jonli video dars o‘tish faqat Ultra VIP tarifida mavjud!');
      setShowVipModal(true);
      return;
    }

    if (isCameraActive) {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((t) => t.stop());
        cameraStreamRef.current = null;
      }
      setIsCameraActive(false);
    } else {
      try {
        setLiveError(null);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: !isMuted,
        });
        cameraStreamRef.current = stream;
        if (cameraVideoRef.current) {
          cameraVideoRef.current.srcObject = stream;
        }
        setIsCameraActive(true);
      } catch (err: any) {
        setLiveError("Kameraga ulanishda xatolik yuz berdi: " + (err.message || 'Kamera topilmadi'));
      }
    }
  };

  // Ekranni ulashish (Screen sharing)
  const handleToggleScreenShare = async () => {
    if (!user.isLoggedIn) {
      onOpenAuth();
      return;
    }
    if (user.plan !== 'ultra') {
      setVipMessage('Ekranni ulashish (Screen Share) faqat Ultra VIP tarifida mavjud!');
      setShowVipModal(true);
      return;
    }

    if (isScreenSharing) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
        screenStreamRef.current = null;
      }
      setIsScreenSharing(false);
    } else {
      try {
        setLiveError(null);
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
        screenStreamRef.current = stream;
        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = stream;
        }
        setIsScreenSharing(true);

        stream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          screenStreamRef.current = null;
        };
      } catch (err: any) {
        setLiveError("Ekranni ulashish bekor qilindi yoki ruxsat berilmadi.");
      }
    }
  };

  // Video elementlarga stream biriktirish
  useEffect(() => {
    if (cameraStreamRef.current && cameraVideoRef.current) {
      cameraVideoRef.current.srcObject = cameraStreamRef.current;
    }
  }, [isCameraActive, activeMode]);

  useEffect(() => {
    if (screenStreamRef.current && screenVideoRef.current) {
      screenVideoRef.current.srcObject = screenStreamRef.current;
    }
  }, [isScreenSharing, activeMode]);

  // Tozalash
  useEffect(() => {
    return () => {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Doska (Canvas) o'lchami va foni
  useEffect(() => {
    if (activeMode === 'whiteboard' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        try {
          const pixel = ctx.getImageData(0, 0, 1, 1).data;
          if (pixel[3] === 0) {
            ctx.fillStyle = '#090d16';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
        } catch {
          ctx.fillStyle = '#090d16';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }
    }
  }, [activeMode]);

  // Doska chizish amallari
  const getCanvasCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const handleStartDraw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const coords = getCanvasCoordinates(e);
    if (!coords) return;
    isDrawingRef.current = true;
    lastPosRef.current = coords;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    ctx.arc(
      coords.x,
      coords.y,
      (isEraser ? brushSize * 3 : brushSize) / 2,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = isEraser ? '#090d16' : brushColor;
    ctx.fill();
  };

  const handleDraw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawingRef.current || !lastPosRef.current) return;
    const coords = getCanvasCoordinates(e);
    if (!coords) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(coords.x, coords.y);
    ctx.strokeStyle = isEraser ? '#090d16' : brushColor;
    ctx.lineWidth = isEraser ? brushSize * 4 : brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    lastPosRef.current = coords;
  };

  const handleStopDraw = () => {
    isDrawingRef.current = false;
    lastPosRef.current = null;
  };

  const handleClearBoard = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleDownloadBoard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `darsxona-doska-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // AI Dars Tushuntiruvchisi
  const handleAskAi = () => {
    if (!aiPrompt.trim()) return;
    setIsGeneratingAi(true);
    setTimeout(() => {
      setAiExplanation(
        `💡 **Mavzu bo‘yicha tushuntirish (${aiPrompt.trim()}):**\n\n` +
          `1. Asosiy tushuncha: Ushbu mavzu ta'lim tizimi va amaliy laboratoriyalarda eng ko'p qo'llaniladigan prinsiplarga asoslanadi.\n` +
          `2. Formulalar va misollar: Doskada chizilgan sxema bo'yicha kiruvchi argumentlarni tekshiring va natijani konspektga qayd eting.\n` +
          `3. Maslahat: Mavzuni to'liq mustahkamlash uchun mustaqil ish bo'limida 2-bobga kiritish tavsiya etiladi.`
      );
      setIsGeneratingAi(false);
    }, 1200);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5 animate-in fade-in duration-200">
      {/* Yuqori xabar va Xonalar boshqaruvi */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-600/10 via-purple-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-500 via-pink-500 to-indigo-600 p-0.5 shadow-lg shadow-red-500/20 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Radio size={24} className="text-red-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  Jonli Darsxona
                </h1>
                <span className="px-2.5 py-0.5 text-[10px] font-extrabold bg-red-500/20 text-red-400 rounded-full border border-red-500/30 animate-pulse flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> INTERAKTIV EFIR
                </span>
                {user.plan === 'ultra' ? (
                  <span className="px-2 py-0.5 text-[10px] font-extrabold bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/40 flex items-center gap-1">
                    <Crown size={12} className="text-amber-400" /> Ultra VIP Spiker
                  </span>
                ) : user.plan === 'premium' ? (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/40 flex items-center gap-1">
                    <Star size={12} className="text-amber-400" /> Premium Talaba
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-800 text-slate-300 rounded-full border border-slate-700">
                    Oddiy (Free) Ishtirokchi
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Webkamera orqali yuzma-yuz dars o‘ting, interaktiv doskada chizing yoki ekranni ulashing.
              </p>
            </div>
          </div>

          {/* Xona tanlash va Guruhlarga o'tish tugmasi */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
            >
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.isLive ? '🔴 ' : '⚪ '} {room.title}
                </option>
              ))}
            </select>

            {onNavigateToGroups && (
              <button
                onClick={onNavigateToGroups}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
              >
                <Users size={14} className="text-indigo-400" /> Guruhlarga o‘tish
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Xatolik xabari */}
      {liveError && (
        <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center justify-between">
          <span>{liveError}</span>
          <button onClick={() => setLiveError(null)} className="text-red-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Asosiy Dars Maydoni va Rejimlar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Rejim boshqaruv paneli */}
        <div className="p-3 sm:p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/60">
          {/* Rejim tablari */}
          <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveMode('whiteboard')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeMode === 'whiteboard'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <PenTool size={14} />
              <span>🎨 Interaktiv Doska</span>
            </button>

            <button
              onClick={() => setActiveMode('camera')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeMode === 'camera'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Video size={14} />
              <span>📷 Webkamera Darsi</span>
              {isCameraActive && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>}
            </button>

            <button
              onClick={() => setActiveMode('screen')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeMode === 'screen'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ScreenShare size={14} />
              <span>🖥️ Ekran Ulashish</span>
              {isScreenSharing && <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>}
            </button>
          </div>

          {/* Vositalar: Mikrofon, Kamera, Qo'l ko'tarish */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                isMuted
                  ? 'bg-red-500/10 border-red-500/30 text-red-400'
                  : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
              }`}
              title={isMuted ? 'Mikrofonni yoqish' : 'Mikrofonni o‘chirish'}
            >
              {isMuted ? <MicOff size={15} /> : <Mic size={15} />}
              <span className="hidden sm:inline">{isMuted ? 'O‘chiq' : 'Mikrofon'}</span>
            </button>

            <button
              onClick={handleToggleCamera}
              className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                isCameraActive
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
              }`}
              title="Kamerani yoqish/o‘chirish"
            >
              {isCameraActive ? <Video size={15} /> : <VideoOff size={15} />}
              <span className="hidden sm:inline">{isCameraActive ? 'Kamera faol' : 'Kamera'}</span>
            </button>

            <button
              onClick={() => setHasRaisedHand(!hasRaisedHand)}
              className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                hasRaisedHand
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 animate-bounce'
                  : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
              }`}
              title="Savol berish uchun qo‘l ko‘tarish"
            >
              <Hand size={15} />
              <span className="hidden sm:inline">{hasRaisedHand ? 'Qo‘l ko‘tarildi' : 'Qo‘l ko‘tarish'}</span>
            </button>
          </div>
        </div>

        {/* REJIM KONTENTI */}
        <div className="relative min-h-[460px] sm:min-h-[520px] bg-slate-950 flex flex-col items-center justify-center">
          {/* 1. INTERAKTIV DOSKA (WHITEBOARD) */}
          {activeMode === 'whiteboard' && (
            <div className="w-full h-full flex flex-col flex-1">
              {/* Doska menyusi */}
              <div className="w-full bg-slate-900 border-b border-slate-800 p-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setIsEraser(false)}
                    className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      !isEraser ? 'bg-emerald-600 text-white shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <PenTool size={14} /> Qalam
                  </button>
                  <button
                    onClick={() => setIsEraser(true)}
                    className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isEraser ? 'bg-amber-600 text-white shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Eraser size={14} /> O‘chirgich
                  </button>

                  {/* Ranglar palitrasi */}
                  {!isEraser && (
                    <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
                      {[
                        { color: '#ffffff', label: 'Oq' },
                        { color: '#ef4444', label: 'Qizil' },
                        { color: '#facc15', label: 'Sariq' },
                        { color: '#22c55e', label: 'Yashil' },
                        { color: '#38bdf8', label: 'Moviy' },
                        { color: '#c084fc', label: 'Binafsha' },
                      ].map((item) => (
                        <button
                          key={item.color}
                          onClick={() => setBrushColor(item.color)}
                          style={{ backgroundColor: item.color }}
                          className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                            brushColor === item.color ? 'scale-125 border-white shadow-md' : 'border-transparent hover:scale-110'
                          }`}
                          title={item.label}
                        />
                      ))}
                    </div>
                  )}

                  {/* Qalinlik sozlamasi */}
                  <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                    <span className="text-[11px] text-slate-400">Qalinlik:</span>
                    <input
                      type="range"
                      min="2"
                      max="20"
                      value={brushSize}
                      onChange={(e) => setBrushSize(Number(e.target.value))}
                      className="w-20 accent-emerald-500 cursor-pointer"
                    />
                    <span className="text-[11px] text-slate-400 font-mono w-4">{brushSize}</span>
                  </div>
                </div>

                {/* Tozalash va Yuklab olish */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClearBoard}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-red-500/20 hover:text-red-300 text-slate-300 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Doskani tozalash"
                  >
                    <Trash2 size={14} /> Tozalash
                  </button>
                  <button
                    onClick={handleDownloadBoard}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 transition-colors shadow cursor-pointer"
                    title="Konspektni rasm (PNG) qilib yuklab olish"
                  >
                    <Download size={14} /> Konspektni yuklash
                  </button>
                </div>
              </div>

              {/* Canvas doska maydoni */}
              <div className="flex-1 w-full bg-[#090d16] flex items-center justify-center p-2 relative overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={1400}
                  height={800}
                  onMouseDown={handleStartDraw}
                  onMouseMove={handleDraw}
                  onMouseUp={handleStopDraw}
                  onMouseLeave={handleStopDraw}
                  onTouchStart={handleStartDraw}
                  onTouchMove={handleDraw}
                  onTouchEnd={handleStopDraw}
                  className="w-full h-full max-h-[560px] object-contain rounded-2xl cursor-crosshair shadow-inner"
                  style={{ touchAction: 'none' }}
                />
              </div>
            </div>
          )}

          {/* 2. WEBKAMERA (VIDEO MA'RUZA) */}
          {activeMode === 'camera' && (
            <div className="w-full h-full flex-1 flex flex-col items-center justify-center p-4">
              {isCameraActive ? (
                <div className="relative w-full max-w-4xl h-[480px] bg-black rounded-3xl overflow-hidden border border-purple-500/30 shadow-2xl">
                  <video
                    ref={cameraVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-white text-xs font-bold flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                    <span>Jonli Webkamera Darsi (Spiker)</span>
                  </div>
                  <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md text-slate-300 text-xs">
                    Guruhdoshlarga yuzma-yuz video dars o‘tilmoqda
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 max-w-md mx-auto space-y-4">
                  <div className="w-20 h-20 rounded-3xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400 shadow-xl shadow-purple-500/10">
                    <Video size={40} />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white mb-1">Webkamera Hozir O‘chiq</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Ultra VIP talabalar kamerani yoqib, butun guruhga yuzma-yuz video dars o‘tishi mumkin.
                    </p>
                  </div>
                  <button
                    onClick={handleToggleCamera}
                    className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2 mx-auto cursor-pointer"
                  >
                    <Video size={16} /> 📷 Webkamerani Yoqish
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 3. EKRAN ULASHISH (SCREEN SHARING) */}
          {activeMode === 'screen' && (
            <div className="w-full h-full flex-1 flex flex-col items-center justify-center p-4">
              {isScreenSharing ? (
                <div className="relative w-full max-w-5xl h-[500px] bg-black rounded-3xl overflow-hidden border border-blue-500/30 shadow-2xl">
                  <video
                    ref={screenVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-white text-xs font-bold flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
                    <span>Taqdimot & Ekran ulashilmoqda</span>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 max-w-md mx-auto space-y-4">
                  <div className="w-20 h-20 rounded-3xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400 shadow-xl shadow-blue-500/10">
                    <ScreenShare size={40} />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white mb-1">Ekran Ulashilmagan</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Kompyuteringizdagi slaydlar, kod muharriri yoki konspektni talabalar ekranida ko‘rsatish uchun ulashing.
                    </p>
                  </div>
                  <button
                    onClick={handleToggleScreenShare}
                    className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 mx-auto cursor-pointer"
                  >
                    <ScreenShare size={16} /> 🖥️ Ekranni Ulashishni Boshlash
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Xona tafsilotlari va AI Dars Assistenti */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          <div className="lg:col-span-4 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">{currentRoom.title}</span>
              <span className="text-[10px] text-slate-400 font-medium">({currentRoom.participantsCount} nafar talaba)</span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              Spiker: <strong className="text-slate-200">{currentRoom.speaker}</strong> • {currentRoom.topic}
            </p>
          </div>

          {/* AI Dars Assistent qutisi */}
          <div className="lg:col-span-8 flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAskAi()}
                placeholder="Dars mavzusi bo‘yicha AI dan tezkor misol yoki savol so‘rang..."
                className="w-full px-4 py-2.5 text-xs rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <button
              onClick={handleAskAi}
              disabled={isGeneratingAi || !aiPrompt.trim()}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow cursor-pointer shrink-0"
            >
              <Sparkles size={14} className="text-amber-300" />
              <span>{isGeneratingAi ? 'Qidirilmoqda...' : 'AI Savol'}</span>
            </button>
          </div>
        </div>

        {/* AI Tushuntirishi natijasi */}
        {aiExplanation && (
          <div className="p-4 bg-indigo-950/30 border-t border-indigo-500/20 text-xs text-indigo-200 relative">
            <button
              onClick={() => setAiExplanation(null)}
              className="absolute top-2 right-2 text-indigo-400 hover:text-white"
            >
              ✕
            </button>
            <div className="whitespace-pre-line leading-relaxed max-w-4xl">{aiExplanation}</div>
          </div>
        )}
      </div>

      {/* 👑 VIP OGOHLANTIRISH MODALI */}
      {showVipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-purple-500/40 p-6 text-slate-100 shadow-2xl shadow-purple-500/20 text-center">
            <button
              onClick={() => setShowVipModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-purple-500/30">
              <Crown size={32} className="text-amber-300 animate-pulse" />
            </div>

            <h3 className="text-xl font-black text-white mb-2">Ultra VIP Imkoniyat</h3>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              {vipMessage || 'Kamera va Ekran ulashish orqali dars o‘tish Ultra VIP tarifida amalga oshiriladi.'}
            </p>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-2 text-xs mb-6">
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 size={14} className="text-purple-400 shrink-0" />
                <span><strong>👑 Ultra VIP:</strong> Jonli kamera, ekran ulashish, interaktiv doska, cheksiz slaydlar.</span>
              </div>
            </div>

            <button
              onClick={() => setShowVipModal(false)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
            >
              Tushunarli
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
