'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var vueTemplateCompiler = require('vue-template-compiler');
var Vue = _interopDefault(require('vue'));
var testUtils = _interopDefault(require('@vue/test-utils'));
var vueServerRenderer = require('vue-server-renderer');
var cheerio = _interopDefault(require('cheerio'));

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

var VUE_VERSION = Number(
  ((Vue.version.split('.')[0]) + "." + (Vue.version.split('.')[1]))
);

var BEFORE_RENDER_LIFECYCLE_HOOK =
  semver.gt(Vue.version, '2.1.8')
    ? 'beforeCreate'
    : 'beforeMount';

var CREATE_ELEMENT_ALIAS = semver.gt(Vue.version, '2.1.5')
  ? '_c'
  : '_h';

function addStubs (_Vue, stubComponents) {
  var obj;

  function addStubComponentsMixin () {
    Object.assign(this.$options.components, stubComponents);
  }

  _Vue.mixin(( obj = {}, obj[BEFORE_RENDER_LIFECYCLE_HOOK] = addStubComponentsMixin, obj));
}

// 

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

var config = testUtils.config

// 

Vue.config.productionTip = false;
Vue.config.devtools = false;

function renderToString (
  component,
  options
) {
  if ( options === void 0 ) options = {};

  var renderer = vueServerRenderer.createRenderer();

  if (!renderer) {
    throwError(
      "renderToString must be run in node. It cannot be " + "run in a browser"
    );
  }

  if (options.attachToDocument) {
    throwError("you cannot use attachToDocument with " + "renderToString");
  }

  var vm = createInstance(
    component,
    mergeOptions(options, config),
    testUtils.createLocalVue(options.localVue)
  );
  var renderedString = '';

  // $FlowIgnore
  renderer.renderToString(vm, function (err, res) {
    if (err) {
      console.log(err);
    }
    renderedString = res;
  });
  return renderedString
}

// 

function render (
  component,
  options
) {
  if ( options === void 0 ) options = {};

  var renderedString = renderToString(component, options);
  return cheerio.load('')(renderedString)
}

var index = {
  renderToString: renderToString,
  config: config,
  render: render
}

module.exports = index;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidnVlLXNlcnZlci10ZXN0LXV0aWxzLmpzIiwic291cmNlcyI6WyIuLi8uLi9jcmVhdGUtaW5zdGFuY2UvY3JlYXRlLXNsb3Qtdm5vZGVzLmpzIiwiLi4vLi4vc2hhcmVkL25vZGVfbW9kdWxlcy9zZW12ZXIvc2VtdmVyLmpzIiwiLi4vLi4vc2hhcmVkL3V0aWwuanMiLCIuLi8uLi9jcmVhdGUtaW5zdGFuY2UvYWRkLW1vY2tzLmpzIiwiLi4vLi4vY3JlYXRlLWluc3RhbmNlL2xvZy1ldmVudHMuanMiLCIuLi8uLi9zaGFyZWQvY29uc3RzLmpzIiwiLi4vLi4vY3JlYXRlLWluc3RhbmNlL2FkZC1zdHVicy5qcyIsIi4uLy4uL3NoYXJlZC92YWxpZGF0b3JzLmpzIiwiLi4vLi4vc2hhcmVkL2NvbXBpbGUtdGVtcGxhdGUuanMiLCIuLi8uLi9jcmVhdGUtaW5zdGFuY2UvZXh0cmFjdC1pbnN0YW5jZS1vcHRpb25zLmpzIiwiLi4vLi4vY3JlYXRlLWluc3RhbmNlL3ZhbGlkYXRlLXNsb3RzLmpzIiwiLi4vLi4vY3JlYXRlLWluc3RhbmNlL2NyZWF0ZS1zY29wZWQtc2xvdHMuanMiLCIuLi8uLi9jcmVhdGUtaW5zdGFuY2UvY3JlYXRlLWZ1bmN0aW9uYWwtY29tcG9uZW50LmpzIiwiLi4vLi4vY3JlYXRlLWluc3RhbmNlL2NyZWF0ZS1jb21wb25lbnQtc3R1YnMuanMiLCIuLi8uLi9jcmVhdGUtaW5zdGFuY2UvcGF0Y2gtcmVuZGVyLmpzIiwiLi4vLi4vY3JlYXRlLWluc3RhbmNlL2NyZWF0ZS1pbnN0YW5jZS5qcyIsIi4uLy4uL3NoYXJlZC9ub3JtYWxpemUuanMiLCIuLi8uLi9zaGFyZWQvbWVyZ2Utb3B0aW9ucy5qcyIsIi4uL3NyYy9jb25maWcuanMiLCIuLi9zcmMvcmVuZGVyVG9TdHJpbmcuanMiLCIuLi9zcmMvcmVuZGVyLmpzIiwiLi4vc3JjL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIEBmbG93XG5cbmltcG9ydCB7IGNvbXBpbGVUb0Z1bmN0aW9ucyB9IGZyb20gJ3Z1ZS10ZW1wbGF0ZS1jb21waWxlcidcblxuZnVuY3Rpb24gY3JlYXRlVk5vZGVzIChcbiAgdm06IENvbXBvbmVudCxcbiAgc2xvdFZhbHVlOiBzdHJpbmcsXG4gIG5hbWVcbik6IEFycmF5PFZOb2RlPiB7XG4gIGNvbnN0IGVsID0gY29tcGlsZVRvRnVuY3Rpb25zKFxuICAgIGA8ZGl2Pjx0ZW1wbGF0ZSBzbG90PSR7bmFtZX0+JHtzbG90VmFsdWV9PC90ZW1wbGF0ZT48L2Rpdj5gXG4gIClcbiAgY29uc3QgX3N0YXRpY1JlbmRlckZucyA9IHZtLl9yZW5kZXJQcm94eS4kb3B0aW9ucy5zdGF0aWNSZW5kZXJGbnNcbiAgY29uc3QgX3N0YXRpY1RyZWVzID0gdm0uX3JlbmRlclByb3h5Ll9zdGF0aWNUcmVlc1xuICB2bS5fcmVuZGVyUHJveHkuX3N0YXRpY1RyZWVzID0gW11cbiAgdm0uX3JlbmRlclByb3h5LiRvcHRpb25zLnN0YXRpY1JlbmRlckZucyA9IGVsLnN0YXRpY1JlbmRlckZuc1xuICBjb25zdCB2bm9kZSA9IGVsLnJlbmRlci5jYWxsKHZtLl9yZW5kZXJQcm94eSwgdm0uJGNyZWF0ZUVsZW1lbnQpXG4gIHZtLl9yZW5kZXJQcm94eS4kb3B0aW9ucy5zdGF0aWNSZW5kZXJGbnMgPSBfc3RhdGljUmVuZGVyRm5zXG4gIHZtLl9yZW5kZXJQcm94eS5fc3RhdGljVHJlZXMgPSBfc3RhdGljVHJlZXNcbiAgcmV0dXJuIHZub2RlLmNoaWxkcmVuWzBdXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVZOb2Rlc0ZvclNsb3QgKFxuICB2bTogQ29tcG9uZW50LFxuICBzbG90VmFsdWU6IFNsb3RWYWx1ZSxcbiAgbmFtZTogc3RyaW5nLFxuKTogVk5vZGUgfCBBcnJheTxWTm9kZT4ge1xuICBpZiAodHlwZW9mIHNsb3RWYWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gY3JlYXRlVk5vZGVzKHZtLCBzbG90VmFsdWUsIG5hbWUpXG4gIH1cbiAgY29uc3Qgdm5vZGUgPSB2bS4kY3JlYXRlRWxlbWVudChzbG90VmFsdWUpXG4gIDsodm5vZGUuZGF0YSB8fCAodm5vZGUuZGF0YSA9IHt9KSkuc2xvdCA9IG5hbWVcbiAgcmV0dXJuIHZub2RlXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTbG90Vk5vZGVzIChcbiAgdm06IENvbXBvbmVudCxcbiAgc2xvdHM6IFNsb3RzT2JqZWN0XG4pOiBBcnJheTxWTm9kZSB8IEFycmF5PFZOb2RlPj4ge1xuICByZXR1cm4gT2JqZWN0LmtleXMoc2xvdHMpLnJlZHVjZSgoYWNjLCBrZXkpID0+IHtcbiAgICBjb25zdCBjb250ZW50ID0gc2xvdHNba2V5XVxuICAgIGlmIChBcnJheS5pc0FycmF5KGNvbnRlbnQpKSB7XG4gICAgICBjb25zdCBub2RlcyA9IGNvbnRlbnQubWFwKFxuICAgICAgICBzbG90RGVmID0+IGNyZWF0ZVZOb2Rlc0ZvclNsb3Qodm0sIHNsb3REZWYsIGtleSlcbiAgICAgIClcbiAgICAgIHJldHVybiBhY2MuY29uY2F0KG5vZGVzKVxuICAgIH1cblxuICAgIHJldHVybiBhY2MuY29uY2F0KGNyZWF0ZVZOb2Rlc0ZvclNsb3Qodm0sIGNvbnRlbnQsIGtleSkpXG4gIH0sIFtdKVxufVxuIiwiZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gU2VtVmVyO1xuXG4vLyBUaGUgZGVidWcgZnVuY3Rpb24gaXMgZXhjbHVkZWQgZW50aXJlbHkgZnJvbSB0aGUgbWluaWZpZWQgdmVyc2lvbi5cbi8qIG5vbWluICovIHZhciBkZWJ1Zztcbi8qIG5vbWluICovIGlmICh0eXBlb2YgcHJvY2VzcyA9PT0gJ29iamVjdCcgJiZcbiAgICAvKiBub21pbiAqLyBwcm9jZXNzLmVudiAmJlxuICAgIC8qIG5vbWluICovIHByb2Nlc3MuZW52Lk5PREVfREVCVUcgJiZcbiAgICAvKiBub21pbiAqLyAvXFxic2VtdmVyXFxiL2kudGVzdChwcm9jZXNzLmVudi5OT0RFX0RFQlVHKSlcbiAgLyogbm9taW4gKi8gZGVidWcgPSBmdW5jdGlvbigpIHtcbiAgICAvKiBub21pbiAqLyB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCk7XG4gICAgLyogbm9taW4gKi8gYXJncy51bnNoaWZ0KCdTRU1WRVInKTtcbiAgICAvKiBub21pbiAqLyBjb25zb2xlLmxvZy5hcHBseShjb25zb2xlLCBhcmdzKTtcbiAgICAvKiBub21pbiAqLyB9O1xuLyogbm9taW4gKi8gZWxzZVxuICAvKiBub21pbiAqLyBkZWJ1ZyA9IGZ1bmN0aW9uKCkge307XG5cbi8vIE5vdGU6IHRoaXMgaXMgdGhlIHNlbXZlci5vcmcgdmVyc2lvbiBvZiB0aGUgc3BlYyB0aGF0IGl0IGltcGxlbWVudHNcbi8vIE5vdCBuZWNlc3NhcmlseSB0aGUgcGFja2FnZSB2ZXJzaW9uIG9mIHRoaXMgY29kZS5cbmV4cG9ydHMuU0VNVkVSX1NQRUNfVkVSU0lPTiA9ICcyLjAuMCc7XG5cbnZhciBNQVhfTEVOR1RIID0gMjU2O1xudmFyIE1BWF9TQUZFX0lOVEVHRVIgPSBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUiB8fCA5MDA3MTk5MjU0NzQwOTkxO1xuXG4vLyBNYXggc2FmZSBzZWdtZW50IGxlbmd0aCBmb3IgY29lcmNpb24uXG52YXIgTUFYX1NBRkVfQ09NUE9ORU5UX0xFTkdUSCA9IDE2O1xuXG4vLyBUaGUgYWN0dWFsIHJlZ2V4cHMgZ28gb24gZXhwb3J0cy5yZVxudmFyIHJlID0gZXhwb3J0cy5yZSA9IFtdO1xudmFyIHNyYyA9IGV4cG9ydHMuc3JjID0gW107XG52YXIgUiA9IDA7XG5cbi8vIFRoZSBmb2xsb3dpbmcgUmVndWxhciBFeHByZXNzaW9ucyBjYW4gYmUgdXNlZCBmb3IgdG9rZW5pemluZyxcbi8vIHZhbGlkYXRpbmcsIGFuZCBwYXJzaW5nIFNlbVZlciB2ZXJzaW9uIHN0cmluZ3MuXG5cbi8vICMjIE51bWVyaWMgSWRlbnRpZmllclxuLy8gQSBzaW5nbGUgYDBgLCBvciBhIG5vbi16ZXJvIGRpZ2l0IGZvbGxvd2VkIGJ5IHplcm8gb3IgbW9yZSBkaWdpdHMuXG5cbnZhciBOVU1FUklDSURFTlRJRklFUiA9IFIrKztcbnNyY1tOVU1FUklDSURFTlRJRklFUl0gPSAnMHxbMS05XVxcXFxkKic7XG52YXIgTlVNRVJJQ0lERU5USUZJRVJMT09TRSA9IFIrKztcbnNyY1tOVU1FUklDSURFTlRJRklFUkxPT1NFXSA9ICdbMC05XSsnO1xuXG5cbi8vICMjIE5vbi1udW1lcmljIElkZW50aWZpZXJcbi8vIFplcm8gb3IgbW9yZSBkaWdpdHMsIGZvbGxvd2VkIGJ5IGEgbGV0dGVyIG9yIGh5cGhlbiwgYW5kIHRoZW4gemVybyBvclxuLy8gbW9yZSBsZXR0ZXJzLCBkaWdpdHMsIG9yIGh5cGhlbnMuXG5cbnZhciBOT05OVU1FUklDSURFTlRJRklFUiA9IFIrKztcbnNyY1tOT05OVU1FUklDSURFTlRJRklFUl0gPSAnXFxcXGQqW2EtekEtWi1dW2EtekEtWjAtOS1dKic7XG5cblxuLy8gIyMgTWFpbiBWZXJzaW9uXG4vLyBUaHJlZSBkb3Qtc2VwYXJhdGVkIG51bWVyaWMgaWRlbnRpZmllcnMuXG5cbnZhciBNQUlOVkVSU0lPTiA9IFIrKztcbnNyY1tNQUlOVkVSU0lPTl0gPSAnKCcgKyBzcmNbTlVNRVJJQ0lERU5USUZJRVJdICsgJylcXFxcLicgK1xuICAgICAgICAgICAgICAgICAgICcoJyArIHNyY1tOVU1FUklDSURFTlRJRklFUl0gKyAnKVxcXFwuJyArXG4gICAgICAgICAgICAgICAgICAgJygnICsgc3JjW05VTUVSSUNJREVOVElGSUVSXSArICcpJztcblxudmFyIE1BSU5WRVJTSU9OTE9PU0UgPSBSKys7XG5zcmNbTUFJTlZFUlNJT05MT09TRV0gPSAnKCcgKyBzcmNbTlVNRVJJQ0lERU5USUZJRVJMT09TRV0gKyAnKVxcXFwuJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnKCcgKyBzcmNbTlVNRVJJQ0lERU5USUZJRVJMT09TRV0gKyAnKVxcXFwuJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnKCcgKyBzcmNbTlVNRVJJQ0lERU5USUZJRVJMT09TRV0gKyAnKSc7XG5cbi8vICMjIFByZS1yZWxlYXNlIFZlcnNpb24gSWRlbnRpZmllclxuLy8gQSBudW1lcmljIGlkZW50aWZpZXIsIG9yIGEgbm9uLW51bWVyaWMgaWRlbnRpZmllci5cblxudmFyIFBSRVJFTEVBU0VJREVOVElGSUVSID0gUisrO1xuc3JjW1BSRVJFTEVBU0VJREVOVElGSUVSXSA9ICcoPzonICsgc3JjW05VTUVSSUNJREVOVElGSUVSXSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3wnICsgc3JjW05PTk5VTUVSSUNJREVOVElGSUVSXSArICcpJztcblxudmFyIFBSRVJFTEVBU0VJREVOVElGSUVSTE9PU0UgPSBSKys7XG5zcmNbUFJFUkVMRUFTRUlERU5USUZJRVJMT09TRV0gPSAnKD86JyArIHNyY1tOVU1FUklDSURFTlRJRklFUkxPT1NFXSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnfCcgKyBzcmNbTk9OTlVNRVJJQ0lERU5USUZJRVJdICsgJyknO1xuXG5cbi8vICMjIFByZS1yZWxlYXNlIFZlcnNpb25cbi8vIEh5cGhlbiwgZm9sbG93ZWQgYnkgb25lIG9yIG1vcmUgZG90LXNlcGFyYXRlZCBwcmUtcmVsZWFzZSB2ZXJzaW9uXG4vLyBpZGVudGlmaWVycy5cblxudmFyIFBSRVJFTEVBU0UgPSBSKys7XG5zcmNbUFJFUkVMRUFTRV0gPSAnKD86LSgnICsgc3JjW1BSRVJFTEVBU0VJREVOVElGSUVSXSArXG4gICAgICAgICAgICAgICAgICAnKD86XFxcXC4nICsgc3JjW1BSRVJFTEVBU0VJREVOVElGSUVSXSArICcpKikpJztcblxudmFyIFBSRVJFTEVBU0VMT09TRSA9IFIrKztcbnNyY1tQUkVSRUxFQVNFTE9PU0VdID0gJyg/Oi0/KCcgKyBzcmNbUFJFUkVMRUFTRUlERU5USUZJRVJMT09TRV0gK1xuICAgICAgICAgICAgICAgICAgICAgICAnKD86XFxcXC4nICsgc3JjW1BSRVJFTEVBU0VJREVOVElGSUVSTE9PU0VdICsgJykqKSknO1xuXG4vLyAjIyBCdWlsZCBNZXRhZGF0YSBJZGVudGlmaWVyXG4vLyBBbnkgY29tYmluYXRpb24gb2YgZGlnaXRzLCBsZXR0ZXJzLCBvciBoeXBoZW5zLlxuXG52YXIgQlVJTERJREVOVElGSUVSID0gUisrO1xuc3JjW0JVSUxESURFTlRJRklFUl0gPSAnWzAtOUEtWmEtei1dKyc7XG5cbi8vICMjIEJ1aWxkIE1ldGFkYXRhXG4vLyBQbHVzIHNpZ24sIGZvbGxvd2VkIGJ5IG9uZSBvciBtb3JlIHBlcmlvZC1zZXBhcmF0ZWQgYnVpbGQgbWV0YWRhdGFcbi8vIGlkZW50aWZpZXJzLlxuXG52YXIgQlVJTEQgPSBSKys7XG5zcmNbQlVJTERdID0gJyg/OlxcXFwrKCcgKyBzcmNbQlVJTERJREVOVElGSUVSXSArXG4gICAgICAgICAgICAgJyg/OlxcXFwuJyArIHNyY1tCVUlMRElERU5USUZJRVJdICsgJykqKSknO1xuXG5cbi8vICMjIEZ1bGwgVmVyc2lvbiBTdHJpbmdcbi8vIEEgbWFpbiB2ZXJzaW9uLCBmb2xsb3dlZCBvcHRpb25hbGx5IGJ5IGEgcHJlLXJlbGVhc2UgdmVyc2lvbiBhbmRcbi8vIGJ1aWxkIG1ldGFkYXRhLlxuXG4vLyBOb3RlIHRoYXQgdGhlIG9ubHkgbWFqb3IsIG1pbm9yLCBwYXRjaCwgYW5kIHByZS1yZWxlYXNlIHNlY3Rpb25zIG9mXG4vLyB0aGUgdmVyc2lvbiBzdHJpbmcgYXJlIGNhcHR1cmluZyBncm91cHMuICBUaGUgYnVpbGQgbWV0YWRhdGEgaXMgbm90IGFcbi8vIGNhcHR1cmluZyBncm91cCwgYmVjYXVzZSBpdCBzaG91bGQgbm90IGV2ZXIgYmUgdXNlZCBpbiB2ZXJzaW9uXG4vLyBjb21wYXJpc29uLlxuXG52YXIgRlVMTCA9IFIrKztcbnZhciBGVUxMUExBSU4gPSAndj8nICsgc3JjW01BSU5WRVJTSU9OXSArXG4gICAgICAgICAgICAgICAgc3JjW1BSRVJFTEVBU0VdICsgJz8nICtcbiAgICAgICAgICAgICAgICBzcmNbQlVJTERdICsgJz8nO1xuXG5zcmNbRlVMTF0gPSAnXicgKyBGVUxMUExBSU4gKyAnJCc7XG5cbi8vIGxpa2UgZnVsbCwgYnV0IGFsbG93cyB2MS4yLjMgYW5kID0xLjIuMywgd2hpY2ggcGVvcGxlIGRvIHNvbWV0aW1lcy5cbi8vIGFsc28sIDEuMC4wYWxwaGExIChwcmVyZWxlYXNlIHdpdGhvdXQgdGhlIGh5cGhlbikgd2hpY2ggaXMgcHJldHR5XG4vLyBjb21tb24gaW4gdGhlIG5wbSByZWdpc3RyeS5cbnZhciBMT09TRVBMQUlOID0gJ1t2PVxcXFxzXSonICsgc3JjW01BSU5WRVJTSU9OTE9PU0VdICtcbiAgICAgICAgICAgICAgICAgc3JjW1BSRVJFTEVBU0VMT09TRV0gKyAnPycgK1xuICAgICAgICAgICAgICAgICBzcmNbQlVJTERdICsgJz8nO1xuXG52YXIgTE9PU0UgPSBSKys7XG5zcmNbTE9PU0VdID0gJ14nICsgTE9PU0VQTEFJTiArICckJztcblxudmFyIEdUTFQgPSBSKys7XG5zcmNbR1RMVF0gPSAnKCg/Ojx8Pik/PT8pJztcblxuLy8gU29tZXRoaW5nIGxpa2UgXCIyLipcIiBvciBcIjEuMi54XCIuXG4vLyBOb3RlIHRoYXQgXCJ4LnhcIiBpcyBhIHZhbGlkIHhSYW5nZSBpZGVudGlmZXIsIG1lYW5pbmcgXCJhbnkgdmVyc2lvblwiXG4vLyBPbmx5IHRoZSBmaXJzdCBpdGVtIGlzIHN0cmljdGx5IHJlcXVpcmVkLlxudmFyIFhSQU5HRUlERU5USUZJRVJMT09TRSA9IFIrKztcbnNyY1tYUkFOR0VJREVOVElGSUVSTE9PU0VdID0gc3JjW05VTUVSSUNJREVOVElGSUVSTE9PU0VdICsgJ3x4fFh8XFxcXConO1xudmFyIFhSQU5HRUlERU5USUZJRVIgPSBSKys7XG5zcmNbWFJBTkdFSURFTlRJRklFUl0gPSBzcmNbTlVNRVJJQ0lERU5USUZJRVJdICsgJ3x4fFh8XFxcXConO1xuXG52YXIgWFJBTkdFUExBSU4gPSBSKys7XG5zcmNbWFJBTkdFUExBSU5dID0gJ1t2PVxcXFxzXSooJyArIHNyY1tYUkFOR0VJREVOVElGSUVSXSArICcpJyArXG4gICAgICAgICAgICAgICAgICAgJyg/OlxcXFwuKCcgKyBzcmNbWFJBTkdFSURFTlRJRklFUl0gKyAnKScgK1xuICAgICAgICAgICAgICAgICAgICcoPzpcXFxcLignICsgc3JjW1hSQU5HRUlERU5USUZJRVJdICsgJyknICtcbiAgICAgICAgICAgICAgICAgICAnKD86JyArIHNyY1tQUkVSRUxFQVNFXSArICcpPycgK1xuICAgICAgICAgICAgICAgICAgIHNyY1tCVUlMRF0gKyAnPycgK1xuICAgICAgICAgICAgICAgICAgICcpPyk/JztcblxudmFyIFhSQU5HRVBMQUlOTE9PU0UgPSBSKys7XG5zcmNbWFJBTkdFUExBSU5MT09TRV0gPSAnW3Y9XFxcXHNdKignICsgc3JjW1hSQU5HRUlERU5USUZJRVJMT09TRV0gKyAnKScgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJyg/OlxcXFwuKCcgKyBzcmNbWFJBTkdFSURFTlRJRklFUkxPT1NFXSArICcpJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnKD86XFxcXC4oJyArIHNyY1tYUkFOR0VJREVOVElGSUVSTE9PU0VdICsgJyknICtcbiAgICAgICAgICAgICAgICAgICAgICAgICcoPzonICsgc3JjW1BSRVJFTEVBU0VMT09TRV0gKyAnKT8nICtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNyY1tCVUlMRF0gKyAnPycgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJyk/KT8nO1xuXG52YXIgWFJBTkdFID0gUisrO1xuc3JjW1hSQU5HRV0gPSAnXicgKyBzcmNbR1RMVF0gKyAnXFxcXHMqJyArIHNyY1tYUkFOR0VQTEFJTl0gKyAnJCc7XG52YXIgWFJBTkdFTE9PU0UgPSBSKys7XG5zcmNbWFJBTkdFTE9PU0VdID0gJ14nICsgc3JjW0dUTFRdICsgJ1xcXFxzKicgKyBzcmNbWFJBTkdFUExBSU5MT09TRV0gKyAnJCc7XG5cbi8vIENvZXJjaW9uLlxuLy8gRXh0cmFjdCBhbnl0aGluZyB0aGF0IGNvdWxkIGNvbmNlaXZhYmx5IGJlIGEgcGFydCBvZiBhIHZhbGlkIHNlbXZlclxudmFyIENPRVJDRSA9IFIrKztcbnNyY1tDT0VSQ0VdID0gJyg/Ol58W15cXFxcZF0pJyArXG4gICAgICAgICAgICAgICcoXFxcXGR7MSwnICsgTUFYX1NBRkVfQ09NUE9ORU5UX0xFTkdUSCArICd9KScgK1xuICAgICAgICAgICAgICAnKD86XFxcXC4oXFxcXGR7MSwnICsgTUFYX1NBRkVfQ09NUE9ORU5UX0xFTkdUSCArICd9KSk/JyArXG4gICAgICAgICAgICAgICcoPzpcXFxcLihcXFxcZHsxLCcgKyBNQVhfU0FGRV9DT01QT05FTlRfTEVOR1RIICsgJ30pKT8nICtcbiAgICAgICAgICAgICAgJyg/OiR8W15cXFxcZF0pJztcblxuLy8gVGlsZGUgcmFuZ2VzLlxuLy8gTWVhbmluZyBpcyBcInJlYXNvbmFibHkgYXQgb3IgZ3JlYXRlciB0aGFuXCJcbnZhciBMT05FVElMREUgPSBSKys7XG5zcmNbTE9ORVRJTERFXSA9ICcoPzp+Pj8pJztcblxudmFyIFRJTERFVFJJTSA9IFIrKztcbnNyY1tUSUxERVRSSU1dID0gJyhcXFxccyopJyArIHNyY1tMT05FVElMREVdICsgJ1xcXFxzKyc7XG5yZVtUSUxERVRSSU1dID0gbmV3IFJlZ0V4cChzcmNbVElMREVUUklNXSwgJ2cnKTtcbnZhciB0aWxkZVRyaW1SZXBsYWNlID0gJyQxfic7XG5cbnZhciBUSUxERSA9IFIrKztcbnNyY1tUSUxERV0gPSAnXicgKyBzcmNbTE9ORVRJTERFXSArIHNyY1tYUkFOR0VQTEFJTl0gKyAnJCc7XG52YXIgVElMREVMT09TRSA9IFIrKztcbnNyY1tUSUxERUxPT1NFXSA9ICdeJyArIHNyY1tMT05FVElMREVdICsgc3JjW1hSQU5HRVBMQUlOTE9PU0VdICsgJyQnO1xuXG4vLyBDYXJldCByYW5nZXMuXG4vLyBNZWFuaW5nIGlzIFwiYXQgbGVhc3QgYW5kIGJhY2t3YXJkcyBjb21wYXRpYmxlIHdpdGhcIlxudmFyIExPTkVDQVJFVCA9IFIrKztcbnNyY1tMT05FQ0FSRVRdID0gJyg/OlxcXFxeKSc7XG5cbnZhciBDQVJFVFRSSU0gPSBSKys7XG5zcmNbQ0FSRVRUUklNXSA9ICcoXFxcXHMqKScgKyBzcmNbTE9ORUNBUkVUXSArICdcXFxccysnO1xucmVbQ0FSRVRUUklNXSA9IG5ldyBSZWdFeHAoc3JjW0NBUkVUVFJJTV0sICdnJyk7XG52YXIgY2FyZXRUcmltUmVwbGFjZSA9ICckMV4nO1xuXG52YXIgQ0FSRVQgPSBSKys7XG5zcmNbQ0FSRVRdID0gJ14nICsgc3JjW0xPTkVDQVJFVF0gKyBzcmNbWFJBTkdFUExBSU5dICsgJyQnO1xudmFyIENBUkVUTE9PU0UgPSBSKys7XG5zcmNbQ0FSRVRMT09TRV0gPSAnXicgKyBzcmNbTE9ORUNBUkVUXSArIHNyY1tYUkFOR0VQTEFJTkxPT1NFXSArICckJztcblxuLy8gQSBzaW1wbGUgZ3QvbHQvZXEgdGhpbmcsIG9yIGp1c3QgXCJcIiB0byBpbmRpY2F0ZSBcImFueSB2ZXJzaW9uXCJcbnZhciBDT01QQVJBVE9STE9PU0UgPSBSKys7XG5zcmNbQ09NUEFSQVRPUkxPT1NFXSA9ICdeJyArIHNyY1tHVExUXSArICdcXFxccyooJyArIExPT1NFUExBSU4gKyAnKSR8XiQnO1xudmFyIENPTVBBUkFUT1IgPSBSKys7XG5zcmNbQ09NUEFSQVRPUl0gPSAnXicgKyBzcmNbR1RMVF0gKyAnXFxcXHMqKCcgKyBGVUxMUExBSU4gKyAnKSR8XiQnO1xuXG5cbi8vIEFuIGV4cHJlc3Npb24gdG8gc3RyaXAgYW55IHdoaXRlc3BhY2UgYmV0d2VlbiB0aGUgZ3RsdCBhbmQgdGhlIHRoaW5nXG4vLyBpdCBtb2RpZmllcywgc28gdGhhdCBgPiAxLjIuM2AgPT0+IGA+MS4yLjNgXG52YXIgQ09NUEFSQVRPUlRSSU0gPSBSKys7XG5zcmNbQ09NUEFSQVRPUlRSSU1dID0gJyhcXFxccyopJyArIHNyY1tHVExUXSArXG4gICAgICAgICAgICAgICAgICAgICAgJ1xcXFxzKignICsgTE9PU0VQTEFJTiArICd8JyArIHNyY1tYUkFOR0VQTEFJTl0gKyAnKSc7XG5cbi8vIHRoaXMgb25lIGhhcyB0byB1c2UgdGhlIC9nIGZsYWdcbnJlW0NPTVBBUkFUT1JUUklNXSA9IG5ldyBSZWdFeHAoc3JjW0NPTVBBUkFUT1JUUklNXSwgJ2cnKTtcbnZhciBjb21wYXJhdG9yVHJpbVJlcGxhY2UgPSAnJDEkMiQzJztcblxuXG4vLyBTb21ldGhpbmcgbGlrZSBgMS4yLjMgLSAxLjIuNGBcbi8vIE5vdGUgdGhhdCB0aGVzZSBhbGwgdXNlIHRoZSBsb29zZSBmb3JtLCBiZWNhdXNlIHRoZXknbGwgYmVcbi8vIGNoZWNrZWQgYWdhaW5zdCBlaXRoZXIgdGhlIHN0cmljdCBvciBsb29zZSBjb21wYXJhdG9yIGZvcm1cbi8vIGxhdGVyLlxudmFyIEhZUEhFTlJBTkdFID0gUisrO1xuc3JjW0hZUEhFTlJBTkdFXSA9ICdeXFxcXHMqKCcgKyBzcmNbWFJBTkdFUExBSU5dICsgJyknICtcbiAgICAgICAgICAgICAgICAgICAnXFxcXHMrLVxcXFxzKycgK1xuICAgICAgICAgICAgICAgICAgICcoJyArIHNyY1tYUkFOR0VQTEFJTl0gKyAnKScgK1xuICAgICAgICAgICAgICAgICAgICdcXFxccyokJztcblxudmFyIEhZUEhFTlJBTkdFTE9PU0UgPSBSKys7XG5zcmNbSFlQSEVOUkFOR0VMT09TRV0gPSAnXlxcXFxzKignICsgc3JjW1hSQU5HRVBMQUlOTE9PU0VdICsgJyknICtcbiAgICAgICAgICAgICAgICAgICAgICAgICdcXFxccystXFxcXHMrJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnKCcgKyBzcmNbWFJBTkdFUExBSU5MT09TRV0gKyAnKScgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJ1xcXFxzKiQnO1xuXG4vLyBTdGFyIHJhbmdlcyBiYXNpY2FsbHkganVzdCBhbGxvdyBhbnl0aGluZyBhdCBhbGwuXG52YXIgU1RBUiA9IFIrKztcbnNyY1tTVEFSXSA9ICcoPHw+KT89P1xcXFxzKlxcXFwqJztcblxuLy8gQ29tcGlsZSB0byBhY3R1YWwgcmVnZXhwIG9iamVjdHMuXG4vLyBBbGwgYXJlIGZsYWctZnJlZSwgdW5sZXNzIHRoZXkgd2VyZSBjcmVhdGVkIGFib3ZlIHdpdGggYSBmbGFnLlxuZm9yICh2YXIgaSA9IDA7IGkgPCBSOyBpKyspIHtcbiAgZGVidWcoaSwgc3JjW2ldKTtcbiAgaWYgKCFyZVtpXSlcbiAgICByZVtpXSA9IG5ldyBSZWdFeHAoc3JjW2ldKTtcbn1cblxuZXhwb3J0cy5wYXJzZSA9IHBhcnNlO1xuZnVuY3Rpb24gcGFyc2UodmVyc2lvbiwgb3B0aW9ucykge1xuICBpZiAoIW9wdGlvbnMgfHwgdHlwZW9mIG9wdGlvbnMgIT09ICdvYmplY3QnKVxuICAgIG9wdGlvbnMgPSB7IGxvb3NlOiAhIW9wdGlvbnMsIGluY2x1ZGVQcmVyZWxlYXNlOiBmYWxzZSB9XG5cbiAgaWYgKHZlcnNpb24gaW5zdGFuY2VvZiBTZW1WZXIpXG4gICAgcmV0dXJuIHZlcnNpb247XG5cbiAgaWYgKHR5cGVvZiB2ZXJzaW9uICE9PSAnc3RyaW5nJylcbiAgICByZXR1cm4gbnVsbDtcblxuICBpZiAodmVyc2lvbi5sZW5ndGggPiBNQVhfTEVOR1RIKVxuICAgIHJldHVybiBudWxsO1xuXG4gIHZhciByID0gb3B0aW9ucy5sb29zZSA/IHJlW0xPT1NFXSA6IHJlW0ZVTExdO1xuICBpZiAoIXIudGVzdCh2ZXJzaW9uKSlcbiAgICByZXR1cm4gbnVsbDtcblxuICB0cnkge1xuICAgIHJldHVybiBuZXcgU2VtVmVyKHZlcnNpb24sIG9wdGlvbnMpO1xuICB9IGNhdGNoIChlcikge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbmV4cG9ydHMudmFsaWQgPSB2YWxpZDtcbmZ1bmN0aW9uIHZhbGlkKHZlcnNpb24sIG9wdGlvbnMpIHtcbiAgdmFyIHYgPSBwYXJzZSh2ZXJzaW9uLCBvcHRpb25zKTtcbiAgcmV0dXJuIHYgPyB2LnZlcnNpb24gOiBudWxsO1xufVxuXG5cbmV4cG9ydHMuY2xlYW4gPSBjbGVhbjtcbmZ1bmN0aW9uIGNsZWFuKHZlcnNpb24sIG9wdGlvbnMpIHtcbiAgdmFyIHMgPSBwYXJzZSh2ZXJzaW9uLnRyaW0oKS5yZXBsYWNlKC9eWz12XSsvLCAnJyksIG9wdGlvbnMpO1xuICByZXR1cm4gcyA/IHMudmVyc2lvbiA6IG51bGw7XG59XG5cbmV4cG9ydHMuU2VtVmVyID0gU2VtVmVyO1xuXG5mdW5jdGlvbiBTZW1WZXIodmVyc2lvbiwgb3B0aW9ucykge1xuICBpZiAoIW9wdGlvbnMgfHwgdHlwZW9mIG9wdGlvbnMgIT09ICdvYmplY3QnKVxuICAgIG9wdGlvbnMgPSB7IGxvb3NlOiAhIW9wdGlvbnMsIGluY2x1ZGVQcmVyZWxlYXNlOiBmYWxzZSB9XG4gIGlmICh2ZXJzaW9uIGluc3RhbmNlb2YgU2VtVmVyKSB7XG4gICAgaWYgKHZlcnNpb24ubG9vc2UgPT09IG9wdGlvbnMubG9vc2UpXG4gICAgICByZXR1cm4gdmVyc2lvbjtcbiAgICBlbHNlXG4gICAgICB2ZXJzaW9uID0gdmVyc2lvbi52ZXJzaW9uO1xuICB9IGVsc2UgaWYgKHR5cGVvZiB2ZXJzaW9uICE9PSAnc3RyaW5nJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgVmVyc2lvbjogJyArIHZlcnNpb24pO1xuICB9XG5cbiAgaWYgKHZlcnNpb24ubGVuZ3RoID4gTUFYX0xFTkdUSClcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCd2ZXJzaW9uIGlzIGxvbmdlciB0aGFuICcgKyBNQVhfTEVOR1RIICsgJyBjaGFyYWN0ZXJzJylcblxuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgU2VtVmVyKSlcbiAgICByZXR1cm4gbmV3IFNlbVZlcih2ZXJzaW9uLCBvcHRpb25zKTtcblxuICBkZWJ1ZygnU2VtVmVyJywgdmVyc2lvbiwgb3B0aW9ucyk7XG4gIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gIHRoaXMubG9vc2UgPSAhIW9wdGlvbnMubG9vc2U7XG5cbiAgdmFyIG0gPSB2ZXJzaW9uLnRyaW0oKS5tYXRjaChvcHRpb25zLmxvb3NlID8gcmVbTE9PU0VdIDogcmVbRlVMTF0pO1xuXG4gIGlmICghbSlcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIFZlcnNpb246ICcgKyB2ZXJzaW9uKTtcblxuICB0aGlzLnJhdyA9IHZlcnNpb247XG5cbiAgLy8gdGhlc2UgYXJlIGFjdHVhbGx5IG51bWJlcnNcbiAgdGhpcy5tYWpvciA9ICttWzFdO1xuICB0aGlzLm1pbm9yID0gK21bMl07XG4gIHRoaXMucGF0Y2ggPSArbVszXTtcblxuICBpZiAodGhpcy5tYWpvciA+IE1BWF9TQUZFX0lOVEVHRVIgfHwgdGhpcy5tYWpvciA8IDApXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBtYWpvciB2ZXJzaW9uJylcblxuICBpZiAodGhpcy5taW5vciA+IE1BWF9TQUZFX0lOVEVHRVIgfHwgdGhpcy5taW5vciA8IDApXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBtaW5vciB2ZXJzaW9uJylcblxuICBpZiAodGhpcy5wYXRjaCA+IE1BWF9TQUZFX0lOVEVHRVIgfHwgdGhpcy5wYXRjaCA8IDApXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBwYXRjaCB2ZXJzaW9uJylcblxuICAvLyBudW1iZXJpZnkgYW55IHByZXJlbGVhc2UgbnVtZXJpYyBpZHNcbiAgaWYgKCFtWzRdKVxuICAgIHRoaXMucHJlcmVsZWFzZSA9IFtdO1xuICBlbHNlXG4gICAgdGhpcy5wcmVyZWxlYXNlID0gbVs0XS5zcGxpdCgnLicpLm1hcChmdW5jdGlvbihpZCkge1xuICAgICAgaWYgKC9eWzAtOV0rJC8udGVzdChpZCkpIHtcbiAgICAgICAgdmFyIG51bSA9ICtpZDtcbiAgICAgICAgaWYgKG51bSA+PSAwICYmIG51bSA8IE1BWF9TQUZFX0lOVEVHRVIpXG4gICAgICAgICAgcmV0dXJuIG51bTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBpZDtcbiAgICB9KTtcblxuICB0aGlzLmJ1aWxkID0gbVs1XSA/IG1bNV0uc3BsaXQoJy4nKSA6IFtdO1xuICB0aGlzLmZvcm1hdCgpO1xufVxuXG5TZW1WZXIucHJvdG90eXBlLmZvcm1hdCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnZlcnNpb24gPSB0aGlzLm1ham9yICsgJy4nICsgdGhpcy5taW5vciArICcuJyArIHRoaXMucGF0Y2g7XG4gIGlmICh0aGlzLnByZXJlbGVhc2UubGVuZ3RoKVxuICAgIHRoaXMudmVyc2lvbiArPSAnLScgKyB0aGlzLnByZXJlbGVhc2Uuam9pbignLicpO1xuICByZXR1cm4gdGhpcy52ZXJzaW9uO1xufTtcblxuU2VtVmVyLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy52ZXJzaW9uO1xufTtcblxuU2VtVmVyLnByb3RvdHlwZS5jb21wYXJlID0gZnVuY3Rpb24ob3RoZXIpIHtcbiAgZGVidWcoJ1NlbVZlci5jb21wYXJlJywgdGhpcy52ZXJzaW9uLCB0aGlzLm9wdGlvbnMsIG90aGVyKTtcbiAgaWYgKCEob3RoZXIgaW5zdGFuY2VvZiBTZW1WZXIpKVxuICAgIG90aGVyID0gbmV3IFNlbVZlcihvdGhlciwgdGhpcy5vcHRpb25zKTtcblxuICByZXR1cm4gdGhpcy5jb21wYXJlTWFpbihvdGhlcikgfHwgdGhpcy5jb21wYXJlUHJlKG90aGVyKTtcbn07XG5cblNlbVZlci5wcm90b3R5cGUuY29tcGFyZU1haW4gPSBmdW5jdGlvbihvdGhlcikge1xuICBpZiAoIShvdGhlciBpbnN0YW5jZW9mIFNlbVZlcikpXG4gICAgb3RoZXIgPSBuZXcgU2VtVmVyKG90aGVyLCB0aGlzLm9wdGlvbnMpO1xuXG4gIHJldHVybiBjb21wYXJlSWRlbnRpZmllcnModGhpcy5tYWpvciwgb3RoZXIubWFqb3IpIHx8XG4gICAgICAgICBjb21wYXJlSWRlbnRpZmllcnModGhpcy5taW5vciwgb3RoZXIubWlub3IpIHx8XG4gICAgICAgICBjb21wYXJlSWRlbnRpZmllcnModGhpcy5wYXRjaCwgb3RoZXIucGF0Y2gpO1xufTtcblxuU2VtVmVyLnByb3RvdHlwZS5jb21wYXJlUHJlID0gZnVuY3Rpb24ob3RoZXIpIHtcbiAgaWYgKCEob3RoZXIgaW5zdGFuY2VvZiBTZW1WZXIpKVxuICAgIG90aGVyID0gbmV3IFNlbVZlcihvdGhlciwgdGhpcy5vcHRpb25zKTtcblxuICAvLyBOT1QgaGF2aW5nIGEgcHJlcmVsZWFzZSBpcyA+IGhhdmluZyBvbmVcbiAgaWYgKHRoaXMucHJlcmVsZWFzZS5sZW5ndGggJiYgIW90aGVyLnByZXJlbGVhc2UubGVuZ3RoKVxuICAgIHJldHVybiAtMTtcbiAgZWxzZSBpZiAoIXRoaXMucHJlcmVsZWFzZS5sZW5ndGggJiYgb3RoZXIucHJlcmVsZWFzZS5sZW5ndGgpXG4gICAgcmV0dXJuIDE7XG4gIGVsc2UgaWYgKCF0aGlzLnByZXJlbGVhc2UubGVuZ3RoICYmICFvdGhlci5wcmVyZWxlYXNlLmxlbmd0aClcbiAgICByZXR1cm4gMDtcblxuICB2YXIgaSA9IDA7XG4gIGRvIHtcbiAgICB2YXIgYSA9IHRoaXMucHJlcmVsZWFzZVtpXTtcbiAgICB2YXIgYiA9IG90aGVyLnByZXJlbGVhc2VbaV07XG4gICAgZGVidWcoJ3ByZXJlbGVhc2UgY29tcGFyZScsIGksIGEsIGIpO1xuICAgIGlmIChhID09PSB1bmRlZmluZWQgJiYgYiA9PT0gdW5kZWZpbmVkKVxuICAgICAgcmV0dXJuIDA7XG4gICAgZWxzZSBpZiAoYiA9PT0gdW5kZWZpbmVkKVxuICAgICAgcmV0dXJuIDE7XG4gICAgZWxzZSBpZiAoYSA9PT0gdW5kZWZpbmVkKVxuICAgICAgcmV0dXJuIC0xO1xuICAgIGVsc2UgaWYgKGEgPT09IGIpXG4gICAgICBjb250aW51ZTtcbiAgICBlbHNlXG4gICAgICByZXR1cm4gY29tcGFyZUlkZW50aWZpZXJzKGEsIGIpO1xuICB9IHdoaWxlICgrK2kpO1xufTtcblxuLy8gcHJlbWlub3Igd2lsbCBidW1wIHRoZSB2ZXJzaW9uIHVwIHRvIHRoZSBuZXh0IG1pbm9yIHJlbGVhc2UsIGFuZCBpbW1lZGlhdGVseVxuLy8gZG93biB0byBwcmUtcmVsZWFzZS4gcHJlbWFqb3IgYW5kIHByZXBhdGNoIHdvcmsgdGhlIHNhbWUgd2F5LlxuU2VtVmVyLnByb3RvdHlwZS5pbmMgPSBmdW5jdGlvbihyZWxlYXNlLCBpZGVudGlmaWVyKSB7XG4gIHN3aXRjaCAocmVsZWFzZSkge1xuICAgIGNhc2UgJ3ByZW1ham9yJzpcbiAgICAgIHRoaXMucHJlcmVsZWFzZS5sZW5ndGggPSAwO1xuICAgICAgdGhpcy5wYXRjaCA9IDA7XG4gICAgICB0aGlzLm1pbm9yID0gMDtcbiAgICAgIHRoaXMubWFqb3IrKztcbiAgICAgIHRoaXMuaW5jKCdwcmUnLCBpZGVudGlmaWVyKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3ByZW1pbm9yJzpcbiAgICAgIHRoaXMucHJlcmVsZWFzZS5sZW5ndGggPSAwO1xuICAgICAgdGhpcy5wYXRjaCA9IDA7XG4gICAgICB0aGlzLm1pbm9yKys7XG4gICAgICB0aGlzLmluYygncHJlJywgaWRlbnRpZmllcik7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdwcmVwYXRjaCc6XG4gICAgICAvLyBJZiB0aGlzIGlzIGFscmVhZHkgYSBwcmVyZWxlYXNlLCBpdCB3aWxsIGJ1bXAgdG8gdGhlIG5leHQgdmVyc2lvblxuICAgICAgLy8gZHJvcCBhbnkgcHJlcmVsZWFzZXMgdGhhdCBtaWdodCBhbHJlYWR5IGV4aXN0LCBzaW5jZSB0aGV5IGFyZSBub3RcbiAgICAgIC8vIHJlbGV2YW50IGF0IHRoaXMgcG9pbnQuXG4gICAgICB0aGlzLnByZXJlbGVhc2UubGVuZ3RoID0gMDtcbiAgICAgIHRoaXMuaW5jKCdwYXRjaCcsIGlkZW50aWZpZXIpO1xuICAgICAgdGhpcy5pbmMoJ3ByZScsIGlkZW50aWZpZXIpO1xuICAgICAgYnJlYWs7XG4gICAgLy8gSWYgdGhlIGlucHV0IGlzIGEgbm9uLXByZXJlbGVhc2UgdmVyc2lvbiwgdGhpcyBhY3RzIHRoZSBzYW1lIGFzXG4gICAgLy8gcHJlcGF0Y2guXG4gICAgY2FzZSAncHJlcmVsZWFzZSc6XG4gICAgICBpZiAodGhpcy5wcmVyZWxlYXNlLmxlbmd0aCA9PT0gMClcbiAgICAgICAgdGhpcy5pbmMoJ3BhdGNoJywgaWRlbnRpZmllcik7XG4gICAgICB0aGlzLmluYygncHJlJywgaWRlbnRpZmllcik7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ21ham9yJzpcbiAgICAgIC8vIElmIHRoaXMgaXMgYSBwcmUtbWFqb3IgdmVyc2lvbiwgYnVtcCB1cCB0byB0aGUgc2FtZSBtYWpvciB2ZXJzaW9uLlxuICAgICAgLy8gT3RoZXJ3aXNlIGluY3JlbWVudCBtYWpvci5cbiAgICAgIC8vIDEuMC4wLTUgYnVtcHMgdG8gMS4wLjBcbiAgICAgIC8vIDEuMS4wIGJ1bXBzIHRvIDIuMC4wXG4gICAgICBpZiAodGhpcy5taW5vciAhPT0gMCB8fCB0aGlzLnBhdGNoICE9PSAwIHx8IHRoaXMucHJlcmVsZWFzZS5sZW5ndGggPT09IDApXG4gICAgICAgIHRoaXMubWFqb3IrKztcbiAgICAgIHRoaXMubWlub3IgPSAwO1xuICAgICAgdGhpcy5wYXRjaCA9IDA7XG4gICAgICB0aGlzLnByZXJlbGVhc2UgPSBbXTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ21pbm9yJzpcbiAgICAgIC8vIElmIHRoaXMgaXMgYSBwcmUtbWlub3IgdmVyc2lvbiwgYnVtcCB1cCB0byB0aGUgc2FtZSBtaW5vciB2ZXJzaW9uLlxuICAgICAgLy8gT3RoZXJ3aXNlIGluY3JlbWVudCBtaW5vci5cbiAgICAgIC8vIDEuMi4wLTUgYnVtcHMgdG8gMS4yLjBcbiAgICAgIC8vIDEuMi4xIGJ1bXBzIHRvIDEuMy4wXG4gICAgICBpZiAodGhpcy5wYXRjaCAhPT0gMCB8fCB0aGlzLnByZXJlbGVhc2UubGVuZ3RoID09PSAwKVxuICAgICAgICB0aGlzLm1pbm9yKys7XG4gICAgICB0aGlzLnBhdGNoID0gMDtcbiAgICAgIHRoaXMucHJlcmVsZWFzZSA9IFtdO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncGF0Y2gnOlxuICAgICAgLy8gSWYgdGhpcyBpcyBub3QgYSBwcmUtcmVsZWFzZSB2ZXJzaW9uLCBpdCB3aWxsIGluY3JlbWVudCB0aGUgcGF0Y2guXG4gICAgICAvLyBJZiBpdCBpcyBhIHByZS1yZWxlYXNlIGl0IHdpbGwgYnVtcCB1cCB0byB0aGUgc2FtZSBwYXRjaCB2ZXJzaW9uLlxuICAgICAgLy8gMS4yLjAtNSBwYXRjaGVzIHRvIDEuMi4wXG4gICAgICAvLyAxLjIuMCBwYXRjaGVzIHRvIDEuMi4xXG4gICAgICBpZiAodGhpcy5wcmVyZWxlYXNlLmxlbmd0aCA9PT0gMClcbiAgICAgICAgdGhpcy5wYXRjaCsrO1xuICAgICAgdGhpcy5wcmVyZWxlYXNlID0gW107XG4gICAgICBicmVhaztcbiAgICAvLyBUaGlzIHByb2JhYmx5IHNob3VsZG4ndCBiZSB1c2VkIHB1YmxpY2x5LlxuICAgIC8vIDEuMC4wIFwicHJlXCIgd291bGQgYmVjb21lIDEuMC4wLTAgd2hpY2ggaXMgdGhlIHdyb25nIGRpcmVjdGlvbi5cbiAgICBjYXNlICdwcmUnOlxuICAgICAgaWYgKHRoaXMucHJlcmVsZWFzZS5sZW5ndGggPT09IDApXG4gICAgICAgIHRoaXMucHJlcmVsZWFzZSA9IFswXTtcbiAgICAgIGVsc2Uge1xuICAgICAgICB2YXIgaSA9IHRoaXMucHJlcmVsZWFzZS5sZW5ndGg7XG4gICAgICAgIHdoaWxlICgtLWkgPj0gMCkge1xuICAgICAgICAgIGlmICh0eXBlb2YgdGhpcy5wcmVyZWxlYXNlW2ldID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgdGhpcy5wcmVyZWxlYXNlW2ldKys7XG4gICAgICAgICAgICBpID0gLTI7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChpID09PSAtMSkgLy8gZGlkbid0IGluY3JlbWVudCBhbnl0aGluZ1xuICAgICAgICAgIHRoaXMucHJlcmVsZWFzZS5wdXNoKDApO1xuICAgICAgfVxuICAgICAgaWYgKGlkZW50aWZpZXIpIHtcbiAgICAgICAgLy8gMS4yLjAtYmV0YS4xIGJ1bXBzIHRvIDEuMi4wLWJldGEuMixcbiAgICAgICAgLy8gMS4yLjAtYmV0YS5mb29ibHogb3IgMS4yLjAtYmV0YSBidW1wcyB0byAxLjIuMC1iZXRhLjBcbiAgICAgICAgaWYgKHRoaXMucHJlcmVsZWFzZVswXSA9PT0gaWRlbnRpZmllcikge1xuICAgICAgICAgIGlmIChpc05hTih0aGlzLnByZXJlbGVhc2VbMV0pKVxuICAgICAgICAgICAgdGhpcy5wcmVyZWxlYXNlID0gW2lkZW50aWZpZXIsIDBdO1xuICAgICAgICB9IGVsc2VcbiAgICAgICAgICB0aGlzLnByZXJlbGVhc2UgPSBbaWRlbnRpZmllciwgMF07XG4gICAgICB9XG4gICAgICBicmVhaztcblxuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgaW5jcmVtZW50IGFyZ3VtZW50OiAnICsgcmVsZWFzZSk7XG4gIH1cbiAgdGhpcy5mb3JtYXQoKTtcbiAgdGhpcy5yYXcgPSB0aGlzLnZlcnNpb247XG4gIHJldHVybiB0aGlzO1xufTtcblxuZXhwb3J0cy5pbmMgPSBpbmM7XG5mdW5jdGlvbiBpbmModmVyc2lvbiwgcmVsZWFzZSwgbG9vc2UsIGlkZW50aWZpZXIpIHtcbiAgaWYgKHR5cGVvZihsb29zZSkgPT09ICdzdHJpbmcnKSB7XG4gICAgaWRlbnRpZmllciA9IGxvb3NlO1xuICAgIGxvb3NlID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgdHJ5IHtcbiAgICByZXR1cm4gbmV3IFNlbVZlcih2ZXJzaW9uLCBsb29zZSkuaW5jKHJlbGVhc2UsIGlkZW50aWZpZXIpLnZlcnNpb247XG4gIH0gY2F0Y2ggKGVyKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuZXhwb3J0cy5kaWZmID0gZGlmZjtcbmZ1bmN0aW9uIGRpZmYodmVyc2lvbjEsIHZlcnNpb24yKSB7XG4gIGlmIChlcSh2ZXJzaW9uMSwgdmVyc2lvbjIpKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH0gZWxzZSB7XG4gICAgdmFyIHYxID0gcGFyc2UodmVyc2lvbjEpO1xuICAgIHZhciB2MiA9IHBhcnNlKHZlcnNpb24yKTtcbiAgICBpZiAodjEucHJlcmVsZWFzZS5sZW5ndGggfHwgdjIucHJlcmVsZWFzZS5sZW5ndGgpIHtcbiAgICAgIGZvciAodmFyIGtleSBpbiB2MSkge1xuICAgICAgICBpZiAoa2V5ID09PSAnbWFqb3InIHx8IGtleSA9PT0gJ21pbm9yJyB8fCBrZXkgPT09ICdwYXRjaCcpIHtcbiAgICAgICAgICBpZiAodjFba2V5XSAhPT0gdjJba2V5XSkge1xuICAgICAgICAgICAgcmV0dXJuICdwcmUnK2tleTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiAncHJlcmVsZWFzZSc7XG4gICAgfVxuICAgIGZvciAodmFyIGtleSBpbiB2MSkge1xuICAgICAgaWYgKGtleSA9PT0gJ21ham9yJyB8fCBrZXkgPT09ICdtaW5vcicgfHwga2V5ID09PSAncGF0Y2gnKSB7XG4gICAgICAgIGlmICh2MVtrZXldICE9PSB2MltrZXldKSB7XG4gICAgICAgICAgcmV0dXJuIGtleTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnRzLmNvbXBhcmVJZGVudGlmaWVycyA9IGNvbXBhcmVJZGVudGlmaWVycztcblxudmFyIG51bWVyaWMgPSAvXlswLTldKyQvO1xuZnVuY3Rpb24gY29tcGFyZUlkZW50aWZpZXJzKGEsIGIpIHtcbiAgdmFyIGFudW0gPSBudW1lcmljLnRlc3QoYSk7XG4gIHZhciBibnVtID0gbnVtZXJpYy50ZXN0KGIpO1xuXG4gIGlmIChhbnVtICYmIGJudW0pIHtcbiAgICBhID0gK2E7XG4gICAgYiA9ICtiO1xuICB9XG5cbiAgcmV0dXJuIChhbnVtICYmICFibnVtKSA/IC0xIDpcbiAgICAgICAgIChibnVtICYmICFhbnVtKSA/IDEgOlxuICAgICAgICAgYSA8IGIgPyAtMSA6XG4gICAgICAgICBhID4gYiA/IDEgOlxuICAgICAgICAgMDtcbn1cblxuZXhwb3J0cy5yY29tcGFyZUlkZW50aWZpZXJzID0gcmNvbXBhcmVJZGVudGlmaWVycztcbmZ1bmN0aW9uIHJjb21wYXJlSWRlbnRpZmllcnMoYSwgYikge1xuICByZXR1cm4gY29tcGFyZUlkZW50aWZpZXJzKGIsIGEpO1xufVxuXG5leHBvcnRzLm1ham9yID0gbWFqb3I7XG5mdW5jdGlvbiBtYWpvcihhLCBsb29zZSkge1xuICByZXR1cm4gbmV3IFNlbVZlcihhLCBsb29zZSkubWFqb3I7XG59XG5cbmV4cG9ydHMubWlub3IgPSBtaW5vcjtcbmZ1bmN0aW9uIG1pbm9yKGEsIGxvb3NlKSB7XG4gIHJldHVybiBuZXcgU2VtVmVyKGEsIGxvb3NlKS5taW5vcjtcbn1cblxuZXhwb3J0cy5wYXRjaCA9IHBhdGNoO1xuZnVuY3Rpb24gcGF0Y2goYSwgbG9vc2UpIHtcbiAgcmV0dXJuIG5ldyBTZW1WZXIoYSwgbG9vc2UpLnBhdGNoO1xufVxuXG5leHBvcnRzLmNvbXBhcmUgPSBjb21wYXJlO1xuZnVuY3Rpb24gY29tcGFyZShhLCBiLCBsb29zZSkge1xuICByZXR1cm4gbmV3IFNlbVZlcihhLCBsb29zZSkuY29tcGFyZShuZXcgU2VtVmVyKGIsIGxvb3NlKSk7XG59XG5cbmV4cG9ydHMuY29tcGFyZUxvb3NlID0gY29tcGFyZUxvb3NlO1xuZnVuY3Rpb24gY29tcGFyZUxvb3NlKGEsIGIpIHtcbiAgcmV0dXJuIGNvbXBhcmUoYSwgYiwgdHJ1ZSk7XG59XG5cbmV4cG9ydHMucmNvbXBhcmUgPSByY29tcGFyZTtcbmZ1bmN0aW9uIHJjb21wYXJlKGEsIGIsIGxvb3NlKSB7XG4gIHJldHVybiBjb21wYXJlKGIsIGEsIGxvb3NlKTtcbn1cblxuZXhwb3J0cy5zb3J0ID0gc29ydDtcbmZ1bmN0aW9uIHNvcnQobGlzdCwgbG9vc2UpIHtcbiAgcmV0dXJuIGxpc3Quc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgcmV0dXJuIGV4cG9ydHMuY29tcGFyZShhLCBiLCBsb29zZSk7XG4gIH0pO1xufVxuXG5leHBvcnRzLnJzb3J0ID0gcnNvcnQ7XG5mdW5jdGlvbiByc29ydChsaXN0LCBsb29zZSkge1xuICByZXR1cm4gbGlzdC5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICByZXR1cm4gZXhwb3J0cy5yY29tcGFyZShhLCBiLCBsb29zZSk7XG4gIH0pO1xufVxuXG5leHBvcnRzLmd0ID0gZ3Q7XG5mdW5jdGlvbiBndChhLCBiLCBsb29zZSkge1xuICByZXR1cm4gY29tcGFyZShhLCBiLCBsb29zZSkgPiAwO1xufVxuXG5leHBvcnRzLmx0ID0gbHQ7XG5mdW5jdGlvbiBsdChhLCBiLCBsb29zZSkge1xuICByZXR1cm4gY29tcGFyZShhLCBiLCBsb29zZSkgPCAwO1xufVxuXG5leHBvcnRzLmVxID0gZXE7XG5mdW5jdGlvbiBlcShhLCBiLCBsb29zZSkge1xuICByZXR1cm4gY29tcGFyZShhLCBiLCBsb29zZSkgPT09IDA7XG59XG5cbmV4cG9ydHMubmVxID0gbmVxO1xuZnVuY3Rpb24gbmVxKGEsIGIsIGxvb3NlKSB7XG4gIHJldHVybiBjb21wYXJlKGEsIGIsIGxvb3NlKSAhPT0gMDtcbn1cblxuZXhwb3J0cy5ndGUgPSBndGU7XG5mdW5jdGlvbiBndGUoYSwgYiwgbG9vc2UpIHtcbiAgcmV0dXJuIGNvbXBhcmUoYSwgYiwgbG9vc2UpID49IDA7XG59XG5cbmV4cG9ydHMubHRlID0gbHRlO1xuZnVuY3Rpb24gbHRlKGEsIGIsIGxvb3NlKSB7XG4gIHJldHVybiBjb21wYXJlKGEsIGIsIGxvb3NlKSA8PSAwO1xufVxuXG5leHBvcnRzLmNtcCA9IGNtcDtcbmZ1bmN0aW9uIGNtcChhLCBvcCwgYiwgbG9vc2UpIHtcbiAgdmFyIHJldDtcbiAgc3dpdGNoIChvcCkge1xuICAgIGNhc2UgJz09PSc6XG4gICAgICBpZiAodHlwZW9mIGEgPT09ICdvYmplY3QnKSBhID0gYS52ZXJzaW9uO1xuICAgICAgaWYgKHR5cGVvZiBiID09PSAnb2JqZWN0JykgYiA9IGIudmVyc2lvbjtcbiAgICAgIHJldCA9IGEgPT09IGI7XG4gICAgICBicmVhaztcbiAgICBjYXNlICchPT0nOlxuICAgICAgaWYgKHR5cGVvZiBhID09PSAnb2JqZWN0JykgYSA9IGEudmVyc2lvbjtcbiAgICAgIGlmICh0eXBlb2YgYiA9PT0gJ29iamVjdCcpIGIgPSBiLnZlcnNpb247XG4gICAgICByZXQgPSBhICE9PSBiO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnJzogY2FzZSAnPSc6IGNhc2UgJz09JzogcmV0ID0gZXEoYSwgYiwgbG9vc2UpOyBicmVhaztcbiAgICBjYXNlICchPSc6IHJldCA9IG5lcShhLCBiLCBsb29zZSk7IGJyZWFrO1xuICAgIGNhc2UgJz4nOiByZXQgPSBndChhLCBiLCBsb29zZSk7IGJyZWFrO1xuICAgIGNhc2UgJz49JzogcmV0ID0gZ3RlKGEsIGIsIGxvb3NlKTsgYnJlYWs7XG4gICAgY2FzZSAnPCc6IHJldCA9IGx0KGEsIGIsIGxvb3NlKTsgYnJlYWs7XG4gICAgY2FzZSAnPD0nOiByZXQgPSBsdGUoYSwgYiwgbG9vc2UpOyBicmVhaztcbiAgICBkZWZhdWx0OiB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIG9wZXJhdG9yOiAnICsgb3ApO1xuICB9XG4gIHJldHVybiByZXQ7XG59XG5cbmV4cG9ydHMuQ29tcGFyYXRvciA9IENvbXBhcmF0b3I7XG5mdW5jdGlvbiBDb21wYXJhdG9yKGNvbXAsIG9wdGlvbnMpIHtcbiAgaWYgKCFvcHRpb25zIHx8IHR5cGVvZiBvcHRpb25zICE9PSAnb2JqZWN0JylcbiAgICBvcHRpb25zID0geyBsb29zZTogISFvcHRpb25zLCBpbmNsdWRlUHJlcmVsZWFzZTogZmFsc2UgfVxuXG4gIGlmIChjb21wIGluc3RhbmNlb2YgQ29tcGFyYXRvcikge1xuICAgIGlmIChjb21wLmxvb3NlID09PSAhIW9wdGlvbnMubG9vc2UpXG4gICAgICByZXR1cm4gY29tcDtcbiAgICBlbHNlXG4gICAgICBjb21wID0gY29tcC52YWx1ZTtcbiAgfVxuXG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBDb21wYXJhdG9yKSlcbiAgICByZXR1cm4gbmV3IENvbXBhcmF0b3IoY29tcCwgb3B0aW9ucyk7XG5cbiAgZGVidWcoJ2NvbXBhcmF0b3InLCBjb21wLCBvcHRpb25zKTtcbiAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgdGhpcy5sb29zZSA9ICEhb3B0aW9ucy5sb29zZTtcbiAgdGhpcy5wYXJzZShjb21wKTtcblxuICBpZiAodGhpcy5zZW12ZXIgPT09IEFOWSlcbiAgICB0aGlzLnZhbHVlID0gJyc7XG4gIGVsc2VcbiAgICB0aGlzLnZhbHVlID0gdGhpcy5vcGVyYXRvciArIHRoaXMuc2VtdmVyLnZlcnNpb247XG5cbiAgZGVidWcoJ2NvbXAnLCB0aGlzKTtcbn1cblxudmFyIEFOWSA9IHt9O1xuQ29tcGFyYXRvci5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbihjb21wKSB7XG4gIHZhciByID0gdGhpcy5vcHRpb25zLmxvb3NlID8gcmVbQ09NUEFSQVRPUkxPT1NFXSA6IHJlW0NPTVBBUkFUT1JdO1xuICB2YXIgbSA9IGNvbXAubWF0Y2gocik7XG5cbiAgaWYgKCFtKVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgY29tcGFyYXRvcjogJyArIGNvbXApO1xuXG4gIHRoaXMub3BlcmF0b3IgPSBtWzFdO1xuICBpZiAodGhpcy5vcGVyYXRvciA9PT0gJz0nKVxuICAgIHRoaXMub3BlcmF0b3IgPSAnJztcblxuICAvLyBpZiBpdCBsaXRlcmFsbHkgaXMganVzdCAnPicgb3IgJycgdGhlbiBhbGxvdyBhbnl0aGluZy5cbiAgaWYgKCFtWzJdKVxuICAgIHRoaXMuc2VtdmVyID0gQU5ZO1xuICBlbHNlXG4gICAgdGhpcy5zZW12ZXIgPSBuZXcgU2VtVmVyKG1bMl0sIHRoaXMub3B0aW9ucy5sb29zZSk7XG59O1xuXG5Db21wYXJhdG9yLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy52YWx1ZTtcbn07XG5cbkNvbXBhcmF0b3IucHJvdG90eXBlLnRlc3QgPSBmdW5jdGlvbih2ZXJzaW9uKSB7XG4gIGRlYnVnKCdDb21wYXJhdG9yLnRlc3QnLCB2ZXJzaW9uLCB0aGlzLm9wdGlvbnMubG9vc2UpO1xuXG4gIGlmICh0aGlzLnNlbXZlciA9PT0gQU5ZKVxuICAgIHJldHVybiB0cnVlO1xuXG4gIGlmICh0eXBlb2YgdmVyc2lvbiA9PT0gJ3N0cmluZycpXG4gICAgdmVyc2lvbiA9IG5ldyBTZW1WZXIodmVyc2lvbiwgdGhpcy5vcHRpb25zKTtcblxuICByZXR1cm4gY21wKHZlcnNpb24sIHRoaXMub3BlcmF0b3IsIHRoaXMuc2VtdmVyLCB0aGlzLm9wdGlvbnMpO1xufTtcblxuQ29tcGFyYXRvci5wcm90b3R5cGUuaW50ZXJzZWN0cyA9IGZ1bmN0aW9uKGNvbXAsIG9wdGlvbnMpIHtcbiAgaWYgKCEoY29tcCBpbnN0YW5jZW9mIENvbXBhcmF0b3IpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignYSBDb21wYXJhdG9yIGlzIHJlcXVpcmVkJyk7XG4gIH1cblxuICBpZiAoIW9wdGlvbnMgfHwgdHlwZW9mIG9wdGlvbnMgIT09ICdvYmplY3QnKVxuICAgIG9wdGlvbnMgPSB7IGxvb3NlOiAhIW9wdGlvbnMsIGluY2x1ZGVQcmVyZWxlYXNlOiBmYWxzZSB9XG5cbiAgdmFyIHJhbmdlVG1wO1xuXG4gIGlmICh0aGlzLm9wZXJhdG9yID09PSAnJykge1xuICAgIHJhbmdlVG1wID0gbmV3IFJhbmdlKGNvbXAudmFsdWUsIG9wdGlvbnMpO1xuICAgIHJldHVybiBzYXRpc2ZpZXModGhpcy52YWx1ZSwgcmFuZ2VUbXAsIG9wdGlvbnMpO1xuICB9IGVsc2UgaWYgKGNvbXAub3BlcmF0b3IgPT09ICcnKSB7XG4gICAgcmFuZ2VUbXAgPSBuZXcgUmFuZ2UodGhpcy52YWx1ZSwgb3B0aW9ucyk7XG4gICAgcmV0dXJuIHNhdGlzZmllcyhjb21wLnNlbXZlciwgcmFuZ2VUbXAsIG9wdGlvbnMpO1xuICB9XG5cbiAgdmFyIHNhbWVEaXJlY3Rpb25JbmNyZWFzaW5nID1cbiAgICAodGhpcy5vcGVyYXRvciA9PT0gJz49JyB8fCB0aGlzLm9wZXJhdG9yID09PSAnPicpICYmXG4gICAgKGNvbXAub3BlcmF0b3IgPT09ICc+PScgfHwgY29tcC5vcGVyYXRvciA9PT0gJz4nKTtcbiAgdmFyIHNhbWVEaXJlY3Rpb25EZWNyZWFzaW5nID1cbiAgICAodGhpcy5vcGVyYXRvciA9PT0gJzw9JyB8fCB0aGlzLm9wZXJhdG9yID09PSAnPCcpICYmXG4gICAgKGNvbXAub3BlcmF0b3IgPT09ICc8PScgfHwgY29tcC5vcGVyYXRvciA9PT0gJzwnKTtcbiAgdmFyIHNhbWVTZW1WZXIgPSB0aGlzLnNlbXZlci52ZXJzaW9uID09PSBjb21wLnNlbXZlci52ZXJzaW9uO1xuICB2YXIgZGlmZmVyZW50RGlyZWN0aW9uc0luY2x1c2l2ZSA9XG4gICAgKHRoaXMub3BlcmF0b3IgPT09ICc+PScgfHwgdGhpcy5vcGVyYXRvciA9PT0gJzw9JykgJiZcbiAgICAoY29tcC5vcGVyYXRvciA9PT0gJz49JyB8fCBjb21wLm9wZXJhdG9yID09PSAnPD0nKTtcbiAgdmFyIG9wcG9zaXRlRGlyZWN0aW9uc0xlc3NUaGFuID1cbiAgICBjbXAodGhpcy5zZW12ZXIsICc8JywgY29tcC5zZW12ZXIsIG9wdGlvbnMpICYmXG4gICAgKCh0aGlzLm9wZXJhdG9yID09PSAnPj0nIHx8IHRoaXMub3BlcmF0b3IgPT09ICc+JykgJiZcbiAgICAoY29tcC5vcGVyYXRvciA9PT0gJzw9JyB8fCBjb21wLm9wZXJhdG9yID09PSAnPCcpKTtcbiAgdmFyIG9wcG9zaXRlRGlyZWN0aW9uc0dyZWF0ZXJUaGFuID1cbiAgICBjbXAodGhpcy5zZW12ZXIsICc+JywgY29tcC5zZW12ZXIsIG9wdGlvbnMpICYmXG4gICAgKCh0aGlzLm9wZXJhdG9yID09PSAnPD0nIHx8IHRoaXMub3BlcmF0b3IgPT09ICc8JykgJiZcbiAgICAoY29tcC5vcGVyYXRvciA9PT0gJz49JyB8fCBjb21wLm9wZXJhdG9yID09PSAnPicpKTtcblxuICByZXR1cm4gc2FtZURpcmVjdGlvbkluY3JlYXNpbmcgfHwgc2FtZURpcmVjdGlvbkRlY3JlYXNpbmcgfHxcbiAgICAoc2FtZVNlbVZlciAmJiBkaWZmZXJlbnREaXJlY3Rpb25zSW5jbHVzaXZlKSB8fFxuICAgIG9wcG9zaXRlRGlyZWN0aW9uc0xlc3NUaGFuIHx8IG9wcG9zaXRlRGlyZWN0aW9uc0dyZWF0ZXJUaGFuO1xufTtcblxuXG5leHBvcnRzLlJhbmdlID0gUmFuZ2U7XG5mdW5jdGlvbiBSYW5nZShyYW5nZSwgb3B0aW9ucykge1xuICBpZiAoIW9wdGlvbnMgfHwgdHlwZW9mIG9wdGlvbnMgIT09ICdvYmplY3QnKVxuICAgIG9wdGlvbnMgPSB7IGxvb3NlOiAhIW9wdGlvbnMsIGluY2x1ZGVQcmVyZWxlYXNlOiBmYWxzZSB9XG5cbiAgaWYgKHJhbmdlIGluc3RhbmNlb2YgUmFuZ2UpIHtcbiAgICBpZiAocmFuZ2UubG9vc2UgPT09ICEhb3B0aW9ucy5sb29zZSAmJlxuICAgICAgICByYW5nZS5pbmNsdWRlUHJlcmVsZWFzZSA9PT0gISFvcHRpb25zLmluY2x1ZGVQcmVyZWxlYXNlKSB7XG4gICAgICByZXR1cm4gcmFuZ2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBuZXcgUmFuZ2UocmFuZ2UucmF3LCBvcHRpb25zKTtcbiAgICB9XG4gIH1cblxuICBpZiAocmFuZ2UgaW5zdGFuY2VvZiBDb21wYXJhdG9yKSB7XG4gICAgcmV0dXJuIG5ldyBSYW5nZShyYW5nZS52YWx1ZSwgb3B0aW9ucyk7XG4gIH1cblxuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgUmFuZ2UpKVxuICAgIHJldHVybiBuZXcgUmFuZ2UocmFuZ2UsIG9wdGlvbnMpO1xuXG4gIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gIHRoaXMubG9vc2UgPSAhIW9wdGlvbnMubG9vc2U7XG4gIHRoaXMuaW5jbHVkZVByZXJlbGVhc2UgPSAhIW9wdGlvbnMuaW5jbHVkZVByZXJlbGVhc2VcblxuICAvLyBGaXJzdCwgc3BsaXQgYmFzZWQgb24gYm9vbGVhbiBvciB8fFxuICB0aGlzLnJhdyA9IHJhbmdlO1xuICB0aGlzLnNldCA9IHJhbmdlLnNwbGl0KC9cXHMqXFx8XFx8XFxzKi8pLm1hcChmdW5jdGlvbihyYW5nZSkge1xuICAgIHJldHVybiB0aGlzLnBhcnNlUmFuZ2UocmFuZ2UudHJpbSgpKTtcbiAgfSwgdGhpcykuZmlsdGVyKGZ1bmN0aW9uKGMpIHtcbiAgICAvLyB0aHJvdyBvdXQgYW55IHRoYXQgYXJlIG5vdCByZWxldmFudCBmb3Igd2hhdGV2ZXIgcmVhc29uXG4gICAgcmV0dXJuIGMubGVuZ3RoO1xuICB9KTtcblxuICBpZiAoIXRoaXMuc2V0Lmxlbmd0aCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgU2VtVmVyIFJhbmdlOiAnICsgcmFuZ2UpO1xuICB9XG5cbiAgdGhpcy5mb3JtYXQoKTtcbn1cblxuUmFuZ2UucHJvdG90eXBlLmZvcm1hdCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnJhbmdlID0gdGhpcy5zZXQubWFwKGZ1bmN0aW9uKGNvbXBzKSB7XG4gICAgcmV0dXJuIGNvbXBzLmpvaW4oJyAnKS50cmltKCk7XG4gIH0pLmpvaW4oJ3x8JykudHJpbSgpO1xuICByZXR1cm4gdGhpcy5yYW5nZTtcbn07XG5cblJhbmdlLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5yYW5nZTtcbn07XG5cblJhbmdlLnByb3RvdHlwZS5wYXJzZVJhbmdlID0gZnVuY3Rpb24ocmFuZ2UpIHtcbiAgdmFyIGxvb3NlID0gdGhpcy5vcHRpb25zLmxvb3NlO1xuICByYW5nZSA9IHJhbmdlLnRyaW0oKTtcbiAgLy8gYDEuMi4zIC0gMS4yLjRgID0+IGA+PTEuMi4zIDw9MS4yLjRgXG4gIHZhciBociA9IGxvb3NlID8gcmVbSFlQSEVOUkFOR0VMT09TRV0gOiByZVtIWVBIRU5SQU5HRV07XG4gIHJhbmdlID0gcmFuZ2UucmVwbGFjZShociwgaHlwaGVuUmVwbGFjZSk7XG4gIGRlYnVnKCdoeXBoZW4gcmVwbGFjZScsIHJhbmdlKTtcbiAgLy8gYD4gMS4yLjMgPCAxLjIuNWAgPT4gYD4xLjIuMyA8MS4yLjVgXG4gIHJhbmdlID0gcmFuZ2UucmVwbGFjZShyZVtDT01QQVJBVE9SVFJJTV0sIGNvbXBhcmF0b3JUcmltUmVwbGFjZSk7XG4gIGRlYnVnKCdjb21wYXJhdG9yIHRyaW0nLCByYW5nZSwgcmVbQ09NUEFSQVRPUlRSSU1dKTtcblxuICAvLyBgfiAxLjIuM2AgPT4gYH4xLjIuM2BcbiAgcmFuZ2UgPSByYW5nZS5yZXBsYWNlKHJlW1RJTERFVFJJTV0sIHRpbGRlVHJpbVJlcGxhY2UpO1xuXG4gIC8vIGBeIDEuMi4zYCA9PiBgXjEuMi4zYFxuICByYW5nZSA9IHJhbmdlLnJlcGxhY2UocmVbQ0FSRVRUUklNXSwgY2FyZXRUcmltUmVwbGFjZSk7XG5cbiAgLy8gbm9ybWFsaXplIHNwYWNlc1xuICByYW5nZSA9IHJhbmdlLnNwbGl0KC9cXHMrLykuam9pbignICcpO1xuXG4gIC8vIEF0IHRoaXMgcG9pbnQsIHRoZSByYW5nZSBpcyBjb21wbGV0ZWx5IHRyaW1tZWQgYW5kXG4gIC8vIHJlYWR5IHRvIGJlIHNwbGl0IGludG8gY29tcGFyYXRvcnMuXG5cbiAgdmFyIGNvbXBSZSA9IGxvb3NlID8gcmVbQ09NUEFSQVRPUkxPT1NFXSA6IHJlW0NPTVBBUkFUT1JdO1xuICB2YXIgc2V0ID0gcmFuZ2Uuc3BsaXQoJyAnKS5tYXAoZnVuY3Rpb24oY29tcCkge1xuICAgIHJldHVybiBwYXJzZUNvbXBhcmF0b3IoY29tcCwgdGhpcy5vcHRpb25zKTtcbiAgfSwgdGhpcykuam9pbignICcpLnNwbGl0KC9cXHMrLyk7XG4gIGlmICh0aGlzLm9wdGlvbnMubG9vc2UpIHtcbiAgICAvLyBpbiBsb29zZSBtb2RlLCB0aHJvdyBvdXQgYW55IHRoYXQgYXJlIG5vdCB2YWxpZCBjb21wYXJhdG9yc1xuICAgIHNldCA9IHNldC5maWx0ZXIoZnVuY3Rpb24oY29tcCkge1xuICAgICAgcmV0dXJuICEhY29tcC5tYXRjaChjb21wUmUpO1xuICAgIH0pO1xuICB9XG4gIHNldCA9IHNldC5tYXAoZnVuY3Rpb24oY29tcCkge1xuICAgIHJldHVybiBuZXcgQ29tcGFyYXRvcihjb21wLCB0aGlzLm9wdGlvbnMpO1xuICB9LCB0aGlzKTtcblxuICByZXR1cm4gc2V0O1xufTtcblxuUmFuZ2UucHJvdG90eXBlLmludGVyc2VjdHMgPSBmdW5jdGlvbihyYW5nZSwgb3B0aW9ucykge1xuICBpZiAoIShyYW5nZSBpbnN0YW5jZW9mIFJhbmdlKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2EgUmFuZ2UgaXMgcmVxdWlyZWQnKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzLnNldC5zb21lKGZ1bmN0aW9uKHRoaXNDb21wYXJhdG9ycykge1xuICAgIHJldHVybiB0aGlzQ29tcGFyYXRvcnMuZXZlcnkoZnVuY3Rpb24odGhpc0NvbXBhcmF0b3IpIHtcbiAgICAgIHJldHVybiByYW5nZS5zZXQuc29tZShmdW5jdGlvbihyYW5nZUNvbXBhcmF0b3JzKSB7XG4gICAgICAgIHJldHVybiByYW5nZUNvbXBhcmF0b3JzLmV2ZXJ5KGZ1bmN0aW9uKHJhbmdlQ29tcGFyYXRvcikge1xuICAgICAgICAgIHJldHVybiB0aGlzQ29tcGFyYXRvci5pbnRlcnNlY3RzKHJhbmdlQ29tcGFyYXRvciwgb3B0aW9ucyk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xufTtcblxuLy8gTW9zdGx5IGp1c3QgZm9yIHRlc3RpbmcgYW5kIGxlZ2FjeSBBUEkgcmVhc29uc1xuZXhwb3J0cy50b0NvbXBhcmF0b3JzID0gdG9Db21wYXJhdG9ycztcbmZ1bmN0aW9uIHRvQ29tcGFyYXRvcnMocmFuZ2UsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIG5ldyBSYW5nZShyYW5nZSwgb3B0aW9ucykuc2V0Lm1hcChmdW5jdGlvbihjb21wKSB7XG4gICAgcmV0dXJuIGNvbXAubWFwKGZ1bmN0aW9uKGMpIHtcbiAgICAgIHJldHVybiBjLnZhbHVlO1xuICAgIH0pLmpvaW4oJyAnKS50cmltKCkuc3BsaXQoJyAnKTtcbiAgfSk7XG59XG5cbi8vIGNvbXByaXNlZCBvZiB4cmFuZ2VzLCB0aWxkZXMsIHN0YXJzLCBhbmQgZ3RsdCdzIGF0IHRoaXMgcG9pbnQuXG4vLyBhbHJlYWR5IHJlcGxhY2VkIHRoZSBoeXBoZW4gcmFuZ2VzXG4vLyB0dXJuIGludG8gYSBzZXQgb2YgSlVTVCBjb21wYXJhdG9ycy5cbmZ1bmN0aW9uIHBhcnNlQ29tcGFyYXRvcihjb21wLCBvcHRpb25zKSB7XG4gIGRlYnVnKCdjb21wJywgY29tcCwgb3B0aW9ucyk7XG4gIGNvbXAgPSByZXBsYWNlQ2FyZXRzKGNvbXAsIG9wdGlvbnMpO1xuICBkZWJ1ZygnY2FyZXQnLCBjb21wKTtcbiAgY29tcCA9IHJlcGxhY2VUaWxkZXMoY29tcCwgb3B0aW9ucyk7XG4gIGRlYnVnKCd0aWxkZXMnLCBjb21wKTtcbiAgY29tcCA9IHJlcGxhY2VYUmFuZ2VzKGNvbXAsIG9wdGlvbnMpO1xuICBkZWJ1ZygneHJhbmdlJywgY29tcCk7XG4gIGNvbXAgPSByZXBsYWNlU3RhcnMoY29tcCwgb3B0aW9ucyk7XG4gIGRlYnVnKCdzdGFycycsIGNvbXApO1xuICByZXR1cm4gY29tcDtcbn1cblxuZnVuY3Rpb24gaXNYKGlkKSB7XG4gIHJldHVybiAhaWQgfHwgaWQudG9Mb3dlckNhc2UoKSA9PT0gJ3gnIHx8IGlkID09PSAnKic7XG59XG5cbi8vIH4sIH4+IC0tPiAqIChhbnksIGtpbmRhIHNpbGx5KVxuLy8gfjIsIH4yLngsIH4yLngueCwgfj4yLCB+PjIueCB+PjIueC54IC0tPiA+PTIuMC4wIDwzLjAuMFxuLy8gfjIuMCwgfjIuMC54LCB+PjIuMCwgfj4yLjAueCAtLT4gPj0yLjAuMCA8Mi4xLjBcbi8vIH4xLjIsIH4xLjIueCwgfj4xLjIsIH4+MS4yLnggLS0+ID49MS4yLjAgPDEuMy4wXG4vLyB+MS4yLjMsIH4+MS4yLjMgLS0+ID49MS4yLjMgPDEuMy4wXG4vLyB+MS4yLjAsIH4+MS4yLjAgLS0+ID49MS4yLjAgPDEuMy4wXG5mdW5jdGlvbiByZXBsYWNlVGlsZGVzKGNvbXAsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIGNvbXAudHJpbSgpLnNwbGl0KC9cXHMrLykubWFwKGZ1bmN0aW9uKGNvbXApIHtcbiAgICByZXR1cm4gcmVwbGFjZVRpbGRlKGNvbXAsIG9wdGlvbnMpO1xuICB9KS5qb2luKCcgJyk7XG59XG5cbmZ1bmN0aW9uIHJlcGxhY2VUaWxkZShjb21wLCBvcHRpb25zKSB7XG4gIGlmICghb3B0aW9ucyB8fCB0eXBlb2Ygb3B0aW9ucyAhPT0gJ29iamVjdCcpXG4gICAgb3B0aW9ucyA9IHsgbG9vc2U6ICEhb3B0aW9ucywgaW5jbHVkZVByZXJlbGVhc2U6IGZhbHNlIH1cbiAgdmFyIHIgPSBvcHRpb25zLmxvb3NlID8gcmVbVElMREVMT09TRV0gOiByZVtUSUxERV07XG4gIHJldHVybiBjb21wLnJlcGxhY2UociwgZnVuY3Rpb24oXywgTSwgbSwgcCwgcHIpIHtcbiAgICBkZWJ1ZygndGlsZGUnLCBjb21wLCBfLCBNLCBtLCBwLCBwcik7XG4gICAgdmFyIHJldDtcblxuICAgIGlmIChpc1goTSkpXG4gICAgICByZXQgPSAnJztcbiAgICBlbHNlIGlmIChpc1gobSkpXG4gICAgICByZXQgPSAnPj0nICsgTSArICcuMC4wIDwnICsgKCtNICsgMSkgKyAnLjAuMCc7XG4gICAgZWxzZSBpZiAoaXNYKHApKVxuICAgICAgLy8gfjEuMiA9PSA+PTEuMi4wIDwxLjMuMFxuICAgICAgcmV0ID0gJz49JyArIE0gKyAnLicgKyBtICsgJy4wIDwnICsgTSArICcuJyArICgrbSArIDEpICsgJy4wJztcbiAgICBlbHNlIGlmIChwcikge1xuICAgICAgZGVidWcoJ3JlcGxhY2VUaWxkZSBwcicsIHByKTtcbiAgICAgIGlmIChwci5jaGFyQXQoMCkgIT09ICctJylcbiAgICAgICAgcHIgPSAnLScgKyBwcjtcbiAgICAgIHJldCA9ICc+PScgKyBNICsgJy4nICsgbSArICcuJyArIHAgKyBwciArXG4gICAgICAgICAgICAnIDwnICsgTSArICcuJyArICgrbSArIDEpICsgJy4wJztcbiAgICB9IGVsc2VcbiAgICAgIC8vIH4xLjIuMyA9PSA+PTEuMi4zIDwxLjMuMFxuICAgICAgcmV0ID0gJz49JyArIE0gKyAnLicgKyBtICsgJy4nICsgcCArXG4gICAgICAgICAgICAnIDwnICsgTSArICcuJyArICgrbSArIDEpICsgJy4wJztcblxuICAgIGRlYnVnKCd0aWxkZSByZXR1cm4nLCByZXQpO1xuICAgIHJldHVybiByZXQ7XG4gIH0pO1xufVxuXG4vLyBeIC0tPiAqIChhbnksIGtpbmRhIHNpbGx5KVxuLy8gXjIsIF4yLngsIF4yLngueCAtLT4gPj0yLjAuMCA8My4wLjBcbi8vIF4yLjAsIF4yLjAueCAtLT4gPj0yLjAuMCA8My4wLjBcbi8vIF4xLjIsIF4xLjIueCAtLT4gPj0xLjIuMCA8Mi4wLjBcbi8vIF4xLjIuMyAtLT4gPj0xLjIuMyA8Mi4wLjBcbi8vIF4xLjIuMCAtLT4gPj0xLjIuMCA8Mi4wLjBcbmZ1bmN0aW9uIHJlcGxhY2VDYXJldHMoY29tcCwgb3B0aW9ucykge1xuICByZXR1cm4gY29tcC50cmltKCkuc3BsaXQoL1xccysvKS5tYXAoZnVuY3Rpb24oY29tcCkge1xuICAgIHJldHVybiByZXBsYWNlQ2FyZXQoY29tcCwgb3B0aW9ucyk7XG4gIH0pLmpvaW4oJyAnKTtcbn1cblxuZnVuY3Rpb24gcmVwbGFjZUNhcmV0KGNvbXAsIG9wdGlvbnMpIHtcbiAgZGVidWcoJ2NhcmV0JywgY29tcCwgb3B0aW9ucyk7XG4gIGlmICghb3B0aW9ucyB8fCB0eXBlb2Ygb3B0aW9ucyAhPT0gJ29iamVjdCcpXG4gICAgb3B0aW9ucyA9IHsgbG9vc2U6ICEhb3B0aW9ucywgaW5jbHVkZVByZXJlbGVhc2U6IGZhbHNlIH1cbiAgdmFyIHIgPSBvcHRpb25zLmxvb3NlID8gcmVbQ0FSRVRMT09TRV0gOiByZVtDQVJFVF07XG4gIHJldHVybiBjb21wLnJlcGxhY2UociwgZnVuY3Rpb24oXywgTSwgbSwgcCwgcHIpIHtcbiAgICBkZWJ1ZygnY2FyZXQnLCBjb21wLCBfLCBNLCBtLCBwLCBwcik7XG4gICAgdmFyIHJldDtcblxuICAgIGlmIChpc1goTSkpXG4gICAgICByZXQgPSAnJztcbiAgICBlbHNlIGlmIChpc1gobSkpXG4gICAgICByZXQgPSAnPj0nICsgTSArICcuMC4wIDwnICsgKCtNICsgMSkgKyAnLjAuMCc7XG4gICAgZWxzZSBpZiAoaXNYKHApKSB7XG4gICAgICBpZiAoTSA9PT0gJzAnKVxuICAgICAgICByZXQgPSAnPj0nICsgTSArICcuJyArIG0gKyAnLjAgPCcgKyBNICsgJy4nICsgKCttICsgMSkgKyAnLjAnO1xuICAgICAgZWxzZVxuICAgICAgICByZXQgPSAnPj0nICsgTSArICcuJyArIG0gKyAnLjAgPCcgKyAoK00gKyAxKSArICcuMC4wJztcbiAgICB9IGVsc2UgaWYgKHByKSB7XG4gICAgICBkZWJ1ZygncmVwbGFjZUNhcmV0IHByJywgcHIpO1xuICAgICAgaWYgKHByLmNoYXJBdCgwKSAhPT0gJy0nKVxuICAgICAgICBwciA9ICctJyArIHByO1xuICAgICAgaWYgKE0gPT09ICcwJykge1xuICAgICAgICBpZiAobSA9PT0gJzAnKVxuICAgICAgICAgIHJldCA9ICc+PScgKyBNICsgJy4nICsgbSArICcuJyArIHAgKyBwciArXG4gICAgICAgICAgICAgICAgJyA8JyArIE0gKyAnLicgKyBtICsgJy4nICsgKCtwICsgMSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICByZXQgPSAnPj0nICsgTSArICcuJyArIG0gKyAnLicgKyBwICsgcHIgK1xuICAgICAgICAgICAgICAgICcgPCcgKyBNICsgJy4nICsgKCttICsgMSkgKyAnLjAnO1xuICAgICAgfSBlbHNlXG4gICAgICAgIHJldCA9ICc+PScgKyBNICsgJy4nICsgbSArICcuJyArIHAgKyBwciArXG4gICAgICAgICAgICAgICcgPCcgKyAoK00gKyAxKSArICcuMC4wJztcbiAgICB9IGVsc2Uge1xuICAgICAgZGVidWcoJ25vIHByJyk7XG4gICAgICBpZiAoTSA9PT0gJzAnKSB7XG4gICAgICAgIGlmIChtID09PSAnMCcpXG4gICAgICAgICAgcmV0ID0gJz49JyArIE0gKyAnLicgKyBtICsgJy4nICsgcCArXG4gICAgICAgICAgICAgICAgJyA8JyArIE0gKyAnLicgKyBtICsgJy4nICsgKCtwICsgMSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICByZXQgPSAnPj0nICsgTSArICcuJyArIG0gKyAnLicgKyBwICtcbiAgICAgICAgICAgICAgICAnIDwnICsgTSArICcuJyArICgrbSArIDEpICsgJy4wJztcbiAgICAgIH0gZWxzZVxuICAgICAgICByZXQgPSAnPj0nICsgTSArICcuJyArIG0gKyAnLicgKyBwICtcbiAgICAgICAgICAgICAgJyA8JyArICgrTSArIDEpICsgJy4wLjAnO1xuICAgIH1cblxuICAgIGRlYnVnKCdjYXJldCByZXR1cm4nLCByZXQpO1xuICAgIHJldHVybiByZXQ7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiByZXBsYWNlWFJhbmdlcyhjb21wLCBvcHRpb25zKSB7XG4gIGRlYnVnKCdyZXBsYWNlWFJhbmdlcycsIGNvbXAsIG9wdGlvbnMpO1xuICByZXR1cm4gY29tcC5zcGxpdCgvXFxzKy8pLm1hcChmdW5jdGlvbihjb21wKSB7XG4gICAgcmV0dXJuIHJlcGxhY2VYUmFuZ2UoY29tcCwgb3B0aW9ucyk7XG4gIH0pLmpvaW4oJyAnKTtcbn1cblxuZnVuY3Rpb24gcmVwbGFjZVhSYW5nZShjb21wLCBvcHRpb25zKSB7XG4gIGNvbXAgPSBjb21wLnRyaW0oKTtcbiAgaWYgKCFvcHRpb25zIHx8IHR5cGVvZiBvcHRpb25zICE9PSAnb2JqZWN0JylcbiAgICBvcHRpb25zID0geyBsb29zZTogISFvcHRpb25zLCBpbmNsdWRlUHJlcmVsZWFzZTogZmFsc2UgfVxuICB2YXIgciA9IG9wdGlvbnMubG9vc2UgPyByZVtYUkFOR0VMT09TRV0gOiByZVtYUkFOR0VdO1xuICByZXR1cm4gY29tcC5yZXBsYWNlKHIsIGZ1bmN0aW9uKHJldCwgZ3RsdCwgTSwgbSwgcCwgcHIpIHtcbiAgICBkZWJ1ZygneFJhbmdlJywgY29tcCwgcmV0LCBndGx0LCBNLCBtLCBwLCBwcik7XG4gICAgdmFyIHhNID0gaXNYKE0pO1xuICAgIHZhciB4bSA9IHhNIHx8IGlzWChtKTtcbiAgICB2YXIgeHAgPSB4bSB8fCBpc1gocCk7XG4gICAgdmFyIGFueVggPSB4cDtcblxuICAgIGlmIChndGx0ID09PSAnPScgJiYgYW55WClcbiAgICAgIGd0bHQgPSAnJztcblxuICAgIGlmICh4TSkge1xuICAgICAgaWYgKGd0bHQgPT09ICc+JyB8fCBndGx0ID09PSAnPCcpIHtcbiAgICAgICAgLy8gbm90aGluZyBpcyBhbGxvd2VkXG4gICAgICAgIHJldCA9ICc8MC4wLjAnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gbm90aGluZyBpcyBmb3JiaWRkZW5cbiAgICAgICAgcmV0ID0gJyonO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoZ3RsdCAmJiBhbnlYKSB7XG4gICAgICAvLyByZXBsYWNlIFggd2l0aCAwXG4gICAgICBpZiAoeG0pXG4gICAgICAgIG0gPSAwO1xuICAgICAgaWYgKHhwKVxuICAgICAgICBwID0gMDtcblxuICAgICAgaWYgKGd0bHQgPT09ICc+Jykge1xuICAgICAgICAvLyA+MSA9PiA+PTIuMC4wXG4gICAgICAgIC8vID4xLjIgPT4gPj0xLjMuMFxuICAgICAgICAvLyA+MS4yLjMgPT4gPj0gMS4yLjRcbiAgICAgICAgZ3RsdCA9ICc+PSc7XG4gICAgICAgIGlmICh4bSkge1xuICAgICAgICAgIE0gPSArTSArIDE7XG4gICAgICAgICAgbSA9IDA7XG4gICAgICAgICAgcCA9IDA7XG4gICAgICAgIH0gZWxzZSBpZiAoeHApIHtcbiAgICAgICAgICBtID0gK20gKyAxO1xuICAgICAgICAgIHAgPSAwO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGd0bHQgPT09ICc8PScpIHtcbiAgICAgICAgLy8gPD0wLjcueCBpcyBhY3R1YWxseSA8MC44LjAsIHNpbmNlIGFueSAwLjcueCBzaG91bGRcbiAgICAgICAgLy8gcGFzcy4gIFNpbWlsYXJseSwgPD03LnggaXMgYWN0dWFsbHkgPDguMC4wLCBldGMuXG4gICAgICAgIGd0bHQgPSAnPCc7XG4gICAgICAgIGlmICh4bSlcbiAgICAgICAgICBNID0gK00gKyAxO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgbSA9ICttICsgMTtcbiAgICAgIH1cblxuICAgICAgcmV0ID0gZ3RsdCArIE0gKyAnLicgKyBtICsgJy4nICsgcDtcbiAgICB9IGVsc2UgaWYgKHhtKSB7XG4gICAgICByZXQgPSAnPj0nICsgTSArICcuMC4wIDwnICsgKCtNICsgMSkgKyAnLjAuMCc7XG4gICAgfSBlbHNlIGlmICh4cCkge1xuICAgICAgcmV0ID0gJz49JyArIE0gKyAnLicgKyBtICsgJy4wIDwnICsgTSArICcuJyArICgrbSArIDEpICsgJy4wJztcbiAgICB9XG5cbiAgICBkZWJ1ZygneFJhbmdlIHJldHVybicsIHJldCk7XG5cbiAgICByZXR1cm4gcmV0O1xuICB9KTtcbn1cblxuLy8gQmVjYXVzZSAqIGlzIEFORC1lZCB3aXRoIGV2ZXJ5dGhpbmcgZWxzZSBpbiB0aGUgY29tcGFyYXRvcixcbi8vIGFuZCAnJyBtZWFucyBcImFueSB2ZXJzaW9uXCIsIGp1c3QgcmVtb3ZlIHRoZSAqcyBlbnRpcmVseS5cbmZ1bmN0aW9uIHJlcGxhY2VTdGFycyhjb21wLCBvcHRpb25zKSB7XG4gIGRlYnVnKCdyZXBsYWNlU3RhcnMnLCBjb21wLCBvcHRpb25zKTtcbiAgLy8gTG9vc2VuZXNzIGlzIGlnbm9yZWQgaGVyZS4gIHN0YXIgaXMgYWx3YXlzIGFzIGxvb3NlIGFzIGl0IGdldHMhXG4gIHJldHVybiBjb21wLnRyaW0oKS5yZXBsYWNlKHJlW1NUQVJdLCAnJyk7XG59XG5cbi8vIFRoaXMgZnVuY3Rpb24gaXMgcGFzc2VkIHRvIHN0cmluZy5yZXBsYWNlKHJlW0hZUEhFTlJBTkdFXSlcbi8vIE0sIG0sIHBhdGNoLCBwcmVyZWxlYXNlLCBidWlsZFxuLy8gMS4yIC0gMy40LjUgPT4gPj0xLjIuMCA8PTMuNC41XG4vLyAxLjIuMyAtIDMuNCA9PiA+PTEuMi4wIDwzLjUuMCBBbnkgMy40Lnggd2lsbCBkb1xuLy8gMS4yIC0gMy40ID0+ID49MS4yLjAgPDMuNS4wXG5mdW5jdGlvbiBoeXBoZW5SZXBsYWNlKCQwLFxuICAgICAgICAgICAgICAgICAgICAgICBmcm9tLCBmTSwgZm0sIGZwLCBmcHIsIGZiLFxuICAgICAgICAgICAgICAgICAgICAgICB0bywgdE0sIHRtLCB0cCwgdHByLCB0Yikge1xuXG4gIGlmIChpc1goZk0pKVxuICAgIGZyb20gPSAnJztcbiAgZWxzZSBpZiAoaXNYKGZtKSlcbiAgICBmcm9tID0gJz49JyArIGZNICsgJy4wLjAnO1xuICBlbHNlIGlmIChpc1goZnApKVxuICAgIGZyb20gPSAnPj0nICsgZk0gKyAnLicgKyBmbSArICcuMCc7XG4gIGVsc2VcbiAgICBmcm9tID0gJz49JyArIGZyb207XG5cbiAgaWYgKGlzWCh0TSkpXG4gICAgdG8gPSAnJztcbiAgZWxzZSBpZiAoaXNYKHRtKSlcbiAgICB0byA9ICc8JyArICgrdE0gKyAxKSArICcuMC4wJztcbiAgZWxzZSBpZiAoaXNYKHRwKSlcbiAgICB0byA9ICc8JyArIHRNICsgJy4nICsgKCt0bSArIDEpICsgJy4wJztcbiAgZWxzZSBpZiAodHByKVxuICAgIHRvID0gJzw9JyArIHRNICsgJy4nICsgdG0gKyAnLicgKyB0cCArICctJyArIHRwcjtcbiAgZWxzZVxuICAgIHRvID0gJzw9JyArIHRvO1xuXG4gIHJldHVybiAoZnJvbSArICcgJyArIHRvKS50cmltKCk7XG59XG5cblxuLy8gaWYgQU5ZIG9mIHRoZSBzZXRzIG1hdGNoIEFMTCBvZiBpdHMgY29tcGFyYXRvcnMsIHRoZW4gcGFzc1xuUmFuZ2UucHJvdG90eXBlLnRlc3QgPSBmdW5jdGlvbih2ZXJzaW9uKSB7XG4gIGlmICghdmVyc2lvbilcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgaWYgKHR5cGVvZiB2ZXJzaW9uID09PSAnc3RyaW5nJylcbiAgICB2ZXJzaW9uID0gbmV3IFNlbVZlcih2ZXJzaW9uLCB0aGlzLm9wdGlvbnMpO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5zZXQubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAodGVzdFNldCh0aGlzLnNldFtpXSwgdmVyc2lvbiwgdGhpcy5vcHRpb25zKSlcbiAgICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5cbmZ1bmN0aW9uIHRlc3RTZXQoc2V0LCB2ZXJzaW9uLCBvcHRpb25zKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc2V0Lmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKCFzZXRbaV0udGVzdCh2ZXJzaW9uKSlcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICghb3B0aW9ucylcbiAgICBvcHRpb25zID0ge31cblxuICBpZiAodmVyc2lvbi5wcmVyZWxlYXNlLmxlbmd0aCAmJiAhb3B0aW9ucy5pbmNsdWRlUHJlcmVsZWFzZSkge1xuICAgIC8vIEZpbmQgdGhlIHNldCBvZiB2ZXJzaW9ucyB0aGF0IGFyZSBhbGxvd2VkIHRvIGhhdmUgcHJlcmVsZWFzZXNcbiAgICAvLyBGb3IgZXhhbXBsZSwgXjEuMi4zLXByLjEgZGVzdWdhcnMgdG8gPj0xLjIuMy1wci4xIDwyLjAuMFxuICAgIC8vIFRoYXQgc2hvdWxkIGFsbG93IGAxLjIuMy1wci4yYCB0byBwYXNzLlxuICAgIC8vIEhvd2V2ZXIsIGAxLjIuNC1hbHBoYS5ub3RyZWFkeWAgc2hvdWxkIE5PVCBiZSBhbGxvd2VkLFxuICAgIC8vIGV2ZW4gdGhvdWdoIGl0J3Mgd2l0aGluIHRoZSByYW5nZSBzZXQgYnkgdGhlIGNvbXBhcmF0b3JzLlxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2V0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICBkZWJ1ZyhzZXRbaV0uc2VtdmVyKTtcbiAgICAgIGlmIChzZXRbaV0uc2VtdmVyID09PSBBTlkpXG4gICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICBpZiAoc2V0W2ldLnNlbXZlci5wcmVyZWxlYXNlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdmFyIGFsbG93ZWQgPSBzZXRbaV0uc2VtdmVyO1xuICAgICAgICBpZiAoYWxsb3dlZC5tYWpvciA9PT0gdmVyc2lvbi5tYWpvciAmJlxuICAgICAgICAgICAgYWxsb3dlZC5taW5vciA9PT0gdmVyc2lvbi5taW5vciAmJlxuICAgICAgICAgICAgYWxsb3dlZC5wYXRjaCA9PT0gdmVyc2lvbi5wYXRjaClcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBWZXJzaW9uIGhhcyBhIC1wcmUsIGJ1dCBpdCdzIG5vdCBvbmUgb2YgdGhlIG9uZXMgd2UgbGlrZS5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cblxuZXhwb3J0cy5zYXRpc2ZpZXMgPSBzYXRpc2ZpZXM7XG5mdW5jdGlvbiBzYXRpc2ZpZXModmVyc2lvbiwgcmFuZ2UsIG9wdGlvbnMpIHtcbiAgdHJ5IHtcbiAgICByYW5nZSA9IG5ldyBSYW5nZShyYW5nZSwgb3B0aW9ucyk7XG4gIH0gY2F0Y2ggKGVyKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiByYW5nZS50ZXN0KHZlcnNpb24pO1xufVxuXG5leHBvcnRzLm1heFNhdGlzZnlpbmcgPSBtYXhTYXRpc2Z5aW5nO1xuZnVuY3Rpb24gbWF4U2F0aXNmeWluZyh2ZXJzaW9ucywgcmFuZ2UsIG9wdGlvbnMpIHtcbiAgdmFyIG1heCA9IG51bGw7XG4gIHZhciBtYXhTViA9IG51bGw7XG4gIHRyeSB7XG4gICAgdmFyIHJhbmdlT2JqID0gbmV3IFJhbmdlKHJhbmdlLCBvcHRpb25zKTtcbiAgfSBjYXRjaCAoZXIpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICB2ZXJzaW9ucy5mb3JFYWNoKGZ1bmN0aW9uICh2KSB7XG4gICAgaWYgKHJhbmdlT2JqLnRlc3QodikpIHsgLy8gc2F0aXNmaWVzKHYsIHJhbmdlLCBvcHRpb25zKVxuICAgICAgaWYgKCFtYXggfHwgbWF4U1YuY29tcGFyZSh2KSA9PT0gLTEpIHsgLy8gY29tcGFyZShtYXgsIHYsIHRydWUpXG4gICAgICAgIG1heCA9IHY7XG4gICAgICAgIG1heFNWID0gbmV3IFNlbVZlcihtYXgsIG9wdGlvbnMpO1xuICAgICAgfVxuICAgIH1cbiAgfSlcbiAgcmV0dXJuIG1heDtcbn1cblxuZXhwb3J0cy5taW5TYXRpc2Z5aW5nID0gbWluU2F0aXNmeWluZztcbmZ1bmN0aW9uIG1pblNhdGlzZnlpbmcodmVyc2lvbnMsIHJhbmdlLCBvcHRpb25zKSB7XG4gIHZhciBtaW4gPSBudWxsO1xuICB2YXIgbWluU1YgPSBudWxsO1xuICB0cnkge1xuICAgIHZhciByYW5nZU9iaiA9IG5ldyBSYW5nZShyYW5nZSwgb3B0aW9ucyk7XG4gIH0gY2F0Y2ggKGVyKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmVyc2lvbnMuZm9yRWFjaChmdW5jdGlvbiAodikge1xuICAgIGlmIChyYW5nZU9iai50ZXN0KHYpKSB7IC8vIHNhdGlzZmllcyh2LCByYW5nZSwgb3B0aW9ucylcbiAgICAgIGlmICghbWluIHx8IG1pblNWLmNvbXBhcmUodikgPT09IDEpIHsgLy8gY29tcGFyZShtaW4sIHYsIHRydWUpXG4gICAgICAgIG1pbiA9IHY7XG4gICAgICAgIG1pblNWID0gbmV3IFNlbVZlcihtaW4sIG9wdGlvbnMpO1xuICAgICAgfVxuICAgIH1cbiAgfSlcbiAgcmV0dXJuIG1pbjtcbn1cblxuZXhwb3J0cy52YWxpZFJhbmdlID0gdmFsaWRSYW5nZTtcbmZ1bmN0aW9uIHZhbGlkUmFuZ2UocmFuZ2UsIG9wdGlvbnMpIHtcbiAgdHJ5IHtcbiAgICAvLyBSZXR1cm4gJyonIGluc3RlYWQgb2YgJycgc28gdGhhdCB0cnV0aGluZXNzIHdvcmtzLlxuICAgIC8vIFRoaXMgd2lsbCB0aHJvdyBpZiBpdCdzIGludmFsaWQgYW55d2F5XG4gICAgcmV0dXJuIG5ldyBSYW5nZShyYW5nZSwgb3B0aW9ucykucmFuZ2UgfHwgJyonO1xuICB9IGNhdGNoIChlcikge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbi8vIERldGVybWluZSBpZiB2ZXJzaW9uIGlzIGxlc3MgdGhhbiBhbGwgdGhlIHZlcnNpb25zIHBvc3NpYmxlIGluIHRoZSByYW5nZVxuZXhwb3J0cy5sdHIgPSBsdHI7XG5mdW5jdGlvbiBsdHIodmVyc2lvbiwgcmFuZ2UsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIG91dHNpZGUodmVyc2lvbiwgcmFuZ2UsICc8Jywgb3B0aW9ucyk7XG59XG5cbi8vIERldGVybWluZSBpZiB2ZXJzaW9uIGlzIGdyZWF0ZXIgdGhhbiBhbGwgdGhlIHZlcnNpb25zIHBvc3NpYmxlIGluIHRoZSByYW5nZS5cbmV4cG9ydHMuZ3RyID0gZ3RyO1xuZnVuY3Rpb24gZ3RyKHZlcnNpb24sIHJhbmdlLCBvcHRpb25zKSB7XG4gIHJldHVybiBvdXRzaWRlKHZlcnNpb24sIHJhbmdlLCAnPicsIG9wdGlvbnMpO1xufVxuXG5leHBvcnRzLm91dHNpZGUgPSBvdXRzaWRlO1xuZnVuY3Rpb24gb3V0c2lkZSh2ZXJzaW9uLCByYW5nZSwgaGlsbywgb3B0aW9ucykge1xuICB2ZXJzaW9uID0gbmV3IFNlbVZlcih2ZXJzaW9uLCBvcHRpb25zKTtcbiAgcmFuZ2UgPSBuZXcgUmFuZ2UocmFuZ2UsIG9wdGlvbnMpO1xuXG4gIHZhciBndGZuLCBsdGVmbiwgbHRmbiwgY29tcCwgZWNvbXA7XG4gIHN3aXRjaCAoaGlsbykge1xuICAgIGNhc2UgJz4nOlxuICAgICAgZ3RmbiA9IGd0O1xuICAgICAgbHRlZm4gPSBsdGU7XG4gICAgICBsdGZuID0gbHQ7XG4gICAgICBjb21wID0gJz4nO1xuICAgICAgZWNvbXAgPSAnPj0nO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnPCc6XG4gICAgICBndGZuID0gbHQ7XG4gICAgICBsdGVmbiA9IGd0ZTtcbiAgICAgIGx0Zm4gPSBndDtcbiAgICAgIGNvbXAgPSAnPCc7XG4gICAgICBlY29tcCA9ICc8PSc7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignTXVzdCBwcm92aWRlIGEgaGlsbyB2YWwgb2YgXCI8XCIgb3IgXCI+XCInKTtcbiAgfVxuXG4gIC8vIElmIGl0IHNhdGlzaWZlcyB0aGUgcmFuZ2UgaXQgaXMgbm90IG91dHNpZGVcbiAgaWYgKHNhdGlzZmllcyh2ZXJzaW9uLCByYW5nZSwgb3B0aW9ucykpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBGcm9tIG5vdyBvbiwgdmFyaWFibGUgdGVybXMgYXJlIGFzIGlmIHdlJ3JlIGluIFwiZ3RyXCIgbW9kZS5cbiAgLy8gYnV0IG5vdGUgdGhhdCBldmVyeXRoaW5nIGlzIGZsaXBwZWQgZm9yIHRoZSBcImx0clwiIGZ1bmN0aW9uLlxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcmFuZ2Uuc2V0Lmxlbmd0aDsgKytpKSB7XG4gICAgdmFyIGNvbXBhcmF0b3JzID0gcmFuZ2Uuc2V0W2ldO1xuXG4gICAgdmFyIGhpZ2ggPSBudWxsO1xuICAgIHZhciBsb3cgPSBudWxsO1xuXG4gICAgY29tcGFyYXRvcnMuZm9yRWFjaChmdW5jdGlvbihjb21wYXJhdG9yKSB7XG4gICAgICBpZiAoY29tcGFyYXRvci5zZW12ZXIgPT09IEFOWSkge1xuICAgICAgICBjb21wYXJhdG9yID0gbmV3IENvbXBhcmF0b3IoJz49MC4wLjAnKVxuICAgICAgfVxuICAgICAgaGlnaCA9IGhpZ2ggfHwgY29tcGFyYXRvcjtcbiAgICAgIGxvdyA9IGxvdyB8fCBjb21wYXJhdG9yO1xuICAgICAgaWYgKGd0Zm4oY29tcGFyYXRvci5zZW12ZXIsIGhpZ2guc2VtdmVyLCBvcHRpb25zKSkge1xuICAgICAgICBoaWdoID0gY29tcGFyYXRvcjtcbiAgICAgIH0gZWxzZSBpZiAobHRmbihjb21wYXJhdG9yLnNlbXZlciwgbG93LnNlbXZlciwgb3B0aW9ucykpIHtcbiAgICAgICAgbG93ID0gY29tcGFyYXRvcjtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIElmIHRoZSBlZGdlIHZlcnNpb24gY29tcGFyYXRvciBoYXMgYSBvcGVyYXRvciB0aGVuIG91ciB2ZXJzaW9uXG4gICAgLy8gaXNuJ3Qgb3V0c2lkZSBpdFxuICAgIGlmIChoaWdoLm9wZXJhdG9yID09PSBjb21wIHx8IGhpZ2gub3BlcmF0b3IgPT09IGVjb21wKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIGxvd2VzdCB2ZXJzaW9uIGNvbXBhcmF0b3IgaGFzIGFuIG9wZXJhdG9yIGFuZCBvdXIgdmVyc2lvblxuICAgIC8vIGlzIGxlc3MgdGhhbiBpdCB0aGVuIGl0IGlzbid0IGhpZ2hlciB0aGFuIHRoZSByYW5nZVxuICAgIGlmICgoIWxvdy5vcGVyYXRvciB8fCBsb3cub3BlcmF0b3IgPT09IGNvbXApICYmXG4gICAgICAgIGx0ZWZuKHZlcnNpb24sIGxvdy5zZW12ZXIpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBlbHNlIGlmIChsb3cub3BlcmF0b3IgPT09IGVjb21wICYmIGx0Zm4odmVyc2lvbiwgbG93LnNlbXZlcikpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbmV4cG9ydHMucHJlcmVsZWFzZSA9IHByZXJlbGVhc2U7XG5mdW5jdGlvbiBwcmVyZWxlYXNlKHZlcnNpb24sIG9wdGlvbnMpIHtcbiAgdmFyIHBhcnNlZCA9IHBhcnNlKHZlcnNpb24sIG9wdGlvbnMpO1xuICByZXR1cm4gKHBhcnNlZCAmJiBwYXJzZWQucHJlcmVsZWFzZS5sZW5ndGgpID8gcGFyc2VkLnByZXJlbGVhc2UgOiBudWxsO1xufVxuXG5leHBvcnRzLmludGVyc2VjdHMgPSBpbnRlcnNlY3RzO1xuZnVuY3Rpb24gaW50ZXJzZWN0cyhyMSwgcjIsIG9wdGlvbnMpIHtcbiAgcjEgPSBuZXcgUmFuZ2UocjEsIG9wdGlvbnMpXG4gIHIyID0gbmV3IFJhbmdlKHIyLCBvcHRpb25zKVxuICByZXR1cm4gcjEuaW50ZXJzZWN0cyhyMilcbn1cblxuZXhwb3J0cy5jb2VyY2UgPSBjb2VyY2U7XG5mdW5jdGlvbiBjb2VyY2UodmVyc2lvbikge1xuICBpZiAodmVyc2lvbiBpbnN0YW5jZW9mIFNlbVZlcilcbiAgICByZXR1cm4gdmVyc2lvbjtcblxuICBpZiAodHlwZW9mIHZlcnNpb24gIT09ICdzdHJpbmcnKVxuICAgIHJldHVybiBudWxsO1xuXG4gIHZhciBtYXRjaCA9IHZlcnNpb24ubWF0Y2gocmVbQ09FUkNFXSk7XG5cbiAgaWYgKG1hdGNoID09IG51bGwpXG4gICAgcmV0dXJuIG51bGw7XG5cbiAgcmV0dXJuIHBhcnNlKChtYXRjaFsxXSB8fCAnMCcpICsgJy4nICsgKG1hdGNoWzJdIHx8ICcwJykgKyAnLicgKyAobWF0Y2hbM10gfHwgJzAnKSk7IFxufVxuIiwiLy8gQGZsb3dcbmltcG9ydCBWdWUgZnJvbSAndnVlJ1xuaW1wb3J0IHNlbXZlciBmcm9tICdzZW12ZXInXG5cbmV4cG9ydCBmdW5jdGlvbiB0aHJvd0Vycm9yIChtc2c6IHN0cmluZyk6IHZvaWQge1xuICB0aHJvdyBuZXcgRXJyb3IoYFt2dWUtdGVzdC11dGlsc106ICR7bXNnfWApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3YXJuIChtc2c6IHN0cmluZyk6IHZvaWQge1xuICBjb25zb2xlLmVycm9yKGBbdnVlLXRlc3QtdXRpbHNdOiAke21zZ31gKVxufVxuXG5jb25zdCBjYW1lbGl6ZVJFID0gLy0oXFx3KS9nXG5cbmV4cG9ydCBjb25zdCBjYW1lbGl6ZSA9IChzdHI6IHN0cmluZyk6IHN0cmluZyA9PiB7XG4gIGNvbnN0IGNhbWVsaXplZFN0ciA9IHN0ci5yZXBsYWNlKGNhbWVsaXplUkUsIChfLCBjKSA9PlxuICAgIGMgPyBjLnRvVXBwZXJDYXNlKCkgOiAnJ1xuICApXG4gIHJldHVybiBjYW1lbGl6ZWRTdHIuY2hhckF0KDApLnRvTG93ZXJDYXNlKCkgKyBjYW1lbGl6ZWRTdHIuc2xpY2UoMSlcbn1cblxuLyoqXG4gKiBDYXBpdGFsaXplIGEgc3RyaW5nLlxuICovXG5leHBvcnQgY29uc3QgY2FwaXRhbGl6ZSA9IChzdHI6IHN0cmluZyk6IHN0cmluZyA9PlxuICBzdHIuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzdHIuc2xpY2UoMSlcblxuLyoqXG4gKiBIeXBoZW5hdGUgYSBjYW1lbENhc2Ugc3RyaW5nLlxuICovXG5jb25zdCBoeXBoZW5hdGVSRSA9IC9cXEIoW0EtWl0pL2dcbmV4cG9ydCBjb25zdCBoeXBoZW5hdGUgPSAoc3RyOiBzdHJpbmcpOiBzdHJpbmcgPT5cbiAgc3RyLnJlcGxhY2UoaHlwaGVuYXRlUkUsICctJDEnKS50b0xvd2VyQ2FzZSgpXG5cbmZ1bmN0aW9uIGhhc093blByb3BlcnR5IChvYmosIHByb3ApIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlQ29tcG9uZW50IChpZDogc3RyaW5nLCBjb21wb25lbnRzOiBPYmplY3QpIHtcbiAgaWYgKHR5cGVvZiBpZCAhPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm5cbiAgfVxuICAvLyBjaGVjayBsb2NhbCByZWdpc3RyYXRpb24gdmFyaWF0aW9ucyBmaXJzdFxuICBpZiAoaGFzT3duUHJvcGVydHkoY29tcG9uZW50cywgaWQpKSB7XG4gICAgcmV0dXJuIGNvbXBvbmVudHNbaWRdXG4gIH1cbiAgdmFyIGNhbWVsaXplZElkID0gY2FtZWxpemUoaWQpXG4gIGlmIChoYXNPd25Qcm9wZXJ0eShjb21wb25lbnRzLCBjYW1lbGl6ZWRJZCkpIHtcbiAgICByZXR1cm4gY29tcG9uZW50c1tjYW1lbGl6ZWRJZF1cbiAgfVxuICB2YXIgUGFzY2FsQ2FzZUlkID0gY2FwaXRhbGl6ZShjYW1lbGl6ZWRJZClcbiAgaWYgKGhhc093blByb3BlcnR5KGNvbXBvbmVudHMsIFBhc2NhbENhc2VJZCkpIHtcbiAgICByZXR1cm4gY29tcG9uZW50c1tQYXNjYWxDYXNlSWRdXG4gIH1cbiAgLy8gZmFsbGJhY2sgdG8gcHJvdG90eXBlIGNoYWluXG4gIHJldHVybiBjb21wb25lbnRzW2lkXSB8fCBjb21wb25lbnRzW2NhbWVsaXplZElkXSB8fCBjb21wb25lbnRzW1Bhc2NhbENhc2VJZF1cbn1cblxuY29uc3QgVUEgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJlxuICAnbmF2aWdhdG9yJyBpbiB3aW5kb3cgJiZcbiAgbmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpXG5cbmV4cG9ydCBjb25zdCBpc1BoYW50b21KUyA9IFVBICYmIFVBLmluY2x1ZGVzICYmXG4gIFVBLm1hdGNoKC9waGFudG9tanMvaSlcblxuZXhwb3J0IGNvbnN0IGlzRWRnZSA9IFVBICYmIFVBLmluZGV4T2YoJ2VkZ2UvJykgPiAwXG5leHBvcnQgY29uc3QgaXNDaHJvbWUgPSBVQSAmJiAvY2hyb21lXFwvXFxkKy8udGVzdChVQSkgJiYgIWlzRWRnZVxuXG4vLyBnZXQgdGhlIGV2ZW50IHVzZWQgdG8gdHJpZ2dlciB2LW1vZGVsIGhhbmRsZXIgdGhhdCB1cGRhdGVzIGJvdW5kIGRhdGFcbmV4cG9ydCBmdW5jdGlvbiBnZXRDaGVja2VkRXZlbnQgKCkge1xuICBjb25zdCB2ZXJzaW9uID0gVnVlLnZlcnNpb25cblxuICBpZiAoc2VtdmVyLnNhdGlzZmllcyh2ZXJzaW9uLCAnMi4xLjkgLSAyLjEuMTAnKSkge1xuICAgIHJldHVybiAnY2xpY2snXG4gIH1cblxuICBpZiAoc2VtdmVyLnNhdGlzZmllcyh2ZXJzaW9uLCAnMi4yIC0gMi40JykpIHtcbiAgICByZXR1cm4gaXNDaHJvbWUgPyAnY2xpY2snIDogJ2NoYW5nZSdcbiAgfVxuXG4gIC8vIGNoYW5nZSBpcyBoYW5kbGVyIGZvciB2ZXJzaW9uIDIuMCAtIDIuMS44LCBhbmQgMi41K1xuICByZXR1cm4gJ2NoYW5nZSdcbn1cbiIsIi8vIEBmbG93XG5pbXBvcnQgJCRWdWUgZnJvbSAndnVlJ1xuaW1wb3J0IHsgd2FybiB9IGZyb20gJ3NoYXJlZC91dGlsJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBhZGRNb2NrcyAoXG4gIF9WdWU6IENvbXBvbmVudCxcbiAgbW9ja2VkUHJvcGVydGllczogT2JqZWN0IHwgZmFsc2UgPSB7fVxuKTogdm9pZCB7XG4gIGlmIChtb2NrZWRQcm9wZXJ0aWVzID09PSBmYWxzZSkge1xuICAgIHJldHVyblxuICB9XG4gIE9iamVjdC5rZXlzKG1vY2tlZFByb3BlcnRpZXMpLmZvckVhY2goa2V5ID0+IHtcbiAgICB0cnkge1xuICAgICAgLy8gJEZsb3dJZ25vcmVcbiAgICAgIF9WdWUucHJvdG90eXBlW2tleV0gPSBtb2NrZWRQcm9wZXJ0aWVzW2tleV1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB3YXJuKFxuICAgICAgICBgY291bGQgbm90IG92ZXJ3cml0ZSBwcm9wZXJ0eSAke2tleX0sIHRoaXMgaXMgYCArXG4gICAgICAgIGB1c3VhbGx5IGNhdXNlZCBieSBhIHBsdWdpbiB0aGF0IGhhcyBhZGRlZCBgICtcbiAgICAgICAgYHRoZSBwcm9wZXJ0eSBhcyBhIHJlYWQtb25seSB2YWx1ZWBcbiAgICAgIClcbiAgICB9XG4gICAgLy8gJEZsb3dJZ25vcmVcbiAgICAkJFZ1ZS51dGlsLmRlZmluZVJlYWN0aXZlKF9WdWUsIGtleSwgbW9ja2VkUHJvcGVydGllc1trZXldKVxuICB9KVxufVxuIiwiLy8gQGZsb3dcblxuZXhwb3J0IGZ1bmN0aW9uIGxvZ0V2ZW50cyAoXG4gIHZtOiBDb21wb25lbnQsXG4gIGVtaXR0ZWQ6IE9iamVjdCxcbiAgZW1pdHRlZEJ5T3JkZXI6IEFycmF5PGFueT5cbik6IHZvaWQge1xuICBjb25zdCBlbWl0ID0gdm0uJGVtaXRcbiAgdm0uJGVtaXQgPSAobmFtZSwgLi4uYXJncykgPT4ge1xuICAgIChlbWl0dGVkW25hbWVdIHx8IChlbWl0dGVkW25hbWVdID0gW10pKS5wdXNoKGFyZ3MpXG4gICAgZW1pdHRlZEJ5T3JkZXIucHVzaCh7IG5hbWUsIGFyZ3MgfSlcbiAgICByZXR1cm4gZW1pdC5jYWxsKHZtLCBuYW1lLCAuLi5hcmdzKVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRFdmVudExvZ2dlciAoX1Z1ZTogQ29tcG9uZW50KTogdm9pZCB7XG4gIF9WdWUubWl4aW4oe1xuICAgIGJlZm9yZUNyZWF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5fX2VtaXR0ZWQgPSBPYmplY3QuY3JlYXRlKG51bGwpXG4gICAgICB0aGlzLl9fZW1pdHRlZEJ5T3JkZXIgPSBbXVxuICAgICAgbG9nRXZlbnRzKHRoaXMsIHRoaXMuX19lbWl0dGVkLCB0aGlzLl9fZW1pdHRlZEJ5T3JkZXIpXG4gICAgfVxuICB9KVxufVxuIiwiaW1wb3J0IFZ1ZSBmcm9tICd2dWUnXG5pbXBvcnQgc2VtdmVyIGZyb20gJ3NlbXZlcidcblxuZXhwb3J0IGNvbnN0IE5BTUVfU0VMRUNUT1IgPSAnTkFNRV9TRUxFQ1RPUidcbmV4cG9ydCBjb25zdCBDT01QT05FTlRfU0VMRUNUT1IgPSAnQ09NUE9ORU5UX1NFTEVDVE9SJ1xuZXhwb3J0IGNvbnN0IFJFRl9TRUxFQ1RPUiA9ICdSRUZfU0VMRUNUT1InXG5leHBvcnQgY29uc3QgRE9NX1NFTEVDVE9SID0gJ0RPTV9TRUxFQ1RPUidcbmV4cG9ydCBjb25zdCBJTlZBTElEX1NFTEVDVE9SID0gJ0lOVkFMSURfU0VMRUNUT1InXG5cbmV4cG9ydCBjb25zdCBWVUVfVkVSU0lPTiA9IE51bWJlcihcbiAgYCR7VnVlLnZlcnNpb24uc3BsaXQoJy4nKVswXX0uJHtWdWUudmVyc2lvbi5zcGxpdCgnLicpWzFdfWBcbilcblxuZXhwb3J0IGNvbnN0IEZVTkNUSU9OQUxfT1BUSU9OUyA9XG4gIFZVRV9WRVJTSU9OID49IDIuNSA/ICdmbk9wdGlvbnMnIDogJ2Z1bmN0aW9uYWxPcHRpb25zJ1xuXG5leHBvcnQgY29uc3QgQkVGT1JFX1JFTkRFUl9MSUZFQ1lDTEVfSE9PSyA9XG4gIHNlbXZlci5ndChWdWUudmVyc2lvbiwgJzIuMS44JylcbiAgICA/ICdiZWZvcmVDcmVhdGUnXG4gICAgOiAnYmVmb3JlTW91bnQnXG5cbmV4cG9ydCBjb25zdCBDUkVBVEVfRUxFTUVOVF9BTElBUyA9IHNlbXZlci5ndChWdWUudmVyc2lvbiwgJzIuMS41JylcbiAgPyAnX2MnXG4gIDogJ19oJ1xuIiwiaW1wb3J0IHsgQkVGT1JFX1JFTkRFUl9MSUZFQ1lDTEVfSE9PSyB9IGZyb20gJ3NoYXJlZC9jb25zdHMnXG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRTdHVicyAoX1Z1ZSwgc3R1YkNvbXBvbmVudHMpIHtcbiAgZnVuY3Rpb24gYWRkU3R1YkNvbXBvbmVudHNNaXhpbiAoKSB7XG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLiRvcHRpb25zLmNvbXBvbmVudHMsIHN0dWJDb21wb25lbnRzKVxuICB9XG5cbiAgX1Z1ZS5taXhpbih7XG4gICAgW0JFRk9SRV9SRU5ERVJfTElGRUNZQ0xFX0hPT0tdOiBhZGRTdHViQ29tcG9uZW50c01peGluXG4gIH0pXG59XG4iLCIvLyBAZmxvd1xuaW1wb3J0IHsgdGhyb3dFcnJvciwgY2FwaXRhbGl6ZSwgY2FtZWxpemUsIGh5cGhlbmF0ZSB9IGZyb20gJy4vdXRpbCdcblxuZXhwb3J0IGZ1bmN0aW9uIGlzRG9tU2VsZWN0b3IgKHNlbGVjdG9yOiBhbnkpOiBib29sZWFuIHtcbiAgaWYgKHR5cGVvZiBzZWxlY3RvciAhPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIHRyeSB7XG4gICAgaWYgKHR5cGVvZiBkb2N1bWVudCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRocm93RXJyb3IoXG4gICAgICAgIGBtb3VudCBtdXN0IGJlIHJ1biBpbiBhIGJyb3dzZXIgZW52aXJvbm1lbnQgbGlrZSBgICtcbiAgICAgICAgICBgUGhhbnRvbUpTLCBqc2RvbSBvciBjaHJvbWVgXG4gICAgICApXG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHRocm93RXJyb3IoXG4gICAgICBgbW91bnQgbXVzdCBiZSBydW4gaW4gYSBicm93c2VyIGVudmlyb25tZW50IGxpa2UgYCArXG4gICAgICAgIGBQaGFudG9tSlMsIGpzZG9tIG9yIGNocm9tZWBcbiAgICApXG4gIH1cblxuICB0cnkge1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpXG4gICAgcmV0dXJuIHRydWVcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNWdWVDb21wb25lbnQgKGNvbXBvbmVudDogYW55KTogYm9vbGVhbiB7XG4gIGlmICh0eXBlb2YgY29tcG9uZW50ID09PSAnZnVuY3Rpb24nICYmIGNvbXBvbmVudC5vcHRpb25zKSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIGlmIChjb21wb25lbnQgPT09IG51bGwgfHwgdHlwZW9mIGNvbXBvbmVudCAhPT0gJ29iamVjdCcpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIGlmIChjb21wb25lbnQuZXh0ZW5kcyB8fCBjb21wb25lbnQuX0N0b3IpIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgaWYgKHR5cGVvZiBjb21wb25lbnQudGVtcGxhdGUgPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIHJldHVybiB0eXBlb2YgY29tcG9uZW50LnJlbmRlciA9PT0gJ2Z1bmN0aW9uJ1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tcG9uZW50TmVlZHNDb21waWxpbmcgKGNvbXBvbmVudDogQ29tcG9uZW50KTogYm9vbGVhbiB7XG4gIHJldHVybiAoXG4gICAgY29tcG9uZW50ICYmXG4gICAgIWNvbXBvbmVudC5yZW5kZXIgJiZcbiAgICAoY29tcG9uZW50LnRlbXBsYXRlIHx8IGNvbXBvbmVudC5leHRlbmRzIHx8IGNvbXBvbmVudC5leHRlbmRPcHRpb25zKSAmJlxuICAgICFjb21wb25lbnQuZnVuY3Rpb25hbFxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1JlZlNlbGVjdG9yIChyZWZPcHRpb25zT2JqZWN0OiBhbnkpOiBib29sZWFuIHtcbiAgaWYgKFxuICAgIHR5cGVvZiByZWZPcHRpb25zT2JqZWN0ICE9PSAnb2JqZWN0JyB8fFxuICAgIE9iamVjdC5rZXlzKHJlZk9wdGlvbnNPYmplY3QgfHwge30pLmxlbmd0aCAhPT0gMVxuICApIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIHJldHVybiB0eXBlb2YgcmVmT3B0aW9uc09iamVjdC5yZWYgPT09ICdzdHJpbmcnXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc05hbWVTZWxlY3RvciAobmFtZU9wdGlvbnNPYmplY3Q6IGFueSk6IGJvb2xlYW4ge1xuICBpZiAodHlwZW9mIG5hbWVPcHRpb25zT2JqZWN0ICE9PSAnb2JqZWN0JyB8fCBuYW1lT3B0aW9uc09iamVjdCA9PT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgcmV0dXJuICEhbmFtZU9wdGlvbnNPYmplY3QubmFtZVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdGVtcGxhdGVDb250YWluc0NvbXBvbmVudCAoXG4gIHRlbXBsYXRlOiBzdHJpbmcsXG4gIG5hbWU6IHN0cmluZ1xuKTogYm9vbGVhbiB7XG4gIHJldHVybiBbY2FwaXRhbGl6ZSwgY2FtZWxpemUsIGh5cGhlbmF0ZV0uc29tZShmb3JtYXQgPT4ge1xuICAgIGNvbnN0IHJlID0gbmV3IFJlZ0V4cChgPCR7Zm9ybWF0KG5hbWUpfVxcXFxzKihcXFxcc3w+fChcXC8+KSlgLCAnZycpXG4gICAgcmV0dXJuIHJlLnRlc3QodGVtcGxhdGUpXG4gIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1BsYWluT2JqZWN0IChvYmo6IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IE9iamVjdF0nXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1JlcXVpcmVkQ29tcG9uZW50IChuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIChcbiAgICBuYW1lID09PSAnS2VlcEFsaXZlJyB8fCBuYW1lID09PSAnVHJhbnNpdGlvbicgfHwgbmFtZSA9PT0gJ1RyYW5zaXRpb25Hcm91cCdcbiAgKVxufVxuXG5mdW5jdGlvbiBtYWtlTWFwIChcbiAgc3RyOiBzdHJpbmcsXG4gIGV4cGVjdHNMb3dlckNhc2U/OiBib29sZWFuXG4pIHtcbiAgdmFyIG1hcCA9IE9iamVjdC5jcmVhdGUobnVsbClcbiAgdmFyIGxpc3QgPSBzdHIuc3BsaXQoJywnKVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICBtYXBbbGlzdFtpXV0gPSB0cnVlXG4gIH1cbiAgcmV0dXJuIGV4cGVjdHNMb3dlckNhc2VcbiAgICA/IGZ1bmN0aW9uICh2YWw6IHN0cmluZykgeyByZXR1cm4gbWFwW3ZhbC50b0xvd2VyQ2FzZSgpXSB9XG4gICAgOiBmdW5jdGlvbiAodmFsOiBzdHJpbmcpIHsgcmV0dXJuIG1hcFt2YWxdIH1cbn1cblxuZXhwb3J0IGNvbnN0IGlzSFRNTFRhZyA9IG1ha2VNYXAoXG4gICdodG1sLGJvZHksYmFzZSxoZWFkLGxpbmssbWV0YSxzdHlsZSx0aXRsZSwnICtcbiAgJ2FkZHJlc3MsYXJ0aWNsZSxhc2lkZSxmb290ZXIsaGVhZGVyLGgxLGgyLGgzLGg0LGg1LGg2LGhncm91cCxuYXYsc2VjdGlvbiwnICtcbiAgJ2RpdixkZCxkbCxkdCxmaWdjYXB0aW9uLGZpZ3VyZSxwaWN0dXJlLGhyLGltZyxsaSxtYWluLG9sLHAscHJlLHVsLCcgK1xuICAnYSxiLGFiYnIsYmRpLGJkbyxicixjaXRlLGNvZGUsZGF0YSxkZm4sZW0saSxrYmQsbWFyayxxLHJwLHJ0LHJ0YyxydWJ5LCcgK1xuICAncyxzYW1wLHNtYWxsLHNwYW4sc3Ryb25nLHN1YixzdXAsdGltZSx1LHZhcix3YnIsYXJlYSxhdWRpbyxtYXAsdHJhY2ssJyArXG4gICdlbWJlZCxvYmplY3QscGFyYW0sc291cmNlLGNhbnZhcyxzY3JpcHQsbm9zY3JpcHQsZGVsLGlucywnICtcbiAgJ2NhcHRpb24sY29sLGNvbGdyb3VwLHRhYmxlLHRoZWFkLHRib2R5LHRkLHRoLHRyLHZpZGVvLCcgK1xuICAnYnV0dG9uLGRhdGFsaXN0LGZpZWxkc2V0LGZvcm0saW5wdXQsbGFiZWwsbGVnZW5kLG1ldGVyLG9wdGdyb3VwLG9wdGlvbiwnICtcbiAgJ291dHB1dCxwcm9ncmVzcyxzZWxlY3QsdGV4dGFyZWEsJyArXG4gICdkZXRhaWxzLGRpYWxvZyxtZW51LG1lbnVpdGVtLHN1bW1hcnksJyArXG4gICdjb250ZW50LGVsZW1lbnQsc2hhZG93LHRlbXBsYXRlLGJsb2NrcXVvdGUsaWZyYW1lLHRmb290J1xuKVxuXG4vLyB0aGlzIG1hcCBpcyBpbnRlbnRpb25hbGx5IHNlbGVjdGl2ZSwgb25seSBjb3ZlcmluZyBTVkcgZWxlbWVudHMgdGhhdCBtYXlcbi8vIGNvbnRhaW4gY2hpbGQgZWxlbWVudHMuXG5leHBvcnQgY29uc3QgaXNTVkcgPSBtYWtlTWFwKFxuICAnc3ZnLGFuaW1hdGUsY2lyY2xlLGNsaXBwYXRoLGN1cnNvcixkZWZzLGRlc2MsZWxsaXBzZSxmaWx0ZXIsZm9udC1mYWNlLCcgK1xuICAnZm9yZWlnbk9iamVjdCxnLGdseXBoLGltYWdlLGxpbmUsbWFya2VyLG1hc2ssbWlzc2luZy1nbHlwaCxwYXRoLHBhdHRlcm4sJyArXG4gICdwb2x5Z29uLHBvbHlsaW5lLHJlY3Qsc3dpdGNoLHN5bWJvbCx0ZXh0LHRleHRwYXRoLHRzcGFuLHVzZSx2aWV3JyxcbiAgdHJ1ZVxuKVxuXG5leHBvcnQgY29uc3QgaXNSZXNlcnZlZFRhZyA9ICh0YWc6IHN0cmluZykgPT4gaXNIVE1MVGFnKHRhZykgfHwgaXNTVkcodGFnKVxuIiwiLy8gQGZsb3dcblxuaW1wb3J0IHsgY29tcGlsZVRvRnVuY3Rpb25zIH0gZnJvbSAndnVlLXRlbXBsYXRlLWNvbXBpbGVyJ1xuaW1wb3J0IHsgY29tcG9uZW50TmVlZHNDb21waWxpbmcgfSBmcm9tICcuL3ZhbGlkYXRvcnMnXG5pbXBvcnQgeyB0aHJvd0Vycm9yIH0gZnJvbSAnLi91dGlsJ1xuXG5leHBvcnQgZnVuY3Rpb24gY29tcGlsZUZyb21TdHJpbmcgKHN0cjogc3RyaW5nKSB7XG4gIGlmICghY29tcGlsZVRvRnVuY3Rpb25zKSB7XG4gICAgdGhyb3dFcnJvcihcbiAgICAgIGB2dWVUZW1wbGF0ZUNvbXBpbGVyIGlzIHVuZGVmaW5lZCwgeW91IG11c3QgcGFzcyBgICtcbiAgICAgICAgYHByZWNvbXBpbGVkIGNvbXBvbmVudHMgaWYgdnVlLXRlbXBsYXRlLWNvbXBpbGVyIGlzIGAgK1xuICAgICAgICBgdW5kZWZpbmVkYFxuICAgIClcbiAgfVxuICByZXR1cm4gY29tcGlsZVRvRnVuY3Rpb25zKHN0cilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBpbGVUZW1wbGF0ZSAoY29tcG9uZW50OiBDb21wb25lbnQpOiB2b2lkIHtcbiAgaWYgKGNvbXBvbmVudC50ZW1wbGF0ZSkge1xuICAgIE9iamVjdC5hc3NpZ24oY29tcG9uZW50LCBjb21waWxlVG9GdW5jdGlvbnMoY29tcG9uZW50LnRlbXBsYXRlKSlcbiAgfVxuXG4gIGlmIChjb21wb25lbnQuY29tcG9uZW50cykge1xuICAgIE9iamVjdC5rZXlzKGNvbXBvbmVudC5jb21wb25lbnRzKS5mb3JFYWNoKGMgPT4ge1xuICAgICAgY29uc3QgY21wID0gY29tcG9uZW50LmNvbXBvbmVudHNbY11cbiAgICAgIGlmICghY21wLnJlbmRlcikge1xuICAgICAgICBjb21waWxlVGVtcGxhdGUoY21wKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBpZiAoY29tcG9uZW50LmV4dGVuZHMpIHtcbiAgICBjb21waWxlVGVtcGxhdGUoY29tcG9uZW50LmV4dGVuZHMpXG4gIH1cblxuICBpZiAoY29tcG9uZW50LmV4dGVuZE9wdGlvbnMgJiYgIWNvbXBvbmVudC5vcHRpb25zLnJlbmRlcikge1xuICAgIGNvbXBpbGVUZW1wbGF0ZShjb21wb25lbnQub3B0aW9ucylcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tcGlsZVRlbXBsYXRlRm9yU2xvdHMgKHNsb3RzOiBPYmplY3QpOiB2b2lkIHtcbiAgT2JqZWN0LmtleXMoc2xvdHMpLmZvckVhY2goa2V5ID0+IHtcbiAgICBjb25zdCBzbG90ID0gQXJyYXkuaXNBcnJheShzbG90c1trZXldKSA/IHNsb3RzW2tleV0gOiBbc2xvdHNba2V5XV1cbiAgICBzbG90LmZvckVhY2goc2xvdFZhbHVlID0+IHtcbiAgICAgIGlmIChjb21wb25lbnROZWVkc0NvbXBpbGluZyhzbG90VmFsdWUpKSB7XG4gICAgICAgIGNvbXBpbGVUZW1wbGF0ZShzbG90VmFsdWUpXG4gICAgICB9XG4gICAgfSlcbiAgfSlcbn1cbiIsIi8vIEBmbG93XG5cbmNvbnN0IE1PVU5USU5HX09QVElPTlMgPSBbXG4gICdhdHRhY2hUb0RvY3VtZW50JyxcbiAgJ21vY2tzJyxcbiAgJ3Nsb3RzJyxcbiAgJ2xvY2FsVnVlJyxcbiAgJ3N0dWJzJyxcbiAgJ2NvbnRleHQnLFxuICAnY2xvbmUnLFxuICAnYXR0cnMnLFxuICAnbGlzdGVuZXJzJyxcbiAgJ3Byb3BzRGF0YScsXG4gICdsb2dNb2RpZmllZENvbXBvbmVudHMnLFxuICAnc3luYycsXG4gICdzaG91bGRQcm94eSdcbl1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZXh0cmFjdEluc3RhbmNlT3B0aW9ucyAoXG4gIG9wdGlvbnM6IE9iamVjdFxuKTogT2JqZWN0IHtcbiAgY29uc3QgaW5zdGFuY2VPcHRpb25zID0ge1xuICAgIC4uLm9wdGlvbnNcbiAgfVxuICBNT1VOVElOR19PUFRJT05TLmZvckVhY2gobW91bnRpbmdPcHRpb24gPT4ge1xuICAgIGRlbGV0ZSBpbnN0YW5jZU9wdGlvbnNbbW91bnRpbmdPcHRpb25dXG4gIH0pXG4gIHJldHVybiBpbnN0YW5jZU9wdGlvbnNcbn1cbiIsIi8vIEBmbG93XG5cbmltcG9ydCB7IHRocm93RXJyb3IgfSBmcm9tICdzaGFyZWQvdXRpbCdcbmltcG9ydCB7IGNvbXBpbGVUb0Z1bmN0aW9ucyB9IGZyb20gJ3Z1ZS10ZW1wbGF0ZS1jb21waWxlcidcbmltcG9ydCB7IGlzVnVlQ29tcG9uZW50IH0gZnJvbSAnLi4vc2hhcmVkL3ZhbGlkYXRvcnMnXG5cbmZ1bmN0aW9uIGlzVmFsaWRTbG90IChzbG90OiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIChcbiAgICBpc1Z1ZUNvbXBvbmVudChzbG90KSB8fFxuICAgIHR5cGVvZiBzbG90ID09PSAnc3RyaW5nJ1xuICApXG59XG5cbmZ1bmN0aW9uIHJlcXVpcmVzVGVtcGxhdGVDb21waWxlciAoc2xvdDogYW55KTogdm9pZCB7XG4gIGlmICh0eXBlb2Ygc2xvdCA9PT0gJ3N0cmluZycgJiYgIWNvbXBpbGVUb0Z1bmN0aW9ucykge1xuICAgIHRocm93RXJyb3IoXG4gICAgICBgdnVlVGVtcGxhdGVDb21waWxlciBpcyB1bmRlZmluZWQsIHlvdSBtdXN0IHBhc3MgYCArXG4gICAgICBgcHJlY29tcGlsZWQgY29tcG9uZW50cyBpZiB2dWUtdGVtcGxhdGUtY29tcGlsZXIgaXMgYCArXG4gICAgICBgdW5kZWZpbmVkYFxuICAgIClcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVTbG90cyAoc2xvdHM6IFNsb3RzT2JqZWN0KTogdm9pZCB7XG4gIE9iamVjdC5rZXlzKHNsb3RzKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgY29uc3Qgc2xvdCA9IEFycmF5LmlzQXJyYXkoc2xvdHNba2V5XSkgPyBzbG90c1trZXldIDogW3Nsb3RzW2tleV1dXG5cbiAgICBzbG90LmZvckVhY2goc2xvdFZhbHVlID0+IHtcbiAgICAgIGlmICghaXNWYWxpZFNsb3Qoc2xvdFZhbHVlKSkge1xuICAgICAgICB0aHJvd0Vycm9yKFxuICAgICAgICAgIGBzbG90c1trZXldIG11c3QgYmUgYSBDb21wb25lbnQsIHN0cmluZyBvciBhbiBhcnJheSBgICtcbiAgICAgICAgICAgIGBvZiBDb21wb25lbnRzYFxuICAgICAgICApXG4gICAgICB9XG4gICAgICByZXF1aXJlc1RlbXBsYXRlQ29tcGlsZXIoc2xvdFZhbHVlKVxuICAgIH0pXG4gIH0pXG59XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgeyBjb21waWxlVG9GdW5jdGlvbnMgfSBmcm9tICd2dWUtdGVtcGxhdGUtY29tcGlsZXInXG5pbXBvcnQgeyB0aHJvd0Vycm9yIH0gZnJvbSAnc2hhcmVkL3V0aWwnXG5pbXBvcnQgeyBWVUVfVkVSU0lPTiB9IGZyb20gJ3NoYXJlZC9jb25zdHMnXG5cbmZ1bmN0aW9uIGlzRGVzdHJ1Y3R1cmluZ1Nsb3RTY29wZSAoc2xvdFNjb3BlOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIHNsb3RTY29wZVswXSA9PT0gJ3snICYmIHNsb3RTY29wZVtzbG90U2NvcGUubGVuZ3RoIC0gMV0gPT09ICd9J1xufVxuXG5mdW5jdGlvbiBnZXRWdWVUZW1wbGF0ZUNvbXBpbGVySGVscGVycyAoXG4gIF9WdWU6IENvbXBvbmVudFxuKTogeyBbbmFtZTogc3RyaW5nXTogRnVuY3Rpb24gfSB7XG4gIC8vICRGbG93SWdub3JlXG4gIGNvbnN0IHZ1ZSA9IG5ldyBfVnVlKClcbiAgY29uc3QgaGVscGVycyA9IHt9XG4gIGNvbnN0IG5hbWVzID0gW1xuICAgICdfYycsXG4gICAgJ19vJyxcbiAgICAnX24nLFxuICAgICdfcycsXG4gICAgJ19sJyxcbiAgICAnX3QnLFxuICAgICdfcScsXG4gICAgJ19pJyxcbiAgICAnX20nLFxuICAgICdfZicsXG4gICAgJ19rJyxcbiAgICAnX2InLFxuICAgICdfdicsXG4gICAgJ19lJyxcbiAgICAnX3UnLFxuICAgICdfZydcbiAgXVxuICBuYW1lcy5mb3JFYWNoKG5hbWUgPT4ge1xuICAgIGhlbHBlcnNbbmFtZV0gPSB2dWUuX3JlbmRlclByb3h5W25hbWVdXG4gIH0pXG4gIGhlbHBlcnMuJGNyZWF0ZUVsZW1lbnQgPSB2dWUuX3JlbmRlclByb3h5LiRjcmVhdGVFbGVtZW50XG4gIHJldHVybiBoZWxwZXJzXG59XG5cbmZ1bmN0aW9uIHZhbGlkYXRlRW52aXJvbm1lbnQgKCk6IHZvaWQge1xuICBpZiAoVlVFX1ZFUlNJT04gPCAyLjEpIHtcbiAgICB0aHJvd0Vycm9yKGB0aGUgc2NvcGVkU2xvdHMgb3B0aW9uIGlzIG9ubHkgc3VwcG9ydGVkIGluIHZ1ZUAyLjErLmApXG4gIH1cbn1cblxuY29uc3Qgc2xvdFNjb3BlUmUgPSAvPFtePl0rIHNsb3Qtc2NvcGU9XFxcIiguKylcXFwiL1xuXG4vLyBIaWRlIHdhcm5pbmcgYWJvdXQgPHRlbXBsYXRlPiBkaXNhbGxvd2VkIGFzIHJvb3QgZWxlbWVudFxuZnVuY3Rpb24gY3VzdG9tV2FybiAobXNnKSB7XG4gIGlmIChtc2cuaW5kZXhPZignQ2Fubm90IHVzZSA8dGVtcGxhdGU+IGFzIGNvbXBvbmVudCByb290IGVsZW1lbnQnKSA9PT0gLTEpIHtcbiAgICBjb25zb2xlLmVycm9yKG1zZylcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjcmVhdGVTY29wZWRTbG90cyAoXG4gIHNjb3BlZFNsb3RzT3B0aW9uOiA/eyBbc2xvdE5hbWU6IHN0cmluZ106IHN0cmluZyB8IEZ1bmN0aW9uIH0sXG4gIF9WdWU6IENvbXBvbmVudFxuKToge1xuICBbc2xvdE5hbWU6IHN0cmluZ106IChwcm9wczogT2JqZWN0KSA9PiBWTm9kZSB8IEFycmF5PFZOb2RlPlxufSB7XG4gIGNvbnN0IHNjb3BlZFNsb3RzID0ge31cbiAgaWYgKCFzY29wZWRTbG90c09wdGlvbikge1xuICAgIHJldHVybiBzY29wZWRTbG90c1xuICB9XG4gIHZhbGlkYXRlRW52aXJvbm1lbnQoKVxuICBjb25zdCBoZWxwZXJzID0gZ2V0VnVlVGVtcGxhdGVDb21waWxlckhlbHBlcnMoX1Z1ZSlcbiAgZm9yIChjb25zdCBzY29wZWRTbG90TmFtZSBpbiBzY29wZWRTbG90c09wdGlvbikge1xuICAgIGNvbnN0IHNsb3QgPSBzY29wZWRTbG90c09wdGlvbltzY29wZWRTbG90TmFtZV1cbiAgICBjb25zdCBpc0ZuID0gdHlwZW9mIHNsb3QgPT09ICdmdW5jdGlvbidcbiAgICAvLyBUeXBlIGNoZWNrIHRvIHNpbGVuY2UgZmxvdyAoY2FuJ3QgdXNlIGlzRm4pXG4gICAgY29uc3QgcmVuZGVyRm4gPSB0eXBlb2Ygc2xvdCA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgPyBzbG90XG4gICAgICA6IGNvbXBpbGVUb0Z1bmN0aW9ucyhzbG90LCB7IHdhcm46IGN1c3RvbVdhcm4gfSkucmVuZGVyXG5cbiAgICBjb25zdCBoYXNTbG90U2NvcGVBdHRyID0gIWlzRm4gJiYgc2xvdC5tYXRjaChzbG90U2NvcGVSZSlcbiAgICBjb25zdCBzbG90U2NvcGUgPSBoYXNTbG90U2NvcGVBdHRyICYmIGhhc1Nsb3RTY29wZUF0dHJbMV1cbiAgICBzY29wZWRTbG90c1tzY29wZWRTbG90TmFtZV0gPSBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICAgIGxldCByZXNcbiAgICAgIGlmIChpc0ZuKSB7XG4gICAgICAgIHJlcyA9IHJlbmRlckZuLmNhbGwoeyAuLi5oZWxwZXJzIH0sIHByb3BzKVxuICAgICAgfSBlbHNlIGlmIChzbG90U2NvcGUgJiYgIWlzRGVzdHJ1Y3R1cmluZ1Nsb3RTY29wZShzbG90U2NvcGUpKSB7XG4gICAgICAgIHJlcyA9IHJlbmRlckZuLmNhbGwoeyAuLi5oZWxwZXJzLCBbc2xvdFNjb3BlXTogcHJvcHMgfSlcbiAgICAgIH0gZWxzZSBpZiAoc2xvdFNjb3BlICYmIGlzRGVzdHJ1Y3R1cmluZ1Nsb3RTY29wZShzbG90U2NvcGUpKSB7XG4gICAgICAgIHJlcyA9IHJlbmRlckZuLmNhbGwoeyAuLi5oZWxwZXJzLCAuLi5wcm9wcyB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzID0gcmVuZGVyRm4uY2FsbCh7IC4uLmhlbHBlcnMsIHByb3BzIH0pXG4gICAgICB9XG4gICAgICAvLyByZXMgaXMgQXJyYXkgaWYgPHRlbXBsYXRlPiBpcyBhIHJvb3QgZWxlbWVudFxuICAgICAgcmV0dXJuIEFycmF5LmlzQXJyYXkocmVzKSA/IHJlc1swXSA6IHJlc1xuICAgIH1cbiAgfVxuICByZXR1cm4gc2NvcGVkU2xvdHNcbn1cbiIsIi8vIEBmbG93XG5cbmltcG9ydCB7IHRocm93RXJyb3IgfSBmcm9tICdzaGFyZWQvdXRpbCdcbmltcG9ydCB7IHZhbGlkYXRlU2xvdHMgfSBmcm9tICcuL3ZhbGlkYXRlLXNsb3RzJ1xuaW1wb3J0IHsgY3JlYXRlU2xvdFZOb2RlcyB9IGZyb20gJy4vY3JlYXRlLXNsb3Qtdm5vZGVzJ1xuaW1wb3J0IGNyZWF0ZVNjb3BlZFNsb3RzIGZyb20gJy4vY3JlYXRlLXNjb3BlZC1zbG90cydcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY3JlYXRlRnVuY3Rpb25hbENvbXBvbmVudCAoXG4gIGNvbXBvbmVudDogQ29tcG9uZW50LFxuICBtb3VudGluZ09wdGlvbnM6IE9wdGlvbnMsXG4gIF9WdWU6IENvbXBvbmVudFxuKTogQ29tcG9uZW50IHtcbiAgaWYgKG1vdW50aW5nT3B0aW9ucy5jb250ZXh0ICYmIHR5cGVvZiBtb3VudGluZ09wdGlvbnMuY29udGV4dCAhPT0gJ29iamVjdCcpIHtcbiAgICB0aHJvd0Vycm9yKCdtb3VudC5jb250ZXh0IG11c3QgYmUgYW4gb2JqZWN0JylcbiAgfVxuICBpZiAobW91bnRpbmdPcHRpb25zLnNsb3RzKSB7XG4gICAgdmFsaWRhdGVTbG90cyhtb3VudGluZ09wdGlvbnMuc2xvdHMpXG4gIH1cblxuICBjb25zdCBjb250ZXh0ID1cbiAgICBtb3VudGluZ09wdGlvbnMuY29udGV4dCB8fFxuICAgIGNvbXBvbmVudC5GdW5jdGlvbmFsUmVuZGVyQ29udGV4dCB8fFxuICAgIHt9XG5cbiAgY29uc3QgbGlzdGVuZXJzID0gbW91bnRpbmdPcHRpb25zLmxpc3RlbmVyc1xuXG4gIGlmIChsaXN0ZW5lcnMpIHtcbiAgICBPYmplY3Qua2V5cyhsaXN0ZW5lcnMpLmZvckVhY2goa2V5ID0+IHtcbiAgICAgIGNvbnRleHQub25ba2V5XSA9IGxpc3RlbmVyc1trZXldXG4gICAgfSlcbiAgfVxuXG4gIGNvbnRleHQuc2NvcGVkU2xvdHMgPSBjcmVhdGVTY29wZWRTbG90cyhtb3VudGluZ09wdGlvbnMuc2NvcGVkU2xvdHMsIF9WdWUpXG5cbiAgcmV0dXJuIHtcbiAgICByZW5kZXIgKGg6IEZ1bmN0aW9uKSB7XG4gICAgICByZXR1cm4gaChcbiAgICAgICAgY29tcG9uZW50LFxuICAgICAgICBjb250ZXh0LFxuICAgICAgICAobW91bnRpbmdPcHRpb25zLmNvbnRleHQgJiZcbiAgICAgICAgICBtb3VudGluZ09wdGlvbnMuY29udGV4dC5jaGlsZHJlbiAmJlxuICAgICAgICAgIG1vdW50aW5nT3B0aW9ucy5jb250ZXh0LmNoaWxkcmVuLm1hcChcbiAgICAgICAgICAgIHggPT4gKHR5cGVvZiB4ID09PSAnZnVuY3Rpb24nID8geChoKSA6IHgpXG4gICAgICAgICAgKSkgfHxcbiAgICAgICAgICBjcmVhdGVTbG90Vk5vZGVzKHRoaXMsIG1vdW50aW5nT3B0aW9ucy5zbG90cyB8fCB7fSlcbiAgICAgIClcbiAgICB9LFxuICAgIG5hbWU6IGNvbXBvbmVudC5uYW1lLFxuICAgIF9pc0Z1bmN0aW9uYWxDb250YWluZXI6IHRydWVcbiAgfVxufVxuIiwiLy8gQGZsb3dcblxuaW1wb3J0IFZ1ZSBmcm9tICd2dWUnXG5pbXBvcnQge1xuICB0aHJvd0Vycm9yLFxuICBjYW1lbGl6ZSxcbiAgY2FwaXRhbGl6ZSxcbiAgaHlwaGVuYXRlXG59IGZyb20gJy4uL3NoYXJlZC91dGlsJ1xuaW1wb3J0IHtcbiAgY29tcG9uZW50TmVlZHNDb21waWxpbmcsXG4gIHRlbXBsYXRlQ29udGFpbnNDb21wb25lbnQsXG4gIGlzVnVlQ29tcG9uZW50XG59IGZyb20gJy4uL3NoYXJlZC92YWxpZGF0b3JzJ1xuaW1wb3J0IHtcbiAgY29tcGlsZVRlbXBsYXRlLFxuICBjb21waWxlRnJvbVN0cmluZ1xufSBmcm9tICcuLi9zaGFyZWQvY29tcGlsZS10ZW1wbGF0ZSdcblxuZnVuY3Rpb24gaXNWdWVDb21wb25lbnRTdHViIChjb21wKTogYm9vbGVhbiB7XG4gIHJldHVybiBjb21wICYmIGNvbXAudGVtcGxhdGUgfHwgaXNWdWVDb21wb25lbnQoY29tcClcbn1cblxuZnVuY3Rpb24gaXNWYWxpZFN0dWIgKHN0dWI6IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gKFxuICAgIHR5cGVvZiBzdHViID09PSAnYm9vbGVhbicgfHxcbiAgICAoISFzdHViICYmIHR5cGVvZiBzdHViID09PSAnc3RyaW5nJykgfHxcbiAgICBpc1Z1ZUNvbXBvbmVudFN0dWIoc3R1YilcbiAgKVxufVxuXG5mdW5jdGlvbiByZXNvbHZlQ29tcG9uZW50IChvYmo6IE9iamVjdCwgY29tcG9uZW50OiBzdHJpbmcpOiBPYmplY3Qge1xuICByZXR1cm4gb2JqW2NvbXBvbmVudF0gfHxcbiAgICBvYmpbaHlwaGVuYXRlKGNvbXBvbmVudCldIHx8XG4gICAgb2JqW2NhbWVsaXplKGNvbXBvbmVudCldIHx8XG4gICAgb2JqW2NhcGl0YWxpemUoY2FtZWxpemUoY29tcG9uZW50KSldIHx8XG4gICAgb2JqW2NhcGl0YWxpemUoY29tcG9uZW50KV0gfHxcbiAgICB7fVxufVxuXG5mdW5jdGlvbiBnZXRDb3JlUHJvcGVydGllcyAoY29tcG9uZW50T3B0aW9uczogQ29tcG9uZW50KTogT2JqZWN0IHtcbiAgcmV0dXJuIHtcbiAgICBhdHRyczogY29tcG9uZW50T3B0aW9ucy5hdHRycyxcbiAgICBuYW1lOiBjb21wb25lbnRPcHRpb25zLm5hbWUsXG4gICAgb246IGNvbXBvbmVudE9wdGlvbnMub24sXG4gICAga2V5OiBjb21wb25lbnRPcHRpb25zLmtleSxcbiAgICByZWY6IGNvbXBvbmVudE9wdGlvbnMucmVmLFxuICAgIHByb3BzOiBjb21wb25lbnRPcHRpb25zLnByb3BzLFxuICAgIGRvbVByb3BzOiBjb21wb25lbnRPcHRpb25zLmRvbVByb3BzLFxuICAgIGNsYXNzOiBjb21wb25lbnRPcHRpb25zLmNsYXNzLFxuICAgIHN0YXRpY0NsYXNzOiBjb21wb25lbnRPcHRpb25zLnN0YXRpY0NsYXNzLFxuICAgIHN0YXRpY1N0eWxlOiBjb21wb25lbnRPcHRpb25zLnN0YXRpY1N0eWxlLFxuICAgIHN0eWxlOiBjb21wb25lbnRPcHRpb25zLnN0eWxlLFxuICAgIG5vcm1hbGl6ZWRTdHlsZTogY29tcG9uZW50T3B0aW9ucy5ub3JtYWxpemVkU3R5bGUsXG4gICAgbmF0aXZlT246IGNvbXBvbmVudE9wdGlvbnMubmF0aXZlT24sXG4gICAgZnVuY3Rpb25hbDogY29tcG9uZW50T3B0aW9ucy5mdW5jdGlvbmFsXG4gIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlQ2xhc3NTdHJpbmcgKHN0YXRpY0NsYXNzLCBkeW5hbWljQ2xhc3MpIHtcbiAgaWYgKHN0YXRpY0NsYXNzICYmIGR5bmFtaWNDbGFzcykge1xuICAgIHJldHVybiBzdGF0aWNDbGFzcyArICcgJyArIGR5bmFtaWNDbGFzc1xuICB9XG4gIHJldHVybiBzdGF0aWNDbGFzcyB8fCBkeW5hbWljQ2xhc3Ncbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVN0dWJGcm9tQ29tcG9uZW50IChcbiAgb3JpZ2luYWxDb21wb25lbnQ6IENvbXBvbmVudCxcbiAgbmFtZTogc3RyaW5nXG4pOiBDb21wb25lbnQge1xuICBjb25zdCBjb21wb25lbnRPcHRpb25zID1cbiAgICB0eXBlb2Ygb3JpZ2luYWxDb21wb25lbnQgPT09ICdmdW5jdGlvbicgJiYgb3JpZ2luYWxDb21wb25lbnQuY2lkXG4gICAgICA/IG9yaWdpbmFsQ29tcG9uZW50LmV4dGVuZE9wdGlvbnNcbiAgICAgIDogb3JpZ2luYWxDb21wb25lbnRcblxuICBjb25zdCB0YWdOYW1lID0gYCR7bmFtZSB8fCAnYW5vbnltb3VzJ30tc3R1YmBcblxuICAvLyBpZ25vcmVFbGVtZW50cyBkb2VzIG5vdCBleGlzdCBpbiBWdWUgMi4wLnhcbiAgaWYgKFZ1ZS5jb25maWcuaWdub3JlZEVsZW1lbnRzKSB7XG4gICAgVnVlLmNvbmZpZy5pZ25vcmVkRWxlbWVudHMucHVzaCh0YWdOYW1lKVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICAuLi5nZXRDb3JlUHJvcGVydGllcyhjb21wb25lbnRPcHRpb25zKSxcbiAgICAkX3Z1ZVRlc3RVdGlsc19vcmlnaW5hbDogb3JpZ2luYWxDb21wb25lbnQsXG4gICAgJF9kb05vdFN0dWJDaGlsZHJlbjogdHJ1ZSxcbiAgICByZW5kZXIgKGgsIGNvbnRleHQpIHtcbiAgICAgIHJldHVybiBoKFxuICAgICAgICB0YWdOYW1lLFxuICAgICAgICB7XG4gICAgICAgICAgYXR0cnM6IGNvbXBvbmVudE9wdGlvbnMuZnVuY3Rpb25hbCA/IHtcbiAgICAgICAgICAgIC4uLmNvbnRleHQucHJvcHMsXG4gICAgICAgICAgICAuLi5jb250ZXh0LmRhdGEuYXR0cnMsXG4gICAgICAgICAgICBjbGFzczogY3JlYXRlQ2xhc3NTdHJpbmcoXG4gICAgICAgICAgICAgIGNvbnRleHQuZGF0YS5zdGF0aWNDbGFzcyxcbiAgICAgICAgICAgICAgY29udGV4dC5kYXRhLmNsYXNzXG4gICAgICAgICAgICApXG4gICAgICAgICAgfSA6IHtcbiAgICAgICAgICAgIC4uLnRoaXMuJHByb3BzXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBjb250ZXh0ID8gY29udGV4dC5jaGlsZHJlbiA6IHRoaXMuJG9wdGlvbnMuX3JlbmRlckNoaWxkcmVuXG4gICAgICApXG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTdHViRnJvbVN0cmluZyAoXG4gIHRlbXBsYXRlU3RyaW5nOiBzdHJpbmcsXG4gIG9yaWdpbmFsQ29tcG9uZW50OiBDb21wb25lbnQgPSB7fSxcbiAgbmFtZTogc3RyaW5nXG4pOiBDb21wb25lbnQge1xuICBpZiAodGVtcGxhdGVDb250YWluc0NvbXBvbmVudCh0ZW1wbGF0ZVN0cmluZywgbmFtZSkpIHtcbiAgICB0aHJvd0Vycm9yKCdvcHRpb25zLnN0dWIgY2Fubm90IGNvbnRhaW4gYSBjaXJjdWxhciByZWZlcmVuY2UnKVxuICB9XG5cbiAgY29uc3QgY29tcG9uZW50T3B0aW9ucyA9XG4gICAgdHlwZW9mIG9yaWdpbmFsQ29tcG9uZW50ID09PSAnZnVuY3Rpb24nICYmIG9yaWdpbmFsQ29tcG9uZW50LmNpZFxuICAgICAgPyBvcmlnaW5hbENvbXBvbmVudC5leHRlbmRPcHRpb25zXG4gICAgICA6IG9yaWdpbmFsQ29tcG9uZW50XG5cbiAgcmV0dXJuIHtcbiAgICAuLi5nZXRDb3JlUHJvcGVydGllcyhjb21wb25lbnRPcHRpb25zKSxcbiAgICAkX2RvTm90U3R1YkNoaWxkcmVuOiB0cnVlLFxuICAgIC4uLmNvbXBpbGVGcm9tU3RyaW5nKHRlbXBsYXRlU3RyaW5nKVxuICB9XG59XG5cbmZ1bmN0aW9uIHZhbGlkYXRlU3R1YiAoc3R1Yikge1xuICBpZiAoIWlzVmFsaWRTdHViKHN0dWIpKSB7XG4gICAgdGhyb3dFcnJvcihcbiAgICAgIGBvcHRpb25zLnN0dWIgdmFsdWVzIG11c3QgYmUgcGFzc2VkIGEgc3RyaW5nIG9yIGAgK1xuICAgICAgYGNvbXBvbmVudGBcbiAgICApXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVN0dWJzRnJvbVN0dWJzT2JqZWN0IChcbiAgb3JpZ2luYWxDb21wb25lbnRzOiBPYmplY3QgPSB7fSxcbiAgc3R1YnM6IE9iamVjdFxuKTogQ29tcG9uZW50cyB7XG4gIHJldHVybiBPYmplY3Qua2V5cyhzdHVicyB8fCB7fSkucmVkdWNlKChhY2MsIHN0dWJOYW1lKSA9PiB7XG4gICAgY29uc3Qgc3R1YiA9IHN0dWJzW3N0dWJOYW1lXVxuXG4gICAgdmFsaWRhdGVTdHViKHN0dWIpXG5cbiAgICBpZiAoc3R1YiA9PT0gZmFsc2UpIHtcbiAgICAgIHJldHVybiBhY2NcbiAgICB9XG5cbiAgICBpZiAoc3R1YiA9PT0gdHJ1ZSkge1xuICAgICAgY29uc3QgY29tcG9uZW50ID0gcmVzb2x2ZUNvbXBvbmVudChvcmlnaW5hbENvbXBvbmVudHMsIHN0dWJOYW1lKVxuICAgICAgYWNjW3N0dWJOYW1lXSA9IGNyZWF0ZVN0dWJGcm9tQ29tcG9uZW50KGNvbXBvbmVudCwgc3R1Yk5hbWUpXG4gICAgICByZXR1cm4gYWNjXG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBzdHViID09PSAnc3RyaW5nJykge1xuICAgICAgY29uc3QgY29tcG9uZW50ID0gcmVzb2x2ZUNvbXBvbmVudChvcmlnaW5hbENvbXBvbmVudHMsIHN0dWJOYW1lKVxuICAgICAgYWNjW3N0dWJOYW1lXSA9IGNyZWF0ZVN0dWJGcm9tU3RyaW5nKFxuICAgICAgICBzdHViLFxuICAgICAgICBjb21wb25lbnQsXG4gICAgICAgIHN0dWJOYW1lXG4gICAgICApXG4gICAgICByZXR1cm4gYWNjXG4gICAgfVxuXG4gICAgaWYgKGNvbXBvbmVudE5lZWRzQ29tcGlsaW5nKHN0dWIpKSB7XG4gICAgICBjb21waWxlVGVtcGxhdGUoc3R1YilcbiAgICB9XG5cbiAgICBhY2Nbc3R1Yk5hbWVdID0gc3R1YlxuXG4gICAgcmV0dXJuIGFjY1xuICB9LCB7fSlcbn1cbiIsImltcG9ydCB7IGNyZWF0ZVN0dWJGcm9tQ29tcG9uZW50IH0gZnJvbSAnLi9jcmVhdGUtY29tcG9uZW50LXN0dWJzJ1xuaW1wb3J0IHsgcmVzb2x2ZUNvbXBvbmVudCB9IGZyb20gJ3NoYXJlZC91dGlsJ1xuaW1wb3J0IHsgaXNSZXNlcnZlZFRhZyB9IGZyb20gJ3NoYXJlZC92YWxpZGF0b3JzJ1xuaW1wb3J0IHtcbiAgQkVGT1JFX1JFTkRFUl9MSUZFQ1lDTEVfSE9PSyxcbiAgQ1JFQVRFX0VMRU1FTlRfQUxJQVNcbn0gZnJvbSAnc2hhcmVkL2NvbnN0cydcblxuY29uc3QgaXNXaGl0ZWxpc3RlZCA9IChlbCwgd2hpdGVsaXN0KSA9PiByZXNvbHZlQ29tcG9uZW50KGVsLCB3aGl0ZWxpc3QpXG5jb25zdCBpc0FscmVhZHlTdHViYmVkID0gKGVsLCBzdHVicykgPT4gc3R1YnMuaGFzKGVsKVxuY29uc3QgaXNEeW5hbWljQ29tcG9uZW50ID0gY21wID0+IHR5cGVvZiBjbXAgPT09ICdmdW5jdGlvbicgJiYgIWNtcC5jaWRcblxuZnVuY3Rpb24gc2hvdWxkRXh0ZW5kIChjb21wb25lbnQsIF9WdWUpIHtcbiAgcmV0dXJuIChcbiAgICAodHlwZW9mIGNvbXBvbmVudCA9PT0gJ2Z1bmN0aW9uJyAmJiAhaXNEeW5hbWljQ29tcG9uZW50KGNvbXBvbmVudCkpIHx8XG4gICAgKGNvbXBvbmVudCAmJiBjb21wb25lbnQuZXh0ZW5kcylcbiAgKVxufVxuXG5mdW5jdGlvbiBleHRlbmQgKGNvbXBvbmVudCwgX1Z1ZSkge1xuICBjb25zdCBzdHViID0gX1Z1ZS5leHRlbmQoY29tcG9uZW50Lm9wdGlvbnMpXG4gIHN0dWIub3B0aW9ucy4kX3Z1ZVRlc3RVdGlsc19vcmlnaW5hbCA9IGNvbXBvbmVudFxuICByZXR1cm4gc3R1YlxufVxuXG5mdW5jdGlvbiBjcmVhdGVTdHViSWZOZWVkZWQgKHNob3VsZFN0dWIsIGNvbXBvbmVudCwgX1Z1ZSwgZWwpIHtcbiAgaWYgKHNob3VsZFN0dWIpIHtcbiAgICByZXR1cm4gY3JlYXRlU3R1YkZyb21Db21wb25lbnQoY29tcG9uZW50IHx8IHt9LCBlbClcbiAgfVxuXG4gIGlmIChzaG91bGRFeHRlbmQoY29tcG9uZW50LCBfVnVlKSkge1xuICAgIHJldHVybiBleHRlbmQoY29tcG9uZW50LCBfVnVlKVxuICB9XG59XG5cbmZ1bmN0aW9uIHNob3VsZE5vdEJlU3R1YmJlZCAoZWwsIHdoaXRlbGlzdCwgbW9kaWZpZWRDb21wb25lbnRzKSB7XG4gIHJldHVybiAoXG4gICAgKHR5cGVvZiBlbCA9PT0gJ3N0cmluZycgJiYgaXNSZXNlcnZlZFRhZyhlbCkpIHx8XG4gICAgaXNXaGl0ZWxpc3RlZChlbCwgd2hpdGVsaXN0KSB8fFxuICAgIGlzQWxyZWFkeVN0dWJiZWQoZWwsIG1vZGlmaWVkQ29tcG9uZW50cylcbiAgKVxufVxuXG5mdW5jdGlvbiBpc0NvbnN0cnVjdG9yIChlbCkge1xuICByZXR1cm4gdHlwZW9mIGVsID09PSAnZnVuY3Rpb24nXG59XG5cbmZ1bmN0aW9uIGlzQ29tcG9uZW50T3B0aW9ucyAoZWwpIHtcbiAgcmV0dXJuIHR5cGVvZiBlbCA9PT0gJ29iamVjdCcgJiYgKGVsLnRlbXBsYXRlIHx8IGVsLnJlbmRlcilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhdGNoUmVuZGVyIChfVnVlLCBzdHVicywgc3R1YkFsbENvbXBvbmVudHMpIHtcbiAgLy8gVGhpcyBtaXhpbiBwYXRjaGVzIHZtLiRjcmVhdGVFbGVtZW50IHNvIHRoYXQgd2UgY2FuIHN0dWIgYWxsIGNvbXBvbmVudHNcbiAgLy8gYmVmb3JlIHRoZXkgYXJlIHJlbmRlcmVkIGluIHNoYWxsb3cgbW9kZS4gV2UgYWxzbyBuZWVkIHRvIGVuc3VyZSB0aGF0XG4gIC8vIGNvbXBvbmVudCBjb25zdHJ1Y3RvcnMgd2VyZSBjcmVhdGVkIGZyb20gdGhlIF9WdWUgY29uc3RydWN0b3IuIElmIG5vdCxcbiAgLy8gd2UgbXVzdCByZXBsYWNlIHRoZW0gd2l0aCBjb21wb25lbnRzIGNyZWF0ZWQgZnJvbSB0aGUgX1Z1ZSBjb25zdHJ1Y3RvclxuICAvLyBiZWZvcmUgY2FsbGluZyB0aGUgb3JpZ2luYWwgJGNyZWF0ZUVsZW1lbnQuIFRoaXMgZW5zdXJlcyB0aGF0IGNvbXBvbmVudHNcbiAgLy8gaGF2ZSB0aGUgY29ycmVjdCBpbnN0YW5jZSBwcm9wZXJ0aWVzIGFuZCBzdHVicyB3aGVuIHRoZXkgYXJlIHJlbmRlcmVkLlxuICBmdW5jdGlvbiBwYXRjaFJlbmRlck1peGluICgpIHtcbiAgICBjb25zdCB2bSA9IHRoaXNcblxuICAgIGlmIChcbiAgICAgIHZtLiRvcHRpb25zLiRfZG9Ob3RTdHViQ2hpbGRyZW4gfHxcbiAgICAgIHZtLiRvcHRpb25zLl9pc0Z1bmN0aW9uYWxDb250YWluZXJcbiAgICApIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IG1vZGlmaWVkQ29tcG9uZW50cyA9IG5ldyBTZXQoKVxuICAgIGNvbnN0IG9yaWdpbmFsQ3JlYXRlRWxlbWVudCA9IHZtLiRjcmVhdGVFbGVtZW50XG4gICAgY29uc3Qgb3JpZ2luYWxDb21wb25lbnRzID0gdm0uJG9wdGlvbnMuY29tcG9uZW50c1xuXG4gICAgY29uc3QgY3JlYXRlRWxlbWVudCA9IChlbCwgLi4uYXJncykgPT4ge1xuICAgICAgaWYgKHNob3VsZE5vdEJlU3R1YmJlZChlbCwgc3R1YnMsIG1vZGlmaWVkQ29tcG9uZW50cykpIHtcbiAgICAgICAgcmV0dXJuIG9yaWdpbmFsQ3JlYXRlRWxlbWVudChlbCwgLi4uYXJncylcbiAgICAgIH1cblxuICAgICAgaWYgKGlzQ29uc3RydWN0b3IoZWwpIHx8IGlzQ29tcG9uZW50T3B0aW9ucyhlbCkpIHtcbiAgICAgICAgaWYgKHN0dWJBbGxDb21wb25lbnRzKSB7XG4gICAgICAgICAgY29uc3Qgc3R1YiA9IGNyZWF0ZVN0dWJGcm9tQ29tcG9uZW50KGVsLCBlbC5uYW1lIHx8ICdhbm9ueW1vdXMnKVxuICAgICAgICAgIHJldHVybiBvcmlnaW5hbENyZWF0ZUVsZW1lbnQoc3R1YiwgLi4uYXJncylcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBDb25zdHJ1Y3RvciA9IHNob3VsZEV4dGVuZChlbCwgX1Z1ZSkgPyBleHRlbmQoZWwsIF9WdWUpIDogZWxcblxuICAgICAgICByZXR1cm4gb3JpZ2luYWxDcmVhdGVFbGVtZW50KENvbnN0cnVjdG9yLCAuLi5hcmdzKVxuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIGVsID09PSAnc3RyaW5nJykge1xuICAgICAgICBsZXQgb3JpZ2luYWwgPSByZXNvbHZlQ29tcG9uZW50KGVsLCBvcmlnaW5hbENvbXBvbmVudHMpXG5cbiAgICAgICAgaWYgKCFvcmlnaW5hbCkge1xuICAgICAgICAgIHJldHVybiBvcmlnaW5hbENyZWF0ZUVsZW1lbnQoZWwsIC4uLmFyZ3MpXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXG4gICAgICAgICAgb3JpZ2luYWwub3B0aW9ucyAmJlxuICAgICAgICAgIG9yaWdpbmFsLm9wdGlvbnMuJF92dWVUZXN0VXRpbHNfb3JpZ2luYWxcbiAgICAgICAgKSB7XG4gICAgICAgICAgb3JpZ2luYWwgPSBvcmlnaW5hbC5vcHRpb25zLiRfdnVlVGVzdFV0aWxzX29yaWdpbmFsXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaXNEeW5hbWljQ29tcG9uZW50KG9yaWdpbmFsKSkge1xuICAgICAgICAgIHJldHVybiBvcmlnaW5hbENyZWF0ZUVsZW1lbnQoZWwsIC4uLmFyZ3MpXG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzdHViID0gY3JlYXRlU3R1YklmTmVlZGVkKHN0dWJBbGxDb21wb25lbnRzLCBvcmlnaW5hbCwgX1Z1ZSwgZWwpXG5cbiAgICAgICAgaWYgKHN0dWIpIHtcbiAgICAgICAgICBPYmplY3QuYXNzaWduKHZtLiRvcHRpb25zLmNvbXBvbmVudHMsIHtcbiAgICAgICAgICAgIFtlbF06IHN0dWJcbiAgICAgICAgICB9KVxuICAgICAgICAgIG1vZGlmaWVkQ29tcG9uZW50cy5hZGQoZWwpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG9yaWdpbmFsQ3JlYXRlRWxlbWVudChlbCwgLi4uYXJncylcbiAgICB9XG5cbiAgICB2bVtDUkVBVEVfRUxFTUVOVF9BTElBU10gPSBjcmVhdGVFbGVtZW50XG4gICAgdm0uJGNyZWF0ZUVsZW1lbnQgPSBjcmVhdGVFbGVtZW50XG4gIH1cblxuICBfVnVlLm1peGluKHtcbiAgICBbQkVGT1JFX1JFTkRFUl9MSUZFQ1lDTEVfSE9PS106IHBhdGNoUmVuZGVyTWl4aW5cbiAgfSlcbn1cbiIsIi8vIEBmbG93XG5cbmltcG9ydCB7IGNyZWF0ZVNsb3RWTm9kZXMgfSBmcm9tICcuL2NyZWF0ZS1zbG90LXZub2RlcydcbmltcG9ydCBhZGRNb2NrcyBmcm9tICcuL2FkZC1tb2NrcydcbmltcG9ydCB7IGFkZEV2ZW50TG9nZ2VyIH0gZnJvbSAnLi9sb2ctZXZlbnRzJ1xuaW1wb3J0IHsgYWRkU3R1YnMgfSBmcm9tICcuL2FkZC1zdHVicydcbmltcG9ydCB7IHRocm93RXJyb3IgfSBmcm9tICdzaGFyZWQvdXRpbCdcbmltcG9ydCB7IFZVRV9WRVJTSU9OIH0gZnJvbSAnc2hhcmVkL2NvbnN0cydcbmltcG9ydCB7XG4gIGNvbXBpbGVUZW1wbGF0ZSxcbiAgY29tcGlsZVRlbXBsYXRlRm9yU2xvdHNcbn0gZnJvbSAnc2hhcmVkL2NvbXBpbGUtdGVtcGxhdGUnXG5pbXBvcnQgZXh0cmFjdEluc3RhbmNlT3B0aW9ucyBmcm9tICcuL2V4dHJhY3QtaW5zdGFuY2Utb3B0aW9ucydcbmltcG9ydCBjcmVhdGVGdW5jdGlvbmFsQ29tcG9uZW50IGZyb20gJy4vY3JlYXRlLWZ1bmN0aW9uYWwtY29tcG9uZW50J1xuaW1wb3J0IHsgY29tcG9uZW50TmVlZHNDb21waWxpbmcsIGlzUGxhaW5PYmplY3QgfSBmcm9tICdzaGFyZWQvdmFsaWRhdG9ycydcbmltcG9ydCB7IHZhbGlkYXRlU2xvdHMgfSBmcm9tICcuL3ZhbGlkYXRlLXNsb3RzJ1xuaW1wb3J0IGNyZWF0ZVNjb3BlZFNsb3RzIGZyb20gJy4vY3JlYXRlLXNjb3BlZC1zbG90cydcbmltcG9ydCB7IGNyZWF0ZVN0dWJzRnJvbVN0dWJzT2JqZWN0IH0gZnJvbSAnLi9jcmVhdGUtY29tcG9uZW50LXN0dWJzJ1xuaW1wb3J0IHsgcGF0Y2hSZW5kZXIgfSBmcm9tICcuL3BhdGNoLXJlbmRlcidcblxuZnVuY3Rpb24gdnVlRXh0ZW5kVW5zdXBwb3J0ZWRPcHRpb24gKG9wdGlvbjogc3RyaW5nKSB7XG4gIHJldHVybiBgb3B0aW9ucy4ke29wdGlvbn0gaXMgbm90IHN1cHBvcnRlZCBmb3IgYCArXG4gIGBjb21wb25lbnRzIGNyZWF0ZWQgd2l0aCBWdWUuZXh0ZW5kIGluIFZ1ZSA8IDIuMy4gYCArXG4gIGBZb3UgY2FuIHNldCAke29wdGlvbn0gdG8gZmFsc2UgdG8gbW91bnQgdGhlIGNvbXBvbmVudC5gXG59XG5cbi8vIHRoZXNlIG9wdGlvbnMgYXJlbid0IHN1cHBvcnRlZCBpZiBWdWUgaXMgdmVyc2lvbiA8IDIuM1xuLy8gZm9yIGNvbXBvbmVudHMgdXNpbmcgVnVlLmV4dGVuZC4gVGhpcyBpcyBkdWUgdG8gYSBidWdcbi8vIHRoYXQgbWVhbnMgdGhlIG1peGlucyB3ZSB1c2UgdG8gYWRkIHByb3BlcnRpZXMgYXJlIG5vdCBhcHBsaWVkXG4vLyBjb3JyZWN0bHlcbmNvbnN0IFVOU1VQUE9SVEVEX1ZFUlNJT05fT1BUSU9OUyA9IFtcbiAgJ21vY2tzJyxcbiAgJ3N0dWJzJyxcbiAgJ2xvY2FsVnVlJ1xuXVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjcmVhdGVJbnN0YW5jZSAoXG4gIGNvbXBvbmVudDogQ29tcG9uZW50LFxuICBvcHRpb25zOiBPcHRpb25zLFxuICBfVnVlOiBDb21wb25lbnRcbik6IENvbXBvbmVudCB7XG4gIC8vIG1ha2Ugc3VyZSBhbGwgZXh0ZW5kcyBhcmUgYmFzZWQgb24gdGhpcyBpbnN0YW5jZVxuICBfVnVlLm9wdGlvbnMuX2Jhc2UgPSBfVnVlXG5cbiAgaWYgKFxuICAgIFZVRV9WRVJTSU9OIDwgMi4zICYmXG4gICAgdHlwZW9mIGNvbXBvbmVudCA9PT0gJ2Z1bmN0aW9uJyAmJlxuICAgIGNvbXBvbmVudC5vcHRpb25zXG4gICkge1xuICAgIFVOU1VQUE9SVEVEX1ZFUlNJT05fT1BUSU9OUy5mb3JFYWNoKChvcHRpb24pID0+IHtcbiAgICAgIGlmIChvcHRpb25zW29wdGlvbl0pIHtcbiAgICAgICAgdGhyb3dFcnJvcih2dWVFeHRlbmRVbnN1cHBvcnRlZE9wdGlvbihvcHRpb24pKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICAvLyBpbnN0YW5jZSBvcHRpb25zIGFyZSBvcHRpb25zIHRoYXQgYXJlIHBhc3NlZCB0byB0aGVcbiAgLy8gcm9vdCBpbnN0YW5jZSB3aGVuIGl0J3MgaW5zdGFudGlhdGVkXG4gIGNvbnN0IGluc3RhbmNlT3B0aW9ucyA9IGV4dHJhY3RJbnN0YW5jZU9wdGlvbnMob3B0aW9ucylcbiAgY29uc3Qgc3R1YkNvbXBvbmVudHNPYmplY3QgPSBjcmVhdGVTdHVic0Zyb21TdHVic09iamVjdChcbiAgICBjb21wb25lbnQuY29tcG9uZW50cyxcbiAgICAvLyAkRmxvd0lnbm9yZVxuICAgIG9wdGlvbnMuc3R1YnNcbiAgKVxuXG4gIGFkZEV2ZW50TG9nZ2VyKF9WdWUpXG4gIGFkZE1vY2tzKF9WdWUsIG9wdGlvbnMubW9ja3MpXG4gIGFkZFN0dWJzKF9WdWUsIHN0dWJDb21wb25lbnRzT2JqZWN0KVxuICBwYXRjaFJlbmRlcihfVnVlLCBzdHViQ29tcG9uZW50c09iamVjdCwgb3B0aW9ucy5zaG91bGRQcm94eSlcblxuICBpZiAoXG4gICAgKGNvbXBvbmVudC5vcHRpb25zICYmIGNvbXBvbmVudC5vcHRpb25zLmZ1bmN0aW9uYWwpIHx8XG4gICAgY29tcG9uZW50LmZ1bmN0aW9uYWxcbiAgKSB7XG4gICAgY29tcG9uZW50ID0gY3JlYXRlRnVuY3Rpb25hbENvbXBvbmVudChjb21wb25lbnQsIG9wdGlvbnMsIF9WdWUpXG4gIH0gZWxzZSBpZiAob3B0aW9ucy5jb250ZXh0KSB7XG4gICAgdGhyb3dFcnJvcihcbiAgICAgIGBtb3VudC5jb250ZXh0IGNhbiBvbmx5IGJlIHVzZWQgd2hlbiBtb3VudGluZyBhIGAgK1xuICAgICAgYGZ1bmN0aW9uYWwgY29tcG9uZW50YFxuICAgIClcbiAgfVxuXG4gIGlmIChjb21wb25lbnROZWVkc0NvbXBpbGluZyhjb21wb25lbnQpKSB7XG4gICAgY29tcGlsZVRlbXBsYXRlKGNvbXBvbmVudClcbiAgfVxuXG4gIGlmIChjb21wb25lbnQub3B0aW9ucykge1xuICAgIGNvbXBvbmVudC5vcHRpb25zLl9iYXNlID0gX1Z1ZVxuICB9XG5cbiAgLy8gZXh0ZW5kIGNvbXBvbmVudCBmcm9tIF9WdWUgdG8gYWRkIHByb3BlcnRpZXMgYW5kIG1peGluc1xuICAvLyBleHRlbmQgZG9lcyBub3Qgd29yayBjb3JyZWN0bHkgZm9yIHN1YiBjbGFzcyBjb21wb25lbnRzIGluIFZ1ZSA8IDIuMlxuICBjb25zdCBDb25zdHJ1Y3RvciA9IHR5cGVvZiBjb21wb25lbnQgPT09ICdmdW5jdGlvbidcbiAgICA/IF9WdWUuZXh0ZW5kKGNvbXBvbmVudC5vcHRpb25zKS5leHRlbmQoaW5zdGFuY2VPcHRpb25zKVxuICAgIDogX1Z1ZS5leHRlbmQoY29tcG9uZW50KS5leHRlbmQoaW5zdGFuY2VPcHRpb25zKVxuXG4gIC8vIHVzZWQgdG8gaWRlbnRpZnkgZXh0ZW5kZWQgY29tcG9uZW50IHVzaW5nIGNvbnN0cnVjdG9yXG4gIENvbnN0cnVjdG9yLm9wdGlvbnMuJF92dWVUZXN0VXRpbHNfb3JpZ2luYWwgPSBjb21wb25lbnRcblxuICBpZiAob3B0aW9ucy5zbG90cykge1xuICAgIGNvbXBpbGVUZW1wbGF0ZUZvclNsb3RzKG9wdGlvbnMuc2xvdHMpXG4gICAgLy8gdmFsaWRhdGUgc2xvdHMgb3V0c2lkZSBvZiB0aGUgY3JlYXRlU2xvdHMgZnVuY3Rpb24gc29cbiAgICAvLyB0aGF0IHdlIGNhbiB0aHJvdyBhbiBlcnJvciB3aXRob3V0IGl0IGJlaW5nIGNhdWdodCBieVxuICAgIC8vIHRoZSBWdWUgZXJyb3IgaGFuZGxlclxuICAgIC8vICRGbG93SWdub3JlXG4gICAgdmFsaWRhdGVTbG90cyhvcHRpb25zLnNsb3RzKVxuICB9XG5cbiAgLy8gT2JqZWN0cyBhcmUgbm90IHJlc29sdmVkIGluIGV4dGVuZGVkIGNvbXBvbmVudHMgaW4gVnVlIDwgMi41XG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS92dWVqcy92dWUvaXNzdWVzLzY0MzZcbiAgaWYgKFxuICAgIG9wdGlvbnMucHJvdmlkZSAmJlxuICAgIHR5cGVvZiBvcHRpb25zLnByb3ZpZGUgPT09ICdvYmplY3QnICYmXG4gICAgVlVFX1ZFUlNJT04gPCAyLjVcbiAgKSB7XG4gICAgY29uc3Qgb2JqID0geyAuLi5vcHRpb25zLnByb3ZpZGUgfVxuICAgIG9wdGlvbnMucHJvdmlkZSA9ICgpID0+IG9ialxuICB9XG5cbiAgY29uc3Qgc2NvcGVkU2xvdHMgPSBjcmVhdGVTY29wZWRTbG90cyhvcHRpb25zLnNjb3BlZFNsb3RzLCBfVnVlKVxuXG4gIGlmIChvcHRpb25zLnBhcmVudENvbXBvbmVudCAmJiAhaXNQbGFpbk9iamVjdChvcHRpb25zLnBhcmVudENvbXBvbmVudCkpIHtcbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYG9wdGlvbnMucGFyZW50Q29tcG9uZW50IHNob3VsZCBiZSBhIHZhbGlkIFZ1ZSBjb21wb25lbnQgYCArXG4gICAgICBgb3B0aW9ucyBvYmplY3RgXG4gICAgKVxuICB9XG5cbiAgY29uc3QgcGFyZW50Q29tcG9uZW50T3B0aW9ucyA9IG9wdGlvbnMucGFyZW50Q29tcG9uZW50IHx8IHt9XG4gIHBhcmVudENvbXBvbmVudE9wdGlvbnMucHJvdmlkZSA9IG9wdGlvbnMucHJvdmlkZVxuICBwYXJlbnRDb21wb25lbnRPcHRpb25zLiRfZG9Ob3RTdHViQ2hpbGRyZW4gPSB0cnVlXG5cbiAgcGFyZW50Q29tcG9uZW50T3B0aW9ucy5yZW5kZXIgPSBmdW5jdGlvbiAoaCkge1xuICAgIGNvbnN0IHNsb3RzID0gb3B0aW9ucy5zbG90c1xuICAgICAgPyBjcmVhdGVTbG90Vk5vZGVzKHRoaXMsIG9wdGlvbnMuc2xvdHMpXG4gICAgICA6IHVuZGVmaW5lZFxuICAgIHJldHVybiBoKFxuICAgICAgQ29uc3RydWN0b3IsXG4gICAgICB7XG4gICAgICAgIHJlZjogJ3ZtJyxcbiAgICAgICAgb246IG9wdGlvbnMubGlzdGVuZXJzLFxuICAgICAgICBhdHRyczoge1xuICAgICAgICAgIC4uLm9wdGlvbnMuYXR0cnMsXG4gICAgICAgICAgLy8gcGFzcyBhcyBhdHRycyBzbyB0aGF0IGluaGVyaXRBdHRycyB3b3JrcyBjb3JyZWN0bHlcbiAgICAgICAgICAvLyBwcm9wc0RhdGEgc2hvdWxkIHRha2UgcHJlY2VkZW5jZSBvdmVyIGF0dHJzXG4gICAgICAgICAgLi4ub3B0aW9ucy5wcm9wc0RhdGFcbiAgICAgICAgfSxcbiAgICAgICAgc2NvcGVkU2xvdHNcbiAgICAgIH0sXG4gICAgICBzbG90c1xuICAgIClcbiAgfVxuICBjb25zdCBQYXJlbnQgPSBfVnVlLmV4dGVuZChwYXJlbnRDb21wb25lbnRPcHRpb25zKVxuXG4gIHJldHVybiBuZXcgUGFyZW50KClcbn1cbiIsImltcG9ydCB7IGlzUGxhaW5PYmplY3QgfSBmcm9tICcuL3ZhbGlkYXRvcnMnXG5pbXBvcnQgeyB0aHJvd0Vycm9yIH0gZnJvbSAnLi91dGlsJ1xuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplU3R1YnMgKHN0dWJzID0ge30pIHtcbiAgaWYgKHN0dWJzID09PSBmYWxzZSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG4gIGlmIChpc1BsYWluT2JqZWN0KHN0dWJzKSkge1xuICAgIHJldHVybiBzdHVic1xuICB9XG4gIGlmIChBcnJheS5pc0FycmF5KHN0dWJzKSkge1xuICAgIHJldHVybiBzdHVicy5yZWR1Y2UoKGFjYywgc3R1YikgPT4ge1xuICAgICAgaWYgKHR5cGVvZiBzdHViICE9PSAnc3RyaW5nJykge1xuICAgICAgICB0aHJvd0Vycm9yKCdlYWNoIGl0ZW0gaW4gYW4gb3B0aW9ucy5zdHVicyBhcnJheSBtdXN0IGJlIGEgc3RyaW5nJylcbiAgICAgIH1cbiAgICAgIGFjY1tzdHViXSA9IHRydWVcbiAgICAgIHJldHVybiBhY2NcbiAgICB9LCB7fSlcbiAgfVxuICB0aHJvd0Vycm9yKCdvcHRpb25zLnN0dWJzIG11c3QgYmUgYW4gb2JqZWN0IG9yIGFuIEFycmF5Jylcbn1cbiIsIi8vIEBmbG93XG5pbXBvcnQgeyBub3JtYWxpemVTdHVicyB9IGZyb20gJy4vbm9ybWFsaXplJ1xuXG5mdW5jdGlvbiBnZXRPcHRpb24gKG9wdGlvbiwgY29uZmlnPzogT2JqZWN0KTogYW55IHtcbiAgaWYgKG9wdGlvbiA9PT0gZmFsc2UpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuICBpZiAob3B0aW9uIHx8IChjb25maWcgJiYgT2JqZWN0LmtleXMoY29uZmlnKS5sZW5ndGggPiAwKSkge1xuICAgIGlmIChvcHRpb24gaW5zdGFuY2VvZiBGdW5jdGlvbikge1xuICAgICAgcmV0dXJuIG9wdGlvblxuICAgIH1cbiAgICBpZiAoY29uZmlnIGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ29uZmlnIGNhbid0IGJlIGEgRnVuY3Rpb24uYClcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLmNvbmZpZyxcbiAgICAgIC4uLm9wdGlvblxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbWVyZ2VPcHRpb25zIChvcHRpb25zOiBPcHRpb25zLCBjb25maWc6IENvbmZpZyk6IE9wdGlvbnMge1xuICBjb25zdCBtb2NrcyA9IChnZXRPcHRpb24ob3B0aW9ucy5tb2NrcywgY29uZmlnLm1vY2tzKTogT2JqZWN0KVxuICBjb25zdCBtZXRob2RzID0gKFxuICAgIChnZXRPcHRpb24ob3B0aW9ucy5tZXRob2RzLCBjb25maWcubWV0aG9kcykpOiB7IFtrZXk6IHN0cmluZ106IEZ1bmN0aW9uIH0pXG4gIGNvbnN0IHByb3ZpZGUgPSAoKGdldE9wdGlvbihvcHRpb25zLnByb3ZpZGUsIGNvbmZpZy5wcm92aWRlKSk6IE9iamVjdClcbiAgcmV0dXJuIHtcbiAgICAuLi5vcHRpb25zLFxuICAgIGxvZ01vZGlmaWVkQ29tcG9uZW50czogY29uZmlnLmxvZ01vZGlmaWVkQ29tcG9uZW50cyxcbiAgICBzdHViczogZ2V0T3B0aW9uKG5vcm1hbGl6ZVN0dWJzKG9wdGlvbnMuc3R1YnMpLCBjb25maWcuc3R1YnMpLFxuICAgIG1vY2tzLFxuICAgIG1ldGhvZHMsXG4gICAgcHJvdmlkZSxcbiAgICBzeW5jOiAhIShvcHRpb25zLnN5bmMgfHwgb3B0aW9ucy5zeW5jID09PSB1bmRlZmluZWQpXG4gIH1cbn1cbiIsImltcG9ydCB0ZXN0VXRpbHMgZnJvbSAnQHZ1ZS90ZXN0LXV0aWxzJ1xuXG5leHBvcnQgZGVmYXVsdCB0ZXN0VXRpbHMuY29uZmlnXG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgVnVlIGZyb20gJ3Z1ZSdcbmltcG9ydCBjcmVhdGVJbnN0YW5jZSBmcm9tICdjcmVhdGUtaW5zdGFuY2UnXG5pbXBvcnQgeyB0aHJvd0Vycm9yIH0gZnJvbSAnc2hhcmVkL3V0aWwnXG5pbXBvcnQgeyBjcmVhdGVSZW5kZXJlciB9IGZyb20gJ3Z1ZS1zZXJ2ZXItcmVuZGVyZXInXG5pbXBvcnQgeyBtZXJnZU9wdGlvbnMgfSBmcm9tICdzaGFyZWQvbWVyZ2Utb3B0aW9ucydcbmltcG9ydCBjb25maWcgZnJvbSAnLi9jb25maWcnXG5pbXBvcnQgdGVzdFV0aWxzIGZyb20gJ0B2dWUvdGVzdC11dGlscydcblxuVnVlLmNvbmZpZy5wcm9kdWN0aW9uVGlwID0gZmFsc2VcblZ1ZS5jb25maWcuZGV2dG9vbHMgPSBmYWxzZVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiByZW5kZXJUb1N0cmluZyAoXG4gIGNvbXBvbmVudDogQ29tcG9uZW50LFxuICBvcHRpb25zOiBPcHRpb25zID0ge31cbik6IHN0cmluZyB7XG4gIGNvbnN0IHJlbmRlcmVyID0gY3JlYXRlUmVuZGVyZXIoKVxuXG4gIGlmICghcmVuZGVyZXIpIHtcbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYHJlbmRlclRvU3RyaW5nIG11c3QgYmUgcnVuIGluIG5vZGUuIEl0IGNhbm5vdCBiZSBgICsgYHJ1biBpbiBhIGJyb3dzZXJgXG4gICAgKVxuICB9XG5cbiAgaWYgKG9wdGlvbnMuYXR0YWNoVG9Eb2N1bWVudCkge1xuICAgIHRocm93RXJyb3IoYHlvdSBjYW5ub3QgdXNlIGF0dGFjaFRvRG9jdW1lbnQgd2l0aCBgICsgYHJlbmRlclRvU3RyaW5nYClcbiAgfVxuXG4gIGNvbnN0IHZtID0gY3JlYXRlSW5zdGFuY2UoXG4gICAgY29tcG9uZW50LFxuICAgIG1lcmdlT3B0aW9ucyhvcHRpb25zLCBjb25maWcpLFxuICAgIHRlc3RVdGlscy5jcmVhdGVMb2NhbFZ1ZShvcHRpb25zLmxvY2FsVnVlKVxuICApXG4gIGxldCByZW5kZXJlZFN0cmluZyA9ICcnXG5cbiAgLy8gJEZsb3dJZ25vcmVcbiAgcmVuZGVyZXIucmVuZGVyVG9TdHJpbmcodm0sIChlcnIsIHJlcykgPT4ge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGNvbnNvbGUubG9nKGVycilcbiAgICB9XG4gICAgcmVuZGVyZWRTdHJpbmcgPSByZXNcbiAgfSlcbiAgcmV0dXJuIHJlbmRlcmVkU3RyaW5nXG59XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgcmVuZGVyVG9TdHJpbmcgZnJvbSAnLi9yZW5kZXJUb1N0cmluZydcbmltcG9ydCBjaGVlcmlvIGZyb20gJ2NoZWVyaW8nXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHJlbmRlciAoXG4gIGNvbXBvbmVudDogQ29tcG9uZW50LFxuICBvcHRpb25zOiBPcHRpb25zID0ge31cbik6IHN0cmluZyB7XG4gIGNvbnN0IHJlbmRlcmVkU3RyaW5nID0gcmVuZGVyVG9TdHJpbmcoY29tcG9uZW50LCBvcHRpb25zKVxuICByZXR1cm4gY2hlZXJpby5sb2FkKCcnKShyZW5kZXJlZFN0cmluZylcbn1cbiIsImltcG9ydCByZW5kZXJUb1N0cmluZyBmcm9tICcuL3JlbmRlclRvU3RyaW5nJ1xuaW1wb3J0IHJlbmRlciBmcm9tICcuL3JlbmRlcidcbmltcG9ydCBjb25maWcgZnJvbSAnLi9jb25maWcnXG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgcmVuZGVyVG9TdHJpbmcsXG4gIGNvbmZpZyxcbiAgcmVuZGVyXG59XG4iXSwibmFtZXMiOlsiY29uc3QiLCJjb21waWxlVG9GdW5jdGlvbnMiLCJ0aGlzIiwiJCRWdWUiLCJsZXQiLCJyZXNvbHZlQ29tcG9uZW50IiwiY29tcG9uZW50Iiwic3R1YiIsImNyZWF0ZVJlbmRlcmVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7O0FBSUEsU0FBUyxZQUFZO0VBQ25CLEVBQUU7RUFDRixTQUFTO0VBQ1QsSUFBSTtFQUNVO0VBQ2RBLElBQU0sRUFBRSxHQUFHQyxzQ0FBa0I7OEJBQ0osSUFBSSxTQUFJLFNBQVM7SUFDekM7RUFDREQsSUFBTSxnQkFBZ0IsR0FBRyxF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LEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUNyQyxJQUFJLEdBQUcsQ0FBQzs7SUFFUixJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDUixHQUFHLEdBQUcsRUFBRSxHQUFDO1NBQ04sSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ2IsR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsUUFBUSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sR0FBQztTQUMzQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUM7O1FBRWIsR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxNQUFNLEdBQUcsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUM7U0FDM0QsSUFBSSxFQUFFLEVBQUU7TUFDWCxLQUFLLENBQUMsaUJBQWlCLEVBQUUsRUFBRSxDQUFDLENBQUM7TUFDN0IsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUc7VUFDdEIsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUM7TUFDaEIsR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEVBQUU7WUFDakMsSUFBSSxHQUFHLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO0tBQ3hDOztRQUVDLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDNUIsSUFBSSxHQUFHLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFDOztJQUV6QyxLQUFLLENBQUMsY0FB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
