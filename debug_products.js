import axios from 'axios';

async function checkProducts() {
    try {
        const response = await axios.get('http://localhost:30011/api/products');
        const products = response.data.products;
        console.log(`Total Products Fetched: ${products.length}`);

        const categories = {};
        products.forEach(p => {
            const cat = p.category || 'Uncategorized';
            categories[cat] = (categories[cat] || 0) + 1;
        });

        console.log('Product Counts by Category:', categories);
    } catch (error) {
        console.error('Error fetching products:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

checkProducts();
