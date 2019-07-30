  // Your web app's Firebase configuration
  var firebaseConfig = {
    apiKey: "AIzaSyCnjGo0GgsH4FZ9G7GKMWRooo4gPO3Q-fg",
    authDomain: "hello-dish.firebaseapp.com",
    databaseURL: "https://hello-dish.firebaseio.com",
    projectId: "hello-dish",
    storageBucket: "",
    messagingSenderId: "367969664099",
    appId: "1:367969664099:web:7b67555018f088bc"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  let itemCounter = 0;
  let editToggler = false;
  let editItemId;
  // let deleteItemId;

  const db = firebase.firestore();


  const addItemButton = document.querySelector('#items .btn');
  const addItemForm = document.querySelector('#add-item');
  const closeFormButton = document.querySelector('.close');
  const addItemSubmitButton = document.querySelector('#add-item-submit');

  const itemsTable = document.getElementById('items-table');
  const tbody = document.getElementById('items-table').getElementsByTagName('tbody')[0];

  const itemName = document.getElementById('item-name');
  const itemNormalPrice = document.getElementById('item-normal-price');
  const itemOfferPrice = document.getElementById('item-offer-price');

  const infoMessage = document.querySelector('.info-message');

  addItemButton.addEventListener('click', function () {
    editToggler = false;
    showForm();
  });
  // addItemButton.addEventListener('click', function (e) {
  //   console.log(e.target);
  // });
  closeFormButton.addEventListener('click', hideForm);
  addItemSubmitButton.addEventListener('click', addItem);
  itemsTable.addEventListener('click', editItem);


  // Show Add Item Form
  function showForm() {
    console.log("showForm function called");
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
  function hideForm() {
    addItemForm.style.height = '0';
    addItemForm.style.overflow = 'hidden';
    addItemForm.style.visibility = 'hidden';
    addItemForm.style.opacity = '0';
    addItemForm.style.marginBottom = '0';
    closeFormButton.style.transition = 'none';
    addItemButton.style.visibility = 'visible';
    addItemButton.style.transition = 'all 1s ease-in-out';

    // Set Input Fields To Empty
    itemName.value = "";
    itemNormalPrice.value = "";
    itemOfferPrice.value = "";


  }


  // Add or Edit Item To Firebase
  function addItem(e) {
    e.preventDefault();
    if (itemName.value == "" || itemNormalPrice.value == "" || itemOfferPrice.value == "") {
      infoMessage.textContent = "Fields cant be empty";
      infoMessage.style.visibility = 'visible';
      infoMessage.style.opacity = '1';
      infoMessage.style.height = 'auto';
      addItemSubmitButton.style.outline = 'none';


      setTimeout(function () {
        infoMessage.textContent = "";
        infoMessage.style.visibility = 'hidden';
        infoMessage.style.opacity = '0';
        infoMessage.style.height = '0';


      }, 3000);
    }
    const editItemName = itemName.value;
    if (editToggler) {
      db.collection('items').doc(editItemId).set({
        item_name: itemName.value,
        item_normal_price: itemNormalPrice.value,
        item_offer_price: itemOfferPrice.value
      }).then(function () {
        hideForm();
        swal(`Edited successfully!`);

      }).catch(function (error) {
        console.log("error: ", error);
      });

    } else {
      db.collection('items').add({
        item_name: itemName.value,
        item_normal_price: itemNormalPrice.value,
        item_offer_price: itemOfferPrice.value
      }).then(function () {
        itemName.value = "";
        itemNormalPrice.value = "";
        itemOfferPrice.value = "";

        swal(`${editItemName} Added Successfully!`);


      }).catch(function (error) {
        console.log("error: ", error);
      });
    }

  }



  // Render Items
  function renderItems(doc) {
    itemCounter++;
    const td = `<td>${itemCounter}</td>
        <td>${doc.data().item_name}</td>
        <td>${doc.data().item_normal_price}</td>
        <td>${doc.data().item_offer_price}</td>
        <td><i class="fas fa-edit"></i><i class="fas fa-trash-alt"></i></td>`;
    const tr = document.createElement('tr');
    tr.setAttribute('data-table-id', itemCounter);
    // tr.setAttribute('data-item-id', doc.id);
    // tr.setAttribute('data-item-name', doc.data().item_name);
    // tr.setAttribute('data-item-normal-price', doc.data().item_normal_price);
    // tr.setAttribute('data-item-offer-price', doc.data().item_offer_price);
    setDataAttributes(tr, doc);
    tr.innerHTML = td;
    tbody.appendChild(tr);
    itemsTable.style.opacity = '1';
    itemsTable.style.visibility = 'visible';

  }

  // Set <tr> Data Attributes
  function setDataAttributes(tr, doc) {
    tr.setAttribute('data-item-id', doc.id);
    tr.setAttribute('data-item-name', doc.data().item_name);
    tr.setAttribute('data-item-normal-price', doc.data().item_normal_price);
    tr.setAttribute('data-item-offer-price', doc.data().item_offer_price);

  }


  // Show Edited Item
  function showEditedItem(doc) {
    const tr = document.querySelector("[data-item-id=" + "'" + editItemId + "'" + "]");
    console.log(tr);
    const tableId = tr.getAttribute('data-table-id');
    const td = `<td>${tableId}</td>
        <td>${doc.data().item_name}</td>
        <td>${doc.data().item_normal_price}</td>
        <td>${doc.data().item_offer_price}</td>
        <td><i class="fas fa-edit"></i><i class="fas fa-trash-alt"></i></td>`;
    setDataAttributes(tr, doc);
    tr.innerHTML = td;

  }

  // Listen For Changes
  db.collection('items').onSnapshot(function (docSnapshot) {
    const changes = docSnapshot.docChanges();
    if (changes.length === 0) {
      itemsTable.style.opacity = '0';
      itemsTable.style.visibility = 'hidden';
    }
    changes.forEach((change) => {
      // console.log(change.doc);
      // console.log(change.doc.data());
      if (change.type == 'added') {
        renderItems(change.doc);
      } else if (change.type == 'removed') {
        // attribute values or id,classnames cant be start with a number so we append "'" to them
        const tr = document.querySelector("[data-item-id=" + "'" + change.doc.id + "'" + ']');

        tbody.removeChild(tr);
      } else if (change.type == 'modified') {
        showEditedItem(change.doc);
      }
    })
  })

  // Edit Item
  function editItem(e) {
    editToggler = true;
    const dataItemName = e.target.parentElement.parentElement.getAttribute('data-item-name');
    const dataItemId = e.target.parentElement.parentElement.getAttribute('data-item-id');
    if (e.target.classList.contains('fa-edit')) {
      console.log("edit item called form show");
      editToggler = true;
      showForm();
      editItemId = dataItemId;
      // console.log(editItemId);
      itemName.value = dataItemName;
      itemNormalPrice.value = e.target.parentElement.parentElement.getAttribute('data-item-normal-price');
      itemOfferPrice.value = e.target.parentElement.parentElement.getAttribute('data-item-offer-price');
    } else if (e.target.classList.contains('fa-trash-alt')) {
      console.log("delete item called form show");
      swal("hello world");
      swal({
          title: "Confirm?",
          text: `Are you sure you want to delete ${dataItemName}?`,
          icon: "warning",
          buttons: true,
          dangerMode: true,
        })
        .then((willDelete) => {
          if (willDelete) {
            db.collection('items').doc(dataItemId).delete().then(function () {
              swal(`${dataItemName} was removed`, {
                icon: "success",
              });

              syncTableId(e);

            })
          } else {
            swal(`${dataItemName} is safe!`);

          }
        }).catch(function (error) {
          console.log("Error:", error);
          swal("Unsuccessful!", "We couldnt delete the item!", "error");
        });
      // console.log(editItemId);
      // db.collection('items').doc(deleteItemId).delete();
    }
  }

  // Sync Table Id after delete item
  function syncTableId(e) {
    itemCounter--;
    const dataTableId = e.target.parentElement.parentElement.getAttribute('data-table-id');
    let trs = document.querySelectorAll('tbody tr');
    trs.forEach(function (tr) {
      if (tr.getAttribute('data-table-id') > dataTableId) {
        const currentTableId = tr.getAttribute('data-table-id');
        const tds = tr.querySelectorAll('td');
        tds[0].textContent = currentTableId - 1;
        tr.setAttribute('data-table-id', currentTableId - 1);
      }
    });


  }