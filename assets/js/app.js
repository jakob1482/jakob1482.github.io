var {
  OverlayScrollbars,
  ScrollbarsHidingPlugin,
  SizeObserverPlugin,
  ClickScrollPlugin,
} = OverlayScrollbarsGlobal;
const $easeInOut = $.bez([0.4, 0, 0.2, 1]);

// Timers
var resizeTimerIsotope;
var resizeTimerModal;
var toggleTimerTheme;

// Custom events.
const eventToggleTheme = new Event("toggle-theme");
const eventToggleTarget = new Event("toggle-target");
const eventModalClose = new Event("modal-close");

/**
 * Initializes the scrollbar and sets the theme based on the user's preference.
 *
 * @param {HTMLElement} element - The element to initialize the scrollbar on.
 * @returns {OverlayScrollbars} - The initialized OverlayScrollbars instance.
 */
function initScrollbar(element) {
  return OverlayScrollbars(element, {
    scrollbars: {
      theme: localStorage.theme === "dark" ? "os-theme-light" : "os-theme-dark",
      autoHide: "leave",
      autoHideDelay: 500,
      autoHideEasing: "ease",
      clickScrolling: true,
      dragScrolling: true,
      touchSupport: true,
      snapHandle: true,
    },
  });
}

/**
 * Initializes the DOMContentLoaded event listener.
 */
$(function () {
  // Initialize OverlayScrollbars in the body element.
  var scrollbar = initScrollbar(document.body);

  if (typeof $grid !== "undefined" && typeof $items !== "undefined") {
    /**
     * Event handler for filtering skills in the Isotope grid.
     * Applies the selected filter to the grid and updates the UI elements.
     * Temporarily sets the data-arrange-completed attribute to false to prevent 'jumping' animations.
     */
    $("ul[role='filterlist']").on("click", "li[role='filter']", function () {
      // Get the filter value from the clicked element.
      let filterValue = $(this).attr("data-filter");

      // Set the data-arrange-completed attribute to false to prevent 'jumping' animations.
      $items.attr("data-arrange-completed", false);

      // Filter the grid while applying a transition
      $grid.isotope({ filter: filterValue });
      $(this).siblings().attr("aria-selected", false);
      $(this).attr("aria-selected", true);

      // Set the data-arrange-completed attribute to true after the transition is complete.
      clearTimeout(resizeTimerIsotope);
      resizeTimerIsotope = setTimeout(
        function () {
          $items.attr("data-arrange-completed", true);
        },
        $("[data-isotope-container]").data("isotope").options[
          "transitionDuration"
        ] + 50,
      );
    });

    /**
     * Event handler for window resize event.
     * Temporarily removes the transition duration, triggers the layout of the grid, and then restores the transition duration.
     */
    $(window).on("resize", function () {
      $grid.isotope({ transitionDuration: 0 });
      $grid.isotope("layout");
      $grid.isotope({ transitionDuration: 400 });
    });
  }

  /**
   * Event handler for the click event on elements with the role "switch".
   * Triggers the event specified by the data-trigger-event attribute.
   *
   * @param {Event} e - The click event object.
   */
  $("[role='switch']").on("click keydown", function (e) {
    if (e.type === "click" || e.key === "Enter" || e.which === 13) {
      let triggerEvent = $(this).attr("data-trigger-event");
      $(this).trigger(triggerEvent);
    }
  });

  /**
   * Toggles the theme between light and dark mode.
   * Changes the theme in localStorage, updates the UI elements, and applies the new theme to the scrollbar.
   * Disables transitions to ensure instant theme change, then enables transitions after the theme change.
   * If the window width is less than 550px, triggers a click event on the navbar toggle to close the navbar.
   */
  $("[role='switch']").on("toggle-theme", function () {
    // Disables transitions to ensure instant theme change.
    $("html").addClass("no-transition");

    // Changes the theme in localStorage.
    let themeIsDark = localStorage.theme === "dark";
    if (themeIsDark) {
      $("html").removeClass("dark");
      localStorage.theme = "light";
    } else {
      $("html").addClass("dark");
      localStorage.theme = "dark";
    }

    // Updates the UI elements.
    $(this).attr("aria-checked", !themeIsDark);

    // Changes the scrollbar theme.
    let currentScrollbarTheme = themeIsDark
      ? "os-theme-light"
      : "os-theme-dark";
    let newScrollbarTheme = themeIsDark ? "os-theme-dark" : "os-theme-light";
    $("." + currentScrollbarTheme).each(function () {
      $(this).removeClass(currentScrollbarTheme).addClass(newScrollbarTheme);
    });

    // Enables transitions after the theme change.
    setTimeout(function () {
      $("html").removeClass("no-transition");
      if (window.innerWidth < 550) {
        $("#navbar-toggle").trigger("click");
      }
    }, 200);
  });

  /**
   * Toggles the target element based on the state of the switch.
   * If the switch is checked, shows the target element, otherwise hides it.
   */
  $("[role='switch']").on("toggle-target", function () {
    let targetId = "#" + $(this).attr("aria-controls");
    let target = $(targetId);
    $(this).attr("aria-checked", $(this).attr("aria-checked") !== "true");
    $(this).attr("aria-checked") === "true" ? target.show() : target.hide();
  });

  /**
   * Toggles the aria-expanded attribute of the navbar header based on the state of the navbar toggle.
   * If the navbar toggle is expanded, sets the aria-expanded attribute to "true", otherwise sets it to "false".
   */
  $("[role='navbar-toggle'][aria-controls]").on("click", function () {
    let targetId = "#" + $(this).attr("aria-controls");
    let isExpanded = $(this).attr("aria-expanded") === "true";
    $(this).attr("aria-expanded", !isExpanded);
    $(this).closest("header").attr("aria-expanded", !isExpanded);
    $(targetId).toggle(400, $.bez([0.4, 0, 0.2, 1]));
  });

  /**
   * Handles the click event on elements with the role "tab-tabs" and attribute "aria-controls".
   * Updates the active tab content and navigation state based on the clicked element.
   */
  $("[role='sidenav-toggle'][aria-controls]").on("click", function () {
    let targetId = "#" + $(this).attr("aria-controls");
    let isExpanded = $(this).attr("aria-expanded") === "true";
    $(targetId).fadeToggle(400, $easeInOut);
    $(this).attr("aria-expanded", !isExpanded);
    $(this).closest("nav").attr("aria-expanded", !isExpanded);
  });

  /**
   * Handles the click event on elements with the role "tab-tabs" and attribute "aria-controls".
   * Updates the active tab content and navigation state based on the clicked element.
   */
  $("[role='tablist-toggle'][aria-controls]").on("click", function () {
    let targetId = "#" + $(this).attr("aria-controls");
    let isExpanded = $(this).attr("aria-expanded") === "true";
    $(targetId)
      .fadeToggle(400, $easeInOut)
      .css("height", isExpanded ? "0" : $(targetId).attr("data-toggle-height"));
    $(this).attr("aria-expanded", !isExpanded);
  });

  /**
   * Handles the click event on elements with the role "tab" and attribute "aria-controls".
   * Updates the active tab content and navigation state based on the clicked element.
   */
  $("[role='tab'][aria-controls]").on("click", function () {
    // Find the target ID
    let activeTabs = $(this).closest("nav").find("[aria-selected='true']");
    let targetId = "#" + $(this).attr("aria-controls");

    // First, fade out all tab contents
    activeTabs.each(function () {
      let activeId = "#" + $(this).attr("aria-controls");
      if (activeId !== targetId) {
        // Fade out the current active tab content
        $(activeId).attr("aria-selected", false);
        // Fade in the target content section
        $(targetId).attr("aria-selected", true);
      }
    });

    // Update active state for nav items within the same sidebar
    activeTabs.attr("aria-selected", false);
    $(this).attr("aria-selected", true);
  });

  /**
   * Handles the click event for elements with the role "modal-open" and the attribute "aria-controls".
   * Opens the modal specified by the value of the aria-controls attribute.
   */
  $("[role='modal-open'][aria-controls]").on("click", function () {
    let targetId = "#" + $(this).attr("aria-controls");
    document.querySelector(targetId).showModal();
    $(targetId).attr("aria-modal", true).attr("aria-hidden", false);
    $(window).trigger("resize");
  });

  /**
   * Handles the click event for elements with the role "modal-close" and the attribute "aria-controls".
   * Closes the modal and updates the accessibility attributes.
   */
  $("[role='modal-close'][aria-controls]").on("click", function () {
    let targetId = "#" + $(this).attr("aria-controls");
    $(targetId).trigger("modal-close");
  });

  /**
   * Handles the click event on elements with the role "modal".
   * Closes the corresponding modal and updates the attributes.
   */
  $("[role='modal']").on("click", function () {
    let targetId = "#" + $(this).prop("id");
    $(this).trigger("modal-close");
  });

  /**
   * Handles the click event on elements with the role "modal".
   * Closes the corresponding modal and updates the attributes.
   */
  $("[role='modal']").on("keydown", function (e) {
    e.preventDefault();
    let targetId = "#" + $(this).prop("id");
    if (e.key == "Escape") {
      $(this).trigger("modal-close");
    }
  });

  /**
   * Handles the close event on elements with the role "modal".
   * Updates the accessibility attributes.
   */
  $("[role='modal']").on("modal-close", function (e) {
    let id = "#" + $(this).prop("id");
    $(this)
      .attr("aria-modal", false)
      .attr("aria-hidden", true)
      .attr("tabindex", -1);
    setTimeout(function () {
      document.querySelector(id).close();
    }, 300);
  });

  /**
   * Handles the click event on elements with the role "modal-content".
   * Prevents the click event from propagating further up the DOM tree, ensuring that the modal does not close when the content is clicked.
   *
   * @param {Event} e - The click event object.
   */
  $("[role='modal-content']").on("click", function (e) {
    e.stopPropagation();
  });

  /**
   * Event handler for window resize event.
   * It adds a class to the modal content element to disable transitions temporarily,
   * clears the resize timer, and then removes the class after a short delay.
   */
  $(window).on("resize", function () {
    let modal = $("[open][aria-modal='true']");
    let modalContent = modal.find("[role='modal-content'");
    modalContent.addClass("no-transition");

    clearTimeout(resizeTimerModal);
    resizeTimerModal = setTimeout(function () {
      modalContent.removeClass("no-transition");
    }, 50);
  });

  // Trigger window resize event 100 milliseconds after the DOMContentLoaded event is triggered
  setTimeout(function () {
    $(window).trigger("resize");
  }, 100);
});
