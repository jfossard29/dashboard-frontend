import React from "react";

const LoginPage = ({ handleLogin }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl flex items-center justify-center text-4xl shadow-2xl">
          🤖
        </div>

        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 mb-4">
          RPG Bot Dashboard
        </h1>
        <p className="text-gray-400 text-lg leading-relaxed mb-8">
          Gérez vos personnages RPG et plongez dans leurs histoires épiques
        </p>

        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 p-8 rounded-2xl border border-gray-700/50 shadow-2xl">
          <button
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition transform hover:scale-105 shadow-lg flex items-center justify-center space-x-3"
          >
            <span>Se connecter avec Discord</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
