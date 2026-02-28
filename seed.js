require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/Product');
const AppConfig = require('./src/models/AppConfig');

const PRODUCTS = [
  {
    name: 'Pancho Clasico',
    description: 'Salchicha en pan brioche con mostaza y ketchup.',
    basePrice: 1500,
    imageUrl: null,
    tags: ['clasico'],
    available: true,
    order: 1,
    optionGroups: [
      {
        name: 'Salsas',
        type: 'toggle',
        required: false,
        items: [
          { name: 'Mostaza', price: 0, available: true },
          { name: 'Ketchup', price: 0, available: true },
          { name: 'Mayonesa', price: 0, available: true },
          { name: 'Salsa BBQ', price: 100, available: true },
          { name: 'Chimichurri', price: 100, available: true },
        ],
      },
      {
        name: 'Tipo de pan',
        type: 'single',
        required: true,
        items: [
          { name: 'Pan comun', price: 0, available: true },
          { name: 'Pan brioche', price: 200, available: true },
          { name: 'Pan integral', price: 200, available: true },
        ],
      },
      {
        name: 'Extras',
        type: 'counter',
        required: false,
        items: [
          { name: 'Queso cheddar', price: 300, available: true },
          { name: 'Panceta crocante', price: 400, available: true },
          { name: 'Cebolla caramelizada', price: 250, available: true },
          { name: 'Pepinillos', price: 150, available: true },
        ],
      },
      {
        name: 'Acompañamientos',
        type: 'multi',
        required: false,
        items: [
          { name: 'Papas fritas chicas', price: 800, available: true },
          { name: 'Papas fritas grandes', price: 1200, available: true },
          { name: 'Ensalada de col', price: 600, available: true },
        ],
      },
    ],
  },
  {
    name: 'Pancho Doble',
    description: 'Doble salchicha con todos los extras disponibles.',
    basePrice: 2500,
    imageUrl: null,
    tags: ['doble', 'especial'],
    available: true,
    order: 2,
    optionGroups: [
      {
        name: 'Salsas',
        type: 'toggle',
        required: false,
        items: [
          { name: 'Mostaza', price: 0, available: true },
          { name: 'Ketchup', price: 0, available: true },
          { name: 'Mayonesa', price: 0, available: true },
          { name: 'Salsa BBQ', price: 100, available: true },
        ],
      },
      {
        name: 'Tipo de pan',
        type: 'single',
        required: true,
        items: [
          { name: 'Pan comun', price: 0, available: true },
          { name: 'Pan brioche', price: 200, available: true },
        ],
      },
    ],
  },
  {
    name: 'Combo Pancho + Bebida',
    description: 'Pancho clasico con gaseosa 500ml a eleccion.',
    basePrice: 2800,
    imageUrl: null,
    tags: ['combo'],
    available: true,
    order: 3,
    optionGroups: [
      {
        name: 'Bebida',
        type: 'single',
        required: true,
        items: [
          { name: 'Coca-Cola', price: 0, available: true },
          { name: 'Sprite', price: 0, available: true },
          { name: 'Fanta', price: 0, available: true },
          { name: 'Agua mineral', price: 0, available: true },
        ],
      },
      {
        name: 'Salsas',
        type: 'toggle',
        required: false,
        items: [
          { name: 'Mostaza', price: 0, available: true },
          { name: 'Ketchup', price: 0, available: true },
          { name: 'Mayonesa', price: 0, available: true },
        ],
      },
    ],
  },
];

const CONFIGS = [
  { key: 'deliveryCost', value: 1000, label: 'Costo de delivery (ARS)' },
  { key: 'storeName', value: 'Panchos', label: 'Nombre del local' },
];

async function seed() {
  try {
    // Conectamos y forzamos la DB a tiendapedidos_db (evita confusiones con el nombre en la URI)
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'tienda',
      // las siguientes opciones no son obligatorias en versiones recientes de mongoose,
      // pero no hacen daño si querés mantener compatibilidad
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    console.log('Conectado a MongoDB');
    console.log('DB conectada:', mongoose.connection.name);

    // Limpiamos colecciones
    await Product.deleteMany({});
    await AppConfig.deleteMany({});

    // Insertamos datos
    await Product.insertMany(PRODUCTS);
    await AppConfig.insertMany(CONFIGS);

    console.log('Datos de prueba insertados correctamente.');
  } catch (err) {
    console.error('Error en seed:', err);
    process.exitCode = 1;
  } finally {
    // Aseguramos desconexión
    try {
      await mongoose.disconnect();
      console.log('Desconectado de MongoDB');
    } catch (e) {
      console.error('Error al desconectar:', e);
    }
    // No es estrictamente necesario llamar a process.exit() aquí;
    // si querés forzar salida usa: process.exit(process.exitCode || 0);
  }
}

seed();