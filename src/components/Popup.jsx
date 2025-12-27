import {Check, AlertTriangle, Info, X} from 'lucide-react';

// Composant Popup
import React, {useEffect, useState} from "react";

const Popup = ({ message, type, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (message) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(onClose, 300); // Attendre la fin de l'animation
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [message, onClose]);

    if (!message) return null;

    const getPopupStyle = () => {
        switch (type) {
            case 'success':
                return {
                    bg: 'bg-gradient-to-r from-green-500 to-emerald-600',
                    icon: <Check size={20} />,
                    border: 'border-green-400'
                };
            case 'error':
                return {
                    bg: 'bg-gradient-to-r from-red-500 to-red-600',
                    icon: <AlertTriangle size={20} />,
                    border: 'border-red-400'
                };
            case 'info':
                return {
                    bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
                    icon: <Info size={20} />,
                    border: 'border-blue-400'
                };
            default:
                return {
                    bg: 'bg-gradient-to-r from-gray-500 to-gray-600',
                    icon: <Info size={20} />,
                    border: 'border-gray-400'
                };
        }
    };
    const style = getPopupStyle();

    return (
        <div className={`fixed bottom-6 right-6 z-[9999] transition-all duration-300 transform ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}>
            <div className={`${style.bg} ${style.border} border backdrop-blur-sm rounded-xl p-4 shadow-2xl min-w-80 max-w-96`}>
                <div className="flex items-center space-x-3">
                    <div className="text-white">
                        {style.icon}
                    </div>
                    <div className="flex-1">
                        <p className="text-white font-medium text-sm leading-relaxed">
                            {message}
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setIsVisible(false);
                            setTimeout(onClose, 300);
                        }}
                        className="text-white/80 hover:text-white transition-colors duration-200"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Popup;