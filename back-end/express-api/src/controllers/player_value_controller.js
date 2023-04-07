import {
  GetCurrentPlayerValues,
  GetHistoricalPlayerValuesDatapoint,
  GetHistoricalPlayerValuesDatapointByDays,
  GetFantasyPortfolioForInterval,
  GetPlayerValuesForMarket
} from '../repository/PlayerInfoRepository';
import { GetPlayerMetadataByNameId } from '../repository/PlayerMetadataRepository';

/**
 * Get current player values
 * This is the base call for most of the site
 * @param {*} req
 * @param {*} res
 */
export const GetCurrentPlayerValuesEndpoint = async (req, res) => {
  try {
    const data = await GetCurrentPlayerValues();
    res.status(200).json(data.rows);
  } catch (err) {
    res.status(500).json(err.stack);
  }
};

/**
 * Get player values for a specific market
 * This will return just the values for that market
 * @param {*} req
 * @param {*} res
 */
export const GetPlayerValueForMarketEndpoint = async (req, res) => {
  const { market } = req.params || '0';
  try {
    const data = await GetPlayerValuesForMarket(market);
    if (data == null) {
      res.status(400).json(`Unsupported market type: ${market}`);
    }
    res.status(200).json(data.rows);
  } catch (err) {
    res.status(500).json(err.stack);
  }
};

/**
 * Get previous player values by a specifc day interval
 * @param {*} req
 * @param {*} res
 */
export const GetPrevPlayerValuesByDaysEndpoint = async (req, res) => {
  try {
    const { intervalDays } = req.params || 30;
    const data = await GetHistoricalPlayerValuesDatapointByDays(intervalDays);
    res.status(200).json(data.rows);
  } catch (err) {
    res.status(500).json(err.stack);
  }
};

/**
 * Get the previous
 * @param req
 * @param res
 * @return {Promise<void>}
 */
export const GetHistoricalPlayerValueByIdEndpoint = async (req, res) => {
  try {
    const { id } = req.params;
    const { isAllTime } = req.query || 'false';
    // updated where to include all time data if specified
    const data = await GetHistoricalPlayerValuesDatapoint(id, isAllTime);
    res.status(200).json(data.rows);
  } catch (err) {
    res.status(500).json(err.stack);
  }
};

/**
 * query to get player details (metadata + historical value)
 * @param req
 * @param res
 * @return {Promise<void>}
 */
export const GetPlayerDetailsEndpoint = async (req, res) => {
  try {
    const { id } = req.params;
    const valueData = await GetHistoricalPlayerValuesDatapoint(id, 'false');
    const metadata = await GetPlayerMetadataByNameId(id);
    res.status(200).json({
      historicalData: valueData.rows,
      profile: metadata.rows
    });
  } catch (err) {
    res.status(500).json(err.stack);
  }
};

/**
 * fetch the user fantasy portfolio over time based on days and player list
 * @param req
 * @param res
 * @return {Promise<void>}
 */
export const GetPlayerPortfolioEndpoint = async (req, res) => {
  try {
    const { intervalDays, portfolioList } = req.body;
    // eslint-disable-next-line prefer-template, implicit-arrow-linebreak
    const sqlList = '(' + portfolioList.map(str => `'${str.replace('\'', '')}'`).join(', ') + ')';
    const valueData = await GetFantasyPortfolioForInterval(intervalDays, sqlList);
    res.status(200).json(valueData.rows);
  } catch (err) {
    res.status(500).json(err.stack);
  }
};
