import axios from 'axios';

const BASE_URL = 'https://countriesnow.space/api/v0.1';

export const getCountries = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/countries`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getStates = async (country) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/countries/states`,
      { country }
    );
    return response;
  } catch (error) {
    throw error;
  }
};

export const getCities = async (country, state) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/countries/state/cities`,
      { country, state }
    );
    return response;
  } catch (error) {
    throw error;
  }
};
