import React from "react";

const ImageViewModal = ({ isOpen, onClose, imageUrl, altText }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-8"
            onClick={onClose}
        >
            <div className="relative max-w-5xl max-h-full">
                <img
                    src={imageUrl}
                    alt={altText}
                    className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                />
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 bg-gray-800/80 hover:bg-gray-700 text-white rounded-full p-3 transition-all"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default ImageViewModal;