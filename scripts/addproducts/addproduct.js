print = console.log;
window.addEventListener("load", () => {
  attribute();
  addAttributeBtn();
  deleteTableRowInDeleteButton();
  addNewAttributeValue();
});

let jsonKeysAndValues = [];

document.addEventListener("DOMContentLoaded", function () {
  const attributeSelect = document.getElementById("attributeSelect");
  const xhr = new XMLHttpRequest();
  const url = "../JSON/attribute.json";

  // LOAD ATTRIBUTES
  function loadAttribute() {
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4 && xhr.status == 200) {
        const data = JSON.parse(xhr.responseText);
        jsonKeysAndValues.push(data);
        const keys = Object.keys(data);

        keys.forEach((key) => {
          const createLi = document.createElement("li");
          createLi.classList.add("combo-option");
          createLi.textContent = key;
          attributeSelect.appendChild(createLi);
        });

        const noData = document.createElement("li");
        noData.classList.add("no-data");
        noData.textContent = "No Data Found";
        attributeSelect.appendChild(noData);
        noData.style.display = "none";

        keys.forEach((key) => {
          // SHOW ALL ATTRIBUTES FROM THE STORED JSON
          const newValueAssigningOptions = document.getElementById(
            "newValueAssigningOptions"
          );
          newValueAssigningOptions.innerHTML += `
                <li class="combo-option valueAddingOptions">${key}</li>
              `;
        });
      }
    };

    xhr.open("GET", url, true);
    xhr.send();
  }
  loadAttribute();
});

function attribute() {
  const attris = document.querySelectorAll("#attributeSelect li");
  const attrInp = document.getElementById("attrInp");
  let selectedItem = attrInp.getAttribute("data-target");
  const attributeValues = document.getElementById("attributeValues");

  // CHECK SELECTED ITEM
  attris.forEach((attr) => {
    attr.addEventListener("click", () => {
      attrInp.setAttribute("data-target", attr.textContent.trim());
      selectedItem = attr.textContent.trim();

      const json = jsonKeysAndValues[0];
      const jsonKeys = Object.keys(json);

      // ATTRIBUTE VALUES
      attributeValues.innerHTML = "";
      function values() {
        jsonKeys.forEach((key) => {
          if (key === selectedItem) {
            const values = json[key];

            values.forEach((value) => {
              const valueId = value.replace(/\s/g, "");
              const html = `<div class="checkbox"><input type="checkbox" id="${valueId}" value="${value}"><label for="${valueId}">${value}</label></div>`;
              attributeValues.innerHTML += html;
            });
          }
        });
      }
      values();

      // RESET CHECKED CHECKBOXES
      const attributeSection = document.getElementById("attributeSection");
      const checkboxes = attributeValues.querySelectorAll(
        ".checkbox input[type=checkbox]"
      );
      const sellingPriceInput = document.getElementById("productSellingPrice");
      const discountPriceInput = document.getElementById(
        "productDiscountPrice"
      );
      const currencySelect = document.getElementById("productPricingCurrency");
      const attributeTable = document.querySelector(".attributeTable tbody");

      // PRICE CALCULATION FUNCTION
      function calculatePrice() {
        const sellingPrice =
          parseFloat(sellingPriceInput.value.replace(/\s+/g, "")) || 0;
        const discountPrice =
          parseFloat(discountPriceInput.value.replace(/\s+/g, "")) || 0;

        return discountPrice > 0 ? discountPrice : sellingPrice;
      }

      // UPDATE ROW PRICES FUNCTION
      function updateRowPrices() {
        const currentSelect = currencySelect.value.replace(/\s+/g, "");
        const newPrice = calculatePrice();

        const rows = attributeTable.querySelectorAll("tr");
        rows.forEach((row) => {
          const priceButton = row.querySelector(".btn1");
          if (priceButton) {
            priceButton.setAttribute("targer-price", newPrice);
            priceButton.textContent = `${currentSelect} ${newPrice}`;
          }
        });
      }

      // CLICK CHECKBOX
      checkboxes.forEach((checkbox) => {
        checkbox.addEventListener("change", () => {
          const value = checkbox.value;
          const valueText = value.replace(/\s/g, "");

          if (checkbox.checked) {
            // ADD THE ATTRUBUTE CAT NAME ON TH
            const attributeCat = document.getElementById("attributeCat");
            attributeCat.textContent = selectedItem;

            // NOT ACCEPT IF PRICE IS NIL
            const newPrice = calculatePrice();
            if (newPrice <= 0) {
              showToast("Please Add Prices", "warning");
              setTimeout(() => {
                checkbox.checked = false;
              }, 500);
            } else {
              attributeSection.classList.remove("hide");

              // ADD ROW WITH UNIQUE IDENTIFIER
              const html = `<tr data-value="${valueText}">
                        <td>${value}</td>
                        <td><input type="number" class="tableQty" name="${valueText}" id="${valueText}" min="1" placeholder="Qty"></td>
                        <td><button class="btn1" targer-price="${newPrice}">${currencySelect.value} ${newPrice}</button></td>
                        <td class="attrDeleteBtn"><img class="img-h-res" src="../resources/icons/delete.svg"></td>
                      </tr>`;
              attributeTable.innerHTML += html;
            }
          } else {
            // DELETE ROW
            const rowToRemove = document.querySelector(
              `tr[data-value="${valueText}"]`
            );
            if (rowToRemove) {
              rowToRemove.remove();
            }

            // HIDE ATTRIBUTE SECTION IF NO CHECKBOXES ARE CHECKED
            const anyChecked = Array.from(checkboxes).some((cb) => cb.checked);
            if (!anyChecked) {
              attributeSection.classList.add("hide");
              showToast("You must select at least one", "error");
            }
          }

          // QUANTITY CHECKER
          const stocks = document.getElementById("addProductTotalStock");
          const totalStock = parseInt(stocks.value.trim());
          function stockChecker() {
            const qtys = document.querySelectorAll(".tableQty");

            qtys.forEach((qty) => {
              qty.addEventListener("change", () => {
                let allQty = 0;

                // TOTAL STOCK REMAIN REQUIRED DURING CHANGES
                stocks.disabled = true;

                qtys.forEach((input) => {
                  allQty += parseFloat(input.value) || 0;
                });

                if (allQty < totalStock) {
                  showToast(
                    `Add More ${totalStock - allQty} pieces in Attribute`,
                    "info"
                  );
                } else if (allQty === totalStock) {
                  showToast(
                    `Stock and Quantities are Equal. Thanks`,
                    "success"
                  );

                  // TOTAL STOCK CAN CHANGE NOW
                  stocks.disabled = false;
                } else {
                  showToast(
                    `Stock is Exceeded. Reduce: ${allQty - totalStock} pieces`,
                    "warning"
                  );
                }
              });
            });
          }

          if (!isNaN(totalStock) && totalStock > 0) {
            stockChecker();
          } else {
            showToast(
              "Please enter a valid Total Stock greater than 1",
              "error"
            );
          }
        });
      });

      // EVENT LISTENERS FOR PRICE AND CURRENCY CHANGES
      [sellingPriceInput, discountPriceInput, currencySelect].forEach(
        (input) => {
          input.addEventListener("input", updateRowPrices);
        }
      );
    });
  });
}


function deleteTableRowInDeleteButton() {
  const attributeTable = document.querySelector(".attributeTable tbody");
  const attributeValues = document.getElementById("attributeValues");

  // Delegate event listener to tbody for handling dynamic rows
  attributeTable.addEventListener("click", function (e) {
    // Check if the clicked element is inside an attrDeleteBtn cell
    if (e.target.closest(".attrDeleteBtn")) {
      const rowToRemove = e.target.closest("tr"); // Find the closest row
      if (rowToRemove) {
        const value = rowToRemove.getAttribute("data-value"); // Get the data-value attribute from the row

        // Uncheck the associated checkbox
        const associatedCheckbox = attributeValues.querySelector(
          `.checkbox input[value="${value}"]`
        );
        if (associatedCheckbox) {
          associatedCheckbox.checked = false;
        }

        // Remove the row
        rowToRemove.remove();

        // Check if any rows remain in the table
        if (attributeTable.querySelectorAll("tr").length === 0) {
          const attributeSection = document.getElementById("attributeSection");
          if (attributeSection) {
            attributeSection.classList.add("hide"); // Hide the attribute section if no rows remain
          }
          showToast("You must select at least one", "error"); // Display toast notification
        }
      }
    }
  });
}

function addAttributeBtn() {
  const thePlusIcon = document.getElementById("addAttributeBtn");
  thePlusIcon.onclick = function () {
    // SHOW THE ATTRIBUTES AND VALUES
    const newValueAssigning = document.getElementById("newValueAssigning");
    newValueAssigning.classList.toggle("hide");
  };
}

function addNewAttributeValue() {
  const inputAttr = document.getElementById("newValueAssigningInput");
  const addNewAttributeValue = document.getElementById("addNewAttributeValue");
  const AttValue = document.getElementById("attributeValueOption");

  function options() {
    const options = document.querySelectorAll(".valueAddingOptions");

    options.forEach((option) => {
      option.addEventListener("click", () => {
        // Update the data-target when an option is clicked
        inputAttr.setAttribute("data-target", option.textContent);

        // Check if selectedItem contains a valid value (not empty, undefined, or null)
        const selectedItem = inputAttr.getAttribute("data-target");

        AttValue.addEventListener("change", () => {
          if (selectedItem && selectedItem !== "" && AttValue.value !== "") {
            runXHR(selectedItem);
          }
        });
      });
    });
  }
  options();

  function runXHR(selectedItem) {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "https://jsonplaceholder.typicode.com/posts", true);
    xhr.setRequestHeader("Content-Type", "application/json");

    addNewAttributeValue.addEventListener("click", () => {
      const AttValue = document.getElementById("attributeValueOption").value;
      const data = JSON.stringify({
        attribute: selectedItem,
        value: AttValue,
      });
      // SEND TO SERVER
      xhr.send(data);
    });
  }
}

// TOAST MESSAGE FUNCTION
function showToast(message, type = "info") {
  const duration = 3000; // Fixed timeout duration in milliseconds

  // Create a container for the toast if it doesn't exist
  let toastContainer = document.getElementById("toastContainer");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toastContainer";
    toastContainer.style.position = "fixed";
    toastContainer.style.bottom = "20px";
    toastContainer.style.right = "20px";
    toastContainer.style.zIndex = "9999";
    toastContainer.style.display = "flex";
    toastContainer.style.flexDirection = "column";
    toastContainer.style.gap = "10px";
    document.body.appendChild(toastContainer);
  }

  // Create the toast element
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style.padding = "10px 20px";
  toast.style.color = "#fff";
  toast.style.borderRadius = "5px";
  toast.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
  toast.style.transition = "opacity 0.5s";
  toast.style.opacity = "1";

  // Set background color based on the type
  if (type === "success") {
    toast.style.backgroundColor = "green";
  } else if (type === "error") {
    toast.style.backgroundColor = "red";
  } else if (type === "warning") {
    toast.style.backgroundColor = "orange";
  } else {
    toast.style.backgroundColor = "blue";
  }

  // Append the toast to the container
  toastContainer.appendChild(toast);

  // Remove the toast after the fixed duration
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => {
      toast.remove();
    }, 500); // Wait for the fade-out transition to complete
  }, duration);
}
// "success" , "error" , "info" , "warning"
