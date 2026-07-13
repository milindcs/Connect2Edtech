import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../shared/AuthContext";
import {
  validateSignup,
  passwordStrength,
} from "../../shared/authValidation";

const STORAGE_KEY = "signup_form_data";

function dashboardForRole(role) {
  switch (role) {
    case "admin":
      return "/admin";
    case "hr":
      return "/hr";
    case "student":
      return "/student";
    default:
      return "/";
  }
}

function PasswordInput({
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
  autoComplete,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="field">
      <label className="field-label">{label}</label>

      <div className="input-wrapper">
        <input
          type={visible ? "text" : "password"}
          name={name}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          autoComplete={autoComplete}
          className={error ? "input-error" : ""}
        />

        <button
          type="button"
          className="password-toggle"
          onClick={() => setVisible(!visible)}
        >
          {visible ? "🙈" : "👁"}
        </button>
      </div>

      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

export default function SignupPage() {
  const navigate = useNavigate();

  const {
    signup,
    verifyOtp,
    resendOtp,
    googleSignin,
    isAuthenticated,
    user,
  } = useAuth();

  const [step, setStep] = useState("form");

  const [otp, setOtp] = useState("");

  const [registeredEmail, setRegisteredEmail] = useState("");

  const [errors, setErrors] = useState({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isVerifying, setIsVerifying] = useState(false);

  const [isResending, setIsResending] = useState(false);

  const [toasts, setToasts] = useState([]);

  const [googleLoading, setGoogleLoading] = useState(false);

  const [formData, setFormData] = useState(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return {
        name: parsed.name || "",
        email: parsed.email || "",
        phone: parsed.phone || "",
        password: "",
        confirmPassword: "",
      };
    } catch {
      return { name: "", email: "", phone: "", password: "", confirmPassword: "" };
    }
  });

  useEffect(() => {
    document.title = "Sign Up - Connect2Edtech";
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ name: formData.name, email: formData.email, phone: formData.phone })
    );
  }, [formData.name, formData.email, formData.phone]);

  useEffect(() => {
    if (isAuthenticated) {
      localStorage.removeItem(STORAGE_KEY);
      navigate(dashboardForRole(user?.role));
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const handleGoogleSignup = async () => {
    setGoogleLoading(true)
    try {
      const google = window.google
      if (!google) {
        showToast('Google Sign-In is loading. Please try again.', 'error')
        return
      }

      google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
        callback: async (response) => {
          try {
            const data = await googleSignin(response.credential)
            showToast('Signed in with Google!', 'success')
            setTimeout(() => navigate(dashboardForRole(data.user?.role)), 500)
          } catch (err) {
            showToast(err.message || 'Google sign-in failed', 'error')
          } finally {
            setGoogleLoading(false)
          }
        },
      })

      google.accounts.id.prompt()
    } catch (err) {
      showToast('Google Sign-In is not available.', 'error')
      setGoogleLoading(false)
    }
  }

  const showToast = (message, type = "success") => {
    const id = Date.now();

    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, 4000);
  };

  const setField = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const strength = useMemo(
    () => passwordStrength(formData.password),
    [formData.password]
  );

  const handleSignup = async (e) => {
    e.preventDefault();

    const validation = validateSignup(formData);

    if (Object.keys(validation).length) {
      setErrors(validation);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await signup({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password.trim(),
      });

      if (res.requiresVerification) {
        setRegisteredEmail(formData.email);

        setStep("verify");

        showToast("OTP sent to your email.");
      }

      setFormData((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }));
    } catch (err) {
      showToast(
        err.message ||
          "Signup failed",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      showToast("Enter 6 digit OTP", "error");
      return;
    }

    setIsVerifying(true);

    try {
      await verifyOtp(registeredEmail, otp, { autoLogin: false });

      showToast("Email verified");

      navigate("/signin");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);

    try {
      await resendOtp(registeredEmail);

      showToast("OTP resent successfully");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        {step === "form" ? (
          <>
            <div className="auth-header">
              <h1 className="auth-title">Create Your Account</h1>

              <p className="auth-subtitle">
                Join Connect2Edtech and start your learning journey.
              </p>
            </div>

            <form
              className="auth-form"
              onSubmit={handleSignup}
              noValidate
            >

              <div className="field">
                <label className="field-label">Full Name</label>

                <input
                  type="text"
                  name="name"
                  placeholder="Enter Full Name"
                  value={formData.name}
                  onChange={setField}
                  className={errors.name ? "input-error" : ""}
                />

                {errors.name && (
                  <span className="field-error">
                    {errors.name}
                  </span>
                )}
              </div>

              <div className="field">
                <label className="field-label">Email Address</label>

                <input
                  type="email"
                  name="email"
                  placeholder="Enter Email"
                  value={formData.email}
                  onChange={setField}
                  className={errors.email ? "input-error" : ""}
                />

                {errors.email && (
                  <span className="field-error">
                    {errors.email}
                  </span>
                )}
              </div>

              <div className="field">
                <label className="field-label">Phone Number</label>

                <input
                  type="text"
                  name="phone"
                  placeholder="Enter Phone Number"
                  value={formData.phone}
                  onChange={setField}
                  className={errors.phone ? "input-error" : ""}
                />

                {errors.phone && (
                  <span className="field-error">
                    {errors.phone}
                  </span>
                )}
              </div>

              <PasswordInput
                label="Password"
                name="password"
                value={formData.password}
                onChange={setField}
                placeholder="Minimum 8 characters"
                error={errors.password}
                autoComplete="new-password"
              />

              <PasswordInput
                label="Confirm Password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={setField}
                placeholder="Confirm Password"
                error={errors.confirmPassword}
                autoComplete="new-password"
              />

              <div className="strength-card">

                <div className="strength-header">
                  <strong>Password Strength:</strong>
                  <span>{strength.label}</span>
                </div>

                <div className="strength-bar">
                  {[0, 1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className={`strength-segment ${
                        strength.score > item ? "is-filled" : ""
                      }`}
                    />
                  ))}
                </div>

              </div>

              <button
                type="submit"
                className="btn primary auth-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner"></span>
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>

              <div className="auth-divider">
                <span>or</span>
              </div>

              <button
                type="button"
                className="btn google-btn"
                onClick={handleGoogleSignup}
                disabled={isSubmitting}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              <p className="auth-footer">
                Already have an account?{" "}
                <Link to="/signin">
                  Sign In
                </Link>
              </p>

            </form>
          </>
        ) : (
          <>
            <div className="auth-header">
              <div className="auth-icon">📩</div>

              <h1 className="auth-title">
                Verify Your Email
              </h1>

              <p className="auth-subtitle">
                We've sent a 6-digit verification code to
              </p>

              <strong>{registeredEmail}</strong>
            </div>

            <form
              className="auth-form"
              onSubmit={handleVerify}
            >
              <div className="field">
                <label className="field-label">
                  Verification Code
                </label>

                <input
                  type="text"
                  maxLength={6}
                  inputMode="numeric"
                  className="otp-input"
                  placeholder="Enter 6 Digit OTP"
                  value={otp}
                  onChange={(e) =>
                    setOtp(
                      e.target.value
                        .replace(/[^0-9]/g, "")
                        .slice(0, 6)
                    )
                  }
                />
              </div>

              <button
                type="submit"
                className="btn primary auth-submit"
                disabled={isVerifying}
              >
                {isVerifying ? (
                  <>
                    <span className="spinner"></span>
                    Verifying...
                  </>
                ) : (
                  "Verify Email"
                )}
              </button>

              <button
                type="button"
                className="btn secondary auth-submit"
                onClick={handleResend}
                disabled={isResending}
              >
                {isResending ? (
                  <>
                    <span className="spinner"></span>
                    Resending...
                  </>
                ) : (
                  "Resend OTP"
                )}
              </button>

              <p className="auth-footer">
                Wrong email?{" "}
                <button
                  type="button"
                  className="link-button"
                  onClick={() => {
                    setStep("form");
                    setOtp("");
                  }}
                >
                  Change Email
                </button>
              </p>
            </form>
          </>
        )}
      </div>

      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast show ${t.type}`}>
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}
