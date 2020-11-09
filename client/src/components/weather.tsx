import React, { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'weather-icons/css/weather-icons.css'; // https://erikflowers.github.io/weather-icons/
import Button from 'react-bootstrap/Button';
import countryData from '../data/countryData.json';
import Dropdown from 'react-bootstrap/Dropdown';
import '../styles/weather.css';
import { API_GEOlOCATION_KEY, API_WEATHER_KEY } from '../config/api';
import { Loading } from './Loading';
import { iconSelector } from './iconSelect';
import { coordsType } from '../App';

type Dispatch<A> = (value: A) => void;
type SetStateAction<S> = S | ((prevState: S) => S);

interface weatherProps {
    setCityName: Dispatch<SetStateAction<string | undefined>>;
    setCoords: Dispatch<SetStateAction<coordsType | undefined>>;
}

interface weatherAPITypes {
    state?: number;
    coords?: coordsType;
    city?: string;
    country?: string;
    time?: number;
    weatherInfo?: weatherDetailTypes[];
    temp?: number;
    maxTemp?: number;
    minTemp?: number;
    photo?: string;
    msg?: string;
}

interface weatherDetailTypes {
    id: number;
    main: string;
    description: string;
    icon: string;
}

export const Weather: React.FC<weatherProps> = ({ setCityName, setCoords }) => {
    const cityInputRef = useRef<HTMLInputElement>(null);
    const [cityInput, setCityInput] = useState('');
    const [countryInput, setCountryInput] = useState<string | null>('');

    const [time, setTime] = useState({
        text: '',
        justTime: '',
    });
    const [isLoading, setIsLoading] = useState(true);
    const [weatherIcon, setWeatherIcon] = useState<string | undefined>('');
    const [weather, setWeather] = useState<weatherAPITypes>({
        state: 0,
        coords: {
            lat: 0,
            lon: 0
        },
        city: '',
        country: '',
        weatherInfo: [],
        temp: 0,
        maxTemp: 0,
        minTemp: 0,
        photo: '',
        time: 0,
        msg: '',
    });

    // 브라우저를 열면 내가 있는 위치를 받아서 날씨정보를 가져온다
    useEffect(() => {
        cityInputRef.current?.focus();
        navigator.geolocation.getCurrentPosition(async position => {
            const { latitude, longitude } = position.coords;
            const { state, coords, city, weatherInfo, temp, maxTemp, minTemp, photo, msg } = await loadData(latitude, longitude);
            // getTime(coords.lat, coords.lon);
            setWeather({
                state, coords, city, weatherInfo, temp, maxTemp, minTemp, photo, msg
            })
            setIsLoading(false);
        })

    }, []);

    // 날씨 API를 사용해서 정보를 가져온다.
    const loadData = async (latitude: number, longitude: number) => {
        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_WEATHER_KEY}&units=metric`);
            const data = await response.json();
            const state: string = data.cod;
            const coords: coordsType = data.coord;
            const city: string = data.name;
            const country: string = data.sys.country;
            const weatherInfo: Array<object> = data.weather;
            const temp: number = data.main.temp;
            const maxTemp: number = data.main.temp_max;
            const minTemp: number = data.main.temp_min;
            const photo: string = '';
            setCoords(coords);
            setCityName(city);
            return { state, coords, city, country, weatherInfo, temp, maxTemp, minTemp, photo };
        } catch (err) {
            console.error(err);
            return err;
        }
    }



    const dropdownClicked = (e: React.MouseEvent<HTMLElement>) => {
        if (e.currentTarget.getAttribute('value') !== null) {
            setCountryInput(e.currentTarget.getAttribute('value'));
        }
    }

    const handleCity = (e: ChangeEvent<HTMLInputElement>) => {
        setCityInput(e.target.value);

    }
    const handleCountry = (e: ChangeEvent<HTMLInputElement>) => {
        setCountryInput(e.target.value);
    }



    // 결과값이 화씨라서 섭씨로 변환
    const calCelsius = (temp: number) => {
        let calCelsius = Math.floor(temp - 273.15);
        return calCelsius;
    }

    // 클릭으로 날씨 데이터 가져옴
    const handleClick = async () => {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityInput},${countryInput}&appid=${API_WEATHER_KEY}`);
        const data = await response.json();
        if (data.cod === 200) {
            setWeather({
                state: data.cod,
                coords: data.coord,
                city: data.name,
                country: data.sys.country,
                weatherInfo: data.weather,
                temp: calCelsius(data.main.temp),
                maxTemp: calCelsius(data.main.temp_max),
                minTemp: calCelsius(data.main.temp_min),
                photo: '',
            });
            setCoords(data.coord);
            setCityName(data.name);
            setCityInput('');
            setCountryInput('');

        } else {
            setWeather({ state: data.cod, msg: 'Can not find weather, please enter again..' });
            setCityInput('');
            setCountryInput('');
        }
        cityInputRef.current?.focus();
    }

    // 해당 경도 위도에 따라 그 위치 시간을 가져온다.
    useEffect(() => {
        if (weather.state === 200) {
            if (weather.weatherInfo !== undefined) {
                // console.log(weather.weatherInfo[0].id);
                setWeatherIcon(iconSelector(weather.weatherInfo[0].id));
            }
            // icon 설정
            const interval = setInterval(() => {
                // getTime(weather.coords.lat, weather.coords.lon);
            }, 1000);
            return () => {
                console.log('unmounted')
                clearInterval(interval);
            }


        }
    }, [weather])

    // 시간 가져오는 메소드
    const getTime = async (lat: number, lon: number) => {
        const response = await fetch(`https://api.ipgeolocation.io/timezone?apiKey=${API_GEOlOCATION_KEY}&lat=${lat}&long=${lon}`);
        const data = await response.json();
        setTime({
            text: data.date_time_txt,
            justTime: data.time_12,
        });

    }


    return (
        <div className="weather" id="weather">



            <h1>Weather Page</h1>
            <div className="weather__inputs">
                <Dropdown
                    drop='left'
                    className="dropdown">
                    <Dropdown.Toggle variant="info" id="dropdown-basic">
                        Dropdown Button
            </Dropdown.Toggle>

                    <Dropdown.Menu className="dropdown__menu">
                        {countryData.map((data, index) => {
                            return (
                                <Dropdown.Item className="dropdwon__item" name='countryCode' value={data.countryInfo.iso2} onClick={dropdownClicked} key={index} href="#/action-1"><img src={data.countryInfo.flag} alt="Country Flag" />{data.country}</Dropdown.Item>
                            )
                        })}
                    </Dropdown.Menu>
                </Dropdown>
                or
                <input type="text" placeholder="Country Code" name="countryCode" value={countryInput ? countryInput : ''} onChange={handleCountry} />
                <input type="text" placeholder="City" name="city" value={cityInput} onChange={handleCity} ref={cityInputRef} onKeyPress={event => event.key === 'Enter' ? handleClick() : null} />

                <Button onClick={handleClick} variant="outline-warning">Get Weather</Button>
            </div>

            {
                isLoading ?
                    <div className="weather__loading">
                        <Loading />
                    </div>
                    :
                    (
                        weather.state === 200 ?
                            <div className="weather__info">
                                <h1 className="weather__city">{weather.city}, {weather.country}</h1>
                                <h5 className="weather_icon">
                                    {console.log('weatherIcon', weatherIcon)}
                                    <i className={`wi wi-day-${weatherIcon} display-1`}></i>
                                </h5>
                                <h1 className="temp">{weather.temp}&deg;</h1>
                                {/* show max and min temp */}
                                <h3 className="max__min">
                                    <div className="max__temp">Max: {weather.maxTemp}&deg;</div>
                                    <div className="min__temp">Min: {weather.minTemp}&deg;</div>

                                </h3>

                                {/* <h4 className="weather__desc">{weather.weatherInfo[0].description}</h4> */}
                                <div className="weather__time">{time.text}</div>


                            </div>
                            :
                            <div className="weather__error">{weather.msg}</div>

                    )
            }
        </div>
    )
}
