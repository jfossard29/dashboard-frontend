import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, Edit2, Save, Backpack, User, RotateCcw, Swords } from "lucide-react";
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
import DnDPage from "./DnDPage";
import {emojiSet, lucideSet} from "../data/emoji.js";
import { getIconUrl } from "../data/icons.js";
import personnageService from "../services/personnageService.js";
import inventaireService from "../services/inventaireService.js";
import equipementService from "../services/equipementService.js";

const DetailPage = ({ characterId, serverId, onBack, userId, isAdmin }) => {
    const [character, setCharacter] = useState(null);
    const [editedCharacter, setEditedCharacter] = useState(null);
    const [originalCharacter, setOriginalCharacter] = useState(null); // ✅ Pour détecter les changements
    const [editMode, setEditMode] = useState(false);
    const [showImageMenu, setShowImageMenu] = useState(false);
    const [showUrlInput, setShowUrlInput] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(null);
    const [showImageModal, setShowImageModal] = useState(false);
    const [activeTab, setActiveTab] = useState("details"); // "details", "inventory", "dnd"
    const [lastId, setLastId] = useState(0);
    const [saving, setSaving] = useState(false);
    const [popup, setPopup] = useState({ message: '', type: '' });
    
    // États pour la sauvegarde de l'inventaire
    const [inventorySaveStatus, setInventorySaveStatus] = useState({ hasChanges: false, isSaving: false });
    const inventoryRef = useRef(null);
    
    // Référence pour la sauvegarde D&D
    const dndSaveRef = useRef(null);

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
                // Fetch character details
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

                // Fetch D&D data
                const dndResponse = await personnageService.getPersonnageData(characterId);
                const dndData = dndResponse.body || {};

                // Fetch Inventory data
                const inventoryResponse = await inventaireService.getInventaire(characterId);
                const inventoryData = inventoryResponse.body || [];

                // Fetch Equipment data
                const equipementResponse = await equipementService.getEquipement(characterId);
                const equipementData = equipementResponse.body || {};

                if (data.code === 200 && data.body) {
                    const c = data.body;
                    const infos = c.infosPersonnage || {};

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
                        idUtilisateur: c.idUtilisateur,
                        prenom: infos.prenom,
                        nom: infos.nom,
                        classe: infos.classe,
                        historique: infos.historique,
                        race: infos.race,
                        alignement: infos.alignement,
                        image: c.image,
                        story: c.histoire, // On garde aussi ici pour référence
                        level: infos.niveau,
                        experience: infos.experience,
                        power: 0,
                        vie: infos.vie,
                        vieMax: infos.vieMax,
                        energie: infos.energie,
                        energieMax: infos.energieMax,
                        abilities: [],
                        equipement: equipementData, // Utilisation des données d'équipement récupérées
                        inventaire: inventoryData, // Utilisation des données d'inventaire récupérées
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
                        // Mapping D&D Data
                        stats: {
                            force: dndData.statistiques?.force || 10,
                            dexterite: dndData.statistiques?.dexterite || 10,
                            constitution: dndData.statistiques?.constitution || 10,
                            intelligence: dndData.statistiques?.intelligence || 10,
                            sagesse: dndData.statistiques?.sagesse || 10,
                            charisme: dndData.statistiques?.charisme || 10
                        },
                        savingThrows: {
                            force: dndData.statistiques?.sauvegardeForce === 1,
                            dexterite: dndData.statistiques?.sauvegardeDexterite === 1,
                            constitution: dndData.statistiques?.sauvegardeConstitution === 1,
                            intelligence: dndData.statistiques?.sauvegardeIntelligence === 1,
                            sagesse: dndData.statistiques?.sauvegardeSagesse === 1,
                            charisme: dndData.statistiques?.sauvegardeCharisme === 1
                        },
                        skills: {
                            "Acrobaties": dndData.statistiqueCompetence?.acrobaties === 1,
                            "Arcanes": dndData.statistiqueCompetence?.arcanes === 1,
                            "Athlétisme": dndData.statistiqueCompetence?.athletisme === 1,
                            "Discrétion": dndData.statistiqueCompetence?.discretion === 1,
                            "Dressage": dndData.statistiqueCompetence?.dressage === 1,
                            "Escamotage": dndData.statistiqueCompetence?.escamotage === 1,
                            "Histoire": dndData.statistiqueCompetence?.histoire === 1,
                            "Intimidation": dndData.statistiqueCompetence?.intimidation === 1,
                            "Investigation": dndData.statistiqueCompetence?.investigation === 1,
                            "Médecine": dndData.statistiqueCompetence?.medecine === 1,
                            "Nature": dndData.statistiqueCompetence?.nature === 1,
                            "Perception": dndData.statistiqueCompetence?.perception === 1,
                            "Perspicacité": dndData.statistiqueCompetence?.perspicacite === 1,
                            "Persuasion": dndData.statistiqueCompetence?.persuasion === 1,
                            "Religion": dndData.statistiqueCompetence?.religion === 1,
                            "Représentation": dndData.statistiqueCompetence?.representation === 1,
                            "Supercherie": dndData.statistiqueCompetence?.supercherie === 1,
                            "Survie": dndData.statistiqueCompetence?.survie === 1
                        },
                        monnaie: {
                            pp: dndData.monnaie?.platine || 0,
                            po: dndData.monnaie?.or || 0,
                            pe: dndData.monnaie?.electrum || 0,
                            pa: dndData.monnaie?.argent || 0,
                            pc: dndData.monnaie?.cuivre || 0
                        },
                        ca: dndData.statistiques?.classeArmure || 10,
                        initiative: dndData.statistiques?.initiative || 0,
                        vitesse: dndData.statistiques?.vitesse || 30,
                        desDeVie: dndData.statistiques?.deDeVie || "1d8",
                        desDeVieRestants: dndData.statistiques?.deDeVieRestant || 1,
                        bonusMaitrise: dndData.statistiques?.maitrise || 2,
                        // TODO: Ajouter les notes/outils quand le backend le supportera
                        notes: {
                            outils: infos.noteMaitrise || "",
                            autres: infos.autreMaitrise || "",
                            traitsRaciaux: ""
                        }
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
        if (editedCharacter.classe !== originalCharacter.classe) changes.classe = editedCharacter.classe;
        if (editedCharacter.historique !== originalCharacter.historique) changes.historique = editedCharacter.historique;
        if (editedCharacter.race !== originalCharacter.race) changes.race = editedCharacter.race;
        if (editedCharacter.alignement !== originalCharacter.alignement) changes.alignement = editedCharacter.alignement;
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
        if (editedCharacter.classe !== originalCharacter.classe) return true;
        if (editedCharacter.historique !== originalCharacter.historique) return true;
        if (editedCharacter.race !== originalCharacter.race) return true;
        if (editedCharacter.alignement !== originalCharacter.alignement) return true;
        if (editedCharacter.image !== originalCharacter.image) return true;
        if (editedCharacter.level !== originalCharacter.level) return true;
        if (editedCharacter.experience !== originalCharacter.experience) return true;

        if (JSON.stringify(originalCharacter.customSections) !== JSON.stringify(editedCharacter.customSections)) return true;
        
        // On ignore l'inventaire car il est géré en temps réel ou via l'autre onglet
        // if (JSON.stringify(editedCharacter.inventaire) !== JSON.stringify(originalCharacter.inventaire)) return true;

        return false;
    }, [editedCharacter, originalCharacter]);

    const hasUnsavedChanges = activeTab === "details" ? hasDetailsChanges : (activeTab === "inventory" ? inventorySaveStatus.hasChanges : true); // Pour D&D on suppose toujours qu'il peut y avoir des changements si on est en mode édition

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

        // Si on est sur l'onglet D&D, on délègue la sauvegarde
        if (activeTab === "dnd") {
            if (dndSaveRef.current) {
                const success = await dndSaveRef.current();
                if (success) {
                    showPopup("Modifications D&D sauvegardées !", 'success');
                    setEditMode(false);
                    
                    // Mise à jour de l'état local après sauvegarde D&D
                    // On récupère les nouvelles données depuis le backend pour être sûr
                    try {
                        const dndResponse = await personnageService.getPersonnageData(characterId);
                        const dndData = dndResponse.body || {};
                        
                        // On met à jour editedCharacter et originalCharacter avec les nouvelles données D&D
                        // Note: Cette logique est simplifiée, idéalement on devrait fusionner proprement
                        // Mais comme DnDPage gère son propre état interne, cela sert surtout si on change d'onglet
                        setEditedCharacter(prev => ({
                            ...prev,
                            stats: {
                                force: dndData.statistiques?.force || prev.stats.force,
                                dexterite: dndData.statistiques?.dexterite || prev.stats.dexterite,
                                constitution: dndData.statistiques?.constitution || prev.stats.constitution,
                                intelligence: dndData.statistiques?.intelligence || prev.stats.intelligence,
                                sagesse: dndData.statistiques?.sagesse || prev.stats.sagesse,
                                charisme: dndData.statistiques?.charisme || prev.stats.charisme
                            },
                            // ... autres champs D&D si nécessaire
                        }));
                        
                        // On met à jour originalCharacter pour refléter le nouvel état "propre"
                        setOriginalCharacter(prev => {
                            const newState = JSON.parse(JSON.stringify(prev));
                            // On pourrait faire une fusion plus complète ici si nécessaire
                            return newState;
                        });
                        
                    } catch (error) {
                        console.error("Erreur lors du rafraîchissement des données D&D:", error);
                    }

                } else {
                    showPopup("Erreur lors de la sauvegarde D&D.", 'error');
                }
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
            const promises = [];
            const infosFields = ['prenom', 'nom', 'classe', 'historique', 'race', 'alignement', 'experience', 'niveau', 'vie', 'vieMax', 'energie', 'energieMax'];
            const infosChanges = {};
            const generalChanges = {};

            Object.keys(changes).forEach(key => {
                if (infosFields.includes(key)) {
                    infosChanges[key] = changes[key];
                } else {
                    generalChanges[key] = changes[key];
                }
            });

            // 1. Sauvegarde des infos de base (infosPersonnage)
            if (Object.keys(infosChanges).length > 0) {
                promises.push(personnageService.updateInfosPersonnage(characterId, infosChanges));
            }

            // 2. Sauvegarde des autres champs (personnage racine)
            if (Object.keys(generalChanges).length > 0) {
                promises.push(personnageService.updatePersonnage(characterId, generalChanges));
            }

            const responses = await Promise.all(promises);
            
            // Vérification des erreurs
            const errors = responses.filter(res => res.code !== 200);

            if (errors.length === 0) {
                // Mise à jour de l'état local pour refléter la sauvegarde
                setOriginalCharacter(JSON.parse(JSON.stringify(editedCharacter)));
                setCharacter(editedCharacter);
                
                showPopup("Modifications sauvegardées avec succès !", 'success');
                setEditMode(false);
                setShowImageMenu(false);
                setShowUrlInput(false);
                setShowEmojiPicker(null);
            } else {
                console.error("Erreur lors de la sauvegarde:", errors);
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
    const isDnD = activeTab === "dnd";

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

    // Vérification des droits d'édition
    const canEdit = isAdmin || (userId && character.idUtilisateur === userId);

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
                    <button
                        onClick={() => setActiveTab("dnd")}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                            activeTab === "dnd"
                                ? "bg-orange-500 text-white shadow-lg"
                                : "text-gray-400 hover:text-white hover:bg-gray-700"
                        }`}
                    >
                        <Swords size={18} />
                        <span>Combat</span>
                    </button>
                </div>

                {/* Bouton d'édition/sauvegarde */}
                {canEdit && (
                    (editMode || isInventory) ? (
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
                                disabled={isSaveDisabled && !isDnD} // On active toujours pour DnD car on ne track pas les changements
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg shadow transition-all duration-300 ${
                                    (isSaveDisabled && !isDnD)
                                        ? 'bg-gray-600 cursor-not-allowed opacity-50' 
                                        : hasUnsavedChanges || isDnD
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
                    )
                )}
                {!canEdit && <div className="w-[100px]"></div>} {/* Spacer pour alignement */}
            </div>

            {/* Contenu principal */}
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-x-hidden shadow-2xl overflow-y-auto scrollbar-custom max-h-[calc(100vh-8rem)]">
                {activeTab === "details" && (
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
                )}
                
                {activeTab === "inventory" && (
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

                {activeTab === "dnd" && (
                    <DnDPage 
                        character={editedCharacter}
                        editMode={editMode} // On force le mode édition si on est sur l'onglet D&D et qu'on a les droits
                        onSave={(saveFn) => {
                            dndSaveRef.current = saveFn;
                        }}
                        onUpdate={(updatedData) => {
                            // Logique de mise à jour à implémenter si nécessaire
                            console.log("DnD Update:", updatedData);
                        }}
                    />
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