import React, { useState, useEffect } from 'react';
import { coordsType } from '../App';
import { API_GEOlOCATION_KEY, API_WEATHER_KEY } from '../config/api';
import { iconSelector } from './iconSelect';
import '../styles/forecast.css'

interface ForecastCoords {
    lat: number;
    lon: number;
}

interface ForecastProps {
    cityName?: string;
    coords?: coordsType | ForecastCoords;
}

interface ForecastWeatherType {
    daily: ForecastDetailType[]
}

interface ForecastDetailType {
    dt: number;
    temp: {
        day: number;
        min: number;
        max: number;
    }
    weather: [
        {
            id: number;
            main: string;
            description: string;
        }
    ];

}



export const Forecast: React.FC<ForecastProps> = ({ cityName, coords }) => {
    console.log('cityName', cityName);
    console.log('coords', coords);
    const [weather, setWeather] = useState<ForecastWeatherType>();
    // console.log(weather);

    useEffect(() => {
        if (cityName !== '') {
            getForeCastData();
        }
    }, [cityName])

    // 
    // https://api.openweathermap.org/data/2.5/onecall?lat={lat}&lon={lon}&exclude={part}&appid=
    const getForeCastData = async () => {
        if (coords !== undefined) {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${coords.lat}&lon=${coords.lon}&exclude=minutely&appid=${API_WEATHER_KEY}`);
            const data = await response.json();
            console.log('data', data)
            setWeather(data);
        }
    }

    const convertUnix = (unix: number) => {
        const time = new Date(unix * 1000);
        const timeSTring = time.toString();
        const week = time.toString().slice(0, 3);
        const stringTime = `${timeSTring.slice(4, 7)}, ${timeSTring.slice(8, 10)} ${timeSTring.slice(11, 15)}`;
        return {
            stringTime: stringTime,
            week: week,
        };
    }



    const calCelsius = (temp: number) => {
        let calCelsius = Math.floor(temp - 273.15);
        return calCelsius;
    }


    return (
        <>
            {
                weather !== undefined &&
                <>
                    <h1 id="forecast" className="forecast__title">Forecast, {cityName}</h1>
                    <div className="forecast">
                        {
                            weather.daily.map((data) => {
                                const weatherIcon = iconSelector(data.weather[0].id);
                                return (
                                    <div className="forecast__info">
                                        <i className={`wi wi-day-${weatherIcon} forecast__icon`}></i>
                                        <span>{data.weather[0].description}</span>
                                        <span style={{ wordSpacing: '5px' }}>{calCelsius(data.temp.max)}&deg;  {calCelsius(data.temp.min)}&deg;</span>

                                        {/* <span>{data.dt_txt}</span> */}
                                        <span>{convertUnix(data.dt).week}</span>
                                        <span>{convertUnix(data.dt).stringTime}</span>
                                    </div>
                                )
                            })

                        }
                    </div>
                </>
            }
        </>
    )
}