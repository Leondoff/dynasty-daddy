FROM python:3.8.8
RUN apt-get update && apt-get -y install cron vim

WORKDIR /app
COPY back-end/scripts/KTCScraperScript/requirements.txt /app/requirements.txt
RUN pip install -r requirements.txt

RUN echo "00 8 * * * /usr/local/bin/python /app/ktc-rankings-scraper.py >> /var/log/cron.log 2>&1" >> /etc/cron.d/ktc-crontab
COPY back-end/scripts/KTCScraperScript/ktc-rankings-scraper.py /app/ktc-rankings-scraper.py
COPY back-end/scripts/KTCScraperScript/FantasyProsADPScraper.py /app/FantasyProsADPScraper.py
COPY back-end/scripts/KTCScraperScript/PlayerService.py /app/PlayerService.py
COPY back-end/scripts/KTCScraperScript/BeautifulSoupService.py /app/BeautifulSoupService.py
COPY back-end/scripts/KTCScraperScript/MFLPlayerService.py /app/MFLPlayerService.py
COPY back-end/scripts/KTCScraperScript/FantasyCalcService.py /app/FantasyCalcService.py
COPY back-end/scripts/KTCScraperScript/DynastyProcessService.py /app/DynastyProcessService.py
COPY back-end/scripts/KTCScraperScript/DynastySuperflexService.py /app/DynastySuperflexService.py
COPY back-end/scripts/KTCScraperScript/Constants.py /app/Constants.py

# execution rights to cron
RUN chmod 0644 /etc/cron.d/ktc-crontab
# Apply cron job
RUN touch /var/log/cron.log
RUN crontab /etc/cron.d/ktc-crontab

CMD printenv > /etc/environment && cron && tail -f /var/log/cron.log
