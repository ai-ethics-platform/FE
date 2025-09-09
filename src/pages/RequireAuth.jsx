// // RequireAuth.jsx
// import { useLocation, Navigate } from 'react-router-dom';
// import { useAuth } from './auth'; // isAuthed 제공한다고 가정

// export default function RequireAuth({ children }) {
//   const { isAuthed } = useAuth();
//   const location = useLocation();

//   if (!isAuthed) {
//     const next = location.pathname + location.search;
//     return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />;
//   }
//   return children;
// }
