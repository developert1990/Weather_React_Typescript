import React, { Dispatch, SetStateAction, useState } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'weather-icons/css/weather-icons.css';
import { ContactPage } from './components/contact';
import { MyNavbar } from './components/navbar';
import { Weather } from './components/weather';
import { Forecast } from './components/forecast';

export interface coordsType {
  lat: number;
  lon: number;
}

function App() {

  const [cityName, setCityName] = useState<string | undefined>("");
  const [coords, setCoords] = useState<coordsType>();

  // console.log('cityName: ', cityName);
  console.log('coords', coords)
  return (
    <div className="App">

      <MyNavbar />

      <div>
        {/* 이렇게 props값으로 hook state의 setState를 사용하게 되면 자식으로 부터 전달을 받을 수가 있다. */}
        <Weather setCityName={setCityName} setCoords={setCoords} />
        <hr />
      </div>

      <div>
        <Forecast cityName={cityName} coords={coords} />
        <hr />
      </div>

      <ContactPage />

    </div>
  );
}

export default App;
