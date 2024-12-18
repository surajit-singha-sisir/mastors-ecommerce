import { showToast } from "https://surajit-singha-sisir.github.io/mastorsCDN/mastors.js";

window.addEventListener("load", () => {
  addAttributeBtn();
  deleteTableRowInDeleteButton();
  // addNewAttributeValue();
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

        // Append dynamic <li> elements
        keys.forEach((key) => {
          const createLi = document.createElement("li");
          createLi.classList.add("combo-option");
          createLi.textContent = key;
          attributeSelect.appendChild(createLi);
        });

        // Append newValueAssigningOptions
        const newValueAssigningOptions = document.getElementById(
          "newValueAssigningOptions"
        );
        keys.forEach((key) => {
          newValueAssigningOptions.innerHTML += `
                <li class="combo-option valueAddingOptions">${key}</li>
              `;
        });

        // Call the `attribute` function after dynamically appending <li>
        attribute();
        addNewAttributeValue();
      }
    };

    xhr.open("GET", url, true);
    xhr.send();
  }
  loadAttribute();
});

function attribute() {
  const attris = document.querySelectorAll(".attributeSelect li");
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

    const attList = Object.keys(jsonKeysAndValues[0]);
    options.forEach((option, i) => {
      option.addEventListener("click", () => {
        // Update the data-target when an option is clicked
        inputAttr.setAttribute("data-target", option.textContent.trim());

        // Check if selectedItem contains a valid value (not empty, undefined, or null)
        const selectedItem = inputAttr.getAttribute("data-target");

        if (selectedItem === attList[i]) {
          const valueList = Object.values(jsonKeysAndValues[0][selectedItem]);

          // CHECK IF SELECTED VALUE IS ALREADY IN THE LIST
          AttValue.addEventListener("change", () => {
            if (selectedItem && selectedItem !== "" && AttValue.value !== "") {
              const valueMatched = valueList.includes(AttValue.value);

              if (valueMatched) {
                showToast("This Value is already in the list", "error");
              } else {
                runXHR(selectedItem);
                showToast(
                  `${AttValue.value} has been added successfully`,
                  "success"
                );
              }
            }
          });
        }
      });
    });
  }
  options();

  function runXHR(selectedItem) {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "https://jsonplaceholder.typicode.com/posts", true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onreadystatechange = () => {
      // IF XHR SUCCESSFUL
      if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 201) {
        showToast(`Successfully Added ${selectedItem}`, "success");

        // SHOW IN THE VALUE LIST
        const attributeValues = document.getElementById("attributeValues");
        const valueId = AttValue.value.replace(/\s/g, "");
        const html = `<div class="checkbox"><input type="checkbox" id="${valueId}" value="${AttValue.value}"><label for="${valueId}">${AttValue.value}</label></div>`;
        attributeValues.innerHTML += html;
      }
    };

    addNewAttributeValue.addEventListener("click", () => {
      const AttValue = document.getElementById("attributeValueOption").value;

      if (selectedItem && AttValue) {
        const data = JSON.stringify({
          attribute: selectedItem,
          value: AttValue,
        });

        // SEND TO SERVER
        xhr.send(data);
      } else {
        console.log("Selected item or attribute value is missing.");
      }
    });
  }
}

class addTags {
  tags() {
    const tagContainer = document.getElementById("e-tags");
    const inputBox = tagContainer.querySelector(".e-addTagInput");
    const eTagList = tagContainer.querySelector(".e-tag-list");

    inputBox.addEventListener("keydown", (event) => {
      if (event.key === "Tab" || event.key === "Enter" || event.key === ",") {
        event.preventDefault();
        const tagValue = inputBox.value.trim();

        if (tagValue) {
          // CHECK DUPLICATION
          if (this.tagChecker(tagValue, eTagList)) {
            showToast("Tag already exists", "error");
            return;
          }
          // CHECK SPECIAL CHARACTERS
          else if (this.specialChars(tagValue)) {
            showToast("Tag contains special characters", "error");
            return;
          }
          // CHECK MINIMUM 3 CHARACTER INPUTVALUE
          else if (tagValue.length < 3) {
            showToast("Tag must be at least 3 characters long", "error");
            return;
          }

          // ADD LI
          const li = `<li>
                          <p>${tagValue}</p>
                          <i class="m-m-cross"></i>
                      </li>`;
          eTagList.innerHTML += li;

          // EMPTY INPUT BOX
          inputBox.value = "";
        }
      }
    });

    // TAG DELETE (Event Delegation) [FOR DYNAMIC DATA]
    eTagList.addEventListener("click", (event) => {
      if (event.target.classList.contains("m-m-cross")) {
        event.target.parentElement.remove();
      }
      // CHECK TAGS NOT EMPTY
      if (eTagList.childElementCount < 1) {
        showToast("You must add minimum 5 tags", "warning");
      }
    });

    // DOUBLE CLICK TO EDIT TAG
    eTagList.addEventListener("dblclick", (e) => {
      inputBox.value = e.target.textContent;
      // REMOVE LI
      e.target.parentElement.remove();
      // CHECK TAGS NOT EMPTY
      if (eTagList.childElementCount < 1) {
        showToast("You must add minimum 5 tags", "warning");
      }
    });
  }

  // CHECK DUPLICATION
  tagChecker(tagValue, eTagList) {
    const tagList = Array.from(eTagList.querySelectorAll("li p"));
    return tagList.some(
      (tag) => tag.textContent.trim().toLowerCase() === tagValue.toLowerCase()
    );
  }

  // CHECK SPECIAL CHARACTERS
  specialChars(tagValue) {
    const specialChars = /[^a-zA-Z0-9\s]/;
    return specialChars.test(tagValue.toLowerCase());
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const tag = new addTags();
  tag.tags();
});

// TOAST MESSAGE FUNCTION : "success" , "error" , "info" , "warning"
