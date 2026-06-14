import React, { useState } from "react"
import PasswordInput from "../../components/input/PasswordInput"
import { Link, useNavigate } from "react-router-dom"
import { validateEmail } from "../../utlis/helper"
import { useDispatch } from "react-redux"
import { LuLock, LuMail } from "react-icons/lu"
import { FaGoogle, FaFacebookF } from "react-icons/fa"
import axios from "axios"
import { useAlert } from "../../components/Alert/AlertProvider"
import { signInFailure, signInStart, signInSuccess } from "../../redux/userslice/userSlice"
import { toast } from "react-toastify"
import PageDecor from "../../components/Doodles/PageDecor"
import { DetailedLeaf } from "../../components/Doodles/Leaves"

const Login = () => {
  const [view, setView] = useState("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [resetUserId, setResetUserId] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showSocialModal, setShowSocialModal] = useState(false)
  const [socialProvider, setSocialProvider] = useState("")

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const alert = useAlert()

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!validateEmail(email)) { setError("Please enter a valid email address"); return }
    if (!password) { setError("Please enter the password"); return }
    setError(""); setIsLoading(true)
    try {
      dispatch(signInStart())
      const res = await axios.post("http://localhost:3000/api/auth/signin", { email, password }, { withCredentials: true })
      setIsLoading(false)
      if (res.data.success === false) { alert.error(res.data.message); dispatch(signInFailure(res.data.message)); return }
      alert.success(res.data.message || "Logged in successfully!")
      dispatch(signInSuccess(res.data))
      navigate("/")
    } catch (err) {
      setIsLoading(false)
      const msg = err.response?.data?.message || err.message || "Something went wrong"
      toast.error(msg); dispatch(signInFailure(msg))
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    if (!validateEmail(email)) { setError("Please enter a valid email address"); return }
    setError(""); setIsLoading(true)
    try {
      const res = await axios.post("http://localhost:3000/api/auth/forgot-password", { email })
      setIsLoading(false)
      if (res.data.success) { alert.success("Account found! Set your new password."); setResetUserId(res.data.resetToken); setView("reset") }
      else { alert.error(res.data.message || "Failed") }
    } catch (err) {
      setIsLoading(false)
      const msg = err.response?.data?.message || err.message || "Something went wrong"
      setError(msg); toast.error(msg)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (!password) { setError("Please enter your new password"); return }
    if (password !== confirmPassword) { setError("Passwords do not match"); return }
    setError(""); setIsLoading(true)
    try {
      const res = await axios.post("http://localhost:3000/api/auth/reset-password", { userId: resetUserId, password })
      setIsLoading(false)
      if (res.data.success) { alert.success("Password updated! Please log in."); setView("login"); setPassword(""); setConfirmPassword("") }
      else { alert.error(res.data.message || "Reset failed") }
    } catch (err) {
      setIsLoading(false)
      const msg = err.response?.data?.message || err.message || "Something went wrong"
      setError(msg); toast.error(msg)
    }
  }

  const triggerSocialMock = (provider) => { setSocialProvider(provider); setShowSocialModal(true) }

  const handleSocialSelect = async (username, mockEmail) => {
    setShowSocialModal(false); setIsLoading(true)
    try {
      dispatch(signInStart())
      const res = await axios.post("http://localhost:3000/api/auth/google", { email: mockEmail, username })
      setIsLoading(false)
      if (res.data.success) { alert.success(`Logged in via ${socialProvider}!`); dispatch(signInSuccess(res.data)); navigate("/") }
      else { alert.error(res.data.message || "Social login failed") }
    } catch (err) {
      setIsLoading(false)
      toast.error(err.response?.data?.message || err.message || "Something went wrong")
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-bg text-ink p-4 md:p-8 transition-colors relative overflow-hidden">
      <PageDecor variant="login" />
      {/* Main Card */}
      <div className="w-full max-w-4xl flex flex-col md:flex-row paper-card overflow-hidden relative border border-border" style={{ minHeight: '560px' }}>
        
        {/* Left Side: Form */}
        <div className="w-full md:w-[50%] flex flex-col justify-center p-8 lg:p-12 bg-surface border-r border-border">
          {view === "login" && (
            <>
              <div className="mb-6 text-center">
                <h2 className="text-3xl font-display font-bold text-ink tracking-tight mb-2">Welcome Back</h2>
                <p className="text-ink-muted text-xs font-medium">Log into your Inkwell workspace</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative">
                  <LuMail className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted text-lg" />
                  <input
                    type="text"
                    placeholder="Email Address"
                    className="input-box pl-11 pr-4"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
                  <div className="flex justify-end mt-1.5">
                    <button type="button" onClick={() => { setView("forgot"); setError("") }}
                      className="text-xs font-bold text-accent-rust hover:underline transition-all">
                      Forgot password?
                    </button>
                  </div>
                </div>

                {error && <div className="bg-accent-red/10 border border-accent-red/20 text-accent-red text-xs px-4 py-2.5 rounded-lg font-semibold">{error}</div>}

                <button type="submit" disabled={isLoading} className="btn-primary w-full mt-2">
                  {isLoading ? "Logging in..." : "Login"}
                </button>

                <div className="flex items-center gap-3 py-1">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-[10px] font-bold text-ink-muted uppercase tracking-widest">Or login with</span>
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
                  Not a member?{" "}
                  <Link to="/signup" className="text-accent-rust font-extrabold hover:underline">Signup now</Link>
                </p>
              </form>
            </>
          )}

          {view === "forgot" && (
            <>
              <div className="mb-6 text-center">
                <h2 className="text-3xl font-display font-bold text-ink tracking-tight mb-2">Reset Password</h2>
                <p className="text-ink-muted text-xs font-medium">Enter your account email to receive reset token</p>
              </div>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="relative">
                  <LuMail className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted text-lg" />
                  <input type="text" placeholder="Enter your email"
                    className="input-box pl-11"
                    value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                {error && <div className="bg-accent-red/10 border border-accent-red/20 text-accent-red text-xs px-4 py-2.5 rounded-lg font-semibold">{error}</div>}
                <button type="submit" disabled={isLoading} className="btn-primary w-full">
                  {isLoading ? "Searching..." : "Find Account"}
                </button>
                <button type="button" onClick={() => { setView("login"); setError("") }}
                  className="w-full text-center text-xs font-bold text-ink-muted hover:text-ink hover:underline cursor-pointer py-2">← Back to Login</button>
              </form>
            </>
          )}

          {view === "reset" && (
            <>
              <div className="mb-6 text-center">
                <h2 className="text-3xl font-display font-bold text-ink tracking-tight mb-2">Set Password</h2>
                <p className="text-ink-muted text-xs font-medium">Create a new secure password</p>
              </div>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New Password" />
                <PasswordInput value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm Password" />
                {error && <div className="bg-accent-red/10 border border-accent-red/20 text-accent-red text-xs px-4 py-2.5 rounded-lg font-semibold">{error}</div>}
                <button type="submit" disabled={isLoading} className="btn-primary w-full">
                  {isLoading ? "Updating..." : "Update Password"}
                </button>
                <button type="button" onClick={() => { setView("login"); setError("") }}
                  className="w-full text-center text-xs font-bold text-ink-muted hover:text-ink hover:underline cursor-pointer py-2">Cancel</button>
              </form>
            </>
          )}
        </div>

        {/* Right Side: Redesigned Aesthetic Illustration panel */}
        <div className="hidden md:flex flex-1 relative flex-col justify-between p-12 bg-bg overflow-hidden border-l border-border select-none">
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-ink-muted">Inkwell Journal Co.</div>
          
          <div className="my-auto z-10 relative">
            <h1 className="text-5xl font-display font-black text-ink leading-tight">
              Thoughts <br />
              <span className="text-accent-rust italic font-normal font-handwriting">written down</span> <br />
              never drift away.
            </h1>
            <p className="text-xs text-ink-muted mt-6 max-w-sm leading-relaxed">
              Redesigned for scholars, writers, and thinkers. A tactile productivity canvas that stays out of your way.
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

      {/* Social Modal */}
      {showSocialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/30 backdrop-blur-sm">
          <div className="bg-surface rounded-xl p-8 max-w-sm w-full shadow-lg border border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2.5 rounded-lg bg-bg text-ink`}>
                {socialProvider === 'Google' ? <FaGoogle className="text-lg text-accent-rust" /> : <FaFacebookF className="text-lg text-accent-blue" />}
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-ink">Sign in with {socialProvider}</h3>
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
  )
}

export default Login