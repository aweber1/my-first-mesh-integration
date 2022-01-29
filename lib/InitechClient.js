export class InitechClient {
  constructor({ apiKey }) {
    this.apiKey = apiKey;
    this.apiHost = 'https://initech-mesh-services.netlify.app';
  }

  async getContentTypes() {
    const url = `${this.apiHost}/.netlify/functions/get-content-types?apiKey=${this.apiKey}`;

    const res = await fetch(url);
    if (!res.ok) {
      const msg = await res.text();
      throw new Error(`Error fetching '${url}': ${msg}`);
    }
    return await res.json();
  }

  async searchContentEntries({ searchText, contentTypeId }) {
    const url = `${this.apiHost}/.netlify/functions/search-content-entries?apiKey=${this.apiKey}&searchText=${searchText}&contentTypeId=${contentTypeId}`;

    const res = await fetch(url);
    if (!res.ok) {
      const msg = await res.text();
      throw new Error(`Error fetching '${url}': ${msg}`);
    }
    return await res.json();
  }

  async getContentEntries({ entryIds }) {
    const url = `${this.apiHost}/.netlify/functions/get-content-entries?apiKey=${
      this.apiKey
    }&entryIds=${entryIds.join(',')}`;

    const res = await fetch(url);
    if (!res.ok) {
      const msg = await res.text();
      throw new Error(`Error fetching '${url}': ${msg}`);
    }
    return await res.json();
  }
}
