/**
 * Utility functions for working with cron expressions
 */

/**
 * Convert cron expression to human-readable text
 * 
 * @param {string} cronExpression - The cron expression (e.g. "0 9 * * 1,3,5")
 * @returns {string} Human-readable description
 */
export const formatCronToHumanReadable = (cronExpression) => {
  try {
    const parts = cronExpression.split(' ');
    if (parts.length < 5) return 'Invalid schedule';

    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

    // Time parsing
    let timeStr = '';
    if (hour === '*' && minute === '*') {
      timeStr = 'Throughout the day';
    } else if (hour === '*') {
      timeStr = `Every hour at ${minute} minutes`;
    } else if (minute === '0') {
      const hourNum = parseInt(hour);
      const period = hourNum >= 12 ? 'PM' : 'AM';
      const hour12 = hourNum % 12 === 0 ? 12 : hourNum % 12;
      timeStr = `${hour12} ${period}`;
    } else {
      const hourNum = parseInt(hour);
      const minuteNum = parseInt(minute);
      const period = hourNum >= 12 ? 'PM' : 'AM';
      const hour12 = hourNum % 12 === 0 ? 12 : hourNum % 12;
      timeStr = `${hour12}:${minuteNum.toString().padStart(2, '0')} ${period}`;
    }

    // Days parsing
    let daysStr = '';
    if (dayOfWeek === '*') {
      daysStr = 'every day';
    } else {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const days = dayOfWeek.split(',').map(d => {
        // Convert 0-6 to day names
        return dayNames[parseInt(d)];
      });
      
      if (days.length === 1) {
        daysStr = `every ${days[0]}`;
      } else if (days.length === 2) {
        daysStr = `every ${days[0]} and ${days[1]}`;
      } else {
        const lastDay = days.pop();
        daysStr = `every ${days.join(', ')} and ${lastDay}`;
      }
    }

    return `${timeStr}, ${daysStr}`;
  } catch (error) {
    console.error('Error parsing cron expression:', error);
    return 'Scheduled activity';
  }
};

/**
 * Get a simple time string from a cron expression
 * 
 * @param {string} cronExpression - The cron expression
 * @returns {string} Time string (e.g. "9:00 AM")
 */
export const getTimeFromCron = (cronExpression) => {
  try {
    const parts = cronExpression.split(' ');
    if (parts.length < 2) return 'Scheduled';

    const [minute, hour] = parts;
    
    // Handle special cases
    if (hour === '*' && minute === '*') {
      return 'Multiple times';
    }
    
    if (hour === '*') {
      return `Every hour`;
    }
    
    // Convert to 12-hour format with AM/PM
    const hourNum = parseInt(hour);
    const minuteNum = parseInt(minute);
    const period = hourNum >= 12 ? 'PM' : 'AM';
    const hour12 = hourNum % 12 === 0 ? 12 : hourNum % 12;
    
    if (minuteNum === 0) {
      return `${hour12} ${period}`;
    }
    
    return `${hour12}:${minuteNum.toString().padStart(2, '0')} ${period}`;
  } catch (error) {
    return 'Scheduled';
  }
}; 