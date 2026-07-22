export const COOKIE_NAME = "mwangagrid_session";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const AXIOS_TIMEOUT_MS = 30_000;
export const UNAUTHED_ERR_MSG = "Please login (10001)";
export const NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";
export const RATE_LIMIT_WINDOW = 60 * 1000;
export const RATE_LIMIT_MAX = 60;

export const COMPANY = {
  name: "Mwanga Grid",
  tagline: "Powering Your Digital Future",
  email: "cheidaniells@gmail.com",
  phone: "+254 750 110 836",
  address: "Roasters next to Naivasha Mountain Mall",
  city: "Nairobi",
  postalCode: "P.O Box 8117 00100 NRB",
  domain: "www.mwangagrid.co.ke",
} as const;
