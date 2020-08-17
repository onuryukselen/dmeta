/* eslint-disable */
import { showAlert } from './alerts';

export const logout = async () => {
  try {
    location.assign('/api/v1/users/logout');
  } catch (err) {
    console.log(err.response);
    showAlert('error', 'Error logging out! Try again.');
  }
};
