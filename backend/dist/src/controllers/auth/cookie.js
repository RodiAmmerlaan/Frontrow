"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setRefreshCookie = setRefreshCookie;
exports.clearRefreshCookie = clearRefreshCookie;
exports.getRefreshCookie = getRefreshCookie;
/**
 * Sets a refresh token cookie in the response
 * @param response - Express response object
 * @param rawToken - The refresh token to store in the cookie
 * @param maxAgeDays - The number of days until the cookie expires
 */
function setRefreshCookie(response, rawToken, maxAgeDays) {
    response.cookie('refresh_token', rawToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: maxAgeDays * 24 * 60 * 60 * 1000,
        path: '/auth'
    });
}
/**
 * Clears the refresh token cookie from the response
 * @param response - Express response object
 */
function clearRefreshCookie(response) {
    response.clearCookie('refresh_token', { path: '/auth' });
}
/**
 * Extracts the refresh token from the request cookies
 * @param request - Express request object
 * @returns The refresh token if found, or null if not present
 */
function getRefreshCookie(request) {
    return request.headers.cookie?.split("refresh_token=")[1] || null;
}
//# sourceMappingURL=cookie.js.map