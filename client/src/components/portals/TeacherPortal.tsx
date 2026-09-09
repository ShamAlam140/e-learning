import React, { useState, useEffect } from 'react';
import { GraduationCap, BookOpen, PlusCircle, DollarSign, HelpCircle, RefreshCw, Eye, X, AlertCircle, Award, Share2, Trash2, Edit3, UploadCloud, Download, FileSpreadsheet, CheckCircle2, Users, Phone, Mail, Megaphone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { INDIAN_STATES_LIST, CORE_MODULES_LIST, getSubCategoriesForModuleAndState, getSubjectsForStateAndModule } from '../../services/taxonomyTree';
import { AffiliateMlmPortal } from './AffiliateMlmPortal';
import {
  fetchTeacherStats,
  fetchTeacherCourses,
  fetchTeacherMcqs,
  fetchTeacherMcqAttempts,
  createTeacherCourse,
  bulkCreateTeacherCourses,
  updateTeacherCourse,
  deleteTeacherCourse,
  createTeacherMcq,
  requestTeacherPayout,
  fetchTeacherCourseStudents,
  TeacherStats,
  McqRecord,
  McqAttemptRecord
} from '../../services/teacherService';
import { CourseRecord } from '../../services/adminService';

export const TeacherPortal: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'MY_COURSES' | 'CREATE' | 'MCQ_BUILDER' | 'MCQ_AUDIT' | 'ROYALTY_PAYOUT' | 'MLM_NETWORK'>('MY_COURSES');

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

  // Stats & Courses State
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [coursesList, setCoursesList] = useState<CourseRecord[]>([]);
  const [mcqsList, setMcqsList] = useState<McqRecord[]>([]);
  const [attemptsList, setAttemptsList] = useState<McqAttemptRecord[]>([]);

  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [isLoadingMcqs, setIsLoadingMcqs] = useState(false);
  const [isLoadingAttempts, setIsLoadingAttempts] = useState(false);
  const [selectedCourseDetail, setSelectedCourseDetail] = useState<CourseRecord | null>(null);

  const [selectedTeacherCourseRoster, setSelectedTeacherCourseRoster] = useState<{
    course: any;
    totalEnrolled: number;
    totalRoyaltyEarned: number;
    enrolledStudents: any[];
  } | null>(null);
  const handleInspectTeacherCourseRoster = async (courseId: string) => {
    const res = await fetchTeacherCourseStudents(courseId);
    if (res.success && res.data) {
      setSelectedTeacherCourseRoster({
        course: res.data.course,
        totalEnrolled: res.data.course.totalEnrolled || res.data.enrolledStudents?.length || 0,
        totalRoyaltyEarned: res.data.course.totalRoyaltyEarned || 0,
        enrolledStudents: res.data.enrolledStudents || []
      });
    }
  };

  // Bulk Course Upload State
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [bulkFileName, setBulkFileName] = useState('');
  const [parsedBulkCourses, setParsedBulkCourses] = useState<Array<{
    title: string;
    price: number;
    originalPrice: number;
    stateCode: string;
    categoryCode: string;
    subCategory: string;
    boardOrGrade?: string;
    stream?: string;
    subjectName?: string;
    courseMode: 'LIVE_ONLINE' | 'RECORDED_VIDEO' | 'HYBRID';
    liveMeetingUrl?: string;
    lectureVideoUrl?: string;
    description?: string;
    validityDays?: number;
    thumbnail?: string;
    isValid: boolean;
    errors: string[];
  }>>([]);
  const [isSubmittingBulk, setIsSubmittingBulk] = useState(false);
  const [bulkUploadResult, setBulkUploadResult] = useState<{ successCount: number; failCount: number; errors: Array<{ row: number; error: string }> } | null>(null);
  const [bulkUploadError, setBulkUploadError] = useState('');

  // Helper CSV parser & sample downloader
  const parseCSVToCourseObjects = (csvText: string) => {
    const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length <= 1) return [];

    const parseCSVLine = (textLine: string): string[] => {
      const result: string[] = [];
      let startValueIdx = 0;
      let inQuotes = false;
      for (let idx = 0; idx < textLine.length; idx++) {
        const c = textLine[idx];
        if (c === '"') {
          inQuotes = !inQuotes;
        } else if (c === ',' && !inQuotes) {
          let val = textLine.substring(startValueIdx, idx).trim();
          if (val.startsWith('"') && val.endsWith('"')) {
            val = val.substring(1, val.length - 1).replace(/""/g, '"');
          }
          result.push(val);
          startValueIdx = idx + 1;
        }
      }
      let lastVal = textLine.substring(startValueIdx).trim();
      if (lastVal.startsWith('"') && lastVal.endsWith('"')) {
        lastVal = lastVal.substring(1, lastVal.length - 1).replace(/""/g, '"');
      }
      result.push(lastVal);
      return result;
    };

    const headers = parseCSVLine(lines[0]).map((h) => h.trim().toLowerCase());
    const rows: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length === 0 || values.every((v) => !v)) continue;

      const rowObj: Record<string, string> = {};
      headers.forEach((h, index) => {
        rowObj[h] = values[index] !== undefined ? values[index] : '';
      });

      const title = rowObj['title'] || rowObj['coursetitle'] || rowObj['course title'] || '';
      const price = Number(rowObj['price'] || rowObj['offerprice'] || rowObj['offer price'] || 0);
      const originalPrice = Number(rowObj['originalprice'] || rowObj['mrp'] || rowObj['original price'] || price);
      const stateCode = (rowObj['statecode'] || rowObj['state'] || 'GLOBAL').toUpperCase();
      const categoryCode = (rowObj['categorycode'] || rowObj['category'] || 'SCHOOL_K12').toUpperCase();
      const subCategory = rowObj['subcategory'] || rowObj['exam'] || rowObj['board'] || 'CLASS_10';
      const boardOrGrade = rowObj['boardorgrade'] || rowObj['subtitle'] || '';
      const stream = rowObj['stream'] || '';
      const subjectName = rowObj['subjectname'] || rowObj['subject'] || 'All Subjects';
      const courseModeStr = (rowObj['coursemode'] || rowObj['mode'] || 'RECORDED_VIDEO').toUpperCase();
      const courseMode = (['LIVE_ONLINE', 'RECORDED_VIDEO', 'HYBRID'].includes(courseModeStr) ? courseModeStr : 'RECORDED_VIDEO') as 'LIVE_ONLINE' | 'RECORDED_VIDEO' | 'HYBRID';
      const liveMeetingUrl = rowObj['livemeetingurl'] || rowObj['liveurl'] || rowObj['zoomurl'] || '';
      const lectureVideoUrl = rowObj['lecturevideourl'] || rowObj['videourl'] || rowObj['youtubeurl'] || '';
      const description = rowObj['description'] || '';
      const validityDays = Number(rowObj['validitydays'] || rowObj['validity'] || 365);
      const thumbnail = rowObj['thumbnail'] || rowObj['image'] || '';

      const rowErrors: string[] = [];
      if (!title.trim()) rowErrors.push('Title is missing.');
      if (isNaN(price) || price < 0) rowErrors.push('Price must be a valid number.');
      if (isNaN(originalPrice) || originalPrice < 0) rowErrors.push('Original Price must be a valid number.');

      rows.push({
        title,
        price,
        originalPrice,
        stateCode,
        categoryCode,
        subCategory,
        boardOrGrade,
        stream,
        subjectName,
        courseMode,
        liveMeetingUrl,
        lectureVideoUrl,
        description,
        validityDays,
        thumbnail,
        isValid: rowErrors.length === 0,
        errors: rowErrors
      });
    }

    return rows;
  };

  const handleDownloadSampleCsvTemplate = () => {
    const csvHeader = 'title,price,originalPrice,stateCode,categoryCode,subCategory,boardOrGrade,stream,subjectName,courseMode,liveMeetingUrl,lectureVideoUrl,description,validityDays,thumbnail\n';
    const sampleRow1 = '"CBSE Class 10th Science & Technology Full Course",1499,3999,"GLOBAL","SCHOOL_K12","CLASS_10","CBSE Class 10th","","Science","RECORDED_VIDEO","","https://www.youtube.com/watch?v=dQw4w9WgXcQ","Comprehensive Physics, Chemistry, and Biology NCERT modules with chapter tests.",365,"https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800"\n';
    const sampleRow2 = '"UP Board 12th Mathematics Board Exam Mastery",1999,4999,"UP","SCHOOL_K12","CLASS_12","UP Board Intermediate","Science Stream (Subjects 1–6)","Mathematics","LIVE_ONLINE","https://zoom.us/j/9900000000","","Live daily classes, model paper solutions, and formula revisions for Class 12 UP Board.",365,"https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=800"\n';
    const sampleRow3 = '"UPSSSC Lekhpal Complete Competitive Exam Batch",2499,5999,"UP","COMPETITIVE_EXAMS","UPSSSC_LEKHPAL","UPSSSC Lekhpal 2026 Batch","","General Knowledge","HYBRID","https://zoom.us/j/8800000000","https://www.youtube.com/watch?v=dQw4w9WgXcQ","Full syllabus coverage for UPSSSC Lekhpal including rural development, Math, and GK.",180,"https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=800"\n';
    const sampleRow4 = '"B.Tech Computer Science Core Engineering Series",3499,7999,"GLOBAL","UNDERGRADUATE_DEGREE","BTECH","B.Tech Computer Science","","Computer Applications","RECORDED_VIDEO","","https://www.youtube.com/watch?v=dQw4w9WgXcQ","Data Structures, Algorithms, DBMS, and Operating Systems for Engineering students.",730,"https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800"\n';
    const sampleRow5 = '"Spoken English & Professional Communication Masterclass",999,2999,"GLOBAL","LANGUAGE_COMMUNICATION","SPOKEN_ENGLISH","Professional Certification","","English Speaking","RECORDED_VIDEO","","https://www.youtube.com/watch?v=dQw4w9WgXcQ","Learn fluent English speaking, accent training, interview skills, and public speaking in 60 days.",365,"https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800"\n';

    const blob = new Blob([csvHeader + sampleRow1 + sampleRow2 + sampleRow3 + sampleRow4 + sampleRow5], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'courses_bulk_upload_sample_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBulkFileName(file.name);
    setBulkUploadError('');
    setBulkUploadResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseCSVToCourseObjects(text);
        setParsedBulkCourses(parsed);
        if (parsed.length === 0) {
          setBulkUploadError('No valid data rows found in the uploaded file. Please check file format.');
        }
      } catch (err: any) {
        setBulkUploadError('Failed to parse uploaded CSV file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteBulkUpload = async () => {
    const validCoursesToSubmit = parsedBulkCourses.filter((c) => c.isValid);
    if (validCoursesToSubmit.length === 0) {
      setBulkUploadError('No valid course rows to submit. Please check your uploaded file.');
      return;
    }

    setIsSubmittingBulk(true);
    setBulkUploadError('');
    setBulkUploadResult(null);

    try {
      const res = await bulkCreateTeacherCourses(validCoursesToSubmit);
      if (res.success && res.data) {
        setBulkUploadResult({
          successCount: res.data.createdCount,
          failCount: res.data.failedCount,
          errors: res.data.errors || []
        });
        loadCourses();
        loadStats();
      }
    } catch (err: any) {
      setBulkUploadError(err.message || 'Failed to execute bulk course upload.');
    } finally {
      setIsSubmittingBulk(false);
    }
  };

  // Edit Course State
  const [editingCourse, setEditingCourse] = useState<CourseRecord | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editErrorMsg, setEditErrorMsg] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrice, setEditPrice] = useState('1499');
  const [editOriginalPrice, setEditOriginalPrice] = useState('3999');
  const [editStateCode, setEditStateCode] = useState('GLOBAL');
  const [editCategoryCode, setEditCategoryCode] = useState('SCHOOL_K12');
  const [editSubCategory, setEditSubCategory] = useState('');
  const [editSubCategoryTitle, setEditSubCategoryTitle] = useState('');
  const [editStream, setEditStream] = useState('');
  const [editBoardGrade, setEditBoardGrade] = useState('');
  const [editSubjectName, setEditSubjectName] = useState('All Subjects (Complete Package)');
  const [editCourseMode, setEditCourseMode] = useState<'LIVE_ONLINE' | 'RECORDED_VIDEO' | 'HYBRID'>('LIVE_ONLINE');
  const [editLiveMeetingUrl, setEditLiveMeetingUrl] = useState('');
  const [editLectureVideoUrl, setEditLectureVideoUrl] = useState('');
  const [editThumbnail, setEditThumbnail] = useState('');

  // Create Course Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPrice, setNewPrice] = useState('1499');
  const [newOriginalPrice, setNewOriginalPrice] = useState('3999');
  const [newStateCode, setNewStateCode] = useState('GLOBAL');
  const [newCategoryCode, setNewCategoryCode] = useState('SCHOOL_K12');
  const [newSubCategory, setNewSubCategory] = useState('CBSE_BOARD');
  const [newStream, setNewStream] = useState('');
  const [newBoardGrade, setNewBoardGrade] = useState('CBSE Class 10');
  const [newSubjectName, setNewSubjectName] = useState('All Subjects (Complete Package)');
  const [newCourseMode, setNewCourseMode] = useState<'LIVE_ONLINE' | 'RECORDED_VIDEO' | 'HYBRID'>('LIVE_ONLINE');
  const [newLiveMeetingUrl, setNewLiveMeetingUrl] = useState('https://zoom.us/j/9900000000');
  const [newLectureVideoUrl, setNewLectureVideoUrl] = useState('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  const [newThumbnailUrl, setNewThumbnailUrl] = useState('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [createCourseError, setCreateCourseError] = useState('');
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [courseCreatedSuccess, setCourseCreatedSuccess] = useState(false);

  const [selectedMcqCourseId, setSelectedMcqCourseId] = useState<string>('');
  const [quizSetTitleInput, setQuizSetTitleInput] = useState<string>('Practice Test Set #1');
  const [mcqQuestionsList, setMcqQuestionsList] = useState<Array<{
    id: string;
    questionText: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctOptionIndex: number;
    explanation: string;
  }>>([
    {
      id: 'q-1',
      questionText: 'What is the SI unit of Magnetic Flux Density?',
      optionA: 'Weber',
      optionB: 'Tesla',
      optionC: 'Henry',
      optionD: 'Farad',
      correctOptionIndex: 1,
      explanation: 'The SI unit of magnetic flux density (B) is Tesla (T), named after Nikola Tesla.'
    }
  ]);
  const [mcqSavedSuccess, setMcqSavedSuccess] = useState(false);
  const [mcqSavedCount, setMcqSavedCount] = useState(0);
  const [mcqError, setMcqError] = useState('');
  const [isSavingMcq, setIsSavingMcq] = useState(false);

  const handleAddMcqQuestionItem = () => {
    setMcqQuestionsList((prev) => [
      ...prev,
      {
        id: `q-${Date.now()}-${prev.length + 1}`,
        questionText: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctOptionIndex: 0,
        explanation: ''
      }
    ]);
  };

  const handleRemoveMcqQuestionItem = (id: string) => {
    if (mcqQuestionsList.length <= 1) return;
    setMcqQuestionsList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateMcqQuestionItem = (index: number, field: string, value: any) => {
    setMcqQuestionsList((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Payout Request State
  const [payoutAmount, setPayoutAmount] = useState('50000');
  const [payoutSuccessMsg, setPayoutSuccessMsg] = useState('');
  const [payoutErrorMsg, setPayoutErrorMsg] = useState('');
  const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);

  // Load Teacher Stats
  const loadStats = async () => {
    setIsLoadingStats(true);
    const res = await fetchTeacherStats();
    if (res.success && res.data) {
      setStats(res.data.stats);
    }
    setIsLoadingStats(false);
  };

  // Load Teacher Courses
  const loadCourses = async () => {
    setIsLoadingCourses(true);
    const res = await fetchTeacherCourses();
    if (res.success && res.data) {
      setCoursesList(res.data.courses || []);
    }
    setIsLoadingCourses(false);
  };

  // Load MCQ Questions Bank
  const loadMcqs = async () => {
    setIsLoadingMcqs(true);
    const res = await fetchTeacherMcqs();
    if (res.success && res.data) {
      setMcqsList(res.data.mcqs || []);
    }
    setIsLoadingMcqs(false);
  };

  // Load Student Quiz Attempts
  const loadAttempts = async () => {
    setIsLoadingAttempts(true);
    const res = await fetchTeacherMcqAttempts();
    if (res.success && res.data) {
      setAttemptsList(res.data.attempts || []);
    }
    setIsLoadingAttempts(false);
  };

  useEffect(() => {
    loadStats();
    loadCourses();
    loadMcqs();
    loadAttempts();
  }, []);

  // Handle Thumbnail File Selection (2MB Validation Limit)
  const handleThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCreateCourseError('');
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // STRICT 2MB LIMIT CHECK
      if (file.size > 2 * 1024 * 1024) {
        setCreateCourseError('⛔ Thumbnail image size must not exceed 2MB! Please select a smaller file.');
        setThumbnailFile(null);
        setThumbnailPreview('');
        e.target.value = '';
        return;
      }

      setThumbnailFile(file);
      const previewUrl = URL.createObjectURL(file);
      setThumbnailPreview(previewUrl);
      setNewThumbnailUrl(previewUrl);
    }
  };

  const handleOpenEditModal = (crs: CourseRecord) => {
    setEditingCourse(crs);
    setEditTitle(crs.title || '');
    setEditDescription(crs.description || '');
    setEditPrice(crs.price ? crs.price.toString() : '0');
    setEditOriginalPrice(crs.originalPrice ? crs.originalPrice.toString() : '0');
    setEditStateCode(crs.stateCode || 'GLOBAL');
    const catCode = typeof crs.category === 'object' ? crs.category?.code || 'SCHOOL_K12' : 'SCHOOL_K12';
    setEditCategoryCode(catCode);
    setEditSubCategory(crs.subCategory || '');
    setEditSubCategoryTitle(crs.subCategoryTitle || '');
    setEditStream(crs.stream || '');
    setEditBoardGrade(crs.boardOrGrade || '');
    setEditSubjectName(crs.subjectName || 'All Subjects (Complete Package)');
    setEditCourseMode(crs.courseMode || 'LIVE_ONLINE');
    setEditLiveMeetingUrl(crs.liveMeetingUrl || '');
    setEditLectureVideoUrl(crs.lectureVideoUrl || '');
    setEditThumbnail(crs.thumbnail || '');
    setEditErrorMsg('');
  };

  const handleSaveCourseEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;
    setIsSavingEdit(true);
    setEditErrorMsg('');

    try {
      const payload = {
        title: editTitle,
        description: editDescription,
        price: Number(editPrice),
        originalPrice: Number(editOriginalPrice),
        stateCode: editStateCode,
        categoryId: editCategoryCode,
        subCategory: editSubCategory,
        subCategoryTitle: editSubCategoryTitle,
        stream: editStream,
        boardOrGrade: editBoardGrade,
        subjectName: editSubjectName,
        courseMode: editCourseMode,
        liveMeetingUrl: editLiveMeetingUrl,
        lectureVideoUrl: editLectureVideoUrl,
        thumbnail: editThumbnail
      };

      const res = await updateTeacherCourse(editingCourse._id, payload);
      if (res.success && res.data?.course) {
        loadCourses();
        if (selectedCourseDetail?._id === editingCourse._id) {
          setSelectedCourseDetail({ ...selectedCourseDetail, ...res.data.course });
        }
        setEditingCourse(null);
      }
    } catch (err: any) {
      setEditErrorMsg(err.message || 'Failed to save course edits.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteCourseItem = async (courseId: string) => {
    if (!window.confirm('Are you sure you want to PERMANENTLY DELETE this course batch? This action cannot be undone.')) {
      return;
    }
    try {
      const res = await deleteTeacherCourse(courseId);
      if (res.success) {
        setCoursesList((prev) => prev.filter((c) => c._id !== courseId));
        if (selectedCourseDetail?._id === courseId) {
          setSelectedCourseDetail(null);
        }
        loadStats();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete course batch.');
    }
  };

  // Create Course Form Submit
  const handleCreateCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateCourseError('');
    setCourseCreatedSuccess(false);

    if (!newTitle.trim() || newTitle.trim().length < 4) {
      setCreateCourseError('Course title must be at least 4 characters long.');
      return;
    }
    const priceNum = Number(newPrice);
    const origPriceNum = Number(newOriginalPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setCreateCourseError('Offer Price must be a valid positive number (> ₹0).');
      return;
    }
    if (isNaN(origPriceNum) || origPriceNum < priceNum) {
      setCreateCourseError('Original MRP Price must be greater than or equal to Offer Price.');
      return;
    }
    if ((newCourseMode === 'LIVE_ONLINE' || newCourseMode === 'HYBRID') && (!newLiveMeetingUrl.trim() || !newLiveMeetingUrl.includes('http'))) {
      setCreateCourseError('Please enter a valid Live Stream Meeting URL (e.g. Zoom or Google Meet URL).');
      return;
    }
    if ((newCourseMode === 'RECORDED_VIDEO' || newCourseMode === 'HYBRID') && (!newLectureVideoUrl.trim() || !newLectureVideoUrl.includes('http'))) {
      setCreateCourseError('Please enter a valid Video Lecture URL (e.g. YouTube video URL).');
      return;
    }
    if (!newDescription.trim() || newDescription.trim().length < 10) {
      setCreateCourseError('Course description must be at least 10 characters long.');
      return;
    }

    const targetModule = CORE_MODULES_LIST.find((m) => m.code === newCategoryCode);
    const targetSub = targetModule?.subCategories.find((s) => s.code === newSubCategory);

    setIsCreatingCourse(true);
    const res = await createTeacherCourse(
      {
        title: newTitle.trim(),
        categoryId: newCategoryCode,
        subCategory: newSubCategory,
        subCategoryTitle: targetSub ? targetSub.title : newSubCategory,
        stream: newStream,
        subjectName: newSubjectName,
        description: newDescription.trim(),
        price: priceNum,
        originalPrice: origPriceNum,
        stateCode: newStateCode,
        boardOrGrade: newBoardGrade || (targetSub ? targetSub.title : ''),
        courseMode: newCourseMode,
        liveMeetingUrl: newLiveMeetingUrl.trim(),
        lectureVideoUrl: newLectureVideoUrl.trim(),
        thumbnail: newThumbnailUrl.trim()
      },
      thumbnailFile
    );
    setIsCreatingCourse(false);

    if (res.success) {
      setCourseCreatedSuccess(true);
      setNewTitle('');
      setNewDescription('');
      setThumbnailFile(null);
      setThumbnailPreview('');
      loadCourses();
      loadStats();
      setTimeout(() => setCourseCreatedSuccess(false), 4000);
    } else {
      setCreateCourseError(res.message || 'Failed to publish new course.');
    }
  };

  // Submit MCQ Form (Multi-Question Batch)
  const handleSaveMcqSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMcqError('');
    setMcqSavedSuccess(false);

    if (!selectedMcqCourseId) {
      setMcqError('Please select a Target Course Batch for this MCQ test.');
      return;
    }

    for (let i = 0; i < mcqQuestionsList.length; i++) {
      const q = mcqQuestionsList[i];
      if (!q.questionText.trim()) {
        setMcqError(`Question #${i + 1}: Please enter the question statement.`);
        return;
      }
      if (!q.optionA.trim() || !q.optionB.trim() || !q.optionC.trim() || !q.optionD.trim()) {
        setMcqError(`Question #${i + 1}: Please enter all 4 options (A, B, C, D).`);
        return;
      }
    }

    setIsSavingMcq(true);
    const res = await createTeacherMcq({
      courseId: selectedMcqCourseId,
      quizSetTitle: quizSetTitleInput.trim() || 'Practice Test Set #1',
      questions: mcqQuestionsList
    });
    setIsSavingMcq(false);

    if (res.success) {
      const addedCount = res.data?.count || mcqQuestionsList.length;
      setMcqSavedCount(addedCount);
      setMcqSavedSuccess(true);
      setMcqQuestionsList([
        {
          id: `q-${Date.now()}-1`,
          questionText: '',
          optionA: '',
          optionB: '',
          optionC: '',
          optionD: '',
          correctOptionIndex: 0,
          explanation: ''
        }
      ]);
      loadMcqs();
      const match = quizSetTitleInput.match(/#(\d+)/);
      if (match) {
        const currentNum = parseInt(match[1], 10);
        setQuizSetTitleInput(quizSetTitleInput.replace(`#${currentNum}`, `#${currentNum + 1}`));
      } else {
        setQuizSetTitleInput('Practice Test Set #' + (Math.floor(Math.random() * 90) + 10));
      }
      setTimeout(() => setMcqSavedSuccess(false), 5000);
    } else {
      setMcqError(res.message || 'Failed to save MCQ questions.');
    }
  };

  // Submit Payout Request
  const handlePayoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayoutErrorMsg('');
    setPayoutSuccessMsg('');

    const amt = Number(payoutAmount);
    if (isNaN(amt) || amt <= 0) {
      setPayoutErrorMsg('Please enter a valid payout withdrawal amount.');
      return;
    }

    setIsSubmittingPayout(true);
    const res = await requestTeacherPayout(amt);
    setIsSubmittingPayout(false);

    if (res.success) {
      setPayoutSuccessMsg(`✅ Withdrawal request of ₹${amt.toLocaleString('en-IN')} submitted to Super Admin!`);
      loadStats();
    } else {
      setPayoutErrorMsg(res.message || 'Payout request failed.');
    }
  };

  return (
    <div>
      {/* Compact Top Banner Header */}
      <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '20px', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <span className="badge badge-emerald" style={{ padding: '2px 8px', fontSize: '0.72rem' }}>
                <GraduationCap size={12} /> TEACHER & EDUCATOR WEB PORTAL
              </span>
              <span className="badge badge-primary" style={{ padding: '2px 8px', fontSize: '0.72rem' }}>INSTRUCTOR SUITE</span>
            </div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: '800', margin: '2px 0', letterSpacing: '-0.3px' }}>
              Welcome Back, {user?.name || 'Prof. Educator'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: 0 }}>
              Create Courses, Build Live MCQs, Track Student Quiz Attempts & Manage Earnings.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-secondary" onClick={() => { loadStats(); loadCourses(); loadMcqs(); loadAttempts(); }} style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
              <RefreshCw size={14} className={isLoadingStats ? 'animate-spin' : ''} /> Refresh Data
            </button>
            <button className="btn-emerald" onClick={() => setActiveTab('CREATE')} style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
              <PlusCircle size={14} /> Create Course
            </button>
          </div>
        </div>
      </div>

      {/* 100% Dynamic Metric Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <div className="glass-card" style={{ padding: '12px 16px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(5,150,105,0.12) 100%)' }}>
          <div style={{ fontSize: '0.72rem', color: '#34D399', fontWeight: '700', marginBottom: '2px' }}>
            MY TOTAL SALES ROYALTIES (70% SHARE)
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: '800' }}>
            ₹ {stats ? (stats.totalRevenue || 0).toLocaleString('en-IN') : '0'}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>From Course Sales & Royalties</div>
        </div>

        <div className="glass-card" style={{ padding: '12px 16px', borderRadius: '12px' }}>
          <div style={{ fontSize: '0.72rem', color: '#818CF8', fontWeight: '700', marginBottom: '2px' }}>
            ENROLLED STUDENTS
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: '800' }}>
            {stats ? (stats.totalStudents || 0).toLocaleString('en-IN') : '0'}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Across All Active Batches</div>
        </div>

        <div className="glass-card" style={{ padding: '12px 16px', borderRadius: '12px' }}>
          <div style={{ fontSize: '0.72rem', color: '#FBBF24', fontWeight: '700', marginBottom: '2px' }}>
            MY COURSES PUBLISHED
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: '800' }}>
            {stats ? (stats.activeCoursesCount || coursesList.length) : '0'} Batches
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Live & Recorded Courses</div>
        </div>

        <div className="glass-card" style={{ padding: '12px 16px', borderRadius: '12px' }}>
          <div style={{ fontSize: '0.72rem', color: '#A855F7', fontWeight: '700', marginBottom: '2px' }}>
            MCQ QUESTIONS AUTHORED
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: '800' }}>
            {mcqsList.length} Questions
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{attemptsList.length} Student Quiz Attempts</div>
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
            <strong style={{ color: '#FB7185', textTransform: 'uppercase', marginRight: '6px' }}>📢 Official Admin Notice:</strong>
            {systemAnnouncement}
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-color)', overflowX: 'auto' }}>
        <button
          onClick={() => setActiveTab('MY_COURSES')}
          style={{
            flex: 1,
            padding: '8px 14px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'MY_COURSES' ? 'var(--emerald-gradient)' : 'transparent',
            color: activeTab === 'MY_COURSES' ? '#FFF' : 'var(--text-secondary)',
            fontWeight: '700',
            fontSize: '0.82rem',
            cursor: 'pointer'
          }}
        >
          <BookOpen size={15} style={{ display: 'inline', marginRight: '6px' }} />
          My Published Batches ({coursesList.length})
        </button>

        <button
          onClick={() => setActiveTab('CREATE')}
          style={{
            flex: 1,
            padding: '8px 14px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'CREATE' ? 'var(--primary-gradient)' : 'transparent',
            color: activeTab === 'CREATE' ? '#FFF' : 'var(--text-secondary)',
            fontWeight: '700',
            fontSize: '0.82rem',
            cursor: 'pointer'
          }}
        >
          <PlusCircle size={15} style={{ display: 'inline', marginRight: '6px' }} />
          Publish New Batch
        </button>

        <button
          onClick={() => setActiveTab('MCQ_BUILDER')}
          style={{
            flex: 1,
            padding: '8px 14px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'MCQ_BUILDER' ? 'var(--amber-gradient)' : 'transparent',
            color: activeTab === 'MCQ_BUILDER' ? '#FFF' : 'var(--text-secondary)',
            fontWeight: '700',
            fontSize: '0.82rem',
            cursor: 'pointer'
          }}
        >
          <HelpCircle size={15} style={{ display: 'inline', marginRight: '6px' }} />
          Live MCQ Question Builder
        </button>

        <button
          onClick={() => setActiveTab('MCQ_AUDIT')}
          style={{
            flex: 1,
            padding: '8px 14px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'MCQ_AUDIT' ? 'var(--rose-gradient)' : 'transparent',
            color: activeTab === 'MCQ_AUDIT' ? '#FFF' : 'var(--text-secondary)',
            fontWeight: '700',
            fontSize: '0.82rem',
            cursor: 'pointer'
          }}
        >
          <Award size={15} style={{ display: 'inline', marginRight: '6px' }} />
          MCQ Bank & Student Attempts ({mcqsList.length})
        </button>

        <button
          onClick={() => setActiveTab('ROYALTY_PAYOUT')}
          style={{
            flex: 1,
            padding: '8px 14px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'ROYALTY_PAYOUT' ? 'var(--secondary-gradient)' : 'transparent',
            color: activeTab === 'ROYALTY_PAYOUT' ? '#FFF' : 'var(--text-secondary)',
            fontWeight: '700',
            fontSize: '0.82rem',
            cursor: 'pointer'
          }}
        >
          <DollarSign size={15} style={{ display: 'inline', marginRight: '6px' }} />
          Royalty Earnings Withdrawal
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

      {/* TAB: MLM BINARY REFERRAL NETWORK */}
      {activeTab === 'MLM_NETWORK' && (
        <AffiliateMlmPortal />
      )}

      {/* TAB 1: MY COURSES DIRECTORY */}
      {activeTab === 'MY_COURSES' && (
        <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800' }}>
              My Published Courses & Batches ({coursesList.length})
            </h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                className="btn-amber"
                onClick={() => {
                  setShowBulkUploadModal(true);
                  setBulkUploadError('');
                  setBulkUploadResult(null);
                }}
                style={{ fontSize: '0.8rem', padding: '6px 14px', fontWeight: '700' }}
              >
                <UploadCloud size={15} style={{ marginRight: '6px' }} /> Bulk Upload Courses (Excel/CSV)
              </button>
              <button className="btn-emerald" onClick={() => setActiveTab('CREATE')} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                <PlusCircle size={14} style={{ marginRight: '4px' }} /> Create Course
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {isLoadingCourses ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading instructor courses...</div>
            ) : coursesList.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No published courses found. Click "Publish New Batch" above to start!</div>
            ) : (
              coursesList.map((crs) => (
                <div
                  key={crs._id}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: crs.active ? 'rgba(16,185,129,0.04)' : 'rgba(244,63,94,0.04)',
                    border: '1px solid var(--border-color)',
                    borderLeft: crs.active ? '4px solid #10B981' : '4px solid #F43F5E',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '800', fontSize: '0.95rem' }}>{crs.title}</span>
                      <span className="badge badge-emerald" style={{ padding: '2px 6px', fontSize: '0.7rem' }}>
                        {crs.boardOrGrade || 'General Batch'}
                      </span>
                      <span className="badge badge-amber" style={{ padding: '2px 6px', fontSize: '0.7rem' }}>
                        State: {crs.stateCode}
                      </span>
                      {crs.active ? (
                        <span className="badge badge-primary" style={{ padding: '2px 6px', fontSize: '0.7rem' }}>LIVE BATCH</span>
                      ) : (
                        <span className="badge badge-rose" style={{ padding: '2px 6px', fontSize: '0.7rem' }}>INACTIVE</span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Delivery Mode: <strong>{crs.courseMode || 'RECORDED_VIDEO'}</strong> • Price: <strong style={{ color: '#34D399' }}>₹{crs.price}</strong> (MRP: ₹{crs.originalPrice})
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <button
                      className="btn-secondary"
                      onClick={() => handleInspectTeacherCourseRoster(crs._id)}
                      style={{ fontSize: '0.75rem', padding: '5px 10px', color: '#60A5FA', borderColor: 'rgba(96,165,250,0.3)' }}
                    >
                      <Users size={13} style={{ marginRight: '4px' }} /> Enrolled Students ({crs.totalStudents || 0})
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => setSelectedCourseDetail(crs)}
                      style={{ fontSize: '0.75rem', padding: '5px 10px' }}
                    >
                      <Eye size={13} style={{ marginRight: '4px' }} /> Inspect Details
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => handleOpenEditModal(crs)}
                      style={{ fontSize: '0.75rem', padding: '5px 10px', color: '#FBBF24', borderColor: 'rgba(245,158,11,0.3)' }}
                    >
                      <Edit3 size={13} style={{ marginRight: '4px' }} /> Edit
                    </button>
                    <button
                      className="btn-rose"
                      onClick={() => handleDeleteCourseItem(crs._id)}
                      style={{ fontSize: '0.75rem', padding: '5px 10px' }}
                    >
                      <Trash2 size={13} style={{ marginRight: '4px' }} /> Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CREATE NEW COURSE FORM */}
      {activeTab === 'CREATE' && (
        <div className="glass-card" style={{ padding: '20px 24px', borderRadius: '16px', maxWidth: '650px' }}>
          <div style={{ marginBottom: '14px' }}>
            <span className="badge badge-emerald" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>INSTRUCTOR AUTHORING STUDIO</span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginTop: '4px' }}>
              Publish New Course Batch
            </h3>
          </div>

          {courseCreatedSuccess && (
            <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', color: '#34D399', fontSize: '0.84rem', fontWeight: '700', marginBottom: '14px' }}>
              🎉 Course published successfully! It is now live in your course directory.
            </div>
          )}

          {createCourseError && (
            <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.4)', color: '#FB7185', fontSize: '0.8rem', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={15} />
              <span>{createCourseError}</span>
            </div>
          )}

          <form onSubmit={handleCreateCourseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                Course Batch Title *
              </label>
              <input
                type="text"
                className="form-input"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. CBSE Class 10th Physics Master Series"
                style={{ padding: '8px 10px', fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                  Offer Price (₹) *
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="1499"
                  style={{ padding: '8px 10px', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                  Original MRP (₹) *
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={newOriginalPrice}
                  onChange={(e) => setNewOriginalPrice(e.target.value)}
                  placeholder="3999"
                  style={{ padding: '8px 10px', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            {/* 6-Level Hierarchy Cascading Selects */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                  Target State (Level 1) *
                </label>
                <select
                  className="form-input"
                  value={newStateCode}
                  onChange={(e) => {
                    const stCode = e.target.value;
                    setNewStateCode(stCode);
                    const validSubs = getSubCategoriesForModuleAndState(newCategoryCode, stCode);
                    if (validSubs.length > 0) {
                      setNewSubCategory(validSubs[0].code);
                      setNewBoardGrade(validSubs[0].title);
                    }
                    const validSbjs = getSubjectsForStateAndModule(stCode);
                    if (validSbjs.length > 0) {
                      setNewSubjectName(validSbjs[0]);
                    }
                  }}
                  style={{ padding: '8px 10px', fontSize: '0.85rem' }}
                >
                  {INDIAN_STATES_LIST.map((st) => (
                    <option key={st.code} value={st.code}>
                      {st.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                  Main Core Module Category (Level 2) *
                </label>
                <select
                  className="form-input"
                  value={newCategoryCode}
                  onChange={(e) => {
                    const modCode = e.target.value;
                    setNewCategoryCode(modCode);
                    const validSubs = getSubCategoriesForModuleAndState(modCode, newStateCode);
                    if (validSubs.length > 0) {
                      setNewSubCategory(validSubs[0].code);
                      setNewBoardGrade(validSubs[0].title);
                    } else {
                      setNewSubCategory('');
                      setNewBoardGrade('');
                    }
                    setNewStream('');
                  }}
                  style={{ padding: '8px 10px', fontSize: '0.85rem', fontWeight: '600' }}
                >
                  {CORE_MODULES_LIST.map((mod) => (
                    <option key={mod.code} value={mod.code}>
                      {mod.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                  Course / Board / Exam Target (Level 3) *
                </label>
                <select
                  className="form-input"
                  value={newSubCategory}
                  onChange={(e) => {
                    const subCode = e.target.value;
                    setNewSubCategory(subCode);
                    const validSubs = getSubCategoriesForModuleAndState(newCategoryCode, newStateCode);
                    const targetSub = validSubs.find((s) => s.code === subCode);
                    if (targetSub) {
                      setNewBoardGrade(targetSub.title);
                    }
                    setNewStream('');
                  }}
                  style={{ padding: '8px 10px', fontSize: '0.85rem' }}
                >
                  {getSubCategoriesForModuleAndState(newCategoryCode, newStateCode).map((sub) => (
                    <option key={sub.code} value={sub.code}>
                      {sub.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                  Grade / Display Batch Subtitle
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={newBoardGrade}
                  onChange={(e) => setNewBoardGrade(e.target.value)}
                  placeholder="e.g. UP Board Intermediate / UPSSSC Lekhpal"
                  style={{ padding: '8px 10px', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            {/* Stream Selector if subCategory has streams */}
            {getSubCategoriesForModuleAndState(newCategoryCode, newStateCode).find((s) => s.code === newSubCategory)?.hasStreams && (
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#A5B4FC', marginBottom: '4px', display: 'block' }}>
                  Senior Secondary Stream (+1 & +2) *
                </label>
                <select
                  className="form-input"
                  value={newStream}
                  onChange={(e) => setNewStream(e.target.value)}
                  style={{ padding: '8px 10px', fontSize: '0.85rem', fontWeight: '700', color: '#A5B4FC' }}
                >
                  <option value="">-- Select Stream --</option>
                  <option value="Arts Stream (Subjects 1–6)">Arts Stream (Subjects 1–6)</option>
                  <option value="Commerce Stream (Subjects 1–6)">Commerce Stream (Subjects 1–6)</option>
                  <option value="Science Stream (Subjects 1–6)">Science Stream (Subjects 1–6)</option>
                </select>
              </div>
            )}

            {/* Target Subject Name (Level 5) */}
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                Target Subject Focus (Level 5) *
              </label>
              <select
                className="form-input"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                style={{ padding: '8px 10px', fontSize: '0.85rem', fontWeight: '600', color: '#FBBF24' }}
              >
                {getSubjectsForStateAndModule(newStateCode).map((sbj) => (
                  <option key={sbj} value={sbj}>
                    {sbj}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                Course Delivery Mode *
              </label>
              <select
                className="form-input"
                value={newCourseMode}
                onChange={(e) => setNewCourseMode(e.target.value as any)}
                style={{ padding: '8px 10px', fontSize: '0.85rem', fontWeight: '700', color: '#34D399' }}
              >
                <option value="LIVE_ONLINE">🔴 LIVE ONLINE CLASS (Zoom / Google Meet / YouTube Live)</option>
                <option value="RECORDED_VIDEO">📹 RECORDED VIDEO COURSE (YouTube / DRM Video Link)</option>
                <option value="HYBRID">⚡ HYBRID (Live Interactive Class + Recorded Access)</option>
              </select>
            </div>

            {(newCourseMode === 'LIVE_ONLINE' || newCourseMode === 'HYBRID') && (
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#34D399', marginBottom: '4px', display: 'block' }}>
                  🔴 Live Stream / Meeting URL (Zoom / Google Meet / YouTube Live) *
                </label>
                <input
                  type="url"
                  className="form-input"
                  value={newLiveMeetingUrl}
                  onChange={(e) => setNewLiveMeetingUrl(e.target.value)}
                  placeholder="e.g. https://zoom.us/j/9900000000"
                  style={{ padding: '8px 10px', fontSize: '0.85rem' }}
                />
              </div>
            )}

            {(newCourseMode === 'RECORDED_VIDEO' || newCourseMode === 'HYBRID') && (
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#818CF8', marginBottom: '4px', display: 'block' }}>
                  📹 Video Lecture URL (YouTube Video Link / Cloudinary DRM Link) *
                </label>
                <input
                  type="url"
                  className="form-input"
                  value={newLectureVideoUrl}
                  onChange={(e) => setNewLectureVideoUrl(e.target.value)}
                  placeholder="e.g. https://www.youtube.com/watch?v=video_id"
                  style={{ padding: '8px 10px', fontSize: '0.85rem' }}
                />
              </div>
            )}

            {/* Cloudinary Image File Upload (Max 2MB Limit) */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block' }}>
                  📸 Select Course Banner Image (Cloudinary Upload) *
                </label>
                <span className="badge badge-amber" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                  MAX FILE SIZE: 2MB
                </span>
              </div>

              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleThumbnailFileChange}
                className="form-input"
                style={{ padding: '6px 10px', fontSize: '0.8rem' }}
              />

              {/* Live Image Banner Preview Box */}
              {(thumbnailPreview || newThumbnailUrl) && (
                <div style={{ marginTop: '8px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', height: '110px', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img
                    src={thumbnailPreview || newThumbnailUrl}
                    alt="Course Banner Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                Course Description & Syllabus Highlights *
              </label>
              <textarea
                className="form-input"
                rows={3}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Detailed course description, chapter breakdown, and lecture highlights..."
                style={{ padding: '8px 10px', fontSize: '0.85rem', resize: 'vertical' }}
              />
            </div>

            <button
              type="submit"
              className="btn-emerald"
              disabled={isCreatingCourse}
              style={{ padding: '10px 18px', fontSize: '0.88rem', fontWeight: '700', marginTop: '6px' }}
            >
              {isCreatingCourse ? 'Publishing Course...' : 'Publish Course Live'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: LIVE MCQ QUESTION BUILDER */}
      {activeTab === 'MCQ_BUILDER' && (
        <div className="glass-card" style={{ padding: '24px 28px', borderRadius: '18px', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span className="badge badge-amber" style={{ fontSize: '0.72rem', padding: '3px 8px', fontWeight: '800' }}>
                MCQ QUESTION BANK AUTHORING
              </span>
              <h3 style={{ fontSize: '1.35rem', fontWeight: '800', marginTop: '6px', color: 'var(--text-primary)' }}>
                Build & Publish Live MCQ Test Paper
              </h3>
            </div>
            <button
              type="button"
              className="btn-amber"
              onClick={handleAddMcqQuestionItem}
              style={{ fontSize: '0.85rem', padding: '8px 16px', borderRadius: '8px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <PlusCircle size={16} /> ➕ Add Another Question
            </button>
          </div>

          {mcqSavedSuccess && (
            <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#34D399', fontSize: '0.88rem', fontWeight: '700', marginBottom: '16px' }}>
              ✅ Successfully published {mcqSavedCount} MCQ question(s) to course test bank!
            </div>
          )}

          {mcqError && (
            <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.4)', color: '#FB7185', fontSize: '0.85rem', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} />
              <span>{mcqError}</span>
            </div>
          )}

          <form onSubmit={handleSaveMcqSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              <div style={{ padding: '16px 20px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                <label style={{ fontSize: '0.88rem', fontWeight: '800', color: '#818CF8', marginBottom: '8px', display: 'block' }}>
                  🎯 Select Target Course Batch *
                </label>
                <select
                  className="form-input"
                  value={selectedMcqCourseId}
                  onChange={(e) => setSelectedMcqCourseId(e.target.value)}
                  style={{ padding: '12px 14px', fontSize: '0.92rem', fontWeight: '700', borderColor: '#818CF8', borderRadius: '8px', width: '100%' }}
                >
                  <option value="">-- Choose Course Batch --</option>
                  {coursesList.map((c: CourseRecord) => (
                    <option key={c._id} value={c._id}>
                      📚 {c.title} ({c.boardOrGrade || 'General'} • {c.subjectName || 'All Subjects'} • ₹{c.price})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ padding: '16px 20px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                <label style={{ fontSize: '0.88rem', fontWeight: '800', color: '#FBBF24', marginBottom: '8px', display: 'block' }}>
                  📝 Test Paper / Quiz Set Title *
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={quizSetTitleInput}
                  onChange={(e) => setQuizSetTitleInput(e.target.value)}
                  placeholder="e.g. Unit 1 Physics Test, Practice Test Set #2..."
                  style={{ padding: '12px 14px', fontSize: '0.92rem', fontWeight: '700', borderColor: '#FBBF24', borderRadius: '8px', width: '100%' }}
                />
              </div>
            </div>

            {/* Questions List Iteration */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {mcqQuestionsList.map((item, index) => (
                <div
                  key={item.id}
                  style={{
                    padding: '20px 22px',
                    borderRadius: '14px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="badge badge-primary" style={{ fontSize: '0.82rem', padding: '4px 10px', fontWeight: '800' }}>
                        Question #{index + 1}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Fill details below</span>
                    </div>

                    {mcqQuestionsList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMcqQuestionItem(item.id)}
                        style={{
                          background: 'rgba(244, 63, 94, 0.12)',
                          border: '1px solid rgba(244, 63, 94, 0.3)',
                          color: '#FB7185',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <X size={14} /> Remove Q#{index + 1}
                      </button>
                    )}
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
                      Question Statement *
                    </label>
                    <textarea
                      className="form-input"
                      rows={2}
                      value={item.questionText}
                      onChange={(e) => handleUpdateMcqQuestionItem(index, 'questionText', e.target.value)}
                      placeholder={`e.g. Question ${index + 1} statement...`}
                      style={{ padding: '10px 12px', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                        Option A *
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        value={item.optionA}
                        onChange={(e) => handleUpdateMcqQuestionItem(index, 'optionA', e.target.value)}
                        placeholder="Option A"
                        style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                        Option B *
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        value={item.optionB}
                        onChange={(e) => handleUpdateMcqQuestionItem(index, 'optionB', e.target.value)}
                        placeholder="Option B"
                        style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                        Option C *
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        value={item.optionC}
                        onChange={(e) => handleUpdateMcqQuestionItem(index, 'optionC', e.target.value)}
                        placeholder="Option C"
                        style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                        Option D *
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        value={item.optionD}
                        onChange={(e) => handleUpdateMcqQuestionItem(index, 'optionD', e.target.value)}
                        placeholder="Option D"
                        style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#34D399', marginBottom: '4px', display: 'block' }}>
                        Select Correct Answer Option *
                      </label>
                      <select
                        className="form-input"
                        value={item.correctOptionIndex}
                        onChange={(e) => handleUpdateMcqQuestionItem(index, 'correctOptionIndex', Number(e.target.value))}
                        style={{ padding: '8px 12px', fontSize: '0.85rem', fontWeight: '700' }}
                      >
                        <option value={0}>Option A: {item.optionA || 'Option A'}</option>
                        <option value={1}>Option B: {item.optionB || 'Option B'}</option>
                        <option value={2}>Option C: {item.optionC || 'Option C'}</option>
                        <option value={3}>Option D: {item.optionD || 'Option D'}</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                        Detailed Solution & Explanation
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        value={item.explanation}
                        onChange={(e) => handleUpdateMcqQuestionItem(index, 'explanation', e.target.value)}
                        placeholder="Step-by-step solution..."
                        style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Actions Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', flexWrap: 'wrap', gap: '12px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleAddMcqQuestionItem}
                style={{ padding: '10px 18px', fontSize: '0.88rem', fontWeight: '700', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <PlusCircle size={16} /> ➕ Add Another Question (Q#{mcqQuestionsList.length + 1})
              </button>

              <button
                type="submit"
                className="btn-primary"
                disabled={isSavingMcq}
                style={{ padding: '12px 24px', fontSize: '0.92rem', fontWeight: '800', borderRadius: '8px' }}
              >
                {isSavingMcq ? 'Publishing Test Paper...' : `🚀 Publish ${mcqQuestionsList.length} Question(s) to Course Bank`}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: MCQ BANK & STUDENT ATTEMPTS INSPECTOR */}
      {activeTab === 'MCQ_AUDIT' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Section A: Published MCQ Question List */}
          <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800' }}>
                📝 My Created MCQ Questions Bank ({mcqsList.length})
              </h3>
              <button className="btn-secondary" onClick={loadMcqs} style={{ fontSize: '0.78rem', padding: '5px 10px' }}>
                <RefreshCw size={14} className={isLoadingMcqs ? 'animate-spin' : ''} /> Refresh Questions
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {isLoadingMcqs ? (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading questions...</div>
              ) : mcqsList.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No MCQ questions created yet. Use the "Live MCQ Question Builder" tab to publish questions!</div>
              ) : (
                mcqsList.map((mcq, idx) => (
                  <div key={mcq._id} style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderLeft: '4px solid #F59E0B' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                      <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>
                        Q{idx + 1}. {mcq.questionText}
                      </div>
                      <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.15)', color: '#FBBF24', border: '1px solid rgba(245, 158, 11, 0.4)', fontWeight: '700' }}>
                        📁 {mcq.quizSetTitle || 'Practice Test Set'}
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.78rem', marginBottom: '6px' }}>
                      <div style={{ color: mcq.correctOption === 0 ? '#34D399' : 'var(--text-secondary)', fontWeight: mcq.correctOption === 0 ? '700' : 'normal' }}>
                        A) {mcq.options?.[0]} {mcq.correctOption === 0 ? '✅ (Correct Answer)' : ''}
                      </div>
                      <div style={{ color: mcq.correctOption === 1 ? '#34D399' : 'var(--text-secondary)', fontWeight: mcq.correctOption === 1 ? '700' : 'normal' }}>
                        B) {mcq.options?.[1]} {mcq.correctOption === 1 ? '✅ (Correct Answer)' : ''}
                      </div>
                      <div style={{ color: mcq.correctOption === 2 ? '#34D399' : 'var(--text-secondary)', fontWeight: mcq.correctOption === 2 ? '700' : 'normal' }}>
                        C) {mcq.options?.[2]} {mcq.correctOption === 2 ? '✅ (Correct Answer)' : ''}
                      </div>
                      <div style={{ color: mcq.correctOption === 3 ? '#34D399' : 'var(--text-secondary)', fontWeight: mcq.correctOption === 3 ? '700' : 'normal' }}>
                        D) {mcq.options?.[3]} {mcq.correctOption === 3 ? '✅ (Correct Answer)' : ''}
                      </div>
                    </div>
                    {mcq.explanation && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', padding: '6px 10px', borderRadius: '6px' }}>
                        💡 <strong>Solution Note:</strong> {mcq.explanation}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section B: Student Quiz Attempts Log */}
          <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800' }}>
                🎓 Student Quiz Attendance & Marks Log ({attemptsList.length})
              </h3>
              <button className="btn-secondary" onClick={loadAttempts} style={{ fontSize: '0.78rem', padding: '5px 10px' }}>
                <RefreshCw size={14} className={isLoadingAttempts ? 'animate-spin' : ''} /> Refresh Attempts
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {isLoadingAttempts ? (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading student attempts...</div>
              ) : attemptsList.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No students have attempted quizzes yet. When students submit quiz responses, their marks will appear here live!</div>
              ) : (
                attemptsList.map((att) => (
                  <div key={att._id} style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span>{att.user?.name || 'Student'} ({att.user?.userId || 'N/A'})</span>
                        <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '6px', background: 'rgba(99, 102, 241, 0.15)', color: '#818CF8', border: '1px solid rgba(99, 102, 241, 0.3)', fontWeight: '700' }}>
                          📁 {att.quizSetTitle || 'Practice Test Set'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Subject: {att.subject?.title || 'General Science'} • Mobile: {att.user?.mobile || 'N/A'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: '800', color: att.passed ? '#34D399' : '#FB7185' }}>
                          Score: {att.score} / {att.totalMarks} ({att.percentage}%)
                        </div>
                        <span className={`badge ${att.passed ? 'badge-emerald' : 'badge-rose'}`} style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                          {att.passed ? 'PASSED' : 'NEEDS IMPROVEMENT'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ROYALTY PAYOUT WITHDRAWAL */}
      {activeTab === 'ROYALTY_PAYOUT' && (
        <div className="glass-card" style={{ padding: '20px 24px', borderRadius: '16px', maxWidth: '560px' }}>
          <div style={{ marginBottom: '16px' }}>
            <span className="badge badge-rose" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>FINANCIAL EARNINGS & ROYALTIES</span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginTop: '4px' }}>
              Request Royalty Payout Withdrawal
            </h3>
          </div>

          <div style={{ background: 'rgba(16,185,129,0.08)', borderRadius: '12px', padding: '14px 18px', border: '1px solid rgba(16,185,129,0.3)', marginBottom: '18px' }}>
            <div style={{ fontSize: '0.78rem', color: '#34D399', fontWeight: '700' }}>AVAILABLE ROYALTY WALLET BALANCE</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#FFF' }}>
              ₹ {stats ? (stats.walletBalance || stats.totalRevenue || 0).toLocaleString('en-IN') : '0'}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Instructor 70% Gross Share from course enrollments</div>
          </div>

          {payoutSuccessMsg && (
            <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', color: '#34D399', fontSize: '0.84rem', fontWeight: '700', marginBottom: '14px' }}>
              {payoutSuccessMsg}
            </div>
          )}

          {payoutErrorMsg && (
            <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.4)', color: '#FB7185', fontSize: '0.8rem', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={15} />
              <span>{payoutErrorMsg}</span>
            </div>
          )}

          <form onSubmit={handlePayoutSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                Enter Payout Withdrawal Amount (₹) *
              </label>
              <input
                type="number"
                className="form-input"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                placeholder="50000"
                style={{ padding: '8px 12px', fontSize: '0.9rem' }}
              />
            </div>

            <button
                  type="submit"
                  className="btn-emerald"
                  disabled={isSubmittingPayout}
                  style={{ padding: '10px 18px', fontSize: '0.88rem', fontWeight: '700' }}
                >
                  {isSubmittingPayout ? 'Submitting Withdrawal Request...' : 'Submit Royalty Payout Request'}
                </button>
              </form>
            </div>
          )}

          {/* VIEW COURSE DETAILS INSPECTION MODAL */}
          {selectedCourseDetail && (
            <div className="modal-overlay" onClick={() => setSelectedCourseDetail(null)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', padding: '24px', borderRadius: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <span className="badge badge-emerald" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>COURSE BATCH SPECS & METADATA</span>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginTop: '2px' }}>
                      {selectedCourseDetail.title}
                    </h3>
                  </div>
                  <button onClick={() => setSelectedCourseDetail(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <X size={20} />
                  </button>
                </div>

                {selectedCourseDetail.thumbnail && (
                  <div style={{ borderRadius: '12px', overflow: 'hidden', height: '160px', marginBottom: '16px', border: '1px solid var(--border-color)' }}>
                    <img src={selectedCourseDetail.thumbnail} alt={selectedCourseDetail.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700' }}>LEVEL 1 STATE</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#F59E0B' }}>📍 {selectedCourseDetail.stateCode || 'GLOBAL'}</div>
                  </div>
                  <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700' }}>LEVEL 3 TARGET / BOARD</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#34D399' }}>🎯 {selectedCourseDetail.subCategoryTitle || selectedCourseDetail.subCategory || 'General'}</div>
                  </div>
                  <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700' }}>LEVEL 5 TARGET SUBJECT</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#FBBF24' }}>📚 {selectedCourseDetail.subjectName || 'All Subjects'}</div>
                  </div>
                  <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700' }}>BATCH SUBTITLE / GRADE</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#818CF8' }}>🏷️ {selectedCourseDetail.boardOrGrade || 'N/A'}</div>
                  </div>
                </div>

                <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>PRICE & DELIVERY MODE</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: '900', color: '#34D399' }}>
                      ₹{selectedCourseDetail.price} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹{selectedCourseDetail.originalPrice}</span>
                    </span>
                    <span className="badge badge-primary" style={{ fontSize: '0.75rem', padding: '3px 8px' }}>
                      {selectedCourseDetail.courseMode || 'RECORDED_VIDEO'}
                    </span>
                  </div>
                </div>

                {selectedCourseDetail.description && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px' }}>SYLLABUS & DESCRIPTION</div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{selectedCourseDetail.description}</p>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', flexWrap: 'wrap' }}>
                  <button className="btn-secondary" onClick={() => handleOpenEditModal(selectedCourseDetail)} style={{ padding: '8px 14px', fontSize: '0.82rem', color: '#FBBF24' }}>
                    <Edit3 size={15} style={{ marginRight: '4px' }} /> Edit Batch Details
                  </button>
                  <button className="btn-rose" onClick={() => handleDeleteCourseItem(selectedCourseDetail._id)} style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
                    <Trash2 size={15} style={{ marginRight: '4px' }} /> Delete Course Batch
                  </button>
                  <button className="btn-secondary" onClick={() => setSelectedCourseDetail(null)} style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* EDIT COURSE MODAL */}
          {editingCourse && (
            <div className="modal-overlay" onClick={() => setEditingCourse(null)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px', padding: '24px', borderRadius: '16px', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <span className="badge badge-amber" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>EDIT COURSE BATCH</span>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginTop: '2px' }}>
                      Edit {editingCourse.title}
                    </h3>
                  </div>
                  <button onClick={() => setEditingCourse(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <X size={20} />
                  </button>
                </div>

                {editErrorMsg && (
                  <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.4)', color: '#FB7185', fontSize: '0.8rem', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertCircle size={15} />
                    <span>{editErrorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSaveCourseEdit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                      Course Batch Title *
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      style={{ padding: '8px 10px', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                        Offer Price (₹) *
                      </label>
                      <input
                        type="number"
                        className="form-input"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        style={{ padding: '8px 10px', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                        Original MRP (₹) *
                      </label>
                      <input
                        type="number"
                        className="form-input"
                        value={editOriginalPrice}
                        onChange={(e) => setEditOriginalPrice(e.target.value)}
                        style={{ padding: '8px 10px', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                        Target State (Level 1) *
                      </label>
                      <select
                        className="form-input"
                        value={editStateCode}
                        onChange={(e) => {
                          const stCode = e.target.value;
                          setEditStateCode(stCode);
                          const validSubs = getSubCategoriesForModuleAndState(editCategoryCode, stCode);
                          if (validSubs.length > 0) {
                            setEditSubCategory(validSubs[0].code);
                            setEditSubCategoryTitle(validSubs[0].title);
                          }
                          const validSbjs = getSubjectsForStateAndModule(stCode);
                          if (validSbjs.length > 0) {
                            setEditSubjectName(validSbjs[0]);
                          }
                        }}
                        style={{ padding: '8px 10px', fontSize: '0.85rem' }}
                      >
                        {INDIAN_STATES_LIST.map((st) => (
                          <option key={st.code} value={st.code}>
                            {st.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                        Main Category (Level 2) *
                      </label>
                      <select
                        className="form-input"
                        value={editCategoryCode}
                        onChange={(e) => {
                          const modCode = e.target.value;
                          setEditCategoryCode(modCode);
                          const validSubs = getSubCategoriesForModuleAndState(modCode, editStateCode);
                          if (validSubs.length > 0) {
                            setEditSubCategory(validSubs[0].code);
                            setEditSubCategoryTitle(validSubs[0].title);
                          }
                        }}
                        style={{ padding: '8px 10px', fontSize: '0.85rem' }}
                      >
                        {CORE_MODULES_LIST.map((mod) => (
                          <option key={mod.code} value={mod.code}>
                            {mod.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                        Exam / Board Target (Level 3) *
                      </label>
                      <select
                        className="form-input"
                        value={editSubCategory}
                        onChange={(e) => {
                          const subCode = e.target.value;
                          setEditSubCategory(subCode);
                          const validSubs = getSubCategoriesForModuleAndState(editCategoryCode, editStateCode);
                          const targetSub = validSubs.find((s) => s.code === subCode);
                          if (targetSub) {
                            setEditSubCategoryTitle(targetSub.title);
                          }
                        }}
                        style={{ padding: '8px 10px', fontSize: '0.85rem' }}
                      >
                        {getSubCategoriesForModuleAndState(editCategoryCode, editStateCode).map((sub) => (
                          <option key={sub.code} value={sub.code}>
                            {sub.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                        Target Subject Focus (Level 5) *
                      </label>
                      <select
                        className="form-input"
                        value={editSubjectName}
                        onChange={(e) => setEditSubjectName(e.target.value)}
                        style={{ padding: '8px 10px', fontSize: '0.85rem', color: '#FBBF24', fontWeight: '600' }}
                      >
                        {getSubjectsForStateAndModule(editStateCode).map((sbj) => (
                          <option key={sbj} value={sbj}>
                            {sbj}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                      Course Mode *
                    </label>
                    <select
                      className="form-input"
                      value={editCourseMode}
                      onChange={(e) => setEditCourseMode(e.target.value as any)}
                      style={{ padding: '8px 10px', fontSize: '0.85rem' }}
                    >
                      <option value="LIVE_ONLINE">LIVE ONLINE (Zoom / Meet)</option>
                      <option value="RECORDED_VIDEO">RECORDED VIDEO</option>
                      <option value="HYBRID">HYBRID (Live + Recorded)</option>
                    </select>
                  </div>

                  {editCourseMode !== 'RECORDED_VIDEO' && (
                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#34D399', marginBottom: '4px', display: 'block' }}>
                        Live Stream Meeting URL
                      </label>
                      <input
                        type="url"
                        className="form-input"
                        value={editLiveMeetingUrl}
                        onChange={(e) => setEditLiveMeetingUrl(e.target.value)}
                        style={{ padding: '8px 10px', fontSize: '0.85rem' }}
                      />
                    </div>
                  )}

                  {editCourseMode !== 'LIVE_ONLINE' && (
                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#818CF8', marginBottom: '4px', display: 'block' }}>
                        Lecture Video URL
                      </label>
                      <input
                        type="url"
                        className="form-input"
                        value={editLectureVideoUrl}
                        onChange={(e) => setEditLectureVideoUrl(e.target.value)}
                        style={{ padding: '8px 10px', fontSize: '0.85rem' }}
                      />
                    </div>
                  )}

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                      Description & Syllabus
                    </label>
                    <textarea
                      className="form-input"
                      rows={3}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      style={{ padding: '8px 10px', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                    <button type="button" className="btn-secondary" onClick={() => setEditingCourse(null)} style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-emerald" disabled={isSavingEdit} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                      {isSavingEdit ? 'Saving...' : 'Save Edits'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

      {/* BULK UPLOAD COURSES MODAL STUDIO FOR TEACHER */}
      {showBulkUploadModal && (
        <div className="modal-overlay" onClick={() => setShowBulkUploadModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '1060px',
              width: '95%',
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: '24px 28px',
              borderRadius: '20px'
            }}
          >
            {/* Top Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'var(--amber-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
                  <UploadCloud size={24} />
                </div>
                <div>
                  <span className="badge badge-amber" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>EXCEL & CSV INSTRUCTOR BATCH IMPORTER</span>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '800', margin: '2px 0 0 0' }}>
                    Bulk Upload Courses Studio (Instructor)
                  </h3>
                </div>
              </div>

              <button onClick={() => setShowBulkUploadModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            {/* Comprehensive Guidelines & Template Box */}
            <div className="glass-card" style={{ padding: '18px 20px', borderRadius: '14px', background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(5,150,105,0.08) 100%)', border: '1px solid rgba(16,185,129,0.25)', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34D399', fontWeight: '800', fontSize: '0.95rem', marginBottom: '8px' }}>
                    <HelpCircle size={18} />
                    <span>Instructor Bulk Upload Guidelines & Specifications</span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                    Upload an Excel (`.xlsx`) or CSV (`.csv`) spreadsheet containing multiple courses for your instructor profile.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginTop: '12px' }}>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#34D399', display: 'block', marginBottom: '4px' }}>
                        ✅ Mandatory Required Columns:
                      </span>
                      <ul style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, paddingLeft: '16px', lineHeight: 1.4 }}>
                        <li><strong>title</strong> (Course Batch Title)</li>
                        <li><strong>price</strong> (Offer Price in ₹)</li>
                        <li><strong>originalPrice</strong> (MRP in ₹)</li>
                        <li><strong>stateCode</strong> (UP, DL, MP, BH, RJ, GLOBAL)</li>
                        <li><strong>categoryCode</strong> (SCHOOL_K12, COMPETITIVE_EXAMS, etc.)</li>
                        <li><strong>subCategory</strong> (CLASS_10, UPSSSC_LEKHPAL, etc.)</li>
                        <li><strong>courseMode</strong> (LIVE_ONLINE, RECORDED_VIDEO, HYBRID)</li>
                      </ul>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#FBBF24', display: 'block', marginBottom: '4px' }}>
                        ⚙️ Optional Columns:
                      </span>
                      <ul style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, paddingLeft: '16px', lineHeight: 1.4 }}>
                        <li><strong>boardOrGrade</strong> (Display Subtitle)</li>
                        <li><strong>stream</strong> (Arts/Commerce/Science)</li>
                        <li><strong>subjectName</strong> (Physics, Math, etc.)</li>
                        <li><strong>liveMeetingUrl</strong> (Zoom / Meet link)</li>
                        <li><strong>lectureVideoUrl</strong> (YouTube / DRM link)</li>
                        <li><strong>description</strong> (Batch details text)</li>
                        <li><strong>validityDays</strong> (Default 365)</li>
                        <li><strong>thumbnail</strong> (Banner Image URL)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Download Template Action Card */}
                <div style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minWidth: '220px' }}>
                  <FileSpreadsheet size={32} style={{ color: '#34D399', marginBottom: '8px' }} />
                  <div style={{ fontWeight: '800', fontSize: '0.88rem', color: '#FFF', marginBottom: '4px' }}>
                    Need Sample Template?
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                    Download pre-formatted 5-course CSV template compatible with Excel & Google Sheets.
                  </p>
                  <button
                    className="btn-emerald"
                    onClick={handleDownloadSampleCsvTemplate}
                    style={{ fontSize: '0.78rem', padding: '8px 14px', width: '100%', fontWeight: '700' }}
                  >
                    <Download size={14} style={{ marginRight: '6px' }} /> Download Sample CSV / Excel Template
                  </button>
                </div>
              </div>
            </div>

            {/* Error or Success Alert Banners */}
            {bulkUploadError && (
              <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.4)', color: '#FB7185', fontSize: '0.85rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} />
                <span>{bulkUploadError}</span>
              </div>
            )}

            {bulkUploadResult && (
              <div style={{ padding: '14px 18px', borderRadius: '12px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', color: '#34D399', fontSize: '0.9rem', fontWeight: '700', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <CheckCircle2 size={18} />
                  <span>Bulk Upload Completed! {bulkUploadResult.successCount} Courses Successfully Published to your Instructor Account.</span>
                </div>
                {bulkUploadResult.failCount > 0 && (
                  <div style={{ color: '#FBBF24', fontSize: '0.8rem', marginTop: '6px', fontWeight: '600' }}>
                    ⚠️ {bulkUploadResult.failCount} rows failed validation. (Errors: {bulkUploadResult.errors.map(e => `Row ${e.row}: ${e.error}`).join(', ')})
                  </div>
                )}
              </div>
            )}

            {/* File Upload Selector */}
            <div style={{ border: '2px dashed var(--border-color)', borderRadius: '14px', padding: '24px', textAlign: 'center', background: 'rgba(255,255,255,0.01)', marginBottom: '20px' }}>
              <UploadCloud size={36} style={{ color: 'var(--primary-accent)', marginBottom: '8px' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: '800', margin: '0 0 4px 0' }}>
                Select or Drag & Drop Excel / CSV File
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                Supports `.csv`, `.xlsx`, `.tsv` files containing course records.
              </p>
              <input
                type="file"
                accept=".csv, .xlsx, .xls, .txt"
                onChange={handleFileUploadChange}
                style={{ display: 'none' }}
                id="teacher-bulk-file-input"
              />
              <label htmlFor="teacher-bulk-file-input" className="btn-primary" style={{ cursor: 'pointer', padding: '8px 20px', fontSize: '0.85rem' }}>
                Browse File from Computer
              </label>

              {bulkFileName && (
                <div style={{ marginTop: '12px', fontSize: '0.82rem', fontWeight: '700', color: '#FBBF24' }}>
                  📄 Loaded File: <span>{bulkFileName}</span> ({parsedBulkCourses.length} Total Rows Parsed)
                </div>
              )}
            </div>

            {/* Parsed Preview Table */}
            {parsedBulkCourses.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '800', margin: 0 }}>
                    Parsed Rows Live Preview ({parsedBulkCourses.length} Items)
                  </h4>
                  <div style={{ display: 'flex', gap: '10px', fontSize: '0.78rem', fontWeight: '700' }}>
                    <span style={{ color: '#34D399' }}>
                      ✓ {parsedBulkCourses.filter(c => c.isValid).length} Valid Ready
                    </span>
                    <span style={{ color: '#FB7185' }}>
                      ✕ {parsedBulkCourses.filter(c => !c.isValid).length} Missing Fields
                    </span>
                  </div>
                </div>

                <div style={{ maxHeight: '260px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'var(--bg-surface)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '10px 12px' }}>Status</th>
                        <th style={{ padding: '10px 12px' }}>Course Title</th>
                        <th style={{ padding: '10px 12px' }}>State / Category</th>
                        <th style={{ padding: '10px 12px' }}>SubCategory</th>
                        <th style={{ padding: '10px 12px' }}>Mode</th>
                        <th style={{ padding: '10px 12px' }}>Price (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedBulkCourses.map((row, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)', background: row.isValid ? 'transparent' : 'rgba(244,63,94,0.06)' }}>
                          <td style={{ padding: '8px 12px' }}>
                            {row.isValid ? (
                              <span className="badge badge-emerald" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>VALID</span>
                            ) : (
                              <span className="badge badge-rose" style={{ fontSize: '0.68rem', padding: '2px 6px' }} title={row.errors.join(', ')}>INVALID</span>
                            )}
                          </td>
                          <td style={{ padding: '8px 12px', fontWeight: '700' }}>
                            {row.title || <em style={{ color: '#FB7185' }}>Missing Title</em>}
                          </td>
                          <td style={{ padding: '8px 12px' }}>
                            {row.stateCode} • {row.categoryCode}
                          </td>
                          <td style={{ padding: '8px 12px' }}>
                            {row.subCategory}
                          </td>
                          <td style={{ padding: '8px 12px' }}>
                            <span className="badge badge-primary" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>{row.courseMode}</span>
                          </td>
                          <td style={{ padding: '8px 12px', fontWeight: '800', color: '#34D399' }}>
                            ₹{row.price} <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.7rem' }}>₹{row.originalPrice}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Bottom Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
              <button
                className="btn-secondary"
                onClick={() => {
                  setShowBulkUploadModal(false);
                  setParsedBulkCourses([]);
                  setBulkFileName('');
                  setBulkUploadResult(null);
                  setBulkUploadError('');
                }}
                style={{ fontSize: '0.82rem', padding: '6px 18px' }}
              >
                Close Studio
              </button>

              <button
                className="btn-emerald"
                onClick={handleExecuteBulkUpload}
                disabled={isSubmittingBulk || parsedBulkCourses.filter(c => c.isValid).length === 0}
                style={{ fontSize: '0.88rem', padding: '8px 24px', fontWeight: '800' }}
              >
                {isSubmittingBulk ? 'Publishing Courses...' : `Publish ${parsedBulkCourses.filter(c => c.isValid).length} Parsed Courses Now`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Teacher: Enrolled Students & Royalty Earned Roster Modal */}
      {selectedTeacherCourseRoster && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1100,
          padding: '20px'
        }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '900px',
            maxHeight: '90vh',
            overflowY: 'auto',
            borderRadius: '20px',
            padding: '24px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <span className="badge badge-emerald" style={{ fontSize: '0.72rem', padding: '2px 8px', textTransform: 'uppercase' }}>
                  Educator Course Enrollment Roster
                </span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', marginTop: '6px', color: 'var(--text-primary)' }}>
                  {selectedTeacherCourseRoster.course.title}
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <span>Board/Grade: <strong style={{ color: 'var(--text-primary)' }}>{selectedTeacherCourseRoster.course.boardOrGrade || 'General Batch'}</strong></span>
                  <span>•</span>
                  <span>Subject: <strong style={{ color: 'var(--text-primary)' }}>{selectedTeacherCourseRoster.course.subjectName || 'All Subjects'}</strong></span>
                  <span>•</span>
                  <span>Batch Price: <strong style={{ color: '#34D399' }}>₹{selectedTeacherCourseRoster.course.price || 0}</strong></span>
                </div>
              </div>
              <button
                className="btn-secondary"
                onClick={() => setSelectedTeacherCourseRoster(null)}
                style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '10px' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Financial Overview Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div style={{ padding: '16px 18px', background: 'rgba(59, 130, 246, 0.08)', borderRadius: '14px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#60A5FA', textTransform: 'uppercase' }}>Enrolled Students</div>
                <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#60A5FA', marginTop: '4px' }}>
                  {selectedTeacherCourseRoster.totalEnrolled} Students
                </div>
              </div>

              <div style={{ padding: '16px 18px', background: 'rgba(245, 158, 11, 0.08)', borderRadius: '14px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#FBBF24', textTransform: 'uppercase' }}>Educator Royalty Earned (70%)</div>
                <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#FBBF24', marginTop: '4px' }}>
                  ₹{selectedTeacherCourseRoster.totalRoyaltyEarned.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Student Roster Table */}
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} style={{ color: '#60A5FA' }} /> Student Roster ({selectedTeacherCourseRoster.enrolledStudents.length})
              </h4>

              {selectedTeacherCourseRoster.enrolledStudents.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                  No students have enrolled in this batch yet.
                </div>
              ) : (
                <div style={{ overflowX: 'auto', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '10px 12px' }}>#</th>
                        <th style={{ padding: '10px 12px' }}>Student Name & ID</th>
                        <th style={{ padding: '10px 12px' }}>Contact Info</th>
                        <th style={{ padding: '10px 12px' }}>State / Board</th>
                        <th style={{ padding: '10px 12px' }}>Purchase Date</th>
                        <th style={{ padding: '10px 12px', textAlign: 'right' }}>Your Royalty (70%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTeacherCourseRoster.enrolledStudents.map((st, idx) => {
                        const studentUser = st.student || ({} as any);
                        return (
                          <tr key={st.purchaseId || idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '10px 12px', fontWeight: '700', color: 'var(--text-muted)' }}>{idx + 1}</td>
                            <td style={{ padding: '10px 12px' }}>
                              <div style={{ fontWeight: '800', color: 'var(--text-primary)' }}>{studentUser.name || 'Anonymous Student'}</div>
                              <div style={{ fontSize: '0.72rem', color: '#60A5FA', fontFamily: 'monospace' }}>ID: {studentUser.userId || studentUser._id || 'N/A'}</div>
                            </td>
                            <td style={{ padding: '10px 12px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={12} style={{ color: 'var(--text-muted)' }} /> {studentUser.mobile || 'N/A'}</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', color: 'var(--text-muted)' }}><Mail size={12} /> {studentUser.email || 'N/A'}</div>
                            </td>
                            <td style={{ padding: '10px 12px' }}>
                              <span className="badge badge-amber" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>{studentUser.stateCode || 'General'}</span>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Role: {studentUser.role || 'STUDENT'}</div>
                            </td>
                            <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>
                              {st.enrolledAt ? new Date(st.enrolledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                            </td>
                            <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '800', color: '#FBBF24' }}>
                              ₹{(st.teacherRoyaltyEarned || Math.round((st.amountPaid || 0) * 0.7)).toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button className="btn-primary" onClick={() => setSelectedTeacherCourseRoster(null)} style={{ padding: '8px 24px', fontSize: '0.85rem' }}>
                Close Roster
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
