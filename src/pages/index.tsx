import axios from 'axios';
import { useState } from 'react';
import QRCode from 'react-qr-code';

import { COUNTRIES } from '@/lib/data/country-codes';

import Layout from '@/components/layout/Layout';
import Seo from '@/components/Seo';

/**
 * SVGR Support
 * Caveat: No React Props Type.
 *
 * You can override the next-env if the type is important to you
 * @see https://stackoverflow.com/questions/68103844/how-to-override-next-js-svg-module-declaration
 */

// Before you begin editing, follow all comments with `STARTERCONF`,
// to customize the default configuration.

export default function HomePage() {
  const [mode, setMode] = useState<'age' | 'country'>('age');
  const [age, setAge] = useState<number>(18);
  const [country, setCountry] = useState<string>('840');
  const [qrValue, setQrValue] = useState<string>('');

  const getQrData = async () => {
    const { data } = await axios.get('/api/sign-in', {
      params: { age, country, mode },
    });
    setQrValue(JSON.stringify(data));
  };

  return (
    <Layout>
      {/* <Seo templateTitle='Home' /> */}
      <Seo />

      <main>
        <section className='bg-white'>
          <div className='layout flex min-h-screen flex-col items-center justify-center space-y-2 text-center'>
            <div className='tabs'>
              <a
                className={`tab tab-bordered ${mode === 'age' && 'tab-active'}`}
                onClick={() => setMode('age')}
              >
                Age
              </a>
              <a
                className={`tab tab-bordered ${
                  mode === 'country' && 'tab-active'
                }`}
                onClick={() => setMode('country')}
              >
                Country
              </a>
            </div>
            {mode === 'age' && (
              <div className='form-control w-full max-w-xs'>
                <label className='label'>
                  <span className='label-text'>Age</span>
                </label>
                <div>
                  <input
                    type='range'
                    min='0'
                    max='100'
                    value={age}
                    className='range'
                    step={1}
                    onChange={(e) => setAge(parseInt(e.target.value, 10))}
                  />
                  <div className='flex w-full justify-between px-2 text-xs'>
                    <span>0</span>
                    <span>25</span>
                    <span>50</span>
                    <span>75</span>
                    <span>100</span>
                  </div>
                </div>
              </div>
            )}
            {mode === 'country' && (
              <div className='form-control w-full max-w-xs'>
                <label className='label'>
                  <span className='label-text'>Country</span>
                </label>
                <select
                  className='select select-bordered'
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                >
                  {COUNTRIES.map((country) => (
                    <option
                      key={country['country-code']}
                      value={country['country-code']}
                    >
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className='mt-4'>
              <button className='btn btn-primary' onClick={getQrData}>
                Generate QR
              </button>
            </div>
            {qrValue && <QRCode value={qrValue} />}
          </div>
        </section>
      </main>
    </Layout>
  );
}
