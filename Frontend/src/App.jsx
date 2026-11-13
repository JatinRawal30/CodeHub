import { lazy, Suspense, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Routes, Route, Navigate } from 'react-router';
import { checkAuth } from './store/slices/authSlice';
import Login from './pages/login';
import Signup from './pages/signup';
import ForgotPassword from './pages/forgotPassword';
import Homepage from './pages/homepage';
import ProfilePage from './pages/profile';

// Lazy-loaded so the editor libraries are only downloaded when a problem is opened
const ProblemPage = lazy(() => import('./pages/problem'));
const AdminPage = lazy(() => import('./pages/admin'));
const AdminProblemPage = lazy(() => import('./pages/adminProblem'));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas">
      <span className="spinner w-6 h-6 text-primary" role="status" aria-label="Loading" />
    </div>
  );
}

function App () {
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading, user }= useSelector((state) => state.auth);
  // the UI gate only; the API checks the admin role on every admin request
  const isAdmin = isAuthenticated && user?.role === 'admin';
  const adminOnly = (page) =>
    isAdmin ? <Suspense fallback={<PageLoader />}>{page}</Suspense> : <Navigate to={isAuthenticated ? "/" : "/login"} />;
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <Routes>
      <Route path="/" element= { isAuthenticated ? <Homepage /> : <Navigate to = "/login" /> }  />
      <Route
        path="/problems/:problemId"
        element={
          isAuthenticated ? (
            <Suspense fallback={<PageLoader />}>
              <ProblemPage />
            </Suspense>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route path="/u/:username" element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />} />
      <Route path="/admin" element={adminOnly(<AdminPage />)} />
      <Route path="/admin/problems/new" element={adminOnly(<AdminProblemPage />)} />
      <Route path="/admin/problems/:problemId" element={adminOnly(<AdminProblemPage />)} />
      <Route path="/login" element={ isAuthenticated ? <Navigate to = "/" /> :<Login />} />
      <Route path="/signup" element={ isAuthenticated ? <Navigate to ="/"/> : <Signup />} />
      <Route path="/forgot-password" element={isAuthenticated ? <Navigate to="/" /> : <ForgotPassword />} />
    </Routes>
  );
}

export default App
