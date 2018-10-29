const DictionaryRemoteDemo = require('./DictionaryRemoteDemo');
const chai = require('chai');  chai.should();
const expect = chai.expect;
const nock = require('nock');

// Allow callbacks to look like "(err, res) => .." even if not using these args.
/* eslint no-unused-vars: ['error', { 'argsIgnorePattern': '^err|res$' }] */



describe('DictionaryRemoteDemo.js', () => {

  var urlBase = 'http://test';
  var dict = new DictionaryRemoteDemo({base: urlBase});


  // We use the 'nock' package for testing HTTP requests. 'Nock' acts like
  // a fake server, by overriding Node.js's `http.request()`, and it responds to
  // specified URLs.
  // (Note: 'nock' works with Node.js, while the 'sinon' package would override
  //  the XMLHttpRequest object that is only available in browser-environments).
  before(() => {
    // [Disabled this line until nock's `enableNetConnect()` works again...]:
    // nock.disableNetConnect();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  after(() => {
    nock.enableNetConnect();
  });


  // Make a shorthand function, for preparing HTTP-replies with a stringified
  // array,
  // so instead of:     `nock.reply(200, () => JSON.stringify(['a', 'b']));`,
  // we can just write: `nock.reply(...R('a', 'b'));`.
  var R = (...args) => [200, () => JSON.stringify([...args])];


  describe('_prepGetOptions()', () => {
    it('properly encodes the `options` properties\' values as URI components ' +
       'and also adds a `z`-property' , () => {
      var opt = {
        filter: { id: ['A$', 'B$'] },
        sort: 'id',
        page: 2,
        perPage: 5
      };
      dict._prepGetOptions(opt, ['id'])
        .should.deep.equal({
          filter: { id: [ 'A%24', 'B%24' ] },
          sort: 'id',
          page: '2',
          perPage: '5',
          z: [ 'true' ]
        });
    });

    it('returns a default, non-empty options object when `options` is ' +
       '`{}`', () => {
      dict._prepGetOptions({}, []).should.deep.equal(
        { filter: {}, sort: '', z: [ 'true' ], page: '', perPage: '' } );
    });

    it('adds a proper sort property, when called with sortKeys (3rd arg) and ' +
       'no sort property is defined in the initial options object', () => {
      dict._prepGetOptions(
        { filter: { dictID: ['somedictID'] } }, ['dictID'], ['dictID']
      )
        .should.deep.equal({
          filter: { dictID: [ 'somedictID' ] },
          sort: { dictID: [] },
          z: [ 'true' ],
          page: '',
          perPage: ''
        });
    });
  });


  describe('getDictInfos()', () => {
    it('calls its URL with given options filled in, URL-encoded; ' +
       'and returns the data it got back, JSON-parsed', cb => {
      var opt = {
        filter: {id: ['A', 'B']},
        page: 2,  perPage: 5
      };
      // - A test only succeeds if 'dict' actually requests the specified URL.
      // - We only test that DictionaryRemoteDemo will pass through any array
      //   it is given by a server, so we do not need to bother with real
      //   dictInfo/entry/etc-objects.
      nock(urlBase)
        .get('/dic?id=A,B&page=2&perPage=5')
        .reply(...R('test'));  // See explanation above.
      dict.getDictInfos(opt, (err, res) => {
        expect(err).to.equal(null);
        res.should.deep.equal({items: ['test']});
        cb();
      });
    });

    it('calls its URL, also with no options given', cb => {
      nock(urlBase)
        .get('/dic?id=&page=&perPage=')
        .reply(...R('test'));
      dict.getDictInfos({}, (err, res) => {
        expect(err).to.equal(null);
        res.should.deep.equal({items: ['test']});
        cb();
      });
    });
  });


  describe('getEntries()', () => {
    it('calls its URL with given options filled in, URL-encoded; ' +
       'and returns the data it got back, JSON-parsed', cb => {
      var opt = {
        filter: { id: ['A:01'], dictID: ['A'] },
        sort: 'dictID',
        z: true,  page: 2,  perPage: 5
      };
      nock(urlBase)
        .get('/ent?id=A%3A01&dictID=A&z=true&sort=dictID&page=2&perPage=5')
        .reply(...R('test'));
      dict.getEntries(opt, (err, res) => {
        expect(err).to.equal(null);
        res.should.deep.equal({items: ['test']});
        cb();
      });
    });

    it('calls its URL, also with no options given', cb => {
      nock(urlBase)
        .get('/ent?id=&dictID=&z=true&sort=&page=&perPage=')
        .reply(...R('test'));
      dict.getEntries({}, (err, res) => {
        expect(err).to.equal(null);
        res.should.deep.equal({items: ['test']});
        cb();
      });
    });

    it('calls its URL, also when requesting no `z` property', cb => {
      nock(urlBase)
        .get('/ent?id=&dictID=&z=&sort=&page=&perPage=')
        .reply(...R('test'));
      dict.getEntries({z: []}, (err, res) => {
        expect(err).to.equal(null);
        res.should.deep.equal({items: ['test']});
        cb();
      });
    });

    it('calls its URL, also with z-pruning', cb => {
      nock(urlBase)
        .get('/ent?id=&dictID=&z=x,y,z,A%24&sort=&page=&perPage=')
        .reply(...R('test'));
      dict.getEntries({z: ['x', 'y', 'z', 'A$']}, (err, res) => {
        expect(err).to.equal(null);
        res.should.deep.equal({items: ['test']});
        cb();
      });
    });
  });


  describe('getMatchesForString()', () => {
    it('calls its URL with given options filled in, URL-encoded; ' +
       'and returns the data it got back, JSON-parsed', cb => {
      var opt = {
        filter: {dictID: ['A', 'B', 'C']}, sort: {dictID: ['A', 'B']},
        z: 'x',  page: 2,  perPage: 5
      };
      nock(urlBase)
        .get('/mat?q=ab%20c&dictID=A,B,C&sort=A,B&page=2&perPage=5')
        .reply(...R('test'));
      dict.getMatchesForString('ab c', opt, (err, res) => {
        expect(err).to.equal(null);
        res.should.deep.equal({items: ['test']});
        cb();
      });
    });

    it('calls its URL, also with no options given', cb => {
      var called = false;
      nock(urlBase)
        .get('/mat?q=x&dictID=&sort=&page=&perPage=')
        .reply(...R('test'))
        .on('replied', () => { called = true });
      dict.getMatchesForString('x', {}, (err, res) => {
        expect(err).to.equal(null);
        called.should.equal(true);  // Test that this works, for the next test.
        res.should.deep.equal({items: ['test']});
        cb();
      });
    });

    it('for an empty string, makes no server-request and ' +
       'returns an empty list', cb => {
      var called = false;
      nock(urlBase)
        .on('replied', () => { called = true });
      dict.getMatchesForString('', {}, (err, res) => {
        expect(err).to.equal(null);
        called.should.equal(false);  // Test that no request was made.
        res.should.deep.equal({items: []});
        cb();
      });
    });

    it('lets the parent class add a number-string match', cb => {
      nock(urlBase)
        .get('/mat?q=5&dictID=&sort=&page=&perPage=')
        .reply(...R('test'));
      dict.getMatchesForString('5', {}, (err, res) => {
        res.should.deep.equal({items: [
          { id:'00:5e+0', dictID:'00', str:'5', descr:'number', type:'N' },
          'test',
        ]});
        cb();
      });
    });

    it('lets the parent class add a default refTerm match', cb => {
      nock(urlBase)
        .get('/mat?q=it&dictID=&sort=&page=&perPage=')
        .reply(...R('test'));
      dict.getMatchesForString('it', {}, (err, res) => {
        res.should.deep.equal({items: [
          { id:'', dictID:'', str:'it', descr:'referring term', type:'R' },
          'test',
        ]});
        cb();
      });
    });

    it('reports JSON.parse() errors', cb => {
      nock(urlBase)
        .get('/mat?q=5&dictID=&sort=&page=&perPage=')
        .reply(200, () => 'not a JSON string');  // Make it send invalid data.
      dict.getMatchesForString('5', {}, (err, res) => {
        // It should forward a JSON-parsing error, which we receive here:
        err.toString().startsWith('SyntaxError').should.equal(true);
        cb();
      });
    });

    it('reports error when the server does not reply with a JSON array', cb => {
      nock(urlBase)
        .get('/mat?q=5&dictID=&sort=&page=&perPage=')
        .reply(200, () => '"not an Array"');
      dict.getMatchesForString('5', {}, (err, res) => {
        err.should.equal('The server did not send an Array');
        cb();
      });
    });
  });


  describe('Simple demo-subclass that fetches & parses string-matches ' +
    'from (fake-served) pubdictionaries.org (using 1 subdictionary ' +
    'only)', () => {

    // 1.) Make a subclass of DictionaryRemoteDemo, that adds a layer of code
    // that parses the specific data that pubdictionaries.org returns.
    class DictionaryPubDictionaries extends DictionaryRemoteDemo {
      constructor(options) {
        super(options);
        this.urlGetMatches = 'http://pubdictionaries.org' +
          '/dictionaries/$filterDictID/prefix_completion?term=$str';
      }
      getMatchesForString(str, options, cb) {
        super.getMatchesForString(str, options, (err, res) => {
          if (err)  return cb(err);
          var arr = res.items.map(e => e.type ?
            e :  // Don't convert N/R match-objects generated by parent class.
            ({
              id:     e.identifier,
              dictID: options.filter.dictID[0],
              str:    e.label,
              type:   e.label.startsWith(str) ? 'S' : 'T',
              z: {
                dictionary_id: e.dictionary_id,
                id: e.id
              }
            })
          );
          cb(err, {items: arr});
        });
      }
    }

    it('returns match-objects for entries that match a string', cb => {
      // 2.) Set up 'nock' so it replies to the URL
      // that DictionaryPubDictionaries is supposed to request to.
      var str = 'cell b';
      var dictID = 'GO-BP';
      nock('http://pubdictionaries.org')
        .get(`/dictionaries/${encodeURIComponent(dictID)}` +
             `/prefix_completion?term=${encodeURIComponent(str)}`)
        .reply(...R(  // We use a copy of data once returned by the real server:
          {
            created_at: '2016-10-23T18:19:08Z',
            dictionary_id: 2,
            id: 28316,
            identifier: 'http://purl.obolibrary.org/obo/GO_0007114',
            label: 'cell budding',
            label_length: 12,
            mode: 0,
            norm1: 'cellbudding',
            norm2: 'cellbud',
            updated_at: '2016-10-23T18:19:08Z'
          },
          {
            created_at: '2016-10-23T18:19:50Z',
            dictionary_id: 2,
            id: 48701,
            identifier: 'http://purl.obolibrary.org/obo/GO_0032060',
            label: 'cell blebbing',
            label_length: 13,
            mode: 0,
            norm1: 'cellblebbing',
            norm2: 'cellbleb',
            updated_at: '2016-10-23T18:19:50Z'
          }
        ));

      // 3.) Run the actual test.
      var dict = new DictionaryPubDictionaries();
      dict.getMatchesForString(str, {filter: {dictID: [dictID]}}, (err, res) => {
        expect(err).to.equal(null);
        res.items.should.deep.equal([
          {
            id:     'http://purl.obolibrary.org/obo/GO_0007114',
            dictID: dictID,
            str:    'cell budding',
            type:   'S',
            z: {
              dictionary_id: 2,
              id: 28316,
            }
          },
          {
            id:     'http://purl.obolibrary.org/obo/GO_0032060',
            dictID: dictID,
            str:    'cell blebbing',
            type:   'S',
            z: {
              dictionary_id: 2,
              id: 48701,
            }
          }
        ]);
        cb();
      });
    });
  });
});
