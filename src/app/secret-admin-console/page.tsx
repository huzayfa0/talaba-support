'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  User,
  Users,
  Crown,
  Sparkles,
  Zap,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  KeyRound,
  LogOut,
  RefreshCw,
  Eye,
  EyeOff,
  Coins,
  ArrowLeft,
  Settings,
  AlertTriangle,
  ShieldAlert,
  Send,
  Smartphone,
  Unlock,
  Sun,
  Moon,
  GraduationCap,
  Play,
  Film,
  BookOpen,
  Clock,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  X,
  UploadCloud,
  FolderPlus,
  FileVideo,
  HardDrive,
} from 'lucide-react';
import {
  AdminUserRecord,
  AdminStats,
  UserPlan,
  BlockedDeviceRecord,
  AdminSessionRecord,
  CourseSubject,
  CourseLesson,
} from '@/types';

export default function SecretAdminConsole() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Tungi / Kunduzgi mavzu holati
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const isDark = theme === 'dark';

  // Asosiy boshqaruv bo'limlari (Tabs)
  const [activeAdminTab, setActiveAdminTab] = useState<'users' | 'courses' | 'security' | 'backup'>('users');

  // Login formasi
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);

  // Admin Dashboard ma'lumotlari
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    freeUsers: 0,
    premiumUsers: 0,
    ultraUsers: 0,
    totalTokensIssued: 0,
  });
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Qidiruv va filtr
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlan, setFilterPlan] = useState<'all' | 'free' | 'premium' | 'ultra' | 'blocked'>('all');

  // Foydalanuvchilar parolini ko'rish va nusxalash
  const [unmaskedPasswords, setUnmaskedPasswords] = useState<Record<string, boolean>>({});
  const [copiedUserId, setCopiedUserId] = useState<string | null>(null);
  const [editingPasswordUser, setEditingPasswordUser] = useState<AdminUserRecord | null>(null);
  const [newStudentPassword, setNewStudentPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordUpdateMsg, setPasswordUpdateMsg] = useState<string | null>(null);

  // Video Darsliklar boshqaruvi
  const [courseSubjects, setCourseSubjects] = useState<CourseSubject[]>([]);
  const [courseLessons, setCourseLessons] = useState<CourseLesson[]>([]);
  const [selectedCourseSubjectId, setSelectedCourseSubjectId] = useState<string>('all');
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [isAddLessonModalOpen, setIsAddLessonModalOpen] = useState(false);
  const [newLessonCourseId, setNewLessonCourseId] = useState('');
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonVideoUrl, setNewLessonVideoUrl] = useState('');
  const [newLessonDuration, setNewLessonDuration] = useState('30');
  const [newLessonDesc, setNewLessonDesc] = useState('');
  const [isSubmittingLesson, setIsSubmittingLesson] = useState(false);
  const [previewLesson, setPreviewLesson] = useState<CourseLesson | null>(null);

  // Yangi Fan qo'shish holati
  const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false);
  const [newSubjectTitle, setNewSubjectTitle] = useState('');
  const [newSubjectInstructor, setNewSubjectInstructor] = useState('');
  const [newSubjectCategory, setNewSubjectCategory] = useState('Aniq Fanlar');
  const [newSubjectIcon, setNewSubjectIcon] = useState('🎓');
  const [newSubjectDesc, setNewSubjectDesc] = useState('');
  const [isSubmittingSubject, setIsSubmittingSubject] = useState(false);
  const [subjectActionMsg, setSubjectActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [lessonActionMsg, setLessonActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Video faylni to'g'ridan-to'g'ri yuklash holati
  const [videoUploadMode, setVideoUploadMode] = useState<'file' | 'url'>('file');
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [uploadProgressText, setUploadProgressText] = useState<string>('');

  // Admin Seanslari va Xavfsizlik
  const [adminSessions, setAdminSessions] = useState<AdminSessionRecord[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [blockedDevices, setBlockedDevices] = useState<BlockedDeviceRecord[]>([]);
  const [botTokenInput, setBotTokenInput] = useState('');
  const [botUsernameInput, setBotUsernameInput] = useState('TalabaAIBot');
  const [securitySaveMsg, setSecuritySaveMsg] = useState('');

  // Zaxira nusxa (Backup & Restore)
  const [backupStats, setBackupStats] = useState<{
    usersCount: number;
    subjectsCount: number;
    lessonsCount: number;
    groupsCount: number;
    directChatsCount: number;
  } | null>(null);
  const [backupConfig, setBackupConfig] = useState<any | null>(null);
  const [backupBotToken, setBackupBotToken] = useState('8222935062:AAH7vuajffGpGH-I0VvNPebbF41qVeWEgZ0');
  const [backupAdminChatId, setBackupAdminChatId] = useState('');
  const [backupSchedule, setBackupSchedule] = useState<'daily_midnight' | 'daily_custom' | 'every_12h' | 'every_6h' | 'weekly'>('daily_midnight');
  const [backupCustomTime, setBackupCustomTime] = useState('00:00');
  const [isAutoBackupEnabled, setIsAutoBackupEnabled] = useState(true);

  const [isLoadingBackup, setIsLoadingBackup] = useState(false);
  const [isDownloadingBackup, setIsDownloadingBackup] = useState(false);
  const [isSendingTelegramBackup, setIsSendingTelegramBackup] = useState(false);
  const [isRestoringBackup, setIsRestoringBackup] = useState(false);

  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restorePreview, setRestorePreview] = useState<any | null>(null);
  const [backupActionMsg, setBackupActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isRestoreConfirmModalOpen, setIsRestoreConfirmModalOpen] = useState(false);
  const [isResetConfirmModalOpen, setIsResetConfirmModalOpen] = useState(false);
  const [isResettingDatabase, setIsResettingDatabase] = useState(false);

  // Modallar
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [editingTokenUser, setEditingTokenUser] = useState<AdminUserRecord | null>(null);
  const [customTokenAmount, setCustomTokenAmount] = useState<number>(50);

  // Yangi foydalanuvchi qo'shish formasi
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserUniversity, setNewUserUniversity] = useState('Toshkent Axborot texnologiyalari universiteti');
  const [newUserFaculty, setNewUserFaculty] = useState('Dasturiy injiniring');
  const [newUserGroup, setNewUserGroup] = useState('304-guruh');
  const [newUserPlan, setNewUserPlan] = useState<UserPlan>('premium');
  const [newUserTokens, setNewUserTokens] = useState<number>(100);
  const [newUserNotes, setNewUserNotes] = useState('');

  // Admin Parolini o'zgartirish formasi
  const [currentPass, setCurrentPass] = useState('');
  const [newAdminLogin, setNewAdminLogin] = useState('admin');
  const [newAdminPass, setNewAdminPass] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState('');
  const [passwordChangeError, setPasswordChangeError] = useState('');

  // Mavzu almashtirish
  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    try {
      localStorage.setItem('talaba_admin_theme', nextTheme);
    } catch {}
  };

  // Dastlabki yuklanishda sessiyani tekshirish
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('talaba_admin_theme') as 'dark' | 'light';
      if (savedTheme) setTheme(savedTheme);

      const savedToken = sessionStorage.getItem('talaba_admin_session');
      if (savedToken) {
        setIsAuthenticated(true);
        fetchUsers();
        fetchSecurityData();
        fetchCoursesData();
        fetchAdminSessions();
        fetchBackupData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // Foydalanuvchilarni yuklash
  const fetchUsers = async () => {
    setIsLoadingData(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        setStats(data.stats || {
          totalUsers: 0,
          freeUsers: 0,
          premiumUsers: 0,
          ultraUsers: 0,
          totalTokensIssued: 0,
        });
      }
    } catch (error) {
      console.error('Foydalanuvchilarni yuklashda xatolik:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Xavfsizlik ma'lumotlarini yuklash
  const fetchSecurityData = async () => {
    try {
      const res = await fetch('/api/admin/security');
      if (res.ok) {
        const data = await res.json();
        setBlockedDevices(data.blockedDevices || []);
        if (data.settings) {
          setBotTokenInput(data.settings.telegramBotToken || '');
          setBotUsernameInput(data.settings.telegramBotUsername || 'TalabaAIBot');
        }
      }
    } catch (e) {
      console.error('Xavfsizlik ma‘lumotlarini yuklashda xatolik:', e);
    }
  };

  // Admin seanslarini yuklash
  const fetchAdminSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const res = await fetch('/api/admin/sessions');
      if (res.ok) {
        const data = await res.json();
        setAdminSessions(data.sessions || []);
      }
    } catch (e) {
      console.error('Admin seanslarini yuklashda xatolik:', e);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  // Admin seansini yakunlash
  const handleRevokeSession = async (sessionId: string) => {
    try {
      const res = await fetch('/api/admin/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'revoke', sessionId }),
      });
      if (res.ok) {
        await fetchAdminSessions();
      }
    } catch (e) {
      console.error('Sessiyani yakunlashda xatolik:', e);
    }
  };

  // Video darsliklar ma'lumotlarini yuklash
  const fetchCoursesData = async () => {
    setIsLoadingCourses(true);
    try {
      const res = await fetch('/api/courses');
      if (res.ok) {
        const data = await res.json();
        setCourseSubjects(data.subjects || []);
        setCourseLessons(data.lessons || []);
        if (data.subjects && data.subjects.length > 0 && !newLessonCourseId) {
          setNewLessonCourseId(data.subjects[0].id);
        }
      }
    } catch (e) {
      console.error('Darslarni yuklashda xatolik:', e);
    } finally {
      setIsLoadingCourses(false);
    }
  };

  // Login yuborish
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsSubmittingLogin(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        sessionStorage.setItem('talaba_admin_session', data.token);
        sessionStorage.setItem('talaba_admin_pwd', password.trim());
        setIsAuthenticated(true);
        fetchUsers();
        fetchSecurityData();
        fetchCoursesData();
        fetchAdminSessions();
        fetchBackupData();
      } else {
        setLoginError(data.error || 'Login yoki parol noto‘g‘ri');
      }
    } catch {
      setLoginError('Server bilan bog‘lanishda xatolik yuz berdi');
    } finally {
      setIsSubmittingLogin(false);
    }
  };

  // Chiqish
  const handleLogout = () => {
    sessionStorage.removeItem('talaba_admin_session');
    sessionStorage.removeItem('talaba_admin_pwd');
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
  };

  // Tarifni o'zgartirish (Oddiy / Premium / Ultra)
  const handleUpdatePlan = async (userId: string, newPlan: UserPlan, tokens?: number) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, plan: newPlan, tokens }),
      });

      if (res.ok) {
        const found = users.find((u) => u.id === userId);
        if (found) {
          const profile = {
            id: found.id,
            name: found.name,
            email: found.email,
            university: found.university,
            faculty: found.faculty,
            group: found.group,
            plan: newPlan,
            tokens: typeof tokens === 'number' ? tokens : newPlan === 'ultra' ? 999999 : newPlan === 'premium' ? 100 : 10,
            isLoggedIn: true,
            isBlocked: false,
          };
          localStorage.setItem('talaba_user_profile', JSON.stringify(profile));
        }
        await fetchUsers();
      } else {
        alert('Tarifni o‘zgartirishda xatolik yuz berdi');
      }
    } catch (e) {
      console.error(e);
      alert('Tarifni yangilab bo‘lmadi');
    }
  };

  // Talaba sifatida kirish
  const handleLoginAsUser = (targetUser: AdminUserRecord) => {
    const profile = {
      id: targetUser.id,
      name: targetUser.name,
      email: targetUser.email,
      university: targetUser.university,
      faculty: targetUser.faculty,
      group: targetUser.group,
      plan: targetUser.plan,
      tokens: targetUser.tokens,
      isLoggedIn: true,
      isBlocked: targetUser.isBlocked,
    };
    localStorage.setItem('talaba_user_profile', JSON.stringify(profile));
    window.location.href = '/';
  };

  // Bloklash / Faollashtirish
  const handleToggleBlock = async (user: AdminUserRecord) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          plan: user.plan,
          isBlocked: !user.isBlocked,
        }),
      });

      if (res.ok) {
        await fetchUsers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Tokenlarni qo'lda o'rnatish
  const handleSaveTokens = async () => {
    if (!editingTokenUser) return;
    await handleUpdatePlan(editingTokenUser.id, editingTokenUser.plan, customTokenAmount);
    setEditingTokenUser(null);
  };

  // Foydalanuvchini o'chirish
  const handleDeleteUser = async (userId: string, name: string) => {
    if (!confirm(`Haqiqatan ham "${name}"ni tizimdan o‘chirmoqchimisiz?`)) return;

    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchUsers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Yangi foydalanuvchi qo'shish
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newUserName,
          email: newUserEmail,
          university: newUserUniversity,
          faculty: newUserFaculty,
          group: newUserGroup,
          plan: newUserPlan,
          tokens: newUserPlan === 'ultra' ? 999999 : newUserTokens,
          customNotes: newUserNotes,
        }),
      });

      if (res.ok) {
        setIsAddUserOpen(false);
        setNewUserName('');
        setNewUserEmail('');
        setNewUserNotes('');
        await fetchUsers();
      } else {
        const d = await res.json();
        alert(d.error || 'Foydalanuvchi qo‘shilmadi');
      }
    } catch (e) {
      console.error(e);
      alert('Server bilan xatolik');
    }
  };

  // Talaba parolini yangilash (Admin tomonidan)
  const handleSaveStudentPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPasswordUser || !newStudentPassword.trim()) return;

    setIsUpdatingPassword(true);
    setPasswordUpdateMsg(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset_password',
          userId: editingPasswordUser.id,
          password: newStudentPassword.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPasswordUpdateMsg('Parol muvaffaqiyatli yangilandi!');
        await fetchUsers();
        setTimeout(() => {
          setEditingPasswordUser(null);
          setPasswordUpdateMsg(null);
          setNewStudentPassword('');
        }, 1200);
      } else {
        setPasswordUpdateMsg(data.error || 'Parolni yangilashda xatolik yuz berdi');
      }
    } catch {
      setPasswordUpdateMsg('Server bilan bog‘lanishda xatolik');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Talaba hisob ma'lumotlarini nusxalash
  const copyUserCredentials = (u: AdminUserRecord) => {
    const loginText = `Hurmatli ${u.name}! Sizning TalabaAI platformasidagi hisobingiz:
👤 Login: ${u.email}${u.phone ? ` (yoki ${u.phone})` : ''}
🔑 Parol: ${u.passwordHash || 'O‘rnatilmagan'}
🌐 Kirish: ${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}`;

    navigator.clipboard.writeText(loginText);
    setCopiedUserId(u.id);
    setTimeout(() => setCopiedUserId(null), 2500);
  };

  // Parol ko'rsatish/yashirish
  const togglePasswordMask = (userId: string) => {
    setUnmaskedPasswords((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  // Yangi video dars yuklash
  const handleAddLessonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingLesson(true);
    setLessonActionMsg(null);
    setUploadProgressText('');

    try {
      const adminToken = sessionStorage.getItem('talaba_admin_session') || '';
      const adminPwd = sessionStorage.getItem('talaba_admin_pwd') || '';
      let finalVideoUrl = newLessonVideoUrl.trim();

      // Agar kompyuterdan fayl yuklash tanlangan bo'lsa
      if (videoUploadMode === 'file') {
        if (!selectedVideoFile) {
          setLessonActionMsg({
            type: 'error',
            text: 'Iltimos, avval kompyuteringizdan video faylni tanlang!',
          });
          setIsSubmittingLesson(false);
          return;
        }

        const displayName = selectedVideoFile.name.length > 32
          ? selectedVideoFile.name.slice(0, 26) + '...' + selectedVideoFile.name.slice(selectedVideoFile.name.lastIndexOf('.'))
          : selectedVideoFile.name;
        setUploadProgressText(`«${displayName}» video fayli serverga yuklanmoqda...`);
        const formData = new FormData();
        formData.append('video', selectedVideoFile);

        const uploadRes = await fetch('/api/courses/upload', {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok || !uploadData.success) {
          setLessonActionMsg({
            type: 'error',
            text: uploadData.error || 'Video faylni yuklashda xatolik yuz berdi',
          });
          setIsSubmittingLesson(false);
          return;
        }

        finalVideoUrl = uploadData.videoUrl;
      } else {
        if (!finalVideoUrl) {
          setLessonActionMsg({
            type: 'error',
            text: 'Video havolasini kiritishingiz shart!',
          });
          setIsSubmittingLesson(false);
          return;
        }
      }

      setUploadProgressText('Dars ma‘lumotlari saqlanmoqda...');

      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_lesson',
          adminToken,
          adminPassword: adminPwd,
          courseId: newLessonCourseId,
          title: newLessonTitle,
          description: newLessonDesc,
          videoUrl: finalVideoUrl,
          durationMinutes: parseInt(newLessonDuration) || 30,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setLessonActionMsg({ type: 'success', text: 'Yangi video dars muvaffaqiyatli yuklandi va ochildi!' });
        setNewLessonTitle('');
        setNewLessonVideoUrl('');
        setNewLessonDesc('');
        setSelectedVideoFile(null);
        setUploadProgressText('');
        await fetchCoursesData();
        setTimeout(() => {
          setIsAddLessonModalOpen(false);
          setLessonActionMsg(null);
        }, 1500);
      } else {
        setLessonActionMsg({ type: 'error', text: data.error || 'Darsni yuklashda xatolik' });
      }
    } catch {
      setLessonActionMsg({ type: 'error', text: 'Server bilan bog‘lanishda xatolik' });
    } finally {
      setIsSubmittingLesson(false);
    }
  };

  // Yangi fan yaratish
  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectTitle.trim()) return;

    setIsSubmittingSubject(true);
    setSubjectActionMsg(null);

    try {
      const adminToken = sessionStorage.getItem('talaba_admin_session') || '';
      const adminPwd = sessionStorage.getItem('talaba_admin_pwd') || '';

      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_course',
          adminToken,
          adminPassword: adminPwd,
          title: newSubjectTitle.trim(),
          instructorName: newSubjectInstructor.trim() || 'O‘qituvchi',
          category: newSubjectCategory,
          icon: newSubjectIcon || '🎓',
          description: newSubjectDesc.trim() || 'Amaliy video darslik kursi',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubjectActionMsg({ type: 'success', text: `«${newSubjectTitle}» fani muvaffaqiyatli yaratildi!` });
        await fetchCoursesData();
        if (data.subject?.id) {
          setNewLessonCourseId(data.subject.id);
        }
        setTimeout(() => {
          setIsAddSubjectModalOpen(false);
          setSubjectActionMsg(null);
          setNewSubjectTitle('');
          setNewSubjectInstructor('');
          setNewSubjectDesc('');
        }, 1200);
      } else {
        setSubjectActionMsg({ type: 'error', text: data.error || 'Fanni yaratishda xatolik' });
      }
    } catch {
      setSubjectActionMsg({ type: 'error', text: 'Server bilan bog‘lanishda xatolik' });
    } finally {
      setIsSubmittingSubject(false);
    }
  };

  // Fanni o'chirish
  const handleDeleteSubject = async (courseId: string, title: string) => {
    if (!confirm(`Haqiqatan ham «${title}» fani va unga tegishli barcha darslarni o‘chirmoqchimisiz?`)) return;

    try {
      const adminToken = sessionStorage.getItem('talaba_admin_session') || '';
      const adminPwd = sessionStorage.getItem('talaba_admin_pwd') || '';

      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_course',
          adminToken,
          adminPassword: adminPwd,
          courseId,
        }),
      });

      if (res.ok) {
        await fetchCoursesData();
      } else {
        const d = await res.json();
        alert(d.error || 'Fanni o‘chirib bo‘lmadi');
      }
    } catch {
      alert('Xatolik yuz berdi');
    }
  };

  // Video darsni o'chirish
  const handleDeleteLesson = async (lessonId: string, title: string) => {
    if (!confirm(`Haqiqatan ham «${title}» darsini o‘chirmoqchimisiz?`)) return;

    try {
      const adminToken = sessionStorage.getItem('talaba_admin_session') || '';
      const adminPwd = sessionStorage.getItem('talaba_admin_pwd') || '';

      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_lesson',
          adminToken,
          adminPassword: adminPwd,
          lessonId,
        }),
      });

      if (res.ok) {
        await fetchCoursesData();
      } else {
        const d = await res.json();
        alert(d.error || 'Darsni o‘chirib bo‘lmadi');
      }
    } catch (e) {
      console.error(e);
      alert('Xatolik yuz berdi');
    }
  };

  // Qurilmani blokdan chiqarish
  const handleUnblockDevice = async (deviceId: string) => {
    try {
      const res = await fetch('/api/admin/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unblock', deviceId }),
      });
      if (res.ok) {
        await fetchSecurityData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Telegram bot sozlamalarini saqlash
  const handleSaveBotSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecuritySaveMsg('');
    try {
      const res = await fetch('/api/admin/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_settings',
          settings: {
            telegramBotToken: botTokenInput.trim(),
            telegramBotUsername: botUsernameInput.trim(),
          },
        }),
      });

      if (res.ok) {
        setSecuritySaveMsg('Telegram bot sozlamalari muvaffaqiyatli saqlandi!');
        setTimeout(() => setSecuritySaveMsg(''), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Admin parolini o'zgartirish
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeError('');
    setPasswordChangeSuccess('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: currentPass,
          newUsername: newAdminLogin,
          newPassword: newAdminPass,
        }),
      });

      const d = await res.json();
      if (res.ok && d.success) {
        setPasswordChangeSuccess('Admin login va paroli muvaffaqiyatli yangilandi!');
        sessionStorage.setItem('talaba_admin_pwd', newAdminPass.trim());
        setCurrentPass('');
        setNewAdminPass('');
        setTimeout(() => setIsSettingsOpen(false), 2000);
      } else {
        setPasswordChangeError(d.error || 'Parol yangilanmadi');
      }
    } catch {
      setPasswordChangeError('Server bilan xatolik');
    }
  };

  // Filtrlangan talabalar
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.group.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phone && u.phone.includes(searchQuery));

    if (!matchesSearch) return false;

    if (filterPlan === 'free') return u.plan === 'free' && !u.isBlocked;
    if (filterPlan === 'premium') return u.plan === 'premium' && !u.isBlocked;
    if (filterPlan === 'ultra') return u.plan === 'ultra' && !u.isBlocked;
    if (filterPlan === 'blocked') return u.isBlocked;

    return true;
  });

  // Zaxira ma'lumotlarini yuklash
  const fetchBackupData = async () => {
    setIsLoadingBackup(true);
    try {
      const res = await fetch('/api/admin/backup?action=config');
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setBackupConfig(data.config);
          if (data.config.telegramBotToken) setBackupBotToken(data.config.telegramBotToken);
          if (data.config.telegramAdminChatId) setBackupAdminChatId(data.config.telegramAdminChatId);
          if (data.config.schedule) setBackupSchedule(data.config.schedule);
          if (data.config.customTime) setBackupCustomTime(data.config.customTime);
          if (typeof data.config.isAutoBackupEnabled === 'boolean') {
            setIsAutoBackupEnabled(data.config.isAutoBackupEnabled);
          }
        }
        if (data.stats) {
          setBackupStats(data.stats);
        }
      }
    } catch (e) {
      console.error('Backup ma‘lumotlarini yuklashda xatolik:', e);
    } finally {
      setIsLoadingBackup(false);
    }
  };

  // 1. Zaxira nusxasini kompyuterga yuklab olish (Download)
  const handleDownloadBackup = async () => {
    setIsDownloadingBackup(true);
    setBackupActionMsg(null);
    try {
      const res = await fetch('/api/admin/backup?action=download');
      if (!res.ok) throw new Error('Yuklab olishda xatolik');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const dateStr = new Date().toISOString().slice(0, 10);
      a.download = `talaba_backup_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setBackupActionMsg({
        type: 'success',
        text: 'Zaxira nusxasi muvaffaqiyatli kompyuteringizga yuklab olindi!',
      });
    } catch (e: any) {
      setBackupActionMsg({
        type: 'error',
        text: e.message || 'Zaxira faylini yuklab olishda xatolik yuz berdi',
      });
    } finally {
      setIsDownloadingBackup(false);
    }
  };

  // 2. Telegram bot orqali zaxira yuborish
  const handleSendTelegramBackupNow = async () => {
    if (!backupAdminChatId.trim()) {
      setBackupActionMsg({
        type: 'error',
        text: 'Iltimos, avval o‘zingizning Telegram Chat ID raqamingizni kiriting!',
      });
      return;
    }

    if (backupAdminChatId.includes(':')) {
      setBackupActionMsg({
        type: 'error',
        text: 'Xatolik: Siz Chat ID maydoniga Bot Token kiritdingiz! Chat ID faqat raqamlardan iborat bo‘ladi (masalan: 542198765). Bot tokenini yuqoridagi "Telegram Bot Token" maydoniga kiriting.',
      });
      return;
    }

    setIsSendingTelegramBackup(true);
    setBackupActionMsg(null);

    try {
      const res = await fetch('/api/admin/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_telegram',
          chatId: backupAdminChatId.trim(),
          botToken: backupBotToken.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setBackupActionMsg({
          type: 'success',
          text: `Zaxira fayli Telegram botingiz orqali Chat ID (${backupAdminChatId}) ga muvaffaqiyatli yuborildi!`,
        });
        await fetchBackupData();
      } else {
        setBackupActionMsg({
          type: 'error',
          text: data.error || 'Telegramga yuborishda xatolik yuz berdi',
        });
      }
    } catch {
      setBackupActionMsg({
        type: 'error',
        text: 'Server bilan bog‘lanishda xatolik yuz berdi',
      });
    } finally {
      setIsSendingTelegramBackup(false);
    }
  };

  // 3. Zaxira sozlamalarini saqlash
  const handleSaveBackupSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setBackupActionMsg(null);
    try {
      const res = await fetch('/api/admin/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_config',
          config: {
            isAutoBackupEnabled,
            telegramBotToken: backupBotToken.trim(),
            telegramAdminChatId: backupAdminChatId.trim(),
            schedule: backupSchedule,
            customTime: backupCustomTime,
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setBackupActionMsg({
          type: 'success',
          text: 'Avtomatik zaxira va Telegram bot sozlamalari muvaffaqiyatli saqlandi!',
        });
        await fetchBackupData();
      } else {
        setBackupActionMsg({
          type: 'error',
          text: data.error || 'Sozlamalarni saqlashda xatolik',
        });
      }
    } catch {
      setBackupActionMsg({
        type: 'error',
        text: 'Serverga ulanishda xatolik',
      });
    }
  };

  // 4. Qayta tiklash faylini tanlash va tekshirish
  const handleRestoreFileSelected = async (file: File) => {
    setRestoreFile(file);
    setRestorePreview(null);
    setBackupActionMsg(null);

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed.stores) {
        setBackupActionMsg({
          type: 'error',
          text: 'Ushbu fayl yaroqli TalabaAI zaxira fayli emas ("stores" maydoni topilmadi).',
        });
        setRestoreFile(null);
        return;
      }
      setRestorePreview(parsed);
    } catch {
      setBackupActionMsg({
        type: 'error',
        text: 'Fayl formati noto‘g‘ri yoki buzilgan JSON fayli!',
      });
      setRestoreFile(null);
    }
  };

  // 5. Tiklashni amalga oshirish
  const handleExecuteRestore = async () => {
    if (!restorePreview) return;
    setIsRestoringBackup(true);
    setBackupActionMsg(null);

    try {
      const res = await fetch('/api/admin/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'restore',
          backupData: restorePreview,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setBackupActionMsg({
          type: 'success',
          text: 'Barcha ma‘lumotlar zaxira faylidan muvaffaqiyatli qayta tiklandi!',
        });
        setIsRestoreConfirmModalOpen(false);
        setRestoreFile(null);
        setRestorePreview(null);
        await Promise.all([
          fetchUsers(),
          fetchCoursesData(),
          fetchSecurityData(),
          fetchBackupData(),
        ]);
      } else {
        setBackupActionMsg({
          type: 'error',
          text: data.error || 'Qayta tiklashda xatolik yuz berdi',
        });
      }
    } catch {
      setBackupActionMsg({
        type: 'error',
        text: 'Server bilan bog‘lanishda xatolik yuz berdi',
      });
    } finally {
      setIsRestoringBackup(false);
    }
  };

  // 6. Test ma'lumotlarni tozalash (Toza baza boshlash)
  const handleResetDatabase = async () => {
    setIsResettingDatabase(true);
    setBackupActionMsg(null);
    try {
      const res = await fetch('/api/admin/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_database' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBackupActionMsg({
          type: 'success',
          text: data.message || 'Barcha test ma‘lumotlari muvaffaqiyatli tozalandi!',
        });
        setIsResetConfirmModalOpen(false);
        await Promise.all([
          fetchUsers(),
          fetchCoursesData(),
          fetchSecurityData(),
          fetchBackupData(),
        ]);
      } else {
        setBackupActionMsg({
          type: 'error',
          text: data.error || 'Bazani tozalashda xatolik yuz berdi',
        });
      }
    } catch {
      setBackupActionMsg({
        type: 'error',
        text: 'Server bilan bog‘lanishda xatolik yuz berdi',
      });
    } finally {
      setIsResettingDatabase(false);
    }
  };


  // Filtrlangan darslar
  const filteredLessons = courseLessons.filter((l) => {
    if (selectedCourseSubjectId === 'all') return true;
    return l.courseId === selectedCourseSubjectId;
  });

  if (authLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-slate-950 text-slate-400' : 'bg-slate-50 text-slate-600'}`}>
        <RefreshCw className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  // ------------------------------------------------------------------
  // 1. MAXFIY LOGIN EKRANI
  // ------------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#080d1a] flex items-center justify-center p-4 relative overflow-hidden select-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 p-0.5 shadow-xl shadow-indigo-600/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <ShieldCheck className="text-indigo-400" size={28} />
              </div>
            </div>
            <h1 className="text-xl font-black text-white tracking-wider">
              SYSTEM CONTROL GATE
            </h1>
            <p className="text-xs text-slate-400">
              TalabaAI Maxfiy Boshqaruv Markazi
            </p>
          </div>

          {loginError && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertTriangle size={16} className="shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <User size={14} className="text-indigo-400" /> Admin Logini
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Lock size={14} className="text-purple-400" /> Admin Paroli
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmittingLogin}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmittingLogin ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : (
                <>
                  <KeyRound size={16} />
                  <span>Xavfsiz Tizimga Kirish</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center">
            <a
              href="/"
              className="text-xs text-slate-500 hover:text-slate-300 flex items-center justify-center gap-1.5 transition-colors"
            >
              <ArrowLeft size={14} /> Asosiy saytga qaytish
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // 2. ADMIN BOSHQARUV PANELI (DASHBOARD)
  // ------------------------------------------------------------------
  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      isDark ? 'bg-[#090e1a] text-slate-100' : 'bg-slate-100 text-slate-800'
    }`}>
      {/* Top Header */}
      <header className={`sticky top-0 z-40 w-full border-b backdrop-blur-xl ${
        isDark ? 'border-slate-800 bg-slate-950/85' : 'border-slate-200 bg-white/90 shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <ShieldCheck className="text-white" size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-extrabold text-base tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Talaba<span className="text-indigo-500">AI</span> Admin Console
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                  Superadmin
                </span>
              </div>
              <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Talabalar, darsliklar va xavfsizlik boshqaruv markazi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tungi / Kunduzgi mavzu tugmasi */}
            <button
              onClick={handleToggleTheme}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-amber-300 hover:bg-slate-800'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 shadow-sm'
              }`}
              title={isDark ? "Kunduzgi rejimga o‘tish" : "Tungi rejimga o‘tish"}
            >
              {isDark ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-indigo-600" />}
              <span className="hidden sm:inline">{isDark ? 'Kunduzgi' : 'Tungi'}</span>
            </button>

            {/* Saytni ko'rish */}
            <a
              href="/"
              target="_blank"
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isDark
                  ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
                  : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700 shadow-sm'
              }`}
            >
              <ExternalLink size={14} /> <span className="hidden sm:inline">Saytni ko‘rish</span>
            </a>

            {/* Admin sozlamalari */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isDark
                  ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
                  : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700 shadow-sm'
              }`}
              title="Admin login/parolini o'zgartirish"
            >
              <Settings size={16} />
            </button>

            {/* Chiqish */}
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Admin paneldan chiqish"
            >
              <LogOut size={14} /> <span className="hidden sm:inline">Chiqish</span>
            </button>
          </div>
        </div>
      </header>

      {/* Asosiy Kontent */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        {/* Navigation Tabs */}
        <div className={`flex items-center gap-2 border-b pb-3 overflow-x-auto ${
          isDark ? 'border-slate-800' : 'border-slate-200'
        }`}>
          <button
            onClick={() => setActiveAdminTab('users')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeAdminTab === 'users'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                : isDark
                ? 'bg-slate-900 text-slate-400 hover:text-white'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-sm'
            }`}
          >
            <Users size={16} />
            <span>Talabalar & Tariflar</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeAdminTab === 'users' ? 'bg-indigo-950/60 text-indigo-200' : isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
            }`}>
              {users.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveAdminTab('courses');
              fetchCoursesData();
            }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeAdminTab === 'courses'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
                : isDark
                ? 'bg-slate-900 text-slate-400 hover:text-white'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-sm'
            }`}
          >
            <GraduationCap size={16} />
            <span>Video Darsliklar Boshqaruvi</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeAdminTab === 'courses' ? 'bg-emerald-950/60 text-emerald-200' : isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
            }`}>
              {courseLessons.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveAdminTab('security');
              fetchSecurityData();
              fetchAdminSessions();
            }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeAdminTab === 'security'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                : isDark
                ? 'bg-slate-900 text-slate-400 hover:text-white'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-sm'
            }`}
          >
            <ShieldAlert size={16} />
            <span>Admin Seanslari & Xavfsizlik</span>
            {adminSessions.filter((s) => s.isActive).length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeAdminTab === 'security' ? 'bg-purple-950/60 text-purple-200' : isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
              }`}>
                {adminSessions.filter((s) => s.isActive).length} faol seans
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveAdminTab('backup');
              fetchBackupData();
            }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeAdminTab === 'backup'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                : isDark
                ? 'bg-slate-900 text-slate-400 hover:text-white'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-sm'
            }`}
          >
            <HardDrive size={16} />
            <span>Zaxira Nusxa (Backup)</span>
          </button>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* TAB 1: TALABALAR VA TARIFLAR */}
        {/* ------------------------------------------------------------- */}
        {activeAdminTab === 'users' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Statistika Kartochkalari */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`p-5 rounded-3xl border flex items-center gap-4 transition-all ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                  <Users size={24} />
                </div>
                <div>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Jami Talabalar</p>
                  <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{stats.totalUsers}</p>
                </div>
              </div>

              <div className={`p-5 rounded-3xl border flex items-center gap-4 transition-all ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <Sparkles size={24} />
                </div>
                <div>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Premium A‘zolar</p>
                  <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{stats.premiumUsers}</p>
                </div>
              </div>

              <div className={`p-5 rounded-3xl border flex items-center gap-4 transition-all ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <Crown size={24} />
                </div>
                <div>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Ultra VIP A‘zolar</p>
                  <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{stats.ultraUsers}</p>
                </div>
              </div>

              <div className={`p-5 rounded-3xl border flex items-center gap-4 transition-all ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                  <Zap size={24} />
                </div>
                <div>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Oddiy (Bepul)</p>
                  <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{stats.freeUsers}</p>
                </div>
              </div>
            </div>

            {/* Boshqaruv & Qidiruv paneli */}
            <div className={`p-4 rounded-3xl border flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between ${
              isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ism, telefon, email yoki guruh bo‘yicha qidirish..."
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-indigo-500 transition-colors ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>

              {/* Filtrlar */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setFilterPlan('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
                    filterPlan === 'all'
                      ? 'bg-indigo-600 text-white'
                      : isDark ? 'bg-slate-950 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Barchasi ({users.length})
                </button>
                <button
                  onClick={() => setFilterPlan('ultra')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors shrink-0 cursor-pointer ${
                    filterPlan === 'ultra'
                      ? 'bg-amber-600 text-white'
                      : isDark ? 'bg-slate-950 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Crown size={12} /> Ultra ({stats.ultraUsers})
                </button>
                <button
                  onClick={() => setFilterPlan('premium')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors shrink-0 cursor-pointer ${
                    filterPlan === 'premium'
                      ? 'bg-blue-600 text-white'
                      : isDark ? 'bg-slate-950 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sparkles size={12} /> Premium ({stats.premiumUsers})
                </button>
                <button
                  onClick={() => setFilterPlan('free')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
                    filterPlan === 'free'
                      ? 'bg-slate-700 text-white'
                      : isDark ? 'bg-slate-950 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Oddiy ({stats.freeUsers})
                </button>
              </div>

              {/* Yangi qo'shish */}
              <button
                onClick={() => setIsAddUserOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all shrink-0 cursor-pointer"
              >
                <Plus size={16} /> Yangi Talaba Qo‘shish
              </button>
            </div>

            {/* Talabalar Jadvali */}
            <div className={`border rounded-3xl overflow-hidden shadow-xl ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className={`border-b font-semibold uppercase tracking-wider ${
                    isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}>
                    <tr>
                      <th className="py-4 px-6">Talaba F.I.Sh.</th>
                      <th className="py-4 px-6">Aloqa / Guruh</th>
                      <th className="py-4 px-6">Login va Parol (Murojaat uchun)</th>
                      <th className="py-4 px-6">Joriy Tarif</th>
                      <th className="py-4 px-6">Tokenlar</th>
                      <th className="py-4 px-6">Holat</th>
                      <th className="py-4 px-6 text-right">Tarifni Qo‘lda Berish</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-slate-800/80' : 'divide-slate-200'}`}>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-slate-500">
                          Hech qanday talaba topilmadi
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => {
                        const isUltra = u.plan === 'ultra';
                        const isPremium = u.plan === 'premium';
                        const isPasswordVisible = !!unmaskedPasswords[u.id];

                        return (
                          <tr
                            key={u.id}
                            className={`transition-colors ${
                              isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'
                            } ${u.isBlocked ? 'opacity-50 bg-red-950/10' : ''}`}
                          >
                            <td className="py-4 px-6">
                              <div className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{u.name}</div>
                              <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                                {u.university}
                              </div>
                              {u.customNotes && (
                                <div className="text-[10px] text-indigo-400 italic mt-0.5">
                                  💬 {u.customNotes}
                                </div>
                              )}
                            </td>

                            <td className="py-4 px-6">
                              <div className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                                {u.phone || u.email}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {u.faculty} • {u.group}
                              </div>
                            </td>

                            {/* Foydalanuvchining Login va Paroli (Murojaat bo'lganda topib berish) */}
                            <td className="py-4 px-6">
                              <div className="space-y-1">
                                <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                                  <span className="text-indigo-400 font-semibold">Login:</span> {u.email}
                                </div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-purple-400 font-semibold text-[11px]">Parol:</span>
                                  <span className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded border ${
                                    isDark
                                      ? 'bg-slate-950 border-slate-700 text-amber-300'
                                      : 'bg-slate-100 border-slate-300 text-amber-700'
                                  }`}>
                                    {isPasswordVisible ? (u.passwordHash || 'Mavjud emas') : '••••••••'}
                                  </span>

                                  {/* Parolni ko'rsatish/yashirish */}
                                  <button
                                    onClick={() => togglePasswordMask(u.id)}
                                    className="p-1 rounded text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
                                    title={isPasswordVisible ? "Parolni yashirish" : "Parolni ko‘rish"}
                                  >
                                    {isPasswordVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                                  </button>

                                  {/* Talabaga yuborish uchun login/parolni nusxalash */}
                                  <button
                                    onClick={() => copyUserCredentials(u)}
                                    className={`p-1 rounded transition-colors cursor-pointer ${
                                      copiedUserId === u.id ? 'text-emerald-400' : 'text-slate-400 hover:text-emerald-400'
                                    }`}
                                    title="Talabaga berish uchun Login va Parolni to‘liq nusxalash"
                                  >
                                    {copiedUserId === u.id ? <Check size={13} /> : <Copy size={13} />}
                                  </button>

                                  {/* Yangi parol o'rnatish */}
                                  <button
                                    onClick={() => {
                                      setEditingPasswordUser(u);
                                      setNewStudentPassword(u.passwordHash || '');
                                      setPasswordUpdateMsg(null);
                                    }}
                                    className="p-1 rounded text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                                    title="Yangi parol o‘rnatish / Parolni tiklash"
                                  >
                                    <KeyRound size={13} />
                                  </button>
                                </div>

                                {copiedUserId === u.id && (
                                  <span className="text-[10px] text-emerald-400 font-semibold block animate-pulse">
                                    ✓ Login va parol nusxalandi!
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="py-4 px-6">
                              {isUltra ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-sm">
                                  <Crown size={12} className="text-amber-400" /> Ultra VIP
                                </span>
                              ) : isPremium ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-bold bg-blue-500/10 border border-blue-500/30 text-blue-400">
                                  <Sparkles size={12} className="text-blue-400" /> Premium
                                </span>
                              ) : (
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold ${
                                  isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-700'
                                }`}>
                                  Oddiy (Free)
                                </span>
                              )}
                            </td>

                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                <span className={`font-mono font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                  {isUltra ? 'Cheksiz (∞)' : `${u.tokens} ta`}
                                </span>
                                <button
                                  onClick={() => {
                                    setEditingTokenUser(u);
                                    setCustomTokenAmount(u.tokens > 99999 ? 100 : u.tokens);
                                  }}
                                  className="text-[10px] text-indigo-400 hover:underline cursor-pointer"
                                >
                                  O‘zgartirish
                                </button>
                              </div>
                            </td>

                            <td className="py-4 px-6">
                              <button
                                onClick={() => handleToggleBlock(u)}
                                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                                  u.isBlocked
                                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                    : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                                }`}
                              >
                                {u.isBlocked ? (
                                  <>
                                    <XCircle size={12} /> Bloklangan
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 size={12} /> Faol
                                  </>
                                )}
                              </button>
                            </td>

                            <td className="py-4 px-6 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {!isUltra && (
                                  <button
                                    onClick={() => handleUpdatePlan(u.id, 'ultra')}
                                    className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                                    title="Ultra VIP tarif berish"
                                  >
                                    <Crown size={12} /> Ultra Berish
                                  </button>
                                )}

                                {!isPremium && (
                                  <button
                                    onClick={() => handleUpdatePlan(u.id, 'premium')}
                                    className="px-2.5 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                                    title="Premium tarif berish"
                                  >
                                    <Sparkles size={12} /> Premium
                                  </button>
                                )}

                                {(isUltra || isPremium) && (
                                  <button
                                    onClick={() => handleUpdatePlan(u.id, 'free')}
                                    className={`px-2 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                                      isDark
                                        ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                                        : 'bg-slate-200 hover:bg-slate-300 border-slate-300 text-slate-700'
                                    }`}
                                    title="Oddiy tarifga tushirish"
                                  >
                                    Oddiy
                                  </button>
                                )}

                                <button
                                  onClick={() => handleLoginAsUser(u)}
                                  className="p-1.5 text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
                                  title="Ushbu talaba hisobiga kirish"
                                >
                                  <ExternalLink size={14} />
                                </button>

                                <button
                                  onClick={() => handleDeleteUser(u.id, u.name)}
                                  className="p-1.5 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                                  title="O‘chirish"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: VIDEO DARSLIKLAR BOSHQARUVI */}
        {/* ------------------------------------------------------------- */}
        {activeAdminTab === 'courses' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Kurslar statistikasi */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <p className="text-xs text-slate-400">Mavjud Fanlar</p>
                <p className="text-xl font-black text-emerald-400">{courseSubjects.length} ta fan</p>
              </div>
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <p className="text-xs text-slate-400">Jami Video Darslar</p>
                <p className="text-xl font-black text-indigo-400">{courseLessons.length} ta dars</p>
              </div>
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <p className="text-xs text-slate-400">Bepul Darslar (1–5)</p>
                <p className="text-xl font-black text-emerald-500">
                  {courseLessons.filter((l) => l.isFree).length} ta (Bepul)
                </p>
              </div>
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <p className="text-xs text-slate-400">Pullik Darslar (6+)</p>
                <p className="text-xl font-black text-purple-400">
                  {courseLessons.filter((l) => !l.isFree).length} ta (Pullik)
                </p>
              </div>
            </div>

            {/* Boshqaruv tugmalari va Fan filtri */}
            <div className={`p-4 sm:p-5 rounded-3xl border space-y-4 ${
              isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              {/* 1-qator: Sarlavha va Yangi Fan/Dars qo'shish tugmalari */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-sm">
                    🎓
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-white">Video Darslar & Fanlar Boshqaruvi</h3>
                    <p className="text-[11px] text-slate-400">Fanlar bo‘yicha ko‘rish va yangi video darslik yuklash</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto justify-end">
                  <button
                    onClick={() => {
                      setIsAddSubjectModalOpen(true);
                      setSubjectActionMsg(null);
                    }}
                    className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isDark
                        ? 'bg-slate-950 border-emerald-500/40 text-emerald-400 hover:bg-slate-800'
                        : 'bg-white border-emerald-500 text-emerald-700 hover:bg-emerald-50 shadow-sm'
                    }`}
                  >
                    <FolderPlus size={15} /> <span>Yangi Fan Qo‘shish</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsAddLessonModalOpen(true);
                      setLessonActionMsg(null);
                      setSelectedVideoFile(null);
                      setUploadProgressText('');
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                  >
                    <Plus size={16} /> <span>Yangi Video Dars Yuklash</span>
                  </button>
                </div>
              </div>

              {/* 2-qator: Barcha Fanlar bo'yicha to'liq kenglikdagi gorizontal filtr */}
              <div className="w-full min-w-0">
                <div className="flex items-center gap-2 overflow-x-auto w-full pb-1 pt-0.5 scrollbar-thin">
                  <button
                    onClick={() => setSelectedCourseSubjectId('all')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                      selectedCourseSubjectId === 'all'
                        ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30'
                        : isDark
                        ? 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Barcha Darslar ({courseLessons.length})
                  </button>
                  {courseSubjects.map((sub) => {
                    const subCount = courseLessons.filter((l) => l.courseId === sub.id).length;
                    const isSelected = selectedCourseSubjectId === sub.id;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => setSelectedCourseSubjectId(sub.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30'
                            : isDark
                            ? 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <span>{sub.icon || '📚'}</span>
                        <span>{sub.title}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          isSelected ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {subCount}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Darslar Jadvali */}
            <div className={`border rounded-3xl overflow-hidden shadow-xl ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className={`border-b font-semibold uppercase tracking-wider ${
                    isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}>
                    <tr>
                      <th className="py-4 px-6">Dars #</th>
                      <th className="py-4 px-6">Mavzu va Sarlavha</th>
                      <th className="py-4 px-6">Fani</th>
                      <th className="py-4 px-6">Davomiyligi</th>
                      <th className="py-4 px-6">Status / Tarif</th>
                      <th className="py-4 px-6 text-right">Amallar</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-slate-800/80' : 'divide-slate-200'}`}>
                    {filteredLessons.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-slate-500">
                          Hozircha darslar mavjud emas
                        </td>
                      </tr>
                    ) : (
                      filteredLessons.map((lesson) => {
                        const subject = courseSubjects.find((s) => s.id === lesson.courseId);

                        return (
                          <tr
                            key={lesson.id}
                            className={`transition-colors ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}
                          >
                            <td className="py-4 px-6 font-mono font-bold text-slate-400">
                              #{lesson.lessonNumber}
                            </td>

                            <td className="py-4 px-6">
                              <div className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{lesson.title}</div>
                              <div className="text-[11px] text-slate-400 truncate max-w-sm">
                                {lesson.description}
                              </div>
                              <div className="text-[10px] text-indigo-400 truncate max-w-sm font-mono mt-0.5">
                                {lesson.videoUrl}
                              </div>
                            </td>

                            <td className="py-4 px-6">
                              <span className="font-semibold text-emerald-400">
                                {subject ? subject.title : lesson.courseId}
                              </span>
                            </td>

                            <td className="py-4 px-6">
                              <span className="text-slate-300 flex items-center gap-1 font-mono">
                                <Clock size={12} className="text-slate-400" /> {lesson.durationMinutes} min
                              </span>
                            </td>

                            <td className="py-4 px-6">
                              {lesson.isFree ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-extrabold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                                  ✓ 1–5 BEPUL
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-extrabold bg-purple-500/10 border border-purple-500/30 text-purple-300">
                                  <Lock size={10} /> 6+ PULLIK (PREMIUM)
                                </span>
                              )}
                            </td>

                            <td className="py-4 px-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setPreviewLesson(lesson)}
                                  className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                  title="Videoni ko‘rish / pleyerni tekshirish"
                                >
                                  <Play size={12} /> Ko‘rish
                                </button>

                                <button
                                  onClick={() => handleDeleteLesson(lesson.id, lesson.title)}
                                  className="p-1.5 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                                  title="Darsni o‘chirish"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: ADMIN SEANSLARI & XAVFSIZLIK */}
        {/* ------------------------------------------------------------- */}
        {activeAdminTab === 'security' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Admin Boshqaruviga Kirish Seanslari */}
            <div className={`p-6 rounded-3xl border space-y-4 shadow-xl ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Admin Kirish Seanslari (Audit Log)
                    </h3>
                    <p className="text-xs text-slate-400">
                      Admin sozlamalariga kirilgan barcha qurilmalar, IP manzillar va vaqtlar
                    </p>
                  </div>
                </div>

                <button
                  onClick={fetchAdminSessions}
                  className="px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer bg-slate-950 text-slate-400 hover:text-white"
                >
                  <RefreshCw size={12} /> Yangilash
                </button>
              </div>

              {adminSessions.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  Hozircha seanslar qayd etilmagan
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className={`border-b font-semibold uppercase tracking-wider ${
                      isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}>
                      <tr>
                        <th className="py-3 px-4">Qurilma / Tizim</th>
                        <th className="py-3 px-4">IP Manzil</th>
                        <th className="py-3 px-4">Kirilgan Vaqt</th>
                        <th className="py-3 px-4">Holat</th>
                        <th className="py-3 px-4 text-right">Amal</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? 'divide-slate-800/80' : 'divide-slate-200'}`}>
                      {adminSessions.map((sess) => (
                        <tr key={sess.id} className={isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}>
                          <td className="py-3 px-4">
                            <div className="font-bold text-white flex items-center gap-2">
                              <Smartphone size={14} className="text-indigo-400" />
                              <span>{sess.device || 'Kompyuter'}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 truncate max-w-xs font-mono">
                              {sess.userAgent}
                            </div>
                          </td>

                          <td className="py-3 px-4 font-mono text-purple-400 font-semibold">
                            {sess.ip}
                          </td>

                          <td className="py-3 px-4 text-slate-300">
                            {new Date(sess.loginTime).toLocaleString('uz-UZ')}
                          </td>

                          <td className="py-3 px-4">
                            {sess.isActive ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                🟢 Faol seans
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">
                                Yakunlangan
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right">
                            {sess.isActive && (
                              <button
                                onClick={() => handleRevokeSession(sess.id)}
                                className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold transition-colors cursor-pointer"
                                title="Sessiyani to‘xtatish"
                              >
                                Chiqarish
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Telegram Bot Sozlamalari */}
            <div className={`p-6 rounded-3xl border space-y-4 shadow-xl ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Send size={20} />
                </div>
                <div>
                  <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Telegram Bot Sozlamalari (OTP / Bildirishnomalar)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Talabalar ro‘yxatdan o‘tganda va login qilganda SMS o‘rniga Telegram bot orqali kod yuborish
                  </p>
                </div>
              </div>

              {securitySaveMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                  {securitySaveMsg}
                </div>
              )}

              <form onSubmit={handleSaveBotSettings} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Telegram Bot Username
                    </label>
                    <input
                      type="text"
                      value={botUsernameInput}
                      onChange={(e) => setBotUsernameInput(e.target.value)}
                      placeholder="TalabaAIBot"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Telegram Bot Token (@BotFather)
                    </label>
                    <input
                      type="password"
                      value={botTokenInput}
                      onChange={(e) => setBotTokenInput(e.target.value)}
                      placeholder="123456789:ABCdefGHIjklMNOpqrs..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <p className="text-[11px] text-slate-400">
                    * Agar bot tokeni kiritilmasa, tizim demo rejimida ishlaydi.
                  </p>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold cursor-pointer"
                  >
                    Bot Sozlamalarini Saqlash
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 4: ZAXIRA NUSXA VA TIKLASH (BACKUP & RESTORE) */}
        {/* ------------------------------------------------------------- */}
        {activeAdminTab === 'backup' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Statistika Kartochkalari */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`p-5 rounded-3xl border flex items-center gap-4 transition-all ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <Users size={24} />
                </div>
                <div>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Foydalanuvchilar</p>
                  <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {backupStats?.usersCount ?? users.length} ta
                  </p>
                </div>
              </div>

              <div className={`p-5 rounded-3xl border flex items-center gap-4 transition-all ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <GraduationCap size={24} />
                </div>
                <div>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Fanlar & Darslar</p>
                  <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {backupStats?.subjectsCount ?? courseSubjects.length} fan / {backupStats?.lessonsCount ?? courseLessons.length} dars
                  </p>
                </div>
              </div>

              <div className={`p-5 rounded-3xl border flex items-center gap-4 transition-all ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <BookOpen size={24} />
                </div>
                <div>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Guruhlar & Xabarlar</p>
                  <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {backupStats?.groupsCount ?? 0} guruh
                  </p>
                </div>
              </div>

              <div className={`p-5 rounded-3xl border flex items-center gap-4 transition-all ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <Clock size={24} />
                </div>
                <div>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Oxirgi Zaxira</p>
                  <p className="text-xs font-bold text-emerald-400 truncate max-w-[160px]">
                    {backupConfig?.lastBackupAt
                      ? new Date(backupConfig.lastBackupAt).toLocaleString('uz-UZ')
                      : 'Hozircha olinmagan'}
                  </p>
                </div>
              </div>
            </div>

            {backupActionMsg && (
              <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${
                backupActionMsg.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}>
                {backupActionMsg.type === 'success' ? (
                  <CheckCircle2 size={16} className="shrink-0" />
                ) : (
                  <AlertTriangle size={16} className="shrink-0" />
                )}
                <span>{backupActionMsg.text}</span>
              </div>
            )}

            {/* Asosiy 2 ta blok: Chapda Eksport/Import, O'ngda Telegram Avto-bekub */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chap Blok: 1. Yuklab Olish (Eksport) & 2. Qayta Tiklash (Import) */}
              <div className="space-y-6">
                {/* 1. Kompyuterga Zaxira Olish */}
                <div className={`p-6 rounded-3xl border space-y-4 shadow-xl ${
                  isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <HardDrive size={20} />
                    </div>
                    <div>
                      <h3 className={`text-sm sm:text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        1. Zaxira Nusxasini Yuklab Olish (Eksport)
                      </h3>
                      <p className="text-xs text-slate-400">
                        Barcha talabalar, fanlar, parollar va sozlamalarni bitta faylda saqlab oling
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
                    💡 <b>Nima uchun kerak?</b> Serverni qayta o‘rnatganingizda, yangi VPS xarid qilganingizda yoki kompyuteringizda xavfsiz saqlab qo‘yish uchun ushbu tugma orqali butun platforma bazasini <code>.json</code> fayl ko‘rinishida yuklab olasiz.
                  </p>

                  <button
                    onClick={handleDownloadBackup}
                    disabled={isDownloadingBackup}
                    className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isDownloadingBackup ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <HardDrive size={16} />
                    )}
                    <span>
                      {isDownloadingBackup
                        ? 'Zaxira fayli tayyorlanmoqda...'
                        : '📥 Kompyuterga To‘liq Zaxira Nusxasini Yuklab Olish'}
                    </span>
                  </button>
                </div>

                {/* 2. Zaxira Faylidan Qayta Tiklash (Import / Restore) */}
                <div className={`p-6 rounded-3xl border space-y-4 shadow-xl ${
                  isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                      <UploadCloud size={20} />
                    </div>
                    <div>
                      <h3 className={`text-sm sm:text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        2. Zaxira Faylini Yuklash va Qayta Tiklash (Import)
                      </h3>
                      <p className="text-xs text-slate-400">
                        Oldin saqlab qo‘yilgan .json zaxira faylini tanlab tizimni tiklang
                      </p>
                    </div>
                  </div>

                  {/* Fayl tanlash zonasi */}
                  <div className="border-2 border-dashed border-slate-700 hover:border-blue-500/60 rounded-2xl p-5 text-center bg-slate-950/70 transition-colors relative cursor-pointer group">
                    <input
                      type="file"
                      accept=".json,application/json"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleRestoreFileSelected(e.target.files[0]);
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    />
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <UploadCloud size={20} />
                      </div>
                      {restoreFile ? (
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-blue-400 flex items-center justify-center gap-1.5">
                            <CheckCircle2 size={14} /> {restoreFile.name}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Hajmi: {(restoreFile.size / 1024).toFixed(1)} KB
                          </p>
                          <span className="inline-block px-2.5 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-300 font-semibold">
                            Boshqa fayl tanlash uchun bosing
                          </span>
                        </div>
                      ) : (
                        <>
                          <p className="text-xs font-bold text-white">
                            Zaxira .json faylini tanlang yoki shu yerga tashlang
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Faqat TalabaAI platformasining rasmiy zaxira fayli qabul qilinadi
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Fayl tekshiruv hisoboti (Preview) */}
                  {restorePreview && (
                    <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-800/60 space-y-3">
                      <div className="flex items-center justify-between text-xs border-b border-blue-800/40 pb-2">
                        <span className="text-blue-300 font-bold">Fayl Ma‘lumotlari:</span>
                        <span className="text-slate-400 font-mono text-[11px]">
                          Eksport vaqti: {new Date(restorePreview.exportedAt).toLocaleString('uz-UZ')}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                          <span className="text-slate-400 text-[11px]">Talabalar:</span>
                          <p className="font-bold text-white">{restorePreview.stats?.usersCount || 0} ta hisob</p>
                        </div>
                        <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                          <span className="text-slate-400 text-[11px]">Fanlar & Darslar:</span>
                          <p className="font-bold text-white">
                            {restorePreview.stats?.subjectsCount || 0} fan / {restorePreview.stats?.lessonsCount || 0} dars
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setIsRestoreConfirmModalOpen(true)}
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <RefreshCw size={15} />
                        <span>🔄 Ushbu Fayldan Qayta Tiklashni Boshlash</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* 3. Barcha Test Ma‘lumotlarini Tozalash (Toza Tizim Boshlash) */}
                <div className={`p-6 rounded-3xl border space-y-4 shadow-xl ${
                  isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                      <Trash2 size={20} />
                    </div>
                    <div>
                      <h3 className={`text-sm sm:text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        3. Test Ma‘lumotlarni Tozalash (Toza Baza Boshlash)
                      </h3>
                      <p className="text-xs text-slate-400">
                        Barcha sinov talabalari, test darslar va yozishmalarni tozalab, tizimni noldan toza boshlang
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-rose-300/90 leading-relaxed bg-rose-950/30 p-3.5 rounded-2xl border border-rose-800/40">
                    ⚠️ <b>Eslatma:</b> Ushbu tugma barcha soxta / test ma‘lumotlarni o‘chirib yuboradi. Sizning <b>Admin login va parolingiz saqlanib qoladi</b>. Shuningdek, tozalashdan oldin xavfsizlik uchun tizim avtomatik zaxira nusxasini saqlab qo‘yadi.
                  </p>

                  <button
                    onClick={() => setIsResetConfirmModalOpen(true)}
                    className="w-full py-3 px-5 rounded-2xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 hover:border-rose-500/50 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Trash2 size={16} />
                    <span>🗑️ Barcha Test Ma‘lumotlarni Tozalash (Toza Baza Boshlash)</span>
                  </button>
                </div>
              </div>

              {/* O'ng Blok: 3. Telegram Bot Orqali Avtomatik Zaxira (Avto-Bekub) */}
              <div className={`p-6 rounded-3xl border space-y-5 shadow-xl ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                      <Send size={20} />
                    </div>
                    <div>
                      <h3 className={`text-sm sm:text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Telegram Botga Avtomatik Zaxira Yuborish
                      </h3>
                      <p className="text-xs text-slate-400">
                        Reja bo‘yicha bazani to‘g‘ridan-to‘g‘ri Telegramingizga yetkazib berish
                      </p>
                    </div>
                  </div>

                  {/* Switch */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAutoBackupEnabled}
                      onChange={(e) => setIsAutoBackupEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <form onSubmit={handleSaveBackupSettings} className="space-y-4 text-xs">
                  {/* Bot Token */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Telegram Bot Token (@BotFather) *
                    </label>
                    <input
                      type="password"
                      required
                      value={backupBotToken}
                      onChange={(e) => setBackupBotToken(e.target.value)}
                      placeholder="8222935062:AAH7vuajffGpGH-I0VvNPebbF41qVeWEgZ0"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Platformaga ulangan bot tokeni. Standart ravishda hozirgi botingiz kiritilgan.
                    </p>
                  </div>

                  {/* Admin Telegram Chat ID */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Admin Telegram Chat ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={backupAdminChatId}
                      onChange={(e) => setBackupAdminChatId(e.target.value)}
                      placeholder="Masalan: 123456789 yoki 542198765"
                      className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border text-white font-mono ${
                        backupAdminChatId.includes(':') ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-slate-800'
                      }`}
                    />

                    {backupAdminChatId.includes(':') && (
                      <div className="mt-2 p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
                        <AlertTriangle size={17} className="shrink-0 text-rose-400 mt-0.5" />
                        <div>
                          <p className="font-bold text-rose-200">Diqqat: Siz bu yerga Bot Token kiritdingiz!</p>
                          <p className="text-[11px] text-rose-300/90 mt-1 leading-relaxed">
                            Bot tokenida <code>:</code> belgisi bo‘ladi. Chat ID esa faqat <b>oddiy raqamlardan</b> iborat bo‘ladi (masalan: <b>542198765</b>).
                            Ushbu tokenni nusxalab, yuqoridagi <b>«Telegram Bot Token»</b> maydoniga qo‘ying.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 mt-1.5 text-[11px] text-slate-400 space-y-1">
                      <p className="text-emerald-400 font-semibold">❓ Chat ID raqamingizni qanday topasiz?</p>
                      <p>
                        1. Telegramda <b>@darsliklar_ai_bot</b> ga kiring va <code>/id</code> deb yozing — bot darhol sizning shaxsiy Chat ID raqamingizni chiqarib beradi!
                      </p>
                      <p>
                        2. Yoki Telegramdagi <b>@userinfobot</b> ga <code>/start</code> bosib bilib olishingiz mumkin.
                      </p>
                    </div>
                  </div>

                  {/* Zaxira Yuborish Vaqti / Jadvali */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Zaxira Yuborish Oralig‘i / Vaqti *
                    </label>
                    <select
                      value={backupSchedule}
                      onChange={(e) => setBackupSchedule(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold cursor-pointer"
                    >
                      <option value="daily_midnight">🌙 Har kuni soat 00:00 da (Tungi avto-bekub — Tavsiya etiladi)</option>
                      <option value="daily_custom">⏰ Har kuni belgilangan soatda (Quyida soatni tanlang)</option>
                      <option value="every_12h">⏳ Har 12 soatda bir marta</option>
                      <option value="every_6h">⚡ Har 6 soatda bir marta (Tezkor)</option>
                      <option value="weekly">📅 Har haftada 1 marta (Yakshanba kuni)</option>
                    </select>
                  </div>

                  {backupSchedule === 'daily_custom' && (
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Zaxira yuboriladigan aniq soatni tanlang (24 soatlik format)
                      </label>
                      <input
                        type="time"
                        value={backupCustomTime}
                        onChange={(e) => setBackupCustomTime(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                      />
                    </div>
                  )}

                  {/* Tugmalar */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <button
                      type="submit"
                      className="w-full sm:w-auto flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-600/25"
                    >
                      <Check size={15} />
                      <span>Sozlamalarni Saqlash</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSendTelegramBackupNow}
                      disabled={isSendingTelegramBackup}
                      className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-600/25 disabled:opacity-50"
                    >
                      {isSendingTelegramBackup ? (
                        <RefreshCw size={15} className="animate-spin" />
                      ) : (
                        <Send size={15} />
                      )}
                      <span>
                        {isSendingTelegramBackup
                          ? 'Yuborilmoqda...'
                          : '🚀 Hozir Telegramga Zaxira Yuborish (Sinash)'}
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: TALABA PAROLINI TIKLASH / YANGILASH */}
      {/* ------------------------------------------------------------- */}
      {editingPasswordUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <KeyRound size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Talaba Parolini O‘zgartirish</h3>
                  <p className="text-[11px] text-slate-400">{editingPasswordUser.name}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingPasswordUser(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStudentPassword} className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <p className="text-[11px] text-slate-400 font-mono">
                  <span className="text-indigo-400">Login:</span> {editingPasswordUser.email}
                </p>
                <p className="text-[11px] text-slate-400 font-mono">
                  <span className="text-purple-400">Oldingi parol:</span> {editingPasswordUser.passwordHash || 'O‘rnatilmagan'}
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Yangi Parolni Kiriting *
                </label>
                <input
                  type="text"
                  required
                  value={newStudentPassword}
                  onChange={(e) => setNewStudentPassword(e.target.value)}
                  placeholder="Yangi parol..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>

              {passwordUpdateMsg && (
                <div className={`p-3 rounded-xl border text-xs ${
                  passwordUpdateMsg.includes('muvaffaqiyatli')
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-red-500/10 border-red-500/30 text-red-400'
                }`}>
                  {passwordUpdateMsg}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPasswordUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold cursor-pointer"
                >
                  {isUpdatingPassword ? 'Saqlanmoqda...' : 'Parolni Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: YANGI VIDEO DARS YUKLASH */}
      {/* ------------------------------------------------------------- */}
      {isAddLessonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-4 shadow-2xl animate-in zoom-in-95 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Film size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Yangi Video Darslik Yuklash</h3>
                  <p className="text-xs text-slate-400">1-5 darslar avtomatik bepul, 6+ darslar pullik bo‘ladi</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddLessonModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddLessonSubmit} className="space-y-4 text-xs">
              {/* Fan tanlash va Yangi Fan Yaratish tugmasi */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-300 font-semibold">
                    Qaysi Fanga Dars Qo‘shmoqchisiz? *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddLessonModalOpen(false);
                      setIsAddSubjectModalOpen(true);
                      setSubjectActionMsg(null);
                    }}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <FolderPlus size={13} /> Yangi Fan Yaratish
                  </button>
                </div>
                <select
                  value={newLessonCourseId}
                  onChange={(e) => setNewLessonCourseId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold"
                  required
                >
                  {courseSubjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.title} ({sub.instructorName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Dars nomi */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Dars Sarlavhasi / Mavzusi *
                </label>
                <input
                  type="text"
                  required
                  value={newLessonTitle}
                  onChange={(e) => setNewLessonTitle(e.target.value)}
                  placeholder="Masalan: 1-Mavzu: Kirish va Asosiy tushunchalar"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              {/* Video Yuklash Usuli (Kompyuterdan yoki Link) */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Videoni Qanday Yuklamoqchisiz? *
                </label>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setVideoUploadMode('file')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      videoUploadMode === 'file'
                        ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/25'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <UploadCloud size={16} />
                    <span>Kompyuterdan Fayl Yuklash</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVideoUploadMode('url')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      videoUploadMode === 'url'
                        ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/25'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Film size={16} />
                    <span>Havola (Link / YouTube)</span>
                  </button>
                </div>

                {videoUploadMode === 'file' ? (
                  <div className="space-y-2 w-full max-w-full">
                    <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500/60 rounded-2xl p-5 text-center bg-slate-950/70 transition-colors relative cursor-pointer group overflow-hidden w-full">
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime,video/mkv,video/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            setSelectedVideoFile(file);
                            if (!newLessonTitle) {
                              const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_.-]/g, ' ');
                              setNewLessonTitle(cleanName);
                            }
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                      />
                      <div className="flex flex-col items-center justify-center space-y-2.5 w-full max-w-full overflow-hidden px-1">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                          <UploadCloud size={24} />
                        </div>
                        {selectedVideoFile ? (
                          <div className="space-y-1.5 w-full max-w-full overflow-hidden flex flex-col items-center">
                            <div className="max-w-[95%] sm:max-w-md px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1.5 overflow-hidden shadow-sm">
                              <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />
                              <span
                                className="text-xs font-bold truncate block break-all text-emerald-300"
                                title={selectedVideoFile.name}
                              >
                                {selectedVideoFile.name}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-medium">
                              Hajmi: {(selectedVideoFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedVideoFile.name.split('.').pop()?.toUpperCase() || 'VIDEO'}
                            </p>
                            <span className="inline-block px-3 py-0.5 rounded-lg text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/40">
                              O‘zgartirish uchun bosing
                            </span>
                          </div>
                        ) : (
                          <>
                            <p className="text-xs font-bold text-white">
                              O‘qituvchi bilan olingan video dars faylini tanlang
                            </p>
                            <p className="text-[11px] text-slate-400">
                              MP4, WebM, MOV yoki MKV fayllarni yuklash mumkin
                            </p>
                            <span className="px-3 py-1 rounded-xl bg-slate-800 text-slate-300 text-[10px] font-semibold mt-1">
                              Kompyuterdan tanlash
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    {uploadProgressText && (
                      <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs flex items-center gap-2.5 w-full max-w-full overflow-hidden">
                        <RefreshCw size={15} className="animate-spin text-indigo-400 shrink-0" />
                        <div className="min-w-0 flex-1 overflow-hidden">
                          <p className="truncate text-xs font-medium" title={uploadProgressText}>
                            {uploadProgressText}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      required={videoUploadMode === 'url'}
                      value={newLessonVideoUrl}
                      onChange={(e) => setNewLessonVideoUrl(e.target.value)}
                      placeholder="https://... yoki https://www.youtube.com/watch?v=..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                    />
                  </div>
                )}
              </div>

              {/* Davomiyligi */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Davomiyligi (daqiqa)
                </label>
                <input
                  type="number"
                  min="1"
                  max="360"
                  value={newLessonDuration}
                  onChange={(e) => setNewLessonDuration(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              {/* Tavsif */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Dars Haqida Qisqacha Tavsif / Konspekt
                </label>
                <textarea
                  rows={2}
                  value={newLessonDesc}
                  onChange={(e) => setNewLessonDesc(e.target.value)}
                  placeholder="Ushbu darsda o‘qituvchi nimalarni o‘rgatgani haqida..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white resize-none"
                />
              </div>

              {lessonActionMsg && (
                <div className={`p-3 rounded-xl border text-xs ${
                  lessonActionMsg.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-red-500/10 border-red-500/30 text-red-400'
                }`}>
                  {lessonActionMsg.text}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddLessonModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingLesson}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                >
                  {isSubmittingLesson ? 'Yuklanmoqda...' : 'Darsni Yuklash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: YANGI FAN QO'SHISH */}
      {/* ------------------------------------------------------------- */}
      {isAddSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-4 shadow-2xl animate-in zoom-in-95 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <FolderPlus size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Yangi Fan Qo‘shish</h3>
                  <p className="text-xs text-slate-400">Platformaga yangi o‘quv fanini kiriting</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddSubjectModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Fan Nomi *
                </label>
                <input
                  type="text"
                  required
                  value={newSubjectTitle}
                  onChange={(e) => setNewSubjectTitle(e.target.value)}
                  placeholder="Masalan: Oliy Matematika, Fizika, Tarix..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  O‘qituvchi F.I.Sh. (Ustoz) *
                </label>
                <input
                  type="text"
                  required
                  value={newSubjectInstructor}
                  onChange={(e) => setNewSubjectInstructor(e.target.value)}
                  placeholder="Masalan: Dotsent Alisher Qosimov"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Toifasi (Yo‘nalishi)
                  </label>
                  <select
                    value={newSubjectCategory}
                    onChange={(e) => setNewSubjectCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="Aniq Fanlar">Aniq Fanlar</option>
                    <option value="Dasturlash & IT">Dasturlash & IT</option>
                    <option value="Xorijiy Tillar">Xorijiy Tillar</option>
                    <option value="Gumanitar Fanlar">Gumanitar Fanlar</option>
                    <option value="Biznes & Moliya">Biznes & Moliya</option>
                    <option value="Tibbiyot">Tibbiyot</option>
                    <option value="Huquqshunoslik">Huquqshunoslik</option>
                    <option value="Umumiy">Boshqa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Belgisi (Emoji)
                  </label>
                  <select
                    value={newSubjectIcon}
                    onChange={(e) => setNewSubjectIcon(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-base"
                  >
                    <option value="🎓">🎓 Akademiya</option>
                    <option value="📐">📐 Matematika</option>
                    <option value="💻">💻 IT / Dasturlash</option>
                    <option value="🔬">🔬 Fizika / Kimyo</option>
                    <option value="📚">📚 Adabiyot / Tillar</option>
                    <option value="💼">💼 Biznes / Menejment</option>
                    <option value="⚖️">⚖️ Huquq</option>
                    <option value="🩺">🩺 Tibbiyot</option>
                    <option value="⚡">⚡ Texnika</option>
                    <option value="🤖">🤖 Sun'iy Intellekt</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Fan Haqida Qisqacha Tavsif
                </label>
                <textarea
                  rows={2}
                  value={newSubjectDesc}
                  onChange={(e) => setNewSubjectDesc(e.target.value)}
                  placeholder="Ushbu fan talabalarga qanday bilimlar berishi haqida..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white resize-none"
                />
              </div>

              {subjectActionMsg && (
                <div className={`p-3 rounded-xl border text-xs ${
                  subjectActionMsg.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-red-500/10 border-red-500/30 text-red-400'
                }`}>
                  {subjectActionMsg.text}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddSubjectModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSubject}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                >
                  {isSubmittingSubject ? 'Yaratilmoqda...' : 'Fanni Qo‘shish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: VIDEO DARSNI KO'RISH (PREVIEW) */}
      {/* ------------------------------------------------------------- */}
      {previewLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">{previewLesson.title}</h3>
                <p className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                  <Clock size={11} /> {previewLesson.durationMinutes} daqiqa | {previewLesson.isFree ? 'Bepul dars' : 'Pullik dars'}
                </p>
              </div>
              <button
                onClick={() => setPreviewLesson(null)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-800">
              {previewLesson.videoUrl.endsWith('.mp4') ||
              previewLesson.videoUrl.endsWith('.webm') ||
              previewLesson.videoUrl.endsWith('.mov') ||
              previewLesson.videoUrl.startsWith('/uploads/') ||
              previewLesson.videoUrl.startsWith('/api/courses/') ? (
                <video
                  src={
                    previewLesson.videoUrl.startsWith('/uploads/courses/')
                      ? `/api/courses/stream?file=${previewLesson.videoUrl.replace('/uploads/courses/', '')}`
                      : previewLesson.videoUrl
                  }
                  controls
                  controlsList="nodownload"
                  className="w-full h-full object-contain bg-black"
                  playsInline
                />
              ) : (
                <iframe
                  src={previewLesson.videoUrl}
                  title={previewLesson.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>

            <p className="text-xs text-slate-300">{previewLesson.description}</p>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: YANGI TALABA QO'SHISH */}
      {/* ------------------------------------------------------------- */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus size={18} className="text-indigo-400" /> Yangi Talaba Qo‘shish
              </h3>
              <button
                onClick={() => setIsAddUserOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Talaba F.I.Sh. *
                </label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Masalan: Karimov Anvar"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Email yoki Telegram *
                </label>
                <input
                  type="text"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="anvar@edu.uz yoki @username"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Universitet (OTM)
                  </label>
                  <input
                    type="text"
                    value={newUserUniversity}
                    onChange={(e) => setNewUserUniversity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Guruh
                  </label>
                  <input
                    type="text"
                    value={newUserGroup}
                    onChange={(e) => setNewUserGroup(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  />
                </div>
              </div>

              {/* Boshlang'ich Tarif */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">
                  Beriladigan Tarif:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewUserPlan('free');
                      setNewUserTokens(10);
                    }}
                    className={`p-2.5 rounded-xl text-center border font-semibold cursor-pointer ${
                      newUserPlan === 'free'
                        ? 'bg-slate-700 border-white text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Oddiy (10 ta)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewUserPlan('premium');
                      setNewUserTokens(100);
                    }}
                    className={`p-2.5 rounded-xl text-center border font-semibold cursor-pointer ${
                      newUserPlan === 'premium'
                        ? 'bg-blue-600 border-blue-400 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Premium (100 ta)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewUserPlan('ultra');
                      setNewUserTokens(999999);
                    }}
                    className={`p-2.5 rounded-xl text-center border font-semibold cursor-pointer ${
                      newUserPlan === 'ultra'
                        ? 'bg-amber-600 border-amber-400 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Ultra (Cheksiz)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Maxsus Eslatma (Ixtiyoriy)
                </label>
                <input
                  type="text"
                  value={newUserNotes}
                  onChange={(e) => setNewUserNotes(e.target.value)}
                  placeholder="Masalan: Grant talabasi, to‘lov qildi va h.k."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer"
                >
                  Talabani Qo‘shish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: TOKENLARNI QO'LDA O'RNATISH */}
      {/* ------------------------------------------------------------- */}
      {editingTokenUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Coins size={18} className="text-amber-400" /> Tokenlarni Belgilash
            </h3>
            <p className="text-xs text-slate-400">
              «{editingTokenUser.name}» uchun tokenlar miqdorini kiriting:
            </p>

            <input
              type="number"
              min="0"
              max="999999"
              value={customTokenAmount}
              onChange={(e) => setCustomTokenAmount(parseInt(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-center text-lg font-bold"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingTokenUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={handleSaveTokens}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer"
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADMIN LOGIN VA PAROLINI O'ZGARTIRISH */}
      {/* ------------------------------------------------------------- */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Settings size={18} className="text-indigo-400" /> Admin Parolini O‘zgartirish
              </h3>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {passwordChangeSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                {passwordChangeSuccess}
              </div>
            )}

            {passwordChangeError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                {passwordChangeError}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Joriy Admin Paroli *
                </label>
                <input
                  type="password"
                  required
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  placeholder="Joriy parol..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Yangi Admin Logini (Ixtiyoriy)
                </label>
                <input
                  type="text"
                  value={newAdminLogin}
                  onChange={(e) => setNewAdminLogin(e.target.value)}
                  placeholder="admin"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Yangi Admin Paroli *
                </label>
                <input
                  type="password"
                  required
                  value={newAdminPass}
                  onChange={(e) => setNewAdminPass(e.target.value)}
                  placeholder="Yangi mustahkam parol..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer"
                >
                  Parolni Yangilash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: TIKLASHNI TASDIQLASH */}
      {/* ------------------------------------------------------------- */}
      {isRestoreConfirmModalOpen && restorePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95 my-8">
            <div className="flex items-center gap-3 text-amber-400">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Ma‘lumotlarni Qayta Tiklash</h3>
                <p className="text-xs text-amber-400/90 font-medium">Barcha joriy ma’lumotlar yangilanadi</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
              <p>
                Siz tanlagan zaxira faylida quyidagi ma’lumotlar mavjud:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1 font-mono text-[11px]">
                <li><b>{restorePreview.stats?.usersCount || 0} ta</b> talaba hisobi</li>
                <li><b>{restorePreview.stats?.subjectsCount || 0} ta</b> fan va kurs</li>
                <li><b>{restorePreview.stats?.lessonsCount || 0} ta</b> video darslik</li>
              </ul>
              <p className="text-amber-400 text-[11px] font-semibold pt-1">
                ⚠️ Xavfsizlik uchun tiklashdan avval joriy bazaning avtomatik xavfsizlik nusxasi serverda saqlanadi.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsRestoreConfirmModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={handleExecuteRestore}
                disabled={isRestoringBackup}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isRestoringBackup ? (
                  <RefreshCw size={15} className="animate-spin" />
                ) : (
                  <Check size={15} />
                )}
                <span>{isRestoringBackup ? 'Tiklanmoqda...' : 'Ha, Qayta Tiklansin'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: TEST MA'LUMOTLARNI TOZALASHNI TASDIQLASH */}
      {/* ------------------------------------------------------------- */}
      {isResetConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95 my-8">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Test Ma‘lumotlarni Tozalash</h3>
                <p className="text-xs text-rose-400/90 font-medium">Barcha test ma’lumotlari o‘chiriladi</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
              <p>
                Haqiqatan ham barcha sinov talabalari, test kurslar, darslar va yozishmalarni tozalamoqchimisiz?
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1 font-mono text-[11px]">
                <li>Barcha test talaba akkauntlari o‘chiriladi</li>
                <li>Barcha test fanlar va darslar o‘chiriladi</li>
                <li>Guruhlar va chat xabarlari tozalanadi</li>
                <li className="text-emerald-400 font-semibold">Admin login va parolingiz o‘zgarmay saqlanib qoladi!</li>
              </ul>
              <p className="text-amber-400 text-[11px] font-semibold pt-1">
                🛡️ Xavfsizlik kafolati: Tozalashdan avval joriy bazaning to‘liq zaxira nusxasi avtomatik serverga saqlanadi.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={handleResetDatabase}
                disabled={isResettingDatabase}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isResettingDatabase ? (
                  <RefreshCw size={15} className="animate-spin" />
                ) : (
                  <Trash2 size={15} />
                )}
                <span>{isResettingDatabase ? 'Tozalanmoqda...' : 'Ha, Hammasini Tozalash'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
