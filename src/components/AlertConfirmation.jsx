import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Check } from 'lucide-react';

const AlertConfirmation = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message, 
    type = 'confirmation', // 'confirmation' | 'input' | 'danger'
    inputPlaceholder = '',
    confirmText = 'Confirmer',
    cancelText = 'Annuler',
    defaultValue = ''
}) => {
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        if (isOpen) {
            setInputValue(defaultValue);
        }
    }, [isOpen, defaultValue]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (type === 'input') {
            onConfirm(inputValue);
        } else {
            onConfirm();
        }
        onClose();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleConfirm();
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
                className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
                role="dialog"
                aria-modal="true"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-800/50">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        {type === 'danger' && <AlertTriangle className="text-red-500" size={20} />}
                        {title}
                    </h3>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-700 rounded-lg"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <p className="text-gray-300 mb-4">{message}</p>

                    {type === 'input' && (
                        <div className="mt-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={inputPlaceholder}
                                autoFocus
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
                            />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-4 bg-gray-800/30 border-t border-gray-800">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={type === 'input' && !inputValue.trim()}
                        className={`px-4 py-2 text-sm font-medium text-white rounded-lg flex items-center gap-2 transition-all ${
                            type === 'danger' 
                                ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-900/20' 
                                : 'bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-900/20'
                        } ${type === 'input' && !inputValue.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <Check size={16} />
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AlertConfirmation;