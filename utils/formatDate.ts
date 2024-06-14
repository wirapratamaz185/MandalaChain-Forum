// utils/formatDate.ts
export const formatDate = (date: string | Date): string => {
    const dateObj = new Date(date);
    return dateObj.toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};