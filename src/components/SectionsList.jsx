import React from "react";
import { Plus } from "lucide-react";
import CharacterSection from "./CharacterSection";


const SectionsList = ({
                          sections,
                          editMode,
                          onAddSection,
                          onSectionContentChange,
                          onIconClick,
                          onSectionRename,
                          onTypeChange,
                          onRemoveSection,
                          onListItemAdd,
                          onListItemChange,
                          onListItemRemove,
                          renderIcon
                      }) => {
    return (

        <div className="p-8 space-y-8">
            {sections.map((section) => (
                <CharacterSection
                    key={section.id}
                    section={section}
                    editMode={editMode}
                    onContentChange={onSectionContentChange}
                    onIconClick={() => onIconClick(section.id)}
                    onNameChange={onSectionRename}
                    onTypeChange={onTypeChange}
                    onRemove={onRemoveSection}
                    onListItemAdd={onListItemAdd}
                    onListItemChange={onListItemChange}
                    onListItemRemove={onListItemRemove}
                    renderIcon={renderIcon}
                />
            ))}


            {editMode && (
                <button
                    onClick={onAddSection}
                    className="flex items-center space-x-2 text-indigo-400 hover:text-indigo-600"
                >
                    <Plus size={18} />
                    <span>Ajouter une rubrique</span>
                </button>
            )}
        </div>
    );
};

export default SectionsList;