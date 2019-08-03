// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: 'AIzaSyCnjGo0GgsH4FZ9G7GKMWRooo4gPO3Q-fg',
  authDomain: 'hello-dish.firebaseapp.com',
  databaseURL: 'https://hello-dish.firebaseio.com',
  projectId: 'hello-dish',
  storageBucket: '',
  messagingSenderId: '367969664099',
  appId: '1:367969664099:web:7b67555018f088bc',
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

let itemCounter = 0;
let editToggler = false;
let editItemId;

const db = firebase.firestore();

const addItemButton = document.querySelector('#items .btn');
const addItemForm = document.querySelector('#add-item');
const closeFormButton = document.querySelector('.close');
const addItemSubmitButton = document.querySelector('#add-item-submit');

const itemsTable = document.getElementById('items-table');
const tbody = document
  .getElementById('items-table')
  .getElementsByTagName('tbody')[0];

const itemName = document.getElementById('item-name');
const itemNormalPrice = document.getElementById('item-normal-price');
const itemOfferPrice = document.getElementById('item-offer-price');

const infoMessage = document.querySelector('.info-message');

// Item Class
class Item {
  constructor(itemTableId, itemId, itemName, itemNormalPrice, itemOfferPrice) {
    this.itemTableId = itemTableId;
    this.itemId = itemId;
    this.itemName = itemName;
    this.itemNormalPrice = itemNormalPrice;
    this.itemOfferPrice = itemOfferPrice;
  }
}

// FirebaseOp Class
class FirebaseOp {
  // Listen For Item Changes
  itemsListener() {
    console.log('listen for changes');
    db.collection('items').onSnapshot(function(docSnapshot) {
      const changes = docSnapshot.docChanges();
      if (changes.length === 0) {
        ui.hideTable();
      }
      changes.forEach(change => {
        if (change.type == 'added') {
          ui.renderItems(change.doc);
        } else if (change.type == 'removed') {
          ui.removeItem(change.doc);
        } else if (change.type == 'modified') {
          ui.showModifiedItem(change.doc);
        }
      });
    });
  }

  updateItem() {
    return db
      .collection('items')
      .doc(editItemId)
      .set({
        item_name: itemName.value,
        item_normal_price: itemNormalPrice.value,
        item_offer_price: itemOfferPrice.value,
      });
  }

  addItem() {
    return db.collection('items').add({
      item_name: itemName.value,
      item_normal_price: itemNormalPrice.value,
      item_offer_price: itemOfferPrice.value,
    });
  }

  deleteItem(dataItemId) {
    return db
      .collection('items')
      .doc(dataItemId)
      .delete();
  }
}

// UI Class
class UI {
  // Show Add Item Form
  showForm() {
    console.log('showForm function called');
    addItemForm.style.height = 'auto';
    addItemForm.style.overflow = 'auto';
    addItemForm.style.visibility = 'visible';
    addItemForm.style.opacity = '1';
    addItemForm.style.marginBottom = '3rem';
    addItemButton.style.outline = 'none';
    closeFormButton.style.transition = 'all 0.3s ease-in';
    addItemButton.style.visibility = 'hidden';
    addItemButton.style.transition = 'none';
  }

  // Hide Item Form
  hideForm() {
    addItemForm.style.height = '0';
    addItemForm.style.overflow = 'hidden';
    addItemForm.style.visibility = 'hidden';
    addItemForm.style.opacity = '0';
    addItemForm.style.marginBottom = '0';
    closeFormButton.style.transition = 'none';
    addItemButton.style.visibility = 'visible';
    addItemButton.style.transition = 'all 1s ease-in-out';

    // Set Input Fields To Empty
    itemName.value = '';
    itemNormalPrice.value = '';
    itemOfferPrice.value = '';
  }

  hideTable() {
    itemsTable.style.opacity = '0';
    itemsTable.style.visibility = 'hidden';
  }

  showTable() {
    itemsTable.style.opacity = '1';
    itemsTable.style.visibility = 'visible';
  }

  // Render added Items
  renderItems(doc) {
    itemCounter++;
    const td = `<td>${itemCounter}</td>
        <td>${doc.data().item_name}</td>
        <td>${doc.data().item_normal_price}</td>
        <td>${doc.data().item_offer_price}</td>
        <td><i class="fas fa-edit"></i><i class="fas fa-trash-alt"></i></td>`;
    const tr = document.createElement('tr');
    this.setDataAttributes(tr, doc);
    tr.innerHTML = td;
    tbody.appendChild(tr);
    this.showTable();
  }

  removeItem(doc) {
    // attribute values or id,classnames cant be start with a number so we append "'" to them
    const tr = document.querySelector(
      '[data-item-id=' + "'" + doc.id + "'" + ']'
    );
    tbody.removeChild(tr);
  }

  // Show modified Items
  showModifiedItem(doc) {
    const tr = document.querySelector(
      '[data-item-id=' + "'" + editItemId + "'" + ']'
    );
    console.log(tr);
    const tableId = tr.getAttribute('data-table-id');
    const td = `<td>${tableId}</td>
          <td>${doc.data().item_name}</td>
          <td>${doc.data().item_normal_price}</td>
          <td>${doc.data().item_offer_price}</td>
          <td><i class="fas fa-edit"></i><i class="fas fa-trash-alt"></i></td>`;
    this.setDataAttributes(tr, doc);
    tr.innerHTML = td;
  }

  // Sync Table Id after delete item
  syncTableId(e) {
    itemCounter--;
    const dataTableId = e.target.parentElement.parentElement.getAttribute(
      'data-table-id'
    );
    let trs = document.querySelectorAll('tbody tr');
    trs.forEach(function(tr) {
      if (tr.getAttribute('data-table-id') > dataTableId) {
        const currentTableId = tr.getAttribute('data-table-id');
        const tds = tr.querySelectorAll('td');
        tds[0].textContent = currentTableId - 1;
        tr.setAttribute('data-table-id', currentTableId - 1);
      }
    });
  }

  // Set <tr> Data Attributes
  setDataAttributes(tr, doc) {
    tr.setAttribute('data-table-id', itemCounter);
    tr.setAttribute('data-item-id', doc.id);
    tr.setAttribute('data-item-name', doc.data().item_name);
    tr.setAttribute('data-item-normal-price', doc.data().item_normal_price);
    tr.setAttribute('data-item-offer-price', doc.data().item_offer_price);
  }

  showAlert() {
    infoMessage.textContent = 'Fields cant be empty';
    infoMessage.style.visibility = 'visible';
    infoMessage.style.opacity = '1';
    infoMessage.style.height = 'auto';
    addItemSubmitButton.style.outline = 'none';

    setTimeout(function() {
      infoMessage.textContent = '';
      infoMessage.style.visibility = 'hidden';
      infoMessage.style.opacity = '0';
      infoMessage.style.height = '0';
    }, 3000);
  }

  clearFields() {
    itemName.value = '';
    itemNormalPrice.value = '';
    itemOfferPrice.value = '';
  }

  setEditFields(target) {
    itemName.value = target.parentElement.parentElement.getAttribute(
      'data-item-name'
    );
    itemNormalPrice.value = target.parentElement.parentElement.getAttribute(
      'data-item-normal-price'
    );
    itemOfferPrice.value = target.parentElement.parentElement.getAttribute(
      'data-item-offer-price'
    );
  }
}

const ui = new UI();
const firebaseOp = new FirebaseOp();

addItemButton.addEventListener('click', function() {
  editToggler = false;
  ui.showForm();
});

// Event Listener Form Close
closeFormButton.addEventListener('click', ui.hideForm);

// Event Listener Add Item submit Button
addItemSubmitButton.addEventListener('click', function(e) {
  e.preventDefault();

  // if input fields are empty
  if (
    itemName.value == '' ||
    itemNormalPrice.value == '' ||
    itemOfferPrice.value == ''
  ) {
    ui.showAlert();
  }
  // if input fields are not empty
  else {
    const editItemName = itemName.value;
    // edit item operation
    if (editToggler) {
      firebaseOp
        .updateItem()
        .then(function() {
          ui.hideForm();
          swal(`Edited successfully!`);
        })
        .catch(function(error) {
          swal('Unsuccessful!', 'We couldnt edit the item!', 'error');
          console.log('error: ', error);
        });
    }
    // add item operation
    else {
      firebaseOp
        .addItem()
        .then(function() {
          ui.clearFields();

          swal(`${editItemName} Added Successfully!`);
        })
        .catch(function(error) {
          console.log('error: ', error);
          swal('Unsuccessful!', 'We couldnt add the item!', 'error');
        });
    }
  }
});

// DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', firebaseOp.itemsListener);
// Event Listener For delete & edit
itemsTable.addEventListener('click', function(e) {
  editToggler = true;
  const dataItemName = e.target.parentElement.parentElement.getAttribute(
    'data-item-name'
  );
  const dataItemId = e.target.parentElement.parentElement.getAttribute(
    'data-item-id'
  );

  // when edit button clicked
  if (e.target.classList.contains('fa-edit')) {
    console.log('edit item called form show');
    editToggler = true;
    ui.showForm();

    editItemId = dataItemId;

    ui.setEditFields(e.target);
  }
  // when delete button clicked
  else if (e.target.classList.contains('fa-trash-alt')) {
    swal({
      title: 'Confirm?',
      text: `Are you sure you want to delete ${dataItemName}?`,
      icon: 'warning',
      buttons: true,
      dangerMode: true,
    })
      .then(willDelete => {
        if (willDelete) {
          firebaseOp.deleteItem(dataItemId).then(function() {
            swal(`${dataItemName} was removed`, {
              icon: 'success',
            });

            ui.syncTableId(e);
          });
        } else {
          swal(`${dataItemName} is safe!`);
        }
      })
      .catch(function(error) {
        console.log('Error:', error);
        swal('Unsuccessful!', 'We couldnt delete the item!', 'error');
      });
  }
});
