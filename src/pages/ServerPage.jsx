import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Crown, Activity, TrendingUp, Star, MessageSquare, Calendar, Shield, LogOut, Loader2 } from 'lucide-react';
import Sidebar from "../components/Sidebar.jsx";
import Navbar from "../components/Navbar.jsx";
import ForumPage from "./ForumPage.jsx";
import DetailPage from "./DetailPage.jsx";
import ItemsManagementPage from "./ItemsManagementPage.jsx";

const ServerPage = ({ user, onLogout, onUpdateUser }) => {
    const { serverId } = useParams();
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState("home");
    const [serverData, setServerData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [characterId, setCharacterId] = useState(null);

    // Trouver le serveur dans les guilds de l'utilisateur
    const currentServer = user?.guilds?.find(guild => guild.id === serverId);

    useEffect(() => {
        // Vérifier si le serveur existe
        if (!currentServer) {
            navigate('/dashboard');
            return;
        }

        // Ne charger les données que si les membres n'existent pas déjà
        const hasLoaded = currentServer.members;
        if (!hasLoaded) {
            fetchServerData();
        } else {
            setLoading(false);
        }
    }, [serverId]); // Dépendances modifiées

    const fetchServerData = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
            const response = await fetch(`${apiUrl}/guilds/${serverId}/members`, {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                const updatedGuilds = user.guilds.map(guild => {
                    if (guild.id === serverId) {
                        return {
                            ...guild,
                            members: data.body
                        };
                    }
                    return guild;
                });

                onUpdateUser({
                    ...user,
                    guilds: updatedGuilds
                });
                setServerData(data.body);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des données du serveur:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectServer = (server) => {
        if (server) {
            navigate(`/dashboard/server/${server.id}`);
        } else {
            navigate('/dashboard');
        }
    };

    const isOwner = currentServer?.owner === 'true' || currentServer?.owner === true;

    // Données mockées pour l'exemple
    const serverStats = [
        {
            icon: <Users className="w-6 h-6" />,
            label: "Membres actifs",
            value: currentServer?.members?.length || "0",
            color: "from-blue-500 to-cyan-500",
            bgColor: "bg-blue-500/20"
        },
        {
            icon: <Activity className="w-6 h-6" />,
            label: "Personnages",
            value: serverData?.charactersCount || "89",
            color: "from-purple-500 to-pink-500",
            bgColor: "bg-purple-500/20"
        },
        {
            icon: <TrendingUp className="w-6 h-6" />,
            label: "Niveau moyen",
            value: serverData?.averageLevel || "24",
            color: "from-orange-500 to-red-500",
            bgColor: "bg-orange-500/20"
        },
        {
            icon: <Star className="w-6 h-6" />,
            label: "Quêtes actives",
            value: serverData?.activeQuests || "12",
            color: "from-yellow-500 to-orange-500",
            bgColor: "bg-yellow-500/20"
        }
    ];

    const recentActivity = serverData?.recentActivity || [
        {
            user: "Aragorn",
            action: "a créé un nouveau personnage",
            detail: "Elendil le Sage",
            time: "Il y a 15 min",
            avatar: "https://cdn.discordapp.com/embed/avatars/0.png"
        },
        {
            user: "Legolas",
            action: "a atteint le niveau",
            detail: "Niveau 30",
            time: "Il y a 1 heure",
            avatar: "https://cdn.discordapp.com/embed/avatars/1.png"
        }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
                <Loader2 className="w-16 h-16 text-orange-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-900">
            <Sidebar
                username={user.username}
                avatar={user.avatar}
                servers={user?.guilds || []}
                selectedServer={currentServer}
                onSelectServer={handleSelectServer}
                onSetCurrentPage={setCurrentPage}
            />

            {/* Navbar avec l'ID du serveur */}
            <Navbar
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                serverId={serverId}
                onLogout={onLogout}
            />

            {/* Contenu principal */}
            {/* Si on est sur la page de détail, on enlève le scroll du conteneur parent pour laisser DetailPage gérer son scroll */}
            <div className={`flex-1 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 ml-20 h-screen pt-20 px-6 pb-6 scrollbar-custom ${currentPage === 'detail' ? 'overflow-hidden' : 'overflow-y-auto'}`}>
                {/* Page d'accueil du serveur */}
                {currentPage === "home" && (
                    <>
                        {/* Header du serveur */}
                        <div className="flex-shrink-0 p-6 pb-0">
                            <div className="mb-8">
                                <div className="flex items-center space-x-4 mb-4">
                                    {currentServer?.icon ? (
                                        <img
                                            src={currentServer.icon}
                                            alt={currentServer.name}
                                            className="w-20 h-20 rounded-2xl border-4 border-orange-500 shadow-2xl"
                                        />
                                    ) : (
                                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-3xl shadow-2xl border-4 border-orange-500">
                                            {currentServer?.name?.substring(0, 2).toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 flex items-center">
                                            {currentServer?.name || 'Serveur'}
                                            {isOwner && (
                                                <Crown className="w-6 h-6 text-yellow-400 ml-2" title="Propriétaire" />
                                            )}
                                        </h1>
                                        <p className="text-gray-400 text-lg">
                                            Dashboard de gestion du serveur
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Statistiques du serveur */}
                        <div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-custom">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                {serverStats.map((stat, index) => (
                                    <div
                                        key={index}
                                        className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 hover:scale-105 transition-all duration-300 hover:shadow-2xl"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`p-3 ${stat.bgColor} rounded-xl`}>
                                                {stat.icon}
                                            </div>
                                            <div className={`text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${stat.color}`}>
                                                {stat.value}
                                            </div>
                                        </div>
                                        <p className="text-gray-400 text-sm">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>



                        {/* Activité récente */}
                        <div className="flex-1 overflow-y-auto px-6 pb-6">
                            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 mb-8">
                                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                                    <Activity className="w-6 h-6 text-orange-500 mr-2" />
                                    Activité récente
                                </h2>
                                <div className="space-y-4">
                                    {recentActivity.map((activity, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center space-x-4 p-4 bg-gray-900/50 rounded-xl hover:bg-gray-900/70 transition-all duration-200 border border-gray-700/30 hover:border-orange-500/30"
                                        >
                                            <img
                                                src={activity.avatar}
                                                alt={activity.user}
                                                className="w-12 h-12 rounded-full border-2 border-gray-700"
                                            />
                                            <div className="flex-1">
                                                <p className="text-white">
                                                    <span className="font-bold text-orange-400">{activity.user}</span>
                                                    {' '}{activity.action}
                                                </p>
                                                <p className="text-gray-400 text-sm">{activity.detail}</p>
                                            </div>
                                            <span className="text-gray-500 text-xs">{activity.time}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>


                        {/* Actions rapides pour propriétaire */}
                        {!isOwner && (
                            <div className="flex-1 overflow-y-auto px-6 pb-6">
                                <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-2xl p-6">
                                    <div className="flex items-start space-x-4">
                                        <div className="p-3 bg-orange-500/20 rounded-xl">
                                            <Shield className="w-6 h-6 text-orange-400" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-white mb-2">Outils d'administration</h3>
                                            <p className="text-gray-300 text-sm mb-4">
                                                En tant que propriétaire, vous avez accès à des fonctionnalités avancées de gestion.
                                            </p>
                                            <div className="flex space-x-3">
                                                <button className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-xl transition-all duration-200 text-sm font-medium">
                                                    Gérer les membres
                                                </button>
                                                <button
                                                    onClick={() => setCurrentPage('configuration')}
                                                    className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-xl transition-all duration-200 text-sm font-medium"
                                                >
                                                    Paramètres du serveur
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        )}
                    </>
                )}

                {/* Pages spécifiques (Forum, Détails, Objets, Configuration) */}
                {currentPage === "forum" && (
                    <ForumPage onSelectCharacterId={setCharacterId} serverId={serverId} members={currentServer?.members} onNavigate={setCurrentPage} onBack={() => setCurrentPage('home') } userId={user.id} />
                )}

                {currentPage === "detail" && (
                    <DetailPage characterId={characterId} onBack={() => setCurrentPage('forum')} onSave={null}/>
                )}

                {currentPage === "objets" && (
                    <ItemsManagementPage serverId={serverId} onBack={() => setCurrentPage('home')} />
                )}

                {currentPage === "configuration" && (
                    <div className="text-center py-20">
                        <h2 className="text-3xl font-bold text-white mb-4">Configuration du serveur</h2>
                        <p className="text-gray-400">Serveur ID: {serverId}</p>
                        <p className="text-gray-500 text-sm mt-2">Page à implémenter</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ServerPage;