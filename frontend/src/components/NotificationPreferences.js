import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import axios from 'axios';

const PreferencesWrapper = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const PreferenceItem = styled.div`
  margin-bottom: 15px;
`;

const PreferenceLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const PreferenceCheckbox = styled.input`
  margin-right: 10px;
`;

const NotificationPreferences = ({ onClose }) => {
  const queryClient = useQueryClient();
  const [preferences, setPreferences] = useState({});

  const { data: userPreferences, isLoading } = useQuery('userPreferences', () =>
    axios.get('/api/notification-preferences/')
  );

  const updatePreferencesMutation = useMutation(
    (newPreferences) => axios.put('/api/notification-preferences/', newPreferences),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('userPreferences');
      },
    }
  );

  useEffect(() => {
    if (userPreferences) {
      setPreferences(userPreferences.data);
    }
  }, [userPreferences]);

  const handlePreferenceChange = (e) => {
    const { name, checked } = e.target;
    setPreferences((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSave = () => {
    updatePreferencesMutation.mutate(preferences);
    onClose();
  };

  if (isLoading) return <div>Loading preferences...</div>;

  return (
    <PreferencesWrapper>
      <h2>Notification Preferences</h2>
      <PreferenceItem>
        <PreferenceLabel>
          <PreferenceCheckbox
            type="checkbox"
            name="email_notifications"
            checked={preferences.email_notifications}
            onChange={handlePreferenceChange}
          />
          Email Notifications
        </PreferenceLabel>
      </PreferenceItem>
      <PreferenceItem>
        <PreferenceLabel>
          <PreferenceCheckbox
            type="checkbox"
            name="push_notifications"
            checked={preferences.push_notifications}
            onChange={handlePreferenceChange}
          />
          Push Notifications
        </PreferenceLabel>
      </PreferenceItem>
      <PreferenceItem>
        <PreferenceLabel>
          <PreferenceCheckbox
            type="checkbox"
            name="sms_notifications"
            checked={preferences.sms_notifications}
            onChange={handlePreferenceChange}
          />
          SMS Notifications
        </PreferenceLabel>
      </PreferenceItem>
      <button onClick={handleSave}>Save Preferences</button>
      <button onClick={onClose}>Cancel</button>
    </PreferencesWrapper>
  );
};

export default NotificationPreferences;
