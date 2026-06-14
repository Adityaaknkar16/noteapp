import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PasswordInput from "../../components/input/PasswordInput";
import { validateEmail } from "../../utlis/helper";
import axios from "axios";
import { useAlert } from "../../components/Alert/AlertProvider";
import { LuUserPlus, LuMail } from "react-icons/lu";
import { FaGoogle, FaFacebookF } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { signInStart, signInSuccess } from "../../redux/userslice/userSlice";
import { toast } from "react-toastify";
import PageDecor from "../../components/Doodles/PageDecor";
import { DetailedLeaf } from "../../components/Doodles/Leaves";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [socialProvider, setSocialProvider] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const alert = useAlert();

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError("Please enter your name"); return; }
    if (!validateEmail(email)) { setError("Please enter a valid email"); return; }
    if (!password) { setError("Please enter the password"); return; }
    setError(""); setIsLoading(true);
    try {
      const res = await axios.post("http://localhost:3000/api/auth/signup", { username: name, email, password }, { withCredentials: true });
      setIsLoading(false);
      if (res.data.success === false) { setError(res.data.message); alert.error(res.data.message || "Sign up failed"); return; }
      alert.success(res.data.message || "Account created successfully!");
      navigate("/login");
    } catch (err) {
      setIsLoading(false);
      const msg = err.response?.data?.message || err.message || "Something went wrong";
      setError(msg); alert.error(msg);
    }
  };

  const triggerSocialMock = (provider) => { setSocialProvider(provider); setShowSocialModal(true); };

  const handleSocialSelect = async (username, mockEmail) => {
    setShowSocialModal(false); setIsLoading(true);
    try {
      dispatch(signInStart());
      const res = await axios.post("http://localhost:3000/api/auth/google", { email: mockEmail, username });
      setIsLoading(false);
      if (res.data.success) { alert.success(`Registered via ${socialProvider}!`); dispatch(signInSuccess(res.data)); navigate("/"); }
      else { alert.error(res.data.message || "Social login failed"); }
    } catch (err) {
      setIsLoading(false);
      toast.error(err.response?.data?.message || err.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-bg text-ink p-4 md:p-8 transition-colors relative overflow-hidden">
      <PageDecor variant="signup" />
      {/* Main Card */}
      <div className="w-full max-w-4xl flex flex-col md:flex-row paper-card overflow-hidden relative border border-border" style={{ minHeight: '560px' }}>
        
        {/* Left Side: Form */}
        <div className="w-full md:w-[50%] flex flex-col justify-center p-8 lg:p-12 bg-surface border-r border-border">
          <div className="mb-6 text-center">
            <h2 className="text-3xl font-display font-bold text-ink tracking-tight mb-2">Create Account</h2>
            <p className="text-ink-muted text-xs font-medium">Join Inkwell and set up your workspace</p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="relative">
              <LuUserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted text-lg" />
              <input
                type="text"
                placeholder="Username"
                className="input-box pl-11"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="relative">
              <LuMail className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted text-lg" />
              <input
                type="text"
                placeholder="Email Address"
                className="input-box pl-11"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />

            {error && <div className="bg-accent-red/10 border border-accent-red/20 text-accent-red text-xs px-4 py-2.5 rounded-lg font-semibold">{error}</div>}

            <button type="submit" disabled={isLoading} className="btn-primary w-full mt-2">
              {isLoading ? "Creating Account..." : "Register"}
            </button>

            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[10px] font-bold text-ink-muted uppercase tracking-widest">Or sign up with</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => triggerSocialMock("Facebook")}
                className="flex items-center justify-center gap-2 bg-surface hover:bg-bg text-ink border border-border font-bold py-2.5 px-4 rounded-lg transition-colors cursor-pointer text-sm">
                <FaFacebookF className="text-sm text-accent-blue" /><span>Facebook</span>
              </button>
              <button type="button" onClick={() => triggerSocialMock("Google")}
                className="flex items-center justify-center gap-2 bg-surface hover:bg-bg text-ink border border-border font-bold py-2.5 px-4 rounded-lg transition-colors cursor-pointer text-sm">
                <FaGoogle className="text-sm text-accent-rust" /><span>Google</span>
              </button>
            </div>

            <p className="text-sm text-center text-ink-muted font-semibold pt-2">
              Already have an account?{" "}
              <Link to="/login" className="text-accent-rust font-extrabold hover:underline">Login now</Link>
            </p>
          </form>
        </div>

        {/* Right Side: Redesigned Aesthetic Illustration panel */}
        <div className="hidden md:flex flex-1 relative flex-col justify-between p-12 bg-bg overflow-hidden border-l border-border select-none">
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-ink-muted">Inkwell Journal Co.</div>
          
          <div className="my-auto z-10 relative">
            <h1 className="text-5xl font-display font-black text-ink leading-tight">
              A blank page <br />
              <span className="text-accent-sage italic font-normal font-handwriting">full of hope</span> <br />
              awaits you.
            </h1>
            <p className="text-xs text-ink-muted mt-6 max-w-sm leading-relaxed">
              Organize your academic schedules, project tasks, personal diary entries, and habit statistics in a unified organic workspace.
            </p>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-ink-muted border-t border-border pt-4 mt-8">
            <span>© 2026 INKWELL</span>
            <span>SECURE VAULT</span>
          </div>

          {/* Plant overlay subtle decoration */}
          <div className="absolute bottom-[-5%] right-[-5%] opacity-20 pointer-events-none">
            <DetailedLeaf size="200px" color="var(--accent-sage)" rotate={35} />
          </div>
        </div>
      </div>

      {/* Social Signup Modal */}
      {showSocialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/30 backdrop-blur-sm">
          <div className="bg-surface rounded-xl p-8 max-w-sm w-full shadow-lg border border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2.5 rounded-lg bg-bg text-ink`}>
                {socialProvider === 'Google' ? <FaGoogle className="text-lg text-accent-rust" /> : <FaFacebookF className="text-lg text-accent-blue" />}
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-ink">Sign up with {socialProvider}</h3>
                <p className="text-xs text-ink-muted">Select an account to continue</p>
              </div>
            </div>
            <div className="space-y-3">
              {[["Aditya Kanakar", "aditya@example.com"], ["Guest User", "guest.noteapp@gmail.com"]].map(([name, mail]) => (
                <button key={mail} type="button" onClick={() => handleSocialSelect(name, mail)}
                  className="w-full text-left p-3 rounded-lg hover:bg-bg border border-border transition-all flex items-center gap-3 cursor-pointer">
                  <div className="w-9 h-9 rounded-full bg-accent-rust flex items-center justify-center text-white font-bold text-sm shadow">{name[0]}</div>
                  <div>
                    <div className="font-bold text-sm text-ink">{name}</div>
                    <div className="text-xs text-ink-muted">{mail}</div>
                  </div>
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setShowSocialModal(false)}
              className="mt-5 w-full text-center text-xs font-bold text-ink-muted hover:text-ink transition-colors uppercase tracking-wider cursor-pointer py-2">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Signup;