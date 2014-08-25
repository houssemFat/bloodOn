from calendar import monthrange
from itertools import groupby
from django.utils import formats
import datetime
from django.utils.safestring import mark_safe
from django.utils.translation import gettext_lazy as _
from bloodon.alerts.models import Alert
from base64 import decode

weekdays = {0: 'mon', 1: 'tue', 2: 'wed', 3: 'thu', 4: 'fri', 5: 'sat', 6: 'sun'}
weekTDays = {0: 'Monday', 1: 'Tuesday', 2: 'Wednesday', 3: 'Thursday', 4: 'Friday', 5: 'Saturday', 6: 'Sunday'}

def calendar_events(request):
    """
    Show calendar of events this month
    """
    lToday = datetime.datetime.now()
    calendar = AlertCalendar()
    return {'Calendar': mark_safe(calendar)}


class AlertCalendar(object):

    def __init__(self, date=datetime.datetime.now()):
        self.start = date
        currentMonth = date.month
        currentYear = date.year
        currentDay = date.day
        self.idOfToday = str (currentDay) + '_' + str(currentMonth)
        totalDaysOfMonth = monthrange(currentYear,  currentMonth)[1]
        previousYear = currentYear
        nextYear = currentYear
        previousMonth = currentMonth - 1
        nextMonth = currentMonth + 1
        if currentMonth == 1:
            previousMonth = 12
            previousYear = currentYear - 1
        if currentMonth == 12:
            nextMonth = 1
            nextYear = currentYear + 1
        totalDaysNextMonth = monthrange(nextYear,  nextMonth)[1]
        totalDaysPreviousMonth = monthrange(previousYear,  previousMonth)[1]
        if currentDay > 2:
            _from = datetime.date(currentYear, currentMonth, currentDay)
        else:
            _from = datetime.date(previousYear, previousMonth, totalDaysPreviousMonth)
        end = datetime.date(nextYear, nextMonth, min(currentDay, totalDaysNextMonth))
        # self.get_alerts(_from, end)
        string = self.buildHeader()
        starWeek = date.weekday()
        total = 1

        # before today
        if starWeek > 0:
            for i in xrange(starWeek, 0, -1):
                #
                if currentDay > i:
                    day = currentDay - i
                    year = currentYear
                    month = currentMonth
                else:
                    day = totalDaysPreviousMonth - i + 1
                    year = previousYear
                    month = previousMonth
                string += self.appendNewDay(day, month, year, 'pass')
                if total % 7 == 0:
                    string += '</div><div  class="row">'
                total += 1
        # current month today
        for i in range(currentDay, totalDaysOfMonth + 1):
            string += self.appendNewDay(i, currentMonth, currentYear, 'current')
            if total % 7 == 0:
                    string += '</div><div class="row">'
            total += 1

        if total < 36:
            for i in range(1, totalDaysNextMonth):
                string += self.appendNewDay(i, nextMonth, nextYear, 'next')
                if total % 7 == 0:
                    string += '</div><div  class="row">'
                total += 1
                if total == 36:
                    break
        self.html = string + '</div>'

    # get alert by date
    def get_alerts(self, start, end):
        alerts = Alert.objects.filter(date_for__gte=start, date_for__lte=end)
        # group_by_day(home)
        field = lambda alert: str(alert.date_for.day) + '_' + str(alert.date_for.month)
        self.alerts = dict(
            [(day, list(items)) for day, items in groupby(alerts, field)]
        )

    def buildHeader(self):
        string = '<div class="header row">'
        for day in weekdays:
            string += '<div class="weekday cell cell-header">%s</div>' % _(weekTDays[day])
        return string + '</div><div  class="row"> '

    def appendNewDay(self, day, month, year, className):
        id = str(day) + '_' + str(month)
        htmlId = str(day) + '/' + str(month) + '/' + str(year)
        toAdd = ''
        #title = ''
        # FIXME
        """
        if id in self.alerts:
            className += ' event'
            #title = formats.date_format(datetime.date(year, month, day), "DATE_FORMAT", True).encode('utf-8')
            toAdd = '<div class="alert-event"> %d </div>' %  len(self.alerts[id])
        """
        if id == self.idOfToday:
            className += ' today'
        return '<div class="cell cell-day %s" id="%s">%s%d</div>' % (className, htmlId, toAdd, day)

    def __str__(self):
        return self.html
