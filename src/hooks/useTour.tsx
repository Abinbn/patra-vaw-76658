import { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export const useTour = (shouldStart: boolean) => {
  useEffect(() => {
    if (!shouldStart) return;

    // Check if tour has been completed
    const tourCompleted = localStorage.getItem('patra-tour-completed');
    if (tourCompleted === 'true') {
      return; // Don't start tour if already completed
    }

    const driverObj = driver({
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: 'Next →',
      prevBtnText: '← Previous',
      doneBtnText: 'Get Started! 🚀',
      popoverClass: 'patra-tour-popover',
      progressText: '{{current}} of {{total}}',
      steps: [
        {
          element: '[data-tour="avatar"]',
          popover: {
            title: 'Welcome to Patra Editor! 🎨',
            description: 'Let\'s take a quick tour to help you create your perfect digital card. Click on the Avatar section to upload your profile picture.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '[data-tour="about"]',
          popover: {
            title: 'About Section',
            description: 'Add your personal information, job title, and bio here. This is the first thing people will see on your card.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '[data-tour="location"]',
          popover: {
            title: 'Location',
            description: 'Share your location with an interactive map to help people find you.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '[data-tour="verified"]',
          popover: {
            title: 'Social Accounts',
            description: 'Connect your social media accounts to make it easy for people to find you online.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '[data-tour="wallet"]',
          popover: {
            title: 'Payment Methods',
            description: 'Add your payment links and crypto wallets for easy transactions.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '[data-tour="links"]',
          popover: {
            title: 'Custom Links',
            description: 'Add any custom links you want to share - portfolio, website, or anything else!',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '[data-tour="interests"]',
          popover: {
            title: 'Interests',
            description: 'Share your hobbies and interests to help people connect with you.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '[data-tour="achievements"]',
          popover: {
            title: 'Achievements',
            description: 'Showcase your certifications, awards, and accomplishments.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '[data-tour="testimonials"]',
          popover: {
            title: 'Testimonials',
            description: 'Add testimonials from clients or colleagues to build credibility.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '[data-tour="gallery"]',
          popover: {
            title: 'Gallery',
            description: 'Upload photos and videos to make your card more engaging.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '[data-tour="design"]',
          popover: {
            title: 'Design Customization',
            description: 'Personalize the look and feel of your card with themes and custom CSS.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '[data-tour="cardlayout"]',
          popover: {
            title: 'Card Layout',
            description: 'Organize and reorder sections on your card to match your preferences.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '[data-tour="aiprofile"]',
          popover: {
            title: 'AI Profile Assistant',
            description: 'Enable AI to let people chat with your digital profile! Powered by Patra AI.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '[data-tour="preview"]',
          popover: {
            title: 'Live Preview',
            description: 'See how your card looks in real-time as you make changes.',
            side: 'left',
            align: 'start'
          }
        },
        {
          element: '[data-tour="save"]',
          popover: {
            title: 'Save Your Work',
            description: 'Don\'t forget to save your changes! Your card will be live once you save.',
            side: 'bottom',
            align: 'end'
          }
        },
        {
          popover: {
            title: 'You\'re All Set! 🎉',
            description: 'Start creating your amazing digital card. You can restart this tour anytime from Settings.',
          }
        }
      ],
      onDestroyed: () => {
        // Mark tour as completed in localStorage
        localStorage.setItem('patra-tour-completed', 'true');
      }
    });

    driverObj.drive();
  }, [shouldStart]);
};

export const startTour = () => {
  localStorage.removeItem('patra-tour-completed');
  window.location.reload();
};
