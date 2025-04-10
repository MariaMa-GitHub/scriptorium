import { Box, Container, Typography } from '@mui/material';
import CodeEditor from '@/components/Code/Editor';

export default function EditorPage() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Code Editor
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }} gutterBottom>
          Write, run, and test your code in multiple programming languages
        </Typography>
        <CodeEditor />
      </Box>
    </Container>
  );
}