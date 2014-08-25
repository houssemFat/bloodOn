import math

from django.utils  import translation 

def getQueryInside(latitude, longitude, radius):
    #
    """
        please follow this two link to show how to check if a point
        is inside a geographic circle
        http://www.movable-type.co.uk/scripts/latlong-db.html
        http://sgowtham.net/journal/2009/08/08/mysql-finding-locations-nearest-to-a-given-pair-of-gps-coordinates/
    """
    # first-cut bounding box (in degrees)
    R = 6371
    maxLat = latitude + math.degrees(radius/R)
    minLat = latitude - math.degrees(radius/R)
    # compensate for degrees longitude getting smaller with increasing latitude
    maxLon = longitude + math.degrees(radius/R/math.cos(math.radians(latitude)))
    minLon = longitude - math.degrees(radius/R/math.cos(math.radians(latitude)))

    queryCircumference = "Select id, latitude, longitude, name " \
                         "From system_organization  " \
                         "Where latitude Between %s And %s " % (minLat, maxLat)
    queryCircumference += "And longitude Between %s And %s" % (minLon, maxLon)


    query = "select id, latitude , longitude, name, " \
            + getDistanceQuery(latitude, longitude) + \
            " As D"
    query += " From ( " + queryCircumference + ") As FirstCut "

    query += "Where " + \
             getDistanceQuery(latitude, longitude) + \
             " < %s " % radius
    query += "Order by D;"
    return query


def getDistanceQuery(latitude, longitude):
    query = "((2 * 3960 * " \
            "ATAN2(" \
            "SQRT(" \
            "POWER(SIN((RADIANS(%s - latitude))/2), 2) +" \
            " COS(RADIANS(latitude)) *" \
            " COS(RADIANS(%s )) *" \
            " POWER(SIN((RADIANS(%s - longitude))/2), 2)" \
            " )," \
            " SQRT(1-(" \
            " POWER(SIN((RADIANS(%s - latitude))/2), 2) +" \
            " COS(RADIANS(latitude)) *" \
            " COS(RADIANS(%s)) *" \
            " POWER(SIN((RADIANS(%s - longitude))/2), 2)" \
            " ))" \
            " )" \
            " ))" % (latitude, latitude, longitude, latitude, latitude, longitude)
    return query

def get_view_type (request):
    try :
        type =  request.GET['view_type']
        request.session['view_type'] = type
    except :
        try :
            type = request.session['view_type']
        except :
            type = 'time_line'     
    return type 

def set_lang(request):
    return ''
    if request.user.is_authenticated():
        profile = request.user.userprofile
        try :
            lang_code = profile.lang
            if lang_code and translation.check_for_language(lang_code):
                request.session['django_language'] = lang_code
            else :
                response.set_cookie(settings.LANGUAGE_COOKIE_NAME, lang_code)
            return ''
        except :
            return ''
    return ''

def search_organization_arround(request):
    latitude = float('36.721273880045004')
    longitude = float('10.184326171875')    
    try :
        latitude = float(request.GET['lat'])
        longitude = float(request.GET['lng'])
    except  :
        x = 2
    radius = float(50000)
    try :
        radius = float(request.GET['radius'])
    except :
        x = 1
    # save user data
    request.session['map_user_session'] = '%s#%s#%s' % (latitude, longitude, radius)
    # convert data radius to kilometre
    kmRadius = (radius / 1000)

    from django.db import connection
    # get query of calculation math arround
    query = getQueryInside(latitude, longitude, kmRadius)
    cursor = connection.cursor()
    return excecute_organization_fetch_query (cursor, query)


def search_organization_bound (request):
    """
        search all home that organization coordinates are
    :param request:
        in the square represented by :
        west < longitude < east
        north < latitude < south
    """
    w = float(request.GET['w'])
    e = float(request.GET['e'])
    n = float(request.GET['n'])
    s = float(request.GET['s'])
    query = "select id, latitude , longitude, name from system_organization where  " \
            "(latitude BETWEEN %s AND %s) AND" \
            " (longitude BETWEEN %s AND %s );" % (min(s, n), max(s, n), min(w, e), max(w, e))
    from django.db import connection
    cursor = connection.cursor()
    return excecute_organization_fetch_query (cursor, query)
   
def excecute_organization_fetch_query (cursor, query):
     # Data retrieval operation - no commit required
    cursor.execute(query)
    organizations = cursor.fetchall()
    ids = {}

    for organization in organizations:
        ids[organization[0]] = {'lat' : organization[1], 'lng' : organization[2] , 'name' : organization[3]  }
    return ids