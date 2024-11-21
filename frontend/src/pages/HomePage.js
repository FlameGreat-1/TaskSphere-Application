import React, { useState, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import Login from './Login';
import Register from './Register';

const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Roboto', sans-serif;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    background-color: #f8f9fa;
    color: #333;
  }
`;

const HomePage = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleResize = () => setIsMenuOpen(window.innerWidth > 768);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const Header = styled.header`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background-color: #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 0;
    z-index: 1000;
  `;

  const Logo = styled.img`
    height: 2.5rem;
  `;

  const Nav = styled.nav`
    display: ${props => props.isOpen ? 'flex' : 'none'};
    flex-direction: column;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: #fff;
    padding: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    @media (min-width: 768px) {
      display: flex;
      flex-direction: row;
      position: static;
      padding: 0;
      box-shadow: none;
    }
  `;

  const NavLink = styled.a`
    text-decoration: none;
    color: #333;
    font-weight: 500;
    padding: 0.5rem 1rem;
    transition: color 0.3s ease;

    &:hover {
      color: #007bff;
    }
  `;

  const Button = styled.button`
    padding: 0.5rem 1rem;
    border-radius: 4px;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.3s ease, color 0.3s ease;
  `;

  const PrimaryButton = styled(Button)`
    background-color: #007bff;
    color: white;
    border: none;

    &:hover {
      background-color: #0056b3;
    }
  `;

  const SecondaryButton = styled(Button)`
    background-color: transparent;
    color: #007bff;
    border: 2px solid #007bff;

    &:hover {
      background-color: #007bff;
      color: white;
    }
  `;

  const HamburgerButton = styled.button`
    display: block;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;

    @media (min-width: 768px) {
      display: none;
    }
  `;

  const Main = styled.main`
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  `;

  const Section = styled.section`
    margin-bottom: 4rem;
  `;

  const SectionTitle = styled.h2`
    font-size: 2rem;
    color: #333;
    margin-bottom: 1rem;
    text-align: center;
  `;

  const SectionText = styled.p`
    font-size: 1rem;
    color: #666;
    max-width: 600px;
    margin: 0 auto 2rem;
    text-align: center;
  `;

  const FeatureGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
  `;

  const FeatureCard = styled.div`
    background-color: #fff;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;

    &:hover {
      transform: translateY(-5px);
    }
  `;

  const FeatureIcon = styled.img`
    width: 50px;
    height: 50px;
    margin-bottom: 1rem;
  `;

  const FeatureTitle = styled.h3`
    font-size: 1.25rem;
    color: #333;
    margin-bottom: 0.5rem;
  `;

  const FeatureDescription = styled.p`
    font-size: 1rem;
    color: #666;
  `;

  const TestimonialGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
  `;

  const TestimonialCard = styled.div`
    background-color: #fff;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  `;

  const TestimonialText = styled.p`
    font-style: italic;
    margin-bottom: 1rem;
  `;

  const TestimonialAuthor = styled.p`
    font-weight: bold;
  `;

  const DownloadSection = styled(Section)`
    background-color: #f0f0f0;
    padding: 4rem 2rem;
    text-align: center;
  `;

  const AppStoreButtons = styled.div`
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 2rem;
  `;

  const AppStoreButton = styled.img`
    height: 3rem;
  `;

  const IntegrationLogos = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    margin-top: 2rem;
    flex-wrap: wrap;
  `;

  const IntegrationLogo = styled.img`
    height: 2.5rem;
  `;

  const BlogPosts = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
  `;

  const BlogPost = styled.div`
    background-color: #fff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  `;

  const BlogPostImage = styled.img`
    width: 100%;
    height: 200px;
    object-fit: cover;
  `;

  const BlogPostContent = styled.div`
    padding: 1.5rem;
  `;

  const BlogPostTitle = styled.h3`
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
  `;

  const BlogPostExcerpt = styled.p`
    font-size: 1rem;
    color: #666;
  `;

  const Footer = styled.footer`
    background-color: #333;
    color: #fff;
    padding: 2rem;
  `;

  const FooterContent = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  `;

  const FooterColumn = styled.div``;

  const FooterTitle = styled.h4`
    font-size: 1.25rem;
    margin-bottom: 1rem;
  `;

  const FooterLink = styled.a`
    display: block;
    color: #fff;
    text-decoration: none;
    margin-bottom: 0.5rem;
    transition: color 0.3s ease;

    &:hover {
      color: #007bff;
    }
  `;

  const SocialLinks = styled.div`
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
  `;

  const SocialIcon = styled.img`
    width: 24px;
    height: 24px;
  `;

  const HeroSection = styled.section`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 50px;
    background-color: #fafafa;
  `;

  const HeroContent = styled.div`
    max-width: 500px;
  `;

  const HeroTitle = styled.h1`
    font-size: 48px;
    color: #333;
    margin-bottom: 20px;
  `;

  const HeroText = styled.p`
    font-size: 18px;
    color: #666;
    margin-bottom: 30px;
  `;

  const HeroImage = styled.img`
    max-width: 50%;
    height: auto;
  `;

  return (
    <>
      <GlobalStyle />
      <Header>
        <Logo src="/tasksphere-logo.webp" alt="TaskSphere Logo" />
        <HamburgerButton onClick={() => setIsMenuOpen(!isMenuOpen)}>☰</HamburgerButton>
        <Nav isOpen={isMenuOpen}>
          <NavLink href="#features">Features</NavLink>
          <NavLink href="#templates">Templates</NavLink>
          <NavLink href="#for-teams">For Teams</NavLink>
          <NavLink href="#resources">Resources</NavLink>
          <NavLink href="#pricing">Pricing</NavLink>
          {isAuthenticated ? (
            <>
              <SecondaryButton onClick={logout}>Log out</SecondaryButton>
              <PrimaryButton>Go to app</PrimaryButton>
            </>
          ) : (
            <>
              <SecondaryButton onClick={() => setIsLoginOpen(true)}>Log in</SecondaryButton>
              <PrimaryButton onClick={() => setIsRegisterOpen(true)}>Sign Up</PrimaryButton>
            </>
          )}
        </Nav>
      </Header>

      <Main>
        <HeroSection>
          <HeroContent>
            <HeroTitle>Organize your work and life, finally.</HeroTitle>
            <HeroText>
              Become focused, organized, and calm with TaskSphere. The world's #1 task manager and to-do list app.
            </HeroText>
            <PrimaryButton onClick={() => setIsRegisterOpen(true)}>Start for free</PrimaryButton>
          </HeroContent>
          <HeroImage src="/tasksphere-logo.webp" alt="TaskSphere in action" />
        </HeroSection>

        <Section id="features">
          <SectionTitle>Organize everything in life</SectionTitle>
          <SectionText>
            From work to personal life, TaskSphere is your digital to-do list and task manager that helps you organize, plan, and collaborate on projects of all sizes.
          </SectionText>
          <FeatureGrid>
            {[
              { title: "Add tasks from anywhere", description: "Capture and organize tasks the moment they pop into your head." },
              { title: "Remember deadlines", description: "Set due dates and reminders so you never miss a deadline again." },
              { title: "Organize your tasks", description: "Group related tasks into projects and break big tasks into smaller steps." },
              { title: "Plan your day", description: "See your daily and weekly tasks at a glance." },
            ].map((feature, index) => (
              <FeatureCard key={index}>
                <FeatureIcon src={`/path-to-icon${index + 1}.png`} alt="Feature icon" />
                <FeatureTitle>{feature.title}</FeatureTitle>
                <FeatureDescription>{feature.description}</FeatureDescription>
              </FeatureCard>
            ))}
          </FeatureGrid>
        </Section>

        <DownloadSection>
          <SectionTitle>TaskSphere works where you work</SectionTitle>
          <SectionText>
            Download the TaskSphere app to get organized on any device.
          </SectionText>
          <AppStoreButtons>
            <AppStoreButton src="/path-to-app-store-button.png" alt="Download on the App Store" />
            <AppStoreButton src="/path-to-play-store-button.png" alt="Get it on Google Play" />
          </AppStoreButtons>
        </DownloadSection>

        <Section>
          <SectionTitle>Integrate with your favorite tools</SectionTitle>
          <SectionText>
            TaskSphere connects with the tools you already use to make your workflow seamless.
          </SectionText>
          <IntegrationLogos>
            <IntegrationLogo src="/path-to-gmail-logo.png" alt="Gmail" />
            <IntegrationLogo src="/path-to-slack-logo.png" alt="Slack" />
            <IntegrationLogo src="/path-to-calendar-logo.png" alt="Calendar" />
          </IntegrationLogos>
        </Section>

        <Section>
  <SectionTitle>Loved by millions worldwide</SectionTitle>
  <TestimonialGrid>
    {[
      { text: "TaskSphere has changed my life. I'm more organized and focused than ever before.", author: "John Doe, CEO" },
      { text: "As a busy professional, TaskSphere helps me stay on top of my work and personal life.", author: "Jane Smith, Designer" },
      { text: "I couldn't imagine managing my team without TaskSphere. It's a game-changer.", author: "Mike Johnson, Project Manager" },
    ].map((testimonial, index) => (
      <TestimonialCard key={index}>
        <TestimonialText>"{testimonial.text}"</TestimonialText>
        <TestimonialAuthor>{testimonial.author}</TestimonialAuthor>
      </TestimonialCard>
    ))}
  </TestimonialGrid>
</Section>

<Section>
  <SectionTitle>Productivity tips and tricks</SectionTitle>
  <SectionText>
    Learn how to boost your productivity and get more done with TaskSphere.
  </SectionText>
  <BlogPosts>
    {[
      { title: "5 Ways to Organize Your Day", excerpt: "Learn how to structure your day for maximum productivity.", image: "/path-to-blog-image-1.jpg" },
      { title: "The Power of To-Do Lists", excerpt: "Discover why to-do lists are essential for staying organized.", image: "/path-to-blog-image-2.jpg" },
      { title: "Mastering Task Prioritization", excerpt: "Tips for identifying and focusing on your most important tasks.", image: "/path-to-blog-image-3.jpg" },
    ].map((post, index) => (
      <BlogPost key={index}>
        <BlogPostImage src={post.image} alt={post.title} />
        <BlogPostContent>
          <BlogPostTitle>{post.title}</BlogPostTitle>
          <BlogPostExcerpt>{post.excerpt}</BlogPostExcerpt>
        </BlogPostContent>
      </BlogPost>
    ))}
  </BlogPosts>
</Section>

<Section>
  <SectionTitle>Start organizing today</SectionTitle>
  <SectionText>
    Join millions of people who organize work and life with TaskSphere.
  </SectionText>
  <PrimaryButton onClick={() => setIsRegisterOpen(true)}>Start for free</PrimaryButton>
</Section>
</Main>

<Footer>
  <FooterContent>
    <FooterColumn>
      <FooterTitle>Features</FooterTitle>
      <FooterLink href="#how-it-works">How It Works</FooterLink>
      <FooterLink href="#for-teams">For Teams</FooterLink>
      <FooterLink href="#pricing">Pricing</FooterLink>
      <FooterLink href="#templates">Templates</FooterLink>
    </FooterColumn>
    <FooterColumn>
      <FooterTitle>Resources</FooterTitle>
      <FooterLink href="#productivity-methods">Productivity Methods</FooterLink>
      <FooterLink href="#integrations">Integrations</FooterLink>
      <FooterLink href="#help-center">Help Center</FooterLink>
      <FooterLink href="#blog">Blog</FooterLink>
    </FooterColumn>
    <FooterColumn>
      <FooterTitle>Company</FooterTitle>
      <FooterLink href="#about">About Us</FooterLink>
      <FooterLink href="#careers">Careers</FooterLink>
      <FooterLink href="#press">Press</FooterLink>
      <FooterLink href="#contact">Contact</FooterLink>
    </FooterColumn>
    <FooterColumn>
      <FooterTitle>Connect with us</FooterTitle>
      <SocialLinks>
        <SocialIcon src="/path-to-twitter-icon.png" alt="Twitter" />
        <SocialIcon src="/path-to-facebook-icon.png" alt="Facebook" />
        <SocialIcon src="/path-to-instagram-icon.png" alt="Instagram" />
        <SocialIcon src="/path-to-linkedin-icon.png" alt="LinkedIn" />
      </SocialLinks>
    </FooterColumn>
  </FooterContent>
</Footer>

{isLoginOpen && <Login isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />}
{isRegisterOpen && <Register isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />}
</>
);
};

export default HomePage;

