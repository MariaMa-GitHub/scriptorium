import { Card, CardContent, Typography, Chip, Box, IconButton, Menu, MenuItem } from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { useState } from 'react';
import { useRouter } from 'next/router';

interface Tag {
  name: string;
}

interface TemplateProps {
  id: number;
  title: string;
  language: string;
  explanation: string;
  tags: Tag[];
  onEdit?: () => void;
  onDelete?: () => void;
  onFork?: () => void;
  isOwner?: boolean;
}

export default function TemplateCard({ 
  id, 
  title, 
  language, 
  explanation, 
  tags,
  onEdit,
  onDelete,
  onFork,
  isOwner = false 
}: TemplateProps) {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleViewClick = () => {
    router.push(`/templates/${id}`);
  };

  return (
    <Card 
      elevation={0} 
      onClick={handleViewClick}
      sx={{ 
        height: 200,
        display: 'flex', 
        flexDirection: 'column',
        border: 1,
        borderColor: theme => theme.palette.mode === 'dark' ? 'grey.700' : 'grey.400',
        bgcolor: theme => theme.palette.mode === 'dark' ? 'transparent' : 'background.paper',
        transition: 'all 0.2s ease-in-out',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-4px)',
          borderColor: 'primary.main',
          boxShadow: theme => `0 4px 20px ${theme.palette.mode === 'dark' ? 'rgba(147, 51, 234, 0.2)' : 'rgba(124, 58, 237, 0.1)'}`,
        }
      }}
    >
      <CardContent sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden',
        p: 2.5
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography 
            variant="h6" 
            component="h2" 
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.2,
              mb: 1,
              flex: 1
            }}
          >
            {title}
          </Typography>
          {(isOwner || onFork) && (
            <>
              <IconButton 
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick(e);
                }}
                sx={{ ml: 1, flexShrink: 0 }}
              >
                <MoreVertIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                onClick={(e) => e.stopPropagation()}
              >
                <MenuItem onClick={() => {
                  handleClose();
                  handleViewClick();
                }}>
                  View
                </MenuItem>
                {onFork && !isOwner && (
                  <MenuItem onClick={(e) => {
                    e.stopPropagation();
                    handleClose();
                    onFork();
                  }}>
                    Fork
                  </MenuItem>
                )}
                {isOwner && (
                  <>
                    <MenuItem onClick={() => {
                      handleClose();
                      onEdit?.();
                    }}>
                      Edit
                    </MenuItem>
                    <MenuItem onClick={() => {
                      handleClose();
                      onDelete?.();
                    }}>
                      Delete
                    </MenuItem>
                  </>
                )}
              </Menu>
            </>
          )}
        </Box>

        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ mb: 1 }}
        >
          Language: {language}
        </Typography>

        <Typography 
          variant="body2"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            mb: 2,
            color: 'text.secondary',
            lineHeight: 1.5,
            flex: 1
          }}
        >
          {explanation}
        </Typography>

        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'nowrap', 
          gap: 0.5,
          mt: 'auto',
          overflow: 'hidden',
          maxWidth: '100%'
        }}>
          {tags.slice(0, 2).map((tag, index) => (
            <Chip 
              key={index} 
              label={tag.name} 
              size="small"
              sx={{
                bgcolor: theme => theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100',
                color: 'text.secondary',
                maxWidth: 80,
                '& .MuiChip-label': {
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }
              }}
            />
          ))}
          {tags.length > 2 && (
            <Chip 
              label={`+${tags.length - 2} more`} 
              size="small"
              sx={{
                bgcolor: theme => theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100',
                color: 'text.secondary',
                maxWidth: 80,
                '& .MuiChip-label': {
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }
              }}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
}