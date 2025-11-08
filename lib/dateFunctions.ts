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


export const isLocalDateTime = ({ date, time, dateTime }: { date?: string, time?: string, dateTime?: string }): string => {

    if (dateTime) {
        const utcDate = new Date(dateTime);

        // Adjust back to IST (Subtract 5.5 hours)
        const istDate = new Date(utcDate.getTime() - (5.5 * 60 * 60 * 1000));

        // Format the corrected IST date
        const formattedDate = istDate.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });

        const formattedTime = istDate.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });

        return `${formattedDate} ${formattedTime}`;
    }

    if (date) {
        const utcDate = new Date(date);

        // Adjust back to IST (Subtract 5.5 hours)
        const istDate = new Date(utcDate.getTime() - (5.5 * 60 * 60 * 1000));

        // Format the corrected IST date
        const formattedDate = istDate.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });

        return formattedDate;
    }

    if (time) {
        const utcDate = new Date(time);

        // Adjust back to IST (Subtract 5.5 hours)
        const istDate = new Date(utcDate.getTime() - (5.5 * 60 * 60 * 1000));

        const formattedTime = istDate.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });

        return formattedTime;
    }

    const newDate = new Date().toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });

    return newDate;
}


export const formatForDateTimeLocal = (value?: string) => {
    if (!value) return "";

    const date = new Date(value);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
};
