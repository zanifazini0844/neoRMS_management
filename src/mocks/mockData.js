export const MOCK_MENU = [
  {
    id: 1,
    name: 'Margherita Pizza',
    price: 12.5,
    category: 'Pizza',
    ingredients: [
      { name: 'Tomato', amount: '80g' },
      { name: 'Mozzarella', amount: '100g' },
      { name: 'Basil', amount: '5 leaves' },
    ],
    imageUrl:
      'https://images.pexels.com/photos/4109130/pexels-photo-4109130.jpeg?auto=compress&cs=tinysrgb&w=600',
    available: true,
    discount: 10,
  },
  {
    id: 2,
    name: 'Caesar Salad',
    price: 9.0,
    category: 'Salad',
    ingredients: [
      { name: 'Lettuce', amount: '120g' },
      { name: 'Croutons', amount: '40g' },
      { name: 'Parmesan', amount: '30g' },
    ],
    imageUrl:
      'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600',
    available: true,
    discount: 0,
  },
  {
    id: 3,
    name: 'Tiramisu',
    price: 7.5,
    category: 'Dessert',
    ingredients: [
      { name: 'Mascarpone', amount: '80g' },
      { name: 'Coffee', amount: '30ml' },
      { name: 'Cocoa', amount: '10g' },
    ],
    imageUrl:
      'https://images.pexels.com/photos/4109993/pexels-photo-4109993.jpeg?auto=compress&cs=tinysrgb&w=600',
    available: false,
    discount: 0,
  },
];

export const MOCK_STAFF = [
  {
    id: 1,
    name: 'Alice Johnson',
    phone: '+1 555-1234',
    email: 'alice@example.com',
    role: 'Manager',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Brian Smith',
    phone: '+1 555-5678',
    email: 'brian@example.com',
    role: 'Chef',
    status: 'Active',
  },
  {
    id: 3,
    name: 'Carla Gomez',
    phone: '+1 555-9012',
    email: 'carla@example.com',
    role: 'Waiter',
    status: 'Inactive',
  },
];

