import { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  IconButton,
  Avatar,
  Collapse
} from '@mui/material';
import { ThumbUp, ThumbDown, Reply, Flag, ExpandMore, ExpandLess, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import ReportDialog from '@/components/Reports/ReportDialog';

interface Comment {
  id: number;
  content: string;
  parentId: number | null;
  author: {
    id: number;
    firstName: string;
    lastName: string;
    avatar: string;
  };
  votes: { id: number; isUpvote: boolean, voterId: number }[];
  reports: { id: number; reason: string; reporterId: number }[];
  isHidden: boolean;
  createdAt: string;
}

interface CommentSectionProps {
  postId: number;
  authorId: number;
  comments: Comment[];
  onCommentAdded: () => void;
  currentUser: any;
}

export default function CommentSection({ postId, authorId, comments, onCommentAdded, currentUser }: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const { user } = useAuth();

  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportedContentId, setReportedContentId] = useState<number | null>(null);
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());

  const handleSubmitComment = async () => {
    if (!user) {
      console.error('User is not logged in');
      return;
    }
    try {
      const response = await fetch('/api/posts/comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          content: newComment,
          postId,
          parentId: replyTo
        }),
      });

      if (response.ok) {
        setNewComment('');
        setReplyTo(null);
        onCommentAdded();
      }
    } catch (error) {
      console.error('Failed to submit comment:', error);
    }
  };

  const handleVote = async (commentId: number, isUpvote: boolean) => {
    try {
      await fetch('/api/posts/rate', {
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
      });
      onCommentAdded();
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const handleReport = (commentId: number) => {
    setReportedContentId(commentId);
    setReportDialogOpen(true);
  };

  const toggleReplies = (commentId: number) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  let mainComments = comments.filter(comment => 
    !comment.isHidden || comment.author.id === currentUser?.id
  ).filter(comment => comment.parentId === null);
  let replies = comments.filter(comment => comment.parentId !== null);

    type SortOption = 'time' | 'rating';

    // Add these states in the CommentSection component
    const [sortBy, setSortBy] = useState<SortOption>('time');

    // Add this sorting function before the return statement
    const sortComments = (comments: Comment[]) => {
    return [...comments].sort((a, b) => {
        if (sortBy === 'rating') {
        const ratingA = a.votes.filter(v => v.isUpvote).length - a.votes.filter(v => !v.isUpvote).length;
        const ratingB = b.votes.filter(v => v.isUpvote).length - b.votes.filter(v => !v.isUpvote).length;
        if (ratingB === ratingA) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return ratingB - ratingA;
        }
        // Default time sort
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    };

    const renderHiddenMessage = (reportCount: number) => (
        <Box sx={{ 
          py: 1, 
          px: 2, 
          bgcolor: 'action.hover', 
          borderRadius: 1,
          color: 'text.secondary',
          fontSize: '0.875rem',
          fontStyle: 'italic'
        }}>
          This comment has been hidden by an administrator due to reports ({reportCount} reports)
        </Box>
      );

    // Replace the existing sort lines (lines 114-115) with:
    mainComments = sortComments(mainComments);
    replies = sortComments(replies);


  return (
    <Box sx={{ mt: 4, borderTop: 1,
        borderColor: theme => theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200', pt: 2 }}>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
  <Typography variant="h6" >Comments</Typography>
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <Typography variant="body2" color="text.secondary">Sort by:</Typography>
    <Box 
      component="span" 
      onClick={() => setSortBy('time')}
      sx={{ 
        cursor: 'pointer',
        textDecoration: sortBy === 'time' ? 'underline' : 'none',
        color: sortBy === 'time' ? 'primary.main' : 'text.secondary',
      }}
    >
      Time
    </Box>
    <Typography variant="body2" color="text.secondary">|</Typography>
    <Box 
      component="span" 
      onClick={() => setSortBy('rating')}
      sx={{ 
        cursor: 'pointer',
        textDecoration: sortBy === 'rating' ? 'underline' : 'none',
        color: sortBy === 'rating' ? 'primary.main' : 'text.secondary',
      }}
    >
      Rating
    </Box>
  </Box>
</Box>
      
      <Box>
        <TextField
            fullWidth
            multiline
            rows={3}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={user ? (replyTo ? "Write a reply..." : "Write a comment...") : (replyTo ? "Login to reply..." : "Login to comment...")}
            sx={{ mb: 2 }} 
        />
        <Box sx={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: 1
        }}>
            {replyTo && (
            <Button onClick={() => setReplyTo(null)}>
                Cancel Reply
            </Button>
            )}
            <Button 
            variant="contained" 
            onClick={handleSubmitComment}
            disabled={!newComment.trim() || !user}
            >
            {replyTo ? 'Reply' : 'Comment'}
            </Button>
        </Box>
      </Box>

        {mainComments.map((comment) => (
        <Box key={comment.id} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mt: 2 }}>
            <Avatar src={comment.author.avatar} />
            <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle2">
                {comment.author.firstName} {comment.author.lastName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                • {new Date(comment.createdAt).toLocaleString(undefined, { 
                    year: 'numeric', 
                    month: 'numeric', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                })}
                </Typography>
            </Box>
            <Typography variant="body1" sx={{ my: 1 }}>
            {comment.isHidden && comment.author.id === user?.id 
                ? renderHiddenMessage(comment.reports.length)
                : comment.content
            }
            </Typography>
            
            {/* Comment actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton 
                size="small" 
                onClick={() => handleVote(comment.id, true)}
                >
                <ThumbUp sx={{ fontSize: '1rem' }} color={comment.votes.some(v => v.isUpvote && user?.id === v.voterId) ? "primary" : "inherit"} />
                </IconButton>
                <Typography>
                {comment.votes.filter(v => v.isUpvote).length}
                </Typography>
                <IconButton 
                size="small" 
                onClick={() => handleVote(comment.id, false)}
                >
                <ThumbDown sx={{ fontSize: '1rem' }} color={comment.votes.some(v => !v.isUpvote && user?.id === v.voterId) ? "primary" : "inherit"} />
                </IconButton>
                <Typography>
                {comment.votes.filter(v => !v.isUpvote).length}
                </Typography>
                {user && user.id !== authorId && (
                <IconButton 
                    onClick={() => handleReport(comment.id)}
                    title="Report comment"
                    size="small"
                >
                    <Flag color={comment.reports?.some(r => r.reporterId === user?.id) ? "error" : "inherit"} sx={{ fontSize: '1rem' }} />
                </IconButton>
                )}
                <IconButton 
                size="small" 
                onClick={() => setReplyTo(comment.id)}
                >
                <Reply sx={{ fontSize: '1.2rem' }} />
                </IconButton>
                {replies.filter(reply => reply.parentId === comment.id).length > 0 && (
                <IconButton 
                    size="small" 
                    onClick={() => toggleReplies(comment.id)}
                >
                    {expandedComments.has(comment.id) ? <ExpandLess sx={{ fontSize: '1.2rem' }} /> : <ExpandMore sx={{ fontSize: '1.2rem' }} />}
                </IconButton>
                )}
            </Box>

            {/* Replies */}
            <Collapse in={expandedComments.has(comment.id)} timeout="auto" unmountOnExit>
                <Box sx={{ mt: 2 }}>
                {replies
                .filter(reply => reply.parentId === comment.id && 
                    (!reply.isHidden || reply.author.id === currentUser?.id))
                .map(reply => (
                    <Box key={reply.id} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mb: 2 }}>
                        <Avatar src={comment.author.avatar} />
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle2">
                              {reply.author.firstName} {reply.author.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                            • {new Date(reply.createdAt).toLocaleString(undefined, { 
                                year: 'numeric', 
                                month: 'numeric', 
                                day: 'numeric', 
                                hour: '2-digit', 
                                minute: '2-digit' 
                            })}
                            </Typography>
                          </Box>
                          <Typography variant="body1" sx={{ my: 1 }}>
                            {reply.isHidden && reply.author.id === currentUser?.id 
                                ? renderHiddenMessage(reply.reports.length)
                                : reply.content
                            }
                            </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {/* Reply actions */}
                            <IconButton 
                            size="small" 
                            onClick={() => handleVote(reply.id, true)}
                            >
                            <ThumbUp sx={{ fontSize: '1rem' }} color={reply.votes.some(v => v.isUpvote && user?.id === v.voterId) ? "primary" : "inherit"} />
                            </IconButton>
                            <Typography>
                            {reply.votes.filter(v => v.isUpvote).length}
                            </Typography>
                            <IconButton 
                            size="small" 
                            onClick={() => handleVote(reply.id, false)}
                            >
                            <ThumbDown sx={{ fontSize: '1rem' }} color={reply.votes.some(v => !v.isUpvote && user?.id === v.voterId) ? "primary" : "inherit"} />
                            </IconButton>
                            <Typography>
                            {reply.votes.filter(v => !v.isUpvote).length}
                            </Typography>
                            {user && user.id !== authorId && (
                            <IconButton 
                                onClick={() => handleReport(reply.id)}
                                title="Report reply"
                                size="small"
                            >
                                <Flag color={reply.reports?.some(r => r.reporterId === user?.id) ? "error" : "inherit"} sx={{ fontSize: '1rem' }} />
                            </IconButton>
                            )}
                        </Box>
                        </Box>
                    </Box>
                    ))}
                </Box>
            </Collapse>
            </Box>
        </Box>
        ))}

      {reportedContentId && (
        <ReportDialog
          open={reportDialogOpen}
          onClose={() => setReportDialogOpen(false)}
          contentType="COMMENT"
          contentId={reportedContentId}
        />
      )}
    </Box>
  );
}