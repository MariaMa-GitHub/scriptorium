import { Box, Container, Typography, Button, Grid, Paper } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import CodeIcon from '@mui/icons-material/Code';
import ArticleIcon from '@mui/icons-material/Article';
import SearchIcon from '@mui/icons-material/Search';
import localFont from "next/font/local";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff", 
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function Home() {
  return (
    <div className={`${geistSans.variable} ${geistMono.variable}`}>
      {/* Hero Section */}
      <Box 
        sx={{ 
          position: 'relative',
          overflow: 'hidden',
          py: 14,
          color: theme => theme.palette.mode === 'dark' ? 'text.primary' : 'white',
          background: theme => theme.palette.mode === 'dark' 
            ? `linear-gradient(135deg, 
                rgb(32, 16, 54) 0%,
                ${theme.palette.background.default} 50%,
                rgb(32, 16, 54) 100%
              )`
            : `linear-gradient(135deg, 
                ${theme.palette.primary.dark} 0%,
                ${theme.palette.primary.main} 50%,
                ${theme.palette.primary.light} 100%
              )`,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: theme => 
              theme.palette.mode === 'dark' 
                ? 'none'
                : 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 50%)',
            opacity: 0.6,
          },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h2" 
                component="h1" 
                gutterBottom
                className="font-[family-name:var(--font-geist-sans)]"
                sx={{ fontWeight: 'bold' }}
              >
                Write, Execute, Share Code
              </Typography>
              <Typography 
                variant="h5" 
                gutterBottom 
                sx={{ mb: 4 }}
                className="font-[family-name:var(--font-geist-mono)]"
              >
                What you need to bring your <br/>ideas to life
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 450 }}>
  <Link href="/editor" passHref style={{ width: '100%' }}>
    <Button 
      variant="contained" 
      size="large"
      fullWidth
      sx={{ 
        bgcolor: theme => theme.palette.mode === 'dark' 
          ? 'rgba(168, 85, 247, 0.35)'
          : 'white',
        color: theme => theme.palette.mode === 'dark' 
          ? 'white' 
          : 'primary.main',
        whiteSpace: 'nowrap',
        border: theme => theme.palette.mode === 'dark' ? 'none' : undefined,
        '&:hover': {
          bgcolor: theme => theme.palette.mode === 'dark'
            ? 'rgba(168, 85, 247, 0.22)' 
            : 'grey.100'
        }
      }}
      startIcon={<CodeIcon />}
    >
      Start Coding
    </Button>
  </Link>
  <Box sx={{ 
    display: 'flex', 
    gap: 2,
    flexDirection: { xs: 'column', sm: 'row' }
  }}>
    <Link href="/templates" passHref style={{ width: '100%' }}>
      <Button 
        variant="outlined" 
        size="large"
        fullWidth
        sx={{ 
          color: 'white',
          borderColor: 'white',
          whiteSpace: 'nowrap',
          '&:hover': {
            borderColor: 'grey.300',
            bgcolor: 'rgba(255,255,255,0.1)'
          }
        }}
        startIcon={<SearchIcon />}
      >
        Browse Templates
      </Button>
    </Link>
    <Link href="/posts" passHref style={{ width: '100%' }}>
      <Button 
        variant="outlined" 
        size="large"
        fullWidth
        sx={{ 
          color: 'white',
          borderColor: 'white',
          whiteSpace: 'nowrap',
          '&:hover': {
            borderColor: 'grey.300',
            bgcolor: 'rgba(255,255,255,0.1)'
          }
        }}
        startIcon={<ArticleIcon />}
      >
        Browse Posts
      </Button>
    </Link>
  </Box>
</Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ position: 'relative', height: '400px' }}>
                <Image
                  src="/home-page.png"
                  alt="Code Editor Preview"
                  layout="fill"
                  objectFit="contain"
                  priority
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ 
            p: 4, 
            height: '100%', 
            border: 1, 
            borderColor: theme => theme.palette.mode === 'dark' ? 'grey.600' : 'grey.400',
            bgcolor: theme => theme.palette.mode === 'dark' ? 'transparent' : 'background.paper',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              borderColor: 'primary.main',
              boxShadow: theme => `0 4px 20px ${theme.palette.mode === 'dark' ? 'rgba(147, 51, 234, 0.2)' : 'rgba(124, 58, 237, 0.1)'}`,
            }
          }}>
              <CodeIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Code Execution
              </Typography>
              <Typography color="text.secondary">
                Write and run code in 10+ programming languages. Get instant feedback with syntax highlighting and real-time output.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ 
            p: 4, 
            height: '100%', 
            border: 1, 
            borderColor: theme => theme.palette.mode === 'dark' ? 'grey.600' : 'grey.400',
            bgcolor: theme => theme.palette.mode === 'dark' ? 'transparent' : 'background.paper',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              borderColor: 'primary.main',
              boxShadow: theme => `0 4px 20px ${theme.palette.mode === 'dark' ? 'rgba(147, 51, 234, 0.2)' : 'rgba(124, 58, 237, 0.1)'}`,
            }
          }}>
              <ArticleIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Templates & Blogs
              </Typography>
              <Typography color="text.secondary">
                Save your code as reusable templates. Share your knowledge through blog posts and connect with the community.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ 
            p: 4, 
            height: '100%', 
            border: 1, 
            borderColor: theme => theme.palette.mode === 'dark' ? 'grey.600' : 'grey.400',
            bgcolor: theme => theme.palette.mode === 'dark' ? 'transparent' : 'background.paper',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              borderColor: 'primary.main',
              boxShadow: theme => `0 4px 20px ${theme.palette.mode === 'dark' ? 'rgba(147, 51, 234, 0.2)' : 'rgba(124, 58, 237, 0.1)'}`,
            }
          }}>
              <SearchIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Search & Discover
              </Typography>
              <Typography color="text.secondary">
                Find code examples and tutorials easily. Search by language, tags, or content to discover what you need.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}