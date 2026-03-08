import React, { useState } from "react";
import { X, LogIn } from "lucide-react";
import axios from "axios";

export default function Login({ onClose, onLogin }) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    phone: "",
    otp: "",
    name: "",
    designation: "",
    type: "self",
    company_name: "",
    identification_type: "",
    identification_number: "",
    office_address: "",
    email: "",
    captcha_answer: "",
  });
  const [isRegister, setIsRegister] = useState(false);
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState("username");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [registerStep, setRegisterStep] = useState("form"); // 'form' or 'otp'
  const [emailOtp, setEmailOtp] = useState("");

  React.useEffect(() => {
    // No agencies needed
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        if (registerStep === "form") {
          // Send OTPs to phone and email
          await axios.post("/api/auth/register-send-otp", {
            email: formData.email,
            phone: formData.phone,
          });
          setRegisterStep("otp");
          alert(
            "OTPs sent to your phone and email. Please check and enter them below.",
          );
        } else if (registerStep === "otp") {
          // Verify OTPs and complete registration
          const formDataToSend = new FormData();
          Object.keys(formData).forEach((key) => {
            if (formData[key]) formDataToSend.append(key, formData[key]);
          });
          if (document) formDataToSend.append("document", document);
          formDataToSend.append("phoneOtp", otp);
          formDataToSend.append("emailOtp", emailOtp);

          const res = await axios.post(
            "/api/auth/register-verify-otp",
            formDataToSend,
            {
              headers: { "Content-Type": "multipart/form-data" },
            },
          );
          alert("Registration successful! Please login.");
          setIsRegister(false);
          setRegisterStep("form");
          setOtp("");
          setEmailOtp("");
        }
      } else {
        if (loginMethod === "username") {
          const res = await axios.post("/api/auth/login", {
            username: formData.username,
            password: formData.password,
          });
          localStorage.setItem("token", res.data.token);
          onLogin(res.data.user);
          onClose();
        } else if (loginMethod === "mobile") {
          if (!otpSent) {
            await axios.post("/api/auth/login-mobile", {
              phone: formData.phone,
            });
            setOtpSent(true);
            alert("OTP sent to your phone. Please enter the OTP.");
          } else {
            const res = await axios.post(
              "/api/auth/verify-otp",
              {
                phone: formData.phone,
                otp: otp,
              },
            );
            localStorage.setItem("token", res.data.token);
            onLogin(res.data.user);
            onClose();
          }
        }
      }
    } catch (err) {
      alert(err.response?.data?.error || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "var(--bg-overlay)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        className="glass-panel animate-fade-in"
        style={{
          width: "500px",
          maxHeight: "90vh",
          padding: "32px",
          position: "relative",
          background: "var(--bg-modal)",
          overflowY: "auto",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "24px",
            right: "24px",
            background: "none",
            border: "none",
            color: "var(--text-secondary)",
            cursor: "pointer",
          }}
        >
          <X size={24} />
        </button>

        <h2
          style={{
            marginTop: 0,
            color: "var(--text-primary)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <LogIn size={24} />
          {isRegister
            ? registerStep === "form"
              ? "Register"
              : "Verify OTP"
            : "Login"}
        </h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
          {isRegister
            ? registerStep === "form"
              ? "Create an account to apply for road cuts"
              : "Enter OTPs sent to your phone and email"
            : "Login to your account"}
        </p>

        {!isRegister && (
          <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
            <button
              type="button"
              onClick={() => {
                setLoginMethod("username");
                setOtpSent(false);
                setOtp("");
                setFormData({ ...formData, phone: "" });
              }}
              style={{
                flex: 1,
                padding: "8px 16px",
                background:
                  loginMethod === "username"
                    ? "var(--primary)"
                    : "var(--bg-secondary)",
                color:
                  loginMethod === "username"
                    ? "var(--bg-main)"
                    : "var(--text-secondary)",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Username
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMethod("mobile");
                setOtpSent(false);
                setOtp("");
                setFormData({ ...formData, username: "", password: "" });
              }}
              style={{
                flex: 1,
                padding: "8px 16px",
                background:
                  loginMethod === "mobile"
                    ? "var(--primary)"
                    : "var(--bg-secondary)",
                color:
                  loginMethod === "mobile" ? "var(--bg-main)" : "var(--text-secondary)",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Mobile OTP
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "20px" }}>
          {!isRegister && loginMethod === "username" && (
            <>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "var(--text-secondary)",
                    fontSize: "0.9rem",
                  }}
                >
                  Username
                </label>
                <input
                  type="text"
                  className="input-field"
                  required
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "var(--text-secondary)",
                    fontSize: "0.9rem",
                  }}
                >
                  Password
                </label>
                <input
                  type="password"
                  className="input-field"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
            </>
          )}

          {!isRegister && loginMethod === "mobile" && (
            <>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "var(--text-secondary)",
                    fontSize: "0.9rem",
                  }}
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="input-field"
                  required
                  disabled={otpSent}
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>

              {otpSent && (
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      color: "var(--text-secondary)",
                      fontSize: "0.9rem",
                    }}
                  >
                    OTP
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 4-digit OTP"
                  />
                </div>
              )}
            </>
          )}

          {isRegister && registerStep === "form" && (
            <>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "var(--text-secondary)",
                    fontSize: "0.9rem",
                  }}
                >
                  Username
                </label>
                <input
                  type="text"
                  className="input-field"
                  required
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "var(--text-secondary)",
                    fontSize: "0.9rem",
                  }}
                >
                  Password
                </label>
                <input
                  type="password"
                  className="input-field"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "var(--text-secondary)",
                    fontSize: "0.9rem",
                  }}
                >
                  Name
                </label>
                <input
                  type="text"
                  className="input-field"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "var(--text-secondary)",
                    fontSize: "0.9rem",
                  }}
                >
                  Designation
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.designation}
                  onChange={(e) =>
                    setFormData({ ...formData, designation: e.target.value })
                  }
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "var(--text-secondary)",
                    fontSize: "0.9rem",
                  }}
                >
                  Type
                </label>
                <select
                  className="input-field"
                  required
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                >
                  <option value="self">Self</option>
                  <option value="company">Company</option>
                </select>
              </div>

              {formData.type === "company" && (
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      color: "var(--text-secondary)",
                      fontSize: "0.9rem",
                    }}
                  >
                    Name of Company
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    required
                    value={formData.company_name}
                    onChange={(e) =>
                      setFormData({ ...formData, company_name: e.target.value })
                    }
                  />
                </div>
              )}

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "var(--text-secondary)",
                    fontSize: "0.9rem",
                  }}
                >
                  Identification Type
                </label>
                <select
                  className="input-field"
                  required
                  value={formData.identification_type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      identification_type: e.target.value,
                    })
                  }
                >
                  <option value="">Select Type</option>
                  <option value="aadhar">Aadhar No</option>
                  <option value="pan">Pan No</option>
                  <option value="cin">CIN No</option>
                  <option value="gst">GST No</option>
                  <option value="tin">TIN No</option>
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "var(--text-secondary)",
                    fontSize: "0.9rem",
                  }}
                >
                  Identification Number
                </label>
                <input
                  type="text"
                  className="input-field"
                  required
                  value={formData.identification_number}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      identification_number: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "var(--text-secondary)",
                    fontSize: "0.9rem",
                  }}
                >
                  Office Address
                </label>
                <textarea
                  className="input-field"
                  rows="3"
                  value={formData.office_address}
                  onChange={(e) =>
                    setFormData({ ...formData, office_address: e.target.value })
                  }
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "var(--text-secondary)",
                    fontSize: "0.9rem",
                  }}
                >
                  Email ID
                </label>
                <input
                  type="email"
                  className="input-field"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "var(--text-secondary)",
                    fontSize: "0.9rem",
                  }}
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="input-field"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "var(--text-secondary)",
                    fontSize: "0.9rem",
                  }}
                >
                  Upload Document (
                  {formData.identification_type
                    ? formData.identification_type.toUpperCase()
                    : "Select type first"}
                  )
                </label>
                <input
                  type="file"
                  className="input-field"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setDocument(e.target.files[0])}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "var(--text-secondary)",
                    fontSize: "0.9rem",
                  }}
                >
                  What is 5 + 3? (Anti-robot check)
                </label>
                <input
                  type="number"
                  className="input-field"
                  required
                  value={formData.captcha_answer}
                  onChange={(e) =>
                    setFormData({ ...formData, captcha_answer: e.target.value })
                  }
                />
              </div>
            </>
          )}

          {isRegister && registerStep === "otp" && (
            <>
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    marginBottom: "16px",
                  }}
                >
                  OTPs have been sent to your phone and email. Please enter them
                  below.
                </p>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "var(--text-secondary)",
                    fontSize: "0.9rem",
                  }}
                >
                  Phone OTP (4 digits)
                </label>
                <input
                  type="text"
                  className="input-field"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter phone OTP"
                  maxLength="4"
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "var(--text-secondary)",
                    fontSize: "0.9rem",
                  }}
                >
                  Email OTP (6 digits)
                </label>
                <input
                  type="text"
                  className="input-field"
                  required
                  value={emailOtp}
                  onChange={(e) => setEmailOtp(e.target.value)}
                  placeholder="Enter email OTP"
                  maxLength="6"
                />
              </div>

              <div style={{ textAlign: "center", marginTop: "16px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setRegisterStep("form");
                    setOtp("");
                    setEmailOtp("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--accent-primary)",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Back to Registration Form
                </button>
              </div>
            </>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading
              ? "Processing..."
              : isRegister
                ? registerStep === "form"
                  ? "Send OTPs"
                  : "Complete Registration"
                : loginMethod === "mobile" && !otpSent
                  ? "Send OTP"
                  : loginMethod === "mobile" && otpSent
                    ? "Verify OTP"
                    : "Login"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "16px",
            color: "var(--text-secondary)",
          }}
        >
          {isRegister ? "Already have an account?" : "Don't have an account?"}
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setRegisterStep("form");
              setOtp("");
              setEmailOtp("");
              setOtpSent(false);
            }}
            style={{
              background: "none",
              border: "none",
              color: "var(--accent-primary)",
              cursor: "pointer",
              marginLeft: "4px",
            }}
          >
            {isRegister ? "Login" : "Register"}
          </button>
        </p>
      </div>
    </div>
  );
}
