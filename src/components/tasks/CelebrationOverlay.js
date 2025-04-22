import { useState, useEffect } from 'react';
import { Box, Typography, Button, Fade, IconButton } from '@mui/material';
import { styled, keyframes } from '@mui/system';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import CloseIcon from '@mui/icons-material/Close';
import Confetti from 'react-confetti';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import StarIcon from '@mui/icons-material/Star';
import WhatshotIcon from '@mui/icons-material/Whatshot';

// Keyframes for animations
const floatAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
`;

const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const glowAnimation = keyframes`
  0% { box-shadow: 0 0 5px rgba(216, 30, 88, 0.6), 0 0 10px rgba(138, 78, 252, 0.4); }
  50% { box-shadow: 0 0 20px rgba(216, 30, 88, 0.8), 0 0 30px rgba(138, 78, 252, 0.6); }
  100% { box-shadow: 0 0 5px rgba(216, 30, 88, 0.6), 0 0 10px rgba(138, 78, 252, 0.4); }
`;

const revealTextAnimation = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Styled Components
const OverlayContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(19, 26, 38, 0.92)',
  zIndex: 1400,
  backdropFilter: 'blur(8px)'
}));

const CelebrationCard = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '60px 40px 40px',
  background: 'radial-gradient(circle, #202B3E 0%, #131A26 100%)',
  borderRadius: '30px',
  maxWidth: '90%',
  width: '460px',
  boxShadow: '0 15px 50px rgba(0, 0, 0, 0.3)',
  animation: `${glowAnimation} 3s infinite, ${pulseAnimation} 6s infinite`,
  overflow: 'hidden'
}));

const CompletionBadge = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '120px',
  height: '120px',
  borderRadius: '50%',
  background: 'linear-gradient(45deg, #D81E58, #8A4EFC)',
  marginBottom: '30px',
  boxShadow: '0 10px 30px rgba(138, 78, 252, 0.3)',
  position: 'relative',
  animation: `${floatAnimation} 3s ease-in-out infinite`
}));

const StyledCloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: '15px',
  right: '15px',
  color: '#61759b',
  '&:hover': {
    color: '#ffffff',
    backgroundColor: 'rgba(255, 255, 255, 0.1)'
  }
}));

const FloatingIcon = styled(Box)(({ theme, delay }) => ({
  position: 'absolute',
  animation: `${floatAnimation} 3s ease-in-out infinite`,
  animationDelay: delay
}));

const ActionButton = styled(Button)(({ theme }) => ({
  marginTop: '30px',
  marginBottom: '10px',
  borderRadius: '30px',
  padding: '12px 35px',
  fontWeight: 'bold',
  fontSize: '16px',
  letterSpacing: '1px',
  background: 'linear-gradient(90deg, #D81E58, #8A4EFC)',
  color: 'white',
  textTransform: 'none',
  transition: 'all 0.3s ease',
  boxShadow: '0 8px 20px rgba(216, 30, 88, 0.3)',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 12px 25px rgba(216, 30, 88, 0.4)',
    background: 'linear-gradient(90deg, #8A4EFC, #D81E58)'
  }
}));

const AnimatedText = styled(Typography)(({ theme, delay }) => ({
  animation: `${revealTextAnimation} 0.8s forwards`,
  animationDelay: delay,
  opacity: 0
}));

/**
 * Enhanced celebration overlay with modern design and animations
 */
const CelebrationOverlay = ({ onDismiss }) => {
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  
  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Fade in={true} timeout={600}>
      <OverlayContainer>
        <Confetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          numberOfPieces={100}
          recycle={false}
          gravity={0.1}
          opacity={0.6}
          colors={['#D81E58', '#8A4EFC', '#64FFDA', '#FFD700', '#FF4081']}
          confettiSource={{ x: windowDimensions.width / 2, y: windowDimensions.height / 2, w: 0, h: 0 }}
        />
        
        <CelebrationCard>
          <StyledCloseButton onClick={onDismiss} aria-label="close">
            <CloseIcon />
          </StyledCloseButton>
          
          {/* Decorative floating elements */}
          <FloatingIcon sx={{ top: '10%', left: '10%', color: '#FF4081', fontSize: 24 }} delay="0s">
            <StarIcon fontSize="inherit" />
          </FloatingIcon>
          <FloatingIcon sx={{ top: '20%', right: '15%', color: '#64FFDA', fontSize: 20 }} delay="0.5s">
            <StarIcon fontSize="inherit" />
          </FloatingIcon>
          <FloatingIcon sx={{ bottom: '15%', left: '15%', color: '#FFD700', fontSize: 22 }} delay="1s">
            <WhatshotIcon fontSize="inherit" />
          </FloatingIcon>
          
          <CompletionBadge>
            <DoneAllIcon sx={{ fontSize: 60, color: 'white' }} />
          </CompletionBadge>
          
          <AnimatedText 
            variant="h3" 
            delay="0.2s"
            sx={{ 
              fontWeight: 700, 
              color: 'white',
              marginBottom: '16px',
              fontSize: { xs: '2rem', sm: '2.5rem' },
              textAlign: 'center',
              fontFamily: '"Poppins", sans-serif',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            All Done! <EmojiEmotionsIcon sx={{ color: '#FFD700', fontSize: 'inherit' }} />
          </AnimatedText>
          
          <AnimatedText 
            variant="body1" 
            delay="0.4s"
            sx={{ 
              fontSize: '1.1rem',
              color: '#A4B1CD',
              textAlign: 'center',
              maxWidth: '90%',
              lineHeight: 1.6
            }}
          >
            You've smashed all your tasks for today! Your productivity is off the charts!
          </AnimatedText>
          
          <ActionButton onClick={onDismiss}>
            Continue Your Streak
          </ActionButton>
        </CelebrationCard>
      </OverlayContainer>
    </Fade>
  );
};

export default CelebrationOverlay; 