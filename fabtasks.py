"""
Copyright (c) 2014, EDINA,
All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright notice, this
   list of conditions and the following disclaimer in the documentation and/or
   other materials provided with the distribution.
3. All advertising materials mentioning features or use of this software must
   display the following acknowledgement: This product includes software
   developed by the EDINA.
4. Neither the name of the EDINA nor the names of its contributors may be used to
   endorse or promote products derived from this software without specific prior
   written permission.

THIS SOFTWARE IS PROVIDED BY EDINA ''AS IS'' AND ANY EXPRESS OR IMPLIED
WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
SHALL EDINA BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY,
OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
DAMAGE.
"""

import codecs
import requests
import os

from bs4 import BeautifulSoup

from fabric.api import task

from fabfile import _get_source

@task
def generate_countries_list():
    """
    Generate list of countries in the world for map searching.
    """
    url = 'https://raw.githubusercontent.com/mledoze/countries/master/countries.json'
    template = os.path.join(
        _get_source()[0],
        'plugins',
        'map-search',
        'src',
        'templates',
        'map-search-popup.html')

    soup = BeautifulSoup(open(template), "html.parser")
    drop_down = soup.find("select", {"id": "map-search-country-select"})
    drop_down.clear() # remove all existing
    r = requests.get(url)
    countries = r.json()
    for country in countries:
        # append country and country code to map search drop down
        option = soup.new_tag('option', value=country['cca2'])
        option.append(country['name']['common'])
        drop_down.append(option)

    # write to file
    with codecs.open(template, 'w', encoding='utf-8') as f:
        f.write(soup.prettify())
