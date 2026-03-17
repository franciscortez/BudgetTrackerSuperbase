import { Link } from "react-router-dom";

export default function TermsAndAgreement() {
  return (
    <div className="min-h-screen bg-pink-50 py-12 px-4 sm:px-6 lg:px-8 font-sans text-gray-800">
      {/* Decorative Orbs */}
      <div className="fixed top-20 left-10 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse pointer-events-none"></div>
      <div className="fixed bottom-20 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-700 pointer-events-none"></div>

      <div className="relative max-w-3xl mx-auto">
        {/* Back Button */}
        <Link
          to="/signup"
          className="inline-flex items-center gap-2 text-pink-700 hover:text-pink-800 transition-colors group mb-8"
        >
          <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="font-medium">Back to Signup</span>
        </Link>

        {/* Content Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-pink-200 p-8 md:p-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-700 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-200">
              <svg className="w-8 h-8 text-white" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M 48 20 C 40 10 30 15 35 20" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M 52 20 C 60 10 70 15 65 20" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M 48 30 C 20 -5 0 20 15 45 C 0 65 20 95 48 65 Z" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="2"/>
                <path d="M 52 30 C 80 -5 100 20 85 45 C 100 65 80 95 52 65 Z" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="2"/>
                <circle cx="25" cy="30" r="3" fill="currentColor" fillOpacity="0.2"/>
                <circle cx="75" cy="30" r="3" fill="currentColor" fillOpacity="0.2"/>
                <rect x="47" y="20" width="6" height="45" rx="3" fill="currentColor"/>
                <circle cx="50" cy="18" r="4" fill="currentColor"/>
              </svg>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Terms & Agreement
            </h1>
          </div>

          <div className="prose prose-pink max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-bold text-pink-800 border-b-2 border-pink-100 pb-2 mb-4">
                1. Welcome to PennyWings
              </h2>
              <p className="text-gray-600 leading-relaxed">
                By accessing or using PennyWings Tracker, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not access or use our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-pink-800 border-b-2 border-pink-100 pb-2 mb-4">
                2. Your Account & Data
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                To use our service, you must create an account. You are responsible for maintaining the confidentiality of your account credentials.
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                <li>We use Supabase for secure authentication and data storage.</li>
                <li>Your financial data is private and accessible only to you through Row Level Security (RLS).</li>
                <li>You maintain ownership of all data you input into the system.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-pink-800 border-b-2 border-pink-100 pb-2 mb-4">
                3. Privacy & Security
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Your privacy is our priority. We do not sell your personal or financial information. We industry-standard encryption provided by Supabase to ensure your data stays safe.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-pink-800 border-b-2 border-pink-100 pb-2 mb-4">
                4. Acceptable Use
              </h2>
              <p className="text-gray-600 leading-relaxed">
                You agree not to use the service for any illegal purposes or to attempt to breach our security measures. We reserve the right to terminate accounts that violate these terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-pink-800 border-b-2 border-pink-100 pb-2 mb-4">
                5. Changes to Terms
              </h2>
              <p className="text-gray-600 leading-relaxed">
                We may update these terms from time to time. Continued use of the service after such changes constitutes your acceptance of the new terms.
              </p>
            </section>

            <div className="pt-8 text-center text-sm text-gray-400 italic">
              Last Updated: March 17, 2026
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/signup"
            className="inline-block px-10 py-4 bg-gradient-to-r from-pink-600 to-pink-800 hover:from-pink-700 hover:to-pink-900 text-white font-bold rounded-full shadow-lg shadow-pink-300/50 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
          >
            I Understand, Let's Go!
          </Link>
        </div>
      </div>
    </div>
  );
}
