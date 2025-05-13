var createZoomOption = function (parentElement, text, days) {
  let newElement = document.createElement("a");
  newElement.setAttribute("class", "zoomopt");
  newElement.setAttribute(
    "onclick",
    `zoomAmount = ${days}; return pricehistory_zoomDays( g_plotPriceHistory, g_timePriceHistoryEarliest, g_timePriceHistoryLatest, ${days} );`
  );
  newElement.setAttribute("href", "javascript:void(0);");
  newElement.textContent = text;
  parentElement.appendChild(newElement);
}

var observer = new MutationObserver(function (mutations) {
  mutations.forEach(function (mutation) {
    if (!mutation.addedNodes) return;
    for (let i = 0; i < mutation.addedNodes.length; i++) {
      let node = mutation.addedNodes[i];
      if (node.tagName === "SCRIPT") {
        if (
          node.getAttribute("src") != null &&
          node.getAttribute("src").includes("economy.js")
        ) {
          let element = document.createElement("script");
          element.setAttribute(
            "src",
            chrome.runtime.getURL("js/OverwrittenFunction.js")
          );
          document.head.appendChild(element);
        }
      }
      if (node.tagName === "DIV" && node.getAttribute("class") === "zoom_controls pricehistory_zoom_controls") {
        while (node.children.length > 0) {
          node.removeChild(node.lastChild);
        }
        createZoomOption(node, "Day", 1);
        createZoomOption(node, "Week", 7);
        createZoomOption(node, "Month", 30);
        createZoomOption(node, "3-Months", 3*30);
        createZoomOption(node, "Year", 365);
        createZoomOption(node, "3-Years", 3*365);
        createZoomOption(node, "10-Years", 10*365);
        createZoomOption(node, "Lifetime", -1);

        
        let optionsElement = document.createElement("div");
        optionsElement.setAttribute("class", "zoom_controls pricehistory_zoom_controls ignore");
        optionsElement.setAttribute("style", "float: none; margin-left: 45px; margin-right: 0px;");
        optionsElement.textContent = "Options";

        let startAtElement = document.createElement("a");
        startAtElement.setAttribute("class", "zoomopt");
        startAtElement.setAttribute("onclick", "startAtZero = !startAtZero; pricehistory_zoomDays( g_plotPriceHistory, g_timePriceHistoryEarliest, g_timePriceHistoryLatest, zoomAmount );");
        startAtElement.setAttribute("href", "javascript:void(0);");
        startAtElement.textContent = "Start at 0";
        node.parentNode.insertBefore(optionsElement, node.nextSibling);

        optionsElement.appendChild(startAtElement);

      }
    }
  });
});

observer.observe(document, {
  childList: true,
  subtree: true,
  attributes: false,
  characterData: false,
});
