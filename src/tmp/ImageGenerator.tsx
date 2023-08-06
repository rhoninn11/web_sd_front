import React, { useState } from 'react';
import { useSocket } from './SocketProvider';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [translate, setTranslate] = useState(false);
  const { client } = useSocket();

  const handleGenerate = () => {
    client?.send(JSON.stringify({ prompt, negativePrompt, translate }));
  };

  return (
    <div>
      <input type="text" value={prompt} onChange={e => setPrompt(e.target.value)} />
      <input type="text" value={negativePrompt} onChange={e => setNegativePrompt(e.target.value)} />
      <input type="checkbox" checked={translate} onChange={e => setTranslate(e.target.checked)} />
      <button onClick={handleGenerate}>Generate</button>
    </div>
  );
};

export default ImageGenerator;
