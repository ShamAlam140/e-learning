import React, { useState } from 'react';
import {
  BookOpen, Video, Radio, FileText, Plus, Trash2,
  Sparkles, Award, Layers, X, Check, ChevronRight, ChevronLeft,
  AlertCircle, Eye, ExternalLink, ChevronDown, ChevronUp
} from 'lucide-react';
import {
  INDIAN_STATES_LIST,
  CORE_MODULES_LIST,
  getSubCategoriesForModuleAndState,
  getSubjectsForStateAndModule
} from '../services/taxonomyTree';
import {
  CourseInclusions,
  CourseCurriculumItem,
  CourseStudyMaterialItem,
  CourseMockTestItem,
  CourseMockTestQuestion
} from '../services/adminService';

export interface CourseCreationWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditMode?: boolean;
  portalType?: 'ADMIN' | 'TEACHER';
  inline?: boolean; // if true, renders inline without modal overlay

  // Form Data & Setters
  title: string;
  onTitleChange: (v: string) => void;
  price: string | number;
  onPriceChange: (v: string) => void;
  originalPrice: string | number;
  onOriginalPriceChange: (v: string) => void;

  stateCode: string;
  onStateCodeChange: (v: string) => void;
  categoryCode: string;
  onCategoryCodeChange: (v: string) => void;
  subCategory: string;
  onSubCategoryChange: (v: string) => void;
  boardGrade: string;
  onBoardGradeChange: (v: string) => void;
  stream: string;
  onStreamChange: (v: string) => void;
  subjectName: string;
  onSubjectNameChange: (v: string) => void;

  courseMode: 'LIVE_ONLINE' | 'RECORDED_VIDEO' | 'HYBRID';
  onCourseModeChange: (v: 'LIVE_ONLINE' | 'RECORDED_VIDEO' | 'HYBRID') => void;

  syllabusTopics: string[];
  onSyllabusTopicsChange: (v: string[]) => void;

  lectureVideoUrl: string;
  onLectureVideoUrlChange: (v: string) => void;
  demoVideoUrl: string;
  onDemoVideoUrlChange: (v: string) => void;

  liveMeetingUrl: string;
  onLiveMeetingUrlChange: (v: string) => void;
  liveSchedule: string;
  onLiveScheduleChange: (v: string) => void;

  ebookTitle: string;
  onEbookTitleChange: (v: string) => void;
  ebookPdfUrl: string;
  onEbookPdfUrlChange: (v: string) => void;

  studyMaterials?: CourseStudyMaterialItem[];
  onStudyMaterialsChange?: (v: CourseStudyMaterialItem[]) => void;

  mockTests?: CourseMockTestItem[];
  onMockTestsChange?: (v: CourseMockTestItem[]) => void;

  inclusions: CourseInclusions;
  onInclusionsChange: (v: CourseInclusions) => void;

  curriculum: CourseCurriculumItem[];
  onCurriculumChange: (v: CourseCurriculumItem[]) => void;

  description: string;
  onDescriptionChange: (v: string) => void;

  thumbnailFile?: File | null;
  thumbnailPreview?: string;
  thumbnailUrl?: string;
  onThumbnailFileChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;

  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  errorMessage?: string;
}

const STEPS = [
  { id: 1, title: 'Basics & Board', subtitle: 'Title & Academic Level' },
  { id: 2, title: 'Format & Topics', subtitle: 'Live / Video & Syllabus' },
  { id: 3, title: 'Materials & Perks', subtitle: 'Notes, Tests & Perks' },
  { id: 4, title: 'Pricing & Review', subtitle: 'Price, Banner & Publish' }
];

export const CourseCreationWizardModal: React.FC<CourseCreationWizardModalProps> = ({
  isOpen,
  onClose,
  isEditMode = false,
  portalType = 'ADMIN',
  inline = false,

  title,
  onTitleChange,
  price,
  onPriceChange,
  originalPrice,
  onOriginalPriceChange,

  stateCode,
  onStateCodeChange,
  categoryCode,
  onCategoryCodeChange,
  subCategory,
  onSubCategoryChange,
  boardGrade,
  onBoardGradeChange,
  stream,
  onStreamChange,
  subjectName,
  onSubjectNameChange,

  courseMode,
  onCourseModeChange,

  syllabusTopics,
  onSyllabusTopicsChange,

  lectureVideoUrl,
  onLectureVideoUrlChange,
  demoVideoUrl,
  onDemoVideoUrlChange,

  liveMeetingUrl,
  onLiveMeetingUrlChange,
  liveSchedule,
  onLiveScheduleChange,

  ebookTitle,
  onEbookTitleChange,
  ebookPdfUrl,
  onEbookPdfUrlChange,

  studyMaterials = [],
  onStudyMaterialsChange,

  mockTests = [],
  onMockTestsChange,

  inclusions,
  onInclusionsChange,

  curriculum,
  onCurriculumChange,

  description,
  onDescriptionChange,

  thumbnailPreview,
  thumbnailUrl,
  onThumbnailFileChange,

  onSubmit,
  isSubmitting,
  errorMessage
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [stepError, setStepError] = useState('');
  const [customTopicInput, setCustomTopicInput] = useState('');
  const [newCurriculumTitle, setNewCurriculumTitle] = useState('');
  const [newCurriculumLectures, setNewCurriculumLectures] = useState('5');
  const [showCurriculumBuilder, setShowCurriculumBuilder] = useState(curriculum.length > 0);

  // Step 3 Sub-Navigation Tabs: 'DOCS' | 'TESTS' | 'PERKS'
  const [step3ActiveTab, setStep3ActiveTab] = useState<'DOCS' | 'TESTS' | 'PERKS'>('DOCS');

  // Study Materials State (Multi-Document)
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocType, setNewDocType] = useState<'PDF' | 'DOC' | 'NOTES' | 'EBOOK'>('PDF');
  const [newDocTopic, setNewDocTopic] = useState('');
  const [newDocCustomTopic, setNewDocCustomTopic] = useState('');
  const [newDocUrl, setNewDocUrl] = useState('');

  // Topic-Wise MCQ Tests State
  const [newTestTitle, setNewTestTitle] = useState('');
  const [newTestTopic, setNewTestTopic] = useState('');
  const [newTestCustomTopic, setNewTestCustomTopic] = useState('');
  const [newTestDuration, setNewTestDuration] = useState('30');
  const [newTestTotalQuestions, setNewTestTotalQuestions] = useState('10');
  const [newTestUrl, setNewTestUrl] = useState('');
  const [showQuestionBuilder, setShowQuestionBuilder] = useState(false);
  const [draftQuestions, setDraftQuestions] = useState<CourseMockTestQuestion[]>([]);

  // MCQ Question inputs
  const [qText, setQText] = useState('');
  const [qOptA, setQOptA] = useState('');
  const [qOptB, setQOptB] = useState('');
  const [qOptC, setQOptC] = useState('');
  const [qOptD, setQOptD] = useState('');
  const [qCorrect, setQCorrect] = useState(0);
  const [qExplanation, setQExplanation] = useState('');

  // Expanded test index for viewing test questions
  const [expandedTestIdx, setExpandedTestIdx] = useState<number | null>(null);

  if (!isOpen && !inline) return null;

  // Handle topic addition
  const handleAddTopic = () => {
    const raw = customTopicInput.trim();
    if (!raw) return;

    // Support comma-separated batch topic entry (e.g. "Algebra, Geometry, Trigonometry")
    const parts = raw.split(/[,;\n]+/).map(p => p.trim()).filter(Boolean);
    const updated = [...syllabusTopics];

    parts.forEach(part => {
      if (!updated.includes(part)) {
        updated.push(part);
      }
    });

    onSyllabusTopicsChange(updated);
    setCustomTopicInput('');
  };

  const handleRemoveTopic = (topicToRemove: string) => {
    onSyllabusTopicsChange(syllabusTopics.filter((t) => t !== topicToRemove));
  };

  const handleClearAllTopics = () => {
    onSyllabusTopicsChange([]);
  };

  const handleInclusionUpdate = (field: keyof CourseInclusions, value: any) => {
    onInclusionsChange({
      ...inclusions,
      [field]: value
    });
  };

  // Study Materials Handlers
  const handleAddStudyMaterial = () => {
    if (!newDocTitle.trim()) {
      alert('Please enter a title for the document / notes.');
      return;
    }
    if (!newDocUrl.trim()) {
      alert('Please enter a valid document download link (e.g. Google Drive, Dropbox, or Cloud URL).');
      return;
    }

    const finalTopic = newDocTopic === '__CUSTOM__' 
      ? (newDocCustomTopic.trim() || 'General')
      : (newDocTopic.trim() || (syllabusTopics.length > 0 ? syllabusTopics[0] : 'General'));

    const item: CourseStudyMaterialItem = {
      title: newDocTitle.trim(),
      docType: newDocType,
      topic: finalTopic,
      fileUrl: newDocUrl.trim()
    };

    const updated = [...studyMaterials, item];
    if (onStudyMaterialsChange) {
      onStudyMaterialsChange(updated);
    }
    handleInclusionUpdate('totalEbooks', updated.length);

    if (!ebookTitle) onEbookTitleChange(item.title);
    if (!ebookPdfUrl) onEbookPdfUrlChange(item.fileUrl);

    setNewDocTitle('');
    setNewDocUrl('');
    setNewDocCustomTopic('');
  };

  const handleRemoveStudyMaterial = (idx: number) => {
    const updated = studyMaterials.filter((_, i) => i !== idx);
    if (onStudyMaterialsChange) {
      onStudyMaterialsChange(updated);
    }
    handleInclusionUpdate('totalEbooks', updated.length);

    if (updated.length > 0) {
      onEbookTitleChange(updated[0].title);
      onEbookPdfUrlChange(updated[0].fileUrl);
    } else {
      onEbookTitleChange('');
      onEbookPdfUrlChange('');
    }
  };

  // Mock Tests & MCQ Handlers
  const handleAddQuestionToDraft = () => {
    if (!qText.trim()) {
      alert('Please enter the question text.');
      return;
    }
    if (!qOptA.trim() || !qOptB.trim()) {
      alert('Please provide at least Option A and Option B.');
      return;
    }

    const options = [
      qOptA.trim(),
      qOptB.trim(),
      qOptC.trim() || 'None of the above',
      qOptD.trim() || 'All of the above'
    ];

    const newQuestion: CourseMockTestQuestion = {
      questionText: qText.trim(),
      options,
      correctOption: qCorrect,
      explanation: qExplanation.trim()
    };

    setDraftQuestions(prev => [...prev, newQuestion]);
    setQText('');
    setQOptA('');
    setQOptB('');
    setQOptC('');
    setQOptD('');
    setQCorrect(0);
    setQExplanation('');
  };

  const handleRemoveQuestionFromDraft = (qIdx: number) => {
    setDraftQuestions(prev => prev.filter((_, i) => i !== qIdx));
  };

  const handleSaveMockTest = () => {
    if (!newTestTitle.trim()) {
      alert('Please enter a mock test or quiz title.');
      return;
    }

    const finalTopic = newTestTopic === '__CUSTOM__'
      ? (newTestCustomTopic.trim() || 'All Topics')
      : (newTestTopic.trim() || (syllabusTopics.length > 0 ? syllabusTopics[0] : 'All Topics'));

    const duration = Number(newTestDuration) || 30;
    const totalQ = draftQuestions.length > 0 ? draftQuestions.length : (Number(newTestTotalQuestions) || 10);

    const testItem: CourseMockTestItem = {
      title: newTestTitle.trim(),
      topic: finalTopic,
      durationMinutes: duration,
      totalQuestions: totalQ,
      testUrl: newTestUrl.trim(),
      questions: draftQuestions.length > 0 ? [...draftQuestions] : []
    };

    const updated = [...mockTests, testItem];
    if (onMockTestsChange) {
      onMockTestsChange(updated);
    }
    handleInclusionUpdate('totalMockTests', updated.length);

    setNewTestTitle('');
    setNewTestUrl('');
    setNewTestCustomTopic('');
    setDraftQuestions([]);
    setShowQuestionBuilder(false);
  };

  const handleRemoveMockTest = (idx: number) => {
    const updated = mockTests.filter((_, i) => i !== idx);
    if (onMockTestsChange) {
      onMockTestsChange(updated);
    }
    handleInclusionUpdate('totalMockTests', updated.length);
  };

  const handleAddCurriculumModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCurriculumTitle.trim()) return;
    const item: CourseCurriculumItem = {
      title: newCurriculumTitle.trim(),
      description: '',
      lectureCount: Number(newCurriculumLectures) || 1
    };
    onCurriculumChange([...curriculum, item]);
    setNewCurriculumTitle('');
    setNewCurriculumLectures('5');
  };

  const handleRemoveCurriculumModule = (index: number) => {
    onCurriculumChange(curriculum.filter((_, idx) => idx !== index));
  };

  // Step Validation before progressing
  const validateStep = (stepNumber: number): boolean => {
    setStepError('');
    if (stepNumber === 1) {
      if (!title.trim() || title.trim().length < 4) {
        setStepError('Please enter a course title (minimum 4 characters).');
        return false;
      }
      if (!subCategory) {
        setStepError('Please select a target board or course.');
        return false;
      }
      return true;
    }

    if (stepNumber === 2) {
      if (courseMode === 'LIVE_ONLINE' && !liveSchedule.trim()) {
        // Warning or suggestion, not strictly blocking unless needed
      }
      return true;
    }

    if (stepNumber === 3) {
      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handlePrev = () => {
    setStepError('');
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Dynamic Discount Calculation
  const offerPriceNum = Number(price) || 0;
  const mrpPriceNum = Number(originalPrice) || 0;
  const discountPercent = mrpPriceNum > offerPriceNum && mrpPriceNum > 0
    ? Math.round(((mrpPriceNum - offerPriceNum) / mrpPriceNum) * 100)
    : 0;

  // Selected State and Category Titles
  const selectedStateName = INDIAN_STATES_LIST.find(s => s.code === stateCode)?.name || stateCode;
  const selectedCategoryTitle = CORE_MODULES_LIST.find(m => m.code === categoryCode)?.title || categoryCode;
  const validSubCategories = getSubCategoriesForModuleAndState(categoryCode, stateCode);
  const selectedSubCategoryItem = validSubCategories.find(s => s.code === subCategory);
  const selectedBoardTitle = selectedSubCategoryItem?.title || subCategory;

  const content = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        maxHeight: inline ? 'none' : '780px',
        background: 'var(--bg-modal, #FFFFFF)',
        borderRadius: inline ? '16px' : '20px',
        overflow: 'hidden',
        boxShadow: inline ? 'none' : '0 25px 60px -15px rgba(0, 0, 0, 0.4)'
      }}
    >
      {/* 1. PINNED HEADER */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-card)',
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: portalType === 'ADMIN' ? 'rgba(225, 29, 72, 0.12)' : 'rgba(16, 185, 129, 0.12)',
              border: portalType === 'ADMIN' ? '1px solid rgba(225, 29, 72, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: portalType === 'ADMIN' ? '#E11D48' : '#10B981'
            }}
          >
            <Sparkles size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                className={portalType === 'ADMIN' ? 'badge badge-rose' : 'badge badge-emerald'}
                style={{ fontSize: '0.68rem', padding: '2px 8px', fontWeight: '800', letterSpacing: '0.5px' }}
              >
                {portalType === 'ADMIN' ? 'SUPER ADMIN STUDIO' : 'INSTRUCTOR STUDIO'}
              </span>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                {isEditMode ? 'Editing Course Batch' : 'Guided Course Wizard'}
              </span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '2px 0 0 0', color: 'var(--text-primary)' }}>
              {isEditMode ? `Edit Course Batch: ${title || 'Untitled'}` : 'Publish New Course Batch'}
            </h3>
          </div>
        </div>

        {!inline && (
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Close"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* 2. PINNED STEPPER NAVIGATION BAR */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-surface)',
          padding: '6px 14px',
          gap: '8px',
          flexShrink: 0
        }}
      >
        {STEPS.map((s) => {
          const isActive = currentStep === s.id;
          const isCompleted = currentStep > s.id;

          return (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                if (s.id < currentStep || validateStep(currentStep)) {
                  setCurrentStep(s.id);
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: '10px',
                border: isActive
                  ? '1.5px solid var(--primary-accent)'
                  : isCompleted
                  ? '1px solid rgba(16, 185, 129, 0.4)'
                  : '1px solid transparent',
                background: isActive
                  ? 'rgba(99, 102, 241, 0.12)'
                  : isCompleted
                  ? 'rgba(16, 185, 129, 0.06)'
                  : 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
            >
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.78rem',
                  fontWeight: '800',
                  flexShrink: 0,
                  background: isActive
                    ? 'var(--primary-accent)'
                    : isCompleted
                    ? '#10B981'
                    : 'var(--border-color)',
                  color: isActive || isCompleted ? '#FFFFFF' : 'var(--text-muted)'
                }}
              >
                {isCompleted ? <Check size={14} /> : s.id}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: isActive ? '800' : '600',
                    color: isActive
                      ? 'var(--primary-accent)'
                      : isCompleted
                      ? '#10B981'
                      : 'var(--text-secondary)',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden'
                  }}
                >
                  {s.title}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {s.subtitle}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ERROR ALERTS */}
      {(stepError || errorMessage) && (
        <div
          style={{
            margin: '12px 24px 0 24px',
            padding: '10px 14px',
            borderRadius: '10px',
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.35)',
            color: '#FB7185',
            fontSize: '0.82rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexShrink: 0
          }}
        >
          <AlertCircle size={16} />
          <span>{stepError || errorMessage}</span>
        </div>
      )}

      {/* 3. STEP CONTENT VIEWPORT (SCROLLABLE & PROTECTED) */}
      <form
        onSubmit={onSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
          }}
        >
          {/* ============================================================== */}
          {/* STEP 1: BASICS & ACADEMIC CLASSIFICATION                       */}
          {/* ============================================================== */}
          {currentStep === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
                  Course Batch Title *
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={title}
                  onChange={(e) => onTitleChange(e.target.value)}
                  placeholder="e.g. CBSE Class 10th Physics Master Series (2025-26)"
                  style={{ padding: '10px 14px', fontSize: '0.95rem', fontWeight: '600' }}
                  autoFocus
                />
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Use a clear, descriptive title that includes class, board, and subject.
                </div>
              </div>

              {/* Breadcrumb Path Banner */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  background: 'rgba(99, 102, 241, 0.08)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  fontSize: '0.78rem',
                  color: 'var(--text-primary)',
                  fontWeight: '600'
                }}
              >
                <span className="badge badge-primary" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                  🎯 TARGET AUDIENCE
                </span>
                <span>{selectedStateName}</span>
                <ChevronRight size={13} style={{ color: 'var(--text-muted)' }} />
                <span>{selectedCategoryTitle}</span>
                <ChevronRight size={13} style={{ color: 'var(--text-muted)' }} />
                <span style={{ color: '#818CF8' }}>{selectedBoardTitle}</span>
                <ChevronRight size={13} style={{ color: 'var(--text-muted)' }} />
                <span style={{ color: '#FBBF24' }}>{subjectName}</span>
              </div>

              {/* 2x2 Academic Hierarchy Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '5px', display: 'block' }}>
                    Target State (Level 1) *
                  </label>
                  <select
                    className="form-input"
                    value={stateCode}
                    onChange={(e) => {
                      const stCode = e.target.value;
                      onStateCodeChange(stCode);
                      const validSubs = getSubCategoriesForModuleAndState(categoryCode, stCode);
                      if (validSubs.length > 0) {
                        onSubCategoryChange(validSubs[0].code);
                        onBoardGradeChange(validSubs[0].title);
                      }
                      const validSbjs = getSubjectsForStateAndModule(stCode);
                      if (validSbjs.length > 0) {
                        onSubjectNameChange(validSbjs[0]);
                      }
                    }}
                    style={{ padding: '9px 12px', fontSize: '0.85rem' }}
                  >
                    {INDIAN_STATES_LIST.map((st) => (
                      <option key={st.code} value={st.code}>
                        {st.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '5px', display: 'block' }}>
                    Main Core Category (Level 2) *
                  </label>
                  <select
                    className="form-input"
                    value={categoryCode}
                    onChange={(e) => {
                      const modCode = e.target.value;
                      onCategoryCodeChange(modCode);
                      const validSubs = getSubCategoriesForModuleAndState(modCode, stateCode);
                      if (validSubs.length > 0) {
                        onSubCategoryChange(validSubs[0].code);
                        onBoardGradeChange(validSubs[0].title);
                      } else {
                        onSubCategoryChange('');
                        onBoardGradeChange('');
                      }
                      onStreamChange('');
                    }}
                    style={{ padding: '9px 12px', fontSize: '0.85rem', fontWeight: '600' }}
                  >
                    {CORE_MODULES_LIST.map((mod) => (
                      <option key={mod.code} value={mod.code}>
                        {mod.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '5px', display: 'block' }}>
                    Course / Board Target (Level 3) *
                  </label>
                  <select
                    className="form-input"
                    value={subCategory}
                    onChange={(e) => {
                      const subCode = e.target.value;
                      onSubCategoryChange(subCode);
                      const validSubs = getSubCategoriesForModuleAndState(categoryCode, stateCode);
                      const targetSub = validSubs.find((s) => s.code === subCode);
                      if (targetSub) {
                        onBoardGradeChange(targetSub.title);
                      }
                      onStreamChange('');
                    }}
                    style={{ padding: '9px 12px', fontSize: '0.85rem' }}
                  >
                    {validSubCategories.map((sub) => (
                      <option key={sub.code} value={sub.code}>
                        {sub.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '5px', display: 'block' }}>
                    Grade / Display Batch Subtitle
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={boardGrade}
                    onChange={(e) => onBoardGradeChange(e.target.value)}
                    placeholder="e.g. CBSE Class 10th / IIT JEE 2026"
                    style={{ padding: '9px 12px', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              {/* Stream Selector (conditionally rendered) */}
              {selectedSubCategoryItem?.hasStreams && (
                <div style={{ background: 'rgba(99, 102, 241, 0.05)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#818CF8', marginBottom: '5px', display: 'block' }}>
                    Senior Secondary Stream (+1 & +2) *
                  </label>
                  <select
                    className="form-input"
                    value={stream}
                    onChange={(e) => onStreamChange(e.target.value)}
                    style={{ padding: '9px 12px', fontSize: '0.85rem', fontWeight: '700' }}
                  >
                    <option value="">-- Select Stream --</option>
                    <option value="Arts Stream (Subjects 1–6)">Arts Stream (Subjects 1–6)</option>
                    <option value="Commerce Stream (Subjects 1–6)">Commerce Stream (Subjects 1–6)</option>
                    <option value="Science Stream (Subjects 1–6)">Science Stream (Subjects 1–6)</option>
                  </select>
                </div>
              )}

              {/* Target Subject Focus */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '5px', display: 'block' }}>
                  Target Subject Focus (Level 5) *
                </label>
                <select
                  className="form-input"
                  value={subjectName}
                  onChange={(e) => {
                    onSubjectNameChange(e.target.value);
                  }}
                  style={{ padding: '9px 12px', fontSize: '0.88rem', fontWeight: '700', color: '#F59E0B' }}
                >
                  {getSubjectsForStateAndModule(stateCode).map((sbj) => (
                    <option key={sbj} value={sbj}>
                      {sbj}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 2: DELIVERY FORMAT, CUSTOM TOPICS & LINKS                 */}
          {/* ============================================================== */}
          {currentStep === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Interactive Delivery Mode Selector Cards */}
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>
                  Select Course Delivery Format *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                  {[
                    { mode: 'LIVE_ONLINE', label: 'Live Online Class', desc: 'Real-time interactive live sessions on Zoom or Meet', icon: Radio, color: '#E11D48' },
                    { mode: 'RECORDED_VIDEO', label: 'Recorded Video Course', desc: 'Pre-recorded on-demand video lectures & playlist', icon: Video, color: '#4F46E5' },
                    { mode: 'HYBRID', label: 'Hybrid (Live + Recorded)', desc: 'Full video vault plus scheduled live doubt classes', icon: Sparkles, color: '#10B981' }
                  ].map((fmt) => {
                    const isSelected = courseMode === fmt.mode;
                    const Icon = fmt.icon;

                    return (
                      <div
                        key={fmt.mode}
                        onClick={() => onCourseModeChange(fmt.mode as any)}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '12px',
                          border: isSelected ? `2px solid ${fmt.color}` : '1px solid var(--border-color)',
                          background: isSelected ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-surface)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: fmt.color, fontWeight: '800', fontSize: '0.85rem' }}>
                            <Icon size={16} />
                            <span>{fmt.label}</span>
                          </div>
                          {isSelected && (
                            <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: fmt.color, color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Check size={12} />
                            </span>
                          )}
                        </div>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                          {fmt.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Infinite Syllabus Topics Builder */}
              <div
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '14px',
                  padding: '14px 16px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="badge badge-primary" style={{ fontSize: '0.68rem', padding: '2px 8px', fontWeight: '800' }}>
                      <Layers size={11} style={{ marginRight: '4px' }} /> SYLLABUS TOPICS
                    </span>
                    <span style={{ fontSize: '0.84rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                      What will students learn in this batch? ({syllabusTopics.length})
                    </span>
                  </div>

                  {syllabusTopics.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllTopics}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        fontSize: '0.74rem',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {/* Topic Input with Comma-Separated Support */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  <input
                    type="text"
                    className="form-input"
                    value={customTopicInput}
                    onChange={(e) => setCustomTopicInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTopic();
                      }
                    }}
                    placeholder="Type topic name or paste comma-separated (e.g. Algebra, Trigonometry, Optics) & press Enter..."
                    style={{ padding: '8px 12px', fontSize: '0.84rem', flex: 1 }}
                  />
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={handleAddTopic}
                    style={{ fontSize: '0.78rem', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}
                  >
                    <Plus size={14} /> Add Topic
                  </button>
                </div>

                {/* Dynamic Topic Chips */}
                {syllabusTopics.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '110px', overflowY: 'auto', padding: '2px' }}>
                    {syllabusTopics.map((topic) => (
                      <span
                        key={topic}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          borderRadius: '16px',
                          fontSize: '0.76rem',
                          fontWeight: '600',
                          background: 'rgba(99, 102, 241, 0.16)',
                          border: '1px solid rgba(99, 102, 241, 0.35)',
                          color: 'var(--text-primary)'
                        }}
                      >
                        <span>#{topic}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTopic(topic)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title="Remove topic"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    💡 Tip: Add key chapter topics so students and parents can see the complete roadmap.
                  </div>
                )}
              </div>

              {/* Video & Live URL Deliverables in Clean 2-Column Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
                {/* 1. Video Vault Details */}
                <div style={{ background: 'var(--bg-surface)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#818CF8', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Video size={15} /> Video Lectures & Stream URL
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>
                        Total Lectures
                      </label>
                      <input
                        type="number"
                        className="form-input"
                        value={inclusions.totalLectures || ''}
                        onChange={(e) => handleInclusionUpdate('totalLectures', Number(e.target.value) || 0)}
                        placeholder="e.g. 40"
                        style={{ padding: '6px 8px', fontSize: '0.82rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>
                        Total Hours
                      </label>
                      <input
                        type="number"
                        className="form-input"
                        value={inclusions.totalHours || ''}
                        onChange={(e) => handleInclusionUpdate('totalHours', Number(e.target.value) || 0)}
                        placeholder="e.g. 50"
                        style={{ padding: '6px 8px', fontSize: '0.82rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '8px' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>
                      Playlist / Video URL
                    </label>
                    <input
                      type="url"
                      className="form-input"
                      value={lectureVideoUrl}
                      onChange={(e) => onLectureVideoUrlChange(e.target.value)}
                      placeholder="https://youtube.com/playlist?... or private stream"
                      style={{ padding: '6px 8px', fontSize: '0.82rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: '700', color: '#10B981', display: 'block', marginBottom: '3px' }}>
                      Free Demo Video Link (Preview)
                    </label>
                    <input
                      type="url"
                      className="form-input"
                      value={demoVideoUrl}
                      onChange={(e) => onDemoVideoUrlChange(e.target.value)}
                      placeholder="https://youtube.com/watch?v=... (Free for all)"
                      style={{ padding: '6px 8px', fontSize: '0.82rem' }}
                    />
                  </div>
                </div>

                {/* 2. Live Interactive Classroom Details */}
                <div style={{ background: 'var(--bg-surface)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#34D399', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Radio size={15} /> Live Classroom (Zoom / Meet)
                  </div>

                  <div style={{ marginBottom: '8px' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>
                      Live Meeting URL
                    </label>
                    <input
                      type="url"
                      className="form-input"
                      value={liveMeetingUrl}
                      onChange={(e) => onLiveMeetingUrlChange(e.target.value)}
                      placeholder="https://meet.google.com/... or zoom.us/j/..."
                      style={{ padding: '6px 8px', fontSize: '0.82rem' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>
                        Class Schedule Timing
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        value={liveSchedule}
                        onChange={(e) => onLiveScheduleChange(e.target.value)}
                        placeholder="e.g. Mon, Wed & Fri @ 7 PM"
                        style={{ padding: '6px 8px', fontSize: '0.82rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>
                        Live Sessions
                      </label>
                      <input
                        type="number"
                        className="form-input"
                        value={inclusions.totalLiveSessions || ''}
                        onChange={(e) => handleInclusionUpdate('totalLiveSessions', Number(e.target.value) || 0)}
                        placeholder="e.g. 15"
                        style={{ padding: '6px 8px', fontSize: '0.82rem' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 3: STUDY MATERIALS, MOCK TESTS & PERKS                    */}
          {/* ============================================================== */}
          {currentStep === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Step 3 Sub-Navigation Tabs */}
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  borderBottom: '1px solid var(--border-color)',
                  paddingBottom: '12px',
                  flexWrap: 'wrap',
                  alignItems: 'center'
                }}
              >
                <button
                  type="button"
                  onClick={() => setStep3ActiveTab('DOCS')}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '10px',
                    fontSize: '0.82rem',
                    fontWeight: '700',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    background: step3ActiveTab === 'DOCS' ? '#F59E0B' : 'var(--bg-surface)',
                    color: step3ActiveTab === 'DOCS' ? '#FFFFFF' : 'var(--text-secondary)',
                    boxShadow: step3ActiveTab === 'DOCS' ? '0 4px 12px rgba(245, 158, 11, 0.3)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <BookOpen size={16} />
                  <span>📚 E-Books & Study Notes</span>
                  <span
                    style={{
                      background: step3ActiveTab === 'DOCS' ? 'rgba(0,0,0,0.25)' : 'var(--bg-card)',
                      color: step3ActiveTab === 'DOCS' ? '#FFF' : 'var(--text-muted)',
                      padding: '2px 7px',
                      borderRadius: '999px',
                      fontSize: '0.72rem',
                      fontWeight: '800'
                    }}
                  >
                    {studyMaterials.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep3ActiveTab('TESTS')}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '10px',
                    fontSize: '0.82rem',
                    fontWeight: '700',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    background: step3ActiveTab === 'TESTS' ? '#EC4899' : 'var(--bg-surface)',
                    color: step3ActiveTab === 'TESTS' ? '#FFFFFF' : 'var(--text-secondary)',
                    boxShadow: step3ActiveTab === 'TESTS' ? '0 4px 12px rgba(236, 72, 153, 0.3)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <FileText size={16} />
                  <span>📝 Topic-Wise MCQ Tests</span>
                  <span
                    style={{
                      background: step3ActiveTab === 'TESTS' ? 'rgba(0,0,0,0.25)' : 'var(--bg-card)',
                      color: step3ActiveTab === 'TESTS' ? '#FFF' : 'var(--text-muted)',
                      padding: '2px 7px',
                      borderRadius: '999px',
                      fontSize: '0.72rem',
                      fontWeight: '800'
                    }}
                  >
                    {mockTests.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep3ActiveTab('PERKS')}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '10px',
                    fontSize: '0.82rem',
                    fontWeight: '700',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    background: step3ActiveTab === 'PERKS' ? '#10B981' : 'var(--bg-surface)',
                    color: step3ActiveTab === 'PERKS' ? '#FFFFFF' : 'var(--text-secondary)',
                    boxShadow: step3ActiveTab === 'PERKS' ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Award size={16} />
                  <span>⭐ Perks & Curriculum</span>
                </button>
              </div>

              {/* ========================================================== */}
              {/* SUB-TAB 1: MULTI-DOCUMENT STUDY MATERIALS (PDF/DOC)        */}
              {/* ========================================================== */}
              {step3ActiveTab === 'DOCS' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Add Document Card */}
                  <div
                    style={{
                      background: 'var(--bg-surface)',
                      padding: '16px',
                      borderRadius: '14px',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div style={{ fontSize: '0.84rem', fontWeight: '800', color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Plus size={16} /> Add Study Material / PDF / Document
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Add multiple files topic-wise for students
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '10px' }}>
                      {/* Document Title */}
                      <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ fontSize: '0.74rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                          Document / Notes Title *
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          value={newDocTitle}
                          onChange={(e) => setNewDocTitle(e.target.value)}
                          placeholder="e.g. Chapter 1: Formula Sheet & Derivations, or Complete NCERT Solution PDF"
                          style={{ padding: '7px 10px', fontSize: '0.82rem' }}
                        />
                      </div>

                      {/* Document Format */}
                      <div>
                        <label style={{ fontSize: '0.74rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                          Format / Type
                        </label>
                        <select
                          className="form-input"
                          value={newDocType}
                          onChange={(e) => setNewDocType(e.target.value as any)}
                          style={{ padding: '7px 10px', fontSize: '0.82rem' }}
                        >
                          <option value="PDF">📄 PDF Document</option>
                          <option value="DOC">📝 Word / DOCX</option>
                          <option value="NOTES">✍️ Handwritten Notes</option>
                          <option value="EBOOK">📚 Complete E-Book</option>
                        </select>
                      </div>

                      {/* Topic Association */}
                      <div>
                        <label style={{ fontSize: '0.74rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                          Associated Topic
                        </label>
                        <select
                          className="form-input"
                          value={newDocTopic}
                          onChange={(e) => setNewDocTopic(e.target.value)}
                          style={{ padding: '7px 10px', fontSize: '0.82rem' }}
                        >
                          <option value="General">All Topics / Course-Wide</option>
                          {syllabusTopics.map((topic, i) => (
                            <option key={i} value={topic}>#{topic}</option>
                          ))}
                          <option value="__CUSTOM__">✍️ Custom Topic...</option>
                        </select>
                      </div>
                    </div>

                    {newDocTopic === '__CUSTOM__' && (
                      <div style={{ marginBottom: '10px' }}>
                        <label style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                          Custom Topic Name *
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          value={newDocCustomTopic}
                          onChange={(e) => setNewDocCustomTopic(e.target.value)}
                          placeholder="e.g. Chemical Bonding, Electrostatics..."
                          style={{ padding: '6px 10px', fontSize: '0.82rem' }}
                        />
                      </div>
                    )}

                    {/* Download / Drive URL & Add Button */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px', alignItems: 'end' }}>
                      <div>
                        <label style={{ fontSize: '0.74rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                          File Download / Cloud URL (Google Drive, Dropbox, AWS S3, etc.) *
                        </label>
                        <input
                          type="url"
                          className="form-input"
                          value={newDocUrl}
                          onChange={(e) => setNewDocUrl(e.target.value)}
                          placeholder="https://drive.google.com/file/d/... or https://..."
                          style={{ padding: '7px 10px', fontSize: '0.82rem' }}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleAddStudyMaterial}
                        style={{
                          background: '#F59E0B',
                          color: '#FFFFFF',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
                        }}
                      >
                        <Plus size={15} /> Add Document
                      </button>
                    </div>
                  </div>

                  {/* Legacy E-Book Helper Banner */}
                  {ebookPdfUrl && studyMaterials.length === 0 && (
                    <div
                      style={{
                        background: 'rgba(245, 158, 11, 0.08)',
                        border: '1px dashed #F59E0B',
                        borderRadius: '10px',
                        padding: '10px 14px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.78rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#D97706' }}>
                        <AlertCircle size={16} />
                        <span>
                          Existing single E-Book link detected: <strong>{ebookTitle || 'Course E-Book'}</strong> ({ebookPdfUrl})
                        </span>
                      </div>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => {
                          const item: CourseStudyMaterialItem = {
                            title: ebookTitle || 'Course E-Book',
                            docType: 'EBOOK',
                            topic: 'General',
                            fileUrl: ebookPdfUrl
                          };
                          const updated = [...studyMaterials, item];
                          if (onStudyMaterialsChange) onStudyMaterialsChange(updated);
                          handleInclusionUpdate('totalEbooks', updated.length);
                        }}
                        style={{ fontSize: '0.72rem', padding: '4px 10px' }}
                      >
                        + Migrate into Documents List
                      </button>
                    </div>
                  )}

                  {/* Documents List */}
                  <div
                    style={{
                      background: 'var(--bg-surface)',
                      borderRadius: '14px',
                      border: '1px solid var(--border-color)',
                      padding: '14px 16px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <BookOpen size={16} style={{ color: '#F59E0B' }} />
                        <span>Attached Study Documents & E-Books ({studyMaterials.length})</span>
                      </div>
                      <span className="badge badge-amber" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                        Auto-updates Total PDFs ({studyMaterials.length})
                      </span>
                    </div>

                    {studyMaterials.length === 0 ? (
                      <div
                        style={{
                          textAlign: 'center',
                          padding: '24px 16px',
                          color: 'var(--text-muted)',
                          fontSize: '0.8rem',
                          background: 'var(--bg-card)',
                          borderRadius: '10px',
                          border: '1px dashed var(--border-color)'
                        }}
                      >
                        <BookOpen size={28} style={{ opacity: 0.3, margin: '0 auto 8px auto', display: 'block' }} />
                        No documents added yet. Use the form above to add chapter-wise PDFs, revision notes, or reference docs.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {studyMaterials.map((doc, idx) => {
                          const typeBadgeBg =
                            doc.docType === 'PDF' ? '#EF4444' :
                            doc.docType === 'DOC' ? '#3B82F6' :
                            doc.docType === 'NOTES' ? '#F59E0B' : '#8B5CF6';

                          return (
                            <div
                              key={idx}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: 'var(--bg-card)',
                                padding: '10px 14px',
                                borderRadius: '10px',
                                border: '1px solid var(--border-color)',
                                gap: '10px'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                                <span
                                  style={{
                                    background: typeBadgeBg,
                                    color: '#FFF',
                                    fontSize: '0.66rem',
                                    fontWeight: '800',
                                    padding: '3px 8px',
                                    borderRadius: '6px',
                                    flexShrink: 0
                                  }}
                                >
                                  {doc.docType || 'PDF'}
                                </span>
                                <div style={{ minWidth: 0 }}>
                                  <div
                                    style={{
                                      fontSize: '0.82rem',
                                      fontWeight: '700',
                                      color: 'var(--text-primary)',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap'
                                    }}
                                  >
                                    {doc.title}
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                                    <span
                                      style={{
                                        fontSize: '0.68rem',
                                        color: '#818CF8',
                                        background: 'rgba(129, 140, 248, 0.1)',
                                        padding: '1px 6px',
                                        borderRadius: '4px',
                                        fontWeight: '600'
                                      }}
                                    >
                                      #{doc.topic || 'General'}
                                    </span>
                                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '240px' }}>
                                      {doc.fileUrl}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                                <a
                                  href={doc.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{
                                    fontSize: '0.74rem',
                                    color: '#3B82F6',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    textDecoration: 'none',
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    background: 'rgba(59, 130, 246, 0.1)'
                                  }}
                                  title="Test link in new tab"
                                >
                                  <ExternalLink size={13} /> Open
                                </a>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveStudyMaterial(idx)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#FB7185',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    borderRadius: '4px'
                                  }}
                                  title="Remove Document"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ========================================================== */}
              {/* SUB-TAB 2: TOPIC-WISE MCQ TESTS & QUIZZES                  */}
              {/* ========================================================== */}
              {step3ActiveTab === 'TESTS' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Create Mock Test Card */}
                  <div
                    style={{
                      background: 'var(--bg-surface)',
                      padding: '16px',
                      borderRadius: '14px',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div style={{ fontSize: '0.84rem', fontWeight: '800', color: '#EC4899', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Plus size={16} /> Create Topic Mock Test / MCQ Quiz
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Build questions topic-wise with answer keys
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '10px' }}>
                      {/* Test Title */}
                      <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ fontSize: '0.74rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                          Mock Test / Quiz Title *
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          value={newTestTitle}
                          onChange={(e) => setNewTestTitle(e.target.value)}
                          placeholder="e.g. Chapter 1: Chemical Reactions Topic Quiz (MCQ)"
                          style={{ padding: '7px 10px', fontSize: '0.82rem' }}
                        />
                      </div>

                      {/* Topic Selector */}
                      <div>
                        <label style={{ fontSize: '0.74rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                          Topic / Chapter
                        </label>
                        <select
                          className="form-input"
                          value={newTestTopic}
                          onChange={(e) => setNewTestTopic(e.target.value)}
                          style={{ padding: '7px 10px', fontSize: '0.82rem' }}
                        >
                          <option value="All Topics">All Topics / Full Syllabus</option>
                          {syllabusTopics.map((topic, i) => (
                            <option key={i} value={topic}>#{topic}</option>
                          ))}
                          <option value="__CUSTOM__">✍️ Custom Topic...</option>
                        </select>
                      </div>

                      {/* Duration */}
                      <div>
                        <label style={{ fontSize: '0.74rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                          Duration (Minutes)
                        </label>
                        <input
                          type="number"
                          className="form-input"
                          value={newTestDuration}
                          onChange={(e) => setNewTestDuration(e.target.value)}
                          placeholder="30"
                          style={{ padding: '7px 10px', fontSize: '0.82rem' }}
                        />
                      </div>

                      {/* Questions Count */}
                      <div>
                        <label style={{ fontSize: '0.74rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                          Total Questions Count
                        </label>
                        <input
                          type="number"
                          className="form-input"
                          value={draftQuestions.length > 0 ? draftQuestions.length : newTestTotalQuestions}
                          onChange={(e) => setNewTestTotalQuestions(e.target.value)}
                          disabled={draftQuestions.length > 0}
                          placeholder="10"
                          style={{ padding: '7px 10px', fontSize: '0.82rem' }}
                        />
                      </div>
                    </div>

                    {newTestTopic === '__CUSTOM__' && (
                      <div style={{ marginBottom: '10px' }}>
                        <label style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                          Custom Topic Name *
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          value={newTestCustomTopic}
                          onChange={(e) => setNewTestCustomTopic(e.target.value)}
                          placeholder="e.g. Thermodynamics, Optics..."
                          style={{ padding: '6px 10px', fontSize: '0.82rem' }}
                        />
                      </div>
                    )}

                    {/* Test Online Paper URL (Optional) */}
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ fontSize: '0.74rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                        Online Test Portal / Google Form URL (Optional)
                      </label>
                      <input
                        type="url"
                        className="form-input"
                        value={newTestUrl}
                        onChange={(e) => setNewTestUrl(e.target.value)}
                        placeholder="https://forms.gle/... or external exam link (or build MCQ questions below)"
                        style={{ padding: '7px 10px', fontSize: '0.82rem' }}
                      />
                    </div>

                    {/* Inline MCQ Question Builder (Collapsible / Interactive) */}
                    <div
                      style={{
                        background: 'var(--bg-card)',
                        borderRadius: '10px',
                        border: '1px solid var(--border-color)',
                        padding: '12px',
                        marginBottom: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#EC4899' }}>
                            ✍️ Built-in MCQ Question Bank Builder
                          </span>
                          <span className="badge badge-rose" style={{ fontSize: '0.66rem', padding: '1px 6px' }}>
                            {draftQuestions.length} Questions Drafted
                          </span>
                        </div>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => setShowQuestionBuilder(!showQuestionBuilder)}
                          style={{ fontSize: '0.72rem', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          {showQuestionBuilder ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          {showQuestionBuilder ? 'Hide Question Form' : '+ Add Question (A/B/C/D)'}
                        </button>
                      </div>

                      {showQuestionBuilder && (
                        <div style={{ marginTop: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                          {/* Question Text */}
                          <div style={{ marginBottom: '10px' }}>
                            <label style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>
                              Question Text *
                            </label>
                            <textarea
                              rows={2}
                              className="form-input"
                              value={qText}
                              onChange={(e) => setQText(e.target.value)}
                              placeholder="e.g. Which of the following is an endothermic reaction?"
                              style={{ padding: '6px 10px', fontSize: '0.82rem' }}
                            />
                          </div>

                          {/* 4 Options Grid */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginBottom: '10px' }}>
                            <div>
                              <label style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>
                                Option A *
                              </label>
                              <input
                                type="text"
                                className="form-input"
                                value={qOptA}
                                onChange={(e) => setQOptA(e.target.value)}
                                placeholder="Option A text..."
                                style={{ padding: '6px 8px', fontSize: '0.8rem' }}
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>
                                Option B *
                              </label>
                              <input
                                type="text"
                                className="form-input"
                                value={qOptB}
                                onChange={(e) => setQOptB(e.target.value)}
                                placeholder="Option B text..."
                                style={{ padding: '6px 8px', fontSize: '0.8rem' }}
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>
                                Option C
                              </label>
                              <input
                                type="text"
                                className="form-input"
                                value={qOptC}
                                onChange={(e) => setQOptC(e.target.value)}
                                placeholder="Option C text..."
                                style={{ padding: '6px 8px', fontSize: '0.8rem' }}
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>
                                Option D
                              </label>
                              <input
                                type="text"
                                className="form-input"
                                value={qOptD}
                                onChange={(e) => setQOptD(e.target.value)}
                                placeholder="Option D text..."
                                style={{ padding: '6px 8px', fontSize: '0.8rem' }}
                              />
                            </div>
                          </div>

                          {/* Correct Option Selector */}
                          <div style={{ marginBottom: '10px' }}>
                            <label style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                              Select Correct Option:
                            </label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              {[0, 1, 2, 3].map((optIdx) => {
                                const letters = ['A', 'B', 'C', 'D'];
                                const isSelected = qCorrect === optIdx;
                                return (
                                  <button
                                    key={optIdx}
                                    type="button"
                                    onClick={() => setQCorrect(optIdx)}
                                    style={{
                                      padding: '5px 12px',
                                      borderRadius: '6px',
                                      border: isSelected ? '1px solid #10B981' : '1px solid var(--border-color)',
                                      background: isSelected ? '#10B981' : 'var(--bg-surface)',
                                      color: isSelected ? '#FFF' : 'var(--text-secondary)',
                                      fontSize: '0.74rem',
                                      fontWeight: '700',
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}
                                  >
                                    {isSelected && <Check size={12} />}
                                    Option {letters[optIdx]}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Explanation */}
                          <div style={{ marginBottom: '10px' }}>
                            <label style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>
                              Explanation / Solution Hint (Optional)
                            </label>
                            <input
                              type="text"
                              className="form-input"
                              value={qExplanation}
                              onChange={(e) => setQExplanation(e.target.value)}
                              placeholder="e.g. Photosynthesis requires sunlight energy, making it endothermic."
                              style={{ padding: '6px 8px', fontSize: '0.78rem' }}
                            />
                          </div>

                          <button
                            type="button"
                            onClick={handleAddQuestionToDraft}
                            style={{
                              background: '#EC4899',
                              color: '#FFF',
                              border: 'none',
                              padding: '6px 14px',
                              borderRadius: '6px',
                              fontSize: '0.78rem',
                              fontWeight: '700',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <Plus size={14} /> Add Question to Test Draft
                          </button>
                        </div>
                      )}

                      {/* Draft Questions List */}
                      {draftQuestions.length > 0 && (
                        <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '140px', overflowY: 'auto' }}>
                          {draftQuestions.map((q, qIdx) => {
                            const letters = ['A', 'B', 'C', 'D'];
                            return (
                              <div
                                key={qIdx}
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  background: 'var(--bg-surface)',
                                  padding: '6px 10px',
                                  borderRadius: '6px',
                                  fontSize: '0.74rem',
                                  border: '1px solid var(--border-color)'
                                }}
                              >
                                <span>
                                  <strong>Q{qIdx + 1}.</strong> {q.questionText}
                                  <span style={{ color: '#10B981', marginLeft: '8px', fontWeight: '700' }}>
                                    [Correct: {letters[q.correctOption || 0]}]
                                  </span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveQuestionFromDraft(qIdx)}
                                  style={{ background: 'none', border: 'none', color: '#FB7185', cursor: 'pointer', padding: 0 }}
                                  title="Delete question"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Save Mock Test Button */}
                    <button
                      type="button"
                      onClick={handleSaveMockTest}
                      style={{
                        background: '#EC4899',
                        color: '#FFFFFF',
                        border: 'none',
                        padding: '9px 18px',
                        borderRadius: '8px',
                        fontSize: '0.84rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 10px rgba(236, 72, 153, 0.3)'
                      }}
                    >
                      <Plus size={16} /> Save Mock Test / Quiz to Course
                    </button>
                  </div>

                  {/* Created Mock Tests List */}
                  <div
                    style={{
                      background: 'var(--bg-surface)',
                      borderRadius: '14px',
                      border: '1px solid var(--border-color)',
                      padding: '14px 16px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FileText size={16} style={{ color: '#EC4899' }} />
                        <span>Created Mock Tests & Assessments ({mockTests.length})</span>
                      </div>
                      <span className="badge badge-rose" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                        Auto-updates Total Mock Tests ({mockTests.length})
                      </span>
                    </div>

                    {mockTests.length === 0 ? (
                      <div
                        style={{
                          textAlign: 'center',
                          padding: '24px 16px',
                          color: 'var(--text-muted)',
                          fontSize: '0.8rem',
                          background: 'var(--bg-card)',
                          borderRadius: '10px',
                          border: '1px dashed var(--border-color)'
                        }}
                      >
                        <FileText size={28} style={{ opacity: 0.3, margin: '0 auto 8px auto', display: 'block' }} />
                        No mock tests created yet. Use the form above to add topic-wise quizzes or full mock test papers.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {mockTests.map((test, idx) => {
                          const isExpanded = expandedTestIdx === idx;
                          return (
                            <div
                              key={idx}
                              style={{
                                background: 'var(--bg-card)',
                                borderRadius: '10px',
                                border: '1px solid var(--border-color)',
                                overflow: 'hidden'
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  padding: '10px 14px',
                                  gap: '10px'
                                }}
                              >
                                <div style={{ minWidth: 0, flex: 1 }}>
                                  <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                                    {test.title}
                                  </div>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                                    <span style={{ fontSize: '0.68rem', color: '#EC4899', background: 'rgba(236, 72, 153, 0.1)', padding: '1px 6px', borderRadius: '4px', fontWeight: '600' }}>
                                      #{test.topic || 'All Topics'}
                                    </span>
                                    <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', background: 'var(--bg-surface)', padding: '1px 6px', borderRadius: '4px' }}>
                                      ⏱️ {test.durationMinutes || 30} Mins
                                    </span>
                                    <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', background: 'var(--bg-surface)', padding: '1px 6px', borderRadius: '4px' }}>
                                      ❓ {test.questions && test.questions.length > 0 ? test.questions.length : test.totalQuestions || 10} Questions
                                    </span>
                                  </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                                  {test.testUrl && (
                                    <a
                                      href={test.testUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      style={{
                                        fontSize: '0.74rem',
                                        color: '#3B82F6',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        textDecoration: 'none',
                                        padding: '4px 8px',
                                        borderRadius: '6px',
                                        background: 'rgba(59, 130, 246, 0.1)'
                                      }}
                                    >
                                      <ExternalLink size={13} /> Link
                                    </a>
                                  )}

                                  {test.questions && test.questions.length > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => setExpandedTestIdx(isExpanded ? null : idx)}
                                      className="btn-secondary"
                                      style={{ fontSize: '0.72rem', padding: '4px 8px' }}
                                    >
                                      {isExpanded ? 'Hide' : `Questions (${test.questions.length})`}
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => handleRemoveMockTest(idx)}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: '#FB7185',
                                      cursor: 'pointer',
                                      padding: '4px',
                                      borderRadius: '4px'
                                    }}
                                    title="Delete Mock Test"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              </div>

                              {/* Expanded Questions View */}
                              {isExpanded && test.questions && test.questions.length > 0 && (
                                <div
                                  style={{
                                    borderTop: '1px solid var(--border-color)',
                                    background: 'var(--bg-surface)',
                                    padding: '10px 14px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '8px'
                                  }}
                                >
                                  {test.questions.map((q, qIndex) => {
                                    const letters = ['A', 'B', 'C', 'D'];
                                    return (
                                      <div
                                        key={qIndex}
                                        style={{
                                          background: 'var(--bg-card)',
                                          padding: '8px 10px',
                                          borderRadius: '8px',
                                          border: '1px solid var(--border-color)',
                                          fontSize: '0.74rem'
                                        }}
                                      >
                                        <div style={{ fontWeight: '700', marginBottom: '4px', color: 'var(--text-primary)' }}>
                                          Q{qIndex + 1}. {q.questionText}
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '4px', margin: '4px 0' }}>
                                          {q.options.map((opt, optIndex) => {
                                            const isCorrect = q.correctOption === optIndex;
                                            return (
                                              <span
                                                key={optIndex}
                                                style={{
                                                  padding: '2px 6px',
                                                  borderRadius: '4px',
                                                  background: isCorrect ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-surface)',
                                                  border: isCorrect ? '1px solid #10B981' : '1px solid var(--border-color)',
                                                  color: isCorrect ? '#10B981' : 'var(--text-secondary)',
                                                  fontWeight: isCorrect ? '700' : '400'
                                                }}
                                              >
                                                {letters[optIndex]}. {opt} {isCorrect ? '✓' : ''}
                                              </span>
                                            );
                                          })}
                                        </div>
                                        {q.explanation && (
                                          <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', marginTop: '2px', fontStyle: 'italic' }}>
                                            💡 Hint: {q.explanation}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ========================================================== */}
              {/* SUB-TAB 3: STUDENT PERKS & CURRICULUM BREAKDOWN            */}
              {/* ========================================================== */}
              {step3ActiveTab === 'PERKS' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* 1. Course Perks & Badges (Interactive 2x2 Toggle Cards) */}
                  <div style={{ background: 'var(--bg-surface)', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#10B981', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Award size={16} /> Student Perks & Course Badges
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                      {[
                        { key: 'hasCertificate', label: 'Completion Certificate', desc: 'Verified certificate on batch completion', defaultVal: true },
                        { key: 'hasDoubtSupport', label: '1-on-1 Doubt Support', desc: 'Direct chat/call doubt clearing with teacher', defaultVal: true },
                        { key: 'hasDownloadableNotes', label: 'Downloadable Summary Sheets', desc: 'High-yield PDF cheat sheets & revision maps', defaultVal: true },
                        { key: 'hasLifetimeAccess', label: 'Lifetime Validity Access', desc: 'Student can re-watch lectures anytime', defaultVal: false }
                      ].map((perk) => {
                        const isChecked = (inclusions as any)[perk.key] ?? perk.defaultVal;

                        return (
                          <label
                            key={perk.key}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '10px',
                              padding: '10px 12px',
                              borderRadius: '10px',
                              border: isChecked ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-color)',
                              background: isChecked ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-card)',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => handleInclusionUpdate(perk.key as any, e.target.checked)}
                              style={{ marginTop: '2px' }}
                            />
                            <div>
                              <div style={{ fontSize: '0.78rem', fontWeight: '700', color: isChecked ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                                {perk.label}
                              </div>
                              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                {perk.desc}
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Optional Chapter Breakdown (Collapsible) */}
                  <div
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      padding: '12px 14px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#F59E0B' }}>
                          📚 Course Chapters / Curriculum Breakdown ({curriculum.length})
                        </span>
                      </div>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setShowCurriculumBuilder(!showCurriculumBuilder)}
                        style={{ fontSize: '0.74rem', padding: '4px 10px' }}
                      >
                        {showCurriculumBuilder ? 'Hide Chapters' : '+ Add Modules / Chapters'}
                      </button>
                    </div>

                    {showCurriculumBuilder && (
                      <div style={{ marginTop: '10px' }}>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                          <input
                            type="text"
                            className="form-input"
                            value={newCurriculumTitle}
                            onChange={(e) => setNewCurriculumTitle(e.target.value)}
                            placeholder="Chapter name (e.g. Chapter 1: Chemical Reactions & Equations)..."
                            style={{ padding: '6px 10px', fontSize: '0.82rem', flex: 1 }}
                          />
                          <input
                            type="number"
                            className="form-input"
                            value={newCurriculumLectures}
                            onChange={(e) => setNewCurriculumLectures(e.target.value)}
                            placeholder="Lectures"
                            style={{ padding: '6px 10px', fontSize: '0.82rem', width: '90px' }}
                          />
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={handleAddCurriculumModule}
                            style={{ fontSize: '0.76rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Plus size={13} /> Add
                          </button>
                        </div>

                        {curriculum.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '120px', overflowY: 'auto' }}>
                            {curriculum.map((mod, idx) => (
                              <div
                                key={idx}
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  background: 'var(--bg-card)',
                                  padding: '6px 10px',
                                  borderRadius: '8px',
                                  border: '1px solid var(--border-color)',
                                  fontSize: '0.78rem'
                                }}
                              >
                                <span>
                                  <strong>{idx + 1}. {mod.title}</strong>
                                  <span style={{ color: 'var(--text-muted)', marginLeft: '8px' }}>({mod.lectureCount || 1} Lectures)</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveCurriculumModule(idx)}
                                  style={{ background: 'none', border: 'none', color: '#FB7185', cursor: 'pointer', padding: 0 }}
                                  title="Remove"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 4: PRICING, BANNER & LIVE STUDENT REVIEW                   */}
          {/* ============================================================== */}
          {currentStep === 4 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px', alignItems: 'start' }}>
              {/* LEFT COLUMN: Pricing Inputs, Thumbnail & Description */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Pricing Inputs */}
                <div style={{ background: 'var(--bg-surface)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#10B981', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    💰 Course Batch Pricing Tier
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.74rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                        Offer Price (₹) *
                      </label>
                      <input
                        type="number"
                        className="form-input"
                        value={price}
                        onChange={(e) => onPriceChange(e.target.value)}
                        placeholder="1499"
                        style={{ padding: '8px 10px', fontSize: '0.9rem', fontWeight: '800', color: '#10B981' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.74rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                        Original MRP (₹) *
                      </label>
                      <input
                        type="number"
                        className="form-input"
                        value={originalPrice}
                        onChange={(e) => onOriginalPriceChange(e.target.value)}
                        placeholder="3999"
                        style={{ padding: '8px 10px', fontSize: '0.9rem' }}
                      />
                    </div>
                  </div>

                  {discountPercent > 0 && (
                    <div style={{ marginTop: '8px', fontSize: '0.74rem', color: '#10B981', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="badge badge-emerald" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                        {discountPercent}% OFF
                      </span>
                      <span>Students save ₹{mrpPriceNum - offerPriceNum} on this batch!</span>
                    </div>
                  )}
                </div>

                {/* Thumbnail Upload */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block' }}>
                      📸 Course Thumbnail / Banner Image
                    </label>
                    <span className="badge badge-amber" style={{ fontSize: '0.66rem', padding: '1px 6px' }}>
                      MAX 2MB
                    </span>
                  </div>

                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={onThumbnailFileChange}
                    className="form-input"
                    style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                  />
                </div>

                {/* Description */}
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                    Course Description & Highlights *
                  </label>
                  <textarea
                    className="form-input"
                    rows={4}
                    value={description}
                    onChange={(e) => onDescriptionChange(e.target.value)}
                    placeholder="Comprehensive batch covering syllabus, revision tests, and live doubt sessions..."
                    style={{ padding: '8px 10px', fontSize: '0.82rem', resize: 'vertical' }}
                  />
                </div>
              </div>

              {/* RIGHT COLUMN: REALISTIC LIVE STUDENT PREVIEW CARD */}
              <div style={{ background: 'var(--bg-surface)', padding: '14px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.76rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Eye size={14} /> LIVE STUDENT STORE PREVIEW
                </div>

                <div
                  style={{
                    background: 'var(--bg-card)',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-card)'
                  }}
                >
                  {/* Banner Image Preview */}
                  <div style={{ position: 'relative', height: '140px', background: 'rgba(0,0,0,0.1)' }}>
                    <img
                      src={
                        thumbnailPreview ||
                        thumbnailUrl ||
                        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80'
                      }
                      alt="Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', top: '8px', left: '8px', display: 'flex', gap: '6px' }}>
                      <span
                        className={courseMode === 'LIVE_ONLINE' ? 'badge badge-rose' : 'badge badge-primary'}
                        style={{ fontSize: '0.64rem', padding: '2px 6px', fontWeight: '800' }}
                      >
                        {courseMode === 'LIVE_ONLINE' ? '🔴 LIVE ONLINE' : courseMode === 'RECORDED_VIDEO' ? '📹 RECORDED' : '⚡ HYBRID'}
                      </span>
                      <span className="badge badge-amber" style={{ fontSize: '0.64rem', padding: '2px 6px', fontWeight: '700' }}>
                        {subjectName || 'Subject'}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div style={{ padding: '12px 14px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                      {boardGrade || selectedBoardTitle} • {selectedStateName}
                    </div>
                    <div style={{ fontSize: '0.92rem', fontWeight: '800', color: 'var(--text-primary)', margin: '4px 0 6px 0', lineHeight: 1.3 }}>
                      {title || 'Course Batch Title Will Appear Here'}
                    </div>

                    {/* Deliverables Pills */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '8px 0', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      <span style={{ background: 'var(--bg-surface)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                        📹 {inclusions.totalLectures || 40} Lectures
                      </span>
                      <span style={{ background: 'var(--bg-surface)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                        📄 {inclusions.totalEbooks || 5} PDFs
                      </span>
                      <span style={{ background: 'var(--bg-surface)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                        📝 {inclusions.totalMockTests || 10} Mock Tests
                      </span>
                    </div>

                    {/* Topics Snapshot */}
                    {syllabusTopics.length > 0 && (
                      <div style={{ fontSize: '0.68rem', color: '#818CF8', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        Topics: {syllabusTopics.slice(0, 3).map(t => `#${t}`).join(' ')} {syllabusTopics.length > 3 ? `+${syllabusTopics.length - 3} more` : ''}
                      </div>
                    )}

                    {/* Price & Mock Enroll Button */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                          <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#10B981' }}>
                            ₹{offerPriceNum || 1499}
                          </span>
                          {mrpPriceNum > offerPriceNum && (
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                              ₹{mrpPriceNum}
                            </span>
                          )}
                        </div>
                      </div>

                      <div
                        style={{
                          background: 'var(--primary-gradient)',
                          color: '#FFF',
                          fontSize: '0.74rem',
                          fontWeight: '800',
                          padding: '6px 14px',
                          borderRadius: '8px',
                          opacity: 0.95
                        }}
                      >
                        Enroll Now
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4. PINNED STICKY FOOTER (ALWAYS VISIBLE - NEVER CUT OFF!) */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 24px',
            borderTop: '1px solid var(--border-color)',
            background: 'var(--bg-card)',
            flexShrink: 0
          }}
        >
          <div>
            <button
              type="button"
              className="btn-secondary"
              onClick={handlePrev}
              disabled={currentStep === 1}
              style={{
                padding: '9px 18px',
                fontSize: '0.84rem',
                opacity: currentStep === 1 ? 0.4 : 1,
                cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <ChevronLeft size={16} /> Back
            </button>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
            Step {currentStep} of 4: <span style={{ color: 'var(--text-primary)' }}>{STEPS[currentStep - 1].title}</span>
          </div>

          <div>
            {currentStep < 4 ? (
              <button
                type="button"
                className="btn-primary"
                onClick={handleNext}
                style={{
                  padding: '9px 22px',
                  fontSize: '0.84rem',
                  fontWeight: '700',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                Continue: {STEPS[currentStep].title} <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="submit"
                className={portalType === 'ADMIN' ? 'btn-rose' : 'btn-emerald'}
                disabled={isSubmitting}
                style={{
                  padding: '10px 26px',
                  fontSize: '0.88rem',
                  fontWeight: '800',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {isSubmitting ? (
                  'Publishing Course...'
                ) : isEditMode ? (
                  '💾 Save Course Changes'
                ) : (
                  '🚀 Publish Course Live'
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );

  if (inline) {
    return content;
  }

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '1020px',
          width: '95vw',
          maxHeight: '88vh',
          height: '760px',
          padding: 0,
          borderRadius: '20px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {content}
      </div>
    </div>
  );
};
