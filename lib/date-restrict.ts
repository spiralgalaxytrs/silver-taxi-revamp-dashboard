const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // Adjust for local timezone
    return now.toISOString().slice(0, 16); // Format as `YYYY-MM-DDTHH:MM`
};
const getMinDate = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // Adjust for local timezone
    return now.toISOString().slice(0, 10); // Format as `YYYY-MM-DD`
};

const getMaxDateTime = () => {
    const future = new Date();
    future.setDate(future.getDate() + 90); // Allow booking up to 30 days in advance
    future.setMinutes(future.getMinutes() - future.getTimezoneOffset());
    return future.toISOString().slice(0, 16);
};

export { getMinDateTime, getMaxDateTime, getMinDate };
