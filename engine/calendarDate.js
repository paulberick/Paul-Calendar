/**
 * Paul's Calendar Date
 *
 * Simple immutable calendar date.
 */
export class CalendarDate {

    constructor(year, month, day){

        this.year = year;
        this.month = month;
        this.day = day;

        Object.freeze(this);

    }

}