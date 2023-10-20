/* eslint-disable no-plusplus */
export function CleanStringForLeagueName(inputString) {
    return inputString.replace(/[^a-zA-Z0-9() ]/g, '');
  }
