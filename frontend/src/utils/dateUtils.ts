/**
 * Utility functions for date formatting
 */

export const formatDay = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleDateString('nl-NL', {
        weekday: 'short'
    }).toUpperCase();
};

export const formatDateDay = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleDateString('nl-NL', {
        day: 'numeric'
    });
};

export const formatMonth = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleDateString('nl-NL', {
        month: 'short'
    }).toUpperCase();
};

export const formatTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleTimeString('nl-NL', {
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const formatDate = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleDateString('nl-NL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};