import Isotope from "isotope-layout";
import $ from "jquery";
import "jquery-bez";
import jQueryBridget from "jquery-bridget";
import { OverlayScrollbars } from "overlayscrollbars";
import "./main.scss";

// Make Isotope a jQuery plugin
jQueryBridget("isotope", Isotope, $);

// Timers
var resizeTimerIsotope;
var resizeTimerModal;
var toggleTimerTheme;

// Custom events.
const eventToggleTheme = new Event("toggle-theme");
const eventToggleTarget = new Event("toggle-target");
const eventModalClose = new Event("modal-close");

// Hashmaps for storing the OverlayScrollbars instances and related values.
const scrollbar = new Map();
const scrollY = new Map();

// Initial configuration for OverlayScrollbars.
const configOverlayScrollbars = {
  paddingAbsolute: false,
  showNativeOverlaidScrollbars: false,
  overflow: {
    x: "hidden",
    y: "scroll",
  },
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
};

// Ease transitions
const $easeInOut = $.bez([0.4, 0, 0.2, 1]);

// Initialize Isotope grid
const $grid = $("[data-isotope-container]").isotope({
  transitionDuration: 400,
  resize: false,
  itemSelector: "[data-isotope-item]",
  layoutMode: "fitRows",
  percentPosition: true,
  fitRows: {
    isFitWidth: true,
    columnWidth: "[data-isotope-item]",
    gutter: 12,
  },
});
const $items = $grid.find("[data-isotope-item]");

/**
 * Sets the height of the modal element based on the maximum height of the tabpanels and sidenav.
 *
 * @param {jQuery} $modal - The modal element.
 */
function setModalElementHeight($modal) {
  let maxHeight = 0;
  let $tabpanelContainer = $modal.find("[role='tabpanel-container']");
  let $tabpanel = $modal.find("[role='tabpanel']");
  let $sidenav = $modal.find("[role='sidenav-tablist']");
  // Find the maximum height of the tabpanels and the sidenav.
  $tabpanel.each(function () {
    $(this).css({
      visibility: "hidden !important",
      display: "block !important",
    });
    if ($(this).height() > maxHeight) {
      maxHeight = $(this).height();
    }
    $(this).css({
      visibility: "",
      display: "",
    });
  });
  let sidenavHeight = parseInt($sidenav.attr("data-expanded-height"));
  if ($(window).width() < 640) {
    sidenavHeight += 52;
  }
  if (sidenavHeight > maxHeight) {
    maxHeight = sidenavHeight;
  }
  // Limit the maximum height.
  maxHeight = Math.min(maxHeight, $(window).height() - 127);
  // Set the height of the tabpanel container and the sidenav.
  $tabpanelContainer.height(maxHeight);
  $sidenav.height($(window).width() < 640 ? maxHeight - 52 : maxHeight);
}

/**
 * Initializes the DOMContentLoaded event listener.
 */
$(function () {
  // Initialize OverlayScrollbars.
  scrollbar.set(
    "body",
    OverlayScrollbars(document.querySelector("body"), configOverlayScrollbars),
  );
  $("[role='modal']")
    .find("[data-overlayscrollbars-initialize]")
    .each(function () {
      scrollbar.set(
        $(this).prop("id"),
        OverlayScrollbars(this, configOverlayScrollbars),
      );
    });

  if (typeof $grid !== "undefined" && typeof $items !== "undefined") {
    /**
     * Event handler for filtering skills in the Isotope grid.
     * Applies the checked filter to the grid and updates the UI elements.
     * Temporarily sets the data-arrange-completed attribute to false to prevent 'jumping' animations.
     */
    $("ul[role='radiogroup']").on(
      "click",
      "li[role='radio'][aria-label^='filter']",
      function () {
        // Get the filter value from the clicked element.
        let filterValue = $(this).attr("data-filter");

        // Set the data-arrange-completed attribute to false to prevent 'jumping' animations.
        $items.attr("data-arrange-completed", false);

        // Filter the grid while applying a transition
        $grid.isotope({ filter: filterValue });
        $(this).siblings().attr("aria-checked", false);
        $(this).attr("aria-checked", true);

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
      },
    );

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
  $("[role='switch'][data-trigger-event]").on("click keydown", function (e) {
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
    let scrollbarTheme;
    if (themeIsDark) {
      $("html").removeClass("dark");
      localStorage.theme = "light";
      scrollbarTheme = "os-theme-dark";
    } else {
      $("html").addClass("dark");
      localStorage.theme = "dark";
      scrollbarTheme = "os-theme-light";
    }

    // Updates the UI elements.
    $(this).attr("aria-checked", !themeIsDark);

    // Changes the scrollbar theme.
    scrollbar.forEach(function (instance, id) {
      instance.options({
        scrollbars: {
          theme: scrollbarTheme,
        },
      });
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
  $("[role='switch'][aria-label='toggle navigation'][aria-controls]").on(
    "click",
    function () {
      let targetId = "#" + $(this).attr("aria-controls");
      let isExpanded = $(this).attr("aria-expanded") === "true";
      $(this).attr("aria-expanded", !isExpanded);
      $(this).closest("header").attr("aria-expanded", !isExpanded);
      $(targetId).toggle(400, $easeInOut);
    },
  );

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
    let $target = $(targetId);
    let isExpanded = $(this).attr("aria-expanded") === "true";
    $target
      .fadeToggle(400, $easeInOut)
      .css("height", isExpanded ? "0" : $target.attr("data-toggle-height"));
    $(this).attr("aria-expanded", !isExpanded);
  });

  /**
   * Handles the click event on elements with the role "tab" and attribute "aria-controls".
   * Updates the active tab content and navigation state based on the clicked element.
   */
  $("[role='tab'][aria-controls]").on("click", function () {
    // Find the target ID
    let $activeTabs = $(this).closest("nav").find("[aria-selected='true']");
    let targetId = "#" + $(this).attr("aria-controls");
    let $target = $(targetId);

    // First, fade out all tab contents
    $activeTabs.each(function () {
      let activeId = "#" + $(this).attr("aria-controls");
      let $active = $(activeId);
      if (activeId !== targetId) {
        // Fade out the current active tab content
        $active.attr("aria-selected", false);
        // Fade in the target content section
        $target.attr("aria-selected", true);
      }
    });

    // Update active state for nav items within the same sidebar
    $activeTabs.attr("aria-selected", false);
    $(this).attr("aria-selected", true);

    scrollbar
      .get($target.closest("[role='tabpanel-container']").prop("id"))
      .update({});
  });

  /**
   * Handles the click event for elements with the role "modal-open" and the attribute "aria-controls".
   * Opens the modal specified by the value of the aria-controls attribute.
   */
  $("[role='button'][aria-details^='Open modal'][aria-controls]").on(
    "click",
    function () {
      let targetId = "#" + $(this).attr("aria-controls");
      let $target = $(targetId);
      document.querySelector(targetId).showModal();
      $target.attr("aria-modal", true).attr("aria-hidden", false);
      setModalElementHeight($target);
      // Update scrollbar overflow
      scrollbar.get("body").options({
        overflow: {
          y: "hidden",
        },
      });
      $(window).trigger("resize");
    },
  );

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
    // Update scrollbar overflow
    scrollbar.get("body").options({
      overflow: {
        y: "scroll",
      },
    });
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
   * Event listener for window resize.
   * Sets the height of the modal element based on the maximum height of the tabpanels and sidenav.
   */
  $(window).on("resize", function () {
    let $modal = $("[open][aria-modal='true']");
    if ($modal.length > 0) {
      setModalElementHeight($modal);
    }
  });

  /**
   * Event handler for window resize event.
   * It adds a class to the modal content element to disable transitions temporarily,
   * clears the resize timer, and then removes the class after a short delay.
   */
  $(window).on("resize", function () {
    let modal = $("[open][aria-modal='true']");
    let modalContent = modal.find("[role='modal-content'");
    let sidenav = modal.find("[role='sidenav']");
    let tabpanels = modal.find("[role='tabpanel']");
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
