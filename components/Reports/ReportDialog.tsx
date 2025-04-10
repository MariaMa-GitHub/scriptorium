import { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField,
  Alert,
  Box,
  Fade
} from '@mui/material';

interface ReportDialogProps {
  open: boolean;
  onClose: () => void;
  contentType: 'POST' | 'COMMENT';
  contentId: number;
}

export default function ReportDialog({ open, onClose, contentType, contentId }: ReportDialogProps) {
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const handleSubmit = async () => {
      if (!reason.trim()) {
        setError('Please provide a reason for the report');
        return;
      }
  
      setSubmitting(true);
      setError('');
      try {
        const response = await fetch('/api/reports/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
          body: JSON.stringify({
            contentType,
            contentId,
            reason: reason.trim()
          })
        });
  
        if (!response.ok) {
          const data = await response.json();
          setError(data.error);
          return;
        }

        setSuccess(true);
        // Close dialog after 2 seconds
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 2000);
  
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to submit report');
      } finally {
        setSubmitting(false);
      }
    };

    const handleClose = () => {
    setSuccess(false);
    setError('');
    setReason('');
    onClose();
    };
  
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <Box sx={{ p: 3 }}>
          <DialogTitle sx={{ p: 0, mb: 3 }}>Report {contentType.toLowerCase()}</DialogTitle>
          <DialogContent sx={{ p: 0, mb: 3 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            {success && (
              <Fade in={success}>
                <Alert severity="success" sx={{ mb: 3 }}>
                  Report submitted successfully
                </Alert>
              </Fade>
            )}
            <TextField
              autoFocus
              fullWidth
              label="Reason for report"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              multiline
              rows={4}
              sx={{ mb: 3 }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 0 }}>
            <Button onClick={onClose}>Cancel</Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained"
              disabled={submitting || !reason.trim()}
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    );
  }