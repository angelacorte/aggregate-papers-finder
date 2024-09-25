const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Endpoint to update the checked JSON
app.post('/updateChecked', (req, res) => {
    console.log('Received update for checked.json');
    fs.writeFile('./checked.json', JSON.stringify(req.body, null, 2), (err) => {
        if (err) {
            console.error('Error writing to checked.json:', err); // Log error
            return res.status(500).send('Error writing to checked.json');
        }
        res.send('checked.json updated successfully');
    });
});


// Endpoint to update the toCheck JSON
app.post('/updateToCheck', (req, res) => {
    console.log('Received update for toCheck.json');
    fs.writeFile('./toCheck.json', JSON.stringify(req.body, null, 2), (err) => {
        if (err) {
            return res.status(500).send('Error writing to toCheck.json');
        }
        res.send('toCheck.json updated successfully');
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
