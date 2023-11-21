import config from '../config.json';

export const apiCall = (path, method, body) => {
  const BACKEND_PORT = config.BACKEND_PORT;
  return new Promise((resolve, reject) => {
    const options = {
      method: method,
      headers: {
        'Content-type': 'application/json',
      },
    };
    if (method === 'GET') {
      // Nothing
    } else {
      options.body = JSON.stringify(body);
    }
    if (localStorage.getItem('token')) {
      options.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
    }
    fetch(`http://localhost:${BACKEND_PORT}/` + path, options)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          reject(data.error);
        } else {
          resolve(data);
        }
      });
  });
};
