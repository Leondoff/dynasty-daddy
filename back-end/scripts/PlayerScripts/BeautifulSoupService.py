import requests
from bs4 import BeautifulSoup


##########################
# Beautiful Soup Service #
##########################

# Set up a beautiful soup scraper
def setUpSoup(url):
    # URL to scrape data uses requests import
    page = requests.get(url)

    # Set up scraper
    return BeautifulSoup(page.content, 'html.parser')
