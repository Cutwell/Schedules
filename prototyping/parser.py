#  parser.py - a text parsing program to generate html timetables

#  used to read csv timetable
import csv

#  used to store timetable after processing
import pickle

#  used to check if timetable has already been processed
import os.path

#  used to calculate week number
from datetime import datetime, timedelta, date
import time


'''

timetable_list = [
    #[ 
    # ["Week N (YYYY-MM-DD - YYYY-MM-DD)"],
    # ["Name","Start week","Start day","Start date","Start time","End day","End date","End time","Duration","Staff member(s)","Location(s)","Department","Size"],
    #]
]

'''

#  template html for a table to display the timetable
template_html = """
<html>
    <table width="600">
        <tr>
            <td align="center"> 
                <table align="center" border="0" cellspacing="0" cellpadding="10" style="border:1px solid #ccc;">
                    {events}
                </table>
            </td>
        </tr>
    </table>
</html>
"""

#  template html for a table entry
template_event = "<tr> <td>{day}</td> <td>{name}</td> <td>{start_time}</td> <td>{end_time}</td> <td>{teacher}</td> <td>{location}</td> </tr>"

#  get group numbers
def getGroupings():
    groupings = []

    with open("groups", "r") as group_file:
        group_raw = group_file.read()
        
        #  read groups file into list
        group_list = group_raw.replace("\n", "").split(",")
        
        #  create tuples of (module name, group number)
        for index in range( 1, len(group_list), 2 ):
            groupings.append( ( group_list[index-1], group_list[index] ) )

    return groupings

#  parse timetable
def getTimetables():
    with open("timetable.csv", "r") as timetable_file:
        timetable_list_raw = csv.reader(timetable_file, delimiter=',')

        timetable_list = []
        new_week = []

        #  split timetable into sublists at each empty list (indicating a new week)
        for row in timetable_list_raw:
            if row == []:
                timetable_list.append(new_week)
                new_week = []
            else:
                new_week.append(row)

    return timetable_list

def parseWeek(week, groupings):
    #  ignore headers and week info
    timetable = week[2:]

    matched_events = []

    for entry in timetable:        
        for name, number in groupings:

            #  get events that match module name + group number
            if entry[0].find(name) != -1 and entry[0].find(number) != -1:
                matched_events.append(entry)
                break

            #  get events that contain term "Lecture"
            elif entry[0].find("Lecture") != -1:
                matched_events.append(entry)
                break

    filtered_events = []
    for event in matched_events:
        #  filter out unnecessary info
        filtered_events.append( [ event[0], event[2], event[4], event[7], event[9], event[10] ] )

    return filtered_events

def generateTable(event_list):
    html_event_list = []

    #  create list of hmtl timetable table elements
    for event in event_list:
        html_event = template_event.format( day = event[1], name = event[0], start_time = event[2], end_time = event[3], teacher = event[4], location = event[5] )
        html_event_list.append(html_event)

    #  add event list to html table
    html_table = template_html.format( events = "".join(html_event_list) )

    return html_table

def loadTimetable():
    #  if timetable is already processed
    if os.path.isfile("timetable"):
        #  load timetable
        with open ('timetable', 'rb') as file:
            timetable_list = pickle.load(file)
    else:
        #  else load timetable from csv
        timetable_list = getTimetables()

        #  and save to file
        with open('timetable', 'wb') as file:
            pickle.dump(timetable_list, file)

    return timetable_list

def getWeek(week_number):
    #  load module groupings and timetable
    groupings = getGroupings()
    timetable_list = loadTimetable()

    #  get timetable and week header info
    week_header = timetable_list[week_number][0]
    event_list = parseWeek( timetable_list[week_number], groupings )

    #  generate html from info
    html_table = generateTable( event_list )

    return html_table, week_header

if __name__ == "__main__":
    start_of_term = date(2018, 9, 17)

    now = datetime.now()
    current_date = date(now.year, now.month, now.day)

    last_monday = (current_date - timedelta(days=current_date.weekday()))

    week_number = int( (last_monday - start_of_term).days / 7 )

    html_table, week_header = getWeek(week_number)

    print(html_table, week_header)