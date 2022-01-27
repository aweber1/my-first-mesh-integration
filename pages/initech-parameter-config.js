import { useUniformMeshLocation } from '@uniformdev/mesh-sdk-react';

export default function InitechCanvasParameterConfig() {
  const { value: config, setValue: setConfig } = useUniformMeshLocation();

  const handleInputChange = async (e) => {
    await setConfig({
      maxFlairCount: e.target.value,
    });
  };

  return (
    <div className="relative">
      <label className="uniform-input-label">Maximum Flair Memes</label>
      <select
        className="uniform-input uniform-input-select"
        name="maxFlairCount"
        onChange={handleInputChange}
        defaultValue={config?.maxFlairCount}
      >
        <option value="">Please choose</option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
      </select>
    </div>
  );
}
