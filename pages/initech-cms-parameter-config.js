import { Callout, LoadingIndicator, useUniformMeshLocation, Icons } from '@uniformdev/mesh-sdk-react';
import { useAsync } from 'react-use';
import { InitechClient } from '../lib/InitechClient.js';

export default function InitechCmsCanvasParameterConfig() {
  const { value: config, setValue: setConfig, metadata } = useUniformMeshLocation();

  const settings = metadata.settings;

  const handleAllowedContentTypesSetValue = async (allowedContentTypes) => {
    await setConfig({ ...config, allowedContentTypes });
  };

  return (
    <>
      {!settings?.apiKey ? (
        <Callout type="error">
          It appears the Initech integration is not configured. Please visit the &quot;Settings &gt;
          Initech&quot; page to provide information for connecting to Initech.
        </Callout>
      ) : (
        <ContentTypeSelector
          settings={settings}
          setValue={handleAllowedContentTypesSetValue}
          value={config?.allowedContentTypes}
        />
      )}
    </>
  );
}

function ContentTypeSelector({ settings, value, setValue }) {
  const {
    loading,
    error,
    value: contentTypes,
  } = useAsync(async () => {
    const client = new InitechClient({
      apiKey: settings.apiKey,
    });

    const result = await client.getContentTypes();

    return result;
  }, [settings.apiKey]);

  const handleContentTypeSelect = async (contentType) => {
    // If the clicked contentType id already exists in the provided state value,
    // set the contentType id value to 'undefined' in the stored object.
    // This makes updating the state value less complex.
    // note: In order to avoid mutating `value`, spread the existing `value` (if defined) into a new object.
    const allowedContentTypes = {
      ...(value || {}),
    };
    allowedContentTypes[contentType.id] = allowedContentTypes[contentType.id]
      ? undefined
      : { id: contentType.id, name: contentType.name };

    await setValue(allowedContentTypes);
  };

  return (
    <div className="relative">
      <label className="uniform-input-label">Allowed ContentTypes</label>
      {loading ? <LoadingIndicator /> : null}
      {Array.isArray(contentTypes) ? (
        <div
          className="overflow-y-auto p-2 bg-gray-100 border-t border-b border-gray-300 space-y-2 max-h-96"
          data-test-id="content-type-selector"
        >
          {contentTypes.length === 0 ? (
            <Callout type="caution">No content types were found for project {settings.projectId}</Callout>
          ) : (
            contentTypes.map((contentType, index) => {
              const active = Boolean(value ? value[contentType.id] : false);
              return (
                <div
                  key={index}
                  className={`flex items-center space-x-2 p-3 bg-white border-2 rounded-md shadow-md ${
                    active ? 'border-green-500' : 'border-gray-300'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleContentTypeSelect(contentType)}
                    className="flex items-center justify-between w-full outline-none focus:outline-none"
                  >
                    <span>{contentType.name}</span>
                    {active ? <Icons.Checkmark className="block h-6 w-6 text-green-500" /> : null}
                  </button>
                </div>
              );
            })
          )}
        </div>
      ) : null}
      {error ? <Callout type="error">{error.message}</Callout> : null}
    </div>
  );
}
