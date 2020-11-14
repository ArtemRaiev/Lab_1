const { basename } = require('path');

/**
 * Set this variable to *true* to disable debug logging in all files at once
 */
const disableAllDebug = false;

/** @type {(date: Date) => string} */
const getDate = (() => {
  const monthNames = [
    'January', 'February', 'March',
    'April', 'May', 'June', 'July',
    'August', 'September', 'October',
    'November', 'December'
  ];

  return (date) => {
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    return `${day}-${monthNames[month]}-${year}`;
  };
})();

/** @type {(date: Date) => string} */
const getTime = (date) => {
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  let hours = date.getHours();
  const isAM = hours < 12;
  hours %= 12;
  hours = hours === 0 ? 12 : hours;

  return `${hours}:${minutes}:${seconds} ${isAM ? 'AM' : 'PM'}`;
};

/** @type {() => string} */
const getTimestamp = () => {
  const date = new Date();
  return `${getDate(date)} | ${getTime(date)}`;
};

/**
 * @param {string} filePath
 * @param {boolean} debuggerEnable
 * @returns {Logger}
 */
const createConsoleLogger = (filePath, debuggerEnable) => {
  const fileName = basename(filePath);

  return {
    log: msg => console.log(`${getTimestamp()} [${fileName}]: ${msg}`),
    error: msg => console.error(`ERROR! ${getTimestamp()} [${fileName}]: ${msg}`),
    debug: msg => {
      if (!disableAllDebug && debuggerEnable) {
        console.log(`DEBUG ${getTimestamp()} [${fileName}]: ${msg}`);
      }
    }
  };
};


module.exports = createConsoleLogger;


/**
 * @typedef {object} Logger
 * @property {(msg: string | object) => void} log
 * @property {(msg: string | object) => void} error
 * @property {(msg: string | object) => void} debug
 */
