import React, { useState } from 'react';
import axios from 'axios';

const DemoModeButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [numUsers, setNumUsers] = useState(10);
  const [numProjects, setNumProjects] = useState(30);

  const activateDemoMode = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post('/api/activate-demo-mode/', {
        num_users: numUsers,
        num_projects: numProjects
      });
      alert(`Demo mode activated successfully! Created ${response.data.users_created} users and ${response.data.projects_created} projects.`);
      // Optionally, refresh the page or update the UI
    } catch (error) {
      console.error('Error activating demo mode:', error);
      alert('Failed to activate demo mode');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h3>Activate Demo Mode</h3>
      <div>
        <label>
          Number of Users:
          <input 
            type="number" 
            value={numUsers} 
            onChange={(e) => setNumUsers(parseInt(e.target.value))} 
            min="1"
          />
        </label>
      </div>
      <div>
        <label>
          Number of Projects:
          <input 
            type="number" 
            value={numProjects} 
            onChange={(e) => setNumProjects(parseInt(e.target.value))} 
            min="1"
          />
        </label>
      </div>
      <button onClick={activateDemoMode} disabled={isLoading}>
        {isLoading ? 'Activating...' : 'Activate Demo Mode'}
      </button>
    </div>
  );
};

export default DemoModeButton;
