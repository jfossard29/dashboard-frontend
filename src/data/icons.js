// Chargement dynamique des icônes SVG depuis le dossier assets
const iconsModules = import.meta.glob('../assets/icon/*.svg', { eager: true, import: 'default' });

/**
 * Récupère l'URL d'une icône à partir de son nom de fichier (ex: "Arm-1.svg")
 * Si le nom ne correspond pas à une icône locale, retourne le nom tel quel (pour les emojis ou URLs externes)
 */
export const getIconUrl = (iconName) => {
    if (!iconName) return null;
    
    // Si c'est déjà une URL ou un chemin absolu/relatif explicite, on le garde
    if (iconName.startsWith('http') || iconName.startsWith('/') || iconName.startsWith('data:')) {
        return iconName;
    }

    // On essaie de trouver l'icône dans nos assets
    const key = `../assets/icon/${iconName}`;
    if (iconsModules[key]) {
        return iconsModules[key];
    }

    // Sinon c'est probablement un emoji ou une icône Lucide
    return iconName;
};

/**
 * Retourne la liste des icônes d'armure disponibles (nom de fichier et URL)
 * Triées par nom
 */
export const getArmorIcons = () => {
    return Object.keys(iconsModules)
        .map(path => {
            const name = path.split('/').pop();
            return {
                id: path, // Clé unique pour React
                name: name, // Nom de fichier à stocker (ex: "Arm-1.svg")
                url: iconsModules[path] // URL résolue pour l'affichage
            };
        })
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
};