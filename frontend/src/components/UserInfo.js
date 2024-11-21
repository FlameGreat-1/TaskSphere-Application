import React, { useState } from 'react';
import styled from 'styled-components';
import api from '../api';

const UserInfoContainer = styled.div`
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 5px;
`;

const UserInfoItem = styled.p`
  margin-bottom: 10px;
`;

const EditButton = styled.button`
  background-color: #28a745;
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  margin-top: 10px;

  &:hover {
    background-color: #218838;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 5px;
  margin-bottom: 10px;
`;

const UserInfo = ({ userInfo, setUserInfo }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState(userInfo);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const response = await api.put('/accounts/profile/', editedInfo);
      setUserInfo(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating user info:', error);
    }
  };

  const handleChange = (e) => {
    setEditedInfo({ ...editedInfo, [e.target.name]: e.target.value });
  };

  if (!userInfo) return <div>Loading...</div>;

  return (
    <UserInfoContainer>
      {isEditing ? (
        <>
          <Input
            name="first_name"
            value={editedInfo.first_name}
            onChange={handleChange}
            placeholder="First Name"
          />
          <Input
            name="last_name"
            value={editedInfo.last_name}
            onChange={handleChange}
            placeholder="Last Name"
          />
          <Input
            name="email"
            value={editedInfo.email}
            onChange={handleChange}
            placeholder="Email"
          />
          <EditButton onClick={handleSave}>Save</EditButton>
        </>
      ) : (
        <>
          <UserInfoItem>Name: {userInfo.first_name} {userInfo.last_name}</UserInfoItem>
          <UserInfoItem>Email: {userInfo.email}</UserInfoItem>
          <EditButton onClick={handleEdit}>Edit</EditButton>
        </>
      )}
    </UserInfoContainer>
  );
};

export default UserInfo;
