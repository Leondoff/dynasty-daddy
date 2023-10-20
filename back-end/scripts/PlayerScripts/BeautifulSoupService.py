import requests
from bs4 import BeautifulSoup

##########################
# Beautiful Soup Service #
##########################

# Set up a beautiful soup scraper
def setUpSoup(url):
    # URL to scrape data uses requests import
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'}
    page = requests.get(url, headers=headers)
    
    # Set up scraper
    return BeautifulSoup(page.content, 'html.parser')
