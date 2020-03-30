# COVID-19
Download, convert and load COVID-19 information into influxdb.
This "app" will load the CSV of Covid-19 and convert them for loading into an influxDB.
As the source is being updated once a day, you should run this app three times a day.

Use `node` v11.x. (>v11.x does not work)

## Build

`> npm install`

## Run

`> node app.js`

Default uses InfluxDB on `localhost:8086`.  
Use environment variables `INFLUX_HOST` and `INFLUX_PORT` to customize the url.

## Dashboard

Once loaded install [this](https://grafana.com/grafana/dashboards/11896) Grafana dashboard (id 11896).
