var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  console.log('Index render');
  const baseUrl = req.baseUrl;
  const search = req.url;

  res.render('index');
});
/** serve jade enabled partials */
exports.templates = function (req, res) {
  console.log('Templates render');
  res.render('templates/' + req.params.name);
};
/** serve jade enabled partials */
exports.employer = function (req, res) {
  console.log('Employer render');
  res.render('employer/' + req.params.name);
};
/** serve jade enabled partials */
exports.jobseeker = function (req, res) {
  console.log('Jobseeker render');
  res.render('jobseeker/' + req.params.name);
};
/** serve jade enabled partials */
// exports.stores = function (req, res) {
//   console.log('View stores render');
//   res.render('jobseeker/viewstore');
// };
exports.index = router;