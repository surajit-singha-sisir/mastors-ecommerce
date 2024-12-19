import { showToast } from "https://surajit-singha-sisir.github.io/mastorsCDN/mastors.js";

window.addEventListener("load", () => {
  addAttributeBtn();
  deleteTableRowInDeleteButton();
});

let jsonKeysAndValues = [];

const attributeSelect = document.getElementById("attributeSelect");
const xhr = new XMLHttpRequest();
const url = "../JSON/attribute.json";

// LOAD ATTRIBUTES
/**
 * Loads attributes from a server and dynamically updates the DOM with the received data.
 *
 * This function sends an asynchronous GET request to the specified URL. When the request
 * is complete and successful, it parses the JSON response and updates the DOM by appending
 * new <li> elements to the attribute selection list and the new value assigning options list.
 *
 * The function also calls `attribute` and `addNewAttributeValue` after updating the DOM.
 *
 * @function
 * @name loadAttribute
 * @global
 */
function loadAttribute() {
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
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
      newValueAssigningOptions.innerHTML = keys
        .map((key) => `<li class="combo-option valueAddingOptions">${key}</li>`)
        .join("");

      // Call the `attribute` function after dynamically appending <li>
      attribute();
      addNewAttributeValue();
    }
  };

  xhr.open("GET", url, true);
  xhr.send();
}

document.addEventListener("DOMContentLoaded", function () {
  addAttributeBtn();
  deleteTableRowInDeleteButton();
  loadAttribute();
});

function attribute() {
  const attris = document.querySelectorAll(".attributeSelect li");
  const attrInp = document.getElementById("attrInp");
  const attributeValues = document.getElementById("attributeValues");
  const attributeSection = document.getElementById("attributeSection");
  const sellingPriceInput = document.getElementById("productSellingPrice");
  const discountPriceInput = document.getElementById("productDiscountPrice");
  const currencySelect = document.getElementById("productPricingCurrency");
  const attributeTable = document.querySelector(".attributeTable tbody");
  const stocks = document.getElementById("addProductTotalStock");

  const calculatePrice = () => {
    const sellingPrice =
      parseFloat(sellingPriceInput.value.replace(/\s+/g, "")) || 0;
    const discountPrice =
      parseFloat(discountPriceInput.value.replace(/\s+/g, "")) || 0;
    return discountPrice > 0 ? discountPrice : sellingPrice;
  };

  const updateRowPrices = () => {
    const currentSelect = currencySelect.value.replace(/\s+/g, "");
    const newPrice = calculatePrice();
    attributeTable.querySelectorAll("tr").forEach((row) => {
      const priceButton = row.querySelector(".btn1");
      if (priceButton) {
        priceButton.setAttribute("targer-price", newPrice);
        priceButton.textContent = `${currentSelect} ${newPrice}`;
      }
    });
  };

  const stockChecker = () => {
    const qtys = document.querySelectorAll(".tableQty");
    qtys.forEach((qty) => {
      qty.addEventListener("change", () => {
        let allQty = 0;
        stocks.disabled = true;
        qtys.forEach((input) => {
          allQty += parseFloat(input.value) || 0;
        });
        if (allQty < parseInt(stocks.value.trim())) {
          showToast(
            `Add More ${
              parseInt(stocks.value.trim()) - allQty
            } pieces in Attribute`,
            "info"
          );
        } else if (allQty === parseInt(stocks.value.trim())) {
          showToast(`Stock and Quantities are Equal. Thanks`, "success");
          stocks.disabled = false;
        } else {
          showToast(
            `Stock is Exceeded. Reduce: ${
              allQty - parseInt(stocks.value.trim())
            } pieces`,
            "warning"
          );
        }
      });
    });
  };

  const handleCheckboxChange = (checkbox, _selectedItem) => {
    const value = checkbox.value;
    const valueText = value.replace(/\s/g, "");
    if (checkbox.checked) {
      const newPrice = calculatePrice();
      if (newPrice <= 0) {
        showToast("Please Add Prices", "warning");
        setTimeout(() => {
          checkbox.checked = false;
        }, 500);
      } else {
        attributeSection.classList.remove("hide");
        const html = `<tr data-value="${valueText}">
                        <td>${value}</td>
                        <td><input type="number" class="tableQty" name="${valueText}" id="${valueText}" min="1" placeholder="Qty"></td>
                        <td><button class="btn1" targer-price="${newPrice}">${currencySelect.value} ${newPrice}</button></td>
                        <td class="attrDeleteBtn"><img class="img-h-res" src="../resources/icons/delete.svg"></td>
                      </tr>`;
        attributeTable.innerHTML += html;
      }
    } else {
      const rowToRemove = document.querySelector(
        `tr[data-value="${valueText}"]`
      );
      if (rowToRemove) {
        rowToRemove.remove();
      }
      if (
        !Array.from(
          attributeValues.querySelectorAll(".checkbox input[type=checkbox]")
        ).some((cb) => cb.checked)
      ) {
        attributeSection.classList.add("hide");
        showToast("You must select at least one", "error");
      }
    }
    if (
      !isNaN(parseInt(stocks.value.trim())) &&
      parseInt(stocks.value.trim()) > 0
    ) {
      stockChecker();
    } else {
      showToast("Please enter a valid Total Stock greater than 1", "error");
    }
  };

  attris.forEach((attr) => {
    attr.addEventListener("click", () => {
      attrInp.setAttribute("data-target", attr.textContent.trim());
      const selectedItem = attr.textContent.trim();
      const json = jsonKeysAndValues[0];
      attributeValues.innerHTML = Object.keys(json)
        .filter((key) => key === selectedItem)
        .map((key) => {
          return json[key]
            .map((value) => {
              const valueId = value.replace(/\s/g, "");
              return `<div class="checkbox"><input type="checkbox" id="${valueId}" value="${value}"><label for="${valueId}">${value}</label></div>`;
            })
            .join("");
        })
        .join("");
      attributeValues
        .querySelectorAll(".checkbox input[type=checkbox]")
        .forEach((checkbox) => {
          checkbox.addEventListener("change", () =>
            handleCheckboxChange(checkbox, selectedItem)
          );
        });
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
      if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 201) {
        showToast(`Successfully Added ${selectedItem}`, "success");

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
      if (e.target.tagName === "P") {
        inputBox.value = e.target.textContent;
        // REMOVE LI
        e.target.parentElement.remove();
        // CHECK TAGS NOT EMPTY
        if (eTagList.childElementCount < 1) {
          showToast("You must add minimum 5 tags", "warning");
        }
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

class faqs {
  faq() {
    const faqPreview = document.getElementById("e-faq-preview");
    const allPreview = faqPreview.querySelector(".e-faq-preview-box");

    const inputContainer = document.getElementById("e-faqInputs");

    // GET FAQ INPUTS
    this.getFaqData(inputContainer, allPreview, faqPreview);
  }
  getFaqData(inputContainer, allPreview, faqPreview) {
    const question = inputContainer.querySelector("#e-questionInput");
    const answer = inputContainer.querySelector("#e-answerInput");

    inputContainer.querySelector("#faqAddBtn").addEventListener("click", () => {
      if (question.value && answer.value) {
        // Check for duplicate question
        const isDuplicate = Array.from(
          allPreview.querySelectorAll(".added-question")
        ).some(
          (q) =>
            q.textContent.trim().toLowerCase() ===
            question.value.trim().toLowerCase()
        );

        if (isDuplicate) {
          showToast("Duplicate Item", "error");
          return;
        }

        faqPreview.classList.remove("hide");

        // ADD FAQ TO FAQ PREVIEW
        const html = `
        <!-- FAQ-1 -->
        <span class="added-faq">
        <i class="e-faq-counter">${allPreview.children.length + 1}</i>
        <div class="e-faq-content">
        <h4 class="added-question">${question.value}</h4>
        <p class="added-answer">${answer.value}</p>
        </div>
        <i class="m-compose" title="Edit FAQ" target-title="Edit"></i>
        <i class="m-bin" title="Delete FAQ" target-title="Edit"></i>
        </span>`;
        allPreview.innerHTML += html;

        // Clear input fields
        question.value = "";
        answer.value = "";

        // Hide preview if no FAQs
        if (allPreview.children.length === 0) {
          faqPreview.classList.add("hide");
        }
      }
    });

    // Edit and Delete actions
    allPreview.addEventListener("click", (event) => {
      const target = event.target;
      const faqItem = target.closest(".added-faq");

      if (target.classList.contains("m-bin")) {
        // Delete FAQ
        faqItem.remove();
        showToast("FAQ Deleted", "success");

        // Update counter
        allPreview
          .querySelectorAll(".e-faq-counter")
          .forEach((counter, index) => {
            counter.textContent = index + 1;
          });

        // Hide preview if no FAQs
        if (allPreview.children.length === 0) {
          faqPreview.classList.add("hide");
        }
      } else if (target.classList.contains("m-compose")) {
        // Edit FAQ
        const questionElem = faqItem.querySelector(".added-question");
        const answerElem = faqItem.querySelector(".added-answer");

        question.value = questionElem.textContent;
        answer.value = answerElem.textContent;

        // Remove the current FAQ item
        faqItem.remove();

        // Update counter
        allPreview
          .querySelectorAll(".e-faq-counter")
          .forEach((counter, index) => {
            counter.textContent = index + 1;
          });

        // Hide preview if no FAQs
        if (allPreview.children.length === 0) {
          faqPreview.classList.add("hide");
        }
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const tag = new addTags();
  tag.tags();

  const faqData = new faqs();
  faqData.faq();
});

// TOAST MESSAGE FUNCTION : "success" , "error" , "info" , "warning"
