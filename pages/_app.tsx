import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import { useState, useEffect, useMemo } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';

export default function App({ Component, pageProps }: AppProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (!isDarkMode) {
      root.style.setProperty('--background', '#1e1e1e');
      root.style.setProperty('--foreground', '#ededed');
    } else {
      root.style.setProperty('--background', '#ffffff');
      root.style.setProperty('--foreground', '#171717');
    }
    setIsDarkMode(!isDarkMode);
  };

  const theme = useMemo(() => createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: isDarkMode ? '#a855f7' : '#8b5cf6',
        dark: isDarkMode ? '#9333ea' : '#7c3aed',
        light: isDarkMode ? '#c084fc' : '#a78bfa',
        contrastText: '#fff',
      },
      secondary: {
        main: isDarkMode ? '#f0abfc' : '#e879f9',
        dark: isDarkMode ? '#e879f9' : '#d946ef',
        contrastText: '#fff',
      },
      background: {
        default: isDarkMode ? '#0f0a1a' : '#ffffff',
        paper: isDarkMode ? '#1a1425' : '#ffffff',
      },
      text: {
        primary: isDarkMode ? '#f8fafc' : '#1e293b',
        secondary: isDarkMode ? '#cbd5e1' : '#64748b',
      },
      divider: isDarkMode ? 'rgba(168, 85, 247, 0.12)' : 'rgba(139, 92, 246, 0.12)',
    },
    components: {
      MuiButton: {
        styleOverrides: {
          contained: {
            backgroundColor: isDarkMode ? 'transparent' : undefined,
            border: isDarkMode ? '1px solid' : 'none',
            borderColor: isDarkMode ? '#a855f7' : undefined,
            color: isDarkMode ? '#a855f7' : undefined,
            '&:hover': {
              backgroundColor: isDarkMode ? 'rgba(168, 85, 247, 0.1)' : undefined,
              borderColor: isDarkMode ? '#c084fc' : undefined,
            },
          },
          outlined: {
            borderColor: isDarkMode ? '#a855f7' : undefined,
            color: isDarkMode ? '#a855f7' : undefined,
            '&:hover': {
              borderColor: isDarkMode ? '#c084fc' : undefined,
              backgroundColor: isDarkMode ? 'rgba(168, 85, 247, 0.1)' : undefined,
            },
          },
        },
      },
    },
  }), [isDarkMode]);
  
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ 
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Navbar isDarkMode={isDarkMode} onThemeToggle={toggleTheme} />
          <Box sx={{ pt: '64px', flex: 1 }}>
            <Component {...pageProps} />
          </Box>
          <Footer />
        </Box>
      </ThemeProvider>
    </AuthProvider>
  );
}