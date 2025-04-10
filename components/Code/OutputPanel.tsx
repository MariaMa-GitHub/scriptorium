import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CodeIcon from '@mui/icons-material/Code';

interface OutputPanelProps {
  output: string;
  error?: string;
  isLoading: boolean;
  executionTime?: number;
}

export default function OutputPanel({ output, error, isLoading, executionTime }: OutputPanelProps) {
  if (isLoading) {
    return (
        <Paper 
            elevation={0} 
            sx={{ 
                p: 2,
                height: '100%',
                border: 2,
                borderColor: theme => theme.palette.mode === 'dark' ? 'grey.800' : 'grey.300',
                bgcolor: theme => theme.palette.mode === 'dark' ? 'transparent' : 'background.paper',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
        <CircularProgress size={40} />
      </Paper>
    );
  }

  return (
    <Paper 
      elevation={0} 
      sx={{ 
          p: 2,
          height: '100%',
          border: 2,
          borderColor: theme => 
            error ? 'error.main' : 
            output ? 'success.main' :
            (theme.palette.mode === 'dark' ? 'grey.800' : 'grey.300'),
            bgcolor: error ? 'rgba(211, 47, 47, 0.15)' : 
            output ? 'rgba(46, 125, 50, 0.1)' :
            (theme => theme.palette.mode === 'dark' ? 'transparent' : 'background.paper'),
          position: 'relative',
          display: 'flex',
          flexDirection: 'column'
      }}
    >
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
      {error ? (
          <ErrorOutlineIcon color="error" />
      ) : output ? (
          <CheckCircleOutlineIcon color="success" />
      ) : (
          <CodeIcon color="disabled" />
      )}
      <Typography variant="subtitle2" color={error ? 'error' : output ? 'success' : 'text.secondary'}>
          {error ? 'Execution Failed' : output ? 'Execution Successful' : 'No code executed yet'}
          {executionTime && ` (${executionTime}ms)`}
      </Typography>
    </Box>

      <Box 
        sx={{ 
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap',
          overflowY: 'auto',
          overflowX: 'auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
      >
      {error && <Box sx={{ color: 'error.main' }}>{error}</Box>}
      {output && <Box>{output}</Box>}
      </Box>
    </Paper>
  );
}