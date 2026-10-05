export type Language = 'uz' | 'ru' | 'en';

export type PresentationStyle = 'modern-dark' | 'academic-blue' | 'minimal-light' | 'emerald-green' | 'creative-purple';

export interface SlideItem {
  id: string;
  slideNumber: number;
  title: string;
  subtitle?: string;
  bullets: string[];
  highlight?: string;
  stats?: { value: string; label: string };
  imageKeywords?: string;
  imageUrl?: string;
  imageCaption?: string;
  iconName?: string;
}

export interface PresentationProject {
  id: string;
  title: string;
  topic: string;
  style: PresentationStyle;
  language: Language;
  createdAt: string;
  slides: SlideItem[];
}

export interface MustaqilIshMeta {
  university: string;
  faculty: string;
  department: string;
  group: string;
  studentName: string;
  teacherName: string;
  subject: string;
  topic: string;
  city: string;
  year: string;
  language: Language;
  chapterCount: number;
  pageCount?: number;
}

export interface SectionContent {
  title: string;
  subsections?: { title: string; content: string }[];
  content: string;
}

export interface MustaqilIshProject {
  id: string;
  meta: MustaqilIshMeta;
  createdAt: string;
  mundarija: string[];
  kirish: string;
  boblar: SectionContent[];
  xulosa: string;
  adabiyotlar: string[];
}

export interface Flashcard {
  question: string;
  answer: string;
}

export interface ResearchResult {
  id: string;
  query: string;
  createdAt: string;
  summary: string;
  keyPoints: string[];
  statistics: { label: string; value: string }[];
  sources: { title: string; author?: string; year?: string; link?: string }[];
  flashcards: Flashcard[];
}

export type UserPlan = 'free' | 'premium' | 'ultra';

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  telegramUsername?: string;
  university?: string;
  faculty?: string;
  group?: string;
  tokens: number;
  isLoggedIn: boolean;
  plan?: UserPlan;
  planActivatedAt?: string;
  isBlocked?: boolean;
  customNotes?: string;
}

export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  telegramUsername?: string;
  passwordHash?: string;
  failedAttempts?: number;
  lastFailedAt?: string;
  university: string;
  faculty: string;
  group: string;
  plan: UserPlan;
  tokens: number;
  createdAt: string;
  updatedAt: string;
  isBlocked: boolean;
  customNotes?: string;
}

export interface BlockedDeviceRecord {
  id: string;
  deviceId: string;
  ip?: string;
  phone?: string;
  attempts: number;
  reason: string;
  blockedAt: string;
}

export interface SecuritySettings {
  telegramBotToken?: string;
  telegramBotUsername?: string;
  maxFailedAttempts: number;
}

export interface AdminSessionRecord {
  id: string;
  token: string;
  username: string;
  ip: string;
  device: string;
  userAgent?: string;
  loginTime: string;
  lastActive: string;
  isActive: boolean;
}

export interface AdminStats {
  totalUsers: number;
  freeUsers: number;
  premiumUsers: number;
  ultraUsers: number;
  totalTokensIssued: number;
}

export type NavTab =
  | 'darslar'
  | 'darsxona'
  | 'groups'
  | 'contacts'
  | 'settings'
  | 'presentation'
  | 'mustaqil'
  | 'research'
  | 'history'
  | 'messenger';

export interface CourseLesson {
  id: string;
  courseId: string;
  lessonNumber: number;
  title: string;
  description: string;
  videoUrl: string;
  durationMinutes: number;
  isFree: boolean;
  thumbnailUrl?: string;
  createdAt: string;
}

export interface CourseSubject {
  id: string;
  title: string;
  category: string;
  description: string;
  icon: string;
  instructorName: string;
  totalLessons: number;
  freeLessonsCount: number;
  createdAt: string;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderPhone?: string;
  senderPlan?: UserPlan;
  receiverId: string;
  receiverName?: string;
  receiverPhone?: string;
  text: string;
  createdAt: string;
  read: boolean;
}

export interface SavedContactEntry {
  ownerId: string;
  targetUserId: string;
  targetName: string;
  targetPhone?: string;
  targetEmail?: string;
  targetTelegram?: string;
  targetUniversity?: string;
  targetFaculty?: string;
  targetGroup?: string;
  targetPlan?: UserPlan;
  addedAt: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

export interface ChatMessage {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  senderRole?: string;
  senderPlan: UserPlan;
  text: string;
  createdAt: string;
  attachment?: {
    type: 'code' | 'file' | 'link';
    title: string;
    url?: string;
  };
}

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  category: string;
  membersCount: number;
  avatarIcon?: string;
  isLive: boolean;
  creatorId?: string;
  creatorName?: string;
  memberIds?: string[];
  currentSpeaker?: {
    name: string;
    plan: UserPlan;
    hasScreenShare: boolean;
    hasCamera: boolean;
  };
  createdAt: string;
}

export interface LiveSessionState {
  isActive: boolean;
  groupId: string | null;
  presenterId: string | null;
  presenterName: string | null;
  hasScreenShare: boolean;
  hasCamera: boolean;
  isMuted: boolean;
}
