export interface CatalogCategory {
  id: string;
  label: string;
  description: string;
  icon: string;
  subcategories?: string[];
}

export const catalog: CatalogCategory[] = [
  {
    id: 'moving-delivery',
    label: 'Moving & Delivery',
    description: 'Helpers with cars or vans for moving, pickups, and drop-offs.',
    icon: '🚚',
    subcategories: ['Small move', 'Furniture pickup', 'Store delivery'],
  },
  {
    id: 'remove-recycle',
    label: 'Remove & Recycle',
    description: 'Junk removal, recycling center runs, and cleanouts.',
    icon: '♻️',
    subcategories: ['Electronics', 'Bulk waste', 'Donation runs'],
  },
  {
    id: 'buy-for-me',
    label: 'Buy for Me',
    description: 'Errands, shopping, and click-and-collect help.',
    icon: '🛍️',
    subcategories: ['Groceries', 'Store pickup', 'Essentials run'],
  },
  {
    id: 'assembly',
    label: 'Assembly',
    description: 'Flat-pack and furniture assembly with tools.',
    icon: '🧰',
    subcategories: ['Furniture', 'Shelves', 'Beds'],
  },
  {
    id: 'mounting',
    label: 'Mounting & Installation',
    description: 'TVs, shelves, curtain rods, and fixtures.',
    icon: '🪛',
    subcategories: ['TV mounting', 'Curtains', 'Wall shelves'],
  },
  {
    id: 'cleaning',
    label: 'Cleaning',
    description: 'Home, office, and end-of-lease cleaning.',
    icon: '🧼',
    subcategories: ['Home clean', 'Office clean', 'Deep clean'],
  },
  {
    id: 'yard',
    label: 'Yardwork/Outdoor',
    description: 'Garden help, leaves, snow, and outdoor tidy.',
    icon: '🌿',
    subcategories: ['Mowing', 'Leaf clear', 'Snow'],
  },
  {
    id: 'repairs',
    label: 'Home Repairs',
    description: 'Minor fixes, patching, and quick handyman tasks.',
    icon: '🔧',
    subcategories: ['Minor repairs', 'Door fixes', 'Patch & paint'],
  },
  {
    id: 'painting',
    label: 'Painting',
    description: 'Touch-ups and small room painting jobs.',
    icon: '🎨',
    subcategories: ['Touch-up', 'Single room', 'Trim'],
  },
];
