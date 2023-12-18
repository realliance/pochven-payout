import { onRedirect } from './oauth'
import { useContext, useEffect, useMemo } from 'react'
import { AuthContext } from './contexts/AuthContext';
import { GetStarted } from './pages/GetStarted';
import { Loading } from './components/Loading';
import { PayoutTool } from './pages/PayoutTool';

function App() {
  const { loading, token, updateToken } = useContext(AuthContext);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.get('code') !== null) {
      onRedirect(updateToken);
    }
  }, []);

  const page = useMemo(() => token ? <PayoutTool /> : <GetStarted />, [token]);

  const loadingComponent = useMemo(() => loading ? <Loading /> : page, [loading, page]);

  return (
    <div className="container mx-auto flex flex-col items-center justify-center h-screen gap-2">
      {loadingComponent}
    </div>
  )
}

export default App
