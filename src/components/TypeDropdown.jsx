import { ChevronDown, AlignLeft, List } from "lucide-react";
import React from "react";

const TypeDropdown = ({ section, onTypeChange }) => {
    const [open, setOpen] = React.useState(false);

    const options = [
        { value: "DESCRIPTION", label: "Description", icon: <AlignLeft size={18} className="text-orange-400" /> },
        { value: "LISTE", label: "Liste", icon: <List size={18} className="text-orange-400" /> }
    ];

    const current = options.find(o => o.value === section.type);

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 bg-gradient-to-r from-gray-800/80 to-gray-900/80 border border-gray-600 px-4 py-2 rounded-lg text-gray-200 font-medium hover:border-orange-400 transition-all"
            >
                {current.icone}
                <span>{current.label}</span>
                <ChevronDown size={16} className={`ml-2 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
                <div className="absolute mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden z-20">
                    {options.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => {
                                onTypeChange(section.id, opt.value);
                                setOpen(false);
                            }}
                            className={`flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-orange-500/20 text-gray-200 ${
                                opt.value === section.type ? "bg-gray-700/70" : ""
                            }`}
                        >
                            {opt.icon}
                            <span>{opt.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
export default TypeDropdown;