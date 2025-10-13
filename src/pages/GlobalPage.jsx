import React, {useState} from 'react';
import {Newspaper, TrendingUp, Calendar, Trophy, Users, Zap, MessageSquare, Bell} from 'lucide-react';
import Sidebar from "../components/Sidebar.jsx";
import Navbar from "../components/Navbar.jsx";
import {useNavigate} from "react-router-dom";
const GlobalPage = ({ user }) => {
    const [currentPage, setCurrentPage] = useState("accueil");
    const navigate = useNavigate();
    const news = [
        {
            id: 1,
            title: "Nouvelle mise à jour v2.0",
            description: "Découvrez les nouvelles fonctionnalités : système de quêtes, statistiques avancées et bien plus !",
            date: "Il y a 2 jours",
            category: "Mise à jour",
            color: "from-blue-500 to-cyan-500",
            icon: <Zap className="w-5 h-5" />
        },
        {
            id: 2,
            title: "Événement communautaire",
            description: "Participez au grand tournoi RPG ce week-end ! Des récompenses exclusives à gagner.",
            date: "Il y a 3 jours",
            category: "Événement",
            color: "from-purple-500 to-pink-500",
            icon: <Trophy className="w-5 h-5" />
        },
        {
            id: 3,
            title: "Nouveaux serveurs partenaires",
            description: "5 nouveaux serveurs ont rejoint la communauté RPG Dashboard cette semaine.",
            date: "Il y a 5 jours",
            category: "Communauté",
            color: "from-orange-500 to-red-500",
            icon: <Users className="w-5 h-5" />
        },
        {
            id: 4,
            title: "Guide : Optimiser vos personnages",
            description: "Apprenez les meilleures techniques pour développer vos personnages efficacement.",
            date: "Il y a 1 semaine",
            category: "Guide",
            color: "from-green-500 to-emerald-500",
            icon: <MessageSquare className="w-5 h-5" />
        }
    ];

    const globalStats = [
        {
            icon: <Users className="w-6 h-6" />,
            label: "Utilisateurs actifs",
            value: "12.5K",
            trend: "+15%",
            color: "from-blue-500 to-cyan-500",
            bgColor: "bg-blue-500/20"
        },
        {
            icon: <Newspaper className="w-6 h-6" />,
            label: "Personnages créés",
            value: "45.2K",
            trend: "+23%",
            color: "from-purple-500 to-pink-500",
            bgColor: "bg-purple-500/20"
        },
        {
            icon: <Trophy className="w-6 h-6" />,
            label: "Quêtes complétées",
            value: "128K",
            trend: "+8%",
            color: "from-orange-500 to-red-500",
            bgColor: "bg-orange-500/20"
        },
        {
            icon: <Calendar className="w-6 h-6" />,
            label: "Serveurs actifs",
            value: "2.8K",
            trend: "+12%",
            color: "from-green-500 to-emerald-500",
            bgColor: "bg-green-500/20"
        }
    ];

    const announcements = [
        {
            type: "warning",
            title: "Maintenance planifiée",
            message: "Une maintenance est prévue dimanche de 2h à 4h du matin.",
            icon: <Bell className="w-5 h-5 text-yellow-400" />
        },
        {
            type: "info",
            title: "Nouveaux tutoriels disponibles",
            message: "Consultez notre nouvelle section d'aide pour mieux utiliser le dashboard.",
            icon: <MessageSquare className="w-5 h-5 text-blue-400" />
        }
    ];

    const handleSelectServer = (server) => {
        if (server) {
            navigate(`/dashboard/server/${server.id}`);
        } else {
            navigate('/dashboard');
        }
    };
    return (

        <div className="flex-1 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 ml-20 h-screen overflow-y-auto pt-20 px-6 pb-6 scrollbar-custom">

            {/* Header de bienvenue */}
            <div className="mb-8 scrollbar-custom">
                <Sidebar username={user.username} avatar={user.avatar} servers={user.guilds} onSelectServer={handleSelectServer} />
                <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
                            Bienvenue, {user?.username || 'Aventurier'} !
                        </h1>
                        <p className="text-gray-400 text-lg">Découvrez les dernières actualités de la communauté</p>
                    </div>
                </div>
            </div>

            {/* Annonces importantes */}
            {announcements.length > 0 && (
                <div className="mb-8 space-y-3">
                    {announcements.map((announcement, index) => (
                        <div
                            key={index}
                            className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-center space-x-4"
                        >
                            <div className="p-2 bg-yellow-500/20 rounded-lg">
                                {announcement.icon}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-white font-bold text-sm">{announcement.title}</h3>
                                <p className="text-gray-300 text-sm">{announcement.message}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Statistiques globales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {globalStats.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 hover:scale-105 transition-all duration-300 hover:shadow-2xl"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 ${stat.bgColor} rounded-xl`}>
                                {stat.icon}
                            </div>
                            <span className="text-green-400 text-sm font-bold">{stat.trend}</span>
                        </div>
                        <div className={`text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${stat.color} mb-2`}>
                            {stat.value}
                        </div>
                        <p className="text-gray-400 text-sm">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Section principale - News */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center">
                        <Newspaper className="w-6 h-6 text-orange-500 mr-2" />
                        Actualités & Mises à jour
                    </h2>
                    <button className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-xl transition-all duration-200 text-sm font-medium">
                        Voir tout
                    </button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {news.map((item) => (
                        <div
                            key={item.id}
                            className="group bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 hover:border-orange-500/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 bg-gradient-to-r ${item.color} rounded-xl`}>
                                    {item.icon}
                                </div>
                                <span className="text-xs text-gray-500 bg-gray-900/50 px-3 py-1 rounded-full">
                  {item.category}
                </span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
                                {item.title}
                            </h3>
                            <p className="text-gray-400 text-sm leading-relaxed mb-4">
                                {item.description}
                            </p>
                            <div className="flex items-center justify-between">
                <span className="text-gray-500 text-xs flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                    {item.date}
                </span>
                                <span className="text-orange-400 text-sm font-medium group-hover:translate-x-1 transition-transform inline-flex items-center">
                  Lire plus →
                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Section Quick Start */}
            <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <Zap className="w-5 h-5 text-orange-400 mr-2" />
                    Démarrage rapide
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/30">
                        <div className="text-2xl mb-2">📖</div>
                        <h4 className="text-white font-bold text-sm mb-1">Guide d'utilisation</h4>
                        <p className="text-gray-400 text-xs">Apprenez à utiliser toutes les fonctionnalités</p>
                    </div>
                    <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/30">
                        <div className="text-2xl mb-2">🎮</div>
                        <h4 className="text-white font-bold text-sm mb-1">Créer un personnage</h4>
                        <p className="text-gray-400 text-xs">Démarrez votre aventure RPG</p>
                    </div>
                    <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/30">
                        <div className="text-2xl mb-2">💬</div>
                        <h4 className="text-white font-bold text-sm mb-1">Rejoindre la communauté</h4>
                        <p className="text-gray-400 text-xs">Connectez-vous avec d'autres joueurs</p>
                    </div>
                </div>
            </div>

            {/* Message info */}
            <div className="mt-8 text-center">
                <p className="text-gray-500 text-sm">
                    💡 <strong>Astuce :</strong> Cliquez sur un serveur dans la barre latérale pour accéder aux fonctionnalités spécifiques
                </p>
            </div>
        </div>
    );
};

export default GlobalPage;