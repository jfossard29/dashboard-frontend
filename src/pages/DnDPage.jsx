import React, { useState, useEffect } from 'react';
import { Heart, Shield, Zap, TrendingUp, Star, Coins, Dice6, Skull, Check, X, Edit3, Save, ChevronUp, ChevronDown, Plus, Trash2 } from 'lucide-react';
import personnageService from "../services/personnageService.js";
import ressourceDndService from "../services/ressourceDndService.js";

const DnDPage = ({ character: initialCharacter, onUpdate, editMode: externalEditMode, onSave }) => {
    const [editMode, setEditMode] = useState(externalEditMode || false);
    const [saving, setSaving] = useState(false);
    
    // Initialisation avec les données du personnage ou des valeurs par défaut
    const [character, setCharacter] = useState({
        id: initialCharacter?.id,
        prenom: initialCharacter?.prenom || "Prénom",
        nom: initialCharacter?.nom || "Nom du personnage",
        classe: initialCharacter?.classe || "Classe",
        race: initialCharacter?.race || "Race",
        niveau: initialCharacter?.level || 1,
        background: initialCharacter?.historique || "Historique",

        // Statistiques principales
        stats: {
            force: 10,
            dexterite: 10,
            constitution: 10,
            intelligence: 10,
            sagesse: 10,
            charisme: 10,
            ...initialCharacter?.stats
        },

        // Jets de sauvegarde
        savingThrows: {
            force: false,
            dexterite: false,
            constitution: false,
            intelligence: false,
            sagesse: false,
            charisme: false,
            ...initialCharacter?.savingThrows
        },

        // Compétences
        skills: {
            "Acrobaties": false,
            "Arcanes": false,
            "Athlétisme": false,
            "Discrétion": false,
            "Dressage": false,
            "Escamotage": false,
            "Histoire": false,
            "Intimidation": false,
            "Investigation": false,
            "Médecine": false,
            "Nature": false,
            "Perception": false,
            "Perspicacité": false,
            "Persuasion": false,
            "Religion": false,
            "Représentation": false,
            "Supercherie": false,
            "Survie": false,
            ...initialCharacter?.skills
        },

        // Système de combat/santé
        pvActuels: initialCharacter?.vie || 10,
        pvMax: initialCharacter?.vieMax || 10,
        pvTemp: 0,
        desDeVie: initialCharacter?.desDeVie || "1d8",
        desDeVieRestants: initialCharacter?.desDeVieRestants || 1,

        // Jets de sauvegarde contre la mort
        deathSaves: {
            successes: 0,
            failures: 0
        },

        // Caractéristiques de combat
        ca: initialCharacter?.ca || 10,
        initiative: initialCharacter?.initiative || 0,
        vitesse: initialCharacter?.vitesse || 30,
        inspiration: false,
        bonusMaitrise: initialCharacter?.bonusMaitrise || 2,

        // Monnaie
        monnaie: {
            pc: 0,
            pa: 0,
            pe: 0,
            po: 0,
            pp: 0,
            ...initialCharacter?.monnaie
        },

        // Notes (Structure mise à jour pour listes)
        notes: {
            outils: initialCharacter?.notes?.outils || "", 
            autres: initialCharacter?.notes?.autres || "", 
            traitsRaciaux: initialCharacter?.notes?.traitsRaciaux || ""
        },

        // Ressources
        ressources: []
    });

    // Mettre à jour l'état local si les props changent (ex: après un fetch dans le parent)
    useEffect(() => {
        if (initialCharacter) {
            setCharacter(prev => ({
                ...prev,
                ...initialCharacter,
                stats: { ...prev.stats, ...initialCharacter.stats },
                savingThrows: { ...prev.savingThrows, ...initialCharacter.savingThrows },
                skills: { ...prev.skills, ...initialCharacter.skills },
                monnaie: { ...prev.monnaie, ...initialCharacter.monnaie },
                notes: { ...prev.notes, ...initialCharacter.notes }
            }));
            
            // Charger les ressources
            if (initialCharacter.id) {
                loadRessources(initialCharacter.id);
            }
        }
    }, [initialCharacter]);

    useEffect(() => {
        setEditMode(externalEditMode);
    }, [externalEditMode]);

    // Exposer la fonction de sauvegarde au parent via onSave
    useEffect(() => {
        if (onSave) {
            onSave(handleSave);
        }
    }, [onSave, character]); // Dépendance à character pour avoir la dernière version lors de la sauvegarde

    const loadRessources = async (personnageId) => {
        try {
            const response = await ressourceDndService.getRessourcesByPersonnage(personnageId);
            if (response.code === 200) {
                setCharacter(prev => ({
                    ...prev,
                    ressources: response.body || []
                }));
            }
        } catch (error) {
            console.error("Erreur lors du chargement des ressources:", error);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const promises = [];

            // 1. Sauvegarde des statistiques
            const statsPayload = {
                force: character.stats.force,
                dexterite: character.stats.dexterite,
                constitution: character.stats.constitution,
                intelligence: character.stats.intelligence,
                sagesse: character.stats.sagesse,
                charisme: character.stats.charisme,
                sauvegardeForce: character.savingThrows.force ? 1 : 0,
                sauvegardeDexterite: character.savingThrows.dexterite ? 1 : 0,
                sauvegardeConstitution: character.savingThrows.constitution ? 1 : 0,
                sauvegardeIntelligence: character.savingThrows.intelligence ? 1 : 0,
                sauvegardeSagesse: character.savingThrows.sagesse ? 1 : 0,
                sauvegardeCharisme: character.savingThrows.charisme ? 1 : 0,
                classeArmure: character.ca,
                initiative: character.initiative,
                vitesse: parseFloat(character.vitesse),
                deDeVie: character.desDeVie,
                deDeVieRestant: character.desDeVieRestants,
                maitrise: character.bonusMaitrise
            };
            promises.push(personnageService.updateStatistiques(character.id, statsPayload));

            // 2. Sauvegarde des compétences
            const skillsPayload = {
                acrobaties: character.skills["Acrobaties"] ? 1 : 0,
                arcanes: character.skills["Arcanes"] ? 1 : 0,
                athletisme: character.skills["Athlétisme"] ? 1 : 0,
                discretion: character.skills["Discrétion"] ? 1 : 0,
                dressage: character.skills["Dressage"] ? 1 : 0,
                escamotage: character.skills["Escamotage"] ? 1 : 0,
                histoire: character.skills["Histoire"] ? 1 : 0,
                intimidation: character.skills["Intimidation"] ? 1 : 0,
                investigation: character.skills["Investigation"] ? 1 : 0,
                medecine: character.skills["Médecine"] ? 1 : 0,
                nature: character.skills["Nature"] ? 1 : 0,
                perception: character.skills["Perception"] ? 1 : 0,
                perspicacite: character.skills["Perspicacité"] ? 1 : 0,
                persuasion: character.skills["Persuasion"] ? 1 : 0,
                religion: character.skills["Religion"] ? 1 : 0,
                representation: character.skills["Représentation"] ? 1 : 0,
                supercherie: character.skills["Supercherie"] ? 1 : 0,
                survie: character.skills["Survie"] ? 1 : 0
            };
            promises.push(personnageService.updateStatistiqueCompetence(character.id, skillsPayload));

            // 3. Sauvegarde de la monnaie
            const moneyPayload = {
                platine: character.monnaie.pp,
                or: character.monnaie.po,
                electrum: character.monnaie.pe,
                argent: character.monnaie.pa,
                cuivre: character.monnaie.pc
            };
            promises.push(personnageService.updateMonnaie(character.id, moneyPayload));

            // 4. Sauvegarde des infos personnage (pour les notes et la vie)
            const infosPayload = {
                noteMaitrise: character.notes.outils,
                autreMaitrise: character.notes.autres,
                vie: character.pvActuels,
                vieMax: character.pvMax,
                // vieTemp: character.pvTemp // Si le backend supporte vieTemp, décommentez ceci
            };
            promises.push(personnageService.updateInfosPersonnage(character.id, infosPayload));

            // Exécution des requêtes en parallèle
            const responses = await Promise.all(promises);
            
            // Vérification des erreurs
            const errors = responses.filter(res => res.code !== 200);
            
            if (errors.length === 0) {
                // setEditMode(false); // Géré par le parent
                if (onUpdate) onUpdate(character);
                return true;
            } else {
                console.error("Erreurs lors de la sauvegarde:", errors);
                return false;
            }
        } catch (error) {
            console.error("Erreur réseau lors de la sauvegarde D&D:", error);
            return false;
        } finally {
            setSaving(false);
        }
    };

    const getModifier = (stat) => {
        if (stat > 20) return 5; // Limite à 20
        const diff = stat - 10;
        return diff >= 0 ? Math.floor(diff / 2) : Math.ceil(diff / 2);
    };

    const formatModifier = (mod) => {
        return mod >= 0 ? `+${mod}` : `${mod}`;
    };

    const getSavingThrowBonus = (statName) => {
        const stat = character.stats[statName.toLowerCase()];
        const modifier = getModifier(stat);
        const proficiency = character.savingThrows[statName.toLowerCase()] ? character.bonusMaitrise : 0;
        return modifier + proficiency;
    };

    const getSkillBonus = (skillName) => {
        const skillToStat = {
            "Acrobaties": "dexterite",
            "Arcanes": "intelligence",
            "Athlétisme": "force",
            "Discrétion": "dexterite",
            "Dressage": "sagesse",
            "Escamotage": "dexterite",
            "Histoire": "intelligence",
            "Intimidation": "charisme",
            "Investigation": "intelligence",
            "Médecine": "sagesse",
            "Nature": "intelligence",
            "Perception": "sagesse",
            "Perspicacité": "sagesse",
            "Persuasion": "charisme",
            "Religion": "intelligence",
            "Représentation": "charisme",
            "Supercherie": "charisme",
            "Survie": "sagesse"
        };

        const stat = character.stats[skillToStat[skillName]];
        const modifier = getModifier(stat);
        const proficiency = character.skills[skillName] ? character.bonusMaitrise : 0;
        return modifier + proficiency;
    };

    const getSkillStatAbbr = (skillName) => {
        const skillToStatAbbr = {
            "Acrobaties": "Dex",
            "Arcanes": "Int",
            "Athlétisme": "For",
            "Discrétion": "Dex",
            "Dressage": "Sag",
            "Escamotage": "Dex",
            "Histoire": "Int",
            "Intimidation": "Cha",
            "Investigation": "Int",
            "Médecine": "Sag",
            "Nature": "Int",
            "Perception": "Sag",
            "Perspicacité": "Sag",
            "Persuasion": "Cha",
            "Religion": "Int",
            "Représentation": "Cha",
            "Supercherie": "Cha",
            "Survie": "Sag"
        };
        return skillToStatAbbr[skillName] || "";
    };

    const toggleDeathSave = (type, index) => {
        setCharacter(prev => ({
            ...prev,
            deathSaves: {
                ...prev.deathSaves,
                [type]: prev.deathSaves[type] === index + 1 ? index : index + 1
            }
        }));
    };

    const updateCharacter = (path, value) => {
        setCharacter(prev => {
            const keys = path.split('.');
            const newChar = { ...prev };
            let current = newChar;

            for (let i = 0; i < keys.length - 1; i++) {
                current[keys[i]] = { ...current[keys[i]] };
                current = current[keys[i]];
            }

            current[keys[keys.length - 1]] = value;
            return newChar;
        });
    };

    const handleSpeedChange = (e) => {
        let val = e.target.value;
        val = val.replace(',', '.');
        if (/^\d*\.?\d*$/.test(val)) {
            updateCharacter('vitesse', val);
        }
    };

    const incrementValue = (path, amount = 1) => {
        const keys = path.split('.');
        let current = character;
        for (const key of keys) {
            current = current[key];
        }

        if (path === 'desDeVie.nombre') {
            const match = character.desDeVie.match(/(\d+)d(\d+)/);
            if (match) {
                const [, nombre, faces] = match;
                const newNombre = Math.max(1, parseInt(nombre) + amount);
                updateCharacter('desDeVie', `${newNombre}d${faces}`);
            }
            return;
        }

        if (path === 'desDeVie.faces') {
            const match = character.desDeVie.match(/(\d+)d(\d+)/);
            if (match) {
                const [, nombre, faces] = match;
                const validFaces = [4, 6, 8, 10, 12, 20, 100];
                const currentIndex = validFaces.indexOf(parseInt(faces));
                let newIndex = currentIndex + (amount > 0 ? 1 : -1);
                newIndex = Math.max(0, Math.min(validFaces.length - 1, newIndex));
                updateCharacter('desDeVie', `${nombre}d${validFaces[newIndex]}`);
            }
            return;
        }

        // Limite à 20 pour les stats principales
        if (path.startsWith('stats.')) {
            const newValue = current + amount;
            if (newValue > 20) return; // Ne pas dépasser 20
        }

        updateCharacter(path, Math.max(0, current + amount));
    };

    const toggleProficiency = (type, key) => {
        setCharacter(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                [key]: !prev[type][key]
            }
        }));
    };

    // --- Gestion des Ressources ---
    const addRessource = async () => {
        if (!character.id) {
            console.error("ID personnage manquant pour l'ajout de ressource");
            return;
        }

        const newRessource = {
            idPersonnage: character.id,
            titre: "Nouvelle ressource",
            total: "0",
            nb: 0
        };
        
        try {
            const response = await ressourceDndService.createRessource(newRessource);
            if (response.code === 200) {
                // On recharge la liste pour être sûr d'avoir les données correctes (notamment l'ID)
                await loadRessources(character.id);
            } else {
                console.error("Erreur création ressource:", response);
            }
        } catch (error) {
            console.error("Erreur lors de la création de la ressource:", error);
        }
    };

    const updateRessource = async (id, field, value) => {
        // Mise à jour optimiste
        setCharacter(prev => ({
            ...prev,
            ressources: prev.ressources.map(r =>
                r.id === id ? { ...r, [field]: value } : r
            )
        }));

        try {
            const payload = { [field]: value };
            console.log("Mise à jour ressource:", id, payload);
            await ressourceDndService.updateRessource(id, payload);
        } catch (error) {
            console.error("Erreur lors de la mise à jour de la ressource:", error);
        }
    };

    const removeRessource = async (id) => {
        try {
            const response = await ressourceDndService.deleteRessource(id);
            if (response.code === 200) {
                setCharacter(prev => ({
                    ...prev,
                    ressources: prev.ressources.filter(r => r.id !== id)
                }));
            }
        } catch (error) {
            console.error("Erreur lors de la suppression de la ressource:", error);
        }
    };

    // --- Gestion des Outils ---
    const addOutil = () => {
        const newId = Math.max(0, ...(character.notes.outils || []).map(o => o.id || 0)) + 1;
        const newOutil = { id: newId, nom: "", maitrise: false, carac: "Dextérité" };
        updateCharacter('notes.outils', [...(character.notes.outils || []), newOutil]);
    };

    const updateOutil = (id, field, value) => {
        const updatedOutils = character.notes.outils.map(o => 
            o.id === id ? { ...o, [field]: value } : o
        );
        updateCharacter('notes.outils', updatedOutils);
    };

    const removeOutil = (id) => {
        const updatedOutils = character.notes.outils.filter(o => o.id !== id);
        updateCharacter('notes.outils', updatedOutils);
    };

    // --- Gestion des Autres Maîtrises ---
    const addAutreMaitrise = () => {
        const newId = Math.max(0, ...(character.notes.autres || []).map(a => a.id || 0)) + 1;
        const newAutre = { id: newId, type: "", maitrise: "" };
        updateCharacter('notes.autres', [...(character.notes.autres || []), newAutre]);
    };

    const updateAutreMaitrise = (id, field, value) => {
        const updatedAutres = character.notes.autres.map(a => 
            a.id === id ? { ...a, [field]: value } : a
        );
        updateCharacter('notes.autres', updatedAutres);
    };

    const removeAutreMaitrise = (id) => {
        const updatedAutres = character.notes.autres.filter(a => a.id !== id);
        updateCharacter('notes.autres', updatedAutres);
    };

    const statNames = {
        force: "Force",
        dexterite: "Dextérité",
        constitution: "Constitution",
        intelligence: "Intelligence",
        sagesse: "Sagesse",
        charisme: "Charisme"
    };

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-7xl mx-auto">
                {/* En-tête du personnage */}
                <div className="bg-gradient-to-br from-amber-900/40 to-stone-900/40 backdrop-blur-sm rounded-xl p-6 border-2 border-amber-700/50 mb-6 shadow-2xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-amber-400 mb-2">{character.prenom} {character.nom}</h1>
                            <p className="text-gray-300 text-lg">
                                {character.race} • {character.classe} niveau {character.niveau} • {character.background}
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => editMode && updateCharacter('inspiration', !character.inspiration)}
                                disabled={!editMode}
                                className={`border-2 rounded-lg px-4 py-2 transition-all ${
                                    character.inspiration
                                        ? 'bg-purple-500/20 border-purple-500'
                                        : 'bg-gray-800/50 border-gray-600'
                                } ${editMode ? 'cursor-pointer hover:border-purple-500' : 'cursor-default'}`}
                            >
                                {character.inspiration ? (
                                    <Star className="text-purple-400 inline mr-2 fill-purple-400" size={20} />
                                ) : (
                                    <Star className="text-gray-500 inline mr-2" size={20} />
                                )}
                                <span className={`${character.inspiration ? 'text-purple-300' : 'text-gray-400'} font-bold`}>
                  Inspiration
                </span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-6">
                    {/* Colonne gauche - Stats principales */}
                    <div className="col-span-3 space-y-4">
                        <div className="bg-gradient-to-br from-red-900/40 to-stone-900/40 rounded-xl p-4 border-2 border-red-700/50 shadow-xl">
                            <h3 className="text-red-400 font-bold text-sm mb-3 uppercase tracking-wider text-center">Statistiques</h3>
                            <div className="space-y-3">
                                {Object.entries(character.stats).map(([stat, value]) => {
                                    const modifier = getModifier(value);
                                    return (
                                        <div key={stat} className="bg-stone-900/50 rounded-lg p-3 border border-stone-700">
                                            <div className="text-amber-300 text-xs font-bold uppercase text-center mb-1">
                                                {statNames[stat]}
                                            </div>
                                            <div className="text-center">
                                                <div className="text-3xl font-bold text-white mb-1">{formatModifier(modifier)}</div>
                                                {editMode ? (
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button
                                                            onClick={() => incrementValue(`stats.${stat}`, -1)}
                                                            className="text-red-400 hover:text-red-300 transition-colors p-1"
                                                        >
                                                            <ChevronDown size={16} />
                                                        </button>
                                                        <span className="text-sm text-gray-400 w-8">({value})</span>
                                                        <button
                                                            onClick={() => incrementValue(`stats.${stat}`, 1)}
                                                            className="text-green-400 hover:text-green-300 transition-colors p-1"
                                                        >
                                                            <ChevronUp size={16} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="text-sm text-gray-400">({value})</div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Bonus de maîtrise large */}
                        <div className="bg-gradient-to-br from-amber-900/40 to-stone-900/40 rounded-xl p-4 border-2 border-amber-700/50 text-center">
                            <div className="text-amber-400 text-xs font-bold uppercase mb-2">Bonus de maîtrise</div>
                            {editMode ? (
                                <div className="flex items-center justify-center gap-2">
                                    <button onClick={() => incrementValue('bonusMaitrise', -1)} className="text-red-400 hover:text-red-300 p-1">
                                        <ChevronDown size={20} />
                                    </button>
                                    <div className="text-4xl font-bold text-amber-300">+{character.bonusMaitrise}</div>
                                    <button onClick={() => incrementValue('bonusMaitrise', 1)} className="text-green-400 hover:text-green-300 p-1">
                                        <ChevronUp size={20} />
                                    </button>
                                </div>
                            ) : (
                                <div className="text-4xl font-bold text-amber-300">+{character.bonusMaitrise}</div>
                            )}
                        </div>
                    </div>

                    {/* Colonne centrale - Combat et compétences */}
                    <div className="col-span-6 space-y-4">
                        {/* Stats de combat */}
                        <div className="grid grid-cols-4 gap-4">
                            <div className="bg-gradient-to-br from-blue-900/40 to-stone-900/40 rounded-xl p-4 border-2 border-blue-700/50 text-center">
                                <Shield className="text-blue-400 mx-auto mb-2" size={24} />
                                <div className="text-blue-400 text-xs font-bold uppercase mb-1">CA</div>
                                {editMode ? (
                                    <div className="flex items-center justify-center gap-1">
                                        <button onClick={() => incrementValue('ca', -1)} className="text-red-400 hover:text-red-300 p-1">
                                            <ChevronDown size={20} />
                                        </button>
                                        <div className="text-3xl font-bold text-white w-16">{character.ca}</div>
                                        <button onClick={() => incrementValue('ca', 1)} className="text-green-400 hover:text-green-300 p-1">
                                            <ChevronUp size={20} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-3xl font-bold text-white">{character.ca}</div>
                                )}
                            </div>

                            <div className="bg-gradient-to-br from-green-900/40 to-stone-900/40 rounded-xl p-4 border-2 border-green-700/50 text-center">
                                <Zap className="text-green-400 mx-auto mb-2" size={24} />
                                <div className="text-green-400 text-xs font-bold uppercase mb-1">Initiative</div>
                                {editMode ? (
                                    <div className="flex items-center justify-center gap-1">
                                        <button onClick={() => incrementValue('initiative', -1)} className="text-red-400 hover:text-red-300 p-1">
                                            <ChevronDown size={20} />
                                        </button>
                                        <div className="text-3xl font-bold text-white w-16">{formatModifier(character.initiative)}</div>
                                        <button onClick={() => incrementValue('initiative', 1)} className="text-green-400 hover:text-green-300 p-1">
                                            <ChevronUp size={20} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-3xl font-bold text-white">{formatModifier(character.initiative)}</div>
                                )}
                            </div>

                            <div className="bg-gradient-to-br from-yellow-900/40 to-stone-900/40 rounded-xl p-4 border-2 border-yellow-700/50 text-center">
                                <TrendingUp className="text-yellow-400 mx-auto mb-2" size={24} />
                                <div className="text-yellow-400 text-xs font-bold uppercase mb-1">Vitesse</div>
                                {editMode ? (
                                    <div className="flex items-center justify-center">
                                        <input
                                            type="text"
                                            value={character.vitesse}
                                            onChange={handleSpeedChange}
                                            className="text-3xl font-bold text-white w-20 bg-transparent border-b border-yellow-500/50 text-center focus:outline-none focus:border-yellow-400"
                                        />
                                    </div>
                                ) : (
                                    <div className="text-3xl font-bold text-white">{character.vitesse}</div>
                                )}
                            </div>

                            <div className="bg-gradient-to-br from-purple-900/40 to-stone-900/40 rounded-xl p-4 border-2 border-purple-700/50 text-center">
                                <Dice6 className="text-purple-400 mx-auto mb-2" size={24} />
                                <div className="text-purple-400 text-xs font-bold uppercase mb-1">Dés de vie</div>
                                {editMode ? (
                                    <div className="flex items-center justify-center gap-1">
                                        <div className="flex flex-col items-center">
                                            <button onClick={() => incrementValue('desDeVie.nombre', 1)} className="text-green-400 hover:text-green-300 p-1">
                                                <ChevronUp size={14} />
                                            </button>
                                            <span className="text-lg font-bold text-white">{character.desDeVie.match(/\d+/)?.[0] || 0}</span>
                                            <button onClick={() => incrementValue('desDeVie.nombre', -1)} className="text-red-400 hover:text-red-300 p-1">
                                                <ChevronDown size={14} />
                                            </button>
                                        </div>
                                        <span className="text-lg font-bold text-white">d</span>
                                        <div className="flex flex-col items-center">
                                            <button onClick={() => incrementValue('desDeVie.faces', 1)} className="text-green-400 hover:text-green-300 p-1">
                                                <ChevronUp size={14} />
                                            </button>
                                            <span className="text-lg font-bold text-white">{character.desDeVie.match(/d(\d+)/)?.[1] || 10}</span>
                                            <button onClick={() => incrementValue('desDeVie.faces', -1)} className="text-red-400 hover:text-red-300 p-1">
                                                <ChevronDown size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-lg font-bold text-white">{character.desDeVie}</div>
                                )}
                                {editMode ? (
                                    <div className="flex items-center justify-center gap-1 mt-1">
                                        <button onClick={() => incrementValue('desDeVieRestants', -1)} className="text-red-400 hover:text-red-300">
                                            <ChevronDown size={14} />
                                        </button>
                                        <div className="text-xs text-gray-400">{character.desDeVieRestants}</div>
                                        <button onClick={() => incrementValue('desDeVieRestants', 1)} className="text-green-400 hover:text-green-300">
                                            <ChevronUp size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-xs text-gray-400">{character.desDeVieRestants} restants</div>
                                )}
                            </div>
                        </div>

                        {/* Points de vie */}
                        <div className="bg-gradient-to-br from-red-900/40 to-stone-900/40 rounded-xl p-6 border-2 border-red-700/50 shadow-xl">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-red-400 font-bold text-lg uppercase tracking-wider flex items-center gap-2">
                                    <Heart size={20} />
                                    Points de Vie
                                </h3>
                                <div className="text-right">
                                    {editMode ? (
                                        <div className="flex items-center gap-2">
                                            <div className="flex flex-col items-center">
                                                <button
                                                    onClick={() => incrementValue('pvActuels', 1)}
                                                    className="text-green-400 hover:text-green-300 p-1"
                                                >
                                                    <ChevronUp size={20} />
                                                </button>
                                                <div className="text-2xl font-bold text-white">{character.pvActuels}</div>
                                                <button
                                                    onClick={() => incrementValue('pvActuels', -1)}
                                                    className="text-red-400 hover:text-red-300 p-1"
                                                >
                                                    <ChevronDown size={20} />
                                                </button>
                                            </div>
                                            <span className="text-2xl font-bold text-white">/</span>
                                            <div className="flex flex-col items-center">
                                                <button
                                                    onClick={() => incrementValue('pvMax', 1)}
                                                    className="text-green-400 hover:text-green-300 p-1"
                                                >
                                                    <ChevronUp size={20} />
                                                </button>
                                                <div className="text-2xl font-bold text-white">{character.pvMax}</div>
                                                <button
                                                    onClick={() => incrementValue('pvMax', -1)}
                                                    className="text-red-400 hover:text-red-300 p-1"
                                                >
                                                    <ChevronDown size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-3xl font-bold text-white">
                                            {character.pvActuels} / {character.pvMax}
                                        </div>
                                    )}
                                    {editMode ? (
                                        <div className="mt-2 flex items-center gap-1 justify-end">
                                            <span className="text-xs text-blue-400">Temp:</span>
                                            <button onClick={() => incrementValue('pvTemp', -1)} className="text-red-400 hover:text-red-300">
                                                <ChevronDown size={14} />
                                            </button>
                                            <span className="text-sm text-blue-400 w-6 text-center">{character.pvTemp}</span>
                                            <button onClick={() => incrementValue('pvTemp', 1)} className="text-green-400 hover:text-green-300">
                                                <ChevronUp size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        character.pvTemp > 0 && (
                                            <div className="text-sm text-blue-400">+{character.pvTemp} temp</div>
                                        )
                                    )}
                                </div>
                            </div>
                            <div className="h-4 bg-stone-900 rounded-full overflow-hidden border border-stone-700">
                                <div
                                    className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all"
                                    style={{ width: `${Math.min(100, (character.pvActuels / character.pvMax) * 100)}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Jets de sauvegarde contre la mort */}
                        <div className="bg-gradient-to-br from-gray-900/80 to-stone-900/80 rounded-xl p-6 border-2 border-red-900/50 shadow-xl">
                            <h3 className="text-red-400 font-bold text-lg uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Skull size={20} />
                                Jets de Sauvegarde contre la Mort
                            </h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <div className="text-green-400 text-sm font-bold mb-2 uppercase">Succès</div>
                                    <div className="flex gap-2">
                                        {[0, 1, 2].map((index) => (
                                            <button
                                                key={index}
                                                onClick={() => toggleDeathSave('successes', index)}
                                                className={`w-12 h-12 rounded-full border-2 transition-all ${
                                                    index < character.deathSaves.successes
                                                        ? 'bg-green-500 border-green-400 shadow-lg shadow-green-500/50'
                                                        : 'bg-stone-800 border-green-700 hover:border-green-500'
                                                }`}
                                            >
                                                {index < character.deathSaves.successes && <Check className="text-white mx-auto" size={24} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-red-400 text-sm font-bold mb-2 uppercase">Échecs</div>
                                    <div className="flex gap-2">
                                        {[0, 1, 2].map((index) => (
                                            <button
                                                key={index}
                                                onClick={() => toggleDeathSave('failures', index)}
                                                className={`w-12 h-12 rounded-full border-2 transition-all ${
                                                    index < character.deathSaves.failures
                                                        ? 'bg-red-500 border-red-400 shadow-lg shadow-red-500/50'
                                                        : 'bg-stone-800 border-red-700 hover:border-red-500'
                                                }`}
                                            >
                                                {index < character.deathSaves.failures && <X className="text-white mx-auto" size={24} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Jets de sauvegarde */}
                        <div className="bg-gradient-to-br from-orange-900/40 to-stone-900/40 rounded-xl p-6 border-2 border-orange-700/50 shadow-xl">
                            <h3 className="text-orange-400 font-bold text-lg uppercase tracking-wider mb-4">Jets de Sauvegarde</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {Object.keys(character.stats).map((stat) => {
                                    const bonus = getSavingThrowBonus(stat);
                                    const hasProficiency = character.savingThrows[stat];
                                    return (
                                        <div
                                            key={stat}
                                            className={`bg-stone-900/50 rounded-lg p-3 border flex items-center justify-between ${
                                                hasProficiency ? 'border-amber-600' : 'border-stone-700'
                                            } ${editMode ? 'cursor-pointer hover:bg-stone-800/50' : ''}`}
                                            onClick={() => editMode && toggleProficiency('savingThrows', stat)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${hasProficiency ? 'bg-amber-500' : 'bg-transparent border border-gray-600'}`}></div>
                                                <span className="text-gray-300 text-sm">{statNames[stat]}</span>
                                            </div>
                                            <span className="text-white font-bold">{formatModifier(bonus)}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Compétences */}
                        <div className="bg-gradient-to-br from-blue-900/40 to-stone-900/40 rounded-xl p-6 border-2 border-blue-700/50 shadow-xl">
                            <h3 className="text-blue-400 font-bold text-lg uppercase tracking-wider mb-4">Compétences</h3>
                            <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto pr-2">
                                {Object.entries(character.skills).map(([skill, hasProficiency]) => {
                                    const bonus = getSkillBonus(skill);
                                    const statAbbr = getSkillStatAbbr(skill);
                                    return (
                                        <div
                                            key={skill}
                                            className={`bg-stone-900/50 rounded-lg p-2 border flex items-center justify-between ${
                                                hasProficiency ? 'border-amber-600' : 'border-stone-700'
                                            } ${editMode ? 'cursor-pointer hover:bg-stone-800/50' : ''}`}
                                            onClick={() => editMode && toggleProficiency('skills', skill)}
                                        >
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${hasProficiency ? 'bg-amber-500' : 'bg-transparent border border-gray-600'}`}></div>
                                                <span className="text-gray-300 text-sm truncate">{skill}</span>
                                                <span className="text-gray-500 text-xs">({statAbbr})</span>
                                            </div>
                                            <span className="text-white font-bold text-sm flex-shrink-0">{formatModifier(bonus)}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Ressources */}
                        <div className="bg-gradient-to-br from-cyan-900/40 to-stone-900/40 rounded-xl p-6 border-2 border-cyan-700/50 shadow-xl">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-cyan-400 font-bold text-lg uppercase tracking-wider">Ressources</h3>
                                {editMode && (
                                    <button
                                        onClick={addRessource}
                                        className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1 border border-cyan-500/50"
                                    >
                                        <Plus size={16} />
                                        Ajouter
                                    </button>
                                )}
                            </div>
                            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                                {character.ressources && character.ressources.map((ressource) => (
                                    ressource && (
                                    <div key={ressource.id} className="bg-stone-900/50 rounded-lg p-3 border border-stone-700">
                                        <div className="flex items-center justify-between mb-2">
                                            {editMode ? (
                                                <input
                                                    type="text"
                                                    value={ressource.titre}
                                                    onChange={(e) => updateRessource(ressource.id, 'titre', e.target.value)}
                                                    className="flex-1 bg-gray-800/50 border border-gray-600 rounded px-2 py-1 text-cyan-400 font-semibold text-sm outline-none"
                                                />
                                            ) : (
                                                <span className="text-cyan-400 font-semibold text-sm">{ressource.titre}</span>
                                            )}
                                            {editMode && (
                                                <button
                                                    onClick={() => removeRessource(ressource.id)}
                                                    className="ml-2 text-red-400 hover:text-red-300"
                                                >
                                                    <X size={16} />
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="text-xs text-gray-400">
                                                Total: {editMode ? (
                                                <input
                                                    type="text"
                                                    value={ressource.total}
                                                    onChange={(e) => updateRessource(ressource.id, 'total', e.target.value)}
                                                    className="w-16 bg-gray-800/50 border border-gray-600 rounded px-1 text-gray-300 text-xs outline-none inline-block ml-1"
                                                />
                                            ) : (
                                                <span className="text-white font-bold">{ressource.total}</span>
                                            )}
                                            </div>
                                            {editMode ? (
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => updateRessource(ressource.id, 'nb', Math.max(0, ressource.nb - 1))}
                                                        className="text-red-400 hover:text-red-300 p-1"
                                                    >
                                                        <ChevronDown size={16} />
                                                    </button>
                                                    <span className="text-white font-bold text-lg w-8 text-center">{ressource.nb}</span>
                                                    <button
                                                        onClick={() => updateRessource(ressource.id, 'nb', ressource.nb + 1)}
                                                        className="text-green-400 hover:text-green-300 p-1"
                                                    >
                                                        <ChevronUp size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-white font-bold text-lg">{ressource.nb}</span>
                                            )}
                                        </div>
                                    </div>
                                    )
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Colonne droite - Monnaie et autres */}
                    <div className="col-span-3 space-y-4">
                        {/* Monnaie */}
                        <div className="bg-gradient-to-br from-yellow-900/40 to-stone-900/40 rounded-xl p-6 border-2 border-yellow-700/50 shadow-xl">
                            <h3 className="text-yellow-400 font-bold text-lg uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Coins size={20} />
                                Monnaie
                            </h3>
                            <div className="space-y-3">
                                <div className="bg-stone-900/50 rounded-lg p-3 border border-stone-700 flex items-center justify-between">
                                    <span className="text-amber-200 text-sm font-medium">PP (Platine)</span>
                                    {editMode ? (
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => incrementValue('monnaie.pp', -1)} className="text-red-400 hover:text-red-300 p-1">
                                                <ChevronDown size={16} />
                                            </button>
                                            <span className="text-white font-bold text-lg w-12 text-center">{character.monnaie.pp}</span>
                                            <button onClick={() => incrementValue('monnaie.pp', 1)} className="text-green-400 hover:text-green-300 p-1">
                                                <ChevronUp size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-white font-bold text-lg">{character.monnaie.pp}</span>
                                    )}
                                </div>
                                <div className="bg-stone-900/50 rounded-lg p-3 border border-yellow-600 flex items-center justify-between">
                                    <span className="text-yellow-400 text-sm font-medium">PO (Or)</span>
                                    {editMode ? (
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => incrementValue('monnaie.po', -1)} className="text-red-400 hover:text-red-300 p-1">
                                                <ChevronDown size={16} />
                                            </button>
                                            <span className="text-white font-bold text-lg w-12 text-center">{character.monnaie.po}</span>
                                            <button onClick={() => incrementValue('monnaie.po', 1)} className="text-green-400 hover:text-green-300 p-1">
                                                <ChevronUp size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-white font-bold text-lg">{character.monnaie.po}</span>
                                    )}
                                </div>
                                <div className="bg-stone-900/50 rounded-lg p-3 border border-stone-700 flex items-center justify-between">
                                    <span className="text-gray-400 text-sm font-medium">PE (Électrum)</span>
                                    {editMode ? (
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => incrementValue('monnaie.pe', -1)} className="text-red-400 hover:text-red-300 p-1">
                                                <ChevronDown size={16} />
                                            </button>
                                            <span className="text-white font-bold text-lg w-12 text-center">{character.monnaie.pe}</span>
                                            <button onClick={() => incrementValue('monnaie.pe', 1)} className="text-green-400 hover:text-green-300 p-1">
                                                <ChevronUp size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-white font-bold text-lg">{character.monnaie.pe}</span>
                                    )}
                                </div>
                                <div className="bg-stone-900/50 rounded-lg p-3 border border-stone-700 flex items-center justify-between">
                                    <span className="text-gray-300 text-sm font-medium">PA (Argent)</span>
                                    {editMode ? (
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => incrementValue('monnaie.pa', -1)} className="text-red-400 hover:text-red-300 p-1">
                                                <ChevronDown size={16} />
                                            </button>
                                            <span className="text-white font-bold text-lg w-12 text-center">{character.monnaie.pa}</span>
                                            <button onClick={() => incrementValue('monnaie.pa', 1)} className="text-green-400 hover:text-green-300 p-1">
                                                <ChevronUp size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-white font-bold text-lg">{character.monnaie.pa}</span>
                                    )}
                                </div>
                                <div className="bg-stone-900/50 rounded-lg p-3 border border-orange-800 flex items-center justify-between">
                                    <span className="text-orange-700 text-sm font-medium">PC (Cuivre)</span>
                                    {editMode ? (
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => incrementValue('monnaie.pc', -1)} className="text-red-400 hover:text-red-300 p-1">
                                                <ChevronDown size={16} />
                                            </button>
                                            <span className="text-white font-bold text-lg w-12 text-center">{character.monnaie.pc}</span>
                                            <button onClick={() => incrementValue('monnaie.pc', 1)} className="text-green-400 hover:text-green-300 p-1">
                                                <ChevronUp size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-white font-bold text-lg">{character.monnaie.pc}</span>
                                    )}
                                </div>
                            </div>

                            {/* Valeur totale en or */}
                            <div className="mt-4 pt-4 border-t border-stone-700">
                                <div className="text-center">
                                    <div className="text-gray-400 text-xs uppercase mb-1">Valeur totale</div>
                                    <div className="text-yellow-400 font-bold text-xl">
                                        {(
                                            (character.monnaie.pp || 0) * 10 +
                                            (character.monnaie.po || 0) +
                                            (character.monnaie.pe || 0) * 0.5 +
                                            (character.monnaie.pa || 0) * 0.1 +
                                            (character.monnaie.pc || 0) * 0.01
                                        ).toFixed(2)} PO
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Maîtrises d'outils & Compétences personnalisées */}
                        <div className="bg-gradient-to-br from-purple-900/40 to-stone-900/40 rounded-xl p-6 border-2 border-purple-700/50 shadow-xl">
                            <h3 className="text-purple-400 font-bold text-lg uppercase tracking-wider mb-4">Maîtrises d'outils & Compétences personnalisées</h3>
                            <div className="space-y-3 text-sm text-gray-300">
                                <div className="bg-stone-900/50 rounded-lg p-3 border border-stone-700">
                                    {editMode ? (
                                        <textarea
                                            value={character.notes.outils}
                                            onChange={(e) => updateCharacter('notes.outils', e.target.value)}
                                            className="w-full bg-gray-800/50 border border-gray-600 rounded px-2 py-1 text-gray-300 text-sm outline-none resize-none"
                                            rows={4}
                                            placeholder="Ex: Outils de voleur, Luth, Jeu de cartes..."
                                        />
                                    ) : (
                                        <div className="whitespace-pre-wrap">{character.notes.outils || "Aucune"}</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Autres maîtrises et langues */}
                        <div className="bg-gradient-to-br from-purple-900/40 to-stone-900/40 rounded-xl p-6 border-2 border-purple-700/50 shadow-xl">
                            <h3 className="text-purple-400 font-bold text-lg uppercase tracking-wider mb-4">Autres maîtrises et langues</h3>
                            <div className="space-y-3 text-sm text-gray-300">
                                <div className="bg-stone-900/50 rounded-lg p-3 border border-stone-700">
                                    {editMode ? (
                                        <textarea
                                            value={character.notes.autres}
                                            onChange={(e) => updateCharacter('notes.autres', e.target.value)}
                                            className="w-full bg-gray-800/50 border border-gray-600 rounded px-2 py-1 text-gray-300 text-sm outline-none resize-none"
                                            rows={4}
                                            placeholder="Ex: Commun, Elfique, Armures légères..."
                                        />
                                    ) : (
                                        <div className="whitespace-pre-wrap">{character.notes.autres || "Aucune"}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DnDPage;