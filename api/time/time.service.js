const moment = require('moment');
const getDayNumberFromName = require('../utils/helpers.service');

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

const addTime = (currentTime = moment(), minutes = 60) => {
  currentTime.add(minutes, "minute");
  return currentTime;
}

// Time = { weekday, start, end }, a day can have multiple time
const getDifferentTimes = (now = moment(), ressourceTimes = [], minutes = 60) => {
  let foundTimes = [];
  let currentTime = now
  currentTime.minutes(0);

  // For each shop
  ressourceTimes.forEach(shopTimes => {
    // We have some opening times // ex: 8:00 18:00
    tests = 0;
    while(foundTimes.length < 130 && tests < 50) {
      tests++
      if (isAnOpeningDay(currentTime.day(), shopTimes)) {
        const shopDayTimes = shopTimes.filter(st=>st.weekday===currentTime.day());
        if (isAnOpeningTime(currentTime.format("HH:mm"), shopDayTimes)) {
          // Addind time to found times
          foundTimes.push(formatTime(currentTime));
        }
        addTime(currentTime, minutes);
      } else {
        currentTime.add(1, "day");
        currentTime.hour(6)
      }
    }
  });
  return foundTimes;
}

const getTimes = (shopTimes = [], deliveryTimes = [], unavailableTimes = []) => {
  deliveryTimes = deliveryTimes.filter(dl => {
    const available = !unavailableTimes.map(ut=>moment(ut).format("YYYY-MM-DD HH:mm")).includes(moment(dl.isoDate).format("YYYY-MM-DD HH:mm"));
    return moment(dl.isoDate).isAfter(moment(shopTimes[0].isoDate)) && available;
  });
  const foundTimes = shopTimes.filter(x => deliveryTimes.map(t=>t.isoDate).includes(x.isoDate));

  if (foundTimes && foundTimes > 0) {
    return foundTimes;
  } else {
    return deliveryTimes;
  }
}

const isShopOpen = (shopDays = {}, now = new Date()) => {
  let isOpen = false
  Object.keys(shopDays).forEach(day => {
    const openingDay = getDayNumberFromName(day);
    const currentDay = now.getDay();
    if (currentDay === openingDay) {
      var currentTime = moment(moment(now).utc().format('HH:mm'), 'HH:mm');
      shopDays[day].forEach(time => {
        if (time.isOpen) {
          console.log(currentTime, beforeTime, afterTime);
          var beforeTime = moment(time.open.substring(0, 2) + ':' + time.open.substring(2), 'HH:mm').utc(); // 0800
          var afterTime = moment(time.close.substring(0, 2) + ':' + time.close.substring(2), 'HH:mm').utc(); // 1800
          if (currentTime.isBetween(beforeTime, afterTime)) {
            isOpen = true
          }
        }
      })
    }
  });
  return isOpen;
}

module.exports = { getDifferentTimes, getTimes, isShopOpen };
