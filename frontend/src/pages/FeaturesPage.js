import React from 'react';
import styled from 'styled-components';

const FeaturesContainer = styled.div`
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  color: #202020;
  max-width: 1140px;
  margin: 0 auto;
  padding: 80px 24px;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 80px;
`;

const Title = styled.h1`
  font-size: 44px;
  font-weight: 700;
  margin-bottom: 16px;
`;

const Subtitle = styled.p`
  font-size: 20px;
  color: #555;
  max-width: 600px;
  margin: 0 auto;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
`;

const FeatureCard = styled.div`
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const FeatureImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const FeatureContent = styled.div`
  padding: 24px;
`;

const FeatureTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
`;

const FeatureDescription = styled.p`
  font-size: 16px;
  color: #555;
  line-height: 1.5;
`;

const CTASection = styled.div`
  text-align: center;
  margin-top: 80px;
`;

const CTAButton = styled.a`
  display: inline-block;
  background-color: #e44332;
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  padding: 16px 32px;
  border-radius: 8px;
  text-decoration: none;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #c53727;
  }
`;

const features = [
  {
    title: "Tasks",
    description: "Stay focused and organized with tasks that are clear and actionable.",
    image: "/images/features/tasks.png"
  },
  {
    title: "Sections & Projects",
    description: "Organize your tasks into shared projects and break them down into smaller sections.",
    image: "/images/features/sections-projects.png"
  },
  {
    title: "Collaboration",
    description: "Share projects, assign tasks, and collaborate with anyone.",
    image: "/images/features/collaboration.png"
  },
  {
    title: "Integrations",
    description: "Connect Todoist with your calendar, voice assistant, and over 60 other tools.",
    image: "/images/features/integrations.png"
  },
  {
    title: "Reminders",
    description: "Set reminders for tasks and never miss a deadline.",
    image: "/images/features/reminders.png"
  },
  {
    title: "Templates",
    description: "Save and reuse project structures for recurring workflows.",
    image: "/images/features/templates.png"
  }
];

const FeaturesPage = () => {
  return (
    <FeaturesContainer>
      <Header>
        <Title>Organize it all with Todoist</Title>
        <Subtitle>Free up your mental space and get more done with Todoist's powerful features.</Subtitle>
      </Header>
      <FeatureGrid>
        {features.map((feature, index) => (
          <FeatureCard key={index}>
            <FeatureImage src={feature.image} alt={feature.title} />
            <FeatureContent>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
            </FeatureContent>
          </FeatureCard>
        ))}
      </FeatureGrid>
      <CTASection>
        <CTAButton href="/signup">Get Started</CTAButton>
      </CTASection>
    </FeaturesContainer>
  );
};

export default FeaturesPage;