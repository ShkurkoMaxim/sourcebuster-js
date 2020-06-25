!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.sbjs=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./src/js/sourcebuster.js":[function(_dereq_,module,exports){
"use strict";

var init = _dereq_('./init');

var sbjs = {
  init: function(prefs) {
    this.get = init(prefs);
    if (prefs && prefs.callback && typeof prefs.callback === 'function') {
      prefs.callback(this.get);
    }
  }
};

module.exports = sbjs;
},{"./init":"/mnt/d/Work/SKBLAB/sourcebuster-js/src/js/init.js"}],"/mnt/d/Work/SKBLAB/sourcebuster-js/src/js/data.js":[function(_dereq_,module,exports){
"use strict";

var terms = _dereq_('./terms'),
    utils = _dereq_('./helpers/utils');

var data = {

  containers: {
    current:          'sbjs_current',
    current_extra:    'sbjs_current_add',
    first:            'sbjs_first',
    first_extra:      'sbjs_first_add',
    session:          'sbjs_session',
    udata:            'sbjs_udata',
    promocode:        'sbjs_promo'
  },

  service: {
    migrations:       'sbjs_migrations'
  },

  delimiter:          '|||',

  aliases: {

    main: {
      type:           'typ',
      source:         'src',
      medium:         'mdm',
      campaign:       'cmp',
      content:        'cnt',
      term:           'trm'
    },

    extra: {
      fire_date:      'fd',
      entrance_point: 'ep',
      referer:        'rf'
    },

    session: {
      pages_seen:     'pgs',
      current_page:   'cpg'
    },

    udata: {
      visits:         'vst',
      ip:             'uip',
      agent:          'uag'
    },

    promo:            'code'

  },

  pack: {

    main: function(sbjs) {
      return (
        data.aliases.main.type      + '=' + sbjs.type     + data.delimiter +
        data.aliases.main.source    + '=' + sbjs.source   + data.delimiter +
        data.aliases.main.medium    + '=' + sbjs.medium   + data.delimiter +
        data.aliases.main.campaign  + '=' + sbjs.campaign + data.delimiter +
        data.aliases.main.content   + '=' + sbjs.content  + data.delimiter +
        data.aliases.main.term      + '=' + sbjs.term
      );
    },

    extra: function(timezone_offset) {
      return (
        data.aliases.extra.fire_date      + '=' + utils.setDate(new Date, timezone_offset) + data.delimiter +
        data.aliases.extra.entrance_point + '=' + document.location.href                   + data.delimiter +
        data.aliases.extra.referer        + '=' + (document.referrer || terms.none)
      );
    },

    user: function(visits, user_ip) {
      return (
        data.aliases.udata.visits + '=' + visits  + data.delimiter +
        data.aliases.udata.ip     + '=' + user_ip + data.delimiter +
        data.aliases.udata.agent  + '=' + navigator.userAgent
      );
    },

    session: function(pages) {
      return (
      data.aliases.session.pages_seen   + '=' + pages + data.delimiter +
      data.aliases.session.current_page + '=' + document.location.href
      );
    },

    promo: function(promo) {
      return (
        data.aliases.promo + '=' + utils.setLeadingZeroToInt(utils.randomInt(promo.min, promo.max), promo.max.toString().length)
      );
    }

  }
};

module.exports = data;
},{"./helpers/utils":"/mnt/d/Work/SKBLAB/sourcebuster-js/src/js/helpers/utils.js","./terms":"/mnt/d/Work/SKBLAB/sourcebuster-js/src/js/terms.js"}],"/mnt/d/Work/SKBLAB/sourcebuster-js/src/js/helpers/cookies.js":[function(_dereq_,module,exports){
"use strict";

var delimiter = _dereq_('../data').delimiter;

module.exports = {

  encodeData: function(s) {
    return encodeURIComponent(s).replace(/\!/g, '%21')
                                .replace(/\~/g, '%7E')
                                .replace(/\*/g, '%2A')
                                .replace(/\'/g, '%27')
                                .replace(/\(/g, '%28')
                                .replace(/\)/g, '%29');
  },

  decodeData: function(s) {
    try {
      return decodeURIComponent(s).replace(/\%21/g, '!')
                                  .replace(/\%7E/g, '~')
                                  .replace(/\%2A/g, '*')
                                  .replace(/\%27/g, "'")
                                  .replace(/\%28/g, '(')
                                  .replace(/\%29/g, ')');
    } catch(err1) {
      // try unescape for backward compatibility
      try { return unescape(s); } catch(err2) { return ''; }
    }
  },

  set: function(name, value, minutes, domain, excl_subdomains) {
    var expires, basehost;

    if (minutes) {
      var date = new Date();
      date.setTime(date.getTime() + (minutes * 60 * 1000));
      expires = '; expires=' + date.toGMTString();
    } else {
      expires = '';
    }
    if (domain && !excl_subdomains) {
      basehost = ';domain=.' + domain;
    } else {
      basehost = '';
    }
    document.cookie = this.encodeData(name) + '=' + this.encodeData(value) + expires + basehost + '; path=/';
  },

  get: function(name) {
    var nameEQ = this.encodeData(name) + '=',
        ca = document.cookie.split(';');

    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) === ' ') { c = c.substring(1, c.length); }
      if (c.indexOf(nameEQ) === 0) {
        return this.decodeData(c.substring(nameEQ.length, c.length));
      }
    }
    return null;
  },

  destroy: function(name, domain, excl_subdomains) {
    this.set(name, '', -1, domain, excl_subdomains);
  },

  parse: function(yummy) {

    var cookies = [],
        data    = {};

    if (typeof yummy === 'string') {
      cookies.push(yummy);
    } else {
      for (var prop in yummy) {
        if (yummy.hasOwnProperty(prop)) {
          cookies.push(yummy[prop]);
        }
      }
    }

    for (var i1 = 0; i1 < cookies.length; i1++) {
      var cookie_array;
      data[this.unsbjs(cookies[i1])] = {};
      if (this.get(cookies[i1])) {
        cookie_array = this.get(cookies[i1]).split(delimiter);
      } else {
        cookie_array = [];
      }
      for (var i2 = 0; i2 < cookie_array.length; i2++) {
        var tmp_array = cookie_array[i2].split('='),
            result_array = tmp_array.splice(0, 1);
        result_array.push(tmp_array.join('='));
        data[this.unsbjs(cookies[i1])][result_array[0]] = this.decodeData(result_array[1]);
      }
    }

    return data;

  },

  unsbjs: function (string) {
    return string.replace('sbjs_', '');
  }

};

},{"../data":"/mnt/d/Work/SKBLAB/sourcebuster-js/src/js/data.js"}],"/mnt/d/Work/SKBLAB/sourcebuster-js/src/js/helpers/uri.js":[function(_dereq_,module,exports){
"use strict";

module.exports = {

  parse: function(str) {
    var o = this.parseOptions,
        m = o.parser[o.strictMode ? 'strict' : 'loose'].exec(str),
        uri = {},
        i = 14;

    while (i--) { uri[o.key[i]] = m[i] || ''; }

    uri[o.q.name] = {};
    uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
      if ($1) { uri[o.q.name][$1] = $2; }
    });

    return uri;
  },

  parseOptions: {
    strictMode: false,
    key: ['source','protocol','authority','userInfo','user','password','host','port','relative','path','directory','file','query','anchor'],
    q: {
      name:   'queryKey',
      parser: /(?:^|&)([^&=]*)=?([^&]*)/g
    },
    parser: {
      strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
      loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
    }
  },

  getParam: function(custom_params) {
    var query_string = {},
        query = custom_params ? custom_params : window.location.search.substring(1),
        vars = query.split('&');

    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');
      if (typeof query_string[pair[0]] === 'undefined') {
        query_string[pair[0]] = pair[1];
      } else if (typeof query_string[pair[0]] === 'string') {
        var arr = [ query_string[pair[0]], pair[1] ];
        query_string[pair[0]] = arr;
      } else {
        query_string[pair[0]].push(pair[1]);
      }
    }
    return query_string;
  },

  getHost: function(request) {
    return this.parse(request).host.replace('www.', '');
  }

};
},{}],"/mnt/d/Work/SKBLAB/sourcebuster-js/src/js/helpers/utils.js":[function(_dereq_,module,exports){
"use strict";

module.exports = {

  escapeRegexp: function(string) {
    return string.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  },

  setDate: function(date, offset) {
    var utc_offset    = date.getTimezoneOffset() / 60,
        now_hours     = date.getHours(),
        custom_offset = offset || offset === 0 ? offset : -utc_offset;

    date.setHours(now_hours + utc_offset + custom_offset);

    var year    = date.getFullYear(),
        month   = this.setLeadingZeroToInt(date.getMonth() + 1,   2),
        day     = this.setLeadingZeroToInt(date.getDate(),        2),
        hour    = this.setLeadingZeroToInt(date.getHours(),       2),
        minute  = this.setLeadingZeroToInt(date.getMinutes(),     2),
        second  = this.setLeadingZeroToInt(date.getSeconds(),     2);

    return (year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second);
  },

  setLeadingZeroToInt: function(num, size) {
    var s = num + '';
    while (s.length < size) { s = '0' + s; }
    return s;
  },

  randomInt: function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

};

},{}],"/mnt/d/Work/SKBLAB/sourcebuster-js/src/js/init.js":[function(_dereq_,module,exports){
"use strict";

var data        = _dereq_('./data'),
    terms       = _dereq_('./terms'),
    cookies     = _dereq_('./helpers/cookies'),
    uri         = _dereq_('./helpers/uri'),
    utils       = _dereq_('./helpers/utils'),
    params      = _dereq_('./params'),
    migrations  = _dereq_('./migrations');

var blacklist = ['partner', 'office', 'agent'];

module.exports = function(prefs) {

  var p         = params.fetch(prefs);
  var get_param = uri.getParam();
  var domain    = p.domain.host,
      isolate   = p.domain.isolate,
      lifetime  = p.lifetime;

  migrations.go(lifetime, domain, isolate);

  var __sbjs_type,
      __sbjs_source,
      __sbjs_medium,
      __sbjs_campaign,
      __sbjs_content,
      __sbjs_term;

  function mainData() {
    var sbjs_data;
    if (
        typeof get_param.utm_source        !== 'undefined' ||
        typeof get_param.utm_medium        !== 'undefined' ||
        typeof get_param.utm_campaign      !== 'undefined' ||
        typeof get_param.utm_content       !== 'undefined' ||
        typeof get_param.utm_term          !== 'undefined' ||
        typeof get_param.gclid             !== 'undefined' ||
        typeof get_param.yclid             !== 'undefined' ||
        typeof get_param[p.campaign_param] !== 'undefined' ||
        typeof get_param[p.term_param]     !== 'undefined' ||
        typeof get_param[p.content_param]  !== 'undefined'
    ) {
      setFirstAndCurrentExtraData();
      sbjs_data = getData(terms.traffic.utm);
    } else if (checkReferer(terms.traffic.organic)) {
      setFirstAndCurrentExtraData();
      sbjs_data = getData(terms.traffic.organic);
    } else if (!cookies.get(data.containers.session) && checkReferer(terms.traffic.referral)) {
      setFirstAndCurrentExtraData();
      sbjs_data = getData(terms.traffic.referral);
    } else if (!cookies.get(data.containers.first) && !cookies.get(data.containers.current)) {
      setFirstAndCurrentExtraData();
      sbjs_data = getData(terms.traffic.typein);
    } else {
      return cookies.get(data.containers.current);
    }

    return sbjs_data;
  }

  function getData(type) {

    switch (type) {

      case terms.traffic.utm:

        __sbjs_type = terms.traffic.utm;

        if (typeof get_param.utm_source !== 'undefined') {
          __sbjs_source = get_param.utm_source;
        } else if (typeof get_param.gclid !== 'undefined') {
          __sbjs_source = 'google';
        } else if (typeof get_param.yclid !== 'undefined') {
          __sbjs_source = 'yandex';  
        } else {
          __sbjs_source = terms.none;
        }

        if (typeof get_param.utm_medium !== 'undefined') {
          __sbjs_medium = get_param.utm_medium;
        } else if (typeof get_param.gclid !== 'undefined') {
          __sbjs_medium = 'cpc';
        } else if (typeof get_param.yclid !== 'undefined') {
          __sbjs_medium = 'cpc';  
        } else {
          __sbjs_medium = terms.none;
        }

        if (typeof get_param.utm_campaign !== 'undefined') {
          __sbjs_campaign = get_param.utm_campaign;
        } else if (typeof get_param[p.campaign_param] !== 'undefined') {
          __sbjs_campaign = get_param[p.campaign_param];
        } else if (typeof get_param.gclid !== 'undefined') {
          __sbjs_campaign = 'google_cpc';
        } else if (typeof get_param.yclid !== 'undefined') {
          __sbjs_campaign = 'yandex_cpc';  
        } else {
          __sbjs_campaign = terms.none;
        }

        if (typeof get_param.utm_content !== 'undefined') {
          __sbjs_content = get_param.utm_content;
        } else if (typeof get_param[p.content_param] !== 'undefined') {
          __sbjs_content = get_param[p.content_param];
        } else {
          __sbjs_content = terms.none;
        }

        if (typeof get_param.utm_term !== 'undefined') {
          __sbjs_term = get_param.utm_term;
        } else if (typeof get_param[p.term_param] !== 'undefined') {
          __sbjs_term = get_param[p.term_param];
        } else {
          __sbjs_term = getUtmTerm() || terms.none;
        }

        break;

      case terms.traffic.organic:
        __sbjs_type     = terms.traffic.organic;
        __sbjs_source   = __sbjs_source || uri.getHost(document.referrer);
        __sbjs_medium   = terms.referer.organic;
        __sbjs_campaign = terms.none;
        __sbjs_content  = terms.none;
        __sbjs_term     = terms.none;
        break;

      case terms.traffic.referral:
        __sbjs_type     = terms.traffic.referral;
        __sbjs_source   = __sbjs_source || uri.getHost(document.referrer);
        __sbjs_medium   = __sbjs_medium || terms.referer.referral;
        __sbjs_campaign = terms.none;
        __sbjs_content  = uri.parse(document.referrer).path;
        __sbjs_term     = terms.none;
        break;

      case terms.traffic.typein:
        __sbjs_type     = terms.traffic.typein;
        __sbjs_source   = p.typein_attributes.source;
        __sbjs_medium   = p.typein_attributes.medium;
        __sbjs_campaign = terms.none;
        __sbjs_content  = terms.none;
        __sbjs_term     = terms.none;
        break;

      default:
        __sbjs_type     = terms.oops;
        __sbjs_source   = terms.oops;
        __sbjs_medium   = terms.oops;
        __sbjs_campaign = terms.oops;
        __sbjs_content  = terms.oops;
        __sbjs_term     = terms.oops;
    }
    var sbjs_data = {
      type:             __sbjs_type,
      source:           __sbjs_source,
      medium:           __sbjs_medium,
      campaign:         __sbjs_campaign,
      content:          __sbjs_content,
      term:             __sbjs_term
    };

    return data.pack.main(sbjs_data);

  }

  function getUtmTerm() {
    var referer = document.referrer;
    if (get_param.utm_term) {
      return get_param.utm_term;
    } else if (referer && uri.parse(referer).host && uri.parse(referer).host.match(/^(?:.*\.)?yandex\..{2,9}$/i)) {
      try {
        return uri.getParam(uri.parse(document.referrer).query).text;
      } catch (err) {
        return false;
      }
    } else {
      return false;
    }
  }

  function checkReferer(type) {
    var referer = document.referrer;
    switch(type) {
      case terms.traffic.organic:
        return (!!referer && checkRefererHost(referer) && isOrganic(referer));
      case terms.traffic.referral:
        return (!!referer && checkRefererHost(referer) && isReferral(referer));
      default:
        return false;
    }
  }

  function checkRefererHost(referer) {
    if (p.domain) {
      if (!isolate) {
        var host_regex = new RegExp('^(?:.*\\.)?' + utils.escapeRegexp(domain) + '$', 'i');
        return !(uri.getHost(referer).match(host_regex));
      } else {
        return (uri.getHost(referer) !== uri.getHost(domain));
      }
    } else {
      return (uri.getHost(referer) !== uri.getHost(document.location.href));
    }
  }

  function isOrganic(referer) {

    var y_host  = 'yandex',
        y_param = 'text',
        g_host  = 'google';

    var y_host_regex  = new RegExp('^(?:.*\\.)?'  + utils.escapeRegexp(y_host)  + '\\..{2,9}$'),
        y_param_regex = new RegExp('.*'           + utils.escapeRegexp(y_param) + '=.*'),
        g_host_regex  = new RegExp('^(?:www\\.)?' + utils.escapeRegexp(g_host)  + '\\..{2,9}$');

    if (
        !!uri.parse(referer).query &&
        !!uri.parse(referer).host.match(y_host_regex) &&
        !!uri.parse(referer).query.match(y_param_regex)
      ) {
      __sbjs_source = y_host;
      return true;
    } else if (!!uri.parse(referer).host.match(g_host_regex)) {
      __sbjs_source = g_host;
      return true;
    } else if (!!uri.parse(referer).query) {
      for (var i = 0; i < p.organics.length; i++) {
        if (
            uri.parse(referer).host.match(new RegExp('^(?:.*\\.)?' + utils.escapeRegexp(p.organics[i].host)  + '$', 'i')) &&
            uri.parse(referer).query.match(new RegExp('.*'         + utils.escapeRegexp(p.organics[i].param) + '=.*', 'i'))
          ) {
          __sbjs_source = p.organics[i].display || p.organics[i].host;
          return true;
        }
        if (i + 1 === p.organics.length) {
          return false;
        }
      }
    } else {
      return false;
    }
  }

  function isReferral(referer) {
    if (p.referrals.length > 0) {
      for (var i = 0; i < p.referrals.length; i++) {
        if (uri.parse(referer).host.match(new RegExp('^(?:.*\\.)?' + utils.escapeRegexp(p.referrals[i].host) + '$', 'i'))) {
          __sbjs_source = p.referrals[i].display  || p.referrals[i].host;
          __sbjs_medium = p.referrals[i].medium   || terms.referer.referral;
          return true;
        }
        if (i + 1 === p.referrals.length) {
          __sbjs_source = uri.getHost(referer);
          return true;
        }
      }
    } else {
      __sbjs_source = uri.getHost(referer);
      return true;
    }
  }

  function setFirstAndCurrentExtraData() {
    cookies.set(data.containers.current_extra, data.pack.extra(p.timezone_offset), lifetime, domain, isolate);
    if (!cookies.get(data.containers.first_extra)) {
      cookies.set(data.containers.first_extra, data.pack.extra(p.timezone_offset), lifetime, domain, isolate);
    }
  }

  (function setData() {

    if (get_param.ldg && blacklist.includes(get_param.ldg)) {
      // destroy sourcebuster cookies on blacklist
      Object.values(data.containers).map(function(cookie) {
        cookies.destroy(cookie, domain, isolate);
      });
      return;
    }
    // Main data
    cookies.set(data.containers.current, mainData(), lifetime, domain, isolate);
    if (!cookies.get(data.containers.first)) {
      cookies.set(data.containers.first, cookies.get(data.containers.current), lifetime, domain, isolate);
    }

    // User data
    var visits, udata;
    if (!cookies.get(data.containers.udata)) {
      visits  = 1;
      udata   = data.pack.user(visits, p.user_ip);
    } else {
      visits  = parseInt(cookies.parse(data.containers.udata)[cookies.unsbjs(data.containers.udata)][data.aliases.udata.visits]) || 1;
      visits  = cookies.get(data.containers.session) ? visits : visits + 1;
      udata   = data.pack.user(visits, p.user_ip);
    }
    cookies.set(data.containers.udata, udata, lifetime, domain, isolate);

    // Session
    var pages_count;
    if (!cookies.get(data.containers.session)) {
      pages_count = 1;
    } else {
      pages_count = parseInt(cookies.parse(data.containers.session)[cookies.unsbjs(data.containers.session)][data.aliases.session.pages_seen]) || 1;
      pages_count += 1;
    }
    cookies.set(data.containers.session, data.pack.session(pages_count), p.session_length, domain, isolate);

    // Promocode
    if (p.promocode && !cookies.get(data.containers.promocode)) {
      cookies.set(data.containers.promocode, data.pack.promo(p.promocode), lifetime, domain, isolate);
    }

  })();

  return cookies.parse(data.containers);

};
},{"./data":"/mnt/d/Work/SKBLAB/sourcebuster-js/src/js/data.js","./helpers/cookies":"/mnt/d/Work/SKBLAB/sourcebuster-js/src/js/helpers/cookies.js","./helpers/uri":"/mnt/d/Work/SKBLAB/sourcebuster-js/src/js/helpers/uri.js","./helpers/utils":"/mnt/d/Work/SKBLAB/sourcebuster-js/src/js/helpers/utils.js","./migrations":"/mnt/d/Work/SKBLAB/sourcebuster-js/src/js/migrations.js","./params":"/mnt/d/Work/SKBLAB/sourcebuster-js/src/js/params.js","./terms":"/mnt/d/Work/SKBLAB/sourcebuster-js/src/js/terms.js"}],"/mnt/d/Work/SKBLAB/sourcebuster-js/src/js/migrations.js":[function(_dereq_,module,exports){
"use strict";

var data    = _dereq_('./data'),
    cookies = _dereq_('./helpers/cookies');

module.exports = {

  go: function(lifetime, domain, isolate) {

    var migrate = this.migrations,
        _with   = { l: lifetime, d: domain, i: isolate };

    var i;

    if (!cookies.get(data.containers.first) && !cookies.get(data.service.migrations)) {

      var mids = [];
      for (i = 0; i < migrate.length; i++) { mids.push(migrate[i].id); }

      var advance = '';
      for (i = 0; i < mids.length; i++) {
        advance += mids[i] + '=1';
        if (i < mids.length - 1) { advance += data.delimiter; }
      }
      cookies.set(data.service.migrations, advance, _with.l, _with.d, _with.i);

    } else if (!cookies.get(data.service.migrations)) {

      // We have only one migration for now, so just
      for (i = 0; i < migrate.length; i++) {
        migrate[i].go(migrate[i].id, _with);
      }

    }

  },

  migrations: [

    {
      id: '1418474375998',
      version: '1.0.0-beta',
      go: function(mid, _with) {

        var success = mid + '=1',
            fail    = mid + '=0';

        var safeReplace = function($0, $1, $2) {
          return ($1 || $2 ? $0 : data.delimiter);
        };

        try {

          // Switch delimiter and renew cookies
          var _in = [];
          for (var prop in data.containers) {
            if (data.containers.hasOwnProperty(prop)) {
              _in.push(data.containers[prop]);
            }
          }

          for (var i = 0; i < _in.length; i++) {
            if (cookies.get(_in[i])) {
              var buffer = cookies.get(_in[i]).replace(/(\|)?\|(\|)?/g, safeReplace);
              cookies.destroy(_in[i], _with.d, _with.i);
              cookies.destroy(_in[i], _with.d, !_with.i);
              cookies.set(_in[i], buffer, _with.l, _with.d, _with.i);
            }
          }

          // Update `session`
          if (cookies.get(data.containers.session)) {
            cookies.set(data.containers.session, data.pack.session(0), _with.l, _with.d, _with.i);
          }

          // Yay!
          cookies.set(data.service.migrations, success, _with.l, _with.d, _with.i);

        } catch (err) {
          // Oops
          cookies.set(data.service.migrations, fail, _with.l, _with.d, _with.i);
        }
      }
    }

  ]

};
},{"./data":"/mnt/d/Work/SKBLAB/sourcebuster-js/src/js/data.js","./helpers/cookies":"/mnt/d/Work/SKBLAB/sourcebuster-js/src/js/helpers/cookies.js"}],"/mnt/d/Work/SKBLAB/sourcebuster-js/src/js/params.js":[function(_dereq_,module,exports){
"use strict";

var terms = _dereq_('./terms'),
    uri   = _dereq_('./helpers/uri');

module.exports = {

  fetch: function(prefs) {

    var user   = prefs || {},
        params = {};

    // Set `lifetime of the cookie` in months
    params.lifetime = this.validate.checkFloat(user.lifetime) || 6;
    params.lifetime = parseInt(params.lifetime * 30 * 24 * 60);

    // Set `session length` in minutes
    params.session_length = this.validate.checkInt(user.session_length) || 30;

    // Set `timezone offset` in hours
    params.timezone_offset = this.validate.checkInt(user.timezone_offset);

    // Set `campaign param` for AdWords links
    params.campaign_param = user.campaign_param || false;

    // Set `term param` and `content param` for AdWords links
    params.term_param = user.term_param || false;
    params.content_param = user.content_param || false;

    // Set `user ip`
    params.user_ip = user.user_ip || terms.none;

    // Set `promocode`
    if (user.promocode) {
      params.promocode = {};
      params.promocode.min = parseInt(user.promocode.min) || 100000;
      params.promocode.max = parseInt(user.promocode.max) || 999999;
    } else {
      params.promocode = false;
    }

    // Set `typein attributes`
    if (user.typein_attributes && user.typein_attributes.source && user.typein_attributes.medium) {
      params.typein_attributes = {};
      params.typein_attributes.source = user.typein_attributes.source;
      params.typein_attributes.medium = user.typein_attributes.medium;
    } else {
      params.typein_attributes = { source: '(direct)', medium: '(none)' };
    }

    // Set `domain`
    if (user.domain && this.validate.isString(user.domain)) {
      params.domain = { host: user.domain, isolate: false };
    } else if (user.domain && user.domain.host) {
      params.domain = user.domain;
    } else {
      params.domain = { host: uri.getHost(document.location.hostname), isolate: false };
    }

    // Set `referral sources`
    params.referrals = [];

    if (user.referrals && user.referrals.length > 0) {
      for (var ir = 0; ir < user.referrals.length; ir++) {
        if (user.referrals[ir].host) {
          params.referrals.push(user.referrals[ir]);
        }
      }
    }

    // Set `organic sources`
    params.organics = [];

    if (user.organics && user.organics.length > 0) {
      for (var io = 0; io < user.organics.length; io++) {
        if (user.organics[io].host && user.organics[io].param) {
          params.organics.push(user.organics[io]);
        }
      }
    }

    params.organics.push({ host: 'bing.com',      param: 'q',     display: 'bing'            });
    params.organics.push({ host: 'yahoo.com',     param: 'p',     display: 'yahoo'           });
    params.organics.push({ host: 'about.com',     param: 'q',     display: 'about'           });
    params.organics.push({ host: 'aol.com',       param: 'q',     display: 'aol'             });
    params.organics.push({ host: 'ask.com',       param: 'q',     display: 'ask'             });
    params.organics.push({ host: 'globososo.com', param: 'q',     display: 'globo'           });
    params.organics.push({ host: 'go.mail.ru',    param: 'q',     display: 'go.mail.ru'      });
    params.organics.push({ host: 'rambler.ru',    param: 'query', display: 'rambler'         });
    params.organics.push({ host: 'tut.by',        param: 'query', display: 'tut.by'          });

    params.referrals.push({ host: 't.co',                         display: 'twitter.com'     });
    params.referrals.push({ host: 'plus.url.google.com',          display: 'plus.google.com' });


    return params;

  },

  validate: {

    checkFloat: function(v) {
      return v && this.isNumeric(parseFloat(v)) ? parseFloat(v) : false;
    },

    checkInt: function(v) {
      return v && this.isNumeric(parseInt(v)) ? parseInt(v) : false;
    },

    isNumeric: function(v){
      return !isNaN(v);
    },

    isString: function(v) {
      return Object.prototype.toString.call(v) === '[object String]';
    }

  }

};
},{"./helpers/uri":"/mnt/d/Work/SKBLAB/sourcebuster-js/src/js/helpers/uri.js","./terms":"/mnt/d/Work/SKBLAB/sourcebuster-js/src/js/terms.js"}],"/mnt/d/Work/SKBLAB/sourcebuster-js/src/js/terms.js":[function(_dereq_,module,exports){
"use strict";

module.exports = {

  traffic: {
    utm:        'utm',
    organic:    'organic',
    referral:   'referral',
    typein:     'typein'
  },

  referer: {
    referral:   'referral',
    organic:    'organic',
    social:     'social'
  },

  none:         '(none)',
  oops:         '(Houston, we have a problem)'

};

},{}]},{},["./src/js/sourcebuster.js"])("./src/js/sourcebuster.js")
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvc291cmNlYnVzdGVyLmpzIiwic3JjL2pzL2RhdGEuanMiLCJzcmMvanMvaGVscGVycy9jb29raWVzLmpzIiwic3JjL2pzL2hlbHBlcnMvdXJpLmpzIiwic3JjL2pzL2hlbHBlcnMvdXRpbHMuanMiLCJzcmMvanMvaW5pdC5qcyIsInNyYy9qcy9taWdyYXRpb25zLmpzIiwic3JjL2pzL3BhcmFtcy5qcyIsInNyYy9qcy90ZXJtcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3VEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgaW5pdCA9IHJlcXVpcmUoJy4vaW5pdCcpO1xyXG5cclxudmFyIHNianMgPSB7XHJcbiAgaW5pdDogZnVuY3Rpb24ocHJlZnMpIHtcclxuICAgIHRoaXMuZ2V0ID0gaW5pdChwcmVmcyk7XHJcbiAgICBpZiAocHJlZnMgJiYgcHJlZnMuY2FsbGJhY2sgJiYgdHlwZW9mIHByZWZzLmNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgIHByZWZzLmNhbGxiYWNrKHRoaXMuZ2V0KTtcclxuICAgIH1cclxuICB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHNianM7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgdGVybXMgPSByZXF1aXJlKCcuL3Rlcm1zJyksXHJcbiAgICB1dGlscyA9IHJlcXVpcmUoJy4vaGVscGVycy91dGlscycpO1xyXG5cclxudmFyIGRhdGEgPSB7XHJcblxyXG4gIGNvbnRhaW5lcnM6IHtcclxuICAgIGN1cnJlbnQ6ICAgICAgICAgICdzYmpzX2N1cnJlbnQnLFxyXG4gICAgY3VycmVudF9leHRyYTogICAgJ3NianNfY3VycmVudF9hZGQnLFxyXG4gICAgZmlyc3Q6ICAgICAgICAgICAgJ3NianNfZmlyc3QnLFxyXG4gICAgZmlyc3RfZXh0cmE6ICAgICAgJ3NianNfZmlyc3RfYWRkJyxcclxuICAgIHNlc3Npb246ICAgICAgICAgICdzYmpzX3Nlc3Npb24nLFxyXG4gICAgdWRhdGE6ICAgICAgICAgICAgJ3NianNfdWRhdGEnLFxyXG4gICAgcHJvbW9jb2RlOiAgICAgICAgJ3NianNfcHJvbW8nXHJcbiAgfSxcclxuXHJcbiAgc2VydmljZToge1xyXG4gICAgbWlncmF0aW9uczogICAgICAgJ3NianNfbWlncmF0aW9ucydcclxuICB9LFxyXG5cclxuICBkZWxpbWl0ZXI6ICAgICAgICAgICd8fHwnLFxyXG5cclxuICBhbGlhc2VzOiB7XHJcblxyXG4gICAgbWFpbjoge1xyXG4gICAgICB0eXBlOiAgICAgICAgICAgJ3R5cCcsXHJcbiAgICAgIHNvdXJjZTogICAgICAgICAnc3JjJyxcclxuICAgICAgbWVkaXVtOiAgICAgICAgICdtZG0nLFxyXG4gICAgICBjYW1wYWlnbjogICAgICAgJ2NtcCcsXHJcbiAgICAgIGNvbnRlbnQ6ICAgICAgICAnY250JyxcclxuICAgICAgdGVybTogICAgICAgICAgICd0cm0nXHJcbiAgICB9LFxyXG5cclxuICAgIGV4dHJhOiB7XHJcbiAgICAgIGZpcmVfZGF0ZTogICAgICAnZmQnLFxyXG4gICAgICBlbnRyYW5jZV9wb2ludDogJ2VwJyxcclxuICAgICAgcmVmZXJlcjogICAgICAgICdyZidcclxuICAgIH0sXHJcblxyXG4gICAgc2Vzc2lvbjoge1xyXG4gICAgICBwYWdlc19zZWVuOiAgICAgJ3BncycsXHJcbiAgICAgIGN1cnJlbnRfcGFnZTogICAnY3BnJ1xyXG4gICAgfSxcclxuXHJcbiAgICB1ZGF0YToge1xyXG4gICAgICB2aXNpdHM6ICAgICAgICAgJ3ZzdCcsXHJcbiAgICAgIGlwOiAgICAgICAgICAgICAndWlwJyxcclxuICAgICAgYWdlbnQ6ICAgICAgICAgICd1YWcnXHJcbiAgICB9LFxyXG5cclxuICAgIHByb21vOiAgICAgICAgICAgICdjb2RlJ1xyXG5cclxuICB9LFxyXG5cclxuICBwYWNrOiB7XHJcblxyXG4gICAgbWFpbjogZnVuY3Rpb24oc2Jqcykge1xyXG4gICAgICByZXR1cm4gKFxyXG4gICAgICAgIGRhdGEuYWxpYXNlcy5tYWluLnR5cGUgICAgICArICc9JyArIHNianMudHlwZSAgICAgKyBkYXRhLmRlbGltaXRlciArXHJcbiAgICAgICAgZGF0YS5hbGlhc2VzLm1haW4uc291cmNlICAgICsgJz0nICsgc2Jqcy5zb3VyY2UgICArIGRhdGEuZGVsaW1pdGVyICtcclxuICAgICAgICBkYXRhLmFsaWFzZXMubWFpbi5tZWRpdW0gICAgKyAnPScgKyBzYmpzLm1lZGl1bSAgICsgZGF0YS5kZWxpbWl0ZXIgK1xyXG4gICAgICAgIGRhdGEuYWxpYXNlcy5tYWluLmNhbXBhaWduICArICc9JyArIHNianMuY2FtcGFpZ24gKyBkYXRhLmRlbGltaXRlciArXHJcbiAgICAgICAgZGF0YS5hbGlhc2VzLm1haW4uY29udGVudCAgICsgJz0nICsgc2Jqcy5jb250ZW50ICArIGRhdGEuZGVsaW1pdGVyICtcclxuICAgICAgICBkYXRhLmFsaWFzZXMubWFpbi50ZXJtICAgICAgKyAnPScgKyBzYmpzLnRlcm1cclxuICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgZXh0cmE6IGZ1bmN0aW9uKHRpbWV6b25lX29mZnNldCkge1xyXG4gICAgICByZXR1cm4gKFxyXG4gICAgICAgIGRhdGEuYWxpYXNlcy5leHRyYS5maXJlX2RhdGUgICAgICArICc9JyArIHV0aWxzLnNldERhdGUobmV3IERhdGUsIHRpbWV6b25lX29mZnNldCkgKyBkYXRhLmRlbGltaXRlciArXHJcbiAgICAgICAgZGF0YS5hbGlhc2VzLmV4dHJhLmVudHJhbmNlX3BvaW50ICsgJz0nICsgZG9jdW1lbnQubG9jYXRpb24uaHJlZiAgICAgICAgICAgICAgICAgICArIGRhdGEuZGVsaW1pdGVyICtcclxuICAgICAgICBkYXRhLmFsaWFzZXMuZXh0cmEucmVmZXJlciAgICAgICAgKyAnPScgKyAoZG9jdW1lbnQucmVmZXJyZXIgfHwgdGVybXMubm9uZSlcclxuICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgdXNlcjogZnVuY3Rpb24odmlzaXRzLCB1c2VyX2lwKSB7XHJcbiAgICAgIHJldHVybiAoXHJcbiAgICAgICAgZGF0YS5hbGlhc2VzLnVkYXRhLnZpc2l0cyArICc9JyArIHZpc2l0cyAgKyBkYXRhLmRlbGltaXRlciArXHJcbiAgICAgICAgZGF0YS5hbGlhc2VzLnVkYXRhLmlwICAgICArICc9JyArIHVzZXJfaXAgKyBkYXRhLmRlbGltaXRlciArXHJcbiAgICAgICAgZGF0YS5hbGlhc2VzLnVkYXRhLmFnZW50ICArICc9JyArIG5hdmlnYXRvci51c2VyQWdlbnRcclxuICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgc2Vzc2lvbjogZnVuY3Rpb24ocGFnZXMpIHtcclxuICAgICAgcmV0dXJuIChcclxuICAgICAgZGF0YS5hbGlhc2VzLnNlc3Npb24ucGFnZXNfc2VlbiAgICsgJz0nICsgcGFnZXMgKyBkYXRhLmRlbGltaXRlciArXHJcbiAgICAgIGRhdGEuYWxpYXNlcy5zZXNzaW9uLmN1cnJlbnRfcGFnZSArICc9JyArIGRvY3VtZW50LmxvY2F0aW9uLmhyZWZcclxuICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgcHJvbW86IGZ1bmN0aW9uKHByb21vKSB7XHJcbiAgICAgIHJldHVybiAoXHJcbiAgICAgICAgZGF0YS5hbGlhc2VzLnByb21vICsgJz0nICsgdXRpbHMuc2V0TGVhZGluZ1plcm9Ub0ludCh1dGlscy5yYW5kb21JbnQocHJvbW8ubWluLCBwcm9tby5tYXgpLCBwcm9tby5tYXgudG9TdHJpbmcoKS5sZW5ndGgpXHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZGF0YTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBkZWxpbWl0ZXIgPSByZXF1aXJlKCcuLi9kYXRhJykuZGVsaW1pdGVyO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcblxyXG4gIGVuY29kZURhdGE6IGZ1bmN0aW9uKHMpIHtcclxuICAgIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQocykucmVwbGFjZSgvXFwhL2csICclMjEnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXH4vZywgJyU3RScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcKi9nLCAnJTJBJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFwnL2csICclMjcnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXCgvZywgJyUyOCcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcKS9nLCAnJTI5Jyk7XHJcbiAgfSxcclxuXHJcbiAgZGVjb2RlRGF0YTogZnVuY3Rpb24ocykge1xyXG4gICAgdHJ5IHtcclxuICAgICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChzKS5yZXBsYWNlKC9cXCUyMS9nLCAnIScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFwlN0UvZywgJ34nKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcJTJBL2csICcqJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXCUyNy9nLCBcIidcIilcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXCUyOC9nLCAnKCcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFwlMjkvZywgJyknKTtcclxuICAgIH0gY2F0Y2goZXJyMSkge1xyXG4gICAgICAvLyB0cnkgdW5lc2NhcGUgZm9yIGJhY2t3YXJkIGNvbXBhdGliaWxpdHlcclxuICAgICAgdHJ5IHsgcmV0dXJuIHVuZXNjYXBlKHMpOyB9IGNhdGNoKGVycjIpIHsgcmV0dXJuICcnOyB9XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgc2V0OiBmdW5jdGlvbihuYW1lLCB2YWx1ZSwgbWludXRlcywgZG9tYWluLCBleGNsX3N1YmRvbWFpbnMpIHtcclxuICAgIHZhciBleHBpcmVzLCBiYXNlaG9zdDtcclxuXHJcbiAgICBpZiAobWludXRlcykge1xyXG4gICAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlKCk7XHJcbiAgICAgIGRhdGUuc2V0VGltZShkYXRlLmdldFRpbWUoKSArIChtaW51dGVzICogNjAgKiAxMDAwKSk7XHJcbiAgICAgIGV4cGlyZXMgPSAnOyBleHBpcmVzPScgKyBkYXRlLnRvR01UU3RyaW5nKCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBleHBpcmVzID0gJyc7XHJcbiAgICB9XHJcbiAgICBpZiAoZG9tYWluICYmICFleGNsX3N1YmRvbWFpbnMpIHtcclxuICAgICAgYmFzZWhvc3QgPSAnO2RvbWFpbj0uJyArIGRvbWFpbjtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGJhc2Vob3N0ID0gJyc7XHJcbiAgICB9XHJcbiAgICBkb2N1bWVudC5jb29raWUgPSB0aGlzLmVuY29kZURhdGEobmFtZSkgKyAnPScgKyB0aGlzLmVuY29kZURhdGEodmFsdWUpICsgZXhwaXJlcyArIGJhc2Vob3N0ICsgJzsgcGF0aD0vJztcclxuICB9LFxyXG5cclxuICBnZXQ6IGZ1bmN0aW9uKG5hbWUpIHtcclxuICAgIHZhciBuYW1lRVEgPSB0aGlzLmVuY29kZURhdGEobmFtZSkgKyAnPScsXHJcbiAgICAgICAgY2EgPSBkb2N1bWVudC5jb29raWUuc3BsaXQoJzsnKTtcclxuXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNhLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHZhciBjID0gY2FbaV07XHJcbiAgICAgIHdoaWxlIChjLmNoYXJBdCgwKSA9PT0gJyAnKSB7IGMgPSBjLnN1YnN0cmluZygxLCBjLmxlbmd0aCk7IH1cclxuICAgICAgaWYgKGMuaW5kZXhPZihuYW1lRVEpID09PSAwKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVjb2RlRGF0YShjLnN1YnN0cmluZyhuYW1lRVEubGVuZ3RoLCBjLmxlbmd0aCkpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9LFxyXG5cclxuICBkZXN0cm95OiBmdW5jdGlvbihuYW1lLCBkb21haW4sIGV4Y2xfc3ViZG9tYWlucykge1xyXG4gICAgdGhpcy5zZXQobmFtZSwgJycsIC0xLCBkb21haW4sIGV4Y2xfc3ViZG9tYWlucyk7XHJcbiAgfSxcclxuXHJcbiAgcGFyc2U6IGZ1bmN0aW9uKHl1bW15KSB7XHJcblxyXG4gICAgdmFyIGNvb2tpZXMgPSBbXSxcclxuICAgICAgICBkYXRhICAgID0ge307XHJcblxyXG4gICAgaWYgKHR5cGVvZiB5dW1teSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgY29va2llcy5wdXNoKHl1bW15KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGZvciAodmFyIHByb3AgaW4geXVtbXkpIHtcclxuICAgICAgICBpZiAoeXVtbXkuaGFzT3duUHJvcGVydHkocHJvcCkpIHtcclxuICAgICAgICAgIGNvb2tpZXMucHVzaCh5dW1teVtwcm9wXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZm9yICh2YXIgaTEgPSAwOyBpMSA8IGNvb2tpZXMubGVuZ3RoOyBpMSsrKSB7XHJcbiAgICAgIHZhciBjb29raWVfYXJyYXk7XHJcbiAgICAgIGRhdGFbdGhpcy51bnNianMoY29va2llc1tpMV0pXSA9IHt9O1xyXG4gICAgICBpZiAodGhpcy5nZXQoY29va2llc1tpMV0pKSB7XHJcbiAgICAgICAgY29va2llX2FycmF5ID0gdGhpcy5nZXQoY29va2llc1tpMV0pLnNwbGl0KGRlbGltaXRlcik7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY29va2llX2FycmF5ID0gW107XHJcbiAgICAgIH1cclxuICAgICAgZm9yICh2YXIgaTIgPSAwOyBpMiA8IGNvb2tpZV9hcnJheS5sZW5ndGg7IGkyKyspIHtcclxuICAgICAgICB2YXIgdG1wX2FycmF5ID0gY29va2llX2FycmF5W2kyXS5zcGxpdCgnPScpLFxyXG4gICAgICAgICAgICByZXN1bHRfYXJyYXkgPSB0bXBfYXJyYXkuc3BsaWNlKDAsIDEpO1xyXG4gICAgICAgIHJlc3VsdF9hcnJheS5wdXNoKHRtcF9hcnJheS5qb2luKCc9JykpO1xyXG4gICAgICAgIGRhdGFbdGhpcy51bnNianMoY29va2llc1tpMV0pXVtyZXN1bHRfYXJyYXlbMF1dID0gdGhpcy5kZWNvZGVEYXRhKHJlc3VsdF9hcnJheVsxXSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZGF0YTtcclxuXHJcbiAgfSxcclxuXHJcbiAgdW5zYmpzOiBmdW5jdGlvbiAoc3RyaW5nKSB7XHJcbiAgICByZXR1cm4gc3RyaW5nLnJlcGxhY2UoJ3NianNfJywgJycpO1xyXG4gIH1cclxuXHJcbn07XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcblxyXG4gIHBhcnNlOiBmdW5jdGlvbihzdHIpIHtcclxuICAgIHZhciBvID0gdGhpcy5wYXJzZU9wdGlvbnMsXHJcbiAgICAgICAgbSA9IG8ucGFyc2VyW28uc3RyaWN0TW9kZSA/ICdzdHJpY3QnIDogJ2xvb3NlJ10uZXhlYyhzdHIpLFxyXG4gICAgICAgIHVyaSA9IHt9LFxyXG4gICAgICAgIGkgPSAxNDtcclxuXHJcbiAgICB3aGlsZSAoaS0tKSB7IHVyaVtvLmtleVtpXV0gPSBtW2ldIHx8ICcnOyB9XHJcblxyXG4gICAgdXJpW28ucS5uYW1lXSA9IHt9O1xyXG4gICAgdXJpW28ua2V5WzEyXV0ucmVwbGFjZShvLnEucGFyc2VyLCBmdW5jdGlvbiAoJDAsICQxLCAkMikge1xyXG4gICAgICBpZiAoJDEpIHsgdXJpW28ucS5uYW1lXVskMV0gPSAkMjsgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHVyaTtcclxuICB9LFxyXG5cclxuICBwYXJzZU9wdGlvbnM6IHtcclxuICAgIHN0cmljdE1vZGU6IGZhbHNlLFxyXG4gICAga2V5OiBbJ3NvdXJjZScsJ3Byb3RvY29sJywnYXV0aG9yaXR5JywndXNlckluZm8nLCd1c2VyJywncGFzc3dvcmQnLCdob3N0JywncG9ydCcsJ3JlbGF0aXZlJywncGF0aCcsJ2RpcmVjdG9yeScsJ2ZpbGUnLCdxdWVyeScsJ2FuY2hvciddLFxyXG4gICAgcToge1xyXG4gICAgICBuYW1lOiAgICdxdWVyeUtleScsXHJcbiAgICAgIHBhcnNlcjogLyg/Ol58JikoW14mPV0qKT0/KFteJl0qKS9nXHJcbiAgICB9LFxyXG4gICAgcGFyc2VyOiB7XHJcbiAgICAgIHN0cmljdDogL14oPzooW146XFwvPyNdKyk6KT8oPzpcXC9cXC8oKD86KChbXjpAXSopKD86OihbXjpAXSopKT8pP0ApPyhbXjpcXC8/I10qKSg/OjooXFxkKikpPykpPygoKCg/OltePyNcXC9dKlxcLykqKShbXj8jXSopKSg/OlxcPyhbXiNdKikpPyg/OiMoLiopKT8pLyxcclxuICAgICAgbG9vc2U6ICAvXig/Oig/IVteOkBdKzpbXjpAXFwvXSpAKShbXjpcXC8/Iy5dKyk6KT8oPzpcXC9cXC8pPygoPzooKFteOkBdKikoPzo6KFteOkBdKikpPyk/QCk/KFteOlxcLz8jXSopKD86OihcXGQqKSk/KSgoKFxcLyg/OltePyNdKD8hW14/I1xcL10qXFwuW14/I1xcLy5dKyg/Ols/I118JCkpKSpcXC8/KT8oW14/I1xcL10qKSkoPzpcXD8oW14jXSopKT8oPzojKC4qKSk/KS9cclxuICAgIH1cclxuICB9LFxyXG5cclxuICBnZXRQYXJhbTogZnVuY3Rpb24oY3VzdG9tX3BhcmFtcykge1xyXG4gICAgdmFyIHF1ZXJ5X3N0cmluZyA9IHt9LFxyXG4gICAgICAgIHF1ZXJ5ID0gY3VzdG9tX3BhcmFtcyA/IGN1c3RvbV9wYXJhbXMgOiB3aW5kb3cubG9jYXRpb24uc2VhcmNoLnN1YnN0cmluZygxKSxcclxuICAgICAgICB2YXJzID0gcXVlcnkuc3BsaXQoJyYnKTtcclxuXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHZhcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgdmFyIHBhaXIgPSB2YXJzW2ldLnNwbGl0KCc9Jyk7XHJcbiAgICAgIGlmICh0eXBlb2YgcXVlcnlfc3RyaW5nW3BhaXJbMF1dID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgIHF1ZXJ5X3N0cmluZ1twYWlyWzBdXSA9IHBhaXJbMV07XHJcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHF1ZXJ5X3N0cmluZ1twYWlyWzBdXSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICB2YXIgYXJyID0gWyBxdWVyeV9zdHJpbmdbcGFpclswXV0sIHBhaXJbMV0gXTtcclxuICAgICAgICBxdWVyeV9zdHJpbmdbcGFpclswXV0gPSBhcnI7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcXVlcnlfc3RyaW5nW3BhaXJbMF1dLnB1c2gocGFpclsxXSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBxdWVyeV9zdHJpbmc7XHJcbiAgfSxcclxuXHJcbiAgZ2V0SG9zdDogZnVuY3Rpb24ocmVxdWVzdCkge1xyXG4gICAgcmV0dXJuIHRoaXMucGFyc2UocmVxdWVzdCkuaG9zdC5yZXBsYWNlKCd3d3cuJywgJycpO1xyXG4gIH1cclxuXHJcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuXHJcbiAgZXNjYXBlUmVnZXhwOiBmdW5jdGlvbihzdHJpbmcpIHtcclxuICAgIHJldHVybiBzdHJpbmcucmVwbGFjZSgvW1xcLVxcW1xcXVxcL1xce1xcfVxcKFxcKVxcKlxcK1xcP1xcLlxcXFxcXF5cXCRcXHxdL2csIFwiXFxcXCQmXCIpO1xyXG4gIH0sXHJcblxyXG4gIHNldERhdGU6IGZ1bmN0aW9uKGRhdGUsIG9mZnNldCkge1xyXG4gICAgdmFyIHV0Y19vZmZzZXQgICAgPSBkYXRlLmdldFRpbWV6b25lT2Zmc2V0KCkgLyA2MCxcclxuICAgICAgICBub3dfaG91cnMgICAgID0gZGF0ZS5nZXRIb3VycygpLFxyXG4gICAgICAgIGN1c3RvbV9vZmZzZXQgPSBvZmZzZXQgfHwgb2Zmc2V0ID09PSAwID8gb2Zmc2V0IDogLXV0Y19vZmZzZXQ7XHJcblxyXG4gICAgZGF0ZS5zZXRIb3Vycyhub3dfaG91cnMgKyB1dGNfb2Zmc2V0ICsgY3VzdG9tX29mZnNldCk7XHJcblxyXG4gICAgdmFyIHllYXIgICAgPSBkYXRlLmdldEZ1bGxZZWFyKCksXHJcbiAgICAgICAgbW9udGggICA9IHRoaXMuc2V0TGVhZGluZ1plcm9Ub0ludChkYXRlLmdldE1vbnRoKCkgKyAxLCAgIDIpLFxyXG4gICAgICAgIGRheSAgICAgPSB0aGlzLnNldExlYWRpbmdaZXJvVG9JbnQoZGF0ZS5nZXREYXRlKCksICAgICAgICAyKSxcclxuICAgICAgICBob3VyICAgID0gdGhpcy5zZXRMZWFkaW5nWmVyb1RvSW50KGRhdGUuZ2V0SG91cnMoKSwgICAgICAgMiksXHJcbiAgICAgICAgbWludXRlICA9IHRoaXMuc2V0TGVhZGluZ1plcm9Ub0ludChkYXRlLmdldE1pbnV0ZXMoKSwgICAgIDIpLFxyXG4gICAgICAgIHNlY29uZCAgPSB0aGlzLnNldExlYWRpbmdaZXJvVG9JbnQoZGF0ZS5nZXRTZWNvbmRzKCksICAgICAyKTtcclxuXHJcbiAgICByZXR1cm4gKHllYXIgKyAnLScgKyBtb250aCArICctJyArIGRheSArICcgJyArIGhvdXIgKyAnOicgKyBtaW51dGUgKyAnOicgKyBzZWNvbmQpO1xyXG4gIH0sXHJcblxyXG4gIHNldExlYWRpbmdaZXJvVG9JbnQ6IGZ1bmN0aW9uKG51bSwgc2l6ZSkge1xyXG4gICAgdmFyIHMgPSBudW0gKyAnJztcclxuICAgIHdoaWxlIChzLmxlbmd0aCA8IHNpemUpIHsgcyA9ICcwJyArIHM7IH1cclxuICAgIHJldHVybiBzO1xyXG4gIH0sXHJcblxyXG4gIHJhbmRvbUludDogZnVuY3Rpb24obWluLCBtYXgpIHtcclxuICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkpICsgbWluO1xyXG4gIH1cclxuXHJcbn07XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIGRhdGEgICAgICAgID0gcmVxdWlyZSgnLi9kYXRhJyksXHJcbiAgICB0ZXJtcyAgICAgICA9IHJlcXVpcmUoJy4vdGVybXMnKSxcclxuICAgIGNvb2tpZXMgICAgID0gcmVxdWlyZSgnLi9oZWxwZXJzL2Nvb2tpZXMnKSxcclxuICAgIHVyaSAgICAgICAgID0gcmVxdWlyZSgnLi9oZWxwZXJzL3VyaScpLFxyXG4gICAgdXRpbHMgICAgICAgPSByZXF1aXJlKCcuL2hlbHBlcnMvdXRpbHMnKSxcclxuICAgIHBhcmFtcyAgICAgID0gcmVxdWlyZSgnLi9wYXJhbXMnKSxcclxuICAgIG1pZ3JhdGlvbnMgID0gcmVxdWlyZSgnLi9taWdyYXRpb25zJyk7XHJcblxyXG52YXIgYmxhY2tsaXN0ID0gWydwYXJ0bmVyJywgJ29mZmljZScsICdhZ2VudCddO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihwcmVmcykge1xyXG5cclxuICB2YXIgcCAgICAgICAgID0gcGFyYW1zLmZldGNoKHByZWZzKTtcclxuICB2YXIgZ2V0X3BhcmFtID0gdXJpLmdldFBhcmFtKCk7XHJcbiAgdmFyIGRvbWFpbiAgICA9IHAuZG9tYWluLmhvc3QsXHJcbiAgICAgIGlzb2xhdGUgICA9IHAuZG9tYWluLmlzb2xhdGUsXHJcbiAgICAgIGxpZmV0aW1lICA9IHAubGlmZXRpbWU7XHJcblxyXG4gIG1pZ3JhdGlvbnMuZ28obGlmZXRpbWUsIGRvbWFpbiwgaXNvbGF0ZSk7XHJcblxyXG4gIHZhciBfX3NianNfdHlwZSxcclxuICAgICAgX19zYmpzX3NvdXJjZSxcclxuICAgICAgX19zYmpzX21lZGl1bSxcclxuICAgICAgX19zYmpzX2NhbXBhaWduLFxyXG4gICAgICBfX3NianNfY29udGVudCxcclxuICAgICAgX19zYmpzX3Rlcm07XHJcblxyXG4gIGZ1bmN0aW9uIG1haW5EYXRhKCkge1xyXG4gICAgdmFyIHNianNfZGF0YTtcclxuICAgIGlmIChcclxuICAgICAgICB0eXBlb2YgZ2V0X3BhcmFtLnV0bV9zb3VyY2UgICAgICAgICE9PSAndW5kZWZpbmVkJyB8fFxyXG4gICAgICAgIHR5cGVvZiBnZXRfcGFyYW0udXRtX21lZGl1bSAgICAgICAgIT09ICd1bmRlZmluZWQnIHx8XHJcbiAgICAgICAgdHlwZW9mIGdldF9wYXJhbS51dG1fY2FtcGFpZ24gICAgICAhPT0gJ3VuZGVmaW5lZCcgfHxcclxuICAgICAgICB0eXBlb2YgZ2V0X3BhcmFtLnV0bV9jb250ZW50ICAgICAgICE9PSAndW5kZWZpbmVkJyB8fFxyXG4gICAgICAgIHR5cGVvZiBnZXRfcGFyYW0udXRtX3Rlcm0gICAgICAgICAgIT09ICd1bmRlZmluZWQnIHx8XHJcbiAgICAgICAgdHlwZW9mIGdldF9wYXJhbS5nY2xpZCAgICAgICAgICAgICAhPT0gJ3VuZGVmaW5lZCcgfHxcclxuICAgICAgICB0eXBlb2YgZ2V0X3BhcmFtLnljbGlkICAgICAgICAgICAgICE9PSAndW5kZWZpbmVkJyB8fFxyXG4gICAgICAgIHR5cGVvZiBnZXRfcGFyYW1bcC5jYW1wYWlnbl9wYXJhbV0gIT09ICd1bmRlZmluZWQnIHx8XHJcbiAgICAgICAgdHlwZW9mIGdldF9wYXJhbVtwLnRlcm1fcGFyYW1dICAgICAhPT0gJ3VuZGVmaW5lZCcgfHxcclxuICAgICAgICB0eXBlb2YgZ2V0X3BhcmFtW3AuY29udGVudF9wYXJhbV0gICE9PSAndW5kZWZpbmVkJ1xyXG4gICAgKSB7XHJcbiAgICAgIHNldEZpcnN0QW5kQ3VycmVudEV4dHJhRGF0YSgpO1xyXG4gICAgICBzYmpzX2RhdGEgPSBnZXREYXRhKHRlcm1zLnRyYWZmaWMudXRtKTtcclxuICAgIH0gZWxzZSBpZiAoY2hlY2tSZWZlcmVyKHRlcm1zLnRyYWZmaWMub3JnYW5pYykpIHtcclxuICAgICAgc2V0Rmlyc3RBbmRDdXJyZW50RXh0cmFEYXRhKCk7XHJcbiAgICAgIHNianNfZGF0YSA9IGdldERhdGEodGVybXMudHJhZmZpYy5vcmdhbmljKTtcclxuICAgIH0gZWxzZSBpZiAoIWNvb2tpZXMuZ2V0KGRhdGEuY29udGFpbmVycy5zZXNzaW9uKSAmJiBjaGVja1JlZmVyZXIodGVybXMudHJhZmZpYy5yZWZlcnJhbCkpIHtcclxuICAgICAgc2V0Rmlyc3RBbmRDdXJyZW50RXh0cmFEYXRhKCk7XHJcbiAgICAgIHNianNfZGF0YSA9IGdldERhdGEodGVybXMudHJhZmZpYy5yZWZlcnJhbCk7XHJcbiAgICB9IGVsc2UgaWYgKCFjb29raWVzLmdldChkYXRhLmNvbnRhaW5lcnMuZmlyc3QpICYmICFjb29raWVzLmdldChkYXRhLmNvbnRhaW5lcnMuY3VycmVudCkpIHtcclxuICAgICAgc2V0Rmlyc3RBbmRDdXJyZW50RXh0cmFEYXRhKCk7XHJcbiAgICAgIHNianNfZGF0YSA9IGdldERhdGEodGVybXMudHJhZmZpYy50eXBlaW4pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIGNvb2tpZXMuZ2V0KGRhdGEuY29udGFpbmVycy5jdXJyZW50KTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gc2Jqc19kYXRhO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZ2V0RGF0YSh0eXBlKSB7XHJcblxyXG4gICAgc3dpdGNoICh0eXBlKSB7XHJcblxyXG4gICAgICBjYXNlIHRlcm1zLnRyYWZmaWMudXRtOlxyXG5cclxuICAgICAgICBfX3NianNfdHlwZSA9IHRlcm1zLnRyYWZmaWMudXRtO1xyXG5cclxuICAgICAgICBpZiAodHlwZW9mIGdldF9wYXJhbS51dG1fc291cmNlICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgX19zYmpzX3NvdXJjZSA9IGdldF9wYXJhbS51dG1fc291cmNlO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGdldF9wYXJhbS5nY2xpZCAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgIF9fc2Jqc19zb3VyY2UgPSAnZ29vZ2xlJztcclxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBnZXRfcGFyYW0ueWNsaWQgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICBfX3NianNfc291cmNlID0gJ3lhbmRleCc7ICBcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgX19zYmpzX3NvdXJjZSA9IHRlcm1zLm5vbmU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodHlwZW9mIGdldF9wYXJhbS51dG1fbWVkaXVtICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgX19zYmpzX21lZGl1bSA9IGdldF9wYXJhbS51dG1fbWVkaXVtO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGdldF9wYXJhbS5nY2xpZCAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgIF9fc2Jqc19tZWRpdW0gPSAnY3BjJztcclxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBnZXRfcGFyYW0ueWNsaWQgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICBfX3NianNfbWVkaXVtID0gJ2NwYyc7ICBcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgX19zYmpzX21lZGl1bSA9IHRlcm1zLm5vbmU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodHlwZW9mIGdldF9wYXJhbS51dG1fY2FtcGFpZ24gIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICBfX3NianNfY2FtcGFpZ24gPSBnZXRfcGFyYW0udXRtX2NhbXBhaWduO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGdldF9wYXJhbVtwLmNhbXBhaWduX3BhcmFtXSAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgIF9fc2Jqc19jYW1wYWlnbiA9IGdldF9wYXJhbVtwLmNhbXBhaWduX3BhcmFtXTtcclxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBnZXRfcGFyYW0uZ2NsaWQgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICBfX3NianNfY2FtcGFpZ24gPSAnZ29vZ2xlX2NwYyc7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgZ2V0X3BhcmFtLnljbGlkICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgX19zYmpzX2NhbXBhaWduID0gJ3lhbmRleF9jcGMnOyAgXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIF9fc2Jqc19jYW1wYWlnbiA9IHRlcm1zLm5vbmU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodHlwZW9mIGdldF9wYXJhbS51dG1fY29udGVudCAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgIF9fc2Jqc19jb250ZW50ID0gZ2V0X3BhcmFtLnV0bV9jb250ZW50O1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGdldF9wYXJhbVtwLmNvbnRlbnRfcGFyYW1dICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgX19zYmpzX2NvbnRlbnQgPSBnZXRfcGFyYW1bcC5jb250ZW50X3BhcmFtXTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgX19zYmpzX2NvbnRlbnQgPSB0ZXJtcy5ub25lO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHR5cGVvZiBnZXRfcGFyYW0udXRtX3Rlcm0gIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICBfX3NianNfdGVybSA9IGdldF9wYXJhbS51dG1fdGVybTtcclxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBnZXRfcGFyYW1bcC50ZXJtX3BhcmFtXSAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgIF9fc2Jqc190ZXJtID0gZ2V0X3BhcmFtW3AudGVybV9wYXJhbV07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIF9fc2Jqc190ZXJtID0gZ2V0VXRtVGVybSgpIHx8IHRlcm1zLm5vbmU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIGNhc2UgdGVybXMudHJhZmZpYy5vcmdhbmljOlxyXG4gICAgICAgIF9fc2Jqc190eXBlICAgICA9IHRlcm1zLnRyYWZmaWMub3JnYW5pYztcclxuICAgICAgICBfX3NianNfc291cmNlICAgPSBfX3NianNfc291cmNlIHx8IHVyaS5nZXRIb3N0KGRvY3VtZW50LnJlZmVycmVyKTtcclxuICAgICAgICBfX3NianNfbWVkaXVtICAgPSB0ZXJtcy5yZWZlcmVyLm9yZ2FuaWM7XHJcbiAgICAgICAgX19zYmpzX2NhbXBhaWduID0gdGVybXMubm9uZTtcclxuICAgICAgICBfX3NianNfY29udGVudCAgPSB0ZXJtcy5ub25lO1xyXG4gICAgICAgIF9fc2Jqc190ZXJtICAgICA9IHRlcm1zLm5vbmU7XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICBjYXNlIHRlcm1zLnRyYWZmaWMucmVmZXJyYWw6XHJcbiAgICAgICAgX19zYmpzX3R5cGUgICAgID0gdGVybXMudHJhZmZpYy5yZWZlcnJhbDtcclxuICAgICAgICBfX3NianNfc291cmNlICAgPSBfX3NianNfc291cmNlIHx8IHVyaS5nZXRIb3N0KGRvY3VtZW50LnJlZmVycmVyKTtcclxuICAgICAgICBfX3NianNfbWVkaXVtICAgPSBfX3NianNfbWVkaXVtIHx8IHRlcm1zLnJlZmVyZXIucmVmZXJyYWw7XHJcbiAgICAgICAgX19zYmpzX2NhbXBhaWduID0gdGVybXMubm9uZTtcclxuICAgICAgICBfX3NianNfY29udGVudCAgPSB1cmkucGFyc2UoZG9jdW1lbnQucmVmZXJyZXIpLnBhdGg7XHJcbiAgICAgICAgX19zYmpzX3Rlcm0gICAgID0gdGVybXMubm9uZTtcclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIGNhc2UgdGVybXMudHJhZmZpYy50eXBlaW46XHJcbiAgICAgICAgX19zYmpzX3R5cGUgICAgID0gdGVybXMudHJhZmZpYy50eXBlaW47XHJcbiAgICAgICAgX19zYmpzX3NvdXJjZSAgID0gcC50eXBlaW5fYXR0cmlidXRlcy5zb3VyY2U7XHJcbiAgICAgICAgX19zYmpzX21lZGl1bSAgID0gcC50eXBlaW5fYXR0cmlidXRlcy5tZWRpdW07XHJcbiAgICAgICAgX19zYmpzX2NhbXBhaWduID0gdGVybXMubm9uZTtcclxuICAgICAgICBfX3NianNfY29udGVudCAgPSB0ZXJtcy5ub25lO1xyXG4gICAgICAgIF9fc2Jqc190ZXJtICAgICA9IHRlcm1zLm5vbmU7XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICAgIF9fc2Jqc190eXBlICAgICA9IHRlcm1zLm9vcHM7XHJcbiAgICAgICAgX19zYmpzX3NvdXJjZSAgID0gdGVybXMub29wcztcclxuICAgICAgICBfX3NianNfbWVkaXVtICAgPSB0ZXJtcy5vb3BzO1xyXG4gICAgICAgIF9fc2Jqc19jYW1wYWlnbiA9IHRlcm1zLm9vcHM7XHJcbiAgICAgICAgX19zYmpzX2NvbnRlbnQgID0gdGVybXMub29wcztcclxuICAgICAgICBfX3NianNfdGVybSAgICAgPSB0ZXJtcy5vb3BzO1xyXG4gICAgfVxyXG4gICAgdmFyIHNianNfZGF0YSA9IHtcclxuICAgICAgdHlwZTogICAgICAgICAgICAgX19zYmpzX3R5cGUsXHJcbiAgICAgIHNvdXJjZTogICAgICAgICAgIF9fc2Jqc19zb3VyY2UsXHJcbiAgICAgIG1lZGl1bTogICAgICAgICAgIF9fc2Jqc19tZWRpdW0sXHJcbiAgICAgIGNhbXBhaWduOiAgICAgICAgIF9fc2Jqc19jYW1wYWlnbixcclxuICAgICAgY29udGVudDogICAgICAgICAgX19zYmpzX2NvbnRlbnQsXHJcbiAgICAgIHRlcm06ICAgICAgICAgICAgIF9fc2Jqc190ZXJtXHJcbiAgICB9O1xyXG5cclxuICAgIHJldHVybiBkYXRhLnBhY2subWFpbihzYmpzX2RhdGEpO1xyXG5cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGdldFV0bVRlcm0oKSB7XHJcbiAgICB2YXIgcmVmZXJlciA9IGRvY3VtZW50LnJlZmVycmVyO1xyXG4gICAgaWYgKGdldF9wYXJhbS51dG1fdGVybSkge1xyXG4gICAgICByZXR1cm4gZ2V0X3BhcmFtLnV0bV90ZXJtO1xyXG4gICAgfSBlbHNlIGlmIChyZWZlcmVyICYmIHVyaS5wYXJzZShyZWZlcmVyKS5ob3N0ICYmIHVyaS5wYXJzZShyZWZlcmVyKS5ob3N0Lm1hdGNoKC9eKD86LipcXC4pP3lhbmRleFxcLi57Miw5fSQvaSkpIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICByZXR1cm4gdXJpLmdldFBhcmFtKHVyaS5wYXJzZShkb2N1bWVudC5yZWZlcnJlcikucXVlcnkpLnRleHQ7XHJcbiAgICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY2hlY2tSZWZlcmVyKHR5cGUpIHtcclxuICAgIHZhciByZWZlcmVyID0gZG9jdW1lbnQucmVmZXJyZXI7XHJcbiAgICBzd2l0Y2godHlwZSkge1xyXG4gICAgICBjYXNlIHRlcm1zLnRyYWZmaWMub3JnYW5pYzpcclxuICAgICAgICByZXR1cm4gKCEhcmVmZXJlciAmJiBjaGVja1JlZmVyZXJIb3N0KHJlZmVyZXIpICYmIGlzT3JnYW5pYyhyZWZlcmVyKSk7XHJcbiAgICAgIGNhc2UgdGVybXMudHJhZmZpYy5yZWZlcnJhbDpcclxuICAgICAgICByZXR1cm4gKCEhcmVmZXJlciAmJiBjaGVja1JlZmVyZXJIb3N0KHJlZmVyZXIpICYmIGlzUmVmZXJyYWwocmVmZXJlcikpO1xyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNoZWNrUmVmZXJlckhvc3QocmVmZXJlcikge1xyXG4gICAgaWYgKHAuZG9tYWluKSB7XHJcbiAgICAgIGlmICghaXNvbGF0ZSkge1xyXG4gICAgICAgIHZhciBob3N0X3JlZ2V4ID0gbmV3IFJlZ0V4cCgnXig/Oi4qXFxcXC4pPycgKyB1dGlscy5lc2NhcGVSZWdleHAoZG9tYWluKSArICckJywgJ2knKTtcclxuICAgICAgICByZXR1cm4gISh1cmkuZ2V0SG9zdChyZWZlcmVyKS5tYXRjaChob3N0X3JlZ2V4KSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuICh1cmkuZ2V0SG9zdChyZWZlcmVyKSAhPT0gdXJpLmdldEhvc3QoZG9tYWluKSk7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiAodXJpLmdldEhvc3QocmVmZXJlcikgIT09IHVyaS5nZXRIb3N0KGRvY3VtZW50LmxvY2F0aW9uLmhyZWYpKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGlzT3JnYW5pYyhyZWZlcmVyKSB7XHJcblxyXG4gICAgdmFyIHlfaG9zdCAgPSAneWFuZGV4JyxcclxuICAgICAgICB5X3BhcmFtID0gJ3RleHQnLFxyXG4gICAgICAgIGdfaG9zdCAgPSAnZ29vZ2xlJztcclxuXHJcbiAgICB2YXIgeV9ob3N0X3JlZ2V4ICA9IG5ldyBSZWdFeHAoJ14oPzouKlxcXFwuKT8nICArIHV0aWxzLmVzY2FwZVJlZ2V4cCh5X2hvc3QpICArICdcXFxcLi57Miw5fSQnKSxcclxuICAgICAgICB5X3BhcmFtX3JlZ2V4ID0gbmV3IFJlZ0V4cCgnLionICAgICAgICAgICArIHV0aWxzLmVzY2FwZVJlZ2V4cCh5X3BhcmFtKSArICc9LionKSxcclxuICAgICAgICBnX2hvc3RfcmVnZXggID0gbmV3IFJlZ0V4cCgnXig/Ond3d1xcXFwuKT8nICsgdXRpbHMuZXNjYXBlUmVnZXhwKGdfaG9zdCkgICsgJ1xcXFwuLnsyLDl9JCcpO1xyXG5cclxuICAgIGlmIChcclxuICAgICAgICAhIXVyaS5wYXJzZShyZWZlcmVyKS5xdWVyeSAmJlxyXG4gICAgICAgICEhdXJpLnBhcnNlKHJlZmVyZXIpLmhvc3QubWF0Y2goeV9ob3N0X3JlZ2V4KSAmJlxyXG4gICAgICAgICEhdXJpLnBhcnNlKHJlZmVyZXIpLnF1ZXJ5Lm1hdGNoKHlfcGFyYW1fcmVnZXgpXHJcbiAgICAgICkge1xyXG4gICAgICBfX3NianNfc291cmNlID0geV9ob3N0O1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH0gZWxzZSBpZiAoISF1cmkucGFyc2UocmVmZXJlcikuaG9zdC5tYXRjaChnX2hvc3RfcmVnZXgpKSB7XHJcbiAgICAgIF9fc2Jqc19zb3VyY2UgPSBnX2hvc3Q7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSBlbHNlIGlmICghIXVyaS5wYXJzZShyZWZlcmVyKS5xdWVyeSkge1xyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHAub3JnYW5pY3MubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgIHVyaS5wYXJzZShyZWZlcmVyKS5ob3N0Lm1hdGNoKG5ldyBSZWdFeHAoJ14oPzouKlxcXFwuKT8nICsgdXRpbHMuZXNjYXBlUmVnZXhwKHAub3JnYW5pY3NbaV0uaG9zdCkgICsgJyQnLCAnaScpKSAmJlxyXG4gICAgICAgICAgICB1cmkucGFyc2UocmVmZXJlcikucXVlcnkubWF0Y2gobmV3IFJlZ0V4cCgnLionICAgICAgICAgKyB1dGlscy5lc2NhcGVSZWdleHAocC5vcmdhbmljc1tpXS5wYXJhbSkgKyAnPS4qJywgJ2knKSlcclxuICAgICAgICAgICkge1xyXG4gICAgICAgICAgX19zYmpzX3NvdXJjZSA9IHAub3JnYW5pY3NbaV0uZGlzcGxheSB8fCBwLm9yZ2FuaWNzW2ldLmhvc3Q7XHJcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGkgKyAxID09PSBwLm9yZ2FuaWNzLmxlbmd0aCkge1xyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gaXNSZWZlcnJhbChyZWZlcmVyKSB7XHJcbiAgICBpZiAocC5yZWZlcnJhbHMubGVuZ3RoID4gMCkge1xyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHAucmVmZXJyYWxzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgaWYgKHVyaS5wYXJzZShyZWZlcmVyKS5ob3N0Lm1hdGNoKG5ldyBSZWdFeHAoJ14oPzouKlxcXFwuKT8nICsgdXRpbHMuZXNjYXBlUmVnZXhwKHAucmVmZXJyYWxzW2ldLmhvc3QpICsgJyQnLCAnaScpKSkge1xyXG4gICAgICAgICAgX19zYmpzX3NvdXJjZSA9IHAucmVmZXJyYWxzW2ldLmRpc3BsYXkgIHx8IHAucmVmZXJyYWxzW2ldLmhvc3Q7XHJcbiAgICAgICAgICBfX3NianNfbWVkaXVtID0gcC5yZWZlcnJhbHNbaV0ubWVkaXVtICAgfHwgdGVybXMucmVmZXJlci5yZWZlcnJhbDtcclxuICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaSArIDEgPT09IHAucmVmZXJyYWxzLmxlbmd0aCkge1xyXG4gICAgICAgICAgX19zYmpzX3NvdXJjZSA9IHVyaS5nZXRIb3N0KHJlZmVyZXIpO1xyXG4gICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBfX3NianNfc291cmNlID0gdXJpLmdldEhvc3QocmVmZXJlcik7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gc2V0Rmlyc3RBbmRDdXJyZW50RXh0cmFEYXRhKCkge1xyXG4gICAgY29va2llcy5zZXQoZGF0YS5jb250YWluZXJzLmN1cnJlbnRfZXh0cmEsIGRhdGEucGFjay5leHRyYShwLnRpbWV6b25lX29mZnNldCksIGxpZmV0aW1lLCBkb21haW4sIGlzb2xhdGUpO1xyXG4gICAgaWYgKCFjb29raWVzLmdldChkYXRhLmNvbnRhaW5lcnMuZmlyc3RfZXh0cmEpKSB7XHJcbiAgICAgIGNvb2tpZXMuc2V0KGRhdGEuY29udGFpbmVycy5maXJzdF9leHRyYSwgZGF0YS5wYWNrLmV4dHJhKHAudGltZXpvbmVfb2Zmc2V0KSwgbGlmZXRpbWUsIGRvbWFpbiwgaXNvbGF0ZSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAoZnVuY3Rpb24gc2V0RGF0YSgpIHtcclxuXHJcbiAgICBpZiAoZ2V0X3BhcmFtLmxkZyAmJiBibGFja2xpc3QuaW5jbHVkZXMoZ2V0X3BhcmFtLmxkZykpIHtcclxuICAgICAgLy8gZGVzdHJveSBzb3VyY2VidXN0ZXIgY29va2llcyBvbiBibGFja2xpc3RcclxuICAgICAgT2JqZWN0LnZhbHVlcyhkYXRhLmNvbnRhaW5lcnMpLm1hcChmdW5jdGlvbihjb29raWUpIHtcclxuICAgICAgICBjb29raWVzLmRlc3Ryb3koY29va2llLCBkb21haW4sIGlzb2xhdGUpO1xyXG4gICAgICB9KTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgLy8gTWFpbiBkYXRhXHJcbiAgICBjb29raWVzLnNldChkYXRhLmNvbnRhaW5lcnMuY3VycmVudCwgbWFpbkRhdGEoKSwgbGlmZXRpbWUsIGRvbWFpbiwgaXNvbGF0ZSk7XHJcbiAgICBpZiAoIWNvb2tpZXMuZ2V0KGRhdGEuY29udGFpbmVycy5maXJzdCkpIHtcclxuICAgICAgY29va2llcy5zZXQoZGF0YS5jb250YWluZXJzLmZpcnN0LCBjb29raWVzLmdldChkYXRhLmNvbnRhaW5lcnMuY3VycmVudCksIGxpZmV0aW1lLCBkb21haW4sIGlzb2xhdGUpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFVzZXIgZGF0YVxyXG4gICAgdmFyIHZpc2l0cywgdWRhdGE7XHJcbiAgICBpZiAoIWNvb2tpZXMuZ2V0KGRhdGEuY29udGFpbmVycy51ZGF0YSkpIHtcclxuICAgICAgdmlzaXRzICA9IDE7XHJcbiAgICAgIHVkYXRhICAgPSBkYXRhLnBhY2sudXNlcih2aXNpdHMsIHAudXNlcl9pcCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB2aXNpdHMgID0gcGFyc2VJbnQoY29va2llcy5wYXJzZShkYXRhLmNvbnRhaW5lcnMudWRhdGEpW2Nvb2tpZXMudW5zYmpzKGRhdGEuY29udGFpbmVycy51ZGF0YSldW2RhdGEuYWxpYXNlcy51ZGF0YS52aXNpdHNdKSB8fCAxO1xyXG4gICAgICB2aXNpdHMgID0gY29va2llcy5nZXQoZGF0YS5jb250YWluZXJzLnNlc3Npb24pID8gdmlzaXRzIDogdmlzaXRzICsgMTtcclxuICAgICAgdWRhdGEgICA9IGRhdGEucGFjay51c2VyKHZpc2l0cywgcC51c2VyX2lwKTtcclxuICAgIH1cclxuICAgIGNvb2tpZXMuc2V0KGRhdGEuY29udGFpbmVycy51ZGF0YSwgdWRhdGEsIGxpZmV0aW1lLCBkb21haW4sIGlzb2xhdGUpO1xyXG5cclxuICAgIC8vIFNlc3Npb25cclxuICAgIHZhciBwYWdlc19jb3VudDtcclxuICAgIGlmICghY29va2llcy5nZXQoZGF0YS5jb250YWluZXJzLnNlc3Npb24pKSB7XHJcbiAgICAgIHBhZ2VzX2NvdW50ID0gMTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHBhZ2VzX2NvdW50ID0gcGFyc2VJbnQoY29va2llcy5wYXJzZShkYXRhLmNvbnRhaW5lcnMuc2Vzc2lvbilbY29va2llcy51bnNianMoZGF0YS5jb250YWluZXJzLnNlc3Npb24pXVtkYXRhLmFsaWFzZXMuc2Vzc2lvbi5wYWdlc19zZWVuXSkgfHwgMTtcclxuICAgICAgcGFnZXNfY291bnQgKz0gMTtcclxuICAgIH1cclxuICAgIGNvb2tpZXMuc2V0KGRhdGEuY29udGFpbmVycy5zZXNzaW9uLCBkYXRhLnBhY2suc2Vzc2lvbihwYWdlc19jb3VudCksIHAuc2Vzc2lvbl9sZW5ndGgsIGRvbWFpbiwgaXNvbGF0ZSk7XHJcblxyXG4gICAgLy8gUHJvbW9jb2RlXHJcbiAgICBpZiAocC5wcm9tb2NvZGUgJiYgIWNvb2tpZXMuZ2V0KGRhdGEuY29udGFpbmVycy5wcm9tb2NvZGUpKSB7XHJcbiAgICAgIGNvb2tpZXMuc2V0KGRhdGEuY29udGFpbmVycy5wcm9tb2NvZGUsIGRhdGEucGFjay5wcm9tbyhwLnByb21vY29kZSksIGxpZmV0aW1lLCBkb21haW4sIGlzb2xhdGUpO1xyXG4gICAgfVxyXG5cclxuICB9KSgpO1xyXG5cclxuICByZXR1cm4gY29va2llcy5wYXJzZShkYXRhLmNvbnRhaW5lcnMpO1xyXG5cclxufTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBkYXRhICAgID0gcmVxdWlyZSgnLi9kYXRhJyksXHJcbiAgICBjb29raWVzID0gcmVxdWlyZSgnLi9oZWxwZXJzL2Nvb2tpZXMnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG5cclxuICBnbzogZnVuY3Rpb24obGlmZXRpbWUsIGRvbWFpbiwgaXNvbGF0ZSkge1xyXG5cclxuICAgIHZhciBtaWdyYXRlID0gdGhpcy5taWdyYXRpb25zLFxyXG4gICAgICAgIF93aXRoICAgPSB7IGw6IGxpZmV0aW1lLCBkOiBkb21haW4sIGk6IGlzb2xhdGUgfTtcclxuXHJcbiAgICB2YXIgaTtcclxuXHJcbiAgICBpZiAoIWNvb2tpZXMuZ2V0KGRhdGEuY29udGFpbmVycy5maXJzdCkgJiYgIWNvb2tpZXMuZ2V0KGRhdGEuc2VydmljZS5taWdyYXRpb25zKSkge1xyXG5cclxuICAgICAgdmFyIG1pZHMgPSBbXTtcclxuICAgICAgZm9yIChpID0gMDsgaSA8IG1pZ3JhdGUubGVuZ3RoOyBpKyspIHsgbWlkcy5wdXNoKG1pZ3JhdGVbaV0uaWQpOyB9XHJcblxyXG4gICAgICB2YXIgYWR2YW5jZSA9ICcnO1xyXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgbWlkcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGFkdmFuY2UgKz0gbWlkc1tpXSArICc9MSc7XHJcbiAgICAgICAgaWYgKGkgPCBtaWRzLmxlbmd0aCAtIDEpIHsgYWR2YW5jZSArPSBkYXRhLmRlbGltaXRlcjsgfVxyXG4gICAgICB9XHJcbiAgICAgIGNvb2tpZXMuc2V0KGRhdGEuc2VydmljZS5taWdyYXRpb25zLCBhZHZhbmNlLCBfd2l0aC5sLCBfd2l0aC5kLCBfd2l0aC5pKTtcclxuXHJcbiAgICB9IGVsc2UgaWYgKCFjb29raWVzLmdldChkYXRhLnNlcnZpY2UubWlncmF0aW9ucykpIHtcclxuXHJcbiAgICAgIC8vIFdlIGhhdmUgb25seSBvbmUgbWlncmF0aW9uIGZvciBub3csIHNvIGp1c3RcclxuICAgICAgZm9yIChpID0gMDsgaSA8IG1pZ3JhdGUubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBtaWdyYXRlW2ldLmdvKG1pZ3JhdGVbaV0uaWQsIF93aXRoKTtcclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgfSxcclxuXHJcbiAgbWlncmF0aW9uczogW1xyXG5cclxuICAgIHtcclxuICAgICAgaWQ6ICcxNDE4NDc0Mzc1OTk4JyxcclxuICAgICAgdmVyc2lvbjogJzEuMC4wLWJldGEnLFxyXG4gICAgICBnbzogZnVuY3Rpb24obWlkLCBfd2l0aCkge1xyXG5cclxuICAgICAgICB2YXIgc3VjY2VzcyA9IG1pZCArICc9MScsXHJcbiAgICAgICAgICAgIGZhaWwgICAgPSBtaWQgKyAnPTAnO1xyXG5cclxuICAgICAgICB2YXIgc2FmZVJlcGxhY2UgPSBmdW5jdGlvbigkMCwgJDEsICQyKSB7XHJcbiAgICAgICAgICByZXR1cm4gKCQxIHx8ICQyID8gJDAgOiBkYXRhLmRlbGltaXRlcik7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdHJ5IHtcclxuXHJcbiAgICAgICAgICAvLyBTd2l0Y2ggZGVsaW1pdGVyIGFuZCByZW5ldyBjb29raWVzXHJcbiAgICAgICAgICB2YXIgX2luID0gW107XHJcbiAgICAgICAgICBmb3IgKHZhciBwcm9wIGluIGRhdGEuY29udGFpbmVycykge1xyXG4gICAgICAgICAgICBpZiAoZGF0YS5jb250YWluZXJzLmhhc093blByb3BlcnR5KHByb3ApKSB7XHJcbiAgICAgICAgICAgICAgX2luLnB1c2goZGF0YS5jb250YWluZXJzW3Byb3BdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgX2luLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChjb29raWVzLmdldChfaW5baV0pKSB7XHJcbiAgICAgICAgICAgICAgdmFyIGJ1ZmZlciA9IGNvb2tpZXMuZ2V0KF9pbltpXSkucmVwbGFjZSgvKFxcfCk/XFx8KFxcfCk/L2csIHNhZmVSZXBsYWNlKTtcclxuICAgICAgICAgICAgICBjb29raWVzLmRlc3Ryb3koX2luW2ldLCBfd2l0aC5kLCBfd2l0aC5pKTtcclxuICAgICAgICAgICAgICBjb29raWVzLmRlc3Ryb3koX2luW2ldLCBfd2l0aC5kLCAhX3dpdGguaSk7XHJcbiAgICAgICAgICAgICAgY29va2llcy5zZXQoX2luW2ldLCBidWZmZXIsIF93aXRoLmwsIF93aXRoLmQsIF93aXRoLmkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gVXBkYXRlIGBzZXNzaW9uYFxyXG4gICAgICAgICAgaWYgKGNvb2tpZXMuZ2V0KGRhdGEuY29udGFpbmVycy5zZXNzaW9uKSkge1xyXG4gICAgICAgICAgICBjb29raWVzLnNldChkYXRhLmNvbnRhaW5lcnMuc2Vzc2lvbiwgZGF0YS5wYWNrLnNlc3Npb24oMCksIF93aXRoLmwsIF93aXRoLmQsIF93aXRoLmkpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIFlheSFcclxuICAgICAgICAgIGNvb2tpZXMuc2V0KGRhdGEuc2VydmljZS5taWdyYXRpb25zLCBzdWNjZXNzLCBfd2l0aC5sLCBfd2l0aC5kLCBfd2l0aC5pKTtcclxuXHJcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgICAvLyBPb3BzXHJcbiAgICAgICAgICBjb29raWVzLnNldChkYXRhLnNlcnZpY2UubWlncmF0aW9ucywgZmFpbCwgX3dpdGgubCwgX3dpdGguZCwgX3dpdGguaSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gIF1cclxuXHJcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgdGVybXMgPSByZXF1aXJlKCcuL3Rlcm1zJyksXHJcbiAgICB1cmkgICA9IHJlcXVpcmUoJy4vaGVscGVycy91cmknKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG5cclxuICBmZXRjaDogZnVuY3Rpb24ocHJlZnMpIHtcclxuXHJcbiAgICB2YXIgdXNlciAgID0gcHJlZnMgfHwge30sXHJcbiAgICAgICAgcGFyYW1zID0ge307XHJcblxyXG4gICAgLy8gU2V0IGBsaWZldGltZSBvZiB0aGUgY29va2llYCBpbiBtb250aHNcclxuICAgIHBhcmFtcy5saWZldGltZSA9IHRoaXMudmFsaWRhdGUuY2hlY2tGbG9hdCh1c2VyLmxpZmV0aW1lKSB8fCA2O1xyXG4gICAgcGFyYW1zLmxpZmV0aW1lID0gcGFyc2VJbnQocGFyYW1zLmxpZmV0aW1lICogMzAgKiAyNCAqIDYwKTtcclxuXHJcbiAgICAvLyBTZXQgYHNlc3Npb24gbGVuZ3RoYCBpbiBtaW51dGVzXHJcbiAgICBwYXJhbXMuc2Vzc2lvbl9sZW5ndGggPSB0aGlzLnZhbGlkYXRlLmNoZWNrSW50KHVzZXIuc2Vzc2lvbl9sZW5ndGgpIHx8IDMwO1xyXG5cclxuICAgIC8vIFNldCBgdGltZXpvbmUgb2Zmc2V0YCBpbiBob3Vyc1xyXG4gICAgcGFyYW1zLnRpbWV6b25lX29mZnNldCA9IHRoaXMudmFsaWRhdGUuY2hlY2tJbnQodXNlci50aW1lem9uZV9vZmZzZXQpO1xyXG5cclxuICAgIC8vIFNldCBgY2FtcGFpZ24gcGFyYW1gIGZvciBBZFdvcmRzIGxpbmtzXHJcbiAgICBwYXJhbXMuY2FtcGFpZ25fcGFyYW0gPSB1c2VyLmNhbXBhaWduX3BhcmFtIHx8IGZhbHNlO1xyXG5cclxuICAgIC8vIFNldCBgdGVybSBwYXJhbWAgYW5kIGBjb250ZW50IHBhcmFtYCBmb3IgQWRXb3JkcyBsaW5rc1xyXG4gICAgcGFyYW1zLnRlcm1fcGFyYW0gPSB1c2VyLnRlcm1fcGFyYW0gfHwgZmFsc2U7XHJcbiAgICBwYXJhbXMuY29udGVudF9wYXJhbSA9IHVzZXIuY29udGVudF9wYXJhbSB8fCBmYWxzZTtcclxuXHJcbiAgICAvLyBTZXQgYHVzZXIgaXBgXHJcbiAgICBwYXJhbXMudXNlcl9pcCA9IHVzZXIudXNlcl9pcCB8fCB0ZXJtcy5ub25lO1xyXG5cclxuICAgIC8vIFNldCBgcHJvbW9jb2RlYFxyXG4gICAgaWYgKHVzZXIucHJvbW9jb2RlKSB7XHJcbiAgICAgIHBhcmFtcy5wcm9tb2NvZGUgPSB7fTtcclxuICAgICAgcGFyYW1zLnByb21vY29kZS5taW4gPSBwYXJzZUludCh1c2VyLnByb21vY29kZS5taW4pIHx8IDEwMDAwMDtcclxuICAgICAgcGFyYW1zLnByb21vY29kZS5tYXggPSBwYXJzZUludCh1c2VyLnByb21vY29kZS5tYXgpIHx8IDk5OTk5OTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHBhcmFtcy5wcm9tb2NvZGUgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBTZXQgYHR5cGVpbiBhdHRyaWJ1dGVzYFxyXG4gICAgaWYgKHVzZXIudHlwZWluX2F0dHJpYnV0ZXMgJiYgdXNlci50eXBlaW5fYXR0cmlidXRlcy5zb3VyY2UgJiYgdXNlci50eXBlaW5fYXR0cmlidXRlcy5tZWRpdW0pIHtcclxuICAgICAgcGFyYW1zLnR5cGVpbl9hdHRyaWJ1dGVzID0ge307XHJcbiAgICAgIHBhcmFtcy50eXBlaW5fYXR0cmlidXRlcy5zb3VyY2UgPSB1c2VyLnR5cGVpbl9hdHRyaWJ1dGVzLnNvdXJjZTtcclxuICAgICAgcGFyYW1zLnR5cGVpbl9hdHRyaWJ1dGVzLm1lZGl1bSA9IHVzZXIudHlwZWluX2F0dHJpYnV0ZXMubWVkaXVtO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcGFyYW1zLnR5cGVpbl9hdHRyaWJ1dGVzID0geyBzb3VyY2U6ICcoZGlyZWN0KScsIG1lZGl1bTogJyhub25lKScgfTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBTZXQgYGRvbWFpbmBcclxuICAgIGlmICh1c2VyLmRvbWFpbiAmJiB0aGlzLnZhbGlkYXRlLmlzU3RyaW5nKHVzZXIuZG9tYWluKSkge1xyXG4gICAgICBwYXJhbXMuZG9tYWluID0geyBob3N0OiB1c2VyLmRvbWFpbiwgaXNvbGF0ZTogZmFsc2UgfTtcclxuICAgIH0gZWxzZSBpZiAodXNlci5kb21haW4gJiYgdXNlci5kb21haW4uaG9zdCkge1xyXG4gICAgICBwYXJhbXMuZG9tYWluID0gdXNlci5kb21haW47XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBwYXJhbXMuZG9tYWluID0geyBob3N0OiB1cmkuZ2V0SG9zdChkb2N1bWVudC5sb2NhdGlvbi5ob3N0bmFtZSksIGlzb2xhdGU6IGZhbHNlIH07XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU2V0IGByZWZlcnJhbCBzb3VyY2VzYFxyXG4gICAgcGFyYW1zLnJlZmVycmFscyA9IFtdO1xyXG5cclxuICAgIGlmICh1c2VyLnJlZmVycmFscyAmJiB1c2VyLnJlZmVycmFscy5sZW5ndGggPiAwKSB7XHJcbiAgICAgIGZvciAodmFyIGlyID0gMDsgaXIgPCB1c2VyLnJlZmVycmFscy5sZW5ndGg7IGlyKyspIHtcclxuICAgICAgICBpZiAodXNlci5yZWZlcnJhbHNbaXJdLmhvc3QpIHtcclxuICAgICAgICAgIHBhcmFtcy5yZWZlcnJhbHMucHVzaCh1c2VyLnJlZmVycmFsc1tpcl0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFNldCBgb3JnYW5pYyBzb3VyY2VzYFxyXG4gICAgcGFyYW1zLm9yZ2FuaWNzID0gW107XHJcblxyXG4gICAgaWYgKHVzZXIub3JnYW5pY3MgJiYgdXNlci5vcmdhbmljcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgIGZvciAodmFyIGlvID0gMDsgaW8gPCB1c2VyLm9yZ2FuaWNzLmxlbmd0aDsgaW8rKykge1xyXG4gICAgICAgIGlmICh1c2VyLm9yZ2FuaWNzW2lvXS5ob3N0ICYmIHVzZXIub3JnYW5pY3NbaW9dLnBhcmFtKSB7XHJcbiAgICAgICAgICBwYXJhbXMub3JnYW5pY3MucHVzaCh1c2VyLm9yZ2FuaWNzW2lvXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcGFyYW1zLm9yZ2FuaWNzLnB1c2goeyBob3N0OiAnYmluZy5jb20nLCAgICAgIHBhcmFtOiAncScsICAgICBkaXNwbGF5OiAnYmluZycgICAgICAgICAgICB9KTtcclxuICAgIHBhcmFtcy5vcmdhbmljcy5wdXNoKHsgaG9zdDogJ3lhaG9vLmNvbScsICAgICBwYXJhbTogJ3AnLCAgICAgZGlzcGxheTogJ3lhaG9vJyAgICAgICAgICAgfSk7XHJcbiAgICBwYXJhbXMub3JnYW5pY3MucHVzaCh7IGhvc3Q6ICdhYm91dC5jb20nLCAgICAgcGFyYW06ICdxJywgICAgIGRpc3BsYXk6ICdhYm91dCcgICAgICAgICAgIH0pO1xyXG4gICAgcGFyYW1zLm9yZ2FuaWNzLnB1c2goeyBob3N0OiAnYW9sLmNvbScsICAgICAgIHBhcmFtOiAncScsICAgICBkaXNwbGF5OiAnYW9sJyAgICAgICAgICAgICB9KTtcclxuICAgIHBhcmFtcy5vcmdhbmljcy5wdXNoKHsgaG9zdDogJ2Fzay5jb20nLCAgICAgICBwYXJhbTogJ3EnLCAgICAgZGlzcGxheTogJ2FzaycgICAgICAgICAgICAgfSk7XHJcbiAgICBwYXJhbXMub3JnYW5pY3MucHVzaCh7IGhvc3Q6ICdnbG9ib3Nvc28uY29tJywgcGFyYW06ICdxJywgICAgIGRpc3BsYXk6ICdnbG9ibycgICAgICAgICAgIH0pO1xyXG4gICAgcGFyYW1zLm9yZ2FuaWNzLnB1c2goeyBob3N0OiAnZ28ubWFpbC5ydScsICAgIHBhcmFtOiAncScsICAgICBkaXNwbGF5OiAnZ28ubWFpbC5ydScgICAgICB9KTtcclxuICAgIHBhcmFtcy5vcmdhbmljcy5wdXNoKHsgaG9zdDogJ3JhbWJsZXIucnUnLCAgICBwYXJhbTogJ3F1ZXJ5JywgZGlzcGxheTogJ3JhbWJsZXInICAgICAgICAgfSk7XHJcbiAgICBwYXJhbXMub3JnYW5pY3MucHVzaCh7IGhvc3Q6ICd0dXQuYnknLCAgICAgICAgcGFyYW06ICdxdWVyeScsIGRpc3BsYXk6ICd0dXQuYnknICAgICAgICAgIH0pO1xyXG5cclxuICAgIHBhcmFtcy5yZWZlcnJhbHMucHVzaCh7IGhvc3Q6ICd0LmNvJywgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ3R3aXR0ZXIuY29tJyAgICAgfSk7XHJcbiAgICBwYXJhbXMucmVmZXJyYWxzLnB1c2goeyBob3N0OiAncGx1cy51cmwuZ29vZ2xlLmNvbScsICAgICAgICAgIGRpc3BsYXk6ICdwbHVzLmdvb2dsZS5jb20nIH0pO1xyXG5cclxuXHJcbiAgICByZXR1cm4gcGFyYW1zO1xyXG5cclxuICB9LFxyXG5cclxuICB2YWxpZGF0ZToge1xyXG5cclxuICAgIGNoZWNrRmxvYXQ6IGZ1bmN0aW9uKHYpIHtcclxuICAgICAgcmV0dXJuIHYgJiYgdGhpcy5pc051bWVyaWMocGFyc2VGbG9hdCh2KSkgPyBwYXJzZUZsb2F0KHYpIDogZmFsc2U7XHJcbiAgICB9LFxyXG5cclxuICAgIGNoZWNrSW50OiBmdW5jdGlvbih2KSB7XHJcbiAgICAgIHJldHVybiB2ICYmIHRoaXMuaXNOdW1lcmljKHBhcnNlSW50KHYpKSA/IHBhcnNlSW50KHYpIDogZmFsc2U7XHJcbiAgICB9LFxyXG5cclxuICAgIGlzTnVtZXJpYzogZnVuY3Rpb24odil7XHJcbiAgICAgIHJldHVybiAhaXNOYU4odik7XHJcbiAgICB9LFxyXG5cclxuICAgIGlzU3RyaW5nOiBmdW5jdGlvbih2KSB7XHJcbiAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodikgPT09ICdbb2JqZWN0IFN0cmluZ10nO1xyXG4gICAgfVxyXG5cclxuICB9XHJcblxyXG59OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcblxyXG4gIHRyYWZmaWM6IHtcclxuICAgIHV0bTogICAgICAgICd1dG0nLFxyXG4gICAgb3JnYW5pYzogICAgJ29yZ2FuaWMnLFxyXG4gICAgcmVmZXJyYWw6ICAgJ3JlZmVycmFsJyxcclxuICAgIHR5cGVpbjogICAgICd0eXBlaW4nXHJcbiAgfSxcclxuXHJcbiAgcmVmZXJlcjoge1xyXG4gICAgcmVmZXJyYWw6ICAgJ3JlZmVycmFsJyxcclxuICAgIG9yZ2FuaWM6ICAgICdvcmdhbmljJyxcclxuICAgIHNvY2lhbDogICAgICdzb2NpYWwnXHJcbiAgfSxcclxuXHJcbiAgbm9uZTogICAgICAgICAnKG5vbmUpJyxcclxuICBvb3BzOiAgICAgICAgICcoSG91c3Rvbiwgd2UgaGF2ZSBhIHByb2JsZW0pJ1xyXG5cclxufTtcclxuIl19
