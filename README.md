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

## Running cronjob

To periodically run a cronjob in k8s to fetch the data and import into InfluxDB:

Change the schedule to your liking. It only updates once a day so no use to check often.

```
apiVersion: batch/v1beta1
kind: CronJob
metadata:
  name: covid19import
spec:
  schedule: 1 3,9,15,21 * * *
  concurrencyPolicy: Forbid
  jobTemplate:
    metadata:
      name: covid19import
    spec:
      template:
        metadata:
          name: covid19import
        spec:
          containers:
          - image: diversit/covid19-load-influxdb
            name: covid19import
            env:
              - name: INFLUX_HOST
                value: "<your-influxdb-host-name-or-ip>"
              - name: INFLUX_PORT
                value: "8086"
          restartPolicy: Never
```