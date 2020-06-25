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
    console.log('name', name);
    console.log('domain', domain);
    console.log('excl_subdomains', excl_subdomains);
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
    console.log('data.containers.session', data.containers.session);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvc291cmNlYnVzdGVyLmpzIiwic3JjL2pzL2RhdGEuanMiLCJzcmMvanMvaGVscGVycy9jb29raWVzLmpzIiwic3JjL2pzL2hlbHBlcnMvdXJpLmpzIiwic3JjL2pzL2hlbHBlcnMvdXRpbHMuanMiLCJzcmMvanMvaW5pdC5qcyIsInNyYy9qcy9taWdyYXRpb25zLmpzIiwic3JjL2pzL3BhcmFtcy5qcyIsInNyYy9qcy90ZXJtcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBpbml0ID0gcmVxdWlyZSgnLi9pbml0Jyk7XHJcblxyXG52YXIgc2JqcyA9IHtcclxuICBpbml0OiBmdW5jdGlvbihwcmVmcykge1xyXG4gICAgdGhpcy5nZXQgPSBpbml0KHByZWZzKTtcclxuICAgIGlmIChwcmVmcyAmJiBwcmVmcy5jYWxsYmFjayAmJiB0eXBlb2YgcHJlZnMuY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgcHJlZnMuY2FsbGJhY2sodGhpcy5nZXQpO1xyXG4gICAgfVxyXG4gIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gc2JqczsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciB0ZXJtcyA9IHJlcXVpcmUoJy4vdGVybXMnKSxcclxuICAgIHV0aWxzID0gcmVxdWlyZSgnLi9oZWxwZXJzL3V0aWxzJyk7XHJcblxyXG52YXIgZGF0YSA9IHtcclxuXHJcbiAgY29udGFpbmVyczoge1xyXG4gICAgY3VycmVudDogICAgICAgICAgJ3NianNfY3VycmVudCcsXHJcbiAgICBjdXJyZW50X2V4dHJhOiAgICAnc2Jqc19jdXJyZW50X2FkZCcsXHJcbiAgICBmaXJzdDogICAgICAgICAgICAnc2Jqc19maXJzdCcsXHJcbiAgICBmaXJzdF9leHRyYTogICAgICAnc2Jqc19maXJzdF9hZGQnLFxyXG4gICAgc2Vzc2lvbjogICAgICAgICAgJ3NianNfc2Vzc2lvbicsXHJcbiAgICB1ZGF0YTogICAgICAgICAgICAnc2Jqc191ZGF0YScsXHJcbiAgICBwcm9tb2NvZGU6ICAgICAgICAnc2Jqc19wcm9tbydcclxuICB9LFxyXG5cclxuICBzZXJ2aWNlOiB7XHJcbiAgICBtaWdyYXRpb25zOiAgICAgICAnc2Jqc19taWdyYXRpb25zJ1xyXG4gIH0sXHJcblxyXG4gIGRlbGltaXRlcjogICAgICAgICAgJ3x8fCcsXHJcblxyXG4gIGFsaWFzZXM6IHtcclxuXHJcbiAgICBtYWluOiB7XHJcbiAgICAgIHR5cGU6ICAgICAgICAgICAndHlwJyxcclxuICAgICAgc291cmNlOiAgICAgICAgICdzcmMnLFxyXG4gICAgICBtZWRpdW06ICAgICAgICAgJ21kbScsXHJcbiAgICAgIGNhbXBhaWduOiAgICAgICAnY21wJyxcclxuICAgICAgY29udGVudDogICAgICAgICdjbnQnLFxyXG4gICAgICB0ZXJtOiAgICAgICAgICAgJ3RybSdcclxuICAgIH0sXHJcblxyXG4gICAgZXh0cmE6IHtcclxuICAgICAgZmlyZV9kYXRlOiAgICAgICdmZCcsXHJcbiAgICAgIGVudHJhbmNlX3BvaW50OiAnZXAnLFxyXG4gICAgICByZWZlcmVyOiAgICAgICAgJ3JmJ1xyXG4gICAgfSxcclxuXHJcbiAgICBzZXNzaW9uOiB7XHJcbiAgICAgIHBhZ2VzX3NlZW46ICAgICAncGdzJyxcclxuICAgICAgY3VycmVudF9wYWdlOiAgICdjcGcnXHJcbiAgICB9LFxyXG5cclxuICAgIHVkYXRhOiB7XHJcbiAgICAgIHZpc2l0czogICAgICAgICAndnN0JyxcclxuICAgICAgaXA6ICAgICAgICAgICAgICd1aXAnLFxyXG4gICAgICBhZ2VudDogICAgICAgICAgJ3VhZydcclxuICAgIH0sXHJcblxyXG4gICAgcHJvbW86ICAgICAgICAgICAgJ2NvZGUnXHJcblxyXG4gIH0sXHJcblxyXG4gIHBhY2s6IHtcclxuXHJcbiAgICBtYWluOiBmdW5jdGlvbihzYmpzKSB7XHJcbiAgICAgIHJldHVybiAoXHJcbiAgICAgICAgZGF0YS5hbGlhc2VzLm1haW4udHlwZSAgICAgICsgJz0nICsgc2Jqcy50eXBlICAgICArIGRhdGEuZGVsaW1pdGVyICtcclxuICAgICAgICBkYXRhLmFsaWFzZXMubWFpbi5zb3VyY2UgICAgKyAnPScgKyBzYmpzLnNvdXJjZSAgICsgZGF0YS5kZWxpbWl0ZXIgK1xyXG4gICAgICAgIGRhdGEuYWxpYXNlcy5tYWluLm1lZGl1bSAgICArICc9JyArIHNianMubWVkaXVtICAgKyBkYXRhLmRlbGltaXRlciArXHJcbiAgICAgICAgZGF0YS5hbGlhc2VzLm1haW4uY2FtcGFpZ24gICsgJz0nICsgc2Jqcy5jYW1wYWlnbiArIGRhdGEuZGVsaW1pdGVyICtcclxuICAgICAgICBkYXRhLmFsaWFzZXMubWFpbi5jb250ZW50ICAgKyAnPScgKyBzYmpzLmNvbnRlbnQgICsgZGF0YS5kZWxpbWl0ZXIgK1xyXG4gICAgICAgIGRhdGEuYWxpYXNlcy5tYWluLnRlcm0gICAgICArICc9JyArIHNianMudGVybVxyXG4gICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICBleHRyYTogZnVuY3Rpb24odGltZXpvbmVfb2Zmc2V0KSB7XHJcbiAgICAgIHJldHVybiAoXHJcbiAgICAgICAgZGF0YS5hbGlhc2VzLmV4dHJhLmZpcmVfZGF0ZSAgICAgICsgJz0nICsgdXRpbHMuc2V0RGF0ZShuZXcgRGF0ZSwgdGltZXpvbmVfb2Zmc2V0KSArIGRhdGEuZGVsaW1pdGVyICtcclxuICAgICAgICBkYXRhLmFsaWFzZXMuZXh0cmEuZW50cmFuY2VfcG9pbnQgKyAnPScgKyBkb2N1bWVudC5sb2NhdGlvbi5ocmVmICAgICAgICAgICAgICAgICAgICsgZGF0YS5kZWxpbWl0ZXIgK1xyXG4gICAgICAgIGRhdGEuYWxpYXNlcy5leHRyYS5yZWZlcmVyICAgICAgICArICc9JyArIChkb2N1bWVudC5yZWZlcnJlciB8fCB0ZXJtcy5ub25lKVxyXG4gICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICB1c2VyOiBmdW5jdGlvbih2aXNpdHMsIHVzZXJfaXApIHtcclxuICAgICAgcmV0dXJuIChcclxuICAgICAgICBkYXRhLmFsaWFzZXMudWRhdGEudmlzaXRzICsgJz0nICsgdmlzaXRzICArIGRhdGEuZGVsaW1pdGVyICtcclxuICAgICAgICBkYXRhLmFsaWFzZXMudWRhdGEuaXAgICAgICsgJz0nICsgdXNlcl9pcCArIGRhdGEuZGVsaW1pdGVyICtcclxuICAgICAgICBkYXRhLmFsaWFzZXMudWRhdGEuYWdlbnQgICsgJz0nICsgbmF2aWdhdG9yLnVzZXJBZ2VudFxyXG4gICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICBzZXNzaW9uOiBmdW5jdGlvbihwYWdlcykge1xyXG4gICAgICByZXR1cm4gKFxyXG4gICAgICBkYXRhLmFsaWFzZXMuc2Vzc2lvbi5wYWdlc19zZWVuICAgKyAnPScgKyBwYWdlcyArIGRhdGEuZGVsaW1pdGVyICtcclxuICAgICAgZGF0YS5hbGlhc2VzLnNlc3Npb24uY3VycmVudF9wYWdlICsgJz0nICsgZG9jdW1lbnQubG9jYXRpb24uaHJlZlxyXG4gICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICBwcm9tbzogZnVuY3Rpb24ocHJvbW8pIHtcclxuICAgICAgcmV0dXJuIChcclxuICAgICAgICBkYXRhLmFsaWFzZXMucHJvbW8gKyAnPScgKyB1dGlscy5zZXRMZWFkaW5nWmVyb1RvSW50KHV0aWxzLnJhbmRvbUludChwcm9tby5taW4sIHByb21vLm1heCksIHByb21vLm1heC50b1N0cmluZygpLmxlbmd0aClcclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBkYXRhOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIGRlbGltaXRlciA9IHJlcXVpcmUoJy4uL2RhdGEnKS5kZWxpbWl0ZXI7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuXHJcbiAgZW5jb2RlRGF0YTogZnVuY3Rpb24ocykge1xyXG4gICAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudChzKS5yZXBsYWNlKC9cXCEvZywgJyUyMScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcfi9nLCAnJTdFJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFwqL2csICclMkEnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXCcvZywgJyUyNycpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcKC9nLCAnJTI4JylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFwpL2csICclMjknKTtcclxuICB9LFxyXG5cclxuICBkZWNvZGVEYXRhOiBmdW5jdGlvbihzKSB7XHJcbiAgICB0cnkge1xyXG4gICAgICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KHMpLnJlcGxhY2UoL1xcJTIxL2csICchJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXCU3RS9nLCAnficpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFwlMkEvZywgJyonKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcJTI3L2csIFwiJ1wiKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcJTI4L2csICcoJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXCUyOS9nLCAnKScpO1xyXG4gICAgfSBjYXRjaChlcnIxKSB7XHJcbiAgICAgIC8vIHRyeSB1bmVzY2FwZSBmb3IgYmFja3dhcmQgY29tcGF0aWJpbGl0eVxyXG4gICAgICB0cnkgeyByZXR1cm4gdW5lc2NhcGUocyk7IH0gY2F0Y2goZXJyMikgeyByZXR1cm4gJyc7IH1cclxuICAgIH1cclxuICB9LFxyXG5cclxuICBzZXQ6IGZ1bmN0aW9uKG5hbWUsIHZhbHVlLCBtaW51dGVzLCBkb21haW4sIGV4Y2xfc3ViZG9tYWlucykge1xyXG4gICAgdmFyIGV4cGlyZXMsIGJhc2Vob3N0O1xyXG5cclxuICAgIGlmIChtaW51dGVzKSB7XHJcbiAgICAgIHZhciBkYXRlID0gbmV3IERhdGUoKTtcclxuICAgICAgZGF0ZS5zZXRUaW1lKGRhdGUuZ2V0VGltZSgpICsgKG1pbnV0ZXMgKiA2MCAqIDEwMDApKTtcclxuICAgICAgZXhwaXJlcyA9ICc7IGV4cGlyZXM9JyArIGRhdGUudG9HTVRTdHJpbmcoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGV4cGlyZXMgPSAnJztcclxuICAgIH1cclxuICAgIGlmIChkb21haW4gJiYgIWV4Y2xfc3ViZG9tYWlucykge1xyXG4gICAgICBiYXNlaG9zdCA9ICc7ZG9tYWluPS4nICsgZG9tYWluO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgYmFzZWhvc3QgPSAnJztcclxuICAgIH1cclxuICAgIGRvY3VtZW50LmNvb2tpZSA9IHRoaXMuZW5jb2RlRGF0YShuYW1lKSArICc9JyArIHRoaXMuZW5jb2RlRGF0YSh2YWx1ZSkgKyBleHBpcmVzICsgYmFzZWhvc3QgKyAnOyBwYXRoPS8nO1xyXG4gIH0sXHJcblxyXG4gIGdldDogZnVuY3Rpb24obmFtZSkge1xyXG4gICAgdmFyIG5hbWVFUSA9IHRoaXMuZW5jb2RlRGF0YShuYW1lKSArICc9JyxcclxuICAgICAgICBjYSA9IGRvY3VtZW50LmNvb2tpZS5zcGxpdCgnOycpO1xyXG5cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2EubGVuZ3RoOyBpKyspIHtcclxuICAgICAgdmFyIGMgPSBjYVtpXTtcclxuICAgICAgd2hpbGUgKGMuY2hhckF0KDApID09PSAnICcpIHsgYyA9IGMuc3Vic3RyaW5nKDEsIGMubGVuZ3RoKTsgfVxyXG4gICAgICBpZiAoYy5pbmRleE9mKG5hbWVFUSkgPT09IDApIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5kZWNvZGVEYXRhKGMuc3Vic3RyaW5nKG5hbWVFUS5sZW5ndGgsIGMubGVuZ3RoKSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBudWxsO1xyXG4gIH0sXHJcblxyXG4gIGRlc3Ryb3k6IGZ1bmN0aW9uKG5hbWUsIGRvbWFpbiwgZXhjbF9zdWJkb21haW5zKSB7XHJcbiAgICBjb25zb2xlLmxvZygnbmFtZScsIG5hbWUpO1xyXG4gICAgY29uc29sZS5sb2coJ2RvbWFpbicsIGRvbWFpbik7XHJcbiAgICBjb25zb2xlLmxvZygnZXhjbF9zdWJkb21haW5zJywgZXhjbF9zdWJkb21haW5zKTtcclxuICAgIHRoaXMuc2V0KG5hbWUsICcnLCAtMSwgZG9tYWluLCBleGNsX3N1YmRvbWFpbnMpO1xyXG4gIH0sXHJcblxyXG4gIHBhcnNlOiBmdW5jdGlvbih5dW1teSkge1xyXG5cclxuICAgIHZhciBjb29raWVzID0gW10sXHJcbiAgICAgICAgZGF0YSAgICA9IHt9O1xyXG5cclxuICAgIGlmICh0eXBlb2YgeXVtbXkgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgIGNvb2tpZXMucHVzaCh5dW1teSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBmb3IgKHZhciBwcm9wIGluIHl1bW15KSB7XHJcbiAgICAgICAgaWYgKHl1bW15Lmhhc093blByb3BlcnR5KHByb3ApKSB7XHJcbiAgICAgICAgICBjb29raWVzLnB1c2goeXVtbXlbcHJvcF0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZvciAodmFyIGkxID0gMDsgaTEgPCBjb29raWVzLmxlbmd0aDsgaTErKykge1xyXG4gICAgICB2YXIgY29va2llX2FycmF5O1xyXG4gICAgICBkYXRhW3RoaXMudW5zYmpzKGNvb2tpZXNbaTFdKV0gPSB7fTtcclxuICAgICAgaWYgKHRoaXMuZ2V0KGNvb2tpZXNbaTFdKSkge1xyXG4gICAgICAgIGNvb2tpZV9hcnJheSA9IHRoaXMuZ2V0KGNvb2tpZXNbaTFdKS5zcGxpdChkZWxpbWl0ZXIpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNvb2tpZV9hcnJheSA9IFtdO1xyXG4gICAgICB9XHJcbiAgICAgIGZvciAodmFyIGkyID0gMDsgaTIgPCBjb29raWVfYXJyYXkubGVuZ3RoOyBpMisrKSB7XHJcbiAgICAgICAgdmFyIHRtcF9hcnJheSA9IGNvb2tpZV9hcnJheVtpMl0uc3BsaXQoJz0nKSxcclxuICAgICAgICAgICAgcmVzdWx0X2FycmF5ID0gdG1wX2FycmF5LnNwbGljZSgwLCAxKTtcclxuICAgICAgICByZXN1bHRfYXJyYXkucHVzaCh0bXBfYXJyYXkuam9pbignPScpKTtcclxuICAgICAgICBkYXRhW3RoaXMudW5zYmpzKGNvb2tpZXNbaTFdKV1bcmVzdWx0X2FycmF5WzBdXSA9IHRoaXMuZGVjb2RlRGF0YShyZXN1bHRfYXJyYXlbMV0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGRhdGE7XHJcblxyXG4gIH0sXHJcblxyXG4gIHVuc2JqczogZnVuY3Rpb24gKHN0cmluZykge1xyXG4gICAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKCdzYmpzXycsICcnKTtcclxuICB9XHJcblxyXG59O1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG5cclxuICBwYXJzZTogZnVuY3Rpb24oc3RyKSB7XHJcbiAgICB2YXIgbyA9IHRoaXMucGFyc2VPcHRpb25zLFxyXG4gICAgICAgIG0gPSBvLnBhcnNlcltvLnN0cmljdE1vZGUgPyAnc3RyaWN0JyA6ICdsb29zZSddLmV4ZWMoc3RyKSxcclxuICAgICAgICB1cmkgPSB7fSxcclxuICAgICAgICBpID0gMTQ7XHJcblxyXG4gICAgd2hpbGUgKGktLSkgeyB1cmlbby5rZXlbaV1dID0gbVtpXSB8fCAnJzsgfVxyXG5cclxuICAgIHVyaVtvLnEubmFtZV0gPSB7fTtcclxuICAgIHVyaVtvLmtleVsxMl1dLnJlcGxhY2Uoby5xLnBhcnNlciwgZnVuY3Rpb24gKCQwLCAkMSwgJDIpIHtcclxuICAgICAgaWYgKCQxKSB7IHVyaVtvLnEubmFtZV1bJDFdID0gJDI7IH1cclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiB1cmk7XHJcbiAgfSxcclxuXHJcbiAgcGFyc2VPcHRpb25zOiB7XHJcbiAgICBzdHJpY3RNb2RlOiBmYWxzZSxcclxuICAgIGtleTogWydzb3VyY2UnLCdwcm90b2NvbCcsJ2F1dGhvcml0eScsJ3VzZXJJbmZvJywndXNlcicsJ3Bhc3N3b3JkJywnaG9zdCcsJ3BvcnQnLCdyZWxhdGl2ZScsJ3BhdGgnLCdkaXJlY3RvcnknLCdmaWxlJywncXVlcnknLCdhbmNob3InXSxcclxuICAgIHE6IHtcclxuICAgICAgbmFtZTogICAncXVlcnlLZXknLFxyXG4gICAgICBwYXJzZXI6IC8oPzpefCYpKFteJj1dKik9PyhbXiZdKikvZ1xyXG4gICAgfSxcclxuICAgIHBhcnNlcjoge1xyXG4gICAgICBzdHJpY3Q6IC9eKD86KFteOlxcLz8jXSspOik/KD86XFwvXFwvKCg/OigoW146QF0qKSg/OjooW146QF0qKSk/KT9AKT8oW146XFwvPyNdKikoPzo6KFxcZCopKT8pKT8oKCgoPzpbXj8jXFwvXSpcXC8pKikoW14/I10qKSkoPzpcXD8oW14jXSopKT8oPzojKC4qKSk/KS8sXHJcbiAgICAgIGxvb3NlOiAgL14oPzooPyFbXjpAXSs6W146QFxcL10qQCkoW146XFwvPyMuXSspOik/KD86XFwvXFwvKT8oKD86KChbXjpAXSopKD86OihbXjpAXSopKT8pP0ApPyhbXjpcXC8/I10qKSg/OjooXFxkKikpPykoKChcXC8oPzpbXj8jXSg/IVtePyNcXC9dKlxcLltePyNcXC8uXSsoPzpbPyNdfCQpKSkqXFwvPyk/KFtePyNcXC9dKikpKD86XFw/KFteI10qKSk/KD86IyguKikpPykvXHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgZ2V0UGFyYW06IGZ1bmN0aW9uKGN1c3RvbV9wYXJhbXMpIHtcclxuICAgIHZhciBxdWVyeV9zdHJpbmcgPSB7fSxcclxuICAgICAgICBxdWVyeSA9IGN1c3RvbV9wYXJhbXMgPyBjdXN0b21fcGFyYW1zIDogd2luZG93LmxvY2F0aW9uLnNlYXJjaC5zdWJzdHJpbmcoMSksXHJcbiAgICAgICAgdmFycyA9IHF1ZXJ5LnNwbGl0KCcmJyk7XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2YXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHZhciBwYWlyID0gdmFyc1tpXS5zcGxpdCgnPScpO1xyXG4gICAgICBpZiAodHlwZW9mIHF1ZXJ5X3N0cmluZ1twYWlyWzBdXSA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICBxdWVyeV9zdHJpbmdbcGFpclswXV0gPSBwYWlyWzFdO1xyXG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBxdWVyeV9zdHJpbmdbcGFpclswXV0gPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgdmFyIGFyciA9IFsgcXVlcnlfc3RyaW5nW3BhaXJbMF1dLCBwYWlyWzFdIF07XHJcbiAgICAgICAgcXVlcnlfc3RyaW5nW3BhaXJbMF1dID0gYXJyO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHF1ZXJ5X3N0cmluZ1twYWlyWzBdXS5wdXNoKHBhaXJbMV0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcXVlcnlfc3RyaW5nO1xyXG4gIH0sXHJcblxyXG4gIGdldEhvc3Q6IGZ1bmN0aW9uKHJlcXVlc3QpIHtcclxuICAgIHJldHVybiB0aGlzLnBhcnNlKHJlcXVlc3QpLmhvc3QucmVwbGFjZSgnd3d3LicsICcnKTtcclxuICB9XHJcblxyXG59OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcblxyXG4gIGVzY2FwZVJlZ2V4cDogZnVuY3Rpb24oc3RyaW5nKSB7XHJcbiAgICByZXR1cm4gc3RyaW5nLnJlcGxhY2UoL1tcXC1cXFtcXF1cXC9cXHtcXH1cXChcXClcXCpcXCtcXD9cXC5cXFxcXFxeXFwkXFx8XS9nLCBcIlxcXFwkJlwiKTtcclxuICB9LFxyXG5cclxuICBzZXREYXRlOiBmdW5jdGlvbihkYXRlLCBvZmZzZXQpIHtcclxuICAgIHZhciB1dGNfb2Zmc2V0ICAgID0gZGF0ZS5nZXRUaW1lem9uZU9mZnNldCgpIC8gNjAsXHJcbiAgICAgICAgbm93X2hvdXJzICAgICA9IGRhdGUuZ2V0SG91cnMoKSxcclxuICAgICAgICBjdXN0b21fb2Zmc2V0ID0gb2Zmc2V0IHx8IG9mZnNldCA9PT0gMCA/IG9mZnNldCA6IC11dGNfb2Zmc2V0O1xyXG5cclxuICAgIGRhdGUuc2V0SG91cnMobm93X2hvdXJzICsgdXRjX29mZnNldCArIGN1c3RvbV9vZmZzZXQpO1xyXG5cclxuICAgIHZhciB5ZWFyICAgID0gZGF0ZS5nZXRGdWxsWWVhcigpLFxyXG4gICAgICAgIG1vbnRoICAgPSB0aGlzLnNldExlYWRpbmdaZXJvVG9JbnQoZGF0ZS5nZXRNb250aCgpICsgMSwgICAyKSxcclxuICAgICAgICBkYXkgICAgID0gdGhpcy5zZXRMZWFkaW5nWmVyb1RvSW50KGRhdGUuZ2V0RGF0ZSgpLCAgICAgICAgMiksXHJcbiAgICAgICAgaG91ciAgICA9IHRoaXMuc2V0TGVhZGluZ1plcm9Ub0ludChkYXRlLmdldEhvdXJzKCksICAgICAgIDIpLFxyXG4gICAgICAgIG1pbnV0ZSAgPSB0aGlzLnNldExlYWRpbmdaZXJvVG9JbnQoZGF0ZS5nZXRNaW51dGVzKCksICAgICAyKSxcclxuICAgICAgICBzZWNvbmQgID0gdGhpcy5zZXRMZWFkaW5nWmVyb1RvSW50KGRhdGUuZ2V0U2Vjb25kcygpLCAgICAgMik7XHJcblxyXG4gICAgcmV0dXJuICh5ZWFyICsgJy0nICsgbW9udGggKyAnLScgKyBkYXkgKyAnICcgKyBob3VyICsgJzonICsgbWludXRlICsgJzonICsgc2Vjb25kKTtcclxuICB9LFxyXG5cclxuICBzZXRMZWFkaW5nWmVyb1RvSW50OiBmdW5jdGlvbihudW0sIHNpemUpIHtcclxuICAgIHZhciBzID0gbnVtICsgJyc7XHJcbiAgICB3aGlsZSAocy5sZW5ndGggPCBzaXplKSB7IHMgPSAnMCcgKyBzOyB9XHJcbiAgICByZXR1cm4gcztcclxuICB9LFxyXG5cclxuICByYW5kb21JbnQ6IGZ1bmN0aW9uKG1pbiwgbWF4KSB7XHJcbiAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpKSArIG1pbjtcclxuICB9XHJcblxyXG59O1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBkYXRhICAgICAgICA9IHJlcXVpcmUoJy4vZGF0YScpLFxyXG4gICAgdGVybXMgICAgICAgPSByZXF1aXJlKCcuL3Rlcm1zJyksXHJcbiAgICBjb29raWVzICAgICA9IHJlcXVpcmUoJy4vaGVscGVycy9jb29raWVzJyksXHJcbiAgICB1cmkgICAgICAgICA9IHJlcXVpcmUoJy4vaGVscGVycy91cmknKSxcclxuICAgIHV0aWxzICAgICAgID0gcmVxdWlyZSgnLi9oZWxwZXJzL3V0aWxzJyksXHJcbiAgICBwYXJhbXMgICAgICA9IHJlcXVpcmUoJy4vcGFyYW1zJyksXHJcbiAgICBtaWdyYXRpb25zICA9IHJlcXVpcmUoJy4vbWlncmF0aW9ucycpO1xyXG5cclxudmFyIGJsYWNrbGlzdCA9IFsncGFydG5lcicsICdvZmZpY2UnLCAnYWdlbnQnXTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ocHJlZnMpIHtcclxuXHJcbiAgdmFyIHAgICAgICAgICA9IHBhcmFtcy5mZXRjaChwcmVmcyk7XHJcbiAgdmFyIGdldF9wYXJhbSA9IHVyaS5nZXRQYXJhbSgpO1xyXG4gIHZhciBkb21haW4gICAgPSBwLmRvbWFpbi5ob3N0LFxyXG4gICAgICBpc29sYXRlICAgPSBwLmRvbWFpbi5pc29sYXRlLFxyXG4gICAgICBsaWZldGltZSAgPSBwLmxpZmV0aW1lO1xyXG5cclxuICBtaWdyYXRpb25zLmdvKGxpZmV0aW1lLCBkb21haW4sIGlzb2xhdGUpO1xyXG5cclxuICB2YXIgX19zYmpzX3R5cGUsXHJcbiAgICAgIF9fc2Jqc19zb3VyY2UsXHJcbiAgICAgIF9fc2Jqc19tZWRpdW0sXHJcbiAgICAgIF9fc2Jqc19jYW1wYWlnbixcclxuICAgICAgX19zYmpzX2NvbnRlbnQsXHJcbiAgICAgIF9fc2Jqc190ZXJtO1xyXG5cclxuICBmdW5jdGlvbiBtYWluRGF0YSgpIHtcclxuICAgIHZhciBzYmpzX2RhdGE7XHJcbiAgICBpZiAoXHJcbiAgICAgICAgdHlwZW9mIGdldF9wYXJhbS51dG1fc291cmNlICAgICAgICAhPT0gJ3VuZGVmaW5lZCcgfHxcclxuICAgICAgICB0eXBlb2YgZ2V0X3BhcmFtLnV0bV9tZWRpdW0gICAgICAgICE9PSAndW5kZWZpbmVkJyB8fFxyXG4gICAgICAgIHR5cGVvZiBnZXRfcGFyYW0udXRtX2NhbXBhaWduICAgICAgIT09ICd1bmRlZmluZWQnIHx8XHJcbiAgICAgICAgdHlwZW9mIGdldF9wYXJhbS51dG1fY29udGVudCAgICAgICAhPT0gJ3VuZGVmaW5lZCcgfHxcclxuICAgICAgICB0eXBlb2YgZ2V0X3BhcmFtLnV0bV90ZXJtICAgICAgICAgICE9PSAndW5kZWZpbmVkJyB8fFxyXG4gICAgICAgIHR5cGVvZiBnZXRfcGFyYW0uZ2NsaWQgICAgICAgICAgICAgIT09ICd1bmRlZmluZWQnIHx8XHJcbiAgICAgICAgdHlwZW9mIGdldF9wYXJhbS55Y2xpZCAgICAgICAgICAgICAhPT0gJ3VuZGVmaW5lZCcgfHxcclxuICAgICAgICB0eXBlb2YgZ2V0X3BhcmFtW3AuY2FtcGFpZ25fcGFyYW1dICE9PSAndW5kZWZpbmVkJyB8fFxyXG4gICAgICAgIHR5cGVvZiBnZXRfcGFyYW1bcC50ZXJtX3BhcmFtXSAgICAgIT09ICd1bmRlZmluZWQnIHx8XHJcbiAgICAgICAgdHlwZW9mIGdldF9wYXJhbVtwLmNvbnRlbnRfcGFyYW1dICAhPT0gJ3VuZGVmaW5lZCdcclxuICAgICkge1xyXG4gICAgICBzZXRGaXJzdEFuZEN1cnJlbnRFeHRyYURhdGEoKTtcclxuICAgICAgc2Jqc19kYXRhID0gZ2V0RGF0YSh0ZXJtcy50cmFmZmljLnV0bSk7XHJcbiAgICB9IGVsc2UgaWYgKGNoZWNrUmVmZXJlcih0ZXJtcy50cmFmZmljLm9yZ2FuaWMpKSB7XHJcbiAgICAgIHNldEZpcnN0QW5kQ3VycmVudEV4dHJhRGF0YSgpO1xyXG4gICAgICBzYmpzX2RhdGEgPSBnZXREYXRhKHRlcm1zLnRyYWZmaWMub3JnYW5pYyk7XHJcbiAgICB9IGVsc2UgaWYgKCFjb29raWVzLmdldChkYXRhLmNvbnRhaW5lcnMuc2Vzc2lvbikgJiYgY2hlY2tSZWZlcmVyKHRlcm1zLnRyYWZmaWMucmVmZXJyYWwpKSB7XHJcbiAgICAgIHNldEZpcnN0QW5kQ3VycmVudEV4dHJhRGF0YSgpO1xyXG4gICAgICBzYmpzX2RhdGEgPSBnZXREYXRhKHRlcm1zLnRyYWZmaWMucmVmZXJyYWwpO1xyXG4gICAgfSBlbHNlIGlmICghY29va2llcy5nZXQoZGF0YS5jb250YWluZXJzLmZpcnN0KSAmJiAhY29va2llcy5nZXQoZGF0YS5jb250YWluZXJzLmN1cnJlbnQpKSB7XHJcbiAgICAgIHNldEZpcnN0QW5kQ3VycmVudEV4dHJhRGF0YSgpO1xyXG4gICAgICBzYmpzX2RhdGEgPSBnZXREYXRhKHRlcm1zLnRyYWZmaWMudHlwZWluKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiBjb29raWVzLmdldChkYXRhLmNvbnRhaW5lcnMuY3VycmVudCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHNianNfZGF0YTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGdldERhdGEodHlwZSkge1xyXG5cclxuICAgIHN3aXRjaCAodHlwZSkge1xyXG5cclxuICAgICAgY2FzZSB0ZXJtcy50cmFmZmljLnV0bTpcclxuXHJcbiAgICAgICAgX19zYmpzX3R5cGUgPSB0ZXJtcy50cmFmZmljLnV0bTtcclxuXHJcbiAgICAgICAgaWYgKHR5cGVvZiBnZXRfcGFyYW0udXRtX3NvdXJjZSAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgIF9fc2Jqc19zb3VyY2UgPSBnZXRfcGFyYW0udXRtX3NvdXJjZTtcclxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBnZXRfcGFyYW0uZ2NsaWQgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICBfX3NianNfc291cmNlID0gJ2dvb2dsZSc7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgZ2V0X3BhcmFtLnljbGlkICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgX19zYmpzX3NvdXJjZSA9ICd5YW5kZXgnOyAgXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIF9fc2Jqc19zb3VyY2UgPSB0ZXJtcy5ub25lO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHR5cGVvZiBnZXRfcGFyYW0udXRtX21lZGl1bSAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgIF9fc2Jqc19tZWRpdW0gPSBnZXRfcGFyYW0udXRtX21lZGl1bTtcclxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBnZXRfcGFyYW0uZ2NsaWQgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICBfX3NianNfbWVkaXVtID0gJ2NwYyc7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgZ2V0X3BhcmFtLnljbGlkICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgX19zYmpzX21lZGl1bSA9ICdjcGMnOyAgXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIF9fc2Jqc19tZWRpdW0gPSB0ZXJtcy5ub25lO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHR5cGVvZiBnZXRfcGFyYW0udXRtX2NhbXBhaWduICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgX19zYmpzX2NhbXBhaWduID0gZ2V0X3BhcmFtLnV0bV9jYW1wYWlnbjtcclxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBnZXRfcGFyYW1bcC5jYW1wYWlnbl9wYXJhbV0gIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICBfX3NianNfY2FtcGFpZ24gPSBnZXRfcGFyYW1bcC5jYW1wYWlnbl9wYXJhbV07XHJcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgZ2V0X3BhcmFtLmdjbGlkICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgX19zYmpzX2NhbXBhaWduID0gJ2dvb2dsZV9jcGMnO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGdldF9wYXJhbS55Y2xpZCAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgIF9fc2Jqc19jYW1wYWlnbiA9ICd5YW5kZXhfY3BjJzsgIFxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBfX3NianNfY2FtcGFpZ24gPSB0ZXJtcy5ub25lO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHR5cGVvZiBnZXRfcGFyYW0udXRtX2NvbnRlbnQgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICBfX3NianNfY29udGVudCA9IGdldF9wYXJhbS51dG1fY29udGVudDtcclxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBnZXRfcGFyYW1bcC5jb250ZW50X3BhcmFtXSAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgIF9fc2Jqc19jb250ZW50ID0gZ2V0X3BhcmFtW3AuY29udGVudF9wYXJhbV07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIF9fc2Jqc19jb250ZW50ID0gdGVybXMubm9uZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0eXBlb2YgZ2V0X3BhcmFtLnV0bV90ZXJtICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgX19zYmpzX3Rlcm0gPSBnZXRfcGFyYW0udXRtX3Rlcm07XHJcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgZ2V0X3BhcmFtW3AudGVybV9wYXJhbV0gIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICBfX3NianNfdGVybSA9IGdldF9wYXJhbVtwLnRlcm1fcGFyYW1dO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBfX3NianNfdGVybSA9IGdldFV0bVRlcm0oKSB8fCB0ZXJtcy5ub25lO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICBjYXNlIHRlcm1zLnRyYWZmaWMub3JnYW5pYzpcclxuICAgICAgICBfX3NianNfdHlwZSAgICAgPSB0ZXJtcy50cmFmZmljLm9yZ2FuaWM7XHJcbiAgICAgICAgX19zYmpzX3NvdXJjZSAgID0gX19zYmpzX3NvdXJjZSB8fCB1cmkuZ2V0SG9zdChkb2N1bWVudC5yZWZlcnJlcik7XHJcbiAgICAgICAgX19zYmpzX21lZGl1bSAgID0gdGVybXMucmVmZXJlci5vcmdhbmljO1xyXG4gICAgICAgIF9fc2Jqc19jYW1wYWlnbiA9IHRlcm1zLm5vbmU7XHJcbiAgICAgICAgX19zYmpzX2NvbnRlbnQgID0gdGVybXMubm9uZTtcclxuICAgICAgICBfX3NianNfdGVybSAgICAgPSB0ZXJtcy5ub25lO1xyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgY2FzZSB0ZXJtcy50cmFmZmljLnJlZmVycmFsOlxyXG4gICAgICAgIF9fc2Jqc190eXBlICAgICA9IHRlcm1zLnRyYWZmaWMucmVmZXJyYWw7XHJcbiAgICAgICAgX19zYmpzX3NvdXJjZSAgID0gX19zYmpzX3NvdXJjZSB8fCB1cmkuZ2V0SG9zdChkb2N1bWVudC5yZWZlcnJlcik7XHJcbiAgICAgICAgX19zYmpzX21lZGl1bSAgID0gX19zYmpzX21lZGl1bSB8fCB0ZXJtcy5yZWZlcmVyLnJlZmVycmFsO1xyXG4gICAgICAgIF9fc2Jqc19jYW1wYWlnbiA9IHRlcm1zLm5vbmU7XHJcbiAgICAgICAgX19zYmpzX2NvbnRlbnQgID0gdXJpLnBhcnNlKGRvY3VtZW50LnJlZmVycmVyKS5wYXRoO1xyXG4gICAgICAgIF9fc2Jqc190ZXJtICAgICA9IHRlcm1zLm5vbmU7XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICBjYXNlIHRlcm1zLnRyYWZmaWMudHlwZWluOlxyXG4gICAgICAgIF9fc2Jqc190eXBlICAgICA9IHRlcm1zLnRyYWZmaWMudHlwZWluO1xyXG4gICAgICAgIF9fc2Jqc19zb3VyY2UgICA9IHAudHlwZWluX2F0dHJpYnV0ZXMuc291cmNlO1xyXG4gICAgICAgIF9fc2Jqc19tZWRpdW0gICA9IHAudHlwZWluX2F0dHJpYnV0ZXMubWVkaXVtO1xyXG4gICAgICAgIF9fc2Jqc19jYW1wYWlnbiA9IHRlcm1zLm5vbmU7XHJcbiAgICAgICAgX19zYmpzX2NvbnRlbnQgID0gdGVybXMubm9uZTtcclxuICAgICAgICBfX3NianNfdGVybSAgICAgPSB0ZXJtcy5ub25lO1xyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICBfX3NianNfdHlwZSAgICAgPSB0ZXJtcy5vb3BzO1xyXG4gICAgICAgIF9fc2Jqc19zb3VyY2UgICA9IHRlcm1zLm9vcHM7XHJcbiAgICAgICAgX19zYmpzX21lZGl1bSAgID0gdGVybXMub29wcztcclxuICAgICAgICBfX3NianNfY2FtcGFpZ24gPSB0ZXJtcy5vb3BzO1xyXG4gICAgICAgIF9fc2Jqc19jb250ZW50ICA9IHRlcm1zLm9vcHM7XHJcbiAgICAgICAgX19zYmpzX3Rlcm0gICAgID0gdGVybXMub29wcztcclxuICAgIH1cclxuICAgIHZhciBzYmpzX2RhdGEgPSB7XHJcbiAgICAgIHR5cGU6ICAgICAgICAgICAgIF9fc2Jqc190eXBlLFxyXG4gICAgICBzb3VyY2U6ICAgICAgICAgICBfX3NianNfc291cmNlLFxyXG4gICAgICBtZWRpdW06ICAgICAgICAgICBfX3NianNfbWVkaXVtLFxyXG4gICAgICBjYW1wYWlnbjogICAgICAgICBfX3NianNfY2FtcGFpZ24sXHJcbiAgICAgIGNvbnRlbnQ6ICAgICAgICAgIF9fc2Jqc19jb250ZW50LFxyXG4gICAgICB0ZXJtOiAgICAgICAgICAgICBfX3NianNfdGVybVxyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4gZGF0YS5wYWNrLm1haW4oc2Jqc19kYXRhKTtcclxuXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnZXRVdG1UZXJtKCkge1xyXG4gICAgdmFyIHJlZmVyZXIgPSBkb2N1bWVudC5yZWZlcnJlcjtcclxuICAgIGlmIChnZXRfcGFyYW0udXRtX3Rlcm0pIHtcclxuICAgICAgcmV0dXJuIGdldF9wYXJhbS51dG1fdGVybTtcclxuICAgIH0gZWxzZSBpZiAocmVmZXJlciAmJiB1cmkucGFyc2UocmVmZXJlcikuaG9zdCAmJiB1cmkucGFyc2UocmVmZXJlcikuaG9zdC5tYXRjaCgvXig/Oi4qXFwuKT95YW5kZXhcXC4uezIsOX0kL2kpKSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgcmV0dXJuIHVyaS5nZXRQYXJhbSh1cmkucGFyc2UoZG9jdW1lbnQucmVmZXJyZXIpLnF1ZXJ5KS50ZXh0O1xyXG4gICAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNoZWNrUmVmZXJlcih0eXBlKSB7XHJcbiAgICB2YXIgcmVmZXJlciA9IGRvY3VtZW50LnJlZmVycmVyO1xyXG4gICAgc3dpdGNoKHR5cGUpIHtcclxuICAgICAgY2FzZSB0ZXJtcy50cmFmZmljLm9yZ2FuaWM6XHJcbiAgICAgICAgcmV0dXJuICghIXJlZmVyZXIgJiYgY2hlY2tSZWZlcmVySG9zdChyZWZlcmVyKSAmJiBpc09yZ2FuaWMocmVmZXJlcikpO1xyXG4gICAgICBjYXNlIHRlcm1zLnRyYWZmaWMucmVmZXJyYWw6XHJcbiAgICAgICAgcmV0dXJuICghIXJlZmVyZXIgJiYgY2hlY2tSZWZlcmVySG9zdChyZWZlcmVyKSAmJiBpc1JlZmVycmFsKHJlZmVyZXIpKTtcclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjaGVja1JlZmVyZXJIb3N0KHJlZmVyZXIpIHtcclxuICAgIGlmIChwLmRvbWFpbikge1xyXG4gICAgICBpZiAoIWlzb2xhdGUpIHtcclxuICAgICAgICB2YXIgaG9zdF9yZWdleCA9IG5ldyBSZWdFeHAoJ14oPzouKlxcXFwuKT8nICsgdXRpbHMuZXNjYXBlUmVnZXhwKGRvbWFpbikgKyAnJCcsICdpJyk7XHJcbiAgICAgICAgcmV0dXJuICEodXJpLmdldEhvc3QocmVmZXJlcikubWF0Y2goaG9zdF9yZWdleCkpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiAodXJpLmdldEhvc3QocmVmZXJlcikgIT09IHVyaS5nZXRIb3N0KGRvbWFpbikpO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gKHVyaS5nZXRIb3N0KHJlZmVyZXIpICE9PSB1cmkuZ2V0SG9zdChkb2N1bWVudC5sb2NhdGlvbi5ocmVmKSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBpc09yZ2FuaWMocmVmZXJlcikge1xyXG5cclxuICAgIHZhciB5X2hvc3QgID0gJ3lhbmRleCcsXHJcbiAgICAgICAgeV9wYXJhbSA9ICd0ZXh0JyxcclxuICAgICAgICBnX2hvc3QgID0gJ2dvb2dsZSc7XHJcblxyXG4gICAgdmFyIHlfaG9zdF9yZWdleCAgPSBuZXcgUmVnRXhwKCdeKD86LipcXFxcLik/JyAgKyB1dGlscy5lc2NhcGVSZWdleHAoeV9ob3N0KSAgKyAnXFxcXC4uezIsOX0kJyksXHJcbiAgICAgICAgeV9wYXJhbV9yZWdleCA9IG5ldyBSZWdFeHAoJy4qJyAgICAgICAgICAgKyB1dGlscy5lc2NhcGVSZWdleHAoeV9wYXJhbSkgKyAnPS4qJyksXHJcbiAgICAgICAgZ19ob3N0X3JlZ2V4ICA9IG5ldyBSZWdFeHAoJ14oPzp3d3dcXFxcLik/JyArIHV0aWxzLmVzY2FwZVJlZ2V4cChnX2hvc3QpICArICdcXFxcLi57Miw5fSQnKTtcclxuXHJcbiAgICBpZiAoXHJcbiAgICAgICAgISF1cmkucGFyc2UocmVmZXJlcikucXVlcnkgJiZcclxuICAgICAgICAhIXVyaS5wYXJzZShyZWZlcmVyKS5ob3N0Lm1hdGNoKHlfaG9zdF9yZWdleCkgJiZcclxuICAgICAgICAhIXVyaS5wYXJzZShyZWZlcmVyKS5xdWVyeS5tYXRjaCh5X3BhcmFtX3JlZ2V4KVxyXG4gICAgICApIHtcclxuICAgICAgX19zYmpzX3NvdXJjZSA9IHlfaG9zdDtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9IGVsc2UgaWYgKCEhdXJpLnBhcnNlKHJlZmVyZXIpLmhvc3QubWF0Y2goZ19ob3N0X3JlZ2V4KSkge1xyXG4gICAgICBfX3NianNfc291cmNlID0gZ19ob3N0O1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH0gZWxzZSBpZiAoISF1cmkucGFyc2UocmVmZXJlcikucXVlcnkpIHtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwLm9yZ2FuaWNzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICB1cmkucGFyc2UocmVmZXJlcikuaG9zdC5tYXRjaChuZXcgUmVnRXhwKCdeKD86LipcXFxcLik/JyArIHV0aWxzLmVzY2FwZVJlZ2V4cChwLm9yZ2FuaWNzW2ldLmhvc3QpICArICckJywgJ2knKSkgJiZcclxuICAgICAgICAgICAgdXJpLnBhcnNlKHJlZmVyZXIpLnF1ZXJ5Lm1hdGNoKG5ldyBSZWdFeHAoJy4qJyAgICAgICAgICsgdXRpbHMuZXNjYXBlUmVnZXhwKHAub3JnYW5pY3NbaV0ucGFyYW0pICsgJz0uKicsICdpJykpXHJcbiAgICAgICAgICApIHtcclxuICAgICAgICAgIF9fc2Jqc19zb3VyY2UgPSBwLm9yZ2FuaWNzW2ldLmRpc3BsYXkgfHwgcC5vcmdhbmljc1tpXS5ob3N0O1xyXG4gICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpICsgMSA9PT0gcC5vcmdhbmljcy5sZW5ndGgpIHtcclxuICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGlzUmVmZXJyYWwocmVmZXJlcikge1xyXG4gICAgaWYgKHAucmVmZXJyYWxzLmxlbmd0aCA+IDApIHtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwLnJlZmVycmFscy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGlmICh1cmkucGFyc2UocmVmZXJlcikuaG9zdC5tYXRjaChuZXcgUmVnRXhwKCdeKD86LipcXFxcLik/JyArIHV0aWxzLmVzY2FwZVJlZ2V4cChwLnJlZmVycmFsc1tpXS5ob3N0KSArICckJywgJ2knKSkpIHtcclxuICAgICAgICAgIF9fc2Jqc19zb3VyY2UgPSBwLnJlZmVycmFsc1tpXS5kaXNwbGF5ICB8fCBwLnJlZmVycmFsc1tpXS5ob3N0O1xyXG4gICAgICAgICAgX19zYmpzX21lZGl1bSA9IHAucmVmZXJyYWxzW2ldLm1lZGl1bSAgIHx8IHRlcm1zLnJlZmVyZXIucmVmZXJyYWw7XHJcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGkgKyAxID09PSBwLnJlZmVycmFscy5sZW5ndGgpIHtcclxuICAgICAgICAgIF9fc2Jqc19zb3VyY2UgPSB1cmkuZ2V0SG9zdChyZWZlcmVyKTtcclxuICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgX19zYmpzX3NvdXJjZSA9IHVyaS5nZXRIb3N0KHJlZmVyZXIpO1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHNldEZpcnN0QW5kQ3VycmVudEV4dHJhRGF0YSgpIHtcclxuICAgIGNvb2tpZXMuc2V0KGRhdGEuY29udGFpbmVycy5jdXJyZW50X2V4dHJhLCBkYXRhLnBhY2suZXh0cmEocC50aW1lem9uZV9vZmZzZXQpLCBsaWZldGltZSwgZG9tYWluLCBpc29sYXRlKTtcclxuICAgIGlmICghY29va2llcy5nZXQoZGF0YS5jb250YWluZXJzLmZpcnN0X2V4dHJhKSkge1xyXG4gICAgICBjb29raWVzLnNldChkYXRhLmNvbnRhaW5lcnMuZmlyc3RfZXh0cmEsIGRhdGEucGFjay5leHRyYShwLnRpbWV6b25lX29mZnNldCksIGxpZmV0aW1lLCBkb21haW4sIGlzb2xhdGUpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgKGZ1bmN0aW9uIHNldERhdGEoKSB7XHJcblxyXG4gICAgaWYgKGdldF9wYXJhbS5sZGcgJiYgYmxhY2tsaXN0LmluY2x1ZGVzKGdldF9wYXJhbS5sZGcpKSB7XHJcbiAgICAgIC8vIGRlc3Ryb3kgc291cmNlYnVzdGVyIGNvb2tpZXMgb24gYmxhY2tsaXN0XHJcbiAgICAgIE9iamVjdC52YWx1ZXMoZGF0YS5jb250YWluZXJzKS5tYXAoZnVuY3Rpb24oY29va2llKSB7XHJcbiAgICAgICAgY29va2llcy5kZXN0cm95KGNvb2tpZSwgZG9tYWluLCBpc29sYXRlKTtcclxuICAgICAgfSk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIC8vIE1haW4gZGF0YVxyXG4gICAgY29va2llcy5zZXQoZGF0YS5jb250YWluZXJzLmN1cnJlbnQsIG1haW5EYXRhKCksIGxpZmV0aW1lLCBkb21haW4sIGlzb2xhdGUpO1xyXG4gICAgaWYgKCFjb29raWVzLmdldChkYXRhLmNvbnRhaW5lcnMuZmlyc3QpKSB7XHJcbiAgICAgIGNvb2tpZXMuc2V0KGRhdGEuY29udGFpbmVycy5maXJzdCwgY29va2llcy5nZXQoZGF0YS5jb250YWluZXJzLmN1cnJlbnQpLCBsaWZldGltZSwgZG9tYWluLCBpc29sYXRlKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBVc2VyIGRhdGFcclxuICAgIHZhciB2aXNpdHMsIHVkYXRhO1xyXG4gICAgaWYgKCFjb29raWVzLmdldChkYXRhLmNvbnRhaW5lcnMudWRhdGEpKSB7XHJcbiAgICAgIHZpc2l0cyAgPSAxO1xyXG4gICAgICB1ZGF0YSAgID0gZGF0YS5wYWNrLnVzZXIodmlzaXRzLCBwLnVzZXJfaXApO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdmlzaXRzICA9IHBhcnNlSW50KGNvb2tpZXMucGFyc2UoZGF0YS5jb250YWluZXJzLnVkYXRhKVtjb29raWVzLnVuc2JqcyhkYXRhLmNvbnRhaW5lcnMudWRhdGEpXVtkYXRhLmFsaWFzZXMudWRhdGEudmlzaXRzXSkgfHwgMTtcclxuICAgICAgdmlzaXRzICA9IGNvb2tpZXMuZ2V0KGRhdGEuY29udGFpbmVycy5zZXNzaW9uKSA/IHZpc2l0cyA6IHZpc2l0cyArIDE7XHJcbiAgICAgIHVkYXRhICAgPSBkYXRhLnBhY2sudXNlcih2aXNpdHMsIHAudXNlcl9pcCk7XHJcbiAgICB9XHJcbiAgICBjb29raWVzLnNldChkYXRhLmNvbnRhaW5lcnMudWRhdGEsIHVkYXRhLCBsaWZldGltZSwgZG9tYWluLCBpc29sYXRlKTtcclxuXHJcbiAgICAvLyBTZXNzaW9uXHJcbiAgICB2YXIgcGFnZXNfY291bnQ7XHJcbiAgICBpZiAoIWNvb2tpZXMuZ2V0KGRhdGEuY29udGFpbmVycy5zZXNzaW9uKSkge1xyXG4gICAgICBwYWdlc19jb3VudCA9IDE7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBwYWdlc19jb3VudCA9IHBhcnNlSW50KGNvb2tpZXMucGFyc2UoZGF0YS5jb250YWluZXJzLnNlc3Npb24pW2Nvb2tpZXMudW5zYmpzKGRhdGEuY29udGFpbmVycy5zZXNzaW9uKV1bZGF0YS5hbGlhc2VzLnNlc3Npb24ucGFnZXNfc2Vlbl0pIHx8IDE7XHJcbiAgICAgIHBhZ2VzX2NvdW50ICs9IDE7XHJcbiAgICB9XHJcbiAgICBjb25zb2xlLmxvZygnZGF0YS5jb250YWluZXJzLnNlc3Npb24nLCBkYXRhLmNvbnRhaW5lcnMuc2Vzc2lvbik7XHJcbiAgICBjb29raWVzLnNldChkYXRhLmNvbnRhaW5lcnMuc2Vzc2lvbiwgZGF0YS5wYWNrLnNlc3Npb24ocGFnZXNfY291bnQpLCBwLnNlc3Npb25fbGVuZ3RoLCBkb21haW4sIGlzb2xhdGUpO1xyXG5cclxuICAgIC8vIFByb21vY29kZVxyXG4gICAgaWYgKHAucHJvbW9jb2RlICYmICFjb29raWVzLmdldChkYXRhLmNvbnRhaW5lcnMucHJvbW9jb2RlKSkge1xyXG4gICAgICBjb29raWVzLnNldChkYXRhLmNvbnRhaW5lcnMucHJvbW9jb2RlLCBkYXRhLnBhY2sucHJvbW8ocC5wcm9tb2NvZGUpLCBsaWZldGltZSwgZG9tYWluLCBpc29sYXRlKTtcclxuICAgIH1cclxuXHJcbiAgfSkoKTtcclxuXHJcbiAgcmV0dXJuIGNvb2tpZXMucGFyc2UoZGF0YS5jb250YWluZXJzKTtcclxuXHJcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgZGF0YSAgICA9IHJlcXVpcmUoJy4vZGF0YScpLFxyXG4gICAgY29va2llcyA9IHJlcXVpcmUoJy4vaGVscGVycy9jb29raWVzJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuXHJcbiAgZ286IGZ1bmN0aW9uKGxpZmV0aW1lLCBkb21haW4sIGlzb2xhdGUpIHtcclxuXHJcbiAgICB2YXIgbWlncmF0ZSA9IHRoaXMubWlncmF0aW9ucyxcclxuICAgICAgICBfd2l0aCAgID0geyBsOiBsaWZldGltZSwgZDogZG9tYWluLCBpOiBpc29sYXRlIH07XHJcblxyXG4gICAgdmFyIGk7XHJcblxyXG4gICAgaWYgKCFjb29raWVzLmdldChkYXRhLmNvbnRhaW5lcnMuZmlyc3QpICYmICFjb29raWVzLmdldChkYXRhLnNlcnZpY2UubWlncmF0aW9ucykpIHtcclxuXHJcbiAgICAgIHZhciBtaWRzID0gW107XHJcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBtaWdyYXRlLmxlbmd0aDsgaSsrKSB7IG1pZHMucHVzaChtaWdyYXRlW2ldLmlkKTsgfVxyXG5cclxuICAgICAgdmFyIGFkdmFuY2UgPSAnJztcclxuICAgICAgZm9yIChpID0gMDsgaSA8IG1pZHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBhZHZhbmNlICs9IG1pZHNbaV0gKyAnPTEnO1xyXG4gICAgICAgIGlmIChpIDwgbWlkcy5sZW5ndGggLSAxKSB7IGFkdmFuY2UgKz0gZGF0YS5kZWxpbWl0ZXI7IH1cclxuICAgICAgfVxyXG4gICAgICBjb29raWVzLnNldChkYXRhLnNlcnZpY2UubWlncmF0aW9ucywgYWR2YW5jZSwgX3dpdGgubCwgX3dpdGguZCwgX3dpdGguaSk7XHJcblxyXG4gICAgfSBlbHNlIGlmICghY29va2llcy5nZXQoZGF0YS5zZXJ2aWNlLm1pZ3JhdGlvbnMpKSB7XHJcblxyXG4gICAgICAvLyBXZSBoYXZlIG9ubHkgb25lIG1pZ3JhdGlvbiBmb3Igbm93LCBzbyBqdXN0XHJcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBtaWdyYXRlLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgbWlncmF0ZVtpXS5nbyhtaWdyYXRlW2ldLmlkLCBfd2l0aCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gIH0sXHJcblxyXG4gIG1pZ3JhdGlvbnM6IFtcclxuXHJcbiAgICB7XHJcbiAgICAgIGlkOiAnMTQxODQ3NDM3NTk5OCcsXHJcbiAgICAgIHZlcnNpb246ICcxLjAuMC1iZXRhJyxcclxuICAgICAgZ286IGZ1bmN0aW9uKG1pZCwgX3dpdGgpIHtcclxuXHJcbiAgICAgICAgdmFyIHN1Y2Nlc3MgPSBtaWQgKyAnPTEnLFxyXG4gICAgICAgICAgICBmYWlsICAgID0gbWlkICsgJz0wJztcclxuXHJcbiAgICAgICAgdmFyIHNhZmVSZXBsYWNlID0gZnVuY3Rpb24oJDAsICQxLCAkMikge1xyXG4gICAgICAgICAgcmV0dXJuICgkMSB8fCAkMiA/ICQwIDogZGF0YS5kZWxpbWl0ZXIpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRyeSB7XHJcblxyXG4gICAgICAgICAgLy8gU3dpdGNoIGRlbGltaXRlciBhbmQgcmVuZXcgY29va2llc1xyXG4gICAgICAgICAgdmFyIF9pbiA9IFtdO1xyXG4gICAgICAgICAgZm9yICh2YXIgcHJvcCBpbiBkYXRhLmNvbnRhaW5lcnMpIHtcclxuICAgICAgICAgICAgaWYgKGRhdGEuY29udGFpbmVycy5oYXNPd25Qcm9wZXJ0eShwcm9wKSkge1xyXG4gICAgICAgICAgICAgIF9pbi5wdXNoKGRhdGEuY29udGFpbmVyc1twcm9wXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IF9pbi5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAoY29va2llcy5nZXQoX2luW2ldKSkge1xyXG4gICAgICAgICAgICAgIHZhciBidWZmZXIgPSBjb29raWVzLmdldChfaW5baV0pLnJlcGxhY2UoLyhcXHwpP1xcfChcXHwpPy9nLCBzYWZlUmVwbGFjZSk7XHJcbiAgICAgICAgICAgICAgY29va2llcy5kZXN0cm95KF9pbltpXSwgX3dpdGguZCwgX3dpdGguaSk7XHJcbiAgICAgICAgICAgICAgY29va2llcy5kZXN0cm95KF9pbltpXSwgX3dpdGguZCwgIV93aXRoLmkpO1xyXG4gICAgICAgICAgICAgIGNvb2tpZXMuc2V0KF9pbltpXSwgYnVmZmVyLCBfd2l0aC5sLCBfd2l0aC5kLCBfd2l0aC5pKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIFVwZGF0ZSBgc2Vzc2lvbmBcclxuICAgICAgICAgIGlmIChjb29raWVzLmdldChkYXRhLmNvbnRhaW5lcnMuc2Vzc2lvbikpIHtcclxuICAgICAgICAgICAgY29va2llcy5zZXQoZGF0YS5jb250YWluZXJzLnNlc3Npb24sIGRhdGEucGFjay5zZXNzaW9uKDApLCBfd2l0aC5sLCBfd2l0aC5kLCBfd2l0aC5pKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyBZYXkhXHJcbiAgICAgICAgICBjb29raWVzLnNldChkYXRhLnNlcnZpY2UubWlncmF0aW9ucywgc3VjY2VzcywgX3dpdGgubCwgX3dpdGguZCwgX3dpdGguaSk7XHJcblxyXG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAgICAgLy8gT29wc1xyXG4gICAgICAgICAgY29va2llcy5zZXQoZGF0YS5zZXJ2aWNlLm1pZ3JhdGlvbnMsIGZhaWwsIF93aXRoLmwsIF93aXRoLmQsIF93aXRoLmkpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICBdXHJcblxyXG59OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIHRlcm1zID0gcmVxdWlyZSgnLi90ZXJtcycpLFxyXG4gICAgdXJpICAgPSByZXF1aXJlKCcuL2hlbHBlcnMvdXJpJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuXHJcbiAgZmV0Y2g6IGZ1bmN0aW9uKHByZWZzKSB7XHJcblxyXG4gICAgdmFyIHVzZXIgICA9IHByZWZzIHx8IHt9LFxyXG4gICAgICAgIHBhcmFtcyA9IHt9O1xyXG5cclxuICAgIC8vIFNldCBgbGlmZXRpbWUgb2YgdGhlIGNvb2tpZWAgaW4gbW9udGhzXHJcbiAgICBwYXJhbXMubGlmZXRpbWUgPSB0aGlzLnZhbGlkYXRlLmNoZWNrRmxvYXQodXNlci5saWZldGltZSkgfHwgNjtcclxuICAgIHBhcmFtcy5saWZldGltZSA9IHBhcnNlSW50KHBhcmFtcy5saWZldGltZSAqIDMwICogMjQgKiA2MCk7XHJcblxyXG4gICAgLy8gU2V0IGBzZXNzaW9uIGxlbmd0aGAgaW4gbWludXRlc1xyXG4gICAgcGFyYW1zLnNlc3Npb25fbGVuZ3RoID0gdGhpcy52YWxpZGF0ZS5jaGVja0ludCh1c2VyLnNlc3Npb25fbGVuZ3RoKSB8fCAzMDtcclxuXHJcbiAgICAvLyBTZXQgYHRpbWV6b25lIG9mZnNldGAgaW4gaG91cnNcclxuICAgIHBhcmFtcy50aW1lem9uZV9vZmZzZXQgPSB0aGlzLnZhbGlkYXRlLmNoZWNrSW50KHVzZXIudGltZXpvbmVfb2Zmc2V0KTtcclxuXHJcbiAgICAvLyBTZXQgYGNhbXBhaWduIHBhcmFtYCBmb3IgQWRXb3JkcyBsaW5rc1xyXG4gICAgcGFyYW1zLmNhbXBhaWduX3BhcmFtID0gdXNlci5jYW1wYWlnbl9wYXJhbSB8fCBmYWxzZTtcclxuXHJcbiAgICAvLyBTZXQgYHRlcm0gcGFyYW1gIGFuZCBgY29udGVudCBwYXJhbWAgZm9yIEFkV29yZHMgbGlua3NcclxuICAgIHBhcmFtcy50ZXJtX3BhcmFtID0gdXNlci50ZXJtX3BhcmFtIHx8IGZhbHNlO1xyXG4gICAgcGFyYW1zLmNvbnRlbnRfcGFyYW0gPSB1c2VyLmNvbnRlbnRfcGFyYW0gfHwgZmFsc2U7XHJcblxyXG4gICAgLy8gU2V0IGB1c2VyIGlwYFxyXG4gICAgcGFyYW1zLnVzZXJfaXAgPSB1c2VyLnVzZXJfaXAgfHwgdGVybXMubm9uZTtcclxuXHJcbiAgICAvLyBTZXQgYHByb21vY29kZWBcclxuICAgIGlmICh1c2VyLnByb21vY29kZSkge1xyXG4gICAgICBwYXJhbXMucHJvbW9jb2RlID0ge307XHJcbiAgICAgIHBhcmFtcy5wcm9tb2NvZGUubWluID0gcGFyc2VJbnQodXNlci5wcm9tb2NvZGUubWluKSB8fCAxMDAwMDA7XHJcbiAgICAgIHBhcmFtcy5wcm9tb2NvZGUubWF4ID0gcGFyc2VJbnQodXNlci5wcm9tb2NvZGUubWF4KSB8fCA5OTk5OTk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBwYXJhbXMucHJvbW9jb2RlID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU2V0IGB0eXBlaW4gYXR0cmlidXRlc2BcclxuICAgIGlmICh1c2VyLnR5cGVpbl9hdHRyaWJ1dGVzICYmIHVzZXIudHlwZWluX2F0dHJpYnV0ZXMuc291cmNlICYmIHVzZXIudHlwZWluX2F0dHJpYnV0ZXMubWVkaXVtKSB7XHJcbiAgICAgIHBhcmFtcy50eXBlaW5fYXR0cmlidXRlcyA9IHt9O1xyXG4gICAgICBwYXJhbXMudHlwZWluX2F0dHJpYnV0ZXMuc291cmNlID0gdXNlci50eXBlaW5fYXR0cmlidXRlcy5zb3VyY2U7XHJcbiAgICAgIHBhcmFtcy50eXBlaW5fYXR0cmlidXRlcy5tZWRpdW0gPSB1c2VyLnR5cGVpbl9hdHRyaWJ1dGVzLm1lZGl1bTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHBhcmFtcy50eXBlaW5fYXR0cmlidXRlcyA9IHsgc291cmNlOiAnKGRpcmVjdCknLCBtZWRpdW06ICcobm9uZSknIH07XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU2V0IGBkb21haW5gXHJcbiAgICBpZiAodXNlci5kb21haW4gJiYgdGhpcy52YWxpZGF0ZS5pc1N0cmluZyh1c2VyLmRvbWFpbikpIHtcclxuICAgICAgcGFyYW1zLmRvbWFpbiA9IHsgaG9zdDogdXNlci5kb21haW4sIGlzb2xhdGU6IGZhbHNlIH07XHJcbiAgICB9IGVsc2UgaWYgKHVzZXIuZG9tYWluICYmIHVzZXIuZG9tYWluLmhvc3QpIHtcclxuICAgICAgcGFyYW1zLmRvbWFpbiA9IHVzZXIuZG9tYWluO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcGFyYW1zLmRvbWFpbiA9IHsgaG9zdDogdXJpLmdldEhvc3QoZG9jdW1lbnQubG9jYXRpb24uaG9zdG5hbWUpLCBpc29sYXRlOiBmYWxzZSB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFNldCBgcmVmZXJyYWwgc291cmNlc2BcclxuICAgIHBhcmFtcy5yZWZlcnJhbHMgPSBbXTtcclxuXHJcbiAgICBpZiAodXNlci5yZWZlcnJhbHMgJiYgdXNlci5yZWZlcnJhbHMubGVuZ3RoID4gMCkge1xyXG4gICAgICBmb3IgKHZhciBpciA9IDA7IGlyIDwgdXNlci5yZWZlcnJhbHMubGVuZ3RoOyBpcisrKSB7XHJcbiAgICAgICAgaWYgKHVzZXIucmVmZXJyYWxzW2lyXS5ob3N0KSB7XHJcbiAgICAgICAgICBwYXJhbXMucmVmZXJyYWxzLnB1c2godXNlci5yZWZlcnJhbHNbaXJdKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBTZXQgYG9yZ2FuaWMgc291cmNlc2BcclxuICAgIHBhcmFtcy5vcmdhbmljcyA9IFtdO1xyXG5cclxuICAgIGlmICh1c2VyLm9yZ2FuaWNzICYmIHVzZXIub3JnYW5pY3MubGVuZ3RoID4gMCkge1xyXG4gICAgICBmb3IgKHZhciBpbyA9IDA7IGlvIDwgdXNlci5vcmdhbmljcy5sZW5ndGg7IGlvKyspIHtcclxuICAgICAgICBpZiAodXNlci5vcmdhbmljc1tpb10uaG9zdCAmJiB1c2VyLm9yZ2FuaWNzW2lvXS5wYXJhbSkge1xyXG4gICAgICAgICAgcGFyYW1zLm9yZ2FuaWNzLnB1c2godXNlci5vcmdhbmljc1tpb10pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHBhcmFtcy5vcmdhbmljcy5wdXNoKHsgaG9zdDogJ2JpbmcuY29tJywgICAgICBwYXJhbTogJ3EnLCAgICAgZGlzcGxheTogJ2JpbmcnICAgICAgICAgICAgfSk7XHJcbiAgICBwYXJhbXMub3JnYW5pY3MucHVzaCh7IGhvc3Q6ICd5YWhvby5jb20nLCAgICAgcGFyYW06ICdwJywgICAgIGRpc3BsYXk6ICd5YWhvbycgICAgICAgICAgIH0pO1xyXG4gICAgcGFyYW1zLm9yZ2FuaWNzLnB1c2goeyBob3N0OiAnYWJvdXQuY29tJywgICAgIHBhcmFtOiAncScsICAgICBkaXNwbGF5OiAnYWJvdXQnICAgICAgICAgICB9KTtcclxuICAgIHBhcmFtcy5vcmdhbmljcy5wdXNoKHsgaG9zdDogJ2FvbC5jb20nLCAgICAgICBwYXJhbTogJ3EnLCAgICAgZGlzcGxheTogJ2FvbCcgICAgICAgICAgICAgfSk7XHJcbiAgICBwYXJhbXMub3JnYW5pY3MucHVzaCh7IGhvc3Q6ICdhc2suY29tJywgICAgICAgcGFyYW06ICdxJywgICAgIGRpc3BsYXk6ICdhc2snICAgICAgICAgICAgIH0pO1xyXG4gICAgcGFyYW1zLm9yZ2FuaWNzLnB1c2goeyBob3N0OiAnZ2xvYm9zb3NvLmNvbScsIHBhcmFtOiAncScsICAgICBkaXNwbGF5OiAnZ2xvYm8nICAgICAgICAgICB9KTtcclxuICAgIHBhcmFtcy5vcmdhbmljcy5wdXNoKHsgaG9zdDogJ2dvLm1haWwucnUnLCAgICBwYXJhbTogJ3EnLCAgICAgZGlzcGxheTogJ2dvLm1haWwucnUnICAgICAgfSk7XHJcbiAgICBwYXJhbXMub3JnYW5pY3MucHVzaCh7IGhvc3Q6ICdyYW1ibGVyLnJ1JywgICAgcGFyYW06ICdxdWVyeScsIGRpc3BsYXk6ICdyYW1ibGVyJyAgICAgICAgIH0pO1xyXG4gICAgcGFyYW1zLm9yZ2FuaWNzLnB1c2goeyBob3N0OiAndHV0LmJ5JywgICAgICAgIHBhcmFtOiAncXVlcnknLCBkaXNwbGF5OiAndHV0LmJ5JyAgICAgICAgICB9KTtcclxuXHJcbiAgICBwYXJhbXMucmVmZXJyYWxzLnB1c2goeyBob3N0OiAndC5jbycsICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICd0d2l0dGVyLmNvbScgICAgIH0pO1xyXG4gICAgcGFyYW1zLnJlZmVycmFscy5wdXNoKHsgaG9zdDogJ3BsdXMudXJsLmdvb2dsZS5jb20nLCAgICAgICAgICBkaXNwbGF5OiAncGx1cy5nb29nbGUuY29tJyB9KTtcclxuXHJcblxyXG4gICAgcmV0dXJuIHBhcmFtcztcclxuXHJcbiAgfSxcclxuXHJcbiAgdmFsaWRhdGU6IHtcclxuXHJcbiAgICBjaGVja0Zsb2F0OiBmdW5jdGlvbih2KSB7XHJcbiAgICAgIHJldHVybiB2ICYmIHRoaXMuaXNOdW1lcmljKHBhcnNlRmxvYXQodikpID8gcGFyc2VGbG9hdCh2KSA6IGZhbHNlO1xyXG4gICAgfSxcclxuXHJcbiAgICBjaGVja0ludDogZnVuY3Rpb24odikge1xyXG4gICAgICByZXR1cm4gdiAmJiB0aGlzLmlzTnVtZXJpYyhwYXJzZUludCh2KSkgPyBwYXJzZUludCh2KSA6IGZhbHNlO1xyXG4gICAgfSxcclxuXHJcbiAgICBpc051bWVyaWM6IGZ1bmN0aW9uKHYpe1xyXG4gICAgICByZXR1cm4gIWlzTmFOKHYpO1xyXG4gICAgfSxcclxuXHJcbiAgICBpc1N0cmluZzogZnVuY3Rpb24odikge1xyXG4gICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHYpID09PSAnW29iamVjdCBTdHJpbmddJztcclxuICAgIH1cclxuXHJcbiAgfVxyXG5cclxufTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG5cclxuICB0cmFmZmljOiB7XHJcbiAgICB1dG06ICAgICAgICAndXRtJyxcclxuICAgIG9yZ2FuaWM6ICAgICdvcmdhbmljJyxcclxuICAgIHJlZmVycmFsOiAgICdyZWZlcnJhbCcsXHJcbiAgICB0eXBlaW46ICAgICAndHlwZWluJ1xyXG4gIH0sXHJcblxyXG4gIHJlZmVyZXI6IHtcclxuICAgIHJlZmVycmFsOiAgICdyZWZlcnJhbCcsXHJcbiAgICBvcmdhbmljOiAgICAnb3JnYW5pYycsXHJcbiAgICBzb2NpYWw6ICAgICAnc29jaWFsJ1xyXG4gIH0sXHJcblxyXG4gIG5vbmU6ICAgICAgICAgJyhub25lKScsXHJcbiAgb29wczogICAgICAgICAnKEhvdXN0b24sIHdlIGhhdmUgYSBwcm9ibGVtKSdcclxuXHJcbn07XHJcbiJdfQ==
