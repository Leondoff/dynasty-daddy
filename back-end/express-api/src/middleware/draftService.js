import { FetchDraftADP, FetchDraftADPDetails } from '../repository';

export const GetDraftADP = async (draftADPFilters) =>
  FetchDraftADP(draftADPFilters);

export const GetDraftADPDetails = async (draftADPFilters) =>
  FetchDraftADPDetails(draftADPFilters);
