import React, { useState, useMemo, useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
import { createPortal } from 'react-dom';
import Popup from './Popup';
import ItemEditorModal from './ItemEditorModal';
import ItemBankModal from './ItemBankModal';
import AlertConfirmation from './AlertConfirmation';
import personnageService from "../services/personnageService.js";
import equipementService from "../services/equipementService.js";
import inventaireService from "../services/inventaireService.js";
import InventoryCharacterStats from './InventoryCharacterStats';
import InventoryEquipmentSlots from './InventoryEquipmentSlots';
import InventoryList from './InventoryList';

const CharacterInventory = forwardRef(({ character, onClose, editMode, onUpdate, serverId, onSaveStatusChange, onSaveSuccess }, ref) => {
    // Helper pour extraire les objets personnalisés
    const getPersonnaliseItems = (char) => char?.equipement?.personnalise || {};

    // Données du personnage
    const [inventoryData, setInventoryData] = useState({
        prenom: character?.prenom || "Inconnu",
        niveau: character?.level || 1,
        classe: "Aventurier",
        vie: character?.vie || 100,
        vieMax: character?.vieMax || 100,
        mana: character?.energie || 100,
        manaMax: character?.energieMax || 100,
        equipement: {
            tete: character?.equipement?.tete || null,
            torse: character?.equipement?.torse || null,
            deuxMains: character?.equipement?.deux_mains || null,
            mainDroite: character?.equipement?.main_droite || null,
            mainGauche: character?.equipement?.main_gauche || null,
            pieds: character?.equipement?.pied || null,
            accessoire1: character?.equipement?.accessoire_1 || null,
            accessoire2: character?.equipement?.accessoire_2 || null,
            ...getPersonnaliseItems(character)
        },
        inventaire: character?.inventaire || []
    });

    // État pour stocker les données originales (pour comparaison)
    const [originalData, setOriginalData] = useState(null);

    // États pour le suivi des modifications API
    const [pendingStatChanges, setPendingStatChanges] = useState({});
    const [isEquipmentModified, setIsEquipmentModified] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    // Ref pour suivre le changement de personnage
    const prevCharacterIdRef = useRef(null);

    // État pour la modale de confirmation
    const [confirmation, setConfirmation] = useState({ isOpen: false });

    // Fonction de comparaison profonde pour détecter les changements réels
    const checkHasChanges = () => {
        if (!originalData) return false;

        // 1. Vérifier les stats
        if (inventoryData.vie !== originalData.vie) return true;
        if (inventoryData.mana !== originalData.mana) return true;

        // 2. Vérifier l'équipement
        const currentEquip = inventoryData.equipement;
        const originalEquip = originalData.equipement;

        // Récupérer toutes les clés de slots possibles
        const allSlots = new Set([...Object.keys(currentEquip), ...Object.keys(originalEquip)]);

        for (const slot of allSlots) {
            const currentItem = currentEquip[slot];
            const originalItem = originalEquip[slot];

            // Si le slot existe dans l'un mais pas l'autre (ajout/suppression de slot)
            // Note: Avec la sauvegarde immédiate des slots, originalData est mis à jour, donc ça ne devrait pas trigger ici
            if ((slot in currentEquip) !== (slot in originalEquip)) {
                return true;
            }

            // Si l'un est null et l'autre non, ou si les IDs sont différents
            if (currentItem?.id !== originalItem?.id) {
                return true;
            }
        }

        return false;
    };

    const hasChanges = checkHasChanges();

    // Remonter l'état des changements au parent
    useEffect(() => {
        if (onSaveStatusChange) {
            onSaveStatusChange({ hasChanges, isSaving });
        }
    }, [hasChanges, isSaving, onSaveStatusChange]);

    useEffect(() => {
        if (character) {
            // Si c'est un nouveau personnage (changement d'ID), on réinitialise tout
            if (prevCharacterIdRef.current !== character.id) {
                const initialData = {
                    prenom: character.prenom,
                    niveau: character.level,
                    classe: "Aventurier",
                    vie: character.vie,
                    vieMax: character.vieMax,
                    mana: character.energie,
                    manaMax: character.energieMax,
                    equipement: {
                        tete: character.equipement?.tete || null,
                        torse: character.equipement?.torse || null,
                        deuxMains: character.equipement?.deux_mains || null,
                        mainDroite: character.equipement?.main_droite || null,
                        mainGauche: character.equipement?.main_gauche || null,
                        pieds: character.equipement?.pied || null,
                        accessoire1: character.equipement?.accessoire_1 || null,
                        accessoire2: character.equipement?.accessoire_2 || null,
                        ...getPersonnaliseItems(character)
                    },
                    inventaire: character.inventaire || []
                };

                setInventoryData(initialData);
                // On fait une copie profonde pour l'original
                setOriginalData(JSON.parse(JSON.stringify(initialData)));
                
                setPendingStatChanges({});
                setIsEquipmentModified(false);
                prevCharacterIdRef.current = character.id;
            } else {
                // Si c'est le même personnage (mise à jour via onUpdate ou header),
                // on met à jour l'inventaire et les infos de base
                setInventoryData(prev => {
                    const newData = {
                        ...prev,
                        prenom: character.prenom,
                        niveau: character.level,
                        inventaire: character.inventaire || []
                    };
                    
                    // Si on met à jour l'inventaire depuis l'extérieur (ex: création d'item),
                    // on doit aussi mettre à jour l'originalData pour l'inventaire pour ne pas fausser la comparaison
                    if (originalData) {
                        setOriginalData(prevOriginal => ({
                            ...prevOriginal,
                            inventaire: character.inventaire || []
                        }));
                    }
                    
                    return newData;
                });
            }
        }
    }, [character]);

    const [hoveredItem, setHoveredItem] = useState(null);
    const [hoveredStatsExpand, setHoveredStatsExpand] = useState(null);
    const [popup, setPopup] = useState({ message: '', type: '' });
    const [highlightedSlots, setHighlightedSlots] = useState([]);
    const [showItemBank, setShowItemBank] = useState(false);
    const [showItemEditor, setShowItemEditor] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    
    // États pour la recherche et la pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const slotLabels = {
        tete: "Tête",
        torse: "Torse",
        deuxMains: "Deux mains",
        mainDroite: "Main droite",
        mainGauche: "Main gauche",
        pieds: "Pieds",
        accessoire1: "Accessoire 1",
        accessoire2: "Accessoire 2"
    };

    // --- Fonctions utilitaires ---

    const getValidSlots = (item) => {
        if (!item || !item.partie) return [];
        const part = item.partie.toLowerCase();
        
        if (['tete', 'casque', 'heaume'].includes(part)) return ['tete'];
        if (['torse', 'plastron', 'armure'].includes(part)) return ['torse'];
        if (['pied', 'pieds', 'bottes', 'jambieres'].includes(part)) return ['pieds'];
        if (['deux_mains', 'arme_deux_mains', 'baton', 'arc'].includes(part)) return ['deuxMains'];
        if (['main_droite', 'arme_main_droite', 'epee', 'dague'].includes(part)) return ['mainDroite'];
        if (['main_gauche', 'arme_main_gauche', 'bouclier'].includes(part)) return ['mainGauche'];
        if (['accessoire', 'anneau', 'collier', 'bijou', 'accessoire1', 'accessoire2'].includes(part)) return ['accessoire1', 'accessoire2'];
        
        // Tout le reste est un slot personnalisé, le nom du slot est la partie
        return [item.partie];
    };

    const isTwoHanded = (item) => {
        return item?.deuxMains || getValidSlots(item).includes('deuxMains');
    };

    const formatLabel = (slug) => {
        if (slotLabels[slug]) return slotLabels[slug];
        return slug.charAt(0).toUpperCase() + slug.slice(1).replace(/_/g, ' ');
    };

    const isSlotDisabled = (slot) => {
        // Désactiver main droite/gauche si objet deux mains équipé
        if ((slot === 'mainDroite' || slot === 'mainGauche') && inventoryData.equipement.deuxMains) {
            return true;
        }
        // Désactiver slot deux mains si une main est équipée
        if (slot === 'deuxMains' && (inventoryData.equipement.mainDroite || inventoryData.equipement.mainGauche)) {
            return true;
        }
        return false;
    };

    const showPopup = (message, type = 'error') => {
        setPopup({ message, type });
    };

    const closePopup = () => {
        setPopup({ message: '', type: '' });
    };

    // --- Calcul des stats totales ---
    const totalStats = useMemo(() => {
        const totals = {};
        Object.values(inventoryData.equipement).forEach(item => {
            if (!item || !item.statistique) return;
            Object.entries(item.statistique).forEach(([statName, statValue]) => {
                const numericValue = parseInt(String(statValue).replace(/[^0-9-]/g, ''), 10);

                if (!isNaN(numericValue)) {
                    if (!totals[statName]) totals[statName] = 0;
                    totals[statName] += numericValue;
                }
            });
        });
        return totals;
    }, [inventoryData.equipement]);

    // --- Gestion du Drag & Drop ---

    const handleDragStart = (e, item, source, slotName = null) => {
        e.dataTransfer.setData("item", JSON.stringify(item));
        e.dataTransfer.setData("source", source); // "inventory" ou "equipment"
        if (slotName) e.dataTransfer.setData("slotName", slotName);

        if (source === 'inventory') {
            setHighlightedSlots(getValidSlots(item));
        }
    };

    const handleDragEnd = () => {
        setHighlightedSlots([]);
    };

    const handleDragOver = (e) => {
        e.preventDefault(); // Nécessaire pour autoriser le drop
    };

    const handleDropOnSlot = (e, targetSlot) => {
        e.preventDefault();
        setHighlightedSlots([]);
        const itemData = JSON.parse(e.dataTransfer.getData("item"));
        const source = e.dataTransfer.getData("source");
        const sourceSlot = e.dataTransfer.getData("slotName");

        if (source === "inventory") {
            const validSlots = getValidSlots(itemData);
            if (!validSlots.includes(targetSlot)) {
                showPopup(`Cet objet ne va pas dans l'emplacement ${formatLabel(targetSlot)}`, 'error');
                return;
            }
            equipItem(itemData, targetSlot);
        } else if (source === "equipment" && sourceSlot !== targetSlot) {
            // Déplacement d'un slot à un autre (optionnel)
        }
    };

    const handleDropOnInventory = (e) => {
        e.preventDefault();
        setHighlightedSlots([]);
        const itemData = JSON.parse(e.dataTransfer.getData("item"));
        const source = e.dataTransfer.getData("source");
        const sourceSlot = e.dataTransfer.getData("slotName");

        if (source === "equipment") {
            unequipItem(sourceSlot);
        }
    };

    // --- Logique métier ---

    const equipItem = (itemToEquip, targetSlot) => {
        // Vérification du type
        if (itemToEquip.type !== 'EQUIPEMENT') {
            showPopup(`Impossible d'équiper un objet de type ${itemToEquip.type}`, 'error');
            return;
        }

        if (isSlotDisabled(targetSlot)) return;

        setInventoryData(prev => {
            const newInventory = [...prev.inventaire];
            const newEquipment = { ...prev.equipement };

            // 1. Retirer 1 unité de l'inventaire
            const inventoryItemIndex = newInventory.findIndex(i => i.id === itemToEquip.id);
            if (inventoryItemIndex === -1) return prev; // Item introuvable

            // On décrémente la quantité mais on garde l'objet avec quantité 0 pour l'affichage
            newInventory[inventoryItemIndex] = {
                ...newInventory[inventoryItemIndex],
                quantite: Math.max(0, newInventory[inventoryItemIndex].quantite - 1)
            };

            // 2. Gérer l'item déjà équipé (le déséquiper vers l'inventaire)
            const currentEquippedItem = newEquipment[targetSlot];
            if (currentEquippedItem) {
                const existingIndex = newInventory.findIndex(i => i.id === currentEquippedItem.id);
                if (existingIndex !== -1) {
                    newInventory[existingIndex] = {
                        ...newInventory[existingIndex],
                        quantite: newInventory[existingIndex].quantite + 1
                    };
                } else {
                    newInventory.push({ ...currentEquippedItem, quantite: 1 });
                }
            }

            // 3. Équiper le nouvel item (FORCE QUANTITÉ À 1)
            // Si c'est une arme à deux mains, on vide aussi les mains
            if (isTwoHanded(itemToEquip)) {
                 ['mainDroite', 'mainGauche'].forEach(handSlot => {
                     const handItem = newEquipment[handSlot];
                     if (handItem) {
                         const existingIndex = newInventory.findIndex(i => i.id === handItem.id);
                         if (existingIndex !== -1) {
                             newInventory[existingIndex] = {
                                 ...newInventory[existingIndex],
                                 quantite: newInventory[existingIndex].quantite + 1
                             };
                         } else {
                             newInventory.push({ ...handItem, quantite: 1 });
                         }
                         newEquipment[handSlot] = null;
                     }
                 });
            }

            // On s'assure que l'objet équipé a une quantité de 1, peu importe la stack d'origine
            newEquipment[targetSlot] = {
                ...itemToEquip,
                quantite: 1
            };

            return {
                ...prev,
                inventaire: newInventory,
                equipement: newEquipment
            };
        });
        
        setIsEquipmentModified(true);
    };

    const unequipItem = (slot) => {
        const itemToUnequip = inventoryData.equipement[slot];
        if (!itemToUnequip) return;

        setInventoryData(prev => {
            const newInventory = [...prev.inventaire];
            const newEquipment = { ...prev.equipement };

            // 1. Ajouter l'item à l'inventaire
            const existingIndex = newInventory.findIndex(i => i.id === itemToUnequip.id);
            if (existingIndex !== -1) {
                newInventory[existingIndex] = {
                    ...newInventory[existingIndex],
                    quantite: newInventory[existingIndex].quantite + 1
                };
            } else {
                newInventory.push({ ...itemToUnequip, quantite: 1 });
            }

            // 2. Retirer de l'équipement
            if (isTwoHanded(itemToUnequip)) {
                newEquipment.deuxMains = null;
                newEquipment.mainDroite = null;
                newEquipment.mainGauche = null;
            } else {
                // Si c'est un slot personnalisé, on le met à null
                newEquipment[slot] = null;
            }

            return {
                ...prev,
                inventaire: newInventory,
                equipement: newEquipment
            };
        });
        
        setIsEquipmentModified(true);
    };

    // --- Gestion de l'édition ---

    const handleAddItemFromBank = async (item) => {
        setShowItemBank(false);
        try {
            const data = await inventaireService.addItem({
                idPersonnage: character.id,
                id_objet: item.id,
                quantite: 1,
                obtention: "Non implémenté"
            });

            if (data.code === 200 && data.body) {
                let returnedItem = data.body;
                
                // Si le backend retourne l'association (Inventaire) au lieu de l'Item directement
                if (returnedItem.objet) {
                    returnedItem = {
                        ...returnedItem.objet,
                        quantite: returnedItem.quantite
                    };
                }
                
                // Update inventory list
                let newInventory = [...inventoryData.inventaire];
                const existingIndex = newInventory.findIndex(i => i.id === returnedItem.id);
                
                if (existingIndex !== -1) {
                    newInventory[existingIndex] = returnedItem;
                } else {
                    newInventory.push(returnedItem);
                }
                
                setInventoryData(prev => ({ ...prev, inventaire: newInventory }));
                // Mise à jour de l'originalData pour que le reset ne supprime pas cet item
                setOriginalData(prev => ({ ...prev, inventaire: newInventory }));
                
                onUpdate && onUpdate(newInventory);
                showPopup(`Objet "${item.nom}" ajouté à l'inventaire.`, 'success');
            } else {
                showPopup(data.message || "Erreur lors de l'ajout de l'objet.", 'error');
            }
        } catch (error) {
            console.error("Error adding item from bank", error);
            showPopup("Erreur réseau lors de l'ajout de l'objet.", 'error');
        }
    };

    const handleCreateItem = async (itemData) => {
        try {
            // Préparation du payload pour la création d'un objet unique
            const objectPayload = { ...itemData, prive: true };
            const quantity = objectPayload.quantite || 1;
            
            // Nettoyage des champs qui ne vont pas dans l'objet
            delete objectPayload.quantite;
            
            // Ajout de l'idServeur
            console.log(character.idServer)
            objectPayload.idServeur = character.idServer;

            const payload = {
                idPersonnage: character.id,
                quantite: quantity,
                obtention: "Fabriqué par le joueur",
                objet: objectPayload
            };

            const data = await inventaireService.addItem(payload);
            
            if (data.code === 200 && data.body) {
                let newItem = data.body;
                
                // Si le backend retourne l'association (Inventaire) au lieu de l'Item directement
                if (newItem.objet) {
                    newItem = {
                        ...newItem.objet,
                        quantite: newItem.quantite
                    };
                }

                const newInventory = [...inventoryData.inventaire, newItem];
                setInventoryData(prev => ({ ...prev, inventaire: newInventory }));
                // Mise à jour de l'originalData pour que le reset ne supprime pas cet item
                setOriginalData(prev => ({ ...prev, inventaire: newInventory }));
                
                onUpdate && onUpdate(newInventory);
                setShowItemEditor(false);
                showPopup("Objet créé et ajouté à l'inventaire.", 'success');
            } else {
                showPopup(data.message || "Erreur lors de la création de l'objet.", 'error');
            }
        } catch (error) {
            console.error("Error creating item", error);
            showPopup("Erreur réseau lors de la création de l'objet.", 'error');
        }
    };

    const handleUpdateItem = async (updatedItem) => {
        try {
            const data = await inventaireService.updateItem(updatedItem.id, updatedItem);
            
            if (data.code === 200) {
                // Update item in inventory list
                const newInventory = inventoryData.inventaire.map(i => 
                    i.id === updatedItem.id ? updatedItem : i
                );
                
                // Update item in equipment if equipped
                const newEquipment = { ...inventoryData.equipement };
                Object.keys(newEquipment).forEach(slot => {
                    if (newEquipment[slot] && newEquipment[slot].id === updatedItem.id) {
                        newEquipment[slot] = { ...updatedItem, quantite: 1 };
                    }
                });
                
                setInventoryData(prev => ({ ...prev, inventaire: newInventory, equipement: newEquipment }));
                // Mise à jour de l'originalData pour refléter les changements d'item (stats, etc.)
                setOriginalData(prev => {
                    const newOriginalEquip = { ...prev.equipement };
                    Object.keys(newOriginalEquip).forEach(slot => {
                        if (newOriginalEquip[slot] && newOriginalEquip[slot].id === updatedItem.id) {
                            newOriginalEquip[slot] = { ...updatedItem, quantite: 1 };
                        }
                    });
                    return { ...prev, inventaire: newInventory, equipement: newOriginalEquip };
                });
                
                onUpdate && onUpdate(newInventory);
                setShowItemEditor(false);
                showPopup("Objet modifié avec succès.", 'success');
            } else {
                showPopup(data.message || "Erreur lors de la modification de l'objet.", 'error');
            }
        } catch (error) {
            console.error("Error updating item", error);
            showPopup("Erreur réseau lors de la modification de l'objet.", 'error');
        }
    };

    const handleDeleteItem = async (itemId) => {
        const itemToDelete = inventoryData.inventaire.find(i => i.id === itemId);
        if (!itemToDelete) return;

        setConfirmation({
            isOpen: true,
            title: "Supprimer l'objet",
            message: `Êtes-vous sûr de vouloir supprimer "${itemToDelete.nom}" ? Cette action est irréversible.`,
            type: 'danger',
            onConfirm: async () => {
                try {
                    const data = await inventaireService.deleteItem(itemId, itemToDelete.prive);

                    if (data.code === 200 || !data.code) {
                        const newInventory = inventoryData.inventaire.filter(i => i.id !== itemId);
                        
                        // Also remove from equipment if equipped
                        const newEquipment = { ...inventoryData.equipement };
                        Object.keys(newEquipment).forEach(slot => {
                            if (newEquipment[slot] && newEquipment[slot].id === itemId) {
                                newEquipment[slot] = null;
                            }
                        });
                        
                        setInventoryData(prev => ({ ...prev, inventaire: newInventory, equipement: newEquipment }));
                        // Mise à jour de l'originalData pour que le reset ne fasse pas réapparaître cet item
                        setOriginalData(prev => {
                            const newOriginalEquip = { ...prev.equipement };
                            Object.keys(newOriginalEquip).forEach(slot => {
                                if (newOriginalEquip[slot] && newOriginalEquip[slot].id === itemId) {
                                    newOriginalEquip[slot] = null;
                                }
                            });
                            return { ...prev, inventaire: newInventory, equipement: newOriginalEquip };
                        });
                        
                        onUpdate && onUpdate(newInventory);
                        showPopup("Objet supprimé avec succès.", 'success');
                    } else {
                        showPopup(data.message || "Erreur lors de la suppression de l'objet.", 'error');
                    }
                } catch (error) {
                    console.error("Error deleting item", error);
                    showPopup("Erreur réseau lors de la suppression de l'objet.", 'error');
                }
            }
        });
    };
    
    const handleAddSlot = async () => {
        setConfirmation({
            isOpen: true,
            title: "Ajouter un emplacement",
            message: "Entrez le nom du nouvel emplacement d'équipement.",
            type: 'input',
            inputPlaceholder: "Ex: Cape, Ceinture...",
            onConfirm: async (slotName) => {
                if (!slotName) return;
        
                // Vérifier si le slot existe déjà
                if (inventoryData.equipement[slotName] !== undefined) {
                    showPopup("Cet emplacement existe déjà.", 'error');
                    return;
                }

                try {
                    const data = await equipementService.addSlot(character.id, slotName);
                    
                    if (data.code === 200) {
                        // Mise à jour locale
                        setInventoryData(prev => ({
                            ...prev,
                            equipement: {
                                ...prev.equipement,
                                [slotName]: null
                            }
                        }));
                        
                        // Mise à jour de l'originalData pour que ce ne soit pas considéré comme une modif non sauvegardée
                        setOriginalData(prev => ({
                            ...prev,
                            equipement: {
                                ...prev.equipement,
                                [slotName]: null
                            }
                        }));
                        
                        showPopup(`Emplacement "${slotName}" ajouté.`, 'success');
                    } else {
                        showPopup(data.message || "Erreur lors de l'ajout de l'emplacement.", 'error');
                    }
                } catch (error) {
                    console.error("Error adding slot", error);
                    showPopup("Erreur réseau lors de l'ajout de l'emplacement.", 'error');
                }
            }
        });
    };

    const handleRemoveSlot = async (slotName) => {
        // Vérifier si c'est un slot standard
        const standardSlots = ['tete', 'torse', 'deuxMains', 'mainDroite', 'mainGauche', 'pieds', 'accessoire1', 'accessoire2'];
        if (standardSlots.includes(slotName)) {
            showPopup("Impossible de supprimer un emplacement standard.", 'error');
            return;
        }

        setConfirmation({
            isOpen: true,
            title: "Supprimer l'emplacement",
            message: `Voulez-vous vraiment supprimer l'emplacement "${slotName}" ?`,
            type: 'danger',
            onConfirm: async () => {
                try {
                    const data = await equipementService.removeSlot(character.id, slotName);
                    
                    if (data.code === 200) {
                        setInventoryData(prev => {
                            const newEquipment = { ...prev.equipement };
                            const newInventory = [...prev.inventaire];
                            
                            // Si un objet est équipé, on le remet dans l'inventaire
                            const itemToUnequip = newEquipment[slotName];
                            if (itemToUnequip) {
                                const existingIndex = newInventory.findIndex(i => i.id === itemToUnequip.id);
                                if (existingIndex !== -1) {
                                    newInventory[existingIndex] = {
                                        ...newInventory[existingIndex],
                                        quantite: newInventory[existingIndex].quantite + 1
                                    };
                                } else {
                                    newInventory.push({ ...itemToUnequip, quantite: 1 });
                                }
                            }

                            delete newEquipment[slotName];

                            return {
                                ...prev,
                                equipement: newEquipment,
                                inventaire: newInventory
                            };
                        });
                        
                        // Mise à jour de l'originalData
                        setOriginalData(prev => {
                            const newEquipment = { ...prev.equipement };
                            delete newEquipment[slotName];
                            return {
                                ...prev,
                                equipement: newEquipment
                            };
                        });
                        
                        showPopup(`Emplacement "${slotName}" supprimé.`, 'success');
                    } else {
                        showPopup(data.message || "Erreur lors de la suppression de l'emplacement.", 'error');
                    }
                } catch (error) {
                    console.error("Error removing slot", error);
                    showPopup("Erreur réseau lors de la suppression de l'emplacement.", 'error');
                }
            }
        });
    };

    const handleStatChange = (stat, value) => {
        let newValue = value;
        let maxStat = stat === 'vie' ? inventoryData.vieMax : inventoryData.manaMax;
        
        // Clamp value between 0 and max
        newValue = Math.max(0, Math.min(newValue, maxStat));
        
        setInventoryData(prev => ({ ...prev, [stat]: newValue }));
        
        // Map 'mana' to 'energie' for API
        const apiStatKey = stat === 'mana' ? 'energie' : stat;
        setPendingStatChanges(prev => ({ ...prev, [apiStatKey]: newValue }));
    };

    const handleSaveChanges = async () => {
        if (!hasChanges) return;
        setIsSaving(true);
        const promises = [];

        // 1. Sauvegarde des stats (PV/Mana) si modifiées
        if (Object.keys(pendingStatChanges).length > 0) {
            promises.push(
                personnageService.updatePersonnage(character.id, pendingStatChanges)
                    .then(res => {
                        if (res.code !== 200) throw new Error("Erreur stats");
                        return "stats";
                    })
            );
        }

        // 2. Sauvegarde de l'équipement si modifié
        // On vérifie s'il y a vraiment des changements d'équipement par rapport à l'original
        const isEquipmentReallyModified = checkHasChanges();
        
        if (isEquipmentReallyModified) {
            const newEquipment = inventoryData.equipement;
            // Mapping des slots frontend vers le format backend
            const payload = {
                tete: newEquipment.tete?.id || null,
                torse: newEquipment.torse?.id || null,
                main_droite: newEquipment.mainDroite?.id || null,
                main_gauche: newEquipment.mainGauche?.id || null,
                deux_mains: newEquipment.deuxMains?.id || null,
                pied: newEquipment.pieds?.id || null,
                accessoire_1: newEquipment.accessoire1?.id || null,
                accessoire_2: newEquipment.accessoire2?.id || null,
                personnalise: {}
            };

            // Gestion des slots personnalisés
            const standardSlots = ['tete', 'torse', 'mainDroite', 'mainGauche', 'deuxMains', 'pieds', 'accessoire1', 'accessoire2'];
            Object.keys(newEquipment).forEach(key => {
                if (!standardSlots.includes(key)) {
                    // On envoie la clé même si la valeur est null, pour que le backend sache que le slot existe
                    payload.personnalise[key] = newEquipment[key]?.id || null;
                }
            });

            promises.push(
                equipementService.updateEquipement(character.id, payload)
                    .then(async res => {
                        if (!res.ok && res.code !== 200) throw new Error("Erreur équipement");
                        return "equipment";
                    })
            );
        }

        try {
            await Promise.all(promises);
            setPendingStatChanges({});
            // Mise à jour de l'originalData avec les nouvelles données sauvegardées
            setOriginalData(JSON.parse(JSON.stringify(inventoryData)));
            
            showPopup("Modifications sauvegardées avec succès !", 'success');
            
            // Notification au parent du succès de la sauvegarde avec les nouvelles données
            if (onSaveSuccess) {
                onSaveSuccess(inventoryData);
            }
        } catch (error) {
            console.error("Erreur lors de la sauvegarde:", error);
            showPopup("Erreur lors de la sauvegarde des modifications.", 'error');
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleReset = () => {
        if (!originalData) return;
        
        // On récupère les données originales
        const resetData = JSON.parse(JSON.stringify(originalData));
        
        // MAIS on garde l'inventaire actuel car il est synchronisé en direct avec le backend
        // et ne fait pas partie des "modifications en attente"
        setInventoryData(current => ({
            ...resetData,
            inventaire: current.inventaire
        }));
        
        setPendingStatChanges({});
        setIsEquipmentModified(false);
        showPopup("Modifications annulées.", 'info');
    };

    // Exposer la méthode de sauvegarde au parent
    useImperativeHandle(ref, () => ({
        handleSaveChanges,
        handleReset
    }));

    const openEditorForNew = () => {
        setIsCreatingNew(true);
        setEditingItem({
            nom: "Nouvel Objet",
            description: "",
            type: "EQUIPEMENT",
            rarete: "COMMON",
            icone: "📦",
            statistique: {},
            quantite: 1,
            prive: true // Ajout de la propriété prive: true
        });
        setShowItemEditor(true);
    };

    const openEditorForEdit = (item) => {
        setIsCreatingNew(false);
        setEditingItem({ ...item });
        setShowItemEditor(true);
    };

    return (
        <>
            <div className="min-h-screen p-8">
                <div className="max-w-[1800px] mx-auto relative">
                    {/* Le bouton de sauvegarde est maintenant géré par le parent via ref */}

                    <div className="flex gap-6 items-start">
                        {/* Personnage + équipement (grand) */}
                        <div className="flex-1 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 border-2 border-orange-500/50 shadow-2xl">
                            <div className="flex gap-8 h-full">
                                {/* Avatar et stats */}
                                <InventoryCharacterStats 
                                    character={character}
                                    inventoryData={inventoryData}
                                    editMode={editMode}
                                    handleStatChange={handleStatChange}
                                    totalStats={totalStats}
                                />

                                {/* Slots d'équipement en liste */}
                                <InventoryEquipmentSlots 
                                    inventoryData={inventoryData}
                                    editMode={editMode}
                                    highlightedSlots={highlightedSlots}
                                    handleDragOver={handleDragOver}
                                    handleDropOnSlot={handleDropOnSlot}
                                    handleDragStart={handleDragStart}
                                    handleDragEnd={handleDragEnd}
                                    unequipItem={unequipItem}
                                    handleAddSlot={handleAddSlot}
                                    handleRemoveSlot={handleRemoveSlot}
                                    setHoveredStatsExpand={setHoveredStatsExpand}
                                    hoveredStatsExpand={hoveredStatsExpand}
                                    characterId={character.id}
                                />
                            </div>
                        </div>

                        {/* Inventaire sidebar */}
                        <InventoryList 
                            inventory={inventoryData.inventaire}
                            editMode={editMode}
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                            itemsPerPage={itemsPerPage}
                            handleDragStart={handleDragStart}
                            handleDragEnd={handleDragEnd}
                            handleDragOver={handleDragOver}
                            handleDropOnInventory={handleDropOnInventory}
                            setShowItemBank={setShowItemBank}
                            openEditorForNew={openEditorForNew}
                            openEditorForEdit={openEditorForEdit}
                            handleDeleteItem={handleDeleteItem}
                            setHoveredItem={setHoveredItem}
                            hoveredItem={hoveredItem}
                            setHoveredStatsExpand={setHoveredStatsExpand}
                            hoveredStatsExpand={hoveredStatsExpand}
                        />
                    </div>
                </div>
            </div>
            
            {createPortal(
                <ItemBankModal 
                    isOpen={showItemBank} 
                    onClose={() => setShowItemBank(false)} 
                    onSelect={handleAddItemFromBank} 
                    serverId={serverId}
                />,
                document.body
            )}
            
            {showItemEditor && createPortal(
                <ItemEditorModal
                    item={editingItem}
                    onCancel={() => setShowItemEditor(false)}
                    onSave={() => isCreatingNew ? handleCreateItem(editingItem) : handleUpdateItem(editingItem)}
                    updateField={(field, value) => setEditingItem(prev => ({ ...prev, [field]: value }))}
                    addStat={() => setEditingItem(prev => ({ ...prev, statistique: { ...prev.statistique, "NOUVELLE STAT": "0" } }))}
                    updateStat={(oldKey, newKey, value) => {
                        setEditingItem(prev => {
                            const newStats = { ...prev.statistique };
                            if (oldKey !== newKey) {
                                delete newStats[oldKey];
                            }
                            newStats[newKey] = value;
                            return { ...prev, statistique: newStats };
                        });
                    }}
                    removeStat={(key) => {
                        setEditingItem(prev => {
                            const newStats = { ...prev.statistique };
                            delete newStats[key];
                            return { ...prev, statistique: newStats };
                        });
                    }}
                    saving={false}
                />,
                document.body
            )}

            {createPortal(
                <Popup message={popup.message} type={popup.type} onClose={closePopup} />,
                document.body
            )}

            {createPortal(
                <AlertConfirmation 
                    isOpen={confirmation.isOpen}
                    onClose={() => setConfirmation({ isOpen: false })}
                    onConfirm={confirmation.onConfirm}
                    title={confirmation.title}
                    message={confirmation.message}
                    type={confirmation.type}
                    inputPlaceholder={confirmation.inputPlaceholder}
                />,
                document.body
            )}
        </>
    );
});

export default CharacterInventory;