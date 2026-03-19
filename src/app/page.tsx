'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import { format, formatDistanceToNow } from 'date-fns';
import {
  GraduationCap, LogOut, FileText, Plus, Download, Trash2, Eye, BookOpen, Clock, Target,
  Loader2, Menu, X, Home, Settings, ChevronRight, AlertCircle, CheckCircle, Upload,
  FileUp, File, FolderOpen, Book, RefreshCw, Search, Crown, Zap, Building2, Users,
  BarChart3, Shield, Bell, Check, Sparkles, TrendingUp, Activity as ActivityIcon,
  Sun, Moon, Monitor, ChevronDown, ArrowRight, Star, Heart, MessageSquare, Globe,
  Award, Layers, PenTool, FileCheck, Clock4, Play, Quote, User, CreditCard, Key,
  LogIn, UserPlus, Mail, HelpCircle, ChevronLeft, MoreHorizontal, Filter, Grid,
  List, Calendar, PieChartIcon, Send, Bot, Wand2, FileQuestion, Brain, Lightbulb,
  Rocket, Target as TargetIcon, ClipboardList, Edit3, Copy, Printer, Share2,
  Maximize2, Minimize2, Info, XCircle, AlertTriangle, ExternalLink, MenuIcon,
  LayoutDashboard, FileStack, Library, Megaphone, Ticket, Palette, Sliders,
  Database, Cloud, Lock, Unlock, Cpu, Zap as ZapIcon, Gift, Coins, DollarSign,
  TrendingDown, BarChart2, ArrowUpRight, ArrowDownRight, Minus, Link2, Tag,
  Leaf, TreePine, Flower2, Trees, Sprout, TreeDeciduous, Bird, Butterfly
} from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';

// Animation variants
const fadeIn = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };
const slideUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 } };
const slideRight = { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 20 } };
const scaleIn = { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.95 } };
const stagger = { animate: { transition: { staggerChildren: 0.1 } } };

// Types
interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
}

interface Subject { id: string; name: string; description?: string; }
interface ClassLevel { id: string; name: string; sortOrder: number; }
interface Topic { id: string; name: string; subtopics: Subtopic[]; }
interface Subtopic { id: string; name: string; }

interface Question {
  id: string;
  questionText: string;
  questionType: string;
  difficulty: string;
  marks: number;
  options?: string;
  correctAnswer: string;
  explanation?: string;
}

interface ExamQuestion {
  id: string;
  section: string;
  questionNum: number;
  marks: number;
  question: Question;
}

interface Exam {
  id: string;
  title: string;
  examType: string;
  totalMarks: number;
  duration: number;
  instructions?: string;
  status: string;
  createdAt: string;
  examQuestions: ExamQuestion[];
}

interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description?: string;
  priceMonthly: number;
  priceYearly: number;
  maxExamsPerMonth: number;
  maxQuestionsPerExam: number;
  maxPastPapers: number;
  aiGeneration: boolean;
  pdfExport: boolean;
  customFormats: boolean;
  analytics: boolean;
  prioritySupport: boolean;
  whiteLabel: boolean;
}

interface Subscription {
  id: string;
  status: string;
  billingCycle: string;
  examsThisMonth: number;
  plan: SubscriptionPlan;
}

type View = 'landing' | 'auth' | 'dashboard' | 'generator' | 'editor' | 'resources' | 'pricing' | 'admin' | 'profile' | 'questions' | 'templates' | 'ai-tools' | 'analytics' | 'preview';

// Chart data
const examTrendsData = [
  { name: 'Jan', exams: 24, questions: 240 },
  { name: 'Feb', exams: 35, questions: 350 },
  { name: 'Mar', exams: 45, questions: 450 },
  { name: 'Apr', exams: 52, questions: 520 },
  { name: 'May', exams: 61, questions: 610 },
  { name: 'Jun', exams: 78, questions: 780 },
  { name: 'Jul', exams: 85, questions: 850 },
];

const subjectDistribution = [
  { name: 'Mathematics', value: 35, color: 'oklch(0.55 0.19 145)' },
  { name: 'Science', value: 25, color: 'oklch(0.55 0.14 180)' },
  { name: 'English', value: 20, color: 'oklch(0.70 0.18 160)' },
  { name: 'History', value: 12, color: 'oklch(0.65 0.15 85)' },
  { name: 'Geography', value: 8, color: 'oklch(0.60 0.12 200)' },
];

const usageData = [
  { name: 'Week 1', ai: 45, manual: 12 },
  { name: 'Week 2', ai: 52, manual: 8 },
  { name: 'Week 3', ai: 61, manual: 15 },
  { name: 'Week 4', ai: 78, manual: 10 },
];

// Floating leaf component
const FloatingElement = ({ delay = 0, className = '' }: { delay?: number; className?: string }) => (
  <motion.div
    className={`absolute opacity-20 pointer-events-none ${className}`}
    animate={{
      y: [0, -20, 0],
      x: [0, 10, -10, 0],
      rotate: [0, 10, -10, 0],
    }}
    transition={{
      duration: 8 + delay,
      repeat: Infinity,
      ease: "easeInOut",
      delay: delay / 2,
    }}
  >
    <Leaf className="w-8 h-8 text-grass-500" />
  </motion.div>
);

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<View>('landing');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Auth state
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [authStep, setAuthStep] = useState<'email' | 'password' | 'register'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  // Curriculum data
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classLevels, setClassLevels] = useState<ClassLevel[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  
  // Exam generator state
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedClassLevel, setSelectedClassLevel] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [examType, setExamType] = useState('Midterm');
  const [totalMarks, setTotalMarks] = useState(50);
  const [duration, setDuration] = useState(60);
  const [difficultyMix, setDifficultyMix] = useState('balanced');
  const [generating, setGenerating] = useState(false);
  const [useExtractedQuestions, setUseExtractedQuestions] = useState(true);
  
  // Exams state
  const [exams, setExams] = useState<Exam[]>([]);
  const [currentExam, setCurrentExam] = useState<Exam | null>(null);
  const [includeMarkingScheme, setIncludeMarkingScheme] = useState(true);
  const [exporting, setExporting] = useState(false);
  
  // Resources state
  const [resourceTab, setResourceTab] = useState<'pastPapers' | 'syllabus' | 'textbooks'>('pastPapers');
  const [pastPapers, setPastPapers] = useState<any[]>([]);
  const [syllabusDocs, setSyllabusDocs] = useState<any[]>([]);
  const [textbooks, setTextbooks] = useState<any[]>([]);
  
  // Upload dialog state
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadType, setUploadType] = useState<'pastPaper' | 'syllabus' | 'textbook'>('pastPaper');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Upload form state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadYear, setUploadYear] = useState(new Date().getFullYear());
  const [uploadSubject, setUploadSubject] = useState('');
  const [uploadClassLevel, setUploadClassLevel] = useState('');
  
  // Subscription state
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  
  // UI state
  const [showWelcome, setShowWelcome] = useState(false);
  const [showAssistant, setShowAssistant] = useState(false);
  const [assistantMessage, setAssistantMessage] = useState('');
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantMessages, setAssistantMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  
  // Notifications
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // New features state
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareExamId, setShareExamId] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importSubject, setImportSubject] = useState('');
  const [importClassLevel, setImportClassLevel] = useState('');
  
  const [aiToolOpen, setAiToolOpen] = useState(false);
  const [currentAiTool, setCurrentAiTool] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [topicCoverage, setTopicCoverage] = useState<any[]>([]);
  
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Mount effect
  useEffect(() => {
    setMounted(true);
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const res = await fetch('/api/auth/session');
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        setView('dashboard');
        fetchCurriculumData();
        fetchExams();
        fetchResources();
        fetchSubscription();
      }
    } catch (error) {
      console.error('Session check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurriculumData = async () => {
    try {
      const [subjectsRes, classLevelsRes] = await Promise.all([
        fetch('/api/subjects'),
        fetch('/api/class-levels'),
      ]);
      const subjectsData = await subjectsRes.json();
      const classLevelsData = await classLevelsRes.json();
      setSubjects(subjectsData.subjects || []);
      setClassLevels(classLevelsData.classLevels || []);
    } catch (error) {
      console.error('Error fetching curriculum data:', error);
    }
  };

  const fetchTopics = async (subjectId: string, classLevelId: string) => {
    try {
      const res = await fetch(`/api/topics?subjectId=${subjectId}&classLevelId=${classLevelId}`);
      const data = await res.json();
      setTopics(data.topics || []);
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  };

  const fetchExams = async () => {
    try {
      const res = await fetch('/api/exams');
      const data = await res.json();
      setExams(data.exams || []);
    } catch (error) {
      console.error('Error fetching exams:', error);
    }
  };

  const fetchResources = async () => {
    try {
      const [ppRes, sylRes, tbRes] = await Promise.all([
        fetch('/api/past-papers'),
        fetch('/api/syllabus'),
        fetch('/api/textbooks'),
      ]);
      const ppData = await ppRes.json();
      const sylData = await sylRes.json();
      const tbData = await tbRes.json();
      setPastPapers(ppData.pastPapers || []);
      setSyllabusDocs(sylData.syllabusDocs || []);
      setTextbooks(tbData.textbooks || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
    }
  };

  const fetchSubscription = async () => {
    try {
      const [subRes, plansRes] = await Promise.all([
        fetch('/api/subscriptions'),
        fetch('/api/subscriptions/plans'),
      ]);
      const subData = await subRes.json();
      const plansData = await plansRes.json();
      setSubscription(subData.subscription || null);
      setSubscriptionPlans(plansData.plans || []);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      const endpoint = authTab === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = authTab === 'login' ? { email, password } : { email, password, name };
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Authentication failed');
        return;
      }
      setUser(data.user);
      setView('dashboard');
      fetchCurriculumData();
      fetchExams();
      fetchResources();
      fetchSubscription();
      toast.success(authTab === 'login' ? 'Welcome back!' : 'Account created successfully!');
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setView('landing');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const handleGenerateExam = async () => {
    if (!selectedSubject || !selectedClassLevel) {
      toast.error('Please select a subject and class level');
      return;
    }
    if (subscription && subscription.plan.maxExamsPerMonth > 0 && subscription.examsThisMonth >= subscription.plan.maxExamsPerMonth) {
      toast.error('Monthly exam limit reached. Please upgrade your plan.');
      setView('pricing');
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch('/api/exams/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: selectedSubject,
          classLevelId: selectedClassLevel,
          topicId: selectedTopic && selectedTopic !== 'all' ? selectedTopic : null,
          examType, totalMarks, duration, difficultyMix, useExtractedQuestions,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to generate exam');
        return;
      }
      setCurrentExam(data.exam);
      setView('editor');
      fetchExams();
      fetchSubscription();
      toast.success('Exam generated successfully!');
    } catch (error) {
      toast.error('Failed to generate exam');
    } finally {
      setGenerating(false);
    }
  };

  const handleExportPDF = async (examId: string) => {
    setExporting(true);
    try {
      const res = await fetch('/api/exams/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examId, includeMarkingScheme }),
      });
      if (!res.ok) {
        toast.error('Failed to export PDF');
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `exam_${examId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success('PDF exported successfully!');
    } catch (error) {
      toast.error('Failed to export PDF');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteExam = async (examId: string) => {
    if (!confirm('Are you sure you want to delete this exam?')) return;
    try {
      const res = await fetch(`/api/exams?id=${examId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to delete exam');
        return;
      }
      setExams(exams.filter(e => e.id !== examId));
      toast.success('Exam deleted successfully');
    } catch (error) {
      toast.error('Failed to delete exam');
    }
  };

  const handleSubscribe = async (planSlug: string) => {
    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planSlug, billingCycle }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Subscription failed');
        return;
      }
      toast.success('Subscription updated!');
      fetchSubscription();
      setView('dashboard');
    } catch (error) {
      toast.error('Subscription failed');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !uploadTitle || !uploadSubject || !uploadClassLevel) {
      toast.error('Please fill in all required fields');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('title', uploadTitle);
      formData.append('year', uploadYear.toString());
      formData.append('subjectId', uploadSubject);
      formData.append('classLevelId', uploadClassLevel);
      const endpoint = uploadType === 'pastPaper' ? '/api/past-papers/upload' : uploadType === 'syllabus' ? '/api/syllabus/upload' : '/api/textbooks/upload';
      const res = await fetch(endpoint, { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Upload failed');
        return;
      }
      toast.success('Document uploaded successfully!');
      setUploadDialogOpen(false);
      resetUploadForm();
      fetchResources();
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const resetUploadForm = () => {
    setUploadFile(null);
    setUploadTitle('');
    setUploadYear(new Date().getFullYear());
    setUploadSubject('');
    setUploadClassLevel('');
  };

  const handleDeleteResource = async (type: 'pastPaper' | 'syllabus' | 'textbook', id: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;
    try {
      const endpoint = type === 'pastPaper' ? '/api/past-papers' : type === 'syllabus' ? '/api/syllabus' : '/api/textbooks';
      const res = await fetch(`${endpoint}?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to delete');
        return;
      }
      if (type === 'pastPaper') {
        setPastPapers(pastPapers.filter(p => p.id !== id));
      } else if (type === 'syllabus') {
        setSyllabusDocs(syllabusDocs.filter(s => s.id !== id));
      } else {
        setTextbooks(textbooks.filter(t => t.id !== id));
      }
      toast.success('Resource deleted');
    } catch (error) {
      toast.error('Failed to delete resource');
    }
  };

  const openUploadDialog = (type: 'pastPaper' | 'syllabus' | 'textbook') => {
    setUploadType(type);
    resetUploadForm();
    setUploadDialogOpen(true);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { bg: string; text: string }> = {
      completed: { bg: 'bg-grass-100 dark:bg-grass-900/30', text: 'text-grass-700 dark:text-grass-400' },
      processing: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400' },
      failed: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
      default: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-400' },
    };
    const v = variants[status] || variants.default;
    return <Badge className={`${v.bg} ${v.text}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  const getPlanIcon = (slug: string): React.ReactNode => {
    const icons: Record<string, React.ReactNode> = {
      free: <Sprout className="h-5 w-5" />,
      pro: <TreePine className="h-5 w-5" />,
      school: <Building2 className="h-5 w-5" />,
      district: <Trees className="h-5 w-5" />,
    };
    return icons[slug] || <Sprout className="h-5 w-5" />;
  };

  // Stripe Checkout
  const handleStripeCheckout = async (planSlug: string, cycle: 'monthly' | 'yearly') => {
    setCheckoutLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planSlug, billingCycle: cycle }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error('Failed to create checkout session');
      }
    } catch (error) {
      toast.error('Checkout failed');
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Share Exam
  const handleShareExam = async (examId: string) => {
    setShareExamId(examId);
    setShareLoading(true);
    setShareDialogOpen(true);
    try {
      const res = await fetch('/api/share/exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examId, expiresIn: 168 }),
      });
      const data = await res.json();
      if (data.shareUrl) {
        setShareLink(data.shareUrl);
        toast.success('Share link created!');
      } else {
        toast.error('Failed to create share link');
      }
    } catch (error) {
      toast.error('Failed to share exam');
    } finally {
      setShareLoading(false);
    }
  };

  const copyShareLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      toast.success('Link copied to clipboard!');
    }
  };

  // Bulk Import Questions
  const handleImportQuestions = async () => {
    if (!importFile || !importSubject || !importClassLevel) {
      toast.error('Please fill all fields');
      return;
    }
    setImportLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', importFile);
      formData.append('subjectId', importSubject);
      formData.append('classLevelId', importClassLevel);
      
      const res = await fetch('/api/import/questions', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Imported ${data.imported} questions!`);
        setImportDialogOpen(false);
        setImportFile(null);
      } else {
        toast.error(data.error || 'Import failed');
      }
    } catch (error) {
      toast.error('Import failed');
    } finally {
      setImportLoading(false);
    }
  };

  // AI Tools
  const handleAiTool = async (tool: string, params: any) => {
    setCurrentAiTool(tool);
    setAiLoading(true);
    setAiToolOpen(true);
    setAiResult(null);
    try {
      const res = await fetch(`/api/ai/${tool}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (data.success) {
        setAiResult(data);
        toast.success('AI analysis complete!');
      } else {
        toast.error(data.error || 'AI tool failed');
      }
    } catch (error) {
      toast.error('AI tool failed');
    } finally {
      setAiLoading(false);
    }
  };

  // Fetch Analytics
  const fetchAnalytics = async (period: string = '30') => {
    try {
      const res = await fetch(`/api/analytics?period=${period}`);
      const data = await res.json();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  // Fetch Topic Coverage
  const fetchTopicCoverage = async () => {
    try {
      const res = await fetch('/api/topic-coverage');
      const data = await res.json();
      setTopicCoverage(data.allTopics || []);
    } catch (error) {
      console.error('Failed to fetch topic coverage:', error);
    }
  };

  // API Keys
  const fetchApiKeys = async () => {
    try {
      const res = await fetch('/api/api-keys');
      const data = await res.json();
      setApiKeys(data.keys || []);
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
    }
  };

  const createApiKey = async () => {
    if (!newKeyName) {
      toast.error('Please enter a name');
      return;
    }
    try {
      const res = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName }),
      });
      const data = await res.json();
      if (data.key) {
        toast.success('API key created! Copy it now - it won\'t be shown again.');
        setApiKeys([...apiKeys, data.key]);
        setNewKeyName('');
      }
    } catch (error) {
      toast.error('Failed to create API key');
    }
  };

  const revokeApiKey = async (keyId: string) => {
    try {
      await fetch(`/api/api-keys?id=${keyId}`, { method: 'DELETE' });
      setApiKeys(apiKeys.filter(k => k.id !== keyId));
      toast.success('API key revoked');
    } catch (error) {
      toast.error('Failed to revoke API key');
    }
  };

  // Update topics when subject/class level changes
  useEffect(() => {
    if (selectedSubject && selectedClassLevel) {
      fetchTopics(selectedSubject, selectedClassLevel);
      setSelectedTopic('all');
    }
  }, [selectedSubject, selectedClassLevel]);

  // Loading screen
  if (loading || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-grass-50 via-background to-teal-50 dark:from-grass-950 dark:via-background dark:to-teal-950">
        <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <motion.div
            className="relative inline-block"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="p-4 bg-gradient-to-br from-grass-500 to-teal-600 rounded-3xl shadow-2xl shadow-grass-500/30">
              <GraduationCap className="h-16 w-16 text-white" />
            </div>
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-grass-500 to-teal-600 rounded-3xl blur-xl opacity-50"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.3, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
          <motion.p className="mt-6 text-xl font-semibold text-foreground" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}>
            Loading EDUC.AI
          </motion.p>
          <p className="mt-2 text-sm text-muted-foreground">AI-Powered Exam Generation</p>
        </motion.div>
      </div>
    );
  }

  // Landing Page
  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-background overflow-hidden">
        {/* Animated Nature Background */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          {/* Gradient orbs */}
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-grass-400/30 to-teal-500/20 rounded-full blur-3xl animate-blob" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-teal-400/30 to-grass-500/20 rounded-full blur-3xl animate-blob animation-delay-200" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-mint-400/10 to-grass-500/10 rounded-full blur-3xl animate-blob animation-delay-500" />
          
          {/* Pattern overlay */}
          <div className="absolute inset-0 pattern-leaves opacity-30" />
          
          {/* Floating elements */}
          <FloatingElement delay={0} className="top-20 left-[10%]" />
          <FloatingElement delay={2} className="top-40 right-[15%]" />
          <FloatingElement delay={4} className="bottom-20 left-[20%]" />
          <FloatingElement delay={6} className="top-60 right-[30%]" />
        </div>

        {/* Navigation */}
        <motion.nav 
          className="fixed top-0 left-0 right-0 z-50 glass border-b border-grass-200/20 dark:border-grass-800/20"
          initial={{ y: -100 }} animate={{ y: 0 }} transition={{ type: 'spring', stiffness: 100 }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <motion.div className="flex items-center gap-3" whileHover={{ scale: 1.02 }}>
                <div className="p-2 bg-gradient-to-br from-grass-500 to-teal-600 rounded-xl shadow-lg shadow-grass-500/25">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold gradient-text">
                  EDUC.AI
                </span>
              </motion.div>
              
              <div className="hidden md:flex items-center gap-8">
                {['Features', 'Pricing', 'Testimonials', 'FAQ'].map((item) => (
                  <motion.a 
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="text-sm font-medium text-muted-foreground hover:text-grass-600 dark:hover:text-grass-400 transition-colors"
                    whileHover={{ y: -2 }}
                  >
                    {item}
                  </motion.a>
                ))}
              </div>
              
              <div className="flex items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setTheme('light')}><Sun className="mr-2 h-4 w-4" /> Light</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme('dark')}><Moon className="mr-2 h-4 w-4" /> Dark</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme('system')}><Monitor className="mr-2 h-4 w-4" /> System</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Button variant="ghost" onClick={() => setView('auth')}>Sign In</Button>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    className="btn-grassy text-white shadow-lg shadow-grass-500/25" 
                    onClick={() => { setAuthTab('register'); setView('auth'); }}
                  >
                    <Sprout className="mr-2 h-4 w-4" />
                    Get Started Free
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.nav>

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-7xl mx-auto">
            <motion.div className="text-center" variants={stagger} initial="initial" animate="animate">
              <motion.div variants={slideUp}>
                <Badge className="mb-6 badge-grassy">
                  <Leaf className="h-3 w-3 mr-1" />
                  AI-Powered Education Platform
                </Badge>
              </motion.div>
              
              <motion.h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight font-display" variants={slideUp}>
                <span className="text-foreground">Generate </span>
                <span className="gradient-text">
                  Professional Exams
                </span>
                <br />
                <span className="text-foreground">in Minutes</span>
              </motion.h1>
              
              <motion.p className="mt-6 text-xl text-muted-foreground max-w-3xl mx-auto" variants={slideUp}>
                Transform your teaching with AI-powered exam generation. Create curriculum-aligned 
                exam papers instantly from past papers, syllabi, and textbooks.
              </motion.p>
              
              <motion.div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4" variants={slideUp}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    size="lg" 
                    className="btn-grassy text-white shadow-xl shadow-grass-500/25 px-8 h-14 text-base rounded-full"
                    onClick={() => { setAuthTab('register'); setView('auth'); }}
                  >
                    <Sprout className="mr-2 h-5 w-5" />
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" variant="outline" className="px-8 h-14 text-base rounded-full border-2 border-grass-300 dark:border-grass-700">
                    <Play className="mr-2 h-5 w-5" />
                    Watch Demo
                  </Button>
                </motion.div>
              </motion.div>
              
              <motion.div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground" variants={slideUp}>
                {['No credit card required', '5 free exams/month', 'Cancel anytime'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-grass-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>
            
            {/* Dashboard Preview */}
            <motion.div 
              className="mt-20 relative"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-grass-500/20 via-teal-500/20 to-mint-500/20 blur-3xl" />
              <div className="relative bg-card rounded-3xl shadow-2xl border border-border overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b border-border">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-grass-400" />
                </div>
                <div className="p-6 h-[450px] bg-gradient-to-br from-muted/30 to-muted/10">
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    {[{ label: 'Exams', value: '127', icon: FileText }, { label: 'Questions', value: '2,847', icon: FileQuestion }, { label: 'Resources', value: '45', icon: Library }, { label: 'Users', value: '12', icon: Users }].map((stat, i) => (
                      <motion.div 
                        key={i}
                        className="card-grassy p-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 + i * 0.1 }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <stat.icon className="h-4 w-4 text-grass-500" />
                          <span className="text-sm text-muted-foreground">{stat.label}</span>
                        </div>
                        <p className="text-2xl font-bold gradient-text">{stat.value}</p>
                      </motion.div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="card-grassy p-4">
                      <p className="text-sm font-medium text-muted-foreground mb-4">Exam Trends</p>
                      <div className="h-32 flex items-end gap-2">
                        {[40, 55, 65, 80, 75, 90, 95].map((h, i) => (
                          <div key={i} className="flex-1 bg-gradient-to-t from-grass-500 to-teal-400 rounded-t-lg" style={{ height: `${h}%` }} />
                        ))}
                      </div>
                    </div>
                    <div className="card-grassy p-4">
                      <p className="text-sm font-medium text-muted-foreground mb-4">Subject Distribution</p>
                      <div className="h-32 flex items-center justify-center">
                        <div className="relative w-24 h-24">
                          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-grass-500 to-teal-500" style={{ clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 50% 0%)' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-gradient-to-r from-grass-600 via-teal-600 to-mint-600 relative overflow-hidden">
          <div className="absolute inset-0 pattern-dots opacity-10" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
              {[
                { value: '10,000+', label: 'Teachers', icon: Users },
                { value: '50,000+', label: 'Exams Generated', icon: FileText },
                { value: '500,000+', label: 'Questions Created', icon: FileQuestion },
                { value: '98%', label: 'Satisfaction Rate', icon: Heart },
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  className="relative group"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <stat.icon className="h-8 w-8 mx-auto mb-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                  <p className="text-4xl md:text-5xl font-bold font-display">{stat.value}</p>
                  <p className="mt-2 text-grass-100">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-muted/30 relative">
          <div className="absolute inset-0 pattern-grid opacity-50" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Badge className="mb-4 badge-grassy">
                <Sparkles className="h-3 w-3 mr-1" />
                Features
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground font-display">
                Everything you need to create exams
              </h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                Powerful AI tools combined with intuitive design to streamline your exam creation workflow.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Brain,
                  title: 'AI Question Generation',
                  description: 'Generate exam questions automatically using advanced AI trained on curriculum content.',
                  color: 'from-grass-500 to-teal-500'
                },
                {
                  icon: Library,
                  title: 'Resource Library',
                  description: 'Upload and manage past papers, syllabi, and textbooks for intelligent question extraction.',
                  color: 'from-teal-500 to-mint-500'
                },
                {
                  icon: FileText,
                  title: 'PDF Export',
                  description: 'Export professionally formatted exam papers with marking schemes ready for printing.',
                  color: 'from-mint-500 to-grass-500'
                },
                {
                  icon: Target,
                  title: 'Curriculum Alignment',
                  description: 'Questions are automatically aligned with specific curriculum topics and learning objectives.',
                  color: 'from-grass-600 to-teal-600'
                },
                {
                  icon: BarChart3,
                  title: 'Analytics Dashboard',
                  description: 'Track your exam creation patterns, topic coverage, and resource utilization.',
                  color: 'from-teal-600 to-mint-600'
                },
                {
                  icon: Users,
                  title: 'Team Collaboration',
                  description: 'Share exams with colleagues, collaborate on question banks, and maintain consistency.',
                  color: 'from-mint-600 to-grass-600'
                },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  className="card-grassy p-6 group"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 bg-background relative">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-grass-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Badge className="mb-4 badge-grassy">
                <TreePine className="h-3 w-3 mr-1" />
                Pricing
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground font-display">
                Simple, transparent pricing
              </h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                Choose the plan that grows with your needs. All plans include core features.
              </p>
              
              {/* Billing toggle */}
              <div className="mt-8 flex items-center justify-center gap-4">
                <span className={`text-sm ${billingCycle === 'monthly' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>Monthly</span>
                <Switch
                  checked={billingCycle === 'yearly'}
                  onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
                  className="data-[state=checked]:bg-grass-500"
                />
                <span className={`text-sm ${billingCycle === 'yearly' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                  Yearly <Badge className="ml-1 bg-grass-100 text-grass-700 dark:bg-grass-900/30 dark:text-grass-400">Save 20%</Badge>
                </span>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: 'Free',
                  icon: Sprout,
                  price: '$0',
                  description: 'Perfect for trying out EDUC.AI',
                  features: ['5 exams per month', '50 questions per exam', 'PDF export', 'Basic analytics'],
                  color: 'from-grass-500 to-teal-500',
                  popular: false
                },
                {
                  name: 'Pro',
                  icon: TreePine,
                  price: billingCycle === 'yearly' ? '$19' : '$24',
                  description: 'For individual teachers and tutors',
                  features: ['Unlimited exams', 'Unlimited questions', 'AI question generation', 'Advanced analytics', 'Priority support', 'Custom formats'],
                  color: 'from-teal-500 to-mint-500',
                  popular: true
                },
                {
                  name: 'School',
                  icon: Building2,
                  price: billingCycle === 'yearly' ? '$99' : '$129',
                  description: 'For schools and institutions',
                  features: ['Everything in Pro', 'Up to 50 users', 'Admin dashboard', 'API access', 'White-label options', 'Dedicated support'],
                  color: 'from-mint-500 to-grass-600',
                  popular: false
                },
              ].map((plan, i) => (
                <motion.div
                  key={i}
                  className={`relative card-grassy p-8 ${plan.popular ? 'ring-2 ring-grass-500 scale-105' : ''}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-grass-500 to-teal-500 text-white">
                        <Star className="h-3 w-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                    <plan.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground font-display">{plan.name}</h3>
                  <p className="text-muted-foreground mt-1">{plan.description}</p>
                  <div className="mt-6 mb-6">
                    <span className="text-4xl font-bold gradient-text">{plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-grass-500 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${plan.popular ? 'btn-grassy text-white' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => {
                      setAuthTab('register');
                      setView('auth');
                    }}
                  >
                    {plan.name === 'Free' ? 'Get Started' : 'Start Free Trial'}
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 bg-muted/30 relative overflow-hidden">
          <div className="absolute inset-0 pattern-leaves opacity-20" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Badge className="mb-4 badge-grassy">
                <Heart className="h-3 w-3 mr-1" />
                Testimonials
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground font-display">
                Loved by teachers everywhere
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  quote: "EDUC.AI has transformed how I prepare exams. What used to take hours now takes minutes!",
                  author: "Sarah Johnson",
                  role: "Mathematics Teacher, Kenya",
                  avatar: "SJ"
                },
                {
                  quote: "The AI-generated questions are perfectly aligned with our curriculum. A game-changer for educators.",
                  author: "David Ochieng",
                  role: "Science Department Head, Tanzania",
                  avatar: "DO"
                },
                {
                  quote: "Finally, a tool that understands the unique needs of African educators. Highly recommended!",
                  author: "Grace Mwaura",
                  role: "Curriculum Developer, Uganda",
                  avatar: "GM"
                },
              ].map((testimonial, i) => (
                <motion.div
                  key={i}
                  className="card-glass p-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Quote className="h-8 w-8 text-grass-500/30 mb-4" />
                  <p className="text-foreground mb-6 italic">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-br from-grass-500 to-teal-500 text-white">
                        {testimonial.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{testimonial.author}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-grass-600 via-teal-600 to-mint-600 relative overflow-hidden">
          <div className="absolute inset-0 pattern-dots opacity-10" />
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          </div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <TreeDeciduous className="h-16 w-16 mx-auto text-white/80 mb-6" />
              <h2 className="text-3xl sm:text-4xl font-bold text-white font-display mb-6">
                Ready to transform your exam creation?
              </h2>
              <p className="text-xl text-white/80 mb-8">
                Join thousands of educators already using EDUC.AI to save time and create better exams.
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  size="lg" 
                  className="bg-white text-grass-700 hover:bg-grass-50 shadow-xl px-8 h-14 text-base rounded-full"
                  onClick={() => { setAuthTab('register'); setView('auth'); }}
                >
                  <Sprout className="mr-2 h-5 w-5" />
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-card border-t border-border py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-gradient-to-br from-grass-500 to-teal-600 rounded-xl">
                    <GraduationCap className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-lg font-bold gradient-text">EDUC.AI</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  AI-powered exam generation for modern educators.
                </p>
              </div>
              {[
                { title: 'Product', links: ['Features', 'Pricing', 'API'] },
                { title: 'Resources', links: ['Documentation', 'Blog', 'Support'] },
                { title: 'Company', links: ['About', 'Contact', 'Privacy'] },
              ].map((section, i) => (
                <div key={i}>
                  <h3 className="font-semibold text-foreground mb-4">{section.title}</h3>
                  <ul className="space-y-2">
                    {section.links.map((link, j) => (
                      <li key={j}>
                        <a href="#" className="text-sm text-muted-foreground hover:text-grass-600 dark:hover:text-grass-400 transition-colors">
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="border-t border-border mt-8 pt-8 text-center">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} EDUC.AI. All rights reserved. Made with 💚 for educators.
              </p>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // Auth View - Gmail Style
  if (view === 'auth') {
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <motion.div 
            className="w-full max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <motion.div 
                className="flex items-center gap-2 cursor-pointer"
                whileHover={{ scale: 1.02 }}
                onClick={() => setView('landing')}
              >
                <div className="p-2.5 bg-gradient-to-br from-grass-500 to-teal-600 rounded-xl shadow-lg">
                  <GraduationCap className="h-7 w-7 text-white" />
                </div>
                <span className="text-2xl font-bold gradient-text">EDUC.AI</span>
              </motion.div>
            </div>

            {/* Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-10">
              <AnimatePresence mode="wait">
                {/* Email Step */}
                {authStep === 'email' && authTab === 'login' && (
                  <motion.div
                    key="email-step"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-center mb-8">
                      <h1 className="text-2xl font-normal text-slate-800 dark:text-white mb-2">Sign in</h1>
                      <p className="text-slate-600 dark:text-slate-400">Use your EDUC.AI Account</p>
                    </div>

                    <form onSubmit={(e) => {
                      e.preventDefault();
                      if (email) setAuthStep('password');
                    }}>
                      <div className="space-y-6">
                        <div>
                          <Input
                            type="email"
                            placeholder="Email or phone"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-12 px-4 text-base border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-grass-500 focus:border-transparent"
                          />
                        </div>

                        <div className="text-sm">
                          <button
                            type="button"
                            className="text-grass-600 dark:text-grass-400 font-medium hover:underline"
                            onClick={() => setAuthTab('register')}
                          >
                            Create account
                          </button>
                        </div>

                        <div className="flex justify-end pt-4">
                          <Button
                            type="submit"
                            className="bg-grass-600 hover:bg-grass-700 text-white px-6 h-10 rounded-full font-medium"
                            disabled={!email || authLoading}
                          >
                            {authLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Next'}
                          </Button>
                        </div>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* Password Step */}
                {authStep === 'password' && authTab === 'login' && (
                  <motion.div
                    key="password-step"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-center mb-8">
                      <h1 className="text-2xl font-normal text-slate-800 dark:text-white mb-2">Welcome</h1>
                      <div className="flex items-center justify-center gap-3 mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gradient-to-br from-grass-500 to-teal-500 text-white text-sm">
                            {email.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-slate-700 dark:text-slate-300 text-sm">{email}</span>
                        <button
                          type="button"
                          onClick={() => setAuthStep('email')}
                          className="text-grass-600 dark:text-grass-400 text-xs font-medium hover:underline"
                        >
                          Change
                        </button>
                      </div>
                    </div>

                    <form onSubmit={handleAuth}>
                      <div className="space-y-6">
                        <div>
                          <Input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoFocus
                            className="h-12 px-4 text-base border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-grass-500 focus:border-transparent"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                              checked={rememberMe}
                              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                              className="border-slate-400"
                            />
                            <span className="text-sm text-slate-600 dark:text-slate-400">Show password</span>
                          </label>
                        </div>

                        <div className="flex items-center justify-between pt-4">
                          <button
                            type="button"
                            className="text-grass-600 dark:text-grass-400 font-medium text-sm hover:underline"
                          >
                            Forgot password?
                          </button>
                          <Button
                            type="submit"
                            className="bg-grass-600 hover:bg-grass-700 text-white px-6 h-10 rounded-full font-medium"
                            disabled={!password || authLoading}
                          >
                            {authLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign in'}
                          </Button>
                        </div>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* Register Step */}
                {authTab === 'register' && (
                  <motion.div
                    key="register-step"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-center mb-8">
                      <h1 className="text-2xl font-normal text-slate-800 dark:text-white mb-2">Create account</h1>
                      <p className="text-slate-600 dark:text-slate-400">Start your free trial today</p>
                    </div>

                    <form onSubmit={handleAuth}>
                      <div className="space-y-5">
                        <div>
                          <Input
                            type="text"
                            placeholder="Full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="h-12 px-4 text-base border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-grass-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <Input
                            type="email"
                            placeholder="Your email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-12 px-4 text-base border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-grass-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <Input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-12 px-4 text-base border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-grass-500 focus:border-transparent"
                          />
                        </div>

                        <div className="flex items-start gap-2">
                          <Checkbox
                            checked={rememberMe}
                            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                            className="border-slate-400 mt-1"
                          />
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            I agree to the{' '}
                            <a href="#" className="text-grass-600 dark:text-grass-400 hover:underline">Terms of Service</a>
                            {' '}and{' '}
                            <a href="#" className="text-grass-600 dark:text-grass-400 hover:underline">Privacy Policy</a>
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-4">
                          <button
                            type="button"
                            className="text-grass-600 dark:text-grass-400 font-medium text-sm hover:underline"
                            onClick={() => {
                              setAuthTab('login');
                              setAuthStep('email');
                            }}
                          >
                            Sign in instead
                          </button>
                          <Button
                            type="submit"
                            className="bg-grass-600 hover:bg-grass-700 text-white px-6 h-10 rounded-full font-medium"
                            disabled={!email || !password || !name || authLoading}
                          >
                            {authLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create account'}
                          </Button>
                        </div>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Divider with "or" */}
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-slate-200 dark:border-slate-800"></div>
              <span className="px-4 text-sm text-slate-500 dark:text-slate-400">or</span>
              <div className="flex-1 border-t border-slate-200 dark:border-slate-800"></div>
            </div>

            {/* Social Login */}
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 border-slate-300 dark:border-slate-700 rounded-lg font-normal hover:bg-slate-50 dark:hover:bg-slate-800"
                onClick={() => toast.info('Google Sign In coming soon!')}
              >
                <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>
            </div>

            {/* Footer Links */}
            <div className="mt-8 flex items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
              <span>English (United States)</span>
              <div className="flex gap-4">
                <a href="#" className="hover:text-slate-700 dark:hover:text-slate-300 hover:underline">Help</a>
                <a href="#" className="hover:text-slate-700 dark:hover:text-slate-300 hover:underline">Privacy</a>
                <a href="#" className="hover:text-slate-700 dark:hover:text-slate-300 hover:underline">Terms</a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Dashboard View (simplified for this demo)
  if (view === 'dashboard' && user) {
    return (
      <div className="min-h-screen bg-background">
        {/* Dashboard Header */}
        <header className="sticky top-0 z-50 glass border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-grass-500 to-teal-600 rounded-xl">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold gradient-text">EDUC.AI</span>
              </div>
              
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gradient-to-br from-grass-500 to-teal-500 text-white text-sm">
                          {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden md:inline">{user.name || user.email}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setView('profile')}>
                      <User className="mr-2 h-4 w-4" /> Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setView('settings')}>
                      <Settings className="mr-2 h-4 w-4" /> Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" /> Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold font-display text-foreground">
                Welcome back, {user.name?.split(' ')[0] || 'Teacher'}! 👋
              </h1>
              <p className="text-muted-foreground mt-1">
                Here's what's happening with your exams today.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[
                { label: 'Total Exams', value: exams.length, icon: FileText, color: 'from-grass-500 to-teal-500' },
                { label: 'Questions', value: exams.reduce((acc, e) => acc + (e.examQuestions?.length || 0), 0), icon: FileQuestion, color: 'from-teal-500 to-mint-500' },
                { label: 'Resources', value: pastPapers.length + syllabusDocs.length + textbooks.length, icon: Library, color: 'from-mint-500 to-grass-500' },
                { label: 'This Month', value: subscription?.examsThisMonth || 0, icon: Calendar, color: 'from-grass-600 to-teal-600' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  className="card-grassy p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">{stat.label}</span>
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}>
                      <stat.icon className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold gradient-text">{stat.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className="card-grassy p-6">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="flex items-center gap-2 font-display">
                    <Wand2 className="h-5 w-5 text-grass-500" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      className="btn-grassy text-white justify-start"
                      onClick={() => setView('generator')}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      New Exam
                    </Button>
                    <Button variant="outline" className="justify-start" onClick={() => setView('resources')}>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload
                    </Button>
                    <Button variant="outline" className="justify-start" onClick={() => setView('questions')}>
                      <FileQuestion className="mr-2 h-4 w-4" />
                      Questions
                    </Button>
                    <Button variant="outline" className="justify-start" onClick={() => setView('analytics')}>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-grassy p-6">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="flex items-center gap-2 font-display">
                    <Rocket className="h-5 w-5 text-grass-500" />
                    Subscription
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {subscription ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-foreground">{subscription.plan.name} Plan</p>
                        <p className="text-sm text-muted-foreground">
                          {subscription.examsThisMonth} / {subscription.plan.maxExamsPerMonth === -1 ? '∞' : subscription.plan.maxExamsPerMonth} exams this month
                        </p>
                      </div>
                      <Button variant="outline" onClick={() => setView('pricing')}>
                        Upgrade
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground mb-3">No active subscription</p>
                      <Button className="btn-grassy text-white" onClick={() => setView('pricing')}>
                        View Plans
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Exams */}
            <Card className="card-grassy">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-display">Recent Exams</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setView('generator')}>
                    View All <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {exams.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No exams created yet</p>
                    <Button className="btn-grassy text-white" onClick={() => setView('generator')}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Exam
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {exams.slice(0, 5).map((exam) => (
                      <div 
                        key={exam.id} 
                        className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-br from-grass-500/20 to-teal-500/20 rounded-lg">
                            <FileText className="h-4 w-4 text-grass-600" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{exam.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {exam.examType} • {exam.totalMarks} marks • {exam.duration} mins
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(exam.status)}
                          <Button variant="ghost" size="icon" onClick={() => handleExportPDF(exam.id)}>
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    );
  }

  // Generator View (simplified)
  if (view === 'generator' && user) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 glass border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => setView('dashboard')}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-grass-500 to-teal-600 rounded-xl">
                    <GraduationCap className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-bold gradient-text">EDUC.AI</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center">
              <Badge className="mb-4 badge-grassy">
                <Wand2 className="h-3 w-3 mr-1" />
                AI Exam Generator
              </Badge>
              <h1 className="text-3xl font-bold font-display text-foreground">Create New Exam</h1>
              <p className="text-muted-foreground mt-2">Configure your exam settings and let AI do the magic</p>
            </div>

            <Card className="card-grassy p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger className="input-grassy">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Class Level</Label>
                  <Select value={selectedClassLevel} onValueChange={setSelectedClassLevel}>
                    <SelectTrigger className="input-grassy">
                      <SelectValue placeholder="Select class level" />
                    </SelectTrigger>
                    <SelectContent>
                      {classLevels.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Exam Type</Label>
                  <Select value={examType} onValueChange={setExamType}>
                    <SelectTrigger className="input-grassy">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Midterm">Midterm</SelectItem>
                      <SelectItem value="Final">Final</SelectItem>
                      <SelectItem value="Quiz">Quiz</SelectItem>
                      <SelectItem value="Assignment">Assignment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Total Marks</Label>
                  <Input 
                    type="number" 
                    value={totalMarks} 
                    onChange={(e) => setTotalMarks(parseInt(e.target.value))}
                    className="input-grassy"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Duration (minutes)</Label>
                  <Input 
                    type="number" 
                    value={duration} 
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="input-grassy"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Difficulty Mix</Label>
                  <Select value={difficultyMix} onValueChange={setDifficultyMix}>
                    <SelectTrigger className="input-grassy">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy (70% Easy)</SelectItem>
                      <SelectItem value="balanced">Balanced</SelectItem>
                      <SelectItem value="challenging">Challenging</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <Button 
                  className="btn-grassy text-white px-12 h-12 text-base"
                  onClick={handleGenerateExam}
                  disabled={generating || !selectedSubject || !selectedClassLevel}
                >
                  {generating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating Exam...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Generate Exam
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </motion.div>
        </main>
      </div>
    );
  }

  // Default fallback
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <p className="text-muted-foreground">View not found. Please refresh the page.</p>
        <Button variant="link" onClick={() => setView('landing')}>Go to Home</Button>
      </div>
    </div>
  );
}
