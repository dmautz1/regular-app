import { useState, useEffect, useCallback } from "react";
import { RouterBottomNavigation } from "../navigation/nav";
import { useApi } from '../../utils/api.js';
import {
  Container,
  Box,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Paper,
  Fade,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/system';
import ProgramsCards from "./cards";
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import ExploreIcon from '@mui/icons-material/Explore';

// Styled components
const PageContainer = styled(Container)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: '20px 0 0',
  height: '100vh',
  position: 'relative',
  overflow: 'hidden', // Prevent page scrolling
  paddingBottom: '92px' // Add space for bottom navigation
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  marginBottom: '24px',
  '& .MuiTabs-indicator': {
    backgroundColor: '#D81E58',
    height: '3px',
    borderRadius: '3px 3px 0 0',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  },
  '& .MuiTabs-flexContainer': {
    borderRadius: '12px',
    background: 'rgba(32, 43, 62, 0.8)',
    padding: '4px',
    boxShadow: '0 3px 8px rgba(0, 0, 0, 0.15)',
  },
  '& .MuiTab-root': {
    color: '#61759b',
    fontWeight: '500',
    fontSize: '1rem',
    borderRadius: '8px',
    minHeight: '48px',
    transition: 'all 0.3s ease',
    position: 'relative',
    zIndex: 1,
    margin: '0 4px',
    padding: '12px 16px',
    '& .MuiSvgIcon-root': {
      fontSize: '1.2rem',
      marginRight: '8px',
      marginBottom: '0',
    },
    '&.Mui-selected': {
      color: '#fff',
      fontWeight: '600',
      background: 'linear-gradient(to right, rgba(216, 30, 88, 0.15), rgba(138, 78, 252, 0.15))',
      '& .MuiSvgIcon-root': {
        color: '#D81E58',
      }
    },
    '&:hover:not(.Mui-selected)': {
      backgroundColor: 'rgba(138, 78, 252, 0.05)',
      color: '#8A96AB',
      '& .MuiSvgIcon-root': {
        color: '#8A4EFC',
      }
    }
  }
}));

const FilterContainer = styled(Paper)(({ theme }) => ({
  padding: '20px',
  marginBottom: '24px',
  borderRadius: '12px',
  backgroundColor: '#202B3E',
  boxShadow: '0 3px 8px rgba(0, 0, 0, 0.15)',
  flexShrink: 0
}));

const ContentSection = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden', // Change to hidden so child element handles scrolling
  paddingBottom: '20px',
  maxHeight: '100%'
}));

// Fix the scrolling Box component to have consistent scrollbar styling
const ScrollableContent = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  overflowX: 'hidden',
  padding: '16px',
  '&::-webkit-scrollbar': {
    width: '8px',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: 'rgba(138, 78, 252, 0.3)',
    borderRadius: '4px',
    '&:hover': {
      backgroundColor: 'rgba(138, 78, 252, 0.5)',
    }
  }
}));

// Fix TabPanel styling to use styled component for consistency
const StyledTabPanel = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: 'calc(100vh - 240px)', // Account for header, tabs, and bottom navigation
  overflow: 'hidden', // Hide overflow in the panel itself
  flex: 1
}));

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <StyledTabPanel
      role="tabpanel"
      hidden={value !== index}
      id={`programs-tabpanel-${index}`}
      aria-labelledby={`programs-tab-${index}`}
      sx={{ display: value === index ? 'flex' : 'none' }}
      {...other}
    >
      {value === index && (
        <Fade in={true} timeout={500}>
          <Box sx={{ 
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            animation: value === index ? 'fadeIn 0.5s ease-in-out' : 'none',
            '@keyframes fadeIn': {
              '0%': {
                opacity: 0,
                transform: 'translateY(10px)'
              },
              '100%': {
                opacity: 1,
                transform: 'translateY(0)'
              }
            }
          }}>
            {children}
          </Box>
        </Fade>
      )}
    </StyledTabPanel>
  );
}

function a11yProps(index) {
  return {
    id: `programs-tab-${index}`,
    'aria-controls': `programs-tabpanel-${index}`,
  };
}

function Programs() {
  const api = useApi();
  const [tabValue, setTabValue] = useState(0);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('popular');
  const [feedPrograms, setFeedPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState();
  const [userSubscriptions, setUserSubscriptions] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  const GetUserSubscriptions = useCallback(() => {
    setIsLoading(true);
    api.get('/programs/user')
      .then((data) => {
        setUserSubscriptions(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.log("Error: ", err);
        setUserSubscriptions([]);
      })
      .finally(() => setIsLoading(false));
  }, [api]);

  const GetFeedPrograms = useCallback(() => {
    setError(null);
    setIsLoading(true);
    api.get('/programs/feed')
      .then((data) => {
        const programs = Array.isArray(data) ? data : [];
        setFeedPrograms(programs);
        // Extract unique categories from programs
        const uniqueCategories = [...new Set(programs.map(program => program.category).filter(Boolean))];
        setCategories(uniqueCategories.sort());
      })
      .catch((err) => {
        console.log("Error: ", err);
        setError("An error occurred while loading programs.");
        setFeedPrograms([]);
        setCategories([]);
      })
      .finally(() => setIsLoading(false));
  }, [api, setError]);

  useEffect(() => {
    GetFeedPrograms();
    GetUserSubscriptions();
  }, []);

  const GetProgram = (id) => {
    api.get(`/programs/${id}`)
      .then((data) => {
        if (data && data.program) {
          setSelectedProgram(data.program);
        }
      })
      .catch((err) => console.log("Error: ", err));
  };

  const unsubscribeProgram = async (id) => {
    try {
      await api.delete(`/programs/subscribe/${id}`);
      setUserSubscriptions(userSubscriptions => userSubscriptions.filter(program => program.id !== id));
    } catch (err) {
      console.error("Error unsubscribing:", err);
      setError("An error occurred while unsubscribing.");
    }
  };

  const subscribeProgram = async (id) => {
    try {
      const data = await api.post(`/programs/subscribe/${id}`);
      // Refresh the subscription list after subscribing
      GetUserSubscriptions();
      setTabValue(0);
    } catch (err) {
      console.error("Error subscribing:", err);
      setError("An error occurred while subscribing.");
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (newValue === 1) { // Browse Programs tab
      setIsLoading(true);
      GetFeedPrograms();
    }
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const handleSortChange = (event) => {
    setSort(event.target.value);
  };

  const filteredPrograms = (feedPrograms || []).filter((program) => {
    if (filter === 'all') {
      return true;
    } else {
      return program.category === filter;
    }
  });

  const sortedPrograms = [...filteredPrograms].sort((a, b) => {
    if (sort === 'popular') {
      // Sort by number of subscribers using the subscriberCount field
      const aSubscribers = a.subscriberCount || 0;
      const bSubscribers = b.subscriberCount || 0;
      return bSubscribers - aSubscribers;
    } else if (sort === 'newest') {
      return new Date(b.startDate) - new Date(a.startDate);
    } else {
      return a.title.localeCompare(b.title);
    }
  });

  return (
    <PageContainer maxWidth="lg">      
      {error && (
        <Box sx={{ 
          mx: 2, 
          mb: 3, 
          p: 2, 
          bgcolor: 'rgba(255, 0, 0, 0.1)', 
          borderRadius: 2,
          color: 'white'
        }}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}
      
      <StyledTabs
        value={tabValue}
        onChange={handleTabChange}
        aria-label="program tabs"
        variant="fullWidth"
      >
        <Tab 
          label="My Subscriptions" 
          icon={<SubscriptionsIcon />} 
          iconPosition="start"
          {...a11yProps(0)} 
        />
        <Tab 
          label="Browse Programs" 
          icon={<ExploreIcon />} 
          iconPosition="start"
          {...a11yProps(1)} 
        />
      </StyledTabs>

      <TabPanel value={tabValue} index={0}>
        <ContentSection>
          {isLoading ? (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              minHeight: '200px',
              textAlign: 'center',
              padding: '40px 20px',
              color: '#61759b' 
            }}>
              <CircularProgress sx={{ color: '#8A4EFC', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#eee' }}>
                Loading your subscriptions...
              </Typography>
            </Box>
          ) : userSubscriptions.length > 0 ? (
            <ScrollableContent>
              <ProgramsCards
                programs={userSubscriptions}
                selectedProgram={selectedProgram}
                handleSelectProgram={(id) => GetProgram(id)}
                subscribeProgram={(id) => subscribeProgram(id)}
                unsubscribeProgram={(id) => unsubscribeProgram(id)}
              />
            </ScrollableContent>
          ) : (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              minHeight: '200px',
              textAlign: 'center',
              padding: '40px 20px',
              color: '#61759b' 
            }}>
              <Typography variant="h6" sx={{ color: '#eee', mb: 2 }}>
                No Subscriptions Yet
              </Typography>
              <Typography variant="body2">
                Browse programs and subscribe to see them here
              </Typography>
            </Box>
          )}
        </ContentSection>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <ContentSection>
          <FilterContainer sx={{ flexShrink: 0 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl variant="outlined" fullWidth>
                  <InputLabel id="filter-label" sx={{ color: '#61759b' }}>Filter by Category</InputLabel>
                  <Select
                    labelId="filter-label"
                    id="filter"
                    value={filter}
                    onChange={handleFilterChange}
                    label="Filter by Category"
                    sx={{
                      color: '#EEE',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(97, 117, 155, 0.5)'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(97, 117, 155, 0.8)'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#8A4EFC'
                      },
                      '& .MuiSvgIcon-root': {
                        color: '#61759b'
                      }
                    }}
                  >
                    <MenuItem value="all">All Categories</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl variant="outlined" fullWidth>
                  <InputLabel id="sort-label" sx={{ color: '#61759b' }}>Sort by</InputLabel>
                  <Select
                    labelId="sort-label"
                    id="sort"
                    value={sort}
                    onChange={handleSortChange}
                    label="Sort by"
                    sx={{
                      color: '#EEE',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(97, 117, 155, 0.5)'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(97, 117, 155, 0.8)'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#8A4EFC'
                      },
                      '& .MuiSvgIcon-root': {
                        color: '#61759b'
                      }
                    }}
                  >
                    <MenuItem value="popular">Most Popular</MenuItem>
                    <MenuItem value="newest">Newest</MenuItem>
                    <MenuItem value="az">A-Z</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </FilterContainer>

          {isLoading ? (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              height: '100%',
              py: 4
            }}>
              <CircularProgress sx={{ color: '#8A4EFC', mb: 2 }} />
              <Typography variant="body1" sx={{ color: '#A4B1CD' }}>
                Loading programs...
              </Typography>
            </Box>
          ) : (
            <ScrollableContent>
              <ProgramsCards
                programs={sortedPrograms}
                selectedProgram={selectedProgram}
                handleSelectProgram={(id) => GetProgram(id)}
                subscribeProgram={(id) => subscribeProgram(id)}
                unsubscribeProgram={(id) => unsubscribeProgram(id)}
              />
            </ScrollableContent>
          )}
        </ContentSection>
      </TabPanel>
            
      <RouterBottomNavigation />
    </PageContainer>
  );
}

export { Programs };
