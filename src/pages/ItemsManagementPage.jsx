import React, { useState, useEffect } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import '../Scrollbar.css';
import Popup from '../components/Popup.jsx';
import ItemEditorModal from '../components/ItemEditorModal.jsx';
import ItemCard from '../components/ItemCard.jsx';
import ItemSearchBar from '../components/ItemSearchBar.jsx';
import ItemFilters from '../components/ItemFilters.jsx';
import ItemSorter from '../components/ItemSorter.jsx';

/**
 * ItemsManagementPage.jsx
 * - Gère l'état global (fetch, CRUD, filtres, tri, recherche)
 * - Utilise les composants séparés : ItemCard, ItemSearchBar, ItemFilters, ItemSorter, ItemEditorModal, Popup
 */

const ItemsManagementPage = ({ serverId }) => {
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

  const itemTypes = ['EQUIPEMENT', 'CONSOMMABLE', 'AUTRE'];
  const rarities = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY'];
  const sortOptions = [
    { value: 'nom', label: 'Nom' },
    { value: 'type', label: 'Type' },
    { value: 'rarete', label: 'Rareté' }
  ];

  useEffect(() => {
    if (serverId) fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverId]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const response = await fetch(`${apiUrl}/objet/liste/${serverId}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        setItems(data.body || data);
      } else {
        showPopup('Erreur lors du chargement des objets', 'error');
      }
    } catch (error) {
      console.error('Erreur lors du fetch des items:', error);
      showPopup('Erreur de connexion au serveur', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showPopup = (message, type) => setPopup({ message, type });
  const closePopup = () => setPopup({ message: '', type: '' });

  const getRarityOrder = (rarity) => {
    const order = { COMMON: 1, UNCOMMON: 2, RARE: 3, EPIC: 4, LEGENDARY: 5 };
    return order[rarity] || 0;
  };

  const toggleFilter = (type) => setFilters(prev => ({ ...prev, [type]: !prev[type] }));

  const filteredAndSortedItems = items
      .filter(item =>
          filters[item.type] &&
          (item.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.type?.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      .sort((a, b) => {
        switch (sortBy) {
          case 'nom': return a.nom.localeCompare(b.nom);
          case 'type': return a.type.localeCompare(b.type);
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
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      let payload, url, method;

      if (isNewItem) {
        payload = {
          nom: editedItem.nom,
          description: editedItem.description,
          type: editedItem.type,
          rarete: editedItem.rarete,
          icone: editedItem.icone,
          statistique: editedItem.statistique || {},
          idServeur: serverId
        };
        url = `${apiUrl}/objet`;
        method = 'POST';
      } else {
        const changes = getChangedFields();
        if (!changes) {
          // rien à faire
          setEditMode(false);
          setSelectedItem(null);
          setEditedItem(null);
          return;
        }
        payload = changes;
        url = `${apiUrl}/objet/${editedItem.id}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        await fetchItems();
        setSelectedItem(null);
        setOriginalItem(null);
        setEditMode(false);
        setEditedItem(null);
        showPopup(`Objet "${editedItem.nom}" ${isNewItem ? 'créé' : 'modifié'} avec succès !`, 'success');
      } else {
        const errorData = await response.json().catch(() => null);
        showPopup(errorData?.message || 'Erreur lors de la sauvegarde', 'error');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      showPopup('Erreur de connexion au serveur', 'error');
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
      statistique: {},
      icone: '⚔️',
      idServeur: serverId
    };
    openEditorFor(newItem);
    showPopup('Nouvel objet créé, vous pouvez maintenant le modifier', 'info');
  };

  const deleteItem = async (itemId) => {
    const itemToDelete = items.find(i => i.id === itemId);
    if (!itemToDelete) return;
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer "${itemToDelete.nom}" ?`)) return;
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const response = await fetch(`${apiUrl}/objet/${itemId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) {
        await fetchItems();
        setSelectedItem(null);
        setEditMode(false);
        setEditedItem(null);
        showPopup(`Objet "${itemToDelete.nom}" supprimé avec succès`, 'success');
      } else {
        showPopup('Erreur lors de la suppression', 'error');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      showPopup('Erreur de connexion au serveur', 'error');
    }
  };

  // modifications de champs/statistiques utilisées par ItemEditorModal
  const updateField = (field, value) => setEditedItem(prev => ({ ...prev, [field]: value }));

  const addStat = () => setEditedItem(prev => ({ ...prev, statistique: { ...(prev?.statistique || {}), 'Nouvelle stat': 'Valeur' } }));

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
        <div className="flex-shrink-0 p-6 pb-0">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 mb-2">
                Gestion des Objets
              </h1>
              <p className="text-gray-400">Gérez votre inventaire et créez de nouveaux objets</p>
            </div>

            <button
                onClick={addNewItem}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl transition-all duration-200 flex items-center space-x-2 shadow-lg transform hover:scale-105"
            >
              <Plus size={20} />
              <span>Nouvel Objet</span>
            </button>
          </div>

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
      </>
  );
};

export default ItemsManagementPage;
