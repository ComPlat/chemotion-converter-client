class ConverterApi {

  constructor() {
    throw new Error('ConverterApi is a static singleton and cannot be instantiated.');
  }

  static converterUrl = process.env.CONVERTER_APP_URL;

  static setConverterUrl(url) {
    ConverterApi.converterUrl = url;
  }

  static getConverterUrl() {
    return ConverterApi.converterUrl;
  }

  static fetchProfiles(isAdmin) {
    const requestOptions = {
      method: 'GET'
    }

    return fetch(ConverterApi.getConverterUrl() + `/profiles?admin=${isAdmin ? 1 : 0}`, requestOptions)
      .then(response => {
        if (!response.ok) {
          throw response
        }
        return response.json()
      })
      .then(data => {
        return data
      })
  }

  static fetchRestoreProfiles({ hard, version, profileId }) {
    const requestOptions = {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ hard })
    }

    return fetch(`${ConverterApi.getConverterUrl()}/profiles/restore/${profileId}/${version}`, requestOptions)
      .then(response => {
        if (!response.ok) {
          throw response
        }
        return response.json()
      })
      .then(data => {
        return data
      })
  }

  static fetchTables(file, ontology) {
    const data = new FormData()
    data.append('file', file)
    data.append('ontology', ontology)

    const requestOptions = {
      method: 'POST',
      body: data
    }

    return fetch(ConverterApi.getConverterUrl() + '/tables', requestOptions)
      .then(response => {
        if (!response.ok) {
          throw response
        }
        return response.json()
      })
      .then(data => {
        return data
      })
  }

  static createProfile(profile) {
    const requestOptions = {
      method: 'POST',
      body: JSON.stringify(profile),
      headers: {
        'Content-Type': 'application/json'
      }
    }

    let ok
    return fetch(ConverterApi.getConverterUrl() + '/profiles', requestOptions)
      .then(response => {
        ok = response.ok
        return response.json()
      })
      .then(data => {
        if (ok) {
          return data
        } else {
          const error = new Error('A error occurred during processing.');
          // Attach the custom data object to the error instance
          error.data = data;
          throw error;
        }
      })
  }

  static updateProfile(profile) {
    const requestOptions = {
      method: 'PUT',
      body: JSON.stringify(profile),
      headers: {
        'Content-Type': 'application/json'
      }
    }

    let ok
    return fetch(ConverterApi.getConverterUrl() + '/profiles/' + profile.id, requestOptions)
      .then(response => {
        ok = response.ok
        return response.json()
      })
      .then(data => {
        if (ok) {
          return data
        } else {
          const error = new Error('A error occurred during processing.');
          // Attach the custom data object to the error instance
          error.data = data;
          throw error;
        }
      })
  }

  static deleteProfile(profile) {
    const requestOptions = {
      method: 'DELETE'
    }

    return fetch(ConverterApi.getConverterUrl() + '/profiles/' + profile.id, requestOptions)
      .then(response => {
        if (!response.ok) {
          throw response
        }
        return response
      })
  }

  static fetchConversion(file, format, asDownload = true) {
    const data = new FormData()
    data.append('file', file)
    data.append('format', format)

    const requestOptions = {
      method: 'POST',
      body: data
    }

    let fileName
    return fetch(ConverterApi.getConverterUrl() + '/conversions', requestOptions)
      .then(response => {
        if (!response.ok) {
          throw response
        }
        if (!asDownload) {
          return response;
        }
        fileName = response.headers.get('content-disposition')
          .split(';')
          .find(n => n.includes('filename='))
          .replace('filename=', '')
          .trim();
        return response.blob()
      })
      .then(blob => {
        if (!asDownload) {
          return blob;
        }
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName

        document.body.appendChild(a)
        a.click()
        a.remove()
        return 'success'
      })
  }

  static fetchDatasets() {

    const requestOptions = {
      method: 'GET'
    }

    return fetch(ConverterApi.getConverterUrl() + '/datasets', requestOptions)
      .then(response => {
        if (!response.ok) {
          throw response
        }
        return response.json()
      })
      .then(data => {
        return data
      })
  }

  static fetchDatasetsUnits() {

    const requestOptions = {
      method: 'GET'
    }

    return fetch(ConverterApi.getConverterUrl() + '/datasets_units', requestOptions)
      .then(response => {
        if (!response.ok) {
          throw response
        }
        return response.json()
      })
      .then(data => {
        return data
      })
  }

  static fetchOptions() {

    const requestOptions = {
      method: 'GET'
    }

    return fetch(ConverterApi.getConverterUrl() + '/options', requestOptions)
      .then(response => {
        if (!response.ok) {
          throw response
        }
        return response.json()
      })
      .then(data => {
        return data
      })
  }

}

export default ConverterApi
