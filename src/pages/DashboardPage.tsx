import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Dashboard is now integrated into Home
    navigate('/', { replace: true });
  }, [navigate]);

  return null;
};

export default DashboardPage;