import { Button } from 'flowbite-react'
import { beginAuthFlow, onRedirect } from './oauth'
import { useContext, useEffect } from 'react'
import { AuthContext } from './contexts/AuthContext';

function App() {
  const { token, updateToken } = useContext(AuthContext);
  console.log(token);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.get('code') !== null) {
      onRedirect(updateToken);
    }
  }, []);

  return (
    <>
      <div>Pochven Payout</div>
      <Button outline gradientDuoTone="redToYellow" onClick={() => beginAuthFlow()}>Button</Button>
    </>
  )
}

export default App
