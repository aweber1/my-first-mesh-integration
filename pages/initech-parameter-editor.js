import { useState } from 'react';
import { useUniformMeshLocation, Input, LoadingOverlay, Callout, Button } from '@uniformdev/mesh-sdk-react';

export default function InitechCanvasParameterEditor() {
  const { value, setValue, metadata } = useUniformMeshLocation();

  const handleImageChange = async (flairId, imageUrl) => {
    await setValue({
      ...value,
      [flairId]: imageUrl,
    });
  };

  const maxFlairCount = Number(metadata.parameterConfiguration?.maxFlairCount || 1);

  return new Array(maxFlairCount).fill('x').map((_, index) => {
    const flairId = index;
    return (
      <FlairMeme
        key={flairId}
        onImageChange={handleImageChange}
        imageUrl={value?.[flairId]}
        flairId={flairId}
      />
    );
  });
}

function FlairMeme({ flairId, imageUrl, onImageChange }) {
  const [numFlair, setNumFlair] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  const handleGenerateClick = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        `https://flair-meme-generator.netlify.app/.netlify/functions/generate-flair?numPieces=${
          numFlair || 37
        }`
      );

      const imgUrl = await response.text();
      onImageChange(flairId, imgUrl, numFlair);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setNumFlair(e.target.value);
  };

  return (
    <div className="relative space-y-4" style={{ minHeight: 300 }}>
      <LoadingOverlay isActive={loading} />
      <div className="flex items-center space-x-4">
        <Input
          name="minimumPiecesOfFlair"
          placeholder="Minimum pieces of flair required"
          label="Minimum pieces of flair required"
          onChange={handleInputChange}
          value={typeof numFlair !== 'undefined' ? numFlair : ''}
        />
        <Button type="button" buttonType="secondary" onClick={handleGenerateClick}>
          Generate
        </Button>
      </div>

      {imageUrl ? <img src={imageUrl} alt="Flair Meme" /> : null}
      {error ? <Callout type="error">{error.message}</Callout> : null}
    </div>
  );
}
