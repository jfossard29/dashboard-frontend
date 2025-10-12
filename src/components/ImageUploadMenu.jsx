import React, { useRef } from "react";
import { Upload, Link } from "lucide-react";

const ImageUploadMenu = ({ isOpen, onClose, onFileUpload, onUrlUpload, menuRef }) => {
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                onFileUpload(reader.result);
                onClose();
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div
            ref={menuRef}
            className="absolute top-36 left-40 bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-md text-white border border-gray-700/50 rounded-xl shadow-2xl z-40 w-64 overflow-hidden"
        >
            <button
                className="flex items-center px-4 py-3 hover:bg-gradient-to-r hover:from-orange-500/20 hover:to-red-500/20 w-full text-left transition-all duration-200 border-b border-gray-700/30"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
            >
                <Upload size={18} className="mr-3 text-orange-400" />
                <span className="text-gray-200">Importer un fichier</span>
            </button>
            <button
                className="flex items-center px-4 py-3 hover:bg-gradient-to-r hover:from-orange-500/20 hover:to-red-500/20 w-full text-left transition-all duration-200 border-b border-gray-700/30"
                onClick={onUrlUpload}
            >
                <Link size={18} className="mr-3 text-orange-400" />
                <span className="text-gray-200">Utiliser une URL</span>
            </button>
            <div className="p-3 text-xs text-gray-400 bg-gray-900/50">
                <div>📁 Formats : PNG, JPG, JPEG</div>
            </div>
            <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
            />
        </div>
    );
};

export default ImageUploadMenu;