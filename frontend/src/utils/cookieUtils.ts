/**
 * Gets a cookie value by name
 * @param name - The name of the cookie to retrieve
 * @returns The cookie value or null if not found
 */
export function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop()?.split(';').shift() || null;
    }
    return null;
}

/**
 * Checks if a cookie exists
 * @param name - The name of the cookie to check
 * @returns True if the cookie exists, false otherwise
 */
export function hasCookie(name: string): boolean {
    return getCookie(name) !== null;
}