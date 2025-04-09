//opening modal form
function openForm() {
    document.getElementById("myForm").style.display = "block";
    document.getElementById("file").value = ""; 
    document.querySelector('.bttn').textContent = 'Add';
}
function closeForm() {
    document.getElementById("myForm").style.display = "none";
    document.getElementById("tForm").reset(); 
    isEditing = false;
    currentEditIndex = null;
}

//table output
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('tForm');
    const tableBody = document.querySelector('#data tbody');
    loadTableData();

//add product
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (!confirm('Are you sure you want to submit this item?')) return;

        const fileInput = document.getElementById('file');
        const name = document.getElementById('name').value;
        const type = document.getElementById('type').value;
        const details = document.getElementById('details').value;
        const quantity = document.getElementById('quantity').value;
        const price = document.getElementById('price').value;
        const date = document.getElementById('date').value;

        const file = fileInput.files[0];
        if (!file && !isEditing) {
            alert('Please select an image file');
            return;
        }

        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                saveOrUpdateEntry(e.target.result, name, type, details, quantity, price, date);
            };
            reader.readAsDataURL(file);
        } else {
            const entries = JSON.parse(localStorage.getItem('formEntries'));
            const existingImage = entries[currentEditIndex].file;
            saveOrUpdateEntry(existingImage, name, type, details, quantity, price, date);
        }
    });

    function saveOrUpdateEntry(file, name, type, details, quantity, price, date) {
        const entries = JSON.parse(localStorage.getItem('formEntries')) || [];
        
        if (isEditing) {
            entries[currentEditIndex] = { file, name, type, details, quantity, price, date };
        } else {
            entries.push({ file, name, type, details, quantity, price, date });
        }
        
        localStorage.setItem('formEntries', JSON.stringify(entries));
        loadTableData();
        closeForm(); 
        isEditing = false;
        currentEditIndex = null;
    }

    function addRowToTable(file, name, type, details, quantity, price, date, index) {
        const newRow = document.createElement('tr');

        newRow.innerHTML = `
            <td><img src="${file}" width="75" height="75"></td>
            <td>${name}</td>
            <td>${type}</td>
            <td>${details}</td>
            <td>${quantity}</td>
            <td>${price}</td>
            <td>${date}</td>
            <td>
                <button class="delete-btn">Delete</button>
                <button class="edit-btn">Edit</button>
            </td>
        `;
        newRow.dataset.index = index;

//delete item
    tableBody.appendChild(newRow);
    newRow.querySelector('.delete-btn').addEventListener('click', function() {
        if (confirm('Are you sure you want to delete this item?')) {
            removeFromLocalStorage(newRow.dataset.index);
            newRow.remove();
        }
    });
    
//edit item
    let currentEditIndex = null;
    let isEditing = false;       
    newRow.querySelector('.edit-btn').addEventListener('click', function() {
        editRow(newRow);
        document.querySelector('.bttn').textContent = 'Save';
        document.getElementById("myForm").style.display = "block";
    });
    }

    function removeFromLocalStorage(index) {
        let entries = JSON.parse(localStorage.getItem('formEntries')) || [];
        entries.splice(index, 1);
        localStorage.setItem('formEntries', JSON.stringify(entries));
    }

    function loadTableData() {
        const entries = JSON.parse(localStorage.getItem('formEntries')) || [];
        tableBody.innerHTML = ''; 
        entries.forEach((entry, index) => {
            addRowToTable(entry.file, entry.name, entry.type, entry.details, entry.quantity, entry.price, entry.date, index);
        });
    }

    let currentEditIndex = null;
    let isEditing = false;

    function editRow(row) {
        isEditing = true;
        const index = row.dataset.index;
        currentEditIndex = index;

        const entries = JSON.parse(localStorage.getItem('formEntries')) || [];
        const entry = entries[index];

        document.getElementById('file').value = "";
        document.getElementById('name').value = entry.name;
        document.getElementById('type').value = entry.type;
        document.getElementById('details').value = entry.details;
        document.getElementById('quantity').value = entry.quantity;
        document.getElementById('price').value = entry.price;
        document.getElementById('date').value = entry.date;

        openForm();
    }

//search bar
    document.getElementById('itemSearch').addEventListener('keyup', searchItems);
    document.getElementById('typeSearch').addEventListener('keyup', searchType);
    document.querySelector('button[onclick="resetSorting()"]').addEventListener('click', resetSorting);

    function searchItems() {
        const input = document.getElementById('itemSearch').value.toLowerCase();
        const rows = document.querySelectorAll('#data tbody tr');
        rows.forEach(row => {
            const name = row.cells[1].textContent.toLowerCase();
            row.style.display = name.includes(input) ? '' : 'none';
        });
    }

    function searchType() {
        const input = document.getElementById('typeSearch').value.toLowerCase();
        const rows = document.querySelectorAll('#data tbody tr');
        rows.forEach(row => {
            const type = row.cells[2].textContent.toLowerCase();
            row.style.display = type.includes(input) ? '' : 'none';
       });
    }
    
//sorting items
    document.getElementById('Ascending').addEventListener('change', sortPrice);
    document.getElementById('Descending').addEventListener('change', sortPrice);
    document.getElementById('MItems').addEventListener('change', sortQuantity);
    document.getElementById('LItems').addEventListener('change', sortQuantity);

    function sortPrice() {
        const ascending = document.getElementById('Ascending').checked;
        const tbody = document.querySelector('#data tbody');
        const rows = Array.from(tbody.querySelectorAll('tr:not([style*="display: none"])'));
    
        rows.sort((a, b) => {
            const priceA = parseFloat(a.cells[5].textContent);
            const priceB = parseFloat(b.cells[5].textContent);
            return ascending ?  priceB - priceA : priceA - priceB;
        });
    
        tbody.append(...rows);
    }

    function sortQuantity() {
        const moreItems = document.getElementById('MItems').checked;
        const tbody = document.querySelector('#data tbody');
        const rows = Array.from(tbody.querySelectorAll('tr:not([style*="display: none"])'));
    
        rows.sort((a, b) => {
            const qtyA = parseInt(a.cells[4].textContent);
            const qtyB = parseInt(b.cells[4].textContent);
            return moreItems ? qtyB - qtyA : qtyA - qtyB;
        });
    
        tbody.append(...rows);
    }

    function resetSorting() {
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.checked = false;
        });
    
        const tbody = document.querySelector('#data tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        rows.sort((a, b) => {
            const indexA = parseInt(a.dataset.index);
            const indexB = parseInt(b.dataset.index);
            return indexA - indexB;
        });
        tbody.innerHTML = '';
        rows.forEach(row => tbody.appendChild(row));
    }
});

