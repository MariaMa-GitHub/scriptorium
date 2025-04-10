import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';

interface LanguageChangeDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  newLanguage: string;
}

export default function LanguageChangeDialog({ open, onClose, onConfirm, newLanguage }: LanguageChangeDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Box sx={{ p: 3 }}>
        <DialogTitle sx={{ p: 0, mb: 3 }}>Change Language Template</DialogTitle>
        <DialogContent sx={{ p: 0, mb: 3 }}>
          <Typography>
            Do you want to replace your current code with the default template for {newLanguage}?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 0 }}>
          <Button onClick={onClose}>Keep Current Code</Button>
          <Button onClick={onConfirm} variant="contained">Use New Template</Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}