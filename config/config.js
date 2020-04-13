module.exports = {
  mongo: {
    uri: 'mongodb+srv://admin:mouton@biosain-voja5.mongodb.net/',
    db: 'biosain'
  },
  api: 'http://localhost:3001/api',
  front_url: process.env.FRONT_URL || 'http://localhost:8080' || 'https://localfrais.fr'
};
