import { useLocation, Link } from 'react-router-dom';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { Home, Checklist, Settings, EmojiEvents } from '@mui/icons-material';
import { styled } from '@mui/system';
/* import icons */

// Styled components for consistent design
const NavigationPaper = styled(Paper)(({ theme }) => ({
  borderRadius: '32px',
  position: 'fixed',
  bottom: 20,
  left: 32,
  right: 32,
  zIndex: 1000, // Ensures it stays on top of other content
  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)',
  backgroundImage: 'linear-gradient(rgba(32, 43, 62, 0.95) 0%, rgba(19, 26, 38, 0.98) 100%)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)'
}));

const StyledBottomNavigation = styled(BottomNavigation)(({ theme }) => ({
  borderRadius: '32px',
  backgroundColor: 'transparent',
  height: '72px', // Increased height for better touch targets
  '& .MuiBottomNavigationAction-root': {
    color: '#61759b',
    '&.Mui-selected': {
      color: '#FFF'
    }
  }
}));

const StyledNavigationAction = styled(BottomNavigationAction)(({ theme }) => ({
  transition: 'all 0.3s ease',
  '&.Mui-selected': {
    '& .MuiSvgIcon-root': {
      filter: 'drop-shadow(0 0 8px rgba(216, 30, 88, 0.6))',
      transform: 'scale(1.1)'
    },
    '& .MuiBottomNavigationAction-label': {
      fontSize: '0.8rem',
      fontWeight: 500
    }
  },
  '&:hover': {
    backgroundColor: 'rgba(138, 78, 252, 0.08)'
  }
}));

function RouterBottomNavigation() {
  return (
    <NavigationPaper elevation={4} square={false}>
      <StyledBottomNavigation
        showLabels
        value={useLocation().pathname}
      >
        <StyledNavigationAction
          component={Link}
          to="/home"
          value="/home"
          label="Home"
          icon={<Home />}
        />
        <StyledNavigationAction
          component={Link}
          to="/programs"
          value="/programs"
          label="Programs"
          icon={<EmojiEvents />}
        />
        <StyledNavigationAction
          component={Link}
          to="/tasks"
          value="/tasks"
          label="Tasks"
          icon={<Checklist />}
        />
        <StyledNavigationAction
          component={Link}
          to="/settings"
          value="/settings"
          label="Settings"
          icon={<Settings />}
        />
      </StyledBottomNavigation>
    </NavigationPaper>
  )
}

export { RouterBottomNavigation };
