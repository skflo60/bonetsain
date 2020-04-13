const { getDifferentTimes } = require('../api/time/time.service');
const moment = require('moment');

test('it should return 30/03 09:00 when params are a shop opened 8h => 18h', () => {
  const shopTimes = [[ { weekday: 1, start: '08:00', end: '17:00' }, { weekday: 3, start: '15:00', end: '18:00' } ]]
  const deliveryMenTimes = [ { weekday: 1, start: '17:00', end: '19:00' }, { weekday: 0, start: '08:00', end: '18:00' }]
  const unavailableTimes = []
  const duration = -1 // -1 = à emporter
  const date = moment("2020-03-29 20:00", "YYYY-MM-DD HH:mm"); // Commande un dimance soir à 20h;
  const times = getDifferentTimes(date, shopTimes, deliveryMenTimes, unavailableTimes, duration);
  expect(times[0].date).toBe('30/03');
  expect(times[0].time).toBe('09:00');
  expect(times[1].date).toBe('30/03');
  expect(times[1].time).toBe('10:00');
});

test('it should return 30/03 16:00 when params are a shop opened 7/7 8h => 18h and guy available all the time', () => {
  const shopsTimes = [[
    { weekday: 0, start: '08:00', end: '18:00' },
    { weekday: 1, start: '08:00', end: '18:00' },
    { weekday: 2, start: '08:00', end: '18:00' },
    { weekday: 3, start: '08:00', end: '18:00' },
    { weekday: 4, start: '08:00', end: '18:00' },
    { weekday: 5, start: '08:00', end: '18:00' },
    { weekday: 6, start: '08:00', end: '18:00' }
  ]];
  const deliveryMenTimes = [
    { weekday: 0, start: '08:00', end: '18:00' },
    { weekday: 1, start: '08:00', end: '18:00' },
    { weekday: 2, start: '08:00', end: '18:00' },
    { weekday: 3, start: '08:00', end: '18:00' },
    { weekday: 4, start: '08:00', end: '18:00' },
    { weekday: 5, start: '08:00', end: '18:00' },
    { weekday: 6, start: '08:00', end: '18:00' }
  ];
  const unavailableTimes = []
  const duration = 19 // Delivery 19 minutes
  const now = moment("2020-03-30 15:00", "YYYY-MM-DD HH:mm"); // Commande un dimance soir à 20h;
  const times = getDifferentTimes(now, shopsTimes, deliveryMenTimes, unavailableTimes, duration);
  expect(times[0].date).toBe('30/03');
  expect(times[0].time).toBe('16:00');
});
