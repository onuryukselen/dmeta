/* eslint-disable */
import axios from 'axios';
export const login = async (emailOrUsername, password) => {
  try {
    const data = { password };
    if (emailOrUsername.match(/@/)) {
      data.email = emailOrUsername;
    } else {
      data.username = emailOrUsername;
    }
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data
    });

    if (res.data.status === 'success') {
      console.log('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    console.log('error', err);
  }
};

export const logout = async () => {
  try {
    location.assign('/api/v1/users/logout');
  } catch (err) {
    console.log('error', err);
  }
};
