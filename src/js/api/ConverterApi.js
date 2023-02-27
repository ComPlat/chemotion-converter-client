const converter_app_url = process.env.CONVERTER_APP_URL

class ConverterApi {

  static fetchProfiles () {
    const requestOptions = {
      method: 'GET'
    }

    return fetch(converter_app_url + '/profiles', requestOptions)
      .then(response => {
        if (!response.ok) { throw response }
        return response.json()
      })
      .then(data => {
        return data
      })
  }

  static fetchReader () {
    const requestOptions = {
      method: 'GET'
    }

    return fetch(converter_app_url + '/reader', requestOptions)
      .then(response => {
        if (!response.ok) { throw response }
        return response.json()
      })
      .then(data => {
        return data
      })
  }

  static fetchTables(file) {
    const data = new FormData()
    data.append('file', file)

    const requestOptions = {
      method: 'POST',
      body: data
    }

    return fetch(converter_app_url + '/tables', requestOptions)
      .then(response => {
        if (!response.ok) { throw response }
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
    return fetch(converter_app_url + '/profiles', requestOptions)
      .then(response => {
        ok = response.ok
        return response.json()
      })
      .then(data => {
        if (ok) {
          return data
        } else {
          throw data
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
    return fetch(converter_app_url + '/profiles/' + profile.id, requestOptions)
      .then(response => {
        ok = response.ok
        return response.json()
      })
      .then(data => {
        if (ok) {
          return data
        } else {
          throw new Error(data)
        }
      })
  }

  static updateReader(reader) {
    const requestOptions = {
      method: 'PUT',
      body: JSON.stringify(reader),
      headers: {
        'Content-Type': 'application/json'
      }
    }

    let ok
    return fetch(converter_app_url + '/readers/' + reader.id, requestOptions)
      .then(response => {
        ok = response.ok
        return response.json()
      })
      .then(data => {
        if (ok) {
          return data
        } else {
          throw new Error(data)
        }
      })
  }


  static createReader(profile) {
    const requestOptions = {
      method: 'POST',
      body: JSON.stringify(profile),
      headers: {
        'Content-Type': 'application/json'
      }
    }

    let ok
    return fetch(converter_app_url + '/reader', requestOptions)
      .then(response => {
        ok = response.ok
        return response.json()
      })
      .then(data => {
        if (ok) {
          return data
        } else {
          throw new Error(data)
        }
      })
  }

  static deleteProfile (profile) {
    const requestOptions = {
      method: 'DELETE'
    }

    return fetch(converter_app_url + '/profiles/' + profile.id, requestOptions)
      .then(response => {
        if (!response.ok) { throw response }
          return response
      })
  }

  static deleteProfile (profile) {
    const requestOptions = {
      method: 'DELETE'
    }

    return fetch(converter_app_url + '/profiles/' + profile.id, requestOptions)
      .then(response => {
        if (!response.ok) { throw response }
          return response
      })
  }

  static deleteReader (reader) {
    const requestOptions = {
      method: 'DELETE'
    }

    return fetch(converter_app_url + '/readers/' + reader.id, requestOptions)
      .then(response => {
        if (!response.ok) { throw response }
          return response
      })
  }

  static fetchConversion(file, format) {
    const data = new FormData()
    data.append('file', file)
    data.append('format', format)

    const requestOptions = {
      method: 'POST',
      body: data
    }

    let fileName
    return fetch(converter_app_url + '/conversions', requestOptions)
      .then(response => {
        if (!response.ok) {
          throw response
        }
        fileName = response.headers.get('content-disposition')
          .split(';')
          .find(n => n.includes('filename='))
          .replace('filename=', '')
          .trim();
        return response.blob()
      })
      .then(blob => {
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

  static fetchDatasets () {

    const requestOptions = {
      method: 'GET'
    }

    return fetch(converter_app_url + '/datasets', requestOptions)
      .then(response => {
        if (!response.ok) { throw response }
        return response.json()
      })
      .then(data => {
        return data
      })
  }

  static fetchOptions () {

    const requestOptions = {
      method: 'GET'
    }

    return fetch(converter_app_url + '/options', requestOptions)
      .then(response => {
        if (!response.ok) { throw response }
        return response.json()
      })
      .then(data => {
        return data
      })
  }

}

export default ConverterApi
