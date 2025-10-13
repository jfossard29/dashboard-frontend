import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Edit2, Save } from "lucide-react";
import * as LucideIcons from "lucide-react";
import "../Scrollbar.css";
import EmojiIconPicker from "../components/EmojiIconPicker";
import ImageUploadMenu from "../components/ImageUploadMenu";
import ImageUrlModal from "../components/ImageUrlModal";
import ImageViewModal from "../components/ImageViewModal";
import CharacterHeader from "../components/CharacterHeader";
import SectionsList from "../components/SectionsList";
import {emojiSet, lucideSet} from "../data/emoji.js";

const DetailPage = ({ characterId, serverId, onBack }) => {
    const [character, setCharacter] = useState(null);
    const [editedCharacter, setEditedCharacter] = useState(null);
    const [originalCharacter, setOriginalCharacter] = useState(null); // ✅ Pour détecter les changements
    const [editMode, setEditMode] = useState(false);
    const [showImageMenu, setShowImageMenu] = useState(false);
    const [showUrlInput, setShowUrlInput] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(null);
    const [showImageModal, setShowImageModal] = useState(false);
    const [lastId, setLastId] = useState(0);
    const [saving, setSaving] = useState(false);
    const imageWrapperRef = useRef(null);
    const imageMenuRef = useRef(null);

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    useEffect(() => {
        if (!characterId) return;

        const fetchCharacter = async () => {
            try {
                const response = await fetch(
                    `http://localhost:8080/personnage/${characterId}`, {
                        method: 'GET',
                        credentials: 'include',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                    });
                const data = await response.json();

                if (data.code === 200 && data.body) {
                    const c = data.body;

                    const mappedCharacter = {
                        id: c.id,
                        prenom: c.prenom,
                        nom: c.nom,
                        image: c.image,
                        story: c.histoire,
                        level: c.niveau,
                        experience: c.experience,
                        power: 0,
                        abilities: [],
                        customSections: (c.rubriques || []).map((r) => ({
                            id: r.id,
                            ordre: r.ordre,
                            titre: r.titre,
                            type: r.type,
                            contenu: r.contenu,
                            icone: r.icone,
                            obligatoire: r.obligatoire,
                        })),
                    };

                    setLastId(mappedCharacter.customSections[mappedCharacter.customSections.length - 1]?.id || 0);
                    setCharacter(mappedCharacter);
                    setEditedCharacter(mappedCharacter);
                    setOriginalCharacter(JSON.parse(JSON.stringify(mappedCharacter))); // ✅ Deep copy
                }
            } catch (error) {
                console.error("Erreur lors du fetch personnage :", error);
            }
        };

        fetchCharacter();
    }, [characterId]);

    useEffect(() => {
        const handleDocClick = (e) => {
            if (!showImageMenu) return;
            const menu = imageMenuRef.current;
            const wrapper = imageWrapperRef.current;
            if (
                menu &&
                !menu.contains(e.target) &&
                wrapper &&
                !wrapper.contains(e.target)
            ) {
                setShowImageMenu(false);
            }
        };
        document.addEventListener("mousedown", handleDocClick);
        return () => document.removeEventListener("mousedown", handleDocClick);
    }, [showImageMenu]);

    if (!character) {
        return (
            <div className="flex-1 flex items-center justify-center text-gray-400">
                Chargement du personnage...
            </div>
        );
    }

    // ✅ Fonction pour détecter les changements
    const getChangedFields = () => {
        const changes = {};

        // Comparer les champs simples
        if (editedCharacter.prenom !== originalCharacter.prenom) changes.prenom = editedCharacter.prenom;
        if (editedCharacter.nom !== originalCharacter.nom) changes.nom = editedCharacter.nom;
        if (editedCharacter.image !== originalCharacter.image) changes.image = editedCharacter.image;
        if (editedCharacter.level !== originalCharacter.level) changes.niveau = editedCharacter.level;
        if (editedCharacter.experience !== originalCharacter.experience) changes.experience = editedCharacter.experience;

        // Comparer les rubriques
        const originalSections = JSON.stringify(originalCharacter.customSections);
        const editedSections = JSON.stringify(editedCharacter.customSections);

        if (originalSections !== editedSections) {
            changes.rubriques = editedCharacter.customSections;
        }

        return changes;
    };

    // ✅ Fonction de sauvegarde optimisée
    const saveChanges = async () => {
        const changes = getChangedFields();

        if (Object.keys(changes).length === 0) {
            console.log("Aucune modification détectée");
            setEditMode(false);
            return;
        }

        console.log("Changements détectés:", changes);
        setSaving(true);

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
            const response = await fetch(`${apiUrl}/personnage/${characterId}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(changes)
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Sauvegarde réussie:", data);

                // Mettre à jour les références
                setCharacter(editedCharacter);
                setOriginalCharacter(JSON.parse(JSON.stringify(editedCharacter)));
                setEditMode(false);
                setShowImageMenu(false);
                setShowUrlInput(false);
                setShowEmojiPicker(null);
            } else {
                console.error("Erreur lors de la sauvegarde:", response.status);
                alert("Erreur lors de la sauvegarde");
            }
        } catch (error) {
            console.error("Erreur réseau:", error);
            alert("Erreur de connexion au serveur");
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field, value) => {
        setEditedCharacter({ ...editedCharacter, [field]: value });
    };

    const handleSectionContentChange = (sectionId, value) => {
        setEditedCharacter({
            ...editedCharacter,
            customSections: editedCharacter.customSections.map((section) =>
                section.id === sectionId ? { ...section, contenu: value } : section
            ),
        });
    };

    const handleAddSection = () => {
        const newSection = {
            id: lastId + 1,
            titre: "Nouvelle Section",
            contenu: [],
            type: "DESCRIPTION",
            icone: null,
            obligatoire: false,
            ordre: lastId + 1,
        };
        setLastId(lastId + 1);
        setEditedCharacter({
            ...editedCharacter,
            customSections: [...editedCharacter.customSections, newSection],
        });
    };

    const handleSectionRename = (sectionId, newName) => {
        setEditedCharacter({
            ...editedCharacter,
            customSections: editedCharacter.customSections.map((section) =>
                section.id === sectionId ? { ...section, titre: newName } : section
            ),
        });
    };

    const handleRemoveSection = (sectionId) => {
        setEditedCharacter({
            ...editedCharacter,
            customSections: editedCharacter.customSections
                .filter((section) => section.id !== sectionId)
                .map((section, index) => ({...section, ordre: index + 1})),
        });
    };

    const handleIconChange = (sectionId, newIcon) => {
        setEditedCharacter({
            ...editedCharacter,
            customSections: editedCharacter.customSections.map((section) =>
                section.id === sectionId ? { ...section, icone: newIcon } : section
            ),
        });
    };

    const handleTypeChange = (sectionId, newType) => {
        setEditedCharacter((prevCharacter) => ({
            ...prevCharacter,
            customSections: prevCharacter.customSections.map((section) => {
                if (section.id !== sectionId) return section;

                const typeCache = section.typeCache || {};
                const updatedCache = {
                    ...typeCache,
                    [section.type]: section.contenu,
                };

                let newContent = updatedCache[newType];

                if (newType === "LISTE" && !Array.isArray(newContent)) {
                    newContent = [];
                }

                if (newType === "DESCRIPTION" && (newContent === undefined || Array.isArray(newContent))) {
                    newContent = "";
                }

                return {
                    ...section,
                    type: newType,
                    contenu: newContent,
                    typeCache: updatedCache,
                };
            }),
        }));
    };

    const handleListItemAdd = (sectionId) => {
        setEditedCharacter({
            ...editedCharacter,
            customSections: editedCharacter.customSections.map((section) => {
                if (section.id === sectionId) {
                    const newItem = {
                        id: section.contenu.length + 1,
                        titre: "Nouvel Item",
                        contenu: "",
                    };
                    return { ...section, contenu: [...section.contenu, newItem] };
                }
                return section;
            }),
        });
    };

    const handleListItemChange = (sectionId, itemId, updatedItem) => {
        setEditedCharacter({
            ...editedCharacter,
            customSections: editedCharacter.customSections.map((section) => {
                if (section.id === sectionId) {
                    const updatedSubSections = section.contenu.map((item) =>
                        item.id === itemId ? updatedItem : item
                    );
                    return { ...section, contenu: updatedSubSections };
                }
                return section;
            }),
        });
    };

    const handleListItemRemove = (sectionId, itemId) => {
        setEditedCharacter({
            ...editedCharacter,
            customSections: editedCharacter.customSections.map((section) => {
                if (section.id !== sectionId) return section;
                const updatedList = section.contenu.filter((item) => item.id !== itemId);
                return { ...section, contenu: updatedList };
            }),
        });
    };

    const renderIcon = (iconName) => {
        if(iconName) {
            if (emojiSet.has(iconName)) {
                return <span className="text-2xl">{iconName}</span>;
            } else if (lucideSet.has(iconName)) {
                const IconComponent = LucideIcons[iconName];
                if (IconComponent) {
                    return <IconComponent size={24} className="text-orange-400"/>;
                }
            }
        }
        return <span className="text-2xl">❌</span>;
    };

    const handleImageClick = () => {
        if (editMode) {
            setShowImageMenu((s) => !s);
        } else {
            setShowImageModal(true);
        }
    };

    return (
        <>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={onBack}
                    className="flex items-center space-x-2 text-orange-400 hover:text-orange-300"
                >
                    <ArrowLeft size={20} />
                    <span>Retour</span>
                </button>

                {editMode ? (
                    <button
                        onClick={saveChanges}
                        disabled={saving}
                        className={`flex items-center space-x-2 ${
                            saving ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                        } text-white px-4 py-2 rounded-lg shadow`}
                    >
                        <Save size={18} />
                        <span>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
                    </button>
                ) : (
                    <button
                        onClick={() => {
                            setEditMode(true);
                            setShowImageMenu(false);
                            setShowUrlInput(false);
                        }}
                        className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow"
                    >
                        <Edit2 size={18} />
                        <span>Éditer</span>
                    </button>
                )}
            </div>

            {/* Bloc principal */}
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden shadow-2xl overflow-y-auto scrollbar-custom max-h-[calc(100vh-8rem)]">
                <CharacterHeader
                    character={editedCharacter}
                    editMode={editMode}
                    onFieldChange={handleChange}
                    onImageClick={handleImageClick}
                    imageWrapperRef={imageWrapperRef}
                />

                <ImageUploadMenu
                    isOpen={showImageMenu}
                    onClose={() => setShowImageMenu(false)}
                    onFileUpload={(imageData) => {
                        setEditedCharacter({ ...editedCharacter, image: imageData });
                    }}
                    onUrlUpload={() => {
                        setShowUrlInput(true);
                    }}
                    menuRef={imageMenuRef}
                />

                <SectionsList
                    sections={editedCharacter.customSections}
                    editMode={editMode}
                    onAddSection={handleAddSection}
                    onSectionContentChange={handleSectionContentChange}
                    onIconClick={(sectionId) =>
                        setShowEmojiPicker(showEmojiPicker === sectionId ? null : sectionId)
                    }
                    onSectionRename={handleSectionRename}
                    onTypeChange={handleTypeChange}
                    onRemoveSection={handleRemoveSection}
                    onListItemAdd={handleListItemAdd}
                    onListItemChange={handleListItemChange}
                    onListItemRemove={handleListItemRemove}
                    renderIcon={renderIcon}
                />
            </div>

            <ImageUrlModal
                isOpen={showUrlInput}
                onClose={() => setShowUrlInput(false)}
                onSubmit={(url) => {
                    setEditedCharacter({ ...editedCharacter, image: url });
                    setShowImageMenu(false);
                }}
            />

            <EmojiIconPicker
                isOpen={showEmojiPicker !== null}
                onClose={() => setShowEmojiPicker(null)}
                onSelect={(icon) => handleIconChange(showEmojiPicker, icon)}
            />

            <ImageViewModal
                isOpen={showImageModal}
                onClose={() => setShowImageModal(false)}
                imageUrl={editedCharacter.image}
                altText={editedCharacter.prenom + " " + editedCharacter.nom}
            />
        </>
    );
};

export default DetailPage;