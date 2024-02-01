FROM python:3.8.8
RUN apt-get update && apt-get -y install cron vim

WORKDIR /app
COPY back-end/scripts/PlayerScripts/requirements.txt /app/requirements.txt
RUN pip install -r requirements.txt

COPY back-end/scripts/PlayerScripts/*.py /app/

# schedule cron jobs
RUN echo "0 0,8,16 * * * /usr/local/bin/python /app/TradeDatabaseService.py >> /var/log/trade_cron.log 2>&1" >> /etc/cron.d/trade-crontab
RUN echo "00 8 * * * /usr/local/bin/python /app/DailyCronJob.py >> /var/log/cron.log 2>&1" >> /etc/cron.d/ktc-crontab
RUN echo "00 7 * * * /usr/local/bin/python /app/PlayerRankingsJob.py >> /var/log/rankings_cron.log 2>&1" >> /etc/cron.d/rankings_crontab
RUN echo "00 * * * * /usr/local/bin/python /app/TrendingArticlesJob.py >> /var/log/TrendingArticlesJob.log 2>&1" >> /etc/cron.d/trending_crontab
RUN echo "00 4 * * * /usr/local/bin/python /app/InsertESPNPlayerIdsJob.py >> /var/log/InsertESPNPlayerIdsJob.log 2>&1" >> /etc/cron.d/espn_ids_crontab
RUN echo "30 3 * * * /usr/local/bin/python /app/InsertFleaflickerPlayerIds.py >> /var/log/InsertFleaflickerPlayerIds.log 2>&1" >> /etc/cron.d/ff_ids_crontab
RUN echo "00 3 * * * /usr/local/bin/python /app/InsertFFPCPlayerIdsJob.py >> /var/log/InsertFFPCPlayerIdsJob.log 2>&1" >> /etc/cron.d/ffpc_ids_crontab
RUN echo "0 0 * * SAT /usr/local/bin/python /app/HistoricalTradeDatabaseJob.py >> /var/log/HistoricalTradeDatabaseJob.log 2>&1" >> /etc/cron.d/historical_trade_job_crontab

# Combine the contents of both crontabs into a single file
RUN cat /etc/cron.d/ktc-crontab /etc/cron.d/trade-crontab /etc/cron.d/rankings_crontab /etc/cron.d/trending_crontab /etc/cron.d/espn_ids_crontab /etc/cron.d/ff_ids_crontab /etc/cron.d/ffpc_ids_crontab /etc/cron.d/historical_trade_job_crontab > /etc/cron.d/combined-crontab

# Apply the combined crontab
RUN crontab /etc/cron.d/combined-crontab

# Execution rights to cron
RUN chmod 0644 /etc/cron.d/combined-crontab

# create log files
RUN touch /var/log/cron.log
RUN touch /var/log/trade_cron.log
RUN touch /var/log/rankings_cron.log
RUN touch /var/log/TrendingArticlesJob.log
RUN touch /var/log/InsertESPNPlayerIdsJob.log
RUN touch /var/log/InsertFleaflickerPlayerIds.log
RUN touch /var/log/InsertFFPCPlayerIdsJob.log
RUN touch /var/log/HistoricalTradeDatabaseJob.log

CMD printenv > /etc/environment && cron -f && tail -f /var/log/cron.log
