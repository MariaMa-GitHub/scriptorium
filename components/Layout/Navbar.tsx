import { useState } from 'react';
import Link from 'next/link';
import ThemeToggle from '@/components/Layout/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Avatar,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

interface NavbarProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export default function Navbar({ isDarkMode, onThemeToggle }: NavbarProps) {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const menuItems = [
    { text: 'Editor', href: '/editor' },
    { text: 'Code Templates', href: '/templates' },
    { text: 'Blog Posts', href: '/posts' },
  ];

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    handleClose();
    logout();
  };

  const drawer = (
    <List>
      {menuItems.map((item) => (
        <ListItem
          key={item.text}
          component={Link}
          href={item.href}
          onClick={() => setMobileOpen(false)}
        >
          <ListItemText primary={item.text} />
        </ListItem>
      ))}
    </List>
  );

  return (
    <AppBar 
    position="fixed" 
    color="inherit" 
    elevation={0} 
    sx={{ 
      borderBottom: 1, 
      borderColor: 'divider',
      bgcolor: theme => theme.palette.mode === 'dark' ? 
        'background.paper' : 
        'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(8px)',
      boxShadow: theme => theme.palette.mode === 'dark' ? 
        'none' : 
        '0 4px 6px -1px rgb(0 0 0 / 0.05)'
    }}
  >
  <Toolbar>
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

      <Typography 
        variant="h6" 
        component={Link} 
        href="/" 
        sx={{ 
          flexGrow: 0, 
          textDecoration: 'none',
          background: theme => `linear-gradient(135deg, 
            ${theme.palette.primary.main} 0%,
            ${theme.palette.secondary.main} 100%
          )`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 700,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            color: 'primary.main',
            transform: 'scale(1.05)',
          },
          letterSpacing: '0.05em',
          fontFamily: 'var(--font-geist-sans)',
        }}
      >
        Scriptorium
      </Typography>

        {!isMobile && (
          <Box sx={{ flexGrow: 1, display: 'flex', ml: 4 }}>
            {menuItems.map((item) => (
              <Button
                key={item.text}
                component={Link}
                href={item.href}
                sx={{ color: 'inherit', mx: 1 }}
              >
                {item.text}
              </Button>
            ))}
            {user?.role === 'ADMIN' && (
              <Link href="/reports" passHref>
                <Button
                  color="inherit"
                  sx={{
                    ml: 2,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    },
                  }}
                >
                  REPORTED CONTENT
                </Button>
              </Link>
            )}
          </Box>
        )}

<Box sx={{ 
  flexGrow: isMobile ? 1 : 0, 
  display: 'flex', 
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: { xs: 0.5, sm: 1 }  // Smaller gap on mobile
}}>
  <ThemeToggle isDarkMode={isDarkMode} onToggle={onThemeToggle} />
  
  {user ? (
    <>
      <IconButton onClick={handleMenu} sx={{ ml: { xs: 1, sm: 2 } }}>
        <Avatar 
          src={user.avatar || "/default-avatar.png"} 
          alt={user.firstName}
          sx={{ width: { xs: 32, sm: 40 }, height: { xs: 32, sm: 40 } }}  // Smaller avatar on mobile
        />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        sx={{
          '& .MuiPaper-root': {
            bgcolor: 'var(--background)',
            color: 'var(--foreground)',
          }
        }}
      >
        <MenuItem component={Link} href="/profile" onClick={handleClose}>Your Profile</MenuItem>
        <MenuItem component={Link} href="/my-templates" onClick={handleClose}>My Templates</MenuItem>
        <MenuItem component={Link} href="/my-posts" onClick={handleClose}>My Posts</MenuItem>
        <MenuItem onClick={handleLogout}>Sign out</MenuItem>
      </Menu>
    </>
  ) : (
    <Box sx={{ 
  display: 'flex', 
  gap: { xs: 0.5, sm: 1 },
  ml: { xs: 1, sm: 2 }
}}>
  <Button 
    component={Link} 
    href="/login" 
    color="inherit"
    size={isMobile ? "small" : "medium"}
    sx={{
      px: { xs: 1, sm: 2 },
      fontSize: { xs: '0.75rem', sm: '0.875rem' },
      minWidth: { xs: 'auto', sm: 64 },
      height: { xs: 36, sm: 36 },
      lineHeight: { xs: 1, sm: 1.75 },
      textAlign: 'center',
    }}
  >
    Sign In
  </Button>
  <Button 
    component={Link} 
    href="/signup" 
    variant="contained" 
    color="primary"
    size={isMobile ? "small" : "medium"}
    sx={{
      px: { xs: 1, sm: 2 },
      fontSize: { xs: '0.75rem', sm: '0.875rem' },
      minWidth: { xs: 'auto', sm: 64 },
      height: { xs: 36, sm: 36 },
      lineHeight: { xs: 1, sm: 1.75 },
      textAlign: 'center',
    }}
  >
    Sign Up
  </Button>
</Box>
  )}
</Box>
      </Toolbar>

      {isMobile && (
        <Drawer
          variant="temporary"
          anchor="left"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
          }}
        >
          {drawer}
        </Drawer>
      )}
    </AppBar>
  );
}