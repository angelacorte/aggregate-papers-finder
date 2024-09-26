let toCheck = [];
let checked = [];
const categories = ['accumulation', 'general', 'interesting', 'leadership', 'learning', 'processes', 'spreading', 'time'];
let categoryData = {};

// Load JSON data from files
async function loadJsonData() {
    try {
        // Load toCheck and checked JSON files
        toCheck = await fetchJson('./sources/toCheck.json');
        checked = await fetchJson('./sources/checked.json');

        // Load each category's JSON data
        await Promise.all(categories.map(async category => {
            categoryData[category] = await fetchJson(`./sources/${category}.json`);
        }));

        // Render tables
        renderToCheckTable();
        renderCheckedTable();
        categories.forEach(category => renderCategoryTable(`${category}Table`, categoryData[category], category));
    } catch (error) {
        console.error('Error loading JSON data:', error);
    }
}

// Function to fetch JSON data
async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
}

// Function to render any category table
function renderCategoryTable(tableId, data, category) {
    const table = document.getElementById(tableId).getElementsByTagName('tbody')[0];
    table.innerHTML = ''; // Clear the table before rendering

    data.forEach((item, index) => {
        const row = table.insertRow();
        row.insertCell(0).innerText = index;

        // Create title cell with link
        const titleCell = row.insertCell(1);
        const link = document.createElement('a');
        link.href = item.url;
        link.target = "_blank";
        link.innerText = item.title;
        titleCell.appendChild(link);

        // Add year and notes cells
        row.insertCell(2).innerText = item.year;
        row.insertCell(3).innerText = item.notes;

        // Action cell for buttons
        const actionCell = row.insertCell(4);
        createActionButtons(actionCell, index, category);

        if(category === 'toCheck') {
            const checkButton = createButton('✓', () => moveToChecked(index));
            actionCell.appendChild(checkButton);
        }
    });
}

// Move an item from 'To Check' to 'Checked'
async function moveToChecked(index) {
    const item = toCheck[index];

    // Prompt for notes to add to the item
    const notes = prompt('Enter notes for this item:');
    item.notes = notes || '';

    // Remove item from 'toCheck' and add to 'checked'
    toCheck.splice(index, 1);
    checked.push(item);

    // Send updated data to the server
    await updateChecked(checked);
    await updateToCheck(toCheck);

    // Re-render both tables
    renderToCheckTable();
    renderCheckedTable();
}

async function moveToToCheck(index) {
    const item = checked[index];
    checked.splice(index, 1); // Remove from 'checked'
    toCheck.push(item); // Add to 'toCheck'

    // Send updated data to the server
    await updateChecked(checked);
    await updateToCheck(toCheck);

    // Re-render both tables
    renderCheckedTable();
    renderToCheckTable();
}

// Function to create action buttons in the action cell
function createActionButtons(actionCell, index, category) {
    // Edit Notes Button
    const editButton = createButton('Edit Notes', () => editNotesInCategory(index, category));
    actionCell.appendChild(editButton);

    // Delete Button
    const deleteButton = createButton('✘', () => deleteFromCategory(index, category));
    actionCell.appendChild(deleteButton);

    // Add additional buttons for 'Checked' table only
    if (category === 'checked') {
        categories.forEach(cat => {
            const moveButton = createButton(`Move to ${cat.charAt(0).toUpperCase() + cat.slice(1)}`, () => moveToCategory(index, cat));
            actionCell.appendChild(moveButton);
        });

        const recheckButton = createButton('↻', () => moveToToCheck(index));
        actionCell.appendChild(recheckButton);
    }
}

// Utility function to create a button
function createButton(text, onClick) {
    const button = document.createElement('button');
    button.innerText = text;
    button.onclick = onClick;
    return button;
}

// Function to render 'To Check' table
function renderToCheckTable() {
    renderCategoryTable('toCheckTable', toCheck, 'toCheck');
}

// Function to render 'Checked' table
function renderCheckedTable() {
    renderCategoryTable('checkedTable', checked, 'checked');
}

// Function to move an item to a category
async function moveToCategory(index, category) {
    const item = checked[index];
    checked.splice(index, 1);
    categoryData[category].push(item);
    await updateCategory(category, categoryData[category]);
    await updateChecked(checked);
    renderCheckedTable();
    renderCategoryTable(`${category}Table`, categoryData[category], category);
}

// Function to delete an item from a category
async function deleteFromCategory(index, category) {
    categoryData[category].splice(index, 1);
    await updateCategory(category, categoryData[category]);
    renderCategoryTable(`${category}Table`, categoryData[category], category);
}

// Function to edit notes in the checked table
async function editNotesInCategory(index, category) {
    const item = categoryData[category][index];
    const newNotes = prompt('Edit notes:', item.notes);
    if (newNotes !== null) {
        item.notes = newNotes;
        await updateCategory(category, categoryData[category]);
        renderCategoryTable(`${category}Table`, categoryData[category], category);
    }
}

// Function to update category data on the server
async function updateCategory(category, data) {
    await postJson(`http://localhost:3000/updateCategory/${category}`, data);
}

// Function to update checked data on the server
async function updateChecked(data) {
    await postJson('http://localhost:3000/updateChecked', data);
}

// Function to update toCheck data on the server
async function updateToCheck() {
    await postJson('http://localhost:3000/updateToCheck', toCheck);
}


// Function to post JSON data
async function postJson(url, data) {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
}

// Initial data load
loadJsonData().then(() => console.log('Data loaded successfully')).catch(e => console.error('Error loading data:', e));
