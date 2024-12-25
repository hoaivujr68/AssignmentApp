import Vue from 'vue';
// import moment from 'moment';
import moment from 'moment-timezone'
import marked from "marked";

moment.tz.setDefault('Asia/Ho_Chi_Minh')

const formatDate = Vue.filter('formatDate', function (value) {
  if (!value) return null;
  let date = new Date(value);

  return [date.getDate().padLeft(), (date.getMonth() + 1).padLeft(),
  date.getFullYear()].join('/');
})
const formatDateTime = Vue.filter('formatDateTime', function (value) {
  if (!value) return '';
  let date = new Date(value);
  return [date.getDate().padLeft(), (date.getMonth() + 1).padLeft(),
  date.getFullYear()].join('/') + ' ' +
    [date.getHours().padLeft(),
    date.getMinutes().padLeft(),
    date.getSeconds().padLeft()].join(':');
})

Vue.filter('formatDateTime1', function (timestamp) {
  if (timestamp) {
    moment.locale('en');
    // return moment(String(value)).format('MM/DD/YYYY hh:mm')
    return moment.unix(timestamp).format("DD/MM HH:mm");
  }
})

Vue.filter('formatDateTime2', function (timestamp) {
  if (timestamp) {
    moment.locale('en');
    // return moment(String(value)).format('MM/DD/YYYY hh:mm')
    return moment.unix(timestamp).format("DD-MM-YYYY HH:mm");
  }
})

Vue.filter('capitalize', function (value) {
  if (!value) {
    return ''
  }
  value = value.toString();
  return value.charAt(0).toUpperCase() + value.slice(1);
})

Vue.filter('convertTimestampformatDate', function (timestamp, strFormat) {
  if (!timestamp) {
    return ''
  }
  moment.locale('en');
  // var value = new Date(timestamp * 1000).format(strFormat); //value.toString(); mm:ss
  var value = moment(timestamp).format(strFormat);
  return value;
})

Vue.filter('convertSecondToHourMinuteSecond', function (seconds) {
  var seconds = (!seconds || !Number.isInteger(seconds)) ? 0 : seconds;
  return hhmmss(seconds)
})

Vue.filter('convertSecondToHour', function (seconds) {
  var seconds = (!seconds || !Number.isInteger(seconds)) ? 0 : seconds;
  return hmmss(seconds)
})

Vue.filter('formatJsonString', function (value) {
  try {
    let json = JSON.parse(value);
    return buildFormater(json);
  } catch (e) {
    return value;
  }
})

Vue.filter('compiledMarkdown', function (value) {
  if (value) {
    return marked(value, { sanitize: true });
  }
  return value;
})

Vue.filter('getFileNameAttach', function (url) {
  if (url) {
    const matchs = url.match(/([^/]+)\?/);
    return matchs && matchs[1];
  }
})

Vue.filter('getMapUrl', function (url) {
  if (url) {
    url = decodeURIComponent(url);
    return url.replace(/^https:\/\/l.facebook.com\/l.php\?u=/, "");
  }
  return url;
})

function pad(num) {
  return ("0" + num).slice(-2);
}

function hhmmss(secs) {
  var minutes = Math.floor(secs / 60);
  secs = secs % 60;
  var hours = Math.floor(minutes / 60)
  minutes = minutes % 60;
  return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
  // return pad(hours)+":"+pad(minutes)+":"+pad(secs); for old browsers
}

function hmmss(secs) {
  var minutes = Math.floor(secs / 60);
  secs = secs % 60;
  var hours = Math.floor(minutes / 60)
  minutes = minutes % 60;
  return `${hours}:${pad(minutes)}:${pad(secs)}`;
  // return pad(hours)+":"+pad(minutes)+":"+pad(secs); for old browsers
}

function buildFormater(data, tabInput) {
  let viewer = '';
  let tab = tabInput || ``;

  if (typeof data == 'object') {
    var keys = Object.keys(data);
    for (var key in data) {

      keys.shift();
      let isLast = (keys.length == 0);

      let item = data[key];

      if (typeof item == 'string') {
        viewer += `${tab}"${key}" : "${item}"`;
        viewer += (!isLast) ? `,\n` : `\n`;
      } else if (Array.isArray(item)) {
        viewer += `${tab}"${key}" : ${JSON.stringify(item)}`;
        viewer += (!isLast) ? `,\n` : `\n`;
      } else {
        viewer += `"${key}" : {\n`;
        viewer += buildFormater(item, `${tab}    `);
        viewer += `}`;
        viewer += (!isLast) ? `,\n` : `\n`;
      }
    }
    if (!tabInput) {
      return `{\n${viewer}}`;
    } else {
      return viewer;
    }
  }
  return 'data not is json';
}

export default { formatDate, formatDateTime }
