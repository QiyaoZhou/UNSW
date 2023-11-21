export const setToken = (token) => {
  localStorage.setItem('token', token);
}

export const forgetToken = () => {
  localStorage.removeItem('token');
}
