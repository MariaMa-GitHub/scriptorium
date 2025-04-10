import { useState } from 'react';
import { Box, TextField, Button, Alert, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

interface TemplateFormProps {
  initialData?: {
    title: string;
    code: string;
    language: string;
    explanation: string;
    tagList: string;
  };
  onSubmit: (data: {
    title: string;
    code: string;
    language: string;
    explanation: string;
    tagList: string;
  }) => Promise<void>;
  buttonText: string;
}

export default function TemplateForm({ initialData, onSubmit, buttonText }: TemplateFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    code: initialData?.code || '',
    language: initialData?.language || 'javascript',
    explanation: initialData?.explanation || '',
    tagList: initialData?.tagList || '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLanguageChange = (e: any) => {
    setFormData(prev => ({ ...prev, language: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
    } catch (err) {
      setError('Failed to save template');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Title"
        name="title"
        value={formData.title}
        onChange={handleChange}
        required
        sx={{ mb: 2 }}
      />

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Language</InputLabel>
        <Select
          value={formData.language}
          label="Language"
          onChange={handleLanguageChange}
          required
        >
          <MenuItem value="javascript">JavaScript</MenuItem>
          <MenuItem value="python">Python</MenuItem>
          <MenuItem value="java">Java</MenuItem>
          <MenuItem value="cpp">C++</MenuItem>
          <MenuItem value="c">C</MenuItem>
        </Select>
      </FormControl>

      <TextField
        fullWidth
        label="Code"
        name="code"
        value={formData.code}
        onChange={handleChange}
        required
        multiline
        rows={10}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        label="Explanation"
        name="explanation"
        value={formData.explanation}
        onChange={handleChange}
        required
        multiline
        rows={4}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        label="Tags (comma-separated)"
        name="tagList"
        value={formData.tagList}
        onChange={handleChange}
        sx={{ mb: 2 }}
      />

      <Button
        type="submit"
        variant="contained"
        disabled={isSubmitting}
        fullWidth
      >
        {isSubmitting ? 'Saving...' : buttonText}
      </Button>
    </Box>
  );
}