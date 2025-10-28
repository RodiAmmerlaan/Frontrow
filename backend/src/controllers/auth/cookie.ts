import { Request, Response } from 'express';

/**
 * Sets a refresh token cookie in the response
 * @param response - Express response object
 * @param rawToken - The refresh token to store in the cookie
 * @param maxAgeDays - The number of days until the cookie expires
 */
export function setRefreshCookie(response: Response, rawToken: string, maxAgeDays: number) {
    response.cookie('refresh_token', rawToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: maxAgeDays * 24 * 60 * 60 * 1000,
        path: '/'
    });
}

/**
 * Clears the refresh token cookie from the response
 * @param response - Express response object
 */
export function clearRefreshCookie(response: Response) {
    response.clearCookie('refresh_token', { path: '/' });
}

/**
 * Extracts the refresh token from the request cookies
 * @param request - Express request object
 * @returns The refresh token if found, or null if not present
 */
export function getRefreshCookie(request: Request) {
    return request.cookies?.refresh_token || null;
}