# vsm-dictionary-remote-demo

<br>

## Summary

`vsm-dictionary-remote-demo` is a tiny, partial example-implementation
of the 'VsmDictionary' parent-class/interface (from the package
[`vsm-dictionary`](https://github.com/vsm/vsm-dictionary)),
to demonstrate communication with a hypothetical server API.

A demo of this demo connects to a real server (see at end).

<br>

## Background

- [VSM-sentences](http://scicura.org/vsm/vsm.html)
  are built from terms that are linked to identifiers.
- The '[`vsm-dictionary`](https://github.com/vsm/vsm-dictionary)'
  package defines a standardized interface,
  for VSM-related tools to communicate with services
  that provide terms+IDs (e.g. a webserver API).
- It also includes the small 'VsmDictionary' parent class (/interface) that
  provides shared functionality for concrete subclasses (like this package).

<br>

## A web-connected implementation of a VsmDictionary

This is VsmDictionaryRemoteDemo:

- The name 'VsmDictionary-_Remote_-Demo' is meant to contrast with the name of
  the sibling package
  '[VsmDictionary-_Local_](https://github.com/vsm/vsm-dictionary-local)'.
- Unlike VsmDictionaryLocal which stores the data locally (=in-memory),
  VsmDictionaryRemoteDemo communicates with a remote (=online) webserver that
  stores the data and makes it accessible through an API.
- VsmDictionaryRemoteDemo extends the VsmDictionary parent class, and provides
  a bare-minimum implementation that follows the vsm-dictionary
  [specification](https://github.com/vsm/vsm-dictionary/blob/master/Dictionary.spec.md).
  - It simply makes the assumption that the webserver has a REST API that
    literally supports all the spec options, and that the server returns data
    in the exact same way as a VsmDictionary is supposed to pass it onwards.
- It has tests:  
  these shows how to make automated tests, based on mocking how
  the webserver's API would respond, using a fake-server module.
- It has a demo:  
  see the interactive demo section.

<br>

## What to use VsmDictionaryRemoteDemo for

Because of the above,

- VsmDictionaryRemoteDemo should only be used as inspiration for
  developing a VsmDictionary-subclass that interfaces with a real server API,
- and for creating automated tests for it.
- The demo (see at end) gives a live impression of how the returned
  string-search match-objects look like.

<br>

## Specification

Like all VsmDictionary subclass implementations, this package follows
the parent class
[specification](https://github.com/vsm/vsm-dictionary/blob/master/Dictionary.spec.md),
although _only a fraction of it_, without adding much more.  
&bull; <span style="font-size: smaller;">
(Note: we simply use the name 'DictionaryRemoteDemo' for VsmDictionaryRemoteDemo,
in the source code).</span>  

<br>

## Caveat

Be advised to read the comments at the `_getReqObj()` method, near the end of
[src/DictionaryRemoteDemo.js](src/DictionaryRemoteDemo.js).  
It explains how to make API requests in a way that works under Node.js,
as well as in the browser (where `XMLHttpRequest` isn't/is available, resp.).

<br>

## Tests

Run `npm test`, which runs tests with Mocha.  
Run `npm run testw`, which automatically reruns tests on any file change.

<br>

## Interactive demo in the browser

The demo makes a further subclass of VsmDictionaryRemoteDemo,
and adds code to parse the specific data that the dictionary-webservice
'[PubDictionaries.org](http://pubdictionaries.org/)' returns.  
The demo includes _only_ string-search functionality, on a single
dictionary of PubDictionaries at a time, and without support for any options.

Run `npm run demo` to start the interactive demo.
This opens a browser page with an input-field to search on PubDictionaries data,
plus a field to choose one of its ('sub'-)dictionaries.

The demo works by making a Webpack dev-server bundle all source code 
(VsmDictionaryRemoteDemo and its dependencies) and serve it to the browser.

This is useful during development, to see immediate effects of changes
to the source code (excl. the demo code).

<br>

## 'Build' configuration & demo

To use a VsmDictionary in Node.js, one can simply run `npm install` and then
use `require()`.  
But it is also convenient to have a version of the code that can just
be loaded via a &lt;script&gt;-tag in the browser.

Therefore, we included `webpack.config.js` (note: the one in the root folder,
_not_ the one in the 'demo' folder), which is a Webpack configuration file for
generating such a browser-ready package.  

By running `npm build`, the built file will appear in a 'dist' subfolder.  
A demo-use of this file can then be seen by opening `demo-build.html`
(in the 'demo' folder). (It includes a
`<script src="../dist/vsm-dictionary-remote-demo.min.js"></script>` tag).  
So after the build step, `demo-build.html` does not need Webpack to run.

Note: at the time of writing (Feb. 2019), there seems to be an issue
with conflicting Webpack-dependencies when running a fresh `npm install`.  
Therefore, in order to build your own VsmDictionary, it is recommended that
you copy the `package-lock.json` and `package.json` files from this package
and use them as a starting point for your own project, because these files refer
to a set of non-conflicting versions of the dependencies.

<br>

## License

This project is licensed under the AGPL license - see [LICENSE.md](LICENSE.md).
