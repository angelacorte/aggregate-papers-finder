let toCheck = [];
let checked = [];
let accumulation = [];
let general = [];
let interesting = [];
let leadership = [];
let learning = [];
let processes = [];
let spreading = [];
let time = [];

// Load JSON data from files
async function loadJsonData() {
    try {
        // Load toCheck and checked JSON files
        const toCheckResponse = await fetch('./sources/toCheck.json');
        if (!toCheckResponse.ok) {
            throw new Error(`HTTP error! status: ${toCheckResponse.status}`);
        }
        toCheck = await toCheckResponse.json();

        const checkedResponse = await fetch('./sources/checked.json');
        if (!checkedResponse.ok) {
            throw new Error(`HTTP error! status: ${checkedResponse.status}`);
        }
        checked = await checkedResponse.json();

        // Load each category's JSON data
        accumulation = await loadCategoryData('accumulation');
        general = await loadCategoryData('general');
        interesting = await loadCategoryData('interesting');
        leadership = await loadCategoryData('leadership');
        learning = await loadCategoryData('learning');
        processes = await loadCategoryData('processes');
        spreading = await loadCategoryData('spreading');
        time = await loadCategoryData('time');

        // Render tables
        renderToCheckTable();
        renderCheckedTable();
        renderCategoryTable('accumulationTable', accumulation, 'accumulation');
        renderCategoryTable('generalTable', general, 'general');
        renderCategoryTable('leadershipTable', leadership, 'leadership');
        renderCategoryTable('learningTable', learning, 'learning');
        renderCategoryTable('processesTable', processes, 'processes');
        renderCategoryTable('spreadingTable', spreading, 'spreading');
        renderCategoryTable('timeTable', time, 'time');
        renderCategoryTable('interestingTable', interesting, 'interesting');
    } catch (error) {
        console.error('Error loading JSON data:', error);
    }
}

// Function to load category data
async function loadCategoryData(category) {
    try {
        const response = await fetch(`./sources/${category}.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error loading ${category} data:`, error);
        return [];
    }
}

// Function to render the 'To Check' table
function renderToCheckTable() {
    const toCheckTable = document.getElementById('toCheckTable').getElementsByTagName('tbody')[0];
    toCheckTable.innerHTML = ''; // Clear the table before rendering

    toCheck.forEach((item, index) => {
        const row = toCheckTable.insertRow();
        row.insertCell(0).innerText = index;

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

// Function to render the 'Checked' table
// Function to render the 'Checked' table with category buttons
function renderCheckedTable() {
    const checkedTable = document.getElementById('checkedTable').getElementsByTagName('tbody')[0];
    checkedTable.innerHTML = ''; // Clear the table before rendering

    checked.forEach((item, index) => {
        const row = checkedTable.insertRow();
        row.insertCell(0).innerText = index;

        const titleCell = row.insertCell(1);
        const link = document.createElement('a');
        link.href = item.url;
        link.target = "_blank";
        link.innerText = item.title;
        titleCell.appendChild(link);

        row.insertCell(2).innerText = item.year;
        row.insertCell(3).innerText = item.notes;

        const actionCell = row.insertCell(4);

        // Move to Accumulation Button
        const moveAccumulationButton = document.createElement('button');
        moveAccumulationButton.innerText = 'Move to Accumulation';
        moveAccumulationButton.onclick = () => moveToCategory(index, 'accumulation');
        actionCell.appendChild(moveAccumulationButton);

        // Move to Leadership Button
        const moveLeadershipButton = document.createElement('button');
        moveLeadershipButton.innerText = 'Move to Leadership';
        moveLeadershipButton.onclick = () => moveToCategory(index, 'leadership');
        actionCell.appendChild(moveLeadershipButton);

        // Move to Learning Button
        const moveLearningButton = document.createElement('button');
        moveLearningButton.innerText = 'Move to Learning';
        moveLearningButton.onclick = () => moveToCategory(index, 'learning');
        actionCell.appendChild(moveLearningButton);

        // Move to Processes Button
        const moveProcessesButton = document.createElement('button');
        moveProcessesButton.innerText = 'Move to Processes';
        moveProcessesButton.onclick = () => moveToCategory(index, 'processes');
        actionCell.appendChild(moveProcessesButton);

        // Move to Spreading Button
        const moveSpreadingButton = document.createElement('button');
        moveSpreadingButton.innerText = 'Move to Spreading';
        moveSpreadingButton.onclick = () => moveToCategory(index, 'spreading');
        actionCell.appendChild(moveSpreadingButton);

        // Move to Time Button
        const moveTimeButton = document.createElement('button');
        moveTimeButton.innerText = 'Move to Time';
        moveTimeButton.onclick = () => moveToCategory(index, 'time');
        actionCell.appendChild(moveTimeButton);

        //Move to general button
        const moveGeneralButton = document.createElement('button');
        moveGeneralButton.innerText = 'Move to General';
        moveGeneralButton.onclick = () => moveToCategory(index, 'general');
        actionCell.appendChild(moveGeneralButton);

        //move to interesting
        const moveInterestingButton = document.createElement('button');
        moveInterestingButton.innerText = 'Interesting but not stdlib';
        moveInterestingButton.onclick = () => moveToCategory(index, 'interesting');
        actionCell.appendChild(moveInterestingButton);

        // Delete Button
        const deleteButton = document.createElement('button');
        deleteButton.innerText = '✘'; // Represents delete
        deleteButton.onclick = () => deleteFromChecked(index);
        actionCell.appendChild(deleteButton);

        // Re-check Button
        const doubtButton = document.createElement('button');
        doubtButton.innerText = '↻'; // Represents re-check
        doubtButton.onclick = () => moveToToCheck(index);
        actionCell.appendChild(doubtButton);

        // Edit Notes Button
        const editButton = document.createElement('button');
        editButton.innerText = 'Edit Notes';
        editButton.onclick = () => editNotes(index);
        actionCell.appendChild(editButton);
    });
}

// Function to move an item to a category (accumulation, leadership, etc.)
async function moveToCategory(index, category) {
    const item = checked[index];

    // Remove item from 'checked'
    checked.splice(index, 1);

    // Add item to the selected category
    switch (category) {
        case 'accumulation':
            accumulation.push(item);
            await updateCategory('accumulation', accumulation);
            break;
        case 'general':
            general.push(item);
            await updateCategory('general', general);
            break;
        case 'leadership':
            leadership.push(item);
            await updateCategory('leadership', leadership);
            break;
        case 'learning':
            learning.push(item);
            await updateCategory('learning', learning);
            break;
        case 'processes':
            processes.push(item);
            await updateCategory('processes', processes);
            break;
        case 'spreading':
            spreading.push(item);
            await updateCategory('spreading', spreading);
            break;
        case 'time':
            time.push(item);
            await updateCategory('time', time);
            break;
        case 'interesting':
            interesting.push(item);
            await updateCategory('interesting', interesting);
            break;
        default:
            console.error('Unknown category:', category);
            return;
    }

    // Send updated checked data to the server and re-render the table
    await updateChecked(checked);
    renderCheckedTable();
    renderCategoryTable(`${category}Table`, eval(category), category);
}

// Function to update category data on the server
async function updateCategory(category, data) {
    try {
        const response = await fetch(`http://localhost:3000/updateCategory/${category}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error(`Error updating ${category} data:`, error);
    }
}

async function deleteFromCategory(index, category) {
    switch (category) {
        case 'accumulation':
            accumulation.splice(index, 1);
            await updateCategory('accumulation', accumulation);
            renderCategoryTable('accumulationTable', accumulation, 'accumulation');
            break;
        case 'general':
            general.splice(index, 1);
            await updateCategory('general', general);
            renderCategoryTable('generalTable', general, 'general');
            break;
        case 'leadership':
            leadership.splice(index, 1);
            await updateCategory('leadership', leadership);
            renderCategoryTable('leadershipTable', leadership, 'leadership');
            break;
        case 'learning':
            learning.splice(index, 1);
            await updateCategory('learning', learning);
            renderCategoryTable('learningTable', learning, 'learning');
            break;
        case 'processes':
            processes.splice(index, 1);
            await updateCategory('processes', processes);
            renderCategoryTable('processesTable', processes, 'processes');
            break;
        case 'spreading':
            spreading.splice(index, 1);
            await updateCategory('spreading', spreading);
            renderCategoryTable('spreadingTable', spreading, 'spreading');
            break;
        case 'time':
            time.splice(index, 1);
            await updateCategory('time', time);
            renderCategoryTable('timeTable', time, 'time');
            break;
        case 'interesting':
            interesting.splice(index, 1);
            await updateCategory('interesting', interesting);
            renderCategoryTable('interestingTable', interesting, 'interesting');
            break;
        default:
            console.error('Unknown category:', category);
            return;
    }
}

// Function to render any category table with "Edit Notes" button
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

        // Action cell for buttons (e.g., Edit Notes)
        const actionCell = row.insertCell(4);

        // Edit Notes Button
        const editButton = document.createElement('button');
        editButton.innerText = 'Edit Notes';
        editButton.onclick = () => editNotesInCategory(index, category);
        actionCell.appendChild(editButton);

        // Delete Button
        const deleteButton = document.createElement('button');
        deleteButton.innerText = '✘'; // Represents delete
        deleteButton.onclick = () => deleteFromCategory(index, category);
        actionCell.appendChild(deleteButton);

        // You can add other buttons here if needed
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

// Move an item from 'Checked' to 'To Check'
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

// Delete an item from 'To Check'
async function deleteFromToCheck(index) {
    toCheck = toCheck.filter((_, i) => i !== index); // Remove item from 'toCheck'
    await updateToCheck(); // Update the server
    renderToCheckTable(); // Re-render the table
}

// Delete an item from 'Checked'
async function deleteFromChecked(index) {
    checked = checked.filter((_, i) => i !== index); // Remove item from 'checked'
    await updateChecked(checked); // Update the server
    renderCheckedTable(); // Re-render the table
}

// Edit notes for an item in the 'Checked' table
async function editNotes(index) {
    const item = checked[index];
    const newNotes = prompt('Edit notes:', item.notes);
    if (newNotes !== null) {
        checked[index].notes = newNotes;
        await updateChecked(checked); // Update the server
        renderCheckedTable(); // Re-render the table
    }
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

async function fetchCategoryData(category) {
    try {
        const response = await fetch(`./sources/${category}.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching data for ${category}:`, error);
        return [];
    }
}

async function editNotesInCategory(index, category) {
    const data = await fetchCategoryData(category); // Fetch the data for the given category
    const item = data[index];

    // Prompt for new notes
    const newNotes = prompt('Edit notes:', item.notes);
    if (newNotes !== null) {
        item.notes = newNotes;
        await updateCategory(category, data); // Save the updated data to the server
        renderTableForCategory(category); // Re-render the appropriate table
    }
}

// Initial data load
loadJsonData().then(() => console.log('Data loaded successfully')).catch(e => console.error('Error loading data:', e));
