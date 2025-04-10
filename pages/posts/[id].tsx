import { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Chip,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  TextField,
  Button
} from '@mui/material';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { ThumbUp, ThumbDown, Comment } from '@mui/icons-material';
import UpdatePostModal from '@/components/Posts/UpdatePostModal';
import { Flag } from '@mui/icons-material';
import ReportDialog from '@/components/Reports/ReportDialog';
import CommentSection from '@/components/Comments/CommentSection';

interface Post {
    id: number;
    title: string;
    description: string;
    content: string;
    isHidden: boolean;
    author: {
        id: number;
        firstName: string;
        lastName: string;
        avatar: string;
    };
    tags: { name: string }[];
    templates: { id: number; title: string }[];
    comments: {
        id: number;
        content: string;
        parentId: number | null;
        isHidden: boolean;
        author: {
            id: number;
            firstName: string;
            lastName: string;
            avatar: string;
        };
        votes: { id: number; isUpvote: boolean, voterId: number }[];
        reports: { id: number; reason: string; reporterId: number }[];
        createdAt: string;
    }[];
    votes: { id: number; isUpvote: boolean, voterId: number }[];
    reports: { id: number; reason: string; reporterId: number }[];
    createdAt: string;
    upvotes: number;
    downvotes: number;
    commentCount: number;
    reportCount: number;
  }

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

export default function PostView() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [newComment, setNewComment] = useState('');

  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportedContentType, setReportedContentType] = useState<'POST' | 'COMMENT'>('POST');
  const [reportedContentId, setReportedContentId] = useState<number | null>(null);

  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id]);

  useEffect(() => {
    if (router.query.edit === 'true' && post && user && post.author.id === user.id && !post.isHidden) {
      setIsEditMode(true);
    }
  }, [router.query, post, user]);

  useEffect(() => {
    if (!router.isReady) return;
    fetchPost();
  }, [id, router.isReady]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/fetch/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        credentials: 'include',
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
        return;
      }
  
      // Check if post is hidden and user is not the author or admin
      if (data.isHidden && (!user || (user.id !== data.author.id && user.role !== 'ADMIN'))) {
        setError('This post has been hidden by an administrator.');
        return;
      }

      data.comments = data.comments.map((comment: any) => ({
        ...comment,
        // Only show hidden comments to admin or the comment author
        isVisible: !comment.isHidden || 
                   (user && (user.role === 'ADMIN' || comment.author.id === user.id))
      }));
  
      data.upvotes = data.votes.filter((vote: { isUpvote: boolean }) => vote.isUpvote).length;
      data.downvotes = data.votes.filter((vote: { isUpvote: boolean }) => !vote.isUpvote).length;
      data.commentCount = data.comments.length;
      data.reportCount = data.reports.length;
      
      setPost(data);

    } catch (err) {
      setError('Failed to fetch post ');
    } finally {
      setLoading(false);
    }
  
  };

  const handleVote = async (isUpvote: boolean) => {
    try {
      const response = await fetch('/api/posts/rate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          targetId: post?.id,
          targetType: 'POST',
          isUpvote
        }),
      });
      if (response.ok) {
        fetchPost();
      }
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const handleReport = (type: 'POST' | 'COMMENT', id: number) => {
    setReportedContentType(type);
    setReportedContentId(id);
    setReportDialogOpen(true);
  };

  const handleUpdateSuccess = () => {
    setIsEditMode(false);
    fetchPost();
  };

  const handleSubmitMainComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      const response = await fetch('/api/posts/comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          content: newComment,
          postId: post?.id,
          parentId: null
        }),
        credentials: 'include',
      });

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (response.ok) {
        setNewComment('');
        await fetchPost();
      }
    } catch (error) {
      console.error('Failed to submit comment:', error);
    }
  };

  const handlePostVote = async (isUpvote: boolean) => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`/api/posts/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ 
          targetId: id,
          targetType: 'POST',
          isUpvote
        }),
        credentials: 'include',
      });

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setPost(prev => {
          if (!prev) return null;
          
          let newVotes;
          if (data.vote === null) {
            newVotes = prev.votes.filter(v => v.voterId !== user.id);
          } else {
            const voteIndex = prev.votes.findIndex(v => v.voterId === user.id);
            if (voteIndex >= 0) {
              newVotes = [...prev.votes];
              newVotes[voteIndex] = data.vote;
            } else {
              newVotes = [...prev.votes, data.vote];
            }
          }
          
          return {
            ...prev,
            votes: newVotes,
            upvotes: newVotes.filter(v => v.isUpvote).length,
            downvotes: newVotes.filter(v => !v.isUpvote).length
          };
        });
      }
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const getUserVote = () => {
    if (!user || !post) return null;
    return post.votes.find(v => v.voterId === Number(user.id));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!post) return null;

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Paper sx={{ 
        p: 4, 
        mb: 4,
        border: 2,
        borderColor: theme => theme.palette.mode === 'dark' ? 'grey.800' : 'grey.300'
        }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1">
                {post.title}
                </Typography>
            </Box>

            <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
            {post.tags.map((tag) => (
                <Chip key={tag.name} label={tag.name} size="small" />
            ))}
            </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            By {post.author.firstName} {post.author.lastName} • {new Date(post.createdAt).toLocaleDateString()}
          </Typography>

          {post.description && (
            <Typography 
                variant="subtitle1" 
                sx={{ 
                mb: 4,
                color: theme => theme.palette.mode === 'dark' ? 'grey.400' : 'grey.700',
                fontStyle: 'italic'
                }}
            >
                {post.description}
            </Typography>
            )}

            {/* Show hidden content warning for author */}
            {post.isHidden && post.author.id === user?.id && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                This post has been hidden by an administrator due to reports ({post.reportCount} reports).
              </Alert>
            )}

            <Typography 
            variant="body1" 
            sx={{ 
                mb: 5,  // Increased margin bottom
                whiteSpace: 'pre-wrap',
                color: theme => theme.palette.mode === 'dark' ? 'grey.100' : 'grey.900',
                lineHeight: 1.7  // Increased line height for better readability
            }}
            >
            {post.content}
            </Typography>

            {post.templates.length > 0 && (
            <Box sx={{ 
                mb: 3,
                pt: 2,
                pb: 3,  // Added bottom padding
                borderTop: 1,
                borderBottom: 1,  // Added bottom border
                borderColor: theme => theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200'
            }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                Linked Templates
                </Typography>
                {post.templates.map((template) => (
                <Chip
                    key={template.id}
                    label={template.title}
                    onClick={() => router.push(`/templates/${template.id}`)}
                    sx={{ mr: 1 }}
                />
                ))}
            </Box>
            )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton 
                size="small"
                onClick={() => handleVote(true)}
                disabled={!user}
              >
              <ThumbUp color={post.votes.some(v => v.isUpvote && user?.id === v.voterId) ? "primary" : "inherit"} />
              </IconButton>
              <Typography variant="body2" sx={{ mx: 1 }}>
                {post?.upvotes || 0}
              </Typography>
              <IconButton 
                size="small"
                onClick={() => handleVote(false)}
                disabled={!user}
              >
              <ThumbDown color={post.votes.some(v => !v.isUpvote && user?.id === v.voterId) ? "primary" : "inherit"} />
              </IconButton>
              <Typography variant="body2" sx={{ mx: 1 }}>
                {post?.downvotes || 0}
              </Typography>
              {user && user.id !== post.author.id && (
                <IconButton 
                  onClick={() => handleReport('POST', post.id)}
                  title="Report post"
                >
                  <Flag color={post.reports?.some(r => r.reporterId === user?.id) ? "error" : "inherit"} />
                </IconButton>
              )}

            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton size="small" disabled={!user}>
                <Comment />
              </IconButton>
              <Typography variant="body2" sx={{ mx: 1 }}>
                {post.commentCount}
              </Typography>
            </Box>
          </Box>

          <CommentSection 
            postId={post.id}
            authorId={post.author.id}
            comments={post.comments}
            onCommentAdded={fetchPost}
            currentUser={user}
          />

        </Paper>

        {user && post && user.id === post.author.id && (
          <UpdatePostModal 
            open={isEditMode}
            onClose={() => setIsEditMode(false)}
            post={post}
            onUpdate={handleUpdateSuccess}
          />
        )}

        {reportedContentId && (
          <ReportDialog
            open={reportDialogOpen}
            onClose={() => setReportDialogOpen(false)}
            contentType={reportedContentType}
            contentId={reportedContentId}
          />
        )}

      </Box>

    </Container>
    
  );
}