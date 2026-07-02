import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { AuthProvider } from './hooks/auth/AuthContextProvider';
import { ProtectedRoute } from './auth/ProtectedRoute';
import LoginSuccess from './pages/LoginSuccess';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { CreatePath } from './pages/CreatePath';
import { Path } from './pages/Path';
import { WatchHistory } from './pages/WatchHistory';

export const App = (): React.ReactElement => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/app" element={<Dashboard />} />
            <Route path="/app/create-path" element={<CreatePath />} />
            <Route path="/app/paths/:pathId" element={<Path />} />
            <Route path="/app/watch-history" element={<WatchHistory />} />
          </Route>

          <Route path="/" element={<Home />} />
          <Route path="/login-success" element={<LoginSuccess />} />
          <Route path="*" element={<div>404</div>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
