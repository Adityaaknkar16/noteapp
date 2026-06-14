import React, { useState } from "react"
import PasswordInput from "../../components/input/PasswordInput"
import { Link, useNavigate } from "react-router-dom"
import { validateEmail } from "../../utlis/helper"
import { useDispatch } from "react-redux"
import { MdAutoAwesome, MdLock, MdMailOutline } from "react-icons/md"
import { FaGoogle, FaFacebookF } from "react-icons/fa"
import { HiSparkles } from "react-icons/hi"
import axios from "axios"
import { useAlert } from "../../components/Alert/AlertProvider"
import { signInFailure, signInStart, signInSuccess } from "../../redux/userslice/userSlice"
import plantImg from "../../assets/plant_transparent.png"

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
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-200 to-indigo-200 p-4 md:p-8 relative overflow-hidden">

      {/* Decorative background bubbles */}
      <div className="absolute top-6 left-6 w-16 h-16 rounded-full border-4 border-blue-300/50 animate-pulse" />
      <div className="absolute top-16 left-20 w-8 h-8 rounded-full border-4 border-blue-400/40" />
      <div className="absolute bottom-10 left-10 w-24 h-24 rounded-full border-4 border-blue-300/40 animate-pulse" />
      <div className="absolute bottom-20 left-32 w-10 h-10 rounded-full border-4 border-blue-400/30" />
      <div className="absolute top-10 right-10 w-10 h-10 rounded-full border-4 border-blue-300/40" />
      <div className="absolute bottom-12 right-16 w-16 h-16 rounded-full border-4 border-blue-300/30 animate-pulse" />
      <div className="absolute top-1/3 right-6 w-6 h-6 rounded-full bg-blue-300/30" />

      {/* Floating blob glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-300/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-300/20 rounded-full blur-[120px]" />

      {/* Main Card */}
      <div className="w-full max-w-5xl flex flex-col md:flex-row rounded-[32px] shadow-2xl overflow-hidden relative bg-white/10 backdrop-blur-sm border border-white/40" style={{ minHeight: '580px' }}>

        {/* ── Left: Form ── */}
        <div className="w-full md:w-[48%] flex flex-col justify-center p-8 lg:p-12 relative"
          style={{ background: 'linear-gradient(145deg, #6fa8f5 0%, #4285f4 60%, #3b72e0 100%)' }}>

          {/* Card inner highlight */}
          <div className="absolute top-0 left-0 right-0 h-px bg-white/30 rounded-t-[32px]" />
          <div className="absolute top-0 left-0 bottom-0 w-px bg-white/20" />

          {/* Decorative dots inside card */}
          <div className="absolute top-4 right-4 flex gap-2 opacity-30">
            <div className="w-2 h-2 rounded-full bg-white" />
            <div className="w-2 h-2 rounded-full bg-white" />
            <div className="w-2 h-2 rounded-full bg-white" />
          </div>

          {view === "login" && (
            <>
              <div className="mb-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/20 mb-4 backdrop-blur-sm border border-white/30">
                  <MdLock className="text-white text-2xl" />
                </div>
                <h2 className="text-3xl font-extrabold text-white tracking-tight mb-1">Login Now</h2>
                <p className="text-blue-100 text-xs font-medium">Welcome back! Sign in to continue.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative">
                  <MdMailOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                  <input
                    type="text"
                    placeholder="Email or Username"
                    className="w-full text-sm bg-white text-slate-700 placeholder-slate-400 border-none outline-none pl-11 pr-4 py-3.5 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-600/20 font-medium transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
                  <div className="flex justify-end -mt-1">
                    <button type="button" onClick={() => { setView("forgot"); setError("") }}
                      className="text-xs font-bold text-blue-100 hover:text-white transition-colors">
                      Forgot password?
                    </button>
                  </div>
                </div>

                {error && <div className="bg-red-500/20 border border-red-400/30 text-red-100 text-xs px-4 py-2.5 rounded-xl font-semibold">{error}</div>}

                <button type="submit" disabled={isLoading}
                  className="w-full bg-[#1a3a8f] hover:bg-[#152e73] text-white font-extrabold py-3.5 rounded-2xl shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-70 tracking-widest uppercase text-xs mt-2 border border-white/10">
                  {isLoading ? "Logging in..." : "Login"}
                </button>

                <div className="flex items-center gap-3 py-1">
                  <div className="flex-1 h-px bg-white/20" />
                  <span className="text-[10px] font-bold text-blue-100 uppercase tracking-widest">Or login with</span>
                  <div className="flex-1 h-px bg-white/20" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => triggerSocialMock("Facebook")}
                    className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-[#1877f2] font-bold py-3 px-4 rounded-xl shadow-sm transition-colors cursor-pointer text-sm border border-white/50">
                    <FaFacebookF className="text-sm" /><span>Facebook</span>
                  </button>
                  <button type="button" onClick={() => triggerSocialMock("Google")}
                    className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-[#ea4335] font-bold py-3 px-4 rounded-xl shadow-sm transition-colors cursor-pointer text-sm border border-white/50">
                    <FaGoogle className="text-sm" /><span>Google</span>
                  </button>
                </div>

                <p className="text-sm text-center text-blue-100 font-semibold pt-2">
                  Not a member?{" "}
                  <Link to="/signup" className="text-white font-extrabold hover:underline">Signup now</Link>
                </p>
              </form>
            </>
          )}

          {view === "forgot" && (
            <>
              <div className="mb-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/20 mb-4 backdrop-blur-sm border border-white/30">
                  <MdMailOutline className="text-white text-2xl" />
                </div>
                <h2 className="text-2xl font-extrabold text-white tracking-tight mb-1">Forgot Password?</h2>
                <p className="text-blue-100 text-xs font-medium">Enter your email to reset your password</p>
              </div>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <input type="text" placeholder="Enter your email"
                  className="w-full text-sm bg-white text-slate-700 placeholder-slate-400 border-none outline-none px-5 py-3.5 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-600/20 font-medium"
                  value={email} onChange={(e) => setEmail(e.target.value)} />
                {error && <div className="bg-red-500/20 border border-red-400/30 text-red-100 text-xs px-4 py-2.5 rounded-xl font-semibold">{error}</div>}
                <button type="submit" disabled={isLoading}
                  className="w-full bg-[#1a3a8f] hover:bg-[#152e73] text-white font-extrabold py-3.5 rounded-2xl shadow-lg transition-all cursor-pointer disabled:opacity-70 tracking-widest uppercase text-xs">
                  {isLoading ? "Searching..." : "Reset Password"}
                </button>
                <button type="button" onClick={() => { setView("login"); setError("") }}
                  className="w-full text-center text-sm text-white hover:underline font-bold py-2 cursor-pointer">← Back to Login</button>
              </form>
            </>
          )}

          {view === "reset" && (
            <>
              <div className="mb-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/20 mb-4 backdrop-blur-sm border border-white/30">
                  <MdLock className="text-white text-2xl" />
                </div>
                <h2 className="text-2xl font-extrabold text-white tracking-tight mb-1">Set New Password</h2>
                <p className="text-blue-100 text-xs font-medium">Create a new secure password</p>
              </div>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New Password" />
                <PasswordInput value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm Password" />
                {error && <div className="bg-red-500/20 border border-red-400/30 text-red-100 text-xs px-4 py-2.5 rounded-xl font-semibold">{error}</div>}
                <button type="submit" disabled={isLoading}
                  className="w-full bg-[#1a3a8f] hover:bg-[#152e73] text-white font-extrabold py-3.5 rounded-2xl shadow-lg transition-all cursor-pointer disabled:opacity-70 tracking-widest uppercase text-xs">
                  {isLoading ? "Updating..." : "Update Password"}
                </button>
                <button type="button" onClick={() => { setView("login"); setError("") }}
                  className="w-full text-center text-sm text-white hover:underline font-bold py-2 cursor-pointer">Cancel</button>
              </form>
            </>
          )}
        </div>

        {/* ── Right: Illustration ── */}
        <div className="hidden md:flex flex-1 relative items-center justify-center overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #e8f0ff 0%, #c8daff 50%, #b8d0ff 100%)' }}>

          {/* Large concentric circles  */}
          <div className="absolute w-[520px] h-[520px] rounded-full"
            style={{ background: 'rgba(66, 133, 244, 0.15)', boxShadow: 'inset 0 0 60px rgba(66,133,244,0.1)' }} />
          <div className="absolute w-[420px] h-[420px] rounded-full"
            style={{ background: 'rgba(66, 133, 244, 0.25)' }} />
          <div className="absolute w-[330px] h-[330px] rounded-full"
            style={{ background: 'rgba(59, 114, 224, 0.45)' }} />
          <div className="absolute w-[240px] h-[240px] rounded-full"
            style={{ background: 'rgba(26, 86, 219, 0.65)' }} />
          <div className="absolute w-[150px] h-[150px] rounded-full"
            style={{ background: 'rgba(17, 58, 160, 0.75)' }} />

          {/* Floating circles decoration */}
          <div className="absolute top-8 right-10 w-10 h-10 rounded-full border-4 border-blue-400/30 animate-bounce" style={{ animationDuration: '3s' }} />
          <div className="absolute bottom-12 right-8 w-7 h-7 rounded-full border-4 border-blue-400/40" />
          <div className="absolute top-1/2 right-4 w-5 h-5 rounded-full bg-blue-300/40" />
          <div className="absolute top-8 left-8 w-6 h-6 rounded-full border-2 border-blue-300/30 animate-pulse" />
          <div className="absolute bottom-8 left-12 w-4 h-4 rounded-full bg-blue-200/50" />

          {/* The plant — transparent PNG */}
          <img
            src={plantImg}
            alt="3D Plant"
            className="relative z-10 w-64 h-64 object-contain drop-shadow-2xl"
            style={{ filter: 'drop-shadow(0 20px 40px rgba(26,86,219,0.35))' }}
          />

          {/* Feature badges floating around */}
          <div className="absolute bottom-8 left-6 bg-white/80 backdrop-blur-sm rounded-2xl px-3 py-2 shadow-lg border border-white/60 flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-500 flex items-center justify-center">
              <HiSparkles className="text-white text-xs" />
            </div>
            <span className="text-xs font-bold text-slate-700">Smart Notes</span>
          </div>
          <div className="absolute top-10 left-6 bg-white/80 backdrop-blur-sm rounded-2xl px-3 py-2 shadow-lg border border-white/60 flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-500 flex items-center justify-center">
              <MdAutoAwesome className="text-white text-xs" />
            </div>
            <span className="text-xs font-bold text-slate-700">Track Habits</span>
          </div>

          {/* Brand name */}
          <div className="absolute top-4 right-1/2 translate-x-1/2 text-blue-800/40 font-black text-xs uppercase tracking-[0.4em]">Notebook Pro</div>
        </div>
      </div>

      {/* Social Modal */}
      {showSocialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2.5 rounded-xl ${socialProvider === 'Google' ? 'bg-red-50 text-[#ea4335]' : 'bg-blue-50 text-[#1877f2]'}`}>
                {socialProvider === 'Google' ? <FaGoogle className="text-xl" /> : <FaFacebookF className="text-xl" />}
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-800">Sign in with {socialProvider}</h3>
                <p className="text-xs text-slate-500">Select an account to continue</p>
              </div>
            </div>
            <div className="space-y-3">
              {[["Aditya Kanakar", "aditya@example.com"], ["Guest User", "guest.noteapp@gmail.com"]].map(([name, mail]) => (
                <button key={mail} type="button" onClick={() => handleSocialSelect(name, mail)}
                  className="w-full text-left p-3.5 rounded-xl hover:bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all flex items-center gap-3 cursor-pointer">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow">{name[0]}</div>
                  <div>
                    <div className="font-bold text-sm text-slate-800">{name}</div>
                    <div className="text-xs text-slate-500">{mail}</div>
                  </div>
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setShowSocialModal(false)}
              className="mt-5 w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-wider cursor-pointer py-2">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Login