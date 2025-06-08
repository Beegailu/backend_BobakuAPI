const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');


const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors()); // Mengizinkan request dari semua origin
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// --- Penyimpanan Data (Dalam Memori) ---
let menus = [
    {
        id: "1",
        name: "Brown Sugar Boba Milk",
        basePrice: 25000,
        description: "Susu segar, gula aren premium, boba kenyal.",
        category: "Milk Tea",
        sweetnessLevel: 100,
        iceLevel: 100,
        imageUrl: "https://images.unsplash.com/photo-1573515200028-09195803104e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YnJvd24lMjBzdWdhciUyMGJvYmF8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
        isAvailable: true,
        popularity: 10
    },
    {
        id: "2",
        name: "Matcha Boba Latte",
        basePrice: 28000,
        description: "Matcha premium, susu creamy, boba.",
        category: "Coffee",
        sweetnessLevel: 75,
        iceLevel: 100,
        imageUrl: "https://images.unsplash.com/photo-1585340048809-20599449f0f7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fG1hdGNoYSUyMGJvYmF8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
        isAvailable: true,
        popularity: 8
    },
    {
        id: "3",
        name: "Strawberry Bliss Tea",
        basePrice: 26000,
        description: "Teh buah strawberry segar dengan popping boba.",
        category: "Fruit Tea",
        sweetnessLevel: 100,
        iceLevel: 75,
        imageUrl: "https://images.unsplash.com/photo-1553529713-6a19349ea049?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8c3RyYXdiZXJyeSUyMGJvYmF8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
        isAvailable: false,
        popularity: 5
    }
];

let toppings = [
    {
        id: "t1",
        name: "Boba Pearls",
        additionalPrice: 3000,
        description: "Boba kenyal klasik.",
        isAvailable: true
    },
    {
        id: "t2",
        name: "Coffee Jelly",
        additionalPrice: 4000,
        description: "Jelly rasa kopi.",
        isAvailable: true
    },
    {
        id: "t3",
        name: "Cheese Foam",
        additionalPrice: 5000,
        description: "Foam keju gurih manis.",
        isAvailable: false
    }
];

// --- Routes untuk MENU ---

// GET /menu (dengan filter & sort)
app.get('/menu', (req, res) => {
    let filteredMenus = [...menus];
    const { category, available, sortBy, sortOrder = 'asc' } = req.query;

    if (category) {
        filteredMenus = filteredMenus.filter(menu => menu.category.toLowerCase() === category.toLowerCase());
    }
    if (available !== undefined) {
        const isAvailable = available.toLowerCase() === 'true';
        filteredMenus = filteredMenus.filter(menu => menu.isAvailable === isAvailable);
    }
    if (sortBy) {
        filteredMenus.sort((a, b) => {
            let comparison = 0;
            if (sortBy === 'price') comparison = a.basePrice - b.basePrice;
            else if (sortBy === 'popularity') comparison = b.popularity - a.popularity;
            return sortOrder === 'desc' ? comparison * -1 : comparison;
        });
    }
    res.status(200).json({ success: true, count: filteredMenus.length, data: filteredMenus });
});

// GET /menu/:id
app.get('/menu/:id', (req, res) => {
    const menu = menus.find(m => m.id === req.params.id);
    if (!menu) {
        return res.status(404).json({ success: false, message: 'Menu tidak ditemukan' });
    }
    res.status(200).json({ success: true, data: menu });
});

// POST /menu
app.post('/menu', (req, res) => {
    const { name, basePrice, description, category, sweetnessLevel, iceLevel, imageUrl, isAvailable, popularity } = req.body;
    if (!name || basePrice === undefined || !category) {
        return res.status(400).json({ success: false, message: 'Nama, harga dasar, dan kategori wajib diisi' });
    }
    const newMenu = {
        id: uuidv4(),
        name,
        basePrice: parseFloat(basePrice),
        description: description || "",
        category,
        sweetnessLevel: parseInt(sweetnessLevel) || 100,
        iceLevel: parseInt(iceLevel) || 100,
        imageUrl: imageUrl || "",
        isAvailable: isAvailable !== undefined ? isAvailable : true,
        popularity: parseInt(popularity) || 0
    };
    menus.push(newMenu);
    res.status(201).json({ success: true, message: 'Menu berhasil ditambahkan', data: newMenu });
});

// PUT /menu/:id
app.put('/menu/:id', (req, res) => {
    const menuIndex = menus.findIndex(m => m.id === req.params.id);
    if (menuIndex === -1) {
        return res.status(404).json({ success: false, message: 'Menu tidak ditemukan' });
    }
    const updatedMenu = { ...menus[menuIndex], ...req.body };
    if (req.body.basePrice !== undefined) updatedMenu.basePrice = parseFloat(req.body.basePrice);
    if (req.body.sweetnessLevel !== undefined) updatedMenu.sweetnessLevel = parseInt(req.body.sweetnessLevel);
    if (req.body.iceLevel !== undefined) updatedMenu.iceLevel = parseInt(req.body.iceLevel);
    if (req.body.popularity !== undefined) updatedMenu.popularity = parseInt(req.body.popularity);
    if (req.body.isAvailable !== undefined) updatedMenu.isAvailable = req.body.isAvailable;


    menus[menuIndex] = updatedMenu;
    res.status(200).json({ success: true, message: 'Menu berhasil diperbarui', data: updatedMenu });
});

// DELETE /menu/:id
app.delete('/menu/:id', (req, res) => {
    const menuIndex = menus.findIndex(m => m.id === req.params.id);
    if (menuIndex === -1) {
        return res.status(404).json({ success: false, message: 'Menu tidak ditemukan' });
    }
    const deletedMenu = menus.splice(menuIndex, 1);
    res.status(200).json({ success: true, message: 'Menu berhasil dihapus', data: deletedMenu[0] });
});

// --- Routes untuk TOPPINGS ---

// GET /toppings
app.get('/toppings', (req, res) => {
    const { available } = req.query;
    let filteredToppings = [...toppings];
    if (available !== undefined) {
        const isAvailable = available.toLowerCase() === 'true';
        filteredToppings = filteredToppings.filter(topping => topping.isAvailable === isAvailable);
    }
    res.status(200).json({ success: true, count: filteredToppings.length, data: filteredToppings });
});

// GET /toppings/:id
app.get('/toppings/:id', (req, res) => {
    const topping = toppings.find(t => t.id === req.params.id);
    if (!topping) {
        return res.status(404).json({ success: false, message: 'Topping tidak ditemukan' });
    }
    res.status(200).json({ success: true, data: topping });
});

// POST /toppings
app.post('/toppings', (req, res) => {
    const { name, additionalPrice, description, isAvailable } = req.body;
    if (!name || additionalPrice === undefined) {
        return res.status(400).json({ success: false, message: 'Nama dan harga tambahan wajib diisi' });
    }
    const newTopping = {
        id: uuidv4(),
        name,
        additionalPrice: parseFloat(additionalPrice),
        description: description || "",
        isAvailable: isAvailable !== undefined ? isAvailable : true
    };
    toppings.push(newTopping);
    res.status(201).json({ success: true, message: 'Topping berhasil ditambahkan', data: newTopping });
});

// PUT /toppings/:id
app.put('/toppings/:id', (req, res) => {
    const toppingIndex = toppings.findIndex(t => t.id === req.params.id);
    if (toppingIndex === -1) {
        return res.status(404).json({ success: false, message: 'Topping tidak ditemukan' });
    }
    const updatedTopping = { ...toppings[toppingIndex], ...req.body };
    if (req.body.additionalPrice !== undefined) updatedTopping.additionalPrice = parseFloat(req.body.additionalPrice);
    if (req.body.isAvailable !== undefined) updatedTopping.isAvailable = req.body.isAvailable;


    toppings[toppingIndex] = updatedTopping;
    res.status(200).json({ success: true, message: 'Topping berhasil diperbarui', data: updatedTopping });
});

// DELETE /toppings/:id
app.delete('/toppings/:id', (req, res) => {
    const toppingIndex = toppings.findIndex(t => t.id === req.params.id);
    if (toppingIndex === -1) {
        return res.status(404).json({ success: false, message: 'Topping tidak ditemukan' });
    }
    const deletedTopping = toppings.splice(toppingIndex, 1);
    res.status(200).json({ success: true, message: 'Topping berhasil dihapus', data: deletedTopping[0] });
});

// --- Basic Root Route ---
app.get('/', (req, res) => {
    res.send('Selamat datang di BobaKu API!');
});

// --- Human Error Handler ---
app.use((err, req, res, next) => {
    console.error(err.stack); // Log error ke konsol server
    res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server',
        // Tampilkan detail error hanya jika dalam mode development untuk keamanan
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

app.listen(PORT, () => {
    console.log(`BobaKu API berjalan di http://localhost:${PORT}`);
});