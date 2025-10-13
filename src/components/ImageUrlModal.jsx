import React, { useState } from "react";
import { Link } from "lucide-react";

const ImageUrlModal = ({ isOpen, onClose, onSubmit }) => {
    const [url, setUrl] = useState("");

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (url) {
            onSubmit(url);
            setUrl("");
            onClose();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl shadow-2xl space-y-6 border border-gray-700/50 w-[480px]">
                <div className="flex items-center space-x-3 mb-2">
                    <Link size={24} className="text-orange-400" />
                    <h3 className="text-white text-2xl font-bold">Ajouter une image par URL</h3>
                </div>
                <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="https://exemple.com/image.jpg"
                    className="w-full bg-gray-900/50 text-white rounded-lg px-4 py-3 border border-gray-700 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 transition-all"
                />
                <div className="flex justify-end space-x-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-200 font-medium"
                    >
                        Annuler
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg transition-all duration-200 font-medium shadow-lg"
                    >
                        Valider
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImageUrlModal;