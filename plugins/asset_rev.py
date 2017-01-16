import math
import re
from hyde.plugin import Plugin
import json
import os
from jinja2 import (
    contextfunction
)
from commando.util import getLoggerWithNullHandler
logger = getLoggerWithNullHandler('hyde.engine')

with open('rev-manifest.json', 'r') as f:
    asset_manifest = json.load(f)

@contextfunction
def media_url_rev(context, path, safe=None):
    if path in asset_manifest:
        path = asset_manifest[path]
    return context['site'].media_url(path, safe)
    
class AssetRevPlugin(Plugin):

    def template_loaded(self, template):
        template.env.globals['media_url_rev'] = media_url_rev