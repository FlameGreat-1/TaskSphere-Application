import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { fetchProfile, updateProfile } from '../services/api';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaPhone, FaBirthdayCake, FaVenusMars, FaGlobe, FaCog, FaChartBar, FaClipboardList, FaBell } from 'react-icons/fa';

const PageContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f0f2f5;
`;

const Sidebar = styled.div`
  width: 250px;
  background-color: #2c3e50;
  color: white;
  padding: 2rem;
`;

const MainContent = styled.div`
  flex: 1;
  padding: 2rem;
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
`;

const ProfilePicture = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #e0e0e0;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 1rem;
  font-size: 2.5rem;
  color: #757575;
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const ProfileName = styled.h2`
  margin: 0;
  color: #333;
`;

const ProfileEmail = styled.p`
  margin: 0;
  color: #666;
`;

const SectionTitle = styled.h3`
  color: #2c3e50;
  border-bottom: 2px solid #ecf0f1;
  padding-bottom: 0.5rem;
  margin-top: 2rem;
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #34495e;
`;

const Input = styled.input`
  padding: 0.5rem;
  border: 1px solid #bdc3c7;
  border-radius: 4px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const Button = styled.button`
  background-color: #3498db;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;

  &:hover {
    background-color: #2980b9;
  }
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 2rem;
`;

const DashboardItem = styled.div`
  background-color: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const MenuLink = styled.a`
  display: flex;
  align-items: center;
  color: white;
  text-decoration: none;
  padding: 0.5rem 0;
  transition: color 0.3s;

  &:hover {
    color: #3498db;
  }

  svg {
    margin-right: 0.5rem;
  }
`;

const Profile = () => {
  const { user: authUser, updateUserProfile } = useAuth();
  const [user, setUser] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        if (authUser) {
          setUser(authUser);
        } else {
          const res = await fetchProfile();
          setUser(res.data);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        toast.error('Failed to fetch profile');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserProfile();
  }, [authUser]);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updatedUser = await updateProfile(user);
      await updateUserProfile(updatedUser);
      toast.success('Profile updated successfully');
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <PageContainer>Loading...</PageContainer>;

  return (
    <PageContainer>
      <Sidebar>
        <ProfilePicture>
          <FaUser />
        </ProfilePicture>
        <h3>{user.username || 'User'}</h3>
        <MenuLink href="#"><FaUser /> Profile</MenuLink>
        <MenuLink href="#"><FaCog /> Account Settings</MenuLink>
        <MenuLink href="#"><FaChartBar /> Analytics</MenuLink>
        <MenuLink href="#"><FaClipboardList /> Tasks</MenuLink>
        <MenuLink href="#"><FaBell /> Notifications</MenuLink>
      </Sidebar>
      <MainContent>
        <ProfileHeader>
          <ProfileInfo>
            <ProfileName>{`${user.first_name || ''} ${user.last_name || ''}`}</ProfileName>
            <ProfileEmail>{user.email}</ProfileEmail>
          </ProfileInfo>
        </ProfileHeader>

        <SectionTitle>Personal Information</SectionTitle>
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label>First Name</Label>
            <Input name="first_name" value={user.first_name || ''} onChange={handleChange} />
          </InputGroup>
          <InputGroup>
            <Label>Last Name</Label>
            <Input name="last_name" value={user.last_name || ''} onChange={handleChange} />
          </InputGroup>
          <InputGroup>
            <Label>Email</Label>
            <Input name="email" value={user.email || ''} onChange={handleChange} disabled />
          </InputGroup>
          <InputGroup>
            <Label>Phone Number</Label>
            <Input name="phone_number" value={user.phone_number || ''} onChange={handleChange} />
          </InputGroup>
          <InputGroup>
            <Label>Date of Birth</Label>
            <Input name="date_of_birth" type="date" value={user.date_of_birth || ''} onChange={handleChange} />
          </InputGroup>
          <InputGroup>
            <Label>Gender</Label>
            <Input name="gender" value={user.gender || ''} onChange={handleChange} />
          </InputGroup>
          <InputGroup>
            <Label>Country</Label>
            <Input name="country" value={user.country || ''} onChange={handleChange} />
          </InputGroup>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Updating...' : 'Update Profile'}
          </Button>
        </Form>

        <SectionTitle>Dashboard</SectionTitle>
        <DashboardGrid>
          <DashboardItem>
            <h4>Tasks Completed</h4>
            <p>15 / 20</p>
          </DashboardItem>
          <DashboardItem>
            <h4>Projects</h4>
            <p>5 Active</p>
          </DashboardItem>
          <DashboardItem>
            <h4>Team Members</h4>
            <p>8 Collaborators</p>
          </DashboardItem>
        </DashboardGrid>
      </MainContent>
    </PageContainer>
  );
};

export default Profile;
