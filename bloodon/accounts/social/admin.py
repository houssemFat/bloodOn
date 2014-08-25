from django.contrib import admin

from .models import SocialAccount, SocialToken

class SocialAccountAdmin(admin.ModelAdmin):
    search_fields = ('user__username', )
    raw_id_fields = ('user',)
    list_display = ('user', 'uid', 'provider')
    list_filter = ('provider',)


class SocialTokenAdmin(admin.ModelAdmin):
    raw_id_fields = ( 'account',)
    list_display = ( 'account', 'truncated_token', 'expires_at', 'token_secret')
    list_filter = ('expires_at',)

    def truncated_token(self, token):
        max_chars = 40
        ret = token.token
        if len(ret) > max_chars:
            ret = ret[0:max_chars] + '...(truncated)'
        return ret
    truncated_token.short_description = 'Token'

admin.site.register(SocialToken, SocialTokenAdmin)
admin.site.register(SocialAccount, SocialAccountAdmin)
