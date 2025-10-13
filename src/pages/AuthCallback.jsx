import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

// Composant pour gérer le callback OAuth2
const AuthCallback = ({ onAuthSuccess }) => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const hasCalledBackend = React.useRef(false);

    useEffect(() => {
        const handleCallback = async () => {
            // Si déjà appelé, on sort
            if (hasCalledBackend.current) return;

            const code = searchParams.get('code');
            const errorParam = searchParams.get('error');

            if (errorParam) {
                setError(`Erreur d'authentification: ${errorParam}`);
                setLoading(false);
                setTimeout(() => navigate('/'), 3000);
                return;
            }

            if (!code) {
                setError('Code d\'autorisation manquant');
                setLoading(false);
                setTimeout(() => navigate('/'), 3000);
                return;
            }

            // On marque comme traité avant l'appel API
            hasCalledBackend.current = true;

            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
                const response = await fetch(
                    `${apiUrl}/auth/callback?code=${code}`,
                    {
                        method: 'GET',
                        credentials: 'include'
                    }
                );

                const data = await response.json();

                if (data.success) {
                    onAuthSuccess(data.user);
                    navigate('/dashboard', { replace: true });
                } else {
                    setError(data.message || 'Erreur d\'authentification');
                    setLoading(false);
                    setTimeout(() => navigate('/', { replace: true }), 3000);
                }
            } catch (err) {
                console.error('❌ Erreur lors du callback:', err);
                setError('Erreur de connexion au serveur');
                setLoading(false);
                setTimeout(() => navigate('/', { replace: true }), 3000);
            }
        };

        handleCallback();
    }, []);


    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
            <div className="text-center">
                {loading && !error && (
                    <>
                        <Loader2 className="w-16 h-16 text-orange-500 animate-spin mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-white mb-2">Connexion en cours...</h2>
                        <p className="text-gray-400">Authentification avec Discord</p>
                    </>
                )}
                {error && (
                    <div className="bg-red-500/20 border border-red-500 rounded-2xl p-6 max-w-md">
                        <div className="text-red-500 text-5xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold text-white mb-2">Erreur d'authentification</h2>
                        <p className="text-gray-300 mb-4">{error}</p>
                        <p className="text-sm text-gray-400">Redirection vers la page d'accueil...</p>
                    </div>
                )}
                {!loading && !error && (
                    <div className="bg-green-500/20 border border-green-500 rounded-2xl p-6 max-w-md">
                        <div className="text-green-500 text-5xl mb-4">✓</div>
                        <h2 className="text-2xl font-bold text-white mb-2">Authentification réussie !</h2>
                        <p className="text-gray-300">Redirection vers votre dashboard...</p>
                    </div>
                )}
            </div>
        </div>
    );
};


export default AuthCallback;