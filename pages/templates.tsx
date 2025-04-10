import { useEffect, useState } from 'react';
import { Box, Typography, Button, TextField, FormControl, InputLabel, Select, MenuItem, Alert, CircularProgress, Container } from '@mui/material';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import TemplateGrid from '@/components/Templates/TemplateGrid';
import Pagination from '@mui/material/Pagination';

type SortOption = 'title' | 'tags' | 'content';

export default function Templates() {
  const router = useRouter();
  const { query } = router;
  
  const [templates, setTemplates] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('title');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuth();

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
        page: newPage.toString(),
        limit: '9'
      });

      fetch(`/api/templates/search?${params}`)
        .then(response => response.json())
        .then(data => {
          if (data.error) {
            setError(data.error);
          } else {
            setTemplates(data.templates);
            setTotalPages(data.totalPages);
            setError('');
          }
        })
        .catch(() => setError('Failed to search templates'))
        .finally(() => setLoading(false));
    } else {
      fetchTemplates();
    }
  }, [router.isReady, router.query]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/templates/list?page=${page}&limit=9`);
      const data = await response.json();
      if (response.ok) {
        setTemplates(data.templates);
        setTotalPages(data.totalPages);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  const updateUrlParams = (newQuery?: string, newSortBy?: SortOption, newPage?: number) => {
    const params: any = {};
    if (newQuery) params.query = newQuery;
    if (newSortBy) params.sortBy = newSortBy;
    if (newPage) params.page = newPage;

    router.push({
      pathname: '/templates',
      query: params
    }, undefined, { shallow: true });
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      router.push('/templates');
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

  const handleFork = async (id: number) => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch('/api/templates/fork', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          originalId: id
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        router.push(`/templates/${data.id}`);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fork template');
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            Code Templates
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => {
              if (!user) {
                router.push('/login');
              } else {
                router.push('/editor');
              }
            }}
          >
            Create New Template
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
            label="Search templates"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchQuery.trim() && handleSearch()}
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Search By</InputLabel>
            <Select
              value={sortBy}
              label="Search By"
              onChange={(e) => handleSortChange(e.target.value as SortOption)}
            >
              <MenuItem value="title">Title</MenuItem>
              <MenuItem value="tags">Tags</MenuItem>
              <MenuItem value="content">Content</MenuItem>
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
            <TemplateGrid 
              templates={templates}
              onFork={handleFork}
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