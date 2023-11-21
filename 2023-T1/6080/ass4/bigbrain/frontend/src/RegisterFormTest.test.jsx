import { render, screen } from '@testing-library/react';
import Register from './components/admin_auth/Register';
import { BrowserRouter } from 'react-router-dom';

describe('<Register/>', () => {
  it('A useless test that I regret even spending time on go fuck yourself', () => {
    render(<Register/>);
    expect(screen.getByRole('textbox', {name: 'name'})).toBeRequired();
    expect(screen.getByRole('textbox', {name: 'email'})).toBeRequired();
    expect(screen.getByRole('textbox', {name: 'password'})).toBeRequired();
    expect(screen.getByRole('textbox', {name: 'confirm_password'})).toBeRequired();
  });
});
