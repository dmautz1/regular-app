/**
 * Get a list of all available timezones
 * @returns {string[]} Array of timezone strings
 */
export const getTimezones = () => {
    return Intl.supportedValuesOf('timeZone');
};

/**
 * Get the user's current timezone
 * @returns {string} Current timezone string
 */
export const getUserTimezone = () => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

/**
 * Format a date in the user's timezone
 * @param {Date|string} date - Date to format
 * @param {string} timezone - Timezone to use
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDateInTimezone = (date, timezone, options = {}) => {
    const defaultOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
    };

    return new Intl.DateTimeFormat('en-US', {
        ...defaultOptions,
        ...options,
        timeZone: timezone
    }).format(new Date(date));
}; 