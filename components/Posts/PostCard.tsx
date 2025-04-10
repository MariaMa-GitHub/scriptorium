import { Card, CardContent, Typography, Chip, Box, IconButton, Menu, MenuItem } from '@mui/material';
import { MoreVert as MoreVertIcon, ThumbUp as ThumbUpIcon, ThumbDown, Comment as CommentIcon } from '@mui/icons-material';
import { useState } from 'react';
import { useRouter } from 'next/router';

interface PostProps {
  id: number;
  title: string;
  content: string;
  description: string;
  author: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  tags: { name: string }[];
  upvotes: number;
  downvotes: number;
  commentCount: number;
  onEdit?: () => void;
  onDelete?: () => void;
  isOwner?: boolean;
}

export default function PostCard({ 
  id, 
  title, 
  description,
  author,
  createdAt,
  tags,
  upvotes,
  downvotes,
  commentCount,
  onEdit,
  onDelete,
  isOwner = false,
}: PostProps) {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCardClick = () => {
    router.push(`/posts/${id}`);
  };

  return (
    <Card 
      elevation={0} 
      onClick={handleCardClick}
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
          {isOwner ? (
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
                router.push(`/posts/${id}`);
              }}>
                View
              </MenuItem>
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
            </Menu>
          </>
        ) : (
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
                router.push(`/posts/${id}`);
              }}>
                View
              </MenuItem>
            </Menu>
          </>
        )}
        </Box>

        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ mb: 1 }}
        >
          By {author?.firstName} {author?.lastName}
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
          {description}
        </Typography>

        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'nowrap',  
          gap: 0.5,
          mt: 'auto',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ 
            display: 'flex',
            gap: 0.5,
            overflow: 'hidden',
            maxWidth: '70%'
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton 
                size="small" 
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/posts/${id}#votes`);
                }}
              >
                <ThumbUpIcon fontSize="small" sx={{ mr: 0.5, color: 'grey.500' }} />
              </IconButton>
              <Typography variant="body2">{upvotes}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton 
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/posts/${id}#votes`);
                }}
              >
                <ThumbDown fontSize="small" sx={{ mr: 0.5, color: 'grey.500' }} />
              </IconButton>
              <Typography variant="body2">{downvotes}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CommentIcon fontSize="small" sx={{ mr: 0.5, color: 'grey' }} />
              <Typography variant="body2">{commentCount}</Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
} 