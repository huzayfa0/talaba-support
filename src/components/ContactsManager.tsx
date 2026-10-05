'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  BookUser,
  User,
  Phone,
  Send,
  Sparkles,
  Crown,
  Star,
  Check,
  CheckCheck,
  ExternalLink,
  MessageSquare,
  BookmarkPlus,
  BookmarkCheck,
  Trash2,
  X,
  GraduationCap,
  Building,
  Users as UsersIcon,
  LogIn,
  RefreshCw,
  AlertTriangle,
  ArrowLeft,
  ChevronLeft,
} from 'lucide-react';
import { UserProfile, SavedContactEntry, DirectMessage } from '@/types';

interface ContactsManagerProps {
  user: UserProfile;
  onOpenAuth: () => void;
}

export default function ContactsManager({ user, onOpenAuth }: ContactsManagerProps) {
  // Qidiruv holatlari
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Kontaktlar va xabarlar
  const [contacts, setContacts] = useState<SavedContactEntry[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [selectedContact, setSelectedContact] = useState<SavedContactEntry | null>(null);

  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Profil va O'chirish modallari
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileModalUser, setProfileModalUser] = useState<any>(null);

  const [contactToDelete, setContactToDelete] = useState<SavedContactEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast bildirishnomasi
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Chat xabarlari maydoni refi (faqat ichki skrollni boshqarish uchun)
  const chatMessagesContainerRef = useRef<HTMLDivElement | null>(null);
  const isSwitchingContactRef = useRef(false);

  // Dastlabki kontaktlarni yuklash
  useEffect(() => {
    if (user.isLoggedIn && user.id) {
      loadContacts();
    }
  }, [user.isLoggedIn, user.id]);

  // Har 3 soniyada kontaktlar va ochiq chat xabarlarini yangilash
  useEffect(() => {
    if (!user.isLoggedIn || !user.id) return;

    const interval = setInterval(() => {
      loadContacts(true);
      if (selectedContact) {
        fetchMessages(selectedContact.targetUserId, true);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [user.isLoggedIn, user.id, selectedContact]);

  // Tanlangan kontakt o'zgarganda xabarlarni yuklash
  useEffect(() => {
    if (selectedContact && user.id) {
      isSwitchingContactRef.current = true;
      fetchMessages(selectedContact.targetUserId);
    }
  }, [selectedContact?.targetUserId, user.id]);

  // Xabarlar kelganda yoki chat ochilganda FAQAT chat maydoni ichini pastga siljitish
  // (element.scrollIntoView o'rniga faqat konteyner.scrollTop ishlatiladi - bu butun sahifani/oynani pastga tortib ketmaydi)
  useEffect(() => {
    const el = chatMessagesContainerRef.current;
    if (!el) return;

    if (isSwitchingContactRef.current) {
      el.scrollTop = el.scrollHeight;
      isSwitchingContactRef.current = false;
      return;
    }

    // Yangi xabar kelganda yoki yuborilganda faqat chat maydoni pastga yaqin bo'lsa pastga siljitish
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 250;
    if (isNearBottom) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  // Kontaktlar ro'yxatini yuklash
  const loadContacts = async (silent = false) => {
    if (!user.id) return;
    if (!silent) setIsLoadingContacts(true);
    try {
      const res = await fetch(`/api/contacts?userId=${encodeURIComponent(user.id)}`);
      const data = await res.json();
      if (data.success) {
        setContacts(data.contacts || []);
        if (selectedContact) {
          const updatedSelected = (data.contacts || []).find(
            (c: SavedContactEntry) => c.targetUserId === selectedContact.targetUserId
          );
          if (updatedSelected) {
            setSelectedContact(updatedSelected);
          }
        }
      }
    } catch (err) {
      console.error('Kontaktlarni yuklashda xatolik:', err);
    } finally {
      if (!silent) setIsLoadingContacts(false);
    }
  };

  // Shaxsiy xabarlarni yuklash (o'zgarish bo'lmasa qayta re-render qilmaydi)
  const fetchMessages = async (targetId: string, silent = false) => {
    if (!user.id) return;
    try {
      const res = await fetch(
        `/api/contacts/messages?userId=${encodeURIComponent(user.id)}&targetId=${encodeURIComponent(targetId)}`
      );
      const data = await res.json();
      if (data.success) {
        const newMsgs: DirectMessage[] = data.messages || [];
        setMessages((prev) => {
          if (prev.length === newMsgs.length) {
            const hasDiff = prev.some(
              (m, idx) => m.id !== newMsgs[idx]?.id || m.read !== newMsgs[idx]?.read
            );
            if (!hasDiff) return prev;
          }
          return newMsgs;
        });
      }
    } catch (err) {
      console.error('Xabarlarni yuklashda xatolik:', err);
    }
  };

  // Telefon raqami yoki ID orqali talabani qidirish
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'search', query: searchQuery.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.results || []);
      }
    } catch (err) {
      console.error('Qidiruvda xatolik:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Kontaktga saqlash
  const handleSaveContact = async (targetUser: any) => {
    if (!user.id) return;
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save',
          ownerId: user.id,
          targetUserId: targetUser.id || targetUser.targetUserId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Kontakt "Mening Kontaktlarim" ro‘yxatiga saqlandi! ⭐');
        await loadContacts();
      }
    } catch (err) {
      console.error('Kontaktni saqlashda xatolik:', err);
    }
  };

  // Kontakt va barcha xabarlarni butunlay o'chirish
  const handleConfirmDelete = async () => {
    if (!user.id || !contactToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch(
        `/api/contacts?ownerId=${encodeURIComponent(user.id)}&targetUserId=${encodeURIComponent(
          contactToDelete.targetUserId
        )}`,
        { method: 'DELETE' }
      );
      const data = await res.json();

      if (data.success) {
        showToast(`${contactToDelete.targetName} bilan yozishmalar o‘chirildi! 🗑️`);

        if (selectedContact?.targetUserId === contactToDelete.targetUserId) {
          setSelectedContact(null);
          setMessages([]);
        }

        setContactToDelete(null);
        await loadContacts();
      } else {
        alert(data.error || 'O‘chirishda xatolik yuz berdi');
      }
    } catch (err) {
      console.error('O‘chirishda xatolik:', err);
      alert('Server bilan bog‘lanishda xatolik');
    } finally {
      setIsDeleting(false);
    }
  };

  // Qidiruvdan darhol suhbat boshlash
  const handleStartChatFromSearch = (targetUser: any) => {
    const displayName = targetUser.name;

    const contactEntry: SavedContactEntry = {
      ownerId: user.id || '',
      targetUserId: targetUser.id,
      targetName: displayName,
      targetPhone: targetUser.phone,
      targetEmail: targetUser.email,
      targetTelegram: targetUser.telegramUsername,
      targetUniversity: targetUser.university,
      targetFaculty: targetUser.faculty,
      targetGroup: targetUser.group,
      targetPlan: targetUser.plan,
      addedAt: new Date().toISOString(),
    };

    setSelectedContact(contactEntry);
    handleSaveContact(targetUser);
  };

  // Yangi shaxsiy xabar yuborish
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedContact || !user.id || isSendingMessage) return;

    const textToSend = inputText.trim();
    setInputText('');
    setIsSendingMessage(true);

    // Optimistik qo'shish
    const tempMsg: DirectMessage = {
      id: `temp-${Date.now()}`,
      senderId: user.id,
      senderName: user.name,
      senderPhone: user.phone,
      senderPlan: user.plan,
      receiverId: selectedContact.targetUserId,
      receiverName: selectedContact.targetName,
      receiverPhone: selectedContact.targetPhone,
      text: textToSend,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const res = await fetch('/api/contacts/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user.id,
          senderName: user.name,
          senderPhone: user.phone,
          senderPlan: user.plan || 'free',
          receiverId: selectedContact.targetUserId,
          receiverName: selectedContact.targetName,
          receiverPhone: selectedContact.targetPhone,
          text: textToSend,
        }),
      });

      const data = await res.json();
      if (data.success && data.message) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempMsg.id ? data.message : m))
        );
        loadContacts(true);
      }
    } catch (err) {
      console.error('Xabar jo‘natishda xatolik:', err);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Tarif nishonini chiqarish
  const renderPlanBadge = (plan?: string) => {
    if (plan === 'ultra') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
          <Crown size={11} className="text-amber-400" /> Ultra VIP
        </span>
      );
    }
    if (plan === 'premium') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
          <Star size={11} className="text-blue-400" /> Premium
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
        Oddiy (Free)
      </span>
    );
  };

  // Kontakt ro'yxatda bormi yo'qmi tekshirish
  const isTargetInContacts = (targetId: string) => {
    return contacts.some((c) => c.targetUserId === targetId);
  };

  // AGAR FOYDALANUVCHI TIZIMGA KIRMAGAN BO'LSA
  if (!user.isLoggedIn) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center animate-in fade-in duration-300">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-500/20 via-blue-500/20 to-indigo-500/20 border border-cyan-500/30 mx-auto flex items-center justify-center text-cyan-400 mb-6 shadow-xl shadow-cyan-500/10">
          <BookUser size={40} />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
          Kontaktlar & Shaxsiy Yozishmalar
        </h2>
        <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto leading-relaxed mb-8">
          Do‘stlaringiz va guruhdoshlaringizni telefon raqami orqali topish, ularning profilini ko‘rish hamda shaxsiy xabarlar almashish uchun avval tizimga kiring.
        </p>

        <div className="inline-flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={onOpenAuth}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <LogIn size={18} />
            <span>Tizimga Kirish / Ro‘yxatdan o‘tish</span>
          </button>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-3xl mx-auto">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-cyan-400 font-bold text-lg mb-1 block">🔍 Tezkor Qidiruv</span>
            <p className="text-xs text-slate-400">Telefon raqami yoki ID orqali talabalarni soniyalarda toping.</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-blue-400 font-bold text-lg mb-1 block">💬 Shaxsiy Chat</span>
            <p className="text-xs text-slate-400">Barcha tariflarda hech qanday cheklovlarsiz to‘g‘ridan-to‘g‘ri yozishing.</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-emerald-400 font-bold text-lg mb-1 block">🛡️ Xavfsiz & Maxfiy</span>
            <p className="text-xs text-slate-400">Parol va ma’lumotlar to‘liq himoyalangan, Telegram tasdiqli.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1536px] mx-auto px-3 sm:px-6 lg:px-8 py-6 relative">
      {/* Toast bildirishnomasi */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-slate-900 border border-cyan-500/40 text-cyan-200 text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5">
          <Sparkles size={16} className="text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sarlavha & Banner (Telefonda chat ochilganda yashiriladi) */}
      <div className={`mb-4 sm:mb-6 flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
        selectedContact ? 'hidden lg:flex' : 'flex'
      }`}>
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <BookUser size={22} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Kontaktlar & Shaxsiy Yozishmalar</span>
                <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  Barcha tariflar: Ochiq
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Talabani telefon raqami yoki ID orqali qidiring, profilini ko‘ring va to‘g‘ridan-to‘g‘ri yozishing.
              </p>
            </div>
          </div>
        </div>

        {/* Profil qisqacha ko'rinishi */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
          <User size={14} className="text-cyan-400" />
          <span>Siz: <b>{user.name}</b></span>
          {renderPlanBadge(user.plan)}
        </div>
      </div>

      {/* Asosiy 2 ustunli konteyner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100dvh-10rem)] sm:h-[calc(100vh-14rem)] min-h-[500px]">
        {/* CHAP USTUN: Qidiruv va Kontaktlar ro'yxati (Telefonda chat tanlanganda yashiriladi, Noutbukda doim ko'rinadi) */}
        <div className={`lg:col-span-5 flex-col bg-slate-900/70 backdrop-blur-md border border-slate-800 rounded-3xl overflow-hidden shadow-2xl transition-all duration-200 ${
          selectedContact ? 'hidden lg:flex' : 'flex animate-in fade-in slide-in-from-left-4 duration-200'
        }`}>
          {/* 1. Qidiruv paneli */}
          <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Telefon raqam yoki ID (+998...)"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/60 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 transition-all font-mono"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                      setHasSearched(false);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 shrink-0 cursor-pointer"
              >
                {isSearching ? <RefreshCw size={14} className="animate-spin" /> : 'Qidirish'}
              </button>
            </form>
          </div>

          {/* 2. Qidiruv natijalari (agar qidirilgan bo'lsa) */}
          {hasSearched && (
            <div className="p-3 bg-cyan-950/20 border-b border-cyan-500/20 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-[11px] font-bold text-cyan-300 mb-2 px-1">
                <span>Qidiruv natijalari ({searchResults.length}):</span>
                <button
                  onClick={() => {
                    setHasSearched(false);
                    setSearchResults([]);
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  Yopish
                </button>
              </div>

              {searchResults.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-900/60 text-center text-xs text-slate-400">
                  Hech qanday talaba topilmadi. Raqamni tekshirib qayta tering.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {searchResults.map((targetUser) => {
                    const alreadySaved = isTargetInContacts(targetUser.id);
                    return (
                      <div
                        key={targetUser.id}
                        className="p-3 rounded-2xl bg-slate-900/90 border border-slate-700/70 hover:border-cyan-500/50 transition-all flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {targetUser.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white text-xs truncate">
                                {targetUser.name}
                              </span>
                              {renderPlanBadge(targetUser.plan)}
                            </div>
                            <p className="text-[11px] text-slate-400 font-mono truncate">
                              {targetUser.phone || targetUser.email}
                            </p>
                            <p className="text-[10px] text-slate-500 truncate">
                              {targetUser.university}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Saqlash tugmasi */}
                          {alreadySaved ? (
                            <span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20 flex items-center gap-1">
                              <Check size={11} /> Saqlangan
                            </span>
                          ) : (
                            <button
                              onClick={() => handleSaveContact(targetUser)}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                              title="Mening Kontaktlarimga saqlash"
                            >
                              <BookmarkPlus size={13} />
                              <span className="hidden sm:inline">Saqlash</span>
                            </button>
                          )}

                          {/* Profil ko'rish */}
                          <button
                            onClick={() => {
                              setProfileModalUser(targetUser);
                              setIsProfileModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
                            title="Profilni ko‘rish"
                          >
                            <User size={14} />
                          </button>

                          {/* Yozish */}
                          <button
                            onClick={() => handleStartChatFromSearch(targetUser)}
                            className="px-2.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1 shadow cursor-pointer"
                          >
                            <MessageSquare size={13} />
                            <span>Yozish</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 3. Saqlangan Kontaktlar & Suhbatlar Ro'yxati */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-400 border-b border-slate-800/60 bg-slate-950/20">
              <span>Mening Kontaktlarim ({contacts.length})</span>
              <button
                onClick={() => loadContacts()}
                className="hover:text-white transition-colors cursor-pointer"
                title="Yangilash"
              >
                <RefreshCw size={13} className={isLoadingContacts ? 'animate-spin' : ''} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40 p-2 space-y-1">
              {contacts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
                  <BookUser size={36} className="text-slate-600 mb-1" />
                  <p className="text-xs font-medium">Hozircha kontaktlar yo‘q</p>
                  <p className="text-[11px] text-slate-600 max-w-xs">
                    Yuqoridagi qidiruv maydoniga guruhdosh yoki do‘stingizning telefon raqamini kiritib toping va suhbat boshlang.
                  </p>
                </div>
              ) : (
                contacts.map((contact) => {
                  const isSelected = selectedContact?.targetUserId === contact.targetUserId;
                  return (
                    <div
                      key={contact.targetUserId}
                      onClick={() => setSelectedContact(contact)}
                      className={`group p-3 rounded-2xl cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-gradient-to-r from-cyan-950/80 to-blue-950/60 border border-cyan-500/40 shadow-lg'
                          : 'hover:bg-slate-800/60 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow">
                          {contact.targetName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-white truncate">
                              {contact.targetName.replace(/\s*\(Saqlangan xabarlar\)/gi, '')}
                            </span>
                            {renderPlanBadge(contact.targetPlan)}
                          </div>
                          <p className="text-[11px] text-slate-300 truncate mt-1">
                            {contact.lastMessage || 'Suhbatni boshlang...'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          {contact.lastMessageTime && (
                            <span className="text-[10px] text-slate-500 font-mono block mb-1">
                              {new Date(contact.lastMessageTime).toLocaleTimeString('uz-UZ', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          )}
                          {contact.unreadCount && contact.unreadCount > 0 ? (
                            <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-cyan-500 text-black">
                              {contact.unreadCount}
                            </span>
                          ) : null}
                        </div>

                        {/* O'chirish tugmasi (Trash) */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setContactToDelete(contact);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-70 group-hover:opacity-100 cursor-pointer"
                          title="Kontakt va yozishmani o‘chirish"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* O'NG USTUN: Shaxsiy Chat Maydoni (Telefonda faqat kontakt tanlanganda ko'rinadi, Noutbukda doim yonida) */}
        <div className={`lg:col-span-7 flex-col bg-slate-900/70 backdrop-blur-md border border-slate-800 rounded-3xl overflow-hidden shadow-2xl transition-all duration-200 ${
          selectedContact ? 'flex animate-in fade-in slide-in-from-right-4 duration-200' : 'hidden lg:flex'
        }`}>
          {!selectedContact ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500 space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-slate-800/80 flex items-center justify-center text-slate-400 mb-2">
                <MessageSquare size={32} />
              </div>
              <h3 className="text-base font-bold text-white">Suhbatdoshni tanlang</h3>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                Chap paneldagi kontaktlardan birini bosing yoki yuqoridagi qidiruv orqali yangi insonning telefon raqamini kiritib unga shaxsiy xabar yuboring.
              </p>
            </div>
          ) : (
            <>
              {/* Chat Sarlavhasi (Header) */}
              <div className="p-3 sm:p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between gap-2 sm:gap-3">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  {/* Telegramdagi kabi Orqaga qaytish tugmasi (faqat telefonlarda chiqadi) */}
                  <button
                    onClick={() => setSelectedContact(null)}
                    className="lg:hidden p-2 -ml-1 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-cyan-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer shrink-0 border border-slate-700/60"
                    title="Kontaktlarga qaytish"
                  >
                    <ChevronLeft size={18} />
                    <span className="text-[11px] font-bold">Orqaga</span>
                  </button>

                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {selectedContact.targetName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white truncate">
                        {selectedContact.targetName.replace(/\s*\(Saqlangan xabarlar\)/gi, '')}
                      </span>
                      {renderPlanBadge(selectedContact.targetPlan)}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 truncate">
                      <span>{selectedContact.targetUniversity || "O'zbekiston Milliy Universiteti"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Kontaktlarga saqlash / Saqlangan holati */}
                  {isTargetInContacts(selectedContact.targetUserId) ? (
                    <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-300 text-xs font-semibold border border-emerald-500/20">
                      <BookmarkCheck size={13} /> Saqlangan
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSaveContact(selectedContact)}
                      className="px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold border border-amber-500/30 flex items-center gap-1 cursor-pointer transition-colors"
                      title="Mening Kontaktlarimga qo‘shish"
                    >
                      <BookmarkPlus size={13} />
                      <span className="hidden sm:inline">Saqlash</span>
                    </button>
                  )}

                  {/* Profilni ko'rish tugmasi */}
                  <button
                    onClick={() => {
                      setProfileModalUser({
                        name: selectedContact.targetName,
                        phone: selectedContact.targetPhone,
                        email: selectedContact.targetEmail,
                        telegramUsername: selectedContact.targetTelegram,
                        university: selectedContact.targetUniversity,
                        faculty: selectedContact.targetFaculty,
                        group: selectedContact.targetGroup,
                        plan: selectedContact.targetPlan,
                      });
                      setIsProfileModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
                  >
                    <User size={13} className="text-cyan-400" />
                    <span className="hidden sm:inline">Profil</span>
                  </button>

                  {/* Suhbatni o'chirish tugmasi */}
                  <button
                    onClick={() => setContactToDelete(selectedContact)}
                    className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    title="Ushbu suhbatni va kontaktni o‘chirish"
                  >
                    <Trash2 size={13} />
                    <span className="hidden sm:inline">O‘chirish</span>
                  </button>
                </div>
              </div>

              {/* Xabarlar ro'yxati (Scroll Area) */}
              <div
                ref={chatMessagesContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#050914]/60"
              >
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
                    <Sparkles size={28} className="text-cyan-400 mb-1" />
                    <p className="text-xs font-medium text-slate-300">
                      <b>{selectedContact.targetName}</b> bilan yozishmani boshlang!
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Xabarlar darhol yetkaziladi va xavfsiz saqlanadi.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderId === user.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3 text-xs leading-relaxed shadow-md ${
                            isMe
                              ? 'bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white rounded-br-none'
                              : 'bg-slate-800/90 border border-slate-700/60 text-slate-100 rounded-bl-none'
                          }`}
                        >
                          {!isMe && (
                            <span className="block font-bold text-[10px] text-cyan-300 mb-1">
                              {msg.senderName}
                            </span>
                          )}
                          <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                          <div
                            className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
                              isMe ? 'text-cyan-200' : 'text-slate-400'
                            }`}
                          >
                            <span>
                              {new Date(msg.createdAt).toLocaleTimeString('uz-UZ', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {isMe && (
                              <span>
                                {msg.read ? <CheckCheck size={12} className="text-emerald-300" /> : <Check size={12} />}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Xabar yozish paneli (Input bar) */}
              <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/80">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Xabaringizni yozing..."
                    className="flex-1 px-4 py-2.5 sm:py-3 rounded-2xl bg-slate-900 border border-slate-700/80 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim() || isSendingMessage}
                    className="p-2.5 sm:px-5 sm:py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/20 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Send size={15} />
                    <span className="hidden sm:inline">Yuborish</span>
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>

      {/* O'CHIRISHNI TASDIQLASH MODALI */}
      {contactToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-slate-900 border border-red-500/40 rounded-3xl p-6 shadow-2xl relative space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
              <AlertTriangle size={24} />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white">Suhbatni o‘chirish</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Haqiqatan ham <b>{contactToDelete.targetName}</b> bilan bo‘lgan barcha yozishmalar va kontaktni o‘chirmoqchimisiz?
              </p>
              <p className="text-[11px] text-slate-500">Ushbu amalni ortga qaytarib bo‘lmaydi.</p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setContactToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition-colors"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-600/30 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
              >
                {isDeleting ? 'O‘chirilmoqda...' : 'Ha, o‘chirish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TALABA PROFILI MODALI */}
      {isProfileModalOpen && profileModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/80 cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Profil bosh qismi */}
            <div className="text-center pt-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 mx-auto flex items-center justify-center text-white text-2xl font-black mb-3 shadow-lg">
                {profileModalUser.name?.charAt(0).toUpperCase() || 'T'}
              </div>
              <h3 className="text-lg font-bold text-white flex items-center justify-center gap-2">
                <span>{profileModalUser.name}</span>
                {renderPlanBadge(profileModalUser.plan)}
              </h3>
              <p className="text-xs text-cyan-400 font-mono mt-0.5">
                {profileModalUser.phone || 'Telefon kiritilmagan'}
              </p>
            </div>

            {/* Ma'lumotlar ro'yxati */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2.5 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Building size={15} className="text-cyan-400 shrink-0" />
                <span className="text-slate-400">OTM:</span>
                <span className="font-semibold text-white ml-auto">{profileModalUser.university || 'Aniqlanmagan'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <GraduationCap size={15} className="text-cyan-400 shrink-0" />
                <span className="text-slate-400">Fakultet:</span>
                <span className="font-semibold text-white ml-auto">{profileModalUser.faculty || 'Aniqlanmagan'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <UsersIcon size={15} className="text-cyan-400 shrink-0" />
                <span className="text-slate-400">Guruh:</span>
                <span className="font-semibold text-white ml-auto">{profileModalUser.group || 'Talaba'}</span>
              </div>
              {profileModalUser.telegramUsername && (
                <div className="flex items-center gap-2 text-slate-300 pt-1 border-t border-slate-800">
                  <Send size={15} className="text-cyan-400 shrink-0" />
                  <span className="text-slate-400">Telegram:</span>
                  <a
                    href={`https://t.me/${profileModalUser.telegramUsername.replace('@', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-cyan-400 hover:underline ml-auto flex items-center gap-1"
                  >
                    <span>@{profileModalUser.telegramUsername.replace('@', '')}</span>
                    <ExternalLink size={11} />
                  </a>
                </div>
              )}
            </div>

            {/* Harakatlar */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  handleStartChatFromSearch(profileModalUser);
                  setIsProfileModalOpen(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <MessageSquare size={14} />
                <span>Yozishmani boshlash</span>
              </button>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
