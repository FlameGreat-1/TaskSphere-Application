import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { FaGoogle } from 'react-icons/fa';

// Animation keyframes
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Theme colors
const theme = {
  primary: '#4285F4',    // Google Blue
  secondary: '#34A853',  // Google Green
  accent: '#EA4335',     // Google Red
  yellow: '#FBBC05',     // Google Yellow
  dark: '#202124',
  light: '#FFFFFF',
  gray: '#5F6368',
  hover: '#3367D6',
  background: '#F8F9FA'
};

// Styled Components
const GoogleServicesContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: ${theme.background};
  min-height: 100vh;
  font-family: 'Google Sans', 'Roboto', sans-serif;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 3rem;
  animation: ${fadeIn} 0.8s ease-out;
`;

const Title = styled.h1`
  color: ${theme.dark};
  font-size: 2.5rem;
  margin-bottom: 1rem;
  font-weight: 500;
`;

const Subtitle = styled.p`
  color: ${theme.gray};
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;
`;

const ViewSelector = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const ViewButton = styled.button`
  padding: 0.8rem 1.5rem;
  background: ${props => props.active ? theme.primary : theme.light};
  color: ${props => props.active ? theme.light : theme.dark};
  border: 2px solid ${theme.primary};
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:hover {
    background: ${theme.primary};
    color: ${theme.light};
  }
`;

const ServicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  animation: ${fadeIn} 1s ease-out;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ServiceCard = styled.div`
  background: ${theme.light};
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
  }
`;

const CardTitle = styled.h3`
  color: ${theme.dark};
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: '';
    display: inline-block;
    width: 24px;
    height: 24px;
    background-color: ${props => props.iconColor || theme.primary};
    border-radius: 50%;
  }
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid ${theme.gray};
  border-radius: 8px;
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: ${theme.primary};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid ${theme.gray};
  border-radius: 8px;
  font-size: 0.9rem;
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${theme.primary};
  }
`;

const FileInput = styled.input`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid ${theme.gray};
  border-radius: 8px;
  font-size: 0.9rem;

  &::file-selector-button {
    background: ${theme.primary};
    color: ${theme.light};
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-right: 1rem;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 0.8rem 1rem;
  background-color: ${props => props.bgColor || theme.primary};
  color: ${theme.light};
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    background-color: ${props => props.hoverColor || theme.hover};
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    background-color: ${theme.gray};
    cursor: not-allowed;
  }
`;

const Label = styled.label`
  color: ${theme.dark};
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  display: block;
`;

const GoogleServices = ({
  isGoogleAuthenticated,
  onGoogleLogin,
  onCreateCalendarEvent,
  onUploadToDrive,
  onCreateSheet,
  onCreateDocument,
  onCreateForm,
  onListDriveFiles,
  onGetSheetData,
  onUpdateDocument,
  onAddFormQuestions,
  onListCalendarEvents,
  onDeleteDriveFile,
  onUpdateSheetData,
  onUpdateCalendarEvent
}) => {
  const [activeView, setActiveView] = useState('googleServices');
  const [loading, setLoading] = useState({});
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [documentContent, setDocumentContent] = useState('');
  const [formId, setFormId] = useState('');
  const [formQuestions, setFormQuestions] = useState([]);

  const handleAction = async (action, key) => {
    setLoading(prev => ({ ...prev, [key]: true }));
    try {
      await action();
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  return (
    <GoogleServicesContainer>
      <Header>
        <Title>Google Workspace Integration</Title>
        <Subtitle>
          Seamlessly manage your Google services with our integrated dashboard
        </Subtitle>
      </Header>

      <ViewSelector>
        <ViewButton
          active={activeView === 'googleServices'}
          onClick={() => setActiveView('googleServices')}
        >
          Basic Services
        </ViewButton>
        <ViewButton
          active={activeView === 'googleIntegration'}
          onClick={() => setActiveView('googleIntegration')}
        >
          Advanced Integration
        </ViewButton>
      </ViewSelector>

      {activeView === 'googleServices' && (
        <ServicesGrid>
          <ServiceCard>
            <CardTitle iconColor={theme.accent}>Calendar</CardTitle>
            <CardContent>
              <Button onClick={() => handleAction(onCreateCalendarEvent, 'createEvent')}>
                Create Event
              </Button>
              <Button onClick={() => handleAction(onListCalendarEvents, 'listEvents')}>
                List Events
              </Button>
            </CardContent>
          </ServiceCard>

          <ServiceCard>
            <CardTitle iconColor={theme.secondary}>Drive</CardTitle>
            <CardContent>
              <FileInput
                type="file"
                onChange={(e) => handleAction(() => onUploadToDrive(e.target.files[0]), 'upload')}
              />
              <Button onClick={() => handleAction(onListDriveFiles, 'listFiles')}>
                List Files
              </Button>
            </CardContent>
          </ServiceCard>

          <ServiceCard>
            <CardTitle iconColor={theme.primary}>Sheets</CardTitle>
            <CardContent>
              <Button onClick={() => handleAction(onCreateSheet, 'createSheet')}>
                Create Sheet
              </Button>
              <Input
                placeholder="Spreadsheet ID"
                value={spreadsheetId}
                onChange={(e) => setSpreadsheetId(e.target.value)}
              />
              <Button onClick={() => handleAction(() => onGetSheetData(spreadsheetId), 'getSheetData')}>
                Get Data
              </Button>
            </CardContent>
          </ServiceCard>

          <ServiceCard>
            <CardTitle iconColor={theme.yellow}>Docs</CardTitle>
            <CardContent>
              <Button onClick={() => handleAction(onCreateDocument, 'createDoc')}>
                Create Document
              </Button>
              <Input
                placeholder="Document ID"
                value={documentId}
                onChange={(e) => setDocumentId(e.target.value)}
              />
              <TextArea
                placeholder="Document Content"
                value={documentContent}
                onChange={(e) => setDocumentContent(e.target.value)}
              />
              <Button onClick={() => handleAction(() => onUpdateDocument(documentId, documentContent), 'updateDoc')}>
                Update Document
              </Button>
            </CardContent>
          </ServiceCard>

          <ServiceCard>
            <CardTitle iconColor={theme.gray}>Forms</CardTitle>
            <CardContent>
              <Button onClick={() => handleAction(onCreateForm, 'createForm')}>
                Create Form
              </Button>
              <Input
                placeholder="Form ID"
                value={formId}
                onChange={(e) => setFormId(e.target.value)}
              />
              <Button onClick={() => handleAction(() => onAddFormQuestions(formId, formQuestions), 'addQuestions')}>
                Add Questions
              </Button>
            </CardContent>
          </ServiceCard>
        </ServicesGrid>
      )}

      {activeView === 'googleIntegration' && (
        <ServiceCard>
          <CardContent>
            {!isGoogleAuthenticated ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <Button onClick={onGoogleLogin} style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
                  <FaGoogle style={{ marginRight: '0.5rem' }} /> Connect Google Account
                </Button>
              </div>
            ) : (
              <ServicesGrid>
                <ServiceCard>
                  <CardTitle iconColor={theme.accent}>Calendar</CardTitle>
                  <CardContent>
                    <Button onClick={() => handleAction(onCreateCalendarEvent, 'createEvent')}>
                      Create Event
                    </Button>
                    <Button onClick={() => handleAction(onListCalendarEvents, 'listEvents')}>
                      View Calendar Events
                    </Button>
                    <Label>Update Event</Label>
                    <Input
                      placeholder="Event ID"
                      onChange={(e) => {
                        const eventData = {
                          id: e.target.value,
                          title: "Updated Event",
                          description: "Updated Description",
                          startTime: new Date().toISOString(),
                          endTime: new Date(Date.now() + 3600000).toISOString()
                        };
                        handleAction(() => onUpdateCalendarEvent(e.target.value, eventData), 'updateEvent');
                      }}
                    />
                  </CardContent>
                </ServiceCard>

                <ServiceCard>
                  <CardTitle iconColor={theme.secondary}>Drive</CardTitle>
                  <CardContent>
                    <Label>Upload File</Label>
                    <FileInput
                      type="file"
                      onChange={(e) => handleAction(() => onUploadToDrive(e.target.files[0]), 'upload')}
                    />
                    <Button onClick={() => handleAction(onListDriveFiles, 'listFiles')}>
                      View Drive Files
                    </Button>
                    <Label>Delete File</Label>
                    <Input
                      placeholder="File ID to delete"
                      onChange={(e) => {
                        if (window.confirm('Are you sure you want to delete this file?')) {
                          handleAction(() => onDeleteDriveFile(e.target.value), 'deleteFile');
                        }
                      }}
                    />
                  </CardContent>
                </ServiceCard>

                <ServiceCard>
                  <CardTitle iconColor={theme.primary}>Sheets</CardTitle>
                  <CardContent>
                    <Button onClick={() => handleAction(onCreateSheet, 'createSheet')}>
                      Create New Sheet
                    </Button>
                    <Label>View Sheet Data</Label>
                    <Input
                      placeholder="Spreadsheet ID"
                      value={spreadsheetId}
                      onChange={(e) => setSpreadsheetId(e.target.value)}
                    />
                    <Button onClick={() => handleAction(() => onGetSheetData(spreadsheetId), 'getSheetData')}>
                      Get Data
                    </Button>
                    <Label>Update Sheet</Label>
                    <Input
                      placeholder="Range (e.g., Sheet1!A1:B2)"
                      onChange={(e) => {
                        const values = [
                          ["Updated", "Data"],
                          ["Row 2", "Value 2"]
                        ];
                        handleAction(() => onUpdateSheetData(spreadsheetId, e.target.value, values), 'updateSheet');
                      }}
                    />
                  </CardContent>
                </ServiceCard>

                <ServiceCard>
                  <CardTitle iconColor={theme.yellow}>Docs</CardTitle>
                  <CardContent>
                    <Button onClick={() => handleAction(onCreateDocument, 'createDoc')}>
                      Create New Document
                    </Button>
                    <Label>Update Document</Label>
                    <Input
                    placeholder="Document ID"
                    value={documentId}
                    onChange={(e) => setDocumentId(e.target.value)}
                  />
                  <TextArea
                    placeholder="Document Content"
                    value={documentContent}
                    onChange={(e) => setDocumentContent(e.target.value)}
                  />
                  <Button onClick={() => handleAction(() => onUpdateDocument(documentId, documentContent), 'updateDoc')}>
                    Update Document
                  </Button>
                </CardContent>
              </ServiceCard>

              <ServiceCard>
                <CardTitle iconColor={theme.gray}>Forms</CardTitle>
                <CardContent>
                  <Button onClick={() => handleAction(onCreateForm, 'createForm')}>
                    Create New Form
                  </Button>
                  <Label>Add Questions</Label>
                  <Input
                    placeholder="Form ID"
                    value={formId}
                    onChange={(e) => setFormId(e.target.value)}
                  />
                  <TextArea
                    placeholder="Questions (JSON format)"
                    value={JSON.stringify(formQuestions, null, 2)}
                    onChange={(e) => {
                      try {
                        setFormQuestions(JSON.parse(e.target.value));
                      } catch (error) {
                        console.error('Invalid JSON format');
                      }
                    }}
                  />
                  <Button onClick={() => handleAction(() => onAddFormQuestions(formId, formQuestions), 'addQuestions')}>
                    Add Questions
                  </Button>
                </CardContent>
              </ServiceCard>
            </ServicesGrid>
          )}
        </CardContent>
      </ServiceCard>
    )}
  </GoogleServicesContainer>
);
};

export default GoogleServices;

