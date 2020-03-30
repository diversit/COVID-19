const papa = require('papaparse');
const influx = require('influx');
const axios = require('axios');
const HttpsProxyAgent = require('https-proxy-agent');

// Get INFLUX_HOST environment variable
const influxhost = process.env.INFLUX_HOST;
const influxPort = process.env.INFLUX_PORT;
const influxDb = 'covid19';

const influxdb = new influx.InfluxDB({
    host: influxhost,
    port: influxPort,
    database: influxDb,
    pool: {
        maxRetries: 5,
        requestTimeout: 600000,
    },
    schema: [
        {
            measurement: 'Corona',
            fields: {
                Confirmed: influx.FieldType.FLOAT,
                Deaths: influx.FieldType.FLOAT,
                Recovered: influx.FieldType.FLOAT
            },
            tags: [
                'state',
                'country',
                'lat',
                'long'
            ],
            timestamp: influx.FieldType.Date
        }
    ]
});


const statType = ['Confirmed', 'Deaths'];

let covidConfirmed;
let covidDeaths;
let covidRecovered;

function getCovidData(item) {
    const axios = require ('axios').default;
    const url = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_" + item.toLowerCase() + "_global.csv";
    return axios.get(url);
}

async function getCovid() {

    for (let i = 0; i < statType.length; i++) {

        const covidDaten = await getCovidData(statType[i]);

        switch (statType[i]) {
            case 'Confirmed':
                covidConfirmed = convertHeader(covidDaten.data);
                break;

            case 'Deaths':
                covidDeaths = convertHeader(covidDaten.data);
                break;

            case 'Recovered':
                covidRecovered = convertHeader(covidDaten.data);
                break;

            default:
                break;

        }

    }

}


function convertHeader(convDaten) {

    var parseMe = papa.parse(convDaten, {
        delimiter: ",",
        header: true,
        dynamicTyping: true,

        transformHeader: function (header) {
            switch (header) {
                case "Province/State":
                case "Country/Region":
                case "Lat":
                case "Long":
                    break;
                default: {
                    header = new Date(header).getTime();
                    header = header + (2 * 3600 * 1000);
                }
            }

            return (header)
        }
    });

    return (parseMe.data)

}


function covidDB() {
    const series = [];
    const anzahlDatenSatz = Object.keys(covidConfirmed).length;
    const anzahlEintrag = Object.keys(Object.keys(covidConfirmed[0])).length;

    for (let i = 0; i < anzahlDatenSatz - 1; i++) {

        const zeilenConfirmed = Object.entries(covidConfirmed[i]);
        const zeilenDeaths = Object.entries(covidDeaths[i]);

        let state = zeilenConfirmed[0][1];
        let country = zeilenConfirmed[1][1];
        let lat = zeilenConfirmed[2][1];
        let long = zeilenConfirmed[3][1];

        if (state == null) {
            state = "N/A";
        }

        for (let j = 4; j < anzahlEintrag; j++) {
            let zeileConfirmed = Object.values(zeilenConfirmed[j])
            let zeileDeaths = Object.values(zeilenDeaths[j])

            let timestemp = zeileConfirmed[0];
            let confirmed = zeileConfirmed[1];
            let deaths = zeileDeaths[1];

            if (confirmed == undefined) {
                confirmed = Object.values(zeilenConfirmed[j - 1])[1];
            }

            if (deaths == undefined) {
                deaths = Object.values(zeilenDeaths[j - 1])[1];
            }

            series.push(
                {
                    measurement: 'Corona',
                    tags: {
                        state: state,
                        country: country,
                        lat: lat,
                        long: long
                    },
                    fields: {
                        Confirmed: confirmed,
                        Deaths: deaths,
                    },
                    timestamp: timestemp
                });



        }

    };

    influxdb.writeMeasurement('Corona', series, { database: influxDb, precision: 'ms' }).catch(error => {
        console.error("Error :", error, "Stack:", error.stack)
    });
}


async function Covid() {

    influxdb.getDatabaseNames().then(names => {
        if (!names.includes(influxDb)) {
            influxdb.createDatabase(influxDb);
        }
    })

    const result = await getCovid();
    covidDB()

}


Covid();

