// Règle de mise en page : uniquement des tailles "normal" (1 colonne) et
// "wide" (2 colonnes). Jamais de "tall" (span sur 2 lignes) — c'est ce qui
// causait des tuiles qui dépassaient et créaient des vides. Avec seulement
// des variations en largeur, chaque ligne de la grille a toujours la même
// hauteur : l'alignement haut/bas est garanti quel que soit le nombre
// d'images affichées.
//
// Le motif alterné (wide, normal, wide, normal...) donne 8 "wide" + 8
// "normal" sur les 16 items = 24 unités de colonne, un nombre divisible par
// 2, 4 et 6 : la grille se remplit toujours en rectangle parfait, à toutes
// les tailles d'écran (aperçu comme page complète).

export const GALLERY_ITEMS = [
  { label: 'Cérémonie laïque', variant: 'a', size: 'wide', type: 'photo', src: '/images/gallery/ceremonie.webp' },
  { label: 'Échange des vœux', variant: 'b', size: 'normal', type: 'photo', src: '/images/gallery/echange-voeux.webp' },
  { label: 'Détails de table', variant: 'c', size: 'wide', type: 'photo', src: '/images/gallery/details-table.webp' },
  { label: 'Bouquet & fleurs', variant: 'd', size: 'normal', type: 'photo', src: '/images/gallery/bouquet.webp' },
  { label: 'Robe & préparatifs', variant: 'e', size: 'wide', type: 'photo', src: '/images/gallery/robe-preparatifs.webp' },
  { label: 'Cortège', variant: 'f', size: 'normal', type: 'photo', src: '/images/gallery/cortege.webp' },
  { label: 'Réception', variant: 'g', size: 'wide', type: 'photo', src: '/images/gallery/reception.webp' },
  { label: 'Discours des témoins', variant: 'h', size: 'normal', type: 'photo', src: '/images/gallery/discours-temoins.webp' },
  { label: 'Première danse', variant: 'a', size: 'wide', type: 'photo', src: '/images/gallery/premiere-danse.webp' },
  { label: 'Lumières du soir', variant: 'b', size: 'normal', type: 'photo', src: '/images/gallery/lumieres-soir.webp' },
  { label: 'Scénographie', variant: 'c', size: 'wide', type: 'photo', src: '/images/gallery/scenographie.webp' },
  { label: 'Pièce montée', variant: 'd', size: 'normal', type: 'photo', src: '/images/gallery/piece-montee.webp' },
  { label: 'Cadeaux & mot doux', variant: 'e', size: 'wide', type: 'photo', src: '/images/gallery/cadeaux-mot-doux.webp' },
  { label: 'Dernier verre', variant: 'f', size: 'normal', type: 'photo', src: '/images/gallery/dernier-verre.webp' },
  { label: 'Alliances', variant: 'g', size: 'wide', type: 'photo', src: '/images/gallery/alliances.webp' },
  { label: 'Feu d’artifice', variant: 'h', size: 'normal', type: 'photo', src: '/images/gallery/feu-artifice.webp' },
]