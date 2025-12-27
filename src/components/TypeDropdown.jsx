import { ChevronDown, AlignLeft, List, Shield, Sword, Sparkles, Gem, Footprints, CircleDot, Crown, Shirt, Axe } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const TypeDropdown = ({ value, onChange, options = [], colors = {}, label }) => {
    const [open, setOpen] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
    const dropdownRef = useRef(null); // Le conteneur principal
    const buttonRef = useRef(null);   // Le bouton déclencheur
    const menuRef = useRef(null);     // Le menu dans le portail

    const current = options.find(o => o.value === value);

    // Default colors if not provided
    const defaultColors = {
        bg: 'from-gray-800 to-gray-900',
        border: 'border-gray-700',
        borderFocus: 'border-gray-500',
        textColor: 'text-gray-300'
    };

    const effectiveColors = { ...defaultColors, ...colors };

    useEffect(() => {
        const handleClickOutside = (event) => {
            // Si le clic est dans le bouton, on laisse le onClick du bouton gérer
            if (buttonRef.current && buttonRef.current.contains(event.target)) {
                return;
            }

            // Si le clic est dans le menu (portail), on ne ferme pas (le onClick des items le fera)
            if (menuRef.current && menuRef.current.contains(event.target)) {
                return;
            }

            // Sinon on ferme
            setOpen(false);
        };
        
        const handleScroll = () => {
            if (open) setOpen(false);
        };

        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
            window.addEventListener("scroll", handleScroll, true);
            window.addEventListener("resize", handleScroll);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("scroll", handleScroll, true);
            window.removeEventListener("resize", handleScroll);
        };
    }, [open]);

    const toggleOpen = () => {
        if (!open && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width
            });
        }
        setOpen(!open);
    };

    const iconMap = {
        // Types
        EQUIPEMENT: <Shield size={18} />,
        CONSOMMABLE: <Sparkles size={18} />,
        AUTRE: <Gem size={18} />,
        // Parties
        tete: <Crown size={18} />,
        torse: <Shirt size={18} />,
        pieds: <Footprints size={18} />,
        deux_mains: <Axe size={18} />,
        main_droite: <Sword size={18} />,
        main_gauche: <Shield size={18} />,
        accessoire1: <CircleDot size={18} />,
        accessoire2: <CircleDot size={18} />,
        autre: <Sparkles size={18} />,
        // Sections
        DESCRIPTION: <AlignLeft size={18} />,
        LISTE: <List size={18} />
    };

    const renderIcon = (val) => {
        const Icon = iconMap[val];
        if (Icon) {
            return React.cloneElement(Icon, { className: `text-${effectiveColors.textColor}` });
        }
        return null;
    };

    return (
        <div className={`bg-gradient-to-br ${effectiveColors.bg} border-2 ${effectiveColors.border} rounded-xl p-2`} ref={dropdownRef}>
            {label && <label className={`block ${effectiveColors.textColor} text-xs font-bold mb-1 uppercase tracking-wider`}>{label}</label>}
            <div className="relative">
                <button
                    ref={buttonRef}
                    type="button"
                    onClick={toggleOpen}
                    className={`w-full flex items-center justify-between bg-black/40 hover:bg-black/60 border-2 ${effectiveColors.borderFocus} rounded-lg px-3 py-1.5 text-white font-bold outline-none transition-all text-sm`}
                >
                    <div className="flex items-center gap-2 truncate">
                        {renderIcon(value)}
                        <span className="truncate">{current?.label || 'Sélectionner...'}</span>
                    </div>
                    <ChevronDown size={14} className={`transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`} />
                </button>

                {open && createPortal(
                    <div 
                        ref={menuRef}
                        className="fixed z-[9999] bg-gray-900 border border-gray-700 rounded-lg shadow-xl overflow-hidden min-w-[150px]"
                        style={{
                            top: `${coords.top + 4}px`,
                            left: `${coords.left}px`,
                            width: `${coords.width}px`
                        }}
                    >
                        {options.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={(e) => {
                                    e.stopPropagation(); // Empêche la propagation
                                    onChange(opt.value);
                                    setOpen(false);
                                }}
                                className={`flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-white/10 text-gray-200 transition-colors text-sm ${
                                    opt.value === value ? "bg-white/20" : ""
                                }`}
                            >
                                {renderIcon(opt.value)}
                                <span>{opt.label}</span>
                            </button>
                        ))}
                    </div>,
                    document.body
                )}
            </div>
        </div>
    );
};
export default TypeDropdown;