/**
 * Each course has a hierarchy of Course -> Modules -> Sessions.
 * This structure is used for searching through the timetable and for generating a personal timetable.
 * 
 * The program will, given a module and group number, sort through all sessions for that module and select those that match the users group number.
 * 
 *  */

class Course
{
    constructor(id, name, year)
    {
        this.id = id;
        this.name = name;
        this.year = year;
        this.modules = [];
    }
}

class Module
{
    constructor(name)
    {
        this.name = name;

        this.sessions = [];
    }
}

class Session {
    constructor(name, group_id, start_week, start_day, start_date, start_time, end_day, end_date, end_time, duration, staff_members, locations, department, size)
    {
        this.name = name;
        this.group_id = group_id;

        this.start_week = start_week;
        this.start_date = start_date;
        this.start_day = start_day;
        this.start_time = start_time;
        
        this.end_time = end_time;
        this.duration = duration;
        this.staff_members = staff_members;
        this.loctions = locations;
    }
}


/**
 * Each user has a personal hierarchy of Year -> Weeks -> Days.
 * This structure is used for displaying the timetable.
 * 
 * The program will, given the current week number, display each session into the timetable.
 * 
 *  */

class Year 
{
    constructor(year, start_week)
    {
        this.year = year;
        this.start_week = start_week;

        this.weeks = [];
    }
}

class Week
{
    constructor(id, start_date, end_date)
    {
        this.id = id;
        this.start_day = start_date;
        this.end_date = end_date;

        this.days = [];
    }
}

class Day
{
    constructor(id, date)
    {
        this.id = id;
        this.date = date;
        
        this.sessions = [];
    }
}