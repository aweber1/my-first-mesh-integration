import {
  Callout,
  CmsEntrySearch,
  LoadingIndicator,
  useUniformMeshLocation,
} from '@uniformdev/mesh-sdk-react';
import { useAsync, useAsyncFn, useMountedState } from 'react-use';
import { format as timeAgo } from 'timeago.js';
import BadgeIcon from '../public/initech-badge-icon.png';
import { InitechClient } from '../lib/InitechClient';

export default function InitechCmsCanvasParameterEditor() {
  const { value, setValue, metadata } = useUniformMeshLocation();

  const allowedContentTypes = metadata.parameterConfiguration?.allowedContentTypes;
  const settings = metadata.settings;

  return (
    <ContentEntrySearch
      value={value}
      setValue={setValue}
      allowedContentTypes={allowedContentTypes}
      settings={settings}
    />
  );
}

function ContentEntrySearch({ allowedContentTypes, settings, value, setValue }) {
  const isMounted = useMountedState();

  const {
    loading: filteredContentTypesLoading,
    error: filteredContentTypesError,
    value: filteredContentTypes,
  } = useFilteredContentTypes({ settings, allowedContentTypes });

  const [searchState, handleSearch] = useSearchContentEntries({
    contentTypes: filteredContentTypes,
    convertContentEntryToSearchResult: convertContentEntryToSearchResultFn,
    settings,
  });

  const { error: selectedContentEntriesError, selectedContentEntries } = useSelectedContentEntries({
    convertContentEntryToSearchResult: convertContentEntryToSearchResultFn,
    entryIds: value?.entryIds,
    settings,
    contentTypes: filteredContentTypes,
  });

  // Don't continue if the component was unmounted for some reason while search query was running.
  if (!isMounted()) {
    return null;
  }

  // map content type objects fetched from the API to content type objects used by the component search component.
  const contentTypeOptions = filteredContentTypes
    ? Object.values(filteredContentTypes)
        ?.filter((contentType) => Boolean(contentType))
        ?.map((contentType) => ({
          id: contentType.id.toString(),
          name: contentType.name,
        }))
    : undefined;

  const handleSelect = async (entryIds) => {
    await setValue({
      entryIds,
    });
  };

  if (searchState.error) {
    return <Callout type="error">{searchState.error.message}</Callout>;
  }

  if (selectedContentEntriesError) {
    return <Callout type="error">{selectedContentEntriesError.message}</Callout>;
  }

  if (filteredContentTypesError) {
    return <Callout type="error">{filteredContentTypesError.message}</Callout>;
  }

  if (filteredContentTypesLoading) {
    return <LoadingIndicator />;
  }

  return (
    <CmsEntrySearch
      contentTypes={contentTypeOptions}
      search={handleSearch}
      results={searchState.value}
      logoIcon={BadgeIcon.src}
      multiSelect={true}
      selectedItems={selectedContentEntries}
      select={handleSelect}
      requireContentType={true}
      onSort={handleSelect}
    />
  );
}

function convertContentEntryToSearchResultFn({ entry, selectedContentType, settings }) {
  return {
    id: entry.id.toString(),
    title: entry.name,
    metadata: {
      Type: selectedContentType?.name || 'Unknown',
      Updated: <span>{timeAgo(entry.lastModified)}</span>,
    },
    // NOTE: if the CMS you're integrating has direct linking capabilities for editing entries,
    // you can construct the URL for editing here. Otherwise, just omit the `editLink` property.
    editLink: `https://my-cms.com/project/${settings.projectId}/entries/${entry.id}`,
  };
}

function useSelectedContentEntries({ settings, entryIds, convertContentEntryToSearchResult, contentTypes }) {
  const { loading, error, value: contentEntries } = useGetContentEntriesById({ settings, entryIds });

  const resolveSelectedContentEntries = () => {
    if (!entryIds) {
      return;
    }

    if (loading) {
      return entryIds.map((entryId) => ({
        id: entryId,
        title: `Loading...`,
      }));
    } else if (contentEntries) {
      const results = entryIds.map((selectedContentEntryId) => {
        const entry = contentEntries.find((entry) => entry.id === selectedContentEntryId);
        if (entry) {
          const resolvedContentType = contentTypes ? contentTypes[entry.contentType.id] : undefined;
          return convertContentEntryToSearchResult({
            entry,
            selectedContentType: resolvedContentType,
            settings,
          });
        }
        return {
          id: selectedContentEntryId.toString(),
          title: `Unresolvable (${JSON.stringify(selectedContentEntryId)})`,
        };
      });
      return results;
    }

    return;
  };

  const selectedContentEntries = resolveSelectedContentEntries();

  return { selectedContentEntries, error };
}

function useGetContentEntriesById({ settings, entryIds }) {
  const { loading, error, value } = useAsync(async () => {
    if (!Array.isArray(entryIds) || entryIds.length === 0) {
      return;
    }

    const client = new InitechClient({
      apiKey: settings.apiKey,
    });

    const results = await client.getContentEntries({
      entryIds,
    });

    return results;
  }, [
    settings.apiKey,
    // create a string value of the entryIds so that the hook dependency check is accurate.
    // otherwise, the dependency check is referential only, so if the entryId array is "new" in between
    // calls the hook will always run (which we're trying to avoid).
    entryIds?.join(','),
  ]);

  return { loading, error, value };
}

function useSearchContentEntries({ contentTypes, settings, convertContentEntryToSearchResult }) {
  // `useAsyncFn` instead of `useAsync` so that we can control when
  // the `search` function is invoked (and do something meaningful afterwards).
  return useAsyncFn(
    async (text, options) => {
      // We require a contentType selection for searching otherwise the results list could be stupid long.
      if (!contentTypes || !options?.contentType) {
        return;
      }

      const selectedContentType = Object.values(contentTypes).find(
        (contentType) => contentType?.id.toString() === options.contentType
      );

      // If the selected contentType somehow doesn't map to an allowed contentType we are in a bad state.
      if (!selectedContentType) {
        return;
      }

      const client = new InitechClient({
        apiKey: settings.apiKey,
      });

      const results = await client.searchContentEntries({
        contentTypeId: [selectedContentType.id],
        searchText: text,
      });

      if (results) {
        const mappedResults = results.map((entry) =>
          convertContentEntryToSearchResult({
            entry,
            selectedContentType,
            settings,
          })
        );
        return mappedResults;
      }
      return undefined;
    },
    [contentTypes, settings, convertContentEntryToSearchResult]
  );
}

/** This hook fetches all content types from the API and filters them based on the `allowedContentTypes` provided. */
function useFilteredContentTypes({ settings, allowedContentTypes }) {
  const client = new InitechClient({
    apiKey: settings.apiKey,
  });

  return useAsync(async () => {
    const contentTypes = await client.getContentTypes();

    const filteredContentTypes = {};
    contentTypes.forEach((contentType) => {
      if (allowedContentTypes[contentType.id]) {
        filteredContentTypes[contentType.id] = {
          id: contentType.id,
          name: contentType.name,
        };
      }
    });

    return filteredContentTypes;
  });
}
