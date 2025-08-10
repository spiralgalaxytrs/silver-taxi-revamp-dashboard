export const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // Adjust for local timezone
    return now.toISOString().slice(0, 16); // Format as `YYYY-MM-DDTHH:MM`
};
export const getMinDate = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // Adjust for local timezone
    return now.toISOString().slice(0, 10); // Format as `YYYY-MM-DD`
};

export const getMaxDateTime = () => {
    const future = new Date();
    future.setDate(future.getDate() + 90); // Allow booking up to 30 days in advance
    future.setMinutes(future.getMinutes() - future.getTimezoneOffset());
    return future.toISOString().slice(0, 16);
};


export const dateRangeFilter = (row: any, columnId: any, filterValue: any) => {
    if (!filterValue || filterValue.length !== 2) return true;

    const rowDate = new Date(row.original[columnId] || "");
    rowDate.setHours(0, 0, 0, 0);

    const startDate = filterValue[0] ? new Date(filterValue[0]) : null;
    const endDate = filterValue[1] ? new Date(filterValue[1]) : null;

    if (startDate) startDate.setHours(0, 0, 0, 0);
    if (endDate) endDate.setHours(0, 0, 0, 0);

    return (
        (!startDate || rowDate >= startDate) &&
        (!endDate || rowDate <= endDate)
    );
};


