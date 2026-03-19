import Swal from 'sweetalert2';

/**
 * Returns a SweetAlert2 Toast mixin styled according to the current theme.
 * @param {string} theme - 'dark' or 'light'
 * @returns {Swal}
 */
export const getToast = (theme) => {
  const isDark = theme === 'dark';

  return Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: false,
    background: isDark ? '#1F2937' : '#ffffff', // dark:bg-dark-card or white
    color: isDark ? '#F9FAFB' : '#1F2937',      // dark:text-white or Gray 800
    iconColor: '#ec4899',                        // Pink 500
    customClass: {
      popup: `rounded-2xl border ${isDark ? 'border-gray-700 shadow-2xl shadow-black/50' : 'border-pink-50 shadow-lg'}`
    }
  });
};
