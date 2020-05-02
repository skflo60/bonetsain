const { getDifferentTimes, getTimes } = require('../api/time/time.service');
const moment = require('moment');

test('it should return 11h because there are 2 orders before', () => {
  const shopTimes = [ { date: '04/05', time: '18:00', isoDate: '2020-05-04 18:00' },
  { date: '11/05', time: '18:00', isoDate: '2020-05-11 18:00' },
  { date: '18/05', time: '18:00', isoDate: '2020-05-18 18:00' },
  { date: '25/05', time: '18:00', isoDate: '2020-05-25 18:00' },
  { date: '01/06', time: '18:00', isoDate: '2020-06-01 18:00' },
  { date: '08/06', time: '18:00', isoDate: '2020-06-08 18:00' } ] // Ouvert samedi et dimanche
  const deliveryTimes = [ { date: '02/05', time: '09:00', isoDate: '2020-05-02 09:00' },
  { date: '02/05', time: '10:00', isoDate: '2020-05-02 10:00' },
  { date: '02/05', time: '11:00', isoDate: '2020-05-02 11:00' },
  { date: '02/05', time: '12:00', isoDate: '2020-05-02 12:00' },
  { date: '02/05', time: '13:00', isoDate: '2020-05-02 13:00' },
  { date: '02/05', time: '14:00', isoDate: '2020-05-02 14:00' },
  { date: '02/05', time: '15:00', isoDate: '2020-05-02 15:00' },
  { date: '02/05', time: '16:00', isoDate: '2020-05-02 16:00' },
  { date: '02/05', time: '17:00', isoDate: '2020-05-02 17:00' },
  { date: '02/05', time: '18:00', isoDate: '2020-05-02 18:00' },
  { date: '02/05', time: '19:00', isoDate: '2020-05-02 19:00' },
  { date: '03/05', time: '09:00', isoDate: '2020-05-03 09:00' },
  { date: '03/05', time: '10:00', isoDate: '2020-05-03 10:00' },
  { date: '03/05', time: '11:00', isoDate: '2020-05-03 11:00' },
  { date: '03/05', time: '12:00', isoDate: '2020-05-03 12:00' },
  { date: '03/05', time: '13:00', isoDate: '2020-05-03 13:00' },
  { date: '03/05', time: '14:00', isoDate: '2020-05-03 14:00' },
  { date: '03/05', time: '15:00', isoDate: '2020-05-03 15:00' },
  { date: '03/05', time: '16:00', isoDate: '2020-05-03 16:00' },
  { date: '03/05', time: '17:00', isoDate: '2020-05-03 17:00' },
  { date: '03/05', time: '18:00', isoDate: '2020-05-03 18:00' },
  { date: '03/05', time: '19:00', isoDate: '2020-05-03 19:00' },
  { date: '09/05', time: '09:00', isoDate: '2020-05-09 09:00' },
  { date: '09/05', time: '10:00', isoDate: '2020-05-09 10:00' },
  { date: '09/05', time: '11:00', isoDate: '2020-05-09 11:00' },
  { date: '09/05', time: '12:00', isoDate: '2020-05-09 12:00' },
  { date: '09/05', time: '13:00', isoDate: '2020-05-09 13:00' },
  { date: '09/05', time: '14:00', isoDate: '2020-05-09 14:00' },
  { date: '09/05', time: '15:00', isoDate: '2020-05-09 15:00' },
  { date: '09/05', time: '16:00', isoDate: '2020-05-09 16:00' },
  { date: '09/05', time: '17:00', isoDate: '2020-05-09 17:00' },
  { date: '09/05', time: '18:00', isoDate: '2020-05-09 18:00' },
  { date: '09/05', time: '19:00', isoDate: '2020-05-09 19:00' },
  { date: '10/05', time: '09:00', isoDate: '2020-05-10 09:00' },
  { date: '10/05', time: '10:00', isoDate: '2020-05-10 10:00' },
  { date: '10/05', time: '11:00', isoDate: '2020-05-10 11:00' },
  { date: '10/05', time: '12:00', isoDate: '2020-05-10 12:00' },
  { date: '10/05', time: '13:00', isoDate: '2020-05-10 13:00' },
  { date: '10/05', time: '14:00', isoDate: '2020-05-10 14:00' },
  { date: '10/05', time: '15:00', isoDate: '2020-05-10 15:00' } ];
  const times = getTimes(shopTimes, deliveryTimes, ['2020-05-09T07:00:00.000+00:00', '2020-05-09T08:00:00.000+00:00']);
  expect(times[0]).not.toBe(undefined);
  expect(times[0].date).toBe('09/05');
  expect(times[0].time).toBe('11:00');
});

test('it should return 30/03 09:00 when params are a shop opened 8h => 18h', () => {
  const shopTimes = [ { date: '04/05', time: '18:00', isoDate: '2020-05-04 18:00' },
  { date: '11/05', time: '18:00', isoDate: '2020-05-11 18:00' },
  { date: '18/05', time: '18:00', isoDate: '2020-05-18 18:00' },
  { date: '25/05', time: '18:00', isoDate: '2020-05-25 18:00' },
  { date: '01/06', time: '18:00', isoDate: '2020-06-01 18:00' },
  { date: '08/06', time: '18:00', isoDate: '2020-06-08 18:00' } ] // Ouvert samedi et dimanche
  const deliveryTimes = [ { date: '02/05', time: '09:00', isoDate: '2020-05-02 09:00' },
  { date: '02/05', time: '10:00', isoDate: '2020-05-02 10:00' },
  { date: '02/05', time: '11:00', isoDate: '2020-05-02 11:00' },
  { date: '02/05', time: '12:00', isoDate: '2020-05-02 12:00' },
  { date: '02/05', time: '13:00', isoDate: '2020-05-02 13:00' },
  { date: '02/05', time: '14:00', isoDate: '2020-05-02 14:00' },
  { date: '02/05', time: '15:00', isoDate: '2020-05-02 15:00' },
  { date: '02/05', time: '16:00', isoDate: '2020-05-02 16:00' },
  { date: '02/05', time: '17:00', isoDate: '2020-05-02 17:00' },
  { date: '02/05', time: '18:00', isoDate: '2020-05-02 18:00' },
  { date: '02/05', time: '19:00', isoDate: '2020-05-02 19:00' },
  { date: '03/05', time: '09:00', isoDate: '2020-05-03 09:00' },
  { date: '03/05', time: '10:00', isoDate: '2020-05-03 10:00' },
  { date: '03/05', time: '11:00', isoDate: '2020-05-03 11:00' },
  { date: '03/05', time: '12:00', isoDate: '2020-05-03 12:00' },
  { date: '03/05', time: '13:00', isoDate: '2020-05-03 13:00' },
  { date: '03/05', time: '14:00', isoDate: '2020-05-03 14:00' },
  { date: '03/05', time: '15:00', isoDate: '2020-05-03 15:00' },
  { date: '03/05', time: '16:00', isoDate: '2020-05-03 16:00' },
  { date: '03/05', time: '17:00', isoDate: '2020-05-03 17:00' },
  { date: '03/05', time: '18:00', isoDate: '2020-05-03 18:00' },
  { date: '03/05', time: '19:00', isoDate: '2020-05-03 19:00' },
  { date: '09/05', time: '09:00', isoDate: '2020-05-09 09:00' },
  { date: '09/05', time: '10:00', isoDate: '2020-05-09 10:00' },
  { date: '09/05', time: '11:00', isoDate: '2020-05-09 11:00' },
  { date: '09/05', time: '12:00', isoDate: '2020-05-09 12:00' },
  { date: '09/05', time: '13:00', isoDate: '2020-05-09 13:00' },
  { date: '09/05', time: '14:00', isoDate: '2020-05-09 14:00' },
  { date: '09/05', time: '15:00', isoDate: '2020-05-09 15:00' },
  { date: '09/05', time: '16:00', isoDate: '2020-05-09 16:00' },
  { date: '09/05', time: '17:00', isoDate: '2020-05-09 17:00' },
  { date: '09/05', time: '18:00', isoDate: '2020-05-09 18:00' },
  { date: '09/05', time: '19:00', isoDate: '2020-05-09 19:00' },
  { date: '10/05', time: '09:00', isoDate: '2020-05-10 09:00' },
  { date: '10/05', time: '10:00', isoDate: '2020-05-10 10:00' },
  { date: '10/05', time: '11:00', isoDate: '2020-05-10 11:00' },
  { date: '10/05', time: '12:00', isoDate: '2020-05-10 12:00' },
  { date: '10/05', time: '13:00', isoDate: '2020-05-10 13:00' },
  { date: '10/05', time: '14:00', isoDate: '2020-05-10 14:00' },
  { date: '10/05', time: '15:00', isoDate: '2020-05-10 15:00' } ];
  const times = getTimes(shopTimes, deliveryTimes);
  expect(times[0]).not.toBe(undefined);
  expect(times[0].date).toBe('09/05');
  expect(times[0].time).toBe('09:00');
});

test('it should return 30/03 09:00 when params are a shop opened 8h => 18h', () => {
  const shopTimes = [[ { weekday: 0, start: '08:00', end: '20:00' }, { weekday: 6, start: '08:00', end: '20:00' } ]] // Ouvert samedi et dimanche
  const date = moment("2020-04-29 22:00", "YYYY-MM-DD HH:mm"); // Commande un jeudi soir à 22h;
  const times = getDifferentTimes(date, shopTimes);
  expect(times[0].date).toBe('02/05');
  expect(times[0].time).toBe('09:00');
});

test('it should return 30/03 09:00 when params are a shop opened 8h => 18h', () => {
  const shopTimes = [[ { weekday: 4, start: '15:00', end: '17:00' } ], [ { weekday: 1, start: '08:00', end: '17:00' }, { weekday: 3, start: '15:00', end: '18:00' } ]]
  const deliveryMenTimes = [ { weekday: 1, start: '17:00', end: '19:00' }, { weekday: 0, start: '08:00', end: '18:00' }] // lundi et dimanche
  const unavailableTimes = []
  const duration = -1 // -1 = à emporter
  const date = moment("2020-03-29 20:00", "YYYY-MM-DD HH:mm"); // Commande un dimanche soir à 20h;
  const times = getDifferentTimes(date, shopTimes);
  expect(times[0].date).toBe('02/04');
  expect(times[0].time).toBe('16:00');
  expect(times[1].date).toBe('09/04');
  expect(times[1].time).toBe('16:00');
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
