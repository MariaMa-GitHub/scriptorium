import { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Alert, 
  CircularProgress, 
  Button,
  IconButton,
  Snackbar,
  Chip
} from '@mui/material';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import Editor from '@monaco-editor/react';
import { useTheme } from '@mui/material/styles';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';
import UpdateTemplateModal from '@/components/Templates/UpdateTemplateModal';
import ForkRightIcon from '@mui/icons-material/ForkRight';


interface Template {
  id: number;
  title: string;
  code: string;
  language: string;
  explanation: string;
  createdAt: string;
  author: {
    id: number;
    firstName: string;
    lastName: string;
  };
  tags: { name: string }[];
  posts?: {
    id: number;
    title: string;
    description: string;
    author: {
      firstName: string;
      lastName: string;
    };
    tags: { name: string }[];
  }[];
}

export default function TemplateDetail() {
  const router = useRouter();
  const { id } = router.query;
  const theme = useTheme();
  const { user } = useAuth();
  const [template, setTemplate] = useState<Template | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTemplate();
    }
  }, [id]);

  useEffect(() => {
    if (router.query.edit === 'true' && template && user && template.author.id === user.id) {
      setIsEditMode(true);
    }
  }, [router.query, template, user]);

  const fetchTemplate = async () => {
    try {
      const response = await fetch(`/api/templates/fetch/${id}`);
      const data = await response.json();
      
      if (response.ok) {
        setTemplate(data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch template');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (template?.code) {
      await navigator.clipboard.writeText(template.code);
      setCopySuccess(true);
    }
  };

  const handleOpenInEditor = () => {
    router.push({
      pathname: '/editor',
      query: { 
        code: template?.code,
        language: template?.language
      }
    });
  };

  const handleUpdateSuccess = () => {
    setIsEditMode(false);
    fetchTemplate();
  };

  const handleFork = async () => {
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
        body: JSON.stringify({
          originalId: template?.id
        }),
      });

      if (response.ok) {
        const forkedTemplate = await response.json();
        router.push(`/templates/${forkedTemplate.id}`);
      } else {
        const errorData = await response.json();
        console.error('Failed to fork template:', errorData.error);
      }
    } catch (error) {
      console.error('Failed to fork template:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!template) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 4 }}>
          {error || 'Template not found'}
        </Alert>
      </Container>
    );
  }

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
            {template.title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
            <IconButton 
            onClick={handleCopyCode}
            sx={{ 
                color: 'primary.main',
                '&:hover': {
                bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(147, 51, 234, 0.1)' : 'rgba(124, 58, 237, 0.1)'
                }
            }}
            >
            <ContentCopyIcon />
            </IconButton>
            {user && user.id !== template.author.id && (
              <Button
                variant="contained"
                onClick={handleFork}
                startIcon={<ForkRightIcon />}
              >
                Fork
              </Button>
            )}
            <Button
                variant="contained"
                onClick={handleOpenInEditor}
                startIcon={<EditIcon />}
            >
                Open in Editor
            </Button>
            </Box>
        </Box>

        <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
          {template.tags.map((tag) => (
            <Chip key={tag.name} label={tag.name} size="small" />
          ))}
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          By {template.author.firstName} {template.author.lastName} • {new Date(template.createdAt).toLocaleDateString()}
        </Typography>

        {template.explanation && (
          <Typography 
            variant="subtitle1" 
            sx={{ 
              mb: 4,
              color: theme => theme.palette.mode === 'dark' ? 'grey.400' : 'grey.700',
              fontStyle: 'italic'
            }}
          >
            {template.explanation}
          </Typography>
        )}

        <Paper elevation={0} sx={{ 
          height: '60vh',
          border: 2,
          borderColor: theme => theme.palette.mode === 'dark' ? 'grey.800' : 'grey.300',
          overflow: 'hidden' 
        }}>
          <Editor
            height="100%"
            defaultLanguage={template.language}
            value={template.code}
            theme={theme.palette.mode === 'dark' ? 'vs-dark' : 'vs-light'}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 16, bottom: 16 },
              scrollbar: {
                alwaysConsumeMouseWheel: false  
              }
            }}
          />
        </Paper>

        {template.posts && template.posts.length > 0 && (
          <Box sx={{ 
            mt: 4,
            pt: 2,
            borderTop: 1,
            borderColor: theme => theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200'
          }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Related Blog Posts
            </Typography>
            {template.posts.map((post) => (
              <Chip
                key={post.id}
                label={post.title}
                onClick={() => router.push(`/posts/${post.id}`)}
                sx={{ mr: 1, mb: 1 }}
              />
            ))}
          </Box>
        )}

        {user && template && user.id === template.author.id && (
          <UpdateTemplateModal 
            open={isEditMode}
            onClose={() => setIsEditMode(false)}
            template={template}
            onUpdate={handleUpdateSuccess}
          />
        )}

        <Snackbar
          open={copySuccess}
          autoHideDuration={2000}
          onClose={() => setCopySuccess(false)}
          message="Code copied to clipboard"
        />
        </Paper>
      </Box>
    </Container>
  );
}