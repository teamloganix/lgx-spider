/**
 * Pass-through JWT cookie middleware for Spider.
 * Sets req.user = null when no token. Replace with real auth later.
 */
export default function jwtCookie() {
  return function (req, _res, next) {
    req.user = null;
    next();
  };
}
