import { Container, Typography, Box, Paper, Avatar, Grid } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import MuiLink from '@mui/material/Link';

export default function About() {
  const creators = [
    {
      name: 'Maria Ma',
      role: 'Co-founder & Lead Developer',
      avatar: '/maria.jpg', // TODO
    },
    {
      name: 'Shujun Yang',
      role: 'Co-founder & Lead Developer',
      avatar: '/shujun.jpg', // TODO
    }
  ];

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 6 }}>
          {/* Hero Section */}
          <Box sx={{ mb: 6, textAlign: 'center' }}>
            <Typography variant="h3" component="h1" gutterBottom>
              About Scriptorium
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
              The new way of writing codes
            </Typography>
          </Box>

          {/* Mission Statement */}
          <Typography variant="body1" paragraph>
            Scriptorium is an innovative online platform that revolutionizes how developers write, execute, and share code. 
            Inspired by the ancient concept of a scriptorium—a place where manuscripts were crafted and preserved—we've 
            modernized this idea for the digital age.
          </Typography>

          <Typography variant="body1" paragraph>
            Our platform provides a secure environment for developers of all levels to experiment with code, 
            refine their work, and save their creations as reusable templates. Whether you're testing a quick 
            snippet or building a comprehensive code example, Scriptorium is designed to bring your ideas to life.
          </Typography>

          <Typography variant="body1" paragraph>
            At Scriptorium, we believe in the power of shared knowledge. Our integrated blogging platform 
            enables developers to document their journey, share coding insights, and learn from one another. 
            Through interactive discussions and collaborative learning, we're building more than just a code 
            editor—we're fostering a community of passionate developers.
          </Typography>

          {/* Team Section */}
          <Typography variant="h5" sx={{ mt: 6, mb: 4 }}>
            Meet the Creators
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {creators.map((creator) => (
              <Grid item key={creator.name} xs={12} sm={6} md={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar
                    src={creator.avatar}
                    alt={creator.name}
                    sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
                  />
                  <Link href="/signup?role=admin" passHref>
                    <Typography 
                      variant="h6" 
                      component="span"
                      gutterBottom
                      sx={{ 
                        color: 'text.primary',
                        cursor: 'default',
                        userSelect: 'none',
                        '&:hover': {
                          color: 'text.primary'
                        }
                      }}
                    >
                      {creator.name}
                    </Typography>
                  </Link>
                  <Typography variant="body2" color="text.secondary">
                    {creator.role}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
          
        </Paper>
      </Box>
    </Container>
  );
}