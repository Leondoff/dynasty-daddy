FROM python:3.8.8
RUN apt-get update && apt-get -y install cron vim

WORKDIR /app
COPY back-end/scripts/PlayerScripts/requirements.txt /app/requirements.txt
RUN pip install -r requirements.txt

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
COPY back-end/scripts/PlayerScripts/NumberFireService.py /app/NumberFireService.py
COPY back-end/scripts/PlayerScripts/FantasyGuysService.py /app/FantasyGuysService.py
COPY back-end/scripts/PlayerScripts/ESPNService.py /app/ESPNService.py
COPY back-end/scripts/PlayerScripts/DatabaseConnService.py /app/DatabaseConnService.py
COPY back-end/scripts/PlayerScripts/PlayerRankingsJob.py /app/PlayerRankingsJob.py

# schedule cron jobs
RUN echo "0 0,8,16 * * * /usr/local/bin/python /app/TradeDatabaseService.py >> /var/log/trade_cron.log 2>&1" >> /etc/cron.d/trade-crontab
RUN echo "00 8 * * * /usr/local/bin/python /app/DailyCronJob.py >> /var/log/cron.log 2>&1" >> /etc/cron.d/ktc-crontab
RUN echo "00 7 * * * /usr/local/bin/python /app/PlayerRankingsJob.py >> /var/log/rankings_cron.log 2>&1" >> /etc/cron.d/rankings_crontab

# Combine the contents of both crontabs into a single file
RUN cat /etc/cron.d/ktc-crontab /etc/cron.d/trade-crontab /etc/cron.d/rankings_crontab > /etc/cron.d/combined-crontab

# Apply the combined crontab
RUN crontab /etc/cron.d/combined-crontab

# Execution rights to cron
RUN chmod 0644 /etc/cron.d/combined-crontab

# create log files
RUN touch /var/log/cron.log
RUN touch /var/log/trade_cron.log
RUN touch /var/log/rankings_cron.log

CMD printenv > /etc/environment && cron -f && tail -f /var/log/cron.log
