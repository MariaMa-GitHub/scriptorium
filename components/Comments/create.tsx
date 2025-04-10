import { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography,
  Avatar,
  Paper,
  Divider,
  IconButton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem
} from '@mui/material';
import { Reply as ReplyIcon, ThumbUp as ThumbUpIcon, ThumbDown, Comment as CommentIcon, ExpandMore } from '@mui/icons-material';

interface Comment {
  id: number;
  content: string;
  author: {
    firstName: string;
    lastName: string;
  };
  parentId: number | null;
  votes: { id: number; isUpvote: boolean }[];
  createdAt: string;
}

interface CommentSectionProps {
  postId: number;
  comments: Comment[];
  onCommentAdded: () => void;
}

interface CommentWithReplies extends Comment {
  replies: CommentWithReplies[];
}

export default function CommentSection({ postId, comments, onCommentAdded }: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<{id: number, author: string, lastName: string} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [collapsedComments, setCollapsedComments] = useState<Set<number>>(() => 
    new Set(comments.filter(c => !c.parentId).map(c => c.id))
  );
  const [sortBy, setSortBy] = useState<'latest' | 'votes'>('latest');
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);
  const [sortedComments, setSortedComments] = useState<Comment[]>([]);
  const [sortedReplies, setSortedReplies] = useState<Comment[]>([]);

  useEffect(() => {
    const mainComments = comments.filter(comment => !comment.parentId);
    const replies = comments.filter(comment => comment.parentId);
    
    const sortedMain = [...mainComments].sort((a, b) => {
      if (sortBy === 'votes') {
        const aVotes = a.votes.filter(vote => vote.isUpvote).length - a.votes.filter(vote => !vote.isUpvote).length;
        const bVotes = b.votes.filter(vote => vote.isUpvote).length - b.votes.filter(vote => !vote.isUpvote).length;
        if (bVotes !== aVotes) {
          return bVotes - aVotes;
        }
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    setSortedComments(sortedMain);

    const sortedRepliesList = [...replies].sort((a, b) => {
      if (sortBy === 'votes') {
        const aVotes = a.votes.filter(vote => vote.isUpvote).length - a.votes.filter(vote => !vote.isUpvote).length;
        const bVotes = b.votes.filter(vote => vote.isUpvote).length - b.votes.filter(vote => !vote.isUpvote).length;
        if (bVotes !== aVotes) {
          return bVotes - aVotes;
        }
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    setSortedReplies(sortedRepliesList);
  }, [sortBy]);

  useEffect(() => {
    setSortedComments(prev => {
      return prev.map(sortedComment => {
        const updatedComment = comments.find(c => c.id === sortedComment.id);
        return updatedComment || sortedComment;
      });
    });
    setSortedReplies(prev => {
      return prev.map(sortedReply => {
        const updatedReply = comments.find(c => c.id === sortedReply.id);
        return updatedReply || sortedReply;
      });
    });
  }, [comments]);

  const toggleCollapse = (commentId: number) => {
    setCollapsedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    setError('');

    try {
      const commentContent = replyTo 
        ? `@${replyTo.author} ${replyTo.lastName} ${newComment}`
        : newComment;

      const response = await fetch('/api/posts/comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          content: commentContent,
          postId,
          parentId: replyTo?.id || null
        }),
        credentials: 'include',
      });

      if (response.ok) {
        setNewComment('');
        setReplyTo(null);
        setShowCommentBox(false);
        onCommentAdded();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to send comment');
      }
    } catch (error) {
      setError('Failed to send comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = (comment: Comment) => {
    setReplyTo({ 
      id: comment.id, 
      author: comment.author.firstName,
      lastName: comment.author.lastName 
    });
    setShowCommentBox(true);
    setNewComment('');
  };

  const handleCommentVote = async (commentId: number, isUpvote: boolean) => {
    try {
      const response = await fetch(`/api/posts/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ 
          targetId: commentId,
          targetType: 'COMMENT',
          isUpvote 
        }),
        credentials: 'include',
      });

      onCommentAdded();
      
    } catch (error) {
      console.error('Failed to vote:', error);
      onCommentAdded();
    }
  };

  const renderComment = (comment: Comment) => {
    const renderCommentContent = (content: string) => {
      const parts = content.split(/(@\w+\s+\w+)/);
      return (
        <Typography variant="body1">
          {parts.map((part, index) => {
            if (part.startsWith('@')) {
              return (
                <Typography
                  key={index}
                  component="span"
                  sx={{ color: 'primary.main' }}
                >
                  {part}
                </Typography>
              );
            }
            return part;
          })}
        </Typography>
      );
    };

    return (
      <Box sx={{ 
        wordBreak: 'break-word', 
        width: {
          xs: '100%',
          sm: '90%',
          md: '80%'
        }
      }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Avatar>{comment.author.firstName[0]}</Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2">
              {comment.author.firstName} {comment.author.lastName}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                mt: 1,
                overflowWrap: 'break-word',
                whiteSpace: 'pre-wrap'
              }}
            >
              {renderCommentContent(comment.content)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <IconButton 
                size="small" 
                onClick={() => handleCommentVote(comment.id, true)}
                sx={{ mr: 0.5, color: 'grey' }} 
              >
                <ThumbUpIcon fontSize="small" />
              </IconButton>
              <Typography variant="body2">
                {comment.votes.filter(vote => vote.isUpvote).length}
              </Typography>
              <IconButton 
                size="small" 
                onClick={() => handleCommentVote(comment.id, false)}
                sx={{ mr: 0.5, color: 'grey' }} 
              >
                <ThumbDown fontSize="small" />
              </IconButton>
              <Typography variant="body2">
                {comment.votes.filter(vote => !vote.isUpvote).length}
              </Typography>
              <IconButton
                size="small"
                onClick={() => handleReply(comment)}
                sx={{ mr: 0.5, color: 'grey' }} 
              >
                <CommentIcon fontSize="small" />
              </IconButton>
            </Box>
            {showCommentBox && replyTo?.id === comment.id && (
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write your reply..."
                  variant="outlined"
                  size="small"
                  sx={{ mb: 1 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <Button 
                    onClick={() => {
                      setShowCommentBox(false);
                      setReplyTo(null);
                    }}
                    variant="text"
                    size="small"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    variant="contained"
                    size="small"
                  >
                    Reply
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    );
  };

  const findRootComment = (comment: Comment): Comment | undefined => {
    if (!comment.parentId) return comment;
    const parentComment = comments.find(c => c.id === comment.parentId);
    return parentComment ? findRootComment(parentComment) : undefined;
  };

  const organizeComments = () => {
    const mainComments = sortedComments;
    const replies = sortedReplies.length > 0 ? sortedReplies : comments.filter(comment => comment.parentId);
    
    return mainComments.map(mainComment => ({
      ...mainComment,
      replies: replies.filter(reply => {
        const rootComment = findRootComment(reply);
        return rootComment?.id === mainComment.id;
      })
    }));
  };

  const handleSortChange = (newSortBy: 'latest' | 'votes') => {
    setSortBy(newSortBy);
    
    const mainComments = comments.filter(comment => !comment.parentId);
    const replies = comments.filter(comment => comment.parentId);

    const sortedMain = [...mainComments].sort((a, b) => {
      if (newSortBy === 'votes') {
        const aVotes = a.votes.filter(vote => vote.isUpvote).length - a.votes.filter(vote => !vote.isUpvote).length;
        const bVotes = b.votes.filter(vote => vote.isUpvote).length - b.votes.filter(vote => !vote.isUpvote).length;
        if (bVotes !== aVotes) {
          return bVotes - aVotes;
        }
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    setSortedComments(sortedMain);

    const sortedRepliesList = [...replies].sort((a, b) => {
      if (newSortBy === 'votes') {
        const aVotes = a.votes.filter(vote => vote.isUpvote).length - a.votes.filter(vote => !vote.isUpvote).length;
        const bVotes = b.votes.filter(vote => vote.isUpvote).length - b.votes.filter(vote => !vote.isUpvote).length;
        if (bVotes !== aVotes) {
          return bVotes - aVotes;
        }
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    setSortedReplies(sortedRepliesList);
    
    setAnchorEl(null);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          size="small"
          variant="outlined"
          onClick={(event) => {
            setAnchorEl(event.currentTarget);
          }}
          sx={{ 
            color: 'text.secondary',
            border: '1px solid',
            borderColor: 'divider',
            textTransform: 'none',
            minWidth: '160px',
            width: '160px',
            height: '32px',
            borderRadius: '4px',
            display: 'flex',
            justifyContent: 'space-between',
            '&:hover': {
              borderColor: 'primary.main'
            }
          }}
        >
          <span>Sort by: {sortBy === 'latest' ? 'Latest' : 'Votes'}</span>
          <ExpandMore />
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            elevation: 0,
            sx: {
              width: '160px',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '4px',
              mt: 0.5,
              '& .MuiMenuItem-root': {
                fontSize: '0.875rem',
                py: 1
              }
            }
          }}
        >
          <MenuItem 
            onClick={() => handleSortChange('latest')}
          >
            Latest
          </MenuItem>
          <MenuItem 
            onClick={() => handleSortChange('votes')}
          >
            Most Votes
          </MenuItem>
        </Menu>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {organizeComments().map(mainComment => (
          <Box key={mainComment.id}>
            {renderComment(mainComment)}
            {mainComment.replies.length > 0 && (
              <Button
                size="small"
                onClick={() => toggleCollapse(mainComment.id)}
                sx={{ 
                  ml: 6, 
                  mt: 1, 
                  color: 'primary.light', 
                  '&:hover': {
                    backgroundColor: 'transparent',
                    color: 'primary.main'
                  }
                }}
              >
                {collapsedComments.has(mainComment.id) 
                  ? `View ${mainComment.replies.length} replies` 
                  : 'Hide replies'}
              </Button>
            )}
            {!collapsedComments.has(mainComment.id) && mainComment.replies.length > 0 && (
              <Box sx={{ ml: 6, display: 'flex', flexDirection: 'column', gap: 3, mt: 3 }}>
                {mainComment.replies.map(reply => (
                  <Box key={reply.id}>
                    {renderComment(reply)}
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
