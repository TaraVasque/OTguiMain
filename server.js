const express = require('express');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const bodyParser = require('body-parser');

// Initialize Express app
const app = express();
const port = 3000;

// Path to orders data
const filePath = './orders.json';
const excelFilePath = './orders.xlsx';

// Initialize orders array
let orders = [];

// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files (HTML, CSS, JS)

app.get('/orders', (req, res) => {
    loadOrders();
    res.json(orders);
});

app.post('/orders', (req, res) => {
    const { name, price, type, phone } = req.body;
    if (!name || isNaN(price) || price <= 0 || !type || !phone) {
        return res.status(400).json({ message: 'Invalid input' });
    }

    const newOrder = { name, price, type, phone };
    orders.push(newOrder);
    saveOrders();
    res.status(201).json(newOrder);
});

app.put('/orders/:index', (req, res) => {
    const index = parseInt(req.params.index);
    const { name, price, type, phone } = req.body;

    if (index < 0 || index >= orders.length) {
        return res.status(404).json({ message: 'Order not found' });
    }

    if (name) orders[index].name = name;
    if (!isNaN(price) && price > 0) orders[index].price = price;
    if (type) orders[index].type = type;
    if (phone) orders[index].phone = phone;

    saveOrders();
    res.json(orders[index]);
});

app.delete('/orders/:index', (req, res) => {
    const index = parseInt(req.params.index);
    if (index < 0 || index >= orders.length) {
        return res.status(404).json({ message: 'Order not found' });
    }

    orders.splice(index, 1);
    saveOrders();
    res.status(204).send();
});

app.get('/totalCost', (req, res) => {
    const totalCost = orders.reduce((sum, order) => sum + order.price, 0);
    res.json({ totalCost });
});

app.get('/export', (req, res) => {
    saveOrdersToExcel();
    res.json({ message: 'Orders exported to Excel' });
});

app.post('/import', (req, res) => {
    loadOrdersFromExcel();
    res.json({ message: 'Orders imported from Excel' });
});

// Utility functions to load and save data

function loadOrders() {
    if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf-8');
        orders = JSON.parse(data);
    }
}

function saveOrders() {
    const data = JSON.stringify(orders, null, 2);
    fs.writeFileSync(filePath, data, 'utf-8');
}

function saveOrdersToExcel() {
    const worksheet = XLSX.utils.json_to_sheet(orders);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
    XLSX.writeFile(workbook, excelFilePath);
}

function loadOrdersFromExcel() {
    if (fs.existsSync(excelFilePath)) {
        const workbook = XLSX.readFile(excelFilePath);
        const worksheet = workbook.Sheets['Orders'];
        orders = XLSX.utils.sheet_to_json(worksheet);
    }
}

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
