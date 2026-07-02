import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function LoginSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    (async () => {
      await fetch('/auth/user', { credentials: 'include' });
      const from = location.state?.from?.pathname ?? '/app';
      navigate(from, { replace: true });
    })();
  }, [location.state, navigate]);

  return <div style={{ padding: 24 }}>Signing you in…</div>;
}
