import { Grid } from '@mui/material';
import TemplateCard from './TemplateCard';

interface Template {
  id: number;
  title: string;
  language: string;
  explanation: string;
  tags: { name: string }[];
}

interface TemplateGridProps {
  templates: Template[];
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onFork?: (id: number) => void;
  isOwner?: boolean;
}

export default function TemplateGrid({ 
  templates, 
  onEdit,
  onDelete,
  onFork,
  isOwner = false 
}: TemplateGridProps) {
  return (
    <Grid container spacing={3}>
      {templates.map((template) => (
        <Grid item key={template.id} xs={12} sm={6} md={4}>
          <TemplateCard
            {...template}
            onEdit={onEdit ? () => onEdit(template.id) : undefined}
            onDelete={onDelete ? () => onDelete(template.id) : undefined}
            onFork={onFork ? () => onFork(template.id) : undefined}
            isOwner={isOwner}
          />
        </Grid>
      ))}
    </Grid>
  );
}