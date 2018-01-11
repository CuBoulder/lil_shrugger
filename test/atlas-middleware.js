function createSite(num) {
  // @todo Take random number and eturn random site.
  const site = {
    code: {
      profile: '5a4fc0b7926f5b102b06029c',
      core: '598880d7926f5b2eefbce443',
      package: [
        '5893a62c926f5b14369b5e23',
        '591def5f926f5b28e7361dc8',
      ],
    },
    created_by: 'jafu6031',
    statistics: '5898af54926f5b130c908c08',
    modified_by: 'kere7580',
    _deleted: false,
    _links: {
      self: {
        href: 'sites/5898af53926f5b14369b5e36',
        title: 'site',
      },
    },
    sid: 'p155c6d30b21',
    type: 'express',
    status: 'launched',
    _latest_version: 35,
    f5only: false,
    db_key: '67414141414142596d4b395561395469626a7355654c787249612d5862447634545f526348717a4a3669426767746d42564769755539593554625f43784452784e6131384b4563766955324a324e6465625f524f4e523171777437377a6559415755586a39665559325676506a396e776e6b72686a4b58683164714d70777a69315368616753374d4f76735f',
    path: 'techtalks',
    pool: 'poolb-express',
    _updated: '2018-01-05 19:39:43 GMT',
    dates: {
      launched: '2017-03-09 21:40:54 GMT',
      created: '2017-02-06 17:16:03 GMT',
    },
    update_group: 0,
    settings: {
      page_cache_maximum_age: 10800,
    },
    _version: 35,
    import_from_inventory: false,
    _created: '2017-02-06 17:16:03 GMT',
    _id: '4578af53926f5b14369b5e36',
    _etag: '24b527a682431365be997de781bb60f909777dft',
  };

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
