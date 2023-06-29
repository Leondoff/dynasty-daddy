const axios = require('axios');
const xmlJs = require('xml-js');

function nativeType(value) {
  const nValue = Number(value);
  if (!Number.isNaN(nValue)) {
    return nValue;
  }
  const bValue = value.toLowerCase();
  if (bValue === 'true') {
    return true;
  } if (bValue === 'false') {
    return false;
  }
  return value;
}

const removeJsonTextAttribute = function (value, parentElement) {
  try {
    const parentOfParent = parentElement._parent;
    const pOpKeys = Object.keys(parentOfParent);
    const keyNo = pOpKeys.length;
    const keyName = pOpKeys[keyNo - 1];
    const arrOfKey = parentOfParent[keyName];
    const arrOfKeyLen = arrOfKey.length;
    if (arrOfKeyLen > 0) {
      const arr = arrOfKey;
      const arrIndex = arrOfKey.length - 1;
      arr[arrIndex] = value;
    } else {
      parentOfParent[keyName] = nativeType(value);
    }
  } catch (e) {}
};

const options = {
  compact: true,
  nativeType: false,
  textFn: removeJsonTextAttribute
};

const sendFFPCRequest = async (leagueId, metadata, callType, res) => {
  await axios.get(`https://myffpc.com/FFPC${callType}.ashx?leagueid=${leagueId}${metadata}`)
    .then((response) => {
      const responseJSON = xmlJs.xml2json(`<root>${response.data}</root>`, options);
      res.status(response.status).json(JSON.parse(responseJSON));
    })
    .catch((err) => {
      res.status(500);
    });
};

export const GetFFPCLeagueEndpoint = async (req, res) => {
  const { leagueId, year } = req.query;
  return sendFFPCRequest(leagueId, `&Season=${year}`, 'LeagueInfo', res);
};

export const GetFFPCRostersEndpoint = async (req, res) => {
  const { leagueId, year } = req.query;
  return sendFFPCRequest(leagueId, `&Season=${year}`, 'LeagueRosters', res);
};

export const GetFFPCStandingsEndpoint = async (req, res) => {
  const { leagueId, year } = req.query;
  return sendFFPCRequest(leagueId, `&Season=${year}`, 'LeagueStandings', res);
};

export const GetFFPCScheduleEndpoint = async (req, res) => {
  const { leagueId, year } = req.query;
  return sendFFPCRequest(leagueId, `&Season=${year}`, 'LeagueMatchups', res);
};

export const GetFFPCLeagueTransactionsEndpoint = async (req, res) => {
  const { leagueId, year } = req.query;
  return sendFFPCRequest(leagueId, `&Season=${year}`, 'WaiversReport', res);
};

export const GetFFPCDraftEndpoint = async (req, res) => {
  const { leagueId } = req.query;
  return sendFFPCRequest(leagueId, '', 'LeagueDraftPicks', res);
};

export const GetFFPCUserLeaguesEndpoint = async (req, res) => {
  const { email, year } = req.query;
  await axios.get(`https://myffpc.com/FFPCUsersLeagues.ashx?email=${email}&Season=${year}`)
    .then((response) => {
      const responseJSON = xmlJs.xml2json(`<root>${response.data}</root>`, options);
      res.status(response.status).json(JSON.parse(responseJSON));
    })
    .catch((err) => {
      res.status(500).json(err);
    });
};
