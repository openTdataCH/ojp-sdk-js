export class DateHelpers {
    // 2021-06-03 21:38:04
    static formatDate(d) {
        const date_parts = [
            d.getFullYear(),
            '-',
            ('00' + (d.getMonth() + 1)).slice(-2),
            '-',
            ('00' + d.getDate()).slice(-2),
            ' ',
            ('00' + d.getHours()).slice(-2),
            ':',
            ('00' + d.getMinutes()).slice(-2),
            ':',
            ('00' + d.getSeconds()).slice(-2)
        ];
        return date_parts.join('');
    }
    // 21:38
    static formatTimeHHMM(d) {
        const dateFormatted = DateHelpers.formatDate(d);
        return dateFormatted.substring(11, 16);
    }
    static formatDistance(distanceMeters) {
        if (distanceMeters > 1000) {
            const distanceKmS = (distanceMeters / 1000).toFixed(1) + 'km';
            return distanceKmS;
        }
        return distanceMeters + 'm';
    }
}
