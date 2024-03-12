/** BCS Seite: Arbeitszeitauswertung */
/** async IIFE, damit "return" möglich */
(async () => {
  const featFlagNavigateArbeitszeitauswertung =
    (await readLocalStorage("featFlagNavigateArbeitszeitauswertung").catch(
      () => {}
    )) ?? true;
  if (!featFlagNavigateArbeitszeitauswertung) return;

  // TODO: magic strings entfernen (enum)
  const arbeitszeitauswertungAutomatischeWahl =
    (await readLocalStorage("arbeitszeitauswertungAutomatischeWahl").catch(
      () => {}
    )) ?? CustomControlMode.Gestern;

  // Wenn Tab "Gebuchte Zeiten" geöffnet
  const tabGebuchteZeiten = "deputattable";
  if (
    document
      .getElementsByClassName("tabselectorActive")[0] // activeTabEl
      .firstChild.getAttribute("href") // ahref Element
      .split("tab=")[1] // url get activeTabName
      .split("&")[0] !== tabGebuchteZeiten
  )
    return;

  const elControlArea = document.getElementsByClassName("selectionbar")[1];

  elControlArea.insertAdjacentHTML("beforeend", getHTMLCustomControl());
  const [elControlAutoSel] = document.getElementsByName(
    "modify-bcs-deputatsummary-auto-sel"
  );
  elControlAutoSel.value = arbeitszeitauswertungAutomatischeWahl;
  elControlAutoSel.addEventListener("change", () => {
    browser.storage.sync.set({
      arbeitszeitauswertungAutomatischeWahl: elControlAutoSel.value,
    });
    // TODO reload entfernen
    location.reload();
  });

  if (arbeitszeitauswertungAutomatischeWahl === CustomControlMode.Aus) return;

  const [elCalModeSel] = document.getElementsByName(
    "group,Choices,deputattable,Selections,date,mode"
  );
  /*
  <option value="Y">Jahr</option>
  <option value="Q">Quartal</option>
  <option value="M">Monat</option>
  <option value="W">Woche</option>
  <option value="D">Tag</option>
  <option value="C">Manuell</option>
  <option value="L">Manuell: 08.03.24 - 11.03.24</option> 
  */
  const calModeManuell = "C";
  if (
    elCalModeSel.options[elCalModeSel.selectedIndex].value !== calModeManuell
  ) {
    const [elCalDateMode] = document.getElementsByName(
      "group,Choices,deputattable,Selections,date,mode"
    );

    elCalDateMode.value = calModeManuell;
    elCalDateMode.onchange();
    return;
  }

  const [elCalStartDate] = document.getElementsByName(
    "group,Choices,deputattable,Selections,date,calendarStartDate,calendarStartDate"
  );
  const currentStartDateVal = elCalStartDate.value;
  const newStartDateNum = "01";
  elCalStartDate.value = newStartDateNum + elCalStartDate.value.substring(2);

  const [elCalEndDate] = document.getElementsByName(
    "group,Choices,deputattable,Selections,date,calendarEndDate,calendarEndDate"
  );
  const currentEndDateVal = elCalEndDate.value;
  const todayDateNum = new Date().getDate();
  if (arbeitszeitauswertungAutomatischeWahl === CustomControlMode.Gestern) {
    const newEndDateNum = (todayDateNum > 1 ? todayDateNum - 1 : todayDateNum)
      .toString()
      .padStart(2, "0");
    elCalEndDate.value = newEndDateNum + elCalEndDate.value.substring(2);
  } else if (
    arbeitszeitauswertungAutomatischeWahl === CustomControlMode.Heute
  ) {
    const newEndDateNum = todayDateNum.toString().padStart(2, "0");
    elCalEndDate.value = newEndDateNum + elCalEndDate.value.substring(2);
  }

  // date changed => sumbit
  if (
    currentStartDateVal !== elCalStartDate.value ||
    currentEndDateVal !== elCalEndDate.value
  ) {
    const [elCalenderDateIntervalApply] = document.getElementsByName(
      "group,Choices,deputattable,Selections,date,apply_date_interval"
    );
    elCalenderDateIntervalApply.click();
  }
})();

/*
 * ****************************************************************************************************
 * Functions
 * ****************************************************************************************************
 */

function getHTMLCustomControl() {
  return String.raw`
<span class="calendarControlLabel">automatische Wahl</span>
<select class="calendarModeSelect" name="modify-bcs-deputatsummary-auto-sel">
    <option value="A">aus</option>
    <option value="G">erster bis gestern</option>
    <option value="H">erster bis heute</option> 
</select>
`;
}

async function readLocalStorage(key) {
  return new Promise((resolve, reject) => {
    browser.storage.sync.get([key], function (result) {
      if (result === undefined || result[key] === undefined) {
        reject();
      } else {
        resolve(result[key]);
      }
    });
  });
}

/*
 * ****************************************************************************************************
 * Types
 * ****************************************************************************************************
 */

const CustomControlMode = Object.freeze({
  Aus: "A",
  Gestern: "G",
  Heute: "H",
});
