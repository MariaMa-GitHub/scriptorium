import { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Tabs, 
  Tab, 
  IconButton,
  Alert,
  Pagination,
  CircularProgress,
  Link as MuiLink
} from '@mui/material';
import { VisibilityOff } from '@mui/icons-material';
import { withAdminAuth } from '@/components/WithAdminAuth';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface ReportedPost {
  id: number;
  title?: string;
  description?: string;
  isHidden: boolean;
  author: {
    firstName: string;
    lastName: string;
  };
  reports: {
    id: number;
  }[];
  reportCount: number;
  createdAt: string;
}

interface ReportedComment {
  id: number;
  content: string;
  isHidden: boolean;
  author: {
    id: number;
    firstName: string;
    lastName: string;
  };
  postId: number;
  reports: {
    id: number;
  }[];
  reportCount: number;
  createdAt: string;
}

function ReportsPage() {
  const router = useRouter();
  const [tab, setTab] = useState(0);
  const [posts, setPosts] = useState<ReportedPost[]>([]);
  const [comments, setComments] = useState<ReportedComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [page, setPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [totalComments, setTotalComments] = useState(0);
  const [totalPagesPosts, setTotalPagesPosts] = useState(1);
  const [totalPagesComments, setTotalPagesComments] = useState(1);


  const fetchReportedContent = async () => {
    try {
      const response = await fetch(`/api/reports/sort?page=${page}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch reported content');
      }

      // Set reportCount for each post based on number of reports
      data.posts = data.posts.map((post: ReportedPost) => ({
        ...post,
        reportCount: post.reports.length
      }));

      // Set reportCount for each comment based on number of reports
      data.comments = data.comments.map((comment: ReportedComment) => ({
        ...comment,
        reportCount: comment.reports.length
      }));

      setPosts(data.posts);
      setComments(data.comments);
      setTotalPosts(data.totalPosts);
      setTotalComments(data.totalComments);
      setTotalPagesPosts(data.totalPagesPosts);
      setTotalPagesComments(data.totalPagesComments);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch reported content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportedContent();
  }, [page]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHideContent = async (type: 'POST' | 'COMMENT', id: number) => {
    try {
      const response = await fetch('/api/reports/hide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          contentType: type,
          contentId: id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to hide content');
      }

      fetchReportedContent();
    } catch (error) {
      console.error('Error hiding content:', error);
    }
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

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
          Reported Content
        </Typography>

        <Tabs value={tab} onChange={(_, newValue) => {setTab(newValue); setPage(1);}} sx={{ mb: 3 }}>
          <Tab label={`Posts (${totalPosts})`} />
          <Tab label={`Comments (${totalComments})`} />
        </Tabs>

        {tab === 0 && posts.map((post) => (
          <Paper key={post.id} sx={{ p: 3, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Link href={`/posts/${post.id}`} passHref>
                  <MuiLink sx={{ textDecoration: 'none' }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {post.title || 'Untitled Post'}
                    </Typography>
                  </MuiLink>
                </Link>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  By {post.author.firstName} {post.author.lastName} • {new Date(post.createdAt).toLocaleDateString()}
                </Typography>
                <Typography color="error">
                  {post.reportCount} reports • {post.isHidden ? 'Hidden' : 'Visible'}
                </Typography>
              </Box>
              <IconButton 
                onClick={() => handleHideContent('POST', post.id)}
                color={post.isHidden ? "error" : "default"}
              >
                <VisibilityOff />
              </IconButton>
            </Box>
          </Paper>
        ))}

        {/* Add this before the closing Container */}
        {tab === 0 && totalPagesPosts > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination 
                count={totalPagesPosts} 
                page={page} 
                onChange={handlePageChange}
                color="primary"
                size="large"
            />
            </Box>
        )}

        {tab === 1 && comments.length > 0 ? (
          comments.map((comment) => (
            <Paper key={comment.id} sx={{ p: 3, mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  {/* Make the comment content clickable and link to the associated post */}
                  <Link href={`/posts/${comment.postId}`} passHref>
                    <MuiLink sx={{ textDecoration: 'none' }}>
                      <Typography variant="body1" sx={{ mb: 2, cursor: 'pointer', color: 'primary.main' }}>
                        {comment.content}
                      </Typography>
                    </MuiLink>
                  </Link>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    By {comment.author.firstName} {comment.author.lastName} • {new Date(comment.createdAt).toLocaleDateString()}
                  </Typography>
                  <Typography color="error">
                    {comment.reportCount} reports • {comment.isHidden ? 'Hidden' : 'Visible'}
                  </Typography>
                </Box>
                <IconButton 
                  onClick={() => handleHideContent('COMMENT', comment.id)}
                  color={comment.isHidden ? "error" : "default"}
                >
                  <VisibilityOff />
                </IconButton>
              </Box>
            </Paper>
          ))
        ) : tab === 1 && comments.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            No reported comments.
          </Typography>
        ) : null}

{tab === 1 && totalPagesComments > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination 
            count={totalPagesComments} 
            page={page} 
            onChange={handlePageChange}
            color="primary"
            size="large"
          />
        </Box>
      )}
        
      </Box>
    </Container>
  );
}

export default withAdminAuth(ReportsPage);