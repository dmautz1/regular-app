import React, { useState } from 'react';
import { Grid, Card, CardHeader, Avatar, CardContent, CardMedia, 
  CardActionArea, Typography, Box, Chip } from '@mui/material';
import { styled } from '@mui/system';
import ProgramDialog from './dialog';
import PeopleIcon from '@mui/icons-material/People';

// Styled components for consistent design
const ProgramCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '12px',
  backgroundColor: '#202B3E',
  transition: 'all 0.3s ease',
  boxShadow: '0 3px 8px rgba(0, 0, 0, 0.15)',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)'
  }
}));

const CardHeaderStyled = styled(CardHeader)(({ theme }) => ({
  padding: '16px',
  '& .MuiCardHeader-title': {
    color: '#fff',
    fontSize: '1.1rem',
    fontWeight: '600',
    lineHeight: 1.3
  },
  '& .MuiCardHeader-subheader': {
    color: '#61759b',
    fontSize: '0.8rem'
  }
}));

const CardContentStyled = styled(CardContent)(({ theme }) => ({
  padding: '16px',
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column'
}));

const CategoryChip = styled(Chip)(({ theme }) => ({
  backgroundColor: 'rgba(138, 78, 252, 0.2)',
  color: '#8A4EFC',
  fontWeight: '500',
  fontSize: '0.7rem',
  height: '24px',
  marginBottom: '12px'
}));

const DescriptionText = styled(Typography)(({ theme }) => ({
  color: '#A4B1CD',
  fontSize: '0.9rem',
  lineHeight: 1.5,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 3,
  WebkitBoxOrient: 'vertical'
}));

const ProgramsCards = ({ programs, selectedProgram, handleSelectProgram, subscribeProgram, unsubscribeProgram }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const handleOpen = (id) => {
    setSelectedId(id);
    handleSelectProgram(id);
    setIsOpen(!isOpen);
  };

  const handleSubscribe = (id) => {
    subscribeProgram(id);
    setIsOpen(!isOpen);
  };

  const handleUnsubscribe = (id) => {
    unsubscribeProgram(id);
    setIsOpen(!isOpen);
  };

  // Function to get avatar color based on initial letter
  const getAvatarColor = (name) => {
    const colors = ['#D81E58', '#8A4EFC', '#00BCD4', '#FF9800', '#4CAF50'];
    const letter = (name || 'A')[0].toUpperCase();
    const index = letter.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Helper to get first name or first letter from email
  const getDisplayName = (creator) => {
    if (!creator) return 'User';
    
    // If creator has first_name and last_name, use them
    if (creator.first_name && creator.last_name) {
      return `${creator.first_name} ${creator.last_name}`;
    }
    // If creator has only first_name, use it
    if (creator.first_name) {
      return creator.first_name;
    }
    // Otherwise fallback to email-based name
    if (!creator.email) return 'User';
    
    // Try to extract a name from the email
    const namePart = creator.email.split('@')[0];
    // Capitalize first letter and return
    return namePart.charAt(0).toUpperCase() + namePart.slice(1);
  };
  
  // Get avatar based on user info
  const getAvatarInfo = (creator) => {
    if (!creator) return { src: null, initials: 'U', color: getAvatarColor('User') };
    
    let avatarSrc = null;
    let initials = 'U';
    
    // If user has avatar_url, use it
    if (creator.avatar_url) {
      avatarSrc = creator.avatar_url.startsWith('http') 
        ? creator.avatar_url 
        : `http://localhost:3001${creator.avatar_url}`;
    }
    
    // Get initials for avatar fallback
    if (creator.first_name && creator.last_name) {
      // Use first letter of first and last name
      initials = `${creator.first_name[0]}${creator.last_name[0]}`.toUpperCase();
    } else if (creator.first_name) {
      // Use first letter of first name
      initials = creator.first_name[0].toUpperCase();
    } else if (creator.email) {
      // Use first letter of email
      initials = creator.email[0].toUpperCase();
    }
    
    return { 
      src: avatarSrc, 
      initials, 
      color: getAvatarColor(creator.first_name || creator.email || 'User')
    };
  };
  
  // Generate the correct image URL
  const getProgramImageUrl = (program) => {
    if (!program || !program.image_url) {
      return 'default-personal-program.jpg';
    }
    
    // Check if the path is already a full URL
    if (program.image_url.startsWith('http')) {
      return program.image_url;
    }
    
    // Otherwise, construct the URL from the path
    return program.image_url;
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {programs.map((program) => (
          <Grid item xs={12} sm={6} md={4} key={program.id}>
            <ProgramCard onClick={() => handleOpen(program.id)}>
              <CardActionArea sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                <CardMedia
                  component="img"
                  image={getProgramImageUrl(program)}
                  alt={program.title}
                  height="180"
                  sx={{ objectFit: "cover" }}
                />
                <CardHeaderStyled
                  avatar={
                    <Avatar 
                      src={getAvatarInfo(program?.creator).src}
                      sx={{ bgcolor: getAvatarInfo(program?.creator).color }}
                      aria-label="creator avatar"
                    >
                      {getAvatarInfo(program?.creator).initials}
                    </Avatar>
                  }
                  title={program.title}
                  subheader={getDisplayName(program?.creator)}
                />
                <CardContentStyled>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <CategoryChip 
                      label={program.category || 'General'} 
                      size="small"
                    />
                    <Chip
                      icon={<PeopleIcon fontSize="small" />}
                      label={`${program.subscriberCount || 0} subscribers`}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(216, 30, 88, 0.15)',
                        color: '#D81E58',
                        fontSize: '0.7rem',
                        height: '24px',
                        '& .MuiChip-icon': {
                          color: '#D81E58',
                          fontSize: '1rem'
                        }
                      }}
                    />
                  </Box>
                  <DescriptionText variant="body2">
                    {program.description}
                  </DescriptionText>
                </CardContentStyled>
              </CardActionArea>
            </ProgramCard>
          </Grid>
        ))}
      </Grid>

      {selectedProgram && 
        <ProgramDialog
        selectedProgram={selectedProgram}
        isDialogOpened={isOpen}
        handleCloseDialog={() => setIsOpen(false)}
        handleSubscribe={(programId) => handleSubscribe(programId)}
        handleUnsubscribe={(programId) => handleUnsubscribe(programId)}
        />
      }
    </Box>
  );
};

export default ProgramsCards;
