import { useAuth } from "../../contexts/AuthContext";

export default function Dashboard() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-pink-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-500">Welcome back, {user?.email}</p>
          </div>
          <button
            onClick={() => signOut()}
            className="px-4 py-2 bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-lg font-medium transition"
          >
            Sign Out
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm h-48 flex flex-col justify-center items-center">
            <span className="text-4xl mb-2">💳</span>
            <p className="text-gray-500 font-medium">Bank Cards & Wallets</p>
            <p className="text-xs text-gray-400 mt-1">(Coming Soon)</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm h-48 flex flex-col justify-center items-center">
            <span className="text-4xl mb-2">📊</span>
            <p className="text-gray-500 font-medium">Budget Tracking</p>
            <p className="text-xs text-gray-400 mt-1">(Coming Soon)</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm h-48 flex flex-col justify-center items-center">
            <span className="text-4xl mb-2">🎯</span>
            <p className="text-gray-500 font-medium">Savings Goals</p>
            <p className="text-xs text-gray-400 mt-1">(Coming Soon)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
