import React, { useState, useEffect, useCallback } from 'react';
import {Plus, Loader2, ArrowLeft} from 'lucide-react';
import '../Scrollbar.css';
import Popup from '../components/Popup.jsx';
import ItemEditorModal from '../components/ItemEditorModal.jsx';
import ItemCard from '../components/ItemCard.jsx';
import ItemSearchBar from '../components/ItemSearchBar.jsx';
import ItemFilters from '../components/ItemFilters.jsx';
import ItemSorter from '../components/ItemSorter.jsx';
import PageHeader from "../components/PageHeader.jsx";
import itemService from "../services/objetService.js";
import { createPortal } from 'react-dom';
import AlertConfirmation from '../components/AlertConfirmation.jsx';

/**
 * ItemsManagementPage.jsx
 * - Gère l'état global (fetch, CRUD, filtres, tri, recherche)
 * - Utilise les composants séparés : ItemCard, ItemSearchBar, ItemFilters, ItemSorter, ItemEditorModal, Popup
 */

const ItemsManagementPage = ({ serverId, onBack }) => {
  // États
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [originalItem, setOriginalItem] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedItem, setEditedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [popup, setPopup] = useState({ message: '', type: '' });
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState({
    EQUIPEMENT: true,
    CONSOMMABLE: true,
    AUTRE: true
  });
  const [sortBy, setSortBy] = useState('nom');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const itemTypes = ['EQUIPEMENT', 'CONSOMMABLE', 'AUTRE'];
  const rarities = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY'];
  const sortOptions = [
    { value: 'nom', label: 'Nom' },
    { value: 'type', label: 'Type' },
    { value: 'rarete', label: 'Rareté' }
  ];

  const showPopup = useCallback((message, type) => setPopup({ message, type }), []);
  const closePopup = () => setPopup({ message: '', type: '' });

  const fetchItems = useCallback(async (silent = false) => {
    try {
      const data = await itemService.getObjets(serverId);
      setItems(data.body || data || []);
      setLoading(false);
    } catch (error) {
      if (!silent) {
        showPopup('Erreur lors du chargement : '+error, 'error');
      }
    }
  }, [serverId, showPopup]);

  useEffect(() => {
    if (serverId) {
      fetchItems();
    }
  }, [serverId, fetchItems]);

  const getRarityOrder = (rarity) => {
    const order = { COMMON: 1, UNCOMMON: 2, RARE: 3, EPIC: 4, LEGENDARY: 5 };
    return order[rarity] || 0;
  };

  const toggleFilter = (type) => setFilters(prev => ({ ...prev, [type]: !prev[type] }));

  const filteredAndSortedItems = (items || [])
      .filter(item =>
          item &&
          filters[item.type] &&
          (item.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.type?.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      .sort((a, b) => {
        switch (sortBy) {
          case 'nom': return (a.nom || "").localeCompare(b.nom || "");
          case 'type': return (a.type || "").localeCompare(b.type || "");
          case 'rarete': return getRarityOrder(b.rarete) - getRarityOrder(a.rarete);
          default: return 0;
        }
      });

  // --- Edition / CRUD handlers ---

  const openEditorFor = (item) => {
    setSelectedItem(item);
    setEditedItem({ ...item });
    setOriginalItem(item ? JSON.parse(JSON.stringify(item)) : null);
    setEditMode(true);
  };

  const startEdit = (item) => openEditorFor(item);

  const cancelEdit = () => {
    setEditMode(false);
    setEditedItem(null);
    setOriginalItem(null);
    setSelectedItem(null);
    showPopup('Modifications annulées', 'info');
  };

  const getChangedFields = () => {
    if (!originalItem) return null;
    const changes = {};
    if (editedItem.nom !== originalItem.nom) changes.nom = editedItem.nom;
    if (editedItem.description !== originalItem.description) changes.description = editedItem.description;
    if (editedItem.type !== originalItem.type) changes.type = editedItem.type;
    if (editedItem.rarete !== originalItem.rarete) changes.rarete = editedItem.rarete;
    if (editedItem.icone !== originalItem.icone) changes.icone = editedItem.icone;
    if (editedItem.partie !== originalItem.partie) changes.partie = editedItem.partie;
    const originalStats = JSON.stringify(originalItem.statistique || {});
    const editedStats = JSON.stringify(editedItem.statistique || {});
    if (originalStats !== editedStats) changes.statistique = editedItem.statistique || {};
    return Object.keys(changes).length > 0 ? changes : null;
  };

  const saveItem = async () => {
    if (!editedItem) return;
    const isNewItem = !editedItem.id;
    try {
      setSaving(true);
      
      if (isNewItem) {
        const payload = {
          nom: editedItem.nom,
          description: editedItem.description,
          type: editedItem.type,
          rarete: editedItem.rarete,
          icone: editedItem.icone,
          partie: editedItem.partie,
          statistique: editedItem.statistique || {},
          idServeur: serverId
        };
        await itemService.createObjet(payload);
        showPopup(`Objet "${editedItem.nom}" créé avec succès !`, 'success');
      } else {
        const changes = getChangedFields();
        if (!changes) {
          // rien à faire
          setEditMode(false);
          setSelectedItem(null);
          setEditedItem(null);
          return;
        }
        await itemService.updateObjet(editedItem.id, changes);
        showPopup(`Objet "${editedItem.nom}" modifié avec succès !`, 'success');
      }

      await fetchItems();
      setSelectedItem(null);
      setOriginalItem(null);
      setEditMode(false);
      setEditedItem(null);
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      showPopup('Erreur lors de la sauvegarde : ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const addNewItem = () => {
    const newItem = {
      nom: 'Nouvel Objet',
      description: "Description de l'objet",
      type: 'EQUIPEMENT',
      rarete: 'COMMON',
      partie: 'tete',
      statistique: {},
      icone: '⚔️',
      idServeur: serverId
    };
    openEditorFor(newItem);
    showPopup('Nouvel objet créé, vous pouvez maintenant le modifier', 'info');
  };

  const confirmDeleteItem = (itemId) => {
      const item = items.find(i => i.id === itemId);
      if (item) {
          setItemToDelete(item);
          setShowDeleteConfirm(true);
      }
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    
    try {
      await itemService.deleteObjet(itemToDelete.id);
      await fetchItems();
      setSelectedItem(null);
      setEditMode(false);
      setEditedItem(null);
      setShowDeleteConfirm(false);
      setItemToDelete(null);
      showPopup(`Objet "${itemToDelete.nom}" supprimé avec succès`, 'success');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      showPopup('Erreur lors de la suppression', 'error');
    }
  };

  // modifications de champs/statistiques utilisées par ItemEditorModal
  const updateField = (field, value) => setEditedItem(prev => ({ ...prev, [field]: value }));

  const addStat = () => {
    setEditedItem(prev => {
      const stats = prev?.statistique || {};
      let newKey = 'Nouvelle stat';
      let i = 1;
      while (Object.prototype.hasOwnProperty.call(stats, newKey)) {
        newKey = `Nouvelle stat ${i}`;
        i++;
      }
      return { ...prev, statistique: { ...stats, [newKey]: 'Valeur' } };
    });
  };

  const updateStat = (oldKey, newKey, value) => {
    const newStats = { ...(editedItem.statistique || {}) };
    if (oldKey !== newKey) delete newStats[oldKey];
    newStats[newKey] = value;
    setEditedItem(prev => ({ ...prev, statistique: newStats }));
  };

  const removeStat = (key) => {
    const newStats = { ...(editedItem.statistique || {}) };
    delete newStats[key];
    setEditedItem(prev => ({ ...prev, statistique: newStats }));
  };

  // --- Render ---

  if (loading) {
    return (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-16 h-16 text-orange-500 animate-spin" />
        </div>
    );
  }

  return (
      <>
        <div className="flex justify-between items-center mt-2">
          <button
              onClick={onBack}
              className="flex items-center space-x-2 text-orange-400 hover:text-orange-300"
          >
            <ArrowLeft size={20} />
            <span>Retour</span>
          </button>
        </div>
        <div className="flex-shrink-0 p-6 pb-0">
          <PageHeader
              currentPage="Objet"
              onButtonClick={addNewItem}
              loading={saving}
          />

          <ItemSearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
          <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-gray-800/30 p-4 rounded-xl border border-gray-700/50">
            <ItemFilters filters={filters} toggleFilter={toggleFilter} itemTypes={itemTypes} />
            <ItemSorter sortBy={sortBy} setSortBy={setSortBy} sortOptions={sortOptions} />
          </div>

          <div className="mb-4">
            <p className="text-gray-400 text-sm">
              {filteredAndSortedItems.length} objet(s) trouvé(s)
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 py-2">
            {filteredAndSortedItems.map(item => (
                <div key={item.id ?? `${item.nom}-${Math.random()}`}>
                  <ItemCard item={item} onSelect={startEdit} onClick={() => startEdit(item)} />
                </div>
            ))}
          </div>
        </div>

        {/* Modal d'édition */}
        {editMode && editedItem && (
            <ItemEditorModal
                item={editedItem}
                onCancel={cancelEdit}
                onSave={saveItem}
                onDelete={() => confirmDeleteItem(editedItem.id)} // Utilisation de confirmDeleteItem
                updateField={updateField}
                addStat={addStat}
                updateStat={updateStat}
                removeStat={removeStat}
                saving={saving}
                itemTypes={itemTypes}
                rarities={rarities}
            />
        )}

        <Popup message={popup.message} type={popup.type} onClose={closePopup} />

        {createPortal(
            <AlertConfirmation
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDeleteItem}
                title="Supprimer l'objet"
                message={`Êtes-vous sûr de vouloir supprimer "${itemToDelete?.nom}" ? Cette action est irréversible.`}
                type="danger"
            />,
            document.body
        )}
      </>
  );
};

export default ItemsManagementPage;