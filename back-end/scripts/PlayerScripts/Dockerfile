FROM python:3.8.8
RUN apt-get update && apt-get -y install cron vim

WORKDIR /app
COPY back-end/scripts/PlayerScripts/requirements.txt /app/requirements.txt
RUN pip install -r requirements.txt

RUN echo "00 8 * * * /usr/local/bin/python /app/DailyCronJob.py >> /var/log/cron.log 2>&1" >> /etc/cron.d/ktc-crontab
RUN echo "00 4 * * * /usr/local/bin/python /app/TradeDatabaseService.py >> /var/log/cron.log 2>&1" >> /etc/cron.d/trade-crontab
COPY back-end/scripts/PlayerScripts/DailyCronJob.py /app/DailyCronJob.py
COPY back-end/scripts/PlayerScripts/FantasyProsADPScraper.py /app/FantasyProsADPScraper.py
COPY back-end/scripts/PlayerScripts/PlayerService.py /app/PlayerService.py
COPY back-end/scripts/PlayerScripts/BeautifulSoupService.py /app/BeautifulSoupService.py
COPY back-end/scripts/PlayerScripts/MFLPlayerService.py /app/MFLPlayerService.py
COPY back-end/scripts/PlayerScripts/FantasyCalcService.py /app/FantasyCalcService.py
COPY back-end/scripts/PlayerScripts/DynastyProcessService.py /app/DynastyProcessService.py
COPY back-end/scripts/PlayerScripts/DynastySuperflexService.py /app/DynastySuperflexService.py
COPY back-end/scripts/PlayerScripts/Constants.py /app/Constants.py
COPY back-end/scripts/PlayerScripts/PlayerGridService.py /app/PlayerGridService.py
COPY back-end/scripts/PlayerScripts/InsertNonOffensePlayersService.py /app/InsertNonOffensePlayersService.py
COPY back-end/scripts/PlayerScripts/KeepTradeCutService.py /app/KeepTradeCutService.py
COPY back-end/scripts/PlayerScripts/TradeDatabaseService.py /app/TradeDatabaseService.py

# execution rights to cron
RUN chmod 0644 /etc/cron.d/ktc-crontab
RUN chmod 0644 /etc/cron.d/trade-crontab
# Apply cron job
RUN touch /var/log/cron.log
RUN crontab /etc/cron.d/ktc-crontab
RUN touch /var/log/trade_cron.log
RUN crontab /etc/cron.d/trade-crontab

CMD printenv > /etc/environment && cron -f && tail -f /var/log/cron.log
