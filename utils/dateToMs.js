function dateToMs(dateStr: string) {
    const dateArray = dateStr.split(" ");
    for (let i = 0; i < dateArray.length; i++) {
      if (dateArray[i] === "") {
        dateArray.splice(i, 1);
      }
    }
    const [weekday, monthStr, dayStr, timeStr, ofDay, tzStr] = dateArray;
    const month = new Date(Date.parse(`${monthStr} 1, 2000`)).getMonth();
    let [hours, minutes] = timeStr
      .split(":")
      .map((str: string) => parseInt(str));
    const day = parseInt(dayStr.replace(",", ""));
    if (ofDay === "PM") {
      hours += 12;
    }
    hours += 4; //ET to GMT
    const utcDate = new Date(Date.UTC(2023, month, day, hours, minutes));
    return utcDate.getTime();
  }

  module.exports = dateToMs