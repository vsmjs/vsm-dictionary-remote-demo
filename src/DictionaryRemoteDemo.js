/*
`DictionaryRemoteDemo` is a demo implementation of a `Dictionary` subclass.

It implements the required `get...()`-type functions only.

It interfaces with a hypothetical server-API that supports the these
functions's options literally. (The required functions and options are
described in the parent class `VsmDictionary`'s specification).

It assumes that that server returns a JSON-array with requested data, which
does not need to be processed any further. It simply wraps the received array
into an `{ items: [...] }` object.
*/

const Dictionary = require('vsm-dictionary');


module.exports = class DictionaryRemoteDemo extends Dictionary {

  constructor(options) {
    var opt = options || {};
    super(opt);

    var base = opt.base || 'http://test';
    var pp = '&page=$page&perPage=$perPage';

    this.urlGetDictInfos = opt.urlGetDictInfos ||
            base + '/dic?id=$filterID&name=$filterName&sort=$sort' + pp;
    this.urlGetEntries   = opt.urlGetEntries   ||
            base + '/ent?id=$filterID&dictID=$filterDictID&z=$z&sort=$sort'+ pp;
    this.urlGetRefTerms  = opt.urlGetRefTerms  ||
            base + '/ref?str=$filterStr' + pp;
    this.urlGetMatches   = opt.urlGetMatches   ||
            base + '/mat?q=$str&dictID=$filterDictID&sort=$sortD' + pp;
  }


  getDictInfos(options, cb) {
    var o = this._prepGetOptions(options, ['id', 'name']);
    var url = this.urlGetDictInfos
      .replace('$filterID'  , o.filter.id  .join(','))
      .replace('$filterName', o.filter.name.join(','))
      .replace('$sort'      , o.sort)  // = 'id' or 'name'.
      .replace('$page'      , o.page)
      .replace('$perPage'   , o.perPage);
    this._request(url, (err, arr) => cb(err, { items: arr }));
  }


  getEntries(options, cb) {
    var o = this._prepGetOptions(options, ['id', 'dictID']);
    var url = this.urlGetEntries
      .replace('$filterID'    , o.filter.id    .join(','))
      .replace('$filterDictID', o.filter.dictID.join(','))
      .replace('$z'           , o.z            .join(','))
      .replace('$sort'        , o.sort)  // = 'dictID', 'id', or 'str'.
      .replace('$page'        , o.page)
      .replace('$perPage'     , o.perPage);
    this._request(url, (err, arr) => cb(err, { items: arr }));
  }


  getEntryMatchesForString(str, options, cb) {
    if (!str)  return cb(null, {items: []});

    var o = this._prepGetOptions(options, ['dictID'], ['dictID']);
    var url = this.urlGetMatches
      .replace('$str'         , encodeURIComponent(str))
      .replace('$filterDictID', o.filter.dictID.join(','))
      .replace('$sortD'       , o.sort  .dictID.join(','))
      .replace('$z'           , o.z            .join(','))
      .replace('$page'        , o.page)
      .replace('$perPage'     , o.perPage);

    // When using a real, third party database-server, some processing on the
    // received array/data would happen first.
    this._request(url, (err, arr) => cb(err, { items: arr }));
  }


  // Returns an `options` object, brought into standard form:
  // - it ensures that `options` has `filter` property,
  //   and also a `sort` property (only if a `sortProps[]` argument is given);
  // - it ensures that these have certain subproperties, as requested in arg2&3;
  //   each newly created subprops will be an empty Array;
  // - it URL-encodes the Strings in the existing subproperties' arrays;
  // - it prepares `z`, `page`, and `perPage` to be put in a URL.
  _prepGetOptions(options, filterProps = [], sortProps) {
    var o = { filter: {} };
    if (sortProps)  o.sort = {}; // If given `sortProps`, ensure `o.sort` exists.
    o = Object.assign(o, options);

    var enc = encodeURIComponent;

    // `o.filter` is an Object, and its props are Arrays.  URL-encode the elems.
    filterProps.forEach(k => {
      o.filter[k] = (o.filter[k] || []).map(s => enc(s));
    });

    // If a `sortProps` is given, then `o.sort` is an Object like `o.filter`.
    if (sortProps) {
      sortProps = sortProps.forEach(k => {
        o.sort[k] = (o.sort[k] || []).map(s => enc(s));
      });
    }
    else  o.sort = enc(o.sort || '');  // Else, `o.sort` is just a String.

    // Make `o.z` a join()'able array of URL-encoded Strings.
    o.z = (typeof o.z === 'undefined' || o.z === true) ? ['true'] :
      [].concat(o.z).map(s => enc(s));

    o.page    = enc(o.page    || '');
    o.perPage = enc(o.perPage || '');

    return o;
  }


  _getReqObj() {
    /*
    1. In the browser, we have to use a 'XMLHttpRequest' object for requests.
       But in Node.js (our development and testing environment), this object
       is not available. Therefore in Node, we wrap Node's http.get() into a
       similar object, which is what the npm package `xmlhttprequest` does.
    2. When bundling this DictionaryRemoteDemo for the browser, with webpack,
       `webpack.config` should include `node: {child_process: 'empty'}`.
       Or better (or, in addition):
       it should string-replace "require('xmlhttprequest')" by "{}", so that
       the `xmlhttprequest` package does not get bundled at all!
       + This XMLHttpRequest-switching setup must also be used by other, future
         `vsm-dictionary-remote-...`s, **SO THAT THEY WORK IN THE BROWSER TOO**;
         and the package-eliminating setup should be used when webpack'ing
         future, browser-based modules that include a `vsm-dictionary-remote..`.
    3. By placing this in a separate function, we also make this request-
       object replacable and spy-upon'able, for testing. This would be useful
       if we ever need to make testing work in both Node.js and the browser.
    */
    return new (typeof XMLHttpRequest !== 'undefined' ?
      XMLHttpRequest :  // In browser.
      require('xmlhttprequest').XMLHttpRequest  // In Node.js.
    )();
  }


  _request(url, cb) {
    var req = this._getReqObj();
    req.onreadystatechange = function () {
      if (req.readyState == 4) {
        if (req.status != 200)  cb('Error: req.status = ' + req.status);
        else {
          try {
            var arr = JSON.parse(req.responseText);
            if (!Array.isArray(arr)) {
              return cb('The server did not send an Array');
            }
            cb(null, arr);
          }
          catch (err) { cb(err) }
        }
      }
    };
    req.open('GET', url, true);
    req.send();
  }

};
