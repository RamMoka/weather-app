import React from 'react';
import { render, waitFor, screen } from '@testing-library/react';
import axios from 'axios';
import App from './App';

jest.mock('axios');

describe('App Component', () => {

  test("renders loading state", () => {
    render(<App />);
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });
  
  test('renders weather report', async () => {
    const mockData = {
      city: {
        name: 'Test City',
      },
      list: [
        {
          dt_txt: '2023-10-26 12:00:00',
          main: {
            temp: 12,
            temp_min: 10,
            temp_max: 20,
            humidity: 50,
          },
        },
      ],
    };

    (axios.get as jest.Mock).mockResolvedValue({ data: mockData });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/5-Days Weather Report for Test City/i)).toBeInTheDocument();
    });
  });

  test('handles no data scenario', async () => {
    (axios.get as jest.Mock).mockResolvedValue({ data: { city: { name: 'No Data City' }, list: [] } });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/No Weather Report Data/i)).toBeInTheDocument();
    });
  });

});
