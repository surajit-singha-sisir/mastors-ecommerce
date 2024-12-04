print = console.log;
window.addEventListener("load", () => {
  attribute();
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
  const list = [];
  const attributeValues = document.getElementById("attributeValues");

  // CHECK SELECTED ITEM
  attris.forEach((attr) => {
    list.push(attr.textContent.trim());

    attr.addEventListener("click", () => {
      attrInp.setAttribute("data-target", attr.textContent.trim());
      selectedItem = attr.textContent.trim();

      const json = jsonKeysAndValues[0];
      const jsonKeys = Object.keys(json);

      // ATTRIBUTE VALUES
      attributeValues.innerHTML = "";
      function values() {
        jsonKeys.forEach((key, index) => {
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
                        <td><input type="number" name="${valueText}" id="${valueText}" placeholder="Qty"></td>
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
