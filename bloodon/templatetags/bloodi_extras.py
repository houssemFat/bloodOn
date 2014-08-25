from string import lower, split

from django import template

#tr_msg_dic
#from django.utils import simplejson
register = template.Library()

@register.filter
def get_tr_value(dictionary, arg):
    #return dictionary
    if arg:
        value_ = str(arg)
	try :
            return dictionary[value_] #arg#simplejson.dumps(value)
        except ValueError:
            return ''
    else :
        return  ''

@register.filter
def get_form_error(dictionary, arg):
    if arg :
        try :
            string = split (lower (str(arg)), '#')
            error_key = string[0]
            error_field = dictionary [error_key]
            error_code = dictionary [string[1]]
            return ' '.join ([ error_code, error_field])
        except ValueError:
            return ''
    else :
        return  ''

@register.filter
def format_phone(number):
    format_ = '## ### ###'
    length = len (number)
    format_length = len (format_)
    formatted  = ''
    i = 0
    j = 0
    while (j < length and i < format_length):
        if (format_[i] == '#'):
            formatted +=  number[j]
            j +=1
        else:
            formatted += ' '
        i += 1
    return formatted
