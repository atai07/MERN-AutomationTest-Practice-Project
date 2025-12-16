import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Avatar,
  CircularProgress,
  Alert,
  Divider,
  Grid,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { getProfileImageUrl } from '../utils/imageHelper';
import { blogService } from '../services/api';

const StyledContainer = styled(Container)(({ theme }) => ({
  maxWidth: '1200px',
  padding: theme.spacing(4, 2),
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(6, 3),
  },
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(5),
}));

const DateText = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(2),
  fontWeight: 400,
  letterSpacing: '0.5px',
}));

const Title = styled(Typography)(({ theme }) => ({
  fontSize: '3rem',
  fontWeight: 700,
  lineHeight: 1.2,
  marginBottom: theme.spacing(3),
  color: '#1a1a1a',
  [theme.breakpoints.down('md')]: {
    fontSize: '2rem',
  },
}));

const Subtitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.125rem',
  lineHeight: 1.8,
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(3),
  maxWidth: '600px',
}));

const AuthorBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  marginTop: theme.spacing(3),
}));

const AuthorName = styled(Typography)(({ theme }) => ({
  fontSize: '0.9rem',
  color: theme.palette.text.primary,
  fontWeight: 500,
}));

const AuthorRole = styled(Typography)(({ theme }) => ({
  fontSize: '0.8rem',
  color: theme.palette.text.secondary,
}));

const HeroImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  borderRadius: '12px',
  display: 'block',
});

const ContentWrapper = styled(Box)(({ theme }) => ({
  maxWidth: '800px',
  margin: '0 auto',
  marginTop: theme.spacing(6),
}));

const ContentBox = styled(Box)(({ theme }) => ({
  '& p': {
    fontSize: '1.125rem',
    lineHeight: 1.9,
    color: '#1a1a1a',
    marginBottom: theme.spacing(3),
    textAlign: 'justify',
  },
  '& p:first-of-type::first-letter': {
    fontSize: '4.5rem',
    fontWeight: 700,
    float: 'left',
    lineHeight: 1,
    marginRight: '0.5rem',
    marginTop: '0.1rem',
    color: '#1a1a1a',
  },
  '& a': {
    color: '#1a1a1a',
    textDecoration: 'underline',
    textDecorationColor: '#1a1a1a',
    textDecorationThickness: '1px',
    textUnderlineOffset: '3px',
    fontWeight: 500,
    '&:hover': {
      textDecorationThickness: '2px',
    },
  },
}));

const QuoteBox = styled(Box)(({ theme }) => ({
  margin: theme.spacing(6, 0),
  padding: theme.spacing(0),
}));

const QuoteText = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  lineHeight: 1.6,
  color: '#1a1a1a',
  fontStyle: 'italic',
  marginBottom: theme.spacing(4),
  fontWeight: 400,
}));

const QuoteAuthorBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
}));

const QuoteAuthorName = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  color: theme.palette.text.primary,
  fontWeight: 600,
}));

interface Blog {
  _id: string;
  title: string;
  content: string;
  excerpt: string;
  coverImage: string;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImage?: string;
  };
  createdAt: string;
  updatedAt: string;
}

const BlogDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const response = await blogService.getById(id!);
        setBlog(response.data.data);
      } catch (err: any) {
        console.error('Error fetching blog:', err);
        setError(err.response?.data?.message || 'Failed to load blog');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBlog();
    }
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const parseContent = (content: string) => {
    // Split content into paragraphs
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    return paragraphs;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !blog) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error || 'Blog not found'}</Alert>
      </Container>
    );
  }

  const contentParagraphs = parseContent(blog.content);
  const authorFullName = `${blog.createdBy.firstName} ${blog.createdBy.lastName}`;

  return (
    <StyledContainer>
      {/* Header Section with Hero Image */}
      <HeaderSection>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <DateText>{formatDate(blog.createdAt)}</DateText>
            <Title>{blog.title}</Title>
            {blog.excerpt && <Subtitle>{blog.excerpt}</Subtitle>}
            
            <AuthorBox>
              <Avatar
                src={getProfileImageUrl(blog.createdBy.profileImage)}
                alt={authorFullName}
                sx={{ width: 48, height: 48 }}
              >
                {blog.createdBy.firstName[0]}
                {blog.createdBy.lastName[0]}
              </Avatar>
              <Box>
                <AuthorName>{authorFullName}</AuthorName>
                <AuthorRole>Design Lead, Canvas Ventures</AuthorRole>
              </Box>
            </AuthorBox>
          </Grid>
          
          {/* Hero Image */}
          {blog.coverImage && (
            <Grid item xs={12} md={6}>
              <Box sx={{ height: { xs: '300px', md: '400px' } }}>
                <HeroImage src={blog.coverImage} alt={blog.title} />
              </Box>
            </Grid>
          )}
        </Grid>
      </HeaderSection>

      {/* Content */}
      <ContentWrapper>
        <ContentBox>
          {contentParagraphs.map((paragraph, index) => (
            <Typography
              key={index}
              component="p"
              dangerouslySetInnerHTML={{ __html: paragraph }}
            />
          ))}
        </ContentBox>

        {/* Featured Quote Section */}
        {contentParagraphs.length > 2 && (
          <QuoteBox>
            <QuoteText>
              "{blog.title} allows us to streamline our planning, receipts, scheduling, payments, content, and design, so we can focus on simply creating and just helping customers. We've seen a truly amazing 32% increase in our total revenue since switching and now recommend it to everyone we know. We cannot imagine turning back at this point and are so happy we discovered it."
            </QuoteText>
            <QuoteAuthorBox>
              <Avatar
                src={getProfileImageUrl(blog.createdBy.profileImage)}
                alt={authorFullName}
                sx={{ width: 40, height: 40 }}
              >
                {blog.createdBy.firstName[0]}
                {blog.createdBy.lastName[0]}
              </Avatar>
              <Box>
                <QuoteAuthorName>{authorFullName}</QuoteAuthorName>
              </Box>
            </QuoteAuthorBox>
          </QuoteBox>
        )}

        <Divider sx={{ my: 6 }} />

        {/* Additional content paragraphs continue here */}
        {contentParagraphs.length > 3 && (
          <ContentBox>
            {contentParagraphs.slice(3).map((paragraph, index) => (
              <Typography
                key={`extra-${index}`}
                component="p"
                dangerouslySetInnerHTML={{ __html: paragraph }}
              />
            ))}
          </ContentBox>
        )}
      </ContentWrapper>
    </StyledContainer>
  );
};

export default BlogDetails;
