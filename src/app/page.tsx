'use client';

import { useState, useEffect, useRef } from 'react';
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
  TrendingDown, BarChart2, ArrowUpRight, ArrowDownRight, Minus, Link2, Tag
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

type View = 'landing' | 'auth' | 'dashboard' | 'generator' | 'editor' | 'resources' | 'pricing' | 'admin' | 'profile' | 'questions' | 'templates' | 'ai-tools' | 'analytics';

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
  { name: 'Mathematics', value: 35, color: '#10b981' },
  { name: 'Science', value: 25, color: '#14b8a6' },
  { name: 'English', value: 20, color: '#06b6d4' },
  { name: 'History', value: 12, color: '#8b5cf6' },
  { name: 'Geography', value: 8, color: '#f59e0b' },
];

const usageData = [
  { name: 'Week 1', ai: 45, manual: 12 },
  { name: 'Week 2', ai: 52, manual: 8 },
  { name: 'Week 3', ai: 61, manual: 15 },
  { name: 'Week 4', ai: 78, manual: 10 },
];

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<View>('landing');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Auth state
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  
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
      completed: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400' },
      processing: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400' },
      failed: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
      default: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-400' },
    };
    const v = variants[status] || variants.default;
    return <Badge className={`${v.bg} ${v.text}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  const getPlanIcon = (slug: string) => {
    const icons: Record<string, JSX.Element> = {
      free: <Zap className="h-5 w-5" />,
      pro: <Sparkles className="h-5 w-5" />,
      school: <Building2 className="h-5 w-5" />,
      district: <Crown className="h-5 w-5" />,
    };
    return icons[slug] || <Zap className="h-5 w-5" />;
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950">
        <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <motion.div
            className="relative inline-block"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl shadow-2xl shadow-emerald-500/30">
              <GraduationCap className="h-16 w-16 text-white" />
            </div>
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl blur-xl opacity-50"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.3, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
          <motion.p className="mt-6 text-xl font-semibold text-slate-700 dark:text-slate-300" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}>
            Loading EDUC.AI
          </motion.p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">AI-Powered Exam Generation</p>
        </motion.div>
      </div>
    );
  }

  // Landing Page
  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        </div>

        {/* Navigation */}
        <motion.nav 
          className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50"
          initial={{ y: -100 }} animate={{ y: 0 }} transition={{ type: 'spring', stiffness: 100 }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <motion.div className="flex items-center gap-3" whileHover={{ scale: 1.02 }}>
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg shadow-emerald-500/25">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
                  EDUC.AI
                </span>
              </motion.div>
              
              <div className="hidden md:flex items-center gap-8">
                {['Features', 'Pricing', 'Testimonials', 'FAQ'].map((item) => (
                  <motion.a 
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
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
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25" 
                    onClick={() => { setAuthTab('register'); setView('auth'); }}
                  >
                    Get Started Free
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.nav>

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div className="text-center" variants={stagger} initial="initial" animate="animate">
              <motion.div variants={slideUp}>
                <Badge className="mb-6 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 px-4 py-1.5">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI-Powered Education Platform
                </Badge>
              </motion.div>
              
              <motion.h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight" variants={slideUp}>
                <span className="text-slate-900 dark:text-white">Generate </span>
                <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
                  Professional Exams
                </span>
                <br />
                <span className="text-slate-900 dark:text-white">in Minutes</span>
              </motion.h1>
              
              <motion.p className="mt-6 text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto" variants={slideUp}>
                Transform your teaching with AI-powered exam generation. Create curriculum-aligned 
                exam papers instantly from past papers, syllabi, and textbooks.
              </motion.p>
              
              <motion.div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4" variants={slideUp}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-xl shadow-emerald-500/25 px-8 h-14 text-base rounded-full"
                    onClick={() => { setAuthTab('register'); setView('auth'); }}
                  >
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" variant="outline" className="px-8 h-14 text-base rounded-full border-2">
                    <Play className="mr-2 h-5 w-5" />
                    Watch Demo
                  </Button>
                </motion.div>
              </motion.div>
              
              <motion.div className="mt-8 flex items-center justify-center gap-6 text-sm text-slate-500 dark:text-slate-400" variants={slideUp}>
                {['No credit card required', '5 free exams/month', 'Cancel anytime'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
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
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 blur-3xl" />
              <div className="relative bg-slate-100 dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="p-6 h-[450px] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    {[{ label: 'Exams', value: '127', color: 'emerald' }, { label: 'Questions', value: '2,847', color: 'blue' }, { label: 'Resources', value: '45', color: 'purple' }, { label: 'Users', value: '12', color: 'teal' }].map((stat, i) => (
                      <motion.div 
                        key={i}
                        className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 + i * 0.1 }}
                      >
                        <Skeleton className="h-4 w-16 mb-2" />
                        <Skeleton className={`h-8 w-20 bg-${stat.color}-200 dark:bg-${stat.color}-800/50`} />
                      </motion.div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                      <Skeleton className="h-4 w-32 mb-4" />
                      <Skeleton className="h-32 w-full rounded-lg" />
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                      <Skeleton className="h-4 w-32 mb-4" />
                      <Skeleton className="h-32 w-full rounded-lg" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
              {[
                { value: '10,000+', label: 'Teachers' },
                { value: '50,000+', label: 'Exams Generated' },
                { value: '500,000+', label: 'Questions Created' },
                { value: '98%', label: 'Satisfaction Rate' },
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <p className="text-4xl md:text-5xl font-bold">{stat.value}</p>
                  <p className="mt-2 text-emerald-100">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-slate-50 dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Badge className="mb-4 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">Features</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                Everything you need to create exams
              </h2>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Powerful features designed for teachers and educators to create professional exam papers effortlessly.
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: Sparkles, title: 'AI-Powered Generation', description: 'Generate complete exams with AI using your curriculum, past papers, and textbooks.', color: 'from-emerald-500 to-teal-600' },
                { icon: FileText, title: 'Multiple Question Types', description: 'MCQ, short answer, structured questions, and essays with automatic marking schemes.', color: 'from-blue-500 to-cyan-600' },
                { icon: FileCheck, title: 'Past Paper Integration', description: 'Upload past national exams and extract questions automatically for reuse.', color: 'from-purple-500 to-pink-600' },
                { icon: BookOpen, title: 'Curriculum Aligned', description: 'Questions are aligned with national curriculum topics and learning objectives.', color: 'from-teal-500 to-emerald-600' },
                { icon: Download, title: 'Professional PDF Export', description: 'Export beautiful exam papers with your school branding and formatting.', color: 'from-amber-500 to-orange-600' },
                { icon: Users, title: 'Multi-User Support', description: 'Collaborate with other teachers and share resources across your school.', color: 'from-rose-500 to-red-600' },
                { icon: BarChart3, title: 'Analytics Dashboard', description: 'Track exam generation, question usage, and student performance metrics.', color: 'from-indigo-500 to-purple-600' },
                { icon: Shield, title: 'Secure & Private', description: 'Your data is encrypted and protected. GDPR compliant with data export options.', color: 'from-slate-500 to-slate-700' },
                { icon: Globe, title: 'Multi-Language Support', description: 'Create exams in English, Swahili, French, and other languages with ease.', color: 'from-cyan-500 to-blue-600' },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-shadow bg-white dark:bg-slate-800 overflow-hidden group">
                    <CardContent className="p-6">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                        <feature.icon className="h-7 w-7 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                      <p className="text-slate-600 dark:text-slate-400">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 bg-white dark:bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Badge className="mb-4 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Pricing</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                Simple, transparent pricing
              </h2>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
                Choose the plan that works best for you or your institution
              </p>
              
              <div className="flex items-center justify-center gap-4 mt-8">
                <span className={billingCycle === 'monthly' ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-500 dark:text-slate-400'}>Monthly</span>
                <Switch checked={billingCycle === 'yearly'} onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')} />
                <span className={billingCycle === 'yearly' ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-500 dark:text-slate-400'}>
                  Yearly <Badge className="ml-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Save 17%</Badge>
                </span>
              </div>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {subscriptionPlans.map((plan, index) => {
                const price = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly;
                const isPopular = plan.slug === 'pro';
                
                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <Card className={`relative h-full ${isPopular ? 'border-2 border-emerald-500 shadow-xl shadow-emerald-500/10' : 'border border-slate-200 dark:border-slate-800'}`}>
                      {isPopular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">Most Popular</Badge>
                        </div>
                      )}
                      <CardHeader className="text-center pb-2">
                        <div className="flex justify-center mb-3">
                          <div className={`p-3 rounded-2xl ${
                            plan.slug === 'free' ? 'bg-slate-100 dark:bg-slate-800' :
                            plan.slug === 'pro' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                            plan.slug === 'school' ? 'bg-blue-100 dark:bg-blue-900/30' :
                            'bg-purple-100 dark:bg-purple-900/30'
                          }`}>
                            {getPlanIcon(plan.slug)}
                          </div>
                        </div>
                        <CardTitle className="text-2xl">{plan.name}</CardTitle>
                        <CardDescription className="text-sm">{plan.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="text-center">
                        <div className="mb-4">
                          <span className="text-5xl font-bold text-slate-900 dark:text-white">${price.toFixed(2)}</span>
                          <span className="text-slate-500 dark:text-slate-400">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                        </div>
                        
                        <ul className="space-y-3 text-sm text-left mb-6">
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                            <span className="text-slate-600 dark:text-slate-400">{plan.maxExamsPerMonth === -1 ? 'Unlimited' : plan.maxExamsPerMonth} exams/month</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                            <span className="text-slate-600 dark:text-slate-400">{plan.maxQuestionsPerExam === -1 ? 'Unlimited' : plan.maxQuestionsPerExam} questions/exam</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                            <span className="text-slate-600 dark:text-slate-400">{plan.maxPastPapers === -1 ? 'Unlimited' : plan.maxPastPapers} past papers</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                            <span className="text-slate-600 dark:text-slate-400">AI-powered generation</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                            <span className="text-slate-600 dark:text-slate-400">PDF export</span>
                          </li>
                          {plan.customFormats && (
                            <li className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                              <span className="text-slate-600 dark:text-slate-400">Custom exam formats</span>
                            </li>
                          )}
                          {plan.analytics && (
                            <li className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                              <span className="text-slate-600 dark:text-slate-400">Analytics dashboard</span>
                            </li>
                          )}
                          {plan.prioritySupport && (
                            <li className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                              <span className="text-slate-600 dark:text-slate-400">Priority support</span>
                            </li>
                          )}
                          {plan.whiteLabel && (
                            <li className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                              <span className="text-slate-600 dark:text-slate-400">White-label solution</span>
                            </li>
                          )}
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className={`w-full ${isPopular ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white' : ''}`}
                          variant={isPopular ? 'default' : 'outline'}
                          onClick={() => { setAuthTab('register'); setView('auth'); }}
                        >
                          Get Started
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 bg-slate-50 dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Badge className="mb-4 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">Testimonials</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                Trusted by teachers across Africa
              </h2>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { name: 'Grace Mwangi', role: 'Science Teacher, Kenya', content: 'EDUC.AI has transformed how I prepare exams. What used to take days now takes minutes. The AI-generated questions are perfectly aligned with our curriculum.', avatar: 'G' },
                { name: 'Emmanuel Okafor', role: 'Mathematics Head, Nigeria', content: 'The ability to extract questions from past papers is incredible. My question bank has grown exponentially without any extra effort.', avatar: 'E' },
                { name: 'Amina Hassan', role: 'Principal, Tanzania', content: 'We switched our entire school to EDUC.AI. The school branding feature makes our exams look professional and consistent.', avatar: 'A' },
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full bg-white dark:bg-slate-800 border-0 shadow-lg">
                    <CardContent className="p-6">
                      <Quote className="h-10 w-10 text-emerald-500/20 mb-4" />
                      <p className="text-slate-600 dark:text-slate-300 mb-6 text-lg">{testimonial.content}</p>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-semibold">
                            {testimonial.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{testimonial.name}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{testimonial.role}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h2 
              className="text-3xl sm:text-4xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Ready to transform your exam creation?
            </motion.h2>
            <motion.p 
              className="text-xl text-emerald-100 mb-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Join thousands of teachers who are saving hours every week with EDUC.AI
            </motion.p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                size="lg" 
                className="bg-white text-emerald-600 hover:bg-emerald-50 px-8 h-14 text-base shadow-xl rounded-full"
                onClick={() => { setAuthTab('register'); setView('auth'); }}
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-slate-900 dark:text-white">EDUC.AI</span>
              </div>
              <div className="flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
                <a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400">Privacy</a>
                <a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400">Terms</a>
                <a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400">Support</a>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                © {new Date().getFullYear()} EDUC.AI. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // Auth View
  if (view === 'auth') {
    return (
      <div className="min-h-screen flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-12 flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          </div>
          
          <div className="relative z-10">
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">EDUC.AI</span>
            </motion.div>
          </div>
          
          <motion.div 
            className="relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Transform your teaching with AI
            </h2>
            <p className="text-lg text-emerald-100 mb-8">
              Generate professional exam papers in minutes, not hours. Join thousands of educators across Africa.
            </p>
            <div className="space-y-4">
              {['Generate exams aligned with national curriculum', 'Extract questions from past papers automatically', 'Export professional PDFs with school branding'].map((item, i) => (
                <motion.div 
                  key={i} 
                  className="flex items-center gap-3 text-white"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Check className="h-4 w-4" />
                  </div>
                  <span>{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          <motion.div 
            className="relative z-10 flex items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <Avatar key={i} className="border-2 border-white h-10 w-10">
                  <AvatarFallback className="bg-white/20 text-white text-sm">T{i}</AvatarFallback>
                </Avatar>
              ))}
            </div>
            <p className="text-sm text-emerald-100">
              <span className="font-semibold text-white">2,500+</span> teachers trust EDUC.AI
            </p>
          </motion.div>
        </div>
        
        {/* Right Side - Auth Form */}
        <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-slate-950 relative">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <motion.div 
              className="lg:hidden flex items-center justify-center mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900 dark:text-white">EDUC.AI</span>
              </div>
            </motion.div>
            
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
              <Button variant="ghost" className="mb-6 text-slate-600 dark:text-slate-400" onClick={() => setView('landing')}>
                <ChevronRight className="h-4 w-4 rotate-180 mr-1" />
                Back to home
              </Button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-0 shadow-2xl bg-slate-50 dark:bg-slate-900">
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-2xl">
                    {authTab === 'login' ? 'Welcome back' : 'Create your account'}
                  </CardTitle>
                  <CardDescription>
                    {authTab === 'login' ? 'Sign in to continue to your dashboard' : 'Start your free trial today'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Social Login */}
                  <div className="space-y-3 mb-6">
                    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                      <Button 
                        variant="outline" 
                        className="w-full h-12" 
                        type="button"
                        onClick={() => window.location.href = '/api/auth/signin/google'}
                      >
                        <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Continue with Google
                      </Button>
                    </motion.div>
                    
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <Separator className="w-full" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-slate-50 dark:bg-slate-900 px-2 text-slate-500 dark:text-slate-400">
                          Or continue with email
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Tabs value={authTab} onValueChange={(v) => setAuthTab(v as 'login' | 'register')}>
                    <TabsList className="grid w-full grid-cols-2 mb-6 h-11">
                      <TabsTrigger value="login">Sign In</TabsTrigger>
                      <TabsTrigger value="register">Sign Up</TabsTrigger>
                    </TabsList>
                    
                    <form onSubmit={handleAuth} className="space-y-4">
                      {authTab === 'register' && (
                        <motion.div className="space-y-2" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                          <Label htmlFor="name">Full Name</Label>
                          <Input id="name" type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required className="h-11" />
                        </motion.div>
                      )}
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="teacher@school.edu" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-11" />
                      </div>
                      
                      {authTab === 'login' && (
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Checkbox id="remember" />
                            <Label htmlFor="remember" className="font-normal">Remember me</Label>
                          </div>
                          <a href="#" className="text-emerald-600 dark:text-emerald-400 hover:underline">
                            Forgot password?
                          </a>
                        </div>
                      )}
                      
                      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                        <Button 
                          type="submit" 
                          className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25" 
                          disabled={authLoading}
                        >
                          {authLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          {authTab === 'login' ? 'Sign In' : 'Create Account'}
                        </Button>
                      </motion.div>
                    </form>
                  </Tabs>
                </CardContent>
                <CardFooter className="text-center text-xs text-slate-500 dark:text-slate-400">
                  By continuing, you agree to our{' '}
                  <a href="#" className="text-emerald-600 dark:text-emerald-400 hover:underline">Terms</a>
                  {' '}and{' '}
                  <a href="#" className="text-emerald-600 dark:text-emerald-400 hover:underline">Privacy Policy</a>
                </CardFooter>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Main App Layout
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>
        
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static flex flex-col`}>
          <div className="p-5 border-b border-slate-200 dark:border-slate-800">
            <motion.div className="flex items-center gap-3" whileHover={{ scale: 1.02 }}>
              <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg shadow-emerald-500/25">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-slate-900 dark:text-white">EDUC.AI</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Exam Generator</p>
              </div>
            </motion.div>
          </div>
          
          <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
            {[
              { id: 'dashboard', icon: Home, label: 'Dashboard' },
              { id: 'generator', icon: Plus, label: 'Create Exam' },
              { id: 'questions', icon: FileQuestion, label: 'Question Bank' },
              { id: 'templates', icon: ClipboardList, label: 'Templates' },
              { id: 'resources', icon: FolderOpen, label: 'Resources' },
              { id: 'ai-tools', icon: Bot, label: 'AI Tools' },
              { id: 'analytics', icon: BarChart3, label: 'Analytics' },
              { id: 'pricing', icon: Crown, label: 'Subscription' },
            ].map((item) => (
              <motion.div key={item.id} whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant={view === item.id ? 'secondary' : 'ghost'}
                  className={`w-full justify-start gap-3 h-11 ${view === item.id ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : ''}`}
                  onClick={() => { setView(item.id as View); setSidebarOpen(false); }}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Button>
              </motion.div>
            ))}
            
            {user?.role === 'admin' && (
              <>
                <Separator className="my-3" />
                <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant={view === 'admin' ? 'secondary' : 'ghost'}
                    className={`w-full justify-start gap-3 h-11 ${view === 'admin' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400' : ''}`}
                    onClick={() => { setView('admin'); setSidebarOpen(false); }}
                  >
                    <Shield className="h-5 w-5" />
                    Admin Panel
                  </Button>
                </motion.div>
              </>
            )}
          </nav>
          
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
            {subscription && (
              <motion.div 
                className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-emerald-500 rounded-lg text-white">
                    {getPlanIcon(subscription.plan.slug)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">{subscription.plan.name} Plan</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">
                      {subscription.plan.maxExamsPerMonth === -1 ? 'Unlimited exams' : `${Math.max(0, subscription.plan.maxExamsPerMonth - subscription.examsThisMonth)} exams remaining`}
                    </p>
                  </div>
                </div>
                {subscription.plan.maxExamsPerMonth > 0 && (
                  <Progress value={(subscription.examsThisMonth / subscription.plan.maxExamsPerMonth) * 100} className="h-1.5 mt-2" />
                )}
              </motion.div>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-3 h-auto py-2 px-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-semibold">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user?.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setView('profile')}>
                  <User className="mr-2 h-4 w-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setView('pricing')}>
                  <Crown className="mr-2 h-4 w-4" /> Subscription
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-slate-500 dark:text-slate-400">Theme</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setTheme('light')}>
                  <Sun className="mr-2 h-4 w-4" /> Light
                  {theme === 'light' && <Check className="ml-auto h-4 w-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>
                  <Moon className="mr-2 h-4 w-4" /> Dark
                  {theme === 'dark' && <Check className="ml-auto h-4 w-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')}>
                  <Monitor className="mr-2 h-4 w-4" /> System
                  {theme === 'system' && <Check className="ml-auto h-4 w-4" />}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
                  <LogOut className="mr-2 h-4 w-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>
        
        <main className="flex-1 flex flex-col min-h-screen">
          {/* Top Bar */}
          <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between lg:px-6 sticky top-0 z-30">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="flex-1 lg:flex-none lg:w-64">
              <div className="relative hidden lg:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input placeholder="Search..." className="pl-9 h-9 bg-slate-100 dark:bg-slate-800 border-0" />
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {user?.role === 'admin' && (
                <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                  <Shield className="h-3 w-3 mr-1" /> Admin
                </Badge>
              )}
              
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
              
              <Popover open={showNotifications} onOpenChange={setShowNotifications}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 relative">
                    <Bell className="h-4 w-4" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Notifications</h4>
                    <div className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center">
                      No new notifications
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setShowAssistant(true)}
                >
                  <Bot className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </header>
          
          {/* Page Content */}
          <div className="flex-1 p-4 lg:p-6 overflow-auto">
            <AnimatePresence mode="wait">
              {/* Dashboard View */}
              {view === 'dashboard' && (
                <motion.div key="dashboard" variants={fadeIn} initial="initial" animate="animate" exit="exit" className="max-w-7xl mx-auto space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h2>
                      <p className="text-slate-500 dark:text-slate-400">Welcome back, {user?.name}!</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="gap-2" onClick={() => setView('resources')}>
                        <FolderOpen className="h-4 w-4" /> Resources
                      </Button>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white gap-2 shadow-lg shadow-emerald-500/25" onClick={() => setView('generator')}>
                          <Plus className="h-4 w-4" /> New Exam
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                  
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { icon: FileText, label: 'Generated Exams', value: exams.length, change: '+12%', positive: true, color: 'emerald' },
                      { icon: FileUp, label: 'Past Papers', value: pastPapers.length, change: '+5%', positive: true, color: 'blue' },
                      { icon: Book, label: 'Textbooks', value: textbooks.length, change: '+2', positive: true, color: 'purple' },
                      { icon: BookOpen, label: 'Syllabus Docs', value: syllabusDocs.length, change: '+1', positive: true, color: 'teal' },
                    ].map((stat, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <Card className="border-0 shadow-sm bg-white dark:bg-slate-900 hover:shadow-md transition-shadow">
                          <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</p>
                                <div className={`flex items-center gap-1 text-xs mt-1 ${stat.positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                  {stat.positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                  {stat.change}
                                </div>
                              </div>
                              <div className={`p-3 bg-${stat.color}-100 dark:bg-${stat.color}-900/30 rounded-xl`}>
                                <stat.icon className={`h-6 w-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Card className="border-0 shadow-sm bg-white dark:bg-slate-900">
                        <CardHeader>
                          <CardTitle className="text-lg">Exam Generation Trends</CardTitle>
                          <CardDescription>Monthly exam and question generation</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={examTrendsData}>
                                <defs>
                                  <linearGradient id="colorExams" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                                <XAxis dataKey="name" className="text-xs" />
                                <YAxis className="text-xs" />
                                <RechartsTooltip />
                                <Area type="monotone" dataKey="exams" stroke="#10b981" fillOpacity={1} fill="url(#colorExams)" strokeWidth={2} />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Card className="border-0 shadow-sm bg-white dark:bg-slate-900">
                        <CardHeader>
                          <CardTitle className="text-lg">Subject Distribution</CardTitle>
                          <CardDescription>Exams by subject area</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie data={subjectDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                                  {subjectDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <RechartsTooltip />
                                <Legend />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                  
                  {/* Recent Exams */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Card className="border-0 shadow-sm bg-white dark:bg-slate-900">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">Your Exams</CardTitle>
                            <CardDescription>Manage and download your generated exams</CardDescription>
                          </div>
                          {exams.length > 0 && (
                            <Button variant="outline" size="sm" onClick={() => setView('generator')}>
                              <Plus className="h-4 w-4 mr-1" /> New
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {exams.length === 0 ? (
                          <div className="text-center py-12">
                            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                              <FileText className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">No exams generated yet</p>
                            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Create your first exam to get started</p>
                            <Button className="mt-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white" onClick={() => setView('generator')}>
                              <Plus className="h-4 w-4 mr-2" /> Create Exam
                            </Button>
                          </div>
                        ) : (
                          <ScrollArea className="h-[320px]">
                            <div className="space-y-3">
                              {exams.map((exam) => (
                                <motion.div
                                  key={exam.id}
                                  className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-colors"
                                  whileHover={{ x: 4 }}
                                >
                                  <div className="flex items-center gap-4">
                                    <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                                      <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-slate-900 dark:text-white">{exam.title}</h4>
                                      <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                        <span className="flex items-center gap-1"><Target className="h-3 w-3" />{exam.totalMarks} marks</span>
                                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{exam.duration} mins</span>
                                        <Badge variant="outline" className="text-xs">{exam.examType}</Badge>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" onClick={() => { setCurrentExam(exam); setView('editor'); }}>
                                      <Eye className="h-4 w-4 mr-1" /> View
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => handleExportPDF(exam.id)}>
                                      <Download className="h-4 w-4 mr-1" /> PDF
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => handleDeleteExam(exam.id)}>
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </ScrollArea>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              )}
              
              {/* Templates View */}
              {view === 'templates' && (
                <motion.div key="templates" variants={fadeIn} initial="initial" animate="animate" exit="exit" className="max-w-7xl mx-auto space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Exam Templates</h2>
                      <p className="text-slate-500 dark:text-slate-400">Pre-made templates for quick exam creation</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { name: 'Standard Multiple Choice Quiz', description: 'Quick assessment with MCQ questions', marks: 20, duration: 30, category: 'quiz' },
                      { name: 'Midterm Examination', description: 'Comprehensive midterm with mixed types', marks: 100, duration: 120, category: 'midterm' },
                      { name: 'Final Examination', description: 'End of term comprehensive exam', marks: 100, duration: 180, category: 'final' },
                      { name: 'Quick Assessment', description: 'Short formative assessment', marks: 10, duration: 15, category: 'quiz' },
                      { name: 'Structured Questions Only', description: 'Exam with structured questions', marks: 60, duration: 90, category: 'assignment' },
                      { name: 'NECTA Style Form 4', description: 'National exam style format', marks: 100, duration: 150, category: 'national' },
                    ].map((template, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ y: -4 }}
                      >
                        <Card className="h-full border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer bg-white dark:bg-slate-900">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <Badge variant="outline" className="mb-2">{template.category}</Badge>
                              <ClipboardList className="h-5 w-5 text-emerald-500" />
                            </div>
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            <CardDescription>{template.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                              <span className="flex items-center gap-1"><Target className="h-3 w-3" />{template.marks} marks</span>
                              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{template.duration} mins</span>
                            </div>
                          </CardContent>
                          <CardFooter className="pt-0">
                            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => { setView('generator'); }}>
                              Use Template
                            </Button>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
              
              {/* AI Tools View */}
              {view === 'ai-tools' && (
                <motion.div key="ai-tools" variants={fadeIn} initial="initial" animate="animate" exit="exit" className="max-w-7xl mx-auto space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">AI Tools</h2>
                      <p className="text-slate-500 dark:text-slate-400">Powerful AI-powered features for exam creation</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { icon: Brain, title: 'AI Answer Generator', description: 'Generate model answers and marking schemes for questions automatically', endpoint: 'generate-answers', color: 'from-purple-500 to-pink-600' },
                      { icon: Target, title: 'Difficulty Predictor', description: 'AI predicts question difficulty based on cognitive complexity and prior knowledge', endpoint: 'predict-difficulty', color: 'from-blue-500 to-cyan-600' },
                      { icon: Lightbulb, title: 'Smart Suggestions', description: 'Get AI-powered question suggestions based on topics and learning objectives', endpoint: 'suggest-questions', color: 'from-amber-500 to-orange-600' },
                      { icon: ClipboardList, title: 'Marking Rubric Generator', description: 'Automatically create detailed marking rubrics for any question or exam', endpoint: 'marking-rubric', color: 'from-emerald-500 to-teal-600' },
                    ].map((tool, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <Card className="h-full border-0 shadow-sm bg-white dark:bg-slate-900 overflow-hidden group">
                          <div className={`h-2 bg-gradient-to-r ${tool.color}`} />
                          <CardHeader>
                            <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-xl bg-gradient-to-r ${tool.color} text-white`}>
                                <tool.icon className="h-6 w-6" />
                              </div>
                              <div>
                                <CardTitle className="text-lg">{tool.title}</CardTitle>
                                <CardDescription className="mt-1">{tool.description}</CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <Button className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white gap-2">
                              <Sparkles className="h-4 w-4" /> Launch Tool
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                  
                  <Card className="border-0 shadow-sm bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-4 bg-emerald-500 rounded-2xl text-white">
                          <Wand2 className="h-8 w-8" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Need Custom AI Features?</h3>
                          <p className="text-slate-600 dark:text-slate-400 mt-1">Upgrade to Pro for unlimited AI generations and advanced features.</p>
                        </div>
                        <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white" onClick={() => setView('pricing')}>
                          Upgrade Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
              
              {/* Analytics View */}
              {view === 'analytics' && (
                <motion.div key="analytics" variants={fadeIn} initial="initial" animate="animate" exit="exit" className="max-w-7xl mx-auto space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics Dashboard</h2>
                      <p className="text-slate-500 dark:text-slate-400">Track your usage and performance metrics</p>
                    </div>
                    <Select defaultValue="30">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">Last 7 days</SelectItem>
                        <SelectItem value="30">Last 30 days</SelectItem>
                        <SelectItem value="90">Last 90 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { icon: FileText, label: 'Exams Generated', value: '24', change: '+12%', positive: true },
                      { icon: FileQuestion, label: 'Questions Created', value: '487', change: '+8%', positive: true },
                      { icon: Download, label: 'PDF Exports', value: '18', change: '+5%', positive: true },
                      { icon: Cpu, label: 'AI Generations', value: '156', change: '+23%', positive: true },
                    ].map((stat, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                        <Card className="border-0 shadow-sm bg-white dark:bg-slate-900">
                          <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</p>
                                <div className={`flex items-center gap-1 text-xs mt-1 ${stat.positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                  {stat.positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                  {stat.change}
                                </div>
                              </div>
                              <stat.icon className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="border-0 shadow-sm bg-white dark:bg-slate-900">
                      <CardHeader>
                        <CardTitle className="text-lg">Activity Over Time</CardTitle>
                        <CardDescription>Weekly exam generation and AI usage</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={usageData}>
                              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <RechartsTooltip />
                              <Bar dataKey="ai" fill="#10b981" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="manual" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-0 shadow-sm bg-white dark:bg-slate-900">
                      <CardHeader>
                        <CardTitle className="text-lg">Subject Coverage</CardTitle>
                        <CardDescription>Topic coverage by subject area</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={subjectDistribution} layout="vertical">
                              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                              <XAxis type="number" />
                              <YAxis dataKey="name" type="category" width={80} />
                              <RechartsTooltip />
                              <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Topic Coverage */}
                  <Card className="border-0 shadow-sm bg-white dark:bg-slate-900">
                    <CardHeader>
                      <CardTitle className="text-lg">Curriculum Coverage Map</CardTitle>
                      <CardDescription>Track your coverage across topics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { name: 'Algebra & Equations', coverage: 85, subject: 'Mathematics' },
                          { name: 'Grammar & Composition', coverage: 72, subject: 'English' },
                          { name: 'Cell Biology', coverage: 45, subject: 'Biology' },
                          { name: 'Physical Chemistry', coverage: 60, subject: 'Chemistry' },
                          { name: 'African History', coverage: 30, subject: 'History' },
                        ].map((topic, i) => (
                          <div key={i} className="flex items-center gap-4">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{topic.name}</span>
                                <span className="text-sm text-slate-500 dark:text-slate-400">{topic.coverage}%</span>
                              </div>
                              <Progress value={topic.coverage} className="h-2" />
                              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{topic.subject}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
              
              {/* Generator View */}
              {view === 'generator' && (
                <motion.div key="generator" variants={fadeIn} initial="initial" animate="animate" exit="exit" className="max-w-3xl mx-auto">
                  <Button variant="ghost" className="mb-4 text-slate-600 dark:text-slate-400" onClick={() => setView('dashboard')}>
                    <ChevronRight className="h-4 w-4 rotate-180 mr-1" /> Back to Dashboard
                  </Button>
                  
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Create New Exam</h2>
                    <p className="text-slate-500 dark:text-slate-400">Configure your exam parameters and generate with AI</p>
                  </div>
                  
                  {subscription && subscription.plan.maxExamsPerMonth > 0 && (
                    <Alert className="mb-6 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
                      <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <AlertDescription className="text-amber-800 dark:text-amber-200">
                        <span className="font-medium">Usage Limit:</span> You've used {subscription.examsThisMonth} of {subscription.plan.maxExamsPerMonth} exams this month.
                        <Progress value={(subscription.examsThisMonth / subscription.plan.maxExamsPerMonth) * 100} className="h-2 mt-2" />
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <Card className="border-0 shadow-sm bg-white dark:bg-slate-900">
                    <CardHeader>
                      <CardTitle>Exam Configuration</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label>Subject *</Label>
                          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                            <SelectTrigger className="h-11"><SelectValue placeholder="Select subject" /></SelectTrigger>
                            <SelectContent>
                              {subjects.map((subject) => (<SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Class Level *</Label>
                          <Select value={selectedClassLevel} onValueChange={setSelectedClassLevel}>
                            <SelectTrigger className="h-11"><SelectValue placeholder="Select class level" /></SelectTrigger>
                            <SelectContent>
                              {classLevels.map((level) => (<SelectItem key={level.id} value={level.id}>{level.name}</SelectItem>))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Topic</Label>
                          <Select value={selectedTopic} onValueChange={setSelectedTopic} disabled={!topics.length}>
                            <SelectTrigger className="h-11"><SelectValue placeholder="All topics" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Topics</SelectItem>
                              {topics.map((topic) => (<SelectItem key={topic.id} value={topic.id}>{topic.name}</SelectItem>))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Exam Type</Label>
                          <Select value={examType} onValueChange={setExamType}>
                            <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Midterm">Midterm</SelectItem>
                              <SelectItem value="Final">Final</SelectItem>
                              <SelectItem value="Quiz">Quiz</SelectItem>
                              <SelectItem value="Assignment">Assignment</SelectItem>
                              <SelectItem value="Mock">Mock Exam</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Total Marks</Label>
                          <Input type="number" value={totalMarks} onChange={(e) => setTotalMarks(parseInt(e.target.value) || 50)} className="h-11" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Duration (minutes)</Label>
                          <Input type="number" value={duration} onChange={(e) => setDuration(parseInt(e.target.value) || 60)} className="h-11" />
                        </div>
                        
                        <div className="space-y-2 md:col-span-2">
                          <Label>Difficulty Mix</Label>
                          <Select value={difficultyMix} onValueChange={setDifficultyMix}>
                            <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="easy">Easy (More basic questions)</SelectItem>
                              <SelectItem value="balanced">Balanced Mix</SelectItem>
                              <SelectItem value="challenging">Challenging (More advanced questions)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2 md:col-span-2">
                          <div className="flex items-center gap-2">
                            <Checkbox id="useExtracted" checked={useExtractedQuestions} onCheckedChange={(checked) => setUseExtractedQuestions(checked as boolean)} />
                            <Label htmlFor="useExtracted" className="font-normal">Include questions from past papers and uploaded resources</Label>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <motion.div className="w-full" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                        <Button 
                          className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25"
                          onClick={handleGenerateExam}
                          disabled={generating || !selectedSubject || !selectedClassLevel}
                        >
                          {generating ? (
                            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating Exam...</>
                          ) : (
                            <><Sparkles className="mr-2 h-5 w-5" /> Generate with AI</>
                          )}
                        </Button>
                      </motion.div>
                    </CardFooter>
                  </Card>
                </motion.div>
              )}
              
              {/* Editor View */}
              {view === 'editor' && currentExam && (
                <motion.div key="editor" variants={fadeIn} initial="initial" animate="animate" exit="exit" className="max-w-4xl mx-auto">
                  <Button variant="ghost" className="mb-4 text-slate-600 dark:text-slate-400" onClick={() => setView('dashboard')}>
                    <ChevronRight className="h-4 w-4 rotate-180 mr-1" /> Back to Dashboard
                  </Button>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{currentExam.title}</h2>
                      <p className="text-slate-500 dark:text-slate-400">{currentExam.totalMarks} marks • {currentExam.duration} minutes</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setView('preview')}><Eye className="h-4 w-4 mr-2" /> Preview</Button>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white" onClick={() => handleExportPDF(currentExam.id)} disabled={exporting}>
                          {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                          Export PDF
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                  
                  <Card className="border-0 shadow-sm bg-white dark:bg-slate-900">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Exam Questions</CardTitle>
                          <CardDescription>{currentExam.examQuestions.length} questions generated</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox id="markingScheme" checked={includeMarkingScheme} onCheckedChange={(checked) => setIncludeMarkingScheme(checked as boolean)} />
                          <Label htmlFor="markingScheme" className="text-sm font-normal">Include answers</Label>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[500px]">
                        <div className="space-y-4">
                          {currentExam.examQuestions.map((eq, index) => (
                            <motion.div
                              key={eq.id}
                              className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">Section {eq.section}</Badge>
                                  <Badge variant="outline" className="text-xs">{eq.marks} marks</Badge>
                                  <Badge className={eq.question.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : eq.question.difficulty === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}>
                                    {eq.question.difficulty}
                                  </Badge>
                                </div>
                                <span className="text-sm text-slate-500 dark:text-slate-400">Q{eq.questionNum}</span>
                              </div>
                              <p className="text-slate-900 dark:text-white font-medium mb-2">{eq.question.questionText}</p>
                              {eq.question.questionType === 'MCQ' && eq.question.options && (
                                <div className="mt-3 space-y-1.5">
                                  {JSON.parse(eq.question.options).map((opt: string, i: number) => (
                                    <p key={i} className="text-sm text-slate-600 dark:text-slate-400 pl-4">{String.fromCharCode(65 + i)}. {opt}</p>
                                  ))}
                                </div>
                              )}
                              {includeMarkingScheme && (
                                <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                                  <span className="font-medium text-emerald-800 dark:text-emerald-300 text-sm">Answer: </span>
                                  <span className="text-emerald-700 dark:text-emerald-400 text-sm">{eq.question.correctAnswer}</span>
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
              
              {/* Resources View */}
              {view === 'resources' && (
                <motion.div key="resources" variants={fadeIn} initial="initial" animate="animate" exit="exit" className="max-w-6xl mx-auto">
                  <Button variant="ghost" className="mb-4 text-slate-600 dark:text-slate-400" onClick={() => setView('dashboard')}>
                    <ChevronRight className="h-4 w-4 rotate-180 mr-1" /> Back to Dashboard
                  </Button>
                  
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Resources</h2>
                    <p className="text-slate-500 dark:text-slate-400">Manage past papers, syllabus documents, and textbooks</p>
                  </div>
                  
                  <Tabs value={resourceTab} onValueChange={(v) => setResourceTab(v as 'pastPapers' | 'syllabus' | 'textbooks')}>
                    <TabsList className="grid w-full grid-cols-3 mb-6 h-12">
                      <TabsTrigger value="pastPapers" className="gap-2"><FileUp className="h-4 w-4" /> Past Papers ({pastPapers.length})</TabsTrigger>
                      <TabsTrigger value="syllabus" className="gap-2"><BookOpen className="h-4 w-4" /> Syllabus ({syllabusDocs.length})</TabsTrigger>
                      <TabsTrigger value="textbooks" className="gap-2"><Book className="h-4 w-4" /> Textbooks ({textbooks.length})</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="pastPapers">
                      <Card className="border-0 shadow-sm bg-white dark:bg-slate-900">
                        <CardHeader className="flex flex-row items-center justify-between">
                          <div>
                            <CardTitle>Past Papers</CardTitle>
                            <CardDescription>Upload national exams and mock tests for question extraction</CardDescription>
                          </div>
                          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => openUploadDialog('pastPaper')}>
                            <Upload className="h-4 w-4 mr-2" /> Upload Past Paper
                          </Button>
                        </CardHeader>
                        <CardContent>
                          {pastPapers.length === 0 ? (
                            <div className="text-center py-16">
                              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                                <FileUp className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                              </div>
                              <p className="text-lg font-medium text-slate-900 dark:text-white">No past papers uploaded</p>
                              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Upload national exams or mock tests to extract questions</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {pastPapers.map((pp) => (
                                <motion.div key={pp.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors" whileHover={{ x: 4 }}>
                                  <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl"><File className="h-6 w-6 text-blue-600 dark:text-blue-400" /></div>
                                    <div>
                                      <h4 className="font-medium text-slate-900 dark:text-white">{pp.title}</h4>
                                      <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        <span>{pp.subject?.name}</span>
                                        <span>•</span>
                                        <span>{pp.classLevel?.name}</span>
                                        <span>•</span>
                                        <span>{pp.year}</span>
                                        <span>•</span>
                                        <span>{formatFileSize(pp.fileSize)}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    {getStatusBadge(pp.extractionStatus)}
                                    <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => handleDeleteResource('pastPaper', pp.id)}>
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="syllabus">
                      <Card className="border-0 shadow-sm bg-white dark:bg-slate-900">
                        <CardHeader className="flex flex-row items-center justify-between">
                          <div>
                            <CardTitle>Syllabus Documents</CardTitle>
                            <CardDescription>Upload curriculum documents to guide exam generation</CardDescription>
                          </div>
                          <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={() => openUploadDialog('syllabus')}>
                            <Upload className="h-4 w-4 mr-2" /> Upload Syllabus
                          </Button>
                        </CardHeader>
                        <CardContent>
                          {syllabusDocs.length === 0 ? (
                            <div className="text-center py-16">
                              <div className="w-16 h-16 mx-auto mb-4 bg-teal-100 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center">
                                <BookOpen className="h-8 w-8 text-teal-600 dark:text-teal-400" />
                              </div>
                              <p className="text-lg font-medium text-slate-900 dark:text-white">No syllabus documents uploaded</p>
                              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Upload curriculum guides to improve exam accuracy</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {syllabusDocs.map((sd) => (
                                <motion.div key={sd.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700 transition-colors" whileHover={{ x: 4 }}>
                                  <div className="flex items-center gap-4">
                                    <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-xl"><BookOpen className="h-6 w-6 text-teal-600 dark:text-teal-400" /></div>
                                    <div>
                                      <h4 className="font-medium text-slate-900 dark:text-white">{sd.title}</h4>
                                      <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        <span>{sd.subject?.name}</span>
                                        <span>•</span>
                                        <span>{sd.classLevel?.name}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    {getStatusBadge(sd.extractionStatus)}
                                    <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => handleDeleteResource('syllabus', sd.id)}>
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="textbooks">
                      <Card className="border-0 shadow-sm bg-white dark:bg-slate-900">
                        <CardHeader className="flex flex-row items-center justify-between">
                          <div>
                            <CardTitle>Textbooks</CardTitle>
                            <CardDescription>Upload textbooks for comprehensive question bank</CardDescription>
                          </div>
                          <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={() => openUploadDialog('textbook')}>
                            <Upload className="h-4 w-4 mr-2" /> Upload Textbook
                          </Button>
                        </CardHeader>
                        <CardContent>
                          {textbooks.length === 0 ? (
                            <div className="text-center py-16">
                              <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center">
                                <Book className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                              </div>
                              <p className="text-lg font-medium text-slate-900 dark:text-white">No textbooks uploaded</p>
                              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Upload textbooks to extract practice questions</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {textbooks.map((tb) => (
                                <motion.div key={tb.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700 transition-colors" whileHover={{ x: 4 }}>
                                  <div className="flex items-center gap-4">
                                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl"><Book className="h-6 w-6 text-purple-600 dark:text-purple-400" /></div>
                                    <div>
                                      <h4 className="font-medium text-slate-900 dark:text-white">{tb.title}</h4>
                                      <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        <span>{tb.subject?.name}</span>
                                        <span>•</span>
                                        <span>{tb.classLevel?.name}</span>
                                        {tb.author && <><span>•</span><span>by {tb.author}</span></>}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    {getStatusBadge(tb.extractionStatus)}
                                    <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => handleDeleteResource('textbook', tb.id)}>
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </motion.div>
              )}
              
              {/* Pricing View */}
              {view === 'pricing' && (
                <motion.div key="pricing" variants={fadeIn} initial="initial" animate="animate" exit="exit" className="max-w-6xl mx-auto">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Choose Your Plan</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Select the perfect plan for your exam generation needs</p>
                    
                    <div className="flex items-center justify-center gap-4 mt-6">
                      <span className={billingCycle === 'monthly' ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-500 dark:text-slate-400'}>Monthly</span>
                      <Switch checked={billingCycle === 'yearly'} onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')} />
                      <span className={billingCycle === 'yearly' ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-500 dark:text-slate-400'}>
                        Yearly <Badge className="ml-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Save 17%</Badge>
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {subscriptionPlans.map((plan) => {
                      const price = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly;
                      const isCurrentPlan = subscription?.plan.slug === plan.slug;
                      
                      return (
                        <motion.div key={plan.id} whileHover={{ y: -5 }}>
                          <Card className={`relative h-full bg-white dark:bg-slate-900 ${plan.slug === 'pro' ? 'border-2 border-emerald-500 shadow-xl shadow-emerald-500/10' : 'border border-slate-200 dark:border-slate-800'} ${isCurrentPlan ? 'ring-2 ring-emerald-500' : ''}`}>
                            {plan.slug === 'pro' && (
                              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                <Badge className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">Most Popular</Badge>
                              </div>
                            )}
                            <CardHeader className="text-center pb-2">
                              <div className="flex justify-center mb-3">
                                <div className={`p-3 rounded-xl ${plan.slug === 'free' ? 'bg-slate-100 dark:bg-slate-800' : plan.slug === 'pro' ? 'bg-emerald-100 dark:bg-emerald-900/30' : plan.slug === 'school' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-purple-100 dark:bg-purple-900/30'}`}>
                                  {getPlanIcon(plan.slug)}
                                </div>
                              </div>
                              <CardTitle className="text-xl">{plan.name}</CardTitle>
                              <CardDescription className="text-sm">{plan.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="text-center">
                              <div className="mb-4">
                                <span className="text-4xl font-bold text-slate-900 dark:text-white">${price.toFixed(2)}</span>
                                <span className="text-slate-500 dark:text-slate-400">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                              </div>
                              
                              <ul className="space-y-2.5 text-sm text-left mb-6">
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500 flex-shrink-0" /><span className="text-slate-600 dark:text-slate-400">{plan.maxExamsPerMonth === -1 ? 'Unlimited' : plan.maxExamsPerMonth} exams/month</span></li>
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500 flex-shrink-0" /><span className="text-slate-600 dark:text-slate-400">{plan.maxQuestionsPerExam === -1 ? 'Unlimited' : plan.maxQuestionsPerExam} questions/exam</span></li>
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500 flex-shrink-0" /><span className="text-slate-600 dark:text-slate-400">{plan.maxPastPapers === -1 ? 'Unlimited' : plan.maxPastPapers} past papers</span></li>
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500 flex-shrink-0" /><span className="text-slate-600 dark:text-slate-400">AI-powered generation</span></li>
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500 flex-shrink-0" /><span className="text-slate-600 dark:text-slate-400">PDF export</span></li>
                                {plan.customFormats && <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500 flex-shrink-0" /><span className="text-slate-600 dark:text-slate-400">Custom exam formats</span></li>}
                                {plan.analytics && <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500 flex-shrink-0" /><span className="text-slate-600 dark:text-slate-400">Analytics dashboard</span></li>}
                                {plan.prioritySupport && <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500 flex-shrink-0" /><span className="text-slate-600 dark:text-slate-400">Priority support</span></li>}
                                {plan.whiteLabel && <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500 flex-shrink-0" /><span className="text-slate-600 dark:text-slate-400">White-label solution</span></li>}
                              </ul>
                            </CardContent>
                            <CardFooter>
                              <Button className={`w-full ${plan.slug === 'pro' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white' : ''}`} variant={isCurrentPlan ? 'outline' : 'default'} disabled={isCurrentPlan} onClick={() => handleSubscribe(plan.slug)}>
                                {isCurrentPlan ? 'Current Plan' : 'Subscribe'}
                              </Button>
                            </CardFooter>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
              
              {/* Question Bank View */}
              {view === 'questions' && (
                <motion.div key="questions" variants={fadeIn} initial="initial" animate="animate" exit="exit" className="max-w-6xl mx-auto">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Question Bank</h2>
                    <p className="text-slate-500 dark:text-slate-400">Browse and manage your question database</p>
                  </div>
                  
                  <Card className="border-0 shadow-sm bg-white dark:bg-slate-900">
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex-1 relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input placeholder="Search questions..." className="pl-9" />
                        </div>
                        <div className="flex gap-2">
                          <Select defaultValue="all">
                            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Subjects</SelectItem>
                              {subjects.map((s) => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}
                            </SelectContent>
                          </Select>
                          <Select defaultValue="all">
                            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Types</SelectItem>
                              <SelectItem value="MCQ">MCQ</SelectItem>
                              <SelectItem value="short_answer">Short Answer</SelectItem>
                              <SelectItem value="essay">Essay</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center">
                          <FileQuestion className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Question bank coming soon</p>
                        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Upload past papers to build your question bank</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
              
              {/* Profile View */}
              {view === 'profile' && (
                <motion.div key="profile" variants={fadeIn} initial="initial" animate="animate" exit="exit" className="max-w-2xl mx-auto space-y-6">
                  <Button variant="ghost" className="mb-4 text-slate-600 dark:text-slate-400" onClick={() => setView('dashboard')}>
                    <ChevronRight className="h-4 w-4 rotate-180 mr-1" /> Back to Dashboard
                  </Button>
                  
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Profile Settings</h2>
                  <p className="text-slate-500 dark:text-slate-400">Manage your account settings and preferences</p>
                  
                  <Card className="border-0 shadow-sm bg-white dark:bg-slate-900">
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>Update your personal details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4 mb-6">
                        <Avatar className="h-20 w-20">
                          <AvatarFallback className="text-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <Button variant="outline" size="sm">Change Avatar</Button>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">JPG, PNG or GIF. Max 2MB</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="profileName">Full Name</Label>
                          <Input id="profileName" defaultValue={user?.name} placeholder="Your name" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="profileEmail">Email</Label>
                          <Input id="profileEmail" defaultValue={user?.email} disabled className="bg-slate-50 dark:bg-slate-800" />
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white">Save Changes</Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-0 shadow-sm bg-white dark:bg-slate-900">
                    <CardHeader>
                      <CardTitle>Password</CardTitle>
                      <CardDescription>Change your password</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2"><Label>Current Password</Label><Input type="password" placeholder="••••••••" /></div>
                      <div className="space-y-2"><Label>New Password</Label><Input type="password" placeholder="••••••••" /></div>
                      <div className="space-y-2"><Label>Confirm New Password</Label><Input type="password" placeholder="••••••••" /></div>
                      <Button variant="outline">Update Password</Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
              
              {/* Admin View */}
              {view === 'admin' && user?.role === 'admin' && (
                <motion.div key="admin" variants={fadeIn} initial="initial" animate="animate" exit="exit" className="max-w-6xl mx-auto">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Panel</h2>
                    <p className="text-slate-500 dark:text-slate-400">Manage users, analytics, and platform settings</p>
                  </div>
                  
                  {/* Admin Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[
                      { icon: Users, label: 'Total Users', value: '1,247', color: 'emerald' },
                      { icon: FileText, label: 'Total Exams', value: '8,432', color: 'blue' },
                      { icon: DollarSign, label: 'Revenue', value: '$12,450', color: 'purple' },
                      { icon: TrendingUp, label: 'Growth', value: '+24%', color: 'teal' },
                    ].map((stat, i) => (
                      <Card key={i} className="border-0 shadow-sm bg-white dark:bg-slate-900">
                        <CardContent className="p-5">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 bg-${stat.color}-100 dark:bg-${stat.color}-900/30 rounded-xl`}>
                              <stat.icon className={`h-6 w-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  {/* Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <Card className="border-0 shadow-sm bg-white dark:bg-slate-900">
                      <CardHeader>
                        <CardTitle className="text-lg">Revenue Overview</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[250px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={usageData}>
                              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <RechartsTooltip />
                              <Bar dataKey="ai" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-0 shadow-sm bg-white dark:bg-slate-900">
                      <CardHeader>
                        <CardTitle className="text-lg">User Growth</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[250px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={examTrendsData}>
                              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <RechartsTooltip />
                              <Line type="monotone" dataKey="exams" stroke="#14b8a6" strokeWidth={2} dot={false} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Admin Actions */}
                  <Card className="border-0 shadow-sm bg-white dark:bg-slate-900">
                    <CardHeader>
                      <CardTitle>Platform Management</CardTitle>
                      <CardDescription>Quick access to admin functions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                          { icon: Users, label: 'Manage Users', desc: 'View and manage user accounts' },
                          { icon: FileText, label: 'All Exams', desc: 'Review all generated exams' },
                          { icon: Settings, label: 'Settings', desc: 'Platform configuration' },
                          { icon: BarChart3, label: 'Analytics', desc: 'Detailed analytics' },
                        ].map((action, i) => (
                          <motion.div key={i} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button variant="outline" className="w-full h-24 flex-col gap-2">
                              <action.icon className="h-6 w-6" />
                              <div className="text-center">
                                <p className="font-medium">{action.label}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{action.desc}</p>
                              </div>
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Footer */}
          <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 py-4 text-center text-sm text-slate-500 dark:text-slate-400">
            <p>© {new Date().getFullYear()} EDUC.AI - AI-Powered Exam Generation Platform</p>
          </footer>
        </main>
        
        {/* AI Assistant Sidebar */}
        <AnimatePresence>
          {showAssistant && (
            <motion.div
              className="fixed right-0 top-0 bottom-0 w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 flex flex-col"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
            >
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">EDUC.AI Assistant</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">AI-powered help</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowAssistant(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <ScrollArea className="flex-1 p-4">
                {assistantMessages.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center">
                      <Sparkles className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">How can I help you?</p>
                    <div className="mt-4 space-y-2">
                      {['Generate an exam', 'Find questions', 'Upload resources'].map((suggestion) => (
                        <Button key={suggestion} variant="outline" className="w-full justify-start" size="sm" onClick={() => setAssistantMessage(suggestion)}>
                          <Lightbulb className="h-4 w-4 mr-2" />
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assistantMessages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'}`}>
                          {msg.content}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              
              <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                <form onSubmit={(e) => { e.preventDefault(); if (assistantMessage.trim()) { setAssistantMessages([...assistantMessages, { role: 'user', content: assistantMessage }]); setAssistantMessage(''); } }} className="flex gap-2">
                  <Input placeholder="Ask anything..." value={assistantMessage} onChange={(e) => setAssistantMessage(e.target.value)} className="flex-1" />
                  <Button type="submit" size="icon" className="bg-emerald-600 hover:bg-emerald-700">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Upload Dialog */}
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Upload {uploadType === 'pastPaper' ? 'Past Paper' : uploadType === 'syllabus' ? 'Syllabus' : 'Textbook'}</DialogTitle>
              <DialogDescription>Upload a document to add to your resource library</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpload}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>File</Label>
                  <Input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} ref={fileInputRef} />
                </div>
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} placeholder="Document title" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Subject *</Label>
                    <Select value={uploadSubject} onValueChange={setUploadSubject}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {subjects.map((s) => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Class Level *</Label>
                    <Select value={uploadClassLevel} onValueChange={setUploadClassLevel}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {classLevels.map((l) => (<SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Input type="number" value={uploadYear} onChange={(e) => setUploadYear(parseInt(e.target.value) || new Date().getFullYear())} />
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={uploading}>{uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Upload</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
