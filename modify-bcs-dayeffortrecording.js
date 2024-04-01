/** BCS Seite: Tagesbuchen */
/** async IIFE, damit "return" möglich */
(async () => {
  if (!(await readLocalStorage("featFlagHintBuchungsabschluss", true))) return;

  const ignoriereBuchungsabschluss = await readLocalStorage(
    "ignoriereBuchungsabschluss",
    false
  );

  if (await readLocalStorage("featFlagTreeNodeOpening", true)) {
    await treeNodeOpening();
  }

  const currentDateField = document.getElementById(
    "daytimerecording,Selections,effortRecordingDate_intervaldisplay"
  );

  const date = getDateFromBcsString(
    currentDateField.innerText.split("(")[0] // Kalenderwoche entfernen
  );

  const isFriday = isDateFriday(date);

  /*
   * - Setting day parameter to 0 means one day less than first day of the month which is last day of the previous month.
   * - getDay() not Saturday not Sunday
   * - getTime() Datum Wertevergleich, da Instanzvergleich nicht möglich
   */
  const isLastDayOfMonthAndNotWeekend = isDateLastDayOfMonthAndNotWeekend(date);

  /*
   * early because Holiday(-s)
   */
  const ignoriereFeiertage = await readLocalStorage(
    "ignoriereFeiertage",
    false
  );
  const isEarlyBasedOnHolidaysObj = new isEarlyBasedOnHolidays();
  if (
    isFriday == false &&
    isLastDayOfMonthAndNotWeekend == false &&
    ignoriereFeiertage == false
  ) {
    await isDateEarlyBasedOnHolidays(date, isEarlyBasedOnHolidaysObj);
  }

  /*
   * Meldung in Abhängigkeit von Bedingungen anzeigen
   * (Freitag oder wenn letzter Tag des Monats unter der Woche ist)
   */
  if (
    isFriday ||
    isLastDayOfMonthAndNotWeekend ||
    isEarlyBasedOnHolidaysObj.isEarlyBasedOnHolidays
  ) {
    // Buchungsabschlussdatum lesen
    const dateBuchungsabschluss = await getBuchungsabschlussDate();

    // nur anzeigen wenn Buchungsabschluss beachtet wird und Buchungsabschluss noch nicht darauf oder auf danach gesetzt wurde
    const isBuchungsabschlussAtDateOrAfter = ignoriereBuchungsabschluss
      ? false
      : dateBuchungsabschluss.getTime() >= date.getTime();

    if (!ignoriereBuchungsabschluss && isBuchungsabschlussAtDateOrAfter) {
      // keine Meldung anzeigen
      return;
    }

    const messageDoc = new DOMParser().parseFromString(
      getHTMLCustomMessage(),
      "text/html"
    );
    // TODO Code verbessern
    messageDoc
      .getElementsByTagName("span")[0]
      .insertAdjacentText(
        "beforeend",
        ` ${isFriday ? "Es ist Freitag." : ""}${
          isLastDayOfMonthAndNotWeekend ? "Letzer Tag des Monats." : ""
        }${
          isEarlyBasedOnHolidaysObj.isEarlyBasedOnHolidays
            ? isEarlyBasedOnHolidaysObj.isReasonFridayInFuture
              ? `Letzer Tag vor Freitag, da Feiertag/-e folgend: ${isEarlyBasedOnHolidaysObj.holidaysAheadArr.join(
                  ", "
                )}.`
              : isEarlyBasedOnHolidaysObj.isReasonLastDayOfMonthAndNotWeekendInFuture
              ? `Letzer Tag vor letzem Tag des Monats, da Feiertag/-e folgend: ${isEarlyBasedOnHolidaysObj.holidaysAheadArr.join(
                  ", "
                )}.`
              : ""
            : ""
        }`
      );

    document
      .getElementById("PageContent")
      .insertAdjacentHTML("afterbegin", messageDoc.body.innerHTML);
  }
})();

/*
 * ****************************************************************************************************
 * Functions
 * ****************************************************************************************************
 */

async function treeNodeOpening() {
  const selectorTreeNodesOpen =
    'a.treeNodeIsOpen_jq[id ^= "daytimerecording,Content,daytimerecordingPspTree_"]';
  const selectorTreeNodesClosed =
    'a.treeNodeIsClosed_jq[id ^= "daytimerecording,Content,daytimerecordingPspTree_"]';

  const lsTreeNodesOpendKey = "treeNodesOpend";

  const treeNodesOpened = document.querySelectorAll(selectorTreeNodesOpen);

  if (treeNodesOpened.length == 0) {
    const lsTreeNodesOpendArr = await readLocalStorage(lsTreeNodesOpendKey, []);
    if (lsTreeNodesOpendArr.length > 0) {
      const treeNodesClosed = document.querySelectorAll(
        selectorTreeNodesClosed
      );
      treeNodesClosed.forEach((f) => {
        const found = lsTreeNodesOpendArr.find(
          (el) => getEvDataOfTreeNode(f).treeNodeId === el
        );
        if (found) f.click();
      });
    }
  }

  const treeNodesAll = document.querySelectorAll(
    `${selectorTreeNodesClosed},${selectorTreeNodesOpen}`
  );
  treeNodesAll.forEach((box) => {
    box.addEventListener("click", async () => {
      const evData = getEvDataOfTreeNode(box);
      console.log(evData);

      const lsTreeNodesOpendArr = await readLocalStorage(
        lsTreeNodesOpendKey,
        []
      );
      const index = lsTreeNodesOpendArr.indexOf(evData.treeNodeId);
      switch (evData.state) {
        case "open":
          if (index === -1) lsTreeNodesOpendArr.push(evData.treeNodeId);
          break;
        case "close":
          if (index > -1) lsTreeNodesOpendArr.splice(index, 1);
          break;
        default:
          break;
      }
      writeLocalStorage(lsTreeNodesOpendKey, lsTreeNodesOpendArr);
    });
  });
}

function getEvDataOfTreeNode(element) {
  // pathname example: AjaxPage.ajaxRequest('daytimerecording,Content,daytimerecordingPspTree', 'open', '1216024970389_JProject', '1', '6' , 'false','true')
  const commandArr = element.pathname
    .split("(")
    .pop()
    .split(")")[0] // request command
    .replace(/\s/g, "") // remove whitespace
    .slice(1, -1)
    .split("','"); // create array
  return new evTreeToggle(commandArr[2], commandArr[1]);
}

function isDateFriday(date) {
  return date.getDay() === 5;
}

function isDateLastDayOfMonthAndNotWeekend(date) {
  return (
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getTime() ===
      date.getTime() && ![0, 6].some((s) => s === date.getDay())
  );
}

async function isDateEarlyBasedOnHolidays(date, isEarlyBasedOnHolidaysObj) {
  const holidayDatesArr = await getHolidays(date.getFullYear());
  holidayDatesArr.forEach((x) => x.date.setHours(0, 0, 0, 0));
  var dateInFuture = addDaysToDate(date);
  dateInFuture.setHours(0, 0, 0, 0);
  while (true) {
    const holidaysMatching = holidayDatesArr.filter(
      (f) => f.date.getTime() === dateInFuture.getTime()
    );
    if (holidaysMatching.length == 0) break;
    isEarlyBasedOnHolidaysObj.holidaysAheadArr.push(holidaysMatching[0].label);

    const isFridayInFuture = isDateFriday(dateInFuture);
    const isLastDayOfMonthAndNotWeekendInFuture =
      isDateLastDayOfMonthAndNotWeekend(dateInFuture);
    if (isFridayInFuture || isLastDayOfMonthAndNotWeekendInFuture) {
      isEarlyBasedOnHolidaysObj.isEarlyBasedOnHolidays = true;
      isEarlyBasedOnHolidaysObj.isReasonFridayInFuture = isFridayInFuture;
      isEarlyBasedOnHolidaysObj.isReasonLastDayOfMonthAndNotWeekendInFuture =
        isLastDayOfMonthAndNotWeekendInFuture;
      break;
    }
    dateInFuture = addDaysToDate(dateInFuture);
  }
}

function addDaysToDate(date, days = 1) {
  // add time of one day in ms
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function getHTMLCustomMessage() {
  /*
   * css klasse nach "messagedisplay"
   *
   * affirmations - grün checkbox
   * errors - rot kreuz kreis
   * neutrals - blau info i kreis
   * warnings - gelb ausrufezeichen dreieck
   */
  return String.raw`
<div id="defaultMessageContainer">
<div class="messagedisplay neutrals" id="TimeRecordingService_Success">
<a class="close" onclick="BCS.MessageDisplay.close($(this).parent())" title="Meldung ausblenden"></a>
<div class="msg affirmation">
<span>Heute Buchungsabschluss setzen.</span>
</div>
</div>
</div>
`;
}

async function getBuchungsabschlussDate() {
  // https://stackoverflow.com/questions/36631762/returning-html-with-fetch/50812705#50812705
  const response = await fetch(
    window.location.origin + "/bcs/mybcs/usertimerecordingclosure/display"
  ).catch(function (err) {
    console.log("Failed to fetch page: ", err);
  });

  // TODO Error Case?
  if (!response) return;

  const html = await response.text();
  var doc = new DOMParser().parseFromString(html, "text/html");

  return getDateFromBcsString(
    doc.getElementById("lasttestation,userTimeRecordingClosureDate_fieldvalue")
      .children[0].firstChild.textContent
  );
}

async function getHolidays(year) {
  const response = await fetch(
    window.location.origin +
      "/bcs/mybcs/dayeffortrecording/display?" +
      new URLSearchParams({
        bcs_ajax_component: "daytimerecording,Selections,effortRecordingDate",
        bcs_ajax_type: 3,
        bcs_ajax_class: "holidaycalendar",
        req_holidays_for_year: year,
        req_holidays_for_owner: document.getElementsByName("oid").value,
      })
  ).catch(function (err) {
    console.log("Failed to fetch page: ", err);
  });

  // TODO Error Case?
  if (!response) return;

  const json = await response.text();
  var o = JSON.parse(json);
  return o.years[0].holidays.map((m) => new bcsHolidayEntry(m.date, m.label));
}

/** "Fr. 01.03.24" zu Date */
function getDateFromBcsString(bcsDateString) {
  return new Date(
    "20" +
      bcsDateString
        .split(".")
        .slice(1) // Wochentag Kürzel entfernen
        .toReversed()
        .join("/") // englisches Date Format
        .replace(/\s/g, "") // whitespace entfernen
  );
}

async function readLocalStorage(key, fallbackValue) {
  return new Promise((resolve) => {
    browser.storage.sync.get([key], function (result) {
      if (result === undefined || result[key] === undefined) {
        resolve(fallbackValue);
      } else {
        resolve(result[key]);
      }
    });
  });
}

function writeLocalStorage(key, value) {
  browser.storage.sync.set({ [key]: value });
}

/*
 * ****************************************************************************************************
 * Classes
 * ****************************************************************************************************
 */
class bcsHolidayEntry {
  constructor(dateString, label) {
    this.date = new Date(dateString);
    this.label = label;
  }
}
class isEarlyBasedOnHolidays {
  isEarlyBasedOnHolidays = false;
  isReasonFridayInFuture = false;
  isReasonLastDayOfMonthAndNotWeekendInFuture = false;
  holidaysAheadArr = [];
  constructor() {}
}
class evTreeToggle {
  constructor(treeNodeId, state) {
    /** example: 1216024970389_JProject */
    this.treeNodeId = treeNodeId;
    /** example: close, open */
    this.state = state;
  }
}
