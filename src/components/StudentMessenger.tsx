'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Users,
  Video,
  VideoOff,
  ScreenShare,
  Mic,
  MicOff,
  Send,
  Plus,
  Search,
  Sparkles,
  Crown,
  Star,
  Shield,
  Radio,
  X,
  PhoneOff,
  CheckCircle2,
  Lock,
  Share2,
  PenTool,
  Eraser,
  Download,
  Trash2,
  Maximize2,
  UserPlus,
  LogOut,
  Compass,
  Check,
  ChevronLeft,
} from 'lucide-react';
import { UserProfile, StudyGroup, ChatMessage } from '@/types';

interface StudentMessengerProps {
  user: UserProfile;
  onOpenAuth: () => void;
  onNavigateToDarsxona?: () => void;
}

export default function StudentMessenger({ user, onOpenAuth, onNavigateToDarsxona }: StudentMessengerProps) {
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Guruhlar ko'rinishi: 'my' (a'zo bo'lgan guruhlarim) yoki 'discover' (barcha guruhlar & qo'shilish)
  const [groupTab, setGroupTab] = useState<'my' | 'discover'>('my');
  const [discoverGroups, setDiscoverGroups] = useState<StudyGroup[]>([]);
  const [isLoadingDiscover, setIsLoadingDiscover] = useState(false);

  // A'zo qo'shish modali
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [addMemberInput, setAddMemberInput] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [addMemberStatus, setAddMemberStatus] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  // Yangi guruh ochish modali
  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupCat, setNewGroupCat] = useState('IT & Dasturlash');
  const [newGroupIcon, setNewGroupIcon] = useState('🎓');

  // Jonli darsxona, Kamera, Doska & Ekran holatlari
  const [isLiveModalOpen, setIsLiveModalOpen] = useState(false);
  const [liveMode, setLiveMode] = useState<'camera' | 'whiteboard' | 'screen'>('camera');
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);

  // Doska (Whiteboard) holatlari
  const [brushColor, setBrushColor] = useState('#ffffff');
  const [brushSize, setBrushSize] = useState(4);
  const [isEraser, setIsEraser] = useState(false);

  // VIP ogohlantirish modali
  const [showVipUpgradeModal, setShowVipUpgradeModal] = useState(false);
  const [vipModalMessage, setVipModalMessage] = useState('');

  // Video va doska elementlari uchun ref
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);
  const mainCameraVideoRef = useRef<HTMLVideoElement | null>(null);
  const cameraVideoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  const screenStreamRef = useRef<MediaStream | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  // Dastlabki guruhlarni yuklash va davriy sinxronizatsiya
  useEffect(() => {
    fetchGroups();
    const interval = setInterval(() => {
      fetchGroups(true);
      if (activeGroupId) {
        fetchMessages(activeGroupId);
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [user.id, activeGroupId]);

  // Xabarlar kelganda ichki konteynerni pastga siljitish (sahifani siljitmasdan)
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Kamera oqimini video elementlarga biriktirish
  useEffect(() => {
    if (cameraStreamRef.current) {
      if (mainCameraVideoRef.current && mainCameraVideoRef.current.srcObject !== cameraStreamRef.current) {
        mainCameraVideoRef.current.srcObject = cameraStreamRef.current;
        mainCameraVideoRef.current.play().catch(() => {});
      }
      if (cameraVideoRef.current && cameraVideoRef.current.srcObject !== cameraStreamRef.current) {
        cameraVideoRef.current.srcObject = cameraStreamRef.current;
        cameraVideoRef.current.play().catch(() => {});
      }
    }
  }, [isCameraActive, liveMode, isLiveModalOpen]);

  // Ekran oqimini video elementga biriktirish
  useEffect(() => {
    if (screenStreamRef.current && screenVideoRef.current) {
      if (screenVideoRef.current.srcObject !== screenStreamRef.current) {
        screenVideoRef.current.srcObject = screenStreamRef.current;
        screenVideoRef.current.play().catch(() => {});
      }
    }
  }, [isScreenSharing, liveMode, isLiveModalOpen]);

  // Doska (Canvas) o'lchami va qorong'u foni
  useEffect(() => {
    if (liveMode === 'whiteboard' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        try {
          const pixel = ctx.getImageData(0, 0, 1, 1).data;
          if (pixel[3] === 0) {
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
        } catch (_err) {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }
    }
  }, [liveMode, isLiveModalOpen]);

  // Doska koordinatalarini hisoblash
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
    ctx.fillStyle = isEraser ? '#0f172a' : brushColor;
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
    ctx.strokeStyle = isEraser ? '#0f172a' : brushColor;
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
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleDownloadBoard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `jonli-dars-doska-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Guruhlarni olish (Faqat a'zo bo'lgan guruhlar)
  const fetchGroups = async (silent = false) => {
    if (!user.isLoggedIn || !user.id) {
      setGroups([]);
      setActiveGroupId(null);
      return;
    }

    try {
      const res = await fetch(`/api/messenger/groups?userId=${encodeURIComponent(user.id)}&mode=my`);
      const data = await res.json();
      if (data.success && data.groups) {
        setGroups(data.groups);
        if (data.groups.length > 0) {
          if (!activeGroupId || !data.groups.some((g: any) => g.id === activeGroupId)) {
            setActiveGroupId(data.groups[0].id);
          }
        } else {
          setActiveGroupId(null);
        }
      }
    } catch (err) {
      if (!silent) console.error('Failed to load groups:', err);
    }
  };

  // Tizimdagi barcha ochiq guruhlarni olish (Katalog orqali a'zo bo'lish uchun)
  const fetchDiscoverGroups = async () => {
    setIsLoadingDiscover(true);
    try {
      const res = await fetch('/api/messenger/groups?mode=all');
      const data = await res.json();
      if (data.success && data.groups) {
        setDiscoverGroups(data.groups);
      }
    } catch (err) {
      console.error('Katalogni yuklashda xatolik:', err);
    } finally {
      setIsLoadingDiscover(false);
    }
  };

  // Guruhga o'zi a'zo bo'lib qo'shilish
  const handleJoinGroup = async (groupId: string) => {
    if (!user.isLoggedIn || !user.id) {
      onOpenAuth();
      return;
    }

    try {
      const res = await fetch('/api/messenger/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'join',
          groupId,
          userId: user.id,
          userName: user.name,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchGroups();
        setActiveGroupId(groupId);
        setGroupTab('my');
      }
    } catch (err) {
      console.error('Guruhga qo‘shilishda xatolik:', err);
    }
  };

  // Guruhdan chiqish
  const handleLeaveGroup = async (groupId: string) => {
    if (!user.id) return;
    if (!confirm("Rostdan ham ushbu guruhdan chiqmoqchimisiz?")) return;

    try {
      const res = await fetch('/api/messenger/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'leave',
          groupId,
          userId: user.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchGroups();
      }
    } catch (err) {
      console.error('Guruhdan chiqishda xatolik:', err);
    }
  };

  // Guruhga boshqa talabani qo'shish
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGroupId || !addMemberInput.trim()) return;

    setIsAddingMember(true);
    setAddMemberStatus(null);
    try {
      const res = await fetch('/api/messenger/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_member',
          groupId: activeGroupId,
          targetQuery: addMemberInput.trim(),
          addedByName: user.name,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAddMemberStatus({ type: 'success', message: data.message });
        setAddMemberInput('');
        fetchGroups(true);
        fetchMessages(activeGroupId);
        setTimeout(() => {
          setIsAddMemberModalOpen(false);
          setAddMemberStatus(null);
        }, 1800);
      } else {
        setAddMemberStatus({ type: 'error', message: data.error || 'Qo‘shishda xatolik yuz berdi' });
      }
    } catch (err) {
      setAddMemberStatus({ type: 'error', message: 'Server bilan aloqa uzildi' });
    } finally {
      setIsAddingMember(false);
    }
  };

  // Xabarlarni olish
  const fetchMessages = async (groupId: string) => {
    try {
      const res = await fetch(`/api/messenger/messages?groupId=${groupId}`);
      const data = await res.json();
      if (data.success && data.messages) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  // Yangi guruh ochish (yaratuvchi avtomatik a'zo bo'ladi)
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    try {
      const res = await fetch('/api/messenger/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newGroupName,
          description: newGroupDesc,
          category: newGroupCat,
          avatarIcon: newGroupIcon,
          creatorId: user.id,
          creatorName: user.name,
        }),
      });
      const data = await res.json();
      if (data.success && data.group) {
        setGroups((prev) => [data.group, ...prev]);
        setActiveGroupId(data.group.id);
        setGroupTab('my');
        setIsNewGroupModalOpen(false);
        setNewGroupName('');
        setNewGroupDesc('');
      }
    } catch (err) {
      console.error('Failed to create group:', err);
    }
  };

  // Xabar yuborish
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    // Oddiy (Free) tarifda xabar yozish cheklangan
    if (!user.plan || user.plan === 'free') {
      setVipModalMessage('Guruhlarda xabar yozish va savol-javob qilish uchun Premium yoki Ultra VIP tarifi kerak!');
      setShowVipUpgradeModal(true);
      return;
    }

    setIsSending(true);
    try {
      const res = await fetch('/api/messenger/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: activeGroupId,
          senderId: user.id || 'current-user',
          senderName: user.name || 'Talaba',
          senderRole: user.plan === 'ultra' ? 'Ultra VIP Talaba' : 'Premium Talaba',
          senderPlan: user.plan,
          text: inputText,
        }),
      });
      const data = await res.json();
      if (data.success && data.message) {
        setMessages((prev) => [...prev, data.message]);
        setInputText('');
      } else if (data.requiresUpgrade) {
        setVipModalMessage(data.error);
        setShowVipUpgradeModal(true);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  // Ekran ulashish (Screen Share) - faqat Ultra VIP uchun
  const handleStartScreenShare = async () => {
    if (user.plan !== 'ultra') {
      setVipModalMessage('Ekraningizni boshqa talabalarga jonli share qilib dars tushuntirish faqat Ultra VIP tarifda mavjud!');
      setShowVipUpgradeModal(true);
      return;
    }

    try {
      setLiveError(null);
      if (isScreenSharing && screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
        screenStreamRef.current = null;
        setIsScreenSharing(false);
        return;
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      screenStreamRef.current = stream;
      setIsScreenSharing(true);
      setLiveMode('screen');

      // Agar foydalanuvchi brauzer tugmasi orqali share ni to'xtatsa
      stream.getVideoTracks()[0].onended = () => {
        setIsScreenSharing(false);
        screenStreamRef.current = null;
      };

      // Serverga efir holatini yuborish
      await fetch('/api/messenger/live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: activeGroupId,
          isLive: true,
          speaker: {
            name: user.name || 'Ultra VIP Talaba',
            plan: 'ultra',
            hasScreenShare: true,
            hasCamera: isCameraActive,
          },
        }),
      });
    } catch (err: unknown) {
      console.warn('Screen share cancelled or failed:', err);
      setLiveError('Ekran ulashish bekor qilindi yoki brauzer ruxsat bermadi.');
    }
  };

  // Kamera yoqish - faqat Ultra VIP uchun
  const handleToggleCamera = async () => {
    if (user.plan !== 'ultra') {
      setVipModalMessage('Kamerani yoqib o‘zingizni ko‘rsatib dars o‘tish faqat Ultra VIP tarifda mavjud!');
      setShowVipUpgradeModal(true);
      return;
    }

    try {
      setLiveError(null);
      if (isCameraActive && cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((t) => t.stop());
        cameraStreamRef.current = null;
        setIsCameraActive(false);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: true,
      });

      cameraStreamRef.current = stream;
      setIsCameraActive(true);
    } catch (err: unknown) {
      console.warn('Camera failed:', err);
      setLiveError('Webkamera yoki mikrofonga ulanishda xatolik yuz berdi. Brauzer sozlamalarida kameraga ruxsat berilganligini tekshiring.');
    }
  };

  // Mikrofon holatini o'zgartirish
  const handleToggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !newMuted;
      });
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !newMuted;
      });
    }
  };

  // Efirni to'liq to'xtatish
  const handleStopAllLive = async () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      cameraStreamRef.current = null;
    }
    setIsScreenSharing(false);
    setIsCameraActive(false);
    setIsLiveModalOpen(false);
    setLiveMode('camera');

    try {
      await fetch('/api/messenger/live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: activeGroupId,
          isLive: false,
        }),
      });
      fetchGroups();
    } catch (_err) {}
  };

  const activeGroup = groups.find((g) => g.id === activeGroupId);
  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full px-0 py-2 sm:py-2.5">
      {/* Sarlavha paneli */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              TalabaHub Darsxona <Sparkles className="text-indigo-400" size={22} />
            </h1>
            <span className="px-2 py-0.5 text-xs font-bold bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
              Guruhlar & Live
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Talabalar uchun Telegram uslubidagi guruhlar, savol-javoblar va Ultra VIP ekran share xonasi
          </p>
        </div>

        {/* Tarif holati nishoni */}
        <div className="flex items-center gap-3">
          {user.plan === 'ultra' ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold shadow-sm">
              <Crown size={15} className="text-amber-400 animate-pulse" />
              <span>Ultra VIP: Cheksiz yozishmalar & Ekran share faol</span>
            </div>
          ) : user.plan === 'premium' ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold shadow-sm">
              <Star size={15} className="text-amber-400" />
              <span>Premium: Guruhlarga to‘liq yozish huquqi faol</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 text-xs">
              <Lock size={14} className="text-amber-400" />
              <span>Oddiy (Free): Faqat o‘qish rejimi (Yozish uchun Premium kerak)</span>
            </div>
          )}
        </div>
      </div>

      {/* Asosiy Messenger oynasi (Ekran balandligiga moslashuvchan) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-12 h-[calc(100dvh-10rem)] sm:h-[calc(100vh-13rem)] min-h-[500px] max-h-[820px]">
        {/* Chap panel: Guruhlar ro'yxati (Telefonda guruh ochilganda yashiriladi) */}
        <div className={`md:col-span-4 border-r border-slate-800/80 flex-col bg-slate-950/60 ${activeGroup ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-3.5 border-b border-slate-800/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Users size={16} className="text-indigo-400" /> O‘quv Guruhlari
              </h2>
              <button
                onClick={() => setIsNewGroupModalOpen(true)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1 transition-all cursor-pointer"
                title="Yangi guruh ochish"
              >
                <Plus size={14} /> Guruh ochish
              </button>
            </div>

            {/* Tablar: Mening guruhlarim vs Guruhlar katalogi */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-semibold">
              <button
                onClick={() => setGroupTab('my')}
                className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                  groupTab === 'my'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Mening guruhlarim ({groups.length})
              </button>
              <button
                onClick={() => {
                  setGroupTab('discover');
                  fetchDiscoverGroups();
                }}
                className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  groupTab === 'discover'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Compass size={12} /> Barcha guruhlar
              </button>
            </div>

            {/* Qidiruv */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-500" size={14} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Guruh yoki yo‘nalish qidirish..."
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Guruhlar ro'yxati yoki Katalog */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40 p-2 space-y-1">
            {groupTab === 'my' ? (
              filteredGroups.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Users size={24} />
                  </div>
                  <p className="text-xs font-bold text-slate-200">Guruhlar mavjud emas</p>
                  <p className="text-[11px] text-slate-400 max-w-xs leading-relaxed">
                    Siz hali birorta guruhga a‘zo emassiz. Barcha guruhlarni ko‘rib qo‘shiling yoki o‘zingiz yangi guruh oching.
                  </p>
                  <div className="flex flex-col gap-2 pt-1 w-full max-w-xs">
                    <button
                      onClick={() => { setGroupTab('discover'); fetchDiscoverGroups(); }}
                      className="w-full px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow cursor-pointer transition-colors"
                    >
                      <Compass size={14} /> Guruhlar katalogi
                    </button>
                    <button
                      onClick={() => setIsNewGroupModalOpen(true)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer transition-colors"
                    >
                      <Plus size={14} /> Guruh ochish
                    </button>
                  </div>
                </div>
              ) : (
                filteredGroups.map((group) => {
                  const isActive = group.id === activeGroupId;
                  return (
                    <button
                      key={group.id}
                      onClick={() => setActiveGroupId(group.id)}
                      className={`w-full text-left p-3 rounded-2xl transition-all flex items-start gap-3 relative cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-indigo-900/50 to-purple-900/40 border border-indigo-500/30'
                          : 'hover:bg-slate-800/50 text-slate-300'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center text-xl shrink-0">
                        {group.avatarIcon || '📚'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-white truncate">{group.name}</h4>
                          {group.isLive && (
                            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold animate-pulse border border-red-500/30 shrink-0">
                              <Radio size={10} /> LIVE
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{group.description}</p>
                        <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-500 font-medium">
                          <span>{group.category}</span>
                          <span>•</span>
                          <span>{group.membersCount} ta talaba</span>
                        </div>
                      </div>
                    </button>
                  );
                })
              )
            ) : (
              /* Discover (Barcha guruhlar & Qo'shilish) */
              isLoadingDiscover ? (
                <div className="p-8 text-center text-xs text-slate-500">Guruhlar yuklanmoqda...</div>
              ) : discoverGroups.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">Hech qanday guruh topilmadi</div>
              ) : (
                discoverGroups
                  .filter((g) => !searchQuery || g.name.toLowerCase().includes(searchQuery.toLowerCase()) || g.category.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((group) => {
                    const isMember = Boolean(user.id && (group.memberIds?.includes(user.id) || group.creatorId === user.id));
                    return (
                      <div
                        key={group.id}
                        className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/60 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-lg shrink-0">
                            {group.avatarIcon || '📚'}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-white truncate">{group.name}</h4>
                            <p className="text-[10px] text-slate-400 truncate">{group.category} • {group.membersCount} a‘zo</p>
                          </div>
                        </div>

                        {isMember ? (
                          <span className="px-2.5 py-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-1 shrink-0">
                            <Check size={12} /> A‘zosiz
                          </span>
                        ) : (
                          <button
                            onClick={() => handleJoinGroup(group.id)}
                            className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shrink-0 shadow cursor-pointer"
                          >
                            Qo‘shilish
                          </button>
                        )}
                      </div>
                    );
                  })
              )
            )}
          </div>
        </div>

        {/* O'ng panel: Suhbat va Xabarlar (Telefonda faqat guruh tanlanganda chiqadi) */}
        {!activeGroup ? (
          <div className="md:col-span-8 hidden md:flex flex-col items-center justify-center text-center p-8 bg-slate-900/40 space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-slate-800/80 flex items-center justify-center text-slate-400 mb-2">
              <Users size={32} />
            </div>
            <h3 className="text-base font-bold text-white">Guruh tanlanmagan</h3>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Chap paneldagi guruhlardan birini tanlang yoki yangi o‘quv guruhiga a‘zo bo‘ling.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => { setGroupTab('discover'); fetchDiscoverGroups(); }}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow cursor-pointer"
              >
                Guruhlar katalogini ko‘rish
              </button>
            </div>
          </div>
        ) : (
          <div className="md:col-span-8 flex flex-col bg-slate-900/40">
            {/* Guruh tepasi */}
            <div className="p-3.5 sm:p-4 border-b border-slate-800/80 flex items-center justify-between gap-2 sm:gap-3 bg-slate-950/40">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                {/* Orqaga tugmasi (faqat telefonlarda) */}
                <button
                  onClick={() => setActiveGroupId(null)}
                  className="md:hidden p-2 -ml-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer shrink-0 border border-slate-700/60"
                  title="Guruhlarga qaytish"
                >
                  <ChevronLeft size={18} />
                  <span className="text-[11px] font-bold">Orqaga</span>
                </button>

                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xl shrink-0">
                  {activeGroup.avatarIcon || '📚'}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white truncate flex items-center gap-2">
                    {activeGroup.name}
                    {activeGroup.isLive && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse flex items-center gap-1">
                        <Radio size={10} /> Jonli efir
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-400 truncate">{activeGroup.description} • {activeGroup.membersCount} a‘zo</p>
                </div>
              </div>

              {/* Guruh vositalari: A'zo qo'shish & Jonli Darsxona & Guruhdan chiqish */}
              <div className="flex items-center gap-2 shrink-0">
                {/* A'zo qo'shish */}
                <button
                  onClick={() => setIsAddMemberModalOpen(true)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
                  title="Guruhga talaba qo‘shish"
                >
                  <UserPlus size={14} className="text-cyan-400" />
                  <span className="hidden sm:inline">A‘zo qo‘shish</span>
                </button>

                {/* Jonli Darsxona & Ekran Ulashish tugmasi */}
                <button
                  onClick={() => {
                    if (onNavigateToDarsxona) {
                      onNavigateToDarsxona();
                    } else {
                      setIsLiveModalOpen(true);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg cursor-pointer ${
                    activeGroup.isLive || isScreenSharing
                      ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-red-500/25 animate-pulse'
                      : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-500/20'
                  }`}
                >
                  <Video size={15} />
                  <span className="hidden lg:inline">
                    {activeGroup.isLive ? '🔴 Jonli Dars' : '📹 Jonli Darsxona'}
                  </span>
                </button>

                {/* Guruhdan chiqish */}
                <button
                  onClick={() => handleLeaveGroup(activeGroup.id)}
                  className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-red-500/10 hover:text-red-400 text-slate-400 text-xs transition-colors border border-slate-700/60 cursor-pointer"
                  title="Guruhdan chiqish"
                >
                  <LogOut size={14} />
                </button>
              </div>
            </div>

          {/* Xabarlar lentasi */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <MessageSquare size={36} className="text-slate-700 mb-2" />
                <p className="text-sm font-medium text-slate-400">Bu guruhda hali xabarlar yo‘q</p>
                <p className="text-xs text-slate-600 mt-1">Birinchi bo‘lib savol bering yoki darsni boshlang!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isUltra = msg.senderPlan === 'ultra';
                const isPremium = msg.senderPlan === 'premium';
                const isMe = msg.senderName === user.name;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[85%] ${
                      isMe ? 'ml-auto items-end' : 'mr-auto items-start'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <span className="text-xs font-bold text-slate-300">{msg.senderName}</span>
                      {isUltra && (
                        <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-0.5">
                          <Crown size={10} className="text-amber-400" /> Ultra VIP
                        </span>
                      )}
                      {isPremium && !isUltra && (
                        <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-0.5">
                          <Star size={10} className="text-amber-400" /> Premium
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                        isMe
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-sm shadow-md shadow-indigo-600/20'
                          : isUltra
                          ? 'bg-slate-800/90 border border-purple-500/30 text-slate-100 rounded-tl-sm'
                          : 'bg-slate-800/80 border border-slate-700/60 text-slate-200 rounded-tl-sm'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pastki xabar kiritish maydoni */}
          <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/60">
            {!user.plan || user.plan === 'free' ? (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-3 text-xs text-amber-300">
                <div className="flex items-center gap-2">
                  <Lock size={16} className="text-amber-400 shrink-0" />
                  <span>
                    <strong>Oddiy (Free) tarif:</strong> Guruhlarda xabar yozish uchun Premium yoki Ultra VIP kerak.
                  </span>
                </div>
                <button
                  onClick={() => {
                    setVipModalMessage('Guruhlarda yozish va savol-javob qilish uchun Premium yoki Ultra VIP tarifiga o‘ting!');
                    setShowVipUpgradeModal(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shrink-0 transition-colors"
                >
                  Tarifni oshirish
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Guruhga xabar yoki savol yozing..."
                  className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={isSending || !inputText.trim()}
                  className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition-all shadow-md shadow-indigo-600/30 active:scale-95"
                  title="Yuborish"
                >
                  <Send size={16} />
                </button>
              </form>
            )}
          </div>
        </div>
        )}
      </div>

      {/* 📹 JONLI DARSXONA (Kamera, Doska, Ekran - Ultra VIP) */}
      {isLiveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 text-slate-100 shadow-2xl flex flex-col max-h-[94vh] overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/20 shrink-0">
                  <Radio size={22} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 flex-wrap">
                    Jonli Darsxona (Interaktiv Video & Doska)
                    <span className="px-2 py-0.5 text-[10px] font-extrabold bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/40">
                      👑 ULTRA VIP
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Kamera orqali yuzma-yuz dars o‘ting, doskada mavzuni chizib tushuntiring yoki ekranni ulashing
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsLiveModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                title="Yopish"
              >
                <X size={20} />
              </button>
            </div>

            {/* Xatolik xabari */}
            {liveError && (
              <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center justify-between">
                <span>{liveError}</span>
                <button onClick={() => setLiveError(null)} className="text-red-400 hover:text-white">
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Rejim tanlash tugmalari (Tabs) */}
            <div className="flex items-center gap-2 p-1 bg-slate-950/80 rounded-2xl border border-slate-800/80 my-3 overflow-x-auto">
              <button
                onClick={() => setLiveMode('camera')}
                className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  liveMode === 'camera'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Video size={15} />
                <span>📷 Webkamera Darsi</span>
                {isCameraActive && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>}
              </button>

              <button
                onClick={() => setLiveMode('whiteboard')}
                className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  liveMode === 'whiteboard'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <PenTool size={15} />
                <span>🎨 Interaktiv Doska</span>
              </button>

              <button
                onClick={() => setLiveMode('screen')}
                className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  liveMode === 'screen'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <ScreenShare size={15} />
                <span>🖥️ Ekran Ulashish</span>
                {isScreenSharing && <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>}
              </button>
            </div>

            {/* Asosiy Video / Doska ko'rinishi */}
            <div className="flex-1 my-1 bg-slate-950 rounded-2xl border border-slate-800/80 overflow-hidden relative flex flex-col items-center justify-center min-h-[380px] select-none">
              {/* REJIM 1: WEBKAMERA (KATON VIDEO DARS) */}
              {liveMode === 'camera' && (
                isCameraActive ? (
                  <div className="relative w-full h-full flex items-center justify-center bg-black">
                    <video
                      ref={mainCameraVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full max-h-[500px] object-cover rounded-2xl transform -scale-x-100"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-white text-xs font-semibold flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                      <span>Jonli Webkamera Darsi (Spiker)</span>
                    </div>
                    <div className="absolute bottom-3 left-3 px-3 py-1 rounded-xl bg-black/70 backdrop-blur-md text-slate-300 text-xs">
                      Talabalarga yuzma-yuz dars tushuntirilmoqda
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-8 text-slate-400 space-y-4 max-w-md mx-auto">
                    <div className="w-20 h-20 rounded-3xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400 shadow-xl shadow-purple-500/10">
                      <Video size={40} />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white mb-1">Webkamera Hozir O‘chiq</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Ultra VIP talabalar kamerani yoqib, guruhdoshlariga yuzma-yuz video dars o‘tishi mumkin.
                      </p>
                    </div>
                    <button
                      onClick={handleToggleCamera}
                      className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2 mx-auto"
                    >
                      <Video size={16} /> 📷 Webkamerani Yoqish
                    </button>
                  </div>
                )
              )}

              {/* REJIM 2: INTERAKTIV DOSKA (WHITEBOARD) */}
              {liveMode === 'whiteboard' && (
                <div className="w-full h-full flex flex-col bg-[#0f172a]">
                  {/* Doska uskunalar paneli */}
                  <div className="w-full bg-slate-900/95 border-b border-slate-800 p-2 sm:p-2.5 flex flex-wrap items-center justify-between gap-2.5 text-xs z-10">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Qalam vs O'chirgich */}
                      <button
                        onClick={() => setIsEraser(false)}
                        className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                          !isEraser
                            ? 'bg-emerald-600 text-white shadow'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        <PenTool size={14} /> Qalam
                      </button>
                      <button
                        onClick={() => setIsEraser(true)}
                        className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                          isEraser
                            ? 'bg-amber-600 text-white shadow'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        <Eraser size={14} /> O‘chirgich
                      </button>

                      {/* Ranglar */}
                      {!isEraser && (
                        <div className="flex items-center gap-1.5 pl-2 border-l border-slate-700">
                          {[
                            { color: '#ffffff', label: 'Oq (Bo‘r)' },
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
                              className={`w-5 h-5 rounded-full border-2 transition-transform ${
                                brushColor === item.color
                                  ? 'scale-125 border-white shadow-md'
                                  : 'border-transparent hover:scale-110 opacity-80'
                              }`}
                              title={item.label}
                            />
                          ))}
                        </div>
                      )}

                      {/* Qalinlik */}
                      <div className="flex items-center gap-1 pl-2 border-l border-slate-700">
                        <span className="text-[10px] text-slate-400">Qalinlik:</span>
                        {[2, 4, 8, 14].map((size) => (
                          <button
                            key={size}
                            onClick={() => setBrushSize(size)}
                            className={`w-6 h-6 rounded-lg text-[10px] font-bold flex items-center justify-center transition-all ${
                              brushSize === size ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Doskani tozalash va saqlash */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleClearBoard}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-red-600/80 text-slate-300 hover:text-white transition-all flex items-center gap-1 font-semibold text-[11px]"
                        title="Doskani tozalash"
                      >
                        <Trash2 size={13} /> Tozalash
                      </button>
                      <button
                        onClick={handleDownloadBoard}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/30 transition-all flex items-center gap-1 font-semibold text-[11px]"
                        title="Doskani rasm qilib yuklab olish"
                      >
                        <Download size={13} /> Saqlash (PNG)
                      </button>
                    </div>
                  </div>

                  {/* Doska chizish maydoni */}
                  <div className="w-full flex-1 relative bg-slate-950 overflow-hidden cursor-crosshair flex items-center justify-center">
                    <canvas
                      ref={canvasRef}
                      width={1400}
                      height={750}
                      onMouseDown={handleStartDraw}
                      onMouseMove={handleDraw}
                      onMouseUp={handleStopDraw}
                      onMouseLeave={handleStopDraw}
                      onTouchStart={handleStartDraw}
                      onTouchMove={handleDraw}
                      onTouchEnd={handleStopDraw}
                      className="w-full h-full max-h-[500px] object-contain touch-none bg-[#0f172a]"
                    />
                    <div className="absolute top-2 left-3 pointer-events-none text-[10px] text-slate-500 font-mono bg-slate-950/60 px-2 py-0.5 rounded backdrop-blur-sm">
                      🎨 Doskada sichqoncha yoki sensor bilan formulalar va mavzularni chizing
                    </div>
                  </div>
                </div>
              )}

              {/* REJIM 3: EKRAN ULASHISH */}
              {liveMode === 'screen' && (
                isScreenSharing ? (
                  <div className="relative w-full h-full flex items-center justify-center bg-black">
                    <video
                      ref={screenVideoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full max-h-[500px] object-contain bg-black"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-white text-xs font-semibold flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                      <span>Ekran Ulashilmoqda (Jonli)</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-8 text-slate-400 space-y-4 max-w-md mx-auto">
                    <div className="w-20 h-20 rounded-3xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400 shadow-xl shadow-blue-500/10">
                      <ScreenShare size={40} />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white mb-1">Ekran Namoyishi Faol Emas</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Ultra VIP foydalanuvchilar o‘z kompyuter ekranini, Gamma slaydlarini yoki kod muhitini guruhdagi barcha talabalarga jonli ulashishi mumkin.
                      </p>
                    </div>
                    {user.plan === 'ultra' ? (
                      <button
                        onClick={handleStartScreenShare}
                        className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 mx-auto"
                      >
                        <ScreenShare size={16} /> 🖥️ Hozir Ekranni Share Qilish
                      </button>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                        <Lock size={14} /> Ekran ulashish faqat Ultra VIP tarifda ishlaydi
                      </div>
                    )}
                  </div>
                )
              )}

              {/* Kamera kichik oynasi (Picture-in-picture) - Doska yoki Ekran ko'rilayotganda */}
              {isCameraActive && liveMode !== 'camera' && (
                <div className="absolute bottom-4 right-4 w-48 h-32 rounded-2xl overflow-hidden border-2 border-indigo-500 shadow-2xl bg-black z-20 group">
                  <video
                    ref={cameraVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                  <span className="absolute top-1.5 left-2 px-2 py-0.5 text-[9px] font-bold bg-black/70 backdrop-blur-sm text-white rounded-md flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Siz (Kamera)
                  </span>
                  <button
                    onClick={() => setLiveMode('camera')}
                    className="absolute bottom-1.5 right-1.5 px-2 py-1 text-[9px] font-semibold bg-indigo-600/90 hover:bg-indigo-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shadow-md"
                    title="Kamerani to‘liq ekranga ochish"
                  >
                    <Maximize2 size={11} /> Kattalashtirish
                  </button>
                </div>
              )}
            </div>

            {/* Darsxona boshqaruv paneli */}
            <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Kamera tugmasi */}
                <button
                  onClick={handleToggleCamera}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    isCameraActive
                      ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  {isCameraActive ? <Video size={15} /> : <VideoOff size={15} />}
                  <span>{isCameraActive ? 'Kamerani o‘chirish' : '📷 Webkamerani yoqish'}</span>
                </button>

                {/* Doskaga o'tish tezkor tugmasi */}
                <button
                  onClick={() => setLiveMode('whiteboard')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    liveMode === 'whiteboard'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  <PenTool size={15} />
                  <span>🎨 Doska</span>
                </button>

                {/* Ekran share tugmasi */}
                <button
                  onClick={handleStartScreenShare}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    isScreenSharing
                      ? 'bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/30'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                >
                  <ScreenShare size={15} />
                  <span>{isScreenSharing ? 'Ekranni to‘xtatish' : '🖥️ Ekran ulashish'}</span>
                </button>

                {/* Ovoz tugmasi */}
                <button
                  onClick={handleToggleMute}
                  className={`p-2 rounded-xl text-xs font-bold transition-all ${
                    isMuted ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                  title={isMuted ? 'Mikrofonni yoqish' : 'Mikrofonni o‘chirish'}
                >
                  {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleStopAllLive}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <PhoneOff size={14} className="text-red-400" /> Darsdan chiqish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ➕ YANGI GURUH OCHISH MODALI */}
      {isNewGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 text-slate-100 shadow-2xl">
            <button
              onClick={() => setIsNewGroupModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Users size={18} className="text-indigo-400" /> Yangi O‘quv Guruhi Ochish
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Guruhdoshlaringiz va talabalar uchun yangi Telegram uslubidagi study room
            </p>

            <form onSubmit={handleCreateGroup} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Guruh nomi</label>
                <input
                  type="text"
                  required
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Masalan: 402-guruh Kiberxavfsizlik"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Yo‘nalish yoki Fan</label>
                <select
                  value={newGroupCat}
                  onChange={(e) => setNewGroupCat(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="IT & Dasturlash">💻 IT & Dasturlash</option>
                  <option value="Iqtisodiyot">📊 Iqtisodiyot va Moliya</option>
                  <option value="Xorijiy tillar">🇬🇧 Xorijiy tillar & IELTS</option>
                  <option value="Pedagogika">📚 Pedagogika & Ta'lim</option>
                  <option value="Tibbiyot">🩺 Tibbiyot va Salomatlik</option>
                  <option value="Umumiy">🎓 Umumiy guruh</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Qisqacha tavsif</label>
                <textarea
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  rows={2}
                  placeholder="Darslar va mustaqil ishlar muhokamasi..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Ikonka (Emoji)</label>
                <div className="flex gap-2">
                  {['💻', '📊', '🛡️', '🇬🇧', '📚', '⚡', '🚀'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewGroupIcon(emoji)}
                      className={`w-9 h-9 rounded-xl border text-base flex items-center justify-center transition-all ${
                        newGroupIcon === emoji
                          ? 'border-indigo-500 bg-indigo-500/20 scale-105'
                          : 'border-slate-800 bg-slate-950 hover:bg-slate-800'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold transition-all shadow-lg shadow-indigo-600/30"
                >
                  Guruhni Ochish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 👑 VIP TARIFF UPGRADE MODALI */}
      {showVipUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-purple-500/40 p-6 text-slate-100 shadow-2xl shadow-purple-500/20 text-center">
            <button
              onClick={() => setShowVipUpgradeModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-purple-500/30">
              <Crown size={32} className="text-amber-300 animate-pulse" />
            </div>

            <h3 className="text-xl font-black text-white mb-2">Ultra VIP & Premium Imkoniyat</h3>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              {vipModalMessage || 'Ushbu funksiya yuqori tarif egalari uchun mo‘ljallangan.'}
            </p>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-2 text-xs mb-6">
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                <span><strong>⭐ Premium:</strong> Guruhlarga to‘liq yozish, 15 ta slayd, 100 token.</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 size={14} className="text-purple-400 shrink-0" />
                <span><strong>👑 Ultra VIP:</strong> Ekran ulashish, Video kamera dars, cheksiz slaydlar.</span>
              </div>
            </div>

            <button
              onClick={() => setShowVipUpgradeModal(false)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all"
            >
              Tushunarli
            </button>
          </div>
        </div>
      )}

      {/* 👥 GURUHGA TALABA QO'SHISH MODALI */}
      {isAddMemberModalOpen && activeGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700/80 p-6 text-slate-100 shadow-2xl shadow-indigo-500/10">
            <button
              onClick={() => {
                setIsAddMemberModalOpen(false);
                setAddMemberStatus(null);
                setAddMemberInput('');
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <UserPlus size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Guruhga talaba qo‘shish</h3>
                <p className="text-xs text-slate-400 truncate max-w-[280px]">
                  {activeGroup.name}
                </p>
              </div>
            </div>

            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Talabaning telefon raqami yoki ID raqami
                </label>
                <input
                  type="text"
                  value={addMemberInput}
                  onChange={(e) => setAddMemberInput(e.target.value)}
                  placeholder="+998 90 123 45 67 yoki user-id"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-white text-xs outline-none transition-all placeholder:text-slate-600"
                  autoFocus
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Ro‘yxatdan o‘tgan talabaning telefon raqami yoki Telegram nomini kiriting.
                </p>
              </div>

              {addMemberStatus && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                    addMemberStatus.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-red-500/10 border-red-500/30 text-red-300'
                  }`}
                >
                  {addMemberStatus.type === 'success' ? (
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  ) : (
                    <X size={16} className="text-red-400 shrink-0" />
                  )}
                  <span>{addMemberStatus.message}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddMemberModalOpen(false);
                    setAddMemberStatus(null);
                    setAddMemberInput('');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isAddingMember || !addMemberInput.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs shadow-lg shadow-cyan-600/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  {isAddingMember ? (
                    <>Qidirilmoqda...</>
                  ) : (
                    <>
                      <UserPlus size={14} /> Qo‘shish
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
