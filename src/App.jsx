import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from "./pages/LoginPage";
import { Loader2 } from 'lucide-react';
import GlobalPage from "./pages/GlobalPage";
import AuthCallback from "./pages/AuthCallback.jsx";
import ServerPage from "./pages/ServerPage.jsx";
import loginService from "./services/loginService.js";

// Composant principal App
const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const authCheckRef = React.useRef(false);

    useEffect(() => {
        if (!authCheckRef.current) {
            authCheckRef.current = true;
            checkAuth();
        }
    }, []);


    const checkAuth = async () => {
        try {

            const data = await loginService.checkAuth();
            console.log('Auth check data:', data);

            if (data.authenticated) {
                setIsAuthenticated(true);

                // ✅ Transformer les guilds pour avoir les bonnes URLs d'images
                const guilds = data.guilds?.map(guild => ({
                    id: guild.id,
                    name: guild.name,
                    icon: guild.icon,
                    owner: guild.owner
                })) || [];

                setUser({
                    id: data.userId,
                    username: data.username,
                    avatar: data.avatar,
                    guilds: guilds
                });
            }
        } catch (error) {
            console.error('Erreur lors de la vérification de l\'authentification:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateUser = (newUserData) => {
        setUser(newUserData);
    };

    const handleAuthSuccess = (userData) => {
        setIsAuthenticated(true);
        setUser(userData);
    };

    const handleLogout = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
            await fetch(`${apiUrl}/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            });

            setIsAuthenticated(false);
            setUser(null);
            window.location.href = '/';
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-16 h-16 text-orange-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Chargement...</p>
                </div>
            </div>
        );
    }

    // ✅ Composant pour protéger les routes et passer user
    const ProtectedRoute = ({ children }) => {
        if (!isAuthenticated || !user) {
            return <Navigate to="/" replace />;
        }
        return children;
    };

    return (
        <Router>
            <Routes>
                <Route
                    path="/"
                    element={
                        isAuthenticated ?
                            <Navigate to="/dashboard" replace /> :
                            <LoginPage />
                    }
                />

                <Route
                    path="/auth/callback"
                    element={<AuthCallback onAuthSuccess={handleAuthSuccess} />}
                />

                {/* Page d'accueil globale */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <GlobalPage user={user} onLogout={handleLogout} />
                        </ProtectedRoute>
                    }
                />

                {/* Page serveur avec ID dynamique */}
                <Route
                    path="/dashboard/server/:serverId"
                    element={
                        <ProtectedRoute>
                            <ServerPage user={user} onLogout={handleLogout} onUpdateUser={updateUser}/>
                        </ProtectedRoute>
                    }
                />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
};

export default App;