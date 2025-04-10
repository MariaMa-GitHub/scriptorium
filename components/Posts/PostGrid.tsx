import { Grid } from '@mui/material';
import PostCard from './PostCard';

interface PostGridProps {
  posts: Array<{
    id: number;
    title: string;
    content: string;
    description: string;
    author: {
      firstName: string;
      lastName: string;
    };
    createdAt: string;
    tags: { name: string }[];
    upvotes: number;
    downvotes: number;
    commentCount: number;
  }>;
  isOwner?: boolean;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export default function PostGrid({ posts, isOwner, onEdit, onDelete }: PostGridProps) {
  return (
    <Grid container spacing={3}>
      {posts.map((post) => (
        <Grid item xs={12} sm={6} md={4} key={post.id}>
          <PostCard
            {...post}
            isOwner={isOwner}
            onEdit={() => onEdit?.(post.id)}
            onDelete={() => onDelete?.(post.id)}
          />
        </Grid>
      ))}
    </Grid>
  );
} 