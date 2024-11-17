const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const apiId = process.env.API_KEY;
const port = 3000;
const { default:axios } = require('axios');



const app=express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'));

app.set('view engine', 'ejs');


const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const today = new Date();
const date = today.toLocaleDateString();
const day = weekdays[today.getDay()];
const year = today.getFullYear();

app.get('/', async(req,res)=>{    
    const dailyForecast = [
        {
            day:"Monday",
            icon:"http://openweathermap.org/img/wn/10d@4x.png",
            des:"overcast clouds"
        },{
            day:"Tuesday",
            icon:"http://openweathermap.org/img/wn/10d@4x.png",
            des:"overcast clouds"
        },{
            day:"Wednesday",
            icon:"http://openweathermap.org/img/wn/10d@4x.png",
            des:"overcast clouds"
        },{
            day:"Thursday",
            icon:"http://openweathermap.org/img/wn/10d@4x.png",
            des:"overcast clouds"
        },{
            day:"Friday",
            icon:"http://openweathermap.org/img/wn/10d@4x.png",
            des:"overcast clouds"
        },{
            day:"Saturday",
            icon:"http://openweathermap.org/img/wn/10d@4x.png",
            des:"overcast clouds"
        }
    ]

    const weatherDetails = {
        searchedLocation : "Name",
        countryName : "Country",
        currentTemp :30,
        currentWeatherDes : "weather des",
        currentWeatherIcon : "Images/01d.png",
        pressure : 100,
        humidity : 100,
        maxTemp : 100,
        minTemp : 100,
        wind : 2.63
    }
    res.render("index",{weatherDetails,dailyForecast,date,day,year});    
});


app.post('/search',async (req,res)=>{
    let location = req.body.location;
    let data = [];
    const rawDailyForecast = [];
    let url = `https://api.openweathermap.org/data/2.5/forecast?appid=${apiId}&q=${location}&units=metric`;
    let statusCode = "";
    try{
        data = await axios.get(url);
        
    }catch(error){
        console.log("Error: " + error.message);
        statusCode = error.status;
    }

    
    
    if(statusCode === 404){
        res.render('error', {location, year});
    }else{
        data.data.list.forEach((item)=>{
            let rawDailyForecastDet = {
                icon:"http://openweathermap.org/img/wn/"+item.weather[0].icon+"@4x.png",
                date:item.dt_txt.slice(0,10),
                des:item.weather[0].description,
                time:parseInt(item.dt_txt.slice(11,13),10),
                day:""
            }
            rawDailyForecast.push(rawDailyForecastDet);
        });
    
        rawDailyForecast.map(item=>{
            const dateString = item.date;
            const date = new Date(dateString);
            const weekday = weekdays[date.getDay()];   
            item.day = weekday;        
        });
    
        const uniqueDays = new Set();
        const dailyForecast = rawDailyForecast.filter(item => {
            if(item.time>0 && item.time <=24){
                if (!uniqueDays.has(item.day)) {
                    uniqueDays.add(item.day);
                    return true;
                }
                return false;
            }
        });
    
        const weatherDetails = {
            searchedLocation : location,
            countryName : data.data.city.country,
            currentTemp : parseInt(data.data.list[0].main.temp),
            currentWeatherDes : data.data.list[0].weather[0].description,
            currentWeatherIcon : "Images/"+data.data.list[0].weather[0].icon+".png",
            pressure : data.data.list[0].main.pressure,
            humidity : data.data.list[0].main.humidity,
            maxTemp : data.data.list[0].main.temp_max,
            minTemp : data.data.list[0].main.temp_min,
            wind : data.data.list[0].wind.speed
        }
        res.render("index",{weatherDetails,dailyForecast,date,day,year}); 
    }

    

});

app.listen(process.env.PORT || port, (req,res)=>{
    console.log(`Server is running on post:${port}`);
    
});