import mysql from 'mysql2/promise';
import fs from 'fs';

const productsData = JSON.parse(fs.readFileSync('./real_products_data.json', 'utf-8'));

const pool = mysql.createPool({
  host: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'localhost',
  user: process.env.DATABASE_URL?.split('://')[1]?.split(':')[0] || 'root',
  password: process.env.DATABASE_URL?.split(':')[2]?.split('@')[0] || '',
  database: process.env.DATABASE_URL?.split('/')[3]?.split('?')[0] || 'mwanga_grid',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function seedProducts() {
  const connection = await pool.getConnection();
  try {
    // Clear existing products
    await connection.query('DELETE FROM products');
    
    const allProducts = [
      ...productsData.solarEquipment,
      ...productsData.cctvEquipment,
      ...productsData.internetEquipment
    ];

    for (const product of allProducts) {
      await connection.query(
        'INSERT INTO products (id, name, description, price, category, image) VALUES (?, ?, ?, ?, ?, ?)',
        [product.id, product.name, product.description, product.price, product.category, product.image]
      );
    }

    console.log(`✅ Seeded ${allProducts.length} real products successfully!`);
  } catch (error) {
    console.error('Error seeding products:', error);
  } finally {
    await connection.release();
    await pool.end();
  }
}

seedProducts();
