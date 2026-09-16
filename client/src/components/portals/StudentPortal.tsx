import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  RefreshCw,
  Eye,
  X,
  AlertCircle,
  Video,
  Radio,
  PlusCircle,
  Target,
  Share2,
  Megaphone,
  Lock,
  CheckCircle,
  ExternalLink,
  Play,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  QrCode
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StudentPreferenceModal } from '../StudentPreferenceModal';
import { AffiliateMlmPortal } from './AffiliateMlmPortal';
import {
  fetchStudentDashboardStats,
  fetchMyEnrolledCourses,
  fetchBrowseCourses,
  enrollCourse,
  topUpStudentWallet,
  submitStudentQuiz,
  submitStudentKyc,
  fetchStudentPracticeMcqs,
  StudentStats,
  QuizAttemptResult,
  QuizSetGroup
} from '../../services/studentService';
import { McqRecord } from '../../services/teacherService';
import { CourseRecord } from '../../services/adminService';
import { fetchActiveAds, AdRecord } from '../../services/adService';

// PROMOTIONAL CAROUSEL SLIDES (Muthoot Fincorp ONE Style)
export const PROMO_BANNERS = [
  {
    id: 'neet_jee',
    tag: '🎯 SPECIAL ACADEMIC PASS',
    title: 'NEET & JEE 2026 Master Pass',
    subTitle: 'Flat 50% Early Bird Discount + All-India Live Doubt Vault',
    ctaText: 'Enroll Today',
    accentColor: '#6366F1',
    badgeText: '50% OFF',
    actionKey: 'FILTER_NEET',
  },
  {
    id: 'mlm_refer',
    tag: '🤝 BINARY CASHBACK REWARDS',
    title: 'Earn Up to ₹25,000 Daily Matching Bonus!',
    subTitle: 'Share your referral code & build your 2-leg binary team',
    ctaText: 'Share Link',
    accentColor: '#10B981',
    badgeText: 'DAILY CAPPING',
    actionKey: 'SHARE_LINK',
  },
  {
    id: 'mock_test',
    tag: '⚡ ALL-INDIA MOCK TEST',
    title: 'Track Your Performance & Rank Predictor',
    subTitle: 'Take chapter-wise practice tests with automated scoring',
    ctaText: 'Start Test',
    accentColor: '#F59E0B',
    badgeText: 'FREE QUIZ',
    actionKey: 'GO_QUIZ',
  },
];

// 6 CORE EDUCATIONAL VERTICALS (Muthoot Fincorp ONE 4-Column Grid Style)
export const CATEGORY_SECTIONS = [
  {
    id: 'SCHOOL_K12',
    title: 'I. School Education (Class 1–12)',
    icon: '🏫',
    items: [
      { id: 'state_reg', name: 'State Board\nMedium', icon: '🏫', filterKey: 'STATE_BOARD_MEDIUM', badge: 'Regional', badgeBg: '#6366F1' },
      { id: 'state_eng', name: 'State Board\nEnglish', icon: '🎒', filterKey: 'STATE_BOARD_ENGLISH' },
      { id: 'cbse', name: 'CBSE Board\nClasses 1-10', icon: '📘', filterKey: 'CBSE', badge: 'Popular', badgeBg: '#EC4899' },
      { id: 'icse', name: 'ICSE Board\nNCERT', icon: '📗', filterKey: 'ICSE' },
      { id: 'puc_sci', name: 'PUC Science\n(PCMB +1 & +2)', icon: '🔬', filterKey: 'Science', badge: 'Hot', badgeBg: '#F59E0B' },
      { id: 'puc_com', name: 'PUC Commerce\n(+1 & +2)', icon: '📊', filterKey: 'Commerce' },
      { id: 'puc_art', name: 'PUC Arts\n(+1 & +2)', icon: '🎨', filterKey: 'Arts' },
      { id: 'k12_all', name: 'All Classes\nMaster Pass', icon: '📚', filterKey: 'SCHOOL_K12', badge: 'New', badgeBg: '#06B6D4' },
    ],
  },
  {
    id: 'COMPETITIVE_EXAMS',
    title: 'II. School Entrance & Competitive Exams',
    icon: '🩺',
    items: [
      { id: 'neet', name: 'NEET UG\nMedical Prep', icon: '🩺', filterKey: 'NEET', badge: 'Popular', badgeBg: '#EC4899' },
      { id: 'jee', name: 'JEE Mains\n& Advanced', icon: '🚀', filterKey: 'JEE', badge: 'Hot', badgeBg: '#F59E0B' },
      { id: 'navodaya', name: 'Navodaya\nEntrance Exam', icon: '🏛️', filterKey: 'NAVODAYA', badge: 'New', badgeBg: '#06B6D4' },
      { id: 'nts', name: 'NTS Talent\nScholarship', icon: '💡', filterKey: 'NTS' },
      { id: 'gmat', name: 'G-MAT\nAptitude', icon: '📈', filterKey: 'GMAT' },
      { id: 'net', name: 'UGC NET\nLectureship', icon: '🎯', filterKey: 'NET' },
    ],
  },
  {
    id: 'STATE_GOVT_JOBS',
    title: 'III. State Government Jobs Preparation',
    icon: '🏛️',
    items: [
      { id: 'kas', name: 'KAS / State\nPSC Civil', icon: '🏛️', filterKey: 'KAS', badge: 'Popular', badgeBg: '#EC4899' },
      { id: 'sda', name: 'SDA Second\nDivision', icon: '📝', filterKey: 'SDA' },
      { id: 'fda', name: 'FDA First\nDivision', icon: '📋', filterKey: 'FDA' },
      { id: 'gpt', name: 'GPT Primary\nTeacher', icon: '👨‍🏫', filterKey: 'GPT', badge: 'Hot', badgeBg: '#F59E0B' },
      { id: 'police', name: 'State Police\nSI / Constable', icon: '👮', filterKey: 'Police', badge: 'New', badgeBg: '#06B6D4' },
      { id: 'state_all', name: 'Other State\nExams Pass', icon: '💼', filterKey: 'STATE_GOVT_JOBS' },
    ],
  },
  {
    id: 'CENTRAL_GOVT_JOBS',
    title: 'IV. Central Government Jobs Preparation',
    icon: '🏦',
    items: [
      { id: 'banking', name: 'Banking Exams\nIBPS & SBI', icon: '🏦', filterKey: 'BANKING', badge: 'Popular', badgeBg: '#EC4899' },
      { id: 'rrb', name: 'Railway Board\nRRB NTPC', icon: '🚆', filterKey: 'RRB', badge: 'Hot', badgeBg: '#F59E0B' },
      { id: 'ias', name: 'UPSC IAS\nCivil Services', icon: '🇮🇳', filterKey: 'IAS', badge: 'Top', badgeBg: '#8B5CF6' },
      { id: 'ssc', name: 'SSC CGL\n& CHSL', icon: '📑', filterKey: 'SSC' },
    ],
  },
  {
    id: 'TEACHER_PREP',
    title: 'V. Teacher Preparation & Certifications',
    icon: '🎓',
    items: [
      { id: 'bed', name: 'B.Ed Bachelor\nof Education', icon: '🎓', filterKey: 'BED' },
      { id: 'med', name: 'M.Ed Master\nof Education', icon: '📜', filterKey: 'MED' },
      { id: 'tet', name: 'State TET\nEligibility', icon: '✍️', filterKey: 'TET', badge: 'Popular', badgeBg: '#EC4899' },
      { id: 'ctet', name: 'CTET Central\nEligibility', icon: '🏅', filterKey: 'CTET', badge: 'National', badgeBg: '#10B981' },
    ],
  },
  {
    id: 'HIGHER_EDU',
    title: 'VI. Higher Education – UG & PG Degrees',
    icon: '📚',
    items: [
      { id: 'mba', name: 'MBA Business\nAdministration', icon: '💼', filterKey: 'MBA', badge: 'Popular', badgeBg: '#EC4899' },
      { id: 'mcom', name: 'M.Com Master\nof Commerce', icon: '📊', filterKey: 'MCOM' },
      { id: 'msc', name: 'M.Sc Master\nof Science', icon: '🔬', filterKey: 'MSC' },
      { id: 'ma', name: 'M.A Master\nof Arts', icon: '📖', filterKey: 'MA' },
    ],
  },
];

export const StudentPortal: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'MY_CLASSES' | 'BROWSE' | 'QUIZ' | 'WALLET' | 'KYC' | 'MLM_NETWORK'>('BROWSE');
  const [activeBannerIndex, setActiveBannerIndex] = useState<number>(0);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [selectedCategoryTitle, setSelectedCategoryTitle] = useState<string>('All Platform Courses');

  // Broadcast System Announcement State
  const [systemAnnouncement, setSystemAnnouncement] = useState(() => {
    return localStorage.getItem('eduverse_system_announcement') || '🎉 Special Cashback offer on NEET & K12 Master Pass! Enroll today!';
  });

  useEffect(() => {
    const handleStorage = () => {
      const updated = localStorage.getItem('eduverse_system_announcement');
      if (updated) setSystemAnnouncement(updated);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Dynamic Advertisements State
  const [activeAds, setActiveAds] = useState<AdRecord[]>([]);
  const [currentAdIdx, setCurrentAdIdx] = useState<number>(0);
  const [activeVideoAdModal, setActiveVideoAdModal] = useState<AdRecord | null>(null);

  const loadActiveAds = async () => {
    try {
      const res = await fetchActiveAds();
      if (res.success && res.data) {
        setActiveAds(res.data.ads || []);
      }
    } catch (err) {
      console.error('Failed to load active ads', err);
    }
  };

  // Auto-rotate promotional carousel banners
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBannerIndex((prev) => (prev + 1) % PROMO_BANNERS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleBannerPress = (banner: (typeof PROMO_BANNERS)[0]) => {
    if (banner.actionKey === 'FILTER_NEET') {
      setActiveTab('BROWSE');
      setSelectedCategoryFilter('NEET');
      setSelectedCategoryTitle('NEET UG Medical Prep');
    } else if (banner.actionKey === 'SHARE_LINK') {
      setActiveTab('MLM_NETWORK');
    } else if (banner.actionKey === 'GO_QUIZ') {
      setActiveTab('QUIZ');
    }
  };

  // Stats & Course Lists State
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<CourseRecord[]>([]);
  const [browseCoursesList, setBrowseCoursesList] = useState<CourseRecord[]>([]);
  const [mcqList, setMcqList] = useState<McqRecord[]>([]);
  const [quizSetsList, setQuizSetsList] = useState<QuizSetGroup[]>([]);
  const [selectedQuizSetId, setSelectedQuizSetId] = useState<string>('');

  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isLoadingEnrolled, setIsLoadingEnrolled] = useState(false);
  const [isLoadingBrowse, setIsLoadingBrowse] = useState(false);
  const [isLoadingMcqs, setIsLoadingMcqs] = useState(false);
  const [selectedCourseDetail, setSelectedCourseDetail] = useState<CourseRecord | null>(null);

  // Enrollment State
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);
  const [enrollSuccessMsg, setEnrollSuccessMsg] = useState('');
  const [enrollErrorMsg, setEnrollErrorMsg] = useState('');

  // Wallet Top-Up State
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmountInput, setTopUpAmountInput] = useState('2500');
  const [topUpSuccessMsg, setTopUpSuccessMsg] = useState('');
  const [topUpErrorMsg, setTopUpErrorMsg] = useState('');
  const [isSubmittingTopUp, setIsSubmittingTopUp] = useState(false);

  // Interactive Quiz Player State
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizResult, setQuizResult] = useState<QuizAttemptResult | null>(null);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);
  const [quizErrorMsg, setQuizErrorMsg] = useState('');

  // Student KYC Form State (Dual Aadhaar & PAN Support)
  const [aadhaarNumInput, setAadhaarNumInput] = useState('');
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
  const [aadhaarPreview, setAadhaarPreview] = useState('');

  const [panNumInput, setPanNumInput] = useState('');
  const [panFile, setPanFile] = useState<File | null>(null);
  const [panPreview, setPanPreview] = useState('');

  const [kycSuccessMsg, setKycSuccessMsg] = useState('');
  const [kycErrorMsg, setKycErrorMsg] = useState('');
  const [isSubmittingKyc, setIsSubmittingKyc] = useState(false);

  // Load Student Dashboard Stats
  const loadStats = async () => {
    setIsLoadingStats(true);
    const res = await fetchStudentDashboardStats();
    if (res.success && res.data) {
      setStats(res.data.stats);
    }
    setIsLoadingStats(false);
  };

  // Load My Enrolled Courses
  const loadEnrolled = async () => {
    setIsLoadingEnrolled(true);
    const res = await fetchMyEnrolledCourses();
    if (res.success && res.data) {
      setEnrolledCourses(res.data.courses || []);
    }
    setIsLoadingEnrolled(false);
  };

  // Load Browse Platform Courses — filtered by student preference or all
  const loadBrowse = async () => {
    setIsLoadingBrowse(true);
    const params = filterMode === 'EXPLORE_ALL' ? { showAll: true } : {};
    const res = await fetchBrowseCourses(params);
    if (res.success && res.data) {
      setBrowseCoursesList(res.data.courses || []);
    }
    setIsLoadingBrowse(false);
  };

  // Load Quiz Questions & Sets
  const loadMcqs = async () => {
    setIsLoadingMcqs(true);
    const res = await fetchStudentPracticeMcqs();
    if (res.success && res.data) {
      const sets = res.data.quizSets || [];
      setQuizSetsList(sets);

      let currentSet = sets.find((s) => s.quizSetId === selectedQuizSetId);
      if (!currentSet && sets.length > 0) {
        currentSet = sets[0];
        setSelectedQuizSetId(currentSet.quizSetId);
      }

      if (currentSet) {
        setMcqList(currentSet.mcqs || []);
        if (currentSet.hasAttempted && currentSet.lastAttempt) {
          setQuizResult({
            _id: currentSet.lastAttempt._id,
            score: currentSet.lastAttempt.score,
            totalMarks: currentSet.lastAttempt.totalMarks,
            percentage: currentSet.lastAttempt.percentage,
            passed: currentSet.lastAttempt.passed,
            createdAt: currentSet.lastAttempt.createdAt
          });
        } else {
          setQuizResult(null);
        }
      } else {
        setMcqList(res.data.mcqs || []);
      }
    }
    setIsLoadingMcqs(false);
  };

  const handleSelectQuizSet = (setObj: QuizSetGroup) => {
    setSelectedQuizSetId(setObj.quizSetId);
    setMcqList(setObj.mcqs || []);
    setSelectedAnswers({});
    setQuizErrorMsg('');
    if (setObj.hasAttempted && setObj.lastAttempt) {
      setQuizResult({
        _id: setObj.lastAttempt._id,
        score: setObj.lastAttempt.score,
        totalMarks: setObj.lastAttempt.totalMarks,
        percentage: setObj.lastAttempt.percentage,
        passed: setObj.lastAttempt.passed,
        createdAt: setObj.lastAttempt.createdAt
      });
    } else {
      setQuizResult(null);
    }
  };

  // Student Learning Goal Preference State
  const [showPreferenceModal, setShowPreferenceModal] = useState(false);
  const [filterMode, setFilterMode] = useState<'GOAL_MATCH' | 'EXPLORE_ALL'>('GOAL_MATCH');
  const [currentUserObj, setCurrentUserObj] = useState<any>(user);

  useEffect(() => {
    loadStats();
    loadEnrolled();
    loadBrowse();
    loadMcqs();
    loadActiveAds();

    // Auto-launch Preference Selection Modal if student has not set preferences yet!
    if (user?.role === 'STUDENT' && !user?.learningPreference?.isPreferenceSet) {
      setShowPreferenceModal(true);
    }
  }, [user]);

  // Reload courses when filter mode toggles (Goal Match ↔ Explore All)
  useEffect(() => {
    loadBrowse();
  }, [filterMode]);

  const handlePreferenceSaved = (updatedUser: any) => {
    setCurrentUserObj(updatedUser);
    loadBrowse();
  };

  // 1-Click Course Enrollment
  const handleEnrollSubmit = async (course: CourseRecord) => {
    setEnrollSuccessMsg('');
    setEnrollErrorMsg('');
    setEnrollingCourseId(course._id);

    const res = await enrollCourse(course._id);
    setEnrollingCourseId(null);

    if (res.success && res.data) {
      setEnrollSuccessMsg(`🎉 Successfully enrolled in ${course.title}! Check your My Classroom tab.`);
      loadStats();
      loadEnrolled();
    } else {
      const errMsg = res.message || 'Course enrollment failed.';
      setEnrollErrorMsg(errMsg);
      if (errMsg.toLowerCase().includes('insufficient') || errMsg.toLowerCase().includes('balance') || errMsg.toLowerCase().includes('top up')) {
        setShowTopUpModal(true);
        setTopUpErrorMsg(`Your wallet balance is low for enrolling in "${course.title}". Top-up below to complete enrollment!`);
      }
    }
  };

  // Top-Up Wallet Submit
  const handleTopUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTopUpErrorMsg('');
    setTopUpSuccessMsg('');

    const amt = Number(topUpAmountInput);
    if (isNaN(amt) || amt <= 0) {
      setTopUpErrorMsg('Please enter a valid positive top-up amount.');
      return;
    }

    setIsSubmittingTopUp(true);
    const res = await topUpStudentWallet(amt);
    setIsSubmittingTopUp(false);

    if (res.success) {
      setTopUpSuccessMsg(`🎉 Wallet credited with ₹${amt.toLocaleString('en-IN')}!`);
      loadStats();
      setTimeout(() => {
        setShowTopUpModal(false);
        setTopUpSuccessMsg('');
      }, 1500);
    } else {
      setTopUpErrorMsg(res.message || 'Top-up failed.');
    }
  };

  // Quiz Option Selection
  const handleSelectQuizOption = (questionId: string, optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  // Quiz Submission
  const handleQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuizErrorMsg('');
    setQuizResult(null);

    const answerPayload = Object.entries(selectedAnswers).map(([questionId, selectedOptionIndex]) => ({
      questionId,
      selectedOptionIndex
    }));

    if (answerPayload.length === 0) {
      setQuizErrorMsg('Please answer at least 1 question before submitting.');
      return;
    }

    const activeSet = quizSetsList.find((s) => s.quizSetId === selectedQuizSetId);

    setIsSubmittingQuiz(true);
    const res = await submitStudentQuiz(answerPayload, selectedQuizSetId, activeSet?.quizSetTitle);
    setIsSubmittingQuiz(false);

    if (res.success && res.data) {
      setQuizResult(res.data.attempt);
      loadStats();
      loadMcqs();
    } else {
      setQuizErrorMsg(res.message || 'Failed to submit quiz.');
    }
  };

  // Aadhaar File Change (2MB Limit Validation)
  const handleAadhaarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKycErrorMsg('');
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        setKycErrorMsg('⛔ Aadhaar Card file size must not exceed 2MB!');
        setAadhaarFile(null);
        setAadhaarPreview('');
        e.target.value = '';
        return;
      }
      setAadhaarFile(file);
      setAadhaarPreview(URL.createObjectURL(file));
    }
  };

  // PAN File Change (2MB Limit Validation)
  const handlePanFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKycErrorMsg('');
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        setKycErrorMsg('⛔ PAN Card file size must not exceed 2MB!');
        setPanFile(null);
        setPanPreview('');
        e.target.value = '';
        return;
      }
      setPanFile(file);
      setPanPreview(URL.createObjectURL(file));
    }
  };

  // Dual KYC Submit
  const handleKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setKycErrorMsg('');
    setKycSuccessMsg('');

    if (!aadhaarNumInput.trim() && !panNumInput.trim()) {
      setKycErrorMsg('Please enter your Aadhaar Number and/or PAN Number.');
      return;
    }

    setIsSubmittingKyc(true);
    const res = await submitStudentKyc({
      aadhaarNumber: aadhaarNumInput.trim(),
      aadhaarFile,
      panNumber: panNumInput.trim(),
      panFile
    });
    setIsSubmittingKyc(false);

    if (res.success) {
      setKycSuccessMsg('✅ Both Aadhaar Card & PAN Card documents submitted successfully! Admin verification pending.');
      loadStats();
    } else {
      setKycErrorMsg(res.message || 'Failed to submit KYC.');
    }
  };

  return (
    <div>
      {/* PhonePe-Style Profile & Header Suite */}
      <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '16px', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          {/* User Profile Avatar with QR Scanner Overlay (PhonePe Style) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '900',
                fontSize: '1.25rem',
                color: '#0F172A',
                boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)',
                border: '2px solid rgba(255, 255, 255, 0.3)'
              }}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
              </div>
              {/* Mini QR Badge */}
              <div style={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                background: '#0F172A',
                borderRadius: '6px',
                padding: '3px',
                border: '1px solid #F59E0B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <QrCode size={10} color="#F59E0B" />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                <h1 style={{ fontSize: '1.28rem', fontWeight: '800', margin: 0, letterSpacing: '-0.3px', color: 'var(--text-primary)' }}>
                  {user?.name || 'Student Learner'}
                </h1>
                <span style={{
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: '#818CF8',
                  padding: '2px 8px',
                  borderRadius: '20px',
                  fontSize: '0.68rem',
                  fontWeight: '800',
                  letterSpacing: '0.5px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                  ONLINE
                </span>
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                ID: <strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{user?.userId || 'EDU-STUDENT'}</strong> • State: {user?.stateCode || 'ALL'}
              </div>
            </div>
          </div>

          {/* Right Header Actions: PhonePe Refer Pill, Goal Setter, Top-Up, Refresh */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('MLM_NETWORK')}
              style={{
                background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.15) 0%, rgba(249, 115, 22, 0.25) 100%)',
                border: '1px solid #F97316',
                color: '#EA580C',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: '800',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <span>🤝</span>
              <span>Refer → ₹25k</span>
            </button>

            <button className="btn-emerald" onClick={() => setShowPreferenceModal(true)} style={{ padding: '6px 12px', fontSize: '0.78rem', fontWeight: '700' }}>
              <Target size={14} /> 🎯 Set Goal
            </button>

            <button className="btn-emerald" onClick={() => { setShowTopUpModal(true); setTopUpErrorMsg(''); }} style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
              <PlusCircle size={14} /> Top-Up Wallet
            </button>

            <button className="btn-secondary" onClick={() => { loadStats(); loadEnrolled(); loadBrowse(); loadMcqs(); loadActiveAds(); }} style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
              <RefreshCw size={14} className={isLoadingStats ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* GLOBAL SYSTEM ANNOUNCEMENT BROADCAST BANNER */}
      {systemAnnouncement && (
        <div style={{
          padding: '10px 16px',
          borderRadius: '12px',
          background: 'linear-gradient(90deg, rgba(244,63,94,0.12), rgba(245,158,11,0.12))',
          border: '1px solid rgba(244,63,94,0.3)',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '0.85rem'
        }}>
          <Megaphone size={18} style={{ color: '#FB7185', flexShrink: 0 }} />
          <div style={{ flex: 1, color: 'var(--text-primary)' }}>
            <strong style={{ color: '#FB7185', textTransform: 'uppercase', marginRight: '6px' }}>📢 Official Admin Announcement:</strong>
            {systemAnnouncement}
          </div>
        </div>
      )}

      {/* DYNAMIC SPONSOR / PROMOTIONAL AD BANNER & CAROUSEL */}
      {activeAds.length > 0 && (() => {
        const ad = activeAds[currentAdIdx % activeAds.length];
        if (!ad) return null;

        return (
          <div
            className="glass-card"
            style={{
              padding: '16px 20px',
              marginBottom: '20px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    fontWeight: '800',
                    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                    color: '#FFF'
                  }}
                >
                  <Sparkles size={11} /> SPONSORED SPOTLIGHT
                </span>
                <span
                  className="badge badge-secondary"
                  style={{ fontSize: '0.68rem', padding: '2px 6px' }}
                >
                  {ad.type === 'IMAGE' ? '🖼️ IMAGE AD' : '🎬 VIDEO AD'}
                </span>
              </div>

              {activeAds.length > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    onClick={() => setCurrentAdIdx((prev) => (prev - 1 + activeAds.length) % activeAds.length)}
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      color: 'var(--text-secondary)',
                      padding: '3px 6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title="Previous Ad"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700' }}>
                    {((currentAdIdx % activeAds.length) + 1)} / {activeAds.length}
                  </span>
                  <button
                    onClick={() => setCurrentAdIdx((prev) => (prev + 1) % activeAds.length)}
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      color: 'var(--text-secondary)',
                      padding: '3px 6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title="Next Ad"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', alignItems: 'center' }}>
              {/* Media Container */}
              <div
                style={{
                  borderRadius: '12px',
                  overflow: 'hidden',
                  height: '180px',
                  position: 'relative',
                  backgroundColor: '#0F172A',
                  cursor: 'pointer',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
                onClick={() => {
                  if (ad.type === 'VIDEO') {
                    setActiveVideoAdModal(ad);
                  } else if (ad.targetUrl) {
                    window.open(ad.targetUrl, '_blank');
                  }
                }}
              >
                {ad.type === 'IMAGE' ? (
                  <img
                    src={ad.mediaUrl}
                    alt={ad.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800';
                    }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)' }}>
                    <video
                      src={ad.mediaUrl}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.65 }}
                      muted
                      playsInline
                    />
                    <div
                      style={{
                        position: 'absolute',
                        width: '46px',
                        height: '46px',
                        borderRadius: '50%',
                        background: 'rgba(236, 72, 153, 0.9)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 16px rgba(236, 72, 153, 0.6)'
                      }}
                    >
                      <Play size={22} color="#FFFFFF" style={{ marginLeft: '3px' }} />
                    </div>
                  </div>
                )}

                <div style={{ position: 'absolute', bottom: '8px', right: '10px', background: 'rgba(0,0,0,0.65)', padding: '2px 8px', borderRadius: '4px', color: '#FFFFFF', fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {ad.type === 'VIDEO' ? '▶ Play Video Ad' : (ad.targetUrl ? '↗ Open Link' : '🖼️ View')}
                </div>
              </div>

              {/* Text & Action CTA */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0, lineHeight: 1.3 }}>
                  {ad.title}
                </h3>
                {ad.description && (
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                    {ad.description}
                  </p>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px', flexWrap: 'wrap' }}>
                  {ad.type === 'VIDEO' && (
                    <button
                      onClick={() => setActiveVideoAdModal(ad)}
                      className="btn-rose"
                      style={{ padding: '8px 16px', fontSize: '0.82rem', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '6px', borderRadius: '10px' }}
                    >
                      <Play size={15} /> Watch Video Ad
                    </button>
                  )}

                  {ad.targetUrl && (
                    <a
                      href={ad.targetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary"
                      style={{
                        padding: '8px 16px',
                        fontSize: '0.82rem',
                        fontWeight: '800',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        borderRadius: '10px',
                        textDecoration: 'none',
                        background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                        border: 'none',
                        color: '#FFF'
                      }}
                    >
                      Learn More / Visit <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Student Personalization Goal Banner */}
      <div className="glass-card" style={{ padding: '12px 18px', marginBottom: '20px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(99,102,241,0.1) 100%)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(16,185,129,0.2)', color: '#34D399' }}>
            <Target size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#34D399', letterSpacing: '0.5px' }}>
              CURRENT PERSONALIZED LEARNING GOAL
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#FFF' }}>
              {currentUserObj?.learningPreference?.boardOrGrade || currentUserObj?.learningPreference?.subCategoryTitle || 'All Courses & Boards'}
              {currentUserObj?.learningPreference?.stream ? ` (${currentUserObj.learningPreference.stream})` : ''}
              <span className="badge badge-amber" style={{ marginLeft: '8px', padding: '1px 6px', fontSize: '0.7rem' }}>
                State: {currentUserObj?.learningPreference?.stateCode || 'GLOBAL'}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={filterMode === 'GOAL_MATCH' ? 'btn-emerald' : 'btn-secondary'}
            onClick={() => setFilterMode('GOAL_MATCH')}
            style={{ padding: '5px 10px', fontSize: '0.75rem' }}
          >
            🎯 Filtered for My Goal
          </button>
          <button
            className={filterMode === 'EXPLORE_ALL' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setFilterMode('EXPLORE_ALL')}
            style={{ padding: '5px 10px', fontSize: '0.75rem' }}
          >
            🌐 Explore All Courses
          </button>
        </div>
      </div>

      {/* 100% Dynamic Student Metric Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <div className="glass-card" style={{ padding: '12px 16px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(79,70,229,0.12) 100%)' }}>
          <div style={{ fontSize: '0.72rem', color: '#818CF8', fontWeight: '700', marginBottom: '2px' }}>
            MY ENROLLED BATCHES
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: '800' }}>
            {enrolledCourses.length > 0 ? enrolledCourses.length : (stats ? stats.enrolledCoursesCount : 0)} Courses
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Live Classes & Recorded Videos</div>
        </div>

        <div className="glass-card" style={{ padding: '14px 18px', borderRadius: '14px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.08) 100%)', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.74rem', color: '#34D399', fontWeight: '800', marginBottom: '2px', letterSpacing: '0.5px' }}>
              STUDENT WALLET BALANCE
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-primary)' }}>
              ₹ {stats ? (stats.walletBalance || 0).toLocaleString('en-IN') : '0'}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Used for 1-Click Course Enrollments</div>
          </div>
          <button
            className="btn-emerald"
            onClick={() => { setShowTopUpModal(true); setTopUpErrorMsg(''); }}
            style={{ marginTop: '10px', padding: '6px 14px', fontSize: '0.8rem', fontWeight: '800', width: 'fit-content', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
          >
            💳 + Add Money (Top-Up)
          </button>
        </div>

        <div className="glass-card" style={{ padding: '12px 16px', borderRadius: '12px' }}>
          <div style={{ fontSize: '0.72rem', color: '#FBBF24', fontWeight: '700', marginBottom: '2px' }}>
            QUIZZES COMPLETED
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: '800' }}>
            {stats ? stats.quizAttemptsCount : 0} Quizzes
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>MCQ Practice Tests</div>
        </div>

        <div className="glass-card" style={{ padding: '12px 16px', borderRadius: '12px' }}>
          <div style={{ fontSize: '0.72rem', color: '#A855F7', fontWeight: '700', marginBottom: '2px' }}>
            KYC VERIFICATION
          </div>
          <div style={{ marginTop: '4px' }}>
            <span className={`badge ${stats?.kycStatus === 'APPROVED' || stats?.kycStatus === 'VERIFIED' ? 'badge-emerald' : stats?.kycStatus === 'PENDING' ? 'badge-amber' : 'badge-rose'}`} style={{ fontSize: '0.78rem', padding: '3px 8px' }}>
              {stats?.kycStatus || 'NOT_SUBMITTED'}
            </span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {stats?.kycStatus === 'REJECTED' && stats?.kycRejectionReason ? (
              <span style={{ color: '#FB7185', fontWeight: '600' }} title={stats.kycRejectionReason}>
                ❌ Reason: {stats.kycRejectionReason.length > 22 ? `${stats.kycRejectionReason.substring(0, 22)}...` : stats.kycRejectionReason}
              </span>
            ) : (
              'Govt Aadhaar / PAN Scan'
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs (PhonePe & Muthoot Style) */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '22px', background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '14px', border: '1px solid var(--border-color)', overflowX: 'auto' }}>
        <button
          onClick={() => setActiveTab('BROWSE')}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: '10px',
            border: 'none',
            background: activeTab === 'BROWSE' ? 'var(--primary-gradient)' : 'transparent',
            color: activeTab === 'BROWSE' ? '#FFF' : 'var(--text-secondary)',
            fontWeight: '800',
            fontSize: '0.84rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s ease'
          }}
        >
          <span>🏠</span>
          <span>Explore & Courses ({browseCoursesList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('MY_CLASSES')}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: '10px',
            border: 'none',
            background: activeTab === 'MY_CLASSES' ? 'var(--primary-gradient)' : 'transparent',
            color: activeTab === 'MY_CLASSES' ? '#FFF' : 'var(--text-secondary)',
            fontWeight: '700',
            fontSize: '0.84rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s ease'
          }}
        >
          <span>🎓</span>
          <span>My Classroom ({enrolledCourses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('QUIZ')}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: '10px',
            border: 'none',
            background: activeTab === 'QUIZ' ? 'var(--amber-gradient)' : 'transparent',
            color: activeTab === 'QUIZ' ? '#FFF' : 'var(--text-secondary)',
            fontWeight: '700',
            fontSize: '0.84rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s ease'
          }}
        >
          <span>⚡</span>
          <span>Practice Quiz {quizResult ? '(Completed)' : `(${mcqList.length})`}</span>
        </button>

        <button
          onClick={() => setActiveTab('WALLET')}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: '10px',
            border: 'none',
            background: activeTab === 'WALLET' ? 'var(--emerald-gradient)' : 'transparent',
            color: activeTab === 'WALLET' ? '#FFF' : 'var(--text-secondary)',
            fontWeight: '700',
            fontSize: '0.84rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s ease'
          }}
        >
          <span>💳</span>
          <span>Wallet & Credits (₹{stats?.walletBalance || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('KYC')}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: '10px',
            border: 'none',
            background: activeTab === 'KYC' ? 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)' : 'transparent',
            color: activeTab === 'KYC' ? '#FFF' : 'var(--text-secondary)',
            fontWeight: '700',
            fontSize: '0.84rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s ease'
          }}
        >
          <span>🆔</span>
          <span>KYC Verification</span>
        </button>

        <button
          onClick={() => setActiveTab('MLM_NETWORK')}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: '10px',
            border: 'none',
            background: activeTab === 'MLM_NETWORK' ? 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)' : 'transparent',
            color: activeTab === 'MLM_NETWORK' ? '#FFF' : '#F43F5E',
            fontWeight: '800',
            fontSize: '0.84rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s ease'
          }}
        >
          <span>🤝</span>
          <span>Refer & Earn (₹25k)</span>
        </button>
      </div>

      {/* SUB-TAB: MLM BINARY REFERRAL NETWORK */}
      {activeTab === 'MLM_NETWORK' && (
        <AffiliateMlmPortal />
      )}

      {/* SUB-TAB 1: MY CLASSROOM (ENROLLED COURSES) */}
      {activeTab === 'MY_CLASSES' && (
        <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800' }}>
              My Enrolled Batches & Classroom ({enrolledCourses.length})
            </h3>
            <button className="btn-primary" onClick={() => setActiveTab('BROWSE')} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
              <ShoppingBag size={14} /> Enroll in New Course
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {isLoadingEnrolled ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading your classroom batches...</div>
            ) : enrolledCourses.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
                <p style={{ fontSize: '0.9rem', margin: '0 0 10px 0' }}>You have not enrolled in any course batches yet.</p>
                <button className="btn-primary" onClick={() => setActiveTab('BROWSE')} style={{ fontSize: '0.82rem', padding: '8px 16px' }}>
                  <ShoppingBag size={15} /> Browse Available Courses
                </button>
              </div>
            ) : (
              enrolledCourses.map((crs) => (
                <div
                  key={crs._id}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '12px',
                    background: 'rgba(99,102,241,0.04)',
                    border: '1px solid var(--border-color)',
                    borderLeft: '4px solid #6366F1',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {crs.thumbnail && (
                      <img src={crs.thumbnail} alt="Banner" style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                    )}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: '800', fontSize: '0.95rem' }}>{crs.title}</span>
                        <span className="badge badge-emerald" style={{ padding: '2px 6px', fontSize: '0.7rem' }}>ENROLLED</span>
                        <span className="badge badge-primary" style={{ padding: '2px 6px', fontSize: '0.7rem' }}>{crs.boardOrGrade || 'General Batch'}</span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Educator: <strong>{crs.instructor?.name || 'Prof. Educator'}</strong> • State: {crs.stateCode}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {(crs.courseMode === 'LIVE_ONLINE' || crs.courseMode === 'HYBRID' || crs.liveMeetingUrl || !crs.lectureVideoUrl) && (
                      <a
                        href={crs.liveMeetingUrl || 'https://meet.google.com/eduverse-live-class'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-emerald"
                        style={{ fontSize: '0.78rem', padding: '6px 12px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: '800' }}
                      >
                        <Radio size={14} className="animate-pulse" /> Join Live Class
                      </a>
                    )}

                    {(crs.courseMode === 'RECORDED_VIDEO' || crs.lectureVideoUrl || crs.courseMode === 'HYBRID') && (
                      <a
                        href={crs.lectureVideoUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary"
                        style={{ fontSize: '0.78rem', padding: '6px 12px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Video size={14} /> Watch Recorded Lectures
                      </a>
                    )}

                    <button className="btn-secondary" onClick={() => setSelectedCourseDetail(crs)} style={{ fontSize: '0.75rem', padding: '6px 10px' }}>
                      <Eye size={13} style={{ marginRight: '4px' }} /> View Details
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: BROWSE PLATFORM COURSES (PhonePe & Muthoot Fincorp ONE Style) */}
      {activeTab === 'BROWSE' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* 1. PhonePe Quick Hub & Classroom Access (6 Circular elevated service buttons) */}
          <div className="glass-card" style={{ padding: '20px 24px', borderRadius: '18px', border: '1px solid rgba(99,102,241,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.25rem' }}>⚡</span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                  Quick Hub & Classroom Access
                </h3>
              </div>
              <span className="badge badge-primary" style={{ padding: '3px 10px', fontSize: '0.72rem', fontWeight: '800' }}>
                6 SERVICES
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '16px' }}>
              {/* Service 1: My Classes */}
              <div
                onClick={() => setActiveTab('MY_CLASSES')}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', cursor: 'pointer' }}
              >
                <div className="phonepe-service-circle" style={{ background: 'rgba(99, 102, 241, 0.15)', border: '1.5px solid #6366F1' }}>
                  <span style={{ fontSize: '1.5rem' }}>🎓</span>
                  <span style={{ position: 'absolute', top: -4, right: -4, background: '#6366F1', color: '#FFF', padding: '1px 6px', borderRadius: '10px', fontSize: '0.65rem', fontWeight: '900' }}>
                    {enrolledCourses.length}
                  </span>
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', marginTop: '8px', color: 'var(--text-primary)' }}>My Classes</span>
              </div>

              {/* Service 2: Mock Tests */}
              <div
                onClick={() => setActiveTab('QUIZ')}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', cursor: 'pointer' }}
              >
                <div className="phonepe-service-circle" style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1.5px solid #F59E0B' }}>
                  <span style={{ fontSize: '1.5rem' }}>⚡</span>
                  <span style={{ position: 'absolute', top: -4, right: -4, background: '#F59E0B', color: '#0F172A', padding: '1px 6px', borderRadius: '10px', fontSize: '0.65rem', fontWeight: '900' }}>
                    FREE
                  </span>
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', marginTop: '8px', color: 'var(--text-primary)' }}>Mock Tests</span>
              </div>

              {/* Service 3: E-Books */}
              <div
                onClick={() => setActiveTab('WALLET')}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', cursor: 'pointer' }}
              >
                <div className="phonepe-service-circle" style={{ background: 'rgba(6, 182, 212, 0.15)', border: '1.5px solid #06B6D4' }}>
                  <span style={{ fontSize: '1.5rem' }}>📖</span>
                  <span style={{ position: 'absolute', top: -4, right: -4, background: '#06B6D4', color: '#FFF', padding: '1px 6px', borderRadius: '10px', fontSize: '0.65rem', fontWeight: '900' }}>
                    PDFs
                  </span>
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', marginTop: '8px', color: 'var(--text-primary)' }}>E-Books</span>
              </div>

              {/* Service 4: Top-Up Wallet */}
              <div
                onClick={() => { setShowTopUpModal(true); setTopUpErrorMsg(''); }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', cursor: 'pointer' }}
              >
                <div className="phonepe-service-circle" style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1.5px solid #10B981' }}>
                  <span style={{ fontSize: '1.5rem' }}>💳</span>
                  <span style={{ position: 'absolute', top: -4, right: -4, background: '#10B981', color: '#FFF', padding: '1px 6px', borderRadius: '10px', fontSize: '0.65rem', fontWeight: '900' }}>
                    ₹{stats?.walletBalance || 0}
                  </span>
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', marginTop: '8px', color: 'var(--text-primary)' }}>Top-Up Wallet</span>
              </div>

              {/* Service 5: Refer & Earn */}
              <div
                onClick={() => setActiveTab('MLM_NETWORK')}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', cursor: 'pointer' }}
              >
                <div className="phonepe-service-circle" style={{ background: 'rgba(236, 72, 153, 0.15)', border: '1.5px solid #EC4899' }}>
                  <span style={{ fontSize: '1.5rem' }}>🤝</span>
                  <span style={{ position: 'absolute', top: -4, right: -4, background: '#EC4899', color: '#FFF', padding: '1px 6px', borderRadius: '10px', fontSize: '0.65rem', fontWeight: '900' }}>
                    ₹25K
                  </span>
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', marginTop: '8px', color: 'var(--text-primary)' }}>Refer & Earn</span>
              </div>

              {/* Service 6: KYC Verify */}
              <div
                onClick={() => setActiveTab('KYC')}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', cursor: 'pointer' }}
              >
                <div className="phonepe-service-circle" style={{ background: 'rgba(139, 92, 246, 0.15)', border: '1.5px solid #8B5CF6' }}>
                  <span style={{ fontSize: '1.5rem' }}>🆔</span>
                  <span style={{ position: 'absolute', top: -4, right: -4, background: '#8B5CF6', color: '#FFF', padding: '1px 6px', borderRadius: '10px', fontSize: '0.65rem', fontWeight: '900' }}>
                    {stats?.kycStatus === 'APPROVED' ? 'VERIFIED' : 'KYC'}
                  </span>
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', marginTop: '8px', color: 'var(--text-primary)' }}>KYC Verify</span>
              </div>
            </div>
          </div>

          {/* 2. Muthoot Fincorp ONE Style Hero Promotional Carousel Banner */}
          <div>
            <div
              onClick={() => handleBannerPress(PROMO_BANNERS[activeBannerIndex])}
              className="glass-card"
              style={{
                padding: '22px 26px',
                borderRadius: '20px',
                border: `1.5px solid ${PROMO_BANNERS[activeBannerIndex].accentColor}`,
                boxShadow: `0 8px 30px -8px ${PROMO_BANNERS[activeBannerIndex].accentColor}40`,
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{
                  background: `${PROMO_BANNERS[activeBannerIndex].accentColor}22`,
                  color: PROMO_BANNERS[activeBannerIndex].accentColor,
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: '800',
                  letterSpacing: '0.5px'
                }}>
                  {PROMO_BANNERS[activeBannerIndex].tag}
                </span>
                <span style={{
                  background: PROMO_BANNERS[activeBannerIndex].accentColor,
                  color: '#FFF',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.72rem',
                  fontWeight: '900',
                  letterSpacing: '0.5px'
                }}>
                  {PROMO_BANNERS[activeBannerIndex].badgeText}
                </span>
              </div>

              <h2 style={{ fontSize: '1.45rem', fontWeight: '800', margin: '0 0 6px 0', color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
                {PROMO_BANNERS[activeBannerIndex].title}
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                {PROMO_BANNERS[activeBannerIndex].subTitle}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBannerPress(PROMO_BANNERS[activeBannerIndex]);
                  }}
                  style={{
                    background: PROMO_BANNERS[activeBannerIndex].accentColor,
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '8px 18px',
                    fontSize: '0.85rem',
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    boxShadow: `0 4px 12px ${PROMO_BANNERS[activeBannerIndex].accentColor}50`
                  }}
                >
                  <span>{PROMO_BANNERS[activeBannerIndex].ctaText}</span>
                  <ArrowRight size={15} />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveBannerIndex((prev) => (prev + 1) % PROMO_BANNERS.length);
                  }}
                  className="btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.78rem', fontWeight: '700', borderRadius: '8px' }}
                >
                  Next Promo ❯
                </button>
              </div>
            </div>

            {/* Pagination Dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
              {PROMO_BANNERS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveBannerIndex(idx)}
                  style={{
                    width: activeBannerIndex === idx ? '24px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    background: activeBannerIndex === idx ? '#6366F1' : 'var(--border-color)',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'all 0.3s ease'
                  }}
                  title={`Promo ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* 3. 6 Core Educational Verticals Grid (Muthoot Fincorp ONE Style) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {CATEGORY_SECTIONS.map((sec) => (
              <div
                key={sec.id}
                className="glass-card"
                style={{
                  padding: '20px 22px',
                  borderRadius: '18px',
                  border: '1px solid var(--border-color)'
                }}
              >
                {/* Category Header with View All */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.25rem' }}>{sec.icon}</span>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                      {sec.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCategoryFilter(sec.id);
                      setSelectedCategoryTitle(sec.title);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#6366F1',
                      fontSize: '0.82rem',
                      fontWeight: '800',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px',
                      cursor: 'pointer'
                    }}
                  >
                    <span>View All</span>
                    <span>❯</span>
                  </button>
                </div>

                {/* 4-8 Column Grid */}
                <div className="category-vertical-grid">
                  {sec.items.map((item) => {
                    const isSelected = selectedCategoryFilter === item.filterKey;
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          setSelectedCategoryFilter(item.filterKey);
                          setSelectedCategoryTitle(item.name.replace('\n', ' '));
                        }}
                        className="squircle-cat-item"
                        style={{
                          background: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                          border: isSelected ? '1px solid #6366F1' : '1px solid transparent'
                        }}
                      >
                        <div
                          className="squircle-icon-box"
                          style={{
                            borderColor: isSelected ? '#6366F1' : 'var(--border-color)',
                            background: isSelected ? 'rgba(99, 102, 241, 0.2)' : undefined,
                            boxShadow: isSelected ? '0 0 14px rgba(99, 102, 241, 0.4)' : undefined
                          }}
                        >
                          {item.badge && (
                            <span
                              className="badge-mini-tag"
                              style={{ background: item.badgeBg || '#EC4899' }}
                            >
                              {item.badge}
                            </span>
                          )}
                          <span>{item.icon}</span>
                        </div>
                        <span style={{
                          fontSize: '0.76rem',
                          fontWeight: isSelected ? '800' : '700',
                          color: isSelected ? '#6366F1' : 'var(--text-primary)',
                          marginTop: '6px',
                          lineHeight: 1.3,
                          whiteSpace: 'pre-line'
                        }}>
                          {item.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* 4. Active Filter Status & Course Catalog Header */}
          <div className="glass-card" style={{ padding: '22px', borderRadius: '18px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0 }}>
                    Available Platform Batches & Courses Directory
                  </h3>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span>Filtered by: <strong style={{ color: 'var(--text-primary)' }}>{selectedCategoryTitle}</strong></span>
                  {selectedCategoryFilter !== 'ALL' && (
                    <button
                      onClick={() => {
                        setSelectedCategoryFilter('ALL');
                        setSelectedCategoryTitle('All Platform Courses');
                      }}
                      style={{
                        background: 'rgba(244, 63, 94, 0.12)',
                        color: '#FB7185',
                        border: '1px solid rgba(244, 63, 94, 0.3)',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: '800',
                        cursor: 'pointer'
                      }}
                    >
                      ✕ Clear Filter (Show All)
                    </button>
                  )}
                </div>
              </div>

              <button className="btn-secondary" onClick={loadBrowse} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                <RefreshCw size={14} className={isLoadingBrowse ? 'animate-spin' : ''} /> Refresh Catalog
              </button>
            </div>

            {enrollSuccessMsg && (
              <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', color: '#34D399', fontSize: '0.84rem', fontWeight: '700', marginBottom: '14px' }}>
                {enrollSuccessMsg}
              </div>
            )}

            {enrollErrorMsg && (
              <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.4)', color: '#FB7185', fontSize: '0.8rem', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={15} />
                <span>{enrollErrorMsg}</span>
              </div>
            )}

            {isLoadingBrowse ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading course catalog...</div>
            ) : (() => {
              const filteredList = browseCoursesList.filter((crs) => {
                if (selectedCategoryFilter === 'ALL') return true;
                const filterLower = selectedCategoryFilter.toLowerCase();
                const matchCat = ((crs as any).categoryCode || (typeof crs.category === 'string' ? crs.category : (crs.category as any)?.code))?.toLowerCase() === filterLower;
                const matchSub = (crs as any).subCategory?.toLowerCase()?.includes(filterLower) ||
                                 crs.title?.toLowerCase()?.includes(filterLower) ||
                                 crs.description?.toLowerCase()?.includes(filterLower) ||
                                 (crs as any).boardOrGrade?.toLowerCase()?.includes(filterLower) ||
                                 (crs as any).subjectName?.toLowerCase()?.includes(filterLower);
                return matchCat || matchSub;
              });

              if (filteredList.length === 0) {
                return (
                  <div style={{ padding: '36px 20px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', border: '1px dashed var(--border-color)' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📚</div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: '800', margin: '0 0 6px 0' }}>
                      No direct batches found for "{selectedCategoryTitle}"
                    </h4>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: '0 0 16px 0', maxWidth: '480px', marginInline: 'auto' }}>
                      Upcoming live online batches are being scheduled for this track. You can view all available batches or explore other categories.
                    </p>
                    <button
                      className="btn-primary"
                      onClick={() => {
                        setSelectedCategoryFilter('ALL');
                        setSelectedCategoryTitle('All Platform Courses');
                      }}
                      style={{ fontSize: '0.82rem', padding: '8px 18px' }}
                    >
                      View All Available Batches
                    </button>
                  </div>
                );
              }

              return (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                  {filteredList.map((crs) => {
                    const isEnrolled = enrolledCourses.some((e) => e._id === crs._id);

                    return (
                      <div
                        key={crs._id}
                        style={{
                          padding: '16px',
                          borderRadius: '12px',
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid var(--border-color)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '12px'
                        }}
                      >
                        <div>
                          {crs.thumbnail && (
                            <img src={crs.thumbnail} alt="Banner" style={{ width: '100%', height: '120px', borderRadius: '8px', objectFit: 'cover', marginBottom: '10px' }} />
                          )}
                          <div style={{ display: 'flex', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
                            <span className="badge badge-primary" style={{ padding: '2px 6px', fontSize: '0.7rem' }}>{crs.boardOrGrade || 'General Batch'}</span>
                            <span className="badge badge-rose" style={{ padding: '2px 6px', fontSize: '0.7rem' }}>🎯 {crs.subjectName || 'All Subjects'}</span>
                            <span className="badge badge-amber" style={{ padding: '2px 6px', fontSize: '0.7rem' }}>State: {crs.stateCode}</span>
                          </div>
                          <h4 style={{ fontSize: '1rem', fontWeight: '800', margin: '4px 0' }}>{crs.title}</h4>
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 10px 0', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {crs.description}
                          </p>
                          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                            Educator: <strong>{crs.instructor?.name || 'Prof. Educator'}</strong>
                          </div>
                        </div>

                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#34D399' }}>₹{crs.price}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through', marginLeft: '6px' }}>₹{crs.originalPrice}</span>
                          </div>

                          {isEnrolled ? (
                            <span className="badge badge-emerald" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>✅ ALREADY ENROLLED</span>
                          ) : (
                            <button
                              className="btn-primary"
                              onClick={() => handleEnrollSubmit(crs)}
                              disabled={enrollingCourseId === crs._id}
                              style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                            >
                              {enrollingCourseId === crs._id ? 'Enrolling...' : '1-Click Enroll'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* SUB-TAB: WALLET & CREDITS */}
      {activeTab === 'WALLET' && (
        <div className="glass-card" style={{ padding: '24px 28px', borderRadius: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span className="badge badge-emerald" style={{ fontSize: '0.72rem', padding: '3px 8px', fontWeight: '800' }}>STUDENT WALLET & CREDITS</span>
              <h3 style={{ fontSize: '1.35rem', fontWeight: '800', marginTop: '6px', color: 'var(--text-primary)' }}>
                EduVerse Student Wallet & E-Books Access
              </h3>
            </div>
            <button
              className="btn-emerald"
              onClick={() => { setShowTopUpModal(true); setTopUpErrorMsg(''); }}
              style={{ padding: '8px 16px', fontSize: '0.85rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <PlusCircle size={15} /> Add Money (Top-Up)
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div style={{ padding: '20px', borderRadius: '14px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.08) 100%)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <div style={{ fontSize: '0.78rem', color: '#34D399', fontWeight: '800', letterSpacing: '0.5px' }}>
                CURRENT WALLET BALANCE
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: '900', color: 'var(--text-primary)', margin: '8px 0' }}>
                ₹ {stats ? (stats.walletBalance || 0).toLocaleString('en-IN') : '0'}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Instantly usable for 1-Click Course Enrollments, E-Books & Mock Test papers.
              </p>
            </div>

            <div style={{ padding: '20px', borderRadius: '14px', background: 'rgba(99, 102, 241, 0.06)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' }}>
                ✨ Wallet Perks & Advantages
              </div>
              <ul style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, paddingLeft: '18px', lineHeight: 1.7 }}>
                <li>Zero transaction fees on all internal enrollments</li>
                <li>Instant course activation with zero bank wait times</li>
                <li>Matching bonus cashback automatically credited here</li>
              </ul>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-primary" onClick={() => setActiveTab('BROWSE')} style={{ padding: '8px 16px', fontSize: '0.84rem' }}>
              <ShoppingBag size={14} /> Browse Courses to Enroll
            </button>
            <button className="btn-secondary" onClick={() => setActiveTab('MLM_NETWORK')} style={{ padding: '8px 16px', fontSize: '0.84rem' }}>
              <Share2 size={14} /> Check Referral Cashback (₹25k)
            </button>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: LIVE PRACTICE QUIZ */}
      {activeTab === 'QUIZ' && (
        <div className="glass-card" style={{ padding: '24px 28px', borderRadius: '18px', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span className="badge badge-amber" style={{ fontSize: '0.72rem', padding: '3px 8px', fontWeight: '800' }}>INTERACTIVE PRACTICE QUIZ</span>
              <h3 style={{ fontSize: '1.35rem', fontWeight: '800', marginTop: '6px', color: 'var(--text-primary)' }}>
                Live MCQ Test & Self-Assessment
              </h3>
            </div>
            <button className="btn-secondary" onClick={loadMcqs} style={{ fontSize: '0.8rem', padding: '8px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RefreshCw size={14} className={isLoadingMcqs ? 'animate-spin' : ''} /> Reload Quiz Data
            </button>
          </div>

          {/* Quiz Sets Selection Bar */}
          {quizSetsList.length > 0 && (
            <div style={{ marginBottom: '22px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-secondary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                📁 Select Test Paper / Quiz Set ({quizSetsList.length} Available)
              </div>
              <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
                {quizSetsList.map((setObj) => {
                  const isSelected = setObj.quizSetId === selectedQuizSetId;
                  return (
                    <button
                      key={setObj.quizSetId}
                      type="button"
                      onClick={() => handleSelectQuizSet(setObj)}
                      style={{
                        padding: '12px 18px',
                        borderRadius: '12px',
                        border: isSelected ? '2px solid #F59E0B' : '1px solid var(--border-color)',
                        background: isSelected
                          ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.1) 100%)'
                          : 'rgba(255, 255, 255, 0.02)',
                        color: 'var(--text-primary)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        minWidth: '220px',
                        flexShrink: 0,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontWeight: '800', fontSize: '0.9rem', color: isSelected ? '#FBBF24' : 'var(--text-primary)' }}>
                          {setObj.quizSetTitle}
                        </span>
                        {setObj.hasAttempted ? (
                          <span className="badge badge-emerald" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                            🔒 COMPLETED
                          </span>
                        ) : (
                          <span className="badge badge-amber" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                            ✍️ AVAILABLE
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        {setObj.count} Questions • {setObj.courseTitle || 'Batch Test'}
                      </div>
                      {setObj.hasAttempted && setObj.lastAttempt && (
                        <div style={{ fontSize: '0.74rem', color: setObj.lastAttempt.passed ? '#34D399' : '#FB7185', fontWeight: '800', marginTop: '4px' }}>
                          Score: {setObj.lastAttempt.score}/{setObj.lastAttempt.totalMarks} ({setObj.lastAttempt.percentage}%)
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {quizResult ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Grand Scorecard Banner */}
              <div
                style={{
                  padding: '24px 28px',
                  borderRadius: '16px',
                  background: quizResult.passed
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.18) 0%, rgba(5, 150, 105, 0.08) 100%)'
                    : 'linear-gradient(135deg, rgba(244, 63, 94, 0.18) 0%, rgba(225, 29, 72, 0.08) 100%)',
                  border: quizResult.passed
                    ? '1px solid rgba(16, 185, 129, 0.4)'
                    : '1px solid rgba(244, 63, 94, 0.4)',
                  boxShadow: quizResult.passed
                    ? '0 10px 30px rgba(16, 185, 129, 0.12)'
                    : '0 10px 30px rgba(244, 63, 94, 0.12)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                  <div>
                    <div style={{ fontSize: '0.82rem', color: quizResult.passed ? '#34D399' : '#FB7185', fontWeight: '800', letterSpacing: '0.8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Lock size={15} /> OFFICIAL PERMANENT TEST SCORECARD
                    </div>
                    <div style={{ fontSize: '2.2rem', fontWeight: '900', color: 'var(--text-primary)', margin: '6px 0 2px 0', letterSpacing: '-0.5px' }}>
                      Score: {quizResult.score} / {quizResult.totalMarks} <span style={{ fontSize: '1.4rem', color: quizResult.passed ? '#34D399' : '#FB7185' }}>({quizResult.percentage}%)</span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      Submitted At: <strong>{quizResult.createdAt ? new Date(quizResult.createdAt).toLocaleString('en-IN') : 'Official Record'}</strong> • Permanently Recorded in Student Profile
                    </div>
                  </div>
                  <span className={`badge ${quizResult.passed ? 'badge-emerald' : 'badge-rose'}`} style={{ fontSize: '1rem', padding: '8px 18px', fontWeight: '900', borderRadius: '10px' }}>
                    {quizResult.passed ? '🎉 PASSED' : '⚠️ NEEDS IMPROVEMENT'}
                  </span>
                </div>

                <div style={{ paddingTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.12)', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={16} style={{ color: '#34D399', flexShrink: 0 }} />
                  <span>Official Test Record Submitted. You have already completed this practice assessment test. Your score is permanently saved in your profile and visible to your course instructor. Retakes are not permitted.</span>
                </div>
              </div>

              {/* Questions Review in Locked Mode */}
              {mcqList.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: '800', marginBottom: '14px', color: 'var(--text-primary)' }}>
                    Assessment Questions Review (Locked)
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {mcqList.map((mcq, idx) => (
                      <div key={mcq._id} style={{ padding: '16px 20px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)' }}>
                        <div style={{ fontWeight: '700', fontSize: '0.92rem', marginBottom: '12px', color: 'var(--text-primary)' }}>
                          Q{idx + 1}. {mcq.questionText}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {mcq.options?.map((opt, optIdx) => (
                            <div
                              key={optIdx}
                              style={{
                                padding: '10px 14px',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color)',
                                background: 'rgba(255, 255, 255, 0.02)',
                                color: 'var(--text-muted)',
                                fontSize: '0.85rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                opacity: 0.85
                              }}
                            >
                              <span style={{ fontWeight: '700' }}>{String.fromCharCode(65 + optIdx)})</span>
                              <span>{opt}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {quizErrorMsg && (
                <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.4)', color: '#FB7185', fontSize: '0.85rem', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} />
                  <span>{quizErrorMsg}</span>
                </div>
              )}

              {isLoadingMcqs ? (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading quiz questions...</div>
              ) : mcqList.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
                  No MCQ practice questions published for your enrolled courses right now.
                </div>
              ) : (
                <form onSubmit={handleQuizSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {mcqList.map((mcq, idx) => (
                    <div key={mcq._id} style={{ padding: '18px 22px', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontWeight: '800', fontSize: '0.98rem', marginBottom: '14px', color: 'var(--text-primary)' }}>
                        Q{idx + 1}. {mcq.questionText}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {mcq.options?.map((opt, optIdx) => {
                          const isSelected = selectedAnswers[mcq._id] === optIdx;

                          return (
                            <label
                              key={optIdx}
                              onClick={() => handleSelectQuizOption(mcq._id, optIdx)}
                              style={{
                                padding: '10px 16px',
                                borderRadius: '10px',
                                border: isSelected ? '1px solid #818CF8' : '1px solid var(--border-color)',
                                background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                                color: isSelected ? '#818CF8' : 'var(--text-primary)',
                                fontSize: '0.88rem',
                                fontWeight: isSelected ? '700' : 'normal',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <input
                                type="radio"
                                name={`question_${mcq._id}`}
                                checked={isSelected}
                                onChange={() => { }}
                              />
                              <span>{String.fromCharCode(65 + optIdx)}) {opt}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={isSubmittingQuiz}
                    style={{ padding: '12px 24px', fontSize: '0.92rem', fontWeight: '800', borderRadius: '10px', width: 'fit-content' }}
                  >
                    {isSubmittingQuiz ? 'Evaluating Answers...' : 'Submit Quiz Answers'}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      )}

      {/* SUB-TAB 4: SUBMIT DUAL KYC DOCUMENT SCANS (AADHAAR & PAN TOGETHER) */}
      {activeTab === 'KYC' && (
        <div className="glass-card" style={{ padding: '24px 28px', borderRadius: '18px', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ marginBottom: '18px' }}>
            <span className="badge badge-emerald" style={{ fontSize: '0.72rem', padding: '3px 8px' }}>
              STUDENT IDENTITY VERIFICATION ENGINE
            </span>
            <h3 style={{ fontSize: '1.35rem', fontWeight: '800', margin: '4px 0 2px 0' }}>
              Submit Aadhaar & PAN Card Document Scans
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
              Upload both government documents together in a single step for 1-click Admin verification approval.
            </p>
          </div>

          {stats?.kycStatus === 'REJECTED' && (
            <div style={{ padding: '14px 16px', borderRadius: '12px', background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.4)', color: '#FB7185', marginBottom: '18px' }}>
              <div style={{ fontWeight: '800', fontSize: '0.9rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={18} /> ❌ Your Previous KYC Verification Was Rejected by Super Admin
              </div>
              <div style={{ fontSize: '0.84rem', color: '#FFF', fontWeight: '700', background: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '8px', borderLeft: '4px solid #FB7185', marginTop: '6px' }}>
                Rejection Reason: "{stats?.kycRejectionReason || 'Aadhaar / PAN document image scan details did not match government database.'}"
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                💡 Please correct the issue noted above and upload clean HD scans of your Aadhaar and PAN cards below to re-submit for approval.
              </div>
            </div>
          )}

          {kycSuccessMsg && (
            <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', color: '#34D399', fontSize: '0.86rem', fontWeight: '700', marginBottom: '16px' }}>
              {kycSuccessMsg}
            </div>
          )}

          {kycErrorMsg && (
            <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.4)', color: '#FB7185', fontSize: '0.84rem', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={16} />
              <span>{kycErrorMsg}</span>
            </div>
          )}

          <form onSubmit={handleKycSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>

              {/* CARD 1: AADHAAR CARD DETAILS */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontWeight: '800', fontSize: '0.95rem', color: '#34D399' }}>
                  <span>🪪 1. Government Aadhaar Card (12-Digit)</span>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                    Aadhaar ID Number *
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={aadhaarNumInput}
                    onChange={(e) => setAadhaarNumInput(e.target.value)}
                    placeholder="e.g. 9900 1234 5678"
                    style={{ padding: '8px 12px', fontSize: '0.85rem', width: '100%' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
                      Upload Aadhaar Card HD Image Scan *
                    </label>
                    <span className="badge badge-amber" style={{ fontSize: '0.65rem', padding: '1px 5px' }}>MAX: 2MB</span>
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleAadhaarFileChange}
                    className="form-input"
                    style={{ padding: '6px 10px', fontSize: '0.8rem', width: '100%' }}
                  />

                  {aadhaarPreview && (
                    <div style={{ marginTop: '10px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', height: '110px', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={aadhaarPreview} alt="Aadhaar Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                  )}
                </div>
              </div>

              {/* CARD 2: PAN CARD DETAILS */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontWeight: '800', fontSize: '0.95rem', color: '#818CF8' }}>
                  <span>💳 2. PAN Card (10-Digit Alpha-Numeric)</span>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                    PAN Card Number *
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={panNumInput}
                    onChange={(e) => setPanNumInput(e.target.value)}
                    placeholder="e.g. ABCDE1234F"
                    style={{ padding: '8px 12px', fontSize: '0.85rem', width: '100%' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
                      Upload PAN Card HD Image Scan *
                    </label>
                    <span className="badge badge-amber" style={{ fontSize: '0.65rem', padding: '1px 5px' }}>MAX: 2MB</span>
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handlePanFileChange}
                    className="form-input"
                    style={{ padding: '6px 10px', fontSize: '0.8rem', width: '100%' }}
                  />

                  {panPreview && (
                    <div style={{ marginTop: '10px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', height: '110px', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={panPreview} alt="PAN Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                  )}
                </div>
              </div>

            </div>

            <button
              type="submit"
              className="btn-emerald"
              disabled={isSubmittingKyc}
              style={{ padding: '12px 22px', fontSize: '0.92rem', fontWeight: '800', width: 'fit-content' }}
            >
              {isSubmittingKyc ? 'Uploading Documents...' : '🚀 Submit Both Aadhaar & PAN Scans for Verification'}
            </button>
          </form>
        </div>
      )}

      {/* WALLET TOP-UP MODAL */}
      {showTopUpModal && (
        <div className="modal-overlay" onClick={() => setShowTopUpModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', padding: '20px 24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <span className="badge badge-emerald" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>STUDENT WALLET RECHARGE</span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginTop: '2px' }}>
                  Top-Up Student Wallet
                </h3>
              </div>
              <button onClick={() => setShowTopUpModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            {topUpSuccessMsg && (
              <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', color: '#34D399', fontSize: '0.84rem', fontWeight: '700', marginBottom: '14px' }}>
                {topUpSuccessMsg}
              </div>
            )}

            {topUpErrorMsg && (
              <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.4)', color: '#FB7185', fontSize: '0.8rem', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={15} />
                <span>{topUpErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleTopUpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                  Select Preset Amount or Enter Custom Amount (₹) *
                </label>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                  {['500', '1000', '2500', '5000'].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTopUpAmountInput(amt)}
                      className={topUpAmountInput === amt ? 'btn-emerald' : 'btn-secondary'}
                      style={{ flex: 1, padding: '6px', fontSize: '0.78rem' }}
                    >
                      +₹{amt}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  className="form-input"
                  value={topUpAmountInput}
                  onChange={(e) => setTopUpAmountInput(e.target.value)}
                  placeholder="2500"
                  style={{ padding: '8px 12px', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowTopUpModal(false)} style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-emerald" disabled={isSubmittingTopUp} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                  {isSubmittingTopUp ? 'Recharging...' : 'Confirm Top-Up'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COURSE DETAILS INSPECTION MODAL */}
      {selectedCourseDetail && (
        <div className="modal-overlay" onClick={() => setSelectedCourseDetail(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', padding: '20px 24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <span className="badge badge-primary" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>CLASSROOM BATCH INSPECTOR</span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginTop: '2px' }}>
                  {selectedCourseDetail.title}
                </h3>
              </div>
              <button onClick={() => setSelectedCourseDetail(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            {selectedCourseDetail.thumbnail && (
              <div style={{ marginBottom: '12px', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                <img src={selectedCourseDetail.thumbnail} alt="Course Banner" style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
              </div>
            )}

            {/* Live Interactive Classroom & Video Vault Banner */}
            <div style={{ background: 'rgba(16,185,129,0.06)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(16,185,129,0.2)', marginBottom: '16px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#34D399', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Radio size={16} className="animate-pulse" /> Live Classroom & Lecture Access
              </div>

              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: '1.4' }}>
                {selectedCourseDetail.description || 'Interactive live sessions with top faculty, doubt resolution & lecture recordings.'}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.78rem', marginBottom: '14px', background: 'var(--bg-surface)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div><strong>Delivery Mode:</strong> <span className="badge badge-emerald" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>{selectedCourseDetail.courseMode || 'LIVE_ONLINE'}</span></div>
                <div><strong>State Target:</strong> {selectedCourseDetail.stateCode || 'GLOBAL'}</div>
                <div><strong>Grade / Board:</strong> {selectedCourseDetail.boardOrGrade || 'General Batch'}</div>
                <div><strong>Educator:</strong> <strong style={{ color: '#F59E0B' }}>{selectedCourseDetail.instructor?.name || 'Prof. Educator'}</strong></div>
              </div>

              {/* Action Buttons inside View Details */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <a
                  href={selectedCourseDetail.liveMeetingUrl || 'https://meet.google.com/eduverse-live-class'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-emerald"
                  style={{ padding: '8px 16px', fontSize: '0.82rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: '800', borderRadius: '10px' }}
                >
                  <Radio size={16} className="animate-pulse" /> 🔴 Join Live Class Now
                </a>

                <a
                  href={selectedCourseDetail.lectureVideoUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                  style={{ padding: '8px 16px', fontSize: '0.82rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', borderRadius: '10px' }}
                >
                  <Video size={16} /> 📹 Watch Recorded Lectures
                </a>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button className="btn-secondary" onClick={() => setSelectedCourseDetail(null)} style={{ padding: '7px 12px', fontSize: '0.8rem' }}>
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6-Level Student Goal Preference Modal */}
      <StudentPreferenceModal
        isOpen={showPreferenceModal}
        onClose={() => setShowPreferenceModal(false)}
        onSaved={handlePreferenceSaved}
        initialStateCode={currentUserObj?.learningPreference?.stateCode || 'GLOBAL'}
        initialCategoryCode={currentUserObj?.learningPreference?.categoryCode || 'SCHOOL_K12'}
        initialSubCategory={currentUserObj?.learningPreference?.subCategory || ''}
      />

      {/* ACTIVE VIDEO AD POPUP MODAL */}
      {activeVideoAdModal && (
        <div className="modal-overlay" onClick={() => setActiveVideoAdModal(null)} style={{ zIndex: 10080 }}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '680px', padding: '20px', borderRadius: '18px', background: '#0B1120' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-rose" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                  SPONSORED VIDEO
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: '#FFF' }}>
                  {activeVideoAdModal.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveVideoAdModal(null)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={22} />
              </button>
            </div>

            <div style={{ borderRadius: '12px', overflow: 'hidden', background: '#020617', textAlign: 'center', maxHeight: '380px' }}>
              <video
                src={activeVideoAdModal.mediaUrl}
                controls
                autoPlay
                style={{ width: '100%', maxHeight: '380px' }}
              />
            </div>

            {activeVideoAdModal.description && (
              <p style={{ marginTop: '12px', fontSize: '0.84rem', color: '#CBD5E1', lineHeight: 1.5 }}>
                {activeVideoAdModal.description}
              </p>
            )}

            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #1E293B' }}>
              <div>
                {activeVideoAdModal.targetUrl && (
                  <a
                    href={activeVideoAdModal.targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                    style={{
                      padding: '8px 16px',
                      fontSize: '0.82rem',
                      fontWeight: '800',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                      border: 'none',
                      color: '#FFF'
                    }}
                  >
                    Visit Offer Page <ExternalLink size={14} />
                  </a>
                )}
              </div>
              <button
                className="btn-secondary"
                onClick={() => setActiveVideoAdModal(null)}
                style={{ padding: '7px 16px', fontSize: '0.82rem' }}
              >
                Close Video
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
