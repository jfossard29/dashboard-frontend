import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, Edit2, Save, Backpack, User, RotateCcw } from "lucide-react";
import * as LucideIcons from "lucide-react";
import "../Scrollbar.css";
import Popup from "../components/Popup.jsx";
import EmojiIconPicker from "../components/EmojiIconPicker";
import ImageUploadMenu from "../components/ImageUploadMenu";
import ImageUrlModal from "../components/ImageUrlModal";
import ImageViewModal from "../components/ImageViewModal";
import CharacterHeader from "../components/CharacterHeader";
import SectionsList from "../components/SectionsList";
import CharacterInventory from "../components/CharacterInventory";
import {emojiSet, lucideSet} from "../data/emoji.js";
import { getIconUrl } from "../data/icons.js";

const DetailPage = ({ characterId, serverId, onBack }) => {
    const [character, setCharacter] = useState(null);
    const [editedCharacter, setEditedCharacter] = useState(null);
    const [originalCharacter, setOriginalCharacter] = useState(null); // ✅ Pour détecter les changements
    const [editMode, setEditMode] = useState(false);
    const [showImageMenu, setShowImageMenu] = useState(false);
    const [showUrlInput, setShowUrlInput] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(null);
    const [showImageModal, setShowImageModal] = useState(false);
    const [activeTab, setActiveTab] = useState("details"); // "details" ou "inventory"
    const [lastId, setLastId] = useState(0);
    const [saving, setSaving] = useState(false);
    const [popup, setPopup] = useState({ message: '', type: '' });
    
    // États pour la sauvegarde de l'inventaire
    const [inventorySaveStatus, setInventorySaveStatus] = useState({ hasChanges: false, isSaving: false });
    const inventoryRef = useRef(null);

    const imageWrapperRef = useRef(null);
    const imageMenuRef = useRef(null);

    // On bloque le scroll du body pour que seul le conteneur principal scrolle
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

                    // Création de la section Histoire
                    const storySection = {
                        id: 'story', // ID spécial pour l'histoire
                        ordre: 0, // Toujours en premier
                        titre: "Histoire",
                        type: "DESCRIPTION",
                        contenu: c.histoire || "",
                        icone: "📜",
                        obligatoire: true,
                    };

                    const mappedCharacter = {
                        id: c.id,
                        idServer: c.idServeur,
                        prenom: c.prenom,
                        nom: c.nom,
                        image: c.image,
                        story: c.histoire, // On garde aussi ici pour référence
                        level: c.niveau,
                        experience: c.experience,
                        power: 0,
                        vie: c.vie,
                        vieMax: c.vieMax,
                        energie: c.energie,
                        energieMax: c.energieMax,
                        abilities: [],
                        equipement: c.equipement,
                        inventaire: c.inventaire,
                        customSections: [
                            storySection,
                            ...(c.rubriques || []).map((r) => ({
                                id: r.id,
                                ordre: r.ordre,
                                titre: r.titre,
                                type: r.type,
                                contenu: r.contenu,
                                icone: r.icone,
                                obligatoire: r.obligatoire,
                            }))
                        ],
                    };
                    setLastId(Math.max(...(c.rubriques || []).map(r => r.id), 0));
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

    const showPopup = (message, type = 'error') => {
        setPopup({ message, type });
    };

    const closePopup = () => {
        setPopup({ message: '', type: '' });
    };

    // ✅ Fonction pour détecter les changements
    const getChangedFields = () => {
        const changes = {};

        // Comparer les champs simples
        if (editedCharacter.prenom !== originalCharacter.prenom) changes.prenom = editedCharacter.prenom;
        if (editedCharacter.nom !== originalCharacter.nom) changes.nom = editedCharacter.nom;
        if (editedCharacter.image !== originalCharacter.image) changes.image = editedCharacter.image;
        if (editedCharacter.level !== originalCharacter.level) changes.niveau = editedCharacter.level;
        if (editedCharacter.experience !== originalCharacter.experience) changes.experience = editedCharacter.experience;

        // Extraire l'histoire des sections
        const storySection = editedCharacter.customSections.find(s => s.id === 'story');
        const originalStorySection = originalCharacter.customSections.find(s => s.id === 'story');
        
        if (storySection && storySection.contenu !== originalStorySection?.contenu) {
            changes.histoire = storySection.contenu;
        }

        // Comparer les rubriques (en excluant l'histoire)
        const originalSections = originalCharacter.customSections.filter(s => s.id !== 'story');
        const editedSections = editedCharacter.customSections.filter(s => s.id !== 'story');

        if (JSON.stringify(originalSections) !== JSON.stringify(editedSections)) {
            const originalIds = new Set(originalSections.map(s => s.id));
            
            changes.rubriques = editedSections.map(section => {
                if (!originalIds.has(section.id)) {
                    // C'est une nouvelle section, on enlève l'ID pour que le backend le génère
                    const { id, ...sectionWithoutId } = section;
                    return sectionWithoutId;
                }
                return section;
            });
        }

        // Comparer l'inventaire (simplifié, on envoie tout si changé)
        if (JSON.stringify(editedCharacter.inventaire) !== JSON.stringify(originalCharacter.inventaire)) {
            changes.inventaire = editedCharacter.inventaire;
        }

        return changes;
    };

    const hasDetailsChanges = useMemo(() => {
        if (!editedCharacter || !originalCharacter) return false;
        
        if (editedCharacter.prenom !== originalCharacter.prenom) return true;
        if (editedCharacter.nom !== originalCharacter.nom) return true;
        if (editedCharacter.image !== originalCharacter.image) return true;
        if (editedCharacter.level !== originalCharacter.level) return true;
        if (editedCharacter.experience !== originalCharacter.experience) return true;

        if (JSON.stringify(originalCharacter.customSections) !== JSON.stringify(editedCharacter.customSections)) return true;
        
        // On ignore l'inventaire car il est géré en temps réel ou via l'autre onglet
        // if (JSON.stringify(editedCharacter.inventaire) !== JSON.stringify(originalCharacter.inventaire)) return true;

        return false;
    }, [editedCharacter, originalCharacter]);

    const hasUnsavedChanges = activeTab === "details" ? hasDetailsChanges : inventorySaveStatus.hasChanges;

    // ✅ Fonction de sauvegarde optimisée
    const saveChanges = async () => {
        // Si on est sur l'onglet inventaire, on délègue la sauvegarde au composant enfant
        if (activeTab === "inventory") {
            if (inventoryRef.current) {
                // Si pas de changements, on ne fait rien (le bouton devrait être désactivé de toute façon)
                if (!inventorySaveStatus.hasChanges) {
                    return;
                }
                await inventoryRef.current.handleSaveChanges();
                // On ne quitte PAS le mode édition pour l'inventaire, car il est toujours éditable
            }
            return;
        }

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
                showPopup("Modifications sauvegardées avec succès !", 'success');

                // Mettre à jour les références
                // Si le backend renvoie le personnage mis à jour avec les nouveaux IDs, il faudrait l'utiliser.
                // Mais ici on suppose que data.body contient peut-être le personnage ou juste un succès.
                // Si data.body est le personnage complet, on devrait l'utiliser pour mettre à jour les IDs.
                
                if (data.body) {
                     const c = data.body;
                     
                     // Recréation de la section histoire
                     const storySection = {
                        id: 'story',
                        ordre: 0,
                        titre: "Histoire",
                        type: "DESCRIPTION",
                        contenu: c.histoire || "",
                        icone: "📜",
                        obligatoire: true,
                    };

                     const mappedCharacter = {
                        id: c.id,
                        idServer: c.idServeur,
                        prenom: c.prenom,
                        nom: c.nom,
                        image: c.image,
                        story: c.histoire,
                        level: c.niveau,
                        experience: c.experience,
                        power: 0,
                        vie: c.vie,
                        vieMax: c.vieMax,
                        energie: c.energie,
                        energieMax: c.energieMax,
                        abilities: [],
                        equipement: c.equipement,
                        inventaire: c.inventaire,
                        customSections: [
                            storySection,
                            ...(c.rubriques || []).map((r) => ({
                                id: r.id,
                                ordre: r.ordre,
                                titre: r.titre,
                                type: r.type,
                                contenu: r.contenu,
                                icone: r.icone,
                                obligatoire: r.obligatoire,
                            }))
                        ],
                    };
                    setCharacter(mappedCharacter);
                    setEditedCharacter(mappedCharacter);
                    setOriginalCharacter(JSON.parse(JSON.stringify(mappedCharacter)));
                    // Mettre à jour lastId pour éviter les conflits futurs
                    const maxId = Math.max(...(c.rubriques || []).map(s => s.id), 0);
                    setLastId(maxId);
                } else {
                    // Fallback si le backend ne renvoie pas l'objet
                    setCharacter(editedCharacter);
                    setOriginalCharacter(JSON.parse(JSON.stringify(editedCharacter)));
                }

                setEditMode(false);
                setShowImageMenu(false);
                setShowUrlInput(false);
                setShowEmojiPicker(null);
            } else {
                console.error("Erreur lors de la sauvegarde:", response.status);
                showPopup("Erreur lors de la sauvegarde.", 'error');
            }
        } catch (error) {
            console.error("Erreur réseau:", error);
            showPopup("Erreur de connexion au serveur.", 'error');
        } finally {
            setSaving(false);
        }
    };
    
    const handleCancel = () => {
        if (hasUnsavedChanges) {
            if (activeTab === "inventory") {
                if (inventoryRef.current) {
                    inventoryRef.current.handleReset();
                }
            } else {
                // Reset details
                setEditedCharacter(JSON.parse(JSON.stringify(originalCharacter)));
            }
        }
        // On quitte toujours le mode édition pour la fiche
        setEditMode(false);
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
        if (!iconName) return <span className="text-2xl">❌</span>;
        
        // Résolution de l'URL si c'est un fichier local (ex: .svg)
        const iconUrl = getIconUrl(iconName);

        // Check for image file extensions or URLs
        if (typeof iconUrl === 'string' && (
            iconUrl.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i) || 
            iconUrl.startsWith('http') || 
            iconUrl.startsWith('/') ||
            iconUrl.startsWith('data:')
        )) {
            return <img src={iconUrl} alt="" className="w-full h-full object-cover rounded" />;
        }
        
        if (emojiSet.has(iconName)) {
            return <span className="text-2xl">{iconName}</span>;
        } else if (lucideSet.has(iconName)) {
            const IconComponent = LucideIcons[iconName];
            if (IconComponent) {
                return <IconComponent size={24} className="text-orange-400"/>;
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

    // Callback pour mettre à jour l'état global après une sauvegarde réussie de l'inventaire
    const handleInventorySaveSuccess = (newInventoryData) => {
        // On met à jour editedCharacter avec les nouvelles données d'inventaire/équipement
        // pour que si on change d'onglet et qu'on revient, on ait les données à jour
        setEditedCharacter(prev => ({
            ...prev,
            vie: newInventoryData.vie,
            energie: newInventoryData.mana, // Attention au mapping mana/energie
            equipement: newInventoryData.equipement,
            inventaire: newInventoryData.inventaire
        }));
        
        // On met aussi à jour originalCharacter pour éviter de détecter des changements fantômes
        setOriginalCharacter(prev => ({
            ...prev,
            vie: newInventoryData.vie,
            energie: newInventoryData.mana,
            equipement: JSON.parse(JSON.stringify(newInventoryData.equipement)),
            inventaire: JSON.parse(JSON.stringify(newInventoryData.inventaire))
        }));
    };

    if (!character) {
        return (
            <div className="flex-1 flex items-center justify-center text-gray-400">
                Chargement du personnage...
            </div>
        );
    }

    const isInventory = activeTab === "inventory";

    // Détermine si le bouton de sauvegarde doit être désactivé
    const isSaveDisabled = isInventory
        ? (inventorySaveStatus.isSaving || !inventorySaveStatus.hasChanges)
        : saving;

    // Détermine le texte du bouton
    const saveButtonText = (activeTab === "details" ? saving : inventorySaveStatus.isSaving) 
        ? 'Sauvegarde...' 
        : 'Sauvegarder';

    // Logique d'affichage du bouton Reset
    const isResetDisabled = isInventory && !hasUnsavedChanges;

    let resetButtonClasses = "p-2 rounded-lg shadow transition-all ";
    if (isResetDisabled) {
        resetButtonClasses += "bg-gray-700 text-gray-500 cursor-not-allowed";
    } else {
        // Toujours rouge s'il est actif (pour quitter ou annuler)
        resetButtonClasses += "bg-red-600 hover:bg-red-700 text-white";
    }

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

                <div className="flex items-center space-x-4 bg-gray-800/50 p-1 rounded-lg border border-gray-700">
                    <button
                        onClick={() => setActiveTab("details")}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                            activeTab === "details"
                                ? "bg-orange-500 text-white shadow-lg"
                                : "text-gray-400 hover:text-white hover:bg-gray-700"
                        }`}
                    >
                        <User size={18} />
                        <span>Fiche</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("inventory")}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                            activeTab === "inventory"
                                ? "bg-orange-500 text-white shadow-lg"
                                : "text-gray-400 hover:text-white hover:bg-gray-700"
                        }`}
                    >
                        <Backpack size={18} />
                        <span>Inventaire</span>
                    </button>
                </div>

                {/* Bouton d'édition/sauvegarde */}
                {(editMode || isInventory) ? (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleCancel}
                            disabled={isResetDisabled}
                            className={resetButtonClasses}
                            title={hasUnsavedChanges ? "Réinitialiser les modifications" : "Quitter le mode édition"}
                        >
                            <RotateCcw size={18} />
                        </button>
                        <button
                            onClick={saveChanges}
                            disabled={isSaveDisabled}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg shadow transition-all duration-300 ${
                                isSaveDisabled 
                                    ? 'bg-gray-600 cursor-not-allowed opacity-50' 
                                    : hasUnsavedChanges
                                        ? 'bg-green-600 hover:bg-green-700 shadow-[0_0_15px_rgba(34,197,94,0.6)] scale-105 ring-2 ring-green-400 animate-pulse'
                                        : 'bg-gray-500 hover:bg-gray-600 text-gray-300'
                            } text-white`}
                        >
                            <Save size={18} />
                            <span>{saveButtonText}</span>
                        </button>
                    </div>
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

            {/* Contenu principal */}
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-x-hidden shadow-2xl overflow-y-auto scrollbar-custom max-h-[calc(100vh-8rem)]">
                {activeTab === "details" ? (
                    <>
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
                    </>
                ) : (
                    <div className="h-full">
                        <CharacterInventory
                            ref={inventoryRef}
                            character={editedCharacter}
                            onClose={() => setActiveTab("details")}
                            editMode={editMode || isInventory}
                            onUpdate={(newInventory) => {
                                setEditedCharacter({ ...editedCharacter, inventaire: newInventory });
                            }}
                            onSaveStatusChange={setInventorySaveStatus}
                            onSaveSuccess={handleInventorySaveSuccess}
                        />
                    </div>
                )}
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

            {createPortal(
                <Popup message={popup.message} type={popup.type} onClose={closePopup} />,
                document.body
            )}
        </>
    );
};

export default DetailPage;