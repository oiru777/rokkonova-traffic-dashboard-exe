import { useState, useEffect } from 'react';
import { TrafficData, ParkingData, WeatherData } from '../types';
import { useCsvData } from './useCsvData';

const API_BASE_URL = 'http://localhost:3001/api';

export const useTrafficData = (date?: string, csvData?: TrafficData[], isUsingCsv?: boolean) => {
  const [data, setData] = useState<TrafficData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isUsingCsv && csvData) {
      setLoading(true);
      const filteredData = date 
        ? csvData.filter(item => item.timestamp.startsWith(date))
        : csvData;
      setData(filteredData);
      setError(null);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const url = date ? `${API_BASE_URL}/traffic?date=${date}` : `${API_BASE_URL}/traffic`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch traffic data');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'データの取得中にエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [date, csvData, isUsingCsv]);

  return { data, loading, error };
};

export const useParkingData = (date?: string, csvData?: ParkingData[], isUsingCsv?: boolean) => {
  const [data, setData] = useState<ParkingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isUsingCsv && csvData) {
      setLoading(true);
      const filteredData = date 
        ? csvData.filter(item => item.timestamp.startsWith(date))
        : csvData;
      setData(filteredData);
      setError(null);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const url = date ? `${API_BASE_URL}/parking?date=${date}` : `${API_BASE_URL}/parking`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch parking data');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'データの取得中にエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [date, csvData, isUsingCsv]);

  return { data, loading, error };
};

export const useWeatherData = (date?: string, csvData?: WeatherData[], isUsingCsv?: boolean) => {
  const [data, setData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isUsingCsv && csvData) {
      setLoading(true);
      const filteredData = date 
        ? csvData.filter(item => item.date === date)
        : csvData;
      setData(filteredData);
      setError(null);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const url = date ? `${API_BASE_URL}/weather?date=${date}` : `${API_BASE_URL}/weather`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch weather data');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'データの取得中にエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [date, csvData, isUsingCsv]);

  return { data, loading, error };
};