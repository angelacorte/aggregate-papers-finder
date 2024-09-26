const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Helper function to update a category JSON file
const updateCategory = (category, data, res) => {
    const filePath = `./sources/${category}.json`;
    fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
        if (err) {
            console.error(`Error writing to ${category}.json:`, err);
            return res.status(500).send(`Error writing to ${category}.json`);
        }
        res.send(`${category}.json updated successfully`);
    });
};

// Endpoint to update checked JSON
app.post('/updateChecked', (req, res) => {
    console.log('Received update for checked.json');
    updateCategory('checked', req.body, res);
});

// Endpoint to update toCheck JSON
app.post('/updateToCheck', (req, res) => {
    console.log('Received update for toCheck.json');
    updateCategory('toCheck', req.body, res);
});

// Generic endpoint for category updates
app.post('/updateCategory/:category', (req, res) => {
    const category = req.params.category;
    const validCategories = ['accumulation', 'general', 'leadership', 'learning', 'processes', 'spreading', 'time', 'interesting'];

    if (!validCategories.includes(category)) {
        return res.status(400).send('Invalid category');
    }

    console.log(`Received update for ${category}.json`);
    updateCategory(category, req.body, res);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
