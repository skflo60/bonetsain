const getWeekNumberFromName = (name) => {
  switch (name) {
    case 'sunday':
      return 0
    break;
    case 'monday':
      return 1
    break;
    case 'tuesday':
      return 2
    break;
    case 'wednesday':
      return 3
    break;
    case 'thursday':
      return 4
    break;
    case 'friday':
      return 5
    break;
    case 'saturday':
      return 6
    break;
  }
}

module.exports = getWeekNumberFromName;
