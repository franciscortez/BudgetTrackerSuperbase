import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import Layout from "../components/Layout";
import Icon from "../components/Icon";
import Swal from "sweetalert2";
import { motion as Motion } from "motion/react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
};

export default function Profile() {
  const { user, profile, updateProfile, updatePassword } = useAuth();
  
  const [fullName, setFullName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Pattern for adjusting state based on props/hooks during render (to avoid setState in effect)
  const [initializedId, setInitializedId] = useState(null);
  if (profile?.id && profile.id !== initializedId) {
    setFullName(profile.full_name || "");
    setInitializedId(profile.id);
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);

    const { error } = await updateProfile({ full_name: fullName });

    setIsUpdatingProfile(false);

    if (error) {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: error.message,
        confirmButtonColor: "#EC4899",
        customClass: {
          popup: 'rounded-[2.5rem] p-8',
          confirmButton: 'rounded-2xl px-8 py-4 px-10 font-bold'
        }
      });
    } else {
      Swal.fire({
        icon: "success",
        title: "Profile Updated",
        text: "Your information has been saved successfully.",
        confirmButtonColor: "#EC4899",
        timer: 2000,
        showConfirmButton: false,
        customClass: {
          popup: 'rounded-[2.5rem] p-8'
        }
      });
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      return Swal.fire({
        icon: "error",
        title: "Mismatch",
        text: "Passwords do not match.",
        confirmButtonColor: "#EC4899",
        customClass: {
          popup: 'rounded-[2.5rem] p-8'
        }
      });
    }

    if (newPassword.length < 6) {
      return Swal.fire({
        icon: "warning",
        title: "Too Weak",
        text: "Password must be at least 6 characters.",
        confirmButtonColor: "#EC4899",
        customClass: {
          popup: 'rounded-[2.5rem] p-8'
        }
      });
    }

    setIsUpdatingPassword(true);
    const { error } = await updatePassword(newPassword);
    setIsUpdatingPassword(false);

    if (error) {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: error.message,
        confirmButtonColor: "#EC4899",
        customClass: {
          popup: 'rounded-[2.5rem] p-8'
        }
      });
    } else {
      setNewPassword("");
      setConfirmPassword("");
      Swal.fire({
        icon: "success",
        title: "Password Changed",
        text: "Your security has been updated.",
        confirmButtonColor: "#EC4899",
        timer: 2000,
        showConfirmButton: false,
        customClass: {
          popup: 'rounded-[2.5rem] p-8'
        }
      });
    }
  };

  return (
    <Layout>
      <Motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-4xl mx-auto space-y-10 pb-20"
      >
        {/* Header Section */}
        <Motion.div 
          variants={item}
          className="relative overflow-hidden bg-gradient-to-br from-pink-500 to-pink-600 dark:from-pink-600 dark:to-pink-700 rounded-[3rem] p-10 text-white"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-10 translate-y-[-20px] blur-3xl"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <Motion.div 
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-32 h-32 bg-white/20 backdrop-blur-md rounded-full border-4 border-white/30 flex items-center justify-center p-2"
            >
              <div className="w-full h-full bg-pink-100 dark:bg-dark-border rounded-full flex items-center justify-center text-pink-500 dark:text-pink-400">
                <Icon name="user" className="w-16 h-16" />
              </div>
            </Motion.div>
            <div className="text-center md:text-left">
              <Motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl font-black tracking-tight mb-2"
              >
                {profile?.full_name || user?.email?.split('@')[0]}
              </Motion.h1>
              <Motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="text-pink-100 font-bold flex items-center justify-center md:justify-start gap-2 italic"
              >
                <Icon name="clock" className="w-4 h-4" />
                Member since {new Date(user?.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
              </Motion.p>
            </div>
          </div>
        </Motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Details Form */}
          <Motion.div 
            variants={item}
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-dark-card rounded-[3.5rem] p-8 md:p-10 border border-pink-50 dark:border-dark-border"
          >
            <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
              <Motion.span 
                whileHover={{ rotate: 10 }}
                className="p-2 bg-pink-50 rounded-xl text-pink-500"
              >
                <Icon name="user" className="w-6 h-6" />
              </Motion.span>
              Account Details
            </h2>
            
            <form onSubmit={handleUpdateProfile} className="space-y-6 text-left">
              <div>
                 <label className="block text-xs font-black text-gray-400 dark:text-dark-muted uppercase tracking-widest mb-2 ml-1">Email Address (Read Only)</label>
                 <div className="w-full px-6 py-4 bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-dark-border rounded-2xl text-gray-400 dark:text-dark-muted/60 font-bold">
                  {user?.email}
                </div>
              </div>

              <div>
                 <label className="block text-xs font-black text-gray-400 dark:text-dark-muted uppercase tracking-widest mb-2 ml-1">Full Name</label>
                <Motion.input
                  whileFocus={{ scale: 1.01 }}
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                   placeholder="Enter your name"
                   className="w-full px-6 py-4 bg-white dark:bg-dark-bg border border-pink-100 dark:border-dark-border rounded-2xl focus:ring-4 focus:ring-50 dark:focus:ring-pink-900/10 focus:border-pink-300 transition-all font-bold text-gray-700 dark:text-dark-text placeholder:text-gray-300 dark:placeholder:text-gray-600 outline-none"
                 />
              </div>

              <Motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isUpdatingProfile}
                 className="w-full py-4 bg-pink-500 text-white rounded-2xl font-black tracking-tight hover:bg-pink-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isUpdatingProfile ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Icon name="plus" className="w-5 h-5 rotate-45" />
                )}
                Save Changes
              </Motion.button>
            </form>
          </Motion.div>

          {/* Security Form */}
          <Motion.div 
            variants={item}
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-dark-card rounded-[3.5rem] p-8 md:p-10 border border-pink-50 dark:border-dark-border"
          >
            <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
              <Motion.span 
                whileHover={{ rotate: 10 }}
                className="p-2 bg-pink-50 rounded-xl text-pink-500"
              >
                <Icon name="lock" className="w-6 h-6" />
              </Motion.span>
              Security
            </h2>

            <form onSubmit={handleUpdatePassword} className="space-y-6 text-left">
              <div>
                 <label className="block text-xs font-black text-gray-400 dark:text-dark-muted uppercase tracking-widest mb-2 ml-1">New Password</label>
                <Motion.input
                  whileFocus={{ scale: 1.01 }}
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-6 py-4 bg-white dark:bg-dark-bg border border-pink-100 dark:border-dark-border rounded-2xl focus:ring-4 focus:ring-pink-50 dark:focus:ring-pink-900/10 focus:border-pink-300 transition-all font-bold text-gray-700 dark:text-dark-text placeholder:text-gray-300 dark:placeholder:text-gray-600 outline-none"
                />
              </div>

              <div>
                 <label className="block text-xs font-black text-gray-400 dark:text-dark-muted uppercase tracking-widest mb-2 ml-1">Confirm Password</label>
                <Motion.input
                  whileFocus={{ scale: 1.01 }}
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-6 py-4 bg-white dark:bg-dark-bg border border-pink-100 dark:border-dark-border rounded-2xl focus:ring-4 focus:ring-pink-50 dark:focus:ring-pink-900/10 focus:border-pink-300 transition-all font-bold text-gray-700 dark:text-dark-text placeholder:text-gray-300 dark:placeholder:text-gray-600 outline-none"
                />
              </div>

              <Motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isUpdatingPassword}
                 className="w-full py-4 bg-gray-900 dark:bg-pink-600 text-white rounded-2xl font-black tracking-tight hover:bg-black dark:hover:bg-pink-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isUpdatingPassword ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Icon name="lock" className="w-5 h-5" />
                )}
                Update Password
              </Motion.button>
            </form>
          </Motion.div>
        </div>
      </Motion.div>
    </Layout>
  );
}
