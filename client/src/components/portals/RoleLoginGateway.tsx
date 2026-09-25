import React, { useState } from 'react';
import { ShieldAlert, GraduationCap, Share2, Lock, Mail, Phone, UserCheck, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';
import { loginUser, registerUser, verifyEmailOTP } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

interface RoleLoginGatewayProps {
  onSelectRole: (role: 'ADMIN' | 'TEACHER' | 'STUDENT') => void;
}

export const RoleLoginGateway: React.FC<RoleLoginGatewayProps> = ({ onSelectRole }) => {
  const { login: contextLogin } = useAuth();

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER' | 'EMAIL_OTP'>('LOGIN');
  const [selectedRoleTab, setSelectedRoleTab] = useState<'STUDENT' | 'TEACHER' | 'ADMIN'>('ADMIN');

  // Form Fields (Clean & Empty by default)
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [simulatedOtpText, setSimulatedOtpText] = useState('');
  const [referredBy, setReferredBy] = useState('');

  // UI Feedback
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
      setReferredBy(refCode.trim());
      setMode('REGISTER');
      setSelectedRoleTab('STUDENT');
      setSuccessMsg(`🔗 Referral Link Received! Registering new Student account under sponsor '${refCode.trim()}'.`);
    }
  }, []);

  const handleRoleTabChange = (role: 'STUDENT' | 'TEACHER' | 'ADMIN') => {
    setSelectedRoleTab(role);
    setErrorMsg('');
    setSuccessMsg('');
    setIdentifier('');
    setPassword('');
    setEmail('');
    setMobile('');
    setName('');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!identifier.trim()) {
      setErrorMsg('Please enter your Account Email Address.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    const res = await loginUser(identifier, password);
    setIsSubmitting(false);

    if (res.success && res.data) {
      if (res.data.requiresOtp) {
        setEmail(res.data.email || identifier);
        setSimulatedOtpText(res.data.otpSimulated || '');
        setEmailOtp(res.data.otpSimulated || '');
        setSuccessMsg(`Password verified! 6-Digit OTP sent to email ${res.data.email}`);
        setMode('EMAIL_OTP');
      } else if (res.data.user && res.data.token) {
        const userRole = res.data.user.role;

        // STRICT ROLE-BASED ACCESS CONTROL (RBAC) GUARD
        if (userRole !== selectedRoleTab) {
          setErrorMsg(`⛔ Access Denied: Your account is registered as ${userRole}. You cannot login via the ${selectedRoleTab} portal tab. Please select the ${userRole} tab above.`);
          return;
        }

        contextLogin(res.data.user, res.data.token);
        onSelectRole(userRole as any);
      }
    } else {
      setErrorMsg(res.message || 'Invalid Email / Password combination.');
    }
  };

  const handleVerifyEmailOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!emailOtp.trim() || emailOtp.length !== 6) {
      setErrorMsg('Please enter the 6-digit Email OTP code.');
      return;
    }

    setIsSubmitting(true);
    const res = await verifyEmailOTP(email, emailOtp);
    setIsSubmitting(false);

    if (res.success && res.data) {
      const { user, token } = res.data;

      // STRICT ROLE-BASED ACCESS CONTROL (RBAC) GUARD
      if (user.role !== selectedRoleTab) {
        setErrorMsg(`⛔ Access Denied: Your account is registered as ${user.role}. Please select the ${user.role} tab above.`);
        return;
      }

      contextLogin(user, token);
      setSuccessMsg(`Email OTP Verified! Welcome back, ${user.name}.`);
      setTimeout(() => {
        onSelectRole(user.role as any);
      }, 300);
    } else {
      setErrorMsg(res.message || 'Invalid Email OTP code.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const mobileRegex = /^[6-9]\d{9}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name.trim() || name.trim().length < 2) {
      setErrorMsg('Please enter a valid Full Name (min 2 characters).');
      return;
    }
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setErrorMsg('Please enter a valid Email Address (e.g. name@domain.com).');
      return;
    }
    if (!mobile.trim() || !mobileRegex.test(mobile.trim())) {
      setErrorMsg('Please enter a valid 10-digit Mobile Number (starting with 6-9).');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    const res = await registerUser({
      name,
      mobile,
      password,
      email: email.trim(),
      role: selectedRoleTab,
      referredBy: referredBy ? referredBy.trim() : undefined
    });
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMsg(`Account registered successfully as ${selectedRoleTab}! Logging in...`);
      const loginRes = await loginUser(email, password);
      if (loginRes.success && loginRes.data) {
        if (loginRes.data.user && loginRes.data.token) {
          contextLogin(loginRes.data.user, loginRes.data.token);
          onSelectRole(loginRes.data.user.role);
        }
      }
    } else {
      setErrorMsg(res.message || 'Registration failed. Email or Mobile number may already exist.');
    }
  };

  return (
    <div style={{ maxWidth: '940px', margin: '16px auto', padding: '0 16px' }}>
      {/* Header Banner */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '32px',
          background: '#FFFFFF',
          margin: '0 auto 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
          padding: '6px',
          border: '2px solid #F59E0B'
        }}>
          <img src="/logo.png" alt="Sri Surya Academy" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '4px', letterSpacing: '-0.3px' }}>
          Sri Surya Academy <span className="gradient-text">Management Portals</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: '650px', margin: '0 auto' }}>
          Strict Role-Based Access Control (RBAC). Select your registered portal role below.
        </p>
      </div>

      {/* 3 Core Role Selection Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '20px' }}>
        {/* Student Role */}
        <div
          className="glass-card glass-card-interactive"
          onClick={() => handleRoleTabChange('STUDENT')}
          style={{
            padding: '16px',
            border: selectedRoleTab === 'STUDENT' ? '2px solid var(--primary-accent)' : '1px solid var(--border-color)',
            background: selectedRoleTab === 'STUDENT' ? 'rgba(99,102,241,0.12)' : 'var(--bg-card)',
            textAlign: 'center',
            borderRadius: '14px'
          }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 10px auto',
            color: '#FFF'
          }}>
            <GraduationCap size={20} />
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '4px' }}>1. Student</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.3 }}>Courses, MCQs & Practice Tests</p>
        </div>

        {/* Teacher Role */}
        <div
          className="glass-card glass-card-interactive"
          onClick={() => handleRoleTabChange('TEACHER')}
          style={{
            padding: '16px',
            border: selectedRoleTab === 'TEACHER' ? '2px solid #34D399' : '1px solid var(--border-color)',
            background: selectedRoleTab === 'TEACHER' ? 'rgba(16,185,129,0.12)' : 'var(--bg-card)',
            textAlign: 'center',
            borderRadius: '14px'
          }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'var(--emerald-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 10px auto',
            color: '#FFF'
          }}>
            <GraduationCap size={20} />
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '4px' }}>2. Teacher</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.3 }}>Course Builder & Bulk MCQs</p>
        </div>

        {/* Super Admin Role */}
        <div
          className="glass-card glass-card-interactive"
          onClick={() => handleRoleTabChange('ADMIN')}
          style={{
            padding: '16px',
            border: selectedRoleTab === 'ADMIN' ? '2px solid #FB7185' : '1px solid var(--border-color)',
            background: selectedRoleTab === 'ADMIN' ? 'rgba(244,63,94,0.12)' : 'var(--bg-card)',
            textAlign: 'center',
            borderRadius: '14px'
          }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'var(--rose-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 10px auto',
            color: '#FFF'
          }}>
            <ShieldAlert size={20} />
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '4px' }}>3. Super Admin</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.3 }}>KYC, Approvals & Platform Control</p>
        </div>
      </div>

      {/* Main Login / Register / OTP Card */}
      <div className="glass-card" style={{ maxWidth: '420px', margin: '0 auto', padding: '20px 24px', borderRadius: '16px' }}>
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>
            {mode === 'LOGIN' && `${selectedRoleTab} Account Login`}
            {mode === 'EMAIL_OTP' && `Enter Email OTP Code`}
            {mode === 'REGISTER' && `Create New ${selectedRoleTab}`}
          </h2>
        </div>

        {/* Mode Toggle Tabs */}
        {mode !== 'EMAIL_OTP' && (
          <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', background: 'rgba(255,255,255,0.03)', padding: '3px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <button
              onClick={() => { setMode('LOGIN'); setErrorMsg(''); setSuccessMsg(''); }}
              style={{
                flex: 1,
                padding: '7px 12px',
                borderRadius: '7px',
                border: 'none',
                background: mode === 'LOGIN' ? 'var(--primary-gradient)' : 'transparent',
                color: mode === 'LOGIN' ? '#FFF' : 'var(--text-secondary)',
                fontWeight: '700',
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              Email Login
            </button>
            <button
              onClick={() => { setMode('REGISTER'); setErrorMsg(''); setSuccessMsg(''); }}
              style={{
                flex: 1,
                padding: '7px 12px',
                borderRadius: '7px',
                border: 'none',
                background: mode === 'REGISTER' ? 'var(--primary-gradient)' : 'transparent',
                color: mode === 'REGISTER' ? '#FFF' : 'var(--text-secondary)',
                fontWeight: '700',
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              Register Account
            </button>
          </div>
        )}

        {/* Feedback Alert Banners */}
        {errorMsg && (
          <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.4)', color: '#FB7185', fontSize: '0.8rem', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', color: '#34D399', fontSize: '0.8rem', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={14} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* STEP 1: EMAIL + PASSWORD LOGIN FORM */}
        {mode === 'LOGIN' && (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                {selectedRoleTab} Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-input"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={`Enter ${selectedRoleTab.toLowerCase()} email...`}
                  style={{ paddingLeft: '38px', padding: '8px 12px 8px 38px', fontSize: '0.88rem' }}
                />
                <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '10px' }} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password..."
                  style={{ paddingLeft: '38px', padding: '8px 12px 8px 38px', fontSize: '0.88rem' }}
                />
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '10px' }} />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
              style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: '0.9rem', marginTop: '4px' }}
            >
              <KeyRound size={16} />
              {isSubmitting ? 'Authenticating...' : `Login as ${selectedRoleTab}`}
            </button>
          </form>
        )}

        {/* STEP 2: 6-DIGIT EMAIL OTP VERIFICATION FORM */}
        {mode === 'EMAIL_OTP' && (
          <form onSubmit={handleVerifyEmailOtpSubmit} style={{ textAlign: 'center', padding: '4px 0' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '12px' }}>
              OTP sent to <strong style={{ color: '#FFF' }}>{email}</strong>
            </p>

            {simulatedOtpText && (
              <div style={{ background: 'rgba(52, 211, 153, 0.1)', border: '1px dashed #34D399', borderRadius: '8px', padding: '8px', marginBottom: '14px', color: '#34D399', fontSize: '0.82rem', fontWeight: '700' }}>
                🔑 Email OTP Code: <strong style={{ letterSpacing: '4px', fontSize: '1rem' }}>{simulatedOtpText}</strong>
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
                Enter 6-Digit Email OTP
              </label>
              <input
                type="text"
                maxLength={6}
                value={emailOtp}
                onChange={(e) => setEmailOtp(e.target.value)}
                placeholder="123456"
                className="form-input"
                style={{ textAlign: 'center', fontSize: '1.4rem', fontWeight: '800', letterSpacing: '6px', padding: '8px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => { setMode('LOGIN'); setErrorMsg(''); setSuccessMsg(''); }}
                style={{ flex: 1, padding: '9px', fontSize: '0.82rem' }}
              >
                Back
              </button>
              <button
                type="submit"
                className="btn-emerald"
                disabled={isSubmitting}
                style={{ flex: 2, justifyContent: 'center', padding: '9px', fontSize: '0.85rem' }}
              >
                <CheckCircle2 size={16} />
                {isSubmitting ? 'Authenticating...' : `Verify OTP & Enter`}
              </button>
            </div>
          </form>
        )}

        {/* REGISTER FORM */}
        {mode === 'REGISTER' && (
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '3px', display: 'block' }}>
                Full Name
              </label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Vikram Sharma"
                style={{ padding: '7px 10px', fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '3px', display: 'block' }}>
                Account Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. complaintwork2@gmail.com"
                  style={{ paddingLeft: '36px', padding: '7px 10px 7px 36px', fontSize: '0.85rem' }}
                />
                <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '9px' }} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '3px', display: 'block' }}>
                10-Digit Mobile Number
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="e.g. 9900000000"
                  style={{ paddingLeft: '36px', padding: '7px 10px 7px 36px', fontSize: '0.85rem' }}
                />
                <Phone size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '9px' }} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '3px', display: 'block' }}>
                Password (min 6 chars)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Set password..."
                  style={{ paddingLeft: '36px', padding: '7px 10px 7px 36px', fontSize: '0.85rem' }}
                />
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '9px' }} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#FBBF24', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Share2 size={13} /> Referral Sponsor Code (Optional / Auto-filled)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  value={referredBy}
                  onChange={(e) => setReferredBy(e.target.value)}
                  placeholder="e.g. REF-ZFZV3 / EDU-99201"
                  style={{ paddingLeft: '36px', padding: '7px 10px 7px 36px', fontSize: '0.85rem', color: '#FBBF24', fontWeight: '700' }}
                />
                <Share2 size={16} color="#FBBF24" style={{ position: 'absolute', left: '10px', top: '9px' }} />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
              style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: '0.88rem', marginTop: '4px' }}
            >
              <UserCheck size={16} />
              {isSubmitting ? 'Registering...' : `Register New ${selectedRoleTab}`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
