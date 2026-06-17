import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import './index.css';
import { AppShell } from '@/components/AppShell';
import { SessionScreen } from '@/screens/SessionScreen';
import { ProblemFramingScreen } from '@/screens/ProblemFramingScreen';
import { SystemsWorkspaceScreen } from '@/screens/SystemsWorkspaceScreen';
import { DecisionJournalScreen } from '@/screens/DecisionJournalScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <SessionScreen /> },
      { path: 'framing', element: <ProblemFramingScreen /> },
      { path: 'systems', element: <SystemsWorkspaceScreen /> },
      { path: 'decisions', element: <DecisionJournalScreen /> },
      { path: 'settings', element: <SettingsScreen /> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
