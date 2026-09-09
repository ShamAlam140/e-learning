import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  Image,
  Linking,
  Alert,
  Share,
  Clipboard,
} from 'react-native';
import { launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { useAuth } from '../context/AuthContext';
import {
  fetchStudentDashboardStats,
  fetchMyEnrolledCourses,
  fetchBrowseCourses,
  enrollCourse,
  topUpStudentWallet,
  fetchPracticeMcqs,
  submitStudentQuiz,
  submitStudentKyc,
  fetchEbooks,
  purchaseEbook,
  fetchAffiliateStats,
  updateLegPreference,
  fetchBinaryTree,
  StudentStats,
  CourseRecord,
  McqRecord,
  QuizAttemptResult,
  EbookRecord,
} from '../services/studentService';

const DEFAULT_COURSE_BANNER = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800';

const MobileTreeNodeItem: React.FC<{
  node?: any | null;
  positionLabel: string;
  depth: number;
  maxDepth: number;
  displayRootId?: string;
  onNodeClick: (node: any) => void;
  isDarkMode: boolean;
  colors: any;
}> = ({ node, positionLabel, depth, maxDepth, displayRootId, onNodeClick, isDarkMode, colors }) => {
  if (!node || node.userId === 'VACANT') {
    return (
      <View
        style={{
          borderWidth: 1,
          borderStyle: 'dashed',
          borderColor: colors.cardBorder,
          borderRadius: 8,
          paddingHorizontal: 8,
          paddingVertical: 6,
          alignItems: 'center',
          minWidth: 100,
          backgroundColor: isDarkMode ? 'rgba(255,255,255,0.02)' : '#F8FAFC',
        }}
      >
        <Text style={{ fontSize: 9, color: colors.textMuted, fontWeight: '600' }}>
          Empty Spot ({positionLabel})
        </Text>
      </View>
    );
  }

  const isFocused = displayRootId && (node.id === displayRootId || node.userId === displayRootId);
  const hasChildren = Boolean(node.leftLeg || node.rightLeg);

  return (
    <View style={{ alignItems: 'center' }}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onNodeClick(node)}
        style={{
          paddingHorizontal: 10,
          paddingVertical: 8,
          borderRadius: 12,
          borderWidth: isFocused ? 2 : 1,
          borderColor: isFocused ? '#6366F1' : (depth === 1 ? '#818CF8' : colors.cardBorder),
          backgroundColor: isFocused
            ? (isDarkMode ? 'rgba(99,102,241,0.35)' : 'rgba(99,102,241,0.18)')
            : (depth === 1 ? (isDarkMode ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.08)') : colors.itemSubCard),
          alignItems: 'center',
          minWidth: 120,
          shadowColor: isFocused ? '#6366F1' : '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isFocused ? 0.3 : 0.05,
          shadowRadius: 4,
          elevation: isFocused ? 4 : 1,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 }}>
          <View style={{ backgroundColor: '#10B981', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 }}>
            <Text style={{ color: '#FFFFFF', fontSize: 9, fontWeight: '800' }}>
              {node.rank || 'BRONZE'}
            </Text>
          </View>
          {hasChildren && (
            <Text style={{ fontSize: 9, color: '#6366F1', fontWeight: '800' }}>
              🔍 Zoom
            </Text>
          )}
        </View>

        <Text style={{ color: colors.textPrimary, fontSize: 12, fontWeight: '800' }}>
          {node.name || node.user?.name || node.userId}
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: 9, marginTop: 1, fontFamily: 'monospace' }}>
          ID: {node.userId}
        </Text>
        <View style={{ flexDirection: 'row', gap: 4, marginTop: 4 }}>
          <Text style={{ color: '#10B981', fontSize: 9, fontWeight: '700' }}>
            L: {node.leftVolume || node.carriedLeftPV || 0} PV
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 9 }}>•</Text>
          <Text style={{ color: '#6366F1', fontSize: 9, fontWeight: '700' }}>
            R: {node.rightVolume || node.carriedRightPV || 0} PV
          </Text>
        </View>
      </TouchableOpacity>

      {depth < maxDepth && (node.leftLeg || node.rightLeg) && (
        <View style={{ alignItems: 'center', width: '100%', marginTop: 4 }}>
          <View style={{ width: 2, height: 12, backgroundColor: '#6366F1' }} />
          <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center' }}>
            <MobileTreeNodeItem
              node={node.leftLeg}
              positionLabel="L"
              depth={depth + 1}
              maxDepth={maxDepth}
              displayRootId={displayRootId}
              onNodeClick={onNodeClick}
              isDarkMode={isDarkMode}
              colors={colors}
            />
            <MobileTreeNodeItem
              node={node.rightLeg}
              positionLabel="R"
              depth={depth + 1}
              maxDepth={maxDepth}
              displayRootId={displayRootId}
              onNodeClick={onNodeClick}
              isDarkMode={isDarkMode}
              colors={colors}
            />
          </View>
        </View>
      )}
    </View>
  );
};

export const StudentHomeScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'MY_CLASSES' | 'BROWSE' | 'QUIZ' | 'WALLET' | 'KYC' | 'MLM_NETWORK'>('MY_CLASSES');

  // DUAL THEME SYSTEM: Default Light Mode (false)
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Dynamic Theme Colors
  const colors = {
    bgCanvas: isDarkMode ? '#0F172A' : '#F8FAFC',
    cardBg: isDarkMode ? '#1E293B' : '#FFFFFF',
    cardBorder: isDarkMode ? 'rgba(148, 163, 184, 0.15)' : '#E2E8F0',
    textPrimary: isDarkMode ? '#FFFFFF' : '#0F172A',
    textSecondary: isDarkMode ? '#94A3B8' : '#475569',
    textMuted: isDarkMode ? '#64748B' : '#64748B',
    inputBg: isDarkMode ? '#0F172A' : '#F1F5F9',
    itemSubCard: isDarkMode ? 'rgba(15, 23, 42, 0.6)' : '#F8FAFC',
  };

  // Dashboard Data State
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<CourseRecord[]>([]);
  const [browseCoursesList, setBrowseCoursesList] = useState<CourseRecord[]>([]);
  const [mcqList, setMcqList] = useState<McqRecord[]>([]);
  const [ebookList, setEbookList] = useState<EbookRecord[]>([]);

  // Selected Course Details Inspection Modal State
  const [selectedCourseDetail, setSelectedCourseDetail] = useState<CourseRecord | null>(null);

  // System Broadcast Announcement State
  const [systemAnnouncement, setSystemAnnouncement] = useState('🎉 Special Cashback offer on NEET & K12 Master Pass! Enroll today!');

  // Loading States
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isLoadingEnrolled, setIsLoadingEnrolled] = useState(false);
  const [isLoadingBrowse, setIsLoadingBrowse] = useState(false);
  const [isLoadingMcqs, setIsLoadingMcqs] = useState(false);
  const [isLoadingEbooks, setIsLoadingEbooks] = useState(false);

  // Course Enrollment State
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);
  const [enrollMsg, setEnrollMsg] = useState('');

  // Wallet Top-Up Modal State
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('2500');
  const [isSubmittingTopUp, setIsSubmittingTopUp] = useState(false);
  const [topUpMsg, setTopUpMsg] = useState('');

  // Interactive MCQ Quiz State
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizResult, setQuizResult] = useState<QuizAttemptResult | null>(null);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);
  const [quizMsg, setQuizMsg] = useState('');

  // KYC Document Form State with Image File Upload Picker
  const [docType, setDocType] = useState<'AADHAAR' | 'PAN'>('AADHAAR');
  const [docNumber, setDocNumber] = useState('');
  const [kycImageUri, setKycImageUri] = useState<string | null>(null);
  const [kycFileName, setKycFileName] = useState<string>('');
  const [isSubmittingKyc, setIsSubmittingKyc] = useState(false);
  const [kycMsg, setKycMsg] = useState('');

  // Ebook Purchase State
  const [purchasingEbookId, setPurchasingEbookId] = useState<string | null>(null);
  const [ebookMsg, setEbookMsg] = useState('');

  // MLM Affiliate Network State
  const [mlmStats, setMlmStats] = useState<any | null>(null);
  const [isUpdatingLeg, setIsUpdatingLeg] = useState(false);
  const [mlmMsg, setMlmMsg] = useState('');
  const [binaryTree, setBinaryTree] = useState<any | null>(null);
  const [focusedNode, setFocusedNode] = useState<any | null>(null);
  const [isLoadingTree, setIsLoadingTree] = useState<boolean>(false);

  // Loaders
  const loadDashboardStats = async () => {
    setIsLoadingStats(true);
    const res = await fetchStudentDashboardStats();
    if (res.success && res.data) {
      setStats(res.data.stats);
    }
    setIsLoadingStats(false);
  };

  const loadMlmStats = async () => {
    const res = await fetchAffiliateStats();
    if (res.success && res.data) {
      setMlmStats(res.data.stats);
    }
  };

  const loadBinaryTreeData = async () => {
    setIsLoadingTree(true);
    const res = await fetchBinaryTree();
    if (res.success && res.data) {
      setBinaryTree(res.data.tree || null);
    }
    setIsLoadingTree(false);
  };

  const handleLegPlacementChange = async (leg: 'AUTO' | 'LEFT' | 'RIGHT') => {
    setMlmMsg('');
    setIsUpdatingLeg(true);
    const res = await updateLegPreference(leg);
    setIsUpdatingLeg(false);
    if (res.success) {
      setMlmMsg(`✅ Leg preference updated to ${leg}`);
      loadMlmStats();
      loadBinaryTreeData();
    } else {
      setMlmMsg(`⛔ ${res.message || 'Failed to update leg'}`);
    }
  };

  const getMobileShareUrl = () => {
    const code = mlmStats?.referralCode || user?.referralCode || user?.userId || 'REF-STUDENT';
    return `https://e-learning-ashy-iota.vercel.app/register?ref=${code}`;
  };

  const handleCopyMobileLink = () => {
    const link = getMobileShareUrl();
    Clipboard.setString(link);
    Alert.alert('Link Copied! 📋', `Referral link copied to clipboard:\n${link}`);
  };

  const handleShareMobileLink = async () => {
    const link = getMobileShareUrl();
    const message = `Hey! Join EduVerse E-Learning Platform for state-wise study courses & competitive exams! Register using my referral link:\n${link}`;
    try {
      await Share.share({
        message,
        url: link,
        title: 'EduVerse Referral Link',
      });
    } catch {
      // Fallback
    }
  };

  const loadEnrolled = async () => {
    setIsLoadingEnrolled(true);
    const res = await fetchMyEnrolledCourses();
    if (res.success && res.data) {
      setEnrolledCourses(res.data.courses || []);
    }
    setIsLoadingEnrolled(false);
  };

  // Course Filtering Preference Mode
  const [filterMode, setFilterMode] = useState<'GOAL_MATCH' | 'EXPLORE_ALL'>('GOAL_MATCH');

  const loadBrowse = async (overrideMode?: 'GOAL_MATCH' | 'EXPLORE_ALL') => {
    setIsLoadingBrowse(true);
    const targetMode = overrideMode || filterMode;
    const params = targetMode === 'EXPLORE_ALL' ? { showAll: true } : {};
    const res = await fetchBrowseCourses(params);
    if (res.success && res.data) {
      setBrowseCoursesList(res.data.courses || []);
    }
    setIsLoadingBrowse(false);
  };

  const loadMcqs = async () => {
    setIsLoadingMcqs(true);
    const res = await fetchPracticeMcqs();
    if (res.success && res.data) {
      setMcqList(res.data.mcqs || []);
    }
    setIsLoadingMcqs(false);
  };

  const loadEbooksData = async () => {
    setIsLoadingEbooks(true);
    const res = await fetchEbooks();
    if (res.success && res.data) {
      setEbookList(res.data.ebooks || []);
    }
    setIsLoadingEbooks(false);
  };

  useEffect(() => {
    loadDashboardStats();
    loadEnrolled();
    loadBrowse();
    loadMcqs();
    loadEbooksData();
    loadMlmStats();
    loadBinaryTreeData();
  }, []);

  // Handlers
  const handleEnrollCourse = async (course: CourseRecord) => {
    setEnrollMsg('');
    setEnrollingCourseId(course._id);
    const res = await enrollCourse(course._id);
    setEnrollingCourseId(null);

    if (res.success && res.data) {
      setEnrollMsg(`🎉 Enrolled in ${course.title}! Check My Classroom tab.`);
      loadDashboardStats();
      loadEnrolled();
    } else {
      setEnrollMsg(`⛔ ${res.message || 'Enrollment failed.'}`);
    }
  };

  const handleTopUpSubmit = async () => {
    setTopUpMsg('');
    const amt = Number(topUpAmount);
    if (isNaN(amt) || amt <= 0) {
      setTopUpMsg('Please enter a valid amount.');
      return;
    }

    setIsSubmittingTopUp(true);
    const res = await topUpStudentWallet(amt);
    setIsSubmittingTopUp(false);

    if (res.success) {
      setTopUpMsg(`🎉 Wallet recharged with ₹${amt.toLocaleString('en-IN')}!`);
      loadDashboardStats();
      setTimeout(() => {
        setShowTopUpModal(false);
        setTopUpMsg('');
      }, 1200);
    } else {
      setTopUpMsg(`⛔ ${res.message || 'Top-up failed.'}`);
    }
  };

  const handleSelectQuizOption = (questionId: string, optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleQuizSubmit = async () => {
    setQuizMsg('');
    setQuizResult(null);

    const answersPayload = Object.entries(selectedAnswers).map(([questionId, selectedOptionIndex]) => ({
      questionId,
      selectedOptionIndex,
    }));

    if (answersPayload.length === 0) {
      setQuizMsg('Select at least 1 answer before submitting.');
      return;
    }

    setIsSubmittingQuiz(true);
    const res = await submitStudentQuiz(answersPayload);
    setIsSubmittingQuiz(false);

    if (res.success && res.data) {
      setQuizResult(res.data.attempt);
      loadDashboardStats();
    } else {
      setQuizMsg(`⛔ ${res.message || 'Failed to submit quiz.'}`);
    }
  };

  // KYC Image Picker Launch
  const handlePickKycImage = async () => {
    setKycMsg('');
    try {
      const response: ImagePickerResponse = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
      });

      if (response.didCancel) return;
      if (response.errorCode) {
        setKycMsg(`⛔ Image Picker Error: ${response.errorMessage || 'Failed to select image'}`);
        return;
      }

      if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        if (asset.fileSize && asset.fileSize > 2 * 1024 * 1024) {
          setKycMsg('⛔ Document image size must not exceed 2MB! Please select a smaller photo.');
          return;
        }
        if (asset.uri) {
          setKycImageUri(asset.uri);
          setKycFileName(asset.fileName || 'kyc_document.jpg');
        }
      }
    } catch (err: any) {
      setKycMsg(`⛔ Error launching gallery: ${err.message || 'Failed'}`);
    }
  };

  // KYC Submit Handler
  const handleKycSubmit = async () => {
    setKycMsg('');
    const cleanDocNum = docNumber.replace(/\s+/g, '').toUpperCase();

    if (!cleanDocNum) {
      setKycMsg('⛔ Please enter your Government Document ID Number.');
      return;
    }

    if (docType === 'AADHAAR') {
      const aadhaarRegex = /^\d{12}$/;
      if (!aadhaarRegex.test(cleanDocNum)) {
        setKycMsg('⛔ Invalid Aadhaar Card Number! Must be exactly 12 numeric digits (e.g. 9900 1234 5678).');
        return;
      }
    } else if (docType === 'PAN') {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(cleanDocNum)) {
        setKycMsg('⛔ Invalid PAN Card Number! Format must be 5 Letters + 4 Digits + 1 Letter (e.g. ABCDE1234F).');
        return;
      }
    }

    setIsSubmittingKyc(true);
    const res = await submitStudentKyc(
      docType,
      cleanDocNum,
      kycImageUri ? { uri: kycImageUri, name: kycFileName, type: 'image/jpeg' } : null
    );
    setIsSubmittingKyc(false);

    if (res.success) {
      setKycMsg('✅ Document scan submitted successfully! Pending Admin verification.');
      loadDashboardStats();
    } else {
      setKycMsg(`⛔ ${res.message || 'Failed to submit KYC.'}`);
    }
  };

  const handlePurchaseEbook = async (ebookId: string) => {
    setEbookMsg('');
    setPurchasingEbookId(ebookId);
    const res = await purchaseEbook(ebookId);
    setPurchasingEbookId(null);

    if (res.success) {
      setEbookMsg('🎉 E-Book purchased successfully! Full PDF unlocked.');
      loadDashboardStats();
      loadEbooksData();
    } else {
      setEbookMsg(`⛔ ${res.message || 'Purchase failed.'}`);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bgCanvas }} contentContainerStyle={{ padding: 16 }}>
      {/* TOP BRANDING, PROFILE & THEME TOGGLE HEADER */}
      <View
        style={{
          backgroundColor: colors.cardBg,
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: colors.cardBorder,
          marginBottom: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <View style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                <Text style={{ color: '#6366F1', fontSize: 10, fontWeight: '700' }}>🎓 STUDENT PORTAL</Text>
              </View>
              <Text style={{ color: '#F59E0B', fontSize: 10, fontWeight: '700' }}>
                ID: {user?.userId || 'EDU-STUDENT'}
              </Text>
            </View>
            <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '800' }}>
              Welcome, {user?.name || 'Student Learner'}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>
              Access Live Batches, Quiz Practice & Wallet
            </Text>
          </View>

          {/* DUAL THEME TOGGLE BUTTON */}
          <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => setIsDarkMode(!isDarkMode)}
              style={{
                backgroundColor: isDarkMode ? '#334155' : '#E2E8F0',
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 20,
              }}
            >
              <Text style={{ color: isDarkMode ? '#FBBF24' : '#0F172A', fontSize: 11, fontWeight: '700' }}>
                {isDarkMode ? '🌙 Dark' : '☀️ Light'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={logout}
              style={{ backgroundColor: 'rgba(244, 63, 94, 0.15)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }}
            >
              <Text style={{ color: '#F43F5E', fontSize: 11, fontWeight: '700' }}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Bar */}
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          <TouchableOpacity
            onPress={() => setShowTopUpModal(true)}
            style={{ flex: 1, backgroundColor: '#10B981', paddingVertical: 8, borderRadius: 8, alignItems: 'center' }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>+ Top-Up Wallet</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              loadDashboardStats();
              loadEnrolled();
              loadBrowse();
              loadMcqs();
            }}
            style={{ backgroundColor: isDarkMode ? '#334155' : '#E2E8F0', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, alignItems: 'center' }}
          >
            <Text style={{ color: colors.textPrimary, fontSize: 12, fontWeight: '700' }}>Refresh</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* GLOBAL SYSTEM ANNOUNCEMENT BROADCAST BANNER */}
      {!!systemAnnouncement && (
        <View style={{ backgroundColor: 'rgba(244, 63, 94, 0.12)', borderWidth: 1, borderColor: 'rgba(244, 63, 94, 0.3)', borderRadius: 12, padding: 12, marginBottom: 16 }}>
          <Text style={{ color: '#F43F5E', fontSize: 11, fontWeight: '800' }}>📢 OFFICIAL ADMIN ANNOUNCEMENT:</Text>
          <Text style={{ color: colors.textPrimary, fontSize: 12, marginTop: 3, fontWeight: '600', lineHeight: 16 }}>{systemAnnouncement}</Text>
        </View>
      )}

      {/* DYNAMIC METRIC CARDS GRID */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
        <View style={{ flex: 1, minWidth: 140, backgroundColor: isDarkMode ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.08)', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(99, 102, 241, 0.3)' }}>
          <Text style={{ color: '#6366F1', fontSize: 10, fontWeight: '700' }}>ENROLLED BATCHES</Text>
          <Text style={{ color: colors.textPrimary, fontSize: 20, fontWeight: '800', marginTop: 4 }}>
            {enrolledCourses.length > 0 ? enrolledCourses.length : (stats ? stats.enrolledCoursesCount : 0)} Courses
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 10, marginTop: 2 }}>Live & Recorded Classes</Text>
        </View>

        <View style={{ flex: 1, minWidth: 140, backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.08)', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.3)' }}>
          <Text style={{ color: '#10B981', fontSize: 10, fontWeight: '700' }}>WALLET BALANCE</Text>
          <Text style={{ color: colors.textPrimary, fontSize: 20, fontWeight: '800', marginTop: 4 }}>
            ₹ {stats ? (stats.walletBalance || 0).toLocaleString('en-IN') : '0'}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 10, marginTop: 2 }}>1-Click Enroll Credits</Text>
        </View>

        <View style={{ flex: 1, minWidth: 140, backgroundColor: isDarkMode ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.08)', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.3)' }}>
          <Text style={{ color: '#D97706', fontSize: 10, fontWeight: '700' }}>QUIZZES COMPLETED</Text>
          <Text style={{ color: colors.textPrimary, fontSize: 20, fontWeight: '800', marginTop: 4 }}>
            {stats ? stats.quizAttemptsCount : 0} Tests
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 10, marginTop: 2 }}>Self-Assessment Score</Text>
        </View>

        <View style={{ flex: 1, minWidth: 140, backgroundColor: isDarkMode ? 'rgba(168, 85, 247, 0.15)' : 'rgba(168, 85, 247, 0.08)', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(168, 85, 247, 0.3)' }}>
          <Text style={{ color: '#8B5CF6', fontSize: 10, fontWeight: '700' }}>KYC STATUS</Text>
          <View style={{ marginTop: 6 }}>
            <Text
              style={{
                color:
                  stats?.kycStatus === 'APPROVED' || stats?.kycStatus === 'VERIFIED'
                    ? '#10B981'
                    : stats?.kycStatus === 'PENDING'
                    ? '#D97706'
                    : '#F43F5E',
                fontSize: 13,
                fontWeight: '800',
              }}
            >
              {stats?.kycStatus || 'NOT_SUBMITTED'}
            </Text>
          </View>
          <Text style={{ color: colors.textSecondary, fontSize: 10, marginTop: 2 }}>Aadhaar / PAN Verification</Text>
        </View>
      </View>

      {/* NAVIGATION TAB STRIP */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', gap: 6, backgroundColor: colors.cardBg, padding: 4, borderRadius: 12, borderWidth: 1, borderColor: colors.cardBorder }}>
          <TouchableOpacity
            onPress={() => setActiveTab('MY_CLASSES')}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor: activeTab === 'MY_CLASSES' ? '#6366F1' : 'transparent',
            }}
          >
            <Text style={{ color: activeTab === 'MY_CLASSES' ? '#FFFFFF' : colors.textSecondary, fontWeight: '700', fontSize: 12 }}>
              My Classroom ({enrolledCourses.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('BROWSE')}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor: activeTab === 'BROWSE' ? '#06B6D4' : 'transparent',
            }}
          >
            <Text style={{ color: activeTab === 'BROWSE' ? '#FFFFFF' : colors.textSecondary, fontWeight: '700', fontSize: 12 }}>
              Browse Catalog ({browseCoursesList.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('QUIZ')}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor: activeTab === 'QUIZ' ? '#F59E0B' : 'transparent',
            }}
          >
            <Text style={{ color: activeTab === 'QUIZ' ? '#FFFFFF' : colors.textSecondary, fontWeight: '700', fontSize: 12 }}>
              Practice Quiz ({mcqList.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('WALLET')}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor: activeTab === 'WALLET' ? '#10B981' : 'transparent',
            }}
          >
            <Text style={{ color: activeTab === 'WALLET' ? '#FFFFFF' : colors.textSecondary, fontWeight: '700', fontSize: 12 }}>
              Wallet & E-Books ({ebookList.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('KYC')}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor: activeTab === 'KYC' ? '#8B5CF6' : 'transparent',
            }}
          >
            <Text style={{ color: activeTab === 'KYC' ? '#FFFFFF' : colors.textSecondary, fontWeight: '700', fontSize: 12 }}>KYC Verification</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('MLM_NETWORK')}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor: activeTab === 'MLM_NETWORK' ? '#F59E0B' : 'transparent',
            }}
          >
            <Text style={{ color: activeTab === 'MLM_NETWORK' ? '#FFFFFF' : colors.textSecondary, fontWeight: '700', fontSize: 12 }}>🤝 MLM Referrals</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* SUB-TAB: MLM BINARY REFERRAL NETWORK */}
      {activeTab === 'MLM_NETWORK' && (
        <View style={{ backgroundColor: colors.cardBg, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.cardBorder }}>
          <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '800', marginBottom: 4 }}>
            🤝 Binary MLM Referral Partner Suite
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 14 }}>
            Share your referral link to build your binary team network & earn matching bonuses.
          </Text>

          {!!mlmMsg && (
            <View style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: 10, borderRadius: 8, marginBottom: 12 }}>
              <Text style={{ color: '#10B981', fontSize: 12, fontWeight: '600' }}>{mlmMsg}</Text>
            </View>
          )}

          {/* Referral Code & Action Share Suite */}
          <View style={{ backgroundColor: colors.itemSubCard, borderRadius: 14, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: colors.cardBorder }}>
            <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '800', letterSpacing: 0.5 }}>MY UNIQUE REFERRAL CODE</Text>
            <Text style={{ color: '#F59E0B', fontSize: 22, fontWeight: '900', marginTop: 4, letterSpacing: 1 }}>
              {mlmStats?.referralCode || user?.referralCode || user?.userId || 'REF-STUDENT'}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 4, marginBottom: 12 }}>
              Share Link: {getMobileShareUrl()}
            </Text>

            {/* 1-Click Mobile Share Actions */}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                onPress={handleCopyMobileLink}
                style={{
                  flex: 1,
                  backgroundColor: '#6366F1',
                  borderRadius: 10,
                  paddingVertical: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 13 }}>
                  📋 Copy Link
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleShareMobileLink}
                style={{
                  flex: 1,
                  backgroundColor: '#10B981',
                  borderRadius: 10,
                  paddingVertical: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 13 }}>
                  📲 Share Link
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Leg Placement Preference Control */}
          <View style={{ backgroundColor: colors.itemSubCard, borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: colors.cardBorder }}>
            <Text style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '800', marginBottom: 8 }}>
              Downline Placement Leg Preference:
            </Text>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <TouchableOpacity
                onPress={() => handleLegPlacementChange('AUTO')}
                disabled={isUpdatingLeg}
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  borderRadius: 8,
                  backgroundColor: (mlmStats?.placementPreference || 'AUTO') === 'AUTO' ? '#6366F1' : colors.cardBg,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: colors.cardBorder,
                }}
              >
                <Text style={{ color: (mlmStats?.placementPreference || 'AUTO') === 'AUTO' ? '#FFF' : colors.textSecondary, fontSize: 11, fontWeight: '700' }}>
                  ⚖️ Auto
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleLegPlacementChange('LEFT')}
                disabled={isUpdatingLeg}
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  borderRadius: 8,
                  backgroundColor: mlmStats?.placementPreference === 'LEFT' ? '#10B981' : colors.cardBg,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: colors.cardBorder,
                }}
              >
                <Text style={{ color: mlmStats?.placementPreference === 'LEFT' ? '#FFF' : colors.textSecondary, fontSize: 11, fontWeight: '700' }}>
                  👈 Left Leg
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleLegPlacementChange('RIGHT')}
                disabled={isUpdatingLeg}
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  borderRadius: 8,
                  backgroundColor: mlmStats?.placementPreference === 'RIGHT' ? '#8B5CF6' : colors.cardBg,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: colors.cardBorder,
                }}
              >
                <Text style={{ color: mlmStats?.placementPreference === 'RIGHT' ? '#FFF' : colors.textSecondary, fontSize: 11, fontWeight: '700' }}>
                  👉 Right Leg
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Network Volume Stats & Carry Forward Grid */}
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
            <View style={{ flex: 1, backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.3)' }}>
              <Text style={{ color: '#10B981', fontSize: 10, fontWeight: '800' }}>CARRIED LEFT PV</Text>
              <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: '900', marginTop: 2 }}>{mlmStats?.carriedLeftPV !== undefined ? mlmStats.carriedLeftPV : (mlmStats?.leftVolume || 0)} PV</Text>
              <Text style={{ color: colors.textMuted, fontSize: 9 }}>Total: {mlmStats?.leftVolume || 0} PV</Text>
            </View>

            <View style={{ flex: 1, backgroundColor: 'rgba(99, 102, 241, 0.1)', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(99, 102, 241, 0.3)' }}>
              <Text style={{ color: '#6366F1', fontSize: 10, fontWeight: '800' }}>CARRIED RIGHT PV</Text>
              <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: '900', marginTop: 2 }}>{mlmStats?.carriedRightPV !== undefined ? mlmStats.carriedRightPV : (mlmStats?.rightVolume || 0)} PV</Text>
              <Text style={{ color: colors.textMuted, fontSize: 9 }}>Total: {mlmStats?.rightVolume || 0} PV</Text>
            </View>
          </View>

          {/* Pair Matching & Net Payout Breakdown Card */}
          <View style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.3)' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <Text style={{ color: '#D97706', fontSize: 11, fontWeight: '800' }}>NET RECEIVABLE BINARY PAYOUT</Text>
              <Text style={{ color: '#10B981', fontSize: 16, fontWeight: '900' }}>₹{mlmStats?.netPayableBonus !== undefined ? mlmStats.netPayableBonus : (mlmStats?.estimatedMatchingBonus || 0)}</Text>
            </View>

            <Text style={{ color: colors.textSecondary, fontSize: 10, lineHeight: 14 }}>
              • 1:1 Matched Pairs: <Text style={{ color: '#F59E0B', fontWeight: '700' }}>{mlmStats?.matchedPV || 0} PV</Text> (Gross: ₹{mlmStats?.grossMatchingBonus || 0}){'\n'}
              • Daily Capping Guard: <Text style={{ color: '#10B981', fontWeight: '700' }}>₹25,000 / day</Text>{'\n'}
              • Deductions (10%): <Text style={{ color: '#EF4444', fontWeight: '700' }}>-₹{(mlmStats?.adminFee || 0) + (mlmStats?.tdsDeduction || 0)}</Text> (5% Admin + 5% TDS)
            </Text>
          </View>

          {/* Interactive Binary Tree Visualizer Section */}
          <View style={{ backgroundColor: colors.itemSubCard, borderRadius: 14, padding: 14, marginTop: 14, borderWidth: 1, borderColor: colors.cardBorder }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '800' }}>
                  🌳 Downline Tree & Leg Structure
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                  Tap any node to drill down into its personal downline tree
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {focusedNode && (
                  <TouchableOpacity
                    onPress={() => setFocusedNode(null)}
                    style={{ backgroundColor: '#F59E0B', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8 }}
                  >
                    <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '800' }}>
                      ↺ Reset Root
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={loadBinaryTreeData}
                  style={{ backgroundColor: colors.cardBg, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: colors.cardBorder }}
                >
                  <Text style={{ color: colors.textPrimary, fontSize: 11, fontWeight: '700' }}>
                    🔄 Reload
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {focusedNode && (
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: isDarkMode ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.12)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, marginBottom: 10 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#6366F1', flex: 1 }}>
                  🔍 Focused on: {focusedNode.name || focusedNode.userId} (ID: {focusedNode.userId})
                </Text>
                <TouchableOpacity
                  onPress={() => setFocusedNode(null)}
                  style={{ backgroundColor: colors.cardBg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: colors.cardBorder }}
                >
                  <Text style={{ color: colors.textPrimary, fontSize: 10, fontWeight: '700' }}>
                    Show Top Root
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {isLoadingTree ? (
              <ActivityIndicator color="#6366F1" style={{ marginVertical: 20 }} />
            ) : binaryTree ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={{ paddingVertical: 10, alignItems: 'center', minWidth: '100%' }}>
                <MobileTreeNodeItem
                  node={focusedNode || binaryTree}
                  positionLabel="ROOT"
                  depth={1}
                  maxDepth={3}
                  displayRootId={(focusedNode || binaryTree)?.id || (focusedNode || binaryTree)?.userId}
                  onNodeClick={(clickedNode) => {
                    if (clickedNode && clickedNode.userId !== 'VACANT') {
                      setFocusedNode(clickedNode);
                    }
                  }}
                  isDarkMode={isDarkMode}
                  colors={colors}
                />
              </ScrollView>
            ) : (
              <View style={{ padding: 16, alignItems: 'center' }}>
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                  No downline members joined yet. Share your referral link to build your binary team!
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* SUB-TAB 1: MY CLASSROOM */}
      {activeTab === 'MY_CLASSES' && (
        <View style={{ backgroundColor: colors.cardBg, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.cardBorder }}>
          <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '800', marginBottom: 12 }}>
            My Enrolled Classroom Batches ({enrolledCourses.length})
          </Text>

          {isLoadingEnrolled ? (
            <ActivityIndicator color="#6366F1" style={{ marginVertical: 20 }} />
          ) : enrolledCourses.length === 0 ? (
            <View style={{ alignItems: 'center', padding: 20 }}>
              <Text style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 12 }}>
                You have not enrolled in any course batches yet.
              </Text>
              <TouchableOpacity
                onPress={() => setActiveTab('BROWSE')}
                style={{ backgroundColor: '#6366F1', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 }}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>Browse Available Courses</Text>
              </TouchableOpacity>
            </View>
          ) : (
            enrolledCourses.map((crs) => (
              <View
                key={crs._id}
                style={{
                  backgroundColor: colors.itemSubCard,
                  borderRadius: 12,
                  padding: 14,
                  borderLeftWidth: 4,
                  borderLeftColor: '#6366F1',
                  marginBottom: 14,
                  borderWidth: 1,
                  borderColor: colors.cardBorder,
                }}
              >
                {/* COURSE THUMBNAIL BANNER */}
                <Image
                  source={{ uri: crs.thumbnail || DEFAULT_COURSE_BANNER }}
                  style={{ width: '100%', height: 130, borderRadius: 10, marginBottom: 10 }}
                  resizeMode="cover"
                />

                <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: '800' }}>{crs.title}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>
                  Educator: {crs.instructor?.name || 'Prof. Educator'} • State: {crs.stateCode}
                </Text>

                <View style={{ flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                  {(crs.courseMode === 'LIVE_ONLINE' || crs.courseMode === 'HYBRID' || crs.liveMeetingUrl || !crs.lectureVideoUrl) && (
                    <TouchableOpacity
                      onPress={() => Linking.openURL(crs.liveMeetingUrl || 'https://meet.google.com/eduverse-live-class')}
                      style={{ backgroundColor: '#10B981', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 }}
                    >
                      <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '800' }}>🔴 Join Live Class</Text>
                    </TouchableOpacity>
                  )}

                  {(crs.courseMode === 'RECORDED_VIDEO' || crs.lectureVideoUrl || crs.courseMode === 'HYBRID') && (
                    <TouchableOpacity
                      onPress={() => Linking.openURL(crs.lectureVideoUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')}
                      style={{ backgroundColor: '#6366F1', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 }}
                    >
                      <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>📹 Watch Video</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    onPress={() => setSelectedCourseDetail(crs)}
                    style={{ backgroundColor: isDarkMode ? '#334155' : '#E2E8F0', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 }}
                  >
                    <Text style={{ color: colors.textPrimary, fontSize: 11, fontWeight: '700' }}>👁️ Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      )}

      {/* SUB-TAB 2: BROWSE COURSES DIRECTORY */}
      {activeTab === 'BROWSE' && (
        <View style={{ backgroundColor: colors.cardBg, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.cardBorder }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '800' }}>
              Platform Courses ({browseCoursesList.length})
            </Text>

            {/* Filter Toggle Buttons */}
            <View style={{ flexDirection: 'row', gap: 4, backgroundColor: isDarkMode ? '#1E293B' : '#E2E8F0', padding: 3, borderRadius: 8 }}>
              <TouchableOpacity
                onPress={() => {
                  setFilterMode('GOAL_MATCH');
                  loadBrowse('GOAL_MATCH');
                }}
                style={{
                  backgroundColor: filterMode === 'GOAL_MATCH' ? '#10B981' : 'transparent',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 6,
                }}
              >
                <Text style={{ color: filterMode === 'GOAL_MATCH' ? '#FFF' : colors.textSecondary, fontSize: 10, fontWeight: '700' }}>
                  🎯 My Goal Match
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setFilterMode('EXPLORE_ALL');
                  loadBrowse('EXPLORE_ALL');
                }}
                style={{
                  backgroundColor: filterMode === 'EXPLORE_ALL' ? '#6366F1' : 'transparent',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 6,
                }}
              >
                <Text style={{ color: filterMode === 'EXPLORE_ALL' ? '#FFF' : colors.textSecondary, fontSize: 10, fontWeight: '700' }}>
                  🌐 Explore All
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {user?.learningPreference?.isPreferenceSet && filterMode === 'GOAL_MATCH' && (
            <View style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: 8, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.3)' }}>
              <Text style={{ color: '#10B981', fontSize: 11, fontWeight: '700' }}>
                🎯 Filtered for Goal: {user.learningPreference.subCategoryTitle || user.learningPreference.subCategory || 'Saved Target'} ({user.learningPreference.stateCode || 'GLOBAL'})
              </Text>
            </View>
          )}

          {!!enrollMsg && (
            <View style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: 10, borderRadius: 8, marginBottom: 12 }}>
              <Text style={{ color: '#10B981', fontSize: 12, fontWeight: '600' }}>{enrollMsg}</Text>
            </View>
          )}

          {isLoadingBrowse ? (
            <ActivityIndicator color="#06B6D4" style={{ marginVertical: 20 }} />
          ) : (
            browseCoursesList.map((crs) => {
              const isEnrolled = enrolledCourses.some((e) => e._id === crs._id);
              return (
                <View
                  key={crs._id}
                  style={{
                    backgroundColor: colors.itemSubCard,
                    borderRadius: 12,
                    padding: 14,
                    marginBottom: 14,
                    borderWidth: 1,
                    borderColor: colors.cardBorder,
                  }}
                >
                  {/* COURSE THUMBNAIL BANNER */}
                  <Image
                    source={{ uri: crs.thumbnail || DEFAULT_COURSE_BANNER }}
                    style={{ width: '100%', height: 130, borderRadius: 10, marginBottom: 10 }}
                    resizeMode="cover"
                  />

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
                    <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
                      <Text style={{ color: '#06B6D4', fontSize: 11, fontWeight: '700' }}>State: {crs.stateCode}</Text>
                      <Text style={{ color: '#F43F5E', fontSize: 10, fontWeight: '700', backgroundColor: 'rgba(244, 63, 94, 0.15)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                        🎯 {(crs as any).subjectName || 'All Subjects'}
                      </Text>
                    </View>
                    <Text style={{ color: '#10B981', fontSize: 16, fontWeight: '800' }}>₹{crs.price}</Text>
                  </View>

                  <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: '800', marginTop: 4 }}>{crs.title}</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>{crs.description}</Text>

                  <View style={{ marginTop: 12, alignItems: 'flex-end' }}>
                    {isEnrolled ? (
                      <View style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 }}>
                        <Text style={{ color: '#10B981', fontSize: 11, fontWeight: '700' }}>✅ ALREADY ENROLLED</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={() => handleEnrollCourse(crs)}
                        disabled={enrollingCourseId === crs._id}
                        style={{ backgroundColor: '#6366F1', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 }}
                      >
                        {enrollingCourseId === crs._id ? (
                          <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                          <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>1-Click Enroll</Text>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>
      )}

      {/* SUB-TAB 3: LIVE PRACTICE QUIZ */}
      {activeTab === 'QUIZ' && (
        <View style={{ backgroundColor: colors.cardBg, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.cardBorder }}>
          <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '800', marginBottom: 4 }}>
            Interactive Practice Quiz Engine
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 12 }}>
            Test your knowledge with live MCQ questions
          </Text>

          {quizResult && (
            <View
              style={{
                backgroundColor: quizResult.passed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                borderRadius: 10,
                padding: 12,
                marginBottom: 14,
              }}
            >
              <Text style={{ color: quizResult.passed ? '#10B981' : '#F43F5E', fontWeight: '800', fontSize: 14 }}>
                Result: Score {quizResult.score}/{quizResult.totalMarks} ({quizResult.percentage}%) -{' '}
                {quizResult.passed ? 'PASSED 🎉' : 'NEEDS IMPROVEMENT ⚠️'}
              </Text>
            </View>
          )}

          {!!quizMsg && (
            <View style={{ backgroundColor: 'rgba(244, 63, 94, 0.15)', padding: 10, borderRadius: 8, marginBottom: 12 }}>
              <Text style={{ color: '#F43F5E', fontSize: 12, fontWeight: '600' }}>{quizMsg}</Text>
            </View>
          )}

          {isLoadingMcqs ? (
            <ActivityIndicator color="#F59E0B" style={{ marginVertical: 20 }} />
          ) : (
            mcqList.map((mcq, idx) => (
              <View
                key={mcq._id}
                style={{ backgroundColor: colors.itemSubCard, borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: colors.cardBorder }}
              >
                <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '700', marginBottom: 8 }}>
                  Q{idx + 1}. {mcq.questionText}
                </Text>

                {mcq.options?.map((opt, optIdx) => {
                  const isSelected = selectedAnswers[mcq._id] === optIdx;
                  return (
                    <TouchableOpacity
                      key={optIdx}
                      onPress={() => handleSelectQuizOption(mcq._id, optIdx)}
                      style={{
                        backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.15)' : colors.cardBg,
                        borderWidth: 1,
                        borderColor: isSelected ? '#6366F1' : colors.cardBorder,
                        borderRadius: 8,
                        padding: 10,
                        marginBottom: 6,
                      }}
                    >
                      <Text style={{ color: isSelected ? '#6366F1' : colors.textPrimary, fontSize: 13 }}>
                        {String.fromCharCode(65 + optIdx)}) {opt}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))
          )}

          {mcqList.length > 0 && (
            <TouchableOpacity
              onPress={handleQuizSubmit}
              disabled={isSubmittingQuiz}
              style={{ backgroundColor: '#F59E0B', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 8 }}
            >
              {isSubmittingQuiz ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 14 }}>Submit Quiz Answers</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* SUB-TAB 4: WALLET & E-BOOKS */}
      {activeTab === 'WALLET' && (
        <View style={{ backgroundColor: colors.cardBg, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.cardBorder }}>
          <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '800', marginBottom: 12 }}>
            Digital E-Book Store & Library ({ebookList.length})
          </Text>

          {!!ebookMsg && (
            <View style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: 10, borderRadius: 8, marginBottom: 12 }}>
              <Text style={{ color: '#10B981', fontSize: 12, fontWeight: '600' }}>{ebookMsg}</Text>
            </View>
          )}

          {isLoadingEbooks ? (
            <ActivityIndicator color="#10B981" style={{ marginVertical: 20 }} />
          ) : (
            ebookList.map((eb) => (
              <View
                key={eb._id}
                style={{
                  backgroundColor: colors.itemSubCard,
                  borderRadius: 12,
                  padding: 14,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: colors.cardBorder,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: '800' }}>{eb.title}</Text>
                  <Text style={{ color: '#10B981', fontSize: 15, fontWeight: '800' }}>₹{eb.price}</Text>
                </View>
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>Author: {eb.author}</Text>

                <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                  <TouchableOpacity
                    onPress={() => handlePurchaseEbook(eb._id)}
                    disabled={purchasingEbookId === eb._id}
                    style={{ backgroundColor: '#10B981', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 }}
                  >
                    <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>
                      {purchasingEbookId === eb._id ? 'Buying...' : 'Buy E-Book'}
                    </Text>
                  </TouchableOpacity>

                  {eb.fullPdfUrl && (
                    <TouchableOpacity
                      onPress={() => Linking.openURL(eb.fullPdfUrl!)}
                      style={{ backgroundColor: '#6366F1', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 }}
                    >
                      <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>📖 Open PDF</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      )}

      {/* SUB-TAB 5: KYC VERIFICATION WITH DOCUMENT SCAN IMAGE UPLOAD */}
      {activeTab === 'KYC' && (
        <View style={{ backgroundColor: colors.cardBg, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.cardBorder }}>
          <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '800', marginBottom: 4 }}>
            Submit Identity KYC Scan
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 14 }}>
            Government ID Verification (Aadhaar / PAN HD Document Scan)
          </Text>

          {!!kycMsg && (
            <View style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: 10, borderRadius: 8, marginBottom: 12 }}>
              <Text style={{ color: '#10B981', fontSize: 12, fontWeight: '600' }}>{kycMsg}</Text>
            </View>
          )}

          <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '700', marginBottom: 4 }}>Select Document Type *</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
            <TouchableOpacity
              onPress={() => setDocType('AADHAAR')}
              style={{
                flex: 1,
                padding: 10,
                borderRadius: 8,
                backgroundColor: docType === 'AADHAAR' ? '#8B5CF6' : colors.inputBg,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: docType === 'AADHAAR' ? '#FFFFFF' : colors.textPrimary, fontWeight: '700', fontSize: 12 }}>Aadhaar Card (12-Digit)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setDocType('PAN')}
              style={{
                flex: 1,
                padding: 10,
                borderRadius: 8,
                backgroundColor: docType === 'PAN' ? '#8B5CF6' : colors.inputBg,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: docType === 'PAN' ? '#FFFFFF' : colors.textPrimary, fontWeight: '700', fontSize: 12 }}>PAN Card (10-Digit)</Text>
            </TouchableOpacity>
          </View>

          <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '700', marginBottom: 4 }}>Document ID Number *</Text>
          <TextInput
            value={docNumber}
            onChangeText={setDocNumber}
            placeholder={docType === 'AADHAAR' ? 'e.g. 9900 1234 5678' : 'e.g. ABCDE1234F'}
            placeholderTextColor="#94A3B8"
            style={{
              backgroundColor: colors.inputBg,
              borderWidth: 1,
              borderColor: colors.cardBorder,
              borderRadius: 8,
              padding: 10,
              color: colors.textPrimary,
              fontSize: 14,
              marginBottom: 14,
            }}
          />

          {/* KYC DOCUMENT SCAN FILE PICKER FIELD */}
          <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '700', marginBottom: 4 }}>
            Upload Document HD Image Scan (Max 2MB) *
          </Text>

          <TouchableOpacity
            onPress={handlePickKycImage}
            style={{
              backgroundColor: colors.inputBg,
              borderWidth: 1,
              borderStyle: 'dashed',
              borderColor: colors.cardBorder,
              borderRadius: 10,
              padding: 14,
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <Text style={{ color: '#8B5CF6', fontWeight: '700', fontSize: 13 }}>
              📷 {kycImageUri ? 'Change Document Photo' : 'Pick Document Scan Photo from Phone Gallery'}
            </Text>
          </TouchableOpacity>

          {/* LIVE IMAGE PREVIEW CARD */}
          {!!kycImageUri && (
            <View style={{ marginBottom: 14, alignItems: 'center' }}>
              <Text style={{ color: colors.textSecondary, fontSize: 11, marginBottom: 6 }}>
                Scan Preview ({kycFileName || 'Selected Document'}):
              </Text>
              <View style={{ borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: colors.cardBorder, width: '100%', height: 150 }}>
                <Image source={{ uri: kycImageUri }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
              </View>
              <TouchableOpacity onPress={() => setKycImageUri(null)} style={{ marginTop: 6 }}>
                <Text style={{ color: '#F43F5E', fontSize: 11, fontWeight: '700' }}>Remove Scan Photo</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            onPress={handleKycSubmit}
            disabled={isSubmittingKyc}
            style={{ backgroundColor: '#8B5CF6', borderRadius: 10, paddingVertical: 12, alignItems: 'center' }}
          >
            {isSubmittingKyc ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 14 }}>Submit Document Scan</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* WALLET TOP-UP MODAL */}
      <Modal visible={showTopUpModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 }}>
          <View style={{ backgroundColor: colors.cardBg, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: colors.cardBorder }}>
            <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '800', marginBottom: 4 }}>
              Top-Up Student Wallet
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 14 }}>
              Enter amount to credit your student wallet balance
            </Text>

            {!!topUpMsg && (
              <View style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: 10, borderRadius: 8, marginBottom: 12 }}>
                <Text style={{ color: '#10B981', fontSize: 12, fontWeight: '600' }}>{topUpMsg}</Text>
              </View>
            )}

            <View style={{ flexDirection: 'row', gap: 6, marginBottom: 12 }}>
              {['500', '1000', '2500', '5000'].map((amt) => (
                <TouchableOpacity
                  key={amt}
                  onPress={() => setTopUpAmount(amt)}
                  style={{
                    flex: 1,
                    backgroundColor: topUpAmount === amt ? '#10B981' : colors.inputBg,
                    paddingVertical: 8,
                    borderRadius: 6,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: topUpAmount === amt ? '#FFFFFF' : colors.textPrimary, fontWeight: '700', fontSize: 12 }}>₹{amt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              value={topUpAmount}
              onChangeText={setTopUpAmount}
              keyboardType="number-pad"
              placeholder="Enter Custom Amount"
              placeholderTextColor="#94A3B8"
              style={{
                backgroundColor: colors.inputBg,
                borderWidth: 1,
                borderColor: colors.cardBorder,
                borderRadius: 8,
                padding: 10,
                color: colors.textPrimary,
                fontSize: 16,
                fontWeight: '700',
                marginBottom: 16,
              }}
            />

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                onPress={() => setShowTopUpModal(false)}
                style={{ flex: 1, backgroundColor: colors.inputBg, paddingVertical: 12, borderRadius: 10, alignItems: 'center' }}
              >
                <Text style={{ color: colors.textSecondary, fontWeight: '700', fontSize: 13 }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleTopUpSubmit}
                disabled={isSubmittingTopUp}
                style={{ flex: 1, backgroundColor: '#10B981', paddingVertical: 12, borderRadius: 10, alignItems: 'center' }}
              >
                {isSubmittingTopUp ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 13 }}>Confirm Top-Up</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* COURSE INSPECTION DETAILS MODAL */}
      <Modal visible={!!selectedCourseDetail} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.82)', justifyContent: 'center', padding: 20 }}>
          {selectedCourseDetail && (
            <View style={{ backgroundColor: colors.cardBg, borderRadius: 18, padding: 20, borderWidth: 1, borderColor: colors.cardBorder, maxHeight: '90%' }}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <View style={{ backgroundColor: 'rgba(16,185,129,0.15)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                    <Text style={{ color: '#10B981', fontSize: 10, fontWeight: '800' }}>COURSE BATCH SPECS</Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedCourseDetail(null)}>
                    <Text style={{ color: colors.textMuted, fontSize: 18, fontWeight: '800' }}>✕</Text>
                  </TouchableOpacity>
                </View>

                {selectedCourseDetail.thumbnail && (
                  <Image
                    source={{ uri: selectedCourseDetail.thumbnail }}
                    style={{ width: '100%', height: 140, borderRadius: 12, marginBottom: 12 }}
                    resizeMode="cover"
                  />
                )}

                <Text style={{ color: colors.textPrimary, fontSize: 17, fontWeight: '800', marginBottom: 6 }}>
                  {selectedCourseDetail.title}
                </Text>

                {/* Live Class & Video Access Banner */}
                <View style={{ backgroundColor: 'rgba(16,185,129,0.08)', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)', marginBottom: 14 }}>
                  <Text style={{ color: '#10B981', fontSize: 11, fontWeight: '800', marginBottom: 6 }}>
                    🔴 LIVE CLASSROOM & VIDEO VAULT
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 10, lineHeight: 16 }}>
                    {selectedCourseDetail.description || 'Interactive live sessions with top faculty & recorded lecture vault.'}
                  </Text>

                  <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                    <TouchableOpacity
                      onPress={() => Linking.openURL(selectedCourseDetail.liveMeetingUrl || 'https://meet.google.com/eduverse-live-class')}
                      style={{ backgroundColor: '#10B981', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, flex: 1, alignItems: 'center' }}
                    >
                      <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '800' }}>🔴 Join Live Class</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => Linking.openURL(selectedCourseDetail.lectureVideoUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')}
                      style={{ backgroundColor: '#6366F1', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, flex: 1, alignItems: 'center' }}
                    >
                      <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>📹 Recorded Videos</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Specs Grid */}
                <View style={{ backgroundColor: colors.itemSubCard, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: colors.cardBorder, marginBottom: 16 }}>
                  <Text style={{ color: colors.textSecondary, fontSize: 11, marginBottom: 4 }}>
                    <Text style={{ fontWeight: '700' }}>Price:</Text> ₹{selectedCourseDetail.price}
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 11, marginBottom: 4 }}>
                    <Text style={{ fontWeight: '700' }}>State Target:</Text> {selectedCourseDetail.stateCode || 'GLOBAL'}
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 11, marginBottom: 4 }}>
                    <Text style={{ fontWeight: '700' }}>Board / Grade:</Text> {selectedCourseDetail.boardOrGrade || 'General Batch'}
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                    <Text style={{ fontWeight: '700' }}>Educator Faculty:</Text> {selectedCourseDetail.instructor?.name || 'Prof. Educator'}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => setSelectedCourseDetail(null)}
                  style={{ backgroundColor: colors.inputBg, paddingVertical: 10, borderRadius: 10, alignItems: 'center' }}
                >
                  <Text style={{ color: colors.textPrimary, fontWeight: '800', fontSize: 13 }}>Close Details</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          )}
        </View>
      </Modal>
    </ScrollView>
  );
};
