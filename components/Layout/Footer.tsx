import { Info } from '@mui/icons-material';
import { Box, Container, Link as MuiLink, Typography } from '@mui/material';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Box 
      component="footer" 
      sx={{ 
        borderTop: '1px solid',
        borderColor: 'divider',
        py: 3,
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ 
          display: 'flex', 
          gap: 4, 
          flexWrap: 'wrap', 
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Link href="/about" passHref legacyBehavior>
            <MuiLink
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: 'text.primary',
                '&:hover': {
                  textDecoration: 'underline',
                  textUnderlineOffset: '4px'
                }
              }}
            >
              <Info sx={{ fontSize: 18 }} />
              About
            </MuiLink>
          </Link>

          <MuiLink
            component="span"
            underline="hover"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              color: 'text.primary',
              cursor: 'default',
              '&:hover': {
                textDecoration: 'none'
              }
            }}
          >
            © {currentYear} Scriptorium
          </MuiLink>
        </Box>
      </Container>
    </Box>
  );
}