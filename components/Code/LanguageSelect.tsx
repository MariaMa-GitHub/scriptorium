import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

interface LanguageSelectProps {
  language: string;
  onLanguageChange: (language: string) => void;
}

const LANGUAGES = [
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'java', label: 'Java' }, 
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'rust', label: 'Rust' },
  { value: 'php', label: 'PHP' },
  { value: 'bash', label: 'Bash' },
  { value: 'perl', label: 'Perl' }
];

export default function LanguageSelect({ language, onLanguageChange }: LanguageSelectProps) {
  return (
    <FormControl fullWidth variant="outlined" size="small">
      <InputLabel>Language</InputLabel>
      <Select
        value={language}
        onChange={(e) => onLanguageChange(e.target.value)}
        label="Language"
      >
        {LANGUAGES.map(lang => (
                <MenuItem key={lang.value} value={lang.value}>
                    {lang.label}
                </MenuItem>
            ))}
      </Select>
    </FormControl>
  );
}