const converter_app_url = process.env.CONVERTER_APP_URL

class ConverterApi {

  static deleteProfile (identifier) {

    const requestOptions = {
      method: 'DELETE'
    }

    return fetch(converter_app_url + '/profiles/' + identifier, requestOptions)
      .then(response => {
        if (!response.ok) { throw response }
          return response
      })
  }

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

  static createProfile(data) {
    const requestOptions = {
      method: 'POST',
      body: JSON.stringify(data),
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
          throw new Error(json.error)
        }
      })
  }

  static updateProfile(data, identifier) {
    const requestOptions = {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    }

    let ok
    return fetch(converter_app_url + '/profiles/' + identifier, requestOptions)
      .then(response => {
        ok = response.ok
        return response.json()
      })
      .then(data => {
        if (ok) {
          return data
        } else {
          throw new Error(error)
        }
      })
  }

  static fetchConversion(file) {
    const data = new FormData()
    data.append('file', file)

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
}

export default ConverterApi
