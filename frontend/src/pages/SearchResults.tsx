import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Button,
} from '@mui/material';
import {
  Event as EventIcon,
  Work as WorkIcon,
  Article as ArticleIcon,
  LocationOn as LocationOnIcon,
  CalendarToday as CalendarTodayIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { eventService, jobService, blogService } from '../services/api';

interface SearchResult {
  _id: string;
  title: string;
  description?: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
  date?: string;
  location?: string;
  company?: string;
  jobType?: string;
  createdAt: string;
  createdBy: {
    firstName: string;
    lastName: string;
  };
  type: 'event' | 'job' | 'blog';
}

const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<SearchResult[]>([]);
  const [jobs, setJobs] = useState<SearchResult[]>([]);
  const [blogs, setBlogs] = useState<SearchResult[]>([]);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (query) {
      performSearch();
    }
  }, [query]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const [eventsRes, jobsRes, blogsRes] = await Promise.all([
        eventService.search(query).catch(() => ({ data: { data: [] } })),
        jobService.search(query).catch(() => ({ data: { data: [] } })),
        blogService.search(query).catch(() => ({ data: { data: [] } })),
      ]);

      const eventsData = (eventsRes.data.data || []).map((item: any) => ({ ...item, type: 'event' as const }));
      const jobsData = (jobsRes.data.data || []).map((item: any) => ({ ...item, type: 'job' as const }));
      const blogsData = (blogsRes.data.data || []).map((item: any) => ({ ...item, type: 'blog' as const }));

      setEvents(eventsData);
      setJobs(jobsData);
      setBlogs(blogsData);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handleItemClick = (item: SearchResult) => {
    if (item.type === 'event') {
      navigate(`/events/${item._id}`);
    } else if (item.type === 'job') {
      navigate(`/jobs/${item._id}`);
    } else if (item.type === 'blog') {
      navigate(`/blogs/${item._id}`);
    }
  };

  const renderResults = (results: SearchResult[]) => {
    if (results.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No results found
          </Typography>
        </Box>
      );
    }

    return (
      <Grid container spacing={3}>
        {results.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item._id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
              onClick={() => handleItemClick(item)}
            >
              {item.coverImage && (
                <CardMedia
                  component="img"
                  height="180"
                  image={item.coverImage}
                  alt={item.title}
                  sx={{ objectFit: 'cover' }}
                />
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {item.type === 'event' && <EventIcon sx={{ mr: 1, color: '#667eea' }} />}
                  {item.type === 'job' && <WorkIcon sx={{ mr: 1, color: '#f093fb' }} />}
                  {item.type === 'blog' && <ArticleIcon sx={{ mr: 1, color: '#4facfe' }} />}
                  <Chip
                    label={item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    size="small"
                    color={item.type === 'event' ? 'primary' : item.type === 'job' ? 'secondary' : 'info'}
                  />
                </Box>
                
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  {truncateText(item.title, 60)}
                </Typography>

                {item.type === 'event' && item.date && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarTodayIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(item.date)}
                    </Typography>
                  </Box>
                )}

                {item.type === 'event' && item.location && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOnIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {truncateText(item.location, 40)}
                    </Typography>
                  </Box>
                )}

                {item.type === 'job' && item.company && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <BusinessIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {item.company}
                    </Typography>
                  </Box>
                )}

                {item.type === 'job' && item.jobType && (
                  <Chip label={item.jobType} size="small" sx={{ mb: 1 }} />
                )}

                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {truncateText(
                    item.description || item.excerpt || item.content || '',
                    120
                  )}
                </Typography>

                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                  By {item.createdBy.firstName} {item.createdBy.lastName}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  const totalResults = events.length + jobs.length + blogs.length;

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 6 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Search Results
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {totalResults} result{totalResults !== 1 ? 's' : ''} found for "{query}"
        </Typography>

        {totalResults === 0 ? (
          <Alert severity="info" sx={{ mb: 3 }}>
            No results found for your search. Try using different keywords.
          </Alert>
        ) : (
          <>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs value={activeTab} onChange={handleTabChange}>
                <Tab label={`All (${totalResults})`} />
                <Tab label={`Events (${events.length})`} />
                <Tab label={`Jobs (${jobs.length})`} />
                <Tab label={`Blogs (${blogs.length})`} />
              </Tabs>
            </Box>

            {activeTab === 0 && renderResults([...events, ...jobs, ...blogs])}
            {activeTab === 1 && renderResults(events)}
            {activeTab === 2 && renderResults(jobs)}
            {activeTab === 3 && renderResults(blogs)}
          </>
        )}
      </Box>
    </Container>
  );
};

export default SearchResults;
