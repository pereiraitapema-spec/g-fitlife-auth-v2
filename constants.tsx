
import { Product, Category } from './types';

// Adicionando as propriedades obrigatórias departmentId e status para satisfazer a interface Category
export const CATEGORIES: Category[] = [
  { 
    id: '1', 
    name: 'Suplementos', 
    slug: 'supplements', 
    icon: '💊', 
    description: 'Whey Protein, Creatina e Vitaminas de alta pureza.',
    departmentId: 'dept-1',
    status: 'active'
  },
  { 
    id: '2', 
    name: 'Equipamentos', 
    slug: 'equipment', 
    icon: '🏋️', 
    description: 'Tudo para o seu home-gym profissional.',
    departmentId: 'dept-1',
    status: 'active'
  },
  { 
    id: '3', 
    name: 'Vestuário', 
    slug: 'apparel', 
    icon: '👕', 
    description: 'Performance e estilo para seus treinos.',
    departmentId: 'dept-1',
    status: 'active'
  },
  { 
    id: '4', 
    name: 'Planos Digitais', 
    slug: 'digital', 
    icon: '📱', 
    description: 'Treinos e dietas personalizados por IA.',
    departmentId: 'dept-2',
    status: 'active'
  },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Whey Isolate Gold 2kg',
    brand: 'G-Labs',
    price: 249.90,
    originalPrice: 299.90,
    category: 'supplements',
    image: 'https://picsum.photos/seed/whey/400/400',
    rating: 4.8,
    reviews: 1250,
    tags: ['Best Seller', 'Pura Proteína'],
    description: 'O mais puro isolado do mercado para recuperação muscular rápida.'
  },
  {
    id: 'p2',
    name: 'Creatina Monohidratada 300g',
    brand: 'G-Labs',
    price: 89.90,
    category: 'supplements',
    image: 'https://picsum.photos/seed/creatina/400/400',
    rating: 4.9,
    reviews: 2400,
    tags: ['Performance'],
    description: 'Aumento de força e explosão validado cientificamente.'
  },
  {
    id: 'p3',
    name: 'Halter Ajustável Pro 24kg',
    brand: 'FitIron',
    price: 1299.00,
    originalPrice: 1599.00,
    category: 'equipment',
    image: 'https://picsum.photos/seed/dumbbell/400/400',
    rating: 4.7,
    reviews: 320,
    tags: ['Home Gym'],
    description: 'Praticidade de 15 halteres em um só.'
  },
  {
    id: 'p4',
    name: 'Smart Mat Premium',
    brand: 'FitFlow',
    price: 189.90,
    category: 'equipment',
    image: 'https://picsum.photos/seed/yoga/400/400',
    rating: 4.6,
    reviews: 85,
    tags: ['Eco-friendly'],
    description: 'Tapete de alta densidade com guias de alinhamento.'
  }
];
