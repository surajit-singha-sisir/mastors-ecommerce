print = console.log;
// ARROW
function arrowpos(x) {
  const icon = x.querySelector("img");
  icon.classList.toggle("arrowposimg");

  // ZIP UNZIP
  function zipunzip() {
    const navwidth = document.getElementById("enavigator");
    navwidth.classList.toggle("navwidth");

    hideMenuText();
  }
  zipunzip();
}

// HIDE MENU TEXT
function hideMenuText() {
  // HIDE COMPANY LOGO
  const logo = document.getElementById("companylogo");
  logo.querySelector("#companyname").classList.toggle("hideImp");

  // HIDE NO SUBCAT NAME
  const nosubcat = document.querySelectorAll(".nosubcat p");
  nosubcat.forEach((p) => p.classList.toggle("hide"));
  // CAT ICON CENTER
  const nosubcaticon = document.querySelectorAll(".nosubcat .ecat");
  nosubcaticon.forEach((m) => m.classList.toggle("nosubcaticon"));

  // HIDE MAIN CAT NAME
  const menu = document.querySelectorAll(".maincatname p");
  menu.forEach((p) => p.classList.toggle("hide"));

  // HIDE CHEVRON
  const chevron = document.querySelectorAll(".ecatnoclick .chevron");
  chevron.forEach((c) => c.classList.toggle("hide"));

  // CAT ICON CENTER
  const mecatnoclick = document.querySelectorAll(
    ".esubcats .ecatnoclick .maincatname"
  );
  mecatnoclick.forEach((m) => m.classList.toggle("mecatnoclick"));
  //   CAT ICON INCREASE
  const catIconInc = document.querySelectorAll(
    ".esubcats .ecatnoclick .maincatname div:nth-child(1)"
  );
  catIconInc.forEach((m) => m.classList.toggle("caticonInc"));

  //   SUBCAT HIDE
  const subcats = document.querySelectorAll(".esubcats ul");
  subcats.forEach((subcats) => subcats.classList.toggle("hide"));
}

// function absSubMenus() {
//   const mainDiv = document.querySelectorAll(".esubcats");

//   mainDiv.forEach((cat) => {
//     const category = cat.querySelector(".ecatnoclick");
//     const catBlock = cat.querySelector(".ulsubcates");

//     cat.onclick = () => {
//       print(category, catBlock);
//     };
//   });
// }
// window.addEventListener("DOMContentLoaded", () => {
//   absSubMenus();
// });

// SEARCH FUNCTION
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.querySelector(".searchcat input");
  const navItems = document.querySelectorAll("#ecom-navs li");
  const subCategories = document.querySelectorAll("#ecom-navs .esubcats");

  searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.toLowerCase();

    // Loop through all nav items
    navItems.forEach((item) => {
      const text = item.textContent.toLowerCase();
      const parent = item.closest(".esubcats");

      if (text.includes(searchTerm)) {
        // Show item and its parent category if applicable
        item.style.display = "";
        if (parent) parent.style.display = "";
      } else {
        // Hide item if it doesn't match the search term
        item.style.display = "none";
      }
    });

    // Hide empty subcategories
    subCategories.forEach((subCat) => {
      const visibleItems = subCat.querySelectorAll(
        'li:not([style*="display: none"])'
      );
      subCat.style.display = visibleItems.length > 0 ? "" : "none";
    });
  });

  // Clear search input on Esc key press
  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      searchInput.value = ""; // Clear the search input
      navItems.forEach((item) => (item.style.display = "")); // Show all items
      subCategories.forEach((subCat) => (subCat.style.display = "")); // Show all subcategories
    }
  });
});

// DROP DOWN
document.addEventListener("DOMContentLoaded", () => {
  const toggleButtons = document.querySelectorAll(".ecatnoclick");
  const allSubmenus = document.querySelectorAll(".ulsubcates");
  const chevronIcons = document.querySelectorAll(".chevron");

  toggleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const submenu = button.nextElementSibling; // Target the submenu <ul>
      const chevron = button.querySelector(".chevron"); // Target the chevron icon
      const isExpanded =
        submenu.style.maxHeight && submenu.style.maxHeight !== "0px";

      // Collapse all submenus and reset chevron classes
      allSubmenus.forEach((menu) => {
        menu.style.transition = "max-height 0.3s ease";
        menu.style.maxHeight = "0";
      });
      chevronIcons.forEach((icon) => {
        icon.classList.remove("chevronrotate");
      });

      if (!isExpanded) {
        // Expand the clicked submenu and rotate its chevron
        submenu.style.transition = "max-height 0.3s ease";
        submenu.style.maxHeight = submenu.scrollHeight + "px";
        chevron.classList.add("chevronrotate");
      }
    });
  });

  // Initialize all submenus as collapsed and reset chevrons
  allSubmenus.forEach((submenu) => {
    submenu.style.maxHeight = "0";
    submenu.style.overflow = "hidden"; // Prevent content overflow during animation
  });
  chevronIcons.forEach((icon) => {
    icon.classList.add("chevron"); // Ensure the default class is chevron
  });
});
