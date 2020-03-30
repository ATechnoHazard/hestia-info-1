const apiCallFromNode = require('./nodejscall')
const redis = require("redis");
const cors = require("cors");
const express = require("express");
const app = express();
const router = express.Router();
const axios = require("axios");

const client = redis.createClient("redis://h:p0251a35af0bf4e3e133ee844da1ab4df203632acde8b0a7e0363c946a7d90002@ec2-52-200-69-76.compute-1.amazonaws.com:10019");
const URL = "https://coronavirus-tracker-api.herokuapp.com/v2/locations";

app.use(cors());

function countryFilter(item, countryName) {
    const e = item.country;
    return (
      e.includes(countryName)
    );
  }

router.get('/countryName', async (req, res) => {
    let result;
    try {
        var key = "randomString";
        client.get(key, async function (err, reply) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            if (reply) {

                res.write(reply);

                var data = await apiCallFromNode.callApi();
                client.set(key, data);
            } else {

                var data = await apiCallFromNode.callApi();
                res.write(JSON.stringify(data));
                //waits for all the chunks of responses the server 
                //provides to our requests and then ends the connection
                client.on("error", function (error) {
                    console.error(error);
                });
                // these are unnecessary
                // client.set("key", dataString, redis.print);
                // client.get("key", redis.print);
            }
        });
        result = await axios.get(URL);
        var item = countryFilter(result, req.body.countryName);

    } catch (err) {
        console.log(err);
    }
    res.write(JSON.stringify(item.data));
    res.end();
});

app.use("/node", router);

module.exports = app;
