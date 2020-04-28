const moment = require('moment');

const parseTime = (time) => {
  return time.split(":");
}

const formatTime = (time) => {
  return { date: time.format("DD/MM"), time: time.format("HH:mm"), isoDate: time.format("YYYY-MM-DD HH:mm") }
}

const isAnOpeningDay = (day, shopTimes = []) => {
  const days = shopTimes.map(st=>st.weekday);
  return days.includes(day);
}

var format = 'HH:mm';

const isAnOpeningTime = (currentTime = "17:00", dayTimes = []) => {
  let isBetween = false
  dayTimes.forEach(shopTime => {
    var time = moment(currentTime, format);
    var beforeTime = moment(shopTime.start, format); // 08:00
    var afterTime = moment(shopTime.end, format); // 18:00
    isBetween = time.isBetween(beforeTime, afterTime);
  });
  return isBetween;
}

// Time = { weekday, start, end }, a day can have multiple time
const getDifferentTimes = (now = moment(), ressourceTimes = []) => {
  let foundTimes = [];
  let currentTime = now.add(1, "hour")
  if (currentTime.minutes() > 30) {
    currentTime.add(1, "hour");
  }
  currentTime.minutes(0);

  // For each shop
  ressourceTimes.forEach(shopTimes => {
    // We have some opening times // ex: 8:00 18:00
    tests = 0;
    while(foundTimes.length < 20 && tests < 50) {
      tests++
      if (isAnOpeningDay(currentTime.day(), shopTimes)) {
        const shopDayTimes = shopTimes.filter(st=>st.weekday===currentTime.day());
        if (isAnOpeningTime(currentTime.format("HH:mm"), shopDayTimes)) {
          // Addind time to found times
          foundTimes.push(formatTime(currentTime));
        }
        currentTime.add(1, "hour");
      } else {
        currentTime.add(1, "day");
        currentTime.hour(6)
      }
    }
  });
  return foundTimes;
}

module.exports = { getDifferentTimes };
