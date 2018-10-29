function createSite(num) {
  // @todo Take random number and eturn random site.
  const site = {};

  return site;
}

module.exports = (req, res, next) => {
  console.log('Req method: ' + req.method);
  console.log('Req url: ' + req.url);

  if (req.method === 'POST' && req.url === '/sites') {
    req.body = createSite(Math.floor(Math.random() * Math.floor(10)));
    next();
  }

  // console.log('Req body: ' + req.body);
  console.log(req.body);
  console.log('Res body: ' + res.body);
  next();
};
