let toCheck = []
let checked = []

// Load JSON data from files
async function loadJsonData() {
    try {
        const toCheckResponse = await fetch('./toCheck.json');
        if (!toCheckResponse.ok) {
            throw new Error(`HTTP error! status: ${toCheckResponse.status}`);
        }
        toCheck = await toCheckResponse.json();

        const checkedResponse = await fetch('./checked.json');
        if (!checkedResponse.ok) {
            throw new Error(`HTTP error! status: ${checkedResponse.status}`);
        }
        checked = await checkedResponse.json();

        renderToCheckTable();
        renderCheckedTable();
    } catch (error) {
        console.error('Error loading JSON data:', error);
    }
}

// Function to render the 'To Check' table
function renderToCheckTable() {
    const toCheckTable = document.getElementById('toCheckTable').getElementsByTagName('tbody')[0];
    toCheckTable.innerHTML = ''; // Clear the table before rendering

    toCheck.forEach((item, index) => {
        const row = toCheckTable.insertRow();
        row.insertCell(0).innerText = index + 1;

        const titleCell = row.insertCell(1);
        const link = document.createElement('a');
        link.href = item.url;
        link.target = "_blank";
        link.innerText = item.title;
        titleCell.appendChild(link);

        row.insertCell(2).innerText = item.year;
        row.insertCell(3).innerText = item.notes;

        const actionCell = row.insertCell(4);

        // Check Button
        const checkButton = document.createElement('button');
        checkButton.innerText = '✔';
        checkButton.onclick = () => moveToChecked(index);
        actionCell.appendChild(checkButton);

        // Delete Button
        const deleteButton = document.createElement('button');
        deleteButton.innerText = '✘'; // Represents delete
        deleteButton.onclick = () => deleteFromToCheck(index);
        actionCell.appendChild(deleteButton);
    });
}

// Function to render the 'Checked' table with an "Uncheck" button
function renderCheckedTable() {
    const checkedTable = document.getElementById('checkedTable').getElementsByTagName('tbody')[0];
    checkedTable.innerHTML = ''; // Clear the table before rendering

    checked.forEach((item, index) => {
        const row = checkedTable.insertRow();
        row.insertCell(0).innerText = index + 1;

        const titleCell = row.insertCell(1);
        const link = document.createElement('a');
        link.href = item.url;
        link.target = "_blank";
        link.innerText = item.title;
        titleCell.appendChild(link);

        row.insertCell(2).innerText = item.year;
        row.insertCell(3).innerText = item.notes;
    });
}

async function moveToChecked(index) {
    console.log('Moving item to checked:', index);
    const item = toCheck[index];

    // Prompt for notes to add to the item
    const notes = prompt('Enter notes for this item:');
    item.notes = notes || '';

    // Remove item from 'toCheck' and add to 'checked'
    toCheck.splice(index, 1);
    checked.push(item);

    console.log('Item checked:', item);
    console.log('To Check:', toCheck);
    // Send updated data to the server
    await updateChecked(checked);
    await updateToCheck(toCheck);

    // Re-render both tables
    renderToCheckTable();
    renderCheckedTable();
}

// Function to delete an item from 'toCheck'
async function deleteFromToCheck(index) {
    const item = toCheck[index];
    console.log("item to delete", item)
    toCheck = toCheck.filter((_, i) => i !== index); // Remove item from 'toCheck'
    await updateToCheck();
    renderToCheckTable(); // Re-render the table
}
// Function to update checked data on the server
async function updateChecked(ckd) {
    try {
        const response = await fetch('http://localhost:3000/updateChecked', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(ckd),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error updating checked data:', error);
    }
}

// Function to update toCheck data on the server
async function updateToCheck() {
    try {
        const response = await fetch('http://localhost:3000/updateToCheck', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(toCheck),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error updating toCheck data:', error);
    }
}

// Initial data load
loadJsonData().then(r => console.log('Data loaded successfully')).catch(e => console.error('Error loading data:', e));