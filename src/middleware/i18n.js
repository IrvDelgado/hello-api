const i18n = require('i18n');
const path = require('path');

i18n.configure({
  locales: ['en', 'es'],
  defaultLocale: 'es',
  directory: path.join(__dirname, '../locales'),
  objectNotation: true,
  updateFiles: false
});

module.exports = (req, res, next) => {
  i18n.init(req, res);
  req.t = res.t = i18n.__.bind(req);
  next();
};
