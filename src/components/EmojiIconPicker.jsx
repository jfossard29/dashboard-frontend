// EmojiPicker.jsx
import React, { useEffect, useRef } from "react";

const EmojiPicker = ({ emojiList, onEmojiSelect }) => {
    const pickerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                onEmojiSelect(null); // Ferme le picker lorsqu'on clique à l'extérieur
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onEmojiSelect]);

    return (
        <div ref={pickerRef} className="emoji-picker">
            {emojiList.map((emoji, index) => (
                <button
                    key={index}
                    className="emoji-button"
                    onClick={() => onEmojiSelect(emoji)}
                >
                    {emoji}
                </button>
            ))}
        </div>
    );
};

export default EmojiPicker;