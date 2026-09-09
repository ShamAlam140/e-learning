import React, { useState, useEffect } from 'react';
import { GraduationCap, BookOpen, ShoppingBag, HelpCircle, FileCheck, RefreshCw, Eye, X, AlertCircle, Video, Radio, PlusCircle, Target, Share2, Megaphone, Lock, CheckCircle } from 'lucide-react';
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

export const StudentPortal: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'MY_CLASSES' | 'BROWSE' | 'QUIZ' | 'KYC' | 'MLM_NETWORK'>('MY_CLASSES');

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
      {/* Compact Top Banner Header */}
      <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '16px', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <span className="badge badge-primary" style={{ padding: '2px 8px', fontSize: '0.72rem' }}>
                <GraduationCap size={12} /> STUDENT LEARNING PORTAL
              </span>
              <span className="badge badge-amber" style={{ padding: '2px 8px', fontSize: '0.72rem' }}>
                ID: {user?.userId || 'EDU-STUDENT'}
              </span>
            </div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: '800', margin: '2px 0', letterSpacing: '-0.3px' }}>
              Welcome, {user?.name || 'Student Learner'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: 0 }}>
              Personalized Course Catalog, Live Batches & MCQ Practice Tests.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button className="btn-emerald" onClick={() => setShowPreferenceModal(true)} style={{ padding: '6px 12px', fontSize: '0.78rem', fontWeight: '700' }}>
              <Target size={14} /> 🎯 Set / Change Goal
            </button>
            <button className="btn-emerald" onClick={() => { setShowTopUpModal(true); setTopUpErrorMsg(''); }} style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
              <PlusCircle size={14} /> Top-Up Wallet
            </button>
            <button className="btn-secondary" onClick={() => { loadStats(); loadEnrolled(); loadBrowse(); loadMcqs(); }} style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
              <RefreshCw size={14} className={isLoadingStats ? 'animate-spin' : ''} /> Refresh Data
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

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-color)', overflowX: 'auto' }}>
        <button
          onClick={() => setActiveTab('MY_CLASSES')}
          style={{
            flex: 1,
            padding: '8px 14px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'MY_CLASSES' ? 'var(--primary-gradient)' : 'transparent',
            color: activeTab === 'MY_CLASSES' ? '#FFF' : 'var(--text-secondary)',
            fontWeight: '700',
            fontSize: '0.82rem',
            cursor: 'pointer'
          }}
        >
          <BookOpen size={15} style={{ display: 'inline', marginRight: '6px' }} />
          My Classroom ({enrolledCourses.length})
        </button>

        <button
          onClick={() => setActiveTab('BROWSE')}
          style={{
            flex: 1,
            padding: '8px 14px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'BROWSE' ? 'var(--secondary-gradient)' : 'transparent',
            color: activeTab === 'BROWSE' ? '#FFF' : 'var(--text-secondary)',
            fontWeight: '700',
            fontSize: '0.82rem',
            cursor: 'pointer'
          }}
        >
          <ShoppingBag size={15} style={{ display: 'inline', marginRight: '6px' }} />
          Browse Course Directory ({browseCoursesList.length})
        </button>

        <button
          onClick={() => setActiveTab('QUIZ')}
          style={{
            flex: 1,
            padding: '8px 14px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'QUIZ' ? 'var(--amber-gradient)' : 'transparent',
            color: activeTab === 'QUIZ' ? '#FFF' : 'var(--text-secondary)',
            fontWeight: '700',
            fontSize: '0.82rem',
            cursor: 'pointer'
          }}
        >
          <HelpCircle size={15} style={{ display: 'inline', marginRight: '6px' }} />
          Live Practice Quiz {quizResult ? '(Completed)' : `(${mcqList.length})`}
        </button>

        <button
          onClick={() => setActiveTab('KYC')}
          style={{
            flex: 1,
            padding: '8px 14px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'KYC' ? 'var(--emerald-gradient)' : 'transparent',
            color: activeTab === 'KYC' ? '#FFF' : 'var(--text-secondary)',
            fontWeight: '700',
            fontSize: '0.82rem',
            cursor: 'pointer'
          }}
        >
          <FileCheck size={15} style={{ display: 'inline', marginRight: '6px' }} />
          Submit KYC Scan
        </button>

        <button
          onClick={() => setActiveTab('MLM_NETWORK')}
          style={{
            flex: 1,
            padding: '8px 14px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'MLM_NETWORK' ? 'var(--amber-gradient)' : 'transparent',
            color: activeTab === 'MLM_NETWORK' ? '#FFF' : '#FBBF24',
            fontWeight: '700',
            fontSize: '0.82rem',
            cursor: 'pointer'
          }}
        >
          <Share2 size={15} style={{ display: 'inline', marginRight: '6px' }} />
          🤝 MLM Network & Referrals
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

      {/* SUB-TAB 2: BROWSE PLATFORM COURSES */}
      {activeTab === 'BROWSE' && (
        <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800' }}>
              Available Platform Courses & Batches Directory ({browseCoursesList.length})
            </h3>
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {isLoadingBrowse ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading course catalog...</div>
            ) : browseCoursesList.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No published courses available.</div>
            ) : (
              browseCoursesList.map((crs) => {
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
              })
            )}
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
    </div>
  );
};
