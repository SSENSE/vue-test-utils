'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Vue = _interopDefault(require('vue'));
var vueTemplateCompiler = require('vue-template-compiler');

if (typeof Element !== 'undefined' && !Element.prototype.matches) {
  Element.prototype.matches =
    Element.prototype.matchesSelector ||
    Element.prototype.mozMatchesSelector ||
    Element.prototype.msMatchesSelector ||
    Element.prototype.oMatchesSelector ||
    Element.prototype.webkitMatchesSelector ||
    function (s) {
      var matches = (this.document || this.ownerDocument).querySelectorAll(s);
      var i = matches.length;
      while (--i >= 0 && matches.item(i) !== this) {}
      return i > -1
    };
}

if (typeof Object.assign !== 'function') {
  (function () {
    Object.assign = function (target) {
      var arguments$1 = arguments;

      if (target === undefined || target === null) {
        throw new TypeError('Cannot convert undefined or null to object')
      }

      var output = Object(target);
      for (var index = 1; index < arguments.length; index++) {
        var source = arguments$1[index];
        if (source !== undefined && source !== null) {
          for (var nextKey in source) {
            if (source.hasOwnProperty(nextKey)) {
              output[nextKey] = source[nextKey];
            }
          }
        }
      }
      return output
    };
  })();
}

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var semver = createCommonjsModule(function (module, exports) {
exports = module.exports = SemVer;

// The debug function is excluded entirely from the minified version.
/* nomin */ var debug;
/* nomin */ if (typeof process === 'object' &&
    /* nomin */ process.env &&
    /* nomin */ process.env.NODE_DEBUG &&
    /* nomin */ /\bsemver\b/i.test(process.env.NODE_DEBUG))
  /* nomin */ { debug = function() {
    /* nomin */ var args = Array.prototype.slice.call(arguments, 0);
    /* nomin */ args.unshift('SEMVER');
    /* nomin */ console.log.apply(console, args);
    /* nomin */ }; }
/* nomin */ else
  /* nomin */ { debug = function() {}; }

// Note: this is the semver.org version of the spec that it implements
// Not necessarily the package version of this code.
exports.SEMVER_SPEC_VERSION = '2.0.0';

var MAX_LENGTH = 256;
var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || 9007199254740991;

// Max safe segment length for coercion.
var MAX_SAFE_COMPONENT_LENGTH = 16;

// The actual regexps go on exports.re
var re = exports.re = [];
var src = exports.src = [];
var R = 0;

// The following Regular Expressions can be used for tokenizing,
// validating, and parsing SemVer version strings.

// ## Numeric Identifier
// A single `0`, or a non-zero digit followed by zero or more digits.

var NUMERICIDENTIFIER = R++;
src[NUMERICIDENTIFIER] = '0|[1-9]\\d*';
var NUMERICIDENTIFIERLOOSE = R++;
src[NUMERICIDENTIFIERLOOSE] = '[0-9]+';


// ## Non-numeric Identifier
// Zero or more digits, followed by a letter or hyphen, and then zero or
// more letters, digits, or hyphens.

var NONNUMERICIDENTIFIER = R++;
src[NONNUMERICIDENTIFIER] = '\\d*[a-zA-Z-][a-zA-Z0-9-]*';


// ## Main Version
// Three dot-separated numeric identifiers.

var MAINVERSION = R++;
src[MAINVERSION] = '(' + src[NUMERICIDENTIFIER] + ')\\.' +
                   '(' + src[NUMERICIDENTIFIER] + ')\\.' +
                   '(' + src[NUMERICIDENTIFIER] + ')';

var MAINVERSIONLOOSE = R++;
src[MAINVERSIONLOOSE] = '(' + src[NUMERICIDENTIFIERLOOSE] + ')\\.' +
                        '(' + src[NUMERICIDENTIFIERLOOSE] + ')\\.' +
                        '(' + src[NUMERICIDENTIFIERLOOSE] + ')';

// ## Pre-release Version Identifier
// A numeric identifier, or a non-numeric identifier.

var PRERELEASEIDENTIFIER = R++;
src[PRERELEASEIDENTIFIER] = '(?:' + src[NUMERICIDENTIFIER] +
                            '|' + src[NONNUMERICIDENTIFIER] + ')';

var PRERELEASEIDENTIFIERLOOSE = R++;
src[PRERELEASEIDENTIFIERLOOSE] = '(?:' + src[NUMERICIDENTIFIERLOOSE] +
                                 '|' + src[NONNUMERICIDENTIFIER] + ')';


// ## Pre-release Version
// Hyphen, followed by one or more dot-separated pre-release version
// identifiers.

var PRERELEASE = R++;
src[PRERELEASE] = '(?:-(' + src[PRERELEASEIDENTIFIER] +
                  '(?:\\.' + src[PRERELEASEIDENTIFIER] + ')*))';

var PRERELEASELOOSE = R++;
src[PRERELEASELOOSE] = '(?:-?(' + src[PRERELEASEIDENTIFIERLOOSE] +
                       '(?:\\.' + src[PRERELEASEIDENTIFIERLOOSE] + ')*))';

// ## Build Metadata Identifier
// Any combination of digits, letters, or hyphens.

var BUILDIDENTIFIER = R++;
src[BUILDIDENTIFIER] = '[0-9A-Za-z-]+';

// ## Build Metadata
// Plus sign, followed by one or more period-separated build metadata
// identifiers.

var BUILD = R++;
src[BUILD] = '(?:\\+(' + src[BUILDIDENTIFIER] +
             '(?:\\.' + src[BUILDIDENTIFIER] + ')*))';


// ## Full Version String
// A main version, followed optionally by a pre-release version and
// build metadata.

// Note that the only major, minor, patch, and pre-release sections of
// the version string are capturing groups.  The build metadata is not a
// capturing group, because it should not ever be used in version
// comparison.

var FULL = R++;
var FULLPLAIN = 'v?' + src[MAINVERSION] +
                src[PRERELEASE] + '?' +
                src[BUILD] + '?';

src[FULL] = '^' + FULLPLAIN + '$';

// like full, but allows v1.2.3 and =1.2.3, which people do sometimes.
// also, 1.0.0alpha1 (prerelease without the hyphen) which is pretty
// common in the npm registry.
var LOOSEPLAIN = '[v=\\s]*' + src[MAINVERSIONLOOSE] +
                 src[PRERELEASELOOSE] + '?' +
                 src[BUILD] + '?';

var LOOSE = R++;
src[LOOSE] = '^' + LOOSEPLAIN + '$';

var GTLT = R++;
src[GTLT] = '((?:<|>)?=?)';

// Something like "2.*" or "1.2.x".
// Note that "x.x" is a valid xRange identifer, meaning "any version"
// Only the first item is strictly required.
var XRANGEIDENTIFIERLOOSE = R++;
src[XRANGEIDENTIFIERLOOSE] = src[NUMERICIDENTIFIERLOOSE] + '|x|X|\\*';
var XRANGEIDENTIFIER = R++;
src[XRANGEIDENTIFIER] = src[NUMERICIDENTIFIER] + '|x|X|\\*';

var XRANGEPLAIN = R++;
src[XRANGEPLAIN] = '[v=\\s]*(' + src[XRANGEIDENTIFIER] + ')' +
                   '(?:\\.(' + src[XRANGEIDENTIFIER] + ')' +
                   '(?:\\.(' + src[XRANGEIDENTIFIER] + ')' +
                   '(?:' + src[PRERELEASE] + ')?' +
                   src[BUILD] + '?' +
                   ')?)?';

var XRANGEPLAINLOOSE = R++;
src[XRANGEPLAINLOOSE] = '[v=\\s]*(' + src[XRANGEIDENTIFIERLOOSE] + ')' +
                        '(?:\\.(' + src[XRANGEIDENTIFIERLOOSE] + ')' +
                        '(?:\\.(' + src[XRANGEIDENTIFIERLOOSE] + ')' +
                        '(?:' + src[PRERELEASELOOSE] + ')?' +
                        src[BUILD] + '?' +
                        ')?)?';

var XRANGE = R++;
src[XRANGE] = '^' + src[GTLT] + '\\s*' + src[XRANGEPLAIN] + '$';
var XRANGELOOSE = R++;
src[XRANGELOOSE] = '^' + src[GTLT] + '\\s*' + src[XRANGEPLAINLOOSE] + '$';

// Coercion.
// Extract anything that could conceivably be a part of a valid semver
var COERCE = R++;
src[COERCE] = '(?:^|[^\\d])' +
              '(\\d{1,' + MAX_SAFE_COMPONENT_LENGTH + '})' +
              '(?:\\.(\\d{1,' + MAX_SAFE_COMPONENT_LENGTH + '}))?' +
              '(?:\\.(\\d{1,' + MAX_SAFE_COMPONENT_LENGTH + '}))?' +
              '(?:$|[^\\d])';

// Tilde ranges.
// Meaning is "reasonably at or greater than"
var LONETILDE = R++;
src[LONETILDE] = '(?:~>?)';

var TILDETRIM = R++;
src[TILDETRIM] = '(\\s*)' + src[LONETILDE] + '\\s+';
re[TILDETRIM] = new RegExp(src[TILDETRIM], 'g');
var tildeTrimReplace = '$1~';

var TILDE = R++;
src[TILDE] = '^' + src[LONETILDE] + src[XRANGEPLAIN] + '$';
var TILDELOOSE = R++;
src[TILDELOOSE] = '^' + src[LONETILDE] + src[XRANGEPLAINLOOSE] + '$';

// Caret ranges.
// Meaning is "at least and backwards compatible with"
var LONECARET = R++;
src[LONECARET] = '(?:\\^)';

var CARETTRIM = R++;
src[CARETTRIM] = '(\\s*)' + src[LONECARET] + '\\s+';
re[CARETTRIM] = new RegExp(src[CARETTRIM], 'g');
var caretTrimReplace = '$1^';

var CARET = R++;
src[CARET] = '^' + src[LONECARET] + src[XRANGEPLAIN] + '$';
var CARETLOOSE = R++;
src[CARETLOOSE] = '^' + src[LONECARET] + src[XRANGEPLAINLOOSE] + '$';

// A simple gt/lt/eq thing, or just "" to indicate "any version"
var COMPARATORLOOSE = R++;
src[COMPARATORLOOSE] = '^' + src[GTLT] + '\\s*(' + LOOSEPLAIN + ')$|^$';
var COMPARATOR = R++;
src[COMPARATOR] = '^' + src[GTLT] + '\\s*(' + FULLPLAIN + ')$|^$';


// An expression to strip any whitespace between the gtlt and the thing
// it modifies, so that `> 1.2.3` ==> `>1.2.3`
var COMPARATORTRIM = R++;
src[COMPARATORTRIM] = '(\\s*)' + src[GTLT] +
                      '\\s*(' + LOOSEPLAIN + '|' + src[XRANGEPLAIN] + ')';

// this one has to use the /g flag
re[COMPARATORTRIM] = new RegExp(src[COMPARATORTRIM], 'g');
var comparatorTrimReplace = '$1$2$3';


// Something like `1.2.3 - 1.2.4`
// Note that these all use the loose form, because they'll be
// checked against either the strict or loose comparator form
// later.
var HYPHENRANGE = R++;
src[HYPHENRANGE] = '^\\s*(' + src[XRANGEPLAIN] + ')' +
                   '\\s+-\\s+' +
                   '(' + src[XRANGEPLAIN] + ')' +
                   '\\s*$';

var HYPHENRANGELOOSE = R++;
src[HYPHENRANGELOOSE] = '^\\s*(' + src[XRANGEPLAINLOOSE] + ')' +
                        '\\s+-\\s+' +
                        '(' + src[XRANGEPLAINLOOSE] + ')' +
                        '\\s*$';

// Star ranges basically just allow anything at all.
var STAR = R++;
src[STAR] = '(<|>)?=?\\s*\\*';

// Compile to actual regexp objects.
// All are flag-free, unless they were created above with a flag.
for (var i = 0; i < R; i++) {
  debug(i, src[i]);
  if (!re[i])
    { re[i] = new RegExp(src[i]); }
}

exports.parse = parse;
function parse(version, options) {
  if (!options || typeof options !== 'object')
    { options = { loose: !!options, includePrerelease: false }; }

  if (version instanceof SemVer)
    { return version; }

  if (typeof version !== 'string')
    { return null; }

  if (version.length > MAX_LENGTH)
    { return null; }

  var r = options.loose ? re[LOOSE] : re[FULL];
  if (!r.test(version))
    { return null; }

  try {
    return new SemVer(version, options);
  } catch (er) {
    return null;
  }
}

exports.valid = valid;
function valid(version, options) {
  var v = parse(version, options);
  return v ? v.version : null;
}


exports.clean = clean;
function clean(version, options) {
  var s = parse(version.trim().replace(/^[=v]+/, ''), options);
  return s ? s.version : null;
}

exports.SemVer = SemVer;

function SemVer(version, options) {
  if (!options || typeof options !== 'object')
    { options = { loose: !!options, includePrerelease: false }; }
  if (version instanceof SemVer) {
    if (version.loose === options.loose)
      { return version; }
    else
      { version = version.version; }
  } else if (typeof version !== 'string') {
    throw new TypeError('Invalid Version: ' + version);
  }

  if (version.length > MAX_LENGTH)
    { throw new TypeError('version is longer than ' + MAX_LENGTH + ' characters') }

  if (!(this instanceof SemVer))
    { return new SemVer(version, options); }

  debug('SemVer', version, options);
  this.options = options;
  this.loose = !!options.loose;

  var m = version.trim().match(options.loose ? re[LOOSE] : re[FULL]);

  if (!m)
    { throw new TypeError('Invalid Version: ' + version); }

  this.raw = version;

  // these are actually numbers
  this.major = +m[1];
  this.minor = +m[2];
  this.patch = +m[3];

  if (this.major > MAX_SAFE_INTEGER || this.major < 0)
    { throw new TypeError('Invalid major version') }

  if (this.minor > MAX_SAFE_INTEGER || this.minor < 0)
    { throw new TypeError('Invalid minor version') }

  if (this.patch > MAX_SAFE_INTEGER || this.patch < 0)
    { throw new TypeError('Invalid patch version') }

  // numberify any prerelease numeric ids
  if (!m[4])
    { this.prerelease = []; }
  else
    { this.prerelease = m[4].split('.').map(function(id) {
      if (/^[0-9]+$/.test(id)) {
        var num = +id;
        if (num >= 0 && num < MAX_SAFE_INTEGER)
          { return num; }
      }
      return id;
    }); }

  this.build = m[5] ? m[5].split('.') : [];
  this.format();
}

SemVer.prototype.format = function() {
  this.version = this.major + '.' + this.minor + '.' + this.patch;
  if (this.prerelease.length)
    { this.version += '-' + this.prerelease.join('.'); }
  return this.version;
};

SemVer.prototype.toString = function() {
  return this.version;
};

SemVer.prototype.compare = function(other) {
  debug('SemVer.compare', this.version, this.options, other);
  if (!(other instanceof SemVer))
    { other = new SemVer(other, this.options); }

  return this.compareMain(other) || this.comparePre(other);
};

SemVer.prototype.compareMain = function(other) {
  if (!(other instanceof SemVer))
    { other = new SemVer(other, this.options); }

  return compareIdentifiers(this.major, other.major) ||
         compareIdentifiers(this.minor, other.minor) ||
         compareIdentifiers(this.patch, other.patch);
};

SemVer.prototype.comparePre = function(other) {
  var this$1 = this;

  if (!(other instanceof SemVer))
    { other = new SemVer(other, this.options); }

  // NOT having a prerelease is > having one
  if (this.prerelease.length && !other.prerelease.length)
    { return -1; }
  else if (!this.prerelease.length && other.prerelease.length)
    { return 1; }
  else if (!this.prerelease.length && !other.prerelease.length)
    { return 0; }

  var i = 0;
  do {
    var a = this$1.prerelease[i];
    var b = other.prerelease[i];
    debug('prerelease compare', i, a, b);
    if (a === undefined && b === undefined)
      { return 0; }
    else if (b === undefined)
      { return 1; }
    else if (a === undefined)
      { return -1; }
    else if (a === b)
      { continue; }
    else
      { return compareIdentifiers(a, b); }
  } while (++i);
};

// preminor will bump the version up to the next minor release, and immediately
// down to pre-release. premajor and prepatch work the same way.
SemVer.prototype.inc = function(release, identifier) {
  var this$1 = this;

  switch (release) {
    case 'premajor':
      this.prerelease.length = 0;
      this.patch = 0;
      this.minor = 0;
      this.major++;
      this.inc('pre', identifier);
      break;
    case 'preminor':
      this.prerelease.length = 0;
      this.patch = 0;
      this.minor++;
      this.inc('pre', identifier);
      break;
    case 'prepatch':
      // If this is already a prerelease, it will bump to the next version
      // drop any prereleases that might already exist, since they are not
      // relevant at this point.
      this.prerelease.length = 0;
      this.inc('patch', identifier);
      this.inc('pre', identifier);
      break;
    // If the input is a non-prerelease version, this acts the same as
    // prepatch.
    case 'prerelease':
      if (this.prerelease.length === 0)
        { this.inc('patch', identifier); }
      this.inc('pre', identifier);
      break;

    case 'major':
      // If this is a pre-major version, bump up to the same major version.
      // Otherwise increment major.
      // 1.0.0-5 bumps to 1.0.0
      // 1.1.0 bumps to 2.0.0
      if (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0)
        { this.major++; }
      this.minor = 0;
      this.patch = 0;
      this.prerelease = [];
      break;
    case 'minor':
      // If this is a pre-minor version, bump up to the same minor version.
      // Otherwise increment minor.
      // 1.2.0-5 bumps to 1.2.0
      // 1.2.1 bumps to 1.3.0
      if (this.patch !== 0 || this.prerelease.length === 0)
        { this.minor++; }
      this.patch = 0;
      this.prerelease = [];
      break;
    case 'patch':
      // If this is not a pre-release version, it will increment the patch.
      // If it is a pre-release it will bump up to the same patch version.
      // 1.2.0-5 patches to 1.2.0
      // 1.2.0 patches to 1.2.1
      if (this.prerelease.length === 0)
        { this.patch++; }
      this.prerelease = [];
      break;
    // This probably shouldn't be used publicly.
    // 1.0.0 "pre" would become 1.0.0-0 which is the wrong direction.
    case 'pre':
      if (this.prerelease.length === 0)
        { this.prerelease = [0]; }
      else {
        var i = this.prerelease.length;
        while (--i >= 0) {
          if (typeof this$1.prerelease[i] === 'number') {
            this$1.prerelease[i]++;
            i = -2;
          }
        }
        if (i === -1) // didn't increment anything
          { this.prerelease.push(0); }
      }
      if (identifier) {
        // 1.2.0-beta.1 bumps to 1.2.0-beta.2,
        // 1.2.0-beta.fooblz or 1.2.0-beta bumps to 1.2.0-beta.0
        if (this.prerelease[0] === identifier) {
          if (isNaN(this.prerelease[1]))
            { this.prerelease = [identifier, 0]; }
        } else
          { this.prerelease = [identifier, 0]; }
      }
      break;

    default:
      throw new Error('invalid increment argument: ' + release);
  }
  this.format();
  this.raw = this.version;
  return this;
};

exports.inc = inc;
function inc(version, release, loose, identifier) {
  if (typeof(loose) === 'string') {
    identifier = loose;
    loose = undefined;
  }

  try {
    return new SemVer(version, loose).inc(release, identifier).version;
  } catch (er) {
    return null;
  }
}

exports.diff = diff;
function diff(version1, version2) {
  if (eq(version1, version2)) {
    return null;
  } else {
    var v1 = parse(version1);
    var v2 = parse(version2);
    if (v1.prerelease.length || v2.prerelease.length) {
      for (var key in v1) {
        if (key === 'major' || key === 'minor' || key === 'patch') {
          if (v1[key] !== v2[key]) {
            return 'pre'+key;
          }
        }
      }
      return 'prerelease';
    }
    for (var key in v1) {
      if (key === 'major' || key === 'minor' || key === 'patch') {
        if (v1[key] !== v2[key]) {
          return key;
        }
      }
    }
  }
}

exports.compareIdentifiers = compareIdentifiers;

var numeric = /^[0-9]+$/;
function compareIdentifiers(a, b) {
  var anum = numeric.test(a);
  var bnum = numeric.test(b);

  if (anum && bnum) {
    a = +a;
    b = +b;
  }

  return (anum && !bnum) ? -1 :
         (bnum && !anum) ? 1 :
         a < b ? -1 :
         a > b ? 1 :
         0;
}

exports.rcompareIdentifiers = rcompareIdentifiers;
function rcompareIdentifiers(a, b) {
  return compareIdentifiers(b, a);
}

exports.major = major;
function major(a, loose) {
  return new SemVer(a, loose).major;
}

exports.minor = minor;
function minor(a, loose) {
  return new SemVer(a, loose).minor;
}

exports.patch = patch;
function patch(a, loose) {
  return new SemVer(a, loose).patch;
}

exports.compare = compare;
function compare(a, b, loose) {
  return new SemVer(a, loose).compare(new SemVer(b, loose));
}

exports.compareLoose = compareLoose;
function compareLoose(a, b) {
  return compare(a, b, true);
}

exports.rcompare = rcompare;
function rcompare(a, b, loose) {
  return compare(b, a, loose);
}

exports.sort = sort;
function sort(list, loose) {
  return list.sort(function(a, b) {
    return exports.compare(a, b, loose);
  });
}

exports.rsort = rsort;
function rsort(list, loose) {
  return list.sort(function(a, b) {
    return exports.rcompare(a, b, loose);
  });
}

exports.gt = gt;
function gt(a, b, loose) {
  return compare(a, b, loose) > 0;
}

exports.lt = lt;
function lt(a, b, loose) {
  return compare(a, b, loose) < 0;
}

exports.eq = eq;
function eq(a, b, loose) {
  return compare(a, b, loose) === 0;
}

exports.neq = neq;
function neq(a, b, loose) {
  return compare(a, b, loose) !== 0;
}

exports.gte = gte;
function gte(a, b, loose) {
  return compare(a, b, loose) >= 0;
}

exports.lte = lte;
function lte(a, b, loose) {
  return compare(a, b, loose) <= 0;
}

exports.cmp = cmp;
function cmp(a, op, b, loose) {
  var ret;
  switch (op) {
    case '===':
      if (typeof a === 'object') { a = a.version; }
      if (typeof b === 'object') { b = b.version; }
      ret = a === b;
      break;
    case '!==':
      if (typeof a === 'object') { a = a.version; }
      if (typeof b === 'object') { b = b.version; }
      ret = a !== b;
      break;
    case '': case '=': case '==': ret = eq(a, b, loose); break;
    case '!=': ret = neq(a, b, loose); break;
    case '>': ret = gt(a, b, loose); break;
    case '>=': ret = gte(a, b, loose); break;
    case '<': ret = lt(a, b, loose); break;
    case '<=': ret = lte(a, b, loose); break;
    default: throw new TypeError('Invalid operator: ' + op);
  }
  return ret;
}

exports.Comparator = Comparator;
function Comparator(comp, options) {
  if (!options || typeof options !== 'object')
    { options = { loose: !!options, includePrerelease: false }; }

  if (comp instanceof Comparator) {
    if (comp.loose === !!options.loose)
      { return comp; }
    else
      { comp = comp.value; }
  }

  if (!(this instanceof Comparator))
    { return new Comparator(comp, options); }

  debug('comparator', comp, options);
  this.options = options;
  this.loose = !!options.loose;
  this.parse(comp);

  if (this.semver === ANY)
    { this.value = ''; }
  else
    { this.value = this.operator + this.semver.version; }

  debug('comp', this);
}

var ANY = {};
Comparator.prototype.parse = function(comp) {
  var r = this.options.loose ? re[COMPARATORLOOSE] : re[COMPARATOR];
  var m = comp.match(r);

  if (!m)
    { throw new TypeError('Invalid comparator: ' + comp); }

  this.operator = m[1];
  if (this.operator === '=')
    { this.operator = ''; }

  // if it literally is just '>' or '' then allow anything.
  if (!m[2])
    { this.semver = ANY; }
  else
    { this.semver = new SemVer(m[2], this.options.loose); }
};

Comparator.prototype.toString = function() {
  return this.value;
};

Comparator.prototype.test = function(version) {
  debug('Comparator.test', version, this.options.loose);

  if (this.semver === ANY)
    { return true; }

  if (typeof version === 'string')
    { version = new SemVer(version, this.options); }

  return cmp(version, this.operator, this.semver, this.options);
};

Comparator.prototype.intersects = function(comp, options) {
  if (!(comp instanceof Comparator)) {
    throw new TypeError('a Comparator is required');
  }

  if (!options || typeof options !== 'object')
    { options = { loose: !!options, includePrerelease: false }; }

  var rangeTmp;

  if (this.operator === '') {
    rangeTmp = new Range(comp.value, options);
    return satisfies(this.value, rangeTmp, options);
  } else if (comp.operator === '') {
    rangeTmp = new Range(this.value, options);
    return satisfies(comp.semver, rangeTmp, options);
  }

  var sameDirectionIncreasing =
    (this.operator === '>=' || this.operator === '>') &&
    (comp.operator === '>=' || comp.operator === '>');
  var sameDirectionDecreasing =
    (this.operator === '<=' || this.operator === '<') &&
    (comp.operator === '<=' || comp.operator === '<');
  var sameSemVer = this.semver.version === comp.semver.version;
  var differentDirectionsInclusive =
    (this.operator === '>=' || this.operator === '<=') &&
    (comp.operator === '>=' || comp.operator === '<=');
  var oppositeDirectionsLessThan =
    cmp(this.semver, '<', comp.semver, options) &&
    ((this.operator === '>=' || this.operator === '>') &&
    (comp.operator === '<=' || comp.operator === '<'));
  var oppositeDirectionsGreaterThan =
    cmp(this.semver, '>', comp.semver, options) &&
    ((this.operator === '<=' || this.operator === '<') &&
    (comp.operator === '>=' || comp.operator === '>'));

  return sameDirectionIncreasing || sameDirectionDecreasing ||
    (sameSemVer && differentDirectionsInclusive) ||
    oppositeDirectionsLessThan || oppositeDirectionsGreaterThan;
};


exports.Range = Range;
function Range(range, options) {
  if (!options || typeof options !== 'object')
    { options = { loose: !!options, includePrerelease: false }; }

  if (range instanceof Range) {
    if (range.loose === !!options.loose &&
        range.includePrerelease === !!options.includePrerelease) {
      return range;
    } else {
      return new Range(range.raw, options);
    }
  }

  if (range instanceof Comparator) {
    return new Range(range.value, options);
  }

  if (!(this instanceof Range))
    { return new Range(range, options); }

  this.options = options;
  this.loose = !!options.loose;
  this.includePrerelease = !!options.includePrerelease;

  // First, split based on boolean or ||
  this.raw = range;
  this.set = range.split(/\s*\|\|\s*/).map(function(range) {
    return this.parseRange(range.trim());
  }, this).filter(function(c) {
    // throw out any that are not relevant for whatever reason
    return c.length;
  });

  if (!this.set.length) {
    throw new TypeError('Invalid SemVer Range: ' + range);
  }

  this.format();
}

Range.prototype.format = function() {
  this.range = this.set.map(function(comps) {
    return comps.join(' ').trim();
  }).join('||').trim();
  return this.range;
};

Range.prototype.toString = function() {
  return this.range;
};

Range.prototype.parseRange = function(range) {
  var loose = this.options.loose;
  range = range.trim();
  // `1.2.3 - 1.2.4` => `>=1.2.3 <=1.2.4`
  var hr = loose ? re[HYPHENRANGELOOSE] : re[HYPHENRANGE];
  range = range.replace(hr, hyphenReplace);
  debug('hyphen replace', range);
  // `> 1.2.3 < 1.2.5` => `>1.2.3 <1.2.5`
  range = range.replace(re[COMPARATORTRIM], comparatorTrimReplace);
  debug('comparator trim', range, re[COMPARATORTRIM]);

  // `~ 1.2.3` => `~1.2.3`
  range = range.replace(re[TILDETRIM], tildeTrimReplace);

  // `^ 1.2.3` => `^1.2.3`
  range = range.replace(re[CARETTRIM], caretTrimReplace);

  // normalize spaces
  range = range.split(/\s+/).join(' ');

  // At this point, the range is completely trimmed and
  // ready to be split into comparators.

  var compRe = loose ? re[COMPARATORLOOSE] : re[COMPARATOR];
  var set = range.split(' ').map(function(comp) {
    return parseComparator(comp, this.options);
  }, this).join(' ').split(/\s+/);
  if (this.options.loose) {
    // in loose mode, throw out any that are not valid comparators
    set = set.filter(function(comp) {
      return !!comp.match(compRe);
    });
  }
  set = set.map(function(comp) {
    return new Comparator(comp, this.options);
  }, this);

  return set;
};

Range.prototype.intersects = function(range, options) {
  if (!(range instanceof Range)) {
    throw new TypeError('a Range is required');
  }

  return this.set.some(function(thisComparators) {
    return thisComparators.every(function(thisComparator) {
      return range.set.some(function(rangeComparators) {
        return rangeComparators.every(function(rangeComparator) {
          return thisComparator.intersects(rangeComparator, options);
        });
      });
    });
  });
};

// Mostly just for testing and legacy API reasons
exports.toComparators = toComparators;
function toComparators(range, options) {
  return new Range(range, options).set.map(function(comp) {
    return comp.map(function(c) {
      return c.value;
    }).join(' ').trim().split(' ');
  });
}

// comprised of xranges, tildes, stars, and gtlt's at this point.
// already replaced the hyphen ranges
// turn into a set of JUST comparators.
function parseComparator(comp, options) {
  debug('comp', comp, options);
  comp = replaceCarets(comp, options);
  debug('caret', comp);
  comp = replaceTildes(comp, options);
  debug('tildes', comp);
  comp = replaceXRanges(comp, options);
  debug('xrange', comp);
  comp = replaceStars(comp, options);
  debug('stars', comp);
  return comp;
}

function isX(id) {
  return !id || id.toLowerCase() === 'x' || id === '*';
}

// ~, ~> --> * (any, kinda silly)
// ~2, ~2.x, ~2.x.x, ~>2, ~>2.x ~>2.x.x --> >=2.0.0 <3.0.0
// ~2.0, ~2.0.x, ~>2.0, ~>2.0.x --> >=2.0.0 <2.1.0
// ~1.2, ~1.2.x, ~>1.2, ~>1.2.x --> >=1.2.0 <1.3.0
// ~1.2.3, ~>1.2.3 --> >=1.2.3 <1.3.0
// ~1.2.0, ~>1.2.0 --> >=1.2.0 <1.3.0
function replaceTildes(comp, options) {
  return comp.trim().split(/\s+/).map(function(comp) {
    return replaceTilde(comp, options);
  }).join(' ');
}

function replaceTilde(comp, options) {
  if (!options || typeof options !== 'object')
    { options = { loose: !!options, includePrerelease: false }; }
  var r = options.loose ? re[TILDELOOSE] : re[TILDE];
  return comp.replace(r, function(_, M, m, p, pr) {
    debug('tilde', comp, _, M, m, p, pr);
    var ret;

    if (isX(M))
      { ret = ''; }
    else if (isX(m))
      { ret = '>=' + M + '.0.0 <' + (+M + 1) + '.0.0'; }
    else if (isX(p))
      // ~1.2 == >=1.2.0 <1.3.0
      { ret = '>=' + M + '.' + m + '.0 <' + M + '.' + (+m + 1) + '.0'; }
    else if (pr) {
      debug('replaceTilde pr', pr);
      if (pr.charAt(0) !== '-')
        { pr = '-' + pr; }
      ret = '>=' + M + '.' + m + '.' + p + pr +
            ' <' + M + '.' + (+m + 1) + '.0';
    } else
      // ~1.2.3 == >=1.2.3 <1.3.0
      { ret = '>=' + M + '.' + m + '.' + p +
            ' <' + M + '.' + (+m + 1) + '.0'; }

    debug('tilde return', ret);
    return ret;
  });
}

// ^ --> * (any, kinda silly)
// ^2, ^2.x, ^2.x.x --> >=2.0.0 <3.0.0
// ^2.0, ^2.0.x --> >=2.0.0 <3.0.0
// ^1.2, ^1.2.x --> >=1.2.0 <2.0.0
// ^1.2.3 --> >=1.2.3 <2.0.0
// ^1.2.0 --> >=1.2.0 <2.0.0
function replaceCarets(comp, options) {
  return comp.trim().split(/\s+/).map(function(comp) {
    return replaceCaret(comp, options);
  }).join(' ');
}

function replaceCaret(comp, options) {
  debug('caret', comp, options);
  if (!options || typeof options !== 'object')
    { options = { loose: !!options, includePrerelease: false }; }
  var r = options.loose ? re[CARETLOOSE] : re[CARET];
  return comp.replace(r, function(_, M, m, p, pr) {
    debug('caret', comp, _, M, m, p, pr);
    var ret;

    if (isX(M))
      { ret = ''; }
    else if (isX(m))
      { ret = '>=' + M + '.0.0 <' + (+M + 1) + '.0.0'; }
    else if (isX(p)) {
      if (M === '0')
        { ret = '>=' + M + '.' + m + '.0 <' + M + '.' + (+m + 1) + '.0'; }
      else
        { ret = '>=' + M + '.' + m + '.0 <' + (+M + 1) + '.0.0'; }
    } else if (pr) {
      debug('replaceCaret pr', pr);
      if (pr.charAt(0) !== '-')
        { pr = '-' + pr; }
      if (M === '0') {
        if (m === '0')
          { ret = '>=' + M + '.' + m + '.' + p + pr +
                ' <' + M + '.' + m + '.' + (+p + 1); }
        else
          { ret = '>=' + M + '.' + m + '.' + p + pr +
                ' <' + M + '.' + (+m + 1) + '.0'; }
      } else
        { ret = '>=' + M + '.' + m + '.' + p + pr +
              ' <' + (+M + 1) + '.0.0'; }
    } else {
      debug('no pr');
      if (M === '0') {
        if (m === '0')
          { ret = '>=' + M + '.' + m + '.' + p +
                ' <' + M + '.' + m + '.' + (+p + 1); }
        else
          { ret = '>=' + M + '.' + m + '.' + p +
                ' <' + M + '.' + (+m + 1) + '.0'; }
      } else
        { ret = '>=' + M + '.' + m + '.' + p +
              ' <' + (+M + 1) + '.0.0'; }
    }

    debug('caret return', ret);
    return ret;
  });
}

function replaceXRanges(comp, options) {
  debug('replaceXRanges', comp, options);
  return comp.split(/\s+/).map(function(comp) {
    return replaceXRange(comp, options);
  }).join(' ');
}

function replaceXRange(comp, options) {
  comp = comp.trim();
  if (!options || typeof options !== 'object')
    { options = { loose: !!options, includePrerelease: false }; }
  var r = options.loose ? re[XRANGELOOSE] : re[XRANGE];
  return comp.replace(r, function(ret, gtlt, M, m, p, pr) {
    debug('xRange', comp, ret, gtlt, M, m, p, pr);
    var xM = isX(M);
    var xm = xM || isX(m);
    var xp = xm || isX(p);
    var anyX = xp;

    if (gtlt === '=' && anyX)
      { gtlt = ''; }

    if (xM) {
      if (gtlt === '>' || gtlt === '<') {
        // nothing is allowed
        ret = '<0.0.0';
      } else {
        // nothing is forbidden
        ret = '*';
      }
    } else if (gtlt && anyX) {
      // replace X with 0
      if (xm)
        { m = 0; }
      if (xp)
        { p = 0; }

      if (gtlt === '>') {
        // >1 => >=2.0.0
        // >1.2 => >=1.3.0
        // >1.2.3 => >= 1.2.4
        gtlt = '>=';
        if (xm) {
          M = +M + 1;
          m = 0;
          p = 0;
        } else if (xp) {
          m = +m + 1;
          p = 0;
        }
      } else if (gtlt === '<=') {
        // <=0.7.x is actually <0.8.0, since any 0.7.x should
        // pass.  Similarly, <=7.x is actually <8.0.0, etc.
        gtlt = '<';
        if (xm)
          { M = +M + 1; }
        else
          { m = +m + 1; }
      }

      ret = gtlt + M + '.' + m + '.' + p;
    } else if (xm) {
      ret = '>=' + M + '.0.0 <' + (+M + 1) + '.0.0';
    } else if (xp) {
      ret = '>=' + M + '.' + m + '.0 <' + M + '.' + (+m + 1) + '.0';
    }

    debug('xRange return', ret);

    return ret;
  });
}

// Because * is AND-ed with everything else in the comparator,
// and '' means "any version", just remove the *s entirely.
function replaceStars(comp, options) {
  debug('replaceStars', comp, options);
  // Looseness is ignored here.  star is always as loose as it gets!
  return comp.trim().replace(re[STAR], '');
}

// This function is passed to string.replace(re[HYPHENRANGE])
// M, m, patch, prerelease, build
// 1.2 - 3.4.5 => >=1.2.0 <=3.4.5
// 1.2.3 - 3.4 => >=1.2.0 <3.5.0 Any 3.4.x will do
// 1.2 - 3.4 => >=1.2.0 <3.5.0
function hyphenReplace($0,
                       from, fM, fm, fp, fpr, fb,
                       to, tM, tm, tp, tpr, tb) {

  if (isX(fM))
    { from = ''; }
  else if (isX(fm))
    { from = '>=' + fM + '.0.0'; }
  else if (isX(fp))
    { from = '>=' + fM + '.' + fm + '.0'; }
  else
    { from = '>=' + from; }

  if (isX(tM))
    { to = ''; }
  else if (isX(tm))
    { to = '<' + (+tM + 1) + '.0.0'; }
  else if (isX(tp))
    { to = '<' + tM + '.' + (+tm + 1) + '.0'; }
  else if (tpr)
    { to = '<=' + tM + '.' + tm + '.' + tp + '-' + tpr; }
  else
    { to = '<=' + to; }

  return (from + ' ' + to).trim();
}


// if ANY of the sets match ALL of its comparators, then pass
Range.prototype.test = function(version) {
  var this$1 = this;

  if (!version)
    { return false; }

  if (typeof version === 'string')
    { version = new SemVer(version, this.options); }

  for (var i = 0; i < this.set.length; i++) {
    if (testSet(this$1.set[i], version, this$1.options))
      { return true; }
  }
  return false;
};

function testSet(set, version, options) {
  for (var i = 0; i < set.length; i++) {
    if (!set[i].test(version))
      { return false; }
  }

  if (!options)
    { options = {}; }

  if (version.prerelease.length && !options.includePrerelease) {
    // Find the set of versions that are allowed to have prereleases
    // For example, ^1.2.3-pr.1 desugars to >=1.2.3-pr.1 <2.0.0
    // That should allow `1.2.3-pr.2` to pass.
    // However, `1.2.4-alpha.notready` should NOT be allowed,
    // even though it's within the range set by the comparators.
    for (var i = 0; i < set.length; i++) {
      debug(set[i].semver);
      if (set[i].semver === ANY)
        { continue; }

      if (set[i].semver.prerelease.length > 0) {
        var allowed = set[i].semver;
        if (allowed.major === version.major &&
            allowed.minor === version.minor &&
            allowed.patch === version.patch)
          { return true; }
      }
    }

    // Version has a -pre, but it's not one of the ones we like.
    return false;
  }

  return true;
}

exports.satisfies = satisfies;
function satisfies(version, range, options) {
  try {
    range = new Range(range, options);
  } catch (er) {
    return false;
  }
  return range.test(version);
}

exports.maxSatisfying = maxSatisfying;
function maxSatisfying(versions, range, options) {
  var max = null;
  var maxSV = null;
  try {
    var rangeObj = new Range(range, options);
  } catch (er) {
    return null;
  }
  versions.forEach(function (v) {
    if (rangeObj.test(v)) { // satisfies(v, range, options)
      if (!max || maxSV.compare(v) === -1) { // compare(max, v, true)
        max = v;
        maxSV = new SemVer(max, options);
      }
    }
  });
  return max;
}

exports.minSatisfying = minSatisfying;
function minSatisfying(versions, range, options) {
  var min = null;
  var minSV = null;
  try {
    var rangeObj = new Range(range, options);
  } catch (er) {
    return null;
  }
  versions.forEach(function (v) {
    if (rangeObj.test(v)) { // satisfies(v, range, options)
      if (!min || minSV.compare(v) === 1) { // compare(min, v, true)
        min = v;
        minSV = new SemVer(min, options);
      }
    }
  });
  return min;
}

exports.validRange = validRange;
function validRange(range, options) {
  try {
    // Return '*' instead of '' so that truthiness works.
    // This will throw if it's invalid anyway
    return new Range(range, options).range || '*';
  } catch (er) {
    return null;
  }
}

// Determine if version is less than all the versions possible in the range
exports.ltr = ltr;
function ltr(version, range, options) {
  return outside(version, range, '<', options);
}

// Determine if version is greater than all the versions possible in the range.
exports.gtr = gtr;
function gtr(version, range, options) {
  return outside(version, range, '>', options);
}

exports.outside = outside;
function outside(version, range, hilo, options) {
  version = new SemVer(version, options);
  range = new Range(range, options);

  var gtfn, ltefn, ltfn, comp, ecomp;
  switch (hilo) {
    case '>':
      gtfn = gt;
      ltefn = lte;
      ltfn = lt;
      comp = '>';
      ecomp = '>=';
      break;
    case '<':
      gtfn = lt;
      ltefn = gte;
      ltfn = gt;
      comp = '<';
      ecomp = '<=';
      break;
    default:
      throw new TypeError('Must provide a hilo val of "<" or ">"');
  }

  // If it satisifes the range it is not outside
  if (satisfies(version, range, options)) {
    return false;
  }

  // From now on, variable terms are as if we're in "gtr" mode.
  // but note that everything is flipped for the "ltr" function.

  for (var i = 0; i < range.set.length; ++i) {
    var comparators = range.set[i];

    var high = null;
    var low = null;

    comparators.forEach(function(comparator) {
      if (comparator.semver === ANY) {
        comparator = new Comparator('>=0.0.0');
      }
      high = high || comparator;
      low = low || comparator;
      if (gtfn(comparator.semver, high.semver, options)) {
        high = comparator;
      } else if (ltfn(comparator.semver, low.semver, options)) {
        low = comparator;
      }
    });

    // If the edge version comparator has a operator then our version
    // isn't outside it
    if (high.operator === comp || high.operator === ecomp) {
      return false;
    }

    // If the lowest version comparator has an operator and our version
    // is less than it then it isn't higher than the range
    if ((!low.operator || low.operator === comp) &&
        ltefn(version, low.semver)) {
      return false;
    } else if (low.operator === ecomp && ltfn(version, low.semver)) {
      return false;
    }
  }
  return true;
}

exports.prerelease = prerelease;
function prerelease(version, options) {
  var parsed = parse(version, options);
  return (parsed && parsed.prerelease.length) ? parsed.prerelease : null;
}

exports.intersects = intersects;
function intersects(r1, r2, options) {
  r1 = new Range(r1, options);
  r2 = new Range(r2, options);
  return r1.intersects(r2)
}

exports.coerce = coerce;
function coerce(version) {
  if (version instanceof SemVer)
    { return version; }

  if (typeof version !== 'string')
    { return null; }

  var match = version.match(re[COERCE]);

  if (match == null)
    { return null; }

  return parse((match[1] || '0') + '.' + (match[2] || '0') + '.' + (match[3] || '0')); 
}
});
var semver_1 = semver.SEMVER_SPEC_VERSION;
var semver_2 = semver.re;
var semver_3 = semver.src;
var semver_4 = semver.parse;
var semver_5 = semver.valid;
var semver_6 = semver.clean;
var semver_7 = semver.SemVer;
var semver_8 = semver.inc;
var semver_9 = semver.diff;
var semver_10 = semver.compareIdentifiers;
var semver_11 = semver.rcompareIdentifiers;
var semver_12 = semver.major;
var semver_13 = semver.minor;
var semver_14 = semver.patch;
var semver_15 = semver.compare;
var semver_16 = semver.compareLoose;
var semver_17 = semver.rcompare;
var semver_18 = semver.sort;
var semver_19 = semver.rsort;
var semver_20 = semver.gt;
var semver_21 = semver.lt;
var semver_22 = semver.eq;
var semver_23 = semver.neq;
var semver_24 = semver.gte;
var semver_25 = semver.lte;
var semver_26 = semver.cmp;
var semver_27 = semver.Comparator;
var semver_28 = semver.Range;
var semver_29 = semver.toComparators;
var semver_30 = semver.satisfies;
var semver_31 = semver.maxSatisfying;
var semver_32 = semver.minSatisfying;
var semver_33 = semver.validRange;
var semver_34 = semver.ltr;
var semver_35 = semver.gtr;
var semver_36 = semver.outside;
var semver_37 = semver.prerelease;
var semver_38 = semver.intersects;
var semver_39 = semver.coerce;

// 

function throwError (msg) {
  throw new Error(("[vue-test-utils]: " + msg))
}

function warn (msg) {
  console.error(("[vue-test-utils]: " + msg));
}

var camelizeRE = /-(\w)/g;

var camelize = function (str) {
  var camelizedStr = str.replace(camelizeRE, function (_, c) { return c ? c.toUpperCase() : ''; }
  );
  return camelizedStr.charAt(0).toLowerCase() + camelizedStr.slice(1)
};

/**
 * Capitalize a string.
 */
var capitalize = function (str) { return str.charAt(0).toUpperCase() + str.slice(1); };

/**
 * Hyphenate a camelCase string.
 */
var hyphenateRE = /\B([A-Z])/g;
var hyphenate = function (str) { return str.replace(hyphenateRE, '-$1').toLowerCase(); };

function hasOwnProperty (obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop)
}

function resolveComponent (id, components) {
  if (typeof id !== 'string') {
    return
  }
  // check local registration variations first
  if (hasOwnProperty(components, id)) {
    return components[id]
  }
  var camelizedId = camelize(id);
  if (hasOwnProperty(components, camelizedId)) {
    return components[camelizedId]
  }
  var PascalCaseId = capitalize(camelizedId);
  if (hasOwnProperty(components, PascalCaseId)) {
    return components[PascalCaseId]
  }
  // fallback to prototype chain
  return components[id] || components[camelizedId] || components[PascalCaseId]
}

var UA = typeof window !== 'undefined' &&
  'navigator' in window &&
  navigator.userAgent.toLowerCase();

var isPhantomJS = UA && UA.includes &&
  UA.match(/phantomjs/i);

var isEdge = UA && UA.indexOf('edge/') > 0;
var isChrome = UA && /chrome\/\d+/.test(UA) && !isEdge;

// get the event used to trigger v-model handler that updates bound data
function getCheckedEvent () {
  var version = Vue.version;

  if (semver.satisfies(version, '2.1.9 - 2.1.10')) {
    return 'click'
  }

  if (semver.satisfies(version, '2.2 - 2.4')) {
    return isChrome ? 'click' : 'change'
  }

  // change is handler for version 2.0 - 2.1.8, and 2.5+
  return 'change'
}

// 

function isDomSelector (selector) {
  if (typeof selector !== 'string') {
    return false
  }

  try {
    if (typeof document === 'undefined') {
      throwError(
        "mount must be run in a browser environment like " +
          "PhantomJS, jsdom or chrome"
      );
    }
  } catch (error) {
    throwError(
      "mount must be run in a browser environment like " +
        "PhantomJS, jsdom or chrome"
    );
  }

  try {
    document.querySelector(selector);
    return true
  } catch (error) {
    return false
  }
}

function isVueComponent (component) {
  if (typeof component === 'function' && component.options) {
    return true
  }

  if (component === null || typeof component !== 'object') {
    return false
  }

  if (component.extends || component._Ctor) {
    return true
  }

  if (typeof component.template === 'string') {
    return true
  }

  return typeof component.render === 'function'
}

function componentNeedsCompiling (component) {
  return (
    component &&
    !component.render &&
    (component.template || component.extends || component.extendOptions) &&
    !component.functional
  )
}

function isRefSelector (refOptionsObject) {
  if (
    typeof refOptionsObject !== 'object' ||
    Object.keys(refOptionsObject || {}).length !== 1
  ) {
    return false
  }

  return typeof refOptionsObject.ref === 'string'
}

function isNameSelector (nameOptionsObject) {
  if (typeof nameOptionsObject !== 'object' || nameOptionsObject === null) {
    return false
  }

  return !!nameOptionsObject.name
}

function templateContainsComponent (
  template,
  name
) {
  return [capitalize, camelize, hyphenate].some(function (format) {
    var re = new RegExp(("<" + (format(name)) + "\\s*(\\s|>|(/>))"), 'g');
    return re.test(template)
  })
}

function isPlainObject (obj) {
  return Object.prototype.toString.call(obj) === '[object Object]'
}

function makeMap (
  str,
  expectsLowerCase
) {
  var map = Object.create(null);
  var list = str.split(',');
  for (var i = 0; i < list.length; i++) {
    map[list[i]] = true;
  }
  return expectsLowerCase
    ? function (val) { return map[val.toLowerCase()] }
    : function (val) { return map[val] }
}

var isHTMLTag = makeMap(
  'html,body,base,head,link,meta,style,title,' +
  'address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,' +
  'div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,' +
  'a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,' +
  's,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,' +
  'embed,object,param,source,canvas,script,noscript,del,ins,' +
  'caption,col,colgroup,table,thead,tbody,td,th,tr,video,' +
  'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,' +
  'output,progress,select,textarea,' +
  'details,dialog,menu,menuitem,summary,' +
  'content,element,shadow,template,blockquote,iframe,tfoot'
);

// this map is intentionally selective, only covering SVG elements that may
// contain child elements.
var isSVG = makeMap(
  'svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font-face,' +
  'foreignObject,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,' +
  'polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view',
  true
);

var isReservedTag = function (tag) { return isHTMLTag(tag) || isSVG(tag); };

var NAME_SELECTOR = 'NAME_SELECTOR';
var COMPONENT_SELECTOR = 'COMPONENT_SELECTOR';
var REF_SELECTOR = 'REF_SELECTOR';
var DOM_SELECTOR = 'DOM_SELECTOR';
var INVALID_SELECTOR = 'INVALID_SELECTOR';

var VUE_VERSION = Number(
  ((Vue.version.split('.')[0]) + "." + (Vue.version.split('.')[1]))
);

var FUNCTIONAL_OPTIONS =
  VUE_VERSION >= 2.5 ? 'fnOptions' : 'functionalOptions';

var BEFORE_RENDER_LIFECYCLE_HOOK =
  semver.gt(Vue.version, '2.1.8')
    ? 'beforeCreate'
    : 'beforeMount';

var CREATE_ELEMENT_ALIAS = semver.gt(Vue.version, '2.1.5')
  ? '_c'
  : '_h';

// 

function getSelectorType (
  selector
) {
  if (isDomSelector(selector)) { return DOM_SELECTOR }
  if (isVueComponent(selector)) { return COMPONENT_SELECTOR }
  if (isNameSelector(selector)) { return NAME_SELECTOR }
  if (isRefSelector(selector)) { return REF_SELECTOR }

  return INVALID_SELECTOR
}

function getSelector (
  selector,
  methodName
) {
  var type = getSelectorType(selector);
  if (type === INVALID_SELECTOR) {
    throwError(
      "wrapper." + methodName + "() must be passed a valid CSS selector, Vue " +
      "constructor, or valid find option object"
    );
  }
  return {
    type: type,
    value: selector
  }
}

// 

function getRealChild (vnode) {
  var compOptions = vnode && vnode.componentOptions;
  if (compOptions && compOptions.Ctor.options.abstract) {
    return getRealChild(getFirstComponentChild(compOptions.children))
  } else {
    return vnode
  }
}

function isSameChild (child, oldChild) {
  return oldChild.key === child.key && oldChild.tag === child.tag
}

function getFirstComponentChild (children) {
  if (Array.isArray(children)) {
    for (var i = 0; i < children.length; i++) {
      var c = children[i];
      if (c && (c.componentOptions || isAsyncPlaceholder(c))) {
        return c
      }
    }
  }
}

function isPrimitive (value) {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    // $FlowIgnore
    typeof value === 'symbol' ||
    typeof value === 'boolean'
  )
}

function isAsyncPlaceholder (node) {
  return node.isComment && node.asyncFactory
}

function hasParentTransition (vnode) {
  while ((vnode = vnode.parent)) {
    if (vnode.data.transition) {
      return true
    }
  }
}

var TransitionStub = {
  render: function render (h) {
    var children = this.$options._renderChildren;
    if (!children) {
      return
    }

    // filter out text nodes (possible whitespaces)
    children = children.filter(function (c) { return c.tag || isAsyncPlaceholder(c); });
    /* istanbul ignore if */
    if (!children.length) {
      return
    }

    // warn multiple elements
    if (children.length > 1) {
      warn(
        "<transition> can only be used on a single element. " + "Use " +
         '<transition-group> for lists.'
      );
    }

    var mode = this.mode;

    // warn invalid mode
    if (mode && mode !== 'in-out' && mode !== 'out-in'
    ) {
      warn(
        'invalid <transition> mode: ' + mode
      );
    }

    var rawChild = children[0];

    // if this is a component root node and the component's
    // parent container node also has transition, skip.
    if (hasParentTransition(this.$vnode)) {
      return rawChild
    }

    // apply transition data to child
    // use getRealChild() to ignore abstract components e.g. keep-alive
    var child = getRealChild(rawChild);

    if (!child) {
      return rawChild
    }

    var id = "__transition-" + (this._uid) + "-";
    child.key = child.key == null
      ? child.isComment
        ? id + 'comment'
        : id + child.tag
      : isPrimitive(child.key)
        ? (String(child.key).indexOf(id) === 0 ? child.key : id + child.key)
        : child.key;

    var data = (child.data || (child.data = {}));
    var oldRawChild = this._vnode;
    var oldChild = getRealChild(oldRawChild);
    if (child.data.directives &&
      child.data.directives.some(function (d) { return d.name === 'show'; })) {
      child.data.show = true;
    }

    // mark v-show
    // so that the transition module can hand over the control
    // to the directive
    if (child.data.directives &&
      child.data.directives.some(function (d) { return d.name === 'show'; })) {
      child.data.show = true;
    }
    if (
      oldChild &&
         oldChild.data &&
         !isSameChild(child, oldChild) &&
         !isAsyncPlaceholder(oldChild) &&
         // #6687 component root is a comment node
         !(oldChild.componentInstance &&
          oldChild.componentInstance._vnode.isComment)
    ) {
      oldChild.data = Object.assign({}, data);
    }
    return rawChild
  }
}

// 

var TransitionGroupStub = {
  render: function render (h) {
    var tag = this.tag || this.$vnode.data.tag || 'span';
    var children = this.$slots.default || [];

    return h(tag, null, children)
  }
}

var config = {
  stubs: {
    transition: TransitionStub,
    'transition-group': TransitionGroupStub
  },
  mocks: {},
  methods: {},
  provide: {},
  logModifiedComponents: true,
  silent: true
}

// 

var WrapperArray = function WrapperArray (wrappers) {
  var length = wrappers.length;
  // $FlowIgnore
  Object.defineProperty(this, 'wrappers', {
    get: function () { return wrappers; },
    set: function () { return throwError('wrapperArray.wrappers is read-only'); }
  });
  // $FlowIgnore
  Object.defineProperty(this, 'length', {
    get: function () { return length; },
    set: function () { return throwError('wrapperArray.length is read-only'); }
  });
};

WrapperArray.prototype.at = function at (index) {
  if (index > this.length - 1) {
    throwError(("no item exists at " + index));
  }
  return this.wrappers[index]
};

WrapperArray.prototype.attributes = function attributes () {
  this.throwErrorIfWrappersIsEmpty('attributes');

  throwError(
    "attributes must be called on a single wrapper, use " +
      "at(i) to access a wrapper"
  );
};

WrapperArray.prototype.classes = function classes () {
  this.throwErrorIfWrappersIsEmpty('classes');

  throwError(
    "classes must be called on a single wrapper, use " +
      "at(i) to access a wrapper"
  );
};

WrapperArray.prototype.contains = function contains (selector) {
  this.throwErrorIfWrappersIsEmpty('contains');

  return this.wrappers.every(function (wrapper) { return wrapper.contains(selector); })
};

WrapperArray.prototype.exists = function exists () {
  return this.length > 0 && this.wrappers.every(function (wrapper) { return wrapper.exists(); })
};

WrapperArray.prototype.filter = function filter (predicate) {
  return new WrapperArray(this.wrappers.filter(predicate))
};

WrapperArray.prototype.visible = function visible () {
  this.throwErrorIfWrappersIsEmpty('visible');

  return this.length > 0 && this.wrappers.every(function (wrapper) { return wrapper.visible(); })
};

WrapperArray.prototype.emitted = function emitted () {
  this.throwErrorIfWrappersIsEmpty('emitted');

  throwError(
    "emitted must be called on a single wrapper, use " +
      "at(i) to access a wrapper"
  );
};

WrapperArray.prototype.emittedByOrder = function emittedByOrder () {
  this.throwErrorIfWrappersIsEmpty('emittedByOrder');

  throwError(
    "emittedByOrder must be called on a single wrapper, " +
      "use at(i) to access a wrapper"
  );
};

WrapperArray.prototype.hasAttribute = function hasAttribute (attribute, value) {
  this.throwErrorIfWrappersIsEmpty('hasAttribute');

  return this.wrappers.every(function (wrapper) { return wrapper.hasAttribute(attribute, value); }
  )
};

WrapperArray.prototype.hasClass = function hasClass (className) {
  this.throwErrorIfWrappersIsEmpty('hasClass');

  return this.wrappers.every(function (wrapper) { return wrapper.hasClass(className); })
};

WrapperArray.prototype.hasProp = function hasProp (prop, value) {
  this.throwErrorIfWrappersIsEmpty('hasProp');

  return this.wrappers.every(function (wrapper) { return wrapper.hasProp(prop, value); })
};

WrapperArray.prototype.hasStyle = function hasStyle (style, value) {
  this.throwErrorIfWrappersIsEmpty('hasStyle');

  return this.wrappers.every(function (wrapper) { return wrapper.hasStyle(style, value); })
};

WrapperArray.prototype.findAll = function findAll () {
  this.throwErrorIfWrappersIsEmpty('findAll');

  throwError(
    "findAll must be called on a single wrapper, use " +
      "at(i) to access a wrapper"
  );
};

WrapperArray.prototype.find = function find () {
  this.throwErrorIfWrappersIsEmpty('find');

  throwError(
    "find must be called on a single wrapper, use at(i) " +
      "to access a wrapper"
  );
};

WrapperArray.prototype.html = function html () {
  this.throwErrorIfWrappersIsEmpty('html');

  throwError(
    "html must be called on a single wrapper, use at(i) " +
      "to access a wrapper"
  );
};

WrapperArray.prototype.is = function is (selector) {
  this.throwErrorIfWrappersIsEmpty('is');

  return this.wrappers.every(function (wrapper) { return wrapper.is(selector); })
};

WrapperArray.prototype.isEmpty = function isEmpty () {
  this.throwErrorIfWrappersIsEmpty('isEmpty');

  return this.wrappers.every(function (wrapper) { return wrapper.isEmpty(); })
};

WrapperArray.prototype.isVisible = function isVisible () {
  this.throwErrorIfWrappersIsEmpty('isVisible');

  return this.wrappers.every(function (wrapper) { return wrapper.isVisible(); })
};

WrapperArray.prototype.isVueInstance = function isVueInstance () {
  this.throwErrorIfWrappersIsEmpty('isVueInstance');

  return this.wrappers.every(function (wrapper) { return wrapper.isVueInstance(); })
};

WrapperArray.prototype.name = function name () {
  this.throwErrorIfWrappersIsEmpty('name');

  throwError(
    "name must be called on a single wrapper, use at(i) " +
      "to access a wrapper"
  );
};

WrapperArray.prototype.props = function props () {
  this.throwErrorIfWrappersIsEmpty('props');

  throwError(
    "props must be called on a single wrapper, use " +
      "at(i) to access a wrapper"
  );
};

WrapperArray.prototype.text = function text () {
  this.throwErrorIfWrappersIsEmpty('text');

  throwError(
    "text must be called on a single wrapper, use at(i) " +
      "to access a wrapper"
  );
};

WrapperArray.prototype.throwErrorIfWrappersIsEmpty = function throwErrorIfWrappersIsEmpty (method) {
  if (this.wrappers.length === 0) {
    throwError((method + " cannot be called on 0 items"));
  }
};

WrapperArray.prototype.setComputed = function setComputed (computed) {
  this.throwErrorIfWrappersIsEmpty('setComputed');

  this.wrappers.forEach(function (wrapper) { return wrapper.setComputed(computed); });
};

WrapperArray.prototype.setData = function setData (data) {
  this.throwErrorIfWrappersIsEmpty('setData');

  this.wrappers.forEach(function (wrapper) { return wrapper.setData(data); });
};

WrapperArray.prototype.setMethods = function setMethods (props) {
  this.throwErrorIfWrappersIsEmpty('setMethods');

  this.wrappers.forEach(function (wrapper) { return wrapper.setMethods(props); });
};

WrapperArray.prototype.setProps = function setProps (props) {
  this.throwErrorIfWrappersIsEmpty('setProps');

  this.wrappers.forEach(function (wrapper) { return wrapper.setProps(props); });
};

WrapperArray.prototype.setValue = function setValue (value) {
  this.throwErrorIfWrappersIsEmpty('setValue');

  this.wrappers.forEach(function (wrapper) { return wrapper.setValue(value); });
};

WrapperArray.prototype.setChecked = function setChecked (checked) {
    if ( checked === void 0 ) checked = true;

  this.throwErrorIfWrappersIsEmpty('setChecked');

  this.wrappers.forEach(function (wrapper) { return wrapper.setChecked(checked); });
};

WrapperArray.prototype.setSelected = function setSelected () {
  this.throwErrorIfWrappersIsEmpty('setSelected');

  throwError(
    "setSelected must be called on a single wrapper, " +
      "use at(i) to access a wrapper"
  );
};

WrapperArray.prototype.trigger = function trigger (event, options) {
  this.throwErrorIfWrappersIsEmpty('trigger');

  this.wrappers.forEach(function (wrapper) { return wrapper.trigger(event, options); });
};

WrapperArray.prototype.update = function update () {
  this.throwErrorIfWrappersIsEmpty('update');
  warn(
    "update has been removed. All changes are now " +
      "synchrnous without calling update"
  );
};

WrapperArray.prototype.destroy = function destroy () {
  this.throwErrorIfWrappersIsEmpty('destroy');

  this.wrappers.forEach(function (wrapper) { return wrapper.destroy(); });
};

// 

var ErrorWrapper = function ErrorWrapper (selector) {
  this.selector = selector;
};

ErrorWrapper.prototype.at = function at () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call at() on empty Wrapper")
  );
};

ErrorWrapper.prototype.attributes = function attributes () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call attributes() on empty Wrapper")
  );
};

ErrorWrapper.prototype.classes = function classes () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call classes() on empty Wrapper")
  );
};

ErrorWrapper.prototype.contains = function contains () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call contains() on empty Wrapper")
  );
};

ErrorWrapper.prototype.emitted = function emitted () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call emitted() on empty Wrapper")
  );
};

ErrorWrapper.prototype.emittedByOrder = function emittedByOrder () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call emittedByOrder() on empty Wrapper")
  );
};

ErrorWrapper.prototype.exists = function exists () {
  return false
};

ErrorWrapper.prototype.filter = function filter () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call filter() on empty Wrapper")
  );
};

ErrorWrapper.prototype.visible = function visible () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call visible() on empty Wrapper")
  );
};

ErrorWrapper.prototype.hasAttribute = function hasAttribute () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call hasAttribute() on empty Wrapper")
  );
};

ErrorWrapper.prototype.hasClass = function hasClass () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call hasClass() on empty Wrapper")
  );
};

ErrorWrapper.prototype.hasProp = function hasProp () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call hasProp() on empty Wrapper")
  );
};

ErrorWrapper.prototype.hasStyle = function hasStyle () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call hasStyle() on empty Wrapper")
  );
};

ErrorWrapper.prototype.findAll = function findAll () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call findAll() on empty Wrapper")
  );
};

ErrorWrapper.prototype.find = function find () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call find() on empty Wrapper")
  );
};

ErrorWrapper.prototype.html = function html () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call html() on empty Wrapper")
  );
};

ErrorWrapper.prototype.is = function is () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call is() on empty Wrapper")
  );
};

ErrorWrapper.prototype.isEmpty = function isEmpty () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call isEmpty() on empty Wrapper")
  );
};

ErrorWrapper.prototype.isVisible = function isVisible () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call isVisible() on empty Wrapper")
  );
};

ErrorWrapper.prototype.isVueInstance = function isVueInstance () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call isVueInstance() on empty Wrapper")
  );
};

ErrorWrapper.prototype.name = function name () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call name() on empty Wrapper")
  );
};

ErrorWrapper.prototype.props = function props () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call props() on empty Wrapper")
  );
};

ErrorWrapper.prototype.text = function text () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call text() on empty Wrapper")
  );
};

ErrorWrapper.prototype.setComputed = function setComputed () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call setComputed() on empty Wrapper")
  );
};

ErrorWrapper.prototype.setData = function setData () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call setData() on empty Wrapper")
  );
};

ErrorWrapper.prototype.setMethods = function setMethods () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call setMethods() on empty Wrapper")
  );
};

ErrorWrapper.prototype.setProps = function setProps () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call setProps() on empty Wrapper")
  );
};

ErrorWrapper.prototype.setValue = function setValue () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call setValue() on empty Wrapper")
  );
};

ErrorWrapper.prototype.setChecked = function setChecked () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call setChecked() on empty Wrapper")
  );
};

ErrorWrapper.prototype.setSelected = function setSelected () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call setSelected() on empty Wrapper")
  );
};

ErrorWrapper.prototype.trigger = function trigger () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call trigger() on empty Wrapper")
  );
};

ErrorWrapper.prototype.update = function update () {
  throwError(
    "update has been removed from vue-test-utils." +
    "All updates are now synchronous by default"
  );
};

ErrorWrapper.prototype.destroy = function destroy () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call destroy() on empty Wrapper")
  );
};

// 

function findDOMNodes (
  element,
  selector
) {
  var nodes = [];
  if (!element || !element.querySelectorAll || !element.matches) {
    return nodes
  }

  if (element.matches(selector)) {
    nodes.push(element);
  }
  // $FlowIgnore
  return nodes.concat([].slice.call(element.querySelectorAll(selector)))
}

function vmMatchesName (vm, name) {
  return !!name && (
    (vm.name === name) ||
    (vm.$options && vm.$options.name === name)
  )
}

function vmCtorMatches (vm, component) {
  if (
    vm.$options && vm.$options.$_vueTestUtils_original === component ||
    vm.$_vueTestUtils_original === component
  ) {
    return true
  }

  var Ctor = typeof component === 'function'
    ? component.options._Ctor
    : component._Ctor;

  if (!Ctor) {
    return false
  }

  if (vm.constructor.extendOptions === component) {
    return true
  }

  if (component.functional) {
    return Object.keys(vm._Ctor || {}).some(function (c) {
      return component === vm._Ctor[c].extendOptions
    })
  }
}

function matches (node, selector) {
  if (selector.type === DOM_SELECTOR) {
    var element = node instanceof Element
      ? node
      : node.elm;
    return element && element.matches && element.matches(selector.value)
  }

  var isFunctionalSelector = typeof selector.value === 'function'
    ? selector.value.options.functional
    : selector.value.functional;

  var componentInstance = isFunctionalSelector
    ? node[FUNCTIONAL_OPTIONS]
    : node.child;

  if (!componentInstance) {
    return false
  }

  if (selector.type === COMPONENT_SELECTOR) {
    if (vmCtorMatches(componentInstance, selector.value)) {
      return true
    }
  }

  // Fallback to name selector for COMPONENT_SELECTOR for Vue < 2.1
  var nameSelector =
  typeof selector.value === 'function'
    ? selector.value.extendOptions.name
    : selector.value.name;
  return vmMatchesName(componentInstance, nameSelector)
}

// 

function findAllInstances (rootVm) {
  var instances = [rootVm];
  var i = 0;
  while (i < instances.length) {
    var vm = instances[i]
    ;(vm.$children || []).forEach(function (child) {
      instances.push(child);
    });
    i++;
  }
  return instances
}

function findAllVNodes (
  vnode,
  selector
) {
  var matchingNodes = [];
  var nodes = [vnode];
  while (nodes.length) {
    var node = nodes.shift();
    if (node.children) {
      var children = [].concat( node.children ).reverse();
      children.forEach(function (n) {
        nodes.unshift(n);
      });
    }
    if (node.child) {
      nodes.unshift(node.child._vnode);
    }
    if (matches(node, selector)) {
      matchingNodes.push(node);
    }
  }

  return matchingNodes
}

function removeDuplicateNodes (vNodes) {
  var vNodeElms = vNodes.map(function (vNode) { return vNode.elm; });
  return vNodes.filter(
    function (vNode, index) { return index === vNodeElms.indexOf(vNode.elm); }
  )
}

function find (
  root,
  vm,
  selector
) {
  if ((root instanceof Element) && selector.type !== DOM_SELECTOR) {
    throwError(
      "cannot find a Vue instance on a DOM node. The node " +
      "you are calling find on does not exist in the " +
      "VDom. Are you adding the node as innerHTML?"
    );
  }

  if (
    selector.type === COMPONENT_SELECTOR &&
    (
      selector.value.functional ||
      (selector.value.options &&
      selector.value.options.functional)
    ) &&
    VUE_VERSION < 2.3
  ) {
    throwError(
      "find for functional components is not supported " +
        "in Vue < 2.3"
    );
  }

  if (root instanceof Element) {
    return findDOMNodes(root, selector.value)
  }

  if (!root && selector.type !== DOM_SELECTOR) {
    throwError(
      "cannot find a Vue instance on a DOM node. The node " +
      "you are calling find on does not exist in the " +
      "VDom. Are you adding the node as innerHTML?"
    );
  }

  if (!vm && selector.type === REF_SELECTOR) {
    throwError(
      "$ref selectors can only be used on Vue component " + "wrappers"
    );
  }

  if (
    vm &&
    vm.$refs &&
    selector.value.ref in vm.$refs
  ) {
    var refs = vm.$refs[selector.value.ref];
    return Array.isArray(refs) ? refs : [refs]
  }

  var nodes = findAllVNodes(root, selector);
  var dedupedNodes = removeDuplicateNodes(nodes);

  if (nodes.length > 0 || selector.type !== DOM_SELECTOR) {
    return dedupedNodes
  }

  // Fallback in case element exists in HTML, but not in vnode tree
  // (e.g. if innerHTML is set as a domProp)
  return findDOMNodes(root.elm, selector.value)
}

// 

function createWrapper (
  node,
  options
) {
  if ( options === void 0 ) options = {};

  var componentInstance = node.child;
  if (componentInstance) {
    return new VueWrapper(componentInstance, options)
  }
  return node instanceof Vue
    ? new VueWrapper(node, options)
    : new Wrapper(node, options)
}

// 

var i = 0;

function orderDeps (watcher) {
  watcher.deps.forEach(function (dep) {
    if (dep._sortedId === i) {
      return
    }
    dep._sortedId = i;
    dep.subs.forEach(orderDeps);
    dep.subs = dep.subs.sort(function (a, b) { return a.id - b.id; });
  });
}

function orderVmWatchers (vm) {
  if (vm._watchers) {
    vm._watchers.forEach(orderDeps);
  }

  if (vm._computedWatchers) {
    Object.keys(vm._computedWatchers).forEach(function (computedWatcher) {
      orderDeps(vm._computedWatchers[computedWatcher]);
    });
  }

  vm._watcher && orderDeps(vm._watcher);

  vm.$children.forEach(orderVmWatchers);
}

function orderWatchers (vm) {
  orderVmWatchers(vm);
  i++;
}

function recursivelySetData (vm, target, data) {
  Object.keys(data).forEach(function (key) {
    var val = data[key];
    var targetVal = target[key];

    if (isPlainObject(val) && isPlainObject(targetVal)) {
      recursivelySetData(vm, targetVal, val);
    } else {
      vm.$set(target, key, val);
    }
  });
}

var abort = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var afterprint = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var animationend = {"eventInterface":"AnimationEvent","bubbles":true,"cancelable":false};
var animationiteration = {"eventInterface":"AnimationEvent","bubbles":true,"cancelable":false};
var animationstart = {"eventInterface":"AnimationEvent","bubbles":true,"cancelable":false};
var appinstalled = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var audioprocess = {"eventInterface":"AudioProcessingEvent"};
var audioend = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var audiostart = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var beforeprint = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var beforeunload = {"eventInterface":"BeforeUnloadEvent","bubbles":false,"cancelable":true};
var beginEvent = {"eventInterface":"TimeEvent","bubbles":false,"cancelable":false};
var blur = {"eventInterface":"FocusEvent","bubbles":false,"cancelable":false};
var boundary = {"eventInterface":"SpeechSynthesisEvent","bubbles":false,"cancelable":false};
var cached = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var canplay = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var canplaythrough = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var change = {"eventInterface":"Event","bubbles":true,"cancelable":false};
var chargingchange = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var chargingtimechange = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var checking = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var click = {"eventInterface":"MouseEvent","bubbles":true,"cancelable":true};
var close = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var complete = {"eventInterface":"OfflineAudioCompletionEvent"};
var compositionend = {"eventInterface":"CompositionEvent","bubbles":true,"cancelable":true};
var compositionstart = {"eventInterface":"CompositionEvent","bubbles":true,"cancelable":true};
var compositionupdate = {"eventInterface":"CompositionEvent","bubbles":true,"cancelable":false};
var contextmenu = {"eventInterface":"MouseEvent","bubbles":true,"cancelable":true};
var copy = {"eventInterface":"ClipboardEvent"};
var cut = {"eventInterface":"ClipboardEvent","bubbles":true,"cancelable":true};
var dblclick = {"eventInterface":"MouseEvent","bubbles":true,"cancelable":true};
var devicechange = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var devicelight = {"eventInterface":"DeviceLightEvent","bubbles":false,"cancelable":false};
var devicemotion = {"eventInterface":"DeviceMotionEvent","bubbles":false,"cancelable":false};
var deviceorientation = {"eventInterface":"DeviceOrientationEvent","bubbles":false,"cancelable":false};
var deviceproximity = {"eventInterface":"DeviceProximityEvent","bubbles":false,"cancelable":false};
var dischargingtimechange = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var DOMActivate = {"eventInterface":"UIEvent","bubbles":true,"cancelable":true};
var DOMAttributeNameChanged = {"eventInterface":"MutationNameEvent","bubbles":true,"cancelable":true};
var DOMAttrModified = {"eventInterface":"MutationEvent","bubbles":true,"cancelable":true};
var DOMCharacterDataModified = {"eventInterface":"MutationEvent","bubbles":true,"cancelable":true};
var DOMContentLoaded = {"eventInterface":"Event","bubbles":true,"cancelable":true};
var DOMElementNameChanged = {"eventInterface":"MutationNameEvent","bubbles":true,"cancelable":true};
var DOMFocusIn = {"eventInterface":"FocusEvent","bubbles":true,"cancelable":true};
var DOMFocusOut = {"eventInterface":"FocusEvent","bubbles":true,"cancelable":true};
var DOMNodeInserted = {"eventInterface":"MutationEvent","bubbles":true,"cancelable":true};
var DOMNodeInsertedIntoDocument = {"eventInterface":"MutationEvent","bubbles":true,"cancelable":true};
var DOMNodeRemoved = {"eventInterface":"MutationEvent","bubbles":true,"cancelable":true};
var DOMNodeRemovedFromDocument = {"eventInterface":"MutationEvent","bubbles":true,"cancelable":true};
var DOMSubtreeModified = {"eventInterface":"MutationEvent"};
var downloading = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var drag = {"eventInterface":"DragEvent","bubbles":true,"cancelable":true};
var dragend = {"eventInterface":"DragEvent","bubbles":true,"cancelable":false};
var dragenter = {"eventInterface":"DragEvent","bubbles":true,"cancelable":true};
var dragleave = {"eventInterface":"DragEvent","bubbles":true,"cancelable":false};
var dragover = {"eventInterface":"DragEvent","bubbles":true,"cancelable":true};
var dragstart = {"eventInterface":"DragEvent","bubbles":true,"cancelable":true};
var drop = {"eventInterface":"DragEvent","bubbles":true,"cancelable":true};
var durationchange = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var emptied = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var end = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var ended = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var endEvent = {"eventInterface":"TimeEvent","bubbles":false,"cancelable":false};
var error = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var focus = {"eventInterface":"FocusEvent","bubbles":false,"cancelable":false};
var focusin = {"eventInterface":"FocusEvent","bubbles":true,"cancelable":false};
var focusout = {"eventInterface":"FocusEvent","bubbles":true,"cancelable":false};
var fullscreenchange = {"eventInterface":"Event","bubbles":true,"cancelable":false};
var fullscreenerror = {"eventInterface":"Event","bubbles":true,"cancelable":false};
var gamepadconnected = {"eventInterface":"GamepadEvent","bubbles":false,"cancelable":false};
var gamepaddisconnected = {"eventInterface":"GamepadEvent","bubbles":false,"cancelable":false};
var gotpointercapture = {"eventInterface":"PointerEvent","bubbles":false,"cancelable":false};
var hashchange = {"eventInterface":"HashChangeEvent","bubbles":true,"cancelable":false};
var lostpointercapture = {"eventInterface":"PointerEvent","bubbles":false,"cancelable":false};
var input = {"eventInterface":"Event","bubbles":true,"cancelable":false};
var invalid = {"eventInterface":"Event","cancelable":true,"bubbles":false};
var keydown = {"eventInterface":"KeyboardEvent","bubbles":true,"cancelable":true};
var keypress = {"eventInterface":"KeyboardEvent","bubbles":true,"cancelable":true};
var keyup = {"eventInterface":"KeyboardEvent","bubbles":true,"cancelable":true};
var languagechange = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var levelchange = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var load = {"eventInterface":"UIEvent","bubbles":false,"cancelable":false};
var loadeddata = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var loadedmetadata = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var loadend = {"eventInterface":"ProgressEvent","bubbles":false,"cancelable":false};
var loadstart = {"eventInterface":"ProgressEvent","bubbles":false,"cancelable":false};
var mark = {"eventInterface":"SpeechSynthesisEvent","bubbles":false,"cancelable":false};
var message = {"eventInterface":"MessageEvent","bubbles":false,"cancelable":false};
var messageerror = {"eventInterface":"MessageEvent","bubbles":false,"cancelable":false};
var mousedown = {"eventInterface":"MouseEvent","bubbles":true,"cancelable":true};
var mouseenter = {"eventInterface":"MouseEvent","bubbles":false,"cancelable":false};
var mouseleave = {"eventInterface":"MouseEvent","bubbles":false,"cancelable":false};
var mousemove = {"eventInterface":"MouseEvent","bubbles":true,"cancelable":true};
var mouseout = {"eventInterface":"MouseEvent","bubbles":true,"cancelable":true};
var mouseover = {"eventInterface":"MouseEvent","bubbles":true,"cancelable":true};
var mouseup = {"eventInterface":"MouseEvent","bubbles":true,"cancelable":true};
var nomatch = {"eventInterface":"SpeechRecognitionEvent","bubbles":false,"cancelable":false};
var notificationclick = {"eventInterface":"NotificationEvent","bubbles":false,"cancelable":false};
var noupdate = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var obsolete = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var offline = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var online = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var open = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var orientationchange = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var pagehide = {"eventInterface":"PageTransitionEvent","bubbles":false,"cancelable":false};
var pageshow = {"eventInterface":"PageTransitionEvent","bubbles":false,"cancelable":false};
var paste = {"eventInterface":"ClipboardEvent","bubbles":true,"cancelable":true};
var pause = {"eventInterface":"SpeechSynthesisEvent","bubbles":false,"cancelable":false};
var pointercancel = {"eventInterface":"PointerEvent","bubbles":true,"cancelable":false};
var pointerdown = {"eventInterface":"PointerEvent","bubbles":true,"cancelable":true};
var pointerenter = {"eventInterface":"PointerEvent","bubbles":false,"cancelable":false};
var pointerleave = {"eventInterface":"PointerEvent","bubbles":false,"cancelable":false};
var pointerlockchange = {"eventInterface":"Event","bubbles":true,"cancelable":false};
var pointerlockerror = {"eventInterface":"Event","bubbles":true,"cancelable":false};
var pointermove = {"eventInterface":"PointerEvent","bubbles":true,"cancelable":true};
var pointerout = {"eventInterface":"PointerEvent","bubbles":true,"cancelable":true};
var pointerover = {"eventInterface":"PointerEvent","bubbles":true,"cancelable":true};
var pointerup = {"eventInterface":"PointerEvent","bubbles":true,"cancelable":true};
var play = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var playing = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var popstate = {"eventInterface":"PopStateEvent","bubbles":true,"cancelable":false};
var progress = {"eventInterface":"ProgressEvent","bubbles":false,"cancelable":false};
var push = {"eventInterface":"PushEvent","bubbles":false,"cancelable":false};
var pushsubscriptionchange = {"eventInterface":"PushEvent","bubbles":false,"cancelable":false};
var ratechange = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var readystatechange = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var repeatEvent = {"eventInterface":"TimeEvent","bubbles":false,"cancelable":false};
var reset = {"eventInterface":"Event","bubbles":true,"cancelable":true};
var resize = {"eventInterface":"UIEvent","bubbles":false,"cancelable":false};
var resourcetimingbufferfull = {"eventInterface":"Performance","bubbles":true,"cancelable":true};
var result = {"eventInterface":"SpeechRecognitionEvent","bubbles":false,"cancelable":false};
var resume = {"eventInterface":"SpeechSynthesisEvent","bubbles":false,"cancelable":false};
var scroll = {"eventInterface":"UIEvent","bubbles":false,"cancelable":false};
var seeked = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var seeking = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var select = {"eventInterface":"UIEvent","bubbles":true,"cancelable":false};
var selectstart = {"eventInterface":"Event","bubbles":true,"cancelable":true};
var selectionchange = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var show = {"eventInterface":"MouseEvent","bubbles":false,"cancelable":false};
var slotchange = {"eventInterface":"Event","bubbles":true,"cancelable":false};
var soundend = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var soundstart = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var speechend = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var speechstart = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var stalled = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var start = {"eventInterface":"SpeechSynthesisEvent","bubbles":false,"cancelable":false};
var storage = {"eventInterface":"StorageEvent","bubbles":false,"cancelable":false};
var submit = {"eventInterface":"Event","bubbles":true,"cancelable":true};
var success = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var suspend = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var SVGAbort = {"eventInterface":"SVGEvent","bubbles":true,"cancelable":false};
var SVGError = {"eventInterface":"SVGEvent","bubbles":true,"cancelable":false};
var SVGLoad = {"eventInterface":"SVGEvent","bubbles":false,"cancelable":false};
var SVGResize = {"eventInterface":"SVGEvent","bubbles":true,"cancelable":false};
var SVGScroll = {"eventInterface":"SVGEvent","bubbles":true,"cancelable":false};
var SVGUnload = {"eventInterface":"SVGEvent","bubbles":false,"cancelable":false};
var SVGZoom = {"eventInterface":"SVGZoomEvent","bubbles":true,"cancelable":false};
var timeout = {"eventInterface":"ProgressEvent","bubbles":false,"cancelable":false};
var timeupdate = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var touchcancel = {"eventInterface":"TouchEvent","bubbles":true,"cancelable":false};
var touchend = {"eventInterface":"TouchEvent","bubbles":true,"cancelable":true};
var touchmove = {"eventInterface":"TouchEvent","bubbles":true,"cancelable":true};
var touchstart = {"eventInterface":"TouchEvent","bubbles":true,"cancelable":true};
var transitionend = {"eventInterface":"TransitionEvent","bubbles":true,"cancelable":true};
var unload = {"eventInterface":"UIEvent","bubbles":false};
var updateready = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var userproximity = {"eventInterface":"UserProximityEvent","bubbles":false,"cancelable":false};
var voiceschanged = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var visibilitychange = {"eventInterface":"Event","bubbles":true,"cancelable":false};
var volumechange = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var waiting = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var wheel = {"eventInterface":"WheelEvent","bubbles":true,"cancelable":true};
var domEventTypes = {
	abort: abort,
	afterprint: afterprint,
	animationend: animationend,
	animationiteration: animationiteration,
	animationstart: animationstart,
	appinstalled: appinstalled,
	audioprocess: audioprocess,
	audioend: audioend,
	audiostart: audiostart,
	beforeprint: beforeprint,
	beforeunload: beforeunload,
	beginEvent: beginEvent,
	blur: blur,
	boundary: boundary,
	cached: cached,
	canplay: canplay,
	canplaythrough: canplaythrough,
	change: change,
	chargingchange: chargingchange,
	chargingtimechange: chargingtimechange,
	checking: checking,
	click: click,
	close: close,
	complete: complete,
	compositionend: compositionend,
	compositionstart: compositionstart,
	compositionupdate: compositionupdate,
	contextmenu: contextmenu,
	copy: copy,
	cut: cut,
	dblclick: dblclick,
	devicechange: devicechange,
	devicelight: devicelight,
	devicemotion: devicemotion,
	deviceorientation: deviceorientation,
	deviceproximity: deviceproximity,
	dischargingtimechange: dischargingtimechange,
	DOMActivate: DOMActivate,
	DOMAttributeNameChanged: DOMAttributeNameChanged,
	DOMAttrModified: DOMAttrModified,
	DOMCharacterDataModified: DOMCharacterDataModified,
	DOMContentLoaded: DOMContentLoaded,
	DOMElementNameChanged: DOMElementNameChanged,
	DOMFocusIn: DOMFocusIn,
	DOMFocusOut: DOMFocusOut,
	DOMNodeInserted: DOMNodeInserted,
	DOMNodeInsertedIntoDocument: DOMNodeInsertedIntoDocument,
	DOMNodeRemoved: DOMNodeRemoved,
	DOMNodeRemovedFromDocument: DOMNodeRemovedFromDocument,
	DOMSubtreeModified: DOMSubtreeModified,
	downloading: downloading,
	drag: drag,
	dragend: dragend,
	dragenter: dragenter,
	dragleave: dragleave,
	dragover: dragover,
	dragstart: dragstart,
	drop: drop,
	durationchange: durationchange,
	emptied: emptied,
	end: end,
	ended: ended,
	endEvent: endEvent,
	error: error,
	focus: focus,
	focusin: focusin,
	focusout: focusout,
	fullscreenchange: fullscreenchange,
	fullscreenerror: fullscreenerror,
	gamepadconnected: gamepadconnected,
	gamepaddisconnected: gamepaddisconnected,
	gotpointercapture: gotpointercapture,
	hashchange: hashchange,
	lostpointercapture: lostpointercapture,
	input: input,
	invalid: invalid,
	keydown: keydown,
	keypress: keypress,
	keyup: keyup,
	languagechange: languagechange,
	levelchange: levelchange,
	load: load,
	loadeddata: loadeddata,
	loadedmetadata: loadedmetadata,
	loadend: loadend,
	loadstart: loadstart,
	mark: mark,
	message: message,
	messageerror: messageerror,
	mousedown: mousedown,
	mouseenter: mouseenter,
	mouseleave: mouseleave,
	mousemove: mousemove,
	mouseout: mouseout,
	mouseover: mouseover,
	mouseup: mouseup,
	nomatch: nomatch,
	notificationclick: notificationclick,
	noupdate: noupdate,
	obsolete: obsolete,
	offline: offline,
	online: online,
	open: open,
	orientationchange: orientationchange,
	pagehide: pagehide,
	pageshow: pageshow,
	paste: paste,
	pause: pause,
	pointercancel: pointercancel,
	pointerdown: pointerdown,
	pointerenter: pointerenter,
	pointerleave: pointerleave,
	pointerlockchange: pointerlockchange,
	pointerlockerror: pointerlockerror,
	pointermove: pointermove,
	pointerout: pointerout,
	pointerover: pointerover,
	pointerup: pointerup,
	play: play,
	playing: playing,
	popstate: popstate,
	progress: progress,
	push: push,
	pushsubscriptionchange: pushsubscriptionchange,
	ratechange: ratechange,
	readystatechange: readystatechange,
	repeatEvent: repeatEvent,
	reset: reset,
	resize: resize,
	resourcetimingbufferfull: resourcetimingbufferfull,
	result: result,
	resume: resume,
	scroll: scroll,
	seeked: seeked,
	seeking: seeking,
	select: select,
	selectstart: selectstart,
	selectionchange: selectionchange,
	show: show,
	slotchange: slotchange,
	soundend: soundend,
	soundstart: soundstart,
	speechend: speechend,
	speechstart: speechstart,
	stalled: stalled,
	start: start,
	storage: storage,
	submit: submit,
	success: success,
	suspend: suspend,
	SVGAbort: SVGAbort,
	SVGError: SVGError,
	SVGLoad: SVGLoad,
	SVGResize: SVGResize,
	SVGScroll: SVGScroll,
	SVGUnload: SVGUnload,
	SVGZoom: SVGZoom,
	timeout: timeout,
	timeupdate: timeupdate,
	touchcancel: touchcancel,
	touchend: touchend,
	touchmove: touchmove,
	touchstart: touchstart,
	transitionend: transitionend,
	unload: unload,
	updateready: updateready,
	userproximity: userproximity,
	voiceschanged: voiceschanged,
	visibilitychange: visibilitychange,
	volumechange: volumechange,
	waiting: waiting,
	wheel: wheel
};

var domEventTypes$1 = Object.freeze({
	abort: abort,
	afterprint: afterprint,
	animationend: animationend,
	animationiteration: animationiteration,
	animationstart: animationstart,
	appinstalled: appinstalled,
	audioprocess: audioprocess,
	audioend: audioend,
	audiostart: audiostart,
	beforeprint: beforeprint,
	beforeunload: beforeunload,
	beginEvent: beginEvent,
	blur: blur,
	boundary: boundary,
	cached: cached,
	canplay: canplay,
	canplaythrough: canplaythrough,
	change: change,
	chargingchange: chargingchange,
	chargingtimechange: chargingtimechange,
	checking: checking,
	click: click,
	close: close,
	complete: complete,
	compositionend: compositionend,
	compositionstart: compositionstart,
	compositionupdate: compositionupdate,
	contextmenu: contextmenu,
	copy: copy,
	cut: cut,
	dblclick: dblclick,
	devicechange: devicechange,
	devicelight: devicelight,
	devicemotion: devicemotion,
	deviceorientation: deviceorientation,
	deviceproximity: deviceproximity,
	dischargingtimechange: dischargingtimechange,
	DOMActivate: DOMActivate,
	DOMAttributeNameChanged: DOMAttributeNameChanged,
	DOMAttrModified: DOMAttrModified,
	DOMCharacterDataModified: DOMCharacterDataModified,
	DOMContentLoaded: DOMContentLoaded,
	DOMElementNameChanged: DOMElementNameChanged,
	DOMFocusIn: DOMFocusIn,
	DOMFocusOut: DOMFocusOut,
	DOMNodeInserted: DOMNodeInserted,
	DOMNodeInsertedIntoDocument: DOMNodeInsertedIntoDocument,
	DOMNodeRemoved: DOMNodeRemoved,
	DOMNodeRemovedFromDocument: DOMNodeRemovedFromDocument,
	DOMSubtreeModified: DOMSubtreeModified,
	downloading: downloading,
	drag: drag,
	dragend: dragend,
	dragenter: dragenter,
	dragleave: dragleave,
	dragover: dragover,
	dragstart: dragstart,
	drop: drop,
	durationchange: durationchange,
	emptied: emptied,
	end: end,
	ended: ended,
	endEvent: endEvent,
	error: error,
	focus: focus,
	focusin: focusin,
	focusout: focusout,
	fullscreenchange: fullscreenchange,
	fullscreenerror: fullscreenerror,
	gamepadconnected: gamepadconnected,
	gamepaddisconnected: gamepaddisconnected,
	gotpointercapture: gotpointercapture,
	hashchange: hashchange,
	lostpointercapture: lostpointercapture,
	input: input,
	invalid: invalid,
	keydown: keydown,
	keypress: keypress,
	keyup: keyup,
	languagechange: languagechange,
	levelchange: levelchange,
	load: load,
	loadeddata: loadeddata,
	loadedmetadata: loadedmetadata,
	loadend: loadend,
	loadstart: loadstart,
	mark: mark,
	message: message,
	messageerror: messageerror,
	mousedown: mousedown,
	mouseenter: mouseenter,
	mouseleave: mouseleave,
	mousemove: mousemove,
	mouseout: mouseout,
	mouseover: mouseover,
	mouseup: mouseup,
	nomatch: nomatch,
	notificationclick: notificationclick,
	noupdate: noupdate,
	obsolete: obsolete,
	offline: offline,
	online: online,
	open: open,
	orientationchange: orientationchange,
	pagehide: pagehide,
	pageshow: pageshow,
	paste: paste,
	pause: pause,
	pointercancel: pointercancel,
	pointerdown: pointerdown,
	pointerenter: pointerenter,
	pointerleave: pointerleave,
	pointerlockchange: pointerlockchange,
	pointerlockerror: pointerlockerror,
	pointermove: pointermove,
	pointerout: pointerout,
	pointerover: pointerover,
	pointerup: pointerup,
	play: play,
	playing: playing,
	popstate: popstate,
	progress: progress,
	push: push,
	pushsubscriptionchange: pushsubscriptionchange,
	ratechange: ratechange,
	readystatechange: readystatechange,
	repeatEvent: repeatEvent,
	reset: reset,
	resize: resize,
	resourcetimingbufferfull: resourcetimingbufferfull,
	result: result,
	resume: resume,
	scroll: scroll,
	seeked: seeked,
	seeking: seeking,
	select: select,
	selectstart: selectstart,
	selectionchange: selectionchange,
	show: show,
	slotchange: slotchange,
	soundend: soundend,
	soundstart: soundstart,
	speechend: speechend,
	speechstart: speechstart,
	stalled: stalled,
	start: start,
	storage: storage,
	submit: submit,
	success: success,
	suspend: suspend,
	SVGAbort: SVGAbort,
	SVGError: SVGError,
	SVGLoad: SVGLoad,
	SVGResize: SVGResize,
	SVGScroll: SVGScroll,
	SVGUnload: SVGUnload,
	SVGZoom: SVGZoom,
	timeout: timeout,
	timeupdate: timeupdate,
	touchcancel: touchcancel,
	touchend: touchend,
	touchmove: touchmove,
	touchstart: touchstart,
	transitionend: transitionend,
	unload: unload,
	updateready: updateready,
	userproximity: userproximity,
	voiceschanged: voiceschanged,
	visibilitychange: visibilitychange,
	volumechange: volumechange,
	waiting: waiting,
	wheel: wheel,
	default: domEventTypes
});

var require$$0 = ( domEventTypes$1 && domEventTypes ) || domEventTypes$1;

var domEventTypes$2 = require$$0;

var defaultEventType = {
  eventInterface: 'Event',
  cancelable: true,
  bubbles: true
};

var modifiers = {
  enter: 13,
  tab: 9,
  delete: 46,
  esc: 27,
  space: 32,
  up: 38,
  down: 40,
  left: 37,
  right: 39,
  end: 35,
  home: 36,
  backspace: 8,
  insert: 45,
  pageup: 33,
  pagedown: 34
};

function createEvent (
  type,
  modifier,
  ref,
  options
) {
  var eventInterface = ref.eventInterface;
  var bubbles = ref.bubbles;
  var cancelable = ref.cancelable;

  var SupportedEventInterface =
    typeof window[eventInterface] === 'function'
      ? window[eventInterface]
      : window.Event;

  var event = new SupportedEventInterface(type, Object.assign({}, options,
    {bubbles: bubbles,
    cancelable: cancelable,
    keyCode: modifiers[modifier]}));

  return event
}

function createOldEvent (
  type,
  modifier,
  ref
) {
  var eventInterface = ref.eventInterface;
  var bubbles = ref.bubbles;
  var cancelable = ref.cancelable;

  var event = document.createEvent('Event');
  event.initEvent(type, bubbles, cancelable);
  event.keyCode = modifiers[modifier];
  return event
}

function createDOMEvent (type, options) {
  var ref = type.split('.');
  var eventType = ref[0];
  var modifier = ref[1];
  var meta = domEventTypes$2[eventType] || defaultEventType;

  // Fallback for IE10,11 - https://stackoverflow.com/questions/26596123
  var event = typeof window.Event === 'function'
    ? createEvent(eventType, modifier, meta, options)
    : createOldEvent(eventType, modifier, meta);

  var eventPrototype = Object.getPrototypeOf(event);
  Object.keys(options || {}).forEach(function (key) {
    var propertyDescriptor =
      Object.getOwnPropertyDescriptor(eventPrototype, key);

    var canSetProperty = !(
      propertyDescriptor &&
      propertyDescriptor.setter === undefined
    );
    if (canSetProperty) {
      event[key] = options[key];
    }
  });

  return event
}

// 

var Wrapper = function Wrapper (
  node,
  options,
  isVueWrapper
) {
  var vnode = node instanceof Element ? null : node;
  var element = node instanceof Element ? node : node.elm;
  // Prevent redefine by VueWrapper
  if (!isVueWrapper) {
    // $FlowIgnore : issue with defineProperty
    Object.defineProperty(this, 'rootNode', {
      get: function () { return vnode || element; },
      set: function () { return throwError('wrapper.rootNode is read-only'); }
    });
    // $FlowIgnore
    Object.defineProperty(this, 'vnode', {
      get: function () { return vnode; },
      set: function () { return throwError('wrapper.vnode is read-only'); }
    });
    // $FlowIgnore
    Object.defineProperty(this, 'element', {
      get: function () { return element; },
      set: function () { return throwError('wrapper.element is read-only'); }
    });
    // $FlowIgnore
    Object.defineProperty(this, 'vm', {
      get: function () { return undefined; },
      set: function () { return throwError('wrapper.vm is read-only'); }
    });
  }
  var frozenOptions = Object.freeze(options);
  // $FlowIgnore
  Object.defineProperty(this, 'options', {
    get: function () { return frozenOptions; },
    set: function () { return throwError('wrapper.options is read-only'); }
  });
  if (
    this.vnode &&
    (this.vnode[FUNCTIONAL_OPTIONS] || this.vnode.functionalContext)
  ) {
    this.isFunctionalComponent = true;
  }
};

Wrapper.prototype.at = function at () {
  throwError('at() must be called on a WrapperArray');
};

/**
 * Returns an Object containing all the attribute/value pairs on the element.
 */
Wrapper.prototype.attributes = function attributes (key) {
  var attributes = this.element.attributes;
  var attributeMap = {};
  for (var i = 0; i < attributes.length; i++) {
    var att = attributes.item(i);
    attributeMap[att.localName] = att.value;
  }
  if (key) {
    return attributeMap[key]
  }
  return attributeMap
};

/**
 * Returns an Array containing all the classes on the element
 */
Wrapper.prototype.classes = function classes (className) {
    var this$1 = this;

  var classAttribute = this.element.getAttribute('class');
  var classes = classAttribute ? classAttribute.split(' ') : [];
  // Handle converting cssmodules identifiers back to the original class name
  if (this.vm && this.vm.$style) {
    var cssModuleIdentifiers = Object.keys(this.vm.$style)
      .reduce(function (acc, key) {
      // $FlowIgnore
        var moduleIdent = this$1.vm.$style[key];
        if (moduleIdent) {
          acc[moduleIdent.split(' ')[0]] = key;
        }
        return acc
      }, {});
    classes = classes.map(
      function (name) { return cssModuleIdentifiers[name] || name; }
    );
  }

  if (className) {
    if (classes.indexOf(className) > -1) {
      return true
    } else {
      return false
    }
  }
  return classes
};

/**
 * Checks if wrapper contains provided selector.
 */
Wrapper.prototype.contains = function contains (rawSelector) {
  var selector = getSelector(rawSelector, 'contains');
  var nodes = find(this.rootNode, this.vm, selector);
  return nodes.length > 0
};

/**
 * Calls destroy on vm
 */
Wrapper.prototype.destroy = function destroy () {
  if (!this.isVueInstance()) {
    throwError("wrapper.destroy() can only be called on a Vue instance");
  }

  if (this.element.parentNode) {
    this.element.parentNode.removeChild(this.element);
  }
  // $FlowIgnore
  this.vm.$destroy();
};

/**
 * Returns an object containing custom events emitted by the Wrapper vm
 */
Wrapper.prototype.emitted = function emitted (
  event
) {
  if (!this._emitted && !this.vm) {
    throwError("wrapper.emitted() can only be called on a Vue instance");
  }
  if (event) {
    return this._emitted[event]
  }
  return this._emitted
};

/**
 * Returns an Array containing custom events emitted by the Wrapper vm
 */
Wrapper.prototype.emittedByOrder = function emittedByOrder () {
  if (!this._emittedByOrder && !this.vm) {
    throwError(
      "wrapper.emittedByOrder() can only be called on a Vue instance"
    );
  }
  return this._emittedByOrder
};

/**
 * Utility to check wrapper exists. Returns true as Wrapper always exists
 */
Wrapper.prototype.exists = function exists () {
  if (this.vm) {
    return !!this.vm && !this.vm._isDestroyed
  }
  return true
};

Wrapper.prototype.filter = function filter () {
  throwError('filter() must be called on a WrapperArray');
};

/**
 * Finds first node in tree of the current wrapper that
 * matches the provided selector.
 */
Wrapper.prototype.find = function find$1 (rawSelector) {
  var selector = getSelector(rawSelector, 'find');
  var node = find(this.rootNode, this.vm, selector)[0];

  if (!node) {
    if (selector.type === REF_SELECTOR) {
      return new ErrorWrapper(("ref=\"" + (selector.value.ref) + "\""))
    }
    return new ErrorWrapper(
      typeof selector.value === 'string'
        ? selector.value
        : 'Component'
    )
  }

  return createWrapper(node, this.options)
};

/**
 * Finds node in tree of the current wrapper that matches
 * the provided selector.
 */
Wrapper.prototype.findAll = function findAll (rawSelector) {
    var this$1 = this;

  var selector = getSelector(rawSelector, 'findAll');
  var nodes = find(this.rootNode, this.vm, selector);
  var wrappers = nodes.map(function (node) {
    // Using CSS Selector, returns a VueWrapper instance if the root element
    // binds a Vue instance.
    return createWrapper(node, this$1.options)
  });
  return new WrapperArray(wrappers)
};

/**
 * Checks if wrapper has an attribute with matching value
 */
Wrapper.prototype.hasAttribute = function hasAttribute (attribute, value) {
  warn(
    "hasAttribute() has been deprecated and will be " +
    "removed in version 1.0.0. Use attributes() " +
    "instead—https://vue-test-utils.vuejs.org/api/wrapper/attributes.html"
  );

  if (typeof attribute !== 'string') {
    throwError(
      "wrapper.hasAttribute() must be passed attribute as a string"
    );
  }

  if (typeof value !== 'string') {
    throwError(
      "wrapper.hasAttribute() must be passed value as a string"
    );
  }

  return !!(this.element.getAttribute(attribute) === value)
};

/**
 * Asserts wrapper has a class name
 */
Wrapper.prototype.hasClass = function hasClass (className) {
    var this$1 = this;

  warn(
    "hasClass() has been deprecated and will be removed " +
    "in version 1.0.0. Use classes() " +
    "instead—https://vue-test-utils.vuejs.org/api/wrapper/classes.html"
  );
  var targetClass = className;

  if (typeof targetClass !== 'string') {
    throwError('wrapper.hasClass() must be passed a string');
  }

  // if $style is available and has a matching target, use that instead.
  if (this.vm && this.vm.$style && this.vm.$style[targetClass]) {
    targetClass = this.vm.$style[targetClass];
  }

  var containsAllClasses = targetClass
    .split(' ')
    .every(function (target) { return this$1.element.classList.contains(target); });

  return !!(this.element && containsAllClasses)
};

/**
 * Asserts wrapper has a prop name
 */
Wrapper.prototype.hasProp = function hasProp (prop, value) {
  warn(
    "hasProp() has been deprecated and will be removed " +
    "in version 1.0.0. Use props() " +
    "instead—https://vue-test-utils.vuejs.org/api/wrapper/props.html"
  );

  if (!this.isVueInstance()) {
    throwError('wrapper.hasProp() must be called on a Vue instance');
  }
  if (typeof prop !== 'string') {
    throwError('wrapper.hasProp() must be passed prop as a string');
  }

  // $props object does not exist in Vue 2.1.x, so use
  // $options.propsData instead
  if (
    this.vm &&
    this.vm.$options &&
    this.vm.$options.propsData &&
    this.vm.$options.propsData[prop] === value
  ) {
    return true
  }

  return !!this.vm && !!this.vm.$props && this.vm.$props[prop] === value
};

/**
 * Checks if wrapper has a style with value
 */
Wrapper.prototype.hasStyle = function hasStyle (style, value) {
  warn(
    "hasStyle() has been deprecated and will be removed " +
    "in version 1.0.0. Use wrapper.element.style " +
    "instead"
  );

  if (typeof style !== 'string') {
    throwError("wrapper.hasStyle() must be passed style as a string");
  }

  if (typeof value !== 'string') {
    throwError('wrapper.hasClass() must be passed value as string');
  }

  /* istanbul ignore next */
  if (
    navigator.userAgent.includes &&
    (navigator.userAgent.includes('node.js') ||
      navigator.userAgent.includes('jsdom'))
  ) {
    warn(
      "wrapper.hasStyle is not fully supported when " +
      "running jsdom - only inline styles are supported"
    );
  }
  var body = document.querySelector('body');
  var mockElement = document.createElement('div');

  if (!(body instanceof Element)) {
    return false
  }
  var mockNode = body.insertBefore(mockElement, null);
  // $FlowIgnore : Flow thinks style[style] returns a number
  mockElement.style[style] = value;

  if (!this.options.attachedToDocument && (this.vm || this.vnode)) {
    // $FlowIgnore : Possible null value, will be removed in 1.0.0
    var vm = this.vm || this.vnode.context.$root;
    body.insertBefore(vm.$root._vnode.elm, null);
  }

  var elStyle = window.getComputedStyle(this.element)[style];
  var mockNodeStyle = window.getComputedStyle(mockNode)[style];
  return !!(elStyle && mockNodeStyle && elStyle === mockNodeStyle)
};

/**
 * Returns HTML of element as a string
 */
Wrapper.prototype.html = function html () {
  return this.element.outerHTML
};

/**
 * Checks if node matches selector
 */
Wrapper.prototype.is = function is (rawSelector) {
  var selector = getSelector(rawSelector, 'is');

  if (selector.type === REF_SELECTOR) {
    throwError('$ref selectors can not be used with wrapper.is()');
  }

  return matches(this.rootNode, selector)
};

/**
 * Checks if node is empty
 */
Wrapper.prototype.isEmpty = function isEmpty () {
  if (!this.vnode) {
    return this.element.innerHTML === ''
  }
  var nodes = [];
  var node = this.vnode;
  var i = 0;

  while (node) {
    if (node.child) {
      nodes.push(node.child._vnode);
    }
    node.children && node.children.forEach(function (n) {
      nodes.push(n);
    });
    node = nodes[i++];
  }
  return nodes.every(function (n) { return n.isComment || n.child; })
};

/**
 * Checks if node is visible
 */
Wrapper.prototype.isVisible = function isVisible () {
  var element = this.element;
  while (element) {
    if (
      element.style &&
      (element.style.visibility === 'hidden' ||
        element.style.display === 'none')
    ) {
      return false
    }
    element = element.parentElement;
  }

  return true
};

/**
 * Checks if wrapper is a vue instance
 */
Wrapper.prototype.isVueInstance = function isVueInstance () {
  return !!this.vm
};

/**
 * Returns name of component, or tag name if node is not a Vue component
 */
Wrapper.prototype.name = function name () {
  if (this.vm) {
    return this.vm.$options.name ||
    // compat for Vue < 2.3
    (this.vm.$options.extendOptions && this.vm.$options.extendOptions.name)
  }

  if (!this.vnode) {
    return this.element.tagName
  }

  return this.vnode.tag
};

/**
 * Returns an Object containing the prop name/value pairs on the element
 */
Wrapper.prototype.props = function props (key) {
    var this$1 = this;

  if (this.isFunctionalComponent) {
    throwError(
      "wrapper.props() cannot be called on a mounted " +
        "functional component."
    );
  }
  if (!this.vm) {
    throwError('wrapper.props() must be called on a Vue instance');
  }

  var props = {};
  var keys = this.vm && this.vm.$options._propKeys;

  if (keys) {
    (keys || {}).forEach(function (key) {
      if (this$1.vm) {
        props[key] = this$1.vm[key];
      }
    });
  }

  if (key) {
    return props[key]
  }

  return props
};

/**
 * Checks radio button or checkbox element
 */
Wrapper.prototype.setChecked = function setChecked (checked) {
    if ( checked === void 0 ) checked = true;

  if (typeof checked !== 'boolean') {
    throwError('wrapper.setChecked() must be passed a boolean');
  }
  var tagName = this.element.tagName;
  // $FlowIgnore
  var type = this.attributes().type;
  var event = getCheckedEvent();

  if (tagName === 'INPUT' && type === 'checkbox') {
    if (this.element.checked === checked) {
      return
    }
    if (event !== 'click' || isPhantomJS) {
      // $FlowIgnore
      this.element.checked = checked;
    }
    this.trigger(event);
    return
  }

  if (tagName === 'INPUT' && type === 'radio') {
    if (!checked) {
      throwError(
        "wrapper.setChecked() cannot be called with " +
        "parameter false on a <input type=\"radio\" /> " +
        "element."
      );
    }

    if (event !== 'click' || isPhantomJS) {
      // $FlowIgnore
      this.element.selected = true;
    }
    this.trigger(event);
    return
  }

  throwError("wrapper.setChecked() cannot be called on this element");
};

/**
 * Selects <option></option> element
 */
Wrapper.prototype.setSelected = function setSelected () {
  var tagName = this.element.tagName;

  if (tagName === 'SELECT') {
    throwError(
      "wrapper.setSelected() cannot be called on select. " +
      "Call it on one of its options"
    );
  }

  if (tagName === 'OPTION') {
    // $FlowIgnore
    this.element.selected = true;
    // $FlowIgnore
    var parentElement = this.element.parentElement;

    // $FlowIgnore
    if (parentElement.tagName === 'OPTGROUP') {
      // $FlowIgnore
      parentElement = parentElement.parentElement;
    }

    // $FlowIgnore
    createWrapper(parentElement, this.options).trigger('change');
    return
  }

  throwError("wrapper.setSelected() cannot be called on this element");
};

/**
 * Sets vm computed
 */
Wrapper.prototype.setComputed = function setComputed (computed) {
    var this$1 = this;

  if (!this.isVueInstance()) {
    throwError(
      "wrapper.setComputed() can only be called on a Vue " +
      "instance"
    );
  }

  warn(
    "setComputed() has been deprecated and will be " +
      "removed in version 1.0.0. You can overwrite " +
      "computed properties by passing a computed object " +
      "in the mounting options"
  );

  Object.keys(computed).forEach(function (key) {
    if (VUE_VERSION > 2.1) {
      // $FlowIgnore : Problem with possibly null this.vm
      if (!this$1.vm._computedWatchers[key]) {
        throwError(
          "wrapper.setComputed() was passed a value that " +
          "does not exist as a computed property on the " +
          "Vue instance. Property " + key + " does not exist " +
          "on the Vue instance"
        );
      }
      // $FlowIgnore : Problem with possibly null this.vm
      this$1.vm._computedWatchers[key].value = computed[key];
      // $FlowIgnore : Problem with possibly null this.vm
      this$1.vm._computedWatchers[key].getter = function () { return computed[key]; };
    } else {
      var isStore = false;
      // $FlowIgnore : Problem with possibly null this.vm
      this$1.vm._watchers.forEach(function (watcher) {
        if (watcher.getter.vuex && key in watcher.vm.$options.store.getters) {
          watcher.vm.$options.store.getters = Object.assign({}, watcher.vm.$options.store.getters);
          Object.defineProperty(watcher.vm.$options.store.getters, key, {
            get: function () {
              return computed[key]
            }
          });
          isStore = true;
        }
      });

      // $FlowIgnore : Problem with possibly null this.vm
      if (!isStore && !this$1.vm._watchers.some(function (w) { return w.getter.name === key; })) {
        throwError(
          "wrapper.setComputed() was passed a value that does " +
          "not exist as a computed property on the Vue instance. " +
          "Property " + key + " does not exist on the Vue instance"
        );
      }
      // $FlowIgnore : Problem with possibly null this.vm
      this$1.vm._watchers.forEach(function (watcher) {
        if (watcher.getter.name === key) {
          watcher.value = computed[key];
          watcher.getter = function () { return computed[key]; };
        }
      });
    }
  });
  // $FlowIgnore : Problem with possibly null this.vm
  this.vm._watchers.forEach(function (watcher) {
    watcher.run();
  });
};

/**
 * Sets vm data
 */
Wrapper.prototype.setData = function setData (data) {
  if (this.isFunctionalComponent) {
    throwError(
      "wrapper.setData() cannot be called on a functional " +
      "component"
    );
  }

  if (!this.vm) {
    throwError(
      "wrapper.setData() can only be called on a Vue " +
      "instance"
    );
  }

  recursivelySetData(this.vm, this.vm, data);
};

/**
 * Sets vm methods
 */
Wrapper.prototype.setMethods = function setMethods (methods) {
    var this$1 = this;

  if (!this.isVueInstance()) {
    throwError(
      "wrapper.setMethods() can only be called on a Vue " +
      "instance"
    );
  }
  Object.keys(methods).forEach(function (key) {
    // $FlowIgnore : Problem with possibly null this.vm
    this$1.vm[key] = methods[key];
    // $FlowIgnore : Problem with possibly null this.vm
    this$1.vm.$options.methods[key] = methods[key];
  });

  if (this.vnode) {
    var context = this.vnode.context;
    if (context.$options.render) { context._update(context._render()); }
  }
};

/**
 * Sets vm props
 */
Wrapper.prototype.setProps = function setProps (data) {
    var this$1 = this;

  var originalConfig = Vue.config.silent;
  Vue.config.silent = config.silent;
  if (this.isFunctionalComponent) {
    throwError(
      "wrapper.setProps() cannot be called on a " +
      "functional component"
    );
  }
  if (!this.vm) {
    throwError(
      "wrapper.setProps() can only be called on a Vue " +
      "instance"
    );
  }

  Object.keys(data).forEach(function (key) {
    if (
      typeof data[key] === 'object' &&
      data[key] !== null &&
      // $FlowIgnore : Problem with possibly null this.vm
      data[key] === this$1.vm[key]
    ) {
      throwError(
        "wrapper.setProps() called with the same object " +
        "of the existing " + key + " property. " +
        "You must call wrapper.setProps() with a new object " +
        "to trigger reactivity"
      );
    }
    if (
      !this$1.vm ||
      !this$1.vm.$options._propKeys ||
      !this$1.vm.$options._propKeys.some(function (prop) { return prop === key; })
    ) {
      if (VUE_VERSION > 2.3) {
        // $FlowIgnore : Problem with possibly null this.vm
        this$1.vm.$attrs[key] = data[key];
        return
      }
      throwError(
        "wrapper.setProps() called with " + key + " property which " +
        "is not defined on the component"
      );
    }

    if (this$1.vm && this$1.vm._props) {
      // Set actual props value
      this$1.vm._props[key] = data[key];
      // $FlowIgnore : Problem with possibly null this.vm
      this$1.vm[key] = data[key];
    } else {
      // $FlowIgnore : Problem with possibly null this.vm.$options
      this$1.vm.$options.propsData[key] = data[key];
      // $FlowIgnore : Problem with possibly null this.vm
      this$1.vm[key] = data[key];
      // $FlowIgnore : Need to call this twice to fix watcher bug in 2.0.x
      this$1.vm[key] = data[key];
    }
  });
  // $FlowIgnore : Problem with possibly null this.vm
  this.vm.$forceUpdate();
  // $FlowIgnore : Problem with possibly null this.vm
  orderWatchers(this.vm || this.vnode.context.$root);
  Vue.config.silent = originalConfig;
};

/**
 * Sets element value and triggers input event
 */
Wrapper.prototype.setValue = function setValue (value) {
  var tagName = this.element.tagName;
  // $FlowIgnore
  var type = this.attributes().type;

  if (tagName === 'OPTION') {
    throwError(
      "wrapper.setValue() cannot be called on an <option> " +
        "element. Use wrapper.setSelected() instead"
    );
  } else if (tagName === 'INPUT' && type === 'checkbox') {
    throwError(
      "wrapper.setValue() cannot be called on a <input " +
        "type=\"checkbox\" /> element. Use " +
        "wrapper.setChecked() instead"
    );
  } else if (tagName === 'INPUT' && type === 'radio') {
    throwError(
      "wrapper.setValue() cannot be called on a <input " +
        "type=\"radio\" /> element. Use wrapper.setChecked() " +
        "instead"
    );
  } else if (
    tagName === 'INPUT' ||
    tagName === 'TEXTAREA' ||
    tagName === 'SELECT'
  ) {
    var event = tagName === 'SELECT' ? 'change' : 'input';
    // $FlowIgnore
    this.element.value = value;
    this.trigger(event);
  } else {
    throwError("wrapper.setValue() cannot be called on this element");
  }
};

/**
 * Return text of wrapper element
 */
Wrapper.prototype.text = function text () {
  return this.element.textContent.trim()
};

/**
 * Dispatches a DOM event on wrapper
 */
Wrapper.prototype.trigger = function trigger (type, options) {
    if ( options === void 0 ) options = {};

  if (typeof type !== 'string') {
    throwError('wrapper.trigger() must be passed a string');
  }

  if (options.target) {
    throwError(
      "you cannot set the target value of an event. See " +
        "the notes section of the docs for more " +
        "details—https://vue-test-utils.vuejs.org/api/wrapper/trigger.html"
    );
  }

  // Don't fire event on a disabled element
  if (this.attributes().disabled) {
    return
  }

  var event = createDOMEvent(type, options);
  this.element.dispatchEvent(event);

  if (this.vnode) {
    orderWatchers(this.vm || this.vnode.context.$root);
  }
};

Wrapper.prototype.update = function update () {
  warn(
    "update has been removed from vue-test-utils. All " +
    "updates are now synchronous by default"
  );
};

/**
 * Utility to check wrapper is visible. Returns false if a parent
 * element has display: none or visibility: hidden style.
 */
Wrapper.prototype.visible = function visible () {
  warn(
    "visible has been deprecated and will be removed in " +
    "version 1, use isVisible instead"
  );
  var element = this.element;
  while (element) {
    if (
      element.style &&
      (element.style.visibility === 'hidden' ||
        element.style.display === 'none')
    ) {
      return false
    }
    element = element.parentElement;
  }

  return true
};

// 

function setDepsSync (dep) {
  dep.subs.forEach(setWatcherSync);
}

function setWatcherSync (watcher) {
  if (watcher.sync === true) {
    return
  }
  watcher.sync = true;
  watcher.deps.forEach(setDepsSync);
}

function setWatchersToSync (vm) {
  if (vm._watchers) {
    vm._watchers.forEach(setWatcherSync);
  }

  if (vm._computedWatchers) {
    Object.keys(vm._computedWatchers).forEach(function (computedWatcher) {
      setWatcherSync(vm._computedWatchers[computedWatcher]);
    });
  }

  setWatcherSync(vm._watcher);

  vm.$children.forEach(setWatchersToSync);
  // preventing double registration
  if (!vm.$_vueTestUtils_updateInSetWatcherSync) {
    vm.$_vueTestUtils_updateInSetWatcherSync = vm._update;
    vm._update = function (vnode, hydrating) {
      var this$1 = this;

      this.$_vueTestUtils_updateInSetWatcherSync(vnode, hydrating);
      if (VUE_VERSION >= 2.1 && this._isMounted && this.$options.updated) {
        this.$options.updated.forEach(function (handler) {
          handler.call(this$1);
        });
      }
    };
  }
}

// 

var VueWrapper = (function (Wrapper$$1) {
  function VueWrapper (vm, options) {
    var this$1 = this;

    Wrapper$$1.call(this, vm._vnode, options, true);
    // $FlowIgnore : issue with defineProperty
    Object.defineProperty(this, 'rootNode', {
      get: function () { return vm.$vnode || { child: this$1.vm }; },
      set: function () { return throwError('wrapper.vnode is read-only'); }
    });
    // $FlowIgnore : issue with defineProperty
    Object.defineProperty(this, 'vnode', {
      get: function () { return vm._vnode; },
      set: function () { return throwError('wrapper.vnode is read-only'); }
    });
    // $FlowIgnore
    Object.defineProperty(this, 'element', {
      get: function () { return vm.$el; },
      set: function () { return throwError('wrapper.element is read-only'); }
    });
    // $FlowIgnore
    Object.defineProperty(this, 'vm', {
      get: function () { return vm; },
      set: function () { return throwError('wrapper.vm is read-only'); }
    });
    if (options.sync) {
      setWatchersToSync(vm);
      orderWatchers(vm);
    }
    this.isFunctionalComponent = vm.$options._isFunctionalContainer;
    this._emitted = vm.__emitted;
    this._emittedByOrder = vm.__emittedByOrder;
  }

  if ( Wrapper$$1 ) VueWrapper.__proto__ = Wrapper$$1;
  VueWrapper.prototype = Object.create( Wrapper$$1 && Wrapper$$1.prototype );
  VueWrapper.prototype.constructor = VueWrapper;

  return VueWrapper;
}(Wrapper));

// 

function createVNodes (
  vm,
  slotValue,
  name
) {
  var el = vueTemplateCompiler.compileToFunctions(
    ("<div><template slot=" + name + ">" + slotValue + "</template></div>")
  );
  var _staticRenderFns = vm._renderProxy.$options.staticRenderFns;
  var _staticTrees = vm._renderProxy._staticTrees;
  vm._renderProxy._staticTrees = [];
  vm._renderProxy.$options.staticRenderFns = el.staticRenderFns;
  var vnode = el.render.call(vm._renderProxy, vm.$createElement);
  vm._renderProxy.$options.staticRenderFns = _staticRenderFns;
  vm._renderProxy._staticTrees = _staticTrees;
  return vnode.children[0]
}

function createVNodesForSlot (
  vm,
  slotValue,
  name
) {
  if (typeof slotValue === 'string') {
    return createVNodes(vm, slotValue, name)
  }
  var vnode = vm.$createElement(slotValue)
  ;(vnode.data || (vnode.data = {})).slot = name;
  return vnode
}

function createSlotVNodes (
  vm,
  slots
) {
  return Object.keys(slots).reduce(function (acc, key) {
    var content = slots[key];
    if (Array.isArray(content)) {
      var nodes = content.map(
        function (slotDef) { return createVNodesForSlot(vm, slotDef, key); }
      );
      return acc.concat(nodes)
    }

    return acc.concat(createVNodesForSlot(vm, content, key))
  }, [])
}

// 

function addMocks (
  _Vue,
  mockedProperties
) {
  if ( mockedProperties === void 0 ) mockedProperties = {};

  if (mockedProperties === false) {
    return
  }
  Object.keys(mockedProperties).forEach(function (key) {
    try {
      // $FlowIgnore
      _Vue.prototype[key] = mockedProperties[key];
    } catch (e) {
      warn(
        "could not overwrite property " + key + ", this is " +
        "usually caused by a plugin that has added " +
        "the property as a read-only value"
      );
    }
    // $FlowIgnore
    Vue.util.defineReactive(_Vue, key, mockedProperties[key]);
  });
}

// 

function logEvents (
  vm,
  emitted,
  emittedByOrder
) {
  var emit = vm.$emit;
  vm.$emit = function (name) {
    var args = [], len = arguments.length - 1;
    while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

    (emitted[name] || (emitted[name] = [])).push(args);
    emittedByOrder.push({ name: name, args: args });
    return emit.call.apply(emit, [ vm, name ].concat( args ))
  };
}

function addEventLogger (_Vue) {
  _Vue.mixin({
    beforeCreate: function () {
      this.__emitted = Object.create(null);
      this.__emittedByOrder = [];
      logEvents(this, this.__emitted, this.__emittedByOrder);
    }
  });
}

function addStubs (_Vue, stubComponents) {
  var obj;

  function addStubComponentsMixin () {
    Object.assign(this.$options.components, stubComponents);
  }

  _Vue.mixin(( obj = {}, obj[BEFORE_RENDER_LIFECYCLE_HOOK] = addStubComponentsMixin, obj));
}

// 

function compileFromString (str) {
  if (!vueTemplateCompiler.compileToFunctions) {
    throwError(
      "vueTemplateCompiler is undefined, you must pass " +
        "precompiled components if vue-template-compiler is " +
        "undefined"
    );
  }
  return vueTemplateCompiler.compileToFunctions(str)
}

function compileTemplate (component) {
  if (component.template) {
    Object.assign(component, vueTemplateCompiler.compileToFunctions(component.template));
  }

  if (component.components) {
    Object.keys(component.components).forEach(function (c) {
      var cmp = component.components[c];
      if (!cmp.render) {
        compileTemplate(cmp);
      }
    });
  }

  if (component.extends) {
    compileTemplate(component.extends);
  }

  if (component.extendOptions && !component.options.render) {
    compileTemplate(component.options);
  }
}

function compileTemplateForSlots (slots) {
  Object.keys(slots).forEach(function (key) {
    var slot = Array.isArray(slots[key]) ? slots[key] : [slots[key]];
    slot.forEach(function (slotValue) {
      if (componentNeedsCompiling(slotValue)) {
        compileTemplate(slotValue);
      }
    });
  });
}

// 

var MOUNTING_OPTIONS = [
  'attachToDocument',
  'mocks',
  'slots',
  'localVue',
  'stubs',
  'context',
  'clone',
  'attrs',
  'listeners',
  'propsData',
  'logModifiedComponents',
  'sync',
  'shouldProxy'
];

function extractInstanceOptions (
  options
) {
  var instanceOptions = Object.assign({}, options);
  MOUNTING_OPTIONS.forEach(function (mountingOption) {
    delete instanceOptions[mountingOption];
  });
  return instanceOptions
}

// 

function isValidSlot (slot) {
  return (
    isVueComponent(slot) ||
    typeof slot === 'string'
  )
}

function requiresTemplateCompiler (slot) {
  if (typeof slot === 'string' && !vueTemplateCompiler.compileToFunctions) {
    throwError(
      "vueTemplateCompiler is undefined, you must pass " +
      "precompiled components if vue-template-compiler is " +
      "undefined"
    );
  }
}

function validateSlots (slots) {
  Object.keys(slots).forEach(function (key) {
    var slot = Array.isArray(slots[key]) ? slots[key] : [slots[key]];

    slot.forEach(function (slotValue) {
      if (!isValidSlot(slotValue)) {
        throwError(
          "slots[key] must be a Component, string or an array " +
            "of Components"
        );
      }
      requiresTemplateCompiler(slotValue);
    });
  });
}

// 

function isDestructuringSlotScope (slotScope) {
  return slotScope[0] === '{' && slotScope[slotScope.length - 1] === '}'
}

function getVueTemplateCompilerHelpers (
  _Vue
) {
  // $FlowIgnore
  var vue = new _Vue();
  var helpers = {};
  var names = [
    '_c',
    '_o',
    '_n',
    '_s',
    '_l',
    '_t',
    '_q',
    '_i',
    '_m',
    '_f',
    '_k',
    '_b',
    '_v',
    '_e',
    '_u',
    '_g'
  ];
  names.forEach(function (name) {
    helpers[name] = vue._renderProxy[name];
  });
  helpers.$createElement = vue._renderProxy.$createElement;
  return helpers
}

function validateEnvironment () {
  if (VUE_VERSION < 2.1) {
    throwError("the scopedSlots option is only supported in vue@2.1+.");
  }
}

var slotScopeRe = /<[^>]+ slot-scope=\"(.+)\"/;

// Hide warning about <template> disallowed as root element
function customWarn (msg) {
  if (msg.indexOf('Cannot use <template> as component root element') === -1) {
    console.error(msg);
  }
}

function createScopedSlots (
  scopedSlotsOption,
  _Vue
) {
  var scopedSlots = {};
  if (!scopedSlotsOption) {
    return scopedSlots
  }
  validateEnvironment();
  var helpers = getVueTemplateCompilerHelpers(_Vue);
  var loop = function ( scopedSlotName ) {
    var slot = scopedSlotsOption[scopedSlotName];
    var isFn = typeof slot === 'function';
    // Type check to silence flow (can't use isFn)
    var renderFn = typeof slot === 'function'
      ? slot
      : vueTemplateCompiler.compileToFunctions(slot, { warn: customWarn }).render;

    var hasSlotScopeAttr = !isFn && slot.match(slotScopeRe);
    var slotScope = hasSlotScopeAttr && hasSlotScopeAttr[1];
    scopedSlots[scopedSlotName] = function (props) {
      var obj;

      var res;
      if (isFn) {
        res = renderFn.call(Object.assign({}, helpers), props);
      } else if (slotScope && !isDestructuringSlotScope(slotScope)) {
        res = renderFn.call(Object.assign({}, helpers, ( obj = {}, obj[slotScope] = props, obj)));
      } else if (slotScope && isDestructuringSlotScope(slotScope)) {
        res = renderFn.call(Object.assign({}, helpers, props));
      } else {
        res = renderFn.call(Object.assign({}, helpers, {props: props}));
      }
      // res is Array if <template> is a root element
      return Array.isArray(res) ? res[0] : res
    };
  };

  for (var scopedSlotName in scopedSlotsOption) loop( scopedSlotName );
  return scopedSlots
}

// 

function createFunctionalComponent (
  component,
  mountingOptions,
  _Vue
) {
  if (mountingOptions.context && typeof mountingOptions.context !== 'object') {
    throwError('mount.context must be an object');
  }
  if (mountingOptions.slots) {
    validateSlots(mountingOptions.slots);
  }

  var context =
    mountingOptions.context ||
    component.FunctionalRenderContext ||
    {};

  var listeners = mountingOptions.listeners;

  if (listeners) {
    Object.keys(listeners).forEach(function (key) {
      context.on[key] = listeners[key];
    });
  }

  context.scopedSlots = createScopedSlots(mountingOptions.scopedSlots, _Vue);

  return {
    render: function render (h) {
      return h(
        component,
        context,
        (mountingOptions.context &&
          mountingOptions.context.children &&
          mountingOptions.context.children.map(
            function (x) { return (typeof x === 'function' ? x(h) : x); }
          )) ||
          createSlotVNodes(this, mountingOptions.slots || {})
      )
    },
    name: component.name,
    _isFunctionalContainer: true
  }
}

// 

function isVueComponentStub (comp) {
  return comp && comp.template || isVueComponent(comp)
}

function isValidStub (stub) {
  return (
    typeof stub === 'boolean' ||
    (!!stub && typeof stub === 'string') ||
    isVueComponentStub(stub)
  )
}

function resolveComponent$1 (obj, component) {
  return obj[component] ||
    obj[hyphenate(component)] ||
    obj[camelize(component)] ||
    obj[capitalize(camelize(component))] ||
    obj[capitalize(component)] ||
    {}
}

function getCoreProperties (componentOptions) {
  return {
    attrs: componentOptions.attrs,
    name: componentOptions.name,
    on: componentOptions.on,
    key: componentOptions.key,
    ref: componentOptions.ref,
    props: componentOptions.props,
    domProps: componentOptions.domProps,
    class: componentOptions.class,
    staticClass: componentOptions.staticClass,
    staticStyle: componentOptions.staticStyle,
    style: componentOptions.style,
    normalizedStyle: componentOptions.normalizedStyle,
    nativeOn: componentOptions.nativeOn,
    functional: componentOptions.functional
  }
}

function createClassString (staticClass, dynamicClass) {
  if (staticClass && dynamicClass) {
    return staticClass + ' ' + dynamicClass
  }
  return staticClass || dynamicClass
}

function createStubFromComponent (
  originalComponent,
  name
) {
  var componentOptions =
    typeof originalComponent === 'function' && originalComponent.cid
      ? originalComponent.extendOptions
      : originalComponent;

  var tagName = (name || 'anonymous') + "-stub";

  // ignoreElements does not exist in Vue 2.0.x
  if (Vue.config.ignoredElements) {
    Vue.config.ignoredElements.push(tagName);
  }

  return Object.assign({}, getCoreProperties(componentOptions),
    {$_vueTestUtils_original: originalComponent,
    $_doNotStubChildren: true,
    render: function render (h, context) {
      return h(
        tagName,
        {
          attrs: componentOptions.functional ? Object.assign({}, context.props,
            context.data.attrs,
            {class: createClassString(
              context.data.staticClass,
              context.data.class
            )}) : Object.assign({}, this.$props)
        },
        context ? context.children : this.$options._renderChildren
      )
    }})
}

function createStubFromString (
  templateString,
  originalComponent,
  name
) {
  if ( originalComponent === void 0 ) originalComponent = {};

  if (templateContainsComponent(templateString, name)) {
    throwError('options.stub cannot contain a circular reference');
  }

  var componentOptions =
    typeof originalComponent === 'function' && originalComponent.cid
      ? originalComponent.extendOptions
      : originalComponent;

  return Object.assign({}, getCoreProperties(componentOptions),
    {$_doNotStubChildren: true},
    compileFromString(templateString))
}

function validateStub (stub) {
  if (!isValidStub(stub)) {
    throwError(
      "options.stub values must be passed a string or " +
      "component"
    );
  }
}

function createStubsFromStubsObject (
  originalComponents,
  stubs
) {
  if ( originalComponents === void 0 ) originalComponents = {};

  return Object.keys(stubs || {}).reduce(function (acc, stubName) {
    var stub = stubs[stubName];

    validateStub(stub);

    if (stub === false) {
      return acc
    }

    if (stub === true) {
      var component = resolveComponent$1(originalComponents, stubName);
      acc[stubName] = createStubFromComponent(component, stubName);
      return acc
    }

    if (typeof stub === 'string') {
      var component$1 = resolveComponent$1(originalComponents, stubName);
      acc[stubName] = createStubFromString(
        stub,
        component$1,
        stubName
      );
      return acc
    }

    if (componentNeedsCompiling(stub)) {
      compileTemplate(stub);
    }

    acc[stubName] = stub;

    return acc
  }, {})
}

var isWhitelisted = function (el, whitelist) { return resolveComponent(el, whitelist); };
var isAlreadyStubbed = function (el, stubs) { return stubs.has(el); };
var isDynamicComponent = function (cmp) { return typeof cmp === 'function' && !cmp.cid; };

function shouldExtend (component, _Vue) {
  return (
    (typeof component === 'function' && !isDynamicComponent(component)) ||
    (component && component.extends)
  )
}

function extend (component, _Vue) {
  var stub = _Vue.extend(component.options);
  stub.options.$_vueTestUtils_original = component;
  return stub
}

function createStubIfNeeded (shouldStub, component, _Vue, el) {
  if (shouldStub) {
    return createStubFromComponent(component || {}, el)
  }

  if (shouldExtend(component, _Vue)) {
    return extend(component, _Vue)
  }
}

function shouldNotBeStubbed (el, whitelist, modifiedComponents) {
  return (
    (typeof el === 'string' && isReservedTag(el)) ||
    isWhitelisted(el, whitelist) ||
    isAlreadyStubbed(el, modifiedComponents)
  )
}

function isConstructor (el) {
  return typeof el === 'function'
}

function isComponentOptions (el) {
  return typeof el === 'object' && (el.template || el.render)
}

function patchRender (_Vue, stubs, stubAllComponents) {
  var obj;

  // This mixin patches vm.$createElement so that we can stub all components
  // before they are rendered in shallow mode. We also need to ensure that
  // component constructors were created from the _Vue constructor. If not,
  // we must replace them with components created from the _Vue constructor
  // before calling the original $createElement. This ensures that components
  // have the correct instance properties and stubs when they are rendered.
  function patchRenderMixin () {
    var vm = this;

    if (
      vm.$options.$_doNotStubChildren ||
      vm.$options._isFunctionalContainer
    ) {
      return
    }

    var modifiedComponents = new Set();
    var originalCreateElement = vm.$createElement;
    var originalComponents = vm.$options.components;

    var createElement = function (el) {
      var obj;

      var args = [], len = arguments.length - 1;
      while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];
      if (shouldNotBeStubbed(el, stubs, modifiedComponents)) {
        return originalCreateElement.apply(void 0, [ el ].concat( args ))
      }

      if (isConstructor(el) || isComponentOptions(el)) {
        if (stubAllComponents) {
          var stub = createStubFromComponent(el, el.name || 'anonymous');
          return originalCreateElement.apply(void 0, [ stub ].concat( args ))
        }
        var Constructor = shouldExtend(el, _Vue) ? extend(el, _Vue) : el;

        return originalCreateElement.apply(void 0, [ Constructor ].concat( args ))
      }

      if (typeof el === 'string') {
        var original = resolveComponent(el, originalComponents);

        if (!original) {
          return originalCreateElement.apply(void 0, [ el ].concat( args ))
        }

        if (
          original.options &&
          original.options.$_vueTestUtils_original
        ) {
          original = original.options.$_vueTestUtils_original;
        }

        if (isDynamicComponent(original)) {
          return originalCreateElement.apply(void 0, [ el ].concat( args ))
        }

        var stub$1 = createStubIfNeeded(stubAllComponents, original, _Vue, el);

        if (stub$1) {
          Object.assign(vm.$options.components, ( obj = {}, obj[el] = stub$1, obj));
          modifiedComponents.add(el);
        }
      }

      return originalCreateElement.apply(void 0, [ el ].concat( args ))
    };

    vm[CREATE_ELEMENT_ALIAS] = createElement;
    vm.$createElement = createElement;
  }

  _Vue.mixin(( obj = {}, obj[BEFORE_RENDER_LIFECYCLE_HOOK] = patchRenderMixin, obj));
}

// 

function vueExtendUnsupportedOption (option) {
  return "options." + option + " is not supported for " +
  "components created with Vue.extend in Vue < 2.3. " +
  "You can set " + option + " to false to mount the component."
}

// these options aren't supported if Vue is version < 2.3
// for components using Vue.extend. This is due to a bug
// that means the mixins we use to add properties are not applied
// correctly
var UNSUPPORTED_VERSION_OPTIONS = [
  'mocks',
  'stubs',
  'localVue'
];

function createInstance (
  component,
  options,
  _Vue
) {
  // make sure all extends are based on this instance
  _Vue.options._base = _Vue;

  if (
    VUE_VERSION < 2.3 &&
    typeof component === 'function' &&
    component.options
  ) {
    UNSUPPORTED_VERSION_OPTIONS.forEach(function (option) {
      if (options[option]) {
        throwError(vueExtendUnsupportedOption(option));
      }
    });
  }

  // instance options are options that are passed to the
  // root instance when it's instantiated
  var instanceOptions = extractInstanceOptions(options);
  var stubComponentsObject = createStubsFromStubsObject(
    component.components,
    // $FlowIgnore
    options.stubs
  );

  addEventLogger(_Vue);
  addMocks(_Vue, options.mocks);
  addStubs(_Vue, stubComponentsObject);
  patchRender(_Vue, stubComponentsObject, options.shouldProxy);

  if (
    (component.options && component.options.functional) ||
    component.functional
  ) {
    component = createFunctionalComponent(component, options, _Vue);
  } else if (options.context) {
    throwError(
      "mount.context can only be used when mounting a " +
      "functional component"
    );
  }

  if (componentNeedsCompiling(component)) {
    compileTemplate(component);
  }

  if (component.options) {
    component.options._base = _Vue;
  }

  // extend component from _Vue to add properties and mixins
  // extend does not work correctly for sub class components in Vue < 2.2
  var Constructor = typeof component === 'function'
    ? _Vue.extend(component.options).extend(instanceOptions)
    : _Vue.extend(component).extend(instanceOptions);

  // used to identify extended component using constructor
  Constructor.options.$_vueTestUtils_original = component;

  if (options.slots) {
    compileTemplateForSlots(options.slots);
    // validate slots outside of the createSlots function so
    // that we can throw an error without it being caught by
    // the Vue error handler
    // $FlowIgnore
    validateSlots(options.slots);
  }

  // Objects are not resolved in extended components in Vue < 2.5
  // https://github.com/vuejs/vue/issues/6436
  if (
    options.provide &&
    typeof options.provide === 'object' &&
    VUE_VERSION < 2.5
  ) {
    var obj = Object.assign({}, options.provide);
    options.provide = function () { return obj; };
  }

  var scopedSlots = createScopedSlots(options.scopedSlots, _Vue);

  if (options.parentComponent && !isPlainObject(options.parentComponent)) {
    throwError(
      "options.parentComponent should be a valid Vue component " +
      "options object"
    );
  }

  var parentComponentOptions = options.parentComponent || {};
  parentComponentOptions.provide = options.provide;
  parentComponentOptions.$_doNotStubChildren = true;

  parentComponentOptions.render = function (h) {
    var slots = options.slots
      ? createSlotVNodes(this, options.slots)
      : undefined;
    return h(
      Constructor,
      {
        ref: 'vm',
        on: options.listeners,
        attrs: Object.assign({}, options.attrs,
          // pass as attrs so that inheritAttrs works correctly
          // propsData should take precedence over attrs
          options.propsData),
        scopedSlots: scopedSlots
      },
      slots
    )
  };
  var Parent = _Vue.extend(parentComponentOptions);

  return new Parent()
}

// 

function createElement () {
  if (document) {
    var elem = document.createElement('div');

    if (document.body) {
      document.body.appendChild(elem);
    }
    return elem
  }
}

// 

function errorHandler (
  errorOrString,
  vm
) {
  var error =
    typeof errorOrString === 'object'
      ? errorOrString
      : new Error(errorOrString);

  vm._error = error;

  throw error
}

function normalizeStubs (stubs) {
  if ( stubs === void 0 ) stubs = {};

  if (stubs === false) {
    return false
  }
  if (isPlainObject(stubs)) {
    return stubs
  }
  if (Array.isArray(stubs)) {
    return stubs.reduce(function (acc, stub) {
      if (typeof stub !== 'string') {
        throwError('each item in an options.stubs array must be a string');
      }
      acc[stub] = true;
      return acc
    }, {})
  }
  throwError('options.stubs must be an object or an Array');
}

// 

function getOption (option, config) {
  if (option === false) {
    return false
  }
  if (option || (config && Object.keys(config).length > 0)) {
    if (option instanceof Function) {
      return option
    }
    if (config instanceof Function) {
      throw new Error("Config can't be a Function.")
    }
    return Object.assign({}, config,
      option)
  }
}

function mergeOptions (options, config) {
  var mocks = (getOption(options.mocks, config.mocks));
  var methods = (
    (getOption(options.methods, config.methods)));
  var provide = ((getOption(options.provide, config.provide)));
  return Object.assign({}, options,
    {logModifiedComponents: config.logModifiedComponents,
    stubs: getOption(normalizeStubs(options.stubs), config.stubs),
    mocks: mocks,
    methods: methods,
    provide: provide,
    sync: !!(options.sync || options.sync === undefined)})
}

// 

function warnIfNoWindow () {
  if (typeof window === 'undefined') {
    throwError(
      "window is undefined, vue-test-utils needs to be " +
      "run in a browser environment. \n" +
      "You can run the tests in node using jsdom \n" +
      "See https://vue-test-utils.vuejs.org/guides/#browser-environment " +
      "for more details."
    );
  }
}

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
  this.size = 0;
}

var _listCacheClear = listCacheClear;

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

var eq_1 = eq;

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq_1(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

var _assocIndexOf = assocIndexOf;

/** Used for built-in method references. */
var arrayProto = Array.prototype;

/** Built-in value references. */
var splice = arrayProto.splice;

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = _assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  --this.size;
  return true;
}

var _listCacheDelete = listCacheDelete;

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = _assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

var _listCacheGet = listCacheGet;

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return _assocIndexOf(this.__data__, key) > -1;
}

var _listCacheHas = listCacheHas;

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = _assocIndexOf(data, key);

  if (index < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

var _listCacheSet = listCacheSet;

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var this$1 = this;

  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this$1.set(entry[0], entry[1]);
  }
}

// Add methods to `ListCache`.
ListCache.prototype.clear = _listCacheClear;
ListCache.prototype['delete'] = _listCacheDelete;
ListCache.prototype.get = _listCacheGet;
ListCache.prototype.has = _listCacheHas;
ListCache.prototype.set = _listCacheSet;

var _ListCache = ListCache;

/**
 * Removes all key-value entries from the stack.
 *
 * @private
 * @name clear
 * @memberOf Stack
 */
function stackClear() {
  this.__data__ = new _ListCache;
  this.size = 0;
}

var _stackClear = stackClear;

/**
 * Removes `key` and its value from the stack.
 *
 * @private
 * @name delete
 * @memberOf Stack
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function stackDelete(key) {
  var data = this.__data__,
      result = data['delete'](key);

  this.size = data.size;
  return result;
}

var _stackDelete = stackDelete;

/**
 * Gets the stack value for `key`.
 *
 * @private
 * @name get
 * @memberOf Stack
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function stackGet(key) {
  return this.__data__.get(key);
}

var _stackGet = stackGet;

/**
 * Checks if a stack value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Stack
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function stackHas(key) {
  return this.__data__.has(key);
}

var _stackHas = stackHas;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

var _freeGlobal = freeGlobal;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = _freeGlobal || freeSelf || Function('return this')();

var _root = root;

/** Built-in value references. */
var Symbol = _root.Symbol;

var _Symbol = Symbol;

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$1 = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Built-in value references. */
var symToStringTag = _Symbol ? _Symbol.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty$1.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}

var _getRawTag = getRawTag;

/** Used for built-in method references. */
var objectProto$1 = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString$1 = objectProto$1.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString$1.call(value);
}

var _objectToString = objectToString;

/** `Object#toString` result references. */
var nullTag = '[object Null]',
    undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag$1 = _Symbol ? _Symbol.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag$1 && symToStringTag$1 in Object(value))
    ? _getRawTag(value)
    : _objectToString(value);
}

var _baseGetTag = baseGetTag;

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

var isObject_1 = isObject;

/** `Object#toString` result references. */
var asyncTag = '[object AsyncFunction]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    proxyTag = '[object Proxy]';

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  if (!isObject_1(value)) {
    return false;
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  var tag = _baseGetTag(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}

var isFunction_1 = isFunction;

/** Used to detect overreaching core-js shims. */
var coreJsData = _root['__core-js_shared__'];

var _coreJsData = coreJsData;

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(_coreJsData && _coreJsData.keys && _coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

var _isMasked = isMasked;

/** Used for built-in method references. */
var funcProto = Function.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to convert.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

var _toSource = toSource;

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used for built-in method references. */
var funcProto$1 = Function.prototype,
    objectProto$2 = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString$1 = funcProto$1.toString;

/** Used to check objects for own properties. */
var hasOwnProperty$2 = objectProto$2.hasOwnProperty;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString$1.call(hasOwnProperty$2).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject_1(value) || _isMasked(value)) {
    return false;
  }
  var pattern = isFunction_1(value) ? reIsNative : reIsHostCtor;
  return pattern.test(_toSource(value));
}

var _baseIsNative = baseIsNative;

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

var _getValue = getValue;

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = _getValue(object, key);
  return _baseIsNative(value) ? value : undefined;
}

var _getNative = getNative;

/* Built-in method references that are verified to be native. */
var Map = _getNative(_root, 'Map');

var _Map = Map;

/* Built-in method references that are verified to be native. */
var nativeCreate = _getNative(Object, 'create');

var _nativeCreate = nativeCreate;

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = _nativeCreate ? _nativeCreate(null) : {};
  this.size = 0;
}

var _hashClear = hashClear;

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}

var _hashDelete = hashDelete;

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used for built-in method references. */
var objectProto$3 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$3 = objectProto$3.hasOwnProperty;

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (_nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty$3.call(data, key) ? data[key] : undefined;
}

var _hashGet = hashGet;

/** Used for built-in method references. */
var objectProto$4 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$4 = objectProto$4.hasOwnProperty;

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return _nativeCreate ? (data[key] !== undefined) : hasOwnProperty$4.call(data, key);
}

var _hashHas = hashHas;

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED$1 = '__lodash_hash_undefined__';

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = (_nativeCreate && value === undefined) ? HASH_UNDEFINED$1 : value;
  return this;
}

var _hashSet = hashSet;

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var this$1 = this;

  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this$1.set(entry[0], entry[1]);
  }
}

// Add methods to `Hash`.
Hash.prototype.clear = _hashClear;
Hash.prototype['delete'] = _hashDelete;
Hash.prototype.get = _hashGet;
Hash.prototype.has = _hashHas;
Hash.prototype.set = _hashSet;

var _Hash = Hash;

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.size = 0;
  this.__data__ = {
    'hash': new _Hash,
    'map': new (_Map || _ListCache),
    'string': new _Hash
  };
}

var _mapCacheClear = mapCacheClear;

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

var _isKeyable = isKeyable;

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return _isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

var _getMapData = getMapData;

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  var result = _getMapData(this, key)['delete'](key);
  this.size -= result ? 1 : 0;
  return result;
}

var _mapCacheDelete = mapCacheDelete;

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return _getMapData(this, key).get(key);
}

var _mapCacheGet = mapCacheGet;

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return _getMapData(this, key).has(key);
}

var _mapCacheHas = mapCacheHas;

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  var data = _getMapData(this, key),
      size = data.size;

  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}

var _mapCacheSet = mapCacheSet;

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var this$1 = this;

  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this$1.set(entry[0], entry[1]);
  }
}

// Add methods to `MapCache`.
MapCache.prototype.clear = _mapCacheClear;
MapCache.prototype['delete'] = _mapCacheDelete;
MapCache.prototype.get = _mapCacheGet;
MapCache.prototype.has = _mapCacheHas;
MapCache.prototype.set = _mapCacheSet;

var _MapCache = MapCache;

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/**
 * Sets the stack `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Stack
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the stack cache instance.
 */
function stackSet(key, value) {
  var data = this.__data__;
  if (data instanceof _ListCache) {
    var pairs = data.__data__;
    if (!_Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
      pairs.push([key, value]);
      this.size = ++data.size;
      return this;
    }
    data = this.__data__ = new _MapCache(pairs);
  }
  data.set(key, value);
  this.size = data.size;
  return this;
}

var _stackSet = stackSet;

/**
 * Creates a stack cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Stack(entries) {
  var data = this.__data__ = new _ListCache(entries);
  this.size = data.size;
}

// Add methods to `Stack`.
Stack.prototype.clear = _stackClear;
Stack.prototype['delete'] = _stackDelete;
Stack.prototype.get = _stackGet;
Stack.prototype.has = _stackHas;
Stack.prototype.set = _stackSet;

var _Stack = Stack;

/**
 * A specialized version of `_.forEach` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns `array`.
 */
function arrayEach(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
}

var _arrayEach = arrayEach;

var defineProperty = (function() {
  try {
    var func = _getNative(Object, 'defineProperty');
    func({}, '', {});
    return func;
  } catch (e) {}
}());

var _defineProperty = defineProperty;

/**
 * The base implementation of `assignValue` and `assignMergeValue` without
 * value checks.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function baseAssignValue(object, key, value) {
  if (key == '__proto__' && _defineProperty) {
    _defineProperty(object, key, {
      'configurable': true,
      'enumerable': true,
      'value': value,
      'writable': true
    });
  } else {
    object[key] = value;
  }
}

var _baseAssignValue = baseAssignValue;

/** Used for built-in method references. */
var objectProto$5 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$5 = objectProto$5.hasOwnProperty;

/**
 * Assigns `value` to `key` of `object` if the existing value is not equivalent
 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function assignValue(object, key, value) {
  var objValue = object[key];
  if (!(hasOwnProperty$5.call(object, key) && eq_1(objValue, value)) ||
      (value === undefined && !(key in object))) {
    _baseAssignValue(object, key, value);
  }
}

var _assignValue = assignValue;

/**
 * Copies properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy properties from.
 * @param {Array} props The property identifiers to copy.
 * @param {Object} [object={}] The object to copy properties to.
 * @param {Function} [customizer] The function to customize copied values.
 * @returns {Object} Returns `object`.
 */
function copyObject(source, props, object, customizer) {
  var isNew = !object;
  object || (object = {});

  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index];

    var newValue = customizer
      ? customizer(object[key], source[key], key, object, source)
      : undefined;

    if (newValue === undefined) {
      newValue = source[key];
    }
    if (isNew) {
      _baseAssignValue(object, key, newValue);
    } else {
      _assignValue(object, key, newValue);
    }
  }
  return object;
}

var _copyObject = copyObject;

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

var _baseTimes = baseTimes;

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

var isObjectLike_1 = isObjectLike;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]';

/**
 * The base implementation of `_.isArguments`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 */
function baseIsArguments(value) {
  return isObjectLike_1(value) && _baseGetTag(value) == argsTag;
}

var _baseIsArguments = baseIsArguments;

/** Used for built-in method references. */
var objectProto$6 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$6 = objectProto$6.hasOwnProperty;

/** Built-in value references. */
var propertyIsEnumerable = objectProto$6.propertyIsEnumerable;

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
var isArguments = _baseIsArguments(function() { return arguments; }()) ? _baseIsArguments : function(value) {
  return isObjectLike_1(value) && hasOwnProperty$6.call(value, 'callee') &&
    !propertyIsEnumerable.call(value, 'callee');
};

var isArguments_1 = isArguments;

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

var isArray_1 = isArray;

/**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */
function stubFalse() {
  return false;
}

var stubFalse_1 = stubFalse;

var isBuffer_1 = createCommonjsModule(function (module, exports) {
/** Detect free variable `exports`. */
var freeExports = 'object' == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Built-in value references. */
var Buffer = moduleExports ? _root.Buffer : undefined;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

/**
 * Checks if `value` is a buffer.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * _.isBuffer(new Buffer(2));
 * // => true
 *
 * _.isBuffer(new Uint8Array(2));
 * // => false
 */
var isBuffer = nativeIsBuffer || stubFalse_1;

module.exports = isBuffer;
});

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length &&
    (typeof value == 'number' || reIsUint.test(value)) &&
    (value > -1 && value % 1 == 0 && value < length);
}

var _isIndex = isIndex;

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER$1 = 9007199254740991;

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER$1;
}

var isLength_1 = isLength;

/** `Object#toString` result references. */
var argsTag$1 = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag$1 = '[object Function]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag$1] = typedArrayTags[arrayTag] =
typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
typedArrayTags[errorTag] = typedArrayTags[funcTag$1] =
typedArrayTags[mapTag] = typedArrayTags[numberTag] =
typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
typedArrayTags[setTag] = typedArrayTags[stringTag] =
typedArrayTags[weakMapTag] = false;

/**
 * The base implementation of `_.isTypedArray` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 */
function baseIsTypedArray(value) {
  return isObjectLike_1(value) &&
    isLength_1(value.length) && !!typedArrayTags[_baseGetTag(value)];
}

var _baseIsTypedArray = baseIsTypedArray;

/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}

var _baseUnary = baseUnary;

var _nodeUtil = createCommonjsModule(function (module, exports) {
/** Detect free variable `exports`. */
var freeExports = 'object' == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Detect free variable `process` from Node.js. */
var freeProcess = moduleExports && _freeGlobal.process;

/** Used to access faster Node.js helpers. */
var nodeUtil = (function() {
  try {
    return freeProcess && freeProcess.binding && freeProcess.binding('util');
  } catch (e) {}
}());

module.exports = nodeUtil;
});

/* Node.js helper references. */
var nodeIsTypedArray = _nodeUtil && _nodeUtil.isTypedArray;

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
var isTypedArray = nodeIsTypedArray ? _baseUnary(nodeIsTypedArray) : _baseIsTypedArray;

var isTypedArray_1 = isTypedArray;

/** Used for built-in method references. */
var objectProto$7 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$7 = objectProto$7.hasOwnProperty;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  var isArr = isArray_1(value),
      isArg = !isArr && isArguments_1(value),
      isBuff = !isArr && !isArg && isBuffer_1(value),
      isType = !isArr && !isArg && !isBuff && isTypedArray_1(value),
      skipIndexes = isArr || isArg || isBuff || isType,
      result = skipIndexes ? _baseTimes(value.length, String) : [],
      length = result.length;

  for (var key in value) {
    if ((inherited || hasOwnProperty$7.call(value, key)) &&
        !(skipIndexes && (
           // Safari 9 has enumerable `arguments.length` in strict mode.
           key == 'length' ||
           // Node.js 0.10 has enumerable non-index properties on buffers.
           (isBuff && (key == 'offset' || key == 'parent')) ||
           // PhantomJS 2 has enumerable non-index properties on typed arrays.
           (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
           // Skip index properties.
           _isIndex(key, length)
        ))) {
      result.push(key);
    }
  }
  return result;
}

var _arrayLikeKeys = arrayLikeKeys;

/** Used for built-in method references. */
var objectProto$8 = Object.prototype;

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto$8;

  return value === proto;
}

var _isPrototype = isPrototype;

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

var _overArg = overArg;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeKeys = _overArg(Object.keys, Object);

var _nativeKeys = nativeKeys;

/** Used for built-in method references. */
var objectProto$9 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$8 = objectProto$9.hasOwnProperty;

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  if (!_isPrototype(object)) {
    return _nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty$8.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

var _baseKeys = baseKeys;

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength_1(value.length) && !isFunction_1(value);
}

var isArrayLike_1 = isArrayLike;

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  return isArrayLike_1(object) ? _arrayLikeKeys(object) : _baseKeys(object);
}

var keys_1 = keys;

/**
 * The base implementation of `_.assign` without support for multiple sources
 * or `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @returns {Object} Returns `object`.
 */
function baseAssign(object, source) {
  return object && _copyObject(source, keys_1(source), object);
}

var _baseAssign = baseAssign;

/**
 * This function is like
 * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * except that it includes inherited enumerable properties.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function nativeKeysIn(object) {
  var result = [];
  if (object != null) {
    for (var key in Object(object)) {
      result.push(key);
    }
  }
  return result;
}

var _nativeKeysIn = nativeKeysIn;

/** Used for built-in method references. */
var objectProto$10 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$9 = objectProto$10.hasOwnProperty;

/**
 * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeysIn(object) {
  if (!isObject_1(object)) {
    return _nativeKeysIn(object);
  }
  var isProto = _isPrototype(object),
      result = [];

  for (var key in object) {
    if (!(key == 'constructor' && (isProto || !hasOwnProperty$9.call(object, key)))) {
      result.push(key);
    }
  }
  return result;
}

var _baseKeysIn = baseKeysIn;

/**
 * Creates an array of the own and inherited enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keysIn(new Foo);
 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
 */
function keysIn$1(object) {
  return isArrayLike_1(object) ? _arrayLikeKeys(object, true) : _baseKeysIn(object);
}

var keysIn_1 = keysIn$1;

/**
 * The base implementation of `_.assignIn` without support for multiple sources
 * or `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @returns {Object} Returns `object`.
 */
function baseAssignIn(object, source) {
  return object && _copyObject(source, keysIn_1(source), object);
}

var _baseAssignIn = baseAssignIn;

var _cloneBuffer = createCommonjsModule(function (module, exports) {
/** Detect free variable `exports`. */
var freeExports = 'object' == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Built-in value references. */
var Buffer = moduleExports ? _root.Buffer : undefined,
    allocUnsafe = Buffer ? Buffer.allocUnsafe : undefined;

/**
 * Creates a clone of  `buffer`.
 *
 * @private
 * @param {Buffer} buffer The buffer to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Buffer} Returns the cloned buffer.
 */
function cloneBuffer(buffer, isDeep) {
  if (isDeep) {
    return buffer.slice();
  }
  var length = buffer.length,
      result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);

  buffer.copy(result);
  return result;
}

module.exports = cloneBuffer;
});

/**
 * Copies the values of `source` to `array`.
 *
 * @private
 * @param {Array} source The array to copy values from.
 * @param {Array} [array=[]] The array to copy values to.
 * @returns {Array} Returns `array`.
 */
function copyArray(source, array) {
  var index = -1,
      length = source.length;

  array || (array = Array(length));
  while (++index < length) {
    array[index] = source[index];
  }
  return array;
}

var _copyArray = copyArray;

/**
 * A specialized version of `_.filter` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {Array} Returns the new filtered array.
 */
function arrayFilter(array, predicate) {
  var index = -1,
      length = array == null ? 0 : array.length,
      resIndex = 0,
      result = [];

  while (++index < length) {
    var value = array[index];
    if (predicate(value, index, array)) {
      result[resIndex++] = value;
    }
  }
  return result;
}

var _arrayFilter = arrayFilter;

/**
 * This method returns a new empty array.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {Array} Returns the new empty array.
 * @example
 *
 * var arrays = _.times(2, _.stubArray);
 *
 * console.log(arrays);
 * // => [[], []]
 *
 * console.log(arrays[0] === arrays[1]);
 * // => false
 */
function stubArray() {
  return [];
}

var stubArray_1 = stubArray;

/** Used for built-in method references. */
var objectProto$11 = Object.prototype;

/** Built-in value references. */
var propertyIsEnumerable$1 = objectProto$11.propertyIsEnumerable;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetSymbols = Object.getOwnPropertySymbols;

/**
 * Creates an array of the own enumerable symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbols = !nativeGetSymbols ? stubArray_1 : function(object) {
  if (object == null) {
    return [];
  }
  object = Object(object);
  return _arrayFilter(nativeGetSymbols(object), function(symbol) {
    return propertyIsEnumerable$1.call(object, symbol);
  });
};

var _getSymbols = getSymbols;

/**
 * Copies own symbols of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy symbols from.
 * @param {Object} [object={}] The object to copy symbols to.
 * @returns {Object} Returns `object`.
 */
function copySymbols(source, object) {
  return _copyObject(source, _getSymbols(source), object);
}

var _copySymbols = copySymbols;

/**
 * Appends the elements of `values` to `array`.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {Array} values The values to append.
 * @returns {Array} Returns `array`.
 */
function arrayPush(array, values) {
  var index = -1,
      length = values.length,
      offset = array.length;

  while (++index < length) {
    array[offset + index] = values[index];
  }
  return array;
}

var _arrayPush = arrayPush;

/** Built-in value references. */
var getPrototype = _overArg(Object.getPrototypeOf, Object);

var _getPrototype = getPrototype;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetSymbols$1 = Object.getOwnPropertySymbols;

/**
 * Creates an array of the own and inherited enumerable symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbolsIn = !nativeGetSymbols$1 ? stubArray_1 : function(object) {
  var result = [];
  while (object) {
    _arrayPush(result, _getSymbols(object));
    object = _getPrototype(object);
  }
  return result;
};

var _getSymbolsIn = getSymbolsIn;

/**
 * Copies own and inherited symbols of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy symbols from.
 * @param {Object} [object={}] The object to copy symbols to.
 * @returns {Object} Returns `object`.
 */
function copySymbolsIn(source, object) {
  return _copyObject(source, _getSymbolsIn(source), object);
}

var _copySymbolsIn = copySymbolsIn;

/**
 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @param {Function} symbolsFunc The function to get the symbols of `object`.
 * @returns {Array} Returns the array of property names and symbols.
 */
function baseGetAllKeys(object, keysFunc, symbolsFunc) {
  var result = keysFunc(object);
  return isArray_1(object) ? result : _arrayPush(result, symbolsFunc(object));
}

var _baseGetAllKeys = baseGetAllKeys;

/**
 * Creates an array of own enumerable property names and symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeys(object) {
  return _baseGetAllKeys(object, keys_1, _getSymbols);
}

var _getAllKeys = getAllKeys;

/**
 * Creates an array of own and inherited enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeysIn(object) {
  return _baseGetAllKeys(object, keysIn_1, _getSymbolsIn);
}

var _getAllKeysIn = getAllKeysIn;

/* Built-in method references that are verified to be native. */
var DataView = _getNative(_root, 'DataView');

var _DataView = DataView;

/* Built-in method references that are verified to be native. */
var Promise = _getNative(_root, 'Promise');

var _Promise = Promise;

/* Built-in method references that are verified to be native. */
var Set$1 = _getNative(_root, 'Set');

var _Set = Set$1;

/* Built-in method references that are verified to be native. */
var WeakMap = _getNative(_root, 'WeakMap');

var _WeakMap = WeakMap;

/** `Object#toString` result references. */
var mapTag$1 = '[object Map]',
    objectTag$1 = '[object Object]',
    promiseTag = '[object Promise]',
    setTag$1 = '[object Set]',
    weakMapTag$1 = '[object WeakMap]';

var dataViewTag$1 = '[object DataView]';

/** Used to detect maps, sets, and weakmaps. */
var dataViewCtorString = _toSource(_DataView),
    mapCtorString = _toSource(_Map),
    promiseCtorString = _toSource(_Promise),
    setCtorString = _toSource(_Set),
    weakMapCtorString = _toSource(_WeakMap);

/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
var getTag = _baseGetTag;

// Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
if ((_DataView && getTag(new _DataView(new ArrayBuffer(1))) != dataViewTag$1) ||
    (_Map && getTag(new _Map) != mapTag$1) ||
    (_Promise && getTag(_Promise.resolve()) != promiseTag) ||
    (_Set && getTag(new _Set) != setTag$1) ||
    (_WeakMap && getTag(new _WeakMap) != weakMapTag$1)) {
  getTag = function(value) {
    var result = _baseGetTag(value),
        Ctor = result == objectTag$1 ? value.constructor : undefined,
        ctorString = Ctor ? _toSource(Ctor) : '';

    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString: return dataViewTag$1;
        case mapCtorString: return mapTag$1;
        case promiseCtorString: return promiseTag;
        case setCtorString: return setTag$1;
        case weakMapCtorString: return weakMapTag$1;
      }
    }
    return result;
  };
}

var _getTag = getTag;

/** Used for built-in method references. */
var objectProto$12 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$10 = objectProto$12.hasOwnProperty;

/**
 * Initializes an array clone.
 *
 * @private
 * @param {Array} array The array to clone.
 * @returns {Array} Returns the initialized clone.
 */
function initCloneArray(array) {
  var length = array.length,
      result = array.constructor(length);

  // Add properties assigned by `RegExp#exec`.
  if (length && typeof array[0] == 'string' && hasOwnProperty$10.call(array, 'index')) {
    result.index = array.index;
    result.input = array.input;
  }
  return result;
}

var _initCloneArray = initCloneArray;

/** Built-in value references. */
var Uint8Array = _root.Uint8Array;

var _Uint8Array = Uint8Array;

/**
 * Creates a clone of `arrayBuffer`.
 *
 * @private
 * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
 * @returns {ArrayBuffer} Returns the cloned array buffer.
 */
function cloneArrayBuffer(arrayBuffer) {
  var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
  new _Uint8Array(result).set(new _Uint8Array(arrayBuffer));
  return result;
}

var _cloneArrayBuffer = cloneArrayBuffer;

/**
 * Creates a clone of `dataView`.
 *
 * @private
 * @param {Object} dataView The data view to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned data view.
 */
function cloneDataView(dataView, isDeep) {
  var buffer = isDeep ? _cloneArrayBuffer(dataView.buffer) : dataView.buffer;
  return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
}

var _cloneDataView = cloneDataView;

/**
 * Adds the key-value `pair` to `map`.
 *
 * @private
 * @param {Object} map The map to modify.
 * @param {Array} pair The key-value pair to add.
 * @returns {Object} Returns `map`.
 */
function addMapEntry(map, pair) {
  // Don't return `map.set` because it's not chainable in IE 11.
  map.set(pair[0], pair[1]);
  return map;
}

var _addMapEntry = addMapEntry;

/**
 * A specialized version of `_.reduce` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {*} [accumulator] The initial value.
 * @param {boolean} [initAccum] Specify using the first element of `array` as
 *  the initial value.
 * @returns {*} Returns the accumulated value.
 */
function arrayReduce(array, iteratee, accumulator, initAccum) {
  var index = -1,
      length = array == null ? 0 : array.length;

  if (initAccum && length) {
    accumulator = array[++index];
  }
  while (++index < length) {
    accumulator = iteratee(accumulator, array[index], index, array);
  }
  return accumulator;
}

var _arrayReduce = arrayReduce;

/**
 * Converts `map` to its key-value pairs.
 *
 * @private
 * @param {Object} map The map to convert.
 * @returns {Array} Returns the key-value pairs.
 */
function mapToArray(map) {
  var index = -1,
      result = Array(map.size);

  map.forEach(function(value, key) {
    result[++index] = [key, value];
  });
  return result;
}

var _mapToArray = mapToArray;

/** Used to compose bitmasks for cloning. */
var CLONE_DEEP_FLAG = 1;

/**
 * Creates a clone of `map`.
 *
 * @private
 * @param {Object} map The map to clone.
 * @param {Function} cloneFunc The function to clone values.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned map.
 */
function cloneMap(map, isDeep, cloneFunc) {
  var array = isDeep ? cloneFunc(_mapToArray(map), CLONE_DEEP_FLAG) : _mapToArray(map);
  return _arrayReduce(array, _addMapEntry, new map.constructor);
}

var _cloneMap = cloneMap;

/** Used to match `RegExp` flags from their coerced string values. */
var reFlags = /\w*$/;

/**
 * Creates a clone of `regexp`.
 *
 * @private
 * @param {Object} regexp The regexp to clone.
 * @returns {Object} Returns the cloned regexp.
 */
function cloneRegExp(regexp) {
  var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
  result.lastIndex = regexp.lastIndex;
  return result;
}

var _cloneRegExp = cloneRegExp;

/**
 * Adds `value` to `set`.
 *
 * @private
 * @param {Object} set The set to modify.
 * @param {*} value The value to add.
 * @returns {Object} Returns `set`.
 */
function addSetEntry(set, value) {
  // Don't return `set.add` because it's not chainable in IE 11.
  set.add(value);
  return set;
}

var _addSetEntry = addSetEntry;

/**
 * Converts `set` to an array of its values.
 *
 * @private
 * @param {Object} set The set to convert.
 * @returns {Array} Returns the values.
 */
function setToArray(set) {
  var index = -1,
      result = Array(set.size);

  set.forEach(function(value) {
    result[++index] = value;
  });
  return result;
}

var _setToArray = setToArray;

/** Used to compose bitmasks for cloning. */
var CLONE_DEEP_FLAG$1 = 1;

/**
 * Creates a clone of `set`.
 *
 * @private
 * @param {Object} set The set to clone.
 * @param {Function} cloneFunc The function to clone values.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned set.
 */
function cloneSet(set, isDeep, cloneFunc) {
  var array = isDeep ? cloneFunc(_setToArray(set), CLONE_DEEP_FLAG$1) : _setToArray(set);
  return _arrayReduce(array, _addSetEntry, new set.constructor);
}

var _cloneSet = cloneSet;

/** Used to convert symbols to primitives and strings. */
var symbolProto = _Symbol ? _Symbol.prototype : undefined,
    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

/**
 * Creates a clone of the `symbol` object.
 *
 * @private
 * @param {Object} symbol The symbol object to clone.
 * @returns {Object} Returns the cloned symbol object.
 */
function cloneSymbol(symbol) {
  return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
}

var _cloneSymbol = cloneSymbol;

/**
 * Creates a clone of `typedArray`.
 *
 * @private
 * @param {Object} typedArray The typed array to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned typed array.
 */
function cloneTypedArray(typedArray, isDeep) {
  var buffer = isDeep ? _cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
  return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
}

var _cloneTypedArray = cloneTypedArray;

/** `Object#toString` result references. */
var boolTag$1 = '[object Boolean]',
    dateTag$1 = '[object Date]',
    mapTag$2 = '[object Map]',
    numberTag$1 = '[object Number]',
    regexpTag$1 = '[object RegExp]',
    setTag$2 = '[object Set]',
    stringTag$1 = '[object String]',
    symbolTag = '[object Symbol]';

var arrayBufferTag$1 = '[object ArrayBuffer]',
    dataViewTag$2 = '[object DataView]',
    float32Tag$1 = '[object Float32Array]',
    float64Tag$1 = '[object Float64Array]',
    int8Tag$1 = '[object Int8Array]',
    int16Tag$1 = '[object Int16Array]',
    int32Tag$1 = '[object Int32Array]',
    uint8Tag$1 = '[object Uint8Array]',
    uint8ClampedTag$1 = '[object Uint8ClampedArray]',
    uint16Tag$1 = '[object Uint16Array]',
    uint32Tag$1 = '[object Uint32Array]';

/**
 * Initializes an object clone based on its `toStringTag`.
 *
 * **Note:** This function only supports cloning values with tags of
 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
 *
 * @private
 * @param {Object} object The object to clone.
 * @param {string} tag The `toStringTag` of the object to clone.
 * @param {Function} cloneFunc The function to clone values.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneByTag(object, tag, cloneFunc, isDeep) {
  var Ctor = object.constructor;
  switch (tag) {
    case arrayBufferTag$1:
      return _cloneArrayBuffer(object);

    case boolTag$1:
    case dateTag$1:
      return new Ctor(+object);

    case dataViewTag$2:
      return _cloneDataView(object, isDeep);

    case float32Tag$1: case float64Tag$1:
    case int8Tag$1: case int16Tag$1: case int32Tag$1:
    case uint8Tag$1: case uint8ClampedTag$1: case uint16Tag$1: case uint32Tag$1:
      return _cloneTypedArray(object, isDeep);

    case mapTag$2:
      return _cloneMap(object, isDeep, cloneFunc);

    case numberTag$1:
    case stringTag$1:
      return new Ctor(object);

    case regexpTag$1:
      return _cloneRegExp(object);

    case setTag$2:
      return _cloneSet(object, isDeep, cloneFunc);

    case symbolTag:
      return _cloneSymbol(object);
  }
}

var _initCloneByTag = initCloneByTag;

/** Built-in value references. */
var objectCreate = Object.create;

/**
 * The base implementation of `_.create` without support for assigning
 * properties to the created object.
 *
 * @private
 * @param {Object} proto The object to inherit from.
 * @returns {Object} Returns the new object.
 */
var baseCreate = (function() {
  function object() {}
  return function(proto) {
    if (!isObject_1(proto)) {
      return {};
    }
    if (objectCreate) {
      return objectCreate(proto);
    }
    object.prototype = proto;
    var result = new object;
    object.prototype = undefined;
    return result;
  };
}());

var _baseCreate = baseCreate;

/**
 * Initializes an object clone.
 *
 * @private
 * @param {Object} object The object to clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneObject(object) {
  return (typeof object.constructor == 'function' && !_isPrototype(object))
    ? _baseCreate(_getPrototype(object))
    : {};
}

var _initCloneObject = initCloneObject;

/** Used to compose bitmasks for cloning. */
var CLONE_DEEP_FLAG$2 = 1,
    CLONE_FLAT_FLAG = 2,
    CLONE_SYMBOLS_FLAG = 4;

/** `Object#toString` result references. */
var argsTag$2 = '[object Arguments]',
    arrayTag$1 = '[object Array]',
    boolTag$2 = '[object Boolean]',
    dateTag$2 = '[object Date]',
    errorTag$1 = '[object Error]',
    funcTag$2 = '[object Function]',
    genTag$1 = '[object GeneratorFunction]',
    mapTag$3 = '[object Map]',
    numberTag$2 = '[object Number]',
    objectTag$2 = '[object Object]',
    regexpTag$2 = '[object RegExp]',
    setTag$3 = '[object Set]',
    stringTag$2 = '[object String]',
    symbolTag$1 = '[object Symbol]',
    weakMapTag$2 = '[object WeakMap]';

var arrayBufferTag$2 = '[object ArrayBuffer]',
    dataViewTag$3 = '[object DataView]',
    float32Tag$2 = '[object Float32Array]',
    float64Tag$2 = '[object Float64Array]',
    int8Tag$2 = '[object Int8Array]',
    int16Tag$2 = '[object Int16Array]',
    int32Tag$2 = '[object Int32Array]',
    uint8Tag$2 = '[object Uint8Array]',
    uint8ClampedTag$2 = '[object Uint8ClampedArray]',
    uint16Tag$2 = '[object Uint16Array]',
    uint32Tag$2 = '[object Uint32Array]';

/** Used to identify `toStringTag` values supported by `_.clone`. */
var cloneableTags = {};
cloneableTags[argsTag$2] = cloneableTags[arrayTag$1] =
cloneableTags[arrayBufferTag$2] = cloneableTags[dataViewTag$3] =
cloneableTags[boolTag$2] = cloneableTags[dateTag$2] =
cloneableTags[float32Tag$2] = cloneableTags[float64Tag$2] =
cloneableTags[int8Tag$2] = cloneableTags[int16Tag$2] =
cloneableTags[int32Tag$2] = cloneableTags[mapTag$3] =
cloneableTags[numberTag$2] = cloneableTags[objectTag$2] =
cloneableTags[regexpTag$2] = cloneableTags[setTag$3] =
cloneableTags[stringTag$2] = cloneableTags[symbolTag$1] =
cloneableTags[uint8Tag$2] = cloneableTags[uint8ClampedTag$2] =
cloneableTags[uint16Tag$2] = cloneableTags[uint32Tag$2] = true;
cloneableTags[errorTag$1] = cloneableTags[funcTag$2] =
cloneableTags[weakMapTag$2] = false;

/**
 * The base implementation of `_.clone` and `_.cloneDeep` which tracks
 * traversed objects.
 *
 * @private
 * @param {*} value The value to clone.
 * @param {boolean} bitmask The bitmask flags.
 *  1 - Deep clone
 *  2 - Flatten inherited properties
 *  4 - Clone symbols
 * @param {Function} [customizer] The function to customize cloning.
 * @param {string} [key] The key of `value`.
 * @param {Object} [object] The parent object of `value`.
 * @param {Object} [stack] Tracks traversed objects and their clone counterparts.
 * @returns {*} Returns the cloned value.
 */
function baseClone(value, bitmask, customizer, key, object, stack) {
  var result,
      isDeep = bitmask & CLONE_DEEP_FLAG$2,
      isFlat = bitmask & CLONE_FLAT_FLAG,
      isFull = bitmask & CLONE_SYMBOLS_FLAG;

  if (customizer) {
    result = object ? customizer(value, key, object, stack) : customizer(value);
  }
  if (result !== undefined) {
    return result;
  }
  if (!isObject_1(value)) {
    return value;
  }
  var isArr = isArray_1(value);
  if (isArr) {
    result = _initCloneArray(value);
    if (!isDeep) {
      return _copyArray(value, result);
    }
  } else {
    var tag = _getTag(value),
        isFunc = tag == funcTag$2 || tag == genTag$1;

    if (isBuffer_1(value)) {
      return _cloneBuffer(value, isDeep);
    }
    if (tag == objectTag$2 || tag == argsTag$2 || (isFunc && !object)) {
      result = (isFlat || isFunc) ? {} : _initCloneObject(value);
      if (!isDeep) {
        return isFlat
          ? _copySymbolsIn(value, _baseAssignIn(result, value))
          : _copySymbols(value, _baseAssign(result, value));
      }
    } else {
      if (!cloneableTags[tag]) {
        return object ? value : {};
      }
      result = _initCloneByTag(value, tag, baseClone, isDeep);
    }
  }
  // Check for circular references and return its corresponding clone.
  stack || (stack = new _Stack);
  var stacked = stack.get(value);
  if (stacked) {
    return stacked;
  }
  stack.set(value, result);

  var keysFunc = isFull
    ? (isFlat ? _getAllKeysIn : _getAllKeys)
    : (isFlat ? keysIn : keys_1);

  var props = isArr ? undefined : keysFunc(value);
  _arrayEach(props || value, function(subValue, key) {
    if (props) {
      key = subValue;
      subValue = value[key];
    }
    // Recursively populate clone (susceptible to call stack limits).
    _assignValue(result, key, baseClone(subValue, bitmask, customizer, key, value, stack));
  });
  return result;
}

var _baseClone = baseClone;

/** Used to compose bitmasks for cloning. */
var CLONE_DEEP_FLAG$3 = 1,
    CLONE_SYMBOLS_FLAG$1 = 4;

/**
 * This method is like `_.clone` except that it recursively clones `value`.
 *
 * @static
 * @memberOf _
 * @since 1.0.0
 * @category Lang
 * @param {*} value The value to recursively clone.
 * @returns {*} Returns the deep cloned value.
 * @see _.clone
 * @example
 *
 * var objects = [{ 'a': 1 }, { 'b': 2 }];
 *
 * var deep = _.cloneDeep(objects);
 * console.log(deep[0] === objects[0]);
 * // => false
 */
function cloneDeep(value) {
  return _baseClone(value, CLONE_DEEP_FLAG$3 | CLONE_SYMBOLS_FLAG$1);
}

var cloneDeep_1 = cloneDeep;

// 

function createLocalVue (_Vue) {
  if ( _Vue === void 0 ) _Vue = Vue;

  var instance = _Vue.extend();

  // clone global APIs
  Object.keys(_Vue).forEach(function (key) {
    if (!instance.hasOwnProperty(key)) {
      var original = _Vue[key];
      // cloneDeep can fail when cloning Vue instances
      // cloneDeep checks that the instance has a Symbol
      // which errors in Vue < 2.17 (https://github.com/vuejs/vue/pull/7878)
      try {
        instance[key] = typeof original === 'object'
          ? cloneDeep_1(original)
          : original;
      } catch (e) {
        instance[key] = original;
      }
    }
  });

  // config is not enumerable
  instance.config = cloneDeep_1(Vue.config);

  instance.config.errorHandler = errorHandler;

  // option merge strategies need to be exposed by reference
  // so that merge strats registered by plugins can work properly
  instance.config.optionMergeStrategies = Vue.config.optionMergeStrategies;

  // make sure all extends are based on this instance.
  // this is important so that global components registered by plugins,
  // e.g. router-link are created using the correct base constructor
  instance.options._base = instance;

  // compat for vue-router < 2.7.1 where it does not allow multiple installs
  if (instance._installedPlugins && instance._installedPlugins.length) {
    instance._installedPlugins.length = 0;
  }
  var use = instance.use;
  instance.use = function (plugin) {
    var rest = [], len = arguments.length - 1;
    while ( len-- > 0 ) rest[ len ] = arguments[ len + 1 ];

    if (plugin.installed === true) {
      plugin.installed = false;
    }
    if (plugin.install && plugin.install.installed === true) {
      plugin.install.installed = false;
    }
    use.call.apply(use, [ instance, plugin ].concat( rest ));
  };
  return instance
}

// 
Vue.config.productionTip = false;
Vue.config.devtools = false;

function mount (
  component,
  options
) {
  if ( options === void 0 ) options = {};

  var existingErrorHandler = Vue.config.errorHandler;
  Vue.config.errorHandler = errorHandler;

  warnIfNoWindow();

  var elm = options.attachToDocument ? createElement() : undefined;

  var mergedOptions = mergeOptions(options, config);

  var parentVm = createInstance(
    component,
    mergedOptions,
    createLocalVue(options.localVue)
  );

  var vm = parentVm.$mount(elm).$refs.vm;

  var componentsWithError = findAllInstances(vm).filter(
    function (c) { return c._error; }
  );

  if (componentsWithError.length > 0) {
    throw componentsWithError[0]._error
  }

  Vue.config.errorHandler = existingErrorHandler;

  var wrapperOptions = {
    attachedToDocument: !!mergedOptions.attachToDocument,
    sync: mergedOptions.sync
  };
  var root = vm.$options._isFunctionalContainer
    ? vm._vnode
    : vm;

  component._Ctor = [];

  return createWrapper(root, wrapperOptions)
}

// 


function shallowMount (
  component,
  options
) {
  if ( options === void 0 ) options = {};

  return mount(component, Object.assign({}, options,
    {shouldProxy: true}))
}

// 
var toTypes = [String, Object];
var eventTypes = [String, Array];

var RouterLinkStub = {
  name: 'RouterLinkStub',
  props: {
    to: {
      type: toTypes,
      required: true
    },
    tag: {
      type: String,
      default: 'a'
    },
    exact: Boolean,
    append: Boolean,
    replace: Boolean,
    activeClass: String,
    exactActiveClass: String,
    event: {
      type: eventTypes,
      default: 'click'
    }
  },
  render: function render (h) {
    return h(this.tag, undefined, this.$slots.default)
  }
}

function shallow (component, options) {
  warn(
    "shallow has been renamed to shallowMount. shallow " +
    "will be removed in 1.0.0, use shallowMount instead"
  );
  return shallowMount(component, options)
}

var index = {
  createLocalVue: createLocalVue,
  createWrapper: createWrapper,
  config: config,
  mount: mount,
  shallow: shallow,
  shallowMount: shallowMount,
  TransitionStub: TransitionStub,
  TransitionGroupStub: TransitionGroupStub,
  RouterLinkStub: RouterLinkStub,
  Wrapper: Wrapper,
  WrapperArray: WrapperArray
}

module.exports = index;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidnVlLXRlc3QtdXRpbHMuanMiLCJzb3VyY2VzIjpbIi4uL3NyYy9tYXRjaGVzLXBvbHlmaWxsLmpzIiwiLi4vc3JjL29iamVjdC1hc3NpZ24tcG9seWZpbGwuanMiLCIuLi8uLi9zaGFyZWQvbm9kZV9tb2R1bGVzL3NlbXZlci9zZW12ZXIuanMiLCIuLi8uLi9zaGFyZWQvdXRpbC5qcyIsIi4uLy4uL3NoYXJlZC92YWxpZGF0b3JzLmpzIiwiLi4vLi4vc2hhcmVkL2NvbnN0cy5qcyIsIi4uL3NyYy9nZXQtc2VsZWN0b3IuanMiLCIuLi9zcmMvY29tcG9uZW50cy9UcmFuc2l0aW9uU3R1Yi5qcyIsIi4uL3NyYy9jb21wb25lbnRzL1RyYW5zaXRpb25Hcm91cFN0dWIuanMiLCIuLi9zcmMvY29uZmlnLmpzIiwiLi4vc3JjL3dyYXBwZXItYXJyYXkuanMiLCIuLi9zcmMvZXJyb3Itd3JhcHBlci5qcyIsIi4uL3NyYy9maW5kLWRvbS1ub2Rlcy5qcyIsIi4uL3NyYy9tYXRjaGVzLmpzIiwiLi4vc3JjL2ZpbmQuanMiLCIuLi9zcmMvY3JlYXRlLXdyYXBwZXIuanMiLCIuLi9zcmMvb3JkZXItd2F0Y2hlcnMuanMiLCIuLi9zcmMvcmVjdXJzaXZlbHktc2V0LWRhdGEuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZG9tLWV2ZW50LXR5cGVzL2luZGV4LmpzIiwiLi4vc3JjL2NyZWF0ZS1kb20tZXZlbnQuanMiLCIuLi9zcmMvd3JhcHBlci5qcyIsIi4uL3NyYy9zZXQtd2F0Y2hlcnMtdG8tc3luYy5qcyIsIi4uL3NyYy92dWUtd3JhcHBlci5qcyIsIi4uLy4uL2NyZWF0ZS1pbnN0YW5jZS9jcmVhdGUtc2xvdC12bm9kZXMuanMiLCIuLi8uLi9jcmVhdGUtaW5zdGFuY2UvYWRkLW1vY2tzLmpzIiwiLi4vLi4vY3JlYXRlLWluc3RhbmNlL2xvZy1ldmVudHMuanMiLCIuLi8uLi9jcmVhdGUtaW5zdGFuY2UvYWRkLXN0dWJzLmpzIiwiLi4vLi4vc2hhcmVkL2NvbXBpbGUtdGVtcGxhdGUuanMiLCIuLi8uLi9jcmVhdGUtaW5zdGFuY2UvZXh0cmFjdC1pbnN0YW5jZS1vcHRpb25zLmpzIiwiLi4vLi4vY3JlYXRlLWluc3RhbmNlL3ZhbGlkYXRlLXNsb3RzLmpzIiwiLi4vLi4vY3JlYXRlLWluc3RhbmNlL2NyZWF0ZS1zY29wZWQtc2xvdHMuanMiLCIuLi8uLi9jcmVhdGUtaW5zdGFuY2UvY3JlYXRlLWZ1bmN0aW9uYWwtY29tcG9uZW50LmpzIiwiLi4vLi4vY3JlYXRlLWluc3RhbmNlL2NyZWF0ZS1jb21wb25lbnQtc3R1YnMuanMiLCIuLi8uLi9jcmVhdGUtaW5zdGFuY2UvcGF0Y2gtcmVuZGVyLmpzIiwiLi4vLi4vY3JlYXRlLWluc3RhbmNlL2NyZWF0ZS1pbnN0YW5jZS5qcyIsIi4uL3NyYy9jcmVhdGUtZWxlbWVudC5qcyIsIi4uL3NyYy9lcnJvci1oYW5kbGVyLmpzIiwiLi4vLi4vc2hhcmVkL25vcm1hbGl6ZS5qcyIsIi4uLy4uL3NoYXJlZC9tZXJnZS1vcHRpb25zLmpzIiwiLi4vc3JjL3dhcm4taWYtbm8td2luZG93LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fbGlzdENhY2hlQ2xlYXIuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL2VxLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYXNzb2NJbmRleE9mLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fbGlzdENhY2hlRGVsZXRlLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fbGlzdENhY2hlR2V0LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fbGlzdENhY2hlSGFzLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fbGlzdENhY2hlU2V0LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fTGlzdENhY2hlLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fc3RhY2tDbGVhci5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX3N0YWNrRGVsZXRlLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fc3RhY2tHZXQuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19zdGFja0hhcy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2ZyZWVHbG9iYWwuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19yb290LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fU3ltYm9sLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fZ2V0UmF3VGFnLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fb2JqZWN0VG9TdHJpbmcuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19iYXNlR2V0VGFnLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9pc09iamVjdC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvaXNGdW5jdGlvbi5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2NvcmVKc0RhdGEuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19pc01hc2tlZC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX3RvU291cmNlLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZUlzTmF0aXZlLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fZ2V0VmFsdWUuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19nZXROYXRpdmUuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19NYXAuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19uYXRpdmVDcmVhdGUuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19oYXNoQ2xlYXIuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19oYXNoRGVsZXRlLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9faGFzaEdldC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2hhc2hIYXMuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19oYXNoU2V0LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fSGFzaC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX21hcENhY2hlQ2xlYXIuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19pc0tleWFibGUuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19nZXRNYXBEYXRhLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fbWFwQ2FjaGVEZWxldGUuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19tYXBDYWNoZUdldC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX21hcENhY2hlSGFzLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fbWFwQ2FjaGVTZXQuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19NYXBDYWNoZS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX3N0YWNrU2V0LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fU3RhY2suanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19hcnJheUVhY2guanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19kZWZpbmVQcm9wZXJ0eS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VBc3NpZ25WYWx1ZS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Fzc2lnblZhbHVlLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fY29weU9iamVjdC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VUaW1lcy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvaXNPYmplY3RMaWtlLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZUlzQXJndW1lbnRzLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9pc0FyZ3VtZW50cy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvaXNBcnJheS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvc3R1YkZhbHNlLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9pc0J1ZmZlci5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2lzSW5kZXguanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL2lzTGVuZ3RoLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZUlzVHlwZWRBcnJheS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VVbmFyeS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX25vZGVVdGlsLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9pc1R5cGVkQXJyYXkuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19hcnJheUxpa2VLZXlzLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9faXNQcm90b3R5cGUuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19vdmVyQXJnLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fbmF0aXZlS2V5cy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VLZXlzLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9pc0FycmF5TGlrZS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gva2V5cy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VBc3NpZ24uanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19uYXRpdmVLZXlzSW4uanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19iYXNlS2V5c0luLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9rZXlzSW4uanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19iYXNlQXNzaWduSW4uanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19jbG9uZUJ1ZmZlci5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2NvcHlBcnJheS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2FycmF5RmlsdGVyLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9zdHViQXJyYXkuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19nZXRTeW1ib2xzLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fY29weVN5bWJvbHMuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19hcnJheVB1c2guanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19nZXRQcm90b3R5cGUuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19nZXRTeW1ib2xzSW4uanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19jb3B5U3ltYm9sc0luLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZUdldEFsbEtleXMuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19nZXRBbGxLZXlzLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fZ2V0QWxsS2V5c0luLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fRGF0YVZpZXcuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19Qcm9taXNlLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fU2V0LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fV2Vha01hcC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2dldFRhZy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2luaXRDbG9uZUFycmF5LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fVWludDhBcnJheS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Nsb25lQXJyYXlCdWZmZXIuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19jbG9uZURhdGFWaWV3LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYWRkTWFwRW50cnkuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19hcnJheVJlZHVjZS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX21hcFRvQXJyYXkuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19jbG9uZU1hcC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Nsb25lUmVnRXhwLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYWRkU2V0RW50cnkuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19zZXRUb0FycmF5LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fY2xvbmVTZXQuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19jbG9uZVN5bWJvbC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Nsb25lVHlwZWRBcnJheS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2luaXRDbG9uZUJ5VGFnLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZUNyZWF0ZS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2luaXRDbG9uZU9iamVjdC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VDbG9uZS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvY2xvbmVEZWVwLmpzIiwiLi4vc3JjL2NyZWF0ZS1sb2NhbC12dWUuanMiLCIuLi9zcmMvbW91bnQuanMiLCIuLi9zcmMvc2hhbGxvdy1tb3VudC5qcyIsIi4uL3NyYy9jb21wb25lbnRzL1JvdXRlckxpbmtTdHViLmpzIiwiLi4vc3JjL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImlmICh0eXBlb2YgRWxlbWVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgIUVsZW1lbnQucHJvdG90eXBlLm1hdGNoZXMpIHtcbiAgRWxlbWVudC5wcm90b3R5cGUubWF0Y2hlcyA9XG4gICAgRWxlbWVudC5wcm90b3R5cGUubWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgRWxlbWVudC5wcm90b3R5cGUubW96TWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgRWxlbWVudC5wcm90b3R5cGUubXNNYXRjaGVzU2VsZWN0b3IgfHxcbiAgICBFbGVtZW50LnByb3RvdHlwZS5vTWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgRWxlbWVudC5wcm90b3R5cGUud2Via2l0TWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgZnVuY3Rpb24gKHMpIHtcbiAgICAgIGNvbnN0IG1hdGNoZXMgPSAodGhpcy5kb2N1bWVudCB8fCB0aGlzLm93bmVyRG9jdW1lbnQpLnF1ZXJ5U2VsZWN0b3JBbGwocylcbiAgICAgIGxldCBpID0gbWF0Y2hlcy5sZW5ndGhcbiAgICAgIHdoaWxlICgtLWkgPj0gMCAmJiBtYXRjaGVzLml0ZW0oaSkgIT09IHRoaXMpIHt9XG4gICAgICByZXR1cm4gaSA+IC0xXG4gICAgfVxufVxuIiwiaWYgKHR5cGVvZiBPYmplY3QuYXNzaWduICE9PSAnZnVuY3Rpb24nKSB7XG4gIChmdW5jdGlvbiAoKSB7XG4gICAgT2JqZWN0LmFzc2lnbiA9IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgICd1c2Ugc3RyaWN0J1xuICAgICAgaWYgKHRhcmdldCA9PT0gdW5kZWZpbmVkIHx8IHRhcmdldCA9PT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY29udmVydCB1bmRlZmluZWQgb3IgbnVsbCB0byBvYmplY3QnKVxuICAgICAgfVxuXG4gICAgICB2YXIgb3V0cHV0ID0gT2JqZWN0KHRhcmdldClcbiAgICAgIGZvciAodmFyIGluZGV4ID0gMTsgaW5kZXggPCBhcmd1bWVudHMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaW5kZXhdXG4gICAgICAgIGlmIChzb3VyY2UgIT09IHVuZGVmaW5lZCAmJiBzb3VyY2UgIT09IG51bGwpIHtcbiAgICAgICAgICBmb3IgKHZhciBuZXh0S2V5IGluIHNvdXJjZSkge1xuICAgICAgICAgICAgaWYgKHNvdXJjZS5oYXNPd25Qcm9wZXJ0eShuZXh0S2V5KSkge1xuICAgICAgICAgICAgICBvdXRwdXRbbmV4dEtleV0gPSBzb3VyY2VbbmV4dEtleV1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBvdXRwdXRcbiAgICB9XG4gIH0pKClcbn1cbiIsImV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IFNlbVZlcjtcblxuLy8gVGhlIGRlYnVnIGZ1bmN0aW9uIGlzIGV4Y2x1ZGVkIGVudGlyZWx5IGZyb20gdGhlIG1pbmlmaWVkIHZlcnNpb24uXG4vKiBub21pbiAqLyB2YXIgZGVidWc7XG4vKiBub21pbiAqLyBpZiAodHlwZW9mIHByb2Nlc3MgPT09ICdvYmplY3QnICYmXG4gICAgLyogbm9taW4gKi8gcHJvY2Vzcy5lbnYgJiZcbiAgICAvKiBub21pbiAqLyBwcm9jZXNzLmVudi5OT0RFX0RFQlVHICYmXG4gICAgLyogbm9taW4gKi8gL1xcYnNlbXZlclxcYi9pLnRlc3QocHJvY2Vzcy5lbnYuTk9ERV9ERUJVRykpXG4gIC8qIG5vbWluICovIGRlYnVnID0gZnVuY3Rpb24oKSB7XG4gICAgLyogbm9taW4gKi8gdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApO1xuICAgIC8qIG5vbWluICovIGFyZ3MudW5zaGlmdCgnU0VNVkVSJyk7XG4gICAgLyogbm9taW4gKi8gY29uc29sZS5sb2cuYXBwbHkoY29uc29sZSwgYXJncyk7XG4gICAgLyogbm9taW4gKi8gfTtcbi8qIG5vbWluICovIGVsc2VcbiAgLyogbm9taW4gKi8gZGVidWcgPSBmdW5jdGlvbigpIHt9O1xuXG4vLyBOb3RlOiB0aGlzIGlzIHRoZSBzZW12ZXIub3JnIHZlcnNpb24gb2YgdGhlIHNwZWMgdGhhdCBpdCBpbXBsZW1lbnRzXG4vLyBOb3QgbmVjZXNzYXJpbHkgdGhlIHBhY2thZ2UgdmVyc2lvbiBvZiB0aGlzIGNvZGUuXG5leHBvcnRzLlNFTVZFUl9TUEVDX1ZFUlNJT04gPSAnMi4wLjAnO1xuXG52YXIgTUFYX0xFTkdUSCA9IDI1NjtcbnZhciBNQVhfU0FGRV9JTlRFR0VSID0gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIgfHwgOTAwNzE5OTI1NDc0MDk5MTtcblxuLy8gTWF4IHNhZmUgc2VnbWVudCBsZW5ndGggZm9yIGNvZXJjaW9uLlxudmFyIE1BWF9TQUZFX0NPTVBPTkVOVF9MRU5HVEggPSAxNjtcblxuLy8gVGhlIGFjdHVhbCByZWdleHBzIGdvIG9uIGV4cG9ydHMucmVcbnZhciByZSA9IGV4cG9ydHMucmUgPSBbXTtcbnZhciBzcmMgPSBleHBvcnRzLnNyYyA9IFtdO1xudmFyIFIgPSAwO1xuXG4vLyBUaGUgZm9sbG93aW5nIFJlZ3VsYXIgRXhwcmVzc2lvbnMgY2FuIGJlIHVzZWQgZm9yIHRva2VuaXppbmcsXG4vLyB2YWxpZGF0aW5nLCBhbmQgcGFyc2luZyBTZW1WZXIgdmVyc2lvbiBzdHJpbmdzLlxuXG4vLyAjIyBOdW1lcmljIElkZW50aWZpZXJcbi8vIEEgc2luZ2xlIGAwYCwgb3IgYSBub24temVybyBkaWdpdCBmb2xsb3dlZCBieSB6ZXJvIG9yIG1vcmUgZGlnaXRzLlxuXG52YXIgTlVNRVJJQ0lERU5USUZJRVIgPSBSKys7XG5zcmNbTlVNRVJJQ0lERU5USUZJRVJdID0gJzB8WzEtOV1cXFxcZConO1xudmFyIE5VTUVSSUNJREVOVElGSUVSTE9PU0UgPSBSKys7XG5zcmNbTlVNRVJJQ0lERU5USUZJRVJMT09TRV0gPSAnWzAtOV0rJztcblxuXG4vLyAjIyBOb24tbnVtZXJpYyBJZGVudGlmaWVyXG4vLyBaZXJvIG9yIG1vcmUgZGlnaXRzLCBmb2xsb3dlZCBieSBhIGxldHRlciBvciBoeXBoZW4sIGFuZCB0aGVuIHplcm8gb3Jcbi8vIG1vcmUgbGV0dGVycywgZGlnaXRzLCBvciBoeXBoZW5zLlxuXG52YXIgTk9OTlVNRVJJQ0lERU5USUZJRVIgPSBSKys7XG5zcmNbTk9OTlVNRVJJQ0lERU5USUZJRVJdID0gJ1xcXFxkKlthLXpBLVotXVthLXpBLVowLTktXSonO1xuXG5cbi8vICMjIE1haW4gVmVyc2lvblxuLy8gVGhyZWUgZG90LXNlcGFyYXRlZCBudW1lcmljIGlkZW50aWZpZXJzLlxuXG52YXIgTUFJTlZFUlNJT04gPSBSKys7XG5zcmNbTUFJTlZFUlNJT05dID0gJygnICsgc3JjW05VTUVSSUNJREVOVElGSUVSXSArICcpXFxcXC4nICtcbiAgICAgICAgICAgICAgICAgICAnKCcgKyBzcmNbTlVNRVJJQ0lERU5USUZJRVJdICsgJylcXFxcLicgK1xuICAgICAgICAgICAgICAgICAgICcoJyArIHNyY1tOVU1FUklDSURFTlRJRklFUl0gKyAnKSc7XG5cbnZhciBNQUlOVkVSU0lPTkxPT1NFID0gUisrO1xuc3JjW01BSU5WRVJTSU9OTE9PU0VdID0gJygnICsgc3JjW05VTUVSSUNJREVOVElGSUVSTE9PU0VdICsgJylcXFxcLicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJygnICsgc3JjW05VTUVSSUNJREVOVElGSUVSTE9PU0VdICsgJylcXFxcLicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJygnICsgc3JjW05VTUVSSUNJREVOVElGSUVSTE9PU0VdICsgJyknO1xuXG4vLyAjIyBQcmUtcmVsZWFzZSBWZXJzaW9uIElkZW50aWZpZXJcbi8vIEEgbnVtZXJpYyBpZGVudGlmaWVyLCBvciBhIG5vbi1udW1lcmljIGlkZW50aWZpZXIuXG5cbnZhciBQUkVSRUxFQVNFSURFTlRJRklFUiA9IFIrKztcbnNyY1tQUkVSRUxFQVNFSURFTlRJRklFUl0gPSAnKD86JyArIHNyY1tOVU1FUklDSURFTlRJRklFUl0gK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICd8JyArIHNyY1tOT05OVU1FUklDSURFTlRJRklFUl0gKyAnKSc7XG5cbnZhciBQUkVSRUxFQVNFSURFTlRJRklFUkxPT1NFID0gUisrO1xuc3JjW1BSRVJFTEVBU0VJREVOVElGSUVSTE9PU0VdID0gJyg/OicgKyBzcmNbTlVNRVJJQ0lERU5USUZJRVJMT09TRV0gK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3wnICsgc3JjW05PTk5VTUVSSUNJREVOVElGSUVSXSArICcpJztcblxuXG4vLyAjIyBQcmUtcmVsZWFzZSBWZXJzaW9uXG4vLyBIeXBoZW4sIGZvbGxvd2VkIGJ5IG9uZSBvciBtb3JlIGRvdC1zZXBhcmF0ZWQgcHJlLXJlbGVhc2UgdmVyc2lvblxuLy8gaWRlbnRpZmllcnMuXG5cbnZhciBQUkVSRUxFQVNFID0gUisrO1xuc3JjW1BSRVJFTEVBU0VdID0gJyg/Oi0oJyArIHNyY1tQUkVSRUxFQVNFSURFTlRJRklFUl0gK1xuICAgICAgICAgICAgICAgICAgJyg/OlxcXFwuJyArIHNyY1tQUkVSRUxFQVNFSURFTlRJRklFUl0gKyAnKSopKSc7XG5cbnZhciBQUkVSRUxFQVNFTE9PU0UgPSBSKys7XG5zcmNbUFJFUkVMRUFTRUxPT1NFXSA9ICcoPzotPygnICsgc3JjW1BSRVJFTEVBU0VJREVOVElGSUVSTE9PU0VdICtcbiAgICAgICAgICAgICAgICAgICAgICAgJyg/OlxcXFwuJyArIHNyY1tQUkVSRUxFQVNFSURFTlRJRklFUkxPT1NFXSArICcpKikpJztcblxuLy8gIyMgQnVpbGQgTWV0YWRhdGEgSWRlbnRpZmllclxuLy8gQW55IGNvbWJpbmF0aW9uIG9mIGRpZ2l0cywgbGV0dGVycywgb3IgaHlwaGVucy5cblxudmFyIEJVSUxESURFTlRJRklFUiA9IFIrKztcbnNyY1tCVUlMRElERU5USUZJRVJdID0gJ1swLTlBLVphLXotXSsnO1xuXG4vLyAjIyBCdWlsZCBNZXRhZGF0YVxuLy8gUGx1cyBzaWduLCBmb2xsb3dlZCBieSBvbmUgb3IgbW9yZSBwZXJpb2Qtc2VwYXJhdGVkIGJ1aWxkIG1ldGFkYXRhXG4vLyBpZGVudGlmaWVycy5cblxudmFyIEJVSUxEID0gUisrO1xuc3JjW0JVSUxEXSA9ICcoPzpcXFxcKygnICsgc3JjW0JVSUxESURFTlRJRklFUl0gK1xuICAgICAgICAgICAgICcoPzpcXFxcLicgKyBzcmNbQlVJTERJREVOVElGSUVSXSArICcpKikpJztcblxuXG4vLyAjIyBGdWxsIFZlcnNpb24gU3RyaW5nXG4vLyBBIG1haW4gdmVyc2lvbiwgZm9sbG93ZWQgb3B0aW9uYWxseSBieSBhIHByZS1yZWxlYXNlIHZlcnNpb24gYW5kXG4vLyBidWlsZCBtZXRhZGF0YS5cblxuLy8gTm90ZSB0aGF0IHRoZSBvbmx5IG1ham9yLCBtaW5vciwgcGF0Y2gsIGFuZCBwcmUtcmVsZWFzZSBzZWN0aW9ucyBvZlxuLy8gdGhlIHZlcnNpb24gc3RyaW5nIGFyZSBjYXB0dXJpbmcgZ3JvdXBzLiAgVGhlIGJ1aWxkIG1ldGFkYXRhIGlzIG5vdCBhXG4vLyBjYXB0dXJpbmcgZ3JvdXAsIGJlY2F1c2UgaXQgc2hvdWxkIG5vdCBldmVyIGJlIHVzZWQgaW4gdmVyc2lvblxuLy8gY29tcGFyaXNvbi5cblxudmFyIEZVTEwgPSBSKys7XG52YXIgRlVMTFBMQUlOID0gJ3Y/JyArIHNyY1tNQUlOVkVSU0lPTl0gK1xuICAgICAgICAgICAgICAgIHNyY1tQUkVSRUxFQVNFXSArICc/JyArXG4gICAgICAgICAgICAgICAgc3JjW0JVSUxEXSArICc/Jztcblxuc3JjW0ZVTExdID0gJ14nICsgRlVMTFBMQUlOICsgJyQnO1xuXG4vLyBsaWtlIGZ1bGwsIGJ1dCBhbGxvd3MgdjEuMi4zIGFuZCA9MS4yLjMsIHdoaWNoIHBlb3BsZSBkbyBzb21ldGltZXMuXG4vLyBhbHNvLCAxLjAuMGFscGhhMSAocHJlcmVsZWFzZSB3aXRob3V0IHRoZSBoeXBoZW4pIHdoaWNoIGlzIHByZXR0eVxuLy8gY29tbW9uIGluIHRoZSBucG0gcmVnaXN0cnkuXG52YXIgTE9PU0VQTEFJTiA9ICdbdj1cXFxcc10qJyArIHNyY1tNQUlOVkVSU0lPTkxPT1NFXSArXG4gICAgICAgICAgICAgICAgIHNyY1tQUkVSRUxFQVNFTE9PU0VdICsgJz8nICtcbiAgICAgICAgICAgICAgICAgc3JjW0JVSUxEXSArICc/JztcblxudmFyIExPT1NFID0gUisrO1xuc3JjW0xPT1NFXSA9ICdeJyArIExPT1NFUExBSU4gKyAnJCc7XG5cbnZhciBHVExUID0gUisrO1xuc3JjW0dUTFRdID0gJygoPzo8fD4pPz0/KSc7XG5cbi8vIFNvbWV0aGluZyBsaWtlIFwiMi4qXCIgb3IgXCIxLjIueFwiLlxuLy8gTm90ZSB0aGF0IFwieC54XCIgaXMgYSB2YWxpZCB4UmFuZ2UgaWRlbnRpZmVyLCBtZWFuaW5nIFwiYW55IHZlcnNpb25cIlxuLy8gT25seSB0aGUgZmlyc3QgaXRlbSBpcyBzdHJpY3RseSByZXF1aXJlZC5cbnZhciBYUkFOR0VJREVOVElGSUVSTE9PU0UgPSBSKys7XG5zcmNbWFJBTkdFSURFTlRJRklFUkxPT1NFXSA9IHNyY1tOVU1FUklDSURFTlRJRklFUkxPT1NFXSArICd8eHxYfFxcXFwqJztcbnZhciBYUkFOR0VJREVOVElGSUVSID0gUisrO1xuc3JjW1hSQU5HRUlERU5USUZJRVJdID0gc3JjW05VTUVSSUNJREVOVElGSUVSXSArICd8eHxYfFxcXFwqJztcblxudmFyIFhSQU5HRVBMQUlOID0gUisrO1xuc3JjW1hSQU5HRVBMQUlOXSA9ICdbdj1cXFxcc10qKCcgKyBzcmNbWFJBTkdFSURFTlRJRklFUl0gKyAnKScgK1xuICAgICAgICAgICAgICAgICAgICcoPzpcXFxcLignICsgc3JjW1hSQU5HRUlERU5USUZJRVJdICsgJyknICtcbiAgICAgICAgICAgICAgICAgICAnKD86XFxcXC4oJyArIHNyY1tYUkFOR0VJREVOVElGSUVSXSArICcpJyArXG4gICAgICAgICAgICAgICAgICAgJyg/OicgKyBzcmNbUFJFUkVMRUFTRV0gKyAnKT8nICtcbiAgICAgICAgICAgICAgICAgICBzcmNbQlVJTERdICsgJz8nICtcbiAgICAgICAgICAgICAgICAgICAnKT8pPyc7XG5cbnZhciBYUkFOR0VQTEFJTkxPT1NFID0gUisrO1xuc3JjW1hSQU5HRVBMQUlOTE9PU0VdID0gJ1t2PVxcXFxzXSooJyArIHNyY1tYUkFOR0VJREVOVElGSUVSTE9PU0VdICsgJyknICtcbiAgICAgICAgICAgICAgICAgICAgICAgICcoPzpcXFxcLignICsgc3JjW1hSQU5HRUlERU5USUZJRVJMT09TRV0gKyAnKScgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJyg/OlxcXFwuKCcgKyBzcmNbWFJBTkdFSURFTlRJRklFUkxPT1NFXSArICcpJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnKD86JyArIHNyY1tQUkVSRUxFQVNFTE9PU0VdICsgJyk/JyArXG4gICAgICAgICAgICAgICAgICAgICAgICBzcmNbQlVJTERdICsgJz8nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICcpPyk/JztcblxudmFyIFhSQU5HRSA9IFIrKztcbnNyY1tYUkFOR0VdID0gJ14nICsgc3JjW0dUTFRdICsgJ1xcXFxzKicgKyBzcmNbWFJBTkdFUExBSU5dICsgJyQnO1xudmFyIFhSQU5HRUxPT1NFID0gUisrO1xuc3JjW1hSQU5HRUxPT1NFXSA9ICdeJyArIHNyY1tHVExUXSArICdcXFxccyonICsgc3JjW1hSQU5HRVBMQUlOTE9PU0VdICsgJyQnO1xuXG4vLyBDb2VyY2lvbi5cbi8vIEV4dHJhY3QgYW55dGhpbmcgdGhhdCBjb3VsZCBjb25jZWl2YWJseSBiZSBhIHBhcnQgb2YgYSB2YWxpZCBzZW12ZXJcbnZhciBDT0VSQ0UgPSBSKys7XG5zcmNbQ09FUkNFXSA9ICcoPzpefFteXFxcXGRdKScgK1xuICAgICAgICAgICAgICAnKFxcXFxkezEsJyArIE1BWF9TQUZFX0NPTVBPTkVOVF9MRU5HVEggKyAnfSknICtcbiAgICAgICAgICAgICAgJyg/OlxcXFwuKFxcXFxkezEsJyArIE1BWF9TQUZFX0NPTVBPTkVOVF9MRU5HVEggKyAnfSkpPycgK1xuICAgICAgICAgICAgICAnKD86XFxcXC4oXFxcXGR7MSwnICsgTUFYX1NBRkVfQ09NUE9ORU5UX0xFTkdUSCArICd9KSk/JyArXG4gICAgICAgICAgICAgICcoPzokfFteXFxcXGRdKSc7XG5cbi8vIFRpbGRlIHJhbmdlcy5cbi8vIE1lYW5pbmcgaXMgXCJyZWFzb25hYmx5IGF0IG9yIGdyZWF0ZXIgdGhhblwiXG52YXIgTE9ORVRJTERFID0gUisrO1xuc3JjW0xPTkVUSUxERV0gPSAnKD86fj4/KSc7XG5cbnZhciBUSUxERVRSSU0gPSBSKys7XG5zcmNbVElMREVUUklNXSA9ICcoXFxcXHMqKScgKyBzcmNbTE9ORVRJTERFXSArICdcXFxccysnO1xucmVbVElMREVUUklNXSA9IG5ldyBSZWdFeHAoc3JjW1RJTERFVFJJTV0sICdnJyk7XG52YXIgdGlsZGVUcmltUmVwbGFjZSA9ICckMX4nO1xuXG52YXIgVElMREUgPSBSKys7XG5zcmNbVElMREVdID0gJ14nICsgc3JjW0xPTkVUSUxERV0gKyBzcmNbWFJBTkdFUExBSU5dICsgJyQnO1xudmFyIFRJTERFTE9PU0UgPSBSKys7XG5zcmNbVElMREVMT09TRV0gPSAnXicgKyBzcmNbTE9ORVRJTERFXSArIHNyY1tYUkFOR0VQTEFJTkxPT1NFXSArICckJztcblxuLy8gQ2FyZXQgcmFuZ2VzLlxuLy8gTWVhbmluZyBpcyBcImF0IGxlYXN0IGFuZCBiYWNrd2FyZHMgY29tcGF0aWJsZSB3aXRoXCJcbnZhciBMT05FQ0FSRVQgPSBSKys7XG5zcmNbTE9ORUNBUkVUXSA9ICcoPzpcXFxcXiknO1xuXG52YXIgQ0FSRVRUUklNID0gUisrO1xuc3JjW0NBUkVUVFJJTV0gPSAnKFxcXFxzKiknICsgc3JjW0xPTkVDQVJFVF0gKyAnXFxcXHMrJztcbnJlW0NBUkVUVFJJTV0gPSBuZXcgUmVnRXhwKHNyY1tDQVJFVFRSSU1dLCAnZycpO1xudmFyIGNhcmV0VHJpbVJlcGxhY2UgPSAnJDFeJztcblxudmFyIENBUkVUID0gUisrO1xuc3JjW0NBUkVUXSA9ICdeJyArIHNyY1tMT05FQ0FSRVRdICsgc3JjW1hSQU5HRVBMQUlOXSArICckJztcbnZhciBDQVJFVExPT1NFID0gUisrO1xuc3JjW0NBUkVUTE9PU0VdID0gJ14nICsgc3JjW0xPTkVDQVJFVF0gKyBzcmNbWFJBTkdFUExBSU5MT09TRV0gKyAnJCc7XG5cbi8vIEEgc2ltcGxlIGd0L2x0L2VxIHRoaW5nLCBvciBqdXN0IFwiXCIgdG8gaW5kaWNhdGUgXCJhbnkgdmVyc2lvblwiXG52YXIgQ09NUEFSQVRPUkxPT1NFID0gUisrO1xuc3JjW0NPTVBBUkFUT1JMT09TRV0gPSAnXicgKyBzcmNbR1RMVF0gKyAnXFxcXHMqKCcgKyBMT09TRVBMQUlOICsgJykkfF4kJztcbnZhciBDT01QQVJBVE9SID0gUisrO1xuc3JjW0NPTVBBUkFUT1JdID0gJ14nICsgc3JjW0dUTFRdICsgJ1xcXFxzKignICsgRlVMTFBMQUlOICsgJykkfF4kJztcblxuXG4vLyBBbiBleHByZXNzaW9uIHRvIHN0cmlwIGFueSB3aGl0ZXNwYWNlIGJldHdlZW4gdGhlIGd0bHQgYW5kIHRoZSB0aGluZ1xuLy8gaXQgbW9kaWZpZXMsIHNvIHRoYXQgYD4gMS4yLjNgID09PiBgPjEuMi4zYFxudmFyIENPTVBBUkFUT1JUUklNID0gUisrO1xuc3JjW0NPTVBBUkFUT1JUUklNXSA9ICcoXFxcXHMqKScgKyBzcmNbR1RMVF0gK1xuICAgICAgICAgICAgICAgICAgICAgICdcXFxccyooJyArIExPT1NFUExBSU4gKyAnfCcgKyBzcmNbWFJBTkdFUExBSU5dICsgJyknO1xuXG4vLyB0aGlzIG9uZSBoYXMgdG8gdXNlIHRoZSAvZyBmbGFnXG5yZVtDT01QQVJBVE9SVFJJTV0gPSBuZXcgUmVnRXhwKHNyY1tDT01QQVJBVE9SVFJJTV0sICdnJyk7XG52YXIgY29tcGFyYXRvclRyaW1SZXBsYWNlID0gJyQxJDIkMyc7XG5cblxuLy8gU29tZXRoaW5nIGxpa2UgYDEuMi4zIC0gMS4yLjRgXG4vLyBOb3RlIHRoYXQgdGhlc2UgYWxsIHVzZSB0aGUgbG9vc2UgZm9ybSwgYmVjYXVzZSB0aGV5J2xsIGJlXG4vLyBjaGVja2VkIGFnYWluc3QgZWl0aGVyIHRoZSBzdHJpY3Qgb3IgbG9vc2UgY29tcGFyYXRvciBmb3JtXG4vLyBsYXRlci5cbnZhciBIWVBIRU5SQU5HRSA9IFIrKztcbnNyY1tIWVBIRU5SQU5HRV0gPSAnXlxcXFxzKignICsgc3JjW1hSQU5HRVBMQUlOXSArICcpJyArXG4gICAgICAgICAgICAgICAgICAgJ1xcXFxzKy1cXFxccysnICtcbiAgICAgICAgICAgICAgICAgICAnKCcgKyBzcmNbWFJBTkdFUExBSU5dICsgJyknICtcbiAgICAgICAgICAgICAgICAgICAnXFxcXHMqJCc7XG5cbnZhciBIWVBIRU5SQU5HRUxPT1NFID0gUisrO1xuc3JjW0hZUEhFTlJBTkdFTE9PU0VdID0gJ15cXFxccyooJyArIHNyY1tYUkFOR0VQTEFJTkxPT1NFXSArICcpJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnXFxcXHMrLVxcXFxzKycgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJygnICsgc3JjW1hSQU5HRVBMQUlOTE9PU0VdICsgJyknICtcbiAgICAgICAgICAgICAgICAgICAgICAgICdcXFxccyokJztcblxuLy8gU3RhciByYW5nZXMgYmFzaWNhbGx5IGp1c3QgYWxsb3cgYW55dGhpbmcgYXQgYWxsLlxudmFyIFNUQVIgPSBSKys7XG5zcmNbU1RBUl0gPSAnKDx8Pik/PT9cXFxccypcXFxcKic7XG5cbi8vIENvbXBpbGUgdG8gYWN0dWFsIHJlZ2V4cCBvYmplY3RzLlxuLy8gQWxsIGFyZSBmbGFnLWZyZWUsIHVubGVzcyB0aGV5IHdlcmUgY3JlYXRlZCBhYm92ZSB3aXRoIGEgZmxhZy5cbmZvciAodmFyIGkgPSAwOyBpIDwgUjsgaSsrKSB7XG4gIGRlYnVnKGksIHNyY1tpXSk7XG4gIGlmICghcmVbaV0pXG4gICAgcmVbaV0gPSBuZXcgUmVnRXhwKHNyY1tpXSk7XG59XG5cbmV4cG9ydHMucGFyc2UgPSBwYXJzZTtcbmZ1bmN0aW9uIHBhcnNlKHZlcnNpb24sIG9wdGlvbnMpIHtcbiAgaWYgKCFvcHRpb25zIHx8IHR5cGVvZiBvcHRpb25zICE9PSAnb2JqZWN0JylcbiAgICBvcHRpb25zID0geyBsb29zZTogISFvcHRpb25zLCBpbmNsdWRlUHJlcmVsZWFzZTogZmFsc2UgfVxuXG4gIGlmICh2ZXJzaW9uIGluc3RhbmNlb2YgU2VtVmVyKVxuICAgIHJldHVybiB2ZXJzaW9uO1xuXG4gIGlmICh0eXBlb2YgdmVyc2lvbiAhPT0gJ3N0cmluZycpXG4gICAgcmV0dXJuIG51bGw7XG5cbiAgaWYgKHZlcnNpb24ubGVuZ3RoID4gTUFYX0xFTkdUSClcbiAgICByZXR1cm4gbnVsbDtcblxuICB2YXIgciA9IG9wdGlvbnMubG9vc2UgPyByZVtMT09TRV0gOiByZVtGVUxMXTtcbiAgaWYgKCFyLnRlc3QodmVyc2lvbikpXG4gICAgcmV0dXJuIG51bGw7XG5cbiAgdHJ5IHtcbiAgICByZXR1cm4gbmV3IFNlbVZlcih2ZXJzaW9uLCBvcHRpb25zKTtcbiAgfSBjYXRjaCAoZXIpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG5leHBvcnRzLnZhbGlkID0gdmFsaWQ7XG5mdW5jdGlvbiB2YWxpZCh2ZXJzaW9uLCBvcHRpb25zKSB7XG4gIHZhciB2ID0gcGFyc2UodmVyc2lvbiwgb3B0aW9ucyk7XG4gIHJldHVybiB2ID8gdi52ZXJzaW9uIDogbnVsbDtcbn1cblxuXG5leHBvcnRzLmNsZWFuID0gY2xlYW47XG5mdW5jdGlvbiBjbGVhbih2ZXJzaW9uLCBvcHRpb25zKSB7XG4gIHZhciBzID0gcGFyc2UodmVyc2lvbi50cmltKCkucmVwbGFjZSgvXls9dl0rLywgJycpLCBvcHRpb25zKTtcbiAgcmV0dXJuIHMgPyBzLnZlcnNpb24gOiBudWxsO1xufVxuXG5leHBvcnRzLlNlbVZlciA9IFNlbVZlcjtcblxuZnVuY3Rpb24gU2VtVmVyKHZlcnNpb24sIG9wdGlvbnMpIHtcbiAgaWYgKCFvcHRpb25zIHx8IHR5cGVvZiBvcHRpb25zICE9PSAnb2JqZWN0JylcbiAgICBvcHRpb25zID0geyBsb29zZTogISFvcHRpb25zLCBpbmNsdWRlUHJlcmVsZWFzZTogZmFsc2UgfVxuICBpZiAodmVyc2lvbiBpbnN0YW5jZW9mIFNlbVZlcikge1xuICAgIGlmICh2ZXJzaW9uLmxvb3NlID09PSBvcHRpb25zLmxvb3NlKVxuICAgICAgcmV0dXJuIHZlcnNpb247XG4gICAgZWxzZVxuICAgICAgdmVyc2lvbiA9IHZlcnNpb24udmVyc2lvbjtcbiAgfSBlbHNlIGlmICh0eXBlb2YgdmVyc2lvbiAhPT0gJ3N0cmluZycpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIFZlcnNpb246ICcgKyB2ZXJzaW9uKTtcbiAgfVxuXG4gIGlmICh2ZXJzaW9uLmxlbmd0aCA+IE1BWF9MRU5HVEgpXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcigndmVyc2lvbiBpcyBsb25nZXIgdGhhbiAnICsgTUFYX0xFTkdUSCArICcgY2hhcmFjdGVycycpXG5cbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIFNlbVZlcikpXG4gICAgcmV0dXJuIG5ldyBTZW1WZXIodmVyc2lvbiwgb3B0aW9ucyk7XG5cbiAgZGVidWcoJ1NlbVZlcicsIHZlcnNpb24sIG9wdGlvbnMpO1xuICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICB0aGlzLmxvb3NlID0gISFvcHRpb25zLmxvb3NlO1xuXG4gIHZhciBtID0gdmVyc2lvbi50cmltKCkubWF0Y2gob3B0aW9ucy5sb29zZSA/IHJlW0xPT1NFXSA6IHJlW0ZVTExdKTtcblxuICBpZiAoIW0pXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBWZXJzaW9uOiAnICsgdmVyc2lvbik7XG5cbiAgdGhpcy5yYXcgPSB2ZXJzaW9uO1xuXG4gIC8vIHRoZXNlIGFyZSBhY3R1YWxseSBudW1iZXJzXG4gIHRoaXMubWFqb3IgPSArbVsxXTtcbiAgdGhpcy5taW5vciA9ICttWzJdO1xuICB0aGlzLnBhdGNoID0gK21bM107XG5cbiAgaWYgKHRoaXMubWFqb3IgPiBNQVhfU0FGRV9JTlRFR0VSIHx8IHRoaXMubWFqb3IgPCAwKVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgbWFqb3IgdmVyc2lvbicpXG5cbiAgaWYgKHRoaXMubWlub3IgPiBNQVhfU0FGRV9JTlRFR0VSIHx8IHRoaXMubWlub3IgPCAwKVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgbWlub3IgdmVyc2lvbicpXG5cbiAgaWYgKHRoaXMucGF0Y2ggPiBNQVhfU0FGRV9JTlRFR0VSIHx8IHRoaXMucGF0Y2ggPCAwKVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgcGF0Y2ggdmVyc2lvbicpXG5cbiAgLy8gbnVtYmVyaWZ5IGFueSBwcmVyZWxlYXNlIG51bWVyaWMgaWRzXG4gIGlmICghbVs0XSlcbiAgICB0aGlzLnByZXJlbGVhc2UgPSBbXTtcbiAgZWxzZVxuICAgIHRoaXMucHJlcmVsZWFzZSA9IG1bNF0uc3BsaXQoJy4nKS5tYXAoZnVuY3Rpb24oaWQpIHtcbiAgICAgIGlmICgvXlswLTldKyQvLnRlc3QoaWQpKSB7XG4gICAgICAgIHZhciBudW0gPSAraWQ7XG4gICAgICAgIGlmIChudW0gPj0gMCAmJiBudW0gPCBNQVhfU0FGRV9JTlRFR0VSKVxuICAgICAgICAgIHJldHVybiBudW07XG4gICAgICB9XG4gICAgICByZXR1cm4gaWQ7XG4gICAgfSk7XG5cbiAgdGhpcy5idWlsZCA9IG1bNV0gPyBtWzVdLnNwbGl0KCcuJykgOiBbXTtcbiAgdGhpcy5mb3JtYXQoKTtcbn1cblxuU2VtVmVyLnByb3RvdHlwZS5mb3JtYXQgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy52ZXJzaW9uID0gdGhpcy5tYWpvciArICcuJyArIHRoaXMubWlub3IgKyAnLicgKyB0aGlzLnBhdGNoO1xuICBpZiAodGhpcy5wcmVyZWxlYXNlLmxlbmd0aClcbiAgICB0aGlzLnZlcnNpb24gKz0gJy0nICsgdGhpcy5wcmVyZWxlYXNlLmpvaW4oJy4nKTtcbiAgcmV0dXJuIHRoaXMudmVyc2lvbjtcbn07XG5cblNlbVZlci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMudmVyc2lvbjtcbn07XG5cblNlbVZlci5wcm90b3R5cGUuY29tcGFyZSA9IGZ1bmN0aW9uKG90aGVyKSB7XG4gIGRlYnVnKCdTZW1WZXIuY29tcGFyZScsIHRoaXMudmVyc2lvbiwgdGhpcy5vcHRpb25zLCBvdGhlcik7XG4gIGlmICghKG90aGVyIGluc3RhbmNlb2YgU2VtVmVyKSlcbiAgICBvdGhlciA9IG5ldyBTZW1WZXIob3RoZXIsIHRoaXMub3B0aW9ucyk7XG5cbiAgcmV0dXJuIHRoaXMuY29tcGFyZU1haW4ob3RoZXIpIHx8IHRoaXMuY29tcGFyZVByZShvdGhlcik7XG59O1xuXG5TZW1WZXIucHJvdG90eXBlLmNvbXBhcmVNYWluID0gZnVuY3Rpb24ob3RoZXIpIHtcbiAgaWYgKCEob3RoZXIgaW5zdGFuY2VvZiBTZW1WZXIpKVxuICAgIG90aGVyID0gbmV3IFNlbVZlcihvdGhlciwgdGhpcy5vcHRpb25zKTtcblxuICByZXR1cm4gY29tcGFyZUlkZW50aWZpZXJzKHRoaXMubWFqb3IsIG90aGVyLm1ham9yKSB8fFxuICAgICAgICAgY29tcGFyZUlkZW50aWZpZXJzKHRoaXMubWlub3IsIG90aGVyLm1pbm9yKSB8fFxuICAgICAgICAgY29tcGFyZUlkZW50aWZpZXJzKHRoaXMucGF0Y2gsIG90aGVyLnBhdGNoKTtcbn07XG5cblNlbVZlci5wcm90b3R5cGUuY29tcGFyZVByZSA9IGZ1bmN0aW9uKG90aGVyKSB7XG4gIGlmICghKG90aGVyIGluc3RhbmNlb2YgU2VtVmVyKSlcbiAgICBvdGhlciA9IG5ldyBTZW1WZXIob3RoZXIsIHRoaXMub3B0aW9ucyk7XG5cbiAgLy8gTk9UIGhhdmluZyBhIHByZXJlbGVhc2UgaXMgPiBoYXZpbmcgb25lXG4gIGlmICh0aGlzLnByZXJlbGVhc2UubGVuZ3RoICYmICFvdGhlci5wcmVyZWxlYXNlLmxlbmd0aClcbiAgICByZXR1cm4gLTE7XG4gIGVsc2UgaWYgKCF0aGlzLnByZXJlbGVhc2UubGVuZ3RoICYmIG90aGVyLnByZXJlbGVhc2UubGVuZ3RoKVxuICAgIHJldHVybiAxO1xuICBlbHNlIGlmICghdGhpcy5wcmVyZWxlYXNlLmxlbmd0aCAmJiAhb3RoZXIucHJlcmVsZWFzZS5sZW5ndGgpXG4gICAgcmV0dXJuIDA7XG5cbiAgdmFyIGkgPSAwO1xuICBkbyB7XG4gICAgdmFyIGEgPSB0aGlzLnByZXJlbGVhc2VbaV07XG4gICAgdmFyIGIgPSBvdGhlci5wcmVyZWxlYXNlW2ldO1xuICAgIGRlYnVnKCdwcmVyZWxlYXNlIGNvbXBhcmUnLCBpLCBhLCBiKTtcbiAgICBpZiAoYSA9PT0gdW5kZWZpbmVkICYmIGIgPT09IHVuZGVmaW5lZClcbiAgICAgIHJldHVybiAwO1xuICAgIGVsc2UgaWYgKGIgPT09IHVuZGVmaW5lZClcbiAgICAgIHJldHVybiAxO1xuICAgIGVsc2UgaWYgKGEgPT09IHVuZGVmaW5lZClcbiAgICAgIHJldHVybiAtMTtcbiAgICBlbHNlIGlmIChhID09PSBiKVxuICAgICAgY29udGludWU7XG4gICAgZWxzZVxuICAgICAgcmV0dXJuIGNvbXBhcmVJZGVudGlmaWVycyhhLCBiKTtcbiAgfSB3aGlsZSAoKytpKTtcbn07XG5cbi8vIHByZW1pbm9yIHdpbGwgYnVtcCB0aGUgdmVyc2lvbiB1cCB0byB0aGUgbmV4dCBtaW5vciByZWxlYXNlLCBhbmQgaW1tZWRpYXRlbHlcbi8vIGRvd24gdG8gcHJlLXJlbGVhc2UuIHByZW1ham9yIGFuZCBwcmVwYXRjaCB3b3JrIHRoZSBzYW1lIHdheS5cblNlbVZlci5wcm90b3R5cGUuaW5jID0gZnVuY3Rpb24ocmVsZWFzZSwgaWRlbnRpZmllcikge1xuICBzd2l0Y2ggKHJlbGVhc2UpIHtcbiAgICBjYXNlICdwcmVtYWpvcic6XG4gICAgICB0aGlzLnByZXJlbGVhc2UubGVuZ3RoID0gMDtcbiAgICAgIHRoaXMucGF0Y2ggPSAwO1xuICAgICAgdGhpcy5taW5vciA9IDA7XG4gICAgICB0aGlzLm1ham9yKys7XG4gICAgICB0aGlzLmluYygncHJlJywgaWRlbnRpZmllcik7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdwcmVtaW5vcic6XG4gICAgICB0aGlzLnByZXJlbGVhc2UubGVuZ3RoID0gMDtcbiAgICAgIHRoaXMucGF0Y2ggPSAwO1xuICAgICAgdGhpcy5taW5vcisrO1xuICAgICAgdGhpcy5pbmMoJ3ByZScsIGlkZW50aWZpZXIpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncHJlcGF0Y2gnOlxuICAgICAgLy8gSWYgdGhpcyBpcyBhbHJlYWR5IGEgcHJlcmVsZWFzZSwgaXQgd2lsbCBidW1wIHRvIHRoZSBuZXh0IHZlcnNpb25cbiAgICAgIC8vIGRyb3AgYW55IHByZXJlbGVhc2VzIHRoYXQgbWlnaHQgYWxyZWFkeSBleGlzdCwgc2luY2UgdGhleSBhcmUgbm90XG4gICAgICAvLyByZWxldmFudCBhdCB0aGlzIHBvaW50LlxuICAgICAgdGhpcy5wcmVyZWxlYXNlLmxlbmd0aCA9IDA7XG4gICAgICB0aGlzLmluYygncGF0Y2gnLCBpZGVudGlmaWVyKTtcbiAgICAgIHRoaXMuaW5jKCdwcmUnLCBpZGVudGlmaWVyKTtcbiAgICAgIGJyZWFrO1xuICAgIC8vIElmIHRoZSBpbnB1dCBpcyBhIG5vbi1wcmVyZWxlYXNlIHZlcnNpb24sIHRoaXMgYWN0cyB0aGUgc2FtZSBhc1xuICAgIC8vIHByZXBhdGNoLlxuICAgIGNhc2UgJ3ByZXJlbGVhc2UnOlxuICAgICAgaWYgKHRoaXMucHJlcmVsZWFzZS5sZW5ndGggPT09IDApXG4gICAgICAgIHRoaXMuaW5jKCdwYXRjaCcsIGlkZW50aWZpZXIpO1xuICAgICAgdGhpcy5pbmMoJ3ByZScsIGlkZW50aWZpZXIpO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdtYWpvcic6XG4gICAgICAvLyBJZiB0aGlzIGlzIGEgcHJlLW1ham9yIHZlcnNpb24sIGJ1bXAgdXAgdG8gdGhlIHNhbWUgbWFqb3IgdmVyc2lvbi5cbiAgICAgIC8vIE90aGVyd2lzZSBpbmNyZW1lbnQgbWFqb3IuXG4gICAgICAvLyAxLjAuMC01IGJ1bXBzIHRvIDEuMC4wXG4gICAgICAvLyAxLjEuMCBidW1wcyB0byAyLjAuMFxuICAgICAgaWYgKHRoaXMubWlub3IgIT09IDAgfHwgdGhpcy5wYXRjaCAhPT0gMCB8fCB0aGlzLnByZXJlbGVhc2UubGVuZ3RoID09PSAwKVxuICAgICAgICB0aGlzLm1ham9yKys7XG4gICAgICB0aGlzLm1pbm9yID0gMDtcbiAgICAgIHRoaXMucGF0Y2ggPSAwO1xuICAgICAgdGhpcy5wcmVyZWxlYXNlID0gW107XG4gICAgICBicmVhaztcbiAgICBjYXNlICdtaW5vcic6XG4gICAgICAvLyBJZiB0aGlzIGlzIGEgcHJlLW1pbm9yIHZlcnNpb24sIGJ1bXAgdXAgdG8gdGhlIHNhbWUgbWlub3IgdmVyc2lvbi5cbiAgICAgIC8vIE90aGVyd2lzZSBpbmNyZW1lbnQgbWlub3IuXG4gICAgICAvLyAxLjIuMC01IGJ1bXBzIHRvIDEuMi4wXG4gICAgICAvLyAxLjIuMSBidW1wcyB0byAxLjMuMFxuICAgICAgaWYgKHRoaXMucGF0Y2ggIT09IDAgfHwgdGhpcy5wcmVyZWxlYXNlLmxlbmd0aCA9PT0gMClcbiAgICAgICAgdGhpcy5taW5vcisrO1xuICAgICAgdGhpcy5wYXRjaCA9IDA7XG4gICAgICB0aGlzLnByZXJlbGVhc2UgPSBbXTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3BhdGNoJzpcbiAgICAgIC8vIElmIHRoaXMgaXMgbm90IGEgcHJlLXJlbGVhc2UgdmVyc2lvbiwgaXQgd2lsbCBpbmNyZW1lbnQgdGhlIHBhdGNoLlxuICAgICAgLy8gSWYgaXQgaXMgYSBwcmUtcmVsZWFzZSBpdCB3aWxsIGJ1bXAgdXAgdG8gdGhlIHNhbWUgcGF0Y2ggdmVyc2lvbi5cbiAgICAgIC8vIDEuMi4wLTUgcGF0Y2hlcyB0byAxLjIuMFxuICAgICAgLy8gMS4yLjAgcGF0Y2hlcyB0byAxLjIuMVxuICAgICAgaWYgKHRoaXMucHJlcmVsZWFzZS5sZW5ndGggPT09IDApXG4gICAgICAgIHRoaXMucGF0Y2grKztcbiAgICAgIHRoaXMucHJlcmVsZWFzZSA9IFtdO1xuICAgICAgYnJlYWs7XG4gICAgLy8gVGhpcyBwcm9iYWJseSBzaG91bGRuJ3QgYmUgdXNlZCBwdWJsaWNseS5cbiAgICAvLyAxLjAuMCBcInByZVwiIHdvdWxkIGJlY29tZSAxLjAuMC0wIHdoaWNoIGlzIHRoZSB3cm9uZyBkaXJlY3Rpb24uXG4gICAgY2FzZSAncHJlJzpcbiAgICAgIGlmICh0aGlzLnByZXJlbGVhc2UubGVuZ3RoID09PSAwKVxuICAgICAgICB0aGlzLnByZXJlbGVhc2UgPSBbMF07XG4gICAgICBlbHNlIHtcbiAgICAgICAgdmFyIGkgPSB0aGlzLnByZXJlbGVhc2UubGVuZ3RoO1xuICAgICAgICB3aGlsZSAoLS1pID49IDApIHtcbiAgICAgICAgICBpZiAodHlwZW9mIHRoaXMucHJlcmVsZWFzZVtpXSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIHRoaXMucHJlcmVsZWFzZVtpXSsrO1xuICAgICAgICAgICAgaSA9IC0yO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoaSA9PT0gLTEpIC8vIGRpZG4ndCBpbmNyZW1lbnQgYW55dGhpbmdcbiAgICAgICAgICB0aGlzLnByZXJlbGVhc2UucHVzaCgwKTtcbiAgICAgIH1cbiAgICAgIGlmIChpZGVudGlmaWVyKSB7XG4gICAgICAgIC8vIDEuMi4wLWJldGEuMSBidW1wcyB0byAxLjIuMC1iZXRhLjIsXG4gICAgICAgIC8vIDEuMi4wLWJldGEuZm9vYmx6IG9yIDEuMi4wLWJldGEgYnVtcHMgdG8gMS4yLjAtYmV0YS4wXG4gICAgICAgIGlmICh0aGlzLnByZXJlbGVhc2VbMF0gPT09IGlkZW50aWZpZXIpIHtcbiAgICAgICAgICBpZiAoaXNOYU4odGhpcy5wcmVyZWxlYXNlWzFdKSlcbiAgICAgICAgICAgIHRoaXMucHJlcmVsZWFzZSA9IFtpZGVudGlmaWVyLCAwXTtcbiAgICAgICAgfSBlbHNlXG4gICAgICAgICAgdGhpcy5wcmVyZWxlYXNlID0gW2lkZW50aWZpZXIsIDBdO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGluY3JlbWVudCBhcmd1bWVudDogJyArIHJlbGVhc2UpO1xuICB9XG4gIHRoaXMuZm9ybWF0KCk7XG4gIHRoaXMucmF3ID0gdGhpcy52ZXJzaW9uO1xuICByZXR1cm4gdGhpcztcbn07XG5cbmV4cG9ydHMuaW5jID0gaW5jO1xuZnVuY3Rpb24gaW5jKHZlcnNpb24sIHJlbGVhc2UsIGxvb3NlLCBpZGVudGlmaWVyKSB7XG4gIGlmICh0eXBlb2YobG9vc2UpID09PSAnc3RyaW5nJykge1xuICAgIGlkZW50aWZpZXIgPSBsb29zZTtcbiAgICBsb29zZSA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIHRyeSB7XG4gICAgcmV0dXJuIG5ldyBTZW1WZXIodmVyc2lvbiwgbG9vc2UpLmluYyhyZWxlYXNlLCBpZGVudGlmaWVyKS52ZXJzaW9uO1xuICB9IGNhdGNoIChlcikge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbmV4cG9ydHMuZGlmZiA9IGRpZmY7XG5mdW5jdGlvbiBkaWZmKHZlcnNpb24xLCB2ZXJzaW9uMikge1xuICBpZiAoZXEodmVyc2lvbjEsIHZlcnNpb24yKSkge1xuICAgIHJldHVybiBudWxsO1xuICB9IGVsc2Uge1xuICAgIHZhciB2MSA9IHBhcnNlKHZlcnNpb24xKTtcbiAgICB2YXIgdjIgPSBwYXJzZSh2ZXJzaW9uMik7XG4gICAgaWYgKHYxLnByZXJlbGVhc2UubGVuZ3RoIHx8IHYyLnByZXJlbGVhc2UubGVuZ3RoKSB7XG4gICAgICBmb3IgKHZhciBrZXkgaW4gdjEpIHtcbiAgICAgICAgaWYgKGtleSA9PT0gJ21ham9yJyB8fCBrZXkgPT09ICdtaW5vcicgfHwga2V5ID09PSAncGF0Y2gnKSB7XG4gICAgICAgICAgaWYgKHYxW2tleV0gIT09IHYyW2tleV0pIHtcbiAgICAgICAgICAgIHJldHVybiAncHJlJytrZXk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gJ3ByZXJlbGVhc2UnO1xuICAgIH1cbiAgICBmb3IgKHZhciBrZXkgaW4gdjEpIHtcbiAgICAgIGlmIChrZXkgPT09ICdtYWpvcicgfHwga2V5ID09PSAnbWlub3InIHx8IGtleSA9PT0gJ3BhdGNoJykge1xuICAgICAgICBpZiAodjFba2V5XSAhPT0gdjJba2V5XSkge1xuICAgICAgICAgIHJldHVybiBrZXk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0cy5jb21wYXJlSWRlbnRpZmllcnMgPSBjb21wYXJlSWRlbnRpZmllcnM7XG5cbnZhciBudW1lcmljID0gL15bMC05XSskLztcbmZ1bmN0aW9uIGNvbXBhcmVJZGVudGlmaWVycyhhLCBiKSB7XG4gIHZhciBhbnVtID0gbnVtZXJpYy50ZXN0KGEpO1xuICB2YXIgYm51bSA9IG51bWVyaWMudGVzdChiKTtcblxuICBpZiAoYW51bSAmJiBibnVtKSB7XG4gICAgYSA9ICthO1xuICAgIGIgPSArYjtcbiAgfVxuXG4gIHJldHVybiAoYW51bSAmJiAhYm51bSkgPyAtMSA6XG4gICAgICAgICAoYm51bSAmJiAhYW51bSkgPyAxIDpcbiAgICAgICAgIGEgPCBiID8gLTEgOlxuICAgICAgICAgYSA+IGIgPyAxIDpcbiAgICAgICAgIDA7XG59XG5cbmV4cG9ydHMucmNvbXBhcmVJZGVudGlmaWVycyA9IHJjb21wYXJlSWRlbnRpZmllcnM7XG5mdW5jdGlvbiByY29tcGFyZUlkZW50aWZpZXJzKGEsIGIpIHtcbiAgcmV0dXJuIGNvbXBhcmVJZGVudGlmaWVycyhiLCBhKTtcbn1cblxuZXhwb3J0cy5tYWpvciA9IG1ham9yO1xuZnVuY3Rpb24gbWFqb3IoYSwgbG9vc2UpIHtcbiAgcmV0dXJuIG5ldyBTZW1WZXIoYSwgbG9vc2UpLm1ham9yO1xufVxuXG5leHBvcnRzLm1pbm9yID0gbWlub3I7XG5mdW5jdGlvbiBtaW5vcihhLCBsb29zZSkge1xuICByZXR1cm4gbmV3IFNlbVZlcihhLCBsb29zZSkubWlub3I7XG59XG5cbmV4cG9ydHMucGF0Y2ggPSBwYXRjaDtcbmZ1bmN0aW9uIHBhdGNoKGEsIGxvb3NlKSB7XG4gIHJldHVybiBuZXcgU2VtVmVyKGEsIGxvb3NlKS5wYXRjaDtcbn1cblxuZXhwb3J0cy5jb21wYXJlID0gY29tcGFyZTtcbmZ1bmN0aW9uIGNvbXBhcmUoYSwgYiwgbG9vc2UpIHtcbiAgcmV0dXJuIG5ldyBTZW1WZXIoYSwgbG9vc2UpLmNvbXBhcmUobmV3IFNlbVZlcihiLCBsb29zZSkpO1xufVxuXG5leHBvcnRzLmNvbXBhcmVMb29zZSA9IGNvbXBhcmVMb29zZTtcbmZ1bmN0aW9uIGNvbXBhcmVMb29zZShhLCBiKSB7XG4gIHJldHVybiBjb21wYXJlKGEsIGIsIHRydWUpO1xufVxuXG5leHBvcnRzLnJjb21wYXJlID0gcmNvbXBhcmU7XG5mdW5jdGlvbiByY29tcGFyZShhLCBiLCBsb29zZSkge1xuICByZXR1cm4gY29tcGFyZShiLCBhLCBsb29zZSk7XG59XG5cbmV4cG9ydHMuc29ydCA9IHNvcnQ7XG5mdW5jdGlvbiBzb3J0KGxpc3QsIGxvb3NlKSB7XG4gIHJldHVybiBsaXN0LnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgIHJldHVybiBleHBvcnRzLmNvbXBhcmUoYSwgYiwgbG9vc2UpO1xuICB9KTtcbn1cblxuZXhwb3J0cy5yc29ydCA9IHJzb3J0O1xuZnVuY3Rpb24gcnNvcnQobGlzdCwgbG9vc2UpIHtcbiAgcmV0dXJuIGxpc3Quc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgcmV0dXJuIGV4cG9ydHMucmNvbXBhcmUoYSwgYiwgbG9vc2UpO1xuICB9KTtcbn1cblxuZXhwb3J0cy5ndCA9IGd0O1xuZnVuY3Rpb24gZ3QoYSwgYiwgbG9vc2UpIHtcbiAgcmV0dXJuIGNvbXBhcmUoYSwgYiwgbG9vc2UpID4gMDtcbn1cblxuZXhwb3J0cy5sdCA9IGx0O1xuZnVuY3Rpb24gbHQoYSwgYiwgbG9vc2UpIHtcbiAgcmV0dXJuIGNvbXBhcmUoYSwgYiwgbG9vc2UpIDwgMDtcbn1cblxuZXhwb3J0cy5lcSA9IGVxO1xuZnVuY3Rpb24gZXEoYSwgYiwgbG9vc2UpIHtcbiAgcmV0dXJuIGNvbXBhcmUoYSwgYiwgbG9vc2UpID09PSAwO1xufVxuXG5leHBvcnRzLm5lcSA9IG5lcTtcbmZ1bmN0aW9uIG5lcShhLCBiLCBsb29zZSkge1xuICByZXR1cm4gY29tcGFyZShhLCBiLCBsb29zZSkgIT09IDA7XG59XG5cbmV4cG9ydHMuZ3RlID0gZ3RlO1xuZnVuY3Rpb24gZ3RlKGEsIGIsIGxvb3NlKSB7XG4gIHJldHVybiBjb21wYXJlKGEsIGIsIGxvb3NlKSA+PSAwO1xufVxuXG5leHBvcnRzLmx0ZSA9IGx0ZTtcbmZ1bmN0aW9uIGx0ZShhLCBiLCBsb29zZSkge1xuICByZXR1cm4gY29tcGFyZShhLCBiLCBsb29zZSkgPD0gMDtcbn1cblxuZXhwb3J0cy5jbXAgPSBjbXA7XG5mdW5jdGlvbiBjbXAoYSwgb3AsIGIsIGxvb3NlKSB7XG4gIHZhciByZXQ7XG4gIHN3aXRjaCAob3ApIHtcbiAgICBjYXNlICc9PT0nOlxuICAgICAgaWYgKHR5cGVvZiBhID09PSAnb2JqZWN0JykgYSA9IGEudmVyc2lvbjtcbiAgICAgIGlmICh0eXBlb2YgYiA9PT0gJ29iamVjdCcpIGIgPSBiLnZlcnNpb247XG4gICAgICByZXQgPSBhID09PSBiO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnIT09JzpcbiAgICAgIGlmICh0eXBlb2YgYSA9PT0gJ29iamVjdCcpIGEgPSBhLnZlcnNpb247XG4gICAgICBpZiAodHlwZW9mIGIgPT09ICdvYmplY3QnKSBiID0gYi52ZXJzaW9uO1xuICAgICAgcmV0ID0gYSAhPT0gYjtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJyc6IGNhc2UgJz0nOiBjYXNlICc9PSc6IHJldCA9IGVxKGEsIGIsIGxvb3NlKTsgYnJlYWs7XG4gICAgY2FzZSAnIT0nOiByZXQgPSBuZXEoYSwgYiwgbG9vc2UpOyBicmVhaztcbiAgICBjYXNlICc+JzogcmV0ID0gZ3QoYSwgYiwgbG9vc2UpOyBicmVhaztcbiAgICBjYXNlICc+PSc6IHJldCA9IGd0ZShhLCBiLCBsb29zZSk7IGJyZWFrO1xuICAgIGNhc2UgJzwnOiByZXQgPSBsdChhLCBiLCBsb29zZSk7IGJyZWFrO1xuICAgIGNhc2UgJzw9JzogcmV0ID0gbHRlKGEsIGIsIGxvb3NlKTsgYnJlYWs7XG4gICAgZGVmYXVsdDogdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBvcGVyYXRvcjogJyArIG9wKTtcbiAgfVxuICByZXR1cm4gcmV0O1xufVxuXG5leHBvcnRzLkNvbXBhcmF0b3IgPSBDb21wYXJhdG9yO1xuZnVuY3Rpb24gQ29tcGFyYXRvcihjb21wLCBvcHRpb25zKSB7XG4gIGlmICghb3B0aW9ucyB8fCB0eXBlb2Ygb3B0aW9ucyAhPT0gJ29iamVjdCcpXG4gICAgb3B0aW9ucyA9IHsgbG9vc2U6ICEhb3B0aW9ucywgaW5jbHVkZVByZXJlbGVhc2U6IGZhbHNlIH1cblxuICBpZiAoY29tcCBpbnN0YW5jZW9mIENvbXBhcmF0b3IpIHtcbiAgICBpZiAoY29tcC5sb29zZSA9PT0gISFvcHRpb25zLmxvb3NlKVxuICAgICAgcmV0dXJuIGNvbXA7XG4gICAgZWxzZVxuICAgICAgY29tcCA9IGNvbXAudmFsdWU7XG4gIH1cblxuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgQ29tcGFyYXRvcikpXG4gICAgcmV0dXJuIG5ldyBDb21wYXJhdG9yKGNvbXAsIG9wdGlvbnMpO1xuXG4gIGRlYnVnKCdjb21wYXJhdG9yJywgY29tcCwgb3B0aW9ucyk7XG4gIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gIHRoaXMubG9vc2UgPSAhIW9wdGlvbnMubG9vc2U7XG4gIHRoaXMucGFyc2UoY29tcCk7XG5cbiAgaWYgKHRoaXMuc2VtdmVyID09PSBBTlkpXG4gICAgdGhpcy52YWx1ZSA9ICcnO1xuICBlbHNlXG4gICAgdGhpcy52YWx1ZSA9IHRoaXMub3BlcmF0b3IgKyB0aGlzLnNlbXZlci52ZXJzaW9uO1xuXG4gIGRlYnVnKCdjb21wJywgdGhpcyk7XG59XG5cbnZhciBBTlkgPSB7fTtcbkNvbXBhcmF0b3IucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24oY29tcCkge1xuICB2YXIgciA9IHRoaXMub3B0aW9ucy5sb29zZSA/IHJlW0NPTVBBUkFUT1JMT09TRV0gOiByZVtDT01QQVJBVE9SXTtcbiAgdmFyIG0gPSBjb21wLm1hdGNoKHIpO1xuXG4gIGlmICghbSlcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIGNvbXBhcmF0b3I6ICcgKyBjb21wKTtcblxuICB0aGlzLm9wZXJhdG9yID0gbVsxXTtcbiAgaWYgKHRoaXMub3BlcmF0b3IgPT09ICc9JylcbiAgICB0aGlzLm9wZXJhdG9yID0gJyc7XG5cbiAgLy8gaWYgaXQgbGl0ZXJhbGx5IGlzIGp1c3QgJz4nIG9yICcnIHRoZW4gYWxsb3cgYW55dGhpbmcuXG4gIGlmICghbVsyXSlcbiAgICB0aGlzLnNlbXZlciA9IEFOWTtcbiAgZWxzZVxuICAgIHRoaXMuc2VtdmVyID0gbmV3IFNlbVZlcihtWzJdLCB0aGlzLm9wdGlvbnMubG9vc2UpO1xufTtcblxuQ29tcGFyYXRvci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMudmFsdWU7XG59O1xuXG5Db21wYXJhdG9yLnByb3RvdHlwZS50ZXN0ID0gZnVuY3Rpb24odmVyc2lvbikge1xuICBkZWJ1ZygnQ29tcGFyYXRvci50ZXN0JywgdmVyc2lvbiwgdGhpcy5vcHRpb25zLmxvb3NlKTtcblxuICBpZiAodGhpcy5zZW12ZXIgPT09IEFOWSlcbiAgICByZXR1cm4gdHJ1ZTtcblxuICBpZiAodHlwZW9mIHZlcnNpb24gPT09ICdzdHJpbmcnKVxuICAgIHZlcnNpb24gPSBuZXcgU2VtVmVyKHZlcnNpb24sIHRoaXMub3B0aW9ucyk7XG5cbiAgcmV0dXJuIGNtcCh2ZXJzaW9uLCB0aGlzLm9wZXJhdG9yLCB0aGlzLnNlbXZlciwgdGhpcy5vcHRpb25zKTtcbn07XG5cbkNvbXBhcmF0b3IucHJvdG90eXBlLmludGVyc2VjdHMgPSBmdW5jdGlvbihjb21wLCBvcHRpb25zKSB7XG4gIGlmICghKGNvbXAgaW5zdGFuY2VvZiBDb21wYXJhdG9yKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2EgQ29tcGFyYXRvciBpcyByZXF1aXJlZCcpO1xuICB9XG5cbiAgaWYgKCFvcHRpb25zIHx8IHR5cGVvZiBvcHRpb25zICE9PSAnb2JqZWN0JylcbiAgICBvcHRpb25zID0geyBsb29zZTogISFvcHRpb25zLCBpbmNsdWRlUHJlcmVsZWFzZTogZmFsc2UgfVxuXG4gIHZhciByYW5nZVRtcDtcblxuICBpZiAodGhpcy5vcGVyYXRvciA9PT0gJycpIHtcbiAgICByYW5nZVRtcCA9IG5ldyBSYW5nZShjb21wLnZhbHVlLCBvcHRpb25zKTtcbiAgICByZXR1cm4gc2F0aXNmaWVzKHRoaXMudmFsdWUsIHJhbmdlVG1wLCBvcHRpb25zKTtcbiAgfSBlbHNlIGlmIChjb21wLm9wZXJhdG9yID09PSAnJykge1xuICAgIHJhbmdlVG1wID0gbmV3IFJhbmdlKHRoaXMudmFsdWUsIG9wdGlvbnMpO1xuICAgIHJldHVybiBzYXRpc2ZpZXMoY29tcC5zZW12ZXIsIHJhbmdlVG1wLCBvcHRpb25zKTtcbiAgfVxuXG4gIHZhciBzYW1lRGlyZWN0aW9uSW5jcmVhc2luZyA9XG4gICAgKHRoaXMub3BlcmF0b3IgPT09ICc+PScgfHwgdGhpcy5vcGVyYXRvciA9PT0gJz4nKSAmJlxuICAgIChjb21wLm9wZXJhdG9yID09PSAnPj0nIHx8IGNvbXAub3BlcmF0b3IgPT09ICc+Jyk7XG4gIHZhciBzYW1lRGlyZWN0aW9uRGVjcmVhc2luZyA9XG4gICAgKHRoaXMub3BlcmF0b3IgPT09ICc8PScgfHwgdGhpcy5vcGVyYXRvciA9PT0gJzwnKSAmJlxuICAgIChjb21wLm9wZXJhdG9yID09PSAnPD0nIHx8IGNvbXAub3BlcmF0b3IgPT09ICc8Jyk7XG4gIHZhciBzYW1lU2VtVmVyID0gdGhpcy5zZW12ZXIudmVyc2lvbiA9PT0gY29tcC5zZW12ZXIudmVyc2lvbjtcbiAgdmFyIGRpZmZlcmVudERpcmVjdGlvbnNJbmNsdXNpdmUgPVxuICAgICh0aGlzLm9wZXJhdG9yID09PSAnPj0nIHx8IHRoaXMub3BlcmF0b3IgPT09ICc8PScpICYmXG4gICAgKGNvbXAub3BlcmF0b3IgPT09ICc+PScgfHwgY29tcC5vcGVyYXRvciA9PT0gJzw9Jyk7XG4gIHZhciBvcHBvc2l0ZURpcmVjdGlvbnNMZXNzVGhhbiA9XG4gICAgY21wKHRoaXMuc2VtdmVyLCAnPCcsIGNvbXAuc2VtdmVyLCBvcHRpb25zKSAmJlxuICAgICgodGhpcy5vcGVyYXRvciA9PT0gJz49JyB8fCB0aGlzLm9wZXJhdG9yID09PSAnPicpICYmXG4gICAgKGNvbXAub3BlcmF0b3IgPT09ICc8PScgfHwgY29tcC5vcGVyYXRvciA9PT0gJzwnKSk7XG4gIHZhciBvcHBvc2l0ZURpcmVjdGlvbnNHcmVhdGVyVGhhbiA9XG4gICAgY21wKHRoaXMuc2VtdmVyLCAnPicsIGNvbXAuc2VtdmVyLCBvcHRpb25zKSAmJlxuICAgICgodGhpcy5vcGVyYXRvciA9PT0gJzw9JyB8fCB0aGlzLm9wZXJhdG9yID09PSAnPCcpICYmXG4gICAgKGNvbXAub3BlcmF0b3IgPT09ICc+PScgfHwgY29tcC5vcGVyYXRvciA9PT0gJz4nKSk7XG5cbiAgcmV0dXJuIHNhbWVEaXJlY3Rpb25JbmNyZWFzaW5nIHx8IHNhbWVEaXJlY3Rpb25EZWNyZWFzaW5nIHx8XG4gICAgKHNhbWVTZW1WZXIgJiYgZGlmZmVyZW50RGlyZWN0aW9uc0luY2x1c2l2ZSkgfHxcbiAgICBvcHBvc2l0ZURpcmVjdGlvbnNMZXNzVGhhbiB8fCBvcHBvc2l0ZURpcmVjdGlvbnNHcmVhdGVyVGhhbjtcbn07XG5cblxuZXhwb3J0cy5SYW5nZSA9IFJhbmdlO1xuZnVuY3Rpb24gUmFuZ2UocmFuZ2UsIG9wdGlvbnMpIHtcbiAgaWYgKCFvcHRpb25zIHx8IHR5cGVvZiBvcHRpb25zICE9PSAnb2JqZWN0JylcbiAgICBvcHRpb25zID0geyBsb29zZTogISFvcHRpb25zLCBpbmNsdWRlUHJlcmVsZWFzZTogZmFsc2UgfVxuXG4gIGlmIChyYW5nZSBpbnN0YW5jZW9mIFJhbmdlKSB7XG4gICAgaWYgKHJhbmdlLmxvb3NlID09PSAhIW9wdGlvbnMubG9vc2UgJiZcbiAgICAgICAgcmFuZ2UuaW5jbHVkZVByZXJlbGVhc2UgPT09ICEhb3B0aW9ucy5pbmNsdWRlUHJlcmVsZWFzZSkge1xuICAgICAgcmV0dXJuIHJhbmdlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbmV3IFJhbmdlKHJhbmdlLnJhdywgb3B0aW9ucyk7XG4gICAgfVxuICB9XG5cbiAgaWYgKHJhbmdlIGluc3RhbmNlb2YgQ29tcGFyYXRvcikge1xuICAgIHJldHVybiBuZXcgUmFuZ2UocmFuZ2UudmFsdWUsIG9wdGlvbnMpO1xuICB9XG5cbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIFJhbmdlKSlcbiAgICByZXR1cm4gbmV3IFJhbmdlKHJhbmdlLCBvcHRpb25zKTtcblxuICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICB0aGlzLmxvb3NlID0gISFvcHRpb25zLmxvb3NlO1xuICB0aGlzLmluY2x1ZGVQcmVyZWxlYXNlID0gISFvcHRpb25zLmluY2x1ZGVQcmVyZWxlYXNlXG5cbiAgLy8gRmlyc3QsIHNwbGl0IGJhc2VkIG9uIGJvb2xlYW4gb3IgfHxcbiAgdGhpcy5yYXcgPSByYW5nZTtcbiAgdGhpcy5zZXQgPSByYW5nZS5zcGxpdCgvXFxzKlxcfFxcfFxccyovKS5tYXAoZnVuY3Rpb24ocmFuZ2UpIHtcbiAgICByZXR1cm4gdGhpcy5wYXJzZVJhbmdlKHJhbmdlLnRyaW0oKSk7XG4gIH0sIHRoaXMpLmZpbHRlcihmdW5jdGlvbihjKSB7XG4gICAgLy8gdGhyb3cgb3V0IGFueSB0aGF0IGFyZSBub3QgcmVsZXZhbnQgZm9yIHdoYXRldmVyIHJlYXNvblxuICAgIHJldHVybiBjLmxlbmd0aDtcbiAgfSk7XG5cbiAgaWYgKCF0aGlzLnNldC5sZW5ndGgpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIFNlbVZlciBSYW5nZTogJyArIHJhbmdlKTtcbiAgfVxuXG4gIHRoaXMuZm9ybWF0KCk7XG59XG5cblJhbmdlLnByb3RvdHlwZS5mb3JtYXQgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5yYW5nZSA9IHRoaXMuc2V0Lm1hcChmdW5jdGlvbihjb21wcykge1xuICAgIHJldHVybiBjb21wcy5qb2luKCcgJykudHJpbSgpO1xuICB9KS5qb2luKCd8fCcpLnRyaW0oKTtcbiAgcmV0dXJuIHRoaXMucmFuZ2U7XG59O1xuXG5SYW5nZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMucmFuZ2U7XG59O1xuXG5SYW5nZS5wcm90b3R5cGUucGFyc2VSYW5nZSA9IGZ1bmN0aW9uKHJhbmdlKSB7XG4gIHZhciBsb29zZSA9IHRoaXMub3B0aW9ucy5sb29zZTtcbiAgcmFuZ2UgPSByYW5nZS50cmltKCk7XG4gIC8vIGAxLjIuMyAtIDEuMi40YCA9PiBgPj0xLjIuMyA8PTEuMi40YFxuICB2YXIgaHIgPSBsb29zZSA/IHJlW0hZUEhFTlJBTkdFTE9PU0VdIDogcmVbSFlQSEVOUkFOR0VdO1xuICByYW5nZSA9IHJhbmdlLnJlcGxhY2UoaHIsIGh5cGhlblJlcGxhY2UpO1xuICBkZWJ1ZygnaHlwaGVuIHJlcGxhY2UnLCByYW5nZSk7XG4gIC8vIGA+IDEuMi4zIDwgMS4yLjVgID0+IGA+MS4yLjMgPDEuMi41YFxuICByYW5nZSA9IHJhbmdlLnJlcGxhY2UocmVbQ09NUEFSQVRPUlRSSU1dLCBjb21wYXJhdG9yVHJpbVJlcGxhY2UpO1xuICBkZWJ1ZygnY29tcGFyYXRvciB0cmltJywgcmFuZ2UsIHJlW0NPTVBBUkFUT1JUUklNXSk7XG5cbiAgLy8gYH4gMS4yLjNgID0+IGB+MS4yLjNgXG4gIHJhbmdlID0gcmFuZ2UucmVwbGFjZShyZVtUSUxERVRSSU1dLCB0aWxkZVRyaW1SZXBsYWNlKTtcblxuICAvLyBgXiAxLjIuM2AgPT4gYF4xLjIuM2BcbiAgcmFuZ2UgPSByYW5nZS5yZXBsYWNlKHJlW0NBUkVUVFJJTV0sIGNhcmV0VHJpbVJlcGxhY2UpO1xuXG4gIC8vIG5vcm1hbGl6ZSBzcGFjZXNcbiAgcmFuZ2UgPSByYW5nZS5zcGxpdCgvXFxzKy8pLmpvaW4oJyAnKTtcblxuICAvLyBBdCB0aGlzIHBvaW50LCB0aGUgcmFuZ2UgaXMgY29tcGxldGVseSB0cmltbWVkIGFuZFxuICAvLyByZWFkeSB0byBiZSBzcGxpdCBpbnRvIGNvbXBhcmF0b3JzLlxuXG4gIHZhciBjb21wUmUgPSBsb29zZSA/IHJlW0NPTVBBUkFUT1JMT09TRV0gOiByZVtDT01QQVJBVE9SXTtcbiAgdmFyIHNldCA9IHJhbmdlLnNwbGl0KCcgJykubWFwKGZ1bmN0aW9uKGNvbXApIHtcbiAgICByZXR1cm4gcGFyc2VDb21wYXJhdG9yKGNvbXAsIHRoaXMub3B0aW9ucyk7XG4gIH0sIHRoaXMpLmpvaW4oJyAnKS5zcGxpdCgvXFxzKy8pO1xuICBpZiAodGhpcy5vcHRpb25zLmxvb3NlKSB7XG4gICAgLy8gaW4gbG9vc2UgbW9kZSwgdGhyb3cgb3V0IGFueSB0aGF0IGFyZSBub3QgdmFsaWQgY29tcGFyYXRvcnNcbiAgICBzZXQgPSBzZXQuZmlsdGVyKGZ1bmN0aW9uKGNvbXApIHtcbiAgICAgIHJldHVybiAhIWNvbXAubWF0Y2goY29tcFJlKTtcbiAgICB9KTtcbiAgfVxuICBzZXQgPSBzZXQubWFwKGZ1bmN0aW9uKGNvbXApIHtcbiAgICByZXR1cm4gbmV3IENvbXBhcmF0b3IoY29tcCwgdGhpcy5vcHRpb25zKTtcbiAgfSwgdGhpcyk7XG5cbiAgcmV0dXJuIHNldDtcbn07XG5cblJhbmdlLnByb3RvdHlwZS5pbnRlcnNlY3RzID0gZnVuY3Rpb24ocmFuZ2UsIG9wdGlvbnMpIHtcbiAgaWYgKCEocmFuZ2UgaW5zdGFuY2VvZiBSYW5nZSkpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdhIFJhbmdlIGlzIHJlcXVpcmVkJyk7XG4gIH1cblxuICByZXR1cm4gdGhpcy5zZXQuc29tZShmdW5jdGlvbih0aGlzQ29tcGFyYXRvcnMpIHtcbiAgICByZXR1cm4gdGhpc0NvbXBhcmF0b3JzLmV2ZXJ5KGZ1bmN0aW9uKHRoaXNDb21wYXJhdG9yKSB7XG4gICAgICByZXR1cm4gcmFuZ2Uuc2V0LnNvbWUoZnVuY3Rpb24ocmFuZ2VDb21wYXJhdG9ycykge1xuICAgICAgICByZXR1cm4gcmFuZ2VDb21wYXJhdG9ycy5ldmVyeShmdW5jdGlvbihyYW5nZUNvbXBhcmF0b3IpIHtcbiAgICAgICAgICByZXR1cm4gdGhpc0NvbXBhcmF0b3IuaW50ZXJzZWN0cyhyYW5nZUNvbXBhcmF0b3IsIG9wdGlvbnMpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcbn07XG5cbi8vIE1vc3RseSBqdXN0IGZvciB0ZXN0aW5nIGFuZCBsZWdhY3kgQVBJIHJlYXNvbnNcbmV4cG9ydHMudG9Db21wYXJhdG9ycyA9IHRvQ29tcGFyYXRvcnM7XG5mdW5jdGlvbiB0b0NvbXBhcmF0b3JzKHJhbmdlLCBvcHRpb25zKSB7XG4gIHJldHVybiBuZXcgUmFuZ2UocmFuZ2UsIG9wdGlvbnMpLnNldC5tYXAoZnVuY3Rpb24oY29tcCkge1xuICAgIHJldHVybiBjb21wLm1hcChmdW5jdGlvbihjKSB7XG4gICAgICByZXR1cm4gYy52YWx1ZTtcbiAgICB9KS5qb2luKCcgJykudHJpbSgpLnNwbGl0KCcgJyk7XG4gIH0pO1xufVxuXG4vLyBjb21wcmlzZWQgb2YgeHJhbmdlcywgdGlsZGVzLCBzdGFycywgYW5kIGd0bHQncyBhdCB0aGlzIHBvaW50LlxuLy8gYWxyZWFkeSByZXBsYWNlZCB0aGUgaHlwaGVuIHJhbmdlc1xuLy8gdHVybiBpbnRvIGEgc2V0IG9mIEpVU1QgY29tcGFyYXRvcnMuXG5mdW5jdGlvbiBwYXJzZUNvbXBhcmF0b3IoY29tcCwgb3B0aW9ucykge1xuICBkZWJ1ZygnY29tcCcsIGNvbXAsIG9wdGlvbnMpO1xuICBjb21wID0gcmVwbGFjZUNhcmV0cyhjb21wLCBvcHRpb25zKTtcbiAgZGVidWcoJ2NhcmV0JywgY29tcCk7XG4gIGNvbXAgPSByZXBsYWNlVGlsZGVzKGNvbXAsIG9wdGlvbnMpO1xuICBkZWJ1ZygndGlsZGVzJywgY29tcCk7XG4gIGNvbXAgPSByZXBsYWNlWFJhbmdlcyhjb21wLCBvcHRpb25zKTtcbiAgZGVidWcoJ3hyYW5nZScsIGNvbXApO1xuICBjb21wID0gcmVwbGFjZVN0YXJzKGNvbXAsIG9wdGlvbnMpO1xuICBkZWJ1Zygnc3RhcnMnLCBjb21wKTtcbiAgcmV0dXJuIGNvbXA7XG59XG5cbmZ1bmN0aW9uIGlzWChpZCkge1xuICByZXR1cm4gIWlkIHx8IGlkLnRvTG93ZXJDYXNlKCkgPT09ICd4JyB8fCBpZCA9PT0gJyonO1xufVxuXG4vLyB+LCB+PiAtLT4gKiAoYW55LCBraW5kYSBzaWxseSlcbi8vIH4yLCB+Mi54LCB+Mi54LngsIH4+Miwgfj4yLnggfj4yLngueCAtLT4gPj0yLjAuMCA8My4wLjBcbi8vIH4yLjAsIH4yLjAueCwgfj4yLjAsIH4+Mi4wLnggLS0+ID49Mi4wLjAgPDIuMS4wXG4vLyB+MS4yLCB+MS4yLngsIH4+MS4yLCB+PjEuMi54IC0tPiA+PTEuMi4wIDwxLjMuMFxuLy8gfjEuMi4zLCB+PjEuMi4zIC0tPiA+PTEuMi4zIDwxLjMuMFxuLy8gfjEuMi4wLCB+PjEuMi4wIC0tPiA+PTEuMi4wIDwxLjMuMFxuZnVuY3Rpb24gcmVwbGFjZVRpbGRlcyhjb21wLCBvcHRpb25zKSB7XG4gIHJldHVybiBjb21wLnRyaW0oKS5zcGxpdCgvXFxzKy8pLm1hcChmdW5jdGlvbihjb21wKSB7XG4gICAgcmV0dXJuIHJlcGxhY2VUaWxkZShjb21wLCBvcHRpb25zKTtcbiAgfSkuam9pbignICcpO1xufVxuXG5mdW5jdGlvbiByZXBsYWNlVGlsZGUoY29tcCwgb3B0aW9ucykge1xuICBpZiAoIW9wdGlvbnMgfHwgdHlwZW9mIG9wdGlvbnMgIT09ICdvYmplY3QnKVxuICAgIG9wdGlvbnMgPSB7IGxvb3NlOiAhIW9wdGlvbnMsIGluY2x1ZGVQcmVyZWxlYXNlOiBmYWxzZSB9XG4gIHZhciByID0gb3B0aW9ucy5sb29zZSA/IHJlW1RJTERFTE9PU0VdIDogcmVbVElMREVdO1xuICByZXR1cm4gY29tcC5yZXBsYWNlKHIsIGZ1bmN0aW9uKF8sIE0sIG0sIHAsIHByKSB7XG4gICAgZGVidWcoJ3RpbGRlJywgY29tcCwgXywgTSwgbSwgcCwgcHIpO1xuICAgIHZhciByZXQ7XG5cbiAgICBpZiAoaXNYKE0pKVxuICAgICAgcmV0ID0gJyc7XG4gICAgZWxzZSBpZiAoaXNYKG0pKVxuICAgICAgcmV0ID0gJz49JyArIE0gKyAnLjAuMCA8JyArICgrTSArIDEpICsgJy4wLjAnO1xuICAgIGVsc2UgaWYgKGlzWChwKSlcbiAgICAgIC8vIH4xLjIgPT0gPj0xLjIuMCA8MS4zLjBcbiAgICAgIHJldCA9ICc+PScgKyBNICsgJy4nICsgbSArICcuMCA8JyArIE0gKyAnLicgKyAoK20gKyAxKSArICcuMCc7XG4gICAgZWxzZSBpZiAocHIpIHtcbiAgICAgIGRlYnVnKCdyZXBsYWNlVGlsZGUgcHInLCBwcik7XG4gICAgICBpZiAocHIuY2hhckF0KDApICE9PSAnLScpXG4gICAgICAgIHByID0gJy0nICsgcHI7XG4gICAgICByZXQgPSAnPj0nICsgTSArICcuJyArIG0gKyAnLicgKyBwICsgcHIgK1xuICAgICAgICAgICAgJyA8JyArIE0gKyAnLicgKyAoK20gKyAxKSArICcuMCc7XG4gICAgfSBlbHNlXG4gICAgICAvLyB+MS4yLjMgPT0gPj0xLjIuMyA8MS4zLjBcbiAgICAgIHJldCA9ICc+PScgKyBNICsgJy4nICsgbSArICcuJyArIHAgK1xuICAgICAgICAgICAgJyA8JyArIE0gKyAnLicgKyAoK20gKyAxKSArICcuMCc7XG5cbiAgICBkZWJ1ZygndGlsZGUgcmV0dXJuJywgcmV0KTtcbiAgICByZXR1cm4gcmV0O1xuICB9KTtcbn1cblxuLy8gXiAtLT4gKiAoYW55LCBraW5kYSBzaWxseSlcbi8vIF4yLCBeMi54LCBeMi54LnggLS0+ID49Mi4wLjAgPDMuMC4wXG4vLyBeMi4wLCBeMi4wLnggLS0+ID49Mi4wLjAgPDMuMC4wXG4vLyBeMS4yLCBeMS4yLnggLS0+ID49MS4yLjAgPDIuMC4wXG4vLyBeMS4yLjMgLS0+ID49MS4yLjMgPDIuMC4wXG4vLyBeMS4yLjAgLS0+ID49MS4yLjAgPDIuMC4wXG5mdW5jdGlvbiByZXBsYWNlQ2FyZXRzKGNvbXAsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIGNvbXAudHJpbSgpLnNwbGl0KC9cXHMrLykubWFwKGZ1bmN0aW9uKGNvbXApIHtcbiAgICByZXR1cm4gcmVwbGFjZUNhcmV0KGNvbXAsIG9wdGlvbnMpO1xuICB9KS5qb2luKCcgJyk7XG59XG5cbmZ1bmN0aW9uIHJlcGxhY2VDYXJldChjb21wLCBvcHRpb25zKSB7XG4gIGRlYnVnKCdjYXJldCcsIGNvbXAsIG9wdGlvbnMpO1xuICBpZiAoIW9wdGlvbnMgfHwgdHlwZW9mIG9wdGlvbnMgIT09ICdvYmplY3QnKVxuICAgIG9wdGlvbnMgPSB7IGxvb3NlOiAhIW9wdGlvbnMsIGluY2x1ZGVQcmVyZWxlYXNlOiBmYWxzZSB9XG4gIHZhciByID0gb3B0aW9ucy5sb29zZSA/IHJlW0NBUkVUTE9PU0VdIDogcmVbQ0FSRVRdO1xuICByZXR1cm4gY29tcC5yZXBsYWNlKHIsIGZ1bmN0aW9uKF8sIE0sIG0sIHAsIHByKSB7XG4gICAgZGVidWcoJ2NhcmV0JywgY29tcCwgXywgTSwgbSwgcCwgcHIpO1xuICAgIHZhciByZXQ7XG5cbiAgICBpZiAoaXNYKE0pKVxuICAgICAgcmV0ID0gJyc7XG4gICAgZWxzZSBpZiAoaXNYKG0pKVxuICAgICAgcmV0ID0gJz49JyArIE0gKyAnLjAuMCA8JyArICgrTSArIDEpICsgJy4wLjAnO1xuICAgIGVsc2UgaWYgKGlzWChwKSkge1xuICAgICAgaWYgKE0gPT09ICcwJylcbiAgICAgICAgcmV0ID0gJz49JyArIE0gKyAnLicgKyBtICsgJy4wIDwnICsgTSArICcuJyArICgrbSArIDEpICsgJy4wJztcbiAgICAgIGVsc2VcbiAgICAgICAgcmV0ID0gJz49JyArIE0gKyAnLicgKyBtICsgJy4wIDwnICsgKCtNICsgMSkgKyAnLjAuMCc7XG4gICAgfSBlbHNlIGlmIChwcikge1xuICAgICAgZGVidWcoJ3JlcGxhY2VDYXJldCBwcicsIHByKTtcbiAgICAgIGlmIChwci5jaGFyQXQoMCkgIT09ICctJylcbiAgICAgICAgcHIgPSAnLScgKyBwcjtcbiAgICAgIGlmIChNID09PSAnMCcpIHtcbiAgICAgICAgaWYgKG0gPT09ICcwJylcbiAgICAgICAgICByZXQgPSAnPj0nICsgTSArICcuJyArIG0gKyAnLicgKyBwICsgcHIgK1xuICAgICAgICAgICAgICAgICcgPCcgKyBNICsgJy4nICsgbSArICcuJyArICgrcCArIDEpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgcmV0ID0gJz49JyArIE0gKyAnLicgKyBtICsgJy4nICsgcCArIHByICtcbiAgICAgICAgICAgICAgICAnIDwnICsgTSArICcuJyArICgrbSArIDEpICsgJy4wJztcbiAgICAgIH0gZWxzZVxuICAgICAgICByZXQgPSAnPj0nICsgTSArICcuJyArIG0gKyAnLicgKyBwICsgcHIgK1xuICAgICAgICAgICAgICAnIDwnICsgKCtNICsgMSkgKyAnLjAuMCc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlYnVnKCdubyBwcicpO1xuICAgICAgaWYgKE0gPT09ICcwJykge1xuICAgICAgICBpZiAobSA9PT0gJzAnKVxuICAgICAgICAgIHJldCA9ICc+PScgKyBNICsgJy4nICsgbSArICcuJyArIHAgK1xuICAgICAgICAgICAgICAgICcgPCcgKyBNICsgJy4nICsgbSArICcuJyArICgrcCArIDEpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgcmV0ID0gJz49JyArIE0gKyAnLicgKyBtICsgJy4nICsgcCArXG4gICAgICAgICAgICAgICAgJyA8JyArIE0gKyAnLicgKyAoK20gKyAxKSArICcuMCc7XG4gICAgICB9IGVsc2VcbiAgICAgICAgcmV0ID0gJz49JyArIE0gKyAnLicgKyBtICsgJy4nICsgcCArXG4gICAgICAgICAgICAgICcgPCcgKyAoK00gKyAxKSArICcuMC4wJztcbiAgICB9XG5cbiAgICBkZWJ1ZygnY2FyZXQgcmV0dXJuJywgcmV0KTtcbiAgICByZXR1cm4gcmV0O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gcmVwbGFjZVhSYW5nZXMoY29tcCwgb3B0aW9ucykge1xuICBkZWJ1ZygncmVwbGFjZVhSYW5nZXMnLCBjb21wLCBvcHRpb25zKTtcbiAgcmV0dXJuIGNvbXAuc3BsaXQoL1xccysvKS5tYXAoZnVuY3Rpb24oY29tcCkge1xuICAgIHJldHVybiByZXBsYWNlWFJhbmdlKGNvbXAsIG9wdGlvbnMpO1xuICB9KS5qb2luKCcgJyk7XG59XG5cbmZ1bmN0aW9uIHJlcGxhY2VYUmFuZ2UoY29tcCwgb3B0aW9ucykge1xuICBjb21wID0gY29tcC50cmltKCk7XG4gIGlmICghb3B0aW9ucyB8fCB0eXBlb2Ygb3B0aW9ucyAhPT0gJ29iamVjdCcpXG4gICAgb3B0aW9ucyA9IHsgbG9vc2U6ICEhb3B0aW9ucywgaW5jbHVkZVByZXJlbGVhc2U6IGZhbHNlIH1cbiAgdmFyIHIgPSBvcHRpb25zLmxvb3NlID8gcmVbWFJBTkdFTE9PU0VdIDogcmVbWFJBTkdFXTtcbiAgcmV0dXJuIGNvbXAucmVwbGFjZShyLCBmdW5jdGlvbihyZXQsIGd0bHQsIE0sIG0sIHAsIHByKSB7XG4gICAgZGVidWcoJ3hSYW5nZScsIGNvbXAsIHJldCwgZ3RsdCwgTSwgbSwgcCwgcHIpO1xuICAgIHZhciB4TSA9IGlzWChNKTtcbiAgICB2YXIgeG0gPSB4TSB8fCBpc1gobSk7XG4gICAgdmFyIHhwID0geG0gfHwgaXNYKHApO1xuICAgIHZhciBhbnlYID0geHA7XG5cbiAgICBpZiAoZ3RsdCA9PT0gJz0nICYmIGFueVgpXG4gICAgICBndGx0ID0gJyc7XG5cbiAgICBpZiAoeE0pIHtcbiAgICAgIGlmIChndGx0ID09PSAnPicgfHwgZ3RsdCA9PT0gJzwnKSB7XG4gICAgICAgIC8vIG5vdGhpbmcgaXMgYWxsb3dlZFxuICAgICAgICByZXQgPSAnPDAuMC4wJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIG5vdGhpbmcgaXMgZm9yYmlkZGVuXG4gICAgICAgIHJldCA9ICcqJztcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGd0bHQgJiYgYW55WCkge1xuICAgICAgLy8gcmVwbGFjZSBYIHdpdGggMFxuICAgICAgaWYgKHhtKVxuICAgICAgICBtID0gMDtcbiAgICAgIGlmICh4cClcbiAgICAgICAgcCA9IDA7XG5cbiAgICAgIGlmIChndGx0ID09PSAnPicpIHtcbiAgICAgICAgLy8gPjEgPT4gPj0yLjAuMFxuICAgICAgICAvLyA+MS4yID0+ID49MS4zLjBcbiAgICAgICAgLy8gPjEuMi4zID0+ID49IDEuMi40XG4gICAgICAgIGd0bHQgPSAnPj0nO1xuICAgICAgICBpZiAoeG0pIHtcbiAgICAgICAgICBNID0gK00gKyAxO1xuICAgICAgICAgIG0gPSAwO1xuICAgICAgICAgIHAgPSAwO1xuICAgICAgICB9IGVsc2UgaWYgKHhwKSB7XG4gICAgICAgICAgbSA9ICttICsgMTtcbiAgICAgICAgICBwID0gMDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChndGx0ID09PSAnPD0nKSB7XG4gICAgICAgIC8vIDw9MC43LnggaXMgYWN0dWFsbHkgPDAuOC4wLCBzaW5jZSBhbnkgMC43Lnggc2hvdWxkXG4gICAgICAgIC8vIHBhc3MuICBTaW1pbGFybHksIDw9Ny54IGlzIGFjdHVhbGx5IDw4LjAuMCwgZXRjLlxuICAgICAgICBndGx0ID0gJzwnO1xuICAgICAgICBpZiAoeG0pXG4gICAgICAgICAgTSA9ICtNICsgMTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIG0gPSArbSArIDE7XG4gICAgICB9XG5cbiAgICAgIHJldCA9IGd0bHQgKyBNICsgJy4nICsgbSArICcuJyArIHA7XG4gICAgfSBlbHNlIGlmICh4bSkge1xuICAgICAgcmV0ID0gJz49JyArIE0gKyAnLjAuMCA8JyArICgrTSArIDEpICsgJy4wLjAnO1xuICAgIH0gZWxzZSBpZiAoeHApIHtcbiAgICAgIHJldCA9ICc+PScgKyBNICsgJy4nICsgbSArICcuMCA8JyArIE0gKyAnLicgKyAoK20gKyAxKSArICcuMCc7XG4gICAgfVxuXG4gICAgZGVidWcoJ3hSYW5nZSByZXR1cm4nLCByZXQpO1xuXG4gICAgcmV0dXJuIHJldDtcbiAgfSk7XG59XG5cbi8vIEJlY2F1c2UgKiBpcyBBTkQtZWQgd2l0aCBldmVyeXRoaW5nIGVsc2UgaW4gdGhlIGNvbXBhcmF0b3IsXG4vLyBhbmQgJycgbWVhbnMgXCJhbnkgdmVyc2lvblwiLCBqdXN0IHJlbW92ZSB0aGUgKnMgZW50aXJlbHkuXG5mdW5jdGlvbiByZXBsYWNlU3RhcnMoY29tcCwgb3B0aW9ucykge1xuICBkZWJ1ZygncmVwbGFjZVN0YXJzJywgY29tcCwgb3B0aW9ucyk7XG4gIC8vIExvb3NlbmVzcyBpcyBpZ25vcmVkIGhlcmUuICBzdGFyIGlzIGFsd2F5cyBhcyBsb29zZSBhcyBpdCBnZXRzIVxuICByZXR1cm4gY29tcC50cmltKCkucmVwbGFjZShyZVtTVEFSXSwgJycpO1xufVxuXG4vLyBUaGlzIGZ1bmN0aW9uIGlzIHBhc3NlZCB0byBzdHJpbmcucmVwbGFjZShyZVtIWVBIRU5SQU5HRV0pXG4vLyBNLCBtLCBwYXRjaCwgcHJlcmVsZWFzZSwgYnVpbGRcbi8vIDEuMiAtIDMuNC41ID0+ID49MS4yLjAgPD0zLjQuNVxuLy8gMS4yLjMgLSAzLjQgPT4gPj0xLjIuMCA8My41LjAgQW55IDMuNC54IHdpbGwgZG9cbi8vIDEuMiAtIDMuNCA9PiA+PTEuMi4wIDwzLjUuMFxuZnVuY3Rpb24gaHlwaGVuUmVwbGFjZSgkMCxcbiAgICAgICAgICAgICAgICAgICAgICAgZnJvbSwgZk0sIGZtLCBmcCwgZnByLCBmYixcbiAgICAgICAgICAgICAgICAgICAgICAgdG8sIHRNLCB0bSwgdHAsIHRwciwgdGIpIHtcblxuICBpZiAoaXNYKGZNKSlcbiAgICBmcm9tID0gJyc7XG4gIGVsc2UgaWYgKGlzWChmbSkpXG4gICAgZnJvbSA9ICc+PScgKyBmTSArICcuMC4wJztcbiAgZWxzZSBpZiAoaXNYKGZwKSlcbiAgICBmcm9tID0gJz49JyArIGZNICsgJy4nICsgZm0gKyAnLjAnO1xuICBlbHNlXG4gICAgZnJvbSA9ICc+PScgKyBmcm9tO1xuXG4gIGlmIChpc1godE0pKVxuICAgIHRvID0gJyc7XG4gIGVsc2UgaWYgKGlzWCh0bSkpXG4gICAgdG8gPSAnPCcgKyAoK3RNICsgMSkgKyAnLjAuMCc7XG4gIGVsc2UgaWYgKGlzWCh0cCkpXG4gICAgdG8gPSAnPCcgKyB0TSArICcuJyArICgrdG0gKyAxKSArICcuMCc7XG4gIGVsc2UgaWYgKHRwcilcbiAgICB0byA9ICc8PScgKyB0TSArICcuJyArIHRtICsgJy4nICsgdHAgKyAnLScgKyB0cHI7XG4gIGVsc2VcbiAgICB0byA9ICc8PScgKyB0bztcblxuICByZXR1cm4gKGZyb20gKyAnICcgKyB0bykudHJpbSgpO1xufVxuXG5cbi8vIGlmIEFOWSBvZiB0aGUgc2V0cyBtYXRjaCBBTEwgb2YgaXRzIGNvbXBhcmF0b3JzLCB0aGVuIHBhc3NcblJhbmdlLnByb3RvdHlwZS50ZXN0ID0gZnVuY3Rpb24odmVyc2lvbikge1xuICBpZiAoIXZlcnNpb24pXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIGlmICh0eXBlb2YgdmVyc2lvbiA9PT0gJ3N0cmluZycpXG4gICAgdmVyc2lvbiA9IG5ldyBTZW1WZXIodmVyc2lvbiwgdGhpcy5vcHRpb25zKTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuc2V0Lmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHRlc3RTZXQodGhpcy5zZXRbaV0sIHZlcnNpb24sIHRoaXMub3B0aW9ucykpXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59O1xuXG5mdW5jdGlvbiB0ZXN0U2V0KHNldCwgdmVyc2lvbiwgb3B0aW9ucykge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHNldC5sZW5ndGg7IGkrKykge1xuICAgIGlmICghc2V0W2ldLnRlc3QodmVyc2lvbikpXG4gICAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoIW9wdGlvbnMpXG4gICAgb3B0aW9ucyA9IHt9XG5cbiAgaWYgKHZlcnNpb24ucHJlcmVsZWFzZS5sZW5ndGggJiYgIW9wdGlvbnMuaW5jbHVkZVByZXJlbGVhc2UpIHtcbiAgICAvLyBGaW5kIHRoZSBzZXQgb2YgdmVyc2lvbnMgdGhhdCBhcmUgYWxsb3dlZCB0byBoYXZlIHByZXJlbGVhc2VzXG4gICAgLy8gRm9yIGV4YW1wbGUsIF4xLjIuMy1wci4xIGRlc3VnYXJzIHRvID49MS4yLjMtcHIuMSA8Mi4wLjBcbiAgICAvLyBUaGF0IHNob3VsZCBhbGxvdyBgMS4yLjMtcHIuMmAgdG8gcGFzcy5cbiAgICAvLyBIb3dldmVyLCBgMS4yLjQtYWxwaGEubm90cmVhZHlgIHNob3VsZCBOT1QgYmUgYWxsb3dlZCxcbiAgICAvLyBldmVuIHRob3VnaCBpdCdzIHdpdGhpbiB0aGUgcmFuZ2Ugc2V0IGJ5IHRoZSBjb21wYXJhdG9ycy5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNldC5sZW5ndGg7IGkrKykge1xuICAgICAgZGVidWcoc2V0W2ldLnNlbXZlcik7XG4gICAgICBpZiAoc2V0W2ldLnNlbXZlciA9PT0gQU5ZKVxuICAgICAgICBjb250aW51ZTtcblxuICAgICAgaWYgKHNldFtpXS5zZW12ZXIucHJlcmVsZWFzZS5sZW5ndGggPiAwKSB7XG4gICAgICAgIHZhciBhbGxvd2VkID0gc2V0W2ldLnNlbXZlcjtcbiAgICAgICAgaWYgKGFsbG93ZWQubWFqb3IgPT09IHZlcnNpb24ubWFqb3IgJiZcbiAgICAgICAgICAgIGFsbG93ZWQubWlub3IgPT09IHZlcnNpb24ubWlub3IgJiZcbiAgICAgICAgICAgIGFsbG93ZWQucGF0Y2ggPT09IHZlcnNpb24ucGF0Y2gpXG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gVmVyc2lvbiBoYXMgYSAtcHJlLCBidXQgaXQncyBub3Qgb25lIG9mIHRoZSBvbmVzIHdlIGxpa2UuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cbmV4cG9ydHMuc2F0aXNmaWVzID0gc2F0aXNmaWVzO1xuZnVuY3Rpb24gc2F0aXNmaWVzKHZlcnNpb24sIHJhbmdlLCBvcHRpb25zKSB7XG4gIHRyeSB7XG4gICAgcmFuZ2UgPSBuZXcgUmFuZ2UocmFuZ2UsIG9wdGlvbnMpO1xuICB9IGNhdGNoIChlcikge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gcmFuZ2UudGVzdCh2ZXJzaW9uKTtcbn1cblxuZXhwb3J0cy5tYXhTYXRpc2Z5aW5nID0gbWF4U2F0aXNmeWluZztcbmZ1bmN0aW9uIG1heFNhdGlzZnlpbmcodmVyc2lvbnMsIHJhbmdlLCBvcHRpb25zKSB7XG4gIHZhciBtYXggPSBudWxsO1xuICB2YXIgbWF4U1YgPSBudWxsO1xuICB0cnkge1xuICAgIHZhciByYW5nZU9iaiA9IG5ldyBSYW5nZShyYW5nZSwgb3B0aW9ucyk7XG4gIH0gY2F0Y2ggKGVyKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmVyc2lvbnMuZm9yRWFjaChmdW5jdGlvbiAodikge1xuICAgIGlmIChyYW5nZU9iai50ZXN0KHYpKSB7IC8vIHNhdGlzZmllcyh2LCByYW5nZSwgb3B0aW9ucylcbiAgICAgIGlmICghbWF4IHx8IG1heFNWLmNvbXBhcmUodikgPT09IC0xKSB7IC8vIGNvbXBhcmUobWF4LCB2LCB0cnVlKVxuICAgICAgICBtYXggPSB2O1xuICAgICAgICBtYXhTViA9IG5ldyBTZW1WZXIobWF4LCBvcHRpb25zKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pXG4gIHJldHVybiBtYXg7XG59XG5cbmV4cG9ydHMubWluU2F0aXNmeWluZyA9IG1pblNhdGlzZnlpbmc7XG5mdW5jdGlvbiBtaW5TYXRpc2Z5aW5nKHZlcnNpb25zLCByYW5nZSwgb3B0aW9ucykge1xuICB2YXIgbWluID0gbnVsbDtcbiAgdmFyIG1pblNWID0gbnVsbDtcbiAgdHJ5IHtcbiAgICB2YXIgcmFuZ2VPYmogPSBuZXcgUmFuZ2UocmFuZ2UsIG9wdGlvbnMpO1xuICB9IGNhdGNoIChlcikge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZlcnNpb25zLmZvckVhY2goZnVuY3Rpb24gKHYpIHtcbiAgICBpZiAocmFuZ2VPYmoudGVzdCh2KSkgeyAvLyBzYXRpc2ZpZXModiwgcmFuZ2UsIG9wdGlvbnMpXG4gICAgICBpZiAoIW1pbiB8fCBtaW5TVi5jb21wYXJlKHYpID09PSAxKSB7IC8vIGNvbXBhcmUobWluLCB2LCB0cnVlKVxuICAgICAgICBtaW4gPSB2O1xuICAgICAgICBtaW5TViA9IG5ldyBTZW1WZXIobWluLCBvcHRpb25zKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pXG4gIHJldHVybiBtaW47XG59XG5cbmV4cG9ydHMudmFsaWRSYW5nZSA9IHZhbGlkUmFuZ2U7XG5mdW5jdGlvbiB2YWxpZFJhbmdlKHJhbmdlLCBvcHRpb25zKSB7XG4gIHRyeSB7XG4gICAgLy8gUmV0dXJuICcqJyBpbnN0ZWFkIG9mICcnIHNvIHRoYXQgdHJ1dGhpbmVzcyB3b3Jrcy5cbiAgICAvLyBUaGlzIHdpbGwgdGhyb3cgaWYgaXQncyBpbnZhbGlkIGFueXdheVxuICAgIHJldHVybiBuZXcgUmFuZ2UocmFuZ2UsIG9wdGlvbnMpLnJhbmdlIHx8ICcqJztcbiAgfSBjYXRjaCAoZXIpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG4vLyBEZXRlcm1pbmUgaWYgdmVyc2lvbiBpcyBsZXNzIHRoYW4gYWxsIHRoZSB2ZXJzaW9ucyBwb3NzaWJsZSBpbiB0aGUgcmFuZ2VcbmV4cG9ydHMubHRyID0gbHRyO1xuZnVuY3Rpb24gbHRyKHZlcnNpb24sIHJhbmdlLCBvcHRpb25zKSB7XG4gIHJldHVybiBvdXRzaWRlKHZlcnNpb24sIHJhbmdlLCAnPCcsIG9wdGlvbnMpO1xufVxuXG4vLyBEZXRlcm1pbmUgaWYgdmVyc2lvbiBpcyBncmVhdGVyIHRoYW4gYWxsIHRoZSB2ZXJzaW9ucyBwb3NzaWJsZSBpbiB0aGUgcmFuZ2UuXG5leHBvcnRzLmd0ciA9IGd0cjtcbmZ1bmN0aW9uIGd0cih2ZXJzaW9uLCByYW5nZSwgb3B0aW9ucykge1xuICByZXR1cm4gb3V0c2lkZSh2ZXJzaW9uLCByYW5nZSwgJz4nLCBvcHRpb25zKTtcbn1cblxuZXhwb3J0cy5vdXRzaWRlID0gb3V0c2lkZTtcbmZ1bmN0aW9uIG91dHNpZGUodmVyc2lvbiwgcmFuZ2UsIGhpbG8sIG9wdGlvbnMpIHtcbiAgdmVyc2lvbiA9IG5ldyBTZW1WZXIodmVyc2lvbiwgb3B0aW9ucyk7XG4gIHJhbmdlID0gbmV3IFJhbmdlKHJhbmdlLCBvcHRpb25zKTtcblxuICB2YXIgZ3RmbiwgbHRlZm4sIGx0Zm4sIGNvbXAsIGVjb21wO1xuICBzd2l0Y2ggKGhpbG8pIHtcbiAgICBjYXNlICc+JzpcbiAgICAgIGd0Zm4gPSBndDtcbiAgICAgIGx0ZWZuID0gbHRlO1xuICAgICAgbHRmbiA9IGx0O1xuICAgICAgY29tcCA9ICc+JztcbiAgICAgIGVjb21wID0gJz49JztcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJzwnOlxuICAgICAgZ3RmbiA9IGx0O1xuICAgICAgbHRlZm4gPSBndGU7XG4gICAgICBsdGZuID0gZ3Q7XG4gICAgICBjb21wID0gJzwnO1xuICAgICAgZWNvbXAgPSAnPD0nO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ011c3QgcHJvdmlkZSBhIGhpbG8gdmFsIG9mIFwiPFwiIG9yIFwiPlwiJyk7XG4gIH1cblxuICAvLyBJZiBpdCBzYXRpc2lmZXMgdGhlIHJhbmdlIGl0IGlzIG5vdCBvdXRzaWRlXG4gIGlmIChzYXRpc2ZpZXModmVyc2lvbiwgcmFuZ2UsIG9wdGlvbnMpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gRnJvbSBub3cgb24sIHZhcmlhYmxlIHRlcm1zIGFyZSBhcyBpZiB3ZSdyZSBpbiBcImd0clwiIG1vZGUuXG4gIC8vIGJ1dCBub3RlIHRoYXQgZXZlcnl0aGluZyBpcyBmbGlwcGVkIGZvciB0aGUgXCJsdHJcIiBmdW5jdGlvbi5cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHJhbmdlLnNldC5sZW5ndGg7ICsraSkge1xuICAgIHZhciBjb21wYXJhdG9ycyA9IHJhbmdlLnNldFtpXTtcblxuICAgIHZhciBoaWdoID0gbnVsbDtcbiAgICB2YXIgbG93ID0gbnVsbDtcblxuICAgIGNvbXBhcmF0b3JzLmZvckVhY2goZnVuY3Rpb24oY29tcGFyYXRvcikge1xuICAgICAgaWYgKGNvbXBhcmF0b3Iuc2VtdmVyID09PSBBTlkpIHtcbiAgICAgICAgY29tcGFyYXRvciA9IG5ldyBDb21wYXJhdG9yKCc+PTAuMC4wJylcbiAgICAgIH1cbiAgICAgIGhpZ2ggPSBoaWdoIHx8IGNvbXBhcmF0b3I7XG4gICAgICBsb3cgPSBsb3cgfHwgY29tcGFyYXRvcjtcbiAgICAgIGlmIChndGZuKGNvbXBhcmF0b3Iuc2VtdmVyLCBoaWdoLnNlbXZlciwgb3B0aW9ucykpIHtcbiAgICAgICAgaGlnaCA9IGNvbXBhcmF0b3I7XG4gICAgICB9IGVsc2UgaWYgKGx0Zm4oY29tcGFyYXRvci5zZW12ZXIsIGxvdy5zZW12ZXIsIG9wdGlvbnMpKSB7XG4gICAgICAgIGxvdyA9IGNvbXBhcmF0b3I7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBJZiB0aGUgZWRnZSB2ZXJzaW9uIGNvbXBhcmF0b3IgaGFzIGEgb3BlcmF0b3IgdGhlbiBvdXIgdmVyc2lvblxuICAgIC8vIGlzbid0IG91dHNpZGUgaXRcbiAgICBpZiAoaGlnaC5vcGVyYXRvciA9PT0gY29tcCB8fCBoaWdoLm9wZXJhdG9yID09PSBlY29tcCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIElmIHRoZSBsb3dlc3QgdmVyc2lvbiBjb21wYXJhdG9yIGhhcyBhbiBvcGVyYXRvciBhbmQgb3VyIHZlcnNpb25cbiAgICAvLyBpcyBsZXNzIHRoYW4gaXQgdGhlbiBpdCBpc24ndCBoaWdoZXIgdGhhbiB0aGUgcmFuZ2VcbiAgICBpZiAoKCFsb3cub3BlcmF0b3IgfHwgbG93Lm9wZXJhdG9yID09PSBjb21wKSAmJlxuICAgICAgICBsdGVmbih2ZXJzaW9uLCBsb3cuc2VtdmVyKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gZWxzZSBpZiAobG93Lm9wZXJhdG9yID09PSBlY29tcCAmJiBsdGZuKHZlcnNpb24sIGxvdy5zZW12ZXIpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG5leHBvcnRzLnByZXJlbGVhc2UgPSBwcmVyZWxlYXNlO1xuZnVuY3Rpb24gcHJlcmVsZWFzZSh2ZXJzaW9uLCBvcHRpb25zKSB7XG4gIHZhciBwYXJzZWQgPSBwYXJzZSh2ZXJzaW9uLCBvcHRpb25zKTtcbiAgcmV0dXJuIChwYXJzZWQgJiYgcGFyc2VkLnByZXJlbGVhc2UubGVuZ3RoKSA/IHBhcnNlZC5wcmVyZWxlYXNlIDogbnVsbDtcbn1cblxuZXhwb3J0cy5pbnRlcnNlY3RzID0gaW50ZXJzZWN0cztcbmZ1bmN0aW9uIGludGVyc2VjdHMocjEsIHIyLCBvcHRpb25zKSB7XG4gIHIxID0gbmV3IFJhbmdlKHIxLCBvcHRpb25zKVxuICByMiA9IG5ldyBSYW5nZShyMiwgb3B0aW9ucylcbiAgcmV0dXJuIHIxLmludGVyc2VjdHMocjIpXG59XG5cbmV4cG9ydHMuY29lcmNlID0gY29lcmNlO1xuZnVuY3Rpb24gY29lcmNlKHZlcnNpb24pIHtcbiAgaWYgKHZlcnNpb24gaW5zdGFuY2VvZiBTZW1WZXIpXG4gICAgcmV0dXJuIHZlcnNpb247XG5cbiAgaWYgKHR5cGVvZiB2ZXJzaW9uICE9PSAnc3RyaW5nJylcbiAgICByZXR1cm4gbnVsbDtcblxuICB2YXIgbWF0Y2ggPSB2ZXJzaW9uLm1hdGNoKHJlW0NPRVJDRV0pO1xuXG4gIGlmIChtYXRjaCA9PSBudWxsKVxuICAgIHJldHVybiBudWxsO1xuXG4gIHJldHVybiBwYXJzZSgobWF0Y2hbMV0gfHwgJzAnKSArICcuJyArIChtYXRjaFsyXSB8fCAnMCcpICsgJy4nICsgKG1hdGNoWzNdIHx8ICcwJykpOyBcbn1cbiIsIi8vIEBmbG93XG5pbXBvcnQgVnVlIGZyb20gJ3Z1ZSdcbmltcG9ydCBzZW12ZXIgZnJvbSAnc2VtdmVyJ1xuXG5leHBvcnQgZnVuY3Rpb24gdGhyb3dFcnJvciAobXNnOiBzdHJpbmcpOiB2b2lkIHtcbiAgdGhyb3cgbmV3IEVycm9yKGBbdnVlLXRlc3QtdXRpbHNdOiAke21zZ31gKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gd2FybiAobXNnOiBzdHJpbmcpOiB2b2lkIHtcbiAgY29uc29sZS5lcnJvcihgW3Z1ZS10ZXN0LXV0aWxzXTogJHttc2d9YClcbn1cblxuY29uc3QgY2FtZWxpemVSRSA9IC8tKFxcdykvZ1xuXG5leHBvcnQgY29uc3QgY2FtZWxpemUgPSAoc3RyOiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xuICBjb25zdCBjYW1lbGl6ZWRTdHIgPSBzdHIucmVwbGFjZShjYW1lbGl6ZVJFLCAoXywgYykgPT5cbiAgICBjID8gYy50b1VwcGVyQ2FzZSgpIDogJydcbiAgKVxuICByZXR1cm4gY2FtZWxpemVkU3RyLmNoYXJBdCgwKS50b0xvd2VyQ2FzZSgpICsgY2FtZWxpemVkU3RyLnNsaWNlKDEpXG59XG5cbi8qKlxuICogQ2FwaXRhbGl6ZSBhIHN0cmluZy5cbiAqL1xuZXhwb3J0IGNvbnN0IGNhcGl0YWxpemUgPSAoc3RyOiBzdHJpbmcpOiBzdHJpbmcgPT5cbiAgc3RyLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgc3RyLnNsaWNlKDEpXG5cbi8qKlxuICogSHlwaGVuYXRlIGEgY2FtZWxDYXNlIHN0cmluZy5cbiAqL1xuY29uc3QgaHlwaGVuYXRlUkUgPSAvXFxCKFtBLVpdKS9nXG5leHBvcnQgY29uc3QgaHlwaGVuYXRlID0gKHN0cjogc3RyaW5nKTogc3RyaW5nID0+XG4gIHN0ci5yZXBsYWNlKGh5cGhlbmF0ZVJFLCAnLSQxJykudG9Mb3dlckNhc2UoKVxuXG5mdW5jdGlvbiBoYXNPd25Qcm9wZXJ0eSAob2JqLCBwcm9wKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZUNvbXBvbmVudCAoaWQ6IHN0cmluZywgY29tcG9uZW50czogT2JqZWN0KSB7XG4gIGlmICh0eXBlb2YgaWQgIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuXG4gIH1cbiAgLy8gY2hlY2sgbG9jYWwgcmVnaXN0cmF0aW9uIHZhcmlhdGlvbnMgZmlyc3RcbiAgaWYgKGhhc093blByb3BlcnR5KGNvbXBvbmVudHMsIGlkKSkge1xuICAgIHJldHVybiBjb21wb25lbnRzW2lkXVxuICB9XG4gIHZhciBjYW1lbGl6ZWRJZCA9IGNhbWVsaXplKGlkKVxuICBpZiAoaGFzT3duUHJvcGVydHkoY29tcG9uZW50cywgY2FtZWxpemVkSWQpKSB7XG4gICAgcmV0dXJuIGNvbXBvbmVudHNbY2FtZWxpemVkSWRdXG4gIH1cbiAgdmFyIFBhc2NhbENhc2VJZCA9IGNhcGl0YWxpemUoY2FtZWxpemVkSWQpXG4gIGlmIChoYXNPd25Qcm9wZXJ0eShjb21wb25lbnRzLCBQYXNjYWxDYXNlSWQpKSB7XG4gICAgcmV0dXJuIGNvbXBvbmVudHNbUGFzY2FsQ2FzZUlkXVxuICB9XG4gIC8vIGZhbGxiYWNrIHRvIHByb3RvdHlwZSBjaGFpblxuICByZXR1cm4gY29tcG9uZW50c1tpZF0gfHwgY29tcG9uZW50c1tjYW1lbGl6ZWRJZF0gfHwgY29tcG9uZW50c1tQYXNjYWxDYXNlSWRdXG59XG5cbmNvbnN0IFVBID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgJ25hdmlnYXRvcicgaW4gd2luZG93ICYmXG4gIG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKVxuXG5leHBvcnQgY29uc3QgaXNQaGFudG9tSlMgPSBVQSAmJiBVQS5pbmNsdWRlcyAmJlxuICBVQS5tYXRjaCgvcGhhbnRvbWpzL2kpXG5cbmV4cG9ydCBjb25zdCBpc0VkZ2UgPSBVQSAmJiBVQS5pbmRleE9mKCdlZGdlLycpID4gMFxuZXhwb3J0IGNvbnN0IGlzQ2hyb21lID0gVUEgJiYgL2Nocm9tZVxcL1xcZCsvLnRlc3QoVUEpICYmICFpc0VkZ2VcblxuLy8gZ2V0IHRoZSBldmVudCB1c2VkIHRvIHRyaWdnZXIgdi1tb2RlbCBoYW5kbGVyIHRoYXQgdXBkYXRlcyBib3VuZCBkYXRhXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q2hlY2tlZEV2ZW50ICgpIHtcbiAgY29uc3QgdmVyc2lvbiA9IFZ1ZS52ZXJzaW9uXG5cbiAgaWYgKHNlbXZlci5zYXRpc2ZpZXModmVyc2lvbiwgJzIuMS45IC0gMi4xLjEwJykpIHtcbiAgICByZXR1cm4gJ2NsaWNrJ1xuICB9XG5cbiAgaWYgKHNlbXZlci5zYXRpc2ZpZXModmVyc2lvbiwgJzIuMiAtIDIuNCcpKSB7XG4gICAgcmV0dXJuIGlzQ2hyb21lID8gJ2NsaWNrJyA6ICdjaGFuZ2UnXG4gIH1cblxuICAvLyBjaGFuZ2UgaXMgaGFuZGxlciBmb3IgdmVyc2lvbiAyLjAgLSAyLjEuOCwgYW5kIDIuNStcbiAgcmV0dXJuICdjaGFuZ2UnXG59XG4iLCIvLyBAZmxvd1xuaW1wb3J0IHsgdGhyb3dFcnJvciwgY2FwaXRhbGl6ZSwgY2FtZWxpemUsIGh5cGhlbmF0ZSB9IGZyb20gJy4vdXRpbCdcblxuZXhwb3J0IGZ1bmN0aW9uIGlzRG9tU2VsZWN0b3IgKHNlbGVjdG9yOiBhbnkpOiBib29sZWFuIHtcbiAgaWYgKHR5cGVvZiBzZWxlY3RvciAhPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIHRyeSB7XG4gICAgaWYgKHR5cGVvZiBkb2N1bWVudCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRocm93RXJyb3IoXG4gICAgICAgIGBtb3VudCBtdXN0IGJlIHJ1biBpbiBhIGJyb3dzZXIgZW52aXJvbm1lbnQgbGlrZSBgICtcbiAgICAgICAgICBgUGhhbnRvbUpTLCBqc2RvbSBvciBjaHJvbWVgXG4gICAgICApXG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHRocm93RXJyb3IoXG4gICAgICBgbW91bnQgbXVzdCBiZSBydW4gaW4gYSBicm93c2VyIGVudmlyb25tZW50IGxpa2UgYCArXG4gICAgICAgIGBQaGFudG9tSlMsIGpzZG9tIG9yIGNocm9tZWBcbiAgICApXG4gIH1cblxuICB0cnkge1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpXG4gICAgcmV0dXJuIHRydWVcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNWdWVDb21wb25lbnQgKGNvbXBvbmVudDogYW55KTogYm9vbGVhbiB7XG4gIGlmICh0eXBlb2YgY29tcG9uZW50ID09PSAnZnVuY3Rpb24nICYmIGNvbXBvbmVudC5vcHRpb25zKSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIGlmIChjb21wb25lbnQgPT09IG51bGwgfHwgdHlwZW9mIGNvbXBvbmVudCAhPT0gJ29iamVjdCcpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIGlmIChjb21wb25lbnQuZXh0ZW5kcyB8fCBjb21wb25lbnQuX0N0b3IpIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgaWYgKHR5cGVvZiBjb21wb25lbnQudGVtcGxhdGUgPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIHJldHVybiB0eXBlb2YgY29tcG9uZW50LnJlbmRlciA9PT0gJ2Z1bmN0aW9uJ1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tcG9uZW50TmVlZHNDb21waWxpbmcgKGNvbXBvbmVudDogQ29tcG9uZW50KTogYm9vbGVhbiB7XG4gIHJldHVybiAoXG4gICAgY29tcG9uZW50ICYmXG4gICAgIWNvbXBvbmVudC5yZW5kZXIgJiZcbiAgICAoY29tcG9uZW50LnRlbXBsYXRlIHx8IGNvbXBvbmVudC5leHRlbmRzIHx8IGNvbXBvbmVudC5leHRlbmRPcHRpb25zKSAmJlxuICAgICFjb21wb25lbnQuZnVuY3Rpb25hbFxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1JlZlNlbGVjdG9yIChyZWZPcHRpb25zT2JqZWN0OiBhbnkpOiBib29sZWFuIHtcbiAgaWYgKFxuICAgIHR5cGVvZiByZWZPcHRpb25zT2JqZWN0ICE9PSAnb2JqZWN0JyB8fFxuICAgIE9iamVjdC5rZXlzKHJlZk9wdGlvbnNPYmplY3QgfHwge30pLmxlbmd0aCAhPT0gMVxuICApIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIHJldHVybiB0eXBlb2YgcmVmT3B0aW9uc09iamVjdC5yZWYgPT09ICdzdHJpbmcnXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc05hbWVTZWxlY3RvciAobmFtZU9wdGlvbnNPYmplY3Q6IGFueSk6IGJvb2xlYW4ge1xuICBpZiAodHlwZW9mIG5hbWVPcHRpb25zT2JqZWN0ICE9PSAnb2JqZWN0JyB8fCBuYW1lT3B0aW9uc09iamVjdCA9PT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgcmV0dXJuICEhbmFtZU9wdGlvbnNPYmplY3QubmFtZVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdGVtcGxhdGVDb250YWluc0NvbXBvbmVudCAoXG4gIHRlbXBsYXRlOiBzdHJpbmcsXG4gIG5hbWU6IHN0cmluZ1xuKTogYm9vbGVhbiB7XG4gIHJldHVybiBbY2FwaXRhbGl6ZSwgY2FtZWxpemUsIGh5cGhlbmF0ZV0uc29tZShmb3JtYXQgPT4ge1xuICAgIGNvbnN0IHJlID0gbmV3IFJlZ0V4cChgPCR7Zm9ybWF0KG5hbWUpfVxcXFxzKihcXFxcc3w+fChcXC8+KSlgLCAnZycpXG4gICAgcmV0dXJuIHJlLnRlc3QodGVtcGxhdGUpXG4gIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1BsYWluT2JqZWN0IChvYmo6IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IE9iamVjdF0nXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1JlcXVpcmVkQ29tcG9uZW50IChuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIChcbiAgICBuYW1lID09PSAnS2VlcEFsaXZlJyB8fCBuYW1lID09PSAnVHJhbnNpdGlvbicgfHwgbmFtZSA9PT0gJ1RyYW5zaXRpb25Hcm91cCdcbiAgKVxufVxuXG5mdW5jdGlvbiBtYWtlTWFwIChcbiAgc3RyOiBzdHJpbmcsXG4gIGV4cGVjdHNMb3dlckNhc2U/OiBib29sZWFuXG4pIHtcbiAgdmFyIG1hcCA9IE9iamVjdC5jcmVhdGUobnVsbClcbiAgdmFyIGxpc3QgPSBzdHIuc3BsaXQoJywnKVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICBtYXBbbGlzdFtpXV0gPSB0cnVlXG4gIH1cbiAgcmV0dXJuIGV4cGVjdHNMb3dlckNhc2VcbiAgICA/IGZ1bmN0aW9uICh2YWw6IHN0cmluZykgeyByZXR1cm4gbWFwW3ZhbC50b0xvd2VyQ2FzZSgpXSB9XG4gICAgOiBmdW5jdGlvbiAodmFsOiBzdHJpbmcpIHsgcmV0dXJuIG1hcFt2YWxdIH1cbn1cblxuZXhwb3J0IGNvbnN0IGlzSFRNTFRhZyA9IG1ha2VNYXAoXG4gICdodG1sLGJvZHksYmFzZSxoZWFkLGxpbmssbWV0YSxzdHlsZSx0aXRsZSwnICtcbiAgJ2FkZHJlc3MsYXJ0aWNsZSxhc2lkZSxmb290ZXIsaGVhZGVyLGgxLGgyLGgzLGg0LGg1LGg2LGhncm91cCxuYXYsc2VjdGlvbiwnICtcbiAgJ2RpdixkZCxkbCxkdCxmaWdjYXB0aW9uLGZpZ3VyZSxwaWN0dXJlLGhyLGltZyxsaSxtYWluLG9sLHAscHJlLHVsLCcgK1xuICAnYSxiLGFiYnIsYmRpLGJkbyxicixjaXRlLGNvZGUsZGF0YSxkZm4sZW0saSxrYmQsbWFyayxxLHJwLHJ0LHJ0YyxydWJ5LCcgK1xuICAncyxzYW1wLHNtYWxsLHNwYW4sc3Ryb25nLHN1YixzdXAsdGltZSx1LHZhcix3YnIsYXJlYSxhdWRpbyxtYXAsdHJhY2ssJyArXG4gICdlbWJlZCxvYmplY3QscGFyYW0sc291cmNlLGNhbnZhcyxzY3JpcHQsbm9zY3JpcHQsZGVsLGlucywnICtcbiAgJ2NhcHRpb24sY29sLGNvbGdyb3VwLHRhYmxlLHRoZWFkLHRib2R5LHRkLHRoLHRyLHZpZGVvLCcgK1xuICAnYnV0dG9uLGRhdGFsaXN0LGZpZWxkc2V0LGZvcm0saW5wdXQsbGFiZWwsbGVnZW5kLG1ldGVyLG9wdGdyb3VwLG9wdGlvbiwnICtcbiAgJ291dHB1dCxwcm9ncmVzcyxzZWxlY3QsdGV4dGFyZWEsJyArXG4gICdkZXRhaWxzLGRpYWxvZyxtZW51LG1lbnVpdGVtLHN1bW1hcnksJyArXG4gICdjb250ZW50LGVsZW1lbnQsc2hhZG93LHRlbXBsYXRlLGJsb2NrcXVvdGUsaWZyYW1lLHRmb290J1xuKVxuXG4vLyB0aGlzIG1hcCBpcyBpbnRlbnRpb25hbGx5IHNlbGVjdGl2ZSwgb25seSBjb3ZlcmluZyBTVkcgZWxlbWVudHMgdGhhdCBtYXlcbi8vIGNvbnRhaW4gY2hpbGQgZWxlbWVudHMuXG5leHBvcnQgY29uc3QgaXNTVkcgPSBtYWtlTWFwKFxuICAnc3ZnLGFuaW1hdGUsY2lyY2xlLGNsaXBwYXRoLGN1cnNvcixkZWZzLGRlc2MsZWxsaXBzZSxmaWx0ZXIsZm9udC1mYWNlLCcgK1xuICAnZm9yZWlnbk9iamVjdCxnLGdseXBoLGltYWdlLGxpbmUsbWFya2VyLG1hc2ssbWlzc2luZy1nbHlwaCxwYXRoLHBhdHRlcm4sJyArXG4gICdwb2x5Z29uLHBvbHlsaW5lLHJlY3Qsc3dpdGNoLHN5bWJvbCx0ZXh0LHRleHRwYXRoLHRzcGFuLHVzZSx2aWV3JyxcbiAgdHJ1ZVxuKVxuXG5leHBvcnQgY29uc3QgaXNSZXNlcnZlZFRhZyA9ICh0YWc6IHN0cmluZykgPT4gaXNIVE1MVGFnKHRhZykgfHwgaXNTVkcodGFnKVxuIiwiaW1wb3J0IFZ1ZSBmcm9tICd2dWUnXG5pbXBvcnQgc2VtdmVyIGZyb20gJ3NlbXZlcidcblxuZXhwb3J0IGNvbnN0IE5BTUVfU0VMRUNUT1IgPSAnTkFNRV9TRUxFQ1RPUidcbmV4cG9ydCBjb25zdCBDT01QT05FTlRfU0VMRUNUT1IgPSAnQ09NUE9ORU5UX1NFTEVDVE9SJ1xuZXhwb3J0IGNvbnN0IFJFRl9TRUxFQ1RPUiA9ICdSRUZfU0VMRUNUT1InXG5leHBvcnQgY29uc3QgRE9NX1NFTEVDVE9SID0gJ0RPTV9TRUxFQ1RPUidcbmV4cG9ydCBjb25zdCBJTlZBTElEX1NFTEVDVE9SID0gJ0lOVkFMSURfU0VMRUNUT1InXG5cbmV4cG9ydCBjb25zdCBWVUVfVkVSU0lPTiA9IE51bWJlcihcbiAgYCR7VnVlLnZlcnNpb24uc3BsaXQoJy4nKVswXX0uJHtWdWUudmVyc2lvbi5zcGxpdCgnLicpWzFdfWBcbilcblxuZXhwb3J0IGNvbnN0IEZVTkNUSU9OQUxfT1BUSU9OUyA9XG4gIFZVRV9WRVJTSU9OID49IDIuNSA/ICdmbk9wdGlvbnMnIDogJ2Z1bmN0aW9uYWxPcHRpb25zJ1xuXG5leHBvcnQgY29uc3QgQkVGT1JFX1JFTkRFUl9MSUZFQ1lDTEVfSE9PSyA9XG4gIHNlbXZlci5ndChWdWUudmVyc2lvbiwgJzIuMS44JylcbiAgICA/ICdiZWZvcmVDcmVhdGUnXG4gICAgOiAnYmVmb3JlTW91bnQnXG5cbmV4cG9ydCBjb25zdCBDUkVBVEVfRUxFTUVOVF9BTElBUyA9IHNlbXZlci5ndChWdWUudmVyc2lvbiwgJzIuMS41JylcbiAgPyAnX2MnXG4gIDogJ19oJ1xuIiwiLy8gQGZsb3dcblxuaW1wb3J0IHtcbiAgaXNEb21TZWxlY3RvcixcbiAgaXNOYW1lU2VsZWN0b3IsXG4gIGlzUmVmU2VsZWN0b3IsXG4gIGlzVnVlQ29tcG9uZW50XG59IGZyb20gJ3NoYXJlZC92YWxpZGF0b3JzJ1xuaW1wb3J0IHsgdGhyb3dFcnJvciB9IGZyb20gJ3NoYXJlZC91dGlsJ1xuaW1wb3J0IHtcbiAgUkVGX1NFTEVDVE9SLFxuICBDT01QT05FTlRfU0VMRUNUT1IsXG4gIE5BTUVfU0VMRUNUT1IsXG4gIERPTV9TRUxFQ1RPUixcbiAgSU5WQUxJRF9TRUxFQ1RPUlxufSBmcm9tICdzaGFyZWQvY29uc3RzJ1xuXG5mdW5jdGlvbiBnZXRTZWxlY3RvclR5cGUgKFxuICBzZWxlY3RvcjogU2VsZWN0b3Jcbik6IHN0cmluZyB7XG4gIGlmIChpc0RvbVNlbGVjdG9yKHNlbGVjdG9yKSkgcmV0dXJuIERPTV9TRUxFQ1RPUlxuICBpZiAoaXNWdWVDb21wb25lbnQoc2VsZWN0b3IpKSByZXR1cm4gQ09NUE9ORU5UX1NFTEVDVE9SXG4gIGlmIChpc05hbWVTZWxlY3RvcihzZWxlY3RvcikpIHJldHVybiBOQU1FX1NFTEVDVE9SXG4gIGlmIChpc1JlZlNlbGVjdG9yKHNlbGVjdG9yKSkgcmV0dXJuIFJFRl9TRUxFQ1RPUlxuXG4gIHJldHVybiBJTlZBTElEX1NFTEVDVE9SXG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGdldFNlbGVjdG9yIChcbiAgc2VsZWN0b3I6IFNlbGVjdG9yLFxuICBtZXRob2ROYW1lOiBzdHJpbmdcbik6IE9iamVjdCB7XG4gIGNvbnN0IHR5cGUgPSBnZXRTZWxlY3RvclR5cGUoc2VsZWN0b3IpXG4gIGlmICh0eXBlID09PSBJTlZBTElEX1NFTEVDVE9SKSB7XG4gICAgdGhyb3dFcnJvcihcbiAgICAgIGB3cmFwcGVyLiR7bWV0aG9kTmFtZX0oKSBtdXN0IGJlIHBhc3NlZCBhIHZhbGlkIENTUyBzZWxlY3RvciwgVnVlIGAgK1xuICAgICAgYGNvbnN0cnVjdG9yLCBvciB2YWxpZCBmaW5kIG9wdGlvbiBvYmplY3RgXG4gICAgKVxuICB9XG4gIHJldHVybiB7XG4gICAgdHlwZSxcbiAgICB2YWx1ZTogc2VsZWN0b3JcbiAgfVxufVxuIiwiLy8gQGZsb3dcblxuaW1wb3J0IHsgd2FybiB9IGZyb20gJ3NoYXJlZC91dGlsJ1xuXG5mdW5jdGlvbiBnZXRSZWFsQ2hpbGQgKHZub2RlOiA/Vk5vZGUpOiA/Vk5vZGUge1xuICBjb25zdCBjb21wT3B0aW9ucyA9IHZub2RlICYmIHZub2RlLmNvbXBvbmVudE9wdGlvbnNcbiAgaWYgKGNvbXBPcHRpb25zICYmIGNvbXBPcHRpb25zLkN0b3Iub3B0aW9ucy5hYnN0cmFjdCkge1xuICAgIHJldHVybiBnZXRSZWFsQ2hpbGQoZ2V0Rmlyc3RDb21wb25lbnRDaGlsZChjb21wT3B0aW9ucy5jaGlsZHJlbikpXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHZub2RlXG4gIH1cbn1cblxuZnVuY3Rpb24gaXNTYW1lQ2hpbGQgKGNoaWxkOiBWTm9kZSwgb2xkQ2hpbGQ6IFZOb2RlKTogYm9vbGVhbiB7XG4gIHJldHVybiBvbGRDaGlsZC5rZXkgPT09IGNoaWxkLmtleSAmJiBvbGRDaGlsZC50YWcgPT09IGNoaWxkLnRhZ1xufVxuXG5mdW5jdGlvbiBnZXRGaXJzdENvbXBvbmVudENoaWxkIChjaGlsZHJlbjogP0FycmF5PFZOb2RlPik6ID9WTm9kZSB7XG4gIGlmIChBcnJheS5pc0FycmF5KGNoaWxkcmVuKSkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGMgPSBjaGlsZHJlbltpXVxuICAgICAgaWYgKGMgJiYgKGMuY29tcG9uZW50T3B0aW9ucyB8fCBpc0FzeW5jUGxhY2Vob2xkZXIoYykpKSB7XG4gICAgICAgIHJldHVybiBjXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGlzUHJpbWl0aXZlICh2YWx1ZTogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiAoXG4gICAgdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyB8fFxuICAgIHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgfHxcbiAgICAvLyAkRmxvd0lnbm9yZVxuICAgIHR5cGVvZiB2YWx1ZSA9PT0gJ3N5bWJvbCcgfHxcbiAgICB0eXBlb2YgdmFsdWUgPT09ICdib29sZWFuJ1xuICApXG59XG5cbmZ1bmN0aW9uIGlzQXN5bmNQbGFjZWhvbGRlciAobm9kZTogVk5vZGUpOiBib29sZWFuIHtcbiAgcmV0dXJuIG5vZGUuaXNDb21tZW50ICYmIG5vZGUuYXN5bmNGYWN0b3J5XG59XG5jb25zdCBjYW1lbGl6ZVJFID0gLy0oXFx3KS9nXG5leHBvcnQgY29uc3QgY2FtZWxpemUgPSAoc3RyOiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xuICByZXR1cm4gc3RyLnJlcGxhY2UoY2FtZWxpemVSRSwgKF8sIGMpID0+IGMgPyBjLnRvVXBwZXJDYXNlKCkgOiAnJylcbn1cblxuZnVuY3Rpb24gaGFzUGFyZW50VHJhbnNpdGlvbiAodm5vZGU6IFZOb2RlKTogP2Jvb2xlYW4ge1xuICB3aGlsZSAoKHZub2RlID0gdm5vZGUucGFyZW50KSkge1xuICAgIGlmICh2bm9kZS5kYXRhLnRyYW5zaXRpb24pIHtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgcmVuZGVyIChoOiBGdW5jdGlvbikge1xuICAgIGxldCBjaGlsZHJlbjogP0FycmF5PFZOb2RlPiA9IHRoaXMuJG9wdGlvbnMuX3JlbmRlckNoaWxkcmVuXG4gICAgaWYgKCFjaGlsZHJlbikge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgLy8gZmlsdGVyIG91dCB0ZXh0IG5vZGVzIChwb3NzaWJsZSB3aGl0ZXNwYWNlcylcbiAgICBjaGlsZHJlbiA9IGNoaWxkcmVuLmZpbHRlcigoYzogVk5vZGUpID0+IGMudGFnIHx8IGlzQXN5bmNQbGFjZWhvbGRlcihjKSlcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICBpZiAoIWNoaWxkcmVuLmxlbmd0aCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgLy8gd2FybiBtdWx0aXBsZSBlbGVtZW50c1xuICAgIGlmIChjaGlsZHJlbi5sZW5ndGggPiAxKSB7XG4gICAgICB3YXJuKFxuICAgICAgICBgPHRyYW5zaXRpb24+IGNhbiBvbmx5IGJlIHVzZWQgb24gYSBzaW5nbGUgZWxlbWVudC4gYCArIGBVc2UgYCArXG4gICAgICAgICAnPHRyYW5zaXRpb24tZ3JvdXA+IGZvciBsaXN0cy4nXG4gICAgICApXG4gICAgfVxuXG4gICAgY29uc3QgbW9kZTogc3RyaW5nID0gdGhpcy5tb2RlXG5cbiAgICAvLyB3YXJuIGludmFsaWQgbW9kZVxuICAgIGlmIChtb2RlICYmIG1vZGUgIT09ICdpbi1vdXQnICYmIG1vZGUgIT09ICdvdXQtaW4nXG4gICAgKSB7XG4gICAgICB3YXJuKFxuICAgICAgICAnaW52YWxpZCA8dHJhbnNpdGlvbj4gbW9kZTogJyArIG1vZGVcbiAgICAgIClcbiAgICB9XG5cbiAgICBjb25zdCByYXdDaGlsZDogVk5vZGUgPSBjaGlsZHJlblswXVxuXG4gICAgLy8gaWYgdGhpcyBpcyBhIGNvbXBvbmVudCByb290IG5vZGUgYW5kIHRoZSBjb21wb25lbnQnc1xuICAgIC8vIHBhcmVudCBjb250YWluZXIgbm9kZSBhbHNvIGhhcyB0cmFuc2l0aW9uLCBza2lwLlxuICAgIGlmIChoYXNQYXJlbnRUcmFuc2l0aW9uKHRoaXMuJHZub2RlKSkge1xuICAgICAgcmV0dXJuIHJhd0NoaWxkXG4gICAgfVxuXG4gICAgLy8gYXBwbHkgdHJhbnNpdGlvbiBkYXRhIHRvIGNoaWxkXG4gICAgLy8gdXNlIGdldFJlYWxDaGlsZCgpIHRvIGlnbm9yZSBhYnN0cmFjdCBjb21wb25lbnRzIGUuZy4ga2VlcC1hbGl2ZVxuICAgIGNvbnN0IGNoaWxkOiA/Vk5vZGUgPSBnZXRSZWFsQ2hpbGQocmF3Q2hpbGQpXG5cbiAgICBpZiAoIWNoaWxkKSB7XG4gICAgICByZXR1cm4gcmF3Q2hpbGRcbiAgICB9XG5cbiAgICBjb25zdCBpZDogc3RyaW5nID0gYF9fdHJhbnNpdGlvbi0ke3RoaXMuX3VpZH0tYFxuICAgIGNoaWxkLmtleSA9IGNoaWxkLmtleSA9PSBudWxsXG4gICAgICA/IGNoaWxkLmlzQ29tbWVudFxuICAgICAgICA/IGlkICsgJ2NvbW1lbnQnXG4gICAgICAgIDogaWQgKyBjaGlsZC50YWdcbiAgICAgIDogaXNQcmltaXRpdmUoY2hpbGQua2V5KVxuICAgICAgICA/IChTdHJpbmcoY2hpbGQua2V5KS5pbmRleE9mKGlkKSA9PT0gMCA/IGNoaWxkLmtleSA6IGlkICsgY2hpbGQua2V5KVxuICAgICAgICA6IGNoaWxkLmtleVxuXG4gICAgY29uc3QgZGF0YTogT2JqZWN0ID0gKGNoaWxkLmRhdGEgfHwgKGNoaWxkLmRhdGEgPSB7fSkpXG4gICAgY29uc3Qgb2xkUmF3Q2hpbGQ6ID9WTm9kZSA9IHRoaXMuX3Zub2RlXG4gICAgY29uc3Qgb2xkQ2hpbGQ6ID9WTm9kZSA9IGdldFJlYWxDaGlsZChvbGRSYXdDaGlsZClcbiAgICBpZiAoY2hpbGQuZGF0YS5kaXJlY3RpdmVzICYmXG4gICAgICBjaGlsZC5kYXRhLmRpcmVjdGl2ZXMuc29tZShkID0+IGQubmFtZSA9PT0gJ3Nob3cnKSkge1xuICAgICAgY2hpbGQuZGF0YS5zaG93ID0gdHJ1ZVxuICAgIH1cblxuICAgIC8vIG1hcmsgdi1zaG93XG4gICAgLy8gc28gdGhhdCB0aGUgdHJhbnNpdGlvbiBtb2R1bGUgY2FuIGhhbmQgb3ZlciB0aGUgY29udHJvbFxuICAgIC8vIHRvIHRoZSBkaXJlY3RpdmVcbiAgICBpZiAoY2hpbGQuZGF0YS5kaXJlY3RpdmVzICYmXG4gICAgICBjaGlsZC5kYXRhLmRpcmVjdGl2ZXMuc29tZShkID0+IGQubmFtZSA9PT0gJ3Nob3cnKSkge1xuICAgICAgY2hpbGQuZGF0YS5zaG93ID0gdHJ1ZVxuICAgIH1cbiAgICBpZiAoXG4gICAgICBvbGRDaGlsZCAmJlxuICAgICAgICAgb2xkQ2hpbGQuZGF0YSAmJlxuICAgICAgICAgIWlzU2FtZUNoaWxkKGNoaWxkLCBvbGRDaGlsZCkgJiZcbiAgICAgICAgICFpc0FzeW5jUGxhY2Vob2xkZXIob2xkQ2hpbGQpICYmXG4gICAgICAgICAvLyAjNjY4NyBjb21wb25lbnQgcm9vdCBpcyBhIGNvbW1lbnQgbm9kZVxuICAgICAgICAgIShvbGRDaGlsZC5jb21wb25lbnRJbnN0YW5jZSAmJlxuICAgICAgICAgIG9sZENoaWxkLmNvbXBvbmVudEluc3RhbmNlLl92bm9kZS5pc0NvbW1lbnQpXG4gICAgKSB7XG4gICAgICBvbGRDaGlsZC5kYXRhID0geyAuLi5kYXRhIH1cbiAgICB9XG4gICAgcmV0dXJuIHJhd0NoaWxkXG4gIH1cbn1cbiIsIi8vIEBmbG93XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgcmVuZGVyIChoOiBGdW5jdGlvbikge1xuICAgIGNvbnN0IHRhZzogc3RyaW5nID0gdGhpcy50YWcgfHwgdGhpcy4kdm5vZGUuZGF0YS50YWcgfHwgJ3NwYW4nXG4gICAgY29uc3QgY2hpbGRyZW46IEFycmF5PFZOb2RlPiA9IHRoaXMuJHNsb3RzLmRlZmF1bHQgfHwgW11cblxuICAgIHJldHVybiBoKHRhZywgbnVsbCwgY2hpbGRyZW4pXG4gIH1cbn1cbiIsImltcG9ydCBUcmFuc2l0aW9uU3R1YiBmcm9tICcuL2NvbXBvbmVudHMvVHJhbnNpdGlvblN0dWInXG5pbXBvcnQgVHJhbnNpdGlvbkdyb3VwU3R1YiBmcm9tICcuL2NvbXBvbmVudHMvVHJhbnNpdGlvbkdyb3VwU3R1YidcblxuZXhwb3J0IGRlZmF1bHQge1xuICBzdHViczoge1xuICAgIHRyYW5zaXRpb246IFRyYW5zaXRpb25TdHViLFxuICAgICd0cmFuc2l0aW9uLWdyb3VwJzogVHJhbnNpdGlvbkdyb3VwU3R1YlxuICB9LFxuICBtb2Nrczoge30sXG4gIG1ldGhvZHM6IHt9LFxuICBwcm92aWRlOiB7fSxcbiAgbG9nTW9kaWZpZWRDb21wb25lbnRzOiB0cnVlLFxuICBzaWxlbnQ6IHRydWVcbn1cbiIsIi8vIEBmbG93XG5cbmltcG9ydCB0eXBlIFdyYXBwZXIgZnJvbSAnLi93cmFwcGVyJ1xuaW1wb3J0IHR5cGUgVnVlV3JhcHBlciBmcm9tICcuL3Z1ZS13cmFwcGVyJ1xuaW1wb3J0IHsgdGhyb3dFcnJvciwgd2FybiB9IGZyb20gJ3NoYXJlZC91dGlsJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBXcmFwcGVyQXJyYXkgaW1wbGVtZW50cyBCYXNlV3JhcHBlciB7XG4gICt3cmFwcGVyczogQXJyYXk8V3JhcHBlciB8IFZ1ZVdyYXBwZXI+O1xuICArbGVuZ3RoOiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IgKHdyYXBwZXJzOiBBcnJheTxXcmFwcGVyIHwgVnVlV3JhcHBlcj4pIHtcbiAgICBjb25zdCBsZW5ndGggPSB3cmFwcGVycy5sZW5ndGhcbiAgICAvLyAkRmxvd0lnbm9yZVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnd3JhcHBlcnMnLCB7XG4gICAgICBnZXQ6ICgpID0+IHdyYXBwZXJzLFxuICAgICAgc2V0OiAoKSA9PiB0aHJvd0Vycm9yKCd3cmFwcGVyQXJyYXkud3JhcHBlcnMgaXMgcmVhZC1vbmx5JylcbiAgICB9KVxuICAgIC8vICRGbG93SWdub3JlXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdsZW5ndGgnLCB7XG4gICAgICBnZXQ6ICgpID0+IGxlbmd0aCxcbiAgICAgIHNldDogKCkgPT4gdGhyb3dFcnJvcignd3JhcHBlckFycmF5Lmxlbmd0aCBpcyByZWFkLW9ubHknKVxuICAgIH0pXG4gIH1cblxuICBhdCAoaW5kZXg6IG51bWJlcik6IFdyYXBwZXIgfCBWdWVXcmFwcGVyIHtcbiAgICBpZiAoaW5kZXggPiB0aGlzLmxlbmd0aCAtIDEpIHtcbiAgICAgIHRocm93RXJyb3IoYG5vIGl0ZW0gZXhpc3RzIGF0ICR7aW5kZXh9YClcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMud3JhcHBlcnNbaW5kZXhdXG4gIH1cblxuICBhdHRyaWJ1dGVzICgpOiB2b2lkIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnYXR0cmlidXRlcycpXG5cbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYGF0dHJpYnV0ZXMgbXVzdCBiZSBjYWxsZWQgb24gYSBzaW5nbGUgd3JhcHBlciwgdXNlIGAgK1xuICAgICAgICBgYXQoaSkgdG8gYWNjZXNzIGEgd3JhcHBlcmBcbiAgICApXG4gIH1cblxuICBjbGFzc2VzICgpOiB2b2lkIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnY2xhc3NlcycpXG5cbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYGNsYXNzZXMgbXVzdCBiZSBjYWxsZWQgb24gYSBzaW5nbGUgd3JhcHBlciwgdXNlIGAgK1xuICAgICAgICBgYXQoaSkgdG8gYWNjZXNzIGEgd3JhcHBlcmBcbiAgICApXG4gIH1cblxuICBjb250YWlucyAoc2VsZWN0b3I6IFNlbGVjdG9yKTogYm9vbGVhbiB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ2NvbnRhaW5zJylcblxuICAgIHJldHVybiB0aGlzLndyYXBwZXJzLmV2ZXJ5KHdyYXBwZXIgPT4gd3JhcHBlci5jb250YWlucyhzZWxlY3RvcikpXG4gIH1cblxuICBleGlzdHMgKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmxlbmd0aCA+IDAgJiYgdGhpcy53cmFwcGVycy5ldmVyeSh3cmFwcGVyID0+IHdyYXBwZXIuZXhpc3RzKCkpXG4gIH1cblxuICBmaWx0ZXIgKHByZWRpY2F0ZTogRnVuY3Rpb24pOiBXcmFwcGVyQXJyYXkge1xuICAgIHJldHVybiBuZXcgV3JhcHBlckFycmF5KHRoaXMud3JhcHBlcnMuZmlsdGVyKHByZWRpY2F0ZSkpXG4gIH1cblxuICB2aXNpYmxlICgpOiBib29sZWFuIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgndmlzaWJsZScpXG5cbiAgICByZXR1cm4gdGhpcy5sZW5ndGggPiAwICYmIHRoaXMud3JhcHBlcnMuZXZlcnkod3JhcHBlciA9PiB3cmFwcGVyLnZpc2libGUoKSlcbiAgfVxuXG4gIGVtaXR0ZWQgKCk6IHZvaWQge1xuICAgIHRoaXMudGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5KCdlbWl0dGVkJylcblxuICAgIHRocm93RXJyb3IoXG4gICAgICBgZW1pdHRlZCBtdXN0IGJlIGNhbGxlZCBvbiBhIHNpbmdsZSB3cmFwcGVyLCB1c2UgYCArXG4gICAgICAgIGBhdChpKSB0byBhY2Nlc3MgYSB3cmFwcGVyYFxuICAgIClcbiAgfVxuXG4gIGVtaXR0ZWRCeU9yZGVyICgpOiB2b2lkIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnZW1pdHRlZEJ5T3JkZXInKVxuXG4gICAgdGhyb3dFcnJvcihcbiAgICAgIGBlbWl0dGVkQnlPcmRlciBtdXN0IGJlIGNhbGxlZCBvbiBhIHNpbmdsZSB3cmFwcGVyLCBgICtcbiAgICAgICAgYHVzZSBhdChpKSB0byBhY2Nlc3MgYSB3cmFwcGVyYFxuICAgIClcbiAgfVxuXG4gIGhhc0F0dHJpYnV0ZSAoYXR0cmlidXRlOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnaGFzQXR0cmlidXRlJylcblxuICAgIHJldHVybiB0aGlzLndyYXBwZXJzLmV2ZXJ5KHdyYXBwZXIgPT5cbiAgICAgIHdyYXBwZXIuaGFzQXR0cmlidXRlKGF0dHJpYnV0ZSwgdmFsdWUpXG4gICAgKVxuICB9XG5cbiAgaGFzQ2xhc3MgKGNsYXNzTmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ2hhc0NsYXNzJylcblxuICAgIHJldHVybiB0aGlzLndyYXBwZXJzLmV2ZXJ5KHdyYXBwZXIgPT4gd3JhcHBlci5oYXNDbGFzcyhjbGFzc05hbWUpKVxuICB9XG5cbiAgaGFzUHJvcCAocHJvcDogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ2hhc1Byb3AnKVxuXG4gICAgcmV0dXJuIHRoaXMud3JhcHBlcnMuZXZlcnkod3JhcHBlciA9PiB3cmFwcGVyLmhhc1Byb3AocHJvcCwgdmFsdWUpKVxuICB9XG5cbiAgaGFzU3R5bGUgKHN0eWxlOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnaGFzU3R5bGUnKVxuXG4gICAgcmV0dXJuIHRoaXMud3JhcHBlcnMuZXZlcnkod3JhcHBlciA9PiB3cmFwcGVyLmhhc1N0eWxlKHN0eWxlLCB2YWx1ZSkpXG4gIH1cblxuICBmaW5kQWxsICgpOiB2b2lkIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnZmluZEFsbCcpXG5cbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYGZpbmRBbGwgbXVzdCBiZSBjYWxsZWQgb24gYSBzaW5nbGUgd3JhcHBlciwgdXNlIGAgK1xuICAgICAgICBgYXQoaSkgdG8gYWNjZXNzIGEgd3JhcHBlcmBcbiAgICApXG4gIH1cblxuICBmaW5kICgpOiB2b2lkIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnZmluZCcpXG5cbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYGZpbmQgbXVzdCBiZSBjYWxsZWQgb24gYSBzaW5nbGUgd3JhcHBlciwgdXNlIGF0KGkpIGAgK1xuICAgICAgICBgdG8gYWNjZXNzIGEgd3JhcHBlcmBcbiAgICApXG4gIH1cblxuICBodG1sICgpOiB2b2lkIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnaHRtbCcpXG5cbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYGh0bWwgbXVzdCBiZSBjYWxsZWQgb24gYSBzaW5nbGUgd3JhcHBlciwgdXNlIGF0KGkpIGAgK1xuICAgICAgICBgdG8gYWNjZXNzIGEgd3JhcHBlcmBcbiAgICApXG4gIH1cblxuICBpcyAoc2VsZWN0b3I6IFNlbGVjdG9yKTogYm9vbGVhbiB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ2lzJylcblxuICAgIHJldHVybiB0aGlzLndyYXBwZXJzLmV2ZXJ5KHdyYXBwZXIgPT4gd3JhcHBlci5pcyhzZWxlY3RvcikpXG4gIH1cblxuICBpc0VtcHR5ICgpOiBib29sZWFuIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnaXNFbXB0eScpXG5cbiAgICByZXR1cm4gdGhpcy53cmFwcGVycy5ldmVyeSh3cmFwcGVyID0+IHdyYXBwZXIuaXNFbXB0eSgpKVxuICB9XG5cbiAgaXNWaXNpYmxlICgpOiBib29sZWFuIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnaXNWaXNpYmxlJylcblxuICAgIHJldHVybiB0aGlzLndyYXBwZXJzLmV2ZXJ5KHdyYXBwZXIgPT4gd3JhcHBlci5pc1Zpc2libGUoKSlcbiAgfVxuXG4gIGlzVnVlSW5zdGFuY2UgKCk6IGJvb2xlYW4ge1xuICAgIHRoaXMudGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5KCdpc1Z1ZUluc3RhbmNlJylcblxuICAgIHJldHVybiB0aGlzLndyYXBwZXJzLmV2ZXJ5KHdyYXBwZXIgPT4gd3JhcHBlci5pc1Z1ZUluc3RhbmNlKCkpXG4gIH1cblxuICBuYW1lICgpOiB2b2lkIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnbmFtZScpXG5cbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYG5hbWUgbXVzdCBiZSBjYWxsZWQgb24gYSBzaW5nbGUgd3JhcHBlciwgdXNlIGF0KGkpIGAgK1xuICAgICAgICBgdG8gYWNjZXNzIGEgd3JhcHBlcmBcbiAgICApXG4gIH1cblxuICBwcm9wcyAoKTogdm9pZCB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ3Byb3BzJylcblxuICAgIHRocm93RXJyb3IoXG4gICAgICBgcHJvcHMgbXVzdCBiZSBjYWxsZWQgb24gYSBzaW5nbGUgd3JhcHBlciwgdXNlIGAgK1xuICAgICAgICBgYXQoaSkgdG8gYWNjZXNzIGEgd3JhcHBlcmBcbiAgICApXG4gIH1cblxuICB0ZXh0ICgpOiB2b2lkIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgndGV4dCcpXG5cbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYHRleHQgbXVzdCBiZSBjYWxsZWQgb24gYSBzaW5nbGUgd3JhcHBlciwgdXNlIGF0KGkpIGAgK1xuICAgICAgICBgdG8gYWNjZXNzIGEgd3JhcHBlcmBcbiAgICApXG4gIH1cblxuICB0aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkgKG1ldGhvZDogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKHRoaXMud3JhcHBlcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aHJvd0Vycm9yKGAke21ldGhvZH0gY2Fubm90IGJlIGNhbGxlZCBvbiAwIGl0ZW1zYClcbiAgICB9XG4gIH1cblxuICBzZXRDb21wdXRlZCAoY29tcHV0ZWQ6IE9iamVjdCk6IHZvaWQge1xuICAgIHRoaXMudGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5KCdzZXRDb21wdXRlZCcpXG5cbiAgICB0aGlzLndyYXBwZXJzLmZvckVhY2god3JhcHBlciA9PiB3cmFwcGVyLnNldENvbXB1dGVkKGNvbXB1dGVkKSlcbiAgfVxuXG4gIHNldERhdGEgKGRhdGE6IE9iamVjdCk6IHZvaWQge1xuICAgIHRoaXMudGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5KCdzZXREYXRhJylcblxuICAgIHRoaXMud3JhcHBlcnMuZm9yRWFjaCh3cmFwcGVyID0+IHdyYXBwZXIuc2V0RGF0YShkYXRhKSlcbiAgfVxuXG4gIHNldE1ldGhvZHMgKHByb3BzOiBPYmplY3QpOiB2b2lkIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnc2V0TWV0aG9kcycpXG5cbiAgICB0aGlzLndyYXBwZXJzLmZvckVhY2god3JhcHBlciA9PiB3cmFwcGVyLnNldE1ldGhvZHMocHJvcHMpKVxuICB9XG5cbiAgc2V0UHJvcHMgKHByb3BzOiBPYmplY3QpOiB2b2lkIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnc2V0UHJvcHMnKVxuXG4gICAgdGhpcy53cmFwcGVycy5mb3JFYWNoKHdyYXBwZXIgPT4gd3JhcHBlci5zZXRQcm9wcyhwcm9wcykpXG4gIH1cblxuICBzZXRWYWx1ZSAodmFsdWU6IGFueSk6IHZvaWQge1xuICAgIHRoaXMudGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5KCdzZXRWYWx1ZScpXG5cbiAgICB0aGlzLndyYXBwZXJzLmZvckVhY2god3JhcHBlciA9PiB3cmFwcGVyLnNldFZhbHVlKHZhbHVlKSlcbiAgfVxuXG4gIHNldENoZWNrZWQgKGNoZWNrZWQ6IGJvb2xlYW4gPSB0cnVlKTogdm9pZCB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ3NldENoZWNrZWQnKVxuXG4gICAgdGhpcy53cmFwcGVycy5mb3JFYWNoKHdyYXBwZXIgPT4gd3JhcHBlci5zZXRDaGVja2VkKGNoZWNrZWQpKVxuICB9XG5cbiAgc2V0U2VsZWN0ZWQgKCk6IHZvaWQge1xuICAgIHRoaXMudGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5KCdzZXRTZWxlY3RlZCcpXG5cbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYHNldFNlbGVjdGVkIG11c3QgYmUgY2FsbGVkIG9uIGEgc2luZ2xlIHdyYXBwZXIsIGAgK1xuICAgICAgICBgdXNlIGF0KGkpIHRvIGFjY2VzcyBhIHdyYXBwZXJgXG4gICAgKVxuICB9XG5cbiAgdHJpZ2dlciAoZXZlbnQ6IHN0cmluZywgb3B0aW9uczogT2JqZWN0KTogdm9pZCB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ3RyaWdnZXInKVxuXG4gICAgdGhpcy53cmFwcGVycy5mb3JFYWNoKHdyYXBwZXIgPT4gd3JhcHBlci50cmlnZ2VyKGV2ZW50LCBvcHRpb25zKSlcbiAgfVxuXG4gIHVwZGF0ZSAoKTogdm9pZCB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ3VwZGF0ZScpXG4gICAgd2FybihcbiAgICAgIGB1cGRhdGUgaGFzIGJlZW4gcmVtb3ZlZC4gQWxsIGNoYW5nZXMgYXJlIG5vdyBgICtcbiAgICAgICAgYHN5bmNocm5vdXMgd2l0aG91dCBjYWxsaW5nIHVwZGF0ZWBcbiAgICApXG4gIH1cblxuICBkZXN0cm95ICgpOiB2b2lkIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnZGVzdHJveScpXG5cbiAgICB0aGlzLndyYXBwZXJzLmZvckVhY2god3JhcHBlciA9PiB3cmFwcGVyLmRlc3Ryb3koKSlcbiAgfVxufVxuIiwiLy8gQGZsb3dcblxuaW1wb3J0IHsgdGhyb3dFcnJvciB9IGZyb20gJ3NoYXJlZC91dGlsJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFcnJvcldyYXBwZXIgaW1wbGVtZW50cyBCYXNlV3JhcHBlciB7XG4gIHNlbGVjdG9yOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IgKHNlbGVjdG9yOiBzdHJpbmcpIHtcbiAgICB0aGlzLnNlbGVjdG9yID0gc2VsZWN0b3JcbiAgfVxuXG4gIGF0ICgpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYGZpbmQgZGlkIG5vdCByZXR1cm4gJHt0aGlzLnNlbGVjdG9yfSwgY2Fubm90IGNhbGwgYXQoKSBvbiBlbXB0eSBXcmFwcGVyYFxuICAgIClcbiAgfVxuXG4gIGF0dHJpYnV0ZXMgKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoXG4gICAgICBgZmluZCBkaWQgbm90IHJldHVybiAke1xuICAgICAgICB0aGlzLnNlbGVjdG9yXG4gICAgICB9LCBjYW5ub3QgY2FsbCBhdHRyaWJ1dGVzKCkgb24gZW1wdHkgV3JhcHBlcmBcbiAgICApXG4gIH1cblxuICBjbGFzc2VzICgpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYGZpbmQgZGlkIG5vdCByZXR1cm4gJHtcbiAgICAgICAgdGhpcy5zZWxlY3RvclxuICAgICAgfSwgY2Fubm90IGNhbGwgY2xhc3NlcygpIG9uIGVtcHR5IFdyYXBwZXJgXG4gICAgKVxuICB9XG5cbiAgY29udGFpbnMgKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoXG4gICAgICBgZmluZCBkaWQgbm90IHJldHVybiAke1xuICAgICAgICB0aGlzLnNlbGVjdG9yXG4gICAgICB9LCBjYW5ub3QgY2FsbCBjb250YWlucygpIG9uIGVtcHR5IFdyYXBwZXJgXG4gICAgKVxuICB9XG5cbiAgZW1pdHRlZCAoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihcbiAgICAgIGBmaW5kIGRpZCBub3QgcmV0dXJuICR7XG4gICAgICAgIHRoaXMuc2VsZWN0b3JcbiAgICAgIH0sIGNhbm5vdCBjYWxsIGVtaXR0ZWQoKSBvbiBlbXB0eSBXcmFwcGVyYFxuICAgIClcbiAgfVxuXG4gIGVtaXR0ZWRCeU9yZGVyICgpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYGZpbmQgZGlkIG5vdCByZXR1cm4gJHtcbiAgICAgICAgdGhpcy5zZWxlY3RvclxuICAgICAgfSwgY2Fubm90IGNhbGwgZW1pdHRlZEJ5T3JkZXIoKSBvbiBlbXB0eSBXcmFwcGVyYFxuICAgIClcbiAgfVxuXG4gIGV4aXN0cyAoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBmaWx0ZXIgKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoXG4gICAgICBgZmluZCBkaWQgbm90IHJldHVybiAke1xuICAgICAgICB0aGlzLnNlbGVjdG9yXG4gICAgICB9LCBjYW5ub3QgY2FsbCBmaWx0ZXIoKSBvbiBlbXB0eSBXcmFwcGVyYFxuICAgIClcbiAgfVxuXG4gIHZpc2libGUgKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoXG4gICAgICBgZmluZCBkaWQgbm90IHJldHVybiAke1xuICAgICAgICB0aGlzLnNlbGVjdG9yXG4gICAgICB9LCBjYW5ub3QgY2FsbCB2aXNpYmxlKCkgb24gZW1wdHkgV3JhcHBlcmBcbiAgICApXG4gIH1cblxuICBoYXNBdHRyaWJ1dGUgKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoXG4gICAgICBgZmluZCBkaWQgbm90IHJldHVybiAke1xuICAgICAgICB0aGlzLnNlbGVjdG9yXG4gICAgICB9LCBjYW5ub3QgY2FsbCBoYXNBdHRyaWJ1dGUoKSBvbiBlbXB0eSBXcmFwcGVyYFxuICAgIClcbiAgfVxuXG4gIGhhc0NsYXNzICgpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYGZpbmQgZGlkIG5vdCByZXR1cm4gJHtcbiAgICAgICAgdGhpcy5zZWxlY3RvclxuICAgICAgfSwgY2Fubm90IGNhbGwgaGFzQ2xhc3MoKSBvbiBlbXB0eSBXcmFwcGVyYFxuICAgIClcbiAgfVxuXG4gIGhhc1Byb3AgKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoXG4gICAgICBgZmluZCBkaWQgbm90IHJldHVybiAke1xuICAgICAgICB0aGlzLnNlbGVjdG9yXG4gICAgICB9LCBjYW5ub3QgY2FsbCBoYXNQcm9wKCkgb24gZW1wdHkgV3JhcHBlcmBcbiAgICApXG4gIH1cblxuICBoYXNTdHlsZSAoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihcbiAgICAgIGBmaW5kIGRpZCBub3QgcmV0dXJuICR7XG4gICAgICAgIHRoaXMuc2VsZWN0b3JcbiAgICAgIH0sIGNhbm5vdCBjYWxsIGhhc1N0eWxlKCkgb24gZW1wdHkgV3JhcHBlcmBcbiAgICApXG4gIH1cblxuICBmaW5kQWxsICgpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYGZpbmQgZGlkIG5vdCByZXR1cm4gJHtcbiAgICAgICAgdGhpcy5zZWxlY3RvclxuICAgICAgfSwgY2Fubm90IGNhbGwgZmluZEFsbCgpIG9uIGVtcHR5IFdyYXBwZXJgXG4gICAgKVxuICB9XG5cbiAgZmluZCAoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihcbiAgICAgIGBmaW5kIGRpZCBub3QgcmV0dXJuICR7XG4gICAgICAgIHRoaXMuc2VsZWN0b3JcbiAgICAgIH0sIGNhbm5vdCBjYWxsIGZpbmQoKSBvbiBlbXB0eSBXcmFwcGVyYFxuICAgIClcbiAgfVxuXG4gIGh0bWwgKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoXG4gICAgICBgZmluZCBkaWQgbm90IHJldHVybiAke1xuICAgICAgICB0aGlzLnNlbGVjdG9yXG4gICAgICB9LCBjYW5ub3QgY2FsbCBodG1sKCkgb24gZW1wdHkgV3JhcHBlcmBcbiAgICApXG4gIH1cblxuICBpcyAoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihcbiAgICAgIGBmaW5kIGRpZCBub3QgcmV0dXJuICR7dGhpcy5zZWxlY3Rvcn0sIGNhbm5vdCBjYWxsIGlzKCkgb24gZW1wdHkgV3JhcHBlcmBcbiAgICApXG4gIH1cblxuICBpc0VtcHR5ICgpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYGZpbmQgZGlkIG5vdCByZXR1cm4gJHtcbiAgICAgICAgdGhpcy5zZWxlY3RvclxuICAgICAgfSwgY2Fubm90IGNhbGwgaXNFbXB0eSgpIG9uIGVtcHR5IFdyYXBwZXJgXG4gICAgKVxuICB9XG5cbiAgaXNWaXNpYmxlICgpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYGZpbmQgZGlkIG5vdCByZXR1cm4gJHtcbiAgICAgICAgdGhpcy5zZWxlY3RvclxuICAgICAgfSwgY2Fubm90IGNhbGwgaXNWaXNpYmxlKCkgb24gZW1wdHkgV3JhcHBlcmBcbiAgICApXG4gIH1cblxuICBpc1Z1ZUluc3RhbmNlICgpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYGZpbmQgZGlkIG5vdCByZXR1cm4gJHtcbiAgICAgICAgdGhpcy5zZWxlY3RvclxuICAgICAgfSwgY2Fubm90IGNhbGwgaXNWdWVJbnN0YW5jZSgpIG9uIGVtcHR5IFdyYXBwZXJgXG4gICAgKVxuICB9XG5cbiAgbmFtZSAoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihcbiAgICAgIGBmaW5kIGRpZCBub3QgcmV0dXJuICR7XG4gICAgICAgIHRoaXMuc2VsZWN0b3JcbiAgICAgIH0sIGNhbm5vdCBjYWxsIG5hbWUoKSBvbiBlbXB0eSBXcmFwcGVyYFxuICAgIClcbiAgfVxuXG4gIHByb3BzICgpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYGZpbmQgZGlkIG5vdCByZXR1cm4gJHtcbiAgICAgICAgdGhpcy5zZWxlY3RvclxuICAgICAgfSwgY2Fubm90IGNhbGwgcHJvcHMoKSBvbiBlbXB0eSBXcmFwcGVyYFxuICAgIClcbiAgfVxuXG4gIHRleHQgKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoXG4gICAgICBgZmluZCBkaWQgbm90IHJldHVybiAke1xuICAgICAgICB0aGlzLnNlbGVjdG9yXG4gICAgICB9LCBjYW5ub3QgY2FsbCB0ZXh0KCkgb24gZW1wdHkgV3JhcHBlcmBcbiAgICApXG4gIH1cblxuICBzZXRDb21wdXRlZCAoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihcbiAgICAgIGBmaW5kIGRpZCBub3QgcmV0dXJuICR7XG4gICAgICAgIHRoaXMuc2VsZWN0b3JcbiAgICAgIH0sIGNhbm5vdCBjYWxsIHNldENvbXB1dGVkKCkgb24gZW1wdHkgV3JhcHBlcmBcbiAgICApXG4gIH1cblxuICBzZXREYXRhICgpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYGZpbmQgZGlkIG5vdCByZXR1cm4gJHtcbiAgICAgICAgdGhpcy5zZWxlY3RvclxuICAgICAgfSwgY2Fubm90IGNhbGwgc2V0RGF0YSgpIG9uIGVtcHR5IFdyYXBwZXJgXG4gICAgKVxuICB9XG5cbiAgc2V0TWV0aG9kcyAoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihcbiAgICAgIGBmaW5kIGRpZCBub3QgcmV0dXJuICR7XG4gICAgICAgIHRoaXMuc2VsZWN0b3JcbiAgICAgIH0sIGNhbm5vdCBjYWxsIHNldE1ldGhvZHMoKSBvbiBlbXB0eSBXcmFwcGVyYFxuICAgIClcbiAgfVxuXG4gIHNldFByb3BzICgpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYGZpbmQgZGlkIG5vdCByZXR1cm4gJHtcbiAgICAgICAgdGhpcy5zZWxlY3RvclxuICAgICAgfSwgY2Fubm90IGNhbGwgc2V0UHJvcHMoKSBvbiBlbXB0eSBXcmFwcGVyYFxuICAgIClcbiAgfVxuXG4gIHNldFZhbHVlICgpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYGZpbmQgZGlkIG5vdCByZXR1cm4gJHtcbiAgICAgICAgdGhpcy5zZWxlY3RvclxuICAgICAgfSwgY2Fubm90IGNhbGwgc2V0VmFsdWUoKSBvbiBlbXB0eSBXcmFwcGVyYFxuICAgIClcbiAgfVxuXG4gIHNldENoZWNrZWQgKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoXG4gICAgICBgZmluZCBkaWQgbm90IHJldHVybiAke1xuICAgICAgICB0aGlzLnNlbGVjdG9yXG4gICAgICB9LCBjYW5ub3QgY2FsbCBzZXRDaGVja2VkKCkgb24gZW1wdHkgV3JhcHBlcmBcbiAgICApXG4gIH1cblxuICBzZXRTZWxlY3RlZCAoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihcbiAgICAgIGBmaW5kIGRpZCBub3QgcmV0dXJuICR7XG4gICAgICAgIHRoaXMuc2VsZWN0b3JcbiAgICAgIH0sIGNhbm5vdCBjYWxsIHNldFNlbGVjdGVkKCkgb24gZW1wdHkgV3JhcHBlcmBcbiAgICApXG4gIH1cblxuICB0cmlnZ2VyICgpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYGZpbmQgZGlkIG5vdCByZXR1cm4gJHtcbiAgICAgICAgdGhpcy5zZWxlY3RvclxuICAgICAgfSwgY2Fubm90IGNhbGwgdHJpZ2dlcigpIG9uIGVtcHR5IFdyYXBwZXJgXG4gICAgKVxuICB9XG5cbiAgdXBkYXRlICgpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYHVwZGF0ZSBoYXMgYmVlbiByZW1vdmVkIGZyb20gdnVlLXRlc3QtdXRpbHMuYCArXG4gICAgICBgQWxsIHVwZGF0ZXMgYXJlIG5vdyBzeW5jaHJvbm91cyBieSBkZWZhdWx0YFxuICAgIClcbiAgfVxuXG4gIGRlc3Ryb3kgKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoXG4gICAgICBgZmluZCBkaWQgbm90IHJldHVybiAke1xuICAgICAgICB0aGlzLnNlbGVjdG9yXG4gICAgICB9LCBjYW5ub3QgY2FsbCBkZXN0cm95KCkgb24gZW1wdHkgV3JhcHBlcmBcbiAgICApXG4gIH1cbn1cbiIsIi8vIEBmbG93XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGZpbmRET01Ob2RlcyAoXG4gIGVsZW1lbnQ6IEVsZW1lbnQgfCBudWxsLFxuICBzZWxlY3Rvcjogc3RyaW5nXG4pOiBBcnJheTxWTm9kZT4ge1xuICBjb25zdCBub2RlcyA9IFtdXG4gIGlmICghZWxlbWVudCB8fCAhZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsIHx8ICFlbGVtZW50Lm1hdGNoZXMpIHtcbiAgICByZXR1cm4gbm9kZXNcbiAgfVxuXG4gIGlmIChlbGVtZW50Lm1hdGNoZXMoc2VsZWN0b3IpKSB7XG4gICAgbm9kZXMucHVzaChlbGVtZW50KVxuICB9XG4gIC8vICRGbG93SWdub3JlXG4gIHJldHVybiBub2Rlcy5jb25jYXQoW10uc2xpY2UuY2FsbChlbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpKSlcbn1cbiIsImltcG9ydCB7XG4gIERPTV9TRUxFQ1RPUixcbiAgQ09NUE9ORU5UX1NFTEVDVE9SLFxuICBGVU5DVElPTkFMX09QVElPTlNcbn0gZnJvbSAnc2hhcmVkL2NvbnN0cydcblxuZXhwb3J0IGZ1bmN0aW9uIHZtTWF0Y2hlc05hbWUgKHZtLCBuYW1lKSB7XG4gIHJldHVybiAhIW5hbWUgJiYgKFxuICAgICh2bS5uYW1lID09PSBuYW1lKSB8fFxuICAgICh2bS4kb3B0aW9ucyAmJiB2bS4kb3B0aW9ucy5uYW1lID09PSBuYW1lKVxuICApXG59XG5cbmZ1bmN0aW9uIHZtQ3Rvck1hdGNoZXMgKHZtLCBjb21wb25lbnQpIHtcbiAgaWYgKFxuICAgIHZtLiRvcHRpb25zICYmIHZtLiRvcHRpb25zLiRfdnVlVGVzdFV0aWxzX29yaWdpbmFsID09PSBjb21wb25lbnQgfHxcbiAgICB2bS4kX3Z1ZVRlc3RVdGlsc19vcmlnaW5hbCA9PT0gY29tcG9uZW50XG4gICkge1xuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBjb25zdCBDdG9yID0gdHlwZW9mIGNvbXBvbmVudCA9PT0gJ2Z1bmN0aW9uJ1xuICAgID8gY29tcG9uZW50Lm9wdGlvbnMuX0N0b3JcbiAgICA6IGNvbXBvbmVudC5fQ3RvclxuXG4gIGlmICghQ3Rvcikge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgaWYgKHZtLmNvbnN0cnVjdG9yLmV4dGVuZE9wdGlvbnMgPT09IGNvbXBvbmVudCkge1xuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBpZiAoY29tcG9uZW50LmZ1bmN0aW9uYWwpIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXModm0uX0N0b3IgfHwge30pLnNvbWUoYyA9PiB7XG4gICAgICByZXR1cm4gY29tcG9uZW50ID09PSB2bS5fQ3RvcltjXS5leHRlbmRPcHRpb25zXG4gICAgfSlcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbWF0Y2hlcyAobm9kZSwgc2VsZWN0b3IpIHtcbiAgaWYgKHNlbGVjdG9yLnR5cGUgPT09IERPTV9TRUxFQ1RPUikge1xuICAgIGNvbnN0IGVsZW1lbnQgPSBub2RlIGluc3RhbmNlb2YgRWxlbWVudFxuICAgICAgPyBub2RlXG4gICAgICA6IG5vZGUuZWxtXG4gICAgcmV0dXJuIGVsZW1lbnQgJiYgZWxlbWVudC5tYXRjaGVzICYmIGVsZW1lbnQubWF0Y2hlcyhzZWxlY3Rvci52YWx1ZSlcbiAgfVxuXG4gIGNvbnN0IGlzRnVuY3Rpb25hbFNlbGVjdG9yID0gdHlwZW9mIHNlbGVjdG9yLnZhbHVlID09PSAnZnVuY3Rpb24nXG4gICAgPyBzZWxlY3Rvci52YWx1ZS5vcHRpb25zLmZ1bmN0aW9uYWxcbiAgICA6IHNlbGVjdG9yLnZhbHVlLmZ1bmN0aW9uYWxcblxuICBjb25zdCBjb21wb25lbnRJbnN0YW5jZSA9IGlzRnVuY3Rpb25hbFNlbGVjdG9yXG4gICAgPyBub2RlW0ZVTkNUSU9OQUxfT1BUSU9OU11cbiAgICA6IG5vZGUuY2hpbGRcblxuICBpZiAoIWNvbXBvbmVudEluc3RhbmNlKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBpZiAoc2VsZWN0b3IudHlwZSA9PT0gQ09NUE9ORU5UX1NFTEVDVE9SKSB7XG4gICAgaWYgKHZtQ3Rvck1hdGNoZXMoY29tcG9uZW50SW5zdGFuY2UsIHNlbGVjdG9yLnZhbHVlKSkge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gIH1cblxuICAvLyBGYWxsYmFjayB0byBuYW1lIHNlbGVjdG9yIGZvciBDT01QT05FTlRfU0VMRUNUT1IgZm9yIFZ1ZSA8IDIuMVxuICBjb25zdCBuYW1lU2VsZWN0b3IgPVxuICB0eXBlb2Ygc2VsZWN0b3IudmFsdWUgPT09ICdmdW5jdGlvbidcbiAgICA/IHNlbGVjdG9yLnZhbHVlLmV4dGVuZE9wdGlvbnMubmFtZVxuICAgIDogc2VsZWN0b3IudmFsdWUubmFtZVxuICByZXR1cm4gdm1NYXRjaGVzTmFtZShjb21wb25lbnRJbnN0YW5jZSwgbmFtZVNlbGVjdG9yKVxufVxuIiwiLy8gQGZsb3dcblxuaW1wb3J0IGZpbmRET01Ob2RlcyBmcm9tICcuL2ZpbmQtZG9tLW5vZGVzJ1xuaW1wb3J0IHtcbiAgRE9NX1NFTEVDVE9SLFxuICBSRUZfU0VMRUNUT1IsXG4gIENPTVBPTkVOVF9TRUxFQ1RPUixcbiAgVlVFX1ZFUlNJT05cbn0gZnJvbSAnc2hhcmVkL2NvbnN0cydcbmltcG9ydCB7IHRocm93RXJyb3IgfSBmcm9tICdzaGFyZWQvdXRpbCdcbmltcG9ydCB7IG1hdGNoZXMgfSBmcm9tICcuL21hdGNoZXMnXG5cbmV4cG9ydCBmdW5jdGlvbiBmaW5kQWxsSW5zdGFuY2VzIChyb290Vm06IGFueSkge1xuICBjb25zdCBpbnN0YW5jZXMgPSBbcm9vdFZtXVxuICBsZXQgaSA9IDBcbiAgd2hpbGUgKGkgPCBpbnN0YW5jZXMubGVuZ3RoKSB7XG4gICAgY29uc3Qgdm0gPSBpbnN0YW5jZXNbaV1cbiAgICA7KHZtLiRjaGlsZHJlbiB8fCBbXSkuZm9yRWFjaChjaGlsZCA9PiB7XG4gICAgICBpbnN0YW5jZXMucHVzaChjaGlsZClcbiAgICB9KVxuICAgIGkrK1xuICB9XG4gIHJldHVybiBpbnN0YW5jZXNcbn1cblxuZnVuY3Rpb24gZmluZEFsbFZOb2RlcyAoXG4gIHZub2RlOiBWTm9kZSxcbiAgc2VsZWN0b3I6IGFueVxuKTogQXJyYXk8Vk5vZGU+IHtcbiAgY29uc3QgbWF0Y2hpbmdOb2RlcyA9IFtdXG4gIGNvbnN0IG5vZGVzID0gW3Zub2RlXVxuICB3aGlsZSAobm9kZXMubGVuZ3RoKSB7XG4gICAgY29uc3Qgbm9kZSA9IG5vZGVzLnNoaWZ0KClcbiAgICBpZiAobm9kZS5jaGlsZHJlbikge1xuICAgICAgY29uc3QgY2hpbGRyZW4gPSBbLi4ubm9kZS5jaGlsZHJlbl0ucmV2ZXJzZSgpXG4gICAgICBjaGlsZHJlbi5mb3JFYWNoKChuKSA9PiB7XG4gICAgICAgIG5vZGVzLnVuc2hpZnQobilcbiAgICAgIH0pXG4gICAgfVxuICAgIGlmIChub2RlLmNoaWxkKSB7XG4gICAgICBub2Rlcy51bnNoaWZ0KG5vZGUuY2hpbGQuX3Zub2RlKVxuICAgIH1cbiAgICBpZiAobWF0Y2hlcyhub2RlLCBzZWxlY3RvcikpIHtcbiAgICAgIG1hdGNoaW5nTm9kZXMucHVzaChub2RlKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBtYXRjaGluZ05vZGVzXG59XG5cbmZ1bmN0aW9uIHJlbW92ZUR1cGxpY2F0ZU5vZGVzICh2Tm9kZXM6IEFycmF5PFZOb2RlPik6IEFycmF5PFZOb2RlPiB7XG4gIGNvbnN0IHZOb2RlRWxtcyA9IHZOb2Rlcy5tYXAodk5vZGUgPT4gdk5vZGUuZWxtKVxuICByZXR1cm4gdk5vZGVzLmZpbHRlcihcbiAgICAodk5vZGUsIGluZGV4KSA9PiBpbmRleCA9PT0gdk5vZGVFbG1zLmluZGV4T2Yodk5vZGUuZWxtKVxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGZpbmQgKFxuICByb290OiBWTm9kZSB8IEVsZW1lbnQsXG4gIHZtPzogQ29tcG9uZW50LFxuICBzZWxlY3RvcjogU2VsZWN0b3Jcbik6IEFycmF5PFZOb2RlIHwgQ29tcG9uZW50PiB7XG4gIGlmICgocm9vdCBpbnN0YW5jZW9mIEVsZW1lbnQpICYmIHNlbGVjdG9yLnR5cGUgIT09IERPTV9TRUxFQ1RPUikge1xuICAgIHRocm93RXJyb3IoXG4gICAgICBgY2Fubm90IGZpbmQgYSBWdWUgaW5zdGFuY2Ugb24gYSBET00gbm9kZS4gVGhlIG5vZGUgYCArXG4gICAgICBgeW91IGFyZSBjYWxsaW5nIGZpbmQgb24gZG9lcyBub3QgZXhpc3QgaW4gdGhlIGAgK1xuICAgICAgYFZEb20uIEFyZSB5b3UgYWRkaW5nIHRoZSBub2RlIGFzIGlubmVySFRNTD9gXG4gICAgKVxuICB9XG5cbiAgaWYgKFxuICAgIHNlbGVjdG9yLnR5cGUgPT09IENPTVBPTkVOVF9TRUxFQ1RPUiAmJlxuICAgIChcbiAgICAgIHNlbGVjdG9yLnZhbHVlLmZ1bmN0aW9uYWwgfHxcbiAgICAgIChzZWxlY3Rvci52YWx1ZS5vcHRpb25zICYmXG4gICAgICBzZWxlY3Rvci52YWx1ZS5vcHRpb25zLmZ1bmN0aW9uYWwpXG4gICAgKSAmJlxuICAgIFZVRV9WRVJTSU9OIDwgMi4zXG4gICkge1xuICAgIHRocm93RXJyb3IoXG4gICAgICBgZmluZCBmb3IgZnVuY3Rpb25hbCBjb21wb25lbnRzIGlzIG5vdCBzdXBwb3J0ZWQgYCArXG4gICAgICAgIGBpbiBWdWUgPCAyLjNgXG4gICAgKVxuICB9XG5cbiAgaWYgKHJvb3QgaW5zdGFuY2VvZiBFbGVtZW50KSB7XG4gICAgcmV0dXJuIGZpbmRET01Ob2Rlcyhyb290LCBzZWxlY3Rvci52YWx1ZSlcbiAgfVxuXG4gIGlmICghcm9vdCAmJiBzZWxlY3Rvci50eXBlICE9PSBET01fU0VMRUNUT1IpIHtcbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYGNhbm5vdCBmaW5kIGEgVnVlIGluc3RhbmNlIG9uIGEgRE9NIG5vZGUuIFRoZSBub2RlIGAgK1xuICAgICAgYHlvdSBhcmUgY2FsbGluZyBmaW5kIG9uIGRvZXMgbm90IGV4aXN0IGluIHRoZSBgICtcbiAgICAgIGBWRG9tLiBBcmUgeW91IGFkZGluZyB0aGUgbm9kZSBhcyBpbm5lckhUTUw/YFxuICAgIClcbiAgfVxuXG4gIGlmICghdm0gJiYgc2VsZWN0b3IudHlwZSA9PT0gUkVGX1NFTEVDVE9SKSB7XG4gICAgdGhyb3dFcnJvcihcbiAgICAgIGAkcmVmIHNlbGVjdG9ycyBjYW4gb25seSBiZSB1c2VkIG9uIFZ1ZSBjb21wb25lbnQgYCArIGB3cmFwcGVyc2BcbiAgICApXG4gIH1cblxuICBpZiAoXG4gICAgdm0gJiZcbiAgICB2bS4kcmVmcyAmJlxuICAgIHNlbGVjdG9yLnZhbHVlLnJlZiBpbiB2bS4kcmVmc1xuICApIHtcbiAgICBjb25zdCByZWZzID0gdm0uJHJlZnNbc2VsZWN0b3IudmFsdWUucmVmXVxuICAgIHJldHVybiBBcnJheS5pc0FycmF5KHJlZnMpID8gcmVmcyA6IFtyZWZzXVxuICB9XG5cbiAgY29uc3Qgbm9kZXMgPSBmaW5kQWxsVk5vZGVzKHJvb3QsIHNlbGVjdG9yKVxuICBjb25zdCBkZWR1cGVkTm9kZXMgPSByZW1vdmVEdXBsaWNhdGVOb2Rlcyhub2RlcylcblxuICBpZiAobm9kZXMubGVuZ3RoID4gMCB8fCBzZWxlY3Rvci50eXBlICE9PSBET01fU0VMRUNUT1IpIHtcbiAgICByZXR1cm4gZGVkdXBlZE5vZGVzXG4gIH1cblxuICAvLyBGYWxsYmFjayBpbiBjYXNlIGVsZW1lbnQgZXhpc3RzIGluIEhUTUwsIGJ1dCBub3QgaW4gdm5vZGUgdHJlZVxuICAvLyAoZS5nLiBpZiBpbm5lckhUTUwgaXMgc2V0IGFzIGEgZG9tUHJvcClcbiAgcmV0dXJuIGZpbmRET01Ob2Rlcyhyb290LmVsbSwgc2VsZWN0b3IudmFsdWUpXG59XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgVnVlIGZyb20gJ3Z1ZSdcbmltcG9ydCBXcmFwcGVyIGZyb20gJy4vd3JhcHBlcidcbmltcG9ydCBWdWVXcmFwcGVyIGZyb20gJy4vdnVlLXdyYXBwZXInXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNyZWF0ZVdyYXBwZXIgKFxuICBub2RlOiBWTm9kZSB8IENvbXBvbmVudCxcbiAgb3B0aW9uczogV3JhcHBlck9wdGlvbnMgPSB7fVxuKTogVnVlV3JhcHBlciB8IFdyYXBwZXIge1xuICBjb25zdCBjb21wb25lbnRJbnN0YW5jZSA9IG5vZGUuY2hpbGRcbiAgaWYgKGNvbXBvbmVudEluc3RhbmNlKSB7XG4gICAgcmV0dXJuIG5ldyBWdWVXcmFwcGVyKGNvbXBvbmVudEluc3RhbmNlLCBvcHRpb25zKVxuICB9XG4gIHJldHVybiBub2RlIGluc3RhbmNlb2YgVnVlXG4gICAgPyBuZXcgVnVlV3JhcHBlcihub2RlLCBvcHRpb25zKVxuICAgIDogbmV3IFdyYXBwZXIobm9kZSwgb3B0aW9ucylcbn1cbiIsIi8vIEBmbG93XG5cbmxldCBpID0gMFxuXG5mdW5jdGlvbiBvcmRlckRlcHMgKHdhdGNoZXIpOiB2b2lkIHtcbiAgd2F0Y2hlci5kZXBzLmZvckVhY2goZGVwID0+IHtcbiAgICBpZiAoZGVwLl9zb3J0ZWRJZCA9PT0gaSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGRlcC5fc29ydGVkSWQgPSBpXG4gICAgZGVwLnN1YnMuZm9yRWFjaChvcmRlckRlcHMpXG4gICAgZGVwLnN1YnMgPSBkZXAuc3Vicy5zb3J0KChhLCBiKSA9PiBhLmlkIC0gYi5pZClcbiAgfSlcbn1cblxuZnVuY3Rpb24gb3JkZXJWbVdhdGNoZXJzICh2bTogQ29tcG9uZW50KTogdm9pZCB7XG4gIGlmICh2bS5fd2F0Y2hlcnMpIHtcbiAgICB2bS5fd2F0Y2hlcnMuZm9yRWFjaChvcmRlckRlcHMpXG4gIH1cblxuICBpZiAodm0uX2NvbXB1dGVkV2F0Y2hlcnMpIHtcbiAgICBPYmplY3Qua2V5cyh2bS5fY29tcHV0ZWRXYXRjaGVycykuZm9yRWFjaChjb21wdXRlZFdhdGNoZXIgPT4ge1xuICAgICAgb3JkZXJEZXBzKHZtLl9jb21wdXRlZFdhdGNoZXJzW2NvbXB1dGVkV2F0Y2hlcl0pXG4gICAgfSlcbiAgfVxuXG4gIHZtLl93YXRjaGVyICYmIG9yZGVyRGVwcyh2bS5fd2F0Y2hlcilcblxuICB2bS4kY2hpbGRyZW4uZm9yRWFjaChvcmRlclZtV2F0Y2hlcnMpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvcmRlcldhdGNoZXJzICh2bTogQ29tcG9uZW50KTogdm9pZCB7XG4gIG9yZGVyVm1XYXRjaGVycyh2bSlcbiAgaSsrXG59XG4iLCJpbXBvcnQgeyBpc1BsYWluT2JqZWN0IH0gZnJvbSAnc2hhcmVkL3ZhbGlkYXRvcnMnXG5cbmV4cG9ydCBmdW5jdGlvbiByZWN1cnNpdmVseVNldERhdGEgKHZtLCB0YXJnZXQsIGRhdGEpIHtcbiAgT2JqZWN0LmtleXMoZGF0YSkuZm9yRWFjaChrZXkgPT4ge1xuICAgIGNvbnN0IHZhbCA9IGRhdGFba2V5XVxuICAgIGNvbnN0IHRhcmdldFZhbCA9IHRhcmdldFtrZXldXG5cbiAgICBpZiAoaXNQbGFpbk9iamVjdCh2YWwpICYmIGlzUGxhaW5PYmplY3QodGFyZ2V0VmFsKSkge1xuICAgICAgcmVjdXJzaXZlbHlTZXREYXRhKHZtLCB0YXJnZXRWYWwsIHZhbClcbiAgICB9IGVsc2Uge1xuICAgICAgdm0uJHNldCh0YXJnZXQsIGtleSwgdmFsKVxuICAgIH1cbiAgfSlcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIi4vZG9tLWV2ZW50LXR5cGVzLmpzb25cIik7XG4iLCJpbXBvcnQgZXZlbnRUeXBlcyBmcm9tICdkb20tZXZlbnQtdHlwZXMnXG5cbmNvbnN0IGRlZmF1bHRFdmVudFR5cGUgPSB7XG4gIGV2ZW50SW50ZXJmYWNlOiAnRXZlbnQnLFxuICBjYW5jZWxhYmxlOiB0cnVlLFxuICBidWJibGVzOiB0cnVlXG59XG5cbmNvbnN0IG1vZGlmaWVycyA9IHtcbiAgZW50ZXI6IDEzLFxuICB0YWI6IDksXG4gIGRlbGV0ZTogNDYsXG4gIGVzYzogMjcsXG4gIHNwYWNlOiAzMixcbiAgdXA6IDM4LFxuICBkb3duOiA0MCxcbiAgbGVmdDogMzcsXG4gIHJpZ2h0OiAzOSxcbiAgZW5kOiAzNSxcbiAgaG9tZTogMzYsXG4gIGJhY2tzcGFjZTogOCxcbiAgaW5zZXJ0OiA0NSxcbiAgcGFnZXVwOiAzMyxcbiAgcGFnZWRvd246IDM0XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUV2ZW50IChcbiAgdHlwZSxcbiAgbW9kaWZpZXIsXG4gIHsgZXZlbnRJbnRlcmZhY2UsIGJ1YmJsZXMsIGNhbmNlbGFibGUgfSxcbiAgb3B0aW9uc1xuKSB7XG4gIGNvbnN0IFN1cHBvcnRlZEV2ZW50SW50ZXJmYWNlID1cbiAgICB0eXBlb2Ygd2luZG93W2V2ZW50SW50ZXJmYWNlXSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgPyB3aW5kb3dbZXZlbnRJbnRlcmZhY2VdXG4gICAgICA6IHdpbmRvdy5FdmVudFxuXG4gIGNvbnN0IGV2ZW50ID0gbmV3IFN1cHBvcnRlZEV2ZW50SW50ZXJmYWNlKHR5cGUsIHtcbiAgICAvLyBldmVudCBwcm9wZXJ0aWVzIGNhbiBvbmx5IGJlIGFkZGVkIHdoZW4gdGhlIGV2ZW50IGlzIGluc3RhbnRpYXRlZFxuICAgIC8vIGN1c3RvbSBwcm9wZXJ0aWVzIG11c3QgYmUgYWRkZWQgYWZ0ZXIgdGhlIGV2ZW50IGhhcyBiZWVuIGluc3RhbnRpYXRlZFxuICAgIC4uLm9wdGlvbnMsXG4gICAgYnViYmxlcyxcbiAgICBjYW5jZWxhYmxlLFxuICAgIGtleUNvZGU6IG1vZGlmaWVyc1ttb2RpZmllcl1cbiAgfSlcblxuICByZXR1cm4gZXZlbnRcbn1cblxuZnVuY3Rpb24gY3JlYXRlT2xkRXZlbnQgKFxuICB0eXBlLFxuICBtb2RpZmllcixcbiAgeyBldmVudEludGVyZmFjZSwgYnViYmxlcywgY2FuY2VsYWJsZSB9XG4pIHtcbiAgY29uc3QgZXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnRXZlbnQnKVxuICBldmVudC5pbml0RXZlbnQodHlwZSwgYnViYmxlcywgY2FuY2VsYWJsZSlcbiAgZXZlbnQua2V5Q29kZSA9IG1vZGlmaWVyc1ttb2RpZmllcl1cbiAgcmV0dXJuIGV2ZW50XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNyZWF0ZURPTUV2ZW50ICh0eXBlLCBvcHRpb25zKSB7XG4gIGNvbnN0IFtldmVudFR5cGUsIG1vZGlmaWVyXSA9IHR5cGUuc3BsaXQoJy4nKVxuICBjb25zdCBtZXRhID0gZXZlbnRUeXBlc1tldmVudFR5cGVdIHx8IGRlZmF1bHRFdmVudFR5cGVcblxuICAvLyBGYWxsYmFjayBmb3IgSUUxMCwxMSAtIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzI2NTk2MTIzXG4gIGNvbnN0IGV2ZW50ID0gdHlwZW9mIHdpbmRvdy5FdmVudCA9PT0gJ2Z1bmN0aW9uJ1xuICAgID8gY3JlYXRlRXZlbnQoZXZlbnRUeXBlLCBtb2RpZmllciwgbWV0YSwgb3B0aW9ucylcbiAgICA6IGNyZWF0ZU9sZEV2ZW50KGV2ZW50VHlwZSwgbW9kaWZpZXIsIG1ldGEpXG5cbiAgY29uc3QgZXZlbnRQcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YoZXZlbnQpXG4gIE9iamVjdC5rZXlzKG9wdGlvbnMgfHwge30pLmZvckVhY2goa2V5ID0+IHtcbiAgICBjb25zdCBwcm9wZXJ0eURlc2NyaXB0b3IgPVxuICAgICAgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihldmVudFByb3RvdHlwZSwga2V5KVxuXG4gICAgY29uc3QgY2FuU2V0UHJvcGVydHkgPSAhKFxuICAgICAgcHJvcGVydHlEZXNjcmlwdG9yICYmXG4gICAgICBwcm9wZXJ0eURlc2NyaXB0b3Iuc2V0dGVyID09PSB1bmRlZmluZWRcbiAgICApXG4gICAgaWYgKGNhblNldFByb3BlcnR5KSB7XG4gICAgICBldmVudFtrZXldID0gb3B0aW9uc1trZXldXG4gICAgfVxuICB9KVxuXG4gIHJldHVybiBldmVudFxufVxuIiwiLy8gQGZsb3dcblxuaW1wb3J0IFZ1ZSBmcm9tICd2dWUnXG5pbXBvcnQgZ2V0U2VsZWN0b3IgZnJvbSAnLi9nZXQtc2VsZWN0b3InXG5pbXBvcnQge1xuICBSRUZfU0VMRUNUT1IsXG4gIEZVTkNUSU9OQUxfT1BUSU9OUyxcbiAgVlVFX1ZFUlNJT05cbn0gZnJvbSAnc2hhcmVkL2NvbnN0cydcbmltcG9ydCBjb25maWcgZnJvbSAnLi9jb25maWcnXG5pbXBvcnQgV3JhcHBlckFycmF5IGZyb20gJy4vd3JhcHBlci1hcnJheSdcbmltcG9ydCBFcnJvcldyYXBwZXIgZnJvbSAnLi9lcnJvci13cmFwcGVyJ1xuaW1wb3J0IHtcbiAgdGhyb3dFcnJvcixcbiAgd2FybixcbiAgZ2V0Q2hlY2tlZEV2ZW50LFxuICBpc1BoYW50b21KU1xufSBmcm9tICdzaGFyZWQvdXRpbCdcbmltcG9ydCBmaW5kIGZyb20gJy4vZmluZCdcbmltcG9ydCBjcmVhdGVXcmFwcGVyIGZyb20gJy4vY3JlYXRlLXdyYXBwZXInXG5pbXBvcnQgeyBvcmRlcldhdGNoZXJzIH0gZnJvbSAnLi9vcmRlci13YXRjaGVycydcbmltcG9ydCB7IHJlY3Vyc2l2ZWx5U2V0RGF0YSB9IGZyb20gJy4vcmVjdXJzaXZlbHktc2V0LWRhdGEnXG5pbXBvcnQgeyBtYXRjaGVzIH0gZnJvbSAnLi9tYXRjaGVzJ1xuaW1wb3J0IGNyZWF0ZURPTUV2ZW50IGZyb20gJy4vY3JlYXRlLWRvbS1ldmVudCdcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgV3JhcHBlciBpbXBsZW1lbnRzIEJhc2VXcmFwcGVyIHtcbiAgK3Zub2RlOiBWTm9kZSB8IG51bGw7XG4gICt2bTogQ29tcG9uZW50IHwgdm9pZDtcbiAgX2VtaXR0ZWQ6IHsgW25hbWU6IHN0cmluZ106IEFycmF5PEFycmF5PGFueT4+IH07XG4gIF9lbWl0dGVkQnlPcmRlcjogQXJyYXk8eyBuYW1lOiBzdHJpbmcsIGFyZ3M6IEFycmF5PGFueT4gfT47XG4gICtlbGVtZW50OiBFbGVtZW50O1xuICB1cGRhdGU6IEZ1bmN0aW9uO1xuICArb3B0aW9uczogV3JhcHBlck9wdGlvbnM7XG4gIGlzRnVuY3Rpb25hbENvbXBvbmVudDogYm9vbGVhbjtcbiAgcm9vdE5vZGU6IFZOb2RlIHwgRWxlbWVudFxuXG4gIGNvbnN0cnVjdG9yIChcbiAgICBub2RlOiBWTm9kZSB8IEVsZW1lbnQsXG4gICAgb3B0aW9uczogV3JhcHBlck9wdGlvbnMsXG4gICAgaXNWdWVXcmFwcGVyPzogYm9vbGVhblxuICApIHtcbiAgICBjb25zdCB2bm9kZSA9IG5vZGUgaW5zdGFuY2VvZiBFbGVtZW50ID8gbnVsbCA6IG5vZGVcbiAgICBjb25zdCBlbGVtZW50ID0gbm9kZSBpbnN0YW5jZW9mIEVsZW1lbnQgPyBub2RlIDogbm9kZS5lbG1cbiAgICAvLyBQcmV2ZW50IHJlZGVmaW5lIGJ5IFZ1ZVdyYXBwZXJcbiAgICBpZiAoIWlzVnVlV3JhcHBlcikge1xuICAgICAgLy8gJEZsb3dJZ25vcmUgOiBpc3N1ZSB3aXRoIGRlZmluZVByb3BlcnR5XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3Jvb3ROb2RlJywge1xuICAgICAgICBnZXQ6ICgpID0+IHZub2RlIHx8IGVsZW1lbnQsXG4gICAgICAgIHNldDogKCkgPT4gdGhyb3dFcnJvcignd3JhcHBlci5yb290Tm9kZSBpcyByZWFkLW9ubHknKVxuICAgICAgfSlcbiAgICAgIC8vICRGbG93SWdub3JlXG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3Zub2RlJywge1xuICAgICAgICBnZXQ6ICgpID0+IHZub2RlLFxuICAgICAgICBzZXQ6ICgpID0+IHRocm93RXJyb3IoJ3dyYXBwZXIudm5vZGUgaXMgcmVhZC1vbmx5JylcbiAgICAgIH0pXG4gICAgICAvLyAkRmxvd0lnbm9yZVxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdlbGVtZW50Jywge1xuICAgICAgICBnZXQ6ICgpID0+IGVsZW1lbnQsXG4gICAgICAgIHNldDogKCkgPT4gdGhyb3dFcnJvcignd3JhcHBlci5lbGVtZW50IGlzIHJlYWQtb25seScpXG4gICAgICB9KVxuICAgICAgLy8gJEZsb3dJZ25vcmVcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAndm0nLCB7XG4gICAgICAgIGdldDogKCkgPT4gdW5kZWZpbmVkLFxuICAgICAgICBzZXQ6ICgpID0+IHRocm93RXJyb3IoJ3dyYXBwZXIudm0gaXMgcmVhZC1vbmx5JylcbiAgICAgIH0pXG4gICAgfVxuICAgIGNvbnN0IGZyb3plbk9wdGlvbnMgPSBPYmplY3QuZnJlZXplKG9wdGlvbnMpXG4gICAgLy8gJEZsb3dJZ25vcmVcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ29wdGlvbnMnLCB7XG4gICAgICBnZXQ6ICgpID0+IGZyb3plbk9wdGlvbnMsXG4gICAgICBzZXQ6ICgpID0+IHRocm93RXJyb3IoJ3dyYXBwZXIub3B0aW9ucyBpcyByZWFkLW9ubHknKVxuICAgIH0pXG4gICAgaWYgKFxuICAgICAgdGhpcy52bm9kZSAmJlxuICAgICAgKHRoaXMudm5vZGVbRlVOQ1RJT05BTF9PUFRJT05TXSB8fCB0aGlzLnZub2RlLmZ1bmN0aW9uYWxDb250ZXh0KVxuICAgICkge1xuICAgICAgdGhpcy5pc0Z1bmN0aW9uYWxDb21wb25lbnQgPSB0cnVlXG4gICAgfVxuICB9XG5cbiAgYXQgKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoJ2F0KCkgbXVzdCBiZSBjYWxsZWQgb24gYSBXcmFwcGVyQXJyYXknKVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gT2JqZWN0IGNvbnRhaW5pbmcgYWxsIHRoZSBhdHRyaWJ1dGUvdmFsdWUgcGFpcnMgb24gdGhlIGVsZW1lbnQuXG4gICAqL1xuICBhdHRyaWJ1dGVzIChrZXk/OiBzdHJpbmcpOiB7IFtuYW1lOiBzdHJpbmddOiBzdHJpbmcgfSB8IHN0cmluZyB7XG4gICAgY29uc3QgYXR0cmlidXRlcyA9IHRoaXMuZWxlbWVudC5hdHRyaWJ1dGVzXG4gICAgY29uc3QgYXR0cmlidXRlTWFwID0ge31cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGF0dHJpYnV0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGF0dCA9IGF0dHJpYnV0ZXMuaXRlbShpKVxuICAgICAgYXR0cmlidXRlTWFwW2F0dC5sb2NhbE5hbWVdID0gYXR0LnZhbHVlXG4gICAgfVxuICAgIGlmIChrZXkpIHtcbiAgICAgIHJldHVybiBhdHRyaWJ1dGVNYXBba2V5XVxuICAgIH1cbiAgICByZXR1cm4gYXR0cmlidXRlTWFwXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBBcnJheSBjb250YWluaW5nIGFsbCB0aGUgY2xhc3NlcyBvbiB0aGUgZWxlbWVudFxuICAgKi9cbiAgY2xhc3NlcyAoY2xhc3NOYW1lPzogc3RyaW5nKTogQXJyYXk8c3RyaW5nPiB8IGJvb2xlYW4ge1xuICAgIGNvbnN0IGNsYXNzQXR0cmlidXRlID0gdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZSgnY2xhc3MnKVxuICAgIGxldCBjbGFzc2VzID0gY2xhc3NBdHRyaWJ1dGUgPyBjbGFzc0F0dHJpYnV0ZS5zcGxpdCgnICcpIDogW11cbiAgICAvLyBIYW5kbGUgY29udmVydGluZyBjc3Ntb2R1bGVzIGlkZW50aWZpZXJzIGJhY2sgdG8gdGhlIG9yaWdpbmFsIGNsYXNzIG5hbWVcbiAgICBpZiAodGhpcy52bSAmJiB0aGlzLnZtLiRzdHlsZSkge1xuICAgICAgY29uc3QgY3NzTW9kdWxlSWRlbnRpZmllcnMgPSBPYmplY3Qua2V5cyh0aGlzLnZtLiRzdHlsZSlcbiAgICAgICAgLnJlZHVjZSgoYWNjLCBrZXkpID0+IHtcbiAgICAgICAgLy8gJEZsb3dJZ25vcmVcbiAgICAgICAgICBjb25zdCBtb2R1bGVJZGVudCA9IHRoaXMudm0uJHN0eWxlW2tleV1cbiAgICAgICAgICBpZiAobW9kdWxlSWRlbnQpIHtcbiAgICAgICAgICAgIGFjY1ttb2R1bGVJZGVudC5zcGxpdCgnICcpWzBdXSA9IGtleVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gYWNjXG4gICAgICAgIH0sIHt9KVxuICAgICAgY2xhc3NlcyA9IGNsYXNzZXMubWFwKFxuICAgICAgICBuYW1lID0+IGNzc01vZHVsZUlkZW50aWZpZXJzW25hbWVdIHx8IG5hbWVcbiAgICAgIClcbiAgICB9XG5cbiAgICBpZiAoY2xhc3NOYW1lKSB7XG4gICAgICBpZiAoY2xhc3Nlcy5pbmRleE9mKGNsYXNzTmFtZSkgPiAtMSkge1xuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjbGFzc2VzXG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIGlmIHdyYXBwZXIgY29udGFpbnMgcHJvdmlkZWQgc2VsZWN0b3IuXG4gICAqL1xuICBjb250YWlucyAocmF3U2VsZWN0b3I6IFNlbGVjdG9yKTogYm9vbGVhbiB7XG4gICAgY29uc3Qgc2VsZWN0b3IgPSBnZXRTZWxlY3RvcihyYXdTZWxlY3RvciwgJ2NvbnRhaW5zJylcbiAgICBjb25zdCBub2RlcyA9IGZpbmQodGhpcy5yb290Tm9kZSwgdGhpcy52bSwgc2VsZWN0b3IpXG4gICAgcmV0dXJuIG5vZGVzLmxlbmd0aCA+IDBcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxscyBkZXN0cm95IG9uIHZtXG4gICAqL1xuICBkZXN0cm95ICgpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuaXNWdWVJbnN0YW5jZSgpKSB7XG4gICAgICB0aHJvd0Vycm9yKGB3cmFwcGVyLmRlc3Ryb3koKSBjYW4gb25seSBiZSBjYWxsZWQgb24gYSBWdWUgaW5zdGFuY2VgKVxuICAgIH1cblxuICAgIGlmICh0aGlzLmVsZW1lbnQucGFyZW50Tm9kZSkge1xuICAgICAgdGhpcy5lbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5lbGVtZW50KVxuICAgIH1cbiAgICAvLyAkRmxvd0lnbm9yZVxuICAgIHRoaXMudm0uJGRlc3Ryb3koKVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gb2JqZWN0IGNvbnRhaW5pbmcgY3VzdG9tIGV2ZW50cyBlbWl0dGVkIGJ5IHRoZSBXcmFwcGVyIHZtXG4gICAqL1xuICBlbWl0dGVkIChcbiAgICBldmVudD86IHN0cmluZ1xuICApOiBBcnJheTxBcnJheTxhbnk+PiB8IHsgW25hbWU6IHN0cmluZ106IEFycmF5PEFycmF5PGFueT4+IH0ge1xuICAgIGlmICghdGhpcy5fZW1pdHRlZCAmJiAhdGhpcy52bSkge1xuICAgICAgdGhyb3dFcnJvcihgd3JhcHBlci5lbWl0dGVkKCkgY2FuIG9ubHkgYmUgY2FsbGVkIG9uIGEgVnVlIGluc3RhbmNlYClcbiAgICB9XG4gICAgaWYgKGV2ZW50KSB7XG4gICAgICByZXR1cm4gdGhpcy5fZW1pdHRlZFtldmVudF1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZWRcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIEFycmF5IGNvbnRhaW5pbmcgY3VzdG9tIGV2ZW50cyBlbWl0dGVkIGJ5IHRoZSBXcmFwcGVyIHZtXG4gICAqL1xuICBlbWl0dGVkQnlPcmRlciAoKTogQXJyYXk8eyBuYW1lOiBzdHJpbmcsIGFyZ3M6IEFycmF5PGFueT4gfT4ge1xuICAgIGlmICghdGhpcy5fZW1pdHRlZEJ5T3JkZXIgJiYgIXRoaXMudm0pIHtcbiAgICAgIHRocm93RXJyb3IoXG4gICAgICAgIGB3cmFwcGVyLmVtaXR0ZWRCeU9yZGVyKCkgY2FuIG9ubHkgYmUgY2FsbGVkIG9uIGEgVnVlIGluc3RhbmNlYFxuICAgICAgKVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlZEJ5T3JkZXJcbiAgfVxuXG4gIC8qKlxuICAgKiBVdGlsaXR5IHRvIGNoZWNrIHdyYXBwZXIgZXhpc3RzLiBSZXR1cm5zIHRydWUgYXMgV3JhcHBlciBhbHdheXMgZXhpc3RzXG4gICAqL1xuICBleGlzdHMgKCk6IGJvb2xlYW4ge1xuICAgIGlmICh0aGlzLnZtKSB7XG4gICAgICByZXR1cm4gISF0aGlzLnZtICYmICF0aGlzLnZtLl9pc0Rlc3Ryb3llZFxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgZmlsdGVyICgpIHtcbiAgICB0aHJvd0Vycm9yKCdmaWx0ZXIoKSBtdXN0IGJlIGNhbGxlZCBvbiBhIFdyYXBwZXJBcnJheScpXG4gIH1cblxuICAvKipcbiAgICogRmluZHMgZmlyc3Qgbm9kZSBpbiB0cmVlIG9mIHRoZSBjdXJyZW50IHdyYXBwZXIgdGhhdFxuICAgKiBtYXRjaGVzIHRoZSBwcm92aWRlZCBzZWxlY3Rvci5cbiAgICovXG4gIGZpbmQgKHJhd1NlbGVjdG9yOiBTZWxlY3Rvcik6IFdyYXBwZXIgfCBFcnJvcldyYXBwZXIge1xuICAgIGNvbnN0IHNlbGVjdG9yID0gZ2V0U2VsZWN0b3IocmF3U2VsZWN0b3IsICdmaW5kJylcbiAgICBjb25zdCBub2RlID0gZmluZCh0aGlzLnJvb3ROb2RlLCB0aGlzLnZtLCBzZWxlY3RvcilbMF1cblxuICAgIGlmICghbm9kZSkge1xuICAgICAgaWYgKHNlbGVjdG9yLnR5cGUgPT09IFJFRl9TRUxFQ1RPUikge1xuICAgICAgICByZXR1cm4gbmV3IEVycm9yV3JhcHBlcihgcmVmPVwiJHtzZWxlY3Rvci52YWx1ZS5yZWZ9XCJgKVxuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBFcnJvcldyYXBwZXIoXG4gICAgICAgIHR5cGVvZiBzZWxlY3Rvci52YWx1ZSA9PT0gJ3N0cmluZydcbiAgICAgICAgICA/IHNlbGVjdG9yLnZhbHVlXG4gICAgICAgICAgOiAnQ29tcG9uZW50J1xuICAgICAgKVxuICAgIH1cblxuICAgIHJldHVybiBjcmVhdGVXcmFwcGVyKG5vZGUsIHRoaXMub3B0aW9ucylcbiAgfVxuXG4gIC8qKlxuICAgKiBGaW5kcyBub2RlIGluIHRyZWUgb2YgdGhlIGN1cnJlbnQgd3JhcHBlciB0aGF0IG1hdGNoZXNcbiAgICogdGhlIHByb3ZpZGVkIHNlbGVjdG9yLlxuICAgKi9cbiAgZmluZEFsbCAocmF3U2VsZWN0b3I6IFNlbGVjdG9yKTogV3JhcHBlckFycmF5IHtcbiAgICBjb25zdCBzZWxlY3RvciA9IGdldFNlbGVjdG9yKHJhd1NlbGVjdG9yLCAnZmluZEFsbCcpXG4gICAgY29uc3Qgbm9kZXMgPSBmaW5kKHRoaXMucm9vdE5vZGUsIHRoaXMudm0sIHNlbGVjdG9yKVxuICAgIGNvbnN0IHdyYXBwZXJzID0gbm9kZXMubWFwKG5vZGUgPT4ge1xuICAgICAgLy8gVXNpbmcgQ1NTIFNlbGVjdG9yLCByZXR1cm5zIGEgVnVlV3JhcHBlciBpbnN0YW5jZSBpZiB0aGUgcm9vdCBlbGVtZW50XG4gICAgICAvLyBiaW5kcyBhIFZ1ZSBpbnN0YW5jZS5cbiAgICAgIHJldHVybiBjcmVhdGVXcmFwcGVyKG5vZGUsIHRoaXMub3B0aW9ucylcbiAgICB9KVxuICAgIHJldHVybiBuZXcgV3JhcHBlckFycmF5KHdyYXBwZXJzKVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiB3cmFwcGVyIGhhcyBhbiBhdHRyaWJ1dGUgd2l0aCBtYXRjaGluZyB2YWx1ZVxuICAgKi9cbiAgaGFzQXR0cmlidXRlIChhdHRyaWJ1dGU6IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHdhcm4oXG4gICAgICBgaGFzQXR0cmlidXRlKCkgaGFzIGJlZW4gZGVwcmVjYXRlZCBhbmQgd2lsbCBiZSBgICtcbiAgICAgIGByZW1vdmVkIGluIHZlcnNpb24gMS4wLjAuIFVzZSBhdHRyaWJ1dGVzKCkgYCArXG4gICAgICBgaW5zdGVhZOKAlGh0dHBzOi8vdnVlLXRlc3QtdXRpbHMudnVlanMub3JnL2FwaS93cmFwcGVyL2F0dHJpYnV0ZXMuaHRtbGBcbiAgICApXG5cbiAgICBpZiAodHlwZW9mIGF0dHJpYnV0ZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93RXJyb3IoXG4gICAgICAgIGB3cmFwcGVyLmhhc0F0dHJpYnV0ZSgpIG11c3QgYmUgcGFzc2VkIGF0dHJpYnV0ZSBhcyBhIHN0cmluZ2BcbiAgICAgIClcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3dFcnJvcihcbiAgICAgICAgYHdyYXBwZXIuaGFzQXR0cmlidXRlKCkgbXVzdCBiZSBwYXNzZWQgdmFsdWUgYXMgYSBzdHJpbmdgXG4gICAgICApXG4gICAgfVxuXG4gICAgcmV0dXJuICEhKHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoYXR0cmlidXRlKSA9PT0gdmFsdWUpXG4gIH1cblxuICAvKipcbiAgICogQXNzZXJ0cyB3cmFwcGVyIGhhcyBhIGNsYXNzIG5hbWVcbiAgICovXG4gIGhhc0NsYXNzIChjbGFzc05hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHdhcm4oXG4gICAgICBgaGFzQ2xhc3MoKSBoYXMgYmVlbiBkZXByZWNhdGVkIGFuZCB3aWxsIGJlIHJlbW92ZWQgYCArXG4gICAgICBgaW4gdmVyc2lvbiAxLjAuMC4gVXNlIGNsYXNzZXMoKSBgICtcbiAgICAgIGBpbnN0ZWFk4oCUaHR0cHM6Ly92dWUtdGVzdC11dGlscy52dWVqcy5vcmcvYXBpL3dyYXBwZXIvY2xhc3Nlcy5odG1sYFxuICAgIClcbiAgICBsZXQgdGFyZ2V0Q2xhc3MgPSBjbGFzc05hbWVcblxuICAgIGlmICh0eXBlb2YgdGFyZ2V0Q2xhc3MgIT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvd0Vycm9yKCd3cmFwcGVyLmhhc0NsYXNzKCkgbXVzdCBiZSBwYXNzZWQgYSBzdHJpbmcnKVxuICAgIH1cblxuICAgIC8vIGlmICRzdHlsZSBpcyBhdmFpbGFibGUgYW5kIGhhcyBhIG1hdGNoaW5nIHRhcmdldCwgdXNlIHRoYXQgaW5zdGVhZC5cbiAgICBpZiAodGhpcy52bSAmJiB0aGlzLnZtLiRzdHlsZSAmJiB0aGlzLnZtLiRzdHlsZVt0YXJnZXRDbGFzc10pIHtcbiAgICAgIHRhcmdldENsYXNzID0gdGhpcy52bS4kc3R5bGVbdGFyZ2V0Q2xhc3NdXG4gICAgfVxuXG4gICAgY29uc3QgY29udGFpbnNBbGxDbGFzc2VzID0gdGFyZ2V0Q2xhc3NcbiAgICAgIC5zcGxpdCgnICcpXG4gICAgICAuZXZlcnkodGFyZ2V0ID0+IHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnModGFyZ2V0KSlcblxuICAgIHJldHVybiAhISh0aGlzLmVsZW1lbnQgJiYgY29udGFpbnNBbGxDbGFzc2VzKVxuICB9XG5cbiAgLyoqXG4gICAqIEFzc2VydHMgd3JhcHBlciBoYXMgYSBwcm9wIG5hbWVcbiAgICovXG4gIGhhc1Byb3AgKHByb3A6IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHdhcm4oXG4gICAgICBgaGFzUHJvcCgpIGhhcyBiZWVuIGRlcHJlY2F0ZWQgYW5kIHdpbGwgYmUgcmVtb3ZlZCBgICtcbiAgICAgIGBpbiB2ZXJzaW9uIDEuMC4wLiBVc2UgcHJvcHMoKSBgICtcbiAgICAgIGBpbnN0ZWFk4oCUaHR0cHM6Ly92dWUtdGVzdC11dGlscy52dWVqcy5vcmcvYXBpL3dyYXBwZXIvcHJvcHMuaHRtbGBcbiAgICApXG5cbiAgICBpZiAoIXRoaXMuaXNWdWVJbnN0YW5jZSgpKSB7XG4gICAgICB0aHJvd0Vycm9yKCd3cmFwcGVyLmhhc1Byb3AoKSBtdXN0IGJlIGNhbGxlZCBvbiBhIFZ1ZSBpbnN0YW5jZScpXG4gICAgfVxuICAgIGlmICh0eXBlb2YgcHJvcCAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93RXJyb3IoJ3dyYXBwZXIuaGFzUHJvcCgpIG11c3QgYmUgcGFzc2VkIHByb3AgYXMgYSBzdHJpbmcnKVxuICAgIH1cblxuICAgIC8vICRwcm9wcyBvYmplY3QgZG9lcyBub3QgZXhpc3QgaW4gVnVlIDIuMS54LCBzbyB1c2VcbiAgICAvLyAkb3B0aW9ucy5wcm9wc0RhdGEgaW5zdGVhZFxuICAgIGlmIChcbiAgICAgIHRoaXMudm0gJiZcbiAgICAgIHRoaXMudm0uJG9wdGlvbnMgJiZcbiAgICAgIHRoaXMudm0uJG9wdGlvbnMucHJvcHNEYXRhICYmXG4gICAgICB0aGlzLnZtLiRvcHRpb25zLnByb3BzRGF0YVtwcm9wXSA9PT0gdmFsdWVcbiAgICApIHtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuXG4gICAgcmV0dXJuICEhdGhpcy52bSAmJiAhIXRoaXMudm0uJHByb3BzICYmIHRoaXMudm0uJHByb3BzW3Byb3BdID09PSB2YWx1ZVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiB3cmFwcGVyIGhhcyBhIHN0eWxlIHdpdGggdmFsdWVcbiAgICovXG4gIGhhc1N0eWxlIChzdHlsZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgd2FybihcbiAgICAgIGBoYXNTdHlsZSgpIGhhcyBiZWVuIGRlcHJlY2F0ZWQgYW5kIHdpbGwgYmUgcmVtb3ZlZCBgICtcbiAgICAgIGBpbiB2ZXJzaW9uIDEuMC4wLiBVc2Ugd3JhcHBlci5lbGVtZW50LnN0eWxlIGAgK1xuICAgICAgYGluc3RlYWRgXG4gICAgKVxuXG4gICAgaWYgKHR5cGVvZiBzdHlsZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93RXJyb3IoYHdyYXBwZXIuaGFzU3R5bGUoKSBtdXN0IGJlIHBhc3NlZCBzdHlsZSBhcyBhIHN0cmluZ2ApXG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93RXJyb3IoJ3dyYXBwZXIuaGFzQ2xhc3MoKSBtdXN0IGJlIHBhc3NlZCB2YWx1ZSBhcyBzdHJpbmcnKVxuICAgIH1cblxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgaWYgKFxuICAgICAgbmF2aWdhdG9yLnVzZXJBZ2VudC5pbmNsdWRlcyAmJlxuICAgICAgKG5hdmlnYXRvci51c2VyQWdlbnQuaW5jbHVkZXMoJ25vZGUuanMnKSB8fFxuICAgICAgICBuYXZpZ2F0b3IudXNlckFnZW50LmluY2x1ZGVzKCdqc2RvbScpKVxuICAgICkge1xuICAgICAgd2FybihcbiAgICAgICAgYHdyYXBwZXIuaGFzU3R5bGUgaXMgbm90IGZ1bGx5IHN1cHBvcnRlZCB3aGVuIGAgK1xuICAgICAgICBgcnVubmluZyBqc2RvbSAtIG9ubHkgaW5saW5lIHN0eWxlcyBhcmUgc3VwcG9ydGVkYFxuICAgICAgKVxuICAgIH1cbiAgICBjb25zdCBib2R5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpXG4gICAgY29uc3QgbW9ja0VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuXG4gICAgaWYgKCEoYm9keSBpbnN0YW5jZW9mIEVsZW1lbnQpKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gICAgY29uc3QgbW9ja05vZGUgPSBib2R5Lmluc2VydEJlZm9yZShtb2NrRWxlbWVudCwgbnVsbClcbiAgICAvLyAkRmxvd0lnbm9yZSA6IEZsb3cgdGhpbmtzIHN0eWxlW3N0eWxlXSByZXR1cm5zIGEgbnVtYmVyXG4gICAgbW9ja0VsZW1lbnQuc3R5bGVbc3R5bGVdID0gdmFsdWVcblxuICAgIGlmICghdGhpcy5vcHRpb25zLmF0dGFjaGVkVG9Eb2N1bWVudCAmJiAodGhpcy52bSB8fCB0aGlzLnZub2RlKSkge1xuICAgICAgLy8gJEZsb3dJZ25vcmUgOiBQb3NzaWJsZSBudWxsIHZhbHVlLCB3aWxsIGJlIHJlbW92ZWQgaW4gMS4wLjBcbiAgICAgIGNvbnN0IHZtID0gdGhpcy52bSB8fCB0aGlzLnZub2RlLmNvbnRleHQuJHJvb3RcbiAgICAgIGJvZHkuaW5zZXJ0QmVmb3JlKHZtLiRyb290Ll92bm9kZS5lbG0sIG51bGwpXG4gICAgfVxuXG4gICAgY29uc3QgZWxTdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRoaXMuZWxlbWVudClbc3R5bGVdXG4gICAgY29uc3QgbW9ja05vZGVTdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKG1vY2tOb2RlKVtzdHlsZV1cbiAgICByZXR1cm4gISEoZWxTdHlsZSAmJiBtb2NrTm9kZVN0eWxlICYmIGVsU3R5bGUgPT09IG1vY2tOb2RlU3R5bGUpXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBIVE1MIG9mIGVsZW1lbnQgYXMgYSBzdHJpbmdcbiAgICovXG4gIGh0bWwgKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudC5vdXRlckhUTUxcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgbm9kZSBtYXRjaGVzIHNlbGVjdG9yXG4gICAqL1xuICBpcyAocmF3U2VsZWN0b3I6IFNlbGVjdG9yKTogYm9vbGVhbiB7XG4gICAgY29uc3Qgc2VsZWN0b3IgPSBnZXRTZWxlY3RvcihyYXdTZWxlY3RvciwgJ2lzJylcblxuICAgIGlmIChzZWxlY3Rvci50eXBlID09PSBSRUZfU0VMRUNUT1IpIHtcbiAgICAgIHRocm93RXJyb3IoJyRyZWYgc2VsZWN0b3JzIGNhbiBub3QgYmUgdXNlZCB3aXRoIHdyYXBwZXIuaXMoKScpXG4gICAgfVxuXG4gICAgcmV0dXJuIG1hdGNoZXModGhpcy5yb290Tm9kZSwgc2VsZWN0b3IpXG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIGlmIG5vZGUgaXMgZW1wdHlcbiAgICovXG4gIGlzRW1wdHkgKCk6IGJvb2xlYW4ge1xuICAgIGlmICghdGhpcy52bm9kZSkge1xuICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudC5pbm5lckhUTUwgPT09ICcnXG4gICAgfVxuICAgIGNvbnN0IG5vZGVzID0gW11cbiAgICBsZXQgbm9kZSA9IHRoaXMudm5vZGVcbiAgICBsZXQgaSA9IDBcblxuICAgIHdoaWxlIChub2RlKSB7XG4gICAgICBpZiAobm9kZS5jaGlsZCkge1xuICAgICAgICBub2Rlcy5wdXNoKG5vZGUuY2hpbGQuX3Zub2RlKVxuICAgICAgfVxuICAgICAgbm9kZS5jaGlsZHJlbiAmJiBub2RlLmNoaWxkcmVuLmZvckVhY2gobiA9PiB7XG4gICAgICAgIG5vZGVzLnB1c2gobilcbiAgICAgIH0pXG4gICAgICBub2RlID0gbm9kZXNbaSsrXVxuICAgIH1cbiAgICByZXR1cm4gbm9kZXMuZXZlcnkobiA9PiBuLmlzQ29tbWVudCB8fCBuLmNoaWxkKVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiBub2RlIGlzIHZpc2libGVcbiAgICovXG4gIGlzVmlzaWJsZSAoKTogYm9vbGVhbiB7XG4gICAgbGV0IGVsZW1lbnQgPSB0aGlzLmVsZW1lbnRcbiAgICB3aGlsZSAoZWxlbWVudCkge1xuICAgICAgaWYgKFxuICAgICAgICBlbGVtZW50LnN0eWxlICYmXG4gICAgICAgIChlbGVtZW50LnN0eWxlLnZpc2liaWxpdHkgPT09ICdoaWRkZW4nIHx8XG4gICAgICAgICAgZWxlbWVudC5zdHlsZS5kaXNwbGF5ID09PSAnbm9uZScpXG4gICAgICApIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgICBlbGVtZW50ID0gZWxlbWVudC5wYXJlbnRFbGVtZW50XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgd3JhcHBlciBpcyBhIHZ1ZSBpbnN0YW5jZVxuICAgKi9cbiAgaXNWdWVJbnN0YW5jZSAoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICEhdGhpcy52bVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgbmFtZSBvZiBjb21wb25lbnQsIG9yIHRhZyBuYW1lIGlmIG5vZGUgaXMgbm90IGEgVnVlIGNvbXBvbmVudFxuICAgKi9cbiAgbmFtZSAoKTogc3RyaW5nIHtcbiAgICBpZiAodGhpcy52bSkge1xuICAgICAgcmV0dXJuIHRoaXMudm0uJG9wdGlvbnMubmFtZSB8fFxuICAgICAgLy8gY29tcGF0IGZvciBWdWUgPCAyLjNcbiAgICAgICh0aGlzLnZtLiRvcHRpb25zLmV4dGVuZE9wdGlvbnMgJiYgdGhpcy52bS4kb3B0aW9ucy5leHRlbmRPcHRpb25zLm5hbWUpXG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLnZub2RlKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbGVtZW50LnRhZ05hbWVcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy52bm9kZS50YWdcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIE9iamVjdCBjb250YWluaW5nIHRoZSBwcm9wIG5hbWUvdmFsdWUgcGFpcnMgb24gdGhlIGVsZW1lbnRcbiAgICovXG4gIHByb3BzIChrZXk/OiBzdHJpbmcpOiB7IFtuYW1lOiBzdHJpbmddOiBhbnkgfSB8IGFueSB7XG4gICAgaWYgKHRoaXMuaXNGdW5jdGlvbmFsQ29tcG9uZW50KSB7XG4gICAgICB0aHJvd0Vycm9yKFxuICAgICAgICBgd3JhcHBlci5wcm9wcygpIGNhbm5vdCBiZSBjYWxsZWQgb24gYSBtb3VudGVkIGAgK1xuICAgICAgICAgIGBmdW5jdGlvbmFsIGNvbXBvbmVudC5gXG4gICAgICApXG4gICAgfVxuICAgIGlmICghdGhpcy52bSkge1xuICAgICAgdGhyb3dFcnJvcignd3JhcHBlci5wcm9wcygpIG11c3QgYmUgY2FsbGVkIG9uIGEgVnVlIGluc3RhbmNlJylcbiAgICB9XG5cbiAgICBjb25zdCBwcm9wcyA9IHt9XG4gICAgY29uc3Qga2V5cyA9IHRoaXMudm0gJiYgdGhpcy52bS4kb3B0aW9ucy5fcHJvcEtleXNcblxuICAgIGlmIChrZXlzKSB7XG4gICAgICAoa2V5cyB8fCB7fSkuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICBpZiAodGhpcy52bSkge1xuICAgICAgICAgIHByb3BzW2tleV0gPSB0aGlzLnZtW2tleV1cbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG5cbiAgICBpZiAoa2V5KSB7XG4gICAgICByZXR1cm4gcHJvcHNba2V5XVxuICAgIH1cblxuICAgIHJldHVybiBwcm9wc1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyByYWRpbyBidXR0b24gb3IgY2hlY2tib3ggZWxlbWVudFxuICAgKi9cbiAgc2V0Q2hlY2tlZCAoY2hlY2tlZDogYm9vbGVhbiA9IHRydWUpOiB2b2lkIHtcbiAgICBpZiAodHlwZW9mIGNoZWNrZWQgIT09ICdib29sZWFuJykge1xuICAgICAgdGhyb3dFcnJvcignd3JhcHBlci5zZXRDaGVja2VkKCkgbXVzdCBiZSBwYXNzZWQgYSBib29sZWFuJylcbiAgICB9XG4gICAgY29uc3QgdGFnTmFtZSA9IHRoaXMuZWxlbWVudC50YWdOYW1lXG4gICAgLy8gJEZsb3dJZ25vcmVcbiAgICBjb25zdCB0eXBlID0gdGhpcy5hdHRyaWJ1dGVzKCkudHlwZVxuICAgIGNvbnN0IGV2ZW50ID0gZ2V0Q2hlY2tlZEV2ZW50KClcblxuICAgIGlmICh0YWdOYW1lID09PSAnSU5QVVQnICYmIHR5cGUgPT09ICdjaGVja2JveCcpIHtcbiAgICAgIGlmICh0aGlzLmVsZW1lbnQuY2hlY2tlZCA9PT0gY2hlY2tlZCkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGlmIChldmVudCAhPT0gJ2NsaWNrJyB8fCBpc1BoYW50b21KUykge1xuICAgICAgICAvLyAkRmxvd0lnbm9yZVxuICAgICAgICB0aGlzLmVsZW1lbnQuY2hlY2tlZCA9IGNoZWNrZWRcbiAgICAgIH1cbiAgICAgIHRoaXMudHJpZ2dlcihldmVudClcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGlmICh0YWdOYW1lID09PSAnSU5QVVQnICYmIHR5cGUgPT09ICdyYWRpbycpIHtcbiAgICAgIGlmICghY2hlY2tlZCkge1xuICAgICAgICB0aHJvd0Vycm9yKFxuICAgICAgICAgIGB3cmFwcGVyLnNldENoZWNrZWQoKSBjYW5ub3QgYmUgY2FsbGVkIHdpdGggYCArXG4gICAgICAgICAgYHBhcmFtZXRlciBmYWxzZSBvbiBhIDxpbnB1dCB0eXBlPVwicmFkaW9cIiAvPiBgICtcbiAgICAgICAgICBgZWxlbWVudC5gXG4gICAgICAgIClcbiAgICAgIH1cblxuICAgICAgaWYgKGV2ZW50ICE9PSAnY2xpY2snIHx8IGlzUGhhbnRvbUpTKSB7XG4gICAgICAgIC8vICRGbG93SWdub3JlXG4gICAgICAgIHRoaXMuZWxlbWVudC5zZWxlY3RlZCA9IHRydWVcbiAgICAgIH1cbiAgICAgIHRoaXMudHJpZ2dlcihldmVudClcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHRocm93RXJyb3IoYHdyYXBwZXIuc2V0Q2hlY2tlZCgpIGNhbm5vdCBiZSBjYWxsZWQgb24gdGhpcyBlbGVtZW50YClcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWxlY3RzIDxvcHRpb24+PC9vcHRpb24+IGVsZW1lbnRcbiAgICovXG4gIHNldFNlbGVjdGVkICgpOiB2b2lkIHtcbiAgICBjb25zdCB0YWdOYW1lID0gdGhpcy5lbGVtZW50LnRhZ05hbWVcblxuICAgIGlmICh0YWdOYW1lID09PSAnU0VMRUNUJykge1xuICAgICAgdGhyb3dFcnJvcihcbiAgICAgICAgYHdyYXBwZXIuc2V0U2VsZWN0ZWQoKSBjYW5ub3QgYmUgY2FsbGVkIG9uIHNlbGVjdC4gYCArXG4gICAgICAgIGBDYWxsIGl0IG9uIG9uZSBvZiBpdHMgb3B0aW9uc2BcbiAgICAgIClcbiAgICB9XG5cbiAgICBpZiAodGFnTmFtZSA9PT0gJ09QVElPTicpIHtcbiAgICAgIC8vICRGbG93SWdub3JlXG4gICAgICB0aGlzLmVsZW1lbnQuc2VsZWN0ZWQgPSB0cnVlXG4gICAgICAvLyAkRmxvd0lnbm9yZVxuICAgICAgbGV0IHBhcmVudEVsZW1lbnQgPSB0aGlzLmVsZW1lbnQucGFyZW50RWxlbWVudFxuXG4gICAgICAvLyAkRmxvd0lnbm9yZVxuICAgICAgaWYgKHBhcmVudEVsZW1lbnQudGFnTmFtZSA9PT0gJ09QVEdST1VQJykge1xuICAgICAgICAvLyAkRmxvd0lnbm9yZVxuICAgICAgICBwYXJlbnRFbGVtZW50ID0gcGFyZW50RWxlbWVudC5wYXJlbnRFbGVtZW50XG4gICAgICB9XG5cbiAgICAgIC8vICRGbG93SWdub3JlXG4gICAgICBjcmVhdGVXcmFwcGVyKHBhcmVudEVsZW1lbnQsIHRoaXMub3B0aW9ucykudHJpZ2dlcignY2hhbmdlJylcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHRocm93RXJyb3IoYHdyYXBwZXIuc2V0U2VsZWN0ZWQoKSBjYW5ub3QgYmUgY2FsbGVkIG9uIHRoaXMgZWxlbWVudGApXG4gIH1cblxuICAvKipcbiAgICogU2V0cyB2bSBjb21wdXRlZFxuICAgKi9cbiAgc2V0Q29tcHV0ZWQgKGNvbXB1dGVkOiBPYmplY3QpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuaXNWdWVJbnN0YW5jZSgpKSB7XG4gICAgICB0aHJvd0Vycm9yKFxuICAgICAgICBgd3JhcHBlci5zZXRDb21wdXRlZCgpIGNhbiBvbmx5IGJlIGNhbGxlZCBvbiBhIFZ1ZSBgICtcbiAgICAgICAgYGluc3RhbmNlYFxuICAgICAgKVxuICAgIH1cblxuICAgIHdhcm4oXG4gICAgICBgc2V0Q29tcHV0ZWQoKSBoYXMgYmVlbiBkZXByZWNhdGVkIGFuZCB3aWxsIGJlIGAgK1xuICAgICAgICBgcmVtb3ZlZCBpbiB2ZXJzaW9uIDEuMC4wLiBZb3UgY2FuIG92ZXJ3cml0ZSBgICtcbiAgICAgICAgYGNvbXB1dGVkIHByb3BlcnRpZXMgYnkgcGFzc2luZyBhIGNvbXB1dGVkIG9iamVjdCBgICtcbiAgICAgICAgYGluIHRoZSBtb3VudGluZyBvcHRpb25zYFxuICAgIClcblxuICAgIE9iamVjdC5rZXlzKGNvbXB1dGVkKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICBpZiAoVlVFX1ZFUlNJT04gPiAyLjEpIHtcbiAgICAgICAgLy8gJEZsb3dJZ25vcmUgOiBQcm9ibGVtIHdpdGggcG9zc2libHkgbnVsbCB0aGlzLnZtXG4gICAgICAgIGlmICghdGhpcy52bS5fY29tcHV0ZWRXYXRjaGVyc1trZXldKSB7XG4gICAgICAgICAgdGhyb3dFcnJvcihcbiAgICAgICAgICAgIGB3cmFwcGVyLnNldENvbXB1dGVkKCkgd2FzIHBhc3NlZCBhIHZhbHVlIHRoYXQgYCArXG4gICAgICAgICAgICBgZG9lcyBub3QgZXhpc3QgYXMgYSBjb21wdXRlZCBwcm9wZXJ0eSBvbiB0aGUgYCArXG4gICAgICAgICAgICBgVnVlIGluc3RhbmNlLiBQcm9wZXJ0eSAke2tleX0gZG9lcyBub3QgZXhpc3QgYCArXG4gICAgICAgICAgICBgb24gdGhlIFZ1ZSBpbnN0YW5jZWBcbiAgICAgICAgICApXG4gICAgICAgIH1cbiAgICAgICAgLy8gJEZsb3dJZ25vcmUgOiBQcm9ibGVtIHdpdGggcG9zc2libHkgbnVsbCB0aGlzLnZtXG4gICAgICAgIHRoaXMudm0uX2NvbXB1dGVkV2F0Y2hlcnNba2V5XS52YWx1ZSA9IGNvbXB1dGVkW2tleV1cbiAgICAgICAgLy8gJEZsb3dJZ25vcmUgOiBQcm9ibGVtIHdpdGggcG9zc2libHkgbnVsbCB0aGlzLnZtXG4gICAgICAgIHRoaXMudm0uX2NvbXB1dGVkV2F0Y2hlcnNba2V5XS5nZXR0ZXIgPSAoKSA9PiBjb21wdXRlZFtrZXldXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgaXNTdG9yZSA9IGZhbHNlXG4gICAgICAgIC8vICRGbG93SWdub3JlIDogUHJvYmxlbSB3aXRoIHBvc3NpYmx5IG51bGwgdGhpcy52bVxuICAgICAgICB0aGlzLnZtLl93YXRjaGVycy5mb3JFYWNoKHdhdGNoZXIgPT4ge1xuICAgICAgICAgIGlmICh3YXRjaGVyLmdldHRlci52dWV4ICYmIGtleSBpbiB3YXRjaGVyLnZtLiRvcHRpb25zLnN0b3JlLmdldHRlcnMpIHtcbiAgICAgICAgICAgIHdhdGNoZXIudm0uJG9wdGlvbnMuc3RvcmUuZ2V0dGVycyA9IHtcbiAgICAgICAgICAgICAgLi4ud2F0Y2hlci52bS4kb3B0aW9ucy5zdG9yZS5nZXR0ZXJzXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkod2F0Y2hlci52bS4kb3B0aW9ucy5zdG9yZS5nZXR0ZXJzLCBrZXksIHtcbiAgICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbXB1dGVkW2tleV1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIGlzU3RvcmUgPSB0cnVlXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuXG4gICAgICAgIC8vICRGbG93SWdub3JlIDogUHJvYmxlbSB3aXRoIHBvc3NpYmx5IG51bGwgdGhpcy52bVxuICAgICAgICBpZiAoIWlzU3RvcmUgJiYgIXRoaXMudm0uX3dhdGNoZXJzLnNvbWUodyA9PiB3LmdldHRlci5uYW1lID09PSBrZXkpKSB7XG4gICAgICAgICAgdGhyb3dFcnJvcihcbiAgICAgICAgICAgIGB3cmFwcGVyLnNldENvbXB1dGVkKCkgd2FzIHBhc3NlZCBhIHZhbHVlIHRoYXQgZG9lcyBgICtcbiAgICAgICAgICAgIGBub3QgZXhpc3QgYXMgYSBjb21wdXRlZCBwcm9wZXJ0eSBvbiB0aGUgVnVlIGluc3RhbmNlLiBgICtcbiAgICAgICAgICAgIGBQcm9wZXJ0eSAke2tleX0gZG9lcyBub3QgZXhpc3Qgb24gdGhlIFZ1ZSBpbnN0YW5jZWBcbiAgICAgICAgICApXG4gICAgICAgIH1cbiAgICAgICAgLy8gJEZsb3dJZ25vcmUgOiBQcm9ibGVtIHdpdGggcG9zc2libHkgbnVsbCB0aGlzLnZtXG4gICAgICAgIHRoaXMudm0uX3dhdGNoZXJzLmZvckVhY2god2F0Y2hlciA9PiB7XG4gICAgICAgICAgaWYgKHdhdGNoZXIuZ2V0dGVyLm5hbWUgPT09IGtleSkge1xuICAgICAgICAgICAgd2F0Y2hlci52YWx1ZSA9IGNvbXB1dGVkW2tleV1cbiAgICAgICAgICAgIHdhdGNoZXIuZ2V0dGVyID0gKCkgPT4gY29tcHV0ZWRba2V5XVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9KVxuICAgIC8vICRGbG93SWdub3JlIDogUHJvYmxlbSB3aXRoIHBvc3NpYmx5IG51bGwgdGhpcy52bVxuICAgIHRoaXMudm0uX3dhdGNoZXJzLmZvckVhY2god2F0Y2hlciA9PiB7XG4gICAgICB3YXRjaGVyLnJ1bigpXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHZtIGRhdGFcbiAgICovXG4gIHNldERhdGEgKGRhdGE6IE9iamVjdCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmlzRnVuY3Rpb25hbENvbXBvbmVudCkge1xuICAgICAgdGhyb3dFcnJvcihcbiAgICAgICAgYHdyYXBwZXIuc2V0RGF0YSgpIGNhbm5vdCBiZSBjYWxsZWQgb24gYSBmdW5jdGlvbmFsIGAgK1xuICAgICAgICBgY29tcG9uZW50YFxuICAgICAgKVxuICAgIH1cblxuICAgIGlmICghdGhpcy52bSkge1xuICAgICAgdGhyb3dFcnJvcihcbiAgICAgICAgYHdyYXBwZXIuc2V0RGF0YSgpIGNhbiBvbmx5IGJlIGNhbGxlZCBvbiBhIFZ1ZSBgICtcbiAgICAgICAgYGluc3RhbmNlYFxuICAgICAgKVxuICAgIH1cblxuICAgIHJlY3Vyc2l2ZWx5U2V0RGF0YSh0aGlzLnZtLCB0aGlzLnZtLCBkYXRhKVxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdm0gbWV0aG9kc1xuICAgKi9cbiAgc2V0TWV0aG9kcyAobWV0aG9kczogT2JqZWN0KTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmlzVnVlSW5zdGFuY2UoKSkge1xuICAgICAgdGhyb3dFcnJvcihcbiAgICAgICAgYHdyYXBwZXIuc2V0TWV0aG9kcygpIGNhbiBvbmx5IGJlIGNhbGxlZCBvbiBhIFZ1ZSBgICtcbiAgICAgICAgYGluc3RhbmNlYFxuICAgICAgKVxuICAgIH1cbiAgICBPYmplY3Qua2V5cyhtZXRob2RzKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAvLyAkRmxvd0lnbm9yZSA6IFByb2JsZW0gd2l0aCBwb3NzaWJseSBudWxsIHRoaXMudm1cbiAgICAgIHRoaXMudm1ba2V5XSA9IG1ldGhvZHNba2V5XVxuICAgICAgLy8gJEZsb3dJZ25vcmUgOiBQcm9ibGVtIHdpdGggcG9zc2libHkgbnVsbCB0aGlzLnZtXG4gICAgICB0aGlzLnZtLiRvcHRpb25zLm1ldGhvZHNba2V5XSA9IG1ldGhvZHNba2V5XVxuICAgIH0pXG5cbiAgICBpZiAodGhpcy52bm9kZSkge1xuICAgICAgY29uc3QgY29udGV4dCA9IHRoaXMudm5vZGUuY29udGV4dFxuICAgICAgaWYgKGNvbnRleHQuJG9wdGlvbnMucmVuZGVyKSBjb250ZXh0Ll91cGRhdGUoY29udGV4dC5fcmVuZGVyKCkpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdm0gcHJvcHNcbiAgICovXG4gIHNldFByb3BzIChkYXRhOiBPYmplY3QpOiB2b2lkIHtcbiAgICBjb25zdCBvcmlnaW5hbENvbmZpZyA9IFZ1ZS5jb25maWcuc2lsZW50XG4gICAgVnVlLmNvbmZpZy5zaWxlbnQgPSBjb25maWcuc2lsZW50XG4gICAgaWYgKHRoaXMuaXNGdW5jdGlvbmFsQ29tcG9uZW50KSB7XG4gICAgICB0aHJvd0Vycm9yKFxuICAgICAgICBgd3JhcHBlci5zZXRQcm9wcygpIGNhbm5vdCBiZSBjYWxsZWQgb24gYSBgICtcbiAgICAgICAgYGZ1bmN0aW9uYWwgY29tcG9uZW50YFxuICAgICAgKVxuICAgIH1cbiAgICBpZiAoIXRoaXMudm0pIHtcbiAgICAgIHRocm93RXJyb3IoXG4gICAgICAgIGB3cmFwcGVyLnNldFByb3BzKCkgY2FuIG9ubHkgYmUgY2FsbGVkIG9uIGEgVnVlIGAgK1xuICAgICAgICBgaW5zdGFuY2VgXG4gICAgICApXG4gICAgfVxuXG4gICAgT2JqZWN0LmtleXMoZGF0YSkuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgaWYgKFxuICAgICAgICB0eXBlb2YgZGF0YVtrZXldID09PSAnb2JqZWN0JyAmJlxuICAgICAgICBkYXRhW2tleV0gIT09IG51bGwgJiZcbiAgICAgICAgLy8gJEZsb3dJZ25vcmUgOiBQcm9ibGVtIHdpdGggcG9zc2libHkgbnVsbCB0aGlzLnZtXG4gICAgICAgIGRhdGFba2V5XSA9PT0gdGhpcy52bVtrZXldXG4gICAgICApIHtcbiAgICAgICAgdGhyb3dFcnJvcihcbiAgICAgICAgICBgd3JhcHBlci5zZXRQcm9wcygpIGNhbGxlZCB3aXRoIHRoZSBzYW1lIG9iamVjdCBgICtcbiAgICAgICAgICBgb2YgdGhlIGV4aXN0aW5nICR7a2V5fSBwcm9wZXJ0eS4gYCArXG4gICAgICAgICAgYFlvdSBtdXN0IGNhbGwgd3JhcHBlci5zZXRQcm9wcygpIHdpdGggYSBuZXcgb2JqZWN0IGAgK1xuICAgICAgICAgIGB0byB0cmlnZ2VyIHJlYWN0aXZpdHlgXG4gICAgICAgIClcbiAgICAgIH1cbiAgICAgIGlmIChcbiAgICAgICAgIXRoaXMudm0gfHxcbiAgICAgICAgIXRoaXMudm0uJG9wdGlvbnMuX3Byb3BLZXlzIHx8XG4gICAgICAgICF0aGlzLnZtLiRvcHRpb25zLl9wcm9wS2V5cy5zb21lKHByb3AgPT4gcHJvcCA9PT0ga2V5KVxuICAgICAgKSB7XG4gICAgICAgIGlmIChWVUVfVkVSU0lPTiA+IDIuMykge1xuICAgICAgICAgIC8vICRGbG93SWdub3JlIDogUHJvYmxlbSB3aXRoIHBvc3NpYmx5IG51bGwgdGhpcy52bVxuICAgICAgICAgIHRoaXMudm0uJGF0dHJzW2tleV0gPSBkYXRhW2tleV1cbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICB0aHJvd0Vycm9yKFxuICAgICAgICAgIGB3cmFwcGVyLnNldFByb3BzKCkgY2FsbGVkIHdpdGggJHtrZXl9IHByb3BlcnR5IHdoaWNoIGAgK1xuICAgICAgICAgIGBpcyBub3QgZGVmaW5lZCBvbiB0aGUgY29tcG9uZW50YFxuICAgICAgICApXG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLnZtICYmIHRoaXMudm0uX3Byb3BzKSB7XG4gICAgICAgIC8vIFNldCBhY3R1YWwgcHJvcHMgdmFsdWVcbiAgICAgICAgdGhpcy52bS5fcHJvcHNba2V5XSA9IGRhdGFba2V5XVxuICAgICAgICAvLyAkRmxvd0lnbm9yZSA6IFByb2JsZW0gd2l0aCBwb3NzaWJseSBudWxsIHRoaXMudm1cbiAgICAgICAgdGhpcy52bVtrZXldID0gZGF0YVtrZXldXG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyAkRmxvd0lnbm9yZSA6IFByb2JsZW0gd2l0aCBwb3NzaWJseSBudWxsIHRoaXMudm0uJG9wdGlvbnNcbiAgICAgICAgdGhpcy52bS4kb3B0aW9ucy5wcm9wc0RhdGFba2V5XSA9IGRhdGFba2V5XVxuICAgICAgICAvLyAkRmxvd0lnbm9yZSA6IFByb2JsZW0gd2l0aCBwb3NzaWJseSBudWxsIHRoaXMudm1cbiAgICAgICAgdGhpcy52bVtrZXldID0gZGF0YVtrZXldXG4gICAgICAgIC8vICRGbG93SWdub3JlIDogTmVlZCB0byBjYWxsIHRoaXMgdHdpY2UgdG8gZml4IHdhdGNoZXIgYnVnIGluIDIuMC54XG4gICAgICAgIHRoaXMudm1ba2V5XSA9IGRhdGFba2V5XVxuICAgICAgfVxuICAgIH0pXG4gICAgLy8gJEZsb3dJZ25vcmUgOiBQcm9ibGVtIHdpdGggcG9zc2libHkgbnVsbCB0aGlzLnZtXG4gICAgdGhpcy52bS4kZm9yY2VVcGRhdGUoKVxuICAgIC8vICRGbG93SWdub3JlIDogUHJvYmxlbSB3aXRoIHBvc3NpYmx5IG51bGwgdGhpcy52bVxuICAgIG9yZGVyV2F0Y2hlcnModGhpcy52bSB8fCB0aGlzLnZub2RlLmNvbnRleHQuJHJvb3QpXG4gICAgVnVlLmNvbmZpZy5zaWxlbnQgPSBvcmlnaW5hbENvbmZpZ1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgZWxlbWVudCB2YWx1ZSBhbmQgdHJpZ2dlcnMgaW5wdXQgZXZlbnRcbiAgICovXG4gIHNldFZhbHVlICh2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgY29uc3QgdGFnTmFtZSA9IHRoaXMuZWxlbWVudC50YWdOYW1lXG4gICAgLy8gJEZsb3dJZ25vcmVcbiAgICBjb25zdCB0eXBlID0gdGhpcy5hdHRyaWJ1dGVzKCkudHlwZVxuXG4gICAgaWYgKHRhZ05hbWUgPT09ICdPUFRJT04nKSB7XG4gICAgICB0aHJvd0Vycm9yKFxuICAgICAgICBgd3JhcHBlci5zZXRWYWx1ZSgpIGNhbm5vdCBiZSBjYWxsZWQgb24gYW4gPG9wdGlvbj4gYCArXG4gICAgICAgICAgYGVsZW1lbnQuIFVzZSB3cmFwcGVyLnNldFNlbGVjdGVkKCkgaW5zdGVhZGBcbiAgICAgIClcbiAgICB9IGVsc2UgaWYgKHRhZ05hbWUgPT09ICdJTlBVVCcgJiYgdHlwZSA9PT0gJ2NoZWNrYm94Jykge1xuICAgICAgdGhyb3dFcnJvcihcbiAgICAgICAgYHdyYXBwZXIuc2V0VmFsdWUoKSBjYW5ub3QgYmUgY2FsbGVkIG9uIGEgPGlucHV0IGAgK1xuICAgICAgICAgIGB0eXBlPVwiY2hlY2tib3hcIiAvPiBlbGVtZW50LiBVc2UgYCArXG4gICAgICAgICAgYHdyYXBwZXIuc2V0Q2hlY2tlZCgpIGluc3RlYWRgXG4gICAgICApXG4gICAgfSBlbHNlIGlmICh0YWdOYW1lID09PSAnSU5QVVQnICYmIHR5cGUgPT09ICdyYWRpbycpIHtcbiAgICAgIHRocm93RXJyb3IoXG4gICAgICAgIGB3cmFwcGVyLnNldFZhbHVlKCkgY2Fubm90IGJlIGNhbGxlZCBvbiBhIDxpbnB1dCBgICtcbiAgICAgICAgICBgdHlwZT1cInJhZGlvXCIgLz4gZWxlbWVudC4gVXNlIHdyYXBwZXIuc2V0Q2hlY2tlZCgpIGAgK1xuICAgICAgICAgIGBpbnN0ZWFkYFxuICAgICAgKVxuICAgIH0gZWxzZSBpZiAoXG4gICAgICB0YWdOYW1lID09PSAnSU5QVVQnIHx8XG4gICAgICB0YWdOYW1lID09PSAnVEVYVEFSRUEnIHx8XG4gICAgICB0YWdOYW1lID09PSAnU0VMRUNUJ1xuICAgICkge1xuICAgICAgY29uc3QgZXZlbnQgPSB0YWdOYW1lID09PSAnU0VMRUNUJyA/ICdjaGFuZ2UnIDogJ2lucHV0J1xuICAgICAgLy8gJEZsb3dJZ25vcmVcbiAgICAgIHRoaXMuZWxlbWVudC52YWx1ZSA9IHZhbHVlXG4gICAgICB0aGlzLnRyaWdnZXIoZXZlbnQpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93RXJyb3IoYHdyYXBwZXIuc2V0VmFsdWUoKSBjYW5ub3QgYmUgY2FsbGVkIG9uIHRoaXMgZWxlbWVudGApXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiB0ZXh0IG9mIHdyYXBwZXIgZWxlbWVudFxuICAgKi9cbiAgdGV4dCAoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50LnRleHRDb250ZW50LnRyaW0oKVxuICB9XG5cbiAgLyoqXG4gICAqIERpc3BhdGNoZXMgYSBET00gZXZlbnQgb24gd3JhcHBlclxuICAgKi9cbiAgdHJpZ2dlciAodHlwZTogc3RyaW5nLCBvcHRpb25zOiBPYmplY3QgPSB7fSkge1xuICAgIGlmICh0eXBlb2YgdHlwZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93RXJyb3IoJ3dyYXBwZXIudHJpZ2dlcigpIG11c3QgYmUgcGFzc2VkIGEgc3RyaW5nJylcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucy50YXJnZXQpIHtcbiAgICAgIHRocm93RXJyb3IoXG4gICAgICAgIGB5b3UgY2Fubm90IHNldCB0aGUgdGFyZ2V0IHZhbHVlIG9mIGFuIGV2ZW50LiBTZWUgYCArXG4gICAgICAgICAgYHRoZSBub3RlcyBzZWN0aW9uIG9mIHRoZSBkb2NzIGZvciBtb3JlIGAgK1xuICAgICAgICAgIGBkZXRhaWxz4oCUaHR0cHM6Ly92dWUtdGVzdC11dGlscy52dWVqcy5vcmcvYXBpL3dyYXBwZXIvdHJpZ2dlci5odG1sYFxuICAgICAgKVxuICAgIH1cblxuICAgIC8vIERvbid0IGZpcmUgZXZlbnQgb24gYSBkaXNhYmxlZCBlbGVtZW50XG4gICAgaWYgKHRoaXMuYXR0cmlidXRlcygpLmRpc2FibGVkKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCBldmVudCA9IGNyZWF0ZURPTUV2ZW50KHR5cGUsIG9wdGlvbnMpXG4gICAgdGhpcy5lbGVtZW50LmRpc3BhdGNoRXZlbnQoZXZlbnQpXG5cbiAgICBpZiAodGhpcy52bm9kZSkge1xuICAgICAgb3JkZXJXYXRjaGVycyh0aGlzLnZtIHx8IHRoaXMudm5vZGUuY29udGV4dC4kcm9vdClcbiAgICB9XG4gIH1cblxuICB1cGRhdGUgKCk6IHZvaWQge1xuICAgIHdhcm4oXG4gICAgICBgdXBkYXRlIGhhcyBiZWVuIHJlbW92ZWQgZnJvbSB2dWUtdGVzdC11dGlscy4gQWxsIGAgK1xuICAgICAgYHVwZGF0ZXMgYXJlIG5vdyBzeW5jaHJvbm91cyBieSBkZWZhdWx0YFxuICAgIClcbiAgfVxuXG4gIC8qKlxuICAgKiBVdGlsaXR5IHRvIGNoZWNrIHdyYXBwZXIgaXMgdmlzaWJsZS4gUmV0dXJucyBmYWxzZSBpZiBhIHBhcmVudFxuICAgKiBlbGVtZW50IGhhcyBkaXNwbGF5OiBub25lIG9yIHZpc2liaWxpdHk6IGhpZGRlbiBzdHlsZS5cbiAgICovXG4gIHZpc2libGUgKCk6IGJvb2xlYW4ge1xuICAgIHdhcm4oXG4gICAgICBgdmlzaWJsZSBoYXMgYmVlbiBkZXByZWNhdGVkIGFuZCB3aWxsIGJlIHJlbW92ZWQgaW4gYCArXG4gICAgICBgdmVyc2lvbiAxLCB1c2UgaXNWaXNpYmxlIGluc3RlYWRgXG4gICAgKVxuICAgIGxldCBlbGVtZW50ID0gdGhpcy5lbGVtZW50XG4gICAgd2hpbGUgKGVsZW1lbnQpIHtcbiAgICAgIGlmIChcbiAgICAgICAgZWxlbWVudC5zdHlsZSAmJlxuICAgICAgICAoZWxlbWVudC5zdHlsZS52aXNpYmlsaXR5ID09PSAnaGlkZGVuJyB8fFxuICAgICAgICAgIGVsZW1lbnQuc3R5bGUuZGlzcGxheSA9PT0gJ25vbmUnKVxuICAgICAgKSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgICAgZWxlbWVudCA9IGVsZW1lbnQucGFyZW50RWxlbWVudFxuICAgIH1cblxuICAgIHJldHVybiB0cnVlXG4gIH1cbn1cbiIsIi8vIEBmbG93XG5cbmltcG9ydCB7IFZVRV9WRVJTSU9OIH0gZnJvbSAnc2hhcmVkL2NvbnN0cydcblxuZnVuY3Rpb24gc2V0RGVwc1N5bmMgKGRlcCk6IHZvaWQge1xuICBkZXAuc3Vicy5mb3JFYWNoKHNldFdhdGNoZXJTeW5jKVxufVxuXG5mdW5jdGlvbiBzZXRXYXRjaGVyU3luYyAod2F0Y2hlcik6IHZvaWQge1xuICBpZiAod2F0Y2hlci5zeW5jID09PSB0cnVlKSB7XG4gICAgcmV0dXJuXG4gIH1cbiAgd2F0Y2hlci5zeW5jID0gdHJ1ZVxuICB3YXRjaGVyLmRlcHMuZm9yRWFjaChzZXREZXBzU3luYylcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldFdhdGNoZXJzVG9TeW5jICh2bTogQ29tcG9uZW50KTogdm9pZCB7XG4gIGlmICh2bS5fd2F0Y2hlcnMpIHtcbiAgICB2bS5fd2F0Y2hlcnMuZm9yRWFjaChzZXRXYXRjaGVyU3luYylcbiAgfVxuXG4gIGlmICh2bS5fY29tcHV0ZWRXYXRjaGVycykge1xuICAgIE9iamVjdC5rZXlzKHZtLl9jb21wdXRlZFdhdGNoZXJzKS5mb3JFYWNoKGNvbXB1dGVkV2F0Y2hlciA9PiB7XG4gICAgICBzZXRXYXRjaGVyU3luYyh2bS5fY29tcHV0ZWRXYXRjaGVyc1tjb21wdXRlZFdhdGNoZXJdKVxuICAgIH0pXG4gIH1cblxuICBzZXRXYXRjaGVyU3luYyh2bS5fd2F0Y2hlcilcblxuICB2bS4kY2hpbGRyZW4uZm9yRWFjaChzZXRXYXRjaGVyc1RvU3luYylcbiAgLy8gcHJldmVudGluZyBkb3VibGUgcmVnaXN0cmF0aW9uXG4gIGlmICghdm0uJF92dWVUZXN0VXRpbHNfdXBkYXRlSW5TZXRXYXRjaGVyU3luYykge1xuICAgIHZtLiRfdnVlVGVzdFV0aWxzX3VwZGF0ZUluU2V0V2F0Y2hlclN5bmMgPSB2bS5fdXBkYXRlXG4gICAgdm0uX3VwZGF0ZSA9IGZ1bmN0aW9uICh2bm9kZSwgaHlkcmF0aW5nKSB7XG4gICAgICB0aGlzLiRfdnVlVGVzdFV0aWxzX3VwZGF0ZUluU2V0V2F0Y2hlclN5bmModm5vZGUsIGh5ZHJhdGluZylcbiAgICAgIGlmIChWVUVfVkVSU0lPTiA+PSAyLjEgJiYgdGhpcy5faXNNb3VudGVkICYmIHRoaXMuJG9wdGlvbnMudXBkYXRlZCkge1xuICAgICAgICB0aGlzLiRvcHRpb25zLnVwZGF0ZWQuZm9yRWFjaChoYW5kbGVyID0+IHtcbiAgICAgICAgICBoYW5kbGVyLmNhbGwodGhpcylcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiIsIi8vIEBmbG93XG5cbmltcG9ydCBXcmFwcGVyIGZyb20gJy4vd3JhcHBlcidcbmltcG9ydCB7IHRocm93RXJyb3IgfSBmcm9tICdzaGFyZWQvdXRpbCdcbmltcG9ydCB7IHNldFdhdGNoZXJzVG9TeW5jIH0gZnJvbSAnLi9zZXQtd2F0Y2hlcnMtdG8tc3luYydcbmltcG9ydCB7IG9yZGVyV2F0Y2hlcnMgfSBmcm9tICcuL29yZGVyLXdhdGNoZXJzJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBWdWVXcmFwcGVyIGV4dGVuZHMgV3JhcHBlciBpbXBsZW1lbnRzIEJhc2VXcmFwcGVyIHtcbiAgY29uc3RydWN0b3IgKHZtOiBDb21wb25lbnQsIG9wdGlvbnM6IFdyYXBwZXJPcHRpb25zKSB7XG4gICAgc3VwZXIodm0uX3Zub2RlLCBvcHRpb25zLCB0cnVlKVxuICAgIC8vICRGbG93SWdub3JlIDogaXNzdWUgd2l0aCBkZWZpbmVQcm9wZXJ0eVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAncm9vdE5vZGUnLCB7XG4gICAgICBnZXQ6ICgpID0+IHZtLiR2bm9kZSB8fCB7IGNoaWxkOiB0aGlzLnZtIH0sXG4gICAgICBzZXQ6ICgpID0+IHRocm93RXJyb3IoJ3dyYXBwZXIudm5vZGUgaXMgcmVhZC1vbmx5JylcbiAgICB9KVxuICAgIC8vICRGbG93SWdub3JlIDogaXNzdWUgd2l0aCBkZWZpbmVQcm9wZXJ0eVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAndm5vZGUnLCB7XG4gICAgICBnZXQ6ICgpID0+IHZtLl92bm9kZSxcbiAgICAgIHNldDogKCkgPT4gdGhyb3dFcnJvcignd3JhcHBlci52bm9kZSBpcyByZWFkLW9ubHknKVxuICAgIH0pXG4gICAgLy8gJEZsb3dJZ25vcmVcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2VsZW1lbnQnLCB7XG4gICAgICBnZXQ6ICgpID0+IHZtLiRlbCxcbiAgICAgIHNldDogKCkgPT4gdGhyb3dFcnJvcignd3JhcHBlci5lbGVtZW50IGlzIHJlYWQtb25seScpXG4gICAgfSlcbiAgICAvLyAkRmxvd0lnbm9yZVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAndm0nLCB7XG4gICAgICBnZXQ6ICgpID0+IHZtLFxuICAgICAgc2V0OiAoKSA9PiB0aHJvd0Vycm9yKCd3cmFwcGVyLnZtIGlzIHJlYWQtb25seScpXG4gICAgfSlcbiAgICBpZiAob3B0aW9ucy5zeW5jKSB7XG4gICAgICBzZXRXYXRjaGVyc1RvU3luYyh2bSlcbiAgICAgIG9yZGVyV2F0Y2hlcnModm0pXG4gICAgfVxuICAgIHRoaXMuaXNGdW5jdGlvbmFsQ29tcG9uZW50ID0gdm0uJG9wdGlvbnMuX2lzRnVuY3Rpb25hbENvbnRhaW5lclxuICAgIHRoaXMuX2VtaXR0ZWQgPSB2bS5fX2VtaXR0ZWRcbiAgICB0aGlzLl9lbWl0dGVkQnlPcmRlciA9IHZtLl9fZW1pdHRlZEJ5T3JkZXJcbiAgfVxufVxuIiwiLy8gQGZsb3dcblxuaW1wb3J0IHsgY29tcGlsZVRvRnVuY3Rpb25zIH0gZnJvbSAndnVlLXRlbXBsYXRlLWNvbXBpbGVyJ1xuXG5mdW5jdGlvbiBjcmVhdGVWTm9kZXMgKFxuICB2bTogQ29tcG9uZW50LFxuICBzbG90VmFsdWU6IHN0cmluZyxcbiAgbmFtZVxuKTogQXJyYXk8Vk5vZGU+IHtcbiAgY29uc3QgZWwgPSBjb21waWxlVG9GdW5jdGlvbnMoXG4gICAgYDxkaXY+PHRlbXBsYXRlIHNsb3Q9JHtuYW1lfT4ke3Nsb3RWYWx1ZX08L3RlbXBsYXRlPjwvZGl2PmBcbiAgKVxuICBjb25zdCBfc3RhdGljUmVuZGVyRm5zID0gdm0uX3JlbmRlclByb3h5LiRvcHRpb25zLnN0YXRpY1JlbmRlckZuc1xuICBjb25zdCBfc3RhdGljVHJlZXMgPSB2bS5fcmVuZGVyUHJveHkuX3N0YXRpY1RyZWVzXG4gIHZtLl9yZW5kZXJQcm94eS5fc3RhdGljVHJlZXMgPSBbXVxuICB2bS5fcmVuZGVyUHJveHkuJG9wdGlvbnMuc3RhdGljUmVuZGVyRm5zID0gZWwuc3RhdGljUmVuZGVyRm5zXG4gIGNvbnN0IHZub2RlID0gZWwucmVuZGVyLmNhbGwodm0uX3JlbmRlclByb3h5LCB2bS4kY3JlYXRlRWxlbWVudClcbiAgdm0uX3JlbmRlclByb3h5LiRvcHRpb25zLnN0YXRpY1JlbmRlckZucyA9IF9zdGF0aWNSZW5kZXJGbnNcbiAgdm0uX3JlbmRlclByb3h5Ll9zdGF0aWNUcmVlcyA9IF9zdGF0aWNUcmVlc1xuICByZXR1cm4gdm5vZGUuY2hpbGRyZW5bMF1cbn1cblxuZnVuY3Rpb24gY3JlYXRlVk5vZGVzRm9yU2xvdCAoXG4gIHZtOiBDb21wb25lbnQsXG4gIHNsb3RWYWx1ZTogU2xvdFZhbHVlLFxuICBuYW1lOiBzdHJpbmcsXG4pOiBWTm9kZSB8IEFycmF5PFZOb2RlPiB7XG4gIGlmICh0eXBlb2Ygc2xvdFZhbHVlID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBjcmVhdGVWTm9kZXModm0sIHNsb3RWYWx1ZSwgbmFtZSlcbiAgfVxuICBjb25zdCB2bm9kZSA9IHZtLiRjcmVhdGVFbGVtZW50KHNsb3RWYWx1ZSlcbiAgOyh2bm9kZS5kYXRhIHx8ICh2bm9kZS5kYXRhID0ge30pKS5zbG90ID0gbmFtZVxuICByZXR1cm4gdm5vZGVcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVNsb3RWTm9kZXMgKFxuICB2bTogQ29tcG9uZW50LFxuICBzbG90czogU2xvdHNPYmplY3Rcbik6IEFycmF5PFZOb2RlIHwgQXJyYXk8Vk5vZGU+PiB7XG4gIHJldHVybiBPYmplY3Qua2V5cyhzbG90cykucmVkdWNlKChhY2MsIGtleSkgPT4ge1xuICAgIGNvbnN0IGNvbnRlbnQgPSBzbG90c1trZXldXG4gICAgaWYgKEFycmF5LmlzQXJyYXkoY29udGVudCkpIHtcbiAgICAgIGNvbnN0IG5vZGVzID0gY29udGVudC5tYXAoXG4gICAgICAgIHNsb3REZWYgPT4gY3JlYXRlVk5vZGVzRm9yU2xvdCh2bSwgc2xvdERlZiwga2V5KVxuICAgICAgKVxuICAgICAgcmV0dXJuIGFjYy5jb25jYXQobm9kZXMpXG4gICAgfVxuXG4gICAgcmV0dXJuIGFjYy5jb25jYXQoY3JlYXRlVk5vZGVzRm9yU2xvdCh2bSwgY29udGVudCwga2V5KSlcbiAgfSwgW10pXG59XG4iLCIvLyBAZmxvd1xuaW1wb3J0ICQkVnVlIGZyb20gJ3Z1ZSdcbmltcG9ydCB7IHdhcm4gfSBmcm9tICdzaGFyZWQvdXRpbCdcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gYWRkTW9ja3MgKFxuICBfVnVlOiBDb21wb25lbnQsXG4gIG1vY2tlZFByb3BlcnRpZXM6IE9iamVjdCB8IGZhbHNlID0ge31cbik6IHZvaWQge1xuICBpZiAobW9ja2VkUHJvcGVydGllcyA9PT0gZmFsc2UpIHtcbiAgICByZXR1cm5cbiAgfVxuICBPYmplY3Qua2V5cyhtb2NrZWRQcm9wZXJ0aWVzKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIC8vICRGbG93SWdub3JlXG4gICAgICBfVnVlLnByb3RvdHlwZVtrZXldID0gbW9ja2VkUHJvcGVydGllc1trZXldXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgd2FybihcbiAgICAgICAgYGNvdWxkIG5vdCBvdmVyd3JpdGUgcHJvcGVydHkgJHtrZXl9LCB0aGlzIGlzIGAgK1xuICAgICAgICBgdXN1YWxseSBjYXVzZWQgYnkgYSBwbHVnaW4gdGhhdCBoYXMgYWRkZWQgYCArXG4gICAgICAgIGB0aGUgcHJvcGVydHkgYXMgYSByZWFkLW9ubHkgdmFsdWVgXG4gICAgICApXG4gICAgfVxuICAgIC8vICRGbG93SWdub3JlXG4gICAgJCRWdWUudXRpbC5kZWZpbmVSZWFjdGl2ZShfVnVlLCBrZXksIG1vY2tlZFByb3BlcnRpZXNba2V5XSlcbiAgfSlcbn1cbiIsIi8vIEBmbG93XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2dFdmVudHMgKFxuICB2bTogQ29tcG9uZW50LFxuICBlbWl0dGVkOiBPYmplY3QsXG4gIGVtaXR0ZWRCeU9yZGVyOiBBcnJheTxhbnk+XG4pOiB2b2lkIHtcbiAgY29uc3QgZW1pdCA9IHZtLiRlbWl0XG4gIHZtLiRlbWl0ID0gKG5hbWUsIC4uLmFyZ3MpID0+IHtcbiAgICAoZW1pdHRlZFtuYW1lXSB8fCAoZW1pdHRlZFtuYW1lXSA9IFtdKSkucHVzaChhcmdzKVxuICAgIGVtaXR0ZWRCeU9yZGVyLnB1c2goeyBuYW1lLCBhcmdzIH0pXG4gICAgcmV0dXJuIGVtaXQuY2FsbCh2bSwgbmFtZSwgLi4uYXJncylcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYWRkRXZlbnRMb2dnZXIgKF9WdWU6IENvbXBvbmVudCk6IHZvaWQge1xuICBfVnVlLm1peGluKHtcbiAgICBiZWZvcmVDcmVhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuX19lbWl0dGVkID0gT2JqZWN0LmNyZWF0ZShudWxsKVxuICAgICAgdGhpcy5fX2VtaXR0ZWRCeU9yZGVyID0gW11cbiAgICAgIGxvZ0V2ZW50cyh0aGlzLCB0aGlzLl9fZW1pdHRlZCwgdGhpcy5fX2VtaXR0ZWRCeU9yZGVyKVxuICAgIH1cbiAgfSlcbn1cbiIsImltcG9ydCB7IEJFRk9SRV9SRU5ERVJfTElGRUNZQ0xFX0hPT0sgfSBmcm9tICdzaGFyZWQvY29uc3RzJ1xuXG5leHBvcnQgZnVuY3Rpb24gYWRkU3R1YnMgKF9WdWUsIHN0dWJDb21wb25lbnRzKSB7XG4gIGZ1bmN0aW9uIGFkZFN0dWJDb21wb25lbnRzTWl4aW4gKCkge1xuICAgIE9iamVjdC5hc3NpZ24odGhpcy4kb3B0aW9ucy5jb21wb25lbnRzLCBzdHViQ29tcG9uZW50cylcbiAgfVxuXG4gIF9WdWUubWl4aW4oe1xuICAgIFtCRUZPUkVfUkVOREVSX0xJRkVDWUNMRV9IT09LXTogYWRkU3R1YkNvbXBvbmVudHNNaXhpblxuICB9KVxufVxuIiwiLy8gQGZsb3dcblxuaW1wb3J0IHsgY29tcGlsZVRvRnVuY3Rpb25zIH0gZnJvbSAndnVlLXRlbXBsYXRlLWNvbXBpbGVyJ1xuaW1wb3J0IHsgY29tcG9uZW50TmVlZHNDb21waWxpbmcgfSBmcm9tICcuL3ZhbGlkYXRvcnMnXG5pbXBvcnQgeyB0aHJvd0Vycm9yIH0gZnJvbSAnLi91dGlsJ1xuXG5leHBvcnQgZnVuY3Rpb24gY29tcGlsZUZyb21TdHJpbmcgKHN0cjogc3RyaW5nKSB7XG4gIGlmICghY29tcGlsZVRvRnVuY3Rpb25zKSB7XG4gICAgdGhyb3dFcnJvcihcbiAgICAgIGB2dWVUZW1wbGF0ZUNvbXBpbGVyIGlzIHVuZGVmaW5lZCwgeW91IG11c3QgcGFzcyBgICtcbiAgICAgICAgYHByZWNvbXBpbGVkIGNvbXBvbmVudHMgaWYgdnVlLXRlbXBsYXRlLWNvbXBpbGVyIGlzIGAgK1xuICAgICAgICBgdW5kZWZpbmVkYFxuICAgIClcbiAgfVxuICByZXR1cm4gY29tcGlsZVRvRnVuY3Rpb25zKHN0cilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBpbGVUZW1wbGF0ZSAoY29tcG9uZW50OiBDb21wb25lbnQpOiB2b2lkIHtcbiAgaWYgKGNvbXBvbmVudC50ZW1wbGF0ZSkge1xuICAgIE9iamVjdC5hc3NpZ24oY29tcG9uZW50LCBjb21waWxlVG9GdW5jdGlvbnMoY29tcG9uZW50LnRlbXBsYXRlKSlcbiAgfVxuXG4gIGlmIChjb21wb25lbnQuY29tcG9uZW50cykge1xuICAgIE9iamVjdC5rZXlzKGNvbXBvbmVudC5jb21wb25lbnRzKS5mb3JFYWNoKGMgPT4ge1xuICAgICAgY29uc3QgY21wID0gY29tcG9uZW50LmNvbXBvbmVudHNbY11cbiAgICAgIGlmICghY21wLnJlbmRlcikge1xuICAgICAgICBjb21waWxlVGVtcGxhdGUoY21wKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBpZiAoY29tcG9uZW50LmV4dGVuZHMpIHtcbiAgICBjb21waWxlVGVtcGxhdGUoY29tcG9uZW50LmV4dGVuZHMpXG4gIH1cblxuICBpZiAoY29tcG9uZW50LmV4dGVuZE9wdGlvbnMgJiYgIWNvbXBvbmVudC5vcHRpb25zLnJlbmRlcikge1xuICAgIGNvbXBpbGVUZW1wbGF0ZShjb21wb25lbnQub3B0aW9ucylcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tcGlsZVRlbXBsYXRlRm9yU2xvdHMgKHNsb3RzOiBPYmplY3QpOiB2b2lkIHtcbiAgT2JqZWN0LmtleXMoc2xvdHMpLmZvckVhY2goa2V5ID0+IHtcbiAgICBjb25zdCBzbG90ID0gQXJyYXkuaXNBcnJheShzbG90c1trZXldKSA/IHNsb3RzW2tleV0gOiBbc2xvdHNba2V5XV1cbiAgICBzbG90LmZvckVhY2goc2xvdFZhbHVlID0+IHtcbiAgICAgIGlmIChjb21wb25lbnROZWVkc0NvbXBpbGluZyhzbG90VmFsdWUpKSB7XG4gICAgICAgIGNvbXBpbGVUZW1wbGF0ZShzbG90VmFsdWUpXG4gICAgICB9XG4gICAgfSlcbiAgfSlcbn1cbiIsIi8vIEBmbG93XG5cbmNvbnN0IE1PVU5USU5HX09QVElPTlMgPSBbXG4gICdhdHRhY2hUb0RvY3VtZW50JyxcbiAgJ21vY2tzJyxcbiAgJ3Nsb3RzJyxcbiAgJ2xvY2FsVnVlJyxcbiAgJ3N0dWJzJyxcbiAgJ2NvbnRleHQnLFxuICAnY2xvbmUnLFxuICAnYXR0cnMnLFxuICAnbGlzdGVuZXJzJyxcbiAgJ3Byb3BzRGF0YScsXG4gICdsb2dNb2RpZmllZENvbXBvbmVudHMnLFxuICAnc3luYycsXG4gICdzaG91bGRQcm94eSdcbl1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZXh0cmFjdEluc3RhbmNlT3B0aW9ucyAoXG4gIG9wdGlvbnM6IE9iamVjdFxuKTogT2JqZWN0IHtcbiAgY29uc3QgaW5zdGFuY2VPcHRpb25zID0ge1xuICAgIC4uLm9wdGlvbnNcbiAgfVxuICBNT1VOVElOR19PUFRJT05TLmZvckVhY2gobW91bnRpbmdPcHRpb24gPT4ge1xuICAgIGRlbGV0ZSBpbnN0YW5jZU9wdGlvbnNbbW91bnRpbmdPcHRpb25dXG4gIH0pXG4gIHJldHVybiBpbnN0YW5jZU9wdGlvbnNcbn1cbiIsIi8vIEBmbG93XG5cbmltcG9ydCB7IHRocm93RXJyb3IgfSBmcm9tICdzaGFyZWQvdXRpbCdcbmltcG9ydCB7IGNvbXBpbGVUb0Z1bmN0aW9ucyB9IGZyb20gJ3Z1ZS10ZW1wbGF0ZS1jb21waWxlcidcbmltcG9ydCB7IGlzVnVlQ29tcG9uZW50IH0gZnJvbSAnLi4vc2hhcmVkL3ZhbGlkYXRvcnMnXG5cbmZ1bmN0aW9uIGlzVmFsaWRTbG90IChzbG90OiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIChcbiAgICBpc1Z1ZUNvbXBvbmVudChzbG90KSB8fFxuICAgIHR5cGVvZiBzbG90ID09PSAnc3RyaW5nJ1xuICApXG59XG5cbmZ1bmN0aW9uIHJlcXVpcmVzVGVtcGxhdGVDb21waWxlciAoc2xvdDogYW55KTogdm9pZCB7XG4gIGlmICh0eXBlb2Ygc2xvdCA9PT0gJ3N0cmluZycgJiYgIWNvbXBpbGVUb0Z1bmN0aW9ucykge1xuICAgIHRocm93RXJyb3IoXG4gICAgICBgdnVlVGVtcGxhdGVDb21waWxlciBpcyB1bmRlZmluZWQsIHlvdSBtdXN0IHBhc3MgYCArXG4gICAgICBgcHJlY29tcGlsZWQgY29tcG9uZW50cyBpZiB2dWUtdGVtcGxhdGUtY29tcGlsZXIgaXMgYCArXG4gICAgICBgdW5kZWZpbmVkYFxuICAgIClcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVTbG90cyAoc2xvdHM6IFNsb3RzT2JqZWN0KTogdm9pZCB7XG4gIE9iamVjdC5rZXlzKHNsb3RzKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgY29uc3Qgc2xvdCA9IEFycmF5LmlzQXJyYXkoc2xvdHNba2V5XSkgPyBzbG90c1trZXldIDogW3Nsb3RzW2tleV1dXG5cbiAgICBzbG90LmZvckVhY2goc2xvdFZhbHVlID0+IHtcbiAgICAgIGlmICghaXNWYWxpZFNsb3Qoc2xvdFZhbHVlKSkge1xuICAgICAgICB0aHJvd0Vycm9yKFxuICAgICAgICAgIGBzbG90c1trZXldIG11c3QgYmUgYSBDb21wb25lbnQsIHN0cmluZyBvciBhbiBhcnJheSBgICtcbiAgICAgICAgICAgIGBvZiBDb21wb25lbnRzYFxuICAgICAgICApXG4gICAgICB9XG4gICAgICByZXF1aXJlc1RlbXBsYXRlQ29tcGlsZXIoc2xvdFZhbHVlKVxuICAgIH0pXG4gIH0pXG59XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgeyBjb21waWxlVG9GdW5jdGlvbnMgfSBmcm9tICd2dWUtdGVtcGxhdGUtY29tcGlsZXInXG5pbXBvcnQgeyB0aHJvd0Vycm9yIH0gZnJvbSAnc2hhcmVkL3V0aWwnXG5pbXBvcnQgeyBWVUVfVkVSU0lPTiB9IGZyb20gJ3NoYXJlZC9jb25zdHMnXG5cbmZ1bmN0aW9uIGlzRGVzdHJ1Y3R1cmluZ1Nsb3RTY29wZSAoc2xvdFNjb3BlOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIHNsb3RTY29wZVswXSA9PT0gJ3snICYmIHNsb3RTY29wZVtzbG90U2NvcGUubGVuZ3RoIC0gMV0gPT09ICd9J1xufVxuXG5mdW5jdGlvbiBnZXRWdWVUZW1wbGF0ZUNvbXBpbGVySGVscGVycyAoXG4gIF9WdWU6IENvbXBvbmVudFxuKTogeyBbbmFtZTogc3RyaW5nXTogRnVuY3Rpb24gfSB7XG4gIC8vICRGbG93SWdub3JlXG4gIGNvbnN0IHZ1ZSA9IG5ldyBfVnVlKClcbiAgY29uc3QgaGVscGVycyA9IHt9XG4gIGNvbnN0IG5hbWVzID0gW1xuICAgICdfYycsXG4gICAgJ19vJyxcbiAgICAnX24nLFxuICAgICdfcycsXG4gICAgJ19sJyxcbiAgICAnX3QnLFxuICAgICdfcScsXG4gICAgJ19pJyxcbiAgICAnX20nLFxuICAgICdfZicsXG4gICAgJ19rJyxcbiAgICAnX2InLFxuICAgICdfdicsXG4gICAgJ19lJyxcbiAgICAnX3UnLFxuICAgICdfZydcbiAgXVxuICBuYW1lcy5mb3JFYWNoKG5hbWUgPT4ge1xuICAgIGhlbHBlcnNbbmFtZV0gPSB2dWUuX3JlbmRlclByb3h5W25hbWVdXG4gIH0pXG4gIGhlbHBlcnMuJGNyZWF0ZUVsZW1lbnQgPSB2dWUuX3JlbmRlclByb3h5LiRjcmVhdGVFbGVtZW50XG4gIHJldHVybiBoZWxwZXJzXG59XG5cbmZ1bmN0aW9uIHZhbGlkYXRlRW52aXJvbm1lbnQgKCk6IHZvaWQge1xuICBpZiAoVlVFX1ZFUlNJT04gPCAyLjEpIHtcbiAgICB0aHJvd0Vycm9yKGB0aGUgc2NvcGVkU2xvdHMgb3B0aW9uIGlzIG9ubHkgc3VwcG9ydGVkIGluIHZ1ZUAyLjErLmApXG4gIH1cbn1cblxuY29uc3Qgc2xvdFNjb3BlUmUgPSAvPFtePl0rIHNsb3Qtc2NvcGU9XFxcIiguKylcXFwiL1xuXG4vLyBIaWRlIHdhcm5pbmcgYWJvdXQgPHRlbXBsYXRlPiBkaXNhbGxvd2VkIGFzIHJvb3QgZWxlbWVudFxuZnVuY3Rpb24gY3VzdG9tV2FybiAobXNnKSB7XG4gIGlmIChtc2cuaW5kZXhPZignQ2Fubm90IHVzZSA8dGVtcGxhdGU+IGFzIGNvbXBvbmVudCByb290IGVsZW1lbnQnKSA9PT0gLTEpIHtcbiAgICBjb25zb2xlLmVycm9yKG1zZylcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjcmVhdGVTY29wZWRTbG90cyAoXG4gIHNjb3BlZFNsb3RzT3B0aW9uOiA/eyBbc2xvdE5hbWU6IHN0cmluZ106IHN0cmluZyB8IEZ1bmN0aW9uIH0sXG4gIF9WdWU6IENvbXBvbmVudFxuKToge1xuICBbc2xvdE5hbWU6IHN0cmluZ106IChwcm9wczogT2JqZWN0KSA9PiBWTm9kZSB8IEFycmF5PFZOb2RlPlxufSB7XG4gIGNvbnN0IHNjb3BlZFNsb3RzID0ge31cbiAgaWYgKCFzY29wZWRTbG90c09wdGlvbikge1xuICAgIHJldHVybiBzY29wZWRTbG90c1xuICB9XG4gIHZhbGlkYXRlRW52aXJvbm1lbnQoKVxuICBjb25zdCBoZWxwZXJzID0gZ2V0VnVlVGVtcGxhdGVDb21waWxlckhlbHBlcnMoX1Z1ZSlcbiAgZm9yIChjb25zdCBzY29wZWRTbG90TmFtZSBpbiBzY29wZWRTbG90c09wdGlvbikge1xuICAgIGNvbnN0IHNsb3QgPSBzY29wZWRTbG90c09wdGlvbltzY29wZWRTbG90TmFtZV1cbiAgICBjb25zdCBpc0ZuID0gdHlwZW9mIHNsb3QgPT09ICdmdW5jdGlvbidcbiAgICAvLyBUeXBlIGNoZWNrIHRvIHNpbGVuY2UgZmxvdyAoY2FuJ3QgdXNlIGlzRm4pXG4gICAgY29uc3QgcmVuZGVyRm4gPSB0eXBlb2Ygc2xvdCA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgPyBzbG90XG4gICAgICA6IGNvbXBpbGVUb0Z1bmN0aW9ucyhzbG90LCB7IHdhcm46IGN1c3RvbVdhcm4gfSkucmVuZGVyXG5cbiAgICBjb25zdCBoYXNTbG90U2NvcGVBdHRyID0gIWlzRm4gJiYgc2xvdC5tYXRjaChzbG90U2NvcGVSZSlcbiAgICBjb25zdCBzbG90U2NvcGUgPSBoYXNTbG90U2NvcGVBdHRyICYmIGhhc1Nsb3RTY29wZUF0dHJbMV1cbiAgICBzY29wZWRTbG90c1tzY29wZWRTbG90TmFtZV0gPSBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICAgIGxldCByZXNcbiAgICAgIGlmIChpc0ZuKSB7XG4gICAgICAgIHJlcyA9IHJlbmRlckZuLmNhbGwoeyAuLi5oZWxwZXJzIH0sIHByb3BzKVxuICAgICAgfSBlbHNlIGlmIChzbG90U2NvcGUgJiYgIWlzRGVzdHJ1Y3R1cmluZ1Nsb3RTY29wZShzbG90U2NvcGUpKSB7XG4gICAgICAgIHJlcyA9IHJlbmRlckZuLmNhbGwoeyAuLi5oZWxwZXJzLCBbc2xvdFNjb3BlXTogcHJvcHMgfSlcbiAgICAgIH0gZWxzZSBpZiAoc2xvdFNjb3BlICYmIGlzRGVzdHJ1Y3R1cmluZ1Nsb3RTY29wZShzbG90U2NvcGUpKSB7XG4gICAgICAgIHJlcyA9IHJlbmRlckZuLmNhbGwoeyAuLi5oZWxwZXJzLCAuLi5wcm9wcyB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzID0gcmVuZGVyRm4uY2FsbCh7IC4uLmhlbHBlcnMsIHByb3BzIH0pXG4gICAgICB9XG4gICAgICAvLyByZXMgaXMgQXJyYXkgaWYgPHRlbXBsYXRlPiBpcyBhIHJvb3QgZWxlbWVudFxuICAgICAgcmV0dXJuIEFycmF5LmlzQXJyYXkocmVzKSA/IHJlc1swXSA6IHJlc1xuICAgIH1cbiAgfVxuICByZXR1cm4gc2NvcGVkU2xvdHNcbn1cbiIsIi8vIEBmbG93XG5cbmltcG9ydCB7IHRocm93RXJyb3IgfSBmcm9tICdzaGFyZWQvdXRpbCdcbmltcG9ydCB7IHZhbGlkYXRlU2xvdHMgfSBmcm9tICcuL3ZhbGlkYXRlLXNsb3RzJ1xuaW1wb3J0IHsgY3JlYXRlU2xvdFZOb2RlcyB9IGZyb20gJy4vY3JlYXRlLXNsb3Qtdm5vZGVzJ1xuaW1wb3J0IGNyZWF0ZVNjb3BlZFNsb3RzIGZyb20gJy4vY3JlYXRlLXNjb3BlZC1zbG90cydcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY3JlYXRlRnVuY3Rpb25hbENvbXBvbmVudCAoXG4gIGNvbXBvbmVudDogQ29tcG9uZW50LFxuICBtb3VudGluZ09wdGlvbnM6IE9wdGlvbnMsXG4gIF9WdWU6IENvbXBvbmVudFxuKTogQ29tcG9uZW50IHtcbiAgaWYgKG1vdW50aW5nT3B0aW9ucy5jb250ZXh0ICYmIHR5cGVvZiBtb3VudGluZ09wdGlvbnMuY29udGV4dCAhPT0gJ29iamVjdCcpIHtcbiAgICB0aHJvd0Vycm9yKCdtb3VudC5jb250ZXh0IG11c3QgYmUgYW4gb2JqZWN0JylcbiAgfVxuICBpZiAobW91bnRpbmdPcHRpb25zLnNsb3RzKSB7XG4gICAgdmFsaWRhdGVTbG90cyhtb3VudGluZ09wdGlvbnMuc2xvdHMpXG4gIH1cblxuICBjb25zdCBjb250ZXh0ID1cbiAgICBtb3VudGluZ09wdGlvbnMuY29udGV4dCB8fFxuICAgIGNvbXBvbmVudC5GdW5jdGlvbmFsUmVuZGVyQ29udGV4dCB8fFxuICAgIHt9XG5cbiAgY29uc3QgbGlzdGVuZXJzID0gbW91bnRpbmdPcHRpb25zLmxpc3RlbmVyc1xuXG4gIGlmIChsaXN0ZW5lcnMpIHtcbiAgICBPYmplY3Qua2V5cyhsaXN0ZW5lcnMpLmZvckVhY2goa2V5ID0+IHtcbiAgICAgIGNvbnRleHQub25ba2V5XSA9IGxpc3RlbmVyc1trZXldXG4gICAgfSlcbiAgfVxuXG4gIGNvbnRleHQuc2NvcGVkU2xvdHMgPSBjcmVhdGVTY29wZWRTbG90cyhtb3VudGluZ09wdGlvbnMuc2NvcGVkU2xvdHMsIF9WdWUpXG5cbiAgcmV0dXJuIHtcbiAgICByZW5kZXIgKGg6IEZ1bmN0aW9uKSB7XG4gICAgICByZXR1cm4gaChcbiAgICAgICAgY29tcG9uZW50LFxuICAgICAgICBjb250ZXh0LFxuICAgICAgICAobW91bnRpbmdPcHRpb25zLmNvbnRleHQgJiZcbiAgICAgICAgICBtb3VudGluZ09wdGlvbnMuY29udGV4dC5jaGlsZHJlbiAmJlxuICAgICAgICAgIG1vdW50aW5nT3B0aW9ucy5jb250ZXh0LmNoaWxkcmVuLm1hcChcbiAgICAgICAgICAgIHggPT4gKHR5cGVvZiB4ID09PSAnZnVuY3Rpb24nID8geChoKSA6IHgpXG4gICAgICAgICAgKSkgfHxcbiAgICAgICAgICBjcmVhdGVTbG90Vk5vZGVzKHRoaXMsIG1vdW50aW5nT3B0aW9ucy5zbG90cyB8fCB7fSlcbiAgICAgIClcbiAgICB9LFxuICAgIG5hbWU6IGNvbXBvbmVudC5uYW1lLFxuICAgIF9pc0Z1bmN0aW9uYWxDb250YWluZXI6IHRydWVcbiAgfVxufVxuIiwiLy8gQGZsb3dcblxuaW1wb3J0IFZ1ZSBmcm9tICd2dWUnXG5pbXBvcnQge1xuICB0aHJvd0Vycm9yLFxuICBjYW1lbGl6ZSxcbiAgY2FwaXRhbGl6ZSxcbiAgaHlwaGVuYXRlXG59IGZyb20gJy4uL3NoYXJlZC91dGlsJ1xuaW1wb3J0IHtcbiAgY29tcG9uZW50TmVlZHNDb21waWxpbmcsXG4gIHRlbXBsYXRlQ29udGFpbnNDb21wb25lbnQsXG4gIGlzVnVlQ29tcG9uZW50XG59IGZyb20gJy4uL3NoYXJlZC92YWxpZGF0b3JzJ1xuaW1wb3J0IHtcbiAgY29tcGlsZVRlbXBsYXRlLFxuICBjb21waWxlRnJvbVN0cmluZ1xufSBmcm9tICcuLi9zaGFyZWQvY29tcGlsZS10ZW1wbGF0ZSdcblxuZnVuY3Rpb24gaXNWdWVDb21wb25lbnRTdHViIChjb21wKTogYm9vbGVhbiB7XG4gIHJldHVybiBjb21wICYmIGNvbXAudGVtcGxhdGUgfHwgaXNWdWVDb21wb25lbnQoY29tcClcbn1cblxuZnVuY3Rpb24gaXNWYWxpZFN0dWIgKHN0dWI6IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gKFxuICAgIHR5cGVvZiBzdHViID09PSAnYm9vbGVhbicgfHxcbiAgICAoISFzdHViICYmIHR5cGVvZiBzdHViID09PSAnc3RyaW5nJykgfHxcbiAgICBpc1Z1ZUNvbXBvbmVudFN0dWIoc3R1YilcbiAgKVxufVxuXG5mdW5jdGlvbiByZXNvbHZlQ29tcG9uZW50IChvYmo6IE9iamVjdCwgY29tcG9uZW50OiBzdHJpbmcpOiBPYmplY3Qge1xuICByZXR1cm4gb2JqW2NvbXBvbmVudF0gfHxcbiAgICBvYmpbaHlwaGVuYXRlKGNvbXBvbmVudCldIHx8XG4gICAgb2JqW2NhbWVsaXplKGNvbXBvbmVudCldIHx8XG4gICAgb2JqW2NhcGl0YWxpemUoY2FtZWxpemUoY29tcG9uZW50KSldIHx8XG4gICAgb2JqW2NhcGl0YWxpemUoY29tcG9uZW50KV0gfHxcbiAgICB7fVxufVxuXG5mdW5jdGlvbiBnZXRDb3JlUHJvcGVydGllcyAoY29tcG9uZW50T3B0aW9uczogQ29tcG9uZW50KTogT2JqZWN0IHtcbiAgcmV0dXJuIHtcbiAgICBhdHRyczogY29tcG9uZW50T3B0aW9ucy5hdHRycyxcbiAgICBuYW1lOiBjb21wb25lbnRPcHRpb25zLm5hbWUsXG4gICAgb246IGNvbXBvbmVudE9wdGlvbnMub24sXG4gICAga2V5OiBjb21wb25lbnRPcHRpb25zLmtleSxcbiAgICByZWY6IGNvbXBvbmVudE9wdGlvbnMucmVmLFxuICAgIHByb3BzOiBjb21wb25lbnRPcHRpb25zLnByb3BzLFxuICAgIGRvbVByb3BzOiBjb21wb25lbnRPcHRpb25zLmRvbVByb3BzLFxuICAgIGNsYXNzOiBjb21wb25lbnRPcHRpb25zLmNsYXNzLFxuICAgIHN0YXRpY0NsYXNzOiBjb21wb25lbnRPcHRpb25zLnN0YXRpY0NsYXNzLFxuICAgIHN0YXRpY1N0eWxlOiBjb21wb25lbnRPcHRpb25zLnN0YXRpY1N0eWxlLFxuICAgIHN0eWxlOiBjb21wb25lbnRPcHRpb25zLnN0eWxlLFxuICAgIG5vcm1hbGl6ZWRTdHlsZTogY29tcG9uZW50T3B0aW9ucy5ub3JtYWxpemVkU3R5bGUsXG4gICAgbmF0aXZlT246IGNvbXBvbmVudE9wdGlvbnMubmF0aXZlT24sXG4gICAgZnVuY3Rpb25hbDogY29tcG9uZW50T3B0aW9ucy5mdW5jdGlvbmFsXG4gIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlQ2xhc3NTdHJpbmcgKHN0YXRpY0NsYXNzLCBkeW5hbWljQ2xhc3MpIHtcbiAgaWYgKHN0YXRpY0NsYXNzICYmIGR5bmFtaWNDbGFzcykge1xuICAgIHJldHVybiBzdGF0aWNDbGFzcyArICcgJyArIGR5bmFtaWNDbGFzc1xuICB9XG4gIHJldHVybiBzdGF0aWNDbGFzcyB8fCBkeW5hbWljQ2xhc3Ncbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVN0dWJGcm9tQ29tcG9uZW50IChcbiAgb3JpZ2luYWxDb21wb25lbnQ6IENvbXBvbmVudCxcbiAgbmFtZTogc3RyaW5nXG4pOiBDb21wb25lbnQge1xuICBjb25zdCBjb21wb25lbnRPcHRpb25zID1cbiAgICB0eXBlb2Ygb3JpZ2luYWxDb21wb25lbnQgPT09ICdmdW5jdGlvbicgJiYgb3JpZ2luYWxDb21wb25lbnQuY2lkXG4gICAgICA/IG9yaWdpbmFsQ29tcG9uZW50LmV4dGVuZE9wdGlvbnNcbiAgICAgIDogb3JpZ2luYWxDb21wb25lbnRcblxuICBjb25zdCB0YWdOYW1lID0gYCR7bmFtZSB8fCAnYW5vbnltb3VzJ30tc3R1YmBcblxuICAvLyBpZ25vcmVFbGVtZW50cyBkb2VzIG5vdCBleGlzdCBpbiBWdWUgMi4wLnhcbiAgaWYgKFZ1ZS5jb25maWcuaWdub3JlZEVsZW1lbnRzKSB7XG4gICAgVnVlLmNvbmZpZy5pZ25vcmVkRWxlbWVudHMucHVzaCh0YWdOYW1lKVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICAuLi5nZXRDb3JlUHJvcGVydGllcyhjb21wb25lbnRPcHRpb25zKSxcbiAgICAkX3Z1ZVRlc3RVdGlsc19vcmlnaW5hbDogb3JpZ2luYWxDb21wb25lbnQsXG4gICAgJF9kb05vdFN0dWJDaGlsZHJlbjogdHJ1ZSxcbiAgICByZW5kZXIgKGgsIGNvbnRleHQpIHtcbiAgICAgIHJldHVybiBoKFxuICAgICAgICB0YWdOYW1lLFxuICAgICAgICB7XG4gICAgICAgICAgYXR0cnM6IGNvbXBvbmVudE9wdGlvbnMuZnVuY3Rpb25hbCA/IHtcbiAgICAgICAgICAgIC4uLmNvbnRleHQucHJvcHMsXG4gICAgICAgICAgICAuLi5jb250ZXh0LmRhdGEuYXR0cnMsXG4gICAgICAgICAgICBjbGFzczogY3JlYXRlQ2xhc3NTdHJpbmcoXG4gICAgICAgICAgICAgIGNvbnRleHQuZGF0YS5zdGF0aWNDbGFzcyxcbiAgICAgICAgICAgICAgY29udGV4dC5kYXRhLmNsYXNzXG4gICAgICAgICAgICApXG4gICAgICAgICAgfSA6IHtcbiAgICAgICAgICAgIC4uLnRoaXMuJHByb3BzXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBjb250ZXh0ID8gY29udGV4dC5jaGlsZHJlbiA6IHRoaXMuJG9wdGlvbnMuX3JlbmRlckNoaWxkcmVuXG4gICAgICApXG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTdHViRnJvbVN0cmluZyAoXG4gIHRlbXBsYXRlU3RyaW5nOiBzdHJpbmcsXG4gIG9yaWdpbmFsQ29tcG9uZW50OiBDb21wb25lbnQgPSB7fSxcbiAgbmFtZTogc3RyaW5nXG4pOiBDb21wb25lbnQge1xuICBpZiAodGVtcGxhdGVDb250YWluc0NvbXBvbmVudCh0ZW1wbGF0ZVN0cmluZywgbmFtZSkpIHtcbiAgICB0aHJvd0Vycm9yKCdvcHRpb25zLnN0dWIgY2Fubm90IGNvbnRhaW4gYSBjaXJjdWxhciByZWZlcmVuY2UnKVxuICB9XG5cbiAgY29uc3QgY29tcG9uZW50T3B0aW9ucyA9XG4gICAgdHlwZW9mIG9yaWdpbmFsQ29tcG9uZW50ID09PSAnZnVuY3Rpb24nICYmIG9yaWdpbmFsQ29tcG9uZW50LmNpZFxuICAgICAgPyBvcmlnaW5hbENvbXBvbmVudC5leHRlbmRPcHRpb25zXG4gICAgICA6IG9yaWdpbmFsQ29tcG9uZW50XG5cbiAgcmV0dXJuIHtcbiAgICAuLi5nZXRDb3JlUHJvcGVydGllcyhjb21wb25lbnRPcHRpb25zKSxcbiAgICAkX2RvTm90U3R1YkNoaWxkcmVuOiB0cnVlLFxuICAgIC4uLmNvbXBpbGVGcm9tU3RyaW5nKHRlbXBsYXRlU3RyaW5nKVxuICB9XG59XG5cbmZ1bmN0aW9uIHZhbGlkYXRlU3R1YiAoc3R1Yikge1xuICBpZiAoIWlzVmFsaWRTdHViKHN0dWIpKSB7XG4gICAgdGhyb3dFcnJvcihcbiAgICAgIGBvcHRpb25zLnN0dWIgdmFsdWVzIG11c3QgYmUgcGFzc2VkIGEgc3RyaW5nIG9yIGAgK1xuICAgICAgYGNvbXBvbmVudGBcbiAgICApXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVN0dWJzRnJvbVN0dWJzT2JqZWN0IChcbiAgb3JpZ2luYWxDb21wb25lbnRzOiBPYmplY3QgPSB7fSxcbiAgc3R1YnM6IE9iamVjdFxuKTogQ29tcG9uZW50cyB7XG4gIHJldHVybiBPYmplY3Qua2V5cyhzdHVicyB8fCB7fSkucmVkdWNlKChhY2MsIHN0dWJOYW1lKSA9PiB7XG4gICAgY29uc3Qgc3R1YiA9IHN0dWJzW3N0dWJOYW1lXVxuXG4gICAgdmFsaWRhdGVTdHViKHN0dWIpXG5cbiAgICBpZiAoc3R1YiA9PT0gZmFsc2UpIHtcbiAgICAgIHJldHVybiBhY2NcbiAgICB9XG5cbiAgICBpZiAoc3R1YiA9PT0gdHJ1ZSkge1xuICAgICAgY29uc3QgY29tcG9uZW50ID0gcmVzb2x2ZUNvbXBvbmVudChvcmlnaW5hbENvbXBvbmVudHMsIHN0dWJOYW1lKVxuICAgICAgYWNjW3N0dWJOYW1lXSA9IGNyZWF0ZVN0dWJGcm9tQ29tcG9uZW50KGNvbXBvbmVudCwgc3R1Yk5hbWUpXG4gICAgICByZXR1cm4gYWNjXG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBzdHViID09PSAnc3RyaW5nJykge1xuICAgICAgY29uc3QgY29tcG9uZW50ID0gcmVzb2x2ZUNvbXBvbmVudChvcmlnaW5hbENvbXBvbmVudHMsIHN0dWJOYW1lKVxuICAgICAgYWNjW3N0dWJOYW1lXSA9IGNyZWF0ZVN0dWJGcm9tU3RyaW5nKFxuICAgICAgICBzdHViLFxuICAgICAgICBjb21wb25lbnQsXG4gICAgICAgIHN0dWJOYW1lXG4gICAgICApXG4gICAgICByZXR1cm4gYWNjXG4gICAgfVxuXG4gICAgaWYgKGNvbXBvbmVudE5lZWRzQ29tcGlsaW5nKHN0dWIpKSB7XG4gICAgICBjb21waWxlVGVtcGxhdGUoc3R1YilcbiAgICB9XG5cbiAgICBhY2Nbc3R1Yk5hbWVdID0gc3R1YlxuXG4gICAgcmV0dXJuIGFjY1xuICB9LCB7fSlcbn1cbiIsImltcG9ydCB7IGNyZWF0ZVN0dWJGcm9tQ29tcG9uZW50IH0gZnJvbSAnLi9jcmVhdGUtY29tcG9uZW50LXN0dWJzJ1xuaW1wb3J0IHsgcmVzb2x2ZUNvbXBvbmVudCB9IGZyb20gJ3NoYXJlZC91dGlsJ1xuaW1wb3J0IHsgaXNSZXNlcnZlZFRhZyB9IGZyb20gJ3NoYXJlZC92YWxpZGF0b3JzJ1xuaW1wb3J0IHtcbiAgQkVGT1JFX1JFTkRFUl9MSUZFQ1lDTEVfSE9PSyxcbiAgQ1JFQVRFX0VMRU1FTlRfQUxJQVNcbn0gZnJvbSAnc2hhcmVkL2NvbnN0cydcblxuY29uc3QgaXNXaGl0ZWxpc3RlZCA9IChlbCwgd2hpdGVsaXN0KSA9PiByZXNvbHZlQ29tcG9uZW50KGVsLCB3aGl0ZWxpc3QpXG5jb25zdCBpc0FscmVhZHlTdHViYmVkID0gKGVsLCBzdHVicykgPT4gc3R1YnMuaGFzKGVsKVxuY29uc3QgaXNEeW5hbWljQ29tcG9uZW50ID0gY21wID0+IHR5cGVvZiBjbXAgPT09ICdmdW5jdGlvbicgJiYgIWNtcC5jaWRcblxuZnVuY3Rpb24gc2hvdWxkRXh0ZW5kIChjb21wb25lbnQsIF9WdWUpIHtcbiAgcmV0dXJuIChcbiAgICAodHlwZW9mIGNvbXBvbmVudCA9PT0gJ2Z1bmN0aW9uJyAmJiAhaXNEeW5hbWljQ29tcG9uZW50KGNvbXBvbmVudCkpIHx8XG4gICAgKGNvbXBvbmVudCAmJiBjb21wb25lbnQuZXh0ZW5kcylcbiAgKVxufVxuXG5mdW5jdGlvbiBleHRlbmQgKGNvbXBvbmVudCwgX1Z1ZSkge1xuICBjb25zdCBzdHViID0gX1Z1ZS5leHRlbmQoY29tcG9uZW50Lm9wdGlvbnMpXG4gIHN0dWIub3B0aW9ucy4kX3Z1ZVRlc3RVdGlsc19vcmlnaW5hbCA9IGNvbXBvbmVudFxuICByZXR1cm4gc3R1YlxufVxuXG5mdW5jdGlvbiBjcmVhdGVTdHViSWZOZWVkZWQgKHNob3VsZFN0dWIsIGNvbXBvbmVudCwgX1Z1ZSwgZWwpIHtcbiAgaWYgKHNob3VsZFN0dWIpIHtcbiAgICByZXR1cm4gY3JlYXRlU3R1YkZyb21Db21wb25lbnQoY29tcG9uZW50IHx8IHt9LCBlbClcbiAgfVxuXG4gIGlmIChzaG91bGRFeHRlbmQoY29tcG9uZW50LCBfVnVlKSkge1xuICAgIHJldHVybiBleHRlbmQoY29tcG9uZW50LCBfVnVlKVxuICB9XG59XG5cbmZ1bmN0aW9uIHNob3VsZE5vdEJlU3R1YmJlZCAoZWwsIHdoaXRlbGlzdCwgbW9kaWZpZWRDb21wb25lbnRzKSB7XG4gIHJldHVybiAoXG4gICAgKHR5cGVvZiBlbCA9PT0gJ3N0cmluZycgJiYgaXNSZXNlcnZlZFRhZyhlbCkpIHx8XG4gICAgaXNXaGl0ZWxpc3RlZChlbCwgd2hpdGVsaXN0KSB8fFxuICAgIGlzQWxyZWFkeVN0dWJiZWQoZWwsIG1vZGlmaWVkQ29tcG9uZW50cylcbiAgKVxufVxuXG5mdW5jdGlvbiBpc0NvbnN0cnVjdG9yIChlbCkge1xuICByZXR1cm4gdHlwZW9mIGVsID09PSAnZnVuY3Rpb24nXG59XG5cbmZ1bmN0aW9uIGlzQ29tcG9uZW50T3B0aW9ucyAoZWwpIHtcbiAgcmV0dXJuIHR5cGVvZiBlbCA9PT0gJ29iamVjdCcgJiYgKGVsLnRlbXBsYXRlIHx8IGVsLnJlbmRlcilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhdGNoUmVuZGVyIChfVnVlLCBzdHVicywgc3R1YkFsbENvbXBvbmVudHMpIHtcbiAgLy8gVGhpcyBtaXhpbiBwYXRjaGVzIHZtLiRjcmVhdGVFbGVtZW50IHNvIHRoYXQgd2UgY2FuIHN0dWIgYWxsIGNvbXBvbmVudHNcbiAgLy8gYmVmb3JlIHRoZXkgYXJlIHJlbmRlcmVkIGluIHNoYWxsb3cgbW9kZS4gV2UgYWxzbyBuZWVkIHRvIGVuc3VyZSB0aGF0XG4gIC8vIGNvbXBvbmVudCBjb25zdHJ1Y3RvcnMgd2VyZSBjcmVhdGVkIGZyb20gdGhlIF9WdWUgY29uc3RydWN0b3IuIElmIG5vdCxcbiAgLy8gd2UgbXVzdCByZXBsYWNlIHRoZW0gd2l0aCBjb21wb25lbnRzIGNyZWF0ZWQgZnJvbSB0aGUgX1Z1ZSBjb25zdHJ1Y3RvclxuICAvLyBiZWZvcmUgY2FsbGluZyB0aGUgb3JpZ2luYWwgJGNyZWF0ZUVsZW1lbnQuIFRoaXMgZW5zdXJlcyB0aGF0IGNvbXBvbmVudHNcbiAgLy8gaGF2ZSB0aGUgY29ycmVjdCBpbnN0YW5jZSBwcm9wZXJ0aWVzIGFuZCBzdHVicyB3aGVuIHRoZXkgYXJlIHJlbmRlcmVkLlxuICBmdW5jdGlvbiBwYXRjaFJlbmRlck1peGluICgpIHtcbiAgICBjb25zdCB2bSA9IHRoaXNcblxuICAgIGlmIChcbiAgICAgIHZtLiRvcHRpb25zLiRfZG9Ob3RTdHViQ2hpbGRyZW4gfHxcbiAgICAgIHZtLiRvcHRpb25zLl9pc0Z1bmN0aW9uYWxDb250YWluZXJcbiAgICApIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IG1vZGlmaWVkQ29tcG9uZW50cyA9IG5ldyBTZXQoKVxuICAgIGNvbnN0IG9yaWdpbmFsQ3JlYXRlRWxlbWVudCA9IHZtLiRjcmVhdGVFbGVtZW50XG4gICAgY29uc3Qgb3JpZ2luYWxDb21wb25lbnRzID0gdm0uJG9wdGlvbnMuY29tcG9uZW50c1xuXG4gICAgY29uc3QgY3JlYXRlRWxlbWVudCA9IChlbCwgLi4uYXJncykgPT4ge1xuICAgICAgaWYgKHNob3VsZE5vdEJlU3R1YmJlZChlbCwgc3R1YnMsIG1vZGlmaWVkQ29tcG9uZW50cykpIHtcbiAgICAgICAgcmV0dXJuIG9yaWdpbmFsQ3JlYXRlRWxlbWVudChlbCwgLi4uYXJncylcbiAgICAgIH1cblxuICAgICAgaWYgKGlzQ29uc3RydWN0b3IoZWwpIHx8IGlzQ29tcG9uZW50T3B0aW9ucyhlbCkpIHtcbiAgICAgICAgaWYgKHN0dWJBbGxDb21wb25lbnRzKSB7XG4gICAgICAgICAgY29uc3Qgc3R1YiA9IGNyZWF0ZVN0dWJGcm9tQ29tcG9uZW50KGVsLCBlbC5uYW1lIHx8ICdhbm9ueW1vdXMnKVxuICAgICAgICAgIHJldHVybiBvcmlnaW5hbENyZWF0ZUVsZW1lbnQoc3R1YiwgLi4uYXJncylcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBDb25zdHJ1Y3RvciA9IHNob3VsZEV4dGVuZChlbCwgX1Z1ZSkgPyBleHRlbmQoZWwsIF9WdWUpIDogZWxcblxuICAgICAgICByZXR1cm4gb3JpZ2luYWxDcmVhdGVFbGVtZW50KENvbnN0cnVjdG9yLCAuLi5hcmdzKVxuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIGVsID09PSAnc3RyaW5nJykge1xuICAgICAgICBsZXQgb3JpZ2luYWwgPSByZXNvbHZlQ29tcG9uZW50KGVsLCBvcmlnaW5hbENvbXBvbmVudHMpXG5cbiAgICAgICAgaWYgKCFvcmlnaW5hbCkge1xuICAgICAgICAgIHJldHVybiBvcmlnaW5hbENyZWF0ZUVsZW1lbnQoZWwsIC4uLmFyZ3MpXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXG4gICAgICAgICAgb3JpZ2luYWwub3B0aW9ucyAmJlxuICAgICAgICAgIG9yaWdpbmFsLm9wdGlvbnMuJF92dWVUZXN0VXRpbHNfb3JpZ2luYWxcbiAgICAgICAgKSB7XG4gICAgICAgICAgb3JpZ2luYWwgPSBvcmlnaW5hbC5vcHRpb25zLiRfdnVlVGVzdFV0aWxzX29yaWdpbmFsXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaXNEeW5hbWljQ29tcG9uZW50KG9yaWdpbmFsKSkge1xuICAgICAgICAgIHJldHVybiBvcmlnaW5hbENyZWF0ZUVsZW1lbnQoZWwsIC4uLmFyZ3MpXG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzdHViID0gY3JlYXRlU3R1YklmTmVlZGVkKHN0dWJBbGxDb21wb25lbnRzLCBvcmlnaW5hbCwgX1Z1ZSwgZWwpXG5cbiAgICAgICAgaWYgKHN0dWIpIHtcbiAgICAgICAgICBPYmplY3QuYXNzaWduKHZtLiRvcHRpb25zLmNvbXBvbmVudHMsIHtcbiAgICAgICAgICAgIFtlbF06IHN0dWJcbiAgICAgICAgICB9KVxuICAgICAgICAgIG1vZGlmaWVkQ29tcG9uZW50cy5hZGQoZWwpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG9yaWdpbmFsQ3JlYXRlRWxlbWVudChlbCwgLi4uYXJncylcbiAgICB9XG5cbiAgICB2bVtDUkVBVEVfRUxFTUVOVF9BTElBU10gPSBjcmVhdGVFbGVtZW50XG4gICAgdm0uJGNyZWF0ZUVsZW1lbnQgPSBjcmVhdGVFbGVtZW50XG4gIH1cblxuICBfVnVlLm1peGluKHtcbiAgICBbQkVGT1JFX1JFTkRFUl9MSUZFQ1lDTEVfSE9PS106IHBhdGNoUmVuZGVyTWl4aW5cbiAgfSlcbn1cbiIsIi8vIEBmbG93XG5cbmltcG9ydCB7IGNyZWF0ZVNsb3RWTm9kZXMgfSBmcm9tICcuL2NyZWF0ZS1zbG90LXZub2RlcydcbmltcG9ydCBhZGRNb2NrcyBmcm9tICcuL2FkZC1tb2NrcydcbmltcG9ydCB7IGFkZEV2ZW50TG9nZ2VyIH0gZnJvbSAnLi9sb2ctZXZlbnRzJ1xuaW1wb3J0IHsgYWRkU3R1YnMgfSBmcm9tICcuL2FkZC1zdHVicydcbmltcG9ydCB7IHRocm93RXJyb3IgfSBmcm9tICdzaGFyZWQvdXRpbCdcbmltcG9ydCB7IFZVRV9WRVJTSU9OIH0gZnJvbSAnc2hhcmVkL2NvbnN0cydcbmltcG9ydCB7XG4gIGNvbXBpbGVUZW1wbGF0ZSxcbiAgY29tcGlsZVRlbXBsYXRlRm9yU2xvdHNcbn0gZnJvbSAnc2hhcmVkL2NvbXBpbGUtdGVtcGxhdGUnXG5pbXBvcnQgZXh0cmFjdEluc3RhbmNlT3B0aW9ucyBmcm9tICcuL2V4dHJhY3QtaW5zdGFuY2Utb3B0aW9ucydcbmltcG9ydCBjcmVhdGVGdW5jdGlvbmFsQ29tcG9uZW50IGZyb20gJy4vY3JlYXRlLWZ1bmN0aW9uYWwtY29tcG9uZW50J1xuaW1wb3J0IHsgY29tcG9uZW50TmVlZHNDb21waWxpbmcsIGlzUGxhaW5PYmplY3QgfSBmcm9tICdzaGFyZWQvdmFsaWRhdG9ycydcbmltcG9ydCB7IHZhbGlkYXRlU2xvdHMgfSBmcm9tICcuL3ZhbGlkYXRlLXNsb3RzJ1xuaW1wb3J0IGNyZWF0ZVNjb3BlZFNsb3RzIGZyb20gJy4vY3JlYXRlLXNjb3BlZC1zbG90cydcbmltcG9ydCB7IGNyZWF0ZVN0dWJzRnJvbVN0dWJzT2JqZWN0IH0gZnJvbSAnLi9jcmVhdGUtY29tcG9uZW50LXN0dWJzJ1xuaW1wb3J0IHsgcGF0Y2hSZW5kZXIgfSBmcm9tICcuL3BhdGNoLXJlbmRlcidcblxuZnVuY3Rpb24gdnVlRXh0ZW5kVW5zdXBwb3J0ZWRPcHRpb24gKG9wdGlvbjogc3RyaW5nKSB7XG4gIHJldHVybiBgb3B0aW9ucy4ke29wdGlvbn0gaXMgbm90IHN1cHBvcnRlZCBmb3IgYCArXG4gIGBjb21wb25lbnRzIGNyZWF0ZWQgd2l0aCBWdWUuZXh0ZW5kIGluIFZ1ZSA8IDIuMy4gYCArXG4gIGBZb3UgY2FuIHNldCAke29wdGlvbn0gdG8gZmFsc2UgdG8gbW91bnQgdGhlIGNvbXBvbmVudC5gXG59XG5cbi8vIHRoZXNlIG9wdGlvbnMgYXJlbid0IHN1cHBvcnRlZCBpZiBWdWUgaXMgdmVyc2lvbiA8IDIuM1xuLy8gZm9yIGNvbXBvbmVudHMgdXNpbmcgVnVlLmV4dGVuZC4gVGhpcyBpcyBkdWUgdG8gYSBidWdcbi8vIHRoYXQgbWVhbnMgdGhlIG1peGlucyB3ZSB1c2UgdG8gYWRkIHByb3BlcnRpZXMgYXJlIG5vdCBhcHBsaWVkXG4vLyBjb3JyZWN0bHlcbmNvbnN0IFVOU1VQUE9SVEVEX1ZFUlNJT05fT1BUSU9OUyA9IFtcbiAgJ21vY2tzJyxcbiAgJ3N0dWJzJyxcbiAgJ2xvY2FsVnVlJ1xuXVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjcmVhdGVJbnN0YW5jZSAoXG4gIGNvbXBvbmVudDogQ29tcG9uZW50LFxuICBvcHRpb25zOiBPcHRpb25zLFxuICBfVnVlOiBDb21wb25lbnRcbik6IENvbXBvbmVudCB7XG4gIC8vIG1ha2Ugc3VyZSBhbGwgZXh0ZW5kcyBhcmUgYmFzZWQgb24gdGhpcyBpbnN0YW5jZVxuICBfVnVlLm9wdGlvbnMuX2Jhc2UgPSBfVnVlXG5cbiAgaWYgKFxuICAgIFZVRV9WRVJTSU9OIDwgMi4zICYmXG4gICAgdHlwZW9mIGNvbXBvbmVudCA9PT0gJ2Z1bmN0aW9uJyAmJlxuICAgIGNvbXBvbmVudC5vcHRpb25zXG4gICkge1xuICAgIFVOU1VQUE9SVEVEX1ZFUlNJT05fT1BUSU9OUy5mb3JFYWNoKChvcHRpb24pID0+IHtcbiAgICAgIGlmIChvcHRpb25zW29wdGlvbl0pIHtcbiAgICAgICAgdGhyb3dFcnJvcih2dWVFeHRlbmRVbnN1cHBvcnRlZE9wdGlvbihvcHRpb24pKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICAvLyBpbnN0YW5jZSBvcHRpb25zIGFyZSBvcHRpb25zIHRoYXQgYXJlIHBhc3NlZCB0byB0aGVcbiAgLy8gcm9vdCBpbnN0YW5jZSB3aGVuIGl0J3MgaW5zdGFudGlhdGVkXG4gIGNvbnN0IGluc3RhbmNlT3B0aW9ucyA9IGV4dHJhY3RJbnN0YW5jZU9wdGlvbnMob3B0aW9ucylcbiAgY29uc3Qgc3R1YkNvbXBvbmVudHNPYmplY3QgPSBjcmVhdGVTdHVic0Zyb21TdHVic09iamVjdChcbiAgICBjb21wb25lbnQuY29tcG9uZW50cyxcbiAgICAvLyAkRmxvd0lnbm9yZVxuICAgIG9wdGlvbnMuc3R1YnNcbiAgKVxuXG4gIGFkZEV2ZW50TG9nZ2VyKF9WdWUpXG4gIGFkZE1vY2tzKF9WdWUsIG9wdGlvbnMubW9ja3MpXG4gIGFkZFN0dWJzKF9WdWUsIHN0dWJDb21wb25lbnRzT2JqZWN0KVxuICBwYXRjaFJlbmRlcihfVnVlLCBzdHViQ29tcG9uZW50c09iamVjdCwgb3B0aW9ucy5zaG91bGRQcm94eSlcblxuICBpZiAoXG4gICAgKGNvbXBvbmVudC5vcHRpb25zICYmIGNvbXBvbmVudC5vcHRpb25zLmZ1bmN0aW9uYWwpIHx8XG4gICAgY29tcG9uZW50LmZ1bmN0aW9uYWxcbiAgKSB7XG4gICAgY29tcG9uZW50ID0gY3JlYXRlRnVuY3Rpb25hbENvbXBvbmVudChjb21wb25lbnQsIG9wdGlvbnMsIF9WdWUpXG4gIH0gZWxzZSBpZiAob3B0aW9ucy5jb250ZXh0KSB7XG4gICAgdGhyb3dFcnJvcihcbiAgICAgIGBtb3VudC5jb250ZXh0IGNhbiBvbmx5IGJlIHVzZWQgd2hlbiBtb3VudGluZyBhIGAgK1xuICAgICAgYGZ1bmN0aW9uYWwgY29tcG9uZW50YFxuICAgIClcbiAgfVxuXG4gIGlmIChjb21wb25lbnROZWVkc0NvbXBpbGluZyhjb21wb25lbnQpKSB7XG4gICAgY29tcGlsZVRlbXBsYXRlKGNvbXBvbmVudClcbiAgfVxuXG4gIGlmIChjb21wb25lbnQub3B0aW9ucykge1xuICAgIGNvbXBvbmVudC5vcHRpb25zLl9iYXNlID0gX1Z1ZVxuICB9XG5cbiAgLy8gZXh0ZW5kIGNvbXBvbmVudCBmcm9tIF9WdWUgdG8gYWRkIHByb3BlcnRpZXMgYW5kIG1peGluc1xuICAvLyBleHRlbmQgZG9lcyBub3Qgd29yayBjb3JyZWN0bHkgZm9yIHN1YiBjbGFzcyBjb21wb25lbnRzIGluIFZ1ZSA8IDIuMlxuICBjb25zdCBDb25zdHJ1Y3RvciA9IHR5cGVvZiBjb21wb25lbnQgPT09ICdmdW5jdGlvbidcbiAgICA/IF9WdWUuZXh0ZW5kKGNvbXBvbmVudC5vcHRpb25zKS5leHRlbmQoaW5zdGFuY2VPcHRpb25zKVxuICAgIDogX1Z1ZS5leHRlbmQoY29tcG9uZW50KS5leHRlbmQoaW5zdGFuY2VPcHRpb25zKVxuXG4gIC8vIHVzZWQgdG8gaWRlbnRpZnkgZXh0ZW5kZWQgY29tcG9uZW50IHVzaW5nIGNvbnN0cnVjdG9yXG4gIENvbnN0cnVjdG9yLm9wdGlvbnMuJF92dWVUZXN0VXRpbHNfb3JpZ2luYWwgPSBjb21wb25lbnRcblxuICBpZiAob3B0aW9ucy5zbG90cykge1xuICAgIGNvbXBpbGVUZW1wbGF0ZUZvclNsb3RzKG9wdGlvbnMuc2xvdHMpXG4gICAgLy8gdmFsaWRhdGUgc2xvdHMgb3V0c2lkZSBvZiB0aGUgY3JlYXRlU2xvdHMgZnVuY3Rpb24gc29cbiAgICAvLyB0aGF0IHdlIGNhbiB0aHJvdyBhbiBlcnJvciB3aXRob3V0IGl0IGJlaW5nIGNhdWdodCBieVxuICAgIC8vIHRoZSBWdWUgZXJyb3IgaGFuZGxlclxuICAgIC8vICRGbG93SWdub3JlXG4gICAgdmFsaWRhdGVTbG90cyhvcHRpb25zLnNsb3RzKVxuICB9XG5cbiAgLy8gT2JqZWN0cyBhcmUgbm90IHJlc29sdmVkIGluIGV4dGVuZGVkIGNvbXBvbmVudHMgaW4gVnVlIDwgMi41XG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS92dWVqcy92dWUvaXNzdWVzLzY0MzZcbiAgaWYgKFxuICAgIG9wdGlvbnMucHJvdmlkZSAmJlxuICAgIHR5cGVvZiBvcHRpb25zLnByb3ZpZGUgPT09ICdvYmplY3QnICYmXG4gICAgVlVFX1ZFUlNJT04gPCAyLjVcbiAgKSB7XG4gICAgY29uc3Qgb2JqID0geyAuLi5vcHRpb25zLnByb3ZpZGUgfVxuICAgIG9wdGlvbnMucHJvdmlkZSA9ICgpID0+IG9ialxuICB9XG5cbiAgY29uc3Qgc2NvcGVkU2xvdHMgPSBjcmVhdGVTY29wZWRTbG90cyhvcHRpb25zLnNjb3BlZFNsb3RzLCBfVnVlKVxuXG4gIGlmIChvcHRpb25zLnBhcmVudENvbXBvbmVudCAmJiAhaXNQbGFpbk9iamVjdChvcHRpb25zLnBhcmVudENvbXBvbmVudCkpIHtcbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYG9wdGlvbnMucGFyZW50Q29tcG9uZW50IHNob3VsZCBiZSBhIHZhbGlkIFZ1ZSBjb21wb25lbnQgYCArXG4gICAgICBgb3B0aW9ucyBvYmplY3RgXG4gICAgKVxuICB9XG5cbiAgY29uc3QgcGFyZW50Q29tcG9uZW50T3B0aW9ucyA9IG9wdGlvbnMucGFyZW50Q29tcG9uZW50IHx8IHt9XG4gIHBhcmVudENvbXBvbmVudE9wdGlvbnMucHJvdmlkZSA9IG9wdGlvbnMucHJvdmlkZVxuICBwYXJlbnRDb21wb25lbnRPcHRpb25zLiRfZG9Ob3RTdHViQ2hpbGRyZW4gPSB0cnVlXG5cbiAgcGFyZW50Q29tcG9uZW50T3B0aW9ucy5yZW5kZXIgPSBmdW5jdGlvbiAoaCkge1xuICAgIGNvbnN0IHNsb3RzID0gb3B0aW9ucy5zbG90c1xuICAgICAgPyBjcmVhdGVTbG90Vk5vZGVzKHRoaXMsIG9wdGlvbnMuc2xvdHMpXG4gICAgICA6IHVuZGVmaW5lZFxuICAgIHJldHVybiBoKFxuICAgICAgQ29uc3RydWN0b3IsXG4gICAgICB7XG4gICAgICAgIHJlZjogJ3ZtJyxcbiAgICAgICAgb246IG9wdGlvbnMubGlzdGVuZXJzLFxuICAgICAgICBhdHRyczoge1xuICAgICAgICAgIC4uLm9wdGlvbnMuYXR0cnMsXG4gICAgICAgICAgLy8gcGFzcyBhcyBhdHRycyBzbyB0aGF0IGluaGVyaXRBdHRycyB3b3JrcyBjb3JyZWN0bHlcbiAgICAgICAgICAvLyBwcm9wc0RhdGEgc2hvdWxkIHRha2UgcHJlY2VkZW5jZSBvdmVyIGF0dHJzXG4gICAgICAgICAgLi4ub3B0aW9ucy5wcm9wc0RhdGFcbiAgICAgICAgfSxcbiAgICAgICAgc2NvcGVkU2xvdHNcbiAgICAgIH0sXG4gICAgICBzbG90c1xuICAgIClcbiAgfVxuICBjb25zdCBQYXJlbnQgPSBfVnVlLmV4dGVuZChwYXJlbnRDb21wb25lbnRPcHRpb25zKVxuXG4gIHJldHVybiBuZXcgUGFyZW50KClcbn1cbiIsIi8vIEBmbG93XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnQgKCk6IEhUTUxFbGVtZW50IHwgdm9pZCB7XG4gIGlmIChkb2N1bWVudCkge1xuICAgIGNvbnN0IGVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuXG4gICAgaWYgKGRvY3VtZW50LmJvZHkpIHtcbiAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZWxlbSlcbiAgICB9XG4gICAgcmV0dXJuIGVsZW1cbiAgfVxufVxuIiwiLy8gQGZsb3dcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZXJyb3JIYW5kbGVyIChcbiAgZXJyb3JPclN0cmluZzogYW55LFxuICB2bTogQ29tcG9uZW50XG4pOiB2b2lkIHtcbiAgY29uc3QgZXJyb3IgPVxuICAgIHR5cGVvZiBlcnJvck9yU3RyaW5nID09PSAnb2JqZWN0J1xuICAgICAgPyBlcnJvck9yU3RyaW5nXG4gICAgICA6IG5ldyBFcnJvcihlcnJvck9yU3RyaW5nKVxuXG4gIHZtLl9lcnJvciA9IGVycm9yXG5cbiAgdGhyb3cgZXJyb3Jcbn1cbiIsImltcG9ydCB7IGlzUGxhaW5PYmplY3QgfSBmcm9tICcuL3ZhbGlkYXRvcnMnXG5pbXBvcnQgeyB0aHJvd0Vycm9yIH0gZnJvbSAnLi91dGlsJ1xuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplU3R1YnMgKHN0dWJzID0ge30pIHtcbiAgaWYgKHN0dWJzID09PSBmYWxzZSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG4gIGlmIChpc1BsYWluT2JqZWN0KHN0dWJzKSkge1xuICAgIHJldHVybiBzdHVic1xuICB9XG4gIGlmIChBcnJheS5pc0FycmF5KHN0dWJzKSkge1xuICAgIHJldHVybiBzdHVicy5yZWR1Y2UoKGFjYywgc3R1YikgPT4ge1xuICAgICAgaWYgKHR5cGVvZiBzdHViICE9PSAnc3RyaW5nJykge1xuICAgICAgICB0aHJvd0Vycm9yKCdlYWNoIGl0ZW0gaW4gYW4gb3B0aW9ucy5zdHVicyBhcnJheSBtdXN0IGJlIGEgc3RyaW5nJylcbiAgICAgIH1cbiAgICAgIGFjY1tzdHViXSA9IHRydWVcbiAgICAgIHJldHVybiBhY2NcbiAgICB9LCB7fSlcbiAgfVxuICB0aHJvd0Vycm9yKCdvcHRpb25zLnN0dWJzIG11c3QgYmUgYW4gb2JqZWN0IG9yIGFuIEFycmF5Jylcbn1cbiIsIi8vIEBmbG93XG5pbXBvcnQgeyBub3JtYWxpemVTdHVicyB9IGZyb20gJy4vbm9ybWFsaXplJ1xuXG5mdW5jdGlvbiBnZXRPcHRpb24gKG9wdGlvbiwgY29uZmlnPzogT2JqZWN0KTogYW55IHtcbiAgaWYgKG9wdGlvbiA9PT0gZmFsc2UpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuICBpZiAob3B0aW9uIHx8IChjb25maWcgJiYgT2JqZWN0LmtleXMoY29uZmlnKS5sZW5ndGggPiAwKSkge1xuICAgIGlmIChvcHRpb24gaW5zdGFuY2VvZiBGdW5jdGlvbikge1xuICAgICAgcmV0dXJuIG9wdGlvblxuICAgIH1cbiAgICBpZiAoY29uZmlnIGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ29uZmlnIGNhbid0IGJlIGEgRnVuY3Rpb24uYClcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLmNvbmZpZyxcbiAgICAgIC4uLm9wdGlvblxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbWVyZ2VPcHRpb25zIChvcHRpb25zOiBPcHRpb25zLCBjb25maWc6IENvbmZpZyk6IE9wdGlvbnMge1xuICBjb25zdCBtb2NrcyA9IChnZXRPcHRpb24ob3B0aW9ucy5tb2NrcywgY29uZmlnLm1vY2tzKTogT2JqZWN0KVxuICBjb25zdCBtZXRob2RzID0gKFxuICAgIChnZXRPcHRpb24ob3B0aW9ucy5tZXRob2RzLCBjb25maWcubWV0aG9kcykpOiB7IFtrZXk6IHN0cmluZ106IEZ1bmN0aW9uIH0pXG4gIGNvbnN0IHByb3ZpZGUgPSAoKGdldE9wdGlvbihvcHRpb25zLnByb3ZpZGUsIGNvbmZpZy5wcm92aWRlKSk6IE9iamVjdClcbiAgcmV0dXJuIHtcbiAgICAuLi5vcHRpb25zLFxuICAgIGxvZ01vZGlmaWVkQ29tcG9uZW50czogY29uZmlnLmxvZ01vZGlmaWVkQ29tcG9uZW50cyxcbiAgICBzdHViczogZ2V0T3B0aW9uKG5vcm1hbGl6ZVN0dWJzKG9wdGlvbnMuc3R1YnMpLCBjb25maWcuc3R1YnMpLFxuICAgIG1vY2tzLFxuICAgIG1ldGhvZHMsXG4gICAgcHJvdmlkZSxcbiAgICBzeW5jOiAhIShvcHRpb25zLnN5bmMgfHwgb3B0aW9ucy5zeW5jID09PSB1bmRlZmluZWQpXG4gIH1cbn1cbiIsIi8vIEBmbG93XG5cbmltcG9ydCB7IHRocm93RXJyb3IgfSBmcm9tICdzaGFyZWQvdXRpbCdcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gd2FybklmTm9XaW5kb3cgKCk6IHZvaWQge1xuICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYHdpbmRvdyBpcyB1bmRlZmluZWQsIHZ1ZS10ZXN0LXV0aWxzIG5lZWRzIHRvIGJlIGAgK1xuICAgICAgYHJ1biBpbiBhIGJyb3dzZXIgZW52aXJvbm1lbnQuIFxcbmAgK1xuICAgICAgYFlvdSBjYW4gcnVuIHRoZSB0ZXN0cyBpbiBub2RlIHVzaW5nIGpzZG9tIFxcbmAgK1xuICAgICAgYFNlZSBodHRwczovL3Z1ZS10ZXN0LXV0aWxzLnZ1ZWpzLm9yZy9ndWlkZXMvI2Jyb3dzZXItZW52aXJvbm1lbnQgYCArXG4gICAgICBgZm9yIG1vcmUgZGV0YWlscy5gXG4gICAgKVxuICB9XG59XG4iLCIvKipcbiAqIFJlbW92ZXMgYWxsIGtleS12YWx1ZSBlbnRyaWVzIGZyb20gdGhlIGxpc3QgY2FjaGUuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGNsZWFyXG4gKiBAbWVtYmVyT2YgTGlzdENhY2hlXG4gKi9cbmZ1bmN0aW9uIGxpc3RDYWNoZUNsZWFyKCkge1xuICB0aGlzLl9fZGF0YV9fID0gW107XG4gIHRoaXMuc2l6ZSA9IDA7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbGlzdENhY2hlQ2xlYXI7XG4iLCIvKipcbiAqIFBlcmZvcm1zIGFcbiAqIFtgU2FtZVZhbHVlWmVyb2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLXNhbWV2YWx1ZXplcm8pXG4gKiBjb21wYXJpc29uIGJldHdlZW4gdHdvIHZhbHVlcyB0byBkZXRlcm1pbmUgaWYgdGhleSBhcmUgZXF1aXZhbGVudC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY29tcGFyZS5cbiAqIEBwYXJhbSB7Kn0gb3RoZXIgVGhlIG90aGVyIHZhbHVlIHRvIGNvbXBhcmUuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHZhbHVlcyBhcmUgZXF1aXZhbGVudCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgb2JqZWN0ID0geyAnYSc6IDEgfTtcbiAqIHZhciBvdGhlciA9IHsgJ2EnOiAxIH07XG4gKlxuICogXy5lcShvYmplY3QsIG9iamVjdCk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5lcShvYmplY3QsIG90aGVyKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5lcSgnYScsICdhJyk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5lcSgnYScsIE9iamVjdCgnYScpKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5lcShOYU4sIE5hTik7XG4gKiAvLyA9PiB0cnVlXG4gKi9cbmZ1bmN0aW9uIGVxKHZhbHVlLCBvdGhlcikge1xuICByZXR1cm4gdmFsdWUgPT09IG90aGVyIHx8ICh2YWx1ZSAhPT0gdmFsdWUgJiYgb3RoZXIgIT09IG90aGVyKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBlcTtcbiIsInZhciBlcSA9IHJlcXVpcmUoJy4vZXEnKTtcblxuLyoqXG4gKiBHZXRzIHRoZSBpbmRleCBhdCB3aGljaCB0aGUgYGtleWAgaXMgZm91bmQgaW4gYGFycmF5YCBvZiBrZXktdmFsdWUgcGFpcnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBpbnNwZWN0LlxuICogQHBhcmFtIHsqfSBrZXkgVGhlIGtleSB0byBzZWFyY2ggZm9yLlxuICogQHJldHVybnMge251bWJlcn0gUmV0dXJucyB0aGUgaW5kZXggb2YgdGhlIG1hdGNoZWQgdmFsdWUsIGVsc2UgYC0xYC5cbiAqL1xuZnVuY3Rpb24gYXNzb2NJbmRleE9mKGFycmF5LCBrZXkpIHtcbiAgdmFyIGxlbmd0aCA9IGFycmF5Lmxlbmd0aDtcbiAgd2hpbGUgKGxlbmd0aC0tKSB7XG4gICAgaWYgKGVxKGFycmF5W2xlbmd0aF1bMF0sIGtleSkpIHtcbiAgICAgIHJldHVybiBsZW5ndGg7XG4gICAgfVxuICB9XG4gIHJldHVybiAtMTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBhc3NvY0luZGV4T2Y7XG4iLCJ2YXIgYXNzb2NJbmRleE9mID0gcmVxdWlyZSgnLi9fYXNzb2NJbmRleE9mJyk7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBhcnJheVByb3RvID0gQXJyYXkucHJvdG90eXBlO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBzcGxpY2UgPSBhcnJheVByb3RvLnNwbGljZTtcblxuLyoqXG4gKiBSZW1vdmVzIGBrZXlgIGFuZCBpdHMgdmFsdWUgZnJvbSB0aGUgbGlzdCBjYWNoZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgZGVsZXRlXG4gKiBAbWVtYmVyT2YgTGlzdENhY2hlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIHJlbW92ZS5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgZW50cnkgd2FzIHJlbW92ZWQsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gbGlzdENhY2hlRGVsZXRlKGtleSkge1xuICB2YXIgZGF0YSA9IHRoaXMuX19kYXRhX18sXG4gICAgICBpbmRleCA9IGFzc29jSW5kZXhPZihkYXRhLCBrZXkpO1xuXG4gIGlmIChpbmRleCA8IDApIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmFyIGxhc3RJbmRleCA9IGRhdGEubGVuZ3RoIC0gMTtcbiAgaWYgKGluZGV4ID09IGxhc3RJbmRleCkge1xuICAgIGRhdGEucG9wKCk7XG4gIH0gZWxzZSB7XG4gICAgc3BsaWNlLmNhbGwoZGF0YSwgaW5kZXgsIDEpO1xuICB9XG4gIC0tdGhpcy5zaXplO1xuICByZXR1cm4gdHJ1ZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBsaXN0Q2FjaGVEZWxldGU7XG4iLCJ2YXIgYXNzb2NJbmRleE9mID0gcmVxdWlyZSgnLi9fYXNzb2NJbmRleE9mJyk7XG5cbi8qKlxuICogR2V0cyB0aGUgbGlzdCBjYWNoZSB2YWx1ZSBmb3IgYGtleWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGdldFxuICogQG1lbWJlck9mIExpc3RDYWNoZVxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byBnZXQuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgZW50cnkgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIGxpc3RDYWNoZUdldChrZXkpIHtcbiAgdmFyIGRhdGEgPSB0aGlzLl9fZGF0YV9fLFxuICAgICAgaW5kZXggPSBhc3NvY0luZGV4T2YoZGF0YSwga2V5KTtcblxuICByZXR1cm4gaW5kZXggPCAwID8gdW5kZWZpbmVkIDogZGF0YVtpbmRleF1bMV07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbGlzdENhY2hlR2V0O1xuIiwidmFyIGFzc29jSW5kZXhPZiA9IHJlcXVpcmUoJy4vX2Fzc29jSW5kZXhPZicpO1xuXG4vKipcbiAqIENoZWNrcyBpZiBhIGxpc3QgY2FjaGUgdmFsdWUgZm9yIGBrZXlgIGV4aXN0cy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgaGFzXG4gKiBAbWVtYmVyT2YgTGlzdENhY2hlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIGVudHJ5IHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGFuIGVudHJ5IGZvciBga2V5YCBleGlzdHMsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gbGlzdENhY2hlSGFzKGtleSkge1xuICByZXR1cm4gYXNzb2NJbmRleE9mKHRoaXMuX19kYXRhX18sIGtleSkgPiAtMTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBsaXN0Q2FjaGVIYXM7XG4iLCJ2YXIgYXNzb2NJbmRleE9mID0gcmVxdWlyZSgnLi9fYXNzb2NJbmRleE9mJyk7XG5cbi8qKlxuICogU2V0cyB0aGUgbGlzdCBjYWNoZSBga2V5YCB0byBgdmFsdWVgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBzZXRcbiAqIEBtZW1iZXJPZiBMaXN0Q2FjaGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gc2V0LlxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gc2V0LlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgbGlzdCBjYWNoZSBpbnN0YW5jZS5cbiAqL1xuZnVuY3Rpb24gbGlzdENhY2hlU2V0KGtleSwgdmFsdWUpIHtcbiAgdmFyIGRhdGEgPSB0aGlzLl9fZGF0YV9fLFxuICAgICAgaW5kZXggPSBhc3NvY0luZGV4T2YoZGF0YSwga2V5KTtcblxuICBpZiAoaW5kZXggPCAwKSB7XG4gICAgKyt0aGlzLnNpemU7XG4gICAgZGF0YS5wdXNoKFtrZXksIHZhbHVlXSk7XG4gIH0gZWxzZSB7XG4gICAgZGF0YVtpbmRleF1bMV0gPSB2YWx1ZTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBsaXN0Q2FjaGVTZXQ7XG4iLCJ2YXIgbGlzdENhY2hlQ2xlYXIgPSByZXF1aXJlKCcuL19saXN0Q2FjaGVDbGVhcicpLFxuICAgIGxpc3RDYWNoZURlbGV0ZSA9IHJlcXVpcmUoJy4vX2xpc3RDYWNoZURlbGV0ZScpLFxuICAgIGxpc3RDYWNoZUdldCA9IHJlcXVpcmUoJy4vX2xpc3RDYWNoZUdldCcpLFxuICAgIGxpc3RDYWNoZUhhcyA9IHJlcXVpcmUoJy4vX2xpc3RDYWNoZUhhcycpLFxuICAgIGxpc3RDYWNoZVNldCA9IHJlcXVpcmUoJy4vX2xpc3RDYWNoZVNldCcpO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gbGlzdCBjYWNoZSBvYmplY3QuXG4gKlxuICogQHByaXZhdGVcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtBcnJheX0gW2VudHJpZXNdIFRoZSBrZXktdmFsdWUgcGFpcnMgdG8gY2FjaGUuXG4gKi9cbmZ1bmN0aW9uIExpc3RDYWNoZShlbnRyaWVzKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gZW50cmllcyA9PSBudWxsID8gMCA6IGVudHJpZXMubGVuZ3RoO1xuXG4gIHRoaXMuY2xlYXIoKTtcbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICB2YXIgZW50cnkgPSBlbnRyaWVzW2luZGV4XTtcbiAgICB0aGlzLnNldChlbnRyeVswXSwgZW50cnlbMV0pO1xuICB9XG59XG5cbi8vIEFkZCBtZXRob2RzIHRvIGBMaXN0Q2FjaGVgLlxuTGlzdENhY2hlLnByb3RvdHlwZS5jbGVhciA9IGxpc3RDYWNoZUNsZWFyO1xuTGlzdENhY2hlLnByb3RvdHlwZVsnZGVsZXRlJ10gPSBsaXN0Q2FjaGVEZWxldGU7XG5MaXN0Q2FjaGUucHJvdG90eXBlLmdldCA9IGxpc3RDYWNoZUdldDtcbkxpc3RDYWNoZS5wcm90b3R5cGUuaGFzID0gbGlzdENhY2hlSGFzO1xuTGlzdENhY2hlLnByb3RvdHlwZS5zZXQgPSBsaXN0Q2FjaGVTZXQ7XG5cbm1vZHVsZS5leHBvcnRzID0gTGlzdENhY2hlO1xuIiwidmFyIExpc3RDYWNoZSA9IHJlcXVpcmUoJy4vX0xpc3RDYWNoZScpO1xuXG4vKipcbiAqIFJlbW92ZXMgYWxsIGtleS12YWx1ZSBlbnRyaWVzIGZyb20gdGhlIHN0YWNrLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBjbGVhclxuICogQG1lbWJlck9mIFN0YWNrXG4gKi9cbmZ1bmN0aW9uIHN0YWNrQ2xlYXIoKSB7XG4gIHRoaXMuX19kYXRhX18gPSBuZXcgTGlzdENhY2hlO1xuICB0aGlzLnNpemUgPSAwO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHN0YWNrQ2xlYXI7XG4iLCIvKipcbiAqIFJlbW92ZXMgYGtleWAgYW5kIGl0cyB2YWx1ZSBmcm9tIHRoZSBzdGFjay5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgZGVsZXRlXG4gKiBAbWVtYmVyT2YgU3RhY2tcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gcmVtb3ZlLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBlbnRyeSB3YXMgcmVtb3ZlZCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBzdGFja0RlbGV0ZShrZXkpIHtcbiAgdmFyIGRhdGEgPSB0aGlzLl9fZGF0YV9fLFxuICAgICAgcmVzdWx0ID0gZGF0YVsnZGVsZXRlJ10oa2V5KTtcblxuICB0aGlzLnNpemUgPSBkYXRhLnNpemU7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc3RhY2tEZWxldGU7XG4iLCIvKipcbiAqIEdldHMgdGhlIHN0YWNrIHZhbHVlIGZvciBga2V5YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgZ2V0XG4gKiBAbWVtYmVyT2YgU3RhY2tcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gZ2V0LlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIGVudHJ5IHZhbHVlLlxuICovXG5mdW5jdGlvbiBzdGFja0dldChrZXkpIHtcbiAgcmV0dXJuIHRoaXMuX19kYXRhX18uZ2V0KGtleSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc3RhY2tHZXQ7XG4iLCIvKipcbiAqIENoZWNrcyBpZiBhIHN0YWNrIHZhbHVlIGZvciBga2V5YCBleGlzdHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGhhc1xuICogQG1lbWJlck9mIFN0YWNrXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIGVudHJ5IHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGFuIGVudHJ5IGZvciBga2V5YCBleGlzdHMsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gc3RhY2tIYXMoa2V5KSB7XG4gIHJldHVybiB0aGlzLl9fZGF0YV9fLmhhcyhrZXkpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHN0YWNrSGFzO1xuIiwiLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBnbG9iYWxgIGZyb20gTm9kZS5qcy4gKi9cbnZhciBmcmVlR2xvYmFsID0gdHlwZW9mIGdsb2JhbCA9PSAnb2JqZWN0JyAmJiBnbG9iYWwgJiYgZ2xvYmFsLk9iamVjdCA9PT0gT2JqZWN0ICYmIGdsb2JhbDtcblxubW9kdWxlLmV4cG9ydHMgPSBmcmVlR2xvYmFsO1xuIiwidmFyIGZyZWVHbG9iYWwgPSByZXF1aXJlKCcuL19mcmVlR2xvYmFsJyk7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgc2VsZmAuICovXG52YXIgZnJlZVNlbGYgPSB0eXBlb2Ygc2VsZiA9PSAnb2JqZWN0JyAmJiBzZWxmICYmIHNlbGYuT2JqZWN0ID09PSBPYmplY3QgJiYgc2VsZjtcblxuLyoqIFVzZWQgYXMgYSByZWZlcmVuY2UgdG8gdGhlIGdsb2JhbCBvYmplY3QuICovXG52YXIgcm9vdCA9IGZyZWVHbG9iYWwgfHwgZnJlZVNlbGYgfHwgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcblxubW9kdWxlLmV4cG9ydHMgPSByb290O1xuIiwidmFyIHJvb3QgPSByZXF1aXJlKCcuL19yb290Jyk7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIFN5bWJvbCA9IHJvb3QuU3ltYm9sO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFN5bWJvbDtcbiIsInZhciBTeW1ib2wgPSByZXF1aXJlKCcuL19TeW1ib2wnKTtcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBVc2VkIHRvIHJlc29sdmUgdGhlXG4gKiBbYHRvU3RyaW5nVGFnYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtb2JqZWN0LnByb3RvdHlwZS50b3N0cmluZylcbiAqIG9mIHZhbHVlcy5cbiAqL1xudmFyIG5hdGl2ZU9iamVjdFRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIHN5bVRvU3RyaW5nVGFnID0gU3ltYm9sID8gU3ltYm9sLnRvU3RyaW5nVGFnIDogdW5kZWZpbmVkO1xuXG4vKipcbiAqIEEgc3BlY2lhbGl6ZWQgdmVyc2lvbiBvZiBgYmFzZUdldFRhZ2Agd2hpY2ggaWdub3JlcyBgU3ltYm9sLnRvU3RyaW5nVGFnYCB2YWx1ZXMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHF1ZXJ5LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgcmF3IGB0b1N0cmluZ1RhZ2AuXG4gKi9cbmZ1bmN0aW9uIGdldFJhd1RhZyh2YWx1ZSkge1xuICB2YXIgaXNPd24gPSBoYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbHVlLCBzeW1Ub1N0cmluZ1RhZyksXG4gICAgICB0YWcgPSB2YWx1ZVtzeW1Ub1N0cmluZ1RhZ107XG5cbiAgdHJ5IHtcbiAgICB2YWx1ZVtzeW1Ub1N0cmluZ1RhZ10gPSB1bmRlZmluZWQ7XG4gICAgdmFyIHVubWFza2VkID0gdHJ1ZTtcbiAgfSBjYXRjaCAoZSkge31cblxuICB2YXIgcmVzdWx0ID0gbmF0aXZlT2JqZWN0VG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIGlmICh1bm1hc2tlZCkge1xuICAgIGlmIChpc093bikge1xuICAgICAgdmFsdWVbc3ltVG9TdHJpbmdUYWddID0gdGFnO1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWxldGUgdmFsdWVbc3ltVG9TdHJpbmdUYWddO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldFJhd1RhZztcbiIsIi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKlxuICogVXNlZCB0byByZXNvbHZlIHRoZVxuICogW2B0b1N0cmluZ1RhZ2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmcpXG4gKiBvZiB2YWx1ZXMuXG4gKi9cbnZhciBuYXRpdmVPYmplY3RUb1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKipcbiAqIENvbnZlcnRzIGB2YWx1ZWAgdG8gYSBzdHJpbmcgdXNpbmcgYE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmdgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjb252ZXJ0LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgY29udmVydGVkIHN0cmluZy5cbiAqL1xuZnVuY3Rpb24gb2JqZWN0VG9TdHJpbmcodmFsdWUpIHtcbiAgcmV0dXJuIG5hdGl2ZU9iamVjdFRvU3RyaW5nLmNhbGwodmFsdWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG9iamVjdFRvU3RyaW5nO1xuIiwidmFyIFN5bWJvbCA9IHJlcXVpcmUoJy4vX1N5bWJvbCcpLFxuICAgIGdldFJhd1RhZyA9IHJlcXVpcmUoJy4vX2dldFJhd1RhZycpLFxuICAgIG9iamVjdFRvU3RyaW5nID0gcmVxdWlyZSgnLi9fb2JqZWN0VG9TdHJpbmcnKTtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIG51bGxUYWcgPSAnW29iamVjdCBOdWxsXScsXG4gICAgdW5kZWZpbmVkVGFnID0gJ1tvYmplY3QgVW5kZWZpbmVkXSc7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIHN5bVRvU3RyaW5nVGFnID0gU3ltYm9sID8gU3ltYm9sLnRvU3RyaW5nVGFnIDogdW5kZWZpbmVkO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBnZXRUYWdgIHdpdGhvdXQgZmFsbGJhY2tzIGZvciBidWdneSBlbnZpcm9ubWVudHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHF1ZXJ5LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgYHRvU3RyaW5nVGFnYC5cbiAqL1xuZnVuY3Rpb24gYmFzZUdldFRhZyh2YWx1ZSkge1xuICBpZiAodmFsdWUgPT0gbnVsbCkge1xuICAgIHJldHVybiB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gdW5kZWZpbmVkVGFnIDogbnVsbFRhZztcbiAgfVxuICByZXR1cm4gKHN5bVRvU3RyaW5nVGFnICYmIHN5bVRvU3RyaW5nVGFnIGluIE9iamVjdCh2YWx1ZSkpXG4gICAgPyBnZXRSYXdUYWcodmFsdWUpXG4gICAgOiBvYmplY3RUb1N0cmluZyh2YWx1ZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUdldFRhZztcbiIsIi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgdGhlXG4gKiBbbGFuZ3VhZ2UgdHlwZV0oaHR0cDovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLWVjbWFzY3JpcHQtbGFuZ3VhZ2UtdHlwZXMpXG4gKiBvZiBgT2JqZWN0YC4gKGUuZy4gYXJyYXlzLCBmdW5jdGlvbnMsIG9iamVjdHMsIHJlZ2V4ZXMsIGBuZXcgTnVtYmVyKDApYCwgYW5kIGBuZXcgU3RyaW5nKCcnKWApXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gb2JqZWN0LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNPYmplY3Qoe30pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KF8ubm9vcCk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChudWxsKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0KHZhbHVlKSB7XG4gIHZhciB0eXBlID0gdHlwZW9mIHZhbHVlO1xuICByZXR1cm4gdmFsdWUgIT0gbnVsbCAmJiAodHlwZSA9PSAnb2JqZWN0JyB8fCB0eXBlID09ICdmdW5jdGlvbicpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzT2JqZWN0O1xuIiwidmFyIGJhc2VHZXRUYWcgPSByZXF1aXJlKCcuL19iYXNlR2V0VGFnJyksXG4gICAgaXNPYmplY3QgPSByZXF1aXJlKCcuL2lzT2JqZWN0Jyk7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBhc3luY1RhZyA9ICdbb2JqZWN0IEFzeW5jRnVuY3Rpb25dJyxcbiAgICBmdW5jVGFnID0gJ1tvYmplY3QgRnVuY3Rpb25dJyxcbiAgICBnZW5UYWcgPSAnW29iamVjdCBHZW5lcmF0b3JGdW5jdGlvbl0nLFxuICAgIHByb3h5VGFnID0gJ1tvYmplY3QgUHJveHldJztcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGEgYEZ1bmN0aW9uYCBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBmdW5jdGlvbiwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzRnVuY3Rpb24oXyk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0Z1bmN0aW9uKC9hYmMvKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRnVuY3Rpb24odmFsdWUpIHtcbiAgaWYgKCFpc09iamVjdCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgLy8gVGhlIHVzZSBvZiBgT2JqZWN0I3RvU3RyaW5nYCBhdm9pZHMgaXNzdWVzIHdpdGggdGhlIGB0eXBlb2ZgIG9wZXJhdG9yXG4gIC8vIGluIFNhZmFyaSA5IHdoaWNoIHJldHVybnMgJ29iamVjdCcgZm9yIHR5cGVkIGFycmF5cyBhbmQgb3RoZXIgY29uc3RydWN0b3JzLlxuICB2YXIgdGFnID0gYmFzZUdldFRhZyh2YWx1ZSk7XG4gIHJldHVybiB0YWcgPT0gZnVuY1RhZyB8fCB0YWcgPT0gZ2VuVGFnIHx8IHRhZyA9PSBhc3luY1RhZyB8fCB0YWcgPT0gcHJveHlUYWc7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNGdW5jdGlvbjtcbiIsInZhciByb290ID0gcmVxdWlyZSgnLi9fcm9vdCcpO1xuXG4vKiogVXNlZCB0byBkZXRlY3Qgb3ZlcnJlYWNoaW5nIGNvcmUtanMgc2hpbXMuICovXG52YXIgY29yZUpzRGF0YSA9IHJvb3RbJ19fY29yZS1qc19zaGFyZWRfXyddO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvcmVKc0RhdGE7XG4iLCJ2YXIgY29yZUpzRGF0YSA9IHJlcXVpcmUoJy4vX2NvcmVKc0RhdGEnKTtcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IG1ldGhvZHMgbWFzcXVlcmFkaW5nIGFzIG5hdGl2ZS4gKi9cbnZhciBtYXNrU3JjS2V5ID0gKGZ1bmN0aW9uKCkge1xuICB2YXIgdWlkID0gL1teLl0rJC8uZXhlYyhjb3JlSnNEYXRhICYmIGNvcmVKc0RhdGEua2V5cyAmJiBjb3JlSnNEYXRhLmtleXMuSUVfUFJPVE8gfHwgJycpO1xuICByZXR1cm4gdWlkID8gKCdTeW1ib2woc3JjKV8xLicgKyB1aWQpIDogJyc7XG59KCkpO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgZnVuY2AgaGFzIGl0cyBzb3VyY2UgbWFza2VkLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgZnVuY2AgaXMgbWFza2VkLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzTWFza2VkKGZ1bmMpIHtcbiAgcmV0dXJuICEhbWFza1NyY0tleSAmJiAobWFza1NyY0tleSBpbiBmdW5jKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc01hc2tlZDtcbiIsIi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBmdW5jUHJvdG8gPSBGdW5jdGlvbi5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIHJlc29sdmUgdGhlIGRlY29tcGlsZWQgc291cmNlIG9mIGZ1bmN0aW9ucy4gKi9cbnZhciBmdW5jVG9TdHJpbmcgPSBmdW5jUHJvdG8udG9TdHJpbmc7XG5cbi8qKlxuICogQ29udmVydHMgYGZ1bmNgIHRvIGl0cyBzb3VyY2UgY29kZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gY29udmVydC5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIHNvdXJjZSBjb2RlLlxuICovXG5mdW5jdGlvbiB0b1NvdXJjZShmdW5jKSB7XG4gIGlmIChmdW5jICE9IG51bGwpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGZ1bmNUb1N0cmluZy5jYWxsKGZ1bmMpO1xuICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiAoZnVuYyArICcnKTtcbiAgICB9IGNhdGNoIChlKSB7fVxuICB9XG4gIHJldHVybiAnJztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB0b1NvdXJjZTtcbiIsInZhciBpc0Z1bmN0aW9uID0gcmVxdWlyZSgnLi9pc0Z1bmN0aW9uJyksXG4gICAgaXNNYXNrZWQgPSByZXF1aXJlKCcuL19pc01hc2tlZCcpLFxuICAgIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9pc09iamVjdCcpLFxuICAgIHRvU291cmNlID0gcmVxdWlyZSgnLi9fdG9Tb3VyY2UnKTtcblxuLyoqXG4gKiBVc2VkIHRvIG1hdGNoIGBSZWdFeHBgXG4gKiBbc3ludGF4IGNoYXJhY3RlcnNdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLXBhdHRlcm5zKS5cbiAqL1xudmFyIHJlUmVnRXhwQ2hhciA9IC9bXFxcXF4kLiorPygpW1xcXXt9fF0vZztcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IGhvc3QgY29uc3RydWN0b3JzIChTYWZhcmkpLiAqL1xudmFyIHJlSXNIb3N0Q3RvciA9IC9eXFxbb2JqZWN0IC4rP0NvbnN0cnVjdG9yXFxdJC87XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBmdW5jUHJvdG8gPSBGdW5jdGlvbi5wcm90b3R5cGUsXG4gICAgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byByZXNvbHZlIHRoZSBkZWNvbXBpbGVkIHNvdXJjZSBvZiBmdW5jdGlvbnMuICovXG52YXIgZnVuY1RvU3RyaW5nID0gZnVuY1Byb3RvLnRvU3RyaW5nO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKiogVXNlZCB0byBkZXRlY3QgaWYgYSBtZXRob2QgaXMgbmF0aXZlLiAqL1xudmFyIHJlSXNOYXRpdmUgPSBSZWdFeHAoJ14nICtcbiAgZnVuY1RvU3RyaW5nLmNhbGwoaGFzT3duUHJvcGVydHkpLnJlcGxhY2UocmVSZWdFeHBDaGFyLCAnXFxcXCQmJylcbiAgLnJlcGxhY2UoL2hhc093blByb3BlcnR5fChmdW5jdGlvbikuKj8oPz1cXFxcXFwoKXwgZm9yIC4rPyg/PVxcXFxcXF0pL2csICckMS4qPycpICsgJyQnXG4pO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmlzTmF0aXZlYCB3aXRob3V0IGJhZCBzaGltIGNoZWNrcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIG5hdGl2ZSBmdW5jdGlvbixcbiAqICBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGJhc2VJc05hdGl2ZSh2YWx1ZSkge1xuICBpZiAoIWlzT2JqZWN0KHZhbHVlKSB8fCBpc01hc2tlZCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmFyIHBhdHRlcm4gPSBpc0Z1bmN0aW9uKHZhbHVlKSA/IHJlSXNOYXRpdmUgOiByZUlzSG9zdEN0b3I7XG4gIHJldHVybiBwYXR0ZXJuLnRlc3QodG9Tb3VyY2UodmFsdWUpKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlSXNOYXRpdmU7XG4iLCIvKipcbiAqIEdldHMgdGhlIHZhbHVlIGF0IGBrZXlgIG9mIGBvYmplY3RgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gW29iamVjdF0gVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgcHJvcGVydHkgdG8gZ2V0LlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIHByb3BlcnR5IHZhbHVlLlxuICovXG5mdW5jdGlvbiBnZXRWYWx1ZShvYmplY3QsIGtleSkge1xuICByZXR1cm4gb2JqZWN0ID09IG51bGwgPyB1bmRlZmluZWQgOiBvYmplY3Rba2V5XTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXRWYWx1ZTtcbiIsInZhciBiYXNlSXNOYXRpdmUgPSByZXF1aXJlKCcuL19iYXNlSXNOYXRpdmUnKSxcbiAgICBnZXRWYWx1ZSA9IHJlcXVpcmUoJy4vX2dldFZhbHVlJyk7XG5cbi8qKlxuICogR2V0cyB0aGUgbmF0aXZlIGZ1bmN0aW9uIGF0IGBrZXlgIG9mIGBvYmplY3RgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIG1ldGhvZCB0byBnZXQuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgZnVuY3Rpb24gaWYgaXQncyBuYXRpdmUsIGVsc2UgYHVuZGVmaW5lZGAuXG4gKi9cbmZ1bmN0aW9uIGdldE5hdGl2ZShvYmplY3QsIGtleSkge1xuICB2YXIgdmFsdWUgPSBnZXRWYWx1ZShvYmplY3QsIGtleSk7XG4gIHJldHVybiBiYXNlSXNOYXRpdmUodmFsdWUpID8gdmFsdWUgOiB1bmRlZmluZWQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0TmF0aXZlO1xuIiwidmFyIGdldE5hdGl2ZSA9IHJlcXVpcmUoJy4vX2dldE5hdGl2ZScpLFxuICAgIHJvb3QgPSByZXF1aXJlKCcuL19yb290Jyk7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIHRoYXQgYXJlIHZlcmlmaWVkIHRvIGJlIG5hdGl2ZS4gKi9cbnZhciBNYXAgPSBnZXROYXRpdmUocm9vdCwgJ01hcCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1hcDtcbiIsInZhciBnZXROYXRpdmUgPSByZXF1aXJlKCcuL19nZXROYXRpdmUnKTtcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgdGhhdCBhcmUgdmVyaWZpZWQgdG8gYmUgbmF0aXZlLiAqL1xudmFyIG5hdGl2ZUNyZWF0ZSA9IGdldE5hdGl2ZShPYmplY3QsICdjcmVhdGUnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBuYXRpdmVDcmVhdGU7XG4iLCJ2YXIgbmF0aXZlQ3JlYXRlID0gcmVxdWlyZSgnLi9fbmF0aXZlQ3JlYXRlJyk7XG5cbi8qKlxuICogUmVtb3ZlcyBhbGwga2V5LXZhbHVlIGVudHJpZXMgZnJvbSB0aGUgaGFzaC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgY2xlYXJcbiAqIEBtZW1iZXJPZiBIYXNoXG4gKi9cbmZ1bmN0aW9uIGhhc2hDbGVhcigpIHtcbiAgdGhpcy5fX2RhdGFfXyA9IG5hdGl2ZUNyZWF0ZSA/IG5hdGl2ZUNyZWF0ZShudWxsKSA6IHt9O1xuICB0aGlzLnNpemUgPSAwO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGhhc2hDbGVhcjtcbiIsIi8qKlxuICogUmVtb3ZlcyBga2V5YCBhbmQgaXRzIHZhbHVlIGZyb20gdGhlIGhhc2guXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGRlbGV0ZVxuICogQG1lbWJlck9mIEhhc2hcbiAqIEBwYXJhbSB7T2JqZWN0fSBoYXNoIFRoZSBoYXNoIHRvIG1vZGlmeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gcmVtb3ZlLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBlbnRyeSB3YXMgcmVtb3ZlZCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBoYXNoRGVsZXRlKGtleSkge1xuICB2YXIgcmVzdWx0ID0gdGhpcy5oYXMoa2V5KSAmJiBkZWxldGUgdGhpcy5fX2RhdGFfX1trZXldO1xuICB0aGlzLnNpemUgLT0gcmVzdWx0ID8gMSA6IDA7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaGFzaERlbGV0ZTtcbiIsInZhciBuYXRpdmVDcmVhdGUgPSByZXF1aXJlKCcuL19uYXRpdmVDcmVhdGUnKTtcblxuLyoqIFVzZWQgdG8gc3RhbmQtaW4gZm9yIGB1bmRlZmluZWRgIGhhc2ggdmFsdWVzLiAqL1xudmFyIEhBU0hfVU5ERUZJTkVEID0gJ19fbG9kYXNoX2hhc2hfdW5kZWZpbmVkX18nO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIEdldHMgdGhlIGhhc2ggdmFsdWUgZm9yIGBrZXlgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBnZXRcbiAqIEBtZW1iZXJPZiBIYXNoXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIGdldC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBlbnRyeSB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gaGFzaEdldChrZXkpIHtcbiAgdmFyIGRhdGEgPSB0aGlzLl9fZGF0YV9fO1xuICBpZiAobmF0aXZlQ3JlYXRlKSB7XG4gICAgdmFyIHJlc3VsdCA9IGRhdGFba2V5XTtcbiAgICByZXR1cm4gcmVzdWx0ID09PSBIQVNIX1VOREVGSU5FRCA/IHVuZGVmaW5lZCA6IHJlc3VsdDtcbiAgfVxuICByZXR1cm4gaGFzT3duUHJvcGVydHkuY2FsbChkYXRhLCBrZXkpID8gZGF0YVtrZXldIDogdW5kZWZpbmVkO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGhhc2hHZXQ7XG4iLCJ2YXIgbmF0aXZlQ3JlYXRlID0gcmVxdWlyZSgnLi9fbmF0aXZlQ3JlYXRlJyk7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGEgaGFzaCB2YWx1ZSBmb3IgYGtleWAgZXhpc3RzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBoYXNcbiAqIEBtZW1iZXJPZiBIYXNoXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIGVudHJ5IHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGFuIGVudHJ5IGZvciBga2V5YCBleGlzdHMsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaGFzaEhhcyhrZXkpIHtcbiAgdmFyIGRhdGEgPSB0aGlzLl9fZGF0YV9fO1xuICByZXR1cm4gbmF0aXZlQ3JlYXRlID8gKGRhdGFba2V5XSAhPT0gdW5kZWZpbmVkKSA6IGhhc093blByb3BlcnR5LmNhbGwoZGF0YSwga2V5KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBoYXNoSGFzO1xuIiwidmFyIG5hdGl2ZUNyZWF0ZSA9IHJlcXVpcmUoJy4vX25hdGl2ZUNyZWF0ZScpO1xuXG4vKiogVXNlZCB0byBzdGFuZC1pbiBmb3IgYHVuZGVmaW5lZGAgaGFzaCB2YWx1ZXMuICovXG52YXIgSEFTSF9VTkRFRklORUQgPSAnX19sb2Rhc2hfaGFzaF91bmRlZmluZWRfXyc7XG5cbi8qKlxuICogU2V0cyB0aGUgaGFzaCBga2V5YCB0byBgdmFsdWVgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBzZXRcbiAqIEBtZW1iZXJPZiBIYXNoXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIHNldC5cbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHNldC5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIGhhc2ggaW5zdGFuY2UuXG4gKi9cbmZ1bmN0aW9uIGhhc2hTZXQoa2V5LCB2YWx1ZSkge1xuICB2YXIgZGF0YSA9IHRoaXMuX19kYXRhX187XG4gIHRoaXMuc2l6ZSArPSB0aGlzLmhhcyhrZXkpID8gMCA6IDE7XG4gIGRhdGFba2V5XSA9IChuYXRpdmVDcmVhdGUgJiYgdmFsdWUgPT09IHVuZGVmaW5lZCkgPyBIQVNIX1VOREVGSU5FRCA6IHZhbHVlO1xuICByZXR1cm4gdGhpcztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBoYXNoU2V0O1xuIiwidmFyIGhhc2hDbGVhciA9IHJlcXVpcmUoJy4vX2hhc2hDbGVhcicpLFxuICAgIGhhc2hEZWxldGUgPSByZXF1aXJlKCcuL19oYXNoRGVsZXRlJyksXG4gICAgaGFzaEdldCA9IHJlcXVpcmUoJy4vX2hhc2hHZXQnKSxcbiAgICBoYXNoSGFzID0gcmVxdWlyZSgnLi9faGFzaEhhcycpLFxuICAgIGhhc2hTZXQgPSByZXF1aXJlKCcuL19oYXNoU2V0Jyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGhhc2ggb2JqZWN0LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7QXJyYXl9IFtlbnRyaWVzXSBUaGUga2V5LXZhbHVlIHBhaXJzIHRvIGNhY2hlLlxuICovXG5mdW5jdGlvbiBIYXNoKGVudHJpZXMpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBlbnRyaWVzID09IG51bGwgPyAwIDogZW50cmllcy5sZW5ndGg7XG5cbiAgdGhpcy5jbGVhcigpO1xuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHZhciBlbnRyeSA9IGVudHJpZXNbaW5kZXhdO1xuICAgIHRoaXMuc2V0KGVudHJ5WzBdLCBlbnRyeVsxXSk7XG4gIH1cbn1cblxuLy8gQWRkIG1ldGhvZHMgdG8gYEhhc2hgLlxuSGFzaC5wcm90b3R5cGUuY2xlYXIgPSBoYXNoQ2xlYXI7XG5IYXNoLnByb3RvdHlwZVsnZGVsZXRlJ10gPSBoYXNoRGVsZXRlO1xuSGFzaC5wcm90b3R5cGUuZ2V0ID0gaGFzaEdldDtcbkhhc2gucHJvdG90eXBlLmhhcyA9IGhhc2hIYXM7XG5IYXNoLnByb3RvdHlwZS5zZXQgPSBoYXNoU2V0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEhhc2g7XG4iLCJ2YXIgSGFzaCA9IHJlcXVpcmUoJy4vX0hhc2gnKSxcbiAgICBMaXN0Q2FjaGUgPSByZXF1aXJlKCcuL19MaXN0Q2FjaGUnKSxcbiAgICBNYXAgPSByZXF1aXJlKCcuL19NYXAnKTtcblxuLyoqXG4gKiBSZW1vdmVzIGFsbCBrZXktdmFsdWUgZW50cmllcyBmcm9tIHRoZSBtYXAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGNsZWFyXG4gKiBAbWVtYmVyT2YgTWFwQ2FjaGVcbiAqL1xuZnVuY3Rpb24gbWFwQ2FjaGVDbGVhcigpIHtcbiAgdGhpcy5zaXplID0gMDtcbiAgdGhpcy5fX2RhdGFfXyA9IHtcbiAgICAnaGFzaCc6IG5ldyBIYXNoLFxuICAgICdtYXAnOiBuZXcgKE1hcCB8fCBMaXN0Q2FjaGUpLFxuICAgICdzdHJpbmcnOiBuZXcgSGFzaFxuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG1hcENhY2hlQ2xlYXI7XG4iLCIvKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIHN1aXRhYmxlIGZvciB1c2UgYXMgdW5pcXVlIG9iamVjdCBrZXkuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgc3VpdGFibGUsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaXNLZXlhYmxlKHZhbHVlKSB7XG4gIHZhciB0eXBlID0gdHlwZW9mIHZhbHVlO1xuICByZXR1cm4gKHR5cGUgPT0gJ3N0cmluZycgfHwgdHlwZSA9PSAnbnVtYmVyJyB8fCB0eXBlID09ICdzeW1ib2wnIHx8IHR5cGUgPT0gJ2Jvb2xlYW4nKVxuICAgID8gKHZhbHVlICE9PSAnX19wcm90b19fJylcbiAgICA6ICh2YWx1ZSA9PT0gbnVsbCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNLZXlhYmxlO1xuIiwidmFyIGlzS2V5YWJsZSA9IHJlcXVpcmUoJy4vX2lzS2V5YWJsZScpO1xuXG4vKipcbiAqIEdldHMgdGhlIGRhdGEgZm9yIGBtYXBgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gbWFwIFRoZSBtYXAgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSByZWZlcmVuY2Uga2V5LlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIG1hcCBkYXRhLlxuICovXG5mdW5jdGlvbiBnZXRNYXBEYXRhKG1hcCwga2V5KSB7XG4gIHZhciBkYXRhID0gbWFwLl9fZGF0YV9fO1xuICByZXR1cm4gaXNLZXlhYmxlKGtleSlcbiAgICA/IGRhdGFbdHlwZW9mIGtleSA9PSAnc3RyaW5nJyA/ICdzdHJpbmcnIDogJ2hhc2gnXVxuICAgIDogZGF0YS5tYXA7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0TWFwRGF0YTtcbiIsInZhciBnZXRNYXBEYXRhID0gcmVxdWlyZSgnLi9fZ2V0TWFwRGF0YScpO1xuXG4vKipcbiAqIFJlbW92ZXMgYGtleWAgYW5kIGl0cyB2YWx1ZSBmcm9tIHRoZSBtYXAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGRlbGV0ZVxuICogQG1lbWJlck9mIE1hcENhY2hlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIHJlbW92ZS5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgZW50cnkgd2FzIHJlbW92ZWQsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gbWFwQ2FjaGVEZWxldGUoa2V5KSB7XG4gIHZhciByZXN1bHQgPSBnZXRNYXBEYXRhKHRoaXMsIGtleSlbJ2RlbGV0ZSddKGtleSk7XG4gIHRoaXMuc2l6ZSAtPSByZXN1bHQgPyAxIDogMDtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBtYXBDYWNoZURlbGV0ZTtcbiIsInZhciBnZXRNYXBEYXRhID0gcmVxdWlyZSgnLi9fZ2V0TWFwRGF0YScpO1xuXG4vKipcbiAqIEdldHMgdGhlIG1hcCB2YWx1ZSBmb3IgYGtleWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGdldFxuICogQG1lbWJlck9mIE1hcENhY2hlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIGdldC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBlbnRyeSB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gbWFwQ2FjaGVHZXQoa2V5KSB7XG4gIHJldHVybiBnZXRNYXBEYXRhKHRoaXMsIGtleSkuZ2V0KGtleSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbWFwQ2FjaGVHZXQ7XG4iLCJ2YXIgZ2V0TWFwRGF0YSA9IHJlcXVpcmUoJy4vX2dldE1hcERhdGEnKTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYSBtYXAgdmFsdWUgZm9yIGBrZXlgIGV4aXN0cy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgaGFzXG4gKiBAbWVtYmVyT2YgTWFwQ2FjaGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgZW50cnkgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYW4gZW50cnkgZm9yIGBrZXlgIGV4aXN0cywgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBtYXBDYWNoZUhhcyhrZXkpIHtcbiAgcmV0dXJuIGdldE1hcERhdGEodGhpcywga2V5KS5oYXMoa2V5KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBtYXBDYWNoZUhhcztcbiIsInZhciBnZXRNYXBEYXRhID0gcmVxdWlyZSgnLi9fZ2V0TWFwRGF0YScpO1xuXG4vKipcbiAqIFNldHMgdGhlIG1hcCBga2V5YCB0byBgdmFsdWVgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBzZXRcbiAqIEBtZW1iZXJPZiBNYXBDYWNoZVxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byBzZXQuXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBzZXQuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBtYXAgY2FjaGUgaW5zdGFuY2UuXG4gKi9cbmZ1bmN0aW9uIG1hcENhY2hlU2V0KGtleSwgdmFsdWUpIHtcbiAgdmFyIGRhdGEgPSBnZXRNYXBEYXRhKHRoaXMsIGtleSksXG4gICAgICBzaXplID0gZGF0YS5zaXplO1xuXG4gIGRhdGEuc2V0KGtleSwgdmFsdWUpO1xuICB0aGlzLnNpemUgKz0gZGF0YS5zaXplID09IHNpemUgPyAwIDogMTtcbiAgcmV0dXJuIHRoaXM7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbWFwQ2FjaGVTZXQ7XG4iLCJ2YXIgbWFwQ2FjaGVDbGVhciA9IHJlcXVpcmUoJy4vX21hcENhY2hlQ2xlYXInKSxcbiAgICBtYXBDYWNoZURlbGV0ZSA9IHJlcXVpcmUoJy4vX21hcENhY2hlRGVsZXRlJyksXG4gICAgbWFwQ2FjaGVHZXQgPSByZXF1aXJlKCcuL19tYXBDYWNoZUdldCcpLFxuICAgIG1hcENhY2hlSGFzID0gcmVxdWlyZSgnLi9fbWFwQ2FjaGVIYXMnKSxcbiAgICBtYXBDYWNoZVNldCA9IHJlcXVpcmUoJy4vX21hcENhY2hlU2V0Jyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG1hcCBjYWNoZSBvYmplY3QgdG8gc3RvcmUga2V5LXZhbHVlIHBhaXJzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7QXJyYXl9IFtlbnRyaWVzXSBUaGUga2V5LXZhbHVlIHBhaXJzIHRvIGNhY2hlLlxuICovXG5mdW5jdGlvbiBNYXBDYWNoZShlbnRyaWVzKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gZW50cmllcyA9PSBudWxsID8gMCA6IGVudHJpZXMubGVuZ3RoO1xuXG4gIHRoaXMuY2xlYXIoKTtcbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICB2YXIgZW50cnkgPSBlbnRyaWVzW2luZGV4XTtcbiAgICB0aGlzLnNldChlbnRyeVswXSwgZW50cnlbMV0pO1xuICB9XG59XG5cbi8vIEFkZCBtZXRob2RzIHRvIGBNYXBDYWNoZWAuXG5NYXBDYWNoZS5wcm90b3R5cGUuY2xlYXIgPSBtYXBDYWNoZUNsZWFyO1xuTWFwQ2FjaGUucHJvdG90eXBlWydkZWxldGUnXSA9IG1hcENhY2hlRGVsZXRlO1xuTWFwQ2FjaGUucHJvdG90eXBlLmdldCA9IG1hcENhY2hlR2V0O1xuTWFwQ2FjaGUucHJvdG90eXBlLmhhcyA9IG1hcENhY2hlSGFzO1xuTWFwQ2FjaGUucHJvdG90eXBlLnNldCA9IG1hcENhY2hlU2V0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1hcENhY2hlO1xuIiwidmFyIExpc3RDYWNoZSA9IHJlcXVpcmUoJy4vX0xpc3RDYWNoZScpLFxuICAgIE1hcCA9IHJlcXVpcmUoJy4vX01hcCcpLFxuICAgIE1hcENhY2hlID0gcmVxdWlyZSgnLi9fTWFwQ2FjaGUnKTtcblxuLyoqIFVzZWQgYXMgdGhlIHNpemUgdG8gZW5hYmxlIGxhcmdlIGFycmF5IG9wdGltaXphdGlvbnMuICovXG52YXIgTEFSR0VfQVJSQVlfU0laRSA9IDIwMDtcblxuLyoqXG4gKiBTZXRzIHRoZSBzdGFjayBga2V5YCB0byBgdmFsdWVgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBzZXRcbiAqIEBtZW1iZXJPZiBTdGFja1xuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byBzZXQuXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBzZXQuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBzdGFjayBjYWNoZSBpbnN0YW5jZS5cbiAqL1xuZnVuY3Rpb24gc3RhY2tTZXQoa2V5LCB2YWx1ZSkge1xuICB2YXIgZGF0YSA9IHRoaXMuX19kYXRhX187XG4gIGlmIChkYXRhIGluc3RhbmNlb2YgTGlzdENhY2hlKSB7XG4gICAgdmFyIHBhaXJzID0gZGF0YS5fX2RhdGFfXztcbiAgICBpZiAoIU1hcCB8fCAocGFpcnMubGVuZ3RoIDwgTEFSR0VfQVJSQVlfU0laRSAtIDEpKSB7XG4gICAgICBwYWlycy5wdXNoKFtrZXksIHZhbHVlXSk7XG4gICAgICB0aGlzLnNpemUgPSArK2RhdGEuc2l6ZTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBkYXRhID0gdGhpcy5fX2RhdGFfXyA9IG5ldyBNYXBDYWNoZShwYWlycyk7XG4gIH1cbiAgZGF0YS5zZXQoa2V5LCB2YWx1ZSk7XG4gIHRoaXMuc2l6ZSA9IGRhdGEuc2l6ZTtcbiAgcmV0dXJuIHRoaXM7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc3RhY2tTZXQ7XG4iLCJ2YXIgTGlzdENhY2hlID0gcmVxdWlyZSgnLi9fTGlzdENhY2hlJyksXG4gICAgc3RhY2tDbGVhciA9IHJlcXVpcmUoJy4vX3N0YWNrQ2xlYXInKSxcbiAgICBzdGFja0RlbGV0ZSA9IHJlcXVpcmUoJy4vX3N0YWNrRGVsZXRlJyksXG4gICAgc3RhY2tHZXQgPSByZXF1aXJlKCcuL19zdGFja0dldCcpLFxuICAgIHN0YWNrSGFzID0gcmVxdWlyZSgnLi9fc3RhY2tIYXMnKSxcbiAgICBzdGFja1NldCA9IHJlcXVpcmUoJy4vX3N0YWNrU2V0Jyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIHN0YWNrIGNhY2hlIG9iamVjdCB0byBzdG9yZSBrZXktdmFsdWUgcGFpcnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtBcnJheX0gW2VudHJpZXNdIFRoZSBrZXktdmFsdWUgcGFpcnMgdG8gY2FjaGUuXG4gKi9cbmZ1bmN0aW9uIFN0YWNrKGVudHJpZXMpIHtcbiAgdmFyIGRhdGEgPSB0aGlzLl9fZGF0YV9fID0gbmV3IExpc3RDYWNoZShlbnRyaWVzKTtcbiAgdGhpcy5zaXplID0gZGF0YS5zaXplO1xufVxuXG4vLyBBZGQgbWV0aG9kcyB0byBgU3RhY2tgLlxuU3RhY2sucHJvdG90eXBlLmNsZWFyID0gc3RhY2tDbGVhcjtcblN0YWNrLnByb3RvdHlwZVsnZGVsZXRlJ10gPSBzdGFja0RlbGV0ZTtcblN0YWNrLnByb3RvdHlwZS5nZXQgPSBzdGFja0dldDtcblN0YWNrLnByb3RvdHlwZS5oYXMgPSBzdGFja0hhcztcblN0YWNrLnByb3RvdHlwZS5zZXQgPSBzdGFja1NldDtcblxubW9kdWxlLmV4cG9ydHMgPSBTdGFjaztcbiIsIi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBfLmZvckVhY2hgIGZvciBhcnJheXMgd2l0aG91dCBzdXBwb3J0IGZvclxuICogaXRlcmF0ZWUgc2hvcnRoYW5kcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gW2FycmF5XSBUaGUgYXJyYXkgdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBgYXJyYXlgLlxuICovXG5mdW5jdGlvbiBhcnJheUVhY2goYXJyYXksIGl0ZXJhdGVlKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gYXJyYXkgPT0gbnVsbCA/IDAgOiBhcnJheS5sZW5ndGg7XG5cbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICBpZiAoaXRlcmF0ZWUoYXJyYXlbaW5kZXhdLCBpbmRleCwgYXJyYXkpID09PSBmYWxzZSkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHJldHVybiBhcnJheTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBhcnJheUVhY2g7XG4iLCJ2YXIgZ2V0TmF0aXZlID0gcmVxdWlyZSgnLi9fZ2V0TmF0aXZlJyk7XG5cbnZhciBkZWZpbmVQcm9wZXJ0eSA9IChmdW5jdGlvbigpIHtcbiAgdHJ5IHtcbiAgICB2YXIgZnVuYyA9IGdldE5hdGl2ZShPYmplY3QsICdkZWZpbmVQcm9wZXJ0eScpO1xuICAgIGZ1bmMoe30sICcnLCB7fSk7XG4gICAgcmV0dXJuIGZ1bmM7XG4gIH0gY2F0Y2ggKGUpIHt9XG59KCkpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlZmluZVByb3BlcnR5O1xuIiwidmFyIGRlZmluZVByb3BlcnR5ID0gcmVxdWlyZSgnLi9fZGVmaW5lUHJvcGVydHknKTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgYXNzaWduVmFsdWVgIGFuZCBgYXNzaWduTWVyZ2VWYWx1ZWAgd2l0aG91dFxuICogdmFsdWUgY2hlY2tzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gbW9kaWZ5LlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBwcm9wZXJ0eSB0byBhc3NpZ24uXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBhc3NpZ24uXG4gKi9cbmZ1bmN0aW9uIGJhc2VBc3NpZ25WYWx1ZShvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgaWYgKGtleSA9PSAnX19wcm90b19fJyAmJiBkZWZpbmVQcm9wZXJ0eSkge1xuICAgIGRlZmluZVByb3BlcnR5KG9iamVjdCwga2V5LCB7XG4gICAgICAnY29uZmlndXJhYmxlJzogdHJ1ZSxcbiAgICAgICdlbnVtZXJhYmxlJzogdHJ1ZSxcbiAgICAgICd2YWx1ZSc6IHZhbHVlLFxuICAgICAgJ3dyaXRhYmxlJzogdHJ1ZVxuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIG9iamVjdFtrZXldID0gdmFsdWU7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlQXNzaWduVmFsdWU7XG4iLCJ2YXIgYmFzZUFzc2lnblZhbHVlID0gcmVxdWlyZSgnLi9fYmFzZUFzc2lnblZhbHVlJyksXG4gICAgZXEgPSByZXF1aXJlKCcuL2VxJyk7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogQXNzaWducyBgdmFsdWVgIHRvIGBrZXlgIG9mIGBvYmplY3RgIGlmIHRoZSBleGlzdGluZyB2YWx1ZSBpcyBub3QgZXF1aXZhbGVudFxuICogdXNpbmcgW2BTYW1lVmFsdWVaZXJvYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtc2FtZXZhbHVlemVybylcbiAqIGZvciBlcXVhbGl0eSBjb21wYXJpc29ucy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIG1vZGlmeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgcHJvcGVydHkgdG8gYXNzaWduLlxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gYXNzaWduLlxuICovXG5mdW5jdGlvbiBhc3NpZ25WYWx1ZShvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgdmFyIG9ialZhbHVlID0gb2JqZWN0W2tleV07XG4gIGlmICghKGhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBrZXkpICYmIGVxKG9ialZhbHVlLCB2YWx1ZSkpIHx8XG4gICAgICAodmFsdWUgPT09IHVuZGVmaW5lZCAmJiAhKGtleSBpbiBvYmplY3QpKSkge1xuICAgIGJhc2VBc3NpZ25WYWx1ZShvYmplY3QsIGtleSwgdmFsdWUpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYXNzaWduVmFsdWU7XG4iLCJ2YXIgYXNzaWduVmFsdWUgPSByZXF1aXJlKCcuL19hc3NpZ25WYWx1ZScpLFxuICAgIGJhc2VBc3NpZ25WYWx1ZSA9IHJlcXVpcmUoJy4vX2Jhc2VBc3NpZ25WYWx1ZScpO1xuXG4vKipcbiAqIENvcGllcyBwcm9wZXJ0aWVzIG9mIGBzb3VyY2VgIHRvIGBvYmplY3RgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gc291cmNlIFRoZSBvYmplY3QgdG8gY29weSBwcm9wZXJ0aWVzIGZyb20uXG4gKiBAcGFyYW0ge0FycmF5fSBwcm9wcyBUaGUgcHJvcGVydHkgaWRlbnRpZmllcnMgdG8gY29weS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb2JqZWN0PXt9XSBUaGUgb2JqZWN0IHRvIGNvcHkgcHJvcGVydGllcyB0by5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtjdXN0b21pemVyXSBUaGUgZnVuY3Rpb24gdG8gY3VzdG9taXplIGNvcGllZCB2YWx1ZXMuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGBvYmplY3RgLlxuICovXG5mdW5jdGlvbiBjb3B5T2JqZWN0KHNvdXJjZSwgcHJvcHMsIG9iamVjdCwgY3VzdG9taXplcikge1xuICB2YXIgaXNOZXcgPSAhb2JqZWN0O1xuICBvYmplY3QgfHwgKG9iamVjdCA9IHt9KTtcblxuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IHByb3BzLmxlbmd0aDtcblxuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHZhciBrZXkgPSBwcm9wc1tpbmRleF07XG5cbiAgICB2YXIgbmV3VmFsdWUgPSBjdXN0b21pemVyXG4gICAgICA/IGN1c3RvbWl6ZXIob2JqZWN0W2tleV0sIHNvdXJjZVtrZXldLCBrZXksIG9iamVjdCwgc291cmNlKVxuICAgICAgOiB1bmRlZmluZWQ7XG5cbiAgICBpZiAobmV3VmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgbmV3VmFsdWUgPSBzb3VyY2Vba2V5XTtcbiAgICB9XG4gICAgaWYgKGlzTmV3KSB7XG4gICAgICBiYXNlQXNzaWduVmFsdWUob2JqZWN0LCBrZXksIG5ld1ZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXNzaWduVmFsdWUob2JqZWN0LCBrZXksIG5ld1ZhbHVlKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG9iamVjdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjb3B5T2JqZWN0O1xuIiwiLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy50aW1lc2Agd2l0aG91dCBzdXBwb3J0IGZvciBpdGVyYXRlZSBzaG9ydGhhbmRzXG4gKiBvciBtYXggYXJyYXkgbGVuZ3RoIGNoZWNrcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtudW1iZXJ9IG4gVGhlIG51bWJlciBvZiB0aW1lcyB0byBpbnZva2UgYGl0ZXJhdGVlYC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdGVlIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHJlc3VsdHMuXG4gKi9cbmZ1bmN0aW9uIGJhc2VUaW1lcyhuLCBpdGVyYXRlZSkge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIHJlc3VsdCA9IEFycmF5KG4pO1xuXG4gIHdoaWxlICgrK2luZGV4IDwgbikge1xuICAgIHJlc3VsdFtpbmRleF0gPSBpdGVyYXRlZShpbmRleCk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlVGltZXM7XG4iLCIvKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIG9iamVjdC1saWtlLiBBIHZhbHVlIGlzIG9iamVjdC1saWtlIGlmIGl0J3Mgbm90IGBudWxsYFxuICogYW5kIGhhcyBhIGB0eXBlb2ZgIHJlc3VsdCBvZiBcIm9iamVjdFwiLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIG9iamVjdC1saWtlLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKHt9KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKF8ubm9vcCk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKG51bGwpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3RMaWtlKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSAhPSBudWxsICYmIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0Jztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc09iamVjdExpa2U7XG4iLCJ2YXIgYmFzZUdldFRhZyA9IHJlcXVpcmUoJy4vX2Jhc2VHZXRUYWcnKSxcbiAgICBpc09iamVjdExpa2UgPSByZXF1aXJlKCcuL2lzT2JqZWN0TGlrZScpO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgYXJnc1RhZyA9ICdbb2JqZWN0IEFyZ3VtZW50c10nO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmlzQXJndW1lbnRzYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBgYXJndW1lbnRzYCBvYmplY3QsXG4gKi9cbmZ1bmN0aW9uIGJhc2VJc0FyZ3VtZW50cyh2YWx1ZSkge1xuICByZXR1cm4gaXNPYmplY3RMaWtlKHZhbHVlKSAmJiBiYXNlR2V0VGFnKHZhbHVlKSA9PSBhcmdzVGFnO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VJc0FyZ3VtZW50cztcbiIsInZhciBiYXNlSXNBcmd1bWVudHMgPSByZXF1aXJlKCcuL19iYXNlSXNBcmd1bWVudHMnKSxcbiAgICBpc09iamVjdExpa2UgPSByZXF1aXJlKCcuL2lzT2JqZWN0TGlrZScpO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBwcm9wZXJ0eUlzRW51bWVyYWJsZSA9IG9iamVjdFByb3RvLnByb3BlcnR5SXNFbnVtZXJhYmxlO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGxpa2VseSBhbiBgYXJndW1lbnRzYCBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gYGFyZ3VtZW50c2Agb2JqZWN0LFxuICogIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0FyZ3VtZW50cyhmdW5jdGlvbigpIHsgcmV0dXJuIGFyZ3VtZW50czsgfSgpKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJndW1lbnRzKFsxLCAyLCAzXSk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG52YXIgaXNBcmd1bWVudHMgPSBiYXNlSXNBcmd1bWVudHMoZnVuY3Rpb24oKSB7IHJldHVybiBhcmd1bWVudHM7IH0oKSkgPyBiYXNlSXNBcmd1bWVudHMgOiBmdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gaXNPYmplY3RMaWtlKHZhbHVlKSAmJiBoYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbHVlLCAnY2FsbGVlJykgJiZcbiAgICAhcHJvcGVydHlJc0VudW1lcmFibGUuY2FsbCh2YWx1ZSwgJ2NhbGxlZScpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBpc0FyZ3VtZW50cztcbiIsIi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhbiBgQXJyYXlgIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBhcnJheSwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzQXJyYXkoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJyYXkoZG9jdW1lbnQuYm9keS5jaGlsZHJlbik7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNBcnJheSgnYWJjJyk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNBcnJheShfLm5vb3ApO1xuICogLy8gPT4gZmFsc2VcbiAqL1xudmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGlzQXJyYXk7XG4iLCIvKipcbiAqIFRoaXMgbWV0aG9kIHJldHVybnMgYGZhbHNlYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMTMuMFxuICogQGNhdGVnb3J5IFV0aWxcbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8udGltZXMoMiwgXy5zdHViRmFsc2UpO1xuICogLy8gPT4gW2ZhbHNlLCBmYWxzZV1cbiAqL1xuZnVuY3Rpb24gc3R1YkZhbHNlKCkge1xuICByZXR1cm4gZmFsc2U7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc3R1YkZhbHNlO1xuIiwidmFyIHJvb3QgPSByZXF1aXJlKCcuL19yb290JyksXG4gICAgc3R1YkZhbHNlID0gcmVxdWlyZSgnLi9zdHViRmFsc2UnKTtcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBleHBvcnRzYC4gKi9cbnZhciBmcmVlRXhwb3J0cyA9IHR5cGVvZiBleHBvcnRzID09ICdvYmplY3QnICYmIGV4cG9ydHMgJiYgIWV4cG9ydHMubm9kZVR5cGUgJiYgZXhwb3J0cztcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBtb2R1bGVgLiAqL1xudmFyIGZyZWVNb2R1bGUgPSBmcmVlRXhwb3J0cyAmJiB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZSAmJiAhbW9kdWxlLm5vZGVUeXBlICYmIG1vZHVsZTtcblxuLyoqIERldGVjdCB0aGUgcG9wdWxhciBDb21tb25KUyBleHRlbnNpb24gYG1vZHVsZS5leHBvcnRzYC4gKi9cbnZhciBtb2R1bGVFeHBvcnRzID0gZnJlZU1vZHVsZSAmJiBmcmVlTW9kdWxlLmV4cG9ydHMgPT09IGZyZWVFeHBvcnRzO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBCdWZmZXIgPSBtb2R1bGVFeHBvcnRzID8gcm9vdC5CdWZmZXIgOiB1bmRlZmluZWQ7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIGZvciB0aG9zZSB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcy4gKi9cbnZhciBuYXRpdmVJc0J1ZmZlciA9IEJ1ZmZlciA/IEJ1ZmZlci5pc0J1ZmZlciA6IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIGJ1ZmZlci5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMy4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIGJ1ZmZlciwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzQnVmZmVyKG5ldyBCdWZmZXIoMikpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNCdWZmZXIobmV3IFVpbnQ4QXJyYXkoMikpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xudmFyIGlzQnVmZmVyID0gbmF0aXZlSXNCdWZmZXIgfHwgc3R1YkZhbHNlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGlzQnVmZmVyO1xuIiwiLyoqIFVzZWQgYXMgcmVmZXJlbmNlcyBmb3IgdmFyaW91cyBgTnVtYmVyYCBjb25zdGFudHMuICovXG52YXIgTUFYX1NBRkVfSU5URUdFUiA9IDkwMDcxOTkyNTQ3NDA5OTE7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCB1bnNpZ25lZCBpbnRlZ2VyIHZhbHVlcy4gKi9cbnZhciByZUlzVWludCA9IC9eKD86MHxbMS05XVxcZCopJC87XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSB2YWxpZCBhcnJheS1saWtlIGluZGV4LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbbGVuZ3RoPU1BWF9TQUZFX0lOVEVHRVJdIFRoZSB1cHBlciBib3VuZHMgb2YgYSB2YWxpZCBpbmRleC5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgdmFsaWQgaW5kZXgsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaXNJbmRleCh2YWx1ZSwgbGVuZ3RoKSB7XG4gIGxlbmd0aCA9IGxlbmd0aCA9PSBudWxsID8gTUFYX1NBRkVfSU5URUdFUiA6IGxlbmd0aDtcbiAgcmV0dXJuICEhbGVuZ3RoICYmXG4gICAgKHR5cGVvZiB2YWx1ZSA9PSAnbnVtYmVyJyB8fCByZUlzVWludC50ZXN0KHZhbHVlKSkgJiZcbiAgICAodmFsdWUgPiAtMSAmJiB2YWx1ZSAlIDEgPT0gMCAmJiB2YWx1ZSA8IGxlbmd0aCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNJbmRleDtcbiIsIi8qKiBVc2VkIGFzIHJlZmVyZW5jZXMgZm9yIHZhcmlvdXMgYE51bWJlcmAgY29uc3RhbnRzLiAqL1xudmFyIE1BWF9TQUZFX0lOVEVHRVIgPSA5MDA3MTk5MjU0NzQwOTkxO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgdmFsaWQgYXJyYXktbGlrZSBsZW5ndGguXG4gKlxuICogKipOb3RlOioqIFRoaXMgbWV0aG9kIGlzIGxvb3NlbHkgYmFzZWQgb25cbiAqIFtgVG9MZW5ndGhgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy10b2xlbmd0aCkuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSB2YWxpZCBsZW5ndGgsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0xlbmd0aCgzKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzTGVuZ3RoKE51bWJlci5NSU5fVkFMVUUpO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzTGVuZ3RoKEluZmluaXR5KTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc0xlbmd0aCgnMycpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNMZW5ndGgodmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAnbnVtYmVyJyAmJlxuICAgIHZhbHVlID4gLTEgJiYgdmFsdWUgJSAxID09IDAgJiYgdmFsdWUgPD0gTUFYX1NBRkVfSU5URUdFUjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc0xlbmd0aDtcbiIsInZhciBiYXNlR2V0VGFnID0gcmVxdWlyZSgnLi9fYmFzZUdldFRhZycpLFxuICAgIGlzTGVuZ3RoID0gcmVxdWlyZSgnLi9pc0xlbmd0aCcpLFxuICAgIGlzT2JqZWN0TGlrZSA9IHJlcXVpcmUoJy4vaXNPYmplY3RMaWtlJyk7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBhcmdzVGFnID0gJ1tvYmplY3QgQXJndW1lbnRzXScsXG4gICAgYXJyYXlUYWcgPSAnW29iamVjdCBBcnJheV0nLFxuICAgIGJvb2xUYWcgPSAnW29iamVjdCBCb29sZWFuXScsXG4gICAgZGF0ZVRhZyA9ICdbb2JqZWN0IERhdGVdJyxcbiAgICBlcnJvclRhZyA9ICdbb2JqZWN0IEVycm9yXScsXG4gICAgZnVuY1RhZyA9ICdbb2JqZWN0IEZ1bmN0aW9uXScsXG4gICAgbWFwVGFnID0gJ1tvYmplY3QgTWFwXScsXG4gICAgbnVtYmVyVGFnID0gJ1tvYmplY3QgTnVtYmVyXScsXG4gICAgb2JqZWN0VGFnID0gJ1tvYmplY3QgT2JqZWN0XScsXG4gICAgcmVnZXhwVGFnID0gJ1tvYmplY3QgUmVnRXhwXScsXG4gICAgc2V0VGFnID0gJ1tvYmplY3QgU2V0XScsXG4gICAgc3RyaW5nVGFnID0gJ1tvYmplY3QgU3RyaW5nXScsXG4gICAgd2Vha01hcFRhZyA9ICdbb2JqZWN0IFdlYWtNYXBdJztcblxudmFyIGFycmF5QnVmZmVyVGFnID0gJ1tvYmplY3QgQXJyYXlCdWZmZXJdJyxcbiAgICBkYXRhVmlld1RhZyA9ICdbb2JqZWN0IERhdGFWaWV3XScsXG4gICAgZmxvYXQzMlRhZyA9ICdbb2JqZWN0IEZsb2F0MzJBcnJheV0nLFxuICAgIGZsb2F0NjRUYWcgPSAnW29iamVjdCBGbG9hdDY0QXJyYXldJyxcbiAgICBpbnQ4VGFnID0gJ1tvYmplY3QgSW50OEFycmF5XScsXG4gICAgaW50MTZUYWcgPSAnW29iamVjdCBJbnQxNkFycmF5XScsXG4gICAgaW50MzJUYWcgPSAnW29iamVjdCBJbnQzMkFycmF5XScsXG4gICAgdWludDhUYWcgPSAnW29iamVjdCBVaW50OEFycmF5XScsXG4gICAgdWludDhDbGFtcGVkVGFnID0gJ1tvYmplY3QgVWludDhDbGFtcGVkQXJyYXldJyxcbiAgICB1aW50MTZUYWcgPSAnW29iamVjdCBVaW50MTZBcnJheV0nLFxuICAgIHVpbnQzMlRhZyA9ICdbb2JqZWN0IFVpbnQzMkFycmF5XSc7XG5cbi8qKiBVc2VkIHRvIGlkZW50aWZ5IGB0b1N0cmluZ1RhZ2AgdmFsdWVzIG9mIHR5cGVkIGFycmF5cy4gKi9cbnZhciB0eXBlZEFycmF5VGFncyA9IHt9O1xudHlwZWRBcnJheVRhZ3NbZmxvYXQzMlRhZ10gPSB0eXBlZEFycmF5VGFnc1tmbG9hdDY0VGFnXSA9XG50eXBlZEFycmF5VGFnc1tpbnQ4VGFnXSA9IHR5cGVkQXJyYXlUYWdzW2ludDE2VGFnXSA9XG50eXBlZEFycmF5VGFnc1tpbnQzMlRhZ10gPSB0eXBlZEFycmF5VGFnc1t1aW50OFRhZ10gPVxudHlwZWRBcnJheVRhZ3NbdWludDhDbGFtcGVkVGFnXSA9IHR5cGVkQXJyYXlUYWdzW3VpbnQxNlRhZ10gPVxudHlwZWRBcnJheVRhZ3NbdWludDMyVGFnXSA9IHRydWU7XG50eXBlZEFycmF5VGFnc1thcmdzVGFnXSA9IHR5cGVkQXJyYXlUYWdzW2FycmF5VGFnXSA9XG50eXBlZEFycmF5VGFnc1thcnJheUJ1ZmZlclRhZ10gPSB0eXBlZEFycmF5VGFnc1tib29sVGFnXSA9XG50eXBlZEFycmF5VGFnc1tkYXRhVmlld1RhZ10gPSB0eXBlZEFycmF5VGFnc1tkYXRlVGFnXSA9XG50eXBlZEFycmF5VGFnc1tlcnJvclRhZ10gPSB0eXBlZEFycmF5VGFnc1tmdW5jVGFnXSA9XG50eXBlZEFycmF5VGFnc1ttYXBUYWddID0gdHlwZWRBcnJheVRhZ3NbbnVtYmVyVGFnXSA9XG50eXBlZEFycmF5VGFnc1tvYmplY3RUYWddID0gdHlwZWRBcnJheVRhZ3NbcmVnZXhwVGFnXSA9XG50eXBlZEFycmF5VGFnc1tzZXRUYWddID0gdHlwZWRBcnJheVRhZ3Nbc3RyaW5nVGFnXSA9XG50eXBlZEFycmF5VGFnc1t3ZWFrTWFwVGFnXSA9IGZhbHNlO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmlzVHlwZWRBcnJheWAgd2l0aG91dCBOb2RlLmpzIG9wdGltaXphdGlvbnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSB0eXBlZCBhcnJheSwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBiYXNlSXNUeXBlZEFycmF5KHZhbHVlKSB7XG4gIHJldHVybiBpc09iamVjdExpa2UodmFsdWUpICYmXG4gICAgaXNMZW5ndGgodmFsdWUubGVuZ3RoKSAmJiAhIXR5cGVkQXJyYXlUYWdzW2Jhc2VHZXRUYWcodmFsdWUpXTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlSXNUeXBlZEFycmF5O1xuIiwiLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy51bmFyeWAgd2l0aG91dCBzdXBwb3J0IGZvciBzdG9yaW5nIG1ldGFkYXRhLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBjYXAgYXJndW1lbnRzIGZvci5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGNhcHBlZCBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gYmFzZVVuYXJ5KGZ1bmMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIGZ1bmModmFsdWUpO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VVbmFyeTtcbiIsInZhciBmcmVlR2xvYmFsID0gcmVxdWlyZSgnLi9fZnJlZUdsb2JhbCcpO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYGV4cG9ydHNgLiAqL1xudmFyIGZyZWVFeHBvcnRzID0gdHlwZW9mIGV4cG9ydHMgPT0gJ29iamVjdCcgJiYgZXhwb3J0cyAmJiAhZXhwb3J0cy5ub2RlVHlwZSAmJiBleHBvcnRzO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYG1vZHVsZWAuICovXG52YXIgZnJlZU1vZHVsZSA9IGZyZWVFeHBvcnRzICYmIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlICYmICFtb2R1bGUubm9kZVR5cGUgJiYgbW9kdWxlO1xuXG4vKiogRGV0ZWN0IHRoZSBwb3B1bGFyIENvbW1vbkpTIGV4dGVuc2lvbiBgbW9kdWxlLmV4cG9ydHNgLiAqL1xudmFyIG1vZHVsZUV4cG9ydHMgPSBmcmVlTW9kdWxlICYmIGZyZWVNb2R1bGUuZXhwb3J0cyA9PT0gZnJlZUV4cG9ydHM7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgcHJvY2Vzc2AgZnJvbSBOb2RlLmpzLiAqL1xudmFyIGZyZWVQcm9jZXNzID0gbW9kdWxlRXhwb3J0cyAmJiBmcmVlR2xvYmFsLnByb2Nlc3M7XG5cbi8qKiBVc2VkIHRvIGFjY2VzcyBmYXN0ZXIgTm9kZS5qcyBoZWxwZXJzLiAqL1xudmFyIG5vZGVVdGlsID0gKGZ1bmN0aW9uKCkge1xuICB0cnkge1xuICAgIHJldHVybiBmcmVlUHJvY2VzcyAmJiBmcmVlUHJvY2Vzcy5iaW5kaW5nICYmIGZyZWVQcm9jZXNzLmJpbmRpbmcoJ3V0aWwnKTtcbiAgfSBjYXRjaCAoZSkge31cbn0oKSk7XG5cbm1vZHVsZS5leHBvcnRzID0gbm9kZVV0aWw7XG4iLCJ2YXIgYmFzZUlzVHlwZWRBcnJheSA9IHJlcXVpcmUoJy4vX2Jhc2VJc1R5cGVkQXJyYXknKSxcbiAgICBiYXNlVW5hcnkgPSByZXF1aXJlKCcuL19iYXNlVW5hcnknKSxcbiAgICBub2RlVXRpbCA9IHJlcXVpcmUoJy4vX25vZGVVdGlsJyk7XG5cbi8qIE5vZGUuanMgaGVscGVyIHJlZmVyZW5jZXMuICovXG52YXIgbm9kZUlzVHlwZWRBcnJheSA9IG5vZGVVdGlsICYmIG5vZGVVdGlsLmlzVHlwZWRBcnJheTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGEgdHlwZWQgYXJyYXkuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAzLjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSB0eXBlZCBhcnJheSwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzVHlwZWRBcnJheShuZXcgVWludDhBcnJheSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc1R5cGVkQXJyYXkoW10pO1xuICogLy8gPT4gZmFsc2VcbiAqL1xudmFyIGlzVHlwZWRBcnJheSA9IG5vZGVJc1R5cGVkQXJyYXkgPyBiYXNlVW5hcnkobm9kZUlzVHlwZWRBcnJheSkgOiBiYXNlSXNUeXBlZEFycmF5O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGlzVHlwZWRBcnJheTtcbiIsInZhciBiYXNlVGltZXMgPSByZXF1aXJlKCcuL19iYXNlVGltZXMnKSxcbiAgICBpc0FyZ3VtZW50cyA9IHJlcXVpcmUoJy4vaXNBcmd1bWVudHMnKSxcbiAgICBpc0FycmF5ID0gcmVxdWlyZSgnLi9pc0FycmF5JyksXG4gICAgaXNCdWZmZXIgPSByZXF1aXJlKCcuL2lzQnVmZmVyJyksXG4gICAgaXNJbmRleCA9IHJlcXVpcmUoJy4vX2lzSW5kZXgnKSxcbiAgICBpc1R5cGVkQXJyYXkgPSByZXF1aXJlKCcuL2lzVHlwZWRBcnJheScpO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gYXJyYXkgb2YgdGhlIGVudW1lcmFibGUgcHJvcGVydHkgbmFtZXMgb2YgdGhlIGFycmF5LWxpa2UgYHZhbHVlYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGluaGVyaXRlZCBTcGVjaWZ5IHJldHVybmluZyBpbmhlcml0ZWQgcHJvcGVydHkgbmFtZXMuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuICovXG5mdW5jdGlvbiBhcnJheUxpa2VLZXlzKHZhbHVlLCBpbmhlcml0ZWQpIHtcbiAgdmFyIGlzQXJyID0gaXNBcnJheSh2YWx1ZSksXG4gICAgICBpc0FyZyA9ICFpc0FyciAmJiBpc0FyZ3VtZW50cyh2YWx1ZSksXG4gICAgICBpc0J1ZmYgPSAhaXNBcnIgJiYgIWlzQXJnICYmIGlzQnVmZmVyKHZhbHVlKSxcbiAgICAgIGlzVHlwZSA9ICFpc0FyciAmJiAhaXNBcmcgJiYgIWlzQnVmZiAmJiBpc1R5cGVkQXJyYXkodmFsdWUpLFxuICAgICAgc2tpcEluZGV4ZXMgPSBpc0FyciB8fCBpc0FyZyB8fCBpc0J1ZmYgfHwgaXNUeXBlLFxuICAgICAgcmVzdWx0ID0gc2tpcEluZGV4ZXMgPyBiYXNlVGltZXModmFsdWUubGVuZ3RoLCBTdHJpbmcpIDogW10sXG4gICAgICBsZW5ndGggPSByZXN1bHQubGVuZ3RoO1xuXG4gIGZvciAodmFyIGtleSBpbiB2YWx1ZSkge1xuICAgIGlmICgoaW5oZXJpdGVkIHx8IGhhc093blByb3BlcnR5LmNhbGwodmFsdWUsIGtleSkpICYmXG4gICAgICAgICEoc2tpcEluZGV4ZXMgJiYgKFxuICAgICAgICAgICAvLyBTYWZhcmkgOSBoYXMgZW51bWVyYWJsZSBgYXJndW1lbnRzLmxlbmd0aGAgaW4gc3RyaWN0IG1vZGUuXG4gICAgICAgICAgIGtleSA9PSAnbGVuZ3RoJyB8fFxuICAgICAgICAgICAvLyBOb2RlLmpzIDAuMTAgaGFzIGVudW1lcmFibGUgbm9uLWluZGV4IHByb3BlcnRpZXMgb24gYnVmZmVycy5cbiAgICAgICAgICAgKGlzQnVmZiAmJiAoa2V5ID09ICdvZmZzZXQnIHx8IGtleSA9PSAncGFyZW50JykpIHx8XG4gICAgICAgICAgIC8vIFBoYW50b21KUyAyIGhhcyBlbnVtZXJhYmxlIG5vbi1pbmRleCBwcm9wZXJ0aWVzIG9uIHR5cGVkIGFycmF5cy5cbiAgICAgICAgICAgKGlzVHlwZSAmJiAoa2V5ID09ICdidWZmZXInIHx8IGtleSA9PSAnYnl0ZUxlbmd0aCcgfHwga2V5ID09ICdieXRlT2Zmc2V0JykpIHx8XG4gICAgICAgICAgIC8vIFNraXAgaW5kZXggcHJvcGVydGllcy5cbiAgICAgICAgICAgaXNJbmRleChrZXksIGxlbmd0aClcbiAgICAgICAgKSkpIHtcbiAgICAgIHJlc3VsdC5wdXNoKGtleSk7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYXJyYXlMaWtlS2V5cztcbiIsIi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgbGlrZWx5IGEgcHJvdG90eXBlIG9iamVjdC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHByb3RvdHlwZSwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc1Byb3RvdHlwZSh2YWx1ZSkge1xuICB2YXIgQ3RvciA9IHZhbHVlICYmIHZhbHVlLmNvbnN0cnVjdG9yLFxuICAgICAgcHJvdG8gPSAodHlwZW9mIEN0b3IgPT0gJ2Z1bmN0aW9uJyAmJiBDdG9yLnByb3RvdHlwZSkgfHwgb2JqZWN0UHJvdG87XG5cbiAgcmV0dXJuIHZhbHVlID09PSBwcm90bztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc1Byb3RvdHlwZTtcbiIsIi8qKlxuICogQ3JlYXRlcyBhIHVuYXJ5IGZ1bmN0aW9uIHRoYXQgaW52b2tlcyBgZnVuY2Agd2l0aCBpdHMgYXJndW1lbnQgdHJhbnNmb3JtZWQuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIHdyYXAuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSB0cmFuc2Zvcm0gVGhlIGFyZ3VtZW50IHRyYW5zZm9ybS5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBvdmVyQXJnKGZ1bmMsIHRyYW5zZm9ybSkge1xuICByZXR1cm4gZnVuY3Rpb24oYXJnKSB7XG4gICAgcmV0dXJuIGZ1bmModHJhbnNmb3JtKGFyZykpO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG92ZXJBcmc7XG4iLCJ2YXIgb3ZlckFyZyA9IHJlcXVpcmUoJy4vX292ZXJBcmcnKTtcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgZm9yIHRob3NlIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzLiAqL1xudmFyIG5hdGl2ZUtleXMgPSBvdmVyQXJnKE9iamVjdC5rZXlzLCBPYmplY3QpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5hdGl2ZUtleXM7XG4iLCJ2YXIgaXNQcm90b3R5cGUgPSByZXF1aXJlKCcuL19pc1Byb3RvdHlwZScpLFxuICAgIG5hdGl2ZUtleXMgPSByZXF1aXJlKCcuL19uYXRpdmVLZXlzJyk7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8ua2V5c2Agd2hpY2ggZG9lc24ndCB0cmVhdCBzcGFyc2UgYXJyYXlzIGFzIGRlbnNlLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuICovXG5mdW5jdGlvbiBiYXNlS2V5cyhvYmplY3QpIHtcbiAgaWYgKCFpc1Byb3RvdHlwZShvYmplY3QpKSB7XG4gICAgcmV0dXJuIG5hdGl2ZUtleXMob2JqZWN0KTtcbiAgfVxuICB2YXIgcmVzdWx0ID0gW107XG4gIGZvciAodmFyIGtleSBpbiBPYmplY3Qob2JqZWN0KSkge1xuICAgIGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwga2V5KSAmJiBrZXkgIT0gJ2NvbnN0cnVjdG9yJykge1xuICAgICAgcmVzdWx0LnB1c2goa2V5KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlS2V5cztcbiIsInZhciBpc0Z1bmN0aW9uID0gcmVxdWlyZSgnLi9pc0Z1bmN0aW9uJyksXG4gICAgaXNMZW5ndGggPSByZXF1aXJlKCcuL2lzTGVuZ3RoJyk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYXJyYXktbGlrZS4gQSB2YWx1ZSBpcyBjb25zaWRlcmVkIGFycmF5LWxpa2UgaWYgaXQnc1xuICogbm90IGEgZnVuY3Rpb24gYW5kIGhhcyBhIGB2YWx1ZS5sZW5ndGhgIHRoYXQncyBhbiBpbnRlZ2VyIGdyZWF0ZXIgdGhhbiBvclxuICogZXF1YWwgdG8gYDBgIGFuZCBsZXNzIHRoYW4gb3IgZXF1YWwgdG8gYE51bWJlci5NQVhfU0FGRV9JTlRFR0VSYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhcnJheS1saWtlLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNBcnJheUxpa2UoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJyYXlMaWtlKGRvY3VtZW50LmJvZHkuY2hpbGRyZW4pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcnJheUxpa2UoJ2FiYycpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcnJheUxpa2UoXy5ub29wKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlMaWtlKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSAhPSBudWxsICYmIGlzTGVuZ3RoKHZhbHVlLmxlbmd0aCkgJiYgIWlzRnVuY3Rpb24odmFsdWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzQXJyYXlMaWtlO1xuIiwidmFyIGFycmF5TGlrZUtleXMgPSByZXF1aXJlKCcuL19hcnJheUxpa2VLZXlzJyksXG4gICAgYmFzZUtleXMgPSByZXF1aXJlKCcuL19iYXNlS2V5cycpLFxuICAgIGlzQXJyYXlMaWtlID0gcmVxdWlyZSgnLi9pc0FycmF5TGlrZScpO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gYXJyYXkgb2YgdGhlIG93biBlbnVtZXJhYmxlIHByb3BlcnR5IG5hbWVzIG9mIGBvYmplY3RgLlxuICpcbiAqICoqTm90ZToqKiBOb24tb2JqZWN0IHZhbHVlcyBhcmUgY29lcmNlZCB0byBvYmplY3RzLiBTZWUgdGhlXG4gKiBbRVMgc3BlY10oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtb2JqZWN0LmtleXMpXG4gKiBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBzaW5jZSAwLjEuMFxuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBPYmplY3RcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMuXG4gKiBAZXhhbXBsZVxuICpcbiAqIGZ1bmN0aW9uIEZvbygpIHtcbiAqICAgdGhpcy5hID0gMTtcbiAqICAgdGhpcy5iID0gMjtcbiAqIH1cbiAqXG4gKiBGb28ucHJvdG90eXBlLmMgPSAzO1xuICpcbiAqIF8ua2V5cyhuZXcgRm9vKTtcbiAqIC8vID0+IFsnYScsICdiJ10gKGl0ZXJhdGlvbiBvcmRlciBpcyBub3QgZ3VhcmFudGVlZClcbiAqXG4gKiBfLmtleXMoJ2hpJyk7XG4gKiAvLyA9PiBbJzAnLCAnMSddXG4gKi9cbmZ1bmN0aW9uIGtleXMob2JqZWN0KSB7XG4gIHJldHVybiBpc0FycmF5TGlrZShvYmplY3QpID8gYXJyYXlMaWtlS2V5cyhvYmplY3QpIDogYmFzZUtleXMob2JqZWN0KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBrZXlzO1xuIiwidmFyIGNvcHlPYmplY3QgPSByZXF1aXJlKCcuL19jb3B5T2JqZWN0JyksXG4gICAga2V5cyA9IHJlcXVpcmUoJy4va2V5cycpO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmFzc2lnbmAgd2l0aG91dCBzdXBwb3J0IGZvciBtdWx0aXBsZSBzb3VyY2VzXG4gKiBvciBgY3VzdG9taXplcmAgZnVuY3Rpb25zLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBkZXN0aW5hdGlvbiBvYmplY3QuXG4gKiBAcGFyYW0ge09iamVjdH0gc291cmNlIFRoZSBzb3VyY2Ugb2JqZWN0LlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgb2JqZWN0YC5cbiAqL1xuZnVuY3Rpb24gYmFzZUFzc2lnbihvYmplY3QsIHNvdXJjZSkge1xuICByZXR1cm4gb2JqZWN0ICYmIGNvcHlPYmplY3Qoc291cmNlLCBrZXlzKHNvdXJjZSksIG9iamVjdCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUFzc2lnbjtcbiIsIi8qKlxuICogVGhpcyBmdW5jdGlvbiBpcyBsaWtlXG4gKiBbYE9iamVjdC5rZXlzYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtb2JqZWN0LmtleXMpXG4gKiBleGNlcHQgdGhhdCBpdCBpbmNsdWRlcyBpbmhlcml0ZWQgZW51bWVyYWJsZSBwcm9wZXJ0aWVzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuICovXG5mdW5jdGlvbiBuYXRpdmVLZXlzSW4ob2JqZWN0KSB7XG4gIHZhciByZXN1bHQgPSBbXTtcbiAgaWYgKG9iamVjdCAhPSBudWxsKSB7XG4gICAgZm9yICh2YXIga2V5IGluIE9iamVjdChvYmplY3QpKSB7XG4gICAgICByZXN1bHQucHVzaChrZXkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG5hdGl2ZUtleXNJbjtcbiIsInZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vaXNPYmplY3QnKSxcbiAgICBpc1Byb3RvdHlwZSA9IHJlcXVpcmUoJy4vX2lzUHJvdG90eXBlJyksXG4gICAgbmF0aXZlS2V5c0luID0gcmVxdWlyZSgnLi9fbmF0aXZlS2V5c0luJyk7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8ua2V5c0luYCB3aGljaCBkb2Vzbid0IHRyZWF0IHNwYXJzZSBhcnJheXMgYXMgZGVuc2UuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMuXG4gKi9cbmZ1bmN0aW9uIGJhc2VLZXlzSW4ob2JqZWN0KSB7XG4gIGlmICghaXNPYmplY3Qob2JqZWN0KSkge1xuICAgIHJldHVybiBuYXRpdmVLZXlzSW4ob2JqZWN0KTtcbiAgfVxuICB2YXIgaXNQcm90byA9IGlzUHJvdG90eXBlKG9iamVjdCksXG4gICAgICByZXN1bHQgPSBbXTtcblxuICBmb3IgKHZhciBrZXkgaW4gb2JqZWN0KSB7XG4gICAgaWYgKCEoa2V5ID09ICdjb25zdHJ1Y3RvcicgJiYgKGlzUHJvdG8gfHwgIWhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBrZXkpKSkpIHtcbiAgICAgIHJlc3VsdC5wdXNoKGtleSk7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUtleXNJbjtcbiIsInZhciBhcnJheUxpa2VLZXlzID0gcmVxdWlyZSgnLi9fYXJyYXlMaWtlS2V5cycpLFxuICAgIGJhc2VLZXlzSW4gPSByZXF1aXJlKCcuL19iYXNlS2V5c0luJyksXG4gICAgaXNBcnJheUxpa2UgPSByZXF1aXJlKCcuL2lzQXJyYXlMaWtlJyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhcnJheSBvZiB0aGUgb3duIGFuZCBpbmhlcml0ZWQgZW51bWVyYWJsZSBwcm9wZXJ0eSBuYW1lcyBvZiBgb2JqZWN0YC5cbiAqXG4gKiAqKk5vdGU6KiogTm9uLW9iamVjdCB2YWx1ZXMgYXJlIGNvZXJjZWQgdG8gb2JqZWN0cy5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDMuMC4wXG4gKiBAY2F0ZWdvcnkgT2JqZWN0XG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuICogQGV4YW1wbGVcbiAqXG4gKiBmdW5jdGlvbiBGb28oKSB7XG4gKiAgIHRoaXMuYSA9IDE7XG4gKiAgIHRoaXMuYiA9IDI7XG4gKiB9XG4gKlxuICogRm9vLnByb3RvdHlwZS5jID0gMztcbiAqXG4gKiBfLmtleXNJbihuZXcgRm9vKTtcbiAqIC8vID0+IFsnYScsICdiJywgJ2MnXSAoaXRlcmF0aW9uIG9yZGVyIGlzIG5vdCBndWFyYW50ZWVkKVxuICovXG5mdW5jdGlvbiBrZXlzSW4ob2JqZWN0KSB7XG4gIHJldHVybiBpc0FycmF5TGlrZShvYmplY3QpID8gYXJyYXlMaWtlS2V5cyhvYmplY3QsIHRydWUpIDogYmFzZUtleXNJbihvYmplY3QpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGtleXNJbjtcbiIsInZhciBjb3B5T2JqZWN0ID0gcmVxdWlyZSgnLi9fY29weU9iamVjdCcpLFxuICAgIGtleXNJbiA9IHJlcXVpcmUoJy4va2V5c0luJyk7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uYXNzaWduSW5gIHdpdGhvdXQgc3VwcG9ydCBmb3IgbXVsdGlwbGUgc291cmNlc1xuICogb3IgYGN1c3RvbWl6ZXJgIGZ1bmN0aW9ucy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgZGVzdGluYXRpb24gb2JqZWN0LlxuICogQHBhcmFtIHtPYmplY3R9IHNvdXJjZSBUaGUgc291cmNlIG9iamVjdC5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgYG9iamVjdGAuXG4gKi9cbmZ1bmN0aW9uIGJhc2VBc3NpZ25JbihvYmplY3QsIHNvdXJjZSkge1xuICByZXR1cm4gb2JqZWN0ICYmIGNvcHlPYmplY3Qoc291cmNlLCBrZXlzSW4oc291cmNlKSwgb2JqZWN0KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlQXNzaWduSW47XG4iLCJ2YXIgcm9vdCA9IHJlcXVpcmUoJy4vX3Jvb3QnKTtcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBleHBvcnRzYC4gKi9cbnZhciBmcmVlRXhwb3J0cyA9IHR5cGVvZiBleHBvcnRzID09ICdvYmplY3QnICYmIGV4cG9ydHMgJiYgIWV4cG9ydHMubm9kZVR5cGUgJiYgZXhwb3J0cztcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBtb2R1bGVgLiAqL1xudmFyIGZyZWVNb2R1bGUgPSBmcmVlRXhwb3J0cyAmJiB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZSAmJiAhbW9kdWxlLm5vZGVUeXBlICYmIG1vZHVsZTtcblxuLyoqIERldGVjdCB0aGUgcG9wdWxhciBDb21tb25KUyBleHRlbnNpb24gYG1vZHVsZS5leHBvcnRzYC4gKi9cbnZhciBtb2R1bGVFeHBvcnRzID0gZnJlZU1vZHVsZSAmJiBmcmVlTW9kdWxlLmV4cG9ydHMgPT09IGZyZWVFeHBvcnRzO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBCdWZmZXIgPSBtb2R1bGVFeHBvcnRzID8gcm9vdC5CdWZmZXIgOiB1bmRlZmluZWQsXG4gICAgYWxsb2NVbnNhZmUgPSBCdWZmZXIgPyBCdWZmZXIuYWxsb2NVbnNhZmUgOiB1bmRlZmluZWQ7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGNsb25lIG9mICBgYnVmZmVyYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtCdWZmZXJ9IGJ1ZmZlciBUaGUgYnVmZmVyIHRvIGNsb25lLlxuICogQHBhcmFtIHtib29sZWFufSBbaXNEZWVwXSBTcGVjaWZ5IGEgZGVlcCBjbG9uZS5cbiAqIEByZXR1cm5zIHtCdWZmZXJ9IFJldHVybnMgdGhlIGNsb25lZCBidWZmZXIuXG4gKi9cbmZ1bmN0aW9uIGNsb25lQnVmZmVyKGJ1ZmZlciwgaXNEZWVwKSB7XG4gIGlmIChpc0RlZXApIHtcbiAgICByZXR1cm4gYnVmZmVyLnNsaWNlKCk7XG4gIH1cbiAgdmFyIGxlbmd0aCA9IGJ1ZmZlci5sZW5ndGgsXG4gICAgICByZXN1bHQgPSBhbGxvY1Vuc2FmZSA/IGFsbG9jVW5zYWZlKGxlbmd0aCkgOiBuZXcgYnVmZmVyLmNvbnN0cnVjdG9yKGxlbmd0aCk7XG5cbiAgYnVmZmVyLmNvcHkocmVzdWx0KTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjbG9uZUJ1ZmZlcjtcbiIsIi8qKlxuICogQ29waWVzIHRoZSB2YWx1ZXMgb2YgYHNvdXJjZWAgdG8gYGFycmF5YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gc291cmNlIFRoZSBhcnJheSB0byBjb3B5IHZhbHVlcyBmcm9tLlxuICogQHBhcmFtIHtBcnJheX0gW2FycmF5PVtdXSBUaGUgYXJyYXkgdG8gY29weSB2YWx1ZXMgdG8uXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgYGFycmF5YC5cbiAqL1xuZnVuY3Rpb24gY29weUFycmF5KHNvdXJjZSwgYXJyYXkpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBzb3VyY2UubGVuZ3RoO1xuXG4gIGFycmF5IHx8IChhcnJheSA9IEFycmF5KGxlbmd0aCkpO1xuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIGFycmF5W2luZGV4XSA9IHNvdXJjZVtpbmRleF07XG4gIH1cbiAgcmV0dXJuIGFycmF5O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNvcHlBcnJheTtcbiIsIi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBfLmZpbHRlcmAgZm9yIGFycmF5cyB3aXRob3V0IHN1cHBvcnQgZm9yXG4gKiBpdGVyYXRlZSBzaG9ydGhhbmRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fSBbYXJyYXldIFRoZSBhcnJheSB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBwcmVkaWNhdGUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgbmV3IGZpbHRlcmVkIGFycmF5LlxuICovXG5mdW5jdGlvbiBhcnJheUZpbHRlcihhcnJheSwgcHJlZGljYXRlKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gYXJyYXkgPT0gbnVsbCA/IDAgOiBhcnJheS5sZW5ndGgsXG4gICAgICByZXNJbmRleCA9IDAsXG4gICAgICByZXN1bHQgPSBbXTtcblxuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHZhciB2YWx1ZSA9IGFycmF5W2luZGV4XTtcbiAgICBpZiAocHJlZGljYXRlKHZhbHVlLCBpbmRleCwgYXJyYXkpKSB7XG4gICAgICByZXN1bHRbcmVzSW5kZXgrK10gPSB2YWx1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBhcnJheUZpbHRlcjtcbiIsIi8qKlxuICogVGhpcyBtZXRob2QgcmV0dXJucyBhIG5ldyBlbXB0eSBhcnJheS5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMTMuMFxuICogQGNhdGVnb3J5IFV0aWxcbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgbmV3IGVtcHR5IGFycmF5LlxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgYXJyYXlzID0gXy50aW1lcygyLCBfLnN0dWJBcnJheSk7XG4gKlxuICogY29uc29sZS5sb2coYXJyYXlzKTtcbiAqIC8vID0+IFtbXSwgW11dXG4gKlxuICogY29uc29sZS5sb2coYXJyYXlzWzBdID09PSBhcnJheXNbMV0pO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gc3R1YkFycmF5KCkge1xuICByZXR1cm4gW107XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc3R1YkFycmF5O1xuIiwidmFyIGFycmF5RmlsdGVyID0gcmVxdWlyZSgnLi9fYXJyYXlGaWx0ZXInKSxcbiAgICBzdHViQXJyYXkgPSByZXF1aXJlKCcuL3N0dWJBcnJheScpO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBwcm9wZXJ0eUlzRW51bWVyYWJsZSA9IG9iamVjdFByb3RvLnByb3BlcnR5SXNFbnVtZXJhYmxlO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyBmb3IgdGhvc2Ugd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMuICovXG52YXIgbmF0aXZlR2V0U3ltYm9scyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHM7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhcnJheSBvZiB0aGUgb3duIGVudW1lcmFibGUgc3ltYm9scyBvZiBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBzeW1ib2xzLlxuICovXG52YXIgZ2V0U3ltYm9scyA9ICFuYXRpdmVHZXRTeW1ib2xzID8gc3R1YkFycmF5IDogZnVuY3Rpb24ob2JqZWN0KSB7XG4gIGlmIChvYmplY3QgPT0gbnVsbCkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuICBvYmplY3QgPSBPYmplY3Qob2JqZWN0KTtcbiAgcmV0dXJuIGFycmF5RmlsdGVyKG5hdGl2ZUdldFN5bWJvbHMob2JqZWN0KSwgZnVuY3Rpb24oc3ltYm9sKSB7XG4gICAgcmV0dXJuIHByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwob2JqZWN0LCBzeW1ib2wpO1xuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0U3ltYm9scztcbiIsInZhciBjb3B5T2JqZWN0ID0gcmVxdWlyZSgnLi9fY29weU9iamVjdCcpLFxuICAgIGdldFN5bWJvbHMgPSByZXF1aXJlKCcuL19nZXRTeW1ib2xzJyk7XG5cbi8qKlxuICogQ29waWVzIG93biBzeW1ib2xzIG9mIGBzb3VyY2VgIHRvIGBvYmplY3RgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gc291cmNlIFRoZSBvYmplY3QgdG8gY29weSBzeW1ib2xzIGZyb20uXG4gKiBAcGFyYW0ge09iamVjdH0gW29iamVjdD17fV0gVGhlIG9iamVjdCB0byBjb3B5IHN5bWJvbHMgdG8uXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGBvYmplY3RgLlxuICovXG5mdW5jdGlvbiBjb3B5U3ltYm9scyhzb3VyY2UsIG9iamVjdCkge1xuICByZXR1cm4gY29weU9iamVjdChzb3VyY2UsIGdldFN5bWJvbHMoc291cmNlKSwgb2JqZWN0KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjb3B5U3ltYm9scztcbiIsIi8qKlxuICogQXBwZW5kcyB0aGUgZWxlbWVudHMgb2YgYHZhbHVlc2AgdG8gYGFycmF5YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIG1vZGlmeS5cbiAqIEBwYXJhbSB7QXJyYXl9IHZhbHVlcyBUaGUgdmFsdWVzIHRvIGFwcGVuZC5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBgYXJyYXlgLlxuICovXG5mdW5jdGlvbiBhcnJheVB1c2goYXJyYXksIHZhbHVlcykge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IHZhbHVlcy5sZW5ndGgsXG4gICAgICBvZmZzZXQgPSBhcnJheS5sZW5ndGg7XG5cbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICBhcnJheVtvZmZzZXQgKyBpbmRleF0gPSB2YWx1ZXNbaW5kZXhdO1xuICB9XG4gIHJldHVybiBhcnJheTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBhcnJheVB1c2g7XG4iLCJ2YXIgb3ZlckFyZyA9IHJlcXVpcmUoJy4vX292ZXJBcmcnKTtcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgZ2V0UHJvdG90eXBlID0gb3ZlckFyZyhPYmplY3QuZ2V0UHJvdG90eXBlT2YsIE9iamVjdCk7XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0UHJvdG90eXBlO1xuIiwidmFyIGFycmF5UHVzaCA9IHJlcXVpcmUoJy4vX2FycmF5UHVzaCcpLFxuICAgIGdldFByb3RvdHlwZSA9IHJlcXVpcmUoJy4vX2dldFByb3RvdHlwZScpLFxuICAgIGdldFN5bWJvbHMgPSByZXF1aXJlKCcuL19nZXRTeW1ib2xzJyksXG4gICAgc3R1YkFycmF5ID0gcmVxdWlyZSgnLi9zdHViQXJyYXknKTtcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgZm9yIHRob3NlIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzLiAqL1xudmFyIG5hdGl2ZUdldFN5bWJvbHMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gYXJyYXkgb2YgdGhlIG93biBhbmQgaW5oZXJpdGVkIGVudW1lcmFibGUgc3ltYm9scyBvZiBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBzeW1ib2xzLlxuICovXG52YXIgZ2V0U3ltYm9sc0luID0gIW5hdGl2ZUdldFN5bWJvbHMgPyBzdHViQXJyYXkgOiBmdW5jdGlvbihvYmplY3QpIHtcbiAgdmFyIHJlc3VsdCA9IFtdO1xuICB3aGlsZSAob2JqZWN0KSB7XG4gICAgYXJyYXlQdXNoKHJlc3VsdCwgZ2V0U3ltYm9scyhvYmplY3QpKTtcbiAgICBvYmplY3QgPSBnZXRQcm90b3R5cGUob2JqZWN0KTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBnZXRTeW1ib2xzSW47XG4iLCJ2YXIgY29weU9iamVjdCA9IHJlcXVpcmUoJy4vX2NvcHlPYmplY3QnKSxcbiAgICBnZXRTeW1ib2xzSW4gPSByZXF1aXJlKCcuL19nZXRTeW1ib2xzSW4nKTtcblxuLyoqXG4gKiBDb3BpZXMgb3duIGFuZCBpbmhlcml0ZWQgc3ltYm9scyBvZiBgc291cmNlYCB0byBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IHNvdXJjZSBUaGUgb2JqZWN0IHRvIGNvcHkgc3ltYm9scyBmcm9tLlxuICogQHBhcmFtIHtPYmplY3R9IFtvYmplY3Q9e31dIFRoZSBvYmplY3QgdG8gY29weSBzeW1ib2xzIHRvLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgb2JqZWN0YC5cbiAqL1xuZnVuY3Rpb24gY29weVN5bWJvbHNJbihzb3VyY2UsIG9iamVjdCkge1xuICByZXR1cm4gY29weU9iamVjdChzb3VyY2UsIGdldFN5bWJvbHNJbihzb3VyY2UpLCBvYmplY3QpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNvcHlTeW1ib2xzSW47XG4iLCJ2YXIgYXJyYXlQdXNoID0gcmVxdWlyZSgnLi9fYXJyYXlQdXNoJyksXG4gICAgaXNBcnJheSA9IHJlcXVpcmUoJy4vaXNBcnJheScpO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBnZXRBbGxLZXlzYCBhbmQgYGdldEFsbEtleXNJbmAgd2hpY2ggdXNlc1xuICogYGtleXNGdW5jYCBhbmQgYHN5bWJvbHNGdW5jYCB0byBnZXQgdGhlIGVudW1lcmFibGUgcHJvcGVydHkgbmFtZXMgYW5kXG4gKiBzeW1ib2xzIG9mIGBvYmplY3RgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBrZXlzRnVuYyBUaGUgZnVuY3Rpb24gdG8gZ2V0IHRoZSBrZXlzIG9mIGBvYmplY3RgLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gc3ltYm9sc0Z1bmMgVGhlIGZ1bmN0aW9uIHRvIGdldCB0aGUgc3ltYm9scyBvZiBgb2JqZWN0YC5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMgYW5kIHN5bWJvbHMuXG4gKi9cbmZ1bmN0aW9uIGJhc2VHZXRBbGxLZXlzKG9iamVjdCwga2V5c0Z1bmMsIHN5bWJvbHNGdW5jKSB7XG4gIHZhciByZXN1bHQgPSBrZXlzRnVuYyhvYmplY3QpO1xuICByZXR1cm4gaXNBcnJheShvYmplY3QpID8gcmVzdWx0IDogYXJyYXlQdXNoKHJlc3VsdCwgc3ltYm9sc0Z1bmMob2JqZWN0KSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUdldEFsbEtleXM7XG4iLCJ2YXIgYmFzZUdldEFsbEtleXMgPSByZXF1aXJlKCcuL19iYXNlR2V0QWxsS2V5cycpLFxuICAgIGdldFN5bWJvbHMgPSByZXF1aXJlKCcuL19nZXRTeW1ib2xzJyksXG4gICAga2V5cyA9IHJlcXVpcmUoJy4va2V5cycpO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gYXJyYXkgb2Ygb3duIGVudW1lcmFibGUgcHJvcGVydHkgbmFtZXMgYW5kIHN5bWJvbHMgb2YgYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMgYW5kIHN5bWJvbHMuXG4gKi9cbmZ1bmN0aW9uIGdldEFsbEtleXMob2JqZWN0KSB7XG4gIHJldHVybiBiYXNlR2V0QWxsS2V5cyhvYmplY3QsIGtleXMsIGdldFN5bWJvbHMpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldEFsbEtleXM7XG4iLCJ2YXIgYmFzZUdldEFsbEtleXMgPSByZXF1aXJlKCcuL19iYXNlR2V0QWxsS2V5cycpLFxuICAgIGdldFN5bWJvbHNJbiA9IHJlcXVpcmUoJy4vX2dldFN5bWJvbHNJbicpLFxuICAgIGtleXNJbiA9IHJlcXVpcmUoJy4va2V5c0luJyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhcnJheSBvZiBvd24gYW5kIGluaGVyaXRlZCBlbnVtZXJhYmxlIHByb3BlcnR5IG5hbWVzIGFuZFxuICogc3ltYm9scyBvZiBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcyBhbmQgc3ltYm9scy5cbiAqL1xuZnVuY3Rpb24gZ2V0QWxsS2V5c0luKG9iamVjdCkge1xuICByZXR1cm4gYmFzZUdldEFsbEtleXMob2JqZWN0LCBrZXlzSW4sIGdldFN5bWJvbHNJbik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0QWxsS2V5c0luO1xuIiwidmFyIGdldE5hdGl2ZSA9IHJlcXVpcmUoJy4vX2dldE5hdGl2ZScpLFxuICAgIHJvb3QgPSByZXF1aXJlKCcuL19yb290Jyk7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIHRoYXQgYXJlIHZlcmlmaWVkIHRvIGJlIG5hdGl2ZS4gKi9cbnZhciBEYXRhVmlldyA9IGdldE5hdGl2ZShyb290LCAnRGF0YVZpZXcnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBEYXRhVmlldztcbiIsInZhciBnZXROYXRpdmUgPSByZXF1aXJlKCcuL19nZXROYXRpdmUnKSxcbiAgICByb290ID0gcmVxdWlyZSgnLi9fcm9vdCcpO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyB0aGF0IGFyZSB2ZXJpZmllZCB0byBiZSBuYXRpdmUuICovXG52YXIgUHJvbWlzZSA9IGdldE5hdGl2ZShyb290LCAnUHJvbWlzZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFByb21pc2U7XG4iLCJ2YXIgZ2V0TmF0aXZlID0gcmVxdWlyZSgnLi9fZ2V0TmF0aXZlJyksXG4gICAgcm9vdCA9IHJlcXVpcmUoJy4vX3Jvb3QnKTtcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgdGhhdCBhcmUgdmVyaWZpZWQgdG8gYmUgbmF0aXZlLiAqL1xudmFyIFNldCA9IGdldE5hdGl2ZShyb290LCAnU2V0Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gU2V0O1xuIiwidmFyIGdldE5hdGl2ZSA9IHJlcXVpcmUoJy4vX2dldE5hdGl2ZScpLFxuICAgIHJvb3QgPSByZXF1aXJlKCcuL19yb290Jyk7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIHRoYXQgYXJlIHZlcmlmaWVkIHRvIGJlIG5hdGl2ZS4gKi9cbnZhciBXZWFrTWFwID0gZ2V0TmF0aXZlKHJvb3QsICdXZWFrTWFwJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gV2Vha01hcDtcbiIsInZhciBEYXRhVmlldyA9IHJlcXVpcmUoJy4vX0RhdGFWaWV3JyksXG4gICAgTWFwID0gcmVxdWlyZSgnLi9fTWFwJyksXG4gICAgUHJvbWlzZSA9IHJlcXVpcmUoJy4vX1Byb21pc2UnKSxcbiAgICBTZXQgPSByZXF1aXJlKCcuL19TZXQnKSxcbiAgICBXZWFrTWFwID0gcmVxdWlyZSgnLi9fV2Vha01hcCcpLFxuICAgIGJhc2VHZXRUYWcgPSByZXF1aXJlKCcuL19iYXNlR2V0VGFnJyksXG4gICAgdG9Tb3VyY2UgPSByZXF1aXJlKCcuL190b1NvdXJjZScpO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgbWFwVGFnID0gJ1tvYmplY3QgTWFwXScsXG4gICAgb2JqZWN0VGFnID0gJ1tvYmplY3QgT2JqZWN0XScsXG4gICAgcHJvbWlzZVRhZyA9ICdbb2JqZWN0IFByb21pc2VdJyxcbiAgICBzZXRUYWcgPSAnW29iamVjdCBTZXRdJyxcbiAgICB3ZWFrTWFwVGFnID0gJ1tvYmplY3QgV2Vha01hcF0nO1xuXG52YXIgZGF0YVZpZXdUYWcgPSAnW29iamVjdCBEYXRhVmlld10nO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgbWFwcywgc2V0cywgYW5kIHdlYWttYXBzLiAqL1xudmFyIGRhdGFWaWV3Q3RvclN0cmluZyA9IHRvU291cmNlKERhdGFWaWV3KSxcbiAgICBtYXBDdG9yU3RyaW5nID0gdG9Tb3VyY2UoTWFwKSxcbiAgICBwcm9taXNlQ3RvclN0cmluZyA9IHRvU291cmNlKFByb21pc2UpLFxuICAgIHNldEN0b3JTdHJpbmcgPSB0b1NvdXJjZShTZXQpLFxuICAgIHdlYWtNYXBDdG9yU3RyaW5nID0gdG9Tb3VyY2UoV2Vha01hcCk7XG5cbi8qKlxuICogR2V0cyB0aGUgYHRvU3RyaW5nVGFnYCBvZiBgdmFsdWVgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIGB0b1N0cmluZ1RhZ2AuXG4gKi9cbnZhciBnZXRUYWcgPSBiYXNlR2V0VGFnO1xuXG4vLyBGYWxsYmFjayBmb3IgZGF0YSB2aWV3cywgbWFwcywgc2V0cywgYW5kIHdlYWsgbWFwcyBpbiBJRSAxMSBhbmQgcHJvbWlzZXMgaW4gTm9kZS5qcyA8IDYuXG5pZiAoKERhdGFWaWV3ICYmIGdldFRhZyhuZXcgRGF0YVZpZXcobmV3IEFycmF5QnVmZmVyKDEpKSkgIT0gZGF0YVZpZXdUYWcpIHx8XG4gICAgKE1hcCAmJiBnZXRUYWcobmV3IE1hcCkgIT0gbWFwVGFnKSB8fFxuICAgIChQcm9taXNlICYmIGdldFRhZyhQcm9taXNlLnJlc29sdmUoKSkgIT0gcHJvbWlzZVRhZykgfHxcbiAgICAoU2V0ICYmIGdldFRhZyhuZXcgU2V0KSAhPSBzZXRUYWcpIHx8XG4gICAgKFdlYWtNYXAgJiYgZ2V0VGFnKG5ldyBXZWFrTWFwKSAhPSB3ZWFrTWFwVGFnKSkge1xuICBnZXRUYWcgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHZhciByZXN1bHQgPSBiYXNlR2V0VGFnKHZhbHVlKSxcbiAgICAgICAgQ3RvciA9IHJlc3VsdCA9PSBvYmplY3RUYWcgPyB2YWx1ZS5jb25zdHJ1Y3RvciA6IHVuZGVmaW5lZCxcbiAgICAgICAgY3RvclN0cmluZyA9IEN0b3IgPyB0b1NvdXJjZShDdG9yKSA6ICcnO1xuXG4gICAgaWYgKGN0b3JTdHJpbmcpIHtcbiAgICAgIHN3aXRjaCAoY3RvclN0cmluZykge1xuICAgICAgICBjYXNlIGRhdGFWaWV3Q3RvclN0cmluZzogcmV0dXJuIGRhdGFWaWV3VGFnO1xuICAgICAgICBjYXNlIG1hcEN0b3JTdHJpbmc6IHJldHVybiBtYXBUYWc7XG4gICAgICAgIGNhc2UgcHJvbWlzZUN0b3JTdHJpbmc6IHJldHVybiBwcm9taXNlVGFnO1xuICAgICAgICBjYXNlIHNldEN0b3JTdHJpbmc6IHJldHVybiBzZXRUYWc7XG4gICAgICAgIGNhc2Ugd2Vha01hcEN0b3JTdHJpbmc6IHJldHVybiB3ZWFrTWFwVGFnO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldFRhZztcbiIsIi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogSW5pdGlhbGl6ZXMgYW4gYXJyYXkgY2xvbmUuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBjbG9uZS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgaW5pdGlhbGl6ZWQgY2xvbmUuXG4gKi9cbmZ1bmN0aW9uIGluaXRDbG9uZUFycmF5KGFycmF5KSB7XG4gIHZhciBsZW5ndGggPSBhcnJheS5sZW5ndGgsXG4gICAgICByZXN1bHQgPSBhcnJheS5jb25zdHJ1Y3RvcihsZW5ndGgpO1xuXG4gIC8vIEFkZCBwcm9wZXJ0aWVzIGFzc2lnbmVkIGJ5IGBSZWdFeHAjZXhlY2AuXG4gIGlmIChsZW5ndGggJiYgdHlwZW9mIGFycmF5WzBdID09ICdzdHJpbmcnICYmIGhhc093blByb3BlcnR5LmNhbGwoYXJyYXksICdpbmRleCcpKSB7XG4gICAgcmVzdWx0LmluZGV4ID0gYXJyYXkuaW5kZXg7XG4gICAgcmVzdWx0LmlucHV0ID0gYXJyYXkuaW5wdXQ7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpbml0Q2xvbmVBcnJheTtcbiIsInZhciByb290ID0gcmVxdWlyZSgnLi9fcm9vdCcpO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBVaW50OEFycmF5ID0gcm9vdC5VaW50OEFycmF5O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFVpbnQ4QXJyYXk7XG4iLCJ2YXIgVWludDhBcnJheSA9IHJlcXVpcmUoJy4vX1VpbnQ4QXJyYXknKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgY2xvbmUgb2YgYGFycmF5QnVmZmVyYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheUJ1ZmZlcn0gYXJyYXlCdWZmZXIgVGhlIGFycmF5IGJ1ZmZlciB0byBjbG9uZS5cbiAqIEByZXR1cm5zIHtBcnJheUJ1ZmZlcn0gUmV0dXJucyB0aGUgY2xvbmVkIGFycmF5IGJ1ZmZlci5cbiAqL1xuZnVuY3Rpb24gY2xvbmVBcnJheUJ1ZmZlcihhcnJheUJ1ZmZlcikge1xuICB2YXIgcmVzdWx0ID0gbmV3IGFycmF5QnVmZmVyLmNvbnN0cnVjdG9yKGFycmF5QnVmZmVyLmJ5dGVMZW5ndGgpO1xuICBuZXcgVWludDhBcnJheShyZXN1bHQpLnNldChuZXcgVWludDhBcnJheShhcnJheUJ1ZmZlcikpO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsb25lQXJyYXlCdWZmZXI7XG4iLCJ2YXIgY2xvbmVBcnJheUJ1ZmZlciA9IHJlcXVpcmUoJy4vX2Nsb25lQXJyYXlCdWZmZXInKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgY2xvbmUgb2YgYGRhdGFWaWV3YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IGRhdGFWaWV3IFRoZSBkYXRhIHZpZXcgdG8gY2xvbmUuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtpc0RlZXBdIFNwZWNpZnkgYSBkZWVwIGNsb25lLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgY2xvbmVkIGRhdGEgdmlldy5cbiAqL1xuZnVuY3Rpb24gY2xvbmVEYXRhVmlldyhkYXRhVmlldywgaXNEZWVwKSB7XG4gIHZhciBidWZmZXIgPSBpc0RlZXAgPyBjbG9uZUFycmF5QnVmZmVyKGRhdGFWaWV3LmJ1ZmZlcikgOiBkYXRhVmlldy5idWZmZXI7XG4gIHJldHVybiBuZXcgZGF0YVZpZXcuY29uc3RydWN0b3IoYnVmZmVyLCBkYXRhVmlldy5ieXRlT2Zmc2V0LCBkYXRhVmlldy5ieXRlTGVuZ3RoKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjbG9uZURhdGFWaWV3O1xuIiwiLyoqXG4gKiBBZGRzIHRoZSBrZXktdmFsdWUgYHBhaXJgIHRvIGBtYXBgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gbWFwIFRoZSBtYXAgdG8gbW9kaWZ5LlxuICogQHBhcmFtIHtBcnJheX0gcGFpciBUaGUga2V5LXZhbHVlIHBhaXIgdG8gYWRkLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgbWFwYC5cbiAqL1xuZnVuY3Rpb24gYWRkTWFwRW50cnkobWFwLCBwYWlyKSB7XG4gIC8vIERvbid0IHJldHVybiBgbWFwLnNldGAgYmVjYXVzZSBpdCdzIG5vdCBjaGFpbmFibGUgaW4gSUUgMTEuXG4gIG1hcC5zZXQocGFpclswXSwgcGFpclsxXSk7XG4gIHJldHVybiBtYXA7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYWRkTWFwRW50cnk7XG4iLCIvKipcbiAqIEEgc3BlY2lhbGl6ZWQgdmVyc2lvbiBvZiBgXy5yZWR1Y2VgIGZvciBhcnJheXMgd2l0aG91dCBzdXBwb3J0IGZvclxuICogaXRlcmF0ZWUgc2hvcnRoYW5kcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gW2FycmF5XSBUaGUgYXJyYXkgdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEBwYXJhbSB7Kn0gW2FjY3VtdWxhdG9yXSBUaGUgaW5pdGlhbCB2YWx1ZS5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2luaXRBY2N1bV0gU3BlY2lmeSB1c2luZyB0aGUgZmlyc3QgZWxlbWVudCBvZiBgYXJyYXlgIGFzXG4gKiAgdGhlIGluaXRpYWwgdmFsdWUuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgYWNjdW11bGF0ZWQgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIGFycmF5UmVkdWNlKGFycmF5LCBpdGVyYXRlZSwgYWNjdW11bGF0b3IsIGluaXRBY2N1bSkge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IGFycmF5ID09IG51bGwgPyAwIDogYXJyYXkubGVuZ3RoO1xuXG4gIGlmIChpbml0QWNjdW0gJiYgbGVuZ3RoKSB7XG4gICAgYWNjdW11bGF0b3IgPSBhcnJheVsrK2luZGV4XTtcbiAgfVxuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIGFjY3VtdWxhdG9yID0gaXRlcmF0ZWUoYWNjdW11bGF0b3IsIGFycmF5W2luZGV4XSwgaW5kZXgsIGFycmF5KTtcbiAgfVxuICByZXR1cm4gYWNjdW11bGF0b3I7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYXJyYXlSZWR1Y2U7XG4iLCIvKipcbiAqIENvbnZlcnRzIGBtYXBgIHRvIGl0cyBrZXktdmFsdWUgcGFpcnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBtYXAgVGhlIG1hcCB0byBjb252ZXJ0LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBrZXktdmFsdWUgcGFpcnMuXG4gKi9cbmZ1bmN0aW9uIG1hcFRvQXJyYXkobWFwKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgcmVzdWx0ID0gQXJyYXkobWFwLnNpemUpO1xuXG4gIG1hcC5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICByZXN1bHRbKytpbmRleF0gPSBba2V5LCB2YWx1ZV07XG4gIH0pO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG1hcFRvQXJyYXk7XG4iLCJ2YXIgYWRkTWFwRW50cnkgPSByZXF1aXJlKCcuL19hZGRNYXBFbnRyeScpLFxuICAgIGFycmF5UmVkdWNlID0gcmVxdWlyZSgnLi9fYXJyYXlSZWR1Y2UnKSxcbiAgICBtYXBUb0FycmF5ID0gcmVxdWlyZSgnLi9fbWFwVG9BcnJheScpO1xuXG4vKiogVXNlZCB0byBjb21wb3NlIGJpdG1hc2tzIGZvciBjbG9uaW5nLiAqL1xudmFyIENMT05FX0RFRVBfRkxBRyA9IDE7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGNsb25lIG9mIGBtYXBgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gbWFwIFRoZSBtYXAgdG8gY2xvbmUuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjbG9uZUZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGNsb25lIHZhbHVlcy5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzRGVlcF0gU3BlY2lmeSBhIGRlZXAgY2xvbmUuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBjbG9uZWQgbWFwLlxuICovXG5mdW5jdGlvbiBjbG9uZU1hcChtYXAsIGlzRGVlcCwgY2xvbmVGdW5jKSB7XG4gIHZhciBhcnJheSA9IGlzRGVlcCA/IGNsb25lRnVuYyhtYXBUb0FycmF5KG1hcCksIENMT05FX0RFRVBfRkxBRykgOiBtYXBUb0FycmF5KG1hcCk7XG4gIHJldHVybiBhcnJheVJlZHVjZShhcnJheSwgYWRkTWFwRW50cnksIG5ldyBtYXAuY29uc3RydWN0b3IpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsb25lTWFwO1xuIiwiLyoqIFVzZWQgdG8gbWF0Y2ggYFJlZ0V4cGAgZmxhZ3MgZnJvbSB0aGVpciBjb2VyY2VkIHN0cmluZyB2YWx1ZXMuICovXG52YXIgcmVGbGFncyA9IC9cXHcqJC87XG5cbi8qKlxuICogQ3JlYXRlcyBhIGNsb25lIG9mIGByZWdleHBgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gcmVnZXhwIFRoZSByZWdleHAgdG8gY2xvbmUuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBjbG9uZWQgcmVnZXhwLlxuICovXG5mdW5jdGlvbiBjbG9uZVJlZ0V4cChyZWdleHApIHtcbiAgdmFyIHJlc3VsdCA9IG5ldyByZWdleHAuY29uc3RydWN0b3IocmVnZXhwLnNvdXJjZSwgcmVGbGFncy5leGVjKHJlZ2V4cCkpO1xuICByZXN1bHQubGFzdEluZGV4ID0gcmVnZXhwLmxhc3RJbmRleDtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjbG9uZVJlZ0V4cDtcbiIsIi8qKlxuICogQWRkcyBgdmFsdWVgIHRvIGBzZXRgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gc2V0IFRoZSBzZXQgdG8gbW9kaWZ5LlxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gYWRkLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgc2V0YC5cbiAqL1xuZnVuY3Rpb24gYWRkU2V0RW50cnkoc2V0LCB2YWx1ZSkge1xuICAvLyBEb24ndCByZXR1cm4gYHNldC5hZGRgIGJlY2F1c2UgaXQncyBub3QgY2hhaW5hYmxlIGluIElFIDExLlxuICBzZXQuYWRkKHZhbHVlKTtcbiAgcmV0dXJuIHNldDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBhZGRTZXRFbnRyeTtcbiIsIi8qKlxuICogQ29udmVydHMgYHNldGAgdG8gYW4gYXJyYXkgb2YgaXRzIHZhbHVlcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IHNldCBUaGUgc2V0IHRvIGNvbnZlcnQuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIHZhbHVlcy5cbiAqL1xuZnVuY3Rpb24gc2V0VG9BcnJheShzZXQpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICByZXN1bHQgPSBBcnJheShzZXQuc2l6ZSk7XG5cbiAgc2V0LmZvckVhY2goZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXN1bHRbKytpbmRleF0gPSB2YWx1ZTtcbiAgfSk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc2V0VG9BcnJheTtcbiIsInZhciBhZGRTZXRFbnRyeSA9IHJlcXVpcmUoJy4vX2FkZFNldEVudHJ5JyksXG4gICAgYXJyYXlSZWR1Y2UgPSByZXF1aXJlKCcuL19hcnJheVJlZHVjZScpLFxuICAgIHNldFRvQXJyYXkgPSByZXF1aXJlKCcuL19zZXRUb0FycmF5Jyk7XG5cbi8qKiBVc2VkIHRvIGNvbXBvc2UgYml0bWFza3MgZm9yIGNsb25pbmcuICovXG52YXIgQ0xPTkVfREVFUF9GTEFHID0gMTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgY2xvbmUgb2YgYHNldGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBzZXQgVGhlIHNldCB0byBjbG9uZS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNsb25lRnVuYyBUaGUgZnVuY3Rpb24gdG8gY2xvbmUgdmFsdWVzLlxuICogQHBhcmFtIHtib29sZWFufSBbaXNEZWVwXSBTcGVjaWZ5IGEgZGVlcCBjbG9uZS5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIGNsb25lZCBzZXQuXG4gKi9cbmZ1bmN0aW9uIGNsb25lU2V0KHNldCwgaXNEZWVwLCBjbG9uZUZ1bmMpIHtcbiAgdmFyIGFycmF5ID0gaXNEZWVwID8gY2xvbmVGdW5jKHNldFRvQXJyYXkoc2V0KSwgQ0xPTkVfREVFUF9GTEFHKSA6IHNldFRvQXJyYXkoc2V0KTtcbiAgcmV0dXJuIGFycmF5UmVkdWNlKGFycmF5LCBhZGRTZXRFbnRyeSwgbmV3IHNldC5jb25zdHJ1Y3Rvcik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY2xvbmVTZXQ7XG4iLCJ2YXIgU3ltYm9sID0gcmVxdWlyZSgnLi9fU3ltYm9sJyk7XG5cbi8qKiBVc2VkIHRvIGNvbnZlcnQgc3ltYm9scyB0byBwcmltaXRpdmVzIGFuZCBzdHJpbmdzLiAqL1xudmFyIHN5bWJvbFByb3RvID0gU3ltYm9sID8gU3ltYm9sLnByb3RvdHlwZSA6IHVuZGVmaW5lZCxcbiAgICBzeW1ib2xWYWx1ZU9mID0gc3ltYm9sUHJvdG8gPyBzeW1ib2xQcm90by52YWx1ZU9mIDogdW5kZWZpbmVkO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBjbG9uZSBvZiB0aGUgYHN5bWJvbGAgb2JqZWN0LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gc3ltYm9sIFRoZSBzeW1ib2wgb2JqZWN0IHRvIGNsb25lLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgY2xvbmVkIHN5bWJvbCBvYmplY3QuXG4gKi9cbmZ1bmN0aW9uIGNsb25lU3ltYm9sKHN5bWJvbCkge1xuICByZXR1cm4gc3ltYm9sVmFsdWVPZiA/IE9iamVjdChzeW1ib2xWYWx1ZU9mLmNhbGwoc3ltYm9sKSkgOiB7fTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjbG9uZVN5bWJvbDtcbiIsInZhciBjbG9uZUFycmF5QnVmZmVyID0gcmVxdWlyZSgnLi9fY2xvbmVBcnJheUJ1ZmZlcicpO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBjbG9uZSBvZiBgdHlwZWRBcnJheWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSB0eXBlZEFycmF5IFRoZSB0eXBlZCBhcnJheSB0byBjbG9uZS5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzRGVlcF0gU3BlY2lmeSBhIGRlZXAgY2xvbmUuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBjbG9uZWQgdHlwZWQgYXJyYXkuXG4gKi9cbmZ1bmN0aW9uIGNsb25lVHlwZWRBcnJheSh0eXBlZEFycmF5LCBpc0RlZXApIHtcbiAgdmFyIGJ1ZmZlciA9IGlzRGVlcCA/IGNsb25lQXJyYXlCdWZmZXIodHlwZWRBcnJheS5idWZmZXIpIDogdHlwZWRBcnJheS5idWZmZXI7XG4gIHJldHVybiBuZXcgdHlwZWRBcnJheS5jb25zdHJ1Y3RvcihidWZmZXIsIHR5cGVkQXJyYXkuYnl0ZU9mZnNldCwgdHlwZWRBcnJheS5sZW5ndGgpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsb25lVHlwZWRBcnJheTtcbiIsInZhciBjbG9uZUFycmF5QnVmZmVyID0gcmVxdWlyZSgnLi9fY2xvbmVBcnJheUJ1ZmZlcicpLFxuICAgIGNsb25lRGF0YVZpZXcgPSByZXF1aXJlKCcuL19jbG9uZURhdGFWaWV3JyksXG4gICAgY2xvbmVNYXAgPSByZXF1aXJlKCcuL19jbG9uZU1hcCcpLFxuICAgIGNsb25lUmVnRXhwID0gcmVxdWlyZSgnLi9fY2xvbmVSZWdFeHAnKSxcbiAgICBjbG9uZVNldCA9IHJlcXVpcmUoJy4vX2Nsb25lU2V0JyksXG4gICAgY2xvbmVTeW1ib2wgPSByZXF1aXJlKCcuL19jbG9uZVN5bWJvbCcpLFxuICAgIGNsb25lVHlwZWRBcnJheSA9IHJlcXVpcmUoJy4vX2Nsb25lVHlwZWRBcnJheScpO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgYm9vbFRhZyA9ICdbb2JqZWN0IEJvb2xlYW5dJyxcbiAgICBkYXRlVGFnID0gJ1tvYmplY3QgRGF0ZV0nLFxuICAgIG1hcFRhZyA9ICdbb2JqZWN0IE1hcF0nLFxuICAgIG51bWJlclRhZyA9ICdbb2JqZWN0IE51bWJlcl0nLFxuICAgIHJlZ2V4cFRhZyA9ICdbb2JqZWN0IFJlZ0V4cF0nLFxuICAgIHNldFRhZyA9ICdbb2JqZWN0IFNldF0nLFxuICAgIHN0cmluZ1RhZyA9ICdbb2JqZWN0IFN0cmluZ10nLFxuICAgIHN5bWJvbFRhZyA9ICdbb2JqZWN0IFN5bWJvbF0nO1xuXG52YXIgYXJyYXlCdWZmZXJUYWcgPSAnW29iamVjdCBBcnJheUJ1ZmZlcl0nLFxuICAgIGRhdGFWaWV3VGFnID0gJ1tvYmplY3QgRGF0YVZpZXddJyxcbiAgICBmbG9hdDMyVGFnID0gJ1tvYmplY3QgRmxvYXQzMkFycmF5XScsXG4gICAgZmxvYXQ2NFRhZyA9ICdbb2JqZWN0IEZsb2F0NjRBcnJheV0nLFxuICAgIGludDhUYWcgPSAnW29iamVjdCBJbnQ4QXJyYXldJyxcbiAgICBpbnQxNlRhZyA9ICdbb2JqZWN0IEludDE2QXJyYXldJyxcbiAgICBpbnQzMlRhZyA9ICdbb2JqZWN0IEludDMyQXJyYXldJyxcbiAgICB1aW50OFRhZyA9ICdbb2JqZWN0IFVpbnQ4QXJyYXldJyxcbiAgICB1aW50OENsYW1wZWRUYWcgPSAnW29iamVjdCBVaW50OENsYW1wZWRBcnJheV0nLFxuICAgIHVpbnQxNlRhZyA9ICdbb2JqZWN0IFVpbnQxNkFycmF5XScsXG4gICAgdWludDMyVGFnID0gJ1tvYmplY3QgVWludDMyQXJyYXldJztcblxuLyoqXG4gKiBJbml0aWFsaXplcyBhbiBvYmplY3QgY2xvbmUgYmFzZWQgb24gaXRzIGB0b1N0cmluZ1RhZ2AuXG4gKlxuICogKipOb3RlOioqIFRoaXMgZnVuY3Rpb24gb25seSBzdXBwb3J0cyBjbG9uaW5nIHZhbHVlcyB3aXRoIHRhZ3Mgb2ZcbiAqIGBCb29sZWFuYCwgYERhdGVgLCBgRXJyb3JgLCBgTnVtYmVyYCwgYFJlZ0V4cGAsIG9yIGBTdHJpbmdgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gY2xvbmUuXG4gKiBAcGFyYW0ge3N0cmluZ30gdGFnIFRoZSBgdG9TdHJpbmdUYWdgIG9mIHRoZSBvYmplY3QgdG8gY2xvbmUuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjbG9uZUZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGNsb25lIHZhbHVlcy5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzRGVlcF0gU3BlY2lmeSBhIGRlZXAgY2xvbmUuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBpbml0aWFsaXplZCBjbG9uZS5cbiAqL1xuZnVuY3Rpb24gaW5pdENsb25lQnlUYWcob2JqZWN0LCB0YWcsIGNsb25lRnVuYywgaXNEZWVwKSB7XG4gIHZhciBDdG9yID0gb2JqZWN0LmNvbnN0cnVjdG9yO1xuICBzd2l0Y2ggKHRhZykge1xuICAgIGNhc2UgYXJyYXlCdWZmZXJUYWc6XG4gICAgICByZXR1cm4gY2xvbmVBcnJheUJ1ZmZlcihvYmplY3QpO1xuXG4gICAgY2FzZSBib29sVGFnOlxuICAgIGNhc2UgZGF0ZVRhZzpcbiAgICAgIHJldHVybiBuZXcgQ3Rvcigrb2JqZWN0KTtcblxuICAgIGNhc2UgZGF0YVZpZXdUYWc6XG4gICAgICByZXR1cm4gY2xvbmVEYXRhVmlldyhvYmplY3QsIGlzRGVlcCk7XG5cbiAgICBjYXNlIGZsb2F0MzJUYWc6IGNhc2UgZmxvYXQ2NFRhZzpcbiAgICBjYXNlIGludDhUYWc6IGNhc2UgaW50MTZUYWc6IGNhc2UgaW50MzJUYWc6XG4gICAgY2FzZSB1aW50OFRhZzogY2FzZSB1aW50OENsYW1wZWRUYWc6IGNhc2UgdWludDE2VGFnOiBjYXNlIHVpbnQzMlRhZzpcbiAgICAgIHJldHVybiBjbG9uZVR5cGVkQXJyYXkob2JqZWN0LCBpc0RlZXApO1xuXG4gICAgY2FzZSBtYXBUYWc6XG4gICAgICByZXR1cm4gY2xvbmVNYXAob2JqZWN0LCBpc0RlZXAsIGNsb25lRnVuYyk7XG5cbiAgICBjYXNlIG51bWJlclRhZzpcbiAgICBjYXNlIHN0cmluZ1RhZzpcbiAgICAgIHJldHVybiBuZXcgQ3RvcihvYmplY3QpO1xuXG4gICAgY2FzZSByZWdleHBUYWc6XG4gICAgICByZXR1cm4gY2xvbmVSZWdFeHAob2JqZWN0KTtcblxuICAgIGNhc2Ugc2V0VGFnOlxuICAgICAgcmV0dXJuIGNsb25lU2V0KG9iamVjdCwgaXNEZWVwLCBjbG9uZUZ1bmMpO1xuXG4gICAgY2FzZSBzeW1ib2xUYWc6XG4gICAgICByZXR1cm4gY2xvbmVTeW1ib2wob2JqZWN0KTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGluaXRDbG9uZUJ5VGFnO1xuIiwidmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9pc09iamVjdCcpO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RDcmVhdGUgPSBPYmplY3QuY3JlYXRlO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmNyZWF0ZWAgd2l0aG91dCBzdXBwb3J0IGZvciBhc3NpZ25pbmdcbiAqIHByb3BlcnRpZXMgdG8gdGhlIGNyZWF0ZWQgb2JqZWN0LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gcHJvdG8gVGhlIG9iamVjdCB0byBpbmhlcml0IGZyb20uXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBuZXcgb2JqZWN0LlxuICovXG52YXIgYmFzZUNyZWF0ZSA9IChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gb2JqZWN0KCkge31cbiAgcmV0dXJuIGZ1bmN0aW9uKHByb3RvKSB7XG4gICAgaWYgKCFpc09iamVjdChwcm90bykpIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gICAgaWYgKG9iamVjdENyZWF0ZSkge1xuICAgICAgcmV0dXJuIG9iamVjdENyZWF0ZShwcm90byk7XG4gICAgfVxuICAgIG9iamVjdC5wcm90b3R5cGUgPSBwcm90bztcbiAgICB2YXIgcmVzdWx0ID0gbmV3IG9iamVjdDtcbiAgICBvYmplY3QucHJvdG90eXBlID0gdW5kZWZpbmVkO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG59KCkpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VDcmVhdGU7XG4iLCJ2YXIgYmFzZUNyZWF0ZSA9IHJlcXVpcmUoJy4vX2Jhc2VDcmVhdGUnKSxcbiAgICBnZXRQcm90b3R5cGUgPSByZXF1aXJlKCcuL19nZXRQcm90b3R5cGUnKSxcbiAgICBpc1Byb3RvdHlwZSA9IHJlcXVpcmUoJy4vX2lzUHJvdG90eXBlJyk7XG5cbi8qKlxuICogSW5pdGlhbGl6ZXMgYW4gb2JqZWN0IGNsb25lLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gY2xvbmUuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBpbml0aWFsaXplZCBjbG9uZS5cbiAqL1xuZnVuY3Rpb24gaW5pdENsb25lT2JqZWN0KG9iamVjdCkge1xuICByZXR1cm4gKHR5cGVvZiBvYmplY3QuY29uc3RydWN0b3IgPT0gJ2Z1bmN0aW9uJyAmJiAhaXNQcm90b3R5cGUob2JqZWN0KSlcbiAgICA/IGJhc2VDcmVhdGUoZ2V0UHJvdG90eXBlKG9iamVjdCkpXG4gICAgOiB7fTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpbml0Q2xvbmVPYmplY3Q7XG4iLCJ2YXIgU3RhY2sgPSByZXF1aXJlKCcuL19TdGFjaycpLFxuICAgIGFycmF5RWFjaCA9IHJlcXVpcmUoJy4vX2FycmF5RWFjaCcpLFxuICAgIGFzc2lnblZhbHVlID0gcmVxdWlyZSgnLi9fYXNzaWduVmFsdWUnKSxcbiAgICBiYXNlQXNzaWduID0gcmVxdWlyZSgnLi9fYmFzZUFzc2lnbicpLFxuICAgIGJhc2VBc3NpZ25JbiA9IHJlcXVpcmUoJy4vX2Jhc2VBc3NpZ25JbicpLFxuICAgIGNsb25lQnVmZmVyID0gcmVxdWlyZSgnLi9fY2xvbmVCdWZmZXInKSxcbiAgICBjb3B5QXJyYXkgPSByZXF1aXJlKCcuL19jb3B5QXJyYXknKSxcbiAgICBjb3B5U3ltYm9scyA9IHJlcXVpcmUoJy4vX2NvcHlTeW1ib2xzJyksXG4gICAgY29weVN5bWJvbHNJbiA9IHJlcXVpcmUoJy4vX2NvcHlTeW1ib2xzSW4nKSxcbiAgICBnZXRBbGxLZXlzID0gcmVxdWlyZSgnLi9fZ2V0QWxsS2V5cycpLFxuICAgIGdldEFsbEtleXNJbiA9IHJlcXVpcmUoJy4vX2dldEFsbEtleXNJbicpLFxuICAgIGdldFRhZyA9IHJlcXVpcmUoJy4vX2dldFRhZycpLFxuICAgIGluaXRDbG9uZUFycmF5ID0gcmVxdWlyZSgnLi9faW5pdENsb25lQXJyYXknKSxcbiAgICBpbml0Q2xvbmVCeVRhZyA9IHJlcXVpcmUoJy4vX2luaXRDbG9uZUJ5VGFnJyksXG4gICAgaW5pdENsb25lT2JqZWN0ID0gcmVxdWlyZSgnLi9faW5pdENsb25lT2JqZWN0JyksXG4gICAgaXNBcnJheSA9IHJlcXVpcmUoJy4vaXNBcnJheScpLFxuICAgIGlzQnVmZmVyID0gcmVxdWlyZSgnLi9pc0J1ZmZlcicpLFxuICAgIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9pc09iamVjdCcpLFxuICAgIGtleXMgPSByZXF1aXJlKCcuL2tleXMnKTtcblxuLyoqIFVzZWQgdG8gY29tcG9zZSBiaXRtYXNrcyBmb3IgY2xvbmluZy4gKi9cbnZhciBDTE9ORV9ERUVQX0ZMQUcgPSAxLFxuICAgIENMT05FX0ZMQVRfRkxBRyA9IDIsXG4gICAgQ0xPTkVfU1lNQk9MU19GTEFHID0gNDtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIGFyZ3NUYWcgPSAnW29iamVjdCBBcmd1bWVudHNdJyxcbiAgICBhcnJheVRhZyA9ICdbb2JqZWN0IEFycmF5XScsXG4gICAgYm9vbFRhZyA9ICdbb2JqZWN0IEJvb2xlYW5dJyxcbiAgICBkYXRlVGFnID0gJ1tvYmplY3QgRGF0ZV0nLFxuICAgIGVycm9yVGFnID0gJ1tvYmplY3QgRXJyb3JdJyxcbiAgICBmdW5jVGFnID0gJ1tvYmplY3QgRnVuY3Rpb25dJyxcbiAgICBnZW5UYWcgPSAnW29iamVjdCBHZW5lcmF0b3JGdW5jdGlvbl0nLFxuICAgIG1hcFRhZyA9ICdbb2JqZWN0IE1hcF0nLFxuICAgIG51bWJlclRhZyA9ICdbb2JqZWN0IE51bWJlcl0nLFxuICAgIG9iamVjdFRhZyA9ICdbb2JqZWN0IE9iamVjdF0nLFxuICAgIHJlZ2V4cFRhZyA9ICdbb2JqZWN0IFJlZ0V4cF0nLFxuICAgIHNldFRhZyA9ICdbb2JqZWN0IFNldF0nLFxuICAgIHN0cmluZ1RhZyA9ICdbb2JqZWN0IFN0cmluZ10nLFxuICAgIHN5bWJvbFRhZyA9ICdbb2JqZWN0IFN5bWJvbF0nLFxuICAgIHdlYWtNYXBUYWcgPSAnW29iamVjdCBXZWFrTWFwXSc7XG5cbnZhciBhcnJheUJ1ZmZlclRhZyA9ICdbb2JqZWN0IEFycmF5QnVmZmVyXScsXG4gICAgZGF0YVZpZXdUYWcgPSAnW29iamVjdCBEYXRhVmlld10nLFxuICAgIGZsb2F0MzJUYWcgPSAnW29iamVjdCBGbG9hdDMyQXJyYXldJyxcbiAgICBmbG9hdDY0VGFnID0gJ1tvYmplY3QgRmxvYXQ2NEFycmF5XScsXG4gICAgaW50OFRhZyA9ICdbb2JqZWN0IEludDhBcnJheV0nLFxuICAgIGludDE2VGFnID0gJ1tvYmplY3QgSW50MTZBcnJheV0nLFxuICAgIGludDMyVGFnID0gJ1tvYmplY3QgSW50MzJBcnJheV0nLFxuICAgIHVpbnQ4VGFnID0gJ1tvYmplY3QgVWludDhBcnJheV0nLFxuICAgIHVpbnQ4Q2xhbXBlZFRhZyA9ICdbb2JqZWN0IFVpbnQ4Q2xhbXBlZEFycmF5XScsXG4gICAgdWludDE2VGFnID0gJ1tvYmplY3QgVWludDE2QXJyYXldJyxcbiAgICB1aW50MzJUYWcgPSAnW29iamVjdCBVaW50MzJBcnJheV0nO1xuXG4vKiogVXNlZCB0byBpZGVudGlmeSBgdG9TdHJpbmdUYWdgIHZhbHVlcyBzdXBwb3J0ZWQgYnkgYF8uY2xvbmVgLiAqL1xudmFyIGNsb25lYWJsZVRhZ3MgPSB7fTtcbmNsb25lYWJsZVRhZ3NbYXJnc1RhZ10gPSBjbG9uZWFibGVUYWdzW2FycmF5VGFnXSA9XG5jbG9uZWFibGVUYWdzW2FycmF5QnVmZmVyVGFnXSA9IGNsb25lYWJsZVRhZ3NbZGF0YVZpZXdUYWddID1cbmNsb25lYWJsZVRhZ3NbYm9vbFRhZ10gPSBjbG9uZWFibGVUYWdzW2RhdGVUYWddID1cbmNsb25lYWJsZVRhZ3NbZmxvYXQzMlRhZ10gPSBjbG9uZWFibGVUYWdzW2Zsb2F0NjRUYWddID1cbmNsb25lYWJsZVRhZ3NbaW50OFRhZ10gPSBjbG9uZWFibGVUYWdzW2ludDE2VGFnXSA9XG5jbG9uZWFibGVUYWdzW2ludDMyVGFnXSA9IGNsb25lYWJsZVRhZ3NbbWFwVGFnXSA9XG5jbG9uZWFibGVUYWdzW251bWJlclRhZ10gPSBjbG9uZWFibGVUYWdzW29iamVjdFRhZ10gPVxuY2xvbmVhYmxlVGFnc1tyZWdleHBUYWddID0gY2xvbmVhYmxlVGFnc1tzZXRUYWddID1cbmNsb25lYWJsZVRhZ3Nbc3RyaW5nVGFnXSA9IGNsb25lYWJsZVRhZ3Nbc3ltYm9sVGFnXSA9XG5jbG9uZWFibGVUYWdzW3VpbnQ4VGFnXSA9IGNsb25lYWJsZVRhZ3NbdWludDhDbGFtcGVkVGFnXSA9XG5jbG9uZWFibGVUYWdzW3VpbnQxNlRhZ10gPSBjbG9uZWFibGVUYWdzW3VpbnQzMlRhZ10gPSB0cnVlO1xuY2xvbmVhYmxlVGFnc1tlcnJvclRhZ10gPSBjbG9uZWFibGVUYWdzW2Z1bmNUYWddID1cbmNsb25lYWJsZVRhZ3Nbd2Vha01hcFRhZ10gPSBmYWxzZTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5jbG9uZWAgYW5kIGBfLmNsb25lRGVlcGAgd2hpY2ggdHJhY2tzXG4gKiB0cmF2ZXJzZWQgb2JqZWN0cy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2xvbmUuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGJpdG1hc2sgVGhlIGJpdG1hc2sgZmxhZ3MuXG4gKiAgMSAtIERlZXAgY2xvbmVcbiAqICAyIC0gRmxhdHRlbiBpbmhlcml0ZWQgcHJvcGVydGllc1xuICogIDQgLSBDbG9uZSBzeW1ib2xzXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY3VzdG9taXplcl0gVGhlIGZ1bmN0aW9uIHRvIGN1c3RvbWl6ZSBjbG9uaW5nLlxuICogQHBhcmFtIHtzdHJpbmd9IFtrZXldIFRoZSBrZXkgb2YgYHZhbHVlYC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb2JqZWN0XSBUaGUgcGFyZW50IG9iamVjdCBvZiBgdmFsdWVgLlxuICogQHBhcmFtIHtPYmplY3R9IFtzdGFja10gVHJhY2tzIHRyYXZlcnNlZCBvYmplY3RzIGFuZCB0aGVpciBjbG9uZSBjb3VudGVycGFydHMuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgY2xvbmVkIHZhbHVlLlxuICovXG5mdW5jdGlvbiBiYXNlQ2xvbmUodmFsdWUsIGJpdG1hc2ssIGN1c3RvbWl6ZXIsIGtleSwgb2JqZWN0LCBzdGFjaykge1xuICB2YXIgcmVzdWx0LFxuICAgICAgaXNEZWVwID0gYml0bWFzayAmIENMT05FX0RFRVBfRkxBRyxcbiAgICAgIGlzRmxhdCA9IGJpdG1hc2sgJiBDTE9ORV9GTEFUX0ZMQUcsXG4gICAgICBpc0Z1bGwgPSBiaXRtYXNrICYgQ0xPTkVfU1lNQk9MU19GTEFHO1xuXG4gIGlmIChjdXN0b21pemVyKSB7XG4gICAgcmVzdWx0ID0gb2JqZWN0ID8gY3VzdG9taXplcih2YWx1ZSwga2V5LCBvYmplY3QsIHN0YWNrKSA6IGN1c3RvbWl6ZXIodmFsdWUpO1xuICB9XG4gIGlmIChyZXN1bHQgIT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgaWYgKCFpc09iamVjdCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgdmFyIGlzQXJyID0gaXNBcnJheSh2YWx1ZSk7XG4gIGlmIChpc0Fycikge1xuICAgIHJlc3VsdCA9IGluaXRDbG9uZUFycmF5KHZhbHVlKTtcbiAgICBpZiAoIWlzRGVlcCkge1xuICAgICAgcmV0dXJuIGNvcHlBcnJheSh2YWx1ZSwgcmVzdWx0KTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdmFyIHRhZyA9IGdldFRhZyh2YWx1ZSksXG4gICAgICAgIGlzRnVuYyA9IHRhZyA9PSBmdW5jVGFnIHx8IHRhZyA9PSBnZW5UYWc7XG5cbiAgICBpZiAoaXNCdWZmZXIodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY2xvbmVCdWZmZXIodmFsdWUsIGlzRGVlcCk7XG4gICAgfVxuICAgIGlmICh0YWcgPT0gb2JqZWN0VGFnIHx8IHRhZyA9PSBhcmdzVGFnIHx8IChpc0Z1bmMgJiYgIW9iamVjdCkpIHtcbiAgICAgIHJlc3VsdCA9IChpc0ZsYXQgfHwgaXNGdW5jKSA/IHt9IDogaW5pdENsb25lT2JqZWN0KHZhbHVlKTtcbiAgICAgIGlmICghaXNEZWVwKSB7XG4gICAgICAgIHJldHVybiBpc0ZsYXRcbiAgICAgICAgICA/IGNvcHlTeW1ib2xzSW4odmFsdWUsIGJhc2VBc3NpZ25JbihyZXN1bHQsIHZhbHVlKSlcbiAgICAgICAgICA6IGNvcHlTeW1ib2xzKHZhbHVlLCBiYXNlQXNzaWduKHJlc3VsdCwgdmFsdWUpKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCFjbG9uZWFibGVUYWdzW3RhZ10pIHtcbiAgICAgICAgcmV0dXJuIG9iamVjdCA/IHZhbHVlIDoge307XG4gICAgICB9XG4gICAgICByZXN1bHQgPSBpbml0Q2xvbmVCeVRhZyh2YWx1ZSwgdGFnLCBiYXNlQ2xvbmUsIGlzRGVlcCk7XG4gICAgfVxuICB9XG4gIC8vIENoZWNrIGZvciBjaXJjdWxhciByZWZlcmVuY2VzIGFuZCByZXR1cm4gaXRzIGNvcnJlc3BvbmRpbmcgY2xvbmUuXG4gIHN0YWNrIHx8IChzdGFjayA9IG5ldyBTdGFjayk7XG4gIHZhciBzdGFja2VkID0gc3RhY2suZ2V0KHZhbHVlKTtcbiAgaWYgKHN0YWNrZWQpIHtcbiAgICByZXR1cm4gc3RhY2tlZDtcbiAgfVxuICBzdGFjay5zZXQodmFsdWUsIHJlc3VsdCk7XG5cbiAgdmFyIGtleXNGdW5jID0gaXNGdWxsXG4gICAgPyAoaXNGbGF0ID8gZ2V0QWxsS2V5c0luIDogZ2V0QWxsS2V5cylcbiAgICA6IChpc0ZsYXQgPyBrZXlzSW4gOiBrZXlzKTtcblxuICB2YXIgcHJvcHMgPSBpc0FyciA/IHVuZGVmaW5lZCA6IGtleXNGdW5jKHZhbHVlKTtcbiAgYXJyYXlFYWNoKHByb3BzIHx8IHZhbHVlLCBmdW5jdGlvbihzdWJWYWx1ZSwga2V5KSB7XG4gICAgaWYgKHByb3BzKSB7XG4gICAgICBrZXkgPSBzdWJWYWx1ZTtcbiAgICAgIHN1YlZhbHVlID0gdmFsdWVba2V5XTtcbiAgICB9XG4gICAgLy8gUmVjdXJzaXZlbHkgcG9wdWxhdGUgY2xvbmUgKHN1c2NlcHRpYmxlIHRvIGNhbGwgc3RhY2sgbGltaXRzKS5cbiAgICBhc3NpZ25WYWx1ZShyZXN1bHQsIGtleSwgYmFzZUNsb25lKHN1YlZhbHVlLCBiaXRtYXNrLCBjdXN0b21pemVyLCBrZXksIHZhbHVlLCBzdGFjaykpO1xuICB9KTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlQ2xvbmU7XG4iLCJ2YXIgYmFzZUNsb25lID0gcmVxdWlyZSgnLi9fYmFzZUNsb25lJyk7XG5cbi8qKiBVc2VkIHRvIGNvbXBvc2UgYml0bWFza3MgZm9yIGNsb25pbmcuICovXG52YXIgQ0xPTkVfREVFUF9GTEFHID0gMSxcbiAgICBDTE9ORV9TWU1CT0xTX0ZMQUcgPSA0O1xuXG4vKipcbiAqIFRoaXMgbWV0aG9kIGlzIGxpa2UgYF8uY2xvbmVgIGV4Y2VwdCB0aGF0IGl0IHJlY3Vyc2l2ZWx5IGNsb25lcyBgdmFsdWVgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMS4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byByZWN1cnNpdmVseSBjbG9uZS5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBkZWVwIGNsb25lZCB2YWx1ZS5cbiAqIEBzZWUgXy5jbG9uZVxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgb2JqZWN0cyA9IFt7ICdhJzogMSB9LCB7ICdiJzogMiB9XTtcbiAqXG4gKiB2YXIgZGVlcCA9IF8uY2xvbmVEZWVwKG9iamVjdHMpO1xuICogY29uc29sZS5sb2coZGVlcFswXSA9PT0gb2JqZWN0c1swXSk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBjbG9uZURlZXAodmFsdWUpIHtcbiAgcmV0dXJuIGJhc2VDbG9uZSh2YWx1ZSwgQ0xPTkVfREVFUF9GTEFHIHwgQ0xPTkVfU1lNQk9MU19GTEFHKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjbG9uZURlZXA7XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgVnVlIGZyb20gJ3Z1ZSdcbmltcG9ydCBjbG9uZURlZXAgZnJvbSAnbG9kYXNoL2Nsb25lRGVlcCdcbmltcG9ydCBlcnJvckhhbmRsZXIgZnJvbSAnLi9lcnJvci1oYW5kbGVyJ1xuXG5mdW5jdGlvbiBjcmVhdGVMb2NhbFZ1ZSAoX1Z1ZTogQ29tcG9uZW50ID0gVnVlKTogQ29tcG9uZW50IHtcbiAgY29uc3QgaW5zdGFuY2UgPSBfVnVlLmV4dGVuZCgpXG5cbiAgLy8gY2xvbmUgZ2xvYmFsIEFQSXNcbiAgT2JqZWN0LmtleXMoX1Z1ZSkuZm9yRWFjaChrZXkgPT4ge1xuICAgIGlmICghaW5zdGFuY2UuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgY29uc3Qgb3JpZ2luYWwgPSBfVnVlW2tleV1cbiAgICAgIC8vIGNsb25lRGVlcCBjYW4gZmFpbCB3aGVuIGNsb25pbmcgVnVlIGluc3RhbmNlc1xuICAgICAgLy8gY2xvbmVEZWVwIGNoZWNrcyB0aGF0IHRoZSBpbnN0YW5jZSBoYXMgYSBTeW1ib2xcbiAgICAgIC8vIHdoaWNoIGVycm9ycyBpbiBWdWUgPCAyLjE3IChodHRwczovL2dpdGh1Yi5jb20vdnVlanMvdnVlL3B1bGwvNzg3OClcbiAgICAgIHRyeSB7XG4gICAgICAgIGluc3RhbmNlW2tleV0gPSB0eXBlb2Ygb3JpZ2luYWwgPT09ICdvYmplY3QnXG4gICAgICAgICAgPyBjbG9uZURlZXAob3JpZ2luYWwpXG4gICAgICAgICAgOiBvcmlnaW5hbFxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBpbnN0YW5jZVtrZXldID0gb3JpZ2luYWxcbiAgICAgIH1cbiAgICB9XG4gIH0pXG5cbiAgLy8gY29uZmlnIGlzIG5vdCBlbnVtZXJhYmxlXG4gIGluc3RhbmNlLmNvbmZpZyA9IGNsb25lRGVlcChWdWUuY29uZmlnKVxuXG4gIGluc3RhbmNlLmNvbmZpZy5lcnJvckhhbmRsZXIgPSBlcnJvckhhbmRsZXJcblxuICAvLyBvcHRpb24gbWVyZ2Ugc3RyYXRlZ2llcyBuZWVkIHRvIGJlIGV4cG9zZWQgYnkgcmVmZXJlbmNlXG4gIC8vIHNvIHRoYXQgbWVyZ2Ugc3RyYXRzIHJlZ2lzdGVyZWQgYnkgcGx1Z2lucyBjYW4gd29yayBwcm9wZXJseVxuICBpbnN0YW5jZS5jb25maWcub3B0aW9uTWVyZ2VTdHJhdGVnaWVzID0gVnVlLmNvbmZpZy5vcHRpb25NZXJnZVN0cmF0ZWdpZXNcblxuICAvLyBtYWtlIHN1cmUgYWxsIGV4dGVuZHMgYXJlIGJhc2VkIG9uIHRoaXMgaW5zdGFuY2UuXG4gIC8vIHRoaXMgaXMgaW1wb3J0YW50IHNvIHRoYXQgZ2xvYmFsIGNvbXBvbmVudHMgcmVnaXN0ZXJlZCBieSBwbHVnaW5zLFxuICAvLyBlLmcuIHJvdXRlci1saW5rIGFyZSBjcmVhdGVkIHVzaW5nIHRoZSBjb3JyZWN0IGJhc2UgY29uc3RydWN0b3JcbiAgaW5zdGFuY2Uub3B0aW9ucy5fYmFzZSA9IGluc3RhbmNlXG5cbiAgLy8gY29tcGF0IGZvciB2dWUtcm91dGVyIDwgMi43LjEgd2hlcmUgaXQgZG9lcyBub3QgYWxsb3cgbXVsdGlwbGUgaW5zdGFsbHNcbiAgaWYgKGluc3RhbmNlLl9pbnN0YWxsZWRQbHVnaW5zICYmIGluc3RhbmNlLl9pbnN0YWxsZWRQbHVnaW5zLmxlbmd0aCkge1xuICAgIGluc3RhbmNlLl9pbnN0YWxsZWRQbHVnaW5zLmxlbmd0aCA9IDBcbiAgfVxuICBjb25zdCB1c2UgPSBpbnN0YW5jZS51c2VcbiAgaW5zdGFuY2UudXNlID0gKHBsdWdpbiwgLi4ucmVzdCkgPT4ge1xuICAgIGlmIChwbHVnaW4uaW5zdGFsbGVkID09PSB0cnVlKSB7XG4gICAgICBwbHVnaW4uaW5zdGFsbGVkID0gZmFsc2VcbiAgICB9XG4gICAgaWYgKHBsdWdpbi5pbnN0YWxsICYmIHBsdWdpbi5pbnN0YWxsLmluc3RhbGxlZCA9PT0gdHJ1ZSkge1xuICAgICAgcGx1Z2luLmluc3RhbGwuaW5zdGFsbGVkID0gZmFsc2VcbiAgICB9XG4gICAgdXNlLmNhbGwoaW5zdGFuY2UsIHBsdWdpbiwgLi4ucmVzdClcbiAgfVxuICByZXR1cm4gaW5zdGFuY2Vcbn1cblxuZXhwb3J0IGRlZmF1bHQgY3JlYXRlTG9jYWxWdWVcbiIsIi8vIEBmbG93XG5cbmltcG9ydCAnLi9tYXRjaGVzLXBvbHlmaWxsJ1xuaW1wb3J0ICcuL29iamVjdC1hc3NpZ24tcG9seWZpbGwnXG5pbXBvcnQgVnVlIGZyb20gJ3Z1ZSdcbmltcG9ydCBWdWVXcmFwcGVyIGZyb20gJy4vdnVlLXdyYXBwZXInXG5pbXBvcnQgY3JlYXRlSW5zdGFuY2UgZnJvbSAnY3JlYXRlLWluc3RhbmNlJ1xuaW1wb3J0IGNyZWF0ZUVsZW1lbnQgZnJvbSAnLi9jcmVhdGUtZWxlbWVudCdcbmltcG9ydCBlcnJvckhhbmRsZXIgZnJvbSAnLi9lcnJvci1oYW5kbGVyJ1xuaW1wb3J0IHsgZmluZEFsbEluc3RhbmNlcyB9IGZyb20gJy4vZmluZCdcbmltcG9ydCB7IG1lcmdlT3B0aW9ucyB9IGZyb20gJ3NoYXJlZC9tZXJnZS1vcHRpb25zJ1xuaW1wb3J0IGNvbmZpZyBmcm9tICcuL2NvbmZpZydcbmltcG9ydCB3YXJuSWZOb1dpbmRvdyBmcm9tICcuL3dhcm4taWYtbm8td2luZG93J1xuaW1wb3J0IGNyZWF0ZVdyYXBwZXIgZnJvbSAnLi9jcmVhdGUtd3JhcHBlcidcbmltcG9ydCBjcmVhdGVMb2NhbFZ1ZSBmcm9tICcuL2NyZWF0ZS1sb2NhbC12dWUnXG5WdWUuY29uZmlnLnByb2R1Y3Rpb25UaXAgPSBmYWxzZVxuVnVlLmNvbmZpZy5kZXZ0b29scyA9IGZhbHNlXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG1vdW50IChcbiAgY29tcG9uZW50OiBDb21wb25lbnQsXG4gIG9wdGlvbnM6IE9wdGlvbnMgPSB7fVxuKTogVnVlV3JhcHBlciB8IFdyYXBwZXIge1xuICBjb25zdCBleGlzdGluZ0Vycm9ySGFuZGxlciA9IFZ1ZS5jb25maWcuZXJyb3JIYW5kbGVyXG4gIFZ1ZS5jb25maWcuZXJyb3JIYW5kbGVyID0gZXJyb3JIYW5kbGVyXG5cbiAgd2FybklmTm9XaW5kb3coKVxuXG4gIGNvbnN0IGVsbSA9IG9wdGlvbnMuYXR0YWNoVG9Eb2N1bWVudCA/IGNyZWF0ZUVsZW1lbnQoKSA6IHVuZGVmaW5lZFxuXG4gIGNvbnN0IG1lcmdlZE9wdGlvbnMgPSBtZXJnZU9wdGlvbnMob3B0aW9ucywgY29uZmlnKVxuXG4gIGNvbnN0IHBhcmVudFZtID0gY3JlYXRlSW5zdGFuY2UoXG4gICAgY29tcG9uZW50LFxuICAgIG1lcmdlZE9wdGlvbnMsXG4gICAgY3JlYXRlTG9jYWxWdWUob3B0aW9ucy5sb2NhbFZ1ZSlcbiAgKVxuXG4gIGNvbnN0IHZtID0gcGFyZW50Vm0uJG1vdW50KGVsbSkuJHJlZnMudm1cblxuICBjb25zdCBjb21wb25lbnRzV2l0aEVycm9yID0gZmluZEFsbEluc3RhbmNlcyh2bSkuZmlsdGVyKFxuICAgIGMgPT4gYy5fZXJyb3JcbiAgKVxuXG4gIGlmIChjb21wb25lbnRzV2l0aEVycm9yLmxlbmd0aCA+IDApIHtcbiAgICB0aHJvdyBjb21wb25lbnRzV2l0aEVycm9yWzBdLl9lcnJvclxuICB9XG5cbiAgVnVlLmNvbmZpZy5lcnJvckhhbmRsZXIgPSBleGlzdGluZ0Vycm9ySGFuZGxlclxuXG4gIGNvbnN0IHdyYXBwZXJPcHRpb25zID0ge1xuICAgIGF0dGFjaGVkVG9Eb2N1bWVudDogISFtZXJnZWRPcHRpb25zLmF0dGFjaFRvRG9jdW1lbnQsXG4gICAgc3luYzogbWVyZ2VkT3B0aW9ucy5zeW5jXG4gIH1cbiAgY29uc3Qgcm9vdCA9IHZtLiRvcHRpb25zLl9pc0Z1bmN0aW9uYWxDb250YWluZXJcbiAgICA/IHZtLl92bm9kZVxuICAgIDogdm1cblxuICBjb21wb25lbnQuX0N0b3IgPSBbXVxuXG4gIHJldHVybiBjcmVhdGVXcmFwcGVyKHJvb3QsIHdyYXBwZXJPcHRpb25zKVxufVxuIiwiLy8gQGZsb3dcblxuaW1wb3J0IG1vdW50IGZyb20gJy4vbW91bnQnXG5pbXBvcnQgdHlwZSBWdWVXcmFwcGVyIGZyb20gJy4vdnVlLXdyYXBwZXInXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHNoYWxsb3dNb3VudCAoXG4gIGNvbXBvbmVudDogQ29tcG9uZW50LFxuICBvcHRpb25zOiBPcHRpb25zID0ge31cbik6IFZ1ZVdyYXBwZXIge1xuICByZXR1cm4gbW91bnQoY29tcG9uZW50LCB7XG4gICAgLi4ub3B0aW9ucyxcbiAgICBzaG91bGRQcm94eTogdHJ1ZVxuICB9KVxufVxuIiwiLy8gQGZsb3dcbmNvbnN0IHRvVHlwZXM6IEFycmF5PEZ1bmN0aW9uPiA9IFtTdHJpbmcsIE9iamVjdF1cbmNvbnN0IGV2ZW50VHlwZXM6IEFycmF5PEZ1bmN0aW9uPiA9IFtTdHJpbmcsIEFycmF5XVxuXG5leHBvcnQgZGVmYXVsdCB7XG4gIG5hbWU6ICdSb3V0ZXJMaW5rU3R1YicsXG4gIHByb3BzOiB7XG4gICAgdG86IHtcbiAgICAgIHR5cGU6IHRvVHlwZXMsXG4gICAgICByZXF1aXJlZDogdHJ1ZVxuICAgIH0sXG4gICAgdGFnOiB7XG4gICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICBkZWZhdWx0OiAnYSdcbiAgICB9LFxuICAgIGV4YWN0OiBCb29sZWFuLFxuICAgIGFwcGVuZDogQm9vbGVhbixcbiAgICByZXBsYWNlOiBCb29sZWFuLFxuICAgIGFjdGl2ZUNsYXNzOiBTdHJpbmcsXG4gICAgZXhhY3RBY3RpdmVDbGFzczogU3RyaW5nLFxuICAgIGV2ZW50OiB7XG4gICAgICB0eXBlOiBldmVudFR5cGVzLFxuICAgICAgZGVmYXVsdDogJ2NsaWNrJ1xuICAgIH1cbiAgfSxcbiAgcmVuZGVyIChoOiBGdW5jdGlvbikge1xuICAgIHJldHVybiBoKHRoaXMudGFnLCB1bmRlZmluZWQsIHRoaXMuJHNsb3RzLmRlZmF1bHQpXG4gIH1cbn1cbiIsImltcG9ydCBzaGFsbG93TW91bnQgZnJvbSAnLi9zaGFsbG93LW1vdW50J1xuaW1wb3J0IG1vdW50IGZyb20gJy4vbW91bnQnXG5pbXBvcnQgY3JlYXRlTG9jYWxWdWUgZnJvbSAnLi9jcmVhdGUtbG9jYWwtdnVlJ1xuaW1wb3J0IFRyYW5zaXRpb25TdHViIGZyb20gJy4vY29tcG9uZW50cy9UcmFuc2l0aW9uU3R1YidcbmltcG9ydCBUcmFuc2l0aW9uR3JvdXBTdHViIGZyb20gJy4vY29tcG9uZW50cy9UcmFuc2l0aW9uR3JvdXBTdHViJ1xuaW1wb3J0IFJvdXRlckxpbmtTdHViIGZyb20gJy4vY29tcG9uZW50cy9Sb3V0ZXJMaW5rU3R1YidcbmltcG9ydCBjcmVhdGVXcmFwcGVyIGZyb20gJy4vY3JlYXRlLXdyYXBwZXInXG5pbXBvcnQgV3JhcHBlciBmcm9tICcuL3dyYXBwZXInXG5pbXBvcnQgV3JhcHBlckFycmF5IGZyb20gJy4vd3JhcHBlci1hcnJheSdcbmltcG9ydCBjb25maWcgZnJvbSAnLi9jb25maWcnXG5pbXBvcnQgeyB3YXJuIH0gZnJvbSAnc2hhcmVkL3V0aWwnXG5cbmZ1bmN0aW9uIHNoYWxsb3cgKGNvbXBvbmVudCwgb3B0aW9ucykge1xuICB3YXJuKFxuICAgIGBzaGFsbG93IGhhcyBiZWVuIHJlbmFtZWQgdG8gc2hhbGxvd01vdW50LiBzaGFsbG93IGAgK1xuICAgIGB3aWxsIGJlIHJlbW92ZWQgaW4gMS4wLjAsIHVzZSBzaGFsbG93TW91bnQgaW5zdGVhZGBcbiAgKVxuICByZXR1cm4gc2hhbGxvd01vdW50KGNvbXBvbmVudCwgb3B0aW9ucylcbn1cblxuZXhwb3J0IGRlZmF1bHQge1xuICBjcmVhdGVMb2NhbFZ1ZSxcbiAgY3JlYXRlV3JhcHBlcixcbiAgY29uZmlnLFxuICBtb3VudCxcbiAgc2hhbGxvdyxcbiAgc2hhbGxvd01vdW50LFxuICBUcmFuc2l0aW9uU3R1YixcbiAgVHJhbnNpdGlvbkdyb3VwU3R1YixcbiAgUm91dGVyTGlua1N0dWIsXG4gIFdyYXBwZXIsXG4gIFdyYXBwZXJBcnJheVxufVxuIl0sIm5hbWVzIjpbImNvbnN0IiwibGV0IiwiYXJndW1lbnRzIiwidGhpcyIsImV2ZW50VHlwZXMiLCJzdXBlciIsImNvbXBpbGVUb0Z1bmN0aW9ucyIsIiQkVnVlIiwicmVzb2x2ZUNvbXBvbmVudCIsImNvbXBvbmVudCIsInN0dWIiLCJlcSIsImFzc29jSW5kZXhPZiIsImxpc3RDYWNoZUNsZWFyIiwibGlzdENhY2hlRGVsZXRlIiwibGlzdENhY2hlR2V0IiwibGlzdENhY2hlSGFzIiwibGlzdENhY2hlU2V0IiwiTGlzdENhY2hlIiwiZ2xvYmFsIiwiZnJlZUdsb2JhbCIsInJvb3QiLCJoYXNPd25Qcm9wZXJ0eSIsIlN5bWJvbCIsIm9iamVjdFByb3RvIiwibmF0aXZlT2JqZWN0VG9TdHJpbmciLCJzeW1Ub1N0cmluZ1RhZyIsImdldFJhd1RhZyIsIm9iamVjdFRvU3RyaW5nIiwiaXNPYmplY3QiLCJiYXNlR2V0VGFnIiwiY29yZUpzRGF0YSIsImZ1bmNQcm90byIsImZ1bmNUb1N0cmluZyIsImlzTWFza2VkIiwiaXNGdW5jdGlvbiIsInRvU291cmNlIiwiZ2V0VmFsdWUiLCJiYXNlSXNOYXRpdmUiLCJnZXROYXRpdmUiLCJuYXRpdmVDcmVhdGUiLCJIQVNIX1VOREVGSU5FRCIsImhhc2hDbGVhciIsImhhc2hEZWxldGUiLCJoYXNoR2V0IiwiaGFzaEhhcyIsImhhc2hTZXQiLCJIYXNoIiwiTWFwIiwiaXNLZXlhYmxlIiwiZ2V0TWFwRGF0YSIsIm1hcENhY2hlQ2xlYXIiLCJtYXBDYWNoZURlbGV0ZSIsIm1hcENhY2hlR2V0IiwibWFwQ2FjaGVIYXMiLCJtYXBDYWNoZVNldCIsIk1hcENhY2hlIiwic3RhY2tDbGVhciIsInN0YWNrRGVsZXRlIiwic3RhY2tHZXQiLCJzdGFja0hhcyIsInN0YWNrU2V0IiwiZGVmaW5lUHJvcGVydHkiLCJiYXNlQXNzaWduVmFsdWUiLCJhc3NpZ25WYWx1ZSIsImlzT2JqZWN0TGlrZSIsImJhc2VJc0FyZ3VtZW50cyIsInN0dWJGYWxzZSIsIk1BWF9TQUZFX0lOVEVHRVIiLCJhcmdzVGFnIiwiZnVuY1RhZyIsImlzTGVuZ3RoIiwibm9kZVV0aWwiLCJiYXNlVW5hcnkiLCJiYXNlSXNUeXBlZEFycmF5IiwiaXNBcnJheSIsImlzQXJndW1lbnRzIiwiaXNCdWZmZXIiLCJpc1R5cGVkQXJyYXkiLCJiYXNlVGltZXMiLCJpc0luZGV4Iiwib3ZlckFyZyIsImlzUHJvdG90eXBlIiwibmF0aXZlS2V5cyIsImlzQXJyYXlMaWtlIiwiYXJyYXlMaWtlS2V5cyIsImJhc2VLZXlzIiwiY29weU9iamVjdCIsImtleXMiLCJuYXRpdmVLZXlzSW4iLCJrZXlzSW4iLCJiYXNlS2V5c0luIiwicHJvcGVydHlJc0VudW1lcmFibGUiLCJzdHViQXJyYXkiLCJhcnJheUZpbHRlciIsImdldFN5bWJvbHMiLCJuYXRpdmVHZXRTeW1ib2xzIiwiYXJyYXlQdXNoIiwiZ2V0UHJvdG90eXBlIiwiZ2V0U3ltYm9sc0luIiwiYmFzZUdldEFsbEtleXMiLCJTZXQiLCJtYXBUYWciLCJvYmplY3RUYWciLCJzZXRUYWciLCJ3ZWFrTWFwVGFnIiwiZGF0YVZpZXdUYWciLCJEYXRhVmlldyIsIlByb21pc2UiLCJXZWFrTWFwIiwiVWludDhBcnJheSIsImNsb25lQXJyYXlCdWZmZXIiLCJtYXBUb0FycmF5IiwiYXJyYXlSZWR1Y2UiLCJhZGRNYXBFbnRyeSIsIkNMT05FX0RFRVBfRkxBRyIsInNldFRvQXJyYXkiLCJhZGRTZXRFbnRyeSIsImJvb2xUYWciLCJkYXRlVGFnIiwibnVtYmVyVGFnIiwicmVnZXhwVGFnIiwic3RyaW5nVGFnIiwiYXJyYXlCdWZmZXJUYWciLCJmbG9hdDMyVGFnIiwiZmxvYXQ2NFRhZyIsImludDhUYWciLCJpbnQxNlRhZyIsImludDMyVGFnIiwidWludDhUYWciLCJ1aW50OENsYW1wZWRUYWciLCJ1aW50MTZUYWciLCJ1aW50MzJUYWciLCJjbG9uZURhdGFWaWV3IiwiY2xvbmVUeXBlZEFycmF5IiwiY2xvbmVNYXAiLCJjbG9uZVJlZ0V4cCIsImNsb25lU2V0IiwiY2xvbmVTeW1ib2wiLCJiYXNlQ3JlYXRlIiwiYXJyYXlUYWciLCJlcnJvclRhZyIsImdlblRhZyIsInN5bWJvbFRhZyIsImluaXRDbG9uZUFycmF5IiwiY29weUFycmF5IiwiZ2V0VGFnIiwiY2xvbmVCdWZmZXIiLCJpbml0Q2xvbmVPYmplY3QiLCJjb3B5U3ltYm9sc0luIiwiYmFzZUFzc2lnbkluIiwiY29weVN5bWJvbHMiLCJiYXNlQXNzaWduIiwiaW5pdENsb25lQnlUYWciLCJTdGFjayIsImdldEFsbEtleXNJbiIsImdldEFsbEtleXMiLCJhcnJheUVhY2giLCJDTE9ORV9TWU1CT0xTX0ZMQUciLCJiYXNlQ2xvbmUiLCJjbG9uZURlZXAiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQSxJQUFJLE9BQU8sT0FBTyxLQUFLLFdBQVcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFO0VBQ2hFLE9BQU8sQ0FBQyxTQUFTLENBQUMsT0FBTztJQUN2QixPQUFPLENBQUMsU0FBUyxDQUFDLGVBQWU7SUFDakMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxrQkFBa0I7SUFDcEMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxpQkFBaUI7SUFDbkMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0I7SUFDbEMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxxQkFBcUI7SUFDdkMsVUFBVSxDQUFDLEVBQUU7TUFDWEEsSUFBTSxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQyxFQUFDO01BQ3pFQyxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsT0FBTTtNQUN0QixPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksRUFBRSxFQUFFO01BQy9DLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztNQUNkO0NBQ0o7O0FDYkQsSUFBSSxPQUFPLE1BQU0sQ0FBQyxNQUFNLEtBQUssVUFBVSxFQUFFO0VBQ3ZDLENBQUMsWUFBWTtJQUNYLE1BQU0sQ0FBQyxNQUFNLEdBQUcsVUFBVSxNQUFNLEVBQUU7OztNQUVoQyxJQUFJLE1BQU0sS0FBSyxTQUFTLElBQUksTUFBTSxLQUFLLElBQUksRUFBRTtRQUMzQyxNQUFNLElBQUksU0FBUyxDQUFDLDRDQUE0QyxDQUFDO09BQ2xFOztNQUVELElBQUksTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUM7TUFDM0IsS0FBSyxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUUsS0FBSyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLEVBQUU7UUFDckQsSUFBSSxNQUFNLEdBQUdDLFdBQVMsQ0FBQyxLQUFLLEVBQUM7UUFDN0IsSUFBSSxNQUFNLEtBQUssU0FBUyxJQUFJLE1BQU0sS0FBSyxJQUFJLEVBQUU7VUFDM0MsS0FBSyxJQUFJLE9BQU8sSUFBSSxNQUFNLEVBQUU7WUFDMUIsSUFBSSxNQUFNLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxFQUFFO2NBQ2xDLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxNQUFNLENBQUMsT0FBTyxFQUFDO2FBQ2xDO1dBQ0Y7U0FDRjtPQUNGO01BQ0QsT0FBTyxNQUFNO01BQ2Q7R0FDRixJQUFHO0NBQ0w7Ozs7Ozs7OztBQ3RCRCxPQUFPLEdBQUcsY0FBYyxHQUFHLE1BQU0sQ0FBQzs7O1lBR3RCLElBQUksS0FBSyxDQUFDO1lBQ1YsSUFBSSxPQUFPLE9BQU8sS0FBSyxRQUFRO2dCQUMzQixPQUFPLENBQUMsR0FBRztnQkFDWCxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVU7Z0JBQ3RCLGFBQWEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUM7Z0JBQzVDLEtBQUssR0FBRyxXQUFXO2dCQUNqQixJQUFJLElBQUksR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNwRCxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUN2QixPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7aUJBQ2hDLEdBQUM7O2dCQUVKLEtBQUssR0FBRyxXQUFXLEVBQUUsR0FBQzs7OztBQUlwQywyQkFBMkIsR0FBRyxPQUFPLENBQUM7O0FBRXRDLElBQUksVUFBVSxHQUFHLEdBQUcsQ0FBQztBQUNyQixJQUFJLGdCQUFnQixHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsSUFBSSxnQkFBZ0IsQ0FBQzs7O0FBR25FLElBQUkseUJBQXlCLEdBQUcsRUFBRSxDQUFDOzs7QUFHbkMsSUFBSSxFQUFFLEdBQUcsVUFBVSxHQUFHLEVBQUUsQ0FBQztBQUN6QixJQUFJLEdBQUcsR0FBRyxXQUFXLEdBQUcsRUFBRSxDQUFDO0FBQzNCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzs7Ozs7Ozs7QUFRVixJQUFJLGlCQUFpQixHQUFHLENBQUMsRUFBRSxDQUFDO0FBQzVCLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLGFBQWEsQ0FBQztBQUN2QyxJQUFJLHNCQUFzQixHQUFHLENBQUMsRUFBRSxDQUFDO0FBQ2pDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxHQUFHLFFBQVEsQ0FBQzs7Ozs7OztBQU92QyxJQUFJLG9CQUFvQixHQUFHLENBQUMsRUFBRSxDQUFDO0FBQy9CLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLDRCQUE0QixDQUFDOzs7Ozs7QUFNekQsSUFBSSxXQUFXLEdBQUcsQ0FBQyxFQUFFLENBQUM7QUFDdEIsR0FBRyxDQUFDLFdBQVcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsaUJBQWlCLENBQUMsR0FBRyxNQUFNO21CQUNyQyxHQUFHLEdBQUcsR0FBRyxDQUFDLGlCQUFpQixDQUFDLEdBQUcsTUFBTTttQkFDckMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEdBQUcsQ0FBQzs7QUFFdEQsSUFBSSxnQkFBZ0IsR0FBRyxDQUFDLEVBQUUsQ0FBQztBQUMzQixHQUFHLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLHNCQUFzQixDQUFDLEdBQUcsTUFBTTt3QkFDMUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxHQUFHLE1BQU07d0JBQzFDLEdBQUcsR0FBRyxHQUFHLENBQUMsc0JBQXNCLENBQUMsR0FBRyxHQUFHLENBQUM7Ozs7O0FBS2hFLElBQUksb0JBQW9CLEdBQUcsQ0FBQyxFQUFFLENBQUM7QUFDL0IsR0FBRyxDQUFDLG9CQUFvQixDQUFDLEdBQUcsS0FBSyxHQUFHLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQzs0QkFDOUIsR0FBRyxHQUFHLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLEdBQUcsQ0FBQzs7QUFFbEUsSUFBSSx5QkFBeUIsR0FBRyxDQUFDLEVBQUUsQ0FBQztBQUNwQyxHQUFHLENBQUMseUJBQXlCLENBQUMsR0FBRyxLQUFLLEdBQUcsR0FBRyxDQUFDLHNCQUFzQixDQUFDO2lDQUNuQyxHQUFHLEdBQUcsR0FBRyxDQUFDLG9CQUFvQixDQUFDLEdBQUcsR0FBRyxDQUFDOzs7Ozs7O0FBT3ZFLElBQUksVUFBVSxHQUFHLENBQUMsRUFBRSxDQUFDO0FBQ3JCLEdBQUcsQ0FBQyxVQUFVLENBQUMsR0FBRyxPQUFPLEdBQUcsR0FBRyxDQUFDLG9CQUFvQixDQUFDO2tCQUNuQyxRQUFRLEdBQUcsR0FBRyxDQUFDLG9CQUFvQixDQUFDLEdBQUcsTUFBTSxDQUFDOztBQUVoRSxJQUFJLGVBQWUsR0FBRyxDQUFDLEVBQUUsQ0FBQztBQUMxQixHQUFHLENBQUMsZUFBZSxDQUFDLEdBQUcsUUFBUSxHQUFHLEdBQUcsQ0FBQyx5QkFBeUIsQ0FBQzt1QkFDekMsUUFBUSxHQUFHLEdBQUcsQ0FBQyx5QkFBeUIsQ0FBQyxHQUFHLE1BQU0sQ0FBQzs7Ozs7QUFLMUUsSUFBSSxlQUFlLEdBQUcsQ0FBQyxFQUFFLENBQUM7QUFDMUIsR0FBRyxDQUFDLGVBQWUsQ0FBQyxHQUFHLGVBQWUsQ0FBQzs7Ozs7O0FBTXZDLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRSxDQUFDO0FBQ2hCLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxTQUFTLEdBQUcsR0FBRyxDQUFDLGVBQWUsQ0FBQzthQUNoQyxRQUFRLEdBQUcsR0FBRyxDQUFDLGVBQWUsQ0FBQyxHQUFHLE1BQU0sQ0FBQzs7Ozs7Ozs7Ozs7O0FBWXRELElBQUksSUFBSSxHQUFHLENBQUMsRUFBRSxDQUFDO0FBQ2YsSUFBSSxTQUFTLEdBQUcsSUFBSSxHQUFHLEdBQUcsQ0FBQyxXQUFXLENBQUM7Z0JBQ3ZCLEdBQUcsQ0FBQyxVQUFVLENBQUMsR0FBRyxHQUFHO2dCQUNyQixHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDOztBQUVqQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLFNBQVMsR0FBRyxHQUFHLENBQUM7Ozs7O0FBS2xDLElBQUksVUFBVSxHQUFHLFVBQVUsR0FBRyxHQUFHLENBQUMsZ0JBQWdCLENBQUM7aUJBQ2xDLEdBQUcsQ0FBQyxlQUFlLENBQUMsR0FBRyxHQUFHO2lCQUMxQixHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDOztBQUVsQyxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUUsQ0FBQztBQUNoQixHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxHQUFHLFVBQVUsR0FBRyxHQUFHLENBQUM7O0FBRXBDLElBQUksSUFBSSxHQUFHLENBQUMsRUFBRSxDQUFDO0FBQ2YsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLGNBQWMsQ0FBQzs7Ozs7QUFLM0IsSUFBSSxxQkFBcUIsR0FBRyxDQUFDLEVBQUUsQ0FBQztBQUNoQyxHQUFHLENBQUMscUJBQXFCLENBQUMsR0FBRyxHQUFHLENBQUMsc0JBQXNCLENBQUMsR0FBRyxVQUFVLENBQUM7QUFDdEUsSUFBSSxnQkFBZ0IsR0FBRyxDQUFDLEVBQUUsQ0FBQztBQUMzQixHQUFHLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxHQUFHLENBQUMsaUJBQWlCLENBQUMsR0FBRyxVQUFVLENBQUM7O0FBRTVELElBQUksV0FBVyxHQUFHLENBQUMsRUFBRSxDQUFDO0FBQ3RCLEdBQUcsQ0FBQyxXQUFXLENBQUMsR0FBRyxXQUFXLEdBQUcsR0FBRyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsR0FBRzttQkFDekMsU0FBUyxHQUFHLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEdBQUc7bUJBQ3ZDLFNBQVMsR0FBRyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxHQUFHO21CQUN2QyxLQUFLLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxHQUFHLElBQUk7bUJBQzlCLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHO21CQUNoQixNQUFNLENBQUM7O0FBRTFCLElBQUksZ0JBQWdCLEdBQUcsQ0FBQyxFQUFFLENBQUM7QUFDM0IsR0FBRyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsV0FBVyxHQUFHLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLEdBQUc7d0JBQzlDLFNBQVMsR0FBRyxHQUFHLENBQUMscUJBQXFCLENBQUMsR0FBRyxHQUFHO3dCQUM1QyxTQUFTLEdBQUcsR0FBRyxDQUFDLHFCQUFxQixDQUFDLEdBQUcsR0FBRzt3QkFDNUMsS0FBSyxHQUFHLEdBQUcsQ0FBQyxlQUFlLENBQUMsR0FBRyxJQUFJO3dCQUNuQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRzt3QkFDaEIsTUFBTSxDQUFDOztBQUUvQixJQUFJLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztBQUNqQixHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxNQUFNLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUNoRSxJQUFJLFdBQVcsR0FBRyxDQUFDLEVBQUUsQ0FBQztBQUN0QixHQUFHLENBQUMsV0FBVyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxNQUFNLEdBQUcsR0FBRyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsR0FBRyxDQUFDOzs7O0FBSTFFLElBQUksTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO0FBQ2pCLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxjQUFjO2NBQ2QsU0FBUyxHQUFHLHlCQUF5QixHQUFHLElBQUk7Y0FDNUMsZUFBZSxHQUFHLHlCQUF5QixHQUFHLE1BQU07Y0FDcEQsZUFBZSxHQUFHLHlCQUF5QixHQUFHLE1BQU07Y0FDcEQsY0FBYyxDQUFDOzs7O0FBSTdCLElBQUksU0FBUyxHQUFHLENBQUMsRUFBRSxDQUFDO0FBQ3BCLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxTQUFTLENBQUM7O0FBRTNCLElBQUksU0FBUyxHQUFHLENBQUMsRUFBRSxDQUFDO0FBQ3BCLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxRQUFRLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLE1BQU0sQ0FBQztBQUNwRCxFQUFFLENBQUMsU0FBUyxDQUFDLEdBQUcsSUFBSSxNQUFNLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ2hELElBQUksZ0JBQWdCLEdBQUcsS0FBSyxDQUFDOztBQUU3QixJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUUsQ0FBQztBQUNoQixHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFHLENBQUMsV0FBVyxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQzNELElBQUksVUFBVSxHQUFHLENBQUMsRUFBRSxDQUFDO0FBQ3JCLEdBQUcsQ0FBQyxVQUFVLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEdBQUcsQ0FBQzs7OztBQUlyRSxJQUFJLFNBQVMsR0FBRyxDQUFDLEVBQUUsQ0FBQztBQUNwQixHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsU0FBUyxDQUFDOztBQUUzQixJQUFJLFNBQVMsR0FBRyxDQUFDLEVBQUUsQ0FBQztBQUNwQixHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsUUFBUSxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxNQUFNLENBQUM7QUFDcEQsRUFBRSxDQUFDLFNBQVMsQ0FBQyxHQUFHLElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUNoRCxJQUFJLGdCQUFnQixHQUFHLEtBQUssQ0FBQzs7QUFFN0IsSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFLENBQUM7QUFDaEIsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUMzRCxJQUFJLFVBQVUsR0FBRyxDQUFDLEVBQUUsQ0FBQztBQUNyQixHQUFHLENBQUMsVUFBVSxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxHQUFHLENBQUM7OztBQUdyRSxJQUFJLGVBQWUsR0FBRyxDQUFDLEVBQUUsQ0FBQztBQUMxQixHQUFHLENBQUMsZUFBZSxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxPQUFPLEdBQUcsVUFBVSxHQUFHLE9BQU8sQ0FBQztBQUN4RSxJQUFJLFVBQVUsR0FBRyxDQUFDLEVBQUUsQ0FBQztBQUNyQixHQUFHLENBQUMsVUFBVSxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxPQUFPLEdBQUcsU0FBUyxHQUFHLE9BQU8sQ0FBQzs7Ozs7QUFLbEUsSUFBSSxjQUFjLEdBQUcsQ0FBQyxFQUFFLENBQUM7QUFDekIsR0FBRyxDQUFDLGNBQWMsQ0FBQyxHQUFHLFFBQVEsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDO3NCQUNwQixPQUFPLEdBQUcsVUFBVSxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsV0FBVyxDQUFDLEdBQUcsR0FBRyxDQUFDOzs7QUFHMUUsRUFBRSxDQUFDLGNBQWMsQ0FBQyxHQUFHLElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUMxRCxJQUFJLHFCQUFxQixHQUFHLFFBQVEsQ0FBQzs7Ozs7OztBQU9yQyxJQUFJLFdBQVcsR0FBRyxDQUFDLEVBQUUsQ0FBQztBQUN0QixHQUFHLENBQUMsV0FBVyxDQUFDLEdBQUcsUUFBUSxHQUFHLEdBQUcsQ0FBQyxXQUFXLENBQUMsR0FBRyxHQUFHO21CQUNqQyxXQUFXO21CQUNYLEdBQUcsR0FBRyxHQUFHLENBQUMsV0FBVyxDQUFDLEdBQUcsR0FBRzttQkFDNUIsT0FBTyxDQUFDOztBQUUzQixJQUFJLGdCQUFnQixHQUFHLENBQUMsRUFBRSxDQUFDO0FBQzNCLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLFFBQVEsR0FBRyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxHQUFHO3dCQUN0QyxXQUFXO3dCQUNYLEdBQUcsR0FBRyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxHQUFHO3dCQUNqQyxPQUFPLENBQUM7OztBQUdoQyxJQUFJLElBQUksR0FBRyxDQUFDLEVBQUUsQ0FBQztBQUNmLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxpQkFBaUIsQ0FBQzs7OztBQUk5QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO0VBQzFCLEtBQUssQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDakIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7TUFDUixFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUM7Q0FDOUI7O0FBRUQsYUFBYSxHQUFHLEtBQUssQ0FBQztBQUN0QixTQUFTLEtBQUssQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFO0VBQy9CLElBQUksQ0FBQyxPQUFPLElBQUksT0FBTyxPQUFPLEtBQUssUUFBUTtNQUN6QyxPQUFPLEdBQUcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxLQUFLLEtBQUU7O0VBRTFELElBQUksT0FBTyxZQUFZLE1BQU07TUFDM0IsT0FBTyxPQUFPLEdBQUM7O0VBRWpCLElBQUksT0FBTyxPQUFPLEtBQUssUUFBUTtNQUM3QixPQUFPLElBQUksR0FBQzs7RUFFZCxJQUFJLE9BQU8sQ0FBQyxNQUFNLEdBQUcsVUFBVTtNQUM3QixPQUFPLElBQUksR0FBQzs7RUFFZCxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7RUFDN0MsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO01BQ2xCLE9BQU8sSUFBSSxHQUFDOztFQUVkLElBQUk7SUFDRixPQUFPLElBQUksTUFBTSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztHQUNyQyxDQUFDLE9BQU8sRUFBRSxFQUFFO0lBQ1gsT0FBTyxJQUFJLENBQUM7R0FDYjtDQUNGOztBQUVELGFBQWEsR0FBRyxLQUFLLENBQUM7QUFDdEIsU0FBUyxLQUFLLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRTtFQUMvQixJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0VBQ2hDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO0NBQzdCOzs7QUFHRCxhQUFhLEdBQUcsS0FBSyxDQUFDO0FBQ3RCLFNBQVMsS0FBSyxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUU7RUFDL0IsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0VBQzdELE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO0NBQzdCOztBQUVELGNBQWMsR0FBRyxNQUFNLENBQUM7O0FBRXhCLFNBQVMsTUFBTSxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUU7RUFDaEMsSUFBSSxDQUFDLE9BQU8sSUFBSSxPQUFPLE9BQU8sS0FBSyxRQUFRO01BQ3pDLE9BQU8sR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsT0FBTyxFQUFFLGlCQUFpQixFQUFFLEtBQUssS0FBRTtFQUMxRCxJQUFJLE9BQU8sWUFBWSxNQUFNLEVBQUU7SUFDN0IsSUFBSSxPQUFPLENBQUMsS0FBSyxLQUFLLE9BQU8sQ0FBQyxLQUFLO1FBQ2pDLE9BQU8sT0FBTyxHQUFDOztRQUVmLE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxHQUFDO0dBQzdCLE1BQU0sSUFBSSxPQUFPLE9BQU8sS0FBSyxRQUFRLEVBQUU7SUFDdEMsTUFBTSxJQUFJLFNBQVMsQ0FBQyxtQkFBbUIsR0FBRyxPQUFPLENBQUMsQ0FBQztHQUNwRDs7RUFFRCxJQUFJLE9BQU8sQ0FBQyxNQUFNLEdBQUcsVUFBVTtNQUM3QixNQUFNLElBQUksU0FBUyxDQUFDLHlCQUF5QixHQUFHLFVBQVUsR0FBRyxhQUFhLEdBQUM7O0VBRTdFLElBQUksRUFBRSxJQUFJLFlBQVksTUFBTSxDQUFDO01BQzNCLE9BQU8sSUFBSSxNQUFNLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxHQUFDOztFQUV0QyxLQUFLLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztFQUNsQyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztFQUN2QixJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDOztFQUU3QixJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDOztFQUVuRSxJQUFJLENBQUMsQ0FBQztNQUNKLE1BQU0sSUFBSSxTQUFTLENBQUMsbUJBQW1CLEdBQUcsT0FBTyxDQUFDLEdBQUM7O0VBRXJELElBQUksQ0FBQyxHQUFHLEdBQUcsT0FBTyxDQUFDOzs7RUFHbkIsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUNuQixJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ25CLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7O0VBRW5CLElBQUksSUFBSSxDQUFDLEtBQUssR0FBRyxnQkFBZ0IsSUFBSSxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUM7TUFDakQsTUFBTSxJQUFJLFNBQVMsQ0FBQyx1QkFBdUIsR0FBQzs7RUFFOUMsSUFBSSxJQUFJLENBQUMsS0FBSyxHQUFHLGdCQUFnQixJQUFJLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQztNQUNqRCxNQUFNLElBQUksU0FBUyxDQUFDLHVCQUF1QixHQUFDOztFQUU5QyxJQUFJLElBQUksQ0FBQyxLQUFLLEdBQUcsZ0JBQWdCLElBQUksSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDO01BQ2pELE1BQU0sSUFBSSxTQUFTLENBQUMsdUJBQXVCLEdBQUM7OztFQUc5QyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztNQUNQLElBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRSxHQUFDOztNQUVyQixJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxFQUFFO01BQ2pELElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRTtRQUN2QixJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUNkLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxHQUFHLEdBQUcsZ0JBQWdCO1lBQ3BDLE9BQU8sR0FBRyxHQUFDO09BQ2Q7TUFDRCxPQUFPLEVBQUUsQ0FBQztLQUNYLENBQUMsR0FBQzs7RUFFTCxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztFQUN6QyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7Q0FDZjs7QUFFRCxNQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxXQUFXO0VBQ25DLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztFQUNoRSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTTtNQUN4QixJQUFJLENBQUMsT0FBTyxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBQztFQUNsRCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7Q0FDckIsQ0FBQzs7QUFFRixNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBRyxXQUFXO0VBQ3JDLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztDQUNyQixDQUFDOztBQUVGLE1BQU0sQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFHLFNBQVMsS0FBSyxFQUFFO0VBQ3pDLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7RUFDM0QsSUFBSSxFQUFFLEtBQUssWUFBWSxNQUFNLENBQUM7TUFDNUIsS0FBSyxHQUFHLElBQUksTUFBTSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUM7O0VBRTFDLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO0NBQzFELENBQUM7O0FBRUYsTUFBTSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUcsU0FBUyxLQUFLLEVBQUU7RUFDN0MsSUFBSSxFQUFFLEtBQUssWUFBWSxNQUFNLENBQUM7TUFDNUIsS0FBSyxHQUFHLElBQUksTUFBTSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUM7O0VBRTFDLE9BQU8sa0JBQWtCLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDO1NBQzNDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQztTQUMzQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztDQUNwRCxDQUFDOztBQUVGLE1BQU0sQ0FBQyxTQUFTLENBQUMsVUFBVSxHQUFHLFNBQVMsS0FBSyxFQUFFOzs7RUFDNUMsSUFBSSxFQUFFLEtBQUssWUFBWSxNQUFNLENBQUM7TUFDNUIsS0FBSyxHQUFHLElBQUksTUFBTSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUM7OztFQUcxQyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxNQUFNO01BQ3BELE9BQU8sQ0FBQyxDQUFDLEdBQUM7T0FDUCxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLElBQUksS0FBSyxDQUFDLFVBQVUsQ0FBQyxNQUFNO01BQ3pELE9BQU8sQ0FBQyxHQUFDO09BQ04sSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxNQUFNO01BQzFELE9BQU8sQ0FBQyxHQUFDOztFQUVYLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUNWLEdBQUc7SUFDRCxJQUFJLENBQUMsR0FBR0MsTUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMzQixJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzVCLEtBQUssQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ3JDLElBQUksQ0FBQyxLQUFLLFNBQVMsSUFBSSxDQUFDLEtBQUssU0FBUztRQUNwQyxPQUFPLENBQUMsR0FBQztTQUNOLElBQUksQ0FBQyxLQUFLLFNBQVM7UUFDdEIsT0FBTyxDQUFDLEdBQUM7U0FDTixJQUFJLENBQUMsS0FBSyxTQUFTO1FBQ3RCLE9BQU8sQ0FBQyxDQUFDLEdBQUM7U0FDUCxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ2QsV0FBUzs7UUFFVCxPQUFPLGtCQUFrQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBQztHQUNuQyxRQUFRLEVBQUUsQ0FBQyxFQUFFO0NBQ2YsQ0FBQzs7OztBQUlGLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFHLFNBQVMsT0FBTyxFQUFFLFVBQVUsRUFBRTs7O0VBQ25ELFFBQVEsT0FBTztJQUNiLEtBQUssVUFBVTtNQUNiLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztNQUMzQixJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztNQUNmLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO01BQ2YsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO01BQ2IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsVUFBVSxDQUFDLENBQUM7TUFDNUIsTUFBTTtJQUNSLEtBQUssVUFBVTtNQUNiLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztNQUMzQixJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztNQUNmLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztNQUNiLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFDO01BQzVCLE1BQU07SUFDUixLQUFLLFVBQVU7Ozs7TUFJYixJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7TUFDM0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLENBQUM7TUFDOUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsVUFBVSxDQUFDLENBQUM7TUFDNUIsTUFBTTs7O0lBR1IsS0FBSyxZQUFZO01BQ2YsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sS0FBSyxDQUFDO1VBQzlCLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxHQUFDO01BQ2hDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFDO01BQzVCLE1BQU07O0lBRVIsS0FBSyxPQUFPOzs7OztNQUtWLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEtBQUssQ0FBQztVQUN0RSxJQUFJLENBQUMsS0FBSyxFQUFFLEdBQUM7TUFDZixJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztNQUNmLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO01BQ2YsSUFBSSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7TUFDckIsTUFBTTtJQUNSLEtBQUssT0FBTzs7Ozs7TUFLVixJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxLQUFLLENBQUM7VUFDbEQsSUFBSSxDQUFDLEtBQUssRUFBRSxHQUFDO01BQ2YsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7TUFDZixJQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztNQUNyQixNQUFNO0lBQ1IsS0FBSyxPQUFPOzs7OztNQUtWLElBQUksSUFBSSxDQUFDLFVB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R0FBRyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFDOztZQUUxQyxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsRUFBRTtnQkFDakMsSUFBSSxHQUFHLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFDO09BQzFDO1VBQ0MsR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEVBQUU7Y0FDakMsSUFBSSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sR0FBQztLQUNsQyxNQUFNO01BQ0wsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO01BQ2YsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFO1FBQ2IsSUFBSSxDQUFDLEtBQUssR0FBRztZQUNYLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7Z0JBQzVCLElBQUksR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUM7O1lBRTFDLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7Z0JBQzVCLElBQUksR0FBRyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBQztPQUMxQztVQUNDLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7Y0FDNUIsSUFBSSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sR0FBQztLQUNsQzs7SUFF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
