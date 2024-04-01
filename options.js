/** localstorage settings */
function saveOptions() {
  browser.storage.sync.set({
    ignoriereBuchungsabschluss: document.querySelector(
      "#ignoriereBuchungsabschluss"
    ).checked,
    ignoriereFeiertage: document.querySelector("#ignoriereFeiertage").checked,
    featFlagHintBuchungsabschluss: document.querySelector(
      "#featFlagHintBuchungsabschluss"
    ).checked,
    featFlagTreeNodeOpening: document.querySelector("#featFlagTreeNodeOpening")
      .checked,
    featFlagNavigateArbeitszeitauswertung: document.querySelector(
      "#featFlagNavigateArbeitszeitauswertung"
    ).checked,
  });
}

function restoreOptions() {
  browser.storage.sync.get("ignoriereBuchungsabschluss").then((result) => {
    document.querySelector("#ignoriereBuchungsabschluss").checked =
      result.ignoriereBuchungsabschluss || false;
  }, onError);
  browser.storage.sync.get("ignoriereFeiertage").then((result) => {
    document.querySelector("#ignoriereFeiertage").checked =
      result.ignoriereFeiertage || false;
  }, onError);
  browser.storage.sync.get("featFlagHintBuchungsabschluss").then((result) => {
    document.querySelector("#featFlagHintBuchungsabschluss").checked =
      result.featFlagHintBuchungsabschluss || true;
  }, onError);
  browser.storage.sync.get("featFlagTreeNodeOpening").then((result) => {
    document.querySelector("#featFlagTreeNodeOpening").checked =
      result.featFlagTreeNodeOpening || true;
  }, onError);
  browser.storage.sync
    .get("featFlagNavigateArbeitszeitauswertung")
    .then((result) => {
      document.querySelector("#featFlagNavigateArbeitszeitauswertung").checked =
        result.featFlagNavigateArbeitszeitauswertung || true;
    }, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("change", saveOptions);
document.getElementById("resetButton").addEventListener("click", () => {
  browser.storage.sync.clear();
  restoreOptions();
});

function onError(error) {
  console.log(`Error: ${error}`);
}
