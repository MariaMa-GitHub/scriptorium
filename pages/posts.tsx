import { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Pagination
} from '@mui/material';
import PostGrid from '@/components/Posts/PostGrid';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';

type SortOption = 'title' | 'tags' | 'content' | 'templates';

export default function Posts() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('title');
  const [error, setError] = useState('');
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!router.isReady) return;

    const { query: urlQuery, sortBy: urlSortBy, page: urlPage } = router.query;
    
    const newSearchQuery = urlQuery as string || '';
    const newSortBy = urlSortBy as SortOption || 'title';
    const newPage = urlPage ? parseInt(urlPage as string) : 1;

    setSearchQuery(newSearchQuery);
    setSortBy(newSortBy);
    setPage(newPage);

    if (newSearchQuery) {
      const params = new URLSearchParams({
        query: newSearchQuery,
        sortByTitle: (newSortBy === 'title').toString(),
        sortByTags: (newSortBy === 'tags').toString(),
        sortByContent: (newSortBy === 'content').toString(),
        sortByTemplates: (newSortBy === 'templates').toString(),
        page: newPage.toString(),
        limit: '9'
      });

      fetch(`/api/posts/search?${params}`)
        .then(response => response.json())
        .then(data => {
          if (data.error) {
            setError(data.error);
          } else {
            data.posts.forEach((post: any) => {
              post.upvotes = post.votes.filter((vote: any) => vote.isUpvote).length;
              post.downvotes = post.votes.filter((vote: any) => !vote.isUpvote).length;
              post.commentCount = post.comments.length;
            });
            // Add this sorting function before setting posts
            if (data.posts) {
              data.posts.sort((a: any, b: any) => {
                const ratingA = a.upvotes - a.downvotes;
                const ratingB = b.upvotes - b.downvotes;
                if (ratingB === ratingA) {
                  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                }
                return ratingB - ratingA;
              });
            }
            setPosts(data.posts);
            setTotalPages(data.totalPages);
            setError('');
          }
        })
        .catch(() => setError('Failed to search posts'))
        .finally(() => setLoading(false));
    } else {
      const fetchInitialPosts = async () => {
        setLoading(true);
        try {
          const response = await fetch(`/api/posts/list?page=${newPage}&limit=9`);
          const data = await response.json();
          if (response.ok) {
            data.posts.forEach((post: any) => {
              post.upvotes = post.votes.filter((vote: any) => vote.isUpvote).length;
              post.downvotes = post.votes.filter((vote: any) => !vote.isUpvote).length;
              post.commentCount = post.comments.length;
            });
            if (data.posts) {
              data.posts.sort((a: any, b: any) => {
                const ratingA = a.upvotes - a.downvotes;
                const ratingB = b.upvotes - b.downvotes;
                if (ratingB === ratingA) {
                  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                }
                return ratingB - ratingA;
              });
            }
            setPosts(data.posts);
            setTotalPages(data.totalPages);
          } else {
            setError(data.error);
          }
        } catch (err) {
          setError('Failed to fetch posts');
        } finally {
          setLoading(false);
        }
      };
      fetchInitialPosts();
    }
  }, [router.isReady, router.query]);

  const updateUrlParams = (newQuery?: string, newSortBy?: SortOption, newPage?: number) => {
    const params: any = {};
    if (newQuery) params.query = newQuery;
    if (newSortBy) params.sortBy = newSortBy;
    if (newPage) params.page = newPage;

    router.push({
      pathname: '/posts',
      query: params
    }, undefined, { shallow: true });
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      router.push('/posts');
      return;
    }
    
    setLoading(true);
    updateUrlParams(searchQuery, sortBy, page);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    updateUrlParams(searchQuery, sortBy, value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (newSortBy: SortOption) => {
    setSortBy(newSortBy);
    updateUrlParams(searchQuery, newSortBy, page);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            Blog Posts
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => {
              if (user) {
                router.push('/create-post');
              } 
              else {
                router.push('/login');
              }
            }}
          >
            Create New Post
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            label="Search posts"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchQuery.trim() && handleSearch()}
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Search By</InputLabel>
            <Select
              value={sortBy}
              label="Search By"
              onChange={(e) => setSortBy(e.target.value as SortOption)}
            >
              <MenuItem value="title">Title</MenuItem>
              <MenuItem value="tags">Tags</MenuItem>
              <MenuItem value="content">Content</MenuItem>
              <MenuItem value="templates">Templates</MenuItem>
            </Select>
          </FormControl>
          <Button 
            variant="contained" 
            onClick={() => handleSearch()}
          >
            Search
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <PostGrid 
              posts={posts}
              isOwner={false}
            />
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination 
                  count={totalPages} 
                  page={page} 
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                />
              </Box>
            )}
          </>
        )}
      </Box>
    </Container>
  );
}
